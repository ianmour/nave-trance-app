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
Pasta criada em 22/11/2026. Nada construído ainda.
