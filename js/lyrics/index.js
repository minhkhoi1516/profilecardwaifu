/* ========================================================
   MINKOI LYRICS ENGINE V2 · CONTROLLER
   Wires Provider, Matcher, Parser, Normalizer, Cache,
   SyncEngine, Renderer, Diagnostics & Editor cleanly to DOM.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    function safeGet(key, def) {
        try { return global.localStorage?.getItem(key) ?? def; } catch (_) { return def; }
    }
    function safeSet(key, val) {
        try { global.localStorage?.setItem(key, val); } catch (_) {}
    }

    function initController() {
        const audio = document.getElementById('audio-player');
        const lyricsModal = document.getElementById('lyrics-modal');
        const lyricsTitle = document.getElementById('lyrics-title');
        const lyricsArtist = document.getElementById('lyrics-artist');
        const lyricsBody = document.getElementById('lyrics-body');
        const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
        const lyricsToggleBtn = document.getElementById('lyrics-toggle-btn');
        const lyricsModeToggle = document.getElementById('lyrics-mode-toggle');
        const lyricsModeLabel = document.getElementById('lyrics-mode-label');
        const lyricsSyncBadge = document.getElementById('lyrics-sync-badge');
        const lyricsRecenterBtn = document.getElementById('lyrics-recenter-btn');
        const lyricsEditorBtn = document.getElementById('lyrics-editor-btn');
        const lyricsEditorPanel = document.getElementById('lyrics-editor-panel');

        const offsetValText = document.getElementById('offset-val-text');
        const tapSyncToggleBtn = document.getElementById('tap-sync-toggle-btn');

        const zenAmbientLyric = document.getElementById('zen-ambient-lyric');
        const zenLyricRomaji = document.getElementById('zen-lyric-romaji');
        const zenLyricVi = document.getElementById('zen-lyric-vi');

        if (!audio) return null;

        let currentTrack = null;
        let currentDoc = null;
        let currentDiagnostics = null;
        let currentMatchResult = null;
        let activeLoadController = null;
        let loadSequence = 0;

        let viewMode = safeGet('minkoi_lyrics_mode', 'karaoke');

        const syncEngine = new ns.SyncEngine(audio, {
            shouldAnimate: () => {
                const drawerOpen = Boolean(lyricsModal && lyricsModal.classList.contains('open'));
                const zenOpen = document.body.classList.contains('zen-mode');
                return drawerOpen || zenOpen;
            },
            onFrame: (snapshot) => {
                const drawerOpen = Boolean(lyricsModal && lyricsModal.classList.contains('open'));
                const zenOpen = document.body.classList.contains('zen-mode');
                renderer.updateFrame(snapshot, { drawerOpen, zenOpen });
            }
        });

        const editor = new ns.Editor(lyricsEditorPanel, {
            onReloadTrack: (track) => loadLyricsForTrack(track, { bypassCache: true })
        });

        const renderer = new ns.Renderer(
            {
                modal: lyricsModal,
                title: lyricsTitle,
                artist: lyricsArtist,
                body: lyricsBody,
                syncBadge: lyricsSyncBadge,
                modeToggle: lyricsModeToggle,
                modeLabel: lyricsModeLabel,
                tapSyncBtn: tapSyncToggleBtn,
                recenterBtn: lyricsRecenterBtn,
                zenAmbientBox: zenAmbientLyric,
                zenRomaji: zenLyricRomaji,
                zenVi: zenLyricVi
            },
            {
                onSeekToLine: (line) => {
                    if (!Number.isFinite(line.startMs)) return;
                    const docOffMs = currentDoc && Number.isFinite(currentDoc.offsetMs) ? currentDoc.offsetMs : 0;
                    const userOffMs = Math.round((syncEngine.userOffsetSec || 0) * 1000);
                    // Invert offsets so clicking a line lands smoothly when active playback passes that phrase
                    const targetSec = Math.max(0, (line.startMs - docOffMs - userOffMs) / 1000);
                    audio.currentTime = targetSec;
                    syncEngine.forceSync(true);
                    if (audio.paused) {
                        audio.play().catch(() => {});
                    }
                },
                onTapSyncLine: (line) => {
                    if (!currentTrack || !Number.isFinite(line.startMs)) return;
                    const docOffMs = currentDoc && Number.isFinite(currentDoc.offsetMs) ? currentDoc.offsetMs : 0;
                    const curAudioMs = (audio.currentTime || 0) * 1000;
                    const diffSec = (line.startMs - curAudioMs - docOffMs) / 1000;
                    const savedOffset = ns.Cache.setTrackOffsetSec(currentTrack, diffSec);
                    syncEngine.setUserOffsetSec(savedOffset);
                    updateOffsetUI(savedOffset);
                    renderer.setTapSyncMode(false);
                    if (typeof global.showToast === 'function') {
                        const sign = savedOffset > 0 ? '+' : '';
                        global.showToast(`🎯 Tap to Sync (${currentTrack.name}): ${sign}${savedOffset.toFixed(1)}s`, 'fa-bullseye');
                    }
                },
                onOpenEditor: () => {
                    editor.open();
                }
            }
        );

        renderer.setViewMode(viewMode);

        function updateOffsetUI(offsetSec) {
            if (!offsetValText) return;
            const sign = offsetSec > 0 ? '+' : '';
            offsetValText.textContent = `${sign}${offsetSec.toFixed(1)}s`;
            if (Math.abs(offsetSec) > 0.001) {
                offsetValText.style.color = 'var(--color-accent)';
                offsetValText.title = `Độ lệch riêng bài này: ${sign}${offsetSec.toFixed(1)}s (Nhấp để đặt lại 0.0s)`;
            } else {
                offsetValText.style.color = '';
                offsetValText.title = 'Đồng bộ chuẩn 0.0s cho bài này (Nhấp để đặt lại)';
            }
        }

        function adjustOffset(delta) {
            if (!currentTrack) return;
            const cur = ns.Cache.getTrackOffsetSec(currentTrack);
            const saved = ns.Cache.setTrackOffsetSec(currentTrack, cur + delta);
            syncEngine.setUserOffsetSec(saved);
            updateOffsetUI(saved);
            if (typeof global.showToast === 'function') {
                const dir = delta > 0 ? `Sớm hơn lời (+${delta}s)` : `Lùi lại (${delta}s)`;
                global.showToast(`Đồng bộ track: ${dir} → ${saved > 0 ? '+' : ''}${saved.toFixed(1)}s`, 'fa-clock');
            }
        }

        function resetOffset() {
            if (!currentTrack) return;
            const saved = ns.Cache.setTrackOffsetSec(currentTrack, 0);
            syncEngine.setUserOffsetSec(saved);
            updateOffsetUI(saved);
            if (typeof global.showToast === 'function') {
                global.showToast('Đã đặt lại độ lệch track về 0.0s', 'fa-rotate-left');
            }
        }

        async function loadLyricsForTrack(track, options = {}) {
            if (!track) return;

            // Cancel any in-flight fetch immediately (stale request cancellation on rapid Next/Prev)
            if (activeLoadController) {
                activeLoadController.abort();
            }
            activeLoadController = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const mySeq = ++loadSequence;

            currentTrack = track;
            const trackOffset = ns.Cache.getTrackOffsetSec(track);
            syncEngine.setUserOffsetSec(trackOffset);
            updateOffsetUI(trackOffset);
            renderer.setTapSyncMode(false);
            renderer.renderLoading(track);

            try {
                const durSec = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
                const result = await ns.Provider.loadForTrack(track, {
                    signal: activeLoadController ? activeLoadController.signal : undefined,
                    bypassCache: Boolean(options.bypassCache),
                    audioDurationSec: durSec
                });

                if (mySeq !== loadSequence) return; // Superseded by newer track change

                currentDoc = result.document;
                currentDiagnostics = result.diagnostics;
                currentMatchResult = result.matchResult;

                renderer.mountDocument(track, currentDoc, currentDiagnostics);
                syncEngine.setDocument(currentDoc);
                editor.setState({
                    track,
                    doc: currentDoc,
                    diagnostics: currentDiagnostics,
                    matchResult: currentMatchResult
                });

                if (!audio.paused) {
                    syncEngine.startLoop();
                }
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                if (mySeq !== loadSequence) return;
                const errDoc = ns.Normalizer.normalizeDocument({
                    trackId: track.id,
                    syncLevel: 'unavailable',
                    source: 'provider-error',
                    lines: []
                }, track);
                currentDoc = errDoc;
                currentDiagnostics = ns.Diagnostics.analyze(errDoc, track, null, null);
                renderer.mountDocument(track, currentDoc, currentDiagnostics);
                syncEngine.setDocument(currentDoc);
            }
        }

        function getActiveTrackFromPlayer() {
            if (typeof global.getCurrentPlayingTrack === 'function') return global.getCurrentPlayingTrack();
            if (typeof global.getCurrentTrack === 'function') return global.getCurrentTrack();
            return (global.CONFIG?.music?.playlist || [])[0] || null;
        }

        function openLyrics() {
            if (!lyricsModal) return;
            const track = getActiveTrackFromPlayer();
            if (track && (!currentTrack || currentTrack.id !== track.id || currentTrack.file !== track.file)) {
                loadLyricsForTrack(track);
            }
            lyricsModal.classList.add('open');
            if (lyricsToggleBtn) lyricsToggleBtn.classList.add('active');
            syncEngine.forceSync(true);
            if (!audio.paused) syncEngine.startLoop();
            if (typeof global.playChimeSFX === 'function') {
                global.playChimeSFX(track?.persona || 'alya');
            }
        }

        function closeLyrics() {
            if (!lyricsModal) return;
            lyricsModal.classList.remove('open');
            if (lyricsToggleBtn) lyricsToggleBtn.classList.remove('active');
            editor.close();
            if (!document.body.classList.contains('zen-mode')) {
                syncEngine.stopLoop();
            }
        }

        function toggleLyrics() {
            if (lyricsModal?.classList.contains('open')) closeLyrics();
            else openLyrics();
        }

        // Bind DOM UI Events
        document.querySelectorAll('.offset-nudge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const delta = btn.dataset.delta ? parseFloat(btn.dataset.delta) : (btn.id === 'offset-minus-btn' ? -0.2 : 0.2);
                if (!isNaN(delta)) adjustOffset(delta);
            });
        });
        if (offsetValText) {
            offsetValText.addEventListener('click', (e) => {
                e.stopPropagation();
                resetOffset();
            });
        }

        if (tapSyncToggleBtn) {
            tapSyncToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const next = !renderer.tapSyncActive;
                renderer.setTapSyncMode(next);
                if (typeof global.showToast === 'function') {
                    global.showToast(
                        next ? '🎯 Tap to Sync: Chạm vào câu đang hát để cân chỉnh track này!' : 'Đã tắt Tap to Sync',
                        next ? 'fa-bullseye' : 'fa-rotate-left'
                    );
                }
            });
        }

        if (lyricsModeToggle) {
            lyricsModeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                viewMode = viewMode === 'karaoke' ? 'full' : 'karaoke';
                safeSet('minkoi_lyrics_mode', viewMode);
                renderer.setViewMode(viewMode);
                syncEngine.forceSync(true);
            });
        }

        if (lyricsEditorBtn) {
            lyricsEditorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editor.toggle();
            });
        }

        if (lyricsToggleBtn) {
            lyricsToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLyrics();
            });
        }

        if (lyricsCloseBtn) {
            lyricsCloseBtn.addEventListener('click', closeLyrics);
        }

        document.addEventListener('click', (e) => {
            if (lyricsModal && lyricsModal.classList.contains('open')) {
                if (!lyricsModal.contains(e.target) && e.target !== lyricsToggleBtn && !lyricsToggleBtn?.contains(e.target)) {
                    closeLyrics();
                }
            }
        });

        global.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lyricsModal?.classList.contains('open')) {
                if (editor.isOpen) {
                    editor.close();
                } else {
                    closeLyrics();
                }
            }
        });

        // Listen for player track changes
        global.addEventListener('minkoi:trackchange', (e) => {
            const track = e.detail?.track;
            if (track) {
                loadLyricsForTrack(track);
            }
        });

        // Observe zen-mode toggles on body so RAF wakes/sleeps smoothly
        if (typeof MutationObserver !== 'undefined') {
            const zenObserver = new MutationObserver(() => {
                const zenOpen = document.body.classList.contains('zen-mode');
                syncEngine.forceSync(true);
                if (zenOpen && !audio.paused) {
                    syncEngine.startLoop();
                } else if (!zenOpen && !lyricsModal?.classList.contains('open')) {
                    syncEngine.stopLoop();
                }
            });
            zenObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }

        // Re-check diagnostics once audio duration loads natively
        audio.addEventListener('loadedmetadata', () => {
            if (currentTrack && currentDoc) {
                currentDiagnostics = ns.Diagnostics.analyze(currentDoc, currentTrack, audio.duration, currentMatchResult);
                editor.setState({
                    track: currentTrack,
                    doc: currentDoc,
                    diagnostics: currentDiagnostics,
                    matchResult: currentMatchResult
                });
            }
        });

        // Initial load of currently loaded track (fixes original bug where initial loadTrack fired BEFORE lyrics loaded!)
        const initialTrack = getActiveTrackFromPlayer();
        if (initialTrack) {
            loadLyricsForTrack(initialTrack);
        }

        const api = {
            toggleLyrics,
            openLyrics,
            closeLyrics,
            adjustOffset,
            resetOffset,
            loadLyricsForTrack,
            getState: () => ({
                track: currentTrack,
                document: currentDoc,
                diagnostics: currentDiagnostics,
                matchResult: currentMatchResult
            }),
            syncEngine,
            renderer,
            editor
        };

        global.toggleLyrics = toggleLyrics;
        global.openLyrics = openLyrics;
        global.closeLyrics = closeLyrics;
        global.adjustLyricsOffset = adjustOffset;
        global.resetLyricsOffset = resetOffset;
        ns.controller = api;
        return api;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initController);
        } else {
            initController();
        }
    }
})(typeof window !== 'undefined' ? window : globalThis);
