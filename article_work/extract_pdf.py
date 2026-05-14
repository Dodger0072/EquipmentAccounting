# -*- coding: utf-8 -*-
import pdfplumber
import os
import glob

pdf_dir = r"c:\Users\mrdie\OneDrive"
paths = []
for root, dirs, files in os.walk(pdf_dir):
    for f in files:
        if f.lower().endswith(".pdf") and ("dipl" in root.lower() or "\u0434\u0438\u043f" in root.lower() or "\u0434\u0438\u043f" in f.lower() or True):
            pass
# easier: just explicit
candidates = []
for root, dirs, files in os.walk(pdf_dir):
    for f in files:
        full = os.path.join(root, f)
        if full.lower().endswith(".pdf") and "\u0434\u0438\u043f" in root.lower():
            candidates.append(full)

print("Candidates:")
for c in candidates:
    print(repr(c))
print()

for p in candidates:
    print("===== FILE:", p)
    try:
        with pdfplumber.open(p) as pdf:
            for i, page in enumerate(pdf.pages):
                print(f"--- page {i+1}")
                text = page.extract_text() or ""
                print(text)
    except Exception as e:
        print("ERR", e)
    print()
