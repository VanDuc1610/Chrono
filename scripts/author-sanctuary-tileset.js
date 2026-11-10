/**
 * CHRONO – code-authored tileset for the Shattered Antechamber (Pipeline B, AGENTS.md §5).
 *
 * Built from docs/art/ENVIRONMENT_GUIDE.md (palette §4, tile rules §2-3). Every pixel comes from
 * the deterministic rules and explicit pixel lists below — no image model, no external reference.
 * Output goes to art-source/environment/sanctuary/generated/candidates/ ONLY; owner approval is
 * required before it replaces public/assets/tilesets/dungeon_tileset.png (AGENTS.md §6).
 *
 * Tile indices are FIXED by public/assets/maps/prologue_map.json (GID = index + 1):
 *   0 void · 1 slate floor · 2 engraved chronal pavement · 3 wall top / cornice
 *   4 wall face · 5 ruined pillar · 6 chrono crystal · 7 Altar of Moments
 *   8 cracked fracture floor · 9 slate floor variant · 10-15 empty (reserved)
 * Ground tiles (0-2, 8-9) are opaque; props on the Walls layer (5-7) have transparent
 * backgrounds so the floor shows through.
 *
 * Usage: node scripts/author-sanctuary-tileset.js [outDir]
 * Also writes previews/: the tileset ×4 and the real prologue map rendered with it.
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';

const VERSION = 'v2';
const T = 32;

/** ENVIRONMENT_GUIDE §4 swatches + dormant cyan (§3.1) + outline. */
const PALETTE = {
  v: hex('#07080f'), // Abyssal Shadow — recesses, deep cracks
  m: hex('#0e121e'), // Midnight Slate — mortar, wall shadow
  S: hex('#1b2234'), // Vault Stone — primary flagstone
  s: hex('#29344c'), // Weathered Slate — mid-tones, wall blocks
  h: hex('#404f6e'), // High Stone Rim — top-edge highlights, fluting
  b: hex('#8c6628'), // Aged Bronze Mold — cornice, altar trim
  B: hex('#b88a3e'), // bronze highlight (derived)
  d: hex('#008ab8'), // dormant cyan dust
  c: hex('#00c8ff'), // Chronal Cyan Inlay
  a: hex('#88edff'), // Luminous Apex
  O: hex('#05060b'), // prop outline
};

/** Deterministic per-pixel hash in [0, 100). */
const rnd = (x, y, seed) => (((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0) % 100;

const tile = (fill) => Array.from({ length: T }, () => Array(T).fill(fill));
const put = (t, x, y, ch) => {
  if (x >= 0 && y >= 0 && x < T && y < T) t[y][x] = ch;
};
const line = (t, pts, ch) => pts.forEach(([x, y]) => put(t, x, y, ch));

// ------------------------------------------------------------------ GROUND

/** Weathered slate flagstones: offset 16px courses, bevelled edges, fine speckle. */
function flagstones(seed, crackSet = []) {
  const t = tile('S');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const course = y < 16 ? 0 : 1;
      const lx = (x + course * 8) % 16;
      const ly = y % 16;
      if (ly === 0 || lx === 0) t[y][x] = 'm';
      else if (ly === 1 || lx === 1)
        t[y][x] = 's'; // top/left bevel catches the light
      else if (ly === 15 || lx === 15)
        t[y][x] = 'v'; // bottom/right recess
      else if (rnd(x, y, seed) < 6) t[y][x] = 's';
      else if (rnd(x, y, seed + 7) < 3) t[y][x] = 'm';
    }
  line(t, crackSet, 'v');
  return t;
}

const FINE_CRACK_A = [
  [5, 4],
  [6, 5],
  [6, 6],
  [7, 7],
  [22, 21],
  [23, 22],
  [23, 23],
  [24, 24],
  [25, 24],
];
const FINE_CRACK_B = [
  [26, 6],
  [25, 7],
  [25, 8],
  [11, 25],
  [12, 26],
  [12, 27],
];

function voidTile() {
  const t = tile('v');
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (rnd(x, y, 3) < 4) t[y][x] = 'm';
  return t;
}

/** Engraved chronal pavement: concentric carved rings, 12 hour ticks, cyan dust in grooves. */
function engravedTile() {
  const t = flagstones(11);
  const cx = 15.5;
  const cy = 15.5;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const r = Math.hypot(x - cx, y - cy);
      const ang = Math.atan2(y - cy, x - cx);
      if (Math.abs(r - 12) < 0.6) t[y][x] = rnd(x, y, 5) < 30 ? 'd' : 'm';
      else if (Math.abs(r - 7) < 0.55) t[y][x] = rnd(x, y, 9) < 25 ? 'd' : 'm';
      else if (r < 2.2) t[y][x] = r < 1 ? 'a' : 'c';
      // twelve divisions of the day between the rings
      const hour = (ang / (Math.PI * 2)) * 12;
      if (r > 8 && r < 11.4 && Math.abs(hour - Math.round(hour)) < 0.07) t[y][x] = 'm';
    }
  return t;
}

/** Cracked fracture floor: flagstones split by a fissure leaking cyan light. */
function fractureTile() {
  const t = flagstones(23);
  const fissure = [
    [3, 9],
    [4, 10],
    [5, 10],
    [6, 11],
    [7, 12],
    [8, 12],
    [9, 13],
    [10, 14],
    [11, 15],
    [12, 15],
    [13, 16],
    [14, 17],
    [15, 17],
    [16, 18],
    [17, 19],
    [18, 20],
    [19, 20],
    [20, 21],
    [21, 22],
    [22, 23],
    [23, 23],
    [24, 24],
    [25, 25],
    [26, 26],
  ];
  fissure.forEach(([x, y], i) => {
    put(t, x, y, i % 5 === 2 ? 'a' : 'c');
    put(t, x, y - 1, 'v');
    put(t, x + 1, y + 1, 'v');
    if (i % 4 === 0) put(t, x + 1, y - 1, 'd');
  });
  return t;
}

// ------------------------------------------------------------------- WALLS

/**
 * Wall top seen from above: square capstones with even mortar on all four sides, so the tile
 * repeats cleanly both along the horizontal border and down the vertical side walls.
 */
function wallTopTile() {
  const t = tile('m');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const bx = x % 16;
      const by = y % 16;
      if (bx >= 1 && bx <= 14 && by >= 1 && by <= 14) {
        if (by === 1 || bx === 1) t[y][x] = 'h';
        else if (by === 14 || bx === 14) t[y][x] = 'S';
        else t[y][x] = rnd(x, y, 31) < 8 ? 'S' : 's';
      }
    }
  return t;
}

/** Lower sanctuary wall face: megalithic slate courses with chisel marks and a faint fissure. */
function wallFaceTile() {
  const t = tile('s');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const course = Math.floor(y / 11);
      const ly = y % 11;
      const lx = (x + (course % 2) * 12) % 24;
      if (ly === 0 || lx === 0) t[y][x] = 'm';
      else if (ly === 1) t[y][x] = 'h';
      else if (ly >= 9) t[y][x] = 'S';
      else if (rnd(x, y, 41) < 7) t[y][x] = 'S';
    }
  // chisel marks
  line(
    t,
    [
      [5, 4],
      [6, 5],
      [17, 15],
      [18, 16],
      [9, 26],
      [10, 27],
    ],
    'm',
  );
  // hairline fissure with dormant chronal light
  line(
    t,
    [
      [27, 13],
      [26, 14],
      [26, 15],
      [27, 16],
    ],
    'd',
  );
  // bronze-trimmed cornice where the capstones meet the wall face (ENVIRONMENT_GUIDE §3.2)
  for (let x = 0; x < T; x++) {
    t[0][x] = 'b';
    t[1][x] = x % 6 === 0 ? 'B' : 'b';
    t[2][x] = 'm';
  }
  // contact shadow where the wall meets the floor
  for (let x = 0; x < T; x++) {
    t[30][x] = 'm';
    t[31][x] = 'v';
  }
  return t;
}

// ------------------------------------------------------------------- PROPS

/** Parse a 32-row prop drawing ('.' = transparent). */
function prop(rows) {
  if (rows.length !== T || rows.some((r) => r.length !== T)) {
    throw new Error('prop must be 32x32');
  }
  return rows.map((r) => [...r]);
}

/** Fluted ruined pillar stub with a shattered top, on a square plinth. */
const pillarTile = prop([
  '................................',
  '................................',
  '..........OO.....OO.............',
  '.........OhhO...OhhOO...........',
  '........OhhshOOOhssshO..........',
  '........OhsssshhssssshO.........',
  '........OssSsssSssSsshO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OSSmSSmmSSmSSSO.........',
  '......OOhhhhhhhhhhhhhhhOO.......',
  '......OhssssssssssssssssO.......',
  '......OsSSSSSSSSSSSSSSSSO.......',
  '......OmmmmmmmmmmmmmmmmmO.......',
  '......OOOOOOOOOOOOOOOOOOO.......',
  '.......vvvvvvvvvvvvvvvvvv.......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/** Fractured chrono crystal cluster growing from the floor. */
const crystalTile = prop([
  '................................',
  '................................',
  '................................',
  '...............O................',
  '..............OaO...............',
  '..............OacO..............',
  '.............OaacO..............',
  '.............OacccO.............',
  '.............OacccO....O........',
  '.....O.......OacccdO..OaO.......',
  '....OaO......OacccdO..OacO......',
  '....OacO.....OaccdcO.OaacO......',
  '...OaacO.....OacccdO.OaccdO.....',
  '...OaccdO....OaccdcO.OaccdO.....',
  '...OacccO....OacccdO.OacddO.....',
  '...OaccdO....OaccdcOOOaccdO.....',
  '....OacdO...OOacccdOOacccdO.....',
  '....OaccdO..OaacccdOOaccdO......',
  '....OacddOOOaaccccdOacccdO......',
  '.....OacdOOaaccccddOaccdO.......',
  '.....OaccdOacccccddOacdO........',
  '......OacdOacccccdOacddO........',
  '.......OOcdaccccddOccdO.........',
  '.......OmOOOOOOOOOOOOOmO........',
  '......OmmmmmmmmmmmmmmmmmO.......',
  '.......vvvvvvvvvvvvvvvvv........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/** Altar of Moments: obsidian-slate pedestal, bronze trim, celestial dial, glowing shard socket. */
const altarTile = prop([
  '................................',
  '................................',
  '....OOOOOOOOOOOOOOOOOOOOOOOO....',
  '...ObBBbbbbbbbbbbbbbbbbbbBBbO...',
  '...OhhhhhhhhhhhhhhhhhhhhhhhhO...',
  '...OhsssssssmmmmmmmmssssssshO...',
  '...OhssssmmmSSSSSSSSmmmssssSO...',
  '...OhsssmSSSmmdmmdmmSSSmsssSO...',
  '...OhssmSSmdSSSSSSSSdmSSmssSO...',
  '...OhssmSmSSSSSccSSSSSmSmssSO...',
  '...OhsmSSdSSSScaacSSSSdSSmsSO...',
  '...OhsmSSmSSSScaacSSSSmSSmsSO...',
  '...OhssmSmSSSSSccSSSSSmSmssSO...',
  '...OhssmSSmdSSSSSSSSdmSSmssSO...',
  '...OhsssmSSSmmdmmdmmSSSmsssSO...',
  '...OhssssmmmSSSSSSSSmmmssssSO...',
  '...OhsssssssmmmmmmmmssssssSSO...',
  '...ObbbbbbbbbbbbbbbbbbbbbbbbO...',
  '....OSSSSSSSSSSSSSSSSSSSSSSO....',
  '....OsSmmSSSSmmSSSSmmSSSSmSO....',
  '....OsSmmSSSSmmSSSSmmSSSSmSO....',
  '....OsSSSSSSSSSSSSSSSSSSSSSO....',
  '...OOhhhhhhhhhhhhhhhhhhhhhhOO...',
  '...ObBBbbbbbbbbbbbbbbbbbbBBbO...',
  '...OmmmmmmmmmmmmmmmmmmmmmmmmO...',
  '...OOOOOOOOOOOOOOOOOOOOOOOOOO...',
  '....vvvvvvvvvvvvvvvvvvvvvvvv....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

// -------------------------------------------------------------------- SHEET

const TILES = [
  voidTile(), // 0
  flagstones(1, FINE_CRACK_A), // 1
  engravedTile(), // 2
  wallTopTile(), // 3
  wallFaceTile(), // 4
  pillarTile, // 5
  crystalTile, // 6
  altarTile, // 7
  fractureTile(), // 8
  flagstones(17, FINE_CRACK_B), // 9
];

function rasterTiles(tiles, cols, rowsN) {
  const w = cols * T;
  const h = rowsN * T;
  const buf = Buffer.alloc(w * h * 4);
  tiles.forEach((t, i) => {
    const ox = (i % cols) * T;
    const oy = Math.floor(i / cols) * T;
    t.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === '.') return;
        const c = PALETTE[ch];
        if (!c) throw new Error(`tile ${i}: unknown palette char "${ch}"`);
        const o = ((oy + y) * w + ox + x) * 4;
        buf[o] = c[0];
        buf[o + 1] = c[1];
        buf[o + 2] = c[2];
        buf[o + 3] = c[3];
      }),
    );
  });
  return { w, h, buf };
}

function scaled(img, k, bg = [38, 42, 52, 255]) {
  const W = img.w * k;
  const H = img.h * k;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / k) * img.w + Math.floor(x / k)) * 4;
      const o = (y * W + x) * 4;
      const a = img.buf[i + 3];
      const c = a ? img.buf.subarray(i, i + 4) : bg;
      out.set([c[0], c[1], c[2], 255], o);
    }
  return encodePng(W, H, out);
}

/** Renders the real map (Ground then Walls layer) with this tileset, for review. */
function renderMap(sheet, mapPath) {
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const w = map.width * T;
  const h = map.height * T;
  const buf = Buffer.alloc(w * h * 4);
  for (const layerName of ['Ground', 'Walls']) {
    const layer = map.layers.find((l) => l.name === layerName);
    layer.data.forEach((gid, idx) => {
      if (!gid) return;
      const tIdx = gid - 1;
      const sx = (tIdx % 4) * T;
      const sy = Math.floor(tIdx / 4) * T;
      const dx = (idx % map.width) * T;
      const dy = Math.floor(idx / map.width) * T;
      for (let y = 0; y < T; y++)
        for (let x = 0; x < T; x++) {
          const si = ((sy + y) * sheet.w + sx + x) * 4;
          if (!sheet.buf[si + 3]) continue;
          sheet.buf.copy(buf, ((dy + y) * w + dx + x) * 4, si, si + 4);
        }
    });
  }
  return { w, h, buf };
}

const outDir = path.resolve(
  process.argv[2] ?? 'art-source/environment/sanctuary/generated/candidates',
);
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = rasterTiles(TILES, 4, 4);
const file = path.join(outDir, `sanctuary_tileset_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `sanctuary_tileset_${VERSION}_x4.png`), scaled(sheet, 4));
const room = renderMap(sheet, path.resolve('public/assets/maps/prologue_map.json'));
writeFile(path.join(previewDir, `sanctuary_room_${VERSION}.png`), scaled(room, 1));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
