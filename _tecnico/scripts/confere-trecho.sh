#!/bin/bash
# Uso: confere-trecho.sh <video> <início> <fim> — transcreve só esse trecho (sem cortar nada no original).
mkdir -p /tmp/claude-0
ffmpeg -nostdin -v error -y -ss $2 -to $3 -i "$1" -af "highpass=f=90" -ac 1 -ar 16000 /tmp/claude-0/ct.wav
whisper-cli -m /home/user/nave-trance-app/_tecnico/modelos/ggml-small.bin -l pt -nt -t 8 -f /tmp/claude-0/ct.wav 2>/dev/null | tr -d '\n'; echo
