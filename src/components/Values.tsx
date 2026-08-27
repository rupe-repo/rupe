import './Values.css';

/**
 * What the studio holds itself to.
 *
 * A numbered editorial list, not a grid of value cards: each one is a claim
 * and a consequence, and they read in order. The numerals are large and the
 * rules between them thin, so the section is carried by the type rather than
 * by containers.
 */
const VALUES = [
  {
    index: '01',
    title: 'ASSUMIR O TRABALHO.',
    copy: 'Assumimos responsabilidade pelo que criamos. Não entregamos algo em que não acreditamos.',
  },
  {
    index: '02',
    title: 'O DETALHE IMPORTA.',
    copy: 'Grandes experiências são construídas através de pequenas decisões bem tomadas.',
  },
  {
    index: '03',
    title: 'CONTINUAR A AVANÇAR.',
    copy: 'Tecnologia muda. Negócios mudam. Nós também.',
  },
  {
    index: '04',
    title: 'CRIAR COM PROPÓSITO.',
    copy: 'Não adicionamos tecnologia apenas porque podemos. Cada decisão precisa de uma razão.',
  },
  {
    index: '05',
    title: 'CONTINUAR HUMANOS.',
    copy: 'Por detrás de cada interface existem pessoas. É para elas que criamos.',
  },
];

export function Values() {
  return (
    <section className="values" id="values" data-nav-theme="light">
      <div className="shell values__inner">
        <header className="values__head">
          {/* Not a repeat of the headline below it — the eyebrow names the
              section, the headline says the thing. */}
          <p className="eyebrow" data-reveal>
            Princípios
          </p>
          <h2 className="values__title">
            <span data-reveal-mask>
              <span>AQUILO EM QUE</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
              <span>
                <span className="accent">ACREDITAMOS.</span>
              </span>
            </span>
          </h2>
        </header>

        <ol className="values__list">
          {VALUES.map((value, i) => (
            <li
              key={value.index}
              className="values__item"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}
            >
              <span className="values__index" aria-hidden="true">
                {value.index}
              </span>
              <h3 className="values__item-title">{value.title}</h3>
              <p className="values__copy">{value.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
