# Meu estilo de corte

Este arquivo diz como eu (Claude) corto os seus vídeos. Antes de cada edição eu leio ele.

## Como mudar

Você tem dois jeitos:
- **Pedir na conversa**, do seu jeito: "deixa mais respiro entre as frases" ou "não corta as pausas curtas". Eu atualizo este arquivo e te mostro o que mudou.
- **Editar você mesmo**: troque só os números em "Valores técnicos", lá embaixo, e salve. Não precisa mexer no resto.

## Regras de corte

- **Pausas:** nenhuma pausa acima de **0,25 s**. As maiores são cortadas.
- **Respiro na emenda:** em cada corte fico com **0,12 s** de silêncio antes e depois da fala, para a palavra não ficar "comida" e a emenda soar natural.
- **Frase repetida:** quando você fala a mesma frase mais de uma vez, fica **a última tomada**.
- **Vícios de fala:** saem "éééé", "hmm", "ããã", "ahn" e parecidos.
- **Estalos de boca:** saem os que ficam soltos, entre as palavras ou nas pausas. Um estalo grudado numa palavra fica, porque tirá-lo picotaria a palavra.
- **Começo:** o vídeo começa **direto na primeira palavra**, sem silêncio antes. Deixo só 0,03 s, imperceptível, para não engolir a primeira sílaba.
- **Tutorial:** quando o vídeo é um passo a passo, guardo uma **pausa curta (0,5 s) antes de cada passo**, para quem assiste respirar e acompanhar. Eu reconheço um passo por palavras como "primeiro", "segundo", "passo", "agora", "depois", "em seguida", "por último". Sempre aviso na lista de cortes quando tratei o vídeo como tutorial.

## Cores: para quem é o vídeo

Sempre pergunto (ou você me diz) se o vídeo é **pra mim** ou **pra cliente**.

**"É pra mim" → identidade ianmour** (referência: `estilo/ianmour-id-visual.jpg`)

| Cor | Código | Uso |
|---|---|---|
| Rosa | `#FC3B7F` | cor principal: palavras grandes, destaques, fundos de tela cheia |
| Creme | `#FEF1CF` | texto sobre rosa ou azul, legenda |
| Azul | `#0032A8` | segunda cor: contraste com o rosa, caixinhas, fundos |

- Clima da referência: streetwear, ousado, letras grossas e condensadas, um toque de pixel e retrô, fundo escuro.
- Legenda e textos usam só essas 3 cores (mais o preto do fundo).
- A cor da imagem gravada (pele, ambiente) eu não troco por conta própria: proponho opções na primeira edição e você escolhe. O que você escolher eu anoto aqui.

**"É pra cliente" → neutro**

- Textos em branco e preto, sem as cores ianmour.
- Imagem com cor natural e limpa, só com correção de luz e contraste.
- Se o cliente tiver cores próprias, você me passa e eu anoto abaixo.

**Clientes com cores próprias**

(nenhum ainda)

## O que eu NÃO faço sem você pedir

- Mudar a ordem das frases.
- Cortar frases inteiras que não são repetição.
- Colocar música, legenda ou animação.

## Estilo visual que você gosta (para quando pedir legenda/animação)

Tirado dos vídeos em `referencias/`:
- Vídeo em pé, ritmo rápido, gancho forte logo no primeiro segundo.
- Legenda pequena, de 1 a 3 palavras por vez, no meio da tela, em amarelo ou branco.
- Palavras-chave GRANDES e animadas nos momentos fortes (ex.: "plano FECHADO:", "não esquece de nos seguir").
- Zoom rápido no rosto nas frases de impacto.
- Cortes para imagens de detalhe ou da tela do celular, quando houver essas imagens.
- Cor quente, de cinema.

## Como o vídeo sai

- Mesmo tamanho e formato do original (vídeo em pé continua em pé).
- Volume normalizado em **-14 LUFS**, o padrão das redes sociais: todos os vídeos ficam com o mesmo volume.
- Prévia (mais leve, para conferir) em `previas/`.
- Versão final (qualidade alta) em `final/`.
- Formato MP4, que abre em qualquer celular, computador e rede social.

## Valores técnicos

```
pausa_minima_s: 0.25
respiro_s: 0.12
inicio_respiro_s: 0.03
silencio_db: -35
repeticao: manter_ultima
vicios: é, éé, ééé, éééé, ã, ãã, hum, hmm, hmmm, ahn, hã, eh, ah
pausa_passo_s: 0.5
palavras_passo: primeiro, primeira, segundo, segunda, terceiro, terceira, quarto, quinto, passo, agora, depois, em seguida, por ultimo, finalmente, proximo
```
