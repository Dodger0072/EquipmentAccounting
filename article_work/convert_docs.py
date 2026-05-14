"""Convert .doc files to .docx using Word COM so we can read them."""
import os
import sys
import win32com.client
import pythoncom

SRC_FILES = [
    r"c:\Users\mrdie\Downloads\Example.doc",
    r"c:\Users\mrdie\Downloads\Template.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example1.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example2.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example3.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example4.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example5.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example6.doc",
    r"c:\EquipmentAccounting\article_work\examples\Examples\Example7.doc",
]
DST_DIR = r"c:\EquipmentAccounting\article_work\converted"
os.makedirs(DST_DIR, exist_ok=True)

pythoncom.CoInitialize()
word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = False

try:
    for src in SRC_FILES:
        name = os.path.splitext(os.path.basename(src))[0]
        dst_docx = os.path.join(DST_DIR, name + ".docx")
        dst_txt = os.path.join(DST_DIR, name + ".txt")
        print(f"Converting {src}")
        doc = word.Documents.Open(os.path.abspath(src), ReadOnly=True)
        doc.SaveAs2(dst_docx, FileFormat=16)
        doc.SaveAs2(dst_txt, FileFormat=2, Encoding=65001)
        doc.Close(False)
        print(f"  -> {dst_docx}")
finally:
    word.Quit()
