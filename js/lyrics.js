/* ========================================================
   MINKOI · SYNCHRONIZED LYRICS ENGINE (OFFICIAL TIMED EDITION)
   Exact Anime LRC Timestamps & Bilingual Romaji/Vietnamese
======================================================== */
(function() {
    'use strict';

    const LYRICS_DATABASE = {
        // Track 1: 可愛くてごめん (Kawaikute Gomen) - Alya Kujou (CV: Sumire Uesaka)
        // Official Anime Ending Theme Version (3:35)
        1: {
            title: "可愛くてごめん (Kawaikute Gomen)",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
            lines: [
                { time: 0.0, romaji: "♪ (Nhạc dạo đầu sôi động)", vi: "Intro giai điệu vui tươi" },
                { time: 15.0, romaji: "Watashi ga watashi no koto o aishite nani ga warui no?", vi: "Em yêu chính bản thân mình thì có gì sai chứ?" },
                { time: 19.0, romaji: "Shitto deshou ka? Itai da toka kawatteru toka", vi: "Là ghen tị sao? Bảo em làm màu hay lập dị kì quặc?" },
                { time: 23.1, romaji: "Todokimasen ne sono ripurai", vi: "Mấy lời mỉa mai đó chẳng thể chạm tới em đâu!" },
                { time: 26.5, romaji: "Daisuki na oyoufuku daisuki na okeshou de", vi: "Khoác lên bộ cánh yêu thích, tô lớp trang điểm ngọt ngào" },
                { time: 30.5, romaji: "Okimari no haafu tsuin maite odekake shiyo", vi: "Cột mái tóc nửa hai bên quen thuộc rồi tự tin bước xuống phố nào" },
                { time: 34.4, romaji: "Higasa motte bocchi datte shiawase da mon!", vi: "Che ô che nắng, dẫu một mình thôi cũng thấy ngập tràn hạnh phúc!" },
                { time: 38.2, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 41.2, romaji: "Umarete kichatte gomen", vi: "Sinh ra trên đời đã thế rồi, thứ lỗi nhé!" },
                { time: 43.7, romaji: "Chu! Azatokute gomen", vi: "Chu! Thả thính tí mà xin lỗi nha!" },
                { time: 46.8, romaji: "Ki ni nacchau yo ne? Gomen", vi: "Lỡ làm ai đó bận lòng rung rinh rồi? Xin lỗi nha!" },
                { time: 49.1, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 52.4, romaji: "Doryoku shichattete gomen", vi: "Chăm chỉ hoàn thiện bản thân quá cũng xin lỗi luôn!" },
                { time: 54.9, romaji: "Chu! Toutokute gomen", vi: "Chu! Cao quý thế này xin lỗi nha!" },
                { time: 58.0, romaji: "Joshiryoku takakute gomen", vi: "Sức hút nữ tính rạng ngời thế này xin lỗi nhé!" },
                { time: 60.6, romaji: "Mukatsuichau yo ne? Zamaaa w", vi: "Tức tối ghen tị lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 66.1, romaji: "Anata wa anata no koto dake douzo", vi: "Cuộc sống của bạn thì xin mời bạn tự đi mà lo lấy" },
                { time: 69.9, romaji: "Watashi ni kanshou shinaide kudasai", vi: "Làm ơn đừng có can thiệp xoi mói vào chuyện của em!" },
                { time: 73.4, romaji: "Rui wa tomo o yobu to iu kedo todokimasen ne sono kageguchi", vi: "Người xưa nói 'ngưu tầm ngưu', mấy lời nói xấu sau lưng chẳng tới tai em đâu" },
                { time: 79.4, romaji: "Omoi atsuzoko buutsu okiniiri no oryukku de", vi: "Đi đôi boot đế dày cá tính, mang chiếc ba lô em thích nhất" },
                { time: 83.7, romaji: "Kuzusenai maegami kushi de toite odekake shiyo", vi: "Chải lại mái ngố chỉnh chu thật đẹp rồi thong thả dạo chơi" },
                { time: 87.5, romaji: "Karui onna? Fuzaken na osugiru ttsuuno!", vi: "Bảo em dễ dãi hả? Đùa à, mấy người còn non và chậm chân lắm!" },
                { time: 91.4, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 94.3, romaji: "Kono jidai ikite gomen", vi: "Sống giữa thời đại này rực rỡ quá xin lỗi nhé!" },
                { time: 96.7, romaji: "Chu! Medattete gomen", vi: "Chu! Nổi bật quá cũng xin lỗi luôn!" },
                { time: 99.9, romaji: "Ishiki shichau yo ne? Gomen", vi: "Không thể rời mắt khỏi em phải không? Xin lỗi nha!" },
                { time: 102.2, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 105.3, romaji: "Jibun migaki shite gomen", vi: "Chăm sóc bản thân đẹp lên mỗi ngày xin lỗi nhé!" },
                { time: 107.8, romaji: "Chu! Burikko de gomen", vi: "Chu! Điệu đà tí mà xin lỗi nha!" },
                { time: 111.1, romaji: "Toriko ni shichatte gomen", vi: "Mê hoặc trái tim ai kia mất rồi, thứ lỗi nhé!" },
                { time: 113.6, romaji: "Mukatsuichau desho? Zamaaa w", vi: "Khó chịu ghen tị lắm chứ gì? Đáng đời ghê chưa!" },
                { time: 120.0, romaji: "♪ (Khúc nhạc chuyển cảnh & Guitar Solo)", vi: "Đoạn nhạc EDM rộn rã" },
                { time: 127.4, romaji: "Shumi no chigai kawarimono to bakani sarete mo", vi: "Dù sở thích có khác biệt, dù bị coi là kẻ lập dị" },
                { time: 133.2, romaji: "Magetakunai kowaku mo nai antara gotoki", vi: "Em cũng chẳng chịu khuất phục, lũ người như các người em sợ gì chứ" },
                { time: 138.6, romaji: "Jibun no mikata wa jibun de aritai", vi: "Em muốn chính mình sẽ là đồng minh vững chắc nhất của bản thân" },
                { time: 142.0, romaji: "Ichiban taisetsu ni shite agetai", vi: "Muốn trân trọng và yêu quý bản thân em nhất trên đời" },
                { time: 144.7, romaji: "Rifujin na gaman wa sasetakunai 'sore ga watashi'", vi: "Chẳng việc gì phải cam chịu vô lý — Đó mới chính là em!" },
                { time: 150.9, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 153.9, romaji: "Umarete kichatte gomen", vi: "Sinh ra xinh đẹp thế này xin lỗi luôn!" },
                { time: 156.4, romaji: "Chu! Azatokute gomen", vi: "Chu! Thả thính cuốn hút thế này xin lỗi nha!" },
                { time: 159.4, romaji: "Jinsei tanoshinde gomen", vi: "Tận hưởng cuộc đời rực rỡ quá xin lỗi nhé!" },
                { time: 161.8, romaji: "Chu! Kawaikute gomen", vi: "Chu! Đáng yêu quá xin lỗi nha!" },
                { time: 164.9, romaji: "Doryoku shichattete gomen", vi: "Nỗ lực tỏa sáng hết mình xin lỗi luôn!" },
                { time: 167.5, romaji: "Chu! Toutokute gomen", vi: "Chu! Quý giá vô ngần thế này xin lỗi nha!" },
                { time: 170.6, romaji: "Joshiryoku takakute gomen", vi: "Sức hút thiếu nữ không thể cưỡng lại xin lỗi nhé!" },
                { time: 173.2, romaji: "Mukatsuichau yo ne? Zamaaa w ✨", vi: "Ghen tị tức tối lắm phải không? Đáng đời lắm cơ nha!" },
                { time: 180.0, romaji: "♪ (Nhạc kết thúc ngân vang)", vi: "Outro giai điệu đến hết bài" }
            ]
        },

        // Track 2: 小さな恋のうた (Chiisana Koi no Uta) - Alya Kujou (4:09)
        2: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng acoustic guitar dạo đầu)", vi: "Khúc dạo đầu mộc mạc" },
                { time: 15.1, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la bạt ngàn muôn tinh tú" },
                { time: 19.0, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Trên hành tinh xanh rộng lớn ngút ngàn" },
                { time: 23.0, romaji: "Chiisana koi no omoi wa todoku", vi: "Tâm tư tình cảm nhỏ bé này vẫn nguyện gửi trao" },
                { time: 27.0, romaji: "Chiisana shima no anata no moto e", vi: "Đến với nơi có bóng hình người nơi hòn đảo nhỏ" },
                { time: 31.0, romaji: "Anata to deai toki wa nagareru", vi: "Từ thuở gặp gỡ người, thời gian êm đềm trôi" },
                { time: 35.0, romaji: "Omoi wo kometa tegami mo fueru", vi: "Những bức thư chất chứa yêu thương ngày một đong đầy" },
                { time: 39.1, romaji: "Itsushika futari tagai ni hibiku", vi: "Chẳng biết tự khi nào, hai ta đã cùng hòa chung nhịp đập" },
                { time: 43.0, romaji: "Tokini hageshiku tokini setsunaku", vi: "Lúc thì nồng nàn da diết, khi lại nhói buốt con tim" },
                { time: 47.0, romaji: "Hibiku wa tooku haruka kanata e", vi: "Khúc ca vang vọng đến tận chân trời xa xôi" },
                { time: 51.1, romaji: "Yasashii uta wa sekai wo kaeru", vi: "Bản tình ca dịu êm làm đổi thay cả thế giới này" },
                { time: 56.5, romaji: "Hora anata ni totte daiji na hito hodo", vi: "Kìa xem, người quan trọng nhất trong lòng bạn..." },
                { time: 62.8, romaji: "Sugu soba ni iru no", vi: "...đang ở ngay bên cạnh bạn đấy thôi" },
                { time: 66.6, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong gửi gắm trọn vẹn đến riêng người" },
                { time: 72.6, romaji: "Hibike koi no uta", vi: "Hãy ngân vang mãi, hỡi khúc ca tình yêu!" },
                { time: 75.5, romaji: "Hora, hora, hora, hibike koi no uta", vi: "Lắng nghe xem, bản tình ca đang ngân vang rộn rã" },
                { time: 91.9, romaji: "Kurai michi demo hibi terasu tsuki", vi: "Dù con đường tăm tối, vầng trăng vẫn soi sáng tháng ngày" },
                { time: 95.9, romaji: "Nigirishimeta te hanasu koto naku", vi: "Nắm chặt bàn tay người, chẳng bao giờ buông lơi" },
                { time: 100.0, romaji: "Omoi wa tsuyoku eien chikau", vi: "Tâm can khắc sâu, nguyện thề ước bên nhau trọn đời" },
                { time: 127.4, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Người trân quý nhất đời bạn, đang kề cận ngay cạnh bên" },
                { time: 143.5, romaji: "Hibike koi no uta ✨", vi: "Vang vọng mãi, hỡi khúc ca tình yêu!" }
            ]
        },

        // Track 3: ワールドイズマイン (World is Mine) - Alya Kujou (4:12)
        3: {
            title: "ワールドイズマイン (World is Mine)",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng đàn piano & intro công chúa kiêu kỳ)", vi: "Khúc dạo đầu quý tộc" },
                { time: 1.0, romaji: "Sekai de ichiban ohimesama", vi: "Em chính là nàng công chúa đệ nhất trần đời" },
                { time: 5.1, romaji: "Sou iu atsukai kokoroe te yo ne", vi: "Phải biết cách đối xử cho xứng đáng đấy nhé!" },
                { time: 10.0, romaji: "Sono ichi, itsumo to chigau kamigata ni kigatsuku koto", vi: "Điều thứ nhất: Khi em đổi kiểu tóc mới, phải nhận ra ngay" },
                { time: 15.1, romaji: "Sono ni, chanto kutsu made mirukoto, ii ne?", vi: "Điều thứ hai: Phải ngắm nhìn tỉ mỉ tới tận đôi giày em mang, rõ chưa?" },
                { time: 20.1, romaji: "Sono san, watashi no hitokoto ni wa mittsu no kotoba de henji surukoto", vi: "Điều thứ ba: Mỗi câu em nói, phải đáp lại bằng ba câu ân cần" },
                { time: 25.8, romaji: "Wakattara migite ga orusu nano wo nantoka shite!", vi: "Hiểu rồi thì mau nắm lấy bàn tay đang để trống của em đi!" },
                { time: 32.4, romaji: "Betsu ni wagamama nante itte naindakara", vi: "Em đâu có đòi hỏi gì vô lý ích kỷ đâu cơ chứ" },
                { time: 37.5, romaji: "Kimi ni kokoro kara omotte hoshii no kawaii tte", vi: "Em chỉ muốn anh thật lòng thốt lên rằng em đáng yêu mà thôi!" },
                { time: 43.1, romaji: "Sekai de ichiban ohimesama", vi: "Nàng công chúa số một trần gian là em đây" },
                { time: 47.4, romaji: "Kigatsuite nee nee, mataseru nante rongai yo", vi: "Mau nhận ra đi chứ, để em phải chờ là điều không chấp nhận được đâu!" },
                { time: 56.5, romaji: "Mou nandaka amai mono ga tabetai! Ima sugu ni yo", vi: "Tự nhiên em thèm đồ ngọt ghê! Ngay bây giờ đấy nhé!" },
                { time: 64.4, romaji: "Ketten? Kawaii no machigai desho", vi: "Khuyết điểm sao? Nhầm lẫn thành quá đáng yêu thì có!" },
                { time: 69.5, romaji: "Monku wa yurushimasen no!", vi: "Không chấp nhận bất cứ lời phàn nàn nào đâu đấy!" }
            ]
        },

        // Track 4: CHE.R.RY - Alya Kujou (3:29)
        4: {
            title: "CHE.R.RY",
            artist: "Alya Kujou (CV: Sumire Uesaka)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng acoustic guitar dạo êm đềm)", vi: "Intro guitar mộc mạc" },
                { time: 16.8, romaji: "Tenohira de furueta, sore ga chiisana yuuki ni natteitanda", vi: "Rung lên trong lòng bàn tay, điều đó đã trở thành dũng khí nhỏ nhoi" },
                { time: 23.9, romaji: "Emoji wa nigate datta, dakedo kimi kara dattara wakuwaku shichau", vi: "Em vốn vụng về khi dùng biểu tượng cảm xúc, nhưng nếu tin nhắn từ anh thì lại rạo rực khôn nguôi" },
                { time: 32.4, romaji: "Henji wa sugu ni shicha dame datte dareka ni kiita koto aru kedo", vi: "Từng nghe ai đó dặn không được trả lời ngay lập tức" },
                { time: 39.5, romaji: "Kakehiki nante dekinai no... suki na no yo", vi: "Nhưng em chẳng thể chơi trò đưa đẩy... Vì em thích anh mất rồi!" },
                { time: 48.5, romaji: "Koishichatta n da tabun, kidzuite nai deshou?", vi: "Có lẽ em đã đem lòng yêu rồi, anh chắc chẳng nhận ra đâu nhỉ?" },
                { time: 55.3, romaji: "Hoshi no yoru negai komete CHE.R.RY", vi: "Gửi trọn ước nguyện vào đêm ngàn sao, trái anh đào ngọt ngào" },
                { time: 60.6, romaji: "~Yubisaki de okuru kimi e no messeeji", vi: "~Từng đầu ngón tay bấm gửi thông điệp yêu thương về anh" }
            ]
        },

        // Track 5: Chiisana Koi no Uta - Shiina Mahiru (5:00)
        5: {
            title: "Chiisana Koi no Uta",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng đàn piano & dàn dây nhẹ nhàng của Mahiru)", vi: "Khúc dạo đầu dịu dàng như thiên thần" },
                { time: 15.2, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la muôn vàn tinh tú" },
                { time: 19.1, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Trên hành tinh xanh rộng lớn ngút ngàn" },
                { time: 23.1, romaji: "Chiisana koi no omoi wa todoku", vi: "Tâm tư tình cảm nhỏ bé này vẫn bay xa" },
                { time: 27.1, romaji: "Chiisana shima no anata no moto e", vi: "Tìm đến bên anh nơi góc nhỏ thân quen" },
                { time: 31.1, romaji: "Anata to deai toki wa nagareru", vi: "Gặp gỡ bên anh, năm tháng trôi thật êm đềm" },
                { time: 35.1, romaji: "Omoi wo kometa tegami mo fueru", vi: "Từng dòng tâm tư đong đầy theo năm tháng" },
                { time: 56.6, romaji: "Hora anata ni totte daiji na hito hodo", vi: "Kìa xem, người quan trọng nhất đời anh..." },
                { time: 62.8, romaji: "Sugu soba ni iru no", vi: "...đang ở ngay bên cạnh anh đấy thôi" },
                { time: 66.6, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta", vi: "Chỉ mong gửi đến riêng anh, hãy ngân vang bản tình ca ngọt ngào" }
            ]
        },

        // Track 6: Ai Uta (愛唄) - Shiina Mahiru (3:35)
        6: {
            title: "Ai Uta (愛唄)",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 0.0, romaji: "♪ (Intro acoustic mộc mạc)", vi: "Khúc tình ca êm dịu" },
                { time: 0.5, romaji: "Nee, daisuki na kimi e, warawanaide kiite kure", vi: "Này anh yêu dấu hỡi, xin đừng cười mà hãy lắng nghe em nói này" },
                { time: 7.8, romaji: "'Aishiteru' da nante kusai kedo ne", vi: "Nói lời 'Yêu anh' nghe có vẻ ngượng ngùng sến súa" },
                { time: 11.8, romaji: "Dakedo kono kotoba igai tsutaeru koto ga dekinai", vi: "Nhưng ngoài câu nói ấy ra, chẳng còn lời nào diễn tả hết lòng em" },
                { time: 18.6, romaji: "Hora ne! Mata baka ni shite waratta yo ne", vi: "Đấy thấy chưa! Anh lại cười trêu em rồi kìa" },
                { time: 33.2, romaji: "Tada naite waratte sugosu hibi ni", vi: "Chỉ cần những ngày cùng khóc, cùng cười bên nhau" },
                { time: 38.2, romaji: "Tonari ni tatte ireru koto de", vi: "Được đứng kề bên anh mỗi sớm mai" },
                { time: 43.0, romaji: "Boku ga ikiru imi ni natte", vi: "Đó chính là ý nghĩa tồn tại của đời em" },
                { time: 48.3, romaji: "Kimi ni sasagu kono ai no uta", vi: "Khúc tình ca này xin nguyện dâng trọn về anh" }
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
                { time: 15.5, romaji: "Naite shimatta sora wo miteta, kimi wo omotteru", vi: "Ngước nhìn bầu trời đang rưng rưng trút hạt, em lại nhớ về anh" },
                { time: 23.1, romaji: "Namida no ato kawaite kurenai, mada kimi no nioi ga suru", vi: "Vệt nước mắt chưa kịp khô, dường như vẫn còn vương vấn hương thơm của anh" },
                { time: 31.0, romaji: "Aiiro kimi to no denwa muri ni waratteita", vi: "Màu chàm u hoài, cuộc gọi với anh em đã cố gượng cười" },
                { time: 38.8, romaji: "Kumotta sora to watashi 'Kyou wa aenai ne'", vi: "Bầu trời ảm đạm cùng tiếng thở dài 'Hôm nay chúng mình không gặp nhau được rồi nhỉ'" },
                { time: 44.7, romaji: "Aa kore dake no koto de kanashiku narun da na", vi: "A, chỉ một chuyện nhỏ nhặt thế thôi mà sao lòng buồn đến thế" },
                { time: 52.4, romaji: "Pleased your flower, tokibiri no mono ja nakute ii, kimi ga kureru kara ii", vi: "Không cần là thứ gì xa hoa lộng lẫy, chỉ cần là anh trao tặng thì đều là điều tuyệt vời nhất" },
                { time: 60.3, romaji: "Please your love, kimi ga fuchidotta ai no kaotsuki zutto mite itai", vi: "Hình hài tình yêu mà anh vẽ nên, em chỉ muốn ngắm nhìn mãi thôi" }
            ]
        },

        // Track 13: まなざしは光 (Manazashi wa Hikari) - Waguri Kaoruko (3:27)
        13: {
            title: "まなざしは光 (Manazashi wa Hikari)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu piano trong trẻo)", vi: "Intro piano thanh khiết" },
                { time: 14.5, romaji: "Kimi no manazashi wa atatakai hikari, kurayami wo terashitekureru", vi: "Ánh mắt của cậu tựa luồng sáng ấm áp, thắp sáng cả khoảng tối trong tâm hồn tớ" },
                { time: 32.0, romaji: "Soba ni iru dake de tsuyoku nareru no", vi: "Chỉ cần được ở bên cậu, tớ cảm thấy mình mạnh mẽ hơn rất nhiều" },
                { time: 55.0, romaji: "Kono hikari wo zutto hanashitaku nai", vi: "Ánh sáng ấm áp này, tớ nguyện sẽ mãi giữ chặt trong lòng" }
            ]
        },

        // Track 14: ひとひら (Hitohira) - Waguri Kaoruko (4:42)
        14: {
            title: "ひとひら (Hitohira)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0.0, romaji: "♪ (Cánh hoa trà rơi nhẹ trong gió)", vi: "Intro giai điệu nhẹ nhàng" },
                { time: 16.0, romaji: "Hitohira no hanabira ga tenohira ni ochite, kimi no nukumori wo omoidasu", vi: "Một cánh hoa khẽ rơi trên lòng bàn tay, gợi nhắc tớ về hơi ấm dịu dàng của cậu" },
                { time: 38.0, romaji: "Kisetsu ga megutte mo, kawaranai omoi ga koko ni aru", vi: "Dù bốn mùa có luân chuyển, tình cảm nguyên vẹn này vẫn luôn ở nơi đây" }
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
                { time: 14.0, romaji: "Harukaze ga fukinukeru machi de, sakura no hanabira ga maiodoru", vi: "Làn gió xuân thổi qua từng con phố nhỏ, cánh hoa anh đào dập dìu nhảy múa" },
                { time: 30.0, romaji: "Kimi no sei de mune ga kurushiku naru, kimi no sei de konna ni aishiteru!", vi: "Tại cậu mà tim tớ cứ đập thình thịch, tất cả là tại cậu làm tớ yêu đến mức này đấy!" },
                { time: 50.0, romaji: "Motto chikaku ni kite, tsunai da te wo hanasanaide!", vi: "Hãy đến gần hơn nữa đi, và đừng buông bàn tay đang đan chặt này ra nhé!" }
            ]
        },

        // Track 17: リトルワールド (Little World) - Sakura Miku (3:08)
        17: {
            title: "リトルワールド (Little World)",
            artist: "Sakura Miku",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu điện tử dễ thương)", vi: "Intro phong cách thần tượng vui nhộn" },
                { time: 12.0, romaji: "Watashitachi dake no chiisana sekai de, uta wo utaou!", vi: "Trong thế giới nhỏ bé chỉ của riêng chúng ta, hãy cùng nhau cất cao tiếng hát nào!" },
                { time: 30.0, romaji: "Kimi to nara doko made mo ikeru ki ga suru yo", vi: "Chỉ cần có cậu bên cạnh, tớ cảm giác mình có thể đi đến bất kỳ chân trời nào!" }
            ]
        },

        // Track 18: 月に向かって撃て - Shinobu Uzuki (3:15)
        18: {
            title: "月に向かって撃て (Tsuki ni Mukatte Ute)",
            artist: "Shinobu Uzuki",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu đêm khuya huyền bí)", vi: "Intro Midnight Radio" },
                { time: 14.0, romaji: "Shinya no hachou ni nosete, anata e todokeru koe no messeeji", vi: "Gửi vào làn sóng phát thanh lúc nửa đêm, thông điệp bằng giọng nói gửi riêng đến bạn" },
                { time: 32.0, romaji: "Tsuki ni mukatte utsu you ni, kono omoi wo hanatou", vi: "Tựa như nhắm bắn về phía ánh trăng, hãy bung tỏa hết tâm tư này" }
            ]
        },

        // Track 19: 声の軌跡 - Shinobu Uzuki (3:19)
        19: {
            title: "声の軌跡 (Koe no Kiseki)",
            artist: "Shinobu Uzuki",
            lines: [
                { time: 0.0, romaji: "♪ (Âm thanh radio dịu dàng)", vi: "Intro mộc mạc thư giãn" },
                { time: 12.0, romaji: "Koe ga egaku kiseki ga, anata no yoru wo atatamemasu you ni", vi: "Nguyện cho quỹ đạo của giọng nói này sẽ sưởi ấm màn đêm cô đơn của bạn" },
                { time: 30.0, romaji: "Konya mo okaeri nasai, Shinobu no rajio e", vi: "Đêm nay cũng mừng bạn đã trở về với sóng radio của Shinobu..." }
            ]
        },

        // Track 20: 最最最高級のお世話して - Konohana Hinako (3:14)
        20: {
            title: "最最最高級のお世話して",
            artist: "Konohana Hinako",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu trà ấm & chăm sóc ngọt ngào)", vi: "Intro chăm sóc dịu dàng" },
                { time: 14.0, romaji: "Otsukaresama desu! Kyou mo ichinichi ganbarimashita ne", vi: "Bạn vất vả rồi! Hôm nay bạn cũng đã rất cố gắng đấy nhé" },
                { time: 32.0, romaji: "Saikoukyuu no omotenashi de, anata wo iyashite agemasu", vi: "Hãy để em dùng sự chăm sóc thượng hạng nhất xoa dịu mọi mệt mỏi cho bạn" }
            ]
        },

        // Track 21: 完璧じゃないわたし - Konohana Hinako (3:36)
        21: {
            title: "完璧じゃないわたし (Kanpeki ja Nai Watashi)",
            artist: "Konohana Hinako",
            lines: [
                { time: 0.0, romaji: "♪ (Giai điệu sâu lắng thổ lộ chân tình)", vi: "Intro sâu lắng" },
                { time: 15.0, romaji: "Kanpeki ja nakute mo, anata no chikara ni naritai no", vi: "Dù em không phải người hoàn hảo, em vẫn khao khát được trở thành chỗ dựa của anh" },
                { time: 35.0, romaji: "Kono mama no watashi wo, aishite kuremasu ka?", vi: "Một đứa như thế này, anh có thể yêu thương em được không?" }
            ]
        },

        // Track 22: Submarine Youth - Asanagi Umi (3:27)
        22: {
            title: "Submarine Youth (サブマリンユース)",
            artist: "Asanagi Umi / reGretGirl",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng sóng vỗ rì rào & guitar đại dương)", vi: "Intro tiếng sóng biển sớm mai" },
                { time: 15.5, romaji: "Samenai yume no you na kimi to, iki wo hisome wakachiaeru", vi: "Ở bên cậu như giấc mộng chẳng muốn tỉnh, cùng nín thở sẻ chia mọi điều" },
                { time: 23.2, romaji: "Himitsu wo kirei ni omou no wa boku dake ja nai yo ne?", vi: "Nghĩ rằng bí mật này thật đẹp đẽ, chắc chẳng phải mình tớ đâu nhỉ?" },
                { time: 30.3, romaji: "Bukiyou demo tada massugu ni, dekiru dake sunao de iru kara", vi: "Dẫu vụng về nhưng tớ vẫn luôn chân thật, cố gắng thành thật nhất có thể" },
                { time: 38.2, romaji: "Boku ni mo yoku wakatteinai kono omoi wo issho ni mitsukete yo", vi: "Ngay cả tớ cũng chưa hiểu hết tâm tư này, hãy cùng tớ đi tìm câu trả lời nhé" },
                { time: 46.8, romaji: "'Kyou wa hitori de sugoshiteitai' toka 'Haru ga nigate' demo hontou wa", vi: "'Hôm nay muốn ở một mình' hay 'Không thích mùa xuân', nhưng thật ra..." },
                { time: 54.6, romaji: "Dareka to iru no wa kirai ja nai, soba ni irareru koto ni banbanzai", vi: "...chẳng hề ghét việc có ai đó kề bên, được ở cạnh cậu là điều tuyệt vời nhất rồi!" },
                { time: 74.6, romaji: "Asa wo matsu shizuka na umi wo oyogu you ni", vi: "Như đang bơi giữa mặt biển tĩnh lặng chờ đón ánh bình minh" },
                { time: 89.8, romaji: "Nando mo nando mo kimi no moto e yukeru", vi: "Bao nhiêu lần đi nữa, tớ vẫn sẽ tìm về bên cậu" },
                { time: 96.4, romaji: "Kimi to iru toki no jibun no sugata wo suki da to omoeru kara", vi: "Bởi vì tớ yêu chính con người của mình khi được ở bên cạnh cậu" }
            ]
        },

        // Track 23: Zutto Ichibanni Shitene - Asanagi Umi (3:33)
        23: {
            title: "Zutto Ichibanni Shitene",
            artist: "Asanagi Umi",
            lines: [
                { time: 0.0, romaji: "♪ (Tiếng bọt biển ngân nga & guitar biển)", vi: "Intro gió biển xào xạc" },
                { time: 14.0, romaji: "Dare yori mo ichiban chikaku de, kimi no koto wo mitsumeteiru kara", vi: "Gần hơn bất kỳ ai trên cõi đời này, tớ vẫn luôn hướng ánh mắt dõi theo cậu" },
                { time: 32.0, romaji: "Zutto ichiban ni shite ne? Yakusoku da yo, kono umi no mae de", vi: "Mãi mãi xem tớ là số một đấy nhé? Hãy hứa đi, trước biển cả bao la này!" },
                { time: 55.0, romaji: "Kimi no tonari ga watashi no tokutouseki nan dakara! ✨", vi: "Vị trí cạnh bên cậu là chỗ ngồi đặc quyền của riêng tớ đấy nhé!" }
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

    let currentLyricsTrack = null;
    let activeLineIndex = -1;

    function getCurrentlyPlayingTrack() {
        if (typeof window.getCurrentTrack === 'function') {
            const t = window.getCurrentTrack();
            if (t) return t;
        }
        const idx = typeof window.getCurrentTrackIndex === 'function' ? window.getCurrentTrackIndex() : 0;
        const playlist = CONFIG.music?.playlist || [];
        return playlist[idx] || playlist[0];
    }

    function renderLyrics(track) {
        if (!lyricsBody || !track) return;
        currentLyricsTrack = track;
        activeLineIndex = -1;

        const data = LYRICS_DATABASE[track.id];

        if (lyricsTitle) lyricsTitle.textContent = track.name;
        if (lyricsArtist) lyricsArtist.textContent = track.artist;

        // Check if Instrumental
        const isInst = data?.isInstrumental || track.name.toLowerCase().includes('inst');

        if (isInst) {
            const personaKey = track.persona || 'mahiru';
            const persona = CONFIG.getPersona(personaKey) || CONFIG.personas[1];
            const quote = persona?.quotes?.[0] || 'Hãy để sự tĩnh lặng và giai điệu êm dịu xoa dịu tâm hồn bạn...';

            lyricsBody.innerHTML = `
                <div class="lyrics-instrumental-card">
                    <div class="inst-disc-halo">
                        <i class="fas fa-compact-disc"></i>
                    </div>
                    <span class="inst-tag"><i class="fas fa-sparkles"></i> BẢN PHỐI KHÍ INSTRUMENTAL</span>
                    <h4 class="inst-title">Giai điệu hòa tấu không lời</h4>
                    <p class="inst-desc">Bản nhạc mộc mạc với tiếng đàn Piano, Dàn dây & Guitar du dương — hoàn hảo cho những phút giây học tập, làm việc và thư giãn tâm trí.</p>
                    <div class="inst-quote">“ ${quote} ”</div>
                    <span class="inst-hint"><i class="fas fa-headphones"></i> Hãy đeo tai nghe và thả lỏng tâm trí thưởng thức âm thanh nguyên bản</span>
                </div>
            `;
            return;
        }

        if (!data || !data.lines || data.lines.length === 0) {
            lyricsBody.innerHTML = `
                <div class="lyrics-placeholder">
                    <i class="fas fa-music"></i>
                    <p class="placeholder-title">Giai điệu đang được chuẩn bị lời dịch</p>
                    <p class="placeholder-sub">Hãy thả lỏng và tận hưởng âm thanh êm dịu cùng MinKoi Studio ✨</p>
                </div>
            `;
            return;
        }

        lyricsBody.innerHTML = data.lines.map((line, idx) => `
            <div class="lyric-line" data-index="${idx}" data-time="${line.time}" role="button" tabindex="0">
                <span class="lyric-time">${formatLyricTime(line.time)}</span>
                <div class="lyric-content">
                    <span class="lyric-romaji">${line.romaji}</span>
                    <span class="lyric-vi">${line.vi}</span>
                </div>
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

        // Trigger initial sync right away after rendering
        syncLyricsPlayback();
    }

    function formatLyricTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function syncLyricsPlayback() {
        if (!lyricsModal || !lyricsModal.classList.contains('open') || !audio || !currentLyricsTrack) return;
        const data = LYRICS_DATABASE[currentLyricsTrack.id];
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
    }

    // Auto-update lyrics when track changes
    window.addEventListener('minkoi:trackchange', (e) => {
        const track = e.detail?.track;
        if (lyricsModal?.classList.contains('open') && track) {
            renderLyrics(track);
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
