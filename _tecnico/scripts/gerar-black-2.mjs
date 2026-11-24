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
  "IMG_0212-2.17": "Que a Desenvolve está na Black de Oportunidades, você já sabe, mas as vagas estão acabando.",
  "IMG_0218-5.27": "Em Teresina, 60% das vagas já foram preenchidas,",
  "IMG_0218-9.8": "restam apenas 200.",
  "IMG_0246-1.01": "Em Maceió, 55% dessas vagas já fecharam, restam apenas 135.",
  "IMG_0224-8.03": "Em Nossa Senhora do Socorro, 40% das vagas já estão fechadas, mas ainda dá tempo: são 180 vagas disponíveis.",
  "IMG_0248-0.62": "Agora imagina começar o ano na escala 5x2, 1 hora de intervalo e 2 folgas na semana.",
  "IMG_0230-1.55": "Com benefícios que facilitam a sua rotina. E o processo é simples.",
  "IMG_0244-1.0": "Presencial, de segunda a sexta, das 9h às 15h, e os endereços estão aqui na legenda.",
  "IMG_0240-6.85": "Ou online, a qualquer hora, pelo site que está aparecendo aqui na tela.",
  "IMG_0240-12.42": "Já prepara o print.",
  "IMG_0259-2.4": "É 5x2 que você queria? Então corre, que as nossas vagas estão acabando.",
};
const PAL = [];
for (const t of trechos) {
  const key = `${t.arquivo.split(".")[0]}-${Number.isInteger(t.s) ? t.s + ".0" : t.s}`;
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

// 1) abertura: bloco vermelho atrás do Vini + moldura; "VAGAS" esvaziando em "acabando"
const a0 = 0, a1 = fimT("abertura");
el("bloco", a0, a1, `<div class="bloco"></div><div class="moldura"></div>`, "left:0;top:0;width:1080px;height:1920px", atras);
tw(`tl.fromTo("#bloco .bloco", { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "power3.out" }, ${f(T("Black") - 0.1)});`);
tw(`tl.fromTo("#bloco .moldura", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }, ${f(T("Black") + 0.05)});`);
tw(`tl.to("#bloco .bloco, #bloco .moldura", { opacity: 0, duration: 0.25 }, ${f(T("mas") - 0.05)});`);
som("whoosh-short", T("Black") - 0.12, 0.06); som("impact-bass-1", T("Black"), 0.05);
const v0 = T("vagas") - 0.08;
el("barra", v0, a1, `<div class="vg"><div class="vg-t">VAGAS</div><div class="vg-b"><i></i></div></div>`, TOPO(190));
pop("#barra .vg", v0); tw(`tl.fromTo("#barra .vg-b i", { scaleX: 1 }, { scaleX: 0.18, duration: 1.1, ease: "power2.inOut" }, ${f(T("acabando") - 0.2)});`);
som("riser", v0, 0.04);

// 2) dados da cidade: chip da cidade, % grande subindo com barra, depois o que resta
const d0 = ini("dados"), d1 = fimT("dados");
const DADO = {
  teresina: { nome: "TERESINA", w: "Teresina", pct: 60, rotulo: "JÁ PREENCHIDAS", wp: "60%", resta: "RESTAM 200", wr: "restam" },
  maceio: { nome: "MACEIÓ", w: "Maceió", pct: 55, rotulo: "JÁ FECHARAM", wp: "55%", resta: "RESTAM 135", wr: "restam" },
  socorro: { nome: "N. SRA. DO SOCORRO", w: "Nossa", pct: 40, rotulo: "JÁ FECHADAS", wp: "40%", resta: "180 VAGAS", wr: "são" },
}[CIDADE];
const pino = `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 22s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" fill="${VM}"/><circle cx="12" cy="10" r="2.8" fill="#fff"/></svg>`;
el("cid", d0 + 0.05, d1, `<div class="chip">${pino}${DADO.nome}</div>`, TOPO(110));
pop("#cid .chip", T(DADO.w, d0) - 0.05); som("pop", T(DADO.w, d0) - 0.05, 0.06);
const p0 = T(DADO.wp, d0) - 0.08, r0 = T(DADO.wr, d0) - 0.06;
el("pct", p0, r0, `<div class="gr num"><span id="pn">0</span>%</div><div class="pb"><i></i></div><div class="pr">${DADO.rotulo}</div>`, TOPO(210));
pop("#pct .num", p0);
tw(`(function(){ const o = { v: 0 }; tl.to(o, { v: ${DADO.pct}, duration: 0.7, ease: "power2.out", onUpdate: () => { const e = document.querySelector("#pn"); if (e) e.textContent = Math.round(o.v); } }, ${f(p0)}); })();`);
tw(`tl.fromTo("#pct .pb i", { scaleX: 0 }, { scaleX: ${DADO.pct / 100}, duration: 0.7, ease: "power2.out" }, ${f(p0)});`);
sobe("#pct .pr", p0 + 0.3); sai("#pct > *", r0 - 0.2); som("riser", p0 - 0.1, 0.04); som("click-soft", p0 + 0.7, 0.06);
el("resta", r0, d1, `<div class="gr" style="font-size:150px">${DADO.resta}</div>`, TOPO(220));
pop("#resta .gr", r0); som("impact-bass-1", r0, 0.06);

// 3) 5x2 + intervalo + folgas
const c0 = ini("5x2"), c1 = fimT("5x2");
grande("cinco", T("5x2", c0) - 0.06, c1, "5X2", 230, 150);
el("pils", T("1", c0) - 0.06, c1, `<div class="pils"><span id="pi1" class="pil">1H DE INTERVALO</span><span id="pi2" class="pil">2 FOLGAS NA SEMANA</span></div>`, TOPO(420));
pop("#pi1", T("1", c0) - 0.06); pop("#pi2", T("2", c0) - 0.06); sai("#pils .pils", c1 - 0.2);
som("pop", T("1", c0) - 0.06, 0.06); som("pop", T("2", c0) - 0.06, 0.06);

// 4) benefícios + processo simples
const b0 = ini("beneficios"), b1 = fimT("beneficios");
el("simp", T("simples", b0) - 0.06, b1 - 0.6, `<div class="selo"><svg viewBox="0 0 24 24" width="70" height="70"><circle cx="12" cy="12" r="11" fill="${VM}"/><path d="M6.5 12.5l3.6 3.6L17.5 8.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>SIMPLES</div>`, TOPO(200));
pop("#simp .selo", T("simples", b0) - 0.06); sai("#simp .selo", b1 - 0.8); som("click", T("simples", b0), 0.07);

// 5) presencial: círculo vermelho atrás da Arlinda + horário + endereços na legenda
const e0 = ini("presencial"), e1 = fimT("presencial");
el("circ", e0, e1, `<div class="circ"></div>`, "left:0;top:0;width:1080px;height:1920px", atras);
tw(`tl.fromTo("#circ .circ", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1.4)" }, ${f(T("Presencial", e0) - 0.1)});`);
tw(`tl.to("#circ .circ", { scale: 0, duration: 0.3, ease: "power2.in" }, ${f(e1 - 1.3)});`);
som("whoosh-short", T("Presencial", e0) - 0.15, 0.06);
el("hora", T("segunda", e0) - 0.06, e1 - 1.0, `<div class="pils col"><span class="pil">SEG A SEX</span><span class="pil vm">9H ÀS 15H</span></div>`, TOPO(170));
pop("#hora .pil:first-child", T("segunda", e0) - 0.06); pop("#hora .pil.vm", T("9h", e0) - 0.06); sai("#hora .pils", e1 - 1.2);
som("pop", T("segunda", e0) - 0.06, 0.06); som("pop", T("9h", e0) - 0.06, 0.06);
el("leg", T("endereços", e0) - 0.06, e1 - 1.0, `<div class="pil bco">${pino}ENDEREÇOS NA LEGENDA</div>`, "left:0;width:1080px;top:1300px;text-align:center");
sobe("#leg .pil", T("endereços", e0) - 0.06); sai("#leg .pil", e1 - 1.2); som("pop", T("endereços", e0) - 0.06, 0.05);

// 6) online: site em pílula vermelha + print (flash e clique)
const o0 = ini("online"), o1 = fimT("online");
el("onl", T("online", o0) - 0.06, T("pelo", o0) - 0.1, `<div class="pils"><span class="pil">ONLINE</span><span class="pil vm">A QUALQUER HORA</span></div>`, TOPO(200));
pop("#onl .pil:first-child", T("online", o0) - 0.06); pop("#onl .pil.vm", T("qualquer", o0) - 0.06); sai("#onl .pils", T("pelo", o0) - 0.3);
som("pop", T("online", o0) - 0.06, 0.06);
const s0 = T("site", o0) - 0.08;
el("site", s0, o1 - 0.5, `<div class="url">formacaomercadologica.com.br</div>`, "left:0;width:1080px;top:1300px;text-align:center");
sobe("#site .url", s0); som("whoosh-short", s0 - 0.05, 0.05); som("pop", s0 + 0.05, 0.06);
tw(`tl.fromTo("#site .url", { scale: 1 }, { scale: 1.08, duration: 0.22, yoyo: true, repeat: 1, ease: "sine.inOut" }, ${f(T("tela", o0))});`);
const pr = T("print", o0) + 0.1;
el("flash", pr, pr + 0.5, `<div class="flash"></div>`, "left:0;top:0;width:1080px;height:1920px");
tw(`tl.fromTo("#flash .flash", { opacity: 0.95 }, { opacity: 0, duration: 0.45, ease: "power2.out" }, ${f(pr)});`);
camPre.push(`tl.fromTo("#camera", { scale: 0.9 }, { scale: 1, duration: 0.45, ease: "power3.out", immediateRender: false }, ${f(pr)});`);
som("click", pr, 0.12); som("sparkle", pr + 0.05, 0.04);

// 7) final: "5X2" e "CORRE!"
const g0 = ini("final");
grande("fq", T("5x2", g0) - 0.06, T("Então", g0) - 0.05, "5X2?", 220, 160);
el("corre", T("corre", g0) - 0.06, DUR, `<div class="gr" style="font-size:200px">CORRE!</div><div class="pil vm grande">A BLACK TÁ ACABANDO</div>`, TOPO(150));
pop("#corre .gr", T("corre", g0) - 0.06); sobe("#corre .pil", T("acabando", g0) - 0.1);
tw(`tl.fromTo("#corre .gr", { scale: 1 }, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut" }, ${f(T("corre", g0) + 0.35)});`);
som("impact-bass-1", T("corre", g0) - 0.06, 0.07); som("pop", T("acabando", g0) - 0.1, 0.06);

// ---- trocas de cena ----
const cam = [`tl.set("#camera", { scale: 1 }, 0); tl.set(".faixa", { xPercent: -110 }, 0);`, ...camPre];
const faixa = (t) => {
  cam.push(`tl.fromTo("#fx1", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.21)});`);
  cam.push(`tl.fromTo("#fx2", { xPercent: -110 }, { xPercent: 110, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${f(t - 0.15)});`);
  cam.push(`tl.fromTo("#camera", { scale: 1.16 }, { scale: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${f(t)});`);
  som("whoosh", t - 0.2, 0.06);
};
faixa(ini("dados")); faixa(ini("5x2")); faixa(ini("beneficios"));
// viradas de cadeira e mão na câmera: corte seco, só um whoosh acompanhando o movimento
[ini("presencial"), ini("online"), ini("final")].forEach((t) => som("whoosh-short", t - 0.12, 0.05));
// pausa cortada dentro do mesmo take (Teresina): pulo de câmera
trechos.forEach((t, i) => { if (i && trechos[i - 1].nome === t.nome && t.nome === "dados") cam.push(`tl.set("#camera", { scale: 1.1 }, ${f(t.ini)}); tl.set("#camera", { scale: 1 }, ${f(t.fim)});`); });

// ---- legenda (estilo aprovado, maior; palavra-chave sozinha, mais forte e em vermelho) ----
const CHAVES = new Set(["black", "acabando", "teresina", "maceio", "socorro", "60%", "55%", "40%", "200", "135", "180", "5x2", "intervalo", "folgas", "beneficios", "simples", "presencial", "legenda", "online", "site", "print", "corre"]);
const ehChave = (p) => p && CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => {
  const prox = PAL[i + 1];
  if (ehChave(p)) { if (g.length) { grupos.push(g); g = []; } const gc = [p]; gc.chave = true; grupos.push(gc); return; }
  g.push(p);
  if (!prox || prox.trecho !== p.trecho || /[.,!?;:]$/.test(p.texto) || prox.ini - p.fim >= 0.2 || g.length === 3 || ehChave(prox)) { grupos.push(g); g = []; }
});
if (g.length) grupos.push(g);
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0.02, gr[0].ini - 0.04), prox = grupos[i + 1];
  const fimTrecho = trechos.find((t) => gr[0].ini >= t.ini - 0.01 && gr[0].ini < t.fim)?.fim ?? DUR;
  const b = Math.min(prox ? prox[0].ini - 0.03 : DUR, gr.at(-1).fim + 0.35, fimTrecho, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(Math.max(0.12, b - a))}" data-track-index="0"><div class="cx${gr.chave ? " ch" : ""}">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw">${esc(p.texto.replace(/[.,?:]$/, ""))}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += gr.chave
    ? `      tl.fromTo("#lg${i}w${j}", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`
    : `      tl.fromTo("#lg${i}w${j}", { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, ${f(Math.max(0, p.ini - 0.04))});\n`; });
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
    .flash { position: absolute; inset: 0; background: #fff; }`;
const CSS_ATRAS = `
    .bloco { position: absolute; left: 190px; width: 700px; top: 330px; height: 1200px; background: ${VM}; transform-origin: bottom center; }
    .moldura { position: absolute; left: 150px; width: 780px; top: 290px; height: 1280px; border: 12px solid ${VM}; }
    .circ { position: absolute; left: 140px; top: 360px; width: 800px; height: 800px; border-radius: 50%; background: ${VM}; }`;
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/app.html"), tpl("app", els.join("\n"), js.join("\n"), CSS));
fs.writeFileSync(path.join(P, "compositions/atras.html"), tpl("atras", atras.join("\n"), js.filter((l) => /#bloco|#circ/.test(l)).join("\n"), CSS_ATRAS));
fs.writeFileSync(path.join(P, "compositions/app.html"), tpl("app", els.join("\n"), js.filter((l) => !/#bloco|#circ/.test(l)).join("\n"), CSS));
fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 120px; width: 800px; top: 1130px; text-align: center; }
    .cx { display: inline-block; font-family: "Inter"; font-weight: 500; font-size: 76px; line-height: 1.12; letter-spacing: -0.035em; color: #fff; text-shadow: 0 0 26px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.35); }
    .cx.ch { font-weight: 800; font-size: 94px; letter-spacing: -0.04em; }
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
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(t0)}" data-duration="${f(Math.min(man[nome].duration, DUR - t0 - 0.01))}" data-track-index="${8 + (i % 4)}" data-volume="${v}"></audio>\n`;
});

const ab = trechos.find((t) => t.nome === "abertura"), ps = trechos.find((t) => t.nome === "presencial");
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
        <video id="rec1" class="clip recorte" src="assets/recorte-abertura.webm" data-start="${f(ab.ini)}" data-duration="${f(ab.fim - ab.ini)}" data-track-index="2" muted data-layout-allow-occlusion></video>
        <video id="rec2" class="clip recorte" src="assets/recorte-presencial.webm" data-start="${f(ps.ini)}" data-duration="${f(ps.fim - ps.ini)}" data-track-index="3" muted data-layout-allow-occlusion></video>
      </div>
      <div id="app" data-composition-id="app" data-composition-src="compositions/app.html" data-start="0" data-duration="${DUR}" data-track-index="4" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${DUR}" data-track-index="5" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
      <div id="fx1" class="clip faixa" data-start="0" data-duration="${DUR}" data-track-index="6" data-layout-allow-occlusion data-layout-allow-overflow></div>
      <div id="fx2" class="clip faixa" data-start="0" data-duration="${DUR}" data-track-index="7" data-layout-allow-occlusion data-layout-allow-overflow></div>
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
