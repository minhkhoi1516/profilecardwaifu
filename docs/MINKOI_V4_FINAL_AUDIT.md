# MinKoi V4 — audit giao diện và phát hành

Ngày thực hiện: 15/11/2026 (Asia/Ho_Chi_Minh). Bản cơ sở: `50382d783e3b4a6d88477a198b7ae2a553b651ac`. Working tree ban đầu sạch; đã fetch và fast-forward `main` từ `26edebe` lên commit này trước khi sửa. Không reset về bản cũ, không tạo nhánh thường trực, không force-push.

**Đã phát hành bản sửa UI 40.13 và xác minh production.** Local QA và live smoke đã qua trong phạm vi dưới đây. **GitHub Actions chưa có run; thiết bị vật lý và độ khớp lời chưa được chứng nhận.** Không tuyên bố V4 hoàn tất trên mọi thiết bị.

## 1. Vấn đề ban đầu và nguyên nhân

| Phát hiện | Bằng chứng/nguyên nhân |
| --- | --- |
| Preview desktop hỏng | Mở PNG gốc 1440×900 thấy bốn vùng giao diện lặp, avatar và player không trọn vẹn. Lỗi nằm trong pixel, không phải GitHub Markdown. |
| Preview mobile hỏng | PNG gốc 780×1688 cắt nội dung phải và phần điều khiển cuối; không thể dùng làm showcase. Kích thước PNG đúng không chứng minh composition đúng. |
| Quy trình có thể tái phá preview | `test-liquid-drag.ps1`, `verify-chibi-popout.ps1`, `verify-v3-6.ps1` ghi/copy thẳng vào hai ảnh chính thức. Không có cổng duyệt pixel. |
| Không xác định chắc compositor gốc | Không có trace của lần tạo PNG cũ. Không kết luận DPR=2 tự gây tile lặp; đây là giả thuyết chưa được chứng minh. Nguyên nhân quy trình xác nhận được là xuất ảnh không duyệt và cho phép script cũ ghi showcase. |
| Desktop chưa gọn ở 1440×900 | Render cơ sở thực có chiều cao khoảng 1023 px, đẩy phần dưới ra ngoài khung preview. |
| Mobile có nội dung bị che | Tagline dài vượt vùng chứa; các selector avatar theo persona của desktop thắng selector mobile chung. Seek có hit area và rail cùng cao 44 px. |
| Bottom sheet có thể biến mất sau kéo ngắn | Swipe spring xóa inline transform khi trở về 0; CSS đóng dùng `translateY(100%)`. Giữ transform mở là bắt buộc. |
| Resize overlay thiếu đồng bộ | Controller chỉ tính lại anchor; transform desktop/mobile, backdrop và quyền sở hữu scroll lock chưa đổi cùng nhau. Controller cũ trong music cũng can thiệp backdrop của controller chung. |
| Transform tranh quyền | CSS pulse portrait và JS cùng điều khiển transform; đĩa vừa rotation vừa scale trên cùng thuộc tính. |
| Âm lượng bị áp dụng hai lần | Media volume và GainNode cùng nhận phần trăm volume, tạo đáp ứng bình phương ở browser hỗ trợ media volume. |
| Tải ảnh quá rộng | Idle preload tải mọi biến thể wallpaper của các persona dù chưa chọn. Lượt đo cơ sở ghi 29 request asset. |
| Cache cấu hình chồng nhau | Header wildcard đặt `max-age=0` sau header asset; production MP3 thực trả `max-age=0`, không phải immutable như cấu hình đầu tiên gợi ý. Asset không có content hash cũng không phù hợp immutable một năm. |
| QA yếu và báo cáo quá mức | Nhiều guard chỉ đọc chuỗi CSS/JS; script production cũ có thông báo “all systems go” không phụ thuộc đầy đủ assertion và đường dẫn artifact riêng máy. README có zero-lag/60–120 FPS không có số liệu. |

## 2. Sở hữu component và phần được bảo toàn

`js/ui/components.js` sở hữu gesture, focus trap, coordinator, menu ba chấm và bốn controller panel. `js/ui/spring.js` giữ bộ spring chung. `js/music.js` giữ audio, seek, volume, EQ, playlist, timer; nhánh flyout cũ được giữ để bảo toàn fallback và regression guards. Lyrics UI dùng controller chung từ `js/lyrics/index.js`; nội dung/parser/cache/editor vẫn thuộc `js/lyrics/`.

Giữ nguyên 31 MP3, artwork, 8 persona, khóa localStorage, yêu thích, manual lyrics workflow và các sửa metadata Spotify cho track 13/15. Không tạo artwork AI, không thêm lời/timestamp. Trạng thái catalogue vẫn **15 line-timed / 7 instrumental / 9 chưa có lời**; kiểm tra cấu trúc còn 26 dấu hiệu cần nghe đối chiếu, không phải chứng nhận đồng bộ giọng hát.

## 3. Sửa chữa và cải thiện đã triển khai

- Panel giữ transform mở sau swipe settle; gesture nhận quyền điều khiển spring rõ ràng. Swipe dismiss hoàn tất rồi đóng tức thời để tránh xuất hiện lại. Hỗ trợ ID controller khác ID phần tử Lyrics.
- Resize cập nhật anchor, transform, backdrop và scroll lock; lắng nghe visual viewport. Panel ẩn hoàn toàn khi đóng để không tạo đuôi trang trống; `inert` ngăn focus vào nội dung ẩn. Mở lại trước khi đóng xong dùng giá trị spring hiện tại.
- Coordinator đóng panel anh em theo cách xác định để các spring không tranh backdrop. Music fallback không ghi đè backdrop khi controller chung đang hoạt động.
- Menu ba chấm được đặt ở body và định vị fixed, giới hạn chiều cao/rộng và flip theo viewport; click bên trong vẫn được nhận diện đúng.
- Kính theo pointer ngay khi sự kiện được giao, biến dạng nhỏ hơn, spring giữ velocity khi thả. Auto-scroll theo thời gian, không phụ thuộc số frame; frame đầu luôn có bước cuộn hợp lệ.
- Giảm compression nút phát và nút chức năng; volume có spring giãn nhẹ, cập nhật âm lượng trực tiếp, dọn trạng thái khi mất pointer capture.
- Không áp dụng volume hai lần; GainNode chỉ bù khi browser bỏ qua media volume và tiếp tục làm envelope cho fade. iOS vật lý vẫn **NOT TESTED**.
- Mobile có profile cạnh avatar, thông tin theo thứ tự nghe nhạc, rail seek mỏng nhưng giữ vùng chạm, typography theo theme và kích thước avatar có selector đúng. Desktop giảm spacing vừa đủ để giữ trọn thẻ ở khung chính.
- Duyệt pixel phát hiện EQ chỉ có knob mà không thấy rail; bổ sung rail rõ và vùng kéo rộng 44 px, nút đóng sheet tối thiểu 44 px. Safe area áp dụng cả bốn cạnh mobile.
- Bottom sheet dùng token chất lượng/theme; safe area và chiều cao visual viewport được tính. Playlist không tự focus search trên touch, kể cả viewport desktop rộng.
- Zen có dock mobile chia hàng, bài đang nghe, nút thoát dễ tìm, focus vào/ra, background và lyric hiện có; khóa cuộn và vô hiệu hóa vùng UI phía sau. Không thêm lời hoặc chức năng mạng mới.
- Duyệt Zen phát hiện toast che dock khi mới vào: thông báo được chuyển lên trên và hint dùng màu theo theme. Test riêng xác nhận hai vùng không giao nhau.
- Bỏ preload mọi wallpaper; decode khi thực sự chọn. Bỏ `will-change` thường trực trên bảy lớp banner. Dừng visualizer Eco/reduced-motion, giảm nhịp vẽ visualizer mobile/Balanced; không giảm nhịp input. Artwork đứng yên khi idle, đĩa dùng scale độc lập với rotation.

## 4. Kiểm thử Liquid Navigation

Đã chạy riêng và qua: 21 chuỗi (7 mỗi quality), mỗi chuỗi đo 6 vị trí lúc kéo và đảo hướng, so độ dịch chuyển kính với pointer; kiểm tra settle khớp tab trong 2 px, edge auto-scroll >100 px, cancel dọn trạng thái và nhường gesture dọc. Có video Chromium mobile emulation 390×844.

QA không chỉ kiểm tra width >0. CDP acknowledgement có thể đến trước DOM pointer event: test chờ sự kiện thực được giao rồi mới lấy geometry, giữ nguyên ngưỡng sai lệch. Telemetry ghi độ trễ input riêng. Quay video ngắn tách khỏi 21 chuỗi dài để tránh encoder làm sai điều kiện đo; file touch không dùng trace ZIP do từng gặp lỗi archive/truyền file trong runner cục bộ. Screenshot, geometry và video vẫn được giữ; các test khác giữ trace khi thất bại.

Tham chiếu đã đọc: [Miuix LiquidGlassNavigationBar](https://github.com/compose-miuix-ui/miuix/blob/main/example/shared/src/commonMain/kotlin/component/liquid/LiquidGlassNavigationBar.kt), [DampedDragAnimation](https://github.com/compose-miuix-ui/miuix/blob/main/example/shared/src/commonMain/kotlin/component/animation/DampedDragAnimation.kt), [PressFeedback](https://github.com/compose-miuix-ui/miuix/blob/main/miuix-ui/src/commonMain/kotlin/top/yukonga/miuix/kmp/utils/PressFeedback.kt), [GlasmioVolumeSlider](https://github.com/NEORUAA/Glasmio/blob/main/glasmio-ui/src/main/java/io/github/neoruaa/glasmio/ui/GlasmioVolumeSlider.kt). Áp dụng nguyên tắc theo input trực tiếp, phân biệt giữ/kéo/thả/cancel và spring có giới hạn; không sao chép runtime Compose. Demo WASM không truy cập được qua web tool trong phiên này; không tuyên bố đã xác minh tương đương cảm giác trên Android.

## 5. Panel, responsive, audio và Zen

Đã chạy Playwright/Edge Windows headless: **20/20 pass, 0 skip, 0 flaky, 0 retry**, 423,3 giây. Ma trận gồm desktop 1440×900, 1280×720, 1920×1080, 1024×768 và mobile cảm ứng 390×844, 320×720, 360×800, 375×812, 430×932. Test kiểm tra geometry, opacity, hit testing, nội dung, focus, console/runtime errors và overflow; có ảnh toàn trang từng kích thước. [Kết quả từng bài](qa/browser-results.json).

Sau chỉnh vị trí toast/theme hint Zen (CSS riêng Zen), đã chạy thêm **1/1 pass** cho Zen mobile, light/reduced-motion/menu và assertion toast không che dock: [kết quả](qa/zen-regression.json). Không gộp lượt chạy riêng này thành một lượt CI 21 bài.

Các kịch bản có assertion: bốn panel mở/đóng; 3 vòng đảo animation mỗi panel; đổi nhanh panel; Escape/outside click; resize xuyên breakpoint và xuống chiều cao 480 px; short/long sheet swipe; search không auto-focus; Android desktop-site emulation 980×800; playback/seek/volume/speed; đổi 8 persona không đổi bài hay dừng audio; kiểm tra alpha và vị trí hai artwork; 31 MP3 routes; 5 EQ slider; timer; Zen 320 px; light mode; reduced-motion; unit regression Lyrics Engine hiện có.

Đã phát hiện và sửa regression ngay trong QA: selector đóng popup từng ẩn cả wrapper chứa nút ba chấm; preview candidate có footer bị cắt; auto-scroll dừng ở frame đầu. Không có ảnh ứng viên lỗi nào được đưa vào showcase. Lỗi tua ban đầu trên server Python được truy về thiếu hỗ trợ range; server QA mới trả 206, test phát/tua đã qua.

## 6. Phép đo hiệu năng

Phép đo cuối bằng `scripts/qa/profile-rendering.cjs` được chạy tuần tự, không đồng thời với browser suite: RAF interval, long tasks, CDP Task/Script/Layout/RecalcStyle, trace Paint/Raster/Layout, JS heap và request ảnh. Mỗi quality lấy cửa sổ 5 giây ở 390×844, DPR=1; có chế độ phát nhạc. Baseline dùng HTML/JS/CSS commit cơ sở với cùng asset/server. Renderer được báo là Intel HD Graphics 3000 qua ANGLE D3D11; đây là máy Windows, không phải GPU điện thoại.

| Trạng thái | High: p95 / Task CPU | Balanced: p95 / Task CPU | Eco: p95 / Task CPU |
| --- | --- | --- | --- |
| Baseline idle | 16,8 ms / 1,234 s | 16,8 ms / 1,300 s | 16,8 ms / 0,927 s |
| Bản sửa idle | 16,8 ms / 0,927 s | 16,8 ms / 1,033 s | 16,8 ms / 0,112 s |
| Bản sửa đang phát | 33,5 ms / 1,688 s | 33,5 ms / 1,643 s | 16,8 ms / 0,530 s |

0 long task trong từng cửa sổ đo cuối. Asset requests idle 29→11. JS heap bản sửa idle lần lượt 2.789.794 / 2.618.134 / 2.156.685 byte; không suy ra toàn bộ bộ nhớ ảnh/GPU từ số này. Trace idle High ghi Paint 1540→0 trong mẫu; canvas/WebGL vẫn có thể render qua compositor, **không** suy ra GPU không hoạt động. Khi phát vẫn có Layout 204/193/247 lần trong 5 giây và CPU raster đáng kể ở High/Balanced: không chứng nhận foreground luôn đạt 60 FPS.

[Baseline đầy đủ](qa/performance-baseline.json) · [Idle bản sửa](qa/performance-release.json) · [Đang phát](qa/performance-release-playing.json).

Lượt gesture ghi 172 pointer events: độ trễ giao event median 25,1 ms, p95 58,3 ms; 7 long task bao gồm cả startup và thao tác. Đây không phải INP hay latency cảm ứng vật lý. [21 chuỗi và telemetry](qa/glass-interactions.json) lưu các vị trí thực tế; không tuyên bố zero-lag.

Các phép đo thăm dò trước vòng kiểm thử cuối: baseline p95 High/Balanced/Eco = 42,7/36,7/18,4 ms; bản sửa ở lượt đối chiếu = 36,4/35,4/17,3 ms; request ảnh 29→11. Đây là mẫu lab, chưa phải benchmark thống kê. Một lượt chạy đồng thời với browser test có p95 Balanced 100,2 ms; không dùng lượt này để tuyên bố cải thiện.

RAF interval không phải số dropped frame GPU đo trực tiếp; JS heap không bao gồm toàn bộ decoded image/GPU memory. GPU power, nhiệt độ, pin, INP ngoài thực địa và memory pressure trên điện thoại: **NOT TESTED**. Không cam kết 60/120 FPS hoặc zero-lag.

## 7. Preview và README

Quy trình mới tại [PREVIEW_QA.md](PREVIEW_QA.md). Capture DPR=1, zoom=1, chờ font/image decode, player có bài, không panel mở; kiểm tra vị trí thành phần và card. PNG/manifest chỉ xuất vào thư mục tạm. Validator kiểm tra kích thước, SHA-256, thông tin ảnh và tile lặp; không tự phê duyệt thẩm mỹ.

Đã mở trực tiếp hai PNG cuối và duyệt bốn mép, artwork, navigation, player, footer, vùng trống và nội dung lặp trước khi copy nguyên tệp vào showcase. Desktop **1440×900** có trọn thẻ và footer; mobile **390×1482**, full-page từ viewport cảm ứng **390×844**, giữ toàn bộ trang. Viewport capture xác nhận nút phát và volume nằm ở màn hình đầu. Không crop/ghép/chỉnh ảnh. Ảnh desktop hỏng ở baseline đã bị validator từ chối vì tile lặp theo trục Y.

SHA-256 đã duyệt:

- Desktop: `7d1a54bd023d5e6347eebe74a7f63145db2d76523fafaa3723e43f5059955136`.
- Mobile: `dfdc122ea678a988864b0e5f2f2984f5c2794445443e225f9d5f94e085ab9d5e`.

[Manifest và biên bản duyệt](screenshots/capture.json) giữ nguyên HEAD `50382d7`, `dirty:true` vì chụp working tree trước commit, marker `40.13` và SHA-256 các nguồn chuẩn hóa LF xác định bản đã chụp. Không sửa metadata thành một commit chưa tồn tại lúc capture. README giữ tỉ lệ, mô tả full-page và dùng query version mới tránh cache ảnh cũ; đã bỏ marketing hiệu năng và bảng phiên bản browser chưa kiểm chứng.

Sau commit, đã so toàn bộ SHA nguồn trong manifest với git blob của `021dadf`: tất cả khớp. Chỉ hai PNG đã duyệt được thay thế; ảnh light/Eco/Zen và panel kiểm tra nằm trong thư mục QA tạm, không thêm vào showcase.

## 8. CI, commit và triển khai

Trước sửa: GitHub API trả workflow `417866358` active nhưng **0 run và 0 check-run cho commit cơ sở**. Chỉ có status Vercel success; không coi đó là Actions đã chạy.

Workflow mới cài dependencies QA riêng, chạy syntax/CSS/assets/catalogue, Playwright, capture/validate candidates và lưu artifacts 14 ngày, không ghi showcase. Hosting vẫn static; tắt build/install runtime để dependencies kiểm thử không làm thay đổi cách phục vụ website.

Trước phát hành, connector xác nhận project `pro5-waifu-minkoi`, team `team_PRqdq2OSsTAUVQAd6yWC9mTp`, deployment `dpl_9JYZDdmJ1K5hGq17tzqLH2NHjFNX` gắn `50382d7`. Hai domain đều HTTP 200, cùng HTML/ETag/assets; MP3 range 0–1023 trả 206, 1024 byte và Content-Range đúng. Bản mới có marker 40.13 và phiên bản asset thay đổi tương ứng.

Đã commit và push trực tiếp `main`:

- [e9cb224 — cô lập script chụp cũ, cleanup nhỏ](https://github.com/minhkhoi1516/profilecardwaifu/commit/e9cb224).
- [021dadf8820489072866d2ef5468d57671162e11 — UI/QA/preview release](https://github.com/minhkhoi1516/profilecardwaifu/commit/021dadf8820489072866d2ef5468d57671162e11). GitHub API xác nhận SHA và commit URL tồn tại.

Vercel connector xác nhận deployment **`dpl_GAekvTfpMC7TT9jjWfMLUGxZXGEW`**, target **production**, READY, Git SHA **021dadf**, branch main, hai alias đúng; build khoảng **8,3 giây**. [Bằng chứng deployment](qa/deployment.json).

`verify-release.cjs` đối chiếu byte thực với git blob: HTML và **28 CSS/JS trên mỗi domain** khớp SHA-256 commit. Cả hai root trả HTML marker 40.13, cache `max-age=0,must-revalidate`; MP3 trả 206, 1024 byte, Content-Range `bytes 0-1023/3617674`, cache asset nay đúng `max-age=86400,must-revalidate`. [Kết quả từng URL](qa/live-release.json).

Smoke browser trên production: **5/5 pass** ở domain Vercel (desktop/mobile bốn panel, playback/volume/seek/speed/8 persona, Zen/light/reduced-motion/menu, Android desktop-site); **2/2 pass** ở DuckDNS (mobile bốn panel và playback/volume/seek/speed/persona). Không có runtime/console error trong các assertion này. [Domain chính](qa/live-smoke-primary.json) · [Domain phụ](qa/live-smoke-secondary.json). Không thực hiện quét runtime log/monitoring account; không suy từ static hosting rằng mọi production log đều sạch.

**CI GitHub: chưa xác nhận thực thi.** API sau push vẫn trả **0 workflow run, 0 check-run cho 021dadf**, dù workflow active. Connector không có capability dispatch. Đã thử kiểm tra UI nhưng Windows Computer Use tự dừng vì không xác định URL trình duyệt đủ tin cậy để áp dụng policy; không tiếp tục thao tác, không dispatch và không thay quyền/cài đặt. Chưa xác định được nguyên nhân GitHub không tạo run, nên không gán thành “Actions disabled” hoặc “thiếu quyền” khi chưa có chứng cứ. [Snapshot API/blocker](qa/github-actions.json). Bộ local 20/20 và live smoke **không được trình bày thành Actions xanh**.

Commit tài liệu/bằng chứng tiếp theo không đổi HTML/CSS/JS/PNG; việc xác minh deployment mới nhất sau commit tài liệu được thực hiện thêm, không sửa hồi tố metadata lúc capture.

## 9. Kiểm kê và cleanup

Thêm: package/lockfile chỉ chứa devDependencies, config Playwright, server QA hỗ trợ range, integrity/capture/validator/profiler, browser suites, hướng dẫn preview và báo cáo này.

Sửa: HTML version marker; CSS background/left/responsive/tokens; avatar/features/music/components; README; workflow; gitignore; ba script xuất preview cũ; wrapper smoke production. Danh sách và diff chính xác theo commit phát hành.

Xóa duy nhất `scripts/qa/crop_screenshot.ps1`: tìm toàn bộ tham chiếu không thấy caller, CI/import hoặc tài liệu phụ thuộc; script chỉ crop ảnh người dùng ở đường dẫn `.gemini` cố định không tồn tại và không phục vụ capture thật. Thay bằng pipeline capture nguyên bản. Không xóa nhạc, ảnh, lyrics, license, regression tests hoặc Vercel config.

Giữ ảnh V3.x và báo cáo lịch sử vì còn tham chiếu trong script/tài liệu, không quảng bá chúng làm preview mới. Giữ fallback flyout và các guard hiện có thay vì xóa theo tuổi tệp.

## 10. Giới hạn còn lại

- Thiết bị Android/iPhone thật, bàn phím mềm thực, Safari/Firefox engine, màn hình 120 Hz và touch hardware: **NOT TESTED**. Emulation không thay thế những mục này.
- Tính chính xác lời theo vocal MP3: **INCOMPLETE**, tách khỏi release UI, không thêm nội dung không có quyền sử dụng.
- Font/icon phụ thuộc CDN; ngoại lệ mạng cần báo riêng với lỗi runtime của ứng dụng.
- Không quy kết lag cho Vercel Hobby; header/network được đo tách với rendering trong browser. Không đổi provider hoặc gói trả phí.
- Chỉ kết luận phạm vi UI đã kiểm chứng sau khi điền kết quả cuối. Không tuyên bố mọi yêu cầu V4 đã hoàn tất trên mọi thiết bị.

<!-- FILES_START -->
## Kiểm kê tệp chính xác so với baseline

| Trạng thái | Tệp |
| --- | --- |
| Sửa | `.github/workflows/ci.yml` |
| Sửa | `.gitignore` |
| Sửa | `README.md` |
| Sửa | `css/style-backgrounds.css` |
| Sửa | `css/style-card.css` |
| Sửa | `css/style-left.css` |
| Sửa | `css/style-responsive.css` |
| Sửa | `css/style-right.css` |
| Sửa | `css/tokens-v3.css` |
| Thêm | `docs/MINKOI_V4_FINAL_AUDIT.md` |
| Thêm | `docs/PREVIEW_QA.md` |
| Thêm | `docs/qa/browser-results.json` |
| Thêm | `docs/qa/deployment.json` |
| Thêm | `docs/qa/github-actions.json` |
| Thêm | `docs/qa/glass-interactions.json` |
| Thêm | `docs/qa/live-release.json` |
| Thêm | `docs/qa/live-smoke-primary.json` |
| Thêm | `docs/qa/live-smoke-secondary.json` |
| Thêm | `docs/qa/performance-baseline.json` |
| Thêm | `docs/qa/performance-release-playing.json` |
| Thêm | `docs/qa/performance-release.json` |
| Thêm | `docs/qa/zen-regression.json` |
| Thêm | `docs/screenshots/capture.json` |
| Sửa | `docs/screenshots/desktop-preview.png` |
| Sửa | `docs/screenshots/mobile-preview.png` |
| Sửa | `index.html` |
| Sửa | `js/avatar.js` |
| Sửa | `js/features.js` |
| Sửa | `js/music.js` |
| Sửa | `js/ui/components.js` |
| Thêm | `package.json` |
| Thêm | `playwright.config.cjs` |
| Thêm | `pnpm-lock.yaml` |
| Thêm | `pnpm-workspace.yaml` |
| Thêm | `scripts/qa/capture-previews.cjs` |
| Xóa | `scripts/qa/crop_screenshot.ps1` |
| Thêm | `scripts/qa/integrity.cjs` |
| Thêm | `scripts/qa/profile-rendering.cjs` |
| Thêm | `scripts/qa/server.cjs` |
| Sửa | `scripts/qa/test-liquid-drag.ps1` |
| Thêm | `scripts/qa/validate-previews.cjs` |
| Sửa | `scripts/qa/verify-chibi-popout.ps1` |
| Sửa | `scripts/qa/verify-prod-v4.ps1` |
| Thêm | `scripts/qa/verify-release.cjs` |
| Sửa | `scripts/qa/verify-v3-6.ps1` |
| Thêm | `tests/browser/studio.spec.cjs` |
| Thêm | `tests/browser/touch.spec.cjs` |
| Sửa | `vercel.json` |
<!-- FILES_END -->
