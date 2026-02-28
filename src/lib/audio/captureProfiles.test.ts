import { describe, expect, it } from 'vitest';
import { CAPTURE_PROFILES, DEFAULT_CAPTURE_PROFILE_ID } from '@/lib/audio/captureProfiles';

describe('capture profiles', () => {
  it('keeps a stable default profile', () => {
    expect(DEFAULT_CAPTURE_PROFILE_ID).toBe('balanceado');
  });

  it('orders entry/hold RMS thresholds conservatively across profiles', () => {
    expect(CAPTURE_PROFILES.sensivel.entryRms).toBeLessThan(CAPTURE_PROFILES.balanceado.entryRms);
    expect(CAPTURE_PROFILES.balanceado.entryRms).toBeLessThan(CAPTURE_PROFILES.estrito.entryRms);

    expect(CAPTURE_PROFILES.sensivel.holdRms).toBeLessThan(CAPTURE_PROFILES.balanceado.holdRms);
    expect(CAPTURE_PROFILES.balanceado.holdRms).toBeLessThan(CAPTURE_PROFILES.estrito.holdRms);
  });

  it('keeps strict profile less tolerant to jump ratio than sensitive profile', () => {
    expect(CAPTURE_PROFILES.estrito.maxFrequencyJumpRatio).toBeLessThan(
      CAPTURE_PROFILES.sensivel.maxFrequencyJumpRatio,
    );
  });
});
