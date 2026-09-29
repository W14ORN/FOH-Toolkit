const CACHE = 'foh-toolkit-v1.7.3';
const ASSETS = ['./','index.html','app.css','upgrade-v2.css','upgrade-v3.css','upgrade-v5.css','upgrade-v8.css','app.js','upgrade-v2-profiles.js','upgrade-v2-shows.js','upgrade-v6-desk-persistence.js','upgrade-v3-session-programming.js','upgrade-v4-sq-native.js','upgrade-v5-stagebox-defaults.js','upgrade-v7-preset-scroll.js','upgrade-v8-show-wizard.js','upgrade-v9-add-show-dropdown.js','upgrade-v10-rta-speed.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return resp; }).catch(() => caches.match('./'))));
});
