"""
img2threejs / stage1 intake — contour extraction for the RUPE mark.

Produces the ground-truth vector description of the logo mask:
outer contours + inner holes, normalized, y-up, centered on the mark bbox.
"""
import json, sys
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

SRC = "assests/logo sem fundo.png"
OUT = "tools/out/rupe_contours.json"

def load_mask(path, up=1):
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    alpha = a[..., 3].astype(float) / 255.0
    lum = a[..., :3].astype(float).mean(axis=2) / 255.0
    # ink coverage: opaque AND dark
    ink = alpha * (1.0 - np.clip((lum - 0.30) / 0.45, 0, 1))
    return ink

def rdp(points, eps):
    """Ramer-Douglas-Peucker on an open polyline."""
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    d = end - start
    n = np.hypot(*d)
    if n < 1e-9:
        dists = np.hypot(*(points - start).T)
    else:
        dists = np.abs(np.cross(d, points - start)) / n
    i = int(np.argmax(dists))
    if dists[i] > eps:
        left = rdp(points[: i + 1], eps)
        right = rdp(points[i:], eps)
        return np.vstack([left[:-1], right])
    return np.vstack([start, end])

def poly_area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)

def point_in_poly(pt, poly):
    x, y = pt
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y):
            xint = (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi
            if x < xint:
                inside = not inside
        j = i
    return inside

def main():
    eps = float(sys.argv[1]) if len(sys.argv) > 1 else 0.9
    ink = load_mask(SRC)
    ys, xs = np.nonzero(ink > 0.5)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()

    fig = plt.figure()
    cs = plt.contour(ink, levels=[0.5])
    polys = []
    for path in cs.get_paths():
        for verts in path.to_polygons(closed_only=False):
            v = np.asarray(verts, dtype=float)
            if len(v) < 8:
                continue
            if np.hypot(*(v[0] - v[-1])) < 1e-6:
                v = v[:-1]
            polys.append(v)
    plt.close(fig)

    # simplify (close the ring by wrapping through the first vertex)
    simp = []
    for v in polys:
        vv = np.vstack([v, v[:1]])
        s = rdp(vv, eps)[:-1]
        if len(s) >= 3 and abs(poly_area(s)) > 40:
            simp.append(s)

    simp.sort(key=lambda p: -abs(poly_area(p)))

    # outer / hole classification by containment depth
    entries = []
    for i, p in enumerate(simp):
        depth = 0
        for j, q in enumerate(simp):
            if i != j and abs(poly_area(q)) > abs(poly_area(p)) and point_in_poly(p[0], q):
                depth += 1
        entries.append({"poly": p, "depth": depth})

    # normalize: centre on the mark bbox, scale so height == 1, y up
    cx = (x0 + x1) / 2.0
    cy = (y0 + y1) / 2.0
    h = float(y1 - y0)
    shapes = []
    for e in entries:
        p = e["poly"]
        q = np.column_stack([(p[:, 0] - cx) / h, -(p[:, 1] - cy) / h])
        shapes.append({"depth": e["depth"], "area": float(poly_area(q)), "pts": q})

    outers = [s for s in shapes if s["depth"] % 2 == 0]
    holes = [s for s in shapes if s["depth"] % 2 == 1]
    result = []
    for o in outers:
        oh = [h_["pts"].tolist() for h_ in holes
              if point_in_poly(h_["pts"][0], np.asarray(o["pts"]))]
        result.append({"contour": o["pts"].tolist(), "holes": oh,
                       "area": abs(o["area"])})
    result.sort(key=lambda r: -r["area"])

    import os
    os.makedirs("tools/out", exist_ok=True)
    with open(OUT, "w") as f:
        json.dump({"source": SRC, "aspect": float((x1 - x0) / (y1 - y0)),
                   "epsilon_px": eps, "shapes": result}, f)
    print(f"shapes={len(result)} eps={eps}")
    for i, r in enumerate(result):
        print(f"  [{i}] pts={len(r['contour'])} holes={len(r['holes'])} "
              f"holePts={[len(h) for h in r['holes']]} area={r['area']:.4f}")

main()
