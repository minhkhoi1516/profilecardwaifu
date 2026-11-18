/* MINKOI V4 REFINED · ORGANIC SOUNDSTAGE
   Pipeline: shared analyser -> features -> analytic physics -> cached geometry
   -> one canvas. Artwork lives in its original, unclipped coordinate system. */
(function (global) {
    'use strict';
    const doc = global.document;
    const stage = doc.getElementById('avatar-zone-wrap');
    const art = stage?.querySelector('.avatar-art-stage');
    const avatar = doc.getElementById('char-avatar');
    const canvas = doc.getElementById('waifu-visualizer-canvas');
    const audio = doc.getElementById('audio-player');
    const featuresAPI = global.MinkoiAudioFeatures;
    if (!stage || !art || !canvas || !audio || !featuresAPI) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const TAU = Math.PI * 2;
    const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
    const names = { crown: 'Aurora Crown', halo: 'Spectral Halo', manga: 'Manga Soundwave', kinetic: 'Kinetic Orbit' };
    const styles = Object.keys(names);
    const legacy = { dual: 'crown', crescent: 'halo', eq: 'manga', orbit: 'kinetic' };
    const reduced = global.matchMedia('(prefers-reduced-motion: reduce)');
    const engine = featuresAPI.create();
    const positions = new Float32Array(48);
    const velocities = new Float32Array(48);
    const targets = new Float32Array(48);
    const crownPositions = new Float32Array(44);
    const crownVelocities = new Float32Array(44);
    const crownTargets = new Float32Array(44);
    const crownLines = new Float32Array(44 * 4);
    const crownValues = new Float32Array(44);
    const haloLines = new Float32Array(64 * 4);
    const haloValues = new Float32Array(64);
    const clusterLines = new Float32Array(7 * 4);
    const mangaPositions = new Float32Array(16);
    const mangaVelocities = new Float32Array(16);
    const mangaTargets = new Float32Array(16);
    let waveGain = 1;
    let waveDisplayGain = 1;
    const peaks = new Float32Array(48);
    const peakHold = new Float32Array(48);
    const macro = new Float32Array(3);
    const macroVelocity = new Float32Array(3);
    const macroTarget = new Float32Array(3);
    const weights = new Float32Array(4);
    const orbitOffsets = new Float32Array([0, 2.35, 4.75]);
    const haloRanges = [[5, 27], [16, 37], [5, 24], [20, 43]];
    const barsUI = Array.from(doc.querySelectorAll('.live-visualizer-bars .viz-bar'));
    const barValues = new Float32Array(barsUI.length).fill(-1);
    const vinyl = doc.getElementById('vinyl-disc');
    const pedestal = stage.querySelector('.avatar-backdrop-disc');
    const vinylGlow = vinyl?.querySelector('.audio-reactive-glow');
    const pedestalGlow = pedestal?.querySelector('.audio-reactive-glow');
    const caption = doc.getElementById('soundstage-caption');
    let style = readStyle();
    let intensity = readNumber('minkoi_visualizer_intensity', 1, 0.55, 1.4);
    let visualIntensity = intensity;
    let reactivity = readNumber('minkoi_visualizer_reactivity', 1, 0.45, 1.45);
    weights[styles.indexOf(style)] = 1;
    let geometry = null;
    let geometryKey = '';
    let radius = 80;
    let palette = ['#38bdf8', '#818cf8'];
    let highlight = '#7dd3fc';
    let gradient = null;
    let gradientClock = 0;
    let gradientStep = -1;
    let raf = 0;
    let running = false;
    let last = 0;
    let settlingSince = 0;
    let state = 'stopped';
    let seeking = false;
    let context = null;
    let onsetCount = 0;
    let orbitPhase = 0;
    let orbitVelocity = 0;
    let sceneOpacity = 0;
    let motionEnergy = 0;
    let longestBar = 0;
    let damping = 0.85;
    let resizeTimer = 0;
    let idlePainted = false;
    const bounds = { left: 0, right: 0, top: 0, bottom: 0 };
    const domCache = { vinylScale: '', discScale: '', vinylGlow: '', discGlow: '' };

    function read(key) { try { return global.localStorage.getItem(key); } catch (_) { return null; } }
    function save(key, value) { try { global.localStorage.setItem(key, String(value)); } catch (_) {} }
    function readStyle() {
        const saved = read('minkoi_visualizer_style');
        return names[saved] ? saved : (legacy[saved] || 'crown');
    }
    function readNumber(key, fallback, min, max) {
        const raw = read(key);
        return raw !== null && Number.isFinite(Number(raw)) ? clamp(Number(raw), min, max) : fallback;
    }
    function colorParts(value) {
        const hex = /^#([0-9a-f]{6})$/i.exec(value);
        if (hex) {
            const n = parseInt(hex[1], 16);
            return [n >> 16, n >> 8 & 255, n & 255];
        }
        const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(value);
        return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
    }
    function mixColor(value, amount, target) {
        const parts = colorParts(value);
        if (!parts) return value;
        const [tr, tg, tb] = target || [255, 255, 255];
        return `rgb(${Math.round(parts[0] + (tr - parts[0]) * amount)}, ${Math.round(parts[1] + (tg - parts[1]) * amount)}, ${Math.round(parts[2] + (tb - parts[2]) * amount)})`;
    }
    function themeColor(value, darken) {
        // Light mode needs contrast against paper; dark mode should keep the
        // character accent vivid rather than blending it into the backdrop.
        return darken ? mixColor(value, 0.3, [11, 16, 32]) : value;
    }
    function refreshPalette(event) {
        const cs = global.getComputedStyle(doc.documentElement);
        const light = doc.body.classList.contains('light-mode');
        // Registered color properties can still be transitioning when the
        // persona event fires. Cache the committed theme target, not its old
        // interpolated computed RGB value.
        const persona = event?.detail?.persona || global.getCurrentPersona?.();
        palette = [themeColor(persona?.accent || cs.getPropertyValue('--color-accent').trim() || '#38bdf8', light),
            themeColor(persona?.accentSecondary || cs.getPropertyValue('--color-accent-secondary').trim() || '#818cf8', light)];
        highlight = mixColor(palette[0], light ? 0.32 : 0.46);
        buildGradient(gradientClock);
    }
    // The gradient itself travels as music advances, so the same bars keep
    // shifting between the character accent and its lighter secondary tone.
    function buildGradient(phase) {
        if (!geometry) return;
        if (typeof phase === 'number') gradientClock = phase;
        gradientStep = Math.floor(gradientClock * 24);
        const mid = 0.5 + Math.sin(gradientClock * TAU) * 0.24;
        const g = ctx.createLinearGradient(geometry.cx - 125, 0, geometry.cx + 125, geometry.h * 0.92);
        g.addColorStop(0, highlight);
        g.addColorStop(clamp(mid - 0.18, 0, 0.72), palette[1]);
        g.addColorStop(clamp(mid, 0.18, 0.82), palette[0]);
        g.addColorStop(clamp(mid + 0.2, 0.3, 0.96), palette[1]);
        g.addColorStop(1, highlight);
        gradient = g;
    }

    // Layout reads occur only here, never in the rendering loop. No global
    // minimum ray: the stage reserves space, each segment gets its own reach.
    function rayRoom(dx, dy, cx, cy, w, h) {
        let room = Infinity;
        if (dx > 0.0001) room = Math.min(room, (w - 7 - cx) / dx);
        if (dx < -0.0001) room = Math.min(room, (7 - cx) / dx);
        if (dy > 0.0001) room = Math.min(room, (h - 34 - cy) / dy);
        if (dy < -0.0001) room = Math.min(room, (7 - cy) / dy);
        return room;
    }
    function radial(angle, band, delay, g) {
        const dx = Math.cos(angle), dy = Math.sin(angle);
        return { dx, dy, angle, band, delay, reach: rayRoom(dx, dy, g.cx, g.cy, g.w, g.h) - 3 };
    }
    function measure() {
        const w = stage.offsetWidth, h = stage.offsetHeight;
        const dpr = Math.min(global.devicePixelRatio || 1, 2);
        const key = [w, h, avatar.offsetWidth, avatar.offsetHeight, dpr].join('/');
        if (key === geometryKey) return;
        geometryKey = key;
        const g = { w, h, cx: art.offsetLeft + art.offsetWidth / 2,
            cy: art.offsetTop + art.offsetHeight * 0.52,
            radius: Math.max(78, avatar.offsetWidth / 2 + 10),
            extension: global.innerWidth <= 860 ? 36 : 44, crown: [], halo: [], crownGuide: null,
            waveX: new Float32Array(16), waveY: new Float32Array(16), echoY: new Float32Array(16),
            orbitRoom: new Float32Array(256) };
        const segments = [[0.91, 1.22, 14], [1.30, 1.70, 16], [1.78, 2.09, 14]];
        let index = 0;
        segments.forEach(segment => {
            for (let i = 0; i < segment[2]; i++) {
                const angle = (segment[0] + (segment[1] - segment[0]) * (i + 0.5) / segment[2]) * Math.PI;
                const distance = Math.abs(index - 21.5) / 21.5;
                // Crown shoulders carry bass; the high arch follows the
                // expressive mid/presence range, not nearly-silent 14 kHz bins.
                const band = Math.round((1 - distance) * 29) + 5;
                const bar = radial(angle, band, (index / 43) * 0.045, g);
                bar.tip = Math.abs((i + 0.5) / segment[2] - 0.5) * 2;
                g.crown.push(bar);
                index++;
            }
        });
        for (let i = 0; i < 64; i++) {
            const range = haloRanges[Math.floor(i / 16)];
            const band = Math.round(range[0] + (range[1] - range[0]) * (i % 16) / 15);
            g.halo.push(radial(-Math.PI / 2 + i / 64 * TAU, band, 0, g));
        }
        const waveWidth = Math.min(244, w - 24);
        for (let i = 0; i < 16; i++) g.waveX[i] = g.cx - waveWidth / 2 + i / 15 * waveWidth;
        for (let i = 0; i < g.orbitRoom.length; i++) {
            const angle = i / g.orbitRoom.length * TAU;
            g.orbitRoom[i] = rayRoom(Math.cos(angle), Math.sin(angle), g.cx, g.cy, w, h) - 4;
        }
        // Keep independent subpaths rather than connecting the gaps.
        g.crownGuide = new Path2D();
        segments.forEach(segment => {
            g.crownGuide.moveTo(g.cx + Math.cos(segment[0] * Math.PI) * (g.radius - 2), g.cy + Math.sin(segment[0] * Math.PI) * (g.radius - 2));
            g.crownGuide.arc(g.cx, g.cy, g.radius - 2, segment[0] * Math.PI, segment[1] * Math.PI);
        });
        geometry = g;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        buildGradient();
        if (!running) radius = g.radius;
        render();
    }

    function updatePhysics(dt, playing) {
        const f = engine.features;
        const energy = f.envelope;
        visualIntensity += (intensity - visualIntensity) * (1 - Math.exp(-dt / 0.12));
        damping += ((0.94 - energy * 0.18) - damping) * (1 - Math.exp(-dt / 0.3));
        for (let i = 0; i < positions.length; i++) {
            const delayed = playing ? engine.delayed(i, (i / 47) * 0.045) : f.bands[i];
            targets[i] = clamp(f.bands[i] * 0.72 + delayed * 0.28, 0, 1.1);
            if (f.onset) velocities[i] += f.onset * (0.4 + (1 - i / 47) * f.kick) * reactivity;
        }
        if (f.onset) {
            onsetCount++;
            macroVelocity[1] += (f.onset * 1.2 + f.kick * 2.6) * reactivity;
            orbitVelocity = Math.min(0.62, orbitVelocity + (f.onset * 0.12 + f.kick * 0.22) * reactivity);
        }
        featuresAPI.springVector(positions, velocities, targets, dt, 17 + energy * 7, damping);
        for (let i = 0; i < geometry.crown.length; i++) {
            const b = geometry.crown[i];
            crownTargets[i] = clamp(f.bands[b.band] * 0.68 +
                (playing ? engine.delayed(b.band, b.delay) : f.bands[b.band]) * 0.32, 0, 1.1);
            if (f.onset) crownVelocities[i] += f.onset * (0.5 + Math.abs(b.dx) * f.kick) * reactivity;
        }
        featuresAPI.springVector(crownPositions, crownVelocities, crownTargets, dt, 15 + energy * 7, damping - 0.06);
        let wavePower = 0;
        for (let i = 0; i < mangaTargets.length; i++) {
            const j = Math.round(i / 15 * 63);
            const filtered = f.waveform[j] * 0.5 +
                (f.waveform[Math.max(0, j - 1)] + f.waveform[Math.min(63, j + 1)]) * 0.25;
            mangaTargets[i] = filtered + (f.waveform[j] - filtered) * f.treble * 0.24;
            wavePower += filtered * filtered;
        }
        const wantedGain = Math.min(3.5, 0.28 / Math.max(0.08, Math.sqrt(wavePower / 16)));
        waveGain += (wantedGain - waveGain) * (1 - Math.exp(-dt / 0.2));
        for (let i = 0; i < mangaTargets.length; i++) {
            mangaTargets[i] = clamp(mangaTargets[i] * waveGain, -0.95, 0.95);
            if (f.onset) mangaVelocities[i] += f.onset * Math.sign(mangaTargets[i]) * 1.5 * reactivity;
        }
        featuresAPI.springVector(mangaPositions, mangaVelocities, mangaTargets, dt, 22 + f.mid * 10, 0.84);
        let filteredWavePower = 0;
        for (let i = 0; i < mangaPositions.length; i++) filteredWavePower += mangaPositions[i] * mangaPositions[i];
        // Compensate cancellation introduced by temporal/physics filtering,
        // not musical loudness: the envelope still controls the stroke's size.
        // Never normalize absent audio into a moving decorative waveform.
        const displayGain = f.silent ? 1 : clamp(0.42 / Math.max(0.02, Math.sqrt(filteredWavePower / 16)), 1, 6);
        waveDisplayGain += (displayGain - waveDisplayGain) * (1 - Math.exp(-dt / 0.18));
        macroTarget[0] = clamp(f.bass * 0.6 + energy * 0.4, 0, 1.1);
        macroTarget[1] = 0;
        macroTarget[2] = energy;
        featuresAPI.springVector(macro, macroVelocity, macroTarget, dt, 13, 0.78);
        motionEnergy = 0;
        for (let i = 0; i < positions.length; i++) {
            positions[i] = clamp(positions[i], -0.02, 1.25);
            motionEnergy = Math.max(motionEnergy, Math.abs(positions[i]), Math.abs(velocities[i]) * 0.03);
            if (positions[i] >= peaks[i]) { peaks[i] = positions[i]; peakHold[i] = 0.09; }
            else if (peakHold[i] > 0) peakHold[i] -= dt;
            else peaks[i] = Math.max(positions[i], peaks[i] - dt * 0.75);
        }
        for (let i = 0; i < crownPositions.length; i++) {
            crownPositions[i] = clamp(crownPositions[i], -0.02, 1.25);
            motionEnergy = Math.max(motionEnergy, Math.abs(crownPositions[i]), Math.abs(crownVelocities[i]) * 0.03);
        }
        radius += (geometry.radius - radius) * (1 - Math.exp(-dt / 0.15));
        const fade = 1 - Math.exp(-dt / (playing && !f.silent ? 0.1 : 0.25));
        sceneOpacity += ((playing && !f.silent ? 1 : 0) - sceneOpacity) * fade;
        const selected = styles.indexOf(style);
        for (let i = 0; i < weights.length; i++) weights[i] += ((i === selected ? 1 : 0) - weights[i]) * (1 - Math.exp(-dt / 0.085));
        // Bounded music-driven momentum, not an independent CSS rotation.
        const equilibrium = playing && !f.silent ? energy * 0.2 : 0;
        const drag = Math.exp(-1.6 * dt);
        orbitPhase = (orbitPhase + equilibrium * dt + (orbitVelocity - equilibrium) * (1 - drag) / 1.6) % TAU;
        orbitVelocity = clamp(equilibrium + (orbitVelocity - equilibrium) * drag, 0, 0.62);
        gradientClock += dt * (0.1 + energy * 0.42) + (f.onset || 0) * 0.2;
        const nextStep = Math.floor(gradientClock * 24);
        if (nextStep !== gradientStep) buildGradient(gradientClock);
    }

    function addBounds(x, y, r) {
        bounds.left = Math.min(bounds.left, x - r);
        bounds.right = Math.max(bounds.right, x + r);
        bounds.top = Math.min(bounds.top, y - r);
        bounds.bottom = Math.max(bounds.bottom, y + r);
    }
    function crown(alpha) {
        const g = geometry, f = engine.features;
        ctx.globalAlpha = alpha * (0.26 + f.envelope * 0.1);
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 1.1;
        ctx.stroke(g.crownGuide);
        const opening = clamp(macro[0] * 5 + macro[1] * 3, 0, 9);
        for (let i = 0; i < g.crown.length; i++) {
            const b = g.crown[i];
            const value = Math.max(0, crownPositions[i] * 0.85 + f.mid * 0.18 + f.treble * b.tip * 0.12);
            const r = radius + opening * (0.55 + Math.abs(b.dx) * 0.45);
            const room = Math.max(0, b.reach - r);
            const length = Math.min(room, 2.4 + value * g.extension * visualIntensity + macro[1] * 5);
            const x = g.cx + b.dx * r, y = g.cy + b.dy * r;
            crownValues[i] = value;
            crownLines[i * 4] = x;
            crownLines[i * 4 + 1] = y;
            crownLines[i * 4 + 2] = x + b.dx * length;
            crownLines[i * 4 + 3] = y + b.dy * length;
            longestBar = Math.max(longestBar, length);
            addBounds(x + b.dx * length, y + b.dy * length, 1.3);
        }
        // One wide translucent pass reads as glow without per-frame shadowBlur.
        ctx.beginPath();
        for (let i = 0; i < g.crown.length; i++) {
            ctx.moveTo(crownLines[i * 4], crownLines[i * 4 + 1]);
            ctx.lineTo(crownLines[i * 4 + 2], crownLines[i * 4 + 3]);
        }
        ctx.globalAlpha = alpha * (0.1 + f.envelope * 0.13);
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 7;
        ctx.stroke();
        for (let bucket = 0; bucket < 4; bucket++) {
            ctx.beginPath();
            for (let i = 0; i < g.crown.length; i++) {
                if (Math.min(3, Math.floor(crownValues[i] * 4)) !== bucket) continue;
                ctx.moveTo(crownLines[i * 4], crownLines[i * 4 + 1]);
                ctx.lineTo(crownLines[i * 4 + 2], crownLines[i * 4 + 3]);
            }
            ctx.globalAlpha = alpha * (0.66 + bucket * 0.12);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.6;
            ctx.stroke();
        }
    }

    function halo(alpha) {
        const g = geometry, f = engine.features;
        const r = radius + clamp(macro[0] * 4 + macro[1] * 2, 0, 7);
        ctx.globalAlpha = alpha * 0.38;
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(g.cx, g.cy, r - 2, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < g.halo.length; i++) {
            const b = g.halo[i];
            const value = Math.max(0, Math.pow(Math.max(0, positions[b.band]), 1.22) * 0.94 + f.treble * 0.08);
            const room = Math.max(0, b.reach - r);
            const length = Math.min(room, 2.4 + value * g.extension * visualIntensity);
            const x = g.cx + b.dx * r, y = g.cy + b.dy * r;
            haloValues[i] = value;
            haloLines[i * 4] = x;
            haloLines[i * 4 + 1] = y;
            haloLines[i * 4 + 2] = x + b.dx * length;
            haloLines[i * 4 + 3] = y + b.dy * length;
            longestBar = Math.max(longestBar, length);
            addBounds(x + b.dx * length, y + b.dy * length, 1.2);
        }
        ctx.beginPath();
        for (let i = 0; i < g.halo.length; i++) {
            ctx.moveTo(haloLines[i * 4], haloLines[i * 4 + 1]);
            ctx.lineTo(haloLines[i * 4 + 2], haloLines[i * 4 + 3]);
        }
        ctx.globalAlpha = alpha * (0.09 + f.envelope * 0.12);
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 6;
        ctx.stroke();
        for (let bucket = 0; bucket < 4; bucket++) {
            ctx.beginPath();
            for (let i = 0; i < g.halo.length; i++) {
                if (Math.min(3, Math.floor(haloValues[i] * 4)) !== bucket) continue;
                ctx.moveTo(haloLines[i * 4], haloLines[i * 4 + 1]);
                ctx.lineTo(haloLines[i * 4 + 2], haloLines[i * 4 + 3]);
            }
            ctx.globalAlpha = alpha * (0.58 + bucket * 0.15);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.1;
            ctx.stroke();
        }
        // Short, held peak markers are independently driven per frequency band.
        ctx.beginPath();
        for (let i = 0; i < g.halo.length; i += 2) {
            const b = g.halo[i];
            if (peaks[b.band] < 0.2) continue;
            const reach = Math.min(b.reach, r + 3 + peaks[b.band] * g.extension * 0.9 * visualIntensity);
            ctx.moveTo(g.cx + b.dx * reach, g.cy + b.dy * reach);
            ctx.lineTo(g.cx + b.dx * (reach + 0.8), g.cy + b.dy * (reach + 0.8));
        }
        ctx.globalAlpha = alpha * (0.22 + f.treble * 0.25);
        ctx.strokeStyle = palette[0];
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function smoothWave(x, y) {
        ctx.beginPath();
        ctx.moveTo(x[0], y[0]);
        for (let i = 0; i < x.length - 1; i++) {
            const p = Math.max(0, i - 1), n = Math.min(x.length - 1, i + 2);
            ctx.bezierCurveTo(x[i] + (x[i + 1] - x[p]) / 6, y[i] + (y[i + 1] - y[p]) / 6,
                x[i + 1] - (x[n] - x[i]) / 6, y[i + 1] - (y[n] - y[i]) / 6, x[i + 1], y[i + 1]);
        }
        ctx.stroke();
    }
    function manga(alpha) {
        const g = geometry, f = engine.features;
        const baseline = g.cy + 72;
        const amplitude = Math.min(46, 11 + macro[2] * 30 + f.bass * 12) * visualIntensity;
        for (let i = 0; i < g.waveX.length; i++) {
            const t = i / 15;
            const taper = 4 * t * (1 - t);
            // Both strokes originate in the actual aligned waveform. The echo
            // uses nearby samples, not an unrelated repeating sine function.
            const bend = (1 - taper) * -10;
            const value = mangaPositions[i] * waveDisplayGain;
            const center = baseline + bend;
            const displacement = value * amplitude * taper;
            const capacity = Math.max(4, displacement > 0 ? g.h - 36 - center : center - g.cy - 49);
            g.waveY[i] = center + capacity * Math.tanh(displacement / capacity);
            const echo = -mangaPositions[Math.min(15, i + 1)] * waveDisplayGain * amplitude * 0.52 * taper;
            const echoCenter = center + 7;
            const echoRoom = Math.max(4, echo > 0 ? g.h - 35 - echoCenter : echoCenter - g.cy - 51);
            g.echoY[i] = echoCenter + echoRoom * Math.tanh(echo / echoRoom);
            addBounds(g.waveX[i], g.waveY[i], 1.5);
            addBounds(g.waveX[i], g.echoY[i], 1);
        }
        ctx.globalAlpha = alpha * 0.42;
        ctx.strokeStyle = palette[1];
        ctx.lineWidth = 1.4;
        smoothWave(g.waveX, g.echoY);
        ctx.globalAlpha = alpha * (0.1 + f.envelope * 0.12);
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 7;
        smoothWave(g.waveX, g.waveY);
        ctx.globalAlpha = alpha * (0.86 + f.mid * 0.14);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3.2;
        smoothWave(g.waveX, g.waveY);
    }

    function kinetic(alpha) {
        const g = geometry, f = engine.features;
        const rx = radius + 5 + macro[0] * 3;
        const ry = radius * 0.88 + 5;
        const tilt = -0.22;
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 1.1;
        ctx.globalAlpha = alpha * 0.46;
        ctx.beginPath();
        ctx.ellipse(g.cx, g.cy, rx, ry, tilt, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.18;
        ctx.beginPath();
        ctx.ellipse(g.cx, g.cy, rx + 4, ry + 4, tilt + 0.25, 0.13 * Math.PI, 0.93 * Math.PI);
        ctx.stroke();
        const cosTilt = Math.cos(tilt), sinTilt = Math.sin(tilt);
        for (let cluster = 0; cluster < 3; cluster++) {
            const angle = orbitPhase + orbitOffsets[cluster];
            const ox = Math.cos(angle), oy = Math.sin(angle);
            const nx = g.cx + cosTilt * rx * ox - sinTilt * ry * oy;
            const ny = g.cy + sinTilt * rx * ox + cosTilt * ry * oy;
            ctx.globalAlpha = alpha * (0.5 + f.treble * 0.4);
            ctx.fillStyle = cluster === 1 ? palette[1] : palette[0];
            ctx.beginPath();
            ctx.arc(nx, ny, 2.2 + f.treble * 1.8, 0, TAU);
            ctx.fill();
            addBounds(nx, ny, 4);
            for (let i = 0; i < 7; i++) {
                const a = angle - 0.3 + i * 0.075;
                const x = cosTilt * rx * Math.cos(a) - sinTilt * ry * Math.sin(a);
                const y = sinTilt * rx * Math.cos(a) + cosTilt * ry * Math.sin(a);
                const direction = Math.atan2(y, x);
                const dx = Math.cos(direction), dy = Math.sin(direction);
                const index = Math.floor(((direction / TAU + 1) % 1) * 256);
                const r = Math.sqrt(x * x + y * y);
                const band = 5 + cluster * 9 + i * 2;
                const value = Math.max(0, positions[band] * 0.85 + f.mid * 0.15);
                const length = Math.min(Math.max(0, g.orbitRoom[index] - r),
                    2.4 + value * g.extension * 1.05 * visualIntensity + macro[1] * 3);
                clusterLines[i * 4] = g.cx + x;
                clusterLines[i * 4 + 1] = g.cy + y;
                clusterLines[i * 4 + 2] = g.cx + x + dx * length;
                clusterLines[i * 4 + 3] = g.cy + y + dy * length;
                longestBar = Math.max(longestBar, length);
                addBounds(g.cx + x + dx * length, g.cy + y + dy * length, 1.3);
            }
            ctx.beginPath();
            for (let i = 0; i < 7; i++) {
                ctx.moveTo(clusterLines[i * 4], clusterLines[i * 4 + 1]);
                ctx.lineTo(clusterLines[i * 4 + 2], clusterLines[i * 4 + 3]);
            }
            ctx.globalAlpha = alpha * (0.1 + f.envelope * 0.12);
            ctx.lineWidth = 6;
            ctx.strokeStyle = highlight;
            ctx.stroke();
            ctx.globalAlpha = alpha * (0.62 + f.mid * 0.3);
            ctx.lineWidth = 2.4;
            ctx.strokeStyle = gradient;
            ctx.stroke();
        }
    }

    function render() {
        if (!geometry) return;
        const g = geometry;
        ctx.clearRect(0, 0, g.w, g.h);
        longestBar = 0;
        bounds.left = g.cx; bounds.right = g.cx; bounds.top = g.cy; bounds.bottom = g.cy;
        const opacity = Math.max(0.15, sceneOpacity);
        if (weights[0] > 0.005) crown(opacity * weights[0]);
        if (weights[1] > 0.005) halo(opacity * weights[1]);
        if (weights[2] > 0.005) manga(opacity * weights[2]);
        if (weights[3] > 0.005) kinetic(opacity * weights[3]);
        ctx.globalAlpha = 1;
    }

    function reactiveDOM() {
        const f = engine.features;
        const v = (1 + f.bass * 0.035).toFixed(3);
        const d = (1 + f.bass * 0.04).toFixed(3);
        const glow = (sceneOpacity * (0.12 + f.bass * 0.8)).toFixed(2);
        if (vinyl && v !== domCache.vinylScale) { vinyl.style.scale = v; domCache.vinylScale = v; }
        if (pedestal && d !== domCache.discScale) { pedestal.style.transform = `translate(-50%, -50%) scale(${d})`; domCache.discScale = d; }
        if (vinylGlow && glow !== domCache.vinylGlow) { vinylGlow.style.opacity = glow; domCache.vinylGlow = glow; }
        if (pedestalGlow && glow !== domCache.discGlow) { pedestalGlow.style.opacity = glow; domCache.discGlow = glow; }
        for (let i = 0; i < barsUI.length; i++) {
            const value = Math.max(0.18, Math.min(1, positions[Math.round(i / Math.max(1, barsUI.length - 1) * 47)]));
            if (Math.abs(value - barValues[i]) < 0.015) continue;
            barsUI[i].style.transform = `scaleY(${value.toFixed(3)})`;
            barValues[i] = value;
        }
    }
    function clearDOM() {
        if (vinyl) { vinyl.style.scale = ''; vinyl.classList.remove('audio-reactive'); }
        if (pedestal) { pedestal.style.transform = ''; pedestal.classList.remove('audio-reactive'); }
        if (vinylGlow) vinylGlow.style.opacity = '';
        if (pedestalGlow) pedestalGlow.style.opacity = '';
        barsUI.forEach(bar => { bar.style.transform = ''; bar.style.setProperty('--bar-scale', '0.18'); });
        barValues.fill(-1);
        Object.keys(domCache).forEach(key => { domCache[key] = ''; });
    }
    function changeState(next) {
        if (next === state) return;
        state = next;
        stage.dataset.audioState = next;
        updateCaption();
    }
    function updateCaption() {
        if (!caption) return;
        caption.textContent = names[style] + (state === 'suspended' ? ' · Chờ âm thanh' : state === 'buffering' ? ' · Đang tải' : '');
    }
    function playbackState() {
        if (audio.ended) return 'ended';
        if (audio.paused) return 'paused';
        if (!context || context.state !== 'running') return 'suspended';
        if (seeking) return 'seeking';
        if (audio.readyState < 2) return 'buffering';
        return 'playing';
    }
    function tick(now) {
        raf = 0;
        if (!running) return;
        if (doc.hidden || reduced.matches || doc.body.classList.contains('zen-mode')) { stop(); return; }
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
        last = now;
        const next = playbackState();
        changeState(next);
        const playing = next === 'playing';
        if (playing) {
            engine.sample(global.__minkoiAnalyser, dt, reactivity);
            settlingSince = 0;
        } else {
            engine.decay(dt);
            if (!settlingSince) settlingSince = now;
        }
        updatePhysics(dt, playing);
        let mixing = false;
        for (let i = 0; i < weights.length; i++) if (i !== styles.indexOf(style) && weights[i] > 0.005) mixing = true;
        const idle = playing && engine.features.silent && motionEnergy < 0.002 && !mixing;
        if (!idle || !idlePainted) { render(); reactiveDOM(); }
        idlePainted = idle;
        if (!playing && now - settlingSince > 950 && motionEnergy < 0.015) {
            running = false;
            clearDOM();
            sceneOpacity = 0;
            peaks.fill(0);
            peakHold.fill(0);
            orbitVelocity = 0;
            render();
            return;
        }
        raf = global.requestAnimationFrame(tick);
    }
    function attachContext() {
        const next = global.__minkoiAudioCtx;
        if (!next || next === context) return;
        if (context) context.removeEventListener('statechange', onContextState);
        context = next;
        context.addEventListener('statechange', onContextState);
    }
    function onContextState() { engine.reset(false); start(); }
    function start() {
        attachContext();
        const next = playbackState();
        changeState(next);
        if (next !== 'playing') engine.decay(0);
        if (doc.hidden || reduced.matches || doc.body.classList.contains('zen-mode')) {
            if (next !== 'playing') engine.decay(1);
            return;
        }
        if (running) return;
        measure();
        if (!geometry) return;
        if (audio.paused && motionEnergy < 0.001) { render(); return; }
        running = true;
        last = 0;
        settlingSince = 0;
        vinyl?.classList.add('audio-reactive');
        pedestal?.classList.add('audio-reactive');
        raf = global.requestAnimationFrame(tick);
    }
    function stop() {
        if (raf) global.cancelAnimationFrame(raf);
        raf = 0; running = false; last = 0;
        sceneOpacity = 0;
        clearDOM();
        if (geometry) ctx.clearRect(0, 0, geometry.w, geometry.h);
    }
    function scheduleMeasure() {
        if (resizeTimer) return;
        resizeTimer = global.setTimeout(() => { resizeTimer = 0; measure(); }, 90);
    }
    function setStyle(next, options) {
        next = legacy[next] || next;
        if (!names[next]) return;
        style = next;
        idlePainted = false;
        if (options?.persist !== false) save('minkoi_visualizer_style', next);
        updateCaption();
        if (!audio.paused || running) start();
        else { weights.fill(0); weights[styles.indexOf(style)] = 1; render(); }
        global.dispatchEvent(new CustomEvent('minkoi:vizstyle', { detail: { style } }));
    }
    function setControl(key, value, options) {
        if (!Number.isFinite(Number(value))) return;
        if (key === 'intensity') intensity = clamp(Number(value), 0.55, 1.4);
        else if (key === 'reactivity') reactivity = clamp(Number(value), 0.45, 1.45);
        else return;
        if (options?.persist !== false) save('minkoi_visualizer_' + key, key === 'intensity' ? intensity : reactivity);
        if (!audio.paused) start();
    }

    ['play', 'playing', 'pause', 'ended', 'waiting'].forEach(event => audio.addEventListener(event, start));
    audio.addEventListener('seeking', () => { seeking = true; engine.reset(false); start(); });
    audio.addEventListener('seeked', () => { seeking = false; engine.reset(false); start(); });
    audio.addEventListener('emptied', () => { engine.reset(true); start(); });
    doc.addEventListener('visibilitychange', () => { if (doc.hidden) stop(); else if (!audio.paused) { engine.reset(false); start(); } });
    reduced.addEventListener('change', () => { if (reduced.matches) stop(); else if (!audio.paused) start(); });
    global.addEventListener('minkoi:zenchange', () => { if (doc.body.classList.contains('zen-mode')) stop(); else if (!audio.paused) start(); });
    global.addEventListener('minkoi:persona', event => { refreshPalette(event); scheduleMeasure(); });
    global.addEventListener('minkoi:themechange', refreshPalette);
    global.addEventListener('resize', scheduleMeasure, { passive: true });
    avatar.addEventListener('load', scheduleMeasure);
    if (global.ResizeObserver) {
        const observer = new global.ResizeObserver(scheduleMeasure);
        [stage, art, avatar].forEach(el => observer.observe(el));
    }
    doc.fonts?.ready.then(scheduleMeasure);
    global.MinkoiVisualizer = Object.freeze({
        start, stop, setStyle, setControl, getStyle: () => style,
        getControls: () => ({ intensity, reactivity }),
        getMetrics: () => {
            const f = engine.features;
            const rect = stage.getBoundingClientRect();
            return { style, state, running, sampling: running && state === 'playing', intensity, reactivity,
                canvasSize: geometry?.w || 0, baseRadius: radius, onsetCount, longestBar, palette: palette.slice(),
                bounds: { left: rect.left + bounds.left, right: rect.left + bounds.right,
                    top: rect.top + bounds.top, bottom: rect.top + bounds.bottom },
                audio: { rms: f.rms, bass: f.bass, mid: f.mid, treble: f.treble,
                    envelope: f.envelope, reference: f.reference, flux: f.flux, silent: f.silent },
                rawEnergy: { bass: f.rawBass, mid: f.rawMid, treble: f.rawTreble },
                physics: { opening: macro[0], impulse: macro[1], energy: motionEnergy, orbitVelocity, orbitPhase },
                bands: Array.from(f.bands), positions: Array.from(positions), waveform: Array.from(f.waveform) };
        }
    });
    refreshPalette();
    measure();
    updateCaption();
    if (!audio.paused) start();
})(window);
