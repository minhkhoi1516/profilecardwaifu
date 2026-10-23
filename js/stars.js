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
    let currentThemeMode = 'snow'; // 'snow' (Alya), 'stardust' (Mahiru), 'sakura' (Kaoruko/Miku), 'twilight' (Shinobu/Rikka)
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getThemeForPersona(index) {
        switch (index) {
            case 0: return 'snow';       // Alya Kujou: Snowflakes / Frost Sparkles
            case 1: return 'stardust';   // Shiina Mahiru: Golden Stardust
            case 2: return 'sakura';     // Waguri Kaoruko: Camellia / Sakura Petals
            case 3: return 'sakura';     // Sakura Miku: Sakura Petals
            case 4: return 'twilight';   // Shinobu Uzuki: Midnight Lavender Embers
            case 5: return 'twilight';   // Rikka Inohana: Soundwave Cyan Sparkles
            default: return 'snow';
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);
        initParticles();
    }

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
        } else {
            // Twilight Starlight (Shinobu & Rikka)
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
        // Optimal density: buttery smooth 60fps without battery drain
        const count = isMobile ? (currentThemeMode === 'sakura' ? 20 : 28) : (currentThemeMode === 'sakura' ? 38 : 65);

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

        // Delicate inner petal contour
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
    }

    function drawSnowflake(ctx, p, accentColor) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isCrystal ? '#e0f2fe' : '#ffffff';
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = p.isCrystal ? 6 : 2;
        ctx.fill();
        ctx.restore();
    }

    function drawStardust(ctx, p, accentColor) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
    }

    function render() {
        animationId = requestAnimationFrame(render);
        if (document.hidden) return; // Battery saving

        ctx.clearRect(0, 0, width, height);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#38bdf8';

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            if (!prefersReducedMotion) {
                if (p.type === 'sakura') {
                    p.swayAngle += p.swaySpeed;
                    p.rotation += p.rotSpeed;
                    p.flip += p.flipSpeed;
                    p.x += Math.sin(p.swayAngle) * 0.75 + p.speedX;
                    p.y += p.speedY;

                    if (p.y > height + 20) {
                        particles[i] = createParticle('sakura', false);
                    }
                    if (p.x > width + 20) p.x = -10;
                    if (p.x < -20) p.x = width + 10;
                } else if (p.type === 'snow') {
                    p.swayAngle += p.swaySpeed;
                    p.x += Math.sin(p.swayAngle) * 0.45 + p.speedX;
                    p.y += p.speedY;

                    if (p.y > height + 10) {
                        particles[i] = createParticle('snow', false);
                    }
                    if (p.x > width + 10) p.x = 0;
                    if (p.x < -10) p.x = width;
                } else {
                    // Stardust / Twilight
                    p.twinklePhase += p.twinkleSpeed;
                    p.alpha = p.baseAlpha + Math.sin(p.twinklePhase) * 0.18;
                    p.x += p.speedX;
                    p.y += p.speedY;

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
                drawSnowflake(ctx, p, accentColor);
            } else {
                drawStardust(ctx, p, accentColor);
            }
        }
    }

    // Dynamic Persona Hook: instantly adapt particle mode
    function setAmbientParticleMode(personaIndex) {
        const newMode = getThemeForPersona(personaIndex);
        if (newMode !== currentThemeMode) {
            currentThemeMode = newMode;
            initParticles();
        }
    }
    window.setAmbientParticleMode = setAmbientParticleMode;

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !animationId) {
            render();
        }
    });

    // Detect initial theme
    const initialIndex = parseInt(localStorage.getItem('mahikari_persona_index') || '0', 10);
    currentThemeMode = getThemeForPersona(isNaN(initialIndex) ? 0 : initialIndex);

    resize();
    render();
})();