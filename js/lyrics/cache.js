/* ========================================================
   MINKOI LYRICS ENGINE V2 · CACHE
   Memory LRU + Versioned localStorage Cache for parsed lyrics,
   per-track offset calibration, and user-imported TTML/ELRC/LRC.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    const CACHE_SCHEMA = 2;
    const STORAGE_CACHE_KEY = 'minkoi_lyrics_doc_cache_v2';
    const STORAGE_OFFSETS_KEY = 'minkoi_lyrics_offsets_v2';
    const STORAGE_CUSTOM_KEY = 'minkoi_lyrics_custom_v2';
    const MAX_MEMORY_ENTRIES = 64;
    const MAX_PERSISTED_CUSTOM = 32;

    const memoryCache = new Map();

    function safeGet(key, fallback) {
        try {
            const v = global.localStorage?.getItem(key);
            return v === null || v === undefined ? fallback : v;
        } catch (_) {
            return fallback;
        }
    }

    function safeSet(key, val) {
        try {
            global.localStorage?.setItem(key, val);
        } catch (_) {}
    }

    function readJsonMap(key) {
        try {
            const raw = safeGet(key, '{}');
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    /**
     * Build composite cache key tied to track ID, audio file URL/version, and schema.
     */
    function buildCacheKey(track) {
        if (!track) return 'unknown';
        const idPart = track.id != null ? String(track.id) : (track.spotifyTrackId || track.name || 'anon');
        const filePart = track.file || '';
        const verPart = track.version || 'default';
        return `v${CACHE_SCHEMA}::${idPart}::${verPart}::${filePart}`;
    }

    function getParsed(track) {
        const key = buildCacheKey(track);
        if (memoryCache.has(key)) {
            const entry = memoryCache.get(key);
            // Refresh LRU order
            memoryCache.delete(key);
            memoryCache.set(key, entry);
            return entry;
        }
        const persisted = readJsonMap(STORAGE_CACHE_KEY);
        const item = persisted[key];
        if (item && item.schemaVersion === CACHE_SCHEMA) {
            memoryCache.set(key, item);
            return item;
        }
        return null;
    }

    function setParsed(track, doc) {
        if (!track || !doc) return;
        const key = buildCacheKey(track);
        if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
            const oldestKey = memoryCache.keys().next().value;
            if (oldestKey !== undefined) memoryCache.delete(oldestKey);
        }
        memoryCache.set(key, doc);

        // Persist lightweight summary/custom docs only if small enough; custom raw docs live in STORAGE_CUSTOM_KEY
        if (doc.isCustomImported) {
            const persisted = readJsonMap(STORAGE_CACHE_KEY);
            persisted[key] = doc;
            safeSet(STORAGE_CACHE_KEY, JSON.stringify(persisted));
        }
    }

    function invalidate(track) {
        if (!track) return;
        const key = buildCacheKey(track);
        memoryCache.delete(key);
        const persisted = readJsonMap(STORAGE_CACHE_KEY);
        if (persisted[key]) {
            delete persisted[key];
            safeSet(STORAGE_CACHE_KEY, JSON.stringify(persisted));
        }
    }

    function clearAll() {
        memoryCache.clear();
        safeSet(STORAGE_CACHE_KEY, '{}');
    }

    // Per-track offset calibration (seconds, clamped [-15, +15])
    function getTrackOffsetSec(track) {
        if (!track) return 0;
        const map = readJsonMap(STORAGE_OFFSETS_KEY);
        const key = String(track.id ?? track.file ?? 'default');
        const val = parseFloat(map[key]);
        return Number.isFinite(val) ? val : 0.0;
    }

    function setTrackOffsetSec(track, seconds) {
        if (!track) return 0;
        const clamped = Math.max(-15.0, Math.min(15.0, Math.round((Number(seconds) || 0) * 10) / 10));
        const map = readJsonMap(STORAGE_OFFSETS_KEY);
        const key = String(track.id ?? track.file ?? 'default');
        if (Math.abs(clamped) < 0.001) {
            delete map[key];
        } else {
            map[key] = clamped;
        }
        safeSet(STORAGE_OFFSETS_KEY, JSON.stringify(map));
        return clamped;
    }

    // Custom user-imported TTML/ELRC/LRC per track
    function getCustomImport(track) {
        if (!track) return null;
        const key = buildCacheKey(track);
        const store = readJsonMap(STORAGE_CUSTOM_KEY);
        return store[key] || null;
    }

    function setCustomImport(track, rawText, format) {
        if (!track || typeof rawText !== 'string') return;
        const key = buildCacheKey(track);
        const store = readJsonMap(STORAGE_CUSTOM_KEY);
        const keys = Object.keys(store);
        if (keys.length >= MAX_PERSISTED_CUSTOM && !store[key]) {
            delete store[keys[0]];
        }
        store[key] = {
            schemaVersion: CACHE_SCHEMA,
            trackId: track.id,
            rawText,
            format: format || 'auto',
            updatedAt: Date.now()
        };
        safeSet(STORAGE_CUSTOM_KEY, JSON.stringify(store));
        invalidate(track);
    }

    function removeCustomImport(track) {
        if (!track) return;
        const key = buildCacheKey(track);
        const store = readJsonMap(STORAGE_CUSTOM_KEY);
        if (store[key]) {
            delete store[key];
            safeSet(STORAGE_CUSTOM_KEY, JSON.stringify(store));
        }
        invalidate(track);
    }

    ns.Cache = {
        CACHE_SCHEMA,
        buildCacheKey,
        getParsed,
        setParsed,
        invalidate,
        clearAll,
        getTrackOffsetSec,
        setTrackOffsetSec,
        getCustomImport,
        setCustomImport,
        removeCustomImport
    };
})(typeof window !== 'undefined' ? window : globalThis);
