/* Service Worker · Micro-Apps Docentes
   Estrategia: network-first para HTML y datos (el contenido cambia
   a menudo), cache-first para estáticos. Así las actualizaciones de
   contenido ganan siempre que haya red, con respaldo offline. */
const CACHE = 'mh-microapps-v1';
const CORE = [
  './', './index.html', './theme.css', './data/apps_data.js',
  './manifest.webmanifest',
  './assets/isotipo_mh.svg', './assets/logo_mh.svg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  const isData = req.url.includes('apps_data.js') || req.url.endsWith('.html');

  if (isDoc || isData) {
    // network-first
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    // cache-first
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached))
    );
  }
});
