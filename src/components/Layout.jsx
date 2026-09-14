import React, { useEffect, useRef } from 'react';
import { wedding } from '../data/wedding.js';
import introCard from '../design/assets/intro/mat-trai.webp';
import introUnderlay from '../design/assets/intro/mat-phai.webp';
import '../intro/wedding-intro.js';
import { CraneField } from './Decorations.jsx';

/**
 * Màn thiệp mở đầu: bọc Web Component <wedding-intro> (src/intro/wedding-intro.js).
 * Khách bấm/kéo bìa để mở thiệp 2.5D; thiệp mở xong thì component phát `invitation-enter`
 * (chế độ auto-enter) và App fade màn này đi để vào web chính, không cần bấm thêm nút.
 * Tạo phần tử bằng DOM API thay vì JSX để gán `assets` (object) trước khi component mount.
 */
export function SiteIntro({ isLeaving, onEnter }) {
  const mountRef = useRef(null);
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  useEffect(() => {
    const mount = mountRef.current;
    const intro = document.createElement('wedding-intro');
    intro.assets = { card: introCard, underlay: introUnderlay };
    intro.setAttribute('auto-enter', '');
    intro.setAttribute('transparent', ''); // sân khấu (nền, hạc, mây) do .site-intro vẽ
    const handleEnter = () => onEnterRef.current?.();
    intro.addEventListener('invitation-enter', handleEnter);
    mount.appendChild(intro);
    document.body.classList.add('intro-active');
    return () => {
      intro.removeEventListener('invitation-enter', handleEnter);
      intro.remove();
      document.body.classList.remove('intro-active');
    };
  }, []);

  return (
    <div
      className={`site-intro${isLeaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Thiệp mời cưới của ${wedding.couple.groom} và ${wedding.couple.bride}`}
    >
      <CraneField placement="intro" />
      <span className="intro-cloud intro-cloud-one" aria-hidden="true"></span>
      <span className="intro-cloud intro-cloud-two" aria-hidden="true"></span>
      <span className="intro-cloud intro-cloud-three" aria-hidden="true"></span>
      <div ref={mountRef} className="intro-card-mount" />
    </div>
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
