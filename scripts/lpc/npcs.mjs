/**
 * T-88 step 2 (owner, 2026-11-17): the people of the world rebuilt at the LPC scale, so they stand
 * as tall as Peter. Each NPC is layered from the pinned LPC character-generator sheets (body,
 * head, hair, clothes; art-source/lpc/manifest.json) and every layer is recoloured along a ramp
 * from the character's own design (docs/art/ELDER_DESIGN.md, docs/story/*). Pose: the standing
 * frame of the walk sheet, facing down, with a one-pixel breath in frames 2-3 (4-frame idle, like
 * the 32 px sheets it replaces, so the animations keep their frame numbers).
 *
 * Output (owner approval first): art-source/characters/npcs/lpc_candidates/<name>_idle.png and a
 * preview with the old sprite beside the new one. `--install` copies approved ones to
 * public/assets/lpc/npcs/ and records them in art-source/lpc/derived.json for the credits.
 *
 * Usage: node scripts/lpc/npcs.mjs [--install name,name]
 */
import fs from 'fs';
import { createHash } from 'crypto';
import { readPng } from '../pixel-art/png-read.js';
import { encodePng } from '../pixel-art/pixel.js';
import { renderCredits, readDerived } from './credits.mjs';

const F = 64;
const DOWN_ROW = 2;
const OUT = 'art-source/characters/npcs/lpc_candidates';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Colour ramps, dark to light. */
const R = {
  skinPale: ['#7a5a48', '#c9a58a', '#ead2bc'],
  skinParchment: ['#6e5646', '#9e836b', '#c9b097', '#e2cdb6'],
  skinWarm: ['#6a432c', '#a87454', '#d8a07a', '#f0c49e'],
  skinTan: ['#4a2c1a', '#7c4e30', '#a86e48', '#c98e64'],
  silver: ['#5d6578', '#8c97ad', '#c4ccda', '#e8edf5'],
  greyHair: ['#3e3e44', '#6e6e76', '#a4a4ac', '#d0d0d6'],
  blackHair: ['#0f0c10', '#1e181e', '#352b33', '#4e4048'],
  brownHair: ['#24160f', '#43291b', '#64402a', '#86593a'],
  cowl: ['#0b0d16', '#161a29', '#28324f', '#3a4870'],
  cassock: ['#121620', '#1c2230', '#262d3d', '#3a4458'],
  bronze: ['#3e2c12', '#8c6628', '#c8964a', '#e8c070'],
  slipper: ['#120f0c', '#221d18', '#3a322a'],
  baBaTan: ['#4e3420', '#7a5636', '#a6805a', '#cdb08a'],
  trouserBlack: ['#0c0c10', '#18181e', '#2a2a32', '#3e3e48'],
  scarfCheck: ['#141414', '#4a4a4a', '#9a9a96', '#e6e4dc'],
  sandal: ['#2e1c10', '#5a3a22', '#82583a'],
  fisherShirt: ['#1c2638', '#2e3e5a', '#4a6082', '#7088a8'],
  fisherTrouser: ['#22180f', '#3e2c1c', '#5c432c', '#7a5c40'],
  shelterShirt: ['#3a3640', '#5e5866', '#8a8496', '#b6b0c2'],
  shelterSkirt: ['#2c2a24', '#4a463c', '#6e685a', '#948c7a'],
};

/** Layers bottom to top: [manifest id, ramp or null to keep the colours]. */
const NPCS = {
  elder: {
    old: 'public/assets/npcs/elder_idle.png',
    layers: [
      ['character-cape-solid-bg', R.cowl],
      ['character-weapon-magic-gnarled-universal-background', null],
      ['character-body-bodies-male', R.skinParchment],
      ['character-head-heads-human-male-elderly', R.skinParchment],
      ['character-feet-slippers-male', R.slipper],
      ['character-legs-skirts-plain-male', R.cassock],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.cassock],
      ['character-cape-solid-fg', R.cowl],
      ['character-hat-cloth-hood-adult', R.cowl],
      ['character-beards-beard-medium', R.silver],
      ['character-weapon-magic-gnarled-universal-foreground', null],
    ],
  },
  vendor_ba: {
    old: 'public/assets/npcs/vendor_ba_idle.png',
    layers: [
      ['character-body-bodies-female', R.skinWarm],
      ['character-feet-sandals-thin', R.sandal],
      ['character-legs-pants-thin', R.trouserBlack],
      ['character-torso-clothes-longsleeve-longsleeve-female', R.baBaTan],
      ['character-neck-scarf', R.scarfCheck],
      ['character-head-heads-human-female', R.skinWarm],
      ['character-hair-bangs-bun-adult', R.blackHair],
    ],
  },
  fisherman_sau: {
    old: 'public/assets/npcs/fisherman_sau_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinTan],
      ['character-head-heads-human-male-elderly', R.skinTan],
      ['character-feet-sandals-male', R.sandal],
      ['character-legs-cuffed-male', R.fisherTrouser],
      ['character-torso-clothes-shortsleeve-shortsleeve-male', R.fisherShirt],
      ['character-hair-balding-adult', R.greyHair],
      ['character-beards-beard-basic', R.greyHair],
      ['custom:conical-hat', null],
    ],
  },
  mira: {
    old: 'public/assets/npcs/mira_idle.png',
    layers: [
      ['character-body-bodies-child', R.skinPale],
      ['character-head-heads-human-child', R.skinPale],
      ['character-legs-skirts-child', R.shelterSkirt],
      ['character-torso-clothes-shirt-child', R.shelterShirt],
      ['character-hair-relm-short-child', R.brownHair],
    ],
  },
};

const manifest = JSON.parse(fs.readFileSync('art-source/lpc/manifest.json', 'utf8'));
const byId = new Map(manifest.map((e) => [e.id, e]));
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/** Along a ramp of hex stops, t in 0..1. */
function rampAt(ramp, t) {
  const stops = ramp.map(hex);
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
}

/**
 * Ông Sáu's nón lá (no LPC sheet has one): drawn here, a straw cone over the head with ring lines,
 * lit from the upper left. `top` is the head's highest row.
 */
function conicalHat(top) {
  const px = Buffer.alloc(F * F * 4);
  const [O, D, M, L, Rg] = ['#3e2e18', '#a88a4e', '#d4ba7c', '#ecdaa4', '#8c7240'].map(hex);
  const apex = top - 4;
  const base = top + 10;
  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= F || y >= F) return;
    px.set([...c, 255], (y * F + x) * 4);
  };
  for (let y = apex; y <= base; y++) {
    const half = Math.round(((y - apex) / (base - apex)) * 15);
    for (let x = 32 - half; x <= 32 + half; x++) {
      const edge = x === 32 - half || x === 32 + half || y === base;
      const k = (x - (32 - half)) / Math.max(1, 2 * half);
      const ring = (y - apex) % 5 === 4;
      set(x, y, edge ? O : ring ? Rg : k < 0.35 ? L : k < 0.75 ? M : D);
    }
  }
  set(32, apex - 1, O);
  return px;
}

/** Highest opaque row of a layer. */
function topRow(px) {
  for (let y = 0; y < F; y++) for (let x = 0; x < F; x++) if (px[(y * F + x) * 4 + 3] > 0) return y;
  return 0;
}

/** The standing down-facing frame of one layer, recoloured along its ramp. */
function layerFrame(id, ramp) {
  if (id === 'custom:conical-hat')
    return conicalHat(topRow(layerFrame('character-head-heads-human-male-elderly', null)));
  const e = byId.get(id);
  if (!e) throw new Error(`Unknown LPC layer: ${id}`);
  const img = readPng(e.file);
  const px = Buffer.alloc(F * F * 4);
  for (let y = 0; y < F; y++)
    img.buf.copy(
      px,
      y * F * 4,
      (DOWN_ROW * F + y) * img.w * 4,
      ((DOWN_ROW * F + y) * img.w + F) * 4,
    );
  if (!ramp) return px;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 8) continue;
    const l = lum(px[i], px[i + 1], px[i + 2]);
    lo = Math.min(lo, l);
    hi = Math.max(hi, l);
  }
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 8) continue;
    const t = hi > lo ? (lum(px[i], px[i + 1], px[i + 2]) - lo) / (hi - lo) : 0.5;
    const [r, g, b] = rampAt(ramp, t);
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
  }
  return px;
}

/** Source-over of b onto a (both 64x64 RGBA). */
function over(a, b) {
  for (let i = 0; i < a.length; i += 4) {
    const sa = b[i + 3] / 255;
    if (sa === 0) continue;
    const da = a[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    for (let k = 0; k < 3; k++)
      a[i + k] = Math.round((b[i + k] * sa + a[i + k] * da * (1 - sa)) / oa);
    a[i + 3] = Math.round(oa * 255);
  }
}

/** Lowest opaque row: where the soles are. */
function soles(px) {
  for (let y = F - 1; y >= 0; y--)
    for (let x = 0; x < F; x++) if (px[(y * F + x) * 4 + 3] > 0) return y;
  return F - 1;
}

/** 4 frames: still, still, breath (upper body 1 px down), breath. */
function idleSheet(base) {
  const breathFrom = soles(base) - 18;
  const breath = Buffer.alloc(base.length);
  for (let y = 0; y < F; y++) {
    const src = y < breathFrom && y > 0 ? y - 1 : y;
    base.copy(breath, y * F * 4, src * F * 4, (src + 1) * F * 4);
  }
  const sheet = Buffer.alloc(4 * F * F * 4);
  [base, base, breath, breath].forEach((fr, k) => {
    for (let y = 0; y < F; y++) fr.copy(sheet, (y * 4 * F + k * F) * 4, y * F * 4, (y + 1) * F * 4);
  });
  return sheet;
}

/** Old (32 px, shown 2x) beside new (64 px, 1x), both at `zoom`, on a ground colour. */
function comparison(entries, zoom = 4) {
  const cell = F * zoom;
  const W = entries.length * cell * 2;
  const H = cell;
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < out.length; i += 4) out.set([118, 98, 72, 255], i);
  entries.forEach(([oldImg, frame], k) => {
    const draw = (src, sw, sx0, scale, ox, oy) => {
      for (let y = 0; y < sw; y++)
        for (let x = 0; x < sw; x++) {
          const si = (y * src.w + sx0 + x) * 4;
          if (src.buf[si + 3] < 8) continue;
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++)
              src.buf.copy(out, ((oy + y * scale + dy) * W + ox + x * scale + dx) * 4, si, si + 4);
        }
    };
    // Both stand on the same line: the old 32 px sprite is drawn at the size it has in game (1.5x).
    const oldScale = zoom * 1.5;
    const ox = k * cell * 2;
    draw(
      oldImg,
      32,
      0,
      Math.round(oldScale),
      ox + (cell - 32 * Math.round(oldScale)) / 2,
      H - 32 * Math.round(oldScale) - 2 * zoom,
    );
    draw({ w: F, buf: frame }, F, 0, zoom, ox + cell, 0);
  });
  return { w: W, h: H, buf: out };
}

const install = (process.argv.find((a, i) => process.argv[i - 1] === '--install') ?? '')
  .split(',')
  .filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
const shown = [];
let derived = readDerived();
for (const [name, spec] of Object.entries(NPCS)) {
  const base = Buffer.alloc(F * F * 4);
  for (const [id, ramp] of spec.layers) over(base, layerFrame(id, ramp));
  const sheet = idleSheet(base);
  const png = encodePng(4 * F, F, sheet);
  fs.writeFileSync(`${OUT}/${name}_idle.png`, png);
  shown.push([readPng(spec.old), base]);
  console.log(`${name}: soles at y=${soles(base)}`);
  if (install.includes(name)) {
    const file = `public/assets/lpc/npcs/${name}_idle.png`;
    fs.mkdirSync('public/assets/lpc/npcs', { recursive: true });
    fs.writeFileSync(file, png);
    const id = `derived-npc-${name.replace(/_/g, '-')}`;
    derived = derived.filter((d) => d.id !== id);
    derived.push({
      id,
      file,
      sha256: createHash('sha256').update(png).digest('hex'),
      from: [
        ...new Set(spec.layers.map(([l]) => l).filter((l) => !l.startsWith('custom:'))),
      ].sort(),
      script: 'scripts/lpc/npcs.mjs',
      notes: `${name} at the LPC scale: generator layers recoloured to the character's design, 4-frame idle.`,
    });
    console.log(`  installed ${file}`);
  }
}
const cmp = comparison(shown);
fs.writeFileSync(`${OUT}/preview.png`, encodePng(cmp.w, cmp.h, cmp.buf));
if (install.length) {
  derived.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync('art-source/lpc/derived.json', JSON.stringify(derived, null, 2) + '\n');
  fs.writeFileSync('CREDITS.md', await renderCredits(manifest, derived));
}
