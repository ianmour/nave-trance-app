#!/usr/bin/env node
// Busca e baixa imagens GRATUITAS (licença CC0 ou CC BY) do Openverse, sem conta e sem custo.
// Guarda o crédito de cada imagem em <pasta>/CREDITOS.md (CC BY exige crédito no post).
// Uso: node _tecnico/scripts/buscar-imagem.mjs "<o que procurar, em inglês funciona melhor>" <pasta-destino> [quantidade=3] [vertical|horizontal|qualquer]
import fs from "node:fs";
import path from "node:path";

const [busca, destino, qtdArg, formato = "qualquer"] = process.argv.slice(2);
if (!busca || !destino) {
  console.log('Uso: node _tecnico/scripts/buscar-imagem.mjs "<busca>" <pasta> [quantidade] [vertical|horizontal|qualquer]');
  process.exit(1);
}
const qtd = parseInt(qtdArg || "3", 10);
const HOSTS_OK = ["live.staticflickr.com", "upload.wikimedia.org"]; // servidores liberados neste computador
const params = new URLSearchParams({ q: busca, license: "cc0,by", page_size: "20" });
if (formato === "vertical") params.set("aspect_ratio", "tall");
if (formato === "horizontal") params.set("aspect_ratio", "wide");

const r = await fetch(`https://api.openverse.org/v1/images/?${params}`);
if (!r.ok) { console.error(`ERRO: busca falhou (${r.status})`); process.exit(1); }
const dados = await r.json();
const candidatos = dados.results
  .filter((x) => HOSTS_OK.includes(new URL(x.url).hostname))
  .filter((x) => (x.height || 0) >= 900 || (x.width || 0) >= 900)
  .sort((a, b) => (a.license === "cc0" ? -1 : 0) - (b.license === "cc0" ? -1 : 0));

fs.mkdirSync(destino, { recursive: true });
const creditos = path.join(destino, "CREDITOS.md");
if (!fs.existsSync(creditos)) fs.writeFileSync(creditos, "# Créditos das imagens\n\nColoque estes créditos na legenda do post quando a licença for CC BY.\n\n");
const base = busca.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
let ok = 0;
for (const c of candidatos) {
  if (ok >= qtd) break;
  try {
    const img = await fetch(c.url);
    const tipo = img.headers.get("content-type") || "";
    if (!img.ok || !tipo.startsWith("image/")) continue;
    const ext = tipo.includes("png") ? "png" : "jpg";
    const arq = path.join(destino, `${base}-${ok + 1}.${ext}`);
    fs.writeFileSync(arq, Buffer.from(await img.arrayBuffer()));
    const cred = c.attribution || `"${c.title}" por ${c.creator} (${c.license.toUpperCase()} ${c.license_version}) — ${c.foreign_landing_url}`;
    fs.appendFileSync(creditos, `- **${path.basename(arq)}** — ${c.license === "cc0" ? "domínio público (CC0), crédito opcional" : cred}\n`);
    console.log(`ok: ${path.basename(arq)} (${c.width}x${c.height}, ${c.license.toUpperCase()}, ${c.source})`);
    ok++;
  } catch { /* tenta a próxima */ }
}
console.log(ok ? `${ok} imagem(ns) em ${destino}` : "Nenhuma imagem baixada: tente outra busca (em inglês costuma achar mais).");
