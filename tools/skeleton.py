"""Zhang-Suen thinning + skeleton graph utilities (pure numpy/scipy)."""
import numpy as np

N8 = [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]  # P2..P9 clockwise

def _neighbours(img):
    p = [np.roll(np.roll(img, -dy, 0), -dx, 1) for dy, dx in N8]
    return p

def zhang_suen(img):
    img = img.astype(np.uint8).copy()
    img = np.pad(img, 2)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            P = _neighbours(img)
            B = sum(P)
            # transitions 0->1 in the ordered sequence P2..P9,P2
            seq = P + [P[0]]
            A = sum(((seq[i] == 0) & (seq[i+1] == 1)).astype(np.uint8) for i in range(8))
            P2, P3, P4, P5, P6, P7, P8, P9 = P
            if step == 0:
                c1 = (P2 * P4 * P6) == 0
                c2 = (P4 * P6 * P8) == 0
            else:
                c1 = (P2 * P4 * P8) == 0
                c2 = (P2 * P6 * P8) == 0
            rm = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c1 & c2
            if rm.any():
                img[rm] = 0
                changed = True
    return img[2:-2, 2:-2].astype(bool)

def neighbour_count(sk):
    s = np.zeros(sk.shape, np.uint8)
    for dy, dx in N8:
        s += np.roll(np.roll(sk, -dy, 0), -dx, 1).astype(np.uint8)
    return s * sk

def prune(sk, min_len=6):
    """Remove short spurs (thinning artefacts at stroke ends/corners)."""
    sk = sk.copy()
    for _ in range(min_len):
        nc = neighbour_count(sk)
        ends = sk & (nc == 1)
        if not ends.any():
            break
        sk[ends] = False
    return sk

def branches(sk):
    """Split the skeleton into polylines cut at junctions (deg>=3) and endpoints."""
    nc = neighbour_count(sk)
    nodes = sk & ((nc >= 3) | (nc == 1))
    pts = {(int(y), int(x)) for y, x in zip(*np.nonzero(sk))}
    nodeset = {(int(y), int(x)) for y, x in zip(*np.nonzero(nodes))}

    def nb(p):
        y, x = p
        return [(y+dy, x+dx) for dy, dx in N8 if (y+dy, x+dx) in pts]

    used = set()
    out = []
    for n in sorted(nodeset):
        for start in nb(n):
            e = frozenset((n, start))
            if e in used:
                continue
            path = [n, start]
            used.add(e)
            cur, prev = start, n
            while cur not in nodeset:
                nxt = [q for q in nb(cur) if q != prev]
                if not nxt:
                    break
                # prefer 4-connected continuation
                nxt.sort(key=lambda q: abs(q[0]-cur[0]) + abs(q[1]-cur[1]))
                prev, cur = cur, nxt[0]
                used.add(frozenset((prev, cur)))
                path.append(cur)
            out.append(path)
    # isolated loops with no nodes
    seen = {p for b in out for p in b}
    rest = pts - seen
    while rest:
        s = next(iter(rest))
        path = [s]; rest.discard(s); cur, prev = s, None
        while True:
            nxt = [q for q in nb(cur) if q != prev and q in rest]
            if not nxt: break
            prev, cur = cur, nxt[0]; rest.discard(cur); path.append(cur)
        if len(path) > 3:
            out.append(path)
    return out
