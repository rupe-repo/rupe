import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { RupeMark } from './RupeMark';
import { holdUntilReady, release } from '../lib/ready';
import { prefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './Preloader.css';

/**
 * The way in: the mark, then RUPE out from behind it, then the curtain lifts.
 *
 * The whole sequence is CSS (Preloader.css), not a timeline. It is in the
 * prerendered HTML, so it starts on first paint — before the JavaScript has
 * even arrived — and it is short: about 1.6 s end to end. All this component
 * does is wait for those animations to finish, then open the gate for the
 * page's own entrances and leave the DOM.
 *
 * If the JavaScript arrives after the curtain has already lifted, the
 * animations are finished, the wait resolves at once, and the page below is
 * showing its loading skeleton until hydration (see useBooted).
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      release();
      setDone(true);
      return;
    }

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      window.clearTimeout(failsafe);
      release();
      setDone(true);
      // Layout was frozen while this played, so anything measured during it is
      // suspect. One refresh, after the scroll lock is off.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    holdUntilReady();
    // A locked page always unlocks, whatever the animations do.
    const failsafe = window.setTimeout(finish, 4000);

    Promise.all(root.getAnimations({ subtree: true }).map((a) => a.finished)).then(finish, finish);

    return () => window.clearTimeout(failsafe);
  }, []);

  if (done) return null;

  return (
    <div className="preloader" ref={rootRef} role="presentation">
      <div className="preloader__stage">
        <RupeMark className="preloader__mark" />
        {/* The door: its left edge is the mark's right edge, so the word
            parked at -100% is clipped away entirely. */}
        <span className="preloader__window">
          <span className="preloader__word">RUPE</span>
        </span>
      </div>
    </div>
  );
}
