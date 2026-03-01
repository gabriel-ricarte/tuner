export type AudioCaptureEnvironment = {
  isAppleMobile: boolean;
  isLikelyMobileSafari: boolean;
};

export function getAudioCaptureEnvironment(): AudioCaptureEnvironment {
  if (typeof navigator === 'undefined') {
    return {
      isAppleMobile: false,
      isLikelyMobileSafari: false,
    };
  }

  const userAgent = navigator.userAgent ?? '';
  const isAppleMobileUserAgent = /iPhone|iPad|iPod/i.test(userAgent);
  const isIpadDesktopMode =
    navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number'
      ? navigator.maxTouchPoints > 1
      : false;
  const isAppleMobile = isAppleMobileUserAgent || isIpadDesktopMode;
  const isWebKitBrowser =
    /AppleWebKit/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);

  return {
    isAppleMobile,
    isLikelyMobileSafari: isAppleMobile && isWebKitBrowser,
  };
}
