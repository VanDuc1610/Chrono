/**
 * Chapter 1 "The Last Sunset" map layouts (docs/story/CHAPTER_01_DESIGN.md §3), shared by
 * scripts/generate-ch1-maps.js (tilemaps) and scripts/preview-ch1-maps.js (review images).
 * Values are tile indices of each map's tileset (GID = index + 1); -1 = empty.
 *
 * Props that do not exist yet (sundial, tide marker, tide wheel, shrine, letter box, bell post,
 * chime pillars, the cracked bell) use the closest approved tile as a stand-in until their own art
 * is approved — marked `STAND-IN` below.
 */
import { C } from './coastal-layout.js';
import { Wd } from './wilds-layout.js';

/** Chapter 1 props appended to the v2 tilesets (tiles 0-39 are the approved v1 tiles). */
const C2 = { SHRINE: 40, LETTER_BOX: 41, BELL_POST: 42, DINNER: 43 };
const W2 = { SUNDIAL: 40, TIDE_MARKER: 41, TIDE_WHEEL: 42 };

/** dungeon_tileset (ENV_SANCTUARY_002) indices. */
export const D = {
  VOID: 0,
  FLOOR: 1,
  ENGRAVED: 2,
  WALL_TOP: 3,
  WALL_FACE: 4,
  PILLAR: 5,
  CRYSTAL: 6,
  ALTAR: 7,
  FRACTURE: 8,
  FLOOR_ALT: 9,
  STELE: 10,
  ASTROLABE: 11,
  RELIQUARY: 12,
  GATE: 13,
};

/** sunken_tileset: the dungeon tiles recoloured for the seabed + underwater props (16-23). */
export const S = {
  ...D,
  CHIME: 16,
  BELL: 17,
  CORAL: 18,
  KELP: 19,
  WATER: 20,
  SAND: 21,
  WATCH: 22,
  SEAL: 23,
};

/** Seabed dressing: sand and shallow pools on the floor, coral and kelp against the walls. */
function seabed(ground, walls, seed) {
  const H = ground.length;
  const W = ground[0].length;
  for (let y = 2; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      if (walls[y][x] !== -1) continue;
      const r = hash(x, y, seed);
      if (ground[y][x] === D.FLOOR || ground[y][x] === D.FLOOR_ALT) {
        if (r < 12) ground[y][x] = S.SAND;
        else if (r < 17) ground[y][x] = S.WATER;
      }
      const nearWall =
        walls[y - 1][x] === D.WALL_FACE ||
        walls[y][x - 1] === D.WALL_FACE ||
        walls[y][x + 1] === D.WALL_FACE;
      if (nearWall && r > 90) walls[y][x] = r > 95 ? S.CORAL : S.KELP;
    }
}

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, fill) => Array.from({ length: h }, () => Array(w).fill(fill));
const fill = (g, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = v;
};

// ---------------------------------------------------------------- 1. Sunset shore (wilds)
export function shoreLayout() {
  const W = 22;
  const H = 16;
  const ground = grid(W, H, Wd.BASALT);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 41);
      if (r < 15) ground[y][x] = Wd.BASALT_LICHEN;
      else if (r < 24) ground[y][x] = Wd.SALT_GRASS;
    }
  fill(walls, 0, 0, W - 1, 2, Wd.BASALT_COLUMNS); // cliff wall to the north
  fill(walls, 0, 0, 0, H - 1, Wd.BASALT_COLUMNS);
  fill(walls, W - 1, 0, W - 1, H - 1, Wd.BASALT_COLUMNS);
  for (let x = 0; x < W; x++) {
    ground[12][x] = Wd.FOAM_ROCK;
    for (let y = 13; y < H; y++) {
      ground[y][x] = Wd.SEA;
      walls[y][x] = Wd.SEA;
    }
  }
  for (let x = 1; x < W; x++) ground[8][x] = Wd.TRAIL; // the coastal path
  for (const y of [7, 8, 9]) walls[y][W - 1] = -1; // the way east, looping until fixed
  walls[8][1] = Wd.GATE; // where Peter and the Elder step out of the Threshold
  walls[5][10] = W2.SUNDIAL;
  walls[13][12] = Wd.FROZEN_WAVE; // the tide stopped at one height
  walls[14][6] = Wd.FROZEN_WAVE;
  walls[13][17] = Wd.FROZEN_WAVE;
  walls[11][12] = W2.TIDE_MARKER;
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 3, y: 8 },
      from_prologue: { x: 3, y: 8 },
      from_village: { x: 19, y: 8 },
      loop_reset: { x: 5, y: 8 },
    },
    exits: { to_village: { x: W - 1, y: 7, w: 1, h: 3 } },
    loopZone: { x: 18, y: 6, w: 2, h: 5 },
    points: { elder: { x: 5, y: 7 }, sundial: { x: 10, y: 6 }, tide_marker: { x: 12, y: 10 } },
  };
}

// ---------------------------------------------------------------- 2. Abandoned village (coastal)
function house(walls, x0, y0, pattern) {
  pattern.forEach((cell, i) => {
    walls[y0][x0 + i] = C.ROOF;
    walls[y0 + 1][x0 + i] = C.EAVE;
    walls[y0 + 2][x0 + i] = cell;
  });
}

export function villageLayout() {
  const W = 30;
  const H = 20;
  const ground = grid(W, H, C.SAND);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 43);
      if (r < 10) ground[y][x] = C.SAND_SHELLS;
      else if (r < 18) ground[y][x] = C.GRASS;
    }
  for (let x = 0; x < W; x++) if (x < 27) walls[0][x] = C.STONE_FENCE;
  const L = C.LIME_WALL;
  const Wn = C.WALL_WINDOW;
  house(walls, 2, 1, [L, Wn, C.DOOR, Wn, L]);
  house(walls, 9, 1, [Wn, L, C.DOOR, L, Wn]); // Bà Tư's house
  house(walls, 16, 1, [L, Wn, Wn, L]);
  house(walls, 21, 1, [Wn, L, L, Wn]);
  // Main road west -> east, then up the slope to the beacon.
  for (let x = 0; x < W; x++) {
    ground[10][x] = hash(x, 10, 7) < 20 ? C.PATH_PEBBLES : C.PATH;
    ground[11][x] = C.PATH;
  }
  for (let y = 2; y <= 11; y++) {
    ground[y][27] = C.PATH;
    ground[y][28] = C.PATH;
  }
  for (const y of [3, 4, 5]) ground[y][29] = C.PATH;
  // Bà Tư's courtyard with the dinner for two; the shrine; the Time Anchor; the bell post.
  fill(ground, 8, 5, 13, 7, C.BRICK);
  walls[6][11] = C2.DINNER;
  fill(ground, 19, 5, 21, 7, C.BRICK);
  walls[6][20] = C2.SHRINE;
  walls[8][15] = C.WELL; // the Time Anchor well
  walls[8][24] = C2.BELL_POST;
  // Shore, letter box, dock and the fisherman's spirit.
  for (let x = 0; x < W; x++) {
    ground[14][x] = hash(x, 14, 3) < 25 ? C.FOOTPRINTS : C.SAND;
    ground[15][x] = C.SHORE;
    for (let y = 16; y < H; y++) {
      ground[y][x] = C.WATER;
      walls[y][x] = C.WATER;
    }
  }
  for (let y = 15; y < H; y++)
    for (const x of [5, 6]) {
      ground[y][x] = C.PIER;
      walls[y][x] = -1;
    }
  walls[14][12] = C2.LETTER_BOX;
  walls[17][9] = C.BASKET_BOAT;
  walls[14][3] = C.BASKET_BOAT;
  walls[14][8] = C.NET_PILE;
  for (const [x, y] of [
    [1, 6],
    [14, 13],
    [25, 13],
    [7, 7],
  ]) {
    walls[y][x] = C.PALM_TRUNK;
    walls[y - 1][x] = C.PALM_CROWN;
  }
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 1, y: 10 },
      from_shore: { x: 1, y: 10 },
      from_beacon: { x: 27, y: 4 },
      loop_alley: { x: 15, y: 11 },
    },
    exits: { to_shore: { x: 0, y: 9, w: 1, h: 3 }, to_beacon: { x: 29, y: 3, w: 1, h: 3 } },
    loopZone: { x: 27, y: 2, w: 2, h: 3 },
    points: {
      ba_tu: { x: 10, y: 6 },
      dinner: { x: 11, y: 6 },
      fisherman_spirit: { x: 6, y: 16 },
      anchor_well: { x: 15, y: 9 },
      shrine_photo: { x: 20, y: 7 },
      letter_box: { x: 12, y: 13 },
      bell_post: { x: 24, y: 9 },
    },
  };
}

// ---------------------------------------------------------------- 3. Misty beacon (wilds)
export function beaconLayout() {
  const W = 24;
  const H = 18;
  const ground = grid(W, H, Wd.BASALT);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 47);
      if (r < 16) ground[y][x] = Wd.BASALT_LICHEN;
      else if (r < 22) ground[y][x] = Wd.TIDE_POOL;
    }
  fill(walls, 0, 0, W - 1, 0, Wd.BASALT_COLUMNS);
  fill(walls, W - 1, 0, W - 1, H - 1, Wd.SEA);
  fill(ground, W - 1, 0, W - 1, H - 1, Wd.SEA);
  fill(walls, 0, 0, 0, 11, Wd.BASALT_COLUMNS);
  fill(walls, 0, 16, 0, H - 1, Wd.BASALT_COLUMNS);
  fill(walls, 1, H - 1, 18, H - 1, Wd.CLIFF);
  // Courtyard around the bronze-rusted lighthouse (different from Khánh Hòa's).
  fill(ground, 8, 5, 15, 10, Wd.FLAGSTONE);
  walls[2][11] = Wd.LH_TOP_L;
  walls[2][12] = Wd.LH_TOP_R;
  walls[3][11] = Wd.LH_MID_L;
  walls[3][12] = Wd.LH_MID_R;
  walls[4][11] = Wd.LH_BASE_L;
  walls[4][12] = Wd.LH_BASE_R;
  walls[5][13] = W2.TIDE_WHEEL;
  walls[9][9] = Wd.TABLET; // the keeper's logbook lectern
  // The flooded stairs to the ruins (east): steps on the ground layer, covered by sea at high tide.
  for (let y = 13; y < H; y++)
    for (const x of [19, 20, 21, 22]) {
      ground[y][x] = x <= 20 ? Wd.STEPS : Wd.SEA;
      walls[y][x] = Wd.SEA;
    }
  const lowTide = walls.map((row) => [...row]);
  for (let y = 13; y < H; y++) for (const x of [19, 20]) lowTide[y][x] = -1;
  for (const [x, y] of [
    [4, 4],
    [17, 3],
    [6, 13],
  ])
    walls[y][x] = lowTide[y][x] = Wd.ERASED_TREE;
  return {
    width: W,
    height: H,
    ground,
    walls,
    extraLayers: { Walls_LowTide: lowTide },
    spawns: {
      default: { x: 2, y: 14 },
      from_village: { x: 2, y: 14 },
      from_ruins: { x: 19, y: 13 },
    },
    exits: { to_village: { x: 0, y: 12, w: 1, h: 4 }, to_ruins: { x: 19, y: 16, w: 2, h: 1 } },
    points: { keeper: { x: 11, y: 8 }, tide_wheel: { x: 13, y: 6 }, logbook: { x: 9, y: 10 } },
  };
}

// ---------------------------------------------------------------- 4. Sunken corridors (dungeon)
function room(W, H) {
  const ground = grid(W, H, D.FLOOR);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (hash(x, y, 53) < 22) ground[y][x] = D.FLOOR_ALT;
      if (x === 0 || x === W - 1 || y === H - 1) walls[y][x] = D.WALL_FACE;
      if (y === 0) walls[y][x] = D.WALL_FACE;
      if (y === 1 && x > 0 && x < W - 1) walls[y][x] = D.WALL_TOP;
    }
  return { ground, walls };
}

export function ruinsLayout() {
  const W = 26;
  const H = 18;
  const { ground, walls } = room(W, H);
  // Inner walls make a winding corridor with side niches.
  fill(walls, 5, 2, 5, 9, D.WALL_FACE);
  fill(walls, 10, 8, 10, 16, D.WALL_FACE);
  fill(walls, 15, 2, 15, 6, D.WALL_FACE);
  fill(walls, 15, 10, 15, 16, D.WALL_FACE);
  fill(walls, 20, 4, 24, 4, D.WALL_FACE);
  walls[17][2] = -1; // opening down to the beacon stairs
  walls[0][24] = -1; // opening up to the sanctum
  walls[1][24] = -1;
  ground[17][2] = D.ENGRAVED;
  // Engraved floor glowing like phosphorescence around the three chime pillars.
  for (const [x, y] of [
    [8, 11],
    [14, 7],
    [19, 12],
  ]) {
    fill(ground, x - 1, y - 1, x + 1, y + 1, D.ENGRAVED);
    walls[y][x] = S.CHIME;
  }
  for (const [x, y] of [
    [3, 7],
    [12, 3],
    [22, 14],
  ])
    ground[y][x] = D.FRACTURE;
  ground[4][6] = S.WATCH; // the unnamed watch case (indirect trace), lying on the seabed
  walls[3][17] = D.RELIQUARY; // sunken cache
  walls[13][23] = D.CRYSTAL;
  walls[6][2] = D.CRYSTAL;
  seabed(ground, walls, 57);
  for (const p of [
    [2, 16],
    [2, 15],
    [23, 3],
    [24, 2],
    [12, 13],
    [20, 8],
    [8, 5],
    [17, 4],
    [6, 5],
  ])
    if (walls[p[1]][p[0]] === S.CORAL || walls[p[1]][p[0]] === S.KELP) walls[p[1]][p[0]] = -1; // keep paths clear
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 15 },
      from_beacon: { x: 2, y: 15 },
      from_sanctum: { x: 23, y: 3 },
    },
    exits: { to_beacon: { x: 2, y: 17, w: 1, h: 1 }, to_sanctum: { x: 24, y: 1, w: 1, h: 1 } },
    points: {
      pillar_1: { x: 8, y: 12 },
      pillar_2: { x: 14, y: 8 },
      pillar_3: { x: 19, y: 13 },
      trace: { x: 6, y: 5 },
      cache: { x: 17, y: 4 },
      drifter_a: { x: 12, y: 13 },
      drifter_b: { x: 20, y: 8 },
      chorister: { x: 8, y: 5 },
    },
  };
}

// ---------------------------------------------------------------- 5. Bell sanctum (dungeon)
export function sanctumLayout() {
  const W = 20;
  const H = 16;
  const { ground, walls } = room(W, H);
  // A round hall: engraved ring around the hanging bell.
  for (let y = 2; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const d = Math.hypot(x - 10, (y - 8) * 1.2);
      if (d > 8.2) walls[y][x] = D.WALL_FACE;
      else if (Math.abs(d - 5) < 0.6) ground[y][x] = D.ENGRAVED;
    }
  walls[6][10] = S.BELL; // the cracked Time Bell
  walls[4][10] = S.SEAL; // the Continuum Seal
  for (const [x, y] of [
    [6, 5],
    [14, 5],
    [6, 11],
    [14, 11],
  ])
    walls[y][x] = D.PILLAR;
  for (const y of [13, 14, 15]) walls[y][10] = -1; // way back down
  for (const y of [0, 1, 2, 3]) walls[y][10] = -1; // way on to Chapter 2
  seabed(ground, walls, 59);
  for (let y = 3; y < 15; y++)
    for (let x = 7; x <= 13; x++)
      if (walls[y][x] === S.CORAL || walls[y][x] === S.KELP) walls[y][x] = -1;
  ground[15][10] = D.ENGRAVED;
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 10, y: 13 }, from_ruins: { x: 10, y: 13 }, revive: { x: 10, y: 12 } },
    exits: { to_ruins: { x: 10, y: 15, w: 1, h: 1 }, to_chapter2: { x: 10, y: 1, w: 1, h: 1 } },
    points: { bellkeeper: { x: 10, y: 8 }, seal: { x: 10, y: 5 } },
  };
}

export const CH1_MAPS = [
  { id: 'map_ch1_shore_gate', tileset: 'wilds', build: shoreLayout },
  { id: 'map_ch1_abandoned_village', tileset: 'coastal', build: villageLayout },
  { id: 'map_ch1_sunset_beacon', tileset: 'wilds', build: beaconLayout },
  { id: 'map_ch1_sunken_corridors', tileset: 'sunken', build: ruinsLayout },
  { id: 'map_ch1_bell_sanctum', tileset: 'sunken', build: sanctumLayout },
];
