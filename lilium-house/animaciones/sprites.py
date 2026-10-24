"""Arma los sprites del sitio a partir de los cuadros renderizados con Remotion.

Uso: npm run render (genera out/hoja y out/papel) y después: python3 sprites.py
"""
import glob
import os
from PIL import Image

DEST = os.path.join(os.path.dirname(__file__), '..', 'public', 'anim')
SETS = [('out/hoja', 'hoja-menu.webp', 5), ('out/papel', 'papel-comanda.webp', 4)]

os.makedirs(DEST, exist_ok=True)
for folder, name, cols in SETS:
    frames = [Image.open(f).convert('RGBA') for f in sorted(glob.glob(os.path.join(folder, '*.png')))]
    w, h = frames[0].size
    rows = -(-len(frames) // cols)
    sheet = Image.new('RGBA', (cols * w, rows * h), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, ((i % cols) * w, (i // cols) * h))
    out = os.path.join(DEST, name)
    sheet.save(out, 'WEBP', quality=82, method=6)
    print(f'{name}: {len(frames)} cuadros de {w}x{h}, grilla {cols}x{rows}, {os.path.getsize(out) // 1024} KB')
