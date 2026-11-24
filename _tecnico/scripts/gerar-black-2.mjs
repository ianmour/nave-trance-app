#!/usr/bin/env node
// Desenvolve Já — "Black 2: vagas acabando" (continuação do vídeo 1 da Black). Um vídeo por cidade.
// Visual do vídeo 1: vermelho #E30613 / branco / preto, números grandes vermelhos com contorno branco acima da cabeça,
// formas vermelhas ATRÁS da pessoa (recorte), site em pílula vermelha. Legenda no estilo aprovado ("mago", maior),
// com a palavra-chave em vermelho. Transições: viradas de cadeira e mão na câmera = corte seco (o movimento liga);
// trocas de cena sem ligação = faixa vermelha/preta + empurrão de câmera.
// Uso: node gerar-black-2.mjs <projeto> <cidade> <trechos.json> <pasta seg/ com as transcrições por trecho>
import fs from "node:fs";
import path from "node:path";

const [P, CIDADE, TRECHOS, SEG] = process.argv.slice(2);
const W = 1080, H = 1920, VM = "#E30613", PR = "#111111";
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9%]/g, "");
const trechos = JSON.parse(fs.readFileSync(TRECHOS, "utf8"));
const DUR = +trechos[trechos.length - 1].fim.toFixed(4);
const tr = (nome) => trechos.filter((t) => t.nome === nome);
const ini = (nome) => tr(nome)[0].ini, fimT = (nome) => tr(nome).at(-1).fim;

// ---- texto certo de cada trecho (do roteiro/fala) + tempos do whisper por alinhamento ----
const TEXTO = {
  "IMG_0212_0": "Que a Desenvolve está na Black de Oportunidades, você já sabe, mas as vagas estão acabando.",
  "IMG_0218_0": "Em Teresina, 60% das vagas já foram preenchidas,",
  "IMG_0218_1": "restam apenas 200.",
  "IMG_0246_0": "Em Maceió, 55% dessas vagas já fecharam, restam apenas 135.",
  "IMG_0224_0": "Em Nossa Senhora do Socorro, 40% das vagas já estão fechadas, mas ainda dá tempo: são 180 vagas disponíveis.",
  "IMG_0248_0": "Agora imagina começar o ano na escala 5x2, 1 hora de intervalo e 2 folgas na semana.",
  "IMG_0230_0": "Com benefícios que facilitam a sua rotina. E o processo é simples.",
  "IMG_0244_0": "Presencial, de segunda a sexta, das 9h às 15h, e os endereços estão aqui na legenda.",
  "IMG_0240_0": "Ou online, a qualquer hora, pelo site que está aparecendo aqui na tela.",
  "IMG_0240_1": "Já prepara o print.",
  "IMG_0259_0": "É 5x2 que você queria? Então corre, que as nossas vagas estão acabando.",
};
const PAL = [], parte = {};
for (const t of trechos) {
  const base = t.arquivo.split(".")[0]; parte[base] = (parte[base] ?? -1) + 1; const key = `${base}_${parte[base]}`;
  const txt = TEXTO[key].split(/\s+/);
  const wsp = JSON.parse(fs.readFileSync(path.join(SEG, key + ".json"), "utf8")).transcription
    .map((x) => ({ t: x.text.trim(), a: x.offsets.from / 1000, b: x.offsets.to / 1000 })).filter((x) => nrm(x.t));
  const A = txt.map(nrm), B = wsp.map((x) => nrm(x.t)), n = A.length, m = B.length;
  const D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
  const tm = new Array(n).fill(null);
  for (let i = n, j = m; i > 0 && j > 0;) { const c = A[i - 1] === B[j - 1] ? 0 : 1; if (D[i][j] === D[i - 1][j - 1] + c) { tm[i - 1] = [wsp[j - 1].a, wsp[j - 1].b]; i--; j--; } else if (D[i][j] === D[i - 1][j] + 1) i--; else j--; }
  for (let i = 0; i < n; i++) if (!tm[i]) { const an = tm.slice(0, i).reverse().find(Boolean), po = tm.slice(i + 1).find(Boolean); const x = an && po ? (an[1] + po[0]) / 2 : an ? an[1] : po[0]; tm[i] = [x, x + 0.15]; }
  txt.forEach((w, i) => PAL.push({ texto: w, ini: t.ini + tm[i][0], fim: Math.min(t.fim, t.ini + tm[i][1]), trecho: t.nome }));
}
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };

// ---- elementos ----
const els = [], js = [], atras = [], sons = [], camPre = [];
const el = (id, t0, t1, html, estilo, lista = els) => lista.push(`      <div id="${id}" class="clip ui" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}" data-layout-allow-overlap data-layout-allow-occlusion>${html}</div>`);
const tw = (s) => js.push("      " + s);
const som = (nome, t, v) => sons.push([nome, t, v]);
const pop = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "back.out(2)" }, ${f(t)});`);
const sobe = (s, t) => tw(`tl.fromTo("${s}", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" }, ${f(t)});`);
const sai = (s, t) => tw(`tl.to("${s}", { opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in" }, ${f(t)});`);
const TOPO = (top = 170) => `left:0;width:${W}px;top:${top}px;text-align:center`;
const grande = (id, t0, t1, txt, tam = 190, top = 170) => { el(id, t0, t1, `<div class="gr" style="font-size:${tam}px">${txt}</div>`, TOPO(top)); pop(`#${id} .gr`, t0); sai(`#${id} .gr`, t1 - 0.2); som("pop", t0, 0.07); };

// Palavras GRANDES atrás da cabeça (como no vídeo 1): ficam na camada entre o vídeo e o recorte da pessoa.
// altura do topo da cabeça em cada trecho (medida nos quadros); a palavra desce até cobrir o alto da cabeça
const cabeca = { abertura: 490, dados: { teresina: 500, maceio: 575, socorro: 585 }[CIDADE], "5x2": 570, beneficios: 480, presencial: 450, online: 470, final: 570 };
const tamanho = (txt) => Math.round(Math.min(250, 1000 / (txt.length * 0.74)));
let nb = 0;
const atrasPal = (t0, t1, txt, trecho, extra = "") => {
  const id = `gb${nb++}`;
  el(id, t0, t1, `<div class="gb" style="font-size:${tamanho(txt)}px">${extra || txt}</div>`, `left:0;width:${W}px;top:${Math.round(cabeca[trecho] + 90 - tamanho(txt) * 0.9)}px;text-align:center`, atras);
  tw(`tl.fromTo("#${id} .gb", { opacity: 0, y: 60, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)" }, ${f(t0)});`);
  tw(`tl.to("#${id} .gb", { opacity: 0, y: -30, duration: 0.18, ease: "power2.in" }, ${f(t1 - 0.18)});`);
  som("whoosh-short", t0 - 0.05, 0.045);
  camPre.push(`tl.fromTo("#camera", { scale: 1.09 }, { scale: 1, duration: 0.32, ease: "power3.out", immediateRender: false }, ${f(t0)});`);
  return id;
};
const fimDe = (nome) => fimT(nome) - 0.02;
// abertura
atrasPal(T("Black") - 0.06, T("mas") - 0.05, "BLACK", "abertura");
atrasPal(T("acabando") - 0.06, fimDe("abertura"), "ACABANDO", "abertura");
// dados da cidade: nome grande, % contando, o que resta
const d0 = ini("dados");
const DADO = {
  teresina: { nome: "TERESINA", w: "Teresina", pct: 60, wp: "60%", resta: "200", wr: "200" },
  maceio: { nome: "MACEIÓ", w: "Maceió", pct: 55, wp: "55%", resta: "135", wr: "135" },
  socorro: { nome: "SOCORRO", w: "Nossa", pct: 40, wp: "40%", resta: "180", wr: "180" },
}[CIDADE];
const p0 = T(DADO.wp, d0) - 0.06, r0 = T(DADO.wr, d0) - 0.06;
atrasPal(T(DADO.w, d0) - 0.06, p0, DADO.nome, "dados");
atrasPal(p0, r0, DADO.wp, "dados");
atrasPal(r0, fimDe("dados"), DADO.resta, "dados");
som("riser", p0 - 0.1, 0.035); som("impact-bass-1", r0, 0.05);
// 5x2
const c0 = ini("5x2");
atrasPal(T("5x2", c0) - 0.06, fimDe("5x2"), "5X2", "5x2"); som("impact-bass-1", T("5x2", c0), 0.05);
// benefícios / simples
const b0 = ini("beneficios");
atrasPal(T("benefícios", b0) - 0.06, T("E", b0) - 0.05, "BENEFÍCIOS", "beneficios");
atrasPal(T("simples", b0) - 0.06, fimDe("beneficios"), "SIMPLES", "beneficios");
// presencial
const e0 = ini("presencial");
atrasPal(T("Presencial", e0) - 0.06, T("9h", e0) - 0.05, "PRESENCIAL", "presencial");
atrasPal(T("9h", e0) - 0.06, fimDe("presencial"), "9H ÀS 15H", "presencial");
// online + site (pílula vermelha na frente, como no vídeo 1) + print
const o0 = ini("online"), o1 = fimT("online");
atrasPal(T("online", o0) - 0.06, T("site", o0) - 0.05, "ONLINE", "online");
atrasPal(T("site", o0) - 0.06, fimDe("online"), "24H", "online");
const s0 = T("site", o0) - 0.08;
el("site", s0, o1, `<div class="url">formacaomercadologica.com.br</div>`, "left:0;width:1080px;top:1290px;text-align:center");
tw(`tl.fromTo("#site .url", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, ${f(s0)});`);
som("pop", s0 + 0.05, 0.06);
const pr = T("print", o0) + 0.1;
el("flash", pr, Math.min(o1, pr + 0.5), `<div class="flash"></div>`, "left:0;top:0;width:1080px;height:1920px");
tw(`tl.fromTo("#flash .flash", { opacity: 0.95 }, { opacity: 0, duration: 0.4, ease: "power2.out" }, ${f(pr)});`);
camPre.push(`tl.fromTo("#camera", { scale: 0.9 }, { scale: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, ${f(pr)});`);
som("click", pr, 0.12);
// final
const g0 = ini("final");
atrasPal(T("5x2", g0) - 0.06, T("Então", g0) - 0.05, "5X2?", "final");
atrasPal(T("corre", g0) - 0.06, DUR, "CORRE!", "final"); som("impact-bass-1", T("corre", g0) - 0.06, 0.06);


// ---- extras animados (ideias da referência: bolinhas de dias, ícones surgindo em volta da pessoa) ----
const SVG = {
  relogio: `<svg viewBox="0 0 24 24" width="64" height="64"><circle cx="12" cy="12" r="9" fill="none" stroke="${VM}" stroke-width="2.4"/><path d="M12 7v5l3.5 2" fill="none" stroke="${VM}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  agenda: `<svg viewBox="0 0 24 24" width="64" height="64"><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="${VM}" stroke-width="2.4"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="${VM}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  presente: `<svg viewBox="0 0 24 24" width="64" height="64"><rect x="4" y="10" width="16" height="10" rx="1.5" fill="none" stroke="${VM}" stroke-width="2.3"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="${VM}" stroke-width="2.3" stroke-linejoin="round"/></svg>`,
  estrela: `<svg viewBox="0 0 24 24" width="64" height="64"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="${VM}"/></svg>`,
  coracao: `<svg viewBox="0 0 24 24" width="64" height="64"><path d="M12 20s-7.5-4.6-9.6-9.1C.9 7.6 3 4 6.6 4c2.1 0 3.6 1.2 5.4 3.1C13.8 5.2 15.3 4 17.4 4 21 4 23.1 7.6 21.6 10.9 19.5 15.4 12 20 12 20z" fill="${VM}"/></svg>`,
  celular: `<svg viewBox="0 0 24 24" width="64" height="64"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" fill="none" stroke="${VM}" stroke-width="2.4"/><circle cx="12" cy="18" r="1.2" fill="${VM}"/></svg>`,
  pino: `<svg viewBox="0 0 24 24" width="64" height="64"><path d="M12 22s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" fill="${VM}"/><circle cx="12" cy="10" r="2.8" fill="#fff"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="64" height="64"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${VM}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
let ni = 0;
const icone = (t0, t1, nome, x, y) => {
  const id = `ic${ni++}`;
  el(id, t0, t1, `<div class="bolha">${SVG[nome]}</div>`, `left:${x}px;top:${y}px;width:130px;height:130px`);
  tw(`tl.fromTo("#${id} .bolha", { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.35, ease: "back.out(2.4)" }, ${f(t0)});`);
  tw(`tl.to("#${id} .bolha", { y: -14, duration: 0.6, yoyo: true, repeat: ${Math.max(0, Math.floor((t1 - t0 - 0.6) / 0.6))}, ease: "sine.inOut" }, ${f(t0 + 0.35)});`);
  tw(`tl.to("#${id} .bolha", { scale: 0, duration: 0.18, ease: "power2.in" }, ${f(t1 - 0.18)});`);
  som("pop", t0, 0.06);
};
const bolinhas = (id, t0, t1, cores, top, intervalo = 0.08) => {
  el(id, t0, t1, `<div class="dots">${cores.map((c, i) => c === "+" ? `<b class="mais">+</b>` : `<i id="${id}d${i}" class="dot ${c}"></i>`).join("")}</div>`, `left:0;width:${W}px;top:${top}px;text-align:center`);
  cores.forEach((c, i) => { if (c !== "+") tw(`tl.fromTo("#${id}d${i}", { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(3)" }, ${f(t0 + i * intervalo)});`); });
  tw(`tl.to("#${id} .dots", { opacity: 0, duration: 0.18 }, ${f(t1 - 0.18)});`);
  som("click-soft", t0, 0.05); som("click-soft", t0 + cores.length * intervalo * 0.6, 0.05);
};
// dados: 10 bolinhas, as preenchidas em vermelho
{ const d0 = ini("dados"), n = Math.round(DADO.pct / 10), p0 = T(DADO.wp, d0) - 0.06;
  bolinhas("dd", p0, T(DADO.wr, d0) - 0.06, Array.from({ length: 10 }, (_, i) => (i < n ? "vm" : "br")), 230, 0.06);
  icone(T(DADO.w, d0) - 0.06, p0, "pino", 860, 820); }
// 5x2: 5 dias brancos + 2 vermelhos (folgas); relógio no intervalo, agenda nas folgas
{ const c0 = ini("5x2"); const t5 = T("5x2", c0) - 0.06;
  bolinhas("cd", t5, fimT("5x2") - 0.05, ["br", "br", "br", "br", "br", "+", "vm", "vm"], 250, 0.1);
  icone(T("intervalo", c0) - 0.1, fimT("5x2") - 0.05, "relogio", 850, 820);
  icone(T("folgas", c0) - 0.1, fimT("5x2") - 0.05, "agenda", 100, 820); }
// benefícios: ícones surgindo em volta do Vini
{ const b0 = ini("beneficios"), b1 = fimT("beneficios");
  icone(T("benefícios", b0) - 0.05, b1 - 0.1, "presente", 90, 760);
  icone(T("facilitam", b0) - 0.05, b1 - 0.1, "estrela", 860, 720);
  icone(T("rotina", b0) - 0.05, b1 - 0.1, "coracao", 120, 980);
  icone(T("simples", b0) - 0.05, b1 - 0.1, "check", 850, 960); }
// presencial: pino nos endereços
{ const e0 = ini("presencial"); icone(T("endereços", e0) - 0.06, fimT("presencial") - 0.05, "pino", 850, 860);
  icone(T("segunda", e0) - 0.06, fimT("presencial") - 0.05, "agenda", 100, 860); }
// online: celular e relógio
{ const o0 = ini("online"); icone(T("online", o0) - 0.06, T("print", o0), "celular", 860, 800);
  icone(T("qualquer", o0) - 0.06, T("print", o0), "relogio", 90, 800); }
// final: tremida no CORRE!
{ const g0 = ini("final"), tc = T("corre", g0);
  camPre.push(`tl.to("#camera", { keyframes: [{ x: -14 }, { x: 12 }, { x: -10 }, { x: 8 }, { x: 0 }], duration: 0.35, ease: "none" }, ${f(tc)});`); }

// ---- trocas de cena ----
const cam = [`tl.set("#camera", { scale: 1 }, 0); tl.set(".faixa", { xPercent: -110 }, 0);`, ...camPre];
const faixa = (t) => {
  cam.push(`tl.fromTo("#fx1", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.21)});`);
  cam.push(`tl.fromTo("#fx2", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.15)});`);
  cam.push(`tl.fromTo("#camera", { scale: 1.16 }, { scale: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${f(t)});`);
  som("whoosh", t - 0.2, 0.06);
};
faixa(ini("dados")); faixa(ini("5x2"));
cam.push(`tl.fromTo("#camera", { rotation: 180, scale: 1.9 }, { rotation: 0, scale: 1, duration: 0.45, ease: "power3.out", immediateRender: false }, ${f(ini("beneficios"))});`);
som("whoosh", ini("beneficios") - 0.15, 0.07);
// viradas de cadeira e mão na câmera: corte seco, só um whoosh acompanhando o movimento
[ini("presencial"), ini("online"), ini("final")].forEach((t) => som("whoosh-short", t - 0.12, 0.05));
// pausa cortada dentro do mesmo take (Teresina): pulo de câmera
trechos.forEach((t, i) => { if (i && trechos[i - 1].nome === t.nome && t.nome === "dados") cam.push(`tl.set("#camera", { scale: 1.1 }, ${f(t.ini)}); tl.set("#camera", { scale: 1 }, ${f(t.fim)});`); });

// ---- legenda no estilo do vídeo 1 da Black: MAIÚSCULA, branca, frase curta inteira; palavra-chave em vermelho ----
const CHAVES = new Set(["black", "oportunidades", "acabando", "teresina", "maceio", "socorro", "60%", "55%", "40%", "200", "135", "180", "5x2", "intervalo", "folgas", "beneficios", "simples", "presencial", "legenda", "online", "site", "print", "corre", "fecharam", "fechadas", "preenchidas"]);
const ehChave = (p) => p && CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => {
  const prox = PAL[i + 1];
  g.push(p);
  if (!prox || prox.trecho !== p.trecho || /[.,!?;:]$/.test(p.texto) || prox.ini - p.fim >= 0.25 || g.length === 3) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0.02, gr[0].ini - 0.05), prox = grupos[i + 1];
  const fimTrecho = trechos.find((t) => gr[0].ini >= t.ini - 0.01 && gr[0].ini < t.fim)?.fim ?? DUR;
  const b = Math.min(prox ? prox[0].ini - 0.04 : DUR, gr.at(-1).fim + 0.4, fimTrecho, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><div class="cx">${gr.map((p) => `<span class="pw${ehChave(p) ? " ch" : ""}">${esc(p.texto.replace(/[.,?:!]$/, ""))}</span>`).join(" ")}</div></div>\n`;
  lj += `      tl.fromTo("#lg${i} .cx", { opacity: 0, scale: 0.9, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.16, ease: "back.out(2)" }, ${f(a)});\n`;
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.06 }, ${f(Math.max(a + 0.05, b - 0.06))});\n`;
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&display=swap" rel="stylesheet">`;
const tpl = (id, corpo, script, css) => `<template>
  ${FONTES}
  <style>
    #root { position: absolute; inset: 0; font-family: "Poppins", "Inter"; }
    .ui { position: absolute; }
${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${corpo}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${script}
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`;
const CSS = `
    .gr { display: inline-block; font-weight: 900; line-height: 0.95; letter-spacing: -0.03em; color: ${VM}; -webkit-text-stroke: 10px #fff; paint-order: stroke fill; filter: drop-shadow(0 10px 24px rgba(0,0,0,0.3)); }
    .num { font-size: 210px; }
    .pb { width: 640px; height: 34px; margin: 18px auto 0; border-radius: 20px; background: rgba(255,255,255,0.85); overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
    .pb i { display: block; height: 100%; background: ${VM}; transform-origin: left center; }
    .pr { margin-top: 14px; font-size: 44px; font-weight: 800; color: #fff; text-shadow: 0 3px 14px rgba(0,0,0,0.55); letter-spacing: 0.02em; }
    .vg { display: inline-block; padding: 18px 30px 22px; border-radius: 30px; background: ${PR}; box-shadow: 0 14px 34px rgba(0,0,0,0.35); }
    .vg-t { font-size: 40px; font-weight: 900; color: #fff; letter-spacing: 0.08em; text-align: left; margin-bottom: 10px; }
    .vg-b { width: 560px; height: 30px; border-radius: 16px; background: rgba(255,255,255,0.2); overflow: hidden; } .vg-b i { display: block; height: 100%; background: ${VM}; transform-origin: left center; }
    .chip { display: inline-flex; align-items: center; gap: 12px; padding: 14px 30px; border-radius: 999px; background: #fff; color: ${PR}; font-size: 44px; font-weight: 900; box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
    .pils { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; } .pils.col { flex-direction: column; align-items: center; }
    .pil { display: inline-flex; align-items: center; gap: 10px; padding: 14px 32px; border-radius: 999px; background: ${PR}; color: #fff; font-size: 46px; font-weight: 800; box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
    .pil.vm { background: ${VM}; } .pil.bco { background: #fff; color: ${PR}; } .pil.grande { margin-top: 22px; font-size: 52px; }
    .selo { display: inline-flex; align-items: center; gap: 16px; padding: 12px 40px 12px 14px; border-radius: 999px; background: #fff; color: ${VM}; font-size: 70px; font-weight: 900; box-shadow: 0 14px 34px rgba(0,0,0,0.3); }
    .url { display: inline-block; padding: 18px 36px; border-radius: 18px; background: ${VM}; color: #fff; font-size: 50px; font-weight: 800; letter-spacing: -0.01em; box-shadow: 0 0 0 6px #fff, 0 16px 40px rgba(0,0,0,0.3); }
    .flash { position: absolute; inset: 0; background: #fff; }
    .bolha { width: 130px; height: 130px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,0.3), 0 0 0 5px ${VM}; }
    .dots { display: inline-flex; align-items: center; gap: 14px; padding: 14px 22px; border-radius: 999px; background: rgba(17,17,17,0.55); }
    .dot { width: 44px; height: 44px; border-radius: 50%; display: block; } .dot.br { background: #fff; } .dot.vm { background: ${VM}; box-shadow: 0 0 0 3px #fff; }
    .mais { color: #fff; font-size: 44px; font-weight: 900; margin: 0 4px; }`;
const CSS_ATRAS = `
    .gb { display: inline-block; font-weight: 900; line-height: 0.9; letter-spacing: -0.03em; color: ${VM}; -webkit-text-stroke: 12px #fff; paint-order: stroke fill; filter: drop-shadow(0 10px 22px rgba(0,0,0,0.25)); white-space: nowrap; }`;
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/app.html"), tpl("app", els.join("\n"), js.join("\n"), CSS));
fs.writeFileSync(path.join(P, "compositions/atras.html"), tpl("atras", atras.join("\n"), js.filter((l) => /#gb\d/.test(l)).join("\n"), CSS_ATRAS));
fs.writeFileSync(path.join(P, "compositions/app.html"), tpl("app", els.join("\n"), js.filter((l) => !/#gb\d/.test(l)).join("\n"), CSS));
fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 110px; width: 860px; top: 1110px; text-align: center; }
    .cx { display: inline-block; font-family: "Poppins"; font-weight: 800; font-size: 58px; line-height: 1.12; text-transform: uppercase; color: #fff; text-shadow: 0 0 18px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.5); }
    .pw.ch { color: ${VM}; font-size: 66px; text-shadow: 0 0 14px rgba(255,255,255,0.6), 0 3px 8px rgba(0,0,0,0.35); }
    .pw { display: inline-block; }
  </style>
  ${FONTES}
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
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t0)}" data-duration="${f(Math.min(man[nome].duration, DUR - t0 - 0.01))}" data-track-index="${14 + (i % 4)}" data-volume="${v}"></audio>\n`;
});

const NOMES = ["abertura", "dados", "5x2", "beneficios", "presencial", "online", "final"];
const recs = NOMES.map((n, i) => `        <video id="rec${i}" class="clip recorte" src="assets/recorte-${n}.webm" data-start="${f(ini(n))}" data-duration="${f(fimT(n) - ini(n))}" data-track-index="${2 + i}" muted data-layout-allow-occlusion></video>`).join("\n");
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
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 40%; }
      #fundo, .recorte { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #atras { position: absolute; inset: 0; z-index: 1; } .recorte { z-index: 2; }
      .faixa { position: absolute; top: -20%; bottom: -20%; width: 130%; left: -15%; transform: skewX(-12deg); z-index: 6; }
      #fx1 { background: ${VM}; } #fx2 { background: ${PR}; }
      #app, #legendas { position: absolute; inset: 0; } #app { z-index: 3; } #legendas { z-index: 4; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/corte.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
        <div id="atras" data-composition-id="atras" data-composition-src="compositions/atras.html" data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
${recs}
      </div>
      <div id="app" data-composition-id="app" data-composition-src="compositions/app.html" data-start="0" data-duration="${DUR}" data-track-index="10" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="11" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
      <div id="fx1" class="clip faixa" data-start="0" data-duration="${DUR}" data-track-index="12" data-layout-allow-occlusion data-layout-allow-overflow></div>
      <div id="fx2" class="clip faixa" data-start="0" data-duration="${DUR}" data-track-index="13" data-layout-allow-occlusion data-layout-allow-overflow></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${cam.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok ${CIDADE}: ${els.length} elementos, ${grupos.length} blocos de legenda, ${sons.length} efeitos, ${DUR}s`);
