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
Ritmo padrão: um dia sim, um dia não. Com as ideias aprovadas, montar `<cliente>/<aaaa-mm>.md` com o modelo `_modelos/calendario-do-mes.md`.
