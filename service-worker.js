// Service Worker for Wildlife Immobilization Logger
// Enables offline functionality

const CACHE_NAME = 'immo-app-v2';
const RUNTIME_CACHE = 'immo-runtime-v1';

// Files to cache for offline use
const filesToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/storage.js',
  '/js/ui-manager.js',
  '/js/animal-info.js',
  '/js/drug-dose.js',
  '/js/monitoring.js',
  '/js/recovery.js',
  '/js/morphometry.js',
  '/js/pdf-generator.js',
  '/js/saved-sessions.js',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Install event - cache app shell files
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker caching app shell');
        return cache.addAll(filesToCache);
      })
      .catch(error => {
        console.error('Caching error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: clearing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: serving from cache:', event.request.url);
          return response;
        }
        
        console.log('Service Worker: fetching resource:', event.request.url);
        return fetch(event.request)
          .then(fetchResponse => {
            // Don't cache API calls or other dynamic content
            if (!event.request.url.includes('chrome-extension') && 
                !event.request.url.includes('api') && 
                event.request.method === 'GET') {
              
              // Clone the response before consuming it
              const responseToCache = fetchResponse.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('Service Worker: caching new resource:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }
            return fetchResponse;
          });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        // You could return a custom offline page here
      })
  );
});
