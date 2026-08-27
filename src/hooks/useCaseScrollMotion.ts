import { useEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useMediaQuery } from './useMediaQuery';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Scroll-linked choreography for a case study.
 *
 * Two scrubbed timelines, each owning a different element, so nothing fights
 * for the same `transform`:
 *
 *   ENTRANCE  `.mockup__enter` + the copy's own children — the arrival.
 *   THROUGH   `.mockup__drift` + `.case__copy` + `.mockup__glow` — a three-point
 *             arc that keeps moving for as long as the case holds the screen.
 *
 * Both are `scrub`, so progress is the visitor's scroll position rather than a
 * clock. Under `prefers-reduced-motion` neither is built and every element sits
 * at its natural, fully visible state.
 */
export function useCaseScrollMotion(ref: RefObject<HTMLElement | null>, enabled = true) {
  // Reactive, so crossing a breakpoint tears the old timeline down through
  // `ctx.revert()` and builds the right one — the React equivalent of
  // `gsap.matchMedia()`. Read once at mount, the two could both be live.
  const desktop = useMediaQuery('(min-width: 1024px)');
  const mobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const enter = root.querySelector<HTMLElement>('.mockup__enter');
      const drift = root.querySelector<HTMLElement>('.mockup__drift');
      const glow = root.querySelector<HTMLElement>('.mockup__glow');
      const copy = root.querySelector<HTMLElement>('.case__copy');

      // `will-change` is a promise to the compositor, not a decoration — hand it
      // back the moment the case stops animating.
      const hint = (el: Element | null, on: boolean) => {
        if (el instanceof HTMLElement) el.style.willChange = on ? 'transform, opacity' : '';
      };

      // -- ENTRANCE ---------------------------------------------------------
      const lines = gsap.utils.toArray<HTMLElement>('.case__scrub', root);
      if (lines.length) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 88%',
            end: mobile ? 'top 45%' : 'top 28%',
            scrub: 0.6,
            onToggle: (self) => lines.forEach((l) => hint(l, self.isActive)),
          },
        });
        // Each element starts a little later than the one above it, so the block
        // assembles top-down instead of arriving as one slab.
        lines.forEach((el, i) => {
          tl.fromTo(
            el,
            { opacity: 0, y: mobile ? 26 : 40 },
            { opacity: 1, y: 0, ease: 'power2.out', duration: 1 },
            i * 0.35,
          );
        });
      }

      if (enter) {
        gsap.fromTo(
          enter,
          {
            opacity: 0,
            x: mobile ? 0 : 80,
            y: mobile ? 50 : 100,
            scale: mobile ? 0.94 : 0.88,
            rotate: mobile ? 0 : 2,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 82%',
              end: mobile ? 'top 40%' : 'top 22%',
              scrub: 0.6,
              onToggle: (self) => hint(enter, self.isActive),
            },
          },
        );
      }

      // -- THROUGH ----------------------------------------------------------
      // One arc across the whole case: rises into place, then keeps going and
      // lifts away as the next project comes up.
      const visual = root.querySelector<HTMLElement>('.case__visual');
      const through = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
          onToggle: (self) => {
            hint(drift, self.isActive);
            hint(glow, self.isActive);
            hint(copy, self.isActive);
            hint(visual, self.isActive);
          },
        },
      });

      if (drift) {
        through
          .fromTo(
            drift,
            { y: 50, scale: 0.96, rotate: 1, rotateX: mobile ? 0 : 2, rotateY: mobile ? 0 : -2 },
            { y: 0, scale: 1, rotate: 0, rotateX: 0, rotateY: 0, ease: 'none', duration: 1 },
            0,
          )
          .to(
            drift,
            {
              y: -50,
              scale: 1.03,
              rotate: -0.5,
              rotateX: mobile ? 0 : -1,
              rotateY: mobile ? 0 : 1,
              ease: 'none',
              duration: 1,
            },
            1,
          );
      }

      if (glow) {
        through
          .fromTo(
            glow,
            { opacity: 0.15, scale: 0.8 },
            { opacity: 0.35, scale: 1, ease: 'none', duration: 1 },
            0,
          )
          .to(glow, { opacity: 0.2, scale: 1.1, ease: 'none', duration: 1 }, 1);
      }

      // The copy travels less than the mockup. That difference in rate is the
      // depth cue — not the distance either one covers.
      if (copy && desktop) {
        through.fromTo(
          copy,
          { y: 18 },
          { y: -18, ease: 'none', duration: 2 },
          0,
        );
      }
    }, root);

    return () => ctx.revert();
  }, [ref, enabled, desktop, mobile]);

  // The sticky stretch changes the document height; let ScrollTrigger re-measure
  // once fonts and images have settled.
  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [enabled]);
}
