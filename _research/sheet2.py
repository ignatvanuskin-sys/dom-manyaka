from PIL import Image, ImageDraw, ImageFont
import os

d = os.path.dirname(os.path.abspath(__file__))
picks = ['01', '02', '04', '06', '10', '14', '09', '16', '19', '20', '17', '03']
cols, cw, ch = 3, 560, 420
rows = (len(picks) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cw, rows * ch), (10, 10, 10))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("arial.ttf", 22)
except Exception:
    font = ImageFont.load_default()
for i, p in enumerate(picks):
    f = os.path.join(d, 'photos', p + '.jpg')
    im = Image.open(f).convert('RGB')
    im.thumbnail((cw - 12, ch - 34))
    x = (i % cols) * cw + (cw - im.width) // 2
    y = (i // cols) * ch + 30
    sheet.paste(im, (x, y))
    draw.text(((i % cols) * cw + 8, (i // cols) * ch + 4), p + '.jpg', fill=(240, 240, 240), font=font)
out = os.path.join(d, 'sheet_big.jpg')
sheet.save(out, quality=90)
print('ok')
