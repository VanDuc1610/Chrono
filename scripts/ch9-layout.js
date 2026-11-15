/**
 * Chapter 9 "The Fractured Divinity" map layouts (CHAPTER_09_DESIGN.md §4 with §20-§22), shared by
 * scripts/generate-ch1-maps.js and scripts/preview-ch1-maps.js (`ch9`). Values are tile indices of
 * nexus_tileset; -1 = empty. `points` name the tiles scripts/wire-ch9.mjs wires. Every spawn sits
 * at least two tiles from its exit.
 */
import { D } from './ch1-layout.js';

/** nexus_tileset: dungeon 0-15 tinted + Chapter 9 tiles. Collision GID 4-48. */
export const Nx = {
  ...D,
  ABYSS: 16,
  SHARDS: 17,
  MIRROR_CRACK: 18,
  GEAR_WALL: 19,
  PLINTH: 20,
  PLINTH_LIT: 21,
  CHAIR: 22,
  THRONE: 23,
  SCALES: 24,
  PRISM: 25,
  RED: 26,
  BLUE: 27,
  GREEN: 28,
  STATUE_CHRONOS: 29,
  STATUE_KURO: 30,
  STATUE_TN: 31,
  PENDULUM: 32,
  LECTERN: 33,
  PENROSE: 34,
  SQUARE: 35,
  CHIME: 36,
  ASTROLABE: 37,
  STELE: 38,
  QGEAR: 39,
  PILLAR_OFF: 40,
  PILLAR_ON: 41,
  CHAIN_WALL: 42,
  STORM: 43,
  TREE: 44,
  BROKEN_MIRROR: 45,
  CLOCK: 46,
  SOCKET: 47,
  FLOOR: 48,
  GOLD_FLOOR: 49,
  STAR_BRIDGE: 50,
  CRYSTAL_FLOOR: 51,
  GEAR_FLOOR: 52,
  STARFIELD: 53,
  STEP_LIT: 54,
  SAND: 55,
  BOARDS: 56,
  RUNE: 57,
  BRANCH: 58,
  MIRROR_FLOOR: 59,
  CHAIN_BRIDGE: 60,
  SHORE: 61,
  FADED: 62,
  GLOW: 63,
};

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const pt = (x, y) => ({ x, y });

/**
 * A walled hall. `doors` open the border (and the wall-top row under a north door), `props` are
 * [x, y, tile] on the walls layer, `floors` are [x0, y0, x1, y1, tile] ground patches.
 */
function hall(
  width,
  height,
  seed,
  floor,
  { doors = [], props = [], floors = [], alt = Nx.STARFIELD } = {},
) {
  const ground = grid(width, height, floor);
  const walls = grid(width, height, -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (hash(x, y, seed) < 6) ground[y][x] = alt;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) walls[y][x] = Nx.WALL_FACE;
      if (y === 1 && x > 0 && x < width - 1) walls[y][x] = Nx.WALL_TOP;
    }
  for (const [x0, y0, x1, y1, t] of floors)
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ground[y][x] = t;
  for (const [x, y] of doors) {
    walls[y][x] = -1;
    ground[y][x] = Nx.RUNE;
    if (y === 0) walls[1][x] = -1;
  }
  for (const [x, y, t] of props) walls[y][x] = t;
  return { ground, walls };
}
const out = (width, height, L, spawns, points) => ({
  width,
  height,
  ground: L.ground,
  walls: L.walls,
  spawns,
  exits: {},
  points,
});
/** A standard hall: south entrance, north exit, optional east/west side doors. */
const standard = (w, h, seed, floor, { props = [], floors = [], side = [] } = {}) =>
  hall(w, h, seed, floor, {
    doors: [[Math.floor(w / 2), h - 1], [Math.floor(w / 2), 0], ...side],
    props,
    floors,
  });
const cx = (w) => Math.floor(w / 2);

// ================================================================== shared 1–6
export function apexNexus() {
  const [w, h] = [24, 18];
  const L = standard(w, h, 901, Nx.GOLD_FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [12, 6, Nx.SCALES],
      [4, 4, Nx.SHARDS],
      [19, 4, Nx.SHARDS],
      [9, 3, Nx.CLOCK],
      [15, 3, Nx.CLOCK],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 14), from_ch8: pt(cx(w), 14), from_epochs: pt(cx(w), 3) },
    {
      dials: [pt(9, 8), pt(12, 8), pt(15, 8)],
      scales: pt(12, 6),
      gate: pt(cx(w), 1),
      chronos: pt(12, 10),
    },
  );
}
export function thresholdOfEpochs() {
  const [w, h] = [26, 18];
  const L = standard(w, h, 902, Nx.FLOOR, {
    props: [
      [4, 5, Nx.STELE],
      [21, 5, Nx.STELE],
      [8, 11, Nx.BROKEN_MIRROR],
      [18, 11, Nx.BROKEN_MIRROR],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 14), from_apex: pt(cx(w), 14), from_prism: pt(cx(w), 3) },
    {
      clue: pt(5, 13),
      foes: [pt(8, 7), pt(18, 7)],
    },
  );
}
export function prismAtrium() {
  const [w, h] = [28, 20];
  const L = standard(w, h, 903, Nx.CRYSTAL_FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [14, 9, Nx.PRISM],
      [14, 5, Nx.RED],
      [10, 12, Nx.GREEN],
      [18, 12, Nx.BLUE],
      [4, 15, Nx.STATUE_CHRONOS],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 16), from_epochs: pt(cx(w), 16), from_creeds: pt(cx(w), 3) },
    {
      dials: [pt(14, 6), pt(18, 13), pt(10, 13)],
      plate: pt(14, 11),
      gate: pt(cx(w), 1),
      secret: pt(5, 16),
      clue: pt(23, 5),
    },
  );
}
export function hallOfThreeCreeds() {
  const [w, h] = [26, 20];
  const L = standard(w, h, 904, Nx.FLOOR, {
    side: [[0, 10]],
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [7, 6, Nx.STATUE_CHRONOS],
      [13, 5, Nx.STATUE_KURO],
      [19, 6, Nx.STATUE_TN],
      [13, 11, Nx.STELE],
      [1, 10, Nx.CHAIN_WALL],
    ],
  });
  return out(
    w,
    h,
    L,
    {
      default: pt(cx(w), 16),
      from_prism: pt(cx(w), 16),
      from_escapement: pt(cx(w), 3),
      from_crypt: pt(3, 10),
    },
    {
      dials: [pt(7, 7), pt(13, 6), pt(19, 7)],
      stele: pt(13, 12),
      gate: pt(cx(w), 1),
      crypt: pt(1, 10),
      clue: pt(14, 7),
      fb: { x: 10, y: 14, w: 6, h: 3 },
    },
  );
}
export function escapementGallery() {
  const [w, h] = [24, 18];
  const L = standard(w, h, 905, Nx.GEAR_FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [12, 6, Nx.PENDULUM],
      [6, 4, Nx.GEAR_WALL],
      [18, 4, Nx.GEAR_WALL],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 14), from_creeds: pt(cx(w), 14), from_archive: pt(cx(w), 3) },
    {
      dials: [pt(9, 8), pt(12, 8), pt(15, 8)],
      scroll: pt(4, 9),
      gate: pt(cx(w), 1),
      clue: pt(14, 6),
      foes: [pt(6, 11), pt(18, 11)],
    },
  );
}
export function palimpsestArchive() {
  const [w, h] = [28, 20];
  // North door: route A (Penrose); east door: route B (the divergence); west: hidden vault B.
  const L = hall(w, h, 906, Nx.FLOOR, {
    doors: [
      [cx(w), h - 1],
      [cx(w), 0],
      [w - 1, 10],
      [0, 10],
    ],
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [w - 2, 10, Nx.STORM],
      [1, 10, Nx.GEAR_WALL],
      [14, 8, Nx.LECTERN],
      [5, 4, Nx.STELE],
      [22, 4, Nx.STELE],
    ],
  });
  return out(
    w,
    h,
    L,
    {
      default: pt(cx(w), 16),
      from_escapement: pt(cx(w), 16),
      from_penrose: pt(cx(w), 3),
      from_crossroad: pt(24, 10),
      from_vault: pt(3, 10),
    },
    {
      dials: [pt(11, 10), pt(14, 10), pt(17, 10)],
      scroll: pt(14, 9),
      northGate: pt(cx(w), 1),
      eastGate: pt(w - 2, 10),
      vault: pt(1, 10),
      clue: pt(23, 15),
    },
  );
}

// ================================================================== route A 7–12, 19, crown
export function penroseAscent() {
  const [w, h] = [24, 20];
  const props = [[cx(w), 1, Nx.CHAIN_WALL]];
  for (let k = 0; k < 5; k++) props.push([4 + k * 4, 5, Nx.PENROSE]);
  const L = standard(w, h, 907, Nx.STARFIELD, { props });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 16), from_archive: pt(cx(w), 16), from_matrix: pt(cx(w), 3) },
    {
      dials: [0, 1, 2, 3, 4].map((k) => pt(4 + k * 4, 6)),
      stele: pt(3, 12),
      gate: pt(cx(w), 1),
      foes: [pt(6, 10), pt(18, 12)],
    },
  );
}
export function memoryMatrixVault() {
  const [w, h] = [26, 20];
  const L = standard(w, h, 908, Nx.FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [13, 7, Nx.SQUARE],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 16), from_penrose: pt(cx(w), 16), from_architect: pt(cx(w), 3) },
    {
      dials: [pt(13, 9), pt(10, 9), pt(16, 9)],
      square: pt(13, 8),
      gate: pt(cx(w), 1),
      inquisitor: pt(13, 12),
      confront: { x: 9, y: 13, w: 8, h: 2 },
      after: { x: 1, y: 2, w: 24, h: 16 },
    },
  );
}
export function architectBastion() {
  const [w, h] = [30, 20];
  const L = standard(w, h, 909, Nx.GEAR_FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [4, 5, Nx.GEAR_WALL],
      [25, 5, Nx.GEAR_WALL],
      [4, 14, Nx.GEAR_WALL],
      [25, 14, Nx.GEAR_WALL],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 16), from_matrix: pt(cx(w), 16), from_chime: pt(cx(w), 3) },
    {
      architect: pt(cx(w), 7),
      confront: { x: 11, y: 10, w: 8, h: 3 },
      gate: pt(cx(w), 1),
    },
  );
}
export function brokenChimeChoir() {
  const [w, h] = [26, 18];
  const L = standard(w, h, 910, Nx.CRYSTAL_FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [7, 5, Nx.CHIME],
      [11, 5, Nx.CHIME],
      [15, 5, Nx.CHIME],
      [19, 5, Nx.CHIME],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 14), from_architect: pt(cx(w), 14), from_astrolabe: pt(cx(w), 3) },
    {
      dials: [pt(11, 6), pt(15, 6), pt(19, 6)],
      book: pt(4, 9),
      gate: pt(cx(w), 1),
      lyra: pt(6, 12),
      neris: pt(9, 12),
      na: pt(17, 12),
      aldric: pt(20, 12),
    },
  );
}
export function astrolabeNave() {
  const [w, h] = [28, 20];
  const L = standard(w, h, 911, Nx.STARFIELD, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [14, 8, Nx.ASTROLABE],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 16), from_chime: pt(cx(w), 16), from_unwritten: pt(cx(w), 3) },
    {
      dial: pt(14, 10),
      gate: pt(cx(w), 1),
      secret: pt(22, 14),
      foes: [pt(7, 6), pt(21, 6)],
    },
  );
}
export function sanctumOfTheUnwritten() {
  const [w, h] = [24, 18];
  const L = hall(w, h, 912, Nx.GOLD_FLOOR, {
    doors: [
      [cx(w), h - 1],
      [cx(w), 0],
      [w - 1, 9],
    ],
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [w - 2, 9, Nx.GEAR_WALL],
      [12, 6, Nx.PLINTH],
      [5, 5, Nx.CHAIR],
    ],
  });
  return out(
    w,
    h,
    L,
    {
      default: pt(cx(w), 14),
      from_astrolabe: pt(cx(w), 14),
      from_throne: pt(cx(w), 3),
      from_first: pt(19, 9),
    },
    {
      dials: [pt(9, 8), pt(12, 8), pt(15, 8)],
      plinth: pt(12, 6),
      gate: pt(cx(w), 1),
      sideGate: pt(w - 2, 9),
      fb: { x: 9, y: 11, w: 6, h: 3 },
    },
  );
}
export function hallOfTheSixfoldThrone() {
  const [w, h] = [30, 20];
  const L = standard(w, h, 913, Nx.GOLD_FLOOR, {
    props: [
      [cx(w), 1, Nx.CHAIN_WALL],
      [cx(w), 4, Nx.THRONE],
      [cx(w) + 2, 4, Nx.CHAIR],
      [5, 6, Nx.SOCKET],
      [24, 6, Nx.SOCKET],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 16), from_unwritten: pt(cx(w), 16), from_crown: pt(cx(w), 3) },
    {
      boss: pt(cx(w), 7),
      confront: { x: 11, y: 10, w: 8, h: 3 },
      gate: pt(cx(w), 1),
    },
  );
}
export function crownOfEternity() {
  const [w, h] = [26, 18];
  const L = hall(w, h, 914, Nx.GOLD_FLOOR, {
    doors: [[cx(w), h - 1]],
    props: [
      [cx(w), 4, Nx.CLOCK],
      [7, 8, Nx.PLINTH],
      [13, 8, Nx.PLINTH_LIT],
      [19, 8, Nx.PLINTH],
      [22, 4, Nx.CHAIR],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(cx(w), 14), from_throne: pt(cx(w), 14) },
    {
      pedestals: [pt(7, 9), pt(13, 9), pt(19, 9)],
      gateZone: { x: 9, y: 10, w: 8, h: 2 },
      fb: { x: 9, y: 5, w: 8, h: 2 },
    },
  );
}

// ================================================================== route B 13–18
export function divergenceCrossroad() {
  const [w, h] = [26, 20];
  const L = hall(w, h, 915, Nx.BRANCH, {
    doors: [
      [0, 10],
      [w - 1, 10],
    ],
    alt: Nx.STARFIELD,
    props: [
      [w - 2, 10, Nx.STORM],
      [13, 5, Nx.TREE],
      [6, 14, Nx.TREE],
      [20, 14, Nx.TREE],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(3, 10), from_archive: pt(3, 10), from_vale: pt(22, 10) },
    {
      chronos: pt(13, 8),
      gate: pt(w - 2, 10),
    },
  );
}
/** A lieutenant's arena: west entrance, east exit sealed until the lieutenant falls. */
function arena(seed, floor, props) {
  const [w, h] = [26, 18];
  const L = hall(w, h, seed, floor, {
    doors: [
      [0, 9],
      [w - 1, 9],
    ],
    props: [[w - 2, 9, Nx.STORM], ...props],
  });
  return out(
    w,
    h,
    L,
    { default: pt(3, 9), from_prev: pt(3, 9), from_next: pt(22, 9) },
    {
      boss: pt(14, 9),
      confront: { x: 8, y: 7, w: 3, h: 5 },
      gate: pt(w - 2, 9),
      secret: pt(20, 4),
    },
  );
}
export const valeOfTwistedBanners = () =>
  arena(916, Nx.BRANCH, [
    [6, 4, Nx.TREE],
    [20, 14, Nx.TREE],
  ]);
export const ironTribunalRuins = () =>
  arena(917, Nx.FLOOR, [
    [6, 4, Nx.SCALES],
    [20, 14, Nx.STELE],
  ]);
export const drownedScriptorium = () =>
  arena(918, Nx.MIRROR_FLOOR, [
    [6, 4, Nx.LECTERN],
    [20, 14, Nx.LECTERN],
  ]);
export const hallOfBrokenMirrors = () =>
  arena(919, Nx.MIRROR_FLOOR, [
    [6, 4, Nx.BROKEN_MIRROR],
    [20, 14, Nx.BROKEN_MIRROR],
  ]);
export function throneOfInfiniteBranches() {
  const [w, h] = [30, 20];
  const L = hall(w, h, 920, Nx.BRANCH, {
    doors: [[0, 10]],
    props: [
      [24, 10, Nx.THRONE],
      [26, 6, Nx.TREE],
      [26, 14, Nx.TREE],
      [20, 4, Nx.STORM],
      [20, 16, Nx.STORM],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(3, 10), from_mirrors: pt(3, 10) },
    {
      boss: pt(20, 10),
      confront: { x: 12, y: 8, w: 3, h: 5 },
    },
  );
}

// ================================================================== hidden A, B, C
export function hiddenCryptOfVows() {
  const [w, h] = [18, 14];
  const L = hall(w, h, 921, Nx.FLOOR, {
    doors: [[w - 1, 7]],
    props: [
      [4, 4, Nx.STELE],
      [7, 4, Nx.STELE],
      [10, 4, Nx.STELE],
      [13, 4, Nx.STELE],
      [9, 10, Nx.PLINTH],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(14, 7), from_creeds: pt(14, 7) },
    {
      dials: [pt(4, 5), pt(7, 5), pt(10, 5), pt(13, 5)],
      tablet: pt(9, 9),
    },
  );
}
export function hiddenQuantumVault() {
  const [w, h] = [16, 14];
  const L = hall(w, h, 922, Nx.GEAR_FLOOR, {
    doors: [[w - 1, 7]],
    props: [
      [4, 4, Nx.QGEAR],
      [8, 4, Nx.QGEAR],
      [12, 4, Nx.QGEAR],
      [3, 10, Nx.LECTERN],
    ],
  });
  return out(
    w,
    h,
    L,
    { default: pt(12, 7), from_archive: pt(12, 7) },
    {
      dials: [pt(4, 5), pt(8, 5), pt(12, 5)],
      drawing: pt(3, 9),
    },
  );
}
/** Eight pillars on a ring around Thiên Nguyên's statue, numbered clockwise from the north. */
export const OCTAGON = [
  [11, 3],
  [15, 4],
  [17, 8],
  [15, 12],
  [11, 13],
  [7, 12],
  [5, 8],
  [7, 4],
];
export const OCTAGON_LIT = [3, 6, 7, 8];
export function hiddenSanctumOfTheFirst() {
  const [w, h] = [22, 18];
  const props = [
    [11, 8, Nx.STATUE_TN],
    ...OCTAGON.map(([x, y], k) => [
      x,
      y,
      OCTAGON_LIT.includes(k + 1) ? Nx.PILLAR_ON : Nx.PILLAR_OFF,
    ]),
  ];
  const L = hall(w, h, 923, Nx.STARFIELD, { doors: [[0, 9]], props });
  return out(
    w,
    h,
    L,
    { default: pt(3, 9), from_unwritten: pt(3, 9) },
    {
      pillars: OCTAGON.map(([x, y]) => pt(x, y)),
      plaque: pt(3, 6),
      core: pt(11, 15),
      confront: { x: 9, y: 14, w: 5, h: 2 },
    },
  );
}

export const CH9_MAPS = [
  ['map_ch9_apex_nexus', apexNexus],
  ['map_ch9_threshold_of_epochs', thresholdOfEpochs],
  ['map_ch9_prism_atrium', prismAtrium],
  ['map_ch9_hall_of_three_creeds', hallOfThreeCreeds],
  ['map_ch9_escapement_gallery', escapementGallery],
  ['map_ch9_palimpsest_archive', palimpsestArchive],
  ['map_ch9_penrose_ascent', penroseAscent],
  ['map_ch9_memory_matrix_vault', memoryMatrixVault],
  ['map_ch9_architect_bastion', architectBastion],
  ['map_ch9_broken_chime_choir', brokenChimeChoir],
  ['map_ch9_astrolabe_nave', astrolabeNave],
  ['map_ch9_sanctum_of_the_unwritten', sanctumOfTheUnwritten],
  ['map_ch9_hall_of_the_sixfold_throne', hallOfTheSixfoldThrone],
  ['map_ch9_crown_of_eternity', crownOfEternity],
  ['map_ch9_divergence_crossroad', divergenceCrossroad],
  ['map_ch9_vale_of_twisted_banners', valeOfTwistedBanners],
  ['map_ch9_iron_tribunal_ruins', ironTribunalRuins],
  ['map_ch9_drowned_scriptorium', drownedScriptorium],
  ['map_ch9_hall_of_broken_mirrors', hallOfBrokenMirrors],
  ['map_ch9_throne_of_infinite_branches', throneOfInfiniteBranches],
  ['map_ch9_hidden_crypt_of_vows', hiddenCryptOfVows],
  ['map_ch9_hidden_quantum_vault', hiddenQuantumVault],
  ['map_ch9_hidden_sanctum_of_the_first', hiddenSanctumOfTheFirst],
].map(([id, build]) => ({ id, tileset: 'nexus', build }));
