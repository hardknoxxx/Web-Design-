"""Fotos reales del local (Instagram y sitio oficial) -> mazo de la vitrina y croissant de LATTE.

Uso:  python3 -I scripts/fotos_reales.py <originales> <mejoradas> <recortes> public

- <originales>: las fotos del Instagram tal como llegaron (<id>.jpeg).
- <mejoradas>:  las mismas pasadas por Real-ESRGAN x4plus (<id>.png; ver contexto/HANDOFF.md) y, para el sitio
  oficial, oficial-<nombre>.png. Si falta una mejorada se usa la original.
- <recortes>:   croissant.png, la máscara de rembg/BiRefNet del croissant suelto (zona CROISSANT de la foto).
  La carta usa fotos de estudio generadas con IA (public/carta/), no estas fotos.
Solo usa Pillow y numpy.
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ORIG, MEJ, REC, PUB = (Path(a) for a in sys.argv[1:5])

# id de la foto: (nombre en el mazo, altura del recorte 4:5 de 0 a 1)
MAZO = {
    '1792978943477': ('budin-lima', 0.5),
    '1792978956137': ('brownies-frutos-rojos', 0.55),
    '1792979000825': ('cheesecake-maracuya', 0.5),
    '1792979018575': ('croissant-frutillas', 0.5),
    '1792979038495': ('sandwich-crudo', 0.6),
    '1792979051145': ('tortas-oreo', 0.5),
}
OFICIAL = ['cheesecake-frutos-rojos', 'torta-de-la-vitrina', 'pizzeta']
# zona del croissant dentro de la foto del croissant con huevos (en píxeles de la original de 1440 de ancho)
CROISSANT = (270, 0, 960, 372)


def color(im):
    """Retoque suave: un poco más de luz en las sombras y de color (las fotos del local son oscuras)."""
    im = ImageEnhance.Brightness(im).enhance(1.05)
    im = ImageEnhance.Color(im).enhance(1.05)
    return ImageEnhance.Contrast(im).enhance(1.03)


def mejorada(clave, original):
    p = MEJ / f'{clave}.png'
    im = Image.open(p if p.exists() else original).convert('RGB')
    return color(im)


def webp(im, ruta, calidad=82):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    im.save(ruta, quality=calidad, method=6)


def mazo():
    for k, (n, fy) in MAZO.items():
        im = mejorada(k, ORIG / f'{k}.jpeg')
        w, h = im.size
        tw, th = (w, int(w * 5 / 4)) if w * 5 / 4 <= h else (int(h * 4 / 5), h)
        x, y = (w - tw) // 2, int((h - th) * fy)
        c = im.crop((x, y, x + tw, y + th))
        for W in (480, 800):
            webp(c.resize((W, W * 5 // 4), Image.LANCZOS), PUB / f'fotos/instagram/{n}-{W}.webp', 80)
    for n in OFICIAL:
        p = MEJ / f'oficial-{n}.png'
        if not p.exists():
            continue
        im = color(Image.open(p).convert('RGB'))
        for W in (480, 800):
            webp(im.resize((W, round(im.height * W / im.width)), Image.LANCZOS), PUB / f'fotos/oficial/{n}-{W}.webp', 80)


def inundar(on, semillas):
    h, w = on.shape
    marca = np.zeros_like(on)
    q = deque(semillas)
    for y, x in semillas:
        marca[y, x] = True
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            Y, X = y + dy, x + dx
            if 0 <= Y < h and 0 <= X < w and on[Y, X] and not marca[Y, X]:
                marca[Y, X] = True
                q.append((Y, X))
    return marca


def croissant():
    k = '1792978964993'
    base = mejorada(k, ORIG / f'{k}.jpeg')
    f = base.width / 1440
    im = base.crop(tuple(int(v * f) for v in CROISSANT)).convert('RGBA')
    im.putalpha(Image.open(REC / 'croissant.png').getchannel('A').resize(im.size, Image.LANCZOS))
    im = im.crop(im.getbbox())
    # la máscara se limpia en baja resolución (rápido) y se escala: se borra la clara del huevo que asoma abajo
    chica = im.resize((636, round(im.height * 636 / im.width)), Image.LANCZOS)
    a = np.asarray(chica).astype(float) / 255
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx, mn = a[..., :3].max(-1), a[..., :3].min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    h, w = al.shape
    quitar = np.zeros((h, w), bool)
    quitar[int(h * 0.72):] = True
    quitar &= (sat < 0.45) | (mx > 0.93) | (mx < 0.12)
    on = (al > 0.5) & ~quitar
    cuerpo = inundar(on, [(int(h * 0.45), int(w * 0.5))])
    borde = [(y, x) for y in range(h) for x in (0, w - 1) if not cuerpo[y, x]]
    borde += [(y, x) for x in range(w) for y in (0, h - 1) if not cuerpo[y, x]]
    dentro = ~inundar(~cuerpo, borde)
    k_ = Image.fromarray((dentro * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    alfa = np.minimum(np.asarray(im.getchannel('A')), np.asarray(k_.resize(im.size, Image.LANCZOS)))
    im.putalpha(Image.fromarray(alfa))
    im = im.crop(im.getbbox())
    # sombra horneada: un drop-shadow en CSS se recalcularía en cada cuadro del giro
    pad = round(im.width * 0.063)
    lienzo = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    sombra = Image.new('RGBA', lienzo.size, (61, 35, 20, 0))
    a = Image.new('L', lienzo.size, 0)
    a.paste(im.getchannel('A'), (pad, pad + round(pad * 0.35)))
    sombra.putalpha(a.filter(ImageFilter.GaussianBlur(pad * 0.3)).point(lambda v: int(v * 0.32)))
    lienzo.alpha_composite(sombra)
    lienzo.alpha_composite(im, (pad, pad))
    for W in (520, 900):
        H = round(lienzo.height * W / lienzo.width)
        webp(lienzo.resize((W, H), Image.LANCZOS), PUB / f'carta/real/croissant-{W}.webp', 86)
    print('croissant', lienzo.size, 'alto a 900:', round(lienzo.height * 900 / lienzo.width))


if __name__ == '__main__':
    mazo()
    croissant()
    print('listo')
