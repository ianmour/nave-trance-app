#!/usr/bin/env node
// Transforma uma proposta, orçamento ou apresentação feita em HTML em PDF (e PowerPoint, se pedir).
//
// Uso:
//   node _tecnico/scripts/exportar-pdf.mjs <arquivo.html> <pasta-de-saida> [--pptx]
//
// - O tamanho da página vem do próprio HTML (@page): A4 para proposta, 16:9 para slides.
// - Cada página é um elemento com a classe "pagina" (proposta) ou "slide" (apresentação).
// - --pptx: também gera um PowerPoint, uma imagem de alta qualidade por slide
//   (usa o python-pptx que já vem no computador; o texto não fica editável no PowerPoint:
//   para mudar algo, muda-se o HTML e exporta de novo).
// - Avisa se alguma fonte/imagem não carregou ou se ficou algum [PREENCHER] no texto.
// Usa o Chromium/Playwright que já vem no computador (não instala nada).

import { createRequire } from 'node:module';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = await import('playwright')); }

const args = process.argv.slice(2);
const querPptx = args.includes('--pptx');
const [entrada, saida] = args.filter(a => !a.startsWith('--'));
if (!entrada || !saida) {
  console.log('Uso: node _tecnico/scripts/exportar-pdf.mjs <arquivo.html> <pasta-de-saida> [--pptx]');
  process.exit(1);
}
if (!existsSync(entrada)) { console.error('Arquivo não encontrado: ' + entrada); process.exit(1); }
mkdirSync(saida, { recursive: true });
const nome = path.basename(entrada, path.extname(entrada));

const browser = await chromium.launch();
const page = await browser.newPage();
const falhas = [];
page.on('requestfailed', r => falhas.push(r.url()));
await page.goto(pathToFileURL(path.resolve(entrada)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const info = await page.evaluate(() => {
  const paginas = [...document.querySelectorAll('.pagina, .slide')];
  const texto = document.body.innerText;
  const pendentes = (texto.match(/\[PREENCHER[^\]]*\]/g) || []);
  const fontesFalhas = [...document.fonts].filter(f => f.status === 'error').map(f => f.family);
  return { n: paginas.length, pendentes, fontesFalhas };
});

const pdf = path.join(saida, nome + '.pdf');
await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
console.log(`PDF: ${pdf} (${info.n} página(s))`);

if (querPptx) {
  const tmp = path.join(saida, '.slides-tmp');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const els = await page.$$('.slide, .pagina');
  const box0 = await els[0].boundingBox();
  await page.setViewportSize({ width: Math.ceil(box0.width), height: Math.ceil(box0.height) });
  const ctx2 = await browser.newContext({ viewport: { width: Math.ceil(box0.width), height: Math.ceil(box0.height) }, deviceScaleFactor: 2 });
  const p2 = await ctx2.newPage();
  await p2.goto(pathToFileURL(path.resolve(entrada)).href, { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  const els2 = await p2.$$('.slide, .pagina');
  const imgs = [];
  for (let k = 0; k < els2.length; k++) {
    const f = path.join(tmp, String(k + 1).padStart(2, '0') + '.png');
    await els2[k].screenshot({ path: f });
    imgs.push(f);
  }
  const pptx = path.join(saida, nome + '.pptx');
  const py = path.join(path.dirname(fileURLToPath(import.meta.url)), 'imagens-para-pptx.py');
  execFileSync('python3', ['-I', py, pptx, String(box0.width), String(box0.height), ...imgs], { stdio: 'inherit' });
  rmSync(tmp, { recursive: true, force: true });
  console.log(`PowerPoint: ${pptx} (${imgs.length} slide(s))`);
}
await browser.close();

if (info.pendentes.length) console.log(`ATENÇÃO: falta preencher ${info.pendentes.length} campo(s): ${[...new Set(info.pendentes)].join(', ')}`);
if (info.fontesFalhas.length) console.log('ATENÇÃO: fonte(s) não carregaram: ' + info.fontesFalhas.join(', '));
if (falhas.length) console.log('ATENÇÃO: não carregou: ' + falhas.join(', '));
