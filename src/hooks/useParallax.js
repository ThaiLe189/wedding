import { useEffect } from 'react';

/* Shifts a fixed background layer a fraction of scroll distance so it drifts slower than the content above it.
   The offset is capped: the layer is only as big as the viewport (see .site-backdrop), so an unbounded drift
   would eventually uncover a strip of empty background at the translated edge. */
export function useParallax(selector, ratio = 0.175, maxOffset = 40) {
  useEffect(() => {
    const element = document.querySelector(selector);
    if (!element) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let frame = null;
    const update = () => {
      frame = null;
      const offset = Math.min(window.scrollY * ratio, maxOffset);
      element.style.transform = `translate3d(0, ${-offset}px, 0)`;
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
