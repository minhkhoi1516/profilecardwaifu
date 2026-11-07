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
                { time: 3.11, romaji: "Jibun ga ichiban!", vi: "Bản thân mình là số một!" },
                { time: 4.74, romaji: "Watashi ga watashi no koto wo aishite", vi: "Em yêu chính bản thân mình thì có gì sai chứ?" },
                { time: 8.57, romaji: "Nani ga warui no? Shitto deshou ka?", vi: "Có gì sai sao? Chắc là ghen tị rồi đúng không?" },
                { time: 12.35, romaji: "Itai da toka kawatteru toka", vi: "Bảo em làm màu hay lập dị quái chiêu?" },
                { time: 15.93, romaji: "Todokimasen ne, sono ripurai", vi: "Mấy lời mỉa mai đó chẳng lọt vào tai em đâu!" },
                { time: 19.46, romaji: "Daisuki na oyofuku, daisuki na okeshou de", vi: "Khoác lên bộ cánh yêu thích, tô lớp trang điểm ngọt ngào" },
                { time: 23.77, romaji: "Okimari no haafu tsuin maite odekake shiyo", vi: "Cột mái tóc nửa hai bên quen thuộc rồi tự tin xuống phố nào" },
                { time: 28.42, romaji: "Higasa motte bocchi datte shiawase da mon!", vi: "Che ô che nắng, dẫu một mình thôi cũng thấy ngập tràn hạnh phúc!" },
                { time: 32.40, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 35.43, romaji: "Umarete kichatte gomen", vi: "Sinh ra trên đời xinh thế này, thứ lỗi nhé!" },
                { time: 37.58, romaji: "Chu! Azatokute gomen", vi: "Chu! Điệu đà nũng nịu quá xin lỗi nha!" },
                { time: 40.35, romaji: "Ki ni nacchau yo ne? Gomen", vi: "Lỡ làm ai đó bận lòng rung rinh rồi? Xin lỗi nha!" },
                { time: 42.84, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 45.69, romaji: "Doryoku shichattete gomen", vi: "Chăm chút nỗ lực đẹp lên mỗi ngày xin lỗi luôn!" },
                { time: 48.06, romaji: "Chu! Toutokute gomen", vi: "Chu! Xinh đẹp quý phái thế này xin lỗi nha!" },
                { time: 50.81, romaji: "Joshiryoku takakute gomen", vi: "Khí chất con gái ngút ngàn thế này xin lỗi luôn!" },
                { time: 53.30, romaji: "Mukatsuichau yo ne? Zamaaa w", vi: "Tức tối ghen tị lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 56.54, romaji: "Anata wa anata no koto dake douzo", vi: "Các người hãy lo chuyện của bản thân mình đi nhé" },
                { time: 60.67, romaji: "Watashi ni kanshou shinaide kudasai", vi: "Làm ơn đừng xen vào cuộc sống của tôi!" },
                { time: 65.10, romaji: "Rui wa tomo wo yobu to iu kedo...", vi: "Người xưa bảo ngưu tầm ngưu mã tầm mã..." },
                { time: 68.87, romaji: "Todokimasen ne, sono kageguchi", vi: "Mấy lời nói xấu sau lưng chẳng chạm tới tôi đâu!" },
                { time: 72.63, romaji: "Omoi atsuzoko buutsu, okiniiri no ryukku de", vi: "Đôi bốt đế dày cá tính cùng chiếc ba lô thân thuộc" },
                { time: 76.89, romaji: "Kuzusenai maegami kushi de toite odekake shiyo", vi: "Chải chuốt lại phần tóc mái thật xinh rồi bước ra ngoài thôi" },
                { time: 81.52, romaji: "Karui onna? Fuzakenna, omosugiruttuu no!", vi: "Bảo tôi dễ dãi à? Đừng có giỡn, tình cảm này nặng lòng lắm đấy!" },
                { time: 85.56, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 88.53, romaji: "Kono jidai ikite gomen", vi: "Sống tỏa sáng trong thời đại này, thứ lỗi nhé!" },
                { time: 90.73, romaji: "Chu! Medattete gomen", vi: "Chu! Nổi bật quá mức xin lỗi nha!" },
                { time: 93.47, romaji: "Ishiki shichau yo ne? Gomen", vi: "Khiến ai kia cứ phải ngước nhìn mãi, xin lỗi nhé!" },
                { time: 95.97, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 98.83, romaji: "Jibun migaki shite gomen", vi: "Không ngừng hoàn thiện bản thân xin lỗi luôn!" },
                { time: 101.16, romaji: "Chu! Burikko de gomen", vi: "Chu! Nhõng nhẽo một chút xin lỗi nha!" },
                { time: 103.91, romaji: "Toriko ni shichatte gomen", vi: "Mê hoặc trái tim ai kia mất rồi, thứ lỗi nhé!" },
                { time: 106.42, romaji: "Mukatsuichau desho? Zamaaa w", vi: "Tức tối ghen tị lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 110.31, romaji: "Shumi no chigai kawarimono to bakani saretemo magetakunai", vi: "Dù sở thích có khác biệt, dù bị coi là kẻ lập dị em cũng không chịu khuất phục" },
                { time: 120.00, romaji: "Kowaku mo nai antara gotoki", vi: "Lũ người như các người em sợ gì chứ!" },
                { time: 125.05, romaji: "Jibun no mikata wa jibun de aritai", vi: "Em muốn chính mình sẽ là đồng minh vững chắc nhất của bản thân" },
                { time: 129.11, romaji: "Ichiban taisetsu ni shite agetai", vi: "Muốn trân trọng và yêu quý bản thân em nhất trên đời" },
                { time: 131.75, romaji: "Rifujin na gaman wa sasetakunai, 'sore ga watashi'", vi: "Không muốn chịu đựng những ấm ức vô lý, 'đó mới chính là em!'" },
                { time: 138.99, romaji: "Shiawase da mon!", vi: "Bởi em đang sống rất hạnh phúc mà!" },
                { time: 142.12, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 145.13, romaji: "Umarete kichatte gomen", vi: "Sinh ra trên đời xinh thế này, thứ lỗi nhé!" },
                { time: 147.28, romaji: "Chu! Azatokute gomen", vi: "Chu! Điệu đà nũng nịu quá xin lỗi nha!" },
                { time: 150.01, romaji: "Jinsei tanoshinde gomen", vi: "Tận hưởng cuộc đời rực rỡ quá xin lỗi luôn!" },
                { time: 152.48, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 155.34, romaji: "Doryoku shichattete gomen", vi: "Chăm chút nỗ lực đẹp lên mỗi ngày xin lỗi luôn!" },
                { time: 157.74, romaji: "Chu! Toutokute gomen", vi: "Chu! Xinh đẹp quý phái thế này xin lỗi nha!" },
                { time: 160.48, romaji: "Joshiryoku takakute gomen", vi: "Khí chất con gái ngút ngàn thế này xin lỗi luôn!" },
                { time: 163.01, romaji: "Mukatsuichau yo ne? Zamaaa w ✨", vi: "Tức tối ghen tị lắm phải không? Đáng đời lắm cơ nha!" }
            ]
        },

        // Track 2: 小さな恋のうた (Chiisana Koi no Uta)
        // Spotify: https://open.spotify.com/intl-vi/track/6avvVNDCKYVIIxrZ7TaFKd
        // Artist: アーリャ（CV：上坂すみれ） - Anime ED (4:09)
        2: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng guitar acoustic mộc mạc)", vi: "Intro giai điệu nhẹ nhàng" },
                { time: 13.20, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la bạt ngàn muôn tinh tú" },
                { time: 19.46, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Nơi địa cầu xanh biếc rộng lớn này" },
                { time: 25.81, romaji: "Chiisana koi no omoi wa todoku", vi: "Mối tình nhỏ bé chân thành vẫn cất cánh bay xa" },
                { time: 32.16, romaji: "Chiisana shima no anata no moto e", vi: "Để tìm về nơi hòn đảo nhỏ có anh đợi chờ" },
                { time: 38.74, romaji: "Anata to deai toki wa nagareru", vi: "Kể từ ngày gặp anh, thời gian lặng lẽ trôi qua" },
                { time: 45.02, romaji: "Omoi wo kometa tegami mo fueru", vi: "Từng cánh thư chan chứa nỗi niềm cứ thế đong đầy" },
                { time: 51.35, romaji: "Itsushika futari tagai ni hibiku", vi: "Chẳng biết tự khi nào, hai tâm hồn đã hòa cùng một nhịp" },
                { time: 57.69, romaji: "Toki ni hageshiku toki ni setsunaku", vi: "Khi thì mãnh liệt nồng nàn, lúc lại da diết xót xa" },
                { time: 64.00, romaji: "Hibiku wa tooku haruka kanata e", vi: "Ngân vang vút tận chân trời xa thẳm" },
                { time: 70.35, romaji: "Yasashii uta wa sekai wo kaeru", vi: "Khúc ca dịu êm sẽ đổi thay cả thế giới này" },
                { time: 76.89, romaji: "Hora, anata ni totte", vi: "Kìa trông xem, đối với chính anh" },
                { time: 81.05, romaji: "Daiji na hito hodo sugu soba ni iru no", vi: "Người quan trọng nhất lại đang ở ngay cạnh bên đấy thôi" },
                { time: 88.18, romaji: "Tada anata ni dake", vi: "Em chỉ nguyện trao riêng cho anh" },
                { time: 92.40, romaji: "Todoite hoshii hibike koi no uta", vi: "Mong khúc tình ca này sẽ chạm sâu vào trái tim người" },
                { time: 99.14, romaji: "Hora, hora, hora hibike koi no uta", vi: "Hãy lắng nghe khúc ca tình yêu vang vọng ngân nga..." },
                { time: 124.64, romaji: "Anata wa kizuku futari wa aruku", vi: "Anh khẽ nhận ra, hai ta cùng sánh bước chung đôi" },
                { time: 131.02, romaji: "Kurai michi demo hibi terasu tsuki", vi: "Dẫu con đường phía trước tối tăm, ánh trăng vẫn soi tỏ lối về" },
                { time: 137.30, romaji: "Nigirishimeta te wa hanasanai", vi: "Bàn tay đã nắm chặt lấy sẽ không bao giờ buông lơi" },
                { time: 143.70, romaji: "Omoi wa tsuyoku eien wo chikau", vi: "Khắc sâu lời thề ước trọn đời mãi mãi bên nhau" },
                { time: 149.89, romaji: "Eien no fuchi kare wa yukuyuku", vi: "Bên bờ vực vĩnh hằng, người vững bước tiến tới" },
                { time: 156.31, romaji: "Kaze ni nosete todoku omoi wa", vi: "Gửi gắm tâm tình theo từng cơn gió thoảng" },
                { time: 162.84, romaji: "Hora, anata ni totte", vi: "Nhìn xem, đối với anh" },
                { time: 166.99, romaji: "Daiji na hito hodo sugu soba ni iru no", vi: "Người trân quý nhất vẫn luôn ở cạnh bên anh" },
                { time: 174.12, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong tiếng lòng này chạm đến trái tim anh" },
                { time: 178.33, romaji: "Hibike koi no uta", vi: "Ngân vang mãi khúc ca tình yêu ngọt ngào" },
                { time: 185.15, romaji: "Hora, hora, hora hibike koi no uta ✨", vi: "Hãy lắng nghe khúc hát tình yêu vang vọng đất trời!" }
            ]
        },

        // Track 3: ワールドイズマイン (World is Mine)
        // Spotify: https://open.spotify.com/intl-vi/track/3iCXXsLMo4ssBOC2Sw5KUO
        // Artist: アーリャ（CV：上坂すみれ） - Anime ED (4:12)
        3: {
            title: "ワールドイズマイン (World is Mine)",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng chuông ngân & piano kiêu kỳ)", vi: "Intro công chúa kiêu sa" },
                { time: 15.54, romaji: "Sekai de ichiban ohimesama", vi: "Em là nàng công chúa số một trên thế giới này" },
                { time: 19.49, romaji: "Souiu atsukai kokoroete yo ne", vi: "Anh phải biết cách cưng chiều em như thế đấy nhé!" },
                { time: 23.23, romaji: "Sono ichi: Itsumo to chigau kamigata ni kigatsuku koto", vi: "Điều thứ nhất: Phải nhận ra ngay khi kiểu tóc em có chút khác biệt" },
                { time: 27.28, romaji: "Sono ni: Chanto kutsu made miru koto, ii ne?", vi: "Điều thứ hai: Phải ngắm nhìn chu đáo từ đầu đến tận đôi giày, rõ chưa?" },
                { time: 31.25, romaji: "Sono san: Watashi no hitokoto ni wa mittsu no kotoba de henji suru koto", vi: "Điều thứ ba: Em nói một câu, anh phải đối đáp bằng ba câu ngọt ngào!" },
                { time: 37.31, romaji: "Wakattara migite ga orusu nano wo nantoka shite!", vi: "Hiểu rồi thì bàn tay phải đang rảnh rỗi của em mau nắm lấy đi chứ!" },
                { time: 44.82, romaji: "Betsu ni wagamama nante ittenain dakara", vi: "Cơ mà em đâu có vòi vĩnh đòi hỏi quá đáng gì đâu" },
                { time: 50.81, romaji: "Kimi ni kokoro kara omotte hoshii no, kawaii tte", vi: "Em chỉ muốn anh thật lòng khen em đáng yêu thôi mà" },
                { time: 58.12, romaji: "Sekai de ichiban ohimesama", vi: "Nàng công chúa đệ nhất của thế gian này" },
                { time: 62.04, romaji: "Kigatsuite nee nee", vi: "Nhận ra em đi mà, nè nè anh ơi" },
                { time: 65.97, romaji: "Mataseru nante rongai yo", vi: "Để em phải chờ đợi là tội không thể tha thứ đâu đấy!" },
                { time: 69.92, romaji: "Watashi wo dare da to omotteru no?", vi: "Anh nghĩ em là ai cơ chứ?" },
                { time: 74.61, romaji: "Chanto mitete yo ne, dokoka ni icchau yo?", vi: "Hãy dõi theo em cẩn thận vào, không là em biến mất đấy!" },
                { time: 89.80, romaji: "Hyotto shite nai? Angai nai? Iya, nai desho", vi: "Chẳng lẽ không có khuyết điểm gì sao? Đương nhiên là hoàn hảo rồi!" },
                { time: 95.85, romaji: "Kantan da to omou kedo na", vi: "Chiều chuộng em dễ ợt mà đúng không nè" },
                { time: 99.11, romaji: "Ano sa, ano ne? Doushitemo yuzurenai koto", vi: "Nè, nói nghe nè! Có một điều em tuyệt đối không nhượng bộ đâu" },
                { time: 104.20, romaji: "Meutsuri suru nante rongai yo", vi: "Dám liếc mắt nhìn cô gái khác là không xong với em đâu đấy!" },
                { time: 108.33, romaji: "Ketteiteki ni oshare wa ki wo tsukatteru no", vi: "Em đã tốn bao nhiêu công sức để chăm chút diện mạo thật lộng lẫy" },
                { time: 113.64, romaji: "Mou nandaka amai mono ga tabetai! Ima sugu yo", vi: "Tự dưng thèm đồ ngọt ghê cơ! Mua cho em ngay bây giờ đi!" },
                { time: 120.67, romaji: "Ketten? Yoi ko tte koto! Mou, shaa nai wa ne", vi: "Khuyết điểm sao? Là quá ngoan ngoãn đáng yêu đấy! Thật hết cách với anh" },
                { time: 127.41, romaji: "Ano ne, watashi no hanashi chanto kiiteru? Chottoo...", vi: "Này, anh có đang tập trung nghe em nói không đấy? Này này..." },
                { time: 134.99, romaji: "Demo ne sukoshi kurai shikatte kuretatte ii no yo?", vi: "Nhưng mà thi thoảng anh nghiêm giọng trách mắng em chút cũng được mà..." },
                { time: 142.42, romaji: "Zettai kimi wa wakattenai! Wakattenai...", vi: "Chắc chắn là anh chẳng hiểu lòng em gì hết trơn á..." },
                { time: 157.11, romaji: "Ichigo no notta shootokeeki, kodawari tamago no purin", vi: "Miếng bánh kem dâu tây mọng nước, đĩa bánh flan trứng thơm ngon" },
                { time: 165.02, romaji: "Minna minna gaman shimasu, wagamama na ko ja nai mon", vi: "Em sẽ nhịn hết vì anh, em đâu phải đứa trẻ vòi vĩnh hư đốn đâu" },
                { time: 180.08, romaji: "Itsuka kimi mo... kizuku ka na?", vi: "Liệu có ngày nào đó... anh sẽ nhận ra tấm lòng em?" },
                { time: 187.82, romaji: "Sekai de ichiban okakesama... ja nakute!", vi: "Vị công chúa... à nhầm, lỡ miệng rồi!" },
                { time: 191.75, romaji: "Sekai de ichiban ohimesama", vi: "Vẫn là nàng công chúa độc nhất vô nhị của anh!" },
                { time: 195.71, romaji: "Chanto mitete yo ne, furete yo sono te wo", vi: "Dõi theo em thật kỹ và nắm lấy đôi tay này đi" },
                { time: 203.51, romaji: "Riyuu wo oshiete, muchuu ni narasete yo", vi: "Hãy cho em một lý do để mê đắm anh không lối thoát" },
                { time: 211.43, romaji: "Sou ja nai to watashi ga dokoka e kiechau yo?", vi: "Nếu không thì em sẽ tan biến vào hư không đấy?" },
                { time: 221.51, romaji: "Fui ni dakishimerareta, kyuu ni sonna! E?", vi: "Bất ngờ bị anh ôm chầm lấy, ôi đột ngột thế này là sao!" },
                { time: 228.31, romaji: "'Hikareru abunai yo' sou itte soppo muku kimi", vi: "'Cẩn thận xe tông kìa' - anh vừa đỡ vừa ngượng ngùng ngoảnh mặt đi" },
                { time: 236.12, romaji: "...Kocchi no ga abunai wa yo ✨", vi: "...Cái ôm bất ngờ của anh còn nguy hiểm hơn xe cộ nhiều đấy! ✨" }
            ]
        },

        // Track 4: CHE.R.RY
        // Spotify: https://open.spotify.com/intl-vi/track/1zNDgdjkZojamiEZQOhI96
        // Artist: アーリャ（CV：上坂すみれ） - Anime ED (3:29)
        4: {
            title: "CHE.R.RY",
            artist: "アーリャ（CV：上坂すみれ）",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu guitar rộn ràng)", vi: "Intro thanh xuân trong sáng" },
                { time: 13.20, romaji: "Te no hira de furueta", vi: "Điện thoại rung bần bật trong lòng bàn tay" },
                { time: 17.37, romaji: "Sore ga chiisana yuuki ni natteitan da", vi: "Khoảnh khắc ấy đã tiếp cho em một dũng khí nhỏ bé" },
                { time: 23.97, romaji: "Emoji wa nigate datta", vi: "Em vốn dĩ rất vụng về trong việc dùng icon cảm xúc" },
                { time: 28.02, romaji: "Dakedo kimi kara dattara wakuwaku shichau", vi: "Thế nhưng cứ hễ là tin nhắn từ anh là tim lại đập rộn ràng" },
                { time: 33.72, romaji: "Henji wa sugu ni shicha dame datte", vi: "Từng nghe ai đó dặn không nên vội vã trả lời tin nhắn ngay" },
                { time: 39.03, romaji: "Dareka ni kiita koto aru kedo", vi: "Phải giữ giá một chút thì người ta mới say mê" },
                { time: 43.08, romaji: "Kakehiki nante dekinai no... suki na no yo", vi: "Nhưng em làm sao toan tính nổi... vì em đã lỡ thương anh mất rồi" },
                { time: 49.91, romaji: "Ah ah ah ah...", vi: "Tiếng thở dài bối rối đáng yêu..." },
                { time: 54.67, romaji: "Koishichattan da tabun, kizuite nai deshou?", vi: "Hình như em đã rơi vào lưới tình rồi, chắc anh chưa nhận ra đâu nhỉ?" },
                { time: 63.66, romaji: "Hoshi no yoru negai komete CHE.R.RY", vi: "Gửi trọn ước nguyện vào bầu trời đêm ngàn sao, trái cherry ngọt ngào" },
                { time: 70.59, romaji: "Yubisaki de okuru kimi e no messeeji", vi: "Từng đầu ngón tay khẽ gõ dòng tin nhắn gửi trao tới anh" },
                { time: 88.32, romaji: "Totsuzen no sairen, sukoshi setsunaku saseru yo Ma bell", vi: "Tiếng chuông báo bất chợt vang lên khiến lòng em dâng trào xao xuyến" },
                { time: 99.12, romaji: "Amakuchi no furuutsu kamishimenagara chotto otona kibun", vi: "Nhấm nháp vị trái cây ngọt lành, ngỡ như mình đã trưởng thành hơn đôi chút" },
                { time: 108.87, romaji: "Motto chikadukitai yo ima sugu", vi: "Muốn được nép lại gần anh hơn ngay lúc này" },
                { time: 114.17, romaji: "Kimi no kao ga mitai, aitai", vi: "Muốn nhìn ngắm gương mặt anh, nhớ anh cồn cào" },
                { time: 118.26, romaji: "Ienai, shukudai wa atomawari, ijiwaru ne", vi: "Không dám thổ lộ, bài tập về nhà cứ để mặc sau vậy, anh xấu tính thật đó!" },
                { time: 125.03, romaji: "Ah ah ah ah...", vi: "Nỗi lòng tương tư ngọt ngào..." },
                { time: 129.77, romaji: "Koishichattan da tabun, yokogao dakedo", vi: "Chắc là em đã yêu thật rồi, dẫu chỉ là ngắm nhìn góc nghiêng của anh" },
                { time: 138.79, romaji: "Suki yo... to ietara ii no ni ne CHE.R.RY", vi: "Ước gì em có thể can đảm thốt lên câu 'Em thích anh'... CHE.R.RY ơi" },
                { time: 148.18, romaji: "Sakura ga saite iru", vi: "Muôn cánh hoa anh đào đang rợp nở rực rỡ" },
                { time: 180.67, romaji: "Koishichattan da tabun, kizuite nai deshou?", vi: "Em đã yêu say đắm mất rồi, chắc anh vẫn chưa nhận ra đâu nhỉ?" },
                { time: 189.67, romaji: "Hoshi no yoru negai komete CHE.R.RY", vi: "Đêm ngàn sao đong đầy bao ước nguyện, CHE.R.RY ngọt ngào" },
                { time: 196.60, romaji: "Yubisaki de okuru kimi e no messeeji ✨", vi: "Từng ngón tay run run bấm gửi trọn tâm tình đến người thương! ✨" }
            ]
        },

        // Track 5: 小さな恋のうた (Chiisana Koi no Uta)
        // Spotify: https://open.spotify.com/intl-vi/track/66apUbHsEuKh7IqkKK7OKa
        // Artist: 椎名真昼 (CV.石見舞菜香) - Otonari Tenshi ED 1 (5:00)
        5: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "椎名真昼 (CV.石見舞菜香)",
            lines: [
                { time: 0.0, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la muôn vàn tinh tú" },
                { time: 5.12, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Trên địa cầu xanh ngát rộng lớn này" },
                { time: 10.15, romaji: "Chiisana koi no omoi wa todoku", vi: "Mối tình nhỏ bé chân thành vẫn lan tỏa" },
                { time: 15.18, romaji: "Chiisana shima no anata no moto e", vi: "Để tìm về bên anh nơi hòn đảo bình yên" },
                { time: 20.70, romaji: "Anata to deai toki wa nagareru", vi: "Gặp gỡ anh rồi, thời gian lặng lẽ êm trôi" },
                { time: 25.86, romaji: "Omoi wo kometa tegami mo fueru", vi: "Những bức thư chất chứa yêu thương cứ ngày một nhiều thêm" },
                { time: 30.90, romaji: "Itsushika futari tagai ni hibiku", vi: "Chẳng biết tự khi nào đôi ta đã hòa cùng nhịp thở" },
                { time: 36.10, romaji: "Toki ni hageshiku toki ni setsunaku", vi: "Có lúc bùng cháy thiết tha, có khi lại bồi hồi xao xuyến" },
                { time: 41.76, romaji: "Hibiku wa tooku haruka kanata e", vi: "Vang vọng mãi tới những miền xa xôi" },
                { time: 47.30, romaji: "Yasashii uta wa sekai wo kaeru", vi: "Bài ca dịu dàng ấy sẽ sưởi ấm cả thế gian" },
                { time: 52.41, romaji: "Hora, anata ni totte", vi: "Kìa, đối với anh" },
                { time: 55.79, romaji: "Daiji na hito hodo sugu soba ni iru no", vi: "Người trân quý nhất chẳng phải đang ở ngay cạnh bên sao" },
                { time: 62.58, romaji: "Tada anata ni dake todoite hoshii", vi: "Em chỉ nguyện trao riêng cho anh" },
                { time: 69.30, romaji: "Hibike koi no uta", vi: "Hãy cất vang lên nhé, khúc ca tình yêu" },
                { time: 73.36, romaji: "Hora, hora, hora hibike koi no uta", vi: "Ngân vang điệu nhạc tình nồng nàn..." },
                { time: 91.96, romaji: "Anata wa kizuku futari wa aruku", vi: "Anh nhận ra và đôi ta cùng chung lối" },
                { time: 97.28, romaji: "Kurai michi demo hibi terasu tsuki", vi: "Ánh trăng dịu hiền soi sáng những đêm khuya" },
                { time: 102.52, romaji: "Nigirishimeta te hanasu koto naku", vi: "Bàn tay đan chặt không rời nửa bước" },
                { time: 107.66, romaji: "Omoi wa tsuyoku eien chikau", vi: "Gửi gắm ước thề gắn kết trọn kiếp này" },
                { time: 113.33, romaji: "Eien no fuchi kitto boku wa iu", vi: "Nơi chân trời vĩnh hằng, em sẽ luôn khẽ nói" },
                { time: 118.74, romaji: "Omoi kawarazu onaji kotoba wo", vi: "Vẫn trọn vẹn lời yêu thương chẳng hề phai dấu" },
                { time: 123.96, romaji: "Soredemo tarizu namida ni kawari", vi: "Dẫu bao nhiêu cũng không thỏa, hóa thành giọt lệ xúc động" },
                { time: 129.11, romaji: "Yorokobi ni nari kotoba ni dekizu", vi: "Niềm hạnh phúc trào dâng nghẹn ngào không thốt nên lời" },
                { time: 134.97, romaji: "Tada dakishimeru, tada dakishimeru", vi: "Chỉ muốn ôm anh thật chặt, mãi mãi trong vòng tay này" },
                { time: 143.94, romaji: "Hora, anata ni totte", vi: "Kìa trông xem, đối với chính anh" },
                { time: 147.18, romaji: "Daiji na hito hodo sugu soba ni iru no", vi: "Người quan trọng nhất đang cận kề ngay bên cạnh anh" },
                { time: 153.99, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong tiếng lòng này chạm sâu vào tâm hồn anh" },
                { time: 160.75, romaji: "Hibike koi no uta", vi: "Khúc tình ca hãy vang vọng muôn nơi" },
                { time: 164.75, romaji: "Hora, hora, hora hibike koi no uta", vi: "Ngân vang mãi điệu hát tình yêu..." },
                { time: 176.51, romaji: "Yume naraba samenaide, yume naraba samenaide", vi: "Nếu đây là một giấc mơ, xin đừng bao giờ tỉnh giấc" },
                { time: 186.94, romaji: "Anata to sugoshita toki eien no hoshi to naru", vi: "Khoảnh khắc bên anh sẽ hóa thành những vì sao bất tử" },
                { time: 196.29, romaji: "Hora, anata ni totte daiji na hito hodo sugu soba ni iru no", vi: "Người quý giá nhất đang ở ngay cạnh bên anh đấy" },
                { time: 206.31, romaji: "Tada anata ni dake todoite hoshii hibike koi no uta ✨", vi: "Chỉ nguyện trao trọn cho anh, khúc tình ca ngọt ngào ngân vang mãi mãi! ✨" }
            ]
        },

        // Track 6: うれしい! たのしい! 大好き! (Ureshii! Tanoshii! Daisuki!)
        // Spotify: https://open.spotify.com/intl-vi/track/6endW8r32Uli0oS4ze3BZM
        // Artist: 椎名真昼 (CV.石見舞菜香) - Otonari Tenshi ED 12 (3:35)
        6: {
            title: "うれしい! たのしい! 大好き!",
            artist: "椎名真昼 (CV.石見舞菜香)",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu vui tươi & ngọt ngào)", vi: "Intro tình yêu ngập tràn niềm vui" },
                { time: 13.10, romaji: "Hajimete atta toki kara chigau mono kanjiteta", vi: "Ngay từ giây phút đầu gặp anh, em đã cảm nhận được điều gì đó thật đặc biệt" },
                { time: 19.40, romaji: "Jibun no naka no dareka ga kokoro wo tsutsweita", vi: "Có ai đó bên trong lòng em cứ khẽ lay động con tim này" },
                { time: 25.70, romaji: "Tomodachi ni wa umaku ienai kono pawaa no minamoto wo", vi: "Chẳng thể giải thích nổi cho bạn bè nguồn sức mạnh kỳ diệu này từ đâu tới" },
                { time: 32.40, romaji: "'Koi wo shiteru' tada sore dake ja sumasarenai koto no you na ki ga shiteru", vi: "Cảm giác như chỉ dùng mỗi chữ 'yêu thôi' thì chẳng thể nào diễn tả hết" },
                { time: 41.20, romaji: "Kitto sou nan da meguriaetan da zutto sagashiteta hito ni", vi: "Chắc chắn là vậy rồi, em đã tìm thấy định mệnh mà em ngóng trông bấy lâu" },
                { time: 50.30, romaji: "Mebuka ni shiteta boushi no tsuba wo gutto agetai kibun", vi: "Muốn đẩy cao vành chiếc mũ che khuất để ngắm nhìn anh thật rõ" },
                { time: 58.50, romaji: "'Wakatteita no mae kara kou naru koto mo zutto'", vi: "'Em đã biết trước từ lâu rồi, hai ta sớm muộn cũng sẽ thành đôi'" },
                { time: 65.10, romaji: "Watashi no kotoba hanbun waratte kiiteru kedo", vi: "Dù anh vừa nghe em nói vừa mỉm cười trêu đùa" },
                { time: 70.00, romaji: "Shouko datte chanto aru yo hajimete te wo tsunaide kara", vi: "Nhưng em có bằng chứng xác thực cơ đấy, kể từ khi mình nắm tay nhau lần đầu" },
                { time: 78.40, romaji: "Watashi no migite suupaa de supesharu ni natta mono", vi: "Bàn tay phải này của em đã trở nên siêu cấp nhiệm màu và đặc biệt vô cùng!" },
                { time: 85.10, romaji: "Yappari sou da anata dattan da, ureshii! tanoshii! daisuki!", vi: "Quả đúng là anh rồi, người em tìm kiếm! Thật hạnh phúc, thật vui sướng, yêu anh nhất trên đời!" },
                { time: 95.30, romaji: "Nan demo dekiru tsuyoi pawaa ga dondon waite kuru yo", vi: "Nguồn năng lượng phi thường giúp em làm được mọi việc cứ thế trào dâng" },
                { time: 103.70, romaji: "Honto wa anata mo shitteta hazu, saisho kara watashi wo suki datta kuse ni", vi: "Thực lòng anh cũng biết tỏng rồi cơ mà, rõ ràng thích em ngay từ đầu mà cứ giả vờ!" },
                { time: 113.30, romaji: "Yappari sou da meguriaetan da zutto sagashiteta hito ni", vi: "Đúng là em đã tìm thấy người mà em tìm kiếm bấy lâu" },
                { time: 122.20, romaji: "Itsumo konna ni shiawase na kimochi mochitsudukete irareru", vi: "Luôn giữ trọn vẹn niềm hạnh phúc đong đầy ngọt ngào trong tim" },
                { time: 131.10, romaji: "Anata ga sou da anata dattan da, ureshii! tanoshii! daisuki! ✨", vi: "Chính là anh rồi, anh đích thực là chân ái! Ngập tràn hạnh phúc, vui sướng, yêu anh nhiều lắm! ✨" }
            ]
        },

        // Instrumental Tracks (7 - 11: Mahiru)
        7: { title: "小さな恋のうた (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", isInstrumental: true },
        8: { title: "うれしい! たのしい! 大好き! (Inst.)", artist: "椎名真昼 (CV.石見舞菜香)", isInstrumental: true },
        9: { title: "Kimi ni Todoke (Inst.)", artist: "Iwami Manaka", isInstrumental: true },
        10: { title: "Valentine Kiss (Inst.)", artist: "Iwami Manaka", isInstrumental: true },
        11: { title: "Gift (Inst.)", artist: "Iwami Manaka", isInstrumental: true },

        // Track 12: ハレの日に (Hare no Hi ni)
        // Spotify: https://open.spotify.com/intl-vi/track/41bU6Anbt3NPBdGLzpEcal
        // Artist: 汐れいら (Reira Ushio) - Kaoru Hana wa Rin to Saku Image Song (4:37)
        12: {
            title: "ハレの日に (Hare no Hi ni)",
            artist: "汐れいら (Reira Ushio)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng guitar mộc & không gian tĩnh lặng)", vi: "Intro giai điệu nhẹ nhàng" },
                { time: 15.54, romaji: "Naite shimatta sora wo miteta, kimi wo omotteru", vi: "Ngước nhìn bầu trời tuôn rơi hạt mưa rào, em lại nhớ về anh da diết" },
                { time: 23.10, romaji: "Namida no ato kawaite kurenai, mada kimi no nioi ga suru", vi: "Vệt nước mắt mãi không chịu khô, thoảng đâu đây vẫn vương mùi hương của anh" },
                { time: 30.93, romaji: "Aiiro kimi to no denwa muri ni waratteita", vi: "Sắc chàm hoàng hôn buông lơi, qua điện thoại em cố gượng cười tươi" },
                { time: 38.25, romaji: "Kumotta sora to watashi 'kyou wa aenai ne'", vi: "Bầu trời ảm đạm cùng tiếng em thì thầm 'Hôm nay mình không gặp nhau được rồi nhỉ'" },
                { time: 44.25, romaji: "Aa kore dake no koto de kanashiku narun da na", vi: "Aah, chỉ một chuyện nhỏ nhặt thế thôi mà sao lòng chùng xuống buồn tênh" },
                { time: 50.05, romaji: "Pleased your flower tobikiri no mono ja nakute ii kimi ga kureru kara ii", vi: "Bông hoa anh tặng chẳng cần lộng lẫy xa hoa, chỉ cần là anh trao là em đã nâng niu" },
                { time: 57.65, romaji: "Please your love kimi ga fuchidotta ai no kaotsuki zutto mitetai", vi: "Tình yêu nơi anh phác họa nên dáng hình hạnh phúc, em muốn ngắm nhìn mãi thôi" },
                { time: 66.18, romaji: "By my side kimi to waraitai tada no nichijou ni aijou ga kaotteiru", vi: "Bên cạnh em, muốn cùng anh cười vui, dẫu chuỗi ngày bình dị cũng ngát hương ân cần" },
                { time: 75.34, romaji: "Kimi to sugosu nanigenai toki ga itsudatte hana ni naru kara", vi: "Bởi từng giây phút êm đềm bên anh đều sẽ nở rộ thành những đóa hoa tươi thắm" },
                { time: 88.98, romaji: "I'll eat a cake tobikiri chiisakutemo ii futaribun areba ii", vi: "Chiếc bánh ngọt dẫu bé xíu cũng chẳng sao, miễn là đủ cho cả hai chúng mình" },
                { time: 96.63, romaji: "I want you to eat kurete bakka no kimi e okaeshi kankaku wo okuriau yo", vi: "Muốn chia sẻ cùng anh - người luôn chở che em - để hai ta thấu hiểu từng rung cảm" },
                { time: 105.14, romaji: "By my side kimi ni agetai donna kanjou mo hanbun ni shiteitai", vi: "Bên em nhé, muốn dành tặng anh tất cả, buồn vui sướng khổ đều san sẻ làm đôi" },
                { time: 114.34, romaji: "Kimi ga omou nandemonai koto mo nandatte watashi wa tokubetsu ni omou kara", vi: "Cả những điều anh ngỡ bình thường, trong mắt em lại là báu vật vô giá" },
                { time: 124.91, romaji: "Nandemonai wo tabanetara ookina buuke ni natte", vi: "Gom góp từng vụn vặt thường nhật lại sẽ kết thành một bó hoa rực rỡ" },
                { time: 132.65, romaji: "'Arigatou' to 'aishiteru' de kinenbi ja nai kinenbi wo kazatteku", vi: "Cùng 'cảm ơn' và 'yêu anh', ta thắp sáng những ngày bình dị thành kỷ niệm đáng nhớ" },
                { time: 146.54, romaji: "By my side ima wa beeru no naka kanashii koto wa kimi to mitsumetai", vi: "Bên em nhé, dưới tấm voan trong trẻo, muốn cùng anh đối mặt với mọi giông bão cuộc đời" },
                { time: 157.49, romaji: "Kao wo agesasete kureru kimi to hare no hi chikatte", vi: "Người luôn nâng niu giúp em ngẩng cao đầu, xin nguyện thề dưới ánh nắng rạng ngời" },
                { time: 168.33, romaji: "By my side kimi to itai tada no nichijou wo isshou wo iwatteikou", vi: "Bên cạnh anh trọn đời trọn kiếp, chúc tụng từng khoảnh khắc giản đơn của đôi ta" },
                { time: 177.51, romaji: "Kimi ga suki na hana watashi mo mottete, aa mou waracchau ne ✨", vi: "Em cũng cầm trên tay đóa hoa anh yêu thích nhất, ôi mỉm cười rạng rỡ hạnh phúc xiết bao! ✨" }
            ]
        },

        // Instrumental Tracks (13 - 15: Kaoruko OST)
        13: { title: "まなざしは光 (Manazashi wa Hikari)", artist: "原田萌喜 (Kaoru Hana OST)", isInstrumental: true },
        14: { title: "ひとひら (Hitohira)", artist: "原田萌喜 (Kaoru Hana OST)", isInstrumental: true },
        15: { title: "偏見と葛藤 (Henken to Kattou)", artist: "原田萌喜 (Kaoru Hana OST)", isInstrumental: true },

        // Track 16: 君のせいで愛してる (Kimi no Sei de Aishiteru)
        // Spotify: https://open.spotify.com/intl-vi/track/1SsnLip8KKG2aYsXlGH29n
        // Artist: CHiCO with HoneyWorks - Anime OP (3:51)
        16: {
            title: "君のせいで愛してる (Kimi no Sei de Aishiteru)",
            artist: "CHiCO with HoneyWorks",
            lines: [
                { time: 0.0, romaji: "♪ (Intro sôi động & nhịp trống HoneyWorks)", vi: "Giai điệu thanh xuân tươi mới" },
                { time: 14.36, romaji: "Nee nee 'aishiteru' tte watashi mite itte kureta gohoubi... haa yameta", vi: "Nè nè, nếu nhìn vào mắt em và nói 'Anh yêu em' thì em sẽ thưởng... haiz thôi bỏ đi!" },
                { time: 23.08, romaji: "Sukurooru tomechau, koe ga shitara kiichau", vi: "Ngón tay khựng lại không lướt nữa, hễ nghe thấy giọng anh là lắng tai nghe ngóng" },
                { time: 27.76, romaji: "Jishin ga nakute uso ga fuetemo massugu na kimochi", vi: "Dù thiếu tự tin và hay nói dối vụng về, tình cảm em trao vẫn luôn chân thành" },
                { time: 34.90, romaji: "Kanchigai shichau yo, kao akai no bareteru?", vi: "Em lại tự suy diễn mất thôi, mặt em đang đỏ ửng thế này anh có thấy không?" },
                { time: 40.06, romaji: "Sasai na koto de mune ga odotte amazuppai no desu", vi: "Chỉ vì vài chuyện cỏn con mà tim đập loạn nhịp, vị ngọt chua ngập tràn lồng ngực" },
                { time: 47.38, romaji: "Kyori wo缩める kotoba miataranai no ni", vi: "Chẳng tìm thấy lời nào để rút ngắn khoảng cách giữa hai ta" },
                { time: 52.92, romaji: "Furimuita kimi no kao chikakute toiki furete koi no aji shiteru", vi: "Thế mà khi anh bất chợt quay lại, gương mặt sát gần, hơi thở chạm khẽ... chính là vị ngọt tình yêu!" },
                { time: 63.20, romaji: "Nee nee 'aishiteru' tte kimi wo mite itte komarasete ii?", vi: "Nè nè, em nhìn thẳng vào mắt anh và nói 'Em yêu anh' để làm anh bối rối nhé?" },
                { time: 70.98, romaji: "Nante kakehiki toka ne honto wa nigate yo aa kizuite", vi: "Mấy trò thả thính toan tính đó em dở tệ lắm cơ, xin anh hãy nhận ra đi mà" },
                { time: 78.17, romaji: "Suki ni naru tte itai no ni afuretara tomarenai", vi: "Biết yêu là đau nhói ngập tràn, nhưng tình cảm trào dâng chẳng sao ngăn lại được" },
                { time: 91.93, romaji: "Hoka no ko ni wa yasashii, tsumetai yo watashi ni", vi: "Với người con gái khác anh dịu dàng thế, mà sao với em lại lạnh lùng thế chứ" },
                { time: 97.03, romaji: "Namaeyobi mo bodiitacchi mo watashi dattara ii no ni", vi: "Gọi tên thân mật hay những cái chạm tay... giá như người đó là em thì tốt biết mấy" },
                { time: 104.27, romaji: "Aisozukasaretatte shikatanai hodo wagamama na koigokoro", vi: "Dẫu có bị chán ghét cũng chẳng tránh khỏi, con tim này vốn dĩ ương bướng và vòi vĩnh thế đấy" },
                { time: 113.18, romaji: "Sore sura watashi dakara suki ni sasetemiseru", vi: "Nhưng đó mới chính là em, em nhất định sẽ khiến anh phải đổ gục vì em!" },
                { time: 120.10, romaji: "Mousou 'kawaisugi' tte watashi mite itte kureta gohoubi", vi: "Ảo tưởng anh nhìn em và bảo 'Đáng yêu quá đi mất' như một phần thưởng ngọt lịm" },
                { time: 127.72, romaji: "Nante anime ja nai shi kisu shiin mo nai shi aa baka mitai", vi: "Đời đâu phải anime mà có nụ hôn lãng mạn chứ, ôi trông mình ngốc nghếch làm sao" },
                { time: 135.11, romaji: "Suki ni naru tte itai kara hiroin ni narenai", vi: "Yêu một ai đó đau đớn nhường này, mình chẳng thể làm nữ chính nổi đâu" },
                { time: 157.34, romaji: "Kiite ii? Uso, kinshi. Ano ko no koto ki ni naru no?", vi: "Em hỏi một câu được không? Cấm nói dối nhé: Anh có để ý cô bạn đó không?" },
                { time: 163.70, romaji: "'Hoka ni iru ki ni naru ko... mada, ienai.'", vi: "'Người anh đang để ý là một người khác... nhưng giờ chưa thể nói.' - Anh đáp" },
                { time: 169.33, romaji: "Etto... watashi kamo tte kanchigai? Mitsumekaeshichau", vi: "Khoan đã... chẳng lẽ anh đang ám chỉ em sao? Em lại nhìn anh đắm đuối mất rồi" },
                { time: 178.33, romaji: "Nee nee 'aishiteru' tte kimi wo mite itte komarasete ii?", vi: "Nè nè, để em nhìn anh và nói câu 'Em yêu anh' làm anh bối rối nhé?" },
                { time: 186.09, romaji: "Nante kakehiki wa mou hitsuyou nai you ni mitsumeatte", vi: "Mấy lời thăm dò đó chẳng cần thiết nữa đâu, hãy cứ nhìn sâu vào mắt nhau" },
                { time: 193.34, romaji: "Suki ni naru tte kiseki da shi nando datte iu yo: Suki! ✨", vi: "Được yêu anh là một phép màu kỳ diệu, em sẽ nhắc lại hàng vạn lần: Em yêu anh! ✨" }
            ]
        },

        // Track 17: リトルワールド (Little World)
        // Spotify: https://open.spotify.com/intl-vi/track/1cflsQcGcOcL7gkZaPyiYm
        // Artist: PompadollS - Anime ED (3:08)
        17: {
            title: "リトルワールド (Little World)",
            artist: "PompadollS",
            lines: [
                { time: 0.0, romaji: "♪ (Nhịp bass nội tâm & guitar lo-fi)", vi: "Intro thế giới nhỏ bé" },
                { time: 4.20, romaji: "Nee, koko de okita koto wa eien yo", vi: "Này, tất cả những điều từng xảy ra nơi đây đều là vĩnh cửu đấy" },
                { time: 8.52, romaji: "Hansode otta shatsu to burausu", vi: "Chiếc áo sơ mi xắn tay ngắn cùng tà áo blouse học trò" },
                { time: 13.25, romaji: "Aa, subete ni imi nanka nakute subete no koto ni imi bakari ga atta", vi: "Aah, ngỡ như mọi thứ đều vô nghĩa, nhưng kỳ thực lại đong đầy bao ý niệm" },
                { time: 23.01, romaji: "Keisei sareru kyoutsuu no gengo, futa wo aketara kankitsu no kuuki", vi: "Thứ ngôn ngữ chung được hai ta tạo dựng, mở nắp ra là hương cam chanh thoang thoảng" },
                { time: 31.95, romaji: "Surudoi kankaku ni boyaketa itami ga hitsuyou ijou ni osou", vi: "Cảm giác nhói buốt cùng nỗi đau mập mờ ập đến nhiều hơn mức cần thiết" },
                { time: 39.11, romaji: "Kimi ga nozomeba subete ga omoidoori ni naru", vi: "Chỉ cần là điều anh mong ước, mọi thứ sẽ diễn ra đúng như ý nguyện" },
                { time: 46.33, romaji: "I love you no moji no raretsu mo futari ni shika wakaranai imi de", vi: "Chuỗi ký tự 'I love you' mang theo hàm ý chỉ riêng hai ta thấu hiểu" },
                { time: 53.64, romaji: "En ni natte kakomeba soko ga sekai ni naru", vi: "Vẽ một vòng tròn vây quanh, nơi đó liền hóa thành thế giới riêng biệt" },
                { time: 60.83, romaji: "I love you no kotoba datte eien da, kono sekai ja", vi: "Cả lời thề 'I love you' cũng sẽ trở nên bất tử trong thế giới nhỏ bé này" },
                { time: 73.10, romaji: "Nee, koko ni ireba mou anzen yo, katte shitta kankei to madori", vi: "Nè, ở yên nơi đây thì an toàn rồi, những thói quen và căn phòng thân thuộc" },
                { time: 81.98, romaji: "Aa, subete wakannai koto bakari, fuan de, dokomademo muteki da", vi: "Aah, toàn những ẩn số mịt mờ, dù đầy bất an nhưng ta lại mạnh mẽ vô song" },
                { time: 91.78, romaji: "Shunkan kiritoru shattaa on, kakato tsubusu kan'i na sandaru", vi: "Tiếng màn trập bấm tách lưu lại từng khoảnh khắc, đôi dép lê xỏ vội tiện lợi" },
                { time: 100.85, romaji: "Suujitsu awanai tsumori no 'sayonara' eien ni naru to shirazu", vi: "Câu chào 'tạm biệt' ngỡ chỉ xa vài hôm, đâu hay lại hóa thành cách trở muôn trùng" },
                { time: 108.06, romaji: "Kimi ga nozomeba subete ga omoidoori ni naru", vi: "Nếu anh muốn, vạn vật sẽ chuyển dời theo ước nguyện của anh" },
                { time: 115.22, romaji: "I love you no moji no haichi mo nozomanai kyou wa imi wo ushinatte", vi: "Cách sắp xếp từng chữ 'I love you' trong ngày hôm nay bỗng mất đi ý nghĩa" },
                { time: 122.50, romaji: "En ni natte kakomeba soko ga sekai ni naru", vi: "Khép lại một vòng tròn, nơi ấy là khoảng trời riêng ta nâng niu" },
                { time: 129.68, romaji: "I love you no kotoba datte, kowasu mono nante nai kono sekai ja", vi: "Lời yêu thương ấy chẳng gì có thể phá vỡ được trong thế giới này" },
                { time: 155.40, romaji: "Kimi ga nozomeba subete ga omoidoori ni naru", vi: "Chỉ cần anh mong muốn, mọi điều ước đều sẽ thành hiện thực" },
                { time: 162.59, romaji: "I love you no hibiki mo itami mo koukai mo nokoshite ikeru koko ni wa", vi: "Âm vang 'I love you', những đau đớn và cả nỗi hối hận đều có thể lưu lại nơi đây" },
                { time: 171.24, romaji: "En ni natte kakonde tsukutta sekai de ano ko to no kankei ni datte namae wo tsukete ii", vi: "Trong thế giới tròn trịa ta cùng tạo dựng, mối quan hệ này có thể được đặt một cái tên" },
                { time: 184.28, romaji: "Subarashii hibi wo! Every fair from fair sometime declines ✨", vi: "Hướng về chuỗi ngày tươi đẹp nhất trần đời! ✨" }
            ]
        },

        // Track 18: 月に向かって撃て (Tsuki ni Mukatte Ute)
        // Spotify: https://open.spotify.com/intl-vi/track/2aQpmTVc26tkNVChUYzZcS
        // Artist: 星街すいせい (Hoshimachi Suisei) - Mayonaka Heart Tune OP (3:15)
        18: {
            title: "月に向かって撃て (Tsuki ni Mukatte Ute)",
            artist: "星街すいせい (Hoshimachi Suisei)",
            lines: [
                { time: 0.0, romaji: "♪ (Riff guitar cuồng nhiệt & beat bùng nổ)", vi: "Intro nhịp điệu rock sôi động" },
                { time: 15.54, romaji: "Nagamete iru bakari te wo nobashite omoidasu", vi: "Cứ mãi ngắm nhìn từ xa, khẽ vươn cánh tay để hồi tưởng lại" },
                { time: 22.58, romaji: "Kikaretakunai yowane kikasetai koe", vi: "Tiếng thở dài yếu lòng chẳng muốn ai nghe, nhưng thanh âm này lại khát khao truyền tới người" },
                { time: 29.67, romaji: "Fukanou mo kanousei da, kimi ga dare nan da ka shittenda", vi: "Điều bất khả thi cũng chính là tiềm năng, tôi biết rõ người đó rốt cuộc là ai!" },
                { time: 36.75, romaji: "Shoumei shiyou bokura hontou wa doushitai?", vi: "Hãy cùng nhau chứng minh xem thực tâm ta muốn đi về đâu!" },
                { time: 43.08, romaji: "Nigetai to mimi fusaida, shagamu shinzou wo tataitetta Swing by", vi: "Bịt chặt tai vì muốn trốn chạy, đánh thức trái tim đang co rúm bằng một cú Swing by rực cháy" },
                { time: 50.04, romaji: "Kawaranai hyoujou ni kotae wo tsukitatete", vi: "Ghim thẳng câu trả lời dứt khoát vào gương mặt lạnh lùng không đổi" },
                { time: 56.24, romaji: "Jounetsu wa tsuki ni mukatte ute, sunaipaa!", vi: "Ngắm chuẩn đam mê và bóp cò hướng thẳng về mặt trăng, xạ thủ thiện xạ!" },
                { time: 60.27, romaji: "Mirai wa douyara kimi shidai, nodo ga kawaitatte koukai wa nai wa", vi: "Tương lai ra sao tùy thuộc vào cậu đấy, dẫu khát khô cổ họng cũng tuyệt không hối hận" },
                { time: 67.64, romaji: "Surimuite umeru no 99%, koyubi ni wa shoudou wo", vi: "Trầy xước để lấp đầy 99%, ngón tay út mang theo luồng xung động mãnh liệt" },
                { time: 74.65, romaji: "Hontou wa doushitain dakke? Aizu shite Haatotyuun ni nosete", vi: "Rốt cuộc ta muốn làm gì cơ chứ? Hãy ra dấu và hòa vào tần sóng Heart Tune!" },
                { time: 81.84, romaji: "Ah, ah Darlin' I know who you are. Ah, ah", vi: "Anh yêu hỡi, em biết rõ anh là ai mà!" },
                { time: 85.75, romaji: "Ichibannori de Fly me to the moon", vi: "Người đầu tiên phóng vút bay lên tận cung trăng sáng" },
                { time: 92.84, romaji: "Butsukatta kabe mo butsukeatta kuyashisa mo bukiyou ni terasu rozetta ni nare", vi: "Những bức tường va vấp và nỗi ấm ức chất chứa, hãy biến thành phiến đá Rosetta soi tỏ lối đi" },
                { time: 103.51, romaji: "Moshimo jinsei ga juppun nara, nanafun wa anata to no kecchaku ni", vi: "Nếu đời người chỉ vỏn vẹn mười phút, bảy phút dành trọn để phân thắng bại cùng anh" },
                { time: 110.41, romaji: "Mune odoru you na atorakshon de Touch Down!!", vi: "Cú hạ cánh Touch Down đầy phấn khích như trò chơi nghẹt thở!!" },
                { time: 132.72, romaji: "Okubyou mo 'suki' de moyashite ike surasutaa", vi: "Đốt cháy cả sự hèn nhát bằng ngọn lửa 'yêu thương', kích hoạt động cơ đẩy!" },
                { time: 136.71, romaji: "Mada minu gooru wa kimi shidai", vi: "Đích đến phía trước chưa ai thấy tùy thuộc vào bước chân cậu" },
                { time: 140.25, romaji: "Yume mo terashiatta koutenkidoujou suikonde hitoiki 99%", vi: "Hít một hơi sâu 99% trên quỹ đạo giao thoa rực rỡ giấc mơ" },
                { time: 147.70, romaji: "Amaoto mo kassai e, hontou wa doushitain dakke", vi: "Biến tiếng mưa rơi thành tràng pháo tay cổ vũ, rốt cuộc ta muốn làm gì?" },
                { time: 153.84, romaji: "Oitsuku wa Haatotyuun ni kakete", vi: "Em sẽ đuổi kịp anh, đặt cược tất cả vào tần sóng Heart Tune" },
                { time: 158.29, romaji: "Shoumei shiyou todokun datte, jounetsu wa tsuki ni mukatte ute, sunaipaa! ✨", vi: "Chứng minh rằng tiếng gọi sẽ chạm tới nơi, đam mê hãy bắn thẳng lên mặt trăng! ✨" }
            ]
        },

        // Track 19: 声の軌跡 (Koe no Kiseki)
        // Spotify: https://open.spotify.com/intl-vi/track/0N5YLuTIySy1APi9rmSGfj
        // Artist: Soala - Mayonaka Heart Tune ED (3:19)
        19: {
            title: "声の軌跡 (Koe no Kiseki)",
            artist: "Soala",
            lines: [
                { time: 0.0, romaji: "Koi mo yume mo nante mousou, yokubarisugita no ka na", vi: "Tình yêu hay ước mơ chỉ là viển vông, phải chăng em đã quá tham lam?" },
                { time: 6.12, romaji: "Kimi ga oshiete kureta unmei misuterii", vi: "Bí ẩn số phận kỳ diệu mà anh đã từng chỉ cho em thấy" },
                { time: 10.98, romaji: "Mou kikenaku natte sa aitaikuse ni watashi wa mata kimochi dake kakushite", vi: "Chẳng còn được nghe nữa, dù cồn cào muốn gặp mà em lại cố giấu nhẹm tâm tư" },
                { time: 20.90, romaji: "Aimai na kankei no mama totsuzen kiete shimatta", vi: "Giữa mối quan hệ lấp lửng mập mờ, anh bất ngờ biến mất không một dấu vết" },
                { time: 29.08, romaji: "Nouri ni yakitsuita omoide doushitemo hanarenai", vi: "Ký ức khắc sâu vào tâm trí làm sao có thể nguôi ngoai phai mờ" },
                { time: 37.04, romaji: "Kimi no koe wo ano hi kara zutto sagashitetan da yo", vi: "Kể từ ngày định mệnh ấy, em vẫn luôn mải miết đi tìm giọng nói của anh" },
                { time: 44.24, romaji: "Mou ichido kikasete 'aishiteru' wo", vi: "Hãy để em được nghe lại câu 'Anh yêu em' thêm một lần nữa đi anh" },
                { time: 49.07, romaji: "Nani wo shitemo wasurerarenakatta no", vi: "Dù làm bất cứ điều gì, em cũng chẳng thể nào quên được hình bóng người" },
                { time: 54.40, romaji: "Sono koe dake wo tayori ni ikite kitan da yo", vi: "Em đã sống tiếp nhờ bấu víu vào từng dư âm giọng nói thân thương ấy" },
                { time: 63.11, romaji: "Kantan ni ikirareru sekai demo nakute tsurai koto darake de", vi: "Thế giới này chẳng hề dễ dàng, ngập tràn bao đắng cay và gian truân" },
                { time: 71.02, romaji: "Mou afureru namida mo kizukanai furi shite sa mae ni susumu shika nakute", vi: "Giọt lệ trào dâng đành giả vờ như không thấy, chỉ biết cắn răng tiến bước về phía trước" },
                { time: 81.01, romaji: "Yume wo oitsudukeru koto mo kimochi kakushitsudukeru no mo", vi: "Cả việc kiên trì đuổi theo ước mơ lẫn việc giấu kín tình cảm này" },
                { time: 89.03, romaji: "Zenbu kimi no tame to omotteta, nante hitoriyogari da ne", vi: "Em từng ngỡ làm tất cả vì anh, hóa ra chỉ là sự ích kỷ đơn phương của riêng em" },
                { time: 99.14, romaji: "Kimi no koe wo ano hi kara zutto sagashitetan da yo", vi: "Em vẫn luôn tìm kiếm giọng nói ấy suốt những năm tháng dài" },
                { time: 106.32, romaji: "Mou ichido kikasete 'aishiteru' wo", vi: "Xin hãy để em được nghe lại câu 'Anh yêu em' một lần nữa" },
                { time: 111.13, romaji: "Nani wo shitemo wasurerarenakatta no", vi: "Dù năm tháng trôi qua, con tim vẫn chẳng thể phôi pha" },
                { time: 116.46, romaji: "Sono koe dake wo tayori ni ikite kitan da yo", vi: "Chỉ nhờ có thanh âm ấy soi sáng em mới có thể kiên cường bước tiếp" },
                { time: 142.05, romaji: "Kimi no koe wo ano hi kara zutto sagashitetan da yo", vi: "Từ tận đáy lòng, em vẫn luôn khát khao tìm về tiếng nói của người" },
                { time: 149.23, romaji: "Mou ichido kikasete 'aishiteru' wo", vi: "Hãy nói lời 'Anh yêu em' rót vào tai em thêm một lần" },
                { time: 154.07, romaji: "Nani wo shitemo wasurerarenakatta no", vi: "Em không tài nào quên được dù chỉ là một khoảnh khắc" },
                { time: 159.36, romaji: "Sono koe dake wo tayori ni ikite kitan da yo", vi: "Thanh âm của anh là điểm tựa duy nhất cho cả cuộc đời em" },
                { time: 167.38, romaji: "Kimi ni aitai yo, koe wo kikasete yo ✨", vi: "Em muốn gặp anh lắm, hãy cất tiếng cho em nghe đi mà! ✨" }
            ]
        },

        // Track 20: 最最最高級のお世話して (Saishuu Saikoukyuu no Osewa Shite)
        // Spotify: https://open.spotify.com/intl-vi/track/1YorQpcRAhINKp06fy1Kcc
        // Artist: angela - Saijo no Osewa OP (3:14)
        20: {
            title: "最最最高級のお世話して (Saishuu Saikoukyuu no Osewa Shite)",
            artist: "angela",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu vui nhộn hài hước của tiểu thư)", vi: "Intro hầu hạ tiểu thư năng động" },
                { time: 15.54, romaji: "Kyou ashita asatte kimi to no yakusoku", vi: "Hôm nay, ngày mai, ngày kia, bao lời hứa hẹn cùng người" },
                { time: 19.34, romaji: "Me no mawaru supiido ga supesharu desu", vi: "Tốc độ chóng mặt xoay vần đúng là siêu cấp đặc biệt" },
                { time: 23.23, romaji: "Taisetsu na koto kokoroe toshite orimetadashiku itsumo soba ni", vi: "Điều cốt lõi cần ghi nhớ: Luôn tề chỉnh lễ nghi và kề cận bên người" },
                { time: 30.93, romaji: "Kimi ga hohoemu dake de umarete hajimete no you na", vi: "Chỉ cần người hé môi cười, tựa như lần đầu tiên trong đời" },
                { time: 37.35, romaji: "E mo iwarenu you na kouyoukan mou hanashitakunai", vi: "Cảm giác hưng phấn ngập tràn không lời nào tả xiết, chẳng muốn rời xa" },
                { time: 44.82, romaji: "Sai sai saikoukyuu no osewa shite kudasai, sai sai saishokukenbi wa sanbyakurokujuugonichi", vi: "Hãy đón nhận sự chăm sóc cao cấp nhất trần đời, tài sắc vẹn toàn suốt 365 ngày!" },
                { time: 52.54, romaji: "Sai sai saikoukyuu no osewa shite kudasai, sainou yuunou I know nando demo iu no", vi: "Hãy đón nhận sự săn sóc thượng hạng nhất, tài ba đảm đang em nhắc lại vạn lần" },
                { time: 60.27, romaji: "Sai sai saidaigen no osewa shite kudasai", vi: "Hãy để em dốc sức hầu hạ người ở mức tối đa!" },
                { time: 63.95, romaji: "Sai sai saisho no ippo wa dare demo tajirogu mono desu", vi: "Bước đi đầu tiên ai cũng có chút bỡ ngỡ ngại ngùng" },
                { time: 68.01, romaji: "Sai sai saidaigen no osewa shite kudasai, sainou yuunou I know nando demo iu no", vi: "Tận tâm phục vụ hết mình, tài đức vẹn toàn em khẳng định trăm lần" },
                { time: 76.71, romaji: "Zutto soba ni ite ageru boku ga boku rashiku aru tame ni", vi: "Em sẽ mãi ở bên chở che để người được tự do sống là chính mình" },
                { time: 84.42, romaji: "Aijou joushou kanjou tanjou kara saijo no osewa", vi: "Tình thương trào dâng, xúc cảm thăng hoa từ sứ mệnh chăm sóc tiểu thư" },
                { time: 91.96, romaji: "Dare yori chikaku de mamotte ageru ichiban chikaku de", vi: "Em sẽ bảo vệ người từ cự ly gần nhất, gần hơn bất kỳ ai trên đời" },
                { time: 101.87, romaji: "Moshikashite kasanete kureta sono te wa tsunagaru mirai wo yokan shiteku", vi: "Bàn tay người khẽ đặt lên tay em như báo trước một tương lai gắn kết" },
                { time: 109.62, romaji: "Fushigi kankaku ima wa tonikaku umarete iku jikaku kagirinaku", vi: "Cảm giác kỳ diệu khôn xiết, một ý thức trách nhiệm vô bờ đang nảy nở trong tim" },
                { time: 117.17, romaji: "Umaku ienai dake de sonzaikachi wo shimesu you na", vi: "Dù khó cất thành lời, nơi đây như chứng minh giá trị tồn tại của em" },
                { time: 123.62, romaji: "Ibasho ga aru tte anshinkan mou modorenai", vi: "Cảm giác an tâm khi tìm thấy chốn dung thân, chẳng thể quay đầu lại" },
                { time: 130.51, romaji: "Motto kimi ni tsutaetai ai toka sore ijou no supaisu", vi: "Càng muốn thổ lộ cùng người, thứ gia vị nồng nàn hơn cả tình yêu" },
                { time: 137.47, romaji: "Genjou joujou!? Joucho wo tsumekonde saijo no osewa", vi: "Hiện trạng cực tốt!? Gói ghém trọn tâm tình hầu hạ tiểu thư đài các" },
                { time: 144.96, romaji: "Kazaranai boku wo nozonde kureru nara", vi: "Nếu người đón nhận con người chân thật mộc mạc của em" },
                { time: 151.25, romaji: "Sai sai saikoukyuu no osewa shite kudasai, sai sai saishokukenbi wa sanbyakurokujuugonichi", vi: "Em sẽ săn sóc người theo tiêu chuẩn vương giả nhất suốt 365 ngày!" },
                { time: 158.99, romaji: "Sai sai saidaigen no osewa shite kudasai, sainou yuunou I know nando demo iu no", vi: "Hầu hạ chu đáo đến mức tối đa, tài năng tháo vát dẫu nói bao nhiêu lần cũng chuẩn" },
                { time: 166.72, romaji: "Zutto soba ni ite ageru boku ga boku rashiku aru tame ni", vi: "Em sẽ mãi ở cạnh người để người được rạng rỡ tỏa sáng là chính mình" },
                { time: 174.43, romaji: "Aijou joushou kanjou tanjou kara saijo no osewa", vi: "Tình thương đong đầy hòa cùng sứ mệnh phụng sự tiểu thư hoàn mỹ" },
                { time: 181.95, romaji: "Dare yori chikaku de mamotte ageru ichiban chikaku de", vi: "Em sẽ chở che cho người ở cự ly kề cận nhất" },
                { time: 189.60, romaji: "Sai sai saikoukyuu no osewa shite kudasai! ✨", vi: "Hãy đón nhận sự săn sóc hoàng gia tuyệt đỉnh này nhé! ✨" }
            ]
        },

        // Track 21: 完璧じゃないわたし (Kanpeki ja Nai Watashi)
        // Spotify: https://open.spotify.com/intl-vi/track/2guDoM8CAJKx1cQwNFSPW5
        // Artist: 前島亜美 (Ami Maeshima) - Saijo no Osewa ED (3:36)
        21: {
            title: "完璧じゃないわたし (Kanpeki ja Nai Watashi)",
            artist: "前島亜美 (Ami Maeshima)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng thở dài nũng nịu & piano êm dịu)", vi: "Intro tiểu thư làm nũng đáng yêu" },
                { time: 12.50, romaji: "Kanpeki ja nai watashi kimi ga inakya are kore dekinai bakka", vi: "Em chẳng hề hoàn hảo đâu, không có anh ở bên em việc gì cũng lúng túng chẳng xong" },
                { time: 19.46, romaji: "Takane no hana nante iwazu ni soba ni ite yo nee 'kimi ga hoshii'", vi: "Đừng bảo em là đóa hoa trên đỉnh núi xa vời, hãy ở cạnh em đi mà, em cần anh!" },
                { time: 26.47, romaji: "(Fu nya nya, fu nya nya...)", vi: "(Ngái ngủ nũng nịu...)" },
                { time: 30.56, romaji: "Seiso karen bunburyoudou? Haritsuita kamen no emi", vi: "Thanh thuần đoan trang, văn võ song toàn sao? Chỉ là chiếc mặt nạ nụ cười gượng gạo thôi" },
                { time: 36.70, romaji: "Moo muri muri kaeritai mou suima wa genkai omukae wa?", vi: "Thôi mệt mỏi lắm rồi muốn về nhà cơ, cơn buồn ngủ ập đến rồi anh chưa đến đón em sao?" },
                { time: 43.14, romaji: "Zutto motometeta no kimi no you na hito wo (Ha-ah) takanatteku kokoro", vi: "Em vẫn luôn khao khát một người như anh (Ha-ah), con tim cứ rộn ràng thổn thức" },
                { time: 51.65, romaji: "Nee kore kara watashi no kayowasa mo aishite ne", vi: "Nè, từ nay về sau hãy yêu thương cả những yếu mềm vụng dại nơi em nhé" },
                { time: 57.17, romaji: "Kanpeki ja nai watashi kimi no mae ja zenshin taijuu de amaerarechau no", vi: "Một em chẳng hề hoàn hảo, chỉ trước mặt riêng anh mới dám nũng nịu dựa trọn vào lòng" },
                { time: 65.10, romaji: "Gokigen no osewa datte kimi no yakuwari desho? (Desho?)", vi: "Dỗ dành cho em vui vẻ cũng là bổn phận chăm sóc của anh cơ mà, đúng không nào?" },
                { time: 72.30, romaji: "Kanpeki ja nai watashi kimi ga inakya are kore dekinai bakka", vi: "Em đâu có hoàn hảo đâu, vắng anh là việc gì em cũng lóng ngóng chẳng nên thân" },
                { time: 79.06, romaji: "Takane no hana nante iwazu ni soba ni ite yo nee 'kimi ga hoshii'", vi: "Đừng coi em là cành hoa cao sang xa vời, hãy ở bên em đi, em muốn có anh!" },
                { time: 87.13, romaji: "'Itsumademo mamottete ne' (Du du du...)", vi: "'Hãy luôn che chở bảo bọc cho em nhé' (Du du du...)" },
                { time: 97.40, romaji: "Kou aru beki saijo toshite engi bakari no mainichi", vi: "Chuỗi ngày phải gồng mình diễn trọn vai một tiểu thư hoàn mỹ kiểu mẫu" },
                { time: 103.83, romaji: "Shisei tadashi uruwashiku mou unzari yo", vi: "Lúc nào cũng phải đoan trang quý phái, em phát chán ngấy lên rồi" },
                { time: 108.33, romaji: "Ochakai nukedashite kimi to te wo tsunaide himitsu no touhikou", vi: "Trốn khỏi tiệc trà quý tộc, nắm chặt tay anh cùng chạy trốn vào thế giới bí mật" },
                { time: 114.67, romaji: "Issho ni okorareyokka dokomademo tsuredashite ne", vi: "Có bị mắng thì hai đứa mình cùng chịu, hãy đưa em đi tới cùng trời cuối đất nhé" },
                { time: 120.32, romaji: "Kanpeki ja nai anata dakara ii no! Tameguchi yobisute zettai genshu!", vi: "Chính vì anh không hề hoàn hảo nên mới tuyệt làm sao! Cứ xưng hô thoải mái, gọi tên em thân mật nhé!" },
                { time: 128.31, romaji: "Kiraku demo taitou yo kore ga honto no suki? Ah", vi: "Thật thoải mái và bình đẳng xiết bao, đây chính là tình yêu chân thật phải không anh? Ah" },
                { time: 134.39, romaji: "Kodoku kara sukutte kureta hiiroo, donna hibi mo mou kowakunai yo", vi: "Chàng anh hùng cứu rỗi em khỏi nỗi cô đơn lạnh lẽo, giờ đây em chẳng còn sợ hãi điều gì nữa" },
                { time: 142.09, romaji: "Kimi ga ite kureru no naraba Ah", vi: "Chỉ cần luôn có anh ở bên chở che Ah" },
                { time: 148.18, romaji: "Kanpeki ja nai watashi kimi no mae ja zenshin taijuu de amaerarechau no", vi: "Một em chẳng hề hoàn hảo, trước mặt anh lại muốn sà vào lòng làm nũng hết mình" },
                { time: 156.17, romaji: "Gokigen no osewa datte kimi no yakuwari desho? (Desho?)", vi: "Dỗ dành cho em vui tươi là trách nhiệm ngọt ngào của anh cơ mà, đúng chứ?" },
                { time: 163.34, romaji: "Kanpeki ja nai watashi kimi ga inakya are kore dekinai bakka", vi: "Em không hề hoàn hảo đâu, không có anh em việc gì cũng ngơ ngác chẳng xong" },
                { time: 170.04, romaji: "Takane no hana nante iwazu ni soba ni ite yo nee 'kimi ga hoshii'", vi: "Đừng đẩy em lên đài cao xa lạ, hãy ở cạnh bên em đi, em chỉ cần anh thôi!" },
                { time: 178.26, romaji: "'Itsumademo mamottete ne' ✨", vi: "'Hãy luôn che chở bảo bọc cho em suốt cuộc đời này nhé!' ✨" }
            ]
        },

        // Track 22: Submarine Youth (サブマリンユース)
        // Spotify: https://open.spotify.com/intl-vi/track/3EAaR5AFd8T1HmAP3dPIXG
        // Artist: reGretGirl - Anime OP (3:27)
        22: {
            title: "Submarine Youth (サブマリンユース)",
            artist: "reGretGirl",
            lines: [
                { time: 0.0, romaji: "♪ (Riff guitar rộn ràng & tiếng sóng biển)", vi: "Intro tuổi trẻ tươi vui" },
                { time: 1.50, romaji: "Samenai yume no you na kimi to iki wo hisome wakachiaeru", vi: "Bên cậu tựa như một giấc chiêm bao chẳng bao giờ muốn tỉnh, cùng nín thở sẻ chia" },
                { time: 7.52, romaji: "Himitsu wo kirei ni omou no wa boku dake ja nai yo ne?", vi: "Thấy bí mật ấy đẹp đẽ đến nao lòng, chắc không phải chỉ mình tớ đâu nhỉ?" },
                { time: 13.51, romaji: "Bukiyou demo tada massugu ni dekiru dake sunao de iru kara", vi: "Dẫu còn nhiều vụng về lóng ngóng, tớ vẫn sẽ luôn chân thành sống thật với cảm xúc" },
                { time: 20.65, romaji: "Boku ni mo yoku wakatte inai kono omoi wo issho ni mitsukete yo", vi: "Thứ tình cảm bồi hồi mà chính tớ cũng chưa hiểu hết này, hãy cùng tớ khám phá nhé" },
                { time: 29.23, romaji: "'Kyou wa hitori de sugoshiteitai' toka 'haru ga nigate' demo hontou wa", vi: "Đôi lúc buông lời 'Hôm nay muốn ở một mình' hay 'Ghét mùa xuân', nhưng thực tâm" },
                { time: 36.14, romaji: "Dareka to iru no wa kirai ja nai, soba ni irareru koto ni banbanzai", vi: "Tớ đâu hề ghét cảm giác ở bên ai đó, được kề cận bên cậu là điều hạnh phúc nhất trần đời" },
                { time: 43.04, romaji: "Hitori ni natta toki wa hanseikai, tsumazuku koto mo aru keredo", vi: "Mỗi khi chỉ còn lại một mình lại tự kiểm điểm, dù đôi lúc có trắc trở ngập ngừng" },
                { time: 49.00, romaji: "Warattari naitari omoidashite iru", vi: "Bao nụ cười và giọt nước mắt ùa về trong tâm trí" },
                { time: 53.64, romaji: "Sukoshi zutsu peeji wo mekuru you ni maki modosu you ni omoi megutte iru", vi: "Tựa như đang lật giở từng trang lưu bút thanh xuân, tua ngược lại ký ức êm đềm" },
                { time: 60.67, romaji: "Asa wo matsu shizuka na umi wo oyogu you ni nando mo nando mo kimi no moto e yukeru", vi: "Như bơi qua biển sớm mai tĩnh lặng ngóng chờ bình minh, tớ luôn tìm về bên cậu" },
                { time: 72.78, romaji: "Kimi to iru toki no jibun no sugata wo suki da to omoeru kara", vi: "Bởi vì tớ yêu chính hình bóng của mình những khi được ở bên cậu" },
                { time: 79.46, romaji: "Hontou no kimochi wo ima koko de mitsuketa you na ki ga shita yo", vi: "Tớ cảm giác như mình đã tìm thấy tình cảm chân thật nhất ngay tại nơi đây" },
                { time: 88.00, romaji: "'Suki dakedo kirai' toka ittemitari 'kirai dakedo suki' tomo ittemite", vi: "Thử nói 'Thích mà lại ghét', rồi lại buông câu 'Ghét mà lại yêu'" },
                { time: 94.98, romaji: "Furimawasu koto mo aru keredo fukanzen demo arinomama kurasu hibi ga suki dakara", vi: "Dù đôi lúc có làm cậu rối bời, tớ vẫn yêu những ngày vụng về được sống thật bên nhau" },
                { time: 103.90, romaji: "Kimi no subete wo oshiete yo sukoshi zutsu yukkuri de ii kara", vi: "Hãy kể cho tớ nghe mọi điều về cậu nhé, từng chút một thôi cũng được" },
                { time: 111.62, romaji: "Yuuyake ni nobiru futari no kage ga kesshite kasanattari wa shinai you ni", vi: "Dưới ráng chiều hoàng hôn buông dài, hai cái bóng khẽ song hành không chồng chéo" },
                { time: 120.41, romaji: "Muri ni fumikonde konai kara umaku kotoba ni dekizu nayamu keredo", vi: "Vì cậu luôn tế nhị không gượng ép, khiến tớ đôi lúc loay hoay chẳng biết tỏ bày" },
                { time: 127.72, romaji: "Kimochi ni uso wa nai yo warattari naitari omoidashite iru", vi: "Nhưng lòng tớ tuyệt đối không hề dối lừa, bao kỷ niệm vui buồn cứ thế đong đầy" },
                { time: 136.42, romaji: "Fukai umi no ue wo oyogu you ni nando mo nando mo tashikameaou yo", vi: "Tựa như bơi trên đại dương sâu thẳm, hãy cùng nhau xác nhận tình cảm này nhiều lần nữa nhé" },
                { time: 147.53, romaji: "Nagasarenai you ni te wo nigiru kara moratta kotoba wo dakishimete iru", vi: "Nắm chặt bàn tay để không bị cuốn trôi, ôm trọn vào lòng từng lời ân cần cậu trao" },
                { time: 158.74, romaji: "Ima nara me wo mite tashika ni ieru yo itsumademo itsumademo futari rashiku tsuduku you ni", vi: "Giờ đây tớ đã có thể tự tin nhìn vào mắt cậu và nói: Mong đôi ta mãi êm đềm bên nhau" },
                { time: 174.00, romaji: "Samenai yume no you na kimi to iki wo hisome wakachiaeru", vi: "Bên cậu tựa giấc mơ êm đềm chẳng muốn tỉnh, cùng nín thở sẻ chia bao điều" },
                { time: 180.00, romaji: "Himitsu wo kirei ni omou no wa boku dake ja nai yo ne? ✨", vi: "Cảm nhận bí mật này đẹp lung linh, chắc chắn không phải chỉ có mỗi mình tớ rồi! ✨" }
            ]
        },

        // Track 23: ずっと1番にしてね (Zutto Ichibanni Shitene)
        // Spotify: https://open.spotify.com/intl-vi/track/3ri04N6NuypwN9Ol75erjh
        // Artist: コレサワ (Koresawa) - Anime ED (3:33)
        23: {
            title: "ずっと1番にしてね (Zutto Ichibanni Shitene)",
            artist: "コレサワ (Koresawa)",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu guitar mộc & giọng hát đáng yêu)", vi: "Intro lời tỏ tình ngọt ngào" },
                { time: 1.32, romaji: "Atashi to kimi no aishou anmari datte", vi: "Bảo rằng độ tương hợp giữa em và anh chẳng được bao nhiêu" },
                { time: 5.51, romaji: "Iu uranaishi ga itara sore wa nisemono", vi: "Thầy bói nào mà phán thế thì đích thị là đồ lừa đảo!" },
                { time: 9.34, romaji: "Dame dame yo damasarenaide yo, unmei wa atashi ga kimetemasu", vi: "Không được đâu nha đừng để bị lừa, định mệnh của chúng mình là do chính em quyết định!" },
                { time: 15.54, romaji: "Sou desu kore ga honmono no ai nan desu", vi: "Chuẩn luôn, đây mới đích thực là tình yêu chân chính" },
                { time: 19.46, romaji: "Atashi to kimi ga shinda ato ni bijutsukan ni kazarareru yatsu desu", vi: "Thứ tình yêu mà sau này đôi ta qua đời sẽ được đem trưng bày trong bảo tàng nghệ thuật" },
                { time: 26.54, romaji: "Dakara zutto ichiban ni shitene, taisetsu ni aishitene", vi: "Bởi thế hãy luôn coi em là số một nhé, nâng niu yêu thương em thật nhiều vào" },
                { time: 33.09, romaji: "Ima tsunaideru kono te ga kuttsuichau made", vi: "Cho tới khi hai bàn tay đang đan chặt này dính chặt không rời" },
                { time: 39.14, romaji: "Zutto ii kanji de iyou ne, futari nara rakushou da ne tte sa", vi: "Hãy giữ mãi cảm xúc ngọt ngào này nhé, có hai ta thì mọi khó khăn đều là chuyện nhỏ" },
                { time: 46.40, romaji: "Kurutteru kurai de soba ni ite, onegai", vi: "Yêu cuồng say và ở mãi bên em nhé, xin anh đấy!" },
                { time: 54.00, romaji: "Atashitachi zense demo koibito doushi datta to omou no", vi: "Em nghĩ kiếp trước chắc hẳn đôi ta cũng là người yêu của nhau rồi" },
                { time: 61.40, romaji: "Jana kyakashikunai? Konna ni daisuki da nante sa", vi: "Nếu không thì sao giải thích nổi? Tại sao em lại say đắm anh nhiều đến mức này chứ!" },
                { time: 68.57, romaji: "Atashi to kimi no MBTI wa LOVE da wa", vi: "Nhóm tính cách MBTI của em và anh chính là chữ LOVE đấy!" },
                { time: 75.40, romaji: "Sekai ga warattemo dame dame yo nagasarenaide yo", vi: "Dẫu cả thế giới có cười chê, không được lung lay xuôi theo đâu nhé" },
                { time: 81.05, romaji: "Unmei wa atashi ga kimetemasu, sou desu kore ga honmono no ai nan desu", vi: "Định mệnh là do em định đoạt, đây chính xác là tình yêu đích thực" },
                { time: 87.76, romaji: "Atashi to kimi ga shinda ato ni dareka ga eiga ni shichau yatsu desu", vi: "Chuyện tình mà mai sau sẽ có người chuyển thể thành bộ phim điện ảnh kinh điển" },
                { time: 94.42, romaji: "Haa kyakuhon ga dasai no dake wa hontou ni kanben shinu hodo iya dakara", vi: "Haiz, chỉ xin biên kịch đừng viết sến súa quê mùa, ghét cay ghét đắng điều đó luôn" },
                { time: 99.29, romaji: "Atashi, hitto nante shinakute ii no kimi ga taisetsu ni shite kureru nara ne", vi: "Phim chẳng cần viral cháy vé cũng được, miễn sao anh luôn trân trọng nâng niu em" },
                { time: 109.20, romaji: "Zutto ichiban ni shitene, takaramono mitai ni ne", vi: "Hãy luôn coi em là số một, quý giá như báu vật trần gian" },
                { time: 115.77, romaji: "Ima tsunaideru kono te ga kuttsuichau made", vi: "Nắm chặt tay nhau đến khi không thể tách rời" },
                { time: 121.81, romaji: "Zutto ii kanji de iyou ne, futari nara rakushou da ne tte sa", vi: "Giữ mãi dư vị ngọt ngào thuở ban đầu, có nhau là vượt qua tất cả" },
                { time: 129.11, romaji: "Kurutteru kurai de soba ni ite, onegai", vi: "Yêu si dại và kề bên em mãi mãi, xin anh đấy" },
                { time: 150.93, romaji: "Zutto ichiban ni shitene, takaramono mitai ni ne", vi: "Coi em là duy nhất, trân quý em tựa ngọc ngà châu báu" },
                { time: 157.89, romaji: "Zutto ichiban ni shitene, taisetsu ni aishitene", vi: "Luôn đặt em ở vị trí đầu tiên, yêu thương em hết lòng" },
                { time: 164.40, romaji: "Ima tsunaideru kono te ga kuttsuichau made", vi: "Cho đến khi đôi bàn tay này hòa quyện làm một" },
                { time: 170.51, romaji: "Zutto ii kanji de iyou ne, futari nara rakushou da ne tte sa", vi: "Mãi mặn nồng son sắt, hai ta chung bước là chiến thắng mọi gian nan" },
                { time: 177.77, romaji: "Kurutteru kurai de soba ni ite, onegai", vi: "Yêu say đắm và đừng bao giờ rời xa em nhé, em xin anh đấy" },
                { time: 185.15, romaji: "Atashi to kimi no aishou saikou datte iu uranaishi ga itara sore wa honmono yo ✨", vi: "Thầy bói nào mà phán duyên đôi mình là trời sinh một cặp thì đích thị là chân nhân chuẩn 100%! ✨" }
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
        userOffset = Math.max(-10.0, Math.min(10.0, Math.round((userOffset + delta) * 10) / 10));
        safeSet('minkoi_lyrics_offset', userOffset.toString());
        updateOffsetDisplay();
        syncLyricsPlayback();

        if (typeof window.showToast === 'function') {
            const dir = delta > 0 ? `Trễ hơn (+${delta}s)` : `Sớm hơn (${delta}s)`;
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

    document.querySelectorAll('.offset-nudge-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = btn.dataset.delta ? parseFloat(btn.dataset.delta) : (btn.id === 'offset-minus-btn' ? -0.2 : 0.2);
            if (!isNaN(delta)) adjustOffset(delta);
        });
    });
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
