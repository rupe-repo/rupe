import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Arrow } from './ArrowButton';
import { useMagnetic } from '../hooks/useMagnetic';
import './Hero.css';

const HEADLINE: Array<{ text: string; accent?: boolean }> = [
  { text: 'WE BUILD' },
  { text: 'DIGITAL' },
  { text: 'EXPERIENCES', accent: true },
  { text: 'THAT MOVE' },
  { text: 'BUSINESSES' },
  { text: 'FORWARD.', accent: true },
];

function MoveForwardBadge() {
  return (
    <div className="hero__badge" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="hero__badge-ring">
        <defs>
          <path
            id="badge-path"
            d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
            fill="none"
          />
        </defs>
        <text>
          <textPath href="#badge-path" startOffset="0">
            MOVE FORWARD · MOVE FORWARD ·&nbsp;
          </textPath>
        </text>
      </svg>
      <Arrow className="hero__badge-arrow" />
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useMagnetic<HTMLAnchorElement>(16);

  // The hero is pinned while the dark portfolio panel rises over it: the copy
  // drifts up, the veil deepens, and the handover reads as one movement.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4,
          // Hand the navbar over to its dark styling once the veil is deep
          // enough that light-on-light would stop reading.
          onUpdate: (self) => {
            section.dataset.navTheme = self.progress > 0.42 ? 'dark' : 'light';
          },
        },
      });
      timeline
        .to('.hero__copy', { y: -70, opacity: 0.12, ease: 'none' }, 0)
        .to('.hero__badge', { y: -40, opacity: 0, ease: 'none' }, 0)
        .to('.hero__veil', { opacity: 0.82, ease: 'power1.in' }, 0)
        .to('.hero__scroll', { opacity: 0, duration: 0.25, ease: 'none' }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="top" ref={sectionRef} data-nav-theme="light">
      <div className="hero__backdrop" aria-hidden="true">
        <span className="hero__streak hero__streak--a" />
        <span className="hero__streak hero__streak--b" />
        <span className="hero__streak hero__streak--c" />
        <span className="hero__wash" />
      </div>
      <div className="hero__veil" aria-hidden="true" />

      <div className="hero__inner shell">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow" data-reveal>
            Digital Experience Studio
          </p>

          <h1 className="hero__headline">
            {HEADLINE.map((line, i) => (
              <span
                key={line.text}
                className="hero__line"
                data-reveal-mask
                style={{ ['--reveal-delay' as string]: `${120 + i * 78}ms` }}
              >
                <span className={line.accent ? 'accent' : undefined}>{line.text}</span>
                {/* Separator so the h1 reads as one sentence, not run-together words. */}
                {' '}
              </span>
            ))}
          </h1>

          <p
            className="hero__lead"
            data-reveal
            style={{ ['--reveal-delay' as string]: '680ms' }}
          >
            Websites, e-commerce and immersive digital experiences that transform brands and
            drive real results.
          </p>

          <a
            ref={ctaRef}
            className="cta-inline hero__cta"
            href="#contact"
            data-reveal
            style={{ ['--reveal-delay' as string]: '780ms' }}
          >
            <span className="cta-inline__dot">
              <Arrow />
            </span>
            <span className="cta-inline__label">Start a project</span>
          </a>
        </div>

        <div className="hero__visual">
          {/* The mark itself lives in the page-level <RupeStage/>. This only
              reserves the space it parks in, so the hero layout is unchanged
              whether the canvas is up yet or not. */}
          <div className="hero__logo-slot" aria-hidden="true" />
          <MoveForwardBadge />
        </div>
      </div>

      <a className="hero__scroll" href="#work">
        <span className="hero__scroll-dot" aria-hidden="true" />
        Scroll to discover
      </a>
    </section>
  );
}
