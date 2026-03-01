import type aubioFactory from 'aubiojs';
import type { PitchDetectionResult } from '@/shared/types/audio';
import type { PitchDetector, PitchDetectorOptions } from '@/lib/pitch/detectors/types';

const AUBIO_BUFFER_SIZE = 4096;
const AUBIO_HOP_SIZE = 2048;
const MIN_AUBIO_FREQUENCY = 55;
const MAX_AUBIO_FREQUENCY = 660;
const DEFAULT_AUBIO_CONFIDENCE = 0.8;

type AubioModule = Awaited<ReturnType<typeof aubioFactory>>;

type AubioPitchInstance = InstanceType<AubioModule['Pitch']>;

let aubioModulePromise: Promise<AubioModule | null> | null = null;
const aubioPitchCache = new Map<number, AubioPitchInstance>();

export function primeAubioPitchDetector(sampleRate: number) {
  void getAubioPitchInstance(sampleRate);
}

export function detectPitchAubio(
  buffer: Float32Array,
  sampleRate: number,
  options?: PitchDetectorOptions,
): PitchDetectionResult | null {
  const pitchDetector = aubioPitchCache.get(sampleRate);

  if (pitchDetector === undefined) {
    void getAubioPitchInstance(sampleRate);
    return null;
  }

  try {
    const aubioBuffer = toAubioInputBuffer(buffer);
    const frequency = pitchDetector.do(aubioBuffer);

    if (!isFiniteFrequency(frequency)) {
      return null;
    }

    return {
      frequency,
      confidence: resolveAubioConfidence(frequency, options),
      detector: 'aubio-default',
      debug: {
        bufferSize: AUBIO_BUFFER_SIZE,
        hopSize: AUBIO_HOP_SIZE,
        sampleRate,
      },
    };
  } catch {
    return null;
  }
}

export const aubioPitchDetector: PitchDetector = {
  id: 'aubio-default',
  detect: ({ buffer, sampleRate, options }) => detectPitchAubio(buffer, sampleRate, options),
};

async function getAubioPitchInstance(sampleRate: number) {
  const cachedPitch = aubioPitchCache.get(sampleRate);

  if (cachedPitch !== undefined) {
    return cachedPitch;
  }

  const aubioModule = await getAubioModule();

  if (aubioModule === null) {
    return null;
  }

  try {
    const pitch = new aubioModule.Pitch('yinfft', AUBIO_BUFFER_SIZE, AUBIO_HOP_SIZE, sampleRate);
    aubioPitchCache.set(sampleRate, pitch);
    return pitch;
  } catch {
    return null;
  }
}

async function getAubioModule() {
  if (aubioModulePromise !== null) {
    return aubioModulePromise;
  }

  aubioModulePromise = import('aubiojs/build/aubio.esm.js')
    .then((module) => (module.default as typeof aubioFactory)())
    .catch(() => null);

  return aubioModulePromise;
}

function toAubioInputBuffer(buffer: Float32Array) {
  if (buffer.length === AUBIO_HOP_SIZE) {
    return buffer;
  }

  if (buffer.length > AUBIO_HOP_SIZE) {
    return buffer.subarray(buffer.length - AUBIO_HOP_SIZE);
  }

  const padded = new Float32Array(AUBIO_HOP_SIZE);
  padded.set(buffer, AUBIO_HOP_SIZE - buffer.length);
  return padded;
}

function isFiniteFrequency(frequency: number) {
  return Number.isFinite(frequency) && frequency > 0 && frequency >= MIN_AUBIO_FREQUENCY && frequency <= MAX_AUBIO_FREQUENCY;
}

function resolveAubioConfidence(
  frequency: number,
  options?: PitchDetectorOptions,
) {
  let confidence = DEFAULT_AUBIO_CONFIDENCE;

  if (options?.frameQuality) {
    confidence += Math.min(0.08, options.frameQuality.rms * 1.2);

    if (options.frameQuality.hasClipping) {
      confidence *= 0.7;
    }
  }

  if (options?.expectedFrequency) {
    const distanceRatio = Math.abs(frequency - options.expectedFrequency) / options.expectedFrequency;
    const toleranceRatio = options.expectedToleranceRatio ?? 0.18;

    if (distanceRatio <= toleranceRatio) {
      confidence += options.expectedBonus ?? 0.08;
    } else if (distanceRatio > toleranceRatio * 1.8) {
      confidence *= 0.58;
    }
  }

  if (options?.previousFrequency) {
    const ratio =
      frequency > options.previousFrequency
        ? frequency / options.previousFrequency
        : options.previousFrequency / frequency;

    if (ratio > (options.captureProfile?.maxFrequencyJumpRatio ?? 1.38)) {
      confidence *= 0.55;
    } else if (ratio < 1.08) {
      confidence += 0.06;
    }
  }

  confidence += options?.confidenceBias ?? 0;

  return Math.max(0, Math.min(1, confidence));
}
