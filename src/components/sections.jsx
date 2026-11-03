import React, { useEffect, useRef, useState } from 'react';
import { galleryAlbums, galleryPhotos, wedding, schedule } from '../data/wedding.js';
import venuePhoto from '../design/assets/venue-trong-dong-clean.jpg';
import { RsvpBloom } from './Decorations.jsx';

const RSVP_ENDPOINT = import.meta.env.VITE_RSVP_ENDPOINT;

async function postRsvp(payload) {
  if (!RSVP_ENDPOINT) return;
  try {
    await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Gửi RSVP thất bại', error);
  }
}

export function HeroSection() {
  const recipient = new URLSearchParams(window.location.search).get('to')?.replace(/\s+/g, ' ').trim().slice(0, 60);
  const companion = new URLSearchParams(window.location.search).get('with')?.replace(/\s+/g, ' ').trim().slice(0, 60);
  const invitedGuests = [recipient, companion].filter(Boolean).join(' và ');
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-photo" role="img" aria-label="Hoàng Thái và Huyền Nhu đứng bên bờ vịnh, giữa những khóm hoa"></div>
      <div className="hero-copy">
        <p className="kicker hero-date"><span className="hero-event">Tiệc mời</span><span className="hero-weekday">Chủ nhật</span><span className="hero-date-value">22 tháng 11 năm 2026</span></p>
        <h1 id="hero-title"><span>{wedding.couple.groom}</span><em>&amp;</em><span>{wedding.couple.bride}</span></h1>
        {invitedGuests && <p className="hero-recipient"><span>Trân trọng kính mời:</span><strong>{invitedGuests}</strong></p>}
        <div className="hero-sub">
          <p>Ngày vui sẽ thêm trọn vẹn khi có sự hiện diện của gia đình, người thân và bạn bè.</p>
          <p>Chúng tôi rất mong được đón mọi người đến chung vui, cùng chia sẻ những khoảnh khắc ý nghĩa trong ngày đặc biệt này.</p>
        </div>
        <div className="hero-actions"><a className="button button-primary" href="#rsvp">Xác nhận tham dự <span>→</span></a><a className="quiet-link" href="#details">Xem lịch trình</a></div>
      </div>
      <div className="hero-stamp" aria-label={wedding.date.longDisplay}><b>22</b><span>Chủ nhật<br />Tháng mười một<br />năm 2026</span></div>
    </section>
  );
}

export function StorySection() {
  return (
    <section id="story" className="story section-pad" aria-labelledby="story-title">
      <div className="section-intro"><p className="section-number">01</p><p className="kicker">Chuyện của chúng mình</p></div>
      <div className="story-heading"><p className="handwritten">Có những điều giản dị,</p><h2 id="story-title">rồi bỗng trở thành<br /><em>cả một đời.</em></h2><div className="story-photo" role="img" aria-label="Hoàng Thái khẽ hôn lên trán Huyền Nhu bên bờ biển"></div></div>
      <div className="story-copy">
        <p>Từ những cuộc hẹn đầu tiên đến những bữa cơm đầy tiếng cười, chúng tôi đã cùng nhau đi qua những tháng năm bình dị và chọn nắm tay nhau bước tiếp.</p>
        <p>Hạnh phúc ấy sẽ càng ý nghĩa hơn khi có gia đình, người thân và bạn bè ở bên, cùng sẻ chia niềm vui trong ngày đặc biệt này.</p>
        <a className="inline-link" href="#rsvp">Đến chung vui cùng chúng mình <span>↗</span></a>
      </div>
    </section>
  );
}

export function DetailsSection({ onDownloadCalendar }) {
  return (
    <section id="details" className="details section-pad" aria-labelledby="details-title">
      <div className="details-heading"><p className="kicker details-date">{wedding.date.longDisplay}</p><h2 id="details-title">Tiệc mời<br />&amp; <em>ngày chung vui.</em></h2></div>
      <div className="schedule">
        {schedule.map((item) => <article className={`schedule-item${item.featured ? ' featured' : ''}`} key={item.time}><p className="time">{item.time}</p><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}
      </div>
      <div className="venue"><div><p className="kicker">Địa điểm</p><p className="venue-name">{wedding.venue.name}</p><p className="venue-address">{wedding.venue.address}</p></div><button className="button button-outline" type="button" onClick={onDownloadCalendar}>Thêm vào lịch <span>↗</span></button></div>
    </section>
  );
}

const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${wedding.venue.name}, ${wedding.venue.address}`)}&output=embed`;

// 3D miniature of the neighbourhood (Three.js), loaded only when the guide scrolls near.
// Falls back to the Google Maps embed when WebGL or the chunk fails.
function VenueMap() {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    let cancelled = false;
    let dispose;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      import('../venue-map/venue-diorama.js')
        .then(({ mountVenueDiorama }) => {
          if (cancelled) return;
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          dispose = mountVenueDiorama(el, { ...wedding.venue.map, welcome: `${wedding.couple.groom} & ${wedding.couple.bride}`, reducedMotion });
        })
        .catch(() => { if (!cancelled) setFailed(true); });
    }, { rootMargin: '400px' });
    observer.observe(el);
    return () => { cancelled = true; observer.disconnect(); dispose?.(); };
  }, []);

  if (failed) {
    return <div className="map-embed"><iframe title={`Bản đồ đến ${wedding.venue.name}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>;
  }
  return (
    <figure className="venue-diorama-frame">
      <div ref={ref} className="venue-diorama" role="img" aria-label="Bản đồ 3D: từ Nguyễn Văn Cừ qua nút giao Long Biên, theo đường Nguyễn Văn Linh tới Tasco Mall, nơi có Trống Đồng Palace" />
      <figcaption>Kéo để xoay (điện thoại: hai ngón) · Ctrl + cuộn để phóng to</figcaption>
    </figure>
  );
}

export function GuestGuideSection() {
  return (
    <section id="guide" className="guest-guide section-pad" aria-labelledby="guide-title">
      <div className="guide-heading"><h2 id="guide-title">Đường đến<br /><em>tiệc cưới.</em></h2></div>
      <div className="guide-list">
        <article className="guide-item"><p className="guide-index">Địa điểm &amp; gửi xe</p><div><h3>{wedding.venue.name}</h3><p>{wedding.venue.address}. Chọn “Bãi gửi xe” trên bản đồ để xem lối vào cho ô tô và xe máy.</p><div className="venue-visuals"><figure className="venue-photo"><img src={venuePhoto} alt="Không gian sân khấu tiệc cưới tại Trống Đồng Palace Long Biên" loading="lazy" /><figcaption>Không gian tiệc tại Trống Đồng Palace Long Biên</figcaption></figure><VenueMap /></div><a className="inline-link" href={wedding.venue.mapsUrl} target="_blank" rel="noreferrer">Chỉ đường trên Google Maps <span>↗</span></a></div></article>
      </div>
    </section>
  );
}

export function GallerySection() {
  const dialogRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const openPhoto = (index) => {
    setActiveIndex(index);
    dialogRef.current?.showModal();
  };

  const showRelative = (delta) => {
    setActiveIndex((index) => (index === null ? index : (index + delta + galleryPhotos.length) % galleryPhotos.length));
  };

  const onDialogKeyDown = (event) => {
    if (event.key === 'ArrowRight') showRelative(1);
    if (event.key === 'ArrowLeft') showRelative(-1);
  };

  const onDialogClick = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  };

  const activePhoto = activeIndex === null ? null : galleryPhotos[activeIndex];

  return (
    <section id="gallery" className="gallery section-pad" aria-labelledby="gallery-title">
      <div className="gallery-intro scroll-reveal"><h2 id="gallery-title">Những khung hình<br /><em>của chúng mình.</em></h2></div>
      <div className="gallery-albums">
        {galleryAlbums.map((album, albumIndex) => {
          const startIndex = galleryAlbums.slice(0, albumIndex).reduce((total, item) => total + item.photos.length, 0);
          return (
            <section className={`gallery-album gallery-album--${album.id} scroll-reveal`} key={album.id} aria-labelledby={`album-${album.id}`}>
              <header className="gallery-album-heading">
                <span>0{albumIndex + 1}</span>
                <div><h3 id={`album-${album.id}`}>{album.title}</h3><p>{album.caption}</p></div>
              </header>
              <div className="gallery-album-grid">
                {album.photos.map((photo, index) => (
                  <figure className="gallery-photo" key={photo.image}>
                    <button type="button" className="gallery-photo-trigger" onClick={() => openPhoto(startIndex + index)} aria-label={`Xem lớn: ${photo.alt}`}>
                      <img src={photo.image} alt={photo.alt} loading="lazy" />
                    </button>
                  </figure>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <dialog ref={dialogRef} className="lightbox" onClose={() => setActiveIndex(null)} onClick={onDialogClick} onKeyDown={onDialogKeyDown}>
        {activePhoto && (
          <>
            <button type="button" className="lightbox-close" onClick={() => dialogRef.current.close()} aria-label="Đóng">×</button>
            <button type="button" className="lightbox-nav lightbox-prev" onClick={() => showRelative(-1)} aria-label="Ảnh trước">‹</button>
            <img className="lightbox-image" src={activePhoto.image} alt={activePhoto.alt} />
            <button type="button" className="lightbox-nav lightbox-next" onClick={() => showRelative(1)} aria-label="Ảnh sau">›</button>
          </>
        )}
      </dialog>
    </section>
  );
}

export function StaySection() {
  return (
    <section id="stay" className="stay" aria-labelledby="stay-title">
      <div className="stay-copy section-pad">
        <h2 id="stay-title">Gửi những người<br /><em>thương yêu.</em></h2>
        <div className="stay-message">
          <p>Chúng con xin gửi lời cảm ơn chân thành đến ông bà, cha mẹ và gia đình đã luôn yêu thương, chở che và dành cho chúng con những điều tốt đẹp nhất.</p>
          <p>Chúng em cũng xin cảm ơn thầy cô, cô chú, anh chị cùng những người bạn thân yêu đã luôn quan tâm, đồng hành và dành cho chúng em những tình cảm quý báu.</p>
          <p>Được đón mọi người đến chung vui và nhận những lời chúc phúc trong ngày cưới là niềm hạnh phúc mà chúng tôi luôn trân trọng.</p>
        </div>
      </div>
      <div className="stay-photo" role="img" aria-label="Bóng Hoàng Thái và Huyền Nhu trong hoàng hôn trên vịnh"></div>
    </section>
  );
}

export function RsvpSection() {
  const [attendance, setAttendance] = useState('Có mặt');
  const [formMessage, setFormMessage] = useState('');
  const [rsvpMoment, setRsvpMoment] = useState(0);
  const [wishes, setWishes] = useState([]);
  const params = new URLSearchParams(window.location.search);
  const recipient = params.get('to')?.replace(/\s+/g, ' ').trim().slice(0, 60);
  const companion = params.get('with')?.replace(/\s+/g, ' ').trim().slice(0, 60);
  const invitedGuests = [recipient, companion].filter(Boolean).join(' và ');

  useEffect(() => {
    if (!RSVP_ENDPOINT) return;
    fetch(RSVP_ENDPOINT)
      .then((response) => response.json())
      .then((data) => { if (data.ok) setWishes(data.wishes); })
      .catch((error) => console.error('Không tải được sổ lưu bút', error));
  }, []);

  const submitRsvp = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const response = new FormData(form);
    const name = String(response.get('name') || invitedGuests || '').trim();
    const isAttending = attendance === 'Có mặt';
    const notes = String(response.get('notes') || '').trim();
    const guestCount = isAttending ? String(response.get('guestCount') || '') : '';

    setFormMessage(isAttending
      ? `Cảm ơn ${name}. Hẹn gặp bạn tại lễ cưới!`
      : `Cảm ơn ${name} đã hồi đáp. Hẹn gặp bạn vào một dịp khác nhé.`);
    setRsvpMoment((moment) => moment + 1);
    if (isAttending && notes) setWishes((current) => [{ name, notes }, ...current]);
    postRsvp({ name, attendance, guestCount, notes });
    form.reset();
    setAttendance('Có mặt');
  };

  return (
    <section id="rsvp" className="rsvp section-pad" aria-labelledby="rsvp-title">
      <div className="rsvp-intro">
        <h2 id="rsvp-title">Bạn sẽ<br /><em>tham dự chứ?</em></h2>
        <div className="rsvp-copy">
          <p>Để hai gia đình có thể chuẩn bị và đón tiếp chu đáo, chúng tôi rất mong nhận được lời hồi âm cùng số người tham dự.</p>
          <p>Xin chân thành cảm ơn và hẹn gặp mọi người trong ngày vui sắp tới!</p>
        </div>
      </div>
      <div className="rsvp-form-wrap">
        <form className="rsvp-form" onSubmit={submitRsvp}>
          {!invitedGuests && <label>Họ và tên<input required name="name" autoComplete="name" placeholder="Nhập họ và tên của bạn" /></label>}
          <fieldset><legend>Xác nhận tham dự</legend><label className="choice"><input type="radio" name="attendance" value="Có mặt" checked={attendance === 'Có mặt'} onChange={() => setAttendance('Có mặt')} /><span>Hẹn gặp Huyền Nhu và Hoàng Thái trong ngày vui!</span></label><label className="choice"><input type="radio" name="attendance" value="Xin phép vắng mặt" checked={attendance === 'Xin phép vắng mặt'} onChange={() => setAttendance('Xin phép vắng mặt')} /><span>Rất tiếc mình không thể đến chung vui. Chúc Huyền Nhu và Hoàng Thái thật nhiều hạnh phúc!</span></label></fieldset>
          {attendance === 'Có mặt' && <label className="guest-count-field">Số người tham dự <span className="optional">(tính cả bạn)</span><select name="guestCount" defaultValue="1"><option value="1">1 người</option><option value="2">2 người</option><option value="3">3 người</option><option value="4">4 người</option></select></label>}
          <label>Lời chúc cho cô dâu, chú rể <span className="optional">(không bắt buộc)</span><input name="notes" placeholder="Viết lời chúc của bạn" /></label>
          <div className="rsvp-submit-wrap"><button className="button button-primary" type="submit">Gửi lời hồi đáp <span>→</span></button>{rsvpMoment > 0 && <RsvpBloom key={rsvpMoment} />}</div><p id="form-message" className={formMessage ? 'form-message-visible' : ''} role="status" aria-live="polite">{formMessage}</p>
        </form>
        {/* Tạm ẩn sổ lưu bút công khai. Bỏ comment khối dưới để bật lại. */}
        {/* {wishes.length > 0 && (
          <div className="guestbook">
            <p className="kicker">Lời chúc từ mọi người</p>
            <ul className="guestbook-list">
              {wishes.map((wish, index) => <li key={index}><p>&ldquo;{wish.notes}&rdquo;</p><span>— {wish.name}</span></li>)}
            </ul>
          </div>
        )} */}
      </div>
    </section>
  );
}
