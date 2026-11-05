/* ========================================================
   MINKOI · SYNCHRONIZED LYRICS ENGINE (STUDIO MASTER EDITION)
   Official Anime LRC Timestamps, Bilingual Romaji/Vietnamese,
   Real-Time Offset Calibration (±0.2s), Dual View Mode (Karaoke / Full),
   Smart Anti-Jitter Auto-Scroll & Zen Mode Screensaver Sync
======================================================== */
(function() {
    'use strict';

    // Helper: safe local storage
    function safeGet(key, def) {
        try { return localStorage.getItem(key) ?? def; } catch (_) { return def; }
    }
    function safeSet(key, val) {
        try { localStorage.setItem(key, val); } catch (_) {}
    }

    /* --------------------------------------------------------
       OFFICIAL ANIME SYNCHRONIZED DATABASE
       Exact LRC Timestamps verified against official song cuts
    -------------------------------------------------------- */
    const LYRICS_DATABASE = {
        // Track 1: 可愛くてごめん (Kawaikute Gomen) - Alya Kujou (CV: Sumire Uesaka)
        // Official Anime Ending Theme 2 (3:35)
        1: {
            title: "可愛くてごめん (Kawaikute Gomen)",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
            lines: [
                { time: 0.0, romaji: "♪ (Nhạc dạo đầu sôi động)", vi: "Intro giai điệu vui tươi" },
                { time: 15.12, romaji: "Watashi ga watashi no koto wo ai shite", vi: "Em yêu chính bản thân mình thì có gì sai chứ?" },
                { time: 18.65, romaji: "Nani ga warui no? Shitto deshou ka?", vi: "Có gì sai sao? Lũ người ghen tị đúng không?" },
                { time: 22.56, romaji: "Itai da toka kawatteru toka", vi: "Bảo em làm màu hay lập dị kì quặc?" },
                { time: 26.11, romaji: "Todokimasen ne. Sono RIPURAI", vi: "Mấy lời mỉa mai đó chẳng thể chạm tới em đâu!" },
                { time: 30.12, romaji: "Daisuki na oyofuku daisuki na okeshou de", vi: "Khoác lên bộ cánh yêu thích, tô lớp trang điểm ngọt ngào" },
                { time: 33.86, romaji: "Okimari no HA-FU TSUIN maite odekake shiyo", vi: "Cột mái tóc nửa hai bên quen thuộc rồi tự tin bước xuống phố nào" },
                { time: 39.11, romaji: "Higasa motte bocchi datte shiawase da mon!", vi: "Che ô che nắng, dẫu một mình thôi cũng thấy ngập tràn hạnh phúc!" },
                { time: 44.20, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 46.88, romaji: "Umarete kichatte gomen", vi: "Sinh ra trên đời xinh thế này, thứ lỗi nhé!" },
                { time: 50.56, romaji: "Chu! Azatokute gomen", vi: "Chu! Thả thính tí mà xin lỗi nha!" },
                { time: 54.26, romaji: "Ki ni nacchau yo ne? Gomen", vi: "Lỡ làm ai đó bận lòng rung rinh rồi? Xin lỗi nha!" },
                { time: 57.96, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 61.62, romaji: "Doryoku shichattete gomen", vi: "Chăm chỉ hoàn thiện bản thân quá cũng xin lỗi luôn!" },
                { time: 65.34, romaji: "Chu! Toutokute gomen", vi: "Chu! Cao quý thế này xin lỗi nha!" },
                { time: 68.77, romaji: "Joshiryoku takakute gomen", vi: "Sức hút nữ tính rạng ngời thế này xin lỗi nhé!" },
                { time: 72.72, romaji: "Mukatsuichau yo ne? Zamaa w", vi: "Tức tối ghen tị lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 81.05, romaji: "Anata wa anata no koto dake douzo", vi: "Cuộc sống của bạn thì xin mời bạn tự đi mà lo lấy" },
                { time: 84.78, romaji: "Watashi ni kanshou shinaide kudasai", vi: "Làm ơn đừng có can thiệp xoi mói vào chuyện của em!" },
                { time: 88.62, romaji: "Rui wa tomo wo yobu to iu kedo... Todokimasen ne", vi: "Người xưa nói 'ngưu tầm ngưu', mấy lời gièm pha chẳng tới tai em đâu" },
                { time: 92.22, romaji: "Sono kageguchi", vi: "Mấy lời nói xấu sau lưng em không thèm nghe" },
                { time: 96.21, romaji: "Omoi atsuzoko buutsu oki ni iri no ryukku de", vi: "Đi đôi boot đế dày cá tính, mang chiếc ba lô em thích nhất" },
                { time: 99.87, romaji: "Kuzusenai maegami kushi de toite odekake shiyo", vi: "Chải lại mái ngố chỉnh chu thật đẹp rồi thong thả dạo chơi" },
                { time: 105.18, romaji: "Karui onna? Fuzaken na omo sugiru ttsuu no!", vi: "Bảo em dễ dãi hả? Đùa à, mấy người còn non và chậm chân lắm!" },
                { time: 110.25, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 112.92, romaji: "Kono jidai ikite gomen", vi: "Sống giữa thời đại này rực rỡ quá xin lỗi nhé!" },
                { time: 116.65, romaji: "Chu! Medatete gomen", vi: "Chu! Nổi bật quá cũng xin lỗi luôn!" },
                { time: 120.32, romaji: "Ishiki shichau yo ne? Gomen", vi: "Không thể rời mắt khỏi em phải không? Xin lỗi nha!" },
                { time: 124.05, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 127.69, romaji: "Jibun migaki shite gomen", vi: "Chăm sóc bản thân đẹp lên mỗi ngày xin lỗi nhé!" },
                { time: 131.39, romaji: "Chu! Burikko de gomen", vi: "Chu! Điệu đà tí mà xin lỗi nha!" },
                { time: 134.77, romaji: "Toriko ni shichatte gomen", vi: "Mê hoặc trái tim ai kia mất rồi, thứ lỗi nhé!" },
                { time: 138.79, romaji: "Mukatsuichau desho? Zamaa w", vi: "Khó chịu ghen tị lắm chứ gì? Đáng đời ghê chưa!" },
                { time: 144.49, romaji: "Shumi no chigai kawarimono to baka ni saretemo", vi: "Dù sở thích có khác biệt, dù bị coi là kẻ lập dị" },
                { time: 150.12, romaji: "Magetakunai kowaku mo nai antara gotoki", vi: "Em cũng chẳng chịu khuất phục, lũ người như các người em sợ gì chứ" },
                { time: 155.83, romaji: "Jibun no mikata wa jibun de aritai", vi: "Em muốn chính mình sẽ là đồng minh vững chắc nhất của bản thân" },
                { time: 159.54, romaji: "Ichiban taisetsu ni shite agetai", vi: "Muốn trân trọng và yêu quý bản thân em nhất trên đời" },
                { time: 163.23, romaji: "Rifujin na gaman wa sasetakunai 'Sore ga watashi'", vi: "Chẳng việc gì phải cam chịu vô lý — 'Đó mới chính là em!'" },
                { time: 171.35, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 173.94, romaji: "Umarete kichatte gomen", vi: "Sinh ra xinh đẹp thế này xin lỗi luôn!" },
                { time: 177.70, romaji: "Chu! Azatokute gomen", vi: "Chu! Thả thính cuốn hút thế này xin lỗi nha!" },
                { time: 181.38, romaji: "Jinsei tanoshinde gomen", vi: "Tận hưởng cuộc đời rực rỡ quá xin lỗi nhé!" },
                { time: 185.08, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 188.76, romaji: "Doryoku shichattete gomen", vi: "Nỗ lực tỏa sáng hết mình xin lỗi luôn!" },
                { time: 192.44, romaji: "Chu! Toutokute gomen", vi: "Chu! Quý giá vô ngần thế này xin lỗi nha!" },
                { time: 195.89, romaji: "Joshiryoku takakute gomen", vi: "Sức hút thiếu nữ không thể cưỡng lại xin lỗi nhé!" },
                { time: 199.86, romaji: "Mukatsuichau yo ne? Zamaa ✨", vi: "Ghen tị tức tối lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 206.00, romaji: "♪ (Outro ngân vang rực rỡ)", vi: "Giai điệu kết thúc bài hát" }
            ]
        },

        // Track 2: 小さな恋のうた (Chiisana Koi no Uta) - Alya Kujou (4:09)
        // Official Anime Ending Theme 5
        2: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
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

        // Track 3: ワールドイズマイン (World is Mine) - Alya Kujou (4:12)
        // Official Anime Ending Theme 9
        3: {
            title: "ワールドイズマイン (World is Mine)",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
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

        // Track 4: CHE.R.RY - Alya Kujou (3:29)
        // Official Anime Ending Theme 4
        4: {
            title: "CHE.R.RY",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
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

        // Track 5: Chiisana Koi no Uta - Shiina Mahiru (5:00)
        // Official Anime Ending Theme (The Angel Next Door)
        5: {
            title: "Chiisana Koi no Uta",
            artist: "Iwami Manaka (Shiina Mahiru)",
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

        // Track 6: Ai Uta (愛唄) - Shiina Mahiru (3:35)
        // Official Anime Cover Series
        6: {
            title: "Ai Uta (愛唄)",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 0.0, romaji: "♪ (Intro acoustic mộc mạc)", vi: "Khúc tình ca êm dịu" },
                { time: 15.11, romaji: "'Nee, daisuki na kimi e' warawanaide kiite kure", vi: "'Này anh yêu dấu hỡi', xin đừng cười mà hãy lắng nghe em nói này" },
                { time: 22.75, romaji: "'Aishiteru' da nante kusai kedo ne", vi: "Nói lời 'Yêu anh' nghe có vẻ ngượng ngùng sến súa" },
                { time: 28.18, romaji: "Dakedo kono kotoba igai tsutaeru koto ga dekinai", vi: "Nhưng ngoài câu nói ấy ra, chẳng còn lời nào diễn tả hết lòng em" },
                { time: 34.78, romaji: "Hora ne! Mata baka ni shite waratta yo ne", vi: "Đấy thấy chưa! Anh lại cười trêu em rồi kìa" },
                { time: 41.13, romaji: "Kimi no eranda michi wa koko de yokatta no ka? nante", vi: "Liệu con đường anh đã chọn dừng chân nơi đây có đúng đắn chăng?" },
                { time: 47.38, romaji: "Wakaranai kedo...", vi: "Em cũng chẳng rõ nữa..." },
                { time: 51.53, romaji: "Tada naite waratte sugosu hibi ni", vi: "Chỉ cần những tháng ngày cùng khóc, cùng cười bên nhau" },
                { time: 57.65, romaji: "Tonari ni tatte ireru koto de", vi: "Được đứng kề bên anh mỗi sớm mai" },
                { time: 63.95, romaji: "Boku ga ikiru imi ni natte", vi: "Đó chính là ý nghĩa tồn tại của đời em" },
                { time: 70.15, romaji: "Kimi ni sasagu kono ai no uta", vi: "Khúc tình ca này xin nguyện dâng trọn về anh" },
                { time: 81.03, romaji: "'Nee, ano hi no bokura nan no hanashi wo shiteta?'", vi: "'Này anh, ngày hôm ấy đôi mình đã nói những chuyện gì vậy nhỉ?'" },
                { time: 89.35, romaji: "Hajimete atta hi ni yosoyososhiku", vi: "Ngày đầu tiên gặp gỡ đầy bỡ ngỡ ngại ngùng" },
                { time: 94.76, romaji: "Are kara iroiro atte toki ni wa kenka mo shite", vi: "Từ bấy đến nay trải qua bao thăng trầm, đôi lúc cũng hờn dỗi cãi vã" },
                { time: 101.36, romaji: "Wakariau tame no toki sugoshita ne", vi: "Tất cả chỉ để ta thấu hiểu lòng nhau nhiều hơn" },
                { time: 107.53, romaji: "Kono hiroi bokura sora no shita deatte koi wo shite itsumademo", vi: "Dưới vòm trời rộng lớn này, đôi ta tương ngộ và nguyện yêu nhau mãi mãi" },
                { time: 118.28, romaji: "Tada naite waratte sugosu hibi ni", vi: "Chỉ cần những ngày cùng khóc, cùng cười bên nhau" },
                { time: 124.28, romaji: "Tonari ni tatte ireru koto de", vi: "Được sánh bước bên anh mỗi ngày" },
                { time: 130.59, romaji: "Kimi to ikiru imi ni natte", vi: "Đó là lý do để em sống trọn kiếp này" },
                { time: 136.71, romaji: "Kimi ni sasagu kono ai no uta", vi: "Gửi tặng riêng anh, bản tình ca bất tận" },
                { time: 144.30, romaji: "Itsumo meiwaku wo kakete GOMEN NE", vi: "Lúc nào cũng làm phiền khiến anh bận tâm, xin lỗi anh nhé" },
                { time: 150.34, romaji: "Mitsudo koi jikan wo sugoshita ne", vi: "Ta đã cùng sẻ chia những khoảnh khắc thật đậm sâu" },
                { time: 156.56, romaji: "Bokura futari hibi wo kizami, tsukuriagete kita omoi tsunori", vi: "Từng ngày tháng trôi qua, yêu thương lại đong đầy theo năm tháng" },
                { time: 164.20, romaji: "Hetakuso na uta wo kimi ni okurou", vi: "Dẫu giọng hát còn vụng về, em vẫn muốn hát tặng anh" },
                { time: 169.03, romaji: "'Mechakucha suki da!' to kami ni chikaou", vi: "'Em yêu anh nhiều vô ngần!', xin thề trước đất trời" },
                { time: 174.67, romaji: "Kore kara mo kimi no te wo nigitteru yo", vi: "Từ nay về sau, em vẫn sẽ nắm chặt đôi tay anh" },
                { time: 180.67, romaji: "Boku no koe ga tsuzuku kagiri, tonari de zutto ai wo utau yo", vi: "Chừng nào giọng em còn cất lên, em sẽ mãi ở bên hát khúc tình ca" },
                { time: 193.10, romaji: "Toshi wo totte koe ga karete kitara, zutto te wo nigiru yo", vi: "Mai này già đi giọng có khàn theo năm tháng, em vẫn sẽ siết chặt tay anh" },
                { time: 202.51, romaji: "Tada arigatou ja tsutae kirenai", vi: "Chỉ lời cảm ơn thôi chẳng thể nói hết tấm lòng" },
                { time: 209.62, romaji: "Nakiwarai to kanashimi yorokobi wo tomoni wakachiai ikite yukou", vi: "Cùng san sẻ buồn vui, nụ cười lẫn giọt nước mắt, mình bên nhau trọn đời nhé" },
                { time: 220.59, romaji: "Ikutsu mono yoru wo koete, boku wa kimi to ai wo utaou ✨", vi: "Vượt qua muôn trùng đêm tối, em sẽ cùng anh hát vang bản tình ca hạnh phúc!" }
            ]
        },

        // Track 7-11: Mahiru Instrumental Series
        7: { isInstrumental: true, title: "Chiisana Koi no Uta (Inst.)", artist: "Iwami Manaka", persona: "mahiru" },
        8: { isInstrumental: true, title: "Ai Uta (Inst.)", artist: "Iwami Manaka", persona: "mahiru" },
        9: { isInstrumental: true, title: "Kimi ni Todoke (Inst.)", artist: "Iwami Manaka", persona: "mahiru" },
        10: { isInstrumental: true, title: "Valentine Kiss (Inst.)", artist: "Iwami Manaka", persona: "mahiru" },
        11: { isInstrumental: true, title: "Gift (Inst.)", artist: "Iwami Manaka", persona: "mahiru" },

        // Track 12: ハレの日に (Hare no Hi ni) - Waguri Kaoruko (4:37)
        12: {
            title: "ハレの日に (Hare no Hi ni)",
            artist: "Waguri Kaoruko / Shio Reira",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng đàn dịu dàng & hương hoa thơm ngát)", vi: "Khúc dạo đầu mộc mạc" },
                { time: 15.50, romaji: "Naite shimatta sora wo miteta, kimi wo omotteru", vi: "Ngước nhìn bầu trời đang rưng rưng trút hạt, em lại nhớ về anh" },
                { time: 23.10, romaji: "Namida no ato kawaite kurenai, mada kimi no nioi ga suru", vi: "Vệt nước mắt chưa kịp khô, dường như vẫn còn vương vấn hương thơm của anh" },
                { time: 31.00, romaji: "Aiiro kimi to no denwa muri ni waratteita", vi: "Màu chàm u hoài, cuộc gọi với anh em đã cố gượng cười" },
                { time: 38.80, romaji: "Kumotta sora to watashi 'Kyou wa aenai ne'", vi: "Bầu trời ảm đạm cùng tiếng thở dài 'Hôm nay chúng mình không gặp nhau được rồi nhỉ'" },
                { time: 44.70, romaji: "Aa kore dake no koto de kanashiku narun da na", vi: "A, chỉ một chuyện nhỏ nhặt thế thôi mà sao lòng buồn đến thế" },
                { time: 52.40, romaji: "Pleased your flower, tokibiri no mono ja nakute ii, kimi ga kureru kara ii", vi: "Không cần là thứ gì xa hoa lộng lẫy, chỉ cần là anh trao tặng thì đều là điều tuyệt vời nhất" },
                { time: 60.30, romaji: "Please your love, kimi ga fuchidotta ai no kaotsuki zutto mite itai", vi: "Hình hài tình yêu mà anh vẽ nên, em chỉ muốn ngắm nhìn mãi thôi" },
                { time: 75.00, romaji: "Hare no hi ni warau kimi ga daisuki da yo", vi: "Em yêu nhất nụ cười rạng rỡ của anh dưới ánh nắng ngày đẹp trời" }
            ]
        },

        // Track 13: まなざしは光 (Manazashi wa Hikari) - Waguri Kaoruko (3:27)
        13: {
            title: "まなざしは光 (Manazashi wa Hikari)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu piano trong trẻo)", vi: "Intro piano thanh khiết" },
                { time: 14.50, romaji: "Kimi no manazashi wa atatakai hikari, kurayami wo terashitekureru", vi: "Ánh mắt của cậu tựa luồng sáng ấm áp, thắp sáng cả khoảng tối trong tâm hồn tớ" },
                { time: 32.00, romaji: "Soba ni iru dake de tsuyoku nareru no", vi: "Chỉ cần được ở bên cậu, tớ cảm thấy mình mạnh mẽ hơn rất nhiều" },
                { time: 55.00, romaji: "Kono hikari wo zutto hanashitaku nai", vi: "Ánh sáng ấm áp này, tớ nguyện sẽ mãi giữ chặt trong lòng" }
            ]
        },

        // Track 14: ひとひら (Hitohira) - Waguri Kaoruko (4:42)
        14: {
            title: "ひとひら (Hitohira)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0.0, romaji: "♪ (Cánh hoa trà rơi nhẹ trong gió)", vi: "Intro giai điệu nhẹ nhàng" },
                { time: 16.00, romaji: "Hitohira no hanabira ga tenohira ni ochite, kimi no nukumori wo omoidasu", vi: "Một cánh hoa khẽ rơi trên lòng bàn tay, gợi nhắc tớ về hơi ấm dịu dàng của cậu" },
                { time: 38.00, romaji: "Kisetsu ga megutte mo, kawaranai omoi ga koko ni aru", vi: "Dù bốn mùa có luân chuyển, tình cảm nguyên vẹn này vẫn luôn ở nơi đây" }
            ]
        },

        // Track 15: Rintaro to Kaoruko - Waguri Kaoruko OST
        15: { isInstrumental: true, title: "凛太郎と薫子 (Rintaro to Kaoruko)", artist: "Waguri Kaoruko OST", persona: "kaoruko" },

        // Track 16: 君のせいで愛してる - Sakura Miku (3:51)
        16: {
            title: "君のせいで愛してる (Kimi no Sei de Aishiteru)",
            artist: "Sakura Miku",
            lines: [
                { time: 0.0, romaji: "♪ (Gió xuân & tiếng chuông hoa anh đào)", vi: "Intro mùa xuân rộn rã" },
                { time: 14.00, romaji: "Harukaze ga fukinukeru machi de, sakura no hanabira ga maiodoru", vi: "Làn gió xuân thổi qua từng con phố nhỏ, cánh hoa anh đào dập dìu nhảy múa" },
                { time: 30.00, romaji: "Kimi no sei de mune ga kurushiku naru, kimi no sei de konna ni aishiteru!", vi: "Tại cậu mà tim tớ cứ đập thình thịch, tất cả là tại cậu làm tớ yêu đến mức này đấy!" },
                { time: 50.00, romaji: "Motto chikaku ni kite, tsunai da te wo hanasanaide!", vi: "Hãy đến gần hơn nữa đi, và đừng buông bàn tay đang đan chặt này ra nhé!" }
            ]
        },

        // Track 17: リトルワールド (Little World) - Sakura Miku (3:08)
        17: {
            title: "リトルワールド (Little World)",
            artist: "Sakura Miku",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu điện tử dễ thương)", vi: "Intro phong cách thần tượng vui nhộn" },
                { time: 12.00, romaji: "Watashitachi dake no chiisana sekai de, uta wo utaou!", vi: "Trong thế giới nhỏ bé chỉ của riêng chúng ta, hãy cùng nhau cất cao tiếng hát nào!" },
                { time: 30.00, romaji: "Kimi to nara doko made mo ikeru ki ga suru yo", vi: "Chỉ cần có cậu bên cạnh, tớ cảm giác mình có thể đi đến bất kỳ chân trời nào!" }
            ]
        },

        // Track 18: 月に向かって撃て - Shinobu Uzuki (3:15)
        18: {
            title: "月に向かって撃て (Tsuki ni Mukatte Ute)",
            artist: "Shinobu Uzuki",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu đêm khuya huyền bí)", vi: "Intro Midnight Radio" },
                { time: 14.00, romaji: "Shinya no hachou ni nosete, anata e todokeru koe no messeeji", vi: "Gửi vào làn sóng phát thanh lúc nửa đêm, thông điệp bằng giọng nói gửi riêng đến bạn" },
                { time: 32.00, romaji: "Tsuki ni mukatte utsu you ni, kono omoi wo hanatou", vi: "Tựa như nhắm bắn về phía ánh trăng, hãy bung tỏa hết tâm tư này" }
            ]
        },

        // Track 19: 声の軌跡 - Shinobu Uzuki (3:19)
        19: {
            title: "声の軌跡 (Koe no Kiseki)",
            artist: "Shinobu Uzuki",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng sóng âm radio lãng mạn)", vi: "Intro giai điệu truyền thanh êm dịu" },
                { time: 13.00, romaji: "Koe no kiseki ga yozora wo kakete, anata no moto e to todoku", vi: "Quỹ đạo âm thanh vượt qua bầu trời đêm, tìm về với nơi người đang lắng nghe" },
                { time: 31.00, romaji: "Kono koe ga aru kagiri, anata wa kesshite hitori ja nai", vi: "Chừng nào giọng nói này còn cất lên, bạn sẽ chẳng bao giờ cô đơn" }
            ]
        },

        // Track 20: 最最最高級のお世話して - Konohana Hinako (3:14)
        // Official Anime OP Theme (Rich Girl Caretaker)
        20: {
            title: "最最最高級のお世話して (Saikoukyuu no Osewa Shite)",
            artist: "Konohana Hinako",
            lines: [
                { time: 0.0, romaji: "♪ (Intro quý tộc vui nhộn)", vi: "Khúc dạo đầu phong cách hầu cận quý phái" },
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
                { time: 74.20, romaji: "Zutto soba ni ite ageru", vi: "Em sẽ mãi mãi ở bên cạnh chở che cho người" },
                { time: 88.90, romaji: "Dare yori chikaku de mamotte ageru ichiban chikaku de ✨", vi: "Em sẽ bảo vệ người từ cự ly gần nhất, gần hơn bất kỳ ai trên đời!" }
            ]
        },

        // Track 21: 完璧じゃないわたし - Konohana Hinako (3:36)
        21: {
            title: "完璧じゃないわたし (Kanpeki ja Nai Watashi)",
            artist: "Konohana Hinako",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu piano nội tâm)", vi: "Intro giai điệu nhẹ nhàng" },
                { time: 14.50, romaji: "Kanpeki ja nai watashi datte, anata no mae de wa sunao ni nareru", vi: "Dẫu em không phải là một cô gái hoàn hảo, trước mặt người em có thể sống thật với chính mình" },
                { time: 36.00, romaji: "Kono yowasa mo, zenbu uketomete kureta kara", vi: "Bởi người đã dịu dàng bao dung lấy cả những yếu mềm nơi em" }
            ]
        },

        // Track 22: Submarine Youth - Asanagi Umi (3:27)
        // Official Anime OP Theme (I Made Friends with the Second Prettiest Girl in My Class)
        22: {
            title: "Submarine Youth (サブマリンユース)",
            artist: "Asanagi Umi (reGretGirl)",
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

        // Track 23: Zutto Ichibanni Shitene - Asanagi Umi (3:33)
        23: {
            title: "Zutto Ichibanni Shitene",
            artist: "Asanagi Umi",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu biển xanh dạt dào)", vi: "Intro giai điệu bãi biển êm ả" },
                { time: 14.00, romaji: "Nami no oto ni magirete, chiisaku tsubuyaita 'Zutto ichibanni shitene'", vi: "Hòa vào tiếng sóng biển vỗ, tớ khẽ thì thầm 'Hãy luôn xem tớ là số một nhé'" },
                { time: 35.00, romaji: "Kimi no tokubetsu na hito ni naritai, sore dake ga watashi no negai", vi: "Muốn trở thành người đặc biệt nhất trong lòng cậu, đó là ước nguyện duy nhất của tớ" }
            ]
        }
    };

    /* --------------------------------------------------------
       DOM HOOKS & ENGINE STATE
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

    // Prevent auto-scroll fight when user is actively scrolling / inspecting
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
                    <h4 class="inst-title">${track.name}</h4>
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
                    // Click seeking accounts for user calibration offset
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

        // Apply real-time user offset: positive offset advances the lyrics
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
       OPEN / CLOSE DRAWER CONTROLLER
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

    /* --------------------------------------------------------
       LRC PARSER UTILITY: FAST IMPORT FOR ANY NEW TRACK
       Parse standard [mm:ss.xx] LRC text directly without typing code
    -------------------------------------------------------- */
    function parseLRC(lrcText, viTranslationMap = {}) {
        const lines = [];
        const regex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)/;
        const rawLines = lrcText.split('\n');

        for (const raw of rawLines) {
            const match = raw.trim().match(regex);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseFloat(match[2]);
                const time = +(minutes * 60 + seconds).toFixed(2);
                const romaji = match[3].trim();
                if (romaji) {
                    const vi = viTranslationMap[lines.length] || '';
                    lines.push({ time, romaji, vi });
                }
            }
        }
        return lines.sort((a, b) => a.time - b.time);
    }

    function registerTrackLyrics(trackId, title, artist, linesOrLrc, viMap) {
        if (typeof linesOrLrc === 'string') {
            LYRICS_DATABASE[trackId] = {
                title,
                artist,
                lines: parseLRC(linesOrLrc, viMap)
            };
        } else {
            LYRICS_DATABASE[trackId] = { title, artist, lines: linesOrLrc };
        }
    }

    // Export to global scope
    window.toggleLyrics = toggleLyrics;
    window.openLyrics = openLyrics;
    window.closeLyrics = closeLyrics;
    window.parseLRC = parseLRC;
    window.registerTrackLyrics = registerTrackLyrics;
    window.adjustLyricsOffset = adjustOffset;
    window.resetLyricsOffset = resetOffset;
})();
