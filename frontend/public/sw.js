// SourceDev Service Worker
const CACHE_NAME = 'sourcedev-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests — no offline caching for now
  event.respondWith(fetch(event.request));
});
