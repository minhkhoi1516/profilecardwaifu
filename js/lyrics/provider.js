/* ========================================================
   MINKOI LYRICS ENGINE V2 · PROVIDER
   Licensed/verified source lookup with AbortController safety,
   policy compliance checks, caching, and matcher verification.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    const externalProviders = [];

    function registerProvider(nameOrObj, fetcher) {
        if (typeof nameOrObj === 'object' && nameOrObj && typeof nameOrObj.load === 'function') {
            externalProviders.push({ name: String(nameOrObj.name || 'custom-provider'), fetch: nameOrObj.load });
            return;
        }
        if (typeof fetcher !== 'function') return;
        externalProviders.push({ name: String(nameOrObj || 'custom-provider'), fetch: fetcher });
    }

    function clearCustomProviders() {
        externalProviders.length = 0;
    }

    function isRestrictedTrack(track) {
        if (!track) return false;
        if (track.isRestrictedSource || track.restrictedAudio) return true;
        if (track.sourceType === 'spotify-embed' || track.sourceType === 'drm-stream') return true;
        const f = String(track.file || '');
        if (/^https?:\/\/open\.spotify\.com\//i.test(f)) return true;
        return false;
    }

    function throwIfAborted(signal) {
        if (signal && signal.aborted) {
            const err = new Error('Lyrics request aborted');
            err.name = 'AbortError';
            throw err;
        }
    }

    /**
     * Resolve lyrics document & diagnostics for a track asynchronously with cancellation.
     */
    async function loadForTrack(track, options = {}) {
        const { signal, bypassCache = false, audioDurationSec = null } = options;
        const Parser = ns.Parser;
        const Normalizer = ns.Normalizer;
        const Matcher = ns.Matcher;
        const Cache = ns.Cache;
        const Diagnostics = ns.Diagnostics;
        const Repository = ns.Repository;

        throwIfAborted(signal);
        if (!track) {
            return {
                document: Normalizer.normalizeDocument({ syncLevel: 'unavailable', source: 'none', lines: [] }),
                diagnostics: Diagnostics.analyze(null, null, null, null),
                matchResult: null
            };
        }

        // Policy Guard: Never overlay synchronized karaoke onto Spotify Embed / DRM streams
        if (isRestrictedTrack(track)) {
            const restrictedDoc = Normalizer.normalizeDocument({
                trackId: track.id,
                syncLevel: 'restricted',
                source: 'policy-guard',
                confidence: 'policy-enforced',
                restrictedReason: 'Spotify playback / DRM audio source không cho phép overlay lyrics đồng bộ.',
                lines: []
            }, track);
            return {
                document: restrictedDoc,
                diagnostics: Diagnostics.analyze(restrictedDoc, track, audioDurationSec, null),
                matchResult: { matched: false, score: 0, confidence: 'rejected', reason: 'restricted-source', warnings: [] }
            };
        }

        // Priority 1: User Custom Imported TTML / ELRC / LRC for this track
        const customRaw = Cache.getCustomImport(track);
        if (customRaw && customRaw.rawText) {
            const customDoc = Parser.parse(customRaw.rawText, {
                format: customRaw.format || 'auto',
                source: `custom-${customRaw.format || Parser.detectFormat(customRaw.rawText)}`,
                trackMeta: track
            });
            customDoc.isCustomImported = true;
            const customMatch = { matched: true, score: 100, confidence: 'user-imported', reason: 'custom-override', warnings: [] };
            return {
                document: customDoc,
                diagnostics: Diagnostics.analyze(customDoc, track, audioDurationSec, customMatch),
                matchResult: customMatch
            };
        }

        // Priority 2: Cached verified document (keyed by trackId + file + version)
        if (!bypassCache) {
            const cached = Cache.getParsed(track);
            if (cached) {
                const matchResult = { matched: true, score: 100, confidence: cached.confidence, reason: 'cache-hit', warnings: [] };
                return {
                    document: cached,
                    diagnostics: Diagnostics.analyze(cached, track, audioDurationSec, matchResult),
                    matchResult
                };
            }
        }

        // Priority 3: Track-configured explicit local TTML / ELRC / LRC file URL
        if (track.lyricsUrl) {
            const res = await global.fetch(track.lyricsUrl, { signal });
            throwIfAborted(signal);
            if (res.ok) {
                const text = await res.text();
                throwIfAborted(signal);
                const parsed = Parser.parse(text, {
                    format: track.lyricsFormat || 'auto',
                    source: `file:${track.lyricsUrl}`,
                    trackMeta: track
                });
                const matchResult = Matcher.matchTrack(track, parsed);
                if (matchResult.matched) {
                    Cache.setParsed(track, parsed);
                    return {
                        document: parsed,
                        diagnostics: Diagnostics.analyze(parsed, track, audioDurationSec, matchResult),
                        matchResult
                    };
                }
            }
        }

        // Priority 4: Registered licensed external providers
        for (let i = 0; i < externalProviders.length; i++) {
            const prov = externalProviders[i];
            try {
                const candidate = await prov.fetch(track, { signal });
                throwIfAborted(signal);
                if (!candidate) continue;

                const parsed = typeof candidate === 'string'
                    ? Parser.parse(candidate, { source: prov.name, trackMeta: track })
                    : Parser.parse(candidate, { trackMeta: track });

                const matchResult = Matcher.matchTrack(track, parsed);
                if (matchResult.matched) {
                    Cache.setParsed(track, parsed);
                    return {
                        document: parsed,
                        diagnostics: Diagnostics.analyze(parsed, track, audioDurationSec, matchResult),
                        matchResult
                    };
                }
            } catch (err) {
                if (err && err.name === 'AbortError') throw err;
            }
        }

        // Priority 5: Repository curated metadata / synced entries verified via Matcher
        const candidate = Repository.getCandidateForTrack(track);
        const matchResult = candidate
            ? Matcher.matchTrack(track, candidate)
            : { matched: false, score: 0, confidence: 'none', reason: 'no-candidate', warnings: [] };

        let finalDoc;
        if (candidate && candidate.isInstrumental) {
            finalDoc = Normalizer.normalizeDocument({ ...candidate, isInstrumental: true, syncLevel: 'instrumental' }, track);
        } else if (candidate && matchResult.matched) {
            finalDoc = Normalizer.normalizeDocument(candidate, track);
        } else if (Matcher.detectVersion(track) === 'instrumental') {
            finalDoc = Normalizer.normalizeDocument({
                trackId: track.id,
                isInstrumental: true,
                syncLevel: 'instrumental',
                source: 'track-version-metadata',
                lines: []
            }, track);
        } else {
            finalDoc = Normalizer.normalizeDocument({
                trackId: track.id,
                spotifyTrackId: track.spotifyTrackId || null,
                syncLevel: 'unavailable',
                source: matchResult.reason === 'no-candidate' ? 'none-verified' : `rejected:${matchResult.reason}`,
                confidence: 'none',
                lines: []
            }, track);
        }

        Cache.setParsed(track, finalDoc);
        return {
            document: finalDoc,
            diagnostics: Diagnostics.analyze(finalDoc, track, audioDurationSec, matchResult),
            matchResult
        };
    }

    ns.Provider = {
        registerProvider,
        clearCustomProviders,
        isRestrictedTrack,
        loadForTrack
    };
})(typeof window !== 'undefined' ? window : globalThis);
