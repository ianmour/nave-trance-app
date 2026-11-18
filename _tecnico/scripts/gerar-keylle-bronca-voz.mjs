#!/usr/bin/env node
// Keylle Lima — "Como dar bronca sem destruir a sua equipe". Vídeo 100% animado em código.
// Fundo único: azul suave com luz. Legenda branca com a palavra-chave numa etiqueta.
// Uso: node gerar-keylle-bronca.mjs <pasta-do-projeto>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const P = process.argv[2];
const W = 1080, H = 1920;
const C = { marinho: "#0A1E4A", royal: "#1E5BFF", claro: "#8FB8FF", gelo: "#EAF2FF", vermelho: "#FF4D5E", verde: "#2BD576" };
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const durVoz = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(P, "assets/narracao.wav")], { encoding: "utf8" }));
const DUR = +(Math.ceil((durVoz + 1.0) * 30) / 30).toFixed(4);

// ---- tempos: palavras do ROTEIRO alinhadas com a transcrição ----
const roteiro = fs.readFileSync(path.join(P, "assets/narracao.txt"), "utf8").replace(/["“”]/g, "").split(/\s+/).filter(Boolean);
const trans = JSON.parse(fs.readFileSync(path.join(P, "assets/transcript.json"), "utf8")).filter((w) => w.text.trim());
const a = roteiro.map(nrm), b = trans.map((w) => nrm(w.text));
// alinhamento simples (programação dinâmica)
const n = a.length, m = b.length, D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
const tempo = new Array(n).fill(null);
for (let i = n, j = m; i > 0 && j > 0;) {
  if (D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { tempo[i - 1] = { ini: trans[j - 1].start, fim: trans[j - 1].end }; i--; j--; }
  else if (D[i][j] === D[i - 1][j] + 1) i--; else j--;
}
for (let i = 0; i < n; i++) if (!tempo[i]) { // palavra sem par: entre a anterior e a próxima
  const ant = tempo.slice(0, i).reverse().find(Boolean), pos = tempo.slice(i + 1).find(Boolean);
  const t = ant && pos ? (ant.fim + pos.ini) / 2 : ant ? ant.fim : pos.ini;
  tempo[i] = { ini: t, fim: t + 0.15 };
}
const pal = roteiro.map((t, i) => ({ texto: t, ...tempo[i] }));
const T = (frag) => { // início da primeira ocorrência de uma sequência de palavras
  const ws = frag.split(" ").map(nrm);
  for (let i = 0; i < pal.length; i++) if (ws.every((w, k) => nrm(pal[i + k]?.texto || "") === w)) return pal[i].ini;
  throw new Error("não achei: " + frag);
};

// ---- cenas ----
const els = [], js = [];
const el = (id, t0, t1, html, estilo = "", cls = "") => els.push(`      <div id="${id}" class="clip cena ${cls}" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}" data-layout-allow-overlap>${html}</div>`);
const tw = (s) => js.push("      " + s);
const entra = (s, t) => tw(`tl.fromTo("${s}", { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }, ${f(t)});`);
const sai = (s, t) => tw(`tl.to("${s}", { opacity: 0, y: -40, scale: 0.96, duration: 0.25, ease: "power2.in" }, ${f(t)});`);
const pop = (s, t, rot = 0) => tw(`tl.fromTo("${s}", { opacity: 0, scale: 0.4, rotation: ${rot * 2} }, { opacity: 1, scale: 1, rotation: ${rot}, duration: 0.3, ease: "back.out(2)" }, ${f(t)});`);
const some = (s, t) => tw(`tl.to("${s}", { opacity: 0, scale: 0.6, duration: 0.2, ease: "power2.in" }, ${f(t)});`);
const risca = (s, t) => tw(`tl.fromTo("${s}", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, ${f(t)});`);

// ===== v2: fundo claro quadriculado, estilo "adesivo", personagens com expressão, sem música =====
const N = "#0A1E4A";           // azul-marinho (contornos e texto)
const R = C.royal, CL = "#DCE8FF", VM = C.vermelho, VD = C.verde;
const PELE = "#F2C9A0";
// personagem com rosto; expressões trocáveis: neutro | triste | feliz
const avatar = (id, tipo, tam = 200, expr = "neutro") => {
  const camisa = tipo === "chefe" ? N : R;
  const cabelo = tipo === "chefe" ? "#2B1B12" : "#5A3A22";
  const extra = tipo === "chefe"
    ? `<path d="M52 104 L60 118 L68 104 Z" fill="#fff" stroke="${N}" stroke-width="3"/><path d="M57 112 L60 140 L63 112 Z" fill="${R}" stroke="${N}" stroke-width="2"/>`
    : `<path d="M44 102 Q60 116 76 102" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  const cab = tipo === "chefe"
    ? `<path d="M27 46 Q30 14 60 14 Q92 14 93 46 Q86 30 60 30 Q36 30 27 46 Z" fill="${cabelo}" stroke="${N}" stroke-width="3"/>`
    : `<path d="M26 50 Q24 12 62 14 Q96 16 94 50 Q90 34 78 30 Q70 40 50 36 Q34 36 26 50 Z" fill="${cabelo}" stroke="${N}" stroke-width="3"/>`;
  const o = (e) => (e === expr ? 1 : 0);
  return `<svg viewBox="0 0 120 160" width="${tam}" height="${Math.round(tam * 4 / 3)}" style="overflow:visible">
    <path d="M14 158 Q14 104 60 102 Q106 104 106 158 Z" fill="${camisa}" stroke="${N}" stroke-width="4"/>${extra}
    <circle cx="60" cy="56" r="34" fill="${PELE}" stroke="${N}" stroke-width="4"/>${cab}
    <g id="${id}-neutro" opacity="${o("neutro")}"><circle cx="48" cy="58" r="4.5" fill="${N}"/><circle cx="72" cy="58" r="4.5" fill="${N}"/><path d="M50 76 L70 76" stroke="${N}" stroke-width="4" stroke-linecap="round"/></g>
    <g id="${id}-triste" opacity="${o("triste")}"><path d="M40 48 L54 52 M80 48 L66 52" stroke="${N}" stroke-width="3.5" stroke-linecap="round"/><circle cx="48" cy="60" r="4.5" fill="${N}"/><circle cx="72" cy="60" r="4.5" fill="${N}"/><path d="M48 82 Q60 72 72 82" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/><path id="${id}-lagrima" d="M74 66 Q78 74 74 78 Q70 74 74 66 Z" fill="#7DB4FF" stroke="${N}" stroke-width="1.5"/></g>
    <g id="${id}-feliz" opacity="${o("feliz")}"><path d="M43 58 Q48 52 53 58 M67 58 Q72 52 77 58" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/><path d="M46 72 Q60 88 74 72 Z" fill="#fff" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="40" cy="68" r="5" fill="#FF9AA8" opacity="0.6"/><circle cx="80" cy="68" r="5" fill="#FF9AA8" opacity="0.6"/></g>
  </svg>`;
};
const cara = (id, t, de, para) => { tw(`tl.set("#${id}-${de}", { opacity: 0 }, ${f(t)});`); tw(`tl.set("#${id}-${para}", { opacity: 1 }, ${f(t)});`); };
const respira = (s, t0, t1, amp = 6) => { const reps = Math.max(1, Math.floor((t1 - t0) / 0.9) - 1); tw(`tl.fromTo("${s}", { y: 0 }, { y: -${amp}, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: ${reps} }, ${f(t0)});`); };
const balanca = (s, t) => tw(`tl.fromTo("${s}", { rotation: 0 }, { keyframes: [{ rotation: -6, duration: 0.07 }, { rotation: 5, duration: 0.07 }, { rotation: -3, duration: 0.07 }, { rotation: 0, duration: 0.08 }] }, ${f(t)});`);
const mao = `<svg viewBox="0 0 120 90" width="230" height="172"><path d="M10 40 L70 40 Q80 40 80 30 Q80 22 70 22 L40 22" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/><path d="M10 36 Q10 70 30 76 L66 76 Q78 76 78 66 Q86 64 86 56 Q94 54 92 44 L70 44" fill="${PELE}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/><path d="M70 22 L112 22 Q118 22 118 30 Q118 38 112 38 L72 38" fill="${PELE}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/></svg>`;
const s1 = 0, s2 = T("Você já passou"), s3 = T("O problema"), s4 = T("Então"), s5 = T("Primeiro"), s6 = T("Dois"), s7 = T("Três"), s8 = T("Bronca boa"), s9 = T("Quer as frases");

// 1 — chefe x funcionário
el("c1", 0, s2 - 0.05, `
  <div class="capa">corrigiu<br>ou <b>humilhou?</b></div>
  <div id="c1ch" class="pers" style="left:10px;top:240px">${avatar("ch1", "chefe", 210)}<span class="nome">você</span></div>
  <div id="c1fu" class="pers" style="left:600px;top:430px">${avatar("fu1", "func", 210)}<span class="nome">funcionário</span></div>
  <div id="c1b1" class="balao" style="left:250px;top:280px">corrigi <span class="selo ok">✓</span></div>
  <div id="c1b2" class="balao" style="left:30px;top:560px">fui humilhado <span class="selo no">✕</span></div>`, "top:300px;height:780px");
respira("#c1ch", 0, s2, 5); respira("#c1fu", 0.2, s2, 5);
pop("#c1b1", T("corrigiu") - 0.05, -3); pop("#c1b2", T("humilhado") - 0.05, 3);
cara("fu1", T("humilhado") - 0.05, "neutro", "triste"); balanca("#c1fu", T("humilhado"));
tw(`tl.fromTo("#fu1-lagrima", { y: -6, opacity: 0 }, { y: 14, opacity: 1, duration: 0.6, ease: "power1.in" }, ${f(T("humilhado") + 0.1)});`);
sai("#c1", s2 - 0.3);

// 2 — pergunta
el("c2", s2, s3 - 0.05, `<div class="titulo">Você já<br>passou por<br>isso <span id="c2q" class="selo grande">?</span></div>`, "top:400px");
entra("#c2", s2); tw(`tl.fromTo("#c2q", { rotation: 0, scale: 1 }, { keyframes: [{ rotation: 14, scale: 1.2, duration: 0.2 }, { rotation: -10, scale: 1, duration: 0.2 }, { rotation: 6, duration: 0.15 }, { rotation: 0, duration: 0.15 }] }, ${f(s2 + 0.4)});`); sai("#c2", s3 - 0.3);

// 3 — corrigir riscado
el("c3", s3, s4 - 0.05, `<div class="sub">o problema não é</div><div class="titulo"><span class="riscavel">corrigir<i id="c3r" class="risco"></i></span></div><div class="sub" style="margin-top:34px">é</div><div id="c3t" class="etq">o jeito</div>`, "top:420px");
entra("#c3", s3); risca("#c3r", T("é o jeito") - 0.05); pop("#c3t", T("jeito") - 0.08, -3); sai("#c3", s4 - 0.25);

// 4 — faça assim
el("c4", s4, s5 - 0.02, `<div class="titulo">Faça assim</div><div class="pontos"><span id="c4a" class="selo num">1</span><span id="c4b" class="selo num">2</span><span id="c4c" class="selo num">3</span></div>`, "top:600px");
entra("#c4", s4); ["a", "b", "c"].forEach((k, i) => pop(`#c4${k}`, s4 + 0.12 + i * 0.09, [-6, 4, -3][i])); sai("#c4", s5 - 0.2);

// 5 — fale em particular
const plateia = [0, 1, 2, 3].map((i) => `<div id="c5x${i}" class="mini" style="left:${30 + i * 120}px;top:40px">${avatar(`px${i}`, i % 2 ? "func" : "chefe", 95)}</div>`).join("");
el("c5", s5, s6 - 0.05, `<div class="cab"><span class="selo num">1</span><span class="cardtit">Fale em particular</span></div>
  <div class="sala card">${plateia}
    <div id="c5ch" class="mini" style="left:120px;top:190px">${avatar("ch5", "chefe", 130)}</div>
    <div id="c5fu" class="mini" style="left:300px;top:190px">${avatar("fu5", "func", 130)}</div>
    <div id="c5porta" class="porta"><i></i></div></div>
  <div id="c5al" class="etq vermelha">na frente dos outros = humilhação</div>`, "top:300px");
entra("#c5", s5); respira("#c5ch", s5, s6, 4); respira("#c5fu", s5 + 0.2, s6, 4);
[0, 1, 2, 3].forEach((i) => tw(`tl.to("#c5x${i}", { x: ${420 - i * 60}, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f(T("fale em particular") + 0.1 + i * 0.07)});`));
tw(`tl.fromTo("#c5porta", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "back.out(1.5)" }, ${f(T("particular") + 0.45)});`);
pop("#c5al", T("virar humilhação"), -2); sai("#c5", s6 - 0.3);

// 6 — fale do fato
el("c6", s6, s7 - 0.05, `<div class="cab"><span class="selo num">2</span><span class="cardtit">Fale do fato,<br>não da pessoa</span></div>
  <div id="c6a" class="balao estatico ruim"><span class="riscavel">"você é desatento"<i id="c6r" class="risco"></i></span></div>
  <div id="c6seta" class="seta"><svg viewBox="0 0 60 90" width="60" height="90"><path d="M30 6 Q36 40 30 74 M14 58 L30 80 L46 58" fill="none" stroke="${N}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div id="c6b" class="balao estatico">"o pedido saiu<br>errado hoje" <span class="selo ok">✓</span></div>`, "top:300px");
entra("#c6", s6); pop("#c6a", T("você é desatento") - 0.05, -3); risca("#c6r", T("por o pedido") - 0.1); balanca("#c6a", T("por o pedido"));
pop("#c6seta", T("o pedido") - 0.05); pop("#c6b", T("pedido") - 0.05, 2); sai("#c6", s7 - 0.3);

// 7 — próximo passo
const pergunta = "O que a gente faz para isso não se repetir?";
el("c7", s7, s8 - 0.05, `<div class="cab"><span class="selo num">3</span><span class="cardtit">Termine com o<br>próximo passo</span></div>
  <div class="degraus"><i id="c7d0" style="left:40px;height:60px"></i><i id="c7d1" style="left:210px;height:120px"></i><i id="c7d2" style="left:380px;height:180px"></i>
    <div id="c7fu" class="mini" style="left:65px;bottom:60px">${avatar("fu7", "func", 110)}</div><div id="c7flag" class="bandeira"><svg viewBox="0 0 60 80" width="70" height="92"><path d="M10 78 L10 6" stroke="${N}" stroke-width="5" stroke-linecap="round"/><path d="M10 8 L52 18 L10 32 Z" fill="${VD}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/></svg></div></div>
  <div id="c7bal" class="balao estatico largo"><span id="c7txt"></span></div>`, "top:290px");
entra("#c7", s7); [0, 1, 2].forEach((i) => pop(`#c7d${i}`, T("termine") + i * 0.1));
tw(`tl.fromTo("#c7fu", { x: 0, y: 0 }, { keyframes: [{ x: 85, y: -100, duration: 0.18 }, { x: 170, y: -60, duration: 0.14 }, { x: 255, y: -160, duration: 0.18 }, { x: 340, y: -120, duration: 0.14 }], ease: "power1.inOut" }, ${f(T("próximo passo"))});`);
cara("fu7", T("passo"), "neutro", "feliz"); pop("#c7flag", T("passo") + 0.2, 8);
pop("#c7bal", T("O que a gente") - 0.1);
const t0txt = T("O que a gente"), t1txt = T("repetir") + 0.3;
[...pergunta].forEach((_, k) => tw(`tl.set("#c7txt", { textContent: ${JSON.stringify(pergunta.slice(0, k + 1))} }, ${f(t0txt + (k / pergunta.length) * (t1txt - t0txt))});`));
sai("#c7", s8 - 0.3);

// 8 — dedo vira caminho
el("c8", s8, s9 - 0.05, `<div class="sub">bronca boa</div><div class="titulo" style="font-size:100px">não aponta<br>o dedo</div>
  <div class="trilha"><div id="c8mao" class="mao">${mao}</div>
  <svg viewBox="0 0 780 300" width="780" height="300" style="overflow:visible;position:absolute;left:0;top:0">
    <path id="c8cam" d="M200 210 C 280 210, 300 70, 450 90 S 640 230, 730 100" fill="none" stroke="${R}" stroke-width="12" stroke-linecap="round" stroke-dasharray="22 18" stroke-dashoffset="0"/>
    <rect id="c8tampa" x="140" y="40" width="640" height="240" fill="#FAFCFF"/></svg></div>
  <div id="c8t" class="etq">mostra o caminho</div>`, "top:360px");
entra("#c8", s8);
tw(`tl.fromTo("#c8mao", { x: 0, rotation: 0 }, { keyframes: [{ x: 18, duration: 0.12 }, { x: 0, duration: 0.12 }, { x: 18, duration: 0.12 }, { x: 0, duration: 0.12 }] }, ${f(T("aponta") - 0.05)});`);
tw(`tl.fromTo("#c8tampa", { attr: { x: 140 } }, { attr: { x: 790 }, duration: 0.75, ease: "power2.inOut" }, ${f(T("mostra o caminho") - 0.1)});`);
tw(`tl.to("#c8mao", { rotation: -25, duration: 0.3, ease: "back.out(2)" }, ${f(T("mostra o caminho") - 0.1)});`);
pop("#c8t", T("caminho") - 0.05, -3); sai("#c8", s9 - 0.3);

// 9 — CTA
el("c9", s9, DUR, `<div class="sub" style="font-size:52px">quer as frases prontas para<br>a próxima conversa difícil?</div>
  <div id="c9post" class="card post"><div class="perfil"><i>KL</i><b>@keyllelima</b></div>
    <div class="comentario"><span id="c9txt"></span><span class="cur">|</span><div id="c9env" class="enviar">➤</div></div></div>
  <div id="c9t" class="etq" style="margin-top:40px">comenta BRONCA</div>`, "top:340px");
entra("#c9", s9); pop("#c9post", T("Comenta") - 0.3, -2);
["B", "BR", "BRO", "BRON", "BRONC", "BRONCA"].forEach((s, k) => tw(`tl.set("#c9txt", { textContent: "${s}" }, ${f(T("Comenta") + 0.1 + k * 0.09)});`));
tw(`tl.fromTo("#c9env", { scale: 1 }, { keyframes: [{ scale: 1.35, duration: 0.15 }, { scale: 1, duration: 0.15 }] }, ${f(T("Comenta") + 0.75)});`);
pop("#c9t", T("bronca que eu") - 0.05, -3);

// ---- legenda: azul-escura, palavra-chave em etiqueta azul ----
const CHAVES = new Set(["humilhado", "corrigir", "jeito", "particular", "humilhacao", "fato", "pessoa", "passo", "caminho", "bronca", "dedo"]);
const grupos = []; let g = [];
pal.forEach((p, i) => { g.push(p); const prox = pal[i + 1]; if (!prox || /[.?!:]$/.test(p.texto) || (/,$/.test(p.texto) && g.length >= 2) || g.length === 4 || prox.ini - p.fim > 0.3) { grupos.push(g); g = []; } });
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const ini = Math.max(0.02, gr[0].ini - 0.05), prox = grupos[i + 1];
  const fim = Math.min(prox ? prox[0].ini - 0.04 : DUR, gr[gr.length - 1].fim + 0.6, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(ini)}" data-duration="${f(Math.max(0.15, fim - ini))}" data-track-index="0"><div class="cx">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw${CHAVES.has(nrm(p.texto)) ? " chave" : ""}">${esc(p.texto)}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += `      tl.fromTo("#lg${i}w${j}", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.03))});\n`; });
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.1 }, ${f(Math.max(ini + 0.05, fim - 0.1))});\n`;
});

fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/cenas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; font-family: "Inter"; letter-spacing: -0.03em; color: ${N}; }
    .cena { position: absolute; left: 120px; width: 840px; text-align: center; }
    .titulo { font-weight: 900; font-size: 112px; line-height: 0.98; }
    .sub { font-weight: 700; font-size: 58px; line-height: 1.1; color: #3B4F7C; }
    .capa { font-weight: 900; font-size: 96px; line-height: 0.98; }
    .capa b { color: #fff; background: ${VM}; padding: 0 18px 8px; border-radius: 18px; border: 5px solid ${N}; box-shadow: 8px 8px 0 ${N}; display: inline-block; transform: rotate(-2deg); }
    .card { background: #fff; border: 5px solid ${N}; border-radius: 32px; box-shadow: 10px 10px 0 ${N}; }
    .pers { position: absolute; text-align: center; } .nome { display: inline-block; margin-top: 6px; padding: 4px 16px 6px; border-radius: 12px; background: ${N}; color: #fff; font-weight: 800; font-size: 30px; }
    .balao { position: absolute; padding: 22px 32px 26px; border-radius: 30px; font-weight: 900; font-size: 54px; background: #fff; color: ${N}; border: 5px solid ${N}; box-shadow: 8px 8px 0 ${N}; white-space: nowrap; }
    .balao.estatico { position: relative; display: inline-block; }
    .balao.ruim { background: #FFE3E6; }
    .balao.largo { white-space: normal; width: 780px; min-height: 150px; font-size: 48px; line-height: 1.15; text-align: left; margin-top: 34px; }
    .selo { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; border: 4px solid ${N}; color: #fff; font-size: 36px; font-weight: 900; vertical-align: middle; box-shadow: 4px 4px 0 ${N}; }
    .selo.ok { background: ${VD}; } .selo.no { background: ${VM}; }
    .selo.grande { width: 120px; height: 120px; font-size: 90px; background: ${R}; border-width: 6px; box-shadow: 7px 7px 0 ${N}; }
    .selo.num { width: 110px; height: 110px; font-size: 66px; background: ${R}; box-shadow: 6px 6px 0 ${N}; }
    .pontos { margin-top: 50px; display: flex; gap: 40px; justify-content: center; }
    .etq { display: inline-block; margin-top: 18px; padding: 14px 36px 20px; border-radius: 22px; background: ${R}; color: #fff; font-weight: 900; font-size: 76px; border: 5px solid ${N}; box-shadow: 8px 8px 0 ${N}; }
    .etq.vermelha { background: ${VM}; font-size: 38px; padding: 10px 26px 14px; margin-top: 34px; }
    .riscavel { position: relative; display: inline-block; }
    .risco { position: absolute; left: -6%; right: -6%; top: 50%; height: 14px; border-radius: 8px; background: ${VM}; transform-origin: left center; display: block; transform: rotate(-3deg); opacity: 0.92; }
    .cab { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 30px; }
    .cardtit { font-weight: 900; font-size: 70px; line-height: 1.0; text-align: left; }
    .sala { position: relative; width: 640px; height: 400px; margin: 0 auto; overflow: hidden; background: ${CL}; }
    .mini { position: absolute; }
    .porta { position: absolute; right: 0; top: 0; bottom: 0; width: 120px; background: #C98A4B; border-left: 5px solid ${N}; transform-origin: right center; }
    .porta i { position: absolute; left: 22px; top: 50%; width: 16px; height: 16px; border-radius: 50%; background: ${N}; }
    .seta { margin: 16px 0; }
    .degraus { position: relative; width: 600px; height: 330px; margin: 40px auto 0; }
    .degraus i { position: absolute; bottom: 0; width: 160px; border-radius: 14px 14px 0 0; background: ${CL}; border: 5px solid ${N}; box-shadow: 8px 0 0 ${N}; display: block; }
    .bandeira { position: absolute; left: 470px; top: 40px; }
    .trilha { position: relative; width: 780px; height: 300px; margin: 30px auto 0; }
    .mao { position: absolute; left: -40px; top: 120px; transform-origin: 20% 50%; }
    .post { margin: 44px auto 0; width: 760px; padding: 30px; text-align: left; }
    .perfil { display: flex; align-items: center; gap: 18px; font-size: 42px; } .perfil i { width: 70px; height: 70px; border-radius: 50%; background: ${R}; color: #fff; font-style: normal; font-weight: 900; font-size: 30px; display: flex; align-items: center; justify-content: center; border: 4px solid ${N}; }
    .comentario { position: relative; margin-top: 24px; border: 4px solid ${N}; border-radius: 40px; padding: 18px 110px 18px 30px; font-weight: 900; font-size: 56px; min-height: 104px; background: ${CL}; }
    .cur { color: ${R}; font-weight: 400; }
    .enviar { position: absolute; right: 14px; top: 10px; width: 82px; height: 82px; border-radius: 50%; background: ${R}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 40px; border: 4px solid ${N}; }
  </style>
  <div id="root" data-composition-id="cenas" data-width="${W}" data-height="${H}">
${els.join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["cenas"] = tl;
    })();
  </script>
</template>
`);

fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 150px; width: 780px; top: 1150px; text-align: center; }
    .cx { display: inline-block; font-family: "Inter"; font-weight: 800; font-size: 50px; line-height: 1.3; letter-spacing: -0.03em; color: ${N}; }
    .pw { display: inline-block; }
    .chave { background: ${R}; color: #fff; font-weight: 900; padding: 0 14px 4px; border-radius: 12px; }
  </style>
  <div id="root" data-composition-id="legendas" data-width="${W}" data-height="${H}">
${lh}  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${lj}      window.__timelines["legendas"] = tl;
    })();
  </script>
</template>
`);

// ---- mais efeitos sonoros (sem música) ----
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
const sons = [
  ["pop", T("corrigiu") - 0.05, 0.16], ["pop", T("humilhado") - 0.05, 0.16], ["error", T("humilhado") + 0.05, 0.07],
  ["whoosh-short", s2 - 0.1, 0.12], ["click-soft", s2 + 0.4, 0.14], ["whoosh-short", s3 - 0.1, 0.12],
  ["click", T("é o jeito") - 0.05, 0.14], ["pop", T("jeito") - 0.08, 0.16], ["whoosh-short", s4 - 0.05, 0.12],
  ["pop", s4 + 0.12, 0.12], ["pop", s4 + 0.21, 0.12], ["pop", s4 + 0.3, 0.12],
  ["whoosh-short", s5 - 0.1, 0.12], ["whoosh", T("fale em particular") + 0.1, 0.1], ["click", T("particular") + 0.6, 0.16], ["notification", T("virar humilhação"), 0.07],
  ["whoosh-short", s6 - 0.1, 0.12], ["pop", T("você é desatento") - 0.05, 0.14], ["click-soft", T("por o pedido") - 0.1, 0.16], ["ping", T("pedido") - 0.05, 0.1],
  ["whoosh-short", s7 - 0.1, 0.12], ["key-press", T("próximo passo"), 0.14], ["key-press", T("próximo passo") + 0.18, 0.14], ["key-press", T("próximo passo") + 0.32, 0.14], ["sparkle", T("passo") + 0.2, 0.1],
  ["typing", T("O que a gente"), 0.09], ["whoosh-short", s8 - 0.1, 0.12], ["whoosh", T("mostra o caminho") - 0.1, 0.12], ["chime", T("caminho"), 0.07],
  ["whoosh-short", s9 - 0.1, 0.12], ["key-press", T("Comenta") + 0.1, 0.14], ["key-press", T("Comenta") + 0.3, 0.14], ["key-press", T("Comenta") + 0.5, 0.14],
  ["click", T("Comenta") + 0.75, 0.16], ["sparkle", T("bronca que eu"), 0.12],
];
let audios = `      <audio id="voz" class="clip" src="assets/narracao.wav" data-start="0" data-duration="${f(durVoz)}" data-track-index="4" data-volume="1.6"></audio>\n`;
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(Math.max(0, t))}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${5 + (i % 3)}" data-volume="${v}"></audio>\n`;
});

fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #FAFCFF; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background-color: #FAFCFF;
        background-image: linear-gradient(rgba(30,91,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(30,91,255,0.07) 2px, transparent 2px);
        background-size: 64px 64px; }
      #luzA { position: absolute; width: 1100px; height: 1100px; left: -520px; top: -480px; border-radius: 50%;
        background: radial-gradient(circle, rgba(120,170,255,0.75) 0%, rgba(150,190,255,0.35) 35%, rgba(250,252,255,0) 68%); }
      #luzB { position: absolute; width: 1100px; height: 1100px; right: -520px; bottom: -480px; border-radius: 50%;
        background: radial-gradient(circle, rgba(120,170,255,0.75) 0%, rgba(150,190,255,0.35) 35%, rgba(250,252,255,0) 68%); }
      #cenas, #legendas { position: absolute; inset: 0; }
      #legendas { z-index: 3; } #cenas { z-index: 2; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="luzA" data-layout-ignore></div>
      <div id="luzB" data-layout-ignore></div>
      <div id="cenas" data-composition-id="cenas" data-composition-src="compositions/cenas.html" data-start="0" data-duration="${f(DUR)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${f(DUR)}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#luzA", { x: 0, y: 0, scale: 1 }, { x: 80, y: 60, scale: 1.12, duration: ${f(DUR)}, ease: "sine.inOut" }, 0);
      tl.fromTo("#luzB", { x: 0, y: 0, scale: 1 }, { x: -80, y: -60, scale: 1.12, duration: ${f(DUR)}, ease: "sine.inOut" }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok v2: ${pal.length} palavras, ${grupos.length} blocos de legenda, ${sons.length} efeitos, duração ${DUR}s`);
