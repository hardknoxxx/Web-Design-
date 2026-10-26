#!/usr/bin/env python3
# Pasa un boceto sobre papel blanco a PNG/WebP con transparencia (color-to-alpha), sin bordes duros.
# Uso: python3 -I scripts/quitar_papel.py entrada.png public/cuaderno/nombre  -> nombre-420.webp y nombre-760.webp
import sys, numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
# el papel: el blanco "de fondo" estimado con un máximo amplio y suavizado (sigue las variaciones de tono)
small = im.resize((im.width//8, im.height//8))
paper = small.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(6)).resize(im.size, Image.BICUBIC)
c = np.asarray(im).astype(np.float32)/255; p = np.clip(np.asarray(paper).astype(np.float32)/255, 0.5, 1)
a = np.clip(np.max((p - c)/p, axis=2), 0, 1)
a = np.clip((a - 0.05)/0.95, 0, 1)  # la textura del papel se va
ae = np.maximum(a, 1e-4)[..., None]
col = np.clip((c - (1 - ae)*p)/ae, 0, 1)
# los bordes del recorte nunca quedan duros: el alfa se desvanece en el 6 % exterior de la imagen
h, w = a.shape
fx = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / (0.06 * w), 0, 1)
fy = np.clip(np.minimum(np.arange(h), np.arange(h)[::-1]) / (0.06 * h), 0, 1)
a = a * np.minimum.outer(fy, fx)
rgba = np.dstack([col*255, a*255]).astype(np.uint8)
o = Image.fromarray(rgba, 'RGBA')
A = o.getchannel('A').point(lambda v: 255 if v > 20 else 0)
x0, y0, x1, y1 = A.getbbox(); m = 6
o = o.crop((max(0, x0-m), max(0, y0-m), min(o.width, x1+m), min(o.height, y1+m)))
for w in (420, 760):
    h = round(o.height * w / o.width)
    o.resize((w, h), Image.LANCZOS).save(f'{out}-{w}.webp', quality=70, method=6, alpha_quality=70)
print(out, o.size, round(o.height/o.width, 3))
