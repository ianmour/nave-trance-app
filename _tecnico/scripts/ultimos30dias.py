"""Pesquisa compacta: o que aconteceu nos últimos 30 dias sobre um tema.

Versão própria e pequena (inspirada na ideia da skill "last30days", sem usar o código dela).
Fontes (só leitura, grátis, sem conta): Google Notícias (RSS), YouTube (busca "este mês")
e Google Trends (buscas que estão subindo no Brasil).

Uso (rodar com a venv das ferramentas de ideias):
  /root/tools/ideias-venv/bin/python -I _tecnico/scripts/ultimos30dias.py "busca 1" "busca 2" [--saida arquivo.md]
  /root/tools/ideias-venv/bin/python -I _tecnico/scripts/ultimos30dias.py --lista departamentos/ideias-e-planejamento/buscas/keylle-lima.txt --saida ...

Na lista: uma busca por linha; linhas com # são comentário. "trends: palavra" escolhe a palavra
curta que vai para o Google Trends (o Trends não funciona bem com frases longas).
"""
import argparse
import datetime as dt
import email.utils
import json
import subprocess
import sys
import urllib.parse
from pathlib import Path

import feedparser

VENV_BIN = Path(sys.executable).parent
HOJE = dt.date.today()
LIMITE = HOJE - dt.timedelta(days=30)
# Fontes que só trazem ruído (notícias traduzidas de fora, sem relação com o Brasil)
FONTES_IGNORADAS = {"vietnam.vn"}


def noticias(busca, qtd=10):
    q = urllib.parse.quote(f"{busca} when:30d")
    f = feedparser.parse(f"https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419")
    if f.get("bozo") and not f.entries:
        return None, str(f.get("bozo_exception"))
    itens = []
    for e in f.entries:
        try:
            data = email.utils.parsedate_to_datetime(e.published).date()
        except Exception:
            continue
        if data < LIMITE:
            continue
        fonte = e.get("source", {}).get("title", "")
        if fonte.lower() in FONTES_IGNORADAS:
            continue
        titulo = e.title.rsplit(" - ", 1)[0] if fonte and e.title.endswith(fonte) else e.title
        itens.append({"data": data, "titulo": titulo, "fonte": fonte, "link": e.link})
    itens.sort(key=lambda i: i["data"], reverse=True)
    return itens[:qtd], None


def youtube(busca, qtd=8, olhar=20):
    # Lê só a página de busca (uma chamada por busca; abrir vídeo por vídeo faz o YouTube bloquear).
    # sp=EgQIBBAB = filtro oficial da busca do YouTube: "Este mês" + "Vídeo". Por isso não precisa da data de cada vídeo.
    url = "https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": busca, "sp": "EgQIBBAB"})
    cmd = [str(VENV_BIN / "yt-dlp"), "--flat-playlist", "--no-warnings", "--ignore-errors",
           "--extractor-args", "youtube:lang=pt", "--playlist-items", f"1-{olhar}", "--print",
           '{"views":"%(view_count)s","canal":%(channel)j,"titulo":%(title)j,"link":"%(url)s"}', url]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    except subprocess.TimeoutExpired:
        return None, "o YouTube demorou demais"
    itens = []
    for linha in r.stdout.splitlines():
        try:
            v = json.loads(linha)
            v["views"] = int(v["views"]) if v["views"].isdigit() else 0
        except Exception:
            continue
        itens.append(v)
    if not itens and r.returncode:
        return None, (r.stderr.strip().splitlines() or ["erro desconhecido"])[-1]
    itens.sort(key=lambda v: v["views"], reverse=True)
    return itens[:qtd], None


def trends(palavra, qtd=8, tentativas=3):
    import time
    try:
        from pytrends.request import TrendReq
        p = TrendReq(hl="pt-BR", tz=180, timeout=(10, 30))
        for n in range(tentativas):
            try:
                time.sleep(8 if n == 0 else 30)  # o Google Trends bloqueia pedidos muito seguidos
                p.build_payload([palavra], geo="BR", timeframe="today 1-m")
                r = p.related_queries().get(palavra) or {}
                break
            except Exception:
                if n == tentativas - 1:
                    raise
        subindo = r.get("rising")
        if subindo is None or subindo.empty:
            return [], None
        return [(row["query"], row["value"]) for _, row in subindo.head(qtd).iterrows()], None
    except Exception as e:
        return None, f"Google Trends não respondeu ({type(e).__name__})"


def fmt_views(n):
    return f"{n/1_000_000:.1f} mi".replace(".", ",") if n >= 1_000_000 else (
        f"{n/1000:.1f} mil".replace(".", ",") if n >= 1000 else str(n))


def ler_lista(caminho):
    buscas, termos = [], []
    for linha in Path(caminho).read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#"):
            continue
        if linha.lower().startswith("trends:"):
            termos.append(linha.split(":", 1)[1].strip())
        else:
            buscas.append(linha)
    return buscas, termos


def main():
    ap = argparse.ArgumentParser(description="O que aconteceu nos últimos 30 dias sobre um tema.")
    ap.add_argument("buscas", nargs="*")
    ap.add_argument("--lista", help="arquivo com uma busca por linha")
    ap.add_argument("--trends", action="append", default=[], help="palavra curta para o Google Trends")
    ap.add_argument("--tema", help="assunto do cliente: monta sozinho as buscas a partir de buscas/_angulos.txt")
    ap.add_argument("--publico", default="", help="para quem é o conteúdo (ex.: pequenos negócios)")
    ap.add_argument("--saida", help="salvar o relatório neste arquivo .md")
    a = ap.parse_args()

    buscas, termos = list(a.buscas), list(a.trends)
    if a.tema:
        modelo = Path(__file__).resolve().parents[2] / "departamentos/ideias-e-planejamento/buscas/_angulos.txt"
        for linha in modelo.read_text(encoding="utf-8").splitlines():
            linha = linha.strip()
            if not linha or linha.startswith("#") or ("{publico}" in linha and not a.publico):
                continue
            linha = " ".join(linha.replace("{tema}", a.tema).replace("{publico}", a.publico).split())
            if linha.lower().startswith("trends:"):
                termos.append(linha.split(":", 1)[1].strip())
            else:
                buscas.append(linha)
    if a.lista:
        b, t = ler_lista(a.lista)
        buscas += b
        termos += t
    if not buscas:
        ap.error("diga pelo menos uma busca (ou --lista, ou --tema)")
    if not termos:
        termos = [b for b in buscas if len(b.split()) <= 2]

    out = [f"# Últimos 30 dias — {a.tema or ', '.join(buscas)}" + (f" ({a.publico})" if a.publico else ""),
           f"Buscas feitas: {'; '.join(buscas)}",
           f"Período: {LIMITE:%d/%m/%Y} a {HOJE:%d/%m/%Y}. Fontes: Google Notícias, YouTube, Google Trends.",
           "Tudo abaixo tem link: conferir a fonte antes de usar qualquer número no conteúdo.", ""]

    for busca in buscas:
        print(f"... pesquisando: {busca}", file=sys.stderr)
        out.append(f"## {busca}")
        itens, erro = noticias(busca)
        out.append("### Notícias")
        if erro:
            out.append(f"- (falhou: {erro})")
        elif not itens:
            out.append("- nada nos últimos 30 dias")
        for i in itens or []:
            out.append(f"- {i['data']:%d/%m} — {i['titulo']} ({i['fonte']}) — {i['link']}")
        itens, erro = youtube(busca)
        out.append("### YouTube (vídeos do último mês, mais vistos primeiro)")
        if erro:
            out.append(f"- (falhou: {erro})")
        elif not itens:
            out.append("- nada nos últimos 30 dias")
        for v in itens or []:
            out.append(f"- {v['titulo']} — {v['canal']} — {fmt_views(v['views'])} views — {v['link']}")
        out.append("")

    if termos:
        out.append("## Google Trends — buscas que mais subiram no Brasil (último mês)")
        for t in termos:
            print(f"... Google Trends: {t}", file=sys.stderr)
            itens, erro = trends(t)
            if erro:
                out.append(f"- **{t}:** {erro}")
            elif not itens:
                out.append(f"- **{t}:** sem buscas subindo")
            else:
                lista = "; ".join(f"{q} (+{v}%)" if v < 5000 else f"{q} (explodiu)" for q, v in itens)
                out.append(f"- **{t}:** {lista}")
        out.append("")

    texto = "\n".join(out)
    if a.saida:
        Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
        Path(a.saida).write_text(texto, encoding="utf-8")
        print(f"salvo em {a.saida}", file=sys.stderr)
    print(texto)


if __name__ == "__main__":
    main()
