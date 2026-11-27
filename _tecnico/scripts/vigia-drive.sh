#!/bin/bash
# Vigia uma pasta do Drive compartilhada por link: a cada N segundos lista a pasta (só a lista, não gasta o limite
# de download) e baixa cada vídeo NOVO uma única vez, já convertendo para a cópia de trabalho 1080x1920.
# Para quando todos os nomes esperados estiverem baixados.
# Uso: vigia-drive.sh <id-da-pasta> <pasta-saida> <intervalo-s> <nomes esperados separados por espaço>
PASTA=$1; OUT=$2; INT=$3; shift 3; ESPERADOS="$*"
mkdir -p "$OUT"; FEITOS="$OUT/.ids-processados"; touch "$FEITOS"
falta() { for n in $ESPERADOS; do [ -s "$OUT/$n.mp4" ] || echo $n; done; }
while [ -n "$(falta)" ]; do
  curl -sS -L "https://drive.google.com/embeddedfolderview?id=$PASTA" | grep -oE 'file/d/[A-Za-z0-9_-]{20,}|flip-entry-title">[^<]+' | paste -d'|' - - |
  while IFS='|' read k nome; do
    id=${k#file/d/}; nome=${nome#*\">}
    grep -qx "$id" "$FEITOS" && continue
    n=$(echo "$nome" | grep -oE 'MVI_[0-9]{4}' | head -1); [ -z "$n" ] && { echo "$id" >> "$FEITOS"; continue; }
    [ -s "$OUT/$n.mp4" ] && { echo "$id" >> "$FEITOS"; continue; }
    echo "$id" >> "$FEITOS"   # marca antes: cada arquivo é tentado UMA vez só
    echo "$(date +%H:%M) baixando $nome"
    if curl -sS -L "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t" </dev/null |
       ffmpeg -nostdin -v error -y -i pipe:0 -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT/$n.mp4"; then
      echo "$(date +%H:%M) $n ok $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$n.mp4")s"
    else
      rm -f "$OUT/$n.mp4"; echo "$(date +%H:%M) $n FALHOU (Google recusou; não tento de novo este arquivo)"
    fi
  done
  [ -n "$(falta)" ] && sleep "$INT"
done
echo "$(date +%H:%M) TUDO BAIXADO"
