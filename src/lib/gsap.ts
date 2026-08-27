import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * iOS Safari grows and shrinks the visible viewport as its toolbar collapses
 * during a scroll, and every one of those steps reaches the page as a resize.
 * ScrollTrigger's default answer is a full refresh: re-measure every trigger,
 * mid-gesture, while the finger is still down. That is what makes a scrubbed
 * animation stick and then jump on a real phone.
 *
 * `ignoreMobileResize` makes it refresh on a genuine width or orientation
 * change and ignore a height-only one. It is a no-op on desktop, where the
 * viewport does not move on its own.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
