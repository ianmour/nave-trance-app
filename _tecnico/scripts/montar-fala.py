#!/usr/bin/env python3
# Monta a fala a partir de trechos escolhidos [[arquivo, início, fim, nome], ...] (cópias de trabalho 1080x1920 30 fps).
# Em cada trecho: começa logo antes da 1ª palavra, termina depois que a última sílaba some (tolera vales de 0,15 s),
# e pausas internas > 0,28 s viram 0,14 s (corte no silêncio, nunca no meio da palavra). Encaixe exato quadro a quadro.
# Áudio: limpeza de ruído, voz mais presente, compressão, -12 LUFS. Grava pecas-final.json e mapa.json.
# Um 5º item no trecho ("duro") impede de estender o fim além do marcado (quando logo depois vem um "sabe?" etc.).
# Uso: python3 montar-fala.py <trechos.json> <saida.mp4> [cor ffmpeg]
import json, subprocess, sys, numpy as np
T = json.load(open(sys.argv[1])); saida = sys.argv[2]; COR = sys.argv[3] if len(sys.argv) > 3 else "null"
TRAT = ("highpass=f=85,afftdn=nr=14:nf=-48:tn=1,equalizer=f=200:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=3,"
        "equalizer=f=7500:t=q:w=2:g=-2,acompressor=threshold=-24dB:ratio=4:attack=5:release=110:makeup=5,alimiter=limit=0.95")
def energia(arq, a, b):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-ss", str(a), "-t", str(b - a), "-i", arq, "-af", "highpass=f=90",
        "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout, np.int16) / 32768
    fr = x[:len(x) // 160 * 160].reshape(-1, 160); return 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
P = []
for t in T:
    arq, s, e, nome = t[:4]; duro = len(t) > 4
    a = s - 0.3; db = energia(arq, a, e + 0.5); piso = max(np.percentile(db, 15), -62)
    forte, fraco = db > piso + 14, db > piso + 7
    i0, i1 = int((s - a) * 100), min(len(db) - 1, int((e - a) * 100))
    on = next(i for i in range(i0, i1) if forte[i:i + 3].all()); k = on
    while k > i0 - 10 and fraco[k - 1] and on - k < 12: k -= 1
    ini = k - 4
    off = max(i for i in range(i0, i1) if forte[max(0, i - 2):i + 1].all()); k = ult = off
    while k < min(len(db) - 1, i1 + (2 if duro else 30)) and k - ult <= 15:
        k += 1
        if fraco[k]: ult = k
    fim = ult + 8
    pos, run = ini, 0
    for i in range(ini, fim):
        if not fraco[i]: run += 1
        else:
            if run >= 28: P.append([arq, round(a + pos / 100, 3), round(a + (i - run + 7) / 100, 3), nome]); pos = i - 7
            run = 0
    P.append([arq, round(a + pos / 100, 3), round(a + fim / 100, 3), nome])
json.dump(P, open("pecas-final.json", "w"), indent=1)
ins, v, au, cc, acc, mapa = [], "", "", "", 0.0, []
for i, (arq, s, e, nome) in enumerate(P):
    nq = round((e - s) * 30); d = nq / 30
    ins += ["-ss", f"{s - 0.5:.3f}", "-t", f"{d + 0.8:.3f}", "-i", arq]
    v += f"[{i}:v]setpts=PTS-STARTPTS,trim=start_frame=15:end_frame={15 + nq},setpts=PTS-STARTPTS,{COR},setsar=1,format=yuv420p[v{i}];"
    au += (f"[{i}:a]aresample=48000,{TRAT},atrim=start_sample=24000:end_sample={24000 + nq * 1600},asetpts=PTS-STARTPTS,"
           f"afade=t=in:d=0.008,afade=t=out:st={d - 0.012:.4f}:d=0.012[a{i}];")
    cc += f"[v{i}][a{i}]"; mapa.append({"nome": nome, "arq": arq, "s": s, "e": e, "ini": round(acc, 4), "fim": round(acc + d, 4)}); acc += d
tmp = saida + ".tmp.mov"
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", v + au + cc + f"concat=n={len(P)}:v=1:a=1[v][a]",
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-c:a", "pcm_s16le", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-12:TP=-1.0:LRA=7:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"loudnorm=I=-12:TP=-1.0:LRA=7:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", tmp, "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida], check=True)
subprocess.run(["rm", "-f", tmp]); json.dump(mapa, open("mapa.json", "w"), indent=1)
print(f"ok {acc:.2f}s, {len(P)} pedaços")
