/**
 * T-88: LPC dressing — multi-tile props on chosen chapter 0-5 maps (owner, 2026-11-17: coastal town
 * first, then the forest and the sepulcher gate, each shown before it ships).
 *
 * For each map: a small props atlas cut from the pinned LPC sheets (tinted like the map's reskinned
 * tileset), a copy of the map (`<id>_lpc.json`) with that atlas as a second tileset and two extra
 * layers — Overlay (on the ground) and Above (over the actors) — and the props' lowest row added to
 * Walls so they block. Run after scripts/lpc/reskin.mjs (it points maps.json at the copy).
 *
 * Every old blocker still blocks; spawns, people, points of interest, dials and exits stay open
 * (checked here; reachability is checked by the map lint test).
 *
 * Usage: node scripts/lpc/dress.mjs   (idempotent)
 */
import fs from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readPng } from '../pixel-art/png-read.js';
import { encodePng } from '../pixel-art/pixel.js';
import { renderCredits, readDerived } from './credits.mjs';

const T = 32;
const RAW = 'art-source/lpc/raw/tiles/';
const SRC = {
  TER: RAW + 'Terrain and Outside.png',
  OBJ: RAW + 'Outside Objects.png',
};
const sheets = Object.fromEntries(Object.entries(SRC).map(([k, f]) => [k, readPng(f)]));

/** Prop pieces: [sheet, col, row, width, height] in tiles. */
const PIECE = {
  stall: ['OBJ', 17, 17, 3, 5],
  barrels: ['TER', 6, 20, 2, 2],
  grain: ['OBJ', 12, 19, 2, 1],
  handcart: ['OBJ', 9, 25, 2, 2],
  crate: ['OBJ', 17, 22, 1, 1],
  boat: ['OBJ', 19, 28, 4, 2],
  pineA: ['OBJ', 6, 3, 3, 4],
  pineB: ['OBJ', 9, 3, 3, 4],
  stoneRound: ['OBJ', 30, 17, 1, 1],
  stoneRip: ['OBJ', 31, 17, 1, 1],
  stoneCross: ['OBJ', 27, 17, 1, 1],
  crossTall: ['OBJ', 27, 18, 1, 2],
  stoneDouble: ['OBJ', 30, 18, 2, 2],
  pillarA: ['OBJ', 9, 28, 1, 2],
  pillarB: ['OBJ', 10, 28, 1, 2],
  stubA: ['OBJ', 7, 29, 1, 1],
  stubB: ['OBJ', 8, 29, 1, 1],
  slab: ['OBJ', 4, 30, 3, 1],
  produceA: ['OBJ', 20, 23, 1, 2],
  produceB: ['OBJ', 22, 23, 1, 2],
  produceC: ['OBJ', 24, 23, 1, 2],
};

/**
 * Per map: tint (as the reskin), and props [piece, x, y, mode]: 'stand' blocks the lowest row and
 * draws the rest above the actors; 'float' draws everything above (a boat on water that already
 * blocks).
 */
const MAPS = {
  map_coastal_town: {
    tint: ['#ffd8b0', 0.1],
    notes: 'stall, barrels, sacks, cart, crates, boat',
    props: [
      ['stall', 8, 3, 'stand'],
      ['barrels', 1, 4, 'stand'],
      ['grain', 14, 10, 'stand'],
      ['handcart', 23, 9, 'stand'],
      ['crate', 20, 13, 'stand'],
      ['boat', 20, 15, 'float'],
    ],
  },
  // Evergreens over the hedge masses (they already block), drawn above the actors.
  map_forgotten_forest: {
    tint: ['#90a4ac', 0.18],
    notes: 'evergreens over the hedges',
    props: [
      ['pineA', 0, 0, 'float'],
      ['pineB', 4, 0, 'float'],
      ['pineA', 8, 0, 'float'],
      ['pineB', 12, 0, 'float'],
      ['pineA', 16, 0, 'float'],
      ['pineB', 0, 5, 'float'],
      ['pineA', 2, 9, 'float'],
      ['pineA', 11, 4, 'float'],
      ['pineB', 8, 13, 'float'],
      ['pineB', 21, 9, 'float'],
      ['pineA', 20, 13, 'float'],
      ['pineB', 23, 13, 'float'],
    ],
  },
  // Two rows of graves either side of the path (rows 8-9 stay open).
  map_ch3_sepulcher_gate: {
    tint: ['#90a4ac', 0.18],
    notes: 'gravestones',
    props: [
      ['stoneRound', 6, 4, 'stand'],
      ['stoneRip', 13, 4, 'stand'],
      ['stoneCross', 15, 4, 'stand'],
      ['stoneRound', 17, 4, 'stand'],
      ['crossTall', 4, 10, 'stand'],
      ['stoneDouble', 7, 10, 'stand'],
      ['crossTall', 10, 10, 'stand'],
      ['stoneDouble', 13, 10, 'stand'],
      ['crossTall', 16, 10, 'stand'],
      ['stoneRip', 19, 11, 'stand'],
    ],
  },
  // Chapter 6 (owner, 2026-11-18): broken pillars and slabs adrift in the starfield either side of
  // the path (they float over void cells that already block; the path stays clear).
  map_ch6_first_void_abyss: {
    tint: ['#8a9ac8', 0.25],
    notes: 'broken pillars and slabs adrift in the void',
    props: [
      ['pillarA', 4, 6, 'float'],
      ['stubA', 7, 5, 'float'],
      ['pillarB', 10, 6, 'float'],
      ['slab', 13, 4, 'float'],
      ['pillarA', 18, 6, 'float'],
      ['stubB', 21, 6, 'float'],
      ['pillarB', 6, 11, 'float'],
      ['slab', 9, 13, 'float'],
      ['stubA', 14, 11, 'float'],
      ['pillarA', 16, 11, 'float'],
      ['stubB', 20, 12, 'float'],
      ['pillarB', 22, 11, 'float'],
    ],
  },
  // Chapter 8 (owner, 2026-11-18): the gear market gets its stalls, produce, crates and carts.
  map_ch8_gear_market: {
    tint: ['#d89860', 0.18],
    notes: 'market stalls, produce, crates, a handcart, barrels',
    props: [
      ['stall', 2, 11, 'stand'],
      ['stall', 16, 13, 'stand'],
      ['produceA', 7, 12, 'stand'],
      ['produceB', 8, 12, 'stand'],
      ['produceC', 15, 4, 'stand'],
      ['barrels', 24, 16, 'stand'],
      ['handcart', 9, 16, 'stand'],
      ['crate', 12, 12, 'stand'],
      ['crate', 19, 6, 'stand'],
      ['crate', 6, 7, 'stand'],
    ],
  },
};

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
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

const mapsDb = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('art-source/lpc/manifest.json', 'utf8'));
let derived = readDerived();
const hash = (b) => createHash('sha256').update(b).digest('hex');
const written = [];

for (const [mapId, spec] of Object.entries(MAPS)) {
  const def = mapsDb.maps[mapId];
  // Always dress the generated original, never a previous copy.
  const original = `public/assets/maps/${mapId}.json`;
  const tm = JSON.parse(fs.readFileSync(original, 'utf8'));
  const W = tm.width;
  const H = tm.height;
  const main = tm.tilesets[0];
  const firstgid = main.firstgid + main.tilecount;
  const atlas = [];
  const used = new Set();
  const index = new Map();
  const gidOf = (sheet, c, r) => {
    const key = `${sheet}:${c}:${r}`;
    if (!index.has(key)) {
      const px = cut(sheets[sheet], c, r);
      tint(px, spec.tint[0], spec.tint[1]);
      atlas.push(px);
      used.add(sheet);
      index.set(key, firstgid + atlas.length - 1);
    }
    return index.get(key);
  };
  const layer = (name) => tm.layers.find((l) => l.name === name);
  const walls = layer(def.layers.walls).data;
  const oldWalls = [...walls];
  const blank = () => Array(W * H).fill(0);
  const overlay = blank();
  const above = blank();
  const put = (arr, x, y, gid) => {
    if (x >= 0 && y >= 0 && x < W && y < H) arr[y * W + x] = gid;
  };
  for (const [name, px, py, mode] of spec.props) {
    const [sheet, c0, r0, w, h] = PIECE[name];
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        const gid = gidOf(sheet, c0 + c, r0 + r);
        const lowest = r === h - 1;
        if (mode === 'stand' && lowest) {
          if (walls[(py + r) * W + px + c])
            throw new Error(`${mapId}: ${name} lands on a wall tile`);
          put(walls, px + c, py + r, gid);
        } else put(above, px + c, py + r, gid);
      }
  }
  // Keep the gameplay: old blockers still block, important cells stay open.
  const blocks = (i) => walls[i] >= def.collision.fromGid;
  oldWalls.forEach((g, i) => {
    if (g && !walls[i]) throw new Error(`${mapId}: a tile disappeared`);
  });
  const area = (r) => {
    const out = [];
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) out.push({ x, y });
    return out;
  };
  const keep = [
    ...Object.values(def.spawns),
    ...(def.npcs ?? []).map((n) => n.tile),
    ...(def.interactables ?? []).map((n) => n.tile),
    ...(def.dials ?? []).map((n) => n.tile),
    ...(def.exits ?? []).flatMap((e) => area(e.area)),
  ];
  for (const p of keep)
    if (walls[p.y * W + p.x] >= firstgid)
      throw new Error(`${mapId}: (${p.x},${p.y}) must stay open`);
  void blocks;

  // The props atlas.
  const COLS = 8;
  const rows = Math.max(1, Math.ceil(atlas.length / COLS));
  const aw = COLS * T;
  const ah = rows * T;
  const buf = Buffer.alloc(aw * ah * 4);
  atlas.forEach((px, i) => {
    const ox = (i % COLS) * T;
    const oy = Math.floor(i / COLS) * T;
    for (let y = 0; y < T; y++) px.copy(buf, ((oy + y) * aw + ox) * 4, y * T * 4, (y + 1) * T * 4);
  });
  const atlasFile = `public/assets/lpc/${mapId}_props.png`;
  const png = encodePng(aw, ah, buf);
  fs.writeFileSync(atlasFile, png);

  // The dressed copy of the map.
  const nextId = Math.max(...tm.layers.map((l) => l.id)) + 1;
  const mk = (name, data, id) => ({
    data,
    height: H,
    id,
    name,
    opacity: 1,
    type: 'tilelayer',
    visible: true,
    width: W,
    x: 0,
    y: 0,
  });
  const groundIdx = tm.layers.findIndex((l) => l.name === def.layers.ground);
  tm.layers.splice(groundIdx + 1, 0, mk('Overlay', overlay, nextId));
  tm.layers.push(mk('Above', above, nextId + 1));
  tm.nextlayerid = nextId + 2;
  const propName = `lpc_props_${mapId}`;
  tm.tilesets = [
    main,
    {
      columns: COLS,
      firstgid,
      image: `../lpc/${mapId}_props.png`,
      imageheight: ah,
      imagewidth: aw,
      margin: 0,
      name: propName,
      spacing: 0,
      tilecount: COLS * rows,
      tileheight: T,
      tilewidth: T,
    },
  ];
  const copy = `public/assets/maps/${mapId}_lpc.json`;
  fs.writeFileSync(copy, JSON.stringify(tm) + '\n');
  def.tilemap = { key: `${mapId}_lpc`, path: `assets/maps/${mapId}_lpc.json` };
  def.propTileset = { name: propName, key: propName, path: atlasFile.replace('public/', '') };
  def.layers = { ...def.layers, overlay: 'Overlay', above: 'Above' };
  def.collision = { ...def.collision, toGid: firstgid + COLS * rows - 1 };

  const from = [...used].map((k) => manifest.find((m) => m.file === SRC[k]).id).sort();
  const id = `derived-${mapId.replace(/_/g, '-')}-props`;
  derived = derived.filter((d) => d.id !== id);
  derived.push({
    id,
    file: atlasFile,
    sha256: hash(png),
    from,
    script: 'scripts/lpc/dress.mjs',
    notes: `Props for ${mapId} (${spec.notes}), tinted like its tileset.`,
  });
  written.push(copy);
  console.log(`${mapId}: ${spec.props.length} props, ${atlas.length} tiles`);
}

derived.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync('art-source/lpc/derived.json', JSON.stringify(derived, null, 2) + '\n');
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(mapsDb, null, 2) + '\n');
fs.writeFileSync('CREDITS.md', await renderCredits(manifest, derived));
execSync(
  `npx prettier --write public/assets/data/maps.json art-source/lpc/derived.json ${written.join(' ')}`,
  { stdio: 'ignore' },
);
