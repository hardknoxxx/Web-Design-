"""Arma las hojas de giro de los platos a partir de los cuadros de render.cjs.

Uso: python3 scripts/sprites/build-sheets.py <carpeta de cuadros> public/platos
Para cada plato: una hoja de 6 x 6 cuadros en dos tamaños (m: 432x324, d: 600x450) y el cuadro 0 suelto
(la foto quieta que trae el HTML), en WebP con transparencia.
"""
import glob
import os
import sys

from PIL import Image

CUADROS = 36
COLS = 6
TALLAS = {'m': (432, 324), 'd': (600, 450)}

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
ids = sorted({os.path.basename(f).rsplit('-', 1)[0] for f in glob.glob(os.path.join(src, '*-00.png'))})
for pid in ids:
    cuadros = [Image.open(os.path.join(src, f'{pid}-{i:02d}.png')).convert('RGBA') for i in range(CUADROS)]
    for t, (w, h) in TALLAS.items():
        hoja = Image.new('RGBA', (w * COLS, h * COLS), (0, 0, 0, 0))
        for i, c in enumerate(cuadros):
            hoja.paste(c.resize((w, h), Image.LANCZOS), ((i % COLS) * w, (i // COLS) * h))
        hoja.save(os.path.join(dst, f'{pid}-giro-{t}.webp'), 'WEBP', quality=70, method=6)
        cuadros[0].resize((w, h), Image.LANCZOS).save(os.path.join(dst, f'{pid}-{t}.webp'), 'WEBP', quality=86, method=6)
    print(pid, 'ok')
