/* ========================================================
   MAHIKARI · STUDIO AUDIO SUITE
   Hi-Fi Web Audio Player with EQ Filters & Smart Playlist
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
    const categoryNav = document.getElementById('audio-category-nav');
    const trackCatEl = document.getElementById('track-category-tag');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const vinylDisc = document.getElementById('vinyl-disc');
    const albumArt = document.getElementById('player-album-art');

    if (!audio) return;

    const fullPlaylist = (CONFIG.music && CONFIG.music.playlist) || [];

    // Bộ lọc đang xem: 'all' hoặc key của persona. Bộ lọc KHÔNG ảnh hưởng bài đang phát.
    function currentPersonaKey() {
        const p = typeof window.getCurrentPersona === 'function' ? window.getCurrentPersona() : null;
        return p ? p.key : 'alya';
    }

    let currentFilter = localStorage.getItem('minkoi_player_filter') || currentPersonaKey();
    if (currentFilter !== 'all' && !CONFIG.getPersona(currentFilter)) {
        currentFilter = 'all';
    }

    function getFilteredPlaylist() {
        if (currentFilter === 'all') return fullPlaylist;
        return fullPlaylist.filter(song => song.persona === currentFilter);
    }

    function personaOf(track) {
        return track ? CONFIG.getPersona(track.persona) : null;
    }

    // Luôn là index trong fullPlaylist
    let currentTrackIndex = 0;
    let isShuffle = localStorage.getItem('minkoi_player_shuffle') === 'true';
    let repeatMode = localStorage.getItem('minkoi_player_repeat') || 'all'; // 'all', 'one', 'none'
    let currentAudioFx = localStorage.getItem('mahikari_audio_fx') || 'hifi';
    let isMuted = false;
    let lastVolume = CONFIG.music.defaultVolume || 45;
    let searchQuery = '';

    // Web Audio Architecture & Live Visualizer
    let audioCtx = null;
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
            audioCtx = new AudioContextClass();
            eqFilter = audioCtx.createBiquadFilter();
            
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64; // 32 frequency bins
            analyser.smoothingTimeConstant = 0.8;
            visualizerData = new Uint8Array(analyser.frequencyBinCount);

            audioSource = audioCtx.createMediaElementSource(audio);
            audioSource.connect(eqFilter);
            eqFilter.connect(analyser);
            analyser.connect(audioCtx.destination);

            applyEqPreset(currentAudioFx);
            isContextReady = true;
            startVisualizerLoop();
        } catch (_) {}
    }

    function startVisualizerLoop() {
        const bars = document.querySelectorAll('.live-visualizer-bars .viz-bar');
        const vinylDisc = document.getElementById('vinyl-disc');

        function loop() {
            visualizerFrameId = requestAnimationFrame(loop);
            if (!analyser || document.hidden) return;

            analyser.getByteFrequencyData(visualizerData);

            if (!audio.paused && bars.length > 0) {
                // Animate spectrum bars
                for (let i = 0; i < bars.length; i++) {
                    const binIdx = Math.min(i + 1, visualizerData.length - 1);
                    const val = visualizerData[binIdx] || 0;
                    const heightPercent = Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
                    bars[i].style.height = `${heightPercent}%`;
                }

                // Gentle bass pulse on vinyl disc glow
                if (vinylDisc) {
                    const bass = (visualizerData[1] + visualizerData[2] + visualizerData[3]) / (3 * 255);
                    const glowSpread = Math.floor(bass * 20);
                    vinylDisc.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.65), 0 0 ${8 + glowSpread}px var(--color-accent-glow)`;
                }
            } else if (audio.paused && bars.length > 0) {
                for (let i = 0; i < bars.length; i++) {
                    bars[i].style.height = '10%';
                }
                if (vinylDisc) {
                    vinylDisc.style.boxShadow = '';
                }
            }
        }
        loop();
    }

    function applyEqPreset(presetId) {
        currentAudioFx = presetId;
        localStorage.setItem('mahikari_audio_fx', presetId);
        if (!eqFilter || !audioCtx) return;

        const now = audioCtx.currentTime;
        if (presetId === 'bass') {
            eqFilter.type = 'lowshelf';
            eqFilter.frequency.setValueAtTime(180, now);
            eqFilter.gain.setValueAtTime(6.0, now);
        } else if (presetId === 'lofi') {
            eqFilter.type = 'bandpass';
            eqFilter.frequency.setValueAtTime(1500, now);
            eqFilter.Q.setValueAtTime(0.8, now);
        } else if (presetId === 'vocal') {
            eqFilter.type = 'peaking';
            eqFilter.frequency.setValueAtTime(2600, now);
            eqFilter.Q.setValueAtTime(1.0, now);
            eqFilter.gain.setValueAtTime(5.0, now);
        } else {
            // 'hifi' studio reference
            eqFilter.type = 'allpass';
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

    function loadTrack(index, autoPlay = false) {
        if (fullPlaylist.length === 0) return;
        if (index < 0) index = fullPlaylist.length - 1;
        if (index >= fullPlaylist.length) index = 0;

        currentTrackIndex = index;
        const track = fullPlaylist[currentTrackIndex];
        if (!track) return;

        try { localStorage.setItem('minkoi_player_track_idx', currentTrackIndex.toString()); } catch (_) {}

        audio.src = track.file;
        if (trackNameEl) trackNameEl.textContent = track.name;
        if (trackArtistEl) trackArtistEl.textContent = track.artist;
        if (currentTrackNumEl) currentTrackNumEl.textContent = (currentTrackIndex + 1).toString();
        if (totalTracksNumEl) totalTracksNumEl.textContent = fullPlaylist.length.toString();

        if (seekFill) seekFill.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (totalTimeEl) totalTimeEl.textContent = track.duration || '0:00';

        updateCategoryTag();
        updateMediaSession(track);
        renderPlaylist();

        if (autoPlay) {
            playAudio();
        }
    }

    function playAudio() {
        initAudioContext();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        audio.play().then(() => {
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (vinylDisc) vinylDisc.classList.add('spinning');
            if (audioAlert) audioAlert.classList.add('hidden');
            const track = fullPlaylist[currentTrackIndex];
            if (track) {
                document.title = `▶ ${track.name} · ${CONFIG.name}`;
            }
        }).catch(() => {
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (vinylDisc) vinylDisc.classList.remove('spinning');
        });
    }

    function pauseAudio() {
        audio.pause();
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (vinylDisc) vinylDisc.classList.remove('spinning');
        document.title = `${CONFIG.name} · Waifu & Music Studio`;
    }

    function togglePlay() {
        if (audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    }

    // Danh sách điều hướng: ưu tiên bộ lọc đang xem nếu bài đang phát thuộc bộ lọc đó.
    function navigationList() {
        const track = fullPlaylist[currentTrackIndex];
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
        if (volumeCtrl) volumeCtrl.value = clamped;
        isMuted = clamped === 0;

        if (!isMuted) {
            try { localStorage.setItem('minkoi_player_volume', clamped.toString()); } catch (_) {}
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

    // Persona Playlist Tabs — All + từng waifu
    function setFilter(key, options) {
        if (key !== 'all' && !CONFIG.getPersona(key)) key = 'all';
        currentFilter = key;
        try { localStorage.setItem('minkoi_player_filter', key); } catch (_) {}

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
            renderPlaylist();
        }
        updateCategoryTag();
    }

    function renderCategoryTabs() {
        if (!categoryNav) return;
        const counts = {};
        fullPlaylist.forEach(song => {
            counts[song.persona] = (counts[song.persona] || 0) + 1;
        });

        const tabs = [
            `<button class="cat-tab" data-cat="all" role="tab" type="button"><i class="fas fa-layer-group" aria-hidden="true"></i> All (${fullPlaylist.length})</button>`
        ];

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

    // Bấm vào tag thể loại dưới tên bài -> mở danh sách của waifu đang phát
    if (trackCatEl) {
        trackCatEl.setAttribute('role', 'button');
        trackCatEl.setAttribute('tabindex', '0');
        trackCatEl.addEventListener('click', () => {
            const key = trackCatEl.dataset.persona;
            if (key) setFilter(key, { openList: true });
        });
    }

    // Đổi waifu bên avatar.js -> chuyển bộ lọc danh sách, KHÔNG đổi bài đang phát
    window.addEventListener('minkoi:persona', (e) => {
        const key = e.detail && e.detail.key;
        if (!key) return;
        setFilter(key);
        if (playlistMenu && playlistMenu.classList.contains('open')) {
            renderPlaylist();
        }
    });

    // Audio Progress & Seek Bar
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        if (seekFill) seekFill.style.width = `${pct}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        if (totalTimeEl && audio.duration) {
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener('ended', () => {
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
        if (audioAlert) {
            audioAlert.classList.remove('hidden');
            audioAlert.textContent = 'Audio file currently unavailable';
        }
        pauseAudio();
    });

    if (seekContainer) {
        seekContainer.addEventListener('click', (e) => {
            if (!audio.duration) return;
            const rect = seekContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = Math.max(0, Math.min(audio.duration, pos * audio.duration));
        });

        seekContainer.addEventListener('mousemove', (e) => {
            if (!audio.duration || !seekTip) return;
            const rect = seekContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekTip.style.left = `${pos * 100}%`;
            seekTip.textContent = formatTime(pos * audio.duration);
            seekTip.style.opacity = '1';
        });

        seekContainer.addEventListener('mouseleave', () => {
            if (seekTip) seekTip.style.opacity = '0';
        });
    }

    // Controls Buttons
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);

    if (volumeCtrl) {
        volumeCtrl.addEventListener('input', (e) => {
            setVolume(parseInt(e.target.value, 10));
        });
    }

    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            localStorage.setItem('mahikari_player_shuffle', isShuffle.toString());
            shuffleBtn.classList.toggle('active', isShuffle);
        });
    }

    if (repeatBtn) {
        function updateRepeatUI() {
            if (repeatMode === 'all') {
                repeatBtn.className = 'ctrl-btn repeat-btn active';
                repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
                repeatBtn.title = 'Repeat: All';
            } else if (repeatMode === 'one') {
                repeatBtn.className = 'ctrl-btn repeat-btn active';
                repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
                repeatBtn.title = 'Repeat: One Track';
            } else {
                repeatBtn.className = 'ctrl-btn repeat-btn';
                repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
                repeatBtn.title = 'Repeat: Off';
            }
        }
        updateRepeatUI();

        repeatBtn.addEventListener('click', () => {
            if (repeatMode === 'all') repeatMode = 'one';
            else if (repeatMode === 'one') repeatMode = 'none';
            else repeatMode = 'all';
            localStorage.setItem('mahikari_player_repeat', repeatMode);
            updateRepeatUI();
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
            });
        });
    }

    if (audioFxBtn && audioFxMenu) {
        audioFxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (playlistMenu) playlistMenu.classList.remove('open');
            audioFxMenu.classList.toggle('open');
        });
    }

    // Playlist Search & Dropdown Menu
    function renderPlaylist() {
        if (!playlistMenu) return;
        const visible = getFilteredPlaylist();
        const filterPersona = currentFilter === 'all' ? null : CONFIG.getPersona(currentFilter);
        const headerTitle = filterPersona
            ? `${filterPersona.name.toUpperCase()} · ${visible.length} TRACKS`
            : `ALL TRACKS · ${visible.length}`;

        const filtered = visible.filter(song => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return song.name.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
        });

        playlistMenu.innerHTML = `
            <div class="playlist-header">
                <span>${headerTitle}</span>
                <div class="search-wrap">
                    <i class="fas fa-search"></i>
                    <input type="text" id="playlist-search-input" placeholder="Search track or artist..." value="${searchQuery}">
                </div>
            </div>
            <div class="playlist-items-scroll">
                ${filtered.length === 0 ? '<div class="no-tracks">No matching tracks</div>' : ''}
                ${filtered.map(song => {
                    const globalIdx = fullPlaylist.indexOf(song);
                    const isPlaying = globalIdx === currentTrackIndex;
                    const persona = personaOf(song);
                    return `
                        <button class="playlist-row ${isPlaying ? 'active' : ''}" data-idx="${globalIdx}" type="button">
                            <span class="row-num">${isPlaying ? '<i class="fas fa-volume-high"></i>' : visible.indexOf(song) + 1}</span>
                            <span class="row-info">
                                <span class="row-title">${song.name}</span>
                                <span class="row-artist">${song.artist}${persona && currentFilter === 'all' ? ` · ${persona.name}` : ''}</span>
                            </span>
                            <span class="row-duration">${song.duration}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;

        const searchInput = document.getElementById('playlist-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderPlaylist();
            });
        }

        playlistMenu.querySelectorAll('.playlist-row').forEach(row => {
            row.addEventListener('click', () => {
                const idx = parseInt(row.dataset.idx, 10);
                loadTrack(idx, true);
                playlistMenu.classList.remove('open');
            });
        });
    }

    if (playlistToggleBtn && playlistMenu) {
        playlistToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audioFxMenu) audioFxMenu.classList.remove('open');
            playlistMenu.classList.toggle('open');
            if (playlistMenu.classList.contains('open')) {
                renderPlaylist();
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
    });

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase())) {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
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
        }
    });

    // Initial boot
    renderCategoryTabs();
    renderFxMenu();
    let savedVol = parseInt(localStorage.getItem('minkoi_player_volume') || (CONFIG.music.defaultVolume || 45), 10);
    let savedIdx = parseInt(localStorage.getItem('minkoi_player_track_idx') || '0', 10);
    setVolume(isNaN(savedVol) ? 45 : savedVol);
    loadTrack(isNaN(savedIdx) ? 0 : savedIdx, false);
})();