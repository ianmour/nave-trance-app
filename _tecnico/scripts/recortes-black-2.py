#!/usr/bin/env python3
# Reaproveita os recortes (pessoa sem fundo) já feitos: corta o pedaço de cada trecho novo
# e acelera na mesma velocidade da montagem, sem rodar o recorte de novo.
# Uso: python3 recortes-black-2.py <cidade> <trechos-antigos.json> <trechos-novos.json> <pasta recortes antigos> <pasta assets>
import json, subprocess, sys

cidade, velho_j, novo_j, rec, assets = sys.argv[1:6]
velho, novo = json.load(open(velho_j)), json.load(open(novo_j))
for nome in dict.fromkeys(t["nome"] for t in novo):
    src = f"{rec}/{cidade}-dados.webm" if nome == "dados" else f"{rec}/comum-{nome}.webm"
    v_ini = min(t["ini"] for t in velho if t["nome"] == nome)
    partes = []
    for t in [t for t in novo if t["nome"] == nome]:
        o = next(x for x in velho if x["nome"] == nome and x["arquivo"] == t["arquivo"] and x["s"] - 0.01 <= t["s"] <= x["e"])
        a = o["ini"] - v_ini + (t["s"] - o["s"])
        partes.append((a, a + (t["e"] - t["s"]), t["vel"]))
    filt = "".join(f"[0:v]trim={a:.4f}:{b:.4f},setpts=(PTS-STARTPTS)/{vel},fps=30[p{i}];" for i, (a, b, vel) in enumerate(partes))
    filt += "".join(f"[p{i}]" for i in range(len(partes))) + f"concat=n={len(partes)}:v=1:a=0,format=yuva420p[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-c:v", "libvpx-vp9", "-i", src, "-filter_complex", filt, "-map", "[v]",
                    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "30", "-row-mt", "1", "-deadline", "realtime", "-cpu-used", "8",
                    f"{assets}/recorte-{nome}.webm"], check=True)
    print(nome, "ok")
