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

    const QUALITY_FULL = { tier: 'full', fluidScale: 0.75, fluidMaxPixels: 240000, fluidFpsCap: 0, particleMaxPixels: 1050000, particleFpsCap: 0, dprCap: 2.0 };
    const QUALITY_BALANCED = { tier: 'balanced', fluidScale: 0.45, fluidMaxPixels: 52000, fluidFpsCap: 16, particleMaxPixels: 520000, particleFpsCap: 30, dprCap: 1.25 };
    const MIN_TIER_DWELL_MS = 6000;

    let currentQuality = QUALITY_FULL;
    let isSoftwareGpu = Boolean(global.__minkoiSoftwareGpu);
    let lifecycleHidden = Boolean(doc.hidden);
    let lastAvgFrameMs = 16.7;
    let lastP50FrameMs = 16.7;
    let lastP95FrameMs = 16.7;
    let heavyStreak = 0;
    let healthyStreak = 0;
    let tierTransitions = 0;
    let lastTierChangeAt = 0;
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

    function applyQuality(next, options = {}) {
        if (!next || next.tier === currentQuality.tier) return;
        const now = performance.now();
        if (!options.immediate && !options.force && lastTierChangeAt > 0 && (now - lastTierChangeAt) < MIN_TIER_DWELL_MS) {
            return;
        }
        currentQuality = next;
        lastTierChangeAt = now;
        tierTransitions += 1;
        if (global.MinkoiGpuManager && typeof global.MinkoiGpuManager.dispatchQualityProfile === 'function') {
            global.MinkoiGpuManager.dispatchQualityProfile(next, options);
        } else {
            try { global.__setFluidRenderScale?.(next.fluidScale, next.fluidMaxPixels, next.fluidFpsCap); } catch (_) {}
            try { global.__setParticleDprCap?.(next.dprCap, next.particleMaxPixels, next.particleFpsCap); } catch (_) {}
            try { global.__setVisualizerDprCap?.(next.dprCap); } catch (_) {}
        }
        global.dispatchEvent(new CustomEvent('minkoi:perfquality', {
            detail: {
                ...currentQuality,
                isSoftwareGpu,
                lastAvgFrameMs: Number(lastAvgFrameMs.toFixed(1)),
                lastP50FrameMs: Number(lastP50FrameMs.toFixed(1)),
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
        // Accept >= 4 samples so very slow GPUs (including masked software WebKit < 5 FPS) are measured,
        // while using median (p50) to reject single transient GC/decode spikes on fast GPUs.
        if (count >= 4) {
            let sum = 0;
            for (let i = 0; i < count; i++) sum += frameSamples[i];
            lastAvgFrameMs = sum / count;
            frameSamples.sort((a, b) => a - b);
            lastP50FrameMs = frameSamples[Math.floor(count * 0.5)];
            lastP95FrameMs = frameSamples[Math.min(count - 1, Math.floor(count * 0.95))];

            const tel = global.MinkoiRuntime?.getTelemetrySummary?.();
            const sustainedLongTasks = Boolean(tel && tel.recentLongTasks10s >= 4 && lastP95FrameMs > 42);
            if (lastP50FrameMs > 26 || (lastAvgFrameMs > 28 && lastP95FrameMs > 46) || sustainedLongTasks) {
                heavyStreak += 1;
                healthyStreak = 0;
                // Only fast-downshift in 1 window when the MEDIAN itself is > 65ms (sustained slow GPU, never 1 outlier)
                const needStreak = lastP50FrameMs > 65 ? 1 : 2;
                if (heavyStreak >= needStreak && currentQuality.tier === 'full') {
                    applyQuality(QUALITY_BALANCED, { immediate: false });
                }
            } else if (!isSoftwareGpu && lastP50FrameMs < 19.2 && lastP95FrameMs < 30 && (!tel || tel.recentLongTasks10s === 0)) {
                healthyStreak += 1;
                heavyStreak = 0;
                if (healthyStreak >= 2 && currentQuality.tier !== 'full') {
                    applyQuality(QUALITY_FULL, { immediate: false });
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
            // Ignore genuine tab-switch gaps >= 1200ms while still recording very slow-GPU frames (140..1150ms)
            if (dt > 2 && dt < 1200) {
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

    // Immediately adopt balanced canvas scales on software-rasterized GPUs (e.g. SwiftShader / legacy Intel)
    // without touching hardware GPUs (Android/iQOO or modern desktop GPUs stay on full tier).
    if (global.__minkoiSoftwareGpu || global.MinkoiCapabilities?.isSoftwareGpu?.()) {
        isSoftwareGpu = true;
        applyQuality(QUALITY_BALANCED, { immediate: true });
    }
    global.addEventListener('minkoi:gpudetected', (e) => {
        if (e?.detail?.software) {
            isSoftwareGpu = true;
            applyQuality(QUALITY_BALANCED, { immediate: true });
        }
    });

    // Bounded initial desktop/ambient probe after boot settles so paused desktop GPUs still benefit
    if (!lifecycleHidden && hasLiveAmbientGraphics()) {
        cooldownTimer = global.setTimeout(startSampleWindow, 2000);
    }

    global.MinkoiPerf = Object.freeze({
        getState: () => ({
            tier: currentQuality.tier,
            isSoftwareGpu,
            fluidScale: currentQuality.fluidScale,
            fluidMaxPixels: currentQuality.fluidMaxPixels,
            fluidFpsCap: currentQuality.fluidFpsCap,
            particleFpsCap: currentQuality.particleFpsCap,
            dprCap: currentQuality.dprCap,
            lastAvgFrameMs: Number(lastAvgFrameMs.toFixed(1)),
            lastP50FrameMs: Number(lastP50FrameMs.toFixed(1)),
            lastP95FrameMs: Number(lastP95FrameMs.toFixed(1)),
            tierTransitions,
            lifecycleHidden
        }),
        resetQuality: () => {
            heavyStreak = 0;
            healthyStreak = 0;
            idleProbesRemaining = 2;
            applyQuality(isSoftwareGpu ? QUALITY_BALANCED : QUALITY_FULL, { force: true });
        }
    });
})(typeof window !== 'undefined' ? window : globalThis);
