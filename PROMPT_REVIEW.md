# Đánh giá prompt & bản brief viết lại (v2)

> Mục đích: file này gồm (A) nhận xét prompt tay của bạn, (B) những chỗ cần chốt, (C) bản brief
> viết lại đủ chi tiết để giao cho dev/AI mà không phải hỏi lại, (D) số liệu kiểm tra từ code.

---

## A. Nhận xét prompt hiện tại

**Điểm mạnh:** bạn nêu đúng 5 nhóm việc, đúng thứ tự ưu tiên, có ví dụ cụ thể (tên bài, tên file),
và có quy ước đặt tên asset rõ ràng — đây là phần giá trị nhất, giữ nguyên.

**Điểm yếu (khiến người/AI nhận prompt phải hỏi lại):**

| # | Vấn đề | Hệ quả |
|---|---|---|
| 1 | Trộn 2 loại việc: "sửa code" và "kiểm tra giúp tôi xem thiếu gì" | Người nhận không biết phải báo cáo trước hay sửa luôn |
| 2 | "một tag kia tạm trống" — không nói hành vi của tag trống | Mỗi người làm một kiểu (ẩn / disable / hiện "Coming soon") |
| 3 | Mục 3 gộp 3 tính năng vào 1 dòng, không có tiêu chí hoàn thành | Không nghiệm thu được, dễ làm lệch ý |
| 4 | Không nói rõ mô hình nhạc: bỏ 3 tab `All / Angel / CPK` hay giữ? | Đây là thay đổi kiến trúc dữ liệu, không phải "sắp xếp lại" |
| 5 | "fix lỗi avatar" không kèm thông tin lỗi (ảnh, console, môi trường) | Phải điều tra lại từ đầu (mình đã tìm ra, xem mục D) |
| 6 | Không có ràng buộc kỹ thuật: dung lượng ảnh, định dạng, deploy | Ảnh 48 MB và 25 file nhạc 404 vẫn lọt vào bản deploy |
| 7 | Không nêu "xong là như thế nào" (acceptance criteria) | Sửa xong vẫn tranh cãi đúng/sai |

**Kết luận:** prompt đủ để *hiểu* bạn muốn gì, chưa đủ để *làm đúng ngay*. Cần thêm 4 thứ:
(1) hành vi mong đợi của từng tính năng, (2) dữ liệu chuẩn (bảng waifu ↔ file), (3) tiêu chí
nghiệm thu, (4) quyết định về dữ liệu cũ (25 bài CPK).

---

## B. Cần bạn chốt (4 câu)

1. **Tag trống thứ 3** (sau Asanagi Umi): ẩn hẳn, hay hiện chip mờ ghi "Coming Soon" và bấm vào
   không làm gì? (mình nghiêng về chip mờ — sau này chỉ cần thay ảnh + tên là xong)
2. **25 bài CPK cũ** (melt, ray, FUSHI, Reply, TSUKUYOMI, 星降る海, …) hiện **không còn file**
   trong `music/`: xoá khỏi config, hay giữ lại và bạn sẽ bổ sung file sau?
3. **Khi bấm sang waifu khác**: tự phát bài đầu của waifu đó, hay chỉ mở danh sách và **giữ nguyên
   bài đang nghe**? (prompt của bạn ghi "hoặc không chọn giữ nguyên bài đang nghe" — cần chọn 1
   làm mặc định, cái còn lại thành tuỳ chọn)
4. **Tên file shinobu** đang lệch: `avatar_shinobu.png` nhưng banner là `banner_shinobuuzuki_*`.
   Chuẩn hoá hết về `shinobu` hay giữ nguyên như hiện tại?

---

## C. Brief viết lại (copy-paste được)

```markdown
# BRIEF — MinKoi Studio: fix asset + thêm waifu + playlist theo waifu

## 0. Bối cảnh kỹ thuật
- Static site, không build step: index.html + css/*.css + js/*.js. Deploy Vercel.
- Dữ liệu tập trung ở js/config.js: CONFIG.personas[], CONFIG.music.playlist[].
- Render: js/avatar.js (persona, banner, avatar), js/music.js (player, playlist, category),
  js/features.js (zen mode, hotkey, theme, toast).
- KHÔNG đổi cấu trúc thư mục. KHÔNG thêm framework/thư viện mới.

## R1 — Persona (P0)
- Giữ nguyên 5 persona: alya, mahiru, kaoruko, sakuramiku, shinobu.
- Thay persona id 5: "Rikka Inohana" → "Konohana Hinako"
  key "hinako", role "??", title "??", accent "??", avatar assets/avatar_hinako.png.
- Thêm persona id 6: "Asanagi Umi", key "umi", role "??", title "??", accent "??",
  avatar assets/avatar_umi.png.
- Thêm persona id 7: placeholder, chip disabled + nhãn "Coming Soon", bấm không đổi theme/nhạc.
- Số lượng trên UI ("6 PERSONAS", "All (33)") phải tính động từ CONFIG, không hardcode.

## R2 — Nối asset đúng quy ước (P0)
Mỗi persona có: avatar + 2 banner PC + 2 banner phone.
Bảng chuẩn:
| key       | avatar                  | banner PC                      | banner phone                      |
|-----------|-------------------------|--------------------------------|-----------------------------------|
| alya      | avatar_alya.png         | banner_alya_pc.png/_pc2.png    | banner_alya_phone.png/_phone2.png |
| mahiru    | avatar_mahiru.png       | banner_mahiru_pc.png/_pc2.png  | banner_mahiru_phone.png/_phone2.png |
| kaoruko   | avatar_kaoruko.png      | banner_kaoruko_pc...           | banner_kaoruko_phone...           |
| sakuramiku| avatar_sakuramiku.png   | banner_sakuramiku_pc...        | banner_sakuramiku_phone...        |
| shinobu   | avatar_shinobu.png      | banner_shinobuuzuki_pc...      | banner_shinobuuzuki_phone...      |
| hinako    | avatar_hinako.png       | banner_hinako_pc...            | banner_hinako_phone...            |
| umi       | avatar_umi.png          | banner_umi_pc...               | banner_umi_phone...               |

- Viewport < 768px dùng banner phone, >= 768px dùng banner PC.
- Mỗi lần chuyển persona: random giữa bản `_pc` và `_pc2` (hoặc `_phone`/`_phone2`),
  không lặp lại ảnh vừa dùng; crossfade 300–500ms; preload ảnh của persona kế tiếp.
- Xoá toàn bộ tham chiếu chết: avatar1.png, banner1.png, banner_alya.png,
  banner_*_phone.jpg, bannertop1_phone.jpg (đang có 40 tham chiếu 404).
- favicon + apple-touch-icon + og:image + twitter:image trỏ về avatar_alya.png / banner_alya_pc.png.
- Fallback khi ảnh lỗi: hiện monogram "MK" trên nền accent, KHÔNG hiện alt text vỡ.

## R3 — Nhạc theo waifu (P0)
Bỏ mô hình category cũ (all / angel / cpk) → playlist thuộc về persona.
Nguồn: 23 file trong music/, chia đúng như sau:
- alya (4): 可愛くてごめん, 小さな恋のうた, ワールドイズマイン, CHE.R.RY
- mahiru (7): angel_01 → angel_07 (giữ nguyên)
- kaoruko (4): ハレの日に - Harenohini, まなざしは光, ひとひら, 凛太郎と薫子
- sakuramiku (2): 君のせいで愛してる, リトルワールド
- shinobu (2): 月に向かって撃て, 声の軌跡
- hinako (2): 最最最高級のお世話して, 完璧じゃないわたし
- umi (2): Submarine_Youth, Zutto_Ichibanni_Shitene

Hành vi:
- Bấm 1 chip waifu → mở panel danh sách bài của waifu đó (tên bài, số thứ tự, trạng thái đang phát).
- Bấm 1 bài → phát bài đó, panel vẫn mở, highlight dòng đang phát.
- Mặc định khi đổi waifu: [CHỐT: giữ bài đang nghe / tự phát bài đầu]. Có toggle trong settings.
- Tab "All" hiển thị toàn bộ 23 bài; số đếm tính động.
- Không còn tab "The Angel Next Door" / "CPK Collection" trừ khi [CHỐT: giữ].
- Duration hiển thị lấy từ metadata audio khi load xong (hiện đang hardcode và sai).

## R4 — Zen mode cho mobile (P1)
- Đã có: nút header + phím Z/Esc + mini dock. Thiếu entry point trên mobile.
- Thêm: nút nổi (floating) góc phải dưới ở viewport < 768px; long-press avatar cũng vào zen.
- Trong zen: ẩn toàn bộ UI trừ banner + mini dock; dock tự mờ sau 5s, chạm để hiện lại.
- Bật Screen Wake Lock API (nếu hỗ trợ) để không tắt màn hình; nhả lock khi thoát.
- Thoát: nút X, Esc, hoặc chạm 2 lần.

## R5 — Chất lượng asset (P1)
- Re-encode các file sai định dạng: nhiều file .png thực chất là JPEG/WebP
  (banner_alya_pc.png, banner_kaoruko_pc.png, banner_umi_pc.png, banner_alya_phone.png, …).
  Yêu cầu: đúng định dạng theo đuôi file, hoặc đổi đuôi cho khớp.
- Giới hạn: banner ≤ 2560×1440, ≤ 1.5 MB; avatar ≤ 800×800, ≤ 500 KB.
  banner_alya_pc2.png hiện 10240×5760 / 48.5 MB → bắt buộc resize.
- Ảnh transparent giữ PNG, ảnh chụp dùng JPEG/WebP.

## R6 — Hạ tầng / deploy (P0)
- Thêm .gitignore: profilecardwaifu.zip, *.zip, _preview.png.
- Commit toàn bộ assets mới (hiện đang untracked → deploy từ GitHub sẽ 404 → avatar vỡ).
- Kiểm tra tổng dung lượng deploy sau khi resize (mục tiêu < 100 MB).

## Tiêu chí nghiệm thu
1. Mở trang ở 1440×900 và 390×844: avatar + banner hiện đúng nhân vật, không có ảnh vỡ,
   không có request 404 nào trong Network tab.
2. Chuyển qua cả 7 persona: theme màu, avatar, banner, tên, role đổi đúng; banner random
   giữa 2 bản và không lặp liên tiếp.
3. Bấm chip waifu → thấy đúng danh sách bài của waifu đó; bấm bài → phát đúng file;
   số bài mỗi waifu khớp bảng R3.
4. "All" hiển thị 23 bài; không còn bài nào trỏ tới file không tồn tại.
5. Mobile: vào/ra zen mode được bằng nút nổi; màn hình không tắt khi đang zen (nếu máy hỗ trợ).
6. Không có lỗi console; Lighthouse Performance mobile ≥ 80.

## Ngoài phạm vi (làm sau)
- Trang admin upload nhạc/waifu, backend, đa ngôn ngữ, tài khoản.
```

---

## D. Số liệu kiểm tra từ code hiện tại

- `CONFIG.personas`: **6**; cần **8** (5 giữ + hinako + umi + placeholder).
- `CONFIG.music.playlist`: **33** entry nhưng `music/` chỉ có **23** file.
  - Angel: 7/7 ✅
  - CPK: **1/26** ❌ — chỉ còn `ワールドイズマイン.mp3`.
- Tham chiếu file không tồn tại: **40** (chủ yếu `js/config.js`, thêm `index.html`, `js/music.js`).
- Ảnh: 7 avatar + 28 banner (7 × pc/pc2/phone/phone2) — **đủ**, chỉ là code chưa trỏ tới.
- Sai định dạng: `banner_alya_pc.png`, `banner_kaoruko_pc.png`, `banner_kaoruko_phone2.png`,
  `banner_mahiru_phone.png`, `banner_shinobuuzuki_phone.png`, `banner_umi_pc.png`… là JPEG;
  `banner_alya_phone.png`, `banner_kaoruko_phone.png`, `banner_sakuramiku_phone.png`… là WebP.
- Kích thước bất thường: `banner_alya_pc2.png` 48.5 MB (10240×5760).
- Repo: `.git` pack 353 MB + `profilecardwaifu.zip` 542 MB nằm trong thư mục project.

### Nguyên nhân lỗi avatar trong ảnh
`index.html` trỏ `assets/avatar_alya.png`, nhưng lúc chụp ảnh file này **chưa tồn tại**
(alt text "Alya Kujou Portrait" hiện ra = ảnh load thất bại). Hiện file đã có nên avatar sẽ
hiện — nhưng **lỗi gốc vẫn còn**: 40 đường dẫn trỏ file không tồn tại (banner, favicon,
OG image, album art), nên banner/favicon vẫn vỡ. Nếu deploy qua GitHub → Vercel mà asset còn
untracked thì avatar sẽ vỡ lại y như ảnh.
