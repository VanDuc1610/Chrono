/**
 * Chapter 4 "The War Without End" map layouts (docs/story/CHAPTER_04_DESIGN.md §3, §13), shared by
 * scripts/generate-ch1-maps.js (`ch4`) and scripts/preview-ch1-maps.js (`ch4`).
 * Values are tile indices of each map's tileset (GID = index + 1); -1 = empty.
 * Outdoor maps use warfield_tileset (wilds tiles recoloured + war props 43-63); the hidden cellar,
 * the first tomb and Kuro's quiet room use the dungeon tileset.
 * `points` name the tiles maps.json wires (NPCs, POIs, dials, roamers); `gates` are wall tiles that
 * open (become walkable) with a story flag.
 */
import { D } from './ch1-layout.js';
import { Wd } from './wilds-layout.js';

/** warfield_tileset indices: wilds 0-42 + Chapter 4 tiles. */
export const W = {
  ...Wd,
  ARROWS: 43,
  BOARDS: 44,
  CRATER: 45,
  ASH: 46,
  BLOOD: 47,
  TENT: 48,
  PALISADE: 49,
  SPIKES: 50,
  BANNER: 51,
  WRECK: 52,
  SWORDS: 53,
  CHARIOT: 54,
  MOUND: 55,
  MIRROR: 56,
  ROCK: 57,
  TREATY: 58,
  ALTAR: 59,
  PILLAR: 60,
  SANDBAGS: 61,
  CRATES: 62,
  SEAL: 63,
};

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const fill = (g, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = v;
};
const place = (walls, list, v) => {
  for (const [x, y] of list) walls[y][x] = v;
};

/** Open battlefield: weighted ground, a border of `edge`. */
function field(width, height, seed, mix, edge = W.PALISADE) {
  const ground = grid(width, height, mix[0][0]);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const r = hash(x, y, seed);
      let acc = 0;
      for (const [tile, pct] of mix) {
        acc += pct;
        if (r < acc) {
          ground[y][x] = tile;
          break;
        }
      }
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) walls[y][x] = edge;
    }
  return { ground, walls };
}
/** Opens a border gap (walkable, a trail underfoot). */
const gap = (L, tiles, floor = W.TRAIL) => {
  for (const [x, y] of tiles) {
    L.walls[y][x] = -1;
    L.ground[y][x] = floor;
  }
};
const path = (L, x0, y0, x1, y1, floor = W.TRAIL) => fill(L.ground, x0, y0, x1, y1, floor);

function room(width, height, seed) {
  const ground = grid(width, height, D.FLOOR);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, seed) < 20) ground[y][x] = D.FLOOR_ALT;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) walls[y][x] = D.WALL_FACE;
      if (y === 1 && x > 0 && x < width - 1) walls[y][x] = D.WALL_TOP;
    }
  return { ground, walls };
}

const EARTH = [
  [W.LOAM, 70],
  [W.ARROWS, 8],
  [W.MUD, 12],
  [W.CRATER, 3],
  [W.MOSS, 7],
];

// ---------------------------------------------------------------- 1. Veridia encampment
export function encampmentVeridia() {
  const width = 26;
  const height = 16;
  const L = field(width, height, 401, EARTH);
  path(L, 1, 7, 24, 8);
  gap(L, [
    [25, 7],
    [25, 8],
  ]);
  L.walls[7][0] = L.walls[8][0] = W.GATE; // the Threshold behind Peter
  place(
    L.walls,
    [
      [3, 3],
      [7, 3],
      [3, 12],
      [21, 12],
      [22, 3],
    ],
    W.TENT,
  );
  place(L.walls, [[10, 4]], W.CRATES); // the courier's map table
  place(L.walls, [[19, 6]], W.CRATES); // the field courier box
  place(L.walls, [[13, 2]], W.BANNER);
  fill(L.walls, 15, 11, 17, 11, W.SANDBAGS);
  place(L.walls, [[11, 12]], W.CRATES);
  return {
    width,
    height,
    ...L,
    spawns: { default: { x: 2, y: 8 }, from_ch3: { x: 2, y: 8 }, from_trench: { x: 23, y: 8 } },
    exits: { to_trench: { x: 25, y: 7, w: 1, h: 2 } },
    points: {
      elder: { x: 4, y: 8 },
      aldric: { x: 12, y: 8 },
      bran: { x: 5, y: 10 },
      compass: { x: 7, y: 4 },
      leaflet: { x: 10, y: 5 },
      box: { x: 19, y: 6 },
      dial_dir: { x: 17, y: 9 },
      dial_angle: { x: 19, y: 9 },
      dial_star: { x: 21, y: 9 },
    },
  };
}

// ---------------------------------------------------------------- 2. Trench crossroads
export const TRENCH_DOOR = [
  { x: 26, y: 7 },
  { x: 26, y: 8 },
];
export function trenchCrossroads() {
  const width = 28;
  const height = 16;
  const L = field(width, height, 402, [
    [W.MUD, 60],
    [W.LOAM, 25],
    [W.BLOOD, 6],
    [W.CRATER, 4],
    [W.ARROWS, 5],
  ]);
  path(L, 1, 7, 26, 8, W.BOARDS);
  gap(
    L,
    [
      [0, 7],
      [0, 8],
      [27, 7],
      [27, 8],
    ],
    W.BOARDS,
  );
  for (let x = 3; x <= 24; x++) {
    if (![8, 15, 20].includes(x)) L.walls[5][x] = W.SANDBAGS;
    if (![10, 16, 22].includes(x)) L.walls[10][x] = W.SANDBAGS;
  }
  for (const t of TRENCH_DOOR) L.walls[t.y][t.x] = W.GATE;
  place(
    L.walls,
    [
      [4, 13],
      [24, 2],
    ],
    W.WRECK,
  );
  place(L.walls, [[13, 13]], W.SPIKES);
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 8 },
      from_camp: { x: 2, y: 8 },
      from_solkaris: { x: 24, y: 8 },
      revive: { x: 2, y: 8 },
    },
    exits: {
      to_camp: { x: 0, y: 7, w: 1, h: 2 },
      to_solkaris: { x: 27, y: 7, w: 1, h: 2 },
    },
    points: {
      journal: { x: 3, y: 3 },
      manual: { x: 9, y: 13 },
      ledger: { x: 14, y: 3 },
      codebook: { x: 21, y: 13 },
      sack_grain: { x: 6, y: 12 },
      sack_herbs: { x: 12, y: 3 },
      sack_sulfur: { x: 18, y: 12 },
      door: { x: 25, y: 7 },
      phalanx_a: { x: 8, y: 12 },
      phalanx_b: { x: 19, y: 3 },
      carrier: { x: 14, y: 12 },
    },
  };
}

// ---------------------------------------------------------------- 3. Sol-Karis outpost
export const SOLKARIS_GATE = [
  { x: 22, y: 7 },
  { x: 22, y: 8 },
];
export function encampmentSolkaris() {
  const width = 24;
  const height = 16;
  const L = field(width, height, 403, [
    [W.LOAM, 60],
    [W.FLAGSTONE, 20],
    [W.MUD, 15],
    [W.ARROWS, 5],
  ]);
  path(L, 1, 7, 22, 8);
  gap(L, [
    [0, 7],
    [0, 8],
    [23, 7],
    [23, 8],
  ]);
  for (const t of SOLKARIS_GATE) L.walls[t.y][t.x] = W.GATE;
  place(
    L.walls,
    [
      [4, 3],
      [18, 3],
      [4, 12],
    ],
    W.TENT,
  );
  place(L.walls, [[17, 12]], W.WRECK); // the collapsed store
  place(L.walls, [[12, 2]], W.BANNER);
  place(
    L.walls,
    [
      [9, 12],
      [10, 12],
    ],
    W.CRATES,
  );
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 8 },
      from_trench: { x: 2, y: 8 },
      from_valley: { x: 20, y: 8 },
    },
    exits: {
      to_trench: { x: 0, y: 7, w: 1, h: 2 },
      to_valley: { x: 23, y: 7, w: 1, h: 2 },
    },
    points: {
      kaelen: { x: 12, y: 5 },
      elion: { x: 6, y: 10 },
      rubble: { x: 17, y: 11 },
    },
  };
}

// ---------------------------------------------------------------- 4. Arrow-storm valley
export const VALLEY_GATE = [
  { x: 28, y: 7 },
  { x: 28, y: 8 },
];
export const VALLEY_ROCKS = [
  [6, 5],
  [6, 10],
  [12, 7],
  [17, 4],
  [17, 11],
  [22, 7],
];
export function arrowStormValley() {
  const width = 30;
  const height = 16;
  const L = field(
    width,
    height,
    404,
    [
      [W.ARROWS, 45],
      [W.LOAM, 40],
      [W.CRATER, 8],
      [W.MUD, 7],
    ],
    W.CLIFF,
  );
  path(L, 1, 7, 28, 8);
  gap(L, [
    [0, 7],
    [0, 8],
    [29, 7],
    [29, 8],
  ]);
  for (const t of VALLEY_GATE) L.walls[t.y][t.x] = W.GATE;
  for (const [x, y] of VALLEY_ROCKS) L.walls[y][x] = W.ROCK;
  place(
    L.walls,
    [
      [9, 2],
      [15, 13],
      [21, 2],
    ],
    W.MONOLITH,
  ); // the three small signal towers
  place(L.walls, [[26, 3]], W.MIRROR); // the observation tower's mirror
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 8 },
      from_solkaris: { x: 2, y: 8 },
      from_ridge: { x: 26, y: 8 },
      revive: { x: 2, y: 8 },
    },
    exits: {
      to_solkaris: { x: 0, y: 7, w: 1, h: 2 },
      to_ridge: { x: 29, y: 7, w: 1, h: 2 },
    },
    cover: VALLEY_ROCKS.map(([x, y]) => ({ x: x + 1, y })),
    points: {
      tower_grid: { x: 9, y: 3 },
      tower_wind: { x: 15, y: 12 },
      tower_smoke: { x: 21, y: 3 },
      mirror_dial: { x: 25, y: 5 },
      mirror_lever: { x: 27, y: 5 },
      sniper_a: { x: 13, y: 2 },
      sniper_b: { x: 20, y: 13 },
    },
  };
}

// ---------------------------------------------------------------- 5. Red ridge
export const RIDGE_WARD = [
  { x: 13, y: 1 },
  { x: 14, y: 1 },
  { x: 15, y: 1 },
];
export function redRidge() {
  const width = 28;
  const height = 18;
  const L = field(width, height, 405, [
    [W.LOAM, 50],
    [W.BLOOD, 20],
    [W.ARROWS, 15],
    [W.CRATER, 8],
    [W.MUD, 7],
  ]);
  path(L, 1, 8, 14, 9);
  path(L, 14, 1, 14, 9);
  gap(L, [
    [0, 8],
    [0, 9],
    [13, 0],
    [14, 0],
    [15, 0],
  ]);
  for (const t of RIDGE_WARD) L.walls[t.y][t.x] = W.SPIKES; // the blood ward round the fort
  place(
    L.walls,
    [
      [14, 4],
      [4, 9],
      [24, 9],
      [14, 10],
    ],
    W.MOUND,
  );
  fill(L.walls, 8, 6, 11, 6, W.PALISADE);
  fill(L.walls, 17, 13, 20, 13, W.PALISADE);
  place(
    L.walls,
    [
      [3, 4],
      [23, 15],
    ],
    W.WRECK,
  );
  place(L.walls, [[20, 3]], W.BANNER);
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 9 },
      from_valley: { x: 2, y: 9 },
      from_redoubt: { x: 14, y: 2 },
      revive: { x: 2, y: 9 },
    },
    exits: {
      to_valley: { x: 0, y: 8, w: 1, h: 2 },
      to_redoubt: { x: 13, y: 0, w: 3, h: 1 },
    },
    points: {
      dial_north: { x: 14, y: 5 },
      dial_west: { x: 4, y: 10 },
      dial_east: { x: 24, y: 10 },
      dial_center: { x: 14, y: 11 },
      incense: { x: 14, y: 13 },
      relic_haft: { x: 7, y: 15 },
      relic_blade: { x: 20, y: 15 },
      relic_limb: { x: 22, y: 3 },
      relic_pole: { x: 5, y: 3 },
      plaque: { x: 2, y: 14 },
      knight_a: { x: 9, y: 8 },
      knight_b: { x: 19, y: 11 },
      carrier_a: { x: 6, y: 13 },
      carrier_b: { x: 22, y: 6 },
      phalanx: { x: 18, y: 5 },
    },
  };
}

// ---------------------------------------------------------------- 6. Crimson redoubt
export const REDOUBT_GATE = [
  { x: 21, y: 7 },
  { x: 21, y: 8 },
];
export function crimsonRedoubt() {
  const width = 22;
  const height = 16;
  const L = field(width, height, 406, [
    [W.FLAGSTONE, 55],
    [W.BLOOD, 25],
    [W.LOAM, 20],
  ]);
  path(L, 11, 7, 11, 15);
  gap(L, [[11, 15]]);
  for (const t of REDOUBT_GATE) L.walls[t.y][t.x] = W.PALISADE;
  place(
    L.walls,
    [
      [4, 4],
      [17, 4],
      [4, 11],
      [17, 11],
    ],
    W.BANNER,
  );
  place(
    L.walls,
    [
      [7, 3],
      [14, 3],
    ],
    W.SPIKES,
  );
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 11, y: 13 },
      from_ridge: { x: 11, y: 13 },
      from_ramparts: { x: 19, y: 8 },
      revive: { x: 11, y: 13 },
    },
    exits: {
      to_ridge: { x: 11, y: 15, w: 1, h: 1 },
      to_ramparts: { x: 21, y: 7, w: 1, h: 2 },
    },
    points: { standard: { x: 11, y: 6 } },
  };
}

// ---------------------------------------------------------------- 7. Fallen ramparts
export const RAMPARTS_GATE = [
  { x: 24, y: 7 },
  { x: 24, y: 8 },
];
export function fallenRamparts() {
  const width = 26;
  const height = 16;
  const L = field(
    width,
    height,
    407,
    [
      [W.FLAGSTONE, 40],
      [W.LOAM, 35],
      [W.CRATER, 10],
      [W.ARROWS, 15],
    ],
    W.CLIFF,
  );
  path(L, 1, 7, 24, 8);
  gap(L, [
    [0, 7],
    [0, 8],
    [25, 7],
    [25, 8],
  ]);
  for (const t of RAMPARTS_GATE) L.walls[t.y][t.x] = W.GATE;
  place(
    L.walls,
    [
      [6, 4],
      [7, 4],
      [16, 3],
      [17, 11],
      [18, 11],
    ],
    W.WRECK,
  );
  place(L.walls, [[20, 6]], W.MONOLITH); // the trap lever
  L.ground[13][5] = W.HATCH; // the shelter hatch
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 8 },
      from_redoubt: { x: 2, y: 8 },
      from_ash: { x: 22, y: 8 },
      from_cellar: { x: 5, y: 11 },
      revive: { x: 2, y: 8 },
    },
    exits: {
      to_redoubt: { x: 0, y: 7, w: 1, h: 2 },
      to_ash: { x: 25, y: 7, w: 1, h: 2 },
      to_cellar: { x: 5, y: 13, w: 1, h: 1 },
    },
    points: {
      renard: { x: 19, y: 8 },
      bran: { x: 10, y: 11 },
      ambush_phalanx_a: { x: 12, y: 4 },
      ambush_phalanx_b: { x: 14, y: 11 },
      ambush_sniper: { x: 22, y: 3 },
      ambush_knight: { x: 9, y: 9 },
    },
  };
}

// ---------------------------------------------------------------- 8. Sentry cellar (hidden)
export function sentryCellar() {
  const width = 16;
  const height = 12;
  const L = room(width, height, 408);
  L.walls[11][8] = -1;
  L.ground[11][8] = D.ENGRAVED;
  place(
    L.walls,
    [
      [3, 3],
      [12, 3],
    ],
    D.PILLAR,
  );
  place(L.walls, [[8, 2]], D.ALTAR);
  return {
    width,
    height,
    ...L,
    spawns: { default: { x: 8, y: 9 }, from_ramparts: { x: 8, y: 9 } },
    exits: { to_ramparts: { x: 8, y: 11, w: 1, h: 1 } },
    points: { sentry: { x: 8, y: 4 }, dial_word: { x: 6, y: 6 }, answer: { x: 10, y: 6 } },
  };
}

// ---------------------------------------------------------------- 9. Ash plains
export const ASH_STAIRS = [{ x: 22, y: 4 }];
export function ashPlains() {
  const width = 28;
  const height = 18;
  const L = field(
    width,
    height,
    409,
    [
      [W.ASH, 60],
      [W.LOAM, 15],
      [W.MOSS, 15],
      [W.CRATER, 5],
      [W.ARROWS, 5],
    ],
    W.CLIFF,
  );
  path(L, 1, 8, 26, 9, W.ASH);
  gap(
    L,
    [
      [0, 8],
      [0, 9],
      [27, 8],
      [27, 9],
    ],
    W.ASH,
  );
  for (let k = 0; k < 18; k++) {
    const x = 2 + ((k * 7) % 23);
    const y = 2 + ((k * 5) % 14);
    if (y !== 8 && y !== 9 && L.walls[y][x] === -1) L.walls[y][x] = W.SWORDS;
  }
  place(L.walls, [[21, 4]], W.CHARIOT);
  for (const t of ASH_STAIRS) L.walls[t.y][t.x] = W.SWORDS; // hides the way down
  // Keep the points clear of the sword forest.
  for (const [x, y] of [
    [6, 4],
    [17, 14],
    [21, 5],
    [22, 5],
    [10, 10],
    [18, 7],
    [14, 13],
    [24, 12],
    [22, 6],
  ])
    L.walls[y][x] = -1;
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 9 },
      from_ramparts: { x: 2, y: 9 },
      from_monument: { x: 25, y: 9 },
      from_tomb: { x: 22, y: 6 },
      revive: { x: 2, y: 9 },
    },
    exits: {
      to_ramparts: { x: 0, y: 8, w: 1, h: 2 },
      to_monument: { x: 27, y: 8, w: 1, h: 2 },
      to_tomb: { x: 22, y: 4, w: 1, h: 1 },
    },
    points: {
      scrap_land: { x: 6, y: 4 },
      scrap_prisoners: { x: 17, y: 14 },
      chariot: { x: 21, y: 5 },
      wraith_a: { x: 10, y: 10 },
      wraith_b: { x: 18, y: 7 },
      phalanx: { x: 14, y: 13 },
      knight: { x: 24, y: 12 },
    },
  };
}

// ---------------------------------------------------------------- 10. Tomb of the First Fallen (hidden)
export function firstFallenTomb() {
  const width = 20;
  const height = 14;
  const L = room(width, height, 410);
  L.walls[13][10] = -1;
  L.ground[13][10] = D.ENGRAVED;
  place(L.walls, [[10, 2]], D.STELE); // the epitaph
  place(
    L.walls,
    [
      [4, 6],
      [8, 6],
      [12, 6],
      [16, 6],
    ],
    D.PILLAR,
  ); // the four pedestals
  place(L.walls, [[10, 10]], D.RELIQUARY); // the sealed sarcophagus
  return {
    width,
    height,
    ...L,
    spawns: { default: { x: 12, y: 12 }, from_ash: { x: 12, y: 12 } },
    exits: { to_ash: { x: 10, y: 13, w: 1, h: 1 } },
    points: {
      epitaph: { x: 10, y: 3 },
      dial_i: { x: 4, y: 7 },
      dial_ii: { x: 8, y: 7 },
      dial_iii: { x: 12, y: 7 },
      dial_iv: { x: 16, y: 7 },
      lid: { x: 10, y: 9 },
      guard: { x: 15, y: 10 },
    },
  };
}

// ---------------------------------------------------------------- 11. Monument of the Fallen
export const MONUMENT_GATE = [
  { x: 11, y: 0 },
  { x: 12, y: 0 },
  { x: 13, y: 0 },
];
export function monumentOfTheFallen() {
  const width = 24;
  const height = 16;
  const L = field(
    width,
    height,
    411,
    [
      [W.ASH, 45],
      [W.FLAGSTONE, 45],
      [W.MOSS, 10],
    ],
    W.CLIFF,
  );
  fill(L.ground, 5, 2, 18, 13, W.FLAGSTONE);
  path(L, 1, 7, 12, 8, W.FLAGSTONE);
  path(L, 12, 0, 12, 8, W.FLAGSTONE);
  gap(
    L,
    [
      [0, 7],
      [0, 8],
    ],
    W.ASH,
  );
  for (const t of MONUMENT_GATE) L.walls[t.y][t.x] = W.GATE;
  place(L.walls, [[12, 3]], W.ALTAR);
  place(L.walls, [[12, 8]], W.TREATY);
  place(
    L.walls,
    [
      [5, 3],
      [19, 3],
      [5, 13],
      [19, 13],
    ],
    W.PILLAR,
  );
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 2, y: 8 },
      from_ash: { x: 2, y: 8 },
      from_sanctum: { x: 12, y: 2 },
    },
    exits: {
      to_ash: { x: 0, y: 7, w: 1, h: 2 },
      to_sanctum: { x: 11, y: 0, w: 3, h: 1 },
    },
    points: {
      altar: { x: 12, y: 4 },
      seal_press: { x: 12, y: 7 },
      slot_1: { x: 9, y: 10 },
      slot_2: { x: 11, y: 10 },
      slot_3: { x: 13, y: 10 },
      slot_4: { x: 15, y: 10 },
      aldric: { x: 6, y: 11 },
      kaelen: { x: 8, y: 11 },
    },
  };
}

// ---------------------------------------------------------------- 12. Sanctum of Finality
export function sanctumOfFinality() {
  const width = 22;
  const height = 16;
  const L = field(
    width,
    height,
    412,
    [
      [W.FLAGSTONE, 80],
      [W.ASH, 20],
    ],
    W.CLIFF,
  );
  gap(L, [[11, 15]], W.FLAGSTONE);
  place(L.walls, [[11, 2]], W.SEAL);
  place(
    L.walls,
    [
      [4, 8],
      [17, 8],
      [7, 4],
    ],
    W.PILLAR,
  );
  place(
    L.walls,
    [
      [3, 3],
      [18, 3],
    ],
    W.SWORDS,
  );
  return {
    width,
    height,
    ...L,
    spawns: {
      default: { x: 11, y: 13 },
      from_monument: { x: 11, y: 13 },
      revive: { x: 11, y: 13 },
    },
    exits: { to_monument: { x: 11, y: 15, w: 1, h: 1 } },
    points: { war: { x: 11, y: 7 }, seal: { x: 11, y: 3 } },
  };
}

// ---------------------------------------------------------------- 13. The quiet ruined room (Kuro)
export function intervalSanctuary() {
  const width = 18;
  const height = 12;
  const L = room(width, height, 413);
  place(
    L.walls,
    [
      [3, 3],
      [14, 8],
    ],
    D.FRACTURE,
  );
  place(L.walls, [[13, 2]], D.CRYSTAL);
  return {
    width,
    height,
    ...L,
    spawns: { default: { x: 9, y: 9 }, from_sanctum: { x: 9, y: 9 } },
    exits: {},
    points: { kuro: { x: 9, y: 4 } },
  };
}

export const CH4_MAPS = [
  { id: 'map_ch4_encampment_veridia', tileset: 'warfield', build: encampmentVeridia },
  { id: 'map_ch4_trench_crossroads', tileset: 'warfield', build: trenchCrossroads },
  { id: 'map_ch4_encampment_solkaris', tileset: 'warfield', build: encampmentSolkaris },
  { id: 'map_ch4_arrow_storm_valley', tileset: 'warfield', build: arrowStormValley },
  { id: 'map_ch4_red_ridge_battlefield', tileset: 'warfield', build: redRidge },
  { id: 'map_ch4_crimson_redoubt', tileset: 'warfield', build: crimsonRedoubt },
  { id: 'map_ch4_fallen_ramparts', tileset: 'warfield', build: fallenRamparts },
  { id: 'map_ch4_sentry_cellar', tileset: 'dungeon', build: sentryCellar },
  { id: 'map_ch4_ash_plains', tileset: 'warfield', build: ashPlains },
  { id: 'map_ch4_tomb_of_the_first_fallen', tileset: 'dungeon', build: firstFallenTomb },
  { id: 'map_ch4_monument_of_the_fallen', tileset: 'warfield', build: monumentOfTheFallen },
  { id: 'map_ch4_sanctum_of_finality', tileset: 'warfield', build: sanctumOfFinality },
  { id: 'map_ch4_interval_sanctuary', tileset: 'dungeon', build: intervalSanctuary },
];
