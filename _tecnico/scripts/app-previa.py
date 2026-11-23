"""Junta o app do QG num arquivo .html só (para ver no celular antes de publicar). Uso: python3 _tecnico/scripts/app-previa.py"""
import base64, re
from pathlib import Path
A = Path(__file__).resolve().parents[2] / "departamentos/app-qg/app"
html = (A / "index.html").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="app.css">', "<style>" + (A / "app.css").read_text(encoding="utf-8") + "</style>")
for nome in ("simbolos.js", "dados.js", "app.js"):
    js = (A / nome).read_text(encoding="utf-8").replace("</script", "<\\/script")
    html = html.replace(f'<script src="{nome}"></script>', f"<script>{js}</script>")
# entregas viram data: (abrem dentro do visor), ícones embutidos, sem manifest/service worker
def emb(m):
    arq = m.group(1)
    p = A / arq
    return '"data:text/html;base64,' + base64.b64encode(p.read_bytes()).decode() + '"' if p.exists() else m.group(0)
html = html.replace("arquivo: \"entregas/", "arquivo: \"entregas/")
dados_js = (A / "dados.js").read_text(encoding="utf-8")
for arq in re.findall(r'arquivo:\s*"([^"]+)"', dados_js):
    p = A / arq
    if p.exists():
        html = html.replace(f'"{arq}"', '"data:text/html;base64,' + base64.b64encode(p.read_bytes()).decode() + '"')
ico = "data:image/png;base64," + base64.b64encode((A / "icones/icon-192.png").read_bytes()).decode()
html = re.sub(r'<link rel="manifest"[^>]*>\n', "", html)
html = html.replace('href="icones/apple-touch-icon.png"', f'href="{ico}"').replace('href="icones/icon-192.png"', f'href="{ico}"')
saida = A.parent / "ianmour - previa.html"
saida.write_text(html, encoding="utf-8")
print("salvo em", saida)
