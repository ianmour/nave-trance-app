#!/usr/bin/env python3
# Uso: lizzie-texturas.py <pasta> [cor base R,G,B] [nome do papel]
# Texturas "vintage" geradas aqui mesmo (sem baixar nada): papel envelhecido escuro com borda rasgada, granulado de filme, poeira.
import numpy as np, sys, os
from PIL import Image, ImageFilter, ImageDraw
out = sys.argv[1]; COR = [int(c) for c in (sys.argv[2] if len(sys.argv) > 2 else '64,47,34').split(',')]; NOME = sys.argv[3] if len(sys.argv) > 3 else 'papel'; os.makedirs(out, exist_ok=True); R = np.random.default_rng(7)
def ruido(w, h, esc):
    n = R.random((h // esc + 2, w // esc + 2)).astype(np.float32)
    return np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255
W, H = 1080, 2160
base = np.array(COR, np.float32)  # marrom escuro (papel kraft envelhecido)
t = 0.5 * ruido(W, H, 300) + 0.3 * ruido(W, H, 60) + 0.2 * ruido(W, H, 6)
img = base[None, None, :] * (0.7 + 0.6 * t[..., None])
fib = R.random((H, W)) > 0.9985  # fibras claras
img[fib] += 35 if base.mean() < 120 else -40
yy, xx = np.mgrid[0:H, 0:W]; d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
img *= (1.15 - 0.9 * d ** 1.6)[..., None]
for _ in range(5):  # manchas
    cx, cy, r = R.integers(0, W), R.integers(0, H), R.integers(120, 380)
    m = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * r * r))); img *= (1 - 0.18 * m)[..., None]
img = np.clip(img, 0, 255).astype(np.uint8)
a = Image.fromarray(img).convert("RGBA")
# borda rasgada em cima e embaixo
al = Image.new("L", (W, H), 0); dr = ImageDraw.Draw(al)
def borda(y0, sinal):
    pts, x = [], 0
    while x <= W: pts.append((x, y0 + sinal * R.integers(0, 26))); x += int(R.integers(6, 22))
    return pts
top, bot = borda(40, 1), borda(H - 40, -1)
dr.polygon(top + [(W, H // 2)] + bot[::-1] + [(0, H // 2)], fill=255)
al = al.filter(ImageFilter.GaussianBlur(1.2)); a.putalpha(al)
# fiapo claro na borda rasgada
lt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lt).line(top, fill=(214, 196, 166, 200), width=5); ImageDraw.Draw(lt).line(bot, fill=(214, 196, 166, 200), width=5)
a = Image.alpha_composite(a, lt); a.save(f"{out}/{NOME}.png")
# granulado: 8 quadros
for k in range(8):
    g = R.normal(128, 38, (960, 540)).clip(0, 255).astype(np.uint8)
    gi = Image.fromarray(g).convert("RGBA"); arr = np.array(gi); arr[..., 3] = 70
    if k % 3 == 0:  # risco vertical + poeira
        x = R.integers(20, 520); arr[:, x:x + 1, :3] = 230; arr[:, x:x + 1, 3] = 120
    for _ in range(int(R.integers(2, 7))):
        cx, cy = R.integers(0, 540), R.integers(0, 960); arr[cy:cy + 3, cx:cx + int(R.integers(2, 9)), :3] = 20; arr[cy:cy + 3, cx:cx + 8, 3] = 200
    Image.fromarray(arr).save(f"{out}/grao{k}.png")
print("ok")
