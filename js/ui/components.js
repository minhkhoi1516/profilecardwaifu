/* ==========================================================================
   MINKOI V3 · MIUIX INTERACTIVE COMPONENT ARCHITECTURE
   ListPopup · Overlay Coordinator · BottomSheet Swipe · SinkFeedback · Switch · TabRow
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    const Spring = () => global.MinkoiSpring;

    // ----------------------------------------------------------------------
    // 1. BODY SCROLL LOCK & FOCUS TRAP
    // ----------------------------------------------------------------------
    let scrollLockCount = 0;
    let savedOverflow = '';
    const activeTraps = [];

    function lockBodyScroll() {
        scrollLockCount++;
        if (scrollLockCount === 1 && doc.body) {
            savedOverflow = doc.body.style.overflow || '';
            doc.body.style.overflow = 'hidden';
        }
    }

    function unlockBodyScroll() {
        if (scrollLockCount <= 0) return;
        scrollLockCount--;
        if (scrollLockCount === 0 && doc.body) {
            doc.body.style.overflow = savedOverflow;
        }
    }

    function getFocusableElements(container) {
        if (!container) return [];
        const sel = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');
        return Array.from(container.querySelectorAll(sel)).filter((el) => {
            const st = global.getComputedStyle(el);
            return st.display !== 'none' && st.visibility !== 'hidden' && el.offsetParent !== null;
        });
    }

    function pushFocusTrap(container, restoreEl) {
        if (!container) return () => {};
        const prev = restoreEl || doc.activeElement;
        const entry = { container, prev };
        activeTraps.push(entry);

        const onKeyDown = (e) => {
            if (activeTraps[activeTraps.length - 1] !== entry) return;
            if (e.key !== 'Tab') return;
            const items = getFocusableElements(container);
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && doc.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && doc.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        doc.addEventListener('keydown', onKeyDown);
        return () => {
            doc.removeEventListener('keydown', onKeyDown);
            const idx = activeTraps.indexOf(entry);
            if (idx !== -1) activeTraps.splice(idx, 1);
            if (entry.prev && typeof entry.prev.focus === 'function' && doc.contains(entry.prev)) {
                try { entry.prev.focus({ preventScroll: true }); } catch (_) {}
            }
        };
    }

    // ----------------------------------------------------------------------
    // 2. MUTUAL-EXCLUSION OVERLAY COORDINATOR
    // ----------------------------------------------------------------------
    const overlayRegistry = new Map();

    function registerOverlay(id, handlers) {
        overlayRegistry.set(id, handlers);
    }

    function closeAllOverlays(exceptId) {
        overlayRegistry.forEach((h, id) => {
            if (id !== exceptId && typeof h.isOpen === 'function' && h.isOpen()) {
                h.close({ restoreFocus: false });
            }
        });
    }

    // ----------------------------------------------------------------------
    // 3. MIUIX SINK FEEDBACK (Independent CSS `scale` property)
    // ----------------------------------------------------------------------
    function initPressFeedback() {
        const spLib = Spring();
        if (!spLib) return;

        const selector = [
            '.ctrl-btn',
            '.top-action-btn',
            '.play-hero-btn',
            '.suite-badge-btn',
            '.cat-tab',
            '.persona-chip',
            '.social-link-pill',
            '.quality-option-btn',
            '.fx-preset-btn'
        ].join(',');

        const springs = new WeakMap();

        function getScaleSpring(el) {
            let sp = springs.get(el);
            if (!sp) {
                sp = spLib.createSpring({
                    initial: 1,
                    target: 1,
                    preset: spLib.PRESETS.SINK,
                    precision: 0.002,
                    onUpdate: (val) => {
                        el.style.scale = val === 1 ? '' : val.toFixed(4);
                    }
                });
                springs.set(el, sp);
            }
            return sp;
        }

        let activeEl = null;

        doc.addEventListener('pointerdown', (e) => {
            if (e.button && e.button !== 0) return;
            const target = e.target && e.target.closest ? e.target.closest(selector) : null;
            if (!target || target.disabled) return;
            activeEl = target;
            const sinkTarget = target.id === 'play-pause' ? 0.90 : 0.94;
            getScaleSpring(target).setTarget(sinkTarget);
        }, { passive: true });

        const release = () => {
            if (!activeEl) return;
            const el = activeEl;
            activeEl = null;
            getScaleSpring(el).setTarget(1);
        };

        doc.addEventListener('pointerup', release, { passive: true });
        doc.addEventListener('pointercancel', release, { passive: true });
    }

    // ----------------------------------------------------------------------
    // 4. MIUIX TOP-RIGHT LISTPOPUP (#top-more-dropdown)
    // ----------------------------------------------------------------------
    function initTopMorePopup() {
        const wrap = doc.getElementById('top-more-menu-wrap');
        const btn = doc.getElementById('top-more-btn');
        const dropdown = doc.getElementById('top-more-dropdown');
        if (!wrap || !btn || !dropdown) return;

        let scrim = doc.getElementById('miuix-popup-scrim');
        if (!scrim) {
            scrim = doc.createElement('div');
            scrim.id = 'miuix-popup-scrim';
            scrim.className = 'miuix-popup-scrim';
            scrim.setAttribute('aria-hidden', 'true');
            doc.body.appendChild(scrim);
        }

        let popupState = 'closed'; // 'closed' | 'opening' | 'open' | 'closing'
        let transitionGen = 0;
        let releaseTrap = null;
        let popupOriginX = '100%';
        let popupOriginY = '0%';

        function setPopupState(nextState) {
            popupState = nextState;
            wrap.dataset.popupState = nextState;
            dropdown.dataset.popupState = nextState;
            const expanded = nextState === 'opening' || nextState === 'open';
            wrap.classList.toggle('open', expanded);
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
        setPopupState('closed');

        const spLib = Spring();
        const applyFraction = (f) => {
            const clamped = Math.max(0, Math.min(1.06, f));
            const scaleVal = 0.15 + 0.85 * clamped;
            const clipBottom = Math.max(0, (1 - Math.min(1, clamped)) * 88);
            const alpha = Math.max(0, Math.min(1, clamped * 1.45));

            dropdown.style.transformOrigin = `${popupOriginX} ${popupOriginY}`;
            dropdown.style.transform = `scale(${scaleVal.toFixed(4)})`;
            dropdown.style.opacity = alpha.toFixed(3);
            dropdown.style.clipPath = clamped >= 0.985 ? 'none' : `inset(0px 0px ${clipBottom.toFixed(1)}% 0px round 20px)`;
            scrim.style.opacity = Math.min(1, Math.max(0, clamped)).toFixed(3);
        };

        const fractionSpring = spLib
            ? spLib.createSpring({
                initial: 0,
                target: 0,
                preset: spLib.PRESETS.LIST_POPUP,
                precision: 0.01,
                velocityPrecision: 0.05,
                onUpdate: applyFraction
            })
            : null;

        function computeAnchor() {
            const btnRect = btn.getBoundingClientRect();
            const vw = global.innerWidth || doc.documentElement.clientWidth;
            const vh = global.innerHeight || doc.documentElement.clientHeight;
            const margin = 8;

            dropdown.style.left = '';
            dropdown.style.right = '0px';
            dropdown.style.top = 'calc(100% + 8px)';
            dropdown.style.bottom = '';

            // Use unscaled layout box dimensions (offsetWidth/offsetHeight) instead of scaled rect
            const menuW = Math.max(228, dropdown.offsetWidth || 240);
            const projectedLeft = btnRect.right - menuW;
            if (projectedLeft < margin) {
                const shiftRight = margin - projectedLeft;
                dropdown.style.right = `${-shiftRight}px`;
            }

            const centerX = btnRect.left + btnRect.width / 2;
            const finalLeft = Math.max(margin, btnRect.right - menuW);
            const relX = Math.max(12, Math.min(menuW - 12, centerX - finalLeft));
            popupOriginX = `${relX.toFixed(0)}px`;
            popupOriginY = '0px';

            // Flip above trigger if near bottom edge
            const menuH = dropdown.offsetHeight || 280;
            if (btnRect.bottom + 8 + menuH > vh - margin && btnRect.top - 8 - menuH > margin) {
                dropdown.style.top = 'auto';
                dropdown.style.bottom = 'calc(100% + 8px)';
                popupOriginY = '100%';
            }
            if (menuW > vw - margin * 2) {
                dropdown.style.maxWidth = `${vw - margin * 2}px`;
            }
        }

        function openMenu() {
            if (popupState === 'opening' || popupState === 'open') return;
            const myGen = ++transitionGen;
            // Cancel any pending close animation callback before closing sibling overlays
            if (fractionSpring) {
                fractionSpring.onComplete = null;
            }
            closeAllOverlays('top-more');
            computeAnchor();

            setPopupState('opening');
            dropdown.style.visibility = 'visible';
            dropdown.style.pointerEvents = 'auto';
            scrim.classList.add('active');

            if (fractionSpring) {
                fractionSpring.setTarget(1, {
                    onComplete: () => {
                        if (myGen !== transitionGen || popupState !== 'opening') return;
                        setPopupState('open');
                        applyFraction(1);
                    }
                });
            } else {
                applyFraction(1);
                setPopupState('open');
            }

            if (releaseTrap) releaseTrap();
            releaseTrap = pushFocusTrap(dropdown, btn);
        }

        function closeMenu(opts) {
            const options = opts || {};
            if (popupState === 'closing' || popupState === 'closed') return;
            const myGen = ++transitionGen;
            if (fractionSpring) {
                fractionSpring.onComplete = null;
            }
            setPopupState('closing');
            scrim.classList.remove('active');

            if (releaseTrap) {
                const fn = releaseTrap;
                releaseTrap = null;
                if (options.restoreFocus !== false) {
                    fn();
                } else {
                    // Clean listener without moving focus when another control caused close
                    const items = activeTraps.filter((t) => t.container === dropdown);
                    items.forEach((t) => { t.prev = null; });
                    fn();
                }
            }

            const hideDone = () => {
                if (myGen !== transitionGen || popupState !== 'closing') return;
                setPopupState('closed');
                dropdown.style.visibility = 'hidden';
                dropdown.style.pointerEvents = 'none';
                dropdown.style.clipPath = '';
            };

            if (fractionSpring) {
                fractionSpring.setTarget(0, { onComplete: hideDone });
            } else {
                applyFraction(0);
                hideDone();
            }
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (popupState === 'opening' || popupState === 'open') {
                closeMenu({ restoreFocus: true });
            } else {
                openMenu();
            }
        });

        scrim.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu({ restoreFocus: true });
        });

        doc.addEventListener('click', (e) => {
            if (popupState !== 'opening' && popupState !== 'open') return;
            if (!wrap.contains(e.target) && e.target !== scrim) {
                closeMenu({ restoreFocus: false });
            }
        });

        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (popupState === 'opening' || popupState === 'open')) {
                e.preventDefault();
                closeMenu({ restoreFocus: true });
            }
        });

        dropdown.querySelectorAll('.top-more-item').forEach((item) => {
            item.addEventListener('click', () => {
                closeMenu({ restoreFocus: false });
            });
        });

        // Keyboard arrow navigation inside menu
        dropdown.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            const items = Array.from(dropdown.querySelectorAll('.top-more-item, .quality-option-btn'));
            if (!items.length) return;
            e.preventDefault();
            const cur = items.indexOf(doc.activeElement);
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const next = (cur + delta + items.length) % items.length;
            items[next].focus();
        });

        registerOverlay('top-more', {
            isOpen: () => popupState === 'opening' || popupState === 'open',
            close: closeMenu
        });

        // Quality selector pills inside menu
        const qualityBtns = dropdown.querySelectorAll('.quality-option-btn');
        qualityBtns.forEach((qBtn) => {
            qBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = qBtn.getAttribute('data-quality');
                if (typeof global.setMinkoiQuality === 'function') {
                    global.setMinkoiQuality(mode, true);
                }
            });
        });
    }

    // ----------------------------------------------------------------------
    // 5. MIUIX BOTTOM SHEET SWIPE & DISMISS HELPER (Mobile <= 768px)
    // ----------------------------------------------------------------------
    function bindBottomSheetSwipe(sheetEl, onDismiss) {
        if (!sheetEl || sheetEl.dataset.swipeBound === 'true') return;
        sheetEl.dataset.swipeBound = 'true';

        const handle = sheetEl.querySelector('.sheet-drag-handle, .menu-header');
        if (!handle) return;

        const spLib = Spring();
        let currentY = 0;
        let startY = 0;
        let lastY = 0;
        let lastTime = 0;
        let velocityY = 0;
        let dragging = false;

        const sheetSpring = spLib
            ? spLib.createSpring({
                initial: 0,
                target: 0,
                preset: spLib.PRESETS.BOTTOM_SHEET_SETTLE,
                precision: 0.4,
                onUpdate: (y) => {
                    currentY = y;
                    sheetEl.style.transform = y === 0 ? '' : `translateY(${y.toFixed(1)}px)`;
                }
            })
            : null;

        handle.addEventListener('pointerdown', (e) => {
            if ((global.innerWidth || 1024) > 768) return;
            if (e.target.closest('button') && !e.target.closest('.sheet-drag-handle')) return;
            dragging = true;
            startY = e.clientY;
            lastY = e.clientY;
            lastTime = performance.now();
            velocityY = 0;
            if (sheetSpring) sheetSpring.snap(0);
            try { handle.setPointerCapture(e.pointerId); } catch (_) {}
        });

        handle.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const now = performance.now();
            const dt = Math.max(1, now - lastTime) / 1000;
            velocityY = (e.clientY - lastY) / dt;
            lastY = e.clientY;
            lastTime = now;

            const rawDy = e.clientY - startY;
            // Miuix rubberband resistance when dragging upward past 0
            currentY = rawDy < 0 && spLib ? spLib.obtainDampingDistance(rawDy, 48) : rawDy;
            sheetEl.style.transform = `translateY(${currentY.toFixed(1)}px)`;
        });

        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            if (currentY > 110 || velocityY > 650) {
                sheetEl.style.transform = '';
                currentY = 0;
                if (typeof onDismiss === 'function') onDismiss();
                return;
            }
            if (sheetSpring) {
                sheetSpring.snap(currentY);
                sheetSpring.setTarget(0);
            } else {
                sheetEl.style.transform = '';
            }
        };

        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', () => {
            dragging = false;
            if (sheetSpring) {
                sheetSpring.snap(currentY);
                sheetSpring.setTarget(0);
            } else {
                sheetEl.style.transform = '';
            }
        });
    }

    // ----------------------------------------------------------------------
    // 6. MIUIX SWITCH PHYSICS (Crossfade Switch)
    // ----------------------------------------------------------------------
    function bindMiuixSwitch(btnEl, getChecked, onToggle) {
        if (!btnEl || btnEl.dataset.miuixSwitch === 'true') return;
        btnEl.dataset.miuixSwitch = 'true';
        const spLib = Spring();
        const checkedInitial = getChecked() ? 1 : 0;

        let progressSp = null;
        let scaleSp = null;

        const applyProgress = (p) => btnEl.style.setProperty('--switch-progress', p.toFixed(4));
        const applyScale = (s) => btnEl.style.setProperty('--thumb-scale', s.toFixed(4));

        applyProgress(checkedInitial);
        applyScale(1);

        if (spLib) {
            progressSp = spLib.createSpring({
                initial: checkedInitial,
                target: checkedInitial,
                preset: spLib.PRESETS.SWITCH_THUMB,
                precision: 0.002,
                onUpdate: applyProgress
            });
            scaleSp = spLib.createSpring({
                initial: 1,
                target: 1,
                preset: spLib.PRESETS.SWITCH_SCALE,
                precision: 0.002,
                onUpdate: applyScale
            });
        }

        let pointerStartX = 0;
        let isDragging = false;
        let dragProg = checkedInitial;

        btnEl.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            pointerStartX = e.clientX;
            isDragging = false;
            dragProg = getChecked() ? 1 : 0;
            if (scaleSp) scaleSp.setTarget(1.127);
        });

        btnEl.addEventListener('pointermove', (e) => {
            if (e.buttons === 0 && e.pointerType === 'mouse') return;
            const dx = e.clientX - pointerStartX;
            if (Math.abs(dx) > 4) {
                isDragging = true;
                dragProg = Math.max(0, Math.min(1, (getChecked() ? 1 : 0) + dx / 21));
                if (progressSp) progressSp.snap(dragProg);
                else applyProgress(dragProg);
            }
        });

        const finishSwitch = (shouldCommit) => {
            if (scaleSp) scaleSp.setTarget(1);
            if (!shouldCommit) {
                const cur = getChecked() ? 1 : 0;
                if (progressSp) progressSp.setTarget(cur);
                else applyProgress(cur);
                return;
            }
            const nextState = isDragging ? dragProg >= 0.5 : !getChecked();
            if (nextState !== getChecked()) {
                onToggle(nextState);
            }
            const target = getChecked() ? 1 : 0;
            if (progressSp) progressSp.setTarget(target);
            else applyProgress(target);
        };

        btnEl.addEventListener('pointerup', (e) => {
            e.stopPropagation();
            finishSwitch(true);
        });

        btnEl.addEventListener('pointercancel', () => finishSwitch(false));
        btnEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onToggle(!getChecked());
                const t = getChecked() ? 1 : 0;
                if (progressSp) progressSp.setTarget(t);
                else applyProgress(t);
            }
        });
    }

    // ----------------------------------------------------------------------
    // 7. MIUIX TABROW SLIDING PILL INDICATOR
    // ----------------------------------------------------------------------
    const tabPillSprings = new WeakMap();

    function syncTabIndicator(navEl) {
        if (!navEl) return;
        const activeTab = navEl.querySelector('.cat-tab.active');
        if (!activeTab) return;

        let pill = navEl.querySelector('.tab-sliding-pill');
        if (!pill) {
            pill = doc.createElement('div');
            pill.className = 'tab-sliding-pill';
            pill.setAttribute('aria-hidden', 'true');
            navEl.insertBefore(pill, navEl.firstChild);
        }

        const targetX = activeTab.offsetLeft;
        const targetW = activeTab.offsetWidth;
        if (!targetW) return;

        const spLib = Spring();
        if (!spLib) {
            pill.style.transform = `translateX(${targetX}px)`;
            pill.style.width = `${targetW}px`;
            return;
        }

        let state = tabPillSprings.get(navEl);
        if (!state) {
            const xSp = spLib.createSpring({
                initial: targetX,
                target: targetX,
                preset: spLib.PRESETS.TAB_PILL,
                precision: 0.25,
                onUpdate: (x) => { pill.style.transform = `translateX(${x.toFixed(1)}px)`; }
            });
            const wSp = spLib.createSpring({
                initial: targetW,
                target: targetW,
                preset: spLib.PRESETS.TAB_PILL,
                precision: 0.25,
                onUpdate: (w) => { pill.style.width = `${w.toFixed(1)}px`; }
            });
            state = { xSp, wSp };
            tabPillSprings.set(navEl, state);
            pill.style.transform = `translateX(${targetX}px)`;
            pill.style.width = `${targetW}px`;
        } else {
            state.xSp.setTarget(targetX);
            state.wSp.setTarget(targetW);
        }
    }

    function init() {
        initPressFeedback();
        initTopMorePopup();
    }

    if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    global.MinkoiUI = Object.freeze({
        lockBodyScroll: lockBodyScroll,
        unlockBodyScroll: unlockBodyScroll,
        pushFocusTrap: pushFocusTrap,
        registerOverlay: registerOverlay,
        closeAllOverlays: closeAllOverlays,
        bindBottomSheetSwipe: bindBottomSheetSwipe,
        bindMiuixSwitch: bindMiuixSwitch,
        syncTabIndicator: syncTabIndicator
    });
})(window);
