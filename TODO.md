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
- [x] **Màn thiệp mở đầu** — thay bằng thiệp gấp 2.5D (Web Component `src/intro/wedding-intro.js`, ảnh `src/design/assets/intro/`): bìa trái lật rồi tấm phải mở, bên trong để trống theo yêu cầu (đã bỏ khung hạc pop-up, oval tên và chữ ở mặt sau). Chạm/bấm/kéo bìa hoặc bấm "MỞ THIỆP" để mở; mở xong là fade vào web chính ngay, không zoom, không cần bấm thêm (2026-09-14). Đã bỏ màn intro cũ (ảnh `invitation-antique-gold` không còn dùng). Tắt: comment dòng `<SiteIntro>` trong `App.jsx`.
- [x] **Nhạc nền nhỏ có nút bật tắt**: Gymnopédie No. 1 của Satie (piano, Michael Laucke chơi, public domain, không cần ghi công; nguồn ghi trong comment ở `wedding.js`), file `src/design/assets/music/satie-gymnopedie-1.mp3`. Tự bật ở cú chạm mở thiệp, nút tròn góc dưới phải, nhớ lựa chọn tắt, dừng khi ẩn tab (`MusicToggle` trong `Layout.jsx`, thông tin bài trong `music` ở `wedding.js`). Trên iPhone không fade được âm lượng (iOS bỏ qua `audio.volume`) (2026-10-19).

## Tác động vừa, làm nếu có thời gian

- [x] **Parallax nhẹ cho lớp nền**: `src/hooks/useParallax.js`, áp cho `.site-backdrop`, tắt khi `prefers-reduced-motion`.
- [x] **Bản đồ nhúng** ở mục "Đường đến" trong Hướng dẫn (`GuestGuideSection`), iframe `google.com/maps?q=...&output=embed`. Đã thay bằng **bản đồ 3D thu nhỏ** (Three.js, dữ liệu OpenStreetMap thật, hiệu ứng tilt-shift, tuyến đường Nguyễn Văn Cừ → nút giao Long Biên → Nguyễn Văn Linh → Tasco): `src/venue-map/` (city.js: nhà/đường/cầu/đường sắt; life.js: cây, đèn, bãi xe, xe cộ, người, tàu; venue.js: Tasco dựng theo ảnh flycam thật — khối 3 tầng ốp nhôm, mặt tiền kính xen biển hiệu, chữ TASCO MALL đỏ trên mái, bãi đỗ ô tô trên mái, quảng trường + hàng cau, hàng rào trắng; sảnh cưới thảm đỏ, cổng hoa), 3 góc nhìn Toàn cảnh / Bãi gửi xe / Sảnh cưới, chỉ tải khi cuộn tới; lỗi WebGL thì tự quay về iframe. Lấy lại dữ liệu bản đồ: `npm run venue-map` (2026-10-16).
- [x] **Sổ lưu bút công khai**: danh sách lời chúc dưới form RSVP (`RsvpSection`), đọc qua `doGet` trong cùng Apps Script đã deploy — dữ liệu thật, test OK.
- [x] **Đổi ảnh Hero** (và Story, Stay) bằng ảnh thật từ Drive của studio (bộ chụp vịnh, 32 ảnh): Hero = L2280062 (đứng chính diện bên vịnh, giữa hoa) → `hero-couple.webp`; dải ảnh Story = L2270824 (hôn trán bên biển) → `story-together.webp`; Stay = L2280166 (bóng hai người lúc hoàng hôn) → `stay-sunset.webp`. Đã xoá ảnh cũ không còn dùng (`wedding-portrait`, `wedding-hero`, `wedding-final`). Album áo dài giữ nguyên (2026-10-22).

## Đã quyết định không làm

- Đếm ngược tới ngày cưới.
