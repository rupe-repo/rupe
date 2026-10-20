import { ArrowButton } from './ArrowButton';
import { useContent } from '../i18n/context';
import { formatPrice } from '../i18n/locales';
import { announceIntent } from '../lib/intent';
import './Pricing.css';

/**
 * Three plans, priced in the market's own currency.
 *
 * Each card's heading is the thing people search for ("Landing page",
 * "Loja online"); the plan name sits above it as a label. A plan with no public
 * price yet reads "on request" rather than inventing a number — the same rule
 * the JSON-LD follows, which only emits an Offer for a real price.
 */
export function Pricing() {
  const t = useContent();
  const p = t.pricing;

  return (
    <section className="pricing" id="pricing" data-nav-theme="light">
      <div className="shell">
        <header className="section-head section-head--split pricing__head">
          <div>
            <p className="eyebrow" data-reveal>
              {p.eyebrow}
            </p>
            <h2 className="section-head__title pricing__title">
              <span data-reveal-mask>
                <span>{p.title}</span>
              </span>{' '}
              <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
                <span className="accent">{p.titleAccent}</span>
              </span>
            </h2>
          </div>
          <p className="section-head__note" data-reveal style={{ ['--reveal-delay' as string]: '180ms' }}>
            {p.note}
          </p>
        </header>

        <ul className="plans">
          {p.plans.map((plan, i) => (
            <li
              key={plan.name}
              className={`plan ${plan.featured ? 'plan--featured' : ''}`}
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 110}ms` }}
            >
              <div className="plan__top">
                <span className="plan__name">{plan.name}</span>
                {plan.featured ? <span className="plan__badge">{p.featuredLabel}</span> : null}
              </div>

              <h3 className="plan__kind">{plan.kind}</h3>

              <p className="plan__price">
                {plan.price === null ? (
                  <span className="plan__price-request">{p.onRequest}</span>
                ) : (
                  <data value={plan.price}>{formatPrice(t, plan.price)}</data>
                )}
              </p>

              <p className="plan__summary">{plan.summary}</p>

              <ul className="plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <ArrowButton
                className="plan__cta"
                href="#contact"
                variant={plan.featured ? 'solid' : 'outline'}
                tone={plan.featured ? 'dark' : 'light'}
                magnetic={false}
                onClick={() => announceIntent(plan.kind)}
              >
                {p.cta}
              </ArrowButton>
            </li>
          ))}
        </ul>

        <p className="pricing__footnote" data-reveal>
          {p.footnote}
        </p>
      </div>
    </section>
  );
}
