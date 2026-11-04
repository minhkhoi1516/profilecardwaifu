/* ========================================================
   MINKOI · BESPOKE PROFILE CARD SNAPSHOT ENGINE
   Renders 1200x630 Retina Social Share Card to PNG Canvas
======================================================== */
(function() {
    'use strict';

    const snapBtn = document.getElementById('snapshot-card-btn');
    if (!snapBtn) return;

    function renderSnapshot() {
        if (typeof window.showToast === 'function') {
            window.showToast('Đang kết xuất ảnh thẻ hồ sơ...', 'fa-camera');
        }
        if (typeof window.playChimeSFX === 'function') window.playChimeSFX();

        const persona = typeof window.getCurrentPersona === 'function' ? window.getCurrentPersona() : CONFIG.personas[0];
        const track = typeof window.getCurrentTrack === 'function' ? window.getCurrentTrack() : CONFIG.music?.playlist[0];

        const canvas = document.createElement('canvas');
        const W = 1200;
        const H = 675; // 16:9 cinematic aspect ratio
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Deep Midnight Base
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#0a0d18');
        bgGrad.addColorStop(0.5, '#070912');
        bgGrad.addColorStop(1, '#04050a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 2. Ambient Accent Mesh Glow
        const accentColor = persona?.accent || '#38bdf8';
        const accentSecondary = persona?.accentSecondary || '#fb7185';

        const glow1 = ctx.createRadialGradient(250, 200, 20, 250, 200, 450);
        glow1.addColorStop(0, hexToRgba(accentColor, 0.28));
        glow1.addColorStop(1, 'transparent');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, W, H);

        const glow2 = ctx.createRadialGradient(950, 450, 30, 950, 450, 500);
        glow2.addColorStop(0, hexToRgba(accentSecondary, 0.22));
        glow2.addColorStop(1, 'transparent');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, W, H);

        // 3. Decorative Frame Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.strokeRect(32, 32, W - 64, H - 64);

        ctx.strokeStyle = hexToRgba(accentColor, 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Corner brackets
        const cLen = 40;
        // Top-left
        ctx.moveTo(32, 32 + cLen); ctx.lineTo(32, 32); ctx.lineTo(32 + cLen, 32);
        // Top-right
        ctx.moveTo(W - 32 - cLen, 32); ctx.lineTo(W - 32, 32); ctx.lineTo(W - 32, 32 + cLen);
        // Bottom-right
        ctx.moveTo(W - 32, H - 32 - cLen); ctx.lineTo(W - 32, H - 32); ctx.lineTo(W - 32 - cLen, H - 32);
        // Bottom-left
        ctx.moveTo(32 + cLen, H - 32); ctx.lineTo(32, H - 32); ctx.lineTo(32, H - 32 - cLen);
        ctx.stroke();

        // 4. Header Brand
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '600 14px "JetBrains Mono", monospace';
        ctx.fillText('MINKOI STUDIO · DIGITAL IDENTITY', 70, 78);

        ctx.fillStyle = accentColor;
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('PRO5WAIFU-MINKOI.DUCKDNS.ORG', W - 70, 78);
        ctx.textAlign = 'left';

        // 5. Load and Draw Avatar
        const avatarImg = new Image();
        avatarImg.crossOrigin = 'anonymous';
        avatarImg.onload = () => {
            drawCardContent(avatarImg);
        };
        avatarImg.onerror = () => {
            drawCardContent(null);
        };
        avatarImg.src = persona?.avatar || 'assets/avatar_alya.png';

        function drawCardContent(img) {
            // Draw Avatar Circular Frame
            const avX = 180;
            const avY = 280;
            const avR = 90;

            // Halo Rings
            ctx.save();
            ctx.beginPath();
            ctx.arc(avX, avY, avR + 12, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(accentColor, 0.35);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(avX, avY, avR, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (img) {
                ctx.drawImage(img, avX - avR, avY - avR, avR * 2, avR * 2);
            } else {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
            }
            ctx.restore();

            // Status Indicator Dot on Avatar
            ctx.beginPath();
            ctx.arc(avX + 60, avY + 60, 14, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
            ctx.strokeStyle = '#0a0d18';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Creator Name & Handle
            const textStartX = 320;
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 48px "Space Grotesk", sans-serif';
            ctx.fillText(CONFIG.name, textStartX, 230);

            // Verified Badge
            const nameWidth = ctx.measureText(CONFIG.name).width;
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(textStartX + nameWidth + 24, 215, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0a0d18';
            ctx.font = '700 13px sans-serif';
            ctx.fillText('✓', textStartX + nameWidth + 19, 220);

            // Handle & Bio
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.font = '500 18px "JetBrains Mono", monospace';
            ctx.fillText(`${CONFIG.handle} · ${persona?.name || 'Waifu Persona'}`, textStartX, 265);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = '500 20px "Space Grotesk", sans-serif';
            ctx.fillText(persona?.title || CONFIG.bio, textStartX, 305);

            // Waifu Quote Banner
            const quote = persona?.quotes?.[0] || 'Tuturu tôi chỉ muốn bình yên ☺';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            roundRect(ctx, textStartX, 335, 780, 50, 10);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = accentColor;
            ctx.font = 'italic 16px "Space Grotesk", sans-serif';
            ctx.fillText(`“ ${quote} ”`, textStartX + 20, 366);

            // Music Card Sub-panel
            const musicY = 430;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            roundRect(ctx, 70, musicY, W - 140, 140, 16);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.stroke();

            // Vinyl disc icon simulation
            ctx.beginPath();
            ctx.arc(145, musicY + 70, 42, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(145, musicY + 70, 14, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.fill();

            // Music metadata
            ctx.fillStyle = accentColor;
            ctx.font = '700 13px "JetBrains Mono", monospace';
            ctx.fillText('FEATURED SOUNDTRACK', 220, musicY + 48);

            ctx.fillStyle = '#ffffff';
            ctx.font = '700 24px "Space Grotesk", sans-serif';
            ctx.fillText(track ? track.name : '可爱くてごめん', 220, musicY + 80);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.font = '500 16px "JetBrains Mono", monospace';
            ctx.fillText(`${track ? track.artist : 'Alya Kujou'} · Duration ${track ? track.duration : '3:35'}`, 220, musicY + 108);

            // Trigger Download
            try {
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `minkoi-profile-${persona?.key || 'card'}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                link.remove();

                if (typeof window.showToast === 'function') {
                    window.showToast('Đã lưu ảnh hồ sơ thành công!', 'fa-circle-check');
                }
            } catch (err) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Không thể xuất ảnh do quyền truy cập tài nguyên', 'fa-triangle-exclamation');
                }
            }
        }
    }

    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function hexToRgba(hex, alpha) {
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    snapBtn.addEventListener('click', renderSnapshot);
    window.renderProfileCardSnapshot = renderSnapshot;
})();
