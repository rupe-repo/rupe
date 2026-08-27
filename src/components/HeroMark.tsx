import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { useIsMobile } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { hasWebGL } from '../three/hasWebGL';
import { mobileHeroPose, type LogoPose } from '../three/logoChoreography';
import type { LogoScene } from '../three/LogoScene';
import './HeroMark.css';

/**
 * The RUPE mark on a phone — owned by the hero, not by the viewport.
 *
 * The desktop mark lives in `<RupeStage/>`: one fixed, viewport-sized canvas
 * that the mark travels the whole document inside. That architecture is the
 * reason the mobile mark misbehaved on iOS. Three things were derived from a
 * viewport that Safari resizes on its own as the toolbar collapses mid-scroll:
 *
 *   1. the canvas box itself (`position: fixed; inset: 0`),
 *   2. `baseScale`, which is a function of that box's aspect ratio — so the
 *      mark visibly re-scaled when the toolbar moved,
 *   3. the pose, whose x/y were divided by `innerWidth` / `innerHeight` on
 *      every scroll event.
 *
 * Here the canvas is `position: absolute; inset: 0` inside the hero's logo
 * slot. The slot is sized by layout from the viewport *width* only, so nothing
 * about it changes when the toolbar does. The hero scrolling away carries the
 * canvas away with it, which means there is no position to compute: the only
 * scroll-driven values are the small in-place transform and the fade, both
 * read from one ScrollTrigger anchored to the hero.
 *
 * `.hero` is `overflow: clip`, so the mark is structurally incapable of
 * crossing into WORK — the fade is the look, the clip is the guarantee.
 */
export function HeroMark() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LogoScene | null>(null);
  const poseRef = useRef<LogoPose>({
    x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, solid: 1, outline: 0,
  });

  const [fallback, setFallback] = useState(false);
  // Which path retired the canvas, if any — surfaced as `data-fallback` and in
  // the `?debug` readout, because "the logo went flat" has three possible
  // causes and guessing between them from a desktop is how this went wrong.
  const [reason, setReason] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  // -- the scene ----------------------------------------------------------
  useEffect(() => {
    if (!isMobile) return;
    const host = hostRef.current;
    if (!host) return;
    if (!hasWebGL()) {
      setReason('no-webgl');
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
          profile: 'mobile',
          reducedMotion: reduced,
          // The hero gates the frame loop. Once it leaves the screen the loop
          // stops, and there is no later keyframe that could wake it.
          visibilityTarget: document.getElementById('top') ?? undefined,
          // A phone that cannot draw the mark inside its budget is served
          // better by the still, which follows the identical curve through the
          // same timeline's CSS variables.
          // Unreachable while the mobile scene is frozen — the draw-cost path
          // no longer retires the canvas. Wired for the day it is not.
          onTooSlow: () => {
            setReason('too-slow');
            setFallback(true);
          },
          onContextLost: () => {
            console.warn('[RUPE] WebGL context lost — falling back to the still');
            setReason('context-lost');
            setFallback(true);
          },
        });
        sceneRef.current = scene;
        scene.setPose(mobileHeroPose(0, poseRef.current));
      } catch (error) {
        console.error('[RUPE] hero mark failed to start', error);
        setReason('boot-error');
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
      sceneRef.current = null;
    };
  }, [isMobile, reduced]);

  // -- the one timeline ---------------------------------------------------
  useEffect(() => {
    if (!isMobile) return;
    const host = hostRef.current;
    const hero = document.getElementById('top');
    if (!host || !hero) return;

    // Reduced motion gets the resting pose and no scrub at all.
    if (reduced) {
      const pose = mobileHeroPose(0, poseRef.current);
      sceneRef.current?.setPose(pose);
      host.style.setProperty('--m-opacity', '1');
      return;
    }

    const ctx = gsap.context(() => {
      // One proxy, one timeline, one trigger. Everything the mark does on a
      // phone — scale, rise, roll, fade — is this single number.
      const driver = { p: 0 };

      const publish = () => {
        const pose = mobileHeroPose(driver.p, poseRef.current);
        sceneRef.current?.setPose(pose);
        // The fallback still follows the identical curve through CSS, so the
        // two paths never disagree about where the mark is.
        host.style.setProperty('--m-scale', `${pose.scale}`);
        host.style.setProperty('--m-y', `${pose.y}`);
        host.style.setProperty('--m-rot', `${pose.rotZ}`);
        host.style.setProperty('--m-opacity', `${pose.solid}`);
      };

      gsap.to(driver, {
        p: 1,
        ease: 'none',
        onUpdate: publish,
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      publish();
    }, host);

    return () => ctx.revert();
  }, [isMobile, reduced, fallback]);

  /**
   * `?debug` prints what the device actually measures, on the device.
   *
   * The draw budget was first calibrated from a desktop GPU and was wrong by
   * enough to retire the canvas on real phones. There is no substitute for
   * reading the number off the hardware, and a phone has no console to hand.
   */
  useEffect(() => {
    if (!isMobile) return;
    if (!new URLSearchParams(window.location.search).has('debug')) return;
    const id = window.setInterval(() => {
      const scene = sceneRef.current;
      setDebug(
        [
          `draw ${scene ? scene.lastDrawMs.toFixed(2) : '—'} ms`,
          `dpr ${scene ? scene.dpr.toFixed(2) : '—'}`,
          `budget ${10} ms`,
          reason ? `fallback: ${reason}` : scene ? 'webgl ok' : 'booting',
        ].join(' · '),
      );
    }, 500);
    return () => window.clearInterval(id);
  }, [isMobile, reason]);

  if (!isMobile) return null;

  return (
    <div className="heromark" ref={hostRef} data-fallback={reason ?? undefined}>
      {fallback ? (
        <picture>
          <source srcSet="/rupe-logo.avif" type="image/avif" />
          <source srcSet="/rupe-logo.webp" type="image/webp" />
          <img className="heromark__still" src="/rupe-logo.png" width={1024} height={1024} alt="" />
        </picture>
      ) : null}
      {debug ? <p className="heromark__debug">{debug}</p> : null}
    </div>
  );
}
