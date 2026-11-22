# Processo: o que aconteceu nos últimos 30 dias → ideias de conteúdo (qualquer cliente)

**A pessoa diz:** "cliente X, assunto Y (para o público Z), quero ideias para o planejamento".

## 1. Ficha do cliente
Ler `estilo/clientes/<cliente>.md`. Se não existir, perguntar só o essencial (assunto, público, região, formato preferido) e criar a ficha.

## 2. Pesquisar os últimos 30 dias sobre o ASSUNTO (não sobre o cliente)
```
/root/tools/ideias-venv/bin/python -I _tecnico/scripts/ultimos30dias.py \
  --tema "<assunto>" --publico "<público>" \
  --saida departamentos/ideias-e-planejamento/<cliente>/pesquisas/<aaaa-mm-dd>-pesquisa.md
```
- Monta sozinho as buscas sobre o assunto, por vários ângulos (novidades, tendência, como fazer, erros, polêmica, lei nova, estudos, IA): `buscas/_angulos.txt`.
- Traz notícias do mês, vídeos do YouTube do mês (mais vistos primeiro) e buscas que estão subindo no Google Trends, tudo com data e link. Leva de 2 a 4 minutos.
- Dá para somar buscas extras entre aspas, ou `--trends "<palavra>"`.

## 3. Entregar as ideias de conteúdo
Ler a pesquisa, jogar fora o ruído (política, notícias de outros países, coisas sem relação) e responder em linguagem simples:
1. **Os assuntos do mês:** o que mais apareceu ou está crescendo sobre o tema (resumo curto, com link).
2. **Ideias de conteúdo** em cima disso, seguindo a **regra de ouro da CONEXÃO** (`INSTRUCOES.md`): cada ideia tem a **cena ou frase com que o público se identifica**, a virada (o que ensinar), o formato (a maioria em Reels) e de qual assunto do mês ela veio.

Salvar em `<cliente>/pesquisas/<aaaa-mm-dd>-ideias.md`. Números e estatísticas só com fonte conferida (abrir o link).

## 4. (Se a pessoa quiser) Calendário
Ritmo padrão: um dia sim, um dia não. Sempre incluir a seção **"Ideias para trocar"** (8 a 10 ideias extras do mesmo mês, com tema, abertura, virada e de onde veio), que aparece na página abaixo do "Em alta". Com as ideias aprovadas, montar `<cliente>/<aaaa-mm>.md` com o modelo `_modelos/calendario-do-mes.md`.

## 5. Deixar os posts prontos (fluxo de agência)
Tudo fica numa página só por mês e por cliente (`<cliente>/entregas/...html`), que cresce a cada etapa:
1. **Ideias (esta aba):** seção `## Legendas e estratégia` no .md: para cada dia (`### 01`), **Objetivo** (seguidores, comentários, salvar, compartilhar, conexão, informação), **Chamada** (ex.: "comenta ESCALA que eu te mando..."), **Preparar** (material prometido na chamada) e a legenda pronta. Nem todo post pede comentário: alguns são só informação ou conexão.
2. **Pedidos para o cliente:** seção `## Pedidos para o <cliente>` (Prazo | Post | Tipo | Pedido | Texto para gravar | Como gravar). Prazos por semana. O texto sai do roteiro (aba de Roteiros) e a aba de Vídeo confirma o que precisa.
3. **Design** (aba de Design) faz os carrosséis e as capas.
4. **Aprovação:** o cliente abre a página, marca "Aprovado" ou "Quero ajustar" em cada post e toca em "Enviar respostas" (abre o WhatsApp com o resumo).
Gerar a página de novo depois de cada mudança no .md.
