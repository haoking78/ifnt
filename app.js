// IFNT app bootstrap
(function(){'use strict';
  console.log('IFNT boot v6.1.6-20251031-2');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js?ver=v6.1.6-20251031-2', { scope: './' })
        .then(reg => {
          console.log('[SW] registered', reg.scope);
          reg.addEventListener('updatefound', () => {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', () => {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] new content available, skipping waiting');
                nw.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        }).catch(err => console.error('[SW] register failed', err));

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] controller changed -> reload once');
        window.location.reload();
      });
    });
  }
})();
