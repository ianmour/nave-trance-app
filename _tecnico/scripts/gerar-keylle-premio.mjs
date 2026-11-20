#!/usr/bin/env node
// Keylle — Prêmio Histórias de Quem Atende (Sebrae). Vídeo deitado 1920x1080, ele à direita.
// Legenda + palavras-chave na LATERAL ESQUERDA (espaço que ele deixou). Texto = o que ele escreveu
// (palavras entre *asteriscos* = marcadas por ele). Tempos vêm da transcrição (whisper) por alinhamento.
// Uso: node gerar-keylle-premio.mjs <pasta-do-projeto> <texto.md> <transcricao.json do whisper>
import fs from "node:fs";
import path from "node:path";

const [P, TXT, TJ] = process.argv.slice(2);
const W = 1920, H = 1080;
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const DUR = +process.env.DUR;

// ---- texto: só os parágrafos (pula título e linhas de instrução) ----
const linhas = fs.readFileSync(TXT, "utf8").split("\n").filter((l) => l.trim() && !/^#|^Pedido:|^Palavras entre/.test(l));
const pal = []; let dentro = false, chaveId = -1;
for (const tok of linhas.join(" ").split(/\s+/).filter(Boolean)) {
  const abre = tok.startsWith("*"), fecha = /\*[.,!?;:]*$/.test(tok);
  if (abre) { dentro = true; chaveId++; }
  pal.push({ texto: tok.replace(/\*/g, ""), chave: dentro ? chaveId : -1 });
  if (fecha) dentro = false;
}

// ---- alinhamento com a transcrição (programação dinâmica) ----
const trans = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription
  .map((t) => ({ texto: t.text.trim(), ini: t.offsets.from / 1000, fim: t.offsets.to / 1000 })).filter((t) => nrm(t.texto));
const a = pal.map((p) => nrm(p.texto)), b = trans.map((t) => nrm(t.texto));
const n = a.length, m = b.length, D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
const casou = new Array(n).fill(false);
for (let i = n, j = m; i > 0 && j > 0;) {
  const c = a[i - 1] === b[j - 1] ? 0 : 1;
  if (D[i][j] === D[i - 1][j - 1] + c) { pal[i - 1].ini = trans[j - 1].ini; pal[i - 1].fim = trans[j - 1].fim; casou[i - 1] = !c; i--; j--; }
  else if (D[i][j] === D[i - 1][j] + 1) i--; else j--;
}
for (let i = 0; i < n; i++) if (pal[i].ini == null) {
  const ant = pal.slice(0, i).reverse().find((p) => p.ini != null), pos = pal.slice(i + 1).find((p) => p.ini != null);
  const t = ant && pos ? (ant.fim + pos.ini) / 2 : ant ? ant.fim : pos.ini;
  pal[i].ini = t; pal[i].fim = t + 0.15;
}
const ok = casou.filter(Boolean).length;
console.error(`alinhamento: ${ok}/${n} palavras iguais (${(100 * ok / n).toFixed(1)}%), distância ${D[n][m]}`);
fs.writeFileSync(path.join(P, "alinhamento.json"), JSON.stringify(pal.map((p, i) => ({ ...p, igual: casou[i] })), null, 1));

// ---- blocos de legenda (até 4 palavras; quebra em pontuação ou pausa) ----
const grupos = []; let g = [];
pal.forEach((p, i) => {
  const prox = pal[i + 1];
  g.push(p);
  if (!prox || /[.,!?;:]$/.test(p.texto) || prox.ini - p.fim >= 0.35 || g.length === 4) { grupos.push(g); g = []; }
});
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const ini = Math.max(0.02, gr[0].ini - 0.05), prox = grupos[i + 1];
  const fim = Math.min(prox ? prox[0].ini - 0.04 : DUR, gr[gr.length - 1].fim + 0.6, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(ini)}" data-duration="${f(Math.max(0.12, fim - ini))}" data-track-index="0"><div class="cx">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw${p.chave >= 0 ? " ch" : ""}">${esc(p.texto)}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += `      tl.fromTo("#lg${i}w${j}", { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`; });
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.08 }, ${f(Math.max(ini + 0.05, fim - 0.08))});\n`;
});

// ---- palavras-chave grandes (acima da legenda, na mesma coluna) ----
const chaves = [];
pal.forEach((p) => { if (p.chave < 0) return; const c = chaves.find((k) => k.id === p.chave); c ? (c.ps.push(p)) : chaves.push({ id: p.chave, ps: [p] }); });
let kh = "", kj = "";
chaves.forEach((c, i) => {
  const t0 = c.ps[0].ini - 0.06, prox = chaves[i + 1];
  const t1 = Math.min(prox ? prox.ps[0].ini - 0.12 : DUR, c.ps[c.ps.length - 1].fim + 2.6, DUR);
  const txt = c.ps.map((p) => p.texto.replace(/[.,!?;:]+$/, "")).join(" ").toUpperCase();
  const tam = txt.length > 22 ? 84 : txt.length > 13 ? 100 : 124;
  kh += `      <div id="k${i}" class="clip chave" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="1"><div class="kx" style="font-size:${tam}px">${esc(txt)}</div><i class="kl"></i></div>\n`;
  kj += `      tl.fromTo("#k${i} .kx", { opacity: 0, y: 26, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }, ${f(t0)});\n`;
  kj += `      tl.fromTo("#k${i} .kl", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, ${f(t0 + 0.12)});\n`;
  kj += `      tl.to("#k${i}", { opacity: 0, y: -14, duration: 0.25, ease: "power2.in" }, ${f(t1 - 0.25)});\n`;
});

fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 110px; width: 640px; top: 600px; }
    .cx { font-family: "Inter"; font-weight: 500; font-size: 50px; line-height: 1.16; letter-spacing: -0.03em; color: #fff;
      text-shadow: 0 2px 14px rgba(0,0,0,0.45); }
    .pw { display: inline-block; } .pw.ch { font-weight: 700; }
    .chave { position: absolute; left: 106px; width: 660px; bottom: 500px; }
    .kx { font-family: "Inter"; font-weight: 800; line-height: 0.95; letter-spacing: -0.045em; color: #fff; text-shadow: 0 6px 30px rgba(0,0,0,0.35); }
    .kl { display: block; width: 120px; height: 7px; margin-top: 22px; border-radius: 4px; background: #fff; transform-origin: left center; }
  </style>
  <div id="root" data-composition-id="legendas" data-width="${W}" data-height="${H}">
${kh}${lh}  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${kj}${lj}      window.__timelines["legendas"] = tl;
    })();
  </script>
</template>
`);

fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #sombra { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.30) 30%, rgba(0,0,0,0.08) 46%, rgba(0,0,0,0) 56%); }
      #legendas { position: absolute; inset: 0; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <video id="fundo" class="clip" src="assets/video.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      <div id="sombra" class="clip" data-start="0" data-duration="${DUR}" data-track-index="1" data-layout-allow-occlusion></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${grupos.length} blocos de legenda, ${chaves.length} palavras-chave, ${DUR}s`);
