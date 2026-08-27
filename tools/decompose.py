"""
img2threejs / stage2 — component decomposition of the RUPE mark.

The mark is a monoline construction: one constant-width ribbon system.
We recover the ribbon skeleton, cut it at junction clusters, re-chain the
resulting segments into continuous strokes (smallest turn wins at a
junction), then partition every ink pixel to its nearest stroke. The union
of the parts is exactly the traced silhouette, so identity is preserved
while the model gains an animatable component hierarchy.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from skeleton import zhang_suen, prune, neighbour_count

SRC = "assests/logo sem fundo.png"

def ink_mask():
    a = np.array(Image.open(SRC).convert("RGBA"))
    alpha = a[..., 3] / 255.0
    lum = a[..., :3].mean(axis=2) / 255.0
    return (alpha * (1 - np.clip((lum - 0.30) / 0.45, 0, 1))) > 0.5

def order_component(mask):
    """Order the pixels of a thin 8-connected component into a polyline."""
    pts = [(int(y), int(x)) for y, x in zip(*np.nonzero(mask))]
    S = set(pts)
    def nb(p):
        y, x = p
        return [(y+dy, x+dx) for dy in (-1,0,1) for dx in (-1,0,1)
                if (dy or dx) and (y+dy, x+dx) in S]
    ends = [p for p in pts if len(nb(p)) == 1]
    start = ends[0] if ends else pts[0]
    path, prev, cur = [start], None, start
    while True:
        nxt = [q for q in nb(cur) if q != prev and q not in path[-3:]]
        if not nxt:
            break
        nxt.sort(key=lambda q: abs(q[0]-cur[0]) + abs(q[1]-cur[1]))
        prev, cur = cur, nxt[0]
        path.append(cur)
    return path

def tangent(path, at_end, k=9):
    seg = path[-k:] if at_end else path[:k]
    seg = np.array(seg, float)
    if at_end:
        v = seg[-1] - seg[0]
    else:
        v = seg[0] - seg[-1]
    n = np.linalg.norm(v)
    return v / n if n > 1e-6 else np.array([0.0, 0.0])

def main(scale=2, min_seg=14, out="tools/out/rupe_parts.json"):
    ink = ink_mask()
    H, W = ink.shape
    small = ink[::scale, ::scale]
    sk = prune(zhang_suen(small), 6)

    nc = neighbour_count(sk)
    junc = sk & (nc >= 3)
    junc = ndi.binary_dilation(junc, np.ones((3, 3))) & sk
    segs_mask = sk & ~junc
    lab, n = ndi.label(segs_mask, np.ones((3, 3)))
    paths = []
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() < min_seg:
            continue
        paths.append(order_component(m))
    print(f"skeleton segments kept: {len(paths)} (of {n})")

    # --- re-chain segments through junctions by direction continuity ---
    ends = []   # (segment index, which end, point, tangent)
    for i, p in enumerate(paths):
        ends.append((i, 0, np.array(p[0], float), tangent(p, False)))
        ends.append((i, 1, np.array(p[-1], float), tangent(p, True)))

    JOIN_DIST = 10.0
    pairs = []
    for a in range(len(ends)):
        for b in range(a + 1, len(ends)):
            ia, ea, pa, ta = ends[a]
            ib, eb, pb, tb = ends[b]
            if ia == ib:
                continue
            d = np.linalg.norm(pa - pb)
            if d > JOIN_DIST:
                continue
            # ta points outward from a; continuing means tb ≈ -ta
            cont = float(np.dot(ta, -tb))
            if cont > 0.80:
                pairs.append((cont, a, b))
    pairs.sort(reverse=True)
    linkOf = {}
    for cont, a, b in pairs:
        if a in linkOf or b in linkOf:
            continue
        linkOf[a] = b
        linkOf[b] = a

    # union-find over segments joined end-to-end
    parent = list(range(len(paths)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    def union(x, y):
        x, y = find(x), find(y)
        if x != y: parent[x] = y
    for a, b in linkOf.items():
        union(ends[a][0], ends[b][0])

    groups = {}
    for i in range(len(paths)):
        groups.setdefault(find(i), []).append(i)
    print(f"strokes after chaining: {len(groups)}")

    # --- partition ink pixels to the nearest stroke ---
    strokeLabel = np.zeros(small.shape, np.int32)
    for gi, (root, members) in enumerate(sorted(groups.items()), start=1):
        for m in members:
            for (y, x) in paths[m]:
                strokeLabel[y, x] = gi
    # nearest labelled skeleton pixel for every pixel
    idx = ndi.distance_transform_edt(strokeLabel == 0, return_indices=True)[1]
    nearest = strokeLabel[idx[0], idx[1]]
    full = np.repeat(np.repeat(nearest, scale, 0), scale, 1)[:H, :W]
    partLab = np.where(ink, full, 0)

    counts = np.bincount(partLab.ravel())
    print("part pixel counts:", {i: int(c) for i, c in enumerate(counts) if i and c})
    np.save("tools/out/partLab.npy", partLab)
    # colour preview
    rng = np.random.default_rng(7)
    pal = (rng.random((counts.size, 3)) * 0.7 + 0.25) * 255
    img = np.ones((H, W, 3), np.uint8) * 255
    for i in range(1, counts.size):
        img[partLab == i] = pal[i].astype(np.uint8)
    Image.fromarray(img).resize((760, 760)).save("tools/out/parts_preview.png")
    print("wrote tools/out/parts_preview.png")

if __name__ == "__main__":
    main()
