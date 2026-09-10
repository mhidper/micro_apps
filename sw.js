/* Service Worker · Micro-Apps Docentes
   - Precacheo de todo el "shell" y las micro-apps para uso offline.
   - Estrategia: network-first para HTML y datos (el contenido cambia a
     menudo, así las actualizaciones ganan con red); cache-first para el
     resto (CSS, fuentes, imágenes).
   - La activación de la versión nueva la decide el usuario (aviso en la
     app) mediante el mensaje SKIP_WAITING: nunca se queda con una versión
     antigua ni interrumpe sin avisar. */
const CACHE = 'mh-microapps-v2';

const PRECACHE = [
  './', './index.html', './theme.css', './fonts.css',
  './data/apps_data.js', './manifest.webmanifest',
  // Simuladores y recursos
  './simulador_clu.html',
  './macro_simulador_sesion_01.html',
  './macro_simulador_sesion_02.html',
  './balanza_proteccion.html',
  './viaje_desempleado.html',
  './mitos_realidades.html',
  './colocacion_adecuada.html',
  './caso_1.html',
  // Marca / iconos / fuentes
  './assets/isotipo_mh.svg', './assets/logo_mh.svg',
  './assets/icon-192.png', './assets/icon-512.png',
  './assets/fonts/inter-var.woff2', './assets/fonts/outfit-var.woff2'
];

self.addEventListener('install', (e) => {
  // No hacemos skipWaiting: la nueva versión espera a que el usuario acepte.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // solo mismo origen

  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  const isData = url.pathname.endsWith('.html') || url.pathname.endsWith('apps_data.js');

  if (isDoc || isData) {
    // network-first
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    // cache-first
    e.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached)
      )
    );
  }
});
