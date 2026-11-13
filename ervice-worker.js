const CACHE_NAME = 'flight-tool-network-first-v1';
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json'];

// 安装：预缓存基础资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 激活：删除旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 网络优先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 拿到线上新资源，更新缓存
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      })
      .catch(() => {
        // 网络失败（无网/飞行模式）读取缓存
        return caches.match(event.request);
      })
  );
});
