import { Wordmark } from './RupeMark';
import { Arrow } from './ArrowButton';
import './Footer.css';

const MENU = [
  { label: 'WORK', href: '#work' },
  { label: 'SERVICES', href: '#services' },
  { label: 'PROCESS', href: '#process' },
  { label: 'ABOUT', href: '#about' },
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
          <p>Digital Experience Studio</p>
        </div>

        <nav className="footer__col" aria-label="Footer">
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
          <h2 className="footer__label">Social</h2>
          <ul>
            {SOCIAL.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col footer__col--contact">
          <h2 className="footer__label">Contact</h2>
          <ul>
            <li>
              <a href="mailto:hello@example.com">hello@example.com</a>
            </li>
            <li>
              <a className="footer__schedule" href="#contact">
                Schedule a call
                <Arrow />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer__base">
        <p>© {new Date().getFullYear()} RUPE Studio. All rights reserved.</p>
        <a href="#top" className="footer__top">
          Back to top
          <Arrow />
        </a>
      </div>
    </footer>
  );
}
