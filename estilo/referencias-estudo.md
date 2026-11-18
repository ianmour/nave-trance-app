# Estudo das referências

Os 4 vídeos de `referencias/` (de @midtrack.co, @hanah.franklin e @luccasajar). Medi com FFmpeg e whisper.cpp, aqui no computador, e olhei uma imagem a cada 2 segundos de cada vídeo.

## Os números

| Vídeo | Duração | Trocas de imagem | Uma imagem dura em média | Fala |
|---|---|---|---|---|
| ref-microfone | 44 s | 30 | **1,4 s** | 3,2 palavras/s |
| ref-planos-diferentes | 41 s | 15 | 2,6 s | 3,7 palavras/s |
| ref-textos-e-legendas | 93 s | 33 | 2,7 s | 3,4 palavras/s |
| ref-cor-no-capcut | 94 s | 18 | 4,9 s* | 4,0 palavras/s |

\* Esse tem muita gravação de tela do celular, que "conta" como uma imagem só, mas lá dentro tudo se mexe o tempo todo.

## O que os 4 têm em comum

**Ritmo**
- **Fala desde o primeiro instante** (0,00 s em todos), sem silêncio no começo.
- **Quase nenhuma pausa:** nenhuma acima de 0,5 s durante a fala, e a maioria abaixo de 0,3 s. Bate com a sua regra (pausas até 0,25 s).
- A imagem troca a cada **1,5 a 3 segundos**: rosto, depois detalhe, depois tela, depois rosto de novo.
- Duração: **40 s a 1min30**.

**Gancho (primeiros 2 segundos)**
- Frase que fala direto com quem assiste: "Se você quer aprender...", "Se você tá juntando dinheiro...", "Eu acho que depois de hoje você não vai mais...".
- Essa frase aparece **escrita grande na tela** logo de cara.

**Legenda (o tempo todo)**
- **Pequena**, 1 a 3 palavras por vez, trocando no ritmo da fala.
- Fica no **meio da tela, um pouco abaixo do centro**, na altura do peito.
- Dois jeitos: **amarela em itálico** (@midtrack.co) ou **branca simples** (os outros dois).

**Palavras-chave (só nos momentos fortes)**
- Uma ou duas palavras **ENORMES**, mais ou menos a cada 3 a 6 segundos: "COR", "LOG", "ABERTO:", "fluidez", "atenção".
- **Mistura de duas letras**: uma condensada, grossa e em CAIXA ALTA ("NÃO ESQUECE") com outra fina e elegante, em itálico, por cima ou embaixo ("de nos seguir").
- Às vezes a palavra fica **atrás da pessoa**: a cabeça cobre um pedaço da letra.
- Cores: amarelo, branco, às vezes verde ou vermelho. Em @luccasajar, palavras em caixinhas rosa sobre um fundo verde.

**Imagem**
- **Cor quente de cinema**: laranja e âmbar no fundo, pele bonita, sombras escuras. O brilho médio é baixo (77 a 90, numa escala de 0 a 255), ou seja, um visual escuro e com contraste.
- **Muitos tipos de plano**: rosto bem perto, corpo inteiro de longe, mão mexendo no produto, tela do celular.
- **Zoom** no rosto nas frases fortes, e às vezes a câmera chega perto da lente.
- Tela do celular **"flutuando"** sobre um fundo colorido (azul ou verde) e moldura arredondada.

**Final**
- Pedido para comentar ou seguir ("comenta COR", "não esquece de nos seguir"), escrito grande.

## O que eu consigo fazer em qualquer vídeo seu

- Cortar pausas e começar direto na primeira palavra.
- Legenda pequena palavra por palavra (amarela itálica ou branca, você escolhe).
- Palavras-chave grandes nos momentos fortes, mesclando as duas letras.
- Zoom no rosto nas frases de impacto.
- Gancho escrito grande nos primeiros 2 segundos.
- Cor quente de cinema.
- Palavra atrás da pessoa (fica mais lento de gerar, mas funciona).

## O que depende de você gravar

- **Planos variados** (detalhe, mão, de longe): sem eles, o vídeo vai ser só o rosto.
- **Gravação de tela do celular**, se o vídeo for tutorial.
- O ritmo de 1,5 a 3 s por imagem só existe se houver imagens diferentes para alternar.
