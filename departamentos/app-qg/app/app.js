(function () {
  var Q = window.QG, S = window.SIMBOLOS || {};
  var $ = function (id) { return document.getElementById(id); };
  function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; }
  function sim(nome, cor) { var s = S[nome]; return s && s.svg ? (s.svg[cor || 'creme'] || '') : ''; }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function apagar(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function cyrb53(str, seed) { seed = seed || 0; var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) { ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16); }

  // símbolos fixos da interface
  $('logo-entrada').innerHTML = sim('controle', 'creme');
  $('logo-mini').innerHTML = sim('controle', 'creme');
  Array.prototype.forEach.call(document.querySelectorAll('[data-simbolo]'), function (el) { el.innerHTML = sim(el.getAttribute('data-simbolo'), 'creme'); });

  // ENTRADA
  function rotaInicial() { try { return location.hash.slice(1) || 'mundos'; } catch (e) { return 'mundos'; } }
  function entrar() { $('tela-entrada').hidden = true; $('app').hidden = false; ir(rotaInicial()); }
  if (ler('qg:entrou') === Q.senha) entrar();
  function tentar() {
    if (cyrb53($('senha').value.trim().toLowerCase()) === Q.senha) { gravar('qg:entrou', Q.senha); $('erro-senha').hidden = true; entrar(); }
    else { var er = $('erro-senha'); er.hidden = true; void er.offsetWidth; er.hidden = false; $('senha').select(); }
  }
  $('entrar').onclick = tentar;
  $('senha').addEventListener('keydown', function (e) { if (e.key === 'Enter') tentar(); });
  $('sair').onclick = function () { apagar('qg:entrou'); $('app').hidden = true; $('tela-entrada').hidden = false; $('senha').value = ''; };

  // progresso de um mês, lido do que foi marcado na página do planejamento (mesmo aparelho)
  function progresso(m) {
    var r = { aprovados: 0, postados: 0, recebidos: 0 };
    try { var s = JSON.parse(ler(m.chave) || 'null'); if (s) {
      (s.posts || []).forEach(function (p) { if (p.aprovacao === 'aprovado') r.aprovados++; if (p.status === 'Postado') r.postados++; });
      (s.feitos || []).forEach(function (f) { if (f) r.recebidos++; }); } } catch (e) {}
    return r;
  }
  function xp(n, max) { var h = '<div class="xp">'; for (var i = 0; i < max; i++) h += '<i class="' + (i < n ? 'cheio' : '') + '"></i>'; return h + '<span class="px">NÍVEL ' + n + '/' + max + '</span></div>'; }

  // NAVEGAÇÃO
  function ir(rota) {
    var partes = rota.split('/'), tela = partes[0];
    Array.prototype.forEach.call(document.querySelectorAll('.barra-baixo button'), function (b) { var aba = tela === 'cliente' ? 'clientes' : tela === 'mundo' ? 'mundos' : tela; b.classList.toggle('ativo', b.getAttribute('data-tela') === aba); });
    var c = $('conteudo');
    if (tela === 'mundo') c.innerHTML = telaMundo(partes[1]);
    else if (tela === 'cliente') c.innerHTML = telaCliente(partes[1]);
    else if (tela === 'clientes') c.innerHTML = telaClientes();
    else if (tela === 'sobre') c.innerHTML = telaSobre();
    else c.innerHTML = telaMundos();
    try { if (location.hash.slice(1) !== rota) history.replaceState(null, '', '#' + rota); } catch (e) {}
    window.scrollTo(0, 0); ligar(); desenharMapa();
  }
  window.addEventListener('hashchange', function () { if (!$('app').hidden) ir(rotaInicial()); });
  Array.prototype.forEach.call(document.querySelectorAll('.barra-baixo button'), function (b) { b.onclick = function () { ir(b.getAttribute('data-tela')); }; });

  function ligar() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-ir]'), function (el) { el.onclick = function () { ir(el.getAttribute('data-ir')); }; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-abrir]'), function (el) { el.onclick = function () { abrirEntrega(el.getAttribute('data-abrir'), el.getAttribute('data-titulo')); }; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-copiar]'), function (el) { el.onclick = function () {
      var t = el.getAttribute('data-copiar'); try { navigator.clipboard.writeText(t); el.textContent = 'Copiado ✓'; } catch (e) {} }; });
  }

  // TELAS
  function mesAtual() {
    var melhor = null;
    Q.clientes.forEach(function (c) { var m = c.meses[c.meses.length - 1]; if (m && !melhor) melhor = { c: c, m: m }; });
    return melhor;
  }
  function barra(v, max) { var pct = max ? Math.round(100 * v / max) : 0; return '<div class="barra-xp"><b style="width:' + pct + '%"></b></div>'; }

  function telaMundos() {
    var h = '<h2 class="ola">Olá, player 1</h2>';
    var a = mesAtual();
    if (a) {
      var p = progresso(a.m);
      h += '<section class="save"><div class="save-arte" aria-hidden="true"><span class="grande-ic">' + sim('faisca', 'creme') + '</span><b>' + esc(a.m.nome.split(' ')[0]) + '</b></div><div class="save-corpo">' +
        '<span class="px save-rot">Continuar</span><h3>' + esc(a.c.nome) + '</h3><p>' + esc(a.m.nome) + ' · ' + a.m.posts + ' posts</p>' +
        barra(p.aprovados, a.m.posts) + '<div class="linha-xp px"><span>' + p.aprovados + ' de ' + a.m.posts + ' aprovados</span><span>' + p.recebidos + ' de ' + a.m.pedidos + ' gravações</span></div>' +
        '<button class="botao-jogo" data-abrir="' + esc(a.m.arquivo) + '" data-titulo="' + esc(a.c.nome + ' · ' + a.m.nome) + '">Abrir planejamento ▶</button></div></section>';
    }
    h += '<div class="cabeca-mapa"><h2>Mapa da agência</h2><p>Cada fase é um departamento. Toque para ver o que ela já faz.</p></div>';
    h += '<div class="mapa" id="mapa"><svg class="trilha" id="trilha" aria-hidden="true"></svg>' + Q.mundos.map(function (m, i) {
      var travado = m.status === 'bloqueado';
      var estrelas = ''; for (var k = 0; k < m.max; k++) estrelas += '<i class="' + (k < m.nivel ? 'cheio' : '') + '"></i>';
      return '<button class="fase ' + m.status + '" data-ir="mundo/' + m.id + '" data-i="' + i + '"><span class="fase-bloco">' + sim(m.simbolo, travado ? 'noite' : 'creme') +
        (m.status === 'construindo' ? '<em class="px">obra</em>' : travado ? '<em class="px">em breve</em>' : '') + '</span>' +
        '<span class="fase-nome">' + esc(m.nome) + '</span><span class="estrelas">' + estrelas + '</span></button>';
    }).join('') + '</div>';
    return h;
  }

  // desenha o caminho entre as fases (cobra: esquerda→direita, desce, direita→esquerda)
  function desenharMapa() {
    var mapa = $('mapa'); if (!mapa) return;
    var cols = mapa.clientWidth >= 640 ? 4 : 2, fases = mapa.querySelectorAll('.fase'), linhaAlt = cols === 4 ? 190 : 170;
    var larg = mapa.clientWidth, pontos = [];
    Array.prototype.forEach.call(fases, function (f, i) {
      var lin = Math.floor(i / cols), col = i % cols; if (lin % 2) col = cols - 1 - col;
      var x = (col + 0.5) * larg / cols, y = lin * linhaAlt + 46;
      f.style.left = x + 'px'; f.style.top = (y - 46) + 'px'; pontos.push([x, y]);
    });
    mapa.style.height = (Math.ceil(fases.length / cols) * linhaAlt) + 'px';
    var ultimoPronto = -1; Q.mundos.forEach(function (m, i) { if (m.status === 'pronto' && ultimoPronto === i - 1) ultimoPronto = i; });
    function caminho(ate) { var d = ''; for (var i = 0; i <= ate && i < pontos.length; i++) { var pt = pontos[i];
      if (i === 0) d += 'M' + pt[0] + ' ' + pt[1]; else { var ant = pontos[i - 1]; if (ant[1] !== pt[1]) d += ' L' + ant[0] + ' ' + pt[1]; d += ' L' + pt[0] + ' ' + pt[1]; } } return d; }
    var t = $('trilha'); t.setAttribute('viewBox', '0 0 ' + larg + ' ' + mapa.clientHeight);
    t.innerHTML = '<path d="' + caminho(pontos.length - 1) + '" class="trilha-toda"/><path d="' + caminho(ultimoPronto) + '" class="trilha-feita"/>';
  }
  window.addEventListener('resize', desenharMapa);

  function telaMundo(id) {
    var m = Q.mundos.filter(function (x) { return x.id === id; })[0]; if (!m) return telaMundos();
    var h = '<button class="voltar px" data-ir="mundos">◀ Mapa</button>';
    h += '<div class="cabeca"><span class="fase-bloco grande ' + m.status + '">' + sim(m.simbolo, m.status === 'bloqueado' ? 'noite' : 'creme') + '</span><div><h2>' + esc(m.nome) + '</h2><p>' + esc(m.faz) + '</p></div></div>';
    if (m.ferramentas.length) h += '<div class="painel"><h3>O que já faz</h3><ul class="itens">' + m.ferramentas.map(function (f) { return '<li><span class="ic">' + sim('feito', 'rosa') + '</span>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
    if (m.pedido) h += '<div class="painel"><h3>Como pedir na aba do Claude</h3><div class="pedido-texto">' + esc(m.pedido) + '</div><button class="botao-jogo pequeno" data-copiar="' + esc(m.pedido) + '">Copiar pedido</button></div>';
    if (m.id === 'ideias') h += entregasDeTodos();
    if (m.status === 'bloqueado') h += '<div class="novo">Esta fase ainda não foi liberada. Quando quiser, a gente monta.</div>';
    return h;
  }

  function entregasDeTodos() {
    var h = '<div class="painel"><h3>Planejamentos</h3><ul class="itens">';
    Q.clientes.forEach(function (c) { c.meses.forEach(function (m) { h += '<li class="clicavel" data-abrir="' + esc(m.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + m.nome) + '"><span class="ic">' + sim('play', 'rosa') + '</span>' + esc(c.nome) + ' · ' + esc(m.nome) + '</li>'; }); });
    return h + '</ul></div>';
  }

  function telaClientes() {
    var h = '<div class="cabeca simples"><h2>Clientes</h2><p>Escolha um cliente para ver a ficha e o placar do mês.</p></div><div class="clientes">';
    h += Q.clientes.map(function (c) {
      var m = c.meses[c.meses.length - 1], p = progresso(m);
      return '<button class="cliente" data-ir="cliente/' + c.id + '"><span class="avatar" style="background:' + c.cor + '">' + esc(c.nome[0]) + '</span><div class="cli-info"><h3>' + esc(c.nome) + '</h3><p>' + esc(c.assunto) + '</p>' +
        (m ? barra(p.aprovados, m.posts) + '<div class="linha-xp px"><span>' + esc(m.nome) + '</span><span>' + p.aprovados + '/' + m.posts + ' aprovados</span></div>' : '') + '</div></button>';
    }).join('');
    return h + '</div><p class="novo">Cliente novo? Na aba de Ideias, diga o nome, o assunto e o público. Ele aparece aqui.</p>';
  }

  function telaCliente(id) {
    var c = Q.clientes.filter(function (x) { return x.id === id; })[0]; if (!c) return telaClientes();
    var h = '<button class="voltar px" data-ir="clientes">◀ Clientes</button>';
    h += '<div class="cabeca"><span class="avatar grande" style="background:' + c.cor + '">' + esc(c.nome[0]) + '</span><div><h2>' + esc(c.nome) + '</h2><p>' + esc(c.assunto) + '</p></div></div>';
    h += '<div class="painel"><h3>Ficha</h3><dl class="ficha"><div><dt>Formato</dt><dd>' + esc(c.formato) + '</dd></div><div><dt>Voz das narrações</dt><dd>' + esc(c.voz) + '</dd></div><div><dt>Cor</dt><dd><span class="amostra" style="background:' + c.cor + '"></span>' + esc(c.cor) + '</dd></div></dl></div>';
    c.meses.slice().reverse().forEach(function (m) {
      var p = progresso(m);
      h += '<div class="painel mes"><h3>' + esc(m.nome) + '</h3><div class="mes-numeros">' +
        '<div class="ponto"><b>' + p.aprovados + '<small>/' + m.posts + '</small></b><span>aprovados</span></div>' +
        '<div class="ponto"><b>' + p.postados + '<small>/' + m.posts + '</small></b><span>postados</span></div>' +
        '<div class="ponto"><b>' + p.recebidos + '<small>/' + m.pedidos + '</small></b><span>gravações recebidas</span></div></div>' +
        '<button class="botao-jogo" data-abrir="' + esc(m.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + m.nome) + '">Abrir planejamento ▶</button></div>';
    });
    return h;
  }

  function telaSobre() {
    var s = Q.sobre;
    return '<div class="sobre"><div class="foto">' +
      (s.foto ? '<img src="' + esc(s.foto) + '" alt="Foto de ' + esc(s.nome) + '">' : '<span class="px">sua foto<br>aqui</span>') +
      '</div><div><span class="px rosa">' + esc(s.linha) + '</span><h2>' + esc(s.nome) + '</h2><p>' + esc(s.texto) + '</p></div></div>' +
      '<p class="rodape px">ianmour · versão ' + esc(Q.versao) + '</p>';
  }

  // VISOR
  function abrirEntrega(arq, titulo) {
    $('visor-titulo').textContent = (titulo || '').toUpperCase();
    var fr = $('visor-frame'), pre = 'data:text/html;base64,';
    if (arq.indexOf(pre) === 0) {
      // versão de prévia (arquivo único): a página vem embutida e entra direto, sem link
      var bin = atob(arq.slice(pre.length)), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      fr.removeAttribute('src'); fr.srcdoc = new TextDecoder('utf-8').decode(bytes);
    } else { fr.removeAttribute('srcdoc'); fr.src = arq; }
    $('visor').hidden = false;
  }
  $('fechar-visor').onclick = function () { $('visor').hidden = true; $('visor-frame').removeAttribute('srcdoc'); $('visor-frame').src = 'about:blank'; ir(rotaInicial()); };

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) { navigator.serviceWorker.register('sw.js').catch(function () {}); }
})();
