export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (!import.meta.env.PROD) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      void registration.update();
    });
  });
}
