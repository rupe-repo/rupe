import { Arrow } from './ArrowButton';
import { useContent } from '../i18n/context';
import './Story.css';

/**
 * The studio's own story, then what it is for.
 *
 * Three movements in one section, not three cards: how RUPE started, what it
 * sets out to do, and where it wants to go. They share one editorial grid so
 * the eye travels down a single column of thought — the alternative, a row of
 * boxes labelled HISTÓRIA / MISSÃO / VISÃO, would turn a narrative into a
 * specification.
 *
 * No new WebGL here. Everything moves through `[data-reveal]`, which is the
 * page's existing IntersectionObserver primitive, so the section costs nothing
 * the rest of the page was not already paying.
 */
export function Story() {
  const t = useContent();
  const s = t.story;
  return (
    <section className="story" id="story" data-nav-theme="dark">
      <div className="story__glow" aria-hidden="true" />

      <div className="shell story__inner">
        {/* -- the story ---------------------------------------------------- */}
        <header className="story__head">
          <p className="eyebrow eyebrow--dark" data-reveal>
            {s.eyebrow}
          </p>
          {/* Not a date the studio can be held to — a direction. */}
          <p className="story__marker" data-reveal aria-hidden="true">
            {s.marker}
          </p>
        </header>

        <h2 className="story__title">
          <span data-reveal-mask>
            <span>{s.title}</span>
          </span>{' '}
          <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
            <span>
              {s.titleLead} <span className="accent--dark">{s.titleAccent}</span>
            </span>
          </span>
        </h2>

        <div className="story__narrative">
          {s.narrative.map((paragraph, i) => (
            <p key={i} data-reveal style={{ ['--reveal-delay' as string]: `${120 + i * 80}ms` }}>
              {paragraph}
            </p>
          ))}
          <p className="story__turn" data-reveal style={{ ['--reveal-delay' as string]: '360ms' }}>
            {s.turn}
          </p>
        </div>

        <div className="story__signature">
          <p data-reveal>
            <span>{s.signature[0]}</span>
            <span>{s.signature[1]}</span>
            <span className="story__signature-long">
              {s.signature[2]}
            </span>
          </p>
          <a className="story__go" href="#contact" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            {s.go}
            <Arrow />
          </a>
        </div>

        {/* -- what it is for ----------------------------------------------- */}
        <div className="story__pair">
          <article className="story__block">
            <p className="eyebrow eyebrow--dark" data-reveal>
              {s.mission.eyebrow}
            </p>
            <h3 className="story__block-title" data-reveal style={{ ['--reveal-delay' as string]: '80ms' }}>
              {s.mission.title}
            </h3>
            <p data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
              {s.mission.copy}
            </p>
          </article>

          <article className="story__block">
            <p className="eyebrow eyebrow--dark" data-reveal>
              {s.vision.eyebrow}
            </p>
            <h3 className="story__block-title" data-reveal style={{ ['--reveal-delay' as string]: '80ms' }}>
              {s.vision.title}
            </h3>
            <p data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
              {s.vision.copy}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
