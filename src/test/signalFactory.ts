export const SAMPLE_RATE = 44100;
export const FRAME_SIZE = 4096;

type SignalOptions = {
  amplitude?: number;
  phase?: number;
};

export function createSineWave(frequency: number, options: SignalOptions = {}) {
  const amplitude = options.amplitude ?? 0.7;
  const phase = options.phase ?? 0;
  const buffer = new Float32Array(FRAME_SIZE);

  for (let index = 0; index < FRAME_SIZE; index += 1) {
    buffer[index] = Math.sin((2 * Math.PI * frequency * index) / SAMPLE_RATE + phase) * amplitude;
  }

  return buffer;
}

export function createHarmonicSignal(frequency: number) {
  const buffer = new Float32Array(FRAME_SIZE);

  for (let index = 0; index < FRAME_SIZE; index += 1) {
    const time = index / SAMPLE_RATE;
    const fundamental = Math.sin(2 * Math.PI * frequency * time) * 0.58;
    const secondHarmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.22;
    const thirdHarmonic = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.1;
    const fourthHarmonic = Math.sin(2 * Math.PI * frequency * 4 * time) * 0.05;
    buffer[index] = fundamental + secondHarmonic + thirdHarmonic + fourthHarmonic;
  }

  return buffer;
}

export function createNylonLikeSignal(frequency: number) {
  const buffer = new Float32Array(FRAME_SIZE);

  for (let index = 0; index < FRAME_SIZE; index += 1) {
    const time = index / SAMPLE_RATE;
    const envelope = Math.exp(-time * 5.2);
    const fundamental = Math.sin(2 * Math.PI * frequency * time) * 0.62;
    const secondHarmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.18;
    const thirdHarmonic = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.08;
    buffer[index] = (fundamental + secondHarmonic + thirdHarmonic) * envelope;
  }

  return buffer;
}

export function createOctaveBiasedSignal(frequency: number) {
  const buffer = new Float32Array(FRAME_SIZE);

  for (let index = 0; index < FRAME_SIZE; index += 1) {
    const time = index / SAMPLE_RATE;
    const fundamental = Math.sin(2 * Math.PI * frequency * time) * 0.18;
    const secondHarmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.42;
    const fourthHarmonic = Math.sin(2 * Math.PI * frequency * 4 * time) * 0.2;
    buffer[index] = fundamental + secondHarmonic + fourthHarmonic;
  }

  return buffer;
}

export function createVoiceLikeSignal(frequency: number) {
  const buffer = new Float32Array(FRAME_SIZE);

  for (let index = 0; index < FRAME_SIZE; index += 1) {
    const time = index / SAMPLE_RATE;
    const vibrato = 1 + Math.sin(2 * Math.PI * 5.2 * time) * 0.008;
    const pitch = frequency * vibrato;
    const envelope = 0.75 + Math.sin(2 * Math.PI * 2.4 * time) * 0.08;
    const fundamental = Math.sin(2 * Math.PI * pitch * time) * 0.52;
    const secondFormant = Math.sin(2 * Math.PI * pitch * 2 * time) * 0.17;
    const thirdFormant = Math.sin(2 * Math.PI * pitch * 3 * time) * 0.08;
    buffer[index] = (fundamental + secondFormant + thirdFormant) * envelope;
  }

  return buffer;
}

export function createDcOffsetSignal(frequency: number, offset: number) {
  const buffer = createSineWave(frequency, { amplitude: 0.4 });

  for (let index = 0; index < buffer.length; index += 1) {
    buffer[index] += offset;
  }

  return buffer;
}
