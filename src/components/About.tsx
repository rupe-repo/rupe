import { RupeMark } from './RupeMark';
import { useContent } from '../i18n/context';
import './About.css';

export function About() {
  const t = useContent();
  const a = t.about;
  return (
    <section className="about" id="about" data-nav-theme="light">
      <div className="shell about__inner">
        <div className="about__mark" aria-hidden="true">
          <RupeMark outline strokeWidth={0.7} />
        </div>

        <div className="about__copy">
          <p className="eyebrow" data-reveal>
            {a.eyebrow}
          </p>

          <h2 className="about__title">
            <span data-reveal-mask>
              <span>{a.title[0]}</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '80ms' }}>
              <span>{a.title[1]}</span>
            </span>
          </h2>

          <p className="about__lead" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            {a.lead}
          </p>

          <p className="about__body" data-reveal style={{ ['--reveal-delay' as string]: '240ms' }}>
            {a.body}
          </p>

          <ul className="about__pillars" data-reveal style={{ ['--reveal-delay' as string]: '300ms' }}>
            {a.pillars.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
