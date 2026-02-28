import type { GuitarString, StringTypeId } from '@/shared/types/tuner';

export const GUITAR_STRINGS: GuitarString[] = [
  { id: 'E2', label: 'E2', midi: 40, frequency: 82.41 },
  { id: 'A2', label: 'A2', midi: 45, frequency: 110.0 },
  { id: 'D3', label: 'D3', midi: 50, frequency: 146.83 },
  { id: 'G3', label: 'G3', midi: 55, frequency: 196.0 },
  { id: 'B3', label: 'B3', midi: 59, frequency: 246.94 },
  { id: 'E4', label: 'E4', midi: 64, frequency: 329.63 }
];

export const GUITAR_STRING_MAP = Object.fromEntries(
  GUITAR_STRINGS.map((stringItem) => [stringItem.id, stringItem]),
) as Record<GuitarString['id'], GuitarString>;

export const DEFAULT_TARGET_STRING_ID: GuitarString['id'] = 'E2';
export const DEFAULT_STRING_TYPE_ID: StringTypeId = 'steel';

export const HIGH_GUITAR_STRING_IDS: GuitarString['id'][] = ['G3', 'B3', 'E4'];

type HighStringDetectionWindow = {
  minFrequency: number;
  maxFrequency: number;
  confidenceBonus: number;
  expectedToleranceRatio: number;
  expectedBonus: number;
};

export const HIGH_STRING_DETECTION_WINDOWS: Record<
  StringTypeId,
  Partial<Record<GuitarString['id'], HighStringDetectionWindow>>
> = {
  steel: {
    G3: {
      minFrequency: 182,
      maxFrequency: 212,
      confidenceBonus: 0.04,
      expectedToleranceRatio: 0.14,
      expectedBonus: 0.06,
    },
    B3: {
      minFrequency: 224,
      maxFrequency: 274,
      confidenceBonus: 0.06,
      expectedToleranceRatio: 0.12,
      expectedBonus: 0.08,
    },
    E4: {
      minFrequency: 300,
      maxFrequency: 355,
      confidenceBonus: 0.08,
      expectedToleranceRatio: 0.1,
      expectedBonus: 0.1,
    },
  },
  nylon: {
    G3: {
      minFrequency: 180,
      maxFrequency: 214,
      confidenceBonus: 0.05,
      expectedToleranceRatio: 0.16,
      expectedBonus: 0.08,
    },
    B3: {
      minFrequency: 220,
      maxFrequency: 278,
      confidenceBonus: 0.07,
      expectedToleranceRatio: 0.15,
      expectedBonus: 0.1,
    },
    E4: {
      minFrequency: 296,
      maxFrequency: 360,
      confidenceBonus: 0.09,
      expectedToleranceRatio: 0.13,
      expectedBonus: 0.12,
    },
  },
};
