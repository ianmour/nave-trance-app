#!/usr/bin/env python3
# Exporta só os efeitos sonoros de um projeto HyperFrames (sem a voz), nos mesmos tempos e volumes do vídeo.
# Uso: python3 so-efeitos.py <projeto> <duração s> <saida.wav>
import re, subprocess, sys, os
P, DUR, OUT = sys.argv[1], float(sys.argv[2]), sys.argv[3]
html = open(os.path.join(P, "index.html")).read()
sons = re.findall(r'<audio[^>]*src="([^"]+)"[^>]*data-start="([\d.]+)"[^>]*data-duration="([\d.]+)"[^>]*data-volume="([\d.]+)"', html)
ins, fl = [], ""
for i, (src, s, d, v) in enumerate(sons):
    ins += ["-i", os.path.join(P, src)]
    ms = int(float(s) * 1000)
    fl += f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration={d},volume={v},adelay={ms}|{ms}[s{i}];"
fl += "".join(f"[s{i}]" for i in range(len(sons))) + f"amix=inputs={len(sons)}:normalize=0:duration=longest,apad=whole_dur={DUR},atrim=duration={DUR}[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fl, "-map", "[o]", "-c:a", "pcm_s16le", OUT], check=True)
print(len(sons), "efeitos ->", OUT)
