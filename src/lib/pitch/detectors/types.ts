import type {
  CaptureProfileConfig,
  FrameQuality,
  PitchDetectionResult,
} from '@/shared/types/audio';
import type { RuntimePitchDetectorId } from '@/shared/types/pitch';

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
  id: RuntimePitchDetectorId;
  detect: (input: PitchDetectorInput) => PitchDetectionResult | null;
};
