/**
 * Layouts of the Forgotten Forest (26×18) and the Old Lighthouse headland (24×18) —
 * PROLOGUE_V2_DESIGN.md §2 — shared by the wilds tileset preview and the map generator.
 * Values are TILE INDICES of wilds_tileset (GID = index + 1); -1 = empty.
 */
export const Wd = {
  // ground (walkable)
  LOAM: 0,
  MOSS: 1,
  TRAIL: 2,
  MUD: 3,
  MIST: 4,
  FRACTURE: 5,
  ROOTS: 6,
  BASALT: 7,
  BASALT_LICHEN: 8,
  SALT_GRASS: 9,
  STEPS: 10,
  FLAGSTONE: 11,
  TIDE_POOL: 12,
  FOAM_ROCK: 13,
  HATCH: 14,
  LIGHT_FLOOR: 15,
  // walls layer (collide)
  SEA: 16,
  CLIFF: 17,
  BASALT_COLUMNS: 18,
  CANOPY: 19,
  MANGROVE: 20,
  ELDER_TREE: 21,
  FALLEN_LOG: 22,
  THICKET: 23,
  FERNS: 24,
  MONOLITH: 25,
  CREVICE: 26,
  ASH_CRYSTALS: 27,
  ERASED_TREE: 28,
  LH_TOP_L: 29,
  LH_TOP_R: 30,
  LH_MID_L: 31,
  LH_MID_R: 32,
  LH_BASE_L: 33,
  LH_BASE_R: 34,
  LENS: 35,
  TABLET: 36,
  GATE: 37,
  FROZEN_WAVE: 38,
  RAILING: 39,
};

export const WILDS_COLLIDE_FROM = 16;
export const WILDS_COLLIDE_TO = 39;

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, fill) => Array.from({ length: h }, () => Array(w).fill(fill));

/** Carves a corridor of half-width `r` through the waypoints (axis-aligned segments). */
function carve(open, points, r) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    for (let x = Math.min(x0, x1) - r; x <= Math.max(x0, x1) + r; x++)
      for (let y = Math.min(y0, y1) - r; y <= Math.max(y0, y1) + r; y++)
        if (open[y]?.[x] !== undefined) open[y][x] = true;
  }
}

/** Forgotten Forest, 26×18: a winding trail through mangroves from the town to the stone hatch. */
export function forestLayout() {
  const W = 26;
  const H = 18;
  const ground = grid(W, H, Wd.LOAM);
  const walls = grid(W, H, -1);
  const open = grid(W, H, false);
  const trail = [
    [0, 15],
    [6, 15],
    [6, 11],
    [12, 11],
    [12, 13],
    [17, 13],
    [17, 7],
    [21, 7],
    [21, 3],
    [24, 3],
  ];
  carve(open, trail, 1);
  carve(
    open,
    [
      [6, 11],
      [6, 6],
      [8, 6],
    ],
    1,
  ); // side pocket: the chrono crevice
  for (const [cx, cy, r] of [
    [12, 10, 2],
    [17, 7, 2],
  ])
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) open[y][x] = true;

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 21);
      ground[y][x] = r < 18 ? Wd.MOSS : r < 26 ? Wd.ROOTS : r < 32 ? Wd.MUD : Wd.LOAM;
      if (open[y][x]) {
        if (hash(x, y, 22) < 22) ground[y][x] = Wd.MIST;
        continue;
      }
      // Deep woods are solid canopy; individual trees and undergrowth line the trail.
      let border = false;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) if (open[y + dy]?.[x + dx]) border = true;
      const k = hash(x, y, 23);
      walls[y][x] = !border
        ? Wd.CANOPY
        : k < 30
          ? Wd.MANGROVE
          : k < 48
            ? Wd.THICKET
            : k < 62
              ? Wd.FERNS
              : k < 72
                ? Wd.ERASED_TREE
                : k < 80
                  ? Wd.FALLEN_LOG
                  : k < 88
                    ? Wd.ELDER_TREE
                    : Wd.CANOPY;
    }
  // The trail itself.
  const trailOnly = grid(W, H, false);
  carve(trailOnly, trail, 0);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (trailOnly[y][x]) ground[y][x] = Wd.TRAIL;

  // Fracture around the stray Shade; the monolith; the crevice; the hatch.
  for (const [x, y] of [
    [16, 6],
    [17, 6],
    [18, 7],
    [16, 8],
    [18, 8],
    [17, 9],
  ])
    ground[y][x] = Wd.FRACTURE;
  walls[5][19] = Wd.ASH_CRYSTALS;
  walls[9][15] = Wd.ASH_CRYSTALS;
  walls[9][12] = Wd.MONOLITH;
  walls[5][7] = Wd.CREVICE;
  ground[3][24] = Wd.HATCH;
  walls[3][25] = Wd.CANOPY;

  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 15 },
      from_town: { x: 2, y: 15 },
      from_antechamber: { x: 22, y: 3 },
    },
    exits: {
      to_town: { x: 0, y: 14, w: 1, h: 3 },
      to_antechamber: { x: 24, y: 3, w: 1, h: 1 },
    },
    points: {
      monolith: { x: 12, y: 10 },
      crevice: { x: 7, y: 6 },
      stray_shade: { x: 17, y: 7 },
    },
  };
}

/** The Old Lighthouse headland, 24×18: basalt cape into a frozen sea. */
export function lighthouseLayout() {
  const W = 24;
  const H = 18;
  const ground = grid(W, H, Wd.SEA);
  const walls = grid(W, H, Wd.SEA);

  // Headland outline per row: [from, to] walkable columns.
  const rows = {
    2: [9, 15],
    3: [6, 18],
    4: [4, 19],
    5: [3, 20],
    6: [3, 20],
    7: [3, 20],
    8: [3, 20],
    9: [11, 13],
    10: [5, 18],
    11: [6, 17],
    12: [7, 16],
    13: [8, 15],
    14: [9, 14],
    15: [10, 14],
    16: [11, 13],
    17: [12, 12],
  };
  for (const [yStr, [a, b]] of Object.entries(rows)) {
    const y = Number(yStr);
    for (let x = a; x <= b; x++) {
      walls[y][x] = -1;
      const r = hash(x, y, 31);
      ground[y][x] =
        r < 18 ? Wd.BASALT_LICHEN : r < 26 ? Wd.SALT_GRASS : r < 31 ? Wd.TIDE_POOL : Wd.BASALT;
    }
    // Foam where rock meets sea, cliff face under the southern rim.
    if (walls[y][a - 1] === Wd.SEA) ground[y][a] = Wd.FOAM_ROCK;
    if (walls[y][b + 1] === Wd.SEA) ground[y][b] = Wd.FOAM_ROCK;
  }
  for (let x = 0; x < W; x++)
    for (let y = 1; y < H; y++)
      if (walls[y][x] === Wd.SEA && walls[y - 1][x] === -1 && y - 1 !== 8) walls[y][x] = Wd.CLIFF;

  // The neck at row 9 (where the Sentinel stands): basalt columns either side.
  for (let x = 3; x <= 20; x++) if (x < 11 || x > 13) walls[9][x] = Wd.BASALT_COLUMNS;

  // Courtyard and the steps down to the Antechamber.
  for (let y = 3; y <= 8; y++) for (let x = 10; x <= 14; x++) ground[y][x] = Wd.FLAGSTONE;
  for (let y = 15; y <= 17; y++) ground[y][12] = Wd.STEPS;
  ground[3][12] = Wd.LIGHT_FLOOR;

  // Lighthouse (2×3), tablet, gate of light, lens platforms, railings, frozen waves.
  walls[3][16] = Wd.LH_TOP_L;
  walls[3][17] = Wd.LH_TOP_R;
  walls[4][16] = Wd.LH_MID_L;
  walls[4][17] = Wd.LH_MID_R;
  walls[5][16] = Wd.LH_BASE_L;
  walls[5][17] = Wd.LH_BASE_R;
  walls[4][12] = Wd.TABLET;
  walls[2][12] = Wd.GATE;
  walls[8][5] = Wd.LENS;
  walls[8][19] = Wd.LENS;
  for (const x of [6, 7, 8, 18]) walls[3][x] = Wd.RAILING; // old railing along the north rim
  for (const [x, y] of [
    [1, 12],
    [21, 13],
    [3, 15],
    [19, 16],
    [22, 4],
  ])
    walls[y][x] = Wd.FROZEN_WAVE;

  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 12, y: 15 }, base: { x: 12, y: 15 } },
    exits: { to_antechamber: { x: 12, y: 17, w: 1, h: 1 } },
    points: {
      sentinel: { x: 12, y: 9 },
      lens_left: { x: 5, y: 8 },
      lens_right: { x: 19, y: 8 },
      tablet: { x: 12, y: 4 },
      gate: { x: 12, y: 2 },
    },
  };
}
