import { useEffect, useRef } from 'react';
import { RupeMark } from './RupeMark';
import { ArrowButton } from './ArrowButton';
import { gsap } from '../lib/gsap';
import { loadDrawSVG } from '../lib/gsapPlugins';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './FinalCTA.css';

export function FinalCTA() {
  const watermarkRef = useRef<HTMLDivElement>(null);

  /**
   * The watermark draws itself when the CTA arrives.
   *
   * It is the same contour the 3D mark extrudes, rendered as an open stroke —
   * so a progressive draw reads as the symbol being written rather than as an
   * element fading in. Two rings, drawn in sequence: the ribbon body, then the
   * detached bar.
   *
   * `once: true` — this is an arrival, not a scrubbed effect, and it is the
   * last section on the page. Nothing here should still be doing work while
   * the visitor reads the CTA.
   */
  useEffect(() => {
    const el = watermarkRef.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    loadDrawSVG().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.from(el.querySelectorAll('path'), {
          drawSVG: '0%',
          duration: 1.8,
          ease: 'power2.inOut',
          stagger: 0.3,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section className="final" id="contact" data-nav-theme="dark">
      <div className="final__glow" aria-hidden="true" />
      <div className="final__watermark" aria-hidden="true" ref={watermarkRef}>
        <RupeMark outline strokeWidth={0.55} />
      </div>

      <div className="shell final__inner">
        <div className="final__lead">
          <p className="eyebrow eyebrow--dark" data-reveal>
            Let&apos;s work together
          </p>
          <h2 className="final__title">
            <span data-reveal-mask>
              <span>READY TO</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
              <span className="accent--dark">MOVE FORWARD?</span>
            </span>
          </h2>
        </div>

        <div className="final__aside">
          <p data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            Have a project in mind? Let&apos;s create something impossible to ignore.
          </p>
          <div data-reveal style={{ ['--reveal-delay' as string]: '240ms' }}>
            <ArrowButton href="mailto:hello@example.com" tone="dark" size="lg">
              Start a project
            </ArrowButton>
          </div>
        </div>

        {/* Two jobs, one box.

            Desktop: an empty third column. The 3D mark is anchored to it, so
            the composition is driven by layout and the button is never
            underneath it.

            Mobile: there is no 3D mark here any more — the WebGL scene ends
            with the hero. The same box holds the flat mark instead, drawn from
            the identical contour data, so the CTA keeps its symbol for the
            price of an SVG. */}
        <div className="final__logo-slot" aria-hidden="true">
          <RupeMark className="final__mark" outline strokeWidth={0.6} />
        </div>
      </div>
    </section>
  );
}
