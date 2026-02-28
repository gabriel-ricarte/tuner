import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InstallPwaButton } from '@/components/InstallPwaButton';
import { CaptureProfileSelector } from '@/features/tuner/components/CaptureProfileSelector';
import type { CaptureProfileId } from '@/shared/types/audio';
import type { Locale } from '@/shared/types/i18n';

type TopToolbarProps = {
  appName: string;
  locale: Locale;
  languageLabel: string;
  captureProfileId: CaptureProfileId;
  captureProfileLabel: string;
  profileNames: Record<CaptureProfileId, string>;
  installLabel: string;
  showInstall: boolean;
  onLocaleChange: (locale: Locale) => void;
  onCaptureProfileChange: (profileId: CaptureProfileId) => void;
  onInstallClick: () => void;
};

export function TopToolbar({
  appName,
  locale,
  languageLabel,
  captureProfileId,
  captureProfileLabel,
  profileNames,
  installLabel,
  showInstall,
  onLocaleChange,
  onCaptureProfileChange,
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
