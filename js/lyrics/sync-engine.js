/* ========================================================
   MINKOI LYRICS ENGINE V2 · SYNC ENGINE
   Single source-of-truth audio clock, binary search lookup,
   bounded intra-frame interpolation (zero drift from <audio>),
   per-track offset, RAF lifecycle & playbackRate/seek/tab safety.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    /**
     * Binary search for active lyric line index at timeMs in O(log n).
     * Lines must be sorted monotonically by startMs.
     * Prefers primary vocal line or latest line whose startMs <= timeMs.
     */
    function findActiveLineIndex(lines, timeMs) {
        if (!Array.isArray(lines) || lines.length === 0 || !Number.isFinite(timeMs)) return -1;
        if (!Number.isFinite(lines[0].startMs) || timeMs < lines[0].startMs) return -1;

        let lo = 0;
        let hi = lines.length - 1;
        let ans = -1;

        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const lineStart = lines[mid].startMs;
            if (!Number.isFinite(lineStart)) return -1;
            if (lineStart <= timeMs) {
                ans = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }

        // If cursor is strictly past an explicit endMs of ans (long instrumental break), report -1 only when past threshold gap
        if (ans >= 0) {
            const active = lines[ans];
            const next = lines[ans + 1];
            const gapEnd = Number.isFinite(active.endMs) ? active.endMs : null;
            if (gapEnd !== null && timeMs > gapEnd + 500 && (!next || (Number.isFinite(next.startMs) && next.startMs > timeMs))) {
                return -1;
            }
        }
        return ans;
    }

    /**
     * Binary search for active timed token inside a line's token array.
     */
    function findActiveTokenIndex(tokens, timeMs) {
        if (!Array.isArray(tokens) || tokens.length === 0 || !Number.isFinite(timeMs)) return -1;
        const timedIndices = [];
        for (let i = 0; i < tokens.length; i++) {
            if (!tokens[i].isWhitespace && Number.isFinite(tokens[i].startMs)) {
                timedIndices.push(i);
            }
        }
        if (timedIndices.length === 0) return -1;
        if (timeMs < tokens[timedIndices[0]].startMs) return -1;

        let lo = 0;
        let hi = timedIndices.length - 1;
        let bestPos = -1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const tokIdx = timedIndices[mid];
            if (tokens[tokIdx].startMs <= timeMs) {
                bestPos = tokIdx;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return bestPos;
    }

    const ZEN_BREATHE_MIN_GAP_MS = 1800;
    const ZEN_TAIL_HOLD_MS = 350;

    /**
     * Pure deterministic Zen Lyric Breathing calculation (Zen Mode only).
     * Never guesses an end timestamp when explicit timing data is unavailable,
     * never hides while the singer is holding a note or during gaps < 1.8s,
     * and holds the phrase tail ~350ms before breathing out on gaps >= 1.8s.
     */
    function computeZenBreathing(doc, currentTimeMs) {
        const lines = doc?.lines;
        if (!Array.isArray(lines) || lines.length === 0 || !Number.isFinite(currentTimeMs)) {
            return { lineIndex: -1, phase: 'hidden', gapMs: 0 };
        }
        if (!Number.isFinite(lines[0].startMs) || currentTimeMs < lines[0].startMs) {
            return { lineIndex: -1, phase: 'hidden', gapMs: 0 };
        }

        let lo = 0;
        let hi = lines.length - 1;
        let ans = -1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const lineStart = lines[mid].startMs;
            if (!Number.isFinite(lineStart)) return { lineIndex: -1, phase: 'hidden', gapMs: 0 };
            if (lineStart <= currentTimeMs) {
                ans = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        if (ans < 0) return { lineIndex: -1, phase: 'hidden', gapMs: 0 };

        const active = lines[ans];
        const reliableEnd = Number.isFinite(active.endMs) &&
            Number.isFinite(active.startMs) &&
            active.endMs > active.startMs &&
            active.hasExplicitEnd !== false &&
            active.endTimingSource !== 'estimated' &&
            active.endTimingSource !== 'next-line-boundary';

        // Still actively singing this phrase (including sustained notes) or lacking reliable endMs.
        if (!reliableEnd || currentTimeMs <= active.endMs) {
            return { lineIndex: ans, phase: 'visible', gapMs: 0 };
        }

        // Never breathe out while an overlapping vocal line is still singing.
        const winStart = Math.max(0, ans - 4);
        const winEnd = Math.min(lines.length - 1, ans + 2);
        for (let i = winStart; i <= winEnd; i++) {
            if (i === ans) continue;
            const other = lines[i];
            if (Number.isFinite(other.startMs) && Number.isFinite(other.endMs) &&
                other.hasExplicitEnd !== false && other.endTimingSource !== 'estimated' &&
                currentTimeMs >= other.startMs && currentTimeMs <= other.endMs) {
                return { lineIndex: ans, phase: 'visible', gapMs: 0 };
            }
        }

        const next = lines[ans + 1];
        let gapMs = 0;
        if (next) {
            if (!Number.isFinite(next.startMs)) {
                return { lineIndex: ans, phase: 'visible', gapMs: 0 };
            }
            gapMs = next.startMs - active.endMs;
        } else if (Number.isFinite(doc.durationMs) && doc.durationMs > active.endMs) {
            gapMs = doc.durationMs - active.endMs;
        } else {
            gapMs = Infinity;
        }

        if (gapMs < ZEN_BREATHE_MIN_GAP_MS) {
            return { lineIndex: ans, phase: 'visible', gapMs };
        }

        const pastEndMs = currentTimeMs - active.endMs;
        if (pastEndMs < ZEN_TAIL_HOLD_MS) {
            return { lineIndex: ans, phase: 'tail-hold', gapMs };
        }

        return { lineIndex: -1, phase: 'breathing-out', gapMs, afterLineIndex: ans };
    }

    /**
     * Pure deterministic state calculation for any timestamp (used both at runtime and in unit tests).
     */
    function computeSnapshot(doc, currentTimeMs) {
        const Normalizer = ns.Normalizer;
        if (!doc || !Array.isArray(doc.lines) || doc.lines.length === 0) {
            return {
                timeMs: currentTimeMs,
                activeLineIndex: -1,
                overlappingLineIndices: [],
                lineProgress: 0,
                activeTokenIndex: -1,
                tokenProgressByLine: new Map(),
                activeInterlude: null,
                zen: { lineIndex: -1, phase: 'hidden', gapMs: 0 }
            };
        }

        const lines = doc.lines;
        const activeLineIndex = findActiveLineIndex(lines, currentTimeMs);

        // Find simultaneous/overlapping lines (duet or background harmony active right now)
        const overlappingLineIndices = [];
        if (lines[0] && Number.isFinite(lines[0].startMs)) {
            const windowStart = Math.max(0, activeLineIndex - 4);
            const windowEnd = Math.min(lines.length - 1, Math.max(0, activeLineIndex) + 2);
            for (let i = windowStart; i <= windowEnd; i++) {
                const l = lines[i];
                if (Number.isFinite(l.startMs) && Number.isFinite(l.endMs) && currentTimeMs >= l.startMs && currentTimeMs <= l.endMs) {
                    overlappingLineIndices.push(i);
                }
            }
        }

        const tokenProgressByLine = new Map();
        const isWordLevel = doc.syncLevel === 'word' || doc.syncLevel === 'syllable';

        let lineProgress = 0;
        let activeTokenIndex = -1;

        if (activeLineIndex >= 0 && lines[activeLineIndex]) {
            const active = lines[activeLineIndex];
            lineProgress = Normalizer.clampProgress(currentTimeMs, active.startMs, active.endMs);
            if (isWordLevel && active.tokens) {
                activeTokenIndex = findActiveTokenIndex(active.tokens, currentTimeMs);
            }
        }

        if (isWordLevel) {
            // Compute progress for active line and nearby overlapping lines
            const targetIndices = new Set(overlappingLineIndices);
            if (activeLineIndex >= 0) targetIndices.add(activeLineIndex);
            targetIndices.forEach(idx => {
                const line = lines[idx];
                if (!line || !line.tokens) return;
                const progresses = new Float32Array(line.tokens.length);
                for (let t = 0; t < line.tokens.length; t++) {
                    const tok = line.tokens[t];
                    if (tok.isWhitespace || !Number.isFinite(tok.startMs) || !Number.isFinite(tok.endMs)) {
                        progresses[t] = 0;
                    } else {
                        progresses[t] = Normalizer.clampProgress(currentTimeMs, tok.startMs, tok.endMs);
                    }
                }
                tokenProgressByLine.set(idx, progresses);
            });
        }

        // Check if currently sitting in a long instrumental interlude
        let activeInterlude = null;
        if (activeLineIndex === -1 && lines[0] && Number.isFinite(lines[0].startMs)) {
            for (let i = 0; i < lines.length - 1; i++) {
                const cur = lines[i];
                const nxt = lines[i + 1];
                const gapStart = Number.isFinite(cur.endMs) ? cur.endMs : cur.startMs;
                if (nxt && Number.isFinite(nxt.startMs) && (nxt.startMs - gapStart) >= 6000 && currentTimeMs > gapStart && currentTimeMs < nxt.startMs) {
                    activeInterlude = {
                        afterLineIndex: i,
                        startMs: gapStart,
                        endMs: nxt.startMs,
                        progress: Normalizer.clampProgress(currentTimeMs, gapStart, nxt.startMs)
                    };
                    break;
                }
            }
        }

        return {
            timeMs: currentTimeMs,
            activeLineIndex,
            overlappingLineIndices,
            lineProgress,
            activeTokenIndex,
            tokenProgressByLine,
            activeInterlude,
            zen: computeZenBreathing(doc, currentTimeMs)
        };
    }

    /**
     * Live SyncEngine controller bound to an HTMLAudioElement (or compatible mock clock).
     */
    class SyncEngine {
        constructor(audioElement, options = {}) {
            this.audio = audioElement;
            this.onFrame = options.onFrame || (() => {});
            this.shouldAnimate = options.shouldAnimate || (() => true);

            this.document = null;
            this.userOffsetSec = 0;
            this.rafId = null;
            this.destroyed = false;
            this.lastRate = (audioElement && Number.isFinite(audioElement.playbackRate)) ? audioElement.playbackRate : 1.0;

            // Bounded sub-frame interpolation state (STRICTLY anchored to audio.currentTime)
            this.lastAudioTimeSec = 0;
            this.lastSamplePerfMs = 0;
            this.forceHardSnap = true;
            this.isBuffering = false;

            this._boundTick = this._tick.bind(this);
            this._boundHardSync = this.forceSync.bind(this);
            this._boundPlay = this._onPlay.bind(this);
            this._boundPlaying = this._onPlaying.bind(this);
            this._boundWaiting = this._onWaiting.bind(this);
            this._boundPause = this._onPause.bind(this);
            this._boundSeeked = this._onSeeked.bind(this);
            this._boundTimeUpdate = this._onTimeUpdate.bind(this);
            this._boundRateChange = this._onRateChange.bind(this);
            this._boundVisibility = this._onVisibilityChange.bind(this);
            this._boundPageHide = this._onPageHide.bind(this);
            this._boundPageShow = this._onPageShow.bind(this);

            this._attachListeners();
        }

        _attachListeners() {
            if (!this.audio) return;
            this.audio.addEventListener('play', this._boundPlay);
            this.audio.addEventListener('playing', this._boundPlaying);
            this.audio.addEventListener('canplay', this._boundPlaying);
            this.audio.addEventListener('loadedmetadata', this._boundSeeked);
            this.audio.addEventListener('waiting', this._boundWaiting);
            this.audio.addEventListener('stalled', this._boundWaiting);
            this.audio.addEventListener('pause', this._boundPause);
            this.audio.addEventListener('ended', this._boundPause);
            this.audio.addEventListener('seeked', this._boundSeeked);
            this.audio.addEventListener('timeupdate', this._boundTimeUpdate);
            this.audio.addEventListener('ratechange', this._boundRateChange);
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', this._boundVisibility);
            }
            if (typeof global.addEventListener === 'function') {
                global.addEventListener('pagehide', this._boundPageHide);
                global.addEventListener('pageshow', this._boundPageShow);
            }
        }

        destroy() {
            this.destroyed = true;
            this.stopLoop();
            if (this.audio) {
                this.audio.removeEventListener('play', this._boundPlay);
                this.audio.removeEventListener('playing', this._boundPlaying);
                this.audio.removeEventListener('canplay', this._boundPlaying);
                this.audio.removeEventListener('loadedmetadata', this._boundSeeked);
                this.audio.removeEventListener('waiting', this._boundWaiting);
                this.audio.removeEventListener('stalled', this._boundWaiting);
                this.audio.removeEventListener('pause', this._boundPause);
                this.audio.removeEventListener('ended', this._boundPause);
                this.audio.removeEventListener('seeked', this._boundSeeked);
                this.audio.removeEventListener('timeupdate', this._boundTimeUpdate);
                this.audio.removeEventListener('ratechange', this._boundRateChange);
            }
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', this._boundVisibility);
            }
            if (typeof global.removeEventListener === 'function') {
                global.removeEventListener('pagehide', this._boundPageHide);
                global.removeEventListener('pageshow', this._boundPageShow);
            }
        }

        setDocument(doc) {
            this.document = doc;
            this.resetAnchor();
            this.emitSnapshot(true);
        }

        setUserOffsetSec(sec) {
            this.userOffsetSec = Number.isFinite(sec) ? sec : 0;
            this.emitSnapshot(true);
        }

        resetAnchor() {
            this.lastAudioTimeSec = this.audio ? (this.audio.currentTime || 0) : 0;
            this.lastSamplePerfMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
            this.forceHardSnap = true;
        }

        getEffectiveTimeMs() {
            if (!this.audio) return 0;
            const rawAudioSec = this.audio.currentTime || 0;
            const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const docOffsetMs = this.document && Number.isFinite(this.document.offsetMs) ? this.document.offsetMs : 0;
            const totalOffsetMs = Math.round(this.userOffsetSec * 1000) + docOffsetMs;

            // Whenever paused, seeking, buffering, or when audio.currentTime changed, hard-anchor directly to audio.currentTime
            const audioDelta = Math.abs(rawAudioSec - this.lastAudioTimeSec);
            const notReady = Number.isFinite(this.audio.readyState) && this.audio.readyState < 3;
            if (this.forceHardSnap || this.audio.paused || this.audio.seeking || this.isBuffering || notReady || audioDelta > 0.001) {
                this.lastAudioTimeSec = rawAudioSec;
                this.lastSamplePerfMs = nowPerf;
                this.forceHardSnap = false;
                return Math.max(0, (rawAudioSec * 1000) + totalOffsetMs);
            }

            // Bounded intra-frame interpolation strictly capped at 140ms so audio clock stays master
            const elapsedSec = Math.max(0, (nowPerf - this.lastSamplePerfMs) / 1000);
            const rate = Number.isFinite(this.audio.playbackRate) ? this.audio.playbackRate : 1.0;
            const maxAdvanceMs = Math.min(140, elapsedSec * rate * 1000);
            return Math.max(0, (rawAudioSec * 1000) + maxAdvanceMs + totalOffsetMs);
        }

        emitSnapshot(wasSeek = false) {
            if (this.destroyed) return;
            const timeMs = this.getEffectiveTimeMs();
            const snapshot = computeSnapshot(this.document, timeMs);
            snapshot.wasSeek = wasSeek;
            snapshot.isPaused = this.audio ? Boolean(this.audio.paused) : true;
            this.onFrame(snapshot);
        }

        forceSync(wasSeek = true) {
            this.forceHardSnap = true;
            this.emitSnapshot(wasSeek);
        }

        _onPlay() {
            this.forceHardSnap = true;
            this.emitSnapshot(false);
            this.startLoop();
        }

        _onPlaying() {
            this.isBuffering = false;
            this.forceHardSnap = true;
            this.emitSnapshot(false);
            if (this.audio && !this.audio.paused) {
                this.startLoop();
            }
        }

        _onWaiting() {
            this.isBuffering = true;
            this.forceHardSnap = true;
            this.emitSnapshot(false);
        }

        _onPause() {
            this.isBuffering = false;
            this.stopLoop();
            this.forceHardSnap = true;
            this.emitSnapshot(false);
        }

        _onSeeked() {
            this.isBuffering = false;
            this.forceHardSnap = true;
            this.emitSnapshot(true);
            if (this.audio && !this.audio.paused) {
                this.startLoop();
            }
        }

        _onPageHide() {
            this.stopLoop();
        }

        _onPageShow() {
            this.isBuffering = false;
            this.forceHardSnap = true;
            this.emitSnapshot(true);
            if (this.audio && !this.audio.paused) {
                this.startLoop();
            }
        }

        _onTimeUpdate() {
            // Re-anchor smoothly during native playback ticks and update even if RAF paused
            if (this.audio && Math.abs((this.audio.currentTime || 0) - this.lastAudioTimeSec) > 0.25) {
                this.forceHardSnap = true;
                this.emitSnapshot(false);
            } else if (!this.rafId) {
                this.emitSnapshot(false);
            }
            if (!this.rafId && this.audio && !this.audio.paused && this.shouldAnimate()) {
                this.startLoop();
            }
        }

        _onRateChange() {
            this.lastRate = (this.audio && Number.isFinite(this.audio.playbackRate)) ? this.audio.playbackRate : 1.0;
            this.forceHardSnap = true;
            this.emitSnapshot(false);
        }

        _onVisibilityChange() {
            if (typeof document !== 'undefined' && document.hidden) {
                this.stopLoop();
            } else {
                this.forceHardSnap = true;
                this.emitSnapshot(true);
                if (this.audio && !this.audio.paused) {
                    this.startLoop();
                }
            }
        }

        _tick() {
            if (this.destroyed || !this.audio || this.audio.paused || (typeof document !== 'undefined' && document.hidden) || !this.shouldAnimate()) {
                this.rafId = null;
                return;
            }
            this.emitSnapshot(false);
            this.rafId = global.requestAnimationFrame(this._boundTick);
        }

        startLoop() {
            if (this.destroyed || this.rafId !== null) return;
            if (!this.audio || this.audio.paused) return;
            if (typeof document !== 'undefined' && document.hidden) return;
            if (!this.shouldAnimate()) return;
            this.rafId = global.requestAnimationFrame(this._boundTick);
        }

        stopLoop() {
            if (this.rafId !== null && typeof global.cancelAnimationFrame === 'function') {
                global.cancelAnimationFrame(this.rafId);
            }
            this.rafId = null;
        }
    }

    ns.SyncEngine = SyncEngine;
    ns.SyncMath = {
        findActiveLineIndex,
        findActiveTokenIndex,
        computeZenBreathing,
        computeSnapshot,
        ZEN_BREATHE_MIN_GAP_MS,
        ZEN_TAIL_HOLD_MS,
        computeTokenProgress: (tok, timeMs) => tok ? ns.Normalizer.clampProgress(timeMs, tok.startMs, tok.endMs) : 0
    };
})(typeof window !== 'undefined' ? window : globalThis);
