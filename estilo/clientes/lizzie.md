# Cliente: Lizzie (Liziane Almeida) — @lizyanealmeida

- **Quem é:** fotógrafa de festivais (também DJ, mas não é o foco). Quer ser **criadora de conteúdo sobre fotografia**. Mora em Florianópolis; fundadora da @navetrance. Perfil: `estilo/clientes/lizzie-perfil.png`.
- **Capas do perfil:** títulos em letra condensada grossa laranja/creme ("LARGUEI MEU EMPREGO PRESENCIAL"), fotos quentes, cara de cinema.

## Estilo que ela gosta (`referencias/ref-lizzie-01.mp4`)
- Vídeo falado, calmo, com **legenda elegante em duas letras**: a palavra-chave em **cursiva/serifada itálica** (estilo "Nem todo") misturada com **sem serifa limpa** (estilo "sofrimento pós parto"); cor creme/off-white; 1 a 3 linhas; aparece no peito/meio da tela.
- Títulos-chave maiores em cursiva ("Culturas", "Psicose puerperal").
- **Efeitos sonoros**: cliques, barulhinhos sutis quando o texto entra.
- Cor quente de cinema, fundo escuro.
- Para o vídeo do Walter Firmo: alternar **ela falando** + **fotos do Walter Firmo** (tela cheia, com texto), cliques de câmera nas fotos.

## Walter Firmo v3 (27/11) — o que ela pediu depois da v2
- **Cortes:** nada de picotar pausas dentro da frase (ficou "travado"). Cada frase inteira, cortada logo antes da 1ª palavra e logo depois da última. Começo direto, como chamada (sem respiro no início).
- **Animação:** "motion vintage criativo": papel antigo escuro com borda rasgada, granulado de filme, pessoas das fotos recortadas como adesivo de borda creme, tremido de stop-motion, carimbo, letra de máquina de escrever, molduras, visor de câmera. Alterna cena de papel (rosto da foto) ↔ rosto dela. Final: o vídeo dela numa polaroid no meio dos recortes.
- Script: `_tecnico/scripts/gerar-lizzie-v3.mjs` (montagem: `montar-lizzie-v3.py`).

## Walter Firmo v4 (27/11) — pedidos sobre a v3
- **Mostrar a foto INTEIRA** (para analisar o trabalho dele), não só recorte. Solução: foto impressa inteira com borda creme + o recorte da pessoa "saltando" de dentro dela.
- **Fluidez nos cortes:** corte rápido logo que a palavra termina e já entra a próxima frase; pausas longas no meio viram ~0,1 s. Nunca cortar palavra no meio. Conferir cada trecho com o whisper (sobrou pedaço de outra tentativa — "padrão" repetido — no começo de um take).
- **Voz mais alta/impactante:** -12 LUFS, compressão mais forte.
- Final: ela numa polaroid grande com fita, fotos inteiras dele em volta (ela gostou, pediu para caprichar).
- Script: `_tecnico/scripts/gerar-lizzie-v4.mjs` + `lizzie-cortes-v4.py` + `montar-lizzie-v4.py`.

## Referência moderna (28/11) — `referencias/ref-lizzie-moderna-01.mp4`
- Letra fina geométrica minúscula (1–2 palavras), palavras grandes finas em DEGRADÊ (às vezes atrás da pessoa).
- Cartões "de vidro"/UI arredondados em degradê como infográfico: peças A B C D / 1 2 3, calendário com dias, gráfico de linha, etiquetas "+2€".
- Rótulos pequenos de seção no topo ("01 / estratégia"). Cenas limpas de tela cheia (branco/preto) com gráfico.
- Imagem nítida, cor viva e quente, sem granulado. Cortes a cada 3–5 s; o movimento está nos gráficos.
- Pedido: juntar esse estilo moderno com a criatividade da Lizzie (fotos, recorte, palavras atrás).
