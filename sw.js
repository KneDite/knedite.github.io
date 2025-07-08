const cacheName = 'cache-v1-1-4';

self.addEventListener('install', function(event) {
console.log('ServiceWorker installing...');
event.waitUntil(
      caches.open(cacheName).then(function(cache) {
            console.log('ServiceWorker caching app shell');
            return cache.addAll;
      })
);
});

self.addEventListener('activate', function(event) {
  console.log('ServiceWorker activating...');
  var currentCacheName = cacheName;
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== currentCacheName) {
            console.log('ServiceWorker removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Fetch data from network
    fetch(event.request, {cache: "no-store"})
    .then(function(response) {
      // If fetch is successful, cache the new response
      if (event.request.method === 'GET') {
        return caches.open(cacheName).then(function(cache) {
          cache.add(event.request.url);
          cache.put(event.request, response.clone());
          return response;
        });
      } else {
        return response;
      }
    })
    .catch(function() {
      // If fetch fails, return cached response if available
      return caches.match(event.request);
    })
  );
});