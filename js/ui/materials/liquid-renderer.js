/* ==========================================================================
   MINKOI 5.6 · INDEPENDENT LIQUID GLASS MATERIAL RENDERER (RECONSTRUCTED)
   --------------------------------------------------------------------------
   Optical GLSL ES 3.00 WebGL2 renderer porting verified Apache-2.0 upstream
   shaders with true translucency, exact squircle/capsule geometry alignment,
   and Beer-Lambert luminance-adaptive readability:
     1. Kyant0/AndroidLiquidGlass (io.github.kyant0:backdrop:2.0.1, Shaders.kt):
        - circleMap, RoundedRectRefractionWithDispersion (7-band rim dispersion),
          interior lens convexity magnification, DefaultHighlight directional falloff.
     2. Miuix (top.yukonga.miuix.kmp:miuix-material:0.9.5-rc01, EdgeStrokeShader.kt):
        - Light-only razor-thin dual-light bevel stroke ("alpha stays at zero so a
          transparent surface never gains opacity from the rim") + outer-third rim.
     3. COUI (io.github.suqi8.coui.kmp:coui-squircle:2.1.0, SoftCapsule):
        - Continuous SoftCapsule SDF + matched Superellipse squircle SDF (n=3.8)
          aligned 1:1 with CSS `corner-shape: squircle` inside `.liquid-glass-backing`.

   Visual & Architectural Guarantees:
     - Visibly clearer & more transparent than Frosted (never an opaque grey slab).
     - Exact 1:1 background UV mapping (`background-size: cover; center 22%`).
     - Dedicated `.liquid-glass-backing` (`inset: 0; border-radius: inherit;
       corner-shape: inherit; overflow: hidden`) guarantees 0.0px corner alignment
       while preserving `.now-playing-stage { overflow: visible }` for pop-out chibi.
     - Single unified glass border: `[data-liquid-ready="true"]` lets CSS yield
       competing background/sheen/border to this renderer (zero double borders!).
     - Zero GPU allocation in Frosted mode; clean release on deactivate/hidden;
       full WebGL context-loss -> translucent Canvas2D fallback -> restore.
   ========================================================================== */
(function (global) {
    'use strict';

    const doc = global.document;
    if (!doc) return;

    const HAS_CSS_SQUIRCLE = Boolean(
        global.CSS && typeof global.CSS.supports === 'function' && global.CSS.supports('corner-shape', 'squircle')
    );

    const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
    vec2 p = POS[gl_VertexID];
    vUv = p * 0.5 + 0.5;
    gl_Position = vec4(p, 0.0, 1.0);
}`;

    // Reconstructed Optical Liquid Glass Fragment Shader:
    // True transparent crystal refraction + exact squircle/capsule SDF + light-only thin rim
    const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uBannerTex;
uniform float uHasBanner;
uniform vec2 uSize;              // Surface CSS px (w, h)
uniform vec2 uViewport;          // Viewport CSS px (vw, vh)
uniform vec4 uRect;              // Surface viewport rect (left, top, w, h)
uniform vec2 uBannerSize;        // Natural banner size (w, h)
uniform float uRadius;           // Exact computed corner radius px
uniform float uSquircleExp;      // 3.8 = CSS squircle, 2.0 = circular rounded rect
uniform float uCapsuleMix;       // 0.0 = squircle/rounded rect, 1.0 = COUI SoftCapsule
uniform float uRefractionHeight; // Rim meniscus depth in px
uniform float uRefractionAmount; // Backdrop displacement in px
uniform float uConvexity;        // Interior optical lens magnification factor
uniform float uDispersion;       // Restrained 7-band edge dispersion
uniform float uSurfaceRole;      // 0 = now-playing-stage, 1 = liquid-capsule, 2 = zen-mini-dock
uniform float uIsLight;          // 1.0 = light mode, 0.0 = dark mode
uniform vec3 uAccent;            // Active persona accent RGB [0..1]
uniform vec2 uLightDir;          // Normalized studio light vector

// --- Backdrop Shaders.kt: sdRoundedRect ---
float sdRoundedRect(vec2 p, vec2 hs, float radius) {
    float r = min(radius, min(hs.x, hs.y));
    vec2 q = abs(p) - (hs - vec2(r));
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// --- Matched Superellipse Squircle SDF (aligns with CSS corner-shape: squircle) ---
float sdSquircleBox(vec2 p, vec2 hs, float radius, float n) {
    float r = min(radius, min(hs.x, hs.y));
    vec2 q = abs(p) - (hs - vec2(r));
    vec2 m = max(q, 0.0);
    float lp = pow(pow(m.x, n) + pow(m.y, n) + 1e-12, 1.0 / n) - r;
    float inside = min(max(q.x, q.y), 0.0);
    return lp + inside;
}

// --- COUI coui-squircle SoftCapsule SDF (v2.1.0, Apache-2.0) ---
float sdCouiSoftCapsule(vec2 p, vec2 halfSize) {
    bool vertical = halfSize.x < halfSize.y;
    vec2 hs = vertical ? halfSize.yx : halfSize;
    vec2 pl = vertical ? p.yx : p;
    float rc = hs.y;
    float a = max(hs.x - rc, 0.0);
    vec2 qc = sqrt(pl * pl + vec2(1.0));
    float scScale = rc * 0.0125;
    float kMax = max(26.6 * scScale, 1e-4);
    float xBand = max(70.0 * scScale, 1e-3);
    float yBand = max(60.0 * scScale, 1e-3);
    float sc = qc.x - a;
    float xSoft = 0.5 * (sc + sqrt(sc * sc + kMax * kMax));
    float wx = 1.0 - smoothstep(0.0, xBand, abs(sc));
    float wy = smoothstep(rc - yBand, rc, qc.y);
    float xc = mix(max(sc, 0.0), xSoft, clamp(wx * wy, 0.0, 1.0));
    return length(vec2(xc, qc.y)) - rc;
}

float evalSdf(vec2 p, vec2 hs, float r) {
    float dBox = (uSquircleExp > 2.05)
        ? sdSquircleBox(p, hs, r, uSquircleExp)
        : sdRoundedRect(p, hs, r);
    if (uCapsuleMix <= 0.001) return dBox;
    return mix(dBox, sdCouiSoftCapsule(p, hs), uCapsuleMix);
}

vec2 evalGrad(vec2 p, vec2 hs, float r) {
    const float eps = 0.75;
    float gx = evalSdf(p + vec2(eps, 0.0), hs, r) - evalSdf(p - vec2(eps, 0.0), hs, r);
    float gy = evalSdf(p + vec2(0.0, eps), hs, r) - evalSdf(p - vec2(0.0, eps), hs, r);
    vec2 g = vec2(gx, gy);
    float len = length(g);
    return len > 1e-5 ? (g / len) : vec2(0.0, -1.0);
}

// --- Backdrop Shaders.kt: circleMap ---
float circleMap(float x) {
    float c = clamp(x, 0.0, 1.0);
    return 1.0 - sqrt(max(0.0, 1.0 - c * c));
}

// Exact CSS background-size: cover; background-position: center 22% mapping!
vec2 viewportPxToBannerUv(vec2 vpPx) {
    float scale = max(uViewport.x / max(uBannerSize.x, 1.0), uViewport.y / max(uBannerSize.y, 1.0));
    float drawW = uBannerSize.x * scale;
    float drawH = uBannerSize.y * scale;
    float ox = (uViewport.x - drawW) * 0.5;
    float oy = (uViewport.y - drawH) * 0.22;
    vec2 uv = (vpPx - vec2(ox, oy)) / max(vec2(drawW, drawH), vec2(1.0));
    return clamp(uv, vec2(0.002), vec2(0.998));
}

vec3 sampleBannerCrystal(vec2 vpPx, float lodLevel) {
    if (uHasBanner < 0.5) {
        vec3 base = mix(vec3(0.09, 0.12, 0.19), vec3(0.95, 0.94, 0.91), uIsLight);
        return mix(base, uAccent, 0.14);
    }
    return textureLod(uBannerTex, viewportPxToBannerUv(vpPx), lodLevel).rgb;
}

vec3 applyVibrancy(vec3 col, float satBoost) {
    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    return clamp(mix(vec3(luma), col, satBoost), 0.0, 1.0);
}

void main() {
    // Flip Y so coord=(0,0) is top-left in CSS px
    vec2 coord = vec2(vUv.x, 1.0 - vUv.y) * uSize;
    vec2 halfSize = uSize * 0.5;
    vec2 centered = coord - halfSize;

    float sd = evalSdf(centered, halfSize, uRadius);
    // Miuix GlassMaskShader anti-aliased edge coverage
    float cov = clamp(0.5 - sd, 0.0, 1.0);
    if (cov <= 0.001) {
        outColor = vec4(0.0);
        return;
    }

    vec2 vpCoord = uRect.xy + coord;
    float innerSd = min(sd, 0.0);
    vec2 grad = evalGrad(centered, halfSize, uRadius);

    bool isCapsule = (uSurfaceRole > 0.5 && uSurfaceRole < 1.5);
    bool isZenDock = (uSurfaceRole >= 1.5);

    // Crystal-clear hardware mipmap LODs (visibly clearer than matte Frosted blur!)
    float interiorLod = isCapsule ? 0.65 : (isZenDock ? 0.95 : 1.15);
    float rimLod      = isCapsule ? 0.25 : (isZenDock ? 0.35 : 0.45);

    // Gentle optical convexity across the interior pane (real curved lens feel)
    vec2 convexVp = vpCoord - centered * uConvexity;
    float edgeFactor = 0.0;
    vec3 glassRgb;

    // --- Backdrop 2.0.1 RoundedRectRefractionWithDispersion ---
    if (-innerSd < uRefractionHeight && uRefractionHeight > 0.5) {
        float rimT = 1.0 - (-innerSd / uRefractionHeight);
        edgeFactor = rimT;
        float d = circleMap(rimT) * uRefractionAmount;
        float cLen = length(centered);
        vec2 radial = cLen > 1e-4 ? (centered / cLen) : vec2(0.0);
        vec2 refractDir = normalize(grad + 0.22 * radial + vec2(1e-5));
        vec2 refractedVp = convexVp + d * refractDir;

        float dispFactor = uDispersion * ((centered.x * centered.y) / max(halfSize.x * halfSize.y, 1.0));
        vec2 dispVec = d * refractDir * dispFactor;

        vec3 red    = sampleBannerCrystal(refractedVp + dispVec, rimLod);
        vec3 orange = sampleBannerCrystal(refractedVp + dispVec * (2.0 / 3.0), rimLod);
        vec3 yellow = sampleBannerCrystal(refractedVp + dispVec * (1.0 / 3.0), rimLod);
        vec3 green  = sampleBannerCrystal(refractedVp, rimLod + 0.12);
        vec3 cyan   = sampleBannerCrystal(refractedVp - dispVec * (1.0 / 3.0), rimLod);
        vec3 blue   = sampleBannerCrystal(refractedVp - dispVec * (2.0 / 3.0), rimLod);
        vec3 purple = sampleBannerCrystal(refractedVp - dispVec, rimLod);

        glassRgb = vec3(0.0);
        glassRgb.r += red.r / 3.5 + orange.r / 3.5 + yellow.r / 3.5 + purple.r / 7.0;
        glassRgb.g += orange.g / 7.0 + yellow.g / 3.5 + green.g / 3.5 + cyan.g / 3.5;
        glassRgb.b += cyan.b / 3.0 + blue.b / 3.0 + purple.b / 3.0;
    } else {
        glassRgb = sampleBannerCrystal(convexVp, interiorLod);
    }

    // Per-pixel Beer-Lambert luminance-adaptive optical calibration:
    // Keeps Liquid visibly clearer & more transparent than Frosted while
    // guaranteeing crisp ink legibility on both bright & dark anime artwork!
    float rawLuma = dot(glassRgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 col;
    float bodyAlpha;

    if (uIsLight < 0.5) {
        // DARK MODE CRYSTAL: absorb only excess luminance on bright art, never muddy grey
        float brightClamp = smoothstep(0.24, 0.78, rawLuma);
        float atten = isCapsule
            ? mix(0.68, 0.34, brightClamp)
            : (isZenDock ? mix(0.62, 0.28, brightClamp) : mix(0.68, 0.32, brightClamp));
        vec3 jewel = applyVibrancy(glassRgb * atten, 1.26);
        vec3 obsidianTint = mix(vec3(0.06, 0.08, 0.13), uAccent, isCapsule ? 0.18 : 0.09);
        float tintMix = isCapsule
            ? mix(0.20, 0.08, edgeFactor * edgeFactor)
            : (isZenDock ? mix(0.36, 0.14, edgeFactor * edgeFactor) : mix(0.26, 0.10, edgeFactor * edgeFactor));
        col = mix(jewel, obsidianTint, tintMix);
        // Subtle translucent interior rising cleanly along the refracted bevel
        bodyAlpha = isCapsule
            ? mix(0.46, 0.78, edgeFactor * edgeFactor)
            : (isZenDock ? mix(0.72, 0.90, edgeFactor * edgeFactor) : mix(0.60, 0.84, edgeFactor * edgeFactor));
    } else {
        // LIGHT MODE CRYSTAL: luminous porcelain glass — lift dark wallpaper shadows
        // so dark streaks never muddy black ink, while keeping refracted color & edge sparkle
        float darkLift = smoothstep(0.66, 0.10, rawLuma);
        vec3 airy = mix(glassRgb, vec3(0.965, 0.955, 0.935), darkLift * (isCapsule ? 0.48 : 0.62));
        airy = applyVibrancy(airy, 1.16);
        vec3 porcelainTint = mix(vec3(0.985, 0.978, 0.962), uAccent, isCapsule ? 0.12 : 0.05);
        float tintMix = isCapsule
            ? mix(0.26, 0.10, edgeFactor * edgeFactor)
            : (isZenDock ? mix(0.34, 0.14, edgeFactor * edgeFactor) : mix(0.36, 0.14, edgeFactor * edgeFactor));
        col = mix(airy, porcelainTint, tintMix);
        bodyAlpha = isCapsule
            ? mix(0.48, 0.80, edgeFactor * edgeFactor)
            : (isZenDock ? mix(0.72, 0.90, edgeFactor * edgeFactor) : mix(0.62, 0.86, edgeFactor * edgeFactor));
    }

    // --- Miuix EdgeStrokeShader (miuix-material 0.9.5-rc01, Apache-2.0) ---
    // "Light only: alpha stays thin so a transparent surface never gains muddy opacity."
    float strokeWidth = isCapsule ? 1.15 : 1.05;
    float rimBand = smoothstep(-strokeWidth - 0.5, -0.1, sd) * smoothstep(0.6, -0.1, sd);
    vec2 light1 = normalize(uLightDir);
    vec2 light2 = -light1;

    float d1 = max(dot(grad, light1), 0.0);
    float d2 = max(dot(grad, light2), 0.0);
    float peak1 = pow(d1, 2.9);
    float peak2 = pow(d2, 3.5);

    vec3 specTint = mix(vec3(1.0), mix(vec3(1.0), uAccent, 0.25), 0.45);
    float rimIntensity = isCapsule ? 1.0 : (isZenDock ? 0.88 : 0.72);
    float dualSpecular = (peak1 * mix(0.40, 0.72, uIsLight) + peak2 * mix(0.16, 0.28, uIsLight)) * rimIntensity;

    // Ultra-restrained Miuix outer-third meniscus sheen (no cloudy glare!)
    float outerThird = smoothstep(0.56, 1.0, edgeFactor);
    float crownSheen = outerThird * peak1 * mix(0.055, 0.11, uIsLight) * rimIntensity;

    // Razor-thin glass contour hairline
    vec3 edgeHairline = mix(vec3(1.0), vec3(0.24, 0.28, 0.34), uIsLight * 0.42);
    col = mix(col, edgeHairline, rimBand * mix(0.16, 0.22, uIsLight));
    col += specTint * (rimBand * dualSpecular + crownSheen);

    // Light-only rim subtly boosts alpha strictly on the 1px contour for crisp bevel definition
    float finalAlpha = cov * clamp(bodyAlpha + rimBand * (0.24 + dualSpecular * 0.25), 0.0, 0.96);
    outColor = vec4(clamp(col, 0.0, 1.0), finalAlpha);
}`;

    const surfaces = new Map();
    let active = false;
    let glCanvas = null;
    let gl = null;
    let program = null;
    let uniforms = null;
    let bannerTex = null;
    let bannerNaturalW = 1;
    let bannerNaturalH = 1;
    let hasBannerTex = false;
    let loadedBannerSrc = '';
    let contextLost = false;
    let detachContextRecovery = null;
    let backend = 'standby-frosted';
    let renderCount = 0;
    let lastRenderReason = 'init';
    let dirtyRaf = 0;
    let lightDirX = -0.55;
    let lightDirY = -0.83;
    let dprCap = 1.5;
    let uploadScratch = null;
    let uploadCtx = null;

    function hexToRgb01(hex) {
        if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return [0.22, 0.74, 0.97];
        return [
            parseInt(hex.slice(1, 3), 16) / 255,
            parseInt(hex.slice(3, 5), 16) / 255,
            parseInt(hex.slice(5, 7), 16) / 255
        ];
    }

    function compileShader(ctx, type, src) {
        const s = ctx.createShader(type);
        if (!s) return null;
        ctx.shaderSource(s, src);
        ctx.compileShader(s);
        if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
            ctx.deleteShader(s);
            return null;
        }
        return s;
    }

    function initWebGL() {
        if (gl && program && !contextLost) return true;
        try {
            if (!glCanvas) {
                glCanvas = doc.createElement('canvas');
                const onLost = () => {
                    contextLost = true;
                    backend = 'canvas2d-optical-fallback';
                    global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', backend);
                    if (active) scheduleRender();
                };
                const onRestored = () => {
                    contextLost = false;
                    program = null;
                    bannerTex = null;
                    hasBannerTex = false;
                    loadedBannerSrc = '';
                    if (active && initWebGL()) {
                        syncBannerTexture();
                        scheduleRender();
                    }
                };
                if (global.MinkoiGpuManager?.attachWebGLContextRecovery) {
                    detachContextRecovery = global.MinkoiGpuManager.attachWebGLContextRecovery(glCanvas, onLost, onRestored);
                } else {
                    glCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost(); });
                    glCanvas.addEventListener('webglcontextrestored', onRestored);
                }
            }
            const t0 = performance.now();
            const ctx = glCanvas.getContext('webgl2', {
                alpha: true,
                antialias: false,
                depth: false,
                stencil: false,
                premultipliedAlpha: false,
                preserveDrawingBuffer: true,
                powerPreference: 'default'
            });
            if (!ctx) {
                backend = 'canvas2d-optical-fallback';
                global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', backend);
                return false;
            }
            const vs = compileShader(ctx, ctx.VERTEX_SHADER, VERT_SRC);
            const fs = compileShader(ctx, ctx.FRAGMENT_SHADER, FRAG_SRC);
            if (!vs || !fs) {
                if (vs) ctx.deleteShader(vs);
                if (fs) ctx.deleteShader(fs);
                backend = 'canvas2d-optical-fallback';
                global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', backend);
                return false;
            }
            const prog = ctx.createProgram();
            ctx.attachShader(prog, vs);
            ctx.attachShader(prog, fs);
            ctx.linkProgram(prog);
            ctx.deleteShader(vs);
            ctx.deleteShader(fs);
            if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
                ctx.deleteProgram(prog);
                backend = 'canvas2d-optical-fallback';
                global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', backend);
                return false;
            }
            gl = ctx;
            program = prog;
            uniforms = {
                uBannerTex: gl.getUniformLocation(prog, 'uBannerTex'),
                uHasBanner: gl.getUniformLocation(prog, 'uHasBanner'),
                uSize: gl.getUniformLocation(prog, 'uSize'),
                uViewport: gl.getUniformLocation(prog, 'uViewport'),
                uRect: gl.getUniformLocation(prog, 'uRect'),
                uBannerSize: gl.getUniformLocation(prog, 'uBannerSize'),
                uRadius: gl.getUniformLocation(prog, 'uRadius'),
                uSquircleExp: gl.getUniformLocation(prog, 'uSquircleExp'),
                uCapsuleMix: gl.getUniformLocation(prog, 'uCapsuleMix'),
                uRefractionHeight: gl.getUniformLocation(prog, 'uRefractionHeight'),
                uRefractionAmount: gl.getUniformLocation(prog, 'uRefractionAmount'),
                uConvexity: gl.getUniformLocation(prog, 'uConvexity'),
                uDispersion: gl.getUniformLocation(prog, 'uDispersion'),
                uSurfaceRole: gl.getUniformLocation(prog, 'uSurfaceRole'),
                uIsLight: gl.getUniformLocation(prog, 'uIsLight'),
                uAccent: gl.getUniformLocation(prog, 'uAccent'),
                uLightDir: gl.getUniformLocation(prog, 'uLightDir')
            };
            bannerTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, bannerTex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([18, 22, 34, 255]));
            gl.generateMipmap(gl.TEXTURE_2D);

            // Grow-only shared offscreen WebGL2 buffer
            glCanvas.width = 768;
            glCanvas.height = 256;
            backend = 'webgl2-backdrop-miuix';
            global.MinkoiGpuManager?.recordShaderCompile?.(performance.now() - t0);
            global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', backend);
            return true;
        } catch (_) {
            backend = 'canvas2d-optical-fallback';
            global.MinkoiGpuManager?.setSubsystemBackend?.('glassOptical', backend);
            return false;
        }
    }

    function uploadBannerImage(img, src) {
        if (!active || !gl || !bannerTex || contextLost || !img || !img.naturalWidth) return;
        try {
            const maxDim = 512;
            const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
            const uw = Math.max(32, Math.round(img.naturalWidth * scale));
            const uh = Math.max(32, Math.round(img.naturalHeight * scale));
            if (!uploadScratch) {
                uploadScratch = doc.createElement('canvas');
                uploadCtx = uploadScratch.getContext('2d', { alpha: false });
            }
            let source = img;
            if (uploadCtx) {
                if (uploadScratch.width !== uw || uploadScratch.height !== uh) {
                    uploadScratch.width = uw;
                    uploadScratch.height = uh;
                }
                uploadCtx.drawImage(img, 0, 0, uw, uh);
                source = uploadScratch;
            }
            gl.bindTexture(gl.TEXTURE_2D, bannerTex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            gl.generateMipmap(gl.TEXTURE_2D);
            bannerNaturalW = img.naturalWidth;
            bannerNaturalH = img.naturalHeight;
            hasBannerTex = true;
            loadedBannerSrc = src;
            scheduleRender();
        } catch (_) {
            hasBannerTex = false;
        }
    }

    function resolveCurrentBannerSrc() {
        const fromApi = typeof global.getCurrentBanner === 'function' ? global.getCurrentBanner() : '';
        if (fromApi) return fromApi;
        const activeLayer = doc.querySelector('#banner-stage .banner-layer.active');
        if (activeLayer) {
            const bg = global.getComputedStyle(activeLayer).backgroundImage || '';
            const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
            if (m && m[1]) return m[1];
        }
        return '';
    }

    function syncBannerTexture() {
        if (!active || !gl || contextLost) return;
        const src = resolveCurrentBannerSrc();
        if (!src || src === loadedBannerSrc) return;
        const cached = global.MinkoiCache?.getBanner?.(src);
        if (cached?.image && cached.image.naturalWidth > 0) {
            uploadBannerImage(cached.image, src);
            return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
            if (!active) return;
            if (resolveCurrentBannerSrc() === src || !loadedBannerSrc) {
                uploadBannerImage(img, src);
            }
        };
        img.src = src;
    }

    // Translucent non-muddy Canvas2D fallback (used only when WebGL2 is unavailable or lost)
    function drawFallbackCanvas2D(ctx2d, w, h, entry, isLight, accentRgb) {
        ctx2d.clearRect(0, 0, w, h);
        const [r, g, b] = accentRgb.map((v) => Math.round(v * 255));
        const grad = ctx2d.createLinearGradient(0, 0, w, h);
        if (isLight) {
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.56)');
            grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.08)`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.34)');
        } else {
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
            grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.10)`);
            grad.addColorStop(1, 'rgba(14, 18, 28, 0.36)');
        }
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(0, 0, w, h);

        // Restrained top specular meniscus hairline
        const rim = ctx2d.createLinearGradient(0, 0, 0, Math.max(4, h * 0.25));
        rim.addColorStop(0, isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.28)');
        rim.addColorStop(1, 'rgba(255,255,255,0)');
        ctx2d.fillStyle = rim;
        ctx2d.fillRect(0, 0, w, Math.max(4, h * 0.25));
    }

    /**
     * Dedicated clipped backing child (`inset: 0; border-radius: inherit;
     * corner-shape: inherit; overflow: hidden`) so canvas pixels clip to the
     * exact host squircle/pill contour while host keeps `overflow: visible`
     * for unclipped pop-out chibi artwork!
     */
    function ensureSurfaceBacking(hostEl) {
        if (!hostEl || !hostEl.isConnected) return null;
        let backing = hostEl.querySelector(':scope > .liquid-glass-backing');
        if (!backing) {
            backing = doc.createElement('div');
            backing.className = 'liquid-glass-backing';
            backing.setAttribute('aria-hidden', 'true');
            const canvas = doc.createElement('canvas');
            canvas.className = 'minkoi-liquid-canvas minkoi-optical-surface';
            canvas.setAttribute('aria-hidden', 'true');
            backing.appendChild(canvas);
            hostEl.insertBefore(backing, hostEl.firstChild);
        }
        const canvas = backing.querySelector('canvas.minkoi-liquid-canvas');
        return { backing, canvas };
    }

    function hideAllSurfaces() {
        surfaces.forEach((entry) => {
            const host = typeof entry.resolveHost === 'function' ? entry.resolveHost() : entry.host;
            if (!host || !host.isConnected) return;
            host.removeAttribute('data-liquid-ready');
            host.removeAttribute('data-liquid-fallback');
            const backing = host.querySelector(':scope > .liquid-glass-backing');
            if (backing) backing.style.display = 'none';
        });
    }

    function resolveComputedRadius(hostEl, entry, rect) {
        if (entry.radius === 'pill') return rect.height * 0.5;
        const parsed = parseFloat(global.getComputedStyle(hostEl).borderTopLeftRadius);
        const r = Number.isFinite(parsed) && parsed > 0 ? parsed : (entry.radius || 20);
        return Math.min(r, Math.min(rect.width, rect.height) * 0.5);
    }

    function renderAllSurfaces() {
        dirtyRaf = 0;
        if (doc.hidden) return;
        if (!active) {
            hideAllSurfaces();
            return;
        }

        const isLight = doc.body.classList.contains('light-mode');
        const accentHex = global.getCurrentPersona?.()?.accent || '#38bdf8';
        const accentRgb = hexToRgb01(accentHex);
        const caps = global.MinkoiCapabilities?.getSnapshot?.();
        const effCap = caps?.isSoftwareGpu ? Math.min(dprCap, 0.85) : dprCap;
        const dpr = Math.min(global.devicePixelRatio || 1, effCap);
        const webglReady = initWebGL() && Boolean(gl && program && !contextLost);

        if (webglReady && !hasBannerTex) syncBannerTexture();

        surfaces.forEach((entry) => {
            const host = typeof entry.resolveHost === 'function' ? entry.resolveHost() : entry.host;
            if (!host || !host.isConnected) return;
            const pair = ensureSurfaceBacking(host);
            if (!pair || !pair.canvas) return;

            if (entry.onlyInZen && !doc.body.classList.contains('zen-mode')) {
                pair.backing.style.display = 'none';
                host.removeAttribute('data-liquid-ready');
                return;
            }

            const rect = host.getBoundingClientRect();
            if (rect.width < 12 || rect.height < 12) {
                pair.backing.style.display = 'none';
                host.removeAttribute('data-liquid-ready');
                return;
            }

            pair.backing.style.display = 'block';
            const canvas = pair.canvas;
            const targetW = Math.max(2, Math.round(rect.width * dpr));
            const targetH = Math.max(2, Math.round(rect.height * dpr));
            if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
            }
            const ctx2d = canvas.getContext('2d');
            if (!ctx2d) return;

            if (!webglReady) {
                host.setAttribute('data-liquid-fallback', 'true');
                host.removeAttribute('data-liquid-ready');
                drawFallbackCanvas2D(ctx2d, targetW, targetH, entry, isLight, accentRgb);
                renderCount++;
                return;
            }

            host.removeAttribute('data-liquid-fallback');
            host.setAttribute('data-liquid-ready', 'true');

            // Grow-only offscreen WebGL2 buffer: zero per-surface framebuffer reallocations
            if (glCanvas.width < targetW || glCanvas.height < targetH) {
                glCanvas.width = Math.max(glCanvas.width, targetW);
                glCanvas.height = Math.max(glCanvas.height, targetH);
            }

            const radiusPx = resolveComputedRadius(host, entry, rect);
            const isPill = radiusPx >= Math.min(rect.width, rect.height) * 0.46;
            const capsuleMixVal = entry.capsuleMix === 'auto' ? (isPill ? 0.85 : 0.0) : entry.capsuleMix;
            const useSquircleFlag = entry.useSquircle === 'auto' ? !isPill : Boolean(entry.useSquircle);
            const squircleExp = (useSquircleFlag && HAS_CSS_SQUIRCLE) ? 3.8 : 2.0;

            gl.enable(gl.SCISSOR_TEST);
            gl.viewport(0, 0, targetW, targetH);
            gl.scissor(0, 0, targetW, targetH);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, bannerTex);
            gl.uniform1i(uniforms.uBannerTex, 0);
            gl.uniform1f(uniforms.uHasBanner, hasBannerTex ? 1.0 : 0.0);
            gl.uniform2f(uniforms.uSize, rect.width, rect.height);
            gl.uniform2f(uniforms.uViewport, global.innerWidth || 1366, global.innerHeight || 768);
            gl.uniform4f(uniforms.uRect, rect.left, rect.top, rect.width, rect.height);
            gl.uniform2f(uniforms.uBannerSize, bannerNaturalW, bannerNaturalH);
            gl.uniform1f(uniforms.uRadius, radiusPx);
            gl.uniform1f(uniforms.uSquircleExp, squircleExp);
            gl.uniform1f(uniforms.uCapsuleMix, capsuleMixVal);
            gl.uniform1f(uniforms.uRefractionHeight, entry.refractionHeight);
            gl.uniform1f(uniforms.uRefractionAmount, entry.refractionAmount);
            gl.uniform1f(uniforms.uConvexity, entry.convexity);
            gl.uniform1f(uniforms.uDispersion, entry.dispersion);
            gl.uniform1f(uniforms.uSurfaceRole, entry.role);
            gl.uniform1f(uniforms.uIsLight, isLight ? 1.0 : 0.0);
            gl.uniform3f(uniforms.uAccent, accentRgb[0], accentRgb[1], accentRgb[2]);
            gl.uniform2f(uniforms.uLightDir, lightDirX, lightDirY);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disable(gl.SCISSOR_TEST);

            ctx2d.clearRect(0, 0, targetW, targetH);
            ctx2d.drawImage(glCanvas, 0, glCanvas.height - targetH, targetW, targetH, 0, 0, targetW, targetH);
            renderCount++;
        });
    }

    function scheduleRender(reason) {
        if (!active || doc.hidden || dirtyRaf) return;
        if (reason) lastRenderReason = reason;
        dirtyRaf = global.requestAnimationFrame(renderAllSurfaces);
    }

    function releaseScratchMemory() {
        if (uploadScratch) {
            uploadScratch.width = 1;
            uploadScratch.height = 1;
        }
    }

    function activate() {
        active = true;
        syncBannerTexture();
        scheduleRender('activate');
    }

    function deactivate() {
        active = false;
        if (dirtyRaf) {
            global.cancelAnimationFrame(dirtyRaf);
            dirtyRaf = 0;
        }
        hideAllSurfaces();
        releaseScratchMemory();
    }

    function registerSurface(id, config) {
        surfaces.set(id, config);
        if (active) scheduleRender();
    }

    function mountDefaultSurfaces() {
        // 1. Liquid Capsule pill inside #audio-category-nav (clear refractive droplet)
        registerSurface('liquid-capsule', {
            resolveHost: () => doc.querySelector('#audio-category-nav .liquid-glass-indicator'),
            radius: 'pill',
            useSquircle: false,
            capsuleMix: 1.0,
            refractionHeight: 13.0,
            refractionAmount: 11.0,
            convexity: 0.045,
            dispersion: 0.42,
            role: 1.0,
            onlyInZen: false
        });

        // 2. STUDIO AUDIO SUITE Now Playing Soundstage (matched squircle optical glass)
        registerSurface('now-playing-stage', {
            resolveHost: () => doc.querySelector('.now-playing-stage'),
            radius: 22.0,
            useSquircle: true,
            capsuleMix: 0.0,
            refractionHeight: 18.0,
            refractionAmount: 10.0,
            convexity: 0.025,
            dispersion: 0.26,
            role: 0.0,
            onlyInZen: false
        });

        // 3. Floating Zen Mini Dock (active strictly during Zen Mode — adapts between Desktop pill & Mobile 24px card)
        registerSurface('zen-mini-dock', {
            resolveHost: () => doc.getElementById('zen-mini-dock'),
            radius: 24.0,
            useSquircle: 'auto',
            capsuleMix: 'auto',
            refractionHeight: 16.0,
            refractionAmount: 10.5,
            convexity: 0.032,
            dispersion: 0.36,
            role: 2.0,
            onlyInZen: true
        });
    }

    // Subtle pointer-steered dual-light angle inside STUDIO AUDIO SUITE (cached rect on enter/resize!)
    let suiteRectCache = null;
    let lastPointerRender = 0;

    function initListeners() {
        const suite = doc.querySelector('.studio-audio-suite');
        if (suite) {
            const refreshSuiteRect = () => { suiteRectCache = suite.getBoundingClientRect(); };
            suite.addEventListener('pointerenter', refreshSuiteRect, { passive: true });
            suite.addEventListener('pointermove', (e) => {
                if (!active || e.pointerType !== 'mouse') return;
                const now = performance.now();
                if (now - lastPointerRender < 32) return;
                lastPointerRender = now;
                if (!suiteRectCache || !suiteRectCache.width) refreshSuiteRect();
                const r = suiteRectCache;
                if (!r || !r.width || !r.height) return;
                const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
                const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
                lightDirX = -0.55 + nx * 0.30;
                lightDirY = -0.83 + ny * 0.22;
                scheduleRender();
            }, { passive: true });
            global.addEventListener('resize', () => { suiteRectCache = null; }, { passive: true });
            global.addEventListener('scroll', () => { suiteRectCache = null; }, { passive: true });
        }

        let personaTimers = [];
        const refresh = (reason) => {
            if (!active) return;
            syncBannerTexture();
            scheduleRender(reason || 'refresh');
        };

        global.addEventListener('minkoi:persona', () => {
            personaTimers.forEach(clearTimeout);
            personaTimers = [];
            if (!active) return;
            refresh('persona-0');
            personaTimers.push(setTimeout(() => refresh('persona-240'), 240));
            personaTimers.push(setTimeout(() => refresh('persona-920'), 920));
        });
        global.addEventListener('minkoi:themechange', () => refresh('theme'));
        global.addEventListener('minkoi:zenchange', () => {
            if (!active) return;
            refresh('zen-0');
            setTimeout(() => refresh('zen-380'), 380);
        });
        global.addEventListener('minkoi:zen-artwork', () => refresh('zen-art'));
        global.addEventListener('resize', () => { if (active) scheduleRender('resize'); }, { passive: true });
        global.addEventListener('scroll', () => { if (active) scheduleRender('scroll'); }, { passive: true });
        doc.addEventListener('visibilitychange', () => {
            if (doc.hidden) {
                releaseScratchMemory();
            } else if (active) {
                refresh('visible');
            }
        });

        global.MinkoiGpuManager?.registerConsumer?.('liquid-renderer', (profile) => {
            const nextDpr = Math.min(1.5, Math.max(0.75, (profile?.dprCap || 1.5) * 0.85));
            if (Math.abs(nextDpr - dprCap) < 0.01) return;
            dprCap = nextDpr;
            if (active) scheduleRender('gpu-profile');
        });
    }

    function boot() {
        mountDefaultSurfaces();
        initListeners();
    }

    if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    const api = Object.freeze({
        id: 'liquid',
        activate,
        deactivate,
        notifySurfaceMotion: () => { if (active) scheduleRender('surface-motion'); },
        syncBannerTexture,
        registerSurface,
        getStats: () => ({
            renderer: 'liquid',
            active,
            liquidActive: active,
            backend: active ? backend : 'standby-frosted',
            hasBannerTex,
            bannerSrc: loadedBannerSrc,
            mountedSurfaces: surfaces.size,
            renderCount,
            lastRenderReason,
            contextLost,
            squircleMatched: HAS_CSS_SQUIRCLE,
            shaders: [
                'io.github.kyant0:backdrop:2.0.1/RoundedRectRefractionWithDispersion',
                'top.yukonga.miuix.kmp:miuix-material:0.9.5-rc01/EdgeStrokeShader+GlassRim',
                'io.github.suqi8.coui.kmp:coui-squircle:2.1.0/SoftCapsule+SuperellipseSquircle'
            ]
        })
    });

    global.MinkoiLiquidRenderer = api;
    // Backward-compatible diagnostic alias
    global.MinkoiBackdropGlass = api;
})(typeof window !== 'undefined' ? window : globalThis);
