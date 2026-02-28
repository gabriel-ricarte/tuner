import { autoCorrelate } from '@/lib/pitch/autocorrelate';
import type { PitchDetector } from '@/lib/pitch/detectors/types';

export const autocorrelateDetector: PitchDetector = {
  id: 'autocorrelate',
  detect: ({ buffer, sampleRate, options }) => autoCorrelate(buffer, sampleRate, options),
};
