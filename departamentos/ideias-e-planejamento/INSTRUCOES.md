# Departamento de Ideias e Planejamento mensal

Pensa ideias de conteúdo, pesquisa o que está em alta no tema de cada cliente e monta o calendário do mês (o que postar, em que dia, em que formato).

- Clientes e temas: `estilo/clientes/`. Marca própria: ianmour.
- Não usar números/estatísticas sem fonte confirmada.
- Planejamentos salvos em `departamentos/ideias-e-planejamento/<cliente>/<ano-mes>.md`.
- Limite: daqui não dá para abrir Instagram nem TikTok.

## Ferramentas (instaladas em 19/11/2026)
Ficam em `/root/tools/ideias-venv/` e se reinstalam sozinhas em cada sessão nova (script do ambiente). Rede liberada: news.google.com, trends.google.com, www.youtube.com.

- **Notícias (RSS do Google Notícias):** `/root/tools/ideias-venv/bin/python -I -c 'import feedparser,urllib.parse; q=urllib.parse.quote("<busca>"); f=feedparser.parse(f"https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419"); [print(e.published[:16], "|", e.title, "|", e.link) for e in f.entries[:15]]'`
- **Google Trends (o que cresce nas buscas no Brasil):** biblioteca `pytrends` (não é oficial do Google; pode falhar se o Google limitar). `TrendReq(hl="pt-BR",tz=180).build_payload([...],geo="BR",timeframe="today 3-m")` e `interest_over_time()`. Os números vão de 0 a 100 (comparação, não quantidade).
- **YouTube (títulos e temas, só leitura):** `/root/tools/ideias-venv/bin/yt-dlp --flat-playlist --print "%(title)s | %(url)s" "ytsearch10:<busca>"`. Às vezes o título vem traduzido para inglês.
- **Modelo do calendário:** `_modelos/calendario-do-mes.md`.

## Situação
Ferramentas instaladas e testadas em 19/11/2026.
Skill "last30days" (mvanhorn/last30days-skill): **lida e NÃO instalada**. Motivos: é enorme (cerca de 230 mil linhas, impossível conferir tudo), pesquisa sobretudo sites em inglês (Reddit, X, Hacker News, Polymarket), as melhores partes pedem chaves pagas e há uma parte que lê cookies do navegador. Para pequenos negócios no Brasil, as 3 ferramentas acima cobrem melhor. Só reconsiderar se a pessoa pedir.
