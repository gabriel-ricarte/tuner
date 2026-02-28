import type { PitchDetectionResult } from '@/shared/types/audio';
import type { PitchDetector, PitchDetectorOptions } from '@/lib/pitch/detectors/types';

type CorrelationResult = {
  correlation: number;
  period: number;
};

const MIN_FREQUENCY = 70;
const MAX_FREQUENCY = 420;
const MIN_CORRELATION = 0.78;

export const autocorrelateClassicDetector: PitchDetector = {
  id: 'autocorrelate-classic',
  detect: ({ buffer, sampleRate, options }) => detectClassicAutocorrelate(buffer, sampleRate, options),
};

function detectClassicAutocorrelate(
  buffer: Float32Array,
  sampleRate: number,
  options?: PitchDetectorOptions,
): PitchDetectionResult | null {
  if (options?.frameQuality) {
    if (!options.frameQuality.hasMinimumSignal || options.frameQuality.hasClipping) {
      return null;
    }
  }

  const rms = options?.frameQuality?.rms ?? calculateRms(buffer);

  if (rms < 0.01) {
    return null;
  }

  const minFrequency = options?.searchMinFrequency ?? MIN_FREQUENCY;
  const maxFrequency = options?.searchMaxFrequency ?? MAX_FREQUENCY;
  const minPeriod = Math.floor(sampleRate / maxFrequency);
  const maxPeriod = Math.floor(sampleRate / minFrequency);
  let best: CorrelationResult | null = null;

  for (let period = minPeriod; period <= maxPeriod; period += 1) {
    let difference = 0;

    for (let index = 0; index < maxPeriod; index += 1) {
      difference += Math.abs(buffer[index] - buffer[index + period]);
    }

    const correlation = 1 - difference / maxPeriod;

    if (best === null || correlation > best.correlation) {
      best = { correlation, period };
    }
  }

  if (best === null || best.correlation < MIN_CORRELATION) {
    return null;
  }

  const refinedPeriod = refinePeak(buffer, best.period);

  if (refinedPeriod <= 0) {
    return null;
  }

  const frequency = sampleRate / refinedPeriod;
  let confidence = Math.max(
    0,
    Math.min(1, (best.correlation - MIN_CORRELATION) / (1 - MIN_CORRELATION)),
  );

  confidence = Math.max(0, Math.min(1, confidence + (options?.confidenceBias ?? 0)));

  if (options?.expectedFrequency) {
    const distanceRatio = Math.abs(frequency - options.expectedFrequency) / options.expectedFrequency;
    const toleranceRatio = options.expectedToleranceRatio ?? 0.18;

    if (distanceRatio <= toleranceRatio) {
      confidence = Math.min(1, confidence + (options.expectedBonus ?? 0.06));
    } else if (distanceRatio > toleranceRatio * 1.8) {
      confidence *= 0.55;
    }
  }

  if (options?.previousFrequency) {
    const ratio =
      frequency > options.previousFrequency
        ? frequency / options.previousFrequency
        : options.previousFrequency / frequency;

    if (ratio > (options.captureProfile?.maxFrequencyJumpRatio ?? 1.38)) {
      confidence *= 0.45;
    } else if (ratio < 1.08) {
      confidence = Math.min(1, confidence + 0.08);
    }
  }

  return {
    frequency,
    confidence,
  };
}

function calculateRms(buffer: Float32Array) {
  let sumSquares = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    const value = buffer[index];
    sumSquares += value * value;
  }

  return Math.sqrt(sumSquares / buffer.length);
}

function refinePeak(buffer: Float32Array, period: number) {
  const prev = correlationAtOffset(buffer, period - 1);
  const current = correlationAtOffset(buffer, period);
  const next = correlationAtOffset(buffer, period + 1);
  const divisor = prev - 2 * current + next;

  if (divisor === 0) {
    return period;
  }

  const shift = (prev - next) / (2 * divisor);
  return period + shift;
}

function correlationAtOffset(buffer: Float32Array, offset: number) {
  if (offset <= 0 || offset >= buffer.length - 1) {
    return 0;
  }

  let sum = 0;
  let energyA = 0;
  let energyB = 0;
  const limit = buffer.length - offset;

  for (let index = 0; index < limit; index += 1) {
    const left = buffer[index];
    const right = buffer[index + offset];
    sum += left * right;
    energyA += left * left;
    energyB += right * right;
  }

  if (energyA === 0 || energyB === 0) {
    return 0;
  }

  return sum / Math.sqrt(energyA * energyB);
}
