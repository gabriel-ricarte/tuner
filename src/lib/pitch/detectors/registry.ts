import { aubioPitchDetector } from '@/lib/pitch/detectors/aubioPitchDetector';
import { autocorrelateClassicDetector } from '@/lib/pitch/detectors/autocorrelateClassicDetector';
import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import type { PitchDetector } from '@/lib/pitch/detectors/types';
import type { RuntimePitchDetectorId } from '@/shared/types/pitch';

export const DEFAULT_PITCH_DETECTOR_ID: RuntimePitchDetectorId = 'autocorrelate-stable';

export const PITCH_DETECTORS: Record<RuntimePitchDetectorId, PitchDetector> = {
  'autocorrelate-stable': autocorrelateDetector,
  'autocorrelate-classic': autocorrelateClassicDetector,
  'aubio-default': aubioPitchDetector,
};

export function getPitchDetector(detectorId: RuntimePitchDetectorId) {
  return PITCH_DETECTORS[detectorId];
}
