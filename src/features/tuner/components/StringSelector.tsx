import { GUITAR_STRINGS } from '@/shared/constants/tuner';
import type { Locale } from '@/shared/types/i18n';
import type { GuitarStringId, TunerMode } from '@/shared/types/tuner';

type StringSelectorText = {
  tuningMode: string;
  targetString: string;
  auto: string;
  manual: string;
};

type StringSelectorProps = {
  mode: TunerMode;
  selectedString: GuitarStringId | null;
  locale: Locale;
  text: StringSelectorText;
  onModeChange: (mode: TunerMode) => void;
  onSelectString: (value: GuitarStringId | null) => void;
};

export function StringSelector({
  mode,
  selectedString,
  locale,
  text,
  onModeChange,
  onSelectString
}: StringSelectorProps) {
  return (
    <section className="panel panel--subtle">
      <div className="mode-toggle mode-toggle--flush" role="tablist" aria-label={text.tuningMode}>
        <button
          className={mode === 'auto' ? 'is-active' : ''}
          onClick={() => onModeChange('auto')}
          type="button"
        >
          {text.auto}
        </button>
        <button
          className={mode === 'manual' ? 'is-active' : ''}
          onClick={() => onModeChange('manual')}
          type="button"
        >
          {text.manual}
        </button>
      </div>

      {mode === 'manual' ? (
        <div className="string-grid" aria-label={text.targetString}>
          {GUITAR_STRINGS.map((stringItem) => {
            const active = selectedString === stringItem.id;
            const buttonLabel =
              locale === 'en'
                ? `${text.targetString}: ${stringItem.label}`
                : `${text.targetString}: ${stringItem.label}`;

            return (
              <button
                key={stringItem.id}
                aria-label={buttonLabel}
                className={`string-chip ${active ? 'is-active' : ''}`}
                onClick={() => onSelectString(stringItem.id)}
                type="button"
              >
                <span>{stringItem.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
