<div align="center">

# MINKOI

**Personal Waifu Music Archive**

*Where Motion Meets Emotion.*

**V4 Refined · IN DEVELOPMENT**

[![MinKoi V4 Refined](https://img.shields.io/badge/MINKOI-V4_Refined-78b9d2?style=flat-square)](https://github.com/minhkhoi1516/profilecardwaifu)
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
| **Waifu Collection** | 8 persona, avatar và banner chuyển cảnh hai lớp, chibi, màu sắc và particles riêng. |
| **Music Studio** | 34 bản nhạc; playlist, favorites, bộ lọc nhân vật, tìm kiếm, shuffle/repeat, seek, playback speed, EQ và sleep timer. |
| **日本語 × Romaji × Tiếng Việt** | Một câu, ba tầng nội dung; mặc định bật cả ba, sáu lựa chọn hiển thị lưu trên trình duyệt và dùng chung cho Drawer/Zen. |
| **Lyrics Flow** | Floating, Karaoke và Toàn bài; chạm câu để tua, recenter, offset từng bản audio, Tap to Sync và Editor. Word/syllable sweep **chỉ** dùng khi nguồn có timestamp tương ứng. |
| **Cinematic Zen** | Thẻ lời Frosted trên artwork, chuyển câu bằng spring, Mini Dock kính mờ nhuộm màu waifu và nút ẩn/hiện lời được lưu trên trình duyệt. Ẩn lời không thoát Zen và không dừng nhạc. |
| **Live Soundstage** | Aurora Crown, Spectral Halo, Manga Soundwave và Kinetic Orbit đọc dữ liệu audio thật. |
| **Natural Motion** | Spring ngắt/đổi đích được, press feedback, popup/sheet enter–exit; thanh danh mục kéo trực tiếp hoặc vuốt danh sách với quán tính. |
| **Two Materials** | Frosted mặc định và Liquid tùy chọn trong menu ba chấm; chung một bộ vật lý, không phải hai indicator. Liquid là hiệu ứng quang học CSS, không tuyên bố khúc xạ vật lý. |

Âm thanh tương tác và rung là tùy chọn, mặc định tắt; khả năng rung tùy thiết bị/trình duyệt. Dark/Light Mode và Reduced Motion được hỗ trợ.

### Lời nhạc: trung thực với nguồn

Hai nguồn do người dùng cung cấp — `lyric.txt` (Nhật + timestamp) và `lyric_vi.txt` (Việt + timestamp) — được tách thành 28 mục dữ liệu theo track. **Timestamp được giữ làm mốc nguồn** (`sourceStartMs` / `sourceEndMs`); hiệu chỉnh về sau nằm ở trường riêng (`correctedStartMs` / `correctedEndMs`) nên có thể so sánh và hoàn tác mà không ghi đè mốc gốc.

Bản Việt được ghép **chỉ khi timestamp trùng khớp tuyệt đối** với dòng Nhật; không nội suy, không chia đều theo số ký tự. 383 dòng từng trống hoặc còn ghi chú `[cần đối chiếu]` đã được điền từ nguồn này. Trong 1.138 dòng đã áp dụng (track 14 là transcript instrumental, không áp dụng), **không còn dòng thiếu bản Việt**, nhưng chất lượng dịch vẫn là `draft` và chưa được nghe/hiệu đính từng câu. Một số transcript nhận dạng sai/rời rạc (đặc biệt 33–34), nên phần chưa đủ căn cứ được đánh dấu trong Editor, không thay bằng lời bịa.

Hai bản **小さな恋のうた** được tách theo ID/persona/file. Ba vocal Mahiru có ID riêng **32–34**; các bản instrumental vẫn nguyên vẹn. Transcript `ひとひら` được giữ để đối chiếu nhưng **không tự gán vào audio đang phân loại instrumental**. Romaji do công cụ tạo và hiệu chỉnh thủ công một phần, vẫn mang trạng thái `needs-review`.

Dữ liệu Romaji/Việt cũ vẫn còn trong repository và có thể mở để đối chiếu; bản dịch đã có không bị thay bằng bản kém hơn. Custom import luôn ưu tiên trước nguồn mặc định; JSON giữ được ba tầng, tokens và thời gian kết thúc. LRC/ELRC/TTML, transcript interval, timestamp inline và plain text vẫn có thể nhập. Cài đặt, favorites, custom lyrics và offset được lưu cục bộ, không gửi lên tài khoản hay máy chủ.

> **V4 Refined vẫn đang phát triển.** Không có cam kết “mọi bài đã xác minh” hay “60 FPS trên mọi máy”. Kiểm thử viewport/touch emulation không thay thế kiểm thử Android thật. Nhánh `main` có thể chứa tính năng chưa được phát hành lên production.

## Kiến trúc

Website tĩnh bằng **HTML, CSS và JavaScript**, không có framework runtime hay bước build bắt buộc.

```text
index.html             Semantic UI, Music Studio, Lyrics Drawer, existing Zen overlay
css/                   Responsive layouts, shared materials, trilingual typography
js/config.js           Persona catalogue & stable track IDs / audio mapping
js/music.js            Player, playlist, favorites & Web Audio EQ
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
- [Glasmio](https://github.com/NEORUAA/Glasmio): tham khảo tương tác/vật liệu.
- [MIT](LICENSE) áp dụng cho mã nguồn phù hợp của MinKoi, **không cấp quyền MIT đối với MP3, sáng tác, lyrics, bản dịch, artwork hoặc nhân vật bên thứ ba**. Các quyền đó thuộc chủ sở hữu tương ứng; việc sở hữu file, làm fan project hay không kinh doanh không tự tạo quyền phân phối hoặc bảo đảm fair use.
- MinKoi là bộ sưu tập cá nhân độc lập, không phải nền tảng streaming thương mại và không đại diện cho các studio, nghệ sĩ hay thương hiệu được nhắc tới.

---

### MINKOI

**Where Motion Meets Emotion.**

**© 2026 MINKOI — Crafted with Motion, Light & Soul.**

*An independent Personal Waifu Music Archive.*
