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
        const zenLyricJp = document.getElementById('zen-lyric-jp');
        const zenLyricRomaji = document.getElementById('zen-lyric-romaji');
        const zenLyricVi = document.getElementById('zen-lyric-vi');

        if (!audio) return null;

        let currentTrack = null;
        let currentDoc = null;
        let currentDiagnostics = null;
        let currentMatchResult = null;
        let activeLoadController = null;
        let loadSequence = 0;

        let viewMode = safeGet('minkoi_lyrics_mode', 'floating');
        const displayPresets = ['jp,romaji,vi', 'jp,vi', 'jp,romaji', 'jp', 'romaji', 'vi'];
        let displayLayers = safeGet('minkoi_lyrics_layers', 'jp,romaji,vi');
        if (!displayPresets.includes(displayLayers)) displayLayers = displayPresets[0];

        function isDrawerActive() {
            if (!lyricsModal) return false;
            const state = lyricsModal.dataset.panelState;
            return lyricsModal.classList.contains('open') || state === 'open' || state === 'opening';
        }

        const syncEngine = new ns.SyncEngine(audio, {
            shouldAnimate: () => {
                const drawerOpen = isDrawerActive();
                const zenOpen = document.body.classList.contains('zen-mode');
                return drawerOpen || zenOpen;
            },
            onFrame: (snapshot) => {
                const drawerOpen = isDrawerActive();
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
                zenJp: zenLyricJp,
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
        renderer.setDisplayLayers(displayLayers);

        // Compact child popover: shares the site's spring scheduler and stays
        // inside the drawer focus trap. Closing immediately removes hit targets.
        const displayBtn = document.getElementById('lyrics-display-btn');
        const displayMenu = document.getElementById('lyrics-display-menu');
        let displayOpen = false;
        let displayGeneration = 0;
        const displaySpring = global.MinkoiSpring?.createSpring({
            initial: 0, precision: 0.01, velocityPrecision: 0.05,
            onUpdate: value => {
                if (!displayMenu) return;
                displayMenu.style.opacity = String(Math.max(0, Math.min(1, value)));
                displayMenu.style.transform = `translateY(${(1 - value) * -5}px) scale(${0.94 + value * 0.06})`;
            }
        });
        function toggleDisplayMenu(open) {
            if (!displayMenu || !displayBtn) return;
            const generation = ++displayGeneration;
            displayOpen = open;
            displayBtn.setAttribute('aria-expanded', String(open));
            displayMenu.inert = !open;
            if (open) displayMenu.hidden = false;
            const done = () => {
                if (generation !== displayGeneration) return;
                if (!open) displayMenu.hidden = true;
            };
            if (displaySpring) displaySpring.setTarget(open ? 1 : 0, { onComplete: done });
            else { displayMenu.style.opacity = open ? '1' : '0'; done(); }
        }
        function setDisplayLayers(value) {
            if (!displayPresets.includes(value)) return;
            displayLayers = value;
            safeSet('minkoi_lyrics_layers', value);
            renderer.setDisplayLayers(value);
            displayMenu?.querySelectorAll('[data-lyrics-layers]').forEach(button => {
                button.setAttribute('aria-pressed', String(button.dataset.lyricsLayers === value));
            });
            syncEngine.forceSync(true);
        }
        setDisplayLayers(displayLayers);
        displayBtn?.addEventListener('click', e => {
            e.stopPropagation(); toggleDisplayMenu(!displayOpen);
            if (displayOpen) displayMenu.querySelector('[aria-pressed="true"]')?.focus();
        });
        displayMenu?.addEventListener('click', e => {
            const button = e.target.closest('[data-lyrics-layers]');
            if (!button) return;
            e.stopPropagation(); setDisplayLayers(button.dataset.lyricsLayers);
            toggleDisplayMenu(false); displayBtn.focus();
        });
        displayMenu?.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                e.preventDefault(); e.stopPropagation();
                toggleDisplayMenu(false); displayBtn.focus();
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                const buttons = Array.from(displayMenu.querySelectorAll('button'));
                const i = buttons.indexOf(document.activeElement);
                const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
                buttons[next].focus();
            }
        });
        document.addEventListener('click', e => {
            if (displayOpen && !e.target.closest('.lyrics-display-wrap')) toggleDisplayMenu(false);
        });

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
            currentDoc = null;
            renderer.renderLoading(track);
            syncEngine.setDocument(null);
            const trackOffset = ns.Cache.getTrackOffsetSec(track);
            syncEngine.setUserOffsetSec(trackOffset);
            updateOffsetUI(trackOffset);
            renderer.setTapSyncMode(false);

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

                // Mount the current line even while paused, otherwise Zen opened
                // after a track change stays empty until playback resumes.
                syncEngine.forceSync(false);
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

        let releaseLyricsTrap = null;
        let lyricsController = null;

        if (global.MinkoiUI && typeof global.MinkoiUI.createMiuixPanelOverlay === 'function' && lyricsModal) {
            lyricsController = global.MinkoiUI.createMiuixPanelOverlay({
                id: 'lyrics',
                panelEl: lyricsModal,
                triggerBtn: lyricsToggleBtn,
                isCenterModal: true,
                onBeforeOpen: () => {
                    const track = getActiveTrackFromPlayer();
                    const needsReload = track && (
                        !currentTrack ||
                        currentTrack.id !== track.id ||
                        currentTrack.file !== track.file ||
                        Boolean(currentDoc && currentDoc._isTransientFallback)
                    );
                    if (needsReload) {
                        loadLyricsForTrack(track, { bypassCache: Boolean(currentDoc && currentDoc._isTransientFallback) });
                    }
                    if (typeof renderer.resetDrawerSync === 'function') {
                        renderer.resetDrawerSync();
                    }
                    // Panel enters 'opening' state synchronously right after onBeforeOpen;
                    // sync on the first visible frame so the active line is highlighted immediately.
                    if (typeof global.requestAnimationFrame === 'function') {
                        global.requestAnimationFrame(() => {
                            if (!isDrawerActive()) return;
                            syncEngine.forceSync(true);
                            if (!audio.paused) syncEngine.startLoop();
                        });
                    }
                    if (typeof global.playChimeSFX === 'function') {
                        global.playChimeSFX(track?.persona || 'alya');
                    }
                },
                onAfterOpen: () => {
                    if (!isDrawerActive()) return;
                    syncEngine.forceSync(true);
                    if (!audio.paused) syncEngine.startLoop();
                },
                onBeforeClose: () => {
                    toggleDisplayMenu(false);
                    editor.close();
                    if (!document.body.classList.contains('zen-mode')) {
                        syncEngine.stopLoop();
                    }
                }
            });
        }

        function openLyrics() {
            if (lyricsController) {
                lyricsController.open();
                return;
            }
            if (!lyricsModal) return;
            if (global.MinkoiUI && typeof global.MinkoiUI.closeAllOverlays === 'function') {
                global.MinkoiUI.closeAllOverlays('lyrics');
            }
            const track = getActiveTrackFromPlayer();
            if (track && (!currentTrack || currentTrack.id !== track.id || currentTrack.file !== track.file)) {
                loadLyricsForTrack(track);
            }
            lyricsModal.classList.add('open');
            if (lyricsToggleBtn) {
                lyricsToggleBtn.classList.add('active');
                lyricsToggleBtn.setAttribute('aria-expanded', 'true');
            }
            if (global.MinkoiUI && typeof global.MinkoiUI.pushFocusTrap === 'function') {
                if (releaseLyricsTrap) releaseLyricsTrap();
                releaseLyricsTrap = global.MinkoiUI.pushFocusTrap(lyricsModal, lyricsToggleBtn);
            }
            syncEngine.forceSync(true);
            if (!audio.paused) syncEngine.startLoop();
            if (typeof global.playChimeSFX === 'function') {
                global.playChimeSFX(track?.persona || 'alya');
            }
        }

        function closeLyrics(opts) {
            if (lyricsController) {
                lyricsController.close(opts);
                return;
            }
            if (!lyricsModal) return;
            lyricsModal.classList.remove('open');
            if (lyricsToggleBtn) {
                lyricsToggleBtn.classList.remove('active');
                lyricsToggleBtn.setAttribute('aria-expanded', 'false');
            }
            editor.close();
            if (releaseLyricsTrap) {
                const fn = releaseLyricsTrap;
                releaseLyricsTrap = null;
                fn({ restoreFocus: !opts || opts.restoreFocus !== false });
            }
            if (!document.body.classList.contains('zen-mode')) {
                syncEngine.stopLoop();
            }
        }

        if (!lyricsController && global.MinkoiUI && typeof global.MinkoiUI.registerOverlay === 'function') {
            global.MinkoiUI.registerOverlay('lyrics', {
                isOpen: () => Boolean(lyricsModal && lyricsModal.classList.contains('open')),
                close: closeLyrics
            });
        }

        function toggleLyrics() {
            if (lyricsController) {
                lyricsController.toggle();
                return;
            }
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
                const modes = ['floating', 'karaoke', 'full'];
                viewMode = modes[(modes.indexOf(viewMode) + 1) % modes.length];
                safeSet('minkoi_lyrics_mode', viewMode);
                renderer.setViewMode(viewMode);
                syncEngine.forceSync(true);
            });
        }

        if (lyricsBody) {
            lyricsBody.addEventListener('click', (e) => {
                const cta = e.target && e.target.closest ? e.target.closest('.lyrics-open-editor-cta') : null;
                if (cta) {
                    e.stopPropagation();
                    if (!editor.isOpen) editor.open();
                }
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
                const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
                const insideModal = path.includes(lyricsModal) || lyricsModal.contains(e.target);
                const onToggleBtn = e.target === lyricsToggleBtn || Boolean(lyricsToggleBtn?.contains(e.target)) || path.includes(lyricsToggleBtn);
                if (!insideModal && !onToggleBtn) {
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
            let lastZenOpen = document.body.classList.contains('zen-mode');
            const zenObserver = new MutationObserver(() => {
                const zenOpen = document.body.classList.contains('zen-mode');
                if (zenOpen === lastZenOpen) return;
                lastZenOpen = zenOpen;
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

        // Pure in-memory lookup for Seek Bar Lyric Peek (zero network, zero second parser)
        function peekLineAt(timeSec) {
            if (!Number.isFinite(timeSec) || !currentDoc || currentDoc.isInstrumental) return null;
            if (currentDoc.syncLevel === 'plain' || currentDoc.syncLevel === 'unavailable' || currentDoc.syncLevel === 'restricted') {
                return null;
            }
            const lines = currentDoc.lines;
            if (!Array.isArray(lines) || lines.length === 0 || !Number.isFinite(lines[0]?.startMs)) {
                return null;
            }
            const docOffMs = Number.isFinite(currentDoc.offsetMs) ? currentDoc.offsetMs : 0;
            const userOffMs = Math.round((syncEngine.userOffsetSec || 0) * 1000);
            const effectiveMs = Math.max(0, Math.round(timeSec * 1000) + docOffMs + userOffMs);
            const idx = ns.SyncMath.findActiveLineIndex(lines, effectiveMs);
            if (idx < 0 || !lines[idx]) return null;

            const line = lines[idx];
            const active = displayLayers.split(',');
            const pref = active.includes('jp')
                ? ['jp', ...active.filter(k => k !== 'jp')]
                : [...active, 'jp'];
            let raw = '';
            for (const layer of pref) {
                if (layer === 'jp') raw = (line.jp || line.text || '').trim();
                else if (layer === 'romaji') raw = (line.romaji || '').trim();
                else if (layer === 'vi') raw = (line.vi || '').trim();
                if (raw) break;
            }
            if (!raw) raw = (line.text || line.jp || line.romaji || line.vi || '').trim();
            if (!raw) return null;
            return { index: idx, text: raw.replace(/\s+/g, ' ') };
        }

        const api = {
            toggleLyrics,
            openLyrics,
            closeLyrics,
            adjustOffset,
            resetOffset,
            setDisplayLayers,
            loadLyricsForTrack,
            peekLineAt,
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
