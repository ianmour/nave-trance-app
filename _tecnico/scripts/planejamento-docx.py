"""Transforma um calendário do mês (.md do departamento de Ideias) num Word bonito e editável, para entregar ao cliente.

Uso:
  /root/tools/ideias-venv/bin/python -I _tecnico/scripts/planejamento-docx.py <calendario.md> <saida.docx> [--cor 1E4FA3] [--cliente "Nome"]

Lê do .md: título (# ...), "Tema do mês", "Objetivo", "Ritmo", as tabelas e listas das seções "## ...".
A seção "Conferir antes de gravar" é interna e NÃO vai para o arquivo do cliente.
"""
import argparse
import re
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

SECOES_INTERNAS = ("conferir antes",)


def sombrear(celula, hexcor):
    tcPr = celula._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexcor)
    tcPr.append(shd)


def texto_rico(par, texto, cor=None, tamanho=None, negrito_tudo=False):
    """Escreve texto aceitando **negrito** e [texto](link) (o link vira só o texto, com o endereço em cinza)."""
    partes = re.split(r"(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))", texto)
    for p in partes:
        if not p:
            continue
        link = re.match(r"\[([^\]]+)\]\(([^)]+)\)", p)
        if link:
            adicionar_link(par, link.group(1), link.group(2), cor)
            continue
        negrito = p.startswith("**") and p.endswith("**")
        r = par.add_run(p[2:-2] if negrito else p)
        r.bold = negrito or negrito_tudo
        if cor:
            r.font.color.rgb = cor
        if tamanho:
            r.font.size = Pt(tamanho)


def adicionar_link(par, texto, url, cor=None):
    rel = par.part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    h = OxmlElement("w:hyperlink")
    h.set(qn("r:id"), rel)
    r = OxmlElement("w:r")
    rPr = OxmlElement("w:rPr")
    c = OxmlElement("w:color")
    c.set(qn("w:val"), str(cor) if cor else "1E4FA3")
    u = OxmlElement("w:u")
    u.set(qn("w:val"), "single")
    rPr.append(c)
    rPr.append(u)
    r.append(rPr)
    t = OxmlElement("w:t")
    t.text = texto
    r.append(t)
    h.append(r)
    par._p.append(h)


def ler_md(caminho):
    linhas = Path(caminho).read_text(encoding="utf-8").splitlines()
    titulo, cabecalho, secoes, atual = "", [], [], None
    for l in linhas:
        if l.startswith("# ") and not titulo:
            titulo = l[2:].strip()
        elif l.startswith("## "):
            atual = {"nome": l[3:].strip(), "linhas": []}
            secoes.append(atual)
        elif atual is None:
            if l.strip():
                cabecalho.append(l.strip())
        else:
            atual["linhas"].append(l)
    return titulo, cabecalho, secoes


def tabela(doc, linhas_md, azul, azul_claro):
    linhas = [l for l in linhas_md if l.strip().startswith("|")]
    linhas = [l for l in linhas if not re.match(r"^\|\s*-", l.strip())]
    dados = [[c.strip() for c in l.strip().strip("|").split("|")] for l in linhas]
    if not dados:
        return
    t = doc.add_table(rows=len(dados), cols=len(dados[0]))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.style = "Table Grid"
    for i, linha in enumerate(dados):
        for j, valor in enumerate(linha):
            cel = t.cell(i, j)
            cel.text = ""
            par = cel.paragraphs[0]
            if i == 0:
                texto_rico(par, valor, cor=RGBColor(0xFF, 0xFF, 0xFF), tamanho=10, negrito_tudo=True)
                sombrear(cel, str(azul))
            else:
                texto_rico(par, valor, tamanho=9.5)
                if i % 2 == 0:
                    sombrear(cel, azul_claro)
    # Larguras: a coluna de texto mais longo fica mais larga. Cabeçalho repete em cada página; linha não quebra no meio.
    total = 26.5
    medias = [max(len(re.sub(r"\(.*?\)", "", d[j])) for d in dados) for j in range(len(dados[0]))]
    pesos = [max(16, min(m, 60)) for m in medias]
    larguras = [total * p / sum(pesos) for p in pesos]
    t.autofit = False
    for j, w in enumerate(larguras):
        t.columns[j].width = Cm(w)  # grade da tabela (o LibreOffice e o Google Docs leem esta)
        for cel in t.columns[j].cells:
            cel.width = Cm(w)
    for i, row in enumerate(t.rows):
        trPr = row._tr.get_or_add_trPr()
        el = OxmlElement("w:cantSplit"); trPr.append(el)
        if i == 0:
            el = OxmlElement("w:tblHeader"); trPr.append(el)
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("saida")
    ap.add_argument("--cor", default="1E4FA3", help="cor principal em hexadecimal (padrão: azul)")
    ap.add_argument("--cliente", default="")
    a = ap.parse_args()
    azul = RGBColor.from_string(a.cor.upper())
    claro = "EAF0FA"

    titulo, cabecalho, secoes = ler_md(a.entrada)
    doc = Document()
    sec = doc.sections[0]
    sec.orientation = WD_ORIENT.LANDSCAPE
    sec.page_width, sec.page_height = Cm(29.7), Cm(21.0)
    for m in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(sec, m, Cm(1.6))

    estilo = doc.styles["Normal"]
    estilo.font.name = "Calibri"
    estilo.font.size = Pt(10.5)
    for nome, tam in (("Heading 1", 22), ("Heading 2", 14)):
        s = doc.styles[nome]
        s.font.name = "Calibri"
        s.font.size = Pt(tam)
        s.font.bold = True
        s.font.color.rgb = azul

    # Capa curta
    nome_titulo = titulo.split(" — ")
    h = doc.add_heading(level=1)
    h.add_run("Planejamento de conteúdo")
    sub = doc.add_paragraph()
    subtitulo = re.sub(r"^calend[aá]rio (de |do )?", "", titulo, flags=re.I).replace("/", " ")
    texto_rico(sub, subtitulo[:1].upper() + subtitulo[1:],
               cor=azul, tamanho=13, negrito_tudo=True)
    if a.cliente:
        sub.add_run(f"  ·  {a.cliente}").font.size = Pt(13)
    for l in cabecalho:
        if "pesquisas/" in l or l.lower().startswith("**base"):
            continue
        par = doc.add_paragraph()
        texto_rico(par, l.replace("`", ""))

    for s in secoes:
        if s["nome"].lower().startswith(SECOES_INTERNAS):
            continue
        if s["nome"].lower().startswith("calendário"):
            doc.add_page_break()
        doc.add_heading(s["nome"], level=2)
        corpo = s["linhas"]
        tem_tabela = any(l.strip().startswith("|") for l in corpo)
        for l in corpo:
            ls = l.strip()
            if not ls or ls.startswith("|"):
                continue
            if ls.startswith("Status:"):
                continue
            if ls.startswith("- "):
                par = doc.add_paragraph(style="List Bullet")
                texto_rico(par, ls[2:].replace("`", ""))
            else:
                par = doc.add_paragraph()
                texto_rico(par, ls.replace("`", ""))
        if tem_tabela:
            tabela(doc, corpo, azul, claro)
            doc.add_paragraph()

    doc.save(a.saida)
    print(f"salvo em {a.saida}")


if __name__ == "__main__":
    main()
