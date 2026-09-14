# TODO

Danh sách việc để trang thiệp ấn tượng hơn và sẵn sàng gửi khách.
Đánh dấu `[x]` khi xong. Cập nhật lần cuối: 2026-09-14.

## Việc kỹ thuật cần làm trước khi gửi khách

- [x] **Nối RSVP vào Google Sheets** qua Apps Script (`apps-script/rsvp.gs`). Đã deploy, `VITE_RSVP_ENDPOINT` đã set trên Vercel (Production) — test thật OK, RSVP vào đúng sheet.
- [x] **Nén ảnh**: chuyển hết ảnh trong `src/design/assets` sang WebP (script `npm run images`, dùng sharp), tổng còn 1.69 MB (từ ~13 MB).
- [x] **Thẻ Open Graph** trong `index.html`, dùng domain `https://thai-nhu-wedding.hoangthaile.com/`. Ảnh `public/og-image.jpg` (1200x630) crop từ `wedding-final`. Facebook Sharing Debugger xác nhận đọc đúng og:title/description/image. Riêng **Messenger** (messenger.com) vẫn chưa hiện ảnh preview dù debugger đã refresh — Messenger dùng cache/crawler riêng, không có tool public để ép refresh, có thể mất vài giờ tới 1-2 ngày tự cập nhật. Không phải lỗi code, kệ nó, link vẫn mở web bình thường.

## Tác động lớn

- [x] **Chữ hiện dần theo cuộn ở Story**: từng từ sáng dần khi cuộn qua, hook `src/hooks/useInkReveal.js`.
- [x] **Lightbox cho album**: bấm ảnh xem lớn, next/prev, đóng bằng Esc hoặc bấm ra ngoài (native `<dialog>`).
- [x] **Bật lại màn thiệp mở đầu**, tốc độ đóng 0.8s, redesign cho ấn tượng hơn: glow/vignette sau lưng, thiệp bay vào nghiêng nhẹ lúc xuất hiện rồi "thở" đều, hạc bay lượn quanh, nút mời fade-in rồi nhấp nháy, hover có vệt sáng lướt (desktop), bùng sáng vàng lúc chạm mở (`Layout.jsx`, `animations.css`). Ảnh thiệp giữ nguyên mẫu cũ.
- [ ] **Nhạc nền nhỏ có nút bật tắt** — chưa có file nhạc bản quyền hợp lệ, bỏ qua tới khi có.

## Tác động vừa, làm nếu có thời gian

- [x] **Parallax nhẹ cho lớp nền**: `src/hooks/useParallax.js`, áp cho `.site-backdrop`, tắt khi `prefers-reduced-motion`.
- [x] **Bản đồ nhúng** ở mục "Đường đến" trong Hướng dẫn (`GuestGuideSection`), iframe `google.com/maps?q=...&output=embed`.
- [x] **Sổ lưu bút công khai**: danh sách lời chúc dưới form RSVP (`RsvpSection`), đọc qua `doGet` trong cùng Apps Script đã deploy — dữ liệu thật, test OK.
- [ ] **Đổi ảnh Hero**: ảnh cưới thật ở Story và Stay đang là ảnh bên biển khá đẹp, nhưng ảnh Hero cắt mất mặt cô dâu chú rể. Ảnh gốc `wedding-portrait.png` vốn không có mặt (studio cắt từ ngực xuống), nên đổi vị trí cắt không đủ, phải đổi ảnh. Gợi ý: đưa ảnh làm lễ bên biển `wedding-final` lên Hero (vị trí cắt khoảng center 46% để giữ mặt), chuyển ảnh hoa xuống Stay. Sửa trong `app.css` và `location.css`.

## Đã quyết định không làm

- Đếm ngược tới ngày cưới.
