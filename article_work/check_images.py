# -*- coding: utf-8 -*-
"""Hash + size every image to definitively identify duplicates."""
import os, hashlib
from PIL import Image

folder = r"C:\Users\mrdie\.cursor\projects\c-EquipmentAccounting\assets"

targets = [
    "image-b8cdee0f-f8c4-482d-b413-5cb725c2c030",  # claimed ER
    "image-d8eccafb-dbcc-4573-9949-a6684cda2ca9",  # claimed equipment
    "image-f2f96455-3505-4951-bccf-ade075adb5f3",  # claimed map
    "image-fee1ce61-7b9a-47dd-ad77-e9933e2741e6",  # claimed QR
    "image-909dd8e9-e5bd-4e8e-b0f0-27c0d816a642",  # 
    "image-12de3eb6-c70a-4654-8e6e-f3a4a3ea447d",
    "image-08de3631-44fa-47fb-9d84-2bcde2a1c331",
    "image-13d51501-db33-4516-a809-7a1c09e77bc3",
    "image-f32498b0-e819-4c5c-a868-5d345a9e7195",
    "image-55ff03c6-30b3-40f0-8fed-ffa8228b6d4b",
    "image-2a094f3f-4d0d-4a95-bbec-d260a364d9e7",
    "image-ddfb95f8-8312-4ed2-a4b8-7e92bb58c670",
    "image-01cbc12e-64e5-4983-8c0d-52504de457d6",
    "image-61478026-6692-40ed-87f9-985311b08cb1",
    "image-228b8fe5-ea70-431f-ba32-ab68300c5bac",
    "image-c872733f-66fd-4257-a10c-deb9c64e51ee",
    "image-79e2f712-57ee-471e-90bd-29d879b7a22b",
    "image-347bae60-3bc9-43a2-9ab7-2d63899270c8",
    "image-5ea6c17f-bd41-4d8d-a2ea-3ef0fee78f3e",
    "image-d1eadd29-1fa2-40b0-b60b-0b8807531b9e",
    "image-9a613e1a-ce36-452d-afdc-b49dc08c5835",
    "image-2f90d36b-2b37-4d29-9eb7-caadfa88a9e8",
    "image-d6504193-eaf5-4551-8526-943db11723b8",
    "image-55b99f15-b478-4921-9da0-21c3b5bc6f5c",
    "image-c9166262-97b4-4ff8-824f-449a41a8ff63",
    "image-8ea7ea80-c081-43b6-864c-7a87c66e4208",
    "image-44d8b5f6-5f73-4472-8dba-299796525d83",
    "image-be3dc8bc-82a5-4b60-91f5-97e02bea50bd",
    "image-8994bacd-f3ad-45bb-bc53-ad6cca575b96",
]

for f in sorted(os.listdir(folder)):
    for t in targets:
        if t in f:
            path = os.path.join(folder, f)
            with open(path, "rb") as fp:
                h = hashlib.md5(fp.read()).hexdigest()[:10]
            size = Image.open(path).size
            short = t.replace("image-", "")[:36]
            print(f"{short} | {size[0]:5d}x{size[1]:5d} | md5={h}")
            break
