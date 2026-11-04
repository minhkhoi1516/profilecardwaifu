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
    const themeSyncBtn = document.getElementById('theme-sync-btn');
    const speedBtn = document.getElementById('playback-speed-btn');
    const speedLabel = document.getElementById('playback-speed-label');

    if (!audio) return;

    const fullPlaylist = (CONFIG.music && CONFIG.music.playlist) || [];

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
        renderCategoryTabs();
        updatePlaylistItems();
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
        if (currentFilter === 'all') return fullPlaylist;
        if (currentFilter === 'favorites') {
            return fullPlaylist.filter(song => isFavorite(song.id));
        }
        return fullPlaylist.filter(song => song.persona === currentFilter);
    }

    function personaOf(track) {
        return track ? CONFIG.getPersona(track.persona) : null;
    }

    let currentTrackIndex = 0;
    let isShuffle = safeGet('minkoi_player_shuffle', 'false') === 'true';
    let repeatMode = safeGet('minkoi_player_repeat', 'all'); // 'all', 'one', 'none'
    let currentAudioFx = safeGet('mahikari_audio_fx', 'hifi');
    let isMuted = false;
    let lastVolume = CONFIG.music?.defaultVolume || 45;
    let searchQuery = '';
    let isScrubbing = false;
    let hasPreloadedNext = false;

    // Auto-Sync Waifu Theme with Music State
    let autoSyncTheme = safeGet('minkoi_auto_theme_sync', 'true') === 'true';

    // Playback Speed State (1.0x, 1.25x Nightcore, 1.5x, 0.85x Lo-Fi Slowed)
    const SPEED_PRESETS = [
        { rate: 1.0, label: '1.0x', toast: 'Tốc độ: 1.0x (Bình thường)' },
        { rate: 1.25, label: '1.25x', toast: 'Tốc độ: 1.25x (Nightcore Mode)' },
        { rate: 1.5, label: '1.5x', toast: 'Tốc độ: 1.5x (Super Fast)' },
        { rate: 0.85, label: '0.85x', toast: 'Tốc độ: 0.85x (Lo-Fi Slowed)' }
    ];
    let currentSpeedIndex = parseInt(safeGet('minkoi_player_speed_idx', '0'), 10);
    if (isNaN(currentSpeedIndex) || currentSpeedIndex < 0 || currentSpeedIndex >= SPEED_PRESETS.length) {
        currentSpeedIndex = 0;
    }

    // Sleep Timer State
    let sleepTimerInterval = null;
    let sleepTimerTargetTime = null;
    let sleepTimerMode = 'off'; // 'off', 15, 30, 45, 60, 'track'

    // Web Audio Architecture & Live Visualizer
    let audioCtx = null;
    let gainNode = null;
    let eqFilter = null;
    let analyser = null;
    let audioSource = null;
    let isContextReady = false;
    let visualizerData = null;
    let visualizerFrameId = null;

    function initAudioContext() {
        if (isContextReady) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            // Shared singleton to save hardware audio resources
            audioCtx = window.__minkoiAudioCtx || new AudioContextClass();
            window.__minkoiAudioCtx = audioCtx;

            gainNode = audioCtx.createGain();
            eqFilter = audioCtx.createBiquadFilter();

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64; // 32 frequency bins
            analyser.smoothingTimeConstant = 0.8;
            visualizerData = new Uint8Array(analyser.frequencyBinCount);

            // Connect: Source -> GainNode -> EQ Filter -> Analyser -> Output
            audioSource = audioCtx.createMediaElementSource(audio);
            audioSource.connect(gainNode);
            gainNode.connect(eqFilter);
            eqFilter.connect(analyser);
            analyser.connect(audioCtx.destination);

            // Set initial volume on GainNode (guarantees volume control works on iOS Safari)
            const currentVol = parseInt(volumeCtrl?.value || '45', 10);
            gainNode.gain.setValueAtTime(currentVol / 100, audioCtx.currentTime);

            applyEqPreset(currentAudioFx);
            isContextReady = true;
        } catch (_) {}
    }

    function startVisualizerLoop() {
        if (visualizerFrameId) cancelAnimationFrame(visualizerFrameId);
        const bars = document.querySelectorAll('.live-visualizer-bars .viz-bar');
        const vinyl = document.getElementById('vinyl-disc');

        function loop() {
            if (audio.paused || document.hidden || !analyser) {
                visualizerFrameId = null;
                if (bars.length > 0) {
                    for (let i = 0; i < bars.length; i++) {
                        bars[i].style.height = '10%';
                    }
                }
                if (vinyl) vinyl.style.boxShadow = '';
                return;
            }

            visualizerFrameId = requestAnimationFrame(loop);
            analyser.getByteFrequencyData(visualizerData);

            if (bars.length > 0) {
                for (let i = 0; i < bars.length; i++) {
                    const binIdx = Math.min(i + 1, visualizerData.length - 1);
                    const val = visualizerData[binIdx] || 0;
                    const heightPercent = Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
                    bars[i].style.height = `${heightPercent}%`;
                }
            }

            if (vinyl) {
                const bass = (visualizerData[1] + visualizerData[2] + visualizerData[3]) / (3 * 255);
                const glowSpread = Math.floor(bass * 20);
                vinyl.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.65), 0 0 ${8 + glowSpread}px var(--color-accent-glow)`;
            }
        }
        visualizerFrameId = requestAnimationFrame(loop);
    }

    function applyEqPreset(presetId) {
        currentAudioFx = presetId;
        safeSet('mahikari_audio_fx', presetId);
        if (!eqFilter || !audioCtx) {
            renderFxMenu();
            return;
        }

        const now = audioCtx.currentTime;

        // Reset baseline parameters to avoid phase skew between presets
        eqFilter.gain.cancelScheduledValues(now);
        eqFilter.frequency.cancelScheduledValues(now);
        eqFilter.Q.cancelScheduledValues(now);

        if (presetId === 'bass') {
            eqFilter.type = 'lowshelf';
            eqFilter.frequency.setValueAtTime(180, now);
            eqFilter.gain.setValueAtTime(6.0, now);
            eqFilter.Q.setValueAtTime(1.0, now);
        } else if (presetId === 'lofi') {
            eqFilter.type = 'bandpass';
            eqFilter.frequency.setValueAtTime(1500, now);
            eqFilter.Q.setValueAtTime(0.85, now);
            eqFilter.gain.setValueAtTime(0, now);
        } else if (presetId === 'vocal') {
            eqFilter.type = 'peaking';
            eqFilter.frequency.setValueAtTime(2600, now);
            eqFilter.Q.setValueAtTime(1.0, now);
            eqFilter.gain.setValueAtTime(5.0, now);
        } else {
            // 'hifi' Studio Reference: clean flat bypass
            eqFilter.type = 'peaking';
            eqFilter.frequency.setValueAtTime(1000, now);
            eqFilter.gain.setValueAtTime(0, now);
            eqFilter.Q.setValueAtTime(1.0, now);
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
        const persona = personaOf(track);
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: track.artist,
            album: persona ? `${persona.name} · MinKoi Studio` : 'MinKoi Studio Collection',
            artwork: [
                { src: (persona && persona.avatar) ? persona.avatar : 'assets/avatar_alya.png', sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', pauseAudio);
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }

    function updateCategoryTag() {
        if (!trackCatEl) return;
        const persona = personaOf(fullPlaylist[currentTrackIndex]);
        if (!persona) {
            trackCatEl.textContent = '';
            return;
        }
        trackCatEl.textContent = `${persona.name} · ${persona.role}`;
        trackCatEl.dataset.persona = persona.key;
        trackCatEl.classList.toggle('is-dim', currentFilter !== 'all' && currentFilter !== persona.key);
        trackCatEl.title = `Xem danh sách nhạc của ${persona.name}`;
    }

    function preloadNextTrack() {
        const list = navigationList();
        if (list.length <= 1) return;
        const pos = list.indexOf(fullPlaylist[currentTrackIndex]);
        const nextIdx = (pos + 1) % list.length;
        const nextSong = list[nextIdx];
        if (nextSong && nextSong.file) {
            const prefetcher = document.createElement('link');
            prefetcher.rel = 'prefetch';
            prefetcher.as = 'fetch';
            prefetcher.href = encodeURI(nextSong.file);
            document.head.appendChild(prefetcher);
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

        // Clean reload to free previous decode buffer
        audio.pause();
        audio.src = encodeURI(track.file);
        audio.load();

        if (trackNameEl) trackNameEl.textContent = track.name;
        if (trackArtistEl) trackArtistEl.textContent = track.artist;
        if (currentTrackNumEl) currentTrackNumEl.textContent = (currentTrackIndex + 1).toString();
        if (totalTracksNumEl) totalTracksNumEl.textContent = fullPlaylist.length.toString();

        // Direct sync with Zen Mode Mini Dock
        if (zenTitle) zenTitle.textContent = track.name;
        if (zenArtist) zenArtist.textContent = track.artist;
        if (zenSeekFill) zenSeekFill.style.width = '0%';

        if (seekFill) seekFill.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (totalTimeEl) totalTimeEl.textContent = track.duration || '0:00';
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

    window.getCurrentTrackIndex = () => currentTrackIndex;
    window.getCurrentTrack = () => fullPlaylist[currentTrackIndex];

    function syncZenPlayer() {
        const track = fullPlaylist[currentTrackIndex];
        if (track) {
            if (zenTitle) zenTitle.textContent = track.name;
            if (zenArtist) zenArtist.textContent = track.artist;
        }
        if (zenPlayBtn) {
            zenPlayBtn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        }
        if (zenDisc) {
            zenDisc.classList.toggle('spinning', !audio.paused);
        }
        if (zenSeekFill && audio.duration) {
            zenSeekFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        }
    }
    window.syncZenPlayer = syncZenPlayer;

    function playAudio() {
        initAudioContext();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        audio.play().then(() => {
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (zenPlayBtn) zenPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (vinylDisc) vinylDisc.classList.add('spinning');
            if (zenDisc) zenDisc.classList.add('spinning');
            if (audioAlert) audioAlert.classList.add('hidden');
            const track = fullPlaylist[currentTrackIndex];
            if (track) {
                document.title = `▶ ${track.name} · ${CONFIG.name}`;
            }
            startVisualizerLoop();
        }).catch((err) => {
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (zenPlayBtn) zenPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (vinylDisc) vinylDisc.classList.remove('spinning');
            if (zenDisc) zenDisc.classList.remove('spinning');
        });
    }

    function pauseAudio() {
        audio.pause();
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (zenPlayBtn) zenPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (vinylDisc) vinylDisc.classList.remove('spinning');
        if (zenDisc) zenDisc.classList.remove('spinning');
        document.title = `${CONFIG.name} · Waifu & Music Studio`;
        if (visualizerFrameId) {
            cancelAnimationFrame(visualizerFrameId);
            visualizerFrameId = null;
        }
        const bars = document.querySelectorAll('.live-visualizer-bars .viz-bar');
        bars.forEach(b => { b.style.height = '10%'; });
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
            return favs.length > 0 ? favs : fullPlaylist;
        }
        if (currentFilter !== 'all' && track && track.persona === currentFilter) {
            return getFilteredPlaylist();
        }
        return fullPlaylist;
    }

    function playTrackAt(index, autoPlay) {
        const list = navigationList();
        if (list.length === 0) return;
        const track = list[index];
        const globalIndex = fullPlaylist.indexOf(track);
        loadTrack(globalIndex >= 0 ? globalIndex : 0, autoPlay);
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

    function setVolume(val) {
        const clamped = Math.max(0, Math.min(100, val));
        audio.volume = clamped / 100;

        // Also control Web Audio GainNode for iOS Safari compatibility
        if (gainNode && audioCtx) {
            gainNode.gain.setValueAtTime(clamped / 100, audioCtx.currentTime);
        }

        if (volumeCtrl) volumeCtrl.value = clamped;
        isMuted = clamped === 0;

        if (!isMuted) {
            safeSet('minkoi_player_volume', clamped.toString());
        }

        if (muteBtn) {
            if (clamped === 0) {
                muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
            } else if (clamped < 50) {
                muteBtn.innerHTML = '<i class="fas fa-volume-low"></i>';
            } else {
                muteBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
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
            });
            const activeTab = categoryNav.querySelector('.cat-tab.active');
            if (activeTab && typeof activeTab.scrollIntoView === 'function') {
                activeTab.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
            }
        }

        if (options && options.openList && playlistMenu) {
            playlistMenu.classList.add('open');
        }
        updateCategoryTag();
        updatePlaylistItems();
    }

    function renderCategoryTabs() {
        if (!categoryNav) return;
        const counts = {};
        fullPlaylist.forEach(song => {
            counts[song.persona] = (counts[song.persona] || 0) + 1;
        });

        const favCount = favTrackIds.length;
        const tabs = [
            `<button class="cat-tab" data-cat="all" role="tab" type="button"><i class="fas fa-layer-group" aria-hidden="true"></i> All (${fullPlaylist.length})</button>`
        ];

        if (favCount > 0) {
            tabs.push(
                `<button class="cat-tab ${currentFilter === 'favorites' ? 'active' : ''}" data-cat="favorites" role="tab" type="button" title="Bài hát yêu thích">` +
                `<i class="fas fa-heart" style="color: #f43f5e;" aria-hidden="true"></i> Yêu thích` +
                `<span class="cat-count">${favCount}</span></button>`
            );
        }

        CONFIG.personas
            .filter(p => p.available && counts[p.key])
            .forEach(p => {
                tabs.push(
                    `<button class="cat-tab" data-cat="${p.key}" role="tab" type="button" title="${p.name}">` +
                    `<i class="fas fa-music" aria-hidden="true"></i> ${p.name}` +
                    `<span class="cat-count">${counts[p.key]}</span></button>`
                );
            });

        categoryNav.innerHTML = tabs.join('');
        setFilter(currentFilter);
    }

    if (categoryNav) {
        categoryNav.addEventListener('click', (e) => {
            const tab = e.target.closest('.cat-tab');
            if (!tab) return;
            setFilter(tab.dataset.cat);
        });
    }

    if (trackCatEl) {
        trackCatEl.setAttribute('role', 'button');
        trackCatEl.setAttribute('tabindex', '0');
        trackCatEl.addEventListener('click', () => {
            const key = trackCatEl.dataset.persona;
            if (key) setFilter(key, { openList: true });
        });
    }

    // Persona changed by avatar.js
    window.addEventListener('minkoi:persona', (e) => {
        const key = e.detail && e.detail.key;
        if (!key) return;
        setFilter(key);
    });

    // Audio Progress & Seek Bar with Pointer Dragging (Scrubbing)
    function seekToPosition(clientX) {
        if (!audio.duration || !seekContainer) return;
        const rect = seekContainer.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audio.currentTime = pos * audio.duration;
        if (seekFill) seekFill.style.width = `${pos * 100}%`;
        if (zenSeekFill) zenSeekFill.style.width = `${pos * 100}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        seekContainer.setAttribute('aria-valuenow', Math.round(pos * 100).toString());
    }

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration || isScrubbing) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        if (seekFill) seekFill.style.width = `${pct}%`;
        if (zenSeekFill) zenSeekFill.style.width = `${pct}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (seekContainer) seekContainer.setAttribute('aria-valuenow', Math.round(pct).toString());

        // Preload next track when near end (> 85%)
        if (pct > 85 && !hasPreloadedNext) {
            hasPreloadedNext = true;
            preloadNextTrack();
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        if (totalTimeEl && audio.duration) {
            totalTimeEl.textContent = formatTime(audio.duration);
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

        if (repeatMode === 'one') {
            audio.currentTime = 0;
            playAudio();
        } else if (repeatMode === 'none' && currentTrackIndex === fullPlaylist.length - 1) {
            pauseAudio();
        } else {
            nextTrack();
        }
    });

    audio.addEventListener('error', () => {
        const code = audio.error ? audio.error.code : 0;
        if (audioAlert) {
            audioAlert.classList.remove('hidden');
            audioAlert.textContent = 'Audio file currently unavailable (Code ' + code + ')';
        }
        pauseAudio();
    });

    if (seekContainer) {
        seekContainer.addEventListener('pointerdown', (e) => {
            isScrubbing = true;
            seekContainer.setPointerCapture(e.pointerId);
            seekToPosition(e.clientX);
        });

        seekContainer.addEventListener('pointermove', (e) => {
            if (!audio.duration) return;
            const rect = seekContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

            if (seekTip) {
                seekTip.style.left = `${pos * 100}%`;
                seekTip.textContent = formatTime(pos * audio.duration);
                seekTip.style.opacity = '1';
            }

            if (isScrubbing) {
                seekToPosition(e.clientX);
            }
        });

        const endScrub = (e) => {
            if (isScrubbing) {
                seekToPosition(e.clientX);
                isScrubbing = false;
            }
        };

        seekContainer.addEventListener('pointerup', endScrub);
        seekContainer.addEventListener('pointercancel', endScrub);

        seekContainer.addEventListener('mouseleave', () => {
            if (!isScrubbing && seekTip) seekTip.style.opacity = '0';
        });

        // Keyboard accessibility for Seek Bar
        seekContainer.addEventListener('keydown', (e) => {
            if (!audio.duration) return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                audio.currentTime = Math.max(0, audio.currentTime - 5);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            } else if (e.key === 'Home') {
                e.preventDefault();
                audio.currentTime = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                audio.currentTime = audio.duration;
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

    // Auto-Sync Waifu Theme with Music Button
    if (themeSyncBtn) {
        themeSyncBtn.classList.toggle('active', autoSyncTheme);
        themeSyncBtn.title = autoSyncTheme ? 'Tự đổi Waifu theo bài hát (Đang BẬT)' : 'Tự đổi Waifu theo bài hát (Đang TẮT)';
        themeSyncBtn.addEventListener('click', () => {
            autoSyncTheme = !autoSyncTheme;
            safeSet('minkoi_auto_theme_sync', autoSyncTheme.toString());
            themeSyncBtn.classList.toggle('active', autoSyncTheme);
            themeSyncBtn.title = autoSyncTheme ? 'Tự đổi Waifu theo bài hát (Đang BẬT)' : 'Tự đổi Waifu theo bài hát (Đang TẮT)';
            if (typeof window.showToast === 'function') {
                window.showToast(autoSyncTheme ? 'Tự đổi Waifu theo bài hát: BẬT' : 'Tự đổi Waifu theo bài hát: TẮT', 'fa-wand-magic-sparkles');
            }
            if (autoSyncTheme) {
                const track = fullPlaylist[currentTrackIndex];
                if (track && track.persona) {
                    const pIdx = CONFIG.personas.findIndex(p => p.key === track.persona && p.available);
                    if (pIdx >= 0 && typeof window.setPersona === 'function') {
                        window.setPersona(pIdx, false);
                    }
                }
            }
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
        volumeCtrl.addEventListener('input', (e) => {
            setVolume(parseInt(e.target.value, 10));
        });
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
                repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
                repeatBtn.title = 'Lặp lại: Tất cả';
            } else if (repeatMode === 'one') {
                repeatBtn.className = 'ctrl-btn repeat-btn active';
                repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
                repeatBtn.title = 'Lặp lại: 1 bài';
            } else {
                repeatBtn.className = 'ctrl-btn repeat-btn';
                repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
                repeatBtn.title = 'Lặp lại: Tắt';
            }
        }
        updateRepeatUI();

        repeatBtn.addEventListener('click', () => {
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

    // Audio FX Equalizer Menu
    function renderFxMenu() {
        if (!audioFxMenu) return;
        audioFxMenu.innerHTML = `
            <div class="menu-header">
                <span>STUDIO EQUALIZER</span>
            </div>
            <div class="menu-items">
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
        `;

        audioFxMenu.querySelectorAll('.fx-option').forEach(btn => {
            btn.addEventListener('click', () => {
                applyEqPreset(btn.dataset.fx);
                audioFxMenu.classList.remove('open');
                if (typeof window.showToast === 'function') {
                    const preset = CONFIG.audioFx.presets.find(x => x.id === btn.dataset.fx);
                    window.showToast(`Equalizer: ${preset ? preset.name : btn.dataset.fx}`, 'fa-sliders');
                }
            });
        });
    }

    if (audioFxBtn && audioFxMenu) {
        audioFxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllFlyouts(audioFxMenu);
            audioFxMenu.classList.toggle('open');
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

        if (typeof window.showToast === 'function') {
            window.showToast(`Hẹn giờ tắt sau ${mins} phút`, 'fa-clock');
        }

        sleepTimerInterval = setInterval(() => {
            const leftMs = sleepTimerTargetTime - Date.now();
            if (leftMs <= 0) {
                stopSleepTimer();
                // Gentle fade out over 3s
                if (gainNode && audioCtx) {
                    const now = audioCtx.currentTime;
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0.001, now + 3);
                    setTimeout(() => {
                        pauseAudio();
                        setVolume(lastVolume || 45);
                    }, 3100);
                } else {
                    pauseAudio();
                }
                if (typeof window.showToast === 'function') {
                    window.showToast('Hẹn giờ: Đã tắt nhạc', 'fa-moon');
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
            <div class="menu-header">
                <span>HẸN GIỜ TẮT NHẠC</span>
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

        sleepTimerMenu.querySelectorAll('.fx-option').forEach(btn => {
            btn.addEventListener('click', () => {
                setSleepTimer(btn.dataset.sleep);
                sleepTimerMenu.classList.remove('open');
            });
        });
    }

    if (sleepTimerBtn && sleepTimerMenu) {
        sleepTimerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllFlyouts(sleepTimerMenu);
            sleepTimerMenu.classList.toggle('open');
        });
    }

    // Playlist Search & Dropdown Menu (Non-destructive: keeps input node intact)
    function buildPlaylistShell() {
        if (!playlistMenu) return;
        playlistMenu.innerHTML = `
            <div class="playlist-header">
                <span id="playlist-title-header">ALL TRACKS</span>
                <div class="search-wrap">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <input type="text" id="playlist-search-input" placeholder="Search track or artist..." value="${searchQuery}" autocomplete="off" spellcheck="false">
                </div>
            </div>
            <div class="playlist-items-scroll" id="playlist-items-scroll"></div>
        `;

        const searchInput = document.getElementById('playlist-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                updatePlaylistItems();
            });
        }
    }

    function updatePlaylistItems() {
        if (!playlistMenu) return;
        if (!document.getElementById('playlist-items-scroll')) {
            buildPlaylistShell();
        }

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
            return song.name.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
        });

        const scrollBox = document.getElementById('playlist-items-scroll');
        if (!scrollBox) return;

        if (filtered.length === 0) {
            scrollBox.innerHTML = '<div class="no-tracks">Không tìm thấy bài hát phù hợp</div>';
            return;
        }

        scrollBox.innerHTML = filtered.map(song => {
            const globalIdx = fullPlaylist.indexOf(song);
            const isPlaying = globalIdx === currentTrackIndex;
            const isFav = isFavorite(song.id);
            const persona = personaOf(song);
            return `
                <div class="playlist-row ${isPlaying ? 'active' : ''}" data-idx="${globalIdx}" role="button" tabindex="0">
                    <span class="row-num">${isPlaying ? '<i class="fas fa-volume-high"></i>' : visible.indexOf(song) + 1}</span>
                    <span class="row-info">
                        <span class="row-title">${song.name}</span>
                        <span class="row-artist">${song.artist}${persona && currentFilter === 'all' ? ` · ${persona.name}` : ''}</span>
                    </span>
                    <button class="row-fav-btn ${isFav ? 'active' : ''}" data-favid="${song.id}" type="button" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <span class="row-duration">${song.duration}</span>
                </div>
            `;
        }).join('');

        scrollBox.querySelectorAll('.playlist-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.row-fav-btn')) return;
                const idx = parseInt(row.dataset.idx, 10);
                loadTrack(idx, true);
                playlistMenu.classList.remove('open');
            });
        });

        scrollBox.querySelectorAll('.row-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = parseInt(btn.dataset.favid, 10);
                toggleFavorite(songId);
            });
        });
    }

    function closeAllFlyouts(exceptThisOne) {
        if (playlistMenu && playlistMenu !== exceptThisOne) playlistMenu.classList.remove('open');
        if (audioFxMenu && audioFxMenu !== exceptThisOne) audioFxMenu.classList.remove('open');
        if (sleepTimerMenu && sleepTimerMenu !== exceptThisOne) sleepTimerMenu.classList.remove('open');
    }

    if (playlistToggleBtn && playlistMenu) {
        playlistToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllFlyouts(playlistMenu);
            playlistMenu.classList.toggle('open');
            if (playlistMenu.classList.contains('open')) {
                updatePlaylistItems();
                const input = document.getElementById('playlist-search-input');
                if (input) setTimeout(() => input.focus(), 80);
            }
        });
    }

    // Close open menus when clicking outside
    document.addEventListener('click', (e) => {
        if (audioFxMenu && !audioFxMenu.contains(e.target) && e.target !== audioFxBtn) {
            audioFxMenu.classList.remove('open');
        }
        if (playlistMenu && !playlistMenu.contains(e.target) && e.target !== playlistToggleBtn) {
            playlistMenu.classList.remove('open');
        }
        if (sleepTimerMenu && !sleepTimerMenu.contains(e.target) && e.target !== sleepTimerBtn) {
            sleepTimerMenu.classList.remove('open');
        }
    });

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

        if (inInput) return;

        if (e.code === 'Space') {
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

    // Visibility change: pause visualizer when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !audio.paused) {
            startVisualizerLoop();
        }
    });

    // Initial boot
    buildPlaylistShell();
    renderCategoryTabs();
    renderFxMenu();
    renderSleepTimerMenu();

    let savedVol = parseInt(safeGet('minkoi_player_volume', CONFIG.music?.defaultVolume || 45), 10);
    let savedIdx = parseInt(safeGet('minkoi_player_track_idx', '0'), 10);
    setVolume(isNaN(savedVol) ? 45 : savedVol);
    loadTrack(isNaN(savedIdx) ? 0 : savedIdx, false);
})();
