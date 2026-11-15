# MinKoi V4.0 — Lyrics Source & Sync Audit
**Ngày kiểm tra:** 2026-11-15 · **Nguồn:** `js/config.js`, `js/lyrics/repository.js`, 31 MP3 trong `music/` và metadata Spotify công khai.

## Kết quả
- **15 track** có lời căn theo **dòng**, chưa được kiểm chứng từng dòng/từng từ với MP3 thật.
- **7 track** là **instrumental**, không cần lời hát.
- **9 track** thiếu lời: #13 `Manazashi wa Hikari` và #24–31 (8 bài Gotoubun / Nakano Miku).
- **28 link Spotify do người dùng cung cấp** tương ứng 27 bài track + 1 playlist. Ba instrumental #9–11 chưa có link.
- Các đường dẫn Spotify chỉ dùng làm tham chiếu tên/phiên bản; **không cung cấp ca từ hoặc timestamp đồng bộ**.
- Nội dung lời hiện có được giữ nguyên. Không tạo lời có bản quyền, thời gian giả hay tuyên bố đã căn âm thanh khi chưa nghe.

## Kết quả sửa liên kết Spotify
1. #13 `まなざしは光` (Tatsuya Kitani) xác minh từ playlist: ID chính xác `0HI4lUmOWpFzxPB5NMlAXW`, **207.469 giây**. Đã bổ sung Spotify track URL và giữ liên kết playlist. Lyrics vẫn thiếu.
2. #15 `凛太郎と薫子` (Harada Moeki): liên kết người dùng gửi `2C2SxTwvnaVqzWBsAxGXlI` là bài **偏見と葛藤**, không phải bài này. Track đúng: `0OZlguQeZGqf56prXBmKEM` (**97.953 giây**), khớp metadata MP3 98 giây. Đã sửa reference.
3. #6 và #8 có tên file cũ `Ai_Uta`, nhưng tên bài cấu hình thực tế là **URESHII! TANOSHII! DAISUKI!**. Chưa đổi tên file để tránh hỏng liên kết.
4. #5 `angel_01_Chiisana_Koi_no_Uta.mp3`: thời lượng cấu hình **300.800 giây**, khác bản Spotify **264.736 giây**. Không được lấy timestamp của Spotify áp thẳng lên file web.

## Bảng 31 bài
Cột chênh lệch là **thời lượng theo config trừ Spotify** (không phải đo MP3 thực tế); chỉ hiển thị sai khác từ 2 giây. “Căn dòng” **không đồng nghĩa đã căn đúng giọng hát**.

| ID | File MP3 | Trạng thái | Lệch với Spotify |
|---:|---|---|---:|
| 1 | `alya_01_Kawaikute_Gomen.mp3` | Căn dòng (49) | — |
| 2 | `alya_02_Chiisana_Koi_no_Uta.mp3` | Căn dòng (27) | — |
| 3 | `alya_03_World_is_Mine.mp3` | Căn dòng (35) | — |
| 4 | `CHE.R.RY.mp3` | Căn dòng (24) | — |
| 5 | `angel_01_Chiisana_Koi_no_Uta.mp3` | Căn dòng (33) | +36.1s |
| 6 | `angel_02_Ai_Uta.mp3` | Căn dòng (17) | — |
| 7 | `angel_03_Chiisana_Koi_no_Uta_Inst.mp3` | Instrumental / không lời | — |
| 8 | `angel_04_Ai_Uta_Inst.mp3` | Instrumental / không lời | — |
| 9 | `angel_05_Kimi_ni_Todoke_Inst.mp3` | Instrumental / không lời | — |
| 10 | `angel_06_Valentine_Kiss_Inst.mp3` | Instrumental / không lời | — |
| 11 | `angel_07_Gift_Inst.mp3` | Instrumental / không lời | — |
| 12 | `kaoruko_01_Hare_no_Hi_ni.mp3` | Căn dòng (20) | — |
| 13 | `kaoruko_02_Manazashi_wa_Hikari.mp3` | Chưa có lyrics | — |
| 14 | `kaoruko_03_Hitohira.mp3` | Instrumental / không lời | — |
| 15 | `kaoruko_04_Rintaro_to_Kaoruko.mp3` | Instrumental / không lời | — |
| 16 | `sakuramiku_01_Kimi_no_Sei_de_Aishiteru.mp3` | Căn dòng (24) | +4.5s |
| 17 | `sakuramiku_02_Little_World.mp3` | Căn dòng (22) | — |
| 18 | `shinobu_01_Tsuki_ni_Mukatte_Ute.mp3` | Căn dòng (22) | +2.7s |
| 19 | `shinobu_02_Koe_no_Kiseki.mp3` | Căn dòng (22) | — |
| 20 | `hinako_01_Saikoukyuu_no_Osewa_Shite.mp3` | Căn dòng (27) | -2.6s |
| 21 | `hinako_02_Kanpeki_ja_Nai_Watashi.mp3` | Căn dòng (26) | +4.6s |
| 22 | `Submarine_Youth.mp3` | Căn dòng (24) | — |
| 23 | `Zutto_Ichibanni_Shitene.mp3` | Căn dòng (28) | — |
| 24 | `五等分の気持ち.mp3` | Chưa có lyrics | — |
| 25 | `五等分のカタチ.mp3` | Chưa có lyrics | — |
| 26 | `はつこい.mp3` | Chưa có lyrics | — |
| 27 | `五等分の花嫁～ありがとうの花～.mp3` | Chưa có lyrics | — |
| 28 | `Lovely music～三週間前までは白かった～_.mp3` | Chưa có lyrics | — |
| 29 | `Memories.mp3` | Chưa có lyrics | — |
| 30 | `たからもの.mp3` | Chưa có lyrics | — |
| 31 | `五等分の未来.mp3` | Chưa có lyrics | — |

## Điều kiện hoàn tất V4 Lyrics
1. Có nguồn lời được phép sử dụng cho 9 bài thiếu (TTML/LRC/TXT).
2. Dùng **chính MP3 trong dự án** để đánh dấu thời điểm từng dòng, từng từ khi có dữ liệu.
3. Kiểm tra từng bản thu, quãng intro/outro, độ lệch, nhịp, và xác thực bằng nghe.
4. Nhập dữ liệu vào Lyrics Editor hiện có; lưu source/version và QA status từng track.
5. Sau khi căn thủ công, chạy `node scripts/qa/verify-lyrics-catalog.cjs` và kiểm tra trực tiếp trên mobile/desktop. QA cấu trúc **không thay thế** QA audio.

**Trạng thái: metadata & catalogue được kiểm toán; 31/31 lyrics chính xác CHƯA hoàn tất.**
