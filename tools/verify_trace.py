"""img2threejs / verify — rasterize the simplified contours and score IoU vs the reference mask."""
import json, sys
import numpy as np
from PIL import Image, ImageDraw

def ref_mask():
    a = np.array(Image.open("assests/logo sem fundo.png").convert("RGBA"))
    alpha = a[..., 3] / 255.0
    lum = a[..., :3].mean(axis=2) / 255.0
    return (alpha * (1 - np.clip((lum - 0.30) / 0.45, 0, 1))) > 0.5

def main():
    d = json.load(open("tools/out/rupe_contours.json"))
    ref = ref_mask()
    ys, xs = np.nonzero(ref)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    h = float(ys.max() - ys.min())
    H, W = ref.shape
    img = Image.new("1", (W, H), 0)
    dr = ImageDraw.Draw(img)
    for s in d["shapes"]:
        pts = [(p[0] * h + cx, -p[1] * h + cy) for p in s["contour"]]
        dr.polygon(pts, fill=1)
        for hole in s["holes"]:
            hp = [(p[0] * h + cx, -p[1] * h + cy) for p in hole]
            dr.polygon(hp, fill=0)
    got = np.array(img, dtype=bool)
    inter = (got & ref).sum(); union = (got | ref).sum()
    print(f"IoU = {inter/union:.5f}   missing={(ref&~got).sum()}  extra={(got&~ref).sum()}")
    if len(sys.argv) > 1:
        comp = np.zeros((H, W, 3), np.uint8) + 255
        comp[ref] = [220, 220, 220]
        comp[got & ref] = [70, 20, 90]
        comp[got & ~ref] = [255, 0, 0]
        comp[ref & ~got] = [0, 160, 255]
        Image.fromarray(comp).resize((720, 720)).save(sys.argv[1])
        print("wrote", sys.argv[1])

main()
