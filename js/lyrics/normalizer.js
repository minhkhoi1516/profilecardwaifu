/* ========================================================
   MINKOI LYRICS ENGINE V2 · NORMALIZER
   Timecode parsing, monotonic millisecond normalization,
   Apple Music Sing progress math, and Japanese Unicode safety
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    const JAPANESE_CHAR_RE = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005\u3006\uFF66-\uFF9F]/;

    /**
     * Clamp word/syllable sweep progress in [0, 1].
     * progress = clamp((currentTimeMs - startMs) / (endMs - startMs), 0, 1)
     */
    function clampProgress(currentTimeMs, startMs, endMs) {
        if (!Number.isFinite(currentTimeMs) || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
            return 0;
        }
        if (endMs <= startMs) {
            return currentTimeMs >= startMs ? 1 : 0;
        }
        const raw = (currentTimeMs - startMs) / (endMs - startMs);
        if (raw <= 0) return 0;
        if (raw >= 1) return 1;
        return raw;
    }

    /**
     * Parse numeric seconds/ms or string timecodes (TTML/LRC/ELRC) into integer milliseconds.
     * Examples: "12.5s" -> 12500, "1250ms" -> 1250, "01:23.45" -> 83450, "00:01:23.450" -> 83450
     */
    function parseTimecodeToMs(value) {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
        }
        if (typeof value !== 'string') return null;

        const trimmed = value.trim();
        if (!trimmed) return null;

        // Milliseconds suffix: e.g. "1250ms"
        if (/^\d+(?:\.\d+)?ms$/i.test(trimmed)) {
            return Math.max(0, Math.round(parseFloat(trimmed)));
        }

        // Seconds suffix: e.g. "12.345s"
        if (/^\d+(?:\.\d+)?s$/i.test(trimmed)) {
            return Math.max(0, Math.round(parseFloat(trimmed) * 1000));
        }

        // Clock notation: [HH:]MM:SS[.fff] or [HH:]MM:SS[:ff]
        const clockMatch = trimmed.match(/^(?:(\d{1,3}):)?(\d{1,3}):(\d{1,2})(?:[.:](\d{1,4}))?$/);
        if (clockMatch) {
            const hasHours = clockMatch[1] !== undefined;
            const hours = hasHours ? parseInt(clockMatch[1], 10) : 0;
            const mins = parseInt(clockMatch[2], 10);
            const secs = parseInt(clockMatch[3], 10);
            let subMs = 0;
            if (clockMatch[4] !== undefined) {
                const frac = clockMatch[4];
                if (frac.length <= 3) {
                    subMs = Math.round(parseFloat('0.' + frac) * 1000);
                } else {
                    subMs = Math.round(parseFloat('0.' + frac.slice(0, 3)) * 1000);
                }
            }
            return Math.max(0, ((hours * 3600) + (mins * 60) + secs) * 1000 + subMs);
        }

        // Plain numeric string interpreted as seconds (common in some clock attributes)
        if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
            return Math.max(0, Math.round(parseFloat(trimmed) * 1000));
        }

        return null;
    }

    function containsJapanese(text) {
        return typeof text === 'string' && JAPANESE_CHAR_RE.test(text);
    }

    /**
     * Split string into visual graphemes without corrupting surrogate pairs,
     * dakuten/handakuten combinations, or Japanese punctuation. Never inserts spaces.
     */
    function splitGraphemes(text) {
        if (!text || typeof text !== 'string') return [];
        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
            try {
                const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
                const out = [];
                for (const seg of segmenter.segment(text)) {
                    out.push(seg.segment);
                }
                return out;
            } catch (_) {}
        }
        return Array.from(text);
    }

    function normalizeToken(rawToken, lineStartMs) {
        const text = rawToken && typeof rawToken.text === 'string' ? rawToken.text : '';
        let startMs = Number.isFinite(rawToken?.startMs) ? Math.round(rawToken.startMs) : parseTimecodeToMs(rawToken?.begin);
        let endMs = Number.isFinite(rawToken?.endMs) ? Math.round(rawToken.endMs) : parseTimecodeToMs(rawToken?.end);

        if (startMs === null && Number.isFinite(rawToken?.time)) {
            startMs = Math.round(rawToken.time * 1000);
        }
        if (startMs !== null && lineStartMs !== null) {
            startMs = Math.max(0, startMs);
        }
        if (endMs !== null && startMs !== null && endMs < startMs) {
            endMs = startMs;
        }

        return {
            text,
            startMs,
            endMs,
            hasExplicitTiming: Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs,
            isWhitespace: /^\s+$/.test(text),
            isBackground: Boolean(rawToken?.isBackground),
            speaker: rawToken?.speaker || null,
            ruby: rawToken?.ruby || null,
            isSustained: Boolean(rawToken?.isSustained || (Number.isFinite(startMs) && Number.isFinite(endMs) && (endMs - startMs) >= 1200))
        };
    }

    function computeLineDisplayText(line) {
        if (typeof line.text === 'string' && line.text.length > 0) return line.text;
        if (typeof line.romaji === 'string' && line.romaji.length > 0) return line.romaji;
        if (Array.isArray(line.tokens) && line.tokens.length > 0) {
            return line.tokens.map(t => t.text).join('');
        }
        return '';
    }

    function hasValidTimedTokens(tokens) {
        if (!Array.isArray(tokens) || tokens.length === 0) return false;
        return tokens.some(t => !t.isWhitespace && Number.isFinite(t.startMs) && Number.isFinite(t.endMs));
    }

    /**
     * Normalize any parsed/curated lyrics structure into canonical Millisecond Document.
     * Invariant: NEVER synthesizes fake word/syllable timings for line-synced or plain tracks.
     */
    function normalizeDocument(rawDoc, trackMeta) {
        const doc = rawDoc || {};
        const isInstrumental = Boolean(doc.isInstrumental);
        const isRestricted = doc.syncLevel === 'restricted' || Boolean(doc.restrictedReason);
        const offsetMs = Number.isFinite(doc.offsetMs) ? Math.round(doc.offsetMs) : 0;

        const rawLines = Array.isArray(doc.lines) ? doc.lines : [];
        const preparedLines = rawLines.map((raw, idx) => {
            let startMs = null;
            if (Number.isFinite(raw.startMs)) {
                startMs = Math.max(0, Math.round(raw.startMs));
            } else if (Number.isFinite(raw.time)) {
                startMs = Math.max(0, Math.round(raw.time * 1000));
            } else {
                startMs = parseTimecodeToMs(raw.begin);
            }

            let endMs = null;
            if (Number.isFinite(raw.endMs)) {
                endMs = Math.max(0, Math.round(raw.endMs));
            } else if (Number.isFinite(raw.endTime)) {
                endMs = Math.max(0, Math.round(raw.endTime * 1000));
            } else {
                endMs = parseTimecodeToMs(raw.end);
            }

            let tokens = null;
            if (Array.isArray(raw.tokens) && raw.tokens.length > 0) {
                tokens = raw.tokens.map(t => normalizeToken(t, startMs));
                // Fill token endMs strictly from explicit next token timestamp or explicit line endMs
                for (let i = 0; i < tokens.length; i++) {
                    const tok = tokens[i];
                    if (tok.isWhitespace) continue;
                    if (tok.startMs === null) continue;
                    if (tok.endMs === null) {
                        // Look forward for next timed non-whitespace token inside the same line
                        let nextStart = null;
                        for (let j = i + 1; j < tokens.length; j++) {
                            if (Number.isFinite(tokens[j].startMs)) {
                                nextStart = tokens[j].startMs;
                                break;
                            }
                        }
                        if (nextStart !== null && nextStart >= tok.startMs) {
                            tok.endMs = nextStart;
                        } else if (endMs !== null && endMs >= tok.startMs) {
                            tok.endMs = endMs;
                        }
                    }
                    tok.hasExplicitTiming = Number.isFinite(tok.startMs) && Number.isFinite(tok.endMs) && tok.endMs > tok.startMs;
                    tok.isSustained = tok.hasExplicitTiming && (tok.endMs - tok.startMs >= 1200);
                }

                // If line lacked startMs/endMs, infer purely from its timed tokens
                const timedToks = tokens.filter(t => Number.isFinite(t.startMs));
                if (startMs === null && timedToks.length > 0) {
                    startMs = timedToks[0].startMs;
                }
                const lastEndTok = [...tokens].reverse().find(t => Number.isFinite(t.endMs));
                if (endMs === null && lastEndTok) {
                    endMs = lastEndTok.endMs;
                }
            }

            const text = computeLineDisplayText({ ...raw, tokens });
            const translation = typeof raw.vi === 'string' ? raw.vi : (typeof raw.translation === 'string' ? raw.translation : '');

            return {
                index: idx,
                startMs,
                endMs,
                text,
                romaji: typeof raw.romaji === 'string' ? raw.romaji : text,
                translation,
                speaker: raw.speaker || null,
                isBackground: Boolean(raw.isBackground),
                isJapanese: containsJapanese(text),
                tokens: hasValidTimedTokens(tokens) ? tokens : null
            };
        });

        // Sort timed lines monotonically while preserving plain line order
        const allTimed = preparedLines.length > 0 && preparedLines.every(l => Number.isFinite(l.startMs));
        if (allTimed) {
            preparedLines.sort((a, b) => {
                if (a.startMs !== b.startMs) return a.startMs - b.startMs;
                // Keep lead vocal before overlapping background vocal at identical instant
                return (a.isBackground ? 1 : 0) - (b.isBackground ? 1 : 0);
            });
            for (let i = 0; i < preparedLines.length; i++) {
                preparedLines[i].index = i;
                const cur = preparedLines[i];
                if (cur.endMs === null) {
                    // Find next non-background line start as boundary when no explicit endMs was given
                    let nextStart = null;
                    for (let j = i + 1; j < preparedLines.length; j++) {
                        if (preparedLines[j].startMs > cur.startMs) {
                            nextStart = preparedLines[j].startMs;
                            break;
                        }
                    }
                    if (nextStart !== null) {
                        cur.endMs = nextStart;
                    } else if (Number.isFinite(trackMeta?.durationMs) && trackMeta.durationMs > cur.startMs) {
                        cur.endMs = trackMeta.durationMs;
                    } else {
                        cur.endMs = cur.startMs + 4000;
                    }
                }
                // Fill last token's missing endMs strictly using next line timestamp ONLY if it came from ELRC without closing tag
                if (cur.tokens) {
                    for (let k = 0; k < cur.tokens.length; k++) {
                        const tok = cur.tokens[k];
                        if (!tok.isWhitespace && Number.isFinite(tok.startMs) && !Number.isFinite(tok.endMs) && Number.isFinite(cur.endMs)) {
                            tok.endMs = Math.max(tok.startMs, cur.endMs);
                            tok.hasExplicitTiming = tok.endMs > tok.startMs;
                            tok.isSustained = tok.hasExplicitTiming && (tok.endMs - tok.startMs >= 1200);
                        }
                    }
                }
            }
        }

        // Determine truthful sync level
        let syncLevel = doc.syncLevel || 'unavailable';
        if (isRestricted) {
            syncLevel = 'restricted';
        } else if (isInstrumental) {
            syncLevel = 'instrumental';
        } else if (preparedLines.length === 0) {
            syncLevel = 'unavailable';
        } else if (preparedLines.some(l => Array.isArray(l.tokens) && l.tokens.length > 0)) {
            syncLevel = doc.syncLevel === 'syllable' ? 'syllable' : 'word';
        } else if (allTimed) {
            syncLevel = 'line';
        } else {
            syncLevel = 'plain';
        }

        return {
            schemaVersion: 2,
            trackId: doc.trackId ?? trackMeta?.id ?? null,
            spotifyTrackId: doc.spotifyTrackId || trackMeta?.spotifyTrackId || null,
            title: doc.title || trackMeta?.name || '',
            artist: doc.artist || trackMeta?.artist || '',
            album: doc.album || trackMeta?.album || '',
            version: doc.version || trackMeta?.version || 'original',
            durationMs: doc.durationMs || trackMeta?.durationMs || null,
            source: doc.source || 'unknown',
            format: doc.format || 'structured',
            confidence: doc.confidence || (syncLevel === 'unavailable' ? 'none' : 'verified'),
            syncLevel,
            offsetMs,
            isInstrumental,
            restrictedReason: doc.restrictedReason || null,
            lines: preparedLines
        };
    }

    ns.Normalizer = {
        clampProgress,
        parseTimecodeToMs,
        containsJapanese,
        splitGraphemes,
        normalizeDocument,
        JAPANESE_CHAR_RE
    };
})(typeof window !== 'undefined' ? window : globalThis);
