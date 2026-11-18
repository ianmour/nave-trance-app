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
const pessoa = (cor = "#fff", tam = 130) => `<svg viewBox="0 0 60 80" width="${tam}" height="${Math.round(tam * 4 / 3)}"><circle cx="30" cy="20" r="14" fill="${cor}"/><path d="M6 78 Q6 44 30 44 Q54 44 54 78 Z" fill="${cor}"/></svg>`;
const s1 = 0, s2 = T("Você já passou"), s3 = T("O problema"), s4 = T("Faça assim"), s5 = T("Um"), s6 = T("Dois"), s7 = T("Três"), s8 = T("Bronca boa"), s9 = T("Quer as frases");

// 1 — dois balões
el("c1", 0, s2 - 0.05, `
  <div class="capa">corrigiu<br>ou <b>humilhou?</b></div>
  <div class="pessoa-l">${pessoa(C.claro)}<span>você</span></div>
  <div id="c1b1" class="balao b-dir">corrigi <b style="color:${C.verde}">✓</b></div>
  <div class="pessoa-r">${pessoa("#fff")}<span>funcionário</span></div>
  <div id="c1b2" class="balao b-esq">fui humilhado <b style="color:${C.vermelho}">✕</b></div>`, "top:300px;height:760px");
pop("#c1b1", T("corrigiu") - 0.05, -3); pop("#c1b2", T("humilhado") - 0.05, 3); sai("#c1", s2 - 0.3);

// 2 — pergunta
el("c2", s2, s3 - 0.05, `<div class="titulo">Você já passou<br>por isso<span id="c2q" class="q">?</span></div>`, "top:430px");
entra("#c2", s2); tw(`tl.fromTo("#c2q", { scale: 1 }, { keyframes: [{ scale: 1.25, duration: 0.25 }, { scale: 1, duration: 0.25 }, { scale: 1.18, duration: 0.2 }, { scale: 1, duration: 0.2 }], ease: "sine.inOut" }, ${f(s2 + 0.35)});`); sai("#c2", s3 - 0.3);

// 3 — corrigir riscado, "o jeito" em etiqueta
el("c3", s3, s4 - 0.05, `<div class="sub">o problema não é</div><div class="titulo"><span class="riscavel">corrigir<i id="c3r" class="risco"></i></span></div><div class="sub" style="margin-top:30px">é</div><div id="c3t" class="etq">o jeito</div>`, "top:380px");
entra("#c3", s3); risca("#c3r", T("é o jeito") - 0.05); pop("#c3t", T("jeito") - 0.08, -2); sai("#c3", s4 - 0.25);

// 4 — faça assim
el("c4", s4, s5 - 0.02, `<div class="titulo">Faça assim</div><div class="pontos"><i id="c4a"></i><i id="c4b"></i><i id="c4c"></i></div>`, "top:560px");
entra("#c4", s4); ["a", "b", "c"].forEach((k, i) => pop(`#c4${k}`, s4 + 0.15 + i * 0.1)); sai("#c4", s5 - 0.2);

// 5 — fale em particular: sala esvazia, porta fecha
const gente = [0, 1, 2, 3, 4, 5].map((i) => `<div id="c5p${i}" class="gente" style="left:${45 + (i % 3) * 180}px;top:${30 + Math.floor(i / 3) * 190}px">${pessoa(i < 2 ? (i === 0 ? C.claro : "#fff") : "#c9d8ff", 110)}</div>`).join("");
el("c5", s5, s6 - 0.05, `<div class="num">1</div><div class="cardtit">Fale em particular</div>
  <div class="sala">${gente}<div id="c5porta" class="porta"></div></div>
  <div id="c5x" class="etq vermelha">na frente dos outros = humilhação</div>`, "top:300px");
entra("#c5", s5);
[2, 3, 4, 5].forEach((i, k) => tw(`tl.to("#c5p${i}", { opacity: 0, x: 120, duration: 0.3, ease: "power2.in" }, ${f(T("fale em particular") + 0.15 + k * 0.08)});`));
tw(`tl.to("#c5p0", { x: 90, y: 95, duration: 0.4, ease: "power2.inOut" }, ${f(T("particular") + 0.1)});`);
tw(`tl.to("#c5p1", { x: 90, y: 95, duration: 0.4, ease: "power2.inOut" }, ${f(T("particular") + 0.1)});`);
tw(`tl.fromTo("#c5porta", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, ${f(T("particular") + 0.5)});`);
pop("#c5x", T("vira humilhação"), -2); sai("#c5", s6 - 0.3);

// 6 — fale do fato
el("c6", s6, s7 - 0.05, `<div class="num">2</div><div class="cardtit">Fale do fato,<br>não da pessoa</div>
  <div id="c6a" class="frase ruim"><span class="riscavel">"você é desatento"<i id="c6r" class="risco"></i></span></div>
  <div id="c6seta" class="seta">↓</div>
  <div id="c6b" class="frase boa">"o pedido saiu errado hoje" <b style="color:${C.verde}">✓</b></div>`, "top:300px");
entra("#c6", s6); pop("#c6a", T("você é desatento") - 0.05, -2); risca("#c6r", T("por o pedido") - 0.1);
pop("#c6seta", T("o pedido") - 0.05); pop("#c6b", T("pedido") - 0.05, 2); sai("#c6", s7 - 0.3);

// 7 — próximo passo: degraus + pergunta digitada
const pergunta = "O que a gente faz para isso não se repetir?";
el("c7", s7, s8 - 0.05, `<div class="num">3</div><div class="cardtit">Termine com o<br>próximo passo</div>
  <div class="degraus"><i id="c7d0" style="left:40px;height:70px"></i><i id="c7d1" style="left:200px;height:140px"></i><i id="c7d2" style="left:360px;height:210px"></i><div id="c7bola" class="bola"></div></div>
  <div id="c7bal" class="balao b-dir largo"><span id="c7txt"></span></div>`, "top:300px");
entra("#c7", s7); [0, 1, 2].forEach((i) => pop(`#c7d${i}`, T("termine") + i * 0.12));
tw(`tl.fromTo("#c7bola", { x: 0, y: 0 }, { keyframes: [{ x: 160, y: -70, duration: 0.25 }, { x: 320, y: -140, duration: 0.25 }], ease: "power1.inOut" }, ${f(T("próximo passo"))});`);
pop("#c7bal", T("O que a gente") - 0.1);
const t0txt = T("O que a gente"), t1txt = T("repetir") + 0.3;
[...pergunta].forEach((_, k) => tw(`tl.set("#c7txt", { textContent: ${JSON.stringify(pergunta.slice(0, k + 1))} }, ${f(t0txt + (k / pergunta.length) * (t1txt - t0txt))});`));
sai("#c7", s8 - 0.3);

// 8 — dedo vira caminho
el("c8", s8, s9 - 0.05, `<div class="sub">bronca boa</div><div class="titulo" style="font-size:96px">não aponta<br>o dedo</div>
  <svg id="c8svg" viewBox="0 0 780 260" width="780" height="260" style="overflow:visible;margin-top:40px">
    <path id="c8cam" d="M60 200 C 220 200, 260 60, 420 80 S 640 200, 720 90" fill="none" stroke="${C.claro}" stroke-width="10" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900"/>
    <circle id="c8dedo" cx="60" cy="200" r="34" fill="#fff"/>
  </svg>
  <div id="c8t" class="etq">mostra o caminho</div>`, "top:380px");
entra("#c8", s8);
tw(`tl.fromTo("#c8cam", { attr: { "stroke-dashoffset": 900 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.7, ease: "power2.inOut" }, ${f(T("mostra o caminho") - 0.1)});`);
tw(`tl.to("#c8dedo", { motionPath: null, x: 660, y: -110, duration: 0.7, ease: "power2.inOut" }, ${f(T("mostra o caminho") - 0.1)});`);
pop("#c8t", T("caminho") - 0.05, -2); sai("#c8", s9 - 0.3);

// 9 — CTA: comentário "BRONCA"
el("c9", s9, DUR, `<div class="sub" style="font-size:52px">quer as frases prontas para<br>a próxima conversa difícil?</div>
  <div id="c9post" class="post"><div class="perfil"><i></i><b>@keyllelima</b></div>
    <div class="comentario"><span id="c9txt"></span><span id="c9cur" class="cur">|</span><div id="c9env" class="enviar">➤</div></div></div>
  <div id="c9t" class="etq" style="margin-top:36px">comenta BRONCA</div>`, "top:330px");
entra("#c9", s9); pop("#c9post", T("Comenta") - 0.3);
["B", "BR", "BRO", "BRON", "BRONC", "BRONCA"].forEach((s, k) => tw(`tl.set("#c9txt", { textContent: "${s}" }, ${f(T("Comenta") + 0.1 + k * 0.09)});`));
tw(`tl.fromTo("#c9env", { scale: 1 }, { keyframes: [{ scale: 1.3, duration: 0.15 }, { scale: 1, duration: 0.15 }] }, ${f(T("Comenta") + 0.75)});`);
pop("#c9t", T("bronca que eu") - 0.05, -2);

// ---- legenda: branca, palavra-chave em etiqueta ----
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
    #root { position: absolute; inset: 0; font-family: "Inter"; letter-spacing: -0.03em; color: #fff; }
    .cena { position: absolute; left: 120px; width: 840px; text-align: center; }
    .titulo { font-weight: 900; font-size: 110px; line-height: 1; text-shadow: 0 10px 40px rgba(0,0,0,0.25); }
    .sub { font-weight: 700; font-size: 58px; line-height: 1.1; opacity: 0.85; }
    .q { display: inline-block; color: ${C.claro}; margin-left: 8px; }
    .etq { display: inline-block; margin-top: 18px; padding: 14px 34px 18px; border-radius: 22px; background: #fff; color: ${C.royal}; font-weight: 900; font-size: 74px; box-shadow: 0 16px 40px rgba(0,0,0,0.25); }
    .etq.vermelha { background: ${C.vermelho}; color: #fff; font-size: 38px; padding: 10px 24px 12px; margin-top: 22px; }
    .riscavel { position: relative; display: inline-block; }
    .risco { position: absolute; left: -6%; right: -6%; top: 52%; height: 12px; border-radius: 6px; background: ${C.vermelho}; transform-origin: left center; display: block; }
    .pontos { margin-top: 50px; display: flex; gap: 34px; justify-content: center; } .pontos i { width: 34px; height: 34px; border-radius: 50%; background: #fff; display: block; }
    .num { display: inline-flex; width: 110px; height: 110px; border-radius: 50%; background: #fff; color: ${C.royal}; font-weight: 900; font-size: 70px; align-items: center; justify-content: center; }
    .cardtit { font-weight: 900; font-size: 76px; line-height: 1.02; margin: 22px 0 34px; }
    .sala { position: relative; width: 600px; height: 420px; margin: 0 auto; border-radius: 36px; background: rgba(255,255,255,0.10); border: 3px solid rgba(255,255,255,0.35); overflow: hidden; }
    .gente { position: absolute; }
    .porta { position: absolute; right: 0; top: 0; bottom: 0; width: 26px; background: #fff; transform-origin: right center; }
    .frase { display: inline-block; padding: 22px 30px; border-radius: 24px; font-weight: 800; font-size: 54px; }
    .frase.ruim { background: rgba(255,77,94,0.18); color: #fff; border: 3px solid ${C.vermelho}; }
    .frase.boa { background: #fff; color: ${C.marinho}; }
    .seta { font-size: 70px; font-weight: 900; margin: 14px 0; color: ${C.claro}; }
    .balao { position: absolute; padding: 26px 34px; border-radius: 34px; font-weight: 800; font-size: 56px; background: #fff; color: ${C.marinho}; box-shadow: 0 18px 40px rgba(0,0,0,0.25); white-space: nowrap; }
    #c1 .balao.b-dir { left: 200px; top: 300px; border-bottom-left-radius: 8px; }
    #c1 .balao.b-esq { right: 230px; top: 560px; border-bottom-right-radius: 8px; }
    .pessoa-l { position: absolute; left: 40px; top: 330px; } .pessoa-r { position: absolute; right: 60px; top: 520px; }
    .capa { font-weight: 900; font-size: 92px; line-height: 0.98; } .capa b { color: #fff; background: ${C.vermelho}; padding: 0 16px 6px; border-radius: 16px; }
    .pessoa-l span, .pessoa-r span { display: block; font-weight: 700; font-size: 34px; opacity: 0.85; }
    .degraus { position: relative; width: 600px; height: 260px; margin: 0 auto; }
    .degraus i { position: absolute; bottom: 0; width: 150px; border-radius: 14px 14px 0 0; background: rgba(255,255,255,0.9); display: block; }
    .bola { position: absolute; left: 95px; bottom: 80px; width: 40px; height: 40px; border-radius: 50%; background: ${C.verde}; }
    #c7 .balao.largo { position: relative; display: inline-block; margin-top: 40px; white-space: normal; width: 760px; min-height: 150px; font-size: 50px; line-height: 1.15; text-align: left; border-bottom-left-radius: 8px; }
    .post { margin: 40px auto 0; width: 760px; border-radius: 34px; background: #fff; color: ${C.marinho}; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); text-align: left; }
    .perfil { display: flex; align-items: center; gap: 18px; font-size: 40px; } .perfil i { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, ${C.royal}, ${C.claro}); display: block; }
    .comentario { position: relative; margin-top: 24px; border: 3px solid #d5def0; border-radius: 40px; padding: 18px 110px 18px 30px; font-weight: 900; font-size: 54px; min-height: 104px; }
    .cur { color: ${C.royal}; font-weight: 400; }
    .enviar { position: absolute; right: 16px; top: 12px; width: 80px; height: 80px; border-radius: 50%; background: ${C.royal}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 40px; }
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
`.replace(/motionPath: null, /g, ""));

fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 150px; width: 780px; top: 1120px; text-align: center; }
    .cx { display: inline-block; font-family: "Inter"; font-weight: 700; font-size: 50px; line-height: 1.3; letter-spacing: -0.03em; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.35); }
    .pw { display: inline-block; }
    .chave { background: #fff; color: ${C.royal}; font-weight: 900; padding: 0 14px 4px; border-radius: 12px; text-shadow: none; }
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

// ---- efeitos ----
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
const sons = [["pop", T("corrigiu") - 0.05, 0.14], ["pop", T("humilhado") - 0.05, 0.14], ["whoosh-short", s2 - 0.1, 0.1], ["whoosh-short", s3 - 0.1, 0.1],
  ["click-soft", T("é o jeito") - 0.05, 0.14], ["pop", T("jeito") - 0.08, 0.14], ["whoosh-short", s5 - 0.1, 0.1], ["click", T("particular") + 0.5, 0.12],
  ["whoosh-short", s6 - 0.1, 0.1], ["click-soft", T("por o pedido") - 0.1, 0.14], ["ping", T("pedido") - 0.05, 0.1], ["whoosh-short", s7 - 0.1, 0.1],
  ["typing", T("O que a gente"), 0.08], ["whoosh", T("mostra o caminho") - 0.1, 0.1], ["whoosh-short", s9 - 0.1, 0.1], ["key-press", T("Comenta") + 0.1, 0.12],
  ["click", T("Comenta") + 0.75, 0.14], ["sparkle", T("bronca que eu"), 0.1]];
let audios = `      <audio id="voz" class="clip" src="assets/narracao.wav" data-start="0" data-duration="${f(durVoz)}" data-track-index="4" data-volume="1"></audio>\n`;
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(Math.max(0, t))}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${5 + (i % 2)}" data-volume="${v}"></audio>\n`;
});

fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.marinho}; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: linear-gradient(170deg, #0B2466 0%, #123A9E 45%, #1E5BFF 100%); }
      #luz { position: absolute; width: 1400px; height: 1400px; left: -300px; top: -200px; border-radius: 50%;
        background: radial-gradient(circle, rgba(170,205,255,0.55) 0%, rgba(120,170,255,0.18) 40%, rgba(30,91,255,0) 70%); }
      #luz2 { position: absolute; width: 1100px; height: 1100px; left: 300px; top: 1100px; border-radius: 50%;
        background: radial-gradient(circle, rgba(10,30,74,0.55) 0%, rgba(10,30,74,0) 70%); }
      #cenas, #legendas { position: absolute; inset: 0; }
      #legendas { z-index: 3; } #cenas { z-index: 2; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="luz" data-layout-ignore></div>
      <div id="luz2" data-layout-ignore></div>
      <div id="cenas" data-composition-id="cenas" data-composition-src="compositions/cenas.html" data-start="0" data-duration="${f(DUR)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${f(DUR)}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#luz", { x: 0, y: 0 }, { keyframes: [{ x: 420, y: 260, duration: ${f(DUR / 2)} }, { x: 120, y: 620, duration: ${f(DUR / 2)} }], ease: "sine.inOut" }, 0);
      tl.fromTo("#luz2", { x: 0, y: 0 }, { x: -380, y: -200, duration: ${f(DUR)}, ease: "sine.inOut" }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${pal.length} palavras do roteiro, ${grupos.length} blocos de legenda, ${sons.length} efeitos, duração ${DUR}s`);
