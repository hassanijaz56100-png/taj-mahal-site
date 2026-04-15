// ╔══════════════════════════════════════════════════════════╗
// ║     TAJ MAHAL LORIENT — Service Worker PWA v1.0        ║
// ║     Cache stratégie : Cache First (assets critiques)   ║
// ╚══════════════════════════════════════════════════════════╝

const CACHE_NAME = "tajmahal-v1";

// Assets critiques à mettre en cache immédiatement
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/css/main.chunk.css",
  "/manifest.json",
];

// ── Installation : précache des assets critiques ────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activation : supprime les anciens caches ─────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch : Cache First pour les assets, Network First pour l'API ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes API / Stripe / Supabase
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("stripe.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          // Ne mettre en cache que les requêtes réussies
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline : servir la page principale
          if (request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
