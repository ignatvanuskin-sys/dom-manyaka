# -*- coding: utf-8 -*-
"""Готовит реальные фото 2GIS для сайта: кропает, грейдит, сохраняет webp + LQIP."""
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat
import os, json, io, base64

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'photos')
OUT = os.path.abspath(os.path.join(HERE, '..', 'public', 'media'))
os.makedirs(OUT, exist_ok=True)


def curve(points):
    """points: list of (in,out) 0..255 -> 256 LUT"""
    lut = []
    for i in range(256):
        x = i
        out = None
        for j in range(len(points) - 1):
            x0, y0 = points[j]
            x1, y1 = points[j + 1]
            if x0 <= x <= x1:
                t = 0.0 if x1 == x0 else (x - x0) / float(x1 - x0)
                out = y0 + t * (y1 - y0)
                break
        lut.append(max(0, min(255, int(round(255 if out is None else out)))))
    return lut


def grade(im, contrast=1.18, black=12, gamma=1.06, warm=1.0, sat=0.92):
    im = im.convert('RGB')
    # crush blacks / shape highlights
    lut = curve([(0, black), (28, 30), (128, 132), (220, 232), (255, 255)])
    im = im.point(lut * 3)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(sat)
    if warm != 1.0:
        r, g, b = im.split()
        r = r.point(curve([(0, 0), (255, min(255, int(255 * warm)))]))
        b = b.point(curve([(0, 0), (255, min(255, int(255 / warm)))]))
        im = Image.merge('RGB', (r, g, b))
    return im


def vignette(im, strength=0.55):
    w, h = im.size
    # быстрая виньетка через радиальный градиент уменьшенного размера
    grad = Image.new('L', (w, h), 0)
    small = Image.new('L', (64, 64), 255)
    px = small.load()
    cx = cy = 31.5
    for y in range(64):
        for x in range(64):
            dx = (x - cx) / cx
            dy = (y - cy) / cy
            d = min(1.0, (dx * dx + dy * dy) ** 0.5)
            px[x, y] = int(255 * (1.0 - strength * (d ** 2.1)))
    grad = small.resize((w, h), Image.BICUBIC)
    base = im.convert('RGB')
    black = Image.new('RGB', (w, h), (0, 0, 0))
    return Image.composite(base, black, grad)


def lqip(im, size=14):
    t = im.copy()
    t.thumbnail((size, size))
    buf = io.BytesIO()
    t.save(buf, format='WEBP', quality=45)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def grain(im, amount=7):
    import random
    random.seed(7)
    w, h = im.size
    n = Image.new('L', (w, h))
    n.putdata([128 + random.randint(-amount, amount) for _ in range(w * h)])
    return Image.blend(im, Image.merge('RGB', (n, n, n)), 0.055)


# name -> (source, crop box (l,t,r,b) or None, out width, grade kwargs)
JOBS = {
    # HERO — реальный актёр локации (без гостей). Обрезаем вотермарку 2GIS снизу.
    'hero-desktop': ('13', (0, 0, 1440, 1006), 1600, dict(contrast=1.24, black=10, sat=0.88, warm=1.04)),
    'hero-mobile':  ('13', (416, 0, 1023, 1080), 1100, dict(contrast=1.26, black=8, sat=0.88, warm=1.04)),
    # Атмосфера локации. Вотермарка 2GIS всегда в правом нижнем углу (~7% высоты) — обрезаем.
    'blood-drips':  ('02', (0, 0, 960, 1170), 1400, dict(contrast=1.22, black=14, sat=0.85)),
    'blood-detail': ('02', (0, 0, 780, 700), 1300, dict(contrast=1.26, black=20, sat=0.82)),
    'stairs':       ('04', (0, 0, 960, 1185), 1300, dict(contrast=1.18, black=16, sat=0.86, warm=1.02)),
    'red-room':     ('01', (470, 0, 1440, 1780), 1200, dict(contrast=1.22, black=12, sat=0.90, warm=1.03)),
    'cctv-wall':    ('10', (0, 0, 1440, 1780), 1400, dict(contrast=1.26, black=10, sat=0.78)),
    'cctv-feed':    ('14', (0, 0, 1440, 1780), 1300, dict(contrast=1.28, black=8, sat=0.76)),
    'sign-black':   ('16', (0, 0, 1440, 1780), 1400, dict(contrast=1.22, black=10, sat=0.92, warm=1.03)),
    'screen-glow':  ('06', (0, 0, 1440, 2375), 1100, dict(contrast=1.22, black=6, sat=0.95, warm=1.06)),
    'entrance':     ('17', (0, 0, 1440, 1000), 1400, dict(contrast=1.16, black=22, sat=0.68, warm=1.02)),
    'door':         ('12', (0, 0, 960, 1185), 1200, dict(contrast=1.22, black=16, sat=0.86)),
}

manifest = {}
for name, (src, box, outw, gk) in JOBS.items():
    im = Image.open(os.path.join(SRC, src + '.jpg'))
    if box:
        im = im.crop(box)
    im = grade(im, **gk)
    im = vignette(im, 0.5)
    im = grain(im)
    if im.width > outw:
        im = im.resize((outw, int(round(im.height * outw / im.width))), Image.LANCZOS)
    blur = lqip(im)
    path = os.path.join(OUT, name + '.webp')
    im.save(path, format='WEBP', quality=82, method=6)
    manifest[name] = {
        'src': '/media/' + name + '.webp',
        'width': im.width,
        'height': im.height,
        'bytes': os.path.getsize(path),
        'blurDataURL': blur,
        'source_2gis': 'photos/' + src + '.jpg',
    }

with open(os.path.join(HERE, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

total = sum(v['bytes'] for v in manifest.values())
for k, v in manifest.items():
    print(f"{k:14s} {v['width']}x{v['height']} {v['bytes']//1024}KB")
print('TOTAL', total // 1024, 'KB')
