#!/usr/bin/env python3
# Cortes de podcast do Virgílio (vídeo principal 4K, plano aberto dos dois).
# Monta o vídeo em pé (1080x1920) de cada corte, com o layout escolhido, juntando os trechos da conversa.
# Layouts: "dividida" (cima convidado, baixo anfitrião), "close" (rosto do convidado), "manchete" (faixa de título em cima,
# convidado 4:5 no meio), "aberto" (plano dos dois no meio, fundo desfocado).
# Uso: python3 cortes-virgilio.py <n> <saida.mp4> <trechos.json>
import json, subprocess, sys

ORIG = "originais/virgilio/IMG_0359.MOV"
n, saida, trechos_json = sys.argv[1:4]
# recortes no quadro 4K (x, y, largura, altura) — medidos nos quadros do vídeo
CONV_CLOSE = (2076, 80, 990, 1760)      # convidado (Júnior), 9:16
ANF_CLOSE = (525, 224, 990, 1760)       # anfitrião (Virgílio, dono do perfil), 9:16
CONV_PAINEL = (1942, 50, 1200, 1067)    # convidado, painel 9:8
ANF_PAINEL = (420, 480, 1200, 1067)     # anfitrião, painel 9:8
CONV_45 = (1921, 60, 1320, 1650)        # convidado, 4:5
ANF_45 = (360, 250, 1320, 1650)         # anfitrião, 4:5

# trechos: (início, fim, quem aparece) — "a" = Virgílio (pergunta ou reação), "c" = Júnior; trechos colados no original = áudio contínuo
CORTES = {
    # 1) Quanto do empreendedor tem no secretário? — pergunta do Virgílio + resposta (tela dividida: os dois sempre na tela)
    "1": ("dividida", [(230.5, 238.0, "a"), (239.4, 275.9, "c")]),
    # 2) Dólar a R$6 — gancho do Júnior, pergunta do Virgílio, resposta com reação do Virgílio
    "2": ("close", [(1613.1, 1625.2, "c"), (1582.6, 1592.65, "a"), (1595.75, 1612.6, "c"), (1626.15, 1631.0, "c"), (1631.0, 1633.6, "a"), (1633.6, 1643.75, "c")]),
    # 3) Conselho de quem tem 17 anos de empresa — com reações do Virgílio
    "3": ("manchete", [(1787.5, 1800.2, "c"), (1849.55, 1853.4, "c"), (1854.0, 1859.5, "c"), (1859.5, 1862.2, "a"), (1862.2, 1866.7, "c"), (1867.25, 1875.7, "c"), (1880.2, 1892.4, "c"), (1901.1, 1906.9, "c"), (1906.9, 1909.4, "a"), (1909.4, 1918.1, "c")]),
    # 4) Oportunidade no centro de Maceió — gancho, pergunta do Virgílio, resposta com reação
    "4": ("close", [(725.5, 727.45, "c"), (671.1, 678.95, "a"), (459.0, 473.3, "c"), (473.7, 477.4, "c"), (719.1, 727.7, "c"), (727.7, 730.3, "a"), (730.3, 738.2, "c")]),
    # 5) O Mix Mateus quer fornecedor de Alagoas — pergunta do Virgílio em close, resposta no plano aberto (oportunidade local)
    "5": ("aberto", [(952.8, 961.1, "a"), (961.3, 965.2, "c"), (972.5, 1002.3, "c")]),
}
layout, segs = CORTES[n]
crop = lambda r: f"crop={r[2]}:{r[3]}:{r[0]}:{r[1]}"
vf, af, cc = "", "", ""
ins = []
acc = 0.0; tre = []
for i, (s, e, quem) in enumerate(segs):
    d = round((e - s) * 30) / 30
    ins += ["-ss", f"{s:.3f}", "-t", f"{d + 0.3:.3f}", "-i", ORIG]
    base = f"[{i}:v]trim=duration={d:.4f},setpts=PTS-STARTPTS,fps=30"
    if layout == "dividida":
        vf += (f"{base},split[c{i}][h{i}];[c{i}]{crop(CONV_PAINEL)},scale=1080:960[ct{i}];[h{i}]{crop(ANF_PAINEL)},scale=1080:960[hb{i}];"
               f"[ct{i}][hb{i}]vstack,setsar=1,format=yuv420p[v{i}];")
    elif layout == "close":
        vf += f"{base},{crop(ANF_CLOSE if quem == 'a' else CONV_CLOSE)},scale=1080:1920,setsar=1,format=yuv420p[v{i}];"
    elif layout == "manchete":
        vf += f"{base},{crop(ANF_45 if quem == 'a' else CONV_45)},scale=1080:1350,pad=1080:1920:0:300:color=black,setsar=1,format=yuv420p[v{i}];"
    elif layout == "aberto":
        if quem == "a":
            vf += f"{base},{crop(ANF_CLOSE)},scale=1080:1920,setsar=1,format=yuv420p[v{i}];"
        else:
            vf += (f"{base},scale=1920:1080,split[a{i}][b{i}];[a{i}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:3,eq=brightness=-0.12[bg{i}];"
                   f"[b{i}]crop=1600:1080:200:0,scale=1080:729[fg{i}];[bg{i}][fg{i}]overlay=0:595,setsar=1,format=yuv420p[v{i}];")
    junta_ant = i > 0 and abs(segs[i - 1][1] - s) < 0.01
    junta_prox = i < len(segs) - 1 and abs(segs[i + 1][0] - e) < 0.01
    fi = "" if junta_ant else ",afade=t=in:d=0.012"
    fo = "" if junta_prox else f",afade=t=out:st={d - 0.012:.4f}:d=0.012"
    af += f"[{i}:a]atrim=duration={d:.4f},asetpts=PTS-STARTPTS,aresample=48000{fi}{fo}[a{i}];"
    cc += f"[v{i}][a{i}]"
    tre.append({"s": s, "e": e, "quem": quem, "ini": round(acc, 4), "fim": round(acc + d, 4)})
    acc += d
filtro = vf + af + cc + f"concat=n={len(segs)}:v=1:a=1[v][a]"
tmp = saida + ".tmp.mov"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", filtro, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-c:a", "pcm_s16le", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida], check=True)
subprocess.run(["rm", "-f", tmp])
json.dump({"layout": layout, "trechos": tre}, open(trechos_json, "w"), indent=1)
print(f"corte {n} ({layout}): {acc:.1f}s")
