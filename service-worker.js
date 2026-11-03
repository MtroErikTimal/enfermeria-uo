const CACHE_NAME = 'uo-enfermeria-v8';
const APP_FILES = [
  './',
  './index.html',
  './asignaturas.html',
  './fundamentos.html',
  './procedimientos.html',
  './materiales.html',
  './material-estudio.html',
  './evaluaciones.html',
  './recursos.html',
  './escalas.html',
  './simulador.html',
  './contacto.html',
  './acerca.html',
  './estilos.css',
  './app.js',
  './rpbi-game.js',
  './game-rpbi.js',
  './temas.js',
  './procedimientos.js',
  './evaluaciones.js',
  './recursos.js',
  './manifest.webmanifest',
  './icon.svg',
  './img/logo-uo.png',
  './img/logo-enfermeria.png',
  './img/enfermera-hero.jpg',
  './img/enfermera-hero.svg',
  './img/enfermera-perfil.svg',
  './img/enfermera-perfil.avif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('./index.html');
          if (offlinePage) return offlinePage;
        }
        return Response.error();
      })
  );
});
