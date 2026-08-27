/**
 * The RUPE symbol's journey through the page.
 *
 * One mark, one canvas. Every section is a keyframe on a single timeline that
 * the scroll position scrubs — the logo is not re-created, re-parented or
 * re-rendered per section, it simply *is* somewhere else by then.
 *
 * Poses are authored in viewport units so the choreography reads the same on a
 * 390px phone and a 1920px desktop; the scene converts them to world units.
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

export interface LogoKeyframe {
  /** CSS selector for the section this keyframe is anchored to. */
  anchor: string;
  /** Position within that section, 0 = its top edge reaches the viewport top. */
  at: number;
  pose: LogoPose;
  /**
   * When set, `pose.x/y` are measured from this element's centre instead of
   * the viewport's. Layout stays the authority for where the mark belongs, so
   * the hero pose cannot drift away from the space the hero reserved for it.
   */
  anchorTo?: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const pose = (p: Partial<LogoPose>): LogoPose => ({
  x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, solid: 1, outline: 0, ...p,
});

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

/**
 * Desktop: the same three moments, told with the width of the screen — and
 * the mark is a grabbable object throughout the hero, so its resting angle is
 * a three-quarter view that invites a hand rather than a flat front.
 */
export const DESKTOP_JOURNEY: LogoKeyframe[] = [
  { anchor: '#top', at: 0.0, anchorTo: '.hero__logo-slot',
    pose: pose({ scale: 1.3, rotX: 5, rotY: -24, rotZ: -2, solid: 1 }) },

  // PORTAL — crosses toward the middle as it closes in, so the approach has a
  // direction instead of just swelling in place.
  { anchor: '#top', at: 0.55, anchorTo: '.hero__logo-slot',
    pose: pose({ x: -10, y: -4, scale: 1.9, rotX: 3, rotY: -14, solid: 1 }) },
  { anchor: '#top', at: 0.8, pose: pose({ x: -4, scale: 3.2, rotY: -6, rotZ: 4, solid: 0.5, outline: 0.5 }) },
  { anchor: '#top', at: 0.95, pose: pose({ x: 0, scale: 4.6, rotZ: 6, solid: 0, outline: 0.16 }) },

  { anchor: '.portfolio__head', at: 0.4, pose: pose({ scale: 5.4, solid: 0, outline: 0 }) },
  { anchor: '#services', at: 0.9, pose: pose({ scale: 1, solid: 0, outline: 0 }) },

  { anchor: '#process', at: 0.06, pose: pose({ x: 40, y: -15, scale: 0.26, rotY: -14, solid: 0.85 }) },
  { anchor: '#process', at: 0.94, pose: pose({ x: 42, y: 13, scale: 0.26, rotY: -10, rotZ: 8, solid: 0.85 }) },
  { anchor: '#about', at: 0.15, pose: pose({ x: 44, y: 24, scale: 0.24, solid: 0, outline: 0 }) },

  // STORY and VALUES are the mark's absence, and this keyframe is what makes
  // that true. `poseAt` interpolates between neighbours, so without a held
  // state here the ramp from ABOUT's transparent pose to the CTA's solid one
  // would stretch across both new sections — the mark would drift, half
  // visible, over the story it is supposed to leave alone.
  { anchor: '#values', at: 0.92, pose: pose({ x: 44, y: 24, scale: 0.24, solid: 0, outline: 0 }) },

  // Anchored to its own slot rather than to hand-picked vw numbers, which is
  // what used to drop it on top of the START A PROJECT button.
  { anchor: '#contact', at: 0.05, anchorTo: '.final__logo-slot',
    pose: pose({ y: 2, scale: 0.6, rotY: -16, solid: 1 }) },
  { anchor: '#contact', at: 0.45, anchorTo: '.final__logo-slot',
    pose: pose({ y: -3, scale: 0.72, rotY: -10, solid: 1 }) },
  { anchor: '#contact', at: 1.0, anchorTo: '.final__logo-slot',
    pose: pose({ x: 14, y: -14, scale: 0.62, rotZ: 8, solid: 0.25, outline: 0 }) },
];

/** Absolute scroll offset each keyframe sits at, measured from the live layout. */
export interface ResolvedKeyframe extends LogoKeyframe {
  scroll: number;
  /**
   * The `anchorTo` element's centre in *document* space, cached at measure
   * time. Reading it per scroll event forced a layout every frame; its
   * position on screen is just this minus the scroll offset.
   */
  anchorDoc?: { x: number; y: number };
}

export function resolveJourney(frames: LogoKeyframe[]): ResolvedKeyframe[] {
  const scrollY = window.scrollY;
  const resolved: ResolvedKeyframe[] = [];

  for (const frame of frames) {
    const el = document.querySelector(frame.anchor);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + scrollY;
    // `at` runs from the section's top edge reaching the viewport top, to its
    // bottom edge doing the same — the span over which it owns the screen.
    let anchorDoc: { x: number; y: number } | undefined;
    if (frame.anchorTo) {
      const target = document.querySelector(frame.anchorTo);
      if (target) {
        const t = target.getBoundingClientRect();
        anchorDoc = {
          x: t.left + t.width / 2 + window.scrollX,
          y: t.top + t.height / 2 + scrollY,
        };
      }
    }
    resolved.push({ ...frame, scroll: top + frame.at * rect.height, anchorDoc });
  }

  // Authored order is the narrative order. Sections nest (the cases live
  // inside the portfolio), so resolved offsets can come back out of sequence —
  // sorting by offset would scramble the story. Keep the order and push each
  // keyframe past the previous one instead.
  for (let i = 1; i < resolved.length; i++) {
    if (resolved[i].scroll <= resolved[i - 1].scroll) {
      resolved[i].scroll = resolved[i - 1].scroll + 1;
    }
  }
  return resolved;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * Where a keyframe wants the mark, in vw/vh from the viewport centre.
 * Anchored frames derive their position from the cached document-space centre
 * and the current scroll — arithmetic only, no layout read.
 */
const framePos = (f: ResolvedKeyframe, scroll: number) => {
  if (!f.anchorDoc) return { x: f.pose.x, y: f.pose.y };
  return {
    x: (f.anchorDoc.x / window.innerWidth - 0.5) * 100 + f.pose.x,
    y: ((f.anchorDoc.y - scroll) / window.innerHeight - 0.5) * 100 + f.pose.y,
  };
};

/** The pose at a given scroll offset, interpolated between its neighbours. */
export function poseAt(frames: ResolvedKeyframe[], scroll: number, out: LogoPose): LogoPose {
  if (!frames.length) return out;
  if (scroll <= frames[0].scroll) {
    Object.assign(out, frames[0].pose);
    const p = framePos(frames[0], scroll);
    out.x = p.x;
    out.y = p.y;
    return out;
  }
  const last = frames[frames.length - 1];
  if (scroll >= last.scroll) {
    Object.assign(out, last.pose);
    const p = framePos(last, scroll);
    out.x = p.x;
    out.y = p.y;
    return out;
  }

  let i = 0;
  while (i < frames.length - 1 && frames[i + 1].scroll < scroll) i++;
  const a = frames[i];
  const b = frames[i + 1];
  const span = b.scroll - a.scroll;
  const t = span > 0 ? easeInOut((scroll - a.scroll) / span) : 0;

  const pa = framePos(a, scroll);
  const pb = framePos(b, scroll);
  out.x = lerp(pa.x, pb.x, t);
  out.y = lerp(pa.y, pb.y, t);
  out.scale = lerp(a.pose.scale, b.pose.scale, t);
  out.rotX = lerp(a.pose.rotX, b.pose.rotX, t);
  out.rotY = lerp(a.pose.rotY, b.pose.rotY, t);
  out.rotZ = lerp(a.pose.rotZ, b.pose.rotZ, t);
  out.solid = lerp(a.pose.solid, b.pose.solid, t);
  out.outline = lerp(a.pose.outline, b.pose.outline, t);
  return out;
}
