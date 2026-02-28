import type { TunerPreferences } from '@/shared/types/tuner';

const STORAGE_KEY = 'afinador:tuner-preferences';

export function loadTunerPreferences(): Partial<TunerPreferences> {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    return JSON.parse(rawValue) as Partial<TunerPreferences>;
  } catch {
    return {};
  }
}

export function saveTunerPreferences(preferences: TunerPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage failures.
  }
}
