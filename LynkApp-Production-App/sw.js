/**
 * LynkApp Service Worker - PWA Offline Support
 * Updated: 2026-04-16 — v2.6.0: force cache refresh for UX gap fixes
 */
const CACHE_VERSION = 'lynkapp-v2.7.0';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';

const STATIC_ASSETS = [
    './',
    './index.html',
    './css/lynkapp-main.css',
    './js/splash-init.js',
    './js/consent-onboarding.js',
    './js/app-main.js',
    './js/user-testing-fixes.js',
    './js/performance-optimizer.js',
    './js/ux-gap-fixes.js',
    './js/sidebar-nav.js',
    './js/medium-priority-fixes.js'
];

// Install - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean ALL old caches (including v2.5.x)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// Fetch - network first for HTML (always get latest), cache first for other static
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // API calls - network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // HTML pages - network first so updates always show immediately
    if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
                    return res;
                })
                .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
        );
        return;
    }

    // Static assets - cache first (with network fallback)
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
                if (res.ok && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
                }
                return res;
            }).catch(() => {
                if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
