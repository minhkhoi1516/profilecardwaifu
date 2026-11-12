/* ==========================================================================
   MINKOI V3 · MIUIX CONTINUOUS SQUIRCLE GEOMETRY
   Generates continuous G2 cubic Bezier corner paths matching Miuix SquirclePath.kt:
   Extension = 1.1, SQUIRCLE_CONTROL = 0.643.
   ========================================================================== */
(function (global) {
    'use strict';

    const EXTENSION = 1.1;
    const SQUIRCLE_CONTROL = 0.643;

    function buildSquirclePath(width, height, radius) {
        const w = Math.max(1, width);
        const h = Math.max(1, height);
        const r = Math.max(0, radius);
        const halfMin = Math.min(w, h) * 0.5;
        const tile = Math.min(r * EXTENSION, halfMin);
        const handle = tile * (1 - SQUIRCLE_CONTROL);

        return [
            `M ${tile.toFixed(2)} 0`,
            `L ${(w - tile).toFixed(2)} 0`,
            `C ${(w - handle).toFixed(2)} 0 ${w.toFixed(2)} ${handle.toFixed(2)} ${w.toFixed(2)} ${tile.toFixed(2)}`,
            `L ${w.toFixed(2)} ${(h - tile).toFixed(2)}`,
            `C ${w.toFixed(2)} ${(h - handle).toFixed(2)} ${(w - handle).toFixed(2)} ${h.toFixed(2)} ${(w - tile).toFixed(2)} ${h.toFixed(2)}`,
            `L ${tile.toFixed(2)} ${h.toFixed(2)}`,
            `C ${handle.toFixed(2)} ${h.toFixed(2)} 0 ${(h - handle).toFixed(2)} 0 ${(h - tile).toFixed(2)}`,
            `L 0 ${tile.toFixed(2)}`,
            `C 0 ${handle.toFixed(2)} ${handle.toFixed(2)} 0 ${tile.toFixed(2)} 0`,
            'Z'
        ].join(' ');
    }

    function applySquircleClip(element, radiusPx) {
        if (!element || typeof global.ResizeObserver !== 'function') return () => {};
        // Progressive enhancement: only use JS clip-path when native corner-shape is unsupported
        if (global.CSS && global.CSS.supports && global.CSS.supports('corner-shape', 'squircle')) {
            return () => {};
        }

        const update = () => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 8 || rect.height < 8) return;
            const path = buildSquirclePath(rect.width, rect.height, radiusPx || 24);
            element.style.clipPath = `path('${path}')`;
        };

        const ro = new global.ResizeObserver(update);
        ro.observe(element);
        update();
        return () => {
            ro.disconnect();
            element.style.clipPath = '';
        };
    }

    global.MinkoiSquircle = Object.freeze({
        EXTENSION: EXTENSION,
        SQUIRCLE_CONTROL: SQUIRCLE_CONTROL,
        buildSquirclePath: buildSquirclePath,
        applySquircleClip: applySquircleClip
    });
})(window);
