#!/usr/bin/env node
// Exporta uma peça de design feita em HTML para PNG em alta qualidade.
//
// Uso:
//   node _tecnico/scripts/exportar-design.mjs <peca.html> <pasta-de-saida> [formato] [--escala 1|2]
//
// formato: post (1080x1350, padrão) | story (1080x1920) | reels (1080x1920) | quadrado (1080x1080)
//          ou LARGURAxALTURA (ex.: 1200x628)
//
// Peça única: o próprio <body> é a peça (1 PNG).
// Carrossel: cada lâmina é um elemento com a classe "lamina" (ou atributo data-lamina).
//   Sai um PNG por lâmina: <nome>-01.png, <nome>-02.png...
//
// O PNG sai exatamente no tamanho do formato (ex.: 1080x1350). Com --escala 2 sai em 2x
// (2160x2700), útil para impressão; para Instagram use o padrão.
// Fontes do Google (fonts.googleapis.com) e fontes locais (@font-face) são esperadas antes da foto.
// Usa o Chromium/Playwright que já vem no computador (não instala nada).

import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = await import('playwright')); }

const FORMATOS = {
  post: [1080, 1350], carrossel: [1080, 1350],
  story: [1080, 1920], reels: [1080, 1920], capa: [1080, 1920],
  quadrado: [1080, 1080],
};

const args = process.argv.slice(2);
let escala = 1;
const i = args.indexOf('--escala');
if (i >= 0) { escala = Number(args[i + 1]) || 1; args.splice(i, 2); }
const [entrada, saida, formatoArg = 'post'] = args;

if (!entrada || !saida) {
  console.log(`Uso: node _tecnico/scripts/exportar-design.mjs <peca.html> <pasta-de-saida> [post|story|reels|quadrado|LxA] [--escala 2]
Carrossel: marque cada lâmina com class="lamina" — sai um PNG por lâmina.`);
  process.exit(1);
}
if (!existsSync(entrada)) { console.error(`Não achei o arquivo: ${entrada}`); process.exit(1); }

let tam = FORMATOS[formatoArg.toLowerCase()];
if (!tam) {
  const m = formatoArg.match(/^(\d+)x(\d+)$/i);
  if (!m) { console.error(`Formato desconhecido: ${formatoArg}`); process.exit(1); }
  tam = [Number(m[1]), Number(m[2])];
}
const [largura, altura] = tam;
mkdirSync(saida, { recursive: true });
const nome = path.basename(entrada).replace(/\.html?$/i, '');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala });
  const avisos = [];
  page.on('requestfailed', r => avisos.push(`não carregou: ${r.url()}`));
  page.on('pageerror', e => avisos.push(`erro na página: ${e.message}`));

  await page.goto(pathToFileURL(path.resolve(entrada)).href, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
  });
  await page.waitForTimeout(300);

  const laminas = await page.$$('.lamina, [data-lamina]');
  const gerados = [];
  if (laminas.length === 0) {
    const arq = path.join(saida, `${nome}.png`);
    await page.screenshot({ path: arq, clip: { x: 0, y: 0, width: largura, height: altura } });
    gerados.push(arq);
  } else {
    for (let n = 0; n < laminas.length; n++) {
      const el = laminas[n];
      await el.scrollIntoViewIfNeeded();
      const caixa = await el.boundingBox();
      if (Math.round(caixa.width) !== largura || Math.round(caixa.height) !== altura) {
        avisos.push(`lâmina ${n + 1} mede ${Math.round(caixa.width)}x${Math.round(caixa.height)}, esperado ${largura}x${altura}`);
      }
      const arq = path.join(saida, `${nome}-${String(n + 1).padStart(2, '0')}.png`);
      await el.screenshot({ path: arq });
      gerados.push(arq);
    }
  }
  const falhasFonte = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'error').map(f => f.family));
  if (falhasFonte.length) avisos.push(`fontes que falharam: ${[...new Set(falhasFonte)].join(', ')}`);

  console.log(`Pronto: ${gerados.length} imagem(ns) ${largura * escala}x${altura * escala}`);
  gerados.forEach(g => console.log('  ' + g));
  if (avisos.length) { console.log('Avisos:'); avisos.forEach(a => console.log('  - ' + a)); }
} finally {
  await browser.close();
}
