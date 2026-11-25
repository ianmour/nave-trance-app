#!/bin/bash
# Mistura a voz do vídeo cortado com os efeitos sonoros do index.html (volumes do projeto + ganho extra),
# normaliza para -14 LUFS e junta com a imagem renderizada.
# Uso: mixar-sfx.sh <projeto> <render.mp4> <saida.mp4> [ganho_sfx_dB=13]
set -e
P=$1; R=$2; O=$3; G=${4:-13}; T=$(mktemp -d)
DUR=$(grep -o "id=\"main\"[^>]*data-duration=\"[0-9.]*\"" "$P/index.html" | grep -o "data-duration=\"[0-9.]*" | grep -o "[0-9.]*$")
ffmpeg -v error -y -i "$P/assets/corte.mp4" -ac 1 -ar 48000 $T/voz.wav
node -e '
const [P,T]=process.argv.slice(1);const fs=require("fs");const s=fs.readFileSync(P+"/index.html","utf8");
const re=/<audio[^>]*src="([^"]+)"[^>]*data-start="([0-9.]+)"[^>]*data-duration="([0-9.]+)"[^>]*data-volume="([0-9.]+)"/g;let m,ins=[],fl=[],i=0;
while((m=re.exec(s))){ins.push("-i",P+"/"+m[1]);fl.push(`[${i+1}:a]aresample=48000,pan=mono|c0=c0,atrim=0:${m[3]},volume=${m[4]},adelay=${Math.round(+m[2]*1000)}[s${i}]`);i++}
fl.push(`${Array.from({length:i},(_,k)=>`[s${k}]`).join("")}amix=inputs=${i}:normalize=0[sfx]`);
fs.writeFileSync(T+"/ins.txt",ins.join("\n"));fs.writeFileSync(T+"/f.txt",fl.join(";"));' "$P" $T
mapfile -t INS < $T/ins.txt
if [ ! -s $T/ins.txt ]; then  # sem efeitos: só junta a voz com a imagem
  ffmpeg -v error -y -i "$R" -i $T/voz.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ac 2 -movflags +faststart -shortest "$O"; rm -rf $T
  ffmpeg -hide_banner -i "$O" -af ebur128 -f null - 2>&1 | grep -A1 Integrated | tail -1; exit 0
fi
ffmpeg -v error -y -f lavfi -i anullsrc=r=48000:cl=mono -t $DUR "${INS[@]}" -filter_complex "$(cat $T/f.txt);[0:a][sfx]amix=inputs=2:normalize=0,atrim=0:$DUR[o]" -map "[o]" $T/sfx.wav
ffmpeg -v error -y -i $T/voz.wav -i $T/sfx.wav -filter_complex "[0:a]apad=whole_dur=$DUR[v];[1:a]volume=${G}dB[s];[v][s]amix=inputs=2:normalize=0:duration=first[o]" -map "[o]" $T/mix.wav
J=$(ffmpeg -hide_banner -i $T/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J"|grep "\"$1\""|grep -o '[-0-9.]\+'|head -1; }
ffmpeg -v error -y -i "$R" -i $T/mix.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a aac -b:a 192k -ac 2 -movflags +faststart -shortest "$O"
rm -rf $T
ffmpeg -hide_banner -i "$O" -af ebur128 -f null - 2>&1 | grep -A1 Integrated | tail -1
