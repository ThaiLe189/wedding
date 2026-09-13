# TODO

Danh sách việc để trang thiệp ấn tượng hơn và sẵn sàng gửi khách.
Đánh dấu `[x]` khi xong. Cập nhật lần cuối: 2026-09-14.

## Cần làm trước khi gửi khách

- [ ] **Nối RSVP vào Google Sheets** (Apps Script hoặc Formspree). Hiện form chỉ hiện lời cảm ơn rồi reset, không lưu phản hồi.
- [ ] **Nén ảnh**: ba ảnh PNG trong `src/design/assets` nặng 2 đến 4 MB mỗi tấm, tổng trang hơn 15 MB. Chuyển sang WebP, giảm về khoảng 1600px chiều dài.
- [ ] **Thẻ Open Graph** trong `index.html` (og:title, og:description, og:image) để link gửi qua Zalo, Messenger hiện ảnh và tên cặp đôi.

## Tác động lớn

- [ ] **Lightbox cho album**: bấm ảnh xem lớn, vuốt qua lại, đóng bằng Esc.
- [ ] **Chữ hiện dần theo cuộn ở Story**: từng dòng mờ dần vào khi cuộn đến, phần này đang đứng yên trên tranh hạc.
- [ ] **Bật lại màn thiệp mở đầu** (đang comment trong `src/App.jsx`), rút thời gian mở còn khoảng 0.8 giây.
- [ ] **Nhạc nền nhỏ** phát sau khi mở thiệp, có nút bật tắt ở góc màn hình.

## Tác động vừa

- [ ] **Parallax nhẹ cho lớp nền** `site-backdrop`: hạc và mây trôi chậm hơn nội dung 15 đến 20 phần trăm khi cuộn.
- [ ] **Bản đồ nhúng** ở phần Địa điểm, kèm nút "Chỉ đường" mở Google Maps.
- [ ] **Sổ lưu bút công khai**: hiện lời chúc đã gửi thành danh sách dưới form RSVP.
- [ ] **Đổi vị trí cắt ảnh Hero** hoặc chọn ảnh khác thấy rõ mặt cô dâu chú rể.

## Đã quyết định không làm

- Đếm ngược tới ngày cưới.
