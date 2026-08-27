import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RUPE_MARK_RINGS, RUPE_MARK_ASPECT } from './rupeMarkPath';
import { createMarkMaterial, type MarkMaterialParams } from './materials';

/**
 * Two art directions, not one model at two sizes.
 *
 * `desktop` keeps the deep, glossy plate the hero was designed around.
 * `mobile` is a shallower, cleaner cut: the side walls of a 0.115 extrusion
 * eat a third of a 390px-wide mark once it turns, so depth is traded for
 * frontal fidelity — silhouette first.
 */
export type LogoProfile = 'desktop' | 'mobile';

export const LOGO_PROFILES = {
  desktop: { depth: 0.115, bevel: 0.0105, bevelSegments: 4, crease: 34, simplify: 0 },
  // 0.0018 model units is ~0.8px once the mark is drawn at phone size, i.e.
  // under the antialias fringe. It takes the contour from 215+26 points to
  // 149+17 and the mesh from 3848 to 2648 triangles, at 0.06% / 0.6% area
  // drift — silhouette intact, a third of the vertex data gone.
  mobile: { depth: 0.052, bevel: 0.0062, bevelSegments: 3, crease: 26, simplify: 0.0018 },
} as const satisfies Record<LogoProfile, {
  depth: number; bevel: number; bevelSegments: number; crease: number; simplify: number;
}>;

export interface RupeLogoOptions {
  /** Extrusion depth in model units (mark height = 1). */
  depth?: number;
  /** Rounded-edge size. Kept well under the 0.066 stroke width to avoid pinching. */
  bevel?: number;
  /** Bevel subdivisions — 1 on low-power devices, 4 on desktop. */
  bevelSegments?: number;
  /** Uniform scale applied to the returned group. */
  scale?: number;
  /** Crease angle for normal generation, in degrees. */
  crease?: number;
  /**
   * Ramer-Douglas-Peucker tolerance applied to the contour before extruding,
   * in model units (mark height = 1). 0 keeps every source point.
   */
  simplify?: number;
  material?: MarkMaterialParams;
}

const DEFAULTS = {
  ...LOGO_PROFILES.desktop,
  scale: 1,
} satisfies Required<Omit<RupeLogoOptions, 'material'>>;

/** Stroke width of the monoline mark, measured from the source art (mark height = 1). */
export const RUPE_STROKE_WIDTH = 0.0695;

/**
 * Ramer-Douglas-Peucker on a flat x,y ring.
 *
 * The closing edge is never a candidate for removal — the polyline runs from
 * the first point to the last and both are pinned — so a simplified ring is
 * still closed and still winds the same way. Iterative, because a 215-point
 * contour recursing on the main thread during boot is exactly the kind of
 * thing that shows up as a dropped frame on a phone.
 */
function simplifyRing(flat: readonly number[], eps: number): readonly number[] {
  const n = flat.length / 2;
  if (eps <= 0 || n < 4) return flat;

  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;

  const stack: number[] = [0, n - 1];
  while (stack.length) {
    const b = stack.pop()!;
    const a = stack.pop()!;
    if (b - a < 2) continue;

    const ax = flat[a * 2];
    const ay = flat[a * 2 + 1];
    const dx = flat[b * 2] - ax;
    const dy = flat[b * 2 + 1] - ay;
    const len = Math.hypot(dx, dy) || 1e-9;

    let far = -1;
    let farIndex = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((flat[i * 2] - ax) * dy - (flat[i * 2 + 1] - ay) * dx) / len;
      if (d > far) {
        far = d;
        farIndex = i;
      }
    }

    if (far > eps) {
      keep[farIndex] = 1;
      stack.push(a, farIndex, farIndex, b);
    }
  }

  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    if (keep[i]) out.push(flat[i * 2], flat[i * 2 + 1]);
  }
  return out;
}

function ringToShape(flat: readonly number[]): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(flat[0], flat[1]);
  for (let i = 2; i < flat.length; i += 2) {
    shape.lineTo(flat[i], flat[i + 1]);
  }
  shape.closePath();
  return shape;
}

function buildComponentGeometry(
  flat: readonly number[],
  opts: Required<Omit<RupeLogoOptions, 'material' | 'scale'>>,
): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(ringToShape(simplifyRing(flat, opts.simplify)), {
    depth: opts.depth - opts.bevel * 2,
    bevelEnabled: opts.bevel > 0,
    bevelThickness: opts.bevel,
    bevelSize: opts.bevel,
    bevelOffset: 0,
    bevelSegments: opts.bevelSegments,
    curveSegments: 1,
    steps: 1,
  });

  // Extrude builds from z = 0 forward; recentre so the group pivots on the plate.
  geometry.translate(0, 0, -opts.depth / 2 + opts.bevel);

  // Sharp faces, smooth rounded edges.
  const creased = toCreasedNormals(geometry, THREE.MathUtils.degToRad(opts.crease));
  geometry.dispose();

  // Extrude writes UVs; nothing samples them. The material is untextured and
  // the environment is sampled through the normal, so the attribute is a third
  // of the vertex payload uploaded to the GPU for nothing.
  creased.deleteAttribute('uv');
  creased.computeBoundingSphere();
  return creased;
}

/**
 * The RUPE mark rebuilt as procedural Three.js geometry.
 *
 * Silhouette data comes from the contour intake in `tools/export_logo.py`
 * (measured IoU 0.970 against the source art — the residue is the antialias
 * fringe of the reference PNG). The mark is a monoline construction whose
 * background is a single connected region, so it needs no holes: two closed
 * rings describe it exactly, the large ribbon body and the detached bar.
 *
 * Returns a `THREE.Group`, so position / rotation / scale are controlled by
 * the caller in the usual way; `setMaterial` reaches the shared material.
 */
export class RupeLogo extends THREE.Group {
  readonly frame: THREE.Mesh;
  readonly accent: THREE.Mesh;
  readonly material: THREE.MeshPhysicalMaterial;

  constructor(options: RupeLogoOptions = {}) {
    super();
    const opts = { ...DEFAULTS, ...options };
    this.name = 'rupe-logo';

    this.material = createMarkMaterial(options.material);

    const [frameRing, accentRing] = RUPE_MARK_RINGS;
    this.frame = new THREE.Mesh(buildComponentGeometry(frameRing, opts), this.material);
    this.frame.name = 'rupe-mark-ribbon';

    this.accent = new THREE.Mesh(buildComponentGeometry(accentRing, opts), this.material);
    this.accent.name = 'rupe-mark-bar';

    this.add(this.frame, this.accent);
    this.scale.setScalar(opts.scale);

    this.userData.aspect = RUPE_MARK_ASPECT;
    this.userData.strokeWidth = RUPE_STROKE_WIDTH;
  }

  setMaterial(params: MarkMaterialParams): void {
    if (params.color !== undefined) this.material.color.set(params.color);
    if (params.sheenColor !== undefined) this.material.sheenColor.set(params.sheenColor);
    if (params.roughness !== undefined) this.material.roughness = params.roughness;
    if (params.metalness !== undefined) this.material.metalness = params.metalness;
    if (params.clearcoat !== undefined) this.material.clearcoat = params.clearcoat;
    if (params.clearcoatRoughness !== undefined) {
      this.material.clearcoatRoughness = params.clearcoatRoughness;
    }
    if (params.envMapIntensity !== undefined) {
      this.material.envMapIntensity = params.envMapIntensity;
    }
    if (params.iridescence !== undefined) this.material.iridescence = params.iridescence;
    this.material.needsUpdate = true;
  }

  dispose(): void {
    this.frame.geometry.dispose();
    this.accent.geometry.dispose();
    this.material.dispose();
  }
}

export function createRupeLogo(options?: RupeLogoOptions): RupeLogo {
  return new RupeLogo(options);
}

/**
 * The mark as a pure outline, drawn from the same contour rings the solid
 * extrudes. Not `EdgesGeometry` of the mesh — that would trace every bevel
 * facet. This is the brand silhouette itself, 241 vertices, which is what the
 * mobile hero dissolves into on its way out.
 */
export function createRupeOutline(color: THREE.ColorRepresentation = '#a97cff'): THREE.LineSegments {
  const positions: number[] = [];
  for (const ring of RUPE_MARK_RINGS) {
    const count = ring.length / 2;
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      positions.push(ring[i * 2], ring[i * 2 + 1], 0);
      positions.push(ring[j * 2], ring[j * 2 + 1], 0);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = 'rupe-mark-outline';
  lines.visible = false;
  return lines;
}
