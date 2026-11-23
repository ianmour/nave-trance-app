#!/usr/bin/env node
// Desenvolve Já 02 — "Indique um amigo: R$200" (vagas Almaviva). Falado, interativo sem exagero,
// com a identidade da Desenvolve Já (turquesa #5CE1E6, marinho #001459, rosa #F9057F, branco;
// títulos em letra condensada grossa, texto em letra arredondada).
// Uso: node gerar-desenvolve-02.mjs <pasta-do-projeto> <cortes.json> <transcricao do corte (whisper json)>
import fs from "node:fs";
import path from "node:path";

const [P, CORTES, TJ] = process.argv.slice(2);
const W = 1080, H = 1920, FPS = 24;
const TQ = "#5CE1E6", MA = "#001459", RS = "#F9057F";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// ---- tempo dos cortes ----
const cortes = JSON.parse(fs.readFileSync(CORTES, "utf8"));
const fr = (t) => Math.round(t * FPS);
const segs = []; let acc = 0;
for (const [s, e] of cortes) { const d = (fr(e) - fr(s)) / FPS; segs.push({ s, e, ini: acc, fim: acc + d }); acc += d; }
const DUR = +acc.toFixed(4);
const deOriginal = (t) => { const g = segs.find((x) => t >= x.s && t <= x.e); return g.ini + (t - g.s); };

// ---- palavras (corrigindo o que o whisper ouviu errado) ----
const pal = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription
  .map((t) => ({ texto: t.text.trim().replace(/["“”]/g, ""), ini: t.offsets.from / 1000, fim: t.offsets.to / 1000 })).filter((p) => nrm(p.texto));
pal.forEach((p, i) => {
  const q = pal[i + 1];
  if (p.texto === "Alma" && /^Viva/.test(q?.texto)) { p.texto = "Almaviva"; p.fim = q.fim; q.fora = true; }
  if (p.texto === "em" && q?.texto === "sino") { p.texto = "ensino"; p.fim = q.fim; q.fora = true; }
  if (p.texto === "R$" && /^200/.test(q?.texto || "")) { p.texto = "R$" + q.texto; p.fim = q.fim; q.fora = true; }
  if (p.texto === "Envi") p.texto = "Envie";
  if (p.texto === "indique") p.texto = "Indique";
  if (/^Desenvolve$/.test(p.texto) && /^já/i.test(q?.texto || "")) { p.texto = "Desenvolve Já" + (q.texto.match(/[?.,!]$/)?.[0] || ""); p.fim = q.fim; q.fora = true; }
});
const PAL = pal.filter((p) => !p.fora);
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };
const Tf = (frag) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i + ws.length - 1].fim; throw new Error("não achei: " + frag); };

// ---- elementos ----
const els = [], js = [];
const el = (id, t0, t1, html, estilo) => els.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}" data-layout-allow-overlap>${html}</div>`);
const tw = (s) => js.push("      " + s);
const pop = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.6, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: "back.out(1.8)" }, ${f(t)});`);
const sobe = (s, t) => tw(`tl.fromTo("${s}", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, ${f(t)});`);
const some = (s, t) => tw(`tl.to("${s}", { scale: 0.92, opacity: 0, duration: 0.2, ease: "power2.in" }, ${f(t)});`);
const sons = []; const som = (nome, t, v) => sons.push([nome, t, v]);
const TOPO = "left:0;width:1080px;top:250px;text-align:center";
const escondidos = []; const esconde = (a, b) => escondidos.push([a, b]);

// 1) gancho: "R$200" grande em pílula rosa
const g0 = T("R$200") - 0.05, g1 = T("Vem") - 0.05;
el("ganho", g0, g1, `<div class="cifra"><span class="cf-p">ELE PODE TE RENDER</span><span class="cf-v">R$200</span></div>`, TOPO);
pop("#ganho .cifra", g0); tw(`tl.fromTo("#ganho .cf-v", { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(2)" }, ${f(g0 + 0.05)});`);
some("#ganho .cifra", g1 - 0.2); som("impact-bass-1", g0, 0.07); som("sparkle", g0 + 0.1, 0.05);

// 2) Almaviva: vagas home office e presenciais
const a0 = T("Almaviva") - 0.05, a1 = T("Se o seu") - 0.1;
el("vagas", a0, a1, `<div class="titulo">VAGAS ALMAVIVA</div><div class="pils"><span id="pl1" class="pil">HOME OFFICE</span><span id="pl2" class="pil">PRESENCIAL</span></div>`, TOPO);
sobe("#vagas .titulo", a0); pop("#pl1", T("home") - 0.05); pop("#pl2", T("presenciais") - 0.05);
som("whoosh-short", a0 - 0.05, 0.05); som("pop", T("home") - 0.05, 0.07); som("pop", T("presenciais") - 0.05, 0.07);
tw(`tl.to("#vagas > *", { opacity: 0, y: -20, duration: 0.2, ease: "power2.in" }, ${f(a1 - 0.2)});`);

// 3) linha do tempo: contratado em dezembro → 60 dias → R$200 em março de 2027
const l0 = T("contratado") - 0.1, l1 = T("Ele precisa") - 0.1;
const passos = [["dezembro", "CONTRATADO", "DEZ/2026"], ["60", "FICA", "60 DIAS"], ["março", "VOCÊ GANHA", "R$200"]];
el("linha", l0, l1, `<div class="linha">${passos.map(([, a, b], i) => `<div id="lp${i}" class="lp${i === 2 ? " ganha" : ""}"><small>${a}</small><b>${b}</b>${i === 2 ? "<em>MARÇO 2027</em>" : ""}</div>${i < 2 ? `<i id="la${i}" class="seta"></i>` : ""}`).join("")}</div>`, "left:60px;width:960px;top:240px");
passos.forEach(([w], i) => { const t = T(w, l0) - 0.06; pop(`#lp${i}`, t); som(i === 2 ? "chime" : "pop", t, i === 2 ? 0.06 : 0.07); if (i) tw(`tl.fromTo("#la${i - 1}", { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, ${f(t - 0.25)});`); });
tw(`tl.to("#linha .linha", { opacity: 0, y: -20, duration: 0.2, ease: "power2.in" }, ${f(l1 - 0.2)});`);

// 4) requisitos (checklist embaixo; a legenda some porque a lista fala por ela)
const r0 = T("Ele precisa") - 0.05, r1 = T("Ah") - 0.08;
const reqs = [["18", "18 anos ou mais"], ["ensino", "Ensino médio completo"], ["informática", "Informática básica"]];
el("req", r0, r1, `<div class="cartao"><div class="ct-t">REQUISITOS</div>${reqs.map(([, txt], i) => `<div id="rq${i}" class="rq"><i class="ck"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></i>${txt}</div>`).join("")}</div>`, "left:110px;width:860px;top:1080px");
sobe("#req .cartao", r0); reqs.forEach(([w], i) => { const t = T(w, r0) - 0.06; tw(`tl.fromTo("#rq${i}", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.28, ease: "power3.out" }, ${f(t)});`); tw(`tl.fromTo("#rq${i} .ck", { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2.5)" }, ${f(t + 0.1)});`); som("click", t + 0.1, 0.07); });
tw(`tl.to("#req .cartao", { opacity: 0, y: 30, duration: 0.22, ease: "power2.in" }, ${f(r1 - 0.22)});`);
esconde(r0, r1);

// 5) seleção presencial até 30 de novembro, 9h ou 14h
const s0 = T("seleção") - 0.08, s1 = T("Envie") - 0.1;
el("sel", s0, s1, `<div class="titulo pq">SELEÇÃO PRESENCIAL</div><div class="pils"><span id="sd" class="pil mar"><svg viewBox="0 0 24 24" width="40" height="40"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M3 10h18M8 3v4M16 3v4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>ATÉ 30/11</span><span id="sh1" class="pil">09H</span><span class="ou">ou</span><span id="sh2" class="pil">14H</span></div>`, "left:0;width:1080px;top:200px;text-align:center");
sobe("#sel .titulo", s0); pop("#sd", T("até", s0) - 0.05); pop("#sh1", T("9h") - 0.05); tw(`tl.fromTo("#sel .ou", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(T("ou", s0) - 0.05)});`); pop("#sh2", T("14h") - 0.05);
som("whoosh-short", s0 - 0.05, 0.05); som("pop", T("até", s0) - 0.05, 0.07); som("pop", T("9h") - 0.05, 0.06); som("pop", T("14h") - 0.05, 0.06);
tw(`tl.to("#sel > *", { opacity: 0, y: -20, duration: 0.2, ease: "power2.in" }, ${f(s1 - 0.2)});`);

// 6) portal do colaborador → filtro "Indique um amigo" (clique)
const p0 = T("portal") - 0.1, p1 = T("O endereço") - 0.08, pc = T("Indique") + 0.1;
el("portal", p0, p1, `<div class="janela"><div class="jt"><i></i><i></i><i></i><span>Portal do Colaborador</span></div><div class="jc"><span class="flt">Filtro:</span><span id="chip" class="chip">Indique um amigo</span></div></div><div class="mao"></div>`, "left:150px;width:780px;top:230px");
sobe("#portal .janela", p0); som("whoosh-short", p0 - 0.05, 0.05);
tw(`tl.fromTo("#portal .mao", { opacity: 0, x: 90, y: 90 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power2.out" }, ${f(pc - 0.35)});`);
tw(`tl.to("#chip", { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1 }, ${f(pc)}); tl.set("#chip", { backgroundColor: "${RS}", color: "#fff", borderColor: "${RS}" }, ${f(pc + 0.08)});`);
tw(`tl.to("#portal .mao", { opacity: 0, duration: 0.2 }, ${f(pc + 0.5)});`); som("click", pc, 0.09);
tw(`tl.to("#portal .janela", { opacity: 0, y: -20, duration: 0.2, ease: "power2.in" }, ${f(p1 - 0.2)});`);

// 7) endereço (cartão marinho embaixo, como na arte)
const e0 = T("O endereço") - 0.05, e1 = T("E aí") - 0.08;
el("end", e0, e1, `<div class="local"><svg viewBox="0 0 24 24" width="70" height="70"><path d="M12 22s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="#fff" stroke-width="2"/></svg><div><b>Desenvolve Já · Maceió</b><span>Av. Presidente Getúlio Vargas, 590 – Serraria</span><span>Em frente à Igreja Quadrangular</span></div></div>`, "left:70px;width:940px;top:1110px");
sobe("#end .local", e0); som("pop", e0, 0.07);
tw(`tl.to("#end .local", { opacity: 0, y: 30, duration: 0.22, ease: "power2.in" }, ${f(e1 - 0.22)});`);
esconde(e0, e1);

// 8) fim: "BORA INDICAR?" + perfil
const b0 = T("E aí") - 0.05;
el("bora", b0, DUR, `<div class="bora">BORA INDICAR?</div><div class="perfil"><span class="av"><img src="assets/avatar.png" alt=""></span><span class="pn"><b>Desenvolve Já</b><small>@desenvolveja</small></span></div>`, TOPO);
pop("#bora .bora", T("bora") - 0.05); sobe("#bora .perfil", T("bora") + 0.25);
som("whoosh", b0 - 0.1, 0.05); som("impact-bass-1", T("bora") - 0.05, 0.06);

// ---- câmera: jump cuts alternam aberto/fechado; trocas de cena com faixa da marca ----
const cenasOrig = [6.54, 20.08, 39.29];
const cenas = cenasOrig.map((t) => { const g = segs.find((x) => t > x.s && t < x.e); return g ? deOriginal(t) : segs.find((x) => x.s >= t).ini; });
const pulos = segs.slice(1).map((g) => g.ini).filter((t) => !cenas.some((c) => Math.abs(c - t) < 0.05));
const cam = [`tl.set("#camera", { scale: 1 }, 0); tl.set(".faixa", { xPercent: -110 }, 0);`];
pulos.forEach((t, i) => { cam.push(`tl.set("#camera", { scale: ${i % 2 ? 1 : 1.12} }, ${f(t)});`); });
cenas.forEach((t) => {
  cam.push(`tl.fromTo("#fx1", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.21)});`);
  cam.push(`tl.fromTo("#fx2", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.15)});`);
  cam.push(`tl.fromTo("#camera", { scale: 1.16 }, { scale: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${f(t)});`);
  som("whoosh", t - 0.2, 0.06);
});

// ---- legenda "mago" (maior, aprovada no vídeo anterior) ----
const CHAVES = new Set(["emprego", "r200", "almaviva", "60", "2027", "presencial", "novembro", "colaborador", "amigo", "indicar"]);
const ehChave = (p) => p && CHAVES.has(nrm(p.texto));
const escondeLeg = (t) => escondidos.some(([a, b]) => t >= a && t < b);
const grupos = []; let g = [];
PAL.forEach((p, i) => {
  const prox = PAL[i + 1];
  if (escondeLeg(p.ini)) return;
  if (ehChave(p)) { if (g.length) { grupos.push(g); g = []; } const gc = [p]; gc.chave = true; if (p.texto === "R$" ) {} grupos.push(gc); return; }
  g.push(p);
  if (!prox || /[.,!?;:]$/.test(p.texto) || prox.ini - p.fim >= 0.2 || g.length === 3 || ehChave(prox) || escondeLeg(prox.ini)) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const ini = Math.max(0.02, gr[0].ini - 0.04), prox = grupos[i + 1];
  const limite = escondidos.map(([a]) => a).filter((a) => a > ini).sort((x, y) => x - y)[0] ?? DUR;
  const fim = Math.min(prox ? prox[0].ini - 0.03 : DUR, gr[gr.length - 1].fim + 0.35, limite, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(ini)}" data-duration="${f(Math.max(0.12, fim - ini))}" data-track-index="0"><div class="cx${gr.chave ? " ch" : ""}">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw">${esc(p.texto.replace(/[.,?]$/, ""))}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += gr.chave
    ? `      tl.fromTo("#lg${i}w${j}", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`
    : `      tl.fromTo("#lg${i}w${j}", { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`; });
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.06 }, ${f(Math.max(ini + 0.05, fim - 0.06))});\n`;
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">`;
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/app.html"), `<template>
  ${FONTES}
  <style>
    #root { position: absolute; inset: 0; font-family: "Poppins", "Inter"; }
    .ui { position: absolute; }
    .titulo { display: inline-block; padding: 14px 34px 10px; border-radius: 22px; background: #fff; color: ${MA}; font-family: "Anton"; font-size: 84px; line-height: 1; letter-spacing: 0.01em; box-shadow: 0 16px 40px rgba(0,0,0,0.25); }
    .titulo.pq { font-size: 60px; } #sel .pils { margin-top: 12px; } #sel .pil { font-size: 38px; padding: 10px 24px; gap: 10px; } #sel .pils { gap: 12px; }
    .pils { display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 18px; }
    .pil { display: inline-flex; align-items: center; gap: 14px; padding: 14px 32px; border-radius: 999px; background: ${RS}; color: #fff; font-weight: 800; font-size: 46px; box-shadow: 0 12px 30px rgba(249,5,127,0.35); }
    .pil.mar { background: ${MA}; box-shadow: 0 12px 30px rgba(0,20,89,0.35); }
    .ou { font-weight: 700; font-size: 40px; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    .cifra { display: inline-flex; flex-direction: column; align-items: center; padding: 22px 56px 18px; border-radius: 40px; background: ${RS}; color: #fff; box-shadow: 0 0 0 8px #fff, 0 22px 50px rgba(0,0,0,0.3); }
    .cf-p { font-weight: 700; font-size: 34px; letter-spacing: 0.04em; opacity: 0.95; } .cf-v { display: block; font-family: "Anton"; font-size: 170px; line-height: 1; }
    .linha { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .linha > div { padding: 18px 22px 16px; border-radius: 26px; background: ${MA}; color: #fff; text-align: center; box-shadow: 0 14px 34px rgba(0,0,0,0.3); }
    .linha small { display: block; font-size: 22px; font-weight: 700; letter-spacing: 0.05em; color: ${TQ}; } .linha b { display: block; font-family: "Anton"; font-weight: 400; font-size: 60px; line-height: 1.05; }
    .linha .ganha { background: ${RS}; } .linha .ganha small { color: #fff; } .linha em { display: block; font-style: normal; font-size: 22px; font-weight: 800; }
    .seta { display: block; width: 46px; height: 8px; border-radius: 4px; background: ${TQ}; transform-origin: left center; flex: none; }
    .cartao { padding: 30px 40px 24px; border-radius: 36px; background: ${MA}; color: #fff; box-shadow: 0 22px 50px rgba(0,0,0,0.3); }
    .ct-t { font-family: "Anton"; font-size: 64px; line-height: 1; color: ${TQ}; margin-bottom: 14px; }
    .rq { display: flex; align-items: center; gap: 20px; padding: 10px 0; font-size: 44px; font-weight: 700; }
    .ck { width: 56px; height: 56px; border-radius: 50%; background: ${RS}; display: flex; align-items: center; justify-content: center; flex: none; }
    .janela { border-radius: 30px; overflow: hidden; background: #fff; box-shadow: 0 22px 50px rgba(0,0,0,0.3); }
    .jt { display: flex; align-items: center; gap: 10px; padding: 18px 26px; background: ${MA}; color: #fff; font-size: 36px; font-weight: 700; }
    .jt i { width: 16px; height: 16px; border-radius: 50%; background: ${TQ}; display: block; } .jt i:nth-child(2) { background: ${RS}; } .jt i:nth-child(3) { background: #fff; } .jt span { margin-left: 14px; }
    .jc { display: flex; align-items: center; gap: 18px; padding: 26px 26px; }
    .flt { font-size: 34px; font-weight: 600; color: #5b6380; }
    .chip { padding: 14px 28px; border-radius: 999px; border: 3px solid ${MA}; color: ${MA}; font-size: 38px; font-weight: 800; }
    .mao { position: absolute; left: 560px; top: 150px; width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.85); border: 4px solid rgba(0,0,0,0.25); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
    .local { display: flex; align-items: center; gap: 26px; padding: 30px 34px; border-radius: 34px; background: ${MA}; color: #fff; box-shadow: 0 22px 50px rgba(0,0,0,0.3); }
    .local svg { flex: none; } .local b { display: block; font-size: 42px; font-weight: 800; } .local span { display: block; font-size: 32px; font-weight: 500; line-height: 1.3; }
    .bora { display: inline-block; padding: 16px 42px 12px; border-radius: 26px; background: ${RS}; color: #fff; font-family: "Anton"; font-size: 104px; line-height: 1; box-shadow: 0 0 0 7px #fff, 0 20px 50px rgba(0,0,0,0.3); }
    .perfil { display: inline-flex; align-items: center; gap: 20px; margin-top: 30px; padding: 14px 30px 14px 14px; border-radius: 999px; background: #fff; color: ${MA}; box-shadow: 0 16px 40px rgba(0,0,0,0.25); }
    .av { width: 84px; height: 84px; border-radius: 50%; overflow: hidden; } .av img { width: 100%; height: 100%; display: block; }
    .pn { text-align: left; } .pn b { display: block; font-size: 38px; font-weight: 800; } .pn small { display: block; font-size: 28px; font-weight: 600; color: #5b6380; }
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

// ---- efeitos sonoros ----
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
    ${FONTES}
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 34%; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .faixa { position: absolute; top: -20%; bottom: -20%; width: 130%; left: -15%; transform: skewX(-12deg); z-index: 4; }
      #fx1 { background: ${RS}; } #fx2 { background: ${TQ}; }
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
      <div id="fx1" class="clip faixa" data-start="0" data-duration="${DUR}" data-track-index="3" data-layout-allow-occlusion data-layout-allow-overflow></div>
      <div id="fx2" class="clip faixa" data-start="0" data-duration="${DUR}" data-track-index="4" data-layout-allow-occlusion data-layout-allow-overflow></div>
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
