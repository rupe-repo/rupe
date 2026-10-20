import { useEffect, useRef, useState } from 'react';
import { ProjectCase, type ProjectCaseData } from './ProjectCase';
import { CaseMockup } from './CaseMockup';
import { PlaceholderMockup } from './CaseScreens';
import { Arrow } from './ArrowButton';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useContent } from '../i18n/context';
import './Portfolio.css';

/** Below this, a press-and-move is still a click. */
const DRAG_THRESHOLD = 6;

/**
 * The work, as a sideways carousel.
 *
 * Native horizontal scrolling with scroll-snap does the moving, so touch,
 * trackpad swipes, shift+wheel and the arrow keys (the track is focusable) all
 * work without script. On top of that: previous/next buttons, a counter, and
 * press-and-drag for a mouse, which has no other way to swipe.
 *
 * `data-lenis-prevent-horizontal` hands sideways gestures over the track to the
 * browser; vertical wheel still belongs to Lenis, so the page keeps scrolling
 * smoothly when the pointer happens to be over a case.
 *
 * Every slide stays in the DOM and in the prerendered HTML — a carousel that
 * only rendered the visible case would hide the rest from search.
 */
export function Portfolio() {
  const t = useContent();
  const p = t.portfolio;
  // The live cases, then the open slots — numbered in the order they appear.
  const cases: ProjectCaseData[] = [
    ...p.cases.map((c) => ({ ...c, status: 'live' as const })),
    { ...p.placeholder, status: 'placeholder' as const },
    { ...p.placeholder, status: 'placeholder' as const },
  ].map((c, i) => ({ ...c, index: String(i + 1).padStart(2, '0') }));

  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const last = cases.length - 1;

  const go = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const to = Math.max(0, Math.min(last, index));
    track.scrollTo({
      left: to * track.clientWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  // The counter follows the track, whatever moved it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Press-and-drag, mouse only — touch and pens already swipe natively.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let startX = 0;
    let startScroll = 0;
    let pointerId: number | null = null;
    let moved = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      moved = false;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        track.setPointerCapture(event.pointerId);
        setDragging(true);
      }
      track.scrollLeft = startScroll - dx;
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!moved) return;
      setDragging(false);
      // Settle on whichever slide is mostly showing, leaning a third of a
      // slide toward the direction of the drag so a short flick still turns.
      const width = Math.max(1, track.clientWidth);
      const bias = Math.sign(startScroll - track.scrollLeft) * -0.35;
      go(Math.round(track.scrollLeft / width + bias));
    };
    // A drag that ends over a link must not also follow it.
    const onClick = (event: MouseEvent) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    };

    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
    track.addEventListener('click', onClick, true);
    return () => {
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
      track.removeEventListener('click', onClick, true);
    };
    // Mounted once: `go` only reads the ref and `last`, which is fixed per market.
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="portfolio" id="work" data-nav-theme="dark">
      <div className="portfolio__marquee" aria-hidden="true">
        <div className="portfolio__marquee-track">
          {[0, 1].map((pass) => (
            <ul key={pass}>
              {p.capabilities.map((item) => (
                <li key={item}>
                  {item}
                  <span>◆</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <header className="portfolio__head shell">
        <p className="eyebrow eyebrow--dark" data-reveal>
          {p.eyebrow}
        </p>
        <h2 className="portfolio__title" data-reveal-mask>
          <span>
            {p.title} <span className="accent--dark">{p.titleAccent}</span>
          </span>
        </h2>
        <p className="portfolio__note" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
          {p.note}
        </p>
      </header>

      <div className="carousel" role="region" aria-roledescription="carousel" aria-label={p.eyebrow}>
        <div
          className={`carousel__track ${dragging ? 'is-dragging' : ''}`}
          ref={trackRef}
          tabIndex={0}
          data-lenis-prevent-horizontal
        >
          {cases.map((item, i) => (
            <div
              key={item.index}
              className="carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} ${p.slideOf} ${cases.length}`}
            >
              <ProjectCase
                {...item}
                visual={
                  item.status === 'live' ? (
                    <CaseMockup alt={p.caseAlt} />
                  ) : (
                    <PlaceholderMockup index={item.index} label={p.placeholder.slot} hint={p.placeholder.cta} />
                  )
                }
              />
            </div>
          ))}
        </div>

        <div className="carousel__controls shell">
          <p className="carousel__count" aria-live="polite">
            <span>{pad(active + 1)}</span> / {pad(cases.length)}
          </p>
          <div className="carousel__progress" aria-hidden="true">
            <i style={{ transform: `scaleX(${(active + 1) / cases.length})` }} />
          </div>
          <div className="carousel__buttons">
            <button
              type="button"
              className="carousel__btn carousel__btn--prev"
              aria-label={p.prev}
              disabled={active === 0}
              onClick={() => go(active - 1)}
            >
              <Arrow />
            </button>
            <button
              type="button"
              className="carousel__btn"
              aria-label={p.next}
              disabled={active === last}
              onClick={() => go(active + 1)}
            >
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
