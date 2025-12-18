const CACHE_NAME = "main-app-v1";
const DYNAMIC_CACHE = "dynamic-v1";

const ASSETS = [
  "/index.html",

  "/page/ventas.html",
  "/page/productos.html",
  "/page/clientes.html",
  "/page/gastos.html",
  "/page/reportes.html",

  // CSS
  "/css/normalize.css",
  "/css/index.css",
  "/css/ventas.css",
  "/css/productos.css",
  "/css/clientes.css",
  "/css/gastos.css",
  "/css/reportes.css",

  // JS comunes
  "/js/app.js",
  "/js/index.js",
  "/js/logout.js",
  "/js/system.js"
];

// ============================
// INSTALL
// ============================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ============================
// ACTIVATE
// ============================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ============================
// FETCH
// ============================
self.addEventListener("fetch", event => {
  const req = event.request;

  // No cachear API / backend
  if (req.url.includes("/api")) return;

  // JS → cache dinámico
  if (req.destination === "script") {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache =>
        cache.match(req).then(resp => {
          return (
            resp ||
            fetch(req).then(fetchResp => {
              cache.put(req, fetchResp.clone());
              return fetchResp;
            })
          );
        })
      )
    );
    return;
  }

  // HTML / CSS → network first
  event.respondWith(
    fetch(req)
      .then(res => {
        const clone = res.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
