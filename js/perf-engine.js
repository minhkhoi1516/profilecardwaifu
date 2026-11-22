/* ==========================================================================
   MINKOI V5 ULTIMATE · ADAPTIVE PERFORMANCE & LIFECYCLE ENGINE
   - Coordinates visibilitychange / pagehide / pageshow without pausing audio
   - Monitors active playback frame times using periodic bounded windows
   - Applies strict hysteresis ONLY to internal canvas render scales
   - NEVER disables Glass, blur, Artwork, Visualizer, Fluid BG, Capsule,
     Lyrics, or Spring motion.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    const audio = doc?.getElementById?.('audio-player');
    if (!doc) return;

    const QUALITY_FULL = { tier: 'full', fluidScale: 0.75, fluidMaxPixels: 240000, particleMaxPixels: 1050000, dprCap: 2.0 };
    const QUALITY_BALANCED = { tier: 'balanced', fluidScale: 0.56, fluidMaxPixels: 135000, particleMaxPixels: 640000, dprCap: 1.25 };

    let currentQuality = QUALITY_FULL;
    let lifecycleHidden = Boolean(doc.hidden);
    let lastAvgFrameMs = 16.7;
    let lastP95FrameMs = 16.7;
    let heavyStreak = 0;
    let healthyStreak = 0;
    let sampleRaf = 0;
    let cooldownTimer = 0;
    let sampleStart = 0;
    let lastTick = 0;
    let idleProbesRemaining = 2;
    const frameSamples = [];

    function isActivePlayback() {
        return Boolean(audio && !audio.paused);
    }

    function hasLiveAmbientGraphics() {
        if (lifecycleHidden) return false;
        if (global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return false;
        return Boolean(doc.getElementById('fluid-bg-canvas') || doc.getElementById('starry-canvas'));
    }

    function applyQuality(next) {
        if (!next || next.tier === currentQuality.tier) return;
        currentQuality = next;
        try { global.__setFluidRenderScale?.(next.fluidScale, next.fluidMaxPixels); } catch (_) {}
        try { global.__setParticleDprCap?.(next.dprCap, next.particleMaxPixels); } catch (_) {}
        try { global.__setVisualizerDprCap?.(next.dprCap); } catch (_) {}
        global.dispatchEvent(new CustomEvent('minkoi:perfquality', {
            detail: {
                ...currentQuality,
                lastAvgFrameMs: Number(lastAvgFrameMs.toFixed(1)),
                lastP95FrameMs: Number(lastP95FrameMs.toFixed(1))
            }
        }));
    }

    function stopSampling() {
        if (sampleRaf) {
            global.cancelAnimationFrame(sampleRaf);
            sampleRaf = 0;
        }
        if (cooldownTimer) {
            global.clearTimeout(cooldownTimer);
            cooldownTimer = 0;
        }
        sampleStart = 0;
        lastTick = 0;
        frameSamples.length = 0;
    }

    function finishWindow() {
        sampleRaf = 0;
        const count = frameSamples.length;
        if (count >= 18) {
            let sum = 0;
            for (let i = 0; i < count; i++) sum += frameSamples[i];
            lastAvgFrameMs = sum / count;
            frameSamples.sort((a, b) => a - b);
            lastP95FrameMs = frameSamples[Math.min(count - 1, Math.floor(count * 0.95))];

            if (lastAvgFrameMs > 26 || lastP95FrameMs > 42) {
                heavyStreak += 1;
                healthyStreak = 0;
                if (heavyStreak >= 2 && currentQuality.tier === 'full') {
                    applyQuality(QUALITY_BALANCED);
                }
            } else if (lastAvgFrameMs < 19.2 && lastP95FrameMs < 30) {
                healthyStreak += 1;
                heavyStreak = 0;
                if (healthyStreak >= 2 && currentQuality.tier !== 'full') {
                    applyQuality(QUALITY_FULL);
                }
            } else {
                heavyStreak = 0;
                healthyStreak = 0;
            }
        }
        frameSamples.length = 0;

        if (!lifecycleHidden && isActivePlayback()) {
            cooldownTimer = global.setTimeout(startSampleWindow, 7500);
        } else if (!lifecycleHidden && hasLiveAmbientGraphics() && idleProbesRemaining > 0) {
            // Bounded idle probes on desktop settle (never runs a permanent background RAF loop)
            idleProbesRemaining -= 1;
            const delay = heavyStreak > 0 ? 1800 : 4500;
            cooldownTimer = global.setTimeout(startSampleWindow, delay);
        }
    }

    function sampleTick(now) {
        if (lifecycleHidden || (!isActivePlayback() && !hasLiveAmbientGraphics())) {
            stopSampling();
            return;
        }
        if (!sampleStart) {
            sampleStart = now;
            lastTick = now;
            frameSamples.length = 0;
        } else {
            const dt = now - lastTick;
            lastTick = now;
            // Ignore outlier pause/background gaps > 140ms so tab switches never skew tiering
            if (dt > 2 && dt < 140) {
                frameSamples.push(dt);
            }
        }
        if (now - sampleStart >= 1600) {
            finishWindow();
            return;
        }
        sampleRaf = global.requestAnimationFrame(sampleTick);
    }

    function startSampleWindow() {
        if (sampleRaf || lifecycleHidden) return;
        if (!isActivePlayback() && !hasLiveAmbientGraphics()) return;
        if (global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
        if (cooldownTimer) {
            global.clearTimeout(cooldownTimer);
            cooldownTimer = 0;
        }
        sampleStart = 0;
        sampleRaf = global.requestAnimationFrame(sampleTick);
    }

    function emitLifecycle(hidden, reason) {
        lifecycleHidden = Boolean(hidden);
        if (lifecycleHidden) {
            stopSampling();
        } else if (isActivePlayback()) {
            cooldownTimer = global.setTimeout(startSampleWindow, 1200);
        } else if (hasLiveAmbientGraphics() && currentQuality.tier === 'full') {
            idleProbesRemaining = 1;
            cooldownTimer = global.setTimeout(startSampleWindow, 2200);
        }
        global.dispatchEvent(new CustomEvent('minkoi:lifecycle', {
            detail: { hidden: lifecycleHidden, reason }
        }));
    }

    doc.addEventListener('visibilitychange', () => {
        emitLifecycle(doc.hidden, 'visibilitychange');
    });
    global.addEventListener('pagehide', () => emitLifecycle(true, 'pagehide'));
    global.addEventListener('pageshow', () => emitLifecycle(Boolean(doc.hidden), 'pageshow'));

    if (audio) {
        audio.addEventListener('play', () => {
            if (!lifecycleHidden) {
                stopSampling();
                cooldownTimer = global.setTimeout(startSampleWindow, 1400);
            }
        });
        audio.addEventListener('pause', stopSampling);
        audio.addEventListener('ended', stopSampling);
    }

    // Bounded initial desktop/ambient probe after boot settles so paused desktop GPUs still benefit
    if (!lifecycleHidden && hasLiveAmbientGraphics()) {
        cooldownTimer = global.setTimeout(startSampleWindow, 2000);
    }

    global.MinkoiPerf = Object.freeze({
        getState: () => ({
            tier: currentQuality.tier,
            fluidScale: currentQuality.fluidScale,
            fluidMaxPixels: currentQuality.fluidMaxPixels,
            dprCap: currentQuality.dprCap,
            lastAvgFrameMs: Number(lastAvgFrameMs.toFixed(1)),
            lastP95FrameMs: Number(lastP95FrameMs.toFixed(1)),
            lifecycleHidden
        }),
        resetQuality: () => {
            heavyStreak = 0;
            healthyStreak = 0;
            idleProbesRemaining = 2;
            applyQuality(QUALITY_FULL);
        }
    });
})(typeof window !== 'undefined' ? window : globalThis);
