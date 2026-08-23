// Cadde Store Service Worker — PWA & Offline Support
const CACHE_NAME = "cadde-store-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico"
];

// 1. Install Event: Pre-cache essential offline shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Pre-caching offline assets");
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[SW] Pre-cache warning:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log("[SW] Removing outdated cache:", name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-first with cache fallback for dynamic content, Cache-first for static icons
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Do not intercept non-GET requests or browser-extension requests
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // Handle static images and icons
  if (request.destination === "image" || request.url.includes("/icon-")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => caches.match("/icon-192.png"));
      })
    );
    return;
  }

  // Network-first strategy for navigation and data
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && request.method === "GET") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Fallback for HTML navigations
        if (request.mode === "navigate") {
          const rootFallback = await caches.match("/");
          if (rootFallback) return rootFallback;
        }

        return new Response("Offline - Cadde Store", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
        });
      })
  );
});
