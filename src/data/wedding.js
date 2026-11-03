import sea01 from '../design/assets/gallery/sea/01.webp';
import sea02 from '../design/assets/gallery/sea/02.webp';
import sea03 from '../design/assets/gallery/sea/03.webp';
import sea04 from '../design/assets/gallery/sea/04.webp';
import sea05 from '../design/assets/gallery/sea/05.webp';
import sea06 from '../design/assets/gallery/sea/06.webp';
import sea07 from '../design/assets/gallery/sea/07.webp';
import studio01 from '../design/assets/gallery/studio/01.webp';
import studio02 from '../design/assets/gallery/studio/02.webp';
import studio03 from '../design/assets/gallery/studio/03.webp';
import studio04 from '../design/assets/gallery/studio/04.webp';
import studio05 from '../design/assets/gallery/studio/05.webp';
import studio06 from '../design/assets/gallery/studio/06.webp';
import studio07 from '../design/assets/gallery/studio/07.webp';
import heritage01 from '../design/assets/gallery/heritage/01.webp';
import heritage02 from '../design/assets/gallery/heritage/02.webp';
import heritage03 from '../design/assets/gallery/heritage/03.webp';
import heritage05 from '../design/assets/gallery/heritage/05.webp';
import heritage06 from '../design/assets/gallery/heritage/06.webp';
import heritage07 from '../design/assets/gallery/heritage/07.webp';
import heritage08 from '../design/assets/gallery/heritage/08.webp';
import heritage10 from '../design/assets/gallery/heritage/10.webp';
import heritage11 from '../design/assets/gallery/heritage/11.webp';
import heritage12 from '../design/assets/gallery/heritage/12.webp';
import moiDuyenVang from '../design/assets/music/moi-duyen-vang.mp3';

export const wedding = {
  couple: {
    bride: 'Huyền Nhu',
    groom: 'Hoàng Thái',
    monogram: 'HT×HN',
  },
  date: {
    display: '22.11.2026',
    longDisplay: 'Chủ nhật, 22 tháng 11 năm 2026',
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
    description: 'Đón tiếp và chụp ảnh cùng cô dâu, chú rể trước giờ làm lễ.',
  },
  {
    time: '10:30',
    title: 'Lễ thành hôn',
    description: 'Cùng hai gia đình chứng kiến nghi thức thành hôn của chúng mình.',
    featured: true,
  },
  {
    time: '11:00',
    title: 'Tiệc mừng',
    description: 'Mời bạn dùng bữa và nâng ly chúc mừng cùng hai gia đình.',
  },
];

export const galleryAlbums = [
  {
    id: 'sea',
    title: 'Lời hẹn bên Vịnh',
    caption: 'Gió biển, nắng chiều và những khoảnh khắc đầu tiên của hành trình chung đôi.',
    photos: [
      { image: sea01, alt: 'Hoàng Thái và Huyền Nhu trao nhau bó hoa bên bờ vịnh' },
      { image: sea02, alt: 'Hoàng Thái và Huyền Nhu khiêu vũ giữa khung cảnh biển trời' },
      { image: sea03, alt: 'Cặp đôi đọc lời hẹn ước bên biển và những khóm hoa' },
      { image: sea04, alt: 'Khoảnh khắc Huyền Nhu mỉm cười trong vòng tay Hoàng Thái' },
      { image: sea05, alt: 'Nụ hôn dưới khăn voan bên bờ vịnh' },
      { image: sea06, alt: 'Chân dung Huyền Nhu bên hoa và ghềnh đá' },
      { image: sea07, alt: 'Đôi tay nắm nhau giữa hoa cưới và nắng biển' },
      { image: studio02, alt: 'Cặp đôi dưới khăn voan trong ánh hoàng hôn bên vịnh' },
      { image: studio07, alt: 'Chân dung Hoàng Thái cầm hoa bên bờ vịnh' },
    ],
  },
  {
    id: 'studio',
    title: 'Vườn hoa trong nắng',
    caption: 'Một khoảng trời trong trẻo, nơi bình yên bắt đầu từ ánh mắt dành cho nhau.',
    photos: [
      { image: studio01, alt: 'Hoàng Thái hôn tay Huyền Nhu giữa không gian studio ngập sáng' },
      { image: studio03, alt: 'Hoàng Thái và Huyền Nhu nắm tay, mỉm cười trong studio' },
      { image: studio04, alt: 'Chân dung Huyền Nhu giữa khu vườn hoa trắng và hồng' },
      { image: studio05, alt: 'Hoàng Thái ôm Huyền Nhu từ phía sau bên bó hoa cưới' },
      { image: studio06, alt: 'Cặp đôi đứng đối diện nhau giữa hai cụm hoa' },
    ],
  },
  {
    id: 'heritage',
    title: 'Nét xưa dịu dàng',
    caption: 'Sắc son truyền thống giữa nét trầm mặc của Cố đô.',
    photos: [
      { image: heritage01, alt: 'Hoàng Thái và Huyền Nhu trong áo dài đỏ bên cổng thành cổ' },
      { image: heritage02, alt: 'Cặp đôi áo dài đỏ đứng bên mặt hồ cổ kính' },
      { image: heritage03, alt: 'Chân dung Huyền Nhu và Hoàng Thái trong sắc áo dài đỏ' },
      { image: heritage05, alt: 'Cặp đôi sánh bước trên cầu giữa không gian xanh' },
      { image: heritage06, alt: 'Hoàng Thái và Huyền Nhu bên cổng điện cổ' },
      { image: heritage07, alt: 'Cặp đôi ngồi bên bậc đá chạm hình rồng' },
      { image: heritage08, alt: 'Khoảnh khắc thân mật của cặp đôi trên bậc thềm đá' },
      { image: heritage10, alt: 'Cặp đôi trò chuyện dưới chiếc ô giấy' },
      { image: heritage11, alt: 'Cặp đôi nắm tay dưới cổng vòm nhìn ra tháp cổ' },
      { image: heritage12, alt: 'Hoàng Thái trao nhẫn cho Huyền Nhu giữa đồi xanh' },
    ],
  },
];

// Giữ album gọn, mỗi phần chỉ hiển thị bốn khung hình tiêu biểu.
galleryAlbums.forEach((album) => {
  album.photos = album.photos.slice(0, 4);
});

export const galleryPhotos = galleryAlbums.flatMap((album) => album.photos);

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
  '.gallery-album',
  '.stay > *',
  '.rsvp > *',
].join(', ');
