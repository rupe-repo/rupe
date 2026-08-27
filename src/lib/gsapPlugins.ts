import { gsap } from './gsap';

/**
 * GSAP plugins, fetched by whoever needs them.
 *
 * The registration boilerplate in GSAP's docs imports every plugin at module
 * scope. Measured on this project that put +79.5 KB gzipped into the *entry*
 * chunk — the one that blocks first render — for plugins most visitors never
 * trigger. Everything here is a dynamic import instead, so a plugin's weight
 * is only paid by a visitor who actually reaches the thing that uses it, and
 * it never delays the hero.
 *
 * Each loader registers on first call and caches the promise, so calling it
 * from several components costs one fetch.
 *
 * All of these ship in the public `gsap` package: since 3.13 the former Club
 * plugins are free, and this project is on 3.15.
 */

/** Split a heading into lines / words / chars for staggered reveals. ~4.8 KB gz. */
let splitText: Promise<typeof import('gsap/SplitText')['SplitText']> | null = null;
export function loadSplitText() {
  splitText ??= import('gsap/SplitText').then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });
  return splitText;
}

/** FLIP layout transitions — e.g. a portfolio card opening into its case. ~13.7 KB gz. */
let flip: Promise<typeof import('gsap/Flip')['Flip']> | null = null;
export function loadFlip() {
  flip ??= import('gsap/Flip').then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  });
  return flip;
}

/** Progressive stroke drawing on SVG paths. ~3.8 KB gz. */
let drawSVG: Promise<typeof import('gsap/DrawSVGPlugin')['DrawSVGPlugin']> | null = null;
export function loadDrawSVG() {
  drawSVG ??= import('gsap/DrawSVGPlugin').then(({ DrawSVGPlugin }) => {
    gsap.registerPlugin(DrawSVGPlugin);
    return DrawSVGPlugin;
  });
  return drawSVG;
}
