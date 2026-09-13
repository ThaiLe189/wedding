import byTheLake from '../design/assets/gallery/by-the-lake.jpg';
import proposal from '../design/assets/gallery/proposal.jpg';
import imperialArch from '../design/assets/gallery/imperial-arch.jpg';
import underTheParasol from '../design/assets/gallery/under-the-parasol.jpg';
import onTheSteps from '../design/assets/gallery/on-the-steps.jpg';
import togetherOnTheSteps from '../design/assets/gallery/together-on-the-steps.jpg';

export const wedding = {
  couple: {
    bride: 'Huyền Nhu',
    groom: 'Hoàng Thái',
    monogram: 'HN×HT',
  },
  date: {
    display: '22.11.2026',
    calendarStart: '20261122T030000Z',
    calendarEnd: '20261122T060000Z',
    rsvpDeadline: '30.10.2026',
  },
  venue: {
    name: 'Trống Đồng Palace Long Biên',
    address: 'Tầng 2, Tasco Mall, số 7-9 Nguyễn Văn Linh, Long Biên, Hà Nội',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Trong+Dong+Palace+Long+Bien%2C+Tasco+Mall%2C+7-9+Nguyen+Van+Linh%2C+Ha+Noi',
  },
};

export const schedule = [
  {
    time: '10:00',
    title: 'Đón bạn',
    description: 'Mời bạn đến sớm một chút, cùng trò chuyện và lưu lại những khoảnh khắc đầu ngày với chúng mình.',
  },
  {
    time: '10:30',
    title: 'Lễ thành hôn',
    description: 'Xin mời bạn cùng chứng kiến khoảnh khắc chúng mình nắm tay nhau và nói lời hẹn ước.',
    featured: true,
  },
  {
    time: '11:00',
    title: 'Tiệc mừng',
    description: 'Mời bạn ở lại chung vui trong bữa tiệc nhỏ, với những lời chúc lành và thật nhiều tiếng cười.',
  },
];

export const galleryPhotos = [
  { image: byTheLake, alt: 'Huyền Nhu và Hoàng Thái bên mặt hồ, dưới tán cây xanh', layout: 'ring' },
  { image: proposal, alt: 'Hoàng Thái trao nhẫn cho Huyền Nhu giữa khu vườn', layout: 'proposal' },
  { image: imperialArch, alt: 'Huyền Nhu và Hoàng Thái bên cổng vòm cổ', layout: 'arch' },
  { image: underTheParasol, alt: 'Cặp đôi dưới chiếc ô giấy trong nắng', layout: 'parasol' },
  { image: onTheSteps, alt: 'Khoảnh khắc thân mật của cặp đôi trên bậc thềm', layout: 'steps' },
  { image: togetherOnTheSteps, alt: 'Huyền Nhu và Hoàng Thái ngồi bên nhau giữa những bậc đá', layout: 'together' },
];

export const revealSelectors = [
  '.story > .section-intro',
  '.story > .story-heading',
  '.story > .story-copy',
  '.details > .details-heading',
  '.schedule-item',
  '.details > .venue',
  '.guest-guide > .guide-heading',
  '.guide-item',
  '.gallery > .gallery-intro',
  '.gallery > .gallery-grid',
  '.stay > *',
  '.rsvp > *',
].join(', ');
