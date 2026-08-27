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

const pose = (p: Partial<LogoPose>): LogoPose => ({
  x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, solid: 1, outline: 0, ...p,
});

/**
 * Mobile states — hero only, and still.
 *
 * The mark is a 3D object for exactly one moment: the hero. It never comes
 * back — the rest of the page uses the flat SVG mark, which is the same contour
 * data drawn by the compositor instead of by a fragment shader.
 *
 * On a phone it does not move. Every state carries the *same* transform, so
 * scale, rise and roll have nothing to interpolate: only `solid` changes, and
 * only to take the mark off the screen at the end of the hero. Anchored to
 * `.hero__logo-slot`, so it still travels up with the hero content the way any
 * element on the page would — it is pinned to the layout, not animated.
 *
 * The fade is not optional. The canvas is a fixed viewport-sized layer, so a
 * mark that never goes transparent floats over WORK, SERVICES and everything
 * below it.
 *
 * Every state declares every channel, so none can inherit a leftover.
 */
const MOBILE_REST = { scale: 1, rotX: 2, rotY: -4, rotZ: 0 } as const;

const MOBILE_STATES = {
  /** Parked in the hero's reserved slot. Frontal, solid, legible. */
  hero: pose({ ...MOBILE_REST, solid: 1 }),
  /** Same pose, still solid — the hold before it goes. */
  heroLift: pose({ ...MOBILE_REST, solid: 1 }),
  /** Out. Fully transparent before the hero ends, so nothing crosses into WORK. */
  heroOut: pose({ ...MOBILE_REST, solid: 0, outline: 0 }),
} satisfies Record<string, LogoPose>;

/**
 * Mobile: 3D in one place, and it holds still.
 *
 *   HERO   the mark is the object, and the only thing WebGL ever draws.
 *   OUT    a straight fade, finished before WORK THAT MOVES is readable.
 *   NEVER  past the hero there is no pose to reach, so the loop parks and the
 *          canvas is hidden. Work, services, process, about and the CTA are
 *          served by `RupeMark` (SVG) instead.
 *
 * `poseAt` holds the last keyframe for every scroll offset beyond it, so this
 * final fully-transparent state covers the entire rest of the document — there
 * is no later keyframe that could pull the mark back onto the page.
 */
export const MOBILE_JOURNEY: LogoKeyframe[] = [
  { anchor: '#top', at: 0.0, anchorTo: '.hero__logo-slot', pose: MOBILE_STATES.hero },
  { anchor: '#top', at: 0.55, anchorTo: '.hero__logo-slot', pose: MOBILE_STATES.heroLift },
  { anchor: '#top', at: 0.88, anchorTo: '.hero__logo-slot', pose: MOBILE_STATES.heroOut },
  // Bracketed with the identical state: nothing to interpolate toward, ever.
  { anchor: '.portfolio__head', at: 0.0, anchorTo: '.hero__logo-slot',
    pose: MOBILE_STATES.heroOut },
];

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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
