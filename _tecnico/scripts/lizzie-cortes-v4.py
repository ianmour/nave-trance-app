#!/usr/bin/env python3
# Cortes "fluidos": cada take começa logo antes da 1ª palavra e termina logo depois da última (sem cortar o fim da
# palavra: estende enquanto ainda há som de fala), e pausas internas > 0,22 s viram 0,10 s (corte no meio do silêncio).
# Entrada: cortes-v3.json (takes já escolhidos). Saída: pecas.json [[nome, ini, fim], ...] na ordem.
import json, subprocess, numpy as np
C = json.load(open("cortes-v3.json")); P = []
for n, s, e in C:
    a = s - 0.4
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-t", str(e - s + 0.8), "-i", "../grav-proxy.mp4",
        "-af", "highpass=f=90,afftdn=nr=20:nf=-32:tn=1", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout, np.int16) / 32768
    fr = x[:len(x) // 160 * 160].reshape(-1, 160); db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    i0, i1 = int((s - a) * 100), int((e - a) * 100)
    piso = np.percentile(db[i0:i1], 8); forte = db > piso + 12; fraco = db > piso + 6
    on = next(i for i in range(i0, i1) if forte[i:i + 3].all())
    k = on
    while k > i0 and fraco[k - 1] and on - k < 12: k -= 1
    ini = max(i0, k - 3)
    off = max(i for i in range(i0, i1) if forte[max(0, i - 2):i + 1].all())
    k = off
    while k < i1 and fraco[k + 1] and k - off < 15: k += 1
    fim = min(i1, k + 6)
    # pausas internas
    cortes = []; run = 0
    for i in range(ini, fim):
        if not fraco[i]: run += 1
        else:
            if run >= 22: cortes.append((i - run, i))
            run = 0
    pos = ini
    for g0, g1 in cortes:
        meio = (g0 + g1) // 2
        P.append([n, round(a + pos / 100, 3), round(a + (meio - 0) / 100 - 0.0, 3)]) if False else None
        P.append([n, round(a + pos / 100, 3), round(a + (g0 + 5) / 100, 3)]); pos = g1 - 5
    P.append([n, round(a + pos / 100, 3), round(a + fim / 100, 3)])
    print(n, [s, e], "->", [p[1:] for p in P if p[0] == n])
json.dump(P, open("pecas.json", "w"), indent=1)
print("total", round(sum(p[2] - p[1] for p in P), 2))
