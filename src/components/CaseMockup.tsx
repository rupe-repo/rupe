import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './CaseMockup.css';

/**
 * The approved Doce & Arte mockup, used exactly as delivered.
 *
 * The source PNG carries a real cutout alpha — the laptop and phone are
 * silhouetted, with no rectangular backdrop — so it sits straight on the dark
 * section with nothing to hide. The glow and contact shadow below are painted
 * behind it and never touch the artwork itself.
 */
const BASE = '/cases/doce-e-arte/mockup';
const WIDTHS = [768, 1024, 1513] as const;
const NATURAL = { width: 1513, height: 1017 };

const srcSet = (ext: string) => WIDTHS.map((w) => `${BASE}-${w}.${ext} ${w}w`).join(', ');

/** Pointer travel budget — a whisper, not a 3D object. */
const MAX_X = 6;
const MAX_Y = 4;
const MAX_TILT = 0.5;

export function CaseMockup({
  alt = 'Projeto Doce & Arte apresentado em desktop e mobile',
}: {
  alt?: string;
}) {
  // Reactive: a device that gains (or loses) a mouse gains or loses the tilt,
  // instead of that being decided once at mount.
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const rootRef = useRef<HTMLElement>(null);
  const enterRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Entrance and scroll drift live in `useCaseScrollMotion`, which owns
  // `.mockup__enter` and `.mockup__drift`. This component only owns the pointer.
  // Pointer response: lerped, fine-pointer only, and bounded to a few pixels.
  useEffect(() => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    if (!root || !tilt) return;
    if (prefersReducedMotion()) return;
    if (!finePointer) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let ticking = false;

    // Rides GSAP's ticker rather than opening a third rAF loop on the page.
    // It detaches the moment the tilt settles, so an idle mockup costs nothing.
    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      tilt.style.setProperty('--mx', `${(current.x * MAX_X).toFixed(2)}px`);
      tilt.style.setProperty('--my', `${(current.y * MAX_Y).toFixed(2)}px`);
      tilt.style.setProperty('--ry', `${(current.x * MAX_TILT).toFixed(3)}deg`);
      tilt.style.setProperty('--rx', `${(-current.y * MAX_TILT).toFixed(3)}deg`);

      if (
        Math.abs(current.x - target.x) < 0.001 &&
        Math.abs(current.y - target.y) < 0.001
      ) {
        stop();
      }
    };

    const start = () => {
      if (ticking || document.hidden) return;
      ticking = true;
      tilt.style.willChange = 'transform';
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!ticking) return;
      ticking = false;
      gsap.ticker.remove(tick);
      tilt.style.willChange = '';
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (Math.abs(current.x - target.x) > 0.001) start();
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      start();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [finePointer]);

  return (
    <figure className="mockup" ref={rootRef}>
      <span className="mockup__glow" aria-hidden="true" />
      <div className="mockup__enter" ref={enterRef}>
        <div className="mockup__drift" ref={driftRef}>
          <div className="mockup__tilt" ref={tiltRef}>
            <span className="mockup__cast" aria-hidden="true" />
            <picture>
              <source
                type="image/avif"
                srcSet={srcSet('avif')}
                sizes="(max-width: 767px) 118vw, (max-width: 1023px) 92vw, (max-width: 1680px) 56vw, 1000px"
              />
              <source
                type="image/webp"
                srcSet={srcSet('webp')}
                sizes="(max-width: 767px) 118vw, (max-width: 1023px) 92vw, (max-width: 1680px) 56vw, 1000px"
              />
              <img
                className="mockup__img"
                src={`${BASE}-1024.png`}
                width={NATURAL.width}
                height={NATURAL.height}
                alt={alt}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </figure>
  );
}
