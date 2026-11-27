#!/usr/bin/env python3
# Lizzie Walter Firmo v3: junta as frases inteiras (sem picotar dentro), áudio tratado, cor quente "vintage", -14 LUFS.
# Uso (na pasta v3): python3 montar-lizzie-v3.py <saida.mp4>
import json, subprocess, sys
C = json.load(open("cortes-v3.json")); saida = sys.argv[1]; SRC = "../grav-proxy.mp4"
TRAT = ("highpass=f=90,afftdn=nr=20:nf=-32:tn=1,agate=threshold=0.02:ratio=2.5:attack=6:release=180:range=0.3,"
        "equalizer=f=220:t=q:w=1.2:g=-3,equalizer=f=3500:t=q:w=1.4:g=3,equalizer=f=7500:t=q:w=2:g=-2.5,"
        "acompressor=threshold=-20dB:ratio=3:attack=6:release=120:makeup=3,alimiter=limit=0.95")
COR = "eq=contrast=1.06:saturation=0.78:gamma=0.97,colorbalance=rs=0.06:gs=0.02:bs=-0.07:rm=0.05:bm=-0.05:rh=0.03:bh=-0.06"
ins, v, a, cc, acc, mapa = [], "", "", "", 0.0, []
for i, (n, s, e) in enumerate(C):
    d = round((e - s) * 30) / 30
    ins += ["-ss", f"{s - 0.5:.3f}", "-t", f"{d + 0.8:.3f}", "-i", SRC]
    v += f"[{i}:v]trim=start=0.5:duration={d:.4f},setpts=PTS-STARTPTS,{COR},setsar=1,format=yuv420p[v{i}];"
    a += (f"[{i}:a]aresample=48000,{TRAT},atrim=start=0.5:duration={d:.4f},asetpts=PTS-STARTPTS,"
          f"afade=t=in:d=0.015,afade=t=out:st={d - 0.03:.4f}:d=0.03[a{i}];")
    cc += f"[v{i}][a{i}]"; mapa.append({"nome": n, "s": s, "e": e, "ini": round(acc, 4), "fim": round(acc + d, 4)}); acc += d
tmp = saida + ".tmp.mov"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", v + a + cc + f"concat=n={len(C)}:v=1:a=1[v][a]",
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-c:a", "pcm_s16le", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida], check=True)
subprocess.run(["rm", "-f", tmp]); json.dump(mapa, open("mapa.json", "w"), indent=1); print(f"ok {acc:.2f}s")
