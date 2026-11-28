#!/usr/bin/env python3
# Tempo de cada palavra da legenda: o texto de cada trecho é conhecido (textos.json {nome: frase}); as palavras são
# distribuídas por sílabas só nos momentos com voz (energia). Uso: palavras-fala.py <montagem.mp4> <mapa.json> <textos.json> <saida.json>
import json, subprocess, re, sys, numpy as np
mont, mp, tx, out_p = sys.argv[1:5]; TXT = json.load(open(tx))
M0 = json.load(open(mp)); M = []
for m in M0:
    if M and M[-1]["nome"] == m["nome"]: M[-1]["fim"] = m["fim"]
    else: M.append(dict(m))
x = np.frombuffer(subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", mont, "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout, np.int16) / 32768
fr = x[:len(x) // 160 * 160].reshape(-1, 160); db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9); pg = np.percentile(db, 10)
out = []
for m in M:
    i0, i1 = int(m["ini"] * 100), int(m["fim"] * 100); seg = db[i0:i1]; piso = min(np.percentile(seg, 10), pg + 2)
    v = seg > max(piso + 10, -45)
    for k in range(len(v)):
        if not v[k] and v[max(0, k - 8):k].any() and v[k + 1:k + 9].any(): v[k] = True
    idx = np.where(v)[0]; pal = TXT[m["nome"]].split()
    peso = [2.4 if p.strip(".,").isdigit() else len(re.findall(r"[aeiouáéíóúâêôãõà]+", p.lower())) + 0.4 for p in pal]; tot = sum(peso); acc = 0
    for p, w in zip(pal, peso):
        a = idx[int(acc / tot * (len(idx) - 1))]; acc += w; b = idx[min(len(idx) - 1, int(acc / tot * (len(idx) - 1)))]
        out.append({"text": p, "offsets": {"from": int((m["ini"] + a / 100) * 1000), "to": int((m["ini"] + b / 100) * 1000)}})
    print(m["nome"], " ".join(f'{o["text"]}@{o["offsets"]["from"] / 1000:.2f}' for o in out[-len(pal):]))
json.dump({"transcription": out}, open(out_p, "w"), ensure_ascii=False)
