import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useMediaQuery } from './useMediaQuery';
import { prefersReducedMotion } from './usePrefersReducedMotion';


/**
 * Lenis-driven smooth scrolling, wired into the GSAP ticker so ScrollTrigger
 * reads the same frame Lenis just wrote. Disabled entirely under
 * prefers-reduced-motion — the page keeps native scrolling.
 */
export function useSmoothScroll() {
  // Native scroll on phones. Momentum scrolling fights the platform's own —
  // it desyncs from the iOS toolbar's viewport changes and turns a flick into
  // something the page is still catching up with. Desktop keeps the easing.
  const mobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (mobile || prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      lerp: 0.11,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      autoRaf: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links go through Lenis so the easing stays consistent.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -12, duration: 1.2 });
    };
    document.addEventListener('click', onClick);

    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [mobile]);
}
