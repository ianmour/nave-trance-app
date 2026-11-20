# Equipe Charlie — mesmas peças da versão B (estrela, C de fogo, CHARLIE), só muda a diagramação.
# Uso: python3 diagramacoes.py <pasta-de-saida>
import math, os, sys
OUT = sys.argv[1]

LOGO = '''
<polygon filter="url(#desgaste)" fill="var(--oliva)" points="32.00,10.70 36.11,22.54 48.64,22.79 38.66,30.36 42.29,42.36 32.00,35.20 21.71,42.36 25.34,30.36 15.36,22.79 27.89,22.54"/>
<text x="32" y="39" text-anchor="middle" font-family="Black Ops One" font-size="25" fill="url(#fogo)" stroke="#2A0A04" stroke-width=".55" paint-order="stroke">C</text>
<text x="32" y="31.4" text-anchor="middle" font-family="Black Ops One" font-size="7.2" letter-spacing=".25" fill="var(--amarelo)" stroke="var(--fundo)" stroke-width=".9" paint-order="stroke">CHARLIE</text>
'''
def logo(cx, cy, s):  # logo centrado em (cx,cy) com escala s (1 = tamanho da versão B)
    return f'<g transform="translate({cx} {cy}) scale({s}) translate(-32 -26.5)">{LOGO}</g>'

def arco(r, a1, a2, sweep):
    x1=32+r*math.cos(math.radians(a1)); y1=32+r*math.sin(math.radians(a1))
    x2=32+r*math.cos(math.radians(a2)); y2=32+r*math.sin(math.radians(a2))
    return f"M {x1:.2f} {y1:.2f} A {r} {r} 0 0 {sweep} {x2:.2f} {y2:.2f}"
def topo(id_, r, texto, tam, esp):   # texto em arco em cima
    return f'<path id="{id_}" d="{arco(r,195,345,1)}" fill="none"/><text font-family="Black Ops One" font-size="{tam}" letter-spacing="{esp}" fill="var(--amarelo)" text-anchor="middle"><textPath href="#{id_}" startOffset="50%">{texto}</textPath></text>'
def nome_baixo(id_, r, tam_max, cor="var(--amarelo)"):  # nome da pessoa em arco embaixo (encaixa sozinho)
    return f'<path id="{id_}" d="{arco(r,155,25,0)}" fill="none"/><text class="nome-arco" data-max="{tam_max}" font-family="Black Ops One" font-size="{tam_max}" letter-spacing=".3" fill="{cor}" text-anchor="middle"><textPath href="#{id_}" startOffset="50%" data-campo="nome">NOME</textPath></text>'

FUNDO = '<rect width="64" height="64" fill="var(--fundo)"/><rect width="64" height="64" filter="url(#textura)"/>'
ANEL = '<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--amarelo)" stroke-width=".35"/>'
PARAF = '<g fill="var(--amarelo)"><circle cx="{a}" cy="{y}" r="1.1"/><circle cx="{b}" cy="{y}" r="1.1"/></g><g fill="var(--fundo)"><circle cx="{a}" cy="{y}" r=".42"/><circle cx="{b}" cy="{y}" r=".42"/></g>'
SEM_NOME_RETO = "display:none;"

V = {}
# 1 — como a opção 2, com o logo um pouco menor para a estrela não chegar perto do anel
V['1-classico'] = dict(nome="left:20%; right:20%; top:68%; height:9mm; color:var(--amarelo);", arte=f'''{FUNDO}{ANEL}{PARAF.format(a=9,b=55,y=30)}
{topo('t1',23.4,'EQUIPE',4.4,1.2)}{logo(32,29.8,.8)}''')

# 2 — nome em arco embaixo, acompanhando o círculo; logo maior no meio
V['2-nome-em-arco'] = dict(nome=SEM_NOME_RETO, arte=f'''{FUNDO}{ANEL}
{topo('t2',23.4,'EQUIPE',4.4,1.2)}{logo(32,31.2,.86)}{nome_baixo('n2',25.3,5)}''')

# 3 — EQUIPE reto em cima, nome numa faixa amarela de ponta a ponta embaixo
V['3-faixa-do-nome'] = dict(nome="left:14%; right:14%; top:71.5%; height:7.5mm; color:var(--fundo);", arte=f'''{FUNDO}
<rect x="-2" y="44.6" width="68" height="9.6" fill="var(--amarelo)"/>
<g stroke="var(--amarelo)" stroke-width=".35"><line x1="15.5" y1="11.8" x2="20.6" y2="11.8"/><line x1="43.4" y1="11.8" x2="48.5" y2="11.8"/></g>
<text x="32.3" y="13.2" text-anchor="middle" font-family="Black Ops One" font-size="3.8" letter-spacing=".6" fill="var(--amarelo)">EQUIPE</text>
{logo(32,28.4,.82)}''')

# 4 — selo: faixa em volta com EQUIPE em cima e o nome embaixo; logo no miolo
V['4-selo'] = dict(nome=SEM_NOME_RETO, arte=f'''{FUNDO}
<circle cx="32" cy="32" r="25" fill="none" stroke="var(--oliva)" stroke-width="6.6" filter="url(#desgaste-anel)"/>
<circle cx="32" cy="32" r="28.4" fill="none" stroke="var(--amarelo)" stroke-width=".35"/>
<circle cx="32" cy="32" r="21.6" fill="none" stroke="var(--amarelo)" stroke-width=".35"/>
{topo('t4',23.6,'EQUIPE',3.9,1.6)}{nome_baixo('n4',26.4,3.9)}
<g fill="var(--amarelo)"><circle cx="7.3" cy="32" r=".7"/><circle cx="56.7" cy="32" r=".7"/></g>
{logo(32,32,.6)}''')

# 5 — logo grande, sem anel; EQUIPE e nome retos, com linhas
V['5-logo-grande'] = dict(nome="left:21%; right:21%; top:72%; height:7.5mm; color:var(--amarelo);", arte=f'''{FUNDO}
<text x="32" y="10.6" text-anchor="middle" font-family="Black Ops One" font-size="3.8" letter-spacing="1.2" fill="var(--amarelo)">EQUIPE</text>
{logo(32,28.6,.98)}
<line x1="19" y1="45" x2="45" y2="45" stroke="var(--amarelo)" stroke-width=".35"/>''')

BASE = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'base.html')).read()
os.makedirs(OUT, exist_ok=True)
for k, v in V.items():
    html = BASE.replace('/*NOME*/', v['nome']).replace('<!--ARTE-->', v['arte']).replace('{{TITULO}}', k)
    open(os.path.join(OUT, f'diagramacao-{k}.html'),'w').write(html)
print('\n'.join(V))
