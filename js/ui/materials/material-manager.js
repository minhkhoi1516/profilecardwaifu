/* ==========================================================================
   MINKOI 5.6 · INDEPENDENT MATERIAL MANAGER (FROSTED <-> LIQUID COORDINATOR)
   --------------------------------------------------------------------------
   Coordinates atomic, zero-disruption switching between the two independent
   material renderers:
     - MinkoiFrostedRenderer (serene matte diffusion, zero WebGL cost)
     - MinkoiLiquidRenderer  (crystal WebGL2 Backdrop×Miuix×COUI refraction)

   Contracts guaranteed on every material switch:
     - Never rebuilds DOM or resets audio playback, persona, lyrics, or scroll.
     - Never steals or drops keyboard focus (`document.activeElement`).
     - Never causes layout shift or surface resize.
     - Synchronizes `#nav-material-switch`, `#suite-material-chip`, `body[data-nav-material]`,
       `localStorage`, and dispatches `minkoi:nav-material`.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    if (!doc) return;

    const STORAGE_KEY = 'minkoi_nav_material';
    let currentMode = 'frosted';
    let segmentedCtrl = null;
    let switchCount = 0;

    function getFrosted() { return global.MinkoiFrostedRenderer || null; }
    function getLiquid() { return global.MinkoiLiquidRenderer || null; }

    function syncControls(instant) {
        const isLiquid = currentMode === 'liquid';
        if (segmentedCtrl) {
            segmentedCtrl.sync(currentMode, instant);
        } else {
            doc.querySelectorAll('.nav-material-switch button[data-nav-material]').forEach((btn) => {
                btn.setAttribute('aria-pressed', btn.dataset.navMaterial === currentMode ? 'true' : 'false');
            });
        }

        const suiteChip = doc.getElementById('suite-material-chip');
        const suiteLabel = doc.getElementById('suite-material-label');
        if (suiteChip) {
            suiteChip.setAttribute('aria-pressed', isLiquid ? 'true' : 'false');
            suiteChip.title = isLiquid
                ? 'Đang bật Liquid Glass · Nhấn để chuyển về Frosted'
                : 'Đang bật Frosted Blur · Nhấn để chuyển sang Liquid Glass';
        }
        if (suiteLabel) {
            suiteLabel.textContent = isLiquid ? 'Liquid' : 'Frosted';
        }
    }

    function setMaterial(value, persist) {
        const next = value === 'liquid' ? 'liquid' : 'frosted';
        const changed = next !== currentMode;
        currentMode = next;
        if (changed) switchCount++;

        if (doc.body) {
            doc.body.dataset.navMaterial = currentMode;
        }

        // Activate ONLY the target renderer; cleanly deactivate the other
        if (currentMode === 'liquid') {
            getFrosted()?.deactivate?.();
            getFrosted()?.syncCategoryStripPalette?.(true);
            getLiquid()?.activate?.();
        } else {
            getLiquid()?.deactivate?.();
            getFrosted()?.activate?.();
        }

        syncControls(!persist);

        if (persist) {
            try { global.localStorage?.setItem(STORAGE_KEY, currentMode); } catch (_) {}
        }

        global.dispatchEvent(new CustomEvent('minkoi:nav-material', {
            detail: { material: currentMode, changed }
        }));
        return currentMode;
    }

    function toggleMaterial(showToastMsg) {
        const next = currentMode === 'liquid' ? 'frosted' : 'liquid';
        setMaterial(next, true);
        global.MinkoiFeedback?.selection?.();
        if (showToastMsg && typeof global.showToast === 'function') {
            global.showToast(
                next === 'liquid' ? 'Chất liệu: Liquid Glass' : 'Chất liệu: Frosted Blur',
                'fa-droplet'
            );
        }
        return next;
    }

    function init() {
        const sw = doc.getElementById('nav-material-switch');
        if (sw && global.MinkoiFoundation?.createSegmentedController) {
            segmentedCtrl = global.MinkoiFoundation.createSegmentedController(sw, {
                itemSelector: 'button[data-nav-material]',
                attrName: 'data-nav-material',
                activeAttr: 'aria-pressed',
                initialValue: currentMode
            });
        }

        let saved = 'frosted';
        try {
            const stored = global.localStorage?.getItem(STORAGE_KEY);
            if (stored === 'liquid' || stored === 'frosted') saved = stored;
        } catch (_) {}

        setMaterial(saved, false);

        doc.querySelectorAll('.nav-material-switch button[data-nav-material]').forEach((btn) => {
            if (btn.dataset.materialBound === '1') return;
            btn.dataset.materialBound = '1';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (btn.dataset.navMaterial === currentMode) return;
                setMaterial(btn.dataset.navMaterial, true);
                global.MinkoiFeedback?.selection?.();
            });
        });

        const suiteChip = doc.getElementById('suite-material-chip');
        if (suiteChip && suiteChip.dataset.materialBound !== '1') {
            suiteChip.dataset.materialBound = '1';
            suiteChip.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMaterial(true);
            });
        }

        global.addEventListener('minkoi:persona', () => {
            getFrosted()?.onEnvironmentChange?.(currentMode === 'liquid');
        });
        global.addEventListener('minkoi:themechange', () => {
            getFrosted()?.onEnvironmentChange?.(currentMode === 'liquid');
        });
    }

    if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    global.MinkoiMaterialManager = Object.freeze({
        setMaterial,
        getMaterial: () => currentMode,
        toggleMaterial,
        syncSegmentedControl: (instant) => segmentedCtrl?.sync(currentMode, instant),
        notifySurfaceMotion: () => { if (currentMode === 'liquid') getLiquid()?.notifySurfaceMotion?.(); },
        syncBannerTexture: () => { if (currentMode === 'liquid') getLiquid()?.syncBannerTexture?.(); },
        getStats: () => ({
            activeMode: currentMode,
            switchCount,
            frosted: getFrosted()?.getStats?.() || null,
            liquid: getLiquid()?.getStats?.() || null
        })
    });
})(typeof window !== 'undefined' ? window : globalThis);
