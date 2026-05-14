# -*- coding: utf-8 -*-
"""Open in Word to apply any style-related fixups and also to verify document opens properly."""
import os, shutil
import win32com.client
import pythoncom

SRC = r"c:\EquipmentAccounting\article_work\Odintsov.docx"
DEST_DESKTOP = "c:/Users/mrdie/OneDrive/\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0441\u0442\u043e\u043b/\u0414\u043b\u044f \u0434\u0438\u043f\u043b\u043e\u043c\u0430/\u041e\u0434\u0438\u043d\u0446\u043e\u0432_\u0441\u0442\u0430\u0442\u044c\u044f.docx"

pythoncom.CoInitialize()
word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = False
try:
    doc = word.Documents.Open(os.path.abspath(SRC))
    pages = doc.ComputeStatistics(2)
    words = doc.ComputeStatistics(0)
    chars = doc.ComputeStatistics(3)
    print(f"Pages (A5): {pages}")
    print(f"Words: {words}")
    print(f"Characters: {chars}")
    doc.SaveAs2(os.path.abspath(SRC))
    doc.Close(False)
    shutil.copyfile(SRC, DEST_DESKTOP)
    print("Copied to:", DEST_DESKTOP)
finally:
    word.Quit()
