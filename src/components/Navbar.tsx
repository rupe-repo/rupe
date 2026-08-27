import { useEffect, useRef, useState } from 'react';
import { Wordmark } from './RupeMark';
import { ArrowButton } from './ArrowButton';
import './Navbar.css';

const LINKS = [
  { label: 'WORK', href: '#work' },
  { label: 'SERVICES', href: '#services' },
  { label: 'PROCESS', href: '#process' },
  { label: 'ABOUT', href: '#about' },
];

export function Navbar() {
  const [condensed, setCondensed] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The bar inverts over the dark panels. Sections declare their own tone with
  // `data-nav-theme`, and the one crossing the bar's midline wins.
  //
  // A 1px observer band at that midline answers this without reading layout on
  // every scroll event. The band's `rootMargin` depends on the viewport height,
  // so it is rebuilt whenever that changes — baked in once, a shorter viewport
  // (mobile URL bar, device rotation) collapses the band to nothing and the
  // theme silently sticks on light.
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let observer: IntersectionObserver | null = null;
    let rebuildFrame = 0;

    const build = () => {
      rebuildFrame = 0;
      observer?.disconnect();

      const bar = document.querySelector('.nav__inner');
      const line = Math.round((bar?.getBoundingClientRect().height ?? 72) / 2);
      const below = Math.max(0, window.innerHeight - line - 1);

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav-theme]'),
      );
      const crossing = new Set<HTMLElement>();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) crossing.add(el);
            else crossing.delete(el);
          }
          // Later in the document wins, matching how the panels paint.
          let theme = 'light';
          let best = -1;
          for (const el of crossing) {
            const index = sections.indexOf(el);
            if (index > best) {
              best = index;
              theme = el.dataset.navTheme ?? 'light';
            }
          }
          setOnDark(theme === 'dark');
        },
        { rootMargin: `-${line}px 0px -${below}px 0px` },
      );

      sections.forEach((el) => observer!.observe(el));
    };

    const rebuild = () => {
      if (rebuildFrame) return;
      rebuildFrame = requestAnimationFrame(build);
    };

    build();
    window.addEventListener('resize', rebuild, { passive: true });
    window.addEventListener('orientationchange', rebuild);

    return () => {
      if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', rebuild);
      window.removeEventListener('orientationchange', rebuild);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={[
          'nav',
          condensed ? 'is-condensed' : '',
          onDark ? 'is-dark' : '',
          open ? 'is-open' : '',
        ].join(' ')}
      >
        <div className="nav__inner shell">
          <Wordmark className="nav__logo" />

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((link) => (
              <a key={link.href} className="nav__link" href={link.href}>
                <span>{link.label}</span>
                <span aria-hidden="true">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <ArrowButton
              className="nav__cta"
              href="#contact"
              variant="outline"
              size="sm"
              magnetic={false}
            >
              Start a project
            </ArrowButton>

            <button
              ref={toggleRef}
              type="button"
              className="nav__burger"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Sibling of the bar, not a child: the bar's backdrop-filter would
          otherwise become the containing block for this fixed panel. */}
      <div
        id="mobile-menu"
        className={`navpanel ${open ? 'is-open' : ''}`}
        ref={panelRef}
        inert={!open ? true : undefined}
      >
        <nav className="navpanel__links" aria-label="Mobile">
          {LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              style={{ transitionDelay: `${80 + i * 55}ms` }}
              onClick={() => setOpen(false)}
            >
              <span className="navpanel__index">0{i + 1}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="navpanel__foot" style={{ transitionDelay: '320ms' }}>
          <ArrowButton href="#contact" onClick={() => setOpen(false)} magnetic={false}>
            Start a project
          </ArrowButton>
          <p>Digital Experience Studio</p>
        </div>
      </div>
    </>
  );
}
