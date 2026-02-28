import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InstallPwaButton } from '@/components/InstallPwaButton';
import { CaptureProfileSelector } from '@/features/tuner/components/CaptureProfileSelector';
import { PitchAlgorithmSelector } from '@/features/tuner/components/PitchAlgorithmSelector';
import { StringTypeSelector } from '@/features/tuner/components/StringTypeSelector';
import type { CaptureProfileId } from '@/shared/types/audio';
import type { Locale } from '@/shared/types/i18n';
import type { PitchDetectorId } from '@/shared/types/pitch';
import type { StringTypeId } from '@/shared/types/tuner';

type TopToolbarProps = {
  appName: string;
  locale: Locale;
  languageLabel: string;
  captureProfileId: CaptureProfileId;
  captureProfileLabel: string;
  pitchDetectorId: PitchDetectorId;
  pitchDetectorLabel: string;
  stringTypeId: StringTypeId;
  stringTypeLabel: string;
  profileNames: Record<CaptureProfileId, string>;
  pitchDetectorNames: Record<PitchDetectorId, string>;
  stringTypeNames: Record<StringTypeId, string>;
  installLabel: string;
  showInstall: boolean;
  onLocaleChange: (locale: Locale) => void;
  onCaptureProfileChange: (profileId: CaptureProfileId) => void;
  onPitchDetectorChange: (pitchDetectorId: PitchDetectorId) => void;
  onStringTypeChange: (stringTypeId: StringTypeId) => void;
  onInstallClick: () => void;
};

export function TopToolbar({
  appName,
  locale,
  languageLabel,
  captureProfileId,
  captureProfileLabel,
  pitchDetectorId,
  pitchDetectorLabel,
  stringTypeId,
  stringTypeLabel,
  profileNames,
  pitchDetectorNames,
  stringTypeNames,
  installLabel,
  showInstall,
  onLocaleChange,
  onCaptureProfileChange,
  onPitchDetectorChange,
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
      <PitchAlgorithmSelector
        onChange={onPitchDetectorChange}
        pitchDetectorId={pitchDetectorId}
        text={{
          label: pitchDetectorLabel,
          stable: pitchDetectorNames['autocorrelate-stable'],
          classic: pitchDetectorNames['autocorrelate-classic'],
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
