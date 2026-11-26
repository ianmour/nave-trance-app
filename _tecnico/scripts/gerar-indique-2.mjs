#!/usr/bin/env node
// Desenvolve Já — "Indique um amigo 2" (continuação). Mesmo visual do primeiro: turquesa #5CE1E6, marinho #001459,
// rosa #F9057F, branco; títulos condensados (Anton), texto arredondado (Poppins); faixas da marca nas trocas de cena;
// tela final turquesa com ondas rosa. Nada na frente da cabeça: informações abaixo da legenda, títulos só no alto.
// Uso: node gerar-indique-2.mjs <projeto> <trechos.json> <transcricao do corte (whisper json)>
import fs from "node:fs";
import path from "node:path";

const [P, TRJ, TJ] = process.argv.slice(2);
const W = 1080, H = 1920, TQ = "#5CE1E6", MA = "#001459", RS = "#F9057F";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9$]/g, "");
const trechos = JSON.parse(fs.readFileSync(TRJ, "utf8"));
const DUR = +trechos.at(-1).fim.toFixed(4);
const ini = (n) => trechos.find((t) => t.nome === n).ini, fimT = (n) => trechos.filter((t) => t.nome === n).at(-1).fim;

const TEXTO = "Ei, você já está aproveitando a campanha do Indique um Amigo? Pode ser que você esteja deixando a chance de faturar passar, hein? É isso mesmo! Indicou um amigo, ele foi contratado e cumpriu todas as regras da campanha, você ganhará R$200 por indicação. E quanto mais pessoas você indicar, maiores as chances de aumentar o seu prêmio. Já pensou indicar vários amigos e faturar ainda mais? Corre para o portal e envie os currículos utilizando o filtro Indique um Amigo. Bora aproveitar!";
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

const els = [], js = [], sons = [], cam = [`tl.set("#camera", { scale: 1 }, 0); tl.set(".faixa", { xPercent: -110 }, 0);`];
const el = (id, t0, t1, html, estilo) => els.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(Math.max(0.1, t1 - t0))}" data-track-index="0" style="${estilo}" data-layout-allow-overlap data-layout-allow-occlusion>${html}</div>`);
const tw = (s) => js.push("      " + s);
const som = (nome, t, v) => sons.push([nome, Math.max(0, t), v]);
const pop = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: "back.out(2)" }, ${f(t)});`);
const sobe = (s, t) => tw(`tl.fromTo("${s}", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, ${f(t)});`);
const sai = (s, t) => tw(`tl.to("${s}", { opacity: 0, duration: 0.2 }, ${f(t)});`);
const BAIXO = (top = 1290) => `left:0;width:${W}px;top:${top}px;text-align:center`;
const zoom = (t) => cam.push(`tl.fromTo("#camera", { scale: 1.1 }, { scale: 1, duration: 0.35, ease: "power3.out", immediateRender: false }, ${f(t)});`);
const check = `<svg viewBox="0 0 24 24" width="34" height="34"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// 1) gancho: título no alto + "não deixa passar"
const g1 = fimT("gancho");
el("tit", 0.1, g1, `<div class="titulo">INDIQUE UM AMIGO</div>`, "left:0;width:1080px;top:130px;text-align:center");
pop("#tit .titulo", 0.1); sai("#tit .titulo", g1 - 0.2); som("whoosh-short", 0.05, 0.05);
el("passa", T("faturar") - 0.05, g1, `<div class="pil">NÃO DEIXA ESSA CHANCE PASSAR</div>`, BAIXO());
pop("#passa .pil", T("faturar") - 0.05); tw(`tl.to("#passa .pil", { scale: 1.06, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${f(T("faturar") + 0.3)});`);
sai("#passa .pil", g1 - 0.2); som("pop", T("faturar") - 0.05, 0.07); zoom(T("hein") - 0.05);

// 2) regras: 3 checks e R$200 por indicação
const r1 = fimT("regras"), regras = [["Indicou", "INDICOU UM AMIGO"], ["contratado", "ELE FOI CONTRATADO"], ["regras", "CUMPRIU AS REGRAS"]];
const rR = T("R$200") - 0.06;
el("regras", T("Indicou") - 0.06, rR, `<div class="cartao">${regras.map(([, t], i) => `<div id="rq${i}" class="rq"><i class="ck">${check}</i>${t}</div>`).join("")}</div>`, "left:130px;width:820px;top:1270px");
sobe("#regras .cartao", T("Indicou") - 0.06);
regras.forEach(([w], i) => { const t = T(w, ini("regras")) - 0.05; tw(`tl.fromTo("#rq${i}", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.25 }, ${f(t)}); tl.fromTo("#rq${i} .ck", { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2.5)" }, ${f(t + 0.08)});`); som("click", t + 0.08, 0.07); });
sai("#regras .cartao", rR - 0.2);
el("cifra", rR, r1, `<div class="cifra"><span class="cf-v">R$200</span><span class="cf-p">POR INDICAÇÃO</span></div>`, BAIXO(1270));
pop("#cifra .cifra", rR); tw(`tl.fromTo("#cifra .cf-v", { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(2)" }, ${f(rR + 0.05)});`);
sai("#cifra .cifra", r1 - 0.2); som("impact-bass-1", rR, 0.06); som("sparkle", rR + 0.1, 0.05); zoom(rR);

// 3) quanto mais indicar: +R$200 empilhando
const m0 = ini("mais"), m1 = fimT("mais");
el("mais", T("quanto", m0) - 0.05, m1, `<div class="titulo pq">QUANTO MAIS AMIGOS, MAIOR O PRÊMIO</div><div class="pils">${[0, 1, 2].map((i) => `<span id="pm${i}" class="pil">+R$200</span>`).join("")}</div>`, BAIXO(1270));
sobe("#mais .titulo", T("quanto", m0) - 0.05);
[["pessoas", 0], ["indicar", 1], ["aumentar", 2]].forEach(([w, i]) => { const t = T(w, m0) - 0.05; pop(`#pm${i}`, t); som("pop", t, 0.07); });
tw(`tl.to("#mais .pil", { scale: 1.08, duration: 0.2, yoyo: true, repeat: 1, stagger: 0.08 }, ${f(T("faturar", m0) - 0.05)});`);
sai("#mais > *", m1 - 0.2); som("sparkle", T("faturar", m0), 0.05); zoom(T("vários", m0) - 0.05);

// 4) portal: Portal do Colaborador → Fale com RH → filtro "Indique um amigo"
const p0 = ini("portal"), pc = T("filtro", p0) + 0.35, pr = Math.min(pc - 0.9, T("portal", p0) + 0.45), pEnd = T("Bora", p0) - 0.08;
if (process.env.VERSAO === "site") {
  // versão com link: título no alto, data e site abaixo da legenda
  const s0 = T("portal", p0) - 0.1;
  el("portal", s0, pEnd, `<div class="titulo">INDIQUE E GANHE</div>`, "left:0;width:1080px;top:130px;text-align:center");
  el("portal2", s0, pEnd, `<div id="ig1" class="ig rs">indicações até 30/11</div><div id="ig2" class="ig ma">qualidade.almavivadobrasil.com.br</div>`, BAIXO(1270));
  pop("#portal .titulo", s0); sobe("#ig1", s0 + 0.3); sobe("#ig2", s0 + 0.55);
  sai("#portal .titulo", pEnd - 0.2); sai("#portal2 > *", pEnd - 0.2);
  som("pop", s0, 0.07); som("pop", s0 + 0.3, 0.06); som("pop", s0 + 0.55, 0.06);
} else {
el("portal", T("portal", p0) - 0.1, pEnd, `<div class="janela"><div class="jt"><i></i><i></i><i></i><span>Portal do Colaborador</span></div><div class="jc"><span id="rh" class="chip">Fale com RH</span></div><div id="jf" class="jc jf"><span class="flt">Filtro:</span><span id="chip" class="chip">Indique um amigo</span></div></div><div class="mao"></div>`, "left:150px;width:780px;top:1250px");
sobe("#portal .janela", T("portal", p0) - 0.1); som("whoosh-short", T("portal", p0) - 0.15, 0.05);
tw(`tl.set("#jf", { opacity: 0 }, ${f(T("portal", p0) - 0.1)}); tl.set("#portal .mao", { opacity: 0 }, ${f(T("portal", p0) - 0.1)});`);
tw(`tl.fromTo("#portal .mao", { opacity: 0, x: 60, y: -60 }, { opacity: 1, x: -260, y: -110, duration: 0.3, ease: "power2.out" }, ${f(pr - 0.3)});`);
tw(`tl.to("#rh", { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1 }, ${f(pr)}); tl.set("#rh", { backgroundColor: "${RS}", color: "#fff", borderColor: "${RS}" }, ${f(pr + 0.08)});`);
tw(`tl.fromTo("#jf", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, ${f(pr + 0.2)});`);
tw(`tl.to("#portal .mao", { x: 0, y: 0, duration: 0.3, ease: "power2.inOut" }, ${f(pc - 0.35)});`);
tw(`tl.to("#chip", { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1 }, ${f(pc)}); tl.set("#chip", { backgroundColor: "${RS}", color: "#fff", borderColor: "${RS}" }, ${f(pc + 0.08)});`);
tw(`tl.to("#portal .mao", { opacity: 0, duration: 0.2 }, ${f(pc + 0.5)});`); sai("#portal .janela", pEnd - 0.2);
som("click", pr, 0.09); som("pop", pr + 0.2, 0.05); som("click", pc, 0.09);
}

// 5) final: "BORA APROVEITAR!" na fala e tela final da marca, que depois some
const CF = Math.min(DUR - 0.05, PAL.at(-1).fim + 0.25), FIM = +(CF + 3.4).toFixed(3);
el("bora", T("Bora", p0) - 0.05, CF + 0.2, `<div class="bora">BORA APROVEITAR!</div>`, "left:0;width:1080px;top:150px;text-align:center");
pop("#bora .bora", T("Bora", p0) - 0.05); som("impact-bass-1", T("Bora", p0) - 0.05, 0.06);
el("final", CF, FIM, `<div class="fn"><i class="onda o1"></i><i class="onda o2"></i><div class="fn-in"><div id="fb" class="fn-bora">BORA APROVEITAR!</div><div id="fc" class="fn-sub">R$200 POR INDICAÇÃO</div></div></div>`, "left:0;top:0;width:1080px;height:1920px");
tw(`tl.fromTo("#final .o1", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, ${f(CF + 0.1)}); tl.fromTo("#final .o2", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, ${f(CF + 0.2)});`);
pop("#fb", CF + 0.25); sobe("#fc", CF + 0.5);
tw(`tl.fromTo("#fb", { scale: 1 }, { scale: 1.05, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${f(CF + 0.9)});`);
tw(`tl.to("#final .fn", { opacity: 0, duration: 0.6, ease: "power1.in" }, ${f(FIM - 0.6)});`);
som("pop", CF + 0.25, 0.06); som("pop", CF + 0.5, 0.05);

// trocas de cena: virada (gancho→regras) é corte seco; as outras ganham faixa da marca
const faixa = (t) => {
  cam.push(`tl.fromTo("#fx1", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.21)});`);
  cam.push(`tl.fromTo("#fx2", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.15)});`);
  cam.push(`tl.fromTo("#camera", { scale: 1.16 }, { scale: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${f(t)});`);
  som("whoosh", t - 0.2, 0.06);
};
som("whoosh-short", ini("regras") - 0.1, 0.05);
faixa(ini("mais")); faixa(ini("portal")); faixa(CF);
// pausas cortadas dentro do mesmo take: pulo de câmera
trechos.forEach((t, i) => { if (i && t.nome === "portal" && trechos[i - 1].nome === "portal" && trechos[i - 1].arquivo === t.arquivo && Math.abs(trechos[i - 1].e - 2.85) < 0.01) { cam.push(`tl.fromTo("#camera", { scale: 1.1 }, { scale: 1, duration: 0.55, ease: "power2.out", immediateRender: false }, ${f(t.ini)});`); return; }
  if (i && trechos[i - 1].nome === t.nome) cam.push(`tl.set("#camera", { scale: ${i % 2 ? 1.1 : 1} }, ${f(t.ini)}); tl.set("#camera", { scale: 1 }, ${f(t.fim)});`); });

// legenda (estilo aprovado: branca, maior; palavra-chave sozinha e mais forte); some na tela final
const CH = new Set(["indique", "faturar", "contratado", "regras", "r$200", "premio", "amigos", "portal", "filtro", "aproveitar"]);
const ehChave = (p) => p && CHAVES(p);
function CHAVES(p) { return CH.has(nrm(p.texto)); }
const grupos = []; let g = [];
PAL.forEach((p, i) => { const q = PAL[i + 1]; if (ehChave(p)) { if (g.length) { grupos.push(g); g = []; } const gc = [p]; gc.chave = true; grupos.push(gc); return; } g.push(p); if (!q || /[.,!?;:]$/.test(p.texto) || q.ini - p.fim >= 0.2 || g.length === 3 || ehChave(q)) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0.02, gr[0].ini - 0.04), prox = grupos[i + 1];
  const b = Math.min(prox ? prox[0].ini - 0.03 : CF, gr.at(-1).fim + 0.35, CF);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><div class="cx${gr.chave ? " ch" : ""}">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw">${esc(p.texto.replace(/[.,?!]$/, ""))}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += `      tl.fromTo("#lg${i}w${j}", { opacity: 0${gr.chave ? ", scale: 0.92" : ""} }, { opacity: 1${gr.chave ? ", scale: 1" : ""}, duration: 0.15, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`; });
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.06 }, ${f(Math.max(a + 0.05, b - 0.06))});\n`;
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@600;700;800;900&family=Inter:wght@500;700&display=swap" rel="stylesheet">`;
const CSS = `
    .titulo { display: inline-block; padding: 14px 34px 10px; border-radius: 22px; background: #fff; color: ${MA}; font-family: "Anton"; font-size: 84px; line-height: 1; box-shadow: 0 0 0 6px ${RS}, 0 16px 40px rgba(0,0,0,0.25); }
    .titulo.pq { font-size: 54px; padding: 12px 26px 8px; }
    .pils { display: flex; justify-content: center; gap: 16px; margin-top: 18px; }
    .pil { display: inline-flex; align-items: center; padding: 14px 32px; border-radius: 999px; background: ${RS}; color: #fff; font-family: "Poppins"; font-weight: 800; font-size: 46px; box-shadow: 0 12px 30px rgba(249,5,127,0.35); }
    .cifra { display: inline-flex; flex-direction: column; align-items: center; padding: 18px 56px 16px; border-radius: 40px; background: ${RS}; color: #fff; box-shadow: 0 0 0 8px #fff, 0 22px 50px rgba(0,0,0,0.3); }
    .cf-v { font-family: "Anton"; font-size: 160px; line-height: 1; } .cf-p { font-family: "Poppins"; font-weight: 800; font-size: 40px; letter-spacing: 0.04em; }
    .cartao { padding: 22px 34px; border-radius: 32px; background: ${MA}; color: #fff; box-shadow: 0 22px 50px rgba(0,0,0,0.3); }
    .rq { display: flex; align-items: center; gap: 18px; padding: 8px 0; font-family: "Poppins"; font-size: 42px; font-weight: 800; }
    .ck { width: 54px; height: 54px; border-radius: 50%; background: ${RS}; display: flex; align-items: center; justify-content: center; flex: none; }
    .janela { border-radius: 30px; overflow: hidden; background: #fff; box-shadow: 0 22px 50px rgba(0,0,0,0.3); }
    .jt { display: flex; align-items: center; gap: 10px; padding: 18px 26px; background: ${MA}; color: #fff; font-family: "Poppins"; font-size: 36px; font-weight: 700; }
    .jt i { width: 16px; height: 16px; border-radius: 50%; background: ${TQ}; display: block; } .jt i:nth-child(2) { background: ${RS}; } .jt i:nth-child(3) { background: #fff; } .jt span { margin-left: 14px; }
    .jc { display: flex; align-items: center; gap: 18px; padding: 20px 26px 0; font-family: "Poppins"; } .jc.jf { padding-bottom: 22px; }
    .flt { font-size: 34px; font-weight: 600; color: #5b6380; }
    .chip { padding: 14px 28px; border-radius: 999px; border: 3px solid ${MA}; color: ${MA}; font-size: 38px; font-weight: 800; }
    .mao { position: absolute; left: 560px; top: 150px; width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.85); border: 4px solid rgba(0,0,0,0.25); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
    .bora { display: inline-block; padding: 16px 42px 12px; border-radius: 26px; background: ${RS}; color: #fff; font-family: "Anton"; font-size: 100px; line-height: 1; box-shadow: 0 0 0 7px #fff, 0 20px 50px rgba(0,0,0,0.3); }
    .ig { display: block; width: fit-content; margin: 16px auto 0; padding: 12px 30px; border-radius: 16px; color: #fff; font-family: "Poppins"; font-weight: 800; font-size: 44px; box-shadow: 0 12px 30px rgba(0,0,0,0.25); } .ig.rs { background: ${RS}; } .ig.ma { background: ${MA}; font-size: 38px; }
    .fn { position: absolute; inset: 0; background: ${TQ}; overflow: hidden; }
    .onda { position: absolute; border-radius: 50%; border: 70px solid ${RS}; }
    .onda.o1 { width: 640px; height: 640px; left: -360px; top: -300px; } .onda.o2 { width: 700px; height: 700px; right: -400px; bottom: -330px; }
    .fn-in { position: absolute; left: 90px; right: 90px; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; text-align: center; }
    .fn-bora { display: inline-block; padding: 22px 52px 14px; border-radius: 30px; background: ${RS}; color: #fff; font-family: "Anton"; font-size: 120px; line-height: 1; box-shadow: 0 0 0 9px #fff, 0 24px 60px rgba(0,0,0,0.25); }
    .fn-sub { display: inline-block; padding: 14px 32px; border-radius: 999px; background: ${MA}; color: #fff; font-family: "Poppins"; font-weight: 800; font-size: 48px; }`;
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/app.html"), `<template>
  ${FONTES}
  <style>
    #root { position: absolute; inset: 0; } .ui { position: absolute; }
${CSS}
  </style>
  <div id="root" data-composition-id="app" data-duration="${FIM}" data-width="${W}" data-height="${H}">
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
  ${FONTES}
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 120px; width: 840px; top: 1110px; text-align: center; }
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
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
let audios = "";
sons.forEach(([nome, t, v], i) => { const arq = path.basename(man[nome].file || `${nome}.mp3`); fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t)}" data-duration="${f(Math.min(man[nome].duration, FIM - t - 0.01))}" data-track-index="${8 + (i % 4)}" data-volume="${v}"></audio>\n`; });
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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 34%; }
      #fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .faixa { position: absolute; top: -20%; bottom: -20%; width: 130%; left: -15%; transform: skewX(-12deg); z-index: 6; }
      #fx1 { background: ${RS}; } #fx2 { background: ${TQ}; }
      #app, #legendas { position: absolute; inset: 0; } #app { z-index: 3; } #legendas { z-index: 2; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${FIM}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
      </div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
      <div id="app" data-composition-id="app" data-composition-src="compositions/app.html" data-start="0" data-duration="${FIM}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="fx1" class="clip faixa" data-start="0" data-duration="${FIM}" data-track-index="3" data-layout-allow-occlusion data-layout-allow-overflow></div>
      <div id="fx2" class="clip faixa" data-start="0" data-duration="${FIM}" data-track-index="4" data-layout-allow-occlusion data-layout-allow-overflow></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${els.length} elementos, ${grupos.length} blocos de legenda, ${sons.length} efeitos, fala até ${CF}s, fim ${FIM}s`);
