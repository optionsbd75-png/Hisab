// পাইকারি হিসাব — অফলাইন সাপোর্ট (ভার্সন ৩)
// নতুন কোড আপলোড করলে CACHE নাম বদলাতে হবে
const CACHE = 'hisab-v3';
const ASSETS = ['./hisab.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // শুধু নিজের সাইটের GET ফাইল — Google Sheet ব্যাকআপের অনুরোধ ছুঁই না
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
