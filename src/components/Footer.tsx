import { Wordmark } from './RupeMark';
import { Arrow } from './ArrowButton';
import { useContent, useHref, usePage } from '../i18n/context';
import { blogPath } from '../blog/types';
import { LOCALES } from '../i18n/locales';
import './Footer.css';

// Placeholders — swap for the studio's real handles before launch.
const SOCIAL = [
  { label: 'INSTAGRAM', href: '#' },
  { label: 'LINKEDIN', href: '#' },
];

export function Footer() {
  const t = useContent();
  const href = useHref();
  const home = usePage().kind === 'home';
  const f = t.footer;

  return (
    <footer className="footer" data-nav-theme="dark">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <Wordmark className="wordmark--dark" label={t.homeLabel} href={home ? '#top' : t.seo.path} />
          <p>{t.tagline}</p>
        </div>

        <nav className="footer__col" aria-label={f.menuLabel}>
          <h2 className="footer__label">{f.menuLabel}</h2>
          <ul>
            {f.menu.map((item) => (
              <li key={item.href}>
                <a href={href(item.href)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="footer__label">{f.socialLabel}</h2>
          <ul>
            {SOCIAL.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col footer__col--contact">
          <h2 className="footer__label">{f.contactLabel}</h2>
          <ul>
            <li>
              <a href={`mailto:${t.contactEmail}`}>{t.contactEmail}</a>
            </li>
            {t.whatsapp ? (
              <li>
                <a href={`https://wa.me/${t.whatsapp.number}`} rel="noopener" target="_blank">
                  WHATSAPP {t.whatsapp.display}
                </a>
              </li>
            ) : null}
            <li>
              <a className="footer__schedule" href={href('#contact')}>
                {f.schedule}
                <Arrow />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer__legal">
        <div className="footer__col">
          <h2 className="footer__label">{f.legalLabel}</h2>
          <ul>
            {f.legal.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* The crawlable half of hreflang: every market links to every other,
            each named in its own language. */}
        <nav className="footer__col" aria-label={f.marketsLabel}>
          <h2 className="footer__label">{f.marketsLabel}</h2>
          <ul>
            {LOCALES.map((market) => (
              <li key={market.locale}>
                <a
                  href={home ? market.seo.path : blogPath(market.seo.path)}
                  hrefLang={market.seo.hreflang}
                  lang={market.locale}
                  aria-current={market.locale === t.locale ? 'page' : undefined}
                >
                  {market.marketName.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* The public brand is RUPE; the legal entity appears only here, which
            is the one place it is required. */}
        <div className="footer__entity">
          <h2 className="footer__label">{f.entityLabel}</h2>
          <p>{f.entity}</p>
        </div>
      </div>

      {/* The last detail of the experience, not a credit line. */}
      <div className="shell footer__signature" aria-hidden="true">
        <p>
          <span>{f.signature[0]}</span> <span>{f.signature[1]}</span> <span>{f.signature[2]}</span>
        </p>
        <p className="footer__signature-by">{f.signatureBy}</p>
      </div>

      <div className="shell footer__base">
        <p>
          © {new Date().getFullYear()} RUPE / E&amp;F Barons LLC. {f.rights}
        </p>
        <a href="#top" className="footer__top">
          {f.top}
          <Arrow />
        </a>
      </div>
    </footer>
  );
}
