const CACHE_NAME = 'hms-static-v3';
const STATIC_ASSETS = [
  './',
  'index.html',
  'login.html',
  'owner-dashboard.html',
  'receptionist-dashboard.html',
  'student-dashboard.html',
  'styles.css',
  'script.js',
  'assets/vendor/qrcode.min.js',
  'logo.png',
  'manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

   const url = new URL(request.url);
   const sameOrigin = url.origin === self.location.origin;
   const isNavigation = request.mode === 'navigate' || request.destination === 'document';
   const isDynamicAsset = request.destination === 'script' || request.destination === 'style' || request.destination === 'font';

   if (!sameOrigin) {
     return;
   }

   // API calls must always hit the network — never cache, never return login.html fallback.
   // Caching API responses causes stale CSRF tokens and stale session data.
   if (url.pathname.includes('/api/')) {
     return; // Let the browser handle normally (no SW interception)
   }

   if (isNavigation || isDynamicAsset) {
     event.respondWith(
       fetch(request)
         .then((response) => {
           if (response && response.status === 200) {
             const copy = response.clone();
             caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
           }
           return response;
         })
         .catch(() => caches.match(request).then((cached) => cached || caches.match('login.html')))
     );
     return;
   }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('login.html'));
    })
  );
});
