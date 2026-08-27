import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { loadSplitText } from '../lib/gsapPlugins';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Arrow } from './ArrowButton';
import { useMagnetic } from '../hooks/useMagnetic';
import { HeroMark } from './HeroMark';
import './Hero.css';

const HEADLINE: Array<{ text: string; accent?: boolean }> = [
  { text: 'CRIAMOS' },
  { text: 'EXPERIÊNCIAS', accent: true },
  { text: 'DIGITAIS QUE' },
  { text: 'FAZEM NEGÓCIOS' },
  { text: 'AVANÇAR.', accent: true },
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
            AVANÇAR · AVANÇAR ·&nbsp;
          </textPath>
        </text>
      </svg>
      <Arrow className="hero__badge-arrow" />
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useMagnetic<HTMLAnchorElement>(16);

  /**
   * The headline arrives word by word, out from behind a per-line mask.
   *
   * This replaces six hard-coded `[data-reveal-mask]` blocks. The win is not
   * the extra stagger — it is that SplitText measures the *rendered* lines, so
   * a line that wraps on a narrow screen gets its own mask instead of sharing
   * one 108% translate with the line above it. `autoSplit` re-measures when the
   * font loads or the box changes width, which is exactly when the hard-coded
   * version was wrong.
   *
   * The headline is transparent until the split lands, and a 700ms timer makes
   * that unconditional: a plugin that fails to load must not cost the visitor
   * the h1.
   */
  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;

    const reveal = () => el.classList.add('is-split-ready');
    if (prefersReducedMotion()) {
      reveal();
      return;
    }

    let cancelled = false;
    let split: { revert: () => void } | null = null;
    const failsafe = window.setTimeout(reveal, 700);

    loadSplitText()
      .then((SplitText) => {
        if (cancelled) return;
        window.clearTimeout(failsafe);
        split = SplitText.create(el, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            reveal();
            return gsap.from(self.words, {
              yPercent: 115,
              duration: 0.9,
              ease: 'power3.out',
              stagger: 0.035,
            });
          },
        });
      })
      .catch(reveal);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      split?.revert();
    };
  }, []);

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
            Estúdio de experiências digitais
          </p>

          {/* No `data-reveal-mask` here: SplitText owns this element's reveal,
              and two systems on one transform is exactly the bug the rest of
              this file is careful to avoid. */}
          <h1 className="hero__headline" ref={headlineRef}>
            {HEADLINE.map((line) => (
              <span key={line.text} className="hero__line">
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
            Websites, e-commerce e experiências digitais concebidas para elevar marcas,
            simplificar experiências e gerar resultados.
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
            <span className="cta-inline__label">Falar sobre o projecto</span>
          </a>
        </div>

        <div className="hero__visual">
          {/* Desktop: the mark lives in the page-level <RupeStage/> and this
              only reserves the space it parks in, so the hero layout is the
              same whether the canvas is up yet or not.
              Mobile: <HeroMark/> puts its canvas *in* this slot, so the mark
              is carried by the hero rather than by the viewport. */}
          <div className="hero__logo-slot" aria-hidden="true">
            <HeroMark />
          </div>
          <MoveForwardBadge />
        </div>
      </div>

      <a className="hero__scroll" href="#work">
        <span className="hero__scroll-dot" aria-hidden="true" />
        Descobrir
      </a>
    </section>
  );
}
