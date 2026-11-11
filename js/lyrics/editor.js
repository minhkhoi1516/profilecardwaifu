/* ========================================================
   MINKOI LYRICS ENGINE V2 · EDITOR & DIAGNOSTICS INSPECTOR
   Allows importing TTML / Enhanced LRC / LRC per track,
   inspecting match confidence & timing diagnostics,
   adjusting per-track offset, and exporting valid LRC/ELRC.
   ======================================================== */
(function(global) {
    'use strict';

    const ns = (global.MinkoiLyrics = global.MinkoiLyrics || {});

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatLrcTimestamp(ms) {
        const clamped = Math.max(0, Math.round(ms));
        const mins = Math.floor(clamped / 60000);
        const secs = Math.floor((clamped % 60000) / 1000);
        const cs = Math.floor((clamped % 1000) / 10);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    }

    function exportDocumentAsLRC(doc) {
        if (!doc || !Array.isArray(doc.lines) || doc.lines.length === 0) return '';
        const out = [];
        if (doc.title) out.push(`[ti:${doc.title}]`);
        if (doc.artist) out.push(`[ar:${doc.artist}]`);
        if (doc.album) out.push(`[al:${doc.album}]`);
        if (Number.isFinite(doc.offsetMs) && doc.offsetMs !== 0) {
            out.push(`[offset:${doc.offsetMs}]`);
        }

        doc.lines.forEach(line => {
            if (!Number.isFinite(line.startMs)) {
                out.push(line.text || '');
                return;
            }
            const head = `[${formatLrcTimestamp(line.startMs)}]`;
            if (Array.isArray(line.tokens) && line.tokens.length > 0 && (doc.syncLevel === 'word' || doc.syncLevel === 'syllable')) {
                let body = '';
                line.tokens.forEach(tok => {
                    if (tok.isWhitespace) {
                        body += tok.text;
                    } else if (Number.isFinite(tok.startMs)) {
                        body += `<${formatLrcTimestamp(tok.startMs)}>${tok.text}`;
                    } else {
                        body += tok.text;
                    }
                });
                const lastTimed = [...line.tokens].reverse().find(t => Number.isFinite(t.endMs));
                if (lastTimed) body += `<${formatLrcTimestamp(lastTimed.endMs)}>`;
                out.push(`${head}${body}`);
            } else {
                const suffix = line.translation ? ` || ${line.translation}` : '';
                out.push(`${head}${line.text || line.romaji || ''}${suffix}`);
            }
        });
        return out.join('\n');
    }

    class LyricsEditor {
        constructor(panelEl, callbacks = {}) {
            this.panel = panelEl;
            this.callbacks = callbacks;
            this.isOpen = false;
            this.currentTrack = null;
            this.currentDoc = null;
            this.currentDiag = null;
            this.currentMatch = null;
        }

        setState({ track, doc, diagnostics, matchResult }) {
            this.currentTrack = track;
            this.currentDoc = doc;
            this.currentDiag = diagnostics;
            this.currentMatch = matchResult;
            if (this.isOpen) {
                this.render();
            }
        }

        open() {
            if (!this.panel) return;
            this.isOpen = true;
            this.panel.classList.add('open');
            this.render();
        }

        close() {
            if (!this.panel) return;
            this.isOpen = false;
            this.panel.classList.remove('open');
        }

        toggle() {
            if (this.isOpen) this.close();
            else this.open();
        }

        render() {
            if (!this.panel) return;
            const track = this.currentTrack;
            const doc = this.currentDoc;
            const diag = this.currentDiag;
            const Cache = ns.Cache;

            const existingCustom = Cache?.getCustomImport(track);
            const prefillText = existingCustom?.rawText || (doc && doc.lines?.length ? exportDocumentAsLRC(doc) : '');

            const warningsHtml = (diag?.warnings || []).map(w => `<li><i class="fas fa-triangle-exclamation"></i> ${escapeHtml(w)}</li>`).join('');
            const errorsHtml = (diag?.errors || []).map(e => `<li class="is-error"><i class="fas fa-circle-xmark"></i> ${escapeHtml(e)}</li>`).join('');

            this.panel.innerHTML = `
                <div class="lyrics-editor-header">
                    <div class="editor-title-wrap">
                        <span class="editor-kicker">LYRICS DIAGNOSTICS & IMPORT EDITOR</span>
                        <h4>${escapeHtml(track?.name || 'No track selected')}</h4>
                    </div>
                    <button type="button" class="editor-back-btn" id="lyrics-editor-close"><i class="fas fa-arrow-left"></i> Quay lại Lyrics</button>
                </div>

                <div class="lyrics-editor-scroll">
                    <div class="editor-meta-grid">
                        <div class="meta-chip"><span>Sync Level</span><strong>${escapeHtml(doc?.syncLevel || 'unavailable')}</strong></div>
                        <div class="meta-chip"><span>Source</span><strong>${escapeHtml(doc?.source || 'none')}</strong></div>
                        <div class="meta-chip"><span>Confidence</span><strong>${escapeHtml(doc?.confidence || 'none')}</strong></div>
                        <div class="meta-chip"><span>Lines / Tokens</span><strong>${diag?.metrics?.lineCount || 0} / ${diag?.metrics?.timedTokenCount || 0}</strong></div>
                    </div>

                    ${(warningsHtml || errorsHtml) ? `
                        <ul class="editor-diag-list">${errorsHtml}${warningsHtml}</ul>
                    ` : '<div class="editor-diag-ok"><i class="fas fa-circle-check"></i> Timing & metadata kiểm tra hợp lệ, không phát hiện lỗi xung đột.</div>'}

                    <div class="editor-import-box">
                        <div class="editor-label-row">
                            <label for="lyrics-import-textarea">Nạp TTML / Enhanced LRC (<code>&lt;mm:ss.xx&gt;</code>) / LRC cho track này:</label>
                            <label class="editor-upload-btn" title="Chọn file .ttml, .lrc hoặc .txt từ thiết bị">
                                <i class="fas fa-file-arrow-up"></i> Chọn file
                                <input type="file" id="lyrics-file-input" accept=".ttml,.xml,.lrc,.elrc,.txt" hidden>
                            </label>
                        </div>
                        <textarea id="lyrics-import-textarea" class="editor-textarea" rows="7" spellcheck="false" placeholder="[00:12.50]<00:12.50>君<00:12.90>の<00:13.30>こと<00:13.90>&#10;hoặc dán XML TTML (<tt xmlns='http://www.w3.org/ns/ttml'>...) để bật Apple Music Sing word/syllable sweep">${escapeHtml(prefillText)}</textarea>
                        <div class="editor-preview-status" id="lyrics-editor-preview-msg"></div>
                        <div class="editor-btn-row">
                            <button type="button" class="editor-btn" id="lyrics-preview-parse-btn"><i class="fas fa-vial"></i> Kiểm tra định dạng</button>
                            <button type="button" class="editor-btn primary" id="lyrics-save-custom-btn"><i class="fas fa-check"></i> Áp dụng cho bài này</button>
                            <button type="button" class="editor-btn" id="lyrics-export-lrc-btn"><i class="fas fa-download"></i> Xuất LRC</button>
                            ${doc?.isCustomImported ? '<button type="button" class="editor-btn danger" id="lyrics-reset-custom-btn"><i class="fas fa-rotate-left"></i> Khôi phục gốc</button>' : ''}
                        </div>
                    </div>
                </div>
            `;

            this.panel.querySelector('#lyrics-editor-close')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });

            const textarea = this.panel.querySelector('#lyrics-import-textarea');
            const previewMsg = this.panel.querySelector('#lyrics-editor-preview-msg');
            const fileInput = this.panel.querySelector('#lyrics-file-input');

            fileInput?.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    if (textarea && typeof reader.result === 'string') {
                        textarea.value = reader.result;
                        runPreview();
                    }
                };
                reader.readAsText(file);
            });

            const runPreview = () => {
                const raw = textarea?.value || '';
                if (!raw.trim()) {
                    if (previewMsg) previewMsg.textContent = 'Chưa có nội dung để kiểm tra.';
                    return null;
                }
                try {
                    const fmt = ns.Parser.detectFormat(raw);
                    const parsed = ns.Parser.parse(raw, { format: fmt, source: `custom-${fmt}`, trackMeta: track });
                    const diagCheck = ns.Diagnostics.analyze(parsed, track, null, null);
                    const tokCount = diagCheck.metrics.timedTokenCount;
                    if (previewMsg) {
                        previewMsg.innerHTML = `<span class="preview-ok">✓ Format: <b>${fmt.toUpperCase()}</b> · Sync Level: <b>${parsed.syncLevel}</b> · ${parsed.lines.length} dòng · ${tokCount} timed tokens</span>`;
                    }
                    return { raw, fmt, parsed };
                } catch (err) {
                    if (previewMsg) {
                        previewMsg.innerHTML = `<span class="preview-err">✕ Lỗi parse: ${escapeHtml(err.message || String(err))}</span>`;
                    }
                    return null;
                }
            };

            this.panel.querySelector('#lyrics-preview-parse-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                runPreview();
            });

            this.panel.querySelector('#lyrics-save-custom-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const res = runPreview();
                if (!res || !track) return;
                Cache.setCustomImport(track, res.raw, res.fmt);
                this.callbacks.onReloadTrack?.(track);
                this.close();
                if (typeof global.showToast === 'function') {
                    global.showToast(`Đã áp dụng ${res.fmt.toUpperCase()} (${res.parsed.syncLevel}) cho ${track.name}`, 'fa-check');
                }
            });

            this.panel.querySelector('#lyrics-export-lrc-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const lrc = exportDocumentAsLRC(doc);
                if (!lrc) return;
                const blob = new Blob([lrc], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(track?.name || 'lyrics').replace(/[\\/:*?"<>|]/g, '_')}.${doc?.syncLevel === 'word' || doc?.syncLevel === 'syllable' ? 'elrc' : 'lrc'}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });

            this.panel.querySelector('#lyrics-reset-custom-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!track) return;
                Cache.removeCustomImport(track);
                this.callbacks.onReloadTrack?.(track);
                if (typeof global.showToast === 'function') {
                    global.showToast('Đã khôi phục nguồn lyrics mặc định của track', 'fa-rotate-left');
                }
            });
        }
    }

    ns.Editor = LyricsEditor;
    ns.exportDocumentAsLRC = exportDocumentAsLRC;
})(typeof window !== 'undefined' ? window : globalThis);
