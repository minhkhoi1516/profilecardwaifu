/* ========================================================
   MAHIKARI · STUDIO AUDIO SUITE (PRO AUDIO ENGINE)
   Hi-Fi Web Audio Player with EQ Filters, Smart Playlist,
   Pointer Scrubbing, GainNode iOS Volume & Sleep Timer
======================================================== */
(function() {
    'use strict';

    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    const trackNameEl = document.getElementById('track-name');
    const trackArtistEl = document.getElementById('track-artist');
    const currentTrackNumEl = document.getElementById('current-track-num');
    const totalTracksNumEl = document.getElementById('total-tracks-num');
    const seekFill = document.getElementById('seek-fill');
    const seekContainer = document.getElementById('seek-container');
    const seekTip = document.getElementById('seek-tip');
    const volumeCtrl = document.getElementById('volume-control');
    const muteBtn = document.getElementById('mute-btn');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const audioAlert = document.getElementById('audio-alert');
    const playlistToggleBtn = document.getElementById('playlist-toggle-btn');
    const playlistMenu = document.getElementById('playlist-menu');
    const audioFxBtn = document.getElementById('audio-fx-btn');
    const audioFxMenu = document.getElementById('audio-fx-menu');
    const sleepTimerBtn = document.getElementById('sleep-timer-btn');
    const sleepTimerMenu = document.getElementById('sleep-timer-menu');
    const categoryNav = document.getElementById('audio-category-nav');
    const trackCatEl = document.getElementById('track-category-tag');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const vinylDisc = document.getElementById('vinyl-disc');
    const albumArt = document.getElementById('player-album-art');

    // Zen Mode Mini Dock Elements
    const zenTitle = document.getElementById('zen-track-name');
    const zenArtist = document.getElementById('zen-track-artist');
    const zenPlayBtn = document.getElementById('zen-play-pause');
    const zenDisc = document.getElementById('zen-dock-disc');
    const zenSeekFill = document.getElementById('zen-seek-fill');
    const zenPrevBtn = document.getElementById('zen-prev-track');
    const zenNextBtn = document.getElementById('zen-next-track');

    // Extended Utility Elements
    const speedBtn = document.getElementById('playback-speed-btn');
    const speedLabel = document.getElementById('playback-speed-label');

    if (!audio) return;

    const fullPlaylist = (CONFIG.music && CONFIG.music.playlist) || [];

    // Presentation/queue order is independent of the persisted global index.
    // Group Mahiru once, preserving every other persona's relative order.
    function orderPlaylistForDisplay(tracks) {
        const mahiru = tracks.filter(song => song.persona === 'mahiru');
        const orderedMahiru = [
            ...mahiru.filter(song => song.version !== 'instrumental'),
            ...mahiru.filter(song => song.version === 'instrumental')
        ];
        const ordered = [];
        let insertedMahiru = false;
        tracks.forEach(song => {
            if (song.persona !== 'mahiru') {
                ordered.push(song);
            } else if (!insertedMahiru) {
                ordered.push(...orderedMahiru);
                insertedMahiru = true;
            }
        });
        return ordered;
    }
    const displayPlaylist = orderPlaylistForDisplay(fullPlaylist);

    // Helper: safe local storage
    function safeGet(key, def) {
        try { return localStorage.getItem(key) ?? def; } catch (_) { return def; }
    }
    function safeSet(key, val) {
        try { localStorage.setItem(key, val); } catch (_) {}
    }

    // Favorites persistence
    let favTrackIds = [];
    try {
        favTrackIds = JSON.parse(safeGet('minkoi_fav_tracks', '[]')) || [];
    } catch (_) {
        favTrackIds = [];
    }

    function isFavorite(trackId) {
        return favTrackIds.includes(trackId);
    }

    function toggleFavorite(trackId) {
        const idx = favTrackIds.indexOf(trackId);
        if (idx >= 0) {
            favTrackIds.splice(idx, 1);
            if (typeof window.showToast === 'function') {
                window.showToast('Đã xóa khỏi danh sách yêu thích', 'fa-heart-crack');
            }
        } else {
            favTrackIds.push(trackId);
            if (typeof window.showToast === 'function') {
                window.showToast('Đã thêm vào danh sách yêu thích', 'fa-heart');
            }
        }
        safeSet('minkoi_fav_tracks', JSON.stringify(favTrackIds));
        // Outside Favorites, membership/order doesn't change. Keep the live
        // button so keyboard focus and press feedback survive the toggle.
        if (categoryNav) renderCategoryTabs(trackId);
        else updatePlaylistItems();
    }

    function syncFavoriteRow(trackId) {
        const button = playlistMenu?.querySelector(`[data-favid="${trackId}"]`);
        if (!button) return;
        const favorite = isFavorite(trackId);
        button.classList.toggle('active', favorite);
        button.setAttribute('aria-pressed', String(favorite));
        button.title = favorite ? 'Bỏ yêu thích' : 'Yêu thích';
        const icon = button.querySelector('i');
        if (icon) icon.className = favorite ? 'fas fa-heart' : 'far fa-heart';
    }

    // Persona filter: 'all', 'favorites', or persona key
    function currentPersonaKey() {
        const p = typeof window.getCurrentPersona === 'function' ? window.getCurrentPersona() : null;
        return p ? p.key : 'alya';
    }

    let currentFilter = safeGet('minkoi_player_filter', currentPersonaKey());
    if (currentFilter !== 'all' && currentFilter !== 'favorites' && !CONFIG.getPersona(currentFilter)) {
        currentFilter = 'all';
    }

    function getFilteredPlaylist() {
        if (currentFilter === 'all') return displayPlaylist;
        if (currentFilter === 'favorites') {
            return displayPlaylist.filter(song => isFavorite(song.id));
        }
        return displayPlaylist.filter(song => song.persona === currentFilter);
    }

    function personaOf(track) {
        return track ? CONFIG.getPersona(track.persona) : null;
    }

    let currentTrackIndex = 0;
    let isShuffle = safeGet('minkoi_player_shuffle', 'false') === 'true';
    let repeatMode = safeGet('minkoi_player_repeat', 'all'); // 'all', 'one', 'none'
    let repeatSeekCleanup = null;
    function cancelRepeatSeek() {
        if (repeatSeekCleanup) repeatSeekCleanup();
    }
    let currentAudioFx = safeGet('mahikari_audio_fx', 'hifi');
    let isMuted = false;
    let lastVolume = CONFIG.music?.defaultVolume || 45;
    let searchQuery = '';
    let isScrubbing = false;
    let hasPreloadedNext = false;

    // Auto-Sync Waifu Theme with Music State (Disabled)
    let autoSyncTheme = false;

    // Playback Speed State: 7 presets [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
    const SPEED_PRESETS = [
        { rate: 0.5, label: '0.5x', toast: 'Tốc độ: 0.5x (Super Slowed)' },
        { rate: 0.75, label: '0.75x', toast: 'Tốc độ: 0.75x (Lo-Fi Slowed)' },
        { rate: 1.0, label: '1.0x', toast: 'Tốc độ: 1.0x (Bình thường)' },
        { rate: 1.25, label: '1.25x', toast: 'Tốc độ: 1.25x (Nightcore Mode)' },
        { rate: 1.5, label: '1.5x', toast: 'Tốc độ: 1.5x (Super Fast)' },
        { rate: 1.75, label: '1.75x', toast: 'Tốc độ: 1.75x (Hyper Pop)' },
        { rate: 2.0, label: '2.0x', toast: 'Tốc độ: 2.0x (Max Speed)' }
    ];
    let currentSpeedIndex = parseInt(safeGet('minkoi_player_speed_idx', '2'), 10);
    if (isNaN(currentSpeedIndex) || currentSpeedIndex < 0 || currentSpeedIndex >= SPEED_PRESETS.length) {
        currentSpeedIndex = 2; // Default 1.0x
    }

    // Sleep Timer State
    let sleepTimerInterval = null;
    let sleepTimerTargetTime = null;
    let sleepTimerMode = 'off'; // 'off', 15, 30, 45, 60, 'track'

    // Web Audio Architecture & Live Visualizer
    let audioCtx = null;
    let gainNode = null;
    let eqBands = null; // 5-Band Biquad Filter Bank: sub, bass, mid, treble, air
    let eqBandGains = [0, 0, 0, 0, 0];
    let analyser = null;
    let audioSource = null;
    let isContextReady = false;
    let isCrossfadeActive = safeGet('minkoi_crossfade', 'true') === 'true';
    let autoAdvanceTimer = null;

    function initAudioContext() {
        if (isContextReady) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            // Shared singleton with 'playback' latencyHint to maximize buffer & eliminate crackling on Android/iQOO/OriginOS
            if (!window.__minkoiAudioCtx) {
                try {
                    window.__minkoiAudioCtx = new AudioContextClass({ latencyHint: 'playback' });
                } catch (_) {
                    window.__minkoiAudioCtx = new AudioContextClass();
                }
            }
            audioCtx = window.__minkoiAudioCtx;

            gainNode = audioCtx.createGain();

            // Studio 5-Band Equalizer: 60Hz, 250Hz, 1kHz, 4kHz, 12kHz
            eqBands = {
                sub: audioCtx.createBiquadFilter(),     // 60Hz LowShelf (Sub-bass)
                bass: audioCtx.createBiquadFilter(),    // 250Hz Peaking (Kick/Bass)
                mid: audioCtx.createBiquadFilter(),     // 1000Hz Peaking (Vocal)
                treble: audioCtx.createBiquadFilter(),  // 4000Hz Peaking (Presence)
                air: audioCtx.createBiquadFilter()      // 12000Hz HighShelf (Air/Treble)
            };

            eqBands.sub.type = 'lowshelf';
            eqBands.sub.frequency.value = 60;

            eqBands.bass.type = 'peaking';
            eqBands.bass.frequency.value = 250;
            eqBands.bass.Q.value = 1.0;

            eqBands.mid.type = 'peaking';
            eqBands.mid.frequency.value = 1000;
            eqBands.mid.Q.value = 1.0;

            eqBands.treble.type = 'peaking';
            eqBands.treble.frequency.value = 4000;
            eqBands.treble.Q.value = 1.0;

            eqBands.air.type = 'highshelf';
            eqBands.air.frequency.value = 12000;

            analyser = audioCtx.createAnalyser();
            // Resolve bass (~23 Hz/bin at 48 kHz). The feature engine owns
            // attack/release; heavy FFT smoothing would hide transients.
            analyser.fftSize = 2048;
            analyser.minDecibels = -95;
            analyser.maxDecibels = -15;
            analyser.smoothingTimeConstant = 0.25;

            // Connect in series: Source -> GainNode -> Sub -> Bass -> Mid -> Treble -> Air -> Analyser -> Output
            audioSource = audioCtx.createMediaElementSource(audio);
            audioSource.connect(gainNode);
            gainNode.connect(eqBands.sub);
            eqBands.sub.connect(eqBands.bass);
            eqBands.bass.connect(eqBands.mid);
            eqBands.mid.connect(eqBands.treble);
            eqBands.treble.connect(eqBands.air);
            eqBands.air.connect(analyser);
            analyser.connect(audioCtx.destination);

            // Set initial volume on GainNode
            // Compensate only when the browser ignores media volume (iOS).
            // Applying the requested volume to both nodes would square it.
            gainNode.gain.setValueAtTime(volumeGainTarget(), audioCtx.currentTime);

            applyEqPreset(currentAudioFx);
            window.__minkoiAnalyser = analyser;
            isContextReady = true;
        } catch (_) {}
    }

    // The avatar visualizer owns its single render loop in js/visualizer.js.
    // Keeping these wrappers means play/pause/zen/visibility lifecycles stay one
    // source of truth while the rendering module can evolve independently.
    function startVisualizerLoop() {
        if (window.MinkoiVisualizer) window.MinkoiVisualizer.start();
    }

    function stopVisualizerLoop() {
        if (window.MinkoiVisualizer) window.MinkoiVisualizer.stop();
    }

    window.addEventListener('minkoi:zenchange', () => {
        if (document.body.classList.contains('zen-mode')) {
            stopVisualizerLoop();
        } else if (!audio.paused && analyser && !document.hidden) {
            startVisualizerLoop();
        }
    });

    function applyEqPreset(presetId) {
        currentAudioFx = presetId;
        safeSet('mahikari_audio_fx', presetId);

        const preset = (CONFIG.audioFx && CONFIG.audioFx.presets) ? CONFIG.audioFx.presets.find(p => p.id === presetId) : null;
        eqBandGains = preset ? [...preset.gains] : [0, 0, 0, 0, 0];

        if (eqBands && audioCtx) {
            const now = audioCtx.currentTime;
            const filters = [eqBands.sub, eqBands.bass, eqBands.mid, eqBands.treble, eqBands.air];
            filters.forEach((filter, idx) => {
                if (filter) {
                    filter.gain.cancelScheduledValues(now);
                    filter.gain.setValueAtTime(filter.gain.value, now);
                    filter.gain.linearRampToValueAtTime(eqBandGains[idx] || 0, now + 0.12);
                }
            });
        }
        renderFxMenu();
    }

    function setCustomEqBand(bandIdx, gainValue) {
        if (bandIdx < 0 || bandIdx > 4) return;
        eqBandGains[bandIdx] = Math.max(-12, Math.min(12, parseFloat(gainValue) || 0));
        currentAudioFx = 'custom';
        safeSet('mahikari_audio_fx', 'custom');

        if (eqBands && audioCtx) {
            const now = audioCtx.currentTime;
            const filters = [eqBands.sub, eqBands.bass, eqBands.mid, eqBands.treble, eqBands.air];
            const filter = filters[bandIdx];
            if (filter) {
                filter.gain.cancelScheduledValues(now);
                filter.gain.setValueAtTime(filter.gain.value, now);
                filter.gain.linearRampToValueAtTime(eqBandGains[bandIdx], now + 0.08);
            }
        }
        renderFxMenu();
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateMediaSession(track) {
        if (!('mediaSession' in navigator)) return;
        if (!track) return;
        const persona = personaOf(track);
        const artworkSrc = (persona && persona.avatar) ? persona.avatar : 'assets/avatar_alya.png';
        const absArtwork = new URL(artworkSrc, window.location.href).href;

        // Đăng ký MediaMetadata đầy đủ nếu chưa có hoặc track thay đổi
        if (!navigator.mediaSession.metadata || navigator.mediaSession.metadata.title !== track.name) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.name,
                artist: track.artist,
                album: persona ? `${persona.name} · MinKoi Studio` : 'MinKoi Studio Collection',
                artwork: [
                    { src: absArtwork, sizes: '96x96', type: 'image/png' },
                    { src: absArtwork, sizes: '128x128', type: 'image/png' },
                    { src: absArtwork, sizes: '256x256', type: 'image/png' },
                    { src: absArtwork, sizes: '512x512', type: 'image/png' }
                ]
            });
        }

        const safeSetAction = (action, handler) => {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch (_) {}
        };

        safeSetAction('play', () => playAudio());
        safeSetAction('pause', () => pauseAudio());
        safeSetAction('previoustrack', () => prevTrack());
        safeSetAction('nexttrack', () => nextTrack());
        safeSetAction('seekto', (details) => {
            if (details.fastSeek && 'fastSeek' in audio) {
                audio.fastSeek(details.seekTime);
            } else if (details.seekTime !== undefined) {
                audio.currentTime = details.seekTime;
            }
        });

        if ('setPositionState' in navigator.mediaSession && audio.duration && !isNaN(audio.duration)) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate || 1.0,
                    position: Math.min(audio.currentTime, audio.duration)
                });
            } catch (_) {}
        }
    }

    function updateCategoryTag() {
        if (!trackCatEl) return;
        const persona = personaOf(fullPlaylist[currentTrackIndex]);
        if (!persona) {
            trackCatEl.textContent = '';
            return;
        }
        trackCatEl.innerHTML = `<i class="fas fa-compact-disc" aria-hidden="true"></i> <span>${persona.name} · ${persona.role}</span>`;
        trackCatEl.dataset.persona = persona.key;
        trackCatEl.classList.toggle('is-dim', currentFilter !== 'all' && currentFilter !== persona.key);
        trackCatEl.title = `Xem danh sách nhạc của ${persona.name}`;
    }

    let hasRetriedCurrentTrack = false;

    function safeEncodePath(path) {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return path.split('/').map(segment => encodeURIComponent(decodeURIComponent(segment))).join('/');
    }

    function preloadNextTrack() {
        const list = navigationList();
        if (list.length <= 1) return;
        const pos = list.indexOf(fullPlaylist[currentTrackIndex]);
        const nextIdx = (pos + 1) % list.length;
        const nextSong = list[nextIdx];
        if (nextSong && nextSong.file) {
            let prefetcher = document.getElementById('minkoi-next-prefetch');
            if (!prefetcher) {
                prefetcher = document.createElement('link');
                prefetcher.id = 'minkoi-next-prefetch';
                prefetcher.rel = 'prefetch';
                prefetcher.as = 'fetch';
                document.head.appendChild(prefetcher);
            }
            prefetcher.href = safeEncodePath(nextSong.file);
        }
    }

    function loadTrack(index, autoPlay = false) {
        if (fullPlaylist.length === 0) return;
        if (index < 0) index = fullPlaylist.length - 1;
        if (index >= fullPlaylist.length) index = 0;

        currentTrackIndex = index;
        const track = fullPlaylist[currentTrackIndex];
        if (!track) return;

        safeSet('minkoi_player_track_idx', currentTrackIndex.toString());
        hasPreloadedNext = false;
        hasRetriedCurrentTrack = false;

        // Clean reload to free previous decode buffer completely
        cancelRepeatSeek();
        audio.pause();
        audio.removeAttribute('src');
        audio.load();

        if (track.file.startsWith('http://') || track.file.startsWith('https://')) {
            if (!track.file.startsWith(window.location.origin)) {
                audio.crossOrigin = 'anonymous';
            } else {
                audio.removeAttribute('crossorigin');
            }
        } else {
            audio.removeAttribute('crossorigin');
        }

        // Mã hóa từng segment an toàn thay vì encodeURI toàn bộ chuỗi
        audio.src = safeEncodePath(track.file);
        audio.load();

        if (trackNameEl) trackNameEl.textContent = track.name;
        if (trackArtistEl) trackArtistEl.textContent = `${track.artist}${track.versionLabel ? ` · ${track.versionLabel}` : ''}`;
        if (currentTrackNumEl) currentTrackNumEl.textContent = (currentTrackIndex + 1).toString();
        if (totalTracksNumEl) totalTracksNumEl.textContent = fullPlaylist.length.toString();

        // Direct sync with Zen Mode Mini Dock
        if (zenTitle) zenTitle.textContent = track.name;
        if (zenArtist) zenArtist.textContent = track.artist;

        // Visual Continuity: Sync Morphing Player Header inside Playlist & Soundstage Platter
        const morphArt = document.getElementById('playlist-morph-art');
        const morphTitle = document.getElementById('playlist-morph-title');
        const morphArtist = document.getElementById('playlist-morph-artist');
        const pPersona = personaOf(track);
        const resolvedCover = track.cover || (pPersona && pPersona.avatar ? pPersona.avatar : 'assets/avatar_alya.png');
        if (morphArt) morphArt.src = resolvedCover;
        if (morphTitle) morphTitle.textContent = track.name;
        if (morphArtist) morphArtist.textContent = track.artist;
        const prevCoverSrc = albumArt ? albumArt.getAttribute('src') : '';
        if (albumArt) {
            albumArt.src = resolvedCover;
            albumArt.alt = track.name ? `${track.name} Cover` : 'Album Cover';
        }
        animateTrackContinuity(Boolean(resolvedCover && resolvedCover !== prevCoverSrc));
        hasLoadedInitialTrack = true;

        if (typeof resetSeekScrubState === 'function') resetSeekScrubState();
        setSeekProgressUI(0);

        if (currentTimeEl) {
            currentTimeEl.textContent = '0:00';
            lastCurrentTimeText = '0:00';
        }
        if (totalTimeEl) {
            const initDur = track.duration || '0:00';
            totalTimeEl.textContent = initDur;
            lastTotalTimeText = initDur;
        }
        if (seekContainer) seekContainer.setAttribute('aria-valuenow', '0');

        // Maintain playback speed
        if (SPEED_PRESETS[currentSpeedIndex]) {
            audio.playbackRate = SPEED_PRESETS[currentSpeedIndex].rate;
        }

        // Auto-Sync Waifu Theme with Music
        if (autoSyncTheme && track && track.persona) {
            const pIdx = CONFIG.personas.findIndex(p => p.key === track.persona && p.available);
            if (pIdx >= 0 && typeof window.setPersona === 'function') {
                if (window.getCurrentPersonaIndex?.() !== pIdx) {
                    window.setPersona(pIdx, false);
                }
            }
        }

        updateCategoryTag();
        updateMediaSession(track);
        updatePlaylistItems();

        window.dispatchEvent(new CustomEvent('minkoi:trackchange', {
            detail: { index: currentTrackIndex, track }
        }));

        if (autoPlay) {
            playAudio();
        }
    }

    let hasLoadedInitialTrack = false;
    const reducedMotionMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const trackInfoCol = trackNameEl ? trackNameEl.closest('.track-metadata') : null;

    function animateTrackContinuity(coverChanged) {
        if (!hasLoadedInitialTrack || reducedMotionMQ?.matches) return;
        const opts = { duration: 210, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };
        if (trackInfoCol && typeof trackInfoCol.animate === 'function') {
            trackInfoCol.animate(
                [
                    { opacity: 0.58, transform: 'translate3d(0, 4px, 0)' },
                    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
                ],
                opts
            );
        }
        if (coverChanged && albumArt && typeof albumArt.animate === 'function') {
            albumArt.animate(
                [
                    { opacity: 0.68 },
                    { opacity: 1 }
                ],
                opts
            );
        }
    }
    let resetSeekScrubState = null;
    let volumeThumbCtrl = null;
    const volumeDockEl = volumeCtrl ? volumeCtrl.closest('.volume-slider-dock') : null;

    function ensureSeekThumbDot() {
        if (!seekContainer) return null;
        let dot = seekContainer.querySelector('.seek-thumb-dot');
        if (!dot) {
            dot = document.createElement('div');
            dot.className = 'seek-thumb-dot';
            dot.setAttribute('aria-hidden', 'true');
            seekContainer.appendChild(dot);
        }
        return dot;
    }

    function setSeekProgressUI(pos) {
        const clamped = Math.max(0, Math.min(1, pos || 0));
        const valueStr = clamped.toFixed(5);
        if (seekContainer) seekContainer.style.setProperty('--seek-progress', valueStr);
        if (seekFill) seekFill.style.setProperty('--seek-progress', valueStr);
        if (zenSeekFill) zenSeekFill.style.transform = `scaleX(${valueStr})`;
        ensureSeekThumbDot();
    }

    let crossfadeTimer = 0;

    // Crossfade Playback Transition Engine (1.0s Total: 0.48s fade-out + 0.52s fade-in)
    function changeTrack(newIndex, autoPlay = true) {
        if (crossfadeTimer) {
            clearTimeout(crossfadeTimer);
            crossfadeTimer = 0;
        }
        if (isCrossfadeActive && audioCtx && gainNode && !audio.paused && audio.currentTime > 0) {
            const now = audioCtx.currentTime;
            const targetVol = volumeGainTarget();

            // Fade-out êm dịu trong 0.48s
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0.001, now + 0.48);

            crossfadeTimer = setTimeout(() => {
                crossfadeTimer = 0;
                loadTrack(newIndex, autoPlay);
                if (audioCtx && gainNode) {
                    const afterNow = audioCtx.currentTime;
                    // Fade-in êm dịu trong 0.52s
                    gainNode.gain.cancelScheduledValues(afterNow);
                    gainNode.gain.setValueAtTime(0.001, afterNow);
                    gainNode.gain.linearRampToValueAtTime(targetVol, afterNow + 0.52);
                }
            }, 500);
        } else {
            loadTrack(newIndex, autoPlay);
        }
    }

    window.getCurrentTrackIndex = () => currentTrackIndex;
    window.getCurrentTrack = () => fullPlaylist[currentTrackIndex];
    window.getCurrentPlayingTrack = () => fullPlaylist[currentTrackIndex];
    window.changeTrack = changeTrack;

    function syncPlayIcons(isPlaying) {
        const cls = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        const playIcon = playBtn?.querySelector('i');
        if (playIcon) playIcon.className = cls;
        else if (playBtn) playBtn.innerHTML = `<i class="${cls}" aria-hidden="true"></i>`;
        if (playBtn) playBtn.classList.toggle('is-playing', isPlaying);
        const zenIcon = zenPlayBtn?.querySelector('i');
        if (zenIcon) zenIcon.className = cls;
        else if (zenPlayBtn) zenPlayBtn.innerHTML = `<i class="${cls}" aria-hidden="true"></i>`;
    }

    function syncZenPlayer() {
        const track = fullPlaylist[currentTrackIndex];
        if (track) {
            if (zenTitle) zenTitle.textContent = track.name;
            if (zenArtist) zenArtist.textContent = track.artist;
        }
        syncPlayIcons(!audio.paused);
        if (zenDisc) {
            zenDisc.classList.toggle('spinning', !audio.paused);
        }
        if (audio.duration) {
            setSeekProgressUI(audio.currentTime / audio.duration);
        }
    }
    window.syncZenPlayer = syncZenPlayer;

    function playAudio() {
        initAudioContext();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        audio.play().then(() => {
            if ('mediaSession' in navigator) {
                try { navigator.mediaSession.playbackState = 'playing'; } catch (_) {}
            }
            syncPlayIcons(true);
            if (vinylDisc) vinylDisc.classList.add('spinning');
            if (zenDisc) zenDisc.classList.add('spinning');
            const avatarZone = document.getElementById('avatar-zone-wrap');
            if (avatarZone) avatarZone.classList.add('playing');
            if (audioAlert) audioAlert.classList.add('hidden');
            const track = fullPlaylist[currentTrackIndex];
            if (track) {
                document.title = `▶ ${track.name} · ${CONFIG.name}`;
            }
            startVisualizerLoop();
        }).catch(() => {
            if ('mediaSession' in navigator) {
                try { navigator.mediaSession.playbackState = 'paused'; } catch (_) {}
            }
            syncPlayIcons(false);
            if (vinylDisc) vinylDisc.classList.remove('spinning');
            if (zenDisc) zenDisc.classList.remove('spinning');
            const avatarZone = document.getElementById('avatar-zone-wrap');
            if (avatarZone) avatarZone.classList.remove('playing');
        });
    }

    function pauseAudio() {
        cancelRepeatSeek();
        audio.pause();
        if ('mediaSession' in navigator) {
            try { navigator.mediaSession.playbackState = 'paused'; } catch (_) {}
        }
        syncPlayIcons(false);
        if (vinylDisc) vinylDisc.classList.remove('spinning');
        if (zenDisc) zenDisc.classList.remove('spinning');
        const avatarZone = document.getElementById('avatar-zone-wrap');
        if (avatarZone) avatarZone.classList.remove('playing');
        document.title = `${CONFIG.name} — Personal Waifu Music Archive`;
        // The visualizer fades its own energy out naturally (js/visualizer.js);
        // clearing here would make pause feel like a hard cut.
    }

    function togglePlay() {
        if (audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    }

    function navigationList() {
        const track = fullPlaylist[currentTrackIndex];
        if (currentFilter === 'favorites') {
            const favs = getFilteredPlaylist();
            return favs.length > 0 ? favs : displayPlaylist;
        }
        if (currentFilter !== 'all' && track && track.persona === currentFilter) {
            return getFilteredPlaylist();
        }
        return displayPlaylist;
    }

    function playTrackAt(index, autoPlay) {
        const list = navigationList();
        if (list.length === 0) return;
        const track = list[index];
        const globalIndex = fullPlaylist.indexOf(track);
        changeTrack(globalIndex >= 0 ? globalIndex : 0, autoPlay);
    }

    function nextTrack() {
        const list = navigationList();
        if (list.length === 0) return;
        const pos = list.indexOf(fullPlaylist[currentTrackIndex]);

        if (isShuffle && list.length > 1) {
            let nextIdx = pos;
            while (nextIdx === pos) {
                nextIdx = Math.floor(Math.random() * list.length);
            }
            playTrackAt(nextIdx, true);
        } else {
            playTrackAt((pos + 1) % list.length, true);
        }
    }

    function prevTrack() {
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        const list = navigationList();
        if (list.length === 0) return;
        const pos = list.indexOf(fullPlaylist[currentTrackIndex]);
        playTrackAt((pos - 1 + list.length) % list.length, true);
    }

    function volumeGainTarget(value = Number(volumeCtrl?.value || '45')) {
        const requested = value / 100;
        return audio.volume > 0 ? Math.min(1, requested / audio.volume) : 1;
    }

    function setVolume(val) {
        const clamped = Math.max(0, Math.min(100, val));
        audio.volume = clamped / 100;
        if (gainNode && audioCtx) {
            gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
            gainNode.gain.setValueAtTime(volumeGainTarget(clamped), audioCtx.currentTime);
        }

        if (volumeCtrl) {
            volumeCtrl.value = clamped;
            volumeCtrl.style.setProperty('--volume-percent', `${clamped}%`);
            volumeCtrl.setAttribute('aria-valuenow', clamped.toString());
        }
        isMuted = clamped === 0;
        if (volumeDockEl) volumeDockEl.classList.toggle('is-muted', isMuted);

        if (!isMuted) {
            safeSet('minkoi_player_volume', clamped.toString());
        }

        if (muteBtn) {
            muteBtn.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
            if (clamped === 0) {
                muteBtn.innerHTML = '<i class="fas fa-volume-xmark" aria-hidden="true"></i>';
                muteBtn.title = 'Bật tiếng (M)';
            } else if (clamped < 40) {
                muteBtn.innerHTML = '<i class="fas fa-volume-low" aria-hidden="true"></i>';
                muteBtn.title = 'Tắt tiếng (M)';
            } else {
                muteBtn.innerHTML = '<i class="fas fa-volume-high" aria-hidden="true"></i>';
                muteBtn.title = 'Tắt tiếng (M)';
            }
        }
    }

    function toggleMute() {
        if (isMuted) {
            setVolume(lastVolume || 45);
        } else {
            lastVolume = parseInt(volumeCtrl?.value || '45', 10);
            setVolume(0);
        }
        volumeThumbCtrl?.pulse?.();
    }

    // Persona & Favorites Playlist Tabs
    function setFilter(key, options) {
        if (key !== 'all' && key !== 'favorites' && !CONFIG.getPersona(key)) key = 'all';
        currentFilter = key;
        safeSet('minkoi_player_filter', key);

        if (categoryNav) {
            categoryNav.querySelectorAll('.cat-tab').forEach(tab => {
                const active = tab.dataset.cat === key;
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
                tab.tabIndex = active ? 0 : -1;
            });
            const activeTab = categoryNav.querySelector('.cat-tab.active');
            if (activeTab && !(options && options.fromLiquidDrag)) {
                // Do not animate the entire category strip on every selection.
                // Smooth-scroll only if the selected tab is actually clipped.
                const margin = 8;
                const viewLeft = categoryNav.scrollLeft;
                const viewRight = viewLeft + categoryNav.clientWidth;
                const tabLeft = activeTab.offsetLeft;
                const tabRight = tabLeft + activeTab.offsetWidth;
                if (tabLeft < viewLeft + margin || tabRight > viewRight - margin) {
                    const targetLeft = tabLeft < viewLeft + margin
                        ? tabLeft - margin
                        : tabRight - categoryNav.clientWidth + margin;
                    const maxLeft = Math.max(0, categoryNav.scrollWidth - categoryNav.clientWidth);
                    // CSS scroll-behavior cannot override a JS 'smooth' request.
                    // Under OS Reduced Motion the strip must land immediately,
                    // otherwise its animation can still be running (and fight
                    // the user's next swipe) after the capsule has settled.
                    const reduced = window.MinkoiSpring?.isAccessibilityReducedMotion?.();
                    categoryNav.scrollTo({
                        left: Math.max(0, Math.min(maxLeft, targetLeft)),
                        behavior: reduced ? 'auto' : 'smooth'
                    });
                }
            }
            if (window.MinkoiUI && typeof window.MinkoiUI.syncTabIndicator === 'function') {
                window.MinkoiUI.syncTabIndicator(categoryNav, setFilter);
            }
        }

        if (options && options.openList && playlistMenu) {
            if (typeof openFlyout === 'function') {
                openFlyout(playlistMenu, playlistToggleBtn, { forceOpen: true });
            } else {
                ensureFlyoutMounted(playlistMenu);
                closeAllFlyouts(playlistMenu);
                playlistMenu.classList.add('open');
                syncFlyoutBackdrop();
            }
        }
        updateCategoryTag();
        if (Number.isInteger(options?.favoriteOnly)) syncFavoriteRow(options.favoriteOnly);
        else updatePlaylistItems();
    }

    // The strip is reconciled in place instead of being re-created.
    // Replacing `innerHTML` destroyed the very buttons a gesture was holding:
    // an in-flight press lost its element, its cached geometry and (on WebKit)
    // its implicit pointer target, which is what made the strip feel unswipeable
    // on real devices. Live nodes are reused, updated only when their label
    // actually changed, and re-appended in the intended order.
    function renderCategoryTabs(favoriteChange) {
        if (!categoryNav) return;
        const favoriteOnly = Number.isInteger(favoriteChange) && currentFilter !== 'favorites';
        const counts = {};
        fullPlaylist.forEach(song => {
            counts[song.persona] = (counts[song.persona] || 0) + 1;
        });

        const desired = [{
            cat: 'all',
            title: '',
            html: `<i class="fas fa-layer-group" aria-hidden="true"></i> All (${fullPlaylist.length})`
        }];

        const favCount = favTrackIds.length;
        if (favCount > 0) {
            desired.push({
                cat: 'favorites',
                title: 'Bài hát yêu thích',
                html: `<i class="fas fa-heart" style="color: #f43f5e;" aria-hidden="true"></i> Yêu thích` +
                    `<span class="cat-count">${favCount}</span>`
            });
        }

        CONFIG.personas
            .filter(p => p.available && counts[p.key])
            .forEach(p => {
                desired.push({
                    cat: p.key,
                    title: p.name,
                    html: `<i class="fas fa-music" aria-hidden="true"></i> ${p.name}` +
                        `<span class="cat-count">${counts[p.key]}</span>`
                });
            });

        const wanted = new Set(desired.map(spec => spec.cat));
        const existing = new Map();
        categoryNav.querySelectorAll('.cat-tab').forEach(tab => {
            if (wanted.has(tab.dataset.cat)) existing.set(tab.dataset.cat, tab);
            else tab.remove();
        });

        let nextTab = categoryNav.querySelector('.cat-tab');
        desired.forEach(spec => {
            let tab = existing.get(spec.cat);
            if (!tab) {
                tab = document.createElement('button');
                tab.className = 'cat-tab';
                tab.dataset.cat = spec.cat;
                tab.setAttribute('role', 'tab');
                tab.type = 'button';
            }
            if (tab.dataset.tabLabel !== spec.html) {
                tab.innerHTML = spec.html;
                tab.dataset.tabLabel = spec.html;
            }
            if (spec.title) tab.title = spec.title;
            // Leave already-ordered nodes attached: moving every button through
            // appendChild can lose focus/implicit pointer capture during updates.
            if (tab !== nextTab) categoryNav.insertBefore(tab, nextTab);
            nextTab = tab.nextElementSibling;
            while (nextTab && !nextTab.matches('.cat-tab')) nextTab = nextTab.nextElementSibling;
        });

        // Un-favouriting the last track while the Yêu thích filter is active
        // would otherwise leave a filter whose tab no longer exists.
        if (currentFilter === 'favorites' && favCount === 0) {
            currentFilter = 'all';
            safeSet('minkoi_player_filter', 'all');
        }

        setFilter(currentFilter, favoriteOnly ? { favoriteOnly: favoriteChange } : undefined);
    }

    if (categoryNav) {
        categoryNav.addEventListener('click', (e) => {
            const tab = e.target.closest('.cat-tab');
            if (!tab) return;
            setFilter(tab.dataset.cat);
        });
        categoryNav.addEventListener('keydown', (e) => {
            const tab = e.target.closest('.cat-tab');
            if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
            const tabs = Array.from(categoryNav.querySelectorAll('.cat-tab'));
            const index = tabs.indexOf(tab);
            const nextIndex = e.key === 'Home' ? 0 : (e.key === 'End' ? tabs.length - 1
                : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length);
            e.preventDefault();
            e.stopPropagation();
            tabs[nextIndex].focus({ preventScroll: true });
            setFilter(tabs[nextIndex].dataset.cat);
            window.MinkoiFeedback?.selection();
        });
    }

    if (trackCatEl) {
        trackCatEl.setAttribute('role', 'button');
        trackCatEl.setAttribute('tabindex', '0');
        const triggerCatList = () => {
            const key = trackCatEl.dataset.persona;
            if (key) setFilter(key, { openList: true });
        };
        trackCatEl.addEventListener('click', triggerCatList);
        trackCatEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerCatList();
            }
        });
    }

    // Persona changed by avatar.js — schedule filter/capsule layout read in the
    // upcoming animation frame so :root token mutation never forces synchronous layout.
    let pendingPersonaFilterRaf = 0;
    let pendingPersonaFilterKey = null;
    window.addEventListener('minkoi:persona', (e) => {
        const key = e.detail && e.detail.key;
        // Artwork preload finishes asynchronously on boot. It must not replace
        // the user's restored playlist filter; explicit persona changes still do.
        if (!key || e.detail.initial) return;
        pendingPersonaFilterKey = key;
        if (!pendingPersonaFilterRaf) {
            pendingPersonaFilterRaf = requestAnimationFrame(() => {
                pendingPersonaFilterRaf = 0;
                const nextKey = pendingPersonaFilterKey;
                pendingPersonaFilterKey = null;
                if (nextKey) setFilter(nextKey);
            });
        }
    });

    // Audio Progress & Seek Bar with Pointer Dragging (Scrubbing)
    let pendingScrubPos = null;

    function getSeekPos(clientX, rectOverride) {
        if (!seekContainer) return 0;
        const rect = rectOverride && rectOverride.width ? rectOverride : seekContainer.getBoundingClientRect();
        if (!rect.width) return 0;
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    }

    // Dual-Sided Time Display with Remaining Time Mode
    let isRemainingTimeMode = false;
    let lastCurrentTimeText = '';
    let lastTotalTimeText = '';

    function updateTimeDisplay(current, duration) {
        if (currentTimeEl) {
            const curText = formatTime(current);
            if (curText !== lastCurrentTimeText) {
                lastCurrentTimeText = curText;
                currentTimeEl.textContent = curText;
            }
        }
        if (totalTimeEl && duration && !isNaN(duration)) {
            if (isRemainingTimeMode) {
                const remaining = Math.max(0, duration - current);
                const remText = `-${formatTime(remaining)}`;
                if (remText !== lastTotalTimeText) {
                    lastTotalTimeText = remText;
                    totalTimeEl.textContent = remText;
                    totalTimeEl.title = 'Nhấp để xem tổng thời lượng';
                }
            } else {
                const durText = formatTime(duration);
                if (durText !== lastTotalTimeText) {
                    lastTotalTimeText = durText;
                    totalTimeEl.textContent = durText;
                    totalTimeEl.title = 'Nhấp để xem thời gian còn lại';
                }
            }
        }
    }

    if (totalTimeEl) {
        totalTimeEl.addEventListener('click', () => {
            if (!audio.duration) return;
            isRemainingTimeMode = !isRemainingTimeMode;
            updateTimeDisplay(audio.currentTime, audio.duration);
        });
    }

    function seekToPosition(clientX, commitAudio = true, posOverride = null) {
        if (!audio.duration || !seekContainer) return;
        const pos = typeof posOverride === 'number' ? Math.max(0, Math.min(1, posOverride)) : getSeekPos(clientX);
        pendingScrubPos = pos;
        if (commitAudio) {
            audio.currentTime = pos * audio.duration;
        }
        setSeekProgressUI(pos);
        updateTimeDisplay(pos * audio.duration, audio.duration);
        seekContainer.setAttribute('aria-valuenow', Math.round(pos * 100).toString());
    }

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration || isScrubbing) return;

        const pos = audio.currentTime / audio.duration;
        const pct = pos * 100;
        setSeekProgressUI(pos);
        updateTimeDisplay(audio.currentTime, audio.duration);
        if (seekContainer) seekContainer.setAttribute('aria-valuenow', Math.round(pct).toString());

        // Preload next track when near end (> 85%)
        if (pct > 85 && !hasPreloadedNext) {
            hasPreloadedNext = true;
            preloadNextTrack();
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration) {
            updateTimeDisplay(audio.currentTime, audio.duration);
        }
    });

    audio.addEventListener('ended', () => {
        if (sleepTimerMode === 'track') {
            stopSleepTimer();
            pauseAudio();
            if (typeof window.showToast === 'function') {
                window.showToast('Hẹn giờ: Đã dừng phát sau khi hết bài', 'fa-moon');
            }
            return;
        }

        const list = navigationList();
        if (repeatMode === 'one') {
            cancelRepeatSeek();
            const source = audio.currentSrc || audio.src;
            const resume = () => {
                cancelRepeatSeek();
                if (repeatMode === 'one' && (audio.currentSrc || audio.src) === source &&
                    audio.currentTime < 0.1) playAudio();
            };
            // Windows WebKit can resolve play() at the old EOS and pause again
            // before this rewind completes. Restart after the media seek, not
            // after an arbitrary delay. User pause/track/mode changes cancel it.
            repeatSeekCleanup = () => {
                audio.removeEventListener('seeked', resume);
                repeatSeekCleanup = null;
            };
            audio.addEventListener('seeked', resume, { once: true });
            audio.currentTime = 0;
            if (!audio.seeking) resume();
        } else if (repeatMode === 'none' && list[list.length - 1] === fullPlaylist[currentTrackIndex]) {
            // End the active queue, not the global catalogue. Mahiru's final
            // vocal (ID 34) is followed by instrumentals; ID 11 ends her queue.
            pauseAudio();
        } else {
            nextTrack();
        }
    });

    audio.addEventListener('error', () => {
        const code = audio.error ? audio.error.code : 0;
        const message = audio.error ? audio.error.message : 'N/A';
        const track = fullPlaylist[currentTrackIndex];
        const requestedUrl = audio.currentSrc || audio.src || (track ? track.file : '');
        console.error(`[Audio Error] Mã lỗi: ${code} (Code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED), Message: "${message}", URL đã request: "${requestedUrl}"`);

        // Tự động thử lại 1 lần với URL gốc nếu chưa thử
        if (!hasRetriedCurrentTrack && track) {
            hasRetriedCurrentTrack = true;
            const wasPlaying = !audio.paused;
            console.warn(`[Audio Retry] Đang thử tải lại bài hát lần 1 với URL gốc: "${track.file}"`);
            audio.src = track.file;
            audio.load();
            if (wasPlaying) {
                audio.play().catch(err => console.debug('[Audio Retry Play Deferred]', err));
            }
            return;
        }

        if (audioAlert) {
            audioAlert.classList.remove('hidden');
            audioAlert.innerHTML = `
                <div class="audio-alert-inner">
                    <span class="audio-alert-msg"><i class="fas fa-triangle-exclamation"></i> Không thể phát bài hát này (Mã lỗi ${code}: File không tìm thấy hoặc trình duyệt không hỗ trợ)</span>
                    <div class="audio-alert-actions">
                        <button class="audio-alert-btn retry-btn" type="button" title="Thử kết nối lại"><i class="fas fa-rotate-right"></i> Thử lại</button>
                        <button class="audio-alert-btn skip-btn" type="button" title="Bỏ qua và chuyển sang bài tiếp theo"><i class="fas fa-forward-step"></i> Bài khác</button>
                    </div>
                </div>
            `;
            audioAlert.querySelector('.retry-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                audioAlert.classList.add('hidden');
                hasRetriedCurrentTrack = false;
                loadTrack(currentTrackIndex, true);
            });
            audioAlert.querySelector('.skip-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                audioAlert.classList.add('hidden');
                hasRetriedCurrentTrack = false;
                nextTrack();
            });
        }

        // KHÔNG tự động chuyển bài khi lỗi: dừng lại để tránh spam request và cho người dùng chủ động kiểm tra
        pauseAudio();
    });

    audio.addEventListener('canplay', () => {
        if (audioAlert) audioAlert.classList.add('hidden');
    });

    // Feedback is separate from the actual media position. Only the small
    // thumb springs; the hit area, slider dock and audio value do not deform.
    function bindSliderThumb(surface, property, rest, held) {
        const motion = window.MinkoiSpring;
        if (!motion) return { pulse() {} };
        const spring = motion.createSpring({
            initial: rest, preset: motion.PRESETS.SLIDER_SETTLE, precision: .002,
            onUpdate: value => {
                if (motion.isAccessibilityReducedMotion() || Math.abs(value - rest) < .0025) {
                    surface.style.removeProperty(property);
                } else {
                    surface.style.setProperty(property, value.toFixed(3));
                }
            }
        });
        let pointer = null;
        surface.addEventListener('pointerdown', e => {
            if (pointer !== null || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
            if (motion.isAccessibilityReducedMotion()) {
                spring.snap(rest);
                surface.style.removeProperty(property);
                return;
            }
            pointer = e.pointerId;
            spring.setTarget(held, motion.PRESETS.SLIDER_DRAG);
        }, { passive: true });
        const release = e => {
            if (pointer === null || (e?.pointerId !== undefined && pointer !== e.pointerId)) return;
            pointer = null;
            if (motion.isAccessibilityReducedMotion()) {
                spring.snap(rest);
                surface.style.removeProperty(property);
                return;
            }
            spring.setTarget(rest, motion.PRESETS.SLIDER_SETTLE);
        };
        for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) {
            surface.addEventListener(event, release, { passive: true });
        }
        window.addEventListener('pointerup', release, { passive: true });
        window.addEventListener('blur', release);
        return {
            pulse() {
                if (pointer !== null || motion.isAccessibilityReducedMotion()) return;
                spring.setTarget(rest, motion.PRESETS.SLIDER_SETTLE);
                spring.impulse((held - rest) * 10);
            },
            reset() {
                pointer = null;
                if (motion.isAccessibilityReducedMotion()) {
                    spring.snap(rest);
                    surface.style.removeProperty(property);
                } else {
                    spring.setTarget(rest, motion.PRESETS.SLIDER_SETTLE);
                }
            }
        };
    }

    if (seekContainer) {
        const progressWrap = seekContainer.closest('.playback-progress-wrap');
        const seekThumbCtrl = bindSliderThumb(seekContainer, '--seek-thumb-scale', 0.88, 1.22);

        let seekTipTime = null;
        let seekTipLyric = null;
        if (seekTip) {
            seekTip.textContent = '';
            seekTipTime = document.createElement('span');
            seekTipTime.className = 'seek-tip-time';
            seekTipTime.textContent = '0:00';
            seekTipLyric = document.createElement('span');
            seekTipLyric.className = 'seek-tip-lyric';
            seekTip.appendChild(seekTipTime);
            seekTip.appendChild(seekTipLyric);
        }

        let activeSeekPointerId = null;
        let scrubRect = null;
        let cachedTipWidth = 54;
        let lastTipSec = -1;
        let lastPeekBucket = -1;
        let lastPeekKey = '';

        // Track tooltip width passively via ResizeObserver so scrubbing never forces synchronous reflows.
        if (seekTip && typeof ResizeObserver === 'function') {
            const tipRO = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;
                const box = entry.borderBoxSize && entry.borderBoxSize[0];
                const w = box ? box.inlineSize : entry.contentRect.width;
                if (w > 20) cachedTipWidth = w;
            });
            tipRO.observe(seekTip);
        }

        function hideSeekTooltip() {
            if (!seekTip) return;
            seekTip.classList.remove('visible', 'has-lyric');
            if (seekTipLyric) seekTipLyric.textContent = '';
            lastTipSec = -1;
            lastPeekBucket = -1;
            lastPeekKey = '';
            cachedTipWidth = 54;
        }

        function updateSeekTooltip(pos, rect, allowLyricPeek) {
            if (!seekTip || !seekContainer || !rect || !rect.width) return;
            const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
            const previewSec = pos * duration;
            const secFloor = Math.floor(previewSec);
            const vw = window.innerWidth || document.documentElement.clientWidth || rect.width;

            if (seekTipTime && secFloor !== lastTipSec) {
                lastTipSec = secFloor;
                seekTipTime.textContent = formatTime(previewSec);
            }

            if (allowLyricPeek && duration > 0 && seekTipLyric) {
                const bucket = Math.floor(previewSec * 4);
                if (bucket !== lastPeekBucket) {
                    lastPeekBucket = bucket;
                    const peek = window.MinkoiLyrics?.controller?.peekLineAt?.(previewSec) || null;
                    const nextKey = peek ? `${peek.index}:${peek.text}` : '';
                    if (nextKey !== lastPeekKey) {
                        const hadLyric = Boolean(lastPeekKey);
                        lastPeekKey = nextKey;
                        seekTipLyric.textContent = peek ? peek.text : '';
                        seekTip.classList.toggle('has-lyric', Boolean(peek));
                        if (!peek) {
                            cachedTipWidth = 54;
                        } else if (!hadLyric) {
                            // Safe frame-0 conservative bound before ResizeObserver delivers exact width
                            cachedTipWidth = Math.min(vw <= 430 ? 224 : 268, Math.max(120, vw - 28));
                        }
                    }
                }
            } else if (lastPeekKey) {
                lastPeekKey = '';
                lastPeekBucket = -1;
                if (seekTipLyric) seekTipLyric.textContent = '';
                seekTip.classList.remove('has-lyric');
                cachedTipWidth = 54;
            }

            if (!seekTip.classList.contains('visible')) {
                seekTip.classList.add('visible');
            }

            const halfTip = cachedTipWidth / 2;
            const edgePad = 12;
            const minFromViewport = (edgePad + halfTip) - rect.left;
            const maxFromViewport = (vw - edgePad - halfTip) - rect.left;
            const minX = Math.max(halfTip, minFromViewport);
            const maxX = Math.min(rect.width - halfTip, maxFromViewport);
            const px = pos * rect.width;
            const clampedPx = minX <= maxX ? Math.max(minX, Math.min(maxX, px)) : (rect.width / 2);
            seekTip.style.setProperty('--tip-x', `${clampedPx.toFixed(1)}px`);
        }

        const setScrubClasses = (active) => {
            seekContainer.classList.toggle('is-scrubbing', active);
            if (progressWrap) progressWrap.classList.toggle('is-scrubbing', active);
        };

        resetSeekScrubState = () => {
            isScrubbing = false;
            activeSeekPointerId = null;
            scrubRect = null;
            pendingScrubPos = null;
            setScrubClasses(false);
            hideSeekTooltip();
            seekThumbCtrl?.reset?.();
        };

        seekContainer.addEventListener('pointerdown', (e) => {
            if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
            isScrubbing = true;
            activeSeekPointerId = e.pointerId;
            scrubRect = seekContainer.getBoundingClientRect();
            setScrubClasses(true);
            const pos = getSeekPos(e.clientX, scrubRect);
            updateSeekTooltip(pos, scrubRect, true);
            try { seekContainer.setPointerCapture(e.pointerId); } catch (_) {}
            seekToPosition(e.clientX, false, pos);
        });

        seekContainer.addEventListener('pointermove', (e) => {
            if (isScrubbing) {
                if (activeSeekPointerId !== null && e.pointerId !== activeSeekPointerId) return;
                const rect = scrubRect && scrubRect.width ? scrubRect : seekContainer.getBoundingClientRect();
                const pos = getSeekPos(e.clientX, rect);
                updateSeekTooltip(pos, rect, true);
                seekToPosition(e.clientX, false, pos);
                return;
            }
            if (e.pointerType !== 'mouse' || !audio.duration) return;
            const rect = seekContainer.getBoundingClientRect();
            const pos = getSeekPos(e.clientX, rect);
            updateSeekTooltip(pos, rect, true);
        });

        seekContainer.addEventListener('pointerup', (e) => {
            if (!isScrubbing) return;
            if (activeSeekPointerId !== null && e.pointerId !== activeSeekPointerId) return;
            const rect = scrubRect && scrubRect.width ? scrubRect : seekContainer.getBoundingClientRect();
            const pos = getSeekPos(e.clientX, rect);
            isScrubbing = false;
            activeSeekPointerId = null;
            scrubRect = null;
            setScrubClasses(false);
            hideSeekTooltip();
            try { seekContainer.releasePointerCapture(e.pointerId); } catch (_) {}
            seekToPosition(e.clientX, true, pos);
        });

        const cancelSeek = (e) => {
            if (!isScrubbing) return;
            if (e?.pointerId !== undefined && activeSeekPointerId !== null && e.pointerId !== activeSeekPointerId) return;
            isScrubbing = false;
            activeSeekPointerId = null;
            scrubRect = null;
            setScrubClasses(false);
            hideSeekTooltip();
            pendingScrubPos = null;
            if (audio.duration) {
                const pos = audio.currentTime / audio.duration;
                setSeekProgressUI(pos);
                updateTimeDisplay(audio.currentTime, audio.duration);
                seekContainer.setAttribute('aria-valuenow', Math.round(pos * 100).toString());
            }
        };
        seekContainer.addEventListener('pointercancel', cancelSeek);
        seekContainer.addEventListener('lostpointercapture', cancelSeek);

        seekContainer.addEventListener('mouseleave', () => {
            if (!isScrubbing) hideSeekTooltip();
        });

        window.addEventListener('resize', () => {
            scrubRect = null;
        }, { passive: true });

        // Keyboard accessibility for Seek Bar (instant visual sync even when paused)
        seekContainer.addEventListener('keydown', (e) => {
            if (!audio.duration) return;
            let nextTime = null;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                nextTime = Math.max(0, audio.currentTime - 5);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextTime = Math.min(audio.duration, audio.currentTime + 5);
            } else if (e.key === 'Home') {
                e.preventDefault();
                nextTime = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                nextTime = audio.duration;
            }
            if (nextTime !== null) {
                audio.currentTime = nextTime;
                const pos = nextTime / audio.duration;
                setSeekProgressUI(pos);
                updateTimeDisplay(nextTime, audio.duration);
                seekContainer.setAttribute('aria-valuenow', Math.round(pos * 100).toString());
            }
        });
    }

    // Controls Buttons
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);

    // Zen Mode Dock Controls
    if (zenPrevBtn) {
        zenPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevTrack();
        });
    }
    if (zenNextBtn) {
        zenNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextTrack();
        });
    }
    if (zenPlayBtn) {
        zenPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }

    // Playback Speed Controller Button
    function updateSpeedUI() {
        const cur = SPEED_PRESETS[currentSpeedIndex];
        if (cur) {
            audio.playbackRate = cur.rate;
            if (speedLabel) speedLabel.textContent = cur.label;
            if (speedBtn) {
                speedBtn.classList.toggle('active', cur.rate !== 1.0);
                speedBtn.title = `Tốc độ: ${cur.label} · Nhấn để đổi`;
            }
        }
    }

    if (speedBtn) {
        updateSpeedUI();
        speedBtn.addEventListener('click', () => {
            currentSpeedIndex = (currentSpeedIndex + 1) % SPEED_PRESETS.length;
            safeSet('minkoi_player_speed_idx', currentSpeedIndex.toString());
            updateSpeedUI();
            const cur = SPEED_PRESETS[currentSpeedIndex];
            if (typeof window.showToast === 'function') {
                window.showToast(cur.toast, cur.rate > 1.0 ? 'fa-forward' : (cur.rate < 1.0 ? 'fa-backward' : 'fa-play'));
            }
        });
    }

    if (volumeCtrl) {
        const volumeDock = volumeDockEl || volumeCtrl.closest('.volume-slider-dock');
        volumeThumbCtrl = bindSliderThumb(volumeCtrl, '--volume-thumb-scale', 1, 1.18);
        volumeCtrl.addEventListener('input', (e) => {
            setVolume(parseInt(e.target.value, 10));
        });
        volumeCtrl.addEventListener('pointerdown', (event) => {
            if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
            try { volumeCtrl.setPointerCapture(event.pointerId); } catch (_) {}
            volumeCtrl.classList.add('is-scrubbing');
            if (volumeDock) volumeDock.classList.add('is-scrubbing');
        });
        const stopVolScrub = () => {
            volumeCtrl.classList.remove('is-scrubbing');
            if (volumeDock) volumeDock.classList.remove('is-scrubbing');
        };
        volumeCtrl.addEventListener('pointerup', stopVolScrub);
        volumeCtrl.addEventListener('pointercancel', stopVolScrub);
        volumeCtrl.addEventListener('blur', stopVolScrub);
        volumeCtrl.addEventListener('lostpointercapture', stopVolScrub);
        window.addEventListener('pointerup', stopVolScrub, { passive: true });
    }

    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            safeSet('minkoi_player_shuffle', isShuffle.toString());
            shuffleBtn.classList.toggle('active', isShuffle);
            if (typeof window.showToast === 'function') {
                window.showToast(isShuffle ? 'Phát ngẫu nhiên: Bật' : 'Phát ngẫu nhiên: Tắt', 'fa-shuffle');
            }
        });
    }

    if (repeatBtn) {
        function updateRepeatUI() {
            if (repeatMode === 'all') {
                repeatBtn.className = 'ctrl-btn repeat-btn active';
                repeatBtn.innerHTML = '<i class="fas fa-repeat" aria-hidden="true"></i>';
                repeatBtn.title = 'Lặp lại: Tất cả';
            } else if (repeatMode === 'one') {
                repeatBtn.className = 'ctrl-btn repeat-btn active repeat-one';
                repeatBtn.innerHTML = '<i class="fas fa-repeat" aria-hidden="true"></i><span class="repeat-one-badge" aria-hidden="true">1</span>';
                repeatBtn.title = 'Lặp lại: 1 bài';
            } else {
                repeatBtn.className = 'ctrl-btn repeat-btn';
                repeatBtn.innerHTML = '<i class="fas fa-repeat" aria-hidden="true"></i>';
                repeatBtn.title = 'Lặp lại: Tắt';
            }
        }
        updateRepeatUI();

        repeatBtn.addEventListener('click', () => {
            cancelRepeatSeek();
            if (repeatMode === 'all') repeatMode = 'one';
            else if (repeatMode === 'one') repeatMode = 'none';
            else repeatMode = 'all';
            safeSet('minkoi_player_repeat', repeatMode);
            updateRepeatUI();
            if (typeof window.showToast === 'function') {
                const label = repeatMode === 'all' ? 'Lặp lại: Tất cả' : (repeatMode === 'one' ? 'Lặp lại: 1 bài' : 'Lặp lại: Tắt');
                window.showToast(label, 'fa-repeat');
            }
        });
    }

    // Audio FX Equalizer Menu & Crossfade Controller
    const EQ_BAND_NAMES = ['60Hz', '250Hz', '1kHz', '4kHz', '12kHz'];

    function mountFlyoutForViewport() {
        const isMobile = window.innerWidth <= 860;
        const flyoutConfigs = [
            { menu: audioFxMenu, btn: audioFxBtn },
            { menu: sleepTimerMenu, btn: sleepTimerBtn },
            { menu: playlistMenu, btn: playlistToggleBtn }
        ];
        flyoutConfigs.forEach(({ menu, btn }) => {
            if (!menu || !btn) return;
            const wrapper = btn.closest('.dropdown-wrapper');
            if (isMobile) {
                if (menu.parentElement !== document.body) {
                    document.body.appendChild(menu);
                }
            } else {
                if (wrapper && menu.parentElement !== wrapper) {
                    wrapper.appendChild(menu);
                }
            }
        });
    }

    function ensureFlyoutMounted(menu) {
        if (!menu) return;
        if (window.innerWidth <= 860) {
            if (menu.parentElement !== document.body) {
                document.body.appendChild(menu);
            }
        }
    }

    let activeFlyoutLock = false;
    let releaseFlyoutTrap = null;

    function syncFlyoutBackdrop() {
        // Unified controllers own the backdrop and scroll lock, including Lyrics.
        if (window.MinkoiUI?.getPanelController('playlist-menu')) return;
        const backdrop = document.getElementById('mobile-flyout-backdrop');
        const hasOpen = !!(
            playlistMenu?.classList.contains('open') ||
            audioFxMenu?.classList.contains('open') ||
            sleepTimerMenu?.classList.contains('open')
        );
        const isMobile = window.innerWidth <= 860;
        if (backdrop) {
            backdrop.classList.toggle('active', hasOpen && isMobile);
        }
        if (audioFxBtn) audioFxBtn.setAttribute('aria-expanded', audioFxMenu?.classList.contains('open') ? 'true' : 'false');
        if (sleepTimerBtn) sleepTimerBtn.setAttribute('aria-expanded', sleepTimerMenu?.classList.contains('open') ? 'true' : 'false');
        if (playlistToggleBtn) playlistToggleBtn.setAttribute('aria-expanded', playlistMenu?.classList.contains('open') ? 'true' : 'false');

        if (window.MinkoiUI) {
            if (hasOpen && isMobile && !activeFlyoutLock) {
                activeFlyoutLock = true;
                window.MinkoiUI.lockBodyScroll();
            } else if ((!hasOpen || !isMobile) && activeFlyoutLock) {
                activeFlyoutLock = false;
                window.MinkoiUI.unlockBodyScroll();
            }
        }
    }

    function positionDesktopFlyout(menu, triggerBtn) {
        if (!menu || !triggerBtn) return;
        menu.classList.remove('is-flipped');
        menu.style.maxHeight = '';
        menu.style.overflowY = '';
        if (window.innerWidth <= 860) return;

        // Tool popovers must stay BELOW the Studio Audio Suite title. On short
        // desktop windows (or an Android phone using desktop-site mode) there
        // is not enough room for six timer options above the action button.
        // Clip to the available space and scroll the menu, never the whole page.
        const trigger = triggerBtn.getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const suite = triggerBtn.closest?.('.studio-audio-suite');
        const header = suite?.querySelector('.suite-header-row');
        const headerBottom = header?.getBoundingClientRect().bottom;
        const topSafe = Math.max(
            16,
            Math.min(trigger.top - 24,
                Number.isFinite(headerBottom) ? headerBottom + 14
                    : Math.min(96, Math.round(viewportHeight * 0.16)))
        );
        const availableAbove = Math.max(0, trigger.top - topSafe - 12);
        const availableBelow = Math.max(0, viewportHeight - trigger.bottom - 16);
        const desiredHeight = Math.max(menu.scrollHeight, menu.getBoundingClientRect().height);
        const flipUp = desiredHeight > availableBelow && availableAbove > availableBelow;
        const available = flipUp ? availableAbove : availableBelow;

        menu.classList.toggle('is-flipped', flipUp);
        menu.style.maxHeight = Math.floor(available) + 'px';
        menu.style.overflowY = 'auto';
        menu.style.overscrollBehavior = 'contain';
        menu.style.transformOrigin = flipUp ? 'bottom center' : 'top center';
    }

    let sleepTimerOverlay = null;
    let audioFxOverlay = null;
    let playlistOverlay = null;

    function shouldAutoFocusPlaylistSearch() {
        // Android desktop-site mode may expose a wide CSS viewport, but still
        // has a touch pointer and on-screen keyboard.
        return window.innerWidth > 860 &&
            !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) &&
            !(window.navigator && window.navigator.maxTouchPoints > 0);
    }

    function initToolPanelControllers() {
        if (!window.MinkoiUI || typeof window.MinkoiUI.createMiuixPanelOverlay !== 'function') return;

        if (sleepTimerMenu && !sleepTimerOverlay) {
            sleepTimerOverlay = window.MinkoiUI.createMiuixPanelOverlay({
                id: 'sleep-timer-menu',
                panelEl: sleepTimerMenu,
                triggerBtn: sleepTimerBtn,
                align: 'left',
                onBeforeOpen: () => {
                    renderSleepTimerMenu();
                }
            });
        }

        if (audioFxMenu && !audioFxOverlay) {
            audioFxOverlay = window.MinkoiUI.createMiuixPanelOverlay({
                id: 'audio-fx-menu',
                panelEl: audioFxMenu,
                triggerBtn: audioFxBtn,
                align: 'center',
                onBeforeOpen: () => {
                    renderFxMenu();
                }
            });
        }

        if (playlistMenu && !playlistOverlay) {
            playlistOverlay = window.MinkoiUI.createMiuixPanelOverlay({
                id: 'playlist-menu',
                panelEl: playlistMenu,
                triggerBtn: playlistToggleBtn,
                align: 'right',
                onBeforeOpen: () => {
                    if (!document.getElementById('playlist-items-scroll')) {
                        buildPlaylistShell();
                    }
                    updatePlaylistItems();
                },
                onAfterOpen: () => {
                    const input = document.getElementById('playlist-search-input');
                    if (input && shouldAutoFocusPlaylistSearch()) {
                        setTimeout(() => {
                            if (playlistOverlay?.isOpen() && shouldAutoFocusPlaylistSearch()) {
                                input.focus({ preventScroll: true });
                            }
                        }, 80);
                    }
                }
            });
        }
    }

    function openFlyout(menu, triggerBtn, opts) {
        if (!menu) return;
        const ctrl = window.MinkoiUI && typeof window.MinkoiUI.getPanelController === 'function'
            ? window.MinkoiUI.getPanelController(menu.id)
            : null;
        if (ctrl) {
            if (opts && opts.forceOpen) {
                ctrl.open();
            } else {
                ctrl.toggle();
            }
            return;
        }

        const willOpen = (opts && opts.forceOpen) ? true : !menu.classList.contains('open');
        if (window.MinkoiUI && typeof window.MinkoiUI.closeAllOverlays === 'function') {
            window.MinkoiUI.closeAllOverlays(menu.id);
        }
        closeAllFlyouts(menu, { restoreFocus: false });
        if (willOpen) {
            ensureFlyoutMounted(menu);
            if (menu === playlistMenu && triggerBtn && window.innerWidth > 860) {
                const tRect = triggerBtn.getBoundingClientRect();
                const mRect = menu.getBoundingClientRect();
                if (mRect.width > 0 && mRect.height > 0) {
                    const ox = Math.round(tRect.left + tRect.width / 2 - mRect.left);
                    const oy = Math.round(tRect.top + tRect.height / 2 - mRect.top);
                    menu.style.transformOrigin = `${ox}px ${oy}px`;
                }
            }
            if (triggerBtn) triggerBtn.classList.add('is-morph-active');
            menu.classList.add('open');
            positionDesktopFlyout(menu, triggerBtn);
            if (releaseFlyoutTrap) {
                const prevFn = releaseFlyoutTrap;
                releaseFlyoutTrap = null;
                prevFn({ restoreFocus: false });
            }
            if (window.MinkoiUI && typeof window.MinkoiUI.pushFocusTrap === 'function') {
                releaseFlyoutTrap = window.MinkoiUI.pushFocusTrap(menu, triggerBtn);
            }
        } else {
            if (triggerBtn) triggerBtn.classList.remove('is-morph-active');
            menu.classList.remove('open');
            if (releaseFlyoutTrap) {
                const fn = releaseFlyoutTrap;
                releaseFlyoutTrap = null;
                fn({ restoreFocus: true });
            }
        }
        syncFlyoutBackdrop();
    }

    function renderFxMenu() {
        if (!audioFxMenu) return;
        audioFxMenu.innerHTML = `
            <div class="sheet-drag-handle" aria-hidden="true"></div>
            <div class="menu-header">
                <span><i class="fas fa-sliders"></i> STUDIO 5-BAND EQUALIZER</span>
                <button class="flyout-close-btn" type="button" aria-label="Đóng"><i class="fas fa-xmark"></i></button>
            </div>

            <!-- 5-Band Interactive Sliders -->
            <div class="eq-bands-wrapper" title="Kéo thanh trượt để tinh chỉnh dải tần tùy thích">
                ${EQ_BAND_NAMES.map((name, idx) => `
                    <div class="eq-band-col">
                        <span class="eq-band-val" id="eq-val-${idx}">${eqBandGains[idx] > 0 ? '+' : ''}${eqBandGains[idx]}dB</span>
                        <div class="eq-band">
                            <input type="range" class="eq-slider" min="-12" max="12" step="1" value="${eqBandGains[idx]}" data-band="${idx}" aria-label="Band ${name}">
                        </div>
                        <span class="eq-band-label">${name}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Presets Grid -->
            <div class="menu-header" style="margin-top: 0.4rem; font-size: 0.65rem;">
                <span>CÁC BỘ LỌC TỐI ƯU SẴN (PRESETS)</span>
            </div>
            <div class="menu-items" style="max-height: 180px; overflow-y: auto;">
                ${CONFIG.audioFx.presets.map(p => `
                    <button class="fx-option ${p.id === currentAudioFx ? 'active' : ''}" data-fx="${p.id}" type="button">
                        <i class="fas ${p.icon}"></i>
                        <span class="fx-meta">
                            <strong>${p.name}</strong>
                            <small>${p.desc}</small>
                        </span>
                        ${p.id === currentAudioFx ? '<i class="fas fa-check fx-check"></i>' : ''}
                    </button>
                `).join('')}
            </div>

            <!-- Crossfade Transition Toggle -->
            <div class="crossfade-row">
                <div class="crossfade-meta">
                    <span class="crossfade-title"><i class="fas fa-wave-square"></i> Chuyển bài êm dịu (Crossfade)</span>
                    <span class="crossfade-desc">Tự động hòa âm mượt mà khi đổi bài</span>
                </div>
                <button class="crossfade-toggle ${isCrossfadeActive ? 'active' : ''}" id="crossfade-toggle-btn" type="button" role="switch" aria-checked="${isCrossfadeActive}">
                    <span class="toggle-knob"></span>
                </button>
            </div>
        `;

        audioFxMenu.querySelector('.flyout-close-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllFlyouts();
        });

        // Bind preset click
        audioFxMenu.querySelectorAll('.fx-option').forEach(btn => {
            btn.addEventListener('click', () => {
                applyEqPreset(btn.dataset.fx);
                if (typeof window.showToast === 'function') {
                    const preset = CONFIG.audioFx.presets.find(x => x.id === btn.dataset.fx);
                    window.showToast(`Equalizer: ${preset ? preset.name : btn.dataset.fx}`, 'fa-sliders');
                }
            });
        });

        // Bind 5-band slider input
        audioFxMenu.querySelectorAll('.eq-slider').forEach(slider => {
            slider.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
            slider.addEventListener('input', (e) => {
                const bandIdx = parseInt(slider.dataset.band, 10);
                const val = parseInt(e.target.value, 10);
                setCustomEqBand(bandIdx, val);
                const valEl = document.getElementById(`eq-val-${bandIdx}`);
                if (valEl) valEl.textContent = `${val > 0 ? '+' : ''}${val}dB`;
            });
        });

        // Bind crossfade toggle with Miuix Switch physics
        const crossfadeBtn = audioFxMenu.querySelector('#crossfade-toggle-btn');
        if (crossfadeBtn) {
            const commitCrossfade = (nextVal) => {
                isCrossfadeActive = nextVal;
                safeSet('minkoi_crossfade', isCrossfadeActive.toString());
                crossfadeBtn.classList.toggle('active', isCrossfadeActive);
                crossfadeBtn.setAttribute('aria-checked', isCrossfadeActive);
                if (typeof window.showToast === 'function') {
                    window.showToast(`Crossfade: ${isCrossfadeActive ? 'Đang bật (0.5s hòa âm)' : 'Đã tắt'}`, 'fa-wave-square');
                }
            };
            if (window.MinkoiUI && typeof window.MinkoiUI.bindMiuixSwitch === 'function') {
                window.MinkoiUI.bindMiuixSwitch(crossfadeBtn, () => isCrossfadeActive, commitCrossfade);
            } else {
                crossfadeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    commitCrossfade(!isCrossfadeActive);
                });
            }
        }
    }

    if (audioFxBtn && audioFxMenu) {
        audioFxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openFlyout(audioFxMenu, audioFxBtn);
        });
    }

    // Sleep Timer Feature
    const SLEEP_OPTIONS = [
        { id: 'off', label: 'Tắt hẹn giờ', minutes: 0 },
        { id: '15', label: '15 phút', minutes: 15 },
        { id: '30', label: '30 phút', minutes: 30 },
        { id: '45', label: '45 phút', minutes: 45 },
        { id: '60', label: '60 phút', minutes: 60 },
        { id: 'track', label: 'Hết bài hiện tại', minutes: -1 }
    ];

    function stopSleepTimer() {
        if (sleepTimerInterval) clearInterval(sleepTimerInterval);
        sleepTimerInterval = null;
        sleepTimerTargetTime = null;
        sleepTimerMode = 'off';
        if (sleepTimerBtn) {
            sleepTimerBtn.classList.remove('active');
            sleepTimerBtn.title = 'Hẹn giờ tắt nhạc';
        }
        renderSleepTimerMenu();
    }

    function fadeOutAndPause(durationSec = 5) {
        if (gainNode && audioCtx && audioCtx.state === 'running') {
            const now = audioCtx.currentTime;
            const currentGain = gainNode.gain.value;
            gainNode.gain.setValueAtTime(currentGain, now);
            gainNode.gain.linearRampToValueAtTime(0.0001, now + durationSec);
            setTimeout(() => {
                pauseAudio();
                gainNode.gain.setValueAtTime(volumeGainTarget(), audioCtx.currentTime);
            }, (durationSec * 1000) + 150);
        } else {
            const originalVol = audio.volume;
            const steps = 25;
            const stepInterval = (durationSec * 1000) / steps;
            let currentStep = 0;
            const fader = setInterval(() => {
                currentStep++;
                audio.volume = Math.max(0, originalVol * (1 - currentStep / steps));
                if (currentStep >= steps) {
                    clearInterval(fader);
                    pauseAudio();
                    audio.volume = originalVol;
                }
            }, stepInterval);
        }
    }

    function setSleepTimer(optionId) {
        stopSleepTimer();
        if (optionId === 'off') {
            if (typeof window.showToast === 'function') window.showToast('Đã tắt hẹn giờ', 'fa-clock');
            return;
        }

        sleepTimerMode = optionId;
        if (sleepTimerBtn) sleepTimerBtn.classList.add('active');

        if (optionId === 'track') {
            if (typeof window.showToast === 'function') window.showToast('Sẽ dừng sau khi hết bài', 'fa-moon');
            renderSleepTimerMenu();
            return;
        }

        const mins = parseInt(optionId, 10);
        sleepTimerTargetTime = Date.now() + mins * 60 * 1000;
        if (sleepTimerBtn) sleepTimerBtn.title = `Hẹn giờ: còn ${mins} phút`;

        if (typeof window.showToast === 'function') {
            window.showToast(`Hẹn giờ tắt sau ${mins} phút`, 'fa-clock');
        }

        sleepTimerInterval = setInterval(() => {
            const leftMs = sleepTimerTargetTime - Date.now();
            if (leftMs <= 0) {
                stopSleepTimer();
                // [BUG 8] Gentle fade out 5s cuối thay vì pause đột ngột
                fadeOutAndPause(5);
                if (typeof window.showToast === 'function') {
                    window.showToast('Hẹn giờ: Đang giảm dần âm lượng và tắt nhạc', 'fa-moon');
                }
            } else if (sleepTimerBtn) {
                const leftMins = Math.ceil(leftMs / 60000);
                sleepTimerBtn.title = `Hẹn giờ: còn ${leftMins} phút`;
            }
        }, 5000);

        renderSleepTimerMenu();
    }

    function renderSleepTimerMenu() {
        if (!sleepTimerMenu) return;
        sleepTimerMenu.innerHTML = `
            <div class="sheet-drag-handle" aria-hidden="true"></div>
            <div class="menu-header">
                <span><i class="far fa-clock"></i> HẸN GIỜ TẮT NHẠC</span>
                <button class="flyout-close-btn" type="button" aria-label="Đóng"><i class="fas fa-xmark"></i></button>
            </div>
            <div class="menu-items">
                ${SLEEP_OPTIONS.map(opt => `
                    <button class="fx-option ${opt.id === sleepTimerMode ? 'active' : ''}" data-sleep="${opt.id}" type="button">
                        <i class="fas ${opt.id === 'off' ? 'fa-ban' : 'fa-clock'}"></i>
                        <span class="fx-meta">
                            <strong>${opt.label}</strong>
                        </span>
                        ${opt.id === sleepTimerMode ? '<i class="fas fa-check fx-check"></i>' : ''}
                    </button>
                `).join('')}
            </div>
        `;

        sleepTimerMenu.querySelector('.flyout-close-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllFlyouts();
        });

        sleepTimerMenu.querySelectorAll('.fx-option').forEach(btn => {
            btn.addEventListener('click', () => {
                setSleepTimer(btn.dataset.sleep);
                closeAllFlyouts();
            });
        });
    }

    if (sleepTimerBtn && sleepTimerMenu) {
        sleepTimerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openFlyout(sleepTimerMenu, sleepTimerBtn);
        });
    }

    // Playlist Search & Dropdown Menu (Non-destructive: keeps input node intact)
    function buildPlaylistShell() {
        if (!playlistMenu) return;
        const curSong = fullPlaylist[currentTrackIndex] || fullPlaylist[0] || {};
        const pPersona = personaOf(curSong);
        const coverArt = curSong.cover || (pPersona ? pPersona.avatar : 'assets/avatar_alya.png');
        playlistMenu.innerHTML = `
            <div class="sheet-drag-handle" aria-hidden="true"></div>
            <div class="playlist-header">
                <div class="playlist-header-top">
                    <span id="playlist-title-header">ALL TRACKS</span>
                    <button class="flyout-close-btn" type="button" aria-label="Đóng"><i class="fas fa-xmark"></i></button>
                </div>
                <!-- Shared-Element Morphing Player Header -->
                <div class="playlist-morph-nowplaying" id="playlist-morph-nowplaying" title="Đang phát trên sân khấu">
                    <div class="morph-art-wrap">
                        <img src="${coverArt}" alt="Cover" class="morph-album-art" id="playlist-morph-art" width="32" height="32">
                    </div>
                    <div class="morph-track-meta">
                        <span class="morph-track-title" id="playlist-morph-title">${curSong.name || '可爱くてごめん'}</span>
                        <span class="morph-track-artist" id="playlist-morph-artist">${curSong.artist || 'Alya Kujou'}</span>
                    </div>
                    <span class="morph-playing-badge"><i class="fas fa-music"></i> NOW</span>
                </div>
                <div class="search-wrap">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <input type="text" id="playlist-search-input" placeholder="Search track or artist..." value="${searchQuery}" autocomplete="off" spellcheck="false" aria-label="Tìm bài hát hoặc nghệ sĩ">
                    <button type="button" class="playlist-search-clear${searchQuery ? '' : ' is-hidden'}" id="playlist-search-clear" aria-label="Xóa từ khóa tìm kiếm" title="Xóa tìm kiếm">
                        <i class="fas fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div class="playlist-items-scroll" id="playlist-items-scroll"></div>
        `;

        playlistMenu.querySelector('.flyout-close-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllFlyouts();
        });

        const searchInput = document.getElementById('playlist-search-input');
        const searchClear = document.getElementById('playlist-search-clear');
        const syncClearVisibility = () => {
            if (searchClear) searchClear.classList.toggle('is-hidden', !searchQuery);
        };
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                syncClearVisibility();
                updatePlaylistItems();
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchQuery) {
                    e.preventDefault();
                    e.stopPropagation();
                    searchQuery = '';
                    searchInput.value = '';
                    syncClearVisibility();
                    updatePlaylistItems();
                }
            });
        }
        if (searchClear) {
            searchClear.addEventListener('click', (e) => {
                e.stopPropagation();
                searchQuery = '';
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus({ preventScroll: true });
                }
                syncClearVisibility();
                updatePlaylistItems();
            });
        }
    }

    let lastPlaylistRenderSig = '';

    function updatePlaylistItems() {
        if (!playlistMenu) return;
        if (!document.getElementById('playlist-items-scroll')) {
            buildPlaylistShell();
            lastPlaylistRenderSig = '';
        }

        const scrollBox = document.getElementById('playlist-items-scroll');
        if (!scrollBox) return;
        const nextSig = `${currentFilter}|${currentTrackIndex}|${searchQuery}|${favTrackIds.slice().sort((a, b) => a - b).join(',')}`;
        if (nextSig === lastPlaylistRenderSig && scrollBox.childElementCount > 0) {
            return;
        }
        lastPlaylistRenderSig = nextSig;

        const visible = getFilteredPlaylist();
        const filterPersona = (currentFilter === 'all' || currentFilter === 'favorites') ? null : CONFIG.getPersona(currentFilter);
        const headerEl = document.getElementById('playlist-title-header');

        if (headerEl) {
            if (currentFilter === 'favorites') {
                headerEl.textContent = `YÊU THÍCH · ${visible.length} TRACKS`;
            } else if (filterPersona) {
                headerEl.textContent = `${filterPersona.name.toUpperCase()} · ${visible.length} TRACKS`;
            } else {
                headerEl.textContent = `ALL TRACKS · ${visible.length}`;
            }
        }

        const filtered = visible.filter(song => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return `${song.name} ${song.artist} ${song.versionLabel || song.version || ''}`.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
            scrollBox.innerHTML = '<div class="no-tracks">Không tìm thấy bài hát phù hợp</div>';
            return;
        }

        const focusedFavorite = scrollBox.contains(document.activeElement)
            ? document.activeElement.closest('.row-fav-btn')?.dataset.favid : null;
        scrollBox.innerHTML = filtered.map(song => {
            const globalIdx = fullPlaylist.indexOf(song);
            const isPlaying = globalIdx === currentTrackIndex;
            const isFav = isFavorite(song.id);
            const persona = personaOf(song);
            return `
                <div class="playlist-row ${isPlaying ? 'active' : ''}" data-idx="${globalIdx}" role="button" tabindex="0"${isPlaying ? ' aria-current="true"' : ''}>
                    <span class="row-num">${isPlaying ? '<i class="fas fa-volume-high"></i>' : visible.indexOf(song) + 1}</span>
                    <span class="row-info">
                        <span class="row-title">${song.name}</span>
                        <span class="row-artist">${song.artist}${song.versionLabel ? ` · ${song.versionLabel}` : ''}${persona && currentFilter === 'all' ? ` · ${persona.name}` : ''}</span>
                    </span>
                    <button class="row-fav-btn ${isFav ? 'active' : ''}" data-favid="${song.id}" type="button" aria-label="Yêu thích" aria-pressed="${isFav}" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <span class="row-duration">${song.duration}</span>
                </div>
            `;
        }).join('');

        scrollBox.querySelectorAll('.playlist-row').forEach(row => {
            const activateRow = (e) => {
                if (e.target && e.target.closest && e.target.closest('.row-fav-btn')) return;
                const idx = parseInt(row.dataset.idx, 10);
                loadTrack(idx, true);
                closeAllFlyouts();
            };
            row.addEventListener('click', activateRow);
            row.addEventListener('keydown', (e) => {
                // A nested favorite has its own native keyboard activation.
                if (e.target !== row) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateRow(e);
                }
            });
        });

        scrollBox.querySelectorAll('.row-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = parseInt(btn.dataset.favid, 10);
                toggleFavorite(songId);
            });
        });

        // Tự động cuộn nội bộ danh sách tới bài đang phát (chỉ cuộn hộp danh sách, tuyệt đối không chạm cuộn trang)
        const activeRow = scrollBox.querySelector('.playlist-row.active');
        if (activeRow) {
            scrollBox.scrollTop = activeRow.offsetTop - (scrollBox.clientHeight / 2) + (activeRow.clientHeight / 2);
        }
        if (focusedFavorite) {
            (scrollBox.querySelector(`[data-favid="${focusedFavorite}"]`)
                || scrollBox.querySelector('.row-fav-btn'))?.focus({ preventScroll: true });
        }
    }

    function closeAllFlyouts(exceptThisOne, opts) {
        if (window.MinkoiUI && typeof window.MinkoiUI.closeAllOverlays === 'function') {
            window.MinkoiUI.closeAllOverlays(exceptThisOne ? exceptThisOne.id : null, opts);
            return;
        }
        if (playlistMenu && playlistMenu !== exceptThisOne) {
            playlistMenu.classList.remove('open');
            playlistToggleBtn?.classList.remove('is-morph-active');
        }
        if (audioFxMenu && audioFxMenu !== exceptThisOne) {
            audioFxMenu.classList.remove('open');
            audioFxBtn?.classList.remove('is-morph-active');
        }
        if (sleepTimerMenu && sleepTimerMenu !== exceptThisOne) {
            sleepTimerMenu.classList.remove('open');
            sleepTimerBtn?.classList.remove('is-morph-active');
        }
        if (!exceptThisOne && releaseFlyoutTrap) {
            const fn = releaseFlyoutTrap;
            releaseFlyoutTrap = null;
            fn({ restoreFocus: !opts || opts.restoreFocus !== false });
        }
        syncFlyoutBackdrop();
    }

    if (!sleepTimerOverlay && window.MinkoiUI && typeof window.MinkoiUI.registerOverlay === 'function') {
        [
            { id: 'audio-fx-menu', el: audioFxMenu },
            { id: 'sleep-timer-menu', el: sleepTimerMenu },
            { id: 'playlist-menu', el: playlistMenu }
        ].forEach(({ id, el }) => {
            if (!el) return;
            window.MinkoiUI.registerOverlay(id, {
                isOpen: () => el.classList.contains('open'),
                close: (opts) => closeAllFlyouts(null, opts)
            });
        });
    }

    if (playlistToggleBtn && playlistMenu) {
        playlistToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openFlyout(playlistMenu, playlistToggleBtn);
            if (playlistMenu.classList.contains('open')) {
                updatePlaylistItems();
                // The overlay controller manages focus after opening. Do not
                // separately focus the search input during its opening spring.
            }
        });
    }

    // Close open menus when clicking outside
    document.addEventListener('click', (e) => {
        const hitOpenFlyout =
            (audioFxMenu?.classList.contains('open') && (audioFxMenu.contains(e.target) || audioFxBtn?.contains(e.target))) ||
            (playlistMenu?.classList.contains('open') && (playlistMenu.contains(e.target) || playlistToggleBtn?.contains(e.target))) ||
            (sleepTimerMenu?.classList.contains('open') && (sleepTimerMenu.contains(e.target) || sleepTimerBtn?.contains(e.target)));
        const hasAnyOpen =
            audioFxMenu?.classList.contains('open') ||
            playlistMenu?.classList.contains('open') ||
            sleepTimerMenu?.classList.contains('open');
        if (hasAnyOpen && !hitOpenFlyout) {
            closeAllFlyouts(null, { restoreFocus: false });
        }
    });

    const mobileFlyoutBackdrop = document.getElementById('mobile-flyout-backdrop');
    if (mobileFlyoutBackdrop) {
        mobileFlyoutBackdrop.addEventListener('click', () => {
            closeAllFlyouts();
        });
    }

    // Global keyboard shortcuts (Space, J, K, M, S, R, Left/Right Seek, Esc)
    window.addEventListener('keydown', (e) => {
        const inInput = ['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase());

        // Escape: close flyouts first
        if (e.key === 'Escape') {
            const hasOpenFlyout = (playlistMenu?.classList.contains('open') || audioFxMenu?.classList.contains('open') || sleepTimerMenu?.classList.contains('open'));
            if (hasOpenFlyout) {
                closeAllFlyouts();
                e.stopPropagation();
                return;
            }
        }

        // Native tab-button Space/Enter and tablist arrows must not also
        // toggle playback or seek the audio through global shortcuts.
        if (inInput || e.defaultPrevented || e.target.closest?.('#audio-category-nav')) return;

        if (e.code === 'Space') {
            // Space activates the focused action inside a floating panel,
            // not the unrelated player beneath it.
            if (e.target.closest?.('.row-fav-btn, .top-more-dropdown, .viz-menu, .lyrics-display-menu')) return;
            e.preventDefault();
            // Blur any focused button to avoid double triggering (e.g. Next button + Space)
            if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.blur();
            }
            togglePlay();
        } else if (e.code === 'KeyJ') {
            prevTrack();
        } else if (e.code === 'KeyK') {
            nextTrack();
        } else if (e.code === 'KeyM') {
            toggleMute();
        } else if (e.code === 'KeyS') {
            if (shuffleBtn) shuffleBtn.click();
        } else if (e.code === 'KeyR') {
            if (repeatBtn) repeatBtn.click();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            if (audio.duration) {
                audio.currentTime = Math.max(0, audio.currentTime - 5);
                if (typeof window.showToast === 'function') window.showToast('-5s', 'fa-backward');
            }
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            if (audio.duration) {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                if (typeof window.showToast === 'function') window.showToast('+5s', 'fa-forward');
            }
        }
    });

    // Visibility change: the visualizer module also observes this, but keep the
    // player's lifecycle explicit so background tabs never animate music UI.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopVisualizerLoop();
        } else if (!audio.paused) {
            startVisualizerLoop();
        }
    });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
        if (!audio.paused) startVisualizerLoop();
    });

    window.addEventListener('resize', () => {
        mountFlyoutForViewport();
        [
            { menu: audioFxMenu, btn: audioFxBtn },
            { menu: sleepTimerMenu, btn: sleepTimerBtn },
            { menu: playlistMenu, btn: playlistToggleBtn }
        ].forEach(({ menu, btn }) => {
            if (menu?.classList.contains('open')) positionDesktopFlyout(menu, btn);
        });
        syncFlyoutBackdrop();
        if (categoryNav && window.MinkoiUI && typeof window.MinkoiUI.syncTabIndicator === 'function') {
            window.MinkoiUI.syncTabIndicator(categoryNav);
        }
    });

    // Initial boot
    buildPlaylistShell();
    renderCategoryTabs();
    renderFxMenu();
    renderSleepTimerMenu();
    initToolPanelControllers();
    mountFlyoutForViewport();
    if (categoryNav && window.MinkoiUI && typeof window.MinkoiUI.syncTabIndicator === 'function') {
        window.MinkoiUI.syncTabIndicator(categoryNav, setFilter);
    }

    let savedVol = parseInt(safeGet('minkoi_player_volume', CONFIG.music?.defaultVolume || 45), 10);
    let savedIdx = parseInt(safeGet('minkoi_player_track_idx', '0'), 10);
    setVolume(isNaN(savedVol) ? 45 : savedVol);
    loadTrack(isNaN(savedIdx) ? 0 : savedIdx, false);
})();
