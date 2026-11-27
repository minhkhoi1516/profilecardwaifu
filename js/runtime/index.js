/* ==========================================================================
   MINKOI 5.6 · UNIVERSAL ADAPTIVE RUNTIME & RECOVERY COORDINATOR
   Orchestrates Capabilities, NativeBridge (Kotlin/Wasm + Kotlin/JS),
   Scheduler, GPU Backend Manager, Cache Manager, and Perf Engine.
   Read-only diagnostic API (zero PII, zero server upload, no user perf menu).
   ========================================================================== */
(function (global) {
    'use strict';

    const VERSION = '5.6.1';
    const recoveryLog = [];
    const MAX_LOG = 24;

    // Lightweight, bounded live telemetry (zero PII, zero server upload, zero per-frame allocations)
    let longTaskCount = 0;
    let maxLongTaskMs = 0;
    const recentLongTaskTimes = [];
    const inputLatencies = new Float64Array(32);
    let inputLatCount = 0;
    let inputLatCursor = 0;
    let pendingInputStart = 0;
    let inputRaf = 0;

    if (typeof global.PerformanceObserver === 'function') {
        try {
            const ltObs = new global.PerformanceObserver((list) => {
                const entries = list.getEntries();
                const now = performance.now();
                for (let i = 0; i < entries.length; i++) {
                    const dur = entries[i].duration;
                    if (dur > 50) {
                        longTaskCount++;
                        if (dur > maxLongTaskMs) maxLongTaskMs = Number(dur.toFixed(1));
                        recentLongTaskTimes.push(now);
                    }
                }
                while (recentLongTaskTimes.length > 0 && (now - recentLongTaskTimes[0]) > 10000) {
                    recentLongTaskTimes.shift();
                }
            });
            ltObs.observe({ type: 'longtask', buffered: true });
        } catch (_) {}
    }

    if (global.document && typeof global.document.addEventListener === 'function') {
        global.document.addEventListener('pointerdown', () => {
            pendingInputStart = performance.now();
            if (!inputRaf && typeof global.requestAnimationFrame === 'function') {
                inputRaf = global.requestAnimationFrame(() => {
                    inputRaf = 0;
                    if (!pendingInputStart) return;
                    const lat = performance.now() - pendingInputStart;
                    pendingInputStart = 0;
                    if (lat >= 0 && lat < 2000) {
                        inputLatencies[inputLatCursor] = lat;
                        inputLatCursor = (inputLatCursor + 1) & 31;
                        if (inputLatCount < 32) inputLatCount++;
                    }
                });
            }
        }, { passive: true, capture: true });
    }

    function getTelemetrySummary() {
        const now = performance.now();
        while (recentLongTaskTimes.length > 0 && (now - recentLongTaskTimes[0]) > 10000) {
            recentLongTaskTimes.shift();
        }
        let inputP50 = 0;
        let inputP95 = 0;
        if (inputLatCount > 0) {
            const sorted = Array.from(inputLatencies.subarray(0, inputLatCount)).sort((a, b) => a - b);
            inputP50 = Number(sorted[Math.floor(sorted.length * 0.5)].toFixed(1));
            inputP95 = Number(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))].toFixed(1));
        }
        let heapUsedMB = null;
        let heapLimitMB = null;
        let memoryPressure = 'unavailable';
        const mem = global.performance?.memory;
        if (mem && Number.isFinite(mem.usedJSHeapSize) && Number.isFinite(mem.jsHeapSizeLimit) && mem.jsHeapSizeLimit > 0) {
            heapUsedMB = Number((mem.usedJSHeapSize / 1048576).toFixed(2));
            heapLimitMB = Number((mem.jsHeapSizeLimit / 1048576).toFixed(2));
            const ratio = mem.usedJSHeapSize / mem.jsHeapSizeLimit;
            memoryPressure = ratio >= 0.8 ? 'high' : (ratio >= 0.6 ? 'elevated' : 'normal');
        }
        return {
            longTaskCount,
            recentLongTasks10s: recentLongTaskTimes.length,
            maxLongTaskMs,
            inputLatencySamples: inputLatCount,
            inputLatencyP50Ms: inputP50,
            inputLatencyP95Ms: inputP95,
            heapUsedMB,
            heapLimitMB,
            memoryPressure
        };
    }

    function recordRecovery(subsystem, event, detail = '') {
        recoveryLog.push({
            at: Date.now(),
            subsystem,
            event,
            detail: String(detail || '').slice(0, 120)
        });
        if (recoveryLog.length > MAX_LOG) recoveryLog.shift();
    }

    global.addEventListener('minkoi:gpuloss', (e) => {
        recordRecovery('gpu', 'context-or-device-lost', e?.detail?.backend || '');
    });
    global.addEventListener('minkoi:gpurestored', (e) => {
        recordRecovery('gpu', 'restored', e?.detail?.backend || '');
    });

    // Boot non-blocking runtime initialization after DOM parses so critical startup stays instant
    function bootstrap() {
        const caps = global.MinkoiCapabilities;
        const bridge = global.MinkoiNativeBridge;
        const scheduler = global.MinkoiScheduler;
        const cache = global.MinkoiCache;

        // 1. Async capability probe (WebGPU adapter + refresh estimate) deferred slightly
        //    so fluid-bg.js can report its real WebGL context first (avoiding duplicate GPU probes).
        const runAsyncProbe = () => {
            if (!caps?.probeAsync) return;
            caps.probeAsync().then((snap) => {
                // Persist sanitized capability summary (no hardware fingerprint!) in Layer 4 IDB
                cache?.setMeta?.('runtime_boot', {
                    version: VERSION,
                    webgl2: Boolean(snap.webgl?.webgl2),
                    webgpu: Boolean(snap.webgpu?.available),
                    wasmGc: Boolean(snap.wasm?.gc),
                    wasmSimd: Boolean(snap.wasm?.simd),
                    refreshEstimateHz: snap.refreshEstimateHz
                }).catch(() => {});
            }).catch(() => {});
        };
        if (global.document?.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', () => global.setTimeout(runAsyncProbe, 120), { once: true });
        } else {
            global.setTimeout(runAsyncProbe, 120);
        }

        // 2. Lazy Kotlin/JS (~32.2 KB gzip, default) -> Kotlin/WasmGC (~127.4 KB gzip, fallback/opt-in)
        //    upgrade strictly AFTER window load so module fetches never delay onload or compete with artwork/shader boot.
        //    (MinkoiNativeBridge serves synchronous JS math from t=0 until upgrade completes.)
        const initBridge = () => {
            const run = () => {
                bridge?.init?.().catch((err) => {
                    recordRecovery('native-bridge', 'fallback-active', err?.message || '');
                });
            };
            if (scheduler?.schedule) {
                scheduler.schedule('precompute', run, { key: 'native-bridge-init' });
            } else {
                global.setTimeout(run, 50);
            }
        };
        if (global.document?.readyState === 'complete') {
            global.setTimeout(initBridge, 80);
        } else {
            global.addEventListener('load', () => global.setTimeout(initBridge, 80), { once: true });
        }

        // 3. Register Layer 3 App-Shell Service Worker cleanly when settled & idle
        //    so SW install/claim never contends with startup or active first interactions.
        const initSw = () => {
            if (scheduler?.isInteracting?.()) {
                global.setTimeout(initSw, 2500);
                return;
            }
            const run = () => {
                cache?.registerServiceWorker?.().catch(() => {});
            };
            if (scheduler?.schedule) {
                scheduler.schedule('cache', run, { key: 'sw-register' });
            } else {
                run();
            }
        };
        if (global.document?.readyState === 'complete') {
            global.setTimeout(initSw, 8000);
        } else {
            global.addEventListener('load', () => global.setTimeout(initSw, 8000), { once: true });
        }
    }

    function getDiagnostics() {
        const capSnap = global.MinkoiCapabilities?.getSnapshot?.() || null;
        return {
            version: VERSION,
            capabilities: capSnap ? {
                webgpu: capSnap.webgpu.available,
                webgpuApiPresent: capSnap.webgpu.apiPresent,
                webgl2: capSnap.webgl.webgl2,
                webgl1: capSnap.webgl.webgl1,
                shaderCompileOk: capSnap.webgl.shaderCompileOk,
                isSoftwareGpu: capSnap.webgl.isSoftwareGpu,
                rendererMasked: capSnap.webgl.rendererMasked,
                offscreenCanvas: capSnap.offscreenCanvas,
                workers: capSnap.workers,
                sharedArrayBuffer: capSnap.sharedArrayBuffer,
                crossOriginIsolated: capSnap.crossOriginIsolated,
                wasm: capSnap.wasm,
                audioWorklet: capSnap.audioWorklet,
                indexedDB: capSnap.indexedDB,
                serviceWorker: capSnap.serviceWorker,
                cacheApi: capSnap.cacheApi,
                dpr: capSnap.dpr,
                viewport: capSnap.viewport,
                reducedMotion: capSnap.reducedMotion,
                refreshEstimateHz: capSnap.refreshEstimateHz
            } : null,
            nativeBridge: global.MinkoiNativeBridge?.getState?.() || null,
            scheduler: global.MinkoiScheduler?.getStats?.() || null,
            gpu: global.MinkoiGpuManager?.getState?.() || null,
            cache: global.MinkoiCache?.getStats?.() || null,
            perf: global.MinkoiPerf?.getState?.() || null,
            foundation: global.MinkoiFoundation?.getInfo?.() || null,
            materials: global.MinkoiMaterialManager?.getStats?.() || null,
            telemetry: getTelemetrySummary(),
            recoveryCount: recoveryLog.length,
            recentRecoveries: recoveryLog.slice(-6)
        };
    }

    global.MinkoiRuntime = Object.freeze({
        VERSION,
        getDiagnostics,
        getTelemetrySummary,
        recordRecovery
    });

    bootstrap();
})(typeof window !== 'undefined' ? window : globalThis);
