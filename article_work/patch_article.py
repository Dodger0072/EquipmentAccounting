# -*- coding: utf-8 -*-
import io
p = r"c:/EquipmentAccounting/article_work/build_article.py"
with io.open(p, "r", encoding="utf-8") as f:
    s = f.read()

# Section 2: replace ER placeholder
old1 = 'add_par("$_Рисунок", "")\nadd_par("$_Рисунок_название_с_номером", "ER-диаграмма базы данных системы учёта оборудования")'
new1 = 'add_figure("fig1_er.png", width_cm=12.0)\nadd_caption("ER-диаграмма базы данных системы учёта оборудования")'
assert old1 in s, "not found old1"
s = s.replace(old1, new1)

# Section 4: after first para (equipment table) add figure
marker2 = 'и местоположению.")'
fig2 = '''\nadd_figure("fig2_equipment.png", width_cm=11.0)\nadd_caption("Главная страница со списком оборудования")'''
s = s.replace(marker2, marker2 + fig2, 1)

# After second para of section 4 (map) add map image
marker3 = 'и минимизирует число ошибок.")'
fig3 = '''\nadd_figure("fig3_map.png", width_cm=11.0)\nadd_caption("Выбор места размещения оборудования на интерактивной карте этажа")'''
s = s.replace(marker3, marker3 + fig3, 1)

# After third para of section 4 (QR) add QR image
marker4 = 'сканирования мобильным устройством.")'
fig4 = '''\nadd_figure("fig4_qr.png", width_cm=10.0)\nadd_caption("Лист QR-кодов, сформированный для маркировки оборудования")'''
s = s.replace(marker4, marker4 + fig4, 1)

with io.open(p, "w", encoding="utf-8") as f:
    f.write(s)
print("patched")
