import { Arrow } from './ArrowButton';
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
  return (
    <section className="story" id="story" data-nav-theme="dark">
      <div className="story__glow" aria-hidden="true" />

      <div className="shell story__inner">
        {/* -- the story ---------------------------------------------------- */}
        <header className="story__head">
          <p className="eyebrow eyebrow--dark" data-reveal>
            A nossa história
          </p>
          {/* Not a date the studio can be held to — a direction. */}
          <p className="story__marker" data-reveal aria-hidden="true">
            2026 — AVANÇAR
          </p>
        </header>

        <h2 className="story__title">
          <span data-reveal-mask>
            <span>COMEÇOU</span>
          </span>{' '}
          <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
            <span>
              COM UMA <span className="accent--dark">DECISÃO.</span>
            </span>
          </span>
        </h2>

        <div className="story__narrative">
          <p data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
            A RUPE nasceu de dois irmãos e de uma decisão em comum: deixar de seguir caminhos
            traçados por outros e começar a construir o nosso.
          </p>
          <p data-reveal style={{ ['--reveal-delay' as string]: '200ms' }}>
            Deixámos para trás o previsível para criar um estúdio onde design, tecnologia e
            ambição pudessem existir no mesmo lugar.
          </p>
          <p data-reveal style={{ ['--reveal-delay' as string]: '280ms' }}>
            Nunca quisemos construir apenas mais uma agência. Queríamos criar trabalho do qual nos
            pudéssemos orgulhar, construir relações duradouras e provar que o lugar onde começamos
            não determina até onde podemos chegar.
          </p>
          <p className="story__turn" data-reveal style={{ ['--reveal-delay' as string]: '360ms' }}>
            Essa decisão tornou-se a RUPE.
          </p>
        </div>

        <div className="story__signature">
          <p data-reveal>
            <span>Dois irmãos.</span>
            <span>Um estúdio.</span>
            <span className="story__signature-long">
              Uma história que continuamos a construir.
            </span>
          </p>
          <a className="story__go" href="#contact" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            Avançar
            <Arrow />
          </a>
        </div>

        {/* -- what it is for ----------------------------------------------- */}
        <div className="story__pair">
          <article className="story__block">
            <p className="eyebrow eyebrow--dark" data-reveal>
              Missão
            </p>
            <h3 className="story__block-title" data-reveal style={{ ['--reveal-delay' as string]: '80ms' }}>
              Criar experiências digitais que fazem negócios avançar.
            </h3>
            <p data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
              Combinamos design, engenharia e tecnologia para transformar ideias em experiências
              digitais que criam valor real.
            </p>
          </article>

          <article className="story__block">
            <p className="eyebrow eyebrow--dark" data-reveal>
              Visão
            </p>
            <h3 className="story__block-title" data-reveal style={{ ['--reveal-delay' as string]: '80ms' }}>
              Criar para além do esperado.
            </h3>
            <p data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
              Queremos construir um estúdio digital reconhecido pela qualidade, pensamento e
              impacto por detrás de cada projecto — independentemente de onde o próximo desafio
              nos levar.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
