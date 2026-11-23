# MinKoi V5.5 — Composition hotfix

**170 banner giữ nguyên đường dẫn.** Đổi master cho 1 slot và crop lại 12 slot
desktop từ pixel nguồn. 157 file và toàn bộ pool mobile giữ nguyên. Không sửa
CSS, `avatar.js`, Shuffle Bag, cache, crossfade, player, lyrics hay visualizer.

## Alya trong ảnh báo lỗi

Tái hiện ở 1366×614, Zen. `getCurrentBanner()` và lớp `.banner-layer.active`
xác nhận `assets/banners/alya/pc/02.webp`; CSS thực tế là `cover`, `50% 22%`.
Master cũ `Arya/Alisa.Mikhailova.Kujou.1024.4187566.webp` là ảnh dọc
1024×1372. Bản crop 1600×900 đã sát mặt; ở 1366×614, `cover` tiếp tục cắt
khoảng 20% chiều cao so với khung 16:9, trước chuyển động Zen. Crop ngang thoáng
từ master này không đủ chỗ để giữ đầu và thân trên. Slot desktop chuyển sang
tranh đồng phục với nền trời từ archive, crop 1024×512 không upscale. Khung
2:1 giảm phần chiều cao bị `cover` cắt trên desktop thấp; ở 16:9 chỉ cắt thêm
hai mép nền trời. Master
cũ vẫn dùng ở mobile `02.webp`. Provenance map đã được sinh lại để desktop
`02.webp` nhận đúng master chung với mobile `05.webp`.

## Các slot sửa

Đường dẫn slot tính từ `assets/banners/`. Tên nguồn Sakura dài được ghi đầy đủ
trong [manifest](V55_BANNER_MANIFEST.json), cùng tọa độ crop và kích thước.

| Slot | Nguồn | Điều chỉnh |
| --- | --- | --- |
| `alya/pc/02.webp` | `Arya/Alisa.Mikhailova.Kujou.1024.4333684.webp` | Đổi master để thoát crop sát mặt |
| `alya/pc/06.webp` | `Arya/roshidere_wp_47.jpg` | Mở khung và lấy thêm tóc |
| `hinako/pc/05.webp` | `hinako/Konohana.Hinako.1024.3637617.webp` | Đưa nụ cười lên trên dock |
| `hinako/pc/07.webp` | `hinako/Konohana.Hinako.1024.4128658.webp` | Đưa mắt và mũi lên cao hơn |
| `hinako/pc/08.webp` | `hinako/Konohana.Hinako.1024.4128662.webp` | Giữ khuôn mặt trong khung thấp |
| `kaoruko/pc/03.webp` | `Kaoruko/Waguri.Kaoruko.1024.4418354.webp` | Cân lại khung quanh kính và sách |
| `mahiru/pc/12.webp` | `Mahiru/tenshisama_2026newyear-724x1024.jpg` | Đưa mắt và miệng ra khỏi vùng dock |
| `nakanomiku/pc/05.webp` | `NakanoMiku/Nakano.Miku.1024.2747553.webp` | Giảm zoom, giữ tai nghe |
| `sakuramiku/pc/02.webp` | `SakuraMiku(ishiterugame)/5fe571ef…webp` | Cân lại mặt, mũ Santa và quà |
| `sakuramiku/pc/03.webp` | `SakuraMiku(ishiterugame)/fb7da7c9…webp` | Đưa mắt và miệng lên trong khung tai mèo |
| `shinobu/pc/03.webp` | `uzuki/Uzuki.Shinobu.1024.4216416.webp` | Mở khung quanh tóc và vai |
| `umi/pc/04.webp` | `umi/Asanagi.Umi.1024.4048031.webp` | Mở khung yukata, giữ má và vai |
| `umi/pc/09.webp` | `umi/Asanagi.Umi.1024.3716671.webp` | Giữ phần dưới khuôn mặt trong khung |

## Bằng chứng local

- [Alya 02 — Zen trước](qa/banner-composition/alya-02-zen-before.jpg) /
  [Zen sau, 1366×614](qa/banner-composition/alya-02-final-1366x614.jpg) /
  [1366×768](qa/banner-composition/alya-02-final-1366x768.jpg) /
  [1920×1080](qa/banner-composition/alya-02-final-1920x1080.jpg)
- [Before/after crop](qa/banner-composition/before-after-crops.jpg);
  before/after Zen cho mọi slot sửa:
  [1](qa/banner-composition/before-after-zen-1.jpg) /
  [2](qa/banner-composition/before-after-zen-2.jpg) /
  [3](qa/banner-composition/before-after-zen-3.jpg).
- [Bảng ảnh capture theo persona, viewport và chế độ](qa/banner-composition/).
  Các bảng viewport là snapshot **trước hotfix**; dùng ảnh so sánh để xem thay đổi.

## QA và giới hạn

- Chromium render 82 banner desktop ở 1366×614, 1366×768, 1920×1080 và
  88 banner mobile ở 390×844, 430×932, trong Player và Zen với lyrics:
  **844 ảnh** qua DOM/CSS của site. Dùng gán URL cho lớp active khi rà hàng
  loạt để đi theo số thứ tự; xác nhận Alya 02 qua luồng chọn persona thật.
- **PASS** Shuffle Bag 100 lượt × 16 pool; kiểm tra mạng chậm, decode lỗi,
  chuyển viewport và Zen không ghi nhận frame trống. Smoke Chromium qua
  Player, Favorites, thứ tự Mahiru, Repeat, theme/material, visualizer, Zen
  và Reduced Motion.
- Kiểm tra trực quan ưu tiên Zen ở viewport thấp 1366×614 và mobile 390×844;
  đối chiếu các layout khác và Player trên ảnh capture, không coi toàn bộ
  844 screenshot đều đã được kiểm tra độc lập từng pixel.
- Nguồn dọc và khung cận có sẵn vẫn giới hạn khoảng trống. Không mở crop nếu
  làm lộ chữ lớn, nhân vật phụ hoặc làm bố cục xấu hơn. Không kéo giãn, blur
  giả, vẽ thêm nội dung hoặc thay layout để che hạn chế đó.
- Thiết bị thật, WebKit, production: **NOT TESTED**. Không commit/push/deploy.
