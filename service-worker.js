const CACHE_NAME = 'random-cache-v1'; // đổi tên để force update
const urlsToCache = [
  '/random/',
  '/random/index.html',
  '/random/manifest.json',
  '/random/icon-512.png'
];

// Caching các file cần thiết khi cài đặt
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // kích hoạt ngay sau khi cài xong
});

// Xóa các cache cũ không còn dùng nữa
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // kiểm soát tất cả tab ngay
});

// Fetch: lấy từ cache trước, nếu không có thì fetch và update cache
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      const fetchPromise = fetch(event.request).then(function (networkResponse) {
        return caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => cachedResponse); // fallback khi mất mạng

      return cachedResponse || fetchPromise;
    })
  );
});
