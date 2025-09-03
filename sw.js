const CACHE_NAME = 'watchnow-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // This is loaded as a module
  '/favicon.svg',
  '/manifest.json',
  // Key CDN assets from importmap and script tags
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0-rc.0',
  'https://esm.sh/react-dom@19.0.0-rc.0/client'
];

// URLs for external APIs that should not be cached.
const API_HOSTS = [
    'api.themoviedb.org',
    'ipinfo.io',
    'www.omdbapi.com'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
          console.error('Failed to cache initial assets:', err);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // If it's an API request, always fetch from network.
  if (API_HOSTS.includes(requestUrl.hostname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For other requests, use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, go to network.
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
