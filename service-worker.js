// Minimal service worker -- mainly here so Chrome on Android recognizes
// this site as an installable app. Also caches the basic page shell so
// it opens instantly even on a flaky connection (booking data itself
// still needs the internet, since it lives in Firestore).

const CACHE_NAME = 'nailxtaytay-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    }).catch(function () {
      // Fine if a file is missing/renamed -- installability doesn't
      // depend on the cache succeeding.
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (name) { return name !== CACHE_NAME; })
             .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Network-first for everything -- always try to get the freshest page
// and data; only fall back to the cached shell if truly offline.
self.addEventListener('fetch', function (event) {

  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );

});
