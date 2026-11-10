/**
 * CHRONO – code-authored UI art (Pipeline B, AGENTS.md §5): panel frame, menu cursor, hit spark.
 *
 * Built from docs/art/ART_GUIDE.md / ENVIRONMENT_GUIDE.md palettes (abyssal navy panels, aged
 * bronze trim, chronal cerulean light). Deterministic pixel rules only — no image model, no
 * external reference. Output goes to art-source/ui/generated/candidates/ ONLY; owner approval is
 * required before anything replaces public/assets/ui or public/assets/effects (AGENTS.md §6).
 *
 * Usage: node scripts/author-ui-assets.js [outDir]
 *
 *   ui_frame_<v>.png   48×48 nine-slice panel (16 px corners; edges/centre tile cleanly)
 *   ui_cursor_<v>.png  32×16 = 2 frames × 16 px, pulsing chronal-shard pointer
 *   hit_spark_<v>.png  64×16 = 4 frames × 16 px burst, drawn near-white so it can be tinted
 *                      (cerulean for Peter's hits, carmine for enemy hits)
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';

const VERSION = 'v1';

const PALETTE = {
  O: hex('#05060b'), // outer outline
  n: [10, 13, 24, 242], // panel fill #0a0d18 at ~95% opacity (matches current HUD panels)
  N: [14, 19, 34, 242], // panel inner bevel
  b: hex('#8c6628'), // aged bronze frame
  B: hex('#b88a3e'), // bronze highlight
  k: hex('#5a4019'), // bronze shadow (derived)
  c: hex('#00c8ff'), // chronal cerulean inlay
  a: hex('#88edff'), // luminous apex
  W: hex('#e6f9ff'), // apex white (spark core)
  w: [230, 249, 255, 150], // soft spark glow (semi-transparent so tints read well)
  d: hex('#008ab8'), // dormant cyan
};

const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const put = (g, x, y, ch) => {
  if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = ch;
};

function raster(g) {
  const h = g.length;
  const w = g[0].length;
  const buf = Buffer.alloc(w * h * 4);
  g.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch === '.') return;
      const c = PALETTE[ch];
      if (!c) throw new Error(`unknown palette char "${ch}"`);
      buf.set(c, (y * w + x) * 4);
    }),
  );
  return { w, h, buf };
}

// ------------------------------------------------------------- PANEL FRAME
/**
 * 48×48 nine-slice: 16 px corners carry the ornament; the middle 16 px of each edge and the
 * centre are uniform, so Phaser's NineSlice can stretch them to any panel size.
 */
function panelFrame() {
  const S = 48;
  const g = grid(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const e = Math.min(x, y, S - 1 - x, S - 1 - y); // distance from the edge
      if (e === 0) g[y][x] = 'O';
      else if (e === 1)
        g[y][x] = x <= y && x < S - 1 - y ? 'B' : 'b'; // lit top/left bronze
      else if (e === 2) g[y][x] = 'k';
      else if (e === 3) g[y][x] = 'O';
      else if (e === 4)
        g[y][x] = 'c'; // cerulean inlay line
      else if (e === 5) g[y][x] = 'N';
      else g[y][x] = 'n';
    }
  // Corner ornaments: a small bronze clockwork boss with a cerulean jewel in each corner.
  for (const [cx, cy] of [
    [5, 5],
    [42, 5],
    [5, 42],
    [42, 42],
  ]) {
    for (let y = -3; y <= 3; y++)
      for (let x = -3; x <= 3; x++) {
        const r = Math.hypot(x, y);
        if (r <= 3.4) put(g, cx + x, cy + y, r > 2.5 ? 'O' : r > 1.2 ? 'b' : 'c');
      }
    put(g, cx - 1, cy - 1, 'B');
    put(g, cx, cy, 'a');
    // gear teeth
    for (const [tx, ty] of [
      [0, -4],
      [0, 4],
      [-4, 0],
      [4, 0],
    ])
      put(g, cx + tx, cy + ty, 'b');
  }
  return g;
}

// -------------------------------------------------------------- MENU CURSOR
/** Right-pointing chronal shard; frame 1 is the brighter pulse. */
function cursorFrames() {
  const shape = [
    '................',
    '................',
    '...OO...........',
    '...OaOO.........',
    '...OacaOO.......',
    '...OaccdaOO.....',
    '...OacccddaOO...',
    '...OaccccdddaO..',
    '...OaccccdddaO..',
    '...OacccddaOO...',
    '...OaccdaOO.....',
    '...OacaOO.......',
    '...OaOO.........',
    '...OO...........',
    '................',
    '................',
  ];
  const f0 = shape.map((r) => [...r]);
  const f1 = shape.map((r) => [
    ...r.replace(/d/g, 'c').replace(/c/g, (m, i) => (i % 3 ? 'c' : 'a')),
  ]);
  put(f1, 5, 7, 'W');
  put(f1, 5, 8, 'W');
  const g = grid(32, 16);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      g[y][x] = f0[y][x];
      g[y][16 + x] = f1[y][x];
    }
  return g;
}

// ---------------------------------------------------------------- HIT SPARK
/** 4-frame burst: core flash → 8-ray star → expanding ring of shards → fading motes. */
function sparkFrames() {
  const g = grid(64, 16);
  const c = 7.5;
  const frame = (i, fn) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const ch = fn(x - c, y - c);
        if (ch) g[y][i * 16 + x] = ch;
      }
  };
  frame(0, (x, y) => {
    const r = Math.hypot(x, y);
    return r < 1.6 ? 'W' : r < 3 ? 'w' : null;
  });
  frame(1, (x, y) => {
    const r = Math.hypot(x, y);
    const ray = Math.abs(x) < 0.6 || Math.abs(y) < 0.6 || Math.abs(Math.abs(x) - Math.abs(y)) < 0.6;
    if (r < 1.8) return 'W';
    if (ray && r < 6.5) return r < 4 ? 'W' : 'w';
    return null;
  });
  frame(2, (x, y) => {
    const r = Math.hypot(x, y);
    const ray = Math.abs(x) < 0.6 || Math.abs(y) < 0.6 || Math.abs(Math.abs(x) - Math.abs(y)) < 0.6;
    if (r > 5 && r < 7.3 && ray) return 'W';
    if (r > 4.5 && r < 5.5) return 'w';
    return r < 1 ? 'w' : null;
  });
  frame(3, (x, y) => {
    const r = Math.hypot(x, y);
    const diag = Math.abs(Math.abs(x) - Math.abs(y)) < 0.6;
    return r > 6 && r < 7.6 && diag ? 'w' : null;
  });
  return g;
}

// ------------------------------------------------------------------ PREVIEW
/** Naive nine-slice stretch of the frame to w×h, for review only. */
function nineSlice(frame, w, h, corner = 16) {
  const out = grid(w, h);
  const src = (sx, sy) => frame[sy][sx];
  const map = (d, size, total) =>
    d < corner
      ? d
      : d >= total - corner
        ? size - (total - d)
        : corner + ((d - corner) % (size - 2 * corner));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) out[y][x] = src(map(x, 48, w), map(y, 48, h));
  return out;
}

function scaledOnBg(img, k, bg = [24, 30, 46, 255]) {
  const W = img.w * k;
  const H = img.h * k;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / k) * img.w + Math.floor(x / k)) * 4;
      const a = img.buf[i + 3] / 255;
      const o = (y * W + x) * 4;
      for (let ch = 0; ch < 3; ch++)
        out[o + ch] = Math.round(img.buf[i + ch] * a + bg[ch] * (1 - a));
      out[o + 3] = 255;
    }
  return encodePng(W, H, out);
}

const outDir = path.resolve(process.argv[2] ?? 'art-source/ui/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const frame = panelFrame();
const outputs = [
  ['ui_frame', frame, 6],
  ['ui_cursor', cursorFrames(), 8],
  ['hit_spark', sparkFrames(), 8],
];
for (const [name, g, k] of outputs) {
  const img = raster(g);
  const file = path.join(outDir, `${name}_${VERSION}.png`);
  writeFile(file, encodePng(img.w, img.h, img.buf));
  writeFile(path.join(previewDir, `${name}_${VERSION}_x${k}.png`), scaledOnBg(img, k));
  console.log(`✓ ${path.relative(process.cwd(), file)} (${img.w}x${img.h})`);
}
// The frame stretched to the dialogue-box size used in ExplorationScene (580×84), at 2×.
writeFile(
  path.join(previewDir, `ui_frame_${VERSION}_dialogue_580x84_x2.png`),
  scaledOnBg(raster(nineSlice(frame, 580, 84)), 2),
);
