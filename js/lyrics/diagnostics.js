/* ========================================================
   MINKOI LYRICS ENGINE V2 · DIAGNOSTICS
   Validates timing monotonicity, overlaps, duration overflow,
   long instrumental interludes, source trust, and mismatches.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    const LONG_INTERLUDE_THRESHOLD_MS = 14000;

    function analyze(doc, track, audioDurationSec, matchResult) {
        const warnings = [];
        const errors = [];
        const longGaps = [];

        if (!doc) {
            return {
                status: 'error',
                syncLevel: 'unavailable',
                source: 'none',
                confidence: 'none',
                warnings: [],
                errors: ['Thiếu dữ liệu lyrics document'],
                longGaps: [],
                metrics: { lineCount: 0, timedTokenCount: 0, durationCoverage: 0 }
            };
        }

        if (matchResult && Array.isArray(matchResult.warnings)) {
            matchResult.warnings.forEach(w => warnings.push(w));
        }
        if (matchResult && !matchResult.matched && doc.syncLevel !== 'unavailable' && doc.syncLevel !== 'instrumental' && doc.syncLevel !== 'restricted') {
            errors.push(`Khớp track không hợp lệ: ${matchResult.reason || 'mismatch'}`);
        }

        const lines = Array.isArray(doc.lines) ? doc.lines : [];
        let timedTokenCount = 0;
        let maxTimestampMs = 0;

        const effectiveDurMs = (Number.isFinite(audioDurationSec) && audioDurationSec > 0)
            ? Math.round(audioDurationSec * 1000)
            : (Number.isFinite(track?.durationMs) ? track.durationMs : doc.durationMs || null);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (Number.isFinite(line.endMs)) {
                maxTimestampMs = Math.max(maxTimestampMs, line.endMs);
                if (Number.isFinite(line.startMs) && line.endMs < line.startMs) errors.push(`Dòng #${i + 1}: endMs < startMs`);
            }
            if (Number.isFinite(line.startMs)) {
                if (line.startMs < 0) {
                    errors.push(`Dòng #${i + 1} có timestamp âm (${line.startMs}ms)`);
                }
                if (line.startMs > maxTimestampMs) maxTimestampMs = line.startMs;

                if (i > 0 && Number.isFinite(lines[i - 1].startMs)) {
                    const prev = lines[i - 1];
                    if (line.startMs < prev.startMs) {
                        errors.push(`Dòng #${i + 1} (${line.startMs}ms) nhỏ hơn dòng trước (${prev.startMs}ms)`);
                    }
                    const gapPrevEnd = Number.isFinite(prev.endMs) ? prev.endMs : prev.startMs;
                    const gapMs = line.startMs - gapPrevEnd;
                    if (gapMs >= LONG_INTERLUDE_THRESHOLD_MS) {
                        longGaps.push({
                            afterLineIndex: i - 1,
                            beforeLineIndex: i,
                            startMs: gapPrevEnd,
                            endMs: line.startMs,
                            durationMs: gapMs
                        });
                    }
                }
            }

            if (Array.isArray(line.tokens)) {
                let prevTokStart = -1;
                for (let j = 0; j < line.tokens.length; j++) {
                    const tok = line.tokens[j];
                    if (tok.isWhitespace) continue;
                    if (Number.isFinite(tok.startMs)) {
                        timedTokenCount++;
                        if (tok.startMs > maxTimestampMs) maxTimestampMs = tok.startMs;
                        if (prevTokStart >= 0 && tok.startMs < prevTokStart) {
                            warnings.push(`Token "${tok.text}" ở dòng #${i + 1} có timestamp không đơn điệu`);
                        }
                        if (Number.isFinite(tok.endMs) && tok.endMs < tok.startMs) {
                            errors.push(`Token "${tok.text}" ở dòng #${i + 1} có endMs < startMs`);
                        }
                        if (Number.isFinite(tok.endMs) && tok.endMs > maxTimestampMs) {
                            maxTimestampMs = tok.endMs;
                        }
                        prevTokStart = tok.startMs;
                    }
                }
            }
        }

        if (effectiveDurMs && maxTimestampMs > effectiveDurMs + 5000) {
            warnings.push(`Lyrics kết thúc muộn hơn độ dài audio (${Math.round(maxTimestampMs / 1000)}s > ${Math.round(effectiveDurMs / 1000)}s)`);
        }

        if (doc.syncLevel === 'unavailable') {
            warnings.push('Chưa có nguồn lyrics hợp lệ cho bài hát này');
        } else if (doc.syncLevel === 'restricted') {
            warnings.push(doc.restrictedReason || 'Nguồn phát bị giới hạn quyền đồng bộ karaoke');
        } else if (doc.syncLevel === 'line') {
            warnings.push('Chỉ có timing theo dòng (line-level) — chưa có word/syllable timing gốc');
        }
        const correctedCount = lines.filter(l => Number.isFinite(l.correctedStartMs) || Number.isFinite(l.correctedEndMs)).length;
        const estimatedCount = lines.filter(l => l.timingStatus === 'estimated').length;
        if (correctedCount > 0) {
            warnings.push(`${correctedCount} dòng có hiệu chỉnh thời gian tách khỏi mốc nguồn; có thể hoàn tác trong Editor.`);
        }
        if (estimatedCount > 0) {
            warnings.push(`${estimatedCount} dòng dùng thời gian ước lượng, không phải mốc nguồn đã xác minh.`);
        }

        const missingLayers = {
            jp: lines.filter(l => !l.isInterlude && !l.jp).length,
            romaji: lines.filter(l => !l.isInterlude && !l.romaji).length,
            vi: lines.filter(l => !l.isInterlude && !l.translation).length
        };
        if (doc.status === 'draft') warnings.push('Bản nháp: văn bản/phiên âm/bản dịch và thời gian chưa được kiểm chứng bằng nghe đối chiếu.');
        (doc.reviewNotes || []).forEach(note => warnings.push(note));
        if (Object.values(missingLayers).some(Boolean)) warnings.push(`Tầng còn thiếu: Nhật ${missingLayers.jp}, Romaji ${missingLayers.romaji}, Việt ${missingLayers.vi}`);

        const durationCoverage = (effectiveDurMs && effectiveDurMs > 0 && maxTimestampMs > 0)
            ? Math.min(1, Math.round((maxTimestampMs / effectiveDurMs) * 100) / 100)
            : 0;

        let status = 'ok';
        if (errors.length > 0) status = 'error';
        else if (warnings.length > 0) status = 'warning';

        return {
            status,
            syncLevel: doc.syncLevel,
            source: doc.source,
            confidence: doc.confidence,
            warnings,
            errors,
            longGaps,
            metrics: {
                lineCount: lines.length,
                missingLayers,
                timedTokenCount,
                durationCoverage,
                maxTimestampMs,
                trackDurationMs: effectiveDurMs,
                timingStatus: doc.timingStatus || 'source-unverified',
                correctedCount,
                estimatedCount
            }
        };
    }

    ns.Diagnostics = {
        LONG_INTERLUDE_THRESHOLD_MS,
        analyze
    };
})(typeof window !== 'undefined' ? window : globalThis);
