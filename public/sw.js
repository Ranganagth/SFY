const CACHE = 'sfy-v2-shell-4';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/v2.css',
  '/app-v2.js',
  '/manifest.json',
  '/icon.svg',
  '/data/bengaluru-water-bodies.json',
];
self.addEventListener('install', (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('sfy-v2-') && key !== CACHE).map((key) => caches.delete(key)),
        ),
      ),
  ),
);
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => caches.match('/index.html')),
    ),
  );
});
