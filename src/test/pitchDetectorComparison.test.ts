import { describe, expect, it } from 'vitest';
import { autocorrelateClassicDetector } from '@/lib/pitch/detectors/autocorrelateClassicDetector';
import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import { runPitchBenchmark } from '@/test/pitchBenchmark';
import {
  createHarmonicSignal,
  createNylonLikeSignal,
  createSineWave,
  SAMPLE_RATE,
} from '@/test/signalFactory';
import { STANDARD_GUITAR_FREQUENCIES } from '@/test/standardTuning';

describe('pitch detector comparison', () => {
  it('keeps the stable detector at least as good as classic on the current benchmark bundle', () => {
    const cases = [
      ...STANDARD_GUITAR_FREQUENCIES.map((stringInfo) => ({
        id: `${stringInfo.id}-sine`,
        buffer: createSineWave(stringInfo.frequency),
        sampleRate: SAMPLE_RATE,
        expectedFrequency: stringInfo.frequency,
        maximumFrequencyError: 1,
      })),
      ...STANDARD_GUITAR_FREQUENCIES.slice(3).map((stringInfo) => ({
        id: `${stringInfo.id}-harmonic`,
        buffer: createHarmonicSignal(stringInfo.frequency),
        sampleRate: SAMPLE_RATE,
        expectedFrequency: stringInfo.frequency,
        maximumFrequencyError: 1.5,
      })),
      ...STANDARD_GUITAR_FREQUENCIES.slice(3).map((stringInfo) => ({
        id: `${stringInfo.id}-nylon`,
        buffer: createNylonLikeSignal(stringInfo.frequency),
        sampleRate: SAMPLE_RATE,
        expectedFrequency: stringInfo.frequency,
        maximumFrequencyError: 1.5,
      })),
    ];

    const stablePasses = runPitchBenchmark(autocorrelateDetector, cases).filter(
      (result) => result.passed,
    ).length;
    const classicPasses = runPitchBenchmark(autocorrelateClassicDetector, cases).filter(
      (result) => result.passed,
    ).length;

    expect(stablePasses).toBeGreaterThanOrEqual(classicPasses);
  });
});
