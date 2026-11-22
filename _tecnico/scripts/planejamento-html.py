"""Transforma o calendário do mês (.md do departamento de Ideias) numa página bonita e interativa (um arquivo .html só).

Uso:
  python3 _tecnico/scripts/planejamento-html.py <cliente>/<aaaa-mm>.md <saida.html> --cliente "Nome" [--cor "#1E4FA3"] [--cor-escura "#0E2A5C"]

A página: calendário do mês com cada post colorido pelo formato, lista em cartões, filtros, clique para ver/editar
abertura e virada, status de cada post, botão para baixar a versão editada e botão de PDF.
A seção "Conferir antes de gravar" é interna e NÃO entra na página.
"""
import argparse
import json
import re
from pathlib import Path

MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
MODELO = Path(__file__).resolve().parents[2] / "departamentos/ideias-e-planejamento/_modelos/planejamento.html"


def limpar(t):
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    return t.replace("`", "").strip().strip("“”\"").strip()


def secoes(md):
    out, atual = {"_topo": []}, "_topo"
    for l in md.splitlines():
        if l.startswith("## "):
            atual = l[3:].strip().lower()
            out[atual] = []
        else:
            out[atual].append(l)
    return out


def tabela(linhas):
    ls = [l.strip() for l in linhas if l.strip().startswith("|") and not re.match(r"^\|\s*-", l.strip())]
    dados = [[c.strip() for c in l.strip("|").split("|")] for l in ls]
    if not dados:
        return []
    cab = [c.lower() for c in dados[0]]
    return [dict(zip(cab, linha)) for linha in dados[1:]]


def achar(sec, comeco):
    for k, v in sec.items():
        if k.startswith(comeco):
            return v
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("saida")
    ap.add_argument("--cliente", required=True)
    ap.add_argument("--cor", default="#1E4FA3")
    ap.add_argument("--cor-escura", default="#0E2A5C")
    a = ap.parse_args()

    md = Path(a.entrada).read_text(encoding="utf-8")
    m = re.search(r"(\d{4})-(\d{2})", Path(a.entrada).stem)
    ano, mes = int(m.group(1)), int(m.group(2))
    sec = secoes(md)

    tema = ""
    for l in sec["_topo"]:
        if l.lower().startswith("**tema do mês:**"):
            tema = limpar(l.split(":**", 1)[1]); tema = tema[:1].upper() + tema[1:]

    posts = []
    for r in tabela(achar(sec, "calendário")):
        dia = int(re.match(r"\s*(\d+)", r.get("dia", "0")).group(1))
        abertura = r.get("abertura (conexão)") or r.get("ideia (gancho)") or r.get("ideia (título/gancho)") or ""
        status = limpar(r.get("status", "Ideia")).capitalize() or "Ideia"
        posts.append({"dia": dia, "formato": limpar(r.get("formato", "Reels")),
                      "tema": limpar(r.get("tema", "")) or limpar(abertura)[:40],
                      "abertura": limpar(abertura), "virada": limpar(r.get("virada (o que ensina)", r.get("por que agora", ""))),
                      "status": status, "notas": ""})

    # Legendas e estratégia: blocos "### 01" com **Objetivo:**, **Chamada:**, **Preparar:** e o texto da legenda
    leg, atual = {}, None
    for l in achar(sec, "legendas"):
        h = re.match(r"###\s*(\d+)", l)
        if h:
            atual = int(h.group(1)); leg[atual] = {"objetivo": "", "chamada": "", "preparar": "", "legenda": []}
            continue
        if atual is None:
            continue
        c = re.match(r"\*\*(Objetivo|Chamada|Preparar):\*\*\s*(.*)", l.strip())
        if c:
            leg[atual][c.group(1).lower()] = c.group(2).strip()
        elif l.strip() or leg[atual]["legenda"]:
            leg[atual]["legenda"].append(l.rstrip())
    for p in posts:
        x = leg.get(p["dia"])
        if x:
            p.update({"objetivo": x["objetivo"], "chamada": x["chamada"], "preparar": x["preparar"],
                      "legenda": "\n".join(x["legenda"]).strip()})

    pedidos = []
    for r in tabela(achar(sec, "pedidos")):
        dd, mm = (int(v) for v in r.get("prazo", "01/01").split("/"))
        pedidos.append({"prazo": f"{ano - (1 if mm > mes else 0)}-{mm:02d}-{dd:02d}", "post": int(r.get("post", "0") or 0),
                        "tipo": limpar(r.get("tipo", "")), "pedido": re.sub(r"\s*[“”\"]\s*", " ", limpar(r.get("pedido", ""))).replace(" Reels ", " Reels: ").strip(),
                        "texto": limpar(r.get("texto para gravar", "")), "como": limpar(r.get("como gravar", "")), "feito": False})

    alta = [{"assunto": limpar(r.get("assunto", "")), "onde": limpar(r.get("onde vi", r.get("onde apareceu", ""))),
             "quando": limpar(r.get("data", r.get("quando", "")))} for r in tabela(achar(sec, "o que está em alta"))]
    trocas = [{"formato": limpar(r.get("formato", "Reels")), "tema": limpar(r.get("tema", "")),
               "abertura": limpar(r.get("abertura (conexão)", "")), "virada": limpar(r.get("virada (o que ensina)", "")),
               "origem": re.sub(r"[“”\"]", "", limpar(r.get("de onde veio", "")))} for r in tabela(achar(sec, "ideias para trocar"))]
    reserva = [re.sub(r"[“”\"]", "", limpar(l[2:])) for l in achar(sec, "ideias de reserva") if l.startswith("- ")]
    fontes = []
    for l in achar(sec, "fontes"):
        f = re.match(r"- \[([^\]]+)\]\(([^)]+)\)", l.strip())
        if f:
            fontes.append({"nome": f.group(1), "url": f.group(2)})

    dados = {"id": f"{a.cliente}-{ano}-{mes:02d}", "cliente": a.cliente, "ano": ano, "mes": mes, "mesNome": MESES[mes - 1],
             "tema": tema, "cor": a.cor, "corEscura": a.cor_escura, "posts": posts, "alta": alta, "reserva": reserva, "trocas": trocas, "pedidos": pedidos, "fontes": fontes}
    html = MODELO.read_text(encoding="utf-8").replace("/*DADOS*/", json.dumps(dados, ensure_ascii=False).replace("</", "<\\/"))
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(html, encoding="utf-8")
    print(f"salvo em {a.saida} ({len(posts)} posts)")


if __name__ == "__main__":
    main()
