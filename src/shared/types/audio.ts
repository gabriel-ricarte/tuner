import type { RuntimePitchDetectorId } from '@/shared/types/pitch';

export type CaptureProfileId = 'sensivel' | 'balanceado' | 'estrito';

export type CaptureProfileConfig = {
  id: CaptureProfileId;
  entryRms: number;
  holdRms: number;
  clippingThreshold: number;
  minGoodFrames: number;
  maxBadFrames: number;
  maxFrequencyJumpRatio: number;
};

export type FrameQuality = {
  rms: number;
  peak: number;
  hasClipping: boolean;
  hasMinimumSignal: boolean;
  dcOffset: number;
};

export type PitchDetectionResult = {
  frequency: number;
  confidence: number;
  detector: RuntimePitchDetectorId;
  debug?: Record<string, unknown>;
};

export type MicrophoneSession = {
  settings: MediaTrackSettings | null;
  constraints: MediaTrackConstraints | null;
  usedFallback: boolean;
};
