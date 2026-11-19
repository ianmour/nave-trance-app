"""Monta um PowerPoint com uma imagem por slide (chamado pelo exportar-pdf.mjs).

Uso: python3 -I imagens-para-pptx.py saida.pptx <largura_px> <altura_px> img1.png img2.png ...
Usa o python-pptx que já vem no computador.
"""
import sys
from pptx import Presentation
from pptx.util import Emu

saida, larg, alt, *imgs = sys.argv[1:]
larg, alt = float(larg), float(alt)
# 96 px = 1 polegada = 914400 EMU
L = Emu(int(larg / 96 * 914400))
A = Emu(int(alt / 96 * 914400))
prs = Presentation()
prs.slide_width, prs.slide_height = L, A
vazio = prs.slide_layouts[6]
for img in imgs:
    s = prs.slides.add_slide(vazio)
    s.shapes.add_picture(img, 0, 0, width=L, height=A)
prs.save(saida)
