import { Wordmark } from './RupeMark';
import { Arrow } from './ArrowButton';
import './Footer.css';

const MENU = [
  { label: 'PROJECTOS', href: '#work' },
  { label: 'SERVIÇOS', href: '#services' },
  { label: 'PROCESSO', href: '#process' },
  { label: 'SOBRE', href: '#about' },
  { label: 'CONTACTO', href: '#contact' },
];

const LEGAL = [
  { label: 'PRIVACIDADE', href: '/privacidade' },
  { label: 'COOKIES', href: '/cookies' },
];

// Placeholders — swap for the studio's real handles and address before launch.
const SOCIAL = [
  { label: 'INSTAGRAM', href: '#' },
  { label: 'LINKEDIN', href: '#' },
];

export function Footer() {
  return (
    <footer className="footer" data-nav-theme="dark">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <Wordmark className="wordmark--dark" />
          <p>Estúdio de experiências digitais</p>
        </div>

        <nav className="footer__col" aria-label="Rodapé">
          <h2 className="footer__label">Menu</h2>
          <ul>
            {MENU.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="footer__label">Redes</h2>
          <ul>
            {SOCIAL.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col footer__col--contact">
          <h2 className="footer__label">Contacto</h2>
          <ul>
            <li>
              <a href="mailto:hello@example.com">hello@example.com</a>
            </li>
            <li>
              <a className="footer__schedule" href="#contact">
                Marcar uma conversa
                <Arrow />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer__legal">
        <div className="footer__col">
          <h2 className="footer__label">Legal</h2>
          <ul>
            {LEGAL.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* The public brand is RUPE; the legal entity appears only here, which
            is the one place it is required. */}
        <div className="footer__entity">
          <h2 className="footer__label">Estados Unidos</h2>
          <p>
            RUPE é uma marca operada pela E&amp;F Barons LLC, sociedade constituída nos Estados
            Unidos.
          </p>
        </div>
      </div>

      {/* The last detail of the experience, not a credit line. */}
      <div className="shell footer__signature" aria-hidden="true">
        <p>
          <span>Pensado.</span> <span>Criado.</span> <span>Feito para avançar.</span>
        </p>
        <p className="footer__signature-by">Pela RUPE.</p>
      </div>

      <div className="shell footer__base">
        <p>
          © {new Date().getFullYear()} RUPE / E&amp;F Barons LLC. Todos os direitos reservados.
        </p>
        <a href="#top" className="footer__top">
          Voltar ao topo
          <Arrow />
        </a>
      </div>
    </footer>
  );
}
