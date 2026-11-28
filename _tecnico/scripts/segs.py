#!/usr/bin/env python3
# Mostra os trechos com voz (energia) de um vídeo entre a e b: início-fim de cada trecho, separados por silêncios >= 0,10 s.
import sys, subprocess, numpy as np
v, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
x = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-ss",str(a),"-t",str(b-a),"-i",v,"-af","highpass=f=90","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout,np.int16)/32768
fr = x[:len(x)//160*160].reshape(-1,160); db = 20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
piso = max(np.percentile(db, 15), -62); f = db > piso + 12; segs=[]; i=0
while i < len(f):
    if f[i]:
        j=i
        while j < len(f) and (f[j] or f[j:j+10].any()): j+=1
        if j-i>3: segs.append(f"{a+i/100:.2f}-{a+j/100:.2f}")
        i=j
    else: i+=1
print(f"piso {piso:.0f} dB:", " ".join(segs))
