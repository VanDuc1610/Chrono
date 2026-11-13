/**
 * Chapter 2 "The Empire of False Causality" map layouts (docs/story/CHAPTER_02_DESIGN.md §3, §11),
 * shared by scripts/generate-ch1-maps.js (`ch2` argument) and scripts/preview-ch1-maps.js.
 * Values are tile indices of each map's tileset (GID = index + 1); -1 = empty.
 *
 * Imperial props reuse the closest approved tiles (STAND-IN): the blindfolded statue is the
 * astrolabe, the scales and the verdict tablet are altars, archive shelves are steles.
 */
import { D } from './ch1-layout.js';
import { Wd } from './wilds-layout.js';

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const fill = (g, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = v;
};

/** Dungeon room: floor, walls round the edge (two rows on top for depth). */
function room(W, H, seed) {
  const ground = grid(W, H, D.FLOOR);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (hash(x, y, seed) < 20) ground[y][x] = D.FLOOR_ALT;
      if (x === 0 || x === W - 1 || y === 0 || y === H - 1) walls[y][x] = D.WALL_FACE;
      if (y === 1 && x > 0 && x < W - 1) walls[y][x] = D.WALL_TOP;
    }
  return { ground, walls };
}

/** Opens a doorway through the outer wall (and the top row when on the north side). */
function door(walls, ground, x, y) {
  walls[y][x] = -1;
  ground[y][x] = D.ENGRAVED;
}

// ---------------------------------------------------------------- 1. Imperial outskirts (wilds)
export function outskirtsLayout() {
  const W = 24;
  const H = 18;
  const ground = grid(W, H, Wd.LOAM);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 61);
      if (r < 18) ground[y][x] = Wd.SALT_GRASS;
      else if (r < 24) ground[y][x] = Wd.MOSS;
    }
  fill(walls, 0, 0, W - 1, 1, Wd.CLIFF);
  fill(walls, 0, H - 1, W - 1, H - 1, Wd.CLIFF);
  fill(walls, 0, 0, 0, H - 1, Wd.CLIFF);
  fill(walls, W - 1, 0, W - 1, H - 1, Wd.CLIFF);
  // The old imperial road, cracked flagstones from the Threshold to the rusted city gate.
  for (let x = 1; x < W - 1; x++) for (const y of [8, 9]) ground[y][x] = Wd.FLAGSTONE;
  walls[8][0] = walls[9][0] = Wd.GATE; // the Threshold behind Peter
  fill(walls, W - 1, 7, W - 1, 10, Wd.GATE); // the city gate, rusted shut
  // Edict steles along the road.
  for (const [x, y] of [
    [8, 6],
    [12, 6],
    [16, 6],
    [8, 11],
    [16, 11],
  ])
    walls[y][x] = Wd.TABLET;
  // Dead thickets and a crevice where the land itself was "sentenced".
  for (const [x, y] of [
    [3, 3],
    [4, 3],
    [20, 3],
    [21, 4],
    [3, 14],
    [11, 15],
    [12, 15],
    [21, 14],
  ])
    walls[y][x] = Wd.THICKET;
  for (const [x, y] of [
    [6, 13],
    [7, 13],
    [14, 3],
  ])
    walls[y][x] = Wd.CREVICE;
  ground[13][18] = Wd.HATCH; // iron hatch down to the catacombs
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 2, y: 9 }, from_ch1: { x: 2, y: 9 }, from_catacombs: { x: 18, y: 12 } },
    exits: { to_catacombs: { x: 18, y: 13, w: 1, h: 1 } },
    points: {
      elder_echo: { x: 6, y: 8 },
      edict_stele: { x: 12, y: 6 },
      hatch: { x: 18, y: 13 },
      shade_a: { x: 10, y: 13 },
      shade_b: { x: 19, y: 4 },
    },
  };
}

// ---------------------------------------------------------------- 2. Catacombs (dungeon)
export const CATACOMB_GATE = [
  { x: 26, y: 8 },
  { x: 26, y: 9 },
  { x: 26, y: 10 },
];

export function catacombsLayout() {
  const W = 28;
  const H = 18;
  const { ground, walls } = room(W, H, 63);
  // Tomb row along the north wall: three inscribed tombs in their niches.
  fill(walls, 1, 2, 16, 4, D.WALL_FACE);
  for (const x of [2, 5, 8, 11, 14]) {
    walls[4][x] = -1;
    walls[3][x] = D.STELE;
    ground[4][x] = D.ENGRAVED;
  }
  // A pillar hall in the middle where Lyra is cornered.
  for (const [x, y] of [
    [12, 7],
    [18, 7],
    [12, 12],
    [18, 12],
  ])
    walls[y][x] = D.PILLAR;
  // West crypt: the locksmith's box and the diary, behind a low wall.
  fill(walls, 9, 13, 9, 16, D.WALL_FACE);
  walls[14][3] = D.RELIQUARY; // locksmith's toolbox
  ground[15][6] = D.ENGRAVED; // the praetor's diary page
  walls[2][17] = D.STELE; // dedication plaque of the tomb row (the calendar clue)
  // The Founding Alcove in the north-east niche.
  fill(walls, 20, 2, 20, 5, D.WALL_FACE);
  walls[2][23] = D.ALTAR;
  ground[3][23] = D.ENGRAVED;
  // East wall with the ancient gate to the plaza.
  fill(walls, 26, 2, 26, 16, D.WALL_FACE);
  for (const t of CATACOMB_GATE) walls[t.y][t.x] = D.GATE;
  for (const y of [8, 9, 10]) door(walls, ground, 27, y);
  for (const y of [8, 9, 10]) door(walls, ground, 0, y);
  for (const [x, y] of [
    [6, 9],
    [15, 15],
    [22, 12],
  ])
    ground[y][x] = D.FRACTURE;
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 9 },
      from_outskirts: { x: 2, y: 9 },
      from_plaza: { x: 25, y: 9 },
      revive: { x: 2, y: 9 },
    },
    exits: { to_outskirts: { x: 0, y: 8, w: 1, h: 3 }, to_plaza: { x: 27, y: 8, w: 1, h: 3 } },
    points: {
      lyra: { x: 15, y: 9 },
      tomb_1: { x: 2, y: 3 },
      tomb_2: { x: 5, y: 3 },
      tomb_3: { x: 8, y: 3 },
      tomb_4: { x: 11, y: 3 },
      tomb_5: { x: 14, y: 3 },
      plaque: { x: 17, y: 2 },
      locksmith_box: { x: 3, y: 14 },
      diary: { x: 6, y: 15 },
      alcove: { x: 23, y: 2 },
      gate: { x: 26, y: 9 },
      automaton_a: { x: 14, y: 9 },
      automaton_b: { x: 16, y: 10 },
      automaton_c: { x: 22, y: 14 },
    },
  };
}

// ---------------------------------------------------------------- 3. Forum plaza (dungeon)
export function plazaLayout() {
  const W = 30;
  const H = 20;
  const { ground, walls } = room(W, H, 65);
  // The square: engraved paving round the blindfolded emperor.
  for (let y = 3; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const d = Math.hypot(x - 15, (y - 10) * 1.1);
      if (Math.abs(d - 6) < 0.55) ground[y][x] = D.ENGRAVED;
    }
  walls[4][15] = D.ASTROLABE; // STAND-IN: the Blindfolded Emperor statue
  walls[5][20] = D.ALTAR; // STAND-IN: the Scales of Causality
  walls[4][11] = D.RELIQUARY; // the praetor's desk under the fallen statue
  // Execution platform: engraved square with four posts.
  fill(ground, 13, 12, 17, 14, D.ENGRAVED);
  for (const [x, y] of [
    [13, 12],
    [17, 12],
    [13, 14],
    [17, 14],
  ])
    walls[y][x] = D.PILLAR;
  // Sealed shopfronts along the south wall.
  for (const x of [4, 7, 22, 25]) walls[H - 2][x] = D.STELE;
  walls[15][6] = D.CRYSTAL; // the baker's cold oven (STAND-IN)
  // Colonnades.
  for (const x of [3, 9, 21, 27]) for (const y of [4, 7]) walls[y][x] = D.PILLAR;
  for (const y of [9, 10, 11]) door(walls, ground, 0, y);
  for (const y of [9, 10, 11]) door(walls, ground, W - 1, y);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 10 },
      from_catacombs: { x: 2, y: 10 },
      from_archives: { x: 27, y: 10 },
      revive: { x: 2, y: 10 },
    },
    exits: { to_catacombs: { x: 0, y: 9, w: 1, h: 3 }, to_archives: { x: 29, y: 9, w: 1, h: 3 } },
    points: {
      praetor: { x: 16, y: 6 },
      praetor_desk: { x: 11, y: 4 },
      statue: { x: 15, y: 4 },
      scales: { x: 20, y: 5 },
      platform: { x: 15, y: 13 },
      baker: { x: 7, y: 15 },
      broken_automaton: { x: 23, y: 14 },
      enforcer_a: { x: 5, y: 5 },
      enforcer_b: { x: 25, y: 5 },
      enforcer_c: { x: 24, y: 16 },
    },
  };
}

// ---------------------------------------------------------------- 4. Causality archives (dungeon)
export const GUILT_BARRIER = [
  { x: 24, y: 8 },
  { x: 24, y: 9 },
  { x: 24, y: 10 },
];

export function archivesLayout() {
  const W = 26;
  const H = 18;
  const { ground, walls } = room(W, H, 67);
  // Stone shelves in rows with aisles between them.
  for (const y of [4, 7, 11, 14])
    for (let x = 3; x <= 20; x++) if (x % 6 !== 0) walls[y][x] = D.STELE;
  walls[3][12] = D.RELIQUARY; // the shelf with "The Unwritten" record
  walls[15][5] = D.RELIQUARY; // rebellion records
  // The verdict tablet before the barrier.
  walls[9][21] = D.ALTAR;
  ground[9][20] = D.ENGRAVED;
  for (const t of GUILT_BARRIER) walls[t.y][t.x] = D.FRACTURE;
  fill(walls, 24, 2, 24, 7, D.WALL_FACE);
  fill(walls, 24, 11, 24, 16, D.WALL_FACE);
  for (const y of [8, 9, 10]) door(walls, ground, W - 1, y);
  for (const y of [8, 9, 10]) door(walls, ground, 0, y);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 9 },
      from_plaza: { x: 2, y: 9 },
      from_sanctum: { x: 23, y: 9 },
      revive: { x: 2, y: 9 },
    },
    exits: { to_plaza: { x: 0, y: 8, w: 1, h: 3 }, to_sanctum: { x: 25, y: 8, w: 1, h: 3 } },
    points: {
      peter_record: { x: 12, y: 3 },
      rebellion_records: { x: 5, y: 15 },
      tablet: { x: 21, y: 9 },
      enforcer_a: { x: 9, y: 5 },
      enforcer_b: { x: 15, y: 9 },
      enforcer_c: { x: 9, y: 12 },
      automaton_a: { x: 18, y: 5 },
      automaton_b: { x: 18, y: 12 },
    },
  };
}

// ---------------------------------------------------------------- 5. Verdict sanctum (dungeon)
export function verdictSanctumLayout() {
  const W = 22;
  const H = 16;
  const { ground, walls } = room(W, H, 69);
  // Half-round court: tiered seats (pillars) around the judgement floor.
  for (let y = 2; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const d = Math.hypot(x - 11, (y - 9) * 1.15);
      if (d > 9.2) walls[y][x] = D.WALL_FACE;
      else if (Math.abs(d - 7.4) < 0.5 && y < 12) walls[y][x] = D.PILLAR;
      else if (Math.abs(d - 4) < 0.55) ground[y][x] = D.ENGRAVED;
    }
  walls[3][11] = D.CRYSTAL; // the Causality Seal
  ground[4][11] = D.ENGRAVED;
  for (const y of [13, 14, 15]) {
    walls[y][11] = -1;
    ground[y][11] = D.ENGRAVED;
  }
  for (let y = 4; y <= 12; y++) if (walls[y][11] === D.PILLAR) walls[y][11] = -1;
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 11, y: 13 },
      from_archives: { x: 11, y: 13 },
      revive: { x: 11, y: 12 },
    },
    exits: { to_archives: { x: 11, y: 15, w: 1, h: 1 } },
    points: { verdict: { x: 11, y: 7 }, seal: { x: 11, y: 4 } },
  };
}

export const CH2_MAPS = [
  { id: 'map_ch2_imperial_outskirts', tileset: 'wilds', build: outskirtsLayout },
  { id: 'map_ch2_sunken_catacombs', tileset: 'dungeon', build: catacombsLayout },
  { id: 'map_ch2_forum_plaza', tileset: 'dungeon', build: plazaLayout },
  { id: 'map_ch2_causality_archives', tileset: 'dungeon', build: archivesLayout },
  { id: 'map_ch2_verdict_sanctum', tileset: 'dungeon', build: verdictSanctumLayout },
];
