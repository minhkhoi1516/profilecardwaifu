# MinKoi — Anime Music Studio

Website nghe nhạc anime và thẻ hồ sơ cá nhân, viết bằng HTML, CSS và JavaScript thuần. Nhạc, artwork, bộ chọn persona và dữ liệu người dùng được giữ tại phía trình duyệt.

[Production](https://pro5-waifu-minkoi.vercel.app/) · [Tên miền phụ](https://pro5waifu-minkoi.duckdns.org/) · [MIT](LICENSE)

## Preview

Ảnh chụp thật từ Chromium. Desktop: viewport 1440×900. Mobile: viewport cảm ứng 390×844, chụp toàn trang để giữ đầy đủ player và danh sách persona. Ảnh giữ nguyên tỉ lệ khi GitHub thu nhỏ theo chiều rộng.

<p align="center">
  <img src="docs/screenshots/desktop-preview.png?v=40.13" alt="MinKoi desktop: hồ sơ nhân vật, Studio Audio Suite, player và bộ chọn persona" width="900">
</p>
<p align="center">
  <img src="docs/screenshots/mobile-preview.png?v=40.13" alt="MinKoi mobile toàn trang: hồ sơ gọn, navigation, nút phát và âm lượng, tám persona" width="320">
</p>

[Quy trình chụp và duyệt ảnh](docs/PREVIEW_QA.md) · [Audit V4 và giới hạn kiểm thử](docs/MINKOI_V4_FINAL_AUDIT.md)

## Chức năng

- 8 persona: Alya Kujou, Shiina Mahiru, Waguri Kaoruko, Sakura Miku, Shinobu Uzuki, Konohana Hinako, Asanagi Umi và Nakano Miku.
- 31 MP3; phát/dừng, tua, âm lượng, tốc độ, shuffle, repeat, yêu thích và lọc danh sách. Đổi persona không ngắt bài đang phát.
- Liquid Glass navigation: kéo liên tục, đổi hướng, cuộn ở mép và spring khi thả. High/Balanced/Eco giữ thao tác; reduced-motion của hệ điều hành được ưu tiên.
- Playlist & tìm kiếm, EQ 5 band, lời bài hát và hẹn giờ; panel desktop có giới hạn viewport, mobile dùng bottom sheet. Tìm kiếm trên thiết bị cảm ứng chỉ mở bàn phím khi người dùng chọn ô nhập.
- Background theo persona, giao diện sáng/tối, visualizer Web Audio và Zen với dock phát nhạc, thông tin bài và lời hiện có.
- High/Balanced/Eco giảm dần độ phức tạp hiệu ứng; không cam kết FPS trên thiết bị chưa đo.
- Dữ liệu yêu thích, cài đặt và chỉnh lời thủ công lưu cục bộ; không có backend tài khoản.

## Lyrics: trạng thái thực tế

15 bài có dữ liệu lời theo dòng, 7 bản instrumental, 9 bài vocal chưa có lời xác minh. Timestamp hiện có chưa được xác nhận toàn bộ bằng nghe MP3. Test Lyrics Engine kiểm tra parser, metadata và hành vi đồng bộ, không chứng minh lời khớp giọng hát.

Không tự tạo lời/timestamp. Editor hỗ trợ nhập LRC/ELRC/TTML từ nguồn người dùng có quyền sử dụng và căn chỉnh thủ công. Các tham chiếu Spotify đã sửa cho *Manazashi wa Hikari* và *Rintaro to Kaoruko* được giữ nguyên. Xem [audit lyrics](docs/LYRICS_V4_AUDIT.md).

## Chạy và kiểm thử

Không cần cài package để sử dụng website. Phục vụ thư mục qua HTTP; server QA hỗ trợ byte ranges cho MP3:

```sh
node scripts/qa/server.cjs
```

Mở `http://127.0.0.1:8080`. Chỉ khi phát triển/QA mới cần Node.js 24 và pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test
```

- `pnpm qa:integrity`: cú pháp JS/CSS/JSON, asset được cấu hình, 31 track, metadata lyrics và các regression guard hiện có.
- `pnpm test:ui`: browser thực, 9 viewport, nội dung panel nhìn thấy được, mở/đóng lặp, resize, focus, cảm ứng kéo kính, chất lượng, phát nhạc và Zen. Video/trace/ảnh nằm trong `test-results/`.
- `node scripts/qa/capture-previews.cjs` rồi `pnpm qa:previews`: tạo và kiểm tra **ảnh ứng viên**, không ghi đè showcase. Phải mở và duyệt PNG trước khi thay ảnh README.
- `node scripts/qa/profile-rendering.cjs`: phép đo lab 5 giây mỗi quality mode. `--baseline` dùng JS/CSS/HTML của commit `50382d7` với cùng asset/server; kết quả tại `scratch/performance/`.
- Đặt `QA_CHANNEL=msedge` trên Windows để dùng Edge đã cài. Đặt `BASE_URL` để chạy trên deployment. Các script PowerShell V3.x giữ lại phục vụ lịch sử; chúng không phải cổng duyệt phát hành.

CI chạy integrity và Playwright rồi lưu artifacts. Trạng thái thực thi cụ thể được ghi trong audit; có file workflow không đồng nghĩa Actions đã chạy. Kiểm thử mô phỏng cảm ứng không thay thế Android/iPhone vật lý.

## Cấu trúc chính

| Khu vực | Trách nhiệm |
| --- | --- |
| `index.html`, `css/` | Semantic UI, token, bố cục, vật liệu và responsive |
| `js/config.js` | 8 persona, danh mục nhạc, metadata |
| `js/ui/spring.js`, `js/ui/components.js` | Spring, gesture và vòng đời overlay |
| `js/music.js`, `js/avatar.js`, `js/features.js` | Audio, EQ, persona, theme, quality và Zen |
| `js/lyrics/` | Parser, cache, provider, renderer, clock và editor |
| `assets/`, `music/` | Artwork gốc và 31 MP3 |
| `tests/`, `scripts/qa/` | Unit/regression, browser và quy trình preview |
| `vercel.json` | Static hosting, cache và security headers |

Cấu hình persona/track trong `js/config.js`; giữ đường dẫn MP3 và artwork hợp lệ. Các phiên bản CSS/JS trong HTML phải được cập nhật khi phát hành thay đổi. Không cần framework hay package runtime.

## Phím tắt

`Space`: phát/dừng · `J/K`: bài trước/sau · `M`: mute · `S`: shuffle · `R`: repeat · `←/→`: tua 5 giây · `Z/Esc`: vào/thoát Zen · `1–8`: đổi persona. Ô nhập văn bản không nhận các phím tắt nghe nhạc.

## Tham chiếu và bản quyền

Interaction tham khảo [Compose Miuix](https://github.com/compose-miuix-ui/miuix) và [Glasmio](https://github.com/NEORUAA/Glasmio); MinKoi là triển khai web độc lập, không đóng gói Kotlin/Compose. Google Fonts và Font Awesome được tải từ CDN nên cần kết nối mạng; browser có thể dùng font dự phòng khi CDN không tải được.

Mã nguồn theo [MIT License](LICENSE). Artwork, nhân vật và nhạc thuộc chủ sở hữu tương ứng; dự án fan cá nhân không cấp quyền tái sử dụng các tài sản này. Vui lòng kiểm tra quyền sử dụng trước khi phân phối lại.
