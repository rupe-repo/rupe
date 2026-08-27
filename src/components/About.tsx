import { RupeMark } from './RupeMark';
import './About.css';

const PILLARS = ['Design', 'Desenvolvimento', 'Tecnologia', '3D', 'Inteligência artificial'];

export function About() {
  return (
    <section className="about" id="about" data-nav-theme="light">
      <div className="shell about__inner">
        <div className="about__mark" aria-hidden="true">
          <RupeMark outline strokeWidth={0.7} />
        </div>

        <div className="about__copy">
          <p className="eyebrow" data-reveal>
            A RUPE
          </p>

          <h2 className="about__title">
            <span data-reveal-mask>
              <span>NÃO CONSTRUÍMOS</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '80ms' }}>
              <span>APENAS WEBSITES.</span>
            </span>
          </h2>

          <p className="about__lead" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            Criamos experiências que as pessoas recordam.
          </p>

          <p className="about__body" data-reveal style={{ ['--reveal-delay' as string]: '240ms' }}>
            A RUPE trabalha no ponto onde design, engenharia e tecnologia se encontram.
            Tratamos interface, código, 3D e inteligência artificial como partes da mesma
            experiência — porque uma boa ideia só funciona quando cada detalhe trabalha na
            mesma direcção.
          </p>

          <ul className="about__pillars" data-reveal style={{ ['--reveal-delay' as string]: '300ms' }}>
            {PILLARS.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
