import math, os, sys
# Gera os 5 estilos: python3 variacoes.py <pasta-de-saida>  (lê base.html da mesma pasta)
OUT = sys.argv[1]

def estrela(cx, cy, R, r=None):
    r = r or R*0.4
    pts=[]
    for i in range(10):
        a=math.radians(-90+36*i); rad=R if i%2==0 else r
        pts.append(f"{cx+rad*math.cos(a):.2f},{cy+rad*math.sin(a):.2f}")
    return " ".join(pts)

def arco(cx, cy, r, a1, a2, sweep=1):
    x1=cx+r*math.cos(math.radians(a1)); y1=cy+r*math.sin(math.radians(a1))
    x2=cx+r*math.cos(math.radians(a2)); y2=cy+r*math.sin(math.radians(a2))
    large = 1 if (a2-a1)%360>180 else 0
    return f"M {x1:.2f} {y1:.2f} A {r} {r} 0 {large} {sweep} {x2:.2f} {y2:.2f}"

DEFS = '''
<filter id="desgaste" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" result="ruido"/>
  <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.3" result="mascara"/>
  <feComposite in="SourceGraphic" in2="mascara" operator="in"/>
</filter>
<filter id="textura" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".35" numOctaves="3" seed="9"/>
  <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .6  0 0 0 0 .4  0 0 0 .12 0"/>
</filter>
<linearGradient id="fogo" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#B3170E"/><stop offset=".45" stop-color="#EE5A12"/><stop offset="1" stop-color="#FFC233"/>
</linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#E6E3D6"/><stop offset=".5" stop-color="#A9A796"/><stop offset="1" stop-color="#D4D1C2"/>
</linearGradient>
'''
FUNDO = '<rect width="64" height="64" fill="var(--fundo)"/><rect width="64" height="64" filter="url(#textura)"/>'
def txt_arco(id_, d, texto, tam, esp, cor="var(--amarelo)", fonte="Black Ops One"):
    return f'<path id="{id_}" d="{d}" fill="none"/><text font-family="{fonte}" font-size="{tam}" letter-spacing="{esp}" fill="{cor}" text-anchor="middle"><textPath href="#{id_}" startOffset="50%">{texto}</textPath></text>'

V = {}

# 1 — Placa de estêncil: CHARLIE grande no meio, estrela pequena em cima, sem C
V['1-placa'] = dict(nome="left:20%; right:20%; top:67%; height:9mm; color:var(--amarelo);", arte=f'''
{FUNDO}
<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--amarelo)" stroke-width=".3"/>
{txt_arco('a1', arco(32,32,23.2,200,340), 'EQUIPE', 4.2, 1.4)}
<polygon points="{estrela(32,18.6,5.2)}" fill="var(--laranja)"/>
<rect x="8.5" y="25.6" width="47" height="13" fill="var(--oliva)" filter="url(#desgaste)"/>
<text x="32" y="36.3" text-anchor="middle" font-family="Black Ops One" font-size="9.6" fill="var(--amarelo)" stroke="var(--fundo)" stroke-width=".6" paint-order="stroke">CHARLIE</text>
''')

# 2 — C em arco de fogo (estêncil) com estrela dentro; EQUIPE CHARLIE em volta
d_c = arco(32,29.5,11.2,40,320)
V['2-arco-de-fogo'] = dict(nome="left:20%; right:20%; top:68%; height:9mm; color:var(--amarelo);", arte=f'''
{FUNDO}
{txt_arco('a2', arco(32,32,24.4,195,345), 'EQUIPE CHARLIE', 4.3, .9)}
<path d="{d_c}" fill="none" stroke="#2A0A04" stroke-width="5.4"/>
<path d="{d_c}" fill="none" stroke="url(#fogo)" stroke-width="4.4" stroke-dasharray="10.6 .9"/>
<polygon points="{estrela(32,29.5,6.6)}" fill="var(--oliva)" filter="url(#desgaste)"/>
<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--oliva)" stroke-width=".5"/>
''')

# 3 — Insígnia com divisas e faixa: estrela, divisas, faixa com CHARLIE
V['3-insignia'] = dict(nome="left:20%; right:20%; top:70%; height:8mm; color:var(--amarelo);", arte=f'''
{FUNDO}
<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--amarelo)" stroke-width=".3"/>
{txt_arco('a3', arco(32,32,23.4,205,335), 'EQUIPE', 3.8, 1.6)}
<polygon points="{estrela(32,16.8,4.4)}" fill="var(--amarelo)"/>
<g fill="none" stroke="var(--oliva)" stroke-width="2" stroke-linejoin="miter">
  <path d="M 22 25 L 32 20.8 L 42 25"/><path d="M 22 29 L 32 24.8 L 42 29"/>
</g>
<path d="M 9.5 31.5 L 13.5 34.7 L 9.5 37.9 L 16 37.9 L 16 31.5 Z" fill="#B88A1A"/>
<path d="M 54.5 31.5 L 50.5 34.7 L 54.5 37.9 L 48 37.9 L 48 31.5 Z" fill="#B88A1A"/>
<rect x="13" y="30" width="38" height="9.4" fill="var(--amarelo)"/>
<text x="32" y="37.6" text-anchor="middle" font-family="Black Ops One" font-size="7.6" fill="var(--fundo)">CHARLIE</text>
''')

# 4 — Faixa diagonal: faixa oliva atravessando, CHARLIE inclinado, estrela laranja
V['4-faixa-diagonal'] = dict(nome="left:20%; right:20%; top:69%; height:9mm; color:var(--amarelo);", arte=f'''
{FUNDO}
<g transform="rotate(-12 32 32)">
  <rect x="-4" y="23.5" width="72" height="15" fill="var(--oliva)" filter="url(#desgaste)"/>
  <text x="33.5" y="35.4" text-anchor="middle" font-family="Black Ops One" font-size="10" fill="var(--amarelo)" stroke="var(--fundo)" stroke-width=".6" paint-order="stroke">CHARLIE</text>
</g>
{txt_arco('a4', arco(32,32,23.4,200,340), 'EQUIPE', 4.2, 1.4)}
<polygon points="{estrela(13.5,21.5,3.6)}" fill="var(--laranja)"/>
<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--amarelo)" stroke-width=".3"/>
''')

# 5 — Plaqueta militar (dog tag): nome da pessoa gravado na plaqueta
V['5-plaqueta'] = dict(nome="left:30%; right:20%; top:56.5%; height:8.5mm; color:#23251A; font-family:'Black Ops One';", arte=f'''
{FUNDO}
<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--amarelo)" stroke-width=".3"/>
{txt_arco('a5', arco(32,32,24.2,195,345), 'EQUIPE CHARLIE', 4.3, .9)}
<polygon points="{estrela(32,19.4,7.6)}" fill="var(--oliva)" filter="url(#desgaste)"/>
<text x="32" y="23" text-anchor="middle" font-family="Black Ops One" font-size="7.4" fill="var(--laranja)">C</text>
<rect x="12.4" y="30.8" width="39.2" height="17.4" rx="4.6" fill="#0E0F09" transform="translate(.6 .7)" opacity=".7"/>
<rect x="12.4" y="30.8" width="39.2" height="17.4" rx="4.6" fill="url(#metal)" stroke="#6E6C5E" stroke-width=".3"/>
<rect x="14.4" y="32.8" width="35.2" height="13.4" rx="3.2" fill="none" stroke="#8D8B7B" stroke-width=".25"/>
<circle cx="16.2" cy="39.5" r="1.1" fill="var(--fundo)"/>
''')

BASE = open(os.path.join(os.path.dirname(__file__),'base.html')).read()
os.makedirs(OUT, exist_ok=True)
for nome, v in V.items():
    html = BASE.replace('/*NOME*/', v['nome']).replace('<!--DEFS-->', DEFS).replace('<!--ARTE-->', v['arte']).replace('{{TITULO}}', nome)
    open(os.path.join(OUT, f'estilo-{nome}.html'),'w').write(html)
print('\n'.join(sorted(V)))
