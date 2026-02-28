import type { Locale } from '@/shared/types/i18n';

const STORAGE_KEY = 'afinador:locale';

export function loadLocalePreference(): Locale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);

    if (value === 'en' || value === 'pt' || value === 'es') {
      return value;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveLocalePreference(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures.
  }
}
