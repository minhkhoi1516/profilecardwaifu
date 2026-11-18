/* MINKOI V4 REFINED · LIVE SOUNDSTAGE CONTROLS
   One interruptible Miuix fraction spring drives popover, sheet and dragging. */
(function (global) {
    'use strict';
    const doc = global.document;
    const menu = doc.getElementById('viz-menu');
    const trigger = doc.getElementById('viz-menu-btn');
    const closeButton = doc.getElementById('viz-menu-close');
    const scrim = doc.getElementById('viz-scrim');
    const stage = doc.getElementById('avatar-zone-wrap');
    const identity = doc.querySelector('.identity-header');
    const visualizer = global.MinkoiVisualizer;
    const springAPI = global.MinkoiSpring;
    if (!menu || !trigger || !scrim || !visualizer || !springAPI) return;
    const items = Array.from(menu.querySelectorAll('[data-viz-style]'));
    const inputs = Array.from(menu.querySelectorAll('[data-viz-control]'));
    const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
    let state = 'closed';
    let generation = 0;
    let releaseTrap = null;
    let ownsScrollLock = false;
    let sheet = false;
    let height = 300;
    let originX = 0;
    let originY = 0;
    let dragging = false;
    let dragStart = 0;
    let dragBase = 1;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;
    let pointer = null;
    const spring = springAPI.createSpring({
        initial: 0, target: 0, preset: springAPI.PRESETS.LIST_POPUP,
        precision: 0.002, velocityPrecision: 0.03, onUpdate: render
    });

    function render(value) {
        const f = clamp(value, -0.15, 1.04);
        menu.style.transformOrigin = `${originX}px ${originY}px`;
        menu.style.transform = sheet
            ? `translateY(${((1 - f) * (height + 16)).toFixed(2)}px)`
            : `translateY(${((1 - f) * 7).toFixed(2)}px) scale(${(0.9 + f * 0.1).toFixed(4)})`;
        menu.style.opacity = clamp(f * 1.5, 0, 1).toFixed(3);
        scrim.style.opacity = clamp(f, 0, 1).toFixed(3);
    }
    function setState(next) {
        state = next;
        menu.dataset.popupState = next;
        const expanded = next === 'opening' || next === 'open';
        trigger.setAttribute('aria-expanded', String(expanded));
        menu.inert = !expanded;
        if (expanded) menu.removeAttribute('aria-hidden');
        else menu.setAttribute('aria-hidden', 'true');
    }
    function position() {
        const vw = doc.documentElement.clientWidth;
        const vh = global.visualViewport?.height || global.innerHeight;
        const sr = stage.getBoundingClientRect();
        const ir = identity.getBoundingClientRect();
        const tr = trigger.getBoundingClientRect();
        sheet = vw <= 860 && vh >= 560;
        menu.dataset.mode = sheet ? 'sheet' : 'popover';
        menu.setAttribute('aria-modal', String(sheet));
        menu.dataset.compact = String(vh < 740);
        const width = Math.min(sheet ? 420 : 344, vw - 16);
        menu.style.width = width + 'px';
        menu.style.maxHeight = (vh - 16) + 'px';
        height = menu.offsetHeight;
        let left, top;
        if (sheet) {
            left = (vw - width) / 2;
            top = vh - height - 8;
            // Compact mode keeps the actual artwork, not merely its container,
            // clear of the sheet. No full-screen preview-obscuring blur.
            const avatarBottom = doc.getElementById('char-avatar').getBoundingClientRect().bottom;
            if (top < avatarBottom + 10 && vh < 700) {
                const available = Math.max(160, vh - avatarBottom - 18);
                menu.style.maxHeight = available + 'px';
                height = menu.offsetHeight;
                top = vh - height - 8;
            }
            originX = width / 2;
            originY = height;
        } else {
            left = sr.right + 12;
            if (left + width > vw - 8) left = sr.left - width - 12;
            if (left < 8) left = clamp(tr.right - width, 8, vw - width - 8);
            top = Math.max(8, sr.top);
            if (left < ir.right && left + width > ir.left && ir.top < vh) top = Math.max(top, ir.bottom + 10);
            top = clamp(top, 8, Math.max(8, vh - 130));
            menu.style.maxHeight = Math.max(120, vh - top - 8) + 'px';
            height = menu.offsetHeight;
            originX = clamp(tr.left + tr.width / 2 - left, 12, width - 12);
            originY = clamp(tr.top - top, 0, height);
        }
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        render(spring.value);
    }
    function sync() {
        const style = visualizer.getStyle();
        items.forEach(item => {
            const selected = item.dataset.vizStyle === style;
            item.setAttribute('aria-checked', String(selected));
            item.tabIndex = selected ? 0 : -1;
        });
        const controls = visualizer.getControls();
        inputs.forEach(input => {
            const value = Math.round(controls[input.dataset.vizControl] * 100);
            input.value = String(value);
            doc.getElementById(input.id + '-value').textContent = value + '%';
        });
    }
    function releaseFocus(restore) {
        if (!releaseTrap) return;
        releaseTrap({ restoreFocus: restore });
        releaseTrap = null;
    }
    function unlock() {
        if (!ownsScrollLock) return;
        ownsScrollLock = false;
        global.MinkoiUI?.unlockBodyScroll();
    }
    function open() {
        if (state === 'open' || state === 'opening') return;
        const interrupted = state === 'closing';
        const gen = ++generation;
        dragging = false;
        spring.onComplete = null;
        global.MinkoiUI?.closeAllOverlays('viz-menu', { restoreFocus: false });
        setState('opening');
        if (!interrupted) menu.scrollTop = 0;
        sync();
        menu.style.visibility = 'visible';
        menu.style.pointerEvents = 'auto';
        scrim.classList.add('active');
        position();
        if (sheet && !ownsScrollLock) {
            global.MinkoiUI?.lockBodyScroll();
            ownsScrollLock = true;
            position();
        }
        releaseFocus(false);
        releaseTrap = global.MinkoiUI?.pushFocusTrap(menu, trigger, { initialFocus: false });
        items.find(item => item.getAttribute('aria-checked') === 'true')?.focus({ preventScroll: true });
        if (!interrupted) spring.snap(0);
        spring.setTarget(1, {
            ...springAPI.PRESETS[sheet ? 'BOTTOM_SHEET_OPEN' : 'LIST_POPUP'],
            onComplete: () => { if (gen === generation && state === 'opening') setState('open'); }
        });
    }
    function close(options) {
        if (state === 'closed' || state === 'closing') return;
        const opts = options || {};
        const gen = ++generation;
        dragging = false;
        releaseFocus(opts.restoreFocus !== false);
        setState('closing');
        menu.style.pointerEvents = 'none';
        scrim.classList.remove('active');
        const finish = () => {
            if (gen !== generation) return;
            setState('closed');
            menu.style.visibility = 'hidden';
            scrim.classList.remove('active');
            scrim.style.opacity = '0';
            unlock();
        };
        if (opts.instant) { spring.snap(0); finish(); }
        else spring.setTarget(0, {
            ...springAPI.PRESETS[sheet ? 'BOTTOM_SHEET_SETTLE' : 'LIST_POPUP'], onComplete: finish
        });
    }

    trigger.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation(); // The art stage keeps its persona-switch click.
        if (state === 'open' || state === 'opening') close(); else open();
    });
    trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.code === 'Space') event.stopPropagation();
        if (event.key === 'ArrowDown') { event.preventDefault(); event.stopPropagation(); open(); }
    });
    closeButton.addEventListener('click', () => close());
    scrim.addEventListener('click', () => close({ restoreFocus: false }));
    items.forEach(item => item.addEventListener('click', () => visualizer.setStyle(item.dataset.vizStyle)));
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = Number(input.value);
            visualizer.setControl(input.dataset.vizControl, value / 100, { persist: false });
            doc.getElementById(input.id + '-value').textContent = value + '%';
        });
        input.addEventListener('change', () => visualizer.setControl(input.dataset.vizControl, Number(input.value) / 100));
    });
    menu.addEventListener('keydown', event => {
        // A radio arrow/Space must never reach the player's global seek/play
        // shortcuts. Native range and button keyboard behavior stays intact.
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); close(); return; }
        const current = items.indexOf(doc.activeElement);
        if (current < 0) return;
        let next = current;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % items.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + items.length - 1) % items.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault();
        visualizer.setStyle(items[next].dataset.vizStyle);
        items[next].focus({ preventScroll: true });
    });
    menu.addEventListener('focusin', event => {
        // Short landscape popovers scroll internally. Focus-trap wrapping must
        // reveal the focused control, never scroll the profile behind it.
        if (!menu.contains(event.target)) return;
        const panel = menu.getBoundingClientRect();
        const focused = event.target.getBoundingClientRect();
        const scale = panel.width / Math.max(1, menu.offsetWidth);
        if (focused.top < panel.top + 8) menu.scrollTop -= (panel.top + 8 - focused.top) / scale;
        else if (focused.bottom > panel.bottom - 8) menu.scrollTop += (focused.bottom - panel.bottom + 8) / scale;
    });
    doc.addEventListener('keydown', event => {
        if (event.key === 'Escape' && (state === 'open' || state === 'opening')) {
            event.preventDefault(); close();
        }
    });
    doc.addEventListener('click', event => {
        if (!menu.contains(event.target) && !trigger.contains(event.target) && event.target !== scrim) close({ restoreFocus: false });
    });

    const handle = menu.querySelector('.viz-drag-handle');
    handle.addEventListener('pointerdown', event => {
        if (!sheet || (state !== 'open' && state !== 'opening') || !event.isPrimary) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        generation++;
        spring.onComplete = null;
        dragging = true; pointer = event.pointerId;
        dragStart = lastY = event.clientY;
        dragBase = spring.value;
        velocity = 0; lastTime = performance.now();
        spring.snap(spring.value);
        handle.setPointerCapture(pointer);
        event.preventDefault();
    });
    handle.addEventListener('pointermove', event => {
        if (!dragging || event.pointerId !== pointer) return;
        const now = performance.now();
        velocity = velocity * 0.4 + (event.clientY - lastY) / Math.max(8, now - lastTime) * 600;
        lastY = event.clientY; lastTime = now;
        const dy = event.clientY - dragStart;
        spring.snap(clamp(dragBase - (dy >= 0 ? dy : dy * 0.2) / (height + 16), -0.1, 1.04));
    });
    function releaseDrag(event) {
        if (!dragging || event.pointerId !== pointer) return;
        dragging = false; pointer = null;
        if (event.type !== 'pointercancel' && (spring.value < 0.75 || (velocity > 550 && event.clientY - dragStart > 20))) {
            spring.impulse(-Math.min(1600, velocity) / (height + 16));
            close();
        } else {
            const gen = ++generation;
            setState('opening');
            spring.setTarget(1, { ...springAPI.PRESETS.BOTTOM_SHEET_SETTLE,
                onComplete: () => { if (gen === generation) setState('open'); } });
        }
    }
    handle.addEventListener('pointerup', releaseDrag);
    handle.addEventListener('pointercancel', releaseDrag);
    global.addEventListener('minkoi:vizstyle', sync);
    global.addEventListener('minkoi:zenchange', () => { if (doc.body.classList.contains('zen-mode')) close({ instant: true, restoreFocus: false }); });
    global.addEventListener('resize', () => { if (state !== 'closed') position(); }, { passive: true });
    global.visualViewport?.addEventListener('resize', () => { if (state !== 'closed') position(); }, { passive: true });
    doc.addEventListener('scroll', event => {
        if (!sheet && state !== 'closed' && !menu.contains(event.target)) close({ restoreFocus: false });
    }, { passive: true, capture: true });
    global.MinkoiUI?.registerOverlay('viz-menu', { isOpen: () => state === 'open' || state === 'opening', close });
    setState('closed');
    sync();
})(window);
