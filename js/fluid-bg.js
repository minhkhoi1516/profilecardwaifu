/* ========================================================
   MINKOI · WEBGL AUDIO-REACTIVE FLUID BACKGROUND ENGINE
   Pure WebGL2/WebGL Shader with Bass Frequency Coupling
   Reacts organically to audio bass with zero external libraries
======================================================== */
(function() {
    'use strict';

    const canvas = document.getElementById('fluid-bg-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false }) ||
               canvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });

    if (!gl) return;

    // Vertex Shader: Fullscreen Clip Quad
    const vsSource = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    // Fragment Shader: Procedural Domain Warping Noise reactive to Bass & Persona Accent
    const fsSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_bass;
        uniform vec3 u_accent;

        // Fast procedural hash
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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

        // 3-Octave Fractional Brownian Motion (fBm)
        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
            for (int i = 0; i < 3; i++) {
                v += a * noise(p);
                p = rot * p * 2.04 + vec2(13.4, 1.7);
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            float t = u_time * 0.12;
            float bassImpact = u_bass * 0.65;

            // Two-stage Domain Warping
            vec2 q = vec2(
                fbm(p + vec2(0.0, t * 0.8)),
                fbm(p + vec2(t * 0.6, 0.0))
            );

            vec2 r = vec2(
                fbm(p + 2.2 * q + vec2(1.7, 9.2) + 0.15 * t + bassImpact * 0.3),
                fbm(p + 2.2 * q + vec2(8.3, 2.8) + 0.12 * t - bassImpact * 0.2)
            );

            float f = fbm(p + 3.0 * r + bassImpact * 0.5);

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

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
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

    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uBassLoc = gl.getUniformLocation(program, 'u_bass');
    const uAccentLoc = gl.getUniformLocation(program, 'u_accent');

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

    // Viewport resize handler with DPR clamp
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.round(window.innerWidth * dpr);
        const h = Math.round(window.innerHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }

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
        if (document.hidden) return true;
        if (reducedMotionMQ && reducedMotionMQ.matches) return true;
        const q = document.body ? document.body.getAttribute('data-quality') : '';
        return q === 'eco' || Boolean(document.body && document.body.classList.contains('low-end'));
    }

    function render(now) {
        if (shouldPauseFluid()) {
            animationFrameId = null;
            lastBackgroundPaint = 0;
            return;
        }
        // Full-screen shader competes with expensive glass compositing on phones.
        // Throttle the BACKGROUND only, never the foreground gesture animations.
        const touchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const mobileBackground = touchDevice || window.innerWidth <= 768;
        if (mobileBackground && lastBackgroundPaint && now - lastBackgroundPaint < 32) {
            animationFrameId = requestAnimationFrame(render);
            return;
        }
        lastBackgroundPaint = now;
        const elapsed = (now - startTime) * 0.001;

        // Query Analyser bass energy (bins 0-6 represent 20Hz - 150Hz)
        let targetBass = 0.0;
        const analyser = window.__minkoiAnalyser;
        if (analyser) {
            try {
                analyser.getByteFrequencyData(freqData);
                let sum = 0;
                const binCount = Math.min(8, freqData.length);
                for (let i = 0; i < binCount; i++) {
                    sum += freqData[i];
                }
                const avg = sum / binCount;
                targetBass = Math.max(0.0, (avg - 25) / 230); // Noise floor subtraction
            } catch (_) {}
        }

        // Exponential smoothing (lerp)
        smoothBass += (targetBass - smoothBass) * 0.14;

        gl.uniform2f(uResLoc, canvas.width, canvas.height);
        gl.uniform1f(uTimeLoc, elapsed);
        gl.uniform1f(uBassLoc, smoothBass);
        gl.uniform3f(uAccentLoc, currentAccent[0], currentAccent[1], currentAccent[2]);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
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

    // Tab visibility, quality mode & reduced motion listeners
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopLoop();
        } else {
            startLoop();
        }
    });

    window.addEventListener('minkoi:qualitychange', () => {
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
