// Action frames for monsters, bosses and Peter (owner, 2026-11-18: "khung hoạt ảnh nhân vật").
//
// Every frame is derived from the character's own approved idle frame by pixel transforms, so the
// approved designs are never redrawn: shear (lean), squash / stretch anchored at the soles, shift,
// flash, kneel, and a dissolve into rising motes. Sprites face right (the game flips them).
//
//   attack 0-3: wind back, lunge, strike, recover
//   hurt   4-5: recoil (flash), settle
//   death  6-11: recoil, kneel, sink, dissolve x3     (Peter: 'fall', no dissolve)
//
// Usage:
//   node scripts/pixel-art/action-frames.mjs            write every sheet in ACTORS
//   node scripts/pixel-art/action-frames.mjs --preview <out.png> [key ...]   contact sheet only
import fs from 'node:fs';
import path from 'node:path';
import { readPng } from './png-read.js';
import { encodePng } from './pixel.js';

export const ATTACK = [0, 1, 2, 3];
export const HURT = [4, 5];
export const DEATH = [6, 7, 8, 9, 10, 11];
export const ACTION_FRAMES = 12;

/** One S x S RGBA frame cut from a sheet. */
function cut(img, S, index, row = 0) {
  const cols = Math.floor(img.w / S);
  const cx = (index % cols) * S;
  const cy = (row + Math.floor(index / cols)) * S;
  const out = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++)
    img.buf.copy(out, y * S * 4, ((cy + y) * img.w + cx) * 4, ((cy + y) * img.w + cx + S) * 4);
  return out;
}

function bounds(px, S) {
  let top = S,
    bottom = -1,
    left = S,
    right = -1;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++)
      if (px[(y * S + x) * 4 + 3] > 0) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
  return bottom < 0
    ? { top: 0, bottom: S - 1, left: 0, right: S - 1 }
    : { top, bottom, left, right };
}

/**
 * The figure re-sampled (nearest) with its soles fixed: lean = px the top row shifts right
 * (rows below shift less, the soles not at all), sx / sy scale about the bottom centre, dx / dy move.
 */
function pose(px, S, { lean = 0, sx = 1, sy = 1, dx = 0, dy = 0 } = {}) {
  const b = bounds(px, S);
  const cx = (b.left + b.right) / 2;
  const h = Math.max(1, b.bottom - b.top);
  const out = Buffer.alloc(px.length);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      // Inverse map: where in the source does this pixel come from?
      const ty = y - dy;
      const srcY = Math.round(b.bottom - (b.bottom - ty) / sy);
      if (srcY < 0 || srcY >= S) continue;
      const t = (b.bottom - srcY) / h; // 0 at the soles, 1 at the top
      const tx = x - dx - lean * t;
      const srcX = Math.round(cx + (tx - cx) / sx);
      if (srcX < 0 || srcX >= S) continue;
      const si = (srcY * S + srcX) * 4;
      if (!px[si + 3]) continue;
      px.copy(out, (y * S + x) * 4, si, si + 4);
    }
  return out;
}

/** Colours pulled toward white (a hit flash) or darkened (k < 0). */
function tone(px, k) {
  const out = Buffer.from(px);
  for (let i = 0; i < out.length; i += 4) {
    if (!out[i + 3]) continue;
    for (let c = 0; c < 3; c++)
      out[i + c] =
        k >= 0 ? Math.round(out[i + c] + (255 - out[i + c]) * k) : Math.round(out[i + c] * (1 + k));
  }
  return out;
}

/** Sunk to the knees: the legs fold to `fold` of their height under the waist. */
function kneel(px, S, fold = 0.5) {
  const b = bounds(px, S);
  const waist = Math.round(b.top + (b.bottom - b.top) * 0.58);
  const drop = Math.round((b.bottom - waist) * (1 - fold));
  const out = Buffer.alloc(px.length);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      if (!px[i + 3]) continue;
      const ny = y < waist ? y + drop : waist + drop + Math.round((y - waist) * fold);
      if (ny >= S) continue;
      px.copy(out, (ny * S + x) * 4, i, i + 4);
    }
  return out;
}

/** A stable per-pixel noise in [0, 1). */
const noise = (x, y) => {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/**
 * Dissolve: pixels whose noise is below `cut` are gone; a band just above it glows and drifts up
 * `rise` px as motes, the rest stays (darkened a little).
 */
function dissolve(px, S, cut, rise) {
  const out = Buffer.alloc(px.length);
  const band = 0.18;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      if (!px[i + 3]) continue;
      // The top dissolves first: the noise is biased by height.
      const n = noise(x, y) * 0.75 + (y / S) * 0.25;
      if (n < cut) continue;
      if (n < cut + band) {
        const ny = y - rise - Math.round(noise(y, x) * rise);
        if (ny < 0) continue;
        const o = (ny * S + x) * 4;
        out[o] = Math.min(255, px[i] + 140);
        out[o + 1] = Math.min(255, px[i + 1] + 140);
        out[o + 2] = Math.min(255, px[i + 2] + 160);
        out[o + 3] = 230;
        continue;
      }
      const o = i;
      for (let c = 0; c < 3; c++) out[o + c] = Math.round(px[i + c] * 0.78);
      out[o + 3] = px[i + 3];
    }
  return out;
}

/** The 12 action frames of one figure (S x S each, facing right). */
export function actionFrames(base, S, { fall = false } = {}) {
  const k = S / 64; // moves scale with the frame size
  const r = (v) => Math.round(v * k);
  const frames = [
    // attack: wind back, lunge, strike, recover
    pose(base, S, { lean: -r(4), sx: 1.06, sy: 0.91, dx: -r(1) }),
    pose(base, S, { lean: r(6), sx: 0.96, sy: 1.05, dx: r(4) }),
    pose(base, S, { lean: r(7), sx: 1.03, sy: 0.97, dx: r(6) }),
    pose(base, S, { lean: r(2), dx: r(2) }),
    // hurt: recoil with a flash, settle
    tone(pose(base, S, { lean: -r(5), dx: -r(3), sx: 0.97, sy: 1.02 }), 0.4),
    pose(base, S, { lean: -r(1), dx: -r(1) }),
  ];
  const recoil = tone(pose(base, S, { lean: -r(5), dx: -r(3) }), 0.35);
  const knee = pose(kneel(base, S, 0.55), S, { lean: r(2) });
  const sunk = tone(pose(kneel(base, S, 0.3), S, { lean: r(4), sy: 0.92 }), -0.15);
  if (fall) {
    // Peter does not dissolve: he falls to his knees and stays down.
    const down = tone(pose(kneel(base, S, 0.2), S, { lean: r(6), sy: 0.86 }), -0.25);
    frames.push(recoil, knee, sunk, down, down, down);
  } else {
    frames.push(
      recoil,
      knee,
      sunk,
      dissolve(sunk, S, 0.25, r(2)),
      dissolve(sunk, S, 0.55, r(5)),
      dissolve(sunk, S, 0.85, r(9)),
    );
  }
  return frames;
}

function strip(frames, S) {
  const n = frames.length;
  const out = Buffer.alloc(n * S * S * 4);
  frames.forEach((f, k) => {
    for (let y = 0; y < S; y++) f.copy(out, (y * n * S + k * S) * 4, y * S * 4, (y + 1) * S * 4);
  });
  return out;
}

/**
 * Every animated actor, read from PreloadScene so the list never drifts: each `enemy_*` / `boss_*`
 * sheet (64 or 96 px), Kuro's duel sheet, and Peter's three costume stages (down-facing idle).
 * [key, source, frame size, base frame index, options]
 */
function actors() {
  const pre = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
  const list = [];
  const seen = new Set();
  const add = (key, file, size) => {
    if (seen.has(key) || ![64, 96].includes(size)) return;
    seen.add(key);
    list.push([key, `public/${file}`, size]);
  };
  for (const m of pre.matchAll(
    /\['((?:enemy|boss)_[a-z0-9_]+|npc_kuro)', '([^']+\.png)', (\d+)\]/g,
  ))
    add(m[1], m[2], Number(m[3]));
  for (const m of pre.matchAll(
    /spritesheet\('((?:enemy|boss)_[a-z0-9_]+)', '([^']+\.png)', \{\s*frameWidth: (\d+)/g,
  ))
    add(m[1], m[2], Number(m[3]));
  for (const key of ['peter', 'peter_s2', 'peter_s3'])
    list.push([key, `public/assets/characters/peter/${key}_idle.png`, 64, 0, { fall: true }]);
  return list;
}
export const ACTORS = actors();

const outFile = (key) => `public/assets/actions/${key}_act.png`;

function build(key, src, S, index = 0, opts = {}) {
  const img = readPng(src);
  const base = cut(img, S, index);
  return strip(actionFrames(base, S, opts), S);
}

const args = process.argv.slice(2);
if (args[0] === '--preview') {
  // A contact sheet at 3x: one row per actor, its idle frame then the 12 action frames.
  const outPng = args[1];
  const keys = args.slice(2);
  const list = ACTORS.filter((a) => keys.length === 0 || keys.includes(a[0]));
  const Z = 3;
  const cell = 96 * Z + 6;
  const W = cell * (ACTION_FRAMES + 1);
  const H = cell * list.length;
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < out.length; i += 4) out.set([26, 30, 44, 255], i);
  list.forEach(([key, src, S, index = 0, opts = {}], row) => {
    const img = readPng(src);
    const base = cut(img, S, index);
    const frames = [base, ...actionFrames(base, S, opts)];
    frames.forEach((f, col) => {
      const ox = col * cell + 3 + ((96 - S) * Z) / 2;
      const oy = row * cell + 3 + (96 - S) * Z;
      for (let y = 0; y < S * Z; y++)
        for (let x = 0; x < S * Z; x++) {
          const si = (Math.floor(y / Z) * S + Math.floor(x / Z)) * 4;
          if (!f[si + 3]) continue;
          const di = ((oy + y) * W + ox + x) * 4;
          const a = f[si + 3] / 255;
          for (let c = 0; c < 3; c++)
            out[di + c] = Math.round(f[si + c] * a + out[di + c] * (1 - a));
        }
    });
    void key;
  });
  fs.writeFileSync(outPng, encodePng(W, H, out));
  console.log('preview', outPng, list.map((a) => a[0]).join(', '));
} else {
  for (const [key, src, S, index = 0, opts = {}] of ACTORS) {
    const file = outFile(key);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, encodePng(S * ACTION_FRAMES, S, build(key, src, S, index, opts)));
  }
  // The runtime list (PreloadScene loads these; ActorActions plays them).
  const ts = [
    '// Generated by scripts/pixel-art/action-frames.mjs: every sheet with action frames.',
    'export const ACTION_SHEETS: Record<string, number> = {',
    ...ACTORS.map(([key, , S]) => `  ${key}: ${S},`),
    '};',
    '',
  ].join('\n');
  fs.writeFileSync('src/systems/animation/actionSheets.generated.ts', ts);
  console.log('action sheets', ACTORS.length);
}
