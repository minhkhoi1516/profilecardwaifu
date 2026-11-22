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

    const QUALITY_FULL = { tier: 'full', fluidScale: 0.75, dprCap: 2.0 };
    const QUALITY_BALANCED = { tier: 'balanced', fluidScale: 0.56, dprCap: 1.3 };

    let currentQuality = QUALITY_FULL;
    let lifecycleHidden = Boolean(doc.hidden);
    let lastAvgFrameMs = 16.7;
    let heavyStreak = 0;
    let healthyStreak = 0;
    let sampleRaf = 0;
    let cooldownTimer = 0;
    let sampleStart = 0;
    let lastTick = 0;
    let frameSum = 0;
    let frameCount = 0;

    function applyQuality(next) {
        if (!next || next.tier === currentQuality.tier) return;
        currentQuality = next;
        try { global.__setFluidRenderScale?.(next.fluidScale); } catch (_) {}
        try { global.__setParticleDprCap?.(next.dprCap); } catch (_) {}
        try { global.__setVisualizerDprCap?.(next.dprCap); } catch (_) {}
        global.dispatchEvent(new CustomEvent('minkoi:perfquality', {
            detail: { ...currentQuality, lastAvgFrameMs: Number(lastAvgFrameMs.toFixed(1)) }
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
        frameSum = 0;
        frameCount = 0;
    }

    function finishWindow() {
        sampleRaf = 0;
        if (frameCount >= 20) {
            lastAvgFrameMs = frameSum / frameCount;
            if (lastAvgFrameMs > 28) {
                heavyStreak += 1;
                healthyStreak = 0;
                if (heavyStreak >= 2 && currentQuality.tier === 'full') {
                    applyQuality(QUALITY_BALANCED);
                }
            } else if (lastAvgFrameMs < 19.5) {
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
        if (!lifecycleHidden && audio && !audio.paused) {
            cooldownTimer = global.setTimeout(startSampleWindow, 7500);
        }
    }

    function sampleTick(now) {
        if (lifecycleHidden || !audio || audio.paused) {
            stopSampling();
            return;
        }
        if (!sampleStart) {
            sampleStart = now;
            lastTick = now;
            frameSum = 0;
            frameCount = 0;
        } else {
            const dt = now - lastTick;
            lastTick = now;
            // Ignore outlier pause/background gaps > 140ms so tab switches never skew tiering
            if (dt > 2 && dt < 140) {
                frameSum += dt;
                frameCount += 1;
            }
        }
        if (now - sampleStart >= 1800) {
            finishWindow();
            return;
        }
        sampleRaf = global.requestAnimationFrame(sampleTick);
    }

    function startSampleWindow() {
        if (sampleRaf || lifecycleHidden || !audio || audio.paused) return;
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
        } else if (audio && !audio.paused) {
            cooldownTimer = global.setTimeout(startSampleWindow, 1200);
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

    global.MinkoiPerf = Object.freeze({
        getState: () => ({
            tier: currentQuality.tier,
            fluidScale: currentQuality.fluidScale,
            dprCap: currentQuality.dprCap,
            lastAvgFrameMs: Number(lastAvgFrameMs.toFixed(1)),
            lifecycleHidden
        }),
        resetQuality: () => {
            heavyStreak = 0;
            healthyStreak = 0;
            applyQuality(QUALITY_FULL);
        }
    });
})(typeof window !== 'undefined' ? window : globalThis);
