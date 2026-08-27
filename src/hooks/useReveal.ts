import { useEffect } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';
import { whenReady } from '../lib/ready';

/**
 * One IntersectionObserver for every `[data-reveal]` / `[data-reveal-mask]`
 * element on the page. Cheaper than a ScrollTrigger per node and it survives
 * DOM changes through the MutationObserver re-scan.
 */
export function useReveal() {
  useEffect(() => {
    const SELECTOR = '[data-reveal], [data-reveal-mask]';

    if (prefersReducedMotion()) {
      document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    const tracked = new WeakSet<Element>();
    const scan = () => {
      const vh = window.innerHeight;
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains('is-in') || tracked.has(el)) return;
        tracked.add(el);
        // Reveal anything already on screen straight away — a restored scroll
        // position must not wait on the observer's first delivery.
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.9 && rect.bottom > 0) {
          el.classList.add('is-in');
          return;
        }
        observer.observe(el);
      });
    };

    // Behind the preloader every hero element is technically on screen, so an
    // immediate scan would reveal them all against a curtain nobody can see
    // through — and they would be sitting there, already finished, the moment
    // it lifted. The observer only starts once the page is free to animate.
    const mutations = new MutationObserver(scan);
    const cancel = whenReady(() => {
      scan();
      mutations.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      cancel();
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);
}
