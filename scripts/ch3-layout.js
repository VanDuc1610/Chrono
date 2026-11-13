/**
 * Chapter 3 "The Kingdom of Forgotten Souls" map layouts (docs/story/CHAPTER_03_DESIGN.md §3, §12),
 * shared by scripts/generate-ch1-maps.js and scripts/preview-ch1-maps.js (`ch3` argument).
 * Values are tile indices of each map's tileset (GID = index + 1); -1 = empty.
 * Memory props reuse approved tiles (STAND-IN): memory crystals are crystals, tombs are steles,
 * the music box and records are reliquaries.
 */
import { D, S } from './ch1-layout.js';
import { Wd } from './wilds-layout.js';

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const fill = (g, x0, y0, x1, y1, v) => {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = v;
};

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
const door = (walls, ground, x, y) => {
  walls[y][x] = -1;
  ground[y][x] = D.ENGRAVED;
};

// ---------------------------------------------------------------- 1. Sepulcher gate (wilds)
export const SEPULCHER_GATE = [
  { x: 23, y: 8 },
  { x: 23, y: 9 },
];
export function sepulcherGateLayout() {
  const W = 24;
  const H = 18;
  const ground = grid(W, H, Wd.LOAM);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 71);
      if (r < 16) ground[y][x] = Wd.MIST;
      else if (r < 26) ground[y][x] = Wd.MOSS;
    }
  fill(walls, 0, 0, W - 1, 1, Wd.CLIFF);
  fill(walls, 0, H - 1, W - 1, H - 1, Wd.CLIFF);
  fill(walls, 0, 0, 0, H - 1, Wd.CLIFF);
  fill(walls, W - 1, 0, W - 1, H - 1, Wd.CLIFF);
  for (let x = 1; x < W - 1; x++) for (const y of [8, 9]) ground[y][x] = Wd.FLAGSTONE;
  walls[8][0] = walls[9][0] = Wd.GATE; // the Threshold behind Peter
  for (const t of SEPULCHER_GATE) walls[t.y][t.x] = Wd.GATE; // the sepulcher gate, sealed
  walls[7][20] = Wd.MONOLITH; // the crystal mechanism
  for (const [x, y] of [
    [10, 4],
    [11, 4],
    [10, 3],
  ])
    walls[y][x] = Wd.ASH_CRYSTALS; // leaking memory crystals
  for (const [x, y] of [
    [4, 4],
    [16, 3],
    [5, 13],
    [12, 14],
    [18, 13],
    [20, 4],
  ])
    walls[y][x] = Wd.ERASED_TREE;
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 2, y: 9 }, from_ch2: { x: 2, y: 9 }, from_necropolis: { x: 21, y: 9 } },
    exits: { to_necropolis: { x: 23, y: 8, w: 1, h: 2 } },
    points: {
      elder_echo: { x: 6, y: 8 },
      crystal: { x: 10, y: 4 },
      mechanism: { x: 20, y: 7 },
      wraith_a: { x: 9, y: 12 },
      wraith_b: { x: 16, y: 5 },
    },
  };
}

// ---------------------------------------------------------------- 2. Silent necropolis (dungeon)
export const HALL_GATE = [
  { x: 26, y: 8 },
  { x: 26, y: 9 },
  { x: 26, y: 10 },
];
export function necropolisLayout() {
  const W = 28;
  const H = 18;
  const { ground, walls } = room(W, H, 73);
  // A field of small graves.
  for (let y = 4; y <= 11; y += 3)
    for (let x = 4; x <= 20; x += 4) if (hash(x, y, 5) < 70) walls[y][x] = D.STELE;
  // The five carved tombs along the south wall.
  for (const x of [4, 8, 16, 20, 23]) walls[15][x] = D.STELE;
  walls[3][4] = D.RELIQUARY; // the cracked urn
  walls[3][8] = D.ALTAR; // the caretaker's desk (tax receipt)
  walls[2][14] = D.STELE; // the regions stele
  ground[14][2] = D.ENGRAVED; // ochre pigment
  ground[14][26] = D.ENGRAVED; // portrait piece 1
  fill(walls, 26, 2, 26, 16, D.WALL_FACE);
  for (const t of HALL_GATE) walls[t.y][t.x] = D.GATE;
  for (const y of [8, 9, 10]) door(walls, ground, 27, y);
  for (const y of [8, 9, 10]) door(walls, ground, 0, y);
  door(walls, ground, 12, 17); // the hidden way down to the vault
  walls[16][12] = D.FRACTURE; // sealed until the key turns
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 9 },
      from_gate: { x: 2, y: 9 },
      from_echoes: { x: 25, y: 9 },
      from_vault: { x: 12, y: 15 },
      revive: { x: 2, y: 9 },
    },
    exits: {
      to_gate: { x: 0, y: 8, w: 1, h: 3 },
      to_echoes: { x: 27, y: 8, w: 1, h: 3 },
      to_vault: { x: 12, y: 17, w: 1, h: 1 },
    },
    points: {
      neris: { x: 23, y: 4 },
      urn: { x: 4, y: 3 },
      receipt: { x: 8, y: 3 },
      regions: { x: 14, y: 2 },
      tomb_owl: { x: 4, y: 15 },
      tomb_willow_ii: { x: 8, y: 15 },
      tomb_willow: { x: 16, y: 15 },
      tomb_almond: { x: 20, y: 15 },
      tomb_turtle: { x: 23, y: 15 },
      hall_gate: { x: 26, y: 9 },
      vault_seal: { x: 12, y: 16 },
      pigment: { x: 2, y: 14 },
      portrait: { x: 26, y: 14 },
      wraith_a: { x: 21, y: 5 },
      wraith_b: { x: 24, y: 6 },
      wraith_c: { x: 12, y: 8 },
    },
  };
}

// ---------------------------------------------------------------- 3. Hall of echoes (dungeon)
export const VAULT_STAIRS_SEAL = [
  { x: 28, y: 9 },
  { x: 28, y: 10 },
  { x: 28, y: 11 },
];
export const RESONANCE_PILLARS = [
  { x: 12, y: 9 },
  { x: 17, y: 9 },
];
export function hallOfEchoesLayout() {
  const W = 30;
  const H = 20;
  const { ground, walls } = room(W, H, 75);
  for (const x of [4, 8, 21, 25]) for (const y of [4, 7, 12, 15]) walls[y][x] = D.PILLAR;
  for (const p of RESONANCE_PILLARS) {
    walls[p.y][p.x] = D.CRYSTAL;
    fill(ground, p.x - 1, p.y - 1, p.x + 1, p.y + 1, D.ENGRAVED);
    walls[p.y][p.x] = D.CRYSTAL;
  }
  walls[3][15] = D.RELIQUARY; // the acoustics manual shelf
  for (const t of VAULT_STAIRS_SEAL) walls[t.y][t.x] = D.FRACTURE;
  for (const y of [9, 10, 11]) door(walls, ground, W - 1, y);
  for (const y of [9, 10, 11]) door(walls, ground, 0, y);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 10 },
      from_necropolis: { x: 2, y: 10 },
      from_vaults: { x: 27, y: 10 },
      revive: { x: 2, y: 10 },
    },
    exits: { to_necropolis: { x: 0, y: 9, w: 1, h: 3 }, to_vaults: { x: 29, y: 9, w: 1, h: 3 } },
    points: {
      manual: { x: 15, y: 3 },
      wraith_a: { x: 6, y: 14 },
      wraith_b: { x: 23, y: 5 },
      wraith_c: { x: 15, y: 15 },
      archivist_a: { x: 6, y: 5 },
      archivist_b: { x: 23, y: 14 },
    },
  };
}

// ---------------------------------------------------------------- 4. Memory vaults (sunken)
export const ABYSS = { x0: 8, x1: 17, y0: 2, y1: 16, path: 9 };
export function memoryVaultsLayout() {
  const W = 26;
  const H = 18;
  const { ground, walls } = room(W, H, 77);
  for (let y = ABYSS.y0; y <= ABYSS.y1; y++)
    for (let x = ABYSS.x0; x <= ABYSS.x1; x++) ground[y][x] = S.VOID;
  for (const [x, y] of [
    [2, 2],
    [3, 16],
    [21, 2],
    [24, 15],
  ])
    walls[y][x] = S.CORAL; // crystal growths (stand-in)
  for (const y of [6, 9, 12]) walls[y][4] = S.BELL; // three bells on the west bank
  walls[9][19] = S.BELL; // a bell on the east bank, for the way back
  ground[3][2] = D.ENGRAVED; // miner's hymn
  walls[15][6] = D.RELIQUARY; // the ore cart with the chart
  walls[3][22] = D.CRYSTAL; // lullaby crystal
  walls[15][23] = S.CORAL; // ember vein
  walls[15][20] = D.ALTAR; // the cold forge
  ground[3][19] = D.ENGRAVED; // portrait piece 2
  for (const y of [8, 9, 10]) door(walls, ground, W - 1, y);
  for (const y of [8, 9, 10]) door(walls, ground, 0, y);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 2, y: 9 },
      from_echoes: { x: 2, y: 9 },
      from_archives: { x: 23, y: 9 },
      abyss_edge: { x: 6, y: 9 },
      abyss_edge_east: { x: 19, y: 11 },
      revive: { x: 2, y: 9 },
    },
    exits: { to_echoes: { x: 0, y: 8, w: 1, h: 3 }, to_archives: { x: 25, y: 8, w: 1, h: 3 } },
    points: {
      bell_copper: { x: 4, y: 9 },
      bell_iron: { x: 4, y: 6 },
      bell_silver: { x: 4, y: 12 },
      bell_east: { x: 19, y: 9 },
      hymn: { x: 2, y: 3 },
      chart: { x: 6, y: 15 },
      lullaby: { x: 22, y: 3 },
      ember: { x: 23, y: 15 },
      forge: { x: 20, y: 15 },
      portrait: { x: 19, y: 3 },
      keeper: { x: 21, y: 9 },
    },
  };
}

// ---------------------------------------------------------------- 5. Great archive (dungeon)
export function greatArchiveLayout() {
  const W = 30;
  const H = 20;
  const { ground, walls } = room(W, H, 79);
  for (const y of [5, 11, 14])
    for (let x = 3; x <= 26; x++) if (x % 7 !== 1 && !(x >= 13 && x <= 17)) walls[y][x] = D.STELE;
  walls[4][15] = D.ALTAR; // the censorship console
  walls[8][10] = D.RELIQUARY; // the blacklist
  walls[8][20] = D.RELIQUARY; // the court timeline
  ground[16][4] = D.ENGRAVED; // lapis pigment
  ground[16][26] = D.ENGRAVED; // portrait piece 3
  for (const x of [14, 15, 16]) {
    door(walls, ground, x, 0);
    door(walls, ground, x, 1);
  }
  door(walls, ground, 15, H - 1);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 15, y: 17 },
      from_vaults: { x: 15, y: 17 },
      from_mausoleum: { x: 15, y: 3 },
      revive: { x: 15, y: 17 },
    },
    exits: { to_vaults: { x: 15, y: 19, w: 1, h: 1 }, to_mausoleum: { x: 14, y: 0, w: 3, h: 2 } },
    points: {
      console: { x: 15, y: 4 },
      blacklist: { x: 10, y: 8 },
      timeline: { x: 20, y: 8 },
      neris: { x: 12, y: 16 },
      librarian: { x: 6, y: 7 },
      knight: { x: 24, y: 7 },
      pigment: { x: 4, y: 16 },
      portrait: { x: 26, y: 16 },
      archivist_a: { x: 8, y: 13 },
      archivist_b: { x: 22, y: 13 },
      archivist_c: { x: 15, y: 9 },
      eater_a: { x: 6, y: 3 },
      eater_b: { x: 24, y: 3 },
    },
  };
}

// ---------------------------------------------------------------- 6. Royal mausoleum (dungeon)
export const SANCTUM_DOOR = [{ x: 13, y: 2 }];
export function royalMausoleumLayout() {
  const W = 26;
  const H = 18;
  const { ground, walls } = room(W, H, 81);
  fill(ground, 10, 4, 16, 10, D.ENGRAVED);
  for (const [x, y] of [
    [9, 4],
    [17, 4],
    [9, 10],
    [17, 10],
  ])
    walls[y][x] = D.PILLAR;
  walls[8][6] = D.ALTAR; // the queen's ribbon shrine
  walls[8][20] = D.RELIQUARY; // the dispatch log
  walls[13][22] = D.STELE; // the queen's portrait (stand-in)
  walls[13][4] = D.RELIQUARY; // the court painter's notebook
  ground[15][9] = D.ENGRAVED; // sulphur-red pigment
  door(walls, ground, 13, 0);
  door(walls, ground, 13, 1);
  walls[2][13] = D.GATE;
  door(walls, ground, 13, H - 1);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 13, y: 15 },
      from_archives: { x: 13, y: 15 },
      from_sanctum: { x: 13, y: 3 },
      revive: { x: 13, y: 15 },
    },
    exits: { to_archives: { x: 13, y: 17, w: 1, h: 1 }, to_sanctum: { x: 13, y: 0, w: 1, h: 2 } },
    points: {
      king: { x: 13, y: 6 },
      shrine: { x: 6, y: 8 },
      dispatch: { x: 20, y: 8 },
      canvas: { x: 22, y: 13 },
      painter: { x: 4, y: 13 },
      pigment: { x: 9, y: 15 },
      door: { x: 13, y: 2 },
      eater_a: { x: 5, y: 4 },
      eater_b: { x: 21, y: 4 },
    },
  };
}

// ---------------------------------------------------------------- 7. Choir sanctum (sunken)
export function choirSanctumLayout() {
  const W = 22;
  const H = 16;
  const { ground, walls } = room(W, H, 83);
  for (let y = 2; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const d = Math.hypot(x - 11, (y - 8) * 1.15);
      if (d > 9) walls[y][x] = D.WALL_FACE;
      else if (Math.abs(d - 5) < 0.55) ground[y][x] = D.ENGRAVED;
      else if (d > 7.5) ground[y][x] = S.VOID;
    }
  for (const [x, y] of [
    [6, 5],
    [16, 5],
    [11, 12],
  ])
    walls[y][x] = D.CRYSTAL; // the three memory cores
  walls[3][11] = S.SEAL;
  for (const y of [13, 14, 15]) door(walls, ground, 11, y);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: {
      default: { x: 11, y: 13 },
      from_mausoleum: { x: 11, y: 13 },
      revive: { x: 11, y: 13 },
    },
    exits: { to_mausoleum: { x: 11, y: 15, w: 1, h: 1 } },
    points: { choir: { x: 11, y: 7 }, seal: { x: 11, y: 4 } },
  };
}

// ---------------------------------------------------------------- 8. Forgotten vault (dungeon, hidden)
export function forgottenVaultLayout() {
  const W = 20;
  const H = 14;
  const { ground, walls } = room(W, H, 85);
  fill(ground, 8, 5, 12, 7, D.ENGRAVED);
  walls[5][10] = D.RELIQUARY; // the music box
  walls[3][5] = D.STELE; // the unwritten monument
  for (const [x, y] of [
    [3, 9],
    [16, 9],
    [16, 3],
  ])
    walls[y][x] = D.PILLAR;
  door(walls, ground, 10, H - 1);
  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 10, y: 11 }, from_necropolis: { x: 10, y: 11 } },
    exits: { to_necropolis: { x: 10, y: 13, w: 1, h: 1 } },
    points: { box: { x: 10, y: 5 }, monument: { x: 5, y: 3 } },
  };
}

export const CH3_MAPS = [
  { id: 'map_ch3_sepulcher_gate', tileset: 'wilds', build: sepulcherGateLayout },
  { id: 'map_ch3_silent_necropolis', tileset: 'dungeon', build: necropolisLayout },
  { id: 'map_ch3_hall_of_echoes', tileset: 'dungeon', build: hallOfEchoesLayout },
  { id: 'map_ch3_memory_vaults', tileset: 'sunken', build: memoryVaultsLayout },
  { id: 'map_ch3_great_archive', tileset: 'dungeon', build: greatArchiveLayout },
  { id: 'map_ch3_royal_mausoleum', tileset: 'dungeon', build: royalMausoleumLayout },
  { id: 'map_ch3_choir_sanctum', tileset: 'sunken', build: choirSanctumLayout },
  { id: 'map_ch3_forgotten_vault', tileset: 'dungeon', build: forgottenVaultLayout },
];
