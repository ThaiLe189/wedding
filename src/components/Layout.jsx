import React from 'react';
import { wedding } from '../data/wedding.js';
import invitationArtwork from '../design/assets/invitation-antique-gold.png';

export function SiteIntro({ isOpening, onOpen }) {
  return (
    <section className={`site-intro${isOpening ? ' is-opening' : ''}`} aria-label="Thiệp mời cưới của Hoàng Thái và Huyền Nhu">
      <button className="invitation-cover" type="button" onClick={onOpen} disabled={isOpening}>
        <span className="invitation-artwork"><img src={invitationArtwork} alt="Thiệp cưới Vàng đồng với họa tiết đôi hạc" /></span>
        <span className="open-invitation">{isOpening ? 'Đang mở thiệp...' : 'Chạm để mở thiệp'}</span>
      </button>
    </section>
  );
}

export function Header({ menuOpen, onToggleMenu, onCloseMenu }) {
  const menuLabel = menuOpen ? 'Đóng menu' : 'Mở menu';

  return (
    <header className="site-header">
      <a className="monogram" href="#top" aria-label={`${wedding.couple.groom} và ${wedding.couple.bride}, trang chủ`}>HT<span>×</span>HN</a>
      <nav id="nav-links" className={menuOpen ? 'open' : ''} aria-label="Điều hướng chính">
        <a href="#story" onClick={onCloseMenu}>Chuyện mình</a>
        <a href="#details" onClick={onCloseMenu}>Thông tin</a>
        <a href="#guide" onClick={onCloseMenu}>Hướng dẫn</a>
        <a href="#gallery" onClick={onCloseMenu}>Album</a>
        <a className="nav-rsvp" href="#rsvp" onClick={onCloseMenu}>Xác nhận tham dự</a>
      </nav>
      <button className="menu-toggle" type="button" aria-label={menuLabel} aria-expanded={menuOpen} aria-controls="nav-links" onClick={onToggleMenu}><i></i><i></i></button>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <a className="monogram" href="#top">HT<span>×</span>HN</a>
      <p>Được chuẩn bị bằng tất cả yêu thương.</p>
      <a href="#rsvp">Xác nhận tham dự ↗</a>
    </footer>
  );
}
