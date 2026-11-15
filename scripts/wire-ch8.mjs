/**
 * Wires Chapter 8 (CHAPTER_08_DESIGN.md with §17-18) into maps.json: 18 maps with anchor posts,
 * the gear and banner puzzles, glyph altars, the two-world mirror beam, the torn page, the four
 * gates and three waves, the six sockets, foes, bosses, gates and triggers. Content comes from
 * scripts/content-ch8.mjs. Idempotent.
 *
 * Usage: node scripts/wire-ch8.mjs
 */
import fs from 'fs';
import * as L from './ch8-layout.js';

const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const Cv = L.Cv;

const TS = {
  tileset: {
    name: 'convergence_tileset',
    key: 'convergence_tileset',
    path: 'assets/tilesets/convergence_tileset.png',
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
const NONE = ['none', '(chưa neo)'];
const WORLDS = vals([NONE, ['kh', 'Khánh Hòa'], ['beta', 'Thành Phố Beta']]);
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
/** A post glows once it holds a world. */
const postGlow = (dialId, tile, keys = ['kh', 'beta']) =>
  keys.map((k) => swap(`${dialId}_${k}`, tile, Cv.POST_LIT));
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

const byId = Object.fromEntries(L.CH8_MAPS.map((m) => [m.id, m]));
const M = {};
function add(id, name, extra) {
  const layout = byId[id].build();
  M[id] = {
    id,
    name,
    chapter: 8,
    tilemap: { key: id, path: `assets/maps/${id}.json` },
    ...TS,
    layers: { ground: 'Ground', walls: 'Walls' },
    bgm: 'ambient',
    spawns: layout.spawns,
    revive: layout.spawns.revive ?? layout.spawns.default,
    npcs: [],
    interactables: [],
    ambient: { color: '#d8a040', alpha: 0.08 },
    ...extra(layout.points, layout, id),
  };
}

// 1. Null rift landing (C01)
add('map_ch8_null_rift_landing', 'Bãi Đáp Khe Nứt', (p) => ({
  interactables: [poi('poi_ch8_rift', p.rift, '[E] Nhìn qua đường may', 'ch8_rift_note')],
  dials: [
    dial('ch8_a1', p.postA, '[E] Cọc Neo (kênh nước)', WORLDS),
    dial('ch8_a2', p.postB, '[E] Cọc Neo (khe nứt)', WORLDS),
  ],
  tileSwaps: [
    swap('ch8_a1_kh', L.LANDING.pier, Cv.PIER),
    swap('ch8_a2_beta', L.LANDING.catwalk, Cv.CATWALK),
    ...postGlow('ch8_a1', p.postA),
    ...postGlow('ch8_a2', p.postB),
  ],
  exits: [exit('landing_to_shore', at(25, 9), 'map_ch8_steel_tide_shore', 'from_landing')],
  triggers: [
    arrive('ch8_t_arrival', 'ch8_arrival', {
      onceFlag: 'ch8_t_arrival_seen',
      requiresFlag: 'ch7_kuro_embraced',
    }),
    arrive('ch8_t_arrival_b', 'ch8_arrival_b', {
      onceFlag: 'ch8_t_arrival_seen',
      unlessFlag: 'ch7_kuro_embraced',
    }),
    zone('ch8_t_anchor', { x: 3, y: 5, w: 4, h: 6 }, 'ch8_anchor_intro'),
    zone('ch8_t_guilt', { x: 10, y: 3, w: 6, h: 12 }, 'ch8_kuro_guilt', {
      unlessFlag: 'ch6_kuro_ally',
    }),
    zone('ch8_t_c01', p.bank, 'ch8_c01_done'),
  ],
}));

// 2. Steel tide shore (C02)
const naRules = [
  { ifFlag: 'gave_na_papers', dialogueId: 'ch8_na_thanks' },
  {
    ifItems: ['colored_paper_red', 'colored_paper_blue', 'colored_paper_gold'],
    dialogueId: 'ch8_na_give',
  },
  { ifFlag: 'ch8_na_asked', dialogueId: 'ch8_na_waiting' },
  { ifFlag: 'completed_na_crane_quest', dialogueId: 'ch8_na_crane_short' },
];
add('map_ch8_steel_tide_shore', 'Bờ Biển Thép', (p) => ({
  npcs: [
    npc('npc_ch8_coba', 'npc_vendor_ba', p.coba, 'Cô Ba', 'ch8_coba', {
      dialogueRules: [{ ifFlag: 'solved_na_chalk_shore', dialogueId: 'ch8_c02_done' }],
    }),
    {
      ...npc('npc_ch8_na', 'npc_forgotten_child', p.na, 'bé Na', 'ch8_na', {
        dialogueRules: naRules,
      }),
      anim: 'npc_forgotten_child_flicker',
    },
  ],
  interactables: [
    poi('poi_ch8_chalk', p.chalk, '[E] Xem bức vẽ phấn', 'ch8_chalk'),
    poi('poi_ch8_boat', p.boat, '[E] Đẩy thuyền', 'ch8_c02_hint_3', {
      dialogueRules: [
        { ifFlag: 'solved_na_chalk_shore', dialogueId: 'ch8_c02_done' },
        { unlessFlag: 'ch8_c02_p1_kh', dialogueId: 'ch8_c02_hint_1' },
        { unlessFlag: 'ch8_c02_p2_beta', dialogueId: 'ch8_c02_hint_2' },
      ],
    }),
    pickup(
      'poi_ch8_paper_red',
      p.paper,
      '[E] Nhặt tờ giấy',
      'ch8_paper_red',
      'took_colored_paper_red',
    ),
  ],
  dials: p.posts.map((t, k) => dial(`ch8_c02_p${k + 1}`, t, `[E] Cọc Neo ${k + 1}`, WORLDS)),
  dialChecks: [
    {
      ifFlags: ['ch8_c02_p1_kh', 'ch8_c02_p2_beta', 'ch8_c02_p3_kh'],
      unlessFlag: 'solved_na_chalk_shore',
      dialogueId: 'ch8_c02_right',
    },
  ],
  roamers: p.foes.map((t, k) => roamer(`ch8_assim_s${k}`, 'enemy_assimilator', t)),
  tileSwaps: [
    swap('ch8_c02_p1_kh', L.SHORE.zone1, Cv.LIGHTHOUSE),
    swap('ch8_c02_p1_beta', L.SHORE.zone1, Cv.STACK),
    swap('ch8_c02_p2_beta', L.SHORE.zone2, Cv.RAIL),
    swap('ch8_c02_p3_kh', L.SHORE.zone3, Cv.WATER),
    swap('ch8_c02_p3_beta', L.SHORE.zone3, Cv.DECK),
    ...p.posts.flatMap((t, k) => postGlow(`ch8_c02_p${k + 1}`, t)),
  ],
  exits: [
    exit('shore_to_landing', at(0, 10), 'map_ch8_null_rift_landing', 'from_shore'),
    exit('shore_to_market', at(29, 10), 'map_ch8_gear_market', 'from_shore', {
      requiresFlag: 'solved_na_chalk_shore',
      lockedDialogueId: 'ch8_shore_exit_locked',
    }),
  ],
  triggers: [arrive('ch8_t_shore', 'ch8_shore_arrival')],
}));

// 3. Gear market (C03)
const TEETH = vals([
  ['none', '(trống)'],
  ['t8', '8 răng'],
  ['t12', '12 răng'],
  ['t16', '16 răng'],
  ['t24', '24 răng'],
]);
add('map_ch8_gear_market', 'Chợ Bánh Răng', (p) => ({
  npcs: [
    npc('npc_ch8_ivo', 'npc_ivo', p.ivo, 'Ivo', 'ch8_ivo', {
      visibleWhen: { unlessFlag: 'ivo_joined' },
    }),
  ],
  interactables: [
    poi('poi_ch8_notebook', p.notebook, '[E] Đọc sổ tay Ivo', 'ch8_notebook'),
    poi('poi_ch8_c03', p.door, '[E] Thử cửa xưởng', 'ch8_c03_wrong', {
      radius: 40,
      dialogueRules: [
        { ifFlag: 'solved_ivo_gears', dialogueId: 'ch8_c03_done' },
        { ifFlag: 'ch8_gear_mid_none', dialogueId: 'ch8_notebook' },
      ],
    }),
    pickup(
      'poi_ch8_secret1',
      p.secret,
      '[E] Xem dưới sạp hàng',
      'ch8_secret1_take',
      'took_world_secret_seam_thread',
      {
        visibleWhen: { flag: 'solved_ivo_gears', unlessFlag: 'took_world_secret_seam_thread' },
      },
    ),
    poi('poi_ch8_vault', p.vault, '[E] Xem đống thùng thép', 'ch8_vault_locked', {
      visibleWhen: { unlessFlag: 'opened_ledger_vault' },
      dialogueRules: [{ ifItem: 'kuro_ledger', dialogueId: 'ch8_vault_open' }],
    }),
  ],
  dials: [
    dial('ch8_gear_mid', p.gears[0], '[E] Bánh răng giữa', TEETH),
    dial('ch8_gear_out', p.gears[1], '[E] Bánh răng ra', TEETH),
  ],
  dialChecks: [
    {
      ifFlags: ['ch8_gear_mid_t16', 'ch8_gear_out_t24'],
      unlessFlag: 'solved_ivo_gears',
      dialogueId: 'ch8_c03_right',
    },
  ],
  roamers: p.foes.map((t, k) => roamer(`ch8_assim_m${k}`, 'enemy_assimilator', t)),
  tileSwaps: [
    swap('solved_ivo_gears', p.door, Cv.DECK),
    swap('opened_ledger_vault', p.vault, Cv.DECK),
  ],
  exits: [
    exit('market_to_shore', at(0, 10), 'map_ch8_steel_tide_shore', 'from_market'),
    exit('market_to_foundry', at(27, 10), 'map_ch8_drowned_foundry', 'from_market', {
      requiresFlag: 'solved_ivo_gears',
      lockedDialogueId: 'ch8_market_exit_locked',
    }),
    exit('market_to_vault', at(23, 15), 'map_ch8_blank_ledger_vault', 'from_market', {
      requiresFlag: 'opened_ledger_vault',
      lockedDialogueId: 'ch8_vault_locked',
    }),
  ],
  triggers: [arrive('ch8_t_market', 'ch8_market_arrival')],
}));

// 4. Drowned foundry
add('map_ch8_drowned_foundry', 'Xưởng Đúc Chìm', (p) => ({
  interactables: [poi('poi_ch8_crucible', p.crucible, '[E] Xem nồi nấu', 'ch8_crucible')],
  roamers: [
    ...p.bells.map((t, k) => roamer(`ch8_bell_f${k}`, 'enemy_doom_bell', t)),
    roamer('ch8_assim_f0', 'enemy_assimilator', p.foe),
  ],
  exits: [
    exit('foundry_to_market', at(0, 10), 'map_ch8_gear_market', 'from_foundry_gate'),
    exit('foundry_to_forum', at(13, 0), 'map_ch8_ragged_forum', 'from_foundry'),
  ],
  triggers: [
    arrive('ch8_t_foundry', 'ch8_foundry_arrival'),
    zone('ch8_t_bells', { x: 3, y: 7, w: 3, h: 6 }, 'ch8_ivo_bells'),
    zone('ch8_t_fb1', p.memory, 'ch8_fb1'),
  ],
}));

// 5. Ragged forum (C04)
const EVENTS = vals([
  ['none', '(trống)'],
  ['a', 'Trống trận vang'],
  ['b', 'Cổng thành mở'],
  ['c', 'Cờ đỏ rách'],
  ['d', 'Hoàng đế ra lệnh'],
]);
const C04 = ['d', 'a', 'c', 'b'];
add('map_ch8_ragged_forum', 'Quảng Trường Cờ Rách', (p) => ({
  npcs: [
    npc('npc_ch8_lyra', 'npc_lyra', p.lyra, 'Lyra', 'ch8_lyra', {
      visibleWhen: { unlessFlag: 'lyra_joined' },
    }),
  ],
  interactables: [
    poi('poi_ch8_clue1', p.clues[0], '[E] Đọc bia mực đen', 'ch8_clue_1'),
    poi('poi_ch8_clue2', p.clues[1], '[E] Đọc bia mực đen', 'ch8_clue_2'),
    poi('poi_ch8_clue3', p.clues[2], '[E] Đọc cờ mực vàng', 'ch8_clue_3'),
    poi('poi_ch8_c04', { x: 15, y: 7 }, '[E] Kể lại trận đánh', 'ch8_c04_wrong', {
      dialogueRules: [
        { ifFlag: 'solved_ragged_causality', dialogueId: 'ch8_c04_done' },
        { ifFlag: 'ch8_banner_1_none', dialogueId: 'ch8_banner_events' },
      ],
    }),
    pickup(
      'poi_ch8_paper_blue',
      p.paper,
      '[E] Nhặt tờ giấy',
      'ch8_paper_blue',
      'took_colored_paper_blue',
    ),
  ],
  dials: p.banners.map((t, k) => dial(`ch8_banner_${k + 1}`, t, `[E] Cờ thứ ${k + 1}`, EVENTS)),
  dialChecks: [
    {
      ifFlags: C04.map((v, k) => `ch8_banner_${k + 1}_${v}`),
      unlessFlag: 'solved_ragged_causality',
      dialogueId: 'ch8_c04_right',
    },
  ],
  roamers: [
    roamer('ch8_legion_r0', 'enemy_twin_era_legionnaire', p.foes[0]),
    roamer('ch8_assim_r0', 'enemy_assimilator', p.foes[1]),
  ],
  tileSwaps: [swap('solved_ragged_causality', p.gate, Cv.MARBLE)],
  exits: [
    exit('forum_to_foundry', at(15, 19), 'map_ch8_drowned_foundry', 'from_forum'),
    exit('forum_to_barracks', at(29, 10), 'map_ch8_twin_era_barracks', 'from_forum', {
      requiresFlag: 'solved_ragged_causality',
      lockedDialogueId: 'ch8_forum_exit_locked',
    }),
  ],
  triggers: [arrive('ch8_t_forum', 'ch8_forum_arrival')],
}));

// 6. Twin-era barracks (C05)
const ERAS = (first) =>
  vals([
    NONE,
    ...(first === 's'
      ? [
          ['s', 'Sol-Karis'],
          ['w', 'Chiến hào'],
        ]
      : [
          ['w', 'Chiến hào'],
          ['s', 'Sol-Karis'],
        ]),
  ]);
const B = L.BARRACKS;
add('map_ch8_twin_era_barracks', 'Doanh Trại Hai Thời', (p) => ({
  npcs: [
    npc('npc_ch8_bran', 'npc_soldier_bran', p.bran, 'hồn Bran', 'ch8_bran', {
      visibleWhen: { flag: 'ch4_choice_bran_memorial' },
    }),
  ],
  interactables: [
    poi('poi_ch8_bran_tag', p.bran, '[E] Xem thẻ bài', 'ch8_bran_tag', {
      visibleWhen: { unlessFlag: 'ch4_choice_bran_memorial' },
    }),
    poi('poi_ch8_kuro_post', { x: 18, y: 9 }, '[E] Hỏi Kuro', 'ch8_kuro_post'),
    poi('poi_ch8_barricade', { x: 5, y: 19 }, '[E] Xem đống chướng ngại', 'ch8_barricade', {
      visibleWhen: { unlessFlag: 'broke_archive_barricade' },
      dialogueRules: [{ ifFlag: 'ch8_with_lyra', dialogueId: 'ch8_barricade_break' }],
    }),
    poi('poi_ch8_compass', p.compass, '[E] Xem la bàn', 'ch8_compass_hint', {
      visibleWhen: { flag: 'calibrated_blind_compass', unlessFlag: 'broke_archive_barricade' },
    }),
  ],
  dials: [
    dial('ch8_c05_p1', p.posts[0], '[E] Cọc Neo 1', ERAS('s')),
    dial('ch8_c05_p2', p.posts[1], '[E] Cọc Neo 2', ERAS('w')),
    dial('ch8_c05_p3', p.posts[2], '[E] Cọc Neo 3', ERAS('s')),
    dial('ch8_c05_p3', p.kuro, '[E] Nhờ Kuro xoay Cọc Neo 3 (bên kia)', ERAS('s')),
  ],
  roamers: [
    ...p.legion.map((t, k) => roamer(`ch8_legion_b${k}`, 'enemy_twin_era_legionnaire', t)),
    ...p.wraiths.map((t, k) => roamer(`ch8_wraith_b${k}`, 'enemy_phase_wraith', t)),
  ],
  tileSwaps: [
    swap('ch8_c05_p1_w', B.gap1, Cv.BOARDS),
    swap('ch8_c05_p1_s', B.gap1, Cv.SHIELD_WALL),
    swap('ch8_c05_p2_s', B.gap2, Cv.STAIR),
    swap('ch8_c05_p2_w', B.gap2, Cv.CRATER),
    swap('ch8_c05_p3_w', B.step3, Cv.MUD),
    swap('ch8_c05_p3_s', B.gate, Cv.MARBLE),
    swap('broke_archive_barricade', B.barricade, Cv.MUD),
    ...postGlow('ch8_c05_p1', p.posts[0], ['s', 'w']),
    ...postGlow('ch8_c05_p2', p.posts[1], ['s', 'w']),
    ...postGlow('ch8_c05_p3', p.posts[2], ['s', 'w']),
  ],
  exits: [
    exit('barracks_to_forum', at(0, 10), 'map_ch8_ragged_forum', 'from_barracks'),
    exit(
      'barracks_to_bridge',
      { x: 29, y: 10, w: 1, h: 2 },
      'map_ch8_verdict_bridge',
      'from_barracks',
      {
        requiresFlag: 'solved_twin_watch',
        lockedDialogueId: 'ch8_barracks_exit_locked',
      },
    ),
    exit('barracks_to_archive', at(5, 21), 'map_ch8_hidden_war_archive', 'from_barracks', {
      requiresFlag: 'broke_archive_barricade',
    }),
  ],
  triggers: [
    arrive('ch8_t_barracks', 'ch8_barracks_arrival'),
    zone('ch8_t_barracks_lyra', { x: 1, y: 8, w: 4, h: 5 }, 'ch8_lyra_barracks'),
    zone('ch8_t_c05', { x: 26, y: 8, w: 3, h: 6 }, 'ch8_c05_right', {
      requiresFlag: 'ch8_c05_p3_s',
      unlessFlag: 'solved_twin_watch',
    }),
  ],
}));

// 7. Verdict bridge (mini-boss)
add('map_ch8_verdict_bridge', 'Cầu Phán Quyết', (p) => ({
  interactables: [
    pickup(
      'poi_ch8_secret2',
      p.secret,
      '[E] Xem lan can',
      'ch8_secret2_take',
      'took_world_secret_sol_karis_beta_treaty',
      {
        visibleWhen: {
          flag: 'defeated_convergent_praetor',
          unlessFlag: 'took_world_secret_sol_karis_beta_treaty',
        },
      },
    ),
  ],
  npcs: [
    npc('npc_ch8_aldric', 'npc_aldric', p.aldric, 'Aldric', 'ch8_aldric_after', {
      visibleWhen: { flag: 'defeated_convergent_praetor' },
      dialogueRules: [
        { ifFlag: 'ch4_choice_aldric_comfort', dialogueId: 'ch8_aldric_after_comfort' },
      ],
    }),
  ],
  encounters: [
    encounter(
      'enc_convergent_praetor',
      'boss_convergent_praetor',
      p.praetor,
      'defeated_convergent_praetor',
      'ch8_praetor_defeated',
      {
        victoryDialogueRules: [
          { ifFlag: 'ch4_choice_aldric_comfort', dialogueId: 'ch8_praetor_defeated_c' },
        ],
      },
    ),
  ],
  tileSwaps: [swap('defeated_convergent_praetor', p.gate, Cv.MARBLE)],
  exits: [
    exit('bridge_to_barracks', at(0, 9), 'map_ch8_twin_era_barracks', 'from_bridge'),
    exit('bridge_to_library', at(12, 0), 'map_ch8_ash_stair_library', 'from_bridge', {
      requiresFlag: 'defeated_convergent_praetor',
      lockedDialogueId: 'ch8_bridge_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch8_t_bridge', 'ch8_bridge_arrival'),
    zone('ch8_t_praetor', p.confront, 'ch8_praetor_confront', {
      unlessFlag: 'defeated_convergent_praetor',
    }),
  ],
}));

// 8. Ash stair library (C06)
const GLYPHS = { a: 'Sáng', o: 'Tối', i: 'Dòng', u: 'Tĩnh', e: 'Vật', n: 'Tên', x: 'Không' };
const glyphVals = [
  { key: 'none', label: '(trống)' },
  ...Object.entries(GLYPHS).map(([k, meaning]) => ({
    key: k,
    label: `[${k.toUpperCase()}] ${meaning}`,
    unknownLabel: `[${k.toUpperCase()}] ?`,
    knownFlag: `ch6_glyph_${k}_known`,
  })),
];
const biaRules = (id) => [{ ifFlag: 'neris_joined', dialogueId: id }];
add('map_ch8_ash_stair_library', 'Thư Viện Bậc Tro', (p) => ({
  npcs: [
    npc('npc_ch8_neris', 'npc_neris', p.neris, 'Neris', 'ch8_neris', {
      visibleWhen: { unlessFlag: 'neris_joined' },
    }),
    npc('npc_ch8_solon', 'npc_solon', p.solon, 'Solon', 'ch8_solon_cold', {
      dialogueRules: [{ ifFlag: 'resolved_solon_guilt', dialogueId: 'ch8_solon' }],
    }),
  ],
  interactables: [
    poi('poi_ch8_bia1', p.bia[0], '[E] Đọc bia chữ cổ', 'ch8_bia_unread', {
      dialogueRules: biaRules('ch8_bia_1'),
    }),
    poi('poi_ch8_bia2', p.bia[1], '[E] Đọc bia chữ cổ', 'ch8_bia_unread', {
      dialogueRules: biaRules('ch8_bia_2'),
    }),
    pickup(
      'poi_ch8_paper_gold',
      p.paper,
      '[E] Nhặt tờ giấy',
      'ch8_paper_gold',
      'took_colored_paper_gold',
    ),
  ],
  dials: [
    dial('ch8_c06_a1', p.altar1[0], '[E] Bệ một, ô 1', glyphVals),
    dial('ch8_c06_a2', p.altar1[1], '[E] Bệ một, ô 2', glyphVals),
    dial('ch8_c06_b1', p.altar2[0], '[E] Bệ hai, ô 1', glyphVals),
    dial('ch8_c06_b2', p.altar2[1], '[E] Bệ hai, ô 2', glyphVals),
  ],
  dialChecks: [
    {
      ifFlags: ['ch8_c06_a1_n', 'ch8_c06_a2_x'],
      unlessFlag: 'ch8_names_still',
      dialogueId: 'ch8_c06_nx',
    },
    {
      ifFlags: ['ch8_c06_a1_n', 'ch8_c06_a2_u'],
      unlessFlag: 'ch8_names_still',
      dialogueId: 'ch8_c06_one',
    },
    {
      ifFlags: ['ch8_names_still', 'ch8_c06_b1_e', 'ch8_c06_b2_a'],
      unlessFlag: 'solved_flowing_names',
      dialogueId: 'ch8_c06_right',
    },
  ],
  roamers: p.foes.map((t, k) => roamer(`ch8_wraith_l${k}`, 'enemy_phase_wraith', t)),
  tileSwaps: [
    swap('ch8_names_still', L.LIBRARY.shelves, Cv.STELE_WALL),
    swap('solved_flowing_names', L.LIBRARY.door, Cv.FLAG),
  ],
  exits: [
    exit('library_to_bridge', at(14, 21), 'map_ch8_verdict_bridge', 'from_library'),
    exit('library_to_ossuary', at(27, 11), 'map_ch8_mirror_ossuary', 'from_library', {
      requiresFlag: 'solved_flowing_names',
      lockedDialogueId: 'ch8_library_exit_locked',
    }),
  ],
  triggers: [arrive('ch8_t_library', 'ch8_library_arrival')],
}));

// 9. Mirror ossuary (C07)
const O = L.OSSUARY;
add('map_ch8_mirror_ossuary', 'Hầm Gương Hai Cõi', (p) => ({
  npcs: [
    npc('npc_ch8_elion', 'npc_chronicler_elion', p.elion, 'Elion', 'ch8_elion', {
      dialogueRules: [{ ifFlag: 'took_elion_final_page', dialogueId: 'ch8_elion_done' }],
    }),
  ],
  interactables: [poi('poi_ch8_ossuary_note', p.note, '[E] Đọc chữ khắc', 'ch8_ossuary_note')],
  dials: [
    dial(
      'ch8_c07_a1',
      p.posts[0],
      '[E] Cọc Neo (gương thứ nhất)',
      vals([
        ['backslash', 'Cõi Linh Hồn'],
        ['none', 'Thượng Giới'],
      ]),
    ),
    dial(
      'ch8_c07_a2',
      p.posts[1],
      '[E] Cọc Neo (gương thứ hai)',
      vals([
        ['none', 'Thượng Giới'],
        ['backslash', 'Cõi Linh Hồn'],
      ]),
    ),
  ],
  beams: [
    {
      id: 'ch8_beam',
      start: O.lamp,
      dir: { x: 1, y: 0 },
      mirrors: [
        { dialId: 'ch8_c07_a1', tile: O.m1 },
        { dialId: 'ch8_c07_a2', tile: O.m2 },
      ],
      prisms: [O.m1],
      target: O.target,
      solvedFlag: 'solved_twin_mirrors',
      solvedDialogueId: 'ch8_c07_right',
    },
  ],
  roamers: [
    roamer('ch8_warden', 'enemy_second_hand_warden', p.warden, {
      defeatedFlag: 'defeated_second_hand_warden',
      respawn: false,
    }),
  ],
  tileSwaps: [
    swap('ch8_c07_a1_none', O.m1, Cv.PRISM),
    swap('ch8_c07_a1_backslash', O.m1, Cv.SILVER_MIRROR),
    swap('ch8_c07_a2_backslash', O.m2, Cv.SILVER_MIRROR),
    swap('ch8_c07_a2_none', O.m2, Cv.FADED),
    swap('solved_twin_mirrors', O.target, Cv.SOCKET_SET),
    swap('solved_twin_mirrors', { x: 13, y: 1 }, Cv.CLOUD),
  ],
  exits: [
    exit('ossuary_to_library', at(0, 10), 'map_ch8_ash_stair_library', 'from_ossuary'),
    exit('ossuary_to_sanctum', at(13, 0), 'map_ch8_torn_page_sanctum', 'from_ossuary', {
      requiresFlag: 'solved_twin_mirrors',
      lockedDialogueId: 'ch8_ossuary_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch8_t_ossuary', 'ch8_ossuary_arrival'),
    zone('ch8_t_ossuary_neris', { x: 3, y: 8, w: 4, h: 5 }, 'ch8_ossuary_neris'),
    zone('ch8_t_warden', { x: 21, y: 13, w: 3, h: 5 }, 'ch8_warden_note'),
  ],
}));

// 10. Torn page sanctum (C08)
const STRIPS = vals([
  ['none', '(trống)'],
  ['a_up', 'Dải A (xuôi)'],
  ['a_dn', 'Dải A (ngược)'],
  ['b_up', 'Dải B (xuôi)'],
  ['b_dn', 'Dải B (ngược)'],
  ['c_up', 'Dải C (xuôi)'],
  ['c_dn', 'Dải C (ngược)'],
]);
const C08 = ['ch8_c08_s1_a_up', 'ch8_c08_s2_b_up', 'ch8_c08_s3_c_up'];
add('map_ch8_torn_page_sanctum', 'Thánh Điện Trang Xé', (p) => ({
  interactables: [
    pickup(
      'poi_ch8_strip_a',
      p.strips[0],
      '[E] Nhặt dải giấy',
      'ch8_strip_a',
      'took_torn_page_strip_a',
    ),
    pickup(
      'poi_ch8_strip_b',
      p.strips[1],
      '[E] Nhặt dải giấy',
      'ch8_strip_b',
      'took_torn_page_strip_b',
    ),
    pickup(
      'poi_ch8_strip_c',
      p.strips[2],
      '[E] Nhặt dải giấy',
      'ch8_strip_c',
      'took_torn_page_strip_c',
    ),
    poi('poi_ch8_c08', { x: 11, y: 9 }, '[E] Xem trang ghép', 'ch8_c08_wrong', {
      visibleWhen: { unlessFlag: 'solved_torn_page' },
      dialogueRules: [
        { ifFlag: 'ch8_c08_s1_none', dialogueId: 'ch8_c08_rule' },
        { ifFlag: 'ch8_c08_s2_none', dialogueId: 'ch8_c08_rule' },
        { ifFlag: 'ch8_c08_s3_none', dialogueId: 'ch8_c08_rule' },
      ],
    }),
  ],
  dials: p.slots.map((t, k) =>
    dial(`ch8_c08_s${k + 1}`, t, `[E] Khe ${['trái', 'giữa', 'phải'][k]}`, STRIPS, {
      requiresFlag: 'took_torn_page_strip_c',
    }),
  ),
  dialChecks: [{ ifFlags: C08, unlessFlag: 'solved_torn_page', dialogueId: 'ch8_c08_right' }],
  tileSwaps: [swap('ch8_learned_torn_page', p.gate, Cv.CLOUD)],
  exits: [
    exit('sanctum_to_ossuary', at(11, 17), 'map_ch8_mirror_ossuary', 'from_sanctum'),
    exit('sanctum_to_plaza', at(21, 9), 'map_ch8_convergence_plaza', 'from_sanctum', {
      requiresFlag: 'ch8_learned_torn_page',
      lockedDialogueId: 'ch8_sanctum_exit_locked',
    }),
  ],
  triggers: [arrive('ch8_t_sanctum', 'ch8_sanctum_arrival')],
}));

// 11. Convergence plaza (C09) and the three waves
const GATE_VALS = vals([
  ['none', '(chưa giao)'],
  ['ivo', 'Ivo'],
  ['lyra', 'Lyra'],
  ['neris', 'Neris'],
  ['trench', 'Người lính chiến hào'],
]);
const C09 = ['ch8_gate_n_ivo', 'ch8_gate_e_lyra', 'ch8_gate_s_neris', 'ch8_gate_w_trench'];
const wave = (n) => ({ flag: `ch8_wave${n}_on`, unlessFlag: `cleared_ch8_wave${n}` });
add('map_ch8_convergence_plaza', 'Quảng Trường Hội Tụ', (p) => ({
  npcs: [
    npc('npc_ch8_ivo_gate', 'npc_ivo', p.gates.n, 'Ivo', 'ch8_gate_ivo', {
      dialogueRules: [
        { ifFlag: 'settled_ivo_debt', dialogueId: 'ch8_ivo_plaza' },
        { ifFlag: 'solved_kuro_ledger', dialogueId: 'ch8_ivo_plaza_debt' },
      ],
    }),
    npc('npc_ch8_lyra_gate', 'npc_lyra', p.gates.e, 'Lyra', 'ch8_gate_lyra'),
    npc('npc_ch8_neris_gate', 'npc_neris', p.gates.s, 'Neris', 'ch8_gate_neris'),
    npc('npc_ch8_aldric_gate', 'npc_aldric', p.gates.w, 'Aldric', 'ch8_gate_aldric', {
      visibleWhen: { unlessFlag: 'ch4_choice_bran_memorial' },
    }),
    npc('npc_ch8_bran_gate', 'npc_soldier_bran', p.gates.w, 'hồn Bran', 'ch8_gate_bran', {
      visibleWhen: { flag: 'ch4_choice_bran_memorial' },
    }),
    npc('npc_ch8_mai', 'npc_kuro_mother', p.mai, 'Bà Mai', 'ch8_mai_song', {
      visibleWhen: { flag: 'restored_kuro_mother_name' },
    }),
    {
      ...npc('npc_ch8_na_plaza', 'npc_forgotten_child', { x: 12, y: 7 }, 'bé Na', 'ch8_na', {
        dialogueRules: naRules,
      }),
      anim: 'npc_forgotten_child_flicker',
    },
  ],
  interactables: [
    poi('poi_ch8_c09', { x: 16, y: 10 }, '[E] Ra lệnh', 'ch8_c09_wrong', {
      visibleWhen: { unlessFlag: 'solved_four_gates' },
      dialogueRules: [
        ...['n', 'e', 's', 'w'].map((g) => ({
          ifFlag: `ch8_gate_${g}_none`,
          dialogueId: 'ch8_plaza_scout',
        })),
      ],
    }),
  ],
  dials: ['n', 'e', 's', 'w'].map((g, k) =>
    dial(`ch8_gate_${g}`, p.table[k], `[E] Cổng ${['Bắc', 'Đông', 'Nam', 'Tây'][k]}`, GATE_VALS, {
      requiresFlag: 'ch8_t_plaza_seen',
      radius: 30,
    }),
  ),
  dialChecks: [{ ifFlags: C09, unlessFlag: 'solved_four_gates', dialogueId: 'ch8_c09_right' }],
  roamers: [
    ...[p.gates.n, p.gates.e, p.gates.w].map((t, k) =>
      roamer(
        `ch8_w1_${k}`,
        'enemy_assimilator',
        { x: t.x, y: t.y + (k === 0 ? 2 : 0) + 1 },
        {
          group: 'ch8_wave1',
          visibleWhen: wave(1),
        },
      ),
    ),
    roamer(
      'ch8_w2_0',
      'enemy_twin_era_legionnaire',
      { x: 24, y: 12 },
      { group: 'ch8_wave2', visibleWhen: wave(2) },
    ),
    roamer(
      'ch8_w2_1',
      'enemy_twin_era_legionnaire',
      { x: 8, y: 12 },
      { group: 'ch8_wave2', visibleWhen: wave(2) },
    ),
    roamer(
      'ch8_w2_2',
      'enemy_phase_wraith',
      { x: 16, y: 17 },
      { group: 'ch8_wave2', visibleWhen: wave(2) },
    ),
    roamer(
      'ch8_w3_0',
      'enemy_doom_bell',
      { x: 16, y: 7 },
      { group: 'ch8_wave3', visibleWhen: wave(3) },
    ),
    roamer(
      'ch8_w3_1',
      'enemy_assimilator',
      { x: 22, y: 16 },
      { group: 'ch8_wave3', visibleWhen: wave(3) },
    ),
    roamer(
      'ch8_w3_2',
      'enemy_assimilator',
      { x: 10, y: 16 },
      { group: 'ch8_wave3', visibleWhen: wave(3) },
    ),
  ],
  tileSwaps: [swap('held_last_line', { x: 16, y: 1 }, Cv.SEAM_PATH)],
  exits: [
    exit('plaza_to_sanctum', at(0, 12), 'map_ch8_torn_page_sanctum', 'from_plaza'),
    exit('plaza_to_tower', at(16, 0), 'map_ch8_anchor_tower_base', 'from_plaza', {
      requiresFlag: 'held_last_line',
      lockedDialogueId: 'ch8_plaza_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch8_t_plaza', 'ch8_plaza_arrival'),
    zone('ch8_t_scout', { x: 12, y: 9, w: 9, h: 6 }, 'ch8_plaza_scout'),
    zone('ch8_t_wave1', p.whole, 'ch8_wave1_done', { requiresFlag: 'cleared_ch8_wave1' }),
    zone('ch8_t_wave2', p.whole, 'ch8_wave2_done', { requiresFlag: 'cleared_ch8_wave2' }),
    zone('ch8_t_fb3', p.whole, 'ch8_fb3', { requiresFlag: 'ch8_wave3_on', delayMs: 300 }),
    zone('ch8_t_wave3', p.whole, 'ch8_wave3_done', { requiresFlag: 'cleared_ch8_wave3' }),
  ],
}));

// 12. Anchor tower base (C10)
const SEAL_VALS = vals([
  ['none', '(trống)'],
  ['continuum', 'Ấn Continuum'],
  ['causality', 'Ấn Causality'],
  ['memory', 'Ấn Memory'],
  ['finality', 'Ấn Finality'],
  ['possibility', 'Ấn Possibility'],
  ['origin', 'Nửa Ấn Origin'],
]);
const C10 = ['origin', 'continuum', 'causality', 'memory', 'finality', 'possibility'];
const HOURS = [12, 2, 4, 6, 8, 10];
/** The quote plate of each socket sits on its inner side, toward the stair. */
const inner = (t) => ({ x: t.x + Math.sign(12 - t.x), y: t.y + Math.sign(8.5 - t.y) });
add('map_ch8_anchor_tower_base', 'Chân Tháp Neo', (p) => ({
  npcs: [
    npc('npc_ch8_mira', 'npc_mira', p.mira, 'Mira', 'ch8_mira', {
      dialogueRules: [
        { ifItem: 'elion_final_page', dialogueId: 'ch8_mira_page' },
        { ifFlag: 'ch5_choice_alpha_spared', dialogueId: 'ch8_mira_spared' },
      ],
    }),
  ],
  interactables: [
    ...p.sockets.map((t, k) =>
      poi(
        `poi_ch8_socket_${k + 1}`,
        inner(t),
        `[E] Đọc câu khắc giờ ${HOURS[k]}`,
        `ch8_socket_${k + 1}`,
        {
          radius: 24,
        },
      ),
    ),
    poi('poi_ch8_c10', { x: 12, y: 9 }, '[E] Xem mặt đồng hồ', 'ch8_c10_wrong', {
      visibleWhen: { unlessFlag: 'solved_six_sockets' },
      dialogueRules: p.sockets.map((_, k) => ({
        ifFlag: `ch8_sock_${k + 1}_none`,
        dialogueId: 'ch8_base_exit_locked',
      })),
    }),
    pickup(
      'poi_ch8_secret4',
      p.secret,
      '[E] Xem sau chân tháp',
      'ch8_secret4_take',
      'took_world_secret_null_hour_switch',
      {
        visibleWhen: {
          flag: 'solved_six_sockets',
          unlessFlag: 'took_world_secret_null_hour_switch',
        },
      },
    ),
  ],
  dials: p.sockets.map((t, k) =>
    dial(`ch8_sock_${k + 1}`, t, `[E] Ổ ấn giờ ${HOURS[k]}`, SEAL_VALS),
  ),
  dialChecks: [
    {
      ifFlags: C10.map((v, k) => `ch8_sock_${k + 1}_${v}`),
      unlessFlag: 'solved_six_sockets',
      dialogueId: 'ch8_c10_right',
    },
  ],
  tileSwaps: [
    ...p.sockets.map((t, k) => swap(`ch8_sock_${k + 1}_${C10[k]}`, t, Cv.SOCKET_SET)),
    swap('solved_six_sockets', p.stair, Cv.TOWER_STAIR),
  ],
  exits: [
    exit('base_to_plaza', at(12, 19), 'map_ch8_convergence_plaza', 'from_tower'),
    exit('base_to_gears', at(12, 0), 'map_ch8_anchor_tower_gears', 'from_base', {
      requiresFlag: 'solved_six_sockets',
      lockedDialogueId: 'ch8_base_exit_locked',
    }),
  ],
  triggers: [arrive('ch8_t_base', 'ch8_base_arrival')],
}));

// 13. Anchor tower gears
add('map_ch8_anchor_tower_gears', 'Ruột Tháp Bánh Răng', (p) => ({
  interactables: [
    poi('poi_ch8_echo_door', { x: 21, y: 18 }, '[E] Xem cửa bánh răng', 'ch8_echo_door', {
      visibleWhen: { unlessFlag: 'opened_echo_door' },
    }),
  ],
  dials: [
    dial('ch8_g1', p.posts[0], '[E] Cọc Neo (vết nứt)', WORLDS),
    dial('ch8_g2', p.posts[1], '[E] Cọc Neo (tường bánh răng)', WORLDS),
  ],
  roamers: [
    roamer('ch8_wraith_g0', 'enemy_phase_wraith', p.foes[0]),
    roamer('ch8_legion_g0', 'enemy_twin_era_legionnaire', p.foes[1]),
    roamer('ch8_bell_g0', 'enemy_doom_bell', p.foes[2]),
    roamer('ch8_assim_g0', 'enemy_assimilator', p.foes[3]),
  ],
  tileSwaps: [
    swap('ch8_g1_kh', L.GEARS.gap, Cv.PIER),
    swap('ch8_g2_beta', L.GEARS.lift, Cv.RAIL),
    swap('opened_echo_door', p.echoDoor, Cv.TOWER_STAIR),
    ...postGlow('ch8_g1', p.posts[0]),
    ...postGlow('ch8_g2', p.posts[1]),
  ],
  exits: [
    exit('gears_to_base', at(12, 23), 'map_ch8_anchor_tower_base', 'from_gears'),
    exit('gears_to_heart', at(12, 0), 'map_ch8_null_clock_heart', 'from_gears'),
    exit('gears_to_echo', at(23, 18), 'map_ch8_sixfold_echo_hall', 'from_gears', {
      requiresFlag: 'opened_echo_door',
    }),
  ],
  triggers: [
    arrive('ch8_t_gears', 'ch8_gears_arrival'),
    zone('ch8_t_gears_kuro', { x: 9, y: 17, w: 7, h: 4 }, 'ch8_gears_kuro'),
  ],
}));

// 14. Null clock heart (boss)
add('map_ch8_null_clock_heart', 'Tim Đồng Hồ Số Không', (p) => ({
  encounters: [
    encounter(
      'enc_null_hour_herald',
      'boss_null_hour_herald',
      p.herald,
      'defeated_null_hour_herald',
      'ch8_herald_defeated',
    ),
  ],
  tileSwaps: [swap('defeated_null_hour_herald', p.gate, Cv.TOWER_STAIR)],
  exits: [
    exit('heart_to_gears', at(11, 17), 'map_ch8_anchor_tower_gears', 'from_heart'),
    exit('heart_to_crown', at(11, 0), 'map_ch8_tower_crown', 'from_heart', {
      requiresFlag: 'defeated_null_hour_herald',
      lockedDialogueId: 'ch8_heart_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch8_t_heart', 'ch8_heart_arrival'),
    zone('ch8_t_herald', p.confront, 'ch8_herald_confront', {
      unlessFlag: 'defeated_null_hour_herald',
    }),
  ],
}));

// 15. Tower crown (end)
add('map_ch8_tower_crown', 'Đỉnh Tháp', (p) => ({
  ambient: { color: '#f0c860', alpha: 0.12 },
  triggers: [
    arrive('ch8_t_crown', 'ch8_crown_warm', {
      onceFlag: 'ch8_t_crown_seen',
      requiresFlag: 'ch7_kuro_embraced',
    }),
    arrive('ch8_t_crown_b', 'ch8_crown_cold', {
      onceFlag: 'ch8_t_crown_seen',
      unlessFlag: 'ch7_kuro_embraced',
    }),
    zone('ch8_t_end', p.edge, 'ch8_end_1', {
      onceFlag: 'ch8_t_end_seen',
      requiresFlag: 'gave_na_papers',
    }),
    zone('ch8_t_end_b', p.edge, 'ch8_end_1b', {
      onceFlag: 'ch8_t_end_seen',
      unlessFlag: 'gave_na_papers',
    }),
  ],
}));

// A. Hidden war archive (C11)
const DIGITS = vals([...Array(10).keys()].map((n) => [`n${n}`, String(n)]));
const C11 = ['n2', 'n4', 'n9'];
add('map_ch8_hidden_war_archive', 'Kho Binh Thư Hai Triều', (p) => ({
  interactables: [
    poi('poi_ch8_archive_plate', p.plate, '[E] Đọc bản khắc', 'ch8_archive_plate'),
    poi('poi_ch8_c11', p.chest, '[E] Mở cửa sắt', 'ch8_c11_wrong', {
      dialogueRules: [{ ifFlag: 'solved_war_archive', dialogueId: 'ch8_c11_done' }],
    }),
  ],
  dials: p.dials.map((t, k) => dial(`ch8_c11_d${k + 1}`, t, `[E] Vòng số ${k + 1}`, DIGITS)),
  dialChecks: [
    {
      ifFlags: C11.map((v, k) => `ch8_c11_d${k + 1}_${v}`),
      unlessFlag: 'solved_war_archive',
      dialogueId: 'ch8_c11_right',
    },
  ],
  tileSwaps: [swap('solved_war_archive', p.chest, Cv.MUD)],
  exits: [exit('archive_to_barracks', at(9, 0), 'map_ch8_twin_era_barracks', 'from_archive')],
  triggers: [arrive('ch8_t_archive', 'ch8_archive_arrival')],
}));

// B. Blank ledger vault (C12)
add('map_ch8_blank_ledger_vault', 'Két Sổ Cái Trống', (p) => ({
  interactables: [
    poi('poi_ch8_ledger', p.ledger, '[E] Đọc sổ cái', 'ch8_ledger'),
    poi('poi_ch8_safe', p.safe, '[E] Thử mở két', 'ch8_c12_wrong', {
      dialogueRules: [{ ifFlag: 'solved_kuro_ledger', dialogueId: 'ch8_c12_done' }],
    }),
  ],
  dials: [
    dial(
      'ch8_c12_name',
      p.name,
      '[E] Viết tên vào ô trống',
      vals([
        ['none', '(trống)'],
        ['kuro', 'Kuro'],
        ['na', 'Na'],
        ['ivo', 'Ivo'],
        ['peter', 'Peter'],
      ]),
      { radius: 24 },
    ),
  ],
  dialChecks: [
    {
      ifFlags: ['ch8_c12_name_peter'],
      unlessFlag: 'solved_kuro_ledger',
      dialogueId: 'ch8_c12_right',
    },
  ],
  exits: [exit('vault_to_market', at(8, 11), 'map_ch8_gear_market', 'from_vault')],
  triggers: [arrive('ch8_t_vault', 'ch8_vault_arrival')],
}));

// C. Sixfold echo hall (C13)
add('map_ch8_sixfold_echo_hall', 'Sảnh Vọng Sáu Ấn', (p) => ({
  interactables: p.pillars.map((t, k) =>
    poi(
      `poi_ch8_pillar_${k + 1}`,
      t,
      `[E] Chạm cột ${['Continuum', 'Causality', 'Memory', 'Finality', 'Possibility', 'Origin'][k]}`,
      `ch8_pillar_${k + 1}`,
      {
        radius: 40,
        visibleWhen: { unlessFlag: 'solved_six_pillars' },
        dialogueRules: [
          { ifFlag: `ch8_pillar_${k + 1}`, dialogueId: 'ch8_pillar_lit' },
          ...(k > 0 ? [{ unlessFlag: `ch8_pillar_${k}`, dialogueId: 'ch8_pillar_wrong' }] : []),
        ],
      },
    ),
  ),
  encounters: [
    encounter(
      'enc_sixfold_echo',
      'boss_sixfold_echo',
      p.echo,
      'defeated_sixfold_echo',
      'ch8_echo_defeated',
      { visibleWhen: { flag: 'solved_six_pillars' } },
    ),
  ],
  tileSwaps: p.pillars.map((t, k) => swap(`ch8_pillar_${k + 1}`, t, Cv.SOCKET_SET)),
  exits: [exit('echo_to_gears', at(0, 9), 'map_ch8_anchor_tower_gears', 'from_echo')],
  triggers: [
    arrive('ch8_t_echo', 'ch8_echo_arrival'),
    zone('ch8_t_c13', { x: 1, y: 2, w: 20, h: 14 }, 'ch8_c13_right', {
      requiresFlag: 'ch8_pillar_6',
      unlessFlag: 'solved_six_pillars',
    }),
    zone('ch8_t_echo_confront', p.confront, 'ch8_echo_confront', {
      requiresFlag: 'solved_six_pillars',
      unlessFlag: 'defeated_sixfold_echo',
    }),
  ],
}));

for (const [id, m] of Object.entries(M)) maps.maps[id] = m;
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');
console.log('wired', Object.keys(M).length, 'maps');
