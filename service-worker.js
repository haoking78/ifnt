const CACHE_VERSION='ifnt-v6.2.1-20251031-4';
const PRECACHE=['./','./index.html','./app.20251031-4.js','./app_icon_192.png','./app_icon_512.png','./manifest.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(PRECACHE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);const isIndex=url.pathname.endsWith('/ifnt/')||url.pathname.endsWith('/ifnt/index.html');if(isIndex){e.respondWith(fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE_VERSION).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match(e.request)));return}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});