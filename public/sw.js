// A simple service worker to make your app installable and cache files
const CACHE_NAME = 'securityx-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});