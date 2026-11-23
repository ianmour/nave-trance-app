# Agência ianmour — departamentos

Cada departamento é uma aba (conversa) separada do Claude Code, com as suas próprias ferramentas.

| Aba | Pasta | Situação |
|---|---|---|
| Edição de vídeo | (raiz: `originais/`, `previas/`, `final/`) | pronta |
| Roteiros | `roteiros/` | pronta |
| Design | `departamentos/design/` | pronta (skills frontend-design, canvas-design e theme-factory; exportação HTML → PNG; fontes do Google liberadas) |
| Ideias e planejamento mensal | `departamentos/ideias-e-planejamento/` | pronta (notícias, Google Trends, YouTube, modelo de calendário) |
| App da agência (QG) | `departamentos/app-qg/` | base 0.1 pronta (falta publicar no link) |
| Propostas e apresentações | `departamentos/propostas-e-apresentacoes/` | pronta |

Regras de todas as abas: as do `CLAUDE.md` da raiz (português simples, pedir autorização antes de instalar, só fontes oficiais, nunca mexer nos originais, testar antes de dizer que funciona).
Cada aba pode instalar ferramentas próprias, sempre mostrando a lista e esperando o ok da pessoa. Tudo o que precisar sobreviver entre sessões tem que ficar dentro do repositório (ou no script do ambiente), porque cada aba roda num computador temporário.

## O jeito que a pessoa gosta de trabalhar (vale para TODAS as abas — ler antes de começar)
Aprendido no trabalho real (adesivo da Equipe Charlie, 19–20/11/2026). Cada aba acrescenta aqui o que aprender e que sirva para as outras.

1. **Agir como profissional da área.** Receber o pedido, decidir e entregar pronto, com 1 linha de motivo por escolha. Não devolver listas de opções para ela decidir cada detalhe.
2. **Poucas perguntas.** Só perguntar o que não dá para decidir sozinho (ex.: a lista de nomes, para quem é a peça).
3. **Quando ela aprovar uma versão, ela vira a base.** Ajustes depois são pequenos, uma coisa por vez, em cima dela. Nunca refazer tudo, trocar cores, letras ou ideia sem ela pedir.
4. **Fazer exatamente o que foi pedido.** Se ela diz "o EQUIPE mais para a direita", mexer só no EQUIPE. Na dúvida sobre QUAL elemento, perguntar em uma frase antes de mexer.
5. **Material do cliente vem primeiro.** Logo, cores e fotos do cliente valem mais do que qualquer coisa que a gente invente. Se o material for ruim, pedir o original antes de redesenhar.
6. **Conversa direta e de igual para igual.** Frases curtas, sem explicação longa, sem tratar como iniciante.
7. **Conferir antes de entregar** (olhar o resultado, nomes, acentos) e entregar cada arquivo separado quando for para baixar.

## App da agência (ideia aprovada em 22/11/2026, ainda não começado)
- Um app próprio no **estilo game da marca ianmour** (ver `departamentos/design/marca-ianmour/LEIA-ME.md`): cada departamento vira um "mundo"/"fase"; lista de clientes com ficha, mês atual, status dos posts (placar/XP) e pedidos; as entregas (ex.: página do planejamento) abrem dentro dele; "Sobre mim" com a foto só no final, não como cara do app; instalável no celular.
- **Decisão da pessoa:** o "cérebro" continua sendo o Claude nas abas. O app só organiza, mostra e guarda; tudo que ela fizer lá, o Claude lê e ajusta. Sem ligar o app a serviços pagos.
- Começar uma base simples e ir melhorando conforme cada departamento amadurece, numa aba própria ("QG").
- **Instalação:** primeiro como app de Tela de Início (iPhone/iPad pelo Safari, Android pelo Chrome), hospedado num link grátis, com **senha simples na entrada** (pedido da pessoa).
- **Futuro (não agora):** a pessoa quer publicar na **App Store e na Play Store**. Por isso, construir o app desde o início de um jeito que dê para "empacotar" depois para as lojas, sem refazer. As contas de desenvolvedor são pagas; só tratar disso quando ela decidir.

