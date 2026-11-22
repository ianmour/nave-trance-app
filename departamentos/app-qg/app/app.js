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
  function entrar() { $('tela-entrada').hidden = true; $('app').hidden = false; ir(location.hash.slice(1) || 'mundos'); }
  if (ler('qg:entrou') === Q.senha) entrar();
  $('form-senha').onsubmit = function (e) {
    e.preventDefault();
    if (cyrb53($('senha').value.trim().toLowerCase()) === Q.senha) { gravar('qg:entrou', Q.senha); $('erro-senha').hidden = true; entrar(); }
    else { var er = $('erro-senha'); er.hidden = true; void er.offsetWidth; er.hidden = false; $('senha').select(); }
  };
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
    Array.prototype.forEach.call(document.querySelectorAll('.barra-baixo button'), function (b) { b.classList.toggle('ativo', b.getAttribute('data-tela') === tela); });
    var c = $('conteudo');
    if (tela === 'mundo') c.innerHTML = telaMundo(partes[1]);
    else if (tela === 'cliente') c.innerHTML = telaCliente(partes[1]);
    else if (tela === 'clientes') c.innerHTML = telaClientes();
    else if (tela === 'sobre') c.innerHTML = telaSobre();
    else c.innerHTML = telaMundos();
    if (location.hash.slice(1) !== rota) history.replaceState(null, '', '#' + rota);
    window.scrollTo(0, 0); ligar();
  }
  window.addEventListener('hashchange', function () { if (!$('app').hidden) ir(location.hash.slice(1) || 'mundos'); });
  Array.prototype.forEach.call(document.querySelectorAll('.barra-baixo button'), function (b) { b.onclick = function () { ir(b.getAttribute('data-tela')); }; });

  function ligar() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-ir]'), function (el) { el.onclick = function () { location.hash = el.getAttribute('data-ir'); }; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-abrir]'), function (el) { el.onclick = function () { abrirEntrega(el.getAttribute('data-abrir'), el.getAttribute('data-titulo')); }; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-copiar]'), function (el) { el.onclick = function () {
      var t = el.getAttribute('data-copiar'); try { navigator.clipboard.writeText(t); el.textContent = 'COPIADO ✓'; } catch (e) {} }; });
  }

  // TELAS
  function telaMundos() {
    var posts = 0, aprov = 0;
    Q.clientes.forEach(function (c) { var m = c.meses[c.meses.length - 1]; if (m) { posts += m.posts; aprov += progresso(m).aprovados; } });
    var h = '<div class="cabeca"><div class="px">SELECIONE O MUNDO</div><h2>Seu QG</h2><p>Cada mundo é um departamento da agência. O trabalho acontece nas abas do Claude; aqui fica tudo organizado.</p></div>';
    h += '<div class="placar"><div class="ponto"><b>' + Q.clientes.length + '</b><span class="px">CLIENTES</span></div><div class="ponto"><b>' + posts + '</b><span class="px">POSTS NO MÊS</span></div><div class="ponto"><b>' + aprov + '</b><span class="px">APROVADOS</span></div></div>';
    h += '<div class="mundos">' + Q.mundos.map(function (m, i) {
      var et = m.status === 'pronto' ? '<span class="etiqueta px">PRONTO</span>' : m.status === 'construindo' ? '<span class="etiqueta construindo px">EM CONSTRUÇÃO</span>' : '<span class="etiqueta bloqueado px">EM BREVE</span>';
      return '<button class="mundo ' + (m.status === 'bloqueado' ? 'bloqueado' : '') + '" data-ir="mundo/' + m.id + '"><span class="num px">MUNDO ' + (i + 1) + '</span><span class="ic">' + sim(m.simbolo, 'creme') + '</span><h3>' + esc(m.nome) + '</h3>' + et + xp(m.nivel, m.max) + '</button>';
    }).join('') + '</div>';
    return h;
  }

  function telaMundo(id) {
    var m = Q.mundos.filter(function (x) { return x.id === id; })[0]; if (!m) return telaMundos();
    var h = '<button class="voltar px" data-ir="mundos">◀ MUNDOS</button>';
    h += '<div class="cabeca"><div class="px">MUNDO ' + (Q.mundos.indexOf(m) + 1) + '</div><h2>' + esc(m.nome) + '</h2><p>' + esc(m.faz) + '</p></div>';
    h += '<div class="painel"><h3>Nível</h3>' + xp(m.nivel, m.max) + '</div>';
    if (m.ferramentas.length) h += '<div class="painel"><h3>O que já faz</h3><ul class="itens">' + m.ferramentas.map(function (f) { return '<li><span class="ic">' + sim('feito', 'rosa') + '</span>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
    if (m.pedido) h += '<div class="painel"><h3>Como pedir na aba do Claude</h3><div class="pedido-texto">' + esc(m.pedido) + '</div><button class="botao-jogo pequeno" data-copiar="' + esc(m.pedido) + '">COPIAR PEDIDO</button></div>';
    if (m.id === 'ideias') h += entregasDeTodos();
    if (m.status === 'bloqueado') h += '<div class="novo">Este mundo ainda não foi desbloqueado. Quando você quiser, a gente monta.</div>';
    return h;
  }

  function entregasDeTodos() {
    var h = '<div class="painel"><h3>Planejamentos</h3><ul class="itens">';
    Q.clientes.forEach(function (c) { c.meses.forEach(function (m) { h += '<li style="cursor:pointer" data-abrir="' + esc(m.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + m.nome) + '"><span class="ic">' + sim('play', 'rosa') + '</span>' + esc(c.nome) + ' · ' + esc(m.nome) + '</li>'; }); });
    return h + '</ul></div>';
  }

  function telaClientes() {
    var h = '<div class="cabeca"><div class="px">ESCOLHA SEU PLAYER</div><h2>Clientes</h2><p>Cada cliente com a ficha, o mês atual e o placar dos posts.</p></div><div class="clientes">';
    h += Q.clientes.map(function (c) {
      var m = c.meses[c.meses.length - 1], p = progresso(m), pct = m ? Math.round(100 * p.aprovados / m.posts) : 0;
      return '<button class="cliente" data-ir="cliente/' + c.id + '"><div class="topo-cli"><span class="avatar" style="background:' + c.cor + '">' + esc(c.nome[0]) + '</span><div><h3>' + esc(c.nome) + '</h3><p>' + esc(c.assunto) + '</p></div></div>' +
        (m ? '<div class="linha-xp px"><span>' + esc(m.nome.toUpperCase()) + '</span><span>' + p.aprovados + '/' + m.posts + ' APROVADOS</span></div><div class="barra-xp"><b style="width:' + pct + '%"></b></div>' : '') + '</button>';
    }).join('');
    return h + '</div><p class="novo" style="margin-top:16px">Cliente novo? Peça na aba de Ideias: "cliente novo: nome, assunto e público". Ele aparece aqui.</p>';
  }

  function telaCliente(id) {
    var c = Q.clientes.filter(function (x) { return x.id === id; })[0]; if (!c) return telaClientes();
    var h = '<button class="voltar px" data-ir="clientes">◀ CLIENTES</button>';
    h += '<div class="cabeca"><div class="px">PLAYER</div><h2>' + esc(c.nome) + '</h2><p>' + esc(c.assunto) + '</p></div>';
    h += '<div class="painel"><h3>Ficha</h3><dl class="ficha"><div><dt>ASSUNTO</dt><dd>' + esc(c.assunto) + '</dd></div><div><dt>FORMATO</dt><dd>' + esc(c.formato) + '</dd></div><div><dt>VOZ</dt><dd>' + esc(c.voz) + '</dd></div><div><dt>COR</dt><dd><span style="display:inline-block;width:14px;height:14px;background:' + c.cor + ';vertical-align:-2px;margin-right:6px"></span>' + esc(c.cor) + '</dd></div></dl></div>';
    c.meses.slice().reverse().forEach(function (m) {
      var p = progresso(m);
      h += '<div class="painel mes"><h3>' + esc(m.nome) + '</h3><div class="mes-numeros">' +
        '<div class="ponto"><b>' + m.posts + '</b><span class="px">POSTS</span></div>' +
        '<div class="ponto"><b>' + p.aprovados + '</b><span class="px">APROVADOS</span></div>' +
        '<div class="ponto"><b>' + p.postados + '</b><span class="px">POSTADOS</span></div>' +
        '<div class="ponto"><b>' + p.recebidos + '/' + m.pedidos + '</b><span class="px">GRAVAÇÕES</span></div></div>' +
        '<button class="botao-jogo" data-abrir="' + esc(m.arquivo) + '" data-titulo="' + esc(c.nome + ' · ' + m.nome) + '">ABRIR PLANEJAMENTO ▶</button></div>';
    });
    return h;
  }

  function telaSobre() {
    var s = Q.sobre;
    return '<div class="cabeca"><div class="px">CRÉDITOS</div></div><div class="sobre"><div class="foto">' +
      (s.foto ? '<img src="' + esc(s.foto) + '" alt="Foto de ' + esc(s.nome) + '">' : '<span class="px">SUA FOTO<br>AQUI</span>') +
      '</div><div><div class="px">' + esc(s.linha) + '</div><h2>' + esc(s.nome) + '</h2><p>' + esc(s.texto) + '</p></div></div>' +
      '<p class="rodape px">QG IANMOUR · VERSÃO ' + esc(Q.versao) + '</p>';
  }

  // VISOR
  function abrirEntrega(arq, titulo) { $('visor-titulo').textContent = (titulo || '').toUpperCase(); $('visor-frame').src = arq; $('visor').hidden = false; }
  $('fechar-visor').onclick = function () { $('visor').hidden = true; $('visor-frame').src = 'about:blank'; ir(location.hash.slice(1) || 'mundos'); };

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) { navigator.serviceWorker.register('sw.js').catch(function () {}); }
})();
