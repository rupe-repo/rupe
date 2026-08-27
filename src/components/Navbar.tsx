import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Wordmark } from './RupeMark';
import { ArrowButton } from './ArrowButton';
import { loadFlip } from '../lib/gsapPlugins';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
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

  /**
   * The four links physically travel between the bar and the panel.
   *
   * Both lists render the same `LINKS`, so they are the same four items in two
   * places — a shared-element transition, which is what Flip is for. Matching
   * is by `data-flip-id`, so Flip animates the 12px bar link into the 4rem
   * panel link and back rather than cross-dissolving two unrelated lists.
   *
   * Progressive enhancement, on three counts. It needs both lists on screen,
   * so it only runs at >=1024px where `.nav__links` is `display: flex`; below
   * that the bar links do not exist and the existing CSS transition is
   * untouched. It is skipped under reduced motion. And if the plugin has not
   * arrived yet the menu simply opens the way it always did — the toggle never
   * waits on a network fetch.
   */
  const flipRef = useRef<Awaited<ReturnType<typeof loadFlip>> | null>(null);
  const flipState = useRef<ReturnType<NonNullable<typeof flipRef.current>['getState']> | null>(null);
  const flipTween = useRef<gsap.core.Timeline | null>(null);
  const flipTimer = useRef(0);
  const canFlip = useMediaQuery('(min-width: 1024px)');

  /**
   * Put both lists back under CSS's control, from any state.
   *
   * Sending the timeline to its end runs Flip's own teardown of the inline
   * width/height/transform it wrote. Reentrant on purpose: `progress(1)` fires
   * `onComplete`, which lands back here, and the null-out above the kill makes
   * the second pass a no-op.
   */
  const clearFlip = () => {
    const tl = flipTween.current;
    flipTween.current = null;
    window.clearTimeout(flipTimer.current);
    tl?.progress(1).kill();
    panelRef.current?.classList.remove('is-flipping');
  };

  // Fetched on intent, not on mount: the bundle stays out of the entry chunk
  // and out of the first-open latency.
  const primeFlip = () => {
    if (flipRef.current || !canFlip || prefersReducedMotion()) return;
    loadFlip().then((Flip) => {
      flipRef.current = Flip;
    });
  };

  const toggleMenu = () => {
    const Flip = flipRef.current;
    if (Flip && canFlip && !prefersReducedMotion()) {
      flipState.current = Flip.getState('[data-flip-id]');
    }
    setOpen((v) => !v);
  };

  // Runs after React has committed the new `is-open` classes but before paint,
  // which is the only moment the "before" and "after" layouts both exist.
  useLayoutEffect(() => {
    const state = flipState.current;
    const Flip = flipRef.current;
    flipState.current = null;
    if (!state || !Flip) return;

    // A flip still in the air owns inline styles on both lists; a second one
    // started on top would strand them. Finish the first properly.
    clearFlip();

    // Flip owns opacity and transform for the duration; the panel's own CSS
    // transition on those properties would be a second author on the same
    // values. `is-flipping` switches it off until Flip is done.
    panelRef.current?.classList.add('is-flipping');

    flipTween.current = Flip.from(state, {
      duration: 0.62,
      ease: 'power2.inOut',
      // No `absolute: true`. It lifts both lists out of flow for the duration,
      // and anything that stops the tween early leaves the bar's links
      // absolutely positioned at stale coordinates. The two lists live in
      // different containers, so nothing reflows here that would need it.
      fade: true,
      nested: true,
      onComplete: clearFlip,
    });

    // The callback is not a guarantee — a tab that never gets a frame never
    // fires it, and the links would keep Flip's inline width/height for the
    // rest of the session. This is: the animation is over by now, one way or
    // another.
    flipTimer.current = window.setTimeout(clearFlip, 1000);
  }, [open]);

  // An unmount mid-flight would leave the same residue.
  useEffect(() => clearFlip, []);

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
              <a
                key={link.href}
                className="nav__link"
                href={link.href}
                data-flip-id={link.href}
              >
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
              onPointerEnter={primeFlip}
              onFocus={primeFlip}
              onClick={toggleMenu}
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
              data-flip-id={link.href}
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
