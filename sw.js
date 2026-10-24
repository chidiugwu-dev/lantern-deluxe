// Lantern Deluxe offline support. The whole app is one HTML file, so caching it (plus the icons and
// manifest) is enough to run with no connection. The cache name carries a build stamp, so a new build
// replaces the cache. Its "deluxe-" prefix keeps it apart from Lantern's caches on the same site.
const CACHE = "deluxe-1b0288c34775";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("deluxe-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Cache first, so it opens instantly and works offline; page navigations fall back to the cached app.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => hit || fetch(event.request).catch(() => (event.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))),
  );
});
