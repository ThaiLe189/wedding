import React, { useState } from 'react';
import { galleryPhotos, wedding, schedule } from '../data/wedding.js';
import { PetalField, RsvpBloom } from './Decorations.jsx';

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-photo" role="img" aria-label="Huyền Nhu và Hoàng Thái trong khoảnh khắc làm lễ bên biển"><PetalField placement="hero" /></div>
      <div className="hero-copy">
        <p className="kicker">Save our date · {wedding.date.display}</p>
        <h1 id="hero-title"><span>{wedding.couple.bride}</span><em>&amp;</em><span>{wedding.couple.groom}</span></h1>
        <p className="hero-sub">Một lời hẹn cho ngày chúng mình về chung một nhà.</p>
        <div className="hero-actions"><a className="button button-primary" href="#rsvp">Xác nhận tham dự <span>→</span></a><a className="quiet-link" href="#details">Xem lịch trình</a></div>
      </div>
      <div className="hero-stamp" aria-label="Hà Nội, Việt Nam"><b>22</b><span>Tháng mười một<br />năm 2026</span></div>
    </section>
  );
}

export function StorySection() {
  return (
    <section id="story" className="story section-pad" aria-labelledby="story-title">
      <div className="section-intro"><p className="section-number">01</p><p className="kicker">Chuyện của chúng mình</p></div>
      <div className="story-heading"><p className="handwritten">Có những điều giản dị,</p><h2 id="story-title">rồi bỗng trở thành<br /><em>cả một đời.</em></h2><div className="story-photo" role="img" aria-label="Khoảnh khắc cặp đôi trao lời hứa bên hoa"></div></div>
      <div className="story-copy"><p>Từ những cuộc hẹn vô tình đến những bữa cơm đầy tiếng cười, chúng mình đã chọn nắm tay nhau đi tiếp. Và sẽ thật trọn vẹn nếu ngày vui ấy có bạn ở đó.</p><a className="inline-link" href="#rsvp">Đến chung vui cùng chúng mình <span>↗</span></a></div>
    </section>
  );
}

export function DetailsSection({ onDownloadCalendar }) {
  return (
    <section id="details" className="details section-pad" aria-labelledby="details-title">
      <div className="details-heading"><p className="section-number">02</p><p className="kicker">Lịch trình ngày cưới</p><h2 id="details-title">Dành cả ngày<br />cho <em>niềm vui.</em></h2></div>
      <div className="schedule">
        {schedule.map((item) => <article className={`schedule-item${item.featured ? ' featured' : ''}`} key={item.time}><p className="time">{item.time}</p><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}
      </div>
      <div className="venue"><div><p className="kicker">Địa điểm</p><p><strong>{wedding.venue.name}</strong><br />{wedding.venue.address}</p></div><button className="button button-outline" type="button" onClick={onDownloadCalendar}>Thêm vào lịch <span>↗</span></button></div>
    </section>
  );
}

export function GuestGuideSection() {
  return (
    <section id="guide" className="guest-guide section-pad" aria-labelledby="guide-title">
      <div className="guide-heading"><p className="kicker">Để ngày vui thật thảnh thơi</p><h2 id="guide-title">Một vài điều<br />nhỏ <em>cho bạn.</em></h2></div>
      <div className="guide-list">
        <article className="guide-item"><p className="guide-index">Trang phục</p><div><h3>Thanh lịch, và thật là bạn.</h3><p>Chúng mình rất vui khi bạn chọn một bộ trang phục lịch sự, thoải mái để cùng tận hưởng trọn vẹn buổi tiệc.</p><div className="colour-notes" aria-label="Gợi ý màu sắc: kem nhạt, hồng phấn, xanh xám và nâu nhạt"><i></i><i></i><i></i><i></i></div></div></article>
        <article className="guide-item"><p className="guide-index">Đường đến</p><div><h3>Hẹn bạn tại Tasco Mall Long Biên.</h3><p>Địa điểm tổ chức nằm tại số 7-9 Nguyễn Văn Linh. Khi đến nơi, bạn có thể gửi xe và theo biển chỉ dẫn của trung tâm thương mại.</p><a className="inline-link" href={wedding.venue.mapsUrl} target="_blank" rel="noreferrer">Mở chỉ đường <span>↗</span></a></div></article>
      </div>
    </section>
  );
}

export function GallerySection() {
  return (
    <section id="gallery" className="gallery section-pad" aria-labelledby="gallery-title">
      <div className="gallery-intro scroll-reveal"><p className="kicker">Một ngày rất đỏ</p><h2 id="gallery-title">Những khung hình<br /><em>mình thương.</em></h2><p>Giữa nắng, những bậc đá và thật nhiều nụ cười.</p></div>
      <div className="gallery-grid scroll-reveal">
        {galleryPhotos.map((photo) => <figure className={`gallery-photo gallery-photo--${photo.layout}`} key={photo.layout}><img src={photo.image} alt={photo.alt} loading="lazy" /></figure>)}
      </div>
    </section>
  );
}

export function StaySection() {
  return (
    <section id="stay" className="stay" aria-labelledby="stay-title">
      <div className="stay-copy section-pad"><p className="section-number">03</p><p className="kicker">Một lời hẹn nhỏ</p><h2 id="stay-title">Hẹn bạn<br />trong <em>ngày vui.</em></h2><p>Một buổi chiều tháng mười một, thật nhiều tiếng cười, những cái ôm và lời chúc. Chúng mình mong được gặp bạn ở đó.</p><a className="inline-link" href="#rsvp">Gửi lời hồi đáp <span>↗</span></a></div>
      <div className="stay-photo" role="img" aria-label="Huyền Nhu và Hoàng Thái trong khoảnh khắc làm lễ bên biển"><PetalField placement="stay" /></div>
    </section>
  );
}

export function RsvpSection() {
  const [attendance, setAttendance] = useState('Có mặt');
  const [formMessage, setFormMessage] = useState('');
  const [rsvpMoment, setRsvpMoment] = useState(0);

  const submitRsvp = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const response = new FormData(form);
    const name = String(response.get('name') || '').trim().split(/\s+/)[0];
    const isAttending = response.get('attendance') === 'Có mặt';

    setFormMessage(isAttending
      ? `Cảm ơn ${name}. Hẹn gặp bạn trong ngày vui của chúng mình nhé.`
      : `Cảm ơn ${name}. Chúng mình rất trân trọng lời chúc của bạn.`);
    setRsvpMoment((moment) => moment + 1);
    form.reset();
    setAttendance('Có mặt');
  };

  return (
    <section id="rsvp" className="rsvp section-pad" aria-labelledby="rsvp-title">
      <div className="rsvp-intro"><p className="section-number">04</p><p className="kicker">Một lời hồi đáp nhỏ</p><p className="handwritten">Có bạn, ngày vui sẽ đầy hơn.</p><h2 id="rsvp-title">Mình gặp nhau<br /><em>nhé?</em></h2><p>Vui lòng gửi lại lời hồi đáp trước ngày {wedding.date.rsvpDeadline} nhé.</p></div>
      <form className="rsvp-form" onSubmit={submitRsvp}>
        <label>Họ và tên<input required name="name" autoComplete="name" placeholder="Tên bạn là gì nhỉ?" /></label>
        <fieldset><legend>Bạn sẽ đến chung vui với chúng mình chứ?</legend><label className="choice"><input type="radio" name="attendance" value="Có mặt" checked={attendance === 'Có mặt'} onChange={() => setAttendance('Có mặt')} /><span>Mình rất mong được có mặt</span></label><label className="choice"><input type="radio" name="attendance" value="Không thể tham dự" checked={attendance === 'Không thể tham dự'} onChange={() => setAttendance('Không thể tham dự')} /><span>Mình xin gửi lời chúc từ xa</span></label></fieldset>
        {attendance === 'Có mặt' && <label className="guest-count-field">Bạn sẽ đi cùng bao nhiêu người?<select name="guestCount" aria-label="Số người tham dự" defaultValue="1"><option value="1">1 người</option><option value="2">2 người</option><option value="3">3 người</option><option value="4">4 người</option></select></label>}
        <label>Gửi đôi lời đến chúng mình <span className="optional">(nếu bạn muốn)</span><input name="notes" placeholder="Một lời chúc nhỏ, hoặc điều chúng mình cần biết..." /></label>
        <div className="rsvp-submit-wrap"><button className="button button-primary" type="submit">Gửi lời hồi đáp <span>→</span></button>{rsvpMoment > 0 && <RsvpBloom key={rsvpMoment} />}</div><p id="form-message" className={formMessage ? 'form-message-visible' : ''} role="status" aria-live="polite">{formMessage}</p>
      </form>
    </section>
  );
}
