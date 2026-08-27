"""
img2threejs / stage3 — emit the procedural path spec for createRupeLogo().

Outputs
  src/three/rupeMarkPath.ts   normalized contours (y-up, height = 1, bbox-centred)
  public/rupe-mark.svg        the same geometry as a crisp 2D asset
"""
import json, os, sys
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

SRC = "assests/logo sem fundo.png"
EPS = 0.45          # RDP tolerance, source pixels
MIN_TURN = 0.9      # degrees — drop vertices flatter than this
MIN_EDGE = 0.35     # source pixels — weld vertices closer than this

def ink_mask():
    a = np.array(Image.open(SRC).convert("RGBA"))
    alpha = a[..., 3] / 255.0
    lum = a[..., :3].mean(axis=2) / 255.0
    return alpha * (1 - np.clip((lum - 0.30) / 0.45, 0, 1))

def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    s, e = pts[0], pts[-1]
    d = e - s
    n = float(np.hypot(*d))
    if n < 1e-9:
        dist = np.hypot(*(pts - s).T)
    else:
        dist = np.abs(d[0] * (pts[:, 1] - s[1]) - d[1] * (pts[:, 0] - s[0])) / n
    i = int(np.argmax(dist))
    if dist[i] > eps:
        return np.vstack([rdp(pts[: i + 1], eps)[:-1], rdp(pts[i:], eps)])
    return np.vstack([s, e])

def clean_ring(p):
    # weld near-duplicate vertices
    keep = [p[0]]
    for q in p[1:]:
        if np.hypot(*(q - keep[-1])) >= MIN_EDGE:
            keep.append(q)
    p = np.array(keep)
    if np.hypot(*(p[0] - p[-1])) < MIN_EDGE and len(p) > 3:
        p = p[:-1]
    # drop almost-collinear vertices
    changed = True
    while changed and len(p) > 4:
        changed = False
        out, i, n = [], 0, len(p)
        skip = set()
        for i in range(n):
            if i in skip:
                continue
            a, b, c = p[(i - 1) % n], p[i], p[(i + 1) % n]
            v1, v2 = b - a, c - b
            n1, n2 = np.hypot(*v1), np.hypot(*v2)
            if n1 < 1e-9 or n2 < 1e-9:
                changed = True
                continue
            cosang = float(np.clip(np.dot(v1, v2) / (n1 * n2), -1, 1))
            if np.degrees(np.arccos(cosang)) < MIN_TURN:
                changed = True
                continue
            out.append(b)
        p = np.array(out)
    return p

def signed_area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y))

def main():
    ink = ink_mask()
    solid = ink > 0.5
    ys, xs = np.nonzero(solid)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    H = float(y1 - y0)

    fig = plt.figure()
    cs = plt.contour(ink, levels=[0.5])
    rings = []
    for path in cs.get_paths():
        for v in path.to_polygons(closed_only=False):
            v = np.asarray(v, float)
            if len(v) < 10:
                continue
            if np.hypot(*(v[0] - v[-1])) < 1e-6:
                v = v[:-1]
            r = clean_ring(rdp(np.vstack([v, v[:1]]), EPS)[:-1])
            if len(r) >= 3 and abs(signed_area(r)) > 60:
                rings.append(r)
    plt.close(fig)
    rings.sort(key=lambda r: -abs(signed_area(r)))

    shapes = []
    for r in rings:
        # image space (y down) -> model space (y up), height-normalised
        q = np.column_stack([(r[:, 0] - cx) / H, -(r[:, 1] - cy) / H])
        if signed_area(q) < 0:            # force CCW
            q = q[::-1]
        shapes.append(q)

    os.makedirs("src/three", exist_ok=True)
    os.makedirs("public", exist_ok=True)

    def fmt(v):
        return repr(round(float(v), 5))

    body = []
    for i, q in enumerate(shapes):
        flat = ", ".join(fmt(v) for v in q.reshape(-1))
        body.append(f"  // component {i}: {len(q)} vertices, area {abs(signed_area(q)):.4f}\n"
                    f"  [{flat}],")
    ts = f"""// GENERATED — do not edit by hand.
// Source: {SRC}
// Pipeline: tools/export_logo.py (img2threejs contour intake, RDP eps={EPS}px)
// Space: model space, Y-up, origin at the mark's bounding-box centre, height = 1.
// Each entry is one closed CCW ring of the mark silhouette, flattened as x,y pairs.

export const RUPE_MARK_ASPECT = {round(float(x1 - x0) / float(y1 - y0), 5)};

export const RUPE_MARK_RINGS: readonly number[][] = [
{chr(10).join(body)}
];
"""
    open("src/three/rupeMarkPath.ts", "w").write(ts)

    # SVG (y-down, viewBox normalised to 100 units tall)
    S = 100.0
    def d_of(q):
        pts = [(v[0] * S + 50 * (x1 - x0) / H, -v[1] * S + 50) for v in q]
        d = f"M{pts[0][0]:.2f} {pts[0][1]:.2f}"
        d += "".join(f"L{px:.2f} {py:.2f}" for px, py in pts[1:])
        return d + "Z"
    vbw = (x1 - x0) / H * S
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vbw:.2f} {S:.2f}" '
           f'fill="currentColor" fill-rule="evenodd" aria-hidden="true">'
           + "".join(f'<path d="{d_of(q)}"/>' for q in shapes) + "</svg>")
    open("public/rupe-mark.svg", "w").write(svg)

    print(f"rings={len(shapes)} verts={[len(q) for q in shapes]} aspect={(x1-x0)/(y1-y0):.4f}")
    print("wrote src/three/rupeMarkPath.ts, public/rupe-mark.svg")

main()
