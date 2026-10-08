# -*- coding: utf-8 -*-
"""Иконки приложения: капля на почти чёрном. Нужны для «на главный экран»."""
from PIL import Image, ImageDraw
import os

OUT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'icons'))
os.makedirs(OUT, exist_ok=True)

BG = (4, 3, 5, 255)
DARK = (141, 26, 16, 255)
LIGHT = (199, 60, 32, 255)


def drop(size, pad_ratio=0.20, ss=4):
    """Капля: круг + треугольная вершина. Рисуем с супер-сэмплингом для гладких краёв."""
    S = size * ss
    img = Image.new("RGBA", (S, S), BG)
    d = ImageDraw.Draw(img)

    pad = S * pad_ratio
    inner = S - 2 * pad
    cx = S / 2
    r = inner * 0.30
    cy = S / 2 + inner * 0.14

    # тело
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=DARK)
    # вершина: треугольник, сходящийся в точку над кругом
    apex_y = cy - r * 2.55
    d.polygon(
        [
            (cx, apex_y),
            (cx - r * 0.93, cy - r * 0.05),
            (cx + r * 0.93, cy - r * 0.05),
        ],
        fill=DARK,
    )
    # блик справа
    d.polygon(
        [
            (cx, apex_y + r * 0.35),
            (cx + r * 0.55, cy - r * 0.10),
            (cx + r * 0.62, cy + r * 0.30),
            (cx + r * 0.16, cy + r * 0.80),
        ],
        fill=LIGHT,
    )
    # маленькая вторая капля
    r2 = r * 0.22
    cx2, cy2 = cx + r * 1.75, cy - r * 0.95
    d.ellipse([cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2], fill=DARK)
    d.polygon(
        [(cx2, cy2 - r2 * 2.5), (cx2 - r2 * 0.9, cy2), (cx2 + r2 * 0.9, cy2)],
        fill=DARK,
    )

    return img.resize((size, size), Image.LANCZOS)


for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)]:
    drop(size).save(os.path.join(OUT, name))
    print("ok", name, size)
