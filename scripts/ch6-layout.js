/**
 * Chapter 6 "The Hour of the Gods" map layouts (CHAPTER_06_DESIGN.md §3 with §17), shared by
 * scripts/generate-ch1-maps.js and scripts/preview-ch1-maps.js (`ch6`). Values are tile indices of
 * celestial_tileset; -1 = empty. `points` name the tiles scripts/wire-ch6.mjs wires.
 */
import { D } from './ch1-layout.js';

/** celestial_tileset: dungeon 0-15 tinted + Chapter 6 tiles. Collision GID 4-44. */
export const Ce = {
  ...D,
  STARVOID: 16,
  COLUMN: 17,
  GEAR: 18,
  MIRROR_S: 19,
  MIRROR_B: 20,
  LAMP: 21,
  PRISM: 22,
  BRASS: 23,
  EYE: 24,
  EYE_LIT: 25,
  GLYPH_ALTAR: 26,
  GLYPH_STELE: 27,
  MURAL: 28,
  AUTH: 29,
  AUTH_LIT: 30,
  BELL: 31,
  SHELF: 32,
  ARCHON: 33,
  THRONE: 34,
  P_SUN: 35,
  P_MOON: 36,
  P_COMET: 37,
  P_VOID: 38,
  P_EMPTY: 39,
  RING: 40,
  CASCADE: 41,
  CURTAIN: 42,
  SEAL: 43,
  STEP: 44,
  GAP: 45,
  CLOUD: 46,
  DUST: 47,
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

/** A walled marble hall. */
function room(width, height, seed, floor = Ce.DUST, alt = Ce.DUST) {
  const ground = grid(width, height, floor);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, seed) < 18) ground[y][x] = alt;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) walls[y][x] = Ce.WALL_FACE;
      if (y === 1 && x > 0 && x < width - 1) walls[y][x] = Ce.WALL_TOP;
    }
  return { ground, walls };
}
const door = (L, tiles, floor = Ce.ENGRAVED) => {
  for (const [x, y] of tiles) {
    L.walls[y][x] = -1;
    L.ground[y][x] = floor;
  }
};
const columns = (L, list) => place(L.walls, list, Ce.COLUMN);

// ================================================================== 1. Celestial stairs
export function celestialStairs() {
  const width = 24;
  const height = 16;
  const L = room(width, height, 601);
  fill(L.walls, 1, 2, 22, 3, Ce.STARVOID);
  fill(L.walls, 1, 12, 5, 14, Ce.STARVOID);
  door(L, [[23, 8]]);
  for (let x = 2; x < 22; x++) L.ground[8][x] = Ce.ENGRAVED;
  columns(L, [
    [8, 5],
    [8, 11],
    [15, 5],
    [15, 11],
  ]);
  L.walls[5][5] = Ce.GLYPH_STELE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 8), from_ch5: pt(2, 8), from_courtyard: pt(21, 8) },
    exits: {},
    points: { stele: pt(5, 6), kuro: pt(4, 9) },
  };
}

// ================================================================== 2. Outer courtyard (C01)
export function outerCourtyard() {
  const width = 28;
  const height = 18;
  const L = room(width, height, 602);
  door(L, [
    [0, 9],
    [14, 0],
    [14, 1],
  ]);
  place(
    L.walls,
    [
      [13, 2],
      [14, 2],
      [15, 2],
    ],
    Ce.CURTAIN,
  );
  L.walls[5][10] = Ce.GLYPH_STELE;
  L.walls[5][18] = Ce.GLYPH_STELE;
  L.walls[5][14] = Ce.GLYPH_ALTAR;
  columns(L, [
    [5, 4],
    [23, 4],
    [5, 14],
    [23, 14],
    [11, 2],
    [17, 2],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 9), from_stairs: pt(2, 9), from_pillars: pt(14, 3) },
    exits: {},
    points: {
      stele_sun: pt(10, 6),
      stele_void: pt(18, 6),
      gate_text: pt(14, 3),
      slot_1: pt(12, 7),
      slot_2: pt(16, 7),
      engrave: pt(14, 6),
      curtain: [pt(13, 2), pt(14, 2), pt(15, 2)],
      light_1: pt(6, 11),
      light_2: pt(21, 11),
      shadow_1: pt(8, 14),
      shadow_2: pt(20, 14),
    },
  };
}

// ================================================================== 3. Hall of pillars (C02 beam)
export const BEAM = {
  lamp: pt(3, 4),
  m1: pt(10, 4),
  prism: pt(10, 8),
  m2: pt(10, 12),
  brass: pt(16, 12),
  m3: pt(22, 12),
  eye: pt(22, 6),
};
export function hallOfPillars() {
  const width = 30;
  const height = 20;
  const L = room(width, height, 603);
  door(L, [
    [15, 19],
    [24, 0],
  ]);
  L.walls[1][24] = Ce.GATE;
  const b = BEAM;
  L.walls[b.lamp.y][b.lamp.x] = Ce.LAMP;
  L.walls[b.m1.y][b.m1.x] = Ce.MIRROR_S;
  L.walls[b.prism.y][b.prism.x] = Ce.PRISM;
  L.walls[b.m2.y][b.m2.x] = Ce.MIRROR_S;
  L.walls[b.brass.y][b.brass.x] = Ce.BRASS;
  L.walls[b.m3.y][b.m3.x] = Ce.MIRROR_B;
  L.walls[b.eye.y][b.eye.x] = Ce.EYE;
  // A second brass pillar on the lamp's row: a beam sent straight on scatters there.
  L.walls[4][16] = Ce.BRASS;
  L.walls[1][5] = Ce.MURAL;
  columns(L, [
    [4, 9],
    [27, 15],
    [4, 16],
    [18, 3],
    [27, 3],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(15, 17), from_courtyard: pt(15, 17), from_herald: pt(24, 2) },
    exits: {},
    points: {
      floor_diagram: pt(6, 7),
      optics_note: pt(26, 9),
      mural: pt(5, 2),
      gate: [pt(24, 1)],
      light_1: pt(3, 13),
      light_2: pt(25, 6),
      construct_1: pt(7, 15),
      construct_2: pt(24, 16),
      shadow_1: pt(14, 16),
    },
  };
}

// ================================================================== 4. Herald's roost
export function heraldRoost() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 604);
  door(L, [
    [11, 15],
    [21, 8],
  ]);
  fill(L.walls, 1, 2, 4, 6, Ce.STARVOID);
  fill(L.walls, 17, 2, 20, 6, Ce.STARVOID);
  columns(L, [
    [6, 10],
    [15, 10],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(11, 13), from_pillars: pt(11, 13), from_nave: pt(19, 8) },
    exits: {},
    points: { herald: pt(11, 5) },
  };
}

// ================================================================== 5. Fracture nave (C03)
export const ALTARS = {
  continuum: pt(16, 4),
  causality: pt(21, 6),
  memory: pt(21, 14),
  finality: pt(16, 16),
  possibility: pt(11, 14),
  origin: pt(11, 6),
};
export function fractureNave() {
  const width = 32;
  const height = 20;
  const L = room(width, height, 605);
  door(L, [
    [0, 10],
    [31, 10],
  ]);
  for (const t of Object.values(ALTARS)) L.walls[t.y][t.x] = Ce.AUTH;
  L.walls[10][16] = Ce.ALTAR;
  fill(L.ground, 13, 8, 19, 12, Ce.ENGRAVED);
  columns(L, [
    [4, 4],
    [27, 4],
    [4, 15],
    [27, 15],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 10), from_herald: pt(2, 10), from_gallery: pt(29, 10) },
    exits: {},
    points: {
      rift: pt(16, 11),
      parchment: pt(4, 17),
      twin_1: pt(7, 4),
      twin_2: pt(25, 16),
      nullifier: pt(25, 4),
    },
  };
}

// ================================================================== 6. Gallery of eras (C04)
export function galleryOfEras() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 606);
  door(L, [
    [0, 9],
    [25, 9],
  ]);
  for (const x of [6, 10, 14, 18]) L.walls[1][x] = Ce.MURAL;
  L.walls[5][22] = Ce.GLYPH_STELE;
  L.walls[14][2] = Ce.MURAL;
  L.walls[14][23] = Ce.MURAL;
  L.walls[15][12] = Ce.ARCHON;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 9), from_nave: pt(2, 9), from_cascade: pt(23, 9) },
    exits: {},
    points: {
      murals: [pt(6, 2), pt(10, 2), pt(14, 2), pt(18, 2)],
      frames: [pt(6, 6), pt(10, 6), pt(14, 6), pt(18, 6)],
      place: pt(12, 9),
      stele: pt(22, 6),
      memorial: pt(3, 14),
      family: pt(22, 14),
      oil: pt(12, 14),
      light: pt(6, 12),
      shadow: pt(16, 13),
      twin: pt(20, 10),
    },
  };
}

// ================================================================== 7. Frozen cascade (C05)
export const CASCADE = [];
for (let y = 2; y <= 17; y++) for (const x of [11, 12]) CASCADE.push(pt(x, y));
export const CHASM = [];
for (let y = 2; y <= 17; y++) for (const x of [18, 19, 20]) CHASM.push(pt(x, y));
export const BRIDGE = CHASM.filter((t) => t.y >= 9 && t.y <= 11);
export function frozenCascade() {
  const width = 26;
  const height = 20;
  const L = room(width, height, 607);
  door(L, [
    [0, 10],
    [25, 10],
  ]);
  for (const t of CASCADE) L.walls[t.y][t.x] = Ce.CASCADE;
  for (const t of CHASM) L.walls[t.y][t.x] = Ce.STARVOID;
  L.walls[8][8] = Ce.GLYPH_ALTAR;
  L.walls[8][15] = Ce.GLYPH_ALTAR;
  L.walls[4][7] = Ce.GLYPH_STELE;
  L.walls[4][15] = Ce.GLYPH_STELE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 10), from_gallery: pt(2, 10), from_archives: pt(23, 10) },
    exits: {},
    points: {
      stele_flow: pt(7, 5),
      stele_matter: pt(15, 5),
      a1_slot_1: pt(7, 10),
      a1_slot_2: pt(9, 10),
      a1_engrave: pt(8, 9),
      a2_slot_1: pt(14, 10),
      a2_slot_2: pt(16, 10),
      a2_engrave: pt(15, 9),
      null_1: pt(5, 15),
      null_2: pt(23, 4),
    },
  };
}

// ================================================================== 8. Archives (C06)
export const STATUES = { solon: pt(10, 5), kael: pt(15, 5), vane: pt(20, 5) };
export function archivesRuins() {
  const width = 30;
  const height = 20;
  const L = room(width, height, 608);
  door(L, [
    [0, 10],
    [29, 10],
  ]);
  for (const t of Object.values(STATUES)) L.walls[t.y][t.x] = Ce.ARCHON;
  fill(L.walls, 18, 15, 27, 15, Ce.SHELF);
  fill(L.walls, 18, 17, 27, 17, Ce.SHELF);
  place(
    L.walls,
    [
      [4, 4],
      [6, 14],
      [26, 4],
    ],
    Ce.GLYPH_STELE,
  );
  L.walls[16][3] = Ce.GATE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: pt(2, 10),
      from_cascade: pt(2, 10),
      from_core: pt(27, 10),
      from_cell: pt(4, 16),
    },
    exits: {},
    points: {
      law: pt(4, 5),
      testimony: { solon: pt(10, 6), kael: pt(15, 6), vane: pt(20, 6) },
      roles: { solon: pt(10, 8), kael: pt(15, 8), vane: pt(20, 8) },
      verdict: pt(15, 10),
      solon_npc: pt(13, 12),
      shelf_plea: pt(24, 16),
      shelf_a: pt(20, 16),
      niche: pt(27, 16),
      names: pt(6, 15),
      chronicle: pt(26, 5),
      trapdoor: pt(4, 16),
      light: pt(9, 15),
      shadow: pt(12, 15),
      construct: pt(24, 11),
    },
  };
}

// ================================================================== 9. Chronos' cell (hidden A, C11)
export function secretChronosCell() {
  const width = 20;
  const height = 14;
  const L = room(width, height, 609);
  L.walls[5][10] = Ce.ASTROLABE;
  L.walls[8][15] = Ce.RELIQUARY;
  L.walls[1][5] = Ce.MURAL;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(10, 11) },
    exits: {},
    points: {
      ceiling: pt(5, 2),
      scrap: pt(15, 4),
      disc: pt(9, 6),
      align: pt(11, 6),
      chest: pt(15, 9),
      back: pt(10, 12),
    },
  };
}

// ================================================================== 10. Genesis core (C07)
export function genesisCore() {
  const width = 28;
  const height = 20;
  const L = room(width, height, 610);
  door(L, [
    [0, 10],
    [27, 10],
  ]);
  for (const x of [9, 14, 19]) L.walls[6][x] = Ce.GEAR;
  L.walls[3][23] = Ce.SEAL;
  L.walls[10][27] = Ce.GATE;
  columns(L, [
    [4, 4],
    [4, 16],
    [24, 16],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 10), from_archives: pt(2, 10), from_bell: pt(25, 10) },
    exits: {},
    points: {
      gears: [pt(9, 7), pt(14, 7), pt(19, 7)],
      handbook: pt(4, 13),
      lever: pt(14, 11),
      secret: pt(23, 4),
      oil: pt(6, 3),
      lift: [pt(27, 10)],
      twin: pt(8, 15),
      construct: pt(20, 14),
    },
  };
}

// ================================================================== 11. Bell sanctuary (C08)
export function bellSanctuary() {
  const width = 24;
  const height = 18;
  const L = room(width, height, 611);
  door(L, [
    [0, 9],
    [23, 9],
  ]);
  for (const x of [6, 10, 14, 18]) L.walls[3][x] = Ce.BELL;
  L.walls[15][12] = Ce.BELL;
  place(
    L.walls,
    [
      [3, 6],
      [21, 6],
    ],
    Ce.GLYPH_STELE,
  );
  L.walls[14][2] = Ce.MURAL;
  L.walls[9][23] = Ce.GATE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 9), from_core: pt(2, 9), from_ring: pt(21, 9) },
    exits: {},
    points: {
      bells: [pt(6, 4), pt(10, 4), pt(14, 4), pt(18, 4)],
      beats: [pt(7, 8), pt(10, 8), pt(13, 8), pt(16, 8)],
      strike: pt(12, 11),
      poem: pt(3, 7),
      rule: pt(21, 7),
      cracked: pt(12, 14),
      oil: pt(20, 14),
      memorial: pt(3, 14),
      gate: [pt(23, 9)],
      light: pt(8, 13),
      nullifier: pt(18, 13),
      shadow: pt(5, 11),
    },
  };
}

// ================================================================== 12. Orrery (C09, rings)
export const RING_CENTER = pt(13, 10);
const RING_DIRS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
/** Tiles of ring `r` (1 = inner … 3 = outer) and its four door tiles. */
export function ringTiles(r) {
  const c = RING_CENTER;
  const tiles = [];
  for (let y = c.y - r; y <= c.y + r; y++)
    for (let x = c.x - r; x <= c.x + r; x++)
      if (Math.max(Math.abs(x - c.x), Math.abs(y - c.y)) === r) tiles.push(pt(x, y));
  const doors = Object.fromEntries(
    Object.entries(RING_DIRS).map(([k, [dx, dy]]) => [k, pt(c.x + dx * r, c.y + dy * r)]),
  );
  return { tiles, doors };
}
export function orrery() {
  const width = 26;
  const height = 22;
  const L = room(width, height, 612);
  door(L, [[13, 21]]);
  // Everything around the orrery is open sky; only the south walkway leads to it.
  fill(L.walls, 1, 2, 24, 20, Ce.STARVOID);
  fill(L.walls, 9, 14, 17, 20, -1);
  for (let r = 1; r <= 3; r++) for (const t of ringTiles(r).tiles) L.walls[t.y][t.x] = Ce.RING;
  L.walls[RING_CENTER.y][RING_CENTER.x] = -1;
  L.ground[RING_CENTER.y][RING_CENTER.x] = Ce.ENGRAVED;
  for (let y = 14; y <= 20; y++) L.ground[y][13] = Ce.ENGRAVED;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(13, 19), from_bell: pt(13, 19), from_gate: pt(13, 15) },
    exits: {},
    points: {
      levers: { inner: pt(10, 17), middle: pt(13, 18), outer: pt(16, 17) },
      chart: pt(10, 19),
      core: RING_CENTER,
    },
  };
}

// ================================================================== 13. Threshold gate (C10)
export function thresholdGate() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 613);
  door(L, [
    [13, 0],
    [13, 1],
  ]);
  L.walls[2][13] = Ce.CURTAIN;
  L.walls[5][13] = Ce.GLYPH_ALTAR;
  L.walls[2][10] = Ce.GLYPH_STELE;
  L.walls[14][23] = Ce.FRACTURE;
  columns(L, [
    [5, 4],
    [20, 4],
    [5, 13],
    [20, 13],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: pt(13, 16),
      from_ring: pt(13, 16),
      from_approach: pt(13, 3),
      from_chess: pt(22, 15),
    },
    exits: {},
    points: {
      riddle: pt(10, 3),
      slots: [pt(11, 7), pt(13, 7), pt(15, 7)],
      engrave: pt(13, 6),
      curtain: [pt(13, 2)],
      crack: pt(23, 15),
    },
  };
}

// ================================================================== 14. Celestial chessboard (hidden B, C12)
/** Solution rows (S sun, M moon, C comet, H void); the eight blanks are where the dials sit. */
export const CHESS_SOLUTION = ['SHMC', 'CMSH', 'HSCM', 'MCHS'];
export const CHESS_BLANKS = [
  [0, 2],
  [0, 3],
  [1, 0],
  [1, 1],
  [2, 2],
  [2, 3],
  [3, 0],
  [3, 1],
];
export const CHESS_ORIGIN = pt(9, 4);
const PIECE = { S: Ce.P_SUN, M: Ce.P_MOON, C: Ce.P_COMET, H: Ce.P_VOID };
export function celestialChessboard() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 614);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const blank = CHESS_BLANKS.some(([br, bc]) => br === r && bc === c);
      L.ground[CHESS_ORIGIN.y + r][CHESS_ORIGIN.x + c] = blank
        ? Ce.P_EMPTY
        : PIECE[CHESS_SOLUTION[r][c]];
    }
  L.walls[4][4] = Ce.GLYPH_STELE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(11, 13) },
    exits: {},
    points: { rules: pt(4, 5), check: pt(11, 10), back: pt(11, 14) },
  };
}

// ================================================================== 15. Sanctum approach (elite)
export function sanctumApproach() {
  const width = 32;
  const height = 16;
  const L = room(width, height, 615);
  door(L, [
    [0, 8],
    [31, 8],
  ]);
  for (let x = 1; x < 31; x++) L.ground[8][x] = Ce.ENGRAVED;
  columns(L, [
    [6, 3],
    [12, 3],
    [20, 3],
    [26, 3],
    [6, 13],
    [12, 13],
    [20, 13],
    [26, 13],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 8), from_gate: pt(2, 8), from_thrones: pt(29, 8) },
    exits: {},
    points: {
      deacon: pt(16, 8),
      shadow: pt(8, 5),
      construct: pt(9, 11),
      twin: pt(24, 11),
      nullifier: pt(24, 5),
      lights: [pt(4, 8), pt(27, 6)],
    },
  };
}

// ================================================================== 16. Hall of thrones (boss)
export function hallOfThrones() {
  const width = 30;
  const height = 22;
  const L = room(width, height, 616);
  door(L, [
    [0, 11],
    [29, 11],
  ]);
  L.walls[3][15] = Ce.THRONE;
  fill(L.ground, 12, 4, 18, 18, Ce.ENGRAVED);
  L.walls[4][8] = Ce.GLYPH_STELE;
  L.walls[18][26] = Ce.FRACTURE;
  L.walls[11][29] = Ce.GATE;
  columns(L, [
    [5, 6],
    [24, 6],
    [5, 16],
    [24, 16],
  ]);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: pt(2, 11),
      from_approach: pt(2, 11),
      from_nook: pt(25, 17),
      from_abyss: pt(27, 11),
    },
    exits: {},
    points: {
      warden: pt(15, 9),
      throne: pt(15, 4),
      names: pt(8, 5),
      remnant: pt(15, 6),
      kuro: pt(11, 13),
      crack: pt(26, 17),
      gate: [pt(29, 11)],
    },
  };
}

// ================================================================== 17. First void abyss (end)
export function firstVoidAbyss() {
  const width = 28;
  const height = 18;
  const L = room(width, height, 617, Ce.CLOUD, Ce.CLOUD);
  fill(L.walls, 1, 2, 26, 16, Ce.STARVOID);
  fill(L.walls, 1, 8, 22, 10, -1);
  L.walls[9][24] = Ce.SEAL;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(1, 9), from_thrones: pt(1, 9) },
    exits: {},
    points: { edge: { x: 18, y: 8, w: 3, h: 3 } },
  };
}

// ================================================================== 18. First Forgotten's nook (hidden C, C13)
export function firstForgottenNook() {
  const width = 20;
  const height = 14;
  const L = room(width, height, 618, Ce.FLOOR, Ce.STARVOID);
  // STARVOID on the ground layer is only a dark floor here (it does not collide there).
  L.walls[4][10] = Ce.GLYPH_ALTAR;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(10, 11) },
    exits: {},
    points: {
      slots: [pt(8, 7), pt(10, 7), pt(12, 7)],
      engrave: pt(10, 5),
      echo: pt(10, 2),
      back: pt(10, 12),
    },
  };
}

export const CH6_MAPS = [
  { id: 'map_ch6_celestial_stairs', tileset: 'celestial', build: celestialStairs },
  { id: 'map_ch6_outer_courtyard', tileset: 'celestial', build: outerCourtyard },
  { id: 'map_ch6_hall_of_pillars', tileset: 'celestial', build: hallOfPillars },
  { id: 'map_ch6_herald_roost', tileset: 'celestial', build: heraldRoost },
  { id: 'map_ch6_fracture_nave', tileset: 'celestial', build: fractureNave },
  { id: 'map_ch6_gallery_of_eras', tileset: 'celestial', build: galleryOfEras },
  { id: 'map_ch6_frozen_cascade', tileset: 'celestial', build: frozenCascade },
  { id: 'map_ch6_archives_ruins', tileset: 'celestial', build: archivesRuins },
  { id: 'map_ch6_secret_chronos_cell', tileset: 'celestial', build: secretChronosCell },
  { id: 'map_ch6_genesis_core', tileset: 'celestial', build: genesisCore },
  { id: 'map_ch6_bell_sanctuary', tileset: 'celestial', build: bellSanctuary },
  { id: 'map_ch6_refraction_maze', tileset: 'celestial', build: orrery },
  { id: 'map_ch6_threshold_gate', tileset: 'celestial', build: thresholdGate },
  { id: 'map_ch6_celestial_chessboard', tileset: 'celestial', build: celestialChessboard },
  { id: 'map_ch6_sanctum_approach', tileset: 'celestial', build: sanctumApproach },
  { id: 'map_ch6_hall_of_thrones', tileset: 'celestial', build: hallOfThrones },
  { id: 'map_ch6_first_void_abyss', tileset: 'celestial', build: firstVoidAbyss },
  { id: 'map_ch6_first_forgotten_nook', tileset: 'celestial', build: firstForgottenNook },
];
