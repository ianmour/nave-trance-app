#!/bin/bash
# Transcreve um trecho do vídeo de trabalho (início fim) para conferir que nenhuma palavra foi cortada.
ffmpeg -v error -y -ss $1 -to $2 -i ../grav-proxy.mp4 -af "highpass=f=90,afftdn=nr=20:nf=-32:tn=1" -ac 1 -ar 16000 /tmp/claude-0/cf.wav
whisper-cli -m ../../../modelos/ggml-small.bin -l pt -nt -t 8 -f /tmp/claude-0/cf.wav 2>/dev/null | tr -d '\n'; echo
