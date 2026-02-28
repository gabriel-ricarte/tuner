import type { GuitarString } from '@/shared/types/tuner';

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

export const THIN_GUITAR_STRING_IDS: GuitarString['id'][] = ['B3', 'E4'];

export const THIN_STRING_DETECTION_WINDOWS: Partial<
  Record<
    GuitarString['id'],
    {
      minFrequency: number;
      maxFrequency: number;
      confidenceBonus: number;
      expectedToleranceRatio: number;
      expectedBonus: number;
    }
  >
> = {
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
};
