const CACHE = 'foh-toolkit-v3.1.4';
const ASSETS = ['./','index.html','privacy.html','terms.html','community-guidelines.html','support.html','app.css','upgrade-v2.css','upgrade-v3.css','upgrade-v5.css','upgrade-v8.css','upgrade-v11.css','upgrade-v12.css','upgrade-v13.css','upgrade-v15.css','app.js','upgrade-v2-profiles.js','upgrade-v2-shows.js','upgrade-v6-desk-persistence.js','upgrade-v3-session-programming.js','upgrade-v4-sq-native.js','upgrade-v5-stagebox-defaults.js','upgrade-v7-preset-scroll.js','upgrade-v8-show-wizard.js','upgrade-v9-add-show-dropdown.js','upgrade-v10-rta-speed.js','upgrade-v11-auth-sync.js','upgrade-v12-profile.js','upgrade-v13-community.js','upgrade-v14-profile-stability.js','upgrade-v15-library-community.js','modules/v3-bootstrap.js','modules/v3-extra-presets.js','modules/v3-category-refresh.js','modules/v3-groups.js','modules/v3-preset-families.js','modules/v3.css','modules/v3-core.js','modules/v3-state.js','modules/v3-console.js','modules/v3-rta.js','modules/v3-ringout.js','modules/v3-legacy-bridge.js','modules/v3-shows.js','modules/v3-hardware.js','modules/v3-hardware-guard.js','modules/v3-hardware-routing.js','modules/v3-export.js','modules/v3-community.js','modules/v3-community-context.js','modules/v3-community-safety.js','modules/v3-appstore.js','modules/v3-role-refresh.js','modules/v3-release-polish.js','modules/v3-preset-family-integration.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
    const copy = resp.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return resp;
  }).catch(() => e.request.mode === 'navigate' ? caches.match('./') : Response.error())));
});