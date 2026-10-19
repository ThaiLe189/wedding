import React, { useEffect, useRef, useState } from 'react';
import { music, wedding } from '../data/wedding.js';
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

const MUSIC_PREF_KEY = 'wedding-music';
const MUSIC_VOLUME = 0.55;
const FADE_MS = 1500;

const readMusicPref = () => { try { return localStorage.getItem(MUSIC_PREF_KEY); } catch { return null; } };
const saveMusicPref = (value) => { try { localStorage.setItem(MUSIC_PREF_KEY, value); } catch { /* private mode: không nhớ được, không sao */ } };

// ponytail: iOS Safari bỏ qua audio.volume nên trên iPhone nhạc vào thẳng mức âm lượng máy, không fade;
// cần fade thật trên iOS thì chuyển sang Web Audio GainNode.
function fadeVolume(audio, target, onDone) {
  const from = audio.volume, start = performance.now();
  const step = (now) => {
    const k = Math.min(1, Math.max(0, (now - start) / FADE_MS)); // rAF time can precede `start`
    audio.volume = from + (target - from) * k;
    if (k < 1) requestAnimationFrame(step); else onDone?.();
  };
  requestAnimationFrame(step);
}

/**
 * Nút bật/tắt nhạc nền. Trình duyệt chỉ cho phát tiếng sau khi người xem tương tác, nên nhạc tự bật
 * ở cú chạm/bấm đầu tiên (lúc mở thiệp), trừ khi khách từng tắt nhạc (nhớ trong localStorage).
 * File chỉ tải khi bắt đầu phát; tab ẩn thì tạm dừng.
 */
export function MusicToggle() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const userChoseRef = useRef(false); // khách đã tự bấm nút: không tự bật nữa
  playingRef.current = playing;

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = Object.assign(new Audio(music.src), { loop: true, preload: 'none', volume: 0 });
    return audioRef.current;
  };

  const start = () => {
    const audio = getAudio();
    audio.play()
      .then(() => { setPlaying(true); fadeVolume(audio, MUSIC_VOLUME); })
      .catch(() => setPlaying(false)); // bị chặn autoplay: khách tự bấm nút
  };

  const stop = () => {
    const audio = audioRef.current;
    setPlaying(false);
    if (audio) fadeVolume(audio, 0, () => { if (!playingRef.current) audio.pause(); });
  };

  const toggle = () => {
    userChoseRef.current = true;
    if (playing) { stop(); saveMusicPref('off'); } else { start(); saveMusicPref('on'); }
  };

  useEffect(() => {
    if (readMusicPref() === 'off') return undefined;
    const onFirstGesture = (event) => {
      if (event.target.closest?.('.music-toggle')) return; // để chính nút xử lý
      if (!userChoseRef.current) start();
      cleanup();
    };
    const cleanup = () => {
      document.removeEventListener('pointerdown', onFirstGesture, true);
      document.removeEventListener('keydown', onFirstGesture, true);
    };
    document.addEventListener('pointerdown', onFirstGesture, true);
    document.addEventListener('keydown', onFirstGesture, true);
    return cleanup;
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio || !playingRef.current) return;
      if (document.hidden) audio.pause(); else audio.play().catch(() => setPlaying(false));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      audioRef.current?.pause();
    };
  }, []);

  const label = playing ? 'Tắt nhạc nền' : 'Bật nhạc nền';
  return (
    <button type="button" className={`music-toggle${playing ? ' is-playing' : ''}`} aria-pressed={playing} aria-label={label} title={label} onClick={toggle}>
      <span aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    </button>
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
