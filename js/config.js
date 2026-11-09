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
    // AUDIO LIBRARY — 23 track, gắn trực tiếp với persona (key).
    // Thêm nhạc mới: copy file vào music/ rồi thêm 1 object vào playlist.
    // ------------------------------------------------------------------
    music: {
        defaultVolume: 45,
        playlist: [
            // --- ALYA KUJOU (4) ---
            { id: 1, persona: "alya", name: "可愛くてごめん (Kawaikute Gomen)", artist: "Alya Kujou", file: "music/alya_01_Kawaikute_Gomen.mp3", duration: "3:35" },
            { id: 2, persona: "alya", name: "小さな恋のうた (Chiisana Koi no Uta)", artist: "Alya Kujou", file: "music/alya_02_Chiisana_Koi_no_Uta.mp3", duration: "4:09" },
            { id: 3, persona: "alya", name: "ワールドイズマイン (World is Mine)", artist: "Alya Kujou", file: "music/alya_03_World_is_Mine.mp3", duration: "4:12" },
            { id: 4, persona: "alya", name: "CHE.R.RY", artist: "Alya Kujou", file: "music/CHE.R.RY.mp3", duration: "3:29" },

            // --- SHIINA MAHIRU (7) ---
            { id: 5, persona: "mahiru", name: "小さな恋のうた (Chiisana Koi no Uta)", artist: "椎名真昼 (CV.石見舞菜香)", file: "music/angel_01_Chiisana_Koi_no_Uta.mp3", duration: "5:00" },
            { id: 6, persona: "mahiru", name: "うれしい! たのしい! 大好き!", artist: "椎名真昼 (CV.石見舞菜香)", file: "music/angel_02_Ai_Uta.mp3", duration: "3:35" },
            { id: 7, persona: "mahiru", name: "小さな恋のうた (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", file: "music/angel_03_Chiisana_Koi_no_Uta_Inst.mp3", duration: "4:24" },
            { id: 8, persona: "mahiru", name: "うれしい! たのしい! 大好き! (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", file: "music/angel_04_Ai_Uta_Inst.mp3", duration: "3:33" },
            { id: 9, persona: "mahiru", name: "Kimi ni Todoke (Inst.)", artist: "Iwami Manaka", file: "music/angel_05_Kimi_ni_Todoke_Inst.mp3", duration: "5:10" },
            { id: 10, persona: "mahiru", name: "Valentine Kiss (Inst.)", artist: "Iwami Manaka", file: "music/angel_06_Valentine_Kiss_Inst.mp3", duration: "3:35" },
            { id: 11, persona: "mahiru", name: "Gift (Inst.)", artist: "Iwami Manaka", file: "music/angel_07_Gift_Inst.mp3", duration: "5:28" },

            // --- WAGURI KAORUKO (4) ---
            { id: 12, persona: "kaoruko", name: "ハレの日に (Hare no Hi ni)", artist: "汐れいら (Reira Ushio)", file: "music/kaoruko_01_Hare_no_Hi_ni.mp3", duration: "4:37" },
            { id: 13, persona: "kaoruko", name: "まなざしは光 (Manazashi wa Hikari)", artist: "原田萌喜 (Kaoru Hana OST)", file: "music/kaoruko_02_Manazashi_wa_Hikari.mp3", duration: "3:27" },
            { id: 14, persona: "kaoruko", name: "ひとひら (Hitohira)", artist: "原田萌喜 (Kaoru Hana OST)", file: "music/kaoruko_03_Hitohira.mp3", duration: "4:42" },
            { id: 15, persona: "kaoruko", name: "偏見と葛藤 (Henken to Kattou)", artist: "原田萌喜 (Kaoru Hana OST)", file: "music/kaoruko_04_Rintaro_to_Kaoruko.mp3", duration: "1:37" },

            // --- SAKURA MIKU (2) ---
            { id: 16, persona: "sakuramiku", name: "君のせいで愛してる (Kimi no Sei de Aishiteru)", artist: "CHiCO with HoneyWorks", file: "music/sakuramiku_01_Kimi_no_Sei_de_Aishiteru.mp3", duration: "3:51" },
            { id: 17, persona: "sakuramiku", name: "リトルワールド (Little World)", artist: "PompadollS", file: "music/sakuramiku_02_Little_World.mp3", duration: "3:08" },

            // --- SHINOBU UZUKI (2) ---
            { id: 18, persona: "shinobu", name: "月に向かって撃て (Tsuki ni Mukatte Ute)", artist: "星街すいせい (Hoshimachi Suisei)", file: "music/shinobu_01_Tsuki_ni_Mukatte_Ute.mp3", duration: "3:15" },
            { id: 19, persona: "shinobu", name: "声の軌跡 (Koe no Kiseki)", artist: "Soala", file: "music/shinobu_02_Koe_no_Kiseki.mp3", duration: "3:19" },

            // --- KONOHANA HINAKO (2) ---
            { id: 20, persona: "hinako", name: "最最最高級のお世話して (Saishuu Saikoukyuu no Osewa Shite)", artist: "angela", file: "music/hinako_01_Saikoukyuu_no_Osewa_Shite.mp3", duration: "3:14" },
            { id: 21, persona: "hinako", name: "完璧じゃないわたし (Kanpeki ja Nai Watashi)", artist: "前島亜美 (Ami Maeshima)", file: "music/hinako_02_Kanpeki_ja_Nai_Watashi.mp3", duration: "3:36" },

            // --- ASANAGI UMI (2) ---
            { id: 22, persona: "umi", name: "Submarine Youth (サブマリンユース)", artist: "reGretGirl", file: "music/Submarine_Youth.mp3", duration: "3:27" },
            { id: 23, persona: "umi", name: "ずっと1番にしてね (Zutto Ichibanni Shitene)", artist: "コレサワ (Koresawa)", file: "music/Zutto_Ichibanni_Shitene.mp3", duration: "3:33" }
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
