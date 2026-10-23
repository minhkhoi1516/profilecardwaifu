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
            metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#080a14');
        }
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
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
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
                        title: `${CONFIG.name} · Waifu & Music Studio`,
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

    // 4. SYNTHESIZED MAGIC CHIME SFX (Web Audio API, 0ms latency, 0 files)
    function playChimeSFX() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!window.__sfxCtx) window.__sfxCtx = new AudioCtx();
            const ctx = window.__sfxCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now); // A5
            osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.33);
        } catch (_) {}
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

        function toggleZenMode(enable) {
            const isZen = typeof enable === 'boolean' ? enable : !document.body.classList.contains('zen-mode');
            document.body.classList.toggle('zen-mode', isZen);

            if (zenBtn) {
                zenBtn.classList.toggle('active', isZen);
                zenBtn.title = isZen ? 'Thoát màn hình chờ (Esc / Z)' : 'Chế độ Màn hình chờ (Z)';
                const icon = zenBtn.querySelector('i');
                if (icon) icon.className = isZen ? 'fas fa-compress' : 'fas fa-expand';
            }

            if (isZen) {
                document.body.classList.remove('zen-idle');
                requestWakeLock();
                wakeZenDock();
                showToast('Chế độ màn hình chờ. Nhấn phím Z hoặc chạm nền để quay lại.', 'fa-sparkles');
                playChimeSFX();
            } else {
                releaseWakeLock();
                clearTimeout(idleTimer);
                document.body.classList.remove('zen-idle');
            }
        }

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

        if (zenPlayBtn && mainPlayBtn) {
            zenPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                mainPlayBtn.click();
            });
        }

        // Click outside on banner stage to exit Zen mode
        const bannerStage = document.getElementById('banner-stage');
        if (bannerStage) {
            bannerStage.addEventListener('click', () => {
                if (document.body.classList.contains('zen-mode')) {
                    toggleZenMode(false);
                }
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

        // Sync Zen Mini Dock track metadata with main audio player
        const trackTitle = document.getElementById('track-name');
        const trackArtist = document.getElementById('track-artist');
        const zenTitle = document.getElementById('zen-track-name');
        const zenArtist = document.getElementById('zen-track-artist');
        const audioPlayer = document.getElementById('audio-player');

        if (audioPlayer && zenPlayBtn) {
            audioPlayer.addEventListener('play', () => {
                const icon = zenPlayBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-pause';
            });
            audioPlayer.addEventListener('pause', () => {
                const icon = zenPlayBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-play';
            });
        }

        if (trackTitle && zenTitle) {
            const observer = new MutationObserver(() => {
                if (zenTitle) zenTitle.textContent = trackTitle.textContent;
                if (zenArtist && trackArtist) zenArtist.textContent = trackArtist.textContent;
            });
            observer.observe(trackTitle, { childList: true, characterData: true, subtree: true });
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

    // Boot
    initTheme();
    initActionButtons();
    initLiveClock();
    initZenMode();
    initDiscordStatus();
})();
