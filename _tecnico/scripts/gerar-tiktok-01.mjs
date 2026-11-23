#!/usr/bin/env node
// TikTok 01 (cliente, vagas da Desenvolve / lives) — falado, interativo sem exagero.
// Legenda "mago" + poucos elementos de interface ligados à fala + transições nos cortes de cena + efeitos sonoros.
// Uso: node gerar-tiktok-01.mjs <pasta-do-projeto> <cortes.json> <transcricao do corte (whisper json)>
import fs from "node:fs";
import path from "node:path";

const [P, CORTES, TJ] = process.argv.slice(2);
const W = 1080, H = 1920;
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// ---- tempo dos cortes (original -> vídeo cortado) ----
const cortes = JSON.parse(fs.readFileSync(CORTES, "utf8"));
const fr = (t) => Math.round(t * 30);
const segs = []; let acc = 0;
// trecho com 3º item (ex.: "take") vem de outro arquivo: não conta para achar as cenas do original
for (const [s, e, fonte] of cortes) { const d = (fr(e) - fr(s)) / 30; segs.push({ s, e, fonte, ini: acc, fim: acc + d }); acc += d; }
const orig = segs.filter((g) => !g.fonte);
const DUR = +acc.toFixed(4);
const deOriginal = (t) => { const g = orig.find((x) => t >= x.s && t <= x.e); return g.ini + (t - g.s); };

// ---- palavras (texto corrigido onde o whisper errou) ----
const CORRIGE = { "desenvolve?": "Desenvolve?", macio: "Maceió", "macio,": "Maceió,", terezina: "Teresina", socorro: "Socorro", desenvolver: "Desenvolve", "5x2.": "5x2." };
const pal = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription
  .map((t) => ({ texto: t.text.trim(), ini: t.offsets.from / 1000, fim: t.offsets.to / 1000 })).filter((p) => nrm(p.texto));
pal.forEach((p, i) => {
  p.texto = CORRIGE[p.texto.toLowerCase()] ?? p.texto;
  if (p.texto === "de" && pal[i + 1]?.texto === "a" && /desenvolve/i.test(pal[i + 2]?.texto)) { p.texto = "da"; pal[i + 1].fora = true; }
  if (p.texto === "de" && /^ades$/i.test(pal[i + 1]?.texto || "") && /^envolv/i.test(pal[i + 2]?.texto || "")) { p.texto = "da"; pal[i + 1].texto = "Desenvolve" + (pal[i + 2].texto.match(/[?.,!]$/)?.[0] || ""); pal[i + 1].fim = pal[i + 2].fim; pal[i + 2].fora = true; }
  if (p.texto === "de" && /^adesenvolv/i.test(pal[i + 1]?.texto || "")) { p.texto = "da"; pal[i + 1].texto = "Desenvolve" + (pal[i + 1].texto.match(/[?.,!]$/)?.[0] || ""); }
  if (p.texto === "Tik" && /^Tok/.test(pal[i + 1]?.texto)) { p.texto = "TikTok" + pal[i + 1].texto.slice(3); p.fim = pal[i + 1].fim; pal[i + 1].fora = true; }
});
const PAL = pal.filter((p) => !p.fora);
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };

// ---- elementos de interface (poucos, ligados à fala) ----
const els = [], js = [];
const el = (id, t0, t1, html, estilo) => els.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}" data-layout-allow-overlap>${html}</div>`);
const tw = (s) => js.push("      " + s);
const pop = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.6, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: "back.out(1.8)" }, ${f(t)});`);
const some = (s, t) => tw(`tl.to("${s}", { scale: 0.9, opacity: 0, duration: 0.2, ease: "power2.in" }, ${f(t)});`);
const sons = []; const som = (nome, t, v) => sons.push([nome, t, v]);

// 1) busca "vagas de emprego" sendo digitada (gancho)
const b0 = 0.08, b1 = T("Então") - 0.1, busca = "vagas home office 5x2";
el("busca", b0, b1, `<div class="busca"><svg viewBox="0 0 24 24" width="44" height="44"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#8A3FFC" stroke-width="2.6"/><path d="M15.5 15.5L21 21" stroke="#8A3FFC" stroke-width="2.4" stroke-linecap="round"/></svg><span class="bt">${busca.split("").map((c, i) => `<i id="bc${i}">${c === " " ? "&nbsp;" : c}</i>`).join("")}</span><b class="cursor"></b><span class="pesq">Pesquisar</span></div>`, "left:110px;top:330px;width:840px");
pop("#busca .busca", b0);
busca.split("").forEach((c, i) => tw(`tl.fromTo("#bc${i}", { opacity: 0 }, { opacity: 1, duration: 0.01 }, ${f(T("procurando") + i * 0.055)});`));
tw(`tl.fromTo("#busca .cursor", { opacity: 1 }, { opacity: 0, duration: 0.4, repeat: ${Math.floor((b1 - b0) / 0.8)}, yoyo: true, ease: "steps(1)" }, ${f(b0)});`);
some("#busca .busca", b1 - 0.2);
som("typing", T("procurando"), 0.06); som("pop", b0, 0.07); som("whoosh-short", b1 - 0.2, 0.05);

// 2) selo AO VIVO no TikTok
const lv = (id, t0, t1, topo) => {
  el(id, t0, t1, `<div class="live"><i></i>AO VIVO</div>`, `left:0;width:${W}px;top:${topo}px;text-align:center`);
  pop(`#${id} .live`, t0);
  tw(`tl.fromTo("#${id} .live i", { opacity: 1 }, { opacity: 0.25, duration: 0.45, repeat: ${Math.floor((t1 - t0) / 0.9) * 2}, yoyo: true, ease: "sine.inOut" }, ${f(t0 + 0.3)});`);
  some(`#${id} .live`, t1 - 0.2);
  som("pop", t0, 0.08);
  const cores = ["#FE2C55", "#8A3FFC", "#25F4EE", "#FF6FA0", "#B07CFF"], n = Math.min(9, Math.floor((t1 - t0) / 0.22));
  el(id + "c", t0, t1, Array.from({ length: n }, (_, k) => `<svg id="${id}h${k}" class="cor" viewBox="0 0 24 24" width="${54 + (k % 3) * 10}" height="${54 + (k % 3) * 10}" style="left:${(k * 37) % 90}px"><path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 3 5 6.6 5c2.1 0 3.6 1.2 5.4 3.1C13.8 6.2 15.3 5 17.4 5 21 5 23.1 8.6 21.6 11.9 19.5 16.4 12 21 12 21z" fill="${cores[k % cores.length]}"/></svg>`).join(""), "left:820px;top:1420px;width:140px;height:10px");
  for (let k = 0; k < n; k++) tw(`tl.fromTo("#${id}h${k}", { y: 0, opacity: 0, scale: 0.4 }, { y: -560, opacity: 0, scale: 1.1, duration: 1.6, ease: "power1.out", keyframes: { opacity: [0, 1, 1, 0] } }, ${f(t0 + 0.1 + k * 0.2)});`);
};
lv("lv1", T("ao vivo") - 0.05, T("Na live") - 0.05, 300);

// 3) escala 5x2: 7 bolinhas, 5 acesas
const e0 = T("escala") - 0.05, e1 = T("E o melhor") - 0.05;
el("escala", e0, e1, `<div class="pilula"><span>Escala 5x2</span><span class="dias">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<i id="d${i}" class="${i < 5 ? "on" : ""}"></i>`).join("")}</span></div>`, "left:0;width:1080px;top:300px;text-align:center");
pop("#escala .pilula", e0);
[0, 1, 2, 3, 4, 5, 6].forEach((i) => tw(`tl.fromTo("#d${i}", { scale: 0 }, { scale: 1, duration: 0.18, ease: "back.out(2)" }, ${f(e0 + 0.25 + i * 0.07)});`));
some("#escala .pilula", e1 - 0.2);
som("pop", e0, 0.07); som("click-soft", e0 + 0.3, 0.05);

// 4) perguntas chegando no chat da live
const q0 = T("mandar") - 0.05, q1 = T("Atente-se") - 0.1;
const perg = [["Precisa de experiência?", q0 + 0.05], ["Como é a entrevista?", q0 + 0.6], ["Qual o horário?", q0 + 1.15]];
el("chat", q0, q1, perg.map(([q], i) => `<div id="q${i}" class="msg"><i class="u u${i}"></i><span><b class="n${i}">${["ana", "joao", "bia"][i]}</b> ${q}</span></div>`).join(""), "left:90px;top:1250px;width:640px");
perg.forEach(([, t], i) => { tw(`tl.fromTo("#q${i}", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.28, ease: "power3.out" }, ${f(t)});`); som("notification", t, 0.05); });
tw(`tl.to("#chat .msg", { opacity: 0, x: -30, duration: 0.2, stagger: 0.04, ease: "power2.in" }, ${f(q1 - 0.25)});`);

// 5) programação das lives (card) — legenda some enquanto o card fala por ela
const c0 = T("dia 25") - 0.25, c1 = T("Fique") - 0.12;
const cidades = [["25", "Maceió", T("dia 25")], ["26", "Teresina", T("dia 26")], ["27", "Socorro e região", T("dia 27")]];
el("agenda", c0, c1, `<div class="agenda"><div class="ag-t"><i class="ag-dot"></i>Lives no TikTok</div>${cidades.map(([d, c], i) => `<div id="ag${i}" class="ag-l"><span class="ag-d">${d}</span><span class="ag-c">${c}</span><span id="ah${i}" class="ag-h">12h</span></div>`).join("")}</div>`, "left:150px;top:1040px;width:760px");
tw(`tl.fromTo("#agenda .agenda", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, ${f(c0)});`);
tw(`tl.set("#agenda .agenda", { clipPath: "inset(0 0 53% 0 round 40px)" }, ${f(c0)});`);
cidades.forEach(([, , t], i) => { if (i) tw(`tl.to("#agenda .agenda", { clipPath: "inset(0 0 ${i === 1 ? 26 : 0}% 0 round 40px)", duration: 0.3, ease: "power3.out" }, ${f(t - 0.08)});`); tw(`tl.fromTo("#ag${i}", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, ${f(t - 0.05)});`); som("pop", t - 0.05, 0.06); });
const tMeio = T("meio-dia");
cidades.forEach((_, i) => tw(`tl.fromTo("#ah${i}", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, ${f(tMeio - 0.05 + i * 0.08)});`));
som("click", tMeio - 0.05, 0.06); som("whoosh-short", c0, 0.05);
tw(`tl.to("#agenda .agenda", { opacity: 0, y: 40, duration: 0.25, ease: "power2.in" }, ${f(c1 - 0.25)});`);
som("whoosh-short", c1 - 0.25, 0.04);
const escondeLeg = (t) => t >= c0 && t < c1;

// 6) botão Seguir sendo apertado
const s0 = T("segue") - 0.15, s1 = T("A gente te") - 0.05;
el("seguir", s0, s1, `<div class="perfil"><span class="av">D</span><span class="pn"><b>Desenvolve</b><small>Vagas e lives</small></span><span class="btn"><span id="bt-a">Seguir</span><span id="bt-b">Seguindo ✓</span></span></div><div class="dedo"></div>`, "left:150px;top:1290px;width:760px");
pop("#seguir .perfil", s0);
const tClique = T("Desenvolve", s0) + 0.15;
tw(`tl.fromTo("#seguir .dedo", { opacity: 0, x: 80, y: 80 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power2.out" }, ${f(tClique - 0.35)});`);
tw(`tl.to("#seguir .btn", { scale: 0.9, duration: 0.08, yoyo: true, repeat: 1 }, ${f(tClique)});`);
tw(`tl.set("#bt-a", { display: "none" }, ${f(tClique + 0.08)}); tl.set("#bt-b", { display: "inline" }, ${f(tClique + 0.08)}); tl.set("#seguir .btn", { backgroundColor: "#2c2c2e" }, ${f(tClique + 0.08)});`);
tw(`tl.to("#seguir .dedo", { opacity: 0, duration: 0.2 }, ${f(tClique + 0.4)});`);
some("#seguir .perfil", s1 - 0.2);
som("pop", s0, 0.07); som("click", tClique, 0.09);

// 7) AO VIVO de novo no fim
lv("lv2", T("A gente te") - 0.05, DUR, 300);

// ---- câmera: jump cuts alternam aberto/fechado; cortes de cena ganham transição ----
const cenaOrig = [8.867, 19.133, 23.1, 36.6];
const cenas = cenaOrig.map((t) => { const j = orig.findIndex((g) => g.s >= t); return orig.find((g) => t > g.s && t < g.e) ? deOriginal(t) : orig[j].ini; });
const pulos = segs.slice(1).map((g) => g.ini).filter((t) => !cenas.some((c) => Math.abs(c - t) < 0.02));
const cam = [];
cam.push(`tl.set("#camera", { scale: 1 }, 0); tl.set("#flash", { opacity: 0 }, 0);`);
pulos.forEach((t, i) => { cam.push(`tl.set("#camera", { scale: ${i % 2 ? 1 : 1.12} }, ${f(t)});`); som("whoosh-short", t - 0.04, 0.03); });
cenas.forEach((t, i) => {
  if (i === 1) { cam.push(`tl.set("#camera", { scale: 1 }, ${f(t)});`); som("whoosh-short", t - 0.05, 0.04); return; } // virada da cadeira: corte seco, o movimento já liga as cenas
  cam.push(`tl.fromTo("#camera", { scale: 1.22 }, { scale: 1, duration: 0.42, ease: "expo.out" }, ${f(t)});`);
  cam.push(`tl.fromTo("#flash", { opacity: 0.55 }, { opacity: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, ${f(t)});`);
  som("whoosh", t - 0.12, 0.06);
});

// ---- legenda "mago" ----
const CHAVES = new Set(["emprego", "desenvolve", "vivo", "5x2", "pergunta", "programacao", "oportunidade"]);
const ehChave = (p) => p && CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => {
  const prox = PAL[i + 1];
  if (escondeLeg(p.ini)) return;
  if (ehChave(p)) { if (g.length) { grupos.push(g); g = []; } const gc = [p]; gc.chave = true; grupos.push(gc); return; }
  g.push(p);
  if (!prox || /[.,!?;:]$/.test(p.texto) || prox.ini - p.fim >= 0.2 || g.length === 3 || ehChave(prox) || escondeLeg(prox.ini)) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const ini = Math.max(0.02, gr[0].ini - 0.04), prox = grupos[i + 1];
  const fim = Math.min(prox ? prox[0].ini - 0.03 : DUR, gr[gr.length - 1].fim + 0.35, escondeLeg(gr[gr.length - 1].fim + 0.3) ? c0 : DUR, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(ini)}" data-duration="${f(Math.max(0.12, fim - ini))}" data-track-index="0"><div class="cx${gr.chave ? " ch" : ""}">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw">${esc(p.texto.replace(/[.,?]$/, ""))}</span>`).join(" ")}</div></div>\n`;
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
    .busca { display: flex; align-items: center; gap: 18px; padding: 22px 30px; border-radius: 999px; background: rgba(255,255,255,0.97); box-shadow: -6px 6px 0 rgba(37,244,238,0.9), 6px -6px 0 rgba(254,44,85,0.9), 0 18px 50px rgba(0,0,0,0.28); color: #161823; font-size: 42px; font-weight: 600; }
    .bt { flex: 1; } .bt i { font-style: normal; } .pesq { font-size: 34px; font-weight: 800; color: #FE2C55; } .cursor { display: inline-block; width: 3px; height: 50px; background: #1c1c1e; margin-left: -12px; }
    .live { display: inline-flex; align-items: center; gap: 16px; padding: 16px 32px; border-radius: 14px; background: linear-gradient(90deg, #FE2C55, #8A3FFC); color: #fff; font-size: 44px; font-weight: 800; letter-spacing: 0.02em; box-shadow: -5px 4px 0 #25F4EE, 0 12px 34px rgba(138,63,252,0.4); }
    .live i { width: 18px; height: 18px; border-radius: 50%; background: #fff; display: block; }
    .pilula { display: inline-flex; align-items: center; gap: 26px; padding: 22px 36px; border-radius: 999px; background: linear-gradient(90deg, #6A2BE0, #8A3FFC); color: #fff; font-size: 48px; font-weight: 800; box-shadow: -5px 5px 0 #25F4EE, 5px -5px 0 #FE2C55, 0 14px 34px rgba(0,0,0,0.3); }
    .dias { display: inline-flex; gap: 10px; } .dias i { width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,0.22); display: block; } .dias i.on { background: #fff; }
    .msg { display: block; width: fit-content; margin-top: 14px; padding: 14px 26px 14px 14px; border-radius: 999px; background: rgba(22,24,35,0.6); color: #fff; font-size: 38px; font-weight: 500; display: flex; align-items: center; gap: 14px; }
    .msg b { font-weight: 700; margin-right: 4px; } .msg .u { width: 54px; height: 54px; border-radius: 50%; flex: none; } .msg .u0 { background: linear-gradient(135deg, #25F4EE, #8A3FFC); } .msg .u1 { background: linear-gradient(135deg, #FE2C55, #8A3FFC); } .msg .u2 { background: linear-gradient(135deg, #8A3FFC, #25F4EE); } .msg .n0 { color: #7FFBF7; } .msg .n1 { color: #FF8AA3; } .msg .n2 { color: #C5A3FF; }
    .agenda { padding: 34px 38px 26px; border-radius: 40px; background: rgba(255,255,255,0.96); color: #1c1c1e; box-shadow: 0 24px 60px rgba(0,0,0,0.3); }
    .ag-t { display: flex; align-items: center; gap: 14px; font-size: 34px; font-weight: 800; color: #8A3FFC; letter-spacing: 0.01em; margin-bottom: 14px; } .ag-dot { width: 18px; height: 18px; border-radius: 50%; background: #FE2C55; box-shadow: -3px 2px 0 #25F4EE; display: block; } .agenda { box-shadow: -8px 8px 0 rgba(37,244,238,0.9), 8px -8px 0 rgba(254,44,85,0.9), 0 24px 60px rgba(0,0,0,0.3) !important; }
    .ag-l { display: flex; align-items: center; gap: 26px; padding: 12px 0; border-top: 2px solid #ececf0; }
    .ag-d { width: 108px; text-align: center; font-size: 60px; font-weight: 800; line-height: 0.9; letter-spacing: -0.04em; } .ag-d small { display: block; font-size: 22px; font-weight: 700; color: #FE2C55; letter-spacing: 0.06em; margin-top: 6px; }
    .ag-c { flex: 1; font-size: 50px; font-weight: 700; letter-spacing: -0.03em; }
    .ag-h { padding: 10px 22px; border-radius: 999px; background: linear-gradient(90deg, #FE2C55, #8A3FFC); color: #fff; font-size: 36px; font-weight: 800; }
    .perfil { display: flex; align-items: center; gap: 24px; padding: 24px 28px; border-radius: 34px; background: rgba(255,255,255,0.96); color: #1c1c1e; box-shadow: 0 18px 50px rgba(0,0,0,0.28); }
    .av { width: 96px; height: 96px; border-radius: 50%; background: #161823; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; box-shadow: 0 0 0 5px #fff, 0 0 0 10px #8A3FFC, -4px 3px 0 10px #25F4EE; }
    .pn { flex: 1; } .pn b { display: block; font-size: 46px; font-weight: 800; letter-spacing: -0.03em; } .pn small { display: block; font-size: 30px; color: #6e6e73; font-weight: 500; }
    .btn { padding: 20px 38px; border-radius: 18px; background: #FE2C55; color: #fff; font-size: 38px; font-weight: 800; } #bt-b { display: none; }
    .cor { position: absolute; top: 0; opacity: 0; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25)); }
    .dedo { position: absolute; right: 70px; top: 100px; width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.85); border: 4px solid rgba(0,0,0,0.25); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
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
    .grupo { position: absolute; left: 120px; width: 800px; top: 1130px; text-align: center; }
    .cx { display: inline-block; font-family: "Inter"; font-weight: 500; font-size: 76px; line-height: 1.12; letter-spacing: -0.035em; color: #fff; text-shadow: 0 0 26px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.35); }
    .cx.ch { font-weight: 700; font-size: 94px; letter-spacing: -0.04em; }
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
let audios = "";
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  const t0 = Math.max(0, t);
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t0)}" data-duration="${f(Math.min(man[nome].duration, DUR - t0 - 0.01))}" data-track-index="${5 + (i % 4)}" data-volume="${v}"></audio>\n`;
});

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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 34%; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #flash { position: absolute; inset: 0; background: #fff; opacity: 0; z-index: 4; }
      #app, #legendas { position: absolute; inset: 0; } #app { z-index: 2; } #legendas { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo"${grade_} class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="app" data-composition-id="app" data-composition-src="compositions/app.html" data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
      <div id="flash" class="clip" data-start="0" data-duration="${DUR}" data-track-index="3" data-layout-allow-occlusion></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${els.length} elementos, ${grupos.length} blocos de legenda, ${sons.length} efeitos, cenas em ${cenas.map((c) => c.toFixed(2)).join(", ")}, pulos em ${pulos.map((c) => c.toFixed(2)).join(", ")}, ${DUR}s`);
