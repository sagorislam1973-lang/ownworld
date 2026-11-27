/* Service Worker: অফলাইন ক্যাশ + নোটিফিকেশন ক্লিক।
   • পেজ (navigation): আগে নেটওয়ার্ক, না পেলে ক্যাশ। তাই ইন্টারনেট থাকলে সবসময় নতুন ভার্সন পাবে।
   • অ্যাপের ফাইল ও Firebase SDK/ফন্ট: ক্যাশ থেকে দ্রুত দেখায়, পেছনে নতুনটা এনে রাখে।
   • Firestore/Auth/ntfy/ম্যাপ টাইল/YouTube: কখনো ক্যাশ হয় না (সরাসরি নেটওয়ার্ক)। */
var CACHE = 'ap-v1';
var EXT = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  // অফলাইনে ইনস্টল/আইকনের জন্য এগুলো আগেই ক্যাশে রাখা (একটা না পেলেও ইনস্টল থামে না)
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(['./', 'manifest.json', 'icon-192.png', 'icon-512.png'].map(function (u) { return c.add(u).catch(function () {}); }));
  }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE && k.indexOf('ap-') === 0; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (x) { return; }
  var same = url.origin === self.location.origin;
  if (req.mode === 'navigate' && same) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./') || caches.match('index.html'); });
      })
    );
    return;
  }
  if (same || EXT.indexOf(url.host) >= 0) {
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
            return res;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
  }
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      if (list.length) return list[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
