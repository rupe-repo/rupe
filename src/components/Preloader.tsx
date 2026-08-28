import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { RupeMark } from './RupeMark';
import { holdUntilReady, release } from '../lib/ready';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './Preloader.css';

/** What the studio does, in the order it does it. The brand closes the list. */
const WORDS = ['IMAGINAMOS.', 'DESENHAMOS.', 'CONSTRUÍMOS.', 'FAZEMOS AVANÇAR.', 'AVANÇAR.'];

/**
 * Timing, in one place, because it is the thing most likely to need tuning.
 *
 * `HOLD` is the whole point: a clause has to sit still long enough to be read,
 * not merely long enough to be seen. Add the slide-in to it and each clause is
 * legible for roughly three quarters of a second.
 */
const MARK_IN = 0.5;
const WORD_IN = 0.42;
const WORD_HOLD = 0.45;
const WORD_OUT = 0.32;
const BRAND_HOLD = 0.55;

/**
 * The way in.
 *
 * The mark arrives first and then does not move. Every clause slides out from
 * behind it, holds, and retreats back behind it — the symbol is the door the
 * whole sentence comes through, and the last thing to come through it is the
 * brand's own name.
 *
 * The "behind" is a clip, not a stacking trick: the words live in a window
 * whose left edge is the mark's right edge, so a clause translated fully left
 * is outside the window and simply not drawn. Nothing ever overlaps the mark,
 * which matters because the mark is a monoline outline — anything sliding
 * under it would show through its gaps.
 *
 * Type and one SVG path. No second WebGL context, no renderer of its own; the
 * 3D scene boots behind the curtain, so its shader compile lands where nobody
 * is looking.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      release();
      return;
    }

    // Scoped to this run of the effect, not to the component: a guard that
    // outlived the run once let a second run close the gate and then decline
    // to open it, stranding the page with no scroll and nothing on screen.
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      window.clearTimeout(failsafe);
      release();
      setDone(true);
      // Layout was frozen while this played, so anything measured during it is
      // suspect. One refresh, after the scroll lock is off.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    // Reduced motion gets the brand and nothing else — no sequence, no wait.
    if (prefersReducedMotion()) {
      finish();
      return;
    }

    holdUntilReady();
    const failsafe = window.setTimeout(finish, 14000);

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.preloader__word');
      const brand = words[words.length - 1];
      const clauses = words.slice(0, -1);
      const tl = gsap.timeline({ onComplete: finish });

      // `?preloader` holds the sequence at its first frame and hands it over,
      // so it can be scrubbed. A sequence that plays once per load is
      // otherwise reviewable only by reloading and hoping to catch a moment.
      if (new URLSearchParams(window.location.search).has('preloader')) {
        tl.pause();
        window.clearTimeout(failsafe);
        (window as unknown as { __rupePreloader?: gsap.core.Timeline }).__rupePreloader = tl;
      }

      // The mark arrives, and from here it holds absolutely still. Everything
      // else in the sequence is measured against it.
      tl.fromTo(
        '.preloader__mark',
        { autoAlpha: 0, scale: 0.82 },
        { autoAlpha: 1, scale: 1, duration: MARK_IN, ease: 'power3.out' },
        0,
      );

      // One clause at a time, fully gone before the next appears. `xPercent`
      // is relative to each clause's own width, so -100 puts any of them
      // exactly at the window's left edge whatever their length.
      let at = MARK_IN + 0.1;
      clauses.forEach((word) => {
        tl.fromTo(
          word,
          { xPercent: -100 },
          { xPercent: 0, duration: WORD_IN, ease: 'power3.out' },
          at,
        ).to(word, { xPercent: -100, duration: WORD_OUT, ease: 'power2.in' }, at + WORD_IN + WORD_HOLD);
        at += WORD_IN + WORD_HOLD + WORD_OUT;
      });

      // The brand comes through the same door and stays.
      tl.fromTo(
        brand,
        { xPercent: -100 },
        { xPercent: 0, duration: WORD_IN + 0.1, ease: 'power3.out' },
        at,
      );
      tl.fromTo(
        '.preloader__desc',
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        at + 0.3,
      );

      // The brand is allowed to just be there before the page arrives.
      const openAt = at + WORD_IN + 0.1 + BRAND_HOLD;
      tl.to(
        root,
        { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'power3.inOut' },
        openAt,
      ).to('.preloader__stage', { y: -34, autoAlpha: 0, duration: 0.42, ease: 'power2.in' }, openAt);
    }, root);

    // Tear down only. Finishing here would end the sequence before it played:
    // React's development double-invoke runs mount → cleanup → mount, and a
    // cleanup that finished retired the preloader on the very first cycle.
    return () => {
      ctx.revert();
      window.clearTimeout(failsafe);
    };
  }, []);

  if (done) return null;

  return (
    <div className="preloader" ref={rootRef} role="presentation">
      <div className="preloader__stage">
        <div className="preloader__line">
          <RupeMark className="preloader__mark" />

          {/* The door. Its left edge is the mark's right edge, so a clause
              parked at -100% is clipped away entirely. */}
          <span className="preloader__window">
            {WORDS.map((word) => (
              <span className="preloader__word" key={word}>
                {word}
              </span>
            ))}
            <span className="preloader__word preloader__word--brand">RUPE</span>
          </span>
        </div>

        <p className="preloader__desc">Estúdio de experiências digitais</p>
      </div>
    </div>
  );
}
