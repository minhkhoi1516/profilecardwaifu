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

    function isFocusableVisible(el) {
        if (!el || !doc.contains(el)) return false;
        if (el.closest('[hidden], [aria-hidden="true"]')) return false;
        const st = global.getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
        if (el.offsetParent === null && st.position !== 'fixed') return false;
        return el.getClientRects().length > 0;
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
        return Array.from(container.querySelectorAll(sel)).filter(isFocusableVisible);
    }

    function pushFocusTrap(container, restoreEl, options) {
        if (!container) return () => {};
        const opts = options || {};
        // Prevent duplicate overlapping trap entries for the same container
        for (let i = activeTraps.length - 1; i >= 0; i--) {
            if (activeTraps[i].container === container) {
                if (typeof activeTraps[i].cleanupOnly === 'function') {
                    activeTraps[i].cleanupOnly();
                } else {
                    activeTraps.splice(i, 1);
                }
            }
        }

        const prev = restoreEl || doc.activeElement;
        const entry = { container, prev, released: false, cleanupOnly: null };
        activeTraps.push(entry);

        const focusFallback = (preferLast) => {
            const items = getFocusableElements(container);
            if (items.length) {
                const target = preferLast ? items[items.length - 1] : items[0];
                try { target.focus({ preventScroll: true }); } catch (_) {}
                return true;
            }
            if (typeof container.focus === 'function') {
                if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
                try { container.focus({ preventScroll: true }); } catch (_) {}
                return true;
            }
            return false;
        };

        const onKeyDown = (e) => {
            if (entry.released || activeTraps[activeTraps.length - 1] !== entry) return;
            if (e.key !== 'Tab') return;
            const items = getFocusableElements(container);
            if (!items.length) {
                e.preventDefault();
                focusFallback(false);
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            const active = doc.activeElement;
            if (!container.contains(active) || items.indexOf(active) === -1) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus({ preventScroll: true });
                return;
            }
            if (e.shiftKey && (active === first || active === container)) {
                e.preventDefault();
                last.focus({ preventScroll: true });
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus({ preventScroll: true });
            }
        };

        const onFocusIn = (e) => {
            if (entry.released || activeTraps[activeTraps.length - 1] !== entry) return;
            if (container.contains(e.target)) return;
            focusFallback(false);
        };

        doc.addEventListener('keydown', onKeyDown, true);
        doc.addEventListener('focusin', onFocusIn, true);

        const detachOnly = () => {
            if (entry.released) return;
            entry.released = true;
            doc.removeEventListener('keydown', onKeyDown, true);
            doc.removeEventListener('focusin', onFocusIn, true);
            const idx = activeTraps.indexOf(entry);
            if (idx !== -1) activeTraps.splice(idx, 1);
        };
        entry.cleanupOnly = detachOnly;

        if (opts.initialFocus) {
            focusFallback(false);
        }

        return (releaseOpts) => {
            const wasReleased = entry.released;
            detachOnly();
            if (wasReleased) return;
            const shouldRestore = !releaseOpts || releaseOpts.restoreFocus !== false;
            if (shouldRestore && entry.prev && typeof entry.prev.focus === 'function' && isFocusableVisible(entry.prev)) {
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
            '.btn-control',
            '.panel-btn',
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

        function releaseCurrentTrap(restoreFocus) {
            if (!releaseTrap) return;
            const fn = releaseTrap;
            releaseTrap = null;
            fn({ restoreFocus: restoreFocus !== false });
            if (restoreFocus === false && doc.activeElement && dropdown.contains(doc.activeElement)) {
                try { doc.activeElement.blur(); } catch (_) {}
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

            releaseCurrentTrap(false);
            releaseTrap = pushFocusTrap(dropdown, btn, { initialFocus: true });

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

            releaseCurrentTrap(options.restoreFocus !== false);

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
            closeMenu({ restoreFocus: false });
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
    const bottomSheetStates = new WeakMap();

    function bindBottomSheetSwipe(sheetEl, onDismiss) {
        if (!sheetEl) return;

        const handles = Array.from(sheetEl.querySelectorAll('.sheet-drag-handle, .menu-header, .playlist-header-top'));
        if (!handles.length) return;

        const spLib = Spring();
        let state = bottomSheetStates.get(sheetEl);

        if (!state) {
            state = {
                currentY: 0,
                startY: 0,
                lastY: 0,
                lastTime: 0,
                velocityY: 0,
                dragging: false,
                exiting: false,
                activePointerId: null,
                gestureGen: 0,
                onDismiss: typeof onDismiss === 'function' ? onDismiss : null,
                spring: null
            };
            state.spring = spLib
                ? spLib.createSpring({
                    el: sheetEl,
                    initial: 0,
                    target: 0,
                    preset: spLib.PRESETS.BOTTOM_SHEET_SETTLE,
                    precision: 0.5,
                    velocityPrecision: 3,
                    onUpdate: (y) => {
                        state.currentY = y;
                        if (!sheetEl.classList.contains('open') && !state.exiting && !state.dragging) {
                            sheetEl.style.transform = '';
                            return;
                        }
                        sheetEl.style.transform = Math.abs(y) < 0.2 ? '' : `translateY(${y.toFixed(1)}px)`;
                        if (state.exiting && Number.isFinite(state.exitTarget) && y >= state.exitTarget - 8 && typeof state.activeFinalize === 'function') {
                            state.activeFinalize();
                        }
                    }
                })
                : null;
            bottomSheetStates.set(sheetEl, state);
        } else {
            state.onDismiss = typeof onDismiss === 'function' ? onDismiss : null;
            state.gestureGen += 1;
            state.dragging = false;
            state.exiting = false;
            state.activePointerId = null;
            if (state.spring) {
                state.spring.onComplete = null;
                if (!sheetEl.classList.contains('open')) {
                    state.spring.snap(0);
                    sheetEl.classList.remove('sheet-swiping');
                    sheetEl.style.transform = '';
                }
            }
        }

        const hasScrolledContent = (target) => {
            if (target && target.closest('.sheet-drag-handle')) return false;
            if (sheetEl.scrollTop > 2) return true;
            const scroller = sheetEl.querySelector('.playlist-items-scroll, .menu-items');
            return Boolean(scroller && scroller.scrollTop > 2);
        };

        const finishDrag = (cancelled) => {
            if (!state.dragging) return;
            state.dragging = false;
            state.activePointerId = null;

            const shouldDismiss = !cancelled && (
                state.currentY > 110 ||
                (state.velocityY > 650 && state.currentY > 20)
            );

            if (shouldDismiss) {
                const exitGen = ++state.gestureGen;
                state.exiting = true;
                sheetEl.classList.add('sheet-swiping');
                const exitTarget = Math.max((sheetEl.offsetHeight || 320) + 48, 360);
                state.exitTarget = exitTarget;

                const finalizeDismiss = () => {
                    if (exitGen !== state.gestureGen || !state.exiting) return;
                    state.exiting = false;
                    state.activeFinalize = null;
                    state.exitTarget = 0;
                    if (state.spring) {
                        state.spring.onComplete = null;
                        state.spring.snap(exitTarget);
                    }
                    if (typeof state.onDismiss === 'function') state.onDismiss();
                    global.requestAnimationFrame(() => {
                        if (exitGen !== state.gestureGen || state.dragging || state.exiting) return;
                        sheetEl.classList.remove('sheet-swiping');
                        sheetEl.style.transform = '';
                        state.currentY = 0;
                        if (state.spring) state.spring.snap(0);
                    });
                };
                state.activeFinalize = finalizeDismiss;

                if (state.spring && !(spLib && spLib.isReducedMotion && spLib.isReducedMotion())) {
                    state.spring.snap(state.currentY);
                    if (state.velocityY > 0) {
                        state.spring.impulse(Math.min(900, state.velocityY));
                    }
                    state.spring.setTarget(exitTarget, {
                        dampingRatio: 0.92,
                        stiffness: 460,
                        onComplete: finalizeDismiss
                    });
                } else {
                    finalizeDismiss();
                }
                return;
            }

            const settleGen = ++state.gestureGen;
            state.exiting = false;
            if (state.spring) {
                sheetEl.classList.add('sheet-swiping');
                state.spring.snap(state.currentY);
                state.spring.setTarget(0, {
                    dampingRatio: spLib.PRESETS.BOTTOM_SHEET_SETTLE.dampingRatio,
                    stiffness: spLib.PRESETS.BOTTOM_SHEET_SETTLE.stiffness,
                    onComplete: () => {
                        if (settleGen !== state.gestureGen || state.dragging || state.exiting) return;
                        sheetEl.classList.remove('sheet-swiping');
                        sheetEl.style.transform = '';
                    }
                });
            } else {
                sheetEl.classList.remove('sheet-swiping');
                sheetEl.style.transform = '';
                state.currentY = 0;
            }
        };

        handles.forEach((handle) => {
            if (handle.dataset.swipeHandleBound === 'true') return;
            handle.dataset.swipeHandleBound = 'true';

            handle.addEventListener('pointerdown', (e) => {
                if ((global.innerWidth || 1024) > 768) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                if (e.target.closest('button, input, a, select, textarea') && !e.target.closest('.sheet-drag-handle')) return;
                if (hasScrolledContent(e.target)) return;
                if (state.dragging && state.activePointerId !== null && state.activePointerId !== e.pointerId) return;

                // Interrupt any active settle or exit animation smoothly from currentY
                state.gestureGen += 1;
                state.exiting = false;
                state.activeFinalize = null;
                state.exitTarget = 0;
                state.dragging = true;
                state.activePointerId = e.pointerId;
                state.startY = e.clientY - state.currentY;
                state.lastY = e.clientY;
                state.lastTime = performance.now();
                state.velocityY = 0;

                sheetEl.classList.add('sheet-swiping');
                if (state.spring) {
                    state.spring.onComplete = null;
                    state.spring.snap(state.currentY);
                }
                try { handle.setPointerCapture(e.pointerId); } catch (_) {}
            });

            handle.addEventListener('pointermove', (e) => {
                if (!state.dragging || e.pointerId !== state.activePointerId) return;
                const now = performance.now();
                const dt = Math.max(4, now - state.lastTime) / 1000;
                state.velocityY = (e.clientY - state.lastY) / dt;
                state.lastY = e.clientY;
                state.lastTime = now;

                const rawDy = e.clientY - state.startY;
                // Miuix rubberband resistance when dragging upward past 0
                state.currentY = rawDy < 0 && spLib ? spLib.obtainDampingDistance(rawDy, 48) : rawDy;
                sheetEl.style.transform = Math.abs(state.currentY) < 0.2 ? '' : `translateY(${state.currentY.toFixed(1)}px)`;
            });

            handle.addEventListener('pointerup', (e) => {
                if (!state.dragging || e.pointerId !== state.activePointerId) return;
                try {
                    if (handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) {
                        handle.releasePointerCapture(e.pointerId);
                    }
                } catch (_) {}
                finishDrag(false);
            });

            handle.addEventListener('pointercancel', (e) => {
                if (!state.dragging || e.pointerId !== state.activePointerId) return;
                finishDrag(true);
            });

            handle.addEventListener('lostpointercapture', (e) => {
                if (!state.dragging || e.pointerId !== state.activePointerId) return;
                finishDrag(false);
            });
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
    // 7. MIUIX iOS-LIKE LIQUID GLASS TABROW & NAVIGATION INDICATOR
    // Reference: Miuix IosLiquidGlassNavigationBar.kt, Lens.kt, Glasmio
    // ----------------------------------------------------------------------
    const liquidNavInstances = new WeakMap();

    function initLiquidGlassNav(navEl, onSelect) {
        if (!navEl) return null;
        let instance = liquidNavInstances.get(navEl);
        if (instance) {
            if (typeof onSelect === 'function') instance.onSelect = onSelect;
            return instance;
        }

        let indicator = null;

        function ensureIndicator() {
            if (!indicator || !indicator.isConnected) {
                indicator = navEl.querySelector('.liquid-glass-indicator, .tab-sliding-pill');
                if (!indicator) {
                    indicator = doc.createElement('div');
                    indicator.className = 'liquid-glass-indicator';
                    indicator.setAttribute('aria-hidden', 'true');

                    const lens = doc.createElement('div');
                    lens.className = 'liquid-glass-lens';
                    indicator.appendChild(lens);

                    const shimmer = doc.createElement('div');
                    shimmer.className = 'liquid-glass-shimmer';
                    indicator.appendChild(shimmer);

                    navEl.insertBefore(indicator, navEl.firstChild);
                } else if (!indicator.isConnected) {
                    navEl.insertBefore(indicator, navEl.firstChild);
                }
            }
            if (indicator) {
                indicator.style.display = 'block';
                indicator.style.opacity = '1';
            }
            navEl.classList.add('has-liquid-nav');
            if (instance) instance.indicator = indicator;
            return indicator;
        }

        ensureIndicator();
        navEl.classList.add('has-liquid-nav');

        const spLib = Spring();
        let xSp = null;
        let wSp = null;
        let scaleXSp = null;
        let suppressClickUntil = 0;
        let gestureState = 'idle'; // 'idle' | 'pressed' | 'dragging' | 'settling'
        let dragPointerId = null;
        let dragStartX = 0;
        let dragStartY = 0;
        let lastPointerClientX = 0;
        let lastPointerTime = 0;
        let dragVelocity = 0;
        let autoScrollRaf = 0;
        let lastRenderedW = -1;

        // Cached layout during drag to prevent synchronous layout thrashing (0ms move frames)
        let cachedNavRectLeft = 0;
        let cachedNavRectRight = 0;
        let cachedTabs = [];
        let grabOffset = 0;
        let dragStartIndicatorW = 64;
        let dragStartIndicatorX = 0;
        let minContentX = 0;
        let maxContentX = 0;
        let dragVisualX = 0;

        function renderTransform(x, w, sx, sy) {
            const ind = ensureIndicator();
            if (!ind) return;
            const safeX = Number.isFinite(x) ? x : 0;
            const safeW = Number.isFinite(w) ? Math.max(16, w) : 48;
            const safeSx = Number.isFinite(sx) ? sx : 1;
            const safeSy = Number.isFinite(sy) ? sy : 1;
            if (Math.abs(lastRenderedW - safeW) >= 0.5) {
                ind.style.width = `${safeW.toFixed(1)}px`;
                lastRenderedW = safeW;
            }
            ind.style.transform = `translate3d(${safeX.toFixed(1)}px, 0, 0) scale(${safeSx.toFixed(3)}, ${safeSy.toFixed(3)})`;
        }

        function getActiveTab() {
            return navEl.querySelector('.cat-tab.active') || navEl.querySelector('.cat-tab');
        }

        function getCandidateTab() {
            if (!cachedTabs || !cachedTabs.length) return null;
            const indicatorCenter = dragVisualX + dragStartIndicatorW / 2;
            let best = null;
            let minDist = Infinity;
            for (let i = 0; i < cachedTabs.length; i++) {
                const item = cachedTabs[i];
                const dist = Math.abs(indicatorCenter - item.center);
                if (dist < minDist) {
                    minDist = dist;
                    best = item;
                }
            }
            return best;
        }

        function updateIndicatorPosition(clientX) {
            const fingerContentX = clientX - cachedNavRectLeft + navEl.scrollLeft;
            const rawX = fingerContentX - grabOffset;
            let curX = rawX;

            if (curX < minContentX) {
                const overshoot = curX - minContentX;
                const damped = spLib ? spLib.obtainDampingDistance(overshoot, 36) : overshoot * 0.3;
                curX = minContentX + damped;
            } else if (curX > maxContentX) {
                const overshoot = curX - maxContentX;
                const damped = spLib ? spLib.obtainDampingDistance(overshoot, 36) : overshoot * 0.3;
                curX = maxContentX + damped;
            }

            let stretchX = 1;
            if (!spLib || !spLib.isReducedMotion()) {
                const speedAbs = Math.abs(dragVelocity);
                stretchX = 1 + Math.min(0.24, Math.abs(rawX - dragStartIndicatorX) / 220 + speedAbs * 0.00015);
            }
            const squashY = 1 / Math.sqrt(stretchX);

            dragVisualX = curX;
            renderTransform(curX, dragStartIndicatorW, stretchX, squashY);
        }

        function updateCandidateHighlight() {
            const candidate = getCandidateTab();
            if (cachedTabs) {
                for (let i = 0; i < cachedTabs.length; i++) {
                    const item = cachedTabs[i];
                    item.el.classList.toggle('drag-candidate', Boolean(candidate && item.el === candidate.el));
                }
            }
        }

        // All spring callbacks render from a single coherent state. Earlier
        // x/width/stretch callbacks overwrote each other's transform mid-frame.
        function renderSpringFrame() {
            if (gestureState === 'dragging' || !xSp) return;
            const reduced = spLib && (spLib.isAccessibilityReducedMotion
                ? spLib.isAccessibilityReducedMotion() : spLib.isReducedMotion());
            const dynamicStretch = reduced ? 1
                : 1 + Math.min(0.12, Math.abs(xSp.velocity || 0) * 0.00016);
            const scale = Math.max(0.88, Math.min(1.18,
                (scaleXSp ? scaleXSp.value : 1) * dynamicStretch));
            renderTransform(xSp.value, wSp ? wSp.value : 64, scale, 1 / Math.sqrt(scale));
        }

        function ensureSprings() {
            ensureIndicator();
            if (xSp && wSp && scaleXSp) return;
            const activeTab = getActiveTab();
            const initX = activeTab ? activeTab.offsetLeft : 0;
            const initW = activeTab ? activeTab.offsetWidth : 64;

            if (!spLib) {
                renderTransform(initX, initW, 1, 1);
                return;
            }

            const preset = spLib.PRESETS.LIQUID_GLASS || spLib.PRESETS.TAB_PILL;
            const stretchPreset = spLib.PRESETS.LIQUID_STRETCH || preset;

            xSp = spLib.createSpring({
                initial: initX,
                target: initX,
                allowEcoMotion: true,
                dampingRatio: preset.dampingRatio,
                stiffness: preset.stiffness,
                precision: 0.25,
                onUpdate: () => renderSpringFrame()
            });

            wSp = spLib.createSpring({
                initial: initW,
                target: initW,
                allowEcoMotion: true,
                dampingRatio: preset.dampingRatio,
                stiffness: preset.stiffness,
                precision: 0.25,
                onUpdate: () => renderSpringFrame()
            });

            scaleXSp = spLib.createSpring({
                initial: 1,
                target: 1,
                allowEcoMotion: true,
                dampingRatio: stretchPreset.dampingRatio,
                stiffness: stretchPreset.stiffness,
                precision: 0.005,
                onUpdate: () => renderSpringFrame()
            });

            renderTransform(initX, initW, 1, 1);
        }

        function syncIndicator() {
            if (gestureState === 'dragging' || gestureState === 'pressed') return;
            const wasDetached = !indicator || !indicator.isConnected;
            ensureIndicator();
            if (wasDetached) lastRenderedW = -1;
            const activeTab = getActiveTab();
            if (!activeTab) return;
            const targetX = activeTab.offsetLeft;
            const targetW = activeTab.offsetWidth;
            if (!targetW) {
                global.requestAnimationFrame(() => syncIndicator());
                return;
            }

            ensureSprings();

            // Rebuilds via innerHTML detach the glass lens even when spring targets stay put.
            if (wasDetached) {
                if (xSp) xSp.snap(targetX);
                if (wSp) wSp.snap(targetW);
                if (scaleXSp) scaleXSp.snap(1);
                renderTransform(targetX, targetW, 1, 1);
                return;
            }

            if (!spLib || (spLib.isAccessibilityReducedMotion
                ? spLib.isAccessibilityReducedMotion() : spLib.isReducedMotion())) {
                if (xSp) xSp.snap(targetX);
                if (wSp) wSp.snap(targetW);
                if (scaleXSp) scaleXSp.snap(1);
                renderTransform(targetX, targetW, 1, 1);
                return;
            }

            xSp.setTarget(targetX);
            wSp.setTarget(targetW);
            scaleXSp.setTarget(1);
        }

        function startAutoScroll() {
            if (autoScrollRaf) return;
            const step = () => {
                if (gestureState !== 'dragging') {
                    autoScrollRaf = 0;
                    return;
                }

                const edgeZone = 44;
                const leftBoundary = cachedNavRectLeft + edgeZone;
                const rightBoundary = cachedNavRectRight - edgeZone;
                let speed = 0;

                if (lastPointerClientX < leftBoundary) {
                    const ratio = Math.min(1, Math.max(0, (leftBoundary - lastPointerClientX) / edgeZone));
                    speed = -Math.round(ratio * 14);
                } else if (lastPointerClientX > rightBoundary) {
                    const ratio = Math.min(1, Math.max(0, (lastPointerClientX - rightBoundary) / edgeZone));
                    speed = Math.round(ratio * 14);
                }

                if (speed === 0) {
                    autoScrollRaf = 0;
                    return;
                }
                if (speed !== 0) {
                    const maxScroll = navEl.scrollWidth - navEl.clientWidth;
                    const nextScroll = Math.max(0, Math.min(maxScroll, navEl.scrollLeft + speed));
                    if (nextScroll !== navEl.scrollLeft) {
                        navEl.scrollLeft = nextScroll;
                        // Synchronously re-render transform in the exact same frame to eliminate freeze/lag
                        updateIndicatorPosition(lastPointerClientX);
                        updateCandidateHighlight();
                    }
                }

                autoScrollRaf = global.requestAnimationFrame(step);
            };

            autoScrollRaf = global.requestAnimationFrame(step);
        }

        function stopAutoScroll() {
            if (autoScrollRaf) {
                global.cancelAnimationFrame(autoScrollRaf);
                autoScrollRaf = 0;
            }
        }

        function onPointerDown(e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (gestureState === 'dragging' || e.isPrimary === false) return;
            // Any category can start a press-and-scrub gesture, not just the active
            // pill. Native clicks still work; horizontal motion moves the lens.
            const pressedTab = e.target && e.target.closest ? e.target.closest('.cat-tab') : null;
            const activeTab = getActiveTab();
            if (!pressedTab || !navEl.contains(pressedTab) || !activeTab) return;
            ensureSprings();

            // Cancel any ongoing programmatic smooth scroll immediately to avoid coordinate competition
            try {
                navEl.scrollTo({ left: navEl.scrollLeft, behavior: 'auto' });
            } catch (_) {}

            dragPointerId = e.pointerId;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            lastPointerClientX = e.clientX;
            lastPointerTime = performance.now();
            dragVelocity = 0;

            const navRect = navEl.getBoundingClientRect();
            cachedNavRectLeft = navRect.left;
            cachedNavRectRight = navRect.right;

            const tabs = Array.from(navEl.querySelectorAll('.cat-tab'));
            cachedTabs = tabs.map(t => ({
                el: t,
                left: t.offsetLeft,
                width: t.offsetWidth,
                center: t.offsetLeft + t.offsetWidth / 2,
                cat: t.dataset.cat
            }));

            const activeItem = cachedTabs.find(t => t.el === activeTab);
            // Anchor at the category under the finger. The glass starts moving
            // toward it on press and then tracks the finger on horizontal drag.
            const pressedItem = cachedTabs.find(t => t.el === pressedTab) || activeItem;
            dragStartIndicatorX = pressedItem ? pressedItem.left : activeTab.offsetLeft;
            dragStartIndicatorW = pressedItem ? pressedItem.width : activeTab.offsetWidth;
            dragVisualX = dragStartIndicatorX;

            minContentX = cachedTabs.length ? cachedTabs[0].left : 0;
            maxContentX = cachedTabs.length
                ? cachedTabs[cachedTabs.length - 1].left + cachedTabs[cachedTabs.length - 1].width - dragStartIndicatorW
                : 300;

            const fingerContentX = e.clientX - cachedNavRectLeft + navEl.scrollLeft;
            grabOffset = fingerContentX - dragStartIndicatorX;

            gestureState = 'pressed';
            if (pressedTab !== activeTab) {
                // Visual preview only; do not commit the playlist before release.
                if (xSp) xSp.setTarget(dragStartIndicatorX);
                if (wSp) wSp.setTarget(dragStartIndicatorW);
            }
        }

        function onPointerMove(e) {
            if (dragPointerId === null || e.pointerId !== dragPointerId) return;

            const now = performance.now();
            const dt = Math.max(1, now - lastPointerTime);
            dragVelocity = (e.clientX - lastPointerClientX) / (dt / 1000);
            lastPointerClientX = e.clientX;
            lastPointerTime = now;

            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;

            if (gestureState === 'pressed') {
                if (Math.abs(deltaY) > 7 && Math.abs(deltaY) > Math.abs(deltaX)) {
                    // Yield gesture to native vertical scrolling
                    gestureState = 'idle';
                    dragPointerId = null;
                    // A vertical page scroll cancels the uncommitted glass preview.
                    syncIndicator();
                    return;
                }

                if (Math.abs(deltaX) > 6 && Math.abs(deltaX) >= Math.abs(deltaY) * 0.8) {
                    gestureState = 'dragging';
                    navEl.classList.add('is-liquid-dragging');
                    if (indicator) indicator.classList.add('is-dragging');
                    try {
                        navEl.setPointerCapture(e.pointerId);
                    } catch (_) {}
                    // Finger owns the lens now: stop outstanding spring motions.
                    if (xSp) xSp.snap(dragVisualX);
                    if (wSp) wSp.snap(dragStartIndicatorW);
                    if (scaleXSp) scaleXSp.snap(1);
                }
            }

            if (gestureState !== 'dragging') return;

            e.preventDefault();

            updateIndicatorPosition(e.clientX);
            updateCandidateHighlight();
            startAutoScroll();
        }

        function onPointerUp(e, cancelled = false) {
            if (dragPointerId === null || e.pointerId !== dragPointerId) return;
            const capturedPointerId = dragPointerId;
            dragPointerId = null;

            stopAutoScroll();

            try {
                if (navEl.hasPointerCapture(capturedPointerId)) {
                    navEl.releasePointerCapture(capturedPointerId);
                }
            } catch (_) {}

            navEl.classList.remove('is-liquid-dragging');
            if (indicator) indicator.classList.remove('is-dragging');

            if (cachedTabs) {
                cachedTabs.forEach(t => t.el.classList.remove('drag-candidate'));
            }

            const wasDragging = gestureState === 'dragging';
            gestureState = wasDragging ? 'settling' : 'idle';

            if (wasDragging) {
                suppressClickUntil = performance.now() + 180;
            }

            if (wasDragging && !cancelled) {
                const targetItem = getCandidateTab();
                const targetTab = targetItem ? targetItem.el : getActiveTab();
                if (targetTab) {
                    const targetCat = targetTab.dataset.cat;
                    const targetX = targetTab.offsetLeft;
                    const targetW = targetTab.offsetWidth;

                    if (xSp) {
                        /* Start spring at the visually rendered (rubberband-clamped) X.
                         * Raw pointer delta here would jump the lens on release. */
                        xSp.snap(dragVisualX);
                        xSp.impulse(Math.max(-2000, Math.min(2000, dragVelocity)) * 0.12);
                        xSp.setTarget(targetX, {
                            onComplete: () => {
                                gestureState = 'idle';
                            }
                        });
                    } else {
                        gestureState = 'idle';
                    }
                    if (wSp) wSp.setTarget(targetW);
                    if (scaleXSp) {
                        scaleXSp.snap(1.15);
                        scaleXSp.setTarget(1);
                    }

                    if (typeof instance.onSelect === 'function') {
                        // Edge auto-scroll already places the dragged category in view.
                        // Do not start a second smooth-scroll while the spring settles.
                        instance.onSelect(targetCat, { fromLiquidDrag: true });
                    }
                } else {
                    gestureState = 'idle';
                }
            } else if (cancelled && wasDragging) {
                gestureState = 'idle';
                syncIndicator();
            } else {
                gestureState = 'idle';
                if (cancelled) syncIndicator();
            }
        }

        function onPointerCancel(e) {
            onPointerUp(e, true);
        }

        const onNavClick = (e) => {
            if (performance.now() < suppressClickUntil) {
                e.preventDefault();
                // stopPropagation doesn't block music.js's listener on this same node.
                e.stopImmediatePropagation();
            }
            // Native clicks are handled by music.js; onSelect is used for drags only.
        };
        // Capture before music.js's delegated bubble listener; otherwise a
        // post-drag synthetic click can select a different tab twice.
        navEl.addEventListener('click', onNavClick, true);

        navEl.addEventListener('pointerdown', onPointerDown, { passive: true });
        global.addEventListener('pointermove', onPointerMove, { passive: false });
        global.addEventListener('pointerup', onPointerUp, { passive: true });
        global.addEventListener('pointercancel', onPointerCancel, { passive: true });
        navEl.addEventListener('lostpointercapture', onPointerCancel);

        let resizeObserver = null;
        if (typeof ResizeObserver === 'function') {
            let roTimer = 0;
            resizeObserver = new ResizeObserver(() => {
                if (gestureState === 'dragging' || gestureState === 'pressed') return;
                if (roTimer) return;
                roTimer = global.requestAnimationFrame(() => {
                    roTimer = 0;
                    if (gestureState === 'dragging' || gestureState === 'pressed') return;
                    syncIndicator();
                });
            });
            try {
                resizeObserver.observe(navEl);
            } catch (_) {}
        }

        instance = {
            navEl: navEl,
            indicator: indicator,
            onSelect: onSelect,
            sync: syncIndicator,
            destroy() {
                if (resizeObserver) {
                    try { resizeObserver.disconnect(); } catch (_) {}
                    resizeObserver = null;
                }
                stopAutoScroll();
                dragPointerId = null;
                gestureState = 'idle';
                navEl.classList.remove('is-liquid-dragging');
                navEl.removeEventListener('click', onNavClick, true);
                navEl.removeEventListener('pointerdown', onPointerDown);
                navEl.removeEventListener('lostpointercapture', onPointerCancel);
                global.removeEventListener('pointermove', onPointerMove);
                global.removeEventListener('pointerup', onPointerUp);
                global.removeEventListener('pointercancel', onPointerCancel);
                if (xSp) xSp.destroy();
                if (wSp) wSp.destroy();
                if (scaleXSp) scaleXSp.destroy();
                liquidNavInstances.delete(navEl);
            }
        };

        liquidNavInstances.set(navEl, instance);
        syncIndicator();
        if (doc.fonts && doc.fonts.ready) {
            doc.fonts.ready.then(() => syncIndicator());
        }
        return instance;
    }

    function syncTabIndicator(navEl, onSelect) {
        if (!navEl) return;
        let instance = liquidNavInstances.get(navEl);
        if (!instance) {
            instance = initLiquidGlassNav(navEl, onSelect);
        } else {
            if (typeof onSelect === 'function') instance.onSelect = onSelect;
            instance.sync();
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
        getActiveTrapCount: () => activeTraps.length,
        registerOverlay: registerOverlay,
        closeAllOverlays: closeAllOverlays,
        bindBottomSheetSwipe: bindBottomSheetSwipe,
        bindMiuixSwitch: bindMiuixSwitch,
        syncTabIndicator: syncTabIndicator,
        syncLiquidGlassNav: syncTabIndicator,
        initLiquidGlassNav: initLiquidGlassNav
    });
})(window);
