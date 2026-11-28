#!/usr/bin/env node
// Lizzie — "Forest Shankara" v3: MOTION de verdade. Ela recortada do fundo (vídeo com transparência) permite:
// palavras gigantes ATRÁS dela, troca do fundo (festival, Ilha da Magia), carrossel 3D de fotos girando em volta dela.
// Cenas de tela cheia com palavras batendo (kinetic type), visor de câmera com foco travando, congelamento que vira foto,
// cortes rápidos de fotos no ritmo, tela dividida, letras se desmanchando, vazamento de luz nas transições.
// Cada foto aparece uma vez só. Legenda creme Poppins + Playfair itálico (estilo dela). Sem música; muitos efeitos.
// Uso: node gerar-lizzie-forest-v3.mjs <projeto> <palavras.json> <duração da fala s> <mapa.json>
import fs from "node:fs";
import path from "node:path";

const [P, TJ, FALA_S, MAPA_J] = process.argv.slice(2);
const W = 1080, H = 1920, CR = "#F3E6C8", OURO = "#E8B86A", VERM = "#C2412F";
const FALA = +FALA_S, DUR = +(FALA + 0.45).toFixed(2);
const MAPA = JSON.parse(fs.readFileSync(MAPA_J, "utf8"));
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const PAL = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription.map((x) => ({ texto: x.text.trim(), ini: x.offsets.from / 1000, fim: x.offsets.to / 1000 }));
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };

let sem = 7; const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
const cenas = [], atras = [], js = [], sons = [], SEM_LEG = [], RECORTE_ON = [];
const tw = (s) => js.push("      " + s);
const som = (nome, t, v) => sons.push([nome, Math.max(0, t), v]);
const clip = (lista, id, t0, t1, html, z, estilo = "") => lista.push(`        <div id="${id}" class="clip cena" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="${z}" style="z-index:${z};${estilo}">${html}</div>`);
const cheia = (id, t0, t1, html, z = 10) => clip(cenas, id, t0, t1, html, z);
// algo ATRÁS dela: fica entre o vídeo e o recorte dela (dentro da "câmera", acompanha o zoom)
const tras = (id, t0, t1, html) => { clip(atras, id, t0, t1, html, 2); RECORTE_ON.push([t0, t1]); };
let nfl = 0;
const flash = (t, cor = "#fff6e0", o = 0.85) => { const id = `fl${nfl++}`; cheia(id, t, t + 0.3, `<i class="luz" style="background:${cor}"></i>`, 40); tw(`tl.fromTo("#${id} .luz", { opacity: ${o} }, { opacity: 0, duration: 0.28, ease: "power2.out" }, ${f(t)});`); };
let nlk = 0;
const vaza = (t, d = 0.9) => { const id = `lk${nlk++}`; cheia(id, t, t + d, `<i class="vaz v1"></i><i class="vaz v2"></i>`, 41);
  tw(`tl.fromTo("#${id} .v1", { opacity: 0, x: -400, scale: 0.8 }, { opacity: 0.85, x: 200, scale: 1.2, duration: ${f(d * 0.55)}, ease: "sine.out" }, ${f(t)});`);
  tw(`tl.to("#${id} .v1", { opacity: 0, x: 500, duration: ${f(d * 0.45)}, ease: "sine.in" }, ${f(t + d * 0.55)});`);
  tw(`tl.fromTo("#${id} .v2", { opacity: 0, y: 300 }, { opacity: 0.6, y: -100, duration: ${f(d * 0.5)}, ease: "sine.out" }, ${f(t + 0.05)});`);
  tw(`tl.to("#${id} .v2", { opacity: 0, duration: ${f(d * 0.45)} }, ${f(t + d * 0.5)});`); som("whoosh-cinematic", t - 0.1, 0.035); };
const palavraGigante = (id, t0, t1, txt, estilo = "", entrada = "sobe") => {
  tras(id, t0, t1, `<i class="escurece"></i><div class="gig" style="${estilo}">${txt}</div>`);
  tw(`tl.fromTo("#${id} .escurece", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${f(t0)});`);
  if (entrada === "sobe") tw(`tl.fromTo("#${id} .gig", { yPercent: 40, opacity: 0, scale: 0.9 }, { yPercent: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }, ${f(t0)});`);
  else tw(`tl.fromTo("#${id} .gig", { scale: 1.6, opacity: 0, letterSpacing: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "expo.out" }, ${f(t0)});`);
  tw(`tl.to("#${id} .gig", { scale: 1.06, duration: ${f(Math.max(0.2, t1 - t0 - 0.7))}, ease: "none" }, ${f(t0 + 0.45)});`);
  tw(`tl.to("#${id}", { opacity: 0, duration: 0.22 }, ${f(t1 - 0.22)});`);
  som("whoosh", t0 - 0.12, 0.04); som("impact-bass-1", t0 + 0.1, 0.035);
};

// ============ 0 — gancho: "É que tanta coisa acontece no momento que eu clico aquele botão." ============
palavraGigante("g1", T("momento") - 0.05, T("Fotografar") - 0.02, "momento");
flash(T("clico") - 0.03); som("click", T("clico") - 0.05, 0.11); som("riser", 0, 0.03);

// ============ 1 — tela cheia, palavras batendo: "Fotografar pra mim é muito mais do que clicar um botão e registrar um momento" ============
{
  const t0 = T("Fotografar") - 0.04, t1 = T("É conseguir") - 0.04; SEM_LEG.push([t0, t1]);
  const pal = [["FOTOGRAFAR", "Fotografar", "x", -1], ["pra mim", "pra mim", "y", 1], ["é muito mais", "é muito", "x", 1], ["do que clicar", "do que clicar", "y", -1], ["um botão", "um botão", "x", -1], ["e registrar", "e registrar", "y", 1], ["um momento.", "momento", "x", 1]];
  cheia("k1", t0, t1, `<img class="kfundo" src="assets/fotos/cam1.jpg"><i class="kescuro"></i>` + pal.map(([txt], k) => `<div class="kw ${k % 2 ? "it" : "cx"}" id="k1w${k}">${txt}</div>`).join(""), 10);
  tw(`tl.fromTo("#k1 .kfundo", { scale: 1.35, rotation: -6 }, { scale: 1.05, rotation: 0, duration: ${f(t1 - t0)}, ease: "none" }, ${f(t0)});`);
  tw(`tl.fromTo("#k1", { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.25, ease: "expo.out" }, ${f(t0)});`);
  pal.forEach(([txt, chave, eixo, sinal], k) => {
    const a = T(chave, 2.9) - 0.05, b = k < pal.length - 1 ? T(pal[k + 1][1], 2.9) - 0.05 : t1;
    const de = eixo === "x" ? `{ x: ${900 * sinal}, opacity: 0, skewX: ${-20 * sinal} }` : `{ y: ${700 * sinal}, opacity: 0, scale: 1.4 }`;
    tw(`tl.fromTo("#k1w${k}", ${de}, { x: 0, y: 0, opacity: 1, skewX: 0, scale: 1, duration: 0.22, ease: "expo.out" }, ${f(a)});`);
    if (k < pal.length - 1) tw(`tl.to("#k1w${k}", { opacity: 0, scale: 0.85, filter: "blur(8px)", duration: 0.12 }, ${f(b - 0.02)});`);
    som(k % 2 ? "whoosh-short" : "click", a - 0.03, 0.06);
  });
  flash(T("clicar") - 0.03); som("click", T("clicar") - 0.05, 0.1);
  tw(`tl.to("#k1 .kfundo", { filter: "brightness(1.6) saturate(0)", duration: 0.12, yoyo: true, repeat: 1 }, ${f(T("clicar") - 0.03)});`);
  tw(`tl.to("#k1", { clipPath: "inset(0% 50% 0% 50%)", duration: 0.25, ease: "expo.in" }, ${f(t1 - 0.25)});`); som("whoosh-short", t1 - 0.3, 0.05);
}

// ============ 2 — visor de câmera sobre ela: "É conseguir, através do meu olhar, perceber, enquadrar e registrar" ============
{
  const t0 = T("É conseguir") - 0.04, tr = T("registrar", 8), t1 = tr + 0.5;
  palavraGigante("g2", T("olhar") - 0.06, T("perceber") + 0.1, "olhar", "top:520px");
  cheia("hud", t0, t1, `<div class="hud"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>
      <div class="foco" id="foco"></div><div class="hudt e">f/1.8 · 1/250 · ISO 400</div><div class="hudt d">●  AF</div>
      <div class="hudw" id="hp">PERCEBER</div><div class="hudw" id="he">ENQUADRAR</div><div class="hudw" id="hr">REGISTRAR</div></div>`, 30);
  tw(`tl.fromTo("#hud .hud", { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" }, ${f(t0)});`); som("click-soft", t0, 0.06);
  // foco "procurando" e travando no rosto
  tw(`tl.fromTo("#foco", { x: -220, y: 260, width: 520, height: 520 }, { x: 60, y: -40, width: 380, height: 380, duration: 0.6, ease: "power2.inOut" }, ${f(t0 + 0.1)});`);
  tw(`tl.to("#foco", { x: 0, y: 0, width: 300, height: 300, borderColor: "${OURO}", duration: 0.18, ease: "back.out(3)" }, ${f(T("enquadrar") - 0.05)});`); som("ping", T("enquadrar") - 0.05, 0.04);
  [["#hp", "perceber"], ["#he", "enquadrar"], ["#hr", "registrar"]].forEach(([s, w], k) => {
    const a = k === 2 ? tr : T(w); tw(`tl.fromTo("${s}", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.15 }, ${f(a - 0.05)});`); som("key-press", a - 0.05, 0.08);
    if (k < 2) tw(`tl.to("${s}", { opacity: 0, duration: 0.1 }, ${f((k === 0 ? T("enquadrar") : tr) - 0.1)});`);
  });
  SEM_LEG.push([T("perceber") - 0.1, tr + 0.45]);
  // "registrar": obturador + a imagem dela congela e vira uma foto impressa que sai voando
  flash(tr + 0.05, "#ffffff", 1); som("click", tr, 0.12);
  cheia("cong", tr + 0.05, tr + 1.0, `<div class="print" id="cgp"><img src="assets/congela.jpg"></div>`, 31);
  tw(`tl.fromTo("#cgp", { scale: 1, rotation: 0, x: 0, y: 0 }, { scale: 0.42, rotation: -9, x: 230, y: -380, duration: 0.45, ease: "power3.inOut" }, ${f(tr + 0.08)});`);
  tw(`tl.to("#cgp", { x: 1100, rotation: 20, duration: 0.35, ease: "power3.in" }, ${f(tr + 0.6)});`); som("whoosh-short", tr + 0.55, 0.05);
}

// ============ 3 — mergulho na foto: "pelo menos um pouco daquele sentimento que aquela pessoa está sentindo" ============
{
  const t0 = T("pelo menos") - 0.05, t1 = T("Observando") - 0.05;
  cheia("s3", t0, t1, `<div class="fcheia"><img src="assets/fotos/fest2.jpg" style="object-position:40% 50%"></div><i class="kescuro" style="opacity:0.35"></i>`, 10);
  tw(`tl.fromTo("#s3 .fcheia img", { scale: 2.2, x: 120, filter: "blur(14px)" }, { scale: 1.25, x: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, ${f(t0)});`);
  tw(`tl.to("#s3 .fcheia img", { scale: 1.05, x: -60, duration: ${f(t1 - t0 - 0.7)}, ease: "none" }, ${f(t0 + 0.7)});`);
  vaza(t0 - 0.2, 1.0); vaza(t1 - 0.4, 0.8);
  tw(`tl.to("#s3", { opacity: 0, duration: 0.25 }, ${f(t1 - 0.25)});`);
}

// ============ 4 — carrossel 3D de fotos girando em volta dela: "…ao meu redor e transformando tudo aquilo em memória" ============
{
  const t0 = T("Observando") + 0.4, tm = T("memória"), t1 = T("O meu trabalho") - 0.05;
  const F = ["poente1", "luzes", "maos2", "palco1", "floripa2", "multidao"];
  tras("car", t0, tm + 0.1, `<i class="escurece"></i><div class="cena3d"><div class="anel" id="anel">${F.map((n, k) => `<div class="card3d" style="transform: rotateY(${k * 60}deg) translateZ(520px)"><img src="assets/fotos/${n}.jpg"></div>`).join("")}</div></div>`);
  tw(`tl.fromTo("#car .escurece", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f(t0)});`);
  tw(`tl.fromTo("#anel", { rotationY: 0, scale: 0.3, opacity: 0 }, { rotationY: -200, scale: 1, opacity: 1, duration: ${f(tm - t0)}, ease: "power1.inOut" }, ${f(t0)});`);
  som("riser", t0, 0.03); som("whoosh", T("ao meu redor") - 0.1, 0.04);
  flash(tm - 0.04); som("click", tm - 0.05, 0.1);
  palavraGigante("g4", tm - 0.02, t1 + 0.05, "memória", "", "bate");
}

// ============ 5 — fundo trocado: "O meu trabalho como fotógrafa dentro desses festivais" (ela aparece no festival) ============
{
  const t0 = T("dentro desses") - 0.05, t1 = T("é algo") - 0.02;
  tras("fes", t0, t1, `<div class="fcheia"><img src="assets/fotos/fest3.jpg"></div><i class="escurece" style="background:rgba(10,6,4,0.25)"></i>`);
  tw(`tl.fromTo("#fes", { clipPath: "circle(0% at 50% 40%)" }, { clipPath: "circle(120% at 50% 40%)", duration: 0.5, ease: "power3.inOut" }, ${f(t0)});`);
  tw(`tl.fromTo("#fes img", { scale: 1.3 }, { scale: 1.05, duration: ${f(t1 - t0)}, ease: "none" }, ${f(t0)});`);
  tw(`tl.to("#fes", { opacity: 0, duration: 0.2 }, ${f(t1 - 0.2)});`);
  som("whoosh-cinematic", t0 - 0.15, 0.04); som("impact-bass-2", T("festivais") - 0.02, 0.05); vaza(t1 - 0.3, 0.8);
}

// ============ 6 — "+12 anos" contando atrás dela; depois cortes rápidos de fotos no ritmo ("festas e festivais") ============
{
  const t0 = T("Por ser") - 0.05, t12 = T("12"), tf = T("festas e") - 0.05, t1 = T("São espaços") - 0.05;
  tras("doze", t0, T("relação") + 0.2, `<i class="escurece"></i><div class="gig num"><span class="mais">+</span><span class="cont">${Array.from({ length: 13 }, (_, k) => `<b id="n${k}">${k}</b>`).join("")}</span></div><div class="gsub">anos de pista</div>`);
  tw(`tl.fromTo("#doze .escurece", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${f(t0)});`);
  tw(`tl.fromTo("#doze .gig", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }, ${f(t0)});`);
  for (let k = 0; k <= 12; k++) { const a = t0 + 0.05 + (t12 - t0) * k / 12; tw(`tl.set("#n${k}", { opacity: 1 }, ${f(a)});`); if (k < 12) tw(`tl.set("#n${k}", { opacity: 0 }, ${f(t0 + 0.05 + (t12 - t0) * (k + 1) / 12)});`); }
  som("typing", t0, 0.05); som("impact-bass-1", t12, 0.06);
  tw(`tl.fromTo("#doze .gsub", { opacity: 0, letterSpacing: "0.9em" }, { opacity: 1, letterSpacing: "0.35em", duration: 0.4 }, ${f(t12 + 0.1)});`);
  tw(`tl.to("#doze", { opacity: 0, duration: 0.2 }, ${f(T("relação"))});`);
  // cortes rápidos (cada foto ~0,3 s) com clique
  const R = ["fest4", "fest5", "fest1"]; const passo = (t1 - tf) / R.length;
  R.forEach((n, k) => { const a = tf + k * passo; cheia(`rc${k}`, a, a + passo, `<div class="fcheia"><img src="assets/fotos/${n}.jpg"></div>`, 12);
    tw(`tl.fromTo("#rc${k} img", { scale: 1.25 }, { scale: 1.08, duration: ${f(passo)}, ease: "none" }, ${f(a)});`); som("click", a, 0.09); });
  flash(tf, "#ffffff", 0.6); SEM_LEG.push([tf + 0.05, t1]);
}

// ============ 7 — "São espaços onde muitas pessoas encontram a liberdade… sair da rotina, desestressar e encontrar pessoas" ============
{
  const t0 = T("a liberdade") - 0.05, ts = T("sair"), td = T("desestressar"), te = T("encontrar") - 0.05, t1 = T("e viver") - 0.05;
  cheia("lib", t0, ts - 0.05, `<div class="fcheia"><img src="assets/fotos/cores.jpg"></div><i class="kescuro" style="opacity:0.45"></i><div class="kw it" style="top:780px;font-size:170px">liberdade</div>`, 10);
  tw(`tl.fromTo("#lib img", { scale: 1.4, rotation: 3 }, { scale: 1.1, rotation: 0, duration: ${f(ts - t0)}, ease: "power2.out" }, ${f(t0)});`);
  tw(`tl.fromTo("#lib .kw", { opacity: 0, scale: 2.2, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, ${f(T("liberdade") - 0.05)});`);
  som("impact-bass-2", T("liberdade"), 0.05); vaza(t0 - 0.15, 0.8); SEM_LEG.push([T("liberdade") - 0.1, ts - 0.05]);
  // tela dividida em 3 faixas que entram uma a uma
  const S = [["maos1", "sair da rotina", ts], ["grama", "desestressar", td], ["risos1", "encontrar pessoas", te]];
  cheia("div3", ts - 0.05, t1, S.map(([n, txt], k) => `<div class="faixa" id="fx${k}" style="top:${k * 640}px"><img src="assets/fotos/${n}.jpg"><span>${txt}</span></div>`).join(""), 10);
  S.forEach(([n, txt, a], k) => { tw(`tl.fromTo("#fx${k}", { xPercent: ${k % 2 ? 100 : -100} }, { xPercent: 0, duration: 0.3, ease: "expo.out" }, ${f(a - 0.08)});`);
    tw(`tl.fromTo("#fx${k} img", { scale: 1.3 }, { scale: 1.05, duration: ${f(t1 - a)}, ease: "none" }, ${f(a - 0.08)});`);
    tw(`tl.fromTo("#fx${k} span", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25 }, ${f(a + 0.05)});`); som("whoosh-short", a - 0.12, 0.05); });
  SEM_LEG.push([ts - 0.05, t1]);
  tw(`tl.to("#fx0", { xPercent: -100, duration: 0.25, ease: "expo.in" }, ${f(t1 - 0.25)});`); tw(`tl.to("#fx1", { xPercent: 100, duration: 0.25, ease: "expo.in" }, ${f(t1 - 0.22)});`); tw(`tl.to("#fx2", { xPercent: -100, duration: 0.25, ease: "expo.in" }, ${f(t1 - 0.19)});`);
}

// ============ 8 — "e viver experiências que é até difícil colocar em palavras" (laser) + PALAVRAS se desmanchando ============
{
  const t0 = T("e viver") - 0.05, tp = T("difícil") - 0.1, t1 = T("E é isso") - 0.05;
  cheia("exp", t0, tp + 0.05, `<div class="fcheia"><img src="assets/fotos/laser.jpg"></div>`, 10);
  tw(`tl.fromTo("#exp img", { scale: 1.6, filter: "hue-rotate(-40deg) brightness(0.6)" }, { scale: 1.1, filter: "hue-rotate(0deg) brightness(1)", duration: ${f(tp - t0)}, ease: "power2.out" }, ${f(t0)});`);
  som("riser", t0, 0.04); flash(tp, "#ffffff", 0.5);
  const L = "PALAVRAS".split("");
  tras("pal", tp, t1, `<i class="escurece"></i><div class="gig letras">${L.map((c, k) => `<b id="lt${k}">${c}</b>`).join("")}</div>`);
  tw(`tl.fromTo("#pal .escurece", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(tp)});`);
  tw(`tl.fromTo("#pal .letras b", { opacity: 0, y: -80 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: "back.out(2)" }, ${f(tp + 0.05)});`); som("typing", tp, 0.05);
  L.forEach((c, k) => tw(`tl.to("#lt${k}", { y: ${300 + rnd() * 500}, x: ${(rnd() - 0.5) * 300}, rotation: ${(rnd() - 0.5) * 140}, opacity: 0, duration: 0.6, ease: "power2.in" }, ${f(T("palavras") + 0.15 + k * 0.03)});`));
  som("whoosh", T("palavras") + 0.1, 0.04);
}

// ============ 9 — "E é isso que me move" atrás dela; "espontaneidade" com queima de filme; fotos girando nos "encontros" ============
{
  palavraGigante("g9", T("me move") - 0.05, T("Poder") + 0.2, "me move", "font-size:300px");
  const tq = T("espontaneidade") - 0.1;
  cheia("queima", tq, tq + 0.7, `<i class="burn"></i>`, 39);
  tw(`tl.fromTo("#queima .burn", { opacity: 0, scale: 0.6, x: 300 }, { opacity: 1, scale: 1.4, x: -100, duration: 0.35, ease: "power2.in" }, ${f(tq)});`);
  tw(`tl.to("#queima .burn", { opacity: 0, duration: 0.35 }, ${f(tq + 0.35)});`); som("whoosh-cinematic", tq - 0.1, 0.04);
  const t0 = T("encontros") - 0.1, t1 = T("E nos dias") - 0.05;
  tras("enc", t0, t1, `<i class="escurece"></i>` + ["tendas", "maos3", "fest4c"].slice(0, 2).map((n, k) => `<div class="polar" id="pl${k}" style="${k ? "right:40px;top:280px" : "left:40px;top:420px"}"><img src="assets/fotos/${n}.jpg"></div>`).join(""));
  tw(`tl.fromTo("#enc .escurece", { opacity: 0 }, { opacity: 0.7, duration: 0.3 }, ${f(t0)});`);
  [0, 1].forEach((k) => { tw(`tl.fromTo("#pl${k}", { x: ${k ? 600 : -600}, rotation: ${k ? 40 : -40}, opacity: 0 }, { x: 0, rotation: ${k ? 8 : -8}, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }, ${f(t0 + k * 0.35)});`);
    tw(`tl.to("#pl${k}", { y: ${k ? -40 : 40}, rotation: ${k ? 3 : -3}, duration: ${f(t1 - t0 - 0.8)}, ease: "sine.inOut" }, ${f(t0 + 0.5 + k * 0.35)});`); som("pop", t0 + 0.2 + k * 0.35, 0.06); });
}

// ============ 10 — "5 e 6 de dezembro… Forest Shankara… na Ilha da Magia… através das minhas lentes" ============
{
  const t0 = T("5") - 0.08, tfo = T("Forest") - 0.05, ti = T("Ilha") - 0.08, tl_ = T("através das") - 0.05, t1 = T("Ainda mais") - 0.05;
  tras("dat", t0, tfo + 0.05, `<i class="escurece"></i><div class="gig" style="top:300px;font-size:300px">5•6</div><div class="gsub" style="top:700px">dezembro</div>`);
  tw(`tl.fromTo("#dat .escurece", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(t0)});`);
  tw(`tl.fromTo("#dat .gig", { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "expo.out" }, ${f(t0)});`);
  tw(`tl.fromTo("#dat .gsub", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, ${f(T("dezembro") - 0.05)});`); som("impact-bass-2", t0 + 0.1, 0.06);
  cheia("fs", tfo, ti, `<i class="kescuro" style="opacity:0.92;background:#120c08"></i><div class="kw cx" id="fsa" style="top:700px;font-size:120px;letter-spacing:0.12em">FOREST</div><div class="kw cx" id="fsb" style="top:860px;font-size:120px;letter-spacing:0.12em">SHANKARA</div>`, 10);
  tw(`tl.fromTo("#fsa", { x: -1100 }, { x: 0, duration: 0.25, ease: "expo.out" }, ${f(tfo)});`); tw(`tl.fromTo("#fsb", { x: 1100 }, { x: 0, duration: 0.25, ease: "expo.out" }, ${f(T("Shankara") - 0.05)});`);
  som("whoosh-short", tfo - 0.05, 0.06); som("whoosh-short", T("Shankara") - 0.1, 0.06); SEM_LEG.push([tfo, ti]);
  // Ilha da Magia: a praia vira o fundo atrás dela
  tras("ilha", ti, tl_ + 0.1, `<div class="fcheia"><img src="assets/fotos/floripa1.jpg"></div><div class="gsub" style="top:260px;color:#fff;font-family:'Playfair Display';font-style:italic;letter-spacing:0;font-size:110px;text-transform:none">Ilha da Magia</div>`);
  tw(`tl.fromTo("#ilha", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "expo.out" }, ${f(ti)});`);
  tw(`tl.fromTo("#ilha img", { scale: 1.3, y: 60 }, { scale: 1.05, y: 0, duration: ${f(tl_ - ti)}, ease: "none" }, ${f(ti)});`);
  tw(`tl.fromTo("#ilha .gsub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35 }, ${f(ti + 0.2)});`); som("whoosh", ti - 0.1, 0.05);
  // lentes: anel de lente que gira e foca (sem tela preta)
  cheia("lente", tl_, t1, `<div class="lente" id="len"><i></i><i></i><i></i></div>`, 30);
  tw(`tl.fromTo("#len", { scale: 3, rotation: -90, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: "expo.out" }, ${f(tl_)});`);
  tw(`tl.to("#len", { rotation: 30, duration: ${f(t1 - tl_ - 0.7)}, ease: "none" }, ${f(tl_ + 0.45)});`);
  tw(`tl.to("#len", { scale: 4, opacity: 0, duration: 0.25, ease: "power2.in" }, ${f(t1 - 0.25)});`);
  som("click-soft", tl_, 0.06); som("click", T("lentes") + 0.05, 0.1); flash(T("lentes") + 0.05, "#ffffff", 0.5);
}

// ============ 11 — aniversário: "6" gigante atrás dela e brilhos dourados caindo ============
{
  const t0 = T("aniversário") - 0.08, t1 = T("Então") - 0.05;
  tras("niver", t0, t1, `<i class="escurece"></i><div class="gig" style="top:200px;font-size:640px;color:${OURO}">6</div><div class="gsub" style="top:930px">de dezembro</div>` +
    Array.from({ length: 40 }, (_, k) => `<i class="brilho" id="br${k}" style="left:${Math.round(rnd() * 1060)}px;top:-40px;width:${6 + Math.round(rnd() * 10)}px;height:${6 + Math.round(rnd() * 10)}px"></i>`).join(""));
  tw(`tl.fromTo("#niver .escurece", { opacity: 0 }, { opacity: 0.85, duration: 0.3 }, ${f(t0)});`);
  tw(`tl.fromTo("#niver .gig", { scale: 0.4, opacity: 0, rotation: -15 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.8)" }, ${f(t0)});`);
  tw(`tl.fromTo("#niver .gsub", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f(T("dezembro", 54) - 0.05)});`);
  for (let k = 0; k < 40; k++) tw(`tl.fromTo("#br${k}", { y: 0, rotation: 0, opacity: 1 }, { y: ${1500 + rnd() * 600}, rotation: ${rnd() * 720}, x: ${(rnd() - 0.5) * 200}, opacity: 0.8, duration: ${f(1.8 + rnd() * 1.5)}, ease: "none" }, ${f(t0 + rnd() * 1.5)});`);
  som("sparkle", t0, 0.07); som("chime", T("6", 54) - 0.05, 0.04);
  tw(`tl.to("#niver", { opacity: 0, duration: 0.25 }, ${f(t1 - 0.25)});`);
}

// ============ 12 — final: "vem com a gente" atrás dela, e acaba ============
{
  const t0 = T("vem com") - 0.06;
  tras("vem", t0, DUR, `<i class="escurece"></i><div class="gig" style="top:330px;font-size:230px;line-height:0.95">vem<br>com a<br>gente</div>`);
  tw(`tl.fromTo("#vem .escurece", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(t0)});`);
  tw(`tl.fromTo("#vem .gig", { y: 300, opacity: 0, skewY: 8 }, { y: 0, opacity: 1, skewY: 0, duration: 0.4, ease: "expo.out" }, ${f(t0)});`);
  som("impact-bass-1", t0 + 0.05, 0.06); som("whoosh", t0 - 0.12, 0.05);
}
cheia("fim", DUR - 0.35, DUR, `<i class="pre"></i>`, 45);
tw(`tl.fromTo("#fim .pre", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.in" }, ${f(DUR - 0.35)});`);

// ---------- câmera dela: soco no início, troca de enquadramento a cada corte interno ----------
tw(`tl.set("#camera", { scale: 1.25 }, 0);`); tw(`tl.to("#camera", { scale: 1.02, duration: 0.45, ease: "power3.out" }, 0);`);
MAPA.forEach((m, i) => { if (i === 0) return; tw(`tl.set("#camera", { scale: ${i % 2 ? 1.1 : 1.0} }, ${f(m.ini)});`); });
// recorte dela só aparece quando há algo atrás dela
tw(`tl.set("#recorte", { opacity: 0 }, 0);`);
RECORTE_ON.forEach(([a, b]) => { tw(`tl.set("#recorte", { opacity: 1 }, ${f(a)});`); tw(`tl.set("#recorte", { opacity: 0 }, ${f(b)});`); });
// granulado e luz quente
for (let t = 0, k = 0; t < DUR; t += 1 / 12, k++) tw(`tl.set("#grao", { backgroundImage: "url(assets/tex/grao${(k * 5) % 8}.png)", backgroundPosition: "${Math.round(rnd() * 300)}px ${Math.round(rnd() * 300)}px" }, ${f(t)});`);

// ---------- legenda (estilo dela) ----------
const CHAVES = new Set(["botao", "momento", "olhar", "sentimento", "memoria", "fotografa", "festivais", "sensivel", "anos", "liberdade", "rotina", "pessoas", "experiencias", "palavras", "move", "espontaneidade", "naturalidade", "encontros", "amigos", "dezembro", "magia", "lentes", "aniversario", "especial", "voces", "gente", "sentindo", "redor"]);
const ehChave = (p) => CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => { const q = PAL[i + 1]; g.push(p); if (!q || /[.,!?;:]$/.test(p.texto) || q.ini - p.fim >= 0.3 || g.length >= 3 || (ehChave(p) && g.length >= 2)) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
let lh = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0, gr[0].ini - 0.06), prox = grupos[i + 1];
  const b = prox ? Math.min(prox[0].ini - 0.06, gr.at(-1).fim + 0.5) : DUR - 0.3;
  if (b - a < 0.1) return;
  const meio = (a + b) / 2; if (SEM_LEG.some(([s0, s1]) => meio > s0 && meio < s1)) return;
  const linhas = gr.map((p) => `<span class="${ehChave(p) ? "ch" : "nm"}">${esc(p.texto.replace(/[.,!?;:]+$/, ""))}</span>`).join(" ");
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(b - a)}" data-track-index="50" style="z-index:50"><div class="cx">${linhas}</div></div>\n`;
  tw(`tl.fromTo("#lg${i} .cx", { opacity: 0, y: 14, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" }, ${f(a)});`);
  gr.forEach((p, k) => { if (ehChave(p)) tw(`tl.fromTo("#lg${i} .cx span:nth-child(${k + 1})", { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(2)", immediateRender: false }, ${f(Math.max(a, p.ini - 0.04))});`); });
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,600;1,800&family=Poppins:wght@500;600;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">`;
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
      #fundo, #recorte video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #atras { position: absolute; inset: 0; z-index: 2; }
      #recorte { position: absolute; inset: 0; z-index: 3; }
      .cena { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      .escurece { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, rgba(30,18,10,0.55), rgba(8,5,3,0.92)); }
      .gig { position: absolute; left: -40px; right: -40px; top: 380px; text-align: center; font-family: "Playfair Display"; font-style: italic; font-weight: 800; font-size: 270px; line-height: 1; color: ${CR}; letter-spacing: -0.02em; text-shadow: 0 20px 60px rgba(0,0,0,0.5); }
      .gig.num { font-size: 420px; top: 260px; } .gig.num .mais { font-size: 0.6em; vertical-align: 0.35em; margin-right: 0.05em; }
      .gig .cont { position: relative; display: inline-block; width: 1.05em; height: 1em; } .gig .cont b { position: absolute; left: 0; right: 0; font-weight: 800; opacity: 0; }
      .gig.letras b { display: inline-block; font-weight: 800; }
      .gsub { position: absolute; left: 0; right: 0; top: 760px; text-align: center; font-family: "Poppins"; font-weight: 600; font-size: 54px; letter-spacing: 0.35em; text-transform: uppercase; color: ${CR}; }
      .kfundo, .fcheia img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .fcheia { position: absolute; inset: 0; overflow: hidden; }
      .kescuro { position: absolute; inset: 0; background: rgba(12,8,5,0.72); }
      .kw { position: absolute; left: 0; right: 0; top: 820px; text-align: center; color: ${CR}; text-shadow: 0 10px 40px rgba(0,0,0,0.6); }
      .kw.cx { font-family: "Poppins"; font-weight: 800; font-size: 130px; letter-spacing: -0.01em; text-transform: uppercase; }
      .kw.it { font-family: "Playfair Display"; font-style: italic; font-weight: 800; font-size: 150px; }
      .hud { position: absolute; inset: 70px 50px 380px; }
      .hud > i { position: absolute; width: 110px; height: 110px; border: 0 solid rgba(243,230,200,0.9); }
      .hud .c1 { left: 0; top: 0; border-left-width: 5px; border-top-width: 5px; } .hud .c2 { right: 0; top: 0; border-right-width: 5px; border-top-width: 5px; }
      .hud .c3 { left: 0; bottom: 0; border-left-width: 5px; border-bottom-width: 5px; } .hud .c4 { right: 0; bottom: 0; border-right-width: 5px; border-bottom-width: 5px; }
      .foco { position: absolute; left: 50%; top: 23%; margin-left: -150px; margin-top: -150px; width: 300px; height: 300px; border: 4px solid rgba(243,230,200,0.85); border-radius: 6px; }
      .hudt { position: absolute; top: 20px; font-family: "Space Mono"; font-size: 30px; color: ${CR}; } .hudt.e { left: 140px; } .hudt.d { right: 140px; color: ${VERM}; }
      .hudw { position: absolute; left: 0; right: 0; bottom: 40px; text-align: center; font-family: "Space Mono"; font-weight: 700; font-size: 64px; letter-spacing: 0.25em; color: ${CR}; opacity: 0; }
      .print { position: absolute; inset: 0; background: #F1E7D2; padding: 30px 30px 110px; box-shadow: 0 40px 80px rgba(0,0,0,0.6); transform-origin: 50% 50%; }
      .print img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cena3d { position: absolute; inset: 0; perspective: 1400px; perspective-origin: 50% 35%; }
      .anel { position: absolute; left: 50%; top: 32%; width: 0; height: 0; transform-style: preserve-3d; }
      .card3d { position: absolute; left: -210px; top: -150px; width: 420px; height: 300px; padding: 10px; background: #F1E7D2; box-shadow: 0 20px 40px rgba(0,0,0,0.5); backface-visibility: visible; }
      .card3d img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .faixa { position: absolute; left: 0; width: 1080px; height: 640px; overflow: hidden; border-bottom: 6px solid #120c08; }
      .faixa img { width: 100%; height: 100%; object-fit: cover; }
      .faixa span { position: absolute; left: 50px; bottom: 50px; font-family: "Playfair Display"; font-style: italic; font-weight: 800; font-size: 96px; color: ${CR}; text-shadow: 0 6px 30px rgba(0,0,0,0.8); }
      .polar { position: absolute; width: 420px; padding: 14px 14px 60px; background: #F1E7D2; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
      .polar img { width: 100%; height: 300px; object-fit: cover; display: block; }
      .lente { position: absolute; left: 50%; top: 32%; width: 0; height: 0; }
      .lente i { position: absolute; border-radius: 50%; border: 6px solid rgba(243,230,200,0.85); }
      .lente i:nth-child(1) { left: -330px; top: -330px; width: 660px; height: 660px; border-style: dashed; }
      .lente i:nth-child(2) { left: -280px; top: -280px; width: 560px; height: 560px; border-width: 3px; }
      .lente i:nth-child(3) { left: -230px; top: -230px; width: 460px; height: 460px; border-color: ${OURO}; }
      .brilho { position: absolute; background: ${OURO}; border-radius: 2px; box-shadow: 0 0 12px ${OURO}; }
      .burn { position: absolute; left: 10%; top: 10%; width: 900px; height: 1400px; border-radius: 50%; background: radial-gradient(ellipse, #fff3c0 0%, #ffb347 30%, #ff5a1f 55%, rgba(120,20,0,0) 72%); mix-blend-mode: screen; filter: blur(30px); }
      .vaz { position: absolute; border-radius: 50%; mix-blend-mode: screen; filter: blur(60px); }
      .vaz.v1 { left: -200px; top: 200px; width: 1100px; height: 900px; background: radial-gradient(circle, rgba(255,170,80,0.9), rgba(255,80,40,0) 70%); }
      .vaz.v2 { right: -300px; top: 900px; width: 900px; height: 900px; background: radial-gradient(circle, rgba(255,220,150,0.8), rgba(255,120,60,0) 70%); }
      .luz { position: absolute; inset: 0; opacity: 0; }
      .pre { position: absolute; inset: 0; background: #000; }
      #grao { position: absolute; inset: 0; z-index: 70; background-size: 540px 960px; background-repeat: repeat; mix-blend-mode: overlay; opacity: 0.4; pointer-events: none; }
      #vinheta { position: absolute; inset: 0; z-index: 71; background: radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,10,0,0.5) 100%); pointer-events: none; }
      .grupo { position: absolute; left: 70px; width: 940px; top: 1250px; text-align: center; }
      .cx { display: inline-block; line-height: 1.1; color: ${CR}; text-shadow: 0 2px 18px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.7); }
      .nm, .ch { display: inline-block; margin: 0 0.13em; } .ch { margin: 0 0.2em; transform-origin: 50% 70%; }
      .nm { font-family: "Poppins"; font-weight: 500; font-size: 56px; }
      .ch { font-family: "Playfair Display"; font-style: italic; font-weight: 600; font-size: 86px; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/fala.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
        <div id="atras">
${atras.join("\n")}
        </div>
        <div id="recorte"><video id="rec" class="clip" src="assets/ela-recorte.webm" muted data-start="0" data-duration="${DUR}" data-track-index="1"></video></div>
      </div>
${cenas.join("\n")}
${lh}      <div id="grao"></div><div id="vinheta"></div>
${audios}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`ok: ${cenas.length} cenas, ${atras.length} atrás dela, ${grupos.length} legendas, ${sons.length} efeitos, ${DUR}s`);
