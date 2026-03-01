import type { CaptureProfileConfig, FrameQuality } from '@/shared/types/audio';

export type PreparedAudioFrame = {
  buffer: Float32Array;
  quality: FrameQuality;
};

type AudioFrameProcessingOptions = {
  sampleRate?: number;
  emphasisFrequency?: number | null;
};

export function prepareAudioFrame(
  input: Float32Array,
  profile: Pick<CaptureProfileConfig, 'holdRms' | 'clippingThreshold'>,
  options: AudioFrameProcessingOptions = {},
): PreparedAudioFrame {
  const output = Float32Array.from(input);
  const dcOffset = calculateMean(output);

  for (let index = 0; index < output.length; index += 1) {
    const centered = output[index] - dcOffset;
    output[index] = centered;
  }

  const baseStats = calculateSignalStats(output);
  const adaptiveGain = resolveAdaptiveGain(baseStats.rms, profile.holdRms);
  const gainedBuffer = applyGainWithSoftLimit(output, adaptiveGain);
  const emphasizedBuffer = applyBandEmphasis(
    gainedBuffer,
    options.sampleRate ?? 0,
    options.emphasisFrequency ?? null,
  );
  const processedStats = calculateSignalStats(emphasizedBuffer);
  const normalization = processedStats.peak > 0 ? 1 / processedStats.peak : 1;

  for (let index = 0; index < emphasizedBuffer.length; index += 1) {
    emphasizedBuffer[index] *= normalization;
  }

  return {
    buffer: emphasizedBuffer,
    quality: {
      rms: processedStats.rms,
      peak: processedStats.peak,
      hasClipping: processedStats.peak >= profile.clippingThreshold,
      hasMinimumSignal: processedStats.rms >= profile.holdRms,
      dcOffset,
    },
  };
}

function calculateSignalStats(buffer: Float32Array) {
  let sumSquares = 0;
  let peak = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    const value = buffer[index];
    const absolute = Math.abs(value);
    sumSquares += value * value;

    if (absolute > peak) {
      peak = absolute;
    }
  }

  return {
    rms: Math.sqrt(sumSquares / buffer.length),
    peak,
  };
}

function resolveAdaptiveGain(rms: number, minimumRms: number) {
  if (rms <= 0.0001) {
    return 1;
  }

  const targetRms = Math.max(0.035, minimumRms * 2.8);
  const rawGain = targetRms / rms;

  return Math.min(6, Math.max(1, rawGain));
}

function applyGainWithSoftLimit(buffer: Float32Array, gain: number) {
  if (gain === 1) {
    return Float32Array.from(buffer);
  }

  const output = new Float32Array(buffer.length);

  for (let index = 0; index < buffer.length; index += 1) {
    output[index] = Math.tanh(buffer[index] * gain);
  }

  return output;
}

function applyBandEmphasis(
  buffer: Float32Array,
  sampleRate: number,
  emphasisFrequency: number | null,
) {
  if (sampleRate <= 0 || emphasisFrequency === null) {
    return Float32Array.from(buffer);
  }

  const primaryFrequency = clamp(emphasisFrequency, 70, 360);
  const harmonicFrequency = clamp(primaryFrequency * 2, 120, 520);
  const primaryBand = runBandPassFilter(buffer, sampleRate, primaryFrequency, 1.1);
  const harmonicBand = runBandPassFilter(buffer, sampleRate, harmonicFrequency, 1.6);
  const output = new Float32Array(buffer.length);

  for (let index = 0; index < buffer.length; index += 1) {
    output[index] =
      buffer[index] * 0.72 +
      primaryBand[index] * 0.9 +
      harmonicBand[index] * 0.42;
  }

  return output;
}

function runBandPassFilter(
  buffer: Float32Array,
  sampleRate: number,
  centerFrequency: number,
  q: number,
) {
  const safeFrequency = clamp(centerFrequency, 30, sampleRate * 0.45);
  const omega = (2 * Math.PI * safeFrequency) / sampleRate;
  const alpha = Math.sin(omega) / (2 * q);
  const cosOmega = Math.cos(omega);

  const b0 = alpha;
  const b1 = 0;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * cosOmega;
  const a2 = 1 - alpha;

  const normalizedB0 = b0 / a0;
  const normalizedB1 = b1 / a0;
  const normalizedB2 = b2 / a0;
  const normalizedA1 = a1 / a0;
  const normalizedA2 = a2 / a0;
  const output = new Float32Array(buffer.length);

  let input1 = 0;
  let input2 = 0;
  let output1 = 0;
  let output2 = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    const input0 = buffer[index];
    const output0 =
      normalizedB0 * input0 +
      normalizedB1 * input1 +
      normalizedB2 * input2 -
      normalizedA1 * output1 -
      normalizedA2 * output2;

    output[index] = output0;
    input2 = input1;
    input1 = input0;
    output2 = output1;
    output1 = output0;
  }

  return output;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function calculateMean(buffer: Float32Array) {
  let sum = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index];
  }

  return sum / buffer.length;
}
