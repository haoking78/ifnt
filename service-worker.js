const CACHE_VERSION='ifnt-vv6.1.4';
const APP_CACHE='app-'+CACHE_VERSION;
const CORE=['./index.html?v=v6.1.4','./app.js?v=v6.1.4','./manifest.json?v=v6.1.4','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(CORE)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('app-')&&k!==APP_CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('message', e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e=>{
  const req=e.request;
  const accept=req.headers.get('accept')||'';
  const isHTML = accept.includes('text/html');
  if(isHTML){
    e.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(APP_CACHE).then(c=>c.put(req,copy)); return res;
    }).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res=>{
    const copy=res.clone(); caches.open(APP_CACHE).then(c=>c.put(req,copy)); return res;
  })));
});
