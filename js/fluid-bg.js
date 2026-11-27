/* ========================================================
   MINKOI · WEBGL AUDIO-REACTIVE FLUID BACKGROUND ENGINE
   Pure WebGL2/WebGL Shader with Bass Frequency Coupling
   Reacts organically to audio bass with zero external libraries
======================================================== */
(function() {
    'use strict';

    const canvas = document.getElementById('fluid-bg-canvas');
    if (!canvas) return;

    const gpuMgr = window.MinkoiGpuManager || null;
    const caps = window.MinkoiCapabilities || null;

    // Adaptive GPU backend selection: WebGL2 -> WebGL1 -> Canvas 2D fallback,
    // plus async WebGPU pipeline probe when hardware adapter is available.
    let backendKind = 'none';
    let gl = null;
    let ctx2d = null;
    let fallbackCanvas2d = null;
    let contextFallbackTimer = 0;
    let gpuRenderer = null;
    let contextLost = false;
    let isSoftwareGpu = Boolean(caps?.isSoftwareGpu?.());

    function activateCanvas2dFallback(reason) {
        if (ctx2d) return;
        // A canvas bound to WebGL cannot return a 2D context; mount an inert sibling
        // fallback canvas behind the same slot if the WebGL context does not restore.
        try {
            const sib = document.createElement('canvas');
            sib.className = canvas.className;
            sib.setAttribute('aria-hidden', 'true');
            sib.style.cssText = canvas.style.cssText;
            sib.style.position = 'fixed';
            sib.style.inset = '0';
            sib.style.width = '100%';
            sib.style.height = '100%';
            sib.style.pointerEvents = 'none';
            sib.style.zIndex = getComputedStyle(canvas).zIndex || '0';
            const c2 = sib.getContext('2d', { alpha: true });
            if (!c2) return;
            canvas.parentElement?.insertBefore(sib, canvas);
            canvas.style.visibility = 'hidden';
            fallbackCanvas2d = sib;
            ctx2d = c2;
            backendKind = 'canvas2d-recovered';
            gpuMgr?.setSubsystemBackend?.('fluid', backendKind);
            window.MinkoiRuntime?.recordRecovery?.('gpu', 'canvas2d-fallback', reason || 'unrecovered-webgl-loss');
            resizeCanvas();
            startLoop();
        } catch (_) {}
    }

    function teardownCanvas2dFallback() {
        if (contextFallbackTimer) {
            clearTimeout(contextFallbackTimer);
            contextFallbackTimer = 0;
        }
        if (fallbackCanvas2d) {
            try { fallbackCanvas2d.remove(); } catch (_) {}
            fallbackCanvas2d = null;
            ctx2d = null;
            canvas.style.visibility = '';
        }
    }

    function initWebGLContext() {
        gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false });
        if (gl) {
            backendKind = 'webgl2';
        } else {
            gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false }) ||
                 canvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });
            if (gl) backendKind = 'webgl1';
        }
        if (!gl) {
            ctx2d = canvas.getContext('2d', { alpha: true });
            if (ctx2d) backendKind = 'canvas2d';
            return false;
        }
        try {
            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            const rendererStr = String(
                (dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '') ||
                gl.getParameter(gl.RENDERER) || ''
            );
            isSoftwareGpu = /swiftshader|llvmpipe|software|basic render driver|mesa offscreen|subzero/i.test(rendererStr);
        } catch (_) {}
        window.__minkoiSoftwareGpu = isSoftwareGpu;
        caps?.reportWebGLContext?.(gl, backendKind === 'webgl2');
        gpuMgr?.setSubsystemBackend?.('fluid', backendKind);
        return true;
    }

    initWebGLContext();
    if (!gl && !ctx2d) return;

    // Vertex Shader: Fullscreen Clip Quad
    const vsSource = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    // Fragment Shader: Procedural Domain Warping Noise reactive to Bass & Persona Accent
    const fsSource = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_bass;
        uniform vec3 u_accent;

        // Pure ALU polynomial hash (eliminates 44 transcendental sin() ops/pixel on desktop GPUs)
        float hash(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 = fract(p3 + dot(p3, p3.yzx + 19.19));
            return fract((p3.x + p3.y) * p3.z * 7.31);
        }

        // Value noise with cubic hermite curve
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                f.y
            );
        }

        // Optimized 2-Octave Domain Warp fBm (Zero Latency Warping)
        float fbm2(vec2 p) {
            mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
            return 0.6 * noise(p) + 0.3 * noise(rot * p * 2.04 + vec2(13.4, 1.7));
        }

        // 3-Octave Detailed Feature fBm
        float fbm3(vec2 p) {
            mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
            float v = 0.5 * noise(p);
            p = rot * p * 2.04 + vec2(13.4, 1.7);
            v += 0.25 * noise(p);
            p = rot * p * 2.04 + vec2(13.4, 1.7);
            v += 0.125 * noise(p);
            return v;
        }

        void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            float t = u_time * 0.12;
            float bassImpact = u_bass * 0.65;

            // Two-stage Domain Warping
            vec2 q = vec2(
                fbm2(p + vec2(0.0, t * 0.8)),
                fbm2(p + vec2(t * 0.6, 0.0))
            );

            vec2 r = vec2(
                fbm2(p + 2.2 * q + vec2(1.7, 9.2) + 0.15 * t + bassImpact * 0.3),
                fbm2(p + 2.2 * q + vec2(8.3, 2.8) + 0.12 * t - bassImpact * 0.2)
            );

            float f = fbm3(p + 3.0 * r + bassImpact * 0.5);

            // Palette interpolation: Deep Void -> Persona Accent -> Neon Shimmer
            vec3 colDeep = vec3(0.02, 0.03, 0.07);
            vec3 colAccent = u_accent;
            vec3 colGlow = vec3(0.9, 0.75, 1.0);

            vec3 color = mix(colDeep, colAccent, clamp(f * f * 2.2, 0.0, 1.0));
            color = mix(color, colGlow, clamp(length(q) * bassImpact * 1.8, 0.0, 1.0));

            // Ambient breathing alpha mask (0.15 resting -> 0.65 on heavy bass)
            float alpha = clamp((f * 0.45) + (bassImpact * 0.4) + 0.12, 0.0, 0.75);
            gl_FragColor = vec4(color * alpha, alpha);
        }
    `;

    function createShader(glCtx, type, source) {
        const shader = glCtx.createShader(type);
        glCtx.shaderSource(shader, source);
        glCtx.compileShader(shader);
        if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
            glCtx.deleteShader(shader);
            return null;
        }
        return shader;
    }

    let program = null;
    let positionBuffer = null;
    let uResLoc = null;
    let uTimeLoc = null;
    let uBassLoc = null;
    let uAccentLoc = null;

    function buildWebGLPipeline() {
        if (!gl) return false;
        const t0 = performance.now();
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!vertexShader || !fragmentShader) return false;

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            program = null;
            return false;
        }

        gl.useProgram(program);

        // Fullscreen quad buffer
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                 1.0, -1.0,
                 1.0,  1.0
            ]),
            gl.STATIC_DRAW
        );

        const aPosLoc = gl.getAttribLocation(program, 'a_pos');
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

        uResLoc = gl.getUniformLocation(program, 'u_resolution');
        uTimeLoc = gl.getUniformLocation(program, 'u_time');
        uBassLoc = gl.getUniformLocation(program, 'u_bass');
        uAccentLoc = gl.getUniformLocation(program, 'u_accent');
        gl.viewport(0, 0, canvas.width, canvas.height);
        gpuMgr?.recordShaderCompile?.(performance.now() - t0);
        return true;
    }

    if (gl && !buildWebGLPipeline()) {
        // Fallback to Canvas 2D atmospheric gradient if shader compilation fails
        gl = null;
        ctx2d = canvas.getContext('2d', { alpha: true });
        backendKind = ctx2d ? 'canvas2d' : 'none';
        gpuMgr?.setSubsystemBackend?.('fluid', backendKind);
        if (!ctx2d) return;
    }

    // Accent color cache (default Mahiru soft amber/rose)
    let currentAccent = [0.93, 0.45, 0.65]; // RGB 0..1

    function parseHexColor(hex) {
        if (!hex || typeof hex !== 'string') return [0.22, 0.74, 0.97];
        const clean = hex.replace('#', '');
        if (clean.length === 6) {
            return [
                parseInt(clean.slice(0, 2), 16) / 255,
                parseInt(clean.slice(2, 4), 16) / 255,
                parseInt(clean.slice(4, 6), 16) / 255
            ];
        }
        return [0.22, 0.74, 0.97];
    }

    function updateAccentColor() {
        if (typeof window.getCurrentPersona === 'function') {
            const persona = window.getCurrentPersona();
            if (persona && persona.accent) {
                currentAccent = parseHexColor(persona.accent);
                return;
            }
        }
        const hex = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        if (hex) currentAccent = parseHexColor(hex);
    }

    window.addEventListener('minkoi:persona', (e) => {
        if (e.detail && e.detail.persona && e.detail.persona.accent) {
            currentAccent = parseHexColor(e.detail.persona.accent);
        }
    });

    // The atmosphere is a soft, low-frequency field: its value-noise features
    // span tens of CSS pixels and it composites at 42% opacity, so sampling it
    // per device pixel adds fill cost without adding visible detail. Render at
    // 0.75 samples per CSS pixel and let the compositor scale the buffer.
    // Three fixed-time dark-theme comparisons against the old 1.5x cap had
    // <=2/255 channel differences; this is not a universal device guarantee.
    // Fragment work at DPR 3 drops by ~4x. No feature is disabled and the
    // animation still runs at the display refresh rate.
    let renderScale = isSoftwareGpu ? 0.45 : 0.75;
    // Aspect-preserving pixel budget keeps desktop fragment work proportional
    // to mobile (untouched 293x633 at 390x844; ~653x367 at 1080p on hardware GPUs).
    // On software-rasterized GPUs (SwiftShader), keep the exact same shader live at a
    // soft low-frequency mist budget (~52k px, aligned with MinkoiPerf balanced tier) so CPU stays free for UI.
    let maxFluidPixels = isSoftwareGpu ? 52000 : 240000;
    let fluidFpsCap = isSoftwareGpu ? 16 : 0;

    // Adaptive bounded render resolution (always stays live).
    function resizeCanvas() {
        const vw = Math.max(1, window.innerWidth);
        const vh = Math.max(1, window.innerHeight);
        const areaScale = Math.sqrt(maxFluidPixels / (vw * vh));
        const effectiveScale = Math.min(renderScale, areaScale);
        const w = Math.max(1, Math.round(vw * effectiveScale));
        const h = Math.max(1, Math.round(vh * effectiveScale));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            if (gl && !contextLost) gl.viewport(0, 0, w, h);
        }
        if (fallbackCanvas2d && (fallbackCanvas2d.width !== w || fallbackCanvas2d.height !== h)) {
            fallbackCanvas2d.width = w;
            fallbackCanvas2d.height = h;
        }
    }

    window.__setFluidRenderScale = function(nextScale, nextMaxPixels, nextFpsCap) {
        const clampedScale = Math.max(0.32, Math.min(0.75, Number(nextScale) || 0.75));
        const clampedPixels = Number.isFinite(Number(nextMaxPixels))
            ? Math.max(36000, Math.min(280000, Number(nextMaxPixels)))
            : (clampedScale < 0.65 ? 52000 : 240000);
        fluidFpsCap = (nextFpsCap !== undefined && Number.isFinite(Number(nextFpsCap)))
            ? Math.max(0, Math.min(60, Number(nextFpsCap)))
            : (clampedScale >= 0.7 ? 0 : 16);
        if (Math.abs(clampedScale - renderScale) < 0.04 && Math.abs(clampedPixels - maxFluidPixels) < 6000) return;
        renderScale = clampedScale;
        maxFluidPixels = clampedPixels;
        resizeCanvas();
    };

    // Register with central MinkoiGpuManager & dispatch gpu event AFTER __setFluidRenderScale exists
    gpuMgr?.registerConsumer?.('fluid-bg', (profile) => {
        window.__setFluidRenderScale(profile.fluidScale, profile.fluidMaxPixels, profile.fluidFpsCap);
    });
    gpuMgr?.attachWebGLContextRecovery?.(
        canvas,
        () => {
            contextLost = true;
            stopLoop();
            if (contextFallbackTimer) clearTimeout(contextFallbackTimer);
            // If driver does not restore WebGL within 2.5s, fall back cleanly to Canvas 2D
            contextFallbackTimer = setTimeout(() => {
                contextFallbackTimer = 0;
                if (contextLost) activateCanvas2dFallback('webgl-unrecovered-2500ms');
            }, 2500);
        },
        () => {
            contextLost = false;
            teardownCanvas2dFallback();
            if (gl && buildWebGLPipeline()) {
                backendKind = (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) ? 'webgl2' : 'webgl1';
                gpuMgr?.setSubsystemBackend?.('fluid', backendKind);
                resizeCanvas();
                startLoop();
            } else {
                activateCanvas2dFallback('webgl-rebuild-failed');
            }
        }
    );
    window.__getFluidRuntimeInfo = () => ({
        backend: backendKind,
        contextLost,
        fallback2dActive: Boolean(fallbackCanvas2d),
        width: fallbackCanvas2d ? fallbackCanvas2d.width : canvas.width,
        height: fallbackCanvas2d ? fallbackCanvas2d.height : canvas.height
    });
    window.dispatchEvent(new CustomEvent('minkoi:gpudetected', { detail: { software: isSoftwareGpu, backend: backendKind } }));

    window.addEventListener('resize', () => {
        resizeCanvas();
    }, { passive: true });
    resizeCanvas();
    updateAccentColor();

    // Render loop state
    let animationFrameId = null;
    let startTime = performance.now();
    let lastBackgroundPaint = 0;
    let smoothBass = 0.0;
    const freqData = new Uint8Array(32);

    const reducedMotionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    function shouldPauseFluid() {
        if (document.hidden || document.body?.classList.contains('zen-mode')) return true;
        if (reducedMotionMQ && reducedMotionMQ.matches) return true;
        return false;
    }

    const audioPlayerEl = document.getElementById('audio-player');
    const seekTrackEl = document.getElementById('seek-container');

    function render(now) {
        if (shouldPauseFluid()) {
            animationFrameId = null;
            lastBackgroundPaint = 0;
            return;
        }
        animationFrameId = requestAnimationFrame(render);

        // On software-rasterized or balanced-tier GPUs, pace low-frequency mist redraws
        // (slower drift when paused, yield during active scrubbing) so UI stays responsive.
        const effectiveCap = fluidFpsCap > 0
            ? (audioPlayerEl && !audioPlayerEl.paused ? Math.max(fluidFpsCap, 20) : Math.min(fluidFpsCap, 12))
            : 0;
        if (effectiveCap > 0) {
            if (seekTrackEl && seekTrackEl.classList.contains('is-scrubbing')) return;
            const minInterval = 1000 / effectiveCap;
            if (lastBackgroundPaint && (now - lastBackgroundPaint) < minInterval) return;
        }

        const elapsed = (now - startTime) * 0.001;

        // Frequency-based mapping survives changes to the shared FFT size.
        let targetBass = 0.0;
        const analyser = window.__minkoiAnalyser;
        if (analyser && (!audioPlayerEl || !audioPlayerEl.paused)) {
            try {
                // Reuse the soundstage's per-frame spectrum when available;
                // otherwise read directly. This avoids a second spectrum read.
                const features = window.MinkoiAudioFeatures;
                let bins = features && typeof features.getSpectrum === 'function'
                    ? features.getSpectrum(analyser, now) : null;
                if (!bins) {
                    analyser.getByteFrequencyData(freqData);
                    bins = freqData;
                }
                let sum = 0;
                const hzPerBin = analyser.context.sampleRate / analyser.fftSize;
                const first = Math.max(1, Math.floor(35 / hzPerBin));
                const last = Math.min(bins.length, Math.ceil(180 / hzPerBin));
                const binCount = Math.max(1, last - first);
                for (let i = first; i < last; i++) {
                    sum += bins[i];
                }
                const avg = sum / binCount;
                targetBass = Math.max(0.0, (avg - 25) / 230); // Noise floor subtraction
            } catch (_) {}
        }

        // Exponential smoothing (lerp)
        const dt = lastBackgroundPaint ? Math.min(120, now - lastBackgroundPaint) : 16.67;
        smoothBass += (targetBass - smoothBass) * (1 - Math.exp(-dt / 110));
        lastBackgroundPaint = now;

        if (contextLost && !ctx2d) return;
        if (gpuRenderer && !contextLost) {
            gpuRenderer.renderFrame(canvas.width, canvas.height, elapsed, smoothBass, currentAccent);
            return;
        }
        if (gl && program && !contextLost) {
            gl.uniform2f(uResLoc, canvas.width, canvas.height);
            gl.uniform1f(uTimeLoc, elapsed);
            gl.uniform1f(uBassLoc, smoothBass);
            gl.uniform3f(uAccentLoc, currentAccent[0], currentAccent[1], currentAccent[2]);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            return;
        }
        if (ctx2d) {
            const targetC = fallbackCanvas2d || canvas;
            const w = targetC.width;
            const h = targetC.height;
            ctx2d.clearRect(0, 0, w, h);
            const cx = w * (0.5 + 0.14 * Math.sin(elapsed * 0.18));
            const cy = h * (0.45 + 0.12 * Math.cos(elapsed * 0.14));
            const r = Math.max(w, h) * (0.65 + smoothBass * 0.2);
            const grad = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, r);
            const a = Math.min(0.65, 0.24 + smoothBass * 0.35);
            const cr = Math.round(currentAccent[0] * 255);
            const cg = Math.round(currentAccent[1] * 255);
            const cb = Math.round(currentAccent[2] * 255);
            grad.addColorStop(0, `rgba(${cr},${cg},${cb},${a.toFixed(3)})`);
            grad.addColorStop(1, 'rgba(5,8,18,0.12)');
            ctx2d.fillStyle = grad;
            ctx2d.fillRect(0, 0, w, h);
        }
    }

    function startLoop() {
        if (shouldPauseFluid()) {
            stopLoop();
            return;
        }
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(render);
        }
    }

    function stopLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Tab visibility, bfcache lifecycle, and accessibility lifecycle.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopLoop();
            lastBackgroundPaint = 0;
        } else {
            lastBackgroundPaint = 0;
            startLoop();
        }
    });

    window.addEventListener('pagehide', () => {
        stopLoop();
        lastBackgroundPaint = 0;
    });
    window.addEventListener('pageshow', () => {
        lastBackgroundPaint = 0;
        startLoop();
    });

    window.addEventListener('minkoi:zenchange', () => {
        if (shouldPauseFluid()) stopLoop();
        else startLoop();
    });

    if (reducedMotionMQ && typeof reducedMotionMQ.addEventListener === 'function') {
        reducedMotionMQ.addEventListener('change', () => {
            if (shouldPauseFluid()) stopLoop();
            else startLoop();
        });
    }

    startLoop();
})();
