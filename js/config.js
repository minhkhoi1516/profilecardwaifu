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
            available: true
        },
        {
            // Slot trống: hiện chip mờ "Coming Soon", bấm vào không làm gì.
            id: 7,
            key: "coming",
            name: "Coming Soon",
            role: "New Persona",
            title: "Slot đang chờ waifu tiếp theo",
            avatar: "",
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
            { id: 1, persona: "alya", name: "可愛くてごめん (Kawaikute Gomen)", artist: "Alya Kujou", file: "music/可愛くてごめん.mp3", duration: "3:35" },
            { id: 2, persona: "alya", name: "小さな恋のうた (Chiisana Koi no Uta)", artist: "Alya Kujou", file: "music/小さな恋のうた.mp3", duration: "4:09" },
            { id: 3, persona: "alya", name: "ワールドイズマイン (World is Mine)", artist: "Alya Kujou", file: "music/ワールドイズマイン.mp3", duration: "4:12" },
            { id: 4, persona: "alya", name: "CHE.R.RY", artist: "Alya Kujou", file: "music/CHE.R.RY.mp3", duration: "3:29" },

            // --- SHIINA MAHIRU (7) ---
            { id: 5, persona: "mahiru", name: "Chiisana Koi no Uta", artist: "Iwami Manaka", file: "music/angel_01_Chiisana_Koi_no_Uta.mp3", duration: "5:00" },
            { id: 6, persona: "mahiru", name: "Ai Uta", artist: "Iwami Manaka", file: "music/angel_02_Ai_Uta.mp3", duration: "3:35" },
            { id: 7, persona: "mahiru", name: "Chiisana Koi no Uta (Inst.)", artist: "Iwami Manaka", file: "music/angel_03_Chiisana_Koi_no_Uta_Inst.mp3", duration: "4:24" },
            { id: 8, persona: "mahiru", name: "Ai Uta (Inst.)", artist: "Iwami Manaka", file: "music/angel_04_Ai_Uta_Inst.mp3", duration: "3:33" },
            { id: 9, persona: "mahiru", name: "Kimi ni Todoke (Inst.)", artist: "Iwami Manaka", file: "music/angel_05_Kimi_ni_Todoke_Inst.mp3", duration: "5:10" },
            { id: 10, persona: "mahiru", name: "Valentine Kiss (Inst.)", artist: "Iwami Manaka", file: "music/angel_06_Valentine_Kiss_Inst.mp3", duration: "3:35" },
            { id: 11, persona: "mahiru", name: "Gift (Inst.)", artist: "Iwami Manaka", file: "music/angel_07_Gift_Inst.mp3", duration: "5:28" },

            // --- WAGURI KAORUKO (4) ---
            { id: 12, persona: "kaoruko", name: "ハレの日に (Hare no Hi ni)", artist: "Waguri Kaoruko", file: "music/ハレの日に - Harenohini.mp3", duration: "4:37" },
            { id: 13, persona: "kaoruko", name: "まなざしは光 (Manazashi wa Hikari)", artist: "Waguri Kaoruko", file: "music/まなざしは光.mp3", duration: "3:27" },
            { id: 14, persona: "kaoruko", name: "ひとひら (Hitohira)", artist: "Waguri Kaoruko", file: "music/ひとひら.mp3", duration: "4:42" },
            { id: 15, persona: "kaoruko", name: "凛太郎と薫子 (Rintaro to Kaoruko)", artist: "Waguri Kaoruko", file: "music/凛太郎と薫子.mp3", duration: "1:38" },

            // --- SAKURA MIKU (2) ---
            { id: 16, persona: "sakuramiku", name: "君のせいで愛してる (Kimi no Sei de Aishiteru)", artist: "Sakura Miku", file: "music/君のせいで愛してる.mp3", duration: "3:51" },
            { id: 17, persona: "sakuramiku", name: "リトルワールド (Little World)", artist: "Sakura Miku", file: "music/リトルワールド.mp3", duration: "3:08" },

            // --- SHINOBU UZUKI (2) ---
            { id: 18, persona: "shinobu", name: "月に向かって撃て (Tsuki ni Mukatte Ute)", artist: "Shinobu Uzuki", file: "music/月に向かって撃て.mp3", duration: "3:15" },
            { id: 19, persona: "shinobu", name: "声の軌跡 (Koe no Kiseki)", artist: "Shinobu Uzuki", file: "music/声の軌跡.mp3", duration: "3:19" },

            // --- KONOHANA HINAKO (2) ---
            { id: 20, persona: "hinako", name: "最最最高級のお世話して (Saishuu Saikoukyuu no Osewa Shite)", artist: "Konohana Hinako", file: "music/最最最高級のお世話して.mp3", duration: "3:14" },
            { id: 21, persona: "hinako", name: "完璧じゃないわたし (Kanpeki ja Nai Watashi)", artist: "Konohana Hinako", file: "music/完璧じゃないわたし.mp3", duration: "3:36" },

            // --- ASANAGI UMI (2) ---
            { id: 22, persona: "umi", name: "Submarine Youth", artist: "Asanagi Umi", file: "music/Submarine_Youth.mp3", duration: "3:27" },
            { id: 23, persona: "umi", name: "Zutto Ichibanni Shitene", artist: "Asanagi Umi", file: "music/Zutto_Ichibanni_Shitene.mp3", duration: "3:33" }
        ]
    },

    // Audio Equalizer Presets
    audioFx: {
        presets: [
            { id: "hifi", name: "Studio Reference", icon: "fa-headphones", desc: "Transparent, linear studio response" },
            { id: "bass", name: "Low-End Warmth", icon: "fa-bolt", desc: "Enhanced analog sub-bass (+6dB)" },
            { id: "lofi", name: "Lo-Fi Tape", icon: "fa-record-vinyl", desc: "Vintage warmth & rolled-off highs" },
            { id: "vocal", name: "Acoustic Presence", icon: "fa-microphone", desc: "Forward vocal clarity & articulation" }
        ]
    },

    // Social Links
    social: [
        { key: "discord", name: "Discord", handle: "minhkhoi_1516", url: "https://discord.com/minhkhoi_1516/", icon: "fab fa-discord" },
        { key: "github", name: "GitHub", handle: "minhkhoi1516", url: "https://github.com/minhkhoi1516", icon: "fab fa-github" },
        { key: "tiktok", name: "TikTok", handle: "@minhkhoi_141209", url: "https://tiktok.com/@minhkhoi_141209", icon: "fab fa-tiktok" }
    ]
};
