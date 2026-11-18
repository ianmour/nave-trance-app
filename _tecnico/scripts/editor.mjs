#!/usr/bin/env node
// Editor de vídeo: transcreve, mede pausas, monta a lista de cortes e corta.
// Usa só FFmpeg/ffprobe e whisper-cli, tudo local. Nunca altera o vídeo original.
//
// Uso:
//   node _tecnico/scripts/editor.mjs analisar <video>          -> lista de cortes
//   node _tecnico/scripts/editor.mjs cortar <video> previa     -> previas/<nome>-previa.mp4
//   node _tecnico/scripts/editor.mjs cortar <video> final      -> final/<nome>-final.mp4
// Opções: --saida <pasta>  (troca a pasta de destino, usado nos testes)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MODELO = path.join(RAIZ, "_tecnico/modelos/ggml-small.bin");
const ESTILO = path.join(RAIZ, "estilo/meu-estilo.md");

import { spawnSync } from "node:child_process";
function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"], ...opts });
}
function require_spawn(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 });
}

function lerWav(arq) {
  const b = fs.readFileSync(arq);
  let p = 12, sr = 16000;
  while (p < b.length - 8) {
    const id = b.toString("ascii", p, p + 4), tam = b.readUInt32LE(p + 4);
    if (id === "fmt ") sr = b.readUInt32LE(p + 12);
    if (id === "data") return { sr, s: new Int16Array(b.buffer.slice(b.byteOffset + p + 8, b.byteOffset + p + 8 + (tam & ~1))) };
    p += 8 + tam + (tam & 1);
  }
  throw new Error("WAV sem dados");
}

function lerEstilo() {
  const txt = fs.readFileSync(ESTILO, "utf8");
  const get = (k, d) => {
    const m = txt.match(new RegExp(`^${k}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : d;
  };
  return {
    pausaMin: parseFloat(get("pausa_minima_s", "0.25")),
    respiro: parseFloat(get("respiro_s", "0.12")),
    silencioDb: parseFloat(get("silencio_db", "-35")),
    repeticao: get("repeticao", "manter_ultima"),
    vicios: get("vicios", "é, éé, ééé, ã, hum, ahn").split(",").map((s) => norm(s)).filter(Boolean),
    inicioRespiro: parseFloat(get("inicio_respiro_s", "0.03")),
    pausaPasso: parseFloat(get("pausa_passo_s", "0.5")),
    palavrasPasso: get("palavras_passo", "primeiro, segundo, passo, agora, depois").split(",").map((s) => norm(s)).filter(Boolean),
  };
}

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
function ehVicio(palavra, vicios) {
  const n = norm(palavra);
  if (!n) return false;
  if (vicios.includes(n)) return true;
  return /^(e+|a+|hu+m+|hm+|ah+n*|ha+|eh+|uh+m*)$/.test(n); // "eeee", "aaaa", "hummm"...
}
function similaridade(a, b) {
  a = norm(a); b = norm(b);
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}
const fmt = (s) => {
  const m = Math.floor(s / 60), r = s - m * 60;
  return `${m}:${r.toFixed(2).padStart(5, "0")}`;
};

function duracao(video) {
  return parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", video]));
}
function temVideo(video) {
  return run("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries", "stream=codec_type", "-of", "csv=p=0", video]).trim().length > 0;
}

function pastaTrabalho(video) {
  const nome = path.basename(video).replace(/\.[^.]+$/, "");
  const dir = path.join(RAIZ, "_tecnico/trabalho", nome);
  fs.mkdirSync(dir, { recursive: true });
  return { nome, dir };
}

function analisar(video) {
  const est = lerEstilo();
  const { nome, dir } = pastaTrabalho(video);
  const wav = path.join(dir, "audio16k.wav");
  const dur = duracao(video);

  // 1) Áudio para o whisper (16 kHz, mono) — cópia de trabalho, o original não é tocado
  let r = require_spawn("ffmpeg", ["-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav]);
  if (r.status !== 0) throw new Error("Não consegui extrair o áudio:\n" + r.stderr);

  // 2) Transcrição palavra por palavra
  const base = path.join(dir, "transcricao");
  r = require_spawn("whisper-cli", ["-m", MODELO, "-l", "pt", "-ml", "1", "-sow", "-oj", "-of", base, "-t", "8", "-f", wav]);
  if (r.status !== 0) throw new Error("O whisper falhou:\n" + r.stderr.slice(-2000));
  const tj = JSON.parse(fs.readFileSync(base + ".json", "utf8"));
  const palavras = tj.transcription
    .map((t) => ({ texto: t.text.trim(), ini: t.offsets.from / 1000, fim: t.offsets.to / 1000 }))
    .filter((p) => p.texto && !/^\[.*\]$/.test(p.texto) && !/^\(.*\)$/.test(p.texto));

  // 3) Pausas (silêncio) medidas pelo FFmpeg
  const log = require_spawn("ffmpeg", ["-hide_banner", "-nostats", "-i", wav, "-af", `silencedetect=noise=${est.silencioDb}dB:d=${est.pausaMin}`, "-f", "null", "-"]).stderr;
  const silencios = [];
  let ini = null;
  for (const linha of log.split("\n")) {
    let m = linha.match(/silence_start: ([\d.]+)/);
    if (m) ini = parseFloat(m[1]);
    m = linha.match(/silence_end: ([\d.]+)/);
    if (m && ini !== null) { silencios.push([Math.max(0, ini), parseFloat(m[1])]); ini = null; }
  }
  if (ini !== null) silencios.push([ini, dur]);

  // 4) Trechos com som = tudo que não é silêncio
  const falas = [];
  let t = 0;
  for (const [a, b] of silencios) { if (a - t > 0.03) falas.push({ ini: t, fim: a }); t = b; }
  if (dur - t > 0.03) falas.push({ ini: t, fim: dur });
  falas.forEach((f, i) => { f.id = i; f.palavras = []; });

  // Cada palavra vai para um trecho de fala. O whisper costuma marcar o começo de uma
  // palavra cedo demais, dentro da pausa anterior: nesse caso o começo é empurrado para
  // o fim da pausa (onde o FFmpeg mediu que o som volta).
  for (const p of palavras) {
    let s = p.ini;
    for (const [a, b] of silencios) if (s >= a - 0.02 && s < b) { s = b; break; }
    let alvo = falas.find((f) => s < f.fim - 0.01) || falas[falas.length - 1];
    if (alvo) { alvo.palavras.push(p); p.fala = alvo.id; }
  }

  // 5) Frases (pela pontuação do whisper)
  const frases = [];
  let atual = [];
  for (const p of palavras) {
    atual.push(p);
    if (/[.!?…]$/.test(p.texto)) { frases.push(atual); atual = []; }
  }
  if (atual.length) frases.push(atual);
  const frasesInfo = frases.map((ps, i) => ({
    id: i,
    texto: ps.map((p) => p.texto).join(" ").replace(/\s+([,.!?])/g, "$1"),
    falas: [...new Set(ps.map((p) => p.fala))],
  }));

  const removidas = new Map(); // id da fala -> motivo

  // Regra: vícios de fala sozinhos ("ééé", "hum")
  for (const f of falas) {
    if (f.palavras.length && f.palavras.every((p) => ehVicio(p.texto, est.vicios))) removidas.set(f.id, `vício de fala ("${f.palavras.map((p) => p.texto).join(" ")}")`);
  }
  // Regra: som sem palavra nenhuma (estalo, respiração forte, "ééé" que o whisper ignorou)
  for (const f of falas) {
    if (!f.palavras.length && f.fim - f.ini < 1.5) removidas.set(f.id, "som sem fala (estalo, respiração ou \"ééé\")");
  }
  // Regra: som curto e bem mais fraco que a fala (respiração, estalo de boca), mesmo que o
  // whisper tenha "grudado" uma palavra nele. Medido direto no áudio.
  const pcm = lerWav(wav);
  const rms = (a, b) => {
    const i0 = Math.floor(a * pcm.sr), i1 = Math.min(pcm.s.length, Math.ceil(b * pcm.sr));
    let soma = 0;
    for (let i = i0; i < i1; i++) soma += pcm.s[i] * pcm.s[i];
    return 20 * Math.log10(Math.sqrt(soma / Math.max(1, i1 - i0)) / 32768 || 1e-9);
  };
  const niveis = falas.map((f) => rms(f.ini, f.fim));
  const ordenados = [...niveis].sort((x, y) => x - y);
  const mediana = ordenados[Math.floor(ordenados.length / 2)];
  falas.forEach((f, i) => {
    f.nivel = niveis[i];
    if (!removidas.has(f.id) && f.fim - f.ini < 0.35 && niveis[i] < mediana - 12)
      removidas.set(f.id, `som curto e fraco (respiração ou estalo de boca)`);
    // estalo: som curtíssimo (< 0,15 s) com pausa dos dois lados
    const antes = i === 0 ? f.ini : f.ini - falas[i - 1].fim;
    const depois = i === falas.length - 1 ? dur - f.fim : falas[i + 1].ini - f.fim;
    if (!removidas.has(f.id) && f.fim - f.ini < 0.15 && antes >= est.pausaMin && depois >= est.pausaMin)
      removidas.set(f.id, `estalo de boca`);
  });

  // Regra: frase repetida -> fica a última tomada
  if (est.repeticao === "manter_ultima") {
    for (let i = 0; i < frasesInfo.length - 1; i++) {
      const a = frasesInfo[i];
      // compara com as próximas 2 frases (às vezes há um "ééé" no meio)
      for (let j = i + 1; j <= Math.min(i + 2, frasesInfo.length - 1); j++) {
        const b = frasesInfo[j];
        const sim = similaridade(a.texto, b.texto);
        const inicioIgual = norm(b.texto).startsWith(norm(a.texto).replace(/\s+\S*$/, "")) && norm(a.texto).length > 8;
        if (sim >= 0.75 || inicioIgual) {
          for (const fid of a.falas) if (!b.falas.includes(fid)) removidas.set(fid, `frase repetida, fica a última tomada ("${a.texto}")`);
          break;
        }
      }
    }
  }

  // Tutorial: frases que começam um passo ganham uma pausa curta antes
  const passos = new Map(); // id da fala -> texto da frase
  if (TUTORIAL) {
    for (const fr of frasesInfo) {
      const n = norm(fr.texto);
      if (est.palavrasPasso.some((w) => n === w || n.startsWith(w + " "))) {
        const fid = fr.falas[0];
        if (fid !== undefined && !removidas.has(fid)) passos.set(fid, fr.texto);
      }
    }
  }

  // 6) Trechos que ficam (com respiro), juntando os que se encostam
  const ficam = [];
  let primeira = true;
  for (const f of falas) {
    if (removidas.has(f.id)) continue;
    let antes = est.respiro;
    if (primeira) antes = est.inicioRespiro;
    else if (passos.has(f.id)) {
      // pausa total antes do passo = pausa_passo_s (o respiro depois da frase anterior + este trecho),
      // usando só o silêncio que existe de verdade
      const anterior = falas[f.id - 1];
      const disponivel = anterior ? f.ini - anterior.fim - est.respiro : est.pausaPasso;
      antes = Math.max(est.respiro, Math.min(est.pausaPasso - est.respiro, disponivel));
    }
    primeira = false;
    const a = Math.max(0, f.ini - antes), b = Math.min(dur, f.fim + est.respiro);
    const ult = ficam[ficam.length - 1];
    if (ult && a <= ult.fim + 0.001) ult.fim = Math.max(ult.fim, b);
    else ficam.push({ ini: a, fim: b });
  }

  // 7) Lista de cortes para a pessoa
  const cortes = [];
  let pos = 0;
  for (const k of ficam) { if (k.ini - pos > 0.005) cortes.push({ ini: pos, fim: k.ini }); pos = k.fim; }
  if (dur - pos > 0.005) cortes.push({ ini: pos, fim: dur });
  for (const c of cortes) {
    const motivos = new Set();
    for (const f of falas) if (removidas.has(f.id) && f.ini < c.fim && f.fim > c.ini) motivos.add(removidas.get(f.id));
    c.motivo = motivos.size ? [...motivos].join("; ") : "pausa";
  }
  const durFinal = ficam.reduce((s, k) => s + (k.fim - k.ini), 0);

  const dados = { video: path.resolve(video), duracao: dur, duracaoFinal: durFinal, estilo: est, cortes, ficam, frases: frasesInfo.map((f) => f.texto) };
  fs.writeFileSync(path.join(dir, "cortes.json"), JSON.stringify(dados, null, 2));

  const pausas = cortes.filter((c) => c.motivo === "pausa");
  const outros = cortes.filter((c) => c.motivo !== "pausa");
  let md = `# Lista de cortes: ${path.basename(video)}\n\n`;
  md += `- Duração original: **${fmt(dur)}**\n- Depois dos cortes: **${fmt(durFinal)}** (sai ${fmt(dur - durFinal)})\n\n`;
  md += TUTORIAL
    ? `**Tratado como tutorial:** pausa de ${est.pausaPasso} s antes de cada passo${passos.size ? ":\n" + [...passos.values()].map((t) => `  - "${t}"`).join("\n") : " (nenhum passo encontrado)"}\n\n`
    : "";
  md += `## O que sai além das pausas\n\n`;
  md += outros.length ? outros.map((c) => `- ${fmt(c.ini)} → ${fmt(c.fim)}: ${c.motivo}`).join("\n") : "- Nada.";
  md += `\n\n## Pausas cortadas (${pausas.length}, total ${fmt(pausas.reduce((s, c) => s + c.fim - c.ini, 0))})\n\n`;
  md += pausas.map((c) => `- ${fmt(c.ini)} → ${fmt(c.fim)} (${(c.fim - c.ini).toFixed(2)} s)`).join("\n") || "- Nenhuma.";
  md += `\n\n## O que foi entendido da fala\n\n` + frasesInfo.map((f, i) => `${i + 1}. ${f.texto}`).join("\n") + "\n";
  fs.writeFileSync(path.join(dir, "lista-de-cortes.md"), md);
  console.log(md);
  console.log(`(arquivos de trabalho em ${path.relative(RAIZ, dir)}/)`);
}

function cortar(video, modo, saidaDir) {
  const { nome, dir } = pastaTrabalho(video);
  const arq = path.join(dir, "cortes.json");
  if (!fs.existsSync(arq)) throw new Error("Rode 'analisar' primeiro.");
  const { ficam } = JSON.parse(fs.readFileSync(arq, "utf8"));
  const comVideo = temVideo(video);
  const destino = saidaDir || path.join(RAIZ, modo === "final" ? "final" : "previas");
  fs.mkdirSync(destino, { recursive: true });
  const saida = path.join(destino, `${nome}-${modo}.mp4`);
  if (path.resolve(saida) === path.resolve(video)) throw new Error("A saída seria o próprio original. Parei.");

  // Cada trecho: corta vídeo e áudio, com um fade de 10 ms no som para a emenda não estalar
  const partes = [];
  let fc = "";
  ficam.forEach((k, i) => {
    const d = (k.fim - k.ini).toFixed(3);
    if (comVideo) fc += `[0:v]trim=start=${k.ini.toFixed(3)}:end=${k.fim.toFixed(3)},setpts=PTS-STARTPTS[v${i}];`;
    fc += `[0:a]atrim=start=${k.ini.toFixed(3)}:end=${k.fim.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, d - 0.01).toFixed(3)}:d=0.01[a${i}];`;
    partes.push(comVideo ? `[v${i}][a${i}]` : `[a${i}]`);
  });
  fc += `${partes.join("")}concat=n=${ficam.length}:v=${comVideo ? 1 : 0}:a=1${comVideo ? "[v]" : ""}[a]`;
  if (comVideo && modo === "previa") fc = fc.replace(/\[v\]\[a\]$/, "[vc][a];[vc]scale='min(720,iw)':-2[v]");

  const qualidade = modo === "final"
    ? ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-c:a", "aac", "-b:a", "192k"]
    : ["-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-c:a", "aac", "-b:a", "128k"];
  const args = ["-v", "error", "-y", "-i", video, "-filter_complex", fc, ...(comVideo ? ["-map", "[v]"] : []), "-map", "[a]", ...qualidade, "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida];
  const r = require_spawn("ffmpeg", args);
  if (r.status !== 0) throw new Error("O corte falhou:\n" + r.stderr.slice(-2000));
  console.log(`Pronto: ${path.relative(RAIZ, saida)} (${fmt(duracao(saida))})`);
}

const [cmd, video, modo, ...resto] = process.argv.slice(2);
const TUTORIAL = process.argv.includes("--tutorial");
const iSaida = process.argv.indexOf("--saida");
const saidaDir = iSaida > 0 ? path.resolve(process.argv[iSaida + 1]) : null;
try {
  if (cmd === "analisar" && video) analisar(path.resolve(video));
  else if (cmd === "cortar" && video && (modo === "previa" || modo === "final")) cortar(path.resolve(video), modo, saidaDir);
  else console.log("Uso:\n  node _tecnico/scripts/editor.mjs analisar <video> [--tutorial]\n  node _tecnico/scripts/editor.mjs cortar <video> previa|final [--saida <pasta>]");
} catch (e) {
  console.error("ERRO: " + e.message);
  process.exit(1);
}
