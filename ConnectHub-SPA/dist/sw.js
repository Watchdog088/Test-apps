/**
 * ConnectHub-SPA Service Worker — Sprint 19
 * PWA Offline Caching for Marketplace
 *
 * Strategies:
 *  - App Shell (HTML/CSS/JS) → Cache-First
 *  - Marketplace API calls   → Network-First with 5-second timeout, fall to cache
 *  - Picsum product photos   → Stale-While-Revalidate
 *  - Everything else         → Network-First
 */

const CACHE_VERSION  = 'connecthub-v20';
const SHELL_CACHE    = `${CACHE_VERSION}-shell`;
const DATA_CACHE     = `${CACHE_VERSION}-data`;
const PHOTO_CACHE    = `${CACHE_VERSION}-photos`;

// App-shell assets to pre-cache on install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── Install: pre-cache the shell ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: delete stale caches ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('connecthub-') && k !== SHELL_CACHE && k !== DATA_CACHE && k !== PHOTO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing strategy ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET and cross-origin Chrome extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // 2. Picsum product photos → Stale-While-Revalidate
  if (url.hostname === 'picsum.photos') {
    event.respondWith(staleWhileRevalidate(PHOTO_CACHE, request));
    return;
  }

  // 3. Marketplace API endpoints → Network-First (5s timeout) with cache fallback
  if (
    url.pathname.startsWith('/api/marketplace') ||
    url.pathname.startsWith('/api/listings') ||
    url.pathname.startsWith('/api/orders') ||
    url.hostname.includes('firestore.googleapis.com')
  ) {
    event.respondWith(networkFirstWithTimeout(DATA_CACHE, request, 5000));
    return;
  }

  // 4. App shell (HTML navigation requests) → Cache-First
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(request))
    );
    return;
  }

  // 5. Static assets (JS/CSS/fonts) → Cache-First
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|svg|png|jpg|jpeg|ico|webp)$/)
  ) {
    event.respondWith(cacheFirst(SHELL_CACHE, request));
    return;
  }

  // 6. Everything else → Network-First
  event.respondWith(networkFirstWithTimeout(DATA_CACHE, request, 8000));
});

// ── Strategy helpers ──────────────────────────────────────────

/** Cache-First: serve from cache, fall back to network */
async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/** Network-First with timeout: try network first, fall back to cache */
async function networkFirstWithTimeout(cacheName, request, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const networkPromise = fetch(request.clone());
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs)
    );
    const response = await Promise.race([networkPromise, timeoutPromise]);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Offline fallback JSON for marketplace API calls
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ offline: true, message: 'You are offline. Showing cached data.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

/** Stale-While-Revalidate: return cached immediately, then update cache in background */
async function staleWhileRevalidate(cacheName, request) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise || new Response('Offline', { status: 503 });
}

// ── Push Notification handler ─────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json?.() ?? { title: 'ConnectHub', body: 'You have a new notification' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'ConnectHub', {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: data.tag || 'connecthub',
      data: { url: data.url || '/marketplace' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
