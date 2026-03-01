import { GUITAR_STRING_MAP } from '@/shared/constants/tuner';
import type { PitchDetectionResult } from '@/shared/types/audio';
import type { RuntimePitchDetectorId, PitchDetectorId } from '@/shared/types/pitch';
import type { GuitarStringId, TunerMode } from '@/shared/types/tuner';

const AGREEMENT_TOLERANCE_RATIO = 0.035;
const HARMONIC_TOLERANCE_RATIO = 0.06;

type DetectionMap = Partial<Record<RuntimePitchDetectorId, PitchDetectionResult | null>>;

export type DetectionConsensusInput = {
  preferredDetectorId: PitchDetectorId;
  detections: DetectionMap;
  expectedFrequency?: number | null;
  previousFrequency?: number | null;
  mode: TunerMode;
  manualStringId: GuitarStringId;
  referenceStringId: GuitarStringId | null;
  isLikelyMobileSafari: boolean;
};

export type DetectionConsensusResult = {
  detection: PitchDetectionResult | null;
  chosenDetector: RuntimePitchDetectorId | null;
  reason: string;
  harmonicConflict: boolean;
  agreementScore: number;
};

export function resolveDetectionConsensus({
  preferredDetectorId,
  detections,
  expectedFrequency = null,
  previousFrequency = null,
  mode,
  manualStringId,
  referenceStringId,
  isLikelyMobileSafari,
}: DetectionConsensusInput): DetectionConsensusResult {
  const candidates = getActiveCandidates(detections);

  if (candidates.length === 0) {
    return {
      detection: null,
      chosenDetector: null,
      reason: 'no-valid-candidate',
      harmonicConflict: false,
      agreementScore: 0,
    };
  }

  const preferredRuntimeDetectorId =
    preferredDetectorId === 'hybrid' ? null : preferredDetectorId;
  const scoredCandidates = candidates.map((candidate) => ({
    candidate,
    score: scoreCandidate(
      candidate,
      expectedFrequency,
      previousFrequency,
      mode,
      manualStringId,
      referenceStringId,
      preferredRuntimeDetectorId,
      isLikelyMobileSafari,
    ),
  }));
  const sortedCandidates = scoredCandidates.sort((left, right) => right.score - left.score);
  const bestCandidate = sortedCandidates[0]?.candidate ?? null;
  const secondCandidate = sortedCandidates[1]?.candidate ?? null;
  const agreementScore =
    bestCandidate === null || secondCandidate === null
      ? 0
      : getAgreementScore(bestCandidate.frequency, secondCandidate.frequency);
  const harmonicConflict =
    bestCandidate !== null &&
    secondCandidate !== null &&
    isHarmonicConflict(bestCandidate.frequency, secondCandidate.frequency);

  if (bestCandidate === null) {
    return {
      detection: null,
      chosenDetector: null,
      reason: 'no-valid-candidate',
      harmonicConflict: false,
      agreementScore: 0,
    };
  }

  const boostedDetection =
    agreementScore >= 0.6
      ? {
          ...bestCandidate,
          confidence: Math.min(1, bestCandidate.confidence + 0.08 * agreementScore),
          debug: {
            ...bestCandidate.debug,
            consensusScore: agreementScore,
          },
        }
      : bestCandidate;

  return {
    detection: boostedDetection,
    chosenDetector: bestCandidate.detector,
    reason: resolveConsensusReason(
      preferredDetectorId,
      bestCandidate.detector,
      agreementScore,
      harmonicConflict,
      expectedFrequency,
      previousFrequency,
    ),
    harmonicConflict,
    agreementScore,
  };
}

function getActiveCandidates(detections: DetectionMap) {
  return Object.values(detections).filter(
    (candidate): candidate is PitchDetectionResult => candidate !== null && candidate !== undefined,
  );
}

function scoreCandidate(
  candidate: PitchDetectionResult,
  expectedFrequency: number | null,
  previousFrequency: number | null,
  mode: TunerMode,
  manualStringId: GuitarStringId,
  referenceStringId: GuitarStringId | null,
  preferredRuntimeDetectorId: RuntimePitchDetectorId | null,
  isLikelyMobileSafari: boolean,
) {
  let score = candidate.confidence * 0.62;

  if (preferredRuntimeDetectorId === candidate.detector && !isLikelyMobileSafari) {
    score += 0.2;
  }

  if (expectedFrequency !== null) {
    score += getClosenessScore(candidate.frequency, expectedFrequency) * 0.24;
  }

  if (previousFrequency !== null) {
    score += getClosenessScore(candidate.frequency, previousFrequency) * 0.18;
  }

  const referenceFrequency =
    mode === 'manual'
      ? GUITAR_STRING_MAP[manualStringId].frequency
      : referenceStringId !== null
        ? GUITAR_STRING_MAP[referenceStringId].frequency
        : null;

  if (referenceFrequency !== null) {
    score += getClosenessScore(candidate.frequency, referenceFrequency) * 0.16;
  }

  return score;
}

function getAgreementScore(leftFrequency: number, rightFrequency: number) {
  const ratio = getFrequencyRatio(leftFrequency, rightFrequency);

  if (ratio <= 1 + AGREEMENT_TOLERANCE_RATIO) {
    return 1 - (ratio - 1) / AGREEMENT_TOLERANCE_RATIO;
  }

  return 0;
}

function getClosenessScore(candidateFrequency: number, referenceFrequency: number) {
  const ratio = getFrequencyRatio(candidateFrequency, referenceFrequency);
  return Math.max(0, 1 - Math.min(1, (ratio - 1) / 0.24));
}

function getFrequencyRatio(leftFrequency: number, rightFrequency: number) {
  return leftFrequency > rightFrequency
    ? leftFrequency / rightFrequency
    : rightFrequency / leftFrequency;
}

function isHarmonicConflict(leftFrequency: number, rightFrequency: number) {
  const ratio = getFrequencyRatio(leftFrequency, rightFrequency);
  return Math.abs(ratio - 2) <= HARMONIC_TOLERANCE_RATIO;
}

function resolveConsensusReason(
  preferredDetectorId: PitchDetectorId,
  chosenDetector: RuntimePitchDetectorId,
  agreementScore: number,
  harmonicConflict: boolean,
  expectedFrequency: number | null,
  previousFrequency: number | null,
) {
  if (preferredDetectorId !== 'hybrid' && preferredDetectorId === chosenDetector) {
    return `preferred-${chosenDetector}`;
  }

  if (harmonicConflict) {
    return 'harmonic-conflict';
  }

  if (agreementScore >= 0.6) {
    return 'detector-agreement';
  }

  if (preferredDetectorId === 'hybrid') {
    if (expectedFrequency !== null) {
      return 'expected-frequency-bias';
    }

    if (previousFrequency !== null) {
      return 'previous-frequency-bias';
    }
  }

  return `preferred-${chosenDetector}`;
}
