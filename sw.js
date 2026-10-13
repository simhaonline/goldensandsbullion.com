/* Golden Sands Bullion Trading L.L.C-FZ - Service Worker */
const CACHE_NAME = 'gs-bullion-v1.0.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest.json',
  './favicon.ico',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/icons/logo.svg',
  './assets/icons/logo-mark.svg',
  './assets/icons/favicon.svg',
  './assets/icons/favicon-16.png',
  './assets/icons/favicon-32.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/images/hero-dubai-skyline.jpg',
  './assets/images/hero-vault-racks.png',
  './assets/images/hero-gold-inspection.png',
  './assets/images/hero-gold-bar-velvet.png',
  './assets/images/credit-suisse-1kg.jpg',
  './assets/images/suhail-alameri-portrait.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some assets failed to precache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate for app resources, cache-first for images
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Ignore browser extensions, non-http schemes
  if (!req.url.startsWith('http')) return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
