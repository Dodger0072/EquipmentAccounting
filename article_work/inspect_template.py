# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from docx import Document
from docx.shared import Pt

d = Document(r"c:\EquipmentAccounting\article_work\converted\Template.docx")
print("Sections:", len(d.sections))
s = d.sections[0]
print("Page size:", s.page_width, s.page_height)
print("Margins:", s.left_margin, s.right_margin, s.top_margin, s.bottom_margin)

print("\nStyles:")
for st in d.styles:
    try:
        name = st.name
        typ = st.type
        print(f"  [{typ}] {name}")
    except Exception as e:
        pass

print("\nParagraphs:")
for i, p in enumerate(d.paragraphs):
    print(f"{i:3d} | style={p.style.name!r} | text={p.text[:90]!r}")
