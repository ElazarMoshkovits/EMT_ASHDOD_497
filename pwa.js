(() => {
  if (!('serviceWorker' in navigator)) return;

  // אם כבר הייתה גרסה שמורה, כשגרסה חדשה נכנסת לפעולה טוענים את הדף פעם אחת,
  // כדי שהעדכון יופיע מיד ולא רק בפתיחה הבאה.
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none'
      });

      await registration.update();

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update();
      });
      window.addEventListener('online', () => registration.update());
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  });
})();
