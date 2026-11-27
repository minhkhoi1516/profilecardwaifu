/* ==========================================================================
   MINKOI 5.6 · 4-TIER CACHE & RESOURCE LIFECYCLE MANAGER
   - Layer 1: Bounded Memory LRU Cache (decoded banners/ImageBitmaps/metadata,
              never evicts active visible artwork, closes evicted ImageBitmaps)
   - Layer 2: Browser HTTP Cache alignment (vercel.json headers)
   - Layer 3: Safe Versioned Service Worker App-Shell Cache (sw.js; excludes MP3)
   - Layer 4: IndexedDB lightweight metadata/cache-index store (quota-safe)
   ========================================================================== */
(function (global) {
    'use strict';

    const IDB_NAME = 'minkoi_v56_runtime';
    const IDB_VERSION = 1;
    const IDB_STORE = 'metadata';

    function computeMemoryLimit() {
        const memGB = global.MinkoiCapabilities?.getSnapshot?.()?.deviceMemoryGB;
        if (typeof memGB === 'number' && memGB > 0) {
            if (memGB <= 2) return 4;
            if (memGB <= 4) return 6;
            return 8;
        }
        return 6;
    }

    let maxBannerEntries = computeMemoryLimit();
    const bannerLru = new Map();
    const lockedKeys = new Set();
    const trackedResources = new Set();

    let hits = 0;
    let misses = 0;
    let evictions = 0;
    let pressureEvictions = 0;
    let totalDecodeMs = 0;
    let decodeCount = 0;
    let idbReady = false;
    let idbQuotaErrors = 0;
    let idbInstance = null;
    let swStatus = 'unregistered';
    let swState = null;
    let swHasInstalling = false;
    let swHasWaiting = false;
    let swHasActive = false;
    let swControlled = Boolean(global.navigator?.serviceWorker?.controller);
    let swControllerChanges = 0;
    const swHistory = [];
    const MAX_SW_HISTORY = 16;
    let swRegistration = null;
    let swRegisterPromise = null;
    let swControllerListenerBound = false;
    const swTrackedWorkers = new WeakSet();
    const swTrackedRegs = new WeakSet();

    function releaseEntry(entry) {
        if (!entry) return;
        if (entry.bitmap && typeof entry.bitmap.close === 'function') {
            try { entry.bitmap.close(); } catch (_) {}
        }
    }

    function evictIfNeeded(targetCap = maxBannerEntries) {
        while (bannerLru.size > targetCap) {
            let evictedKey = null;
            for (const key of bannerLru.keys()) {
                if (!lockedKeys.has(key)) {
                    evictedKey = key;
                    break;
                }
            }
            if (!evictedKey) break;
            const entry = bannerLru.get(evictedKey);
            bannerLru.delete(evictedKey);
            releaseEntry(entry);
            evictions++;
        }
    }

    function lockKey(key) {
        if (key) lockedKeys.add(key);
    }

    function unlockKey(key) {
        if (key) lockedKeys.delete(key);
    }

    function setActiveArtwork(key) {
        lockedKeys.clear();
        if (key) lockedKeys.add(key);
    }

    function getBanner(key) {
        if (!key || !bannerLru.has(key)) {
            misses++;
            return null;
        }
        const entry = bannerLru.get(key);
        // Refresh LRU recency
        bannerLru.delete(key);
        bannerLru.set(key, entry);
        hits++;
        return entry;
    }

    function putBanner(key, payload) {
        if (!key || !payload) return;
        if (bannerLru.has(key)) {
            const prev = bannerLru.get(key);
            if (prev !== payload) releaseEntry(prev);
            bannerLru.delete(key);
        }
        bannerLru.set(key, {
            ...payload,
            cachedAt: Date.now()
        });
        evictIfNeeded();
    }

    function hasBanner(key) {
        return Boolean(key && bannerLru.has(key));
    }

    function recordDecodeTime(ms) {
        if (Number.isFinite(ms) && ms >= 0) {
            totalDecodeMs += ms;
            decodeCount++;
        }
    }

    // Track disposable runtime resources (Object URLs, listeners, canvases)
    function trackResource(resource) {
        if (resource && typeof resource.dispose === 'function') {
            trackedResources.add(resource);
        }
    }

    function releaseInactiveOnPressure() {
        const before = evictions;
        evictIfNeeded(Math.max(2, Math.floor(maxBannerEntries / 2)));
        pressureEvictions += Math.max(0, evictions - before);
    }

    function checkMemoryPressure() {
        const mem = global.performance?.memory;
        if (mem && Number.isFinite(mem.usedJSHeapSize) && Number.isFinite(mem.jsHeapSizeLimit) && mem.jsHeapSizeLimit > 0) {
            const ratio = mem.usedJSHeapSize / mem.jsHeapSizeLimit;
            if (ratio >= 0.78) {
                releaseInactiveOnPressure();
                return true;
            }
        }
        return false;
    }

    function trimOnPersonaSwitch(activeKey) {
        if (activeKey) setActiveArtwork(activeKey);
        if (!checkMemoryPressure()) {
            evictIfNeeded(maxBannerEntries);
        }
    }

    // Layer 4: IndexedDB lightweight metadata store (never stores large MP3 blobs)
    function openIdb() {
        if (idbInstance) return Promise.resolve(idbInstance);
        if (typeof global.indexedDB === 'undefined') return Promise.resolve(null);
        return new Promise((resolve) => {
            try {
                const req = global.indexedDB.open(IDB_NAME, IDB_VERSION);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
                    }
                };
                req.onsuccess = () => {
                    idbInstance = req.result;
                    idbReady = true;
                    resolve(idbInstance);
                };
                req.onerror = () => {
                    idbReady = false;
                    resolve(null);
                };
            } catch (_) {
                idbReady = false;
                resolve(null);
            }
        });
    }

    async function setMeta(key, value) {
        if (!key) return false;
        const db = await openIdb();
        if (!db) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put({ key: String(key), value, updatedAt: Date.now() });
                tx.oncomplete = () => resolve(true);
                tx.onerror = (ev) => {
                    if (ev?.target?.error?.name === 'QuotaExceededError') idbQuotaErrors++;
                    resolve(false);
                };
            } catch (err) {
                if (err?.name === 'QuotaExceededError') idbQuotaErrors++;
                resolve(false);
            }
        });
    }

    async function getMeta(key) {
        if (!key) return null;
        const db = await openIdb();
        if (!db) return null;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const req = tx.objectStore(IDB_STORE).get(String(key));
                req.onsuccess = () => resolve(req.result ? req.result.value : null);
                req.onerror = () => resolve(null);
            } catch (_) {
                resolve(null);
            }
        });
    }

    // Layer 3: Safe Service Worker App-Shell Registration & Live Lifecycle Telemetry
    function recordSwTransition(tag) {
        if (!tag) return;
        if (swHistory.length && swHistory[swHistory.length - 1] === tag) return;
        swHistory.push(tag);
        if (swHistory.length > MAX_SW_HISTORY) swHistory.shift();
    }

    function watchServiceWorker(worker, slot) {
        if (!worker || swTrackedWorkers.has(worker)) return;
        swTrackedWorkers.add(worker);
        recordSwTransition(`${slot}:${worker.state}`);
        worker.addEventListener('statechange', () => {
            recordSwTransition(`${slot}->${worker.state}`);
            syncSwRegistrationState(swRegistration, worker.state);
        });
    }

    function syncSwRegistrationState(reg, fallbackState) {
        const swContainer = global.navigator?.serviceWorker;
        swControlled = Boolean(swContainer?.controller);
        if (!reg) {
            swHasInstalling = false;
            swHasWaiting = false;
            swHasActive = false;
            swState = null;
            if (!swStatus.startsWith('failed:') && swStatus !== 'unsupported' && swStatus !== 'insecure-origin') {
                swStatus = 'unregistered';
            }
            return swStatus;
        }
        swHasInstalling = Boolean(reg.installing);
        swHasWaiting = Boolean(reg.waiting);
        swHasActive = Boolean(reg.active);
        if (reg.installing) watchServiceWorker(reg.installing, 'installing');
        if (reg.waiting) watchServiceWorker(reg.waiting, 'waiting');
        if (reg.active) watchServiceWorker(reg.active, 'active');

        const primary = reg.active || reg.waiting || reg.installing || null;
        if (primary) {
            swState = primary.state;
            swStatus = primary.state;
        } else if (fallbackState === 'redundant') {
            swState = 'redundant';
            swStatus = 'redundant';
            // Verify asynchronously if registration was unregistered completely
            swContainer?.getRegistration?.('./').then((live) => {
                if (!live) {
                    swRegistration = null;
                    swRegisterPromise = null;
                    swStatus = 'unregistered';
                    swState = null;
                    swHasInstalling = swHasWaiting = swHasActive = false;
                    swControlled = Boolean(swContainer?.controller);
                    recordSwTransition('unregistered');
                }
            }).catch(() => {});
        } else {
            swState = null;
            swStatus = 'unregistered';
        }
        return swStatus;
    }

    function bindSwControllerListener() {
        const swContainer = global.navigator?.serviceWorker;
        if (!swContainer || swControllerListenerBound) return;
        swControllerListenerBound = true;
        swControlled = Boolean(swContainer.controller);
        if (swControlled && typeof swContainer.getRegistration === 'function') {
            swContainer.getRegistration('./').then((reg) => {
                if (reg) {
                    swRegistration = reg;
                    syncSwRegistrationState(reg);
                }
            }).catch(() => {});
        }
        swContainer.addEventListener('controllerchange', () => {
            swControllerChanges++;
            swControlled = Boolean(swContainer.controller);
            recordSwTransition(swControlled ? 'controller:active' : 'controller:none');
            if (swRegistration) syncSwRegistrationState(swRegistration);
        });
    }

    async function registerServiceWorker() {
        const nav = global.navigator;
        const loc = global.location;
        if (!nav?.serviceWorker || !loc || loc.protocol === 'file:') {
            swStatus = 'unsupported';
            swState = null;
            return swStatus;
        }
        const isSecure = loc.protocol === 'https:' || loc.hostname === 'localhost' || loc.hostname === '127.0.0.1';
        if (!isSecure) {
            swStatus = 'insecure-origin';
            swState = null;
            return swStatus;
        }
        bindSwControllerListener();
        if (swRegistration) {
            const live = await nav.serviceWorker.getRegistration('./').catch(() => swRegistration);
            swRegistration = live || null;
            if (swRegistration) return syncSwRegistrationState(swRegistration);
            swRegisterPromise = null;
        }
        if (swRegisterPromise) return swRegisterPromise;
        swRegisterPromise = (async () => {
            try {
                const reg = await nav.serviceWorker.register('./sw.js', { scope: './' });
                swRegistration = reg;
                if (!swTrackedRegs.has(reg)) {
                    swTrackedRegs.add(reg);
                    reg.addEventListener('updatefound', () => {
                        recordSwTransition('updatefound');
                        syncSwRegistrationState(reg);
                    });
                }
                return syncSwRegistrationState(reg);
            } catch (err) {
                swRegisterPromise = null;
                swRegistration = null;
                swState = null;
                swHasInstalling = swHasWaiting = swHasActive = false;
                swStatus = `failed:${String(err?.name || 'error')}`;
                recordSwTransition(swStatus);
                return swStatus;
            }
        })();
        return swRegisterPromise;
    }

    async function syncServiceWorkerStatus() {
        const swContainer = global.navigator?.serviceWorker;
        if (!swContainer || typeof swContainer.getRegistration !== 'function') {
            return swStatus;
        }
        try {
            const live = await swContainer.getRegistration('./');
            swRegistration = live || null;
            if (!live) {
                swRegisterPromise = null;
                recordSwTransition('unregistered');
            }
            return syncSwRegistrationState(swRegistration);
        } catch (_) {
            return swStatus;
        }
    }

    // Also attach controller listener immediately on boot so existing controllers are reflected pre-register()
    bindSwControllerListener();

    global.addEventListener('pagehide', () => {
        releaseInactiveOnPressure();
    });
    if (global.document && typeof global.document.addEventListener === 'function') {
        global.document.addEventListener('visibilitychange', () => {
            if (global.document.hidden) {
                releaseInactiveOnPressure();
            }
        });
    }

    global.MinkoiCache = Object.freeze({
        getBanner,
        putBanner,
        hasBanner,
        lockKey,
        unlockKey,
        setActiveArtwork,
        recordDecodeTime,
        trackResource,
        releaseInactiveOnPressure,
        checkMemoryPressure,
        trimOnPersonaSwitch,
        setMeta,
        getMeta,
        registerServiceWorker,
        syncServiceWorkerStatus,
        getStats: () => ({
            memoryEntries: bannerLru.size,
            maxMemoryEntries: maxBannerEntries,
            lockedCount: lockedKeys.size,
            hits,
            misses,
            hitRatio: (hits + misses) > 0 ? Number((hits / (hits + misses)).toFixed(3)) : 0,
            evictions,
            pressureEvictions,
            avgDecodeMs: decodeCount > 0 ? Number((totalDecodeMs / decodeCount).toFixed(2)) : 0,
            decodeCount,
            idbReady,
            idbQuotaErrors,
            swStatus,
            swState,
            swHasInstalling,
            swHasWaiting,
            swHasActive,
            swControlled: Boolean(global.navigator?.serviceWorker?.controller || swControlled),
            swControllerChanges,
            swHistory: swHistory.slice(),
            trackedResources: trackedResources.size
        })
    });
})(typeof window !== 'undefined' ? window : globalThis);
