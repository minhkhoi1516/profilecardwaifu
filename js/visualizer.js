/* ==========================================================================
   MINKOI V4 · CHIBI AUDIO VISUALIZER
   One lightweight canvas renderer, four styles, shared AnalyserNode data.
   The chibi keeps its size and pop-out; the frame adapts to the artwork.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    const STORAGE_KEY = 'minkoi_visualizer_style';
    const STYLE_ORDER = ['dual', 'crescent', 'orbit', 'eq'];

    const canvas = doc.getElementById('waifu-visualizer-canvas');
    const zone = doc.getElementById('avatar-zone-wrap');
    const audio = doc.getElementById('audio-player');
    const disc = doc.querySelector('.avatar-backdrop-disc');
    const colLeft = doc.querySelector('.col-left');
    const identity = doc.querySelector('.identity-header');
    const social = doc.querySelector('.social-destination-grid');
    const card = doc.getElementById('main-card');
    const avatarImg = doc.getElementById('char-avatar');
    const vinyl = doc.getElementById('vinyl-disc');
    const aura = doc.querySelector('.avatar-backdrop-disc');
    const vinylGlow = vinyl?.querySelector('.audio-reactive-glow');
    const auraGlow = aura?.querySelector('.audio-reactive-glow');
    const menuBtn = doc.getElementById('viz-menu-btn');
    const menu = doc.getElementById('viz-menu');
    const uiBars = Array.from(doc.querySelectorAll('.live-visualizer-bars .viz-bar'));

    if (!canvas || !zone || !audio) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const motionQuery = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const TAU = Math.PI * 2;

    // ------------------------------------------------------------------
    // STYLE DEFINITIONS
    // Angles use canvas conventions: 0 = right, +PI/2 = down.
    // `t` maps a bar to a logarithmic slice of the spectrum (0 bass, 1 air).
    // ------------------------------------------------------------------
    const STYLES = {
        dual: {
            arcs: [
                { from: -0.98, to: -0.20, t0: 0.28, t1: 1.00, count: 13 },
                { from: 0.06, to: 0.62, t0: 0.00, t1: 0.64, count: 13 }
            ],
            // On phones the identity block sits directly right of the chibi,
            // so the arcs move to the open top and lower-right wedges.
            compactArcs: [
                { from: -0.82, to: -0.18, t0: 0.30, t1: 1.00, count: 11 },
                { from: 0.28, to: 0.62, t0: 0.00, t1: 0.55, count: 9 }
            ],
            width: 2.1,
            maxLen: 15,
            ring: false,
            sparkle: true
        },
        crescent: {
            arcs: [
                { from: 0.07, to: 0.93, t0: 0.0, t1: 1.0, count: 27 }
            ],
            compactArcs: [
                { from: 0.22, to: 0.78, t0: 0.0, t1: 1.0, count: 19 }
            ],
            width: 1.9,
            maxLen: 17,
            ring: 'crescent',
            sparkle: false
        },
        orbit: {
            arcs: [
                { from: -0.15, to: 0.19, t0: 0.05, t1: 0.85, count: 10 }
            ],
            compactArcs: [
                { from: -0.86, to: -0.44, t0: 0.08, t1: 0.88, count: 9 }
            ],
            width: 2.0,
            maxLen: 12,
            ring: 'orbit',
            sparkle: false
        },
        eq: {
            arcs: [
                { from: 0.30, to: 0.70, t0: 0.0, t1: 1.0, count: 7 }
            ],
            compactArcs: [
                { from: 0.33, to: 0.68, t0: 0.0, t1: 1.0, count: 7 }
            ],
            width: 3.1,
            maxLen: 13,
            ring: false,
            sparkle: false
        }
    };

    const mobileQuery = global.matchMedia ? global.matchMedia('(max-width: 860px)') : null;
    const isCompact = () => Boolean(mobileQuery && mobileQuery.matches);

    // ------------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------------
    let ready = false;
    let analyser = null;
    let freqData = new Uint8Array(128);
    let activeStyle = readStyle();

    let geometry = null; // { baseR, reach, size, dpr, cx, cy, bars }
    let levels = new Float32Array(0);
    let palette = { a: '#38bdf8', b: '#818cf8' };
    let gradient = null;

    let rafId = 0;
    let running = false;
    let lastTs = 0;
    let decayStart = 0;
    let decaying = false;
    let phase = 0;
    let drawOpacity = 1;

    let bassS = 0;
    let midS = 0;
    let trebleS = 0;
    let vinylGlowKey = '';
    let vinylScaleKey = '';
    let auraGlowKey = '';
    let auraScaleKey = '';

    function readStyle() {
        try {
            const saved = global.localStorage?.getItem(STORAGE_KEY);
            if (saved && STYLE_ORDER.indexOf(saved) !== -1) return saved;
        } catch (_) { /* private mode */ }
        return 'dual';
    }

    function persistStyle(style) {
        try { global.localStorage?.setItem(STORAGE_KEY, style); } catch (_) { /* private mode */ }
    }

    function clamp(v, min, max) {
        return v < min ? min : (v > max ? max : v);
    }

    function parseColor(input) {
        const value = String(input || '').trim();
        let m = /^#([0-9a-f]{3})$/i.exec(value);
        if (m) {
            return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
        }
        m = /^#([0-9a-f]{6})$/i.exec(value);
        if (m) {
            return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
        }
        m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(value);
        if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
        return null;
    }

    function mixColor(from, to, ratio) {
        const a = parseColor(from);
        const b = parseColor(to);
        if (!a || !b) return from;
        const mix = (i) => Math.round(a[i] + (b[i] - a[i]) * ratio);
        return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
    }

    // ------------------------------------------------------------------
    // PALETTE (persona accent tokens, cached per persona)
    // ------------------------------------------------------------------
    function refreshPalette() {
        const cs = global.getComputedStyle(doc.documentElement);
        const a = (cs.getPropertyValue('--color-accent') || '').trim();
        const b = (cs.getPropertyValue('--color-accent-secondary') || '').trim();
        if (a) palette.a = a;
        if (b) palette.b = b;
        // Cyan accents lose contrast on the ivory card; deepen them for canvas
        // strokes only, keeping the DOM palette untouched.
        if (doc.body.classList.contains('light-mode')) {
            palette.a = mixColor(palette.a, '#0b1020', 0.34);
            palette.b = mixColor(palette.b, '#0b1020', 0.22);
        }
        gradient = null;
    }

    function buildGradient() {
        if (!geometry) return;
        const g = ctx.createLinearGradient(0, geometry.size, geometry.size, 0);
        g.addColorStop(0, palette.b);
        g.addColorStop(0.55, palette.a);
        g.addColorStop(1, palette.b);
        gradient = g;
    }

    // ------------------------------------------------------------------
    // GEOMETRY — derived from real layout bounds, never a fixed ring size
    // ------------------------------------------------------------------
    function rayRectExit(cx, cy, dx, dy, rect) {
        // Distance at which a ray leaves an axis-aligned rectangle (the card walls).
        let tmax = Infinity;
        if (Math.abs(dx) < 1e-6) {
            if (cx < rect.left || cx > rect.right) return Infinity;
        } else {
            const t1 = (rect.left - cx) / dx;
            const t2 = (rect.right - cx) / dx;
            tmax = Math.min(tmax, Math.max(t1, t2));
        }
        if (Math.abs(dy) < 1e-6) {
            if (cy < rect.top || cy > rect.bottom) return Infinity;
        } else {
            const t1 = (rect.top - cy) / dy;
            const t2 = (rect.bottom - cy) / dy;
            tmax = Math.min(tmax, Math.max(t1, t2));
        }
        return tmax;
    }

    function rayRectHit(cx, cy, dx, dy, rect) {
        // Nearest positive distance at which a ray enters a text/control block.
        let tmin = -Infinity;
        let tmax = Infinity;
        if (Math.abs(dx) < 1e-6) {
            if (cx < rect.left || cx > rect.right) return Infinity;
        } else {
            let t1 = (rect.left - cx) / dx;
            let t2 = (rect.right - cx) / dx;
            if (t1 > t2) { const swap = t1; t1 = t2; t2 = swap; }
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
        }
        if (Math.abs(dy) < 1e-6) {
            if (cy < rect.top || cy > rect.bottom) return Infinity;
        } else {
            let t1 = (rect.top - cy) / dy;
            let t2 = (rect.bottom - cy) / dy;
            if (t1 > t2) { const swap = t1; t1 = t2; t2 = swap; }
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
        }
        if (tmax < Math.max(tmin, 0)) return Infinity;
        return tmin > 0 ? tmin : 0;
    }

    function inflate(rect, margin) {
        return {
            left: rect.left - margin,
            top: rect.top - margin,
            right: rect.right + margin,
            bottom: rect.bottom + margin
        };
    }

    function measure() {
        if (!zone || !colLeft || !identity || !social || !card) return;
        const zr = zone.getBoundingClientRect();
        const cardR = card.getBoundingClientRect();
        const ir = identity.getBoundingClientRect();
        const sr = social.getBoundingClientRect();
        const discR = disc ? (disc.offsetWidth || (isCompact() ? 92 : 116)) / 2 : 46;
        const avatarHalfW = avatarImg ? (avatarImg.offsetWidth || 0) / 2 : 0;
        const compact = isCompact();

        const cx = zr.left + zr.width / 2;
        const cy = zr.top + zr.height * 0.52;

        const inset = 8;
        const walls = {
            left: cardR.left + inset,
            right: cardR.right - inset,
            top: cardR.top + inset,
            bottom: cardR.bottom - inset
        };
        // The chibi owns its space; text and social pills are obstacles that
        // bars may pass beside but never through.
        const obstacles = [];
        if (ir.width && ir.height) obstacles.push(inflate({ left: ir.left, top: ir.top, right: ir.right, bottom: ir.bottom }, 8));
        if (sr.width && sr.height) obstacles.push(inflate({ left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom }, 8));

        function limit(angle) {
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            let t = rayRectExit(cx, cy, dx, dy, walls);
            for (let i = 0; i < obstacles.length; i++) {
                t = Math.min(t, rayRectHit(cx, cy, dx, dy, obstacles[i]));
            }
            return Number.isFinite(t) && t > 0 ? t : 0;
        }

        const def = STYLES[activeStyle];
        const arcs = (compact && def.compactArcs) ? def.compactArcs : def.arcs;
        const baseIdeal = Math.max(discR + 4, avatarHalfW + 2);
        const maxLen = compact ? Math.max(9, Math.round(def.maxLen * 0.9)) : def.maxLen;
        const barWidth = compact ? Math.max(1.8, def.width - 0.2) : def.width;

        const bars = [];
        arcs.forEach((arc) => {
            for (let i = 0; i < arc.count; i++) {
                const t = (i + 0.5) / arc.count;
                const angle = (arc.from + (arc.to - arc.from) * t) * Math.PI;
                const spec = arc.t0 + (arc.t1 - arc.t0) * t;
                const bin = frequencyBin(spec);
                bars.push({ angle, bin, t: spec, maxLen });
            }
        });

        let minRay = Infinity;
        for (let i = 0; i < bars.length; i++) {
            const r = limit(bars[i].angle);
            bars[i].room = Math.max(0, r - 3 - baseIdeal);
            minRay = Math.min(minRay, r);
        }
        if (def.ring) {
            for (let i = 0; i < 72; i++) minRay = Math.min(minRay, limit(i * TAU / 72) - 3);
        }

        const baseR = Math.max(16, Math.min(baseIdeal, minRay - 4));
        let reach = baseR;
        for (let i = 0; i < bars.length; i++) {
            const room = Math.max(0, limit(bars[i].angle) - 3 - baseR);
            bars[i].len = Math.min(maxLen, room);
            reach = Math.max(reach, baseR + bars[i].len);
            bars[i].width = barWidth;
            bars[i].dx = Math.cos(bars[i].angle);
            bars[i].dy = Math.sin(bars[i].angle);
            bars[i].x = bars[i].dx * baseR;
            bars[i].y = bars[i].dy * baseR;
        }
        if (activeStyle === 'eq') {
            const baseline = Math.min(baseR + maxLen, limit(Math.PI / 2) - 3);
            const spacing = compact ? 5 : 6;
            for (let i = 0; i < bars.length; i++) {
                bars[i].x = (i - (bars.length - 1) / 2) * spacing;
                bars[i].y = baseline;
                bars[i].dx = 0;
                bars[i].dy = -1;
                bars[i].len = Math.min(maxLen, baseline - baseR + 2);
            }
        }
        if (def.ring) reach = Math.max(reach, baseR + 6);

        const size = Math.max(96, Math.ceil((reach + 8) * 2));
        const dpr = clamp(global.devicePixelRatio || 1, 1, 2);
        const pixels = Math.round(size * dpr);
        if (canvas.width !== pixels || canvas.height !== pixels) {
            canvas.width = pixels;
            canvas.height = pixels;
        }
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        geometry = {
            size,
            dpr,
            cx: size / 2,
            cy: size / 2,
            baseR,
            reach,
            bars,
            arcs,
            walls,
            pageCx: cx,
            pageCy: cy
        };
        levels = new Float32Array(bars.length);
        gradient = null;
        buildGradient();
        ready = true;
    }

    // ------------------------------------------------------------------
    // AUDIO SAMPLING (one read per frame, shared by every style)
    // ------------------------------------------------------------------
    function frequencyBin(t) {
        const fft = analyser ? analyser.fftSize : 256;
        const rate = analyser ? analyser.context.sampleRate : 48000;
        const hz = 80 * Math.pow(12000 / 80, t);
        return clamp(Math.round(hz * fft / rate), 1, fft / 2 - 1);
    }

    function ensureAnalyser() {
        if (analyser && analyser.frequencyBinCount) return analyser;
        const shared = global.__minkoiAnalyser;
        if (shared && shared.frequencyBinCount) {
            analyser = shared;
            if (freqData.length !== analyser.frequencyBinCount) {
                freqData = new Uint8Array(analyser.frequencyBinCount);
            }
            if (geometry) geometry.bars.forEach(bar => { bar.bin = frequencyBin(bar.t); });
        }
        return analyser;
    }

    function sampleAudio(dt) {
        if (!ensureAnalyser()) return false;
        try {
            analyser.getByteFrequencyData(freqData);
        } catch (_) {
            return false;
        }

        const len = freqData.length;
        const load = (from, to) => {
            const end = Math.min(to, len - 1);
            let sum = 0;
            let count = 0;
            for (let i = from; i <= end; i++) { sum += freqData[i]; count++; }
            return count ? sum / (count * 255) : 0;
        };
        const targetBass = load(1, 4);
        const targetMid = load(5, 14);
        const targetTreble = load(15, 40);
        const follow = (cur, next, ms) => cur + (next - cur) * (1 - Math.exp(-dt / ms));

        bassS = follow(bassS, targetBass, 90);
        midS = follow(midS, targetMid, 120);
        trebleS = follow(trebleS, targetTreble, 140);

        const silence = targetBass + targetMid + targetTreble < 0.035;
        const attack = 1 - Math.exp(-dt / 45);
        const release = 1 - Math.exp(-dt / 185);

        for (let i = 0; i < geometry.bars.length; i++) {
            const bar = geometry.bars[i];
            const raw = (freqData[Math.min(bar.bin, len - 1)] || 0) / 255;
            let target = Math.max(0, (raw - 0.055) / 0.945);
            target = Math.pow(target, 0.82);
            // Low end feels softer but carries a touch more body.
            target *= 1 + (1 - bar.t) * 0.10 * bassS;
            if (silence) target *= 0.35;
            target = clamp(target, 0, 1);
            const k = target > levels[i] ? attack : release;
            levels[i] += (target - levels[i]) * k;
        }

        if (uiBars.length) {
            for (let i = 0; i < uiBars.length; i++) {
                const bin = Math.min(i + 1, len - 1);
                const v = (freqData[bin] || 0) / 255;
                uiBars[i].style.setProperty('--bar-scale', Math.max(0.18, Math.min(1, v)).toFixed(3));
            }
        }
        return true;
    }

    // ------------------------------------------------------------------
    // CANVAS DRAW
    // ------------------------------------------------------------------
    function drawBars(glow) {
        const g = geometry;
        // Four opacity buckets batch strokes without allocating paths per bar.
        // Endpoints/trigonometry are cached by measure(), not recomputed here.
        for (let bucket = 0; bucket < 4; bucket++) {
            ctx.beginPath();
            for (let i = 0; i < g.bars.length; i++) {
                const value = levels[i];
                const bar = g.bars[i];
                if (Math.min(3, Math.floor(value * 4)) !== bucket || bar.len * value < 0.6) continue;
                const x = g.cx + bar.x;
                const y = g.cy + bar.y;
                ctx.moveTo(x, y);
                ctx.lineTo(x + bar.dx * bar.len * value, y + bar.dy * bar.len * value);
            }
            if (glow) {
                ctx.globalAlpha = (0.44 + (bucket + 0.5) * 0.13) * 0.16 * drawOpacity;
                ctx.strokeStyle = palette.b;
                ctx.lineWidth = g.bars[0].width + 3.4;
                ctx.stroke();
            }
            ctx.globalAlpha = (0.44 + (bucket + 0.5) * 0.13) * drawOpacity;
            ctx.strokeStyle = gradient || palette.a;
            ctx.lineWidth = g.bars[0].width;
            ctx.stroke();
        }
    }

    function drawArcGuide(def, alpha) {
        const g = geometry;
        ctx.globalAlpha = alpha * drawOpacity;
        ctx.strokeStyle = palette.a;
        ctx.lineWidth = 1;
        const arcs = g.arcs || def.arcs;
        for (let i = 0; i < arcs.length; i++) {
            const arc = arcs[i];
            ctx.beginPath();
            ctx.arc(g.cx, g.cy, g.baseR + 0.5, arc.from * Math.PI, arc.to * Math.PI);
            ctx.stroke();
        }
    }

    function draw() {
        if (!ready) return;
        const g = geometry;
        const def = STYLES[activeStyle];
        const bass = clamp(bassS, 0, 1);
        const treble = clamp(trebleS, 0, 1);

        ctx.clearRect(0, 0, g.size, g.size);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (def.ring === 'crescent') {
            drawArcGuide(def, 0.10 + bass * 0.06);
        } else if (def.ring === 'orbit') {
            ctx.globalAlpha = (0.14 + bass * 0.05) * drawOpacity;
            ctx.strokeStyle = palette.a;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(g.cx, g.cy, g.baseR + 2.5, 0, TAU);
            ctx.stroke();

            for (let i = 0; i < 3; i++) {
                const angle = phase + (i * TAU) / 3;
                const dotR = g.baseR + 2.5;
                ctx.globalAlpha = (0.28 + treble * 0.36) * drawOpacity;
                ctx.fillStyle = i === 0 ? palette.a : palette.b;
                ctx.beginPath();
                ctx.arc(g.cx + Math.cos(angle) * dotR, g.cy + Math.sin(angle) * dotR, 1 + treble * 1.3, 0, TAU);
                ctx.fill();
            }
        }

        drawBars(def.sparkle || def.ring === 'crescent');

        if (def.sparkle) {
            for (let i = 0; i < 2; i++) {
                const angle = (i === 0 ? -0.24 : 0.25) * Math.PI;
                const r = g.baseR + 4;
                ctx.globalAlpha = (0.22 + treble * 0.34) * drawOpacity;
                ctx.fillStyle = i === 0 ? palette.a : palette.b;
                ctx.beginPath();
                ctx.arc(g.cx + Math.cos(angle) * r, g.cy + Math.sin(angle) * r, 0.9 + treble * 1.1, 0, TAU);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;

        if (vinyl) {
            const glowKey = ((0.12 + bass * 0.76 + midS * 0.12) * drawOpacity).toFixed(3);
            const scaleKey = (1 + bass * 0.035).toFixed(3);
            if (vinylGlow && glowKey !== vinylGlowKey) {
                vinylGlow.style.opacity = glowKey;
                vinylGlowKey = glowKey;
            }
            if (scaleKey !== vinylScaleKey) {
                vinyl.style.scale = scaleKey;
                vinylScaleKey = scaleKey;
            }
        }
        if (aura) {
            const glowKey = ((0.12 + bass * 0.88) * drawOpacity).toFixed(3);
            const scaleKey = (1 + bass * 0.04).toFixed(3);
            if (auraGlow && glowKey !== auraGlowKey) {
                auraGlow.style.opacity = glowKey;
                auraGlowKey = glowKey;
            }
            if (scaleKey !== auraScaleKey) {
                aura.style.transform = `translate(-50%, -50%) scale(${scaleKey})`;
                auraScaleKey = scaleKey;
            }
        }
    }

    function resetReactiveStyles() {
        vinylGlowKey = '';
        vinylScaleKey = '';
        auraGlowKey = '';
        auraScaleKey = '';
        if (vinyl) {
            vinyl.classList.remove('audio-reactive');
            vinyl.style.scale = '';
        }
        if (aura) {
            aura.classList.remove('audio-reactive');
            aura.style.transform = '';
        }
        if (vinylGlow) vinylGlow.style.opacity = '';
        if (auraGlow) auraGlow.style.opacity = '';
        for (let i = 0; i < uiBars.length; i++) uiBars[i].style.setProperty('--bar-scale', '0.18');
    }

    function clearCanvas() {
        if (!geometry) return;
        ctx.clearRect(0, 0, geometry.size, geometry.size);
        levels.fill(0);
        bassS = 0;
        midS = 0;
        trebleS = 0;
    }

    // ------------------------------------------------------------------
    // LOOP — one controller for all four styles
    // ------------------------------------------------------------------
    function tick(now) {
        rafId = 0;
        if (!running) return;

        if (doc.hidden || doc.body.classList.contains('zen-mode') || motionQuery?.matches) {
            running = false;
            clearCanvas();
            resetReactiveStyles();
            return;
        }

        const dt = lastTs ? clamp(now - lastTs, 8, 48) : 16.67;
        lastTs = now;

        const playing = !audio.paused && !audio.ended && ensureAnalyser();
        if (playing) {
            decaying = false;
            drawOpacity = 1;
            phase += dt * 0.0001;
            sampleAudio(dt);
        } else {
            if (!decaying) {
                decaying = true;
                decayStart = now;
            }
            const decay = Math.exp(-dt / 150);
            drawOpacity = Math.exp(-(now - decayStart) / 180);
            for (let i = 0; i < levels.length; i++) levels[i] *= decay;
            bassS *= decay;
            midS *= decay;
            trebleS *= decay;
            if (now - decayStart > 620) {
                running = false;
                clearCanvas();
                resetReactiveStyles();
                return;
            }
        }

        draw();
        rafId = global.requestAnimationFrame(tick);
    }

    function start() {
        if (doc.hidden || doc.body.classList.contains('zen-mode')) return;
        if (motionQuery && motionQuery.matches) {
            stop();
            clearCanvas();
            resetReactiveStyles();
            return;
        }
        if (!ensureAnalyser()) return;
        if (running) return;
        // The card can move while hidden (Zen, font loads, viewport changes).
        // Read layout only on restart, never in the render loop.
        measure();
        if (!geometry) return;
        running = true;
        vinyl?.classList.add('audio-reactive');
        aura?.classList.add('audio-reactive');
        lastTs = 0;
        decaying = false;
        rafId = global.requestAnimationFrame(tick);
    }

    function stop() {
        if (rafId) global.cancelAnimationFrame(rafId);
        rafId = 0;
        running = false;
        decaying = false;
        lastTs = 0;
        clearCanvas();
        resetReactiveStyles();
    }

    // ------------------------------------------------------------------
    // AUDIO LIFECYCLE
    // ------------------------------------------------------------------
    audio.addEventListener('play', () => {
        start();
    });
    audio.addEventListener('pause', () => {
        if (running) {
            decaying = true;
            decayStart = global.performance.now();
        }
    });
    audio.addEventListener('ended', () => {
        if (running) {
            decaying = true;
            decayStart = global.performance.now();
        }
    });

    global.addEventListener('minkoi:zenchange', () => {
        if (doc.body.classList.contains('zen-mode')) {
            stop();
            clearCanvas();
            resetReactiveStyles();
        } else if (!audio.paused) {
            start();
        }
    });

    doc.addEventListener('visibilitychange', () => {
        if (doc.hidden) {
            stop();
        } else if (!audio.paused) {
            start();
        }
    });

    // ------------------------------------------------------------------
    // STYLE SWITCHING
    // ------------------------------------------------------------------
    function syncMenuSelection() {
        if (!menu) return;
        menu.querySelectorAll('.viz-menu-item').forEach((item) => {
            const checked = item.dataset.vizStyle === activeStyle;
            item.setAttribute('aria-checked', checked ? 'true' : 'false');
        });
    }

    function setStyle(style, options) {
        if (!STYLES[style]) return;
        const changed = style !== activeStyle;
        activeStyle = style;
        if (options?.persist !== false) persistStyle(style);
        syncMenuSelection();
        if (!changed) return;

        // Geometry depends on the style's angular coverage; rebuild without
        // touching the audio graph, playback position or the chibi.
        measure();
        clearCanvas();
        if (!audio.paused) start();
        global.dispatchEvent(new CustomEvent('minkoi:vizstyle', { detail: { style } }));
    }

    // ------------------------------------------------------------------
    // GEOMETRY REFRESH
    // ------------------------------------------------------------------
    let resizeTimer = 0;
    function scheduleMeasure() {
        if (resizeTimer) return;
        resizeTimer = global.setTimeout(() => {
            resizeTimer = 0;
            if (doc.hidden || doc.body.classList.contains('zen-mode')) return;
            const wasRunning = running;
            measure();
            clearCanvas();
            if (wasRunning && !audio.paused) start();
        }, 120);
    }

    global.addEventListener('resize', scheduleMeasure, { passive: true });
    global.visualViewport?.addEventListener('resize', scheduleMeasure, { passive: true });
    global.addEventListener('minkoi:persona', () => {
        refreshPalette();
        // Persona artwork has its own optical size (Sakura Miku is taller and
        // wider), so the frame must re-measure after the swap.
        scheduleMeasure();
    });
    global.addEventListener('minkoi:themechange', () => {
        refreshPalette();
        buildGradient();
    });
    global.addEventListener('load', scheduleMeasure, { passive: true });
    avatarImg?.addEventListener('load', scheduleMeasure);
    if (global.ResizeObserver) {
        const observer = new global.ResizeObserver(scheduleMeasure);
        [zone, avatarImg, identity, social, colLeft].filter(Boolean).forEach(el => observer.observe(el));
    }
    if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(scheduleMeasure).catch(() => {});
    }
    if (mobileQuery?.addEventListener) mobileQuery.addEventListener('change', scheduleMeasure);
    if (motionQuery?.addEventListener) {
        motionQuery.addEventListener('change', () => {
            if (motionQuery.matches) {
                stop();
                clearCanvas();
                resetReactiveStyles();
            } else if (!audio.paused) {
                start();
            }
        });
    }

    // ==================================================================
    // MIUIX STYLE MENU
    // ==================================================================
    let menuState = 'closed'; // closed | opening | open | closing
    let menuGen = 0;
    let releaseTrap = null;
    let originX = 50;
    let originY = 0;

    const springLib = global.MinkoiSpring;
    const fractionSpring = springLib ? springLib.createSpring({
        initial: 0,
        target: 0,
        preset: springLib.PRESETS.LIST_POPUP,
        precision: 0.002,
        velocityPrecision: 0.03,
        onUpdate: applyFraction
    }) : null;

    function applyFraction(raw) {
        if (!menu) return;
        const f = clamp(raw, 0, 1.04);
        const scale = 0.86 + 0.14 * f;
        const alpha = clamp(f * 1.45, 0, 1);
        menu.style.transformOrigin = originX + 'px ' + originY + 'px';
        menu.style.transform = 'translateY(' + ((1 - f) * 6).toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')';
        menu.style.opacity = alpha.toFixed(3);
    }

    function setMenuState(next) {
        menuState = next;
        if (!menu || !menuBtn) return;
        menu.dataset.popupState = next;
        const expanded = next === 'opening' || next === 'open';
        menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        menu.inert = !expanded;
        if (!expanded) menu.setAttribute('aria-hidden', 'true');
        else menu.removeAttribute('aria-hidden');
    }

    function positionMenu() {
        if (!menu || !menuBtn) return;
        const r = menuBtn.getBoundingClientRect();
        const vw = global.innerWidth || doc.documentElement.clientWidth;
        const vh = global.innerHeight || doc.documentElement.clientHeight;
        const margin = 8;
        const width = Math.min(276, vw - margin * 2);
        menu.style.width = width + 'px';
        menu.style.maxHeight = (vh - margin * 2) + 'px';

        const mh = menu.offsetHeight || 240;
        let left = r.right - width;
        left = Math.max(margin, Math.min(vw - width - margin, left));
        let top = r.bottom + 8;
        let originBottom = false;
        if (top + mh > vh - margin && r.top - 8 - mh > margin) {
            top = r.top - 8 - mh;
            originBottom = true;
        }
        top = Math.max(margin, Math.min(vh - mh - margin, top));
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';

        const centerX = r.left + r.width / 2;
        originX = clamp(centerX - left, 14, width - 14);
        originY = originBottom ? mh : 0;
        if (fractionSpring) applyFraction(fractionSpring.value);
    }

    function releaseCurrentTrap(restoreFocus) {
        if (!releaseTrap) return;
        const fn = releaseTrap;
        releaseTrap = null;
        fn({ restoreFocus: restoreFocus !== false });
    }

    function openMenu() {
        if (!menu || !menuBtn || menuState === 'opening' || menuState === 'open') return;
        // Re-opening while the exit spring is still running keeps its current
        // fraction, so the popup reverses instead of snapping to zero.
        const interrupted = menuState === 'closing';
        global.MinkoiUI?.closeAllOverlays?.('viz-menu', { restoreFocus: false });
        menuGen++;
        if (fractionSpring) fractionSpring.onComplete = null;
        setMenuState('opening');
        menu.style.visibility = 'visible';
        menu.style.pointerEvents = 'auto';
        positionMenu();
        if (!interrupted) applyFraction(0);
        if (global.MinkoiUI?.pushFocusTrap) {
            releaseCurrentTrap(false);
            releaseTrap = global.MinkoiUI.pushFocusTrap(menu, menuBtn, { initialFocus: true });
        }
        if (fractionSpring) {
            const gen = menuGen;
            fractionSpring.setTarget(1, {
                onComplete: () => {
                    if (gen !== menuGen || menuState !== 'opening') return;
                    setMenuState('open');
                    applyFraction(1);
                }
            });
        } else {
            applyFraction(1);
            setMenuState('open');
        }
    }

    function closeMenu(options) {
        const opts = options || {};
        if (!menu || menuState === 'closing' || menuState === 'closed') return;
        menuGen++;
        if (fractionSpring) fractionSpring.onComplete = null;
        setMenuState('closing');
        menu.style.pointerEvents = 'none';
        releaseCurrentTrap(opts.restoreFocus !== false);

        const finish = () => {
            if (menuState !== 'closing') return;
            setMenuState('closed');
            menu.style.visibility = 'hidden';
            menu.style.pointerEvents = 'none';
        };

        if (opts.instant) {
            if (fractionSpring) fractionSpring.snap(0);
            applyFraction(0);
            finish();
        } else if (fractionSpring) {
            const gen = menuGen;
            fractionSpring.setTarget(0, {
                onComplete: () => {
                    if (gen !== menuGen) return;
                    finish();
                }
            });
        } else {
            applyFraction(0);
            finish();
        }
    }

    function onMenuButtonClick(e) {
        e.preventDefault();
        if (menuState === 'opening' || menuState === 'open') closeMenu({ restoreFocus: true });
        else openMenu();
    }

    if (menuBtn && menu) {
        // Escape the card's overflow clipping and stacking context.
        if (menu.parentElement !== doc.body) doc.body.appendChild(menu);
        setMenuState('closed');
        syncMenuSelection();

        menuBtn.addEventListener('click', onMenuButtonClick);

        menu.querySelectorAll('.viz-menu-item').forEach((item) => {
            item.addEventListener('click', (event) => {
                setStyle(item.dataset.vizStyle, { persist: true });
                if (global.MinkoiFeedback) global.MinkoiFeedback.commit(item, event);
                closeMenu({ restoreFocus: true });
            });
        });

        doc.addEventListener('click', (e) => {
            if (menuState !== 'opening' && menuState !== 'open') return;
            if (menu.contains(e.target) || menuBtn.contains(e.target)) return;
            closeMenu({ restoreFocus: false });
        });

        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (menuState === 'opening' || menuState === 'open')) {
                e.preventDefault();
                closeMenu({ restoreFocus: true });
            }
        });

        menu.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            const items = Array.from(menu.querySelectorAll('.viz-menu-item'));
            if (!items.length) return;
            e.preventDefault();
            const current = items.indexOf(doc.activeElement);
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            items[(current + delta + items.length) % items.length].focus();
        });

        global.MinkoiUI?.registerOverlay?.('viz-menu', {
            isOpen: () => menuState === 'opening' || menuState === 'open',
            close: closeMenu
        });

        global.addEventListener('resize', () => {
            if (menuState === 'opening' || menuState === 'open') positionMenu();
        }, { passive: true });
        doc.addEventListener('scroll', e => {
            if (!menu.contains(e.target)) closeMenu({ restoreFocus: false });
        }, { passive: true, capture: true });
        global.addEventListener('minkoi:zenchange', () => {
            if (doc.body.classList.contains('zen-mode')) closeMenu({ restoreFocus: false });
        });
    }

    // ------------------------------------------------------------------
    // BOOT
    // ------------------------------------------------------------------
    refreshPalette();
    measure();
    syncMenuSelection();

    function barBounds() {
        if (!geometry) return null;
        const g = geometry;
        const zr = zone.getBoundingClientRect();
        const cx = zr.left + zr.width / 2;
        const cy = zr.top + zr.height * 0.52;
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        for (let i = 0; i < g.bars.length; i++) {
            const b = g.bars[i];
            const x = cx + b.x;
            const y = cy + b.y;
            const ex = x + b.dx * b.len;
            const ey = y + b.dy * b.len;
            left = Math.min(left, Math.min(x, ex) - b.width / 2);
            right = Math.max(right, Math.max(x, ex) + b.width / 2);
            top = Math.min(top, Math.min(y, ey) - b.width / 2);
            bottom = Math.max(bottom, Math.max(y, ey) + b.width / 2);
        }
        return {
            left: Math.round(left * 10) / 10,
            right: Math.round(right * 10) / 10,
            top: Math.round(top * 10) / 10,
            bottom: Math.round(bottom * 10) / 10
        };
    }

    global.MinkoiVisualizer = Object.freeze({
        start,
        stop,
        setStyle,
        getStyle: () => activeStyle,
        getMetrics: () => ({
            style: activeStyle,
            canvasSize: geometry ? geometry.size : 0,
            bars: geometry ? geometry.bars.length : 0,
            baseRadius: geometry ? Math.round(geometry.baseR * 10) / 10 : 0,
            reach: geometry ? Math.round(geometry.reach * 10) / 10 : 0,
            running,
            compact: isCompact(),
            bounds: barBounds()
        })
    });

    // If playback somehow started before this module booted.
    if (!audio.paused) start();
})(window);
