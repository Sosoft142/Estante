// Minha estante — service worker. Rede primeiro, cache como rede de seguranca.
var C = 'estante-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ns) {
      return Promise.all(ns.map(function (n) { return n === C ? null : caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(function (resp) {
      if (resp && resp.ok) {
        var copia = resp.clone();
        caches.open(C).then(function (c) { c.put(r, copia); });
      }
      return resp;
    }).catch(function () {
      return caches.match(r).then(function (achado) {
        if (achado) return achado;
        if (r.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'sem rede e sem cache' });
      });
    })
  );
});
