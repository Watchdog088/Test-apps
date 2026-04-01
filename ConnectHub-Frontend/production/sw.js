/**
 * LynkApp Service Worker - PWA Offline Support
 */
const CACHE_VERSION = 'lynkapp-v2.5.1';
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
    './js/performance-optimizer.js'
];

// Install - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// Fetch - network first for API, cache first for static
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

    // Static assets - cache first
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
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
