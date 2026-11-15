/**
 * Wires Chapter 7 (CHAPTER_07_DESIGN.md with §18, §19) into maps.json: 19 maps with name altars,
 * the fog lullaby maze, foes, bosses, gates and triggers. Content comes from
 * scripts/content-ch7.mjs. Idempotent.
 *
 * Usage: node scripts/wire-ch7.mjs
 */
import fs from 'fs';
import * as L from './ch7-layout.js';

const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const Vc = L.Vc;

const TS = {
  tileset: {
    name: 'voidcore_tileset',
    key: 'voidcore_tileset',
    path: 'assets/tilesets/voidcore_tileset.png',
  },
  collision: { fromGid: 4, toGid: 44 },
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
  radius: 32,
  prompt,
  values,
  ...extra,
});
const vals = (pairs) => pairs.map(([key, label]) => ({ key, label }));
const NONE = ['none', '(trống)'];
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
/** A confirm POI: done → right → (any slot empty) → default wrong. */
const confirmRules = (doneFlag, doneId, rights, emptyId, slotIds) => [
  { ifFlag: doneFlag, dialogueId: doneId },
  ...rights.map(([flags, dialogueId]) => ({ ifFlags: flags, dialogueId })),
  ...slotIds.map((s) => ({ ifFlag: `${s}_none`, dialogueId: emptyId })),
];

const byId = Object.fromEntries(L.CH7_MAPS.map((m) => [m.id, m]));
const M = {};
function add(id, name, extra) {
  const layout = byId[id].build();
  M[id] = {
    id,
    name,
    chapter: 7,
    tilemap: { key: id, path: `assets/maps/${id}.json` },
    ...TS,
    layers: { ground: 'Ground', walls: 'Walls' },
    bgm: 'ambient',
    spawns: layout.spawns,
    revive: layout.spawns.revive ?? layout.spawns.default,
    npcs: [],
    interactables: [],
    ambient: { color: '#7a5ad8', alpha: 0.12 },
    ...extra(layout.points, layout, id),
  };
}

// 1. Ash abyss drop
add('map_ch7_ash_abyss_drop', 'Vực Tro Thủy Tinh', (p) => ({
  interactables: [
    poi('poi_ch7_watch', p.watch, '[E] Nhặt đồng hồ quả quýt', 'ch7_watch'),
    poi('poi_ch7_seal', p.seal, '[E] Nhìn Nửa Ấn Origin', 'ch7_seal_glow'),
  ],
  exits: [exit('drop_to_shore', at(23, 8), 'map_ch7_faded_shore', 'from_drop')],
  triggers: [arrive('ch7_t_arrival', 'ch7_arrival')],
}));

// 2. Faded shore (C01)
const LETTERS = [
  vals([NONE, ['a', 'A'], ['t', 'T'], ['h', 'H']]),
  vals([NONE, ['n', 'N'], ['m', 'M'], ['l', 'L']]),
  vals([NONE, ['h', 'H'], ['g', 'G'], ['k', 'K']]),
];
add('map_ch7_faded_shore', 'Bờ Cát Phai Màu', (p) => ({
  npcs: [
    npc('npc_ch7_keeper', 'npc_nameless_shade', p.keeper, 'người gác cầu', 'ch7_keeper_shade', {
      dialogueRules: [{ ifFlag: 'restored_bridge_keeper', dialogueId: 'ch7_c01_done' }],
    }),
  ],
  interactables: [
    pickup('poi_ch7_tag', p.tag, '[E] Nhặt thẻ bài', 'ch7_tag_take', 'took_bridge_toll_tag'),
    poi('poi_ch7_fisherman', p.fisherman, '[E] Nghe ngư dân hóa đá', 'ch7_fisherman'),
    poi('poi_ch7_c01', p.engrave, '[E] Gọi tên', 'ch7_c01_wrong', {
      radius: 30,
      dialogueRules: confirmRules(
        'restored_bridge_keeper',
        'ch7_c01_done',
        [[['ch7_c01_s1_a', 'ch7_c01_s2_n', 'ch7_c01_s3_h'], 'ch7_c01_right']],
        'ch7_c01_empty',
        ['ch7_c01_s1', 'ch7_c01_s2', 'ch7_c01_s3'],
      ),
    }),
  ],
  dials: p.slots.map((t, k) =>
    dial(`ch7_c01_s${k + 1}`, t, `[E] Chữ cái thứ ${k + 1}`, LETTERS[k]),
  ),
  roamers: p.moths.map((t, k) => roamer(`ch7_moths_s${k}`, 'enemy_erasure_moths', t)),
  tileSwaps: [swap('restored_bridge_keeper', L.SHORE_BRIDGE, Vc.RUNE)],
  exits: [
    exit('shore_to_drop', at(0, 9), 'map_ch7_ash_abyss_drop', 'from_shore'),
    exit('shore_to_hamlet', at(27, 9), 'map_ch7_erased_hamlet', 'from_shore', {
      requiresFlag: 'restored_bridge_keeper',
      lockedDialogueId: 'ch7_shore_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch7_t_shore', 'ch7_shore_arrival'),
    zone('ch7_t_naming', { x: 9, y: 6, w: 5, h: 6 }, 'ch7_naming_intro'),
  ],
}));

// 3. Erased hamlet (C02)
const LAMPS = vals([NONE, ['lam', 'Đèn Lam'], ['vang', 'Đèn Vàng'], ['trang', 'Đèn Trắng']]);
add('map_ch7_erased_hamlet', 'Xóm Chài Bị Xóa', (p) => ({
  interactables: [
    poi('poi_ch7_table', p.table, '[E] Xem bàn ăn', 'ch7_family_table'),
    poi('poi_ch7_custom', p.custom, '[E] Đọc bia đầu làng', 'ch7_hamlet_custom'),
    poi('poi_ch7_scratches', p.scratches, '[E] Xem bậu cửa sổ', 'ch7_window_scratches'),
    poi('poi_ch7_c02', p.light, '[E] Thắp ba ngọn đèn', 'ch7_c02_wrong', {
      dialogueRules: confirmRules(
        'opened_erased_hamlet_gate',
        'ch7_c02_done',
        [[['ch7_window_1_lam', 'ch7_window_2_vang', 'ch7_window_3_trang'], 'ch7_c02_right']],
        'ch7_c02_empty',
        ['ch7_window_1', 'ch7_window_2', 'ch7_window_3'],
      ),
    }),
    pickup(
      'poi_ch7_secret1',
      p.secret,
      '[E] Xem sau căn nhà',
      'ch7_secret1_take',
      'took_world_secret_torn_origin_scroll',
      {
        visibleWhen: {
          flag: 'opened_erased_hamlet_gate',
          unlessFlag: 'took_world_secret_torn_origin_scroll',
        },
      },
    ),
  ],
  dials: p.windows.map((t, k) => dial(`ch7_window_${k + 1}`, t, `[E] Đèn cửa sổ ${k + 1}`, LAMPS)),
  dialChecks: [
    {
      ifFlags: ['ch7_window_1_lam', 'ch7_window_2_vang', 'ch7_window_3_trang'],
      unlessFlag: 'opened_erased_hamlet_gate',
      dialogueId: 'ch7_c02_right',
    },
  ],
  roamers: [
    ...p.husks.map((t, k) => roamer(`ch7_husk_h${k}`, 'enemy_hollow_husk', t)),
    roamer('ch7_hound_h0', 'enemy_ink_hound', p.hound),
  ],
  tileSwaps: [
    swap('ch7_window_1_lam', p.lanterns[0], Vc.LANTERN_LIT),
    swap('opened_erased_hamlet_gate', p.lanterns, Vc.LANTERN_LIT),
    swap('opened_erased_hamlet_gate', L.HAMLET_GATE, Vc.RUNE),
  ],
  exits: [
    exit('hamlet_to_shore', at(0, 10), 'map_ch7_faded_shore', 'from_hamlet'),
    exit('hamlet_to_cradle', at(15, 0), 'map_ch7_cradle_sanctuary', 'from_hamlet', {
      requiresFlag: 'opened_erased_hamlet_gate',
      lockedDialogueId: 'ch7_hamlet_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_hamlet', 'ch7_hamlet_arrival')],
}));

// 4. Cradle sanctuary (C03)
const NAMES = [
  vals([NONE, ['nguyen', 'Nguyễn'], ['tran', 'Trần'], ['le', 'Lê'], ['pham', 'Phạm']]),
  vals([NONE, ['thi', 'Thị'], ['ngoc', 'Ngọc'], ['nhu', 'Như'], ['xuan', 'Xuân']]),
  vals([NONE, ['lan', 'Lan'], ['cuc', 'Cúc'], ['mai', 'Mai'], ['le', 'Lệ']]),
];
add('map_ch7_cradle_sanctuary', 'Thánh Điện Chiếc Nôi', (p) => ({
  npcs: [
    npc('npc_ch7_mother', 'npc_kuro_mother', p.mother, 'người phụ nữ', 'ch7_mother_first', {
      dialogueRules: [
        { ifFlag: 'returned_mother_hairpin', dialogueId: 'ch7_mother_restored' },
        { ifItem: 'mother_golden_hairpin', dialogueId: 'ch7_mother_hairpin' },
        { ifFlag: 'restored_kuro_mother_name', dialogueId: 'ch7_mother_restored' },
        { ifFlag: 'met_kuro_mother', dialogueId: 'ch7_mother_waiting' },
      ],
    }),
  ],
  interactables: [
    poi('poi_ch7_embroidery', p.embroidery, '[E] Xem mép nôi', 'ch7_embroidery', { radius: 30 }),
    poi('poi_ch7_c03', p.engrave, '[E] Gọi tên', 'ch7_c03_wrong', {
      radius: 30,
      dialogueRules: confirmRules(
        'restored_kuro_mother_name',
        'ch7_mother_restored',
        [[['ch7_c03_s1_tran', 'ch7_c03_s2_thi', 'ch7_c03_s3_mai'], 'ch7_c03_right']],
        'ch7_c03_empty',
        ['ch7_c03_s1', 'ch7_c03_s2', 'ch7_c03_s3'],
      ),
    }),
    pickup(
      'poi_ch7_secret2',
      p.secret,
      '[E] Xem dưới gầm nôi',
      'ch7_secret2_take',
      'took_world_secret_mother_letter',
      {
        radius: 26,
        visibleWhen: {
          flag: 'restored_kuro_mother_name',
          unlessFlag: 'took_world_secret_mother_letter',
        },
      },
    ),
  ],
  dials: p.slots.map((t, k) =>
    dial(`ch7_c03_s${k + 1}`, t, `[E] ${['Họ', 'Tên đệm', 'Tên'][k]}`, NAMES[k]),
  ),
  exits: [
    exit('cradle_to_hamlet', at(13, 17), 'map_ch7_erased_hamlet', 'from_cradle'),
    exit('cradle_to_well', at(0, 9), 'map_ch7_echo_well_depths', 'from_cradle', {
      requiresFlag: 'restored_kuro_mother_name',
      lockedDialogueId: 'ch7_cradle_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch7_t_cradle', 'ch7_cradle_arrival'),
    zone('ch7_t_cradle_letter', { x: 8, y: 9, w: 10, h: 4 }, 'ch7_cradle_letter_thought', {
      requiresFlag: 'ch5_choice_alpha_letter',
    }),
    zone('ch7_t_cradle_refused', { x: 8, y: 9, w: 10, h: 4 }, 'ch7_cradle_refused_thought', {
      requiresFlag: 'ch5_refused_alpha_memory',
    }),
  ],
}));

// 5. Echo well (C04)
const PEBBLES = vals([
  NONE,
  ['quartz', 'Sỏi Thạch Anh'],
  ['iron', 'Sỏi Quặng Sắt'],
  ['star', 'Sỏi Đá Sao'],
  ['void', 'Sỏi Hư Vô'],
]);
const PEBBLE_NODES = ['ch7_pebble_quartz', 'ch7_pebble_iron', 'ch7_pebble_star', 'ch7_pebble_void'];
add('map_ch7_echo_well_depths', 'Giếng Vọng Cái Tên', (p) => ({
  interactables: [
    poi('poi_ch7_well_inscription', p.inscription, '[E] Đọc văn bia', 'ch7_well_inscription'),
    poi('poi_ch7_pebble_note', p.note, '[E] Đọc ghi chép', 'ch7_pebble_note'),
    ...p.pebbles.map((t, k) =>
      poi(`poi_ch7_pebble_${k}`, t, '[E] Cầm thử hòn sỏi', PEBBLE_NODES[k]),
    ),
    poi('poi_ch7_c04', p.drop, '[E] Thả sỏi', 'ch7_c04_wrong', {
      dialogueRules: confirmRules(
        'balanced_echo_well',
        'ch7_c04_done',
        [[['ch7_funnel_1_iron', 'ch7_funnel_2_star', 'ch7_funnel_3_quartz'], 'ch7_c04_right']],
        'ch7_c04_empty',
        ['ch7_funnel_1', 'ch7_funnel_2', 'ch7_funnel_3'],
      ),
    }),
  ],
  dials: p.funnels.map((t, k) =>
    dial(`ch7_funnel_${k + 1}`, t, `[E] Phễu ${['trầm', 'trung', 'bổng'][k]}`, PEBBLES),
  ),
  roamers: p.eaters.map((t, k) => roamer(`ch7_eater_w${k}`, 'enemy_name_eater', t)),
  tileSwaps: [swap('balanced_echo_well', p.gate, Vc.RUNE)],
  exits: [
    exit('well_to_cradle', at(23, 9), 'map_ch7_cradle_sanctuary', 'from_well'),
    exit('well_to_fleet', at(12, 19), 'map_ch7_stranded_fleet', 'from_well', {
      requiresFlag: 'balanced_echo_well',
      lockedDialogueId: 'ch7_well_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_well', 'ch7_well_arrival')],
}));

// 6. Stranded fleet (C05)
const SAILORS = vals([NONE, ['a', 'Thủy thủ A'], ['b', 'Thủy thủ B'], ['c', 'Thủy thủ C']]);
const COMPASS = ['compass_shard_1', 'compass_shard_2', 'compass_shard_3'];
add('map_ch7_stranded_fleet', 'Bến Thuyền Mắc Cạn', (p) => ({
  npcs: [
    npc('npc_ch7_sailor_a', 'npc_nameless_shade', p.sailors.a, 'Thủy thủ A', 'ch7_sailor_a'),
    npc('npc_ch7_sailor_b', 'npc_nameless_shade', p.sailors.b, 'Thủy thủ B', 'ch7_sailor_b', {
      dialogueRules: [{ ifFlag: 'solved_stranded_fleet', dialogueId: 'ch7_c05_done' }],
    }),
    npc('npc_ch7_sailor_c', 'npc_nameless_shade', p.sailors.c, 'Thủy thủ C', 'ch7_sailor_c'),
  ],
  interactables: [
    poi('poi_ch7_tag_c', p.tag_c, '[E] Xem thẻ bài thủy thủ C', 'ch7_tag_c', { radius: 26 }),
    poi('poi_ch7_paint_c', p.paint_c, '[E] Xem mạn thuyền', 'ch7_paint_c', { radius: 26 }),
    poi('poi_ch7_ledger', p.ledger, '[E] Đọc sổ bến', 'ch7_harbor_ledger'),
    poi('poi_ch7_logbook', p.logbook, '[E] Đọc nhật ký hàng hải', 'ch7_logbook', { radius: 30 }),
    poi('poi_ch7_chronicle_page', p.chronicle_page, '[E] Nhớ lại trang sử', 'ch7_chronicle_page', {
      visibleWhen: { flag: 'ch6_chronicle_kept' },
    }),
    poi('poi_ch7_c05', p.handover, '[E] Trao hải đồ', 'ch7_c05_wrong', {
      radius: 30,
      dialogueRules: confirmRules(
        'solved_stranded_fleet',
        'ch7_c05_done',
        [[['ch7_captain_b'], 'ch7_c05_right']],
        'ch7_c05_empty',
        ['ch7_captain'],
      ),
    }),
    pickup(
      'poi_ch7_secret3',
      p.cabin,
      '[E] Lục khoang lái',
      'ch7_secret3_take',
      'took_world_secret_twin_gods_pact',
    ),
    ...p.compass.map((t, k) =>
      pickup(
        `poi_ch7_compass_${k + 1}`,
        t,
        '[E] Nhặt mảnh la bàn',
        `ch7_compass_take_${k + 1}`,
        `took_compass_shard_${k + 1}`,
        {
          radius: 28,
        },
      ),
    ),
    poi(
      'poi_ch7_compass_place',
      { x: 17, y: 12 },
      '[E] Đặt la bàn lên thuyền buồm nâu',
      'ch7_compass_need',
      {
        radius: 28,

        dialogueRules: [
          { ifFlag: 'calibrated_blind_compass', dialogueId: 'ch7_compass_done' },
          { ifItems: COMPASS, dialogueId: 'ch7_compass_place' },
        ],
      },
    ),
  ],
  dials: [dial('ch7_captain', p.captain, '[E] Chỉ định thuyền trưởng', SAILORS)],
  roamers: [
    ...p.hounds.map((t, k) => roamer(`ch7_hound_f${k}`, 'enemy_ink_hound', t)),
    roamer('ch7_moths_f0', 'enemy_erasure_moths', p.moths),
  ],
  tileSwaps: [swap('solved_stranded_fleet', p.gate, Vc.RUNE)],
  exits: [
    exit('fleet_to_well', at(12, 0), 'map_ch7_echo_well_depths', 'from_fleet'),
    exit('fleet_to_clocks', at(31, 10), 'map_ch7_clock_graveyard', 'from_fleet', {
      requiresFlag: 'solved_stranded_fleet',
      lockedDialogueId: 'ch7_fleet_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_fleet', 'ch7_fleet_arrival')],
}));

// 7. Clock graveyard (C06)
const HANDS = vals([NONE, ['2', 'Kim 2'], ['5', 'Kim 5'], ['8', 'Kim 8'], ['11', 'Kim 11']]);
const QUARTERS = [
  ['q12', 'góc 12 giờ', '8'],
  ['q3', 'góc 3 giờ', '11'],
  ['q6', 'góc 6 giờ', '2'],
  ['q9', 'góc 9 giờ', '5'],
];
add('map_ch7_clock_graveyard', 'Nghĩa Địa Đồng Hồ', (p) => ({
  interactables: [
    poi('poi_ch7_clock_note', p.note, '[E] Đọc ghi chú thợ đồng hồ', 'ch7_clock_note'),
    poi('poi_ch7_clock_fissure', p.fissure, '[E] Xem vết nứt', 'ch7_clock_fissure', { radius: 24 }),
    poi('poi_ch7_c06', p.check, '[E] Lên dây đồng hồ', 'ch7_c06_wrong', {
      dialogueRules: confirmRules(
        'solved_clock_graveyard',
        'ch7_c06_done',
        [[QUARTERS.map(([q, , v]) => `ch7_clock_${q}_${v}`), 'ch7_c06_right']],
        'ch7_c06_empty',
        QUARTERS.map(([q]) => `ch7_clock_${q}`),
      ),
    }),
    pickup(
      'poi_ch7_secret4',
      p.secret,
      '[E] Xem dưới bia mộ',
      'ch7_secret4_take',
      'took_world_secret_null_hour_blueprint',
    ),
  ],
  dials: QUARTERS.map(([q, label]) =>
    dial(`ch7_clock_${q}`, p.quarters[q], `[E] Gắn kim ${label}`, HANDS, { radius: 22 }),
  ),
  roamers: [
    ...p.husks.map((t, k) => roamer(`ch7_husk_c${k}`, 'enemy_hollow_husk', t)),
    roamer('ch7_eater_c0', 'enemy_name_eater', p.eater),
  ],
  tileSwaps: [swap('solved_clock_graveyard', p.swamp, Vc.SAND)],
  exits: [
    exit('clocks_to_fleet', at(0, 9), 'map_ch7_stranded_fleet', 'from_clocks'),
    exit('clocks_to_weeper', at(13, 0), 'map_ch7_weeper_crossing', 'from_clocks', {
      requiresFlag: 'solved_clock_graveyard',
      lockedDialogueId: 'ch7_clocks_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_clocks', 'ch7_clocks_arrival')],
}));

// 8. Weeper crossing
add('map_ch7_weeper_crossing', 'Hành Lang Than Khóc', (p) => ({
  interactables: [
    poi('poi_ch7_crack', p.crack, '[E] Xem vách mực', 'ch7_crack_closed', {
      dialogueRules: [{ ifFlag: 'defeated_nameless_weeper', dialogueId: 'ch7_crack_open' }],
    }),
  ],
  encounters: [
    {
      id: 'enc_nameless_weeper',
      enemyId: 'boss_nameless_weeper',
      texture: 'boss_nameless_weeper',
      anim: 'boss_nameless_weeper_idle',
      tile: p.weeper,
      defeatedFlag: 'defeated_nameless_weeper',
      hitbox: 30,
      victoryDialogueId: 'ch7_weeper_defeated',
    },
  ],
  tileSwaps: [swap('defeated_nameless_weeper', p.gate, Vc.RUNE)],
  exits: [
    exit('weeper_to_clocks', at(14, 19), 'map_ch7_clock_graveyard', 'from_weeper'),
    exit('weeper_to_archives', at(14, 0), 'map_ch7_blank_archives', 'from_weeper', {
      requiresFlag: 'defeated_nameless_weeper',
      lockedDialogueId: 'ch7_weeper_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch7_t_weeper', 'ch7_weeper_arrival'),
    zone('ch7_t_weeper_confront', { x: 12, y: 10, w: 5, h: 2 }, 'ch7_weeper_confront', {
      unlessFlag: 'defeated_nameless_weeper',
    }),
  ],
}));

// 9. First mason's tomb (hidden A)
const CHISELS = vals([
  NONE,
  ['dong', 'Đục Đồng'],
  ['thep', 'Đục Thép'],
  ['kimcuong', 'Đục Kim Cương'],
  ['huvo', 'Đục Hư Vô'],
]);
// Stone order on the dais: 1 star stone, 2 soft limestone, 3 void stone, 4 layered stone.
const CHISEL_ANSWER = ['kimcuong', 'dong', 'huvo', 'thep'];
add('map_ch7_first_mason_tomb', 'Mộ Người Khắc Bia Đầu Tiên', (p) => ({
  npcs: [
    npc(
      'npc_ch7_smith',
      'npc_nameless_shade',
      { x: 16, y: 10 },
      'người thợ rèn',
      'ch7_smith_ghost',
      {
        visibleWhen: { flag: 'aligned_celestial_chess' },
      },
    ),
  ],
  interactables: [
    poi('poi_ch7_mason_rules', p.rules, '[E] Đọc văn bia', 'ch7_mason_rules'),
    ...p.stones.map((t, k) =>
      poi(`poi_ch7_stone_${k + 1}`, t, '[E] Xem phiến đá', `ch7_stone_${k + 1}`, { radius: 26 }),
    ),
    poi('poi_ch7_c11', p.carve, '[E] Khắc', 'ch7_c11_wrong', {
      dialogueRules: confirmRules(
        'honored_first_mason',
        'ch7_c11_done',
        [[CHISEL_ANSWER.map((v, k) => `ch7_chisel_${k + 1}_${v}`), 'ch7_c11_right']],
        'ch7_c11_empty',
        [1, 2, 3, 4].map((k) => `ch7_chisel_${k}`),
      ),
    }),
    poi('poi_ch7_tomb_back', p.back, '[E] Quay lên', 'ch7_tomb_back'),
  ],
  dials: p.chisels.map((t, k) => dial(`ch7_chisel_${k + 1}`, t, `[E] Giá đục ${k + 1}`, CHISELS)),
  triggers: [arrive('ch7_t_tomb', 'ch7_tomb_arrival')],
}));

// 10. Blank archives (C07)
const SCROLLS = vals([
  NONE,
  ['a', 'Cuộn mùi tro'],
  ['b', 'Cuộn mùi hoa cúc'],
  ['c', 'Cuộn mùi quặng sắt'],
  ['d', 'Cuộn mùi đá sao'],
]);
add('map_ch7_blank_archives', 'Thư Khố Giấy Trắng', (p) => ({
  npcs: [
    npc('npc_ch7_solon', 'npc_solon', p.solon, 'Archon Solon', 'ch7_solon_ghost', {
      visibleWhen: { flag: 'resolved_solon_guilt' },
    }),
  ],
  interactables: [
    ...['a', 'b', 'c', 'd'].map((k, i) =>
      poi(`poi_ch7_scroll_${k}`, p.scrolls[i], '[E] Ngửi cuộn giấy', `ch7_scroll_${k}`),
    ),
    poi('poi_ch7_legend', p.legend, '[E] Đọc bảng mùi', 'ch7_scent_legend'),
    pickup(
      'poi_ch7_memo',
      p.memo,
      '[E] Nhặt ghi chép',
      'ch7_memo_take',
      'took_librarian_ghost_memo',
    ),
    poi('poi_ch7_c07', p.check, '[E] Xếp sách', 'ch7_c07_wrong', {
      dialogueRules: confirmRules(
        'solved_blank_archives',
        'ch7_c07_done',
        [[['ch7_shelf_1_a', 'ch7_shelf_2_b', 'ch7_shelf_3_c', 'ch7_shelf_4_d'], 'ch7_c07_right']],
        'ch7_c07_empty',
        [1, 2, 3, 4].map((k) => `ch7_shelf_${k}`),
      ),
    }),
    pickup(
      'poi_ch7_key',
      p.key,
      '[E] Nhặt chìa khóa trắng',
      'ch7_key_take',
      'took_white_crypt_key',
      {
        visibleWhen: { flag: 'solved_blank_archives', unlessFlag: 'took_white_crypt_key' },
      },
    ),
  ],
  dials: p.shelves.map((t, k) => dial(`ch7_shelf_${k + 1}`, t, `[E] Ngăn ${k + 1}`, SCROLLS)),
  roamers: [roamer('ch7_eater_a0', 'enemy_name_eater', p.eater)],
  tileSwaps: [swap('solved_blank_archives', [{ x: 25, y: 9 }], Vc.RUNE)],
  exits: [
    exit('archives_to_weeper', at(13, 17), 'map_ch7_weeper_crossing', 'from_archives'),
    exit('archives_to_tree', at(25, 9), 'map_ch7_bang_tree_promontory', 'from_archives', {
      requiresFlag: 'solved_blank_archives',
      lockedDialogueId: 'ch7_archives_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_archives', 'ch7_archives_arrival')],
}));

// 11. Bang tree promontory (C08)
const DAYS = vals([
  NONE,
  ['01', 'Ngày 01'],
  ['07', 'Ngày 07'],
  ['14', 'Ngày 14'],
  ['15', 'Ngày 15'],
  ['30', 'Ngày 30'],
]);
const MONTHS = vals([
  NONE,
  ['01', 'Tháng 01'],
  ['05', 'Tháng 05'],
  ['07', 'Tháng 07'],
  ['08', 'Tháng 08'],
  ['12', 'Tháng 12'],
]);
const AGES = vals([
  NONE,
  ['10', '10 tuổi'],
  ['12', '12 tuổi'],
  ['14', '14 tuổi'],
  ['16', '16 tuổi'],
]);
add('map_ch7_bang_tree_promontory', 'Mỏm Đá Gốc Bàng', (p) => ({
  interactables: [
    pickup(
      'poi_ch7_diary',
      p.diary,
      '[E] Lục túi áo',
      'ch7_diary_take',
      'took_peter_torn_diary_page',
    ),
    poi('poi_ch7_c08', p.open, '[E] Mở hộp thiếc', 'ch7_c08_wrong', {
      dialogueRules: confirmRules(
        'opened_childhood_pledge_box',
        'ch7_c08_done',
        [[['ch7_box_day_15', 'ch7_box_month_07', 'ch7_box_age_14'], 'ch7_c08_right']],
        'ch7_c08_empty',
        ['ch7_box_day', 'ch7_box_month', 'ch7_box_age'],
      ),
    }),
    pickup(
      'poi_ch7_secret5',
      p.carving,
      '[E] Xem rễ bàng',
      'ch7_secret5_take',
      'took_world_secret_childhood_carving',
      {
        radius: 26,
      },
    ),
  ],
  dials: [
    dial('ch7_box_day', p.dials[0], '[E] Vòng ngày', DAYS),
    dial('ch7_box_month', p.dials[1], '[E] Vòng tháng', MONTHS),
    dial('ch7_box_age', p.dials[2], '[E] Vòng tuổi', AGES),
  ],
  roamers: [
    roamer('ch7_moths_t0', 'enemy_erasure_moths', p.moths),
    roamer('ch7_hound_t0', 'enemy_ink_hound', p.hound),
  ],
  tileSwaps: [swap('opened_childhood_pledge_box', p.gate, Vc.RUNE)],
  exits: [
    exit('tree_to_archives', at(0, 9), 'map_ch7_blank_archives', 'from_tree'),
    exit('tree_to_maze', at(14, 17), 'map_ch7_fog_lullaby_maze', 'from_tree', {
      requiresFlag: 'opened_childhood_pledge_box',
      lockedDialogueId: 'ch7_tree_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch7_t_tree', 'ch7_tree_arrival'),
    zone('ch7_t_promise', { x: 12, y: 7, w: 6, h: 6 }, 'ch7_promise_recall', {
      requiresFlag: 'ch6_promise_remembered',
    }),
  ],
}));

// 12. Fog lullaby maze (C09)
const FOG = (k) => `ch7_fog_${k + 1}`;
add('map_ch7_fog_lullaby_maze', 'Mê Cung Sương Lời Ru', (p) => ({
  interactables: [
    poi('poi_ch7_crypt', p.crypt, '[E] Xem cửa đá trắng', 'ch7_crypt_locked', {
      visibleWhen: { flag: 'solved_fog_maze' },
      dialogueRules: [{ ifItem: 'white_crypt_key', dialogueId: 'ch7_crypt_open' }],
    }),
  ],
  tileSwaps: [swap('solved_fog_maze', p.gate, Vc.RUNE)],
  exits: [
    exit('maze_to_tree', at(12, 0), 'map_ch7_bang_tree_promontory', 'from_maze'),
    exit('maze_to_cathedral', at(23, 9), 'map_ch7_chain_cathedral', 'from_maze', {
      requiresFlag: 'solved_fog_maze',
      lockedDialogueId: 'ch7_maze_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch7_t_maze', 'ch7_maze_arrival'),
    arrive('ch7_t_maze_refused', 'ch7_fog_refused_help', {
      requiresFlag: 'ch5_refused_alpha_memory',
    }),
    // Each landmark: right when the one before it is reached; any other order sends Peter back.
    ...L.LANDMARKS.flatMap((l, k) => [
      {
        id: `ch7_t_fog_ok_${k + 1}`,
        on: 'zone',
        area: l.area,
        repeat: true,
        ...(k > 0 ? { requiresFlag: FOG(k - 1) } : {}),
        unlessFlag: FOG(k),
        dialogueId: `ch7_fog_ok_${k + 1}`,
      },
      ...(k > 0
        ? [
            {
              id: `ch7_t_fog_bad_${k + 1}`,
              on: 'zone',
              area: l.area,
              repeat: true,
              unlessFlag: FOG(k - 1),
              dialogueId: 'ch7_fog_wrong',
            },
          ]
        : []),
    ]),
  ],
}));

// 13. White bell crypt (hidden B, C12)
const WORDS = [
  vals([NONE, ['me', 'me'], ['me1', 'mẹ'], ['me2', 'mé'], ['me3', 'mè']]),
  vals([NONE, ['cho', 'cho'], ['cho1', 'chờ'], ['cho2', 'chở'], ['cho3', 'chó']]),
  vals([NONE, ['ben', 'ben'], ['ben1', 'bén'], ['ben2', 'bến'], ['ben3', 'bên']]),
];
add('map_ch7_white_bell_crypt', 'Hầm Chuông Trắng', (p) => ({
  interactables: [
    poi('poi_ch7_letter', p.letter, '[E] Đọc lá thư', 'ch7_letter_read', { radius: 30 }),
    poi('poi_ch7_c12', p.read, '[E] Đọc lại lá thư', 'ch7_c12_wrong', {
      dialogueRules: confirmRules(
        'took_mother_golden_hairpin',
        'ch7_c12_done',
        [[['ch7_word_1_me1', 'ch7_word_2_cho1', 'ch7_word_3_ben2'], 'ch7_c12_right']],
        'ch7_c12_empty',
        ['ch7_word_1', 'ch7_word_2', 'ch7_word_3'],
      ),
    }),
    poi('poi_ch7_crypt_back', p.back, '[E] Quay ra', 'ch7_crypt_back'),
  ],
  dials: p.words.map((t, k) => dial(`ch7_word_${k + 1}`, t, `[E] Chữ thứ ${k + 1}`, WORDS[k])),
  triggers: [arrive('ch7_t_crypt', 'ch7_crypt_arrival')],
}));

// 14. Chain cathedral
add('map_ch7_chain_cathedral', 'Thánh Đường Xích Vàng', (p) => ({
  npcs: [
    npc(
      'npc_ch7_forgotten',
      'npc_first_forgotten',
      p.forgotten,
      'Kẻ Bị Quên Đầu Tiên',
      'ch7_forgotten_meet',
      {
        dialogueRules: [
          { ifFlag: 'communed_first_forgotten', dialogueId: 'ch7_forgotten_after' },
          { ifFlag: 'defeated_echo_first_forgotten', dialogueId: 'ch7_forgotten_meet_echo' },
        ],
      },
    ),
  ],
  tileSwaps: [swap('communed_first_forgotten', p.gate, Vc.RUNE)],
  exits: [
    exit('cathedral_to_maze', at(0, 11), 'map_ch7_fog_lullaby_maze', 'from_cathedral'),
    exit('cathedral_to_pass', at(16, 0), 'map_ch7_void_fissure_pass', 'from_cathedral', {
      requiresFlag: 'communed_first_forgotten',
      lockedDialogueId: 'ch7_cathedral_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_cathedral', 'ch7_cathedral_arrival')],
}));

// 15. Void fissure pass (elite)
add('map_ch7_void_fissure_pass', 'Đèo Khe Nứt Hư Không', (p) => ({
  roamers: [
    roamer('ch7_inquisitor', 'enemy_void_inquisitor', p.inquisitor, {
      respawn: false,
      defeatedFlag: 'defeated_void_inquisitor',
    }),
    roamer('ch7_husk_p0', 'enemy_hollow_husk', p.husk),
    roamer('ch7_eater_p0', 'enemy_name_eater', p.eater),
  ],
  tileSwaps: [swap('defeated_void_inquisitor', p.gate, Vc.RUNE)],
  exits: [
    exit('pass_to_cathedral', at(0, 8), 'map_ch7_chain_cathedral', 'from_pass'),
    exit('pass_to_lake', at(29, 8), 'map_ch7_ink_lake_throne', 'from_pass', {
      requiresFlag: 'defeated_void_inquisitor',
      lockedDialogueId: 'ch7_pass_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_pass', 'ch7_pass_arrival')],
}));

// 16. Ink lake throne (boss)
add('map_ch7_ink_lake_throne', 'Hồ Lặng Trái Tim Hư Không', (p) => ({
  npcs: [
    npc('npc_ch7_kuro_after', 'npc_kuro_void', p.kuro_after, 'Kuro', 'ch7_kuro_after', {
      visibleWhen: { flag: 'pacified_void_kuro' },
    }),
    npc('npc_ch7_mother_lake', 'npc_kuro_mother', p.mother, 'Bà Mai', 'ch7_kuro_embrace', {
      visibleWhen: { flag: 'ch7_kuro_embraced' },
    }),
  ],
  encounters: [
    {
      id: 'enc_kuro_void',
      enemyId: 'boss_kuro_void',
      texture: 'boss_kuro_void',
      anim: 'boss_kuro_void_idle',
      tile: p.kuro,
      defeatedFlag: 'pacified_void_kuro',
      hitbox: 30,
      victoryDialogueId: 'ch7_kuro_fight_end',
      victoryDialogueRules: [
        { ifFlag: 'ch7_kuro_embraced', dialogueId: 'ch7_kuro_fight_end_embraced' },
      ],
    },
  ],
  tileSwaps: [swap('pacified_void_kuro', p.gate, Vc.RUNE)],
  exits: [
    exit('lake_to_pass', at(0, 12), 'map_ch7_void_fissure_pass', 'from_lake'),
    exit('lake_to_dawn', at(31, 12), 'map_ch7_cradle_of_dawn', 'from_lake', {
      requiresFlag: 'pacified_void_kuro',
      lockedDialogueId: 'ch7_lake_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch7_t_lake', 'ch7_lake_arrival'),
    zone('ch7_t_kuro_ally', { x: 12, y: 11, w: 9, h: 2 }, 'ch7_kuro_confront_ally', {
      requiresFlag: 'ch6_kuro_ally',
      unlessFlag: 'pacified_void_kuro',
    }),
    zone('ch7_t_kuro_left', { x: 12, y: 11, w: 9, h: 2 }, 'ch7_kuro_confront_left', {
      unlessFlag: 'ch6_kuro_ally',
    }),
  ],
}));

// 17. Cradle of dawn (C10)
add('map_ch7_cradle_of_dawn', 'Chiếc Nôi Rạng Đông', (p) => ({
  interactables: [
    poi('poi_ch7_whisper', p.whisper, '[E] Lắng nghe', 'ch7_forgotten_whisper', { radius: 26 }),
    ...[
      ['a', '[A]', 'ch7_pin_wrong'],
      ['u', '[U]', 'ch7_pin_right'],
      ['o', '[O]', 'ch7_pin_wrong'],
    ].map(([k, glyph, node], i) =>
      poi(`poi_ch7_pin_${k}`, p.pins[i], `[E] Truyền ấn vào chốt ${glyph}`, node, {
        radius: 26,
        dialogueRules: [{ ifFlag: 'stabilized_third_chain', dialogueId: 'ch7_pin_done' }],
      }),
    ),
    poi('poi_ch7_core_crack', p.crack, '[E] Xem khe nứt', 'ch7_core_closed', {
      dialogueRules: [{ ifFlag: 'stabilized_third_chain', dialogueId: 'ch7_core_open' }],
    }),
  ],
  tileSwaps: [swap('stabilized_third_chain', p.gate, Vc.RUNE)],
  exits: [
    exit('dawn_to_lake', at(0, 9), 'map_ch7_ink_lake_throne', 'from_dawn'),
    exit('dawn_to_threshold', at(13, 0), 'map_ch7_null_hour_threshold', 'from_dawn', {
      requiresFlag: 'stabilized_third_chain',
      lockedDialogueId: 'ch7_dawn_exit_locked',
    }),
  ],
  triggers: [arrive('ch7_t_dawn', 'ch7_dawn_arrival')],
}));

// 18. Glass ash core (hidden C, C13)
const VALVE = vals([
  ['trai', 'Nấc Trái'],
  ['giua', 'Nấc Giữa'],
  ['phai', 'Nấc Phải'],
]);
add('map_ch7_glass_ash_core', 'Lõi Tro Thủy Tinh', (p) => ({
  interactables: [
    poi('poi_ch7_valve_table', p.table, '[E] Đọc bảng van', 'ch7_valve_table'),
    poi('poi_ch7_c13', p.balance, '[E] Mở van cân bằng', 'ch7_c13_wrong', {
      dialogueRules: [
        { ifFlag: 'ch7_shade_awake', dialogueId: 'ch7_core_done' },
        {
          ifFlags: ['ch7_valve_1_trai', 'ch7_valve_2_giua', 'ch7_valve_3_phai'],
          dialogueId: 'ch7_c13_right',
        },
      ],
    }),
    poi('poi_ch7_core_back', p.back, '[E] Quay lên', 'ch7_core_back'),
  ],
  dials: p.valves.map((t, k) => dial(`ch7_valve_${k + 1}`, t, `[E] Van ${k + 1}`, VALVE)),
  encounters: [
    {
      id: 'enc_primordial_shade',
      enemyId: 'boss_primordial_shade',
      texture: 'boss_primordial_shade',
      anim: 'boss_primordial_shade_idle',
      tile: p.shade,
      defeatedFlag: 'defeated_primordial_shade',
      hitbox: 30,
      victoryDialogueId: 'ch7_shade_defeated',
      visibleWhen: { flag: 'ch7_shade_awake' },
    },
  ],
  triggers: [
    arrive('ch7_t_core', 'ch7_core_arrival'),
    zone('ch7_t_shade', { x: 9, y: 4, w: 5, h: 1 }, 'ch7_shade_confront', {
      requiresFlag: 'ch7_shade_awake',
      unlessFlag: 'defeated_primordial_shade',
    }),
  ],
}));

// 19. Null hour threshold (end)
add('map_ch7_null_hour_threshold', 'Ngưỡng Cửa Giờ Số Không', (p) => ({
  ambient: { color: '#5a2ab0', alpha: 0.18 },
  triggers: [
    arrive('ch7_t_threshold', 'ch7_threshold_arrival'),
    zone('ch7_t_end', p.edge, 'ch7_end_1'),
  ],
}));

for (const [id, m] of Object.entries(M)) maps.maps[id] = m;
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');
console.log('wired', Object.keys(M).length, 'maps');
