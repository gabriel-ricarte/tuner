import { describe, expect, it } from 'vitest';
import { aubioPitchDetector } from '@/lib/pitch/detectors/aubioPitchDetector';
import { autocorrelateClassicDetector } from '@/lib/pitch/detectors/autocorrelateClassicDetector';
import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import { getPitchDetector } from '@/lib/pitch/detectors/registry';
import { createSineWave, SAMPLE_RATE } from '@/test/signalFactory';

describe('pitch detector registry', () => {
  it('resolves the stable, classic, and aubio detectors by id', () => {
    expect(getPitchDetector('autocorrelate-stable')).toBe(autocorrelateDetector);
    expect(getPitchDetector('autocorrelate-classic')).toBe(autocorrelateClassicDetector);
    expect(getPitchDetector('aubio-default')).toBe(aubioPitchDetector);
  });

  it('keeps the stable detector better behaved on the D3 octave regression case', () => {
    const buffer = createSineWave(146.83);
    const stable = autocorrelateDetector.detect({ buffer, sampleRate: SAMPLE_RATE });
    const classic = autocorrelateClassicDetector.detect({ buffer, sampleRate: SAMPLE_RATE });

    expect(stable).not.toBeNull();
    expect(classic).not.toBeNull();
    expect(Math.abs(stable!.frequency - 146.83)).toBeLessThanOrEqual(
      Math.abs(classic!.frequency - 146.83),
    );
  });
});
