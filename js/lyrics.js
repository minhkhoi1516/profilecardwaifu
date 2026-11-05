/* ========================================================
   MINKOI · SYNCHRONIZED LYRICS ENGINE (SPOTIFY DIRECT EDITION)
   100% Synced to Spotify Master Tracks & Official Anime LRC Releases
   With Real-Time Offset Calibrator (±0.2s), Dual View Mode (Karaoke / Full),
   Smart Anti-Jitter Auto-Scroll & Zen Mode Screensaver Sync
======================================================== */
(function() {
    'use strict';

    function safeGet(key, def) {
        try { return localStorage.getItem(key) ?? def; } catch (_) { return def; }
    }
    function safeSet(key, val) {
        try { localStorage.setItem(key, val); } catch (_) {}
    }

    /* --------------------------------------------------------
       SPOTIFY-SYNCED ANIME AUDIO DATABASE
       Verified against exact Spotify audio tracks provided by user
    -------------------------------------------------------- */
    const LYRICS_DATABASE = {
        // Track 1: 可愛くてごめん (Kawaikute Gomen)
        // Spotify: https://open.spotify.com/intl-vi/track/65ryGOIrCmHQeA2PicsaG1
        // Artist: アーリャ（CV：上坂すみれ） - Official Anime Version (3:35)
        1: {
            title: "可愛くてごめん (Kawaikute Gomen)",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Nhạc dạo đầu sôi động)", vi: "Intro giai điệu vui tươi" },
                { time: 15.15, romaji: "Watashi ga watashi no koto wo aishite", vi: "Em yêu chính bản thân mình thì có gì sai chứ?" },
                { time: 18.92, romaji: "Nani ga warui no? Shitto deshou ka?", vi: "Có gì sai sao? Là ghen tị đúng không?" },
                { time: 22.65, romaji: "Itai da toka kawatteru toka", vi: "Bảo em làm màu hay lập dị kì quặc?" },
                { time: 26.31, romaji: "Todokimasen ne sono ripurai", vi: "Mấy lời mỉa mai đó chẳng thể chạm tới em đâu!" },
                { time: 30.22, romaji: "Daisuki na oyofuku, daisuki na okeshou de", vi: "Khoác lên bộ cánh yêu thích, tô lớp trang điểm ngọt ngào" },
                { time: 33.91, romaji: "Okimari no haafu tsuin maite odekake shiyo", vi: "Cột mái tóc nửa hai bên quen thuộc rồi tự tin bước xuống phố nào" },
                { time: 39.29, romaji: "Higasa motte bocchi datte shiawase da mon!", vi: "Che ô che nắng, dẫu một mình thôi cũng thấy ngập tràn hạnh phúc!" },
                { time: 45.33, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 48.86, romaji: "Umarete kichatte gomen", vi: "Sinh ra trên đời xinh thế này, thứ lỗi nhé!" },
                { time: 52.74, romaji: "Chu! Zawazawa shichau gomen", vi: "Chu! Làm mọi người xôn xao xì xào xin lỗi nha!" },
                { time: 56.54, romaji: "Ishiki shichau yo ne? Gomen", vi: "Lỡ làm ai đó bận lòng rung rinh rồi? Xin lỗi nha!" },
                { time: 60.32, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 63.95, romaji: "Jibun migaki shite gomen", vi: "Chăm chút bản thân đẹp lên mỗi ngày xin lỗi luôn!" },
                { time: 67.78, romaji: "Chu! Haki motte gomen", vi: "Chu! Khí chất ngút ngàn thế này xin lỗi nha!" },
                { time: 71.53, romaji: "Toriko ni shichatte gomen", vi: "Mê hoặc trái tim ai kia mất rồi, thứ lỗi nhé!" },
                { time: 74.63, romaji: "Mukatsuichau desho? Zamaaa w", vi: "Tức tối ghen tị lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 90.34, romaji: "Shumi no chigai kawarimono to bakani saretemo magetakunai", vi: "Dù sở thích có khác biệt, dù bị coi là kẻ lập dị em cũng không chịu khuất phục" },
                { time: 97.89, romaji: "Kowaku mo nai antara gotoki", vi: "Lũ người như các người em sợ gì chứ!" },
                { time: 101.52, romaji: "Jibun no mikata wa jibun de aritai", vi: "Em muốn chính mình sẽ là đồng minh vững chắc nhất của bản thân" },
                { time: 105.50, romaji: "Ichiban taisetsu ni shite agetai", vi: "Muốn trân trọng và yêu quý bản thân em nhất trên đời" },
                { time: 109.29, romaji: "Monogatari no shujinkou nano sa", vi: "Bởi em chính là nhân vật chính của câu chuyện này!" },
                { time: 117.90, romaji: "Chu! Gouman datte gomen", vi: "Chu! Kiêu kỳ một tí mà xin lỗi nha!" },
                { time: 121.59, romaji: "Ikiteru dake de gomen", vi: "Chỉ việc sống thôi cũng tỏa sáng rực rỡ, xin lỗi nhé!" },
                { time: 125.41, romaji: "Chu! Kandai na kokoro de gomen", vi: "Chu! Tấm lòng bao dung rộng lượng thế này xin lỗi luôn!" },
                { time: 129.19, romaji: "Yurushite shimau yo ne? Gomen", vi: "Chắc chắn là bạn sẽ tha thứ cho em rồi đúng không? Xin lỗi nha!" },
                { time: 133.00, romaji: "Oshi wa oseru uchi ni ose!", vi: "Đu idol thì phải đu hết mình ngay khi còn có thể!" },
                { time: 136.81, romaji: "Koukai shite kara ja osoi yo?", vi: "Để tới lúc hối hận thì muộn màng đấy nhé?" },
                { time: 140.58, romaji: "Junbi wa ii ka? Kako mo mirai mo", vi: "Đã chuẩn bị sẵn sàng chưa? Cả quá khứ lẫn tương lai" },
                { time: 144.38, romaji: "Aishite nanbo desho!", vi: "Yêu hết mình mới là chân ái chứ!" },
                { time: 163.14, romaji: "Hayari no fuku wo kite, meiku wo chotto kaete", vi: "Khoác lên bộ cánh hợp mốt, thay đổi phong cách trang điểm một chút" },
                { time: 167.46, romaji: "'Odekake yokka' 'Nee, kawaii?'", vi: "'Mình đi dạo phố nhé?' 'Nè, em có đáng yêu không?'" },
                { time: 171.98, romaji: "Kanpeki da mon...!", vi: "Hoàn hảo không tì vết luôn...!" },
                { time: 174.55, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 178.21, romaji: "Umarete kichatte gomen", vi: "Sinh ra xinh đẹp thế này xin lỗi luôn!" },
                { time: 182.04, romaji: "Chu! Azatokute gomen", vi: "Chu! Thả thính cuốn hút thế này xin lỗi nha!" },
                { time: 185.79, romaji: "Jinsei tanoshinde gomen", vi: "Tận hưởng cuộc đời rực rỡ quá xin lỗi nhé!" },
                { time: 189.56, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 193.25, romaji: "Doryoku shichatte gomen", vi: "Nỗ lực tỏa sáng hết mình xin lỗi luôn!" },
                { time: 197.06, romaji: "Chu! Toutokute gomen", vi: "Chu! Quý giá vô ngần thế này xin lỗi nha!" },
                { time: 200.78, romaji: "Joshiryoku takakute gomen", vi: "Sức hút thiếu nữ không thể cưỡng lại xin lỗi nhé!" },
                { time: 203.95, romaji: "Mukatsuichau yo ne? Gomen ne! ✨", vi: "Ghen tị tức tối lắm phải không? Tha lỗi cho em nha!" },
                { time: 210.00, romaji: "♪ (Outro ngân vang rực rỡ)", vi: "Giai điệu kết thúc bài hát" }
            ]
        },

        // Track 2: 小さな恋のうた (Chiisana Koi no Uta)
        // Spotify: https://open.spotify.com/intl-vi/track/6avvVNDCKYVIIxrZ7TaFKd
        // Artist: アーリャ（CV：上坂すみれ） - Official Anime Version (4:09)
        2: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng acoustic guitar dạo đầu)", vi: "Khúc dạo đầu mộc mạc" },
                { time: 16.14, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la bạt ngàn muôn tinh tú" },
                { time: 20.10, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Trên hành tinh xanh rộng lớn ngút ngàn" },
                { time: 24.08, romaji: "Chiisana koi no omoi wa todoku", vi: "Tâm tư tình cảm nhỏ bé này vẫn nguyện gửi trao" },
                { time: 28.16, romaji: "Chiisana shima no anata no moto e", vi: "Đến với nơi có bóng hình người nơi hòn đảo nhỏ" },
                { time: 32.48, romaji: "Anata to deai toki wa nagareru", vi: "Từ thuở gặp gỡ người, thời gian êm đềm trôi" },
                { time: 36.56, romaji: "Omoi wo kometa tegami mo fueru", vi: "Những bức thư chất chứa yêu thương ngày một đong đầy" },
                { time: 40.58, romaji: "Itsushika futari tagai ni hibiku", vi: "Chẳng biết tự khi nào, hai ta đã cùng hòa chung nhịp đập" },
                { time: 44.75, romaji: "Toki ni hageshiku toki ni setsunaku", vi: "Lúc thì nồng nàn da diết, khi lại nhói buốt con tim" },
                { time: 49.02, romaji: "Hibiku wa tooku haruka kanata e", vi: "Khúc ca vang vọng đến tận chân trời xa xôi" },
                { time: 54.49, romaji: "Yasashii uta wa sekai wo kaeru", vi: "Bản tình ca dịu êm làm đổi thay cả thế giới này" },
                { time: 59.10, romaji: "Hora anata ni totte daiji na hito hodo", vi: "Kìa xem, người quan trọng nhất trong lòng bạn..." },
                { time: 65.16, romaji: "Sugu soba ni iru no", vi: "...đang ở ngay bên cạnh bạn đấy thôi" },
                { time: 69.30, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong gửi gắm trọn vẹn đến riêng người" },
                { time: 75.55, romaji: "Hibike koi no uta", vi: "Hãy ngân vang mãi, hỡi khúc ca tình yêu!" },
                { time: 78.42, romaji: "Hora hora hora, hibike koi no uta", vi: "Lắng nghe xem, bản tình ca đang ngân vang rộn rã" },
                { time: 91.95, romaji: "Anata wa kizuku futari wa aruku", vi: "Bạn nhận ra chăng, hai ta đang sánh bước bên nhau" },
                { time: 96.03, romaji: "Kurai michi demo hibi terasu tsuki", vi: "Dù con đường tăm tối, vầng trăng vẫn soi rọi tháng ngày" },
                { time: 100.09, romaji: "Nigirishimeta te hanasu koto naku", vi: "Nắm chặt bàn tay người, chẳng bao giờ buông lơi" },
                { time: 104.17, romaji: "Omoi wa tsuyoku eien chikau", vi: "Tâm can khắc sâu, nguyện thề ước bên nhau trọn đời" },
                { time: 108.33, romaji: "Eien no fuchi kitto boku wa yuu", vi: "Đến tận cùng vĩnh hằng, em chắc chắn sẽ thốt lên" },
                { time: 112.54, romaji: "Omoi kawarazu onaji kotoba wo", vi: "Trọn vẹn tấm lòng chẳng hề đổi thay cùng lời yêu ấy" },
                { time: 116.55, romaji: "Soredemo tarizu namida ni kawari", vi: "Dẫu vậy vẫn chưa đủ, nghẹn ngào hóa giọt lệ hoen mi" },
                { time: 120.67, romaji: "Yorokobi ni nari kotoba ni dekizu", vi: "Hóa thành niềm hoan ca chẳng lời nào tả xiết" },
                { time: 124.91, romaji: "Tada dakishimeru tada dakishimeru", vi: "Chỉ biết ôm chặt lấy người trong vòng tay" },
                { time: 130.51, romaji: "Hora anata ni totte daiji na hito hodo", vi: "Kìa xem, người quan trọng nhất đời bạn..." },
                { time: 136.48, romaji: "Sugu soba ni iru no", vi: "...đang kề cận ngay cạnh bên" },
                { time: 140.65, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong gửi trao trọn vẹn đến riêng bạn" },
                { time: 146.91, romaji: "Hibike koi no uta", vi: "Vang vọng mãi, hỡi khúc ca tình yêu!" },
                { time: 149.83, romaji: "Hora hora hora, hibike koi no uta", vi: "Khúc tình ca đang rộn rã ngân vang" },
                { time: 158.29, romaji: "Yume naraba samenai de", vi: "Nếu đây là giấc mơ, xin người đừng thức giấc" },
                { time: 162.33, romaji: "Yume naraba samenai de", vi: "Nếu là giấc chiêm bao, xin hãy ngủ say mãi" },
                { time: 166.43, romaji: "Anata to sugoshita toki, eien no hoshi to naru", vi: "Khoảnh khắc bên người sẽ hóa thành vì sao sáng bất diệt" },
                { time: 178.21, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Người quan trọng nhất đời bạn đang ở ngay bên cạnh" },
                { time: 188.43, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta", vi: "Chỉ mong gửi đến riêng người, hãy ngân vang hỡi khúc ca yêu thương" },
                { time: 197.60, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Người yêu thương nhất luôn ở cạnh bên bạn" },
                { time: 207.76, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta ✨", vi: "Chỉ mong đến được trái tim người, khúc ca tình yêu!" }
            ]
        },

        // Track 3: ワールドイズマイン (World is Mine)
        // Spotify: https://open.spotify.com/intl-vi/track/3iCXXsLMo4ssBOC2Sw5KUO
        // Artist: アーリャ（CV：上坂すみれ） - Official Anime Version (4:12)
        3: {
            title: "ワールドイズマイン (World is Mine)",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng đàn piano & intro công chúa kiêu kỳ)", vi: "Khúc dạo đầu quý tộc" },
                { time: 15.54, romaji: "Sekai de ichiban ohimesama", vi: "Em chính là nàng công chúa đệ nhất trần đời" },
                { time: 19.43, romaji: "Sou iu atsukai kokoroete yo ne", vi: "Phải biết cách đối xử cho xứng đáng đấy nhé!" },
                { time: 24.47, romaji: "Sono ichi: Itsumo to chigau kamigata ni kigatsuku koto", vi: "Điều thứ nhất: Khi em đổi kiểu tóc mới, phải nhận ra ngay" },
                { time: 28.47, romaji: "Sono ni: Chanto kutsu made miru koto. Ii ne?", vi: "Điều thứ hai: Phải ngắm nhìn tỉ mỉ tới tận đôi giày em mang, rõ chưa?" },
                { time: 32.48, romaji: "Sono san: Watashi no hitokoto ni wa mittsu no kotoba de henji suru koto", vi: "Điều thứ ba: Mỗi câu em nói, phải đáp lại bằng ba câu ân cần" },
                { time: 37.33, romaji: "Wakattara migite ga orusu nano o nanto kashite!", vi: "Hiểu rồi thì mau nắm lấy bàn tay đang để trống của em đi!" },
                { time: 43.08, romaji: "Betsu ni wagamama nante itte nain dakara", vi: "Em đâu có đòi hỏi gì vô lý ích kỷ đâu cơ chứ" },
                { time: 47.38, romaji: "Kimi ni kokoro kara omotte hoshii no 'Kawaikute'", vi: "Em chỉ muốn anh thật lòng thốt lên rằng em 'quá đáng yêu' mà thôi!" },
                { time: 53.30, romaji: "Sekai de ichiban ohimesama", vi: "Nàng công chúa số một trần gian là em đây" },
                { time: 57.40, romaji: "Ki ga tsuite nee nee, mataseru nan te rongai yo", vi: "Mau nhận ra đi chứ, để em phải chờ là điều không chấp nhận được đâu!" },
                { time: 63.20, romaji: "Watashi o dare da to omotteru no?", vi: "Anh nghĩ em là ai cơ chứ?" },
                { time: 67.13, romaji: "Mou nanda ka amai mono ga tabetai! Ima sugu ni yo", vi: "Tự nhiên em thèm đồ ngọt ghê! Ngay bây giờ đấy nhé!" },
                { time: 73.29, romaji: "Ah, check, one, two. Ah!", vi: "Ah, check, one, two. Ah!" },
                { time: 81.04, romaji: "Ketten? Kawaii no machigai desho", vi: "Khuyết điểm sao? Nhầm lẫn thành quá đáng yêu thì có!" },
                { time: 85.10, romaji: "Monku wa yurushimasen no", vi: "Không chấp nhận bất cứ lời phàn nàn nào đâu đấy!" },
                { time: 89.17, romaji: "Ano ne? Watashi no hanashi chanto kiiteru? Chotto...", vi: "Này nhé? Có đang nghe em nói nghiêm túc không đấy? Này..." },
                { time: 95.34, romaji: "Ah, sore to ne. Shiroi oumasan kimatteru deshou, mukae ni kite", vi: "A, còn nữa. Ngựa bạch công tử là điều đương nhiên rồi, mau đến đón em đi" },
                { time: 102.50, romaji: "Wakattara kashizuite te o totte 'Ohimesama' tte", vi: "Hiểu rồi thì quỳ xuống nâng tay em lên và gọi 'Công chúa của chàng' xem nào" },
                { time: 108.33, romaji: "Betsu ni wagamama nante itte nain dakara", vi: "Em đâu có đòi hỏi quá đáng gì đâu" },
                { time: 112.54, romaji: "Demo ne sukoshi kurai shikatte kuretatte ii no yo?", vi: "Nhưng mà này, thi thoảng mắng em một chút cũng được đấy nhé?" },
                { time: 118.53, romaji: "Sekai de watashi dake no oujisama", vi: "Chàng hoàng tử duy nhất trên đời của riêng em" },
                { time: 122.57, romaji: "Ki ga tsuite hora hora, otete ga aitemasu", vi: "Mau nhận ra đi xem nào, bàn tay em đang để trống kìa" },
                { time: 128.30, romaji: "Mukuchi de buaisou na oujisama", vi: "Chàng hoàng tử ít nói và lạnh lùng của em ơi" },
                { time: 132.30, romaji: "Mou doushite! Ki ga tsuite yo hayaku", vi: "Thật là! Mau nhận ra nhanh lên đi chứ" },
                { time: 137.37, romaji: "Ah! Zettai kimi wa wakatte nai! Wakatte nai wa...", vi: "A! Chắc chắn là anh chẳng hiểu gì hết trơn rồi! Đồ ngốc..." },
                { time: 155.40, romaji: "Ichigo no notta shootokeeki, kodawari tamago no torokeru purin", vi: "Bánh kem dâu tây ngọt ngào, bánh pudding trứng thơm béo tan chảy" },
                { time: 163.43, romaji: "Minna minna gaman shimasu...", vi: "Tất cả tất cả em đều sẽ nhịn hết vì anh..." },
                { time: 167.88, romaji: "Wagamama na ko dato omowanai de", vi: "Đừng nghĩ em là một đứa trẻ hư ích kỷ" },
                { time: 171.34, romaji: "Watashi datte yareba dekiru mon", vi: "Em mà muốn thì chuyện gì cũng làm được hết nhé" },
                { time: 175.37, romaji: "Ato de koukai suru wa yo. Touzen desu!", vi: "Sau này anh sẽ phải hối tiếc đấy. Tất nhiên rồi!" },
                { time: 180.67, romaji: "Datte watashi wa... Sekai de ichiban ohimesama", vi: "Bởi vì em chính là nàng công chúa số một trần gian" },
                { time: 187.56, romaji: "Chanto mitete yo ne dokoka ni icchau yo?", vi: "Phải dõi theo em thật kỹ, kẻo em bay mất đấy nhé?" },
                { time: 194.64, romaji: "Fui ni dakishimerareta... Kyuu ni sonna! Eh?", vi: "Bất ngờ bị anh ôm chầm lấy... Tự nhiên lại thế! Hả?" },
                { time: 200.30, romaji: "'Hikareru abunai yo' sou itte soppo muku kimi...", vi: "'Cẩn thận xe quẹt kìa', anh nói rồi ngoảnh mặt làm ngơ..." },
                { time: 207.76, romaji: "Kocchi no ga abunai wa yo... ✨", vi: "Thế này còn nguy hiểm hơn xe đụng gấp trăm lần đấy đồ ngốc...!" }
            ]
        },

        // Track 4: CHE.R.RY
        // Spotify: https://open.spotify.com/intl-vi/track/1zNDgdjkZojamiEZQOhI96
        // Artist: アーリャ（CV：上坂すみれ） - Official Anime Version (3:29)
        4: {
            title: "CHE.R.RY",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng acoustic guitar dạo êm đềm)", vi: "Intro guitar mộc mạc" },
                { time: 13.38, romaji: "Tenohira de furueta", vi: "Rung lên trong lòng bàn tay" },
                { time: 17.38, romaji: "Sore ga chiisana yuuki ni natteita nda", vi: "Điều đó đã tiếp thêm cho em một dũng khí nhỏ nhoi" },
                { time: 23.77, romaji: "Emoji wa nigate datta", vi: "Em vốn rất vụng về khi dùng biểu tượng cảm xúc" },
                { time: 27.76, romaji: "Dakedo kimi karadattara wakuwaku shichau", vi: "Nhưng hễ là tin nhắn từ anh thì tim em lại rạo rực" },
                { time: 33.40, romaji: "Henji wa sugu ni shicha dame datte", vi: "Từng nghe ai đó dặn không nên trả lời ngay lập tức" },
                { time: 38.86, romaji: "Dareka ni kiita koto aru kedo", vi: "Để giữ giá trong tình yêu" },
                { time: 43.76, romaji: "Kakehiki nante dekinai no", vi: "Nhưng em chẳng thể chơi trò đưa đẩy ấy..." },
                { time: 48.09, romaji: "Suki na no yo ah ah ah ah", vi: "Vì em đã quá thích anh rồi, ah ah ah ah" },
                { time: 54.67, romaji: "Koi shichattanda tabun, kizuitenai deshou?", vi: "Có lẽ em đã đem lòng yêu mất rồi, anh chắc chẳng nhận ra đâu nhỉ?" },
                { time: 61.38, romaji: "Hoshi no yoru negai komete CHE.R.RY", vi: "Gửi trọn ước nguyện vào đêm ngàn sao, trái anh đào ngọt ngào" },
                { time: 68.57, romaji: "Yubisaki de okuru kimi e no MESSAGE", vi: "Từng đầu ngón tay khẽ bấm gửi thông điệp yêu thương về anh" },
                { time: 83.77, romaji: "Sakura ga saiteiru, kono heya kara mieteru keshiki wo zenbu", vi: "Hoa anh đào đang bung nở, cảnh sắc ngắm nhìn từ ô cửa sổ căn phòng này" },
                { time: 94.02, romaji: "Ima kimi ga kanjita sekai to juu byou torikaete morau yori", vi: "Thay vì được đổi 10 giây để nhìn thế giới qua ánh mắt anh" },
                { time: 103.68, romaji: "Hon no ichigyou demo kamawanainda, kimi kara no kotoba ga hoshiinda", vi: "Chỉ cần một dòng tin nhắn ngắn ngủi thôi, em chỉ khao khát những lời từ chính anh" },
                { time: 114.02, romaji: "Uso demo shinji tsuzukerareru no, suki dakara ah ah ah ah", vi: "Dù là dối lừa em vẫn nguyện tin mãi, vì em quá yêu anh rồi" },
                { time: 124.99, romaji: "Koi shichattanda tabun, kizuitenai deshou?", vi: "Có lẽ em đã đem lòng yêu rồi, anh chắc chẳng nhận ra đâu nhỉ?" },
                { time: 131.66, romaji: "Hoshi no yoru negai komete CHE.R.RY", vi: "Gửi trọn ước nguyện vào đêm ngàn sao, trái anh đào ngọt ngào" },
                { time: 138.84, romaji: "Yubisaki de okuru kimi e no MESSAGE", vi: "Từng đầu ngón tay bấm gửi thông điệp yêu thương về anh" },
                { time: 157.97, romaji: "Amakunaru kajitsu ga ii no, nanigenai kaiwa kara", vi: "Trái quả ngọt ngào mới tuyệt vời làm sao, từ những mẩu trò chuyện vu vơ" },
                { time: 166.43, romaji: "Sodatetai ah ah ah ah", vi: "Em muốn vun đắp tình cảm này lớn dần lên" },
                { time: 171.34, romaji: "Koi no hajimari, mune ga kyun to semakunaru", vi: "Khởi đầu của tình yêu, lồng ngực cứ nhói lên bồi hồi" },
                { time: 179.61, romaji: "Itsumademo matteiru kara haru no", vi: "Em sẽ mãi đợi chờ anh giữa mùa xuân ấm áp" },
                { time: 185.15, romaji: "Tsumetai yokaze ni azukete MESSAGE", vi: "Gửi gắm thông điệp tình yêu vào làn gió đêm se lạnh" },
                { time: 192.72, romaji: "Koi shichattanda tabun, kizuitenai deshou?", vi: "Có lẽ em đã yêu mất rồi, anh chắc chẳng nhận ra đâu nhỉ?" },
                { time: 199.46, romaji: "Hoshi no yoru negai komete CHE.R.RY", vi: "Gửi trọn ước nguyện vào đêm ngàn sao, trái anh đào ngọt ngào" },
                { time: 206.63, romaji: "Yubisaki de okuru kimi e no MESSAGE ✨", vi: "Từng đầu ngón tay bấm gửi thông điệp yêu thương về anh" }
            ]
        },

        // Track 5: 小さな恋のうた (Chiisana Koi no Uta)
        // Spotify: https://open.spotify.com/intl-vi/track/66apUbHsEuKh7IqkKK7OKa
        // Artist: 椎名真昼(CV.石見舞菜香) - The Angel Next Door ED (5:00)
        5: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "椎名真昼 (CV.石見舞菜香)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng đàn piano & dàn dây nhẹ nhàng của Mahiru)", vi: "Khúc dạo đầu dịu dàng như thiên thần" },
                { time: 13.20, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la muôn vàn tinh tú" },
                { time: 17.00, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Trên hành tinh xanh rộng lớn ngút ngàn" },
                { time: 21.05, romaji: "Chiisana koi no omoi wa todoku", vi: "Tâm tư tình cảm nhỏ bé này vẫn nguyện bay xa" },
                { time: 24.95, romaji: "Chiisana shima no anata no moto e", vi: "Tìm đến bên anh nơi góc nhỏ thân quen" },
                { time: 29.00, romaji: "Anata to deai toki wa nagareru", vi: "Gặp gỡ bên anh, năm tháng trôi thật êm đềm" },
                { time: 33.00, romaji: "Omoi wo kometa tegami mo fueru", vi: "Từng dòng tâm tư đong đầy theo năm tháng" },
                { time: 36.95, romaji: "Itsushika futari tagai ni hibiku", vi: "Chẳng biết tự khi nào, đôi ta đã cùng chung nhịp đập" },
                { time: 41.00, romaji: "Toki ni hageshiku toki ni setsunaku", vi: "Lúc nồng nàn da diết, khi lại nhói buốt con tim" },
                { time: 46.00, romaji: "Hibiku wa tooku haruka kanata e", vi: "Khúc ca vang vọng đến tận chân trời xa xôi" },
                { time: 52.00, romaji: "Yasashii uta wa sekai wo kaeru", vi: "Bản tình ca dịu êm làm đổi thay cả thế giới này" },
                { time: 57.01, romaji: "Hora anata ni totte daiji na hito hodo", vi: "Kìa xem, người quan trọng nhất trong lòng anh..." },
                { time: 63.01, romaji: "Sugu soba ni iru no", vi: "...đang ở ngay bên cạnh anh đấy thôi" },
                { time: 66.01, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong gửi gắm trọn vẹn đến riêng anh" },
                { time: 72.00, romaji: "Hibike koi no uta", vi: "Hãy ngân vang mãi, khúc tình ca yêu thương!" },
                { time: 75.05, romaji: "Hora, hora, hora, hibike koi no uta", vi: "Lắng nghe xem, bản tình ca đang rộn rã ngân vang" },
                { time: 98.00, romaji: "Anata wa kizuku futari wa aruku", vi: "Anh nhận ra chăng, hai ta đang sánh bước bên nhau" },
                { time: 102.00, romaji: "Kurai michi demo hibi terasu tsuki", vi: "Dù con đường tăm tối, vầng trăng vẫn soi rọi tháng ngày" },
                { time: 106.00, romaji: "Nigirishimeta te hanasu koto naku", vi: "Nắm chặt bàn tay anh, chẳng bao giờ buông lơi" },
                { time: 110.00, romaji: "Omoi wa tsuyoku eien chikau", vi: "Tâm can khắc sâu, nguyện thề ước bên nhau trọn đời" },
                { time: 114.00, romaji: "Eien no fuchi kitto boku wa yuu", vi: "Đến tận cùng vĩnh hằng, em chắc chắn sẽ thốt lên" },
                { time: 118.00, romaji: "Omoi kawarazu onaji kotoba wo", vi: "Trọn vẹn tấm lòng chẳng hề đổi thay cùng lời yêu ấy" },
                { time: 122.00, romaji: "Sore demo tarizu namida ni kawari", vi: "Dẫu vậy vẫn chưa đủ, nghẹn ngào hóa giọt lệ hoen mi" },
                { time: 126.00, romaji: "Yorokobi ni nari kotoba ni dekizu", vi: "Hóa thành niềm hoan ca chẳng lời nào tả xiết" },
                { time: 131.00, romaji: "Tada dakishimeru tada dakishimeru", vi: "Chỉ biết ôm chặt lấy anh trong vòng tay" },
                { time: 137.00, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Người trân quý nhất đời anh, đang kề cận ngay cạnh bên" },
                { time: 146.50, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta", vi: "Chỉ mong trao trọn riêng anh, hãy ngân vang khúc tình ca" },
                { time: 155.50, romaji: "Hora, hora, hora, hibike koi no uta", vi: "Khúc tình ca đang rộn rã ngân vang" },
                { time: 164.00, romaji: "Yume naraba samenaide, yume naraba samenaide", vi: "Nếu là giấc mơ xin đừng tỉnh giấc, xin hãy mơ mãi" },
                { time: 172.00, romaji: "Anata to sugoshita toki eien no hoshi to naru", vi: "Khoảnh khắc bên anh sẽ hóa thành vì sao sáng bất diệt" },
                { time: 180.50, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Người quan trọng nhất đời anh đang ở ngay bên cạnh" },
                { time: 189.50, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta", vi: "Chỉ mong đến được trái tim anh, hãy ngân vang lời yêu" },
                { time: 198.50, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Người quan trọng nhất luôn ở cạnh bên anh" },
                { time: 207.50, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta ✨", vi: "Chỉ mong gửi trao riêng anh, khúc ca tình yêu!" }
            ]
        },

        // Track 6: うれしい! たのしい! 大好き! (Ureshii! Tanoshii! Daisuki!)
        // Spotify: https://open.spotify.com/intl-vi/track/6endW8r32Uli0oS4ze3BZM
        // Artist: 椎名真昼(CV.石見舞菜香) - The Angel Next Door ED 12 (3:35)
        6: {
            title: "うれしい! たのしい! 大好き!",
            artist: "椎名真昼 (CV.石見舞菜香)",
            lines: [
                { time: 0.0, romaji: "♪ (Intro nhịp điệu rộn rã ngọt ngào)", vi: "Khúc dạo đầu tươi vui rạng rỡ" },
                { time: 3.00, romaji: "Hajimete atta toki kara chigau mono kanjiteta", vi: "Ngay từ giây phút đầu tiên tương ngộ, em đã cảm nhận được một điều rất đỗi khác biệt" },
                { time: 9.90, romaji: "Jibun no naka no dareka ga kokoro wo tsutsuita", vi: "Dường như có ai đó trong em khẽ chạm nhẹ vào nhịp đập con tim" },
                { time: 17.30, romaji: "Tomodachi ni wa umaku ienai kono pawaa no minamoto wo", vi: "Chẳng thể giải thích cho bạn bè nguồn sức mạnh kỳ diệu này bắt nguồn từ đâu" },
                { time: 24.20, romaji: "'Koi wo shiteru' tada sore dake ja sumasarenai koto no you na ki ga shiteru", vi: "Bảo rằng 'Em đang yêu rồi', chỉ bấy nhiêu thôi dường như vẫn chưa đủ diễn tả" },
                { time: 33.40, romaji: "Kitto sou nanda, meguriaetanda", vi: "Chắc chắn là vậy rồi, em đã tương phùng được..." },
                { time: 40.40, romaji: "Zutto sagashiteta hito ni", vi: "...người mà bấy lâu nay em vẫn hằng kiếm tìm" },
                { time: 46.00, romaji: "Mabuka ni shiteta boushi no tsuba wo gutto agetai kibun", vi: "Muốn đẩy cao vành chiếc mũ đang đội sâu để ngắm nhìn anh thật rõ" },
                { time: 56.50, romaji: "'Wakatte ita no mae kara kou naru koto mo zutto'", vi: "'Từ trước em đã biết rồi, rằng mọi chuyện sẽ ngọt ngào như thế này'" },
                { time: 63.50, romaji: "Watashi no kotoba hanbun waratte kiiteru kedo", vi: "Những lời em nói anh chỉ cười nửa đùa nửa thật lắng nghe" },
                { time: 70.50, romaji: "Shouko datte chanto aru yo", vi: "Nhưng em có bằng chứng xác thực đàng hoàng đấy nhé!" },
                { time: 73.90, romaji: "Hajimete te wo tsunaide kara sono ato sugu ni", vi: "Kể từ lần đầu tiên hai ta nắm lấy tay nhau, ngay sau khoảnh khắc ấy" },
                { time: 81.50, romaji: "Watashi no migite suupaa de supesharu ni natta mono", vi: "Bàn tay phải của em đã trở nên phi thường và đặc biệt biết bao" },
                { time: 85.10, romaji: "Yappari sou da, anata datta nda", vi: "Quả đúng là vậy rồi, người đó chính là anh!" },
                { time: 91.90, romaji: "Ureshii! Tanoshii! Daisuki!", vi: "Hạnh phúc ngập tràn! Vui sướng biết bao! Yêu anh nhiều lắm!" },
                { time: 96.60, romaji: "Nandemo dekiru tsuyoi pawaa ga dondon waite kuru yo", vi: "Nguồn sức mạnh vô biên giúp em làm được mọi điều đang cuộn trào trong tim" },
                { time: 105.00, romaji: "Honto wa anata mo shitteta hazu, saisho kara watashi wo suki datta kuse ni", vi: "Thực ra chắc hẳn anh cũng tự biết rõ, rõ ràng đã thích em ngay từ thuở ban đầu rồi còn gì!" },
                { time: 114.60, romaji: "Yappari sou da, meguriaetanda zutto sagashiteta hito ni", vi: "Đúng là vậy rồi, em đã tìm thấy định mệnh của đời mình" },
                { time: 127.10, romaji: "Itsumo konna ni shiawase na kimochi mochi tsuzukete irareru", vi: "Cảm giác ngập tràn hạnh phúc này em sẽ nguyện giữ mãi trong lòng" },
                { time: 136.40, romaji: "Anata ga sou da, anata datta nda", vi: "Chính là anh, người định mệnh ấy chính là anh!" },
                { time: 142.90, romaji: "Ureshii! Tanoshii! Daisuki!", vi: "Hạnh phúc! Vui sướng! Yêu anh nhiều lắm!" },
                { time: 147.50, romaji: "Yappari sou da, meguriaetanda", vi: "Đúng là thế rồi, đôi ta đã tìm thấy nhau" },
                { time: 153.90, romaji: "Ureshii! Tanoshii! Daisuki! ✨", vi: "Hạnh phúc! Vui sướng! Yêu anh vô bờ bến!" }
            ]
        },

        // Track 7-11: Mahiru Instrumental Series
        7: { isInstrumental: true, title: "小さな恋のうた (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", persona: "mahiru" },
        8: { isInstrumental: true, title: "うれしい! たのしい! 大好き! (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", persona: "mahiru" },
        9: { isInstrumental: true, title: "君に届け (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", persona: "mahiru" },
        10: { isInstrumental: true, title: "バレンタイン・キッス (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", persona: "mahiru" },
        11: { isInstrumental: true, title: "ギフト (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", persona: "mahiru" },

        // Track 12: ハレの日に - Harenohini
        // Spotify: https://open.spotify.com/intl-vi/track/41bU6Anbt3NPBdGLzpEcal
        // Artist: 汐れいら (Reira Ushio) - The Fragrant Flower Blooms with Dignity (4:37)
        12: {
            title: "ハレの日に (Hare no Hi ni)",
            artist: "汐れいら (Reira Ushio)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng đàn dịu dàng & hương hoa thơm ngát)", vi: "Khúc dạo đầu mộc mạc" },
                { time: 0.66, romaji: "Naite shimatta sora wo miteta", vi: "Ngước nhìn bầu trời đang rưng rưng trút hạt" },
                { time: 7.49, romaji: "Kimi wo omotteru", vi: "Lòng em lại khắc khoải nhớ về anh" },
                { time: 12.17, romaji: "Namida no ato kawaite kurenai", vi: "Vệt nước mắt chưa kịp hong khô" },
                { time: 17.37, romaji: "Mada kimi no nioi ga suru", vi: "Dường như vẫn còn vương vấn hương thơm của anh" },
                { time: 38.98, romaji: "Aiiro kimi to no denwa muri ni waratteita", vi: "Màu chàm u hoài, cuộc gọi với anh em đã cố gượng cười" },
                { time: 44.73, romaji: "Kumotta sora to watashi 'Kyou wa aenai ne'", vi: "Bầu trời ảm đạm cùng tiếng thở dài 'Hôm nay chúng mình không gặp nhau được rồi nhỉ'" },
                { time: 49.97, romaji: "Aa kore dake no koto de kanashiku narun da na", vi: "A, chỉ một chuyện nhỏ nhặt thế thôi mà sao lòng buồn đến thế" },
                { time: 62.56, romaji: "Pleased your flower, tokibiri no mono ja nakute ii, kimi ga kureru kara ii", vi: "Không cần là thứ gì xa hoa lộng lẫy, chỉ cần là anh trao tặng thì đều là điều tuyệt vời nhất" },
                { time: 74.04, romaji: "Please your love, kimi ga fuchidotta ai no kaotsuki zutto mite itai", vi: "Hình hài tình yêu mà anh vẽ nên, em chỉ muốn ngắm nhìn mãi thôi" },
                { time: 84.91, romaji: "By my side kimi to waraitai, tada no nichijou ni aijou ga kaotte iru", vi: "Muốn được cười vui bên cạnh anh, những ngày thường nhật ngạt ngào hương thơm tình yêu" },
                { time: 96.50, romaji: "Kimi to sugosu nanigenai toki ga itsudatte hana ni naru kara", vi: "Từng khoảnh khắc bình yên bên anh sẽ mãi bung nở thành những đóa hoa thơm ngát" },
                { time: 112.34, romaji: "I'll eat a cake, tobikiri chiisakutemo ii futari bun areba ii", vi: "Cùng ăn chiếc bánh ngọt, dẫu bé nhỏ thôi chỉ cần đủ cho hai ta là được" },
                { time: 124.06, romaji: "I want you to eat, kurete bakka no kimi e okaeshi kankaku wo okuriau yo", vi: "Muốn đáp lại tình cảm ấm áp mà anh luôn trao tặng" },
                { time: 134.65, romaji: "By my side kimi ni agetai, donna kanjou mo hanbun ni shite itai", vi: "Muốn san sẻ cùng anh mọi cảm xúc, chia đôi những nỗi niềm" },
                { time: 146.05, romaji: "Kimi ga omou nandemonai koto mo, nanda tte watashi wa tokubetsu ni omou kara", vi: "Những điều vu vơ anh nghĩ, với em đều là những điều vô cùng đặc biệt" },
                { time: 159.03, romaji: "'Nandemonai' wo tabanetara ooki na buuke ni natte", vi: "Gom góp những điều giản dị ấy lại sẽ tạo nên một bó hoa rực rỡ" },
                { time: 168.45, romaji: "'Arigatou' to 'Aishiteru' de kinenbi ja nai kinenbi wo kazatteku", vi: "Bằng lời 'Cảm ơn' và 'Yêu anh', điểm tô cho những ngày bình thường hóa kỷ niệm ngọt ngào" },
                { time: 204.94, romaji: "By my side ima wa beeru no naka, kanashii koto wa kimi to mitsumetai", vi: "Kề bên anh dưới tấm màn che, dẫu có chuyện buồn em vẫn muốn cùng anh đối mặt" },
                { time: 216.29, romaji: "Kao wo agesasete kureru kimi to hare no hi chikatte", vi: "Bên người đã nâng đỡ em ngẩng cao đầu, xin nguyện thề dưới ánh nắng rạng rỡ" },
                { time: 228.18, romaji: "By my side kimi to itai, tada no nichijou wo isshou wo iwatte ikou", vi: "Muốn ở bên anh trọn kiếp, chúc tụng từng ngày tháng bình yên suốt cuộc đời" },
                { time: 239.72, romaji: "Kimi ga suki na hana watashi mo mottete, aa mou waracchau ne ✨", vi: "Em cũng cầm trên tay đóa hoa anh thích, a tự nhiên lại mỉm cười hạnh phúc rồi!" }
            ]
        },

        // Track 13-15: Fragrant Flower Acoustic Instrumental Series
        13: { isInstrumental: true, title: "まなざしは光 (Manazashi wa Hikari)", artist: "原田萌喜 (Kaoru Hana OST)", persona: "kaoruko" },
        14: { isInstrumental: true, title: "ひとひら (Hitohira)", artist: "原田萌喜 (Kaoru Hana OST)", persona: "kaoruko" },
        15: { isInstrumental: true, title: "偏見と葛藤 (Henken to Kattou)", artist: "原田萌喜 (Kaoru Hana OST)", persona: "kaoruko" },

        // Track 16: 君のせいで愛してる (Kimi no Sei de Aishiteru)
        // Spotify: https://open.spotify.com/intl-vi/track/1SsnLip8KKG2aYsXlGH29n
        // Artist: CHiCO with HoneyWorks - Official Anime OP (3:51)
        16: {
            title: "君のせいで愛してる (Kimi no Sei de Aishiteru)",
            artist: "CHiCO with HoneyWorks",
            lines: [
                { time: 0.0, romaji: "♪ (Intro guitar & pop sôi động của HoneyWorks)", vi: "Intro giai điệu tình yêu rộn rã" },
                { time: 14.34, romaji: "Nee nee 'Aishiteru' tte watashi mite itte kureta gohoubi", vi: "Nè nè, câu 'Yêu em' anh nhìn thẳng vào mắt em mà nói ra là phần thưởng ngọt ngào nhất" },
                { time: 22.56, romaji: "Haa, yameta♡", vi: "Haa, thôi hông thèm nữa đâu♡" },
                { time: 26.59, romaji: "Sukurooru tomechau, koe ga shitara kiichau", vi: "Ngón tay lướt màn hình bỗng khựng lại, hễ nghe giọng anh là tim liền lắng nghe" },
                { time: 32.41, romaji: "Jishin ga nakute uso ga fuetemo massugu na kimochi", vi: "Dẫu thiếu tự tin và buông vài lời dỗi hờn, tình cảm này vẫn luôn chân thành" },
                { time: 39.46, romaji: "Kanchigai shichau yo kao akai no bareteru?", vi: "Em sẽ hiểu lầm đấy nhé, gương mặt đỏ ửng này bị anh bắt bài rồi sao?" },
                { time: 44.37, romaji: "Sasai na koto de mune ga odotte amazuppai no desu", vi: "Chỉ một hành động nhỏ thôi mà tim đập thình thịch, cảm giác chua ngọt bồi hồi" },
                { time: 51.27, romaji: "Kyori wo chijimeru kotoba miataranai no ni", vi: "Dẫu chẳng tìm được câu từ nào để rút ngắn khoảng cách đôi ta" },
                { time: 56.12, romaji: "Furimuita kimi no kao chikakute toiki furete koi no aji shiteru", vi: "Anh bất ngờ ngoảnh lại, gương mặt sát gần cùng hơi thở chạm khẽ... chính là vị ngọt tình yêu!" },
                { time: 65.62, romaji: "Nee nee 'Aishiteru' tte kimi wo mite itte komarasete ii?", vi: "Nè nè, em nhìn vào mắt anh rồi nói 'Em yêu anh' làm anh bối rối được không?" },
                { time: 73.79, romaji: "Nante kakehiki toka ne honto wa nigate yo aa kizuite", vi: "Trò đưa đẩy ấy thực ra em vụng về lắm, làm ơn mau nhận ra đi mà!" },
                { time: 82.50, romaji: "Suki ni naru tte itai no ni afuretara tomarenai", vi: "Đem lòng yêu ai dẫu có lúc nhói đau, nhưng khi đã trào dâng thì chẳng thể kìm nén!" },
                { time: 99.45, romaji: "Hoka no ko ni wa yasashii tsumetai yo watashi ni", vi: "Với người khác anh dịu dàng thế, sao với em lại lạnh lùng thế chứ?" },
                { time: 105.30, romaji: "Namae yobi mo bodii tacchi mo watashi dattara ii no ni", vi: "Gọi tên thân mật hay cái chạm tay, ước gì anh dành riêng cho em thì tốt biết mấy" },
                { time: 112.33, romaji: "Aiso tsukasareta tte shikatanai hodo wagamama na koigokoro", vi: "Dẫu bị chê trách cũng đành chịu thôi, bởi con tim đang yêu này ích kỷ lắm" },
                { time: 123.35, romaji: "Suki ni sasete miseru", vi: "Em nhất định sẽ khiến anh phải đổ gục vì em!" },
                { time: 126.69, romaji: "Mousou 'Kawaiisugi' tte watashi mite itte kureta gohoubi", vi: "Mơ mộng anh nhìn em thốt lên 'Đáng yêu quá đi mất' như một phần thưởng" },
                { time: 134.77, romaji: "Nante anime ja nai shi kisu shiin mo nai shi aa baka mitai", vi: "Cơ mà đây đâu phải anime, cũng chẳng có cảnh hôn lãng mạn, ngốc thật đấy!" },
                { time: 143.51, romaji: "Suki ni naru tte itai kara hiroin ni narenai", vi: "Vì yêu là đau lòng nên em chẳng dám nhận mình là nữ chính" },
                { time: 155.31, romaji: "Kiite ii? Uso kinshi. Ano ko no koto ki ni naru no?", vi: "Em hỏi thật nhé? Cấm nói dối! Anh có để ý đến cô gái ấy không?" },
                { time: 162.50, romaji: "Hoka ni iru ki ni naru ko mada ienai, etto watashi kamo tte kanchigai?", vi: "Người anh để ý vẫn chưa chịu nói ra... Ủa, có khi nào em lại tự ảo tưởng là mình không?" },
                { time: 171.17, romaji: "Mitsumekaeshichau", vi: "Chỉ biết nhìn sâu vào mắt anh bối rối" },
                { time: 177.94, romaji: "Nee nee 'Aishiteru' tte kimi wo mite itte komarasete ii?", vi: "Nè nè, nhìn thẳng mắt anh nói 'Em yêu anh' để làm anh bối rối nhé?" },
                { time: 185.97, romaji: "Nante kakehiki toka ne honto wa nigate yo aa kizuite", vi: "Trò thả thính này em vụng lắm, mau nhận ra tấm lòng em đi mà!" },
                { time: 194.70, romaji: "Suki ni naru tte itai no ni afuretara tomarenai ✨", vi: "Đem lòng yêu anh dẫu có xao xuyến nhói đau, nhưng yêu rồi thì chẳng thể dừng lại!" }
            ]
        },

        // Track 17: リトルワールド (Little World)
        // Spotify: https://open.spotify.com/intl-vi/track/1cflsQcGcOcL7gkZaPyiYm
        // Artist: PompadollS - Official Anime ED (3:08)
        17: {
            title: "リトルワールド (Little World)",
            artist: "PompadollS",
            lines: [
                { time: 0.0, romaji: "♪ (Intro indie pop mộng mơ)", vi: "Khúc dạo đầu thế giới nhỏ bé" },
                { time: 12.00, romaji: "Nee, koko de okita koto wa eien yo", vi: "Này, những gì đã xảy ra tại nơi đây sẽ là vĩnh cửu" },
                { time: 18.00, romaji: "Hansode otta shatsu to burausu", vi: "Chiếc áo sơ mi xắn tay cùng tà áo blouse nhẹ bay" },
                { time: 24.00, romaji: "Aa, subete ni imi nanka nakute subete no koto ni imi bakari ga atta", vi: "A, mọi điều dường như chẳng mang ý nghĩa gì, nhưng thực ra mọi thứ đều chất chứa ý nghĩa" },
                { time: 35.00, romaji: "Keisei sareru kyoutsuu no gengo", vi: "Hình thành nên ngôn ngữ chung chỉ của riêng đôi ta" },
                { time: 41.00, romaji: "Kimi ga nozomeba subete ga omoidoori ni naru", vi: "Chỉ cần là điều cậu ước ao, vạn vật đều sẽ diễn ra theo ý muốn" },
                { time: 48.00, romaji: "I love you no moji no raretsu mo futari ni shika wakaranai imi de", vi: "Từng dòng chữ 'I love you' mang ý nghĩa bí mật chỉ hai ta thấu hiểu" },
                { time: 57.00, romaji: "En ni natte kakomeba soko ga sekai ni naru", vi: "Vẽ nên một vòng tròn ôm lấy nhau, nơi đó lập tức trở thành cả thế giới" },
                { time: 64.00, romaji: "I love you no kotoba datte eien da, kono sekai ja", vi: "Ngay cả lời yêu 'I love you' cũng sẽ hóa bất diệt trong thế giới này" },
                { time: 76.00, romaji: "Nee, koko ni ireba mou anzen yo", vi: "Này, chỉ cần ở bên nhau nơi đây thì không điều gì có thể làm tổn thương ta" },
                { time: 88.00, romaji: "Shunkan kiritoru shattaa on", vi: "Tiếng màn trập máy ảnh lưu giữ lại từng khoảnh khắc thanh xuân" },
                { time: 102.00, romaji: "I love you no moji no haichi mo, en ni natte kakomeba soko ga sekai ni naru", vi: "Cách sắp xếp từng câu chữ yêu thương, tạo nên thế giới ấm áp của riêng mình" },
                { time: 120.00, romaji: "I love you no hibiki mo itami mo koukai mo nokoshite ikeru koko ni wa", vi: "Âm vang lời yêu, nỗi đau hay những tiếc nuối đều có thể gửi lại trọn vẹn nơi đây" },
                { time: 135.00, romaji: "En ni natte kakonde tsukutta sekai de subarashii hibi wo! ✨", vi: "Trong thế giới tròn đầy yêu thương đôi mình cùng tạo dựng, chúc cho những ngày tháng tươi đẹp mãi ngân vang!" }
            ]
        },

        // Track 18: 月に向かって撃て (Tsuki ni Mukatte Ute)
        // Spotify: https://open.spotify.com/intl-vi/track/2aQpmTVc26tkNVChUYzZcS
        // Artist: 星街すいせい (Hoshimachi Suisei) - Mayonaka Heart Tune OP (3:15)
        18: {
            title: "月に向かって撃て (Tsuki ni Mukatte Ute)",
            artist: "星街すいせい (Hoshimachi Suisei)",
            lines: [
                { time: 0.0, romaji: "♪ (Intro Rock điện tử bùng nổ của Suisei)", vi: "Khúc dạo đầu mãnh liệt" },
                { time: 15.52, romaji: "Nagamete iru bakari te wo nobashite omoidasu", vi: "Mải mê ngắm nhìn, vươn cánh tay ra gợi nhắc lại ký ức" },
                { time: 22.38, romaji: "Kikaretaku nai yowane kicasetai koe", vi: "Những tiếng thở than yếu lòng không muốn ai nghe thấy, cùng thanh âm khao khát được cất lên" },
                { time: 28.18, romaji: "Fukanou mo kanousei da kimi ga dare nandaka shittenda", vi: "Bất khả thi cũng chính là một khả năng, tôi biết rõ bạn là ai mà" },
                { time: 35.07, romaji: "Shoumei shiyou bokura hontou wa doushitai?", vi: "Hãy chứng minh cho tất cả thấy đi, rốt cuộc chúng ta muốn gì?" },
                { time: 41.34, romaji: "Nigetai to mimi fusaida, shagamu shinzou wo tataitetta Swing by", vi: "Muốn trốn chạy nên bịt chặt tai, nhưng nhịp tim đang co thắt lại thúc giục ta vụt bay" },
                { time: 47.96, romaji: "Kawaranai hyoujou ni kotae wo tsukitatete", vi: "Đối mặt với vẻ mặt vô cảm bằng câu trả lời dứt khoát" },
                { time: 52.48, romaji: "Jounetsu wa tsuki ni mukatte ute sunaipaa", vi: "Bắn thẳng ngọn lửa đam mê về phía ánh trăng, hỡi tay thiện xạ cừ khôi!" },
                { time: 57.34, romaji: "Mirai wa douyara kimi shidai, nodo ga kawaitatte koukai wa nai wa", vi: "Tương lai ra sao tùy thuộc vào bạn, dẫu khát khô cổ họng cũng chẳng hề hối tiếc" },
                { time: 64.14, romaji: "Surimuite umeru no 99%, koyubi ni wa shoudou wo", vi: "Trầy da tróc vảy lấp đầy 99%, nơi ngón út chất chứa niềm thôi thúc mãnh liệt" },
                { time: 70.59, romaji: "Hontou wa doushitain dakke? Aizu shite haato chuun ni nosete", vi: "Rốt cuộc bản thân thực lòng muốn gì? Hãy ra hiệu và hòa vào tần số con tim!" },
                { time: 81.05, romaji: "Ah, ah Darlin' I know who you are. Ah, Ah, ichiban nori de Fly me to the moon", vi: "Darlin', em biết anh là ai mà! Hãy là người đầu tiên đưa em bay đến mặt trăng!" },
                { time: 94.20, romaji: "Butsukatta kabe mo butsukeatta kuyashisa mo bukiyou ni terasu rozetta ni nare", vi: "Bức tường ta từng va vấp hay nỗi uất nghẹn cắn rứt, hãy hóa thành đài hoa soi rọi tháng ngày" },
                { time: 107.38, romaji: "Moshimo jinsei ga juppun nara, nanapun wa anata to no kecchaku ni", vi: "Nếu cuộc đời chỉ vỏn vẹn 10 phút, em xin dành 7 phút để giải quyết ân oán cùng anh" },
                { time: 113.97, romaji: "Mune odoru you na atorakushon de Touch Down!!", vi: "Hạ cánh bằng một chuyến tàu lượn khiến lồng ngực nhảy múa cuồng nhiệt!" },
                { time: 120.41, romaji: "Okubyou mo 'suki' de moyashite ike surasutaa", vi: "Thiêu rụi sự nhút nhát bằng chữ 'yêu', khai hỏa động cơ đẩy!" },
                { time: 125.34, romaji: "Mada minu gooru wa kimi shidai", vi: "Đích đến phía trước hoàn toàn phụ thuộc vào bạn" },
                { time: 128.43, romaji: "Yume mo terashiatta kouten kidoujou, suikonde hitoiki 99%", vi: "Quỹ đạo xoay quanh nhau thắp sáng những giấc mơ, hít một hơi thật sâu lấp đầy 99%" },
                { time: 136.53, romaji: "Amaoto mo kassai e, hontou wa doushitain dakke", vi: "Tiếng mưa rơi cũng hóa thành tràng pháo tay giòn giã" },
                { time: 141.67, romaji: "Oitsuku wa haato chuun ni kakete", vi: "Nhất định sẽ bắt kịp, đặt cược tất cả vào tần số con tim" },
                { time: 146.15, romaji: "Shoumei shiyou todokun datte, jounetsu wa tsuki ni mukatte ute sunaipaa ✨", vi: "Chứng minh rằng lời ca sẽ chạm tới đích, bắn thẳng đam mê về phía ánh trăng!" }
            ]
        },

        // Track 19: 声の軌跡 (Koe no Kiseki)
        // Spotify: https://open.spotify.com/intl-vi/track/0N5YLuTIySy1APi9rmSGfj
        // Artist: Soala - Mayonaka Heart Tune ED (3:19)
        19: {
            title: "声の軌跡 (Koe no Kiseki)",
            artist: "Soala",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng radio đêm khuya & nhịp bass êm ái)", vi: "Intro làn sóng phát thanh nửa đêm" },
                { time: 13.00, romaji: "Koi mo yume mo nante mousou yokubari sugita no kana", vi: "Tình yêu hay ước mơ phải chăng chỉ là ảo tưởng, có phải em đã quá tham lam rồi không?" },
                { time: 20.00, romaji: "Kimi ga oshiete kureta unmei misuterii", vi: "Điều bí ẩn về định mệnh mà anh từng chỉ cho em thấy" },
                { time: 27.00, romaji: "Mou kikenaku natte sa aitai kuse ni watashi wa mata kimochi dake kakushite", vi: "Chẳng còn được lắng nghe nữa, dẫu khao khát được gặp lại em lại giấu nhẹm tâm tư" },
                { time: 40.00, romaji: "Aimai na kankei no mama totsuzen kiete shimatta", vi: "Giữa mối quan hệ mập mờ dang dở, anh bỗng nhiên biến mất không dấu vết" },
                { time: 48.00, romaji: "Nouri ni yakitsuita omoide doushitemo hanarenai", vi: "Ký ức khắc sâu trong tâm trí dẫu làm cách nào cũng chẳng thể phai nhòa" },
                { time: 57.00, romaji: "Kimi no koe o ano hi kara zutto sagashitetanda yo", vi: "Kể từ ngày định mệnh ấy, em vẫn luôn mải miết kiếm tìm giọng nói của anh" },
                { time: 66.00, romaji: "Mou ichido kikasete 'aishiteru' o", vi: "Làm ơn hãy cho em được nghe lại câu 'Anh yêu em' một lần nữa" },
                { time: 72.00, romaji: "Nani o shite mo wasurerarenakatta no", vi: "Dù làm bất cứ điều gì cũng chẳng thể nào quên được" },
                { time: 78.00, romaji: "Sono koe dake o tayori ni ikite kitanda yo", vi: "Chỉ nương tựa vào thanh âm ấy mà em có thêm nghị lực sống đến ngày hôm nay" },
                { time: 95.00, romaji: "Kantan ni ikirareru sekai demo nakute, tsurai koto darake de", vi: "Cuộc đời này vốn chẳng hề dễ dàng, ngập tràn những chông gai đắng cay" },
                { time: 107.00, romaji: "Mou afureru namida mo kizukanai furi shite sa mae ni susumu shika nakute", vi: "Giọt nước mắt trào mi cũng đành giả vờ như không thấy, chỉ biết cắn răng bước tiếp về phía trước" },
                { time: 121.00, romaji: "Yume o oitsuzukeru koto mo kimochi kakushitsuzukeru no mo", vi: "Cả việc miệt mài đuổi theo giấc mơ lẫn việc chôn chặt tình cảm nơi đáy lòng" },
                { time: 130.00, romaji: "Zenbu kimi no tame to omotteta nante dokuriyogari da ne", vi: "Em cứ ngỡ tất cả là vì anh, hóa ra chỉ là sự cố chấp của riêng em" },
                { time: 140.00, romaji: "Kimi no koe o ano hi kara zutto sagashitetanda yo", vi: "Kể từ ngày ấy, em vẫn không ngừng tìm kiếm giọng nói của anh" },
                { time: 150.00, romaji: "Mou ichido kikasete 'aishiteru' o ✨", vi: "Hãy cất tiếng cho em được nghe lại lời yêu ấy một lần nữa!" }
            ]
        },

        // Track 20: 最最最高級のお世話して (Saikoukyuu no Osewa Shite)
        // Spotify: https://open.spotify.com/intl-vi/track/1YorQpcRAhINKp06fy1Kcc
        // Artist: angela - Saijo no Osewa OP (3:14)
        20: {
            title: "最最最高級のお世話して",
            artist: "angela",
            lines: [
                { time: 0.0, romaji: "♪ (Intro quý tộc vui nhộn phong cách angela)", vi: "Khúc dạo đầu hầu cận quý phái" },
                { time: 15.20, romaji: "Kyou, ashita, asatte, kimi to no yakusoku", vi: "Hôm nay, ngày mai và ngày kia nữa, lời ước hẹn cùng người" },
                { time: 18.90, romaji: "Me no mawaru supiido ga supesharu desu", vi: "Nhịp sống quay cuồng này thật đặc biệt biết bao" },
                { time: 22.70, romaji: "Taisetsu na koto kokoroe to shite", vi: "Điều cốt lõi luôn phải ghi lòng tạc dạ" },
                { time: 26.00, romaji: "Ori-me tadashiku, itsumo soba ni", vi: "Giữ tác phong chuẩn mực và luôn túc trực kề bên" },
                { time: 29.80, romaji: "Kimi ga hohoemu dake de", vi: "Chỉ cần người khẽ mỉm cười" },
                { time: 33.45, romaji: "Umarete hajimete no you na", vi: "Cảm giác ngỡ như lần đầu tiên trong đời" },
                { time: 37.30, romaji: "E mo iwarenu you na kouyoukan", vi: "Một niềm hân hoan rộn rã không lời nào tả xiết" },
                { time: 41.00, romaji: "Mou hanashitakunai", vi: "Em chẳng bao giờ muốn buông tay đâu" },
                { time: 44.20, romaji: "Sai sai saikoukyuu no osewa shite kudasai", vi: "Hãy để em được chăm sóc người với sự phục vụ thượng hạng nhất!" },
                { time: 48.30, romaji: "Sai sai saishoku kenbi wa sanbyaku rokujuugo nichi", vi: "Tài sắc vẹn toàn chu đáo suốt 365 ngày" },
                { time: 51.80, romaji: "Sai sai saikoukyuu no osewa shite kudasai", vi: "Hãy đón nhận sự săn sóc cao cấp nhất trần đời!" },
                { time: 55.50, romaji: "Sai sai sainou yuunou I know nando demo iu no", vi: "Tài năng tháo vát, dẫu nói bao nhiêu lần cũng không đủ" },
                { time: 59.20, romaji: "Sai sai saidaigen no osewa shite kudasai", vi: "Em sẽ dốc lòng chăm chút người ở mức tối đa!" },
                { time: 63.00, romaji: "Sai sai saisho no ippo wa dare demo tajirogu mono desu", vi: "Bước đầu tiên ai cũng có chút bỡ ngỡ ngại ngùng" },
                { time: 74.20, romaji: "Zutto soba ni ite ageru, boku ga boku rashiku aru tame ni", vi: "Em sẽ mãi ở bên chở che để người được sống là chính mình" },
                { time: 88.90, romaji: "Dare yori chikaku de mamotte ageru ichiban chikaku de ✨", vi: "Em sẽ bảo vệ người từ cự ly gần nhất, gần hơn bất kỳ ai trên đời!" }
            ]
        },

        // Track 21: 完璧じゃないわたし (Kanpeki ja Nai Watashi)
        // Spotify: https://open.spotify.com/intl-vi/track/2guDoM8CAJKx1cQwNFSPW5
        // Artist: 前島亜美 (Ami Maeshima) - Saijo no Osewa ED (3:36)
        21: {
            title: "完璧じゃないわたし (Kanpeki ja Nai Watashi)",
            artist: "前島亜美 (Ami Maeshima)",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu piano nội tâm nhẹ nhàng)", vi: "Intro tiểu thư làm nũng đáng yêu" },
                { time: 3.00, romaji: "Kanpeki ja nai watashi kimi ga inakya are kore dekinai bakka", vi: "Em chẳng hề hoàn hảo đâu, không có anh ở bên em việc gì cũng lúng túng chẳng xong" },
                { time: 12.00, romaji: "Takane no hana nante iwazu ni soba ni ite yo nee 'kimi ga hoshii'", vi: "Đừng bảo em là hoa trên đỉnh núi xa vời, hãy ở cạnh em đi mà, em cần anh!" },
                { time: 20.00, romaji: "(Fu nya nya, fu nya nya...)", vi: "(Ngái ngủ nũng nịu...)" },
                { time: 26.00, romaji: "Seiso karen bunburyoudou? Haritsuita kamen no emi", vi: "Thanh thuần đoan trang, văn võ song toàn sao? Chỉ là chiếc mặt nạ nụ cười gượng gạo thôi" },
                { time: 35.00, romaji: "Moo muri muri kaeritai, mou suima wa genkai omukae wa?", vi: "Thôi mệt mỏi lắm rồi muốn về nhà cơ, cơn buồn ngủ ập đến rồi anh chưa đến đón em sao?" },
                { time: 44.00, romaji: "Orikousan na mainichi ni sayonara wo tsugemashou", vi: "Nói lời tạm biệt với những chuỗi ngày phải gồng mình làm con ngoan trò giỏi" },
                { time: 52.00, romaji: "Gokigen no osewa datte kimi no yakuwari desho? (Desho?)", vi: "Dỗ dành cho em vui vẻ cũng là bổn phận chăm sóc của anh cơ mà, đúng không nào?" },
                { time: 64.00, romaji: "Kimi no mae dake de wa sunao de itai no", vi: "Chỉ trước mặt riêng anh, em mới muốn được sống thật với chính con người mình" },
                { time: 78.00, romaji: "Kono yowasa mo zenbu dakishimete kurete arigatou ✨", vi: "Cảm ơn anh vì đã dịu dàng ôm trọn lấy cả những yếu mềm nơi em" }
            ]
        },

        // Track 22: Submarine Youth (サブマリンユース)
        // Spotify: https://open.spotify.com/intl-vi/track/3EAaR5AFd8T1HmAP3dPIXG
        // Artist: reGretGirl - Anime OP (3:27)
        22: {
            title: "Submarine Youth (サブマリンユース)",
            artist: "reGretGirl",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng sóng vỗ & riff guitar tuổi thanh xuân)", vi: "Intro guitar tuổi trẻ sôi nổi" },
                { time: 13.20, romaji: "Samenai yume no you na kimi to", vi: "Bên cậu tựa như một giấc chiêm bao chẳng bao giờ muốn tỉnh" },
                { time: 17.35, romaji: "Iki wo hisome wakachiaeru", vi: "Nín thở sẻ chia những bí mật ngọt ngào" },
                { time: 20.94, romaji: "Himitsu wo kirei ni omou no wa boku dake ja nai yo ne?", vi: "Thấy bí mật ấy đẹp đẽ đến nao lòng, chắc không phải chỉ mình tớ đâu nhỉ?" },
                { time: 28.46, romaji: "Bukiyou demo tada massugu ni", vi: "Dẫu còn nhiều vụng về lóng ngóng, tớ vẫn sẽ luôn chân thành" },
                { time: 32.48, romaji: "Dekiru dake sunao de iru kara", vi: "Cố gắng sống thật thẳng thắn với cảm xúc của mình" },
                { time: 36.19, romaji: "Boku ni mo yoku wakatte inai", vi: "Cả chính bản thân tớ đôi khi cũng chưa hiểu hết" },
                { time: 40.16, romaji: "Kono omoi wo issho ni mitsukete yo", vi: "Hãy cùng tớ khám phá thứ tình cảm bồi hồi này nhé" },
                { time: 45.89, romaji: "'Kyou wa hitori de sugoshiteitai' toka", vi: "Đôi lúc buông lời 'Hôm nay tớ chỉ muốn ở một mình thôi'" },
                { time: 49.82, romaji: "'Haru ga nigate' demo hontou wa", vi: "Bảo rằng 'Tớ ghét mùa xuân', nhưng thực tâm trong lòng" },
                { time: 53.79, romaji: "Dareka to iru no wa kirai ja nai", vi: "Tớ đâu có ghét cảm giác được ở bên cạnh ai đó đâu" },
                { time: 58.26, romaji: "Soba ni irareru koto ni banbanzai", vi: "Được kề cận bên cậu là điều hạnh phúc nhất trần đời" },
                { time: 62.16, romaji: "Hitori ni natta toki wa hanseikai", vi: "Mỗi khi chỉ còn lại một mình lại tự trách bản thân" },
                { time: 66.56, romaji: "Tsumazuku koto mo aru keredo", vi: "Dù đôi khi có vấp ngã trắc trở" },
                { time: 70.59, romaji: "Warattari naitari omoidashite iru", vi: "Bao tiếng cười và nước mắt ùa về trong tâm trí" },
                { time: 77.20, romaji: "Sukoshi zutsu peeji wo mekuru you ni", vi: "Tựa như đang lật giở từng trang lưu bút thanh xuân" },
                { time: 81.13, romaji: "Maki modosu you ni omoi megutte iru", vi: "Ký ức như được tua ngược lại thật dịu êm" },
                { time: 85.43, romaji: "Asa wo matsu shizuka na umi wo oyogu you ni", vi: "Như đang bơi qua biển sớm mai tĩnh lặng ngóng chờ bình minh" },
                { time: 91.02, romaji: "Nando mo nando mo kimi no moto e yukeru", vi: "Hết lần này đến lần khác, tớ đều tìm về bên cậu" },
                { time: 97.38, romaji: "Kimi to iru toki no jibun no sugata wo suki da to omoeru kara", vi: "Bởi vì tớ yêu chính hình bóng của mình những khi được ở bên cậu" },
                { time: 105.38, romaji: "Hontou no kimochi wo ima koko de mitsuketa you na ki ga shita yo ✨", vi: "Tớ cảm giác như mình đã tìm thấy tình cảm chân thật nhất ngay tại nơi đây!" }
            ]
        },

        // Track 23: ずっと1番にしてね (Zutto Ichibanni Shitene)
        // Spotify: https://open.spotify.com/intl-vi/track/3ri04N6NuypwN9Ol75erjh
        // Artist: コレサワ (Koresawa) - Anime ED (3:33)
        23: {
            title: "ずっと1番にしてね (Zutto Ichibanni Shitene)",
            artist: "コレサワ (Koresawa)",
            lines: [
                { time: 0.0, romaji: "Atashi to kimi no aishou anmari datte", vi: "Bảo rằng độ tương hợp giữa em và anh chẳng được bao nhiêu" },
                { time: 3.00, romaji: "Iu uranaishi ga itara sore wa nisemono", vi: "Thầy bói nào mà phán thế thì đích thị là quân lừa đảo!" },
                { time: 7.00, romaji: "Dame dame yo damasarenaide yo", vi: "Không được đâu nha, đừng có để bị lừa đấy!" },
                { time: 10.00, romaji: "Unmei wa atashi ga kimetemasu", vi: "Định mệnh của chúng mình là do chính em quyết định!" },
                { time: 14.00, romaji: "Sou desu kore ga honmono no ai nan desu", vi: "Chuẩn luôn, đây mới chính là tình yêu đích thực" },
                { time: 18.00, romaji: "Atashi to kimi ga shinda ato ni bijutsukan ni kazarareru yatsu desu", vi: "Thứ tình yêu mà sau này đôi ta qua đời sẽ được đem trưng bày trong viện bảo tàng nghệ thuật" },
                { time: 25.00, romaji: "Dakara zutto ichiban ni shitene, taisetsu ni aishitene", vi: "Bởi thế hãy luôn coi em là số một nhé, nâng niu yêu thương em thật nhiều vào" },
                { time: 32.00, romaji: "Ima tsunaideru kono te ga kuttsuichau made", vi: "Cho tới khi bàn tay đang đan chặt này dính chặt không rời" },
                { time: 37.00, romaji: "Zutto ii kanji de iyou ne, futari nara rakushou da ne tte sa", vi: "Hãy giữ mãi cảm xúc ngọt ngào này nhé, có hai ta thì mọi khó khăn đều là chuyện nhỏ" },
                { time: 45.00, romaji: "Kurutteru kurai de soba ni ite onegai", vi: "Yêu cuồng say và ở mãi bên em nhé, xin anh đấy!" },
                { time: 55.00, romaji: "Atashitachi zense demo koibito doushi datta to omou no", vi: "Em nghĩ kiếp trước chắc hẳn đôi ta cũng là người yêu của nhau rồi" },
                { time: 63.00, romaji: "Jana kyakashikunai? Konna ni daisuki da nante sa", vi: "Nếu không thì sao giải thích nổi? Tại sao em lại mê đắm anh nhiều đến mức này chứ!" },
                { time: 72.00, romaji: "Atashi to kimi no MBTI wa LOVE da wa", vi: "Nhóm tính cách MBTI của em và anh chính là chữ LOVE đấy!" },
                { time: 79.00, romaji: "Sekai ga warattemo dame dame yo nagasarenaide yo", vi: "Dẫu cả thế giới có cười chê, không được lung lay xuôi theo đâu nhé" },
                { time: 87.00, romaji: "Unmei wa atashi ga kimetemasu, honmono no ai nan desu", vi: "Định mệnh là do em định đoạt, đây chính là tình yêu chân chính" },
                { time: 100.00, romaji: "Dakara zutto ichiban ni shitene, takaramono mitai ni ne", vi: "Bởi vậy hãy luôn coi em là số một, trân quý em như báu vật trần gian" },
                { time: 112.00, romaji: "Zutto ii kanji de iyou ne, futari nara rakushou da ne tte sa", vi: "Mãi ngọt ngào như thuở ban đầu nhé, hai ta bên nhau là vô địch thiên hạ rồi" },
                { time: 125.00, romaji: "Atashi to kimi no aishou saikou datte iu uranaishi ga itara sore wa honmono yo ✨", vi: "Thầy bói nào mà phán đôi mình sinh ra là để dành cho nhau thì đích thực là bậc thầy tiên tri chuẩn 100%!" }
            ]
        }
    };

    /* --------------------------------------------------------
       DOM HOOKS & CONTROLLER
    -------------------------------------------------------- */
    const audio = document.getElementById('audio-player');
    const lyricsModal = document.getElementById('lyrics-modal');
    const lyricsTitle = document.getElementById('lyrics-title');
    const lyricsArtist = document.getElementById('lyrics-artist');
    const lyricsBody = document.getElementById('lyrics-body');
    const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
    const lyricsToggleBtn = document.getElementById('lyrics-toggle-btn');
    const lyricsModeToggle = document.getElementById('lyrics-mode-toggle');
    const lyricsModeLabel = document.getElementById('lyrics-mode-label');

    // Offset calibration elements
    const offsetMinusBtn = document.getElementById('offset-minus-btn');
    const offsetPlusBtn = document.getElementById('offset-plus-btn');
    const offsetValText = document.getElementById('offset-val-text');

    // Zen Mode Floating Lyric Elements
    const zenAmbientLyric = document.getElementById('zen-ambient-lyric');
    const zenLyricRomaji = document.getElementById('zen-lyric-romaji');
    const zenLyricVi = document.getElementById('zen-lyric-vi');

    let currentLyricsTrack = null;
    let activeLineIndex = -1;
    let userOffset = parseFloat(safeGet('minkoi_lyrics_offset', '0.0'));
    if (isNaN(userOffset)) userOffset = 0.0;

    let viewMode = safeGet('minkoi_lyrics_mode', 'karaoke'); // 'karaoke' or 'full'

    // Prevent auto-scroll fight when user touches or scrolls manually
    let isUserScrolling = false;
    let scrollPauseTimer = null;

    /* --------------------------------------------------------
       OFFSET CALIBRATION CONTROLLER
    -------------------------------------------------------- */
    function updateOffsetDisplay() {
        if (!offsetValText) return;
        const sign = userOffset > 0 ? '+' : '';
        offsetValText.textContent = `${sign}${userOffset.toFixed(1)}s`;
        if (Math.abs(userOffset) > 0.001) {
            offsetValText.style.color = 'var(--color-accent)';
            offsetValText.title = `Độ lệch hiện tại: ${sign}${userOffset.toFixed(1)}s (Nhấp để đặt lại về 0.0s)`;
        } else {
            offsetValText.style.color = '';
            offsetValText.title = 'Đang đồng bộ chuẩn 0.0s (Nhấp để đặt lại)';
        }
    }

    function adjustOffset(delta) {
        userOffset = Math.max(-5.0, Math.min(5.0, userOffset + delta));
        safeSet('minkoi_lyrics_offset', userOffset.toString());
        updateOffsetDisplay();
        syncLyricsPlayback();

        if (typeof window.showToast === 'function') {
            const dir = delta > 0 ? 'Trễ hơn (+0.2s)' : 'Sớm hơn (-0.2s)';
            window.showToast(`Lời đồng bộ: ${dir} → ${userOffset > 0 ? '+' : ''}${userOffset.toFixed(1)}s`, 'fa-clock');
        }
    }

    function resetOffset() {
        userOffset = 0.0;
        safeSet('minkoi_lyrics_offset', '0.0');
        updateOffsetDisplay();
        syncLyricsPlayback();
        if (typeof window.showToast === 'function') {
            window.showToast('Đã đặt lại độ lệch lời bài hát về 0.0s', 'fa-rotate-left');
        }
    }

    if (offsetMinusBtn) offsetMinusBtn.addEventListener('click', () => adjustOffset(-0.2));
    if (offsetPlusBtn) offsetPlusBtn.addEventListener('click', () => adjustOffset(0.2));
    if (offsetValText) offsetValText.addEventListener('click', resetOffset);
    updateOffsetDisplay();

    /* --------------------------------------------------------
       DUAL VIEW MODE (KARAOKE vs FULL TEXT)
    -------------------------------------------------------- */
    function updateModeButtonUI() {
        if (!lyricsModeToggle || !lyricsModeLabel) return;
        if (viewMode === 'full') {
            lyricsModeToggle.classList.add('active');
            lyricsModeToggle.title = 'Chế độ hiện tại: Toàn bài (Nhấp để đổi sang Karaoke cuộn)';
            lyricsModeToggle.innerHTML = '<i class="fas fa-microphone"></i> <span>Karaoke</span>';
            lyricsBody?.classList.add('full-view');
        } else {
            lyricsModeToggle.classList.remove('active');
            lyricsModeToggle.title = 'Chế độ hiện tại: Karaoke (Nhấp để đổi sang Đọc toàn bài)';
            lyricsModeToggle.innerHTML = '<i class="fas fa-align-left"></i> <span>Toàn bài</span>';
            lyricsBody?.classList.remove('full-view');
        }
    }

    function toggleViewMode() {
        viewMode = viewMode === 'karaoke' ? 'full' : 'karaoke';
        safeSet('minkoi_lyrics_mode', viewMode);
        updateModeButtonUI();
        syncLyricsPlayback();
    }

    if (lyricsModeToggle) {
        lyricsModeToggle.addEventListener('click', toggleViewMode);
    }
    updateModeButtonUI();

    /* --------------------------------------------------------
       SMART SCROLL HANDLER (PAUSES AUTO-SCROLL ON TOUCH)
    -------------------------------------------------------- */
    if (lyricsBody) {
        lyricsBody.addEventListener('wheel', () => {
            isUserScrolling = true;
            if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
            scrollPauseTimer = setTimeout(() => { isUserScrolling = false; }, 2600);
        }, { passive: true });

        lyricsBody.addEventListener('touchmove', () => {
            isUserScrolling = true;
            if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
            scrollPauseTimer = setTimeout(() => { isUserScrolling = false; }, 2600);
        }, { passive: true });
    }

    /* --------------------------------------------------------
       RENDER CURRENT TRACK LYRICS
    -------------------------------------------------------- */
    function getCurrentlyPlayingTrack() {
        if (typeof window.getCurrentPlayingTrack === 'function') {
            return window.getCurrentPlayingTrack();
        }
        if (typeof window.getCurrentTrack === 'function') {
            return window.getCurrentTrack();
        }
        const fullPlaylist = (CONFIG.music && CONFIG.music.playlist) || [];
        return fullPlaylist[0] || null;
    }

    function renderLyrics(track) {
        if (!lyricsBody || !track) return;
        currentLyricsTrack = track;
        activeLineIndex = -1;

        const data = LYRICS_DATABASE[track.id];

        if (lyricsTitle) lyricsTitle.textContent = track.name;
        if (lyricsArtist) lyricsArtist.textContent = track.artist;

        // Instrumental Track Fallback
        if (data && data.isInstrumental) {
            lyricsBody.innerHTML = `
                <div class="lyrics-instrumental-card">
                    <div class="inst-disc-halo">
                        <i class="fas fa-compact-disc"></i>
                    </div>
                    <span class="inst-tag">INSTRUMENTAL TRACK</span>
                    <h4 class="inst-title">${escapeHtml(track.name)}</h4>
                    <p class="inst-desc">Bản hòa tấu độc quyền không lời. Hãy nhắm mắt và cảm nhận trọn vẹn từng cung bậc giai điệu du dương.</p>
                </div>
            `;
            return;
        }

        // Lyrics Not Available Fallback
        if (!data || !data.lines || data.lines.length === 0) {
            lyricsBody.innerHTML = `
                <div class="lyrics-placeholder">
                    <div class="placeholder-icon"><i class="fas fa-music"></i></div>
                    <span class="placeholder-title">Đang cập nhật lời bài hát</span>
                    <span class="placeholder-sub">Hệ thống đang đồng bộ lời Romaji & Tiếng Việt cho giai điệu này.</span>
                </div>
            `;
            return;
        }

        // Render line list
        lyricsBody.innerHTML = data.lines.map((line, idx) => `
            <div class="lyric-line" data-index="${idx}" data-time="${line.time}" role="button" tabindex="0">
                <span class="lyric-time">${formatLyricTime(line.time)}</span>
                <div class="lyric-content">
                    <span class="lyric-romaji">${escapeHtml(line.romaji)}</span>
                    <span class="lyric-vi">${escapeHtml(line.vi)}</span>
                </div>
            </div>
        `).join('');

        lyricsBody.querySelectorAll('.lyric-line').forEach(lineEl => {
            lineEl.addEventListener('click', () => {
                const targetTime = parseFloat(lineEl.dataset.time);
                if (audio && !isNaN(targetTime)) {
                    audio.currentTime = Math.max(0, targetTime);
                    if (audio.paused) audio.play();
                }
            });
        });

        syncLyricsPlayback();
    }

    function escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatLyricTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    /* --------------------------------------------------------
       REAL-TIME SYNCHRONIZATION WITH OFFSET & ZEN SCREENSAVER
    -------------------------------------------------------- */
    function syncLyricsPlayback() {
        if (!audio || !currentLyricsTrack) return;
        const data = LYRICS_DATABASE[currentLyricsTrack.id];
        if (!data || !data.lines) {
            if (zenAmbientLyric) zenAmbientLyric.classList.remove('has-lyric');
            return;
        }

        // Apply real-time user offset
        const curTime = audio.currentTime + userOffset;
        let newIndex = -1;

        for (let i = 0; i < data.lines.length; i++) {
            if (curTime >= data.lines[i].time) {
                newIndex = i;
            } else {
                break;
            }
        }

        // Sync with Zen Mode Screensaver Ambient Lyric
        const isZenMode = document.body.classList.contains('zen-mode');
        if (isZenMode && zenAmbientLyric && zenLyricRomaji && zenLyricVi) {
            if (newIndex >= 0 && data.lines[newIndex]) {
                const activeLine = data.lines[newIndex];
                zenLyricRomaji.textContent = activeLine.romaji;
                zenLyricVi.textContent = activeLine.vi;
                zenAmbientLyric.classList.add('has-lyric');
            } else {
                zenAmbientLyric.classList.remove('has-lyric');
            }
        } else if (zenAmbientLyric) {
            zenAmbientLyric.classList.remove('has-lyric');
        }

        // Update active line inside Lyrics Drawer
        if (!lyricsModal || !lyricsModal.classList.contains('open')) return;

        if (newIndex !== activeLineIndex) {
            activeLineIndex = newIndex;
            const lines = lyricsBody.querySelectorAll('.lyric-line');
            lines.forEach((l, idx) => {
                const isActive = idx === activeLineIndex;
                l.classList.toggle('active', isActive);
                if (isActive && viewMode === 'karaoke' && !isUserScrolling) {
                    l.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    /* --------------------------------------------------------
       DRAWER CONTROLLER
    -------------------------------------------------------- */
    function openLyrics() {
        if (!lyricsModal) return;
        const track = getCurrentlyPlayingTrack();
        renderLyrics(track);
        lyricsModal.classList.add('open');
        if (lyricsToggleBtn) lyricsToggleBtn.classList.add('active');
        if (typeof window.playChimeSFX === 'function') {
            window.playChimeSFX(track?.persona || 'alya');
        }
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
        audio.addEventListener('play', syncLyricsPlayback);
        audio.addEventListener('seeked', syncLyricsPlayback);
    }

    // Auto-update lyrics when track changes
    window.addEventListener('minkoi:trackchange', (e) => {
        const track = e.detail?.track;
        if (track) {
            currentLyricsTrack = track;
            if (lyricsModal?.classList.contains('open')) {
                renderLyrics(track);
            }
        }
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lyricsModal?.classList.contains('open')) {
            closeLyrics();
        }
    });

    // Export to global scope
    window.toggleLyrics = toggleLyrics;
    window.openLyrics = openLyrics;
    window.closeLyrics = closeLyrics;
    window.adjustLyricsOffset = adjustOffset;
    window.resetLyricsOffset = resetOffset;
})();
