import { describe, expect, it } from 'vitest';
import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import { runPitchBenchmark } from '@/test/pitchBenchmark';
import { createSineWave, SAMPLE_RATE } from '@/test/signalFactory';
import { STANDARD_GUITAR_FREQUENCIES } from '@/test/standardTuning';

describe('runPitchBenchmark', () => {
  it('reports passing benchmark results for standard tuning sine cases', () => {
    const results = runPitchBenchmark(
      autocorrelateDetector,
      STANDARD_GUITAR_FREQUENCIES.map((stringInfo) => ({
        id: stringInfo.id,
        buffer: createSineWave(stringInfo.frequency),
        sampleRate: SAMPLE_RATE,
        expectedFrequency: stringInfo.frequency,
        maximumFrequencyError: 1,
      })),
    );

    expect(results).toHaveLength(6);
    expect(results.every((result) => result.passed)).toBe(true);
  });

  it('marks a case as failed when detector output exceeds the accepted error', () => {
    const results = runPitchBenchmark(autocorrelateDetector, [
      {
        id: 'bad-threshold',
        buffer: createSineWave(110),
        sampleRate: SAMPLE_RATE,
        expectedFrequency: 220,
        maximumFrequencyError: 1,
      },
    ]);

    expect(results[0].passed).toBe(false);
    expect(results[0].frequencyError).not.toBeNull();
  });
});
