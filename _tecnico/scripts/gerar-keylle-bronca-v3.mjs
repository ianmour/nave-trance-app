#!/usr/bin/env node
// Keylle Lima — "Como dar bronca sem destruir a sua equipe". Vídeo 100% animado em código.
// Fundo único: azul suave com luz. Legenda branca com a palavra-chave numa etiqueta.
// Uso: node gerar-keylle-bronca.mjs <pasta-do-projeto>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const P = process.argv[2];
const W = 1080, H = 1920;
const C = { marinho: "#0A1E4A", royal: "#1E5BFF", claro: "#8FB8FF", gelo: "#EAF2FF", vermelho: "#FF4D5E", verde: "#2BD576" };
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const durVoz = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(P, "assets/narracao.wav")], { encoding: "utf8" }));
const DUR = +(Math.ceil((durVoz + 1.0) * 30) / 30).toFixed(4);

// ---- tempos: palavras do ROTEIRO alinhadas com a transcrição ----
const roteiro = fs.readFileSync(path.join(P, "assets/narracao.txt"), "utf8").replace(/["“”]/g, "").split(/\s+/).filter(Boolean);
const trans = JSON.parse(fs.readFileSync(path.join(P, "assets/transcript.json"), "utf8")).filter((w) => w.text.trim());
const a = roteiro.map(nrm), b = trans.map((w) => nrm(w.text));
// alinhamento simples (programação dinâmica)
const n = a.length, m = b.length, D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
for (let i = 0; i <= n; i++) D[i][0] = i; for (let j = 0; j <= m; j++) D[0][j] = j;
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
const tempo = new Array(n).fill(null);
for (let i = n, j = m; i > 0 && j > 0;) {
  if (D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { tempo[i - 1] = { ini: trans[j - 1].start, fim: trans[j - 1].end }; i--; j--; }
  else if (D[i][j] === D[i - 1][j] + 1) i--; else j--;
}
for (let i = 0; i < n; i++) if (!tempo[i]) { // palavra sem par: entre a anterior e a próxima
  const ant = tempo.slice(0, i).reverse().find(Boolean), pos = tempo.slice(i + 1).find(Boolean);
  const t = ant && pos ? (ant.fim + pos.ini) / 2 : ant ? ant.fim : pos.ini;
  tempo[i] = { ini: t, fim: t + 0.15 };
}
const pal = roteiro.map((t, i) => ({ texto: t, ...tempo[i] }));
const T = (frag) => { // início da primeira ocorrência de uma sequência de palavras
  const ws = frag.split(" ").map(nrm);
  for (let i = 0; i < pal.length; i++) if (ws.every((w, k) => nrm(pal[i + k]?.texto || "") === w)) return pal[i].ini;
  throw new Error("não achei: " + frag);
};

// ---- cenas ----
const els = [], js = [];
const el = (id, t0, t1, html, estilo = "", cls = "") => els.push(`      <div id="${id}" class="clip cena ${cls}" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="0" style="${estilo}" data-layout-allow-overlap>${html}</div>`);
const tw = (s) => js.push("      " + s);
const entra = (s, t) => tw(`tl.fromTo("${s}", { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }, ${f(t)});`);
const sai = (s, t) => tw(`tl.to("${s}", { opacity: 0, y: -40, scale: 0.96, duration: 0.25, ease: "power2.in" }, ${f(t)});`);
const pop = (s, t, rot = 0) => tw(`tl.fromTo("${s}", { opacity: 0, scale: 0.4, rotation: ${rot * 2} }, { opacity: 1, scale: 1, rotation: ${rot}, duration: 0.3, ease: "back.out(2)" }, ${f(t)});`);
const some = (s, t) => tw(`tl.to("${s}", { opacity: 0, scale: 0.6, duration: 0.2, ease: "power2.in" }, ${f(t)});`);
const risca = (s, t) => tw(`tl.fromTo("${s}", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, ${f(t)});`);

// ===== v3: gramática do reels de referência — acumular, zoom entre cenas, telas de app, física =====
const N = "#0A1E4A", R = C.royal, CL = "#DCE8FF", VM = C.vermelho, VD = C.verde, CINZA = "#8A97B5";
const s2 = T("Você já passou"), s3 = T("O problema"), s4 = T("Faça assim"), s5 = T("Um"), s6 = T("Dois"), s7 = T("Três"), s8 = T("Bronca boa"), s9 = T("Quer as frases");
// zoom de saída (a câmera "entra" no cartão) e entrada vindo de longe
const zoomSai = (s, t) => tw(`tl.to("${s}", { scale: 1.9, opacity: 0, filter: "blur(10px)", duration: 0.35, ease: "power2.in" }, ${f(t)});`);
const zoomEntra = (s, t) => tw(`tl.fromTo("${s}", { scale: 0.55, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, ${f(t)});`);
const sobe = (s, t, d = 0.45) => tw(`tl.fromTo("${s}", { y: 160, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: 0, duration: ${d}, ease: "back.out(1.4)" }, ${f(t)});`);
const digita = (s, txt, t0, t1) => [...txt].forEach((_, k) => tw(`tl.set("${s}", { textContent: ${JSON.stringify(txt.slice(0, k + 1))} }, ${f(t0 + (k / txt.length) * (t1 - t0))});`));
const apaga = (s, txt, t0, t1) => [...txt].forEach((_, k) => tw(`tl.set("${s}", { textContent: ${JSON.stringify(txt.slice(0, txt.length - k - 1))} }, ${f(t0 + (k / txt.length) * (t1 - t0))});`));
const rosto = (humor, tam = 70) => { // humor: 2 feliz, 1 neutro, 0 bravo
  const boca = humor === 2 ? `<path d="M22 40 Q35 52 48 40" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/>` : humor === 1 ? `<path d="M24 44 L46 44" stroke="${N}" stroke-width="4" stroke-linecap="round"/>` : `<path d="M24 48 Q35 38 46 48" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/><path d="M18 22 L30 28 M52 22 L40 28" stroke="${N}" stroke-width="4" stroke-linecap="round"/>`;
  const cor = humor === 2 ? "#FFE08A" : humor === 1 ? "#FFE8B8" : "#FFB3A8";
  return `<svg viewBox="0 0 70 70" width="${tam}" height="${tam}"><circle cx="35" cy="35" r="31" fill="${cor}" stroke="${N}" stroke-width="3"/><circle cx="26" cy="32" r="3.5" fill="${N}"/><circle cx="44" cy="32" r="3.5" fill="${N}"/>${boca}</svg>`;
};

// ---- título fixo no topo (muda de texto por bloco) ----
el("topo1", 0, s4 - 0.02, `<div class="kicker">LIDERANÇA · PEQUENOS NEGÓCIOS</div><div class="tit">corrigiu ou <span class="mk">humilhou?</span></div>`, "top:220px");
tw(`tl.fromTo("#topo1 .kicker", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 }, 0);`); // capa: título já visível no quadro 0
tw(`tl.fromTo("#topo1 .mk", { backgroundSize: "0% 40%" }, { backgroundSize: "100% 40%", duration: 0.5, ease: "power2.out" }, ${f(T("humilhado") - 0.1)});`);
sai("#topo1", s4 - 0.25);

// ---- A: celular do chefe -> gira -> lado do funcionário ----
const msg = "Pedido errado DE NOVO. Presta atenção!";
el("cA", 0, s2 + 0.2, `
  <div id="cAflip" class="flip">
    <div class="face frente card fone"><div class="fhead"><i class="av" style="background:${R}">VC</i><b>você (chefe)</b></div>
      <div class="bub eu"><span id="cAtxt"></span><span class="cur">|</span></div>
      <div id="cAok" class="chip ok">você acha: corrigi ✓</div></div>
    <div class="face verso card fone"><div class="fhead"><i class="av" style="background:#9AB6FF">EQ</i><b>funcionário</b></div>
      <div class="bub ele">${msg}</div>
      <div class="medidor"><svg viewBox="0 0 300 170" width="300" height="170"><path d="M30 150 A120 120 0 0 1 270 150" fill="none" stroke="#E4EAF6" stroke-width="26" stroke-linecap="round"/>
        <path d="M30 150 A120 120 0 0 1 90 46" fill="none" stroke="${VM}" stroke-width="26" stroke-linecap="round"/><path d="M90 46 A120 120 0 0 1 210 46" fill="none" stroke="#FFC24B" stroke-width="26"/><path d="M210 46 A120 120 0 0 1 270 150" fill="none" stroke="${VD}" stroke-width="26" stroke-linecap="round"/>
        <g id="cAagulha" style="transform-origin:150px 150px"><path d="M150 150 L150 50" stroke="${N}" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="150" r="14" fill="${N}"/></g></svg>
        <div class="humor"><span id="cAh2">${rosto(2, 64)}</span><span id="cAh0" style="opacity:0">${rosto(0, 64)}</span></div></div>
      <div id="cAno" class="chip no">ele sente: humilhado</div></div>
  </div>`, "top:510px;height:720px;perspective:1600px");
sobe("#cA", 0.02, 0.5);
digita("#cAtxt", msg, 0.25, T("corrigiu") + 0.35);
pop("#cAok", T("corrigiu") + 0.3, -3);
tw(`tl.to("#cAflip", { rotationY: 180, duration: 0.6, ease: "power3.inOut" }, ${f(T("e o seu") - 0.1)});`);
tw(`tl.fromTo("#cAagulha", { rotation: 60 }, { rotation: -62, duration: 0.8, ease: "back.out(1.6)" }, ${f(T("humilhado") - 0.25)});`);
tw(`tl.set("#cAh2", { opacity: 0 }, ${f(T("humilhado"))}); tl.set("#cAh0", { opacity: 1 }, ${f(T("humilhado"))});`);
pop("#cAno", T("humilhado") + 0.1, 3);
zoomSai("#cA", s2 - 0.15);

// ---- B: enquete ----
el("cB", s2, s3 - 0.02, `<div class="card enq"><div class="enqt">Você já passou por isso?</div>
  <div class="opc"><div id="cBbar" class="barra"></div><span>Sim</span></div><div class="opc"><span>Não</span></div>
  <div id="cBdedo" class="dedo">${rosto(1, 0) /* vazio */}<svg viewBox="0 0 60 80" width="70" height="92"><path d="M22 76 L22 30 Q22 22 29 22 Q36 22 36 30 L36 44 L48 46 Q56 48 54 58 L50 76 Z" fill="#F2C9A0" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/></svg></div></div>`, "top:470px");
zoomEntra("#cB", s2 - 0.1);
tw(`tl.fromTo("#cBdedo", { x: 260, y: 220, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, ${f(s2 + 0.25)});`);
tw(`tl.fromTo("#cBdedo", { scale: 1 }, { keyframes: [{ scale: 0.85, duration: 0.08 }, { scale: 1, duration: 0.12 }] }, ${f(s2 + 0.7)});`);
tw(`tl.fromTo("#cBbar", { scaleX: 0 }, { scaleX: 0.86, duration: 0.5, ease: "power3.out" }, ${f(s2 + 0.75)});`);
zoomSai("#cB", s3 - 0.3);

// ---- C: corrigir ✓ e o "jeito" (controle deslizante) ----
el("cC", s3, s4 - 0.02, `<div class="card cfg"><div class="linha"><span>corrigir</span><div id="cCsw" class="sw"><i></i></div></div>
  <div class="sep"></div><div class="linha"><span>o jeito</span></div>
  <div class="slider"><div class="trilho"><div id="cCfill" class="fill"></div></div><div id="cCknob" class="knob"></div>
    <div class="ponta esq">${rosto(0, 66)}<b>bronca</b></div><div class="ponta dir">${rosto(2, 66)}<b>conversa</b></div></div></div>`, "top:470px");
zoomEntra("#cC", s3 - 0.1);
tw(`tl.to("#cCsw", { backgroundColor: "${VD}", duration: 0.2 }, ${f(T("corrigir") + 0.05)}); tl.fromTo("#cCsw i", { x: 0 }, { x: 56, duration: 0.25, ease: "back.out(2)" }, ${f(T("corrigir") + 0.05)});`);
tw(`tl.fromTo("#cCknob", { x: 0 }, { x: 520, duration: 0.7, ease: "power3.inOut" }, ${f(T("jeito") - 0.25)}); tl.fromTo("#cCfill", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, ${f(T("jeito") - 0.25)});`);
zoomSai("#cC", s4 - 0.3);

// ---- barra de passos (acumula de s4 até s8) ----
el("topo2", s4, s8 - 0.02, `<div class="tit" style="font-size:72px">Faça assim</div>
  <div class="passos"><div id="p1" class="passo"><i>1</i>particular</div><div class="lig"><b id="l1"></b></div><div id="p2" class="passo"><i>2</i>fato</div><div class="lig"><b id="l2"></b></div><div id="p3" class="passo"><i>3</i>próximo passo</div></div>`, "top:220px");
tw(`tl.fromTo("#topo2 .tit", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, ${f(s4)});`);
["#p1", "#p2", "#p3"].forEach((s, i) => pop(s, s4 + 0.15 + i * 0.12));
const marca = (pid, lid, t) => { tw(`tl.to("${pid}", { backgroundColor: "${R}", color: "#fff", duration: 0.2 }, ${f(t)}); tl.fromTo("${pid}", { scale: 1 }, { keyframes: [{ scale: 1.15, duration: 0.1 }, { scale: 1, duration: 0.15 }] }, ${f(t)});`); if (lid) tw(`tl.fromTo("${lid}", { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, ${f(t + 0.1)});`); };
marca("#p1", null, s5 + 0.05); marca("#p2", "#l1", s6 + 0.05); marca("#p3", "#l2", s7 + 0.05);
sai("#topo2", s8 - 0.25);

// ---- E: planta do escritório (fale em particular) ----
const mesas = [[60, 60], [250, 60], [60, 230], [250, 230]].map(([x, y]) => `<i class="mesa" style="left:${x}px;top:${y}px"></i>`).join("");
const gente = [[95, 150, "#9AB6FF"], [285, 150, "#9AB6FF"], [95, 320, "#9AB6FF"], [285, 320, "#9AB6FF"]].map(([x, y, c], i) => `<b id="cEg${i}" class="pt" style="left:${x}px;top:${y}px;background:${c}"></b>`).join("");
el("cE", s5, s6 - 0.02, `<div class="card planta"><div class="piso">${mesas}${gente}
    <b id="cEch" class="pt grande" style="left:170px;top:420px;background:${R}">VC</b><b id="cEfu" class="pt grande" style="left:260px;top:420px;background:#7FA3FF">EQ</b>
    <div class="sala2"><span>sala reservada</span><div id="cEporta" class="porta2"></div></div></div>
  <div id="cEal" class="chip no" style="margin-top:22px">na frente dos outros = humilhação</div></div>`, "top:430px");
zoomEntra("#cE", s5 - 0.05);
tw(`tl.to("#cEch", { x: 330, y: -170, duration: 0.7, ease: "power2.inOut" }, ${f(T("particular") - 0.3)}); tl.to("#cEfu", { x: 330, y: -170, duration: 0.7, ease: "power2.inOut" }, ${f(T("particular") - 0.2)});`);
tw(`tl.fromTo("#cEporta", { rotation: -80 }, { rotation: 0, duration: 0.35, ease: "back.out(2)" }, ${f(T("particular") + 0.55)});`);
[0, 1, 2, 3].forEach((i) => tw(`tl.to("#cEg${i}", { backgroundColor: "${VM}", scale: 1.25, duration: 0.2 }, ${f(T("na frente") + i * 0.06)});`));
pop("#cEal", T("vira humilhação"), -2);
zoomSai("#cE", s6 - 0.3);

// ---- F: campo de texto (fale do fato) ----
const ruim = "Você é desatento.", bom = "O pedido saiu errado hoje.";
el("cF", s6, s7 - 0.02, `<div class="card campo"><div class="rot">como falar</div>
  <div class="input"><span id="cFtxt"></span><span class="cur">|</span><i id="cFsub" class="ondulado"></i></div>
  <div class="dicas"><span id="cFd1" class="chip no">pessoa ✕</span><span id="cFd2" class="chip ok">fato ✓</span></div></div>`, "top:500px");
zoomEntra("#cF", s6 - 0.05);
digita("#cFtxt", ruim, T("Troque") - 0.1, T("desatento") + 0.3);
tw(`tl.fromTo("#cFsub", { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, ${f(T("desatento") + 0.35)});`); pop("#cFd1", T("desatento") + 0.4, -3);
apaga("#cFtxt", ruim, T("por o pedido") - 0.05, T("o pedido") + 0.15);
tw(`tl.set("#cFsub", { scaleX: 0 }, ${f(T("por o pedido"))});`);
digita("#cFtxt", bom, T("o pedido") + 0.18, T("hoje") + 0.3); pop("#cFd2", T("hoje") + 0.25, 3);
zoomSai("#cF", s7 - 0.3);

// ---- G: cartão de tarefa + carimbo ----
const perg = "O que a gente faz pra isso não se repetir?";
el("cG", s7, s8 - 0.02, `<div class="card tarefa"><div class="rot">próximo passo</div>
  <div class="bub eu" style="max-width:640px"><span id="cGtxt"></span></div>
  <div id="cGtask" class="task"><i class="cb"></i><span>Conferir o pedido antes de enviar</span><span class="avs"><i style="background:${R}">VC</i><i style="background:#7FA3FF">EQ</i></span></div>
  <div id="cGcar" class="carimbo">COMBINADO</div></div>`, "top:500px");
zoomEntra("#cG", s7 - 0.05);
digita("#cGtxt", perg, T("O que a gente") - 0.05, T("repetir") + 0.25);
sobe("#cGtask", T("termine") + 0.2, 0.4);
tw(`tl.fromTo("#cGcar", { scale: 2.6, rotation: -30, opacity: 0 }, { scale: 1, rotation: -12, opacity: 1, duration: 0.25, ease: "power4.in" }, ${f(T("repetir") + 0.2)}); tl.to("#cGtask .cb", { backgroundColor: "${VD}", duration: 0.15 }, ${f(T("repetir") + 0.25)});`);
zoomSai("#cG", s8 - 0.3);

// ---- H: dedo pêndulo -> mapa com caminho ----
el("topo3", s8, s9 - 0.02, `<div class="tit" style="font-size:80px">bronca boa não<br><span class="mk" id="topo3mk">aponta o dedo</span></div>`, "top:220px");
tw(`tl.fromTo("#topo3", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, ${f(s8)}); tl.fromTo("#topo3mk", { backgroundSize: "0% 40%" }, { backgroundSize: "100% 40%", duration: 0.5 }, ${f(T("aponta") - 0.1)});`);
sai("#topo3", s9 - 0.25);
el("cH", s8, s9 - 0.02, `<div class="pendulo"><i class="fio"></i><div id="cHmao" class="maoP"><svg viewBox="0 0 90 120" width="150" height="200"><path d="M30 6 L30 60 Q30 70 22 70 Q12 70 12 82 Q12 108 40 114 L62 114 Q80 112 80 92 L80 62 Q80 54 72 54 Q66 54 64 60 Q64 50 56 50 Q50 50 48 56 Q48 46 40 46 L40 6 Q40 0 35 0 Q30 0 30 6 Z" fill="#F2C9A0" stroke="${N}" stroke-width="4" stroke-linejoin="round" transform="rotate(180 45 60)"/></svg></div></div>
  <div id="cHmapa" class="card mapa"><svg viewBox="0 0 760 520" width="760" height="520">
    <rect width="760" height="520" rx="26" fill="#EEF4FF"/><path d="M0 130 H760 M0 300 H760 M0 440 H760 M180 0 V520 M420 0 V520 M610 0 V520" stroke="#fff" stroke-width="28"/>
    <path id="cHrota" d="M120 440 L180 440 L180 300 L420 300 L420 130 L610 130" fill="none" stroke="${R}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1200" stroke-dashoffset="1200"/>
    <circle cx="120" cy="440" r="18" fill="${N}"/><g id="cHpin"><path d="M610 128 Q580 92 580 72 A30 30 0 0 1 640 72 Q640 92 610 128 Z" fill="${VM}" stroke="${N}" stroke-width="4"/><circle cx="610" cy="72" r="11" fill="#fff"/></g></svg>
    <div class="rot" style="position:absolute;left:30px;top:24px">mostra o caminho</div></div>`, "top:460px");
tw(`tl.fromTo("#cHmao", { rotation: -38 }, { keyframes: [{ rotation: 32, duration: 0.55 }, { rotation: -22, duration: 0.5 }, { rotation: 14, duration: 0.45 }, { rotation: 0, duration: 0.4 }], ease: "sine.inOut" }, ${f(s8 - 0.05)});`);
tw(`tl.fromTo(".pendulo", { y: -500 }, { y: 0, duration: 0.4, ease: "power2.out" }, ${f(s8 - 0.1)}); tl.to(".pendulo", { y: -700, opacity: 0, duration: 0.35, ease: "power2.in" }, ${f(T("Mostra o caminho") - 0.3)});`);
zoomEntra("#cHmapa", T("Mostra o caminho") - 0.2);
tw(`tl.fromTo("#cHrota", { attr: { "stroke-dashoffset": 1200 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, ease: "power2.inOut" }, ${f(T("Mostra o caminho"))});`);
tw(`tl.fromTo("#cHpin", { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out" }, ${f(T("caminho") + 0.2)});`);
tw(`tl.set("#cHmapa", { opacity: 0 }, 0);`);
zoomSai("#cHmapa", s9 - 0.3);

// ---- I: post + comentário + notificação de DM ----
el("cI", s9, DUR, `<div class="tit" style="font-size:64px;margin-bottom:30px">quer as frases prontas?</div>
  <div id="cIpost" class="card post"><div class="fhead"><i class="av" style="background:${R}">KL</i><b>keyllelima</b></div>
    <div class="img"><div class="imgt">como dar bronca<br>sem destruir<br>a sua equipe</div></div>
    <div class="acoes"><svg id="cIcor" viewBox="0 0 40 36" width="56" height="50"><path d="M20 34 L4 18 A9 9 0 0 1 20 6 A9 9 0 0 1 36 18 Z" fill="none" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/></svg></div>
    <div class="coment"><span id="cItxt"></span><span class="cur">|</span><i id="cIenv">publicar</i></div></div>
  <div id="cIdm" class="card dm"><i class="av" style="background:${R}">KL</i><div><b>Keylle Lima</b><span>te enviou as frases prontas</span></div></div>`, "top:240px");
zoomEntra("#cI", s9 - 0.05);
tw(`tl.to("#cIcor path", { fill: "${VM}", stroke: "${VM}", duration: 0.15 }, ${f(T("prontas"))}); tl.fromTo("#cIcor", { scale: 1 }, { keyframes: [{ scale: 1.4, duration: 0.12 }, { scale: 1, duration: 0.15 }] }, ${f(T("prontas"))});`);
digita("#cItxt", "BRONCA", T("Comenta") + 0.05, T("Comenta") + 0.55);
tw(`tl.fromTo("#cIenv", { scale: 1 }, { keyframes: [{ scale: 1.2, duration: 0.1 }, { scale: 1, duration: 0.12 }] }, ${f(T("Comenta") + 0.7)});`);
tw(`tl.fromTo("#cIdm", { y: -300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.6)" }, ${f(T("te mando") - 0.2)});`);

// ---- legenda ----
const CHAVES = new Set(["humilhado", "corrigir", "jeito", "particular", "humilhacao", "fato", "pessoa", "passo", "caminho", "bronca", "dedo"]);
const grupos = []; let g = [];
pal.forEach((p, i) => { g.push(p); const prox = pal[i + 1]; if (!prox || /[.?!:]$/.test(p.texto) || (/,$/.test(p.texto) && g.length >= 2) || g.length === 4 || prox.ini - p.fim > 0.3) { grupos.push(g); g = []; } });
let lh = "", lj = "";
grupos.forEach((gr, i) => {
  const ini = Math.max(0.02, gr[0].ini - 0.05), prox = grupos[i + 1];
  const fim = Math.min(prox ? prox[0].ini - 0.04 : DUR, gr[gr.length - 1].fim + 0.6, DUR);
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(ini)}" data-duration="${f(Math.max(0.15, fim - ini))}" data-track-index="0"><div class="cx">${gr.map((p, j) => `<span id="lg${i}w${j}" class="pw${CHAVES.has(nrm(p.texto)) ? " chave" : ""}">${esc(p.texto)}</span>`).join(" ")}</div></div>\n`;
  gr.forEach((p, j) => { lj += `      tl.fromTo("#lg${i}w${j}", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, ${f(Math.max(0, p.ini - 0.03))});\n`; });
  lj += `      tl.to("#lg${i} .cx", { opacity: 0, duration: 0.1 }, ${f(Math.max(ini + 0.05, fim - 0.1))});\n`;
});

const SOMBRA = "0 24px 60px rgba(10,30,74,0.16), 0 4px 14px rgba(10,30,74,0.08)";
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions/cenas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; font-family: "Inter"; letter-spacing: -0.03em; color: ${N}; }
    .cena { position: absolute; left: 120px; width: 840px; text-align: center; }
    .kicker { display: inline-block; font-weight: 800; font-size: 26px; letter-spacing: 0.12em; color: ${R}; background: ${CL}; padding: 8px 18px; border-radius: 999px; }
    .tit { font-weight: 900; font-size: 84px; line-height: 0.98; margin-top: 16px; }
    .mk { background-image: linear-gradient(${R}55, ${R}55); background-repeat: no-repeat; background-position: 0 85%; background-size: 0% 40%; padding: 0 6px; }
    .card { background: #fff; border-radius: 34px; box-shadow: ${SOMBRA}; }
    .flip { position: relative; width: 600px; height: 640px; margin: 0 auto; transform-style: preserve-3d; }
    .face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; padding: 34px; text-align: left; }
    .verso { transform: rotateY(180deg); }
    .fhead { display: flex; align-items: center; gap: 16px; font-size: 34px; padding-bottom: 22px; border-bottom: 2px solid #EEF2FA; }
    .av { width: 64px; height: 64px; border-radius: 50%; color: #fff; font-style: normal; font-weight: 900; font-size: 26px; display: inline-flex; align-items: center; justify-content: center; }
    .bub { display: inline-block; margin-top: 30px; padding: 22px 28px; border-radius: 28px; font-weight: 800; font-size: 44px; line-height: 1.15; }
    .bub.eu { background: ${R}; color: #fff; border-bottom-right-radius: 8px; float: right; max-width: 470px; }
    .bub.ele { background: #EEF2FA; color: ${N}; border-bottom-left-radius: 8px; max-width: 470px; }
    .cur { opacity: 0.6; font-weight: 400; }
    .chip { display: inline-block; padding: 12px 24px 14px; border-radius: 999px; font-weight: 900; font-size: 34px; color: #fff; }
    .chip.ok { background: ${VD}; } .chip.no { background: ${VM}; }
    .frente .chip { position: absolute; left: 34px; bottom: 40px; } .verso .chip { position: absolute; left: 34px; bottom: 40px; }
    .medidor { position: relative; margin: 26px auto 0; width: 300px; text-align: center; } .humor { position: absolute; left: 118px; top: 96px; } .humor span { position: absolute; left: 0; top: 0; }
    .enq { width: 720px; margin: 0 auto; padding: 44px; text-align: left; position: relative; }
    .enqt { font-weight: 900; font-size: 64px; line-height: 1; margin-bottom: 30px; }
    .opc { position: relative; height: 100px; border-radius: 24px; background: #EEF2FA; margin-top: 18px; overflow: hidden; display: flex; align-items: center; padding-left: 30px; font-weight: 800; font-size: 44px; }
    .opc span { position: relative; } .barra { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: ${CL}; transform-origin: left center; }
    .dedo { position: absolute; right: 120px; top: 200px; }
    .cfg { width: 760px; margin: 0 auto; padding: 44px; text-align: left; }
    .linha { display: flex; justify-content: space-between; align-items: center; font-weight: 900; font-size: 60px; }
    .sw { width: 128px; height: 72px; border-radius: 999px; background: #C9D3E6; position: relative; } .sw i { position: absolute; left: 8px; top: 8px; width: 56px; height: 56px; border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.2); }
    .sep { height: 2px; background: #EEF2FA; margin: 34px 0; }
    .slider { position: relative; height: 230px; margin-top: 20px; }
    .trilho { position: absolute; left: 60px; right: 60px; top: 30px; height: 22px; border-radius: 999px; background: #E4EAF6; overflow: hidden; } .fill { position: absolute; inset: 0; background: linear-gradient(90deg, ${VM}, #FFC24B, ${VD}); transform-origin: left center; }
    .knob { position: absolute; left: 30px; top: 6px; width: 70px; height: 70px; border-radius: 50%; background: #fff; box-shadow: 0 6px 16px rgba(10,30,74,0.3); border: 6px solid ${R}; }
    .ponta { position: absolute; top: 100px; text-align: center; font-weight: 800; font-size: 32px; } .ponta b { display: block; } .ponta.esq { left: 20px; } .ponta.dir { right: 20px; }
    .passos { display: flex; align-items: center; justify-content: center; margin-top: 26px; }
    .passo { display: flex; align-items: center; gap: 10px; padding: 12px 20px 12px 12px; border-radius: 999px; background: #fff; box-shadow: ${SOMBRA}; font-weight: 800; font-size: 30px; color: ${N}; }
    .passo i { width: 46px; height: 46px; border-radius: 50%; background: ${CL}; color: ${R}; font-style: normal; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; }
    .lig { width: 40px; height: 6px; background: #E4EAF6; border-radius: 3px; overflow: hidden; } .lig b { display: block; height: 100%; background: ${R}; transform-origin: left center; transform: scaleX(0); }
    .planta { width: 760px; margin: 0 auto; padding: 30px; }
    .piso { position: relative; height: 560px; border-radius: 24px; background: #F3F6FC; overflow: hidden; }
    .mesa { position: absolute; width: 150px; height: 80px; border-radius: 14px; background: #fff; box-shadow: 0 6px 14px rgba(10,30,74,0.1); }
    .pt { position: absolute; z-index: 2; width: 46px; height: 46px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(10,30,74,0.25); }
    .pt.grande { width: 70px; height: 70px; color: #fff; font-size: 24px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    .sala2 { position: absolute; z-index: 1; right: 20px; top: 20px; width: 230px; height: 300px; border-radius: 20px; background: #fff; border: 4px dashed ${R}; }
    .sala2 span { position: absolute; left: 0; right: 0; top: 12px; font-weight: 800; font-size: 24px; color: ${R}; }
    .porta2 { position: absolute; left: -4px; bottom: 60px; width: 8px; height: 110px; background: ${R}; border-radius: 4px; transform-origin: 50% 100%; }
    .campo, .tarefa { width: 800px; margin: 0 auto; padding: 40px; text-align: left; position: relative; }
    .rot { font-weight: 800; font-size: 28px; letter-spacing: 0.1em; text-transform: uppercase; color: ${CINZA}; margin-bottom: 18px; }
    .input { position: relative; min-height: 120px; border-radius: 22px; background: #F3F6FC; padding: 30px; font-weight: 800; font-size: 50px; }
    .ondulado { position: absolute; left: 30px; bottom: 26px; width: 420px; height: 10px; background: repeating-linear-gradient(135deg, ${VM} 0 6px, transparent 6px 12px); transform-origin: left center; transform: scaleX(0); }
    .dicas { display: flex; gap: 18px; margin-top: 24px; }
    .task { display: flex; align-items: center; gap: 18px; clear: both; margin-top: 30px; padding: 24px; border-radius: 22px; background: #F3F6FC; font-weight: 800; font-size: 36px; }
    .cb { width: 44px; height: 44px; border-radius: 12px; border: 4px solid ${N}; background: #fff; display: inline-block; flex: none; }
    .avs { margin-left: auto; display: flex; } .avs i { width: 54px; height: 54px; border-radius: 50%; color: #fff; font-style: normal; font-size: 20px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; border: 3px solid #fff; margin-left: -12px; }
    .carimbo { position: absolute; right: 40px; top: 30px; padding: 10px 22px; border: 7px solid ${VD}; color: ${VD}; border-radius: 16px; font-weight: 900; font-size: 52px; letter-spacing: 0.06em; background: rgba(255,255,255,0.85); }
    .pendulo { position: absolute; left: 345px; top: 140px; transform-origin: 75px 0; }
    .fio { position: absolute; left: 73px; top: -150px; width: 4px; height: 170px; background: ${N}; }
    .maoP { transform-origin: 75px 0; }
    .mapa { position: relative; width: 760px; height: 520px; margin: 0 auto; overflow: hidden; }
    .post { width: 700px; margin: 0 auto; padding: 26px; text-align: left; }
    .img { margin-top: 20px; height: 420px; border-radius: 20px; background: linear-gradient(150deg, #0B2466, ${R}); display: flex; align-items: center; justify-content: center; }
    .imgt { color: #fff; font-weight: 900; font-size: 56px; line-height: 1; text-align: center; }
    .acoes { margin-top: 18px; }
    .coment { position: relative; margin-top: 14px; padding: 18px 150px 18px 24px; border-radius: 999px; background: #F3F6FC; font-weight: 900; font-size: 44px; min-height: 86px; }
    .coment i { position: absolute; right: 26px; top: 22px; font-style: normal; font-weight: 900; font-size: 30px; color: ${R}; }
    .dm { position: absolute; z-index: 5; left: 70px; top: 330px; width: 700px; display: flex; align-items: center; gap: 20px; padding: 22px 28px; text-align: left; font-size: 32px; }
    .dm b { display: block; font-size: 34px; } .dm span { color: ${CINZA}; font-weight: 700; }
  </style>
  <div id="root" data-composition-id="cenas" data-width="${W}" data-height="${H}">
${els.join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["cenas"] = tl;
    })();
  </script>
</template>
`);

fs.writeFileSync(path.join(P, "compositions/legendas.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .grupo { position: absolute; left: 150px; width: 780px; top: 1210px; text-align: center; }
    .cx { display: inline-block; font-family: "Inter"; font-weight: 800; font-size: 48px; line-height: 1.3; letter-spacing: -0.03em; color: ${N}; }
    .pw { display: inline-block; }
    .chave { background: ${R}; color: #fff; font-weight: 900; padding: 0 14px 4px; border-radius: 12px; }
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

// ---- efeitos (sem música) ----
const SFX = "/root/.claude/skills/media-use/audio/assets/sfx";
fs.mkdirSync(path.join(P, "assets/sfx"), { recursive: true });
const man = JSON.parse(fs.readFileSync(path.join(SFX, "manifest.json"), "utf8"));
const sons = [
  ["whoosh-short", 0.02, 0.1], ["typing", 0.25, 0.08], ["pop", T("corrigiu") + 0.3, 0.14], ["whoosh", T("e o seu") - 0.1, 0.1], ["error", T("humilhado") - 0.2, 0.06], ["pop", T("humilhado") + 0.1, 0.14],
  ["whoosh-short", s2 - 0.15, 0.1], ["click", s2 + 0.7, 0.16], ["whoosh-short", s3 - 0.15, 0.1], ["click-soft", T("corrigir") + 0.05, 0.16], ["whoosh", T("jeito") - 0.25, 0.08],
  ["whoosh-short", s4 - 0.1, 0.1], ["pop", s4 + 0.15, 0.12], ["pop", s4 + 0.27, 0.12], ["pop", s4 + 0.39, 0.12],
  ["ping", s5 + 0.05, 0.08], ["whoosh", T("particular") - 0.3, 0.08], ["click", T("particular") + 0.55, 0.16], ["notification", T("vira humilhação"), 0.06],
  ["ping", s6 + 0.05, 0.08], ["typing", T("Troque") - 0.1, 0.08], ["error", T("desatento") + 0.35, 0.05], ["key-press", T("por o pedido"), 0.12], ["typing", T("o pedido") + 0.18, 0.08], ["pop", T("hoje") + 0.25, 0.14],
  ["ping", s7 + 0.05, 0.08], ["typing", T("O que a gente") - 0.05, 0.08], ["whoosh-short", T("termine") + 0.2, 0.1], ["impact-bass-1", T("repetir") + 0.42, 0.1],
  ["whoosh", s8 - 0.1, 0.08], ["whoosh-short", T("Mostra o caminho") - 0.2, 0.1], ["pop", T("caminho") + 0.65, 0.14],
  ["whoosh-short", s9 - 0.05, 0.1], ["pop", T("prontas"), 0.14], ["key-press", T("Comenta") + 0.1, 0.12], ["key-press", T("Comenta") + 0.3, 0.12], ["key-press", T("Comenta") + 0.5, 0.12], ["click", T("Comenta") + 0.7, 0.16], ["notification", T("te mando") - 0.2, 0.08],
];
let audios = `      <audio id="voz" class="clip" src="assets/narracao.wav" data-start="0" data-duration="${f(durVoz)}" data-track-index="4" data-volume="1.6"></audio>\n`;
sons.forEach(([nome, t, v], i) => {
  const arq = path.basename(man[nome].file || `${nome}.mp3`);
  fs.copyFileSync(path.join(SFX, arq), path.join(P, "assets/sfx", arq));
  audios += `      <audio id="som${i}" class="clip" src="assets/sfx/${arq}" data-start="${f(Math.max(0, t))}" data-duration="${f(Math.min(man[nome].duration, DUR - t - 0.01))}" data-track-index="${5 + (i % 3)}" data-volume="${v}"></audio>\n`;
});

fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #FAFCFF; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background-color: #FAFCFF; }
      #palco { position: absolute; inset: -60px; transform-origin: 50% 45%;
        background-image: linear-gradient(rgba(30,91,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(30,91,255,0.07) 2px, transparent 2px); background-size: 64px 64px; }
      #luzA, #luzB { position: absolute; width: 1100px; height: 1100px; border-radius: 50%;
        background: radial-gradient(circle, rgba(120,170,255,0.75) 0%, rgba(150,190,255,0.35) 35%, rgba(250,252,255,0) 68%); }
      #luzA { left: -520px; top: -480px; } #luzB { right: -520px; bottom: -480px; }
      #cenas, #legendas { position: absolute; inset: 0; } #legendas { z-index: 3; } #cenas { z-index: 2; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="palco" data-layout-ignore></div>
      <div id="luzA" data-layout-ignore></div>
      <div id="luzB" data-layout-ignore></div>
      <div id="cenas" data-composition-id="cenas" data-composition-src="compositions/cenas.html" data-start="0" data-duration="${f(DUR)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
      <div id="legendas" data-composition-id="legendas" data-composition-src="compositions/legendas.html" data-start="0" data-duration="${f(DUR)}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#palco", { scale: 1 }, { scale: 1.08, duration: ${f(DUR)}, ease: "none" }, 0);
      tl.fromTo("#luzA", { x: 0, y: 0, scale: 1 }, { x: 80, y: 60, scale: 1.12, duration: ${f(DUR)}, ease: "sine.inOut" }, 0);
      tl.fromTo("#luzB", { x: 0, y: 0, scale: 1 }, { x: -80, y: -60, scale: 1.12, duration: ${f(DUR)}, ease: "sine.inOut" }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok v3: ${pal.length} palavras, ${grupos.length} blocos de legenda, ${sons.length} efeitos, duração ${DUR}s`);
