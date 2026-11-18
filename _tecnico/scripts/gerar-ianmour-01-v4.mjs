#!/usr/bin/env node
// ianmour-01 v4 — estilo da referência do Instagram (texto cinético espalhado, quadro de
// investigação com polaroids, nome em anel em volta da cabeça, zoom com borrão, brilho de luz).
// Cores da identidade ianmour nas animações; texto base branco.
// Uso: node gerar-ianmour-01-v4.mjs <pasta-do-projeto>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const P = process.argv[2];
const C = { rosa: "#FC3B7F", creme: "#FEF1CF", azul: "#0032A8" };
const W = 1080, H = 1920;
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const quadros = parseInt(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path.join(P, "assets/corte.mp4")], { encoding: "utf8" }));
const DUR = +(quadros / 30).toFixed(4);
const palavras = JSON.parse(fs.readFileSync(path.join(P, "assets/transcript.json"), "utf8"))
  .map((p) => ({ texto: p.text.trim(), ini: p.start, fim: p.end }))
  .filter((p) => p.texto && /[\p{L}\p{N}]/u.test(p.texto));
let cursor = 0;
// consome as próximas palavras da transcrição, conferindo o texto (garante sincronia)
function pega(txt) {
  const p = palavras[cursor];
  if (!p || nrm(p.texto) !== nrm(txt)) throw new Error(`palavra fora de ordem: esperava "${txt}", veio "${p && p.texto}" (#${cursor})`);
  cursor++;
  return p;
}
function pula(n) { const r = palavras.slice(cursor, cursor + n); cursor += n; return r; }

fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
const CSS = `
    .fr { position: absolute; overflow: visible; font-family: "Inter"; letter-spacing: -0.035em; }
    .fr .ln { display: block; white-space: nowrap; }
    .w { display: inline-block; margin-right: 0.22em; }
    .p { font-weight: 700; font-size: 46px; line-height: 1.08; color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,0.6); }
    .g { font-weight: 900; font-size: 132px; line-height: 0.92; text-transform: uppercase; }
    .rosa { color: ${C.rosa}; text-shadow: 4px 4px 0 ${C.creme}, 0 8px 30px rgba(0,0,0,0.45); }
    .azul { color: ${C.azul}; text-shadow: 4px 4px 0 ${C.creme}, 0 8px 30px rgba(0,0,0,0.45); }
    .creme { color: ${C.creme}; text-shadow: 4px 4px 0 ${C.rosa}, 0 8px 30px rgba(0,0,0,0.45); }
`;
// frase cinética: linhas com marcação *rosa* #azul# ~creme~ (palavras grandes); demais pequenas brancas
function frase(id, t0, t1, pos, linhas, tamG = 132) {
  let html = "", js = "";
  linhas.forEach((ln, li) => {
    html += `<span class="ln">`;
    const toks = ln.match(/\*[^*]+\*|#[^#]+#|~[^~]+~|\S+/g);
    toks.forEach((tk, ti) => {
      let cls = "p", txt = tk;
      if (/^\*.*\*$/.test(tk)) { cls = "g rosa"; txt = tk.slice(1, -1); }
      else if (/^#.*#$/.test(tk)) { cls = "g azul"; txt = tk.slice(1, -1); }
      else if (/^~.*~$/.test(tk)) { cls = "g creme"; txt = tk.slice(1, -1); }
      txt.split(" ").forEach((w, k) => {
        const p = pega(w);
        const wid = `${id}-${li}-${ti}-${k}`;
        const big = cls !== "p";
        html += `<span id="${wid}" class="w ${cls}"${big ? ` style="font-size:${tamG}px"` : ""}>${esc(w)}</span>`;
        js += big
          ? `tl.fromTo("#${wid}", { opacity: 0, scale: 1.35, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.2, ease: "power3.out" }, ${f(Math.max(0, p.ini - 0.02))});\n`
          : `tl.fromTo("#${wid}", { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.14, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.02))});\n`;
      });
    });
    html += `</span>`;
  });
  js += `tl.to("#${id} .w", { opacity: 0, filter: "blur(6px)", duration: 0.14, ease: "power2.in" }, ${f(t1 - 0.14)});\n`;
  return { html: `      <div id="${id}" class="clip fr" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${pos}" data-layout-allow-overlap>${html}</div>`, js };
}

// ---------- Textos cinéticos (fazem o papel da legenda) ----------
const frases = [];
const add = (...a) => frases.push(frase(...a));
add("f1", 0.03, 2.84, "left:120px;top:300px;text-align:left", ["A sua empresa precisa de", "*muito mais*", "do que apenas", "#aparecer.#"], 128);
add("f2", 2.84, 4.1, "right:170px;top:330px;text-align:right", ["Ela precisa se", "*conectar,*"], 120);
add("f3", 4.1, 5.3, "left:140px;width:800px;top:1040px;text-align:center", ["despertar", "#interesse#"], 104);
add("f4", 5.3, 6.4, "left:120px;top:320px;text-align:left", ["e conquistar", "*clientes.*"], 136);
add("f5", 6.56, 8.0, "left:120px;top:330px;text-align:left", ["Meu trabalho é", "*transformar*"], 118);
// quadro de investigação: ideias e imagens, histórias e emoções e marcas
const seq = ["ideias", "e", "imagens,", "histórias", "e", "emoções", "e", "marcas"].map((w) => pega(w));
const fotos = seq.filter((p) => p.texto.replace(/[^\p{L}]/gu, "").length > 1);
add("f6", 11.14, 13.07, "left:120px;top:320px;text-align:left", ["em experiências", "que conectam", "*pessoas.*"], 138);
const anel = ["Eu", "sou", "Ricardo", "Lucas,", "publicitário", "e", "video", "maker"].map((w) => pega(w));
add("f7", 15.68, 17.38, "right:170px;top:320px;text-align:right", ["e através da", "*produção*", "e #edição#"], 112);
add("f8", 17.38, 18.62, "left:120px;top:320px;text-align:left", ["de *vídeos*", "que eu transformo"], 120);
add("f9", 18.62, 19.3, "right:170px;top:330px;text-align:right", ["o seu", "#negócio#", "em"], 116);
add("f10", 19.32, DUR, "left:140px;width:800px;top:300px;text-align:center", ["uma experiência", "*visual*", "~única.~"], 150);
if (cursor !== palavras.length) throw new Error(`sobraram palavras: ${palavras.slice(cursor).map((p) => p.texto).join(" ")}`);

fs.writeFileSync(path.join(P, "compositions/textos.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }${CSS}
  </style>
  <div id="root" data-composition-id="textos" data-width="${W}" data-height="${H}">
${frases.map((x) => x.html).join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${frases.map((x) => x.js).join("")}      window.__timelines["textos"] = tl;
    })();
  </script>
</template>
`);

// ---------- Quadro de investigação (8.0 – 11.2) ----------
const QI = 7.98, QF = 11.2;
const lugares = [[80, 300, -7], [610, 430, 6], [110, 780, 4], [620, 930, -5], [370, 1260, -3]];
const pinos = lugares.map(([x, y]) => [x + 150, y + 14]);
let qh = "", qj = "";
fotos.forEach((p, i) => {
  const [x, y, rot] = lugares[i];
  const nome = p.texto.replace(/[^\p{L}]/gu, "");
  qh += `      <div id="qd-p${i}" class="pol" style="left:${x}px;top:${y}px"><img src="assets/fotos/f${i + 1}.jpg" alt=""><span class="leg">${esc(nome)}</span><span class="pino"></span></div>\n`;
  qj += `      tl.fromTo("#qd-p${i}", { opacity: 0, scale: 1.6, rotation: ${rot * 3} }, { opacity: 1, scale: 1, rotation: ${rot}, duration: 0.28, ease: "back.out(1.6)" }, ${f(p.ini - QI)});\n`;
});
let pts = pinos.map(([x, y]) => `${x},${y}`).join(" ");
const comp = pinos.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - pinos[i][0], y - pinos[i][1]), 0);
let acum = 0;
fotos.forEach((p, i) => {
  if (i === 0) return;
  acum += Math.hypot(pinos[i][0] - pinos[i - 1][0], pinos[i][1] - pinos[i - 1][1]);
  qj += `      tl.to("#qd-fio", { attr: { "stroke-dashoffset": ${(comp - acum).toFixed(1)} }, duration: 0.3, ease: "power2.inOut" }, ${f(p.ini - QI + 0.05)});\n`;
});
fs.writeFileSync(path.join(P, "compositions/quadro.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    #qd-fundo { position: absolute; inset: -60px; background-color: #0f0f12;
      background-image: linear-gradient(rgba(254,241,207,0.09) 2px, transparent 2px), linear-gradient(90deg, rgba(254,241,207,0.09) 2px, transparent 2px);
      background-size: 90px 90px; }
    #qd-luz { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.08), rgba(0,0,0,0.55) 75%); }
    #qd-mesa { position: absolute; inset: 0; transform-origin: 50% 50%; }
    .pol { position: absolute; width: 300px; padding: 12px 12px 58px; background: #f4efe4; box-shadow: 0 18px 40px rgba(0,0,0,0.55); }
    .pol img { display: block; width: 276px; height: 345px; object-fit: cover; }
    .pol .leg { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font-family: "Inter"; font-weight: 900; font-size: 34px; letter-spacing: -0.03em; color: #16161a; text-transform: lowercase; }
    .pino { position: absolute; left: 137px; top: 2px; width: 26px; height: 26px; border-radius: 50%; background: ${C.rosa}; box-shadow: 0 3px 6px rgba(0,0,0,0.5); }
    #qd-svg { position: absolute; left: 0; top: 0; overflow: visible; z-index: 5; }
    #qd-tit { position: absolute; left: 120px; top: 300px; font-family: "Inter"; font-weight: 700; font-size: 44px; letter-spacing: -0.03em; color: #fff; z-index: 6; }
    #qd-tit b { color: ${C.rosa}; font-weight: 900; }
  </style>
  <div id="root" data-composition-id="quadro" data-width="${W}" data-height="${H}">
    <div id="qd-cena" class="clip" data-start="0" data-duration="${f(QF - QI)}" data-track-index="0" style="position:absolute;inset:0" data-layout-allow-overlap data-layout-allow-overflow>
      <div id="qd-fundo"></div>
      <div id="qd-mesa">
${qh}        <svg id="qd-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline id="qd-fio" points="${pts}" fill="none" stroke="${C.rosa}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${comp.toFixed(1)}" stroke-dashoffset="${comp.toFixed(1)}"/></svg>
      </div>
      <div id="qd-luz"></div>
    </div>
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#qd-mesa", { scale: 1.12, rotation: -2 }, { scale: 1, rotation: 1, duration: ${f(QF - QI)}, ease: "none" }, 0);
${qj}      tl.to("#qd-cena", { opacity: 0, duration: 0.15 }, ${f(QF - QI - 0.15)});
      window.__timelines["quadro"] = tl;
    })();
  </script>
</template>
`);

// ---------- Anel com o nome em volta da cabeça (13.2 – 15.7) ----------
const AI = 13.2, AF = 15.68;
const cx = 540, cy = 600, rx = 340, ry = 96;
const perim = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
const txtAnel = "RICARDO LUCAS • VIDEO MAKER • ";
const caminho = `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${2 * rx},0 a ${rx},${ry} 0 1,0 ${-2 * rx},0`;
const camada = (id, clip, op) => `<g clip-path="url(#${clip})" opacity="${op}"><text font-family="Inter" font-weight="900" font-size="58" letter-spacing="1" fill="${C.rosa}" stroke="${C.creme}" stroke-width="1.2"><textPath id="${id}" href="#an-cam" startOffset="0">${esc(txtAnel.repeat(3))}</textPath></text></g>`;
fs.writeFileSync(path.join(P, "compositions/anel.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    #an-svg { position: absolute; left: 0; top: 0; overflow: visible; }
  </style>
  <div id="root" data-composition-id="anel" data-width="${W}" data-height="${H}">
    <div id="an-cena" class="clip" data-start="0" data-duration="${f(AF - AI)}" data-track-index="0" style="position:absolute;inset:0" data-layout-allow-overlap data-layout-allow-overflow>
      <svg id="an-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <defs>
          <path id="an-cam" d="${caminho}"/>
          <clipPath id="an-tras"><rect x="0" y="0" width="${W}" height="${cy}"/></clipPath>
          <clipPath id="an-frente"><rect x="0" y="${cy}" width="${W}" height="${H - cy}"/></clipPath>
        </defs>
        <g id="an-giro" transform="rotate(-7 ${cx} ${cy})">
          ${camada("an-t1", "an-tras", 0.35)}
          ${camada("an-t2", "an-frente", 1)}
        </g>
      </svg>
    </div>
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#an-svg", { opacity: 0, scale: 1.3, transformOrigin: "${cx}px ${cy}px" }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, ${f(anel[0].ini - AI)});
      tl.fromTo(["#an-t1", "#an-t2"], { attr: { startOffset: 0 } }, { attr: { startOffset: ${(-perim).toFixed(1)} }, duration: ${f(AF - AI)}, ease: "none" }, 0);
      tl.to("#an-svg", { opacity: 0, duration: 0.15 }, ${f(AF - AI - 0.15)});
      window.__timelines["anel"] = tl;
    })();
  </script>
</template>
`);

// ---------- Efeitos sonoros (poucos, baixos) ----------
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
const sons = [["impact-bass-1", 1.08, 0.13], ["whoosh-short", 2.16, 0.12], ["whoosh", 6.3, 0.12], ["whoosh-short", 7.95, 0.12],
  ...fotos.map((p) => ["pop", p.ini, 0.12]), ["whoosh-short", 11.12, 0.12], ["impact-bass-1", 12.53, 0.13], ["whoosh", 13.0, 0.12],
  ["whoosh-short", 18.8, 0.12], ["impact-bass-1", 20.5, 0.14]];
let audios = "";
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t)}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${6 + (i % 2)}" data-volume="${v}"></audio>\n`;
});

// ---------- Câmera, zoom com borrão, brilho ----------
const cam = [];
const set = (t, v) => cam.push(`tl.set("#camera", ${v}, ${f(t)});`);
const to = (t, d, v, ease = "none") => cam.push(`tl.to("#camera", { ...${v}, duration: ${d}, ease: "${ease}" }, ${f(t)});`);
const borrao = (t) => cam.push(`tl.to("#fundo", { keyframes: [{ "--hf-color-grading-blur": 0.55, duration: 0.07 }, { "--hf-color-grading-blur": 0, duration: 0.2 }], ease: "none" }, ${f(t)});`);
const soco = (t, s) => { cam.push(`tl.to("#camera", { scale: ${s}, duration: 0.14, ease: "power3.out" }, ${f(t)});`); borrao(t); };
const brilho = (t) => cam.push(`tl.to("#brilho", { keyframes: [{ opacity: 0.85, x: 0, duration: 0.2 }, { opacity: 0, x: 240, duration: 0.45 }], ease: "power1.inOut" }, ${f(t)});`);
set(0, `{ scale: 1.08 }`); to(0, 1.1, `{ scale: 1.1 }`);
set(1.1, `{ scale: 1 }`); soco(2.2, 1.14);
set(2.86, `{ scale: 1.06 }`); to(2.86, 1.26, `{ scale: 1.08 }`);
set(4.12, `{ scale: 1 }`); soco(5.89, 1.13);
brilho(6.2); set(6.4, `{ scale: 1.02 }`); to(6.4, 1.6, `{ scale: 1.07 }`);
brilho(7.85);
brilho(11.05); set(11.2, `{ scale: 1.04 }`); to(11.2, 1.3, `{ scale: 1.07 }`); soco(12.53, 1.14);
brilho(12.9); set(13.07, `{ scale: 1 }`); to(13.07, 2.6, `{ scale: 1.03 }`);
set(15.7, `{ scale: 1.08 }`); to(15.7, 1.7, `{ scale: 1.11 }`);
set(17.41, `{ scale: 1 }`); soco(18.84, 1.12);
set(19.3, `{ scale: 1.04 }`); to(19.3, 1.73, `{ scale: 1.09 }`);
borrao(6.36); borrao(13.03);
brilho(20.6);

let grade = "";
const idx = path.join(P, "index.html");
if (fs.existsSync(idx)) { const m = fs.readFileSync(idx, "utf8").match(/data-color-grading=("[^"]*"|'[^']*')/); if (m) grade = " " + m[0]; }
const host = (id, t0, t1, z, kind = "graphics") => `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="${z}" data-track-kind="${kind}" data-width="${W}" data-height="${H}"></div>`;
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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 40%; z-index: 1; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #brilho { position: absolute; inset: -240px; z-index: 6; opacity: 0; pointer-events: none; mix-blend-mode: screen;
        background: radial-gradient(ellipse at 65% 35%, rgba(255,190,120,0.95) 0%, rgba(252,59,127,0.45) 32%, rgba(255,90,20,0) 66%); }
      #quadro { position: absolute; inset: 0; z-index: 3; }
      #anel { position: absolute; inset: 0; z-index: 4; }
      #textos { position: absolute; inset: 0; z-index: 5; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo"${grade} class="clip" style="--hf-color-grading-blur: 0" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="brilho" data-layout-ignore data-layout-allow-overflow></div>
${host("quadro", QI, QF, 1)}
${host("anel", AI, AF, 2)}
${host("textos", 0, DUR, 3, "captions")}
${audios}    </div>
    <script>
      gsap.set("#camera", { scale: 1 });
      gsap.set("#brilho", { opacity: 0, x: -240 });
      const tl = gsap.timeline({ paused: true });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${frases.length} frases, ${fotos.length} polaroids, ${sons.length} efeitos, ${DUR}s, palavras usadas ${cursor}/${palavras.length}`);
