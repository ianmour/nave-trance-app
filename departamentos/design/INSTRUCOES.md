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
