import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { CAPTURE_PROFILES, DEFAULT_CAPTURE_PROFILE_ID } from '@/lib/audio/captureProfiles';
import { prepareAudioFrame } from '@/lib/audio/frameAnalysis';
import { createMicrophoneController } from '@/lib/audio/microphone';
import { autoCorrelate } from '@/lib/pitch/autocorrelate';
import {
  centsOffFromPitch,
  createDetectedNote,
  getNearestGuitarString
} from '@/lib/music/notes';
import {
  loadTunerPreferences,
  saveTunerPreferences
} from '@/lib/storage/tunerPreferences';
import {
  DEFAULT_SMOOTHING,
  FFT_BUFFER_SIZE,
  HOLD_DETECTION_CONFIDENCE,
  MAX_DETECTION_FREQUENCY,
  MIN_DETECTION_CONFIDENCE,
  MIN_DETECTION_FREQUENCY,
  NO_SIGNAL_FRAME_LIMIT,
  NOTE_SWITCH_FRAME_THRESHOLD,
  READING_HOLD_MS,
  SMOOTHED_FREQUENCY_DECAY,
  SMOOTHED_FREQUENCY_RELEASE_MS,
  STRING_SWITCH_FRAME_THRESHOLD
} from '@/shared/constants/audio';
import {
  DEFAULT_TARGET_STRING_ID,
  GUITAR_STRING_MAP,
  THIN_GUITAR_STRING_IDS,
  THIN_STRING_DETECTION_WINDOWS
} from '@/shared/constants/tuner';
import { translations } from '@/lib/i18n/translations';
import type { Locale } from '@/shared/types/i18n';
import type { CaptureProfileId } from '@/shared/types/audio';
import type {
  DetectedNote,
  GuitarStringId,
  TunerHookResult,
  TunerMode,
  TunerSnapshot,
  TunerStatus
} from '@/shared/types/tuner';

type TunerErrorKey =
  | 'microphoneUnavailable'
  | 'browserUnsupported'
  | 'permissionDenied'
  | 'microphoneNotFound'
  | 'microphoneBusy'
  | 'microphoneUnsupportedSettings'
  | 'microphoneAccessFailed'
  | null;

const microphone = createMicrophoneController({
  fftSize: FFT_BUFFER_SIZE,
  smoothingTimeConstant: 0.82
});

function buildInitialSnapshot(manualStringId: GuitarStringId): TunerSnapshot {
  const baseTarget = GUITAR_STRING_MAP[manualStringId];

  return {
    frequency: null,
    note: null,
    cents: null,
    targetNote: baseTarget,
    targetString: baseTarget,
    signalLevel: 0,
    confidence: 0
  };
}

export function useTuner(locale: Locale): TunerHookResult {
  const preferences = loadTunerPreferences();
  const initialMode = preferences.mode ?? 'auto';
  const initialStringId = preferences.targetStringId ?? DEFAULT_TARGET_STRING_ID;
  const initialCaptureProfileId = preferences.captureProfileId ?? DEFAULT_CAPTURE_PROFILE_ID;
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [mode, setMode] = useState<TunerMode>(initialMode);
  const [manualStringId, setManualStringId] = useState<GuitarStringId>(initialStringId);
  const [captureProfileId, setCaptureProfileId] =
    useState<CaptureProfileId>(initialCaptureProfileId);
  const [snapshot, setSnapshot] = useState<TunerSnapshot>(
    buildInitialSnapshot(initialStringId),
  );
  const [errorKey, setErrorKey] = useState<TunerErrorKey>(null);
  const animationFrameId = useRef<number | null>(null);
  const smoothedFrequency = useRef<number | null>(null);
  const weakSignalFrames = useRef(0);
  const lockedNote = useRef<DetectedNote | null>(null);
  const pendingNoteLabel = useRef<string | null>(null);
  const pendingNoteFrames = useRef(0);
  const lockedAutoStringId = useRef<GuitarStringId | null>(null);
  const pendingAutoStringId = useRef<GuitarStringId | null>(null);
  const pendingAutoStringFrames = useRef(0);
  const lastValidSnapshot = useRef<TunerSnapshot>(buildInitialSnapshot(initialStringId));
  const lastValidTimestamp = useRef<number | null>(null);
  const consecutiveGoodFrames = useRef(0);
  const consecutiveBadFrames = useRef(0);
  const captureProfile = CAPTURE_PROFILES[captureProfileId];

  useEffect(() => {
    saveTunerPreferences({
      mode,
      targetStringId: manualStringId,
      captureProfileId,
    });
  }, [captureProfileId, manualStringId, mode]);

  useEffect(() => {
    consecutiveGoodFrames.current = 0;
    consecutiveBadFrames.current = 0;
    weakSignalFrames.current = 0;
  }, [captureProfileId]);

  useEffect(() => {
    setSnapshot((current) => ({
      ...current,
      targetNote: GUITAR_STRING_MAP[manualStringId],
      targetString: mode === 'manual' ? GUITAR_STRING_MAP[manualStringId] : current.targetString
    }));
  }, [manualStringId, mode]);

  useEffect(() => {
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      microphone.stop();
    };
  }, []);

  const stop = () => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    microphone.stop();
    smoothedFrequency.current = null;
    weakSignalFrames.current = 0;
    lockedNote.current = null;
    pendingNoteLabel.current = null;
    pendingNoteFrames.current = 0;
    lockedAutoStringId.current = null;
    pendingAutoStringId.current = null;
    pendingAutoStringFrames.current = 0;
    lastValidTimestamp.current = null;
    lastValidSnapshot.current = buildInitialSnapshot(manualStringId);
    consecutiveGoodFrames.current = 0;
    consecutiveBadFrames.current = 0;
    setStatus('idle');
    setSnapshot((current) => ({
      ...current,
      frequency: null,
      note: null,
      cents: null,
      signalLevel: 0,
      confidence: 0,
      targetNote: GUITAR_STRING_MAP[manualStringId],
      targetString: mode === 'manual' ? GUITAR_STRING_MAP[manualStringId] : current.targetString
    }));
  };

  const updateFrame = () => {
    const analysis = microphone.read();
    const now = performance.now();

    if (!analysis) {
      setStatus('error');
      setErrorKey('microphoneUnavailable');
      return;
    }

    const hasRecentReading =
      lastValidTimestamp.current !== null && now - lastValidTimestamp.current <= READING_HOLD_MS;
    const hasLogicalRetention =
      lastValidTimestamp.current !== null &&
      now - lastValidTimestamp.current <= SMOOTHED_FREQUENCY_RELEASE_MS;
    const minimumSignalLevel = hasRecentReading
      ? captureProfile.holdRms
      : captureProfile.entryRms;
    const preparedFrame = prepareAudioFrame(analysis.buffer, captureProfile);
    const signalLevel = preparedFrame.quality.rms;
    const detectionHints = resolveDetectionHints(
      mode,
      manualStringId,
      smoothedFrequency.current,
      lastValidSnapshot.current.targetString?.id ?? null,
    );

    if (
      signalLevel < minimumSignalLevel ||
      preparedFrame.quality.hasClipping ||
      !preparedFrame.quality.hasMinimumSignal
    ) {
      weakSignalFrames.current += 1;
      consecutiveBadFrames.current += 1;
      consecutiveGoodFrames.current = 0;
      retainSmoothedFrequency(smoothedFrequency, lastValidSnapshot.current.frequency);

      if (
        weakSignalFrames.current >= NO_SIGNAL_FRAME_LIMIT ||
        consecutiveBadFrames.current >= captureProfile.maxBadFrames
      ) {
        if (hasRecentReading) {
          setStatus('no-signal');
          setSnapshot(buildHeldSnapshot(lastValidSnapshot.current, smoothedFrequency.current));
        } else if (hasLogicalRetention) {
          setStatus('detecting');
          setSnapshot(buildHeldSnapshot(lastValidSnapshot.current, smoothedFrequency.current));
        } else {
          lockedNote.current = null;
          pendingNoteLabel.current = null;
          pendingNoteFrames.current = 0;
          lockedAutoStringId.current = null;
          pendingAutoStringId.current = null;
          pendingAutoStringFrames.current = 0;
          smoothedFrequency.current = null;
          setStatus('no-signal');
          setSnapshot((current) => ({
            ...current,
            frequency: null,
            note: null,
            cents: null,
            signalLevel: 0,
            confidence: 0
          }));
        }
      }

      animationFrameId.current = requestAnimationFrame(updateFrame);
      return;
    }

    weakSignalFrames.current = 0;

    const detection = autoCorrelate(preparedFrame.buffer, analysis.sampleRate, {
      captureProfile,
      frameQuality: preparedFrame.quality,
      previousFrequency: lastValidSnapshot.current.frequency,
      searchMinFrequency: detectionHints.minFrequency,
      searchMaxFrequency: detectionHints.maxFrequency,
      confidenceBias: detectionHints.confidenceBias,
      expectedFrequency: detectionHints.expectedFrequency,
      expectedToleranceRatio: detectionHints.expectedToleranceRatio,
      expectedBonus: detectionHints.expectedBonus,
    });
    const minimumConfidence = hasRecentReading
      ? HOLD_DETECTION_CONFIDENCE
      : MIN_DETECTION_CONFIDENCE;

    if (
      detection === null ||
      detection.confidence < minimumConfidence ||
      detection.frequency < MIN_DETECTION_FREQUENCY ||
      detection.frequency > MAX_DETECTION_FREQUENCY
    ) {
      consecutiveBadFrames.current += 1;
      consecutiveGoodFrames.current = 0;
      retainSmoothedFrequency(smoothedFrequency, lastValidSnapshot.current.frequency);
      if (hasRecentReading) {
        setStatus('detecting');
        setSnapshot(buildHeldSnapshot(lastValidSnapshot.current, smoothedFrequency.current));
      } else if (hasLogicalRetention) {
        setStatus('detecting');
        setSnapshot(buildHeldSnapshot(lastValidSnapshot.current, smoothedFrequency.current));
      } else {
        smoothedFrequency.current = null;
        setStatus('detecting');
        setSnapshot((current) => ({
          ...current,
          frequency: null,
          note: null,
          cents: null,
          signalLevel,
          confidence: detection?.confidence ?? 0
        }));
      }
      animationFrameId.current = requestAnimationFrame(updateFrame);
      return;
    }

    consecutiveBadFrames.current = 0;
    consecutiveGoodFrames.current += 1;

    if (!hasRecentReading && consecutiveGoodFrames.current < captureProfile.minGoodFrames) {
      setStatus('detecting');
      animationFrameId.current = requestAnimationFrame(updateFrame);
      return;
    }

    const detectedFrequency = detection.frequency;
    const smoothing = getAdaptiveSmoothing(detection.confidence);
    const nextFrequency =
      smoothedFrequency.current === null
        ? detectedFrequency
        : smoothedFrequency.current * smoothing + detectedFrequency * (1 - smoothing);

    smoothedFrequency.current = nextFrequency;

    const note = getStableNote(
      createDetectedNote(nextFrequency),
      detection.confidence,
      lockedNote,
      pendingNoteLabel,
      pendingNoteFrames,
    );
    const targetString =
      mode === 'manual'
        ? GUITAR_STRING_MAP[manualStringId]
        : getStableAutoString(
            nextFrequency,
            lockedAutoStringId,
            pendingAutoStringId,
            pendingAutoStringFrames,
          );

    const nextSnapshot = {
      frequency: nextFrequency,
      note,
      cents: centsOffFromPitch(nextFrequency, targetString.frequency),
      targetNote: targetString,
      targetString,
      signalLevel,
      confidence: detection.confidence
    };

    lastValidSnapshot.current = nextSnapshot;
    lastValidTimestamp.current = now;
    setStatus('listening');
    setErrorKey(null);
    setSnapshot(nextSnapshot);
    animationFrameId.current = requestAnimationFrame(updateFrame);
  };

  const start = async () => {
    setErrorKey(null);
    setStatus('requesting-permission');

    try {
      await microphone.start();
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(updateFrame);
    } catch (caughtError) {
      setErrorKey(getMicrophoneErrorKey(caughtError));
      setStatus('error');
    }
  };

  const error = errorKey === null ? null : translations[locale].errors[errorKey];

  const setTargetString = (value: GuitarStringId | null) => {
    if (value === null) {
      setMode('auto');
      return;
    }

    setManualStringId(value);
    setMode('manual');
    setSnapshot((current) => ({
      ...current,
      targetNote: GUITAR_STRING_MAP[value],
      targetString: GUITAR_STRING_MAP[value]
    }));
  };

  return {
    status,
    mode,
    captureProfileId,
    frequency: snapshot.frequency,
    note: snapshot.note,
    cents: snapshot.cents,
    targetNote: snapshot.targetNote,
    targetString: snapshot.targetString,
    signalLevel: snapshot.signalLevel,
    confidence: snapshot.confidence,
    error,
    start,
    stop,
    setCaptureProfile: setCaptureProfileId,
    setTargetString,
    setMode
  };
}

function getAdaptiveSmoothing(confidence: number) {
  const normalizedConfidence = Math.max(0, Math.min(1, confidence));
  const extraSmoothing = (1 - normalizedConfidence) * 0.06;
  return Math.min(0.94, DEFAULT_SMOOTHING + extraSmoothing);
}

function getStableNote(
  candidate: DetectedNote,
  confidence: number,
  lockedNote: MutableRefObject<DetectedNote | null>,
  pendingNoteLabel: MutableRefObject<string | null>,
  pendingNoteFrames: MutableRefObject<number>,
) {
  if (lockedNote.current === null) {
    lockedNote.current = candidate;
    return candidate;
  }

  if (candidate.label === lockedNote.current.label) {
    lockedNote.current = candidate;
    pendingNoteLabel.current = null;
    pendingNoteFrames.current = 0;
    return candidate;
  }

  if (pendingNoteLabel.current !== candidate.label) {
    pendingNoteLabel.current = candidate.label;
    pendingNoteFrames.current = 1;
  } else {
    pendingNoteFrames.current += 1;
  }

  const requiredFrames =
    confidence > 0.94 ? NOTE_SWITCH_FRAME_THRESHOLD : NOTE_SWITCH_FRAME_THRESHOLD + 2;

  if (pendingNoteFrames.current >= requiredFrames) {
    lockedNote.current = candidate;
    pendingNoteLabel.current = null;
    pendingNoteFrames.current = 0;
    return candidate;
  }

  return lockedNote.current;
}

function getStableAutoString(
  frequency: number,
  lockedAutoStringId: MutableRefObject<GuitarStringId | null>,
  pendingAutoStringId: MutableRefObject<GuitarStringId | null>,
  pendingAutoStringFrames: MutableRefObject<number>,
) {
  const candidate = getNearestGuitarString(frequency);

  if (lockedAutoStringId.current === null) {
    lockedAutoStringId.current = candidate.id;
    return candidate;
  }

  if (candidate.id === lockedAutoStringId.current) {
    pendingAutoStringId.current = null;
    pendingAutoStringFrames.current = 0;
    return GUITAR_STRING_MAP[lockedAutoStringId.current];
  }

  if (pendingAutoStringId.current !== candidate.id) {
    pendingAutoStringId.current = candidate.id;
    pendingAutoStringFrames.current = 1;
  } else {
    pendingAutoStringFrames.current += 1;
  }

  if (pendingAutoStringFrames.current >= STRING_SWITCH_FRAME_THRESHOLD) {
    lockedAutoStringId.current = candidate.id;
    pendingAutoStringId.current = null;
    pendingAutoStringFrames.current = 0;
  }

  return GUITAR_STRING_MAP[lockedAutoStringId.current];
}

function getMicrophoneErrorKey(caughtError: unknown): Exclude<TunerErrorKey, null> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'browserUnsupported';
  }

  if (caughtError instanceof DOMException) {
    switch (caughtError.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'permissionDenied';
      case 'NotFoundError':
        return 'microphoneNotFound';
      case 'NotReadableError':
      case 'AbortError':
        return 'microphoneBusy';
      case 'OverconstrainedError':
        return 'microphoneUnsupportedSettings';
      default:
        return 'microphoneAccessFailed';
    }
  }

  return 'microphoneAccessFailed';
}

function buildHeldSnapshot(snapshot: TunerSnapshot, retainedFrequency: number | null): TunerSnapshot {
  if (snapshot.frequency === null || retainedFrequency === null) {
    return snapshot;
  }

  const targetString = snapshot.targetString;

  return {
    ...snapshot,
    frequency: retainedFrequency,
    cents:
      targetString === null
        ? snapshot.cents
        : centsOffFromPitch(retainedFrequency, targetString.frequency),
    signalLevel: 0,
    confidence: 0,
  };
}

function retainSmoothedFrequency(
  smoothedFrequency: MutableRefObject<number | null>,
  lastValidFrequency: number | null,
) {
  if (smoothedFrequency.current === null || lastValidFrequency === null) {
    return;
  }

  smoothedFrequency.current =
    smoothedFrequency.current * SMOOTHED_FREQUENCY_DECAY +
    lastValidFrequency * (1 - SMOOTHED_FREQUENCY_DECAY);
}

function resolveDetectionHints(
  mode: TunerMode,
  manualStringId: GuitarStringId,
  smoothedFrequency: number | null,
  lastTargetStringId: GuitarStringId | null,
) {
  const referenceStringId = getReferenceStringId(
    mode,
    manualStringId,
    smoothedFrequency,
    lastTargetStringId,
  );

  if (referenceStringId === null || !THIN_GUITAR_STRING_IDS.includes(referenceStringId)) {
    return {
      minFrequency: undefined,
      maxFrequency: undefined,
      confidenceBias: 0,
      expectedFrequency: undefined,
      expectedToleranceRatio: undefined,
      expectedBonus: undefined,
    };
  }

  const window = THIN_STRING_DETECTION_WINDOWS[referenceStringId];
  const targetString = GUITAR_STRING_MAP[referenceStringId];

  return {
    minFrequency: window?.minFrequency,
    maxFrequency: window?.maxFrequency,
    confidenceBias: window?.confidenceBonus ?? 0,
    expectedFrequency: targetString.frequency,
    expectedToleranceRatio: window?.expectedToleranceRatio,
    expectedBonus: window?.expectedBonus,
  };
}

function getReferenceStringId(
  mode: TunerMode,
  manualStringId: GuitarStringId,
  smoothedFrequency: number | null,
  lastTargetStringId: GuitarStringId | null,
) {
  if (mode === 'manual') {
    return manualStringId;
  }

  if (lastTargetStringId !== null) {
    return lastTargetStringId;
  }

  if (smoothedFrequency === null) {
    return null;
  }

  return getNearestGuitarString(smoothedFrequency).id;
}
