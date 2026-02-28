import type { Locale } from '@/shared/types/i18n';
import { translations } from '@/lib/i18n/translations';

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  onChange: (locale: Locale) => void;
};

const LOCALES: Locale[] = ['en', 'pt', 'es'];

export function LanguageSwitcher({ locale, label, onChange }: LanguageSwitcherProps) {
  return (
    <section className="toolbar-group toolbar-group--language">
      <span className="toolbar-label toolbar-label--sr">{label}</span>
      <div className="toolbar-toggle" role="tablist" aria-label={label}>
        {LOCALES.map((item) => (
          <button
            key={item}
            className={item === locale ? 'is-active' : ''}
            onClick={() => onChange(item)}
            type="button"
          >
            {translations[item].languageShort}
          </button>
        ))}
      </div>
    </section>
  );
}
