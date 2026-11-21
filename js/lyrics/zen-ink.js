/* Sample the known Zen artwork at scene/layout commits, never in the lyric
   clock or banner animation. The sample is a model, not a framebuffer read. */
(() => {
    'use strict';
    const box = document.getElementById('zen-ambient-lyric');
    const dock = document.getElementById('zen-mini-dock');
    const stage = document.getElementById('banner-stage');
    if (!box || !dock || !stage) return;

    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 14;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const mix = (a, b, t) => a.map((n, i) => n + (b[i] - n) * t);
    const lum = a => a.reduce((sum, v, i) => {
        const n = v / 255;
        return sum + [0.2126, 0.7152, 0.0722][i] *
            (n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
    }, 0);
    const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const css = a => `rgb(${a.map(Math.round).join(',')})`;
    const open = () => document.body.classList.contains('zen-mode');
    let src = '', image = null, timer = 0, settleTimer = 0, dockHeight = 0;
    let lastSamples = [], outgoing = [];

    function paint(samples = []) {
        const white = [250, 251, 255], black = [16, 19, 26];
        const accentHex = window.getCurrentPersona?.()?.accent;
        const accent = /^#[a-f0-9]{6}$/i.test(accentHex || '')
            ? [1, 3, 5].map(i => parseInt(accentHex.slice(i, i + 2), 16)) : white;
        // Compare both polarities in the text band, including the outgoing
        // texture while the artwork is crossfading.
        const evaluate = ink => {
            const value = lum(ink);
            const ratios = samples.map(bg => ratio(value, bg)).sort((a, b) => a - b);
            const tail = ratios[Math.floor(ratios.length * .1)] || 1;
            const coverage = ratios.filter(r => r >= 4.5).length / (ratios.length || 1);
            return { tail, coverage, score: coverage + Math.min(tail, 5.2) * .12 };
        };
        const light = evaluate(white).score >= evaluate(black).score;
        const base = light ? white : black;
        const soft = light ? [222, 229, 242] : [34, 42, 56];
        const edge = light ? [12, 15, 21] : [252, 251, 248];
        const quality = evaluate(base);
        const busy = quality.tail < 4.5 || quality.coverage < .87;
        const toned = mix(base, accent, .17);
        const sung = !busy && evaluate(toned).tail >= 4.5 ? toned : mix(base, accent, .065);
        box.style.setProperty('--zen-lyric-primary', css(mix(base, accent, busy ? .015 : .045)));
        box.style.setProperty('--zen-lyric-secondary', css(mix(base, soft, busy ? .22 : .48)));
        box.style.setProperty('--zen-lyric-translation', css(mix(base, soft, busy ? .32 : .64)));
        box.style.setProperty('--zen-lyric-accent', css(sung));
        box.style.setProperty('--zen-lyric-edge', css(edge));
        box.style.setProperty('--zen-edge-width', busy ? '1.9px' : '1.05px');
        box.style.setProperty('--zen-edge-shadow', `rgba(${edge.join(',')},${busy ? .88 : .64})`);
    }

    function sample() {
        timer = 0;
        if (!open() || !ctx || !image?.naturalWidth) return;
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        // Use the occupied text band, with slack for drift. The observer
        // wakes this on reflow, not on every timestamp or animation frame.
        const style = getComputedStyle(box);
        const y = h - (parseFloat(style.bottom) || 130);
        const bandW = Math.min(w, parseFloat(style.width) || w * .9);
        const bandH = Math.min(y, Math.max(38, Math.min(h * .4, box.offsetHeight + 14)));
        if (bandH <= 0) return;
        const x = (w - bandW) / 2;
        const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
        const ox = (w - image.naturalWidth * scale) / 2;
        const oy = (h - image.naturalHeight * scale) * .22;
        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, (x - ox) / scale, (y - bandH - oy) / scale,
                bandW / scale, bandH / scale, 0, 0, canvas.width, canvas.height);
            const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const day = document.body.classList.contains('light-mode');
            const samples = [];
            for (let i = 0; i < pixels.length; i += 4) {
                const px = (x + ((i / 4) % canvas.width + .5) * bandW / canvas.width) / w;
                const py = (y - bandH + (Math.floor(i / 4 / canvas.width) + .5) * bandH / canvas.height) / h;
                const vignette = .08 + .44 * clamp(Math.hypot(px - .5, py - .45), 0, 1);
                const shade = day ? vignette * .75 : 1 - (1 - vignette) * (1 - .45 * clamp((py - .3) / .7, 0, 1));
                samples.push(lum(mix([pixels[i], pixels[i + 1], pixels[i + 2]].map(v => .94 * v),
                    [4, 6, 13], shade)));
            }
            lastSamples = samples;
            paint(outgoing.length ? [...samples, ...outgoing] : samples);
        } catch (_) {
            paint();
        }
    }

    function schedule() {
        if (!open()) return;
        clearTimeout(timer);
        timer = setTimeout(sample, 80);
    }

    function load(next) {
        if (!open()) return;
        if (!next) { src = ''; image = null; paint(); return; }
        if (src === next) { schedule(); return; }
        clearTimeout(settleTimer);
        outgoing = lastSamples;
        src = next;
        image = null;
        const incoming = new Image();
        incoming.decoding = 'async';
        incoming.onload = () => {
            if (src !== next || !open()) return;
            image = incoming;
            schedule();
            if (outgoing.length) {
                settleTimer = setTimeout(() => {
                    outgoing = [];
                    schedule();
                }, 850);
            }
        };
        incoming.onerror = () => { if (src === next && open()) paint(); };
        incoming.src = next;
    }

    function measureDock(height) {
        if (!height || height === dockHeight) return;
        dockHeight = height;
        box.style.setProperty('--zen-dock-height', `${height}px`);
        schedule();
    }
    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(([entry]) => {
            if (open()) measureDock(entry.borderBoxSize?.[0]?.blockSize || dock.offsetHeight);
        }).observe(dock);
        new ResizeObserver(schedule).observe(box);
    }
    window.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('minkoi:themechange', schedule);
    window.addEventListener('minkoi:zen-artwork', e => load(e.detail.src));
    window.addEventListener('minkoi:zenchange', e => {
        if (e.detail.enabled) {
            measureDock(dock.offsetHeight);
            const background = stage.querySelector('.banner-layer.active')?.style.backgroundImage;
            load(background?.match(/^url\(["']?(.*?)["']?\)$/)?.[1]);
        } else {
            clearTimeout(timer);
            clearTimeout(settleTimer);
            src = '';
            image = null;
            lastSamples = [];
            outgoing = [];
        }
    });
})();
