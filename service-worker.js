// 極簡 SW：不做持久快取，每次啟用即接管，確保讀最新檔
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
