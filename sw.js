const CACHE_NAME = 'tala-pwa-cache-v6';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './i18n.js',
  './supabase-config.js',
  './manifest.json',
  './images/logo.png',
  './images/hero-bg.png',
  './images/logo.pwa.jpeg'
];

// Install Service Worker and cache initial resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ServiceWorker: Caching essential assets');
        // We use a safe wrapper to ensure one missing file doesn't break everything
        return Promise.allSettled(urlsToCache.map(url => cache.add(url)));
      })
  );
  self.skipWaiting();
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch resources - Network First strategy (Always get latest if online)
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Make sure we got a valid response before caching
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response to put in cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response; // Return the fresh network response
      })
      .catch(() => {
        // If network fetch fails (user is offline), try the cache
        return caches.match(event.request);
      })
  );
});
