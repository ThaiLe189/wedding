import { wedding } from '../data/wedding.js';

const calendarEvent = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  `DTSTART:${wedding.date.calendarStart}`,
  `DTEND:${wedding.date.calendarEnd}`,
  `SUMMARY:Đám cưới ${wedding.couple.groom} & ${wedding.couple.bride}`,
  `LOCATION:${wedding.venue.name}, ${wedding.venue.address}`,
  'DESCRIPTION:Đón bạn lúc 10:00, lễ thành hôn lúc 10:30 và tiệc mừng lúc 11:00.',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

export function downloadWeddingCalendar() {
  const url = URL.createObjectURL(new Blob([calendarEvent], { type: 'text/calendar;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: 'dam-cuoi-huyen-nhu-hoang-thai.ics',
  });

  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
