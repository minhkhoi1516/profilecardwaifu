/* ==========================================================================
   MINKOI 5.6 · INDEPENDENT FROSTED MATERIAL RENDERER
   --------------------------------------------------------------------------
   Owns Frosted Blur material semantics:
     - Computes Set C WCAG AA adaptive ground, ink, and accent pigment variables
       for #audio-category-nav without per-frame layout reads or banner decode.
     - Guarantees ZERO WebGL context allocation, ZERO GPU textures, and ZERO
       idle animation loops while Frosted mode is active.
     - Shares 100% of DOM structure, component state, and interactions with the
       Liquid Material Renderer; switching never rebuilds UI or resets state.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    if (!doc) return;

    let active = false;
    let cardThemeCache = null;
    let cardColorCache = null;
    let paletteSyncCount = 0;

    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const rgb = (a) => a.map(Math.round).join(',');
    const lum = (a) => a.reduce((sum, v, i) => {
        const n = v / 255;
        return sum + (n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)) * [0.2126, 0.7152, 0.0722][i];
    }, 0);

    function parseAccentRgb() {
        const hex = global.getCurrentPersona?.()?.accent;
        if (/^#[0-9a-f]{6}$/i.test(hex || '')) {
            return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
        }
        return [56, 189, 248];
    }

    /**
     * Updates Set C WCAG AA adaptive ink & veil tokens on #audio-category-nav.
     * Used in Frosted mode (full frosted ground) and also supplies safe AA ink
     * tokens when Liquid mode is active so labels stay crisp over any artwork.
     */
    function syncCategoryStripPalette(isLiquidMode) {
        const nav = doc.getElementById('audio-category-nav');
        if (!nav) return;

        const day = doc.body.classList.contains('light-mode');
        const accent = parseAccentRgb();
        const neutral = day ? [250, 249, 245] : [14, 18, 25];
        const energy = lum(accent);
        const strength = day ? 0.7 + energy * 0.3 : 1 - energy * 0.35;
        const veilTint = Math.round(7 * strength);
        const lensTint = Math.round((isLiquidMode ? 12 : 10) * strength);
        const ground = mix(neutral, accent, veilTint / 100);
        const extreme = day ? [0, 0, 0] : [255, 255, 255];

        if (day !== cardThemeCache) {
            cardThemeCache = day;
            const cardEl = nav.closest('.card-container') || doc.body;
            cardColorCache = global.getComputedStyle(cardEl).backgroundColor.match(/[\d.]+/g)?.map(Number) || null;
        }

        const backing = cardColorCache && cardColorCache.length >= 3
            ? mix(extreme, cardColorCache, cardColorCache[3] ?? 1)
            : extreme;
        const baseInk = mix(day ? [38, 43, 51] : [241, 242, 245], accent, 0.025);

        let best = { ratio: 0, ink: baseInk.map(Math.round), step: 56 };
        for (const adjustment of [0, 0.08, 0.16, 0.24]) {
            const ink = mix(baseInk, day ? [0, 0, 0] : [255, 255, 255], adjustment).map(Math.round);
            const inkLum = lum(ink);
            for (let step = 32; step <= 64; step++) {
                const under = mix(backing, ground, step / 100);
                const tint = mix(under, accent, lensTint / 100);
                const lens = mix(tint, day ? [0, 0, 0] : [255, 255, 255], day ? 0.08 : 0.21);
                const bg = lum(day ? lens : mix(lens, [255, 255, 255], 0.045));
                const ratio = day ? (bg + 0.05) / (inkLum + 0.05) : (inkLum + 0.05) / (bg + 0.05);
                if (ratio > best.ratio) best = { ratio, ink, step };
                if (ratio >= 5.35) break;
            }
            if (best.ratio >= 5.35) break;
        }

        nav.style.setProperty('--nav-ink', `rgb(${rgb(best.ink)})`);
        nav.style.setProperty('--nav-ground', `rgba(${rgb(neutral)},${(best.step / 100).toFixed(2)})`);
        nav.style.setProperty('--nav-veil-opacity', `${best.step}%`);
        nav.style.setProperty('--nav-persona', `rgb(${rgb(accent)})`);
        nav.style.setProperty('--nav-veil-tint', `${veilTint}%`);
        nav.style.setProperty('--nav-lens-tint', `${lensTint}%`);
        paletteSyncCount++;
    }

    function activate() {
        active = true;
        cardThemeCache = null;
        syncCategoryStripPalette(false);
        global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', 'frosted-css-compositor');
    }

    function deactivate() {
        active = false;
    }

    function onEnvironmentChange(isLiquidMode) {
        cardThemeCache = null;
        syncCategoryStripPalette(Boolean(isLiquidMode));
    }

    global.MinkoiFrostedRenderer = Object.freeze({
        id: 'frosted',
        activate,
        deactivate,
        syncCategoryStripPalette,
        onEnvironmentChange,
        getStats: () => ({
            renderer: 'frosted',
            active,
            backend: 'css-compositor-blur',
            gpuAllocations: 0,
            paletteSyncCount
        })
    });
})(typeof window !== 'undefined' ? window : globalThis);
