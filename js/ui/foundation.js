/* ==========================================================================
   MINKOI 5.6 · SHARED MIUIX 0.9.5-rc01 + COUI 2.1.0 WEB UI FOUNDATION
   --------------------------------------------------------------------------
   Single shared behavioral foundation governing all 14 MINKOI UI categories:
     1. Button / Icon Button          8. Player Controls & Hero Play
     2. Switch / Toggle               9. Volume & Seek Sliders
     3. Optical Sliders              10. Equalizer 5-Band & Presets
     4. Segmented Control            11. Lyrics Controls & Offset Stepper
     5. Capsule / Category Nav       12. Persona Collection Cards
     6. Dropdown / Popup             13. Zen Mode Controls & Dock
     7. Modal / Bottom Sheet         14. Studio Utility Dock

   Native Provenance:
     - Direct Maven KMP (Kotlin/JS default, WasmGC fallback):
       folmeSpring, couiSpring, COUISpringEasing, COUIEase*, SinkFeedback
     - Reference / Ported Web Primitives:
       Miuix pressStrength, obtainDampingDistance, G2 Squircle geometry,
       COUI local press illumination, accessible focus/keyboard contracts.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    if (!doc) return;

    const Spring = () => global.MinkoiSpring;
    const Bridge = () => global.MinkoiNativeBridge;

    const COMPONENT_CATEGORIES = Object.freeze([
        'button-icon',
        'switch-toggle',
        'slider',
        'segmented-control',
        'capsule-nav',
        'dropdown-popup',
        'modal-sheet',
        'player-controls',
        'volume-seek',
        'eq-controls',
        'lyrics-controls',
        'persona-selector',
        'zen-controls',
        'studio-utility-dock'
    ]);

    const NATIVE_SQUIRCLE_SUPPORTED = Boolean(
        global.CSS && typeof global.CSS.supports === 'function' && global.CSS.supports('corner-shape', 'squircle')
    );

    // ----------------------------------------------------------------------
    // 1. SHARED OPTICAL RANGE SLIDER PRIMITIVE (Seek, Volume, 5-Band EQ, Visualizer)
    // ----------------------------------------------------------------------
    function syncRangeFill(inputEl, cssVarName) {
        if (!inputEl) return 0;
        const min = Number(inputEl.min !== '' ? inputEl.min : 0);
        const max = Number(inputEl.max !== '' ? inputEl.max : 100);
        const val = Number(inputEl.value !== '' ? inputEl.value : min);
        const pct = max > min ? Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)) : 50;
        if (cssVarName) {
            inputEl.style.setProperty(cssVarName, `${pct.toFixed(1)}%`);
        }
        return pct;
    }

    function bindOpticalRange(inputEl, options) {
        if (!inputEl || inputEl.dataset.minkoiRangeBound === '1') return null;
        inputEl.dataset.minkoiRangeBound = '1';
        const opts = options || {};
        const cssVar = opts.cssVar || '--slider-pct';
        const thumbScaleVar = opts.thumbScaleVar || null;
        const restScale = Number.isFinite(opts.restScale) ? opts.restScale : 1;
        const activeScale = Number.isFinite(opts.activeScale) ? opts.activeScale : 1.16;
        const spLib = Spring();

        let thumbSpring = null;
        if (thumbScaleVar && spLib) {
            thumbSpring = spLib.createSpring({
                el: inputEl,
                initial: restScale,
                target: restScale,
                preset: spLib.PRESETS.SLIDER_DRAG,
                precision: 0.004,
                onUpdate: (v) => inputEl.style.setProperty(thumbScaleVar, v.toFixed(3))
            });
            inputEl.style.setProperty(thumbScaleVar, restScale.toFixed(3));
        }

        const setActive = (active) => {
            inputEl.classList.toggle('is-scrubbing', active);
            if (thumbSpring) {
                thumbSpring.setTarget(
                    active ? activeScale : restScale,
                    active ? spLib.PRESETS.SLIDER_DRAG : spLib.PRESETS.SLIDER_SETTLE
                );
            }
        };

        const onInput = () => {
            const pct = syncRangeFill(inputEl, cssVar);
            if (typeof opts.onValue === 'function') opts.onValue(Number(inputEl.value), pct, false);
        };
        const onChange = () => {
            const pct = syncRangeFill(inputEl, cssVar);
            if (typeof opts.onValue === 'function') opts.onValue(Number(inputEl.value), pct, true);
        };

        inputEl.addEventListener('input', onInput);
        inputEl.addEventListener('change', onChange);
        inputEl.addEventListener('pointerdown', () => setActive(true), { passive: true });
        inputEl.addEventListener('pointerup', () => setActive(false), { passive: true });
        inputEl.addEventListener('pointercancel', () => setActive(false), { passive: true });
        inputEl.addEventListener('blur', () => setActive(false));

        syncRangeFill(inputEl, cssVar);
        return {
            sync: () => syncRangeFill(inputEl, cssVar),
            destroy() {
                thumbSpring?.destroy();
                delete inputEl.dataset.minkoiRangeBound;
            }
        };
    }

    // ----------------------------------------------------------------------
    // 2. SHARED SEGMENTED SPRING PILL CONTROLLER (Frosted | Liquid, etc.)
    // ----------------------------------------------------------------------
    function createSegmentedController(containerEl, options) {
        if (!containerEl) return null;
        const opts = options || {};
        const itemSelector = opts.itemSelector || 'button[data-segment]';
        const attrName = opts.attrName || 'data-segment';
        const activeAttr = opts.activeAttr || 'aria-pressed';

        let pillEl = containerEl.querySelector(':scope > .segmented-spring-pill');
        if (!pillEl) {
            pillEl = doc.createElement('span');
            pillEl.className = 'segmented-spring-pill';
            pillEl.setAttribute('aria-hidden', 'true');
            containerEl.insertBefore(pillEl, containerEl.firstChild);
        }
        containerEl.classList.add('has-spring-pill');

        const spLib = Spring();
        let pillGroup = null;
        if (spLib && typeof spLib.createSpringGroup === 'function') {
            const preset = spLib.PRESETS.SEGMENTED_PILL || spLib.PRESETS.TAB_PILL;
            pillGroup = spLib.createSpringGroup({
                x: { initial: 3, preset, precision: 0.25 },
                w: { initial: 90, preset, precision: 0.25 }
            }, {
                onRender: (vals) => {
                    if (!pillEl || !pillEl.isConnected) return;
                    pillEl.style.width = `${Math.max(16, vals.w).toFixed(1)}px`;
                    pillEl.style.transform = `translate3d(${vals.x.toFixed(1)}px, 0, 0)`;
                }
            });
        }

        let currentValue = opts.initialValue || '';

        function sync(value, instant) {
            if (value !== undefined) currentValue = String(value);
            const buttons = Array.from(containerEl.querySelectorAll(itemSelector));
            let activeBtn = null;
            buttons.forEach((btn) => {
                const isActive = btn.getAttribute(attrName) === currentValue;
                btn.setAttribute(activeAttr, isActive ? 'true' : 'false');
                if (isActive) activeBtn = btn;
            });
            if (!activeBtn) activeBtn = buttons[0];
            if (!activeBtn) return;

            const x = activeBtn.offsetLeft;
            const w = activeBtn.offsetWidth;
            if (w < 8) return;

            const snapNow = Boolean(instant || !pillGroup || spLib?.isAccessibilityReducedMotion?.());
            if (snapNow) {
                if (pillGroup) pillGroup.snap({ x, w });
                else {
                    pillEl.style.width = `${w.toFixed(1)}px`;
                    pillEl.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
                }
            } else {
                pillGroup.setTargets({ x, w });
            }
        }

        // Keyboard Left/Right roving navigation within segmented group
        containerEl.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const buttons = Array.from(containerEl.querySelectorAll(itemSelector));
            const idx = buttons.indexOf(doc.activeElement);
            if (idx < 0 || buttons.length < 2) return;
            e.preventDefault();
            const next = buttons[(idx + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length];
            next.focus({ preventScroll: true });
            next.click();
        });

        let ro = null;
        if (typeof global.ResizeObserver === 'function') {
            ro = new global.ResizeObserver(() => sync(currentValue, true));
            try { ro.observe(containerEl); } catch (_) {}
        }

        return {
            sync,
            getValue: () => currentValue,
            destroy() {
                ro?.disconnect();
                pillGroup?.destroy();
            }
        };
    }

    // ----------------------------------------------------------------------
    // 3. SHARED PRESS SCALE CALCULATOR (Direct Maven COUI SinkFeedback × Miuix pressStrength)
    // ----------------------------------------------------------------------
    function computePressScale(el, rect, tier) {
        const bridge = Bridge();
        const baseSink = (bridge && typeof bridge.couiDefaultSinkAmount === 'function')
            ? bridge.couiDefaultSinkAmount() : 0.94;
        const dpr = global.devicePixelRatio || 1;
        const strength = (bridge && typeof bridge.pressStrength === 'function' && rect && rect.width > 0)
            ? bridge.pressStrength(rect.width * dpr, rect.height * dpr, dpr) : 1;
        const sinkSpan = Math.max(0.01, 1 - baseSink);
        const factor = tier === 'hero' ? 0.85 : (tier === 'quiet' ? 0.34 : 0.52);
        return Math.max(0.935, Math.min(0.992, 1 - sinkSpan * factor * strength));
    }

    // ----------------------------------------------------------------------
    // 4. SHARED OVERLAY ALPHA EASING (Direct Maven COUI InEase / OutEase)
    // ----------------------------------------------------------------------
    function easeOverlayAlpha(fraction) {
        const t = Math.max(0, Math.min(1, fraction / 0.72));
        const bridge = Bridge();
        if (bridge && typeof bridge.couiBezierEasing === 'function') {
            return bridge.couiBezierEasing(1, t);
        }
        return t * (2 - t);
    }

    function applyAdaptiveSquircle(el, radiusPx) {
        if (!el || NATIVE_SQUIRCLE_SUPPORTED) return () => {};
        if (global.MinkoiSquircle && typeof global.MinkoiSquircle.applySquircleClip === 'function') {
            return global.MinkoiSquircle.applySquircleClip(el, radiusPx || 20);
        }
        return () => {};
    }

    global.MinkoiFoundation = Object.freeze({
        VERSION: '5.6.2',
        COMPONENT_CATEGORIES,
        NATIVE_SQUIRCLE_SUPPORTED,
        syncRangeFill,
        bindOpticalRange,
        createSegmentedController,
        computePressScale,
        easeOverlayAlpha,
        applyAdaptiveSquircle,
        getInfo: () => ({
            version: '5.6.2',
            categoriesCovered: COMPONENT_CATEGORIES.length,
            categories: COMPONENT_CATEGORIES,
            nativeSquircle: NATIVE_SQUIRCLE_SUPPORTED,
            motionEngine: 'MinkoiSpring (Miuix folmeSpring + COUI couiSpring)',
            directMavenActive: Boolean(Bridge()?.getState?.()?.directMavenActive)
        })
    });
})(typeof window !== 'undefined' ? window : globalThis);
