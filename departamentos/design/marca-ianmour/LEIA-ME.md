# Padrão da marca ianmour (definido em 20/11/2026)

Vale para tudo que é **"pra mim"** (ianmour): posts, carrosséis, documentos, propostas, vídeos. Folha visual: `folha-da-marca.html` (PNG em `departamentos/design/entregas/ianmour/marca/`).

## O conceito: o real virando jogo (definido pela pessoa em 20/11/2026)
A foto de perfil mostra a ideia da marca: **metade real, metade pixel**. Lado rosa = mundo do jogo (pixel art, contorno preto, cores chapadas); lado azul = foto real. Roupa nas cores da marca (polo azul com detalhes creme).
Referências (fora do GitHub): `departamentos/design/entregas/ianmour/marca/referencias/foto-perfil-real.jpg` e `foto-perfil-metade-pixel.jpg`.
- Em peças e vídeos, buscar essa mistura: coisa real que "vira" pixel, ou elementos de jogo entrando no mundo real.
- Os símbolos em pixel fazem parte desse mundo do jogo.
- Vídeos futuros: assuntos reais (ex.: drone) contados de forma gamificada — pixel art, movimento em degraus, sons de jogo, pontuação/fases.

## Os 3 mundos (pilares de conteúdo, 20/11/2026)
O feed é dividido em 3 colunas, cada uma um mundo:
| Coluna | Mundo | Conteúdo |
|---|---|---|
| Esquerda (rosa) | **GAME** | vídeos feitos pelo Claude, em pixel art, contados como história de jogo (ex.: dicas de drone em "fases") |
| Meio (rosa\|azul) | **MISSÃO** | a pessoa real + camada de jogo: desafios, antes/depois, resultados como placar/XP |
| Direita (azul) | **REAL** | bastidores, a pessoa se gravando, sem efeito |
- **Cores do feed (pedido da pessoa):** coluna da esquerda toda rosa, da direita toda azul, a do meio dividida rosa|azul na mesma linha da foto de perfil.
- **Só 1 foto da pessoa no feed:** a fixada, em cima no meio. Não repetir foto.
- **3 posts fixados no topo:** "Bem-vindo ao meu mundo" | foto metade pixel | "Escolha seu mundo".
- **Ordem para postar (sempre):** REAL → MISSÃO → GAME (cada post novo empurra os outros; assim as colunas ficam certas).
- Cada post leva a etiqueta do mundo no canto. Os temas dos posts da proposta são só exemplos (a pessoa não quis o tema "pássaros").
- Proposta visual atual: `departamentos/design/projetos/ianmour/2026-11-20-feed-mundo-game/feed-rosa-azul.html`.

## Cores
| Nome | Código | Uso | Quanto aparece numa peça |
|---|---|---|---|
| Noite | `#0A0A14` | fundo escuro de base | ~50% |
| Rosa | `#FC3B7F` | cor principal: palavras grandes, destaques, tela cheia | ~25% |
| Azul | `#0032A8` | segunda cor: contraste, caixinhas, fundos | ~15% |
| Creme | `#FEF1CF` | texto sobre rosa, azul ou escuro | ~10% |

Legenda de vídeo continua **branca** (regra do `estilo/meu-estilo.md`).

## Símbolos (desenho próprio, em pixel)
Pasta `simbolos/`: 8 símbolos × 4 cores (`<nome>-rosa|creme|azul|noite.svg`), em vetor (não perdem qualidade).

| Símbolo | Quando usar |
|---|---|
| faisca | destaque, novidade, ideia |
| seta | próximo, arrasta, caminho |
| raio | energia, impacto, rapidez |
| feito | feito, certo, aprovado |
| olho | atenção, veja isso |
| fala | conversa, opinião, comentário |
| mira | foco, objetivo, meta |
| play | vídeo, assistir, começar |

**Regras**
- **Assinatura:** todo símbolo tem o **pixel solto** no canto de cima à direita, na cor de destaque (rosa; azul quando o símbolo é rosa). Nunca tirar.
- **Fundo azul:** símbolo sempre em creme (o pixel solto fica rosa). Símbolo rosa só em fundo escuro ou creme.
- **Carimbo:** em destaque, o símbolo vai num quadrado azul com sombra rosa dura (deslocada para baixo e para a direita).
- Usar só estes símbolos nas peças ianmour. **Não usar ícones prontos** (de banco de ícones) nas peças da marca.
- Precisa de um símbolo novo? Desenhar na mesma grade 12×12 em `gerar-simbolos.py` (mesma espessura, pixel solto), rodar `python3 gerar-simbolos.py` e acrescentar na tabela.

## Letras usadas até agora
Anton (títulos grandes, condensada), Silkscreen (detalhes em pixel), Archivo (texto corrido).
