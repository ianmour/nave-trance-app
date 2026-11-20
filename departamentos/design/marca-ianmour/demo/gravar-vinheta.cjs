// Grava a vinheta HTML em MP4 (1080x1920, 30 qps) com efeitos sonoros.
// Uso: node gravar-vinheta.cjs <vinheta.html> <saida.mp4>
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

(async () => {
  const [entrada, saida] = process.argv.slice(2);
  const QPS = 30, SFX = '/root/.claude/skills/media-use/audio/assets/sfx/';
  const tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(saida)), '.quadros-'));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(entrada), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const dur = await p.evaluate(() => window.DURACAO);
  const sons = await p.evaluate(() => window.SONS);
  const n = Math.round(dur * QPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.quadro(t), i / QPS);
    await p.screenshot({ path: path.join(tmp, String(i).padStart(4, '0') + '.png') });
  }
  await b.close();
  // áudio: cada som no seu tempo, misturados
  const args = ['-y'];
  sons.forEach(([, arq]) => args.push('-i', SFX + arq));
  const filtros = sons.map(([t, , v], i) => `[${i}:a]adelay=${Math.round(t * 1000)}:all=1,volume=${v}[a${i}]`);
  filtros.push(sons.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${sons.length}:normalize=0,apad,atrim=0:${dur}[mix]`);
  const audio = path.join(tmp, 'audio.wav');
  execFileSync('ffmpeg', [...args, '-filter_complex', filtros.join(';'), '-map', '[mix]', audio], { stdio: 'ignore' });
  execFileSync('ffmpeg', ['-y', '-framerate', String(QPS), '-i', path.join(tmp, '%04d.png'), '-i', audio,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', saida], { stdio: 'ignore' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Pronto:', saida, `(${n} quadros, ${dur}s)`);
})();
