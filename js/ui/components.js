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

        if (opts.initialFocus === 'container') {
            // Mobile search inputs should not summon the soft keyboard until
            // the user intentionally taps them. Focus the dialog container.
            if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
            try { container.focus({ preventScroll: true }); } catch (_) {}
        } else if (opts.initialFocus) {
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

    function closeAllOverlays(exceptId, opts) {
        overlayRegistry.forEach((h, id) => {
            if (id !== exceptId && typeof h.isOpen === 'function' && h.isOpen()) {
                h.close(opts || { restoreFocus: false });
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
            '#play-pause',
            '.suite-badge-btn',
            '.cat-tab',
            '.persona-chip',
            '.social-link-pill',
            '.fx-preset-btn',
            '.playlist-row',
            '.row-fav-btn',
            '.top-more-item',
            '.nav-material-switch button',
            '.lyrics-display-menu button',
            '.viz-menu-btn',
            '.viz-menu-item',
            '.viz-menu-close',
            '.zen-ctrl-btn',
            '.zen-fab',
            '.lyrics-close-btn',
            '.crossfade-toggle'
        ].join(',');

        const springs = new WeakMap();
        const hapticToggle = doc.getElementById('haptic-feedback-toggle');
        const hapticState = doc.getElementById('haptic-feedback-state');
        const hapticSupported = typeof global.navigator?.vibrate === 'function';
        let hapticEnabled = hapticSupported;
        let lastHapticAt = -Infinity;
        const soundToggle = doc.getElementById('interaction-sounds-toggle');
        const soundState = doc.getElementById('interaction-sounds-state');
        const AudioContext = global.AudioContext || global.webkitAudioContext;
        let soundEnabled = false;
        let soundContext = null;
        let lastSoundAt = -Infinity;
        try { soundEnabled = global.localStorage?.getItem('minkoi_interaction_sounds') === 'on'; } catch (_) {}

        function syncSoundSetting() {
            if (!soundToggle) return;
            soundToggle.disabled = !AudioContext;
            soundToggle.setAttribute('aria-checked', soundEnabled && AudioContext ? 'true' : 'false');
            if (soundState) soundState.textContent = !AudioContext ? 'Không hỗ trợ' : (soundEnabled ? 'Bật' : 'Tắt');
        }
        syncSoundSetting();

        // Original synthesized UI tones. Separate gain/context from music playback.
        function playInteractionSound(el) {
            if (!soundEnabled || !AudioContext || doc.hidden) return;
            const now = global.performance.now();
            if (now - lastSoundAt < 85) return;
            lastSoundAt = now;
            try {
                soundContext ||= new AudioContext();
                if (soundContext.state === 'suspended') soundContext.resume().catch(() => {});
                const time = soundContext.currentTime;
                const osc = soundContext.createOscillator();
                const gain = soundContext.createGain();
                const isMenu = el.getAttribute('aria-haspopup');
                const isSelection = el.matches('.cat-tab, .persona-chip');
                const frequency = el.matches('input[type="range"]') ? 360 : (isMenu ? (el.getAttribute('aria-expanded') === 'true' ? 420 : 620) : (isSelection ? 740 : 540));
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequency, time);
                osc.frequency.exponentialRampToValueAtTime(frequency * 0.65, time + 0.055);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.025, time + 0.004);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.065);
                osc.connect(gain);
                gain.connect(soundContext.destination);
                osc.onended = () => { osc.disconnect(); gain.disconnect(); };
                osc.start(time);
                osc.stop(time + 0.07);
            } catch (_) { /* UI feedback must never interrupt playback. */ }
        }
        soundToggle?.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            try { global.localStorage?.setItem('minkoi_interaction_sounds', soundEnabled ? 'on' : 'off'); } catch (_) {}
            syncSoundSetting();
        });
        global.MinkoiFeedback = Object.freeze({
            get soundsEnabled() { return soundEnabled; },
            selection() {
                if (!global.navigator.userActivation?.isActive) return;
                playInteractionSound({ getAttribute: () => null, matches: selector => selector === '.cat-tab, .persona-chip' });
            },
            commit(el, event) {
                if (!event?.isTrusted) return;
                playInteractionSound(el);
                vibrateTap(event, el);
            }
        });
        try {
            const saved = global.localStorage?.getItem('minkoi_haptic_feedback');
            if (saved !== null && saved !== undefined) hapticEnabled = hapticSupported && saved === 'on';
        } catch (_) {}

        function syncHapticSetting() {
            if (!hapticToggle) return;
            hapticToggle.disabled = !hapticSupported;
            hapticToggle.setAttribute('aria-checked', hapticEnabled ? 'true' : 'false');
            if (hapticState) hapticState.textContent = !hapticSupported ? 'Không hỗ trợ' : (hapticEnabled ? 'Bật' : 'Tắt');
        }
        syncHapticSetting();
        hapticToggle?.addEventListener('click', () => {
            if (!hapticSupported) return;
            hapticEnabled = !hapticEnabled;
            try { global.localStorage?.setItem('minkoi_haptic_feedback', hapticEnabled ? 'on' : 'off'); } catch (_) {}
            syncHapticSetting();
        });

        function vibrateTap(e, el) {
            if (!hapticEnabled || !hapticSupported || e?.pointerType !== 'touch') return;
            const now = global.performance?.now?.() ?? Date.now();
            if (now - lastHapticAt < 85) return;
            lastHapticAt = now;
            try {
                const pulse = el.id === 'play-pause' || el.classList.contains('play-hero-btn') ? 12 : 8;
                global.navigator.vibrate(pulse);
            } catch (_) {
                // Vibration is optional; unsupported engines must remain usable.
            }
        }

        function getScaleSpring(el, tier) {
            let sp = springs.get(el);
            if (!sp) {
                const preset = tier === 1
                    ? spLib.PRESETS.HERO_BUTTON
                    : (tier === 3 ? spLib.PRESETS.TACTILE_PRESS : spLib.PRESETS.SINK);

                sp = spLib.createSpring({
                    el,
                    initial: 1,
                    target: 1,
                    preset: preset,
                    precision: 0.002,
                    onUpdate: (val) => {
                        el.style.scale = val === 1 ? '' : val.toFixed(4);
                    }
                });
                springs.set(el, sp);
            }
            return sp;
        }

        const hero = el => el.matches('.play-hero-btn');
        function press(el) {
            if (spLib.isAccessibilityReducedMotion()) return;
            const quiet = el.matches('.cat-tab, .social-link-pill, .playlist-row, .row-fav-btn, .top-more-item, .nav-material-switch button, .lyrics-display-menu button, .viz-menu-item');
            getScaleSpring(el, hero(el) ? 1 : quiet ? 3 : 2)
                .setTarget(hero(el) ? .95 : quiet && !el.matches('.cat-tab, .social-link-pill') ? .985 : .97);
        }

        let activeEl = null;
        let activePointerId = null;
        let tapX = 0;
        let tapY = 0;
        let moved = false;
        let cancelledClick = null;
        let lastTap = null;
        let pressedAt = 0;
        let rangePointerType = '';
        const elasticSprings = new WeakMap();

        function elastic(el, x = 0, y = 0, tilt = 0) {
            // Reserve expressive tilt for the primary playback action; list
            // and settings hit targets must stay put during a swipe.
            if (!hero(el) || spLib.isAccessibilityReducedMotion()) return;
            let group = elasticSprings.get(el);
            if (!group) {
                if (x === 0 && y === 0 && tilt === 0) return;
                group = spLib.createSpringGroup({
                    x: { initial: 0, preset: spLib.PRESETS.TILT },
                    y: { initial: 0, preset: spLib.PRESETS.TILT },
                    tilt: { initial: 0, preset: spLib.PRESETS.TILT }
                }, { onRender: values => {
                    if (!el.isConnected) { group.destroy(); return; }
                    el.style.translate = values.x === 0 && values.y === 0 ? '' : `${values.x.toFixed(2)}px ${values.y.toFixed(2)}px`;
                    el.style.rotate = values.tilt === 0 ? '' : `${values.tilt.toFixed(2)}deg`;
                }});
                elasticSprings.set(el, group);
            }
            group.setTargets({ x, y, tilt });
        }

        doc.addEventListener('pointerdown', (e) => {
            if (e.button && e.button !== 0) return;
            rangePointerType = e.target?.matches?.('input[type="range"]') ? e.pointerType : '';
            if (!e.isPrimary) { release(e); return; }
            const target = e.target && e.target.closest ? e.target.closest(selector) : null;
            if (!target || target.disabled) return;
            activeEl = target;
            activePointerId = e.pointerId;
            tapX = e.clientX;
            tapY = e.clientY;
            moved = false;
            pressedAt = global.performance.now();
            cancelledClick = null;

            press(target);
        }, { passive: true });

        doc.addEventListener('pointermove', (e) => {
            if (!activeEl || e.pointerId !== activePointerId) return;
            const dx = e.clientX - tapX;
            const dy = e.clientY - tapY;
            if (Math.hypot(dx, dy) > 11) {
                if (!moved) springs.get(activeEl)?.setTarget(1);
                moved = true;
                elastic(activeEl, Math.tanh(dx / 50) * 2, Math.tanh(dy / 50) * 2, Math.tanh(dx / 50) * 1.2);
            }
        }, { passive: true });

        const release = (e) => {
            if (!activeEl) return;
            if (e?.isPrimary !== false && e?.pointerId !== undefined && e.pointerId !== activePointerId) return;
            const el = activeEl;
            const isTap = e?.type === 'pointerup' && !moved &&
                e.pointerId === activePointerId &&
                global.performance.now() - pressedAt < 550 &&
                (e.target === el || el.contains(e.target));
            activeEl = null;
            activePointerId = null;
            moved = false;
            springs.get(el)?.setTarget(1);
            elastic(el);
            if (isTap) lastTap = { el, pointerType: e.pointerType, time: global.performance.now() };
            else cancelledClick = { el, time: global.performance.now() };
        };

        doc.addEventListener('click', e => {
            const el = e.target?.closest?.(selector);
            if (!el || el.disabled) return;
            const now = global.performance.now();
            if (e.detail > 0 && cancelledClick?.el === el && now - cancelledClick.time < 700) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            if (!e.isTrusted) return;
            playInteractionSound(el);
            if (lastTap?.el === el && now - lastTap.time < 700) vibrateTap(lastTap, el);
            lastTap = null;
        }, true);

        doc.addEventListener('change', e => {
            const el = e.target;
            if (!e.isTrusted || !el?.matches?.('input[type="range"]')) return;
            const value = Number(el.value);
            const min = Number(el.min || 0);
            const max = Number(el.max || 100);
            if (value !== min && value !== max) return;
            playInteractionSound(el);
            vibrateTap({ pointerType: rangePointerType }, el);
        }, { passive: true });

        doc.addEventListener('pointerover', e => {
            if (e.pointerType !== 'mouse' || e.buttons) return;
            const el = e.target?.closest?.(selector);
            if (el && !el.disabled && !el.contains(e.relatedTarget)) elastic(el, 0, -1, 0);
        }, { passive: true });
        doc.addEventListener('pointerout', e => {
            const el = e.target?.closest?.(selector);
            if (el && !el.contains(e.relatedTarget)) elastic(el);
        }, { passive: true });

        doc.addEventListener('pointerup', release, { passive: true });
        doc.addEventListener('pointercancel', release, { passive: true });
        global.addEventListener('blur', release);
    }

    // ----------------------------------------------------------------------
    // 4. MIUIX TOP-RIGHT LISTPOPUP (#top-more-dropdown)
    // ----------------------------------------------------------------------
    function initTopMorePopup() {
        const wrap = doc.getElementById('top-more-menu-wrap');
        const btn = doc.getElementById('top-more-btn');
        const dropdown = doc.getElementById('top-more-dropdown');
        if (!wrap || !btn || !dropdown) return;
        // Escape the header's stacking context: the scrim is a body sibling.
        doc.body.appendChild(dropdown);

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
            dropdown.inert = !expanded;
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
        setPopupState('closed');

        const spLib = Spring();
        const applyFraction = (f) => {
            const clamped = Math.max(0, Math.min(1.04, f));
            // Miuix natural listpopup scale: starts at 0.84 and gently settles at 1.0
            const scaleVal = 0.84 + 0.16 * clamped;
            const alpha = Math.max(0, Math.min(1, clamped * 1.35));

            dropdown.style.transformOrigin = `${popupOriginX} ${popupOriginY}`;
            dropdown.style.transform = `scale(${scaleVal.toFixed(4)})`;
            dropdown.style.opacity = alpha.toFixed(3);
            scrim.style.opacity = Math.min(1, Math.max(0, clamped * 0.95)).toFixed(3);
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

            dropdown.style.position = 'fixed';
            dropdown.style.maxWidth = `${vw - margin * 2}px`;
            dropdown.style.maxHeight = `${vh - margin * 2}px`;
            dropdown.style.overflowY = 'auto';

            // Use unscaled layout box dimensions (offsetWidth/offsetHeight) instead of scaled rect
            const menuW = Math.max(228, dropdown.offsetWidth || 240);
            const finalLeft = Math.max(margin, Math.min(vw - menuW - margin, btnRect.right - menuW));
            dropdown.style.left = `${finalLeft}px`;
            dropdown.style.right = 'auto';

            const centerX = btnRect.left + btnRect.width / 2;
            const relX = Math.max(12, Math.min(menuW - 12, centerX - finalLeft));
            popupOriginX = `${relX.toFixed(0)}px`;
            popupOriginY = '0px';

            // Flip above trigger if near bottom edge
            const menuH = dropdown.offsetHeight || 280;
            let top = btnRect.bottom + 8;
            if (top + menuH > vh - margin && btnRect.top - 8 - menuH > margin) {
                top = btnRect.top - 8 - menuH;
                popupOriginY = '100%';
            }
            dropdown.style.top = `${Math.max(margin, Math.min(top, vh - menuH - margin))}px`;
            dropdown.style.bottom = 'auto';
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
            closeAllOverlays('top-more', { instant: true, restoreFocus: false });
            setPopupState('opening');
            computeAnchor();
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
            if (popupState === 'closed' || (popupState === 'closing' && !options.instant)) return;
            const myGen = ++transitionGen;
            if (fractionSpring) {
                fractionSpring.onComplete = null;
            }
            setPopupState('closing');
            dropdown.style.pointerEvents = 'none';
            scrim.classList.remove('active');

            releaseCurrentTrap(options.restoreFocus !== false);

            const hideDone = () => {
                if (myGen !== transitionGen || popupState !== 'closing') return;
                setPopupState('closed');
                dropdown.style.visibility = 'hidden';
                dropdown.style.pointerEvents = 'none';
                dropdown.style.clipPath = '';
            };

            if (options.instant) {
                if (fractionSpring) fractionSpring.snap(0);
                applyFraction(0);
                hideDone();
            } else if (fractionSpring) {
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
            if (!wrap.contains(e.target) && !dropdown.contains(e.target) && e.target !== scrim) {
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
            const items = Array.from(dropdown.querySelectorAll('.top-more-item:not(:disabled)'));
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

        let anchorFrame = 0;
        const scheduleAnchor = () => {
            if (popupState === 'closed' || anchorFrame) return;
            anchorFrame = global.requestAnimationFrame(() => {
                anchorFrame = 0;
                if (popupState === 'closed') return;
                computeAnchor();
                applyFraction(fractionSpring ? fractionSpring.value : 1);
            });
        };
        global.addEventListener('resize', scheduleAnchor, { passive: true });
        global.addEventListener('scroll', scheduleAnchor, { passive: true, capture: true });
        global.visualViewport?.addEventListener('resize', scheduleAnchor, { passive: true });

    }

    // ----------------------------------------------------------------------
    // 4b. UNIFIED MIUIX TOOL PANEL OVERLAY CONTROLLER
    // (#sleep-timer-menu, #audio-fx-menu, #playlist-menu, #lyrics-modal)
    // ----------------------------------------------------------------------
    const toolPanelControllers = new Map();

    function getPanelController(id) {
        return toolPanelControllers.get(id) || Array.from(toolPanelControllers.values()).find(ctrl => ctrl.panelEl.id === id) || null;
    }

    function createMiuixPanelOverlay(config) {
        if (!config || !config.panelEl) return null;
        const id = config.id || config.panelEl.id;
        const panelEl = config.panelEl;
        const triggerBtn = config.triggerBtn || null;
        const isCenterModal = Boolean(config.isCenterModal);
        const align = config.align || 'auto';

        let panelState = 'closed'; // 'closed' | 'opening' | 'open' | 'closing'
        let transitionGen = 0;
        let releaseTrap = null;
        let originX = '50%';
        let originY = '0%';
        let currentFraction = 0;
        let ownsScrollLock = false;

        let mobileBackdrop = doc.getElementById('mobile-flyout-backdrop');
        if (!mobileBackdrop) {
            mobileBackdrop = doc.createElement('div');
            mobileBackdrop.id = 'mobile-flyout-backdrop';
            mobileBackdrop.className = 'mobile-flyout-backdrop';
            mobileBackdrop.setAttribute('aria-hidden', 'true');
            doc.body.appendChild(mobileBackdrop);
        }

        function setPanelState(nextState) {
            panelState = nextState;
            panelEl.dataset.panelState = nextState;
            const expanded = nextState === 'opening' || nextState === 'open';
            panelEl.classList.toggle('open', expanded);
            panelEl.inert = !expanded;
            if (triggerBtn) {
                triggerBtn.classList.toggle('is-morph-active', expanded);
                triggerBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            }
        }
        setPanelState('closed');

        const spLib = Spring();
        const applyFraction = (f) => {
            currentFraction = f;
            const isMobile = (global.innerWidth || doc.documentElement.clientWidth) <= 860;
            const clamped = Math.max(0, Math.min(1.04, f));

            if (isMobile) {
                const slidePercent = Math.max(0, (1 - clamped) * 100);
                panelEl.style.transformOrigin = '50% 100%';
                // Never clear inline transform at the open position: mobile CSS defaults
                // to translateY(100%) for closed sheets, so an empty transform
                // makes the OPEN sheet vanish beneath its still-visible backdrop.
                panelEl.style.transform = `translateY(${slidePercent.toFixed(2)}%)`;
                panelEl.style.opacity = Math.min(1, clamped * 1.5).toFixed(3);
                if (mobileBackdrop) {
                    mobileBackdrop.style.opacity = Math.min(1, clamped * 0.95).toFixed(3);
                }
            } else if (isCenterModal) {
                const scaleVal = 0.88 + 0.12 * clamped;
                const alpha = Math.max(0, Math.min(1, clamped * 1.35));
                panelEl.style.transformOrigin = '50% 50%';
                panelEl.style.transform = `translate(-50%, -50%) scale(${scaleVal.toFixed(4)})`;
                panelEl.style.opacity = alpha.toFixed(3);
                if (mobileBackdrop) {
                    mobileBackdrop.style.opacity = Math.min(1, clamped * 0.95).toFixed(3);
                }
            } else {
                const scaleVal = 0.85 + 0.15 * clamped;
                const alpha = Math.max(0, Math.min(1, clamped * 1.35));
                panelEl.style.transformOrigin = `${originX} ${originY}`;
                panelEl.style.transform = `scale(${scaleVal.toFixed(4)})`;
                panelEl.style.opacity = alpha.toFixed(3);
            }
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
            const isMobile = (global.innerWidth || doc.documentElement.clientWidth) <= 860;
            const vw = global.innerWidth || doc.documentElement.clientWidth;
            const vh = global.visualViewport?.height || global.innerHeight || doc.documentElement.clientHeight;
            panelEl.style.setProperty('--panel-viewport-height', `${vh}px`);

            if (isMobile) {
                if (panelEl.parentElement !== doc.body) {
                    doc.body.appendChild(panelEl);
                }
                panelEl.style.top = '';
                panelEl.style.bottom = '';
                panelEl.style.left = '';
                panelEl.style.right = '';
                panelEl.style.maxHeight = '';
                panelEl.style.overflowY = '';
                return;
            }

            if (!isCenterModal && triggerBtn) {
                const wrapper = triggerBtn.closest('.dropdown-wrapper');
                if (wrapper && panelEl.parentElement !== wrapper) {
                    wrapper.appendChild(panelEl);
                }
            }

            if (isCenterModal) {
                panelEl.style.top = '50%';
                panelEl.style.left = '50%';
                panelEl.style.bottom = 'auto';
                panelEl.style.right = 'auto';
                panelEl.style.maxHeight = 'min(580px, 85vh)';
                panelEl.style.overflowY = 'auto';
                originX = '50%';
                originY = '50%';
                return;
            }

            if (!triggerBtn) return;

            const btnRect = triggerBtn.getBoundingClientRect();
            // Anchor tool menus below the Audio Suite heading, not merely the
            // separate website header. This preserves the prior overflow fix.
            const studioHeader = triggerBtn.closest('.studio-audio-suite')?.querySelector('.suite-header-row');
            const siteHeader = doc.querySelector('.site-brand-header');
            const headerEl = studioHeader || siteHeader;
            const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 56;
            const safeTopMargin = Math.min(
                Math.max(8, headerBottom + 12),
                Math.max(8, btnRect.top - 12)
            );
            const safeBottomMargin = vh - 12;

            const menuW = Math.max(260, panelEl.offsetWidth || (id === 'playlist-menu' ? 350 : (id === 'audio-fx-menu' ? 330 : 280)));
            const menuH = Math.max(160, panelEl.offsetHeight || 280);

            const spaceBelow = Math.max(0, safeBottomMargin - btnRect.bottom - 10);
            const spaceAbove = Math.max(0, btnRect.top - 10 - safeTopMargin);

            const flipAbove = (spaceBelow < menuH && spaceAbove > spaceBelow) ||
                              (btnRect.bottom + 10 + menuH > vh - 12 && btnRect.top - 10 - menuH > safeTopMargin);

            if (flipAbove) {
                panelEl.style.top = 'auto';
                panelEl.style.bottom = 'calc(100% + 10px)';
                originY = '100%';
                // Never enforce a 120px minimum if only 80px is available.
                panelEl.style.maxHeight = `${Math.floor(spaceAbove)}px`;
                panelEl.style.overflowY = 'auto';
            } else {
                panelEl.style.top = 'calc(100% + 10px)';
                panelEl.style.bottom = 'auto';
                originY = '0px';
                panelEl.style.maxHeight = `${Math.floor(spaceBelow)}px`;
                panelEl.style.overflowY = 'auto';
            }

            if (align === 'right' || id === 'playlist-menu') {
                panelEl.style.right = '0px';
                panelEl.style.left = 'auto';
                originX = `${menuW - 20}px`;
            } else if (align === 'left' || id === 'sleep-timer-menu') {
                panelEl.style.left = '0px';
                panelEl.style.right = 'auto';
                originX = '20px';
            } else {
                const centerShift = Math.round((menuW - btnRect.width) / 2);
                const rawLeft = btnRect.left - centerShift;
                const rawRight = rawLeft + menuW;
                let leftStyle = `calc(50% - ${centerShift}px)`;

                if (rawRight > vw - 12) {
                    const overshoot = rawRight - (vw - 12);
                    leftStyle = `calc(50% - ${centerShift + overshoot}px)`;
                } else if (rawLeft < 12) {
                    const undershoot = 12 - rawLeft;
                    leftStyle = `calc(50% - ${centerShift - undershoot}px)`;
                }
                panelEl.style.left = leftStyle;
                panelEl.style.right = 'auto';
                originX = `${Math.round(menuW / 2)}px`;
            }
        }

        function releaseCurrentTrap(restoreFocus) {
            if (!releaseTrap) return;
            const fn = releaseTrap;
            releaseTrap = null;
            fn({ restoreFocus: restoreFocus !== false });
            if (restoreFocus === false && doc.activeElement && panelEl.contains(doc.activeElement)) {
                try { doc.activeElement.blur(); } catch (_) {}
            }
        }

        function open(opts) {
            if (panelState === 'opening' || panelState === 'open') return;
            const myGen = ++transitionGen;

            if (fractionSpring) {
                fractionSpring.onComplete = null;
            }

            closeAllOverlays(id, { instant: true, restoreFocus: false });

            if (typeof config.onBeforeOpen === 'function') {
                try { config.onBeforeOpen(); } catch (_) {}
            }

            setPanelState('opening');
            computeAnchor();

            panelEl.style.visibility = 'visible';
            panelEl.style.pointerEvents = 'auto';

            const isMobile = (global.innerWidth || doc.documentElement.clientWidth) <= 860;
            if (isMobile || isCenterModal) {
                mobileBackdrop.classList.add('active');
                if (isMobile && !ownsScrollLock) {
                    lockBodyScroll();
                    ownsScrollLock = true;
                }
            }

            releaseCurrentTrap(false);
            releaseTrap = pushFocusTrap(panelEl, triggerBtn, {
                initialFocus: isMobile ? 'container' : id !== 'playlist-menu'
            });

            const openDone = () => {
                if (myGen !== transitionGen || panelState !== 'opening') return;
                setPanelState('open');
                applyFraction(1);
                if (typeof config.onAfterOpen === 'function') {
                    try { config.onAfterOpen(); } catch (_) {}
                }
            };
            if (fractionSpring) {
                const preset = isMobile ? spLib.PRESETS.BOTTOM_SHEET_OPEN : (isCenterModal ? spLib.PRESETS.DIALOG_SCALE : spLib.PRESETS.LIST_POPUP);
                fractionSpring.setTarget(1, { ...preset, onComplete: openDone });
            } else {
                applyFraction(1);
                openDone();
            }
        }

        function close(opts) {
            const options = opts || {};
            if (panelState === 'closed') return;
            if (panelState === 'closing' && !options.instant) return;
            const myGen = ++transitionGen;

            if (fractionSpring) {
                fractionSpring.onComplete = null;
            }

            if (typeof config.onBeforeClose === 'function') {
                try { config.onBeforeClose(); } catch (_) {}
            }

            setPanelState('closing');
            panelEl.style.pointerEvents = 'none';

            const isMobile = (global.innerWidth || doc.documentElement.clientWidth) <= 860;

            releaseCurrentTrap(options.restoreFocus !== false);

            const closeDone = () => {
                if (myGen !== transitionGen || panelState !== 'closing') return;
                if (ownsScrollLock) {
                    unlockBodyScroll();
                    ownsScrollLock = false;
                }
                setPanelState('closed');
                panelEl.style.visibility = 'hidden';
                panelEl.style.pointerEvents = 'none';
                panelEl.style.transform = '';
                panelEl.style.opacity = '';
                panelEl.style.maxHeight = '';
                panelEl.style.overflowY = '';
                if (mobileBackdrop) {
                    let anyOther = false;
                    toolPanelControllers.forEach(ctrl => {
                        if (ctrl !== controller && ctrl.isOpen()) anyOther = true;
                    });
                    if (!anyOther) {
                        mobileBackdrop.classList.remove('active');
                        mobileBackdrop.style.opacity = '';
                    }
                }
                if (typeof config.onAfterClose === 'function') {
                    try { config.onAfterClose(); } catch (_) {}
                }
            };

            if (options.instant || !fractionSpring || (spLib && spLib.isReducedMotion && spLib.isReducedMotion())) {
                if (fractionSpring) fractionSpring.snap(0);
                applyFraction(0);
                closeDone();
            } else {
                const preset = isMobile ? spLib.PRESETS.BOTTOM_SHEET_SETTLE : (isCenterModal ? spLib.PRESETS.DIALOG_SCALE : spLib.PRESETS.LIST_POPUP);
                fractionSpring.setTarget(0, { ...preset, onComplete: closeDone });
            }
        }

        function toggle(opts) {
            if (panelState === 'opening' || panelState === 'open') {
                close(opts);
            } else {
                open(opts);
            }
        }

        const controller = {
            id,
            panelEl,
            triggerBtn,
            open,
            close,
            toggle,
            isOpen: () => panelState === 'opening' || panelState === 'open',
            getState: () => panelState,
            prepareSwipe: () => {
                if (panelState !== 'opening' && panelState !== 'open') return false;
                if (fractionSpring) fractionSpring.snap(1);
                setPanelState('open');
                applyFraction(1);
                return true;
            },
            recomputeAnchor: computeAnchor
        };

        doc.addEventListener('click', (e) => {
            if (panelState !== 'opening' && panelState !== 'open') return;
            if (panelEl.contains(e.target) || (triggerBtn && triggerBtn.contains(e.target))) return;
            if (e.target.closest('#sleep-timer-btn, #audio-fx-btn, #lyrics-toggle-btn, #playlist-toggle-btn, #top-more-btn')) return;
            close({ restoreFocus: false });
        });

        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (panelState === 'opening' || panelState === 'open')) {
                e.preventDefault();
                e.stopPropagation();
                close({ restoreFocus: true });
            }
        });

        panelEl.addEventListener('click', (e) => {
            if (e.target.closest('.flyout-close-btn, .lyrics-close-btn')) {
                e.stopPropagation();
                close({ restoreFocus: true });
            }
        });

        if (mobileBackdrop) {
            mobileBackdrop.addEventListener('click', () => {
                if (panelState === 'opening' || panelState === 'open') {
                    close({ restoreFocus: false });
                }
            });
        }

        const onViewportChange = () => {
            if (panelState === 'opening' || panelState === 'open') {
                computeAnchor();
                const mobile = global.innerWidth <= 860;
                if (mobile && !ownsScrollLock) { lockBodyScroll(); ownsScrollLock = true; }
                if (!mobile && ownsScrollLock) { unlockBodyScroll(); ownsScrollLock = false; }
                mobileBackdrop.classList.toggle('active', mobile || isCenterModal);
                applyFraction(currentFraction);
            }
        };
        global.addEventListener('resize', onViewportChange, { passive: true });
        global.visualViewport?.addEventListener('resize', onViewportChange, { passive: true });

        bindBottomSheetSwipe(panelEl, () => close({ instant: true, restoreFocus: false }));

        registerOverlay(id, {
            isOpen: controller.isOpen,
            close: controller.close
        });

        toolPanelControllers.set(id, controller);
        return controller;
    }

    // ----------------------------------------------------------------------
    // 5. MIUIX BOTTOM SHEET SWIPE & DISMISS HELPER (Mobile <= 860px)
    // ----------------------------------------------------------------------
    const bottomSheetStates = new WeakMap();

    function bindBottomSheetSwipe(sheetEl, onDismiss) {
        if (!sheetEl) return;

        const handles = Array.from(sheetEl.querySelectorAll('.sheet-drag-handle, .menu-header, .playlist-header-top, .lyrics-drawer-header'));
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
                        sheetEl.style.transform = `translateY(${Math.abs(y) < 0.2 ? 0 : y.toFixed(1)}px)`;
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
                    const controller = getPanelController(sheetEl.id);
                    if (controller) controller.close({ instant: true, restoreFocus: false });
                    else if (typeof state.onDismiss === 'function') state.onDismiss();
                    global.requestAnimationFrame(() => {
                        if (exitGen !== state.gestureGen || state.dragging || state.exiting) return;
                        sheetEl.classList.remove('sheet-swiping');
                        sheetEl.style.transform = sheetEl.classList.contains('open') ? 'translateY(0px)' : '';
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
                        sheetEl.style.transform = sheetEl.classList.contains('open') ? 'translateY(0px)' : '';
                    }
                });
            } else {
                sheetEl.classList.remove('sheet-swiping');
                sheetEl.style.transform = sheetEl.classList.contains('open') ? 'translateY(0px)' : '';
                state.currentY = 0;
            }
        };

        handles.forEach((handle) => {
            if (handle.dataset.swipeHandleBound === 'true') return;
            handle.dataset.swipeHandleBound = 'true';

            handle.addEventListener('pointerdown', (e) => {
                if ((global.innerWidth || 1024) > 860) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                if (e.target.closest('button, input, a, select, textarea') && !e.target.closest('.sheet-drag-handle')) return;
                if (hasScrolledContent(e.target)) return;
                const controller = getPanelController(sheetEl.id);
                if (controller && !controller.prepareSwipe()) return;
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
    // 7. MINKOI V4 · ORGANIC LIQUID GLASS NAVIGATION REBORN
    // Reference: Miuix IosLiquidGlassNavigationBar.kt, Lens.kt, Glasmio Physics
    // Directional Trailing-Edge Stretch, Damped Boundary Resistance, Velocity Fling
    // ----------------------------------------------------------------------
    const liquidNavInstances = new WeakMap();
    const NAV_CLICK_SUPPRESS_MS = 260;

    // Set C material only. Model the card over both artwork extremes rather
    // than re-decoding banners: this also covers crossfades and animated Glass.
    function createWaifuCapsuleMaterial(nav, spring, clamp) {
        const light = doc.createElement('span');
        light.className = 'capsule-light';
        let left = 0, width = 64, base = 64, direction = 0, time = 0;
        let contact = null, queued = false, disposed = false, liquid = false;
        let cardTheme, cardColor;
        let transform = '', opacity = '';
        const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
        const rgb = a => a.map(Math.round).join(',');
        const lum = a => a.reduce((sum, v, i) => {
            v /= 255;
            return sum + (v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][i];
        }, 0);
        function queue() {
            if (queued) return;
            queued = true;
            Promise.resolve().then(() => {
                queued = false;
                if (disposed) return;
                const p = clamp(press?.value || 0, 0, 1);
                const dir = spring?.isAccessibilityReducedMotion?.() ? 0 : direction;
                const local = contact === null ? width * (.45 + dir * .13) : contact - left;
                const x = clamp(local - 48 + dir * 6, -42, Math.max(-42, width - 54));
                const strain = clamp(width / base - 1, -.15, .6);
                const next = `translate(${x.toFixed(2)}px,${(-p * .7).toFixed(2)}px) scaleX(${(1 + strain * .18).toFixed(3)}) skewX(${(-dir * (2 + p * 4)).toFixed(2)}deg)`;
                const alpha = ((liquid ? .09 : .035) + p * (liquid ? .42 : .23)).toFixed(3);
                if (next !== transform) { light.style.transform = next; transform = next; }
                if (alpha !== opacity) { light.style.opacity = alpha; opacity = alpha; }
            });
        }
        const press = spring?.createSpring({
            initial: 0, preset: spring.PRESETS.TACTILE_PRESS, precision: .002, onUpdate: queue
        });
        function updatePalette() {
            const day = doc.body.classList.contains('light-mode');
            liquid = doc.body.dataset.navMaterial === 'liquid';
            const hex = global.getCurrentPersona?.()?.accent;
            const accent = /^#[0-9a-f]{6}$/i.test(hex || '')
                ? [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) : [56, 189, 248];
            const neutral = day ? [250, 249, 245] : [14, 18, 25];
            const energy = lum(accent);
            // Bright accents need less pigment at night; dark accents need
            // less on light glass. Use the same amounts in CSS and the model.
            const strength = day ? .7 + energy * .3 : 1 - energy * .35;
            const veilTint = Math.round(7 * strength);
            const lensTint = Math.round((liquid ? 15 : 10) * strength);
            const ground = mix(neutral, accent, veilTint / 100);
            const extreme = day ? [0, 0, 0] : [255, 255, 255];
            // The stationary card tint depends on theme, not the persona;
            // don't force a style read during the artwork/palette transaction.
            if (day !== cardTheme) {
                cardTheme = day;
                cardColor = getComputedStyle(nav.closest('.card-container') || doc.body)
                    .backgroundColor.match(/[\d.]+/g)?.map(Number);
            }
            const backing = cardColor?.length >= 3 ? mix(extreme, cardColor, cardColor[3] ?? 1) : extreme;
            const baseInk = mix(day ? [38, 43, 51] : [241, 242, 245], accent, .025);
            let best = { ratio: 0 };
            for (const adjustment of [0, .08, .16, .24]) {
                const ink = mix(baseInk, day ? [0, 0, 0] : [255, 255, 255], adjustment).map(Math.round);
                const inkLum = lum(ink);
                for (let step = 32; step <= 64; step++) {
                    const under = mix(backing, ground, step / 100);
                    const tint = mix(under, accent, lensTint / 100);
                    // Include a conservative text-band contribution from the
                    // capsule and the production strip's top gradient.
                    const lens = mix(tint, day ? [0, 0, 0] : [255, 255, 255], day ? .08 : .21);
                    const bg = lum(day ? lens : mix(lens, [255, 255, 255], .045));
                    const ratio = day ? (bg + .05) / (inkLum + .05) : (inkLum + .05) / (bg + .05);
                    if (ratio > best.ratio) best = { ratio, ink, step };
                    if (ratio >= 5.35) break;
                }
                if (best.ratio >= 5.35) break;
            }
            nav.style.setProperty('--nav-ink', `rgb(${rgb(best.ink)})`);
            nav.style.setProperty('--nav-ground', `rgba(${rgb(neutral)},${best.step / 100})`);
            nav.style.setProperty('--nav-veil-opacity', `${best.step}%`);
            nav.style.setProperty('--nav-persona', `rgb(${rgb(accent)})`);
            nav.style.setProperty('--nav-veil-tint', `${veilTint}%`);
            nav.style.setProperty('--nav-lens-tint', `${lensTint}%`);
            queue();
        }
        function release() {
            if (contact === null) return;
            contact = null;
            press?.setTarget(0);
            queue();
        }
        const events = ['minkoi:persona', 'minkoi:themechange', 'minkoi:nav-material'];
        events.forEach(event => global.addEventListener(event, updatePalette));
        global.addEventListener('blur', release);
        updatePalette();
        return {
            light,
            geometry(x, w, standard, idle) {
                if (x === left && w === width && standard === base && (!idle || !direction)) return;
                const now = performance.now();
                direction = idle || !time ? 0 : clamp((x + w / 2 - left - width / 2) / Math.max(8, now - time) / 1.1, -1, 1);
                left = x; width = w; base = standard; time = now;
                queue();
            },
            move(x) { if (contact !== null) contact = x; },
            pressure(event) {
                if (contact === null) return;
                const target = event.pointerType !== 'mouse' && event.pressure > 0
                    ? clamp(.35 + event.pressure * .65, .35, 1) : .68;
                if (press && press.target !== target) press.setTarget(target);
                queue();
            },
            start(x, event) {
                contact = x;
                this.pressure(event);
            },
            release,
            destroy() {
                disposed = true;
                press?.destroy();
                light.remove();
                events.forEach(event => global.removeEventListener(event, updatePalette));
                global.removeEventListener('blur', release);
            }
        };
    }

    function initLiquidGlassNav(navEl, onSelect) {
        if (!navEl) return null;
        let instance = liquidNavInstances.get(navEl);
        if (instance) {
            if (typeof onSelect === 'function') instance.onSelect = onSelect;
            return instance;
        }

        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        let indicator = null;
        const spLib = Spring();
        const material = navEl.id === 'audio-category-nav' ? createWaifuCapsuleMaterial(navEl, spLib, clamp) : null;

        function ensureIndicator() {
            if (!indicator || !indicator.isConnected) {
                indicator = navEl.querySelector('.liquid-glass-indicator, .tab-sliding-pill');
                if (!indicator) {
                    indicator = doc.createElement('div');
                    indicator.className = 'liquid-glass-indicator';
                    indicator.setAttribute('aria-hidden', 'true');
                    navEl.insertBefore(indicator, navEl.firstChild);
                } else if (!indicator.isConnected) {
                    navEl.insertBefore(indicator, navEl.firstChild);
                }
                if (material) indicator.appendChild(material.light);
            }
            // DOMTokenList.add writes the class attribute even when unchanged.
            // This path runs for every capsule render; avoid redundant
            // attribute mutations and observer notifications on a stable nav.
            if (!navEl.classList.contains('has-liquid-nav')) navEl.classList.add('has-liquid-nav');
            if (instance) instance.indicator = indicator;
            return indicator;
        }

        ensureIndicator();
        navEl.classList.add('has-liquid-nav');

        const velocityTracker = spLib && typeof spLib.createVelocityTracker === 'function'
            ? spLib.createVelocityTracker()
            : null;

        let leftSpring = null;
        let rightSpring = null;
        let scaleYSpring = null;

        // idle -> pressed -> (lens | scrub) -> settling | flinging -> idle
        let state = 'idle';
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let pressRegion = 'strip';
        let horizontalBlocked = false;

        let suppressClickUntil = 0;
        let dragRaf = 0;
        let dragFrameTime = 0;
        let pendingX = 0;
        let hasPendingX = false;

        let scrollRaf = 0;
        let scrollFrameTime = 0;
        let scrollStart = 0;
        let scrollVelocity = 0;

        let settleVersion = 0;
        let committingSelect = false;
        let renderQueued = false;
        let destroyed = false;
        let resizeFrame = 0;
        let lastRelease = null;
        let lastScrub = null;

        // Cached geometry during a gesture, so no frame performs layout reads.
        let cachedNavRectLeft = 0;
        let cachedNavRectRight = 0;
        let cachedTabs = [];
        let grabOffset = 0;
        let anchorLeft = 0;
        let baseTabWidth = 64;
        let minContentX = 0;
        let maxContentX = 0;
        let maxScrollRange = 0;

        // Authoritative physical bounds of the liquid capsule, in content space.
        let currentLeft = 0;
        let currentRight = 64;
        let squashValue = 1;
        let lastRenderedWidth = -1;
        let lastRenderedTransform = '';
        let lastRenderedRadius = '';

        function getActiveTab() {
            return navEl.querySelector('.cat-tab.active') || navEl.querySelector('.cat-tab');
        }

        function getCandidateTab(projX) {
            if (!cachedTabs.length) return null;
            const center = Number.isFinite(projX) ? projX : (currentLeft + currentRight) / 2;
            let best = null;
            let minDist = Infinity;
            for (let i = 0; i < cachedTabs.length; i++) {
                const item = cachedTabs[i];
                if (!item.el.isConnected) continue;
                const dist = Math.abs(center - item.center);
                if (dist < minDist) {
                    minDist = dist;
                    best = item;
                }
            }
            return best;
        }

        function setWillChange(on) {
            if (indicator) indicator.style.willChange = on ? 'transform' : '';
        }

        // Fling projection is a hint, never a teleport: cap the predicted
        // travel so a single noisy velocity sample cannot skip several tabs.
        function projectFling(vel) {
            const limit = Math.min(190, Math.max(70, baseTabWidth * 1.5));
            return clamp(Number.isFinite(vel) ? vel * 0.18 : 0, -limit, limit);
        }

        function renderCapsule(left, right) {
            const ind = ensureIndicator();
            if (!ind) return;
            let safeLeft = Number.isFinite(left) ? left : 0;
            const rawRight = Number.isFinite(right) ? Math.max(safeLeft + 16, right) : safeLeft + 64;
            const rawWidth = Math.max(16, rawRight - safeLeft);
            // Coupled edges: one capsule never smears across the whole strip.
            const widthLimit = Math.max(56, baseTabWidth * 1.6);
            const w = Math.min(rawWidth, widthLimit);
            safeLeft += (rawWidth - w) / 2;

            const standardW = Math.max(16, baseTabWidth);
            const stretch = w / standardW;
            // Vertical volume is spring-smoothed during drag, not re-laid-out.
            const squash = clamp(squashValue, 0.84, 1.07);

            if (Math.abs(lastRenderedWidth - w) >= 0.5) {
                ind.style.width = `${w.toFixed(1)}px`;
                lastRenderedWidth = w;
            }
            const transform = `translate3d(${safeLeft.toFixed(1)}px, 0, 0) scale(1, ${squash.toFixed(3)})`;
            if (transform !== lastRenderedTransform) {
                ind.style.transform = transform;
                lastRenderedTransform = transform;
            }
            const strain = Math.min(1, Math.abs(stretch - 1));
            const radius = `${(26 + strain * 16).toFixed(1)}px / ${(26 - strain * 2).toFixed(1)}px`;
            if (radius !== lastRenderedRadius) {
                ind.style.borderRadius = radius;
                lastRenderedRadius = radius;
            }
            material?.geometry(safeLeft, lastRenderedWidth, standardW, state === 'idle');
        }

        function queueLensRender() {
            if (renderQueued) return;
            renderQueued = true;
            const run = () => {
                renderQueued = false;
                if (destroyed || state === 'lens' || state === 'scrub') return;
                if (!leftSpring || !rightSpring) return;
                currentLeft = leftSpring.value;
                currentRight = rightSpring.value;
                renderCapsule(currentLeft, currentRight);
            };
            if (typeof queueMicrotask === 'function') queueMicrotask(run);
            else Promise.resolve().then(run);
        }

        function ensureSprings() {
            ensureIndicator();
            if (leftSpring && rightSpring) return;
            const active = getActiveTab();
            const initX = active ? active.offsetLeft : 0;
            const initW = active ? active.offsetWidth : 64;
            currentLeft = initX;
            currentRight = initX + initW;
            baseTabWidth = Math.max(16, initW);
            squashValue = 1;

            if (!spLib) {
                renderCapsule(currentLeft, currentRight);
                return;
            }

            leftSpring = spLib.createSpring({
                initial: initX,
                target: initX,
                preset: spLib.PRESETS.EDGE_LEADING || spLib.PRESETS.LIQUID_GLASS,
                precision: 0.35,
                velocityPrecision: 1.5,
                onUpdate: queueLensRender
            });
            rightSpring = spLib.createSpring({
                initial: initX + initW,
                target: initX + initW,
                preset: spLib.PRESETS.EDGE_TRAILING || spLib.PRESETS.LIQUID_STRETCH,
                precision: 0.35,
                velocityPrecision: 1.5,
                onUpdate: queueLensRender
            });
            scaleYSpring = spLib.createSpring({
                initial: 1,
                target: 1,
                preset: spLib.PRESETS.LIQUID_STRETCH,
                precision: 0.002,
                velocityPrecision: 0.01,
                onUpdate: (value) => {
                    squashValue = value;
                    queueLensRender();
                }
            });
            renderCapsule(currentLeft, currentRight);
        }

        function settleTo(targetLeft, targetRight, opts) {
            const options = opts || {};
            const wasSettling = state === 'settling';
            const version = ++settleVersion;
            state = 'settling';
            setWillChange(true);
            ensureSprings();
            baseTabWidth = Math.max(16, targetRight - targetLeft);
            if (scaleYSpring) scaleYSpring.setTarget(1);

            // Both edges must come to rest before the gesture is idle again,
            // otherwise the slower trailing edge would jump to its destination.
            let pendingEdges = 2;
            const finish = () => {
                if (version !== settleVersion || state !== 'settling') return;
                state = 'idle';
                currentLeft = targetLeft;
                currentRight = targetRight;
                renderCapsule(targetLeft, targetRight);
                setWillChange(false);
                if (typeof options.onDone === 'function') options.onDone();
            };
            const edgeDone = () => {
                if (version !== settleVersion || state !== 'settling') return;
                pendingEdges -= 1;
                if (pendingEdges <= 0) finish();
            };

            if (!spLib || !leftSpring || !rightSpring) {
                currentLeft = targetLeft;
                currentRight = targetRight;
                finish();
                return;
            }

            const movingRight = targetLeft > currentLeft;
            const lead = spLib.PRESETS.EDGE_LEADING;
            const trail = spLib.PRESETS.EDGE_TRAILING;
            const impulse = Number.isFinite(options.impulse) ? clamp(options.impulse, -1600, 1600) : 0;

            // Adopt the authoritative capsule geometry before re-targeting.
            // A free-drag gesture never moved the springs, so they are synced
            // here and the release velocity is injected as a momentum impulse.
            // A retarget during a settle keeps the live spring velocity instead.
            const keepLeftVelocity = wasSettling ? leftSpring.velocity : 0;
            const keepRightVelocity = wasSettling ? rightSpring.velocity : 0;
            leftSpring.snap(currentLeft);
            rightSpring.snap(currentRight);
            leftSpring.velocity = keepLeftVelocity + impulse * 0.55;
            rightSpring.velocity = keepRightVelocity + impulse * 0.55;

            if (movingRight) {
                rightSpring.setTarget(targetRight, { dampingRatio: lead.dampingRatio, stiffness: lead.stiffness, onComplete: edgeDone });
                leftSpring.setTarget(targetLeft, { dampingRatio: trail.dampingRatio, stiffness: trail.stiffness, onComplete: edgeDone });
            } else {
                leftSpring.setTarget(targetLeft, { dampingRatio: lead.dampingRatio, stiffness: lead.stiffness, onComplete: edgeDone });
                rightSpring.setTarget(targetRight, { dampingRatio: trail.dampingRatio, stiffness: trail.stiffness, onComplete: edgeDone });
            }
        }

        function scrollTabIntoView(tab, smooth) {
            if (!tab || !tab.isConnected) return;
            const margin = 10;
            const viewLeft = navEl.scrollLeft;
            const viewRight = viewLeft + navEl.clientWidth;
            const tabLeft = tab.offsetLeft;
            const tabRight = tabLeft + tab.offsetWidth;
            if (tabLeft >= viewLeft + margin && tabRight <= viewRight - margin) return;
            const targetLeft = tabLeft < viewLeft + margin
                ? tabLeft - margin
                : tabRight - navEl.clientWidth + margin;
            const maxLeft = Math.max(0, navEl.scrollWidth - navEl.clientWidth);
            const left = Math.max(0, Math.min(maxLeft, targetLeft));
            // A JS 'smooth' request ignores the CSS Reduced Motion override and
            // would animate the strip after the capsule already snapped.
            const animate = smooth && !global.MinkoiSpring?.isAccessibilityReducedMotion?.();
            try {
                navEl.scrollTo({ left, behavior: animate ? 'smooth' : 'auto' });
            } catch (_) {
                navEl.scrollLeft = left;
            }
        }

        function syncIndicator() {
            if (destroyed || !navEl.isConnected) return;
            if (committingSelect) return;
            if (state === 'pressed' || state === 'lens' || state === 'scrub' || state === 'flinging') return;

            const wasDetached = !indicator || !indicator.isConnected;
            ensureIndicator();
            if (wasDetached) {
                lastRenderedWidth = -1;
                lastRenderedTransform = '';
                lastRenderedRadius = '';
            }

            const active = getActiveTab();
            if (!active) return;
            const targetLeft = active.offsetLeft;
            const targetWidth = active.offsetWidth;
            if (!targetWidth) return;
            const targetRight = targetLeft + targetWidth;
            baseTabWidth = targetWidth;
            ensureSprings();

            const reduced = spLib && (spLib.isAccessibilityReducedMotion
                ? spLib.isAccessibilityReducedMotion() : spLib.isReducedMotion());
            if (wasDetached || !spLib || reduced) {
                settleVersion++;
                if (leftSpring) leftSpring.snap(targetLeft);
                if (rightSpring) rightSpring.snap(targetRight);
                if (scaleYSpring) scaleYSpring.snap(1);
                squashValue = 1;
                currentLeft = targetLeft;
                currentRight = targetRight;
                state = 'idle';
                renderCapsule(targetLeft, targetRight);
                setWillChange(false);
                return;
            }

            // A rapid retarget keeps the current velocity: never reset the physics.
            if (state === 'settling'
                && Math.abs(leftSpring.target - targetLeft) < 0.5
                && Math.abs(rightSpring.target - targetRight) < 0.5) {
                return;
            }
            settleTo(targetLeft, targetRight);
        }

        function updateCandidateHighlight(projCenter) {
            const candidate = getCandidateTab(projCenter);
            cachedTabs.forEach(item => {
                item.el.classList.toggle('drag-candidate', Boolean(candidate && item.el === candidate.el));
            });
        }

        function stepLens(clientX, dt, scrollOffset) {
            // The caller passes the offset it already knows: reading scrollLeft
            // here, immediately after the autoscroll wrote it, forced a
            // synchronous layout on every drag frame.
            const offset = Number.isFinite(scrollOffset) ? scrollOffset : navEl.scrollLeft;
            const fingerContentX = clientX - cachedNavRectLeft + offset;
            material?.move(fingerContentX);
            const rawX = fingerContentX - grabOffset;
            const vel = velocityTracker ? velocityTracker.getVelocity().vx : 0;
            const speed = Math.abs(vel);

            const candidate = getCandidateTab(rawX + baseTabWidth / 2);
            if (candidate && candidate.width > 0) {
                baseTabWidth += (candidate.width - baseTabWidth) * (1 - Math.exp(-dt / 95));
            }

            const displacement = rawX - anchorLeft;
            const stationaryFactor = Math.min(1, speed / 25);
            const dispLag = Math.min(24, Math.abs(displacement) * 0.3) * stationaryFactor;
            const velLag = Math.min(26, (speed * 0.03 + 8 * Math.tanh(speed / 80)) * stationaryFactor);
            const trailLag = Math.max(velLag, dispLag);
            const dirWeight = Math.abs(vel) > 2
                ? Math.tanh(vel / 100)
                : (displacement !== 0 ? Math.sign(displacement) : 0);

            let nextLeft = rawX;
            let nextRight = rawX + baseTabWidth;
            if (dirWeight > 0.05) {
                nextRight += trailLag * Math.min(1, dirWeight);
            } else if (dirWeight < -0.05) {
                nextLeft -= trailLag * Math.min(1, -dirWeight);
            }

            let boundaryStrain = 0;
            if (nextLeft < minContentX) {
                const overshoot = minContentX - nextLeft;
                const damped = spLib ? spLib.obtainDampingDistance(overshoot, 42) : overshoot * 0.3;
                nextLeft = minContentX - damped;
                boundaryStrain = Math.min(0.3, Math.abs(damped) / 42);
                nextRight = Math.min(nextRight, nextLeft + baseTabWidth * (1 + boundaryStrain * 0.5));
            } else if (nextRight > maxContentX) {
                const overshoot = nextRight - maxContentX;
                const damped = spLib ? spLib.obtainDampingDistance(overshoot, 42) : overshoot * 0.3;
                nextRight = maxContentX + damped;
                boundaryStrain = Math.min(0.3, Math.abs(damped) / 42);
                nextLeft = Math.max(nextLeft, nextRight - baseTabWidth * (1 + boundaryStrain * 0.5));
            }

            currentLeft = nextLeft;
            currentRight = nextRight;
            renderCapsule(currentLeft, currentRight);

            if (scaleYSpring) {
                const stretch = (currentRight - currentLeft) / Math.max(16, baseTabWidth);
                const targetSquash = clamp(1 - Math.max(0, stretch - 1) * 0.28 + boundaryStrain * 0.16, 0.86, 1.06);
                if (Math.abs(scaleYSpring.target - targetSquash) > 0.0015) {
                    scaleYSpring.setTarget(targetSquash);
                }
            } else {
                squashValue = 1;
            }

            const projCenter = (currentLeft + currentRight) / 2 + projectFling(vel);
            updateCandidateHighlight(projCenter);
        }

        function edgeScrollSpeed() {
            if (maxScrollRange <= 0) return 0;
            const edgeZone = 44;
            if (pendingX < cachedNavRectLeft + edgeZone) {
                return -Math.min(1, Math.max(0, (cachedNavRectLeft + edgeZone - pendingX) / edgeZone));
            }
            if (pendingX > cachedNavRectRight - edgeZone) {
                return Math.min(1, Math.max(0, (pendingX - cachedNavRectRight + edgeZone) / edgeZone));
            }
            return 0;
        }

        function runDragLoop(now) {
            dragRaf = 0;
            if (state !== 'lens') return;
            const dt = dragFrameTime ? Math.min(48, Math.max(0, now - dragFrameTime)) : 16.67;
            dragFrameTime = now;

            // Read the scroll offset once, before this frame writes to it, so a
            // drag frame never interleaves a read with its own scroll write.
            let offset = navEl.scrollLeft;
            const speed = edgeScrollSpeed();
            if (speed) {
                const next = clamp(offset + speed * dt * 0.45, 0, maxScrollRange);
                if (next !== offset) {
                    navEl.scrollLeft = next;
                    offset = next;
                    hasPendingX = true;
                }
            }

            if (hasPendingX) {
                hasPendingX = false;
                stepLens(pendingX, dt, offset);
            }
            dragRaf = global.requestAnimationFrame(runDragLoop);
        }

        function beginLens(clientX) {
            if (pointerId === null) return;
            const navRect = navEl.getBoundingClientRect();
            cachedNavRectLeft = navRect.left;
            cachedNavRectRight = navRect.right;
            maxScrollRange = Math.max(0, navEl.scrollWidth - navEl.clientWidth);
            cachedTabs = Array.from(navEl.querySelectorAll('.cat-tab')).map(t => ({
                el: t,
                left: t.offsetLeft,
                width: t.offsetWidth,
                center: t.offsetLeft + t.offsetWidth / 2,
                cat: t.dataset.cat
            }));
            minContentX = cachedTabs.length ? cachedTabs[0].left : 0;
            maxContentX = cachedTabs.length
                ? cachedTabs[cachedTabs.length - 1].left + cachedTabs[cachedTabs.length - 1].width
                : navEl.scrollWidth;

            // Preserve travel accumulated before the horizontal intent threshold.
            // pendingX below is still the current pointer, not the press origin.
            const fingerContentX = startX - cachedNavRectLeft + navEl.scrollLeft;
            grabOffset = fingerContentX - currentLeft;
            anchorLeft = currentLeft;

            if (leftSpring) leftSpring.snap(currentLeft);
            if (rightSpring) rightSpring.snap(currentRight);

            state = 'lens';
            hasPendingX = true;
            pendingX = clientX;
            dragFrameTime = 0;
            navEl.classList.add('is-liquid-dragging');
            if (indicator) {
                indicator.classList.remove('is-pressed');
                indicator.classList.add('is-dragging');
            }
            setWillChange(true);
            try {
                navEl.setPointerCapture(pointerId);
            } catch (_) {}
            if (!dragRaf) dragRaf = global.requestAnimationFrame(runDragLoop);
        }

        function beginScrub() {
            if (pointerId === null) return;
            state = 'scrub';
            scrollStart = navEl.scrollLeft;
            maxScrollRange = Math.max(0, navEl.scrollWidth - navEl.clientWidth);
            scrollVelocity = 0;
            navEl.classList.add('is-liquid-dragging');
            setWillChange(false);
            try {
                navEl.setPointerCapture(pointerId);
            } catch (_) {}
            if (indicator) indicator.classList.remove('is-pressed');
        }

        function updateScrub(clientX) {
            const next = clamp(scrollStart - (clientX - startX), 0, maxScrollRange);
            navEl.scrollLeft = next;
        }

        function startScrollFling(velocity) {
            scrollVelocity = velocity;
            if (Math.abs(scrollVelocity) < 24) {
                state = 'idle';
                navEl.classList.remove('is-liquid-dragging');
                return;
            }
            state = 'flinging';
            scrollFrameTime = 0;
            if (!scrollRaf) scrollRaf = global.requestAnimationFrame(stepScrollFling);
        }

        function stepScrollFling(now) {
            scrollRaf = 0;
            if (state !== 'flinging') return;
            const dt = scrollFrameTime ? Math.min(48, Math.max(0, now - scrollFrameTime)) : 16.67;
            scrollFrameTime = now;
            const before = navEl.scrollLeft;
            const next = before + scrollVelocity * dt / 1000;
            const clamped = clamp(next, 0, maxScrollRange);
            navEl.scrollLeft = clamped;
            if (clamped === 0 || clamped === maxScrollRange) scrollVelocity = 0;
            scrollVelocity *= Math.exp(-dt / 360);
            if (Math.abs(scrollVelocity) < 18) {
                scrollVelocity = 0;
                state = 'idle';
                navEl.classList.remove('is-liquid-dragging');
                return;
            }
            scrollRaf = global.requestAnimationFrame(stepScrollFling);
        }

        function cancelScrollFling() {
            if (scrollRaf) {
                global.cancelAnimationFrame(scrollRaf);
                scrollRaf = 0;
            }
            scrollVelocity = 0;
        }

        function releasePointerCapture() {
            if (pointerId === null) return;
            const id = pointerId;
            try {
                if (navEl.hasPointerCapture(id)) navEl.releasePointerCapture(id);
            } catch (_) {}
        }

        function endGestureVisuals() {
            material?.release();
            navEl.classList.remove('is-liquid-dragging');
            if (indicator) {
                indicator.classList.remove('is-dragging');
                indicator.classList.remove('is-pressed');
            }
            if (cachedTabs.length) cachedTabs.forEach(item => item.el.classList.remove('drag-candidate'));
            hasPendingX = false;
        }

        function surrenderPointer() {
            releasePointerCapture();
            pointerId = null;
            endGestureVisuals();
            state = 'idle';
            horizontalBlocked = false;
        }

        function onPointerDown(e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (pointerId !== null || e.isPrimary === false) return;
            if (!navEl.contains(e.target)) return;
            if (!getActiveTab()) return;

            // A fresh primary press is a new interaction, not the compatibility
            // click from the previous drag. Keep suppressing that old click,
            // but do not swallow a deliberate tap during spring settling.
            const navRect = navEl.getBoundingClientRect();
            const lensRect = indicator ? indicator.getBoundingClientRect() : null;
            // Only the visible capsule is a lens grab. Use viewport geometry,
            // so a capsule sitting mid-flight still owns its own pixels.
            const onCapsule = Boolean(lensRect
                && e.clientX >= lensRect.left && e.clientX <= lensRect.right
                && e.clientY >= lensRect.top && e.clientY <= lensRect.bottom);
            const isTouch = e.pointerType !== 'mouse';

            // A fresh primary press is a deliberate new interaction, so the
            // previous drag's compatibility click is no longer relevant and a
            // quick follow-up tap must not be swallowed.
            suppressClickUntil = 0;

            // Ownership is declared BEFORE contact by touch-action on the hit
            // tab: active=pan-y (horizontal lens), others=native pan-x/pan-y.
            // Never claim the moving lens's pixels over an inactive tab: that
            // target already permits native pan-x and the browser would cancel us.
            const ownsTouchLens = e.target.closest?.('.cat-tab') === getActiveTab();
            if (isTouch && !ownsTouchLens) {
                return;
            }

            cancelScrollFling();
            // Freeze any in-flight smooth scroll so this gesture owns the offset.
            const frozenScroll = navEl.scrollLeft;
            try { navEl.scrollTo({ left: frozenScroll, behavior: 'auto' }); } catch (_) { navEl.scrollLeft = frozenScroll; }
            ensureSprings();

            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            pendingX = e.clientX;
            hasPendingX = false;
            horizontalBlocked = false;
            dragFrameTime = 0;
            // Chromium may fat-finger-retarget a spacing touch onto the active
            // button. Its pan-y contract then prevents native horizontal pan;
            // scrub that narrow gap instead of dragging a lens not actually hit.
            pressRegion = onCapsule ? 'lens' : 'strip';

            cachedNavRectLeft = navRect.left;
            maxScrollRange = Math.max(0, navEl.scrollWidth - navEl.clientWidth);

            if (velocityTracker) {
                velocityTracker.reset();
                velocityTracker.addPoint(e.clientX, e.clientY);
            }

            state = 'pressed';
            if (indicator) indicator.classList.toggle('is-pressed', pressRegion === 'lens');
            if (pressRegion === 'lens') material?.start(e.clientX - cachedNavRectLeft + frozenScroll, e);
        }

        function onPointerMove(e) {
            if (pointerId === null || e.pointerId !== pointerId) return;
            if (velocityTracker) velocityTracker.addPoint(e.clientX, e.clientY);
            pendingX = e.clientX;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (state === 'pressed') {
                if (Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx) * 1.1) {
                    // Natural surrender to the native vertical page scroll.
                    surrenderPointer();
                    return;
                }
                if (!horizontalBlocked && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy) * 1.05) {
                    if (pressRegion === 'lens') {
                        beginLens(e.clientX);
                    } else if (maxScrollRange > 0) {
                        // Mouse scrub, or an active-tab touch retargeted from
                        // spacing. Inactive/native pan-x touches returned above.
                        beginScrub();
                    } else {
                        // Nothing to scroll and the lens was not grabbed: keep the tap alive.
                        horizontalBlocked = true;
                    }
                }
            }

            if (state === 'lens') {
                e.preventDefault();
                hasPendingX = true;
                if (e.pointerType !== 'mouse' && e.pressure > 0) material?.pressure(e);
            } else if (state === 'scrub') {
                e.preventDefault();
                updateScrub(e.clientX);
            }
        }

        function finishLensGesture(e, cancelled) {
            const now = performance.now();
            const vel = (!cancelled && velocityTracker) ? velocityTracker.getVelocity().vx : 0;
            const center = (currentLeft + currentRight) / 2;
            const target = !cancelled
                ? getCandidateTab(center + projectFling(vel))
                : null;
            const fallback = getActiveTab();
            const targetTab = target ? target.el : fallback;
            if (!targetTab) {
                state = 'idle';
                endGestureVisuals();
                syncIndicator();
                return;
            }

            const active = getActiveTab();
            const moved = Math.abs(center - (anchorLeft + baseTabWidth / 2));
            const shouldSelect = !cancelled && targetTab.dataset.cat
                && (!active || active.dataset.cat !== targetTab.dataset.cat)
                && (moved > 10 || Math.abs(vel) > 220);

            suppressClickUntil = now + NAV_CLICK_SUPPRESS_MS;
            lastRelease = { vel: Math.round(vel), center: Math.round(center), target: targetTab.dataset.cat };

            if (shouldSelect) {
                committingSelect = true;
                try {
                    if (typeof instance.onSelect === 'function') {
                        instance.onSelect(targetTab.dataset.cat, { fromLiquidDrag: true });
                    }
                    global.MinkoiFeedback?.commit(targetTab, e);
                } finally {
                    committingSelect = false;
                }
            }

            const targetLeft = targetTab.offsetLeft;
            const targetWidth = targetTab.offsetWidth;
            settleTo(targetLeft, targetLeft + targetWidth, {
                impulse: cancelled ? 0 : vel,
                onDone: () => scrollTabIntoView(targetTab, true)
            });
        }

        function onPointerUp(e, cancelled) {
            if (pointerId === null || (e && e.pointerId !== pointerId)) return;
            const endingState = state;
            const endX = (e && Number.isFinite(e.clientX)) ? e.clientX : pendingX;
            const wasCancelled = cancelled === true;
            if (!wasCancelled && velocityTracker && e) velocityTracker.addPoint(e.clientX, e.clientY);

            releasePointerCapture();
            pointerId = null;

            if (dragRaf) {
                global.cancelAnimationFrame(dragRaf);
                dragRaf = 0;
            }

            if (endingState === 'lens') {
                if (!wasCancelled) {
                    hasPendingX = false;
                    stepLens(endX, 16.67);
                }
                endGestureVisuals();
                finishLensGesture(e, wasCancelled);
                return;
            }

            if (endingState === 'scrub') {
                const vel = (velocityTracker && !wasCancelled) ? velocityTracker.getVelocity().vx : 0;
                endGestureVisuals();
                suppressClickUntil = performance.now() + 180;
                lastScrub = { vel: Math.round(vel), from: Math.round(navEl.scrollLeft) };
                startScrollFling(-vel);
                return;
            }

            if (endingState === 'flinging') {
                cancelScrollFling();
                state = 'idle';
                endGestureVisuals();
                return;
            }

            endGestureVisuals();
            state = 'idle';
        }

        function onPointerCancel(e) {
            onPointerUp(e, true);
        }

        function onLostPointerCapture(e) {
            // Ignore a child's implicit capture being transferred to the nav.
            // An unexpected loss of our own capture must not leave a drag RAF.
            if (e.target === navEl && pointerId === e.pointerId
                && !navEl.hasPointerCapture(e.pointerId)) onPointerCancel(e);
        }

        const onNavClick = (e) => {
            // Keyboard/assistive activation has detail=0, not a drag's
            // compatibility pointer click; never discard that activation.
            if (e.detail > 0 && performance.now() < suppressClickUntil) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        };
        navEl.addEventListener('click', onNavClick, true);

        navEl.addEventListener('pointerdown', onPointerDown, { passive: true });
        global.addEventListener('pointermove', onPointerMove, { passive: false });
        global.addEventListener('pointerup', onPointerUp, { passive: true });
        global.addEventListener('pointercancel', onPointerCancel, { passive: true });
        navEl.addEventListener('lostpointercapture', onLostPointerCapture);
        navEl.addEventListener('wheel', cancelScrollFling, { passive: true });

        let resizeObserver = null;
        if (typeof ResizeObserver === 'function') {
            resizeObserver = new ResizeObserver(() => {
                if (destroyed) return;
                if (pointerId !== null) onPointerUp({ pointerId, clientX: pendingX, clientY: startY }, true);
                if (resizeFrame) return;
                resizeFrame = global.requestAnimationFrame(() => {
                    resizeFrame = 0;
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
            debug: () => ({
                gestureState: state,
                state,
                dragPointerId: pointerId,
                currentLeft,
                currentRight,
                baseTabWidth,
                lastRenderedWidth,
                squash: squashValue,
                scrollLeft: navEl.scrollLeft,
                vel: velocityTracker ? velocityTracker.getVelocity().vx : -999,
                lastRelease,
                lastScrub,
                edges: [leftSpring, rightSpring].map(spring => spring ? ({
                    value: spring.value, target: spring.target,
                    velocity: spring.velocity, running: spring.running
                }) : null),
                dragRafActive: Boolean(dragRaf),
                scrollRafActive: Boolean(scrollRaf)
            }),
            destroy() {
                destroyed = true;
                if (resizeFrame) {
                    global.cancelAnimationFrame(resizeFrame);
                    resizeFrame = 0;
                }
                if (resizeObserver) {
                    try { resizeObserver.disconnect(); } catch (_) {}
                    resizeObserver = null;
                }
                if (dragRaf) {
                    global.cancelAnimationFrame(dragRaf);
                    dragRaf = 0;
                }
                cancelScrollFling();
                releasePointerCapture();
                pointerId = null;
                state = 'idle';
                endGestureVisuals();
                navEl.removeEventListener('click', onNavClick, true);
                navEl.removeEventListener('pointerdown', onPointerDown);
                navEl.removeEventListener('wheel', cancelScrollFling);
                navEl.removeEventListener('lostpointercapture', onLostPointerCapture);
                global.removeEventListener('pointermove', onPointerMove);
                global.removeEventListener('pointerup', onPointerUp);
                global.removeEventListener('pointercancel', onPointerCancel);
                if (leftSpring) leftSpring.destroy();
                if (rightSpring) rightSpring.destroy();
                if (scaleYSpring) scaleYSpring.destroy();
                material?.destroy();
                liquidNavInstances.delete(navEl);
            }
        };

        liquidNavInstances.set(navEl, instance);
        global.__liquidNavInstance = instance;
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

    // ------------------------------------------------------------------
    // Shared navigation material preference: one physics engine, two
    // render-only materials. Switching never touches the capsule geometry.
    // ------------------------------------------------------------------
    const NAV_MATERIAL_KEY = 'minkoi_nav_material';
    let navMaterial = 'frosted';

    function applyNavMaterial(value, persist) {
        navMaterial = value === 'liquid' ? 'liquid' : 'frosted';
        if (doc.body) doc.body.dataset.navMaterial = navMaterial;
        doc.querySelectorAll('.nav-material-switch button[data-nav-material]').forEach(btn => {
            btn.setAttribute('aria-pressed', btn.dataset.navMaterial === navMaterial ? 'true' : 'false');
        });
        if (persist) {
            try { global.localStorage?.setItem(NAV_MATERIAL_KEY, navMaterial); } catch (_) {}
        }
        global.dispatchEvent(new CustomEvent('minkoi:nav-material', { detail: { material: navMaterial } }));
        return navMaterial;
    }

    function initNavMaterial() {
        let saved = 'frosted';
        try {
            const stored = global.localStorage?.getItem(NAV_MATERIAL_KEY);
            if (stored === 'liquid' || stored === 'frosted') saved = stored;
        } catch (_) {}
        applyNavMaterial(saved, false);

        doc.querySelectorAll('.nav-material-switch button[data-nav-material]').forEach(btn => {
            if (btn.dataset.materialBound === '1') return;
            btn.dataset.materialBound = '1';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (btn.dataset.navMaterial === navMaterial) return;
                applyNavMaterial(btn.dataset.navMaterial, true);
                global.MinkoiFeedback?.selection();
            });
        });
    }

    function init() {
        initPressFeedback();
        initTopMorePopup();
        initNavMaterial();
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
        initLiquidGlassNav: initLiquidGlassNav,
        setNavMaterial: applyNavMaterial,
        createMiuixPanelOverlay: createMiuixPanelOverlay,
        getPanelController: getPanelController
    });
})(window);
