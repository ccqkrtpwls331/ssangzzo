const CACHE_NAME = 'ssangssangba-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  // 새 서비스 워커가 즉시 대기 상태를 건너뛰고 활성화되도록 설정
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 이전 버전의 찌꺼기 캐시를 비워주는 로직
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. 네트워크에서 최신 버전을 먼저 요청 (Network-First)
    fetch(event.request)
      .then(response => {
        // 네트워크 요청 성공 시 캐시도 최신본으로 갱신
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 2. 오프라인이거나 에러가 났을 때만 기존 캐시 반환
        return caches.match(event.request);
      })
  );
});
