# Departamento de Design

Faz posts, carrosséis, capas de reels, stories e peças da marca **ianmour** e dos clientes.
O design é feito **com código** (HTML/CSS) e exportado em **PNG de alta qualidade** com o navegador que já vem no computador (Chromium/Playwright).

## Formatos padrão
- Post / carrossel: 1080×1350 (uma imagem por lâmina)
- Story / capa de reels: 1080×1920
- Quadrado: 1080×1080

## Cores
- "Pra mim" → identidade ianmour (ver `estilo/meu-estilo.md`: rosa #FC3B7F, creme #FEF1CF, azul #0032A8).
- "Pra cliente" → neutro ou as cores do cliente (perfis em `estilo/clientes/`). Keylle Lima = azul.
- Personalidade sempre (a pessoa prefere o visual com personalidade ao minimalista sem graça).

## Imagens
- Banco grátis: `_tecnico/scripts/buscar-imagem.mjs` (ver CLAUDE.md da raiz). Olhar cada imagem antes de usar e entregar os créditos.
- Sem imagens de IA e sem gerador de imagens (a pessoa não quer).

## Onde salvar
- Projetos (código das peças): `departamentos/design/projetos/<cliente>/<data>-<tema>/`
- Peças prontas (PNG): `departamentos/design/entregas/<cliente>/` (imagens ficam fora do GitHub).

## Ferramentas aprovadas pela pessoa (instalar nesta aba)
1. Skills oficiais da Anthropic (github.com/anthropics/skills, licença Apache-2.0): **frontend-design**, **canvas-design** (com as 27 fontes gratuitas) e **theme-factory**.
2. Script de exportação HTML → PNG em `_tecnico/scripts/exportar-design.mjs` (usa o Chromium que já existe; não instalar outro Playwright).
3. Liberar fonts.googleapis.com e fonts.gstatic.com na rede do ambiente (pedido de aprovação aparece para a pessoa).

## Como usar (instalado em 19/11/2026)
- **Skills** em `.claude/skills/` (carregam sozinhas em toda sessão): `frontend-design` (direção visual), `canvas-design` (pôsteres/peças, com 54 fontes grátis em `.claude/skills/canvas-design/canvas-fonts/`) e `theme-factory` (temas prontos de cor/fonte). Origem e licença: `.claude/skills/ORIGEM.md`.
- **Exportar para PNG:** `node _tecnico/scripts/exportar-design.mjs <peca.html> <pasta> [post|story|reels|quadrado|LxA] [--escala 2]`
  - Carrossel: cada lâmina é um elemento com `class="lamina"` → um PNG por lâmina (`nome-01.png`, `nome-02.png`...).
  - Sem lâminas: exporta a página inteira no tamanho do formato.
  - Avisa se uma lâmina está no tamanho errado ou se alguma fonte/imagem não carregou.
- **Fontes do Google** liberadas na rede (fonts.googleapis.com e fonts.gstatic.com). Se falhar, usar as fontes da canvas-design com `@font-face`.
- Exemplo testado: `projetos/ianmour/2026-11-19-teste-exportacao/carrossel-teste.html` (Anton + Silkscreen + Archivo; rosa/creme/azul em fundo escuro).

## Extras liberados (19/11/2026)
- **Recorte de fundo (rembg)**, local, sem enviar nada para fora:
  `cd /root && /root/tools/rembg-venv/bin/rembg i -m u2net foto.jpg recorte.png` (pessoas: `-m u2net_human_seg`).
  Reinstala sozinho em sessão nova (script do ambiente). O modelo (~170 MB) baixa do GitHub oficial na primeira vez.
- **Ícones grátis (Iconify)**: `https://api.iconify.design/<coleção>/<ícone>.svg?color=%23FC3B7F` (ex.: `ph/arrow-right-bold`). Preferir coleções de licença livre (Phosphor `ph`, Lucide `lucide`, Tabler `tabler`).
- **Wikimedia Commons direto** (`commons.wikimedia.org/w/api.php`): mais fotos livres. Às vezes limita pedidos; esperar e tentar de novo.
- **Pexels**: descartado. O Pexels não está liberando chaves novas (nov/2026). Não oferecer de novo; usar Openverse e Wikimedia.

## Adesivos personalizados (um por pessoa) — pronto desde 19/11/2026
- Modelo: `projetos/_modelos/adesivo-redondo/modelo.html` (redondo: nome da equipe em arco no topo, símbolo no meio, nome da pessoa embaixo). Copiar para a pasta do cliente e trocar símbolo, nome da equipe e cores.
- Gerar: `node _tecnico/scripts/gerar-adesivos.mjs <modelo.html> <nomes.txt> <pasta> [--diametro 60] [--sangria 2] [--dpi 300]`
  Sai: um PDF vetorial e um PNG 300 dpi (fundo transparente) por pessoa, `todos.pdf` (um por página) e `folha-de-conferencia.png` (todos lado a lado, com linha de corte vermelha e área segura azul).
- Nome longo: o modelo diminui a letra e, se ficar abaixo de 6 mm, quebra em duas linhas. O script avisa se ficar abaixo de 5 mm.
- Padrões de gráfica: 300 dpi; sangria de 2 mm (a cor passa da linha de corte); área segura de 3 mm (nada importante perto do corte); letra do nome com no mínimo ~4 mm de altura.
- Para caneca: 5 a 7 cm de diâmetro costuma caber (caneca comum tem ~9,5 cm de altura). Confirmar com a gráfica: tamanho, se querem sangria, se aceitam PDF (preferir) e se o vinil é laminado/resistente a lavar.
- O símbolo do cliente: pedir em vetor (PDF, SVG, AI ou EPS) ou PNG grande com fundo transparente. Se vier com fundo, recortar com rembg.
- Cores: a tela mostra RGB; a gráfica imprime em CMYK. Cores muito vivas (neon) podem sair mais apagadas — avisar a pessoa.
