import { ArrowButton } from './ArrowButton';
import { useContent } from '../i18n/context';
import { formatPrice } from '../i18n/locales';
import { announceIntent } from '../lib/intent';
import './Care.css';

/**
 * Maintenance: what happens after launch, sold as being found.
 *
 * Each strategy is named the way the industry names it (SEO, GEO, Schema…) and
 * then said in plain words, because the visitor is a small business owner, not
 * a marketer — the tag earns trust, the sentence earns the sale.
 */
export function Care() {
  const t = useContent();
  const c = t.care;

  return (
    <section className="care" id="care" data-nav-theme="dark">
      <div className="care__glow" aria-hidden="true" />
      <div className="shell">
        <header className="section-head section-head--split care__head">
          <div>
            <p className="eyebrow eyebrow--dark" data-reveal>
              {c.eyebrow}
            </p>
            <h2 className="section-head__title care__title">
              <span data-reveal-mask>
                <span>{c.title}</span>
              </span>{' '}
              <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
                <span className="accent--dark">{c.titleAccent}</span>
              </span>
            </h2>
          </div>
          <p className="section-head__note care__note" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            {c.note}
          </p>
        </header>

        <ul className="care__grid">
          {c.items.map((item, i) => (
            <li
              key={item.tag}
              className="care__item"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${(i % 3) * 90}ms` }}
            >
              <span className="care__tag">{item.tag}</span>
              <h3 className="care__item-title">{item.title}</h3>
              <p className="care__copy">{item.copy}</p>
            </li>
          ))}
        </ul>

        <div className="care__foot" data-reveal>
          <p className="care__price">
            {c.price === null ? (
              c.onRequest
            ) : (
              <>
                <data value={c.price}>{formatPrice(t, c.price)}</data>
                <span>{c.per}</span>
              </>
            )}
          </p>
          <ArrowButton
            href="#contact"
            tone="dark"
            size="lg"
            magnetic={false}
            onClick={() => announceIntent(t.form.typeCare)}
          >
            {c.cta}
          </ArrowButton>
        </div>
      </div>
    </section>
  );
}
