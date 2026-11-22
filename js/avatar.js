/* ========================================================
   MINKOI · PERSONA & VISUAL IDENTITY ENGINE
   Random banner pool, crossfade, theme tokens, asset preload
======================================================= */
(function() {
    'use strict';

    const avatarImg = document.getElementById('char-avatar');
    const avatarZone = document.getElementById('avatar-zone-wrap');
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

    // ------------------------------------------------------------------
    // BANNER DOUBLE-BUFFER CROSSFADE ENGINE
    // Smoothly pre-decodes images off-screen and dissolves between two
    // layers so even same-persona randomizations (Zen mode) crossfade cleanly.
    // ------------------------------------------------------------------
    let bannerLoadSeq = 0;
    let bannerReleaseTimer = null;
    let bannerSwapFrame = 0;
    function releaseInactiveBannerTextures() {
        if (bannerStage) bannerStage.querySelectorAll('.banner-layer:not(.active)').forEach(layer => {
            layer.style.backgroundImage = 'none';
        });
        bannerReleaseTimer = null;
    }

    function pickBanner(persona) {
        const pool = bannerPool(persona);
        if (pool.length === 0) return '';
        if (pool.length === 1) return pool[0];

        const last = lastBannerPick.get(persona.key);
        const candidates = pool.filter(src => src !== last && src !== currentBannerSrc);
        const fallback = pool.filter(src => src !== currentBannerSrc);
        const usable = candidates.length > 0 ? candidates : (fallback.length > 0 ? fallback : pool);
        const chosen = usable[Math.floor(Math.random() * usable.length)] || pool[0];
        lastBannerPick.set(persona.key, chosen);
        return chosen;
    }

    // Progressive idle preload: load active persona first, others when idle
    function preloadAssets() {
        const active = personas[currentIndex];
        // Wallpapers decode on demand in updateBannerLayers. Loading every
        // variant here wastes bandwidth and decoded image memory on phones.
        if (navigator.connection?.saveData) return;

        const idleLoad = () => {
            personas.filter(p => p.available && p !== active).forEach(p => {
                if (p.avatar) {
                    const av = new Image();
                    av.decoding = 'async';
                    av.src = p.avatar;
                }
            });
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(idleLoad, { timeout: 3000 });
        } else {
            setTimeout(idleLoad, 1200);
        }
    }

    // Apply color tokens based on active persona
    function applyPersonaTokens(persona) {
        const root = document.documentElement;
        root.style.setProperty('--color-accent', persona.accent);
        root.style.setProperty('--color-accent-secondary', persona.accentSecondary);
        root.style.setProperty('--color-accent-glow', persona.accentGlow);
    }

    // Render persona selector buttons (including New Persona placeholder slot)
    function renderPersonaSelector() {
        if (!personaContainer) return;
        personaContainer.innerHTML = '';

        personas.forEach((persona, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            const isPlaceholder = persona.isPlaceholder || !persona.avatar;
            btn.className = `persona-chip ${isPlaceholder ? 'persona-chip-placeholder' : (idx === currentIndex ? 'active' : '')}`;
            btn.dataset.index = idx;
            btn.dataset.key = persona.key;
            btn.setAttribute('aria-label', `Persona: ${persona.name}`);
            btn.setAttribute('title', `${persona.name} · ${persona.title || persona.role}`);

            if (isPlaceholder) {
                btn.innerHTML = `
                    <span class="persona-avatar-preview placeholder-preview">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                    </span>
                    <span class="persona-meta">
                        <span class="persona-name">${persona.name}</span>
                        <span class="persona-tag">${persona.title || 'Add your waifu'}</span>
                    </span>
                `;
                btn.addEventListener('click', () => {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Coming soon ✨ Khe cắm Waifu mới!', 'fa-sparkles');
                    }
                });
            } else {
                btn.innerHTML = `
                    <span class="persona-avatar-preview">
                        <img src="${persona.avatar}" alt="${persona.name}" loading="eager" decoding="async" width="80" height="80">
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
            const activeCount = personas.filter(p => p.available).length;
            personaCountEl.textContent = `${activeCount} PERSONAS · CLICK TO EQUIP`;
        }
    }

    function updatePersonaText(persona) {
        if (personaRoleEl) personaRoleEl.textContent = `${persona.role} · ${persona.title}`;
    }

    function ensureBannerLayers() {
        if (!bannerStage) return;
        const currentLayers = bannerStage.querySelectorAll('.banner-layer');
        const needed = 2;
        if (currentLayers.length < needed) {
            for (let i = currentLayers.length; i < needed; i++) {
                const layer = document.createElement('div');
                layer.className = 'banner-layer';
                layer.dataset.index = i;
                bannerStage.appendChild(layer);
            }
        } else if (currentLayers.length > needed) {
            currentLayers.forEach((layer, i) => { if (i >= needed) layer.remove(); });
        }
    }

    function commitBannerCrossfade(src, immediate) {
        if (bannerSwapFrame) {
            window.cancelAnimationFrame(bannerSwapFrame);
            bannerSwapFrame = 0;
        }
        currentBannerSrc = src;
        if (!bannerStage) return;

        ensureBannerLayers();
        const layers = Array.from(bannerStage.querySelectorAll('.banner-layer'));
        if (layers.length === 0) return;

        const currentActive = layers.find(l => l.classList.contains('active')) || layers[0];
        if (immediate) {
            layers.forEach((layer) => {
                const isTarget = layer === currentActive;
                layer.classList.toggle('active', isTarget);
                if (isTarget) {
                    layer.style.backgroundImage = src ? `url('${src}')` : 'none';
                }
            });
            clearTimeout(bannerReleaseTimer);
            releaseInactiveBannerTextures();
            notifyZenArtwork(src);
            return;
        }

        // Always swap to an inactive standby buffer layer for true crossfade even within same persona
        const standby = layers.find(l => !l.classList.contains('active')) || layers.find(l => l !== currentActive) || layers[0];
        standby.style.backgroundImage = src ? `url('${src}')` : 'none';
        // Keep the inactive standby buffer without forcing a sync layout flush.
        standby.classList.remove('active');

        bannerSwapFrame = window.requestAnimationFrame(() => {
            bannerSwapFrame = 0;
            layers.forEach((layer) => {
                layer.classList.toggle('active', layer === standby);
            });
            clearTimeout(bannerReleaseTimer);
            bannerReleaseTimer = setTimeout(releaseInactiveBannerTextures, 1150);
            notifyZenArtwork(src);
        });
    }

    function notifyZenArtwork(src) {
        if (!document.body.classList.contains('zen-mode')) return;
        window.dispatchEvent(new CustomEvent('minkoi:zen-artwork', { detail: { src } }));
    }

    function updateBannerLayers(persona, options) {
        const src = options?.src || pickBanner(persona);
        if (!src) {
            commitBannerCrossfade('', true);
            return '';
        }

        const immediate = Boolean(options && options.immediate);
        const seq = ++bannerLoadSeq;

        if (options?.decoded) {
            commitBannerCrossfade(src, immediate);
            return src;
        }

        if (immediate || (currentBannerSrc === '' && bannerStage?.querySelector('.banner-layer.active')?.style.backgroundImage.includes(src))) {
            commitBannerCrossfade(src, true);
            return src;
        }

        // Pre-decode image asynchronously before starting opacity crossfade to eliminate AI art harsh pop-in.
        // Clear any lingering release timer so standby texture isn't wiped during async decode:
        clearTimeout(bannerReleaseTimer);
        const loader = new Image();
        loader.decoding = 'async';
        loader.src = src;

        const applyWhenReady = () => {
            if (seq !== bannerLoadSeq) return;
            commitBannerCrossfade(src, false);
        };

        if (typeof loader.decode === 'function') {
            loader.decode().then(applyWhenReady).catch(() => {});
        } else {
            loader.onload = applyWhenReady;
            loader.onerror = () => {};
        }
        return src;
    }

    let avatarSeq = 0;
    let avatarTimer = 0;

    function applyAvatar(persona, animate) {
        if (!avatarImg) return;
        const src = persona.avatar;
        if (!src) {
            avatarZone?.classList.add('avatar-fallback');
            return;
        }

        const seq = ++avatarSeq;
        if (avatarTimer) {
            clearTimeout(avatarTimer);
            avatarTimer = 0;
        }

        const paint = () => {
            if (seq !== avatarSeq) return;
            avatarImg.src = src;
            avatarImg.alt = `${persona.name} Portrait`;
            avatarImg.dataset.persona = persona.key;
            avatarImg.style.display = '';
            avatarImg.style.opacity = '';
            avatarImg.style.transform = '';
            avatarZone?.classList.remove('avatar-fallback');
        };

        if (!animate) {
            paint();
            return;
        }

        avatarImg.style.opacity = '0.25';
        avatarImg.style.transform = 'translateX(-50%) scale(0.96)';
        avatarTimer = setTimeout(() => {
            avatarTimer = 0;
            paint();
        }, 120);
    }

    // Quote Bubble Engine removed permanently
    window.showWaifuQuote = () => {};

    let currentPersona = null;
    let personaLoadSeq = 0;

    function prepareImage(src) {
        if (!src) return Promise.resolve();
        const image = new Image();
        image.decoding = 'async';
        if (typeof image.decode === 'function') {
            image.src = src;
            return image.decode();
        }
        return new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = src;
        });
    }

    async function setPersona(indexOrKey, persist) {
        let index = typeof indexOrKey === 'string'
            ? personas.findIndex(p => p.key === indexOrKey)
            : Number(indexOrKey);
        if (isNaN(index) || index < 0 || index >= personas.length) return;
        const persona = personas[index];
        if (!persona || !persona.available) return;

        const seq = ++personaLoadSeq;
        ++bannerLoadSeq;
        const mobile = isMobileViewport();
        const banner = pickBanner(persona);
        personaContainer?.setAttribute('aria-busy', 'true');
        try {
            await Promise.all([prepareImage(persona.avatar), prepareImage(banner)]);
        } catch (_) {
            if (seq === personaLoadSeq) {
                personaContainer?.setAttribute('aria-busy', 'false');
                window.showToast?.('Không thể tải artwork. Giữ nhân vật hiện tại.', 'fa-triangle-exclamation');
            }
            return;
        }
        if (seq !== personaLoadSeq) return;
        if (mobile !== isMobileViewport()) return setPersona(index, persist);
        personaContainer?.setAttribute('aria-busy', 'false');

        // Commit one prepared persona transaction: artwork, palette, particles,
        // text and player mapping all change in the same rendering opportunity.
        currentIndex = index;
        currentPersona = persona;
        safeStorageSet('minkoi_persona_index', index.toString());

        applyPersonaTokens(persona);
        updatePersonaText(persona);
        updateBannerLayers(persona, { src: banner, decoded: true, immediate: !persist && currentBannerSrc === '' });
        applyAvatar(persona, persist);

        // Update ambient particle mode (Sakura petals, snowflakes, stardust)
        if (typeof window.setAmbientParticleMode === 'function') {
            window.setAmbientParticleMode(index, persona.accent);
        }

        // Play gentle magic chime SFX & show quote when switched
        if (persist) {
            if (typeof window.playChimeSFX === 'function') {
                window.playChimeSFX(persona.key);
            }
            showWaifuQuote();
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
            detail: { index, key: persona.key, persona, initial: !persist }
        }));
    }

    // Global hooks for other modules
    window.setPersona = setPersona;
    window.getCurrentPersonaIndex = () => currentIndex;
    window.getCurrentPersona = () => personas[currentIndex];
    window.getCurrentBanner = () => currentBannerSrc;
    window.randomizeCurrentBanner = () => {
        const persona = personas[currentIndex];
        if (!persona) return '';
        return updateBannerLayers(persona, { immediate: false });
    };

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
