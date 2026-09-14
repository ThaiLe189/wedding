import React, { useState } from 'react';
import { Footer, Header, SiteIntro } from './components/Layout.jsx';
import { SiteBackdrop } from './components/Decorations.jsx';
import {
  DetailsSection,
  GallerySection,
  GuestGuideSection,
  HeroSection,
  RsvpSection,
  StaySection,
  StorySection,
} from './components/sections.jsx';
import { revealSelectors } from './data/wedding.js';
import { useInkReveal } from './hooks/useInkReveal.js';
import { useParallax } from './hooks/useParallax.js';
import { useScrollReveal } from './hooks/useScrollReveal.js';
import { downloadWeddingCalendar } from './utils/calendar.js';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [invitationOpening, setInvitationOpening] = useState(false);
  const [invitationDismissed, setInvitationDismissed] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const openInvitation = () => {
    if (invitationOpening) return;
    setInvitationOpening(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => setInvitationDismissed(true), reducedMotion ? 0 : 800);
  };

  useScrollReveal(revealSelectors);
  useInkReveal('.story-copy p');
  useParallax('.site-backdrop');

  return (
    <>
      {!invitationDismissed && <SiteIntro isOpening={invitationOpening} onOpen={openInvitation} />}
      <SiteBackdrop />
      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onCloseMenu={closeMenu}
      />
      <main id="top">
        <HeroSection />
        <StorySection />
        <DetailsSection onDownloadCalendar={downloadWeddingCalendar} />
        <GuestGuideSection />
        <GallerySection />
        <StaySection />
        <RsvpSection />
      </main>
      <Footer />
    </>
  );
}

export default App;
