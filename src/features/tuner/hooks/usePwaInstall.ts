import { useEffect, useMemo, useState } from 'react';
import {
  loadPwaInstallDismissed,
  savePwaInstallDismissed,
} from '@/lib/storage/pwaInstall';
import type { PwaInstallState } from '@/shared/types/pwa';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(loadPwaInstallDismissed);

  useEffect(() => {
    const updateInstalled = () => {
      setIsInstalled(isInStandaloneMode());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    updateInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', updateInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', updateInstalled);
    };
  }, []);

  useEffect(() => {
    savePwaInstallDismissed(isDismissed);
  }, [isDismissed]);

  useEffect(() => {
    if (isInstalled) {
      setDeferredPrompt(null);
    }
  }, [isInstalled]);

  const state: PwaInstallState = useMemo(() => {
    if (isInstalled) {
      return {
        availability: 'installed',
        canInstall: false,
        isInstalled: true,
        isDismissed,
      };
    }

    if (deferredPrompt !== null) {
      return {
        availability: 'prompt',
        canInstall: true,
        isInstalled: false,
        isDismissed,
      };
    }

    if (isIos()) {
      return {
        availability: 'manual-ios',
        canInstall: true,
        isInstalled: false,
        isDismissed,
      };
    }

    return {
      availability: 'unavailable',
      canInstall: false,
      isInstalled: false,
      isDismissed,
    };
  }, [deferredPrompt, isDismissed, isInstalled]);

  const promptInstall = async () => {
    if (deferredPrompt === null) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setIsDismissed(true);
      return true;
    }

    return false;
  };

  const dismiss = () => {
    setIsDismissed(true);
  };

  const resetDismiss = () => {
    setIsDismissed(false);
  };

  return {
    ...state,
    promptInstall,
    dismiss,
    resetDismiss,
  };
}
