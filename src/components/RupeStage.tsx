import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useIsMobile } from '../hooks/useMediaQuery';
import {
  DESKTOP_JOURNEY,
  MOBILE_JOURNEY,
  poseAt,
  resolveJourney,
  type LogoPose,
  type ResolvedKeyframe,
} from '../three/logoChoreography';
import type { LogoScene } from '../three/LogoScene';
import './RupeStage.css';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

/**
 * The RUPE symbol, once, for the whole page.
 *
 * A single fixed canvas holding a single renderer, scene, camera and mark.
 * Sections never own a canvas — they are only anchors the choreography
 * measures. Scrolling moves the mark; nothing is created or destroyed on the
 * way down the page.
 */
export function RupeStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LogoScene | null>(null);
  const framesRef = useRef<ResolvedKeyframe[]>([]);
  const poseRef = useRef<LogoPose>({
    x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, solid: 1, outline: 0,
  });

  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  // -- the one scene ------------------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!hasWebGL()) {
      setFallback(true);
      return;
    }

    let scene: LogoScene | null = null;
    let cancelled = false;

    // Fetch and construct are two different costs and they want opposite
    // schedules. The module is ~137 KB gzipped, mostly three — on a phone that
    // is the long pole, so it starts downloading now, in parallel with the
    // page painting. Construction is main-thread work (extrude, creased
    // normals, PMREM, shader compile) and still waits for idle, below.
    const modulePromise = import('../three/LogoScene');
    // A rejection handled only inside boot() would be an unhandled rejection
    // in the window between here and there.
    modulePromise.catch(() => {});

    const boot = async () => {
      if (cancelled || !hostRef.current) return;
      try {
        const { LogoScene } = await modulePromise;
        if (cancelled || !hostRef.current) return;
        scene = new LogoScene(hostRef.current, {
          profile: isMobile ? 'mobile' : 'desktop',
          reducedMotion: reduced,
          // Mobile: the hero is the only place the mark exists, so the hero is
          // what the frame loop watches. Once it leaves the screen the loop
          // stops and nothing wakes it again. Desktop keeps watching the
          // canvas layer, which is what it has always done.
          visibilityTarget: isMobile
            ? (document.getElementById('top') ?? undefined)
            : undefined,
          // LOW tier: a device that cannot hold a frame rate is served better
          // by the still, which follows the same journey through CSS.
          onTooSlow: () => setFallback(true),
          // A context that never comes back would leave a frozen canvas.
          onContextLost: () => {
            console.warn('[RUPE] WebGL context lost — falling back to the still');
            setFallback(true);
          },
        });
        sceneRef.current = scene;
        setReady(true);
      } catch (error) {
        console.error('[RUPE] WebGL scene failed to start', error);
        setFallback(true);
      }
    };

    // Chrome defers idle callbacks while a tab is hidden, so wait for
    // visibility before asking for idle time.
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
      sceneRef.current = null;
    };
  }, [isMobile, reduced]);

  // -- the journey --------------------------------------------------------
  useEffect(() => {
    const journey = isMobile ? MOBILE_JOURNEY : DESKTOP_JOURNEY;

    // Resize fires many times per drag and re-measuring walks every anchor, so
    // it is coalesced onto one frame. ScrollTrigger's own refresh is debounced
    // the same way rather than re-measuring per notification.
    let measureFrame = 0;
    const measureNow = () => {
      measureFrame = 0;
      framesRef.current = resolveJourney(journey);
      update();
    };
    const measure = () => {
      if (measureFrame) return;
      measureFrame = requestAnimationFrame(measureNow);
    };

    // Cheap enough for a scroll handler: one walk over ~20 keyframes and eight
    // lerps. Everything expensive stays inside the scene's own frame loop.
    const update = () => {
      const pose = poseAt(framesRef.current, window.scrollY, poseRef.current);
      sceneRef.current?.setPose(pose);
      const host = hostRef.current;
      if (host) {
        // Fully transparent means the layer stops being composited at all on
        // mobile (see RupeStage.css) — not just an invisible canvas still
        // being blended over every section beneath it.
        host.classList.toggle('is-off', pose.solid <= 0.004 && pose.outline <= 0.004);
        host.style.setProperty('--px', `${pose.x}`);
        host.style.setProperty('--py', `${pose.y}`);
        host.style.setProperty('--pscale', `${pose.scale}`);
        host.style.setProperty('--prot', `${pose.rotZ}`);
        host.style.setProperty('--popacity', `${Math.max(pose.solid, pose.outline * 0.6)}`);
      }
    };

    measureNow();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('orientationchange', measure);
    ScrollTrigger.addEventListener('refresh', measure);

    return () => {
      if (measureFrame) cancelAnimationFrame(measureFrame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      ScrollTrigger.removeEventListener('refresh', measure);
    };
  }, [isMobile, ready, fallback]);

  return (
    <div
      className={`rupestage ${ready ? 'is-ready' : ''} ${fallback ? 'is-fallback' : ''}`}
      aria-hidden="true"
    >
      <div className="rupestage__host" ref={hostRef}>
        {fallback ? (
          // The still is what the weakest devices actually download, so it is
          // the one asset here worth format-shifting: 152 KB PNG → 15 KB AVIF,
          // same 1024 box (framing is what RupeStage.css animates), cutout
          // alpha intact. The PNG stays as the last fallback.
          <picture>
            <source srcSet="/rupe-logo.avif" type="image/avif" />
            <source srcSet="/rupe-logo.webp" type="image/webp" />
            <img
              className="rupestage__still"
              src="/rupe-logo.png"
              width={1024}
              height={1024}
              alt=""
            />
          </picture>
        ) : null}
      </div>
    </div>
  );
}
