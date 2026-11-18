#!/usr/bin/env node
// Monta o projeto HyperFrames de um vídeo cortado: vídeo + legenda palavra por palavra +
// palavras grandes (destaques) + zoom nos momentos fortes. Identidade ianmour.
// Uso: node _tecnico/scripts/gerar-legendado.mjs <pasta-do-projeto> <destaques.json>
// O projeto precisa ter assets/corte.mp4 e assets/transcript.json (npx hyperframes transcribe).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [proj, destaquesArq] = process.argv.slice(2);
if (!proj || !destaquesArq) { console.log("Uso: gerar-legendado.mjs <projeto> <destaques.json>"); process.exit(1); }

const COR = { rosa: "#FC3B7F", creme: "#FEF1CF", azul: "#0032A8" };
const W = 1080, H = 1920;

const palavras = JSON.parse(fs.readFileSync(path.join(proj, "assets/transcript.json"), "utf8"))
  .map((p) => ({ texto: p.text.trim(), ini: p.start, fim: p.end }))
  .filter((p) => p.texto && /[\p{L}\p{N}]/u.test(p.texto));
const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(proj, "assets/corte.mp4")], { encoding: "utf8" }));
// duração exata pela contagem de quadros da imagem
const quadros = parseInt(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path.join(proj, "assets/corte.mp4")], { encoding: "utf8" }));
const DUR = +(quadros / 30).toFixed(4);
const destaques = JSON.parse(fs.readFileSync(destaquesArq, "utf8"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f = (n) => (+n).toFixed(3);

// ---------- Grupos de legenda: no máximo 3 palavras ----------
const grupos = [];
let g = [];
palavras.forEach((p, i) => {
  g.push(p);
  const prox = palavras[i + 1];
  const quebra = !prox || /[.,!?;:…]$/.test(p.texto) || prox.ini - p.fim >= 0.15 || g.length === 3;
  if (quebra) { grupos.push(g); g = []; }
});
grupos.forEach((gr, i) => {
  const prox = grupos[i + 1];
  gr.ini = Math.max(i === 0 ? 0.1 : 0, gr[0].ini - 0.05);
  const fimNatural = gr[gr.length - 1].fim + 0.35;
  gr.fim = Math.min(prox ? prox[0].ini - 0.05 : DUR, fimNatural, DUR);
  if (gr.fim <= gr.ini + 0.1) gr.fim = gr.ini + 0.1;
});
// tamanho da letra para caber na largura segura (820 px)
const tamanho = (txt, base, larguraLetra, largura = 620) => Math.max(40, Math.min(base, Math.floor(largura / (txt.length * larguraLetra))));

let legHtml = "", legJs = "";
grupos.forEach((gr, i) => {
  const txt = gr.map((p) => p.texto).join(" ");
  const fs_ = tamanho(txt, 62, 0.6, 600);
  legHtml += `      <div id="lg${i}" class="clip grupo" data-start="${f(gr.ini)}" data-duration="${f(gr.fim - gr.ini)}" data-track-index="0"><div class="linha" style="font-size:${fs_}px">${gr
    .map((p, j) => `<span id="lg${i}w${j}" class="pal">${esc(p.texto)}</span>`)
    .join(" ")}</div></div>\n`;
  gr.forEach((p, j) => {
    const id = `#lg${i}w${j}`;
    const fimAtiva = j < gr.length - 1 ? gr[j + 1].ini : Math.min(p.fim + 0.15, gr.fim);
    legJs += `      tl.fromTo("${id}", { opacity: 0, y: 14, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power3.out" }, ${f(p.ini)});\n`;
    legJs += `      tl.set("${id}", { color: "${COR.rosa}" }, ${f(p.ini)});\n`;
    legJs += `      tl.set("${id}", { color: "${COR.creme}" }, ${f(fimAtiva)});\n`;
  });
  legJs += `      tl.to("#lg${i} .linha", { opacity: 0, duration: 0.08, ease: "power2.in" }, ${f(gr.fim - 0.08)});\n`;
});

const legendas = `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 120px; width: 660px; bottom: 690px; text-align: center; overflow: visible; }
    .linha {
      display: inline-block; line-height: 1.15;
      font-family: "Poppins"; font-weight: 700; color: ${COR.creme};
      text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 0 #000, 0 6px 20px rgba(0,0,0,0.75);
    }
    .pal { display: inline-block; }
  </style>
  <div id="root" data-composition-id="legendas" data-width="${W}" data-height="${H}">
${legHtml}  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${legJs}      window.__timelines["legendas"] = tl;
    })();
  </script>
</template>
`;

// ---------- Destaques: palavra grande + linha pequena ----------
let desHtml = "", desJs = "", zoomJs = "";
destaques.forEach((d, i) => {
  const grande = d.tamanho || tamanho(d.grande, 112, 0.9, 720);
  const iniGrande = d.grandeIni ?? d.ini + (d.pequeno ? 0.06 : 0);
  desHtml += `      <div id="dt${i}" class="clip destaque" data-start="${f(d.ini)}" data-duration="${f(d.fim - d.ini)}" data-track-index="0">
        ${d.pequeno ? `<div id="dt${i}p" class="pequeno">${esc(d.pequeno)}</div>` : ""}
        <div id="dt${i}g" class="grande" style="font-size:${grande}px">${esc(d.grande)}</div>
      </div>\n`;
  if (d.pequeno) desJs += `      tl.fromTo("#dt${i}p", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.18, ease: "power3.out" }, ${f(d.ini)});\n`;
  desJs += `      tl.fromTo("#dt${i}g", { opacity: 0, scale: 1.55 }, { opacity: 1, scale: 1, duration: 0.24, ease: "back.out(2.2)" }, ${f(iniGrande)});\n`;
  desJs += `      tl.to("#dt${i} > div", { opacity: 0, y: -10, duration: 0.14, ease: "power2.in" }, ${f(d.fim - 0.14)});\n`;
  if (d.zoom) {
    zoomJs += `      tl.to("#enquadro", { scale: 1.06, duration: 0.25, ease: "power3.out" }, ${f(d.ini)});\n`;
    zoomJs += `      tl.to("#enquadro", { scale: 1, duration: 0.3, ease: "power2.inOut" }, ${f(d.fim - 0.1)});\n`;
  }
});

const destaquesHtml = `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .destaque { position: absolute; left: 120px; width: 768px; top: 296px; text-align: center; overflow: visible; }
    .pequeno {
      display: inline-block; margin-bottom: 6px; padding: 5px 18px 7px;
      background: ${COR.azul}; color: ${COR.creme};
      font-family: "Poppins"; font-style: italic; font-weight: 700; font-size: 38px; line-height: 1.1;
    }
    .grande {
      display: block; white-space: nowrap; font-family: "Archivo Black"; line-height: 0.95; letter-spacing: -0.01em;
      text-transform: uppercase; color: ${COR.rosa};
      text-shadow: 5px 5px 0 ${COR.azul}, -2px -2px 0 ${COR.azul}, 2px -2px 0 ${COR.azul}, -2px 2px 0 ${COR.azul}, 0 10px 34px rgba(0,0,0,0.6);
    }
  </style>
  <div id="root" data-composition-id="destaques" data-width="${W}" data-height="${H}">
${desHtml}  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${desJs}      window.__timelines["destaques"] = tl;
    })();
  </script>
</template>
`;

const index = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #enquadro { position: absolute; inset: 0; transform-origin: 50% 38%; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #legendas, #destaques { position: absolute; inset: 0; }
      #destaques { z-index: 2; }
      #legendas { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="enquadro">
        <video id="fundo" class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="destaques" data-composition-id="destaques" data-composition-src="compositions/destaques.html" data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
    </div>
    <script>
      gsap.set("#enquadro", { scale: 1 });
      const tl = gsap.timeline({ paused: true });
${zoomJs}      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

fs.mkdirSync(path.join(proj, "compositions"), { recursive: true });
// preserva a cor (data-color-grading) se ela já tiver sido aplicada antes
const idxArq = path.join(proj, "index.html");
let indexFinal = index;
if (fs.existsSync(idxArq)) {
  const m = fs.readFileSync(idxArq, "utf8").match(/data-color-grading=("[^"]*"|'[^']*')/);
  if (m) indexFinal = index.replace('id="fundo" class="clip"', `id="fundo" ${m[0]} class="clip"`);
}
fs.writeFileSync(idxArq, indexFinal);
fs.writeFileSync(path.join(proj, "compositions/legendas.html"), legendas);
fs.writeFileSync(path.join(proj, "compositions/destaques.html"), destaquesHtml);
console.log(`ok: ${palavras.length} palavras, ${grupos.length} grupos de legenda, ${destaques.length} destaques, duração ${DUR}s`);
console.log(grupos.map((gr) => `${f(gr.ini)}-${f(gr.fim)} ${gr.map((p) => p.texto).join(" ")}`).join("\n"));
