const STORAGE_KEY = 'afinador:pwa-install-dismissed';

export function loadPwaInstallDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function savePwaInstallDismissed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Ignore storage failures.
  }
}
