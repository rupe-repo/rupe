import { useEffect } from 'react';

/**
 * Ends the loading skeleton.
 *
 * An inline script in index.html sets `is-booting` on <html> before anything
 * paints; while it is there, every element still waiting for JavaScript renders
 * as a shimmering placeholder (base.css). The first committed render — the
 * hydration of the prerendered page — removes it, and the normal reveals take
 * over. Without JavaScript the class is never set, so there is no skeleton to
 * get stuck on.
 */
export function useBooted() {
  useEffect(() => {
    document.documentElement.classList.remove('is-booting');
  }, []);
}
