#!/usr/bin/env node
// Legendas e grafismos dos 5 cortes de podcast do Virgílio — cada corte num estilo.
// Uso: node gerar-cortes-virgilio.mjs <n> <projeto> <transcricao whisper do corte (json)>
import fs from "node:fs";
import path from "node:path";

const [N, P, TJ] = process.argv.slice(2);
const W = 1080, H = 1920, LJ = "#FF8A00";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9%]/g, "");

// texto certo de cada corte (o whisper erra nomes e números); os tempos vêm do whisper por alinhamento
const TEXTO = {
  1: "E quem vai pagar por isso? A gente vai aumentar o preço para que você pague por isso? Quem é que vai pagar por isso? E o mais sensível de tudo é a escala 5x2. Eu sou a favor que o trabalhador tenha o seu descanso. Mas como é que paga esse descanso? Como é que a gente consegue ter um restaurante amanhã que vai precisar contratar, vai cobrar o mesmo valor naquele prato, vai cobrar o mesmo valor pelo serviço, mas em contrapartida ele tem que contratar mais duas ou três pessoas? Mas a gente sabe quem vai pagar a conta. A conta não fecha, a conta não fecha.",
  2: "A gente dormiu setembro, ali no final de setembro, início de outubro, com o dólar a cinco, e hoje ele está beirando os seis. Então a gente fica de cabelo em pé. A gente fabrica a espuma, fabrica o colchão, fabrica a mola, fabrica o box. E 60% do material que uma fábrica de colchão manuseia é espuma. 60%! E todos os produtos químicos para fabricar a espuma são dolarizados. Preocupado não só com o meu negócio, preocupado com o negócio de todo mundo, porque isso vai impactar no medicamento, vai impactar no preço do combustível, vai impactar no pãozinho. Então os impactos são muito severos, eu diria, para a economia agora e mais preocupantes no próximo ano.",
  3: "Eu nunca passei tanto tempo na planilha do Excel, mais uma vez, como eu estou passando esse final de ano, porque a gente já está planejando como é que vai ser no ano que vem. A minha empresa cresceu esse ano, graças a Deus, a gente teve um crescimento significativo, como a gente tem tido nos últimos 17 anos. A nossa vai completar 18 anos agora no próximo ano, mas eu nunca vivi um momento tão desafiador como agora. Mas a gente tem que focar no malabarismo, focar na conta. A gente não pode sair do negócio para fazer a venda enganada, achando que dá para comercializar por X quando não pode ser por X. Toda empresa precisa ser rentável. Então tem que fazer muita conta. E depois de fazer a conta, se animar, ser bem motivado pelos desafios. A gente que se motiva pelos desafios... então desafio esse ano agora não vai faltar.",
  4: "O número de restaurantes que tem lá não vai atender. Daqui no segundo semestre, nós vamos inaugurar o complexo administrativo. São 1.500 pessoas que vão todos os dias ao centro da cidade. Vai transformar aquele lugar, que vai pulsar ainda mais o desenvolvimento econômico. O centro é a grande locomotiva do desenvolvimento econômico de Maceió. A gente já sabe que, com o fluxo que o centro de Maceió vai ter com a chegada do complexo administrativo, o número de restaurantes que tem lá não vai atender. Não vai. Eu estou falando de uma oportunidade, né? Tem que entender que vão surgir muitas oportunidades com essa nova fotografia que vai ter o centro da cidade.",
  5: "Quando penso: secretário, empreendedor e o pai de família... Eu tenho três filhos, e aí eles cobram pra caramba a presença. Qual a hora que eles estão vendo o pai chegar em casa? Acho que às vezes nem veem. Enfim, eu tento buscar ali no final de semana, fazer uma compensação. Eu estou abrindo uma fábrica lá em Natal, e quando eu falo: “pô, vamo lá comigo conhecer a fábrica”, aí um vai comigo, outra vez o outro vai também. Busco até no trabalho puxar a companhia deles, que é muito importante, estar perto, né? Mas no final de semana tá sempre junto e misturado. No final de semana a gente dá aquela blindada ali pra poder estar junto e descansar um pouco também, né?",
}[N];
const wsp = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription.map((x) => ({ t: x.text.trim(), a: x.offsets.from / 1000, b: x.offsets.to / 1000 })).filter((x) => nrm(x.t));
const DUR = +(+fs.readFileSync(path.join(P, "assets/dur.txt"), "utf8")).toFixed(3);
const txt = TEXTO.split(/\s+/), A = txt.map(nrm), B = wsp.map((x) => nrm(x.t)), n = A.length, m = B.length;
const D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
const tm = new Array(n).fill(null);
for (let i = n, j = m; i > 0 && j > 0;) { const c = A[i - 1] === B[j - 1] ? 0 : 1; if (D[i][j] === D[i - 1][j - 1] + c) { tm[i - 1] = [wsp[j - 1].a, wsp[j - 1].b]; i--; j--; } else if (D[i][j] === D[i - 1][j] + 1) i--; else j--; }
for (let i = 0; i < n; i++) if (!tm[i]) { const an = tm.slice(0, i).reverse().find(Boolean), po = tm.slice(i + 1).find(Boolean); const x = an && po ? (an[1] + po[0]) / 2 : an ? an[1] : po[0]; tm[i] = [x, x + 0.12]; }
const PAL = txt.map((w, i) => ({ texto: w, ini: tm[i][0], fim: Math.min(DUR, Math.max(tm[i][1], tm[i][0] + 0.1)) }));
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };
const limpa = (s) => s.replace(/[.,?!:;…“”"]+$/g, "").replace(/^[“"]/, "");

// ---- utilidades de cena ----
const els = [], js = [], sons = [], cam = [`tl.set("#camera", { scale: 1, x: 0, y: 0 }, 0);`];
const el = (id, t0, t1, html, estilo) => els.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(Math.max(0.1, t1 - t0))}" data-track-index="0" style="${estilo}" data-layout-allow-overlap data-layout-allow-occlusion>${html}</div>`);
const tw = (s) => js.push("      " + s);
const som = (nome, t, v) => sons.push([nome, Math.max(0, t), v]);
const pop = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, ${f(t)});`);
const sai = (s, t) => tw(`tl.to("${s}", { opacity: 0, duration: 0.2 }, ${f(t)});`);
const zoom = (t, de = 1.12, para = 1) => cam.push(`tl.fromTo("#camera", { scale: ${de} }, { scale: ${para}, duration: 0.35, ease: "power3.out", immediateRender: false }, ${f(t)});`);
const zseco = (t, s) => cam.push(`tl.set("#camera", { scale: ${s} }, ${f(t)});`);
const grupos = (max, quebraPausa = 0.3) => { const g = []; let c = []; PAL.forEach((p, i) => { const q = PAL[i + 1]; c.push(p); if (!q || /[.,!?;:…]$/.test(p.texto) || q.ini - p.fim >= quebraPausa || c.length >= max) { g.push(c); c = []; } }); return g; };
let CSS = "", leg = "", legjs = "", origem = "50% 40%";

// ===== estilos por corte =====
if (N === "1") {
  // TELA DIVIDIDA (cima: Júnior falando; baixo: Virgílio reagindo) + legenda da referência: maiúscula condensada branca,
  // palavra-chave em LARANJA, na linha da divisão. Objetivo: debate nos comentários.
  const CH = new Set(["pagar", "preco", "5x2", "descanso", "restaurante", "contratar", "conta", "fecha", "prato", "pessoas", "sensivel"]);
  grupos(3, 0.25).forEach((g, i, all) => {
    const a = Math.max(0, g[0].ini - 0.03), b = Math.min(all[i + 1] ? all[i + 1][0].ini - 0.02 : DUR, g.at(-1).fim + 0.3);
    leg += `      <div id="g${i}" class="clip gp" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><span class="tx">${g.map((p) => `<b class="${CH.has(nrm(p.texto)) ? "lj" : ""}">${esc(limpa(p.texto))}</b>`).join(" ")}</span></div>\n`;
    legjs += `      tl.fromTo("#g${i} .tx", { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: "back.out(2)" }, ${f(a)});\n`;
  });
  CSS = `.gp { position: absolute; left: 60px; right: 60px; top: 905px; text-align: center; }
    .tx { display: inline-block; font-family: "Anton"; font-size: 84px; line-height: 1; text-transform: uppercase; color: #fff; letter-spacing: 0.01em; -webkit-text-stroke: 9px #000; paint-order: stroke fill; text-shadow: 0 6px 18px rgba(0,0,0,0.5); }
    .tx b { font-weight: 400; } .tx b.lj { color: ${LJ}; }`;
  // gancho: pergunta no topo nos 3 primeiros segundos
  el("hook", 0.1, Math.min(4.2, T("E o mais") - 0.1), `<div class="hk">QUEM PAGA A CONTA<br>DA <span>ESCALA 5X2</span>?</div>`, "left:0;width:1080px;top:110px;text-align:center");
  pop("#hook .hk", 0.1); sai("#hook .hk", Math.min(4.2, T("E o mais") - 0.1) - 0.2);
  CSS += `\n    .hk { display: inline-block; padding: 18px 34px; border-radius: 18px; background: rgba(0,0,0,0.78); font-family: "Anton"; font-size: 70px; line-height: 1.05; color: #fff; } .hk span { color: ${LJ}; }`;
  som("whoosh", 0.05, 0.05); som("impact-bass-1", T("conta não fecha"), 0.05);
} else if (N === "2") {
  // CLOSE NO ROSTO + legenda UMA PALAVRA POR VEZ (estilo da ref 02) + socos de zoom + números/ícones. Objetivo: identificação/compartilhar.
  PAL.forEach((p, i) => {
    const a = p.ini - 0.02, b = Math.min(PAL[i + 1] ? PAL[i + 1].ini - 0.02 : DUR, p.fim + 0.35);
    leg += `      <div id="w${i}" class="clip gp" data-start="${f(a)}" data-duration="${f(Math.max(0.08, b - a))}" data-track-index="0"><span class="tx">${esc(limpa(p.texto))}</span></div>\n`;
    legjs += `      tl.fromTo("#w${i} .tx", { scale: 1.25 }, { scale: 1, duration: 0.1, ease: "power2.out" }, ${f(a)});\n`;
  });
  CSS = `.gp { position: absolute; left: 40px; right: 40px; top: 1360px; text-align: center; }
    .tx { display: inline-block; font-family: "Montserrat"; font-weight: 900; font-size: 92px; text-transform: uppercase; color: #fff; -webkit-text-stroke: 10px #000; paint-order: stroke fill; text-shadow: 0 6px 16px rgba(0,0,0,0.45); }`;
  const card = (id, t0, t1, html, top = 150) => { el(id, t0, t1, html, `left:0;width:1080px;top:${top}px;text-align:center`); pop(`#${id} > *`, t0); sai(`#${id} > *`, t1 - 0.2); som("pop", t0, 0.06); };
  card("hk", 0.1, T("Então a gente fica") - 0.1, `<div class="ttl">O DÓLAR A <span>R$6</span><br>CHEGA NO SEU PÃOZINHO</div>`, 120);
  card("usd", T("cinco") - 0.05, T("fica de cabelo") - 0.05, `<div class="usd">US$ 1 = <s>R$5</s> <span id="seis">R$6</span></div>`, 330);
  tw(`tl.fromTo("#seis", { scale: 0, rotation: -15 }, { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(3)" }, ${f(T("seis") - 0.05)});`); som("impact-bass-1", T("seis"), 0.06);
  card("pct", T("60%") - 0.05, T("E todos") - 0.1, `<div class="usd"><span>60%</span> É ESPUMA</div>`, 330);
  const itens = [["medicamento", "REMÉDIO"], ["combustível", "COMBUSTÍVEL"], ["pãozinho", "PÃOZINHO"]];
  el("lista", T("medicamento") - 0.05, T("Então os impactos") - 0.05, `<div class="lst">${itens.map(([, t], i) => `<div id="it${i}" class="it">${t} <span>↑</span></div>`).join("")}</div>`, "left:0;width:1080px;top:300px;text-align:center");
  itens.forEach(([w], i) => { pop(`#it${i}`, T(w) - 0.05); som("pop", T(w) - 0.05, 0.06); zoom(T(w) - 0.05, 1.1); });
  sai("#lista .lst", T("Então os impactos") - 0.25);
  CSS += `\n    .ttl { display: inline-block; padding: 16px 30px; border-radius: 16px; background: #fff; color: #111; font-family: "Montserrat"; font-weight: 900; font-size: 60px; line-height: 1.1; } .ttl span { color: #1a9e4b; }
    .usd { display: inline-block; padding: 14px 32px; border-radius: 999px; background: rgba(0,0,0,0.78); color: #fff; font-family: "Montserrat"; font-weight: 900; font-size: 64px; } .usd s { opacity: 0.6; } .usd span { color: #3ddc84; display: inline-block; }
    .lst { display: inline-flex; flex-direction: column; gap: 14px; align-items: center; } .it { padding: 12px 30px; border-radius: 999px; background: rgba(0,0,0,0.78); color: #fff; font-family: "Montserrat"; font-weight: 900; font-size: 58px; } .it span { color: #ff4d4d; }`;
  // socos de zoom nas frases fortes + alternância
  [T("dólar"), T("cabelo"), T("60%"), T("preocupado"), T("severos")].forEach((t) => zoom(t - 0.05, 1.12));
} else if (N === "3") {
  // MANCHETE FIXA no topo + vídeo 4:5 + legenda karaokê (palavra atual em laranja) na faixa de baixo. Objetivo: salvar/seguir.
  el("manchete", 0, DUR, `<div class="mc">O CONSELHO DE QUEM TEM<br><span>17 ANOS DE EMPRESA</span></div>`, "left:0;width:1080px;top:70px;text-align:center");
  tw(`tl.fromTo("#manchete .mc", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 0.05);`);
  el("nome", 0.6, 5.5, `<div class="nm"><b>Júnior</b><span>empresário há 17 anos · secretário da Indústria e Comércio de Maceió</span></div>`, "left:50px;width:980px;top:1500px");
  tw(`tl.fromTo("#nome .nm", { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 0.6);`); sai("#nome .nm", 5.3);
  grupos(5, 0.3).forEach((g, i, all) => {
    const a = Math.max(0, g[0].ini - 0.03), b = Math.min(all[i + 1] ? all[i + 1][0].ini - 0.02 : DUR, g.at(-1).fim + 0.3);
    leg += `      <div id="g${i}" class="clip gp" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><span class="tx">${g.map((p, j) => `<b id="g${i}w${j}">${esc(limpa(p.texto))}</b>`).join(" ")}</span></div>\n`;
    g.forEach((p, j) => { legjs += `      tl.set("#g${i}w${j}", { color: "${LJ}" }, ${f(p.ini)}); tl.set("#g${i}w${j}", { color: "#fff" }, ${f(Math.min(b, (g[j + 1]?.ini ?? p.fim + 0.25)))});\n`; });
  });
  CSS = `.gp { position: absolute; left: 60px; right: 60px; top: 1680px; text-align: center; }
    .tx { display: inline-block; font-family: "Montserrat"; font-weight: 800; font-size: 56px; line-height: 1.15; color: #fff; } .tx b { font-weight: 800; }
    .mc { display: inline-block; font-family: "Montserrat"; font-weight: 900; font-size: 62px; line-height: 1.1; color: #fff; } .mc span { color: ${LJ}; }
    .nm { display: inline-flex; flex-direction: column; padding: 16px 26px; border-left: 10px solid ${LJ}; background: rgba(0,0,0,0.72); color: #fff; font-family: "Montserrat"; } .nm b { font-size: 50px; font-weight: 900; } .nm span { font-size: 30px; font-weight: 600; opacity: 0.9; }`;
  [T("nunca vivi"), T("rentável"), T("desafio esse")].forEach((t) => zoom(t - 0.05, 1.08));
  som("whoosh-short", 0.05, 0.05);
} else if (N === "4") {
  // DICA/OPORTUNIDADE com números grandes + palavras-chave + socos de zoom. Objetivo: seguidores locais (empreendedor de Maceió).
  const CH = new Set(["restaurantes", "1.500", "oportunidade", "oportunidades", "centro", "locomotiva", "atender"]);
  grupos(3, 0.25).forEach((g, i, all) => {
    const a = Math.max(0, g[0].ini - 0.03), b = Math.min(all[i + 1] ? all[i + 1][0].ini - 0.02 : DUR, g.at(-1).fim + 0.3);
    leg += `      <div id="g${i}" class="clip gp" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><span class="tx">${g.map((p, j) => `<b id="g${i}w${j}" class="${CH.has(p.texto.toLowerCase().replace(/[.,?!]/g, "")) ? "ch" : ""}">${esc(limpa(p.texto))}</b>`).join(" ")}</span></div>\n`;
    g.forEach((p, j) => { legjs += `      tl.fromTo("#g${i}w${j}", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.12 }, ${f(Math.max(0, p.ini - 0.03))});\n`; });
  });
  CSS = `.gp { position: absolute; left: 70px; right: 70px; top: 1330px; text-align: center; }
    .tx { display: inline-block; font-family: "Poppins"; font-weight: 800; font-size: 66px; line-height: 1.12; color: #fff; text-shadow: 0 0 18px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.5); } .tx b { font-weight: 800; display: inline-block; } .tx b.ch { color: #FFD23F; }`;
  const big = (id, t0, t1, html) => { el(id, t0, t1, html, "left:0;width:1080px;top:200px;text-align:center"); pop(`#${id} > *`, t0); sai(`#${id} > *`, t1 - 0.2); som("pop", t0, 0.06); zoom(t0, 1.12); };
  big("hk", 0.05, T("Daqui") - 0.05, `<div class="bx">OPORTUNIDADE<br>NO CENTRO DE MACEIÓ</div>`);
  big("n1500", T("1.500") - 0.05, T("O centro é") - 0.05, `<div class="num"><span id="cnt">1.500</span></div><div class="lb">PESSOAS POR DIA NO CENTRO</div>`);
  big("rest", T("restaurantes", 8) - 0.05, T("Eu estou falando") - 0.05, `<div class="bx">RESTAURANTES<br><span>NÃO VÃO DAR CONTA</span></div>`);
  big("opo", T("oportunidade") - 0.05, DUR, `<div class="bx">VÃO SURGIR<br><span>MUITAS OPORTUNIDADES</span></div>`);
  CSS += `\n    .bx { display: inline-block; padding: 18px 34px; border-radius: 20px; background: #fff; color: #111; font-family: "Poppins"; font-weight: 900; font-size: 64px; line-height: 1.08; box-shadow: 0 14px 34px rgba(0,0,0,0.3); } .bx span { color: #E4572E; }
    .num { font-family: "Poppins"; font-weight: 900; font-size: 190px; line-height: 1; color: #FFD23F; -webkit-text-stroke: 10px #111; paint-order: stroke fill; } .lb { display: inline-block; margin-top: 6px; padding: 10px 24px; border-radius: 999px; background: #111; color: #fff; font-family: "Poppins"; font-weight: 800; font-size: 40px; }`;
  som("impact-bass-1", T("1.500"), 0.06); som("riser", T("restaurantes", 8) - 0.4, 0.04);
} else if (N === "5") {
  // PLANO ABERTO CINEMATOGRÁFICO (os dois no meio, fundo desfocado), legenda limpa de frase, nome de quem fala. Objetivo: conexão.
  el("ttl", 0.2, DUR, `<div class="tt">PAI, EMPRESÁRIO<br>E SECRETÁRIO</div><div class="st">como o Júnior equilibra a família</div>`, "left:0;width:1080px;top:230px;text-align:center");
  tw(`tl.fromTo("#ttl > *", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }, 0.2);`);
  const fala = (id, t0, t1, nome) => { el(id, t0, t1, `<div class="tag">${nome}</div>`, "left:80px;top:1350px"); tw(`tl.fromTo("#${id} .tag", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, ${f(t0)});`); sai(`#${id} .tag`, t1 - 0.2); };
  const tj = T("Eu tenho");
  fala("f1", 0.1, tj - 0.1, "VIRGÍLIO"); fala("f2", tj, Math.min(DUR, tj + 4), "JÚNIOR");
  grupos(7, 0.35).forEach((g, i, all) => {
    const a = Math.max(0, g[0].ini - 0.05), b = Math.min(all[i + 1] ? all[i + 1][0].ini - 0.03 : DUR, g.at(-1).fim + 0.4);
    leg += `      <div id="g${i}" class="clip gp" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><span class="tx">${esc(g.map((p) => p.texto).join(" "))}</span></div>\n`;
    legjs += `      tl.fromTo("#g${i} .tx", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(a)});\n`;
  });
  CSS = `.gp { position: absolute; left: 90px; right: 90px; top: 1440px; text-align: center; }
    .tx { display: inline-block; font-family: "Inter"; font-weight: 500; font-size: 54px; line-height: 1.25; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.6); }
    .tt { font-family: "Inter"; font-weight: 800; font-size: 76px; line-height: 1.05; letter-spacing: -0.03em; color: #fff; } .st { margin-top: 12px; font-family: "Inter"; font-weight: 500; font-size: 38px; color: rgba(255,255,255,0.8); }
    .tag { display: inline-block; padding: 8px 18px; border-radius: 8px; background: rgba(255,255,255,0.92); color: #111; font-family: "Inter"; font-weight: 800; font-size: 30px; letter-spacing: 0.08em; }`;
  // movimento lento de câmera (respira)
  cam.push(`tl.fromTo("#camera", { scale: 1 }, { scale: 1.06, duration: ${f(DUR)}, ease: "none", immediateRender: false }, 0);`);
}

// ---- efeitos sonoros discretos ----
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
let audios = "";
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t)}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${6 + (i % 3)}" data-volume="${v}"></audio>\n`;
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@600;800;900&family=Poppins:wght@800;900&family=Inter:wght@500;800&display=swap" rel="stylesheet">`;
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/camadas.html"), `<template>
  ${FONTES}
  <style>
    #root { position: absolute; inset: 0; } .ui { position: absolute; }
    ${CSS}
  </style>
  <div id="root" data-composition-id="camadas" data-width="${W}" data-height="${H}">
${els.join("\n")}
${leg}  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
${legjs}      window.__timelines["camadas"] = tl;
    })();
  </script>
</template>
`);
fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    ${FONTES}
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: ${origem}; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #camadas { position: absolute; inset: 0; z-index: 2; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/video.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="camadas" data-composition-id="camadas" data-composition-src="compositions/camadas.html" data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`corte ${N}: ${PAL.length} palavras, ${els.length} grafismos, ${sons.length} efeitos, ${DUR}s`);
