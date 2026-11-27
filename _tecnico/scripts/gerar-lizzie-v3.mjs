#!/usr/bin/env node
// Lizzie — "Walter Firmo" v3: motion VINTAGE criativo. Alterna ela falando com cenas em papel antigo escuro, onde as
// pessoas das fotos do Walter Firmo aparecem recortadas (adesivo com borda creme), em movimento "stop-motion".
// Granulado de filme, vinheta e luz quente o vídeo todo. Legenda creme: Poppins + Playfair itálico na palavra-chave.
// Uso: node gerar-lizzie-v3.mjs <projeto> <palavras.json>
import fs from "node:fs";
import path from "node:path";

const [P, TJ] = process.argv.slice(2);
const W = 1080, H = 1920, CR = "#F3E6C8", VERM = "#C2412F";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const DUR = 48.6, FALA = 47.07;

const PAL = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription.map((x) => ({ texto: x.text.trim(), ini: x.offsets.from / 1000, fim: x.offsets.to / 1000 }));
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };

// semente fixa: o "tremido" de stop-motion sai igual em toda renderização
let sem = 11; const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
const els = [], js = [], sons = [];
const tw = (s) => js.push("      " + s);
const som = (nome, t, v) => sons.push([nome, Math.max(0, t), v]);
const clip = (id, t0, t1, html, z, cls = "") => els.push(`      <div id="${id}" class="clip cena ${cls}" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="${z}" style="z-index:${z}">${html}</div>`);
// tremido de animação quadro a quadro (8 por segundo)
const treme = (sel, t0, t1, a = 3, r = 0.8) => { for (let t = t0; t < t1; t += 0.125) tw(`tl.set("${sel}", { x: ${f((rnd() - 0.5) * a * 2)}, y: ${f((rnd() - 0.5) * a * 2)}, rotation: ${f((rnd() - 0.5) * r * 2)} }, ${f(t)});`); };
const adesivo = (id, src, estilo) => `<div id="${id}" class="ade" style="${estilo}"><div class="trm"><img src="${src}"></div></div>`;

// ---------- cenas em papel (a fala continua por baixo) ----------
let nc = 0;
const papel = (t0, t1, miolo, entrada = "sobe", saida = "sobe") => {
  const id = `m${nc++}`;
  clip(id, t0, t1, `<img class="papel" src="assets/tex/papel.png">${miolo}`, 10);
  if (entrada === "sobe") { tw(`tl.fromTo("#${id} .papel", { y: 2100 }, { y: 0, duration: 0.34, ease: "power3.out" }, ${f(t0)});`); som("whoosh", t0 - 0.12, 0.05); }
  else { tw(`tl.fromTo("#${id}", { opacity: 0 }, { opacity: 1, duration: 0.08 }, ${f(t0)});`); som("click", t0, 0.08); flash(t0); }
  if (saida === "sobe") { tw(`tl.to("#${id}", { y: -2150, duration: 0.3, ease: "power3.in" }, ${f(t1 - 0.3)});`); som("whoosh-short", t1 - 0.3, 0.04); }
  else if (saida === "obt") obturador(t1);
  return id;
};
let nfl = 0;
const flash = (t) => { const id = `fl${nfl++}`; clip(id, t, t + 0.3, `<i class="luz"></i>`, 40); tw(`tl.fromTo("#${id} .luz", { opacity: 0.85 }, { opacity: 0, duration: 0.28, ease: "power2.out" }, ${f(t)});`); };
let nob = 0;
const obturador = (t) => { const id = `ob${nob++}`; clip(id, t - 0.1, t + 0.12, `<i class="pre"></i>`, 41); som("click", t - 0.1, 0.09); };
const entra = (sel, t, de = {}, dur = 0.32) => tw(`tl.fromTo("${sel}", ${JSON.stringify({ scale: 1.6, rotation: -14, opacity: 0, ...de })}, { scale: 1, rotation: 0, x: 0, y: 0, opacity: 1, duration: ${dur}, ease: "back.out(1.7)" }, ${f(t)});`);

// M1 — Walter Firmo começou com uma câmera emprestada e um sonho
{
  const t0 = T("Walter Firmo") - 0.08, t1 = T("mostrar") - 0.06;
  const id = papel(t0, t1,
    adesivo("w1", "assets/recortes/c3.png", "left:170px;top:190px;width:740px") +
    `<div id="w1n" class="maq" style="left:0;right:0;top:120px;text-align:center;font-size:58px;letter-spacing:0.2em">WALTER FIRMO</div>` +
    `<div id="w1t" class="tic" style="right:70px;top:860px;transform:rotate(6deg)">câmera<br>emprestada</div>` +
    `<div id="w1s" class="maq" style="left:80px;top:860px;font-size:120px;color:${CR}">✶</div>`);
  entra("#w1", t0 + 0.1, { y: 400, rotation: 8, scale: 1.2 }, 0.45); som("pop", t0 + 0.15, 0.07);
  tw(`tl.fromTo("#w1n", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.2em", duration: 0.4, ease: "power2.out" }, ${f(T("Firmo") - 0.05)});`); som("typing", T("Walter Firmo"), 0.05);
  entra("#w1t", T("câmera") - 0.05, { rotation: 30, scale: 2.4 }); som("impact-bass-1", T("câmera") - 0.05, 0.05);
  entra("#w1s", T("sonho") - 0.05, { rotation: 180, scale: 0 }); som("sparkle", T("sonho") - 0.1, 0.06);
  tw(`tl.to("#w1s", { rotation: 40, duration: ${f(t1 - T("sonho"))}, ease: "none" }, ${f(T("sonho") + 0.27)});`);
  treme("#w1 .trm", t0, t1, 2.5, 0.6);
  // passagem: o rosto do Walter cresce e vira o rosto dela
  tw(`tl.to("#w1", { scale: 1.5, y: -120, duration: 0.3, ease: "power2.in" }, ${f(t1 - 0.3)});`);
}
// M2 — num tempo em que a fotografia precisava ser perfeita, ele mostrou o imperfeito e fez disso arte
{
  const t0 = T("Num tempo") - 0.06, t1 = T("Retratou") - 0.05, tim = T("imperfeito");
  papel(t0, t1,
    `<div id="q2" class="moldura" style="left:250px;top:200px;width:580px;height:870px"><img src="assets/fotos/f5.jpg" style="width:100%;height:100%;object-fit:cover"></div>` +
    `<div id="q2p" class="ade" style="left:250px;top:200px;width:580px;height:870px;opacity:0"><img src="assets/recortes/f5.png" style="width:580px;height:870px;object-fit:cover"></div>` +
    `<div id="q2r" class="maq" style="left:0;right:0;text-align:center;top:90px;font-size:68px;letter-spacing:0.14em">PERFEITA</div>` +
    `<div id="q2x" class="risco" style="left:330px;top:128px;width:420px;height:10px"></div>` +
    adesivo("q2a", "assets/recortes/c6.png", "left:660px;top:560px;width:360px"));
  entra("#q2", t0 + 0.08, { y: 300, rotation: 0, scale: 0.6 }, 0.4); som("pop", t0 + 0.1, 0.06);
  tw(`tl.fromTo("#q2r", { opacity: 0 }, { opacity: 1, duration: 0.1 }, ${f(T("perfeita") - 0.05)});`); som("key-press", T("perfeita") - 0.05, 0.07);
  // "o imperfeito": o quadro entorta, a pessoa sai da moldura, a palavra "perfeita" é riscada
  tw(`tl.to("#q2", { rotation: -7, x: -40, duration: 0.25, ease: "back.out(3)" }, ${f(tim - 0.05)});`);
  tw(`tl.set("#q2p", { opacity: 1, rotation: -7, x: -40 }, ${f(tim - 0.05)});`);
  tw(`tl.to("#q2p", { scale: 1.22, y: -30, duration: 0.35, ease: "back.out(2)" }, ${f(tim)});`);
  tw(`tl.fromTo("#q2x", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.out" }, ${f(tim + 0.05)});`); som("whoosh-short", tim - 0.08, 0.05);
  entra("#q2a", T("arte") - 0.08, { rotation: 25, x: 300 }); som("click", T("arte") - 0.08, 0.08); flash(T("arte") - 0.08);
  treme("#q2a .trm", T("arte"), t1, 3, 1);
}
// M3 — em cada clique, mostrou que o Brasil é feito de cor, afeto e verdade
{
  const t0 = T("em cada clique") - 0.05, t1 = T("Na época") - 0.05;
  papel(t0, t1,
    `<div id="v3c" class="maq" style="left:0;right:0;top:110px;text-align:center;font-size:40px;letter-spacing:0.3em">— BRASIL —</div>` +
    adesivo("c3a", "assets/recortes/c6.png", "left:40px;top:300px;width:430px") +
    adesivo("c3b", "assets/recortes/c8.png", "left:520px;top:250px;width:500px") +
    adesivo("c3c", "assets/recortes/c13.png", "left:310px;top:470px;width:440px"));
  tw(`tl.fromTo("#v3c", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(t0 + 0.1)});`);
  [["#c3a", "clique"], ["#c3b", "afeto"], ["#c3c", "verdade"]].forEach(([s, w], k) => {
    const t = T(w) - 0.06; entra(s, t, { rotation: [-20, 18, -10][k], y: 200 }); som("click", t, 0.09); flash(t); treme(`${s} .trm`, t + 0.3, t1, 3, 1);
  });
  tw(`tl.to("#c3a", { scale: 1.08, rotation: -4, duration: 0.2 }, ${f(T("cor") - 0.05)});`); som("pop", T("cor") - 0.05, 0.05);
}
// carimbo "fora do padrão" (em cima dela, abaixo da legenda)
{
  const t = T("fora do padrão") - 0.05, t1 = T("E hoje") - 0.05;
  clip("carimbo", t, t1, `<div class="carimbo">FORA DO PADRÃO</div>`, 20);
  tw(`tl.fromTo("#carimbo .carimbo", { scale: 2.6, opacity: 0, rotation: -2 }, { scale: 1, opacity: 0.92, rotation: -9, duration: 0.18, ease: "power4.in" }, ${f(t)});`);
  som("impact-bass-2", t + 0.15, 0.07);
}
// M4 — Estão em museus, livros e, principalmente, no jeito que a gente se reconhece.
{
  const t0 = T("Estão em museus") - 0.06, tp = T("principalmente") - 0.06, t1 = T("Walter provou") - 0.06;
  papel(t0, t1,
    `<div id="q4a" class="moldura ouro" style="left:90px;top:230px;width:420px;height:580px"><img src="assets/fotos/f15.jpg" style="width:100%;height:100%;object-fit:cover"></div>` +
    `<div id="q4b" class="moldura ouro" style="left:570px;top:330px;width:420px;height:580px"><img src="assets/fotos/f14.jpg" style="width:100%;height:100%;object-fit:cover"></div>` +
    `<div id="q4l" class="maq" style="left:0;right:0;top:130px;text-align:center;font-size:40px;letter-spacing:0.3em">MUSEUS · LIVROS</div>` +
    adesivo("q4c", "assets/recortes/c11.png", "left:60px;top:330px;width:960px"), "sobe", "obt");
  entra("#q4a", t0 + 0.05, { y: -500, rotation: 10, scale: 1 }, 0.4); som("whoosh-short", t0, 0.04);
  entra("#q4b", T("museus") + 0.05, { y: -500, rotation: -10, scale: 1 }, 0.4); som("click-soft", T("museus") + 0.2, 0.08);
  tw(`tl.fromTo("#q4l", { opacity: 0 }, { opacity: 1, duration: 0.15 }, ${f(T("livros") - 0.05)});`); som("key-press", T("livros") - 0.05, 0.06);
  tw(`tl.to("#q4a, #q4b, #q4l", { opacity: 0, scale: 0.85, duration: 0.18 }, ${f(tp - 0.05)});`);
  entra("#q4c", tp, { y: 500, rotation: 6, scale: 0.7 }, 0.45); som("riser", tp - 0.2, 0.04);
  tw(`tl.to("#q4c", { scale: 1.08, duration: ${f(t1 - tp - 0.5)}, ease: "none" }, ${f(tp + 0.45)});`);
  treme("#q4c .trm", tp + 0.45, t1, 2, 0.5);
}
// M5 — Walter provou que a fotografia não é só técnica
{
  const t0 = T("Walter provou") - 0.06, t1 = T("é o instante") - 0.05, tt = T("técnica");
  papel(t0, t1,
    adesivo("p5", "assets/recortes/c13.png", "left:300px;top:250px;width:640px") +
    `<div id="p5t" class="maq" style="left:60px;top:200px;font-size:64px;line-height:1.45;text-align:left;z-index:3">f/2.8<br>1/125 s<br>ISO 100</div>` +
    `<div id="p5x1" class="risco" style="left:50px;top:250px;width:220px;z-index:4"></div><div id="p5x2" class="risco" style="left:50px;top:343px;width:290px;z-index:4"></div><div id="p5x3" class="risco" style="left:50px;top:436px;width:290px;z-index:4"></div>`, "obt", "obt");
  entra("#p5", t0 + 0.04, { y: 200, rotation: -6, scale: 1.3 }, 0.4);
  tw(`tl.fromTo("#p5t", { opacity: 0 }, { opacity: 1, duration: 0.1 }, ${f(T("fotografia") - 0.05)});`); som("typing", T("fotografia", 30) - 0.05, 0.05);
  [1, 2, 3].forEach((k) => { tw(`tl.fromTo("#p5x${k}", { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: "power2.out" }, ${f(tt - 0.15 + k * 0.08)});`); });
  som("whoosh-short", tt - 0.1, 0.05);
  treme("#p5 .trm", t0 + 0.45, t1, 2, 0.6);
}
// M6 — é o instante em que a vida se deixa ver e a arte acontece sem pedir licença (visor de câmera)
{
  const t0 = T("é o instante") - 0.05, ta = T("arte acontece") - 0.06, t1 = T("Porque") - 0.06;
  papel(t0, t1,
    `<div id="i6f" class="foto-cheia"><img src="assets/fotos/f12.jpg"></div>` +
    `<div class="visor"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><i class="mira"></i></div>` +
    adesivo("i6a", "assets/recortes/c9.png", "left:150px;top:160px;width:780px") +
    `<div id="i6b" class="foto-cheia"><img src="assets/fotos/f9.jpg"></div>`, "obt", "sobe");
  tw(`tl.fromTo("#i6f img", { scale: 1.25, x: 80 }, { scale: 1.05, x: 0, duration: ${f(ta - t0)}, ease: "none" }, ${f(t0)});`);
  obturador(T("instante") + 0.1);
  tw(`tl.set("#i6b", { opacity: 0 }, 0);`);
  // "a arte acontece": a foto da praia surge e o homem "salta" para fora dela
  tw(`tl.set("#i6f", { opacity: 0 }, ${f(ta)});`); tw(`tl.set("#i6b", { opacity: 1 }, ${f(ta)});`); flash(ta); som("click", ta, 0.09);
  tw(`tl.fromTo("#i6b img", { scale: 1.1 }, { scale: 1.0, duration: 0.5, ease: "power2.out" }, ${f(ta)});`);
  tw(`tl.set("#i6a", { opacity: 0 }, 0);`);
  tw(`tl.to("#i6b", { opacity: 0, duration: 0.15 }, ${f(T("sem pedir") - 0.1)});`);
  entra("#i6a", T("sem pedir") - 0.1, { scale: 1, rotation: 0, y: 0 }, 0.2);
  tw(`tl.to("#i6a", { scale: 1.12, rotation: -3, duration: ${f(t1 - T("sem pedir") - 0.3)}, ease: "power1.out" }, ${f(T("sem pedir") + 0.1)});`);
  som("whoosh-cinematic", T("sem pedir") - 0.2, 0.04);
}
// M7 — final: o encontro entre o que o mundo mostra (fotos dele) e o que a gente sente (o rosto dela, num retrato antigo)
{
  const t0 = T("sendo o encontro") - 0.05, tg = T("gente sente");
  papel(t0, DUR + 0.2,
    adesivo("e7a", "assets/recortes/c8.png", "left:20px;top:620px;width:380px") +
    adesivo("e7b", "assets/recortes/c15.png", "left:700px;top:600px;width:360px") +
    adesivo("e7c", "assets/recortes/c3.png", "left:60px;top:120px;width:330px") +
    adesivo("e7d", "assets/recortes/c6.png", "left:720px;top:100px;width:330px") +
    `<div id="e7p" class="polaroid"><div class="jan"><video id="ela2" class="clip" src="assets/fala.mp4" muted data-start="${f(t0)}" data-duration="${f(DUR - t0)}" data-media-start="${f(t0)}" data-track-index="30"></video></div><div class="leg"></div></div>` +
    `<div id="e7cr" class="maq" style="left:0;right:0;top:1780px;text-align:center;font-size:26px;letter-spacing:0.25em;opacity:0.8">FOTOGRAFIAS · WALTER FIRMO</div>`, "sobe", "fim");
  [["#e7c", t0 + 0.25], ["#e7d", T("mundo")], ["#e7a", T("mostra")], ["#e7b", T("mostra") + 0.2]].forEach(([s, t], k) => {
    entra(s, t - 0.05, { rotation: [-25, 20, -15, 15][k], y: 150 }); som("click", t - 0.05, 0.07); treme(`${s} .trm`, t + 0.3, DUR, 2.5, 0.8);
  });
  entra("#e7p", T("e o que a gente") - 0.05, { y: 900, rotation: 12, scale: 1 }, 0.5); som("whoosh", T("e o que a gente") - 0.15, 0.05);
  tw(`tl.fromTo("#e7p .leg", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f(tg)});`);
  tw(`tl.to("#e7p", { rotation: -3, scale: 1.04, duration: ${f(DUR - tg)}, ease: "none" }, ${f(tg)});`);
  tw(`tl.fromTo("#e7cr", { opacity: 0 }, { opacity: 0.8, duration: 0.4 }, ${f(tg + 0.2)});`); som("chime", tg + 0.1, 0.03);
}
// final: escurece
clip("fim", DUR - 1.0, DUR, `<i class="pre"></i>`, 45);
tw(`tl.fromTo("#fim .pre", { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "power1.in" }, ${f(DUR - 1.0)});`);

// ---------- câmera dela: começa com "soco" (chamada), depois aproximação lenta; troca de enquadramento nos cortes ----------
const CENAS_ELA = [[0, T("Walter Firmo")], [T("mostrar"), T("Num tempo")], [T("Retratou"), T("em cada clique")], [T("Na época"), T("E hoje")], [T("E hoje"), T("Estão em museus")], [T("Porque"), T("sendo o encontro")]];
tw(`tl.set("#camera", { scale: 1.25 }, 0);`); tw(`tl.to("#camera", { scale: 1.04, duration: 0.45, ease: "power3.out" }, 0);`);
tw(`tl.to("#camera", { scale: 1.0, duration: ${f(CENAS_ELA[0][1] - 0.45)}, ease: "none" }, 0.45);`);
CENAS_ELA.slice(1).forEach(([a, b], k) => { const z0 = k % 2 ? 1.0 : 1.14; tw(`tl.set("#camera", { scale: ${z0} }, ${f(a)});`); tw(`tl.to("#camera", { scale: ${f(z0 + 0.05)}, duration: ${f(b - a)}, ease: "none" }, ${f(a)});`); });
// troca de take sem cena de papel no meio (época → hoje): clique de câmera
flash(T("E hoje") - 0.02); som("click", T("E hoje") - 0.04, 0.08);
// "soco" de impacto na palavra poesia
som("impact-bass-1", T("poesia") - 0.04, 0.05); som("riser", 0, 0.025);

// ---------- granulado de filme (12 por segundo) + luz quente piscando ----------
for (let t = 0, k = 0; t < DUR; t += 1 / 12, k++) tw(`tl.set("#grao", { backgroundImage: "url(assets/tex/grao${(k * 5) % 8}.png)", backgroundPosition: "${Math.round(rnd() * 300)}px ${Math.round(rnd() * 300)}px" }, ${f(t)});`);
for (let t = 0; t < DUR; t += 0.25) tw(`tl.set("#tremor", { opacity: ${f(0.03 + rnd() * 0.05)} }, ${f(t)});`);

// ---------- legenda ----------
const CHAVES = new Set(["poesia", "walter", "firmo", "sonho", "beleza", "imperfeito", "arte", "cotidiano", "cor", "afeto", "verdade", "padrao", "historia", "reconhece", "tecnica", "instante", "licenca", "memoria", "sente", "camera", "museus"]);
const ehChave = (p) => CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => { const q = PAL[i + 1]; g.push(p); if (!q || /[.,!?;:]$/.test(p.texto) || q.ini - p.fim >= 0.3 || g.length >= 3 || (ehChave(p) && g.length >= 2)) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
let lh = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0, gr[0].ini - 0.06), prox = grupos[i + 1];
  const b = prox ? Math.min(prox[0].ini - 0.06, gr.at(-1).fim + 0.5) : DUR - 1.0;
  if (b - a < 0.1) return;
  const linhas = gr.map((p) => `<span class="${ehChave(p) ? "ch" : "nm"}">${esc(p.texto.replace(/[.,!?;:]+$/, ""))}</span>`).join(" ");
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(b - a)}" data-track-index="50" style="z-index:50"><div class="cx">${linhas}</div></div>\n`;
  tw(`tl.fromTo("#lg${i} .cx", { opacity: 0, y: 14, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }, ${f(a)});`);
  gr.forEach((p) => { if (ehChave(p)) { const k = gr.indexOf(p); tw(`tl.fromTo("#lg${i} .cx span:nth-child(${k + 1})", { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(2)", immediateRender: false }, ${f(Math.max(a, p.ini - 0.04))});`); } });
  if (gr.some(ehChave)) som("click-soft", a, 0.03);
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,600&family=Poppins:wght@500;600&family=Special+Elite&display=swap" rel="stylesheet">`;
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
let audios = "";
sons.filter(([, , v]) => v > 0).forEach(([nome, t, v], i) => { const arq = path.basename(man[nome].file || `${nome}.mp3`); fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t)}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${60 + (i % 4)}" data-volume="${v}"></audio>\n`; });

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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 32%; z-index: 0; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .cena { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      .papel { position: absolute; left: 0; top: -120px; width: ${W}px; height: 2160px; }
      .ade { position: absolute; }
      .ade img { display: block; width: 100%; filter: sepia(0.28) contrast(1.06) saturate(0.9) drop-shadow(6px 0 0 ${CR}) drop-shadow(-6px 0 0 ${CR}) drop-shadow(0 6px 0 ${CR}) drop-shadow(0 -6px 0 ${CR}) drop-shadow(0 26px 30px rgba(0,0,0,0.55)); }
      .maq { position: absolute; font-family: "Special Elite"; color: ${CR}; }
      .tic { position: absolute; padding: 22px 34px; background: #EADBB9; color: #3a2a1d; font-family: "Special Elite"; font-size: 46px; line-height: 1.1; text-align: center; border: 3px dashed #8a6d4b; outline: 10px solid #EADBB9; box-shadow: 0 18px 30px rgba(0,0,0,0.5); }
      .risco { position: absolute; height: 7px; background: ${VERM}; transform-origin: 0 50%; border-radius: 4px; transform: rotate(-3deg); }
      .moldura { position: absolute; padding: 16px; background: #EFE4CC; box-shadow: 0 30px 50px rgba(0,0,0,0.6); }
      .moldura img { filter: sepia(0.3) contrast(1.05); display: block; }
      .moldura.ouro { background: linear-gradient(135deg, #8c6a2f, #d9b56a 30%, #7a5a25 55%, #c9a35a 80%, #6e4f20); padding: 26px; }
      .moldura.ouro img { border: 6px solid #2a1d12; }
      .foto-cheia { position: absolute; left: 60px; top: 160px; width: 960px; height: 1000px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
      .foto-cheia img { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.35) contrast(1.08) saturate(0.85); }
      .visor { position: absolute; left: 60px; top: 160px; width: 960px; height: 1000px; pointer-events: none; z-index: 2; }
      .visor i { position: absolute; width: 90px; height: 90px; border: 0 solid ${CR}; }
      .visor .c1 { left: 40px; top: 40px; border-left-width: 6px; border-top-width: 6px; } .visor .c2 { right: 40px; top: 40px; border-right-width: 6px; border-top-width: 6px; }
      .visor .c3 { left: 40px; bottom: 40px; border-left-width: 6px; border-bottom-width: 6px; } .visor .c4 { right: 40px; bottom: 40px; border-right-width: 6px; border-bottom-width: 6px; }
      .visor .mira { left: 455px; top: 475px; width: 50px; height: 50px; border: 4px solid ${CR}; border-radius: 50%; opacity: 0.8; }
      #i6a { z-index: 3; } #i6b { z-index: 1; }
      .polaroid { position: absolute; left: 250px; top: 300px; width: 580px; padding: 22px 22px 0; background: #F1E7D2; box-shadow: 0 40px 70px rgba(0,0,0,0.65); z-index: 5; }
      .polaroid .jan { position: relative; width: 536px; height: 700px; overflow: hidden; clip-path: inset(0); background: #000; }
      .polaroid video { position: absolute; left: 0; top: -110px; width: 536px !important; height: 953px !important; object-fit: cover; filter: sepia(0.35) contrast(1.05); }
      .polaroid .leg { height: 110px; display: flex; align-items: center; justify-content: center; font-family: "Playfair Display"; font-style: italic; font-weight: 600; font-size: 44px; color: #3a2a1d; }
      .carimbo { position: absolute; left: 190px; top: 1460px; padding: 14px 30px; border: 8px solid ${VERM}; color: ${VERM}; font-family: "Special Elite"; font-size: 72px; letter-spacing: 0.06em; border-radius: 10px; mix-blend-mode: normal; }
      .luz { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, #fff6e0, #ffd9a0 40%, rgba(255,200,140,0.6)); opacity: 0; }
      .pre { position: absolute; inset: 0; background: #000; }
      #grao { position: absolute; inset: 0; z-index: 70; background-size: 540px 960px; background-repeat: repeat; mix-blend-mode: overlay; opacity: 0.55; pointer-events: none; }
      #vinheta { position: absolute; inset: 0; z-index: 71; background: radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,10,0,0.55) 100%); pointer-events: none; }
      #tremor { position: absolute; inset: 0; z-index: 72; background: #ffb070; mix-blend-mode: soft-light; opacity: 0.05; pointer-events: none; }
      .grupo { position: absolute; left: 70px; width: 940px; top: 1200px; text-align: center; }
      .cx { display: inline-block; line-height: 1.1; color: ${CR}; text-shadow: 0 2px 18px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.7); }
      .nm, .ch { display: inline-block; margin: 0 0.13em; } .ch { margin: 0 0.2em; transform-origin: 50% 70%; }
      .nm { font-family: "Poppins"; font-weight: 500; font-size: 58px; letter-spacing: -0.01em; }
      .ch { font-family: "Playfair Display"; font-style: italic; font-weight: 600; font-size: 92px; letter-spacing: -0.01em; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/fala.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
${els.join("\n")}
${lh}      <div id="grao"></div><div id="vinheta"></div><div id="tremor"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${nc} cenas de papel, ${grupos.length} legendas, ${sons.length} efeitos`);
