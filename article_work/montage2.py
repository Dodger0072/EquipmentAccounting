# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
import os

assets = r"C:/Users/mrdie/.cursor/projects/c-EquipmentAccounting/assets"
# candidates that might be equipment table or other useful app screens
candidates = [
    "image-909dd8e9-e5bd-4e8e-b0f0-27c0d816a642",
    "image-12de3eb6-c70a-4654-8e6e-f3a4a3ea447d",
    "image-08de3631-44fa-47fb-9d84-2bcde2a1c331",
    "image-d8eccafb-dbcc-4573-9949-a6684cda2ca9",
    "image-13d51501-db33-4516-a809-7a1c09e77bc3",
    "image-79e2f712-57ee-471e-90bd-29d879b7a22b",
    "image-2a094f3f-4d0d-4a95-bbec-d260a364d9e7",
    "image-ddfb95f8-8312-4ed2-a4b8-7e92bb58c670",
    "image-61478026-6692-40ed-87f9-985311b08cb1",
    "image-228b8fe5-ea70-431f-ba32-ab68300c5bac",
    "image-55b99f15-b478-4921-9da0-21c3b5bc6f5c",
    "image-5ea6c17f-bd41-4d8d-a2ea-3ef0fee78f3e",
]

rows, cols = 4, 3
cw, ch = 500, 400
mont = Image.new("RGB", (cw*cols, ch*rows + 40), "white")
draw = ImageDraw.Draw(mont)

for idx, uuid_part in enumerate(candidates):
    fn = f"c__Users_mrdie_AppData_Roaming_Cursor_User_workspaceStorage_17024f4af0a5a1f68e1cef1a67f7175f_images_{uuid_part}.png"
    p = os.path.join(assets, fn)
    try:
        img = Image.open(p).convert("RGB")
        img.thumbnail((cw-10, ch-30))
        r, c = idx // cols, idx % cols
        x = c*cw + 5
        y = r*ch + 25
        mont.paste(img, (x, y))
        draw.text((x, y-20), uuid_part.split("-")[1][:8], fill="red")
    except Exception as e:
        print("err", p, e)

mont.convert("RGB").save(r"c:/EquipmentAccounting/article_work/check_candidates.jpg", quality=80)
print("done")
