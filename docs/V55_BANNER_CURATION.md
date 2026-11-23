# MinKoi V5.5 — Banner final pass

170 banner: 131 crop từ `art moi.zip` và 39 crop từ artwork đã có
trong repo. Không thêm ảnh web, không tạo hay dùng ảnh AI trong pass này.
Giữ nguyên JPG gốc; chỉ cắt, căn lại và mã hóa WebP.

## Pool và crop chung master

Tên file theo đúng convention WebP đang dùng: `assets/banners/<key>/{pc,phone}/NN.webp`.
Mỗi pool đánh số liền mạch từ `01.webp`, trùng thứ tự trong `js/config.js`.
Uzuki giữ key `shinobu`. Các crop chỉnh ở [pass shuffle](V55_BANNER_SHUFFLE_QA.md)
và [composition hotfix](V55_BANNER_COMPOSITION_HOTFIX.md) xuất từ pixel nguồn,
không upscale.

| Persona | Desktop | Mobile | Cùng master: desktop → mobile |
| --- | ---: | ---: | --- |
| Alya | 15 | 18 | 02→05, 03→16, 04→17, 05→18, 06→12, 07→08, 08→01, 09→06, 10→11, 11→13, 13→07 |
| Mahiru | 12 | 11 | 02→03, 03→04, 04→05, 05→06, 06→07, 07→08, 08→09, 09→11, 12→10 |
| Hinako | 9 | 10 | 03→03, 04→04, 05→09, 06→05, 07→06, 08→07, 09→10 |
| Kaoruko | 10 | 10 | 01→04, 02→05, 03→06, 04→07, 05→08, 06→09, 07→03, 08→10 |
| Nakano Miku | 10 | 15 | 01→02, 02→06, 03→07, 04→08, 05→01, 06→05, 08→13, 10→03 |
| Sakura Miku | 9 | 8 | 02→03, 03→04, 04→05, 05→02, 06→06, 07→07, 08→08, 09→01 |
| Umi | 12 | 11 | 03→02, 04→03, 05→06, 06→09, 07→11, 08→05, 09→07, 10→08, 11→10, 12→04 |
| Uzuki / Shinobu | 5 | 5 | 02→05, 03→02, 04→03, 05→01 |

## Ảnh loại khỏi pool

[Manifest](V55_BANNER_MANIFEST.json) ghi tên file gốc, thông số crop và lý do cụ thể
cho 31 nguồn không dùng (`excludedSources`). Nguồn trong archive được ghi tương
đối với thư mục `art moi/`; nguồn cũ ghi theo đường dẫn trong repo.

- **Alya / Mahiru:** bỏ bản New Year trùng minh họa, ảnh có chữ quảng bá sát mặt và các collage nhiều khung.
- **Hinako / Nakano Miku:** bỏ crop portrait gần trùng; giữ một crop sạch hơn từ cùng master. Bỏ cả banner desktop lấy từ panel chia đôi của Hinako và bản Nakano có bìa ghép.
- **Kaoruko / Sakura Miku:** bỏ crop Giáng sinh khó thấy mặt của Kaoruko, cùng collage và crop đôi quá chật của Sakura Miku. Giữ Sakura Miku đúng series *Aishiteru Game wo Owarasetai*.
- **Umi / Uzuki:** bỏ bìa có chữ lớn, ảnh `SAMPLE`, ảnh nhóm mà crop vẫn lộ nhân vật phụ, và bản JPG Uzuki trùng minh họa với archive.

## Kiểm thử

Đổi asset và cấu hình pool. Sửa một lỗi crossfade trong `js/avatar.js`: hủy
timer dọn lớp cũ trước khi ghi banner mới để tránh lớp mới bị xóa giữa hai
khung hình. Không sửa player, Zen, visualizer, theme, material, MP3 hay Lyrics
JSON. Đây là bản review local, chưa push hoặc deploy.

- **PASS** — 170/170 WebP giải mã đúng kích thước; đường dẫn thực tế, config và
  manifest khớp. Chuyển qua cả tám persona và chọn được slot Alya 15/18.
- **PASS** — Chromium local ở 1440×900, giả lập 390×844 và 430×932 (reduced
  motion): responsive, playback, Favorites, thứ tự Mahiru, vòng điều khiển
  Repeat, theme, Liquid/Frosted, Zen, lyrics toggle và visualizer cơ bản.
- **PASS** — giả lập khung hình crossfade kế tiếp đến muộn trên mobile:
  banner Sakura Miku vẫn hiện, không bị timer của lớp trước xóa.
- **NOT TESTED** — điện thoại thật, WebKit và production.
