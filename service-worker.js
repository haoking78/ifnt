self.addEventListener('install', e=>{
  e.waitUntil(caches.open('ifnt-v6214').then(c=>c.addAll([
    './','./index.html','./styles.css','./app.js','./manifest.json',
    './assets/logo.png','./assets/app_icon_192.png','./assets/app_icon_512.png'
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', e=> self.clients.claim());
self.addEventListener('fetch', e=> e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request))));