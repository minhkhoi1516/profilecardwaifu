/* ========================================================
   MINKOI · SYNCHRONIZED LYRICS ENGINE
   Real-time Karaoke & Lyrics Viewer with Interactive Seeking
======================================================== */
(function() {
    'use strict';

    const LYRICS_DATABASE = {
        // Track 1: 可愛くてごめん (Kawaikute Gomen) - Alya Kujou
        1: {
            title: "可愛くてごめん (Kawaikute Gomen)",
            artist: "Alya Kujou",
            lines: [
                { time: 1, text: "Watashi ga watashi no koto wo aishite" },
                { time: 5, text: "Nani ga warui no? Shitto desu ka?" },
                { time: 9, text: "Daitai jibun migaki mo shinai kuse ni" },
                { time: 13, text: "Chu! Kawaikute gomen" },
                { time: 16, text: "Umarete kichatte gomen" },
                { time: 19, text: "Chu! Azatokute gomen" },
                { time: 22, text: "Ki ni nacchau yo ne? Gomen!" },
                { time: 26, text: "Chu! Kawaikute gomen" },
                { time: 29, text: "Doryoku shichatte gomen" },
                { time: 32, text: "Chu! Toutokute gomen" },
                { time: 35, text: "Joshiryoku takakute gomen" },
                { time: 39, text: "Mukatsuku desho? Zamaa!" },
                { time: 45, text: "Suki na fuku wo kite, suki na meiku shite" },
                { time: 51, text: "Kagami no mae de 'Kyou mo kawaii' tte hohoemu no" },
                { time: 58, text: "Dareka no me nante ki ni shiterarenai" },
                { time: 64, text: "Watashi no jinsei watashi ga shuyaku nano!" },
                { time: 71, text: "Chu! Kawaikute gomen" },
                { time: 74, text: "Umarete kichatte gomen" },
                { time: 77, text: "Chu! Azatokute gomen" },
                { time: 80, text: "Ikiteru dake de gomen!" }
            ]
        },

        // Track 2: 小さな恋のうた (Chiisana Koi no Uta) - Alya Kujou
        2: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "Alya Kujou",
            lines: [
                { time: 1, text: "Hiroi uchuu no kazu aru hitotsu" },
                { time: 7, text: "Aoi chikyuu no hiroi sekai de" },
                { time: 14, text: "Chiisana koi no omoi wa todoku" },
                { time: 20, text: "Chiisana shima no anata no moto e" },
                { time: 27, text: "Anata to deai toki wa nagareru" },
                { time: 34, text: "Omoi wo kometa tegami mo fueru" },
                { time: 41, text: "Itsushika futari tagai ni hibiku" },
                { time: 47, text: "Tokini hageshiku tokini setsunaku" },
                { time: 55, text: "Hibiku omoi wa tooku haruka e" },
                { time: 61, text: "Yasashii uta wa sekai wo kaeru" },
                { time: 68, text: "Hora anata ni totte daiji na hito hodo" },
                { time: 75, text: "Sugu soba ni iru no" },
                { time: 82, text: "Tada anata ni dake todoite hoshii" },
                { time: 88, text: "Hibike koi no uta" }
            ]
        },

        // Track 3: ワールドイズマイン (World is Mine) - Alya Kujou
        3: {
            title: "ワールドイズマイン (World is Mine)",
            artist: "Alya Kujou",
            lines: [
                { time: 2, text: "Sekai de ichiban ohimesama" },
                { time: 6, text: "Sou iu atsukai kokoroe te yo ne" },
                { time: 11, text: "Sono ichi, itsumo to chigau kamigata ni kigatsuite" },
                { time: 17, text: "Sono ni, chanto kutsu made mirukoto, ii ne?" },
                { time: 23, text: "Sono san, watashi no hitokoto ni wa mittsu no kotoba de henji surukoto" },
                { time: 30, text: "Wakattara migite ga orusu nano wo nantoka shite!" },
                { time: 37, text: "Betsu ni wagamama nante itte naindakara" },
                { time: 44, text: "Kimi ni kokoro kara 'kawaii' tte" },
                { time: 50, text: "Omotte hoshii dake nano!" }
            ]
        },

        // Track 4: CHE.R.RY - Alya Kujou
        4: {
            title: "CHE.R.RY",
            artist: "Alya Kujou",
            lines: [
                { time: 1, text: "Kimi no koe ga kikoeta ki ga shite" },
                { time: 6, text: "Futo furikaetta kaerimichi" },
                { time: 12, text: "Koishichatta n da tabun kidzuite nai deshou?" },
                { time: 20, text: "Honno sukoshi no yuuki ga nakute" },
                { time: 26, text: "Meru no ichigyou ni nayanderu no" },
                { time: 33, text: "Amai amai cherry no you na" },
                { time: 40, text: "Hajimete no kimochi wo anata ni" }
            ]
        },

        // Track 5: Chiisana Koi no Uta - Shiina Mahiru
        5: {
            title: "Chiisana Koi no Uta",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 2, text: "Hiroi uchuu no kazu aru hitotsu" },
                { time: 8, text: "Aoi chikyuu no hiroi sekai de" },
                { time: 15, text: "Chiisana koi no omoi wa todoku" },
                { time: 22, text: "Chiisana shima no anata no moto e" },
                { time: 30, text: "Anata ga kureta yasashii jikan" },
                { time: 38, text: "Tonari de sotto hohoende kureta" },
                { time: 46, text: "Hora anata ni totte daiji na hito hodo" },
                { time: 54, text: "Sugu soba ni iru no" }
            ]
        },

        // Track 6: Ai Uta - Shiina Mahiru
        6: {
            title: "Ai Uta (愛唄)",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 1, text: "Nee, daisuki na kimi e" },
                { time: 5, text: "Waratte naide kiite hoshii" },
                { time: 10, text: "'Aishiteru' da nante kusai kedo ne" },
                { time: 16, text: "Dakedo kono kimochi wa hontou nanda" },
                { time: 24, text: "Tada naki, warai, sugosu hibi ni" },
                { time: 32, text: "Tonari ni kimi ga ite kurete arigatou" }
            ]
        },

        // Track 12: ハレの日に (Hare no Hi ni) - Waguri Kaoruko
        12: {
            title: "ハレの日に (Hare no Hi ni)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 2, text: "Asahi ga sashikomu madobe de" },
                { time: 8, text: "Atarashii kyou ga hajimaru" },
                { time: 15, text: "Amaku kaoru yakitate no keeki to" },
                { time: 22, text: "Kimi no egao ga areba sore de ii" },
                { time: 30, text: "Hare no hi ni咲ku hana no you ni" },
                { time: 38, text: "Massugu ni kimi wo mitsumeteitai" }
            ]
        },

        // Track 16: 君のせいで愛してる - Sakura Miku
        16: {
            title: "君のせいで愛してる (Kimi no Sei de Aishiteru)",
            artist: "Sakura Miku",
            lines: [
                { time: 2, text: "Harukaze ga fukinukeru machi de" },
                { time: 8, text: "Sakura no hanabira ga maiodoru" },
                { time: 16, text: "Kimi no sei de mune ga kurushiku naru" },
                { time: 24, text: "Kimi no sei de konna ni aishiteru!" }
            ]
        },

        // Track 22: Submarine Youth - Asanagi Umi
        22: {
            title: "Submarine Youth",
            artist: "Asanagi Umi",
            lines: [
                { time: 2, text: "Aoi umi no soko made mogurikonde" },
                { time: 8, text: "Futari dake no himitsu wo sagashini ikou" },
                { time: 16, text: "Nami no oto ga kokoro wo tsutsundeiku" },
                { time: 25, text: "Kono natsu wa zutto owaranai ki ga shita" }
            ]
        },

        // Track 23: Zutto Ichibanni Shitene - Asanagi Umi
        23: {
            title: "Zutto Ichibanni Shitene",
            artist: "Asanagi Umi",
            lines: [
                { time: 2, text: "Dare yori mo ichiban chikaku de" },
                { time: 8, text: "Kimi no koto wo mitsumeteiru kara" },
                { time: 16, text: "Zutto ichiban ni shite ne?" },
                { time: 24, text: "Yakusoku da yo, kono umi no mae de" }
            ]
        }
    };

    const lyricsModal = document.getElementById('lyrics-modal');
    const lyricsTitle = document.getElementById('lyrics-title');
    const lyricsArtist = document.getElementById('lyrics-artist');
    const lyricsBody = document.getElementById('lyrics-body');
    const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
    const lyricsToggleBtn = document.getElementById('lyrics-toggle-btn');
    const audio = document.getElementById('audio-player');

    let currentLyricsTrackId = null;
    let activeLineIndex = -1;

    function getTrackId() {
        const idx = typeof window.getCurrentTrackIndex === 'function' ? window.getCurrentTrackIndex() : 0;
        const playlist = CONFIG.music?.playlist || [];
        return playlist[idx]?.id || 1;
    }

    function renderLyrics(trackId) {
        if (!lyricsBody) return;
        currentLyricsTrackId = trackId;
        activeLineIndex = -1;

        const data = LYRICS_DATABASE[trackId];
        const playlist = CONFIG.music?.playlist || [];
        const track = playlist.find(t => t.id === trackId) || playlist[0];

        if (lyricsTitle) lyricsTitle.textContent = data ? data.title : (track ? track.name : 'Lời bài hát');
        if (lyricsArtist) lyricsArtist.textContent = data ? data.artist : (track ? track.artist : 'MinKoi Studio');

        if (!data || !data.lines || data.lines.length === 0) {
            lyricsBody.innerHTML = `
                <div class="lyrics-placeholder">
                    <i class="fas fa-music"></i>
                    <p class="placeholder-title">Giai điệu không lời hoặc đang cập nhật lời bài hát</p>
                    <p class="placeholder-sub">Hãy thả lỏng và tận hưởng âm thanh êm dịu cùng MinKoi Studio ✨</p>
                </div>
            `;
            return;
        }

        lyricsBody.innerHTML = data.lines.map((line, idx) => `
            <div class="lyric-line" data-index="${idx}" data-time="${line.time}" role="button" tabindex="0">
                <span class="lyric-time">${formatLyricTime(line.time)}</span>
                <span class="lyric-text">${line.text}</span>
            </div>
        `).join('');

        lyricsBody.querySelectorAll('.lyric-line').forEach(lineEl => {
            lineEl.addEventListener('click', () => {
                const seekTime = parseFloat(lineEl.dataset.time);
                if (audio && !isNaN(seekTime)) {
                    audio.currentTime = seekTime;
                    if (audio.paused) audio.play();
                }
            });
        });
    }

    function formatLyricTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function syncLyricsPlayback() {
        if (!lyricsModal || !lyricsModal.classList.contains('open') || !audio) return;
        const data = LYRICS_DATABASE[currentLyricsTrackId];
        if (!data || !data.lines) return;

        const curTime = audio.currentTime;
        let newIndex = -1;

        for (let i = 0; i < data.lines.length; i++) {
            if (curTime >= data.lines[i].time) {
                newIndex = i;
            } else {
                break;
            }
        }

        if (newIndex !== activeLineIndex) {
            activeLineIndex = newIndex;
            const lines = lyricsBody.querySelectorAll('.lyric-line');
            lines.forEach((l, idx) => {
                const isActive = idx === activeLineIndex;
                l.classList.toggle('active', isActive);
                if (isActive) {
                    l.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    function openLyrics() {
        if (!lyricsModal) return;
        const trackId = getTrackId();
        renderLyrics(trackId);
        lyricsModal.classList.add('open');
        if (lyricsToggleBtn) lyricsToggleBtn.classList.add('active');
        if (typeof window.playChimeSFX === 'function') window.playChimeSFX();
    }

    function closeLyrics() {
        if (!lyricsModal) return;
        lyricsModal.classList.remove('open');
        if (lyricsToggleBtn) lyricsToggleBtn.classList.remove('active');
    }

    function toggleLyrics() {
        if (lyricsModal?.classList.contains('open')) {
            closeLyrics();
        } else {
            openLyrics();
        }
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

    if (audio) {
        audio.addEventListener('timeupdate', syncLyricsPlayback);
    }

    // When track changes, update lyrics if modal is open
    window.addEventListener('minkoi:trackchange', (e) => {
        const id = e.detail?.track?.id;
        if (lyricsModal?.classList.contains('open') && id) {
            renderLyrics(id);
        }
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lyricsModal?.classList.contains('open')) {
            closeLyrics();
        }
    });

    window.toggleLyrics = toggleLyrics;
    window.openLyrics = openLyrics;
    window.closeLyrics = closeLyrics;
})();
