#!/usr/bin/env python3
# Gera narração com o Kokoro (local, grátis) misturando vozes.
# Uso: HYPERFRAMES python: voz-mistura.py "<texto ou caminho .txt>" "pm_alex:0.7,pm_santa:0.3" <velocidade> <saida.wav>
import sys, os
import numpy as np
import kokoro_onnx, soundfile as sf

BASE = "/root/.cache/hyperframes/tts"
texto, mistura, vel, saida = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
if os.path.isfile(texto):
    texto = open(texto, encoding="utf8").read()
k = kokoro_onnx.Kokoro(f"{BASE}/models/kokoro-v1.0.onnx", f"{BASE}/voices/voices-v1.0.bin")
estilo = None
for parte in mistura.split(","):
    nome, peso = parte.split(":")
    v = k.get_voice_style(nome.strip()) * float(peso)
    estilo = v if estilo is None else estilo + v
audio, sr = k.create(texto, voice=estilo, speed=vel, lang="pt-br")
sf.write(saida, audio, sr)
print(f"ok: {saida} ({len(audio) / sr:.1f}s)")
