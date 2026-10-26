/* Arditi: lets the game run with no connection. Version arditi-a3f7946a2e */
const V = 'arditi-a3f7946a2e';
const CORE = ["./","fonts/barlow-condensed-latin-500-normal.woff2","fonts/barlow-condensed-latin-600-normal.woff2","fonts/barlow-condensed-latin-700-normal.woff2","fonts/bodoni-moda-latin-opsz-italic.woff2","fonts/bodoni-moda-latin-opsz-normal.woff2","fonts/courier-prime-latin-400-italic.woff2","fonts/courier-prime-latin-400-normal.woff2","fonts/courier-prime-latin-700-normal.woff2","icon-180.png","icon-192.png","icon-512.png","icon-maskable-512.png","icon.svg","manifest.webmanifest","three.min.js"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('arditi-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'ready?') caches.has(V).then(ok => e.source && e.source.postMessage({ offline: ok, v: V })); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // the page: fresh from the network when there is one (so updates arrive), the stored copy when there is not
  if (r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(k => k.put('./', c)); } return res; })
      .catch(() => caches.match('./', { ignoreSearch: true }).then(m => m || caches.match(r))));
    return;
  }
  // everything else: the stored copy first
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => { if (res.ok && res.type === 'basic') { const c = res.clone(); caches.open(V).then(k => k.put(r, c)); } return res; })));
});
