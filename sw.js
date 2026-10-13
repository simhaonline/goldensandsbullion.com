/* Golden Sands Bullion Trading L.L.C-FZ - Service Worker v2.0.0 */
const CACHE_NAME = 'gs-bullion-v2.0.0';
const STATIC_CACHE = 'gs-static-v2.0.0';
const IMAGE_CACHE = 'gs-images-v2.0.0';
const API_CACHE = 'gs-api-v2.0.0';

// Precached critical app shell assets
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
  './assets/icons/favicon-32.png',
  './assets/icons/icon-192.png'
];

// Install Event - Precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some shell assets failed to precache:', err);
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
          if (name !== STATIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Determine cache strategy based on request
function getCacheStrategy(req) {
  const url = new URL(req.url);
  
  // API calls - Network First with short cache
  if (url.pathname.includes('api.') || url.pathname.includes('gold-api.com') || 
      url.pathname.includes('binance.com') || url.pathname.includes('coingecko.com')) {
    return 'network-first';
  }
  
  // Images - Stale While Revalidate with long cache
  if (req.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
    return 'stale-while-revalidate';
  }
  
  // Styles & Scripts - Cache First
  if (req.destination === 'style' || req.destination === 'script' || 
      url.pathname.match(/\.(css|js)$/i)) {
    return 'cache-first';
  }
  
  // HTML/Navigation - Network First with offline fallback
  if (req.mode === 'navigate' || req.destination === 'document') {
    return 'network-first';
  }
  
  // Fonts - Cache First (long cache)
  if (req.destination === 'font' || url.pathname.match(/\.(woff2?)$/i)) {
    return 'cache-first';
  }
  
  // Default: Stale While Revalidate
  return 'stale-while-revalidate';
}

// Cache First Strategy
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(req);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(req, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network First Strategy
async function networkFirst(req, cacheName, offlineFallback = null) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(req);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(req, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cachedResponse = await cache.match(req);
    if (cachedResponse) return cachedResponse;
    
    if (offlineFallback) {
      return caches.match(offlineFallback);
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);
  
  const fetchPromise = fetch(req).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(req, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Skip non-GET requests
  if (req.method !== 'GET') return;
  
  // Skip non-HTTP(S) requests
  if (!req.url.startsWith('http')) return;
  
  const strategy = getCacheStrategy(req);
  const isImage = req.destination === 'image' || req.url.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i);
  const isApi = req.url.includes('api.') || req.url.includes('gold-api.com') || 
                req.url.includes('binance.com') || req.url.includes('coingecko.com');
  const cacheName = isImage ? IMAGE_CACHE : (isApi ? API_CACHE : STATIC_CACHE);
  
  let responsePromise;
  
  switch (strategy) {
    case 'cache-first':
      responsePromise = cacheFirst(req, cacheName);
      break;
    case 'network-first':
      responsePromise = networkFirst(req, cacheName, req.mode === 'navigate' ? './index.html' : null);
      break;
    case 'stale-while-revalidate':
    default:
      responsePromise = staleWhileRevalidate(req, cacheName);
      break;
  }
  
  event.respondWith(responsePromise);
});

// Background Sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  // Implement form submission sync when back online
  console.log('Background sync: Contact form submission');
}

// Push Notification Support (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'bullion-alert',
        data: { url: data.url || './' }
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});