# Rebuilding the RUPE mark as procedural Three.js

Reference: `assests/logo sem fundo.png` (1024×1024 RGBA)
Output:    `src/three/rupeMarkPath.ts` → `src/three/createRupeLogo.ts` → `createRupeLogo(): THREE.Group`

This follows the img2threejs workflow — analyse, decompose, contract, spec, build,
verify against the reference — with one deliberate departure noted under
*Departure from the photographic route*.

---

## 1. Image analysis

The mark is a **monoline construction**: one ribbon of constant width folded into a
rounded-corner play triangle with an interlocking R / E / F monogram inside it.

Measured from the source, not estimated:

| Property | Value | Method |
| --- | --- | --- |
| Mark bounding box | 516 × 518 px at (254,252)–(769,769) | ink mask extents |
| Aspect (w/h) | 0.99613 | bbox |
| Ink colour | `#421151` (median `rgb(66,17,81)`) | median over ink pixels |
| Stroke width | 36 px → **0.0695** normalised | 2 × p95 of the distance transform |
| Ink components | **2** (93 644 px + 8 502 px) | `scipy.ndimage.label` |
| Background components | **1** | `scipy.ndimage.label` on the complement |
| Holes | **0** | consequence of the above |

The last row is the finding that shaped the build. Every white area *looks* enclosed,
but the background is a single connected region — each interior counter drains to the
outside through a gap in the strokes. So the mark needs **no hole contours**: two closed
rings describe it exactly.

**Identity-defining features** (a pass fails if any of these is wrong, whatever the
global score says):

- the rounded-corner play triangle, open at its top vertex
- the interlocking monogram strokes and their counterforms
- the arrow tip inside the right-hand vertex
- the detached horizontal bar at lower centre-right
- constant stroke width across the whole construction

**What the single view hides:** nothing about the silhouette — it is a flat vector
mark, fully described by one orthographic view. It says nothing about depth or edge
treatment, which are therefore art direction rather than reconstruction.

## 2. Contour intake — `tools/export_logo.py`

1. Build a soft ink mask from alpha × darkness.
2. Marching squares at the 0.5 iso-level (`matplotlib.contour`).
3. Ramer–Douglas–Peucker simplification, ε = 0.45 source px.
4. Clean each ring: weld vertices closer than 0.35 px, drop turns flatter than 0.9°.
5. Normalise to model space — Y-up, origin at the bbox centre, height = 1 — force CCW.
6. Emit `src/three/rupeMarkPath.ts` (215 + 26 vertices) and `public/rupe-mark.svg`.

The 2D mark in the navbar, footer, About watermark and final CTA is drawn from the
*same* array (`src/components/RupeMark.tsx`), so the flat and extruded marks cannot
drift apart.

## 3. Verification — `tools/verify_trace.py`

Rasterise the emitted rings and score against the thresholded reference mask.

```
IoU = 0.97047   missing = 388 px   extra = 2406 px
```

An ε sweep from 0.9 → 0.2 px held IoU at 0.971–0.973, so the residual is **not**
simplification error — it is the ~1 px antialias fringe around a shape with a very
long perimeter. `tools/out/trace_compare.png` shows the overlay: solid violet where the
two agree, with error confined to a hairline at the edges.

## 4. Component decomposition — `tools/decompose.py`

Zhang–Suen thinning → cut the skeleton at junction clusters → re-chain segments across
junctions by direction continuity (smallest turn wins) → partition every ink pixel to
its nearest stroke. Result: **17 strokes** whose union is exactly the traced silhouette
(`tools/out/parts_preview.png`).

This is intake evidence, and the basis for any future per-stroke animation. It is
**not** what the shipped geometry uses: the reference hero render is one continuous
bevelled solid, and per-stroke meshes would put bevel seams in the middle of strokes
rather than at the crossings. The decomposition is recorded; the build stays whole.

## 5. Build — `src/three/createRupeLogo.ts`

```
THREE.Shape per ring
  → ExtrudeGeometry  depth 0.115, bevelSize = bevelThickness = 0.0105, 4 bevel segments
  → translate to the extrusion mid-plane
  → toCreasedNormals(34°)   sharp faces, smooth rounded edges
```

The bevel is 15 % of the 0.0695 stroke width, which keeps it clear of self-intersection
at the tightest concave junctions.

`RupeLogo extends THREE.Group`, so the page drives `position`, `rotation` and `scale`
directly, plus `setMaterial({ color, roughness, clearcoat, envMapIntensity, … })` and
`dispose()`. Children are named `rupe-mark-ribbon` and `rupe-mark-bar`.

## 6. Material and lighting

Sampled from the reference hero render (violet pixels only):

| | p20 | median | p80 |
| --- | --- | --- | --- |
| reference | `#391473` | `#6534a9` | `#9870d4` |

Matching that meant two things beyond picking a base colour:

- **A procedural studio env**, not a generic room: a 512×256 equirect canvas with a
  white ceiling, a narrow bright horizon strip (this is what draws the crisp line along
  each bevel), two softbox strips and a violet floor bounce, run through `PMREMGenerator`.
- **Point lights rather than directional ones.** The mark's front face has a single
  normal, so a directional key renders it as one flat tone. Point falloff is what paints
  the gradient across the face that the reference shows.

Finish: polished violet resin — `clearcoat: 1`, `clearcoatRoughness: 0.03`,
`roughness: 0.13`, `metalness: 0.06`, a trace of iridescence (0.07) for the lilac rim.
Deliberately not metal, not neon, not toy plastic.

## 7. Motion, interaction and performance

The mark is directly manipulable: drag it with a mouse, swipe it on a phone, or focus it
and use the arrow keys (Home or Escape resets). A flick carries momentum, and releasing
leaves the mark where the visitor put it — it only drifts home after 2.6 s of no
interaction, and not at all while the pointer is still hovering it.

Yaw is unbounded: the mark spins a full 360° and keeps going, so both edges and the back
of the plate are reachable. Pitch keeps a rubber-banded limit at ±1.0 rad — travel past
it meets resistance and springs back — because tipping further gimbals the Euler order
and reads as a glitch rather than a rotation.

Free spin needs two details to behave. The settle target is the *nearest whole turn*
rather than zero, so a mark spun three times settles into the turn it is already in
instead of unwinding all three; and once it lands on a whole turn, that turn is folded
out of both the target and the applied offset, which keeps the accumulated angle from
growing without bound across a long session. The idle drift is likewise read through
`wrapAngle`, so accumulated turns do not permanently suppress it.

Tunables: `DRAG_YAW_PER_WIDTH`, `PITCH_LIMIT_ABS`, `SPIN_DECAY` and `RETURN_DELAY_MS` at
the top of `src/three/LogoScene.ts`.

On touch, drag drives yaw only and the canvas is `touch-action: pan-y`, so a finger on
the mark still scrolls the page vertically while horizontal swipes rotate it.

The idle drift is two detuned sines, not a linear creep. A creep is unbounded — at
0.02 rad/s the hero composition wandered roughly 69° off its designed pose every minute
and never came back, which only became visible once the mark was expected to return to
rest after a drag.

Around that: idle drift + float that fades down as the visitor's own angle takes over,
damped pointer parallax that yields entirely during a drag, and a damped hero-scroll
response that pushes the mark back as the dark panel rises. Under
`prefers-reduced-motion` there is no idle, parallax or momentum — but dragging still
works, since it is visitor-driven rather than ambient; the mark keeps the angle it is
left at and the frame loop parks between interactions.

The scene pauses when off screen or when the tab hides, caps DPR at 1.75 (1.5 on the
lite path), drops to two lights and a coarser bevel on mobile, disposes every geometry,
material and render target on teardown, and three.js loads on its own chunk after first
paint.

## Departure from the photographic route

The img2threejs staged sculpt (blockout → structure → form → material → lighting →
interaction → optimization) exists to converge on a volume that a single photograph only
partially reveals. That uncertainty does not exist here: the subject is a flat vector
mark whose silhouette one view describes completely, and the correct reconstruction is
an exact contour measurement rather than an inferred form. So the geometry is settled in
one pass and gated on a measured IoU instead of a per-pass visual score, and the
projection and multi-angle steps are recorded as skipped with that reason in
`.img2threejs/state.json`. Everything else — analysis before inference, a written
quality contract, component decomposition, a spec before code, and verification against
the reference — was followed.

Artifacts: `.img2threejs/state.json`, `.img2threejs/rupe-mark-sculpt-spec.json`.
