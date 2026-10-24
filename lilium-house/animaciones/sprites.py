"""Arma los sprites del sitio a partir de los cuadros renderizados con Remotion.

Uso: npm run render (genera out/papel) y después: python3 sprites.py

Los cuadros se renderizan a 1,5x y se achican al tamaño CSS en que se muestran (supermuestreo:
bordes suaves). Una hoja de sprites se decodifica entera en memoria: al tamaño CSS ocupa menos
de la mitad y el primer toque no traba el teléfono.
"""
import glob
import os
from PIL import Image

DEST = os.path.join(os.path.dirname(__file__), '..', 'public', 'anim')
# carpeta, archivo, columnas, tamaño de cada cuadro en el sitio (px CSS, el de la composición)
SETS = [('out/papel', 'papel-comanda.webp', 4, (300, 420))]

os.makedirs(DEST, exist_ok=True)
for folder, name, cols, size in SETS:
    # alfa premultiplicado al achicar: sin halos oscuros en los bordes transparentes
    frames = [Image.open(f).convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA') for f in sorted(glob.glob(os.path.join(folder, '*.png')))]
    w, h = frames[0].size
    rows = -(-len(frames) // cols)
    sheet = Image.new('RGBA', (cols * w, rows * h), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, ((i % cols) * w, (i // cols) * h))
    out = os.path.join(DEST, name)
    sheet.save(out, 'WEBP', quality=82, method=6)
    print(f'{name}: {len(frames)} cuadros de {w}x{h}, grilla {cols}x{rows}, {os.path.getsize(out) // 1024} KB')
