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

    const bannerBags = new Map();
    const recentMasters = new Map();
    let currentBannerSrc = '';

    // Smart Bounded Artwork Cache:
    // - Avatars are already mounted in .persona-chip thumbnails (track decoded URLs with zero extra RAM)
    // - Decoded banners use a strict LRU cap; the cache never influences which URL is picked.
    const MAX_DECODED_BANNERS = 5;
    const BANNER_COALESCE_MS = 45;
    const decodedAvatars = new Set();
    const decodedBanners = new Map();
    const inflightImages = new Map();
    const reducedMotionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    function isMobileViewport() {
        return window.innerWidth <= 768;
    }

    function canPreloadBanners() {
        if (window.MinkoiCapabilities && typeof window.MinkoiCapabilities.canPreloadAggressively === 'function') {
            return window.MinkoiCapabilities.canPreloadAggressively();
        }
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn?.saveData) return false;
        if (conn?.effectiveType && /^(slow-2g|2g|3g)$/i.test(conn.effectiveType)) return false;
        if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory > 0 && navigator.deviceMemory <= 3) return false;
        return true;
    }

    function rememberDecodedBanner(src, img) {
        if (!src) return;
        window.MinkoiCache?.putBanner?.(src, { src, image: img });
        if (decodedBanners.has(src)) decodedBanners.delete(src);
        decodedBanners.set(src, img);
        while (decodedBanners.size > MAX_DECODED_BANNERS) {
            let evicted = false;
            for (const key of decodedBanners.keys()) {
                if (key !== currentBannerSrc) {
                    decodedBanners.delete(key);
                    evicted = true;
                    break;
                }
            }
            if (!evicted) break;
        }
    }

    function isImageReady(src, kind = 'banner') {
        if (!src) return true;
        if (kind === 'avatar') return decodedAvatars.has(src);
        return decodedBanners.has(src);
    }

    const viewportRole = () => isMobileViewport() ? 'phone' : 'pc';
    const masterOf = src => BANNER_MASTER_BY_URL.get(src) || src;

    function pickBanner(persona, role = viewportRole(), excluded) {
        const key = `${persona.key}/${role}`;
        if (!bannerBags.has(key)) {
            bannerBags.set(key, createBannerShuffle(persona.banners?.[role] || [], masterOf));
        }
        const bag = bannerBags.get(key);
        const pick = bag.peek(recentMasters.get(persona.key), excluded);
        return pick && { ...pick, bag, role, key: persona.key };
    }

    // ------------------------------------------------------------------
    // BANNER DOUBLE-BUFFER CROSSFADE ENGINE
    // Smoothly pre-decodes images off-screen and dissolves between two
    // layers so even same-persona randomizations (Zen mode) crossfade cleanly.
    // ------------------------------------------------------------------
    let bannerLoadSeq = 0;
    let bannerSwapFrame = 0;
    let bannerFade = null;
    function releaseInactiveBannerTextures() {
        if (bannerStage) bannerStage.querySelectorAll('.banner-layer:not(.active)').forEach(layer => {
            layer.style.backgroundImage = 'none';
            layer.style.opacity = '0';
        });
        window.MinkoiCache?.trimOnPersonaSwitch?.(currentBannerSrc);
    }

    function beginBannerRequest() {
        const seq = ++bannerLoadSeq;
        if (bannerSwapFrame) {
            window.cancelAnimationFrame(bannerSwapFrame);
            bannerSwapFrame = 0;
        }
        return seq;
    }

    let neighborWarmTimer = 0;

    function cancelNeighborWarmup() {
        if (neighborWarmTimer) {
            clearTimeout(neighborWarmTimer);
            neighborWarmTimer = 0;
        }
    }

    function scheduleNeighborWarmup(persona) {
        cancelNeighborWarmup();
        if (!canPreloadBanners() || !persona) return;
        // Wait until the user has settled (after the 850ms banner crossfade) so speculative
        // decoding never competes with rapid switching or active GPU texture uploads.
        neighborWarmTimer = setTimeout(() => {
            neighborWarmTimer = 0;
            if (document.hidden || !canPreloadBanners()) return;
            const avail = playablePersonas;
            const pos = avail.indexOf(persona);
            if (pos < 0 || avail.length <= 1) return;
            const nextP = avail[(pos + 1) % avail.length];
            const run = () => warmPersonaBanner(nextP);
            if (window.MinkoiScheduler?.schedule) {
                window.MinkoiScheduler.schedule('precompute', run, { key: `warm-banner-${nextP.key}` });
            } else if ('requestIdleCallback' in window) {
                window.requestIdleCallback(run, { timeout: 2000 });
            } else {
                run();
            }
        }, 1250);
    }

    function warmPersonaBanner(persona) {
        if (!persona || !persona.available || !canPreloadBanners()) return;
        // Only warm the next bag choice, not an arbitrary cached or first variant.
        const pick = pickBanner(persona);
        if (pick && !decodedBanners.has(pick.src) && !inflightImages.has(pick.src)) {
            prepareImage(pick.src, 'banner').catch(() => {});
        }
    }

    // Progressive idle preload: register already-loaded chip avatars + at most 1 neighbor primary banner
    function preloadAssets() {
        if (personaContainer) {
            personaContainer.querySelectorAll('.persona-avatar-preview img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && img.complete && img.naturalWidth > 0) {
                    decodedAvatars.add(src);
                }
            });
        }

        if (!canPreloadBanners()) return;

        // Wait until initial paint settles so idle warmup never contends with boot or first interaction.
        scheduleNeighborWarmup(personas[currentIndex]);
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
                const thumbImg = btn.querySelector('img');
                if (thumbImg) {
                    if (thumbImg.complete && thumbImg.naturalWidth > 0) {
                        decodedAvatars.add(persona.avatar);
                    } else {
                        thumbImg.addEventListener('load', () => decodedAvatars.add(persona.avatar), { once: true });
                    }
                }
                // Intent-driven single-variant warmup: gives 65-110ms head start on Android touch
                // (pointerdown -> click) and desktop hover without preloading unused variants.
                const warmIntent = () => warmPersonaBanner(persona);
                btn.addEventListener('pointerdown', warmIntent, { passive: true });
                btn.addEventListener('pointerenter', (e) => {
                    if (e.pointerType === 'mouse' || e.pointerType === 'pen') warmIntent();
                }, { passive: true });
                btn.addEventListener('focus', warmIntent);
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

    function commitBannerCrossfade(pick, seq, immediate = false) {
        if (!bannerStage || !isBannerRequestCurrent(pick, seq)) return;
        const { src } = pick;

        ensureBannerLayers();
        const layers = Array.from(bannerStage.querySelectorAll('.banner-layer'));
        if (layers.length === 0) return;

        const currentActive = layers.find(l => l.classList.contains('active')) || layers[0];

        function startSwap() {
            // Retire the previous fade and its cleanup before reusing either buffer.
            bannerFade?.cancel();
            bannerFade = null;
            layers.forEach(layer => { layer.style.transition = 'none'; });
        }

        function recordDisplay() {
            if (!pick.bag.commit(pick)) return;
            currentBannerSrc = src;
            window.MinkoiCache?.setActiveArtwork?.(src);
            const seen = recentMasters.get(pick.key) || [];
            recentMasters.set(pick.key, [masterOf(src), ...seen].slice(0, 3));
            notifyZenArtwork(src);
        }

        if (immediate) {
            startSwap();
            layers.forEach((layer) => {
                const isTarget = layer === currentActive;
                layer.classList.toggle('active', isTarget);
                if (isTarget) {
                    layer.style.backgroundImage = `url('${src}')`;
                    layer.style.opacity = '1';
                }
            });
            releaseInactiveBannerTextures();
            recordDisplay();
            return;
        }

        // Leave both live buffers untouched until this swap is actually committed.
        const standby = layers.find(l => !l.classList.contains('active')) || layers.find(l => l !== currentActive) || layers[0];

        bannerSwapFrame = window.requestAnimationFrame(() => {
            bannerSwapFrame = 0;
            if (!isBannerRequestCurrent(pick, seq)) return;
            startSwap();
            standby.style.backgroundImage = `url('${src}')`;
            standby.style.opacity = '1';
            layers.forEach((layer) => {
                layer.classList.toggle('active', layer === standby);
            });
            // Fade the incoming layer over a fully opaque backdrop so neither
            // a slow frame nor back-to-back swaps can expose the empty stage.
            if (!reducedMotionMQ?.matches && currentBannerSrc && typeof standby.animate === 'function') {
                currentActive.style.opacity = '1';
                const fade = standby.animate([{ opacity: 0 }, { opacity: 1 }], {
                    duration: 850,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
                });
                bannerFade = fade;
                fade.finished.then(() => {
                    if (bannerFade !== fade) return;
                    bannerFade = null;
                    releaseInactiveBannerTextures();
                }, () => {});
            } else {
                releaseInactiveBannerTextures();
            }
            recordDisplay();
        });
    }

    function notifyZenArtwork(src) {
        if (!document.body.classList.contains('zen-mode')) return;
        window.dispatchEvent(new CustomEvent('minkoi:zen-artwork', { detail: { src } }));
    }

    function isBannerRequestCurrent(pick, seq) {
        return pick && seq === bannerLoadSeq && pick.role === viewportRole() &&
            pick.key === personas[currentIndex]?.key;
    }

    function retryBanner(persona, failed, seq, immediate) {
        if (!isBannerRequestCurrent(failed, seq)) return;
        // One alternate, without consuming the failed URL or clearing the current layer.
        const alternate = pickBanner(persona, failed.role, new Set([failed.src]));
        if (alternate) prepareImage(alternate.src, 'banner')
            .then(() => commitBannerCrossfade(alternate, seq, immediate)).catch(() => {});
    }

    function updateBannerLayers(persona) {
        if (pendingPersona) return '';
        const seq = beginBannerRequest();
        const pick = pickBanner(persona);
        if (!pick) return '';
        prepareImage(pick.src, 'banner').then(
            () => commitBannerCrossfade(pick, seq),
            () => retryBanner(persona, pick, seq, false)
        );
        return pick.src;
    }

    let avatarSeq = 0;
    let avatarAnim = null;

    function applyAvatar(persona, animate) {
        if (!avatarImg) return;
        const src = persona.avatar;
        if (!src) {
            avatarZone?.classList.add('avatar-fallback');
            return;
        }

        const seq = ++avatarSeq;
        if (avatarAnim) {
            try { avatarAnim.cancel(); } catch (_) {}
            avatarAnim = null;
        }

        if (seq !== avatarSeq) return;
        // Zero pre-swap 120ms wait: swap decoded portrait on frame 0 and run a pure
        // compositor opacity reveal via WAAPI (respects prefers-reduced-motion).
        avatarImg.src = src;
        avatarImg.alt = `${persona.name} Portrait`;
        avatarImg.dataset.persona = persona.key;
        avatarImg.style.display = '';
        avatarImg.style.opacity = '';
        avatarImg.style.transform = '';
        avatarZone?.classList.remove('avatar-fallback');

        const reduceMotion = Boolean(reducedMotionMQ && reducedMotionMQ.matches);
        if (animate && !reduceMotion && typeof avatarImg.animate === 'function') {
            try {
                avatarAnim = avatarImg.animate(
                    [
                        { opacity: 0.48 },
                        { opacity: 1 }
                    ],
                    {
                        duration: 180,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        fill: 'none'
                    }
                );
                avatarAnim.onfinish = () => { avatarAnim = null; };
                avatarAnim.oncancel = () => { avatarAnim = null; };
            } catch (_) {
                avatarAnim = null;
            }
        }
    }

    // Quote Bubble Engine removed permanently
    window.showWaifuQuote = () => {};

    let personaLoadSeq = 0;
    let pendingPersona = false;

    function setPendingChip(index) {
        if (!personaContainer) return;
        personaContainer.querySelectorAll('.persona-chip').forEach((chip, idx) => {
            chip.classList.toggle('is-pending', idx === index);
        });
    }

    function clearPendingChips() {
        if (!personaContainer) return;
        personaContainer.querySelectorAll('.persona-chip.is-pending').forEach(chip => {
            chip.classList.remove('is-pending');
        });
    }

    function syncActiveChips(activeIndex) {
        if (!personaContainer) return;
        personaContainer.querySelectorAll('.persona-chip').forEach((chip, idx) => {
            const active = idx === activeIndex;
            chip.classList.remove('is-pending');
            chip.classList.toggle('active', active);
            chip.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function prepareImage(src, kind = 'banner') {
        if (!src) return Promise.resolve(null);
        if (kind === 'avatar' && decodedAvatars.has(src)) {
            return Promise.resolve(null);
        }
        if (kind === 'banner' && decodedBanners.has(src)) {
            window.MinkoiCache?.getBanner?.(src);
            const cached = decodedBanners.get(src);
            rememberDecodedBanner(src, cached);
            return Promise.resolve(cached);
        }
        if (inflightImages.has(src)) {
            return inflightImages.get(src);
        }

        const decodeStart = performance.now();
        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.decoding = 'async';
            const onReady = () => {
                window.MinkoiCache?.recordDecodeTime?.(performance.now() - decodeStart);
                if (kind === 'avatar') decodedAvatars.add(src);
                else rememberDecodedBanner(src, image);
                resolve(image);
            };
            const onFail = (err) => reject(err || new Error(`Image failed: ${src}`));

            if (typeof image.decode === 'function') {
                image.src = src;
                image.decode().then(onReady, onFail);
            } else {
                image.onload = onReady;
                image.onerror = onFail;
                image.src = src;
            }
        }).finally(() => {
            inflightImages.delete(src);
        });

        inflightImages.set(src, promise);
        return promise;
    }

    function commitPersonaTransaction(index, persona, pick, bannerReady, bannerSeq, persist) {
        currentIndex = index;
        pendingPersona = false;
        safeStorageSet('minkoi_persona_index', index.toString());

        applyPersonaTokens(persona);
        updatePersonaText(persona);
        if (bannerReady) commitBannerCrossfade(pick, bannerSeq, !persist && !currentBannerSrc);
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

        // Commit active chip state + aria-selected
        syncActiveChips(index);

        // Sync player album art
        const playerArt = document.getElementById('player-album-art');
        if (playerArt && persona.avatar) {
            playerArt.src = persona.avatar;
        }

        // Tell the audio module which persona was equipped (it keeps playing the current track)
        window.dispatchEvent(new CustomEvent('minkoi:persona', {
            detail: { index, key: persona.key, persona, initial: !persist }
        }));

        // Proactively warm 1 immediate neighbor only after user settles (debounced 1.25s)
        if (persist) {
            scheduleNeighborWarmup(persona);
        }
    }

    async function setPersona(indexOrKey, persist) {
        let index = typeof indexOrKey === 'string'
            ? personas.findIndex(p => p.key === indexOrKey)
            : Number(indexOrKey);
        if (isNaN(index) || index < 0 || index >= personas.length) return;
        const persona = personas[index];
        if (!persona || !persona.available) return;

        const seq = ++personaLoadSeq;
        const myBannerSeq = beginBannerRequest();
        window.MinkoiScheduler?.markInteraction?.(550);
        pendingPersona = true;
        cancelNeighborWarmup();
        const role = viewportRole();
        const pick = pickBanner(persona, role);
        const banner = pick?.src;

        // Check if chip thumbnail already finished decoding this avatar in DOM
        if (persona.avatar && !decodedAvatars.has(persona.avatar) && personaContainer) {
            const thumb = personaContainer.querySelector(`.persona-chip[data-key="${persona.key}"] img`);
            if (thumb && thumb.complete && thumb.naturalWidth > 0) {
                decodedAvatars.add(persona.avatar);
            }
        }

        const avatarReadyNow = isImageReady(persona.avatar, 'avatar');
        const bannerReadyNow = !banner || isImageReady(banner, 'banner');

        // Fast path: BOTH avatar & banner are already decoded -> instant synchronous atomic commit (0ms wait)!
        if (avatarReadyNow && bannerReadyNow) {
            if (banner) rememberDecodedBanner(banner, decodedBanners.get(banner));
            personaContainer?.setAttribute('aria-busy', 'false');
            commitPersonaTransaction(index, persona, pick, true, myBannerSeq, persist);
            return;
        }

        // Stage A — Instant frame-0 interaction feedback (never blocked by network or decode)
        if (persist) {
            setPendingChip(index);
        }
        personaContainer?.setAttribute('aria-busy', 'true');

        // Start avatar & banner decode in parallel
        const avatarPromise = avatarReadyNow ? Promise.resolve(null) : prepareImage(persona.avatar, 'avatar');
        let bannerResolved = bannerReadyNow;
        let bannerFailed = false;
        const bannerPromise = bannerReadyNow
            ? Promise.resolve(decodedBanners.get(banner) || null)
            : prepareImage(banner, 'banner').then(
                img => { bannerResolved = true; return img; },
                () => { bannerFailed = true; return null; }
            );

        // Avatar MUST be ready before identity commit so character name/palette never mismatch portrait
        try {
            await avatarPromise;
        } catch (_) {
            if (seq === personaLoadSeq) {
                pendingPersona = false;
                clearPendingChips();
                personaContainer?.setAttribute('aria-busy', 'false');
                window.showToast?.('Không thể tải artwork. Giữ nhân vật hiện tại.', 'fa-triangle-exclamation');
            }
            return;
        }
        if (seq !== personaLoadSeq) return;
        if (role !== viewportRole()) return setPersona(index, persist);

        // Hold briefly for the banner; on a slow load keep the previous backdrop visible.
        if (!bannerResolved && !bannerFailed) {
            await Promise.race([
                bannerPromise,
                new Promise(resolve => setTimeout(resolve, BANNER_COALESCE_MS))
            ]);
        }
        if (seq !== personaLoadSeq) return;
        if (role !== viewportRole()) return setPersona(index, persist);

        personaContainer?.setAttribute('aria-busy', 'false');
        const immediate = !persist && !currentBannerSrc;
        commitPersonaTransaction(index, persona, pick, bannerResolved, myBannerSeq, persist);

        if (!bannerResolved && pick) {
            bannerPromise.then((img) => {
                if (seq !== personaLoadSeq) return;
                if (img) commitBannerCrossfade(pick, myBannerSeq, immediate);
                else retryBanner(persona, pick, myBannerSeq, immediate);
            });
        }
    }

    // Global hooks for other modules
    window.setPersona = setPersona;
    window.getCurrentPersonaIndex = () => currentIndex;
    window.getCurrentPersona = () => personas[currentIndex];
    window.getCurrentBanner = () => currentBannerSrc;
    window.randomizeCurrentBanner = () => {
        const persona = personas[currentIndex];
        if (!persona) return '';
        return updateBannerLayers(persona);
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
