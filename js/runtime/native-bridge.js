/* ==========================================================================
   MINKOI 5.6 · JS <-> KOTLIN/WASM NATIVE LIBRARY BRIDGE
   Typed, versioned bridge loading `minkoi-native-core` which DIRECTLY links
   official Maven Central KMP artifacts (zero Skiko, verified skikoImports=0):
     - Direct Maven: top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01 (folmeSpring)
                     io.github.suqi8.coui.kmp:coui-ui:2.1.0 (COUISpringEasing,
                     COUIEase/In/Move/Out, couiSpring, SinkFeedback)
                     org.jetbrains.compose.animation:animation-core
     - Reference Math Adapters (explicitly NOT direct Maven calls):
                     Miuix internal SpringMath / private PressFeedback
                     Backdrop internal Shaders.kt SDF math
   Boot strategy:
     1. Instant synchronous JS fallback at t=0 (zero startup blocking)
     2. Lazy upgrade after window load to Kotlin/JS ES modules (DEFAULT: ~32.2 KB gzip,
        zero WasmGC requirement, 1.2x-3.5x faster on per-frame springStep hot-path)
     3. Optional / fallback Kotlin/WasmGC (~127.4 KB gzip) if Kotlin/JS fails or
        explicitly requested via options.preferWasm / ?nativeTarget=wasm
     4. Automatic recovery to JS fallback on any load or runtime exception
     5. Never loads both WASM and JS simultaneously on the normal path
   ========================================================================== */
(function (global) {
    'use strict';

    const PROTOCOL_VERSION = '5.6.1';
    const WASM_MODULE_URL = new URL('js/native/minkoi-native-core-wasm.mjs', global.location?.href || 'http://localhost/').href;
    const JS_MODULE_URL = new URL('js/native/minkoi-native-core-js.mjs', global.location?.href || 'http://localhost/').href;

    const INTEGRATION_PROVENANCE = Object.freeze({
        directMaven: Object.freeze([
            'top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01 (Apache-2.0: folmeSpring)',
            'io.github.suqi8.coui.kmp:coui-ui:2.1.0 (Apache-2.0: COUISpringEasing, COUIEase/In/Move/Out, couiSpring, SinkFeedback)',
            'org.jetbrains.compose.animation:animation-core:1.13.0-rc01 (Apache-2.0: FloatSpringSpec cached zero-alloc)'
        ]),
        webgl2ShaderPorts: Object.freeze([
            'io.github.kyant0:backdrop:2.0.1 Shaders.kt -> js/ui/materials/liquid-renderer.js (sdRoundedRect, circleMap, RoundedRectRefractionWithDispersion, DefaultHighlight)',
            'top.yukonga.miuix.kmp:miuix-material:0.9.5-rc01 EdgeStrokeShader.kt -> js/ui/materials/liquid-renderer.js (light-only dual-light EdgeStroke, GlassRim, GlassMask)',
            'io.github.suqi8.coui.kmp:coui-squircle:2.1.0 SoftCapsule -> js/ui/materials/liquid-renderer.js (SoftCapsule + matched Superellipse Squircle SDF)'
        ]),
        referenceAdapters: Object.freeze([
            'Miuix SpringUtils.kt internal SpringMath (obtainDampingDistance, obtainTouchDistance)',
            'Miuix PressFeedback.kt private pressFeedbackStrength (2 / (1 + max(1, maxSideDp / 160))) via js/ui/foundation.js',
            'Backdrop Shaders.kt internal SDF/refraction/highlight math (CPU query helpers mirroring GPU shader)'
        ]),
        incompatibleDirect: Object.freeze([
            'miuix-blur / miuix-glass / miuix-squircle Compose widgets (requires Skiko canvas)',
            'coui-blur / coui-shader / COUIMaterialEffect / TiltLight Compose widgets (requires Skiko / Android sensors)',
            'io.github.kyant0:backdrop:2.0.1 RuntimeEffect Composable (requires Compose UI + Skiko; ported to WebGL2 GLSL ES 3.00 in js/ui/materials/liquid-renderer.js)'
        ])
    });

    // Cubic-bezier solver for synchronous fallback matching COUIEaseInterpolators
    function evalCubicBezier(x1, y1, x2, y2, t) {
        const u = Math.max(0, Math.min(1, t));
        if (u <= 0 || u >= 1) return u;
        let lo = 0, hi = 1, mid = u;
        for (let i = 0; i < 12; i++) {
            mid = (lo + hi) * 0.5;
            const omt = 1 - mid;
            const x = 3 * omt * omt * mid * x1 + 3 * omt * mid * mid * x2 + mid * mid * mid;
            if (x < u) lo = mid; else hi = mid;
        }
        const omt = 1 - mid;
        return 3 * omt * omt * mid * y1 + 3 * omt * mid * mid * y2 + mid * mid * mid;
    }

    let lastFallbackVel = 0;
    const fallbackImpl = {
        minkoiNativeVersion: () => '5.6.1-js-fallback',
        miuixFolmeStiffness(damping, response) {
            const r = Math.max(0.05, response || 0.35);
            const w = (2 * Math.PI) / r;
            return w * w;
        },
        miuixFolmeStepValue(value, target, velocity, dt, damping, response) {
            const k = fallbackImpl.miuixFolmeStiffness(damping, response);
            return fallbackImpl.springStepValue(value, target, velocity, dt, damping, k, 1);
        },
        miuixObtainDampingDistance(inputDistance, range) {
            if (!range || !inputDistance) return 0;
            const dir = Math.sign(inputDistance);
            const x = Math.max(0, Math.min(Math.abs(inputDistance) / range, 1));
            return dir * (x - x * x + (x * x * x) / 3) * range;
        },
        miuixObtainTouchDistance(currentPixelOffset, range) {
            if (!range) return 0;
            let absOff = Math.abs(currentPixelOffset);
            const absMax = Math.abs(fallbackImpl.miuixObtainDampingDistance(range, range));
            if (absOff <= 0) return 0;
            if (absOff >= absMax) absOff = absMax;
            const base = range - 3 * absOff;
            const part2 = Math.pow(range, 2 / 3) * Math.sign(base) * Math.pow(Math.abs(base), 1 / 3);
            return Math.sign(currentPixelOffset) * (range - part2);
        },
        // Exact upstream Miuix PressFeedback.kt formula: 2 / (1 + max(1, maxSideDp / 160))
        miuixPressStrength(widthPx, heightPx, density) {
            const safeD = Math.max(1, density || 1);
            const maxSideDp = Math.max(widthPx || 0, heightPx || 0) / safeD;
            const sizeRatio = Math.max(1, maxSideDp / 160);
            return 2 / (1 + sizeRatio);
        },
        couiStiffnessFromResponse(response) {
            const r = response === 0 ? 1 : Math.max(0.05, response);
            const w = (2 * Math.PI) / r;
            return w * w;
        },
        couiDampingFromBounce(bounce) {
            return Math.max(0, 1 - bounce);
        },
        couiSpringEasing(fraction, response, bounce) {
            const t = Math.max(0, fraction);
            const w = (2 * Math.PI) / (response === 0 ? 1 : response);
            const z = (1 - bounce) <= 0 ? 1.15 : (1 - bounce);
            const raw = (u) => {
                const decay = Math.exp(-z * w * u);
                if (z < 1) {
                    const wd = Math.sqrt(1 - z * z) * w;
                    return 1 - decay * (Math.cos(wd * u) + ((z * w) / wd) * Math.sin(wd * u));
                }
                if (z === 1) return 1 - (w * u + 1) * Math.exp(-w * u);
                const s = w * Math.sqrt(z * z - 1);
                return 1 - (decay / s) * (z * w * Math.sinh(s * u) + s * Math.cosh(s * u));
            };
            const end = raw(1) || 1;
            return raw(t) / end;
        },
        couiBezierEasing(kind, fraction) {
            if (kind === 1) return evalCubicBezier(0, 0, 0.1, 1, fraction);
            if (kind === 2) return evalCubicBezier(0.3, 0, 0.1, 1, fraction);
            if (kind === 3) return evalCubicBezier(0.3, 0, 1, 1, fraction);
            return evalCubicBezier(0.33, 0, 0.67, 1, fraction);
        },
        couiSpringStepValue(value, target, velocity, dt, response, bounce) {
            const k = fallbackImpl.couiStiffnessFromResponse(response);
            const z = Math.max(0.05, 1 - bounce);
            return fallbackImpl.springStepValue(value, target, velocity, dt, z, k, 1);
        },
        couiDefaultSinkAmount: () => 0.94,
        springStepValue(value, target, velocity, dt, dampingRatio, stiffness, mass) {
            const omega = Math.sqrt(stiffness / Math.max(0.001, mass));
            const zeta = Math.max(0.05, dampingRatio);
            const x = value - target;
            const v = velocity;
            let nextX, nextV;
            if (Math.abs(zeta - 1) < 1e-5) {
                const b = v + omega * x;
                const decay = Math.exp(-omega * dt);
                nextX = (x + b * dt) * decay;
                nextV = (v - omega * b * dt) * decay;
            } else if (zeta < 1) {
                const alpha = zeta * omega;
                const wd = omega * Math.sqrt(1 - zeta * zeta);
                const b = (v + alpha * x) / wd;
                const c = Math.cos(wd * dt);
                const s = Math.sin(wd * dt);
                const decay = Math.exp(-alpha * dt);
                nextX = decay * (x * c + b * s);
                nextV = decay * (v * c - (alpha * b + wd * x) * s);
            } else {
                const root = Math.sqrt(zeta * zeta - 1);
                const r1 = -omega / (zeta + root);
                const r2 = -omega * (zeta + root);
                const a = (v - r2 * x) / (r1 - r2);
                const b = x - a;
                const e1 = Math.exp(r1 * dt);
                const e2 = Math.exp(r2 * dt);
                nextX = a * e1 + b * e2;
                nextV = r1 * a * e1 + r2 * b * e2;
            }
            lastFallbackVel = nextV;
            return target + nextX;
        },
        springStepLastVelocity: () => lastFallbackVel,
        backdropHighlightIntensity(coordX, coordY, width, height, radius, angleRad, falloff) {
            const hw = width * 0.5, hh = height * 0.5;
            const cx = coordX - hw, cy = coordY - hh;
            const r = Math.min(Math.min(radius * 1.5, Math.min(hw, hh)), Math.min(hw, hh));
            const kx = Math.abs(cx) - (hw - r), ky = Math.abs(cy) - (hh - r);
            const sx = cx >= 0 ? 1 : -1, sy = cy >= 0 ? 1 : -1;
            let gx = 0, gy = 0;
            if (kx >= 0 || ky >= 0) {
                const len = Math.hypot(Math.max(kx, 0), Math.max(ky, 0));
                if (len > 1e-6) { gx = sx * (Math.max(kx, 0) / len); gy = sy * (Math.max(ky, 0) / len); }
            } else {
                const sel = kx >= ky ? 1 : 0;
                gx = sx * sel; gy = sy * (1 - sel);
            }
            const d = gx * Math.cos(angleRad) + gy * Math.sin(angleRad);
            return Math.pow(Math.abs(d), Math.max(0.1, falloff));
        },
        backdropRefractionMagnitude(coordX, coordY, width, height, radius, refractionHeight, refractionAmount) {
            if (refractionHeight <= 0) return 0;
            const hw = width * 0.5, hh = height * 0.5;
            const r = Math.min(radius, Math.min(hw, hh));
            const qx = Math.abs(coordX - hw) - (hw - r);
            const qy = Math.abs(coordY - hh) - (hh - r);
            const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
            if (-sd >= refractionHeight) return 0;
            const clamped = Math.max(0, Math.min(1, 1 - (-Math.min(sd, 0) / refractionHeight)));
            return (1 - Math.sqrt(Math.max(0, 1 - clamped * clamped))) * refractionAmount;
        }
    };

    let activeImpl = fallbackImpl;
    let backend = 'js-fallback';
    let version = fallbackImpl.minkoiNativeVersion();
    let loadTimeMs = 0;
    let lastError = null;
    let initPromise = null;
    let disposed = false;
    const loadedTargets = [];

    function resolveTargetPreference(options = {}) {
        if (options.forceFallback) return 'fallback';
        if (options.preferWasm) return 'wasm';
        if (options.preferJs) return 'js';
        try {
            const param = new URLSearchParams(global.location?.search || '').get('nativeTarget');
            if (param === 'wasm' || param === 'js' || param === 'fallback') return param;
        } catch (_) {}
        return 'js'; // Production default: Kotlin/JS (~32.2 KB gzip, wider compatibility, faster springStep hot-path)
    }

    async function tryLoadKotlinJs(t0) {
        try {
            const mod = await import(JS_MODULE_URL);
            loadedTargets.push('kotlin-js');
            if (validateExports(mod) && verifyRoundTrip(mod) && !disposed) {
                activeImpl = mod;
                backend = 'kotlin-js';
                version = String(mod.minkoiNativeVersion());
                loadTimeMs = Number((performance.now() - t0).toFixed(2));
                global.dispatchEvent(new CustomEvent('minkoi:nativebridgeready', { detail: getState() }));
                return true;
            }
        } catch (err) {
            lastError = `${lastError ? lastError + '; ' : ''}kotlin-js: ${String(err?.message || err)}`;
        }
        return false;
    }

    async function tryLoadKotlinWasm(t0) {
        const caps = global.MinkoiCapabilities?.getSnapshot?.();
        if (caps && (!caps.wasm?.supported || !caps.wasm?.gc)) {
            lastError = `${lastError ? lastError + '; ' : ''}wasm: WasmGC unsupported`;
            return false;
        }
        try {
            const mod = await import(WASM_MODULE_URL);
            loadedTargets.push('kotlin-wasm');
            if (validateExports(mod) && verifyRoundTrip(mod) && !disposed) {
                activeImpl = mod;
                backend = 'kotlin-wasm';
                version = String(mod.minkoiNativeVersion());
                loadTimeMs = Number((performance.now() - t0).toFixed(2));
                global.dispatchEvent(new CustomEvent('minkoi:nativebridgeready', { detail: getState() }));
                return true;
            }
        } catch (err) {
            lastError = `${lastError ? lastError + '; ' : ''}wasm: ${String(err?.message || err)}`;
        }
        return false;
    }

    function validateExports(mod) {
        return Boolean(
            mod &&
            typeof mod.minkoiNativeVersion === 'function' &&
            typeof mod.miuixFolmeStiffness === 'function' &&
            typeof mod.miuixFolmeStepValue === 'function' &&
            typeof mod.couiSpringEasing === 'function' &&
            typeof mod.couiBezierEasing === 'function' &&
            typeof mod.couiSpringStepValue === 'function' &&
            typeof mod.couiDefaultSinkAmount === 'function' &&
            typeof mod.miuixObtainDampingDistance === 'function' &&
            typeof mod.springStepValue === 'function' &&
            typeof mod.springStepLastVelocity === 'function' &&
            typeof mod.backdropHighlightIntensity === 'function' &&
            typeof mod.backdropRefractionMagnitude === 'function'
        );
    }

    function verifyRoundTrip(mod) {
        const damped = mod.miuixObtainDampingDistance(50, 100);
        const couiEase = mod.couiSpringEasing(0.5, 0.35, 0.2);
        const miuixStiff = mod.miuixFolmeStiffness(0.85, 0.35);
        const sink = mod.couiDefaultSinkAmount();
        return (
            Number.isFinite(damped) && Math.abs(damped - 29.1667) < 0.05 &&
            Number.isFinite(couiEase) && couiEase > 0.5 && couiEase < 1.3 &&
            Number.isFinite(miuixStiff) && miuixStiff > 300 &&
            Number.isFinite(sink) && Math.abs(sink - 0.94) < 0.01
        );
    }

    async function init(options = {}) {
        if (initPromise) return initPromise;
        const pref = resolveTargetPreference(options);
        initPromise = (async () => {
            if (disposed || pref === 'fallback' || global.location?.protocol === 'file:') {
                backend = 'js-fallback';
                global.dispatchEvent(new CustomEvent('minkoi:nativebridgeready', { detail: getState() }));
                return getState();
            }
            const t0 = performance.now();

            if (pref === 'wasm') {
                // Explicit opt-in: Kotlin/WasmGC first, Kotlin/JS fallback
                if (await tryLoadKotlinWasm(t0)) return getState();
                if (await tryLoadKotlinJs(t0)) return getState();
            } else {
                // Default production order: Kotlin/JS first (~32.2 KB gzip), Kotlin/WasmGC fallback only on error
                if (await tryLoadKotlinJs(t0)) return getState();
                if (await tryLoadKotlinWasm(t0)) return getState();
            }

            backend = 'js-fallback';
            loadTimeMs = Number((performance.now() - t0).toFixed(2));
            global.dispatchEvent(new CustomEvent('minkoi:nativebridgeready', { detail: getState() }));
            return getState();
        })();
        return initPromise;
    }

    function getState() {
        return {
            protocolVersion: PROTOCOL_VERSION,
            defaultTarget: 'kotlin-js',
            backend,
            version,
            loadTimeMs,
            lastError,
            disposed,
            loadedTargets: loadedTargets.slice(),
            directMavenActive: backend === 'kotlin-js' || backend === 'kotlin-wasm',
            integration: INTEGRATION_PROVENANCE
        };
    }

    function safeCall(method, fallbackMethod, args) {
        try {
            const val = activeImpl[method](...args);
            if (Number.isFinite(val)) return val;
        } catch (err) {
            lastError = String(err?.message || err);
            activeImpl = fallbackImpl;
            backend = 'js-fallback-recovered';
        }
        return fallbackImpl[fallbackMethod || method](...args);
    }

    function dispose() {
        disposed = true;
        activeImpl = fallbackImpl;
        backend = 'disposed';
    }

    const stepOut = { value: 0, velocity: 0 };

    global.MinkoiNativeBridge = Object.freeze({
        PROTOCOL_VERSION,
        init,
        ready: () => initPromise || init(),
        getState,
        dispose,
        // Direct Maven Miuix & COUI APIs
        miuixFolmeStiffness: (d, r) => safeCall('miuixFolmeStiffness', null, [d, r]),
        stepMiuixFolme(value, target, velocity, dt, damping, response) {
            try {
                const nv = activeImpl.miuixFolmeStepValue(value, target, velocity, dt, damping, response);
                const nvel = activeImpl.springStepLastVelocity();
                if (Number.isFinite(nv) && Number.isFinite(nvel)) {
                    stepOut.value = nv;
                    stepOut.velocity = nvel;
                    return stepOut;
                }
            } catch (err) {
                lastError = String(err?.message || err);
                activeImpl = fallbackImpl;
                backend = 'js-fallback-recovered';
            }
            stepOut.value = fallbackImpl.miuixFolmeStepValue(value, target, velocity, dt, damping, response);
            stepOut.velocity = fallbackImpl.springStepLastVelocity();
            return stepOut;
        },
        couiSpringEasing: (f, resp, bounce) => safeCall('couiSpringEasing', null, [f, resp, bounce]),
        couiBezierEasing: (kind, f) => safeCall('couiBezierEasing', null, [kind, f]),
        couiStiffnessFromResponse: (resp) => safeCall('couiStiffnessFromResponse', null, [resp]),
        couiDampingFromBounce: (bounce) => safeCall('couiDampingFromBounce', null, [bounce]),
        couiDefaultSinkAmount: () => safeCall('couiDefaultSinkAmount', null, []),
        stepCouiSpring(value, target, velocity, dt, response, bounce) {
            try {
                const nv = activeImpl.couiSpringStepValue(value, target, velocity, dt, response, bounce);
                const nvel = activeImpl.springStepLastVelocity();
                if (Number.isFinite(nv) && Number.isFinite(nvel)) {
                    stepOut.value = nv;
                    stepOut.velocity = nvel;
                    return stepOut;
                }
            } catch (err) {
                lastError = String(err?.message || err);
                activeImpl = fallbackImpl;
                backend = 'js-fallback-recovered';
            }
            stepOut.value = fallbackImpl.couiSpringStepValue(value, target, velocity, dt, response, bounce);
            stepOut.velocity = fallbackImpl.springStepLastVelocity();
            return stepOut;
        },
        // Reference Math Adapter APIs (explicitly documented non-direct)
        obtainDampingDistance: (d, r) => safeCall('miuixObtainDampingDistance', null, [d, r]),
        obtainTouchDistance: (o, r) => safeCall('miuixObtainTouchDistance', null, [o, r]),
        pressStrength: (w, h, dpr) => safeCall('miuixPressStrength', null, [w, h, dpr]),
        stepSpring(value, target, velocity, dt, dampingRatio, stiffness, mass) {
            try {
                const nextValue = activeImpl.springStepValue(value, target, velocity, dt, dampingRatio, stiffness, mass);
                const nextVelocity = activeImpl.springStepLastVelocity();
                if (Number.isFinite(nextValue) && Number.isFinite(nextVelocity)) {
                    stepOut.value = nextValue;
                    stepOut.velocity = nextVelocity;
                    return stepOut;
                }
            } catch (err) {
                lastError = String(err?.message || err);
                activeImpl = fallbackImpl;
                backend = 'js-fallback-recovered';
            }
            stepOut.value = fallbackImpl.springStepValue(value, target, velocity, dt, dampingRatio, stiffness, mass);
            stepOut.velocity = fallbackImpl.springStepLastVelocity();
            return stepOut;
        },
        backdropHighlightIntensity: (x, y, w, h, r, angle, falloff) =>
            safeCall('backdropHighlightIntensity', null, [x, y, w, h, r, angle, falloff]),
        backdropRefractionMagnitude: (x, y, w, h, r, refH, refAmt) =>
            safeCall('backdropRefractionMagnitude', null, [x, y, w, h, r, refH, refAmt])
    });
})(typeof window !== 'undefined' ? window : globalThis);
