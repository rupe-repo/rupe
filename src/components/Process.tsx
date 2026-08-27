import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './Process.css';


const STEPS = [
  { index: '01', title: 'DISCOVER', copy: 'Entendemos seu negócio, seu público e seus objetivos.' },
  { index: '02', title: 'DESIGN', copy: 'Criamos a estratégia, o design e a experiência.' },
  { index: '03', title: 'BUILD', copy: 'Desenvolvemos com tecnologia de ponta.' },
  { index: '04', title: 'LAUNCH', copy: 'Testamos, otimizamos e colocamos no ar.' },
];

export function Process() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.style.setProperty('--progress', '1');
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { '--progress': 0 },
        {
          '--progress': 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.process__track',
            start: 'top 78%',
            end: 'bottom 62%',
            scrub: 0.5,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>('.step').forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 76%',
          onEnter: () => step.classList.add('is-active'),
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="process" id="process" ref={rootRef} data-nav-theme="dark">
      <div className="process__glow" aria-hidden="true" />
      <div className="shell process__inner">
        <header className="process__head">
          <p className="eyebrow eyebrow--dark" data-reveal>
            Our process
          </p>
          <h2 className="process__title">
            <span data-reveal-mask>
              <span>SIMPLE. CLEAR.</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
              <span className="accent--dark">EFFECTIVE.</span>
            </span>
          </h2>
        </header>

        <ol className="process__track">
          <span className="process__line" aria-hidden="true">
            <i />
          </span>
          {STEPS.map((step, i) => (
            <li
              key={step.index}
              className="step"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
            >
              <span className="step__node" aria-hidden="true">
                {step.index}
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__copy">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
