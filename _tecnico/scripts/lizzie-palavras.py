#!/usr/bin/env python3
# Tempo de cada palavra: o texto de cada take é conhecido; distribui as palavras (por sílabas) só nos trechos com voz
# (energia acima do ruído). O whisper se perde em clipes curtos, então aqui só usamos a energia do áudio.
import json, subprocess, re, numpy as np
TXT = {"gancho":"Imagine transformar o Brasil em poesia.","walter":"Walter Firmo começou com uma câmera emprestada e um sonho:",
"beleza":"mostrar a beleza que o olhar comum não via.","tempo":"Num tempo em que a fotografia precisava ser perfeita, ele mostrou o imperfeito e fez disso","tempo2":"arte.",
"retratou":"Retratou a vida no cotidiano e, em cada clique, mostrou que o Brasil é feito de cor,","retratou2":"afeto e verdade.",
"epoca":"Na época, falaram que suas fotos eram fora do padrão.","hoje":"E hoje fazem parte da nossa história.",
"museus":"Estão em museus, livros,","museus2":"principalmente, no jeito que a gente se reconhece.","provou":"Walter provou que a fotografia não é só técnica:",
"instante":"é o instante em que a vida se deixa ver e a arte acontece sem pedir licença.",
"fim":"Porque, no fim, é isso que a fotografia faz: transforma o real em memória,","encontro":"sendo o encontro entre o que o mundo mostra e o que a gente sente."}
import sys
M0=json.load(open("mapa.json")); M=[]
for m in M0:
    if M and M[-1]["nome"]==m["nome"]: M[-1]["fim"]=m["fim"]
    else: M.append(dict(m))
x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1] if len(sys.argv)>1 else "montagem.mp4","-vn","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout,np.int16)/32768
fr=x[:len(x)//160*160].reshape(-1,160); db=20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
out=[]
for m in M:
    i0,i1=int(m["ini"]*100),int(m["fim"]*100); seg=db[i0:i1]; piso=min(np.percentile(seg,10), np.percentile(db,10)+2)
    v=seg>max(piso+10,-45)
    for k in range(len(v)):            # preenche buracos curtos (< 80 ms)
        if not v[k] and v[max(0,k-8):k].any() and v[k+1:k+9].any(): v[k]=True
    idx=np.where(v)[0]; palavras=TXT[m["nome"]].split()
    peso=[len(re.findall(r"[aeiouáéíóúâêôãõà]+",p.lower()))+0.4 for p in palavras]; tot=sum(peso); acc=0
    for p,w in zip(palavras,peso):
        a=idx[int(acc/tot*(len(idx)-1))]; acc+=w; b=idx[min(len(idx)-1,int(acc/tot*(len(idx)-1)))]
        out.append({"text":p,"offsets":{"from":int((m["ini"]+a/100)*1000),"to":int((m["ini"]+b/100)*1000)}})
    print(m["nome"]," ".join(f'{o["text"]}@{o["offsets"]["from"]/1000:.2f}' for o in out[-len(palavras):]))
json.dump({"transcription":out},open(sys.argv[2] if len(sys.argv)>2 else "palavras.json","w"),ensure_ascii=False)
