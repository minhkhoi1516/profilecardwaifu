/* ==========================================================================
   MINKOI 5.6 · POOLED COMPUTE & DECODE WEB WORKER
   Runs off the main thread for independent workloads:
   - Async off-main-thread ImageBitmap fetch + decode (when supported)
   - Lyrics search/normalization index precomputation
   - Spectrum / vector batch helpers
   Never requires SharedArrayBuffer; falls back cleanly on main thread if unavailable.
   ========================================================================== */
'use strict';

self.onmessage = async function (event) {
    const msg = event.data;
    if (!msg || !msg.id) return;
    const { id, type, payload } = msg;

    try {
        if (type === 'ping') {
            self.postMessage({ id, ok: true, result: { pong: true, canBitmap: typeof createImageBitmap === 'function' } });
            return;
        }

        if (type === 'decodeBitmap') {
            if (typeof createImageBitmap !== 'function' || typeof fetch !== 'function') {
                self.postMessage({ id, ok: false, error: 'createImageBitmap unavailable in worker' });
                return;
            }
            const url = String(payload?.url || '');
            if (!url) {
                self.postMessage({ id, ok: false, error: 'Missing url' });
                return;
            }
            const t0 = performance.now();
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) {
                self.postMessage({ id, ok: false, error: `HTTP ${res.status}` });
                return;
            }
            const blob = await res.blob();
            const bitmap = await createImageBitmap(blob);
            const decodeMs = Number((performance.now() - t0).toFixed(2));
            self.postMessage({
                id,
                ok: true,
                result: { url, width: bitmap.width, height: bitmap.height, decodeMs, bitmap }
            }, [bitmap]);
            return;
        }

        if (type === 'indexTracks') {
            const tracks = Array.isArray(payload?.tracks) ? payload.tracks : [];
            const index = tracks.map(t => ({
                id: t.id,
                haystack: `${t.name || ''} ${t.artist || ''} ${t.album || ''} ${t.persona || ''}`.toLowerCase()
            }));
            self.postMessage({ id, ok: true, result: { count: index.length, index } });
            return;
        }

        if (type === 'computeBandEnergies') {
            const bins = payload?.bins;
            const count = Number(payload?.bandCount) || 16;
            if (!bins || !bins.length) {
                self.postMessage({ id, ok: true, result: { bands: [] } });
                return;
            }
            const out = new Float32Array(count);
            const stride = Math.max(1, Math.floor(bins.length / count));
            for (let b = 0; b < count; b++) {
                let sum = 0;
                const start = b * stride;
                const end = Math.min(bins.length, start + stride);
                for (let i = start; i < end; i++) sum += bins[i];
                out[b] = sum / Math.max(1, (end - start) * 255);
            }
            self.postMessage({ id, ok: true, result: { bands: out } }, [out.buffer]);
            return;
        }

        self.postMessage({ id, ok: false, error: `Unknown worker op: ${type}` });
    } catch (err) {
        self.postMessage({ id, ok: false, error: String(err?.message || err) });
    }
};
