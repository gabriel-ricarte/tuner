import { useEffect, useMemo, useState } from 'react';
import { loadLocalePreference, saveLocalePreference } from '@/lib/storage/locale';
import { translations } from '@/lib/i18n/translations';
import type { Locale } from '@/shared/types/i18n';

function detectLocale(): Locale {
  const saved = loadLocalePreference();

  if (saved) {
    return saved;
  }

  const browserLocale = navigator.language.toLowerCase();

  if (browserLocale.startsWith('pt')) {
    return 'pt';
  }

  if (browserLocale.startsWith('es')) {
    return 'es';
  }

  return 'en';
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    saveLocalePreference(locale);
  }, [locale]);

  const t = useMemo(() => translations[locale], [locale]);

  return {
    locale,
    setLocale,
    t,
  };
}
