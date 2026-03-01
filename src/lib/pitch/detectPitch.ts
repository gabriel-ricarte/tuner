import { DEFAULT_PITCH_DETECTOR_ID, getPitchDetector } from '@/lib/pitch/detectors/registry';
import type { PitchDetectorInput } from '@/lib/pitch/detectors/types';
import type { RuntimePitchDetectorId } from '@/shared/types/pitch';

export function detectPitch(
  input: PitchDetectorInput,
  detectorId: RuntimePitchDetectorId = DEFAULT_PITCH_DETECTOR_ID,
) {
  return getPitchDetector(detectorId).detect(input);
}
