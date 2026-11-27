/* ==========================================================================
   MINKOI V4 · MIUIX NATURAL MOTION PHYSICS ENGINE
   Closed-form damped springs (F = -kx - cv), interruptible with
   velocity preservation, directional edge springs, and multi-property groups.
   Reference: Miuix SpringUtils.kt, PressFeedback.kt, ListPopup.kt, Lens.kt
   ========================================================================== */
(function (global) {
    'use strict';

    function folmeSpring(dampingRatio, responseSeconds) {
        const safeDamping = Number.isFinite(dampingRatio) ? Math.max(0.05, dampingRatio) : 0.85;
        const safeResponse = Number.isFinite(responseSeconds) ? Math.max(0.05, responseSeconds) : 0.35;
        const stiffness = (global.MinkoiNativeBridge && typeof global.MinkoiNativeBridge.miuixFolmeStiffness === 'function')
            ? global.MinkoiNativeBridge.miuixFolmeStiffness(safeDamping, safeResponse)
            : ((2 * Math.PI) / safeResponse) * ((2 * Math.PI) / safeResponse);
        return {
            dampingRatio: safeDamping,
            stiffness
        };
    }

    const PRESETS = Object.freeze({
        LIST_POPUP: Object.freeze({ dampingRatio: 0.82, stiffness: 362.5 }),
        SINK: Object.freeze({ dampingRatio: 0.80, stiffness: 600 }),
        TILT: Object.freeze({ dampingRatio: 0.60, stiffness: 400 }),
        SWITCH_THUMB: Object.freeze({ dampingRatio: 0.70, stiffness: 987 }),
        SWITCH_SCALE: Object.freeze({ dampingRatio: 0.60, stiffness: 987 }),
        SLIDER_DRAG: Object.freeze({ dampingRatio: 0.90, stiffness: 1755 }),
        SLIDER_SETTLE: Object.freeze({ dampingRatio: 0.96, stiffness: 322 }),
        BOTTOM_SHEET_OPEN: Object.freeze(folmeSpring(0.90, 0.38)),
        BOTTOM_SHEET_SETTLE: Object.freeze(folmeSpring(0.85, 0.40)),
        DIALOG_SCALE: Object.freeze(folmeSpring(0.90, 0.30)),
        TAB_PILL: Object.freeze({ dampingRatio: 0.85, stiffness: 480 }),
        LIQUID_GLASS: Object.freeze({ dampingRatio: 0.84, stiffness: 440 }),
        LIQUID_DRAG: Object.freeze({ dampingRatio: 0.92, stiffness: 1200 }),
        LIQUID_STRETCH: Object.freeze({ dampingRatio: 0.76, stiffness: 520 }),
        // V4.0 Natural Physics Additions
        // The lens needs a visible, restrained settle: leading edge arrives
        // quickly with a light overshoot, trailing edge lags and springs back.
        EDGE_LEADING: Object.freeze(folmeSpring(0.78, 0.30)),
        EDGE_TRAILING: Object.freeze(folmeSpring(0.65, 0.38)),
        NAV_FOLLOW: Object.freeze(folmeSpring(1.00, 0.14)),
        HERO_BUTTON: Object.freeze(folmeSpring(0.76, 0.30)),
        TACTILE_PRESS: Object.freeze(folmeSpring(0.86, 0.22)),
        ZEN_ENTER: Object.freeze(folmeSpring(0.96, 0.42)),
        ZEN_EXIT: Object.freeze(folmeSpring(0.98, 0.38))
    });

    const activeSprings = new Set();
    let rafId = 0;
    let lastTimestamp = 0;
    let ticking = false;
    const pendingRenders = new Set();
    const motionQuery = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;

    // Groups render once after every spring has advanced, never once per axis.
    function scheduleRender(render) {
        if (ticking) pendingRenders.add(render);
        else render();
    }

    function advance(spring, dt) {
        const bridge = global.MinkoiNativeBridge;
        if (bridge && typeof bridge.stepSpring === 'function') {
            const next = bridge.stepSpring(
                spring.value,
                spring.target,
                spring.velocity,
                dt,
                spring.dampingRatio,
                spring.stiffness,
                spring.mass
            );
            spring.value = next.value;
            spring.velocity = next.velocity;
            return;
        }
        const omega = Math.sqrt(spring.stiffness / spring.mass);
        const zeta = spring.dampingRatio;
        const x = spring.value - spring.target;
        const v = spring.velocity;
        let nextX;
        let nextV;
        if (Math.abs(zeta - 1) < 1e-5) {
            const b = v + omega * x;
            const decay = Math.exp(-omega * dt);
            nextX = (x + b * dt) * decay;
            nextV = (v - omega * b * dt) * decay;
        } else if (zeta < 1) {
            const alpha = zeta * omega;
            const wd = omega * Math.sqrt(1 - zeta * zeta);
            const b = (v + alpha * x) / wd;
            const cos = Math.cos(wd * dt);
            const sin = Math.sin(wd * dt);
            const decay = Math.exp(-alpha * dt);
            nextX = decay * (x * cos + b * sin);
            nextV = decay * (v * cos - (alpha * b + wd * x) * sin);
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
        spring.value = spring.target + nextX;
        spring.velocity = nextV;
    }

    function isAccessibilityReducedMotion() {
        return Boolean(motionQuery?.matches);
    }

    function shouldInstantSnap() {
        return isAccessibilityReducedMotion();
    }

    function stopLoop() {
        if (rafId) {
            global.cancelAnimationFrame(rafId);
            rafId = 0;
        }
        lastTimestamp = 0;
    }

    function safeUpdate(spring, val, vel) {
        if (typeof spring.onUpdate !== 'function') return;
        try {
            spring.onUpdate(val, vel);
        } catch (_) {
            spring.running = false;
            spring.onComplete = null;
            activeSprings.delete(spring);
        }
    }

    function safeComplete(spring) {
        if (typeof spring.onComplete !== 'function') return;
        const cb = spring.onComplete;
        spring.onComplete = null;
        try {
            cb(spring.value);
        } catch (_) { /* ignore callback error */ }
    }

    motionQuery?.addEventListener?.('change', () => {
        if (!motionQuery.matches) return;
        stopLoop();
        const pending = Array.from(activeSprings);
        activeSprings.clear();
        pending.forEach(sp => {
            sp.value = sp.target;
            sp.velocity = 0;
            sp.running = false;
            safeUpdate(sp, sp.value, 0);
            safeComplete(sp);
        });
    });

    function tick(now) {
        rafId = 0;
        if (global.document && global.document.hidden) {
            lastTimestamp = 0;
            // When document is hidden, cleanly snap active springs to their targets
            activeSprings.forEach(spring => {
                spring.value = spring.target;
                spring.velocity = 0;
                spring.running = false;
                safeUpdate(spring, spring.value, 0);
                safeComplete(spring);
            });
            activeSprings.clear();
            return;
        }

        // The closed-form solution is stable for long frame intervals. Capping
        // elapsed time (as an Euler solver would need) stretches real duration
        // under missed frames, leaving input/elevation stuck in settling state.
        const dt = lastTimestamp
            ? Math.max(0, (now - lastTimestamp) / 1000)
            : 0;
        lastTimestamp = now;
        ticking = true;
        const completed = [];
        const stale = [];

        activeSprings.forEach((spring) => {
            if (!spring.running || (spring.el && !spring.el.isConnected)) {
                stale.push(spring);
                return;
            }
            advance(spring, dt);

            if (!Number.isFinite(spring.value) || !Number.isFinite(spring.velocity) || Math.abs(spring.value) > 1e6) {
                spring.value = spring.target;
                spring.velocity = 0;
                spring.running = false;
                completed.push(spring);
                return;
            }

            const settled =
                Math.abs(spring.value - spring.target) < spring.precision &&
                Math.abs(spring.velocity) < spring.velocityPrecision;

            if (settled) {
                spring.value = spring.target;
                spring.velocity = 0;
                spring.running = false;
                completed.push(spring);
            } else {
                safeUpdate(spring, spring.value, spring.velocity);
            }
        });

        for (let i = 0; i < stale.length; i++) {
            stale[i].running = false;
            stale[i].onComplete = null;
            activeSprings.delete(stale[i]);
        }

        for (let i = 0; i < completed.length; i++) {
            const sp = completed[i];
            activeSprings.delete(sp);
            safeUpdate(sp, sp.value, 0);
            safeComplete(sp);
        }

        pendingRenders.forEach(render => {
            try { render(); } catch (_) { /* isolate component failures */ }
        });
        pendingRenders.clear();
        ticking = false;

        if (activeSprings.size > 0 && !(global.document && global.document.hidden)) {
            rafId = global.requestAnimationFrame(tick);
        } else {
            lastTimestamp = 0;
        }
    }

    function ensureLoop() {
        if (global.document && global.document.hidden) return;
        if (!ticking && !rafId && activeSprings.size > 0) {
            lastTimestamp = global.performance.now();
            rafId = global.requestAnimationFrame(tick);
        }
    }

    if (global.document && typeof global.document.addEventListener === 'function') {
        global.document.addEventListener('visibilitychange', () => {
            if (global.document.hidden) {
                stopLoop();
            } else if (activeSprings.size > 0) {
                if (shouldInstantSnap()) {
                    const pending = Array.from(activeSprings);
                    activeSprings.clear();
                    pending.forEach((sp) => {
                        sp.value = sp.target;
                        sp.velocity = 0;
                        sp.running = false;
                        safeUpdate(sp, sp.value, 0);
                        safeComplete(sp);
                    });
                } else {
                    ensureLoop();
                }
            }
        });
    }

    /**
     * Miuix rubberband damping curve: obtainDampingDistance(delta, maxRange)
     * Mirrors Miuix SpringUtils.kt (x - x^2 + x^3/3) * range via MinkoiNativeBridge (Kotlin/Wasm -> Kotlin/JS -> JS).
     */
    function obtainDampingDistance(touchDelta, maxRange) {
        if (!Number.isFinite(touchDelta)) return 0;
        const range = Number.isFinite(maxRange) ? Math.max(1, maxRange) : 160;
        if (global.MinkoiNativeBridge && typeof global.MinkoiNativeBridge.obtainDampingDistance === 'function') {
            return global.MinkoiNativeBridge.obtainDampingDistance(touchDelta, range);
        }
        const sign = touchDelta < 0 ? -1 : 1;
        const clampedX = Math.min(1, Math.abs(touchDelta) / range);
        const damped = (clampedX - clampedX * clampedX + (clampedX * clampedX * clampedX) / 3) * range;
        return sign * damped;
    }

    function couiSpringEasing(fraction, response, bounce) {
        if (global.MinkoiNativeBridge && typeof global.MinkoiNativeBridge.couiSpringEasing === 'function') {
            return global.MinkoiNativeBridge.couiSpringEasing(fraction, response, bounce);
        }
        return Math.max(0, Math.min(1, fraction));
    }

    function couiBezierEasing(kind, fraction) {
        if (global.MinkoiNativeBridge && typeof global.MinkoiNativeBridge.couiBezierEasing === 'function') {
            return global.MinkoiNativeBridge.couiBezierEasing(kind, fraction);
        }
        return Math.max(0, Math.min(1, fraction));
    }

    function couiDefaultSinkAmount() {
        if (global.MinkoiNativeBridge && typeof global.MinkoiNativeBridge.couiDefaultSinkAmount === 'function') {
            return global.MinkoiNativeBridge.couiDefaultSinkAmount();
        }
        return 0.94;
    }

    function createSpring(options) {
        const opts = options || {};
        const preset = opts.preset || PRESETS.LIST_POPUP;
        const initVal = Number.isFinite(opts.initial) ? opts.initial : 0;
        const initTarget = Number.isFinite(opts.target) ? opts.target : initVal;
        const spring = {
            el: opts.el || null,
            value: initVal,
            target: initTarget,
            velocity: 0,
            mass: Number.isFinite(opts.mass) ? Math.max(0.001, opts.mass) : 1,
            dampingRatio: Number.isFinite(opts.dampingRatio) ? Math.max(0.05, opts.dampingRatio) : preset.dampingRatio,
            stiffness: Number.isFinite(opts.stiffness) ? Math.max(1, opts.stiffness) : preset.stiffness,
            precision: Number.isFinite(opts.precision) ? Math.max(1e-5, opts.precision) : 0.001,
            velocityPrecision: Number.isFinite(opts.velocityPrecision) ? Math.max(1e-4, opts.velocityPrecision) : 0.01,
            running: false,
            onUpdate: typeof opts.onUpdate === 'function' ? opts.onUpdate : null,
            onComplete: typeof opts.onComplete === 'function' ? opts.onComplete : null,

            setTarget(nextTarget, override) {
                if (!Number.isFinite(nextTarget)) return;
                if (override) {
                    if (Number.isFinite(override.dampingRatio)) this.dampingRatio = Math.max(0.05, override.dampingRatio);
                    if (Number.isFinite(override.stiffness)) this.stiffness = Math.max(1, override.stiffness);
                    if (Number.isFinite(override.mass)) this.mass = Math.max(0.001, override.mass);
                    if ('onComplete' in override) this.onComplete = override.onComplete;
                }
                this.target = nextTarget;
                if (shouldInstantSnap() || (global.document && global.document.hidden)) {
                    activeSprings.delete(this);
                    this.value = nextTarget;
                    this.velocity = 0;
                    this.running = false;
                    safeUpdate(this, this.value, 0);
                    safeComplete(this);
                    return;
                }
                if (
                    Math.abs(this.value - this.target) < this.precision &&
                    Math.abs(this.velocity) < this.velocityPrecision
                ) {
                    this.value = this.target;
                    this.velocity = 0;
                    this.running = false;
                    activeSprings.delete(this);
                    safeUpdate(this, this.value, 0);
                    safeComplete(this);
                    return;
                }
                this.running = true;
                activeSprings.add(this);
                ensureLoop();
            },

            snap(value) {
                if (!Number.isFinite(value)) return;
                activeSprings.delete(this);
                this.value = value;
                this.target = value;
                this.velocity = 0;
                this.running = false;
                this.onComplete = null;
                safeUpdate(this, value, 0);
            },

            impulse(v) {
                if (!Number.isFinite(v)) return;
                this.velocity += v;
                if (!this.running && !shouldInstantSnap()) {
                    this.running = true;
                    activeSprings.add(this);
                    ensureLoop();
                }
            },

            destroy() {
                this.running = false;
                this.onComplete = null;
                this.el = null;
                activeSprings.delete(this);
                if (activeSprings.size === 0) stopLoop();
            }
        };
        return spring;
    }

    /**
     * V4.0 High-Precision Velocity Tracker for Fluid Physical Gestures
     */
    function createVelocityTracker() {
        const samples = [];
        const MAX_WINDOW_MS = 140;

        return {
            reset() {
                samples.length = 0;
            },
            addPoint(x, y) {
                const now = performance.now();
                const px = Number(x) || 0;
                const py = Number(y) || 0;
                const last = samples[samples.length - 1];
                // A repeated position carries no velocity information and would
                // otherwise dilute the estimate when the finger pauses.
                if (last && last.x === px && last.y === py) return;
                samples.push({ x: px, y: py, time: now });
                const newest = samples[samples.length - 1].time;
                while (samples.length > 2 && (newest - samples[0].time) > MAX_WINDOW_MS) {
                    samples.shift();
                }
            },
            getVelocity() {
                const n = samples.length;
                if (n < 2) return { vx: 0, vy: 0 };
                const now = performance.now();
                if ((now - samples[n - 1].time) > MAX_WINDOW_MS) return { vx: 0, vy: 0 };
                // Least-squares slope across the sample window: stable with
                // irregular pointer cadence, unlike a first/last difference.
                const t0 = samples[0].time;
                let sumT = 0;
                let sumX = 0;
                let sumY = 0;
                for (let i = 0; i < n; i++) {
                    sumT += samples[i].time - t0;
                    sumX += samples[i].x;
                    sumY += samples[i].y;
                }
                const meanT = sumT / n;
                const meanX = sumX / n;
                const meanY = sumY / n;
                let numX = 0;
                let numY = 0;
                let den = 0;
                for (let i = 0; i < n; i++) {
                    const dt = (samples[i].time - t0) - meanT;
                    numX += dt * (samples[i].x - meanX);
                    numY += dt * (samples[i].y - meanY);
                    den += dt * dt;
                }
                if (den < 1) return { vx: 0, vy: 0 };
                return {
                    vx: Math.max(-6000, Math.min(6000, (numX / den) * 1000)),
                    vy: Math.max(-6000, Math.min(6000, (numY / den) * 1000))
                };
            }
        };
    }

    /**
     * V4.0 Coordinated Multi-Property Spring Group (Zero Transform Clashes)
     */
    function createSpringGroup(definitions, options) {
        const opts = options || {};
        const springs = {};
        const values = {};
        let isAnyRunning = false;
        let updatingTargets = false;
        const keys = Object.keys(definitions || {});

        const notifyRender = () => {
            if (typeof opts.onRender === 'function') {
                for (let i = 0; i < keys.length; i++) {
                    values[keys[i]] = springs[keys[i]].value;
                }
                opts.onRender(values, springs);
            }
        };

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const def = definitions[k] || {};
            springs[k] = createSpring({
                initial: def.initial || 0,
                target: def.target !== undefined ? def.target : (def.initial || 0),
                preset: def.preset,
                dampingRatio: def.dampingRatio,
                stiffness: def.stiffness,
                mass: def.mass,
                precision: def.precision,
                velocityPrecision: def.velocityPrecision,
                onUpdate: () => scheduleRender(notifyRender),
                onComplete: () => {
                    scheduleRender(checkGroupComplete);
                }
            });
            values[k] = springs[k].value;
        }

        function checkGroupComplete() {
            if (updatingTargets) return;
            let stillRunning = false;
            for (let i = 0; i < keys.length; i++) {
                if (springs[keys[i]].running) {
                    stillRunning = true;
                    break;
                }
            }
            if (!stillRunning && isAnyRunning) {
                isAnyRunning = false;
                if (typeof opts.onComplete === 'function') {
                    opts.onComplete(values);
                }
            }
        }

        return {
            springs,
            values,
            setTargets(targets) {
                isAnyRunning = true;
                updatingTargets = true;
                const tKeys = Object.keys(targets || {});
                for (let i = 0; i < tKeys.length; i++) {
                    const tk = tKeys[i];
                    if (springs[tk]) {
                        springs[tk].setTarget(targets[tk]);
                    }
                }
                updatingTargets = false;
                checkGroupComplete();
            },
            snap(targetValues) {
                const tKeys = Object.keys(targetValues || {});
                for (let i = 0; i < tKeys.length; i++) {
                    const tk = tKeys[i];
                    if (springs[tk]) {
                        springs[tk].snap(targetValues[tk]);
                    }
                }
                notifyRender();
            },
            destroy() {
                for (let i = 0; i < keys.length; i++) {
                    springs[keys[i]].destroy();
                }
            }
        };
    }

    global.MinkoiSpring = Object.freeze({
        PRESETS: PRESETS,
        folmeSpring: folmeSpring,
        createSpring: createSpring,
        createSpringGroup: createSpringGroup,
        createVelocityTracker: createVelocityTracker,
        obtainDampingDistance: obtainDampingDistance,
        couiSpringEasing: couiSpringEasing,
        couiBezierEasing: couiBezierEasing,
        couiDefaultSinkAmount: couiDefaultSinkAmount,
        isReducedMotion: shouldInstantSnap,
        isAccessibilityReducedMotion: isAccessibilityReducedMotion,
        getActiveCount: () => activeSprings.size
    });
})(window);
