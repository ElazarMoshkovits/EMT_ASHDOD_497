(() => {
  // ---- כפתור התקנה: מופיע רק כשהאתר פתוח בדפדפן ועוד לא הותקן ----
  const HIDE_KEY = 'installBannerHiddenUntil';
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  let deferredPrompt = null;

  const isInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    navigator.standalone === true;

  const hiddenByUser = () => {
    try { return Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now(); } catch (e) { return false; }
  };

  function removeBanner() {
    const el = document.getElementById('install-banner');
    if (el) el.remove();
  }

  function showHelp() {
    const steps = isIOS
      ? '<ol><li>לוחצים על כפתור השיתוף <b>⬆︎</b> בתחתית Safari.</li><li>גוללים ובוחרים <b>״הוספה למסך הבית״</b>.</li><li>לוחצים <b>״הוספה״</b>.</li></ol><p class="c-note">בכרום באייפון: כפתור השיתוף נמצא בשורת הכתובת.</p>'
      : '<ol><li>פותחים את תפריט הדפדפן <b>⋮</b>.</li><li>בוחרים <b>״התקנת אפליקציה״</b> או <b>״הוספה למסך הבית״</b>.</li><li>מאשרים.</li></ol>';
    const html = `<div class="big-emoji" aria-hidden="true">📲</div><h2>התקנה על הטלפון</h2><p>האפליקציה תופיע במסך הבית ותעבוד גם בלי אינטרנט.</p><div class="install-steps">${steps}</div><div class="c-actions"><button class="c-btn primary" type="button" data-close>הבנתי</button></div>`;
    if (window.Course && Course.openModal) Course.openModal(html, { label: 'התקנה על הטלפון' });
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) {}
      deferredPrompt = null;
      if (isInstalled()) removeBanner();
      return;
    }
    showHelp();
  }

  function renderBanner() {
    if (isInstalled() || hiddenByUser()) { removeBanner(); return; }
    // בלי אפשרות התקנה ישירה, מציגים רק בטלפון, שם אפשר להסביר איך מתקינים
    if (!deferredPrompt && !isIOS && !isAndroid) return;
    if (document.getElementById('install-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'install-banner';
    bar.className = 'install-banner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'התקנת האפליקציה');
    bar.innerHTML = '<span class="install-text"><b>להתקין את האפליקציה?</b><small>גישה מהירה ממסך הבית, גם בלי אינטרנט</small></span><button class="c-btn primary small" type="button" data-install>📲 התקנה</button><button class="install-close" type="button" data-install-close aria-label="לא עכשיו">✕</button>';
    document.body.prepend(bar);
    bar.querySelector('[data-install]').onclick = install;
    bar.querySelector('[data-install-close]').onclick = () => {
      try { localStorage.setItem(HIDE_KEY, String(Date.now() + WEEK)); } catch (e) {}
      removeBanner();
    };
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    removeBanner();
    renderBanner();
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; removeBanner(); });
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', renderBanner);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderBanner);
  else renderBanner();

  // ---- service worker ----
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
