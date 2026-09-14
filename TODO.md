# TODO

Danh sách việc để trang thiệp ấn tượng hơn và sẵn sàng gửi khách.
Đánh dấu `[x]` khi xong. Cập nhật lần cuối: 2026-09-14.

## Việc kỹ thuật cần làm trước khi gửi khách

- [ ] **Nối RSVP vào Google Sheets** qua Apps Script. Code đã viết xong (`apps-script/rsvp.gs`, form đã gọi `fetch` tới `VITE_RSVP_ENDPOINT`) — còn thiếu bước tự deploy: làm theo `apps-script/README.md`, lấy Web app URL rồi điền vào `.env` (copy từ `.env.example`). Chưa deploy thì RSVP vẫn chỉ hiện cảm ơn tại chỗ, không lưu.
- [x] **Nén ảnh**: chuyển hết ảnh trong `src/design/assets` sang WebP (script `npm run images`, dùng sharp), tổng còn 1.69 MB (từ ~13 MB).
- [x] **Thẻ Open Graph** trong `index.html`, dùng domain `https://thai-nhu-wedding.hoangthaile.com/`. Ảnh `public/og-image.jpg` (1200x630) crop từ `wedding-final`.

## Tác động lớn

- [x] **Chữ hiện dần theo cuộn ở Story**: từng từ sáng dần khi cuộn qua, hook `src/hooks/useInkReveal.js`.
- [x] **Lightbox cho album**: bấm ảnh xem lớn, next/prev, đóng bằng Esc hoặc bấm ra ngoài (native `<dialog>`).
- [ ] **Bật lại màn thiệp mở đầu** — tạm giữ tắt theo yêu cầu (2026-09-14), chưa có nhạc nền nên chưa bật lại.
- [ ] **Nhạc nền nhỏ có nút bật tắt** — chưa có file nhạc bản quyền hợp lệ, bỏ qua tới khi có.

## Tác động vừa, làm nếu có thời gian

- [x] **Parallax nhẹ cho lớp nền**: `src/hooks/useParallax.js`, áp cho `.site-backdrop`, tắt khi `prefers-reduced-motion`.
- [x] **Bản đồ nhúng** ở mục "Đường đến" trong Hướng dẫn (`GuestGuideSection`), iframe `google.com/maps?q=...&output=embed`.
- [x] **Sổ lưu bút công khai**: danh sách lời chúc dưới form RSVP (`RsvpSection`), đọc qua `doGet` trong cùng Apps Script — cần deploy RSVP ở trên thì mới có dữ liệu thật, còn giờ vẫn hiện ngay lời vừa gửi (optimistic).
- [ ] **Đổi ảnh Hero**: ảnh cưới thật ở Story và Stay đang là ảnh bên biển khá đẹp, nhưng ảnh Hero cắt mất mặt cô dâu chú rể. Ảnh gốc `wedding-portrait.png` vốn không có mặt (studio cắt từ ngực xuống), nên đổi vị trí cắt không đủ, phải đổi ảnh. Gợi ý: đưa ảnh làm lễ bên biển `wedding-final` lên Hero (vị trí cắt khoảng center 46% để giữ mặt), chuyển ảnh hoa xuống Stay. Sửa trong `app.css` và `location.css`.

## Đã quyết định không làm

- Đếm ngược tới ngày cưới.
