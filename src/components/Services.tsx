import { Arrow } from './ArrowButton';
import { useContent } from '../i18n/context';
import './Services.css';

const ART = ['layers', 'bag', 'orbit'] as const;


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
  const t = useContent();
  const s = t.services;
  return (
    <section className="services" id="services" data-nav-theme="light">
      <div className="shell">
        <header className="section-head section-head--split services__head">
          <div>
            <p className="eyebrow" data-reveal>
              {s.eyebrow}
            </p>
            <h2 className="section-head__title services__title">
              <span data-reveal-mask>
                <span>{s.title}</span>
              </span>{' '}
              <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
                <span>
                  {s.titleLead} <span className="accent">{s.titleAccent}</span>
                </span>
              </span>
            </h2>
          </div>
          <p className="section-head__note" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            {s.note}
          </p>
        </header>

        <ul className="svc-grid">
          {s.items.map((service, i) => (
            <li
              key={service.title}
              className="svc"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 110}ms` }}
            >
              <div className="svc__top">
                <span className="svc__index">{String(i + 1).padStart(2, '0')}</span>
                <ServiceArt kind={ART[i % ART.length]} />
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
