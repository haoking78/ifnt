
/* IFNT service-worker v6.2.10 */
const CACHE_PREFIX = 'IFNT-cache';
const APP_VERSION  = 'v6.2.10';
const CACHE_NAME   = `${CACHE_PREFIX}-${APP_VERSION}`;
const BYPASS_Q     = 'v';

self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k)));
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch (e) {}
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.searchParams.has(BYPASS_Q)) return;
  const isNav  = req.mode === 'navigate';
  const isCode = req.destination === 'script' || req.destination === 'style' || url.pathname.endsWith('/index.html');
  if (isNav || isCode) event.respondWith(networkFirst(req));
  else event.respondWith(cacheFirst(req));
});
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const resp = await fetch(new Request(request, { cache: 'no-store' }));
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  } catch (err) {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const resp = await fetch(request);
  if (resp && resp.ok) cache.put(request, resp.clone());
  return resp;
}
