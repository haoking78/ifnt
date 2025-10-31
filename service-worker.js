self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open('ifnt-v6-4').then(c=>c.addAll(['./','./index.html','./app.js','./app_icon_192.png','./app_icon_512.png'])));
});
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>!k.includes('ifnt-v6-4')).map(k=>caches.delete(k))))); });
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
