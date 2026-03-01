import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { CAPTURE_PROFILES, DEFAULT_CAPTURE_PROFILE_ID } from '@/lib/audio/captureProfiles';
import { getAudioCaptureEnvironment } from '@/lib/audio/device';
import { prepareAudioFrame } from '@/lib/audio/frameAnalysis';
import { createMicrophoneController } from '@/lib/audio/microphone';
import { DEFAULT_PITCH_DETECTOR_ID } from '@/lib/pitch/detectors/registry';
import { detectPitch } from '@/lib/pitch/detectPitch';
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
  DEFAULT_STRING_TYPE_ID,
  DEFAULT_TARGET_STRING_ID,
  GUITAR_STRING_MAP,
  HIGH_GUITAR_STRING_IDS,
  HIGH_STRING_DETECTION_WINDOWS
} from '@/shared/constants/tuner';
import { translations } from '@/lib/i18n/translations';
import type { Locale } from '@/shared/types/i18n';
import type { CaptureProfileId } from '@/shared/types/audio';
import type { PitchDetectorId } from '@/shared/types/pitch';
import type {
  DetectedNote,
  GuitarStringId,
  StringTypeId,
  TunerDebugState,
  TunerHookResult,
  TunerMode,
  TunerSnapshot,
  TunerStatus
} from '@/shared/types/tuner';

type TunerErrorKey =
  | 'microphoneUnavailable'
  | 'insecureContext'
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
const captureEnvironment = getAudioCaptureEnvironment();

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

function buildInitialDebugState(
  captureProfileId: CaptureProfileId,
  stringTypeId: StringTypeId,
  pitchDetectorId: PitchDetectorId,
  mode: TunerMode,
  manualStringId: GuitarStringId,
): TunerDebugState {
  return {
    detectorId: pitchDetectorId,
    captureProfileId,
    stringTypeId,
    mode,
    manualStringId,
    referenceStringId: null,
    stage: 'idle',
    rejectionReason: null,
    sampleRate: null,
    sessionFallback: false,
    signalLevel: 0,
    peak: 0,
    dcOffset: 0,
    clipping: false,
    minimumSignalLevel: 0,
    hasRecentReading: false,
    hasLogicalRetention: false,
    weakSignalFrames: 0,
    consecutiveGoodFrames: 0,
    consecutiveBadFrames: 0,
    smoothingFrequency: null,
    visualFrequency: null,
    noteLabel: null,
    broadFrequency: null,
    broadConfidence: 0,
    refinedFrequency: null,
    refinedConfidence: 0,
    selectedFrequency: null,
    selectedConfidence: 0,
    refinementMinFrequency: null,
    refinementMaxFrequency: null,
    detectorComparison: {
      'autocorrelate-stable': {
        frequency: null,
        confidence: 0,
      },
      'autocorrelate-classic': {
        frequency: null,
        confidence: 0,
      },
    },
    events: [],
  };
}

export function useTuner(locale: Locale): TunerHookResult {
  const preferences = loadTunerPreferences();
  const initialMode = preferences.mode ?? 'auto';
  const initialStringId = preferences.targetStringId ?? DEFAULT_TARGET_STRING_ID;
  const initialCaptureProfileId = preferences.captureProfileId ?? DEFAULT_CAPTURE_PROFILE_ID;
  const initialStringTypeId = preferences.stringTypeId ?? DEFAULT_STRING_TYPE_ID;
  const initialPitchDetectorId = preferences.pitchDetectorId ?? DEFAULT_PITCH_DETECTOR_ID;
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [mode, setMode] = useState<TunerMode>(initialMode);
  const [manualStringId, setManualStringId] = useState<GuitarStringId>(initialStringId);
  const [captureProfileId, setCaptureProfileId] =
    useState<CaptureProfileId>(initialCaptureProfileId);
  const [stringTypeId, setStringTypeId] = useState<StringTypeId>(initialStringTypeId);
  const [pitchDetectorId, setPitchDetectorId] =
    useState<PitchDetectorId>(initialPitchDetectorId);
  const [snapshot, setSnapshot] = useState<TunerSnapshot>(
    buildInitialSnapshot(initialStringId),
  );
  const [debug, setDebug] = useState<TunerDebugState>(
    buildInitialDebugState(
      initialCaptureProfileId,
      initialStringTypeId,
      initialPitchDetectorId,
      initialMode,
      initialStringId,
    ),
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
  const debugSignature = useRef<string>('idle');
  const captureProfile = CAPTURE_PROFILES[captureProfileId];

  useEffect(() => {
    saveTunerPreferences({
      mode,
      targetStringId: manualStringId,
      captureProfileId,
      stringTypeId,
      pitchDetectorId,
    });
  }, [captureProfileId, manualStringId, mode, pitchDetectorId, stringTypeId]);

  useEffect(() => {
    consecutiveGoodFrames.current = 0;
    consecutiveBadFrames.current = 0;
    weakSignalFrames.current = 0;
    pendingNoteLabel.current = null;
    pendingNoteFrames.current = 0;
    pendingAutoStringId.current = null;
    pendingAutoStringFrames.current = 0;
    lockedNote.current = null;
    lockedAutoStringId.current = null;
    smoothedFrequency.current = lastValidSnapshot.current.frequency;
    setDebug(
      buildInitialDebugState(
        captureProfileId,
        stringTypeId,
        pitchDetectorId,
        mode,
        manualStringId,
      ),
    );
  }, [captureProfileId, manualStringId, mode, pitchDetectorId, stringTypeId]);

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
    debugSignature.current = 'idle';
    setStatus('idle');
    setDebug(
      buildInitialDebugState(captureProfileId, stringTypeId, pitchDetectorId, mode, manualStringId),
    );
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
    const referenceStringId =
      mode === 'manual'
        ? manualStringId
        : lastValidSnapshot.current.targetString?.id ?? null;
    const emphasisFrequency = resolveFrameEmphasisFrequency(
      mode,
      manualStringId,
      referenceStringId,
      lastValidSnapshot.current.frequency,
    );
    const minimumSignalLevel = hasRecentReading
      ? getEffectiveHoldSignalLevel(captureProfile.holdRms)
      : getEffectiveEntrySignalLevel(captureProfile.entryRms);
    const preparedFrame = prepareAudioFrame(analysis.buffer, captureProfile, {
      sampleRate: analysis.sampleRate,
      emphasisFrequency,
    });
    const signalLevel = preparedFrame.quality.rms;
    const effectiveFrameQuality = {
      ...preparedFrame.quality,
      hasMinimumSignal: signalLevel >= getEffectiveHoldSignalLevel(captureProfile.holdRms),
    };
    const nextDebugBase = {
      detectorId: pitchDetectorId,
      captureProfileId,
      stringTypeId,
      sampleRate: analysis.sampleRate,
      sessionFallback: analysis.session.usedFallback,
      mode,
      manualStringId,
      referenceStringId,
      signalLevel,
      peak: preparedFrame.quality.peak,
      dcOffset: preparedFrame.quality.dcOffset,
      clipping: preparedFrame.quality.hasClipping,
      minimumSignalLevel,
      hasRecentReading,
      hasLogicalRetention,
      weakSignalFrames: weakSignalFrames.current,
      consecutiveGoodFrames: consecutiveGoodFrames.current,
      consecutiveBadFrames: consecutiveBadFrames.current,
      smoothingFrequency: smoothedFrequency.current,
      visualFrequency: lastValidSnapshot.current.frequency,
      noteLabel: lastValidSnapshot.current.note?.label ?? null,
    };
    if (
      signalLevel < minimumSignalLevel ||
      preparedFrame.quality.hasClipping ||
      !effectiveFrameQuality.hasMinimumSignal
    ) {
      const rejectionReason =
        signalLevel < minimumSignalLevel
          ? 'weak-signal'
          : preparedFrame.quality.hasClipping
            ? 'clipping'
            : 'minimum-signal';
      weakSignalFrames.current += 1;
      consecutiveBadFrames.current += 1;
      consecutiveGoodFrames.current = 0;
      retainSmoothedFrequency(smoothedFrequency, lastValidSnapshot.current.frequency);
      setDebug((current) =>
        withDebugEvent(
          {
            ...current,
            ...nextDebugBase,
            stage: hasRecentReading || hasLogicalRetention ? 'holding' : 'frame-rejected',
            rejectionReason,
            weakSignalFrames: weakSignalFrames.current,
            consecutiveGoodFrames: consecutiveGoodFrames.current,
            consecutiveBadFrames: consecutiveBadFrames.current,
            smoothingFrequency: smoothedFrequency.current,
            visualFrequency: lastValidSnapshot.current.frequency,
            broadFrequency: null,
            broadConfidence: 0,
            refinedFrequency: null,
            refinedConfidence: 0,
            selectedFrequency: null,
            selectedConfidence: 0,
            refinementMinFrequency: null,
            refinementMaxFrequency: null,
            detectorComparison: {
              'autocorrelate-stable': { frequency: null, confidence: 0 },
              'autocorrelate-classic': { frequency: null, confidence: 0 },
            },
          },
          debugSignature,
          {
            timestamp: now,
            stage: hasRecentReading || hasLogicalRetention ? 'holding' : 'frame-rejected',
            reason: rejectionReason,
            detail: `signal=${signalLevel.toFixed(4)} min=${minimumSignalLevel.toFixed(4)}`,
          },
        ),
      );
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
    const broadInput = {
      buffer: preparedFrame.buffer,
      sampleRate: analysis.sampleRate,
      options: {
        captureProfile,
        frameQuality: effectiveFrameQuality,
        previousFrequency: lastValidSnapshot.current.frequency,
      },
    };
    const stableBroadDetection = detectPitch(broadInput, 'autocorrelate-stable');
    const classicBroadDetection = detectPitch(broadInput, 'autocorrelate-classic');
    const broadDetection = selectDetectionCandidate(
      pitchDetectorId,
      stableBroadDetection,
      classicBroadDetection,
    );
    const refinementHints = resolveRefinementHints(
      mode,
      manualStringId,
      stringTypeId,
      broadDetection?.frequency ?? null,
    );
    const refinedStableDetection =
      broadDetection !== null && refinementHints !== null
        ? detectPitch({
            buffer: preparedFrame.buffer,
            sampleRate: analysis.sampleRate,
            options: {
              captureProfile,
              frameQuality: effectiveFrameQuality,
              previousFrequency: lastValidSnapshot.current.frequency,
              searchMinFrequency: refinementHints.minFrequency,
              searchMaxFrequency: refinementHints.maxFrequency,
              confidenceBias: refinementHints.confidenceBias,
              expectedFrequency: refinementHints.expectedFrequency,
              expectedToleranceRatio: refinementHints.expectedToleranceRatio,
              expectedBonus: refinementHints.expectedBonus,
            },
          }, 'autocorrelate-stable')
        : null;
    const refinedClassicDetection =
      broadDetection !== null && refinementHints !== null
        ? detectPitch({
            buffer: preparedFrame.buffer,
            sampleRate: analysis.sampleRate,
            options: {
              captureProfile,
              frameQuality: effectiveFrameQuality,
              previousFrequency: lastValidSnapshot.current.frequency,
              searchMinFrequency: refinementHints.minFrequency,
              searchMaxFrequency: refinementHints.maxFrequency,
              confidenceBias: refinementHints.confidenceBias,
              expectedFrequency: refinementHints.expectedFrequency,
              expectedToleranceRatio: refinementHints.expectedToleranceRatio,
              expectedBonus: refinementHints.expectedBonus,
            },
          }, 'autocorrelate-classic')
        : null;
    const refinedDetection = selectDetectionCandidate(
      pitchDetectorId,
      refinedStableDetection,
      refinedClassicDetection,
    );
    const detection = refinedDetection ?? broadDetection;
    setDebug((current) => ({
      ...current,
      ...nextDebugBase,
      broadFrequency: broadDetection?.frequency ?? null,
      broadConfidence: broadDetection?.confidence ?? 0,
      refinedFrequency: refinedDetection?.frequency ?? null,
      refinedConfidence: refinedDetection?.confidence ?? 0,
      selectedFrequency: detection?.frequency ?? null,
      selectedConfidence: detection?.confidence ?? 0,
      refinementMinFrequency: refinementHints?.minFrequency ?? null,
      refinementMaxFrequency: refinementHints?.maxFrequency ?? null,
      detectorComparison: {
        'autocorrelate-stable': {
          frequency: stableBroadDetection?.frequency ?? null,
          confidence: stableBroadDetection?.confidence ?? 0,
        },
        'autocorrelate-classic': {
          frequency: classicBroadDetection?.frequency ?? null,
          confidence: classicBroadDetection?.confidence ?? 0,
        },
      },
    }));
    const minimumConfidence = hasRecentReading
      ? getEffectiveHoldDetectionConfidence()
      : getEffectiveDetectionConfidence();
    const minimumFrequency = getEffectiveMinimumDetectionFrequency();
    const maximumFrequency = getEffectiveMaximumDetectionFrequency();

    if (
      detection === null ||
      detection.confidence < minimumConfidence ||
      detection.frequency < minimumFrequency ||
      detection.frequency > maximumFrequency
    ) {
      const rejectionReason =
        detection === null
          ? 'no-detection'
          : detection.confidence < minimumConfidence
            ? 'low-confidence'
            : 'out-of-range';
      consecutiveBadFrames.current += 1;
      consecutiveGoodFrames.current = 0;
      retainSmoothedFrequency(smoothedFrequency, lastValidSnapshot.current.frequency);
      setDebug((current) =>
        withDebugEvent(
          {
            ...current,
            ...nextDebugBase,
            stage: hasRecentReading || hasLogicalRetention ? 'holding' : 'detecting',
            rejectionReason,
            weakSignalFrames: weakSignalFrames.current,
            consecutiveGoodFrames: consecutiveGoodFrames.current,
            consecutiveBadFrames: consecutiveBadFrames.current,
            smoothingFrequency: smoothedFrequency.current,
            visualFrequency: lastValidSnapshot.current.frequency,
            noteLabel: lastValidSnapshot.current.note?.label ?? null,
          },
          debugSignature,
          {
            timestamp: now,
            stage: hasRecentReading || hasLogicalRetention ? 'holding' : 'detecting',
            reason: rejectionReason,
            detail:
              detection === null
                ? 'no frequency candidate'
                : `confidence=${detection.confidence.toFixed(2)} freq=${detection.frequency.toFixed(2)}`,
          },
        ),
      );
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

    if (
      !hasRecentReading &&
      consecutiveGoodFrames.current < getEffectiveMinimumGoodFrames(captureProfile.minGoodFrames)
    ) {
      setDebug((current) =>
        withDebugEvent(
          {
            ...current,
            ...nextDebugBase,
            stage: 'detecting',
            rejectionReason: 'waiting-good-frames',
            weakSignalFrames: weakSignalFrames.current,
            consecutiveGoodFrames: consecutiveGoodFrames.current,
            consecutiveBadFrames: consecutiveBadFrames.current,
            smoothingFrequency: smoothedFrequency.current,
            visualFrequency: lastValidSnapshot.current.frequency,
          },
          debugSignature,
          {
            timestamp: now,
            stage: 'detecting',
            reason: 'waiting-good-frames',
            detail: `good=${consecutiveGoodFrames.current}/${getEffectiveMinimumGoodFrames(captureProfile.minGoodFrames)}`,
          },
        ),
      );
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
    setDebug((current) =>
      withDebugEvent(
        {
          ...current,
          ...nextDebugBase,
          stage: 'accepted',
          rejectionReason: null,
          weakSignalFrames: weakSignalFrames.current,
          consecutiveGoodFrames: consecutiveGoodFrames.current,
          consecutiveBadFrames: consecutiveBadFrames.current,
          smoothingFrequency: smoothedFrequency.current,
          visualFrequency: nextFrequency,
          noteLabel: note.label,
        },
        debugSignature,
        {
          timestamp: now,
          stage: 'accepted',
          reason: null,
          detail: `${note.label} ${nextFrequency.toFixed(2)}Hz c=${detection.confidence.toFixed(2)}`,
        },
      ),
    );
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
    stringTypeId,
    pitchDetectorId,
    frequency: snapshot.frequency,
    note: snapshot.note,
    cents: snapshot.cents,
    targetNote: snapshot.targetNote,
    targetString: snapshot.targetString,
    signalLevel: snapshot.signalLevel,
    confidence: snapshot.confidence,
    debug,
    error,
    start,
    stop,
    setCaptureProfile: setCaptureProfileId,
    setStringType: setStringTypeId,
    setPitchDetector: setPitchDetectorId,
    setTargetString,
    setMode
  };
}

function withDebugEvent(
  nextState: TunerDebugState,
  debugSignature: MutableRefObject<string>,
  event: TunerDebugState['events'][number],
) {
  const signature = `${event.stage}:${event.reason ?? 'ok'}:${event.detail}`;

  if (debugSignature.current === signature) {
    return nextState;
  }

  debugSignature.current = signature;

  return {
    ...nextState,
    events: [event, ...nextState.events].slice(0, 8),
  };
}

function getEffectiveEntrySignalLevel(entryRms: number) {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return entryRms;
  }

  return Math.max(0.008, entryRms * 0.72);
}

function getEffectiveHoldSignalLevel(holdRms: number) {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return holdRms;
  }

  return Math.max(0.006, holdRms * 0.72);
}

function getEffectiveDetectionConfidence() {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return MIN_DETECTION_CONFIDENCE;
  }

  return Math.max(0.72, MIN_DETECTION_CONFIDENCE - 0.12);
}

function getEffectiveHoldDetectionConfidence() {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return HOLD_DETECTION_CONFIDENCE;
  }

  return Math.max(0.6, HOLD_DETECTION_CONFIDENCE - 0.08);
}

function getEffectiveMinimumDetectionFrequency() {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return MIN_DETECTION_FREQUENCY;
  }

  return Math.max(65, MIN_DETECTION_FREQUENCY - 10);
}

function getEffectiveMaximumDetectionFrequency() {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return MAX_DETECTION_FREQUENCY;
  }

  return MAX_DETECTION_FREQUENCY + 40;
}

function getEffectiveMinimumGoodFrames(minGoodFrames: number) {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return minGoodFrames;
  }

  return Math.max(1, minGoodFrames - 1);
}

function selectDetectionCandidate(
  preferredDetectorId: PitchDetectorId,
  stableDetection: ReturnType<typeof detectPitch>,
  classicDetection: ReturnType<typeof detectPitch>,
) {
  if (!captureEnvironment.isLikelyMobileSafari) {
    return preferredDetectorId === 'autocorrelate-classic'
      ? classicDetection
      : stableDetection;
  }

  if (stableDetection === null) {
    return classicDetection;
  }

  if (classicDetection === null) {
    return stableDetection;
  }

  return stableDetection.confidence >= classicDetection.confidence
    ? stableDetection
    : classicDetection;
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
  if (
    caughtError instanceof Error &&
    caughtError.message === 'Microphone access requires HTTPS or localhost.'
  ) {
    return 'insecureContext';
  }

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

function resolveRefinementHints(
  mode: TunerMode,
  manualStringId: GuitarStringId,
  stringTypeId: StringTypeId,
  detectedFrequency: number | null,
) {
  const referenceStringId =
    mode === 'manual'
      ? manualStringId
      : resolveAutoReferenceStringId(detectedFrequency, stringTypeId);

  if (referenceStringId === null || !HIGH_GUITAR_STRING_IDS.includes(referenceStringId)) {
    return null;
  }

  const window = HIGH_STRING_DETECTION_WINDOWS[stringTypeId][referenceStringId];
  const targetString = GUITAR_STRING_MAP[referenceStringId];

  if (window === undefined) {
    return null;
  }

  return {
    minFrequency: window.minFrequency,
    maxFrequency: window.maxFrequency,
    confidenceBias: window.confidenceBonus,
    expectedFrequency: targetString.frequency,
    expectedToleranceRatio: window.expectedToleranceRatio,
    expectedBonus: window.expectedBonus,
  };
}

function resolveFrameEmphasisFrequency(
  mode: TunerMode,
  manualStringId: GuitarStringId,
  referenceStringId: GuitarStringId | null,
  lastDetectedFrequency: number | null,
) {
  if (mode === 'manual') {
    return GUITAR_STRING_MAP[manualStringId].frequency;
  }

  if (referenceStringId !== null) {
    return GUITAR_STRING_MAP[referenceStringId].frequency;
  }

  return lastDetectedFrequency;
}

function resolveAutoReferenceStringId(
  detectedFrequency: number | null,
  stringTypeId: StringTypeId,
) {
  if (detectedFrequency === null) {
    return null;
  }

  const nearestStringId = getNearestGuitarString(detectedFrequency).id;

  if (HIGH_GUITAR_STRING_IDS.includes(nearestStringId)) {
    return nearestStringId;
  }

  const harmonicMultipliers = [2, 3, 4] as const;

  for (const stringId of HIGH_GUITAR_STRING_IDS) {
    const window = HIGH_STRING_DETECTION_WINDOWS[stringTypeId][stringId];
    const targetString = GUITAR_STRING_MAP[stringId];

    if (window === undefined) {
      continue;
    }

    for (const multiplier of harmonicMultipliers) {
      const projectedFrequency = detectedFrequency * multiplier;
      const distanceRatio =
        Math.abs(projectedFrequency - targetString.frequency) / targetString.frequency;

      if (distanceRatio <= window.activationToleranceRatio) {
        return stringId;
      }
    }
  }

  return nearestStringId;
}
