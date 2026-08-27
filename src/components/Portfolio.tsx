import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { ProjectCase, type ProjectCaseData } from './ProjectCase';
import { CaseMockup } from './CaseMockup';
import { PlaceholderMockup } from './CaseScreens';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './Portfolio.css';


const CAPABILITIES = [
  'WEB DESIGN',
  'E-COMMERCE',
  'DESENVOLVIMENTO',
  '3D & MOTION',
  'SISTEMAS DE MARCA',
  'EXPERIÊNCIAS COM IA',
];

const CASES: ProjectCaseData[] = [
  {
    index: '01',
    title: ['DOCE & ARTE', 'CONFEITARIA'],
    category: 'E-COMMERCE / WEB DESIGN / DESENVOLVIMENTO',
    description:
      'Transformámos uma experiência de compra dependente de mensagens numa experiência digital mais simples, sofisticada e preparada para crescer.',
    cta: 'Ver projecto',
    status: 'live',
  },
  {
    index: '02',
    title: ['PRÓXIMO PROJECTO', 'EM BREVE'],
    category: 'EM PREPARAÇÃO',
    description:
      'Um novo projecto está em curso. Será publicado aqui assim que estiver no ar.',
    cta: 'Em breve',
    status: 'placeholder',
  },
  {
    index: '03',
    title: ['PRÓXIMO PROJECTO', 'EM BREVE'],
    category: 'EM PREPARAÇÃO',
    description:
      'Um novo projecto está em curso. Será publicado aqui assim que estiver no ar.',
    cta: 'Em breve',
    status: 'placeholder',
  },
];

export function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);

  // Placeholder-case parallax. The live case runs its own scroll choreography
  // in `useCaseScrollMotion`, so it is deliberately excluded here.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.case--placeholder .case__visual').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 4 },
          {
            yPercent: -4,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="portfolio" id="work" ref={sectionRef} data-nav-theme="dark">
      <div className="portfolio__marquee" aria-hidden="true">
        <div className="portfolio__marquee-track">
          {[0, 1].map((pass) => (
            <ul key={pass}>
              {CAPABILITIES.map((item) => (
                <li key={item}>
                  {item}
                  <span>◆</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <header className="portfolio__head shell">
        <p className="eyebrow eyebrow--dark" data-reveal>
          Projectos seleccionados
        </p>
        <h2 className="portfolio__title" data-reveal-mask>
          <span>
            TRABALHO QUE FAZ <span className="accent--dark">MARCAS AVANÇAR.</span>
          </span>
        </h2>
        <p className="portfolio__note" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
          Cada projecto começa com uma pergunta simples: o que precisa de acontecer depois
          de alguém chegar até aqui?
        </p>
      </header>

      <div className="portfolio__cases">
        {CASES.map((item) => (
          <ProjectCase
            key={item.index}
            {...item}
            motion={item.status === 'live' ? 'scrub' : 'reveal'}
            visual={
              item.status === 'live' ? <CaseMockup /> : <PlaceholderMockup index={item.index} />
            }
          />
        ))}
      </div>
    </section>
  );
}
