# Guia de estilo ianmour

Tirado das suas próprias edições (`referencias/ianmour-01-sua-edicao.MOV` e `referencias/ianmour-sua-edicao-02.MOV`) e do que você me disse. Vale para vídeos **seus** e de **clientes**; o que muda entre os dois são só as cores (ver `meu-estilo.md`).

A ideia: **um jeito reconhecível, sem repetir a mesma fórmula**. Por isso tem uma **base fixa** e um **cardápio** que eu vario de vídeo para vídeo.

> **🔇 REGRA DE SOM (mais recente):** **sem música de fundo**. Mas **efeitos sonoros a pessoa ama**: whoosh, pop, clique, digitação, impacto, subida de tensão antes do momento forte, sons de interface — caprichar em todo vídeo, sempre abaixo da voz. (Músicas "de sonho/esperança" foram rejeitadas; se um dia voltar a ter música, tem que ser séria e firme.)
>
> **⚠️ Atualização mais importante (feedback do ianmour-01):** a pessoa **preferiu a versão animada e enérgica** (`final/ianmour-01-editado.mp4`, projeto `_tecnico/hyperframes/ianmour-01-v2`): cores rosa e azul, palavras grandes batendo na tela, telas cheias coloridas, etiquetas, moldura REC, câmera com zoom alternando, efeitos sonoros. A versão "elegante e minimalista" (`final/ianmour-01-cliente.mp4`) **NÃO agradou** — ficou contida e sem graça.
> **Ponto de partida de toda edição = a versão animada (v2)**, com estes ajustes:
> - **música de fundo** (faltou na v2);
> - **efeitos sonoros mais baixos que a voz** (na v2 estavam altos) — manter os efeitos, só baixar;
> - tirar o que passar do ponto (ex.: tremor/flash em excesso), sem perder a energia.
> As regras abaixo (legenda branca de uma letra só, palavra-chave maior, sem itálico) continuam valendo.
>
> **O que a pessoa prega: PERSONALIDADE.** Legenda branca, mas **as animações e tudo que passa na tela levam as cores da identidade visual** (rosa `#FC3B7F`, creme `#FEF1CF`, azul `#0032A8` para a ianmour). **Símbolos** (ícones, figurinhas, marcas visuais) **só os que forem definidos antes com a pessoa** — nunca inventar.

---

## Vídeo FALADO de CLIENTE (pessoa falando para a câmera) — estilo padrão

Tirado de `referencias/ref-cliente-falado-01.mp4` e `ref-cliente-falado-02.mp4` (a pessoa disse: "é exatamente assim que eu gosto"):

- **Legenda:** branca, letra lisa e moderna, **pequena**, 1 a 3 palavras por vez, centralizada na altura do peito, entrando com esmaecido rápido. **Uma palavra de destaque** de vez em quando: mais grossa (ex.: "uma conta **rápida**") ou maior/na cor de destaque. Às vezes a frase curta fica numa **pílula escura translúcida** ("R$10 a mais", "Saiba Mais").
- **Cortes de zoom** a cada poucos segundos (enquadramento aberto ↔ fechado), seco, sem tremor — dá ritmo a quem só fala.
- **Imagens de apoio** sobre o tema dentro de um **cartão arredondado** (estilo tela de celular) sobre fundo escuro, com a legenda continuando por cima.
- **Tela cheia de frase** em 1 ou 2 momentos-chave, sobre foto de fundo neutra, com a palavra forte grande na cor de destaque.
- **Ícone/logo pequeno** surgindo ao lado da palavra quando se fala de uma marca/produto (só os definidos com a pessoa).
- **Final com a marca do cliente** (logo + chamada tipo "Saiba Mais"), se houver material.
- (de `referencias/ref-falado-04.mp4`, mesmo criador, "gosto muito desse estilo") **Elementos de app que ilustram a palavra no instante em que é dita**:
  - **balões de conversa** surgindo com o verbo ("copia" / "cola" em balões verdes);
  - **notificação no canto** mostrando um processo ("Montando apresentação…" → "Apresentação concluída!");
  - **grade de ícones** subindo de baixo quando fala de "várias ferramentas";
  - **ícone pequeno grudado na palavra** ("Inteligência Artificial" com um selinho "AI").
- Cortes alternando **plano aberto ↔ fechado** a cada 2–4 s (ali são dois ângulos de câmera; com uma câmera só, usar zoom seco).
- **Música de leve**, uns 10 dB abaixo da voz, o vídeo inteiro. Efeitos sonoros discretos.
- Cor natural, quente e bonita. Volume final -14 LUFS (as duas referências estão exatamente nisso).

---

## Vídeo de CONTEÚDO 100% animado (narração + animação em código)

Tirado de `referencias/ref-animacao-codigo-01.mp4` (reels feito inteiro pelo Claude em código; a pessoa quer fazer igual e melhor):

- **Palco fixo:** um fundo único o vídeo todo (ali: creme/pêssego com mancha de luz suave). Nada de cortes secos — **as cenas se transformam umas nas outras**.
- **Um cartão central por ideia**, cada um com uma "mini cena" que ilustra a frase: janela de terminal com texto sendo digitado, contador subindo (0 → 42 reels; 7.828.884 → 14.000.060 views), grade de miniaturas, leque de cartões, cartão de preço/comparação (Reels ∞ · créditos 0 · editor R$ 0), checklist, botão de chamada ("Comenta EDIT IA").
- **Física e objetos**: bola de demolição derrubando tijolos que voam; ícones em pixel 3D; tipografia estilo comercial da Apple; caderno com letra de mão. Varia o estilo de cena para cena.
- **Legenda embaixo, centralizada**, palavra por palavra, letra lisa escura/branca; **a palavra-chave dentro de uma etiqueta colorida** (texto branco sobre a cor da marca).
- **Mascote/símbolo recorrente** (ali: um bichinho de pixel laranja aparecendo nos cantos) — dá personalidade. Para a ianmour: **definir o símbolo junto com a pessoa antes**.
- **Celebração** nos números grandes (confete ao bater "+20.003 seguidores").
- **Narração** (voz) + **efeito sonoro em cada ação** (digitar, clique, impacto, confete) + música de leve. Volume -14 LUFS.
- **Final com chamada** clara (comente X / toque em Saiba mais).

Como eu faço: roteiro → voz (Kokoro, `pf_dora` aprovada) → tempo de cada palavra → uma cena de animação por frase no HyperFrames, todas sobre o mesmo palco → efeitos sonoros e música → render → conferir.

---

## Base fixa (todo vídeo)

### Legenda
- **Branca, sempre.** Contorno ou sombra escura bem suave só para ler sobre fundo claro.
- **Uma letra só**, lisa e moderna, com as letras **bem juntinhas** (Inter, espaçamento apertado).
- **Nada de itálico cursivo/serifado.** Ênfase é pelo **tamanho e peso**: a palavra-chave fica **maior e mais grossa**, na mesma letra.
- Monta em **até 2 linhas**, palavra por palavra, cada palavra entrando com **esmaecido suave** (sem pulo, sem quique).
- **Centralizada**, na altura do peito, longe do rosto.

### Movimento
- **Suave e elegante.** Entradas e saídas com esmaecido, deslize curto ou máscara.
- **Sem tremor, sem flash, sem zoom brusco** (no máximo um empurrão lento de câmera).

### Cor
- **Uma ou duas cores de destaque** por vídeo, nunca muitas.
- Imagem com cor **cinematográfica, puxando para o quente/laranja**, contraste de cinema, pele bonita.

### Som
- **Música de fundo** o vídeo inteiro, baixinha, abaixando sozinha quando há fala.
- **Poucos efeitos sonoros**, só nos momentos de transição, **bem abaixo da voz**.
- Volume final **-14 LUFS**, sem estourar (pico abaixo de -1 dB).

### Telas cheias e títulos
- Em 1 a 3 momentos-chave: **tela cheia na cor de destaque** com o texto grande em **letra condensada maiúscula**, misturando palavras grandes e pequenas ("VÍDEOS *que* EU TRANSFORMO *o seu* NEGÓCIO").
- Gravação de tela / imagem de apoio: dentro de um **cartão arredondado** sobre o fundo colorido.

---

## Cardápio (variar a cada vídeo — anotar qual foi usado abaixo)

**Forma "tema"** (uma por vídeo, usada nas transições e como detalhe):
- Círculos de linha fina + forma curva grande (usado: ianmour-01, sua edição)
- Ondas orgânicas (usado: vídeo da roda-gigante, sua edição)
- Linhas retas / grade fina
- Retângulos arredondados deslizando (cartões)
- Faixas diagonais
- Pontos / partículas discretas

**Transição:** abertura em círculo · onda subindo · cortina lateral · deslize de cartão · máscara diagonal.

**Título grande:** condensada maiúscula em tela cheia · palavra gigante atrás/ao redor da pessoa · palavra grande no topo (ex.: "VIDEOMAKER").

**Detalhes:** figurinhas animadas pequenas (sol, ícones) · contornos finos · moldura arredondada.

**Cartões que explicam o que a pessoa fala** (de `referencias/ref-estilo-03.mp4`, que a pessoa disse ser "basicamente o estilo que eu gosto"; a legenda dele NÃO agradou — usar a nossa):
- **Barras de comparação** que enchem animadas ("Edição manual: 2 a 4 h" × "Com IA: 15 min").
- **Lista sendo riscada** ("~~CapCut~~ ~~Premiere~~ ~~Edits~~ → 0 min").
- **Checklist** com os itens sendo marcados ✓.
- **Balão de mensagem/chat** com a frase digitada.
- **Número gigante** em tela cheia ("50%") e **título em tela cheia** ("Edição Viral") na cor da marca.
- **Faixa de miniaturas** no topo quando se fala de vários vídeos/exemplos.
- **Gravação de tela** num cartão arredondado.
- **Palavra grande atrás da pessoa**, com a imagem levemente escurecida.
- **Pílula "Saiba mais"** no final.
- Uma paleta de marca só no vídeo inteiro (nele: verde-escuro + dourado).

---

## Lições das referências favoritas (Hanah Franklin e @midtrack.co)

Estudadas quadro a quadro (10 fotos por segundo). Por que parecem criativas **sem exagero**:

1. **Pouca coisa na tela ao mesmo tempo.** Um título OU uma legenda pequena, e muito espaço vazio em volta.
2. **O texto mora no espaço vazio da imagem**: na parede ao lado da pessoa, no céu, ao lado do objeto. Não fica sempre no centro do topo.
3. **Entradas curtas e limpas**: o título aparece **desfocado e entra em foco** em uns 0,2–0,3 s (Hanah), ou **surge seco no tempo exato da palavra** (@midtrack). Sem quique, sem tremor, sem pulo.
4. **Título que se monta junto com a fala**: linha por linha, cada linha surgindo quando a palavra é dita ("SE VOCÊ / TÁ JUNTANDO / DINHEIRO / PRA COMPRAR").
5. **Combinação "frase pequena + palavra grande"**: uma linha pequena em cima ("cê sabia") e a palavra grande embaixo ("disso?").
6. **Legenda discreta**: pequena, 1 ou 2 palavras, trocando seco no ritmo da fala. Quem chama atenção são os títulos, não a legenda.
7. **Quem dá o ritmo são as imagens**, não os efeitos: muitas tomadas curtas (no @midtrack, trocas de 0,2 a 0,5 s nos detalhes do produto).
8. **Uma cor de destaque só** (amarelo no @midtrack, branco na Hanah).
9. **Transições com luz**: um "vazamento de luz" laranja suave para entrar numa gravação de tela, que aparece num cartão sobre o fundo desfocado.
10. **Texto que acompanha o objeto** (@midtrack): "MICROFONE" escrito em curva em volta do produto, letra por letra. É um recurso avançado, para usar de vez em quando.

Ajuste ao seu gosto: os títulos da Hanah usam letra inclinada; **você prefere a mesma letra da legenda**, então a ênfase dos títulos vem do **tamanho e do peso**, não da inclinação.

---

## Histórico de variações

| Vídeo | Forma tema | Transição | Cor de destaque |
|---|---|---|---|
| ianmour-01 (sua edição) | círculos de linha + curva | abertura em círculo | azul |
| roda-gigante (sua edição, cliente) | ondas | onda subindo | ciano + petróleo |
| ianmour-01 (versão cliente, minha) | linhas finas âmbar + cartão no final | brilho de luz quente | branco + âmbar |
| keylle-lima/bronca v1 (conteúdo animado) | cartões sobre fundo azul forte | — | ❌ não agradou: fundo escuro e bonequinhos sem personalidade |
| keylle-lima/bronca v2 (conteúdo animado) | fundo branco quadriculado + degradê azul claro nos cantos; estilo "adesivo" (contorno escuro + sombra marcada); personagens com rosto e expressão | cena que sobe/desce | azul + branco, vermelho só para "errado"; sem música |
| keylle-lima/bronca v3 (conteúdo animado) | telas de app (celular que gira, enquete, controle deslizante, planta de escritório, campo de texto, cartão de tarefa, mapa, post) + barra de 3 passos que acumula | zoom entrando no cartão; pêndulo | branco + azul; sombras suaves (sem contorno grosso); sem música |
| ianmour-01 cliente falado (estilo ref-falado) | elementos de app: notificações estilo iPhone, balões, grade de ícones, cartão de nome, progresso, "Saiba mais" | zoom seco aberto/fechado | neutro (branco/cinza, azul iMessage nos balões); sem música |
