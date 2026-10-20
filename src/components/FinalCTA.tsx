import { useEffect, useRef } from 'react';
import { RupeMark } from './RupeMark';
import { LeadForm } from './LeadForm';
import { gsap } from '../lib/gsap';
import { loadDrawSVG } from '../lib/gsapPlugins';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useContent } from '../i18n/context';
import './FinalCTA.css';

export function FinalCTA() {
  const t = useContent();
  const f = t.finalCta;
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
            {f.eyebrow}
          </p>
          <h2 className="final__title">
            <span data-reveal-mask>
              <span>{f.title}</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
              <span className="accent--dark">{f.titleAccent}</span>
            </span>
          </h2>
          <p className="final__copy" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            {f.copy}
          </p>
          <ul className="final__promise" data-reveal style={{ ['--reveal-delay' as string]: '220ms' }}>
            {f.promise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="final__direct" data-reveal style={{ ['--reveal-delay' as string]: '280ms' }}>
            <p>{f.orWrite}</p>
            {t.whatsapp ? (
              <a
                className="final__whatsapp"
                href={`https://wa.me/${t.whatsapp.number}?text=${encodeURIComponent(t.whatsapp.message)}`}
                target="_blank"
                rel="noopener"
              >
                {t.whatsapp.label} · {t.whatsapp.display}
              </a>
            ) : null}
            <a href={`mailto:${t.contactEmail}`}>{t.contactEmail}</a>
          </div>
        </div>

        <div className="final__form" data-reveal style={{ ['--reveal-delay' as string]: '200ms' }}>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
