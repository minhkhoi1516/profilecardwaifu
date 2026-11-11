/* ========================================================
   MINKOI · BESPOKE DIGITAL IDENTITY & STUDIO CONFIG
   Persona roster + per-persona audio library
======================================================== */
const CONFIG = {
    // Brand & Identity Information
    brand: {
        monogram: "MK",
        logoText: "MINKOI",
        subtitle: "DABBLING & RESEARCHING",
        status: "Available for Projects",
        location: "Vietnam · GMT+7",
        discordId: "" // Nhập Discord User ID (18 số) để tự động kích hoạt Lanyard live status
    },
    name: "MinKoi",
    handle: "@minkoi",
    title: "dabbling and researching",
    bio: "Tuturu tôi chỉ muốn bình yên ☺",

    // ------------------------------------------------------------------
    // PERSONA ROSTER
    // Mỗi persona = 1 avatar + 2 banner PC + 2 banner phone.
    // Quy ước tên file: avatar_<key>.png, banner_<key>_pc.png, banner_<key>_pc2.png,
    //                   banner_<key>_phone.png, banner_<key>_phone2.png
    // ------------------------------------------------------------------
    personas: [
        {
            id: 0,
            key: "alya",
            name: "Alya Kujou",
            role: "Solitary Princess",
            title: "Alya Sometimes Hides Her Feelings in Russian",
            avatar: "assets/avatar_alya.png",
            banners: {
                pc: ["assets/banner_alya_pc.jpg", "assets/banner_alya_pc2.jpg"],
                phone: ["assets/banner_alya_phone.jpg", "assets/banner_alya_phone2.jpg"]
            },
            accent: "#38bdf8",
            accentSecondary: "#f43f5e",
            accentGlow: "rgba(56, 189, 248, 0.28)",
            particleTheme: "snow",
            quotes: [
                "Было бы неплохо... (Nếu như vậy thì tốt biết mấy...)",
                "Ku-ku-ku, đồ ngốc Masachika!",
                "Tớ chỉ nói tiếng Nga khi không muốn ai hiểu thôi nha!"
            ],
            available: true
        },
        {
            id: 1,
            key: "mahiru",
            name: "Shiina Mahiru",
            role: "Angel of Light",
            title: "The Angel Next Door",
            avatar: "assets/avatar_mahiru.png",
            banners: {
                pc: ["assets/banner_mahiru_pc.jpg", "assets/banner_mahiru_pc2.jpg"],
                phone: ["assets/banner_mahiru_phone.jpg", "assets/banner_mahiru_phone2.jpg"]
            },
            accent: "#fbbf24",
            accentSecondary: "#f59e0b",
            accentGlow: "rgba(251, 191, 36, 0.28)",
            particleTheme: "stardust",
            quotes: [
                "Cậu lại lười biếng rồi à, Amane-kun?",
                "Một tách trà ấm cho ngày dài nhé?",
                "Thiên sứ sao? Tớ chỉ là một cô gái bình thường thôi mà."
            ],
            available: true
        },
        {
            id: 2,
            key: "kaoruko",
            name: "Waguri Kaoruko",
            role: "Blooming Camellia",
            title: "The Fragrant Flower Blooms with Dignity",
            avatar: "assets/avatar_kaoruko.png",
            banners: {
                pc: ["assets/banner_kaoruko_pc.jpg", "assets/banner_kaoruko_pc2.jpg"],
                phone: ["assets/banner_kaoruko_phone.jpg", "assets/banner_kaoruko_phone2.jpg"]
            },
            accent: "#fb7185",
            accentSecondary: "#fda4af",
            accentGlow: "rgba(251, 113, 133, 0.28)",
            particleTheme: "sakura",
            quotes: [
                "Bánh ngọt ở tiệm bánh của tớ thơm ngon lắm đấy!",
                "Nụ cười của cậu làm một ngày của tớ sáng bừng lên!",
                "Rintaro-kun, hôm nay cùng nhau cố gắng nhé!"
            ],
            available: true
        },
        {
            id: 3,
            key: "sakuramiku",
            name: "Sakura Miku",
            role: "Spring Blossom Idol",
            title: "Vocaloid Collection",
            avatar: "assets/avatar_sakuramiku.png",
            banners: {
                pc: ["assets/banner_sakuramiku_pc.jpg", "assets/banner_sakuramiku_pc2.jpg"],
                phone: ["assets/banner_sakuramiku_phone.jpg", "assets/banner_sakuramiku_phone2.jpg"]
            },
            accent: "#f472b6",
            accentSecondary: "#fb7185",
            accentGlow: "rgba(244, 114, 182, 0.28)",
            particleTheme: "sakura",
            quotes: [
                "Mùa xuân đến rồi, hoa anh đào nở rộ khắp nơi!",
                "Hãy cùng hòa ca khúc hát của những cánh hoa nhé!",
                "Senbonzakura yoru ni magire~ ✨"
            ],
            available: true
        },
        {
            id: 4,
            key: "shinobu",
            name: "Shinobu Uzuki",
            role: "Midnight Announcer",
            title: "Tune In to the Midnight Heart",
            avatar: "assets/avatar_shinobu.png",
            // Lưu ý: banner dùng tiền tố "shinobuuzuki" theo file gốc của bạn.
            banners: {
                pc: ["assets/banner_shinobuuzuki_pc.jpg", "assets/banner_shinobuuzuki_pc2.jpg"],
                phone: ["assets/banner_shinobuuzuki_phone.jpg", "assets/banner_shinobuuzuki_phone2.jpg"]
            },
            accent: "#a855f7",
            accentSecondary: "#818cf8",
            accentGlow: "rgba(168, 85, 247, 0.28)",
            particleTheme: "twilight",
            quotes: [
                "Trăng đêm nay đẹp lắm đúng không?",
                "Độc dược hay liều thuốc chữa lành, ranh giới thật mong manh.",
                "Moshi mosh~ Cậu có đang lắng nghe giai điệu này không?"
            ],
            available: true
        },
        {
            id: 5,
            key: "hinako",
            name: "Konohana Hinako",
            role: "Midnight Storyteller",
            title: "Tune In to the Midnight Heart",
            avatar: "assets/avatar_hinako.png",
            banners: {
                pc: ["assets/banner_hinako_pc.jpg", "assets/banner_hinako_pc2.jpg"],
                phone: ["assets/banner_hinako_phone.jpg", "assets/banner_hinako_phone2.jpg"]
            },
            accent: "#f9a8d4",
            accentSecondary: "#fb7185",
            accentGlow: "rgba(249, 168, 212, 0.28)",
            particleTheme: "twilight",
            quotes: [
                "Cuốn sách này ẩn chứa một câu chuyện rất đặc biệt...",
                "Hãy để sự tĩnh lặng này xoa dịu tâm hồn cậu.",
                "Tách trà thảo mộc này thơm dịu lắm, cậu thử một ngụm nhé?"
            ],
            available: true
        },
        {
            id: 6,
            key: "umi",
            name: "Asanagi Umi",
            role: "Tide of Dawn",
            title: "Tune In to the Midnight Heart",
            avatar: "assets/avatar_umi.png",
            banners: {
                pc: ["assets/banner_umi_pc.jpg", "assets/banner_umi_pc2.jpg"],
                phone: ["assets/banner_umi_phone.jpg", "assets/banner_umi_phone2.jpg"]
            },
            accent: "#22d3ee",
            accentSecondary: "#0ea5e9",
            accentGlow: "rgba(34, 211, 238, 0.28)",
            particleTheme: "ocean",
            quotes: [
                "Biển sớm mai luôn mang lại cảm giác bình yên nhất...",
                "Đi dạo bờ cát ngắm hoàng hôn với tớ một chút không?",
                "Từng đợt sóng vỗ như đang ngân nga giai điệu của riêng nó vậy."
            ],
            available: true
        },
        {
            id: 7,
            key: "nakanomiku",
            name: "Nakano Miku",
            role: "No. 3 Sister · Headphones",
            title: "The Quintessential Quintuplets",
            avatar: "assets/avatar_nakanomiku.png",
            banners: {
                pc: [
                    "assets/banner_nakanomiku_pc.jpg",
                    "assets/banner_nakanomiku_pc2.jpg",
                    "assets/banner_nakanomiku_pc3.jpg",
                    "assets/banner_nakanomiku_pc4.jpg",
                    "assets/banner_nakanomiku_pc5.jpg"
                ],
                phone: [
                    "assets/banner_nakanomiku_phone.jpg",
                    "assets/banner_nakanomiku_phone2.jpg",
                    "assets/banner_nakanomiku_phone3.jpg",
                    "assets/banner_nakanomiku_phone4.jpg",
                    "assets/banner_nakanomiku_phone5.jpg"
                ]
            },
            accent: "#3b82f6",
            accentSecondary: "#60a5fa",
            accentGlow: "rgba(59, 130, 246, 0.30)",
            particleTheme: "sakura",
            quotes: [
                "Đợi tớ một chút... nếu là cậu thì lúc nào tớ cũng sẵn sàng lắng nghe.",
                "Đeo tai nghe, ngắm mây trôi và nghe lại giai điệu thân quen cũng bình yên lắm.",
                "Không cần vội vàng đâu, từng bước một thôi miễn là mình vẫn đi cùng nhau."
            ],
            available: true
        },
        {
            // Placeholder slot: Add your waifu
            id: 'new-persona',
            key: "new-persona",
            name: "New Persona",
            role: "Waifu Slot",
            title: "Add your waifu",
            avatar: null,
            tracks: [],
            isPlaceholder: true,
            banners: { pc: [], phone: [] },
            accent: "#94a3b8",
            accentSecondary: "#64748b",
            accentGlow: "rgba(148, 163, 184, 0.2)",
            available: false
        }
    ],

    // Backward compatibility references for existing scripts
    get avatars() {
        return this.personas.filter(p => p.available).map(p => p.avatar);
    },
    get waifu() {
        return { list: this.personas.filter(p => p.available) };
    },
    getPersona(key) {
        return this.personas.find(p => p.key === key) || null;
    },

    // ------------------------------------------------------------------
    // AUDIO LIBRARY — 31 track, gắn trực tiếp với persona (key).
    // Spotify links/IDs are reference metadata for identification & matching only.
    // Thêm nhạc mới: copy file vào music/ rồi thêm 1 object vào playlist.
    // ------------------------------------------------------------------
    music: {
        defaultVolume: 45,
        playlist: [
            // --- ALYA KUJOU (4) ---
            { id: 1, persona: "alya", name: "可愛くてごめん (Kawaikute Gomen)", artist: "Alya Kujou", version: "cover", spotifyTrackId: "65ryGOIrCmHQeA2PicsaG1", spotifyUrl: "https://open.spotify.com/intl-vi/track/65ryGOIrCmHQeA2PicsaG1", file: "music/alya_01_Kawaikute_Gomen.mp3", duration: "3:35", durationMs: 215700 },
            { id: 2, persona: "alya", name: "小さな恋のうた (Chiisana Koi no Uta)", artist: "Alya Kujou", version: "cover", spotifyTrackId: "6avvVNDCKYVIIxrZ7TaFKd", spotifyUrl: "https://open.spotify.com/intl-vi/track/6avvVNDCKYVIIxrZ7TaFKd", file: "music/alya_02_Chiisana_Koi_no_Uta.mp3", duration: "4:09", durationMs: 249500 },
            { id: 3, persona: "alya", name: "ワールドイズマイン (World is Mine)", artist: "Alya Kujou", version: "cover", spotifyTrackId: "3iCXXsLMo4ssBOC2Sw5KUO", spotifyUrl: "https://open.spotify.com/intl-vi/track/3iCXXsLMo4ssBOC2Sw5KUO", file: "music/alya_03_World_is_Mine.mp3", duration: "4:12", durationMs: 252600 },
            { id: 4, persona: "alya", name: "CHE.R.RY", artist: "Alya Kujou", version: "cover", spotifyTrackId: "1zNDgdjkZojamiEZQOhI96", spotifyUrl: "https://open.spotify.com/intl-vi/track/1zNDgdjkZojamiEZQOhI96", file: "music/CHE.R.RY.mp3", duration: "3:29", durationMs: 209800 },

            // --- SHIINA MAHIRU (7) ---
            { id: 5, persona: "mahiru", name: "小さな恋のうた (Chiisana Koi no Uta)", artist: "椎名真昼 (CV.石見舞菜香)", version: "cover", spotifyTrackId: "66apUbHsEuKh7IqkKK7OKa", spotifyUrl: "https://open.spotify.com/intl-vi/track/66apUbHsEuKh7IqkKK7OKa", file: "music/angel_01_Chiisana_Koi_no_Uta.mp3", duration: "5:00", durationMs: 300800 },
            { id: 6, persona: "mahiru", name: "うれしい! たのしい! 大好き!", artist: "椎名真昼 (CV.石見舞菜香)", version: "cover", spotifyTrackId: "6endW8r32Uli0oS4ze3BZM", spotifyUrl: "https://open.spotify.com/intl-vi/track/6endW8r32Uli0oS4ze3BZM", file: "music/angel_02_Ai_Uta.mp3", duration: "3:35", durationMs: 215100 },
            { id: 7, persona: "mahiru", name: "小さな恋のうた (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", version: "instrumental", spotifyTrackId: "3sySfIp6t41oxCmTnPsAvB", spotifyUrl: "https://open.spotify.com/intl-vi/track/3sySfIp6t41oxCmTnPsAvB", file: "music/angel_03_Chiisana_Koi_no_Uta_Inst.mp3", duration: "4:24", durationMs: 264800 },
            { id: 8, persona: "mahiru", name: "うれしい! たのしい! 大好き! (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", version: "instrumental", spotifyTrackId: "4ybYQiICGwCe2hbMlnQMCP", spotifyUrl: "https://open.spotify.com/intl-vi/track/4ybYQiICGwCe2hbMlnQMCP", file: "music/angel_04_Ai_Uta_Inst.mp3", duration: "3:33", durationMs: 213200 },
            { id: 9, persona: "mahiru", name: "Kimi ni Todoke (Inst.)", artist: "Iwami Manaka", version: "instrumental", file: "music/angel_05_Kimi_ni_Todoke_Inst.mp3", duration: "5:10", durationMs: 311000 },
            { id: 10, persona: "mahiru", name: "Valentine Kiss (Inst.)", artist: "Iwami Manaka", version: "instrumental", file: "music/angel_06_Valentine_Kiss_Inst.mp3", duration: "3:35", durationMs: 215300 },
            { id: 11, persona: "mahiru", name: "Gift (Inst.)", artist: "Iwami Manaka", version: "instrumental", file: "music/angel_07_Gift_Inst.mp3", duration: "5:28", durationMs: 328800 },

            // --- WAGURI KAORUKO (4) ---
            { id: 12, persona: "kaoruko", name: "ハレの日に (Hare no Hi ni)", artist: "汐れいら (Reira Ushio)", album: "ハレの日に - Harenohini", version: "original", spotifyTrackId: "41bU6Anbt3NPBdGLzpEcal", spotifyUrl: "https://open.spotify.com/intl-vi/track/41bU6Anbt3NPBdGLzpEcal", file: "music/kaoruko_01_Hare_no_Hi_ni.mp3", duration: "4:37", durationMs: 277400 },
            { id: 13, persona: "kaoruko", name: "まなざしは光 (Manazashi wa Hikari)", artist: "キタニタツヤ (Tatsuya Kitani)", album: "まなざしは光", version: "original", spotifyPlaylistUrl: "https://open.spotify.com/playlist/1qp5d7XDTMfoTYwpMgZhe1", file: "music/kaoruko_02_Manazashi_wa_Hikari.mp3", duration: "3:27", durationMs: 207500 },
            { id: 14, persona: "kaoruko", name: "ひとひら (Hitohira)", artist: "原田萌喜 (Kaoru Hana OST)", album: "薫る花は凛と咲く Music Collection", version: "instrumental", spotifyTrackId: "4JIUxHpkvZWNzhQX84fd8q", spotifyUrl: "https://open.spotify.com/intl-vi/track/4JIUxHpkvZWNzhQX84fd8q", file: "music/kaoruko_03_Hitohira.mp3", duration: "4:42", durationMs: 282400 },
            { id: 15, persona: "kaoruko", name: "凛太郎と薫子 (Rintaro to Kaoruko)", artist: "原田萌喜 (Kaoru Hana OST)", album: "薫る花は凛と咲く Music Collection", version: "instrumental", spotifyTrackId: "2C2SxTwvnaVqzWBsAxGXlI", spotifyUrl: "https://open.spotify.com/intl-vi/track/2C2SxTwvnaVqzWBsAxGXlI", file: "music/kaoruko_04_Rintaro_to_Kaoruko.mp3", duration: "1:38", durationMs: 98000 },

            // --- SAKURA MIKU (2) ---
            { id: 16, persona: "sakuramiku", name: "君のせいで愛してる (Kimi no Sei de Aishiteru)", artist: "CHiCO with HoneyWorks", version: "original", spotifyTrackId: "1SsnLip8KKG2aYsXlGH29n", spotifyUrl: "https://open.spotify.com/intl-vi/track/1SsnLip8KKG2aYsXlGH29n", file: "music/sakuramiku_01_Kimi_no_Sei_de_Aishiteru.mp3", duration: "3:51", durationMs: 231200 },
            { id: 17, persona: "sakuramiku", name: "リトルワールド (Little World)", artist: "PompadollS", album: "リトルワールド", version: "original", spotifyTrackId: "1cflsQcGcOcL7gkZaPyiYm", spotifyUrl: "https://open.spotify.com/intl-vi/track/1cflsQcGcOcL7gkZaPyiYm", file: "music/sakuramiku_02_Little_World.mp3", duration: "3:08", durationMs: 188300 },

            // --- SHINOBU UZUKI (2) ---
            { id: 18, persona: "shinobu", name: "月に向かって撃て (Tsuki ni Mukatte Ute)", artist: "星街すいせい (Hoshimachi Suisei)", album: "月に向かって撃て", version: "original", spotifyTrackId: "2aQpmTVc26tkNVChUYzZcS", spotifyUrl: "https://open.spotify.com/intl-vi/track/2aQpmTVc26tkNVChUYzZcS", file: "music/shinobu_01_Tsuki_ni_Mukatte_Ute.mp3", duration: "3:15", durationMs: 196000 },
            { id: 19, persona: "shinobu", name: "声の軌跡 (Koe no Kiseki)", artist: "Soala", album: "声の軌跡", version: "original", spotifyTrackId: "0N5YLuTIySy1APi9rmSGfj", spotifyUrl: "https://open.spotify.com/intl-vi/track/0N5YLuTIySy1APi9rmSGfj", file: "music/shinobu_02_Koe_no_Kiseki.mp3", duration: "3:19", durationMs: 199200 },

            // --- KONOHANA HINAKO (2) ---
            { id: 20, persona: "hinako", name: "最最最高級のお世話して (Saishuu Saikoukyuu no Osewa Shite)", artist: "angela", version: "original", spotifyTrackId: "1YorQpcRAhINKp06fy1Kcc", spotifyUrl: "https://open.spotify.com/intl-vi/track/1YorQpcRAhINKp06fy1Kcc", file: "music/hinako_01_Saikoukyuu_no_Osewa_Shite.mp3", duration: "3:14", durationMs: 194200 },
            { id: 21, persona: "hinako", name: "完璧じゃないわたし (Kanpeki ja Nai Watashi)", artist: "前島亜美 (Ami Maeshima)", version: "original", spotifyTrackId: "2guDoM8CAJKx1cQwNFSPW5", spotifyUrl: "https://open.spotify.com/intl-vi/track/2guDoM8CAJKx1cQwNFSPW5", file: "music/hinako_02_Kanpeki_ja_Nai_Watashi.mp3", duration: "3:36", durationMs: 216800 },

            // --- ASANAGI UMI (2) ---
            { id: 22, persona: "umi", name: "Submarine Youth (サブマリンユース)", artist: "reGretGirl", album: "サブマリンユース", version: "original", spotifyTrackId: "3EAaR5AFd8T1HmAP3dPIXG", spotifyUrl: "https://open.spotify.com/intl-vi/track/3EAaR5AFd8T1HmAP3dPIXG", file: "music/Submarine_Youth.mp3", duration: "3:27", durationMs: 207200 },
            { id: 23, persona: "umi", name: "ずっと1番にしてね (Zutto Ichibanni Shitene)", artist: "コレサワ (Koresawa)", album: "Zutto Ichibanni Shitene", version: "original", spotifyTrackId: "3ri04N6NuypwN9Ol75erjh", spotifyUrl: "https://open.spotify.com/intl-vi/track/3ri04N6NuypwN9Ol75erjh", file: "music/Zutto_Ichibanni_Shitene.mp3", duration: "3:33", durationMs: 213200 },

            // --- NAKANO MIKU / GOTOUBUN NO HANAYOME (8) ---
            { id: 24, persona: "nakanomiku", name: "五等分の気持ち (Gotoubun no Kimochi)", artist: "中野家の五つ子 (Nakanoke no Itsutsugo)", version: "original", spotifyTrackId: "1eAA4GuypDccaOjlbt6HbR", spotifyUrl: "https://open.spotify.com/intl-vi/track/1eAA4GuypDccaOjlbt6HbR", file: "music/五等分の気持ち.mp3", duration: "3:42", durationMs: 222300 },
            { id: 25, persona: "nakanomiku", name: "五等分のカタチ (Gotoubun no Katachi)", artist: "中野家の五つ子", album: "Gotobun no Katachi / Hatsukoi", version: "original", spotifyTrackId: "65PuzBFJgF95D4PqYOqghD", spotifyUrl: "https://open.spotify.com/intl-vi/track/65PuzBFJgF95D4PqYOqghD", file: "music/五等分のカタチ.mp3", duration: "4:03", durationMs: 243800 },
            { id: 26, persona: "nakanomiku", name: "はつこい (Hatsukoi)", artist: "中野家の五つ子 (Nakanoke no Itsutsugo)", version: "original", spotifyTrackId: "7FYUMfQhtdm5AJRfU699sB", spotifyUrl: "https://open.spotify.com/intl-vi/track/7FYUMfQhtdm5AJRfU699sB", file: "music/はつこい.mp3", duration: "5:14", durationMs: 314600 },
            { id: 27, persona: "nakanomiku", name: "五等分の花嫁～ありがとうの花～", artist: "中野家の五つ子 (Nakanoke no Itsutsugo)", version: "original", spotifyTrackId: "4K6HYm0ZSWCZLGDun4d3eO", spotifyUrl: "https://open.spotify.com/intl-vi/track/4K6HYm0ZSWCZLGDun4d3eO", file: "music/五等分の花嫁～ありがとうの花～.mp3", duration: "3:31", durationMs: 211100 },
            { id: 28, persona: "nakanomiku", name: "Lovely Music ～三週間前までは白かった～", artist: "中野三玖 (CV: 伊藤美来)", album: "\"Gotoubun no Hanayome\" Character Song Mini Album", version: "original", spotifyTrackId: "4qfOkZAA93DYXVtoX3HvQq", spotifyUrl: "https://open.spotify.com/intl-vi/track/4qfOkZAA93DYXVtoX3HvQq", file: "music/Lovely music～三週間前までは白かった～_.mp3", duration: "4:02", durationMs: 242700 },
            { id: 29, persona: "nakanomiku", name: "Memories", artist: "中野家の五つ子", album: "Quintuplets' smiles EP", version: "original", spotifyTrackId: "06rAZ8mIHj3zZw1AHnY5PA", spotifyUrl: "https://open.spotify.com/intl-vi/track/06rAZ8mIHj3zZw1AHnY5PA", file: "music/Memories.mp3", duration: "4:01", durationMs: 241000 },
            { id: 30, persona: "nakanomiku", name: "たからもの (Takaramono)", artist: "中野家の五つ子 (Nakanoke no Itsutsugo)", version: "original", spotifyTrackId: "2bBLhWh9r1weUROfi5ccfZ", spotifyUrl: "https://open.spotify.com/intl-vi/track/2bBLhWh9r1weUROfi5ccfZ", file: "music/たからもの.mp3", duration: "3:27", durationMs: 207300 },
            { id: 31, persona: "nakanomiku", name: "五等分の未来 (Gotoubun no Mirai)", artist: "中野家の五つ子 (Nakanoke no Itsutsugo)", version: "original", spotifyTrackId: "12h3LPkwdUHCyx68fHVG1t", spotifyUrl: "https://open.spotify.com/intl-vi/track/12h3LPkwdUHCyx68fHVG1t", file: "music/五等分の未来.mp3", duration: "3:39", durationMs: 219700 }
        ]
    },

    // Studio 5-Band Audio Equalizer Presets
    audioFx: {
        presets: [
            { id: "hifi", name: "Studio Reference", icon: "fa-headphones", desc: "Cân bằng phẳng tiêu chuẩn (Flat Bypass)", gains: [0, 0, 0, 0, 0] },
            { id: "bass", name: "Super Bass Boost", icon: "fa-bolt", desc: "Tăng cường âm trầm & lực đập kick (+7dB)", gains: [7, 4, 0, 1, 2] },
            { id: "vocal", name: "Anime Idol Vocal", icon: "fa-microphone", desc: "Tôn giọng hát trong trẻo ngọt ngào (+5dB Mid)", gains: [1, -1, 5, 4, 2] },
            { id: "acoustic", name: "Acoustic & Piano", icon: "fa-guitar", desc: "Dịu êm, mộc mạc cho nhạc cụ hòa tấu", gains: [2, 3, 0, 3, 4] },
            { id: "nightcore", name: "Crystal Treble", icon: "fa-sparkles", desc: "Âm bổng trong vắt, sắc nét & sôi động", gains: [-3, 0, 2, 6, 7] },
            { id: "lofi", name: "Lo-Fi Vintage Tape", icon: "fa-record-vinyl", desc: "Ấm áp, cắt bớt tần số chói phong cách hoài niệm", gains: [-2, 4, 2, -4, -8] }
        ]
    },

    // Social Links
    social: [
        { key: "discord", name: "Discord", handle: "minhkhoi_1516", url: "https://discord.com/users/minhkhoi_1516", icon: "fab fa-discord" },
        { key: "github", name: "GitHub", handle: "minhkhoi1516", url: "https://github.com/minhkhoi1516", icon: "fab fa-github" },
        { key: "tiktok", name: "TikTok", handle: "@minhkhoi_141209", url: "https://www.tiktok.com/@minhkhoi_141209", icon: "fab fa-tiktok" }
    ]
};

if (typeof window !== 'undefined') window.CONFIG = CONFIG;
else if (typeof globalThis !== 'undefined') globalThis.CONFIG = CONFIG;
