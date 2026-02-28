import { InstallPwaButton } from '@/components/InstallPwaButton';

type TopToolbarProps = {
  appName: string;
  installLabel: string;
  settingsLabel: string;
  showInstall: boolean;
  onInstallClick: () => void;
  onSettingsClick: () => void;
};

export function TopToolbar({
  appName,
  installLabel,
  settingsLabel,
  showInstall,
  onInstallClick,
  onSettingsClick,
}: TopToolbarProps) {
  return (
    <section className="top-toolbar" aria-label="App controls">
      <div className="top-toolbar__appbar">
        <div className="top-toolbar__brand">
          <span className="top-toolbar__dot" aria-hidden="true" />
          <strong>{appName}</strong>
        </div>
        {showInstall ? (
          <InstallPwaButton compact onClick={onInstallClick}>
            {installLabel}
          </InstallPwaButton>
        ) : null}
        <button className="toolbar-action" onClick={onSettingsClick} type="button">
          {settingsLabel}
        </button>
      </div>
    </section>
  );
}
