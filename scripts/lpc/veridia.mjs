/**
 * T-88: Doanh Trại Veridia (Chapter 4) rebuilt in LPC art (owner approved the mockup, 2026-11-17).
 *
 * Builds a tile atlas from the pinned LPC sheets (art-source/lpc/raw, see manifest.json), lays out
 * four layers on the map's own 26x16 grid and writes:
 *   public/assets/lpc/veridia_tiles.png          the atlas (a derivative: CC-BY-SA 3.0, credited)
 *   public/assets/maps/map_ch4_encampment_veridia_lpc.json
 *   art-source/lpc/derived.json                  which LPC sources the atlas is made from
 * and points the map at them in maps.json (tilemap, tileset, layers, collision), adds the map to the
 * KEEP lists of atmosphere/neon data (warm colour grade, neon accents only).
 *
 * Gameplay is kept: every tile that blocked before still blocks; spawns, people, points of interest,
 * dials, the trigger and the exit stay where they were. The three tents grow to the LPC size (their
 * two lowest rows block, the canvas above is drawn over the actors so Peter can walk behind it); the
 * two lower tents move down to the camp's edge, clear of Bran and the dials.
 *
 * Usage: node scripts/lpc/veridia.mjs   (idempotent)
 */
import fs from 'fs';
import { createHash } from 'crypto';
import { readPng } from '../pixel-art/png-read.js';
import { encodePng } from '../pixel-art/pixel.js';
import { execSync } from 'child_process';
import { renderCredits } from './credits.mjs';

const MAP_ID = 'map_ch4_encampment_veridia';
const W = 26;
const H = 16;
const T = 32;
const RAW = 'art-source/lpc/raw/tiles/';
const IND = RAW + 'Final Attributions/Individual Assets/';
const SRC = {
  TER: RAW + 'Terrain and Outside.png',
  OBJ: RAW + 'Outside Objects.png',
  SAND: IND + 'Daniel Eddeland (Daneeklu)/sand.png',
  ADOBE: IND + 'Sharm/adobe.png',
  LIGHTS: IND + 'Daniel Armstrong (Aka HughSpectrum)/castle_lightsources.png',
};
const OUT_ATLAS = 'public/assets/lpc/veridia_tiles.png';
const OUT_MAP = `public/assets/maps/${MAP_ID}_lpc.json`;

const sheets = Object.fromEntries(Object.entries(SRC).map(([k, f]) => [k, readPng(f)]));

/** LPC's sand is very saturated; toned towards the camp's dust when it enters the atlas. */
function tone(px, { sat = 1, bright = 1, sepia = 0 }) {
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

// ---------------------------------------------------------------- the atlas
const atlas = []; // { px: Buffer(32*32*4) }
const index = new Map(); // "SHEET:c:r:tone" -> gid
const used = new Set();
/** The gid of one 32x32 tile of a sheet, adding it to the atlas the first time. */
function tile(sheet, c, r, t = null) {
  const key = `${sheet}:${c}:${r}:${t ? JSON.stringify(t) : ''}`;
  if (index.has(key)) return index.get(key);
  const img = sheets[sheet];
  const px = Buffer.alloc(T * T * 4);
  for (let y = 0; y < T; y++)
    img.buf.copy(
      px,
      y * T * 4,
      ((r * T + y) * img.w + c * T) * 4,
      ((r * T + y) * img.w + c * T + T) * 4,
    );
  if (t) tone(px, t);
  atlas.push(px);
  used.add(sheet);
  index.set(key, atlas.length);
  return atlas.length;
}
const SAND_TONE = { sat: 0.45, bright: 0.92, sepia: 0.15 };

// ---------------------------------------------------------------- the layers
const layers = { Ground: [], Overlay: [], Walls: [], Above: [] };
for (const l of Object.values(layers)) for (let i = 0; i < W * H; i++) l.push(0);
const put = (layer, x, y, gid) => {
  if (x >= 0 && y >= 0 && x < W && y < H) layers[layer][y * W + x] = gid;
};
let seed = 1610;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Packed dirt everywhere, a few tile variants mixed in.
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const v = rnd();
    put(
      'Ground',
      x,
      y,
      v < 0.4
        ? tile('TER', 0, 5)
        : v < 0.65
          ? tile('TER', 1, 5)
          : v < 0.85
            ? tile('TER', 2, 5)
            : tile('TER', 1, 3),
    );
  }
// The road through the camp (rows 7-8): sand with soft edges above and below.
for (let x = 0; x < W; x++) {
  put('Overlay', x, 6, tile('SAND', 1, 2, SAND_TONE));
  put('Overlay', x, 7, tile('SAND', 1, 3, SAND_TONE));
  put('Overlay', x, 8, tile('SAND', 1, 3, SAND_TONE));
  put('Overlay', x, 9, tile('SAND', 1, 4, SAND_TONE));
}
// Palisade: posts on the top row (their feet and shadows on the row below), and the bottom row.
for (let x = 0; x < W; x++) {
  const c = 5 + (x % 3);
  put('Walls', x, 0, tile('ADOBE', c, 7));
  put('Overlay', x, 1, tile('ADOBE', c, 8));
  put('Walls', x, H - 1, tile('ADOBE', c, 6));
}
// Side walls: a line of posts; the left gate (rows 7-8) is barred with barrels, the right is the road out.
for (let y = 1; y < H - 1; y++) {
  if (y !== 7 && y !== 8) put('Walls', 0, y, tile('OBJ', 0, 18));
  if (y !== 7 && y !== 8) put('Walls', W - 1, y, tile('OBJ', 2, 18));
}
put('Walls', 0, 7, tile('TER', 9, 18));
put('Walls', 0, 8, tile('TER', 9, 19));
/** A canvas tent (4x5) with its door on (doorX, baseY): two lowest rows block, the rest is above. */
function tent(doorX, baseY) {
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 4; c++)
      put(r <= 2 ? 'Above' : 'Walls', doorX - 1 + c, baseY - 4 + r, tile('OBJ', c, 22 + r));
}
tent(3, 3);
tent(7, 3);
tent(22, 3);
tent(2, 14);
tent(22, 14);
/** Stacked crates: the lower crate blocks, the upper one is drawn over the actors. */
const crates = (x, y) => {
  put('Above', x, y - 1, tile('OBJ', 18, 22));
  put('Walls', x, y, tile('OBJ', 18, 23));
};
crates(10, 4);
crates(11, 12);
put('Walls', 19, 6, tile('OBJ', 17, 22)); // the courier's box
put('Above', 13, 1, tile('LIGHTS', 2, 0)); // a brazier where the banner stood
put('Walls', 13, 2, tile('LIGHTS', 2, 1));
for (let i = 0; i < 3; i++) put('Walls', 15 + i, 11, tile('OBJ', i, 17)); // a wooden barricade

// Camp clutter in the open corners (new blockers, clear of every path, person and point).
/** A 2x2 prop: its lower row blocks, its upper row is drawn over the actors. */
const prop2 = (sheet, c, r, x, y) => {
  for (let dx = 0; dx < 2; dx++) {
    put('Above', x + dx, y, tile(sheet, c + dx, r));
    put('Walls', x + dx, y + 1, tile(sheet, c + dx, r + 1));
  }
};
prop2('TER', 6, 20, 1, 4); // barrels by the west tent
prop2('OBJ', 12, 14, 14, 3); // firewood by the brazier
prop2('OBJ', 12, 18, 23, 5); // grain sacks by the east tent
const brazier = (x, y) => {
  put('Above', x, y - 1, tile('LIGHTS', 2, 0));
  put('Walls', x, y, tile('LIGHTS', 2, 1));
};
brazier(5, 5);
brazier(17, 5);
// A dead tree at the south fence: crown over the actors, the trunk blocks, roots on the ground.
for (let r = 0; r < 3; r++)
  for (let c = 0; c < 3; c++) {
    const layer = r < 2 ? 'Above' : c === 1 ? 'Walls' : 'Overlay';
    put(layer, 8 + c, 12 + r, tile('OBJ', 12 + c, 8 + r));
  }

// ---------------------------------------------------------------- keep the gameplay
const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const def = maps.maps[MAP_ID];
const old = JSON.parse(fs.readFileSync(`public/assets/maps/${MAP_ID}.json`, 'utf8'));
const oldWalls = old.layers.find((l) => l.name === 'Walls').data;
const MOVED = new Set(['3,12', '21,12']); // the two lower tents moved to the camp's edge
for (let i = 0; i < W * H; i++) {
  const k = `${i % W},${Math.floor(i / W)}`;
  const wasSolid = oldWalls[i] >= 17 && oldWalls[i] <= 64; // the old map's collision range
  if (wasSolid && !layers.Walls[i] && !MOVED.has(k))
    throw new Error(`tile ${k} blocked before and is open now`);
}
const free = [
  ...Object.values(def.spawns),
  ...(def.npcs ?? []).map((n) => n.tile),
  ...(def.interactables ?? []).map((n) => n.tile),
  ...(def.dials ?? []).map((n) => n.tile),
];
for (const p of free)
  if (
    layers.Walls[p.y * W + p.x] &&
    !(def.interactables ?? []).some(
      (i) => i.tile.x === p.x && i.tile.y === p.y && oldWalls[p.y * W + p.x],
    )
  )
    throw new Error(`(${p.x},${p.y}) must stay open`);
for (const e of def.exits ?? [])
  for (let y = e.area.y; y < e.area.y + e.area.h; y++)
    for (let x = e.area.x; x < e.area.x + e.area.w; x++)
      if (layers.Walls[y * W + x]) throw new Error(`exit tile (${x},${y}) must stay open`);

// ---------------------------------------------------------------- write
const COLS = 16;
const rows = Math.ceil(atlas.length / COLS);
const aw = COLS * T;
const ah = rows * T;
const abuf = Buffer.alloc(aw * ah * 4);
atlas.forEach((px, i) => {
  const ox = (i % COLS) * T;
  const oy = Math.floor(i / COLS) * T;
  for (let y = 0; y < T; y++) px.copy(abuf, ((oy + y) * aw + ox) * 4, y * T * 4, (y + 1) * T * 4);
});
fs.mkdirSync('public/assets/lpc', { recursive: true });
const png = encodePng(aw, ah, abuf);
fs.writeFileSync(OUT_ATLAS, png);

const tilemap = {
  compressionlevel: -1,
  height: H,
  width: W,
  infinite: false,
  layers: Object.entries(layers).map(([name, data], i) => ({
    data,
    height: H,
    id: i + 1,
    name,
    opacity: 1,
    type: 'tilelayer',
    visible: true,
    width: W,
    x: 0,
    y: 0,
  })),
  nextlayerid: 5,
  nextobjectid: 1,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: T,
  tilesets: [
    {
      columns: COLS,
      firstgid: 1,
      image: '../lpc/veridia_tiles.png',
      imageheight: ah,
      imagewidth: aw,
      margin: 0,
      name: 'lpc_veridia',
      spacing: 0,
      tilecount: atlas.length,
      tileheight: T,
      tilewidth: T,
    },
  ],
  tilewidth: T,
  type: 'map',
  version: '1.10',
};
fs.writeFileSync(OUT_MAP, JSON.stringify(tilemap) + '\n');

def.tilemap = { key: `${MAP_ID}_lpc`, path: `assets/maps/${MAP_ID}_lpc.json` };
def.tileset = { name: 'lpc_veridia', key: 'lpc_veridia', path: 'assets/lpc/veridia_tiles.png' };
def.layers = { ground: 'Ground', walls: 'Walls', overlay: 'Overlay', above: 'Above' };
def.collision = { fromGid: 1, toGid: atlas.length };
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');

// Credits: the atlas is a derivative of these vendored sources.
const manifest = JSON.parse(fs.readFileSync('art-source/lpc/manifest.json', 'utf8'));
const from = [...used].map((k) => {
  const e = manifest.find((m) => m.file === SRC[k]);
  if (!e) throw new Error(`no manifest entry for ${SRC[k]}`);
  return e.id;
});
const derivedFile = 'art-source/lpc/derived.json';
const derived = fs.existsSync(derivedFile) ? JSON.parse(fs.readFileSync(derivedFile, 'utf8')) : [];
const entry = {
  id: 'derived-veridia-tiles',
  file: OUT_ATLAS,
  sha256: createHash('sha256').update(png).digest('hex'),
  from: from.sort(),
  script: 'scripts/lpc/veridia.mjs',
  notes: 'Tile atlas for Doanh Trại Veridia: tiles cut from the sources, sand desaturated.',
};
const out = derived.filter((d) => d.id !== entry.id).concat(entry);
fs.writeFileSync(derivedFile, JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync('CREDITS.md', await renderCredits(manifest, out));
// The data files keep the repository's formatting, so a rerun changes nothing.
execSync(`npx prettier --write public/assets/data/maps.json "${OUT_MAP}" ${derivedFile}`, {
  stdio: 'ignore',
});

console.log(
  `veridia: ${atlas.length} tiles from ${from.length} LPC sheets -> ${OUT_ATLAS}, ${OUT_MAP}`,
);
