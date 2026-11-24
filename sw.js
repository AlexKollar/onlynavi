/* onlynavi.fans — keep installed web apps honest.
   Pages and HTML: network-first, so a new publish reaches the
   installed app on its next launch; the cache only answers offline.
   Everything else (media, icons, feeds) uses the browser's normal
   handling — no extra staleness is introduced for assets. */
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open('av-pages-v1').then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
  }
});
