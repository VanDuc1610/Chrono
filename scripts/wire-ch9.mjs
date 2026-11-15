/**
 * Wires Chapter 9 (CHAPTER_09_DESIGN.md with §20-§22) into maps.json: 23 maps — six shared, the
 * route "Chiếc Ghế Trống" (seven maps and the Crown), the route "Kẻ Giật Dây" (six maps), three
 * hidden ones — with dial puzzles, foes, lieutenants, bosses, gates and triggers. Content comes
 * from scripts/content-ch9.mjs. Idempotent.
 *
 * Usage: node scripts/wire-ch9.mjs
 */
import fs from 'fs';
import * as L from './ch9-layout.js';

const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const Nx = L.Nx;

const TS = {
  tileset: {
    name: 'nexus_tileset',
    key: 'nexus_tileset',
    path: 'assets/tilesets/nexus_tileset.png',
  },
  collision: { fromGid: 4, toGid: 48 },
};
const poi = (id, tile, prompt, dialogueId, extra = {}) => ({
  id,
  tile,
  radius: 44,
  prompt,
  dialogueId,
  ...extra,
});
const npc = (id, texture, tile, name, dialogueId, extra = {}) => ({
  id,
  texture,
  anim: `${texture}_idle`,
  tile,
  name,
  prompt: `[E] Nói chuyện với ${name}`,
  radius: 44,
  dialogueId,
  ...extra,
});
const roamer = (id, enemyId, tile, extra = {}) => ({
  id,
  enemyId,
  texture: enemyId,
  anim: `${enemyId}_idle`,
  tile,
  ...extra,
});
const exit = (id, area, toMap, toSpawn, extra = {}) => ({ id, area, toMap, toSpawn, ...extra });
const at = (x, y) => ({ x, y, w: 1, h: 1 });
const dial = (id, tile, prompt, values, extra = {}) => ({
  id,
  tile,
  radius: 40,
  prompt,
  values,
  ...extra,
});
const vals = (pairs) => pairs.map(([key, label]) => ({ key, label }));
const arrive = (id, dialogueId, extra = {}) => ({
  id,
  on: 'arrive',
  onceFlag: `${id}_seen`,
  delayMs: 400,
  dialogueId,
  ...extra,
});
const zone = (id, area, dialogueId, extra = {}) => ({
  id,
  on: 'zone',
  area,
  onceFlag: `${id}_seen`,
  dialogueId,
  ...extra,
});
const swap = (flag, tiles, index, layer = 'walls') => ({
  when: { flag },
  layer,
  tiles: Array.isArray(tiles) ? tiles : [tiles],
  index,
});
const pickup = (id, tile, prompt, dialogueId, onceFlag, extra = {}) =>
  poi(id, tile, prompt, dialogueId, { visibleWhen: { unlessFlag: onceFlag }, ...extra });

const encounter = (id, enemyId, tile, defeatedFlag, victoryDialogueId, extra = {}) => ({
  id,
  enemyId,
  texture: enemyId,
  anim: `${enemyId}_idle`,
  tile,
  defeatedFlag,
  hitbox: 30,
  victoryDialogueId,
  ...extra,
});

const byId = Object.fromEntries(L.CH9_MAPS.map((m) => [m.id, m]));
const M = {};
function add(id, name, extra) {
  const layout = byId[id].build();
  M[id] = {
    id,
    name,
    chapter: 9,
    tilemap: { key: id, path: `assets/maps/${id}.json` },
    ...TS,
    layers: { ground: 'Ground', walls: 'Walls' },
    bgm: 'ambient',
    spawns: layout.spawns,
    revive: layout.spawns.revive ?? layout.spawns.default,
    npcs: [],
    interactables: [],
    ambient: { color: '#3a1a6a', alpha: 0.12 },
    ...extra(layout.points, layout, id),
  };
}
const NONE = ['none', '(trống)'];
const num = (from, to) =>
  [...Array(to - from + 1).keys()].map((i) => [`n${from + i}`, String(from + i)]);
/** A dial puzzle: dials, a check that opens `right`, a plate POI that says wrong / done. */
const puzzle = (
  prefix,
  tiles,
  labels,
  values,
  answer,
  solvedFlag,
  right,
  plateTile,
  plateIntro,
) => ({
  dials: tiles.map((t, k) =>
    dial(`${prefix}_${k + 1}`, t, `[E] ${labels[k]}`, vals(values[k] ?? values[0])),
  ),
  dialChecks: [
    {
      ifFlags: answer.map((v, k) => `${prefix}_${k + 1}_${v}`),
      unlessFlag: solvedFlag,
      dialogueId: right,
    },
  ],
  plate: poi(`poi_${prefix}`, plateTile, '[E] Đọc lời dẫn', right.replace(/_right$/, '_wrong'), {
    dialogueRules: [
      { ifFlag: solvedFlag, dialogueId: 'ch9_puzzle_done' },
      ...tiles.map((_, k) => ({ ifFlag: `${prefix}_${k + 1}_none`, dialogueId: plateIntro })),
    ],
  }),
});
const nextGate = (flag, tile, idx = Nx.RUNE) => swap(flag, tile, idx);
const locked = (flag) => ({ requiresFlag: flag, lockedDialogueId: 'ch9_exit_locked' });

// ---------------------------------------------------------------- 1. Apex (C01)
const W = [NONE, ...[3, 5, 6, 8, 9, 11, 12].map((n) => [`n${n}`, `${n} khắc`])];
{
  const z = (p) =>
    puzzle(
      'ch9_c01',
      p.dials,
      ['Đĩa Quá Khứ', 'Đĩa Hiện Tại', 'Đĩa Tương Lai'],
      [W],
      ['n9', 'n6', 'n12'],
      'solved_tri_balance',
      'ch9_c01_right',
      p.chronos,
      'ch9_c01_intro',
    );
  add('map_ch9_apex_nexus', 'Đỉnh Tháp Tâm Điểm', (p) => {
    const q = z(p);
    return {
      interactables: [
        poi('poi_ch9_c01_clue', { x: 12, y: 7 }, '[E] Đọc bia cân', 'ch9_c01_clue'),
        q.plate,
      ],
      dials: q.dials,
      dialChecks: q.dialChecks,
      tileSwaps: [nextGate('solved_tri_balance', p.gate)],
      exits: [
        exit(
          'apex_to_epochs',
          at(12, 0),
          'map_ch9_threshold_of_epochs',
          'from_apex',
          locked('solved_tri_balance'),
        ),
      ],
      triggers: [arrive('ch9_t_apex', 'ch9_apex_arrival_1')],
    };
  });
}
// ---------------------------------------------------------------- 2. Epochs (clue 1)
add('map_ch9_threshold_of_epochs', 'Ngưỡng Cửa Các Kỷ Nguyên', (p) => ({
  interactables: [
    pickup(
      'poi_ch9_clue1',
      p.clue,
      '[E] Xem góc tường nứt',
      'ch9_clue_1_pickup',
      'took_clue_ch9_interval_rift',
    ),
  ],
  roamers: p.foes.map((t, k) => roamer(`ch9_sentinel_e${k}`, 'enemy_nexus_sentinel', t)),
  exits: [
    exit('epochs_to_apex', at(13, 17), 'map_ch9_apex_nexus', 'from_epochs'),
    exit('epochs_to_prism', at(13, 0), 'map_ch9_prism_atrium', 'from_epochs'),
  ],
  triggers: [
    arrive('ch9_t_epochs', 'ch9_epochs_arrival'),
    zone('ch9_t_sentinel', { x: 9, y: 9, w: 8, h: 4 }, 'ch9_epochs_kuro_warn'),
  ],
}));
// ---------------------------------------------------------------- 3. Prism (C02, secret 1, clue 2)
const GEMS = vals([
  NONE,
  ['red', 'Tinh thể Đỏ'],
  ['blue', 'Tinh thể Lam'],
  ['green', 'Tinh thể Lục'],
]);
add('map_ch9_prism_atrium', 'Sảnh Lăng Kính Quang Phổ', (p) => {
  const q = puzzle(
    'ch9_c02',
    p.dials,
    ['Đỉnh Bắc', 'Đỉnh Đông Nam', 'Đỉnh Tây Nam'],
    [GEMS.map((v) => [v.key, v.label])],
    ['red', 'blue', 'green'],
    'solved_spectral_interference',
    'ch9_c02_right',
    p.plate,
    'ch9_c02_intro',
  );
  return {
    interactables: [
      poi('poi_ch9_c02_clue', { x: 12, y: 11 }, '[E] Đọc văn bia ba cổng', 'ch9_c02_clue'),
      q.plate,
      pickup(
        'poi_ch9_secret1',
        p.secret,
        '[E] Xem sau bức tượng',
        'ch9_secret_1_pickup',
        'took_world_secret_ch9_chronos_grief',
      ),
      pickup(
        'poi_ch9_clue2',
        p.clue,
        '[E] Xem trụ gương vỡ',
        'ch9_clue_2_pickup',
        'took_clue_ch9_ledger_divergence',
      ),
    ],
    dials: q.dials,
    dialChecks: q.dialChecks,
    tileSwaps: [nextGate('solved_spectral_interference', p.gate)],
    exits: [
      exit('prism_to_epochs', at(14, 19), 'map_ch9_threshold_of_epochs', 'from_prism'),
      exit(
        'prism_to_creeds',
        at(14, 0),
        'map_ch9_hall_of_three_creeds',
        'from_prism',
        locked('solved_spectral_interference'),
      ),
    ],
    triggers: [arrive('ch9_t_prism', 'ch9_prism_arrival')],
  };
});
// ---------------------------------------------------------------- 4. Creeds (C03, clue 3, FB-01, hidden A)
const BADGES = [NONE, ['truth', 'Sự Thật'], ['half', 'Nửa Thật'], ['lie', 'Dối Trá']];
add('map_ch9_hall_of_three_creeds', 'Đại Điện Ba Tuyên Ngôn', (p) => {
  const q = puzzle(
    'ch9_c03',
    p.dials,
    ['Bệ tượng Chronos', 'Bệ tượng Kuro', 'Bệ tượng Thiên Nguyên'],
    [BADGES],
    ['half', 'lie', 'truth'],
    'solved_tri_witness',
    'ch9_c03_right',
    p.stele,
    'ch9_c03_intro',
  );
  return {
    interactables: [
      poi('poi_ch9_c03_clues', { x: 13, y: 13 }, '[E] Nghe lời chứng', 'ch9_c03_clues'),
      q.plate,
      pickup(
        'poi_ch9_clue3',
        p.clue,
        '[E] Xem chân bệ tượng Kuro',
        'ch9_clue_3_pickup',
        'took_clue_ch9_seal_spark',
      ),
    ],
    dials: q.dials,
    dialChecks: q.dialChecks,
    tileSwaps: [
      nextGate('solved_tri_witness', p.gate),
      swap('solved_tri_witness', p.crypt, Nx.RUNE),
    ],
    exits: [
      exit('creeds_to_prism', at(13, 19), 'map_ch9_prism_atrium', 'from_creeds'),
      exit(
        'creeds_to_escapement',
        at(13, 0),
        'map_ch9_escapement_gallery',
        'from_creeds',
        locked('solved_tri_witness'),
      ),
      exit(
        'creeds_to_crypt',
        at(0, 10),
        'map_ch9_hidden_crypt_of_vows',
        'from_creeds',
        locked('solved_tri_witness'),
      ),
    ],
    triggers: [
      arrive('ch9_t_creeds', 'ch9_creeds_arrival'),
      zone('ch9_t_fb1', p.fb, 'ch9_fb_01_trigger'),
    ],
  };
});
// ---------------------------------------------------------------- 5. Escapement (C04, clue 4)
add('map_ch9_escapement_gallery', 'Hành Lang Bộ Hồi Thoát', (p) => {
  const q = puzzle(
    'ch9_c04',
    p.dials,
    ['Gia trọng A', 'Gia trọng B', 'Gia trọng C'],
    [num(1, 9)],
    ['n2', 'n8', 'n4'],
    'solved_escapement',
    'ch9_c04_right',
    { x: 12, y: 9 },
    'ch9_c04_intro',
  );
  return {
    interactables: [
      poi('poi_ch9_c04_scroll', p.scroll, '[E] Đọc cuộn giấy', 'ch9_c04_clue'),
      q.plate,
      pickup(
        'poi_ch9_clue4',
        p.clue,
        '[E] Xem mảnh tro tím',
        'ch9_clue_4_pickup',
        'took_clue_ch9_possible_mother',
      ),
    ],
    dials: q.dials,
    dialChecks: q.dialChecks,
    roamers: p.foes.map((t, k) => roamer(`ch9_specter_e${k}`, 'enemy_entropy_specter', t)),
    tileSwaps: [nextGate('solved_escapement', p.gate)],
    exits: [
      exit('escapement_to_creeds', at(12, 17), 'map_ch9_hall_of_three_creeds', 'from_escapement'),
      exit(
        'escapement_to_archive',
        at(12, 0),
        'map_ch9_palimpsest_archive',
        'from_escapement',
        locked('solved_escapement'),
      ),
    ],
    triggers: [arrive('ch9_t_escapement', 'ch9_escapement_arrival')],
  };
});
// ---------------------------------------------------------------- 6. Archive (C05, clue 5, the crossroad, hidden B)
const SOLV = [
  NONE,
  ['gold', 'Dung dịch Vàng Son'],
  ['ash', 'Dung dịch Tro Tàn'],
  ['violet', 'Dung dịch Tử Lam'],
];
add('map_ch9_palimpsest_archive', 'Thư Khố Da Thuộc Tẩy Xóa', (p) => {
  const q = puzzle(
    'ch9_c05',
    p.dials,
    ['Lượt tẩy 1', 'Lượt tẩy 2', 'Lượt tẩy 3'],
    [SOLV],
    ['gold', 'ash', 'violet'],
    'solved_creation_palimpsest',
    'ch9_c05_right',
    { x: 14, y: 12 },
    'ch9_c05_intro',
  );
  return {
    interactables: [
      poi('poi_ch9_c05_scroll', p.scroll, '[E] Đọc cuộn biên niên', 'ch9_c05_clue'),
      q.plate,
      pickup(
        'poi_ch9_clue5',
        p.clue,
        '[E] Xem kệ sách khuất',
        'ch9_clue_5_pickup',
        'took_clue_ch9_clock_stall',
      ),
      poi('poi_ch9_crossroad', { x: 14, y: 6 }, '[E] Nói chuyện với Kuro', 'ch9_kuro_crossroad', {
        visibleWhen: { flag: 'solved_creation_palimpsest', unlessFlag: 'ch9_route_chosen' },
      }),
    ],
    dials: q.dials,
    dialChecks: q.dialChecks,
    tileSwaps: [
      swap('ch9_route_empty_chair', p.northGate, Nx.RUNE),
      swap('ch9_route_puppet_master', p.eastGate, Nx.BRANCH),
      swap('settled_ivo_debt', p.vault, Nx.RUNE),
    ],
    exits: [
      exit('archive_to_escapement', at(14, 19), 'map_ch9_escapement_gallery', 'from_archive'),
      exit('archive_to_penrose', at(14, 0), 'map_ch9_penrose_ascent', 'from_archive', {
        requiresFlag: 'ch9_route_empty_chair',
        lockedDialogueId: 'ch9_route_locked',
      }),
      exit('archive_to_crossroad', at(27, 10), 'map_ch9_divergence_crossroad', 'from_archive', {
        requiresFlag: 'ch9_route_puppet_master',
        lockedDialogueId: 'ch9_route_locked',
      }),
      exit('archive_to_vault', at(0, 10), 'map_ch9_hidden_quantum_vault', 'from_archive', {
        requiresFlag: 'settled_ivo_debt',
        lockedDialogueId: 'ch9_exit_locked',
      }),
    ],
    triggers: [arrive('ch9_t_archive', 'ch9_archive_arrival')],
  };
});

// ---------------------------------------------------------------- route A
const STEPS = [
  [3, 4, 6],
  [4, 5, 7],
  [7, 8, 10],
  [11, 13, 15],
  [20, 21, 25],
];
add('map_ch9_penrose_ascent', 'Bậc Thang Penrose Vô Cực', (p) => ({
  interactables: [
    poi('poi_ch9_c06', p.stele, '[E] Đọc bia chân thang', 'ch9_c06_intro', {
      dialogueRules: [{ ifFlag: 'solved_penrose_steps', dialogueId: 'ch9_puzzle_done' }],
    }),
  ],
  dials: p.dials.map((t, k) =>
    dial(
      `ch9_c06_${k + 1}`,
      t,
      `[E] Bậc thứ ${k + 3}`,
      vals([NONE, ...STEPS[k].map((n) => [`n${n}`, String(n)])]),
    ),
  ),
  dialChecks: [
    {
      ifFlags: [3, 5, 8, 13, 21].map((n, k) => `ch9_c06_${k + 1}_n${n}`),
      unlessFlag: 'solved_penrose_steps',
      dialogueId: 'ch9_c06_right',
    },
  ],
  roamers: p.foes.map((t, k) => roamer(`ch9_jug_p${k}`, 'enemy_chronal_juggernaut', t)),
  tileSwaps: [
    nextGate('solved_penrose_steps', p.gate),
    ...p.dials.map((t, k) =>
      swap(`ch9_c06_${k + 1}_n${[3, 5, 8, 13, 21][k]}`, { x: t.x, y: t.y - 1 }, Nx.PLINTH_LIT),
    ),
  ],
  exits: [
    exit('penrose_to_archive', at(12, 19), 'map_ch9_palimpsest_archive', 'from_penrose'),
    exit(
      'penrose_to_matrix',
      at(12, 0),
      'map_ch9_memory_matrix_vault',
      'from_penrose',
      locked('solved_penrose_steps'),
    ),
  ],
  triggers: [arrive('ch9_t_penrose', 'ch9_penrose_arrival')],
}));
const STONES = [NONE, ['n2', 'Đá 2'], ['n4', 'Đá 4'], ['n5', 'Đá 5']];
add('map_ch9_memory_matrix_vault', 'Mật Thất Ma Phương Ký Ức', (p) => {
  const q = puzzle(
    'ch9_c07',
    p.dials,
    ['Ô Trung Tâm', 'Ô Tây Nam', 'Ô Đông Nam'],
    [STONES],
    ['n5', 'n4', 'n2'],
    'solved_memory_matrix',
    'ch9_c07_right',
    { x: 13, y: 10 },
    'ch9_c07_intro',
  );
  return {
    interactables: [q.plate],
    dials: q.dials.map((d) => ({ ...d, requiresFlag: 'defeated_nexus_inquisitor' })),
    dialChecks: q.dialChecks,
    roamers: [
      roamer('ch9_inquisitor', 'enemy_nexus_inquisitor', p.inquisitor, {
        defeatedFlag: 'defeated_nexus_inquisitor',
        respawn: false,
      }),
    ],
    tileSwaps: [nextGate('solved_memory_matrix', p.gate)],
    exits: [
      exit('matrix_to_penrose', at(13, 19), 'map_ch9_penrose_ascent', 'from_matrix'),
      exit(
        'matrix_to_architect',
        at(13, 0),
        'map_ch9_architect_bastion',
        'from_matrix',
        locked('solved_memory_matrix'),
      ),
    ],
    triggers: [
      arrive('ch9_t_matrix', 'ch9_matrix_arrival'),
      zone('ch9_t_inquisitor_down', p.after, 'ch9_inquisitor_defeat', {
        requiresFlag: 'defeated_nexus_inquisitor',
      }),
    ],
  };
});
add('map_ch9_architect_bastion', 'Thành Trì Kiến Trúc Sư', (p) => ({
  encounters: [
    encounter(
      'enc_ch9_architect',
      'boss_primeval_architect',
      p.architect,
      'defeated_primeval_architect',
      'ch9_architect_kuro_hold',
    ),
  ],
  tileSwaps: [nextGate('defeated_primeval_architect', p.gate)],
  exits: [
    exit('architect_to_matrix', at(15, 19), 'map_ch9_memory_matrix_vault', 'from_architect'),
    exit(
      'architect_to_chime',
      at(15, 0),
      'map_ch9_broken_chime_choir',
      'from_architect',
      locked('defeated_primeval_architect'),
    ),
  ],
  triggers: [
    zone('ch9_t_architect', p.confront, 'ch9_architect_arrival', {
      unlessFlag: 'defeated_primeval_architect',
    }),
  ],
}));
const TUNE = [
  ['n0', '+0'],
  ['n1', '+1'],
  ['n2', '+2'],
  ['n3', '+3'],
];
add('map_ch9_broken_chime_choir', 'Dàn Chuông Gãy Cánh', (p) => {
  const q = puzzle(
    'ch9_c08',
    p.dials,
    ['Chuông 2 (Rê)', 'Chuông 3 (Fa)', 'Chuông 4 (La)'],
    [TUNE],
    ['n2', 'n2', 'n3'],
    'solved_broken_chime',
    'ch9_c08_right',
    p.book,
    'ch9_c08_intro',
  );
  return {
    npcs: [
      npc('npc_ch9_lyra', 'npc_lyra', p.lyra, 'Lyra', 'ch9_companions_greet'),
      npc('npc_ch9_neris', 'npc_neris', p.neris, 'Neris', 'ch9_neris_greet'),
      {
        ...npc('npc_ch9_na', 'npc_forgotten_child', p.na, 'bé Na', 'ch9_coba_na_greet'),
        anim: 'npc_forgotten_child_flicker',
      },
      npc('npc_ch9_aldric', 'npc_aldric', p.aldric, 'Aldric', 'ch9_aldric_variant'),
    ],
    interactables: [q.plate],
    dials: q.dials,
    dialChecks: q.dialChecks,
    tileSwaps: [nextGate('solved_broken_chime', p.gate)],
    exits: [
      exit('chime_to_architect', at(13, 17), 'map_ch9_architect_bastion', 'from_chime'),
      exit(
        'chime_to_astrolabe',
        at(13, 0),
        'map_ch9_astrolabe_nave',
        'from_chime',
        locked('solved_broken_chime'),
      ),
    ],
    triggers: [arrive('ch9_t_chime', 'ch9_chime_arrival')],
  };
});
add('map_ch9_astrolabe_nave', 'Thánh Đường Thiên Cầu Vi Mô', (p) => ({
  interactables: [
    poi('poi_ch9_c09', { x: 14, y: 12 }, '[E] Đọc trục xoay', 'ch9_c09_intro', {
      dialogueRules: [{ ifFlag: 'solved_astrolabe', dialogueId: 'ch9_puzzle_done' }],
    }),
    pickup(
      'poi_ch9_secret2',
      p.secret,
      '[E] Xem hộc đá',
      'ch9_secret_2_pickup',
      'took_world_secret_ch9_the_empty_chair',
    ),
  ],
  dials: [dial('ch9_c09_days', p.dial, '[E] Vặn trục số ngày', vals([NONE, ...num(1, 12)]))],
  dialChecks: [
    { ifFlags: ['ch9_c09_days_n2'], unlessFlag: 'solved_astrolabe', dialogueId: 'ch9_c09_right' },
  ],
  roamers: p.foes.map((t, k) => roamer(`ch9_weaver_a${k}`, 'enemy_paradox_weaver', t)),
  tileSwaps: [nextGate('solved_astrolabe', p.gate)],
  exits: [
    exit('astrolabe_to_chime', at(14, 19), 'map_ch9_broken_chime_choir', 'from_astrolabe'),
    exit(
      'astrolabe_to_unwritten',
      at(14, 0),
      'map_ch9_sanctum_of_the_unwritten',
      'from_astrolabe',
      locked('solved_astrolabe'),
    ),
  ],
  triggers: [arrive('ch9_t_astrolabe', 'ch9_astrolabe_arrival')],
}));
const SLOT1 = [NONE, ['a', 'A. Thiên Nguyên'], ['b', 'B. Hư Vô'], ['c', 'C. Vô Danh']];
const SLOT2 = [
  NONE,
  ['a', 'A. Vết nứt đầu tiên'],
  ['b', 'B. Người canh giữ ngai'],
  ['c', 'C. Trang giấy ta đánh rơi'],
];
const SLOT3 = [
  NONE,
  ['a', 'A. Mày cứ ngồi vào ghế một mình'],
  ['b', 'B. Tao sẽ để lại một chiếc ghế trống cho mày'],
  ['c', 'C. Chiếc ghế ấy sẽ bị thiêu rụi'],
];
add('map_ch9_sanctum_of_the_unwritten', 'Thánh Điện Kẻ Vô Danh', (p) => {
  const q = puzzle(
    'ch9_c10',
    p.dials,
    ['Ổ 1: Tên thật', 'Ổ 2: Bản thể Peter', 'Ổ 3: Lời thề'],
    [SLOT1, SLOT2, SLOT3],
    ['a', 'c', 'b'],
    'solved_final_inscription',
    'ch9_c10_right',
    { x: 12, y: 10 },
    'ch9_c10_choices',
  );
  return {
    interactables: [
      poi('poi_ch9_c10_intro', { x: 9, y: 10 }, '[E] Đọc bệ khởi thảo', 'ch9_c10_intro'),
      q.plate,
    ],
    dials: q.dials,
    dialChecks: q.dialChecks,
    tileSwaps: [
      nextGate('solved_final_inscription', p.gate),
      swap('solved_final_inscription', p.plinth, Nx.PLINTH_LIT),
      swap('solved_final_inscription', p.sideGate, Nx.RUNE),
    ],
    exits: [
      exit('unwritten_to_astrolabe', at(12, 17), 'map_ch9_astrolabe_nave', 'from_unwritten'),
      exit(
        'unwritten_to_throne',
        at(12, 0),
        'map_ch9_hall_of_the_sixfold_throne',
        'from_unwritten',
        locked('solved_final_inscription'),
      ),
      exit(
        'unwritten_to_first',
        at(23, 9),
        'map_ch9_hidden_sanctum_of_the_first',
        'from_unwritten',
        locked('solved_final_inscription'),
      ),
    ],
    triggers: [
      arrive('ch9_t_unwritten', 'ch9_unwritten_arrival'),
      zone('ch9_t_fb3', p.fb, 'ch9_fb_03_trigger'),
    ],
  };
});
add('map_ch9_hall_of_the_sixfold_throne', 'Đại Điện Ngai Vàng Sáu Ấn', (p) => ({
  encounters: [
    encounter(
      'enc_ch9_sixfold',
      'boss_sixfold_divinity',
      p.boss,
      'defeated_sixfold_divinity',
      'ch9_sixfold_phase_3_finisher',
    ),
  ],
  tileSwaps: [nextGate('defeated_sixfold_divinity', p.gate)],
  exits: [
    exit('throne_to_unwritten', at(15, 19), 'map_ch9_sanctum_of_the_unwritten', 'from_throne'),
    exit(
      'throne_to_crown',
      at(15, 0),
      'map_ch9_crown_of_eternity',
      'from_throne',
      locked('defeated_sixfold_divinity'),
    ),
  ],
  triggers: [
    arrive('ch9_t_sixfold', 'ch9_sixfold_arrival'),
    zone('ch9_t_sixfold_confront', p.confront, 'ch9_sixfold_boss_intro', {
      unlessFlag: 'defeated_sixfold_divinity',
    }),
  ],
}));
const TRUE_GATE = ['ch8_learned_torn_page', 'solved_final_inscription'];
add('map_ch9_crown_of_eternity', 'Vương Miện Vĩnh Hằng', (p) => ({
  ambient: { color: '#e5c158', alpha: 0.1 },
  interactables: [
    poi('poi_ch9_pick_order', p.pedestals[0], '[E] Bệ Trật Tự', 'ch9_pick_order'),
    poi('poi_ch9_pick_true', p.pedestals[1], '[E] Bệ thứ ba', 'ch9_crown_hint', {
      dialogueRules: [
        { ifFlags: [...TRUE_GATE, 'ch7_kuro_embraced'], dialogueId: 'ch9_pick_true' },
        { ifFlags: [...TRUE_GATE, 'kuro_heart_opened'], dialogueId: 'ch9_pick_true' },
      ],
    }),
    poi('poi_ch9_pick_unbound', p.pedestals[2], '[E] Bệ Tự Do', 'ch9_pick_unbound'),
  ],
  exits: [exit('crown_to_throne', at(13, 17), 'map_ch9_hall_of_the_sixfold_throne', 'from_crown')],
  triggers: [
    arrive('ch9_t_crown', 'ch9_crown_arrival'),
    zone('ch9_t_crown_gate', p.gateZone, 'ch9_crown_gate_check'),
    zone('ch9_t_fb4', p.fb, 'ch9_fb_04_trigger'),
  ],
}));

// ---------------------------------------------------------------- route B
add('map_ch9_divergence_crossroad', 'Ngã Tư Phân Kỳ Khả Năng', (p) => ({
  ambient: { color: '#7a3ad8', alpha: 0.16 },
  tileSwaps: [nextGate('chronos_plea_heard', p.gate, Nx.BRANCH)],
  exits: [
    exit('crossroad_to_archive', at(0, 10), 'map_ch9_palimpsest_archive', 'from_crossroad'),
    exit(
      'crossroad_to_vale',
      at(25, 10),
      'map_ch9_vale_of_twisted_banners',
      'from_prev',
      locked('chronos_plea_heard'),
    ),
  ],
  triggers: [arrive('ch9_t_crossroad', 'ch9_crossroad_arrival')],
}));
const LIEUTENANTS = [
  [
    'map_ch9_vale_of_twisted_banners',
    'Thung Lũng Cờ Lệch Pha',
    'bran',
    'boss_lieutenant_bran',
    'ch9_bran_arrival',
    'ch9_bran_defeat',
    'map_ch9_divergence_crossroad',
    'from_vale',
    'map_ch9_iron_tribunal_ruins',
  ],
  [
    'map_ch9_iron_tribunal_ruins',
    'Phế Tích Pháp Đình Sắt',
    'lyra',
    'boss_lieutenant_lyra',
    'ch9_lyra_boss_arrival',
    'ch9_lyra_boss_defeat',
    'map_ch9_vale_of_twisted_banners',
    'from_next',
    'map_ch9_drowned_scriptorium',
  ],
  [
    'map_ch9_drowned_scriptorium',
    'Thư Phòng Chìm Khả Dĩ',
    'neris',
    'boss_lieutenant_neris',
    'ch9_neris_boss_arrival',
    'ch9_neris_boss_defeat',
    'map_ch9_iron_tribunal_ruins',
    'from_next',
    'map_ch9_hall_of_broken_mirrors',
  ],
  [
    'map_ch9_hall_of_broken_mirrors',
    'Đại Điện Gương Vỡ',
    'other_peter',
    'boss_lieutenant_other_peter',
    'ch9_other_peter_arrival',
    'ch9_other_peter_defeat',
    'map_ch9_drowned_scriptorium',
    'from_next',
    'map_ch9_throne_of_infinite_branches',
  ],
];
for (const [id, name, key, bossId, arrival, defeat, prev, prevSpawn, next] of LIEUTENANTS) {
  const flag = `defeated_lieutenant_${key}`;
  add(id, name, (p) => ({
    ambient: { color: '#7a3ad8', alpha: 0.14 },
    encounters: [encounter(`enc_ch9_${key}`, bossId, p.boss, flag, defeat)],
    tileSwaps: [nextGate(flag, p.gate, Nx.BRANCH)],
    exits: [
      exit(`${key}_back`, at(0, 9), prev, prevSpawn),
      exit(
        `${key}_on`,
        at(25, 9),
        next,
        next === 'map_ch9_throne_of_infinite_branches' ? 'from_mirrors' : 'from_prev',
        locked(flag),
      ),
    ],
    triggers: [zone(`ch9_t_${key}`, p.confront, arrival, { unlessFlag: flag })],
  }));
}
add('map_ch9_throne_of_infinite_branches', 'Ngai Vàng Muôn Nhánh', (p) => ({
  ambient: { color: '#7a3ad8', alpha: 0.18 },
  encounters: [
    encounter(
      'enc_ch9_kuro_pm',
      'boss_kuro_puppet_master',
      p.boss,
      'defeated_kuro_puppet_master_fight',
      'ch9_kuro_boss_finisher_prompt',
    ),
  ],
  exits: [exit('branches_back', at(0, 10), 'map_ch9_hall_of_broken_mirrors', 'from_next')],
  triggers: [
    zone('ch9_t_kuro_pm', p.confront, 'ch9_kuro_boss_arrival', {
      unlessFlag: 'defeated_kuro_puppet_master_fight',
    }),
  ],
}));

// ---------------------------------------------------------------- hidden
const HEROES = [
  NONE,
  ['A', 'Dũng sĩ A'],
  ['B', 'Dũng sĩ B'],
  ['C', 'Dũng sĩ C (mang khiên)'],
  ['D', 'Dũng sĩ D'],
];
add('map_ch9_hidden_crypt_of_vows', 'Hầm Mộ Lời Thề Bị Xóa', (p) => {
  const q = puzzle(
    'ch9_c11',
    p.dials,
    ['Bệ 1', 'Bệ 2', 'Bệ 3', 'Bệ 4'],
    [HEROES],
    ['B', 'A', 'C', 'D'],
    'solved_permutation_cipher',
    'ch9_c11_right',
    p.tablet,
    'ch9_c11_intro',
  );
  return {
    interactables: [q.plate],
    dials: q.dials,
    dialChecks: q.dialChecks,
    exits: [exit('crypt_to_creeds', at(17, 7), 'map_ch9_hall_of_three_creeds', 'from_crypt')],
    triggers: [arrive('ch9_t_crypt', 'ch9_crypt_arrival')],
  };
});
add('map_ch9_hidden_quantum_vault', 'Két Bánh Răng Lượng Tử', (p) => {
  const q = puzzle(
    'ch9_c12',
    p.dials,
    ['Bánh răng I', 'Bánh răng II', 'Bánh răng III'],
    [num(1, 5)],
    ['n3', 'n4', 'n5'],
    'solved_quantum_gears',
    'ch9_c12_right',
    p.drawing,
    'ch9_c12_intro',
  );
  return {
    interactables: [q.plate],
    dials: q.dials,
    dialChecks: q.dialChecks,
    exits: [exit('vault_to_archive', at(15, 7), 'map_ch9_palimpsest_archive', 'from_vault')],
    triggers: [arrive('ch9_t_quantum', 'ch9_quantum_arrival')],
  };
});
add('map_ch9_hidden_sanctum_of_the_first', 'Thánh Địa Thiên Nguyên', (p) => {
  const lit = (k) => L.OCTAGON_LIT.includes(k + 1);
  const PIL = (k) =>
    vals(
      lit(k)
        ? [
            ['on', 'Sáng'],
            ['off', 'Tắt'],
          ]
        : [
            ['off', 'Tắt'],
            ['on', 'Sáng'],
          ],
    );
  return {
    interactables: [
      poi('poi_ch9_c13', p.plaque, '[E] Đọc bia mộ', 'ch9_c13_intro', {
        dialogueRules: [{ ifFlag: 'solved_octagonal_inversion', dialogueId: 'ch9_puzzle_done' }],
      }),
    ],
    dials: p.pillars.map((t, k) =>
      dial(`ch9_c13_${k + 1}`, t, `[E] Chạm cột ${k + 1}`, PIL(k), {
        couples: [
          { dialId: `ch9_c13_${((k + 7) % 8) + 1}`, step: 1 },
          { dialId: `ch9_c13_${((k + 1) % 8) + 1}`, step: 1 },
        ],
      }),
    ),
    dialChecks: [
      {
        ifFlags: p.pillars.map((_, k) => `ch9_c13_${k + 1}_on`),
        unlessFlag: 'solved_octagonal_inversion',
        dialogueId: 'ch9_c13_right',
      },
    ],
    tileSwaps: p.pillars.flatMap((t, k) => [
      swap(`ch9_c13_${k + 1}_on`, t, Nx.PILLAR_ON),
      swap(`ch9_c13_${k + 1}_off`, t, Nx.PILLAR_OFF),
    ]),
    encounters: [
      encounter(
        'enc_ch9_core',
        'boss_void_singularity_core',
        p.core,
        'defeated_void_singularity_core',
        'ch9_void_boss_defeat',
        { visibleWhen: { flag: 'solved_octagonal_inversion' } },
      ),
    ],
    exits: [exit('first_to_unwritten', at(0, 9), 'map_ch9_sanctum_of_the_unwritten', 'from_first')],
    triggers: [arrive('ch9_t_first', 'ch9_sanctum_first_arrival')],
  };
});

for (const [id, m] of Object.entries(M)) maps.maps[id] = m;
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');
console.log('wired', Object.keys(M).length, 'maps');
