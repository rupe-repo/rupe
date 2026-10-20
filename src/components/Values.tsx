import { useContent } from '../i18n/context';
import './Values.css';

/**
 * What the studio holds itself to.
 *
 * A numbered editorial list, not a grid of value cards: each one is a claim
 * and a consequence, and they read in order. The numerals are large and the
 * rules between them thin, so the section is carried by the type rather than
 * by containers.
 */
export function Values() {
  const t = useContent();
  const v = t.values;
  return (
    <section className="values" id="values" data-nav-theme="light">
      <div className="shell values__inner">
        <header className="values__head">
          {/* Not a repeat of the headline below it — the eyebrow names the
              section, the headline says the thing. */}
          <p className="eyebrow" data-reveal>
            {v.eyebrow}
          </p>
          <h2 className="values__title">
            <span data-reveal-mask>
              <span>{v.title}</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
              <span>
                <span className="accent">{v.titleAccent}</span>
              </span>
            </span>
          </h2>
        </header>

        <ol className="values__list">
          {v.items.map((value, i) => (
            <li
              key={value.title}
              className="values__item"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}
            >
              <span className="values__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
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
