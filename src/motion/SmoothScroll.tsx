import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Inertial page scrolling and eased in-page links.
 * Skipped entirely when the visitor asks for reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Let modals and inner scroll areas scroll natively.
      prevent: (node: HTMLElement) => !!node.closest('.fixed, [data-lenis-prevent]'),
    });

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute('href') || '';
      if (hash === '#') {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.6 });
        return;
      }
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.6 });
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
