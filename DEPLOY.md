# 🚀 Đưa web lên mạng — làm đúng thứ tự này

> Tình trạng hiện tại: code đã sửa xong và **đã commit** (chưa push).
> Repo: `github.com/minhkhoi1516/profilecardwaifu` · Host: Vercel (đã có `vercel.json`).

---

## Bước 1 — Push code lên GitHub

Máy này chưa lưu đăng nhập GitHub, nên chọn 1 trong 2 cách:

### Cách A — GitHub Desktop (dễ nhất, khuyên dùng)
1. Mở **GitHub Desktop** → `File` → `Add local repository` → chọn thư mục `profilecardwaifu`.
2. Sẽ thấy sẵn 1 commit: *"fix(assets): wire new persona roster..."*.
3. Bấm **Push origin** ở thanh trên.
4. Lần đầu nó hỏi đăng nhập GitHub → bấm **Sign in** và cho phép trên trình duyệt.

### Cách B — Terminal
```powershell
cd C:\Users\Admin\.gemini\antigravity\scratch\profilecardwaifu
git push origin main
```
Nếu bị hỏi mật khẩu: GitHub **không nhận mật khẩu thường**. Tạo *Personal Access Token*
(GitHub → Settings → Developer settings → Tokens (classic) → Generate new token, tick `repo`)
rồi dán token đó vào chỗ mật khẩu.

⏳ Lần push đầu sẽ hơi lâu (khoảng 80–100 MB nhạc mới). Cứ để chạy, đừng tắt.

---

## Bước 2 — Vercel tự deploy

- Nếu project Vercel **đã nối** repo này: push xong ~1 phút là web tự cập nhật.
  Xem tiến trình ở tab **Deployments** trong Vercel.
- Nếu **chưa nối**: Vercel → **Add New → Project → Import Git Repository** → chọn repo →
  Framework Preset để **Other** → **Deploy**. Không cần sửa Build Command, không cần
  Output Directory (đây là site tĩnh).

---

## Bước 3 — Kiểm tra sau khi deploy

Mở link web, bấm **Ctrl + F5** (bỏ cache), rồi kiểm tra nhanh:

- [ ] Avatar Alya hiện ảnh, không còn chữ "Alya Kujou Portrait" chen vào.
- [ ] Có đủ 7 waifu + 1 chip mờ "Coming Soon".
- [ ] Bấm waifu khác → banner đổi, bài đang phát **không bị dừng**.
- [ ] Tab nhạc đổi theo waifu, `All (23)`.
- [ ] Bấm play → nghe được, thanh thời gian chạy.
- [ ] Trên điện thoại: có nút mở "màn hình chờ" ở góc phải dưới.

Nếu avatar vẫn vỡ: mở **F12 → Network → lọc 404**. Nếu thấy `assets/...` báo đỏ nghĩa là
file chưa được push (quay lại Bước 1). Nếu không thấy 404 nào: chỉ là cache, Ctrl + F5 lần nữa.

---

## Bước 4 — Tên miền: có cần mua không?

**Không cần.** Bạn đã có sẵn 2 loại miễn phí:

| Loại | Dạng link | Ghi chú |
|---|---|---|
| Vercel (mặc định) | `ten-project.vercel.app` | Nhanh, gọn, dùng được ngay |
| GitHub Pages | `minhkhoi1516.github.io/profilecardwaifu` | Dài hơn, phải bật thêm trong Settings |

Chỉ nên mua tên miền khi:
- muốn link ngắn kiểu `minkoi.com` để in lên card / gửi cho người khác;
- muốn đổi nhà cung cấp hosting sau này mà link không đổi.

Giá tham khảo: **.com ≈ 250–300k/năm**, `.me`/`.dev` tương tự. Mua ở **Cloudflare Registrar**
hoặc **Porkbun** (rẻ, không phí ẩn). Sau khi mua: Vercel → Project → **Settings → Domains →
Add** → nhập tên miền → làm theo hướng dẫn DNS (thường chỉ cần thêm bản ghi `A` hoặc `CNAME`).
HTTPS Vercel tự cấp, không tốn thêm.

> Mẹo: cứ dùng `*.vercel.app` vài tuần, thấy ổn rồi hãy mua. Gắn tên miền sau **không phải
> sửa code**, nên không có gì phải vội.

---

## Vercel hay GitHub Pages?

| | **Vercel** (đang dùng) | **GitHub Pages** |
|---|---|---|
| Deploy | Tự động mỗi lần push | Tự động (chậm hơn ~1–2 phút) |
| Tốc độ | CDN toàn cầu, nhanh | Ổn, chậm hơn ở châu Á |
| Link | `*.vercel.app` | `*.github.io/ten-repo` |
| Cấu hình | `vercel.json` đã có sẵn | Phải bật trong Settings → Pages |
| Giới hạn | ~100 GB băng thông/tháng (free) | ~1 GB dung lượng site, 100 GB/tháng |
| Preview | Mỗi lần push có link preview riêng | Không có |

**Kết luận: giữ Vercel.** Dự án đã cấu hình cho nó rồi, chuyển sang Pages chỉ mất thời gian
và link sẽ dài hơn. Repo ~120 MB nhạc vẫn nằm dưới hạn mức của cả hai.

---

## Việc nên làm sau này (không gấp)

1. **Nén nhạc**: 23 file MP3 đang ~118 MB. Chuyển sang 128–192 kbps hoặc `.m4a`/`.opus` có thể
   giảm còn ~40 MB, tải nhanh hơn nhiều trên 4G.
2. **Backup**: giữ `profilecardwaifu.zip` ở ổ ngoài (đừng commit — đã có trong `.gitignore`).
3. **Thêm waifu mới**: làm theo mục *"Cách thêm một waifu mới"* trong [README.md](README.md).
