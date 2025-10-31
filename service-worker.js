
/* IFNT service-worker (cache-busting hotfix) v20251031-4
   - Ensures latest JS/CSS/HTML are always fetched
   - Clears older caches automatically
*/
const SW_VERSION = '20251031-4';
const CACHE_NAME = 'ifnt-cache-' + SW_VERSION;

// Paths that should always be fetched fresh
const BYPASS_CACHE_PATHS = [
  '/ifnt/app.js',
  '/ifnt/styles.css',
  '/ifnt/index.html',
];

self.addEventListener('install', (event) => {{
  self.skipWaiting();
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil((async () => {{
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k.startsWith('ifnt-cache-') && k !== CACHE_NAME) ? caches.delete(k) : null));
    await self.clients.claim();
  }})());
}});

// Helper: should we bypass cache for this request?
function shouldBypassCache(url) {{
  try {{
    const u = new URL(url);
    return BYPASS_CACHE_PATHS.some(p => u.pathname.endsWith(p));
  }} catch(e) {{
    return false;
  }}
}}

// Network-first for HTML/JS/CSS (with no-store), cache-first for others
self.addEventListener('fetch', (event) => {{
  const req = event.request;

  if (req.method !== 'GET') return;

  if (shouldBypassCache(req.url)) {{
    event.respondWith((async () => {{
      try {{
        // Force latest from network
        const fresh = await fetch(new Request(req, {{ cache: 'no-store' }}));
        // Update the current versioned cache
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      }} catch (err) {{
        // Fallback to cache if offline
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        // last resort
        return new Response('Offline', {{ status: 503, statusText: 'Offline' }});
      }}
    }})());
    return;
  }}

  // Default: cache-first, then network
  event.respondWith((async () => {{
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {{
      const resp = await fetch(req);
      cache.put(req, resp.clone());
      return resp;
    }} catch (err) {{
      return new Response('Offline', {{ status: 503, statusText: 'Offline' }});
    }}
  }})());
}});
