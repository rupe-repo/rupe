import { Arrow } from './ArrowButton';
import './Services.css';

const SERVICES = [
  {
    index: '01',
    title: 'WEBSITES',
    copy: 'Websites rápidos, responsivos e desenvolvidos à medida para comunicar valor, reforçar a marca e transformar atenção em oportunidade.',
    art: 'layers' as const,
  },
  {
    index: '02',
    title: 'E-COMMERCE',
    copy: 'Experiências de compra digitais pensadas para simplificar a decisão, elevar a percepção da marca e facilitar a venda.',
    art: 'bag' as const,
  },
  {
    index: '03',
    title: '3D & IA',
    copy: 'Experiências interactivas que combinam 3D, motion e inteligência artificial para criar interacções digitais memoráveis.',
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
              O que fazemos
            </p>
            <h2 className="section-head__title services__title">
              <span data-reveal-mask>
                <span>SOLUÇÕES DIGITAIS</span>
              </span>{' '}
              <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
                <span>
                  PENSADAS PARA <span className="accent">FAZER AVANÇAR.</span>
                </span>
              </span>
            </h2>
          </div>
          <p className="section-head__note" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            Combinamos estratégia, design e tecnologia para construir experiências digitais
            que reforçam marcas e ajudam negócios a crescer.
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
