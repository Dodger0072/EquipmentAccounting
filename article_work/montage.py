# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os

folder = r"c:/EquipmentAccounting/article_work/figures"
files = ["fig1_er.png", "fig2_equipment.png", "fig3_map.png", "fig4_qr.png"]

cell_w, cell_h = 600, 600
mont = Image.new("RGB", (cell_w * 2, cell_h * 2 + 60), "white")
draw = ImageDraw.Draw(mont)

for i, fn in enumerate(files):
    img = Image.open(os.path.join(folder, fn))
    img.thumbnail((cell_w - 20, cell_h - 60))
    x = (i % 2) * cell_w + 10
    y = (i // 2) * cell_h + 50
    mont.paste(img, (x, y))
    draw.text((x, y - 40), fn, fill="red")

out = r"c:/EquipmentAccounting/article_work/montage.png"
mont.save(out)
print("saved", out)
