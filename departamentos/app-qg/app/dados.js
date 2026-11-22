// Dados do QG. O Claude atualiza este arquivo quando um departamento ou cliente muda.
window.QG = {
  versao: "0.1 (base)",
  // Senha simples da entrada (guardada embaralhada). Para trocar, peça ao Claude.
  senha: "1962ed32eb6e6a",

  mundos: [
    { id: "ideias", nome: "Ideias e planejamento", simbolo: "faisca", nivel: 3, max: 3, status: "pronto",
      faz: "Pesquisa o que aconteceu nos últimos 30 dias sobre o assunto do cliente e transforma em ideias de conteúdo e calendário do mês.",
      ferramentas: ["Notícias do mês", "Buscas em alta (Google Trends)", "Mais vistos do YouTube", "Calendário interativo", "Legendas, objetivo e chamada", "Aprovação do cliente pelo WhatsApp", "Pedidos de gravação"],
      pedido: "Cliente X, assunto Y: quero o planejamento de <mês>." },
    { id: "roteiros", nome: "Roteiros", simbolo: "fala", nivel: 2, max: 3, status: "pronto",
      faz: "Escreve o roteiro de cada vídeo: gancho, fala e chamada, no estilo de conexão.",
      ferramentas: ["Roteiros por post", "Texto para gravar"], pedido: "Escreva o roteiro do post do dia <dia> do <cliente>." },
    { id: "design", nome: "Design", simbolo: "olho", nivel: 2, max: 3, status: "pronto",
      faz: "Cria carrosséis, capas, peças e a identidade de cada cliente.",
      ferramentas: ["Carrosséis e capas", "Marca ianmour (pixel)", "Exportação em imagem"], pedido: "Faça o carrossel do dia <dia> do <cliente>." },
    { id: "video", nome: "Edição de vídeo", simbolo: "play", nivel: 3, max: 3, status: "pronto",
      faz: "Corta pausas, coloca legenda, animação e efeitos sonoros, e entrega o vídeo pronto.",
      ferramentas: ["Cortes automáticos", "Legenda e animação", "Efeitos sonoros", "Narração com voz"], pedido: "Edite o vídeo <arquivo> do <cliente>." },
    { id: "propostas", nome: "Propostas e apresentações", simbolo: "mira", nivel: 1, max: 3, status: "pronto",
      faz: "Monta propostas comerciais e apresentações para vender os serviços da agência.",
      ferramentas: ["Propostas", "Apresentações"], pedido: "Monte uma proposta para <cliente>." },
    { id: "trafego", nome: "Tráfego", simbolo: "raio", nivel: 0, max: 3, status: "bloqueado",
      faz: "Estratégia de anúncios, textos e leitura dos resultados que você exportar do Gerenciador de Anúncios.",
      ferramentas: [], pedido: "" },
    { id: "qg", nome: "App da agência", simbolo: "controle", nivel: 1, max: 3, status: "construindo",
      faz: "Este app: organiza mundos, clientes e entregas. O cérebro continua sendo o Claude nas abas.",
      ferramentas: ["Senha na entrada", "Mundos", "Clientes", "Entregas dentro do app", "Instalável no celular"], pedido: "" }
  ],

  clientes: [
    { id: "keylle-lima", nome: "Keylle Lima", cor: "#1E4FA3",
      assunto: "Liderança e gestão de pessoas para pequenos negócios",
      formato: "Educativo, com abertura de conexão", voz: "Onyx (grave)",
      meses: [
        { nome: "Dezembro 2026", arquivo: "entregas/keylle-lima-2026-12.html",
          chave: "planejamento:Keylle Lima-2026-12", posts: 16, pedidos: 13 }
      ] }
  ],

  sobre: {
    nome: "Ian Moura",
    linha: "PLAYER 1 · drone · vídeo · design",
    texto: "Bem-vindo ao meu mundo: o real virando jogo. Conteúdo, vídeo e estratégia para marcas que querem ser lembradas.",
    foto: "" // ex.: "foto.jpg" (colocar o arquivo na pasta do app)
  }
};
