import { autocorrelateClassicDetector } from '@/lib/pitch/detectors/autocorrelateClassicDetector';
import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import type { PitchDetector } from '@/lib/pitch/detectors/types';
import type { PitchDetectorId } from '@/shared/types/pitch';

export const DEFAULT_PITCH_DETECTOR_ID: PitchDetectorId = 'autocorrelate-stable';

export const PITCH_DETECTORS: Record<PitchDetectorId, PitchDetector> = {
  'autocorrelate-stable': autocorrelateDetector,
  'autocorrelate-classic': autocorrelateClassicDetector,
};

export function getPitchDetector(detectorId: PitchDetectorId) {
  return PITCH_DETECTORS[detectorId];
}
