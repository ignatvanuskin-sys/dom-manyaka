from PIL import Image, ImageDraw, ImageFont
import os, glob

d = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(d, 'photos', '*.jpg')))
cols, cell = 5, 320
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rows * cell), (12, 11, 11))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("arial.ttf", 20)
except Exception:
    font = ImageFont.load_default()

for i, f in enumerate(files):
    im = Image.open(f).convert('RGB')
    im.thumbnail((cell - 8, cell - 28))
    x = (i % cols) * cell + (cell - im.width) // 2
    y = (i // cols) * cell + 24
    sheet.paste(im, (x, y))
    draw.text(((i % cols) * cell + 8, (i // cols) * cell + 2), os.path.basename(f), fill=(230, 230, 230), font=font)

out = os.path.join(d, 'contact_sheet.jpg')
sheet.save(out, quality=88)

# также посчитаем средний цвет и яркость каждого кадра
print('name | size | avg RGB | brightness')
for f in files:
    im = Image.open(f).convert('RGB')
    small = im.resize((32, 32))
    px = list(small.getdata())
    r = sum(p[0] for p in px) // len(px)
    g = sum(p[1] for p in px) // len(px)
    b = sum(p[2] for p in px) // len(px)
    print(f"{os.path.basename(f)} | {im.width}x{im.height} | {r},{g},{b} | {(r+g+b)//3}")
print('sheet ->', out)
