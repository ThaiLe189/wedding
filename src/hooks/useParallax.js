import { useEffect } from 'react';

/* Shifts a fixed background layer a fraction of scroll distance so it drifts slower than the content above it. */
export function useParallax(selector, ratio = 0.175) {
  useEffect(() => {
    const element = document.querySelector(selector);
    if (!element) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let frame = null;
    const update = () => {
      frame = null;
      element.style.transform = `translate3d(0, ${-window.scrollY * ratio}px, 0)`;
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
      element.style.transform = '';
    };
  }, [selector, ratio]);
}
