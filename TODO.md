# TODO

Danh sách việc để trang thiệp ấn tượng hơn và sẵn sàng gửi khách.
Đánh dấu `[x]` khi xong. Cập nhật lần cuối: 2026-09-14.

## Việc kỹ thuật cần làm trước khi gửi khách

- [ ] **Nối RSVP vào Google Sheets** qua Apps Script hoặc Formspree. RSVP hiện chưa lưu đi đâu, chỉ hiện thông báo rồi reset form, không thì mất hết phản hồi. File liên quan: `src/components/sections.jsx` (hàm `submitRsvp`).
- [ ] **Nén ảnh**: ba ảnh PNG từ 2 đến 4 MB mỗi tấm trong `src/design/assets`, tổng trang hơn 15 MB. Trên 4G khách sẽ nhìn trang trắng vài giây. Chuyển sang WebP và giảm về khoảng 1600px sẽ nhẹ đi khoảng mười lần.
  - Gợi ý cách làm: dùng `sharp` qua một script `npm run images`, đã thử nhanh cho kết quả tổng ảnh còn khoảng 1,7 MB.
- [ ] **Thẻ Open Graph** trong `index.html` (og:title, og:description, og:image, og:url) để khi gửi link qua Zalo hay Messenger hiện ảnh và tên cặp đôi thay vì link trống. Cần tạo ảnh 1200x630 đặt trong `public/` và biết domain khi deploy để điền đường dẫn tuyệt đối.

## Tác động lớn

- [ ] **Chữ hiện dần theo cuộn ở Story** với hiệu ứng mực lan hoặc từng từ mờ dần vào. Phần này nằm trên tranh hạc, là chỗ đẹp nhất của trang nhưng hiện chỉ xuất hiện một lần rồi đứng yên. Có thể tái dùng `useScrollReveal` và các selector trong `revealSelectors`.
- [ ] **Lightbox cho album** để bấm vào ảnh xem lớn, vuốt qua lại, đóng bằng Esc hoặc bấm ra ngoài. Sáu bức ảnh áo dài đỏ rất đẹp mà hiện khách chỉ xem được ở cỡ thumbnail. File: `GallerySection` trong `src/components/sections.jsx`.
- [ ] **Bật lại màn thiệp mở đầu** nhưng nhanh hơn, chừng 0.8 giây (hiện là 1.5 giây, dòng render đang comment trong `src/App.jsx`).
- [ ] **Nhạc nền nhỏ có nút bật tắt**, phát sau khi khách chạm mở thiệp. Mở thiệp rồi nhạc vang lên là khoảnh khắc khách nhớ nhất. Cần chọn file nhạc có bản quyền phù hợp, đặt trong `public/audio/`.

## Tác động vừa, làm nếu có thời gian

- [ ] **Parallax nhẹ cho lớp nền**: hạc và mây trôi chậm hơn nội dung khi cuộn, chừng 15 đến 20 phần trăm. Với lớp nền cố định `site-backdrop` sẵn có, chỉ cần một biến đổi translateY theo scroll, rất rẻ. Tôn trọng `prefers-reduced-motion`.
- [ ] **Bản đồ nhúng** ở phần Địa điểm thay cho chỉ một link, kèm nút "Chỉ đường" mở Google Maps. Dùng iframe `google.com/maps?q=...&output=embed`, không cần API key.
- [ ] **Sổ lưu bút công khai**: hiện RSVP chỉ báo cảm ơn rồi mất. Nếu lời chúc hiện thành danh sách dưới form, khách sẽ ở lại lâu hơn và có động lực gửi. Phụ thuộc việc nối RSVP vào Google Sheets ở trên.
- [ ] **Đổi ảnh Hero**: ảnh cưới thật ở Story và Stay đang là ảnh bên biển khá đẹp, nhưng ảnh Hero cắt mất mặt cô dâu chú rể. Ảnh gốc `wedding-portrait.png` vốn không có mặt (studio cắt từ ngực xuống), nên đổi vị trí cắt không đủ, phải đổi ảnh. Gợi ý: đưa ảnh làm lễ bên biển `wedding-final` lên Hero (vị trí cắt khoảng center 46% để giữ mặt), chuyển ảnh hoa xuống Stay. Sửa trong `app.css` và `location.css`.

## Đã quyết định không làm

- Đếm ngược tới ngày cưới.
