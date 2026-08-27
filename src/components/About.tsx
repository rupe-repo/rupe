import { RupeMark } from './RupeMark';
import './About.css';

const PILLARS = ['Design', 'Development', 'Technology', '3D', 'Artificial intelligence'];

export function About() {
  return (
    <section className="about" id="about" data-nav-theme="light">
      <div className="shell about__inner">
        <div className="about__mark" aria-hidden="true">
          <RupeMark outline strokeWidth={0.7} />
        </div>

        <div className="about__copy">
          <p className="eyebrow" data-reveal>
            About the studio
          </p>

          <h2 className="about__title">
            <span data-reveal-mask>
              <span>WE DON&apos;T JUST</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '80ms' }}>
              <span>BUILD WEBSITES.</span>
            </span>
          </h2>

          <p className="about__lead" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            We create digital experiences people remember.
          </p>

          <p className="about__body" data-reveal style={{ ['--reveal-delay' as string]: '240ms' }}>
            A RUPE trabalha no ponto onde design, engenharia e tecnologia se encontram — layout,
            código, 3D em tempo real e inteligência artificial tratados como um único material.
            Trabalhamos com poucos projetos por vez, do primeiro esboço até o deploy, para que
            cada decisão continue defensável na tela e no resultado.
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
