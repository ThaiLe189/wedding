/**
 * RSVP backend for the wedding invitation site.
 * Deploy as a Google Apps Script Web App bound to a Google Sheet.
 * See apps-script/README.md for setup steps.
 */

const SHEET_NAME = 'RSVP';
const HEADERS = ['Timestamp', 'Name', 'Attendance', 'GuestCount', 'Notes'];

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  let target = sheet.getSheetByName(SHEET_NAME);
  if (!target) {
    target = sheet.insertSheet(SHEET_NAME);
    target.appendRow(HEADERS);
  }
  return target;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || '').trim();
    const attendance = String(data.attendance || '').trim();
    const guestCount = String(data.guestCount || '').trim();
    const notes = String(data.notes || '').trim();

    if (!name || !attendance) {
      return jsonResponse_({ ok: false, error: 'Thiếu tên hoặc trạng thái tham dự.' });
    }

    getSheet_().appendRow([new Date(), name, attendance, guestCount, notes]);
    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function doGet() {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const wishes = rows
    .filter((row) => row[2] === 'Có mặt' && String(row[4] || '').trim())
    .map((row) => ({ name: String(row[1] || '').trim(), notes: String(row[4] || '').trim() }))
    .reverse()
    .slice(0, 50);

  return jsonResponse_({ ok: true, wishes });
}
