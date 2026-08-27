import { Arrow } from './ArrowButton';
import './Services.css';

const SERVICES = [
  {
    index: '01',
    title: 'WEBSITES',
    copy: 'Sites rápidos, responsivos e desenvolvidos para transmitir autoridade.',
    art: 'layers' as const,
  },
  {
    index: '02',
    title: 'E-COMMERCE',
    copy: 'Experiências de compra digitais pensadas para transformar produtos em marcas desejáveis.',
    art: 'bag' as const,
  },
  {
    index: '03',
    title: '3D & AI',
    copy: 'Experiências interativas, motion, 3D e soluções criativas utilizando inteligência artificial.',
    art: 'orbit' as const,
  },
];

/** Small CSS-built objects. Deliberately abstract so they never rival the hero mark. */
function ServiceArt({ kind }: { kind: 'layers' | 'bag' | 'orbit' }) {
  return (
    <div className={`svc__art svc__art--${kind}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export function Services() {
  return (
    <section className="services" id="services" data-nav-theme="light">
      <div className="shell">
        <header className="section-head section-head--split services__head">
          <div>
            <p className="eyebrow" data-reveal>
              What we do
            </p>
            <h2 className="section-head__title services__title">
              <span data-reveal-mask>
                <span>SOLUTIONS THAT</span>
              </span>{' '}
              <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
                <span>
                  DELIVER <span className="accent">RESULTS.</span>
                </span>
              </span>
            </h2>
          </div>
          <p className="section-head__note" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            Combinamos design estratégico, tecnologia e criatividade para criar experiências
            digitais que geram impacto real no seu negócio.
          </p>
        </header>

        <ul className="svc-grid">
          {SERVICES.map((service, i) => (
            <li
              key={service.index}
              className="svc"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 110}ms` }}
            >
              <div className="svc__top">
                <span className="svc__index">{service.index}</span>
                <ServiceArt kind={service.art} />
              </div>
              <h3 className="svc__title">{service.title}</h3>
              <p className="svc__copy">{service.copy}</p>
              <span className="svc__go" aria-hidden="true">
                <Arrow />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
