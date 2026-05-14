# -*- coding: utf-8 -*-
import pdfplumber
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

paths = [
    "c:/Users/mrdie/OneDrive/\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0441\u0442\u043e\u043b/\u0414\u043b\u044f \u0434\u0438\u043f\u043b\u043e\u043c\u0430/\u041f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u044f_\u041e\u0434\u0438\u043d\u0446\u043e\u0432.pdf",
    "c:/Users/mrdie/OneDrive/\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0441\u0442\u043e\u043b/\u0414\u043b\u044f \u0434\u0438\u043f\u043b\u043e\u043c\u0430/\u041e\u0442\u0447\u0451\u0442 \u043f\u043e \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0435 7 \u0441\u0435\u043c.pdf",
]

for p in paths:
    print("===== FILE:", os.path.basename(p))
    try:
        with pdfplumber.open(p) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                print(f"--- page {i+1}")
                print(text)
    except Exception as e:
        print("ERR", e)
    print()
