/**
 * T-88: Chapters 0-5 reskinned in LPC art (owner, 2026-11-17).
 *
 * Each old tileset is rebuilt slot for slot: tile N of the new atlas means what tile N meant, so
 * maps, collision ranges, tile swaps (puzzles) and layer variants are untouched; maps.json only
 * points the chapter 0-5 maps at the new image. Floors and walls take LPC materials, tinted per
 * tileset; tiles that carried a drawn detail (glyphs, cracks, puddles, tufts) keep that detail,
 * cut from the old tile and laid on the LPC floor; story props (sundials, portals, crystals,
 * bells...) keep their approved Pipeline B art.
 *
 * It also writes a strip of wall tops per tileset ("caps"): the engine draws a wall's top on the
 * walkable tile north of it, above the actors, so walls stand two tiles tall in 3/4 view while the
 * collision stays one tile (public/assets/data/lpc.json).
 *
 * Usage: node scripts/lpc/reskin.mjs   (idempotent)
 */
import fs from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readPng } from '../pixel-art/png-read.js';
import { encodePng } from '../pixel-art/pixel.js';
import { renderCredits } from './credits.mjs';

const T = 32;
const RAW = 'art-source/lpc/raw/tiles/';
const IND = RAW + 'Final Attributions/Individual Assets/';
const SRC = {
  TER: RAW + 'Terrain and Outside.png',
  OBJ: RAW + 'Outside Objects.png',
  SAND: IND + 'Daniel Eddeland (Daneeklu)/sand.png',
  MOUNT: IND + 'Sharm/mountains.png',
  ADOBE: IND + 'Sharm/adobe.png',
  WATER: IND + 'Sharm/water.png',
  GRASS: IND + 'Sharm/grass.png',
  CEMENT: IND + 'Sharm/cement.png',
  DUNG: IND + 'Sharm/dungeon.png',
  CFLOOR: IND + 'Daniel Armstrong (Aka HughSpectrum)/castlefloors.png',
  CWALL: IND + 'Daniel Armstrong (Aka HughSpectrum)/castlewalls.png',
};
const sheets = Object.fromEntries(Object.entries(SRC).map(([k, f]) => [k, readPng(f)]));

/** LPC materials: [sheet, col, row] plus an optional tone, or a stack of them (first is lowest). */
const SAND_TONE = { sat: 0.5, bright: 0.93, sepia: 0.15 };
const MAT = {
  SAND_M: [['SAND', 1, 3, SAND_TONE]],
  SAND_A: [['SAND', 0, 5, SAND_TONE]],
  SAND_B: [['SAND', 1, 5, SAND_TONE]],
  SAND_C: [['SAND', 2, 5, SAND_TONE]],
  DIRT_M: [['TER', 1, 3]],
  DIRT_A: [['TER', 0, 5]],
  DIRT_B: [['TER', 1, 5]],
  DIRT_C: [['TER', 2, 5]],
  DIRT_DARK: [['TER', 4, 5]],
  DIRT_DARK_B: [['TER', 3, 5]],
  DIRT_RED: [['TER', 7, 5]],
  GRASS_M: [['GRASS', 1, 3]],
  DARK_GRASS: [['GRASS', 1, 5, { sat: 0.7, bright: 0.62 }]],
  WATER_M: [['WATER', 1, 3]],
  WATER_SHORE: [
    ['SAND', 1, 3, SAND_TONE],
    ['WATER', 1, 2],
  ],
  PAVE_A: [['CFLOOR', 5, 5]],
  PAVE_B: [['CFLOOR', 6, 5]],
  PAVE_C: [['CFLOOR', 7, 6]],
  CEMENT_M: [['CEMENT', 1, 3]],
  CEMENT_B: [['CEMENT', 1, 5, { sat: 0.4, bright: 0.8 }]],
  PLASTER: [['CEMENT', 1, 3, { sat: 0.3, bright: 1.25, sepia: 0.25 }]],
  WALL_FACE: [['CWALL', 1, 7]],
  WALL_FACE_B: [['CWALL', 2, 8]],
  WALL_TOP: [['CWALL', 1, 6]],
  BRICK: [['DUNG', 1, 1]],
  BRICK_TOP: [['DUNG', 1, 0]],
  WOOD: [['OBJ', 22, 15]],
  WOOD_DARK: [['OBJ', 22, 15, { bright: 0.7 }]],
  CLIFF: [['MOUNT', 6, 3]],
  CLIFF_TOP: [['MOUNT', 6, 1]],
  HEDGE: [['GRASS', 1, 3, { sat: 0.6, bright: 0.45 }]],
  FOREST_GRASS: [['GRASS', 1, 5, { sat: 0.7, bright: 0.6 }]],
  DIRT_EMBER: [['TER', 1, 5, { sat: 1.25, bright: 0.85 }]],
  PALISADE: [['ADOBE', 6, 6]],
  PALISADE_TOP: [['ADOBE', 6, 5]],
  // Chapters 6-9 (owner, 2026-11-18): temple marble, void ash, foundry steel, nexus inlay.
  ORNATE_PALE: [['CFLOOR', 7, 2, { sat: 0.15, bright: 1.3 }]],
  ORNATE_DARK: [['CFLOOR', 2, 2, { sat: 0.8, bright: 0.6 }]],
  ORNATE_MID: [['CFLOOR', 2, 2, { sat: 0.7, bright: 0.9 }]],
  VOID_COBBLE: [['CFLOOR', 5, 5, { sat: 0.5, bright: 0.55 }]],
  ASH_STONE: [['CEMENT', 1, 5, { sat: 0.3, bright: 0.72 }]],
  ASH_SAND: [['SAND', 1, 3, { sat: 0.25, bright: 0.85 }]],
  STEEL: [['CEMENT', 1, 3, { sat: 0.2, bright: 0.78 }]],
};

/**
 * Per tileset: the tint laid over its LPC materials, and for each gid either a material, or
 * [material, detailFrom] (the old tile's drawn detail over the material: pixels that differ from
 * the old plain tile `detailFrom`). Gids not listed keep their old art. `caps`: wall gid -> top.
 */
const D_FAMILY = {
  1: null,
  2: 'PAVE_A',
  10: 'PAVE_B',
  3: ['PAVE_A', 2],
  9: ['PAVE_B', 10],
  15: ['PAVE_A', 2],
  4: 'WALL_FACE_B',
  5: 'WALL_FACE',
};
/**
 * Soft terrain edges (T-88): where two ground kinds meet, the higher kind's LPC border pieces are
 * drawn over the lower kind (sand into water, grass into dirt...). Each kind: [sheet, tone, block
 * column] of a standard LPC terrain block (border 3x3 at rows 2-4, inner corners at rows 0-1).
 */
/** Flat ground decor per kind (T-88): single LPC tiles laid on a few cells, never blocking. */
const PEBBLES_GREY = [
  ['TER', 30, 16],
  ['TER', 31, 16],
  ['TER', 30, 20],
  ['TER', 30, 21],
];
const PEBBLES_SAND = [
  ['TER', 30, 19],
  ['TER', 31, 19],
  ['TER', 30, 22],
];
const LEAVES_DRY = [
  ['OBJ', 12, 12],
  ['OBJ', 14, 12],
  ['OBJ', 15, 12],
];
const GREENS = [
  ['OBJ', 16, 8],
  ['OBJ', 18, 8],
  ['OBJ', 28, 2],
  ['OBJ', 29, 2],
  ['OBJ', 31, 2],
  ['OBJ', 20, 8],
];
const DECOR_FOR = {
  SAND: PEBBLES_SAND,
  DIRT: [...PEBBLES_GREY, ...LEAVES_DRY.slice(0, 1)],
  DIRT_DARK: [...PEBBLES_GREY, ...LEAVES_DRY],
  FOREST_GRASS: GREENS,
  ASH: PEBBLES_GREY,
  CEMENT: PEBBLES_GREY.slice(0, 2),
};

const EDGE_KIND = {
  SAND: ['SAND', SAND_TONE, 0],
  DIRT: ['TER', null, 0],
  DIRT_DARK: ['TER', null, 3],
  FOREST_GRASS: ['GRASS', { sat: 0.7, bright: 0.6 }, 0],
  WATER: ['WATER', null, 0],
  CEMENT: ['CEMENT', null, 0],
  ASH: ['CEMENT', { sat: 0.4, bright: 0.8 }, 0],
};
/** Border pieces, in frame order: TL T TR L R BL B BR, then inner corners for a missing SE SW NE NW. */
const EDGE_PIECES = [
  [0, 2],
  [1, 2],
  [2, 2],
  [0, 3],
  [2, 3],
  [0, 4],
  [1, 4],
  [2, 4],
  [1, 0],
  [2, 0],
  [1, 1],
  [2, 1],
  [0, 1],
];
/** Per tileset: ground kinds by gid, highest kind first (it is drawn over the ones after it). */
const EDGES = {
  coastal_tileset: [
    ['WATER', [17]],
    ['DIRT', [3, 15, 12]],
    ['SAND', [1, 2, 4, 14]],
  ],
  wilds_tileset: [
    ['WATER', [17]],
    ['FOREST_GRASS', [2]],
    ['DIRT', [3]],
    ['DIRT_DARK', [1, 4, 5, 6, 7]],
  ],
  warfield_tileset: [
    ['DIRT', [1, 2, 3, 4, 44, 46, 48]],
    ['ASH', [47]],
  ],
  interval_tileset: [
    ['DIRT', [22]],
    ['CEMENT', [48]],
  ],
  // Chapters 6-9: maps mix a main ground with scattered cells of its pair; soft edges turn the
  // scattered sand and dark earth into patches instead of a chequerboard.
  voidcore_tileset: [
    ['SAND', [48]],
    ['ASH', [45]],
  ],
  convergence_tileset: [
    ['SAND', [49]],
    ['DIRT_DARK', [52]],
    ['CEMENT', [50, 51, 53, 54]],
  ],
};

const TILESETS = {
  coastal_tileset: {
    tint: ['#ffd8b0', 0.1],
    map: {
      1: 'SAND_M',
      2: 'SAND_A',
      4: ['SAND_B', 1],
      14: 'SAND_C',
      3: 'DIRT_M',
      15: 'DIRT_B',
      12: ['DIRT_A', 3],
      5: 'BRICK',
      10: ['BRICK', 5],
      21: 'BRICK',
      22: ['BRICK', 21],
      6: 'WOOD',
      7: 'WOOD',
      8: 'WOOD_DARK',
      23: 'WOOD_DARK',
      9: 'WATER_SHORE',
      17: 'WATER_M',
      18: 'PLASTER',
      19: ['PLASTER', 18],
    },
    caps: { 21: 'BRICK_TOP', 22: 'BRICK_TOP', 18: 'PLASTER', 19: 'PLASTER', 23: 'WOOD_DARK' },
  },
  dungeon_tileset: {
    tint: ['#8090c0', 0.35],
    map: D_FAMILY,
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  sunken_tileset: {
    tint: ['#5fb0a4', 0.42],
    map: { ...D_FAMILY, 22: 'PAVE_C', 23: ['PAVE_C', 22], 27: ['PAVE_C', 22], 28: ['PAVE_C', 22] },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  interval_tileset: {
    tint: ['#a08ad0', 0.42],
    map: { ...D_FAMILY, 22: 'DIRT_M', 48: 'CEMENT_M' },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  steel_tileset: {
    tint: ['#a8a8b4', 0.3],
    map: { ...D_FAMILY, 31: 'WOOD' },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  wilds_tileset: {
    tint: ['#90a4ac', 0.18],
    map: {
      1: 'DIRT_DARK',
      2: 'FOREST_GRASS',
      3: 'DIRT_M',
      4: 'DIRT_DARK_B',
      5: ['DIRT_DARK', 4],
      6: ['DIRT_DARK', 4],
      7: ['DIRT_DARK', 4],
      8: 'PAVE_A',
      9: ['PAVE_A', 8],
      10: ['PAVE_B', 8],
      12: 'PAVE_C',
      13: ['PAVE_C', 12],
      17: 'WATER_M',
      19: 'CLIFF',
      20: 'HEDGE',
    },
    caps: { 19: 'CLIFF_TOP' },
  },
  // Chapters 6-9 share the dungeon layout for gids 1-15 (floors, walls, doors) and add their own
  // grounds; starfields, gold rings and story props keep their art.
  celestial_tileset: {
    late: true,
    tint: ['#fff0d0', 0.15],
    // 47, the void's stepping stones, tiles whole floors: a dark cobbled path instead of ovals.
    map: { ...D_FAMILY, 48: 'ORNATE_PALE', 47: 'VOID_COBBLE' },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  voidcore_tileset: {
    late: true,
    tint: ['#8a70c0', 0.35],
    map: { ...D_FAMILY, 45: 'ASH_STONE', 48: 'ASH_SAND' },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  convergence_tileset: {
    late: true,
    tint: ['#d89860', 0.22],
    map: {
      ...D_FAMILY,
      49: 'SAND_M',
      50: 'STEEL',
      51: 'PLASTER',
      52: 'DIRT_DARK',
      53: 'PAVE_B',
      54: 'CEMENT_M',
    },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  nexus_tileset: {
    late: true,
    tint: ['#a080e0', 0.22],
    map: {
      ...D_FAMILY,
      // One family of violet inlay for the whole chapter; the starfield cells sprinkled through
      // every floor become dark inlay with their stars (and cracks) kept: stars, not holes.
      49: 'ORNATE_DARK',
      50: ['ORNATE_DARK', 49],
      52: 'ORNATE_MID',
      60: 'ORNATE_MID',
      54: ['ORNATE_DARK', 1],
      58: ['ORNATE_DARK', 1],
      59: ['ORNATE_DARK', 1],
    },
    caps: { 4: 'WALL_TOP', 5: 'WALL_TOP' },
  },
  warfield_tileset: {
    tint: ['#c89070', 0.18],
    map: {
      // The old maps scatter gids 1-4 at random: one dirt family, so no chequerboard.
      1: 'DIRT_A',
      2: 'DIRT_B',
      3: 'DIRT_C',
      4: 'DIRT_M',
      12: 'PAVE_A',
      44: ['DIRT_A', 1],
      45: 'WOOD',
      46: ['DIRT_M', 4],
      47: 'CEMENT_B',
      48: 'DIRT_EMBER',
      18: 'CLIFF',
      50: 'PALISADE',
    },
    caps: { 18: 'CLIFF_TOP', 50: 'PALISADE_TOP' },
  },
};

// ---------------------------------------------------------------- pixels
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function tone(px, { sat = 1, bright = 1, sepia = 0 } = {}) {
  for (let i = 0; i < px.length; i += 4) {
    let [r, g, b] = [px[i], px[i + 1], px[i + 2]];
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    r = grey + (r - grey) * sat;
    g = grey + (g - grey) * sat;
    b = grey + (b - grey) * sat;
    const sr = 0.393 * r + 0.769 * g + 0.189 * b;
    const sg = 0.349 * r + 0.686 * g + 0.168 * b;
    const sb = 0.272 * r + 0.534 * g + 0.131 * b;
    px[i] = Math.min(255, (r * (1 - sepia) + sr * sepia) * bright);
    px[i + 1] = Math.min(255, (g * (1 - sepia) + sg * sepia) * bright);
    px[i + 2] = Math.min(255, (b * (1 - sepia) + sb * sepia) * bright);
  }
}
/** Pulls colours towards a tint, keeping their lightness. */
function tint(px, color, amount) {
  const [tr, tg, tb] = hexRgb(color);
  const tl = (0.299 * tr + 0.587 * tg + 0.114 * tb) / 255;
  for (let i = 0; i < px.length; i += 4) {
    const l = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
    const k = l / Math.max(0.05, tl);
    px[i] = Math.min(255, px[i] * (1 - amount) + tr * k * amount);
    px[i + 1] = Math.min(255, px[i + 1] * (1 - amount) + tg * k * amount);
    px[i + 2] = Math.min(255, px[i + 2] * (1 - amount) + tb * k * amount);
  }
}
function cut(img, c, r) {
  const px = Buffer.alloc(T * T * 4);
  for (let y = 0; y < T; y++)
    img.buf.copy(
      px,
      y * T * 4,
      ((r * T + y) * img.w + c * T) * 4,
      ((r * T + y) * img.w + c * T + T) * 4,
    );
  return px;
}
/** Source-over of b onto a. */
function over(a, b) {
  for (let i = 0; i < a.length; i += 4) {
    const al = b[i + 3] / 255;
    if (al === 0) continue;
    for (let k = 0; k < 3; k++) a[i + k] = a[i + k] * (1 - al) + b[i + k] * al;
    a[i + 3] = Math.max(a[i + 3], b[i + 3]);
  }
}
const used = new Set();
function material(name) {
  const stack = MAT[name];
  if (!stack) throw new Error(`unknown material ${name}`);
  const px = Buffer.alloc(T * T * 4);
  for (const [sheet, c, r, t] of stack) {
    const layer = cut(sheets[sheet], c, r);
    if (t) tone(layer, t);
    over(px, layer);
    used.add(sheet);
  }
  return px;
}
/**
 * The old tile's drawn detail (glyphs, cracks, puddles, tufts): pixels that clearly differ from
 * the plain old tile AND stand out by colour or light — the old floor's grey noise stays behind.
 */
function detail(oldTile, plain) {
  const px = Buffer.alloc(T * T * 4);
  const lum = (b, i) => 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2];
  const sat = (b, i) => Math.max(b[i], b[i + 1], b[i + 2]) - Math.min(b[i], b[i + 1], b[i + 2]);
  for (let i = 0; i < px.length; i += 4) {
    const d =
      Math.abs(oldTile[i] - plain[i]) +
      Math.abs(oldTile[i + 1] - plain[i + 1]) +
      Math.abs(oldTile[i + 2] - plain[i + 2]);
    const stands =
      sat(oldTile, i) > 55 ||
      lum(oldTile, i) > lum(plain, i) + 45 ||
      lum(oldTile, i) < lum(plain, i) - 45;
    if (d > 70 && stands && oldTile[i + 3] > 0) oldTile.copy(px, i, i, i + 4);
  }
  return px;
}

// ---------------------------------------------------------------- build
fs.mkdirSync('public/assets/lpc', { recursive: true });
const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('art-source/lpc/manifest.json', 'utf8'));
const derivedFile = 'art-source/lpc/derived.json';
let derived = fs.existsSync(derivedFile) ? JSON.parse(fs.readFileSync(derivedFile, 'utf8')) : [];
const lpcData = { tilesets: {} };
let touched = 0;
for (const [name, ts] of Object.entries(TILESETS)) {
  used.clear();
  const old = readPng(`public/assets/tilesets/${name}.png`);
  const cols = old.w / T;
  const count = cols * (old.h / T);
  const out = Buffer.from(old.buf);
  const oldTile = (gid) => cut(old, (gid - 1) % cols, Math.floor((gid - 1) / cols));
  for (const [gidS, spec] of Object.entries(ts.map)) {
    const gid = Number(gidS);
    if (!spec || gid > count) continue;
    const [mat, from] = Array.isArray(spec) ? spec : [spec, null];
    const px = material(mat);
    tint(px, ts.tint[0], ts.tint[1]);
    if (from) over(px, detail(oldTile(gid), oldTile(from)));
    const ox = ((gid - 1) % cols) * T;
    const oy = Math.floor((gid - 1) / cols) * T;
    for (let y = 0; y < T; y++)
      px.copy(out, ((oy + y) * old.w + ox) * 4, y * T * 4, (y + 1) * T * 4);
  }
  const atlasFile = `public/assets/lpc/${name}_lpc.png`;
  const png = encodePng(old.w, old.h, out);
  fs.writeFileSync(atlasFile, png);
  // Wall tops, one per capped gid, in a strip.
  const capGids = Object.keys(ts.caps);
  const capBuf = Buffer.alloc(capGids.length * T * T * 4);
  const caps = {};
  capGids.forEach((g, i) => {
    const px = material(ts.caps[g]);
    tint(px, ts.tint[0], ts.tint[1]);
    for (let y = 0; y < T; y++)
      px.copy(capBuf, (y * capGids.length * T + i * T) * 4, y * T * 4, (y + 1) * T * 4);
    caps[g] = i;
  });
  const capsFile = `public/assets/lpc/${name}_caps.png`;
  const capsPng = encodePng(capGids.length * T, T, capBuf);
  fs.writeFileSync(capsFile, capsPng);
  lpcData.tilesets[name] = {
    caps: { key: `${name}_caps`, path: capsFile.replace('public/', ''), frames: caps },
  };
  // Soft edges: 12 border pieces per ground kind, tinted like the tileset.
  const edgeFiles = [];
  if (EDGES[name]) {
    const kinds = EDGES[name];
    const decorCount = kinds.reduce((sum, [kind]) => sum + (DECOR_FOR[kind]?.length ?? 0), 0);
    const n = kinds.length * EDGE_PIECES.length + decorCount;
    const ebuf = Buffer.alloc(n * T * T * 4);
    const kindOf = {};
    const decor = {};
    let next = kinds.length * EDGE_PIECES.length;
    const putFrame = (px, f) => {
      for (let y = 0; y < T; y++)
        px.copy(ebuf, (y * n * T + f * T) * 4, y * T * 4, (y + 1) * T * 4);
    };
    kinds.forEach(([kind, gids], k) => {
      const [sheet, t, bx] = EDGE_KIND[kind];
      used.add(sheet);
      for (const g of gids) kindOf[g] = k;
      EDGE_PIECES.forEach(([c, r], i) => {
        const px = cut(sheets[sheet], bx + c, r);
        if (t) tone(px, t);
        tint(px, ts.tint[0], ts.tint[1]);
        putFrame(px, k * EDGE_PIECES.length + i);
      });
      // Decor frames for this kind follow all the border pieces.
      decor[k] = (DECOR_FOR[kind] ?? []).map(([dsheet, c, r]) => {
        used.add(dsheet);
        const px = cut(sheets[dsheet], c, r);
        tint(px, ts.tint[0], ts.tint[1]);
        putFrame(px, next);
        return next++;
      });
    });
    const edgesFile = `public/assets/lpc/${name}_edges.png`;
    const edgesPng = encodePng(n * T, T, ebuf);
    fs.writeFileSync(edgesFile, edgesPng);
    lpcData.tilesets[name].edges = {
      key: `${name}_edges`,
      path: edgesFile.replace('public/', ''),
      kindOf,
      pieces: EDGE_PIECES.length,
      decor,
    };
    edgeFiles.push([edgesFile, edgesPng, `Soft terrain edges for ${name} (LPC border pieces).`]);
  }
  // Point the chapter 0-5 maps at the new image (the tileset name inside the map stays).
  for (const def of Object.values(maps.maps)) {
    if (((def.chapter ?? 0) > 5 && !ts.late) || def.tileset.name !== name) continue;
    def.tileset = { name, key: `${name}_lpc`, path: atlasFile.replace('public/', '') };
    touched++;
  }
  const from = [...used].map((k) => manifest.find((m) => m.file === SRC[k]).id).sort();
  const hash = (b) => createHash('sha256').update(b).digest('hex');
  for (const [file, bytes, note] of [
    [
      atlasFile,
      png,
      `${name} rebuilt slot for slot from LPC materials (tinted); story props kept.`,
    ],
    [capsFile, capsPng, `Wall tops for ${name}, drawn above walkable tiles north of walls.`],
    ...edgeFiles,
  ]) {
    const id = `derived-${file.split('/').pop().replace('.png', '').replace(/_/g, '-')}`;
    derived = derived.filter((d) => d.id !== id);
    derived.push({
      id,
      file,
      sha256: hash(bytes),
      from,
      script: 'scripts/lpc/reskin.mjs',
      notes: note,
    });
  }
}
derived.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(derivedFile, JSON.stringify(derived, null, 2) + '\n');
fs.writeFileSync('public/assets/data/lpc.json', JSON.stringify(lpcData, null, 2) + '\n');
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');
fs.writeFileSync('CREDITS.md', await renderCredits(manifest, derived));
execSync(
  `npx prettier --write public/assets/data/maps.json public/assets/data/lpc.json ${derivedFile}`,
  {
    stdio: 'ignore',
  },
);
console.log(
  `reskin: ${Object.keys(TILESETS).length} tilesets, ${touched} maps pointed at LPC atlases`,
);
