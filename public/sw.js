/**
 * Humi HRIS Service Worker
 *
 * Strategy:
 * - Static assets (CSS, JS, images): Cache-first with network fallback
 * - API GET requests: Network-first with cache fallback (stale-while-revalidate)
 * - Navigation requests (HTML pages): Network-first with offline fallback
 * - POST/PUT/DELETE requests: Network-only with background sync queue
 */

const VERSION = 'v2.1.0';
const STATIC_CACHE = `humi-static-${VERSION}`;
const RUNTIME_CACHE = `humi-runtime-${VERSION}`;
const API_CACHE = `humi-api-${VERSION}`;
const OFFLINE_CACHE = `humi-offline-${VERSION}`;

const APP_SHELL = [
    '/',
    '/login',
    '/portal',
    '/manifest.webmanifest',
    '/logo.png',
    '/logo-color.png',
    '/icons/icon-96.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/offline.html',
];

const ALL_CACHES = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE, OFFLINE_CACHE];

// Maximum entries for runtime caches
const MAX_API_CACHE_ENTRIES = 50;
const MAX_RUNTIME_CACHE_ENTRIES = 60;

// API endpoints to cache
const CACHEABLE_API_PATTERNS = [
    /\/portal\/api\/summary/,
    /\/portal\/api\/attendances/,
    /\/portal\/api\/leaves/,
    /\/portal\/api\/overtimes/,
    /\/portal\/api\/payrolls\/preview/,
    /\/portal\/api\/payrolls\/preview-secure/,
    /\/portal\/api\/announcements/,
    /\/portal\/api\/assets/,
    /\/portal\/api\/surveys/,
    /\/api\/mobile\/v1\/portal\/summary/,
    /\/api\/mobile\/v1\/profile/,
    /\/api\/mobile\/v1\/attendances/,
    /\/api\/mobile\/v1\/leaves/,
    /\/api\/mobile\/v1\/overtimes/,
];

// ============================================================================
// Lifecycle Events
// ============================================================================

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(STATIC_CACHE);
            // Use addAll but catch errors so install doesn't fail entirely
            await Promise.allSettled(
                APP_SHELL.map((url) =>
                    cache
                        .add(url)
                        .catch((err) =>
                            console.warn(`[SW] Failed to cache ${url}:`, err),
                        ),
                ),
            );
        })(),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // Delete old caches that aren't in our current version
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys
                    .filter((key) => !ALL_CACHES.includes(key))
                    .map((key) => caches.delete(key)),
            );
            await self.clients.claim();
        })(),
    );
});

// ============================================================================
// Fetch Event - Routing Strategy
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // Skip non-GET requests (handled by background sync if needed)
    if (request.method !== 'GET') {
        // For mutating requests, let them pass through but notify offline state
        if (!self.navigator.onLine) {
            event.respondWith(handleOfflineMutation(request));
        }
        return;
    }

    // Route to appropriate strategy
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isApiRequest(url)) {
        event.respondWith(networkFirstWithCache(request, API_CACHE));
    } else if (isNavigationRequest(request)) {
        event.respondWith(navigationStrategy(request));
    } else if (isImage(url)) {
        event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    }
});

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * Cache-first: Try cache, then network, save to cache.
 * Best for: static assets that rarely change.
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
            cache.put(request, response.clone());
            limitCacheSize(cacheName, MAX_RUNTIME_CACHE_ENTRIES);
        }
        return response;
    } catch (error) {
        // Return a fallback for images
        if (isImage(new URL(request.url))) {
            return (
                cache.match('/logo.png') || new Response('', { status: 404 })
            );
        }
        throw error;
    }
}

/**
 * Network-first with cache fallback (stale-while-revalidate pattern).
 * Best for: API responses where freshness matters but offline support is needed.
 */
async function networkFirstWithCache(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
            limitCacheSize(cacheName, MAX_API_CACHE_ENTRIES);
        }
        return response;
    } catch (error) {
        // Network failed, try cache
        const cached = await cache.match(request);
        if (cached) {
            // Add header to indicate this is from cache
            const headers = new Headers(cached.headers);
            headers.set('X-From-Cache', 'true');
            const body = await cached.clone().text();
            return new Response(body, {
                status: cached.status,
                statusText: cached.statusText,
                headers,
            });
        }

        // No cache, return JSON error response
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Anda sedang offline. Data tidak tersedia.',
                offline: true,
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}

/**
 * Navigation strategy: Network-first with offline page fallback.
 * Best for: HTML page navigation.
 */
async function navigationStrategy(request) {
    try {
        const response = await fetch(request);
        // Cache successful navigation responses
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // Try cached version of the page
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }

        // Return offline fallback page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // Last resort: minimal offline response
        return new Response(getOfflineHtml(), {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }
}

/**
 * Handle mutation requests when offline.
 * Returns informative error response.
 */
async function handleOfflineMutation(request) {
    return new Response(
        JSON.stringify({
            success: false,
            message:
                'Anda sedang offline. Silakan coba lagi saat koneksi tersedia.',
            offline: true,
            queued: false,
        }),
        {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        },
    );
}

// ============================================================================
// Helpers
// ============================================================================

function isStaticAsset(url) {
    return (
        url.pathname.startsWith('/build/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.webmanifest')
    );
}

function isApiRequest(url) {
    return CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isNavigationRequest(request) {
    return (
        request.mode === 'navigate' ||
        (request.method === 'GET' &&
            request.headers.get('accept')?.includes('text/html'))
    );
}

function isImage(url) {
    return /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(url.pathname);
}

/**
 * Limit cache size by removing oldest entries.
 */
async function limitCacheSize(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
        // Remove oldest entries (FIFO)
        const toDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(toDelete.map((key) => cache.delete(key)));
    }
}

/**
 * Inline minimal offline HTML page.
 */
function getOfflineHtml() {
    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Offline - Humi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #006069 0%, #049ba6 100%);
            color: white;
            padding: 24px;
        }
        .container { text-align: center; max-width: 400px; }
        .icon {
            width: 80px; height: 80px; margin: 0 auto 24px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 24px; margin-bottom: 12px; font-weight: 700; }
        p { opacity: 0.9; line-height: 1.6; margin-bottom: 24px; }
        button {
            background: white; color: #006069;
            border: none; padding: 12px 32px;
            border-radius: 999px; font-weight: 600;
            cursor: pointer; font-size: 14px;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
        </div>
        <h1>Anda sedang offline</h1>
        <p>Periksa koneksi internet Anda lalu coba lagi. Beberapa data mungkin masih tersedia dari cache.</p>
        <button onclick="window.location.reload()">Coba Lagi</button>
    </div>
</body>
</html>`;
}

// ============================================================================
// Message Handler - Communicate with the app
// ============================================================================

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data?.type === 'CLEAR_CACHE') {
        event.waitUntil(
            (async () => {
                const cacheKeys = await caches.keys();
                await Promise.all(cacheKeys.map((key) => caches.delete(key)));
                event.ports[0]?.postMessage({ success: true });
            })(),
        );
    }

    if (event.data?.type === 'GET_VERSION') {
        event.ports[0]?.postMessage({ version: VERSION });
    }
});
