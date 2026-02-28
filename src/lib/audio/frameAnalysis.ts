import type { CaptureProfileConfig, FrameQuality } from '@/shared/types/audio';

export type PreparedAudioFrame = {
  buffer: Float32Array;
  quality: FrameQuality;
};

export function prepareAudioFrame(
  input: Float32Array,
  profile: Pick<CaptureProfileConfig, 'holdRms' | 'clippingThreshold'>,
): PreparedAudioFrame {
  const output = Float32Array.from(input);
  const dcOffset = calculateMean(output);

  let sumSquares = 0;
  let peak = 0;

  for (let index = 0; index < output.length; index += 1) {
    const centered = output[index] - dcOffset;
    output[index] = centered;
    const absolute = Math.abs(centered);
    sumSquares += centered * centered;
    if (absolute > peak) {
      peak = absolute;
    }
  }

  const rms = Math.sqrt(sumSquares / output.length);
  const normalization = peak > 0 ? 1 / peak : 1;

  for (let index = 0; index < output.length; index += 1) {
    output[index] *= normalization;
  }

  return {
    buffer: output,
    quality: {
      rms,
      peak,
      hasClipping: peak >= profile.clippingThreshold,
      hasMinimumSignal: rms >= profile.holdRms,
      dcOffset,
    },
  };
}

function calculateMean(buffer: Float32Array) {
  let sum = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index];
  }

  return sum / buffer.length;
}
