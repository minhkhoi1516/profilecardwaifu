/* ==========================================================================
   MINKOI 5.6 · DEVICE CAPABILITY DETECTOR
   Pure browser feature detection (no UA guessing, no server fingerprinting).
   Evaluates WebGPU, WebGL2/1, Shader compilation, OffscreenCanvas, Workers,
   WASM/SIMD/WasmGC/Threads, AudioWorklet, Storage/Cache, Display & Network.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    const nav = global.navigator || {};
    const SOFTWARE_GPU_RE = /swiftshader|llvmpipe|software|basic render driver|mesa offscreen|subzero/i;

    function probeWasmFeatures() {
        const supported = typeof global.WebAssembly === 'object' &&
            typeof global.WebAssembly.validate === 'function';
        if (!supported) {
            return { supported: false, simd: false, gc: false, threads: false, streaming: false };
        }
        let simd = false;
        let gc = false;
        try {
            // Minimal valid WASM SIMD (v128.const) module
            simd = global.WebAssembly.validate(new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0,
                1, 5, 1, 96, 0, 1, 123,
                3, 2, 1, 0,
                10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
            ]));
        } catch (_) {}
        try {
            // Minimal valid WasmGC empty struct type module (section 1, len 3: count=1, struct=0x5f, fields=0)
            gc = global.WebAssembly.validate(new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0,
                1, 3, 1, 95, 0
            ]));
        } catch (_) {}
        const threads = Boolean(
            typeof global.SharedArrayBuffer !== 'undefined' &&
            global.crossOriginIsolated === true
        );
        const streaming = typeof global.WebAssembly.instantiateStreaming === 'function';
        return { supported, simd, gc, threads, streaming };
    }

    function inspectWebGLContext(gl, isGl2) {
        const out = state.webgl;
        if (!gl) return out;
        out.webgl2 = Boolean(isGl2 || (typeof global.WebGL2RenderingContext !== 'undefined' && gl instanceof global.WebGL2RenderingContext));
        out.webgl1 = true;
        out.shaderCompileOk = true;
        try {
            out.maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || out.maxTextureSize;
            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            const unmaskedRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
            const unmaskedVendor = dbg ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '') : '';
            const fallbackRenderer = String(gl.getParameter(gl.RENDERER) || '');
            const fallbackVendor = String(gl.getParameter(gl.VENDOR) || '');
            out.renderer = unmaskedRenderer || fallbackRenderer;
            out.vendor = unmaskedVendor || fallbackVendor;
            out.rendererMasked = !unmaskedRenderer || /^(webkit webgl|apple gpu|mozilla)$/i.test(out.renderer.trim());
            out.isSoftwareGpu = SOFTWARE_GPU_RE.test(out.renderer);
            global.__minkoiSoftwareGpu = out.isSoftwareGpu;
        } catch (_) {}
        return out;
    }

    function probeWebGL() {
        const out = {
            webgl2: typeof global.WebGL2RenderingContext !== 'undefined',
            webgl1: typeof global.WebGLRenderingContext !== 'undefined',
            shaderCompileOk: false,
            rendererMasked: true,
            renderer: '',
            vendor: '',
            isSoftwareGpu: false,
            maxTextureSize: 0
        };
        // Avoid allocating a duplicate throwaway WebGL context on the critical path when
        // #fluid-bg-canvas is present and will report its real context moments later.
        if (doc && doc.getElementById && doc.getElementById('fluid-bg-canvas')) {
            return out;
        }
        if (!doc || typeof doc.createElement !== 'function') return out;
        try {
            const c = doc.createElement('canvas');
            c.width = 2;
            c.height = 2;
            let gl = c.getContext('webgl2', { alpha: true, antialias: false, depth: false });
            if (gl) {
                out.webgl2 = true;
                out.webgl1 = true;
            } else {
                gl = c.getContext('webgl', { alpha: true, antialias: false, depth: false }) ||
                     c.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });
                out.webgl1 = Boolean(gl);
            }
            if (gl) {
                out.maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
                const dbg = gl.getExtension('WEBGL_debug_renderer_info');
                const unmaskedRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
                const unmaskedVendor = dbg ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '') : '';
                const fallbackRenderer = String(gl.getParameter(gl.RENDERER) || '');
                const fallbackVendor = String(gl.getParameter(gl.VENDOR) || '');
                out.renderer = unmaskedRenderer || fallbackRenderer;
                out.vendor = unmaskedVendor || fallbackVendor;
                out.rendererMasked = !unmaskedRenderer || /^(webkit webgl|apple gpu|mozilla)$/i.test(out.renderer.trim());
                out.isSoftwareGpu = SOFTWARE_GPU_RE.test(out.renderer);

                const vs = gl.createShader(gl.VERTEX_SHADER);
                const fs = gl.createShader(gl.FRAGMENT_SHADER);
                if (vs && fs) {
                    gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}');
                    gl.compileShader(vs);
                    gl.shaderSource(fs, 'precision mediump float;void main(){gl_FragColor=vec4(1.0);}');
                    gl.compileShader(fs);
                    out.shaderCompileOk = Boolean(
                        gl.getShaderParameter(vs, gl.COMPILE_STATUS) &&
                        gl.getShaderParameter(fs, gl.COMPILE_STATUS)
                    );
                    gl.deleteShader(vs);
                    gl.deleteShader(fs);
                }
                const loseExt = gl.getExtension('WEBGL_lose_context');
                if (loseExt) {
                    try { loseExt.loseContext(); } catch (_) {}
                }
            }
        } catch (_) {}
        return out;
    }

    function readNetworkHints() {
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection || null;
        if (!conn) return { available: false, saveData: false, effectiveType: null, downlink: null };
        return {
            available: true,
            saveData: Boolean(conn.saveData),
            effectiveType: conn.effectiveType || null,
            downlink: Number.isFinite(conn.downlink) ? conn.downlink : null
        };
    }

    const wasm = probeWasmFeatures();
    const webgl = probeWebGL();
    const AudioCtxClass = global.AudioContext || global.webkitAudioContext || null;
    const reducedMotionMQ = typeof global.matchMedia === 'function'
        ? global.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const state = {
        detectedAt: Date.now(),
        webgpu: {
            apiPresent: Boolean(nav.gpu && typeof nav.gpu.requestAdapter === 'function'),
            probed: false,
            available: false,
            features: [],
            limits: null
        },
        webgl,
        offscreenCanvas: typeof global.OffscreenCanvas !== 'undefined',
        workers: typeof global.Worker !== 'undefined',
        sharedArrayBuffer: typeof global.SharedArrayBuffer !== 'undefined',
        crossOriginIsolated: Boolean(global.crossOriginIsolated),
        wasm,
        audioWorklet: Boolean(AudioCtxClass && AudioCtxClass.prototype && 'audioWorklet' in AudioCtxClass.prototype),
        indexedDB: typeof global.indexedDB !== 'undefined',
        serviceWorker: Boolean('serviceWorker' in nav),
        cacheApi: Boolean('caches' in global),
        hardwareConcurrency: Number.isFinite(nav.hardwareConcurrency) ? nav.hardwareConcurrency : null,
        deviceMemoryGB: Number.isFinite(nav.deviceMemory) ? nav.deviceMemory : null,
        dpr: Number(global.devicePixelRatio) || 1,
        viewport: {
            width: global.innerWidth || 0,
            height: global.innerHeight || 0
        },
        reducedMotion: Boolean(reducedMotionMQ?.matches),
        visibilityState: doc?.visibilityState || 'visible',
        network: readNetworkHints(),
        refreshEstimateHz: null
    };

    // Publish software GPU flag early so every downstream module (stars/fluid/perf) reads a consistent signal
    global.__minkoiSoftwareGpu = webgl.isSoftwareGpu;

    let asyncProbePromise = null;
    function probeAsync() {
        if (asyncProbePromise) return asyncProbePromise;
        asyncProbePromise = (async () => {
            // 1. WebGPU adapter probe (strictly feature-detected; skip on confirmed software GPU
            //    where no hardware WebGPU adapter exists and ANGLE D3D11 queries stall/error)
            if (state.webgpu.apiPresent && !state.webgl.isSoftwareGpu) {
                try {
                    const adapter = await nav.gpu.requestAdapter();
                    if (adapter) {
                        state.webgpu.available = true;
                        state.webgpu.features = Array.from(adapter.features || []).slice(0, 16);
                        state.webgpu.limits = {
                            maxTextureDimension2D: adapter.limits?.maxTextureDimension2D || 0,
                            maxComputeWorkgroupSizeX: adapter.limits?.maxComputeWorkgroupSizeX || 0,
                            maxStorageBufferBindingSize: adapter.limits?.maxStorageBufferBindingSize || 0
                        };
                    }
                } catch (_) {
                    state.webgpu.available = false;
                }
            }
            state.webgpu.probed = true;

            // 2. Non-intrusive 8-frame display refresh timing probe (skip on software GPU;
            //    capped at 350ms so slow GPUs never stall)
            if (!state.webgl.isSoftwareGpu && doc && !doc.hidden && typeof global.requestAnimationFrame === 'function') {
                await new Promise((resolve) => {
                    const deltas = [];
                    let last = 0;
                    let count = 0;
                    let done = false;
                    const finish = () => {
                        if (done) return;
                        done = true;
                        if (deltas.length >= 3) {
                            deltas.sort((a, b) => a - b);
                            const med = deltas[Math.floor(deltas.length / 2)];
                            if (med > 2 && med < 100) {
                                state.refreshEstimateHz = Math.round(1000 / med);
                            }
                        }
                        resolve();
                    };
                    const guardTimer = global.setTimeout(finish, 350);
                    function step(now) {
                        if (done || doc.hidden || count >= 8) {
                            global.clearTimeout(guardTimer);
                            finish();
                            return;
                        }
                        if (last) deltas.push(now - last);
                        last = now;
                        count++;
                        global.requestAnimationFrame(step);
                    }
                    global.requestAnimationFrame(step);
                });
            }

            global.dispatchEvent(new CustomEvent('minkoi:capabilitiesready', {
                detail: getSnapshot()
            }));
            return getSnapshot();
        })();
        return asyncProbePromise;
    }

    function getSnapshot() {
        state.dpr = Number(global.devicePixelRatio) || 1;
        state.viewport.width = global.innerWidth || 0;
        state.viewport.height = global.innerHeight || 0;
        state.reducedMotion = Boolean(reducedMotionMQ?.matches);
        state.visibilityState = doc?.visibilityState || 'visible';
        state.network = readNetworkHints();
        return {
            ...state,
            webgpu: { ...state.webgpu, features: state.webgpu.features.slice(), limits: state.webgpu.limits ? { ...state.webgpu.limits } : null },
            webgl: { ...state.webgl },
            wasm: { ...state.wasm },
            viewport: { ...state.viewport },
            network: { ...state.network }
        };
    }

    if (reducedMotionMQ && typeof reducedMotionMQ.addEventListener === 'function') {
        reducedMotionMQ.addEventListener('change', () => {
            state.reducedMotion = Boolean(reducedMotionMQ.matches);
        });
    }

    global.MinkoiCapabilities = Object.freeze({
        getSnapshot,
        probeAsync,
        reportWebGLContext: inspectWebGLContext,
        isSoftwareGpu: () => state.webgl.isSoftwareGpu,
        supportsWebGPU: () => state.webgpu.available,
        supportsWebGL2: () => state.webgl.webgl2 && state.webgl.shaderCompileOk,
        supportsWebGL1: () => state.webgl.webgl1 && state.webgl.shaderCompileOk,
        supportsWorkerBitmapDecode: () => Boolean(state.workers && state.offscreenCanvas && typeof global.createImageBitmap === 'function'),
        canPreloadAggressively: () => {
            const net = readNetworkHints();
            if (net.saveData) return false;
            if (net.effectiveType && /^(slow-2g|2g|3g)$/i.test(net.effectiveType)) return false;
            if (state.deviceMemoryGB !== null && state.deviceMemoryGB <= 3) return false;
            return true;
        }
    });
})(typeof window !== 'undefined' ? window : globalThis);
