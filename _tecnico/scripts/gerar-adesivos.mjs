#!/usr/bin/env node
// Gera adesivos personalizados (um por nome) a partir de um modelo HTML, prontos para gráfica.
//
// Uso:
//   node _tecnico/scripts/gerar-adesivos.mjs <modelo.html> <nomes.txt> <pasta-de-saida> [--diametro 60] [--sangria 2] [--dpi 300]
//
// nomes.txt: um nome por linha (linhas vazias e linhas começando com # são ignoradas).
// Medidas em milímetros. O modelo precisa ter um elemento .adesivo e o texto variável em [data-campo=nome].
//
// Sai, para cada pessoa:
//   pdf/NN-nome.pdf  → vetor, no tamanho exato (diâmetro + sangria), fontes embutidas. É o melhor para gráfica.
//   png/NN-nome.png  → imagem 300 dpi com fundo transparente fora do círculo.
// E também:
//   todos.pdf                → todos os adesivos, um por página (mais fácil de mandar para a gráfica).
//   folha-de-conferencia.png → todos lado a lado com a linha de corte (vermelha) e a área segura (azul), para conferir nomes.
// Avisa quando um nome precisou diminuir muito para caber.

import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }

const args = process.argv.slice(2);
const opc = { diametro: 60, sangria: 2, dpi: 300 };
for (const k of Object.keys(opc)) {
  const i = args.indexOf('--' + k);
  if (i >= 0) { opc[k] = Number(args[i + 1]); args.splice(i, 2); }
}
const [modelo, listaArq, saida] = args;
if (!modelo || !listaArq || !saida) {
  console.log('Uso: node _tecnico/scripts/gerar-adesivos.mjs <modelo.html> <nomes.txt> <pasta-de-saida> [--diametro 60] [--sangria 2] [--dpi 300]');
  process.exit(1);
}
for (const f of [modelo, listaArq]) if (!existsSync(f)) { console.error('Não achei: ' + f); process.exit(1); }

const nomes = readFileSync(listaArq, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
if (!nomes.length) { console.error('A lista de nomes está vazia.'); process.exit(1); }

const total = opc.diametro + 2 * opc.sangria;           // mm
const ladoCss = total / 25.4 * 96;                      // px CSS (96 por polegada)
const escala = opc.dpi / 96;                            // para sair em 300 dpi
const ladoPx = Math.round(total / 25.4 * opc.dpi);
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

mkdirSync(path.join(saida, 'pdf'), { recursive: true });
mkdirSync(path.join(saida, 'png'), { recursive: true });
const url = pathToFileURL(path.resolve(modelo)).href;

const browser = await chromium.launch();
const avisos = [];
const pdfs = [];
const pngs = [];
try {
  const ctx = await browser.newContext({ viewport: { width: Math.ceil(ladoCss), height: Math.ceil(ladoCss) }, deviceScaleFactor: escala });
  const page = await ctx.newPage();
  page.on('requestfailed', r => avisos.push('não carregou: ' + r.url()));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(({ d, s }) => {
    document.documentElement.style.setProperty('--diametro', d + 'mm');
    document.documentElement.style.setProperty('--sangria', s + 'mm');
  }, { d: opc.diametro, s: opc.sangria });
  await page.evaluate(() => document.fonts.ready);
  const falhas = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'error').map(f => f.family));
  if (falhas.length) avisos.push('fontes que falharam: ' + [...new Set(falhas)].join(', '));

  for (let n = 0; n < nomes.length; n++) {
    const nome = nomes[n];
    const tam = await page.evaluate(nome => {
      document.querySelectorAll('[data-campo=nome]').forEach(e => { e.textContent = nome; });
      window.ajustarTexto && window.ajustarTexto();
      const c = document.querySelector('.nome');
      return c ? Number(c.dataset.tamanho || 0) : 0;
    }, nome);
    if (tam && tam < 5) avisos.push(`"${nome}": nome longo, a letra ficou com ${tam} mm (confira se está legível)`);

    const base = `${String(n + 1).padStart(2, '0')}-${slug(nome) || 'sem-nome'}`;
    const png = path.join(saida, 'png', base + '.png');
    await page.locator('.adesivo').screenshot({ path: png, omitBackground: true });
    try { execFileSync('convert', [png, '-units', 'PixelsPerInch', '-density', String(opc.dpi), png]); } catch { /* sem ImageMagick: PNG fica sem a marcação de dpi */ }
    pngs.push(png);

    const pdf = path.join(saida, 'pdf', base + '.pdf');
    await page.pdf({ path: pdf, width: total + 'mm', height: total + 'mm', printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    pdfs.push(pdf);
  }

  // PDF único com todos (um por página)
  const todos = await ctx.newPage();
  await todos.goto(url, { waitUntil: 'networkidle' });
  await todos.evaluate(({ nomes, d, s }) => {
    document.documentElement.style.setProperty('--diametro', d + 'mm');
    document.documentElement.style.setProperty('--sangria', s + 'mm');
    const orig = document.querySelector('.adesivo');
    for (const nome of nomes) {
      const c = orig.cloneNode(true);
      c.removeAttribute('id');
      c.querySelectorAll('[data-campo=nome]').forEach(e => { e.textContent = nome; });
      c.style.breakAfter = 'page';
      document.body.appendChild(c);
    }
    orig.remove();
  }, { nomes, d: opc.diametro, s: opc.sangria });
  await todos.evaluate(() => document.fonts.ready);
  await todos.evaluate(() => window.ajustarTexto && window.ajustarTexto());
  await todos.pdf({ path: path.join(saida, 'todos.pdf'), width: total + 'mm', height: total + 'mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  // Folha de conferência: todos lado a lado, com guias
  const col = Math.min(5, nomes.length);
  await todos.evaluate(({ col }) => {
    document.body.classList.add('guias');
    document.body.style.cssText = `background:#e9e6df; display:grid; grid-template-columns:repeat(${col}, max-content); gap:6mm; padding:8mm;`;
    document.querySelectorAll('.adesivo').forEach(a => { a.style.breakAfter = ''; });
  }, { col });
  await todos.setViewportSize({ width: 1600, height: 1000 });
  await todos.screenshot({ path: path.join(saida, 'folha-de-conferencia.png'), fullPage: true });
} finally {
  await browser.close();
}

console.log(`Pronto: ${nomes.length} adesivos de ${opc.diametro} mm (+${opc.sangria} mm de sangria = ${total} mm; PNG ${ladoPx}x${ladoPx} px a ${opc.dpi} dpi)`);
console.log(`  ${path.join(saida, 'pdf')}  (um PDF por pessoa)`);
console.log(`  ${path.join(saida, 'png')}  (um PNG por pessoa)`);
console.log(`  ${path.join(saida, 'todos.pdf')}`);
console.log(`  ${path.join(saida, 'folha-de-conferencia.png')}`);
if (avisos.length) { console.log('Avisos:'); avisos.forEach(a => console.log('  - ' + a)); }
