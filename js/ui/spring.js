/* ==========================================================================
   MINKOI V4 · MIUIX NATURAL MOTION PHYSICS ENGINE
   Semi-implicit Euler spring integration (F = -kx - cv), interruptible with
   velocity preservation, directional edge springs, and multi-property groups.
   Reference: Miuix SpringUtils.kt, PressFeedback.kt, ListPopup.kt, Lens.kt
   ========================================================================== */
(function (global) {
    'use strict';

    function folmeSpring(dampingRatio, responseSeconds) {
        const safeDamping = Number.isFinite(dampingRatio) ? Math.max(0.05, dampingRatio) : 0.85;
        const safeResponse = Number.isFinite(responseSeconds) ? Math.max(0.05, responseSeconds) : 0.35;
        const omega = (2 * Math.PI) / safeResponse;
        return {
            dampingRatio: safeDamping,
            stiffness: omega * omega
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
        EDGE_LEADING: Object.freeze(folmeSpring(0.92, 0.26)),
        EDGE_TRAILING: Object.freeze(folmeSpring(0.78, 0.38)),
        NAV_FOLLOW: Object.freeze(folmeSpring(1.02, 0.16)),
        HERO_BUTTON: Object.freeze(folmeSpring(0.76, 0.30)),
        TACTILE_PRESS: Object.freeze(folmeSpring(0.86, 0.22))
    });

    const activeSprings = new Set();
    let rafId = 0;
    let lastTimestamp = 0;

    function isAccessibilityReducedMotion() {
        return Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    // Eco removes expensive rendering effects; the liquid tab's lightweight
    // physics may opt in to motion. Accessibility reduced-motion always wins.
    function shouldInstantSnap(allowEcoMotion = false) {
        if (isAccessibilityReducedMotion()) return true;
        if (allowEcoMotion) return false;
        const docBody = global.document && global.document.body;
        return Boolean(docBody && (docBody.getAttribute('data-quality') === 'eco' || docBody.classList.contains('low-end')));
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

    function tick(now) {
        rafId = 0;
        if (global.document && global.document.hidden) {
            lastTimestamp = 0;
            return;
        }

        const dt = lastTimestamp
            ? Math.min(0.25, Math.max(0.001, (now - lastTimestamp) / 1000))
            : 0.016;
        lastTimestamp = now;

        const subSteps = Math.max(1, Math.ceil(dt / 0.012));
        const stepDt = dt / subSteps;
        const completed = [];
        const stale = [];

        activeSprings.forEach((spring) => {
            if (!spring.running || (spring.el && !spring.el.isConnected)) {
                stale.push(spring);
                return;
            }
            const k = spring.stiffness;
            const c = 2 * spring.dampingRatio * Math.sqrt(k);

            for (let s = 0; s < subSteps; s++) {
                const displacement = spring.value - spring.target;
                const accel = -k * displacement - c * spring.velocity;
                spring.velocity += accel * stepDt;
                spring.value += spring.velocity * stepDt;
            }

            if (!Number.isFinite(spring.value) || !Number.isFinite(spring.velocity) || Math.abs(spring.value) > 1e6) {
                spring.value = spring.target;
                spring.velocity = 0;
                spring.running = false;
                completed.push(spring);
                return;
            }

            safeUpdate(spring, spring.value, spring.velocity);

            const settled =
                Math.abs(spring.value - spring.target) < spring.precision &&
                Math.abs(spring.velocity) < spring.velocityPrecision;

            if (settled) {
                spring.value = spring.target;
                spring.velocity = 0;
                spring.running = false;
                completed.push(spring);
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

        if (activeSprings.size > 0 && !(global.document && global.document.hidden)) {
            rafId = global.requestAnimationFrame(tick);
        } else {
            lastTimestamp = 0;
        }
    }

    function ensureLoop() {
        if (global.document && global.document.hidden) return;
        if (!rafId && activeSprings.size > 0) {
            lastTimestamp = 0;
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
     * Mirrors Miuix SpringUtils.kt (x - x^2 + x^3/3) * range
     */
    function obtainDampingDistance(touchDelta, maxRange) {
        if (!Number.isFinite(touchDelta)) return 0;
        const range = Number.isFinite(maxRange) ? Math.max(1, maxRange) : 160;
        const sign = touchDelta < 0 ? -1 : 1;
        const clampedX = Math.min(1, Math.abs(touchDelta) / range);
        const damped = (clampedX - clampedX * clampedX + (clampedX * clampedX * clampedX) / 3) * range;
        return sign * damped;
    }

    function createSpring(options) {
        const opts = options || {};
        const preset = opts.preset || PRESETS.LIST_POPUP;
        const initVal = Number.isFinite(opts.initial) ? opts.initial : 0;
        const initTarget = Number.isFinite(opts.target) ? opts.target : initVal;
        const spring = {
            el: opts.el || null,
            allowEcoMotion: opts.allowEcoMotion === true,
            value: initVal,
            target: initTarget,
            velocity: 0,
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
                    if ('onComplete' in override) this.onComplete = override.onComplete;
                }
                this.target = nextTarget;
                if (shouldInstantSnap(this.allowEcoMotion) || (global.document && global.document.hidden)) {
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
                if (!this.running && !shouldInstantSnap(this.allowEcoMotion)) {
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
        const MAX_WINDOW_MS = 120;

        return {
            reset() {
                samples.length = 0;
            },
            addPoint(x, y) {
                const now = performance.now();
                samples.push({ x: Number(x) || 0, y: Number(y) || 0, time: now });
                // Prune old samples
                while (samples.length > 2 && (now - samples[0].time) > MAX_WINDOW_MS) {
                    samples.shift();
                }
            },
            getVelocity() {
                if (samples.length < 2) return { vx: 0, vy: 0 };
                const newest = samples[samples.length - 1];
                const oldest = samples[0];
                const dt = (newest.time - oldest.time) / 1000;
                if (dt <= 0.005) return { vx: 0, vy: 0 };
                return {
                    vx: Math.max(-4000, Math.min(4000, (newest.x - oldest.x) / dt)),
                    vy: Math.max(-4000, Math.min(4000, (newest.y - oldest.y) / dt))
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
                precision: def.precision,
                velocityPrecision: def.velocityPrecision,
                allowEcoMotion: def.allowEcoMotion !== false,
                onUpdate: () => notifyRender(),
                onComplete: () => {
                    checkGroupComplete();
                }
            });
            values[k] = springs[k].value;
        }

        function checkGroupComplete() {
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
                const tKeys = Object.keys(targets || {});
                for (let i = 0; i < tKeys.length; i++) {
                    const tk = tKeys[i];
                    if (springs[tk]) {
                        springs[tk].setTarget(targets[tk]);
                    }
                }
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
        isReducedMotion: shouldInstantSnap,
        isAccessibilityReducedMotion: isAccessibilityReducedMotion,
        getActiveCount: () => activeSprings.size
    });
})(window);
