# Quy trình ảnh preview

Ảnh chính thức chỉ được thay sau khi xem trực tiếp từng PNG. Không có script QA nào được tự động ghi vào `docs/screenshots/desktop-preview.png` hoặc `mobile-preview.png`.

1. `pnpm install --frozen-lockfile`, `pnpm exec playwright install chromium`.
2. Chạy `node scripts/qa/server.cjs`; ở terminal khác chạy `pnpm test`.
3. Chạy `node scripts/qa/capture-previews.cjs`. Windows có Edge có thể đặt `QA_CHANNEL=msedge`. Đặt `BASE_URL` để kiểm tra bản triển khai cụ thể.
4. Chạy `pnpm qa:previews`. Ảnh nằm trong `test-results/previews/`, chưa được phê duyệt. Manifest ghi viewport, DPR, zoom, vị trí thành phần, URL và hash ảnh/nguồn. Commit là HEAD lúc chụp; `dirty` cho biết có sửa đổi chưa commit, marker và `sourceFiles` xác định nguồn đã chụp (text chuẩn hóa LF).
5. Mở cả PNG desktop 1440×900, PNG mobile toàn trang (viewport 390×844) và ảnh mobile viewport để đối chiếu. Kiểm tra bốn mép, avatar, tiêu đề, bài hát, seek, phát/dừng, volume, navigation, không có panel mở, không có vùng lặp/đen/trống hoặc nội dung bị cắt. So sánh với browser và ảnh cũ.
6. Chỉ sau bước 5 mới sao chép nguyên tệp desktop/mobile vào thư mục showcase. Không crop, ghép, kéo giãn hoặc chỉnh ảnh che lỗi. Lưu manifest và ghi hash đã duyệt trong audit.

Kiểm tra tự động chỉ phát hiện một số lỗi kích thước, tile lặp, ảnh trống và sai trạng thái. Nó không thể kết luận bố cục đẹp hoặc mọi lỗi thị giác đều đã được loại trừ. Nếu ảnh hỏng: sửa UI hoặc cách chụp, chạy lại; không phát hành ảnh đó.

CI lưu screenshot/trace/video làm artifacts để duyệt, không tự cập nhật preview. Không dùng ảnh từ script V3.x làm ảnh phát hành. Playwright lưu screenshot nguyên bản từ browser; DPR=1 tránh nhầm CSS pixel với device pixel. Ảnh mobile toàn trang giữ đủ nội dung, README giữ nguyên tỉ lệ.
