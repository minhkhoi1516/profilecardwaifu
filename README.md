# MINKOI
### Personal Waifu Music Archive · V5

**Where Motion Meets Emotion.**

[![Version](https://img.shields.io/badge/Version-V5-38bdf8?style=flat-square)](https://github.com/minhkhoi1516/profilecardwaifu)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20ESNext-amber?style=flat-square)](#)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://pro5-waifu-minkoi.vercel.app/)

---

## 🌟 Giới thiệu Dự án

**MinKoi** là website cá nhân lưu trữ, quản lý và thưởng thức bộ sưu tập nhạc gắn với các nhân vật waifu yêu thích, kết hợp cùng thẻ hồ sơ cá nhân độc đáo.

Dự án không phải là một nền tảng anime tổng hợp, dịch vụ streaming hay ứng dụng mạng xã hội cồng kềnh, mà là một **không gian nghe nhạc cá nhân ấm áp, tinh tế và chỉn chu**, nơi từng bài hát được gắn kết chặt chẽ với cảm xúc và hình thái của 8 nhân vật waifu tuyển chọn.

Ở phiên bản **MinKoi V5**, các công nghệ giao diện và đồ họa cao cấp đóng vai trò làm nền tảng giúp trải nghiệm thưởng thức âm nhạc waifu trở nên sống động và đẹp đẽ hơn:
- **Bộ sưu tập 8 Waifu & Playlist theo nhân vật**: Trọng tâm cốt lõi với danh mục bản nhạc được phân loại chi tiết theo từng waifu (Alya Kujou, Shiina Mahiru, Waguri Kaoruko, Sakura Miku, Shinobu Uzuki, Konohana Hinako, Asanagi Umi, Nakano Miku).
- **Trình phát nhạc & Profile cá nhân**: Thưởng thức nhạc với đĩa vinyl xoay đồng bộ, hiển thị thẻ hồ sơ creator, bộ lọc âm thanh 5-band EQ, hẹn giờ tắt nhạc và xem lời bài hát đồng bộ.
- **Optical Liquid Glass**: Vật liệu kính nước quang học chân thực với bản đồ pháp tuyến 2D SDF, khúc xạ nền thực và tán sắc đa bước sóng ánh sáng (RGB Prismatic Dispersion).
- **Natural Motion Engine**: Hệ thống động lực học vật lý Miuix Folme springs ($k=280, d=26$) với quán tính quăng lướt, hiệu ứng co giãn (squash & stretch) và tương tác chạm nhạy bén.
- **Waifu Atmosphere & Particles**: Hệ thống hạt tương tác đặc trưng cho từng nhân vật (Bông tuyết Alya, bụi sao vàng Mahiru, hoa anh đào Sakura Miku...).
- **Zen Mode**: Không gian tĩnh lặng toàn màn hình biến trình duyệt thành một khung tranh screensaver cinema sống động cùng giai điệu êm dịu.
- **Responsive & Accessible**: Trải nghiệm đồng nhất và tối ưu từ màn hình máy tính lớn đến điện thoại di động nhỏ gọn.

---

## 🌐 Trải nghiệm Trực tiếp (Live Demo)

- **Production chính thức:** [pro5-waifu-minkoi.vercel.app](https://pro5-waifu-minkoi.vercel.app/)
- **Tên miền dự phòng:** [pro5waifu-minkoi.duckdns.org](https://pro5waifu-minkoi.duckdns.org/)

---

## ✨ Trọng tâm Trải nghiệm & Tính năng Nổi bật

### 1. Waifu Music Archive & Playlists
- **8 Waifu Personas**: Mỗi nhân vật sở hữu trọn bộ avatar, banner nghệ thuật, bảng màu thương hiệu và danh mục bài hát đặc trưng riêng.
- **31+ Bản nhạc Anime tuyển chọn**: Kho nhạc chất lượng cao gắn liền với từng nhân vật, hỗ trợ chuyển đổi playlist tức thì qua thanh điều hướng Liquid Navigation.
- **Đĩa than Vinyl xoay đồng bộ**: Hiệu ứng đĩa hát vinyl quay mượt mà khi phát nhạc, kết hợp cùng chibi waifu 3D pop-out vươn cao khỏi mặt đĩa.
- **Bộ cân bằng âm thanh 5-Band EQ**: Tinh chỉnh các dải tần 60Hz, 230Hz, 910Hz, 3.6kHz và 14kHz.
- **Karaoke & Synced Lyrics Engine**: Hiển thị lời bài hát đồng bộ theo từng dòng/từ (Line-sync), hỗ trợ tinh chỉnh độ lệch thời gian (offset nudge).

### 2. True Optical Liquid Glass
Mô phỏng thấu kính nước lồi tự nhiên để tạo chiều sâu và độ trong trẻo cho giao diện:
- **2D Signed Distance Field (SDF) Normal Map**: Bản đồ pháp tuyến quang học độ phân giải cao (`assets/img/liquid-lens-map.png`), uốn cong ánh sáng ở mép thấu kính (meniscus rim) nhưng giữ nguyên độ phẳng trung tâm (neutral 128, 128, 128) để chữ và icon bên dưới luôn sắc nét 100%.
- **RGB Multi-Wavelength Chromatic Dispersion**: Khúc xạ tách biệt 3 dải màu Đỏ (scale 11), Xanh lục (scale 15) và Xanh lam (scale 19) qua bộ lọc SVG filter tổng hợp, tái hiện viền cầu vồng tinh xảo như thấu kính nước thực.
- **Fresnel Rim & Specular Follower**: Phản xạ viền nước siêu mỏng 0.16px cùng điểm sáng phản quang linh hoạt bám theo tọa độ chạm/rê của người dùng.

### 3. Natural Motion Physics
- **Miuix Folme Springs**: Hệ thống lò xo tương tác ($k=280, d=26$) tuân theo quy luật gia tốc tự nhiên của hệ điều hành di động cao cấp.
- **Sức căng bề mặt & Squash/Stretch**: Thanh trỏ tự động dãn nở thực tế đến +35px khi kéo rê qua các tab, bảo toàn thể tích ($S_y = 1 / \sqrt{S_x}$) và tiếp đất chuẩn xác 0px tuyệt đối.
- **Zero-Latency Microtask Commit**: Đồng bộ cập nhật DOM ngay trong vi tác vụ (microtask queue) trước chu kỳ vẽ khung hình (paint), triệt tiêu hoàn toàn độ trễ thao tác.

### 4. Waifu Atmosphere & Particles
Mỗi nhân vật waifu sở hữu một bầu không khí cảm xúc và không gian hạt tương tác riêng:
- **Alya Kujou**: Tuyết rơi mùa đông nhẹ nhàng với độ sâu trường ảnh đa tầng.
- **Shiina Mahiru**: Bụi sao vàng lấp lánh ấm áp trôi nhẹ trong không gian.
- **Sakura Miku**: Cánh hoa anh đào mùa xuân bay theo làn gió.
- **Shinobu Uzuki, Waguri Kaoruko, Asanagi Umi, Nakano Miku, Konohana Hinako**: Không gian ánh sáng và cảm xúc đồng điệu cùng nhân vật.

### 5. Zen Screensaver Mode
Nhấn phím **Z** hoặc biểu tượng Zen để kích hoạt chế độ thư giãn:
- Giao diện tối giản toàn màn hình, đưa tâm điểm về artwork waifu và visualizer.
- Thanh điều khiển nổi siêu gọn (Zen Mini Dock) hiển thị thông tin bài hát và tiến trình phát nhạc.
- Lời bài hát bay bổng (Ambient Floating Lyrics) mang lại cảm giác tĩnh tại.

---

## 🏛️ Kiến trúc Mã nguồn (Clean Architecture)

Dự án được xây dựng theo kiến trúc vanilla hiện đại, không sử dụng framework cồng kềnh, tối ưu trực tiếp cho rendering pipeline của trình duyệt:

```
profilecardwaifu/
├── index.html                   # Semantic HTML5, SVG Optical Filters, Preloads
├── css/
│   ├── style-base.css           # Reset, CSS variables, typography nền tảng
│   ├── style-backgrounds.css    # Banner crossfade, dynamic lighting
│   ├── style-card.css           # Cấu trúc thẻ hồ sơ chính
│   ├── style-left.css           # Cột avatar, thông tin creator, chibi pop-out
│   ├── style-right.css          # Cột Waifu Audio Player, danh sách nhạc, EQ
│   ├── style-responsive.css     # Media queries, mobile bottom sheets
│   └── tokens-v3.css            # Optical Liquid Glass, Miuix tokens, Zen Mode
├── js/
│   ├── config.js                # Danh mục 8 personas, 31+ tracks, dữ liệu cấu hình
│   ├── stars.js                 # Engine hạt nền canvas tối ưu hóa DPR
│   ├── fluid-bg.js              # WebGL fluid audio-reactive background shader
│   ├── avatar.js                # Quản lý persona, avatar crop, chibi trigger
│   ├── music.js                 # Audio playback, Web Audio EQ, tab navigation
│   ├── features.js              # Zen mode, theme switcher, hotkeys, haptics
│   ├── ui/
│   │   ├── spring.js            # Lõi vật lý lò xo Miuix (damping, velocity, settling)
│   │   ├── squircle.js          # Bo góc siêu elip mượt mà theo chuẩn iOS
│   │   └── components.js        # Tab sliding pill, popup lifecycle, microtask commit
│   └── lyrics/                  # Động cơ phân tích và đồng bộ lời bài hát (V2 Modular)
└── assets/                      # Hình ảnh nhân vật, banner, icon, normal map
```

---

## ⌨️ Phím tắt Điều khiển (Keyboard Shortcuts)

| Phím | Hành động |
| :---: | :--- |
| `Space` | Phát / Tạm dừng bản nhạc |
| `J` / `K` | Chuyển bài trước / Bài kế tiếp |
| `←` / `→` | Tua nhanh lùi / tiến 5 giây |
| `M` | Bật / Tắt tiếng (Mute) |
| `S` | Bật / Tắt chế độ xáo trộn (Shuffle) |
| `R` | Chuyển chế độ lặp lại (Repeat All / One / Off) |
| `Z` / `Esc` | Bật / Thoát chế độ Zen Screensaver |
| `1` – `8` | Chuyển nhanh giữa 8 Waifu Personas |

*(Lưu ý: Khi đang nhập liệu trong ô tìm kiếm hoặc lyrics editor, các phím tắt phát nhạc sẽ tạm thời được vô hiệu hóa để tránh gõ nhầm).*

---

## 🚀 Hướng dẫn Cài đặt & Chạy Cục bộ

MinKoi hoàn toàn là ứng dụng web tĩnh phía client, không cần build step phức tạp:

1. **Clone repository:**
   ```bash
   git clone https://github.com/minhkhoi1516/profilecardwaifu.git
   cd profilecardwaifu
   ```

2. **Chạy máy chủ tĩnh cục bộ (qua bất kỳ công cụ nào):**
   ```bash
   # Sử dụng Node.js npx
   npx serve .

   # Hoặc Python
   python -m http.server 8080
   ```

3. Mở trình duyệt tại địa chỉ `http://localhost:8080`.

---

## 📜 Bản quyền & Lời cảm ơn (License & Credits)

- **Mã nguồn (Source Code):** Phát hành theo giấy phép [MIT License](LICENSE).
- **Âm nhạc & Hình ảnh Anime (Media Assets):** Bản quyền hình ảnh, âm nhạc và nhân vật thuộc về các tác giả, họa sĩ và nhà sản xuất gốc của các tác phẩm anime tương ứng. MinKoi là dự án phi thương mại phục vụ mục đích học tập giao diện và lưu trữ, thưởng thức âm nhạc waifu cá nhân.
- **Nguồn cảm hứng thiết kế (Inspirations):**
  - Hệ thống chuyển động **Miuix / Folme Engine** (Xiaomi HyperOS).
  - Triết lý giao diện **Liquid Glass & Spatial Materials** (Apple iOS / visionOS).
  - Ngôn ngữ thiết kế **Material You / Expressive** (Google).

---

<div align="center">

### MINKOI

**Where Motion Meets Emotion.**

**© 2026 MINKOI — Crafted with Motion, Light & Soul.**

*Personal Waifu Music Archive · V5*

</div>

---
