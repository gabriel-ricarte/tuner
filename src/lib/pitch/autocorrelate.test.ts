import { describe, expect, it } from 'vitest';
import { autocorrelateDetector } from '@/lib/pitch/detectors/autocorrelateDetector';
import { CAPTURE_PROFILES } from '@/lib/audio/captureProfiles';
import { HIGH_STRING_DETECTION_WINDOWS } from '@/shared/constants/tuner';
import {
  createHarmonicSignal,
  createNylonLikeSignal,
  createOctaveBiasedSignal,
  createSineWave,
  createVoiceLikeSignal,
  SAMPLE_RATE,
} from '@/test/signalFactory';
import { STANDARD_GUITAR_FREQUENCIES } from '@/test/standardTuning';
import { runPitchBenchmark } from '@/test/pitchBenchmark';

describe('autoCorrelate', () => {
  it('detects the six standard guitar strings from clean sine waves', () => {
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

    expect(results.every((result) => result.passed)).toBe(true);
  });

  it('keeps the D3 regression from collapsing to the lower octave', () => {
    const buffer = createSineWave(146.83);
    const result = autocorrelateDetector.detect({ buffer, sampleRate: SAMPLE_RATE });

    expect(result).not.toBeNull();
    expect(result!.frequency).toBeGreaterThan(130);
    expect(result!.frequency).toBeLessThan(160);
  });

  it('rejects silent or nearly silent buffers', () => {
    const buffer = new Float32Array(4096);
    const result = autocorrelateDetector.detect({ buffer, sampleRate: SAMPLE_RATE });

    expect(result).toBeNull();
  });

  it('penalizes implausible jumps against the previous frequency', () => {
    const buffer = createSineWave(329.63);
    const result = autocorrelateDetector.detect({
      buffer,
      sampleRate: SAMPLE_RATE,
      options: {
        captureProfile: CAPTURE_PROFILES.estrito,
        previousFrequency: 82.41,
      },
    });

    expect(result).not.toBeNull();
    expect(result!.confidence).toBeLessThan(0.55);
  });

  it('rewards coherent refinement around the expected high-string frequency for steel strings', () => {
    for (const stringId of ['G3', 'B3', 'E4'] as const) {
      const target = STANDARD_GUITAR_FREQUENCIES.find((item) => item.id === stringId)!;
      const window = HIGH_STRING_DETECTION_WINDOWS.steel[stringId]!;
      const buffer = createHarmonicSignal(target.frequency);

      const broad = autocorrelateDetector.detect({
        buffer,
        sampleRate: SAMPLE_RATE,
        options: {
          captureProfile: CAPTURE_PROFILES.estrito,
        },
      });
      const refined = autocorrelateDetector.detect({
        buffer,
        sampleRate: SAMPLE_RATE,
        options: {
          captureProfile: CAPTURE_PROFILES.estrito,
          previousFrequency: broad?.frequency ?? null,
          searchMinFrequency: window.minFrequency,
          searchMaxFrequency: window.maxFrequency,
          confidenceBias: window.confidenceBonus,
          expectedFrequency: target.frequency,
          expectedToleranceRatio: window.expectedToleranceRatio,
          expectedBonus: window.expectedBonus,
        },
      });

      expect(broad, stringId).not.toBeNull();
      expect(refined, stringId).not.toBeNull();
      expect(refined!.frequency, stringId).toBeCloseTo(target.frequency, 0);
      expect(refined!.confidence, stringId).toBeGreaterThanOrEqual(broad!.confidence);
    }
  });

  it('supports nylon-like high-string signals with expected-frequency guidance', () => {
    for (const stringId of ['G3', 'B3', 'E4'] as const) {
      const target = STANDARD_GUITAR_FREQUENCIES.find((item) => item.id === stringId)!;
      const window = HIGH_STRING_DETECTION_WINDOWS.nylon[stringId]!;
      const buffer = createNylonLikeSignal(target.frequency);

      const refined = autocorrelateDetector.detect({
        buffer,
        sampleRate: SAMPLE_RATE,
        options: {
          captureProfile: CAPTURE_PROFILES.estrito,
          searchMinFrequency: window.minFrequency,
          searchMaxFrequency: window.maxFrequency,
          confidenceBias: window.confidenceBonus,
          expectedFrequency: target.frequency,
          expectedToleranceRatio: window.expectedToleranceRatio,
          expectedBonus: window.expectedBonus,
        },
      });

      expect(refined, stringId).not.toBeNull();
      expect(refined!.frequency, stringId).toBeCloseTo(target.frequency, 0);
    }
  });

  it('recovers E4 from an octave-biased signal when expected-frequency guidance is present', () => {
    const target = STANDARD_GUITAR_FREQUENCIES.find((item) => item.id === 'E4')!;
    const window = HIGH_STRING_DETECTION_WINDOWS.nylon.E4!;
    const buffer = createOctaveBiasedSignal(target.frequency);

    const refined = autocorrelateDetector.detect({
      buffer,
      sampleRate: SAMPLE_RATE,
      options: {
        captureProfile: CAPTURE_PROFILES.estrito,
        searchMinFrequency: window.minFrequency,
        searchMaxFrequency: window.maxFrequency,
        confidenceBias: window.confidenceBonus,
        expectedFrequency: target.frequency,
        expectedToleranceRatio: window.expectedToleranceRatio,
        expectedBonus: window.expectedBonus,
      },
    });

    expect(refined).not.toBeNull();
    expect(refined!.frequency).toBeGreaterThan(310);
    expect(refined!.frequency).toBeLessThan(345);
  });

  it('supports voice-like monophonic signals within the expanded range', () => {
    const result = autocorrelateDetector.detect({
      buffer: createVoiceLikeSignal(392),
      sampleRate: SAMPLE_RATE,
      options: {
        captureProfile: CAPTURE_PROFILES.balanceado,
      },
    });

    expect(result).not.toBeNull();
    expect(result!.frequency).toBeGreaterThan(380);
    expect(result!.frequency).toBeLessThan(404);
  });
});
