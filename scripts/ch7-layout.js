/**
 * Chapter 7 "The Cradle of the Forgotten" map layouts (CHAPTER_07_DESIGN.md §4 with §18), shared by
 * scripts/generate-ch1-maps.js and scripts/preview-ch1-maps.js (`ch7`). Values are tile indices of
 * voidcore_tileset; -1 = empty. `points` name the tiles scripts/wire-ch7.mjs wires. Every spawn sits
 * at least two tiles from its exit.
 */
import { D } from './ch1-layout.js';

/** voidcore_tileset: dungeon 0-15 tinted + Chapter 7 tiles. Collision GID 4-44. */
export const Vc = {
  ...D,
  VOID: 16,
  STONE: 17,
  STONE_LIT: 18,
  CHAIN_POST: 19,
  LANTERN: 20,
  LANTERN_LIT: 21,
  CRADLE: 22,
  GHOST_HOUSE: 23,
  HOLLOW_TREE: 24,
  WELL: 25,
  CLOCK: 26,
  GRAVE: 27,
  CRYSTAL: 28,
  ASH: 29,
  DOOR: 30,
  ALTAR: 31,
  SHELF: 32,
  BENCH: 33,
  BOAT: 34,
  BANYAN: 35,
  POOL: 36,
  BELL: 37,
  FOG: 38,
  SEAL_HALF: 39,
  RIFT: 40,
  INK: 41,
  CHAIN_WALL: 42,
  GATE_FRAME: 43,
  ASHGLASS: 44,
  RUNE: 45,
  ISLAND: 46,
  SAND: 47,
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

/** A walled hollow of the deep void. */
function room(width, height, seed, floor = Vc.ASHGLASS, alt = Vc.ASHGLASS) {
  const ground = grid(width, height, floor);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, seed) < 14) ground[y][x] = alt;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) walls[y][x] = Vc.WALL_FACE;
      if (y === 1 && x > 0 && x < width - 1) walls[y][x] = Vc.WALL_TOP;
    }
  return { ground, walls };
}
const door = (L, tiles, floor = Vc.RUNE) => {
  for (const [x, y] of tiles) {
    L.walls[y][x] = -1;
    L.ground[y][x] = floor;
  }
};

// ================================================================== 1. Ash abyss drop
export function ashAbyssDrop() {
  const width = 24;
  const height = 16;
  const L = room(width, height, 701);
  door(L, [[23, 8]]);
  fill(L.walls, 1, 2, 22, 3, Vc.VOID);
  fill(L.walls, 1, 12, 6, 14, Vc.VOID);
  place(
    L.walls,
    [
      [9, 5],
      [15, 11],
      [18, 5],
    ],
    Vc.CRYSTAL,
  );
  L.walls[6][4] = Vc.CLOCK;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(3, 8), from_ch6: pt(3, 8), from_shore: pt(21, 8) },
    exits: {},
    points: { watch: pt(4, 7), seal: pt(8, 9) },
  };
}

// ================================================================== 2. Faded shore (C01)
export const SHORE_CHASM = [];
for (let y = 2; y <= 16; y++) for (const x of [15, 16, 17]) SHORE_CHASM.push(pt(x, y));
export const SHORE_BRIDGE = SHORE_CHASM.filter((t) => t.y >= 8 && t.y <= 10);
export function fadedShore() {
  const width = 28;
  const height = 18;
  const L = room(width, height, 702, Vc.SAND, Vc.SAND);
  door(L, [
    [0, 9],
    [27, 9],
  ]);
  for (const t of SHORE_CHASM) L.walls[t.y][t.x] = Vc.VOID;
  L.walls[7][12] = Vc.ALTAR;
  place(
    L.walls,
    [
      [4, 4],
      [8, 14],
      [22, 4],
      [24, 14],
    ],
    Vc.BOAT,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 9), from_drop: pt(2, 9), from_hamlet: pt(25, 9) },
    exits: {},
    points: {
      keeper: pt(13, 9),
      slots: [pt(10, 9), pt(11, 10), pt(12, 11)],
      engrave: pt(12, 8),
      tag: pt(6, 12),
      fisherman: pt(5, 6),
      moths: [pt(8, 4), pt(22, 12)],
    },
  };
}

// ================================================================== 3. Erased hamlet (C02)
export const HAMLET_GATE = [pt(15, 1)];
export function erasedHamlet() {
  const width = 30;
  const height = 20;
  const L = room(width, height, 703, Vc.SAND, Vc.SAND);
  door(L, [
    [0, 10],
    [15, 0],
  ]);
  L.walls[1][15] = Vc.DOOR;
  place(
    L.walls,
    [
      [5, 4],
      [10, 4],
      [20, 4],
      [24, 14],
      [5, 15],
    ],
    Vc.GHOST_HOUSE,
  );
  place(
    L.walls,
    [
      [12, 7],
      [15, 7],
      [18, 7],
    ],
    Vc.LANTERN,
  );
  L.walls[6][24] = Vc.STONE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 10), from_shore: pt(2, 10), from_cradle: pt(15, 3) },
    exits: {},
    points: {
      windows: [pt(12, 8), pt(15, 8), pt(18, 8)],
      lanterns: [pt(12, 7), pt(15, 7), pt(18, 7)],
      light: pt(15, 11),
      table: pt(8, 11),
      custom: pt(24, 7),
      scratches: pt(21, 9),
      secret: pt(10, 5),
      husks: [pt(6, 8), pt(25, 10)],
      hound: pt(18, 15),
    },
  };
}

// ================================================================== 4. Cradle sanctuary (C03)
export function cradleSanctuary() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 704);
  door(L, [
    [13, 17],
    [0, 9],
  ]);
  L.walls[6][13] = Vc.CRADLE;
  L.walls[6][17] = Vc.ALTAR;
  place(
    L.walls,
    [
      [5, 4],
      [21, 4],
      [5, 13],
      [21, 13],
    ],
    Vc.LANTERN_LIT,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(13, 15), from_hamlet: pt(13, 15), from_well: pt(2, 9) },
    exits: {},
    points: {
      mother: pt(11, 7),
      embroidery: pt(13, 7),
      slots: [pt(16, 9), pt(17, 9), pt(18, 9)],
      engrave: pt(17, 7),
      secret: pt(14, 7),
    },
  };
}

// ================================================================== 5. Echo well (C04)
export function echoWellDepths() {
  const width = 24;
  const height = 20;
  const L = room(width, height, 705);
  door(L, [
    [23, 9],
    [12, 19],
  ]);
  L.walls[18][12] = Vc.DOOR;
  L.walls[9][12] = Vc.WELL;
  place(
    L.walls,
    [
      [9, 6],
      [12, 5],
      [15, 6],
    ],
    Vc.ALTAR,
  );
  L.walls[4][3] = Vc.STONE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(21, 9), from_cradle: pt(21, 9), from_fleet: pt(12, 16) },
    exits: {},
    points: {
      funnels: [pt(9, 7), pt(12, 6), pt(15, 7)],
      drop: pt(12, 11),
      inscription: pt(3, 5),
      pebbles: [pt(5, 14), pt(8, 16), pt(17, 14), pt(19, 16)],
      note: pt(20, 4),
      gate: [pt(12, 18)],
      eaters: [pt(5, 9), pt(19, 9)],
    },
  };
}

// ================================================================== 6. Stranded fleet (C05)
export const BOATS = { a: pt(8, 6), b: pt(16, 13), c: pt(24, 6) };
export function strandedFleet() {
  const width = 32;
  const height = 20;
  const L = room(width, height, 706, Vc.SAND, Vc.SAND);
  door(L, [
    [12, 0],
    [31, 10],
  ]);
  L.walls[10][31] = Vc.DOOR;
  for (const t of Object.values(BOATS)) L.walls[t.y][t.x] = Vc.BOAT;
  place(
    L.walls,
    [
      [4, 15],
      [28, 15],
    ],
    Vc.BOAT,
  );
  L.walls[3][16] = Vc.SHELF;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(12, 2), from_well: pt(12, 2), from_clocks: pt(29, 10) },
    exits: {},
    points: {
      sailors: { a: pt(8, 7), b: pt(16, 12), c: pt(24, 7) },
      tag_c: pt(25, 8),
      paint_c: pt(23, 7),
      ledger: pt(16, 4),
      logbook: pt(16, 14),
      captain: pt(14, 9),
      handover: pt(16, 9),
      chronicle_page: pt(9, 15),
      cabin: pt(4, 14),
      compass: [pt(7, 6), pt(17, 13), pt(25, 6)],
      gate: [pt(31, 10)],
      hounds: [pt(6, 11), pt(26, 13)],
      moths: pt(20, 3),
    },
  };
}

// ================================================================== 7. Clock graveyard (C06)
export const SWAMP = [];
for (let y = 2; y <= 4; y++) for (let x = 10; x <= 16; x++) SWAMP.push(pt(x, y));
export function clockGraveyard() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 707);
  door(L, [
    [0, 9],
    [13, 0],
  ]);
  for (const t of SWAMP) L.walls[t.y][t.x] = Vc.ASH;
  L.walls[1][13] = Vc.ASH;
  L.walls[9][13] = Vc.CLOCK;

  place(
    L.walls,
    [
      [4, 6],
      [8, 14],
      [19, 6],
      [22, 14],
      [4, 14],
    ],
    Vc.GRAVE,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 9), from_fleet: pt(2, 9), from_weeper: pt(13, 6) },
    exits: {},
    points: {
      quarters: { q12: pt(13, 8), q3: pt(14, 9), q6: pt(13, 10), q9: pt(12, 9) },
      check: pt(13, 12),
      note: pt(20, 9),
      fissure: pt(13, 7),
      secret: pt(4, 15),
      swamp: SWAMP.concat([pt(13, 1)]),
      husks: [pt(6, 11), pt(20, 13)],
      eater: pt(21, 5),
    },
  };
}

// ================================================================== 8. Weeper crossing (mid-boss, hidden A)
export function weeperCrossing() {
  const width = 28;
  const height = 20;
  const L = room(width, height, 708);
  door(L, [
    [14, 19],
    [14, 0],
  ]);
  L.walls[1][14] = Vc.DOOR;
  fill(L.walls, 1, 2, 4, 18, Vc.INK);
  fill(L.walls, 23, 2, 26, 18, Vc.INK);
  L.walls[10][4] = Vc.RIFT;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: pt(14, 17),
      from_clocks: pt(14, 17),
      from_archives: pt(14, 3),
      from_tomb: pt(6, 10),
    },
    exits: {},
    points: { weeper: pt(14, 8), crack: pt(5, 10), gate: [pt(14, 1)] },
  };
}

// ================================================================== 9. First mason's tomb (hidden A, C11)
export function firstMasonTomb() {
  const width = 20;
  const height = 14;
  const L = room(width, height, 709);
  place(
    L.walls,
    [
      [4, 5],
      [8, 5],
      [12, 5],
      [16, 5],
    ],
    Vc.STONE,
  );
  L.walls[3][10] = Vc.GRAVE;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(10, 11) },
    exits: {},
    points: {
      stones: [pt(4, 6), pt(8, 6), pt(12, 6), pt(16, 6)],
      chisels: [pt(4, 8), pt(8, 8), pt(12, 8), pt(16, 8)],
      rules: pt(10, 4),
      carve: pt(10, 9),
      back: pt(10, 12),
    },
  };
}

// ================================================================== 10. Blank archives (C07)
export function blankArchives() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 710);
  door(L, [
    [13, 17],
    [25, 9],
  ]);
  place(
    L.walls,
    [
      [6, 4],
      [10, 4],
      [14, 4],
      [18, 4],
    ],
    Vc.SHELF,
  );
  fill(L.walls, 3, 13, 9, 13, Vc.SHELF);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(13, 15), from_weeper: pt(13, 15), from_tree: pt(23, 9) },
    exits: {},
    points: {
      shelves: [pt(6, 5), pt(10, 5), pt(14, 5), pt(18, 5)],
      scrolls: [pt(4, 9), pt(8, 10), pt(18, 10), pt(22, 9)],
      legend: pt(22, 4),
      memo: pt(4, 5),
      check: pt(12, 8),
      solon: pt(20, 13),
      key: pt(6, 14),
      eater: pt(16, 12),
    },
  };
}

// ================================================================== 11. Bang tree promontory (C08)
export function bangTreePromontory() {
  const width = 28;
  const height = 18;
  const L = room(width, height, 711, Vc.SAND, Vc.SAND);
  door(L, [
    [0, 9],
    [14, 17],
  ]);
  fill(L.walls, 20, 2, 26, 16, Vc.VOID);
  L.walls[8][16] = Vc.BANYAN;
  L.walls[16][14] = Vc.FOG;
  place(
    L.walls,
    [
      [5, 4],
      [7, 14],
    ],
    Vc.BOAT,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 9), from_archives: pt(2, 9), from_maze: pt(14, 14) },
    exits: {},
    points: {
      box: pt(15, 9),
      dials: [pt(12, 10), pt(13, 11), pt(14, 12)],
      open: pt(17, 10),
      diary: pt(4, 12),
      carving: pt(16, 7),
      gate: [pt(14, 16)],
      moths: pt(9, 5),
      hound: pt(10, 13),
    },
  };
}

// ================================================================== 12. Fog lullaby maze (C09)
/** The four landmarks of the lullaby, in the song's order. */
export const LANDMARKS = [
  { key: 'pier', tile: pt(5, 13), area: { x: 4, y: 12, w: 3, h: 3 } },
  { key: 'banyan', tile: pt(18, 13), area: { x: 17, y: 12, w: 3, h: 3 } },
  { key: 'well', tile: pt(5, 5), area: { x: 4, y: 4, w: 3, h: 3 } },
  { key: 'lamp', tile: pt(18, 5), area: { x: 17, y: 4, w: 3, h: 3 } },
];
export const FOG_EXIT = [pt(23, 9)];
export function fogLullabyMaze() {
  const width = 24;
  const height = 18;
  const L = room(width, height, 712);
  door(L, [
    [12, 0],
    [23, 9],
  ]);
  L.walls[9][23] = Vc.FOG;
  const tiles = { pier: Vc.BOAT, banyan: Vc.BANYAN, well: Vc.WELL, lamp: Vc.LANTERN };
  for (const l of LANDMARKS) L.walls[l.tile.y][l.tile.x] = tiles[l.key];
  place(
    L.walls,
    [
      [11, 6],
      [12, 12],
      [8, 9],
      [15, 9],
    ],
    Vc.FOG,
  );
  L.walls[16][20] = Vc.DOOR;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: pt(12, 3),
      from_tree: pt(12, 3),
      from_cathedral: pt(21, 9),
      from_crypt: pt(20, 14),
    },
    exits: {},
    points: { start: pt(12, 3), crypt: pt(20, 15), gate: FOG_EXIT },
  };
}

// ================================================================== 13. White bell crypt (hidden B, C12)
export function whiteBellCrypt() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 713);
  place(
    L.walls,
    [
      [6, 4],
      [11, 3],
      [16, 4],
    ],
    Vc.BELL,
  );
  L.walls[6][11] = Vc.ALTAR;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(11, 13) },
    exits: {},
    points: {
      letter: pt(11, 7),
      words: [pt(8, 9), pt(11, 10), pt(14, 9)],
      read: pt(11, 12),
      back: pt(11, 14),
    },
  };
}

// ================================================================== 14. Chain cathedral
export function chainCathedral() {
  const width = 32;
  const height = 22;
  const L = room(width, height, 714);
  door(L, [
    [0, 11],
    [16, 0],
  ]);
  L.walls[1][16] = Vc.DOOR;
  for (const x of [6, 11, 21, 26]) for (const y of [5, 16]) L.walls[y][x] = Vc.CHAIN_POST;
  fill(L.walls, 11, 3, 14, 3, Vc.CHAIN_WALL);
  fill(L.walls, 18, 3, 21, 3, Vc.CHAIN_WALL);
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 11), from_maze: pt(2, 11), from_pass: pt(16, 3) },
    exits: {},
    points: { forgotten: pt(16, 8), gate: [pt(16, 1)], shade: pt(9, 14) },
  };
}

// ================================================================== 15. Void fissure pass (elite)
export function voidFissurePass() {
  const width = 30;
  const height = 16;
  const L = room(width, height, 715);
  door(L, [
    [0, 8],
    [29, 8],
  ]);
  L.walls[8][29] = Vc.DOOR;
  fill(L.walls, 1, 2, 28, 3, Vc.VOID);
  fill(L.walls, 1, 13, 28, 14, Vc.VOID);
  place(
    L.walls,
    [
      [8, 6],
      [8, 10],
      [20, 6],
      [20, 10],
    ],
    Vc.INK,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 8), from_cathedral: pt(2, 8), from_lake: pt(27, 8) },
    exits: {},
    points: {
      inquisitor: pt(16, 8),
      husk: pt(10, 8),
      eater: pt(24, 6),
      gate: [pt(29, 8)],
    },
  };
}

// ================================================================== 16. Ink lake throne (boss)
export function inkLakeThrone() {
  const width = 32;
  const height = 24;
  const L = room(width, height, 716);
  door(L, [
    [0, 12],
    [31, 12],
  ]);
  L.walls[12][31] = Vc.DOOR;
  for (let y = 4; y <= 10; y++) for (let x = 10; x <= 21; x++) L.ground[y][x] = Vc.POOL;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(2, 12), from_pass: pt(2, 12), from_dawn: pt(29, 12) },
    exits: {},
    points: { kuro: pt(16, 8), kuro_after: pt(15, 14), mother: pt(17, 14), gate: [pt(31, 12)] },
  };
}

// ================================================================== 17. Cradle of dawn (C10, hidden C)
export function cradleOfDawn() {
  const width = 26;
  const height = 18;
  const L = room(width, height, 717);
  door(L, [
    [0, 9],
    [13, 0],
  ]);
  L.walls[1][13] = Vc.DOOR;
  L.walls[6][13] = Vc.SEAL_HALF;
  place(
    L.walls,
    [
      [9, 8],
      [13, 9],
      [17, 8],
    ],
    Vc.CHAIN_POST,
  );
  L.walls[15][22] = Vc.RIFT;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: {
      default: pt(2, 9),
      from_lake: pt(2, 9),
      from_core: pt(21, 14),
      from_threshold: pt(13, 3),
    },
    exits: {},
    points: {
      pins: [pt(9, 9), pt(13, 10), pt(17, 9)],
      whisper: pt(13, 7),
      crack: pt(22, 14),
      gate: [pt(13, 1)],
    },
  };
}

// ================================================================== 18. Glass ash core (hidden C, C13)
export function glassAshCore() {
  const width = 22;
  const height = 16;
  const L = room(width, height, 718);
  place(
    L.walls,
    [
      [6, 5],
      [11, 4],
      [16, 5],
    ],
    Vc.CRYSTAL,
  );
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(11, 13) },
    exits: {},
    points: {
      valves: [pt(6, 6), pt(11, 5), pt(16, 6)],
      table: pt(3, 9),
      balance: pt(11, 9),
      shade: pt(11, 3),
      back: pt(11, 14),
    },
  };
}

// ================================================================== 19. Null hour threshold (end)
export function nullHourThreshold() {
  const width = 28;
  const height = 18;
  const L = room(width, height, 719);
  fill(L.walls, 1, 2, 26, 4, Vc.RIFT);
  L.walls[5][14] = Vc.CLOCK;
  return {
    width,
    height,
    ground: L.ground,
    walls: L.walls,
    spawns: { default: pt(14, 15), from_dawn: pt(14, 15) },
    exits: {},
    points: { edge: { x: 11, y: 6, w: 6, h: 3 } },
  };
}

export const CH7_MAPS = [
  { id: 'map_ch7_ash_abyss_drop', tileset: 'voidcore', build: ashAbyssDrop },
  { id: 'map_ch7_faded_shore', tileset: 'voidcore', build: fadedShore },
  { id: 'map_ch7_erased_hamlet', tileset: 'voidcore', build: erasedHamlet },
  { id: 'map_ch7_cradle_sanctuary', tileset: 'voidcore', build: cradleSanctuary },
  { id: 'map_ch7_echo_well_depths', tileset: 'voidcore', build: echoWellDepths },
  { id: 'map_ch7_stranded_fleet', tileset: 'voidcore', build: strandedFleet },
  { id: 'map_ch7_clock_graveyard', tileset: 'voidcore', build: clockGraveyard },
  { id: 'map_ch7_weeper_crossing', tileset: 'voidcore', build: weeperCrossing },
  { id: 'map_ch7_first_mason_tomb', tileset: 'voidcore', build: firstMasonTomb },
  { id: 'map_ch7_blank_archives', tileset: 'voidcore', build: blankArchives },
  { id: 'map_ch7_bang_tree_promontory', tileset: 'voidcore', build: bangTreePromontory },
  { id: 'map_ch7_fog_lullaby_maze', tileset: 'voidcore', build: fogLullabyMaze },
  { id: 'map_ch7_white_bell_crypt', tileset: 'voidcore', build: whiteBellCrypt },
  { id: 'map_ch7_chain_cathedral', tileset: 'voidcore', build: chainCathedral },
  { id: 'map_ch7_void_fissure_pass', tileset: 'voidcore', build: voidFissurePass },
  { id: 'map_ch7_ink_lake_throne', tileset: 'voidcore', build: inkLakeThrone },
  { id: 'map_ch7_cradle_of_dawn', tileset: 'voidcore', build: cradleOfDawn },
  { id: 'map_ch7_glass_ash_core', tileset: 'voidcore', build: glassAshCore },
  { id: 'map_ch7_null_hour_threshold', tileset: 'voidcore', build: nullHourThreshold },
];
