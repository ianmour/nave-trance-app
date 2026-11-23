# Departamento: App da agência ("QG")

Fale em português, simples e sem jargão. A pessoa tem pouca paciência: seja direta.
Leia antes: `CLAUDE.md`, `departamentos/LEIA-ME.md` (seção "App da agência") e `departamentos/design/marca-ianmour/LEIA-ME.md` (cores, letras, símbolos em pixel).

## O que é
O app próprio da agência ianmour, no **estilo game da marca** (o real virando jogo: noite #0A0A14, rosa #FC3B7F, azul #0032A8, creme #FEF1CF; Anton, Silkscreen, Archivo; símbolos em pixel de `departamentos/design/marca-ianmour/simbolos/`).
O **cérebro é o Claude** nas abas: o app organiza, mostra e guarda. Nada pago ligado ao app.

## Primeira versão (base)
1. **Senha simples na entrada** (pedido da pessoa; não é segurança forte, então nada sensível de cliente no app).
2. **Tela inicial com os mundos** = departamentos: Ideias e planejamento, Roteiros, Design, Edição de vídeo, Propostas e apresentações. Cada mundo mostra o que já existe e o que ainda está "em construção".
3. **Clientes:** ficha de cada um (vem de `estilo/clientes/`), mês atual, status dos posts como placar/XP, pedidos pendentes. Primeiro cliente: Keylle Lima.
4. **Entregas dentro do app:** o planejamento de dezembro do Keylle (`departamentos/ideias-e-planejamento/keylle-lima/entregas/*.html`) abre lá dentro.
5. **"Sobre mim" só no final**, com a foto da pessoa (`departamentos/design/entregas/ianmour/marca/referencias/`), sem ser a cara do app.
6. **Instalável** na Tela de Início do iPhone/iPad (Safari → Compartilhar → Adicionar à Tela de Início) e do Android. Funciona em tela cheia.

## Regras de construção
- Feito de um jeito que dê para **empacotar depois para App Store e Play Store** sem refazer (a pessoa quer isso no futuro; contas de desenvolvedor são pagas, só quando ela decidir).
- O código do app fica em `departamentos/app-qg/app/`. Não mexer nos arquivos do app Nave Trance da raiz.
- Hospedagem grátis (GitHub Pages, Netlify ou Cloudflare): **pedir autorização** antes de criar qualquer conta ou publicar.
- Testar no tamanho de celular e de iPad antes de dizer que funciona.

## Situação
**Base 0.1 pronta em 22/11/2026** (feita na aba de Ideias, a pedido da pessoa), em `app/`:
- `index.html`, `app.css`, `app.js` (versão 0.3: entrada com senha; **menu lateral** como no app do Claude — fixo no iPad, abre no ☰ no iPhone — com Início, Departamentos, Clientes e Sobre mim/Sair no fim; cada departamento tem o botão **"Falar com o Claude"**, que abre a aba certa do Claude; visor que abre as entregas dentro do app).
- A navegação **não depende do endereço** (funciona dentro do visualizador da conversa). Entregas na prévia entram por `srcdoc` (links data: ficam brancos no visualizador).
- Links das abas do Claude ficam no campo `claude` de cada departamento em `dados.js`.
- `dados.js`: **é aqui que se atualiza** mundos (nível/status), clientes, meses e o "Sobre". Senha atual: números (definida pela pessoa em 22/11/2026; não escrever a senha em arquivos) (guardada embaralhada com cyrb53; para trocar, gerar o novo código e trocar `senha`).
- `simbolos.js` (cópia de `design/marca-ianmour/simbolos.js`), `icones/` (gerados do símbolo controle), `manifest.webmanifest` e `sw.js` (instalável e abre sem internet).
- `entregas/`: cópias das páginas entregues (ex.: planejamento do Keylle). Ao gerar uma entrega nova, copiar para cá e acrescentar no `dados.js`.
- O placar (aprovados, postados, gravações) lê o que foi marcado na página do planejamento **no mesmo aparelho**.
- Prévia num arquivo só (para mandar na conversa): `python3 _tecnico/scripts/app-previa.py` → `departamentos/app-qg/ianmour - previa.html`.
- Falta: foto do "Sobre" (a pessoa manda o arquivo), publicar num link grátis (pedir autorização), senha definitiva.

- **Publicação:** `netlify.toml` na raiz do repositório publica só `departamentos/app-qg/app` no Netlify (conta grátis da pessoa, ligada ao GitHub, branch `claude/video-editor-setup-mkodfr`). Cada push atualiza o app sozinho.
