/**
 * Chapter 8 "The Null Hour & The Convergence" map layouts (CHAPTER_08_DESIGN.md §5 with §17-18),
 * shared by scripts/generate-ch1-maps.js and scripts/preview-ch1-maps.js (`ch8`). Values are tile
 * indices of convergence_tileset; -1 = empty. `points` name the tiles scripts/wire-ch8.mjs wires.
 * Every spawn sits at least two tiles from its exit.
 */
import { D } from './ch1-layout.js';

/** convergence_tileset: dungeon 0-15 tinted + Chapter 8 tiles. Collision GID 4-48. */
export const Cv = {
  ...D,
  SEAM: 16,
  POST: 17,
  POST_LIT: 18,
  LIGHTHOUSE: 19,
  STACK: 20,
  BASKET_BOAT: 21,
  BULKHEAD: 22,
  WATER: 23,
  LEGION_GATE: 24,
  SHIELD_WALL: 25,
  WIRE: 26,
  CRATER: 27,
  RED_BANNER: 28,
  GOLD_BANNER: 29,
  SILVER_MIRROR: 30,
  PRISM: 31,
  BRONZE_MIRROR: 32,
  STELE_WALL: 33,
  NAME_SHELF: 34,
  LECTERN: 35,
  GEAR_WALL: 36,
  GEAR_DOOR: 37,
  SOCKET: 38,
  SOCKET_SET: 39,
  CLOCK_FACE: 40,
  TOWER_BELL: 41,
  PAGE_PEDESTAL: 42,
  COMMAND_TABLE: 43,
  BARRICADE: 44,
  CLOUD_PILLAR: 45,
  CRATES: 46,
  HOUR_HAND: 47,
  SAND: 48,
  DECK: 49,
  MARBLE: 50,
  MUD: 51,
  FLAG: 52,
  CLOUD: 53,
  PIER: 54,
  CATWALK: 55,
  BOARDS: 56,
  STAIR: 57,
  RAIL: 58,
  CLOCK_FLOOR: 59,
  TOWER_STAIR: 60,
  SEAM_PATH: 61,
  FADED: 62,
  ANCHOR_GLOW: 63,
};

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const fill = (g, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = v;
};
const place = (g, list, v) => {
  for (const [x, y] of list) g[y][x] = v;
};
const pt = (x, y) => ({ x, y });
const tiles = (x0, y0, x1, y1) => {
  const out = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(pt(x, y));
  return out;
};

/** A walled room of the convergence; `alt` speckles the floor (another world bleeding in). */
function room(width, height, seed, floor = Cv.SEAM_PATH, alt = Cv.FADED) {
  const ground = grid(width, height, floor);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, seed) < 6) ground[y][x] = alt;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) walls[y][x] = Cv.WALL_FACE;
      if (y === 1 && x > 0 && x < width - 1) walls[y][x] = Cv.WALL_TOP;
    }
  return { ground, walls };
}
const door = (L, list, floor = Cv.SEAM_PATH) => {
  for (const [x, y] of list) {
    L.walls[y][x] = -1;
    L.ground[y][x] = floor;
  }
};
const out = (width, height, L, spawns, points, extra = {}) => ({
  width,
  height,
  ground: L.ground,
  walls: L.walls,
  spawns,
  exits: {},
  points,
  ...extra,
});

// ================================================================== 1. Null rift landing (C01)
export const LANDING = {
  pier: tiles(8, 8, 9, 10),
  catwalk: tiles(16, 8, 17, 10),
};
export function nullRiftLanding() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 801, Cv.SAND, Cv.DECK);
  door(L, [[25, 9]]);
  fill(L.walls, 8, 2, 9, 16, Cv.WATER);
  fill(L.walls, 16, 2, 17, 16, Cv.SEAM);
  fill(L.ground, 10, 2, 15, 16, Cv.DECK);
  L.walls[7][5] = Cv.POST;
  L.walls[7][12] = Cv.POST;
  place(
    L.walls,
    [
      [3, 4],
      [21, 13],
    ],
    Cv.BASKET_BOAT,
  );
  place(
    L.walls,
    [
      [13, 13],
      [20, 4],
    ],
    Cv.CRATES,
  );
  return out(
    width,
    height,
    L,
    { default: pt(3, 9), from_ch7: pt(3, 9), from_shore: pt(22, 9) },
    { postA: pt(5, 7), postB: pt(12, 7), rift: pt(20, 5), bank: { x: 19, y: 3, w: 5, h: 13 } },
  );
}

// ================================================================== 2. Steel tide shore (C02)
export const SHORE = {
  zone1: pt(6, 4),
  zone2: tiles(13, 9, 17, 9),
  zone3: tiles(23, 14, 26, 14),
};
export function steelTideShore() {
  const width = 30;
  const height = 20;
  const L = room(width, height, 802, Cv.SAND, Cv.DECK);
  door(L, [
    [0, 10],
    [29, 10],
  ]);
  L.walls[1][29] = Cv.WALL_FACE;
  // Each zone is ringed by seam thread so its edge is easy to read.
  for (const [x0, y0, x1, y1] of [
    [3, 3, 9, 7],
    [12, 8, 18, 10],
    [22, 13, 27, 15],
  ]) {
    for (let x = x0; x <= x1; x++) {
      L.ground[y0][x] = Cv.SEAM_PATH;
      L.ground[y1][x] = Cv.SEAM_PATH;
    }
    for (let y = y0; y <= y1; y++) {
      L.ground[y][x0] = Cv.SEAM_PATH;
      L.ground[y][x1] = Cv.SEAM_PATH;
    }
  }
  L.walls[4][6] = Cv.FADED;
  L.walls[6][4] = Cv.POST;
  L.walls[11][15] = Cv.POST;
  L.walls[12][24] = Cv.POST;
  place(
    L.walls,
    [
      [14, 15],
      [8, 15],
    ],
    Cv.BASKET_BOAT,
  );
  place(
    L.walls,
    [
      [20, 4],
      [25, 6],
    ],
    Cv.STACK,
  );
  return out(
    width,
    height,
    L,
    { default: pt(3, 10), from_landing: pt(3, 10), from_market: pt(26, 10) },
    {
      posts: [pt(4, 6), pt(15, 11), pt(24, 12)],
      boat: pt(20, 14),
      na: pt(10, 12),
      coba: pt(19, 15),
      chalk: pt(11, 13),
      paper: pt(5, 16),
      foes: [pt(17, 5), pt(24, 17)],
    },
  );
}

// ================================================================== 3. Gear market (C03)
export function gearMarket() {
  const width = 28;
  const height = 20;
  const L = room(width, height, 803, Cv.DECK, Cv.SAND);
  door(L, [
    [0, 10],
    [27, 10],
  ]);
  L.walls[10][26] = Cv.GEAR_DOOR;
  fill(L.walls, 10, 3, 17, 4, Cv.GEAR_WALL);
  place(
    L.walls,
    [
      [12, 8],
      [15, 8],
    ],
    Cv.GEAR_WALL,
  );
  place(
    L.walls,
    [
      [4, 4],
      [6, 4],
      [21, 4],
      [23, 4],
    ],
    Cv.CRATES,
  );
  L.walls[15][23] = Cv.CRATES;
  place(
    L.walls,
    [
      [5, 15],
      [9, 15],
    ],
    Cv.BASKET_BOAT,
  );
  return out(
    width,
    height,
    L,
    {
      default: pt(3, 10),
      from_foundry_gate: pt(23, 10),
      from_shore: pt(3, 10),
      from_vault: pt(23, 13),
    },
    {
      gears: [pt(12, 8), pt(15, 8)],
      ivo: pt(14, 11),
      notebook: pt(9, 9),
      door: pt(26, 10),
      vault: pt(23, 15),
      secret: pt(4, 5),
      foes: [pt(8, 14), pt(20, 15)],
    },
  );
}

// ================================================================== 4. Drowned foundry
export function drownedFoundry() {
  const width = 26;
  const height = 20;
  const L = room(width, height, 804, Cv.DECK, Cv.MUD);
  door(L, [
    [0, 10],
    [13, 0],
  ]);
  L.walls[1][13] = -1;
  fill(L.walls, 6, 5, 7, 14, Cv.BULKHEAD);
  fill(L.walls, 18, 5, 19, 14, Cv.BULKHEAD);
  for (const y of [9, 10]) {
    L.walls[y][6] = -1;
    L.walls[y][7] = -1;
    L.walls[y][18] = -1;
    L.walls[y][19] = -1;
  }
  place(
    L.walls,
    [
      [11, 4],
      [15, 4],
    ],
    Cv.STACK,
  );
  return out(
    width,
    height,
    L,
    { default: pt(3, 10), from_market: pt(3, 10), from_forum: pt(13, 4) },
    {
      bells: [pt(12, 9), pt(22, 6)],
      foe: pt(22, 14),
      memory: { x: 10, y: 8, w: 6, h: 5 },
      crucible: pt(13, 15),
    },
  );
}

// ================================================================== 5. Ragged forum (C04)
export function raggedForum() {
  const width = 30;
  const height = 20;
  const L = room(width, height, 805, Cv.MARBLE, Cv.MUD);
  door(L, [
    [15, 19],
    [29, 10],
  ]);
  L.walls[10][28] = Cv.LEGION_GATE;
  place(
    L.walls,
    [
      [9, 5],
      [13, 5],
      [17, 5],
      [21, 5],
    ],
    Cv.RED_BANNER,
  );
  place(
    L.walls,
    [
      [4, 9],
      [4, 13],
    ],
    Cv.STELE_WALL,
  );
  L.walls[9][25] = Cv.GOLD_BANNER;
  place(
    L.walls,
    [
      [7, 15],
      [22, 15],
    ],
    Cv.CRATER,
  );
  return out(
    width,
    height,
    L,
    { default: pt(15, 16), from_foundry: pt(15, 16), from_barracks: pt(25, 10) },
    {
      banners: [pt(9, 6), pt(13, 6), pt(17, 6), pt(21, 6)],
      clues: [pt(5, 9), pt(5, 13), pt(24, 9)],
      lyra: pt(15, 9),
      gate: pt(28, 10),
      paper: pt(26, 16),
      foes: [pt(10, 12), pt(20, 12)],
    },
  );
}

// ================================================================== 6. Twin-era barracks (C05)
export const BARRACKS = {
  gap1: [pt(10, 10), pt(10, 11)],
  gap2: [pt(20, 10), pt(20, 11)],
  step3: [pt(21, 10), pt(21, 11)],
  gate: [pt(29, 10), pt(29, 11)],
  barricade: pt(5, 20),
};
export function twinEraBarracks() {
  const width = 30;
  const height = 22;
  const L = room(width, height, 806, Cv.MUD, Cv.MARBLE);
  door(L, [
    [0, 10],
    [29, 10],
    [29, 11],
    [5, 21],
  ]);
  fill(L.walls, 10, 2, 10, 20, Cv.BULKHEAD);
  fill(L.walls, 20, 2, 20, 20, Cv.BULKHEAD);
  fill(L.ground, 11, 2, 19, 20, Cv.MARBLE);
  fill(L.ground, 21, 2, 28, 20, Cv.MUD);
  for (const t of [...BARRACKS.gap1, ...BARRACKS.gap2]) L.walls[t.y][t.x] = Cv.WALL_FACE;
  for (const t of BARRACKS.gate) L.walls[t.y][t.x] = Cv.WIRE;
  for (const t of BARRACKS.step3) L.walls[t.y][t.x] = Cv.SHIELD_WALL;
  L.walls[20][5] = Cv.BARRICADE;
  L.walls[6][4] = Cv.POST;
  L.walls[6][15] = Cv.POST;
  L.walls[6][25] = Cv.POST;
  place(
    L.walls,
    [
      [17, 3],
      [17, 17],
    ],
    Cv.CLOUD_PILLAR,
  );
  place(
    L.walls,
    [
      [3, 15],
      [7, 3],
    ],
    Cv.CRATES,
  );
  return out(
    width,
    height,
    L,
    {
      default: pt(2, 10),
      from_forum: pt(2, 10),
      from_bridge: pt(26, 10),
      from_archive: pt(5, 18),
    },
    {
      posts: [pt(4, 6), pt(15, 6), pt(25, 6)],
      kuro: pt(18, 7),
      bran: pt(14, 14),
      compass: pt(3, 18),
      barricade: pt(5, 20),
      legion: [pt(6, 13), pt(24, 15)],
      wraiths: [pt(14, 12), pt(25, 17)],
    },
  );
}

// ================================================================== 7. Verdict bridge (mini-boss)
export function verdictBridge() {
  const width = 24;
  const height = 18;
  const L = room(width, height, 807, Cv.MARBLE, Cv.MUD);
  door(L, [
    [0, 9],
    [12, 0],
  ]);
  L.walls[1][12] = Cv.LEGION_GATE;
  fill(L.walls, 1, 2, 4, 6, Cv.WATER);
  fill(L.walls, 19, 2, 22, 6, Cv.WATER);
  fill(L.walls, 1, 12, 4, 16, Cv.WATER);
  fill(L.walls, 19, 12, 22, 16, Cv.WATER);
  place(
    L.walls,
    [
      [8, 4],
      [16, 4],
    ],
    Cv.RED_BANNER,
  );
  return out(
    width,
    height,
    L,
    { default: pt(3, 9), from_barracks: pt(3, 9), from_library: pt(12, 4) },
    {
      praetor: pt(12, 6),
      confront: { x: 9, y: 8, w: 6, h: 3 },
      gate: pt(12, 1),
      secret: pt(20, 9),
      aldric: pt(15, 9),
    },
  );
}

// ================================================================== 8. Ash stair library (C06)
export const LIBRARY = {
  shelves: tiles(6, 3, 21, 3),
  door: pt(27, 11),
};
export function ashStairLibrary() {
  const width = 28;
  const height = 22;
  const L = room(width, height, 808, Cv.CLOUD, Cv.FLAG);
  door(L, [
    [14, 21],
    [27, 11],
  ]);
  L.walls[11][27] = Cv.NAME_SHELF;
  fill(L.walls, 6, 3, 21, 3, Cv.NAME_SHELF);
  place(
    L.walls,
    [
      [3, 8],
      [24, 8],
    ],
    Cv.STELE_WALL,
  );
  place(
    L.walls,
    [
      [8, 10],
      [9, 10],
      [18, 10],
      [19, 10],
    ],
    Cv.LECTERN,
  );
  place(
    L.walls,
    [
      [3, 15],
      [24, 15],
    ],
    Cv.CLOUD_PILLAR,
  );
  return out(
    width,
    height,
    L,
    { default: pt(14, 18), from_bridge: pt(14, 18), from_ossuary: pt(24, 11) },
    {
      altar1: [pt(8, 10), pt(9, 10)],
      altar2: [pt(18, 10), pt(19, 10)],
      bia: [pt(4, 8), pt(23, 8)],
      neris: pt(13, 13),
      solon: pt(5, 17),
      paper: pt(22, 18),
      foes: [pt(7, 15), pt(20, 15)],
    },
  );
}

// ================================================================== 9. Mirror ossuary (C07)
export const OSSUARY = {
  lamp: pt(2, 4),
  m1: pt(10, 4),
  m2: pt(18, 4),
  target: pt(18, 12),
  door: pt(13, 0),
};
export function mirrorOssuary() {
  const width = 26;
  const height = 20;
  const L = room(width, height, 809, Cv.FLAG, Cv.CLOUD);
  door(L, [
    [0, 10],
    [13, 0],
  ]);
  L.walls[1][13] = Cv.STELE_WALL;
  // The beam row and column stay clear of props.
  L.walls[4][2] = Cv.LECTERN;
  L.walls[4][10] = Cv.SILVER_MIRROR;
  L.walls[4][18] = Cv.FADED;
  L.walls[8][10] = Cv.STELE_WALL;
  L.walls[12][18] = Cv.SOCKET;
  L.walls[4][24] = Cv.STELE_WALL;
  L.walls[8][7] = Cv.POST;
  L.walls[8][15] = Cv.POST;
  place(
    L.walls,
    [
      [4, 14],
      [22, 16],
    ],
    Cv.CLOUD_PILLAR,
  );
  fill(L.walls, 20, 13, 20, 18, Cv.STELE_WALL);
  L.walls[15][20] = -1;
  return out(
    width,
    height,
    L,
    { default: pt(2, 10), from_library: pt(2, 10), from_sanctum: pt(13, 4) },
    {
      posts: [pt(7, 8), pt(15, 8)],
      elion: pt(5, 16),
      warden: pt(23, 16),
      secret: pt(24, 17),
      note: pt(4, 7),
    },
  );
}

// ================================================================== 10. Torn page sanctum (C08)
export function tornPageSanctum() {
  const width = 22;
  const height = 18;
  const L = room(width, height, 810, Cv.CLOUD, Cv.FADED);
  door(L, [
    [11, 17],
    [21, 9],
  ]);
  L.walls[9][20] = Cv.STELE_WALL;
  place(
    L.walls,
    [
      [8, 6],
      [11, 6],
      [14, 6],
    ],
    Cv.PAGE_PEDESTAL,
  );
  place(
    L.walls,
    [
      [3, 4],
      [18, 4],
    ],
    Cv.CLOUD_PILLAR,
  );
  return out(
    width,
    height,
    L,
    { default: pt(11, 14), from_ossuary: pt(11, 14), from_plaza: pt(17, 9) },
    {
      slots: [pt(8, 7), pt(11, 7), pt(14, 7)],
      strips: [pt(4, 10), pt(11, 11), pt(17, 12)],
      forgotten: pt(11, 3),
      gate: pt(20, 9),
    },
  );
}

// ================================================================== 11. Convergence plaza (C09)
export function convergencePlaza() {
  const width = 32;
  const height = 24;
  const L = room(width, height, 811, Cv.SEAM_PATH, Cv.MARBLE);
  door(L, [
    [0, 12],
    [16, 0],
    [16, 23],
    [31, 12],
  ]);
  L.walls[1][16] = Cv.LEGION_GATE;
  L.walls[22][16] = Cv.BARRICADE;
  L.walls[12][30] = Cv.BARRICADE;
  L.walls[11][16] = Cv.COMMAND_TABLE;
  // Four broken gates (N, E, S, W) marked by banners.
  place(
    L.walls,
    [
      [14, 3],
      [18, 3],
      [27, 10],
      [27, 14],
      [14, 20],
      [18, 20],
      [4, 10],
      [4, 14],
    ],
    Cv.RED_BANNER,
  );
  return out(
    width,
    height,
    L,
    { default: pt(3, 12), from_sanctum: pt(3, 12), from_tower: pt(16, 4) },
    {
      table: [pt(15, 12), pt(16, 12), pt(17, 12), pt(16, 13)],
      gates: { n: pt(16, 4), e: pt(26, 12), s: pt(16, 19), w: pt(5, 12) },
      mai: pt(10, 7),
      north: pt(16, 1),
      whole: { x: 1, y: 2, w: 30, h: 20 },
      fb: { x: 13, y: 14, w: 7, h: 3 },
    },
  );
}

// ================================================================== 12. Anchor tower base (C10)
export function anchorTowerBase() {
  const width = 24;
  const height = 20;
  const L = room(width, height, 812, Cv.CLOCK_FLOOR, Cv.SEAM_PATH);
  door(L, [
    [12, 19],
    [12, 0],
  ]);
  L.walls[1][12] = Cv.CLOCK_FACE;
  // Six sockets on a clock dial around the stair: 12, 2, 4, 6, 8, 10 o'clock.
  const ring = [
    [12, 4],
    [17, 6],
    [17, 11],
    [12, 13],
    [7, 11],
    [7, 6],
  ];
  place(L.walls, ring, Cv.SOCKET);
  place(
    L.walls,
    [
      [3, 3],
      [20, 3],
    ],
    Cv.TOWER_BELL,
  );
  return out(
    width,
    height,
    L,
    { default: pt(12, 16), from_plaza: pt(12, 16), from_gears: pt(12, 3) },
    {
      sockets: ring.map(([x, y]) => pt(x, y)),
      stair: pt(12, 1),
      mira: pt(4, 15),
      secret: pt(20, 16),
    },
  );
}

// ================================================================== 13. Anchor tower gears
export const GEARS = { gap: tiles(5, 11, 18, 11), lift: tiles(11, 5, 12, 5) };
export function anchorTowerGears() {
  const width = 24;
  const height = 24;
  const L = room(width, height, 813, Cv.TOWER_STAIR, Cv.CLOCK_FLOOR);
  door(L, [
    [12, 23],
    [12, 0],
    [23, 18],
  ]);
  L.walls[1][12] = -1;
  fill(L.walls, 1, 11, 22, 11, Cv.SEAM);
  fill(L.walls, 1, 5, 22, 5, Cv.GEAR_WALL);
  L.walls[18][22] = Cv.GEAR_DOOR;
  L.walls[14][4] = Cv.POST;
  L.walls[8][19] = Cv.POST;
  place(
    L.walls,
    [
      [3, 19],
      [20, 20],
      [6, 8],
    ],
    Cv.GEAR_WALL,
  );
  return out(
    width,
    height,
    L,
    { default: pt(12, 20), from_base: pt(12, 20), from_heart: pt(12, 3), from_echo: pt(19, 18) },
    {
      posts: [pt(4, 14), pt(19, 8)],
      echoDoor: pt(22, 18),
      foes: [pt(8, 16), pt(16, 15), pt(8, 8), pt(16, 8)],
    },
  );
}

// ================================================================== 14. Null clock heart (boss)
export function nullClockHeart() {
  const width = 22;
  const height = 18;
  const L = room(width, height, 814, Cv.CLOCK_FLOOR, Cv.CLOCK_FLOOR);
  door(L, [
    [11, 17],
    [11, 0],
  ]);
  L.walls[1][11] = Cv.CLOCK_FACE;
  L.walls[14][6] = Cv.HOUR_HAND;
  place(
    L.walls,
    [
      [3, 4],
      [18, 4],
      [3, 12],
      [18, 12],
    ],
    Cv.GEAR_WALL,
  );
  return out(
    width,
    height,
    L,
    { default: pt(11, 14), from_gears: pt(11, 14), from_crown: pt(11, 4) },
    { herald: pt(11, 6), confront: { x: 8, y: 9, w: 7, h: 3 }, gate: pt(11, 1) },
  );
}

// ================================================================== 15. Tower crown (end)
export function towerCrown() {
  const width = 20;
  const height = 16;
  const L = room(width, height, 815, Cv.TOWER_STAIR, Cv.CLOCK_FLOOR);
  door(L, [[10, 15]]);
  fill(L.walls, 1, 2, 18, 3, Cv.SEAM);
  L.walls[4][10] = Cv.CLOCK_FACE;
  return out(
    width,
    height,
    L,
    { default: pt(10, 12), from_heart: pt(10, 12) },
    { edge: { x: 7, y: 6, w: 6, h: 3 }, crane: pt(4, 6) },
  );
}

// ================================================================== A. Hidden war archive (C11)
export function hiddenWarArchive() {
  const width = 18;
  const height = 14;
  const L = room(width, height, 816, Cv.MUD, Cv.MARBLE);
  door(L, [[9, 0]]);
  L.walls[1][9] = -1;
  place(
    L.walls,
    [
      [3, 4],
      [14, 4],
      [3, 10],
      [14, 10],
    ],
    Cv.SHIELD_WALL,
  );
  place(
    L.walls,
    [
      [7, 7],
      [9, 7],
      [11, 7],
    ],
    Cv.GEAR_WALL,
  );
  L.walls[11][9] = Cv.LEGION_GATE;
  return out(
    width,
    height,
    L,
    { default: pt(9, 3), from_barracks: pt(9, 3) },
    { dials: [pt(7, 7), pt(9, 7), pt(11, 7)], plate: pt(5, 7), chest: pt(9, 11) },
  );
}

// ================================================================== B. Blank ledger vault (C12)
export function blankLedgerVault() {
  const width = 16;
  const height = 12;
  const L = room(width, height, 817, Cv.DECK, Cv.SAND);
  door(L, [[8, 11]]);
  L.walls[4][8] = Cv.LECTERN;
  place(
    L.walls,
    [
      [3, 3],
      [12, 3],
    ],
    Cv.CRATES,
  );
  return out(
    width,
    height,
    L,
    { default: pt(8, 8), from_market: pt(8, 8) },
    { ledger: pt(8, 4), name: pt(8, 6), safe: pt(12, 6) },
  );
}

// ================================================================== C. Sixfold echo hall (C13)
export function sixfoldEchoHall() {
  const width = 22;
  const height = 18;
  const L = room(width, height, 818, Cv.CLOCK_FLOOR, Cv.SEAM_PATH);
  door(L, [[0, 9]]);
  const pillars = [
    [5, 4],
    [11, 3],
    [16, 4],
    [16, 13],
    [11, 14],
    [5, 13],
  ];
  place(L.walls, pillars, Cv.SOCKET);
  return out(
    width,
    height,
    L,
    { default: pt(3, 9), from_gears: pt(3, 9) },
    {
      pillars: pillars.map(([x, y]) => pt(x, y)),
      echo: pt(11, 9),
      confront: { x: 8, y: 7, w: 2, h: 5 },
    },
  );
}

export const CH8_MAPS = [
  { id: 'map_ch8_null_rift_landing', tileset: 'convergence', build: nullRiftLanding },
  { id: 'map_ch8_steel_tide_shore', tileset: 'convergence', build: steelTideShore },
  { id: 'map_ch8_gear_market', tileset: 'convergence', build: gearMarket },
  { id: 'map_ch8_drowned_foundry', tileset: 'convergence', build: drownedFoundry },
  { id: 'map_ch8_ragged_forum', tileset: 'convergence', build: raggedForum },
  { id: 'map_ch8_twin_era_barracks', tileset: 'convergence', build: twinEraBarracks },
  { id: 'map_ch8_verdict_bridge', tileset: 'convergence', build: verdictBridge },
  { id: 'map_ch8_ash_stair_library', tileset: 'convergence', build: ashStairLibrary },
  { id: 'map_ch8_mirror_ossuary', tileset: 'convergence', build: mirrorOssuary },
  { id: 'map_ch8_torn_page_sanctum', tileset: 'convergence', build: tornPageSanctum },
  { id: 'map_ch8_convergence_plaza', tileset: 'convergence', build: convergencePlaza },
  { id: 'map_ch8_anchor_tower_base', tileset: 'convergence', build: anchorTowerBase },
  { id: 'map_ch8_anchor_tower_gears', tileset: 'convergence', build: anchorTowerGears },
  { id: 'map_ch8_null_clock_heart', tileset: 'convergence', build: nullClockHeart },
  { id: 'map_ch8_tower_crown', tileset: 'convergence', build: towerCrown },
  { id: 'map_ch8_hidden_war_archive', tileset: 'convergence', build: hiddenWarArchive },
  { id: 'map_ch8_blank_ledger_vault', tileset: 'convergence', build: blankLedgerVault },
  { id: 'map_ch8_sixfold_echo_hall', tileset: 'convergence', build: sixfoldEchoHall },
];
