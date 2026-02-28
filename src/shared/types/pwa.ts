export type PwaInstallAvailability = 'unavailable' | 'prompt' | 'manual-ios' | 'installed';

export type PwaInstallState = {
  availability: PwaInstallAvailability;
  canInstall: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
};
