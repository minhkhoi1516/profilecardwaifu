<div align="center">

# MINKOI

**Personal Waifu Music Archive**

*Where Motion Meets Emotion.*

**V5.5 · LIVING SOUNDSTAGE (FINAL FEATURE MILESTONE)**

[![MinKoi V5.5](https://img.shields.io/badge/MINKOI-V5.5_Living_Soundstage-78b9d2?style=flat-square)](https://github.com/minhkhoi1516/profilecardwaifu)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-181818?style=flat-square&logo=vercel)](https://pro5-waifu-minkoi.vercel.app/)
[![Source License MIT](https://img.shields.io/badge/Source_License-MIT-c5b58c?style=flat-square)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020+-e6ce76?style=flat-square&logo=javascript&logoColor=181818)](js/)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-e39c83?style=flat-square&logo=html5&logoColor=white)](index.html)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-8cadd7?style=flat-square)](css/)
[![Responsive Web](https://img.shields.io/badge/Responsive-Web-b4c5a1?style=flat-square)](#trải-nghiệm)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-777d8e?style=flat-square&logo=github)](https://github.com/minhkhoi1516/profilecardwaifu)

Một bộ sưu tập nhân vật waifu, nhạc anime, chuyển động tự nhiên và không gian nghe nhạc riêng.

**[Mở MINKOI ↗](https://pro5-waifu-minkoi.vercel.app/)** · [Khám phá source](#kiến-trúc) · [Security Policy](SECURITY.md)

</div>

---

## Trải nghiệm

| Không gian | Điều làm nên MinKoi |
| :--- | :--- |
| **Waifu Collection** | 8 persona, avatar và banner chuyển cảnh hai lớp với Smart Artwork Pipeline (chuyển đổi tức thì), chibi, màu sắc và particles riêng. |
| **Music Studio** | 34 bản nhạc; playlist, favorites, bộ lọc nhân vật, tìm kiếm, shuffle/repeat, Liquid Seek kèm Lyric Peek, Glass Volume, playback speed, EQ 5-band (6 preset) và sleep timer. |
| **日本語 × Romaji × Tiếng Việt** | Một câu, ba tầng nội dung; mặc định bật cả ba, sáu lựa chọn hiển thị lưu trên trình duyệt và dùng chung cho Drawer/Zen. |
| **Lyric Flow** | Phân cấp thị giác 4 tầng (`active` / `±1` / `±2` / xa) ở Floating, Karaoke và Toàn bài; chạm câu để tua, recenter, offset từng bản audio, Tap to Sync và Editor. Word/syllable sweep **chỉ** dùng khi nguồn có timestamp tương ứng. |
| **Living Soundstage & Zen** | Chuyển tiếp không gian Player ↔ Zen bằng một `MinkoiSpring` đồng bộ (giữ nguyên artwork hiện tại, ngắt/đổi chiều tức thì), thẻ lời trên artwork, Mini Dock kính mờ và ánh sáng viền cục bộ đáp ứng theo năng lượng âm thanh tần số thấp (tự tắt ở chế độ `balanced` hoặc Reduced Motion). |
| **Live Soundstage Visualizers** | Aurora Crown, Spectral Halo, Manga Soundwave và Kinetic Orbit đọc dữ liệu audio thật qua Web Audio Analyser. |
| **Natural Motion** | Spring ngắt/đổi đích được, press illumination cục bộ, chuyển bài liên tục bằng WAAPI; thanh danh mục Liquid Capsule kéo trực tiếp hoặc vuốt danh sách với quán tính. |
| **Two Materials & Adaptive Perf** | Frosted mặc định và Liquid tùy chọn trong menu ba chấm; `js/perf-engine.js` tự điều chỉnh tỷ lệ canvas nội bộ khi GPU tải cao mà không tắt tính năng thị giác. |

Âm thanh tương tác và rung là tùy chọn, mặc định tắt; khả năng rung tùy thiết bị/trình duyệt. Dark/Light Mode và Reduced Motion được hỗ trợ.

### Lời nhạc: trung thực với nguồn

Hai nguồn do người dùng cung cấp — `lyric.txt` (Nhật + timestamp) và `lyric_vi.txt` (Việt + timestamp) — được tách thành 28 mục dữ liệu theo track. **Timestamp được giữ làm mốc nguồn** (`sourceStartMs` / `sourceEndMs`); hiệu chỉnh về sau nằm ở trường riêng (`correctedStartMs` / `correctedEndMs`) nên có thể so sánh và hoàn tác mà không ghi đè mốc gốc.

Bản Việt được ghép **chỉ khi timestamp trùng khớp tuyệt đối** với dòng Nhật; không nội suy, không chia đều theo số ký tự. 383 dòng từng trống hoặc còn ghi chú `[cần đối chiếu]` đã được điền từ nguồn này. Trong 1.138 dòng đã áp dụng (track 14 là transcript instrumental, không áp dụng), **không còn dòng thiếu bản Việt**, nhưng chất lượng dịch vẫn là `draft` và chưa được nghe/hiệu đính từng câu. Một số transcript nhận dạng sai/rời rạc (đặc biệt 33–34), nên phần chưa đủ căn cứ được đánh dấu trong Editor, không thay bằng lời bịa.

Hai bản **小さな恋のうた** được tách theo ID/persona/file. Ba vocal Mahiru có ID riêng **32–34**; các bản instrumental vẫn nguyên vẹn. Transcript `ひとひら` được giữ để đối chiếu nhưng **không tự gán vào audio đang phân loại instrumental**. Romaji do công cụ tạo và hiệu chỉnh thủ công một phần, vẫn mang trạng thái `needs-review`.

Dữ liệu Romaji/Việt cũ vẫn còn trong repository và có thể mở để đối chiếu; bản dịch đã có không bị thay bằng bản kém hơn. Custom import luôn ưu tiên trước nguồn mặc định; JSON giữ được ba tầng, tokens và thời gian kết thúc. LRC/ELRC/TTML, transcript interval, timestamp inline và plain text vẫn có thể nhập. Cài đặt, favorites, custom lyrics và offset được lưu cục bộ, không gửi lên tài khoản hay máy chủ.

> **MINKOI V5.5 — Final Feature Milestone.** Dự án đã hoàn thiện các cột mốc tính năng lớn và chuyển sang chế độ ổn định / bảo trì lỗi. Không có cam kết “mọi bài đã xác minh” hay “60 FPS trên mọi máy”; trên các GPU cũ không hỗ trợ GPU Rasterization, một số hiệu ứng kính mờ và giải mã ảnh nền lớn vẫn phụ thuộc phần cứng trình duyệt. Kiểm thử viewport/touch emulation không thay thế kiểm thử điện thoại thật.

## Kiến trúc

Website tĩnh bằng **HTML, CSS và JavaScript**, không có framework runtime hay bước build bắt buộc.

```text
index.html             Semantic UI, Music Studio, Lyrics Drawer, existing Zen overlay
css/                   Responsive layouts, shared materials, trilingual typography & V5 Aether UI
js/config.js           Persona catalogue & stable track IDs / audio mapping
js/music.js            Player, playlist, favorites, Liquid Seek, Glass Volume & Web Audio EQ
js/perf-engine.js      Adaptive GPU performance & visibility lifecycle coordinator
js/audio-reactivity.js Shared audio feature analysis
js/visualizer.js        Four chibi soundstage styles
js/ui/                 Shared spring scheduler, gestures, popups & tactile feedback
js/lyrics/             Parser → Normalizer → Provider/Repository → SyncEngine → Renderer
  data/                Per-track, lazily loaded user-supplied lyric drafts
  cache.js             Custom imports, parsed cache & per-audio offsets
  editor.js            Lossless trilingual editing/import/export & diagnostics
js/avatar.js           Persona, avatar & double-buffered banner lifecycle
js/stars.js            Character atmosphere / particles
js/fluid-bg.js         Audio-reactive background
assets/ · music/       Runtime media
```

**Một audio clock, một Lyrics SyncEngine.** Lyrics đọc thời gian của `<audio>`, không tạo audio graph riêng. DOM lời được dựng khi đổi document; những frame tiếp theo cập nhật trạng thái/tokens cần thiết. Spring dùng delta time, không khóa nhịp 30 FPS.

## Chạy local

Phục vụ thư mục repository bằng HTTP static server. Để kiểm thử tua nhạc chính xác, server cần hỗ trợ **HTTP byte-range / `206 Partial Content`**. Mở `file://` không đại diện cho production.

Vercel: preset **Other**, không install/build command, output `.`. `vercel.json` và `.vercelignore` xác định tài nguyên deploy. Công cụ QA, traces, benchmark và ảnh/video kiểm thử không thuộc runtime và không được đưa vào source phát hành.

## Credits & giấy phép

- [COUI](https://github.com/suqi8/coui): tham khảo nguyên lý tương tác (press feedback, spring ngắt được, sheet/popup enter–exit) và cách chọn lọc hiệu ứng; MinKoi tự triển khai bằng `js/ui/spring.js`, không dùng runtime Kotlin/Compose.
- [Miuix](https://github.com/compose-miuix-ui/miuix) / [Blur guide](https://compose-miuix-ui.github.io/miuix/guide/blur): tham khảo nguyên lý chuyển động và vật liệu; không đưa Kotlin/Compose vào JavaScript. Miuix dùng Apache-2.0.
- [MIT](LICENSE) áp dụng cho mã nguồn phù hợp của MinKoi, **không cấp quyền MIT đối với MP3, sáng tác, lyrics, bản dịch, artwork hoặc nhân vật bên thứ ba**. Các quyền đó thuộc chủ sở hữu tương ứng; việc sở hữu file, làm fan project hay không kinh doanh không tự tạo quyền phân phối hoặc bảo đảm fair use.
- MinKoi là bộ sưu tập cá nhân độc lập, không phải nền tảng streaming thương mại và không đại diện cho các studio, nghệ sĩ hay thương hiệu được nhắc tới.

---

### MINKOI

**Where Motion Meets Emotion.**

**© 2026 MINKOI — Crafted with Motion, Light & Soul.**

*An independent Personal Waifu Music Archive.*
