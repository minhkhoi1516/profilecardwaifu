/* ========================================================
   MINKOI LYRICS ENGINE V2 · RENDERER
   Apple Music Sing continuous word/syllable sweep rendering,
   honest fallback states, Japanese Unicode typography,
   zero-rebuild RAF updates, center scroll lock & Zen sync.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    const SYNC_LABELS = {
        syllable: { text: 'SING · SYLLABLE', title: 'Đồng bộ theo âm tiết (Apple Music Sing style)' },
        word: { text: 'SING · WORD', title: 'Đồng bộ liên tục theo từng từ' },
        line: { text: 'LINE SYNC', title: 'Đồng bộ theo từng dòng (chưa có word timing gốc)' },
        plain: { text: 'PLAIN LYRICS', title: 'Lời văn bản chưa gắn mốc thời gian' },
        instrumental: { text: 'INSTRUMENTAL', title: 'Bản hòa tấu không lời' },
        restricted: { text: 'RESTRICTED', title: 'Nguồn phát bị giới hạn quyền đồng bộ karaoke' },
        unavailable: { text: 'NO LYRICS', title: 'Chưa có nguồn lời bài hát được cấp phép' }
    };

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatTimeLabel(ms) {
        if (!Number.isFinite(ms) || ms < 0) return '0:00';
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    class LyricsRenderer {
        constructor(domRefs, callbacks = {}) {
            this.dom = domRefs || {};
            this.callbacks = callbacks;

            this.doc = null;
            this.track = null;
            this.diagnostics = null;

            this.lineRefs = [];
            this.interludeRefs = new Map();
            this.activeLineIndex = -1;
            this.lastScrolledIndex = -1;
            this.lastZenLineIndex = -2;
            this.zenTokenRefs = [];
            this.zenPending = null;
            this.zenRenderedIndex = -1;
            this._zenInstantRaf = 0;

            this.viewMode = 'floating'; // 'floating' | 'karaoke' | 'full'
            this.tapSyncActive = false;
            this.isUserScrolling = false;
            this.scrollPauseTimer = null;
            this.displayLayers = ['jp', 'romaji', 'vi'];
            this.scrollSpring = global.MinkoiSpring?.createSpring({
                initial: 0, precision: 0.5, velocityPrecision: 2,
                onUpdate: value => { if (this.dom.body) this.dom.body.scrollTop = value; }
            });
            this.zenMotion = global.MinkoiSpring?.createSpring({
                initial: 1, precision: 0.01, velocityPrecision: 0.05,
                onUpdate: value => {
                    const box = this.dom.zenAmbientBox;
                    if (!box) return;
                    const phase = Math.max(0, Math.min(1, value));
                    box.style.setProperty('--lyric-enter-y', `${((1 - phase) * 4).toFixed(2)}px`);
                    box.style.setProperty('--lyric-enter-opacity', String(0.82 + phase * 0.18));
                    // Swap content only after the outgoing phrase has softened.
                    // Retarget this same spring; no second timeline/RAF exists.
                    if (value < 0.5 && this.zenPending) {
                        const commit = this.zenPending;
                        this.zenPending = null;
                        commit();
                        this.zenMotion.setTarget(1);
                    }
                }
            });

            this._bindScrollDetection();
        }

        _bindScrollDetection() {
            const body = this.dom.body;
            if (!body) return;

            const markManualScroll = () => {
                if (this.viewMode === 'full' || !this.doc || this.lineRefs.length === 0) return;
                if (this.scrollSpring) this.scrollSpring.snap(body.scrollTop);
                this.isUserScrolling = true;
                this._syncRecenterVisibility(true);
                if (this.scrollPauseTimer) clearTimeout(this.scrollPauseTimer);
                this.scrollPauseTimer = setTimeout(() => {
                    this.isUserScrolling = false;
                    this._syncRecenterVisibility(false);
                }, 3200);
            };

            body.addEventListener('wheel', markManualScroll, { passive: true });
            body.addEventListener('touchstart', markManualScroll, { passive: true });

            if (this.dom.recenterBtn) {
                this.dom.recenterBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.recenterNow();
                });
            }
        }

        _syncRecenterVisibility(show) {
            if (!this.dom.recenterBtn) return;
            const visible = Boolean(show && this.activeLineIndex >= 0 && this.doc?.lines?.length > 0 && this.viewMode !== 'full');
            this.dom.recenterBtn.classList.toggle('visible', visible);
        }

        recenterNow() {
            this.isUserScrolling = false;
            if (this.scrollPauseTimer) {
                clearTimeout(this.scrollPauseTimer);
                this.scrollPauseTimer = null;
            }
            this._syncRecenterVisibility(false);
            if (this.activeLineIndex >= 0) {
                this._scrollLineToCenter(this.activeLineIndex, false);
            }
        }

        setViewMode(mode) {
            this.viewMode = ['full', 'floating', 'karaoke'].includes(mode) ? mode : 'floating';
            if (this.dom.body) {
                this.dom.body.classList.toggle('full-view', this.viewMode === 'full');
                this.dom.body.classList.toggle('floating-view', this.viewMode === 'floating');
            }
            if (this.dom.modeToggle) {
                const isFull = this.viewMode === 'full';
                this.dom.modeToggle.classList.toggle('active', isFull);
                const labels = { floating: 'Floating', karaoke: 'Karaoke', full: 'Toàn bài' };
                this.dom.modeToggle.textContent = labels[this.viewMode];
                this.dom.modeToggle.title = 'Kiểu xem: Floating → Karaoke → Toàn bài';
            }
            if (this.viewMode !== 'full' && this.activeLineIndex >= 0) {
                this.isUserScrolling = false;
                this._scrollLineToCenter(this.activeLineIndex, true);
            }
            this._syncRecenterVisibility(false);
        }

        setDisplayLayers(value) {
            const layers = String(value).split(',').filter(l => ['jp', 'romaji', 'vi'].includes(l));
            this.displayLayers = layers.length ? layers : ['jp', 'romaji', 'vi'];
            for (const container of [this.dom.modal, this.dom.zenAmbientBox]) {
                if (!container) continue;
                for (const layer of ['jp', 'romaji', 'vi']) container.dataset[`show${layer[0].toUpperCase()}${layer.slice(1)}`] = String(this.displayLayers.includes(layer));
            }
            this.lastZenLineIndex = -3;
            this.zenPending = null;
            this._updateMissingLayers();
            this.lastScrolledIndex = -1;
        }

        _updateMissingLayers() {
            this.lineRefs.forEach(ref => {
                const values = { jp: ref.line.jp, romaji: ref.line.romaji, vi: ref.line.translation };
                const empty = !this.displayLayers.some(layer => values[layer]);
                ref.el.classList.toggle('missing-selected-layer', empty);
            });
        }

        setTapSyncMode(active) {
            this.tapSyncActive = Boolean(active);
            if (this.dom.tapSyncBtn) {
                this.dom.tapSyncBtn.classList.toggle('active', this.tapSyncActive);
            }
            if (this.dom.body) {
                this.dom.body.classList.toggle('tap-sync-mode', this.tapSyncActive);
            }
        }

        _clearZenInstant(box) {
            if (this._zenInstantRaf && typeof global.cancelAnimationFrame === 'function') {
                global.cancelAnimationFrame(this._zenInstantRaf);
                this._zenInstantRaf = 0;
            }
            if (box) box.classList.remove('is-instant');
        }

        _commitZenInstant(box, mutateFn) {
            if (!box) {
                mutateFn();
                return;
            }
            if (this._zenInstantRaf && typeof global.cancelAnimationFrame === 'function') {
                global.cancelAnimationFrame(this._zenInstantRaf);
                this._zenInstantRaf = 0;
            }
            box.classList.add('is-instant');
            mutateFn();
            void box.offsetWidth;
            if (typeof global.requestAnimationFrame === 'function') {
                this._zenInstantRaf = global.requestAnimationFrame(() => {
                    this._zenInstantRaf = 0;
                    box.classList.remove('is-instant');
                });
            } else {
                box.classList.remove('is-instant');
            }
        }

        renderLoading(track) {
            this.zenPending = null;
            this.zenRenderedIndex = -1;
            if (this.scrollSpring) this.scrollSpring.snap(this.dom.body?.scrollTop || 0);
            this.zenMotion?.snap(1);
            if (this.dom.zenAmbientBox) {
                this._commitZenInstant(this.dom.zenAmbientBox, () => {
                    this.dom.zenAmbientBox.classList.remove('has-lyric', 'is-breathing-out');
                    this.dom.zenAmbientBox.setAttribute('aria-hidden', 'true');
                });
            }
            for (const el of [this.dom.zenJp, this.dom.zenRomaji, this.dom.zenVi]) if (el) el.textContent = '';
            this.track = track;
            this.doc = null;
            this.lineRefs = [];
            this.activeLineIndex = -1;
            this.lastScrolledIndex = -1;
            this.lastZenLineIndex = -2;
            this.zenTokenRefs = [];

            if (this.dom.title) this.dom.title.textContent = track?.name || 'Đang tải...';
            if (this.dom.artist) this.dom.artist.textContent = track?.artist || '';
            if (this.dom.syncBadge) {
                this.dom.syncBadge.textContent = 'LOADING...';
                this.dom.syncBadge.dataset.syncLevel = 'loading';
            }
            if (this.dom.body) {
                this.dom.body.innerHTML = `
                    <div class="lyrics-placeholder">
                        <div class="placeholder-icon"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i></div>
                        <span class="placeholder-title">Đang nạp lời bài hát...</span>
                        <span class="placeholder-sub">Kiểm tra track & nguồn dữ liệu đồng bộ.</span>
                    </div>
                `;
            }
        }

        mountDocument(track, doc, diagnostics) {
            this.zenPending = null;
            this.zenRenderedIndex = -1;
            if (this.dom.zenAmbientBox) {
                this._clearZenInstant(this.dom.zenAmbientBox);
                this.dom.zenAmbientBox.classList.remove('is-breathing-out');
            }
            this.track = track;
            this.doc = doc;
            this.diagnostics = diagnostics;
            this.lineRefs = [];
            this.interludeRefs.clear();
            this.activeLineIndex = -1;
            this.lastScrolledIndex = -1;
            this.lastZenLineIndex = -2;
            this.zenTokenRefs = [];
            this.isUserScrolling = false;
            this._syncRecenterVisibility(false);

            if (this.dom.title) this.dom.title.textContent = track?.name || doc?.title || '';
            if (this.dom.artist) this.dom.artist.textContent = track?.artist || doc?.artist || '';

            // Update sync level badge truthfully
            const syncLevel = doc?.syncLevel || 'unavailable';
            const badgeMeta = SYNC_LABELS[syncLevel] || SYNC_LABELS.unavailable;
            if (this.dom.syncBadge) {
                this.dom.syncBadge.textContent = `${badgeMeta.text}${doc?.isCustomImported ? ' · CUSTOM' : doc?.status === 'draft' ? ' · DRAFT' : ''}`;
                this.dom.syncBadge.dataset.syncLevel = syncLevel;
                this.dom.syncBadge.title = `${badgeMeta.title} · Nguồn: ${doc?.source || 'unknown'}`;
            }

            if (!this.dom.body) return;
            this.dom.body.dataset.syncLevel = syncLevel;
            this.dom.body.innerHTML = '';

            if (syncLevel === 'restricted') {
                this._renderStateCard(
                    'fa-shield-halved',
                    'SOURCE RESTRICTED · KHÔNG HỖ TRỢ OVERLAY',
                    track?.name || '',
                    doc?.restrictedReason || 'Nguồn phát hiện tại không cho phép hiển thị karaoke đồng bộ.',
                    false
                );
                return;
            }

            if (syncLevel === 'instrumental') {
                this.dom.body.innerHTML = `
                    <div class="lyrics-instrumental-card">
                        <div class="inst-disc-halo">
                            <i class="fas fa-compact-disc" aria-hidden="true"></i>
                        </div>
                        <span class="inst-tag">INSTRUMENTAL TRACK</span>
                        <h4 class="inst-title">${escapeHtml(track?.name || doc?.title || '')}</h4>
                        <p class="inst-desc">Bản hòa tấu không lời. Hãy thả mình vào giai điệu nguyên bản.</p>
                    </div>
                `;
                return;
            }

            if (syncLevel === 'unavailable' || !doc?.lines?.length) {
                const spotifyLink = track?.spotifyUrl || track?.spotifyPlaylistUrl;
                this.dom.body.innerHTML = `
                    <div class="lyrics-placeholder">
                        <div class="placeholder-icon"><i class="fas fa-music" aria-hidden="true"></i></div>
                        <span class="placeholder-title">Chưa có lyrics được xác minh cho bài này</span>
                        <span class="placeholder-sub">Hệ thống không tự bịa lời hoặc timestamp giả. Bạn có thể nạp file <code>.ttml</code>, <code>.elrc</code> hoặc <code>.lrc</code> hợp lệ trong Studio Lyrics Editor.</span>
                        <div class="placeholder-actions">
                            <button type="button" class="lyrics-open-editor-cta"><i class="fas fa-sliders" aria-hidden="true"></i> Mở Lyrics Editor / Import</button>
                            ${spotifyLink ? `<a class="lyrics-spotify-ref" href="${escapeHtml(spotifyLink)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-spotify" aria-hidden="true"></i> Spotify Metadata Ref</a>` : ''}
                        </div>
                    </div>
                `;
                if (!this._ctaDelegationBound) {
                    this._ctaDelegationBound = true;
                    this.dom.body.addEventListener('click', (e) => {
                        const cta = e.target && e.target.closest ? e.target.closest('.lyrics-open-editor-cta') : null;
                        if (cta) {
                            e.stopPropagation();
                            if (typeof this.callbacks.onOpenEditor === 'function') this.callbacks.onOpenEditor();
                        }
                    });
                }
                return;
            }

            // Build DOM elements once into a DocumentFragment (zero frame rebuilds)
            const frag = document.createDocumentFragment();
            const gapMap = new Map();
            if (diagnostics && Array.isArray(diagnostics.longGaps)) {
                diagnostics.longGaps.forEach(g => gapMap.set(g.afterLineIndex, g));
            }

            const isWordMode = syncLevel === 'word' || syncLevel === 'syllable';

            doc.lines.forEach((line, idx) => {
                const row = document.createElement('div');
                const cls = ['lyric-line'];
                if (syncLevel === 'plain') cls.push('is-plain-line');
                if (line.speaker === 'v2') cls.push('speaker-v2');
                else if (line.speaker) cls.push(`speaker-${line.speaker.replace(/[^a-z0-9_-]/gi, '')}`);
                if (line.isBackground) cls.push('is-bg-vocal');
                if (line.isJapanese) cls.push('is-japanese');
                if (isWordMode) cls.push('is-word-synced');
                else if (syncLevel === 'line') cls.push('is-line-synced');
                row.className = cls.join(' ');
                row.dataset.index = String(idx);
                if (Number.isFinite(line.startMs)) {
                    row.dataset.startMs = String(line.startMs);
                    row.setAttribute('role', 'button');
                    row.setAttribute('tabindex', '0');
                }

                // Timestamp column
                const timeSpan = document.createElement('span');
                timeSpan.className = 'lyric-time';
                timeSpan.textContent = Number.isFinite(line.startMs) ? formatTimeLabel(line.startMs) : '••';
                row.appendChild(timeSpan);

                // Content column
                const contentDiv = document.createElement('div');
                contentDiv.className = 'lyric-content';

                const primaryEl = document.createElement('span');
                const tokenIsJapanese = ns.Normalizer.containsJapanese(line.tokens?.map(t => t.text).join('') || line.text);
                primaryEl.className = tokenIsJapanese ? 'lyric-jp' : 'lyric-romaji';
                if (tokenIsJapanese) {
                    primaryEl.setAttribute('lang', 'ja');
                }

                const tokenRefs = [];
                if (isWordMode && Array.isArray(line.tokens) && line.tokens.length > 0) {
                    line.tokens.forEach((tok, tokIdx) => {
                        if (tok.isWhitespace) {
                            primaryEl.appendChild(document.createTextNode(tok.text));
                            return;
                        }
                        const span = document.createElement('span');
                        span.className = 'lyric-word is-upcoming-word';
                        if (tok.isSustained) span.classList.add('is-sustained');
                        if (tok.isBackground) span.classList.add('is-bg-token');
                        span.textContent = tok.text;
                        if (Number.isFinite(tok.startMs)) span.dataset.startMs = String(tok.startMs);
                        if (Number.isFinite(tok.endMs)) span.dataset.endMs = String(tok.endMs);
                        span.style.setProperty('--word-progress', '0');
                        span.style.setProperty('--word-pct', '0%');
                        primaryEl.appendChild(span);
                        tokenRefs.push({
                            tokenIndex: tokIdx,
                            el: span,
                            token: tok,
                            lastPct: '0%',
                            lastBucket: 'upcoming'
                        });
                    });
                } else {
                    primaryEl.textContent = tokenIsJapanese ? line.jp : (line.romaji || line.text || '');
                }
                if (tokenIsJapanese) {
                    if (line.jp) contentDiv.appendChild(primaryEl);
                    if (line.romaji) {
                        const romanEl = document.createElement('span');
                        romanEl.className = 'lyric-romaji'; romanEl.lang = 'ja-Latn';
                        romanEl.textContent = line.romaji; contentDiv.appendChild(romanEl);
                    }
                } else {
                    if (line.jp) {
                        const jpEl = document.createElement('span'); jpEl.className = 'lyric-jp'; jpEl.lang = 'ja';
                        jpEl.textContent = line.jp; contentDiv.appendChild(jpEl);
                    }
                    if (primaryEl.textContent) contentDiv.appendChild(primaryEl);
                }

                if (line.translation) {
                    const viEl = document.createElement('span');
                    viEl.className = 'lyric-vi';
                    viEl.lang = 'vi';
                    viEl.textContent = line.translation;
                    contentDiv.appendChild(viEl);
                }

                row.appendChild(contentDiv);

                // Click to seek or Tap-to-Sync
                if (Number.isFinite(line.startMs)) {
                    const triggerClick = (e) => {
                        e.stopPropagation();
                        if (this.tapSyncActive || e.altKey) {
                            this.callbacks.onTapSyncLine?.(line, idx);
                        } else {
                            this.callbacks.onSeekToLine?.(line, idx);
                        }
                    };
                    row.addEventListener('click', triggerClick);
                    row.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            triggerClick(e);
                        }
                    });
                }

                frag.appendChild(row);
                this.lineRefs.push({
                    index: idx,
                    el: row,
                    primaryEl,
                    line,
                    tokenRefs,
                    lastLineState: ''
                });

                // Render long instrumental break badge strictly derived from timed gaps
                const gap = gapMap.get(idx);
                if (gap) {
                    const interludeEl = document.createElement('div');
                    interludeEl.className = 'lyric-interlude-row';
                    interludeEl.dataset.startMs = String(gap.startMs);
                    interludeEl.dataset.endMs = String(gap.endMs);
                    const secLen = Math.round(gap.durationMs / 1000);
                    interludeEl.innerHTML = `
                        <span class="interlude-dots" aria-hidden="true"><span></span><span></span><span></span></span>
                        <span class="interlude-label">Nhạc dạo · ${secLen}s</span>
                        <span class="interlude-bar"><i></i></span>
                    `;
                    frag.appendChild(interludeEl);
                    this.interludeRefs.set(idx, {
                        el: interludeEl,
                        barEl: interludeEl.querySelector('.interlude-bar i')
                    });
                }
            });

            this.dom.body.appendChild(frag);
            this._updateMissingLayers();
        }

        _renderStateCard(iconClass, tag, title, desc, showEditorBtn) {
            if (!this.dom.body) return;
            this.dom.body.innerHTML = `
                <div class="lyrics-instrumental-card">
                    <div class="inst-disc-halo"><i class="fas ${iconClass}" aria-hidden="true"></i></div>
                    <span class="inst-tag">${escapeHtml(tag)}</span>
                    ${title ? `<h4 class="inst-title">${escapeHtml(title)}</h4>` : ''}
                    <p class="inst-desc">${escapeHtml(desc)}</p>
                    ${showEditorBtn ? '<button type="button" class="lyrics-open-editor-cta"><i class="fas fa-sliders"></i> Mở Lyrics Editor</button>' : ''}
                </div>
            `;
        }

        _scrollLineToCenter(lineIdx, instant) {
            const body = this.dom.body;
            const ref = this.lineRefs[lineIdx];
            if (!body || !ref || !ref.el) return false;
            if (body.clientHeight <= 0 || ref.el.offsetHeight <= 0) return false;
            const targetTop = Math.max(
                0,
                ref.el.offsetTop - (body.clientHeight / 2) + (ref.el.offsetHeight / 2)
            );
            if (this.scrollSpring) {
                if (instant) {
                    this.scrollSpring.snap(targetTop);
                } else {
                    if (!this.scrollSpring.running) this.scrollSpring.snap(body.scrollTop);
                    this.scrollSpring.setTarget(targetTop);
                }
                return true;
            }
            try {
                body.scrollTo({
                    top: targetTop,
                    behavior: instant ? 'auto' : 'smooth'
                });
            } catch (_) {
                body.scrollTop = targetTop;
            }
            return true;
        }

        /**
         * Reset drawer sync tracking when reopening the modal so the very first
         * visible frame always highlights and centers the active lyric line.
         */
        resetDrawerSync() {
            this.activeLineIndex = -1;
            this.lastScrolledIndex = -1;
            this.isUserScrolling = false;
            this._syncRecenterVisibility(false);
        }

        /**
         * Update active states & continuous CSS variable sweep without touching unrelated DOM nodes.
         */
        updateFrame(snapshot, options = {}) {
            if (!this.doc || !snapshot) return;
            const { drawerOpen = false, zenOpen = false } = options;

            const activeIdx = snapshot.activeLineIndex;
            const overlapSet = new Set(snapshot.overlappingLineIndices || []);
            if (activeIdx >= 0) overlapSet.add(activeIdx);

            // 1. Update Zen Mode floating lyric when active
            this._updateZenLyric(snapshot, zenOpen);

            // 2. Skip drawer DOM updates when closed cleanly WITHOUT mutating
            //    this.activeLineIndex, so reopening mid-line still commits highlight & scroll.
            if (!drawerOpen || this.lineRefs.length === 0) {
                return;
            }

            const syncLevel = this.doc.syncLevel;
            if (syncLevel === 'plain' || syncLevel === 'instrumental' || syncLevel === 'unavailable' || syncLevel === 'restricted') {
                return;
            }

            const isWordMode = syncLevel === 'word' || syncLevel === 'syllable';

            for (let i = 0; i < this.lineRefs.length; i++) {
                const ref = this.lineRefs[i];
                const isPrimary = i === activeIdx;
                const isOverlapping = !isPrimary && overlapSet.has(i);
                const dist = activeIdx >= 0 ? Math.abs(i - activeIdx) : 99;
                const isAdjacent = dist === 1;
                const isNear = dist === 1 || dist === 2;

                let state;
                if (isPrimary) state = 'active';
                else if (isOverlapping) state = 'overlapping';
                else if (activeIdx >= 0 && i < activeIdx) state = 'past';
                else state = 'upcoming';

                const distTier = dist <= 2 ? dist : 3;
                const combinedKey = `${state}:${distTier}`;

                if (ref.lastLineState !== combinedKey) {
                    ref.lastLineState = combinedKey;
                    const cl = ref.el.classList;
                    cl.toggle('active', isPrimary);
                    cl.toggle('is-overlapping', isOverlapping);
                    cl.toggle('is-past', state === 'past');
                    cl.toggle('is-upcoming', state === 'upcoming');
                    cl.toggle('is-adjacent', isAdjacent);
                    cl.toggle('is-near', isNear);
                }

                // Update token progress ONLY for active/overlapping lines OR transition out of recently active lines
                if (isWordMode && ref.tokenRefs.length > 0) {
                    const lineProgresses = snapshot.tokenProgressByLine.get(i);
                    for (let k = 0; k < ref.tokenRefs.length; k++) {
                        const tokRef = ref.tokenRefs[k];
                        let p;
                        if (lineProgresses) {
                            p = lineProgresses[tokRef.tokenIndex] || 0;
                        } else if (state === 'past') {
                            p = 1;
                        } else {
                            p = 0;
                        }

                        const bucket = p >= 0.999 ? 'sung' : (p > 0.001 ? 'active' : 'upcoming');
                        const pctStr = `${(p * 100).toFixed(2)}%`;

                        if (tokRef.lastPct !== pctStr) {
                            tokRef.lastPct = pctStr;
                            tokRef.el.style.setProperty('--word-progress', p.toFixed(4));
                            tokRef.el.style.setProperty('--word-pct', pctStr);
                        }
                        if (tokRef.lastBucket !== bucket) {
                            tokRef.lastBucket = bucket;
                            const tcl = tokRef.el.classList;
                            tcl.toggle('is-sung', bucket === 'sung');
                            tcl.toggle('is-active-word', bucket === 'active');
                            tcl.toggle('is-upcoming-word', bucket === 'upcoming');
                        }
                    }
                }
            }

            // Highlight & animate active interlude divider if sitting inside a long break
            this.interludeRefs.forEach((iRef, afterIdx) => {
                const match = snapshot.activeInterlude && snapshot.activeInterlude.afterLineIndex === afterIdx;
                iRef.el.classList.toggle('active', Boolean(match));
                if (match && iRef.barEl) {
                    iRef.barEl.style.width = `${(snapshot.activeInterlude.progress * 100).toFixed(1)}%`;
                }
            });

            // Scroll target ONLY changes when active line actually changes!
            if (activeIdx !== this.activeLineIndex || snapshot.wasSeek || (activeIdx >= 0 && this.lastScrolledIndex !== activeIdx)) {
                this.activeLineIndex = activeIdx;
                if (activeIdx >= 0 && this.viewMode !== 'full' && !this.isUserScrolling && (activeIdx !== this.lastScrolledIndex || snapshot.wasSeek)) {
                    if (this._scrollLineToCenter(activeIdx, Boolean(snapshot.wasSeek))) {
                        this.lastScrolledIndex = activeIdx;
                    }
                } else if (activeIdx < 0 && this.viewMode !== 'full' && !this.isUserScrolling && this.dom.body &&
                           this.doc.lines[0] && Number.isFinite(this.doc.lines[0].startMs) && snapshot.timeMs < this.doc.lines[0].startMs) {
                    this.lastScrolledIndex = -1;
                    try {
                        this.dom.body.scrollTo({ top: 0, behavior: snapshot.wasSeek ? 'auto' : 'smooth' });
                    } catch (_) {
                        this.dom.body.scrollTop = 0;
                    }
                }
                this._syncRecenterVisibility(this.isUserScrolling);
            }
        }

        _updateZenLyric(snapshot, zenOpen) {
            const box = this.dom.zenAmbientBox;
            const jpEl = this.dom.zenJp;
            const romanEl = this.dom.zenRomaji;
            const mainEl = romanEl;
            const viEl = this.dom.zenVi;
            if (!box || !mainEl || !viEl) return;

            const syncLevel = this.doc?.syncLevel || 'unavailable';
            const hasTimedLines = Boolean(this.doc?.lines?.length);
            const showFallback = zenOpen && this.doc &&
                (!hasTimedLines || syncLevel === 'plain' || syncLevel === 'unavailable' || syncLevel === 'restricted' || syncLevel === 'instrumental');

            if (showFallback) {
                this.zenPending = null;
                this._clearZenInstant(box);
                box.classList.remove('is-breathing-out');
                // Never leave Zen as an unexplained empty wallpaper when the
                // current track has no timed lyric lines.
                const title = this.doc.title || this.track?.name || '';
                const note = syncLevel === 'instrumental' ? 'Bản không lời' : syncLevel === 'plain' ? 'Lời chưa có thời gian · xem toàn bài trong Lyrics' : 'Chưa có lời cho bài này';
                if (this.lastZenLineIndex !== -2 || mainEl.textContent !== title || viEl.textContent !== note) {
                    this.lastZenLineIndex = -2;
                    this.zenTokenRefs = [];
                    mainEl.textContent = title;
                    viEl.textContent = note;
                    if (jpEl) jpEl.textContent = '';
                    box.classList.add('is-fallback');
                }
                if (!box.classList.contains('has-lyric')) {
                    box.classList.add('has-lyric');
                    box.setAttribute('aria-hidden', 'false');
                }
                return;
            }

            const zen = snapshot.zen || {
                lineIndex: snapshot.activeLineIndex,
                phase: snapshot.activeLineIndex >= 0 ? 'visible' : 'hidden'
            };
            const idx = zen.lineIndex;
            const reducedMotion = Boolean(global.MinkoiSpring?.isAccessibilityReducedMotion?.());

            if (!zenOpen || !this.doc || idx < 0) {
                this.zenPending = null;
                this.zenRenderedIndex = -1;
                const isBreathingOut = Boolean(zenOpen && this.doc && zen.phase === 'breathing-out');
                const shouldHideInstant = !zenOpen || Boolean(snapshot.wasSeek) || reducedMotion || !isBreathingOut;
                if (this.lastZenLineIndex !== -1 || box.classList.contains('has-lyric')) {
                    const hide = () => {
                        box.classList.toggle('is-breathing-out', isBreathingOut && !shouldHideInstant);
                        box.classList.remove('has-lyric');
                        box.setAttribute('aria-hidden', 'true');
                    };
                    if (shouldHideInstant) {
                        this._commitZenInstant(box, hide);
                    } else {
                        this._clearZenInstant(box);
                        hide();
                    }
                    this.lastZenLineIndex = -1;
                }
                return;
            }

            const line = this.doc.lines[idx];
            if (!line) {
                this._commitZenInstant(box, () => {
                    box.classList.remove('has-lyric', 'is-breathing-out');
                    box.setAttribute('aria-hidden', 'true');
                });
                this.lastZenLineIndex = -1;
                this.zenRenderedIndex = -1;
                return;
            }

            const isWordMode = (this.doc.syncLevel === 'word' || this.doc.syncLevel === 'syllable') && Array.isArray(line.tokens);
            const tokenIsJapanese = ns.Normalizer.containsJapanese(line.tokens?.map(t => t.text).join('') || line.text);
            const tokenEl = tokenIsJapanese && jpEl ? jpEl : romanEl;
            const wasHidden = !box.classList.contains('has-lyric') || this.zenRenderedIndex < 0;

            if (idx !== this.lastZenLineIndex || (snapshot.wasSeek && this.zenPending) || wasHidden) {
                box.classList.remove('is-fallback');
                this.lastZenLineIndex = idx;
                const currentDocument = this.doc;
                const commit = () => {
                    if (this.doc !== currentDocument || this.lastZenLineIndex !== idx) return;
                    this.zenRenderedIndex = idx;
                    this.zenTokenRefs = [];
                    romanEl.textContent = line.romaji || '';
                    if (jpEl) jpEl.textContent = line.jp || '';

                    if (isWordMode) {
                        tokenEl.textContent = '';
                        line.tokens.forEach((tok, tokIdx) => {
                            if (tok.isWhitespace) {
                                tokenEl.appendChild(document.createTextNode(tok.text));
                                return;
                            }
                            const sp = document.createElement('span');
                            sp.className = 'lyric-word zen-word is-upcoming-word';
                            sp.textContent = tok.text;
                            sp.style.setProperty('--word-progress', '0');
                            sp.style.setProperty('--word-pct', '0%');
                            tokenEl.appendChild(sp);
                            this.zenTokenRefs.push({ tokenIndex: tokIdx, el: sp, lastPct: '0%' });
                        });
                    }
                    viEl.textContent = line.translation || '';
                    const values = { jp: line.jp, romaji: line.romaji, vi: line.translation };
                    if (!this.displayLayers.some(layer => values[layer])) {
                        box.classList.add('is-fallback');
                        romanEl.textContent = 'Tầng lời đã chọn chưa có nội dung';
                        viEl.textContent = '';
                    }
                };
                if (this.zenMotion && !reducedMotion && !wasHidden && !snapshot.wasSeek) {
                    // Continuous phrase-to-phrase flow (<1.8s gap): keep MinkoiSpring cross-swap.
                    this.zenPending = commit;
                    this.zenMotion.setTarget(0);
                } else {
                    // Fresh entrance (from intro, long break, seek, or reduced motion):
                    // commit new text before revealing so container CSS fade-in (300ms) stays pure.
                    this.zenPending = null;
                    commit();
                    if (this.zenMotion) {
                        this.zenMotion.snap(1);
                    }
                    const reveal = () => {
                        box.classList.remove('is-breathing-out');
                        box.classList.add('has-lyric');
                        box.setAttribute('aria-hidden', 'false');
                    };
                    if (snapshot.wasSeek || reducedMotion) {
                        this._commitZenInstant(box, reveal);
                    } else {
                        this._clearZenInstant(box);
                        reveal();
                    }
                }
            }

            if (isWordMode && this.zenRenderedIndex === idx && this.zenTokenRefs.length > 0) {
                const progresses = snapshot.tokenProgressByLine.get(idx);
                for (let k = 0; k < this.zenTokenRefs.length; k++) {
                    const zRef = this.zenTokenRefs[k];
                    const p = progresses ? (progresses[zRef.tokenIndex] || 0) : 0;
                    const pctStr = `${(p * 100).toFixed(2)}%`;
                    if (zRef.lastPct !== pctStr) {
                        zRef.lastPct = pctStr;
                        zRef.el.style.setProperty('--word-progress', p.toFixed(4));
                        zRef.el.style.setProperty('--word-pct', pctStr);
                        zRef.el.classList.toggle('is-active-word', p > 0.001 && p < 0.999);
                        zRef.el.classList.toggle('is-sung', p >= 0.999);
                    }
                }
            }

            if (!box.classList.contains('has-lyric')) {
                box.classList.remove('is-breathing-out');
                box.classList.add('has-lyric');
                box.setAttribute('aria-hidden', 'false');
            }
        }
    }

    ns.Renderer = LyricsRenderer;
})(typeof window !== 'undefined' ? window : globalThis);
