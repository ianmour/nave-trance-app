#!/usr/bin/env node
// ianmour-01 v2: edição animada no estilo das referências.
// Gera index.html + compositions/*.html a partir de assets/transcript.json.
// Uso: node gerar-ianmour-01-v2.mjs <pasta-do-projeto>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const P = process.argv[2];
const C = { rosa: "#FC3B7F", creme: "#FEF1CF", azul: "#0032A8" };
const W = 1080, H = 1920;
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const quadros = parseInt(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path.join(P, "assets/corte.mp4")], { encoding: "utf8" }));
const DUR = +(quadros / 30).toFixed(4);
const palavras = JSON.parse(fs.readFileSync(path.join(P, "assets/transcript.json"), "utf8"))
  .map((p) => ({ texto: p.text.trim(), ini: p.start, fim: p.end }))
  .filter((p) => p.texto && /[\p{L}\p{N}]/u.test(p.texto));

// ---------------- estilos de texto reutilizáveis ----------------
const CSS_TEXTO = `
    .bloco { position: absolute; left: 150px; width: 780px; text-align: center; overflow: visible; }
    .gotico { font-family: "League Gothic"; text-transform: uppercase; line-height: 0.9; letter-spacing: 0.01em; white-space: nowrap; display: inline-block; }
    .italico { font-family: "Playfair Display"; font-style: italic; font-weight: 700; line-height: 1.05; white-space: nowrap; display: inline-block; }
    .creme { color: ${C.creme}; }
    .rosa { color: ${C.rosa}; }
    .azul { color: ${C.azul}; }
    .sombra { text-shadow: 0 6px 26px rgba(0,0,0,0.55); }
    .solida-azul { text-shadow: 6px 6px 0 ${C.azul}, 0 10px 30px rgba(0,0,0,0.5); }
    .solida-rosa { text-shadow: 6px 6px 0 ${C.rosa}, 0 10px 30px rgba(0,0,0,0.5); }
    .etiqueta { display: inline-block; padding: 6px 22px 10px; border-radius: 14px; font-family: "Poppins"; font-weight: 800; white-space: nowrap; }
`;

// cena: cria arquivo de sub-composição com tempos absolutos convertidos para locais
function cena(id, ini, fim, montar, cssExtra = "") {
  const r = (t) => f(t - ini);
  const els = [];
  const js = [];
  const api = {
    // elemento temporizado
    el(eid, t0, t1, html, estilo = "", cls = "bloco", attrs = "") {
      els.push(`      <div id="${id}-${eid}" class="clip ${cls}" data-start="${r(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}"${attrs ? " " + attrs : ""}>${html}</div>`);
    },
    tw(code) { js.push("      " + code.replace(/@\{([\d.]+)\}/g, (_, t) => r(+t))); },
    sel: (s) => `#${id}-${s}`,
  };
  montar(api);
  const html = `<template>
  <style>
    #root { position: absolute; inset: 0; }${CSS_TEXTO}${cssExtra}
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
`;
  fs.writeFileSync(path.join(P, "compositions", `${id}.html`), html);
  return { id, ini, fim };
}

// animações prontas (strings GSAP); s = seletor completo, t = tempo absoluto
const A = {
  sobe: (s, t) => `tl.fromTo("${s}", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.28, ease: "power4.out" }, @{${t}});`,
  daEsq: (s, t) => `tl.fromTo("${s}", { opacity: 0, x: -160 }, { opacity: 1, x: 0, duration: 0.3, ease: "power4.out" }, @{${t}});`,
  daDir: (s, t) => `tl.fromTo("${s}", { opacity: 0, x: 160 }, { opacity: 1, x: 0, duration: 0.3, ease: "power4.out" }, @{${t}});`,
  bate: (s, t) => `tl.fromTo("${s}", { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.out" }, @{${t}});`,
  estica: (s, t) => `tl.fromTo("${s}", { opacity: 0, scaleX: 2.6, scaleY: 0.4, filter: "blur(10px)" }, { opacity: 1, scaleX: 1, scaleY: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out" }, @{${t}});`,
  pula: (s, t, rot = 0) => `tl.fromTo("${s}", { opacity: 0, scale: 0, rotation: ${rot * 3} }, { opacity: 1, scale: 1, rotation: ${rot}, duration: 0.3, ease: "back.out(2.6)" }, @{${t}});`,
  borra: (s, t) => `tl.fromTo("${s}", { opacity: 0, filter: "blur(16px)", scale: 1.15 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.3, ease: "power3.out" }, @{${t}});`,
  sai: (s, t) => `tl.to("${s}", { opacity: 0, y: -30, duration: 0.1, ease: "power2.in" }, @{${t}});`,
  saiZoom: (s, t) => `tl.to("${s}", { opacity: 0, scale: 0.4, duration: 0.12, ease: "power2.in" }, @{${t}});`,
};

fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
const cenas = [];

// ---------------- Cena 1: gancho (0 – 2.86) ----------------
cenas.push(cena("gancho", 0, 2.86, ({ el, tw }) => {
  el("a", 0.05, 1.08, `<span class="gotico creme solida-azul" style="font-size:120px">A sua empresa</span><br><span id="gancho-a2" class="italico rosa sombra" style="font-size:58px">precisa de</span>`, "top:300px");
  tw(A.sobe("#gancho-a .gotico", 0.05));
  tw(A.daEsq("#gancho-a2", 0.64));
  tw(A.sai("#gancho-a > *", 0.98));
  el("b", 1.1, 2.18, `<span class="gotico rosa solida-azul" style="font-size:170px">Muito mais</span>`, "top:296px");
  tw(A.bate("#gancho-b span", 1.1));
  tw(A.saiZoom("#gancho-b span", 2.06));
  el("c", 2.2, 2.85, `<span class="gotico ca rosa" style="font-size:180px">Aparecer</span><span class="gotico cb azul" style="font-size:180px">Aparecer</span><span class="gotico cc creme sombra" style="font-size:180px">Aparecer</span>`, "top:292px", "bloco", "data-layout-allow-overlap");
  // glitch: três cópias que tremem e se juntam
  tw(`tl.fromTo("#gancho-c", { opacity: 0 }, { opacity: 1, duration: 0.04 }, @{2.2});`);
  [[-26, 22, 10, -16], [18, -20, -12, 14]].forEach((xs, k) => {
    const s = k === 0 ? "#gancho-c .ca" : "#gancho-c .cb";
    tw(`tl.fromTo("${s}", { x: ${xs[0]} }, { keyframes: [{ x: ${xs[1]}, duration: 0.05 }, { x: ${xs[2]}, duration: 0.05 }, { x: ${xs[3]}, duration: 0.05 }, { x: 0, duration: 0.08 }] , ease: "none" }, @{2.2});`);
  });
  tw(`tl.fromTo("#gancho-c .cc", { skewX: -18 }, { skewX: 0, duration: 0.22, ease: "power3.out" }, @{2.2});`);
  tw(A.sai("#gancho-c", 2.74));
}, `
    #gancho-c { height: 180px; }
    #gancho-c .gotico { position: absolute; left: 0; right: 0; }
    #gancho-c .ca { opacity: 0.85; mix-blend-mode: normal; }
    #gancho-c .cb { opacity: 0.85; }
`));

// ---------------- Cena 2: conectar / interesse / clientes (2.86 – 6.40) ----------------
cenas.push(cena("conexao", 2.86, 6.4, ({ el, tw }) => {
  el("a", 2.88, 3.48, `<span class="italico creme sombra" style="font-size:64px">ela precisa se</span>`, "top:320px");
  tw(A.borra("#conexao-a span", 2.88));
  tw(A.sai("#conexao-a span", 3.38));
  el("b", 3.5, 4.1, `<svg width="780" height="200" viewBox="0 0 780 200" style="position:absolute;left:0;top:-70px;overflow:visible">
          <line id="conexao-linha" x1="40" y1="100" x2="740" y2="100" stroke="${C.rosa}" stroke-width="8" stroke-linecap="round" stroke-dasharray="700" stroke-dashoffset="700"/>
          <circle id="conexao-p1" cx="40" cy="100" r="22" fill="${C.rosa}"/>
          <circle id="conexao-p2" cx="740" cy="100" r="22" fill="${C.azul}" stroke="${C.creme}" stroke-width="5"/>
        </svg><span class="gotico creme solida-azul" style="font-size:170px;position:relative">Conectar</span>`, "top:330px;height:200px", "bloco", "data-layout-allow-overlap");
  tw(A.pula("#conexao-p1", 3.5));
  tw(`tl.fromTo("#conexao-linha", { attr: { "stroke-dashoffset": 700 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.inOut" }, @{3.52});`);
  tw(A.pula("#conexao-p2", 3.86));
  tw(A.bate("#conexao-b .gotico", 3.52));
  tw(A.sai("#conexao-b > *", 4.0));
  el("c", 4.12, 5.3, `<span id="conexao-c1" class="italico rosa sombra" style="font-size:84px;margin-bottom:14px">despertar</span><br><span id="conexao-c2" class="etiqueta azul" style="background:${C.creme};font-family:'League Gothic';font-weight:400;font-size:130px;text-transform:uppercase;line-height:1">Interesse</span>`, "top:296px");
  tw(A.daEsq("#conexao-c1", 4.12));
  tw(A.pula("#conexao-c2", 4.67, -4));
  tw(A.sai("#conexao-c > *", 5.2));
  el("d", 5.33, 5.88, `<span class="italico creme sombra" style="font-size:76px">e conquistar</span>`, "top:320px");
  tw(A.daDir("#conexao-d span", 5.33));
  tw(A.sai("#conexao-d span", 5.79));
  el("e", 5.89, 6.39, `<span class="gotico rosa solida-azul" style="font-size:200px">Clientes</span>`, "top:296px");
  tw(A.bate("#conexao-e span", 5.89));
  tw(A.saiZoom("#conexao-e span", 6.27));
}));

// ---------------- Cena 3: trabalho + cartão rosa + pessoas (6.40 – 13.07) ----------------
const pilulas = [
  ["ideias", 8.04, 130, 520, -6], ["imagens", 8.5, 540, 720, 5], ["histórias", 9.31, 130, 930, -4],
  ["emoções", 10.02, 530, 1090, 6], ["marcas", 10.79, 340, 1150, -3],
];
cenas.push(cena("trabalho", 6.4, 13.07, ({ el, tw }) => {
  el("a", 6.58, 7.3, `<span class="italico creme sombra" style="font-size:70px">meu trabalho é</span>`, "top:320px");
  tw(A.borra("#trabalho-a span", 6.58));
  tw(A.sai("#trabalho-a span", 7.2));
  el("b", 7.32, 7.98, `<span class="gotico rosa solida-azul" style="font-size:180px">Transformar</span>`, "top:296px");
  tw(A.estica("#trabalho-b span", 7.32));
  tw(A.sai("#trabalho-b span", 7.88));
  // título do cartão rosa
  el("t", 8.0, 11.2, `<span class="gotico creme" style="font-size:96px;text-shadow:5px 5px 0 ${C.azul}">Transformar</span>`, "top:300px");
  tw(A.sobe("#trabalho-t span", 8.05));
  tw(A.sai("#trabalho-t span", 11.08));
  pilulas.forEach(([txt, t, x, y, rot], i) => {
    el(`p${i}`, t, 11.2, `<span class="etiqueta" style="background:${C.azul};color:${C.creme};font-size:58px;box-shadow:6px 6px 0 ${C.creme}">${txt}</span>`, `left:${x}px;top:${y}px;width:max-content`, "bloco pil", "data-layout-allow-overflow");
    tw(A.pula(`#trabalho-p${i} span`, t, rot));
    tw(A.saiZoom(`#trabalho-p${i} span`, Math.max(11.06, t + 0.32)));
  });
  el("c", 11.25, 12.5, `<span class="italico creme sombra" style="font-size:66px">experiências que conectam</span>`, "top:320px");
  tw(A.daEsq("#trabalho-c span", 11.25));
  tw(A.sai("#trabalho-c span", 12.4));
  el("d", 12.53, 13.06, `<span class="gotico rosa solida-azul" style="font-size:210px">Pessoas</span>`, "top:296px");
  tw(A.bate("#trabalho-d span", 12.53));
  tw(A.sai("#trabalho-d span", 12.95));
}, `
    .pil { text-align: left; }
`));

// ---------------- Cena 4: nome (13.07 – 15.70) ----------------
cenas.push(cena("nome", 13.07, 15.7, ({ el, tw }) => {
  el("a", 13.23, 15.62, `<span id="nome-eu" class="italico creme" style="font-size:60px">eu sou</span><br>
        <span id="nome-barra" style="display:inline-block;position:relative;padding:4px 26px 0">
          <span id="nome-fundo" style="position:absolute;inset:0;background:${C.rosa};transform-origin:left center"></span>
          <span id="nome-txt" class="gotico creme" style="font-size:150px;position:relative">Ricardo Lucas</span>
        </span><br>
        <span id="nome-prof" class="italico creme" style="font-size:50px;margin-top:10px">publicitário <span id="nome-vm">& video maker</span></span>`, "top:292px");
  tw(A.borra("#nome-eu", 13.23));
  tw(`tl.fromTo("#nome-fundo", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "expo.out" }, @{13.42});`);
  tw(A.sobe("#nome-txt", 13.46));
  tw(A.daEsq("#nome-prof", 14.3));
  tw(`tl.fromTo("#nome-vm", { opacity: 0 }, { opacity: 1, duration: 0.15 }, @{15.09});`);
  tw(`tl.set("#nome-vm", { opacity: 0 }, 0);`);
  tw(A.sai("#nome-a > *", 15.5));
}));

// ---------------- Cena 5: video maker (15.70 – 19.25) ----------------
cenas.push(cena("videomaker", 15.7, 19.25, ({ el, tw }) => {
  // moldura de câmera
  const canto = (pos) => `<div class="canto ${pos}"></div>`;
  el("rec", 15.95, 17.85, `${canto("ce")}${canto("cd")}${canto("be")}${canto("bd")}<div id="videomaker-recl" class="recl"><span class="ponto"></span>REC</div>`, "left:0;top:0;width:1080px;height:1920px", "bloco");
  tw(`tl.fromTo("#videomaker-rec .canto", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out", stagger: 0.03 }, @{15.95});`);
  [16.45, 16.95, 17.45].forEach((t) => {
    tw(`tl.set("#videomaker-rec .ponto", { opacity: 0.15 }, @{${t}});`);
    tw(`tl.set("#videomaker-rec .ponto", { opacity: 1 }, @{${(t + 0.25).toFixed(2)}});`);
  });
  tw(`tl.to("#videomaker-rec > *", { opacity: 0, duration: 0.1 }, @{17.75});`);
  el("a", 16.37, 17.38, `<span id="videomaker-p" class="gotico creme solida-azul" style="font-size:130px">Produção</span> <span id="videomaker-e" class="gotico rosa solida-azul" style="font-size:130px">& edição</span>`, "top:320px");
  tw(A.daEsq("#videomaker-p", 16.37));
  tw(A.daDir("#videomaker-e", 16.99));
  tw(A.sai("#videomaker-a > *", 17.28));
  el("b", 17.41, 18.0, `<span class="italico rosa sombra" style="font-size:96px">de vídeos</span>`, "top:310px");
  tw(A.borra("#videomaker-b span", 17.41));
  tw(A.sai("#videomaker-b span", 17.9));
  el("c", 18.04, 18.8, `<span class="gotico creme solida-rosa" style="font-size:180px">Transformo</span>`, "top:296px");
  tw(A.estica("#videomaker-c span", 18.04));
  tw(A.sai("#videomaker-c span", 18.7));
  el("d", 18.84, 19.24, `<span class="gotico rosa solida-azul" style="font-size:170px">Seu negócio</span>`, "top:296px");
  tw(A.bate("#videomaker-d span", 18.84));
  tw(A.sai("#videomaker-d span", 19.14));
}, `
    .canto { position: absolute; width: 90px; height: 90px; border: 0 solid ${C.creme}; }
    .canto.ce { left: 130px; top: 280px; border-top-width: 8px; border-left-width: 8px; }
    .canto.cd { right: 130px; top: 280px; border-top-width: 8px; border-right-width: 8px; }
    .canto.be { left: 130px; top: 1160px; border-bottom-width: 8px; border-left-width: 8px; }
    .canto.bd { right: 130px; top: 1160px; border-bottom-width: 8px; border-right-width: 8px; }
    .recl { position: absolute; left: 250px; top: 1085px; font-family: "Poppins"; font-weight: 800; font-size: 40px; color: ${C.creme}; display: flex; align-items: center; gap: 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.6); }
    .ponto { width: 26px; height: 26px; border-radius: 50%; background: ${C.rosa}; display: inline-block; }
`));

// ---------------- Cena 6: final (19.25 – fim) ----------------
cenas.push(cena("final", 19.25, DUR, ({ el, tw }) => {
  el("a", 19.36, DUR, `<span id="final-um" class="italico creme" style="font-size:58px">uma experiência</span><br><span id="final-v" class="gotico rosa" style="font-size:150px;margin-right:28px;text-shadow:5px 5px 0 ${C.creme}">Visual</span> <span id="final-u" class="gotico creme" style="font-size:150px;text-shadow:5px 5px 0 ${C.rosa}">única</span>`, "top:1010px", "bloco", "data-layout-allow-overlap");
  tw(A.borra("#final-um", 19.36));
  tw(A.bate("#final-v", 20.17));
  tw(A.bate("#final-u", 20.52));
}));

// ---------------- Legendas brancas, centralizadas ----------------
const CHAVES = new Set(["aparecer", "conectar", "clientes", "transformar", "pessoas", "videos", "negocio", "unica", "experiencias", "interesse"]);
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
const escondida = [[8.0, 11.2], [13.07, 15.7], [19.25, 99]];
const dentro = (t) => escondida.some(([a, b]) => t >= a && t < b);
const grupos = [];
let g = [];
palavras.forEach((p, i) => {
  if (dentro(p.ini)) { if (g.length) { grupos.push(g); g = []; } return; }
  g.push(p);
  const prox = palavras[i + 1];
  if (!prox || /[.,!?;:…]$/.test(p.texto) || prox.ini - p.fim >= 0.15 || g.length === 3 || dentro(prox.ini)) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
grupos.forEach((gr, i) => {
  const prox = grupos[i + 1];
  gr.ini = Math.max(i === 0 ? 0.1 : 0, gr[0].ini - 0.05);
  let fim = gr[gr.length - 1].fim + 0.35;
  for (const [a] of escondida) if (a > gr.ini) fim = Math.min(fim, a);
  if (prox) fim = Math.min(fim, prox[0].ini - 0.05);
  gr.fim = Math.max(gr.ini + 0.1, Math.min(fim, DUR));
});
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const txt = gr.map((p) => p.texto).join(" ");
  const tam = Math.max(44, Math.min(64, Math.floor(760 / (txt.length * 0.6))));
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(gr.ini)}" data-duration="${f(gr.fim - gr.ini)}" data-track-index="0"><div class="linha" style="font-size:${tam}px">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pal${CHAVES.has(nrm(p.texto)) ? " chave" : ""}">${esc(p.texto)}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => {
    lj += `      tl.fromTo("#lg${i}w${j}", { opacity: 0, y: 22, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.14, ease: "back.out(2.4)" }, ${f(p.ini)});\n`;
  });
  lj += `      tl.to("#lg${i} .linha", { opacity: 0, duration: 0.07, ease: "power2.in" }, ${f(gr.fim - 0.07)});\n`;
});
fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 140px; width: 800px; bottom: 690px; text-align: center; overflow: visible; }
    .linha { display: inline-block; line-height: 1.15; font-family: "Poppins"; font-weight: 700; color: #ffffff;
      text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 0 #000, 0 6px 20px rgba(0,0,0,0.75); }
    .pal { display: inline-block; }
    .chave { font-size: 1.32em; }
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

// ---------------- Efeitos sonoros ----------------
const SFXDIR = "/root/.claude/skills/media-use/audio/assets/sfx";
const man = JSON.parse(fs.readFileSync(path.join(SFXDIR, "manifest.json"), "utf8"));
const sons = [
  ["whoosh-short", 0.05], ["impact-bass-1", 1.1], ["glitch-1", 2.2],
  ["ping", 3.86], ["pop", 4.67], ["impact-bass-1", 5.89],
  ["whoosh", 6.34], ["whoosh-short", 8.0],
  ...pilulas.map(([, t]) => ["pop", t]),
  ["whoosh-short", 11.15], ["impact-bass-1", 12.53], ["whoosh", 13.0],
  ["whoosh-short", 15.62], ["click", 15.95], ["whoosh", 18.04],
  ["whoosh", 19.25], ["impact-bass-1", 20.52],
];
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const volume = { "impact-bass-1": 0.16, "glitch-1": 0.1, whoosh: 0.12, "whoosh-short": 0.12, pop: 0.13, ping: 0.1, click: 0.12 };
let audios = "";
sons.forEach(([nome, t], i) => {
  const arq = man[nome].file || `${nome}.mp3`;
  fs.copyFileSync(path.join(SFXDIR, path.basename(arq)), path.join(P, "assets/sfx", path.basename(arq)));
  const d = Math.min(man[nome].duration, DUR - t - 0.01);
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${path.basename(arq)}" data-start="${f(t)}" data-duration="${f(d)}" data-track-index="${5 + (i % 2)}" data-volume="${volume[nome] ?? 0.12}"></audio>\n`;
});

// ---------------- Câmera (zoom, tremor, molduras) ----------------
const cam = [];
const set = (t, v) => cam.push(`tl.set("#camera", ${v}, ${f(t)});`);
const to = (t, d, v, ease = "power3.out") => cam.push(`tl.to("#camera", { ...${v}, duration: ${d}, ease: "${ease}" }, ${f(t)});`);
const tremor = (t) => cam.push(`tl.to("#tremor", { keyframes: [{ x: 16, y: -9, duration: 0.03 }, { x: -13, y: 11, duration: 0.03 }, { x: 9, y: -6, duration: 0.03 }, { x: -6, y: 4, duration: 0.03 }, { x: 3, y: -2, duration: 0.03 }, { x: 0, y: 0, duration: 0.04 }], ease: "none" }, ${f(t)});`);
const fundo = (t, cor) => cam.push(`tl.set("#palco", { backgroundColor: "${cor}" }, ${f(t)});`);
const flash = (t) => cam.push(`tl.to("#flash", { keyframes: [{ opacity: 0.55, duration: 0.04 }, { opacity: 0, duration: 0.14 }], ease: "none" }, ${f(t)});`);
// gancho
set(0, `{ scale: 1.1 }`); set(1.1, `{ scale: 1 }`);
to(2.2, 0.12, `{ scale: 1.15 }`); tremor(2.2); set(2.86, `{ scale: 1 }`);
// conexão
to(2.86, 1.2, `{ scale: 1.05 }`, "none"); set(4.12, `{ scale: 1.12 }`); set(5.33, `{ scale: 1 }`);
to(5.89, 0.12, `{ scale: 1.15 }`); tremor(5.89);
// troca para a cena escura
flash(6.36); set(6.4, `{ scale: 1.04 }`); to(6.4, 1.5, `{ scale: 1.1 }`, "none");
// cartão rosa
fundo(7.9, C.rosa); cam.push(`tl.set("#grade", { opacity: 1 }, 7.9);`);
to(8.0, 0.4, `{ scale: 0.6, y: 60, borderRadius: 60 }`, "power3.inOut");
to(11.12, 0.3, `{ scale: 1.02, y: 0, borderRadius: 0 }`, "power3.inOut");
cam.push(`tl.set("#grade", { opacity: 0 }, 11.45);`); fundo(11.45, "#000");
to(11.45, 1.0, `{ scale: 1.08 }`, "none"); to(12.53, 0.12, `{ scale: 1.16 }`); tremor(12.53);
// nome: vídeo desce e encolhe sobre azul
flash(13.03); set(13.07, `{ scale: 1, y: 0 }`); fundo(13.2, C.azul);
to(13.25, 0.4, `{ scale: 0.8, y: 190, borderRadius: 48 }`, "power3.inOut");
to(15.58, 0.3, `{ scale: 1.1, y: 0, borderRadius: 0 }`, "power3.inOut"); fundo(15.9, "#000");
// video maker: cortes de zoom
set(16.37, `{ scale: 1 }`); set(17.41, `{ scale: 1.14 }`); set(18.04, `{ scale: 1 }`);
to(18.84, 0.12, `{ scale: 1.12 }`);
// final: moldura pequena sobre azul
fundo(19.2, C.azul);
to(19.25, 0.45, `{ scale: 0.44, y: -300, borderRadius: 70 }`, "power3.inOut");

const hosts = cenas.map((c, i) => `      <div id="${c.id}" data-composition-id="${c.id}" data-composition-src="compositions/${c.id}.html" data-start="${f(c.ini)}" data-duration="${f(c.fim - c.ini)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`).join("\n");

let gradeAtual = "";
const idx = path.join(P, "index.html");
if (fs.existsSync(idx)) { const m = fs.readFileSync(idx, "utf8").match(/data-color-grading=("[^"]*"|'[^']*')/); if (m) gradeAtual = " " + m[0]; }

fs.writeFileSync(idx, `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #palco { position: absolute; inset: 0; background: #000; }
      #grade { position: absolute; inset: 0; opacity: 0;
        background-image: linear-gradient(rgba(254,241,207,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(254,241,207,0.16) 2px, transparent 2px);
        background-size: 72px 72px; }
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 40%; z-index: 1; }
      #tremor { position: absolute; inset: -30px; }
      #fundo { position: absolute; left: 30px; top: 30px; width: ${W}px; height: ${H}px; object-fit: cover; }
      #flash { position: absolute; inset: 0; background: #fff; opacity: 0; z-index: 9; pointer-events: none; }
      .host { position: absolute; inset: 0; }
${cenas.map((c) => `      #${c.id} { position: absolute; inset: 0; z-index: 3; }`).join("\n")}
      #legendas { position: absolute; inset: 0; z-index: 5; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="palco"><div id="grade"></div></div>
      <div id="camera">
        <div id="tremor" data-layout-allow-overflow>
          <video id="fundo"${gradeAtual} class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
        </div>
      </div>
      <div id="flash"></div>
${hosts}
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      gsap.set("#camera", { scale: 1, x: 0, y: 0, borderRadius: 0 });
      gsap.set("#tremor", { x: 0, y: 0 });
      const tl = gsap.timeline({ paused: true });
      gsap.set("#flash", { opacity: 0 });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${cenas.length} cenas, ${grupos.length} grupos de legenda, ${sons.length} efeitos sonoros, duração ${DUR}s`);
