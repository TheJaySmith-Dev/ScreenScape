const CACHE_NAME = 'screenscape-cache-v2'; // Bump version to trigger reinstall
const APP_SHELL_URL = '/index.html';
const urlsToCache = [
  '/',
  APP_SHELL_URL,
  '/index.tsx',
  '/favicon.svg',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0-rc.0',
  'https://esm.sh/react-dom@19.0.0-rc.0/client'
];

// URLs for external APIs that should not be cached.
const API_HOSTS = [
    'api.themoviedb.org',
    'ipinfo.io',
    'www.omdbapi.com',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW installing: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW activating: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network-only for API calls
  if (API_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(fetch(request));
    return;
  }
  
  // For navigation requests, serve the app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(APP_SHELL_URL).then(response => {
        return response || fetch(APP_SHELL_URL);
      })
    );
    return;
  }

  // For all other requests (assets), use a cache-first strategy.
  event.respondWith(
    caches.match(request).then(response => {
      // Return from cache if found
      if (response) {
        return response;
      }
      
      // Otherwise, fetch from network and cache
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});