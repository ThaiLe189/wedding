import { wedding } from '../data/wedding.js';

const calendarEvent = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  `DTSTART:${wedding.date.calendarStart}`,
  `DTEND:${wedding.date.calendarEnd}`,
  `SUMMARY:Đám cưới ${wedding.couple.bride} & ${wedding.couple.groom}`,
  `LOCATION:${wedding.venue.name}, ${wedding.venue.address}`,
  'DESCRIPTION:Lễ thành hôn lúc 15:30, sau đó là tiệc mừng.',
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
