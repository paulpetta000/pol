/* Service worker della guida: pagine pratiche disponibili anche senza rete. */
const VERSION = '__VERSION__';
const CORE = __PRECACHE__;
const PAGES = `pagine-${VERSION}`;
const ASSETS = 'risorse-v1';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(PAGES).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('pagine-') && k !== PAGES).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const timeout = (ms, p) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); }); });

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Pagine: prima la rete (dati freschi), poi la copia salvata, infine la pagina "offline"
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PAGES);
      try {
        const res = await timeout(4000, fetch(req));
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('/offline/'));
      }
    })());
    return;
  }

  // File con nome che cambia a ogni versione: prima la copia salvata (anche quella fatta all'installazione)
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/fonts/')) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(ASSETS)).put(req, res.clone());
      return res;
    })());
    return;
  }

  // Tutto il resto (icone, calendari, dati della mappa degli itinerari): copia salvata subito, aggiornata in background
  event.respondWith((async () => {
    const cache = await caches.open(ASSETS);
    const hit = (await cache.match(req)) || (await caches.match(req));
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })());
});
