const CACHE_NAME = 'vibe-coding-kit-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './slides.html',
  './workbench.html',
  './playbook.html',
  './handout.html',
  './style.css',
  './app.js',
  './manifest.json',
  './seat_arranger.html',
  './roulette_picker.html',
  './class_board.html',
  './images/portal_index.png',
  './images/vibe_concept.png',
  './images/notepad_save_guide.png',
  './images/icon-192.png',
  './images/icon-512.png'
];

// 1. 서비스 워커 설치 및 오프라인 에셋 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching Multi-Page App Shell & Static Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. 서비스 워커 활성화 및 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing Old Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 네트워크 요청 가로채기 (Cache First & Fallback to Network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      // 오프라인 상태에서 페이지 요청 실패 시 index.html 렌더링
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
