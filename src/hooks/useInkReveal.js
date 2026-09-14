import { useEffect } from 'react';

const WORD_PATTERN = /(\S+)(\s*)/g;

function wrapWords(element) {
  if (element.dataset.inkWrapped) return;
  const text = element.textContent;
  const fragment = document.createDocumentFragment();
  let match;
  WORD_PATTERN.lastIndex = 0;
  while ((match = WORD_PATTERN.exec(text))) {
    const word = document.createElement('span');
    word.className = 'ink-word';
    word.textContent = match[1];
    fragment.appendChild(word);
    if (match[2]) fragment.appendChild(document.createTextNode(match[2]));
  }
  element.textContent = '';
  element.appendChild(fragment);
  element.dataset.inkWrapped = 'true';
}

/* Words light up as the paragraph scrolls through the lower half of the viewport, tracking scroll position rather than firing once. */
export function useInkReveal(selector) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return undefined;

    elements.forEach(wrapWords);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => {
        element.querySelectorAll('.ink-word').forEach((word) => word.classList.add('is-lit'));
      });
      return undefined;
    }

    let frame = null;

    const update = () => {
      frame = null;
      elements.forEach((element) => {
        const words = element.querySelectorAll('.ink-word');
        if (!words.length) return;
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / viewportHeight));
        const litCount = Math.round(progress * words.length);
        words.forEach((word, index) => word.classList.toggle('is-lit', index < litCount));
      });
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [selector]);
}
