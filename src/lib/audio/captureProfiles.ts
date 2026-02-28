import type { CaptureProfileConfig, CaptureProfileId } from '@/shared/types/audio';

export const CAPTURE_PROFILES: Record<CaptureProfileId, CaptureProfileConfig> = {
  sensivel: {
    id: 'sensivel',
    entryRms: 0.018,
    holdRms: 0.012,
    clippingThreshold: 0.99,
    minGoodFrames: 2,
    maxBadFrames: 7,
    maxFrequencyJumpRatio: 1.48,
  },
  balanceado: {
    id: 'balanceado',
    entryRms: 0.022,
    holdRms: 0.014,
    clippingThreshold: 0.985,
    minGoodFrames: 3,
    maxBadFrames: 6,
    maxFrequencyJumpRatio: 1.38,
  },
  estrito: {
    id: 'estrito',
    entryRms: 0.026,
    holdRms: 0.016,
    clippingThreshold: 0.975,
    minGoodFrames: 4,
    maxBadFrames: 5,
    maxFrequencyJumpRatio: 1.26,
  },
};

export const DEFAULT_CAPTURE_PROFILE_ID: CaptureProfileId = 'balanceado';
