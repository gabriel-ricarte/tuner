import type {
  CaptureProfileConfig,
  FrameQuality,
  PitchDetectionResult,
} from '@/shared/types/audio';

export type PitchDetectorOptions = {
  captureProfile?: Pick<CaptureProfileConfig, 'maxFrequencyJumpRatio'>;
  frameQuality?: FrameQuality;
  previousFrequency?: number | null;
  searchMinFrequency?: number;
  searchMaxFrequency?: number;
  confidenceBias?: number;
  expectedFrequency?: number;
  expectedToleranceRatio?: number;
  expectedBonus?: number;
};

export type PitchDetectorInput = {
  buffer: Float32Array;
  sampleRate: number;
  options?: PitchDetectorOptions;
};

export type PitchDetector = {
  id: string;
  detect: (input: PitchDetectorInput) => PitchDetectionResult | null;
};
