#!/usr/bin/env python3
# Acha início/fim reais da fala em cada take (limiar = ruído de fundo + 12 dB) e pausas internas longas.
import json, subprocess, numpy as np
T=json.load(open("takes.json")); R={}
for nome,d in T.items():
    s,e=d["esc"]; a=s-0.6
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f"{nome}.wav","-f","s16le","-"],capture_output=True).stdout,np.int16)/32768
    fr=x[:len(x)//160*160].reshape(-1,160); db=20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
    piso=np.percentile(db[1:],15); f=db>piso+12
    i0=int((s-0.3-a)*100); i1=int((e+0.3-a)*100)
    sus=[i for i in range(i0,i1) if f[i:i+5].all()]
    on=sus[0]; off=max(i for i in range(i0,min(i1,len(f))) if f[max(0,i-4):i+1].all())
    gaps=[]; run=0
    for i in range(on,off+1):
        if not f[i]: run+=1
        else:
            if run>=30: gaps.append((round(a+(i-run)/100,2),round(a+i/100,2)))
            run=0
    R[nome]={"on":round(a+on/100,2),"off":round(a+off/100+0.01,2),"pausas":gaps,"piso":round(float(piso),1)}
    print(nome,d["esc"],R[nome])
json.dump(R,open("limites.json","w"),indent=1)
