#!/usr/bin/env node
// ianmour-01 — versão CLIENTE no estilo "pessoa falando" das referências (ref-cliente-falado-01/02, ref-falado-04):
// legenda branca pequena com palavra-chave mais forte, zoom alternando, elementos de app que surgem com a fala
// (notificações, balões, grade de ícones, cartão de nome, progresso, "Saiba mais"). Cores neutras. Sem música.
// Uso: node gerar-falado-01.mjs <pasta-do-projeto>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const P = process.argv[2];
const W = 1080, H = 1920;
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const quadros = parseInt(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path.join(P, "assets/corte.mp4")], { encoding: "utf8" }));
const DUR = +(quadros / 30).toFixed(4);
const pal = JSON.parse(fs.readFileSync(path.join(P, "assets/transcript.json"), "utf8")).map((p) => ({ texto: p.text.trim(), ini: p.start, fim: p.end }));
const T = (frag) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < pal.length; i++) if (ws.every((w, k) => nrm(pal[i + k]?.texto || "") === w)) return pal[i].ini; throw new Error("não achei: " + frag); };

const els = [], js = [];
const el = (id, t0, t1, html, estilo) => els.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}" data-layout-allow-overlap>${html}</div>`);
const tw = (s) => js.push("      " + s);
const banner = (s, t) => tw(`tl.fromTo("${s}", { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }, ${f(t)});`);
const sobeBanner = (s, t) => tw(`tl.to("${s}", { y: -140, opacity: 0, duration: 0.3, ease: "power2.in" }, ${f(t)});`);
const pop = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.3, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: "back.out(2)" }, ${f(t)});`);
const some = (s, t) => tw(`tl.to("${s}", { scale: 0.8, opacity: 0, duration: 0.2, ease: "power2.in" }, ${f(t)});`);
const ico = {
  check: `<svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="11" fill="#34C759"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pessoa: `<svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="11" fill="#FF375F"/><circle cx="12" cy="9.5" r="3.4" fill="#fff"/><path d="M5.8 18.2c1.2-3 3.5-4.2 6.2-4.2s5 1.2 6.2 4.2" fill="#fff"/></svg>`,
  msg: `<svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="11" fill="#30A2FF"/><path d="M6.5 8.5h11v6.5h-6l-3 2.5v-2.5h-2z" fill="#fff"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="11" fill="#FF9F0A"/><path d="M10 8l6 4-6 4z" fill="#fff"/></svg>`,
};
const notif = (app, titulo, sub, icone) => `<div class="nt"><div class="nti">${icone}</div><div class="ntx"><div class="nta">${app}<span>agora</span></div><b>${titulo}</b><span>${sub}</span></div></div>`;

// ===== v2 CALMA: só 3 elementos no vídeo inteiro =====
// ===== v3: palavras acima da cabeça + tela cheia com palavras passando =====
const acima = (id, t0, t1, txt, tam = 150) => {
  el(id, t0, t1, `<div class="acima" style="font-size:${tam}px">${txt}</div>`, "left:60px;width:960px;top:300px;text-align:center");
  tw(`tl.fromTo("#${id} .acima", { opacity: 0, y: 40, scale: 1.15, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, ${f(t0)});`);
  tw(`tl.to("#${id} .acima", { opacity: 0, y: -30, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${f(t1 - 0.2)});`);
};
acima("a1", T("muito") - 0.05, T("apenas") - 0.05, "MUITO MAIS");
acima("a2", T("aparecer") - 0.05, T("Ela") + 0.05, "APARECER");
acima("a3", T("seu negócio") - 0.05, T("uma") - 0.05, "SEU NEGÓCIO", 128);
// tela cheia na frente do vídeo, só as palavras passando
const C0 = T("Meu") - 0.15, C1 = T("Eu") - 0.12;
const passa = [["transformar", "TRANSFORMAR"], ["ideias", "IDEIAS"], ["imagens", "IMAGENS"], ["histórias", "HISTÓRIAS"], ["emoções", "EMOÇÕES"], ["marcas", "MARCAS"]];
el("tc", C0, C1, `<div class="tela"><div class="faixa"></div>
  <div id="tcm" class="tmeu">meu trabalho é</div>
  ${passa.map(([w, txt], i) => `<div id="tp${i}" class="tpal">${txt}</div>`).join("")}
  <div id="tce" class="tmeu" style="top:780px">experiências que conectam</div><div id="tcp" class="tpal grande">PESSOAS</div></div>`, "left:0;top:0;width:1080px;height:1920px");
tw(`tl.fromTo("#tc .tela", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.4, ease: "power3.inOut" }, ${f(C0)});`);
tw(`tl.fromTo("#tcm", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, ${f(C0 + 0.2)}); tl.to("#tcm", { opacity: 0, duration: 0.2 }, ${f(T("experiências") - 0.25)});`);
passa.forEach(([w], i) => {
  const t = T(w) - 0.08, prox = i < passa.length - 1 ? T(passa[i + 1][0]) - 0.08 : T("experiências") - 0.1;
  tw(`tl.fromTo("#tp${i}", { x: 900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: "power3.out" }, ${f(t)}); tl.to("#tp${i}", { x: -900, opacity: 0, duration: 0.25, ease: "power3.in" }, ${f(prox - 0.05)});`);
});
tw(`tl.fromTo("#tce", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25 }, ${f(T("experiências") - 0.05)});`);
tw(`tl.fromTo("#tcp", { opacity: 0, scale: 1.4, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, ${f(T("pessoas") - 0.05)});`);
tw(`tl.to("#tc .tela", { clipPath: "inset(0 0 100% 0)", duration: 0.35, ease: "power3.inOut" }, ${f(C1 - 0.35)});`);


// ---- legenda no jeito da referência: frase "reservada" no lugar, palavras surgindo com esmaecido;
// palavra-chave sozinha, um pouco maior e mais firme ----
const CHAVES = new Set(["aparecer", "conectar", "clientes", "transformar", "pessoas", "ricardo", "lucas", "videos", "negocio", "unica"]);
const ehChave = (p) => p && CHAVES.has(nrm(p.texto));
const escondeLeg = (t) => t >= T("Meu") - 0.15 && t < T("Eu") - 0.12;
const grupos = []; let g = [];
pal.forEach((p, i) => {
  const prox = pal[i + 1];
  if (p._usada || escondeLeg(p.ini)) return;
  if (ehChave(p)) {
    if (g.length) { grupos.push(g); g = []; }
    const gc = [p]; gc.chave = true;
    if (nrm(p.texto) === "ricardo" && prox) { gc.push(prox); pal[i + 1]._usada = true; }
    grupos.push(gc); return;
  }
  if (p._usada) return;
  g.push(p);
  if (!prox || /[.,!?;:]$/.test(p.texto) || prox.ini - p.fim >= 0.2 || g.length === 4 || ehChave(prox)) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const ini = Math.max(0.05, gr[0].ini - 0.04), prox = grupos[i + 1];
  const fim = Math.min(prox ? prox[0].ini - 0.03 : DUR, gr[gr.length - 1].fim + 0.3, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(ini)}" data-duration="${f(Math.max(0.12, fim - ini))}" data-track-index="0"><div class="cx${gr.chave ? " ch" : ""}">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw">${esc(p.texto.replace(/[.,]$/, ""))}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += gr.chave
    ? `      tl.fromTo("#lg${i}w${j}", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`
    : `      tl.fromTo("#lg${i}w${j}", { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`; });
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.06 }, ${f(Math.max(ini + 0.05, fim - 0.06))});\n`;
});

fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/app.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; font-family: "Inter"; letter-spacing: -0.02em; }
    .ui { position: absolute; }
    .nt { display: flex; gap: 22px; align-items: center; padding: 24px 28px; border-radius: 34px; background: rgba(245,245,247,0.94); box-shadow: 0 18px 50px rgba(0,0,0,0.35); color: #111; }
    .nti { flex: none; width: 76px; height: 76px; border-radius: 18px; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
    .ntx { flex: 1; } .nta { display: flex; justify-content: space-between; font-size: 24px; font-weight: 700; color: #6e6e73; letter-spacing: 0.04em; } .nta span { letter-spacing: 0; font-weight: 500; }
    .ntx b { display: block; font-size: 38px; font-weight: 800; margin-top: 4px; } .ntx > span { display: block; font-size: 32px; color: #3a3a3c; margin-top: 2px; }
    .barra { margin-top: 14px; height: 12px; border-radius: 6px; background: #d9d9de; overflow: hidden; } .barra i { display: block; height: 100%; background: #FF9F0A; transform-origin: left center; }
    .bal { display: inline-block; max-width: 640px; padding: 22px 30px; border-radius: 34px; font-size: 42px; font-weight: 600; line-height: 1.15; box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
    .bal.esq { background: #3A3A3C; color: #fff; border-bottom-left-radius: 10px; }
    .bal.dir { display: block; width: fit-content; margin: 18px 0 0 auto; background: #0A84FF; color: #fff; border-bottom-right-radius: 10px; }
    .grade { display: flex; justify-content: center; gap: 26px; }
    .gi { text-align: center; } .gq { width: 136px; height: 136px; border-radius: 36px; background: rgba(20,20,24,0.62); border: 2px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; box-shadow: 0 14px 34px rgba(0,0,0,0.35); }
    .gi span { display: block; margin-top: 12px; font-size: 30px; font-weight: 700; color: #fff; opacity: 0.35; text-shadow: 0 2px 10px rgba(0,0,0,0.6); }
    .pilula { display: inline-flex; align-items: center; gap: 14px; padding: 18px 34px; border-radius: 999px; background: rgba(20,20,24,0.72); color: #fff; font-size: 42px; font-weight: 800; box-shadow: 0 14px 34px rgba(0,0,0,0.35); }
    .nome { display: inline-flex; align-items: center; gap: 22px; padding: 22px 34px 22px 22px; border-radius: 30px; background: rgba(20,20,24,0.72); color: #fff; box-shadow: 0 14px 34px rgba(0,0,0,0.35); }
    .nome i { width: 12px; height: 92px; border-radius: 6px; background: #fff; display: block; }
    .nome b { display: block; font-size: 56px; font-weight: 900; letter-spacing: -0.03em; } .nome span { display: block; font-size: 32px; font-weight: 600; opacity: 0.85; }
    .acima { font-family: "Inter"; font-weight: 900; letter-spacing: -0.045em; line-height: 0.9; color: #fff; text-shadow: 0 10px 40px rgba(0,0,0,0.35); }
    .tela { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, #2a2420 0%, #12100e 70%); }
    .faixa { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 2px, transparent 2px); background-size: 100% 12px; }
    .tmeu { position: absolute; left: 0; right: 0; top: 700px; text-align: center; font-family: "Inter"; font-weight: 500; font-size: 56px; letter-spacing: -0.03em; color: rgba(255,255,255,0.75); }
    .tpal { position: absolute; left: 0; right: 0; top: 800px; text-align: center; font-family: "Inter"; font-weight: 900; font-size: 168px; letter-spacing: -0.05em; line-height: 1; color: #fff; }
    .tpal.grande { top: 860px; font-size: 200px; }
    .icone { position: absolute; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.35)); }
    .saiba { display: inline-flex; align-items: center; gap: 10px; padding: 22px 44px; border-radius: 999px; background: rgba(20,20,24,0.72); border: 2px solid rgba(255,255,255,0.35); color: #fff; font-size: 52px; font-weight: 800; box-shadow: 0 14px 34px rgba(0,0,0,0.35); }
  </style>
  <div id="root" data-composition-id="app" data-width="${W}" data-height="${H}">
${els.join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["app"] = tl;
    })();
  </script>
</template>
`);
fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 120px; width: 840px; top: 1150px; text-align: center; }
    .cx { display: inline-block; font-family: "Inter"; font-weight: 500; font-size: 64px; line-height: 1.15; letter-spacing: -0.035em; color: #fff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.28); }
    .cx.ch { font-weight: 700; font-size: 80px; letter-spacing: -0.04em; }
    .pw { display: inline-block; }
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

// ---- efeitos sonoros (sem música) ----
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
const sons = [
  ["whoosh-short", T("muito") - 0.05, 0.08], ["whoosh-short", T("aparecer") - 0.05, 0.08], ["impact-bass-1", T("aparecer"), 0.06],
  ["whoosh", T("conectar") - 0.1, 0.07], ["whoosh", T("clientes") - 0.1, 0.07],
  ["whoosh", C0, 0.09], ...passa.map(([w]) => ["whoosh-short", T(w) - 0.08, 0.07]), ["impact-bass-1", T("pessoas"), 0.07], ["whoosh", C1 - 0.35, 0.08],
  ["whoosh", T("vídeos") - 0.1, 0.07], ["whoosh-short", T("seu negócio") - 0.05, 0.08], ["whoosh", T("única") - 0.1, 0.07], ["impact-bass-1", T("única"), 0.06],
  ["whoosh-short", 2.84, 0.05], ["whoosh-short", 15.68, 0.05], ["whoosh-short", 19.28, 0.05],
];
let audios = "";
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(Math.max(0, t))}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${5 + (i % 3)}" data-volume="${v}"></audio>\n`;
});

// ---- palavras ATRÁS dele (entre o vídeo e o recorte) ----
const atras = [["t1", T("conectar") - 0.08, T("despertar") + 0.9, "CONECTAR", 158], ["t2", T("clientes") - 0.08, 6.38, "CLIENTES", 166], ["t3", T("vídeos") - 0.08, T("que eu") + 0.3, "VÍDEOS", 236], ["t4", T("única") - 0.08, DUR, "ÚNICA", 272]];
// ---- câmera: alterna aberto/fechado ----
const cam = [];
const set = (t, s) => cam.push(`tl.set("#camera", { scale: ${s} }, ${f(t)});`);
[[0, 1.0], [2.86, 1.16], [6.4, 1.0], [9.3, 1.14], [11.2, 1.0], [13.07, 1.0], [15.7, 1.15], [17.4, 1.0], [19.3, 1.12]].forEach(([t, s]) => set(t, s));
let grade_ = "";
const idx = path.join(P, "index.html");
if (fs.existsSync(idx)) { const m = fs.readFileSync(idx, "utf8").match(/data-color-grading=("[^"]*"|'[^']*')/); if (m) grade_ = " " + m[0]; }
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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 36%; }
      #fundo, #recorte { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #recorte { z-index: 3; }
      .atras { position: absolute; left: 0; right: 0; top: 330px; z-index: 2; text-align: center; overflow: visible; }
      .atras span { display: inline-block; font-family: "Inter"; font-weight: 900; letter-spacing: -0.05em; line-height: 0.9; color: #F5EFE6; text-shadow: 0 10px 50px rgba(0,0,0,0.25); }
      #app, #legendas { position: absolute; inset: 0; } #app { z-index: 2; } #legendas { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo"${grade_} class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
${atras.map(([id, t0, t1, txt, tam]) => `        <div id="${id}" class="clip atras" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="3" data-layout-allow-overlap data-layout-allow-occlusion><span style="font-size:${tam}px">${txt}</span></div>`).join("\n")}
        <video id="recorte"${grade_} class="clip" src="assets/recorte.webm" data-start="0" data-duration="${DUR}" data-track-index="4" muted data-layout-allow-occlusion></video>
      </div>
      <div id="app" data-composition-id="app" data-composition-src="compositions/app.html" data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      gsap.set("#camera", { scale: 1 });
      const tl = gsap.timeline({ paused: true });
${atras.map(([id, t0, t1]) => `      tl.fromTo("#${id} span", { opacity: 0, y: 80, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }, ${f(t0)});${t1 < DUR - 0.05 ? `\n      tl.to("#${id} span", { opacity: 0, y: -40, duration: 0.25, ease: "power2.in" }, ${f(t1 - 0.25)});` : ""}`).join("\n")}
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${els.length} elementos de app, ${grupos.length} blocos de legenda, ${sons.length} efeitos, ${DUR}s`);
