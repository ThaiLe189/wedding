import { useEffect } from 'react';

export function useScrollReveal(selectors) {
  useEffect(() => {
    document.body.classList.add('js-ready');
    const targets = document.querySelectorAll(selectors);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [selectors]);
}
