const CACHE = 'sfy-v1-shell-2';
const ASSETS = [
  '/v1/',
  '/v1/index.html',
  '/v1/styles.css',
  '/v1/credits.css',
  '/v1/app.js',
  '/v1/manifest.json',
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
          keys.filter((key) => key.startsWith('sfy-v1-') && key !== CACHE).map((key) => caches.delete(key)),
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
          .catch(() => caches.match('/v1/index.html')),
    ),
  );
});
