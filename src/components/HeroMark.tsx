import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { hasWebGL } from '../three/hasWebGL';
import { mobileHeroPose, type LogoPose } from '../three/logoChoreography';
import type { LogoScene } from '../three/LogoScene';
import './HeroMark.css';

/**
 * The RUPE mark — in the hero, holding still.
 *
 * The canvas lives inside the hero's logo slot (`position: absolute; inset: 0`)
 * on every screen size, so the hero scrolling away carries the mark away with
 * it. There is no scroll choreography, no idle drift and no drag: the scene is
 * built frozen and non-interactive, draws its pose once, and parks.
 *
 * The slot is sized by layout from the viewport *width*, so nothing about it
 * changes when iOS Safari's toolbar collapses mid-scroll.
 *
 * Until the first frame lands the slot shows the page's loading skeleton
 * (`.hero__logo-slot:not(.is-ready)` in Hero.css); `is-ready` is set here.
 */

/** Three-quarter view on desktop, near-frontal on a phone where the monoline mark must read small. */
const DESKTOP_POSE: LogoPose = {
  x: 0, y: 0, scale: 1.45, rotX: 5, rotY: -24, rotZ: -2, solid: 1, outline: 0,
};

export function HeroMark() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!hasWebGL()) {
      setFallback(true);
      return;
    }

    let scene: LogoScene | null = null;
    let cancelled = false;

    // Fetch now, construct at idle: the module is ~137 KB gzipped and the
    // download is the long pole on a phone, while construction is main-thread
    // work that should not compete with the hero painting.
    const modulePromise = import('../three/LogoScene');
    modulePromise.catch(() => {});

    const boot = async () => {
      if (cancelled || !hostRef.current) return;
      try {
        const { LogoScene } = await modulePromise;
        if (cancelled || !hostRef.current) return;
        scene = new LogoScene(hostRef.current, {
          profile: isMobile ? 'mobile' : 'desktop',
          // Frozen: one pose, drawn once. Not a preference fallback — the design.
          reducedMotion: true,
          interactive: false,
          visibilityTarget: document.getElementById('top') ?? undefined,
          onReady: () => setReady(true),
          onTooSlow: () => setFallback(true),
          onContextLost: () => {
            console.warn('[RUPE] WebGL context lost — falling back to the still');
            setFallback(true);
          },
        });
        scene.setPose(isMobile ? mobileHeroPose(0, { ...DESKTOP_POSE }) : DESKTOP_POSE);
      } catch (error) {
        console.error('[RUPE] hero mark failed to start', error);
        setFallback(true);
      }
    };

    // Chrome defers idle callbacks while a tab is hidden.
    let idle = 0;
    let timer = 0;
    const schedule = () => {
      if (cancelled || idle || timer) return;
      if (window.requestIdleCallback) idle = window.requestIdleCallback(boot, { timeout: 400 });
      else timer = window.setTimeout(boot, 60);
    };
    const onVisible = () => {
      if (!document.hidden) schedule();
    };
    if (document.hidden) document.addEventListener('visibilitychange', onVisible);
    else schedule();

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
      scene?.dispose();
      setReady(false);
    };
  }, [isMobile]);

  // The slot owns the skeleton, so the state is published on it rather than here.
  useEffect(() => {
    hostRef.current?.parentElement?.classList.toggle('is-ready', ready || fallback);
  }, [ready, fallback]);

  return (
    <div className="heromark" ref={hostRef}>
      {fallback ? (
        <picture>
          <source srcSet="/rupe-logo.avif" type="image/avif" />
          <source srcSet="/rupe-logo.webp" type="image/webp" />
          <img className="heromark__still" src="/rupe-logo.png" width={1024} height={1024} alt="" />
        </picture>
      ) : null}
    </div>
  );
}
