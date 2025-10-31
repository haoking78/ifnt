const CACHE_VERSION='ifnt-v6-1';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(['./','./index.html','./manifest.json','./app_icon_192.png','./app_icon_512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request))); });