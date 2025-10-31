self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open('ifnt-v6211').then(c=>c.addAll(['./','index.html','styles.css','app.js','logo.png','manifest.json'])))});
self.addEventListener('activate',e=>{ e.waitUntil(clients.claim()) });
self.addEventListener('fetch',e=>{ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))) });
