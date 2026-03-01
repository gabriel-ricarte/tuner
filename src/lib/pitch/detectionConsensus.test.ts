import { describe, expect, it } from 'vitest';
import { resolveDetectionConsensus } from '@/lib/pitch/detectionConsensus';
import type { PitchDetectionResult } from '@/shared/types/audio';

function createDetection(
  detector: PitchDetectionResult['detector'],
  frequency: number,
  confidence: number,
): PitchDetectionResult {
  return {
    detector,
    frequency,
    confidence,
  };
}

describe('resolveDetectionConsensus', () => {
  it('boosts confidence when aubio and autocorrelation agree closely', () => {
    const result = resolveDetectionConsensus({
      preferredDetectorId: 'hybrid',
      detections: {
        'autocorrelate-stable': createDetection('autocorrelate-stable', 110.2, 0.82),
        'aubio-default': createDetection('aubio-default', 109.8, 0.8),
      },
      expectedFrequency: 110,
      previousFrequency: 109.9,
      mode: 'auto',
      manualStringId: 'A2',
      referenceStringId: 'A2',
      isLikelyMobileSafari: true,
    });

    expect(result.detection).not.toBeNull();
    expect(result.reason).toBe('detector-agreement');
    expect(result.agreementScore).toBeGreaterThan(0.6);
    expect(result.detection!.confidence).toBeGreaterThan(0.82);
  });

  it('prefers the manual reference when candidates are in harmonic conflict', () => {
    const result = resolveDetectionConsensus({
      preferredDetectorId: 'hybrid',
      detections: {
        'autocorrelate-stable': createDetection('autocorrelate-stable', 164.82, 0.9),
        'aubio-default': createDetection('aubio-default', 82.41, 0.78),
      },
      expectedFrequency: 82.41,
      previousFrequency: 82.5,
      mode: 'manual',
      manualStringId: 'E2',
      referenceStringId: 'E2',
      isLikelyMobileSafari: true,
    });

    expect(result.harmonicConflict).toBe(true);
    expect(result.detection?.frequency).toBeCloseTo(82.41, 2);
    expect(result.chosenDetector).toBe('aubio-default');
  });

  it('keeps the explicit stable detector preference outside hybrid and Safari', () => {
    const result = resolveDetectionConsensus({
      preferredDetectorId: 'autocorrelate-stable',
      detections: {
        'autocorrelate-stable': createDetection('autocorrelate-stable', 196, 0.76),
        'autocorrelate-classic': createDetection('autocorrelate-classic', 194.8, 0.82),
      },
      expectedFrequency: 196,
      previousFrequency: 196.1,
      mode: 'auto',
      manualStringId: 'G3',
      referenceStringId: 'G3',
      isLikelyMobileSafari: false,
    });

    expect(result.chosenDetector).toBe('autocorrelate-stable');
    expect(result.reason).toContain('preferred');
  });
});
