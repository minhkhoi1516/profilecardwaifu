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
        getActiveTrapCount: () => activeTraps.length,
        registerOverlay: registerOverlay,
        closeAllOverlays: closeAllOverlays,
        bindBottomSheetSwipe: bindBottomSheetSwipe,
        bindMiuixSwitch: bindMiuixSwitch,
        syncTabIndicator: syncTabIndicator
    });
})(window);
