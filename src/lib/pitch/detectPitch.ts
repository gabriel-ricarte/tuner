import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import type { PitchDetectorInput } from '@/lib/pitch/detectors/types';

export function detectPitch(input: PitchDetectorInput) {
  return autocorrelateDetector.detect(input);
}
