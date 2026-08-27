# Doce & Arte — mockup asset

`mockup-*.avif|webp|png` are encoded from the approved composition delivered in
`assests/39123801-d229-42e8-aaad-583e40f1822d.png`. The artwork is unchanged —
only container format and pixel dimensions differ.

| variant | AVIF | WebP | notes                          |
| ------- | ---- | ---- | ------------------------------ |
| 1513w   | 92K  | 167K | full resolution                |
| 1024w   | 60K  | 100K | desktop at DPR 1               |
| 768w    | 40K  | 65K  | mobile                         |
| 1024w   | —    | —    | `mockup-1024.png` (836K) is the `<img>` fallback for engines without WebP |

The source PNG carries a real cutout alpha: the laptop and phone are
silhouetted, with no rectangular backdrop, which is why the composition can sit
straight on the dark section with nothing to mask. That alpha is preserved in
every variant (verified after encoding).

To regenerate after a new delivery:

```bash
python3 - <<'PY'
from PIL import Image
im = Image.open('assests/<new-file>.png').convert('RGBA')
im = im.crop(im.split()[3].getbbox())          # trim dead transparent margin
im.save('tools/out/mockup-trimmed.png')
for w in (1024, 768):
    h = round(im.size[1] * w / im.size[0])
    im.resize((w, h), Image.LANCZOS).save(f'tools/out/mockup-{w}.png')
PY
cd tools/out
for w in 1513 1024 768; do
  src=mockup-$w.png; [ $w = 1513 ] && src=mockup-trimmed.png
  cwebp -q 82 -alpha_q 100 -m 6 "$src" -o "../../public/cases/doce-e-arte/mockup-$w.webp"
  magick "$src" -quality 62 "../../public/cases/doce-e-arte/mockup-$w.avif"
done
```

Then update `NATURAL` and `WIDTHS` in `src/components/CaseMockup.tsx` if the
dimensions changed.
