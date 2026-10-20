/**
 * The RUPE mark's pose: where it sits and how it is turned. The mark holds one
 * pose in the hero — see HeroMark.tsx.
 */
export interface LogoPose {
  /** Offset from viewport centre, in vw. */
  x: number;
  /** Offset from viewport centre, in vh. */
  y: number;
  /** Multiplier on the fitted base scale. */
  scale: number;
  /** Degrees. */
  rotX: number;
  rotY: number;
  rotZ: number;
  /** Opacity of the solid plate, 0…1. */
  solid: number;
  /** Opacity of the outline, 0…1. */
  outline: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Mobile — the mark belongs to the hero, and only to the hero.
 *
 * There is no journey here and no keyframe table, because on a phone the mark
 * no longer travels the document: its canvas lives *inside* the hero, so the
 * hero scrolling away carries it away. Position is layout's job. All this
 * function decides is the small amount of motion the mark performs in place,
 * as a function of the hero's own scroll progress.
 *
 * Nothing here reads `window.innerWidth`, `window.innerHeight`, `scrollY` or
 * the document height. That is the whole point: iOS Safari changes the visible
 * viewport as its toolbar collapses mid-scroll, and any pose derived from it
 * jumps when it does. Progress 0…1 over the hero is toolbar-immune.
 *
 * The envelope is deliberately small. A big transform on a phone is what makes
 * a dropped frame read as a jump.
 */
export const MOBILE_HERO = {
  /** Resting angle. Frontal enough that the monoline mark reads at 390px. */
  rotX: 2,
  rotY: -4,
  /** scale 1 → 1.1 across the hero. */
  scale: [1, 1.1],
  /** Rise, as a percentage of the canvas box — about -35px in the hero slot. */
  y: [0, -9],
  /** Roll, degrees. */
  rotZ: [0, 2],
  /**
   * Opacity ramp, in hero progress. Finished at 0.9, not 1.0: the mark has to
   * be gone *before* the hero hands over, not exactly as it does.
   */
  fade: [0.72, 0.9],
} as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The mobile mark's pose at a given hero progress, 0 (hero top at viewport
 * top) to 1 (hero bottom at viewport top).
 */
export function mobileHeroPose(progress: number, out: LogoPose): LogoPose {
  const t = clamp01(progress);
  const [f0, f1] = MOBILE_HERO.fade;

  // Position is the canvas's own centre; the hero owns where that is.
  out.x = 0;
  out.y = lerp(MOBILE_HERO.y[0], MOBILE_HERO.y[1], t);
  out.scale = lerp(MOBILE_HERO.scale[0], MOBILE_HERO.scale[1], t);
  out.rotX = MOBILE_HERO.rotX;
  out.rotY = MOBILE_HERO.rotY;
  out.rotZ = lerp(MOBILE_HERO.rotZ[0], MOBILE_HERO.rotZ[1], t);
  out.solid = 1 - clamp01((t - f0) / (f1 - f0));
  out.outline = 0;
  return out;
}
