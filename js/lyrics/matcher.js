/* ========================================================
   MINKOI LYRICS ENGINE V2 · MATCHER
   Accurate track-to-lyrics matching by ID, Spotify Track ID,
   ISRC, title, artist, album, duration, and version tag.
   Prevents assigning live/remix/inst/wrong-version lyrics.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    const DURATION_TOLERANCE_MS = 8500;

    function detectVersion(titleOrMeta) {
        if (!titleOrMeta) return 'original';
        if (typeof titleOrMeta === 'object') {
            if (titleOrMeta.isInstrumental) return 'instrumental';
            if (titleOrMeta.version) return String(titleOrMeta.version).toLowerCase();
            titleOrMeta = `${titleOrMeta.name || titleOrMeta.title || ''} ${titleOrMeta.file || ''}`;
        }
        const s = String(titleOrMeta).toLowerCase();
        if (/\b(?:inst|instrumental|off[\s_-]*vocal|karaoke)\b|\(inst\.\)/i.test(s)) return 'instrumental';
        if (/\b(?:live|concert|tour)\b/i.test(s)) return 'live';
        if (/\b(?:acoustic|unplugged|piano\s*ver)\b/i.test(s)) return 'acoustic';
        if (/\b(?:remix|mix|nightcore|slowed|reverb|sped\s*up)\b/i.test(s)) return 'remix';
        if (/\b(?:tv[\s_-]*size|short[\s_-]*ver)\b/i.test(s)) return 'tv-size';
        return 'original';
    }

    function cleanCompareString(str) {
        if (!str || typeof str !== 'string') return '';
        let out = str.normalize ? str.normalize('NFKC') : str;
        out = out.toLowerCase();
        // Normalize fullwidth brackets/punctuation
        out = out.replace(/[～〜~\-・·.,!?'"()\[\]{}（）【】「」『』]/g, ' ');
        out = out.replace(/\s+/g, ' ').trim();
        return out;
    }

    function stripParenthetical(str) {
        return cleanCompareString(String(str || '').replace(/\([^)]*\)|（[^）]*）|\[[^\]]*\]/g, ' '));
    }

    function tokenOverlapSimilarity(a, b) {
        const ca = cleanCompareString(a);
        const cb = cleanCompareString(b);
        if (!ca || !cb) return 0;
        if (ca === cb) return 1.0;
        if (ca.includes(cb) || cb.includes(ca)) return 0.85;

        const sa = stripParenthetical(a);
        const sb = stripParenthetical(b);
        if (sa && sb && (sa === sb || sa.includes(sb) || sb.includes(sa))) return 0.78;

        const setA = new Set(ca.split(' ').filter(Boolean));
        const setB = new Set(cb.split(' ').filter(Boolean));
        if (setA.size === 0 || setB.size === 0) return 0;
        let hit = 0;
        setA.forEach(w => { if (setB.has(w)) hit++; });
        return hit / Math.max(setA.size, setB.size);
    }

    function isVersionCompatible(trackVer, candVer) {
        if (trackVer === candVer) return true;
        // 'original' and 'cover' can use vocal original/cover only when candidate isn't live/acoustic/remix/inst/tv-size;
        // NOTE: character covers (e.g. Alya vs Mahiru covering Chiisana Koi no Uta) have different tracks/artists/durations!
        const special = new Set(['instrumental', 'live', 'acoustic', 'remix', 'tv-size']);
        if (special.has(trackVer) || special.has(candVer)) {
            return trackVer === candVer;
        }
        return true;
    }

    /**
     * Evaluate whether candidate lyrics document genuinely belongs to track.
     */
    function matchTrack(track, candidate) {
        if (!track || !candidate) {
            return { matched: false, score: 0, confidence: 'none', reason: 'missing-input', warnings: [] };
        }

        const warnings = [];
        const trackVer = detectVersion(track);
        const candVer = detectVersion(candidate);

        // Hard guard 1: Version mismatch (e.g. Live vs Original, Inst vs Vocal, Remix vs Studio)
        if (!isVersionCompatible(trackVer, candVer)) {
            return {
                matched: false,
                score: 0,
                confidence: 'rejected',
                reason: `version-mismatch:${trackVer}!=${candVer}`,
                warnings: [`Version không khớp (${trackVer} vs ${candVer})`]
            };
        }

        // Hard guard 2: Duration divergence check (prevents TV-size / Live timing mismatch)
        const trackDur = Number(track.durationMs);
        const candDur = Number(candidate.durationMs);
        if (Number.isFinite(trackDur) && Number.isFinite(candDur) && trackDur > 0 && candDur > 0) {
            const diff = Math.abs(trackDur - candDur);
            if (diff > DURATION_TOLERANCE_MS) {
                return {
                    matched: false,
                    score: 0,
                    confidence: 'rejected',
                    reason: `duration-mismatch:${Math.round(diff)}ms`,
                    warnings: [`Thời lượng lệch ${(diff / 1000).toFixed(1)}s vượt ngưỡng an toàn`]
                };
            }
        }

        const trackTitle = track.name || track.title || '';
        const candTitle = candidate.title || candidate.name || '';
        const titleSim = tokenOverlapSimilarity(trackTitle, candTitle);
        const artistSim = tokenOverlapSimilarity(track.artist || '', candidate.artist || '');
        const albumSim = (track.album && candidate.album) ? tokenOverlapSimilarity(track.album, candidate.album) : 0;

        // Strong unique identifiers
        const sameIsrc = Boolean(track.isrc && candidate.isrc && track.isrc === candidate.isrc);
        const sameSpotify = Boolean(track.spotifyTrackId && candidate.spotifyTrackId && track.spotifyTrackId === candidate.spotifyTrackId);
        const sameTrackId = Boolean(track.id != null && candidate.trackId != null && String(track.id) === String(candidate.trackId));

        if (sameIsrc || sameSpotify) {
            return {
                matched: true,
                score: 100,
                confidence: sameIsrc ? 'isrc-exact' : 'spotify-ref-exact',
                reason: 'strong-id',
                warnings
            };
        }

        if (sameTrackId) {
            // Even on ID match, sanity check title/version unless custom local edit
            if (candTitle && titleSim < 0.2 && trackTitle) {
                warnings.push('Tên bài hát trong metadata khác với tiêu đề lyrics');
            }
            return {
                matched: true,
                score: 92,
                confidence: candidate.confidence || 'track-id',
                reason: 'track-id',
                warnings
            };
        }

        // Metadata matching fallback: NEVER match solely by same title if artist clearly differs!
        if (titleSim >= 0.7 && artistSim < 0.25 && candidate.artist && track.artist) {
            return {
                matched: false,
                score: Math.round(titleSim * 40),
                confidence: 'rejected',
                reason: 'artist-mismatch',
                warnings: [`Tên bài giống nhau nhưng nghệ sĩ khác (${track.artist} ≠ ${candidate.artist})`]
            };
        }

        let score = (titleSim * 50) + (artistSim * 35) + (albumSim * 10);
        if (trackVer === candVer) score += 5;

        const matched = score >= 68 && titleSim >= 0.5 && (!track.artist || !candidate.artist || artistSim >= 0.3);
        return {
            matched,
            score: Math.round(score),
            confidence: matched ? (score >= 85 ? 'metadata-strong' : 'metadata-good') : 'rejected',
            reason: matched ? 'metadata-match' : 'low-similarity',
            warnings
        };
    }

    ns.Matcher = {
        DURATION_TOLERANCE_MS,
        detectVersion,
        tokenOverlapSimilarity,
        isVersionCompatible,
        matchTrack
    };
})(typeof window !== 'undefined' ? window : globalThis);
