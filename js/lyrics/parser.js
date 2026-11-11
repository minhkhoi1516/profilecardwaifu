/* ========================================================
   MINKOI LYRICS ENGINE V2 · PARSER
   Parses TTML (word/syllable/x-bg/x-translation), Enhanced LRC
   (<mm:ss.xx> inline word timings), Standard LRC (+ [offset:]),
   and Plain text lyrics while preserving Japanese Unicode.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    function getNormalizer() {
        if (!ns.Normalizer) {
            throw new Error('MinkoiLyrics.Normalizer must load before MinkoiLyrics.Parser');
        }
        return ns.Normalizer;
    }

    function detectFormat(rawText) {
        if (!rawText || typeof rawText !== 'string') return 'plain';
        const trimmed = rawText.trim();
        if (!trimmed) return 'plain';
        if (/<\s*(?:tt|tt:tt)\b/i.test(trimmed) || /xmlns(?::tt)?\s*=\s*["']http:\/\/www\.w3\.org\/ns\/ttml/i.test(trimmed)) {
            return 'ttml';
        }
        // Enhanced LRC has inline <mm:ss.xx> word timestamps inside LRC lines
        if (/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/.test(trimmed) && /<\d{1,3}:\d{2}(?:[.:]\d{1,4})?>/.test(trimmed)) {
            return 'elrc';
        }
        if (/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/.test(trimmed)) {
            return 'lrc';
        }
        return 'plain';
    }

    function getAttrNS(el, localName) {
        if (!el || !el.attributes) return null;
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            if (attr.localName === localName || attr.name === localName || attr.name.endsWith(':' + localName)) {
                return attr.value;
            }
        }
        return null;
    }

    /**
     * Extract speaker / background flags and clean prefix markers.
     */
    function extractSpeakerMetadata(text, existingSpeaker) {
        let out = text;
        let speaker = existingSpeaker || null;
        let isBackground = false;

        // Match v1: / v2: / [Miku] prefixes when explicit
        const vMatch = out.match(/^(v\d+|duet|all)\s*:\s*(.*)$/i);
        if (vMatch) {
            speaker = vMatch[1].toLowerCase();
            out = vMatch[2];
        }

        const bgMatch = out.match(/^\[(?:bg|background)\]\s*(.*)$/i);
        if (bgMatch) {
            isBackground = true;
            out = bgMatch[1];
        }

        return { text: out, speaker, isBackground };
    }

    /**
     * Recursively collect timed tokens & inline translations/background segments from a TTML <p>.
     * Strictly preserves whitespace text nodes without inserting spaces inside Japanese strings.
     */
    function collectTtmlParagraph(pEl, parseMs, inheritedAgent, divBeginMs) {
        const tokens = [];
        const bgTokens = [];
        let inlineTranslation = '';

        function walk(node, activeAgent, activeBg, activeStartMs, activeEndMs) {
            if (!node) return;
            if (node.nodeType === 3) { // TEXT_NODE
                const val = node.nodeValue || '';
                if (!val) return;
                // Only drop formatting newlines/indentation if purely whitespace between block lines
                const clean = val.replace(/\r?\n\s*/g, '');
                if (!clean) return;
                const tok = {
                    text: clean,
                    startMs: activeStartMs,
                    endMs: activeEndMs,
                    isBackground: activeBg,
                    speaker: activeAgent || null
                };
                if (activeBg) {
                    bgTokens.push(tok);
                } else {
                    tokens.push(tok);
                }
                return;
            }
            if (node.nodeType !== 1) return; // ELEMENT_NODE

            const localName = (node.localName || node.tagName || '').toLowerCase();
            const role = getAttrNS(node, 'role') || '';
            const agent = getAttrNS(node, 'agent') || activeAgent;

            if (role === 'x-translation') {
                inlineTranslation += (node.textContent || '').trim();
                return;
            }

            if (localName === 'br') {
                tokens.push({ text: ' ', startMs: null, endMs: null, isBackground: activeBg });
                return;
            }

            const beginAttr = getAttrNS(node, 'begin');
            const endAttr = getAttrNS(node, 'end');
            const durAttr = getAttrNS(node, 'dur');

            let nodeStart = beginAttr ? parseMs(beginAttr) : activeStartMs;
            let nodeEnd = endAttr ? parseMs(endAttr) : activeEndMs;
            if (nodeStart !== null && nodeEnd === null && durAttr) {
                const durMs = parseMs(durAttr);
                if (durMs !== null) nodeEnd = nodeStart + durMs;
            }

            const isBgNode = activeBg || role === 'x-bg';

            // If this <span> has timed timing and only text children, emit a single atomic token (preserves word/syllable unit)
            const hasElementChildren = Array.from(node.childNodes).some(c => c.nodeType === 1 && getAttrNS(c, 'role') !== 'x-translation');
            if (!hasElementChildren && localName === 'span') {
                const text = (node.textContent || '').replace(/\r?\n\s*/g, '');
                if (text.length > 0) {
                    const tok = {
                        text,
                        startMs: nodeStart,
                        endMs: nodeEnd,
                        isBackground: isBgNode,
                        speaker: agent || null
                    };
                    if (isBgNode) bgTokens.push(tok);
                    else tokens.push(tok);
                }
                return;
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                walk(node.childNodes[i], agent, isBgNode, nodeStart, nodeEnd);
            }
        }

        const pBeginAttr = getAttrNS(pEl, 'begin');
        const pEndAttr = getAttrNS(pEl, 'end');
        const pDurAttr = getAttrNS(pEl, 'dur');
        const pAgent = getAttrNS(pEl, 'agent') || inheritedAgent || null;
        const pIsBg = (getAttrNS(pEl, 'role') || '').toLowerCase() === 'x-bg';
        const pStart = pBeginAttr ? parseMs(pBeginAttr) : divBeginMs;
        let pEnd = pEndAttr ? parseMs(pEndAttr) : null;
        if (pStart !== null && pEnd === null && pDurAttr) {
            const dur = parseMs(pDurAttr);
            if (dur !== null) pEnd = pStart + dur;
        }

        for (let i = 0; i < pEl.childNodes.length; i++) {
            walk(pEl.childNodes[i], pAgent, false, pStart, pEnd);
        }

        return { pStart, pEnd, pAgent, pIsBg, tokens, bgTokens, inlineTranslation };
    }

    /**
     * Parse TTML document into normalized structure.
     */
    function parseTTML(xmlString, options = {}) {
        const { parseTimecodeToMs, containsJapanese } = getNormalizer();
        if (typeof DOMParser === 'undefined') {
            throw new Error('TTML parsing requires DOMParser');
        }
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        const parseErr = xmlDoc.querySelector('parsererror');
        if (parseErr) {
            throw new Error(`Invalid TTML XML: ${parseErr.textContent?.slice(0, 120) || 'parse error'}`);
        }

        const ttRoot = xmlDoc.documentElement;
        const timingMode = (getAttrNS(ttRoot, 'timing') || '').toLowerCase();

        // Parse agents (e.g. v1, v2)
        const agents = {};
        const agentNodes = xmlDoc.getElementsByTagNameNS('*', 'agent');
        for (let i = 0; i < agentNodes.length; i++) {
            const ag = agentNodes[i];
            const id = getAttrNS(ag, 'id');
            if (id) agents[id] = { id, type: ag.getAttribute('type') || 'person', name: (ag.textContent || '').trim() };
        }

        const titleNode = xmlDoc.getElementsByTagNameNS('*', 'title')[0];
        const descNode = xmlDoc.getElementsByTagNameNS('*', 'desc')[0];

        const pNodes = Array.from(xmlDoc.getElementsByTagNameNS('*', 'p'));
        const lines = [];
        let syllableCount = 0;
        let timedWordCount = 0;

        for (let i = 0; i < pNodes.length; i++) {
            const p = pNodes[i];
            const parentDiv = p.parentElement;
            const divBegin = parentDiv ? parseTimecodeToMs(getAttrNS(parentDiv, 'begin')) : null;
            const res = collectTtmlParagraph(p, parseTimecodeToMs, getAttrNS(parentDiv, 'agent'), divBegin);

            const mainTimed = res.tokens.filter(t => !t.isWhitespace && Number.isFinite(t.startMs));
            const leadText = res.tokens.map(t => t.text).join('').trim();

            if (mainTimed.length > 0) {
                timedWordCount += mainTimed.length;
                // Heuristic: explicit Syllable timing mode OR multiple consecutive non-whitespace timed tokens (typical in JP/syllable karaoke)
                if (timingMode === 'syllable') {
                    syllableCount++;
                } else {
                    for (let k = 1; k < res.tokens.length; k++) {
                        if (!res.tokens[k].isWhitespace && !res.tokens[k - 1].isWhitespace &&
                            Number.isFinite(res.tokens[k].startMs) && Number.isFinite(res.tokens[k - 1].startMs)) {
                            syllableCount++;
                            break;
                        }
                    }
                }
            }

            if (leadText || mainTimed.length > 0) {
                lines.push({
                    startMs: res.pStart,
                    endMs: res.pEnd,
                    text: leadText,
                    romaji: leadText,
                    translation: res.inlineTranslation,
                    speaker: res.pAgent,
                    isBackground: Boolean(res.pIsBg),
                    isJapanese: containsJapanese(leadText),
                    tokens: mainTimed.length > 0 ? res.tokens : null
                });
            }

            // Emit background vocal sub-line cleanly when x-bg tokens exist
            const bgTimed = res.bgTokens.filter(t => !t.isWhitespace && Number.isFinite(t.startMs));
            const bgText = res.bgTokens.map(t => t.text).join('').trim();
            if (bgText) {
                const bgStart = bgTimed.length > 0 ? bgTimed[0].startMs : res.pStart;
                const bgEnd = bgTimed.length > 0 ? (bgTimed[bgTimed.length - 1].endMs || res.pEnd) : res.pEnd;
                lines.push({
                    startMs: bgStart,
                    endMs: bgEnd,
                    text: bgText,
                    romaji: bgText,
                    translation: '',
                    speaker: res.pAgent,
                    isBackground: true,
                    isJapanese: containsJapanese(bgText),
                    tokens: bgTimed.length > 0 ? res.bgTokens : null
                });
            }
        }

        const inferredSyncLevel = timedWordCount > 0
            ? (timingMode === 'syllable' || syllableCount > 0 ? 'syllable' : 'word')
            : (lines.some(l => Number.isFinite(l.startMs)) ? 'line' : 'plain');

        return {
            title: titleNode ? titleNode.textContent.trim() : (options.title || ''),
            artist: options.artist || '',
            source: options.source || 'ttml-import',
            format: 'ttml',
            confidence: 'explicit-ttml',
            syncLevel: inferredSyncLevel,
            offsetMs: 0,
            agents,
            description: descNode ? descNode.textContent.trim() : '',
            lines
        };
    }

    /**
     * Parse Enhanced LRC inline word tokens from the lyric content after line timestamp.
     * Supports:
     *   <00:12.50>君<00:12.90>の<00:13.20>名<00:13.60>
     *   Hello <00:12.90>world<00:13.40>
     */
    function parseInlineElrcTokens(bodyText, lineStartMs, parseMs) {
        const tagRe = /<(\d{1,3}:\d{2}(?:[.:]\d{1,4})?)>/g;
        const matches = [];
        let m;
        while ((m = tagRe.exec(bodyText)) !== null) {
            const ms = parseMs(m[1]);
            if (ms !== null) {
                matches.push({ startIdx: m.index, endIdx: m.index + m[0].length, ms });
            }
        }
        if (matches.length === 0) return null;

        const tokens = [];
        // Any leading text BEFORE first <mm:ss.xx> gets lineStartMs and ends at first inline tag ms
        if (matches[0].startIdx > 0) {
            const lead = bodyText.slice(0, matches[0].startIdx);
            if (lead.length > 0) {
                tokens.push({
                    text: lead,
                    startMs: lineStartMs,
                    endMs: matches[0].ms
                });
            }
        }

        let explicitClosingEndMs = null;
        for (let i = 0; i < matches.length; i++) {
            const cur = matches[i];
            const next = matches[i + 1];
            const textSlice = bodyText.slice(cur.endIdx, next ? next.startIdx : bodyText.length);

            if (textSlice.length === 0) {
                // Closing timestamp tag at end of line (e.g. ...word<00:14.20>)
                if (!next && tokens.length > 0) {
                    explicitClosingEndMs = cur.ms;
                    // Attach endMs to preceding non-whitespace token if missing
                    for (let j = tokens.length - 1; j >= 0; j--) {
                        if (!/^\s+$/.test(tokens[j].text)) {
                            tokens[j].endMs = cur.ms;
                            break;
                        }
                    }
                }
                continue;
            }

            // Preserve whitespace cleanly without merging away needed spacing tokens
            const parts = textSlice.match(/\S+|\s+/g) || [textSlice];
            if (parts.length === 1) {
                tokens.push({
                    text: parts[0],
                    startMs: cur.ms,
                    endMs: next ? next.ms : null
                });
            } else {
                // Multi-segment text under one inline tag: first non-space gets the exact startMs, spaces are neutral
                let assigned = false;
                parts.forEach(part => {
                    if (/^\s+$/.test(part)) {
                        tokens.push({ text: part, startMs: null, endMs: null });
                    } else if (!assigned) {
                        assigned = true;
                        tokens.push({ text: part, startMs: cur.ms, endMs: next ? next.ms : null });
                    } else {
                        // Append unspaced or keep text strictly under same real timestamp rather than inventing fake sub-timings
                        tokens[tokens.length - 1].text += part;
                        if (next) tokens[tokens.length - 1].endMs = next.ms;
                    }
                });
            }
        }

        // Clean whitespace tokens' trailing/leading links
        for (let i = 0; i < tokens.length; i++) {
            if (!/^\s+$/.test(tokens[i].text) && tokens[i].endMs === null) {
                for (let j = i + 1; j < tokens.length; j++) {
                    if (Number.isFinite(tokens[j].startMs)) {
                        tokens[i].endMs = tokens[j].startMs;
                        break;
                    }
                }
            }
        }

        const nonEmptyTimed = tokens.filter(t => !/^\s+$/.test(t.text) && Number.isFinite(t.startMs));
        if (nonEmptyTimed.length === 0) return null;
        return { tokens, explicitLineEndMs: explicitClosingEndMs };
    }

    /**
     * Parse standard LRC and Enhanced LRC.
     */
    function parseLRC(lrcText, options = {}) {
        const { parseTimecodeToMs } = getNormalizer();
        const rawLines = (lrcText || '').replace(/^\uFEFF/, '').split(/\r?\n/);

        const meta = {
            title: options.title || '',
            artist: options.artist || '',
            album: options.album || '',
            durationMs: options.durationMs || null,
            offsetMs: 0
        };

        const entries = [];
        let hasInlineWordTags = false;

        for (let i = 0; i < rawLines.length; i++) {
            const line = rawLines[i].trim();
            if (!line) continue;

            // Header metadata tags: [ti:...], [ar:...], [al:...], [offset:...], [length:...]
            const metaMatch = line.match(/^\[(ti|ar|al|by|re|ve|offset|length)\s*:\s*(.*?)\]$/i);
            if (metaMatch) {
                const tag = metaMatch[1].toLowerCase();
                const val = metaMatch[2].trim();
                if (tag === 'ti' && !meta.title) meta.title = val;
                else if (tag === 'ar' && !meta.artist) meta.artist = val;
                else if (tag === 'al' && !meta.album) meta.album = val;
                else if (tag === 'offset') {
                    const parsedOff = parseInt(val, 10);
                    if (!isNaN(parsedOff)) meta.offsetMs = parsedOff;
                } else if (tag === 'length') {
                    const durMs = parseTimecodeToMs(val);
                    if (durMs !== null) meta.durationMs = durMs;
                }
                continue;
            }

            // Collect one or more leading [mm:ss.xx] timestamps
            const tsRegex = /^((?:\[\d{1,3}:\d{2}(?:[.:]\d{1,4})?\])+)(.*)$/;
            const lineMatch = line.match(tsRegex);
            if (!lineMatch) continue;

            const tsBlock = lineMatch[1];
            const bodyRaw = lineMatch[2];
            const timestamps = [];
            let tm;
            const singleTs = /\[(\d{1,3}:\d{2}(?:[.:]\d{1,4})?)\]/g;
            while ((tm = singleTs.exec(tsBlock)) !== null) {
                const ms = parseTimecodeToMs(tm[1]);
                if (ms !== null) timestamps.push(ms);
            }
            if (timestamps.length === 0) continue;

            timestamps.forEach(lineStartMs => {
                let body = bodyRaw.trim();
                const sp = extractSpeakerMetadata(body, null);
                body = sp.text;

                const elrc = parseInlineElrcTokens(body, lineStartMs, parseTimecodeToMs);
                if (elrc) {
                    hasInlineWordTags = true;
                    const plainText = elrc.tokens.map(t => t.text).join('');
                    entries.push({
                        startMs: lineStartMs,
                        endMs: elrc.explicitLineEndMs,
                        text: plainText,
                        romaji: plainText,
                        translation: '',
                        speaker: sp.speaker,
                        isBackground: sp.isBackground,
                        tokens: elrc.tokens
                    });
                } else {
                    // Optional dual-line separator only if explicit ` || ` delimiter is supplied in manual import
                    let primary = body;
                    let translation = '';
                    if (body.includes(' || ')) {
                        const split = body.split(' || ');
                        primary = split[0].trim();
                        translation = split.slice(1).join(' ').trim();
                    }
                    if (!primary) return; // Ignore blank interlude timestamp markers as text lines
                    entries.push({
                        startMs: lineStartMs,
                        endMs: null,
                        text: primary,
                        romaji: primary,
                        translation,
                        speaker: sp.speaker,
                        isBackground: sp.isBackground,
                        tokens: null
                    });
                }
            });
        }

        // Merge duplicate identical timestamps where line 2 is an untokenized translation line if dualTranslation option enabled
        const merged = [];
        entries.sort((a, b) => a.startMs - b.startMs);
        for (let i = 0; i < entries.length; i++) {
            const cur = entries[i];
            const prev = merged[merged.length - 1];
            if (options.mergeSameTimestampAsTranslation && prev && prev.startMs === cur.startMs && !cur.tokens && !prev.translation && !cur.isBackground) {
                prev.translation = cur.text;
            } else {
                merged.push(cur);
            }
        }

        return {
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            durationMs: meta.durationMs,
            source: options.source || (hasInlineWordTags ? 'elrc-import' : 'lrc-import'),
            format: hasInlineWordTags ? 'elrc' : 'lrc',
            confidence: hasInlineWordTags ? 'explicit-elrc' : 'explicit-lrc',
            syncLevel: hasInlineWordTags ? 'word' : 'line',
            offsetMs: meta.offsetMs,
            lines: merged
        };
    }

    function parsePlainText(rawText, options = {}) {
        const lines = (rawText || '')
            .replace(/^\uFEFF/, '')
            .split(/\r?\n/)
            .map(s => s.trim())
            .filter(Boolean)
            .map(text => ({
                startMs: null,
                endMs: null,
                text,
                romaji: text,
                translation: '',
                tokens: null
            }));

        return {
            title: options.title || '',
            artist: options.artist || '',
            source: options.source || 'plain-import',
            format: 'plain',
            confidence: 'plain-text',
            syncLevel: 'plain',
            offsetMs: 0,
            lines
        };
    }

    /**
     * Unified parser entry point supporting TTML, ELRC, LRC, Plain, or pre-structured JSON objects.
     */
    function parse(input, options = {}) {
        const normalizer = getNormalizer();
        if (input && typeof input === 'object' && !Array.isArray(input)) {
            if (typeof input.raw === 'string' && !Array.isArray(input.lines)) {
                return parse(input.raw, {
                    ...options,
                    format: input.format || options.format || 'auto',
                    title: input.title || options.title,
                    artist: input.artist || options.artist,
                    source: options.source || input.source
                });
            }
            return normalizer.normalizeDocument(input, options.trackMeta);
        }

        const rawText = typeof input === 'string' ? input : '';
        const format = (options.format && options.format !== 'auto') ? options.format.toLowerCase() : detectFormat(rawText);

        let parsed;
        if (format === 'ttml') {
            parsed = parseTTML(rawText, options);
        } else if (format === 'elrc' || format === 'lrc') {
            parsed = parseLRC(rawText, options);
        } else {
            parsed = parsePlainText(rawText, options);
        }
        return normalizer.normalizeDocument(parsed, options.trackMeta);
    }

    ns.Parser = {
        detectFormat,
        parseTTML,
        parseLRC,
        parsePlainText,
        parse
    };
})(typeof window !== 'undefined' ? window : globalThis);
