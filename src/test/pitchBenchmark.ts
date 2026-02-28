import type { PitchDetector } from '@/lib/pitch/detectors/types';
import type { PitchDetectionResult } from '@/shared/types/audio';

export type PitchBenchmarkCase = {
  id: string;
  buffer: Float32Array;
  sampleRate: number;
  expectedFrequency: number;
  minimumConfidence?: number;
  maximumFrequencyError?: number;
};

export type PitchBenchmarkResult = {
  id: string;
  passed: boolean;
  detection: PitchDetectionResult | null;
  frequencyError: number | null;
};

export function runPitchBenchmark(
  detector: PitchDetector,
  cases: PitchBenchmarkCase[],
): PitchBenchmarkResult[] {
  return cases.map((benchmarkCase) => {
    const detection = detector.detect({
      buffer: benchmarkCase.buffer,
      sampleRate: benchmarkCase.sampleRate,
    });

    if (detection === null) {
      return {
        id: benchmarkCase.id,
        passed: false,
        detection: null,
        frequencyError: null,
      };
    }

    const frequencyError = Math.abs(detection.frequency - benchmarkCase.expectedFrequency);
    const withinError = frequencyError <= (benchmarkCase.maximumFrequencyError ?? 1.5);
    const withinConfidence =
      benchmarkCase.minimumConfidence === undefined ||
      detection.confidence >= benchmarkCase.minimumConfidence;

    return {
      id: benchmarkCase.id,
      passed: withinError && withinConfidence,
      detection,
      frequencyError,
    };
  });
}
