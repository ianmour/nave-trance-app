#!/usr/bin/env python3
# Monta o vídeo cortado da "Black 2 — vagas acabando" para uma cidade (teresina | maceio | socorro).
# Junta os takes na ordem do roteiro, iguala o volume entre takes, limpa a voz de leve,
# deixa tudo 1080x1920 a 30 fps e normaliza em -14 LUFS.
# Uso: python3 montar-black-2.py <cidade> <saida.mp4> <saida-trechos.json>
import json, subprocess, sys

cidade, saida, trechos_json = sys.argv[1:4]
O = "originais/black-2/"
# (arquivo, início, fim, ganho dB, silenciar áudio até X s do começo do trecho, nome)
COMUM_INI = [("IMG_0212.mov", 2.17, 7.98, 0.5, 0, "abertura")]
DADOS = {
    "teresina": [("IMG_0218.mov", 5.27, 9.55, 6.6, 0, "dados"), ("IMG_0218.mov", 9.80, 11.05, 6.6, 0, "dados")],
    "maceio": [("IMG_0246.mov", 1.01, 6.46, 1.8, 0, "dados")],
    "socorro": [("IMG_0224.mov", 8.03, 16.29, 1.4, 0, "dados")],
}
COMUM_FIM = [
    ("IMG_0248.mov", 0.62, 6.99, -0.1, 0, "5x2"),
    ("IMG_0230.mov", 1.55, 6.30, 0.9, 0, "beneficios"),      # corta no começo da virada
    ("IMG_0244.mov", 1.25, 7.55, 7.2, 0, "presencial"),      # começa e termina virando a cadeira
    ("IMG_0240.mov", 6.85, 12.25, -1.3, 0, "online"),        # começa virando a cadeira
    ("IMG_0240.mov", 12.42, 14.15, -1.3, 0, "online"),       # termina com a mão na câmera
    ("IMG_0259.MOV", 3.15, 7.98, 1.0, 0.12, "final"),        # começa com a mão na câmera (contagem de fundo silenciada)
]
segs = COMUM_INI + DADOS[cidade] + COMUM_FIM
v = a = c = ""
acc = 0.0; tre = []
for i, (arq, s, e, g, mute, nome) in enumerate(segs):
    d = round((e - s) * 30) / 30
    v += f"[{i}:v]trim=duration={d:.4f},setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1,format=yuv420p[v{i}];"
    vol = f"volume={g}dB" + (f",volume=0:enable='lt(t,{mute})',afade=t=in:st={mute}:d=0.05" if mute else "")
    a += (f"[{i}:a]aresample=48000,atrim=duration={d:.4f},asetpts=PTS-STARTPTS,highpass=f=80,afftdn=nr=10:nf=-45:tn=1,{vol},"
          f"afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.4f}:d=0.012[a{i}];")
    c += f"[v{i}][a{i}]"
    tre.append({"arquivo": arq, "s": s, "e": e, "ini": round(acc, 4), "fim": round(acc + d, 4), "nome": nome})
    acc += d
filtro = v + a + c + f"concat=n={len(segs)}:v=1:a=1[v][a]"
ins = []
for arq, s, e, *_ in segs: ins += ["-ss", str(s), "-t", f"{e - s + 0.2:.3f}", "-i", O + arq]
tmp = saida + ".tmp.mov"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", filtro, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-c:a", "pcm_s16le", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida], check=True)
subprocess.run(["rm", "-f", tmp])
json.dump(tre, open(trechos_json, "w"), indent=1)
print(f"ok {cidade}: {acc:.2f}s, {len(segs)} trechos")
