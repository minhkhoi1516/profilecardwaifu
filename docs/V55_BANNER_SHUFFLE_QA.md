# MinKoi V5.5 — Shuffle bag và crop QA

Giữ **170 banner / 16 pool**; đường dẫn và số lượng từng persona không đổi.
Mỗi persona có túi desktop và mobile riêng. Mỗi chu kỳ dùng tất cả URL đúng một
lượt; ba URL đã hiển thị gần nhất không được chọn lại. Ưu tiên master khác ba
lượt hiển thị gần nhất của cùng persona, kể cả qua breakpoint. Nếu chỉ còn
master trùng trong túi hiện tại, nới ràng buộc theo thứ tự cũ nhất trước, không
nới ràng buộc URL. Ảnh placeholder trong HTML trước khi JS khởi động không
tính là lượt shuffle.

Preload chỉ nhìn trước một lựa chọn; cache decode giữ tối đa năm banner và
không đổi lựa chọn. Chỉ lớp được kích hoạt mới tiêu thụ lượt. Nếu decode lỗi,
thử một URL khác còn đủ điều kiện; khi không có URL thay thế, giữ lớp đang
hiển thị và để URL lỗi còn trong chu kỳ. Không thể hoàn tất chu kỳ nếu một
file cần thiết hỏng vĩnh viễn: cần sửa hoặc loại file đó khỏi pool.
Hai buffer vẫn hoạt động như trước; lớp cũ giữ opacity 1 bên dưới đến khi
lớp mới fade xong. Reduced Motion đổi trực tiếp mà không fade.

Provenance runtime sinh từ manifest qua `node scripts/generate-banner-masters.cjs`;
dữ liệu gốc và thông tin ghi công không bị chỉnh sửa.

## Crop

13 file cập nhật, 157 file giữ nguyên. Crop mới lưu ở tỷ lệ 16:9 hoặc 9:19.5 và
không nội suy lên kích thước lớn hơn nguồn. File giữ từ pass trước vẫn có thể
chịu thêm khoảng 18% crop ngang ở viewport điện thoại và một số master vốn mềm
(đặc biệt Uzuki). Một số khung cận và chữ ký nhỏ được giữ; không vẽ đè.
Ở chế độ thường, thẻ hồ sơ vẫn che vùng giữa theo layout hiện có; Zen cho
thấy khung đầy đủ hơn. Không đổi bố cục UI để xử lý từng banner.

| Slot | Sửa gì |
| --- | --- |
| Alya phone/11 | Căn lại khuôn mặt từ mép trái |
| Mahiru pc/04, pc/07 | Giảm viền trắng của cover |
| Mahiru phone/04, phone/05 | Căn lại mắt và mũi, giữ chữ tiêu đề ngoài khung |
| Hinako phone/08 | Giữ một nhân vật trong panel, lấy thêm phần vai |
| Kaoruko pc/02 | Giữ trọn nụ cười |
| Sakura Miku phone/03, phone/04 | Căn khung Santa và bỏ viền trắng trên ảnh tai mèo |
| Umi pc/08, phone/11 | Lấy lại khoảng trên đầu và đưa mặt vào trong khung |
| Uzuki phone/03, phone/05 | Căn khuôn mặt vào trong khung; phone/05 vẫn giới hạn độ nét do nguồn |

[Before/after của 13 crop](qa/banner-crop-before-after.jpg) ·
[16 contact sheet và CSV từ công cụ audit](qa/banner-final/) ·
[Manifest và crop box](V55_BANNER_MANIFEST.json).

Các artifact trong `docs/qa/` dành cho review local, không thuộc runtime.
Tạo lại 16 sheet bằng `python minkoi_banner_audit.py --out docs/qa/banner-final`.
Test trình duyệt dùng `node tests/banner-browser.cjs` trên site local
(`MINKOI_BASE`, mặc định `http://127.0.0.1:8099/`).

## Xác minh

- **PASS** `node tests/banner-shuffle.cjs`: 100 lượt commit × 16 pool, kiểm tra
  hết chu kỳ, ranh giới chu kỳ, ba URL gần nhất, ưu tiên master và bỏ qua lượt
  chưa commit.
- **PASS** Chromium: 100 lần kích hoạt lớp hiển thị × 16 pool, gồm chọn lại
  persona và đổi A → B → A; không bỏ slot ở cuối chu kỳ. Cache decode chạm
  giới hạn năm ảnh mà không đổi thứ tự của túi.
- **PASS** Audit Pillow: 170 file đọc được, 16 contact sheet, không sai tên,
  không có cặp bị dHash đánh dấu. Đã xem trực quan cả 16 sheet; dHash không
  thay thế đánh giá chất lượng crop.
- **PASS** Smoke Chromium local: giải mã 170 banner, persona, playback,
  Favorites, thứ tự Mahiru, Repeat, theme/material, visualizer và Zen.
- **PASS** Chromium: mạng tải chậm và chọn persona khác giữa chừng, decode
  lỗi và thử lại, Zen vào/ra khi đang tải, breakpoint desktop ↔ mobile.
  Test lấy mẫu từng frame không ghi nhận frame có cả hai lớp trống sau khi
  chuyển cleanup từ timer sang tín hiệu hoàn tất fade.
- **PASS** Kiểm tra `cover` / `50% 22%` trên trang thật bằng một banner đại
  diện cho mỗi persona ở mỗi viewport, cả chế độ thường và Zen với vignette
  và lyrics đang phát. Tổng 64 ảnh chụp Chromium:
  [1366×768](qa/banner-browser/1366x768.jpg) ·
  [1920×1080](qa/banner-browser/1920x1080.jpg) ·
  [390×844](qa/banner-browser/390x844.jpg) ·
  [430×932](qa/banner-browser/430x932.jpg).
- **NOT TESTED** Thiết bị thật, WebKit, production. Không commit/push/deploy.

| Persona | Số chu kỳ đầy đủ trong 100 lượt PC / mobile |
| --- | --- |
| Alya | 6 / 5 |
| Mahiru | 8 / 9 |
| Hinako | 11 / 10 |
| Kaoruko | 10 / 10 |
| Nakano Miku | 10 / 6 |
| Sakura Miku | 11 / 12 |
| Umi | 8 / 9 |
| Uzuki | 20 / 20 |
