/**
 * The gate between the preloader and the page's own entrances.
 *
 * Without it the hero would perform its whole arrival behind the curtain and
 * be sitting there, already settled, the moment the curtain opened — the
 * entrance would exist but nobody would see it. Anything that animates on
 * arrival waits on this instead of on mount.
 *
 * It resolves immediately when there is no preloader (reduced motion, a failed
 * boot, a page that never had one), so callers never need to know which case
 * they are in.
 */
const EVENT = 'rupe:ready';

let released = false;
let hardRelease = 0;

/**
 * Marks the page as gated. Called by the preloader before it plays.
 *
 * The gate only ever closes once per page load. It used to reset `released`,
 * which meant React's development double-invoke re-closed it after the first
 * run had already opened it — and since the preloader's guard had also already
 * tripped, nothing was left to open it again. The page stayed scroll-locked
 * with the curtain removed: no way out, and nothing on screen to explain it.
 */
export function holdUntilReady(): void {
  if (released) return;
  document.documentElement.classList.add('is-preloading');

  // The guarantee, independent of React, of GSAP, and of whether the preloader
  // component still exists: a locked page always unlocks. Everything else here
  // is an optimisation on top of this line.
  if (!hardRelease) hardRelease = window.setTimeout(release, 8000);
}

/** Opens the gate. Safe to call twice; the second call does nothing. */
export function release(): void {
  if (released) return;
  released = true;
  window.clearTimeout(hardRelease);
  document.documentElement.classList.remove('is-preloading');
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Runs `fn` once the page is free to animate — synchronously if it already is.
 * Returns a cleanup that detaches the listener if the caller unmounts first.
 */
export function whenReady(fn: () => void): () => void {
  if (released || !document.documentElement.classList.contains('is-preloading')) {
    fn();
    return () => {};
  }
  const once = () => fn();
  window.addEventListener(EVENT, once, { once: true });
  return () => window.removeEventListener(EVENT, once);
}
