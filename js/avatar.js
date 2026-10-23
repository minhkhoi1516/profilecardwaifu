/* ========================================================
   MINKOI · PERSONA & VISUAL IDENTITY ENGINE
   Random banner pool, crossfade, theme tokens, asset preload
======================================================= */
(function() {
    'use strict';

    const avatarImg = document.getElementById('char-avatar');
    const avatarZone = document.getElementById('avatar-zone-wrap');
    const heroBanner = document.getElementById('hero-banner-img');
    const personaContainer = document.getElementById('persona-selector');
    const personaRoleEl = document.getElementById('persona-role-text');
    const personaCountEl = document.getElementById('persona-count');
    const bannerStage = document.getElementById('banner-stage');

    function safeStorageGet(key) {
        try { return localStorage.getItem(key); } catch (_) { return null; }
    }

    function safeStorageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (_) { /* private mode */ }
    }

    const personas = CONFIG.personas || [];
    const playablePersonas = personas.filter(p => p.available);

    let currentIndex = parseInt(safeStorageGet('minkoi_persona_index') || '0', 10);
    if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= personas.length || !personas[currentIndex].available) {
        currentIndex = 0;
    }

    // Remember the last banner variant per persona so the same image never repeats twice in a row.
    const lastBannerPick = new Map();
    let currentBannerSrc = '';

    function isMobileViewport() {
        return window.innerWidth <= 768;
    }

    function bannerPool(persona) {
        if (!persona.banners) return [];
        const pool = isMobileViewport() ? persona.banners.phone : persona.banners.pc;
        return Array.isArray(pool) ? pool.slice() : [];
    }

    function pickBanner(persona) {
        const pool = bannerPool(persona);
        if (pool.length === 0) return '';
        if (pool.length === 1) return pool[0];

        const last = lastBannerPick.get(persona.key);
        const candidates = pool.filter(src => src !== last);
        const chosen = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
        lastBannerPick.set(persona.key, chosen);
        return chosen;
    }

    // Preload persona assets for immediate zero-latency switching
    function preloadAssets() {
        personas.filter(p => p.available).forEach(p => {
            if (p.avatar) {
                const av = new Image();
                av.decoding = 'async';
                av.src = p.avatar;
            }
            ['pc', 'phone'].forEach(mode => {
                (p.banners?.[mode] || []).forEach(src => {
                    const img = new Image();
                    img.decoding = 'async';
                    img.src = src;
                });
            });
        });
    }

    // Apply color tokens based on active persona
    function applyPersonaTokens(persona) {
        const root = document.documentElement;
        root.style.setProperty('--color-accent', persona.accent);
        root.style.setProperty('--color-accent-secondary', persona.accentSecondary);
        root.style.setProperty('--color-accent-glow', persona.accentGlow);
    }

    // Render persona selector buttons (placeholder slot included, disabled)
    function renderPersonaSelector() {
        if (!personaContainer) return;
        personaContainer.innerHTML = '';

        personas.forEach((persona, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `persona-chip ${idx === currentIndex ? 'active' : ''}${persona.available ? '' : ' soon'}`;
            btn.dataset.index = idx;
            btn.dataset.key = persona.key;

            if (!persona.available) {
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
                btn.setAttribute('aria-label', 'Slot waifu tiếp theo — Coming Soon');
                btn.setAttribute('title', 'Coming Soon');
                btn.innerHTML = `
                    <span class="persona-avatar-preview soon-preview">
                        <i class="fas fa-sparkles" aria-hidden="true"></i>
                    </span>
                    <span class="persona-meta">
                        <span class="persona-name">Coming Soon</span>
                        <span class="persona-tag">New Persona</span>
                    </span>
                `;
            } else {
                btn.setAttribute('aria-label', `Select visual persona: ${persona.name}`);
                btn.setAttribute('title', `${persona.name} · ${persona.role}`);
                btn.innerHTML = `
                    <span class="persona-avatar-preview">
                        <img src="${persona.avatar}" alt="${persona.name}" decoding="sync">
                    </span>
                    <span class="persona-meta">
                        <span class="persona-name">${persona.name}</span>
                        <span class="persona-tag">${persona.role}</span>
                    </span>
                `;
                btn.addEventListener('click', () => setPersona(idx, true));
            }

            personaContainer.appendChild(btn);
        });

        if (personaCountEl) {
            personaCountEl.textContent = `${playablePersonas.length} PERSONAS · CLICK TO EQUIP`;
        }
    }

    function updatePersonaText(persona) {
        if (personaRoleEl) personaRoleEl.textContent = `${persona.role} · ${persona.title}`;
    }

    function updateBannerLayers(persona) {
        const src = pickBanner(persona);

        if (bannerStage) {
            const layers = bannerStage.querySelectorAll('.banner-layer');
            layers.forEach((layer, idx) => {
                const isActive = idx === currentIndex;
                layer.classList.toggle('active', isActive);
                if (isActive) {
                    layer.style.backgroundImage = src ? `url('${src}')` : 'none';
                }
            });
        }

        if (heroBanner && src) {
            heroBanner.style.opacity = '0.4';
            const img = new Image();
            img.onload = () => {
                heroBanner.src = src;
                heroBanner.style.opacity = '1';
            };
            img.src = src;
        }

        currentBannerSrc = src;
    }

    function applyAvatar(persona, animate) {
        if (!avatarImg) return;
        const src = persona.avatar;
        if (!src) {
            avatarZone?.classList.add('avatar-fallback');
            return;
        }

        const paint = () => {
            avatarImg.src = src;
            avatarImg.alt = `${persona.name} Portrait`;
            avatarImg.style.display = '';
            avatarZone?.classList.remove('avatar-fallback');
        };

        if (!animate) {
            paint();
            return;
        }

        avatarImg.style.opacity = '0.25';
        avatarImg.style.transform = 'translateX(-50%) scale(0.96)';
        setTimeout(() => {
            paint();
            avatarImg.style.opacity = '1';
            avatarImg.style.transform = 'translateX(-50%) scale(1)';
        }, 120);
    }

    let currentPersona = null;

    function setPersona(index, persist) {
        const persona = personas[index];
        if (!persona || !persona.available) return;
        if (currentPersona && currentPersona.key === persona.key && !persist) {
            // still refresh visuals on resize
        }

        currentIndex = index;
        currentPersona = persona;
        safeStorageSet('minkoi_persona_index', index.toString());

        applyPersonaTokens(persona);
        updatePersonaText(persona);
        updateBannerLayers(persona);
        applyAvatar(persona, persist);

        // Update ambient particle mode (Sakura petals, snowflakes, stardust)
        if (typeof window.setAmbientParticleMode === 'function') {
            window.setAmbientParticleMode(index);
        }

        // Play gentle magic chime SFX when manually switched
        if (persist && typeof window.playChimeSFX === 'function') {
            window.playChimeSFX();
        }

        // Update active chip state + aria-selected
        if (personaContainer) {
            personaContainer.querySelectorAll('.persona-chip').forEach((chip, idx) => {
                const active = idx === index;
                chip.classList.toggle('active', active);
                chip.setAttribute('aria-selected', active ? 'true' : 'false');
            });
        }

        // Sync player album art
        const playerArt = document.getElementById('player-album-art');
        if (playerArt && persona.avatar) {
            playerArt.src = persona.avatar;
        }

        // Tell the audio module which persona was equipped (it keeps playing the current track)
        window.dispatchEvent(new CustomEvent('minkoi:persona', {
            detail: { index, key: persona.key, persona }
        }));
    }

    // Global hooks for other modules
    window.setPersona = setPersona;
    window.getCurrentPersonaIndex = () => currentIndex;
    window.getCurrentPersona = () => personas[currentIndex];
    window.getCurrentBanner = () => currentBannerSrc;

    // Graceful fallback when an avatar file is missing
    if (avatarImg) {
        avatarImg.addEventListener('error', () => {
            avatarZone?.classList.add('avatar-fallback');
            avatarImg.style.display = 'none';
        });
    }

    // Handle responsive banner resize (swap pc <-> phone artwork)
    let resizeTimer = null;
    let lastWasMobile = isMobileViewport();
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const mobile = isMobileViewport();
            if (mobile !== lastWasMobile) {
                lastWasMobile = mobile;
                const persona = personas[currentIndex];
                if (persona) updateBannerLayers(persona);
            }
        }, 200);
    }, { passive: true });

    // Interactive click on avatar zone switches to next available persona
    if (avatarZone) {
        avatarZone.addEventListener('click', () => {
            let next = currentIndex;
            for (let i = 0; i < personas.length; i++) {
                next = (next + 1) % personas.length;
                if (personas[next].available) break;
            }
            setPersona(next, true);
        });
    }

    // Initialization
    renderPersonaSelector();
    setPersona(currentIndex, false);
    window.requestAnimationFrame(() => preloadAssets());
})();
