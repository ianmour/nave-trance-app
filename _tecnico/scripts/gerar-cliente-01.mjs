#!/usr/bin/env node
// ianmour-01 — versão CLIENTE (neutra), seguindo estilo/guia-de-estilo.md.
// Forma tema deste vídeo: linhas finas âmbar. Transição: brilho de luz quente.
// Uso: node gerar-cliente-01.mjs <pasta-do-projeto>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const P = process.argv[2];
const W = 1080, H = 1920;
const AMBAR = "#E9A35B";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const quadros = parseInt(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path.join(P, "assets/corte.mp4")], { encoding: "utf8" }));
const DUR = +(quadros / 30).toFixed(4);
const palavras = JSON.parse(fs.readFileSync(path.join(P, "assets/transcript.json"), "utf8"))
  .map((p) => ({ texto: p.text.trim(), ini: p.start, fim: p.end }))
  .filter((p) => p.texto && /[\p{L}\p{N}]/u.test(p.texto));

const CSS = `
    .t { position: absolute; top: 300px; overflow: visible; font-family: "Inter"; color: #fff; letter-spacing: -0.03em; }
    .esq { left: 130px; text-align: left; }
    .dir { right: 192px; text-align: right; }
    .meio { left: 140px; width: 800px; text-align: center; }
    .baixo { top: 1086px; }
    .peq { display: block; font-weight: 700; font-size: 46px; line-height: 1.1; text-shadow: 0 2px 14px rgba(0,0,0,0.55); white-space: nowrap; }
    .gde { display: block; font-weight: 900; font-size: 128px; line-height: 0.95; text-transform: uppercase; text-shadow: 0 4px 24px rgba(0,0,0,0.5); white-space: nowrap; }
    .linha { display: block; height: 4px; width: 260px; background: ${AMBAR}; margin: 14px 0 12px; transform-origin: left center; }
    .dir .linha { margin-left: auto; transform-origin: right center; }
    .meio .linha { margin-left: auto; margin-right: auto; transform-origin: center; }
`;
function cena(id, ini, fim, montar) {
  const r = (t) => f(t - ini);
  const els = [], js = [];
  const api = {
    bloco(eid, t0, t1, cls, html) { els.push(`      <div id="${id}-${eid}" class="clip t ${cls}" data-start="${r(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" data-layout-allow-overlap>${html}</div>`); },
    tw(code) { js.push("      " + code.replace(/@\{([\d.]+)\}/g, (_, t) => r(+t))); },
  };
  montar(api);
  fs.writeFileSync(path.join(P, "compositions", `${id}.html`), `<template>
  <style>
    #root { position: absolute; inset: 0; }${CSS}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${els.join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`);
  return { id, ini, fim };
}
// entradas suaves: desfocado -> em foco; linha âmbar desenhando
const foco = (s, t) => `tl.fromTo("${s}", { opacity: 0, y: 14, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.32, ease: "power3.out" }, @{${t}});`;
const risco = (s, t) => `tl.fromTo("${s}", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, @{${t}});`;
const sai = (s, t) => `tl.to("${s}", { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, @{${t}});`;

fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
const cenas = [];

cenas.push(cena("abertura", 0, 6.4, ({ bloco, tw }) => {
  bloco("a", 0.18, 2.8, "esq", `<span id="abertura-a1" class="peq">sua empresa precisa de</span><span id="abertura-a2" class="gde" style="font-size:112px">muito mais</span><span id="abertura-a3" class="linha"></span><span id="abertura-a4" class="peq">do que apenas aparecer.</span>`);
  tw(foco("#abertura-a1", 0.18)); tw(foco("#abertura-a2", 1.1)); tw(risco("#abertura-a3", 1.25)); tw(foco("#abertura-a4", 1.72));
  tw(sai("#abertura-a > *", 2.58));
  bloco("b", 2.92, 5.22, "dir", `<span id="abertura-b1" class="peq">ela precisa se</span><span id="abertura-b2" class="gde">conectar</span><span id="abertura-b3" class="linha"></span><span id="abertura-b4" class="peq">e despertar interesse</span>`);
  tw(foco("#abertura-b1", 2.92)); tw(foco("#abertura-b2", 3.51)); tw(risco("#abertura-b3", 3.66)); tw(foco("#abertura-b4", 4.12));
  tw(sai("#abertura-b > *", 5.0));
  bloco("c", 5.3, 6.38, "esq", `<span id="abertura-c1" class="peq">e conquistar</span><span id="abertura-c2" class="gde">clientes</span><span id="abertura-c3" class="linha"></span>`);
  tw(foco("#abertura-c1", 5.3)); tw(foco("#abertura-c2", 5.89)); tw(risco("#abertura-c3", 6.0));
  tw(sai("#abertura-c > *", 6.18));
}));

const lista = [["ideias", 8.04], ["imagens", 8.5], ["histórias", 9.31], ["emoções", 10.02], ["marcas", 10.79]];
cenas.push(cena("trabalho", 6.4, 13.07, ({ bloco, tw }) => {
  bloco("a", 6.58, 11.18, "esq", `<span id="trabalho-a1" class="peq">meu trabalho é transformar</span><span id="trabalho-a2" class="linha" style="width:180px"></span>${lista.map(([w], i) => `<span id="trabalho-l${i}" class="peq" style="font-size:62px;font-weight:900;line-height:1.08"><span style="color:${AMBAR};font-size:28px;font-weight:700;vertical-align:middle;margin-right:14px">0${i + 1}</span>${w}</span>`).join("")}`);
  tw(foco("#trabalho-a1", 6.58)); tw(risco("#trabalho-a2", 7.32));
  lista.forEach(([, t], i) => tw(foco(`#trabalho-l${i}`, t)));
  tw(sai("#trabalho-a > *", 11.0));
  bloco("b", 11.25, 13.04, "esq", `<span id="trabalho-b1" class="peq">experiências que conectam</span><span id="trabalho-b2" class="gde">pessoas</span><span id="trabalho-b3" class="linha"></span>`);
  tw(foco("#trabalho-b1", 11.25)); tw(foco("#trabalho-b2", 12.53)); tw(risco("#trabalho-b3", 12.62));
  tw(sai("#trabalho-b > *", 12.86));
}));

cenas.push(cena("nome", 13.07, 15.7, ({ bloco, tw }) => {
  bloco("a", 13.38, 15.62, "esq", `<span id="nome-a1" class="linha" style="width:120px;margin-top:0"></span><span id="nome-a2" class="gde" style="font-size:88px">Ricardo Lucas</span><span id="nome-a3" class="peq" style="margin-top:12px;font-weight:400;font-size:42px">Publicitário &amp; Video Maker</span>`);
  tw(risco("#nome-a1", 13.38)); tw(foco("#nome-a2", 13.46)); tw(foco("#nome-a3", 14.3));
  tw(sai("#nome-a > *", 15.42));
}));

cenas.push(cena("video", 15.7, 19.25, ({ bloco, tw }) => {
  bloco("a", 15.95, 17.98, "dir", `<span id="video-a1" class="peq">através da produção e edição</span><span id="video-a2" class="gde">de vídeos</span><span id="video-a3" class="linha"></span>`);
  tw(foco("#video-a1", 15.95)); tw(foco("#video-a2", 17.41)); tw(risco("#video-a3", 17.5));
  tw(sai("#video-a > *", 17.78));
  bloco("b", 18.04, 19.22, "esq", `<span id="video-b1" class="peq">que eu transformo o</span><span id="video-b2" class="gde">seu negócio</span><span id="video-b3" class="linha"></span>`);
  tw(foco("#video-b1", 18.04)); tw(foco("#video-b2", 18.84)); tw(risco("#video-b3", 18.92));
  tw(sai("#video-b > *", 19.04));
}));

cenas.push(cena("fim", 19.25, DUR, ({ bloco, tw }) => {
  bloco("a", 19.36, DUR, "meio baixo", `<span id="fim-a1" class="peq">em uma experiência</span><span id="fim-a2" class="linha" style="width:200px"></span><span class="gde" style="font-size:112px"><span id="fim-v">visual</span> <span id="fim-u">única</span></span>`);
  tw(foco("#fim-a1", 19.36)); tw(risco("#fim-a2", 19.6)); tw(foco("#fim-v", 20.17)); tw(foco("#fim-u", 20.52));
}));

// ---------- Legenda: branca, uma letra só, até 2 linhas, palavra-chave maior ----------
const CHAVES = new Set(["aparecer", "conectar", "clientes", "transformar", "pessoas", "videos", "negocio", "unica", "experiencias", "experiencia"]);
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
const escondida = [[6.55, 11.2], [13.2, 15.7], [19.25, 99]];
const dentro = (t) => escondida.some(([a, b]) => t >= a && t < b);
const grupos = [];
let g = [];
palavras.forEach((p, i) => {
  if (dentro(p.ini)) { if (g.length) { grupos.push(g); g = []; } return; }
  g.push(p);
  const prox = palavras[i + 1];
  if (!prox || /[.!?;…]$/.test(p.texto) || (/,$/.test(p.texto) && g.length >= 3) || prox.ini - p.fim >= 0.25 || g.length === 6 || dentro(prox.ini)) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
grupos.forEach((gr, i) => {
  const prox = grupos[i + 1];
  gr.ini = Math.max(i === 0 ? 0.1 : 0, gr[0].ini - 0.05);
  let fim = gr[gr.length - 1].fim + 0.4;
  for (const [a] of escondida) if (a > gr.ini) fim = Math.min(fim, a);
  if (prox) fim = Math.min(fim, prox[0].ini - 0.04);
  gr.fim = Math.max(gr.ini + 0.15, Math.min(fim, DUR));
});
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const corte = gr.length > 3 ? Math.ceil(gr.length / 2) : gr.length;
  const pal = (p, j) => `<span id="lg${i}w${j}" class="pal${CHAVES.has(nrm(p.texto)) ? " chave" : ""}">${esc(p.texto)}</span>`;
  const l1 = gr.slice(0, corte).map((p, j) => pal(p, j)).join(" ");
  const l2 = gr.slice(corte).map((p, j) => pal(p, j + corte)).join(" ");
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(gr.ini)}" data-duration="${f(gr.fim - gr.ini)}" data-track-index="0"><div class="caixa"><div class="ln">${l1}</div>${l2 ? `<div class="ln">${l2}</div>` : ""}</div></div>\n`;
  gr.forEach((p, j) => { lj += `      tl.fromTo("#lg${i}w${j}", { opacity: 0, y: 8, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.18, ease: "power2.out" }, ${f(p.ini)});\n`; });
  lj += `      tl.to("#lg${i} .caixa", { opacity: 0, duration: 0.1, ease: "power2.in" }, ${f(gr.fim - 0.1)});\n`;
});
fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 170px; width: 740px; bottom: 690px; text-align: center; overflow: visible; }
    .caixa { display: inline-block; font-family: "Inter"; font-weight: 700; font-size: 48px; line-height: 1.12; letter-spacing: -0.035em; color: #fff;
      text-shadow: 0 0 2px rgba(0,0,0,0.55), 0 3px 14px rgba(0,0,0,0.55); }
    .ln { white-space: nowrap; }
    .pal { display: inline-block; }
    .chave { font-weight: 900; font-size: 64px; }
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

// ---------- Poucos efeitos, bem baixos ----------
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const sons = [["whoosh-short.mp3", 6.3, 0.57, 0.14], ["whoosh-short.mp3", 12.98, 0.57, 0.14], ["whoosh-short.mp3", 19.2, 0.57, 0.14]];
let audios = "";
sons.forEach(([arq, t, d, v], i) => {
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t)}" data-duration="${f(d)}" data-track-index="5" data-volume="${v}"></audio>\n`;
});

// ---------- Câmera: reenquadramentos discretos, empurrão lento, cartão no final ----------
const cam = [];
const set = (t, v) => cam.push(`tl.set("#camera", ${v}, ${f(t)});`);
const to = (t, d, v, ease = "none") => cam.push(`tl.to("#camera", { ...${v}, duration: ${d}, ease: "${ease}" }, ${f(t)});`);
const brilho = (t) => cam.push(`tl.to("#brilho", { keyframes: [{ opacity: 0.85, x: 0, duration: 0.22 }, { opacity: 0, x: 200, duration: 0.42 }], ease: "power1.inOut" }, ${f(t)});`);
set(0, `{ scale: 1 }`); to(0, 2.86, `{ scale: 1.04 }`);
set(2.86, `{ scale: 1.1 }`); to(2.86, 2.47, `{ scale: 1.13 }`);
set(5.33, `{ scale: 1 }`); to(5.33, 1.07, `{ scale: 1.03 }`);
brilho(6.22); set(6.4, `{ scale: 1 }`); to(6.4, 6.67, `{ scale: 1.06 }`);
brilho(12.9); set(13.07, `{ scale: 1.02 }`); to(13.07, 2.63, `{ scale: 1.05 }`);
set(15.7, `{ scale: 1.1 }`); to(15.7, 1.71, `{ scale: 1.13 }`);
set(17.41, `{ scale: 1 }`); to(17.41, 1.84, `{ scale: 1.03 }`);
to(19.25, 0.55, `{ scale: 0.5, y: -270, borderRadius: 44 }`, "power3.inOut");
cam.push(`tl.fromTo("#moldura", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 19.6);`);

const hosts = cenas.map((c) => `      <div id="${c.id}" data-composition-id="${c.id}" data-composition-src="compositions/${c.id}.html" data-start="${f(c.ini)}" data-duration="${f(c.fim - c.ini)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`).join("\n");
let grade = "";
const idx = path.join(P, "index.html");
if (fs.existsSync(idx)) { const m = fs.readFileSync(idx, "utf8").match(/data-color-grading=("[^"]*"|'[^']*')/); if (m) grade = " " + m[0]; }
fs.writeFileSync(idx, `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #14110f; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #14110f; }
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 40%; z-index: 1; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #moldura { position: absolute; left: 270px; top: 114px; width: 540px; height: 960px; border: 3px solid ${AMBAR}; border-radius: 26px; opacity: 0; z-index: 2; pointer-events: none; }
      #brilho { position: absolute; inset: -200px; z-index: 4; opacity: 0; pointer-events: none; mix-blend-mode: screen;
        background: radial-gradient(ellipse at 70% 35%, rgba(255,186,110,0.95) 0%, rgba(255,120,40,0.55) 30%, rgba(255,90,20,0) 65%); }
${cenas.map((c) => `      #${c.id} { position: absolute; inset: 0; z-index: 3; }`).join("\n")}
      #legendas { position: absolute; inset: 0; z-index: 5; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo"${grade} class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="moldura" data-layout-ignore></div>
      <div id="brilho" data-layout-ignore data-layout-allow-overflow></div>
${hosts}
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      gsap.set("#camera", { scale: 1, y: 0, borderRadius: 0 });
      gsap.set("#brilho", { opacity: 0, x: -220 });
      gsap.set("#moldura", { opacity: 0 });
      const tl = gsap.timeline({ paused: true });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${cenas.length} cenas, ${grupos.length} blocos de legenda, ${sons.length} efeitos, ${DUR}s`);
