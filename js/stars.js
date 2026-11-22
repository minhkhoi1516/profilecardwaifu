/* ========================================================
   MINKOI · ADAPTIVE AMBIENT PARTICLES ENGINE
   Sakura Petals, Crystalline Snowflakes & Golden Stardust
   Optimized 60fps Native Canvas Engine with Auto-Sleep
======================================================== */
(function() {
    'use strict';

    const canvas = document.getElementById('starry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let animationId = null;
    let lastParticlePaint = 0;
    let currentThemeMode = 'snow'; // 'snow' (Alya), 'stardust' (Mahiru), 'sakura' (Kaoruko/Miku), 'twilight' (Shinobu/Rikka)
    let zenActive = document.body.classList.contains('zen-mode');
    let zenEmphasis = zenActive ? 1 : 0;
    const particleSprites = new Map();

    // Cache small glowing sprites; moving particles still render at display cadence.
    // Shadow kernels are rasterized once per radius/color, not per particle/frame.
    function drawGlow(p, radius, color, glow, bubble = false) {
        const bucket = Math.max(0.5, Math.ceil(radius * 2) / 2);
        const family = p.type === 'snow' ? (p.isCrystal ? 0 : 1) : (bubble ? 2 : 3);
        const key = family * 64 + bucket * 2;
        let sprite = particleSprites.get(key);
        if (!sprite) {
            const extent = Math.ceil(bucket + glow * 2 + 2);
            const image = document.createElement('canvas');
            image.width = image.height = extent * 4;
            const paint = image.getContext('2d');
            if (!paint) return;
            paint.scale(2, 2);
            paint.beginPath();
            paint.arc(extent, extent, bucket, 0, Math.PI * 2);
            paint.shadowColor = color;
            paint.shadowBlur = glow;
            paint.fillStyle = bubble ? 'rgba(34, 211, 238, 0.22)' : color;
            if (bubble) {
                paint.strokeStyle = color;
                paint.lineWidth = 0.8;
                paint.stroke();
            }
            paint.fill();
            sprite = { image, extent };
            particleSprites.set(key, sprite);
        }
        const extent = sprite.extent * radius / bucket;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.drawImage(sprite.image, p.x - extent, p.y - extent, extent * 2, extent * 2);
        ctx.globalAlpha = 1;
    }

    function getThemeForPersona(index) {
        const persona = (typeof CONFIG !== 'undefined' && CONFIG.personas) ? CONFIG.personas[index] : null;
        if (persona && persona.particleTheme) return persona.particleTheme;
        switch (index) {
            case 0: return 'snow';       // Alya Kujou: Snowflakes / Frost Sparkles
            case 1: return 'stardust';   // Shiina Mahiru: Golden Stardust
            case 2: return 'sakura';     // Waguri Kaoruko: Camellia / Sakura Petals
            case 3: return 'sakura';     // Sakura Miku: Sakura Petals
            case 4: return 'twilight';   // Shinobu Uzuki: Midnight Lavender Embers
            case 5: return 'twilight';   // Konohana Hinako: Midnight Twilight Sparkles
            case 6: return 'ocean';      // Asanagi Umi: Tide of Dawn Aqua Bubbles
            default: return 'snow';
        }
    }

    let dprCap = 2;
    let maxDesktopPixels = 1050000;
    let pendingParticleReinit = 0;

    function resize(reinit = true) {
        width = window.innerWidth;
        height = window.innerHeight;
        const baseDpr = Math.min(window.devicePixelRatio || 1, dprCap);
        // Keep mobile untouched; bound desktop 2D canvas backing store so 1080p/4K
        // and Windows 150%-200% DPI displays avoid multi-megabyte uploads every frame.
        const areaScale = width >= 1024 ? Math.sqrt(maxDesktopPixels / Math.max(1, width * height)) : baseDpr;
        const scale = Math.max(0.5, Math.min(baseDpr, areaScale));
        canvas.width = Math.max(1, Math.floor(width * scale));
        canvas.height = Math.max(1, Math.floor(height * scale));
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        if (reinit) initParticles();
    }

    window.__setParticleDprCap = function(nextCap, nextMaxPixels) {
        const clamped = Math.max(1, Math.min(2, Number(nextCap) || 2));
        const clampedPixels = Number.isFinite(Number(nextMaxPixels))
            ? Math.max(520000, Math.min(1400000, Number(nextMaxPixels)))
            : (clamped < 1.5 ? 640000 : 1050000);
        if (Math.abs(clamped - dprCap) < 0.05 && Math.abs(clampedPixels - maxDesktopPixels) < 20000) return;
        dprCap = clamped;
        maxDesktopPixels = clampedPixels;
        resize(false);
    };

    function createParticle(mode, randomizeY = false) {
        const depth = Math.random();
        const startY = randomizeY ? Math.random() * height : -20;
        const startX = Math.random() * width;

        if (mode === 'sakura') {
            // Fluttering Sakura Blossom Petal
            return {
                type: 'sakura',
                x: startX,
                y: startY,
                size: depth * 6 + 5,
                speedY: depth * 0.9 + 0.6,
                speedX: (Math.random() - 0.3) * 0.8, // Gentle rightward wind
                swaySpeed: 0.015 + Math.random() * 0.02,
                swayAngle: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.025,
                flip: Math.random() * Math.PI,
                flipSpeed: 0.02 + Math.random() * 0.03,
                alpha: depth * 0.45 + 0.35,
                color: Math.random() > 0.4 ? 'rgba(255, 183, 197,' : 'rgba(251, 113, 133,'
            };
        } else if (mode === 'snow') {
            // Crystalline Winter Snowflake (Alya)
            return {
                type: 'snow',
                x: startX,
                y: startY,
                radius: depth * 2.2 + 0.8,
                speedY: depth * 0.85 + 0.45,
                speedX: (Math.random() - 0.5) * 0.4,
                swaySpeed: 0.01 + Math.random() * 0.015,
                swayAngle: Math.random() * Math.PI * 2,
                alpha: depth * 0.55 + 0.25,
                isCrystal: Math.random() > 0.65
            };
        } else if (mode === 'stardust') {
            // Celestial Upward Golden Stardust (Mahiru)
            return {
                type: 'stardust',
                x: startX,
                y: randomizeY ? Math.random() * height : height + 10,
                radius: depth * 1.4 + 0.5,
                speedY: -(depth * 0.25 + 0.1), // Drifting upward
                speedX: (Math.random() - 0.5) * 0.08,
                twinkleSpeed: 0.02 + Math.random() * 0.03,
                twinklePhase: Math.random() * Math.PI * 2,
                baseAlpha: depth * 0.4 + 0.2,
                alpha: depth * 0.4 + 0.2
            };
        } else if (mode === 'ocean') {
            // Tide of Dawn Aqua Water Bubbles & Sea Sparkles (Asanagi Umi)
            return {
                type: 'ocean',
                x: startX,
                y: randomizeY ? Math.random() * height : height + 15,
                radius: depth * 2.4 + 1.0,
                speedY: -(depth * 0.55 + 0.25),
                speedX: (Math.random() - 0.5) * 0.3,
                swaySpeed: 0.015 + Math.random() * 0.02,
                swayAngle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.03 + Math.random() * 0.04,
                twinklePhase: Math.random() * Math.PI * 2,
                alpha: depth * 0.5 + 0.3
            };
        } else {
            // Twilight Starlight (Shinobu & Hinako)
            return {
                type: 'twilight',
                x: startX,
                y: randomizeY ? Math.random() * height : height + 10,
                radius: depth * 1.5 + 0.6,
                speedY: -(depth * 0.35 + 0.15),
                speedX: (Math.random() - 0.5) * 0.1,
                twinkleSpeed: 0.025 + Math.random() * 0.035,
                twinklePhase: Math.random() * Math.PI * 2,
                baseAlpha: depth * 0.45 + 0.25,
                alpha: depth * 0.45 + 0.25
            };
        }
    }

    function initParticles() {
        particles = [];
        const isMobile = width < 768;
        const baseCount = isMobile ? (currentThemeMode === 'sakura' ? 20 : 28) : (currentThemeMode === 'sakura' ? 38 : 65);
        const count = baseCount;

        for (let i = 0; i < count; i++) {
            particles.push(createParticle(currentThemeMode, true));
        }
    }

    function drawSakuraPetal(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // 3D flipping simulation via y-scaling
        const flipScale = Math.sin(p.flip);
        ctx.scale(1, flipScale);

        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.4, s * 0.7, s * 0.6, 0, s);
        ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.8, -s * 0.4, 0, -s);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
    }

    function drawSnowflake(ctx, p) {
        const radius = p.radius * (1 + zenEmphasis * (0.6 + p.radius * 0.25));
        drawGlow(p, radius, p.isCrystal ? '#e0f2fe' : '#ffffff', p.isCrystal ? 6 : 2);
    }

    function drawStardust(ctx, p, accentColor) {
        drawGlow(p, p.radius * (1 + zenEmphasis * 0.85), accentColor, 4);
    }

    function drawOceanBubble(ctx, p, accentColor) {
        drawGlow(p, p.radius, accentColor, 3, true);
    }

    let cachedAccentColor = '#38bdf8';
    const reducedMotionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    function refreshCachedAccent(accentOverride) {
        const val = (typeof accentOverride === 'string' && accentOverride.trim())
            ? accentOverride.trim()
            : getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        if (val && val !== cachedAccentColor) {
            cachedAccentColor = val;
            particleSprites.clear();
        }
    }

    function shouldPauseParticles() {
        if (document.hidden) return true;
        if (reducedMotionMQ && reducedMotionMQ.matches) return true;
        return false;
    }

    function render(now) {
        if (shouldPauseParticles()) {
            animationId = null;
            lastParticlePaint = 0;
            return; // Battery & reduced-motion saving: truly pause loop
        }
        const time = Number.isFinite(now) ? now : performance.now();
        const dt = lastParticlePaint ? Math.min(64, Math.max(0, time - lastParticlePaint)) : 0;
        const step = dt * 0.06;
        lastParticlePaint = time;
        zenEmphasis += ((zenActive ? 1 : 0) - zenEmphasis) * (1 - Math.exp(-dt / 260));
        animationId = requestAnimationFrame(render);

        ctx.clearRect(0, 0, width, height);
        const accentColor = (currentThemeMode === 'stardust') ? (cachedAccentColor || '#fbbf24') : (cachedAccentColor || '#38bdf8');

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            {
                if (p.type === 'sakura') {
                    p.swayAngle += p.swaySpeed * step;
                    p.rotation += p.rotSpeed * step;
                    p.flip += p.flipSpeed * step;
                    p.x += (Math.sin(p.swayAngle) * 0.75 + p.speedX) * step;
                    p.y += p.speedY * step;

                    if (p.y > height + 20) {
                        particles[i] = createParticle('sakura', false);
                    }
                    if (p.x > width + 20) p.x = -10;
                    if (p.x < -20) p.x = width + 10;
                } else if (p.type === 'snow') {
                    p.swayAngle += p.swaySpeed * step;
                    p.x += (Math.sin(p.swayAngle) * 0.45 + p.speedX) * step;
                    p.y += p.speedY * step;

                    if (p.y > height + 10) {
                        particles[i] = createParticle('snow', false);
                    }
                    if (p.x > width + 10) p.x = 0;
                    if (p.x < -10) p.x = width;
                } else if (p.type === 'ocean') {
                    p.swayAngle += p.swaySpeed * step;
                    p.x += (Math.sin(p.swayAngle) * 0.5 + p.speedX) * step;
                    p.y += p.speedY * step;

                    if (p.y < -15) {
                        particles[i] = createParticle('ocean', false);
                    }
                    if (p.x > width + 15) p.x = 0;
                    if (p.x < -15) p.x = width;
                } else {
                    // Stardust / Twilight
                    p.twinklePhase += p.twinkleSpeed * step;
                    p.alpha = p.baseAlpha + Math.sin(p.twinklePhase) * 0.18;
                    p.x += p.speedX * step;
                    p.y += p.speedY * step;

                    if (p.y < -10) {
                        particles[i] = createParticle(currentThemeMode, false);
                    }
                    if (p.x > width + 10) p.x = 0;
                    if (p.x < -10) p.x = width;
                }
            }

            if (p.type === 'sakura') {
                drawSakuraPetal(ctx, p);
            } else if (p.type === 'snow') {
                drawSnowflake(ctx, p);
            } else if (p.type === 'ocean') {
                drawOceanBubble(ctx, p, accentColor);
            } else {
                drawStardust(ctx, p, accentColor);
            }
        }
    }

    function startParticlesIfAllowed() {
        if (shouldPauseParticles()) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            ctx.clearRect(0, 0, width, height);
            return;
        }
        if (!animationId) render();
    }

    // Dynamic Persona Hook: adapt particle mode without forcing synchronous style recalc
    function setAmbientParticleMode(personaIndex, accentOverride) {
        const persona = (typeof CONFIG !== 'undefined' && CONFIG.personas) ? CONFIG.personas[personaIndex] : null;
        refreshCachedAccent(accentOverride || persona?.accent);
        const newMode = getThemeForPersona(personaIndex);
        if (newMode !== currentThemeMode) {
            currentThemeMode = newMode;
            if (!pendingParticleReinit) {
                pendingParticleReinit = requestAnimationFrame(() => {
                    pendingParticleReinit = 0;
                    initParticles();
                });
            }
        }
        startParticlesIfAllowed();
    }
    window.setAmbientParticleMode = setAmbientParticleMode;

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize(true);
            startParticlesIfAllowed();
        }, 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            lastParticlePaint = 0;
        } else {
            lastParticlePaint = 0;
            startParticlesIfAllowed();
        }
    });

    window.addEventListener('pagehide', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        lastParticlePaint = 0;
    });
    window.addEventListener('pageshow', () => {
        lastParticlePaint = 0;
        startParticlesIfAllowed();
    });

    window.addEventListener('minkoi:themechange', () => refreshCachedAccent());
    window.addEventListener('minkoi:persona', (e) => {
        const accent = e?.detail?.persona?.accent;
        if (accent) refreshCachedAccent(accent);
    });
    window.addEventListener('minkoi:zenchange', () => {
        zenActive = document.body.classList.contains('zen-mode');
        const currentPersona = typeof window.getCurrentPersona === 'function' ? window.getCurrentPersona() : null;
        refreshCachedAccent(currentPersona?.accent);
        startParticlesIfAllowed();
    });

    if (reducedMotionMQ && typeof reducedMotionMQ.addEventListener === 'function') {
        reducedMotionMQ.addEventListener('change', () => startParticlesIfAllowed());
    }

    // Detect initial theme
    let initialIndex = 0;
    try { initialIndex = parseInt(localStorage.getItem('minkoi_persona_index') || localStorage.getItem('mahikari_persona_index') || '0', 10); } catch (_) {}
    currentThemeMode = getThemeForPersona(isNaN(initialIndex) ? 0 : initialIndex);
    refreshCachedAccent();

    resize();
    startParticlesIfAllowed();
})();
