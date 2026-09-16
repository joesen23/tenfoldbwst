const CACHE = 'tenfold-shell-v4';
const CORE = [
  'index.html','dashboard.html','characters.html','story.html',
  'battle.html','leaderboard.html','loading.html','style.css','game.js','manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Dynamic app files must prefer the network so score-sync and bug fixes
  // are not trapped behind an old service-worker cache. If offline, fall
  // back to the cached version.
  const path = new URL(req.url).pathname.toLowerCase();
  const dynamic = /\.(html|js|css)$/.test(path);

  if (dynamic) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => caches.match(req).then(cached => cached || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
