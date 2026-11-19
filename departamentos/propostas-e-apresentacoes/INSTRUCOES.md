# Departamento de Propostas e Apresentações

Faz propostas comerciais para clientes, orçamentos, apresentações (slides) e documentos da agência.

- Marca ianmour nas peças da própria agência; cores do cliente quando for algo para ele.
- Arquivos salvos em `departamentos/propostas-e-apresentacoes/<cliente>/`.
- Nunca inventar preço, dado ou resultado: perguntar à pessoa.

## Ferramentas (prontas em 19/11/2026 — nada novo instalado, usa o que já vem no computador)
- **Modelos** em `_modelos/`: `proposta.html` (A4: capa, o que precisa, o que vamos entregar, como funciona, investimento, assinatura) e `slides.html` (16:9: capa, texto, lista, número grande, antes/depois, obrigado). Copiar para `<cliente>/` antes de mexer.
- **Cores:** trocar só as 4 variáveis do `:root` (ianmour = rosa/azul/creme; cliente = cores da ficha).
- **Campos `[PREENCHER ...]`:** preço, prazo, dados e números são da pessoa. O exportador avisa se sobrou algum.
- **Exportar PDF:** `node _tecnico/scripts/exportar-pdf.mjs <arquivo.html> <pasta>`
- **PDF + PowerPoint:** acrescentar `--pptx`. O PowerPoint sai com uma imagem por slide (texto não editável lá: muda-se o HTML e exporta de novo). Feito com python-pptx, que já vem no computador.
- **Fontes:** Anton + Archivo (Google Fonts, rede liberada). Reserva: `.claude/skills/canvas-design/canvas-fonts/`.
- **Ficha de cliente nova:** copiar `estilo/clientes/_modelo-ficha.md`.
- Instalar o pptxgenjs (PowerPoint editável) foi bloqueado pela segurança do ambiente; não insistir sem a pessoa pedir.

## Clientes
- **Keylle Lima** — é **homem**: "o cliente", "ele". Escreve-se K-E-Y-L-L-E. Se a pessoa disser "Keyle", é ele. Ficha em `estilo/clientes/keylle-lima.md`.
