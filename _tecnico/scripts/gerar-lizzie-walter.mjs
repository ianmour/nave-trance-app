#!/usr/bin/env node
// Lizzie — "Walter Firmo" (fotografia). Estilo da referência dela: legenda creme, palavra-chave em letra
// serifada itálica (Playfair Display) + resto em sem serifa limpa (Poppins), poucas palavras por vez na altura do peito;
// fotos do Walter Firmo entrando em tela cheia com "clique" de câmera (flash + som); movimento lento; sem música.
// Uso: node gerar-lizzie-walter.mjs <projeto> <transcricao whisper do corte (json)>
import fs from "node:fs";
import path from "node:path";

const [P, TJ] = process.argv.slice(2);
const W = 1080, H = 1920, CR = "#F3E6C8";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const DUR = +(+fs.readFileSync(path.join(P, "assets/dur.txt"), "utf8")).toFixed(3);

const TEXTO = "Imagine transformar o Brasil em poesia. Walter Firmo começou com uma câmera emprestada e um sonho: mostrar a beleza que o olhar comum não via. Num tempo em que a fotografia precisava ser perfeita, ele mostrou o imperfeito e fez disso arte. Retratou a vida no cotidiano e, em cada clique, mostrou que o Brasil é feito de cor, afeto e verdade. Na época, falaram que suas fotos eram fora do padrão. E hoje fazem parte da nossa história. Estão em museus, livros e, principalmente, no jeito que a gente se reconhece. Walter provou que a fotografia não é só técnica: é o instante em que a vida se deixa ver e a arte acontece sem pedir licença. Porque, no fim, é isso que a fotografia faz: transforma o real em memória, sendo o encontro entre o que o mundo mostra e o que a gente sente.";
const wsp = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription.map((x) => ({ t: x.text.trim(), a: x.offsets.from / 1000, b: x.offsets.to / 1000 })).filter((x) => nrm(x.t));
const txt = TEXTO.split(/\s+/), A = txt.map(nrm), B = wsp.map((x) => nrm(x.t)), n = A.length, m = B.length;
const D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
const tm = new Array(n).fill(null);
for (let i = n, j = m; i > 0 && j > 0;) { const c = A[i - 1] === B[j - 1] ? 0 : 1; if (D[i][j] === D[i - 1][j - 1] + c) { tm[i - 1] = [wsp[j - 1].a, wsp[j - 1].b]; i--; j--; } else if (D[i][j] === D[i - 1][j] + 1) i--; else j--; }
for (let i = 0; i < n; i++) if (!tm[i]) { const an = tm.slice(0, i).reverse().find(Boolean), po = tm.slice(i + 1).find(Boolean); const x = an && po ? (an[1] + po[0]) / 2 : an ? an[1] : po[0]; tm[i] = [x, x + 0.12]; }
const PAL = txt.map((w, i) => ({ texto: w, ini: tm[i][0], fim: Math.min(DUR, Math.max(tm[i][1], tm[i][0] + 0.1)) }));
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };

const els = [], js = [], sons = [];
const el = (id, t0, t1, html, estilo, trilha = 0) => els.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(Math.max(0.1, t1 - t0))}" data-track-index="${trilha}" style="${estilo}" data-layout-allow-overlap data-layout-allow-occlusion>${html}</div>`);
const tw = (s) => js.push("      " + s);
const som = (nome, t, v) => sons.push([nome, Math.max(0, t), v]);

// ---- fotos do Walter Firmo: entram com "clique" (flash + som), zoom lento; horizontais ficam inteiras sobre fundo desfocado ----
const HORIZ = new Set([4, 9, 11, 12]);
let nf = 0;
const foto = (num, t0, t1, rotulo = "") => {
  const id = `ft${nf++}`, src = `assets/fotos/f${num}.jpg`;
  const corpo = HORIZ.has(num)
    ? `<img class="bg" src="${src}"><div class="fr"><img src="${src}"></div>`
    : `<img class="cv" src="${src}">`;
  el(id, t0, t1, `<div class="foto">${corpo}${rotulo ? `<div class="rot">${rotulo}</div>` : ""}<i class="flash"></i></div>`, "left:0;top:0;width:1080px;height:1920px", 1);
  tw(`tl.fromTo("#${id} .cv, #${id} .fr", { scale: 1.1 }, { scale: 1, duration: ${f(t1 - t0 + 0.3)}, ease: "none" }, ${f(t0)});`);
  tw(`tl.fromTo("#${id} .flash", { opacity: 0.85 }, { opacity: 0, duration: 0.22, ease: "power2.out" }, ${f(t0)});`);
  if (rotulo) tw(`tl.fromTo("#${id} .rot", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, ${f(t0 + 0.2)});`);
  som("click", t0, 0.09);
};
foto(9, T("poesia") - 0.05, T("Walter") - 0.05);
foto(3, T("Walter") - 0.03, T("câmera") + 0.2);
foto(12, T("mostrar") - 0.05, T("Num") - 0.06);
foto(4, T("imperfeito") - 0.05, T("Retratou") - 0.06);
foto(1, T("clique") - 0.05, T("cor") - 0.05);
foto(6, T("cor") - 0.05, T("afeto") - 0.04);
foto(15, T("afeto") - 0.04, T("verdade") - 0.04);
foto(5, T("verdade") - 0.04, T("Na") - 0.06);
foto(8, T("parte") - 0.08, T("Estão") - 0.05, "Dona Ivone Lara");
foto(16, T("Estão") - 0.05, T("principalmente") - 0.05);
foto(11, T("principalmente") - 0.05, T("Walter", 33) - 0.05);
foto(13, T("Walter", 33) - 0.05, T("é o instante") - 0.04);
foto(7, T("é o instante") - 0.04, T("arte acontece") - 0.05);
foto(14, T("arte acontece") - 0.05, T("Porque") - 0.06);
foto(2, T("mostra") - 0.05, DUR);
// final: escurece devagar
el("fim", DUR - 1.2, DUR, `<i class="escuro"></i>`, "left:0;top:0;width:1080px;height:1920px", 3);
tw(`tl.fromTo("#fim .escuro", { opacity: 0 }, { opacity: 0.85, duration: 1.2, ease: "power1.in" }, ${f(DUR - 1.2)});`);

// ---- legenda: frase curta inteira; palavra-chave em serifada itálica maior ----
const CHAVES = new Set(["poesia", "walter", "firmo", "sonho", "beleza", "imperfeito", "arte", "cotidiano", "cor", "afeto", "verdade", "padrao", "historia", "reconhece", "tecnica", "instante", "licenca", "memoria", "sente", "fora"]);
const ehChave = (p) => CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => { const q = PAL[i + 1]; g.push(p); if (!q || /[.,!?;:]$/.test(p.texto) || q.ini - p.fim >= 0.3 || g.length >= 4) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0.02, gr[0].ini - 0.05), prox = grupos[i + 1];
  const b = Math.min(prox ? prox[0].ini - 0.03 : DUR, gr.at(-1).fim + 0.45, DUR - 0.6);
  const linhas = gr.map((p) => `<span class="${ehChave(p) ? "ch" : "nm"}">${esc(p.texto.replace(/[.,!?;:]+$/, ""))}</span>`).join(" ");
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><div class="cx">${linhas}</div></div>\n`;
  lj += `      tl.fromTo("#lg${i} .cx", { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.28, ease: "power2.out" }, ${f(a)});\n`;
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.12 }, ${f(Math.max(a + 0.1, b - 0.12))});\n`;
  if (gr.some(ehChave)) som("click-soft", a, 0.035);
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,600&family=Poppins:wght@500;600&display=swap" rel="stylesheet">`;
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/fotos.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; } .ui { position: absolute; }
    .foto { position: absolute; inset: 0; overflow: hidden; background: #0d0806; }
    .cv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .bg { position: absolute; inset: -60px; width: calc(100% + 120px); height: calc(100% + 120px); object-fit: cover; filter: blur(40px) brightness(0.45) saturate(1.1); }
    .fr { position: absolute; left: 40px; right: 40px; top: 50%; transform-origin: 50% 50%; margin-top: -440px; height: 880px; display: flex; align-items: center; justify-content: center; }
    .fr img { max-width: 100%; max-height: 100%; box-shadow: 0 30px 80px rgba(0,0,0,0.55); }
    .rot { position: absolute; left: 0; right: 0; bottom: 230px; text-align: center; font-family: "Playfair Display"; font-style: italic; font-weight: 500; font-size: 58px; color: ${CR}; text-shadow: 0 3px 18px rgba(0,0,0,0.7); }
    .flash { position: absolute; inset: 0; background: #fff; opacity: 0; }
    .escuro { position: absolute; inset: 0; background: #000; opacity: 0; }
  </style>
  <div id="root" data-composition-id="fotos" data-width="${W}" data-height="${H}">
${els.join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["fotos"] = tl;
    })();
  </script>
</template>
`);
fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  ${FONTES}
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 90px; width: 900px; top: 1180px; text-align: center; }
    .cx { display: inline-block; line-height: 1.08; color: ${CR}; text-shadow: 0 2px 18px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.6); }
    .nm, .ch { display: inline-block; margin: 0 0.13em; }
    .nm { font-family: "Poppins"; font-weight: 500; font-size: 56px; letter-spacing: -0.01em; }
    .ch { font-family: "Playfair Display"; font-style: italic; font-weight: 600; font-size: 80px; letter-spacing: -0.01em; }
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
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
let audios = "";
sons.forEach(([nome, t, v], i) => { const arq = path.basename(man[nome].file || `${nome}.mp3`); fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t)}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${6 + (i % 3)}" data-volume="${v}"></audio>\n`; });
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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 35%; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #fotos, #legendas { position: absolute; inset: 0; } #fotos { z-index: 2; } #legendas { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="fotos" data-composition-id="fotos" data-composition-src="compositions/fotos.html" data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#camera", { scale: 1.0 }, { scale: 1.06, duration: ${f(DUR)}, ease: "none" }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${nf} fotos, ${grupos.length} blocos de legenda, ${sons.length} efeitos, ${DUR}s`);
