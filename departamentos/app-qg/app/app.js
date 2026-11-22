(function () {
  var Q = window.QG, S = window.SIMBOLOS || {};
  var $ = function (id) { return document.getElementById(id); };
  var todos = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
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

  $('logo-entrada').innerHTML = sim('controle', 'creme');
  $('logo-mini').innerHTML = sim('controle', 'creme');

  // ENTRADA
  function rotaInicial() { try { return location.hash.slice(1) || 'inicio'; } catch (e) { return 'inicio'; } }
  function entrar() { $('tela-entrada').hidden = true; $('app').hidden = false; montarMenu(); ir(rotaInicial()); }
  if (ler('qg:entrou') === Q.senha) entrar();
  function tentar() {
    if (cyrb53($('senha').value.trim().toLowerCase()) === Q.senha) { gravar('qg:entrou', Q.senha); $('erro-senha').hidden = true; entrar(); }
    else { var er = $('erro-senha'); er.hidden = true; void er.offsetWidth; er.hidden = false; $('senha').select(); }
  }
  $('entrar').onclick = tentar;
  $('senha').addEventListener('keydown', function (e) { if (e.key === 'Enter') tentar(); });
  function sair() { apagar('qg:entrou'); fecharMenu(); $('app').hidden = true; $('tela-entrada').hidden = false; $('senha').value = ''; }

  // progresso de um mês (lido do que foi marcado na página do planejamento, no mesmo aparelho)
  function progresso(m) {
    var r = { aprovados: 0, postados: 0, recebidos: 0 };
    try { var s = JSON.parse(ler(m.chave) || 'null'); if (s) {
      (s.posts || []).forEach(function (p) { if (p.aprovacao === 'aprovado') r.aprovados++; if (p.status === 'Postado') r.postados++; });
      (s.feitos || []).forEach(function (f) { if (f) r.recebidos++; }); } } catch (e) {}
    return r;
  }
  function estrelas(n, max) { var h = '<span class="estrelas" aria-label="Nível ' + n + ' de ' + max + '">'; for (var k = 0; k < max; k++) h += '<i class="' + (k < n ? 'cheio' : '') + '"></i>'; return h + '</span>'; }
  function barra(v, max) { var pct = max ? Math.round(100 * v / max) : 0; return '<div class="barra-xp"><b style="width:' + pct + '%"></b></div>'; }
  function etiqueta(m) { return m.status === 'construindo' ? '<em class="px obra">obra</em>' : m.status === 'bloqueado' ? '<em class="px trava">em breve</em>' : ''; }

  // MENU LATERAL
  function montarMenu() {
    var h = '<button class="item" data-ir="inicio"><span class="item-ic">' + sim('controle', 'creme') + '</span><span>Início</span></button>';
    h += '<div class="grupo px">Departamentos</div>';
    h += Q.mundos.map(function (m) {
      return '<button class="item ' + m.status + '" data-ir="depto/' + m.id + '"><span class="item-ic azul">' + sim(m.simbolo, m.status === 'bloqueado' ? 'noite' : 'creme') + '</span><span>' + esc(m.nome) + '</span>' + etiqueta(m) + '</button>';
    }).join('');
    h += '<div class="grupo px">Clientes</div>';
    h += Q.clientes.map(function (c) {
      return '<button class="item" data-ir="cliente/' + c.id + '"><span class="item-av" style="background:' + c.cor + '">' + esc(c.nome[0]) + '</span><span>' + esc(c.nome) + '</span></button>';
    }).join('');
    h += '<div class="menu-pe"><button class="item" data-ir="sobre"><span class="item-ic">' + sim('faisca', 'rosa') + '</span><span>Sobre mim</span></button>' +
      '<button class="item sair" id="sair"><span class="item-ic">' + sim('seta', 'creme') + '</span><span>Sair</span></button></div>';
    $('menu-itens').innerHTML = h;
    $('sair').onclick = sair;
    todos('#menu-itens [data-ir]', function (b) { b.onclick = function () { ir(b.getAttribute('data-ir')); fecharMenu(); }; });
  }
  function abrirMenu() { document.body.classList.add('menu-aberto'); }
  function fecharMenu() { document.body.classList.remove('menu-aberto'); }
  $('abrir-menu').onclick = abrirMenu; $('fechar-menu').onclick = fecharMenu; $('fundo-menu').onclick = fecharMenu;

  // NAVEGAÇÃO (sem depender do endereço: funciona também dentro de visualizadores)
  var atual = 'inicio';
  function acha(lista, id) { return lista.filter(function (x) { return x.id === id; })[0]; }
  function ir(rota) {
    var partes = rota.split('/'), tela = partes[0], c = $('conteudo'), titulo = '';
    if (tela === 'depto' && acha(Q.mundos, partes[1])) { c.innerHTML = telaDepto(partes[1]); titulo = acha(Q.mundos, partes[1]).nome; }
    else if (tela === 'cliente' && acha(Q.clientes, partes[1])) { c.innerHTML = telaCliente(partes[1]); titulo = acha(Q.clientes, partes[1]).nome; }
    else if (tela === 'sobre') { c.innerHTML = telaSobre(); titulo = 'Sobre mim'; }
    else { rota = 'inicio'; c.innerHTML = telaInicio(); titulo = 'Início'; }
    atual = rota; $('titulo-topo').textContent = titulo;
    todos('#menu-itens [data-ir]', function (b) { b.classList.toggle('ativo', b.getAttribute('data-ir') === rota); });
    try { if (location.hash.slice(1) !== rota) history.replaceState(null, '', '#' + rota); } catch (e) {}
    try { window.scrollTo(0, 0); } catch (e) {}
    ligar();
  }
  window.addEventListener('hashchange', function () { if (!$('app').hidden) { var r = rotaInicial(); if (r !== atual) ir(r); } });

  function ligar() {
    todos('#conteudo [data-ir]', function (el) { el.onclick = function () { ir(el.getAttribute('data-ir')); }; });
    todos('#conteudo [data-abrir]', function (el) { el.onclick = function () { abrirEntrega(el.getAttribute('data-abrir'), el.getAttribute('data-titulo')); }; });
    todos('#conteudo [data-copiar]', function (el) { el.onclick = function () {
      var t = el.getAttribute('data-copiar'); try { navigator.clipboard.writeText(t).then(function () { el.textContent = 'Copiado ✓'; }); } catch (e) {} }; });
  }

  // TELAS
  function telaInicio() {
    var h = '<h2 class="ola">Olá, player 1</h2>';
    var c = Q.clientes[0], m = c && c.meses[c.meses.length - 1];
    if (m) {
      var p = progresso(m);
      h += '<section class="save"><div class="save-arte" aria-hidden="true"><span class="grande-ic">' + sim('faisca', 'creme') + '</span><b>' + esc(m.nome.split(' ')[0]) + '</b></div><div class="save-corpo">' +
        '<span class="px save-rot">Continuar</span><h3>' + esc(c.nome) + '</h3><p>' + esc(m.nome) + ' · ' + m.posts + ' posts</p>' +
        barra(p.aprovados, m.posts) + '<div class="linha-xp px"><span>' + p.aprovados + ' de ' + m.posts + ' aprovados</span><span>' + p.recebidos + ' de ' + m.pedidos + ' gravações</span></div>' +
        '<button class="botao-jogo" data-abrir="' + esc(m.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + m.nome) + '">Abrir planejamento ▶</button></div></section>';
    }
    h += '<h2 class="sub-titulo">Departamentos</h2><div class="deptos">' + Q.mundos.map(function (d) {
      return '<button class="depto ' + d.status + '" data-ir="depto/' + d.id + '"><span class="depto-ic">' + sim(d.simbolo, d.status === 'bloqueado' ? 'noite' : 'creme') + '</span>' +
        '<span class="depto-txt"><b>' + esc(d.nome) + '</b>' + estrelas(d.nivel, d.max) + '</span>' + etiqueta(d) + '</button>';
    }).join('') + '</div>';
    return h;
  }

  function telaDepto(id) {
    var m = acha(Q.mundos, id);
    var h = '<div class="cabeca"><span class="depto-ic grande ' + m.status + '">' + sim(m.simbolo, m.status === 'bloqueado' ? 'noite' : 'creme') + '</span><div><h2>' + esc(m.nome) + '</h2>' + estrelas(m.nivel, m.max) + '<p>' + esc(m.faz) + '</p></div></div>';
    if (m.claude) h += '<a class="falar" href="' + esc(m.claude) + '" target="_blank" rel="noopener"><span class="falar-ic">' + sim('fala', 'creme') + '</span><span class="falar-txt"><b>Falar com o Claude</b><small>Abre a conversa deste departamento</small></span><span class="seta-falar">▶</span></a>';
    if (m.pedido) h += '<div class="painel"><h3>Pedido pronto para colar</h3><div class="pedido-texto">' + esc(m.pedido) + '</div><button class="botao-jogo pequeno" data-copiar="' + esc(m.pedido) + '">Copiar pedido</button></div>';
    if (m.ferramentas.length) h += '<div class="painel"><h3>O que já faz</h3><ul class="itens">' + m.ferramentas.map(function (f) { return '<li><span class="ic">' + sim('feito', 'rosa') + '</span>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
    if (m.id === 'ideias') {
      h += '<div class="painel"><h3>Planejamentos</h3><ul class="itens">';
      Q.clientes.forEach(function (c) { c.meses.forEach(function (mm) { h += '<li class="clicavel" data-abrir="' + esc(mm.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + mm.nome) + '"><span class="ic">' + sim('play', 'rosa') + '</span>' + esc(c.nome) + ' · ' + esc(mm.nome) + '</li>'; }); });
      h += '</ul></div>';
    }
    if (m.status === 'bloqueado') h += '<div class="novo">Este departamento ainda não foi liberado. Quando quiser, a gente monta.</div>';
    return h;
  }

  function telaCliente(id) {
    var c = acha(Q.clientes, id);
    var h = '<div class="cabeca"><span class="avatar grande" style="background:' + c.cor + '">' + esc(c.nome[0]) + '</span><div><h2>' + esc(c.nome) + '</h2><p>' + esc(c.assunto) + '</p></div></div>';
    c.meses.slice().reverse().forEach(function (m) {
      var p = progresso(m);
      h += '<div class="painel mes"><h3>' + esc(m.nome) + '</h3><div class="mes-numeros">' +
        '<div class="ponto"><b>' + p.aprovados + '<small>/' + m.posts + '</small></b><span>aprovados</span></div>' +
        '<div class="ponto"><b>' + p.postados + '<small>/' + m.posts + '</small></b><span>postados</span></div>' +
        '<div class="ponto"><b>' + p.recebidos + '<small>/' + m.pedidos + '</small></b><span>gravações recebidas</span></div></div>' +
        '<button class="botao-jogo" data-abrir="' + esc(m.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + m.nome) + '">Abrir planejamento ▶</button></div>';
    });
    h += '<div class="painel"><h3>Ficha</h3><dl class="ficha"><div><dt>Formato</dt><dd>' + esc(c.formato) + '</dd></div><div><dt>Voz das narrações</dt><dd>' + esc(c.voz) + '</dd></div><div><dt>Cor</dt><dd><span class="amostra" style="background:' + c.cor + '"></span>' + esc(c.cor) + '</dd></div></dl></div>';
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
      var bin = atob(arq.slice(pre.length)), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      fr.removeAttribute('src'); fr.srcdoc = new TextDecoder('utf-8').decode(bytes);
    } else { fr.removeAttribute('srcdoc'); fr.src = arq; }
    $('visor').hidden = false;
  }
  $('fechar-visor').onclick = function () { $('visor').hidden = true; $('visor-frame').removeAttribute('srcdoc'); $('visor-frame').src = 'about:blank'; ir(atual); };

  try { if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(function () {}); } catch (e) {}
})();
