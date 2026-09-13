import React from 'react';
import { wedding } from '../data/wedding.js';

export function SiteIntro() {
  return <div className="site-intro" aria-hidden="true"><span>HN</span><i>×</i><span>HT</span></div>;
}

export function Header({ menuOpen, onToggleMenu, onCloseMenu }) {
  const menuLabel = menuOpen ? 'Đóng menu' : 'Mở menu';

  return (
    <header className="site-header">
      <a className="monogram" href="#top" aria-label={`${wedding.couple.bride} và ${wedding.couple.groom}, trang chủ`}>HN<span>×</span>HT</a>
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
      <a className="monogram" href="#top">HN<span>×</span>HT</a>
      <p>Được chuẩn bị bằng tất cả yêu thương.</p>
      <a href="#rsvp">Xác nhận tham dự ↗</a>
    </footer>
  );
}
