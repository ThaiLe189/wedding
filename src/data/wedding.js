import byTheLake from '../design/assets/gallery/by-the-lake.webp';
import proposal from '../design/assets/gallery/proposal.webp';
import imperialArch from '../design/assets/gallery/imperial-arch.webp';
import underTheParasol from '../design/assets/gallery/under-the-parasol.webp';
import onTheSteps from '../design/assets/gallery/on-the-steps.webp';
import onTheBridge from '../design/assets/gallery/on-the-bridge.webp';
import moiDuyenVang from '../design/assets/music/moi-duyen-vang.mp3';

export const wedding = {
  couple: {
    bride: 'Huyền Nhu',
    groom: 'Hoàng Thái',
    monogram: 'HT×HN',
  },
  date: {
    display: '22.11.2026',
    calendarStart: '20261122T030000Z',
    calendarEnd: '20261122T060000Z',
  },
  venue: {
    name: 'Trống Đồng Palace Long Biên',
    address: 'Tầng 2, Tasco Mall, số 7-9 Nguyễn Văn Linh, Long Biên, Hà Nội',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Trong+Dong+Palace+Long+Bien%2C+Tasco+Mall%2C+7-9+Nguyen+Van+Linh%2C+Ha+Noi',
    // 3D map in the "Đường đến" guide item. Coordinates are metres from Tasco Mall (x = east, z = south),
    // same frame as src/venue-map/venue-map.json. Points follow the OSM carriageway centrelines.
    // Car route: Nguyễn Văn Cừ → Long Biên interchange → southbound Nguyễn Văn Linh past Tasco (it is across the
    // median) → U-turn in the left-turn lanes at the Phố Việt Hưng junction → northbound frontage → first right, through the car gate in the middle of the fence (just right of the plaza) → up the lane beside the plaza to the doors.
    // Labels with view: 'parking' / 'entrance' (or an array of views) only show in that camera preset.
    map: {
      route: [[-640, -365], [-595, -412], [-548, -428], [-493, -364], [-440, -289], [-379, -208], [-263, -42], [-175, 92], [-159, 100], [-137, 135], [-124, 155], [-104, 188], [-95, 202], [-84, 205], [-78, 192], [-88, 168], [-102, 149], [-112, 133], [-130, 104], [-129, 92], [-119, 83], [-93, 67], [-59, 46], [-50, 38], [-48, 30]],
      // Motorbikes: same U-turn, then north on Nguyễn Văn Linh and right into the slip lane to the bike lot (north-west corner)
      motoRoute: [[-88, 168], [-102, 149], [-150, 75], [-193, 8], [-185, 3], [-167, -10], [-142, -26], [-115, -42], [-92, -50]],
      labels: [
        { text: 'Trống Đồng Palace', at: [0, 0], h: 34, tone: 'venue' },
        { text: 'Nút giao Long Biên', at: [-560, -460], h: 10 },
        { text: 'Từ cầu Chương Dương', at: [-610, -390], h: 4, tone: 'road' },
        { text: 'Nguyễn Văn Linh', at: [-330, -160], h: 4, tone: 'road' },
        { text: 'Vũ Đức Thận', at: [-150, -460], h: 4, tone: 'road' },
        { text: 'Gửi ô tô', at: [-105, 55], h: 6, tone: 'parking', view: 'parking' },
        { text: 'Cổng xe máy', at: [-82, -46], h: 6, tone: 'turn', view: ['overview', 'parking'], gate: true },
        { text: 'Bãi ô tô phụ', at: [75, 95], h: 1, tone: 'parking', view: 'parking' },
        { text: 'Bãi đỗ trên mái', at: [35, 30], h: 19, tone: 'parking', view: 'parking' },
        { text: 'Nguyễn Văn Linh', at: [-215, 60], h: 4, tone: 'road', view: 'parking' },
        { text: '↶ Quay đầu ở ngã ba Việt Hưng', at: [-80, 225], h: 1, tone: 'turn', view: ['overview', 'parking'] },
        { text: 'Cổng ô tô', at: [-119, 83], h: 14, tone: 'turn', view: ['overview', 'parking'], gate: true },
        { text: 'Thảm đỏ · cổng hoa', at: [-66, 34], h: 1, view: 'entrance' },
      ],
    },
  },
};

// Nhạc nền cho thiệp; người xem có thể bật/tắt ở góc dưới màn hình, kể cả lúc đang mở thiệp.
export const music = {
  src: moiDuyenVang,
  credit: null,
};

export const schedule = [
  {
    time: '10:00',
    title: 'Đón khách',
    description: 'Đón tiếp và chụp ảnh cùng cô dâu, chú rể trước giờ làm lễ.',
  },
  {
    time: '10:30',
    title: 'Lễ thành hôn',
    description: 'Cùng hai gia đình chứng kiến nghi thức thành hôn của chúng mình.',
    featured: true,
  },
  {
    time: '11:00',
    title: 'Tiệc mừng',
    description: 'Mời bạn dùng bữa và nâng ly chúc mừng cùng hai gia đình.',
  },
];

// `focus` là object-position cho ảnh trong lưới gallery (desktop crop ảnh khá mạnh ở các ô ngang):
// chỉnh để không cắt mất mặt. Bỏ trống = canh giữa.
export const galleryPhotos = [
  { image: byTheLake, alt: 'Hoàng Thái và Huyền Nhu bên mặt hồ, dưới tán cây xanh', layout: 'ring' },
  { image: proposal, alt: 'Hoàng Thái trao nhẫn cho Huyền Nhu giữa khu vườn', layout: 'proposal', focus: '50% 15%' },
  { image: imperialArch, alt: 'Hoàng Thái và Huyền Nhu bên cổng vòm cổ', layout: 'arch' },
  { image: underTheParasol, alt: 'Cặp đôi nhìn nhau dưới chiếc ô giấy bên lan can cầu gỗ', layout: 'parasol', focus: '50% 40%' },
  { image: onTheSteps, alt: 'Khoảnh khắc thân mật của cặp đôi trên bậc thềm', layout: 'steps' },
  { image: onTheBridge, alt: 'Hoàng Thái và Huyền Nhu sánh bước trên cây cầu gỗ bắc qua hồ', layout: 'together', focus: '50% 55%' },
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
