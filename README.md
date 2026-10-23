# 🌌 MinKoi · Waifu & Music Studio

Trang định danh cá nhân + thư viện nhạc theo từng waifu. Vanilla HTML/CSS/JS, không build step.
Deploy tĩnh trên Vercel.

---

## ✨ Tính năng hiện có

- **7 persona** (Alya Kujou, Shiina Mahiru, Waguri Kaoruko, Sakura Miku, Shinobu Uzuki,
  Konohana Hinako, Asanagi Umi) + **1 slot trống "Coming Soon"**.
- Mỗi persona: 1 avatar, 2 banner PC, 2 banner phone. Mỗi lần chuyển waifu sẽ **random** giữa
  2 banner cùng loại (không lặp lại ảnh vừa dùng), tự đổi theo bề rộng màn hình.
- **Playlist theo waifu**: tab `All (23)` + tab riêng từng waifu. Đổi waifu **không cắt bài đang
  phát** — chỉ chuyển danh sách đang xem sang waifu đó; bấm vào tag dưới tên bài cũng mở được
  danh sách của waifu đang hát.
- **23 track**, thời lượng lấy thật từ file MP3 (đã tính sẵn trong `js/config.js`).
- **Zen mode (màn hình chờ)**: phím `Z` / `Esc` trên PC, nút nổi góc phải dưới trên mobile/tablet.
  Có Screen Wake Lock (giữ màn hình sáng) và mini dock tự mờ sau 5s.
- Equalizer Web Audio, seek bar, shuffle, repeat, tìm kiếm bài, MediaSession (điều khiển từ
  màn hình khoá).
- Light / Dark mode, lưu trạng thái vào localStorage.

### Phím tắt
| Phím | Chức năng |
|---|---|
| `Space` | Phát / dừng |
| `J` / `K` | Bài trước / bài kế |
| `M` | Tắt / mở tiếng |
| `S` | Shuffle |
| `R` | Đổi chế độ lặp |
| `Z` / `Esc` | Vào / thoát Zen mode |
| `1` – `7` | Đổi nhanh waifu |

---

## 🛠️ Cấu trúc

```
profilecardwaifu/
├── assets/                  # avatar_<key>.png + banner_<key>_pc.jpg / _pc2 / _phone / _phone2
├── css/
│   ├── style-base.css       # design tokens, reset, typography
│   ├── style-backgrounds.css# banner layers & canvas nền
│   ├── style-card.css       # khung card, zen mode, toast
│   ├── style-left.css       # cột trái: avatar, tên, bio, persona chips
│   ├── style-right.css      # player, tab playlist, equalizer
│   └── style-responsive.css # breakpoint mobile / tablet
├── js/
│   ├── config.js            # TOÀN BỘ dữ liệu: personas + playlist (sửa ở đây)
│   ├── stars.js             # hạt bụi sao trên canvas
│   ├── avatar.js            # đổi persona, random banner, fallback ảnh lỗi
│   ├── music.js             # player, tab playlist theo waifu, EQ, tìm kiếm
│   └── features.js          # theme, clock, zen mode, phím tắt, share
├── music/                   # file .mp3
├── tools/                   # script hỗ trợ (không chạy trên web)
│   ├── optimize_assets.py   # resize + nén ảnh, tự đổi đuôi cho khớp định dạng
│   ├── mp3_duration.py      # tính thời lượng MP3 (ghi ra tools/durations.json)
│   └── durations.json
├── index.html
├── manifest.webmanifest
└── vercel.json
```

---

## ➕ Cách thêm một waifu mới (3 bước)

1. Copy ảnh vào `assets/` theo đúng quy ước:

   | Loại | Tên file |
   |---|---|
   | Avatar | `avatar_<key>.png` (vuông, ≤ 900px, nền trong suốt nếu được) |
   | Banner PC | `banner_<key>_pc.jpg`, `banner_<key>_pc2.jpg` (ngang 16:9, ≤ 1920px) |
   | Banner phone | `banner_<key>_phone.jpg`, `banner_<key>_phone2.jpg` (dọc, ≤ 1200px) |

2. Chạy `python tools/optimize_assets.py` để resize + nén (script tự đổi `.png` → `.jpg`
   nếu file thực chất là JPEG).

3. Mở `js/config.js`, thêm 1 object vào `personas` **trước object `coming`**:

```js
{
    id: 7, key: "tenwaifu", name: "Tên Waifu", role: "Danh hiệu", title: "Tên tác phẩm",
    avatar: "assets/avatar_tenwaifu.png",
    banners: {
        pc: ["assets/banner_tenwaifu_pc.jpg", "assets/banner_tenwaifu_pc2.jpg"],
        phone: ["assets/banner_tenwaifu_phone.jpg", "assets/banner_tenwaifu_phone2.jpg"]
    },
    accent: "#38bdf8", accentSecondary: "#f43f5e", accentGlow: "rgba(56, 189, 248, 0.28)",
    available: true
}
```

Slot `coming` (index cuối) luôn là chip mờ "Coming Soon" — cứ thêm waifu mới ngay trước nó.

## 🎵 Cách thêm nhạc

1. Copy file `.mp3` vào `music/`.
2. Thêm 1 dòng vào `CONFIG.music.playlist` (nhớ `persona` đúng `key`):

```js
{ id: 24, persona: "alya", name: "Tên bài", artist: "Alya Kujou", file: "music/ten-bai.mp3", duration: "3:45" }
```

3. (Tuỳ chọn) chạy `python tools/mp3_duration.py` để lấy thời lượng chính xác, rồi copy vào
   `duration`. Số bài trên tab `All` tự cập nhật.

> Tên file có dấu tiếng Nhật vẫn chạy bình thường, nhưng nên dùng tên không dấu để tránh lỗi
> khi deploy qua các hệ thống cũ.

---

## 📐 Quy ước asset

- **Đuôi file phải khớp định dạng thật**: JPEG → `.jpg`, PNG → `.png`. Trước đây nhiều file
  `.png` thực chất là JPEG/WebP, làm hỏng preview ảnh và `og:image` khi share link.
- Banner PC ≤ 1920px, banner phone ≤ 1200px, avatar ≤ 900px; mỗi file nên < 1 MB.
- Tổng dung lượng `assets/` hiện tại khoảng **7 MB** (trước khi nén là 69 MB).

---

## 🚀 Deploy

- Nếu deploy qua GitHub → Vercel: **phải commit cả thư mục `assets/` và `music/`**, nếu không
  Vercel sẽ 404 và avatar/banner bị vỡ.
- Không commit `profilecardwaifu.zip` (đã có trong `.gitignore`).
- Kiểm tra nhanh trước khi deploy: mở DevTools → Network, lọc `404`, phải bằng 0.

---

© 2026 MinKoi Studio · All rights reserved.
