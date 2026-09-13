import engagementRing from '../design/assets/gallery/engagement-ring.jpg';
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
    calendarStart: '20261122T083000Z',
    calendarEnd: '20261122T163000Z',
    rsvpDeadline: '30.10.2026',
  },
  venue: {
    name: 'Tasco Mall Long Biên',
    address: 'Số 7-9 Nguyễn Văn Linh, Long Biên, Hà Nội',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tasco+Mall+Long+Bien%2C+7-9+Nguyen+Van+Linh%2C+Ha+Noi',
  },
};

export const schedule = [
  {
    time: '15:30',
    title: 'Lễ thành hôn',
    description: 'Gặp nhau tại khu vườn, cùng chứng kiến khoảnh khắc chúng mình nói lời đồng ý.',
  },
  {
    time: '17:00',
    title: 'Tiệc mừng',
    description: 'Một bữa tối ấm áp, những lời chúc lành và thật nhiều tiếng cười.',
    featured: true,
  },
  {
    time: '23:30',
    title: 'Tiệc đêm',
    description: 'Dành cho những người bạn muốn cùng chúng mình giữ lại đêm vui lâu hơn một chút.',
  },
];

export const galleryPhotos = [
  { image: engagementRing, alt: 'Chiếc nhẫn trong khoảnh khắc đôi bạn mỉm cười', layout: 'ring' },
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
