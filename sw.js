const CACHE_VERSION = 'emt-ashdod-497-v36';
const APP_SHELL = [
  './',
  './index.html',
  './review.html',
  './part2-review.html',
  './styles.css',
  './unified.css',
  './common.css',
  './part1.css',
  './part2-review.css',
  './common.js',
  './quiz.js',
  './part1-data.js',
  './part1.js',
  './part2-data.js',
  './part2.js',
  './app.js',
  './engine.js',
  './scenarios.js',
  './additional-scenarios.js',
  './more-scenarios.js',
  './scenario-extras.js',
  './pwa.js',
  './manifest.json',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true })) ||
          (await caches.match('./index.html')) ||
          new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const network = fetch(request)
      .then(async response => {
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    return cached || (await network) ||
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
