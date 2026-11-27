/* ==========================================================================
   MINKOI 5.6 · SAFE VERSIONED APP-SHELL SERVICE WORKER (Layer 3 Cache)
   - Network-first for HTML navigation (fresh shell + offline fallback)
   - Stale-while-revalidate for static CSS / JS / WASM / Lyrics JSON
   - Bounded Cache-First (max 24 entries) for visited banner WebP & avatar PNG
   - STRICTLY BYPASSES music/*.mp3 and HTTP Range (206) media requests so
     audio streaming, seeking, and memory stay completely untouched.
   ========================================================================== */
'use strict';

const CACHE_VERSION = 'minkoi-v5-6-shell-v3';
const MEDIA_CACHE = 'minkoi-v5-6-artwork-v1';
const MAX_ARTWORK_CACHE = 24;

const CORE_SHELL = [
    './',
    './index.html',
    './css/tokens.css',
    './css/base.css',
    './css/components.css',
    './css/layout-studio.css',
    './css/materials.css',
    './css/responsive.css',
    './js/config.js',
    './js/ui/foundation.js',
    './js/ui/materials/frosted-renderer.js',
    './js/ui/materials/liquid-renderer.js',
    './js/ui/materials/material-manager.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(CORE_SHELL).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((k) => k !== CACHE_VERSION && k !== MEDIA_CACHE)
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

let trimTimer = 0;
function scheduleTrim(cacheName, maxItems) {
    if (trimTimer) return;
    trimTimer = setTimeout(async () => {
        trimTimer = 0;
        try {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            if (keys.length > maxItems) {
                const excess = keys.length - maxItems;
                for (let i = 0; i < excess; i++) {
                    await cache.delete(keys[i]);
                }
            }
        } catch (_) {}
    }, 3000);
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    // Never intercept HTTP Range requests or MP3 audio streams
    if (req.headers.has('range')) return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.includes('/music/') || /\.mp3$/i.test(url.pathname)) return;

    // 1. Navigation / HTML: Network-first with offline shell fallback
    if (req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res && res.ok && res.status === 200) {
                        const copy = res.clone();
                        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return res;
                })
                .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
        );
        return;
    }

    // 2. Static code / styles / WASM / lyrics JSON: Stale-while-revalidate
    if (/\.(?:js|mjs|css|wasm|json)$/i.test(url.pathname)) {
        event.respondWith(
            caches.open(CACHE_VERSION).then((cache) =>
                cache.match(req).then((cached) => {
                    const networkFetch = fetch(req).then((res) => {
                        if (res && res.ok && res.status === 200) {
                            cache.put(req, res.clone()).catch(() => {});
                        }
                        return res;
                    }).catch(() => cached);
                    return cached || networkFetch;
                })
            )
        );
        return;
    }

    // 3. Visited banners & avatars: Bounded cache-first
    if (/\.(?:webp|png|jpg|jpeg)$/i.test(url.pathname) && url.pathname.includes('/assets/')) {
        event.respondWith(
            caches.open(MEDIA_CACHE).then((cache) =>
                cache.match(req).then((cached) => {
                    if (cached) return cached;
                    return fetch(req).then((res) => {
                        if (res && res.ok && res.status === 200) {
                            cache.put(req, res.clone()).then(() => scheduleTrim(MEDIA_CACHE, MAX_ARTWORK_CACHE)).catch(() => {});
                        }
                        return res;
                    });
                })
            )
        );
    }
});
