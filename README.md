# MINKOI
### Anime Music Studio · V5 Rebuild

**Where Motion Meets Emotion.**

[![Version](https://img.shields.io/badge/Version-V5%20Rebuild-38bdf8?style=flat-square)](https://github.com/minhkhoi1516/profilecardwaifu)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20ESNext-amber?style=flat-square)](#)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://pro5-waifu-minkoi.vercel.app/)

---

## 🌟 Giới thiệu Dự án

**MinKoi** là một website Anime Music Studio cá nhân độc lập, kết hợp giữa nghệ thuật giao diện anime và những kỹ thuật đồ họa tương tác hiện đại.

Phiên bản **V5 Rebuild** tái cấu trúc toàn diện hệ thống rendering và motion engine:
- **Optical Liquid Glass**: Vật liệu kính nước quang học chân thực với bản đồ pháp tuyến 2D SDF, khúc xạ nền thực và tán sắc đa bước sóng ánh sáng (RGB Prismatic Dispersion).
- **Natural Motion Engine**: Hệ thống động lực học vật lý Miuix Folme springs với quán tính quăng lướt, hiệu ứng co giãn (squash & stretch) và commit microtask zero-latency.
- **Waifu Atmosphere**: Hệ thống hạt tương tác đặc trưng cho từng nhân vật (Bông tuyết Alya, bụi sao Mahiru, hoa anh đào Sakura Miku...).
- **Studio Audio Suite**: Trình phát 31 bản nhạc Anime chất lượng cao, đồ họa vinyl xoay đồng bộ, bộ chỉnh âm EQ 5-band chuyên nghiệp và hiển thị lời bài hát thời gian thực.
- **Zen Mode**: Không gian tĩnh lặng toàn màn hình biến trình duyệt thành một khung tranh screensaver sống động với âm nhạc êm dịu.
- **Responsive & Accessible**: Trải nghiệm mượt mà từ màn hình Ultra-wide đến điện thoại cảm ứng nhỏ gọn.

---

## 🌐 Trải nghiệm Trực tiếp (Live Demo)

- **Production chính thức:** [pro5-waifu-minkoi.vercel.app](https://pro5-waifu-minkoi.vercel.app/)
- **Tên miền dự phòng:** [pro5waifu-minkoi.duckdns.org](https://pro5waifu-minkoi.duckdns.org/)

---

## ✨ Tính năng Nổi bật (Core Features)

### 1. True Optical Liquid Glass
Khác với các hiệu ứng kính mờ (glassmorphism) truyền thống chỉ sử dụng `backdrop-filter: blur()`, MinKoi V5 Rebuild mô phỏng một thấu kính nước lồi tự nhiên:
- **2D Signed Distance Field (SDF) Normal Map**: Bản đồ pháp tuyến quang học độ phân giải cao (`assets/img/liquid-lens-map.png`), uốn cong ánh sáng ở mép thấu kính (meniscus rim) nhưng giữ nguyên độ phẳng trung tâm (neutral 128, 128, 128) để văn bản và biểu tượng bên dưới luôn sắc nét 100%.
- **RGB Multi-Wavelength Chromatic Dispersion**: Khúc xạ tách biệt 3 dải màu Đỏ (scale 11), Xanh lục (scale 15) và Xanh lam (scale 19) qua bộ lọc SVG filter tổng hợp, tái hiện viền cầu vồng tinh xảo như thấu kính thủy tinh thực.
- **Fresnel Rim & Caustics**: Phản xạ viền nước siêu mỏng 0.16px cùng dải tụ quang sáng bóng lướt theo hướng vuốt chạm của người dùng.

### 2. Natural Motion Physics
- **Miuix Folme Springs**: Hệ thống lò xo tương tác ($k=280, d=26$) tuân theo quy luật gia tốc tự nhiên của hệ điều hành di động cao cấp.
- **Squash & Stretch**: Thanh trỏ tự động kéo dài lên đến 22% theo vận tốc vuốt/chuyển tab, rồi đàn hồi êm dịu trở về kích thước ban đầu.
- **Zero-Latency Microtask Commit**: Đồng bộ cập nhật DOM ngay trong vi tác vụ (microtask queue) trước chu kỳ vẽ khung hình (paint), triệt tiêu hoàn toàn độ trễ thao tác.

### 3. Waifu Atmosphere & Particles
Mỗi nhân vật waifu sở hữu một bảng màu, banner, avatar và không gian hạt tương tác riêng:
- **Alya Kujou**: Tuyết rơi mùa đông nhẹ nhàng với độ sâu trường ảnh đa tầng.
- **Shiina Mahiru**: Bụi sao vàng lấp lánh ấm áp trôi nhẹ trong không gian.
- **Sakura Miku**: Cánh hoa anh đào mùa xuân bay theo làn gió.
- **Shinobu Uzuki, Waguri Kaoruko, Asanagi Umi, Nakano Miku, Konohana Hinako**: Không khí cảm xúc đồng điệu cùng bài hát chủ đạo.

### 4. Studio Audio Suite & Lyrics
- **31 Audio Tracks**: Danh mục bài hát phong phú tuyển chọn từ các tác phẩm anime kinh điển.
- **5-Band Equalizer**: Tinh chỉnh các dải tần 60Hz, 230Hz, 910Hz, 3.6kHz và 14kHz theo sở thích cá nhân.
- **Karaoke & Synced Lyrics Engine**: Hiển thị lời bài hát đồng bộ theo từng dòng/từ (Line-sync), hỗ trợ điều chỉnh độ lệch (offset nudge) và trình chỉnh sửa (Lyrics Editor).

### 5. Zen Screensaver Mode
Nhấn phím **Z** hoặc biểu tượng Zen để kích hoạt chế độ thư giãn:
- Giao diện tối giản toàn màn hình, đưa tâm điểm về artwork và visualizer.
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
│   ├── style-left.css           # Cột avatar, thông tin waifu, chibi pop-out
│   ├── style-right.css          # Cột Studio Audio Suite, danh sách nhạc, EQ
│   ├── style-responsive.css     # Media queries, mobile bottom sheets
│   └── tokens-v3.css            # Optical Liquid Glass, Miuix tokens, Zen Mode
├── js/
│   ├── config.js                # Danh mục 8 personas, 31 tracks, dữ liệu cấu hình
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

MinKoi hoàn toàn là ứng dụng web tĩnh phía client, không cần build step phức tạp để chạy:

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
- **Âm nhạc & Hình ảnh Anime (Media Assets):** Bản quyền hình ảnh, âm nhạc và nhân vật thuộc về các tác giả, họa sĩ và nhà sản xuất gốc của các tác phẩm anime tương ứng. MinKoi là dự án phi thương mại phục vụ mục đích nghiên cứu, học tập giao diện và trải nghiệm nghe nhạc cá nhân.
- **Nguồn cảm hứng thiết kế (Inspirations):**
  - Hệ thống chuyển động **Miuix / Folme Engine** (Xiaomi HyperOS).
  - Triết lý giao diện **Liquid Glass & Spatial Materials** (Apple iOS / visionOS).
  - Ngôn ngữ thiết kế **Material You / Expressive** (Google).

---

<div align="center">

### MINKOI

**Where Motion Meets Emotion.**

**© 2026 MINKOI — Crafted with Motion, Light & Soul.**

*An independent Anime Music Studio experience.*

</div>

---
