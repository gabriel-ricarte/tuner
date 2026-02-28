import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InstallPwaButton } from '@/components/InstallPwaButton';
import { CaptureProfileSelector } from '@/features/tuner/components/CaptureProfileSelector';
import { StringTypeSelector } from '@/features/tuner/components/StringTypeSelector';
import type { CaptureProfileId } from '@/shared/types/audio';
import type { Locale } from '@/shared/types/i18n';
import type { StringTypeId } from '@/shared/types/tuner';

type TopToolbarProps = {
  appName: string;
  locale: Locale;
  languageLabel: string;
  captureProfileId: CaptureProfileId;
  captureProfileLabel: string;
  stringTypeId: StringTypeId;
  stringTypeLabel: string;
  profileNames: Record<CaptureProfileId, string>;
  stringTypeNames: Record<StringTypeId, string>;
  installLabel: string;
  showInstall: boolean;
  onLocaleChange: (locale: Locale) => void;
  onCaptureProfileChange: (profileId: CaptureProfileId) => void;
  onStringTypeChange: (stringTypeId: StringTypeId) => void;
  onInstallClick: () => void;
};

export function TopToolbar({
  appName,
  locale,
  languageLabel,
  captureProfileId,
  captureProfileLabel,
  stringTypeId,
  stringTypeLabel,
  profileNames,
  stringTypeNames,
  installLabel,
  showInstall,
  onLocaleChange,
  onCaptureProfileChange,
  onStringTypeChange,
  onInstallClick,
}: TopToolbarProps) {
  return (
    <section className="top-toolbar" aria-label="App controls">
      <div className="top-toolbar__appbar">
        <div className="top-toolbar__brand">
          <span className="top-toolbar__eyebrow">PWA</span>
          <strong>{appName}</strong>
        </div>
        {showInstall ? (
          <InstallPwaButton compact onClick={onInstallClick}>
            {installLabel}
          </InstallPwaButton>
        ) : null}
      </div>
      <div className="top-toolbar__row">
        <LanguageSwitcher label={languageLabel} locale={locale} onChange={onLocaleChange} />
      </div>
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
    </section>
  );
}
