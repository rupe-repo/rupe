import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { RupeMark } from './RupeMark';
import { holdUntilReady, release } from '../lib/ready';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './Preloader.css';

/** What the studio does, in the order it does it. */
const WORDS = ['IMAGINAMOS.', 'DESENHAMOS.', 'CONSTRUÍMOS.', 'FAZEMOS AVANÇAR.'];

/**
 * The way in.
 *
 * No spinner, no percentage, no bar: those measure a wait, and this is not a
 * wait — the page behind it is already building. It is a sentence, delivered
 * one clause at a time, that ends on the brand.
 *
 * Type only. There is no second WebGL context here and no renderer of its own;
 * the mark is the same SVG contour the rest of the site draws from, so the
 * preloader costs an SVG path and a timeline. The 3D scene boots behind the
 * curtain, which means its shader compile lands where nobody is looking.
 *
 * Everything that could strand the visitor is guarded: a failed timeline, an
 * unmount mid-flight and a hard timeout all end in the same `finish()`, and
 * `finish()` is idempotent.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      // Nothing to play, so make sure nothing is left holding the scroll.
      release();
      return;
    }

    // Scoped to this run of the effect, not to the component. A guard that
    // outlives the run would let a second run close the gate and then decline
    // to open it — which is precisely how the page got stuck.
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
    // Never let a thrown timeline leave someone looking at a black screen.
    const failsafe = window.setTimeout(finish, 6000);

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.preloader__word');
      const tl = gsap.timeline({ onComplete: finish });

      // `?preloader` holds the sequence at its first frame and hands it over,
      // so it can be scrubbed and reviewed. Without this the only way to see
      // a three-second animation that plays once per load is to keep
      // reloading and hope to catch the right moment.
      if (new URLSearchParams(window.location.search).has('preloader')) {
        tl.pause();
        window.clearTimeout(failsafe);
        (window as unknown as { __rupePreloader?: gsap.core.Timeline }).__rupePreloader = tl;
      }

      // Absolute positions, not relative ones. Chained `'>'` offsets read
      // nicely and silently accumulate: the first version of this timeline
      // added up to 6.8s against a 2.5–3.5s budget. Laid out on one clock, the
      // total is legible at a glance and stays inside it.
      //
      //   0.00–1.56  four clauses, each rising in and leaving upward
      //   1.52–2.12  the turn
      //   2.06–2.87  the brand arrives and is allowed to just be there
      //   2.87–3.35  the curtain lifts
      const STEP = 0.36;

      words.forEach((word, i) => {
        const at = i * STEP;
        // Out by the time the next one is in: the clauses used to overlap for
        // 120ms, which read as two words on screen rather than one line being
        // rewritten. 130% clears the padded mask.
        tl.fromTo(
          word,
          { yPercent: 130 },
          { yPercent: 0, duration: 0.24, ease: 'power3.out' },
          at,
        ).to(word, { yPercent: -130, duration: 0.18, ease: 'power2.in' }, at + STEP - 0.18);
      });

      const turnAt = words.length * STEP - 0.08;
      tl.fromTo(
        '.preloader__turn',
        { yPercent: 130 },
        { yPercent: 0, duration: 0.3, ease: 'power3.out' },
        turnAt,
      ).to('.preloader__turn', { yPercent: -130, duration: 0.24, ease: 'power2.in' }, turnAt + 0.36);

      // The line leaves whole — mark included. Retiring only the words left the
      // sequence's symbol hovering above the brand that was arriving to
      // replace it, which is two marks on screen saying different things.
      tl.to(
        '.preloader__line',
        { autoAlpha: 0, y: -18, duration: 0.3, ease: 'power2.in' },
        turnAt + 0.4,
      );

      // Everything has cleared; the brand arrives on its own.
      tl.fromTo(
        '.preloader__brand',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power3.out' },
        turnAt + 0.54,
      );

      // The curtain lifts from the bottom edge, revealing the hero already in
      // place beneath it. The brand leaves with it rather than before it.
      const openAt = turnAt + 1.35;
      tl.to(
        root,
        { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.48, ease: 'power3.inOut' },
        openAt,
      ).to('.preloader__stage', { y: -40, autoAlpha: 0, duration: 0.38, ease: 'power2.in' }, openAt);

    }, root);

    // Tear down only. Finishing here would end the sequence before it played:
    // React's development double-invoke runs mount → cleanup → mount, so a
    // cleanup that called `finish()` retired the preloader on the very first
    // cycle and it was never seen. The gate is opened by the timeline, the
    // failsafe, or the hard release below — never by teardown.
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

          <span className="preloader__slot">
            {WORDS.map((word) => (
              <span className="preloader__mask" key={word}>
                <span className="preloader__word">{word}</span>
              </span>
            ))}
            <span className="preloader__mask">
              <span className="preloader__turn">AVANÇAR.</span>
            </span>
          </span>
        </div>

        <div className="preloader__brand">
          {/* Mark and wordmark are one lockup; the descriptor sits under both.
              Laying all three out as grid columns let the descriptor's width
              push the mark away from the word it belongs to. */}
          <span className="preloader__brand-lockup">
            <RupeMark className="preloader__brand-mark" />
            <span className="preloader__brand-type">RUPE</span>
          </span>
          <span className="preloader__brand-desc">Estúdio de experiências digitais</span>
        </div>
      </div>
    </div>
  );
}
