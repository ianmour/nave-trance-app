#!/usr/bin/env python3
# Analisa cada take escolhido (com 0,6 s de folga): energia a cada 10 ms -> início/fim da fala e pausas internas; + whisper.
import json, subprocess, sys, numpy as np, os
SRC = "../grav-proxy.mp4"; ESC = json.load(open("../escolhas.json"))
TRAT = "highpass=f=90,afftdn=nr=20:nf=-32:tn=1"
out = {}
for nome, s, e in ESC:
    a = s - 0.6
    subprocess.run(["ffmpeg","-v","error","-y","-ss",str(a),"-t",str(e-s+1.2),"-i",SRC,"-af",TRAT,"-ac","1","-ar","16000",f"{nome}.wav"],check=True)
    x = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f"{nome}.wav","-f","s16le","-"],capture_output=True).stdout,np.int16)/32768
    fr = x[:len(x)//160*160].reshape(-1,160); db = 20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
    fala = db > -38
    idx = np.where(fala)[0]
    gaps=[]; run=0
    for i in range(idx[0], idx[-1]+1):
        if not fala[i]: run+=1
        else:
            if run>=15: gaps.append((round(a+(i-run)/100,2), round(a+i/100,2)))
            run=0
    subprocess.run(["whisper-cli","-m","../../../modelos/ggml-small.bin","-l","pt","-ml","1","-sow","-oj","-of",nome,"-t","8","-f",f"{nome}.wav"],capture_output=True)
    w = [(x["text"].strip(), round(a+x["offsets"]["from"]/1000,2), round(a+x["offsets"]["to"]/1000,2)) for x in json.load(open(f"{nome}.json"))["transcription"] if x["text"].strip()]
    out[nome] = {"esc":[s,e],"fala":[round(a+idx[0]/100,2), round(a+(idx[-1]+1)/100,2)],"pausas":gaps,"palavras":w}
    print(nome, out[nome]["esc"], "fala", out[nome]["fala"], "pausas", gaps); print("   ", " ".join(f"{t}@{b}" for t,b,c in w))
json.dump(out, open("takes.json","w"), indent=1)
