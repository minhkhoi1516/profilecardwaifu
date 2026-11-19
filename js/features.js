/* ========================================================
   MAHIKARI · ESSENTIAL UX & INTERACTION SUITE
   Theme Engine, Native Sharing, Toasts & Shortcuts
======================================================== */
(function() {
    'use strict';

    const STORAGE_THEME = 'mahikari_theme';
    const toastRegion = document.getElementById('toast-region');

    // 1. HIGH-FIDELITY TOAST NOTIFICATION ENGINE
    function showToast(message, icon = 'fa-circle-check') {
        if (!toastRegion) return;
        const toast = document.createElement('div');
        toast.className = 'luxury-toast';
        toast.innerHTML = `
            <i class="fas ${icon}" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        toastRegion.appendChild(toast);

        // Animate entrance
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 240);
        }, 2600);
    }
    window.showToast = showToast;

    // 2. THEME ENGINE (DARK / LIGHT LUXURY HARMONIZATION)
    function applyTheme(theme, persist = true) {
        const isLight = theme === 'light';
        document.body.classList.toggle('light-mode', isLight);
        document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');

        if (persist) {
            try { localStorage.setItem(STORAGE_THEME, isLight ? 'light' : 'dark'); } catch (_) {}
        }

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
            toggleBtn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', isLight ? '#f4f7fb' : '#080a14');
        }
        window.dispatchEvent(new CustomEvent('minkoi:themechange', {
            detail: { theme: isLight ? 'light' : 'dark' }
        }));
    }

    function initTheme() {
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_THEME); } catch (_) {}
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(saved || (prefersLight ? 'light' : 'dark'), false);

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const willBeLight = !document.body.classList.contains('light-mode');
                applyTheme(willBeLight ? 'light' : 'dark', true);
                showToast(willBeLight ? 'Light Mode Activated' : 'Dark Mode Activated', willBeLight ? 'fa-sun' : 'fa-moon');
            });
        }
    }

    // 3. COPY & SHARE ENGINE
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            ta.remove();
            return Promise.resolve();
        } catch (err) {
            ta.remove();
            return Promise.reject(err);
        }
    }

    function initActionButtons() {
        const copyBtn = document.getElementById('copy-profile');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                copyText(window.location.href).then(() => {
                    showToast('Profile link copied to clipboard', 'fa-link');
                }).catch(() => {
                    showToast('Could not copy link', 'fa-triangle-exclamation');
                });
            });
        }

        const shareBtn = document.getElementById('share-profile');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: `${CONFIG.name} — Personal Waifu Music Archive`,
                        text: `${CONFIG.title} · ${CONFIG.bio}`,
                        url: window.location.href
                    }).catch(() => {});
                } else {
                    copyText(window.location.href).then(() => {
                        showToast('Link copied for sharing', 'fa-share-nodes');
                    });
                }
            });
        }
    }

    // 4. Legacy selection hooks share the feedback preference and cooldown.
    function playChimeSFX() {
        window.MinkoiFeedback?.selection();
    }
    window.playChimeSFX = playChimeSFX;

    // 5. LIVE VIETNAM CLOCK (GMT+7, ICT)
    function initLiveClock() {
        const clockEl = document.getElementById('live-clock-time');
        if (!clockEl) return;

        function updateClock() {
            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                clockEl.textContent = formatter.format(now);
            } catch (_) {
                const d = new Date();
                clockEl.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    // 6. AMBIENT ZEN / FULLSCREEN SCREENSAVER MODE
    function initZenMode() {
        const zenBtn = document.getElementById('zen-mode-toggle');
        const zenExitBtn = document.getElementById('zen-exit-btn');
        const zenPlayBtn = document.getElementById('zen-play-pause');
        const zenFab = document.getElementById('zen-fab');
        const mainPlayBtn = document.getElementById('play-pause');
        const mainCard = document.getElementById('main-card');
        const header = document.querySelector('.site-brand-header');
        const dock = document.getElementById('zen-mini-dock');
        const zenLyricsBtn = document.getElementById('zen-lyrics-toggle');
        const zenSurfaces = [mainCard, header, dock].filter(Boolean);
        const spring = window.MinkoiSpring;
        const renderZen = value => {
            const f = Math.max(0, Math.min(1, value));
            if (mainCard) {
                mainCard.style.opacity = (1 - f).toFixed(4);
                mainCard.style.transform = `translate3d(0,${(12 * f).toFixed(2)}px,0) scale(${(1 - 0.02 * f).toFixed(4)})`;
            }
            if (header) {
                header.style.opacity = (1 - f).toFixed(4);
                header.style.transform = `translate3d(0,${(-8 * f).toFixed(2)}px,0)`;
            }
            if (dock) {
                dock.style.opacity = f.toFixed(4);
                dock.style.transform = `translate(-50%,${((1 - f) * 140).toFixed(2)}px)`;
            }
        };
        const zenSpring = spring?.createSpring({
            initial: 0,
            preset: spring.PRESETS.ZEN_ENTER,
            onUpdate: renderZen
        });
        if (zenSpring) zenSurfaces.forEach(el => { el.dataset.zenMotion = ''; });

        let zenMotionGen = 0;
        function animateZen(enabled) {
            if (!zenSpring) return;
            const gen = ++zenMotionGen;
            zenSurfaces.forEach(el => {
                el.style.visibility = 'visible';
                el.style.willChange = 'transform, opacity';
            });
            renderZen(zenSpring.value);
            zenSpring.setTarget(enabled ? 1 : 0, {
                ...(enabled ? spring.PRESETS.ZEN_ENTER : spring.PRESETS.ZEN_EXIT),
                onComplete: () => {
                    // A rapid re-toggle must not let the previous direction hide
                    // surfaces that the latest transition is bringing back.
                    if (gen !== zenMotionGen) return;
                    if (mainCard) mainCard.style.visibility = enabled ? 'hidden' : '';
                    if (header) header.style.visibility = enabled ? 'hidden' : '';
                    if (dock) dock.style.visibility = enabled ? '' : 'hidden';
                    zenSurfaces.forEach(el => { el.style.willChange = ''; });
                }
            });
        }

        // --- Screen Wake Lock: giữ màn hình sáng khi đang ở chế độ màn hình chờ ---
        let wakeLock = null;
        async function requestWakeLock() {
            try {
                if (!('wakeLock' in navigator) || wakeLock) return;
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => { wakeLock = null; });
            } catch (_) { /* trình duyệt không hỗ trợ hoặc bị từ chối */ }
        }
        function releaseWakeLock() {
            try { if (wakeLock) wakeLock.release(); } catch (_) {}
            wakeLock = null;
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && document.body.classList.contains('zen-mode')) {
                requestWakeLock();
            }
        });

        // --- Tự mờ mini dock sau 5s không chạm, chạm để hiện lại ---
        let idleTimer = null;
        function wakeZenDock() {
            if (!document.body.classList.contains('zen-mode')) return;
            document.body.classList.remove('zen-idle');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (document.body.classList.contains('zen-mode')) {
                    document.body.classList.add('zen-idle');
                }
            }, 5000);
        }
        ['pointermove', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
            window.addEventListener(evt, wakeZenDock, { passive: true });
        });

        // --- Zen lyrics visibility: persisted preference, never exits Zen ---
        const ZEN_LYRICS_KEY = 'minkoi_zen_lyrics_visible';
        let zenLyricsVisible = true;
        try {
            zenLyricsVisible = window.localStorage?.getItem(ZEN_LYRICS_KEY) !== '0';
        } catch (_) {}

        function applyZenLyricsVisibility(syncToAudio) {
            document.body.classList.toggle('zen-lyrics-hidden', !zenLyricsVisible);
            if (zenLyricsBtn) {
                zenLyricsBtn.setAttribute('aria-pressed', String(zenLyricsVisible));
                const label = zenLyricsVisible ? 'Ẩn lời bài hát trong Zen' : 'Hiện lời bài hát trong Zen';
                zenLyricsBtn.setAttribute('aria-label', label);
                zenLyricsBtn.title = label;
                const icon = zenLyricsBtn.querySelector('i');
                if (icon) icon.className = zenLyricsVisible ? 'fas fa-closed-captioning' : 'fas fa-comment-slash';
            }
            // Revealing while paused must mount the current line immediately,
            // without replaying an old transition or restarting the engine.
            if (syncToAudio && zenLyricsVisible && document.body.classList.contains('zen-mode')) {
                try {
                    window.MinkoiLyrics?.controller?.syncEngine?.forceSync(true);
                } catch (_) {}
            }
        }

        function setZenLyricsVisible(visible) {
            zenLyricsVisible = Boolean(visible);
            try {
                window.localStorage?.setItem(ZEN_LYRICS_KEY, zenLyricsVisible ? '1' : '0');
            } catch (_) {}
            applyZenLyricsVisibility(true);
        }

        if (zenLyricsBtn) {
            zenLyricsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setZenLyricsVisible(!zenLyricsVisible);
                wakeZenDock();
            });
        }
        applyZenLyricsVisibility(false);

        function toggleZenMode(enable) {
            const isZen = typeof enable === 'boolean' ? enable : !document.body.classList.contains('zen-mode');
            if (isZen === document.body.classList.contains('zen-mode')) return;
            window.MinkoiUI?.closeAllOverlays(null, { instant: true, restoreFocus: false });
            document.body.classList.toggle('zen-mode', isZen);
            animateZen(isZen);
            // Stop hidden rendering work before the Zen wallpaper swap.
            window.dispatchEvent(new CustomEvent('minkoi:zenchange', {
                detail: { enabled: isZen }
            }));
            document.querySelector('.card-wrapper').inert = isZen;
            document.querySelector('.site-brand-header').inert = isZen;
            document.getElementById('zen-mini-dock').inert = !isZen;

            if (zenBtn) {
                zenBtn.classList.toggle('active', isZen);
                zenBtn.title = isZen ? 'Thoát màn hình chờ (Esc / Z)' : 'Chế độ Màn hình chờ (Z)';
                const icon = zenBtn.querySelector('i');
                if (icon) icon.className = isZen ? 'fas fa-compress' : 'fas fa-expand';
            }

            if (isZen) {
                window.MinkoiUI?.lockBodyScroll();
                zenExitBtn?.focus({ preventScroll: true });
                document.body.classList.remove('zen-idle');
                requestWakeLock();
                wakeZenDock();
                if (typeof window.randomizeCurrentBanner === 'function') {
                    window.randomizeCurrentBanner();
                }
                if (typeof window.syncZenPlayer === 'function') {
                    window.syncZenPlayer();
                }
                // The Zen hint already explains the mode; avoid a second
                // floating toast over the wallpaper and playback controls.
                playChimeSFX();
            } else {
                window.MinkoiUI?.unlockBodyScroll();
                zenBtn?.focus({ preventScroll: true });
                releaseWakeLock();
                clearTimeout(idleTimer);
                document.body.classList.remove('zen-idle');
            }
        }
        document.getElementById('zen-mini-dock').inert = true;
        window.toggleZenMode = toggleZenMode;

        if (zenFab) {
            zenFab.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleZenMode(true);
            });
        }

        if (zenBtn) {
            zenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleZenMode();
            });
        }

        if (zenExitBtn) {
            zenExitBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleZenMode(false);
            });
        }

        // Click outside on banner stage to exit Zen mode
        const bannerStage = document.getElementById('banner-stage');
        if (bannerStage) {
            bannerStage.addEventListener('click', (e) => {
                if (!document.body.classList.contains('zen-mode')) return;
                if (e.target && e.target.closest && e.target.closest('#zen-mini-dock')) return;
                if (e.target && e.target.closest && e.target.closest('#zen-ambient-lyric')) return;
                toggleZenMode(false);
            });
        }

        // Global hotkey Z and Esc for Zen mode
        window.addEventListener('keydown', (e) => {
            if (['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase())) return;
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                toggleZenMode();
            } else if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
                toggleZenMode(false);
            }
        });

        // Initial sync of Zen Mini Dock
        if (typeof window.syncZenPlayer === 'function') {
            window.syncZenPlayer();
        }
    }

    // 7. DISCORD LIVE STATUS (Lanyard API Integration)
    function initDiscordStatus() {
        const statusPill = document.querySelector('.status-indicator-pill');
        const statusLabel = statusPill?.querySelector('.status-label');
        if (!statusPill || !statusLabel) return;

        const discordId = CONFIG.brand?.discordId;
        if (!discordId) return; // Keep default status pill if no ID configured yet

        async function fetchLanyard() {
            try {
                const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!data.success || !data.data) return;

                const d = data.data;
                const status = d.discord_status || 'offline';

                statusPill.className = 'status-indicator-pill';

                if (d.listening_to_spotify && d.spotify) {
                    statusPill.classList.add('spotify');
                    statusLabel.textContent = `SPOTIFY: ${d.spotify.song}`;
                    statusPill.title = `Listening to: ${d.spotify.song} by ${d.spotify.artist}`;
                } else if (status === 'online') {
                    statusPill.classList.add('online');
                    statusLabel.textContent = 'ONLINE';
                    statusPill.title = 'Discord: Online';
                } else if (status === 'idle') {
                    statusPill.classList.add('idle');
                    statusLabel.textContent = 'IDLE';
                    statusPill.title = 'Discord: Idle / Đang chờ';
                } else if (status === 'dnd') {
                    statusPill.classList.add('dnd');
                    statusLabel.textContent = 'DND';
                    statusPill.title = 'Discord: Do Not Disturb';
                } else {
                    statusPill.classList.add('offline');
                    statusLabel.textContent = 'OFFLINE';
                    statusPill.title = 'Discord: Offline';
                }
            } catch (_) {}
        }

        fetchLanyard();
        setInterval(fetchLanyard, 30000);
    }

    // 8. NUMBER KEY SHORTCUTS FOR PERSONA SWITCHING (1-7)
    window.addEventListener('keydown', (e) => {
        if (['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase())) return;
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9) {
            const persona = CONFIG.personas[num - 1];
            if (!persona || !persona.available) return;
            if (typeof window.setPersona === 'function') {
                window.setPersona(num - 1, true);
                showToast(`Visual Theme: ${persona.name}`, 'fa-wand-magic-sparkles');
            }
        }
    });

    // 9. IQOO / ORIGINOS AUDIO NOTICE CONTROLLER
    function initIqooNotice() {
        const noticeEl = document.getElementById('audio-iqoo-notice');
        const closeBtn = document.getElementById('audio-iqoo-close');
        if (!noticeEl) return;

        try {
            if (localStorage.getItem('minkoi_hide_iqoo_tip') === 'true') {
                noticeEl.classList.add('hidden');
                return;
            }
        } catch (_) {}

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                noticeEl.style.opacity = '0';
                noticeEl.style.transform = 'translateY(6px)';
                setTimeout(() => {
                    noticeEl.classList.add('hidden');
                }, 240);
                try {
                    localStorage.setItem('minkoi_hide_iqoo_tip', 'true');
                } catch (_) {}
                if (typeof window.showToast === 'function') {
                    window.showToast('Đã đóng hướng dẫn iQOO', 'fa-circle-check');
                }
            });
        }
    }

    // Boot
    // Retire the old tier preference; accessibility is handled by each renderer.
    try { localStorage.removeItem('minkoi_quality_mode'); } catch (_) {}
    initTheme();
    initActionButtons();
    initLiveClock();
    initZenMode();
    initDiscordStatus();
    initIqooNotice();
})();
