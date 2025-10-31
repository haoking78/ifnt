
const APP_VERSION = 'v6.2.6-autofill';
const CACHE_NAME = 'ifnt-cache-' + APP_VERSION;
const ASSETS = ['./','./index.html','./app.js','./manifest.json','./app_icon_192.png','./app_icon_512.png','./logo.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && k.startsWith('ifnt-cache-')?caches.delete(k):null))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.searchParams.has('nocache')){ e.respondWith(fetch(e.request)); return; }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)); return res;})));
});
