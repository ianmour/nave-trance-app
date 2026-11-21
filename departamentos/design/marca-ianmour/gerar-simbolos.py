# Gera os símbolos da marca ianmour (SVG) a partir de desenhos em grade de pixels 12x12.
# Assinatura da família: todo símbolo tem o "pixel solto" no canto de cima à direita, na cor de destaque.
# Uso: python3 gerar-simbolos.py   (gera simbolos/*.svg e simbolos.js para a folha da marca)
import json, os
AQUI = os.path.dirname(os.path.abspath(__file__))
CORES = {'rosa': '#FC3B7F', 'creme': '#FEF1CF', 'azul': '#0032A8', 'noite': '#0A0A14'}
# combinação: (cor do símbolo, cor do pixel solto)
VARIACOES = {'rosa': ('rosa', 'azul'), 'creme': ('creme', 'rosa'), 'azul': ('azul', 'rosa'), 'noite': ('noite', 'rosa')}

S = {
 'faisca': ('Destaque, novidade, ideia', [
  '.....##.....','.....##.....','.....##.....','....####....','..########..','############',
  '############','..########..','....####....','.....##.....','.....##.....','.....##.....']),
 'seta': ('Próximo, arrasta, caminho', [
  '............','......#.....','......##....','......###...','#####.####..','#####.#####.',
  '#####.#####.','#####.####..','......###...','......##....','......#.....','............']),
 'raio': ('Energia, impacto, rapidez', [
  '.....#####..','....#####...','....####....','...####.....','..########..','..#######...',
  '.....####...','....####....','....###.....','...###......','...##.......','..#.........']),
 'feito': ('Feito, certo, aprovado', [
  '............','............','.........###','........###.','.......###..','###...###...',
  '.###.###....','..#####.....','...###......','....#.......','............','............']),
 'olho': ('Atenção, veja isso', [
  '............','............','...######...','.##......##.','#...####...#','#..###.##..#',
  '#..######..#','#...####...#','.##......##.','...######...','............','............']),
 'fala': ('Conversa, opinião, comentário', [
  '............','..########..','.##########.','############','##..#..#..##','##..#..#..##',
  '############','.##########.','..########..','..###.......','..##........','..#.........']),
 'mira': ('Foco, objetivo, meta', [
  '.....##.....','.....##.....','..##....##..','.#........#.','.#...##...#.','##..####..##',
  '##..####..##','.#...##...#.','.#........#.','..##....##..','.....##.....','.....##.....']),
 'controle': ('Jogo, mundo GAME, diversão', [
  '............','............','............','..########..','.##########.','###.####.#.#',
  '##...#######','###.########','####....####','###......###','.#........#.','............']),
 'play': ('Vídeo, assistir, começar', [
  '............','..##........','..####......','..######....','..########..','..##########',
  '..##########','..########..','..######....','..####......','..##........','............']),
}

def svg(desenho, cor, acento, tam=12):
    rects = []
    for y, linha in enumerate(desenho):
        assert len(linha) == 12, (linha, len(linha))
        x = 0
        while x < 12:
            if linha[x] == '#':
                x0 = x
                while x < 12 and linha[x] == '#': x += 1
                rects.append(f'<rect x="{x0}" y="{y}" width="{x-x0}" height="1"/>')
            else:
                x += 1
    corpo = ''.join(rects)
    # pixel solto: fora da grade do desenho, encostado no canto
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 14 14" shape-rendering="crispEdges">'
            f'<g fill="{cor}">{corpo}</g><rect x="13" y="-2" width="1" height="1" fill="{acento}"/></svg>')

os.makedirs(os.path.join(AQUI, 'simbolos'), exist_ok=True)
dados = {}
for nome, (uso, desenho) in S.items():
    dados[nome] = {'uso': uso, 'svg': {}}
    for var, (c, a) in VARIACOES.items():
        conteudo = svg(desenho, CORES[c], CORES[a])
        open(os.path.join(AQUI, 'simbolos', f'{nome}-{var}.svg'), 'w').write(conteudo)
        dados[nome]['svg'][var] = conteudo
open(os.path.join(AQUI, 'simbolos.js'), 'w').write('window.SIMBOLOS = ' + json.dumps(dados, ensure_ascii=False) + ';')
print(len(S), 'símbolos x', len(VARIACOES), 'cores =', len(S) * len(VARIACOES), 'arquivos SVG')
