# -*- coding: utf-8 -*-
"""OG-превью 1200x630 из реального кадра локации."""
from PIL import Image, ImageDraw, ImageEnhance, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
W, H = 1200, 630

src = Image.open(os.path.join(HERE, 'photos', '13.jpg')).convert('RGB')
# кроп 1200x630 (1.9:1) по центру, выше середины — чтобы попал портрет
ratio = W / H
sw, sh = src.size
if sw / sh > ratio:
    nw = int(sh * ratio)
    box = ((sw - nw) // 2, 0, (sw - nw) // 2 + nw, sh)
else:
    nh = int(sw / ratio)
    top = int(sh * 0.06)
    box = (0, top, sw, min(sh, top + nh))
im = src.crop(box).resize((W, H), Image.LANCZOS)

im = ImageEnhance.Contrast(im).enhance(1.22)
im = ImageEnhance.Color(im).enhance(0.85)
im = ImageEnhance.Brightness(im).enhance(0.72)

# затемняем левую часть под текст
grad = Image.new('L', (W, H), 0)
gd = ImageDraw.Draw(grad)
for x in range(W):
    t = x / W
    v = int(235 * max(0.0, 1 - (t / 0.72) ** 1.15))
    gd.line([(x, 0), (x, H)], fill=v)
black = Image.new('RGB', (W, H), (7, 6, 9))
im = Image.composite(black, im, grad)
im = Image.composite(black, im, Image.new('L', (W, H), 60))

d = ImageDraw.Draw(im)


def font(names, size):
    for n in names:
        p = os.path.join('C:\\Windows\\Fonts', n)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


f_display = font(['impact.ttf', 'arialbd.ttf'], 118)
f_sub = font(['arialbd.ttf', 'arial.ttf'], 34)
f_small = font(['arial.ttf'], 22)
f_mono = font(['consola.ttf', 'arial.ttf'], 19)

RED = (200, 58, 34)
BONE = (233, 228, 220)
DUST = (150, 145, 136)

d.text((72, 78), 'НЕ ЗАХОДИ', font=f_mono, fill=RED)
d.text((72, 132), 'ДОМ', font=f_display, fill=BONE)
d.text((72, 232), 'МАНЬЯКА', font=f_display, fill=BONE)

d.line([(72, 384), (372, 384)], fill=(168, 31, 20), width=3)

d.text((72, 410), 'Хоррор-квест в Алматы', font=f_sub, fill=BONE)
d.text((72, 462), 'ул. Манаса, 57 · 60 минут · 2–20 игроков', font=f_small, fill=DUST)
d.text((72, 500), '4.6 из 5 · 1218 оценок на 2ГИС', font=f_small, fill=DUST)

# акцентная плашка справа
d.rectangle([W - 300, H - 74, W - 72, H - 28], fill=(168, 31, 20))
d.text((W - 282, H - 66), '+7 701 822 92 84', font=f_small, fill=(255, 255, 255))

out = os.path.join(ROOT, 'public', 'og.jpg')
im.save(out, 'JPEG', quality=88, optimize=True, progressive=True)
print('ok', out, os.path.getsize(out) // 1024, 'KB', im.size)
