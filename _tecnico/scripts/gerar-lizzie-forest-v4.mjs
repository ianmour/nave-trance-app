#!/usr/bin/env node
// Lizzie — "Forest Shankara" v4: estilo MODERNO (referência referencias/ref-lizzie-moderna-01.mp4) + criatividade da Lizzie.
// Letra fina minúscula, palavras grandes em degradê de pôr do sol (algumas atrás dela, pelo recorte), cartões "de vidro"
// em degradê como infográfico (botão de câmera, peças 1 2 3, gráfico de 12 anos, calendário de dezembro, localização,
// ingresso), rótulos pequenos de seção, cenas limpas de tela cheia, fotos como cartões arredondados. Imagem limpa
// (sem granulado), cor mais viva. Cada foto uma vez só. Sem música; muitos efeitos sonoros.
// Uso: node gerar-lizzie-forest-v4.mjs <projeto> <palavras.json> <duração da fala s> <mapa.json>
import fs from "node:fs";
import path from "node:path";

const [P, TJ, FALA_S, MAPA_J] = process.argv.slice(2);
const W = 1080, H = 1920;
const BR = "#F6E7D3", ESC = "#121212", VERDE = "#1E5B54", LARANJA = "#F0562D";
const GRAD = "linear-gradient(100deg, #F6E7D3 0%, #F7A877 45%, #F0562D 100%)";
const VIDRO = "linear-gradient(135deg, rgba(246,231,211,0.97) 0%, rgba(247,168,119,0.95) 60%, rgba(240,86,45,0.95) 100%)";
const FALA = +FALA_S, DUR = +(FALA + 0.45).toFixed(2);
const MAPA = JSON.parse(fs.readFileSync(MAPA_J, "utf8"));
const f = (n) => (+n).toFixed(3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const PAL = JSON.parse(fs.readFileSync(TJ, "utf8")).transcription.map((x) => ({ texto: x.text.trim(), ini: x.offsets.from / 1000, fim: x.offsets.to / 1000 }));
const T = (frag, desde = 0) => { const ws = frag.split(" ").map(nrm); for (let i = 0; i < PAL.length; i++) if (PAL[i].ini >= desde && ws.every((w, k) => nrm(PAL[i + k]?.texto || "") === w)) return PAL[i].ini; throw new Error("não achei: " + frag); };

let sem = 3; const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
const cenas = [], atras = [], js = [], sons = [], SEM_LEG = [], RECORTE_ON = [], DISSOLVE = [];
const tw = (s) => js.push("      " + s);
const SEM_SOM = new Set(["sparkle", "chime", "ping"]); // pareciam passarinho
const som = (nome, t, v) => { if (!SEM_SOM.has(nome)) sons.push([nome, Math.max(0, t), nome === "click" ? v * 0.7 : v]); };
const clip = (lista, id, t0, t1, html, z) => lista.push(`        <div id="${id}" class="clip cena" data-start="${f(t0)}" data-duration="${f(t1 - t0)}" data-track-index="${z}" style="z-index:${z}">${html}</div>`);
const frente = (id, t0, t1, html, z = 20) => clip(cenas, id, t0, t1, html, z);
const tras = (id, t0, t1, html) => { clip(atras, id, t0, t1, html, 2); RECORTE_ON.push([t0, t1]); };
const sai = (sel, t, d = 0.22) => tw(`tl.to("${sel}", { opacity: 0, y: -20, filter: "blur(8px)", duration: ${d}, ease: "power2.in" }, ${f(t - d)});`);
const entraSuave = (sel, t, d = 0.45, de = "y: 40") => tw(`tl.fromTo("${sel}", { opacity: 0, ${de}, filter: "blur(12px)" }, { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: ${d}, ease: "power3.out" }, ${f(t)});`);
const rotulo = (id, t0, t1, txt) => { frente(id, t0, t1, `<div class="rot">${txt}</div>`, 25); entraSuave(`#${id} .rot`, t0, 0.5, "y: -20"); sai(`#${id} .rot`, t1); som("click-soft", t0, 0.04); };
let nfl = 0;
const flash = (t, o = 0.7) => { const id = `fl${nfl++}`; frente(id, t, t + 0.3, `<i class="luz"></i>`, 40); tw(`tl.fromTo("#${id} .luz", { opacity: ${o} }, { opacity: 0, duration: 0.28, ease: "power2.out" }, ${f(t)});`); };
// palavra grande, fina, em degradê, atrás dela
const atrasDela = (id, t0, t1, txt, estilo = "") => {
  tras(id, t0, t1, `<i class="velo"></i><div class="gig grad" style="${estilo}">${txt}</div>`);
  tw(`tl.fromTo("#${id} .velo", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f(t0)});`);
  tw(`tl.fromTo("#${id} .gig", { opacity: 0, y: 60, filter: "blur(20px)", scale: 0.94 }, { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "power3.out" }, ${f(t0)});`);
  tw(`tl.to("#${id} .gig", { scale: 1.04, duration: ${f(Math.max(0.2, t1 - t0 - 0.8))}, ease: "none" }, ${f(t0 + 0.6)});`);
  tw(`tl.to("#${id}", { opacity: 0, duration: 0.25 }, ${f(t1 - 0.25)});`);
  som("whoosh", t0 - 0.12, 0.035);
};

// ============ 0 — gancho ============
rotulo("r0", 0.05, 2.6, "fotografia · festivais");
atrasDela("g1", T("momento") - 0.05, T("Fotografar") - 0.02, "momento");
{ // botão do obturador de vidro, pressionado no "clico"
  const t = T("clico") - 0.25;
  frente("bt", t, T("Fotografar") - 0.02, `<div class="obt"><i></i></div>`, 22);
  tw(`tl.fromTo("#bt .obt", { scale: 0.3, opacity: 0, y: 60 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "back.out(2)" }, ${f(t)});`);
  tw(`tl.to("#bt .obt i", { scale: 0.78, duration: 0.08, yoyo: true, repeat: 1 }, ${f(T("clico") - 0.02)});`);
  flash(T("clico") + 0.02, 0.8); som("click", T("clico") - 0.03, 0.11); som("pop", t, 0.05);
}

// ============ 1 — cena limpa (fundo claro): "Fotografar pra mim é muito mais do que clicar um botão e registrar um momento" ============
{
  const t0 = T("Fotografar") - 0.04, t1 = T("É conseguir") - 0.04; SEM_LEG.push([t0, t1]);
  frente("c1", t0, t1, `<div class="claro"></div>
    <div class="txt fino" id="c1a" style="top:560px">fotografar</div>
    <div class="txt fino pq" id="c1b" style="top:760px">é muito mais do que</div>
    <div class="chip" id="c1c" style="top:880px">clicar um botão</div>
    <div class="cartao foto" id="c1d" style="top:1030px;left:250px;width:580px;height:420px;transform:rotate(-3deg)"><img src="assets/fotos/cam1.jpg"></div>
    <div class="txt fino grad" id="c1e" style="top:1500px;font-size:110px">um momento</div>`, 10);
  tw(`tl.fromTo("#c1 .claro", { clipPath: "circle(0% at 50% 45%)" }, { clipPath: "circle(130% at 50% 45%)", duration: 0.45, ease: "power3.out" }, ${f(t0)});`); som("whoosh", t0 - 0.12, 0.05);
  entraSuave("#c1a", t0 + 0.05, 0.5);
  entraSuave("#c1b", T("é muito") - 0.05, 0.4); som("click-soft", T("é muito") - 0.05, 0.05);
  tw(`tl.fromTo("#c1c", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.2)" }, ${f(T("clicar") - 0.08)});`); som("pop", T("clicar") - 0.08, 0.07);
  tw(`tl.to("#c1c", { textDecoration: "line-through", opacity: 0.45, duration: 0.01 }, ${f(T("registrar") - 0.1)});`);
  tw(`tl.fromTo("#c1d", { y: 500, opacity: 0, rotation: 12 }, { y: 0, opacity: 1, rotation: -3, duration: 0.45, ease: "power3.out" }, ${f(T("registrar") - 0.1)});`); som("whoosh-short", T("registrar") - 0.15, 0.05);
  tw(`tl.fromTo("#c1d img", { filter: "brightness(2.4) saturate(0)" }, { filter: "brightness(1) saturate(1.1)", duration: 0.8, ease: "power2.out", immediateRender: false }, ${f(T("registrar"))});`);
  entraSuave("#c1e", T("momento", 3) - 0.1, 0.5); som("sparkle", T("momento", 3) - 0.1, 0.05);
  tw(`tl.to("#c1", { clipPath: "inset(0% 0% 100% 0%)", duration: 0.3, ease: "power2.inOut" }, ${f(t1 - 0.3)});`); som("whoosh-short", t1 - 0.32, 0.05);
}

// ============ 2 — "É conseguir, através do meu olhar, perceber, enquadrar e registrar": peças 1 2 3 de vidro + foco ============
{
  const t0 = T("É conseguir") - 0.04, tr = T("registrar", 8), t1 = tr + 0.5;
  rotulo("r2", t0, T("pelo menos"), "01 / o olhar");
  atrasDela("g2", T("olhar") - 0.06, T("perceber") + 0.2, "olhar");
  frente("foc", t0 + 0.2, tr, `<div class="foco"><i></i><i></i><i></i><i></i></div>`, 21);
  tw(`tl.fromTo("#foc .foco", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }, ${f(t0 + 0.2)});`);
  tw(`tl.to("#foc .foco", { scale: 0.86, duration: 0.18, ease: "back.out(3)" }, ${f(T("enquadrar") - 0.05)});`); som("ping", T("enquadrar") - 0.05, 0.04);
  const P3 = [["perceber", T("perceber")], ["enquadrar", T("enquadrar")], ["registrar", tr]];
  frente("p3", T("perceber") - 0.25, t1, `<div class="pecas">${P3.map(([w], k) => `<div class="peca" id="pc${k}"><b>${k + 1}</b><span>${w}</span></div>`).join("")}</div>`, 23);
  SEM_LEG.push([T("perceber") - 0.2, t1]);
  tw(`tl.fromTo("#p3 .peca", { y: 80, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, stagger: 0.06, ease: "back.out(2)" }, ${f(T("perceber") - 0.25)});`);
  P3.forEach(([w, a], k) => { tw(`tl.to("#pc${k}", { background: "${VIDRO.replace(/"/g, "'")}", scale: 1.12, duration: 0.18, ease: "back.out(3)" }, ${f(a - 0.04)});`);
    tw(`tl.to("#pc${k}", { scale: 1, duration: 0.2 }, ${f(a + 0.2)});`); som("key-press", a - 0.04, 0.08); });
  // "registrar": congela e vira um cartão de foto que sobe
  flash(tr + 0.04, 0.9); som("click", tr, 0.12);
  frente("cong", tr + 0.05, tr + 1.0, `<div class="cartao" id="cgp" style="inset:0;border-radius:0"><img src="assets/congela.jpg"></div>`, 31);
  tw(`tl.fromTo("#cgp", { scale: 1, borderRadius: 0, x: 0, y: 0, rotation: 0 }, { scale: 0.4, borderRadius: 60, x: 250, y: -420, rotation: -6, duration: 0.45, ease: "expo.inOut" }, ${f(tr + 0.08)});`);
  tw(`tl.to("#cgp", { x: 1200, rotation: 14, duration: 0.35, ease: "power3.in" }, ${f(tr + 0.6)});`); som("whoosh-short", tr + 0.55, 0.05);
}

// ============ 3 — tela cheia na foto: "pelo menos um pouco daquele sentimento que aquela pessoa está sentindo" ============
{
  const t0 = T("pelo menos") - 0.05, ts = T("sentimento"), t1 = T("Observando") - 0.05;
  frente("s3", t0, t1, `<div class="fcheia"><img src="assets/fotos/fest2.jpg" style="object-position:40% 50%"></div><i class="sombra"></i><div class="txt fino grad" id="s3t" style="top:1380px;font-size:130px">sentimento</div>`, 10);
  tw(`tl.fromTo("#s3", { clipPath: "inset(12% 10% 12% 10% round 60px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.55, ease: "power3.out" }, ${f(t0)});`);
  tw(`tl.fromTo("#s3 img", { scale: 1.5 }, { scale: 1.08, duration: ${f(t1 - t0)}, ease: "power1.out" }, ${f(t0)});`);
  entraSuave("#s3t", ts - 0.08, 0.6); SEM_LEG.push([ts - 0.1, t1]); som("whoosh-cinematic", t0 - 0.12, 0.04); som("sparkle", ts - 0.1, 0.04);
  tw(`tl.to("#s3", { clipPath: "inset(12% 10% 12% 10% round 60px)", opacity: 0, duration: 0.3, ease: "power2.inOut" }, ${f(t1 - 0.3)});`);
}

// ============ 4 — carrossel 3D de cartões em volta dela + "memória" atrás ============
{
  const t0 = T("Observando") + 0.3, tm = T("memória"), t1 = T("O meu trabalho") - 0.05;
  const F = ["poente1", "luzes", "maos2", "palco1", "floripa2", "multidao"];
  tras("car", t0, tm + 0.1, `<i class="velo"></i><div class="cena3d"><div class="anel" id="anel">${F.map((n, k) => `<div class="card3d" style="transform: rotateY(${k * 60}deg) translateZ(520px)"><img src="assets/fotos/${n}.jpg"></div>`).join("")}</div></div>`);
  tw(`tl.fromTo("#car .velo", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f(t0)});`);
  tw(`tl.fromTo("#anel", { rotationY: 0, scale: 0.3, opacity: 0 }, { rotationY: -200, scale: 1, opacity: 1, duration: ${f(tm - t0)}, ease: "power1.inOut" }, ${f(t0)});`);
  som("riser", t0, 0.03); flash(tm - 0.04, 0.5); som("click", tm - 0.05, 0.08);
  atrasDela("g4", tm - 0.02, t1 + 0.05, "memória");
}

// ============ 5 — "O meu trabalho como fotógrafa dentro desses festivais": rótulo + ela dentro da pista ============
{
  const t0 = T("dentro desses") - 0.05, t1 = T("é algo") - 0.02;
  rotulo("r5", T("O meu trabalho") - 0.05, T("Por ser") - 0.1, "02 / os festivais");
  tras("fes", t0, t1, `<div class="fcheia"><img src="assets/fotos/fest3.jpg"></div><i class="sombra" style="opacity:0.35"></i>`);
  tw(`tl.fromTo("#fes", { clipPath: "inset(30% 20% 50% 20% round 60px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.55, ease: "power3.out" }, ${f(t0)});`);
  tw(`tl.fromTo("#fes img", { scale: 1.3 }, { scale: 1.05, duration: ${f(t1 - t0)}, ease: "none" }, ${f(t0)});`);
  tw(`tl.to("#fes", { opacity: 0, duration: 0.2 }, ${f(t1 - 0.2)});`); som("whoosh-cinematic", t0 - 0.15, 0.04);
}

// ============ 6 — gráfico de vidro "12 anos de pista" + cortes rápidos de fotos ============
{
  const t0 = T("Por ser") - 0.05, t12 = T("12"), tf = T("festas e") - 0.05, t1 = T("São espaços") - 0.05, tsai = T("relação") + 0.3;
  const anos = Array.from({ length: 13 }, (_, k) => 2013 + k);
  frente("graf", t0, tsai, `<div class="vidro graf"><div class="gt"><span class="mini">anos de pista</span><span class="num">+<span class="cont">${anos.map((_, k) => `<b id="gn${k}">${k}</b>`).join("")}</span></span></div>
      <svg viewBox="0 0 800 260" class="linha"><path id="gl" d="M 10 240 C 120 230, 180 200, 260 190 S 400 150, 460 120 S 600 80, 660 50 S 760 20, 790 12" fill="none" stroke="${ESC}" stroke-width="7" stroke-linecap="round"/></svg>
      <div class="anos"><span>2013</span><span>2019</span><span>2025</span></div></div>`, 23);
  SEM_LEG.push([t0, tsai]);
  tw(`tl.fromTo("#graf .graf", { y: 300, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, ${f(t0)});`); som("pop", t0 + 0.05, 0.06);
  tw(`tl.fromTo("#gl", { strokeDasharray: 1100, strokeDashoffset: 1100 }, { strokeDashoffset: 0, duration: ${f(t12 - t0 + 0.2)}, ease: "power2.inOut" }, ${f(t0 + 0.15)});`);
  for (let k = 0; k <= 12; k++) { const a = t0 + 0.1 + (t12 - t0) * k / 12; tw(`tl.set("#gn${k}", { opacity: 1 }, ${f(a)});`); if (k < 12) tw(`tl.set("#gn${k}", { opacity: 0 }, ${f(t0 + 0.1 + (t12 - t0) * (k + 1) / 12)});`); }
  som("typing", t0 + 0.1, 0.04); som("impact-bass-1", t12, 0.05);
  tw(`tl.to("#graf .graf", { y: 300, opacity: 0, duration: 0.3, ease: "power2.inOut" }, ${f(tsai - 0.3)});`);
  const R = ["fest4", "fest5", "fest1"]; const passo = (t1 - tf) / R.length;
  R.forEach((n, k) => { const a = tf + k * passo; frente(`rc${k}`, a, a + passo + (k < 2 ? 0.22 : 0), `<div class="fcheia"><img src="assets/fotos/${n}.jpg"></div>`, 12);
    tw(`tl.fromTo("#rc${k} img", { scale: 1.2 }, { scale: 1.06, duration: ${f(passo + 0.25)}, ease: "none" }, ${f(a)});`); tw(`tl.fromTo("#rc${k}", { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power1.inOut" }, ${f(a)});`); som("whoosh-short", a - 0.05, 0.04); });
  flash(tf, 0.5); SEM_LEG.push([tf + 0.05, t1]);
}

// ============ 7 — "liberdade" + etiquetas de vidro + três cartões ============
{
  const t0 = T("a liberdade") - 0.05, ts = T("sair"), td = T("desestressar"), te = T("encontrar") - 0.05, t1 = T("e viver") - 0.05;
  rotulo("r7", T("São espaços") - 0.05, t0 + 0.2, "03 / os encontros");
  frente("lib", t0, ts - 0.05, `<div class="fcheia"><img src="assets/fotos/cores.jpg"></div><i class="sombra"></i><div class="txt fino grad" style="top:820px;font-size:170px">liberdade</div>`, 10);
  tw(`tl.fromTo("#lib", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(120% at 50% 50%)", duration: 0.5, ease: "power3.out" }, ${f(t0)});`);
  tw(`tl.fromTo("#lib img", { scale: 1.3 }, { scale: 1.08, duration: ${f(ts - t0)}, ease: "power2.out" }, ${f(t0)});`);
  entraSuave("#lib .txt", T("liberdade") - 0.05, 0.5); som("impact-bass-2", T("liberdade"), 0.04); SEM_LEG.push([T("liberdade") - 0.1, ts - 0.05]);
  const S = [["maos1", "− rotina", ts], ["grama", "+ leveza", td], ["risos1", "+ pessoas", te]];
  frente("c3", ts - 0.05, t1, `<div class="claro" style="background:${VERDE}"></div>` + S.map(([n, txt], k) => `<div class="cartao foto" id="cc${k}" style="left:${[60, 560, 300][k]}px;top:${[170, 560, 980][k]}px;width:460px;height:${[560, 560, 600][k]}px"><img src="assets/fotos/${n}.jpg"><div class="chip pq" style="position:absolute;left:24px;bottom:24px;top:auto">${txt}</div></div>`).join(""), 10);
  S.forEach(([n, txt, a], k) => { tw(`tl.fromTo("#cc${k}", { y: 700, opacity: 0, rotation: ${[-12, 10, -6][k]} }, { y: 0, opacity: 1, rotation: ${[-3, 3, -1][k]}, duration: 0.45, ease: "power3.out" }, ${f(a - 0.08)});`);
    tw(`tl.fromTo("#cc${k} img", { scale: 1.3 }, { scale: 1.05, duration: ${f(t1 - a)}, ease: "none" }, ${f(a - 0.08)});`); som("whoosh-short", a - 0.12, 0.05); som("pop", a + 0.15, 0.05); });
  SEM_LEG.push([ts - 0.05, t1]);
  tw(`tl.to("#c3 .cartao", { y: -900, opacity: 0, duration: 0.3, stagger: 0.04, ease: "power2.inOut" }, ${f(t1 - 0.34)});`);
}

// ============ 8 — "e viver experiências… difícil colocar em palavras" ============
{
  const t0 = T("e viver") - 0.05, tp = T("difícil") - 0.1, t1 = T("E é isso") - 0.05;
  frente("exp", t0, tp + 0.05, `<div class="fcheia"><img src="assets/fotos/laser.jpg"></div>`, 10);
  tw(`tl.fromTo("#exp img", { scale: 1.5 }, { scale: 1.1, duration: ${f(tp - t0)}, ease: "power2.out" }, ${f(t0)});`); som("riser", t0, 0.04);
  const L = "palavras".split("");
  tras("pal", tp, t1, `<i class="velo"></i><div class="gig grad">${L.map((c, k) => `<b id="lt${k}" style="display:inline-block">${c}</b>`).join("")}</div>`);
  tw(`tl.fromTo("#pal .velo", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${f(tp)});`);
  tw(`tl.fromTo("#pal .gig b", { opacity: 0, y: -60, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, stagger: 0.04, ease: "power3.out" }, ${f(tp + 0.05)});`); som("typing", tp, 0.05);
  L.forEach((c, k) => tw(`tl.to("#lt${k}", { y: ${300 + rnd() * 400}, x: ${(rnd() - 0.5) * 260}, rotation: ${(rnd() - 0.5) * 120}, opacity: 0, filter: "blur(6px)", duration: 0.6, ease: "power2.in" }, ${f(T("palavras") + 0.15 + k * 0.03)});`));
  som("whoosh", T("palavras") + 0.1, 0.04);
}

// ============ 9 — "me move" atrás dela; cartões flutuando nos "encontros" ============
{
  atrasDela("g9", T("me move") - 0.05, T("Poder") + 0.3, "me move");
  const t0 = T("encontros") - 0.1, t1 = T("E nos dias") - 0.05;
  frente("enc", t0, t1, ["tendas", "maos3"].map((n, k) => `<div class="cartao foto" id="pl${k}" style="${k ? "right:50px;top:170px" : "left:50px;top:330px"};width:330px;height:420px"><img src="assets/fotos/${n}.jpg"></div>`).join(""), 22);
  [0, 1].forEach((k) => { tw(`tl.fromTo("#pl${k}", { x: ${k ? 500 : -500}, rotation: ${k ? 25 : -25}, opacity: 0 }, { x: 0, rotation: ${k ? 6 : -6}, opacity: 1, duration: 0.5, ease: "power3.out" }, ${f(t0 + k * 0.3)});`);
    tw(`tl.to("#pl${k}", { y: ${k ? -30 : 30}, duration: ${f(t1 - t0 - 0.9)}, ease: "sine.inOut" }, ${f(t0 + 0.5 + k * 0.3)});`); som("pop", t0 + 0.15 + k * 0.3, 0.06); });
  tw(`tl.to("#enc .cartao", { opacity: 0, scale: 0.8, duration: 0.25 }, ${f(t1 - 0.25)});`);
}

// ============ 10 — calendário de dezembro (5 e 6) · Forest Shankara · cartão da Ilha da Magia · lentes ============
{
  const t0 = T("E nos dias") - 0.06, tfo = T("Forest") - 0.05, ti = T("Ilha") - 0.08, tl_ = T("através das") - 0.05, t1 = T("Ainda mais") - 0.05;
  rotulo("r10", t0, t1, "04 / 5 e 6 de dezembro");
  const dias = Array.from({ length: 14 }, (_, k) => k + 1);
  frente("cal", t0, tfo, `<div class="vidro cal"><div class="ct"><span>dezembro</span><span class="mini">2026</span></div><div class="dias">${["s", "t", "q", "q", "s", "s", "d"].map((d) => `<i class="sem">${d}</i>`).join("")}${dias.map((d) => `<i id="d${d}" class="${d === 5 || d === 6 ? "marca" : ""}">${d}</i>`).join("")}</div></div>`, 23);
  tw(`tl.fromTo("#cal .cal", { y: 400, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, ${f(t0)});`); som("whoosh-short", t0 - 0.1, 0.05);
  tw(`tl.fromTo("#d5", { background: "rgba(29,19,14,0)", color: "${ESC}" }, { background: "${VERDE}", color: "${BR}", scale: 1.2, duration: 0.2, ease: "back.out(3)" }, ${f(T("5") - 0.03)});`); som("ping", T("5") - 0.03, 0.05);
  tw(`tl.fromTo("#d6", { background: "rgba(29,19,14,0)", color: "${ESC}" }, { background: "${VERDE}", color: "${BR}", scale: 1.2, duration: 0.2, ease: "back.out(3)" }, ${f(T("6") - 0.03)});`); som("ping", T("6") - 0.03, 0.05);
  tw(`tl.to("#cal .cal", { y: 400, opacity: 0, duration: 0.25, ease: "power2.inOut" }, ${f(tfo - 0.25)});`);
  SEM_LEG.push([t0, tfo]);
  frente("fs", tfo, ti, `<div class="claro" style="background:${VERDE}"></div><div class="txt fino grad" id="fsa" style="top:760px;font-size:150px">forest</div><div class="txt fino grad" id="fsb" style="top:930px;font-size:150px">shankara</div>`, 10);
  tw(`tl.fromTo("#fs .claro", { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "power3.out" }, ${f(tfo)});`);
  entraSuave("#fsa", tfo + 0.02, 0.4, "x: -200"); entraSuave("#fsb", T("Shankara") - 0.05, 0.4, "x: 200");
  som("whoosh-short", tfo - 0.05, 0.06); som("whoosh-short", T("Shankara") - 0.1, 0.06); SEM_LEG.push([tfo, ti]);
  // cartão de localização (ela atrás de um cartão de vidro com a foto da praia)
  frente("loc", ti, tl_ + 0.1, `<div class="vidro loc"><div class="lfoto"><img src="assets/fotos/floripa1.jpg"></div><div class="linfo"><span class="pin"></span><div><b>Ilha da Magia</b><span class="mini">Florianópolis · SC</span></div></div></div>`, 23);
  tw(`tl.fromTo("#loc .loc", { y: 500, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, ${f(ti)});`);
  tw(`tl.fromTo("#loc img", { scale: 1.3 }, { scale: 1.05, duration: ${f(tl_ - ti)}, ease: "none" }, ${f(ti)});`);
  tw(`tl.fromTo("#loc .pin", { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "bounce.out" }, ${f(ti + 0.3)});`); som("pop", ti + 0.35, 0.07); som("whoosh", ti - 0.1, 0.05);
  tw(`tl.to("#loc .loc", { y: 500, opacity: 0, duration: 0.25, ease: "power2.inOut" }, ${f(tl_ + 0.1 - 0.25)});`); SEM_LEG.push([ti, tl_]);
  frente("lente", tl_, t1, `<div class="lente" id="len"><i></i><i></i><i></i></div>`, 30);
  tw(`tl.fromTo("#len", { scale: 3, rotation: -90, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, ${f(tl_)});`);
  tw(`tl.to("#len", { rotation: 30, duration: ${f(t1 - tl_ - 0.7)}, ease: "none" }, ${f(tl_ + 0.45)});`);
  tw(`tl.to("#len", { scale: 4, opacity: 0, duration: 0.25, ease: "power2.in" }, ${f(t1 - 0.25)});`);
  som("click-soft", tl_, 0.06); som("click", T("lentes") + 0.05, 0.1); flash(T("lentes") + 0.05, 0.45);
}

// ============ 11 — aniversário: "6" em degradê atrás dela + etiqueta de vidro + brilhos ============
{
  const t0 = T("aniversário") - 0.08, t1 = T("Então") - 0.05;
  tras("niver", t0, t1, `<i class="velo"></i><div class="gig grad" style="top:-20px;font-size:460px;font-weight:300">6</div>` +
    Array.from({ length: 34 }, (_, k) => `<i class="brilho" id="br${k}" style="left:${Math.round(rnd() * 1060)}px;top:-40px;width:${5 + Math.round(rnd() * 9)}px;height:${5 + Math.round(rnd() * 9)}px"></i>`).join(""));
  tw(`tl.fromTo("#niver .velo", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f(t0)});`);
  tw(`tl.fromTo("#niver .gig", { scale: 0.5, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }, ${f(t0)});`);
  for (let k = 0; k < 34; k++) tw(`tl.fromTo("#br${k}", { y: 0, rotation: 0, opacity: 1 }, { y: ${1500 + rnd() * 600}, rotation: ${rnd() * 720}, x: ${(rnd() - 0.5) * 200}, opacity: 0.8, duration: ${f(1.8 + rnd() * 1.5)}, ease: "none" }, ${f(t0 + rnd() * 1.4)});`);
  frente("chipn", T("dia 6") - 0.1, t1, `<div class="chip" style="top:560px">06.12 · meu aniversário</div>`, 24);
  tw(`tl.fromTo("#chipn .chip", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.2)" }, ${f(T("dia 6") - 0.1)});`);
  som("sparkle", t0, 0.07); som("chime", T("dia 6") - 0.05, 0.04); som("pop", T("dia 6") - 0.1, 0.05);
  tw(`tl.to("#niver, #chipn", { opacity: 0, duration: 0.25 }, ${f(t1 - 0.25)});`);
}

// ============ 12 — "vem com a gente": degradê atrás dela + ingresso de vidro, e acaba ============
{
  const t0 = T("vem com") - 0.06;
  atrasDela("vem", t0, DUR + 0.3, "vem com a gente", "font-size:128px;top:90px");
  frente("ing", t0 + 0.05, DUR, `<div class="vidro ing"><div><span class="mini">ingresso</span><b>forest shankara</b><span class="mini">5 e 6 de dezembro · ilha da magia</span></div><i class="pic"></i><div class="adm">vem</div></div>`, 24);
  tw(`tl.fromTo("#ing .ing", { y: 500, opacity: 0, rotation: 8 }, { y: 0, opacity: 1, rotation: -2, duration: 0.45, ease: "back.out(1.5)" }, ${f(t0 + 0.05)});`);
  som("impact-bass-1", t0 + 0.08, 0.05); som("pop", t0 + 0.2, 0.05); SEM_LEG.push([t0 + 0.05, DUR]);
}
frente("fim", DUR - 0.35, DUR, `<i class="pre"></i>`, 45);
tw(`tl.fromTo("#fim .pre", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.in" }, ${f(DUR - 0.35)});`);

// ---------- câmera dela ----------
tw(`tl.set("#camera", { scale: 1.22 }, 0);`); tw(`tl.to("#camera", { scale: 1.02, duration: 0.5, ease: "power3.out" }, 0);`);
tw(`tl.to("#camera", { scale: 1.1, duration: ${f(DUR - 0.5)}, ease: "sine.inOut" }, 0.5);`);
// cortes internos: a imagem anterior dissolve por cima (0,2 s) — o "pulo" do corte some
MAPA.forEach((m, i) => { if (i === 0) return; DISSOLVE.push(`          <img id="dv${i}" class="clip dv" src="assets/cortes/c${i}.jpg" data-start="${f(m.ini)}" data-duration="0.25" data-track-index="1">`); tw(`tl.fromTo("#dv${i}", { opacity: 1 }, { opacity: 0, duration: 0.22, ease: "power1.out" }, ${f(m.ini)});`); });
tw(`tl.set("#recorte", { opacity: 0 }, 0);`);
RECORTE_ON.forEach(([a, b]) => { tw(`tl.set("#recorte", { opacity: 1 }, ${f(a)});`); tw(`tl.set("#recorte", { opacity: 0 }, ${f(b)});`); });

// ---------- legenda moderna: fina, minúscula, 1-2 palavras; destaque em degradê ----------
const CHAVES = new Set(["botao", "momento", "olhar", "sentimento", "memoria", "fotografa", "festivais", "sensivel", "anos", "liberdade", "rotina", "pessoas", "experiencias", "palavras", "move", "espontaneidade", "naturalidade", "encontros", "amigos", "dezembro", "magia", "lentes", "aniversario", "especial", "voces", "gente", "sentindo", "redor"]);
const ehChave = (p) => CHAVES.has(nrm(p.texto));
const grupos = []; let g = [];
PAL.forEach((p, i) => { const q = PAL[i + 1]; g.push(p); if (!q || /[.,!?;:]$/.test(p.texto) || q.ini - p.fim >= 0.3 || g.length >= 3 || (ehChave(p) && g.length >= 2)) { grupos.push(g); g = []; } });
if (g.length) grupos.push(g);
let lh = "";
grupos.forEach((gr, i) => {
  const a = Math.max(0, gr[0].ini - 0.05), prox = grupos[i + 1];
  const b = prox ? Math.min(prox[0].ini - 0.05, gr.at(-1).fim + 0.5) : DUR - 0.3;
  if (b - a < 0.1) return;
  const meio = (a + b) / 2; if (SEM_LEG.some(([s0, s1]) => meio > s0 && meio < s1)) return;
  const linhas = gr.map((p) => `<span class="${ehChave(p) ? "ch" : "nm"}">${esc(p.texto.replace(/[.,!?;:]+$/, "").toLowerCase())}</span>`).join(" ");
  lh += `      <div id="lg${i}" class="clip grupo" data-start="${f(a)}" data-duration="${f(b - a)}" data-track-index="50" style="z-index:50"><div class="cx">${linhas}</div></div>\n`;
  tw(`tl.fromTo("#lg${i} .cx", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }, ${f(a)});`);
});

const FONTES = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;600;700&display=swap" rel="stylesheet">`;
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
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; font-family: "Manrope", sans-serif; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #camera { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 32%; z-index: 0; }
      #fundo, #recorte video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #fundo { filter: contrast(1.08) saturate(1.22) brightness(1.05); }
      #recorte video { filter: contrast(1.08) saturate(1.22) brightness(1.05); }
      #dissolve { position: absolute; inset: 0; z-index: 1; } .dv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: contrast(1.08) saturate(1.22) brightness(1.05); }
      #atras { position: absolute; inset: 0; z-index: 2; } #recorte { position: absolute; inset: 0; z-index: 3; }
      .cena { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
      .grad { background: ${GRAD}; -webkit-background-clip: text; background-clip: text; color: transparent !important; }
      .velo { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18,18,18,0.85) 0%, rgba(18,18,18,0.55) 45%, rgba(18,18,18,0.3) 100%); }
      .gig { position: absolute; left: -40px; right: -40px; top: 110px; text-align: center; font-weight: 300; font-size: 230px; line-height: 1; letter-spacing: -0.04em; color: ${BR}; }
      .claro { position: absolute; inset: 0; background: ${BR}; }
      .txt { position: absolute; left: 0; right: 0; text-align: center; color: ${ESC}; }
      .txt.fino { font-weight: 200; font-size: 150px; letter-spacing: -0.04em; line-height: 1; }
      .txt.fino.pq { font-weight: 300; font-size: 58px; letter-spacing: -0.01em; color: #6b5a50; }
      .chip { position: absolute; left: 50%; transform: translateX(-50%); padding: 22px 44px; border-radius: 999px; background: ${VIDRO}; color: ${ESC}; font-weight: 600; font-size: 52px; letter-spacing: -0.01em; white-space: nowrap; box-shadow: 0 20px 50px rgba(240,86,45,0.35), inset 0 1px 0 rgba(255,255,255,0.7); }
      .chip.pq { font-size: 38px; padding: 14px 28px; transform: none; left: auto; }
      .cartao { position: absolute; border-radius: 48px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.35); }
      .cartao img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .fcheia { position: absolute; inset: 0; overflow: hidden; } .fcheia img { width: 100%; height: 100%; object-fit: cover; }
      .sombra { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(10,6,4,0.75) 100%); }
      .rot { position: absolute; left: 0; right: 0; top: 120px; text-align: center; font-weight: 400; font-size: 32px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,248,238,0.9); text-shadow: 0 2px 14px rgba(0,0,0,0.5); }
      .obt { position: absolute; left: 50%; top: 1500px; width: 170px; height: 170px; margin-left: -85px; border-radius: 50%; border: 8px solid rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(0,0,0,0.35); }
      .obt i { width: 130px; height: 130px; border-radius: 50%; background: ${VIDRO}; }
      .foco { position: absolute; left: 50%; top: 600px; width: 440px; height: 440px; margin-left: -220px; margin-top: -220px; }
      .foco i { position: absolute; width: 70px; height: 70px; border: 0 solid rgba(255,248,238,0.95); }
      .foco i:nth-child(1) { left: 0; top: 0; border-left-width: 4px; border-top-width: 4px; border-top-left-radius: 22px; } .foco i:nth-child(2) { right: 0; top: 0; border-right-width: 4px; border-top-width: 4px; border-top-right-radius: 22px; }
      .foco i:nth-child(3) { left: 0; bottom: 0; border-left-width: 4px; border-bottom-width: 4px; border-bottom-left-radius: 22px; } .foco i:nth-child(4) { right: 0; bottom: 0; border-right-width: 4px; border-bottom-width: 4px; border-bottom-right-radius: 22px; }
      .pecas { position: absolute; left: 0; right: 0; top: 1230px; display: flex; justify-content: center; gap: 26px; }
      .peca { width: 290px; height: 250px; border-radius: 40px; background: rgba(255,248,238,0.92); color: ${ESC}; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
      .peca b { font-weight: 200; font-size: 110px; line-height: 1; } .peca span { font-weight: 600; font-size: 34px; margin-top: 10px; }
      .vidro { position: absolute; border-radius: 56px; background: ${VIDRO}; color: ${ESC}; box-shadow: 0 40px 90px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.6); }
      .mini { display: block; font-weight: 400; font-size: 30px; letter-spacing: 0.04em; opacity: 0.75; }
      .graf { left: 80px; right: 80px; top: 1180px; height: 560px; padding: 40px 50px; }
      .graf .gt { display: flex; justify-content: space-between; align-items: flex-start; } .graf .num { font-weight: 200; font-size: 150px; line-height: 0.9; letter-spacing: -0.04em; }
      .graf .cont { position: relative; display: inline-block; width: 1.25em; height: 1em; } .graf .cont b { position: absolute; left: 0; font-weight: 200; opacity: 0; }
      .graf .linha { position: absolute; left: 50px; right: 50px; bottom: 90px; width: calc(100% - 100px); height: 230px; }
      .graf .anos { position: absolute; left: 50px; right: 50px; bottom: 34px; display: flex; justify-content: space-between; font-size: 28px; opacity: 0.7; }
      .cal { left: 120px; right: 120px; top: 1130px; padding: 40px 46px; }
      .cal .ct { display: flex; justify-content: space-between; align-items: baseline; font-weight: 300; font-size: 76px; letter-spacing: -0.03em; margin-bottom: 20px; }
      .cal .dias { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; text-align: center; }
      .cal .dias i { font-style: normal; font-weight: 600; font-size: 40px; height: 84px; line-height: 84px; border-radius: 50%; }
      .cal .dias i.sem { font-weight: 400; font-size: 28px; opacity: 0.6; height: 40px; line-height: 40px; }
      .loc { left: 140px; right: 140px; top: 1050px; padding: 22px; }
      .loc .lfoto { height: 440px; border-radius: 38px; overflow: hidden; } .loc .lfoto img { width: 100%; height: 100%; object-fit: cover; }
      .loc .linfo { display: flex; align-items: center; gap: 22px; padding: 26px 16px 10px; } .loc b { display: block; font-weight: 600; font-size: 56px; letter-spacing: -0.02em; }
      .pin { width: 56px; height: 56px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${VERDE}; flex: none; position: relative; }
      .pin::after { content: ""; position: absolute; left: 18px; top: 18px; width: 20px; height: 20px; border-radius: 50%; background: ${BR}; }
      .ing { left: 110px; right: 110px; top: 1180px; height: 300px; display: flex; align-items: center; padding: 0 0 0 50px; overflow: hidden; }
      .ing > div:first-child { flex: 1; } .ing b { display: block; font-weight: 300; font-size: 80px; letter-spacing: -0.03em; line-height: 1.1; }
      .ing .pic { width: 0; height: 100%; border-left: 5px dashed rgba(29,19,14,0.4); } .ing .adm { width: 200px; text-align: center; font-weight: 200; font-size: 76px; }
      .cena3d { position: absolute; inset: 0; perspective: 1400px; perspective-origin: 50% 35%; }
      .anel { position: absolute; left: 50%; top: 32%; width: 0; height: 0; transform-style: preserve-3d; }
      .card3d { position: absolute; left: -200px; top: -150px; width: 400px; height: 300px; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.45); }
      .card3d img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .lente { position: absolute; left: 50%; top: 32%; width: 0; height: 0; }
      .lente i { position: absolute; border-radius: 50%; border: 3px solid rgba(255,248,238,0.9); }
      .lente i:nth-child(1) { left: -330px; top: -330px; width: 660px; height: 660px; border-style: dashed; border-width: 2px; }
      .lente i:nth-child(2) { left: -280px; top: -280px; width: 560px; height: 560px; }
      .lente i:nth-child(3) { left: -230px; top: -230px; width: 460px; height: 460px; border-color: ${LARANJA}; border-width: 5px; }
      .brilho { position: absolute; background: ${BR}; border-radius: 50%; box-shadow: 0 0 14px ${LARANJA}; }
      .luz { position: absolute; inset: 0; background: #fff8ee; opacity: 0; }
      .pre { position: absolute; inset: 0; background: #000; }
      #vinheta { position: absolute; inset: 0; z-index: 71; background: radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(10,5,0,0.35) 100%); pointer-events: none; }
      .grupo { position: absolute; left: 60px; width: 960px; top: 1290px; text-align: center; }
      .cx { display: inline-block; line-height: 1.1; color: ${BR}; text-shadow: 0 2px 22px rgba(0,0,0,0.55); }
      .nm, .ch { display: inline-block; margin: 0 0.12em; font-size: 74px; letter-spacing: -0.03em; }
      .nm { font-weight: 300; } .ch { font-weight: 700; color: ${LARANJA}; text-shadow: 0 2px 18px rgba(0,0,0,0.55); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="camera">
        <video id="fundo" class="clip" src="assets/fala.mp4" data-start="0" data-duration="${DUR}" data-track-index="0" data-has-audio="true"></video>
        <div id="dissolve">
${DISSOLVE.join("\n")}
        </div>
        <div id="atras">
${atras.join("\n")}
        </div>
        <div id="recorte"><video id="rec" class="clip" src="assets/ela-recorte.webm" muted data-start="0" data-duration="${DUR}" data-track-index="1"></video></div>
      </div>
${cenas.join("\n")}
${lh}
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
