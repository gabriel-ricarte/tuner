import type { CaptureProfileId } from '@/shared/types/audio';
import type { PitchDetectorId } from '@/shared/types/pitch';

export type TunerStatus =
  | 'idle'
  | 'requesting-permission'
  | 'listening'
  | 'no-signal'
  | 'detecting'
  | 'error';

export type TunerMode = 'auto' | 'manual';
export type StringTypeId = 'steel' | 'nylon';

export type GuitarStringId = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

export type GuitarString = {
  id: GuitarStringId;
  label: string;
  midi: number;
  frequency: number;
};

export type DetectedNote = {
  frequency: number;
  midi: number;
  label: string;
};

export type TunerSnapshot = {
  frequency: number | null;
  note: DetectedNote | null;
  cents: number | null;
  targetNote: GuitarString | null;
  targetString: GuitarString | null;
  signalLevel: number;
  confidence: number;
};

export type TunerDebugState = {
  detectorId: PitchDetectorId;
  captureProfileId: CaptureProfileId;
  stringTypeId: StringTypeId;
  mode: TunerMode;
  manualStringId: GuitarStringId;
  referenceStringId: GuitarStringId | null;
  stage: 'idle' | 'frame-rejected' | 'detecting' | 'accepted' | 'holding';
  rejectionReason:
    | 'weak-signal'
    | 'clipping'
    | 'minimum-signal'
    | 'no-detection'
    | 'low-confidence'
    | 'out-of-range'
    | 'waiting-good-frames'
    | null;
  sampleRate: number | null;
  sessionFallback: boolean;
  signalLevel: number;
  peak: number;
  dcOffset: number;
  clipping: boolean;
  minimumSignalLevel: number;
  hasRecentReading: boolean;
  hasLogicalRetention: boolean;
  weakSignalFrames: number;
  consecutiveGoodFrames: number;
  consecutiveBadFrames: number;
  smoothingFrequency: number | null;
  visualFrequency: number | null;
  noteLabel: string | null;
  broadFrequency: number | null;
  broadConfidence: number;
  refinedFrequency: number | null;
  refinedConfidence: number;
  selectedFrequency: number | null;
  selectedConfidence: number;
  refinementMinFrequency: number | null;
  refinementMaxFrequency: number | null;
  detectorComparison: Record<
    PitchDetectorId,
    {
      frequency: number | null;
      confidence: number;
    }
  >;
  events: Array<{
    timestamp: number;
    stage: TunerDebugState['stage'];
    reason: TunerDebugState['rejectionReason'];
    detail: string;
  }>;
};

export type TunerPreferences = {
  mode: TunerMode;
  targetStringId: GuitarStringId;
  captureProfileId: CaptureProfileId;
  stringTypeId: StringTypeId;
  pitchDetectorId: PitchDetectorId;
};

export type TunerHookResult = {
  status: TunerStatus;
  mode: TunerMode;
  captureProfileId: CaptureProfileId;
  stringTypeId: StringTypeId;
  pitchDetectorId: PitchDetectorId;
  frequency: number | null;
  note: DetectedNote | null;
  cents: number | null;
  targetNote: GuitarString | null;
  targetString: GuitarString | null;
  signalLevel: number;
  confidence: number;
  debug: TunerDebugState;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  setCaptureProfile: (profileId: CaptureProfileId) => void;
  setStringType: (stringTypeId: StringTypeId) => void;
  setPitchDetector: (pitchDetectorId: PitchDetectorId) => void;
  setTargetString: (value: GuitarStringId | null) => void;
  setMode: (mode: TunerMode) => void;
};
