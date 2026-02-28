import { CaptureProfileSelector } from '@/features/tuner/components/CaptureProfileSelector';
import { StringTypeSelector } from '@/features/tuner/components/StringTypeSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { CaptureProfileId } from '@/shared/types/audio';
import type { Locale } from '@/shared/types/i18n';
import type { StringTypeId } from '@/shared/types/tuner';

type SettingsGlassSheetProps = {
  open: boolean;
  title: string;
  closeLabel: string;
  locale: Locale;
  languageLabel: string;
  stringTypeId: StringTypeId;
  stringTypeLabel: string;
  captureProfileId: CaptureProfileId;
  captureProfileLabel: string;
  stringTypeNames: Record<StringTypeId, string>;
  profileNames: Record<CaptureProfileId, string>;
  onClose: () => void;
  onLocaleChange: (locale: Locale) => void;
  onStringTypeChange: (stringTypeId: StringTypeId) => void;
  onCaptureProfileChange: (profileId: CaptureProfileId) => void;
};

export function SettingsGlassSheet({
  open,
  title,
  closeLabel,
  locale,
  languageLabel,
  stringTypeId,
  stringTypeLabel,
  captureProfileId,
  captureProfileLabel,
  stringTypeNames,
  profileNames,
  onClose,
  onLocaleChange,
  onStringTypeChange,
  onCaptureProfileChange,
}: SettingsGlassSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="glass-sheet-backdrop" onClick={onClose} role="presentation">
      <section
        aria-label={title}
        className="glass-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="glass-sheet__handle" aria-hidden="true" />
        <div className="glass-sheet__header">
          <strong>{title}</strong>
          <button className="glass-sheet__close" onClick={onClose} type="button">
            {closeLabel}
          </button>
        </div>
        <div className="glass-sheet__content">
          <LanguageSwitcher label={languageLabel} locale={locale} onChange={onLocaleChange} />
          <StringTypeSelector
            onChange={onStringTypeChange}
            stringTypeId={stringTypeId}
            text={{
              label: stringTypeLabel,
              steel: stringTypeNames.steel,
              nylon: stringTypeNames.nylon,
            }}
          />
          <CaptureProfileSelector
            onChange={onCaptureProfileChange}
            profileId={captureProfileId}
            text={{
              label: captureProfileLabel,
              profiles: profileNames,
            }}
          />
        </div>
      </section>
    </div>
  );
}
