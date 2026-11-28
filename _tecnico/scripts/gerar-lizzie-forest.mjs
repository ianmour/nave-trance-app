#!/usr/bin/env node
// Lizzie — "Forest Shankara" (fotografia de festival). Mesmo estilo aprovado no vídeo do Walter Firmo:
// ela falando alternando com cenas em papel antigo, fotos inteiras impressas (com a pessoa "saltando" da foto),
// granulado de filme, legenda creme Poppins + Playfair itálico, muitos efeitos sonoros (sem música).
// Fotos: Openverse (licença livre, créditos em final/lizzie/CREDITOS-forest.md).
// Uso: node gerar-lizzie-forest.mjs <projeto> <palavras.json> <duração da fala em s> <mapa.json>
import fs from "node:fs";
import path from "node:path";

const [P, TJ] = process.argv.slice(2);
const W = 1080, H = 1920, CR = "#F3E6C8", VERM = "#C2412F";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const FALA = +process.argv[4], DUR = +(FALA + 2.6).toFixed(2); const MAPA = JSON.parse(fs.readFileSync(process.argv[5], "utf8"));

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

let POLAROID = "";
const DIM = { cam1: [1024, 752], cam2: [1024, 818], cam3: [1023, 685], cores: [1023, 682], fest1: [1024, 683], fest2: [1024, 683], fest3: [1024, 732], fest4: [1023, 757], fest5: [1024, 683], amigos1: [1024, 768], floripa1: [1024, 683], floripa2: [1024, 681] };
const alt = (n, w) => Math.round(w * DIM[n][1] / DIM[n][0]);
const impressa = (id, n, x, y, w, rot = 0, pop = false) => `<div id="${id}" class="imp" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg)"><div class="fr" style="width:${w}px;height:${alt(n, w)}px"><img class="ft" src="assets/fotos/${n}.jpg">${pop ? `<img class="pop" src="assets/recortes/${n}.png">` : ""}</div></div>`;
const salta = (id, t, s = 1.12, dur = 0.35) => { tw(`tl.fromTo("#${id} .pop", { opacity: 0, scale: 1 }, { opacity: 1, scale: ${s}, y: -12, duration: ${dur}, ease: "back.out(2.2)", immediateRender: false }, ${f(t)});`); tw(`tl.set("#${id} .pop", { opacity: 0 }, 0);`); tw(`tl.to("#${id} .ft", { filter: "sepia(0.5) brightness(0.55) contrast(1.05)", duration: ${dur} }, ${f(t)});`); som("pop", t, 0.06); };
const cai = (sel, t, r, dy = 200, k = 0) => { tw(`tl.fromTo("${sel}", { scale: 1.5, rotation: ${r + (k % 2 ? 16 : -16)}, y: ${dy}, opacity: 0 }, { scale: 1, rotation: ${r}, y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }, ${f(t)});`); som("click", t, 0.08); };
const maq = (id, txt, estilo) => `<div id="${id}" class="maq" style="${estilo}">${txt}</div>`;
const digita = (id, t) => { tw(`tl.fromTo("#${id}", { opacity: 0, scaleX: 1.4 }, { opacity: 1, scaleX: 1, duration: 0.25, ease: "power2.out" }, ${f(t)});`); som("key-press", t, 0.07); };

// gancho: "É que tanta coisa acontece no momento que eu clico aquele botão." — clique e flash no "clico"
flash(T("clico") - 0.03); som("click", T("clico") - 0.05, 0.1); som("riser", 0, 0.025);

// M1 — Fotografar pra mim é muito mais do que clicar um botão e registrar um momento
{
  const t0 = T("Fotografar") - 0.06, t1 = T("É conseguir") - 0.05;
  papel(t0, t1,
    impressa("m1a", "cam1", 120, 170, 640, -4) +
    maq("m1t", "CLICK.", "left:0;right:0;top:110px;text-align:center;font-size:44px;letter-spacing:0.4em;opacity:0") +
    impressa("m1b", "fest1", 300, 560, 640, 5, true));
  cai("#m1a", t0 + 0.05, -4, 300);
  digita("m1t", T("clicar") - 0.05); flash(T("clicar") - 0.03); som("click", T("clicar") - 0.05, 0.1);
  // a foto "revela" (do branco para a cor) em "registrar um momento"
  tw(`tl.set("#m1b", { opacity: 0 }, 0);`);
  tw(`tl.fromTo("#m1b", { opacity: 0, y: 300, rotation: 14 }, { opacity: 1, y: 0, rotation: 5, duration: 0.35, ease: "back.out(1.5)" }, ${f(T("registrar") - 0.1)});`);
  tw(`tl.fromTo("#m1b .ft", { filter: "brightness(3) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: 0.9, ease: "power2.out", immediateRender: false }, ${f(T("registrar"))});`);
  som("whoosh-short", T("registrar") - 0.15, 0.05); salta("m1b", T("momento") - 0.05, 1.12);
}
// M2 — perceber, enquadrar e registrar pelo menos um pouco daquele sentimento (visor de câmera)
{
  const t0 = T("perceber") - 0.06, t1 = T("Observando") - 0.05;
  papel(t0, t1,
    `<div id="m2f" class="foto-cheia" style="top:230px;height:640px"><img src="assets/fotos/fest2.jpg"></div>` +
    `<div id="m2v" class="visor" style="top:230px;height:640px"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><i class="mira" style="top:295px"></i></div>` +
    maq("m2a", "PERCEBER", "left:60px;top:930px;font-size:52px;letter-spacing:0.12em;opacity:0") +
    maq("m2b", "ENQUADRAR", "left:0;right:0;text-align:center;top:930px;font-size:52px;letter-spacing:0.12em;opacity:0") +
    maq("m2c", "REGISTRAR", "right:60px;top:930px;font-size:52px;letter-spacing:0.12em;opacity:0"), "obt", "sobe");
  tw(`tl.fromTo("#m2f img", { scale: 1.25, x: -60 }, { scale: 1.05, x: 0, duration: ${f(t1 - t0)}, ease: "none" }, ${f(t0)});`);
  tw(`tl.fromTo("#m2a", { opacity: 0 }, { opacity: 1, duration: 0.12 }, ${f(T("perceber") - 0.02)});`); som("key-press", T("perceber"), 0.07);
  tw(`tl.to("#m2a", { opacity: 0, duration: 0.1 }, ${f(T("enquadrar") - 0.08)});`);
  tw(`tl.fromTo("#m2b", { opacity: 0 }, { opacity: 1, duration: 0.12 }, ${f(T("enquadrar") - 0.02)});`); som("key-press", T("enquadrar"), 0.07);
  tw(`tl.fromTo("#m2v", { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "power3.out", immediateRender: false }, ${f(T("enquadrar") - 0.02)});`); som("whoosh-short", T("enquadrar") - 0.1, 0.05);
  tw(`tl.to("#m2b", { opacity: 0, duration: 0.1 }, ${f(T("registrar", 9) - 0.08)});`);
  tw(`tl.fromTo("#m2c", { opacity: 0 }, { opacity: 1, duration: 0.12 }, ${f(T("registrar", 9) - 0.02)});`);
  obturador(T("registrar", 9) + 0.15);
  tw(`tl.to("#m2f img", { filter: "sepia(0.4) contrast(1.1)", duration: 0.2 }, ${f(T("registrar", 9) + 0.2)});`);
  tw(`tl.to("#m2c", { opacity: 0, duration: 0.2 }, ${f(T("sentimento") - 0.1)});`);
  tw(`tl.fromTo("#m2f", { boxShadow: "0 0 0 0 rgba(243,230,200,0)" }, { boxShadow: "0 0 0 14px rgba(243,230,200,1)", duration: 0.3 }, ${f(T("sentimento") - 0.05)});`); som("sparkle", T("sentimento") - 0.1, 0.04);
}
// M3 — fotógrafa dentro desses festivais (três fotos de festival caindo na mesa)
{
  const t0 = T("fotógrafa") - 0.06, t1 = T("algo muito") - 0.06;
  papel(t0, t1, impressa("m3a", "fest3", 40, 200, 560, -6) + impressa("m3b", "fest5", 480, 380, 540, 5) + impressa("m3c", "fest4", 150, 640, 600, -2, true));
  cai("#m3a", t0 + 0.05, -6, 200, 0); cai("#m3b", T("dentro") - 0.05, 5, 200, 1); cai("#m3c", T("festivais") - 0.08, -2, 200, 2);
  salta("m3c", T("festivais") + 0.25, 1.08);
}
// M4 — Por ser público há mais de 12 anos… a relação que a gente constrói dentro dessas festas e festivais
{
  const t0 = T("Por ser") - 0.06, t1 = T("São espaços") - 0.05, t12 = T("12");
  papel(t0, t1,
    `<div id="m4n" style="position:absolute;left:0;right:0;top:150px;text-align:center;font-family:'Playfair Display';font-style:italic;font-weight:600;font-size:330px;line-height:1;color:${CR};text-shadow:0 10px 40px rgba(0,0,0,0.5)">+<span style="display:inline-block;position:relative;width:1.2em;height:1em">${Array.from({ length: 13 }, (_, k) => `<span id="m4c${k}" style="position:absolute;left:0;right:0;opacity:0">${k}</span>`).join("")}</span></div>` +
    maq("m4a", "ANOS DE PISTA", "left:0;right:0;text-align:center;top:520px;font-size:58px;letter-spacing:0.3em;opacity:0") +
    impressa("m4b", "amigos1", 170, 640, 740, -3, true), "sobe", "obt");
  tw(`tl.fromTo("#m4n", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, ${f(t0 + 0.05)});`);
  for (let k = 0; k <= 12; k++) { const tk = t0 + 0.1 + (t12 - t0 - 0.1) * k / 12; tw(`tl.set("#m4c${k}", { opacity: 1 }, ${f(tk)});`); if (k < 12) tw(`tl.set("#m4c${k}", { opacity: 0 }, ${f(t0 + 0.1 + (t12 - t0 - 0.1) * (k + 1) / 12)});`); }
  som("typing", t0 + 0.1, 0.05); som("impact-bass-1", t12, 0.06);
  digita("m4a", t12 + 0.1);
  tw(`tl.set("#m4b", { opacity: 0 }, 0);`); cai("#m4b", T("relação") - 0.1, -3, 400, 1);
  salta("m4b", T("constrói") - 0.05, 1.1);
}
// M5 — a liberdade de poder sair da rotina, desestressar e encontrar pessoas e viver experiências… difícil colocar em palavras
{
  const t0 = T("a liberdade") - 0.06, t1 = T("E é isso") - 0.05;
  papel(t0, t1,
    impressa("m5a", "cores", 60, 180, 700, -4) +
    impressa("m5b", "fest1", 380, 470, 620, 4, true) +
    impressa("m5c", "fest5", 90, 560, 620, -3) +
    maq("m5t", "…difícil colocar em palavras.", "left:0;right:0;text-align:center;top:1110px;font-size:46px;opacity:0"));
  cai("#m5a", t0 + 0.04, -4, 250, 0);
  tw(`tl.set("#m5b, #m5c", { opacity: 0 }, 0);`);
  cai("#m5b", T("encontrar") - 0.08, 4, 250, 1); salta("m5b", T("pessoas", 33) - 0.05, 1.12);
  cai("#m5c", T("experiências") - 0.08, -3, 250, 2);
  tw(`tl.to("#m5a, #m5b", { opacity: 0.25, duration: 0.3 }, ${f(T("experiências"))});`);
  tw(`tl.fromTo("#m5t", { opacity: 0 }, { opacity: 0.9, duration: 0.4 }, ${f(T("difícil") - 0.1)});`); som("typing", T("difícil") - 0.1, 0.05);
}
// M6 — respeitando a naturalidade dos encontros das pessoas com os amigos, consigo mesmas
{
  const t0 = T("respeitando") - 0.06, t1 = T("E nos dias") - 0.05;
  papel(t0, t1,
    impressa("m6a", "fest3", 70, 210, 500, -7) + impressa("m6b", "amigos1", 520, 200, 480, 6) +
    impressa("m6c", "fest4", 200, 560, 680, -2, true), "obt", "sobe");
  cai("#m6a", t0 + 0.04, -7, 200, 0); cai("#m6b", T("naturalidade") - 0.05, 6, 200, 1); cai("#m6c", T("encontros") - 0.05, -2, 200, 2);
  salta("m6c", T("amigos") - 0.05, 1.08);
}
// M7 — E nos dias 5 e 6 de dezembro eu estarei com a Forest Shankara na Ilha da Magia, fazendo tudo isso através das minhas lentes
{
  const t0 = T("E nos dias") - 0.06, t1 = T("Ainda mais") - 0.05;
  papel(t0, t1,
    `<div id="m7d" class="tic" style="left:150px;top:150px;width:780px;padding:30px 20px;transform:rotate(-3deg)"><div style="font-size:120px;line-height:1">5 &amp; 6</div><div style="font-size:54px;letter-spacing:0.3em;margin-top:8px">DEZEMBRO</div></div>` +
    maq("m7f", "FOREST SHANKARA", "left:0;right:0;text-align:center;top:540px;font-size:62px;letter-spacing:0.18em;opacity:0") +
    impressa("m7p", "floripa1", 200, 650, 680, 4) +
    `<div id="m7l" style="position:absolute;left:0;right:0;top:1090px;text-align:center;font-family:'Playfair Display';font-style:italic;font-weight:600;font-size:64px;color:${CR};opacity:0">Ilha da Magia</div>` +
    `<div id="m7v" class="visor" style="left:225px;top:670px;width:630px;height:420px;opacity:0"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div>`);
  tw(`tl.fromTo("#m7d", { scale: 2.4, opacity: 0, rotation: 8 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.25, ease: "power4.in" }, ${f(T("5") - 0.08)});`); som("impact-bass-2", T("5") + 0.12, 0.07);
  digita("m7f", T("Forest") - 0.05); som("typing", T("Forest"), 0.05);
  tw(`tl.set("#m7p", { opacity: 0 }, 0);`); cai("#m7p", T("Ilha") - 0.12, 4, 300, 1);
  tw(`tl.fromTo("#m7l", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, ${f(T("Ilha") + 0.1)});`);
  tw(`tl.fromTo("#m7v", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, ${f(T("lentes") - 0.4)});`); obturador(T("lentes") + 0.05);
}
// aniversário: página de calendário "6 DEZ" com círculo vermelho desenhado à mão (embaixo, sem cobrir o rosto)
{
  const t = T("aniversário") - 0.08, t1 = T("Então") - 0.06;
  clip("cal", t, t1, `<div class="calend"><div class="topo">DEZEMBRO</div><div class="dia">6</div><svg viewBox="0 0 300 300" class="circ"><path d="M150 30 C 250 25, 285 120, 260 200 C 235 275, 80 285, 35 200 C 0 130, 50 40, 160 38" fill="none" stroke="${VERM}" stroke-width="10" stroke-linecap="round"/></svg></div>`, 20);
  tw(`tl.fromTo("#cal .calend", { y: 500, rotation: 12, opacity: 0 }, { y: 0, rotation: -5, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, ${f(t)});`); som("whoosh-short", t - 0.1, 0.05);
  tw(`tl.fromTo("#cal .circ path", { strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, ${f(T("6", 55) - 0.05)});`); som("sparkle", T("6", 55) - 0.1, 0.06);
  tw(`tl.to("#cal .calend", { y: 600, rotation: 20, duration: 0.3, ease: "power2.in" }, ${f(t1 - 0.3)});`);
}
// final — "vem com a gente": ela numa polaroid sobre o papel, com as fotos do festival em volta
{
  const t0 = T("vem com") - 0.05;
  papel(t0, DUR + 0.2,
    impressa("e1", "fest3", 30, 120, 330, -8) + impressa("e2", "fest1", 720, 100, 330, 7) + impressa("e3", "cores", 20, 760, 330, 6) + impressa("e4", "floripa1", 730, 780, 330, -6) +
    `<div id="assin" style="position:absolute;left:0;right:0;top:1330px;text-align:center;opacity:0;z-index:13"><div style="font-family:'Playfair Display';font-style:italic;font-weight:600;font-size:104px;color:${CR};text-shadow:0 4px 20px rgba(0,0,0,0.6)">vem com a gente</div><i style="display:block;margin:10px auto 0;width:460px;height:4px;background:${CR};opacity:0.8;transform-origin:0 50%"></i><div class="maq" style="position:static;margin-top:26px;font-size:36px;letter-spacing:0.3em">5 &amp; 6 DEZ · ILHA DA MAGIA</div></div>` +
    `<div id="vaz" style="position:absolute;inset:0;z-index:14;mix-blend-mode:screen;pointer-events:none"><i class="luz"></i></div>`, "sobe", "fim");
  POLAROID = `      <div id="e7p" class="polaroid" style="z-index:12;opacity:0"><i class="fita f1"></i><i class="fita f2"></i><div class="jan"><video id="ela2" class="clip" src="assets/fala.mp4" muted data-start="${f(t0)}" data-duration="${f(DUR - t0)}" data-media-start="${f(t0)}" data-track-index="30"></video></div><div class="leg"></div></div>`;
  tw(`tl.set("#e7p", { opacity: 1 }, ${f(t0)});`);
  ["#e1", "#e2", "#e3", "#e4"].forEach((s, k) => { cai(s, t0 + 0.1 + k * 0.12, [-8, 7, 6, -6][k], 150, k); tw(`tl.to("${s}", { y: ${k % 2 ? -16 : 16}, duration: ${f(DUR - t0 - 0.6)}, ease: "none" }, ${f(t0 + 0.5)});`); });
  tw(`tl.fromTo("#e7p", { y: 1300, rotation: 14 }, { y: 0, rotation: -2, duration: 0.5, ease: "back.out(1.2)" }, ${f(t0)});`); som("whoosh", t0 - 0.1, 0.05);
  tw(`tl.to("#e7p", { rotation: 1.5, scale: 1.05, duration: ${f(DUR - t0 - 0.5)}, ease: "sine.inOut" }, ${f(t0 + 0.5)});`);
  const tf = FALA + 0.1;
  tw(`tl.fromTo("#assin", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, ${f(tf)});`);
  tw(`tl.fromTo("#assin i", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, ${f(tf + 0.25)});`);
  tw(`tl.fromTo("#vaz .luz", { opacity: 0, x: -500 }, { opacity: 0.35, x: 300, duration: 1.6, ease: "sine.inOut" }, ${f(tf + 0.3)});`);
  som("chime", tf + 0.1, 0.035); som("click-soft", tf + 0.3, 0.05);
}
clip("fim", DUR - 0.8, DUR, `<i class="pre"></i>`, 45);
tw(`tl.fromTo("#fim .pre", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.in" }, ${f(DUR - 0.8)});`);

// ---------- câmera dela: "soco" no começo; nos cortes internos (pausas encurtadas) o enquadramento alterna, para não "pular" ----------
tw(`tl.set("#camera", { scale: 1.22 }, 0);`); tw(`tl.to("#camera", { scale: 1.02, duration: 0.45, ease: "power3.out" }, 0);`);
MAPA.forEach((m, i) => { if (i === 0) return; tw(`tl.set("#camera", { scale: ${i % 2 ? 1.1 : 1.0} }, ${f(m.ini)});`); });

// ---------- granulado de filme (12 por segundo) + luz quente piscando ----------
for (let t = 0, k = 0; t < DUR; t += 1 / 12, k++) tw(`tl.set("#grao", { backgroundImage: "url(assets/tex/grao${(k * 5) % 8}.png)", backgroundPosition: "${Math.round(rnd() * 300)}px ${Math.round(rnd() * 300)}px" }, ${f(t)});`);
for (let t = 0; t < DUR; t += 0.25) tw(`tl.set("#tremor", { opacity: ${f(0.03 + rnd() * 0.05)} }, ${f(t)});`);

// ---------- legenda ----------
const CHAVES = new Set(["botao", "momento", "olhar", "sentimento", "memoria", "fotografa", "festivais", "sensivel", "12", "anos", "liberdade", "rotina", "pessoas", "experiencias", "palavras", "move", "espontaneidade", "naturalidade", "encontros", "dezembro", "forest", "shankara", "magia", "lentes", "aniversario", "especial", "vocês", "voces", "gente"]);
const ehChave = (p) => CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => { const q = PAL[i + 1]; g.push(p); if (!q || /[.,!?;:]$/.test(p.texto) || q.ini - p.fim >= 0.3 || g.length >= 3 || (ehChave(p) && g.length >= 2)) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
let lh = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0, gr[0].ini - 0.06), prox = grupos[i + 1];
  const b = prox ? Math.min(prox[0].ini - 0.06, gr.at(-1).fim + 0.5) : FALA + 0.35;
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
      .imp { position: absolute; padding: 14px 14px 40px; background: #EFE4CC; box-shadow: 0 30px 50px rgba(0,0,0,0.6); }
      .imp .fr { position: relative; }
      .imp .ft { display: block; width: 100%; height: 100%; filter: sepia(0.25) contrast(1.05); }
      .imp .pop { position: absolute; left: 0; top: 0; width: 100%; height: 100%; transform-origin: 50% 85%; filter: sepia(0.2) contrast(1.06) drop-shadow(5px 0 0 ${CR}) drop-shadow(-5px 0 0 ${CR}) drop-shadow(0 5px 0 ${CR}) drop-shadow(0 -5px 0 ${CR}) drop-shadow(0 24px 26px rgba(0,0,0,0.6)); }
      .fita { position: absolute; width: 170px; height: 52px; background: rgba(226,212,178,0.78); z-index: 3; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
      .fita.f1 { left: -40px; top: -18px; transform: rotate(-32deg); } .fita.f2 { right: -40px; top: -18px; transform: rotate(32deg); }
      .calend { position: absolute; left: 330px; top: 1430px; width: 420px; background: #EFE4CC; box-shadow: 0 30px 50px rgba(0,0,0,0.55); text-align: center; font-family: "Special Elite"; color: #2a1d15; }
      .calend .topo { background: ${VERM}; color: #F3E6C8; font-size: 40px; letter-spacing: 0.2em; padding: 10px 0; }
      .calend .dia { font-family: "Playfair Display"; font-weight: 600; font-size: 230px; line-height: 1.1; }
      .calend .circ { position: absolute; left: 60px; top: 60px; width: 300px; height: 300px; }
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
      .polaroid { position: absolute; left: 200px; top: 180px; width: 680px; padding: 22px 22px 0; background: #F1E7D2; box-shadow: 0 40px 70px rgba(0,0,0,0.65); z-index: 5; }
      .polaroid .jan { position: relative; width: 636px; height: 820px; overflow: hidden; clip-path: inset(0); background: #000; }
      .polaroid video { position: absolute; left: 0; top: -120px; width: 636px !important; height: 1131px !important; object-fit: cover; filter: sepia(0.35) contrast(1.05); }
      .polaroid .leg { height: 100px; display: flex; align-items: center; justify-content: center; font-family: "Playfair Display"; font-style: italic; font-weight: 600; font-size: 44px; color: #3a2a1d; }
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
${POLAROID}
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
