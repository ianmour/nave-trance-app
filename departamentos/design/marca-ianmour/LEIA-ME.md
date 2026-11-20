# Padrão da marca ianmour (definido em 20/11/2026)

Vale para tudo que é **"pra mim"** (ianmour): posts, carrosséis, documentos, propostas, vídeos. Folha visual: `folha-da-marca.html` (PNG em `departamentos/design/entregas/ianmour/marca/`).

## O conceito: o real virando jogo (definido pela pessoa em 20/11/2026)
A foto de perfil mostra a ideia da marca: **metade real, metade pixel**. Lado rosa = mundo do jogo (pixel art, contorno preto, cores chapadas); lado azul = foto real. Roupa nas cores da marca (polo azul com detalhes creme).
Referências (fora do GitHub): `departamentos/design/entregas/ianmour/marca/referencias/foto-perfil-real.jpg` e `foto-perfil-metade-pixel.jpg`.
- Em peças e vídeos, buscar essa mistura: coisa real que "vira" pixel, ou elementos de jogo entrando no mundo real.
- Os símbolos em pixel fazem parte desse mundo do jogo.
- Vídeos futuros: assuntos reais (ex.: drone) contados de forma gamificada — pixel art, movimento em degraus, sons de jogo, pontuação/fases.

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
