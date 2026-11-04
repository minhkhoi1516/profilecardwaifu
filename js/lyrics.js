/* ========================================================
   MINKOI · SYNCHRONIZED LYRICS ENGINE (COMPLETE EDITION)
   Romaji + Vietnamese Bilingual Karaoke for All 23 Tracks
======================================================== */
(function() {
    'use strict';

    const LYRICS_DATABASE = {
        // Track 1: 可愛くてごめん (Kawaikute Gomen) - Alya Kujou (3:35)
        1: {
            title: "可愛くてごめん (Kawaikute Gomen)",
            artist: "Alya Kujou",
            lines: [
                { time: 0, romaji: "♪ (Nhạc dạo đầu sôi động)", vi: "Intro giai điệu vui tươi" },
                { time: 14, romaji: "Watashi ga watashi no koto wo aishite, nani ga warui no? Shitto desu ka?", vi: "Em yêu chính bản thân mình thì có gì sai? Là ghen tị sao?" },
                { time: 21, romaji: "Daitai jibun migaki mo shinai kuse ni, gatagata iu no yamete moratte ii desu ka?", vi: "Mấy người thậm chí còn chẳng chịu chăm chút cho bản thân, làm ơn bớt xoi mói đi được không?" },
                { time: 28, romaji: "Chu! Kawaikute gomen, umarete kichatte gomen", vi: "Chu! Đáng yêu quá xin lỗi nha, sinh ra trên đời đã đáng yêu thế này rồi!" },
                { time: 35, romaji: "Chu! Azatokute gomen, ki ni nacchau yo ne? Gomen!", vi: "Chu! Thả thính tí mà xin lỗi nhé, chắc làm người ta rung rinh mất rồi? Thứ lỗi nha!" },
                { time: 42, romaji: "Chu! Kawaikute gomen, doryoku shichatte gomen", vi: "Chu! Đáng yêu quá xin lỗi nha, nỗ lực hết mình thế này xin lỗi luôn!" },
                { time: 49, romaji: "Chu! Toutokute gomen, joshiryoku takakute gomen", vi: "Chu! Cao quý thế này xin lỗi nha, sự nữ tính tỏa sáng rạng ngời thế này xin lỗi nhé!" },
                { time: 56, romaji: "Mukatsuku desho? Zamaa!", vi: "Tức tối lắm phải không? Đáng đời lắm cơ!" },
                { time: 63, romaji: "Suki na fuku wo kite, suki na meiku shite", vi: "Mặc những bộ cánh em thích, tô phong cách trang điểm em yêu" },
                { time: 70, romaji: "Kagami no mae de 'Kyou mo kawaii' tte hohoemu no", vi: "Đứng trước gương mỉm cười tự nhủ 'Hôm nay mình cũng thật đáng yêu'" },
                { time: 78, romaji: "Dareka no me nante ki ni shiterarenai", vi: "Chẳng việc gì phải bận tâm ánh nhìn phán xét của ai khác" },
                { time: 85, romaji: "Watashi no jinsei watashi ga shuyaku nano!", vi: "Cuộc đời này em chính là nhân vật chính cơ mà!" },
                { time: 94, romaji: "Chu! Kawaikute gomen, umarete kichatte gomen", vi: "Chu! Đáng yêu quá xin lỗi nha, sinh ra trên đời đã thế rồi!" },
                { time: 101, romaji: "Chu! Azatokute gomen, ikiteru dake de gomen!", vi: "Chu! Thả thính tí mà xin lỗi nhé, chỉ tồn tại thôi cũng đủ làm người ta liêu xiêu rồi!" },
                { time: 108, romaji: "Chu! Kawaikute gomen, kagayaitete gomen", vi: "Chu! Đáng yêu quá xin lỗi nha, tỏa sáng rực rỡ thế này xin lỗi luôn!" },
                { time: 115, romaji: "Chu! Daisuki de gomen, watashi rashikute gomen!", vi: "Chu! Yêu đời thế này xin lỗi nha, luôn là chính mình thế này thứ lỗi nhé!" },
                { time: 125, romaji: "♪ (Đoạn nhạc chuyển cảnh & Solo)", vi: "Giai điệu EDM ngọt ngào sôi động" },
                { time: 145, romaji: "Jibun wo homete agetai toki mo aru, doryoku shita bun dake kawaku nareru", vi: "Cũng có lúc muốn tự khen mình một chút, nỗ lực bao nhiêu bản thân sẽ càng rực rỡ bấy nhiêu" },
                { time: 159, romaji: "Dare ni mo yuzurenai watashi dake no kagayaki", vi: "Ánh sáng riêng biệt này em sẽ chẳng nhường bước cho bất kỳ ai" },
                { time: 167, romaji: "Chu! Kawaikute gomen, umarete kichatte gomen", vi: "Chu! Đáng yêu quá xin lỗi nha, sinh ra đáng yêu thế này rồi!" },
                { time: 174, romaji: "Chu! Azatokute gomen, ki ni nacchau yo ne? Gomen!", vi: "Chu! Thả thính tí mà xin lỗi nhé, rung động mất rồi phải không?" },
                { time: 181, romaji: "Chu! Kawaikute gomen, doryoku shichatte gomen", vi: "Chu! Đáng yêu quá xin lỗi nha, chăm chỉ hoàn thiện bản thân xin lỗi luôn!" },
                { time: 188, romaji: "Chu! Toutokute gomen, joshiryoku takakute gomen", vi: "Chu! Vẻ đẹp quý giá này xin lỗi nhé, cuốn hút thế này thật có lỗi quá!" },
                { time: 195, romaji: "Mukatsuku desho? Zamaa! ✨", vi: "Thấy ghen tị ghê gớm rồi phải không? Đáng đời lắm cơ nha!" },
                { time: 205, romaji: "♪ (Nhạc kết thúc & Tiếng cười tinh nghịch)", vi: "Outro giai điệu ngân vang đến hết bài" }
            ]
        },

        // Track 2: 小さな恋のうた (Chiisana Koi no Uta) - Alya Kujou (4:09)
        2: {
            title: "小さな恋のうた (Chiisana Koi no Uta)",
            artist: "Alya Kujou",
            lines: [
                { time: 0, romaji: "♪ (Tiếng guitar dạo đầu lãng mạn)", vi: "Khúc dạo đầu mộc mạc" },
                { time: 14, romaji: "Hiroi uchuu no kazu aru hitotsu", vi: "Giữa vũ trụ bao la bạt ngàn tinh tú" },
                { time: 21, romaji: "Aoi chikyuu no hiroi sekai de", vi: "Trên hành tinh xanh rộng lớn ngút ngàn" },
                { time: 28, romaji: "Chiisana koi no omoi wa todoku", vi: "Tâm tư của một mối tình nhỏ bé vẫn nguyện gửi trao" },
                { time: 35, romaji: "Chiisana shima no anata no moto e", vi: "Đến với nơi có bóng hình người nơi hòn đảo nhỏ" },
                { time: 42, romaji: "Anata to deai toki wa nagareru", vi: "Từ khi gặp người, thời gian êm đềm trôi" },
                { time: 49, romaji: "Omoi wo kometa tegami mo fueru", vi: "Những cánh thư chan chứa nỗi niềm ngày một nhiều thêm" },
                { time: 56, romaji: "Itsushika futari tagai ni hibiku", vi: "Chẳng biết từ bao giờ, tâm hồn hai ta đã cùng hòa chung nhịp đập" },
                { time: 63, romaji: "Tokini hageshiku tokini setsunaku", vi: "Khi thì mãnh liệt nồng say, khi lại da diết khôn nguôi" },
                { time: 72, romaji: "Hibiku omoi wa tooku haruka e, yasashii uta wa sekai wo kaeru", vi: "Tâm can vang vọng đến tận chân trời xa thẳm, khúc ca dịu êm làm đổi thay cả thế giới" },
                { time: 86, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Kìa xem, người quan trọng nhất trong lòng bạn, đang ở ngay bên cạnh bạn đấy thôi" },
                { time: 100, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta", vi: "Chỉ mong tiếng lòng này đến được với người, hãy vang lên hỡi khúc ca tình yêu!" },
                { time: 114, romaji: "Hora, hora, hora, hibike koi no uta", vi: "Kìa, hãy lắng nghe, khúc ca tình yêu đang ngân vang" },
                { time: 140, romaji: "Anata wa kidzuku, futari dake no sekai ga aru koto wo", vi: "Người sẽ nhận ra, trên đời này luôn có một thế giới chỉ thuộc về hai ta" },
                { time: 168, romaji: "Tada anata ni dake todoite hoshii", vi: "Chỉ mong khúc ca này gửi trọn đến riêng người" },
                { time: 185, romaji: "Hibike koi no uta ✨", vi: "Vang vọng mãi, bản tình ca nhỏ bé!" }
            ]
        },

        // Track 3: ワールドイズマイン (World is Mine) - Alya Kujou (4:12)
        3: {
            title: "ワールドイズマイン (World is Mine)",
            artist: "Alya Kujou",
            lines: [
                { time: 0, romaji: "♪ (Tiếng đàn piano & intro công chúa)", vi: "Khúc dạo đầu kiêu sa" },
                { time: 13, romaji: "Sekai de ichiban ohimesama, sou iu atsukai kokoroe te yo ne", vi: "Em là nàng công chúa đệ nhất trần đời, hãy nhớ cách đối xử cho xứng đáng đấy nhé!" },
                { time: 26, romaji: "Sono ichi, itsumo to chigau kamigata ni kigatsuite", vi: "Điều thứ nhất: Khi em đổi kiểu tóc mới, phải nhận ra ngay lập tức" },
                { time: 33, romaji: "Sono ni, chanto kutsu made mirukoto, ii ne?", vi: "Điều thứ hai: Phải ngắm nhìn tỉ mỉ đến tận đôi giày em mang, hiểu chưa?" },
                { time: 39, romaji: "Sono san, watashi no hitokoto ni wa mittsu no kotoba de henji surukoto", vi: "Điều thứ ba: Mỗi lời em nói, phải đáp lại bằng ba câu ngọt ngào" },
                { time: 47, romaji: "Wakattara migite ga orusu nano wo nantoka shite!", vi: "Nếu hiểu rồi thì mau nắm lấy bàn tay đang để trống của em đi này!" },
                { time: 54, romaji: "Betsu ni wagamama nante itte naindakara", vi: "Em đâu có đòi hỏi gì ích kỷ hay vô lý đâu cơ chứ" },
                { time: 61, romaji: "Kimi ni kokoro kara 'kawaii' tte omotte hoshii dake nano!", vi: "Em chỉ muốn anh thật lòng nghĩ rằng 'Cô ấy thật đáng yêu' mà thôi!" },
                { time: 75, romaji: "Sekai de ichiban ohimesama, ki ga tsuite ne, matte iru no yo", vi: "Em là nàng công chúa duy nhất trần đời, hãy mau nhận ra đi, em vẫn đang đợi anh đấy!" },
                { time: 120, romaji: "Watashi no me wo mitene, suki tte itte!", vi: "Hãy nhìn thẳng vào mắt em và nói lời yêu đi!" },
                { time: 180, romaji: "Zutto zutto, kimi dake no ohimesama de itai no", vi: "Em chỉ muốn mãi mãi làm nàng công chúa của riêng anh thôi ✨" }
            ]
        },

        // Track 4: CHE.R.RY - Alya Kujou (3:29)
        4: {
            title: "CHE.R.RY",
            artist: "Alya Kujou",
            lines: [
                { time: 0, romaji: "♪ (Tiếng acoustic guitar dạo êm đềm)", vi: "Intro guitar mộc mạc" },
                { time: 12, romaji: "Kimi no koe ga kikoeta ki ga shite, futo furikaetta kaerimichi", vi: "Ngỡ như vừa nghe thấy giọng nói của anh, trên con đường về bỗng giật mình ngoái lại" },
                { time: 24, romaji: "Koishichatta n da tabun, kidzuite nai deshou?", vi: "Có lẽ em đã trót tương tư mất rồi, chắc anh chẳng nhận ra đâu nhỉ?" },
                { time: 36, romaji: "Honno sukoshi no yuuki ga nakute, meru no ichigyou ni nayanderu no", vi: "Chỉ thiếu một chút dũng khí thôi, mà dòng tin nhắn gửi đi cứ đắn đo mãi" },
                { time: 48, romaji: "Amai amai cherry no you na, hajimete no kimochi wo anata ni", vi: "Ngọt ngào như trái anh đào mọng nước, cảm xúc đầu đời này xin gửi trọn về anh" },
                { time: 70, romaji: "Suki yo tte ietara donna ni ii darou", vi: "Nếu như có thể thốt lên câu 'Em thích anh' thì tuyệt biết bao" },
                { time: 110, romaji: "Koishichatta n da, cherry no kisetsu ni", vi: "Em đã đem lòng yêu rồi, giữa mùa anh đào nở rộ" }
            ]
        },

        // Track 5: Chiisana Koi no Uta - Shiina Mahiru (5:00)
        5: {
            title: "Chiisana Koi no Uta",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 0, romaji: "♪ (Tiếng đàn piano & dàn dây nhẹ nhàng của Mahiru)", vi: "Khúc dạo đầu dịu dàng như thiên thần" },
                { time: 18, romaji: "Hiroi uchuu no kazu aru hitotsu, aoi chikyuu no hiroi sekai de", vi: "Giữa vũ trụ bao la muôn vàn tinh tú, trên hành tinh xanh ngút ngàn" },
                { time: 32, romaji: "Chiisana koi no omoi wa todoku, chiisana shima no anata no moto e", vi: "Tâm tư tình cảm nhỏ bé này vẫn bay xa, tìm đến bên anh nơi góc nhỏ thân quen" },
                { time: 48, romaji: "Anata ga kureta yasashii jikan, tonari de sotto hohoende kureta", vi: "Khoảng thời gian ấm áp người trao tặng, nụ cười dịu dàng khi anh ngồi cạnh bên" },
                { time: 64, romaji: "Hora anata ni totte daiji na hito hodo, sugu soba ni iru no", vi: "Kìa xem, người trân quý nhất trong lòng anh, đang ở ngay bên cạnh anh này" },
                { time: 80, romaji: "Tada anata ni dake todoite hoshii, hibike koi no uta", vi: "Chỉ mong tiếng lòng này gửi trọn đến anh, ngân vang hỡi khúc ca tình yêu" },
                { time: 120, romaji: "Anata to sugoshita hibi ga takaramono nano", vi: "Những ngày tháng ở bên anh là báu vật quý giá nhất đời em" },
                { time: 180, romaji: "Zutto soba ni ite ne, Amane-kun ✨", vi: "Hãy luôn ở bên cạnh em nhé..." }
            ]
        },

        // Track 6: Ai Uta (愛唄) - Shiina Mahiru (3:35)
        6: {
            title: "Ai Uta (愛唄)",
            artist: "Iwami Manaka (Shiina Mahiru)",
            lines: [
                { time: 0, romaji: "♪ (Tiếng acoustic êm đềm)", vi: "Intro tình ca êm ái" },
                { time: 12, romaji: "Nee, daisuki na kimi e, waratte naide kiite hoshii", vi: "Này anh yêu dấu, đừng cười em nhé, hãy lắng nghe em nói này" },
                { time: 24, romaji: "'Aishiteru' da nante kusai kedo ne, dakedo kono kimochi wa hontou nanda", vi: "Nói lời 'Yêu anh' nghe có vẻ ngượng ngùng sến súa, nhưng đó là tất cả chân thành trong em" },
                { time: 38, romaji: "Tada naki, warai, sugosu hibi ni, tonari ni kimi ga ite kurete arigatou", vi: "Những ngày cùng khóc cùng cười trôi qua, cảm ơn vì anh đã luôn có mặt ở bên em" },
                { time: 54, romaji: "Bukiyou na watashi dakedo, zutto anata wo aishiteimasu", vi: "Một đứa vụng về như em, nhưng nguyện trọn đời này sẽ luôn yêu thương anh" },
                { time: 80, romaji: "Futari de arukou, kore kara no mirai wo", vi: "Hãy cùng nhau bước đi trên con đường tương lai phía trước nhé" }
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
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0, romaji: "♪ (Hương thơm bánh ngọt & giai điệu hoa nở)", vi: "Khúc dạo đầu tươi sáng rộn ràng" },
                { time: 15, romaji: "Asahi ga sashikomu madobe de, atarashii kyou ga hajimaru", vi: "Ánh nắng sớm mai rọi qua khung cửa sổ, một ngày mới ngập tràn hy vọng lại bắt đầu" },
                { time: 30, romaji: "Amaku kaoru yakitate no keeki to, kimi no egao ga areba sore de ii", vi: "Hương thơm ngọt ngào của mẻ bánh nướng mới ra lò, chỉ cần có nụ cười của cậu là đủ rồi" },
                { time: 45, romaji: "Hare no hi ni saku hana no you ni, massugu ni kimi wo mitsumeteitai", vi: "Như đóa hoa vươn mình nở rộ dưới nắng trong veo, tớ chỉ muốn ngắm nhìn cậu thật trọn vẹn" },
                { time: 70, romaji: "Kono kimochi wa kesshite kienai, taisetsu na omoide", vi: "Tình cảm này sẽ chẳng bao giờ phai nhạt, mãi là ký ức quý giá nhất" },
                { time: 110, romaji: "Rintaro-kun to deete hontou ni yokatta", vi: "Thật may mắn biết bao khi tớ được gặp gỡ cậu, Rintaro-kun..." }
            ]
        },

        // Track 13: まなざしは光 (Manazashi wa Hikari) - Waguri Kaoruko (3:27)
        13: {
            title: "まなざしは光 (Manazashi wa Hikari)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0, romaji: "♪ (Giai điệu piano thanh khiết)", vi: "Intro piano trong trẻo" },
                { time: 14, romaji: "Kimi no manazashi wa atatakai hikari, kurayami wo terashitekureru", vi: "Ánh mắt của cậu tựa luồng sáng ấm áp, thắp sáng cả khoảng tối trong tâm hồn tớ" },
                { time: 32, romaji: "Soba ni iru dake de tsuyoku nareru no", vi: "Chỉ cần được ở bên cậu, tớ cảm thấy mình mạnh mẽ hơn rất nhiều" },
                { time: 55, romaji: "Kono hikari wo zutto hanashitaku nai", vi: "Ánh sáng ấm áp này, tớ nguyện sẽ mãi giữ chặt trong lòng" }
            ]
        },

        // Track 14: ひとひら (Hitohira) - Waguri Kaoruko (4:42)
        14: {
            title: "ひとひら (Hitohira)",
            artist: "Waguri Kaoruko",
            lines: [
                { time: 0, romaji: "♪ (Cánh hoa trà rơi nhẹ trong gió)", vi: "Intro giai điệu nhẹ nhàng" },
                { time: 16, romaji: "Hitohira no hanabira ga tenohira ni ochite, kimi no nukumori wo omoidasu", vi: "Một cánh hoa khẽ rơi trên lòng bàn tay, gợi nhắc tớ về hơi ấm dịu dàng của cậu" },
                { time: 38, romaji: "Kisetsu ga megutte mo, kawaranai omoi ga koko ni aru", vi: "Dù bốn mùa có luân chuyển, tình cảm nguyên vẹn này vẫn luôn ở nơi đây" }
            ]
        },

        // Track 15: Rintaro to Kaoruko - Waguri Kaoruko OST
        15: { isInstrumental: true, title: "凛太郎と薫子 (Rintaro to Kaoruko)", artist: "Waguri Kaoruko", persona: "kaoruko" },

        // Track 16: 君のせいで愛してる - Sakura Miku (3:51)
        16: {
            title: "君のせいで愛してる (Kimi no Sei de Aishiteru)",
            artist: "Sakura Miku",
            lines: [
                { time: 0, romaji: "♪ (Gió xuân & tiếng chuông hoa anh đào ngân vang)", vi: "Intro mùa xuân rộn rã" },
                { time: 14, romaji: "Harukaze ga fukinukeru machi de, sakura no hanabira ga maiodoru", vi: "Làn gió xuân thổi qua từng con phố nhỏ, cánh hoa anh đào dập dìu nhảy múa" },
                { time: 30, romaji: "Kimi no sei de mune ga kurushiku naru, kimi no sei de konna ni aishiteru!", vi: "Tại cậu mà tim tớ cứ đập thình thịch, tất cả là tại cậu làm tớ yêu đến mức này đấy!" },
                { time: 50, romaji: "Motto chikaku ni kite, tsunai da te wo hanasanaide!", vi: "Hãy đến gần hơn nữa đi, và đừng buông bàn tay đang đan chặt này ra nhé!" }
            ]
        },

        // Track 17: リトルワールド (Little World) - Sakura Miku (3:08)
        17: {
            title: "リトルワールド (Little World)",
            artist: "Sakura Miku",
            lines: [
                { time: 0, romaji: "♪ (Giai điệu điện tử dễ thương)", vi: "Intro phong cách thần tượng vui nhộn" },
                { time: 12, romaji: "Watashitachi dake no chiisana sekai de, uta wo utaou!", vi: "Trong thế giới nhỏ bé chỉ của riêng chúng ta, hãy cùng nhau cất cao tiếng hát nào!" },
                { time: 30, romaji: "Kimi to nara doko made mo ikeru ki ga suru yo", vi: "Chỉ cần có cậu bên cạnh, tớ cảm giác mình có thể đi đến bất kỳ chân trời nào!" }
            ]
        },

        // Track 18: 月に向かって撃て - Shinobu Uzuki (3:15)
        18: {
            title: "月に向かって撃て (Tsuki ni Mukatte Ute)",
            artist: "Shinobu Uzuki",
            lines: [
                { time: 0, romaji: "♪ (Giai điệu đêm khuya huyền bí)", vi: "Intro Midnight Radio" },
                { time: 14, romaji: "Shinya no hachou ni nosete, anata e todokeru koe no messeeji", vi: "Gửi vào làn sóng phát thanh lúc nửa đêm, thông điệp bằng giọng nói gửi riêng đến bạn" },
                { time: 32, romaji: "Tsuki ni mukatte utsu you ni, kono omoi wo hanatou", vi: "Tựa như nhắm bắn về phía ánh trăng, hãy bung tỏa hết tâm tư này" }
            ]
        },

        // Track 19: 声の軌跡 - Shinobu Uzuki (3:19)
        19: {
            title: "声の軌跡 (Koe no Kiseki)",
            artist: "Shinobu Uzuki",
            lines: [
                { time: 0, romaji: "♪ (Âm thanh radio dịu dàng)", vi: "Intro mộc mạc thư giãn" },
                { time: 12, romaji: "Koe ga egaku kiseki ga, anata no yoru wo atatamemasu you ni", vi: "Nguyện cho quỹ đạo của giọng nói này sẽ sưởi ấm màn đêm cô đơn của bạn" },
                { time: 30, romaji: "Konya mo okaeri nasai, Shinobu no rajio e", vi: "Đêm nay cũng mừng bạn đã trở về với sóng radio của Shinobu..." }
            ]
        },

        // Track 20: 最最最高級のお世話して - Konohana Hinako (3:14)
        20: {
            title: "最最最高級のお世話して",
            artist: "Konohana Hinako",
            lines: [
                { time: 0, romaji: "♪ (Giai điệu trà ấm & chăm sóc ngọt ngào)", vi: "Intro chăm sóc dịu dàng" },
                { time: 14, romaji: "Otsukaresama desu! Kyou mo ichinichi ganbarimashita ne", vi: "Bạn vất vả rồi! Hôm nay bạn cũng đã rất cố gắng đấy nhé" },
                { time: 32, romaji: "Saikoukyuu no omotenashi de, anata wo iyashite agemasu", vi: "Hãy để em dùng sự chăm sóc thượng hạng nhất xoa dịu mọi mệt mỏi cho bạn" }
            ]
        },

        // Track 21: 完璧じゃないわたし - Konohana Hinako (3:36)
        21: {
            title: "完璧じゃないわたし (Kanpeki ja Nai Watashi)",
            artist: "Konohana Hinako",
            lines: [
                { time: 0, romaji: "♪ (Giai điệu sâu lắng thổ lộ chân tình)", vi: "Intro sâu lắng" },
                { time: 15, romaji: "Kanpeki ja nakute mo, anata no chikara ni naritai no", vi: "Dù em không phải người hoàn hảo, em vẫn khao khát được trở thành chỗ dựa của anh" },
                { time: 35, romaji: "Kono mama no watashi wo, aishite kuremasu ka?", vi: "Một đứa như thế này, anh có thể yêu thương em được không?" }
            ]
        },

        // Track 22: Submarine Youth - Asanagi Umi (3:27)
        22: {
            title: "Submarine Youth",
            artist: "Asanagi Umi",
            lines: [
                { time: 0, romaji: "♪ (Tiếng sóng vỗ rì rào & đàn bass đại dương)", vi: "Intro tiếng sóng biển sớm mai" },
                { time: 14, romaji: "Aoi umi no soko made mogurikonde, futari dake no himitsu wo sagashini ikou", vi: "Cùng lặn sâu xuống đáy biển xanh ngắt, đi tìm bí mật chỉ thuộc về hai ta nào" },
                { time: 30, romaji: "Nami no oto ga kokoro wo tsutsundeiku, kono natsu wa zutto owaranai ki ga shita", vi: "Tiếng sóng biển vỗ về tâm hồn, cảm giác mùa hạ năm ấy dường như kéo dài bất tận" },
                { time: 55, romaji: "Kimi to mita umi no iro, zutto wasurenai yo", vi: "Màu nước biển ngắm cùng cậu ngày hôm đó, tớ sẽ mãi chẳng bao giờ quên..." }
            ]
        },

        // Track 23: Zutto Ichibanni Shitene - Asanagi Umi (3:33)
        23: {
            title: "Zutto Ichibanni Shitene",
            artist: "Asanagi Umi",
            lines: [
                { time: 0, romaji: "♪ (Tiếng bọt biển ngân nga & guitar biển)", vi: "Intro gió biển xào xạc" },
                { time: 14, romaji: "Dare yori mo ichiban chikaku de, kimi no koto wo mitsumeteiru kara", vi: "Gần hơn bất kỳ ai trên cõi đời này, tớ vẫn luôn hướng ánh mắt dõi theo cậu" },
                { time: 32, romaji: "Zutto ichiban ni shite ne? Yakusoku da yo, kono umi no mae de", vi: "Mãi mãi xem tớ là số một đấy nhé? Hãy hứa đi, trước biển cả bao la này!" },
                { time: 55, romaji: "Kimi no tonari ga watashi no tokutouseki nan dakara! ✨", vi: "Vị trí cạnh bên cậu là chỗ ngồi đặc quyền của riêng tớ đấy nhé!" }
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
