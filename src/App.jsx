import React, { useState } from 'react';
import { Footer, Header, SiteIntro } from './components/Layout.jsx';
import {
  DetailsSection,
  GuestGuideSection,
  HeroSection,
  RsvpSection,
  StaySection,
  StorySection,
} from './components/sections.jsx';
import { revealSelectors } from './data/wedding.js';
import { useScrollReveal } from './hooks/useScrollReveal.js';
import { downloadWeddingCalendar } from './utils/calendar.js';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useScrollReveal(revealSelectors);

  return (
    <>
      <SiteIntro />
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
        <StaySection />
        <RsvpSection />
      </main>
      <Footer />
    </>
  );
}

export default App;
