const CACHE_NAME = 'tictactoe-precache-v1';
const PRECACHE_URLS = [
  './index.html',
  './style.css',
  './css/style.css',
  './js/ui/status.js',
  './js/ui/settings.js',
  './js/ai/minimax.js',
  './favicon.ico',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const request = new Request(url, { cache: 'reload' });
            const response = await fetch(request);
            if (!response.ok) {
              throw new Error(`Request for ${url} failed with status ${response.status}`);
            }
            await cache.put(request, response);
          } catch (error) {
            console.warn('Skipping precache for', url, error);
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestURL = new URL(event.request.url);
  if (requestURL.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('./index.html');
          if (fallback) {
            return fallback;
          }
        }
        throw error;
      }
    })()
  );
});
