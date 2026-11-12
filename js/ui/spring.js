/* ==========================================================================
   MINKOI V3 · MIUIX SPRING PHYSICS ENGINE
   Semi-implicit Euler spring integration (F = -kx - cv), interruptible with
   velocity preservation and automatic sleep at equilibrium.
   Reference: Miuix SpringUtils.kt, PressFeedback.kt, ListPopup.kt, Switch.kt
   ========================================================================== */
(function (global) {
    'use strict';

    function folmeSpring(dampingRatio, responseSeconds) {
        const safeResponse = Math.max(0.05, responseSeconds);
        const omega = (2 * Math.PI) / safeResponse;
        return {
            dampingRatio: dampingRatio,
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
        TAB_PILL: Object.freeze({ dampingRatio: 0.85, stiffness: 480 })
    });

    const activeSprings = new Set();
    let rafId = 0;
    let lastTimestamp = 0;

    function shouldInstantSnap() {
        if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return true;
        }
        const docBody = global.document && global.document.body;
        return Boolean(docBody && (docBody.getAttribute('data-quality') === 'eco' || docBody.classList.contains('low-end')));
    }

    function tick(now) {
        rafId = 0;
        const dt = lastTimestamp
            ? Math.min(0.10, Math.max(0.001, (now - lastTimestamp) / 1000))
            : 0.016;
        lastTimestamp = now;

        const subSteps = Math.max(1, Math.ceil(dt / 0.012));
        const stepDt = dt / subSteps;
        const completed = [];

        activeSprings.forEach((spring) => {
            if (!spring.running) return;
            const k = spring.stiffness;
            const c = 2 * spring.dampingRatio * Math.sqrt(k);

            for (let s = 0; s < subSteps; s++) {
                const displacement = spring.value - spring.target;
                const accel = -k * displacement - c * spring.velocity;
                spring.velocity += accel * stepDt;
                spring.value += spring.velocity * stepDt;
            }

            if (typeof spring.onUpdate === 'function') {
                spring.onUpdate(spring.value, spring.velocity);
            }

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

        for (let i = 0; i < completed.length; i++) {
            const sp = completed[i];
            activeSprings.delete(sp);
            if (typeof sp.onUpdate === 'function') {
                sp.onUpdate(sp.value, 0);
            }
            if (typeof sp.onComplete === 'function') {
                const cb = sp.onComplete;
                sp.onComplete = null;
                cb(sp.value);
            }
        }

        if (activeSprings.size > 0) {
            rafId = global.requestAnimationFrame(tick);
        } else {
            lastTimestamp = 0;
        }
    }

    function ensureLoop() {
        if (!rafId && activeSprings.size > 0) {
            lastTimestamp = 0;
            rafId = global.requestAnimationFrame(tick);
        }
    }

    /**
     * Miuix rubberband damping curve: obtainDampingDistance(delta, maxRange)
     * Mirrors Miuix SpringUtils.kt (x - x^2 + x^3/3) * range
     */
    function obtainDampingDistance(touchDelta, maxRange) {
        const range = Math.max(1, maxRange || 160);
        const sign = touchDelta < 0 ? -1 : 1;
        const clampedX = Math.min(1, Math.abs(touchDelta) / range);
        const damped = (clampedX - clampedX * clampedX + (clampedX * clampedX * clampedX) / 3) * range;
        return sign * damped;
    }

    function createSpring(options) {
        const opts = options || {};
        const preset = opts.preset || PRESETS.LIST_POPUP;
        const spring = {
            value: typeof opts.initial === 'number' ? opts.initial : 0,
            target: typeof opts.target === 'number' ? opts.target : (typeof opts.initial === 'number' ? opts.initial : 0),
            velocity: 0,
            dampingRatio: typeof opts.dampingRatio === 'number' ? opts.dampingRatio : preset.dampingRatio,
            stiffness: typeof opts.stiffness === 'number' ? opts.stiffness : preset.stiffness,
            precision: typeof opts.precision === 'number' ? opts.precision : 0.001,
            velocityPrecision: typeof opts.velocityPrecision === 'number' ? opts.velocityPrecision : 0.01,
            running: false,
            onUpdate: opts.onUpdate || null,
            onComplete: opts.onComplete || null,

            setTarget(nextTarget, override) {
                if (override) {
                    if (typeof override.dampingRatio === 'number') this.dampingRatio = override.dampingRatio;
                    if (typeof override.stiffness === 'number') this.stiffness = override.stiffness;
                    if ('onComplete' in override) this.onComplete = override.onComplete;
                }
                this.target = nextTarget;
                if (shouldInstantSnap()) {
                    activeSprings.delete(this);
                    this.value = nextTarget;
                    this.velocity = 0;
                    this.running = false;
                    if (typeof this.onUpdate === 'function') this.onUpdate(this.value, 0);
                    if (typeof this.onComplete === 'function') {
                        const cb = this.onComplete;
                        this.onComplete = null;
                        cb(this.value);
                    }
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
                    if (typeof this.onUpdate === 'function') this.onUpdate(this.value, 0);
                    if (typeof this.onComplete === 'function') {
                        const cb = this.onComplete;
                        this.onComplete = null;
                        cb(this.value);
                    }
                    return;
                }
                this.running = true;
                activeSprings.add(this);
                ensureLoop();
            },

            snap(value) {
                activeSprings.delete(this);
                this.value = value;
                this.target = value;
                this.velocity = 0;
                this.running = false;
                if (typeof this.onUpdate === 'function') this.onUpdate(value, 0);
            },

            impulse(v) {
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
                activeSprings.delete(this);
            }
        };
        return spring;
    }

    global.MinkoiSpring = Object.freeze({
        PRESETS: PRESETS,
        folmeSpring: folmeSpring,
        createSpring: createSpring,
        obtainDampingDistance: obtainDampingDistance,
        isReducedMotion: shouldInstantSnap,
        getActiveCount: () => activeSprings.size
    });
})(window);
