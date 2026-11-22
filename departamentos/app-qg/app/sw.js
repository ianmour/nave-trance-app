// Guarda os arquivos do app para abrir rápido e até sem internet.
var CACHE = 'qg-ianmour-v1';
var ARQUIVOS = ['./', 'index.html', 'app.css', 'app.js', 'dados.js', 'simbolos.js', 'manifest.webmanifest',
  'icones/icon-192.png', 'icones/icon-512.png', 'icones/apple-touch-icon.png', 'entregas/keylle-lima-2026-12.html'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
// Primeiro tenta a internet (para pegar a versão nova); sem internet, usa a cópia guardada.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copia = r.clone(); if (r.ok && new URL(e.request.url).origin === location.origin) caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
