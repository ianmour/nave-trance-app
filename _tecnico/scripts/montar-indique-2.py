#!/usr/bin/env python3
# "Indique um amigo 2" (continuação): junta os 4 takes na ordem da fala, tira pausas, iguala o volume
# entre takes, 1080x1920 30 fps, -14 LUFS.  Uso: python3 montar-indique-2.py <saida.mp4> <trechos.json>
import json, subprocess, sys

saida, tj = sys.argv[1:3]
O = "originais/indique-2/"
# (arquivo, início, fim, ganho dB, nome)
SEGS = [
    ("IMG_7735.mov", 0.55, 3.52, 3.4, "gancho"), ("IMG_7735.mov", 3.80, 7.95, 3.4, "gancho"),
    ("IMG_7738.mov", 0.75, 6.44, 3.2, "regras"), ("IMG_7738.mov", 6.70, 9.35, 3.2, "regras"),   # começa no fim da virada
    ("IMG_7753.mov", 0.70, 9.78, 0.0, "mais"),
    ("IMG_7741.mov", 1.85, 3.59, 4.0, "portal"), ("IMG_7741.mov", 3.92, 7.43, 4.0, "portal"), ("IMG_7741.mov", 7.72, 8.55, 4.0, "portal"),  # fala completa "portal do colaborador" (pedido: sem corte)
]
v = a = c = ""; ins = []; acc = 0.0; tre = []
for i, (arq, s, e, g, nome) in enumerate(SEGS):
    d = round((e - s) * 30) / 30
    ins += ["-ss", str(s), "-t", f"{d + 0.2:.3f}", "-i", O + arq]
    v += f"[{i}:v]trim=duration={d:.4f},setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1,format=yuv420p[v{i}];"
    a += (f"[{i}:a]aresample=48000,atrim=duration={d:.4f},asetpts=PTS-STARTPTS,highpass=f=80,afftdn=nr=8:nf=-45:tn=1,volume={g}dB,"
          f"afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.4f}:d=0.012[a{i}];")
    c += f"[v{i}][a{i}]"
    tre.append({"arquivo": arq, "s": s, "e": e, "ini": round(acc, 4), "fim": round(acc + d, 4), "nome": nome})
    acc += d
tmp = saida + ".tmp.mov"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", v + a + c + f"concat=n={len(SEGS)}:v=1:a=1[v][a]", "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-c:a", "pcm_s16le", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida], check=True)
subprocess.run(["rm", "-f", tmp])
json.dump(tre, open(tj, "w"), indent=1)
print(f"ok: {acc:.2f}s")
