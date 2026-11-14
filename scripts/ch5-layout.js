/**
 * Chapter 5 "The Garden of Infinite Possibilities" map layouts (CHAPTER_05_DESIGN.md §3,
 * CHAPTER_05_EXPANSION.md §4, §9), shared by scripts/generate-ch1-maps.js and
 * scripts/preview-ch1-maps.js (`ch5`). Values are tile indices of each map's tileset; -1 = empty.
 *
 * Maps with two branches carry extra layers `Ground_Pruned` / `Walls_Pruned` (maps.json
 * layerVariants switch to them while `branch_<map>_pruned` is set). `points` name the tiles that
 * scripts/wire-ch5.mjs wires; gate lists are wall tiles opened by story flags.
 */
import { D } from './ch1-layout.js';
import { C } from './coastal-layout.js';

/** interval_tileset: sunken 0-31 tinted + Chapter 5 tiles. Collision GID 4-44. */
export const I = {
  ...D,
  WATER: 20,
  SAND: 21,
  VOID: 32,
  SPROUT: 33,
  TREE: 34,
  P_SILVER: 35,
  P_COPPER: 36,
  P_IRON: 37,
  THRONE: 38,
  ANCHOR: 39,
  SEAL: 40,
  GENEALOGY: 41,
  STELE: 42,
  PLOT: 43,
  PLANK: 44,
  SHADOW: 45,
  ISLE_V: 46,
  ISLE_G: 47,
};
/** steel_tileset: dungeon 0-15 tinted + Chapter 5 tiles. Collision GID 4-28. */
export const St = {
  ...D,
  GEN: 16,
  SWITCH: 17,
  CORE: 18,
  CLOCKTOWER: 19,
  PIPES: 20,
  ABYSS: 21,
  BUNK: 22,
  CHALKWALL: 23,
  WALLCLOCK: 24,
  SAFE: 25,
  BENCH: 26,
  PHOTO: 27,
  PLANK: 28,
  SHADOW: 29,
  WOOD: 30,
  GRATE: 31,
};

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const copy = (g) => g.map((r) => [...r]);
const fill = (g, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = v;
};
const place = (g, list, v) => {
  for (const [x, y] of list) g[y][x] = v;
};

/** A walled room of the dungeon-family tilesets (interval / steel). */
function room(width, height, seed, floor = D.FLOOR, alt = D.FLOOR_ALT) {
  const ground = grid(width, height, floor);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, seed) < 20) ground[y][x] = alt;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) walls[y][x] = D.WALL_FACE;
      if (y === 1 && x > 0 && x < width - 1) walls[y][x] = D.WALL_TOP;
    }
  return { ground, walls };
}
const door = (L, tiles, floor = D.ENGRAVED) => {
  for (const [x, y] of tiles) {
    L.walls[y][x] = -1;
    L.ground[y][x] = floor;
  }
};
/** The pruned branch of an interval map: the floor greys and cracks, edges crumble to void. */
function prunedInterval(L, seed) {
  const ground = copy(L.ground);
  const walls = copy(L.walls);
  for (let y = 0; y < ground.length; y++)
    for (let x = 0; x < ground[0].length; x++) {
      const r = hash(x, y, seed);
      if (r < 35) ground[y][x] = I.ISLE_G;
      else if (r < 45) ground[y][x] = I.SAND;
    }
  return { ground, walls };
}
/** The pruned branch of a steel map: rust, grating, rubble. */
function prunedSteel(L, seed) {
  const ground = copy(L.ground);
  const walls = copy(L.walls);
  for (let y = 0; y < ground.length; y++)
    for (let x = 0; x < ground[0].length; x++) {
      const r = hash(x, y, seed);
      if (r < 30) ground[y][x] = St.GRATE;
      else if (r < 40) ground[y][x] = D.FRACTURE;
    }
  return { ground, walls };
}
const branches = (living, pruned) => ({
  ground: living.ground,
  walls: living.walls,
  extraLayers: { Ground_Pruned: pruned.ground, Walls_Pruned: pruned.walls },
});

// ================================================================== 1. Interval shore (branches)
export function intervalShore() {
  const width = 24;
  const height = 14;
  const L = room(width, height, 501, I.FLOOR, I.SAND);
  door(L, [[23, 7]]);
  // Living: a chasm splits the shore. Pruned: islands bridge it.
  fill(L.walls, 14, 2, 15, 12, I.VOID);
  place(L.walls, [[8, 5]], I.SPROUT);
  place(L.walls, [[20, 5]], I.SPROUT); // a second sprout on the far bank
  place(
    L.walls,
    [
      [4, 3],
      [19, 3],
      [5, 11],
      [20, 11],
    ],
    I.TREE,
  );
  const P = prunedInterval(L, 502);
  fill(P.walls, 14, 2, 15, 12, I.VOID);
  fill(P.walls, 14, 7, 15, 7, -1);
  fill(P.ground, 14, 7, 15, 7, I.ISLE_V);
  return {
    width,
    height,
    ...branches(L, P),
    spawns: { default: { x: 2, y: 7 }, from_ch4: { x: 2, y: 7 }, from_garden: { x: 21, y: 7 } },
    exits: { to_garden: { x: 23, y: 7, w: 1, h: 1 } },
    points: { kuro: { x: 11, y: 7 }, sprout: { x: 8, y: 6 }, sprout_east: { x: 20, y: 6 } },
  };
}

// ================================================================== 2. Seed garden (branches)
export const ROCK_SPOTS = { north: [21, 2], east: [22, 3], south: [21, 4], west: [20, 3] };
export function seedGarden() {
  const width = 28;
  const height = 16;
  const L = room(width, height, 503, I.FLOOR, I.SAND);
  door(L, [
    [0, 8],
    [27, 8],
    [27, 3],
  ]);
  // The cleft: only (16,8) crosses it.
  fill(L.walls, 16, 2, 16, 14, I.VOID);
  for (let k = 0; k < 14; k++) {
    const x = 3 + ((k * 5) % 11);
    const y = 3 + ((k * 7) % 10);
    if (y !== 8 && L.walls[y][x] === -1) L.walls[y][x] = I.TREE;
  }
  place(L.walls, [[13, 8]], I.SPROUT);
  place(L.walls, [[19, 2]], I.SPROUT); // the sun-stone court has its own sprout
  // The sun-stone court (EX-01) north-east: four pedestals round a centre.
  fill(L.ground, 19, 2, 23, 5, I.ENGRAVED);
  const P = prunedInterval(L, 504);
  // Pruned: beyond the cleft there is nothing.
  fill(P.walls, 17, 6, 26, 14, I.VOID);
  fill(P.walls, 16, 8, 16, 8, I.VOID);
  P.walls[8][27] = I.VOID;
  // Keep the points clear.
  for (const [x, y] of [
    [6, 12],
    [12, 3],
    [3, 13],
    [25, 13],
    [15, 8],
    [10, 8],
    [21, 3],
    [22, 5],
    [21, 5],
    [24, 4],
    [7, 5],
  ]) {
    L.walls[y][x] = -1;
    P.walls[y][x] = -1;
  }
  return {
    width,
    height,
    ...branches(L, P),
    spawns: {
      default: { x: 2, y: 8 },
      from_shore: { x: 2, y: 8 },
      from_alpha: { x: 25, y: 8 },
      from_greenhouse: { x: 25, y: 3 },
      from_uprooted: { x: 4, y: 12 },
      from_old_seeds: { x: 12, y: 4 },
      gap_west: { x: 14, y: 8 },
    },
    exits: {
      to_shore: { x: 0, y: 8, w: 1, h: 1 },
      to_alpha: { x: 27, y: 8, w: 1, h: 1 },
      to_greenhouse: { x: 27, y: 3, w: 1, h: 1 },
    },
    gap: [{ x: 16, y: 8 }],
    points: {
      sprout: { x: 13, y: 9 },
      sprout_court: { x: 19, y: 3 },
      plank: { x: 6, y: 12 },
      gap: { x: 15, y: 8 },
      old_seeds: { x: 12, y: 3 },
      uprooted: { x: 3, y: 13 },
      seed: { x: 25, y: 13 },
      rock: { x: 21, y: 3 },
      sensor: { x: 21, y: 5 },
      sun_stele: { x: 24, y: 4 },
      phantom_a: { x: 7, y: 5 },
      phantom_b: { x: 10, y: 12 },
      gardener: { x: 23, y: 11 },
    },
  };
}

// ================================================================== 3. Glass greenhouse (branches)
export function glassGreenhouse() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 505, I.SAND, I.FLOOR);
  door(L, [[0, 8]]);
  place(L.walls, [[11, 4]], I.TREE); // the Moon-grass bed
  place(L.walls, [[19, 13]], I.SPROUT);
  place(
    L.walls,
    [
      [3, 3],
      [18, 3],
      [3, 13],
    ],
    I.CRYSTAL,
  );
  const P = prunedInterval(L, 506);
  return {
    width,
    height,
    ...branches(L, P),
    spawns: { default: { x: 2, y: 8 }, from_garden: { x: 2, y: 8 } },
    exits: { to_garden: { x: 0, y: 8, w: 1, h: 1 } },
    points: {
      flower: { x: 11, y: 5 },
      journal: { x: 5, y: 4 },
      humidity: { x: 8, y: 8 },
      temperature: { x: 11, y: 8 },
      airflow: { x: 14, y: 8 },
      pump: { x: 11, y: 10 },
      sprout: { x: 19, y: 12 },
      chime_bronze: { x: 4, y: 13 },
      chime_silver: { x: 18, y: 4 },
      chime_glass: { x: 4, y: 3 },
      hook_1: { x: 15, y: 12 },
      hook_2: { x: 16, y: 12 },
      hook_3: { x: 17, y: 12 },
      ring_up: { x: 16, y: 14 },
      gardener: { x: 15, y: 6 },
      phantom: { x: 6, y: 11 },
    },
  };
}

// ================================================================== 4. Alpha town (coastal)
export const ALPHA_TOWER_GATE = [
  { x: 14, y: 0 },
  { x: 15, y: 0 },
];
export function alphaTown() {
  const width = 30;
  const height = 18;
  const ground = grid(width, height, C.SAND);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, 507) < 18) ground[y][x] = C.SAND_SHELLS;
      if (x === 0 || x === width - 1 || y === 0) walls[y][x] = C.STONE_FENCE;
      if (y >= height - 2) walls[y][x] = C.WATER;
    }
  fill(ground, 1, 8, 28, 9, C.PATH);
  fill(ground, 14, 1, 15, 8, C.PATH);
  fill(ground, 22, 9, 23, 15, C.PIER);
  walls[8][0] = walls[9][0] = -1;
  ground[8][0] = ground[9][0] = C.PATH;
  for (const t of ALPHA_TOWER_GATE) walls[t.y][t.x] = C.STONE_FENCE;
  // The clock shop (north-west) and houses.
  fill(walls, 3, 2, 9, 4, C.ROOF);
  fill(walls, 3, 5, 9, 6, C.LIME_WALL);
  walls[6][6] = C.DOOR;
  fill(walls, 18, 2, 24, 4, C.ROOF);
  fill(walls, 18, 5, 24, 6, C.WALL_WINDOW);
  place(
    walls,
    [
      [11, 12],
      [26, 4],
    ],
    C.PALM_TRUNK,
  );
  place(walls, [[11, 11]], C.PALM_CROWN);
  place(walls, [[17, 12]], C.BANH_CAN_STALL);
  place(walls, [[27, 12]], C.BASKET_BOAT);
  place(walls, [[6, 12]], C.WELL);
  // The pier leads south to the harbour.
  walls[16][22] = walls[16][23] = -1;
  walls[17][22] = walls[17][23] = -1;
  ground[16][22] = ground[16][23] = ground[17][22] = ground[17][23] = C.PIER;
  return {
    width,
    height,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 8 },
      from_garden: { x: 2, y: 8 },
      from_shop: { x: 6, y: 7 },
      from_harbor: { x: 22, y: 15 },
      from_tower: { x: 14, y: 2 },
    },
    exits: {
      to_garden: { x: 0, y: 8, w: 1, h: 2 },
      to_shop: { x: 6, y: 6, w: 1, h: 1 },
      to_harbor: { x: 22, y: 17, w: 2, h: 1 },
      to_tower: { x: 14, y: 0, w: 2, h: 1 },
    },
    points: {
      kuro: { x: 4, y: 9 },
      coba: { x: 17, y: 10 },
      na: { x: 9, y: 10 },
      rhyme: { x: 12, y: 7 },
      chalk_blue: { x: 2, y: 14 },
      chalk_gold: { x: 26, y: 13 },
      seed: { x: 20, y: 13 },
    },
  };
}

// ================================================================== 5. Alpha harbour (coastal, branches)
export function alphaHarbor() {
  const width = 26;
  const height = 18;
  const ground = grid(width, height, C.SAND);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, 509) < 15) ground[y][x] = C.SAND_SHELLS;
      if (x === 0 || x === width - 1) walls[y][x] = C.STONE_FENCE;
      if (y >= 10) walls[y][x] = C.WATER;
    }
  fill(walls, 1, 0, width - 2, 0, C.STONE_FENCE);
  walls[0][11] = walls[0][12] = -1;
  ground[0][11] = ground[0][12] = C.PATH;
  // The long pier out to sea.
  fill(walls, 10, 10, 13, 16, -1);
  fill(ground, 10, 10, 13, 16, C.PIER);
  place(
    walls,
    [
      [4, 8],
      [20, 8],
    ],
    C.NET_PILE,
  );
  place(walls, [[16, 9]], C.BASKET_BOAT);
  const living = { ground, walls };
  // Pruned: the pier has collapsed into stepping posts; a wreck lies on the sand.
  const P = { ground: copy(ground), walls: copy(walls) };
  for (let y = 11; y <= 16; y++) for (const x of [10, 13]) P.walls[y][x] = C.WATER;
  place(P.walls, [[16, 9]], C.NET_PILE);
  return {
    width,
    height,
    ...branches(living, P),
    spawns: { default: { x: 11, y: 2 }, from_town: { x: 11, y: 2 } },
    exits: { to_town: { x: 11, y: 0, w: 2, h: 1 } },
    points: {
      drawing: { x: 12, y: 13 },
      slot_1: { x: 11, y: 11 },
      slot_2: { x: 12, y: 12 },
      slot_3: { x: 11, y: 14 },
      slot_4: { x: 12, y: 15 },
      confirm: { x: 11, y: 16 },
      chalk_living: { x: 12, y: 11 },
      chalk_pruned: { x: 7, y: 6 },
      coba: { x: 8, y: 4 },
      sprout: { x: 18, y: 4 },
      seed: { x: 22, y: 3 },
    },
  };
}

// ================================================================== 6. Clock shop of two worlds (steel, branches)
export function alphaClockshop() {
  const width = 16;
  const height = 12;
  const L = room(width, height, 511, St.WOOD, St.WOOD);
  door(L, [[7, 11]], St.WOOD);
  place(
    L.walls,
    [
      [3, 1],
      [5, 1],
      [7, 1],
      [9, 1],
      [11, 1],
    ],
    St.WALLCLOCK,
  );
  place(L.walls, [[13, 1]], St.PHOTO);
  place(L.walls, [[13, 4]], St.SAFE);
  place(L.walls, [[3, 6]], St.BENCH);
  place(L.walls, [[12, 8]], St.CORE); // the shop's branch sprout (steel has no sprout tile: a glowing core)
  const P = prunedSteel(L, 512);
  return {
    width,
    height,
    ...branches(L, P),
    spawns: { default: { x: 7, y: 9 }, from_town: { x: 7, y: 9 } },
    exits: { to_town: { x: 7, y: 11, w: 1, h: 1 } },
    points: {
      clock_wedding: { x: 3, y: 2 },
      clock_daughter: { x: 5, y: 2 },
      clock_grandpa: { x: 7, y: 2 },
      clock_sea: { x: 9, y: 2 },
      clock_shop: { x: 11, y: 2 },
      photo: { x: 13, y: 2 },
      safe: { x: 13, y: 5 },
      dial_hour: { x: 11, y: 5 },
      dial_minute: { x: 11, y: 7 },
      drawer: { x: 4, y: 7 },
      bench: { x: 3, y: 7 },
      paper: { x: 2, y: 9 },
      sprout: { x: 12, y: 9 },
    },
  };
}

// ================================================================== 7. Pruner's tower (interval)
export const TOWER_ATTIC = [{ x: 11, y: 1 }];
export function prunerTower() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 513, I.FLOOR, I.SAND);
  door(L, [
    [11, 15],
    [21, 8],
  ]);
  for (const t of TOWER_ATTIC) L.walls[t.y][t.x] = I.GATE;
  place(L.walls, [[3, 3]], I.STELE);
  place(
    L.walls,
    [
      [4, 12],
      [17, 12],
    ],
    I.PILLAR,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: { x: 11, y: 13 },
      from_town: { x: 11, y: 13 },
      from_beta: { x: 19, y: 8 },
      from_attic: { x: 11, y: 2 },
      revive: { x: 11, y: 13 },
    },
    exits: {
      to_town: { x: 11, y: 15, w: 1, h: 1 },
      to_beta: { x: 21, y: 8, w: 1, h: 1 },
    },
    points: {
      stele: { x: 3, y: 4 },
      ghost_x: { x: 6, y: 5 },
      ghost_y: { x: 11, y: 4 },
      ghost_z: { x: 16, y: 5 },
      accuse_dial: { x: 9, y: 7 },
      accuse: { x: 13, y: 7 },
      attic: { x: 11, y: 2 },
      other_peter: { x: 11, y: 10 },
    },
  };
}

// ================================================================== 8. Steel city (steel, branches)
export const BRIDGE_X = [10, 11, 12, 13, 14, 15, 16, 17, 18];
export function betaCity() {
  const width = 30;
  const height = 16;
  const L = room(width, height, 515, St.GRATE, St.GRATE);
  door(L, [
    [0, 8],
    [29, 8],
    [28, 1],
  ]);
  // The abyss under the quantum bridge.
  fill(L.walls, 10, 2, 18, 14, St.ABYSS);
  place(
    L.walls,
    [
      [4, 4],
      [24, 4],
      [5, 13],
    ],
    St.CLOCKTOWER,
  );
  place(L.walls, [[23, 12]], St.PIPES);
  const P = prunedSteel(L, 516);
  fill(P.walls, 10, 2, 18, 14, St.ABYSS);
  // Living: only cells 1-2 still hold planks. Pruned: cells 1, 2, 4, 5, 7, 8.
  for (const x of [10, 11]) {
    L.walls[8][x] = -1;
    L.ground[8][x] = St.PLANK;
  }
  for (const x of [10, 11, 13, 14, 16, 17]) {
    P.walls[8][x] = -1;
    P.ground[8][x] = St.PLANK;
  }
  for (const [x, y] of [
    [4, 12],
    [6, 3],
    [3, 3],
    [2, 12],
    [25, 12],
    [26, 4],
  ]) {
    L.walls[y][x] = -1;
    P.walls[y][x] = -1;
  }
  return {
    width,
    height,
    ...branches(L, P),
    spawns: {
      default: { x: 2, y: 8 },
      from_tower: { x: 2, y: 8 },
      from_reactor: { x: 27, y: 8 },
      from_observatory: { x: 27, y: 2 },
      bridge_start: { x: 8, y: 8 },
      revive: { x: 2, y: 8 },
    },
    exits: {
      to_tower: { x: 0, y: 8, w: 1, h: 1 },
      to_reactor: { x: 29, y: 8, w: 1, h: 1 },
      to_observatory: { x: 28, y: 1, w: 1, h: 1 },
    },
    cells: { 3: { x: 12, y: 8 }, 6: { x: 15, y: 8 }, 9: { x: 18, y: 8 } },
    points: {
      sprout: { x: 7, y: 6 },
      plank_a: { x: 4, y: 12 },
      plank_b: { x: 6, y: 3 },
      plank_living: { x: 3, y: 3 },
      log: { x: 2, y: 12 },
      seed: { x: 25, y: 12 },
      chalk_red: { x: 26, y: 4 },
      crossed: { x: 21, y: 8 },
      cocoon_a: { x: 22, y: 5 },
      cocoon_b: { x: 22, y: 11 },
      horror: { x: 6, y: 10 },
      gardener: { x: 25, y: 8 },
    },
  };
}

// ================================================================== 9. Inverted observatory (steel, branches)
export function observatoryRuins() {
  const width = 20;
  const height = 14;
  const L = room(width, height, 517, St.GRATE, St.GRATE);
  door(L, [[10, 13]]);
  place(L.walls, [[10, 4]], St.CORE); // the great telescope
  place(L.walls, [[16, 10]], St.GEN);
  const P = prunedSteel(L, 518);
  return {
    width,
    height,
    ...branches(L, P),
    spawns: { default: { x: 10, y: 11 }, from_beta: { x: 10, y: 11 } },
    exits: { to_beta: { x: 10, y: 13, w: 1, h: 1 } },
    points: {
      telescope: { x: 10, y: 5 },
      angle: { x: 8, y: 6 },
      lens_living: { x: 3, y: 4 },
      lens_pruned: { x: 16, y: 4 },
      log_1: { x: 4, y: 10 },
      log_2: { x: 15, y: 11 },
      sprout: { x: 3, y: 11 },
      crystal: { x: 12, y: 9 },
    },
  };
}

// ================================================================== 10. Chronos reactor (steel, branches)
export const REACTOR_GATE = [{ x: 25, y: 8 }];
export function chronosReactor() {
  const width = 26;
  const height = 16;
  const L = room(width, height, 519, St.GRATE, St.GRATE);
  door(L, [[0, 8]]);
  for (const t of REACTOR_GATE) L.walls[t.y][t.x] = D.GATE;
  place(
    L.walls,
    [
      [6, 4],
      [12, 4],
      [18, 4],
    ],
    St.GEN,
  );
  place(L.walls, [[12, 12]], St.CORE);
  place(
    L.walls,
    [
      [3, 12],
      [21, 12],
    ],
    St.PIPES,
  );
  place(L.walls, [[22, 3]], St.SWITCH);
  const P = prunedSteel(L, 520);
  return {
    width,
    height,
    ...branches(L, P),
    spawns: {
      default: { x: 2, y: 8 },
      from_beta: { x: 2, y: 8 },
      from_shelter: { x: 23, y: 8 },
      revive: { x: 2, y: 8 },
    },
    exits: {
      to_beta: { x: 0, y: 8, w: 1, h: 1 },
      to_shelter: { x: 25, y: 8, w: 1, h: 1 },
    },
    points: {
      sw_a: { x: 6, y: 5 },
      sw_b: { x: 12, y: 5 },
      sw_c: { x: 18, y: 5 },
      start: { x: 22, y: 4 },
      ivo: { x: 9, y: 10 },
      plate: { x: 16, y: 11 },
      wiring: { x: 21, y: 4 },
      black_box: { x: 4, y: 13 },
      sprout: { x: 15, y: 13 },
      crystal: { x: 19, y: 10 },
      phantom: { x: 7, y: 12 },
    },
  };
}

// ================================================================== 11. Children's shelter (steel)
export function childrenShelter() {
  const width = 20;
  const height = 14;
  const L = room(width, height, 521, St.WOOD, D.FLOOR);
  door(L, [
    [0, 7],
    [19, 7],
  ]);
  fill(L.walls, 2, 1, 17, 1, St.CHALKWALL);
  place(
    L.walls,
    [
      [3, 4],
      [3, 9],
      [16, 4],
      [16, 9],
    ],
    St.BUNK,
  );
  place(L.walls, [[10, 11]], St.BENCH); // the brass player piano
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: { x: 2, y: 7 }, from_reactor: { x: 2, y: 7 }, from_grey: { x: 17, y: 7 } },
    exits: { to_reactor: { x: 0, y: 7, w: 1, h: 1 }, to_grey: { x: 19, y: 7, w: 1, h: 1 } },
    points: {
      mira: { x: 9, y: 5 },
      ivo: { x: 13, y: 8 },
      poem: { x: 4, y: 3 },
      notes: { x: 15, y: 3 },
      note_1: { x: 7, y: 10 },
      note_2: { x: 8, y: 12 },
      note_3: { x: 10, y: 12 },
      note_4: { x: 12, y: 12 },
      note_5: { x: 13, y: 10 },
      play: { x: 10, y: 10 },
      seed: { x: 17, y: 12 },
    },
  };
}

// ================================================================== 12. Grey prune (interval, branches)
export function greyPrune() {
  const width = 28;
  const height = 16;
  const L = room(width, height, 523, I.ISLE_G, I.SAND);
  door(L, [
    [0, 8],
    [27, 8],
  ]);
  place(
    L.walls,
    [
      [5, 3],
      [11, 3],
      [17, 3],
    ],
    I.P_SILVER,
  );
  L.walls[3][11] = I.P_COPPER;
  L.walls[3][17] = I.P_IRON;
  place(L.walls, [[23, 4]], I.GENEALOGY);
  place(L.walls, [[3, 12]], I.STELE);
  place(L.walls, [[19, 11]], I.ANCHOR); // the hourglass tower
  place(L.walls, [[15, 12]], I.SPROUT);
  for (let k = 0; k < 10; k++) {
    const x = 6 + ((k * 7) % 16);
    const y = 6 + ((k * 3) % 4);
    if (y !== 8 && L.walls[y][x] === -1) L.walls[y][x] = I.VOID;
  }
  const P = prunedInterval(L, 524);
  return {
    width,
    height,
    ...branches(L, P),
    spawns: { default: { x: 2, y: 8 }, from_shelter: { x: 2, y: 8 }, from_anchor: { x: 25, y: 8 } },
    exits: { to_shelter: { x: 0, y: 8, w: 1, h: 1 }, to_anchor: { x: 27, y: 8, w: 1, h: 1 } },
    points: {
      p_silver: { x: 5, y: 4 },
      p_copper: { x: 11, y: 4 },
      p_iron: { x: 17, y: 4 },
      genealogy: { x: 23, y: 5 },
      stele: { x: 3, y: 13 },
      heir_dial: { x: 9, y: 6 },
      call: { x: 13, y: 6 },
      chalk_white: { x: 25, y: 13 },
      seed: { x: 7, y: 13 },
      flip: { x: 19, y: 12 },
      lock: { x: 21, y: 11 },
      tablet: { x: 21, y: 13 },
      notes: { x: 12, y: 13 },
      sprout: { x: 15, y: 13 },
      crystal_a: { x: 8, y: 10 },
      crystal_b: { x: 24, y: 10 },
      phantom: { x: 14, y: 9 },
    },
  };
}

// ================================================================== 13. Where Kuro asks (interval)
export function kuroAsks() {
  const width = 18;
  const height = 12;
  const L = room(width, height, 525, I.FLOOR, I.SAND);
  door(L, [
    [0, 6],
    [17, 6],
  ]);
  place(L.walls, [[9, 3]], I.ANCHOR);
  place(
    L.walls,
    [
      [4, 3],
      [14, 3],
      [9, 9],
    ],
    I.STELE,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: { x: 2, y: 6 }, from_grey: { x: 2, y: 6 }, from_throne: { x: 15, y: 6 } },
    exits: { to_grey: { x: 0, y: 6, w: 1, h: 1 }, to_throne: { x: 17, y: 6, w: 1, h: 1 } },
    points: {
      kuro: { x: 9, y: 5 },
      q1_dial: { x: 3, y: 4 },
      q1: { x: 5, y: 4 },
      q2_dial: { x: 13, y: 4 },
      q2: { x: 15, y: 4 },
      q3_dial: { x: 8, y: 9 },
      q3: { x: 10, y: 9 },
    },
  };
}

// ================================================================== 14. Unborn throne (interval)
export const THRONE_GATE = [{ x: 11, y: 0 }];
export function unbornThrone() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 527, I.FLOOR, I.SAND);
  door(L, [[0, 12]]);
  for (const t of THRONE_GATE) L.walls[t.y][t.x] = I.GATE;
  place(L.walls, [[11, 3]], I.THRONE);
  place(L.walls, [[4, 11]], I.P_SILVER); // the Mirror of Nothing
  place(
    L.walls,
    [
      [3, 13],
      [5, 13],
      [7, 13],
    ],
    I.PLOT,
  ); // the three altars
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: { x: 2, y: 12 },
      from_anchor: { x: 2, y: 12 },
      from_shore: { x: 11, y: 2 },
      revive: { x: 2, y: 12 },
    },
    exits: { to_anchor: { x: 0, y: 12, w: 1, h: 1 }, to_shore: { x: 11, y: 0, w: 1, h: 1 } },
    points: {
      king: { x: 11, y: 5 },
      mirror: { x: 4, y: 10 },
      altar_willow: { x: 3, y: 12 },
      altar_ring: { x: 5, y: 12 },
      altar_sword: { x: 7, y: 12 },
    },
  };
}

// ================================================================== 15. Collision shore (interval)
export function collisionShore() {
  const width = 30;
  const height = 14;
  const L = room(width, height, 529, I.FLOOR, I.SAND);
  // Everything between the start bank (x 1-3) and the core (x 26-28) is void with islands.
  fill(L.walls, 4, 2, 25, 12, I.VOID);
  fill(L.walls, 25, 2, 25, 12, I.VOID);
  const violet = [
    [4, 7],
    [5, 7],
    [6, 6],
    [7, 6],
    [8, 5],
    [9, 5],
    [10, 6],
    [11, 7],
    [12, 8],
    [13, 8],
    [14, 9],
    [15, 9],
    [16, 8],
    [17, 7],
    [18, 6],
    [19, 6],
    [20, 7],
    [21, 8],
    [22, 8],
    [23, 7],
    [24, 7],
  ];
  const grey = [
    [6, 8],
    [8, 8],
    [10, 4],
    [12, 6],
    [14, 7],
    [16, 10],
    [18, 9],
    [20, 5],
    [22, 6],
  ];
  for (const [x, y] of violet) {
    L.walls[y][x] = -1;
    L.ground[y][x] = I.ISLE_V;
  }
  for (const [x, y] of grey) {
    L.walls[y][x] = -1;
    L.ground[y][x] = I.ISLE_G;
  }
  // Each grey island touches the violet path so the trap is tempting.
  place(L.walls, [[27, 3]], I.SEAL);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    grey: grey.map(([x, y]) => ({ x, y })),
    spawns: {
      default: { x: 2, y: 7 },
      from_throne: { x: 2, y: 7 },
      collision_start: { x: 2, y: 7 },
      core: { x: 27, y: 8 },
    },
    exits: {},
    end: { x: 24, y: 7 },
    points: { start: { x: 3, y: 7 }, seal: { x: 27, y: 4 }, seed: { x: 28, y: 11 } },
  };
}

// ================================================================== 16. Uprooted garden (interval, hidden)
export function uprootedGarden() {
  const width = 16;
  const height = 12;
  const L = room(width, height, 531, I.SAND, I.FLOOR);
  place(
    L.walls,
    [
      [3, 5],
      [5, 3],
      [8, 2],
      [11, 3],
      [13, 5],
    ],
    I.PLOT,
  );
  place(L.walls, [[8, 6]], I.TREE);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: { x: 8, y: 9 } },
    exits: {},
    points: {
      plot_1: { x: 3, y: 6 },
      plot_2: { x: 5, y: 4 },
      plot_3: { x: 8, y: 3 },
      plot_4: { x: 11, y: 4 },
      plot_5: { x: 13, y: 6 },
      tend: { x: 8, y: 7 },
      back: { x: 8, y: 10 },
    },
  };
}

// ================================================================== 17. Old seeds (interval, hidden)
export function oldSeeds() {
  const width = 16;
  const height = 12;
  const L = room(width, height, 533, I.SAND, I.FLOOR);
  place(
    L.walls,
    [
      [4, 4],
      [8, 4],
      [12, 4],
    ],
    I.PLOT,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: { x: 8, y: 9 } },
    exits: {},
    points: {
      aldric: { x: 4, y: 5 },
      bran: { x: 8, y: 5 },
      elion: { x: 12, y: 5 },
      back: { x: 8, y: 10 },
    },
  };
}

export const CH5_MAPS = [
  { id: 'map_ch5_interval_shore', tileset: 'interval', build: intervalShore },
  { id: 'map_ch5_seed_garden', tileset: 'interval', build: seedGarden },
  { id: 'map_ch5_glass_greenhouse', tileset: 'interval', build: glassGreenhouse },
  { id: 'map_ch5_alpha_town', tileset: 'coastal', build: alphaTown },
  { id: 'map_ch5_alpha_harbor', tileset: 'coastal', build: alphaHarbor },
  { id: 'map_ch5_alpha_clockshop', tileset: 'steel', build: alphaClockshop },
  { id: 'map_ch5_pruner_tower', tileset: 'interval', build: prunerTower },
  { id: 'map_ch5_beta_city', tileset: 'steel', build: betaCity },
  { id: 'map_ch5_observatory_ruins', tileset: 'steel', build: observatoryRuins },
  { id: 'map_ch5_chronos_reactor', tileset: 'steel', build: chronosReactor },
  { id: 'map_ch5_children_shelter', tileset: 'steel', build: childrenShelter },
  { id: 'map_ch5_grey_prune', tileset: 'interval', build: greyPrune },
  { id: 'map_ch5_kuro_asks', tileset: 'interval', build: kuroAsks },
  { id: 'map_ch5_unborn_throne', tileset: 'interval', build: unbornThrone },
  { id: 'map_ch5_collision_shore', tileset: 'interval', build: collisionShore },
  { id: 'map_ch5_uprooted_garden', tileset: 'interval', build: uprootedGarden },
  { id: 'map_ch5_old_seeds', tileset: 'interval', build: oldSeeds },
];
