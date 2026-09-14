# RSVP Google Apps Script setup

1. Tạo một Google Sheet mới (trống là được, script tự tạo sheet con `RSVP` với header).
2. Trong Sheet, mở **Extensions → Apps Script**.
3. Xoá code mẫu, dán toàn bộ nội dung file `rsvp.gs` vào.
4. Lưu project (đặt tên tuỳ ý, ví dụ "RSVP wedding").
5. Bấm **Deploy → New deployment**.
   - Chọn loại: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Bấm **Deploy**, cấp quyền khi được hỏi.
7. Copy **Web app URL** (dạng `https://script.google.com/macros/s/XXXXXXXX/exec`).
8. Đưa URL đó vào file `.env` ở gốc project (copy từ `.env.example`):
   ```
   VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/XXXXXXXX/exec
   ```
9. Chạy lại `npm run dev` (Vite chỉ đọc `.env` lúc khởi động) và thử gửi RSVP — dữ liệu sẽ vào sheet `RSVP`.

Mỗi lần sửa code trong Apps Script editor, phải **Deploy → Manage deployments → Edit → New version** thì thay đổi mới có hiệu lực trên URL cũ.
