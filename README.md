# MINKOI — Personal Waifu Music Archive

**V4 Refined · IN DEVELOPMENT**

*Where Motion Meets Emotion.*

MinKoi là thẻ hồ sơ và bộ sưu tập nhạc waifu cá nhân, không phải nền tảng streaming thương mại. Thư viện hiện có 8 nhân vật và 31 bản nhạc, cùng artwork, avatar, banner và chibi riêng.

[Website production](https://pro5-waifu-minkoi.vercel.app/) · [MIT cho mã nguồn](LICENSE)

## Trải nghiệm

- Personal Waifu Collection và Anime Music Archive theo nhân vật.
- Music Player: playlist, favorites, shuffle/repeat, seek, volume, playback speed, EQ và sleep timer.
- Lyrics Engine hiện có, gồm đồng bộ dòng/từ khi dữ liệu bài hát hỗ trợ. Không phải mọi bản nhạc đều có lyrics đã hoàn thiện.
- Zen Mode: artwork, character atmosphere, particles và lyrics cùng mini dock.
- Hướng tái thiết kế: Soft Frosted UI, Light Mode ivory và Natural Miuix-Inspired Motion. Chuyển động giọt nước chỉ dành cho thanh danh mục Studio.
- Âm thanh tương tác tùy chọn, mặc định tắt; rung tùy trình duyệt và thiết bị hỗ trợ. Cài đặt được lưu cục bộ và không đổi âm lượng nhạc.

## Tình trạng V4 Refined

Đang phục hồi từng module từ lịch sử V4, giữ dữ liệu mới và thay implementation Optical Glass V5. Chưa nghiệm thu đầy đủ motion, gesture mobile, hiệu năng hoặc production. Không coi sự hiện diện của mã nguồn là bằng chứng tính năng đã đạt chất lượng phát hành.

Spring core dùng nghiệm giải tích theo delta time, giữ vận tốc khi đổi đích và gom render của spring group. Renderers tôn trọng visibility và Reduced Motion; không còn bộ chọn Auto/High/Mid/Eco.

**Chưa cam kết 60 FPS trên mọi thiết bị.** Kiểm thử trên thiết bị Android thật, đánh giá frame time nhiều lượt và xác nhận Vercel vẫn là điều kiện trước phát hành. Website production có thể chưa chạy mã đang phát triển trong repository local.

## Chạy local

Website dùng HTML/CSS/JavaScript thuần, không cần build runtime. Phục vụ thư mục bằng HTTP static server. Để kiểm thử seek nhạc chính xác, server phải hỗ trợ HTTP byte-range (`206 Partial Content`); mở `file://` không đại diện cho production.

Vercel dùng preset **Other**, không install/build command, output `.`; `vercel.json` và `.vercelignore` định nghĩa cấu hình cùng danh sách tài nguyên được deploy. Công cụ kiểm thử, ảnh chụp và báo cáo tạm được giữ ngoài source phát hành.

## Mã nguồn

- `index.html`: cấu trúc trang và tài nguyên runtime.
- `css/`: component layouts, responsive và vật liệu chung trong `materials.css`.
- `js/config.js`: personas và mapping 31 bài hát.
- `js/ui/`: spring core, popup/sheet, gesture và tactile feedback.
- `js/music.js`: player và Web Audio EQ.
- `js/lyrics/`: dữ liệu và engine lyrics hiện có.
- `js/stars.js`, `js/fluid-bg.js`: particles và nền WebGL.
- `assets/`, `music/`: tài nguyên của bộ sưu tập.

## Tham khảo & giấy phép

[Miuix](https://github.com/compose-miuix-ui/miuix) và [tài liệu Blur](https://compose-miuix-ui.github.io/miuix/guide/blur) là nguồn tham khảo motion/material; [Glasmio](https://github.com/NEORUAA/Glasmio) chỉ là tham khảo tương tác. Miuix được phát hành theo Apache-2.0; tham khảo nguyên lý không đồng nghĩa với việc nhập toàn bộ implementation Compose vào website.

Giấy phép MIT trong `LICENSE` áp dụng cho mã nguồn phù hợp của dự án, **không cấp phép MIT cho âm nhạc, artwork, nhân vật hoặc tài nguyên bên thứ ba**. Quyền đối với những tài nguyên đó thuộc chủ sở hữu tương ứng.

© 2026 MINKOI — Crafted with Motion, Light & Soul.
