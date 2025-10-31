
const CACHE_NAME = 'ifnt-cache-v6.2.18-03';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=2025-11-01-03',
  './app.js?v=2025-11-01-03',
  './manifest.json',
  './app_icon_192.png',
  './app_icon_512.png',
  './logo.png',
  './fireworks.mp3',
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(PRECACHE_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(res=>res || fetch(e.request)));
  }
});
