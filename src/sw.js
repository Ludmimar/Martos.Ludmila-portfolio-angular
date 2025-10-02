// Service Worker optimizado para PWA
const CACHE_NAME = 'ludmila-portfolio-v2';
const STATIC_CACHE = 'portfolio-static-v2';
const DYNAMIC_CACHE = 'portfolio-dynamic-v2';
const IMAGE_CACHE = 'portfolio-images-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

const staticAssets = [
  '/assets/img/profile.png',
  '/assets/img/estrella-alada1.png',
  '/assets/img/cherry-blossom.png',
  '/assets/img/yarn.png',
  '/assets/img/incubadora.png',
  '/assets/img/conversor.png',
  '/assets/img/beauty.jpg',
  '/assets/img/java.png',
  '/assets/img/salus.jpg',
  '/assets/img/encriptador.jpg',
  '/assets/img/Issd.jpg',
  '/assets/img/knitting.png',
  '/assets/img/icono-ovillo.png',
  '/assets/img/sequelize-logo.png',
  '/assets/files/cv-Martos.Ludmila.pdf'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(urlsToCache)),
      caches.open(IMAGE_CACHE).then(cache => cache.addAll(staticAssets))
    ]).then(() => {
      console.log('Caches instalados correctamente');
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes('v2')) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptar requests con estrategias optimizadas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia Cache First para assets estáticos
  if (request.destination === 'image' || url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Estrategia Stale While Revalidate para HTML
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Estrategia Network First para API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Estrategia Cache First para otros recursos
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}
