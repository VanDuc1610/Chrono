/**
 * Wires Chapter 5 (CHAPTER_05_DESIGN.md + CHAPTER_05_EXPANSION.md §9) into maps.json: 17 maps with
 * branches, NPCs, dials, puzzles, foes, bosses, gates and triggers. Content comes from
 * scripts/content-ch5.mjs and scripts/content-ch5x.mjs. Idempotent.
 *
 * Usage: node scripts/wire-ch5.mjs
 */
import fs from 'fs';
import * as L from './ch5-layout.js';
import { C } from './coastal-layout.js';

const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));

const TS = {
  interval: {
    tileset: {
      name: 'interval_tileset',
      key: 'interval_tileset',
      path: 'assets/tilesets/interval_tileset.png',
    },
    collision: { fromGid: 4, toGid: 44 },
  },
  steel: {
    tileset: {
      name: 'steel_tileset',
      key: 'steel_tileset',
      path: 'assets/tilesets/steel_tileset.png',
    },
    collision: { fromGid: 4, toGid: 28 },
  },
  coastal: {
    tileset: {
      name: 'coastal_tileset',
      key: 'coastal_tileset',
      path: 'assets/tilesets/coastal_tileset.png',
    },
    collision: { fromGid: 17, toGid: 44 },
  },
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
const dial = (id, tile, prompt, values, extra = {}) => ({
  id,
  tile,
  radius: 36,
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
const living = (id) => ({ flag: `branch_${id}_living` });
const pruned = (id) => ({ flag: `branch_${id}_pruned` });
const sprout = (id, tile) =>
  poi(`poi_${id}_sprout_${tile.x}_${tile.y}`, tile, '[E] Chạm Mầm Rẽ Nhánh', 'ch5_sprout_touch');

const byId = Object.fromEntries(L.CH5_MAPS.map((m) => [m.id, m]));
const M = {};
function add(id, name, extra) {
  const def = byId[id];
  const layout = def.build();
  const branchy = !!layout.extraLayers?.Walls_Pruned;
  M[id] = {
    id,
    name,
    chapter: 5,
    tilemap: { key: id, path: `assets/maps/${id}.json` },
    ...TS[def.tileset],
    layers: { ground: 'Ground', walls: 'Walls' },
    bgm: 'ambient',
    spawns: layout.spawns,
    revive: layout.spawns.revive ?? layout.spawns.default,
    ...(branchy
      ? {
          branches: true,
          layerVariants: [{ when: pruned(id), ground: 'Ground_Pruned', walls: 'Walls_Pruned' }],
        }
      : {}),
    npcs: [],
    interactables: [],
    ...extra(layout.points, layout, id),
  };
}

// 1. Interval shore
add('map_ch5_interval_shore', 'Bờ Vực Interval', (p, _l, id) => ({
  ambient: { color: '#7a5cff', alpha: 0.12 },
  npcs: [
    npc('npc_ch5_kuro_shore', 'npc_kuro', p.kuro, 'Kuro', 'ch5_kuro_meet', {
      visibleWhen: { unlessFlag: 'kuro_with_peter' },
    }),
  ],
  interactables: [sprout(id, p.sprout), sprout(id, p.sprout_east)],
  exits: [
    exit('shore_to_garden', { x: 23, y: 7, w: 1, h: 1 }, 'map_ch5_seed_garden', 'from_shore', {
      requiresFlag: 'met_kuro_interval',
      lockedDialogueId: 'ch5_shore_kuro_first',
    }),
  ],
  triggers: [
    arrive('ch5_t_shore', 'ch5_arrival'),
    zone('ch5_t_sprout', { x: 5, y: 3, w: 5, h: 8 }, 'ch5_sprout_intro', {
      requiresFlag: 'met_kuro_interval',
    }),
  ],
}));

// 2. Seed garden
const ROCK = Object.entries(L.ROCK_SPOTS);
add('map_ch5_seed_garden', 'Vườn Hạt Khả Năng', (p, _l, id) => ({
  ambient: { color: '#9a7aff', alpha: 0.1 },
  fallbackSpawn: 'gap_west',
  interactables: [
    sprout(id, p.sprout),
    sprout(id, p.sprout_court),
    poi('poi_ch5_garden_plank', p.plank, '[E] Nhặt tấm ván', 'ch5_plank_take_garden', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5_garden_gap', p.gap, '[E] Xem khe nứt', 'ch5_gap_inspect', {
      dialogueRules: [
        { ifFlag: `branch_${id}_pruned`, dialogueId: 'ch5_gap_pruned_void' },
        { ifItem: 'pruned_plank', dialogueId: 'ch5_gap_place_shadow' },
      ],
    }),
    poi('poi_ch5_old_seeds', p.old_seeds, '[E] Xem luống đất nhỏ', 'ch5_old_seeds_offer', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5_uprooted', p.uprooted, '[E] Xem lối mòn', 'ch5_uprooted_path_hidden', {
      dialogueRules: [
        {
          ifItems: [
            'seed_spring_old',
            'seed_summer',
            'seed_autumn',
            'seed_winter',
            'seed_spring_new',
          ],
          dialogueId: 'ch5_uprooted_path_open',
        },
      ],
    }),
    poi('poi_ch5_seed_spring_old', p.seed, '[E] Nhặt hạt giống', 'ch5_seed_spring_old_take', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5x_rock_pruned', p.rock, '[E] Xem khối sa thạch', 'ch5x_rock_pruned', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5x_sensor', p.sensor, '[E] Xem bệ cảm ứng', 'ch5x_sensor_living', {
      dialogueRules: [
        { ifFlag: 'ch5x_ex1_solved', dialogueId: 'ch5x_ex1_done' },
        { ifFlags: [`branch_${id}_pruned`, 'ch5x_rock_south'], dialogueId: 'ch5x_ex1_solved' },
        { ifFlag: `branch_${id}_pruned`, dialogueId: 'ch5x_sensor_wrong' },
      ],
    }),
    poi('poi_ch5x_sun_stele', p.sun_stele, '[E] Đọc tấm bia', 'ch5x_sun_stele'),
  ],
  dials: [
    dial(
      'ch5x_rock',
      p.rock,
      '[E] Đẩy khối đá',
      vals([
        ['north', 'Bệ Bắc'],
        ['east', 'Bệ Đông'],
        ['south', 'Bệ Nam'],
        ['west', 'Bệ Tây'],
      ]),
      {
        visibleWhen: living(id),
      },
    ),
  ],
  tileSwaps: [
    {
      when: { flag: 'ch5_garden_shadow_plank' },
      layer: 'walls',
      tiles: [{ x: 16, y: 8 }],
      index: L.I.SHADOW,
    },
    ...ROCK.map(([dir, [x, y]]) => ({
      when: { flag: `ch5x_rock_${dir}` },
      layer: 'walls',
      tiles: [{ x, y }],
      index: L.I.PILLAR,
    })),
  ],
  roamers: [
    roamer('r_ch5_garden_phantom_a', 'enemy_branch_phantom', p.phantom_a),
    roamer('r_ch5_garden_phantom_b', 'enemy_branch_phantom', p.phantom_b),
    roamer('r_ch5_garden_gardener', 'enemy_chronos_gardener', p.gardener),
  ],
  exits: [
    exit('garden_to_shore', { x: 0, y: 8, w: 1, h: 1 }, 'map_ch5_interval_shore', 'from_garden'),
    exit('garden_to_alpha', { x: 27, y: 8, w: 1, h: 1 }, 'map_ch5_alpha_town', 'from_garden', {
      requiresFlag: 'ch5_crossed_garden',
      lockedDialogueId: 'ch5_garden_exit_locked',
    }),
    exit(
      'garden_to_greenhouse',
      { x: 27, y: 3, w: 1, h: 1 },
      'map_ch5_glass_greenhouse',
      'from_garden',
      {
        requiresFlag: 'ch5x_ex1_solved',
        lockedDialogueId: 'ch5x_greenhouse_locked',
      },
    ),
  ],
  triggers: [
    arrive('ch5_t_garden', 'ch5_garden_arrival'),
    zone('ch5_t_cat', { x: 8, y: 6, w: 4, h: 5 }, 'ch5_kuro_story_cat', {
      requiresFlag: 'met_kuro_interval',
    }),
    zone('ch5_t_paradox', { x: 13, y: 6, w: 2, h: 5 }, 'ch5_paradox_intro'),
    zone('ch5_t_crossed', { x: 18, y: 7, w: 2, h: 3 }, 'ch5_garden_crossed'),
    zone('ch5_t_gardener', { x: 20, y: 9, w: 5, h: 4 }, 'ch5_gardener_first'),
    zone('ch5x_t_shadow', { x: 19, y: 2, w: 5, h: 4 }, 'ch5x_kuro_shadow_hint', {
      requiresFlag: 'met_kuro_interval',
    }),
  ],
}));

// 3. Glass greenhouse
const HOOK = vals([
  NONE,
  ['bronze', 'Chuông đồng'],
  ['silver', 'Chuông bạc'],
  ['glass', 'Chuông thủy tinh'],
]);
const CHIMES = ['windchime_bronze', 'windchime_silver', 'windchime_glass'];
add('map_ch5_glass_greenhouse', 'Nhà Kính Ký Ức', (p, _l, id) => ({
  ambient: { color: '#8ad8c8', alpha: 0.08 },
  interactables: [
    sprout(id, p.sprout),
    poi('poi_ch5x_flower', p.flower, '[E] Xem Nguyệt Thảo', 'ch5x_flower_living', {
      dialogueRules: [{ ifFlag: `branch_${id}_pruned`, dialogueId: 'ch5x_flower_pruned' }],
    }),
    poi('poi_ch5x_journal', p.journal, '[E] Xem cuốn nhật ký', 'ch5x_journal_take'),
    poi('poi_ch5x_pump', p.pump, '[E] Bơm vi khí hậu', 'ch5x_weather_wrong', {
      dialogueRules: [
        { ifFlag: 'ch5x_weather_balanced', dialogueId: 'ch5x_weather_done' },
        {
          ifFlags: ['ch5x_humidity_mist', 'ch5x_temperature_mild', 'ch5x_airflow_breeze'],
          dialogueId: 'ch5x_weather_success',
        },
      ],
    }),
    poi('poi_ch5x_chime_bronze', p.chime_bronze, '[E] Nhặt chuông gió', 'ch5x_chime_bronze_take'),
    poi('poi_ch5x_chime_silver', p.chime_silver, '[E] Nhặt chuông gió', 'ch5x_chime_silver_take'),
    poi('poi_ch5x_chime_glass', p.chime_glass, '[E] Nhặt chuông gió', 'ch5x_chime_glass_take'),
    poi('poi_ch5x_statue', p.ring_up, '[E] Xem bức tượng', 'ch5x_gardener_statue', {
      requiresFlag: 'ch5x_weather_balanced',
      dialogueRules: [
        { ifFlag: 'pacified_the_gardener', dialogueId: 'ch5x_chimes_done' },
        {
          ifItems: CHIMES,
          ifFlags: ['ch5x_hook_1_bronze', 'ch5x_hook_2_silver', 'ch5x_hook_3_glass'],
          dialogueId: 'ch5x_gardener_peace',
        },
        { ifItems: CHIMES, dialogueId: 'ch5x_chimes_wrong' },
      ],
    }),
  ],
  dials: [
    dial(
      'ch5x_humidity',
      p.humidity,
      '[E] Van Độ Ẩm',
      vals([
        ['none', '(chưa chỉnh)'],
        ['arid', 'Khô cằn'],
        ['rain', 'Mưa rào'],
        ['mist', 'Sương mù'],
      ]),
    ),
    dial(
      'ch5x_temperature',
      p.temperature,
      '[E] Van Nhiệt Độ',
      vals([
        ['none', '(chưa chỉnh)'],
        ['freeze', 'Băng giá'],
        ['mild', 'Ôn hòa'],
        ['scorching', 'Nắng gắt'],
      ]),
    ),
    dial(
      'ch5x_airflow',
      p.airflow,
      '[E] Van Dòng Khí',
      vals([
        ['none', '(chưa chỉnh)'],
        ['gale', 'Gió lốc'],
        ['still', 'Tĩnh lặng'],
        ['breeze', 'Gió thoảng'],
      ]),
    ),
    dial('ch5x_hook_1', p.hook_1, '[E] Móc treo 1', HOOK, {
      requiresItems: CHIMES,
      requiresFlag: 'ch5x_weather_balanced',
    }),
    dial('ch5x_hook_2', p.hook_2, '[E] Móc treo 2', HOOK, {
      requiresItems: CHIMES,
      requiresFlag: 'ch5x_weather_balanced',
    }),
    dial('ch5x_hook_3', p.hook_3, '[E] Móc treo 3', HOOK, {
      requiresItems: CHIMES,
      requiresFlag: 'ch5x_weather_balanced',
    }),
  ],
  roamers: [
    roamer('r_ch5x_greenhouse_gardener', 'enemy_chronos_gardener', p.gardener, {
      visibleWhen: { unlessFlag: 'pacified_the_gardener' },
    }),
    roamer('r_ch5x_greenhouse_phantom', 'enemy_branch_phantom', p.phantom),
  ],
  exits: [
    exit(
      'greenhouse_to_garden',
      { x: 0, y: 8, w: 1, h: 1 },
      'map_ch5_seed_garden',
      'from_greenhouse',
    ),
  ],
  triggers: [arrive('ch5x_t_greenhouse', 'ch5x_greenhouse_arrival')],
}));

// 4. Alpha town
add('map_ch5_alpha_town', 'Khánh Hòa Ở Lại', (p) => ({
  ambient: { color: '#ffd8a0', alpha: 0.06 },
  npcs: [
    npc('npc_ch5_coba', 'npc_vendor_ba', p.coba, 'Cô Ba', 'ch5_coba_alpha', {
      dialogueRules: [
        {
          ifItem: 'na_origami_crane_scrap',
          unlessFlag: 'completed_na_crane_quest',
          dialogueId: 'ch5x_coba_crane_talk',
        },
      ],
    }),
    npc('npc_ch5_na', 'npc_forgotten_child', p.na, 'Bé Na', 'ch5_na', {
      anim: 'npc_forgotten_child_flicker',
      tint: '#ffe0c8',
      dialogueRules: [
        { ifFlag: 'completed_na_crane_quest', dialogueId: 'ch5x_na_after' },
        { ifItem: 'thousandth_paper_crane', dialogueId: 'ch5x_na_place_crane' },
      ],
    }),
  ],
  interactables: [
    poi('poi_ch5_rhyme', p.rhyme, '[E] Đọc chữ phấn trên tường', 'ch5_rhyme'),
    poi('poi_ch5_chalk_blue', p.chalk_blue, '[E] Nhặt mẩu phấn', 'ch5_chalk_blue_take'),
    poi('poi_ch5_chalk_gold', p.chalk_gold, '[E] Nhặt mẩu phấn', 'ch5_chalk_gold_take'),
    poi('poi_ch5_seed_summer', p.seed, '[E] Nhặt hạt giống', 'ch5_seed_summer_take'),
  ],
  tileSwaps: [
    {
      when: { flag: 'opened_alpha_safe' },
      layer: 'walls',
      tiles: L.ALPHA_TOWER_GATE,
      index: C.PATH,
    },
  ],
  exits: [
    exit('alpha_to_garden', { x: 0, y: 8, w: 1, h: 2 }, 'map_ch5_seed_garden', 'from_alpha'),
    exit('alpha_to_shop', { x: 6, y: 6, w: 1, h: 1 }, 'map_ch5_alpha_clockshop', 'from_town'),
    exit('alpha_to_harbor', { x: 22, y: 17, w: 2, h: 1 }, 'map_ch5_alpha_harbor', 'from_town'),
    exit('alpha_to_tower', { x: 14, y: 0, w: 2, h: 1 }, 'map_ch5_pruner_tower', 'from_town', {
      requiresFlag: 'opened_alpha_safe',
      lockedDialogueId: 'ch5_tower_locked',
    }),
  ],
  triggers: [
    arrive('ch5_t_alpha', 'ch5_alpha_arrival'),
    zone('ch5_t_kuro_alpha', { x: 3, y: 7, w: 4, h: 4 }, 'ch5_kuro_alpha'),
  ],
}));

// 5. Alpha harbour
const SKY = vals([
  NONE,
  ['sun', 'Mặt trời cười'],
  ['gulls', 'Đàn hải âu'],
  ['lighthouse', 'Ngọn hải đăng'],
  ['sail', 'Cánh buồm'],
]);
add('map_ch5_alpha_harbor', 'Bến Thuyền Vắng Lặng', (p, _l, id) => ({
  ambient: { color: '#a0d8ff', alpha: 0.06 },
  npcs: [
    npc('npc_ch5x_coba_harbor', 'npc_vendor_ba', p.coba, 'Cô Ba', 'ch5x_coba_harbor', {
      visibleWhen: living(id),
    }),
  ],
  interactables: [
    sprout(id, p.sprout),
    poi('poi_ch5x_chalk_living', p.chalk_living, '[E] Xem bức vẽ phấn', 'ch5x_chalk_living', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5x_chalk_pruned', p.chalk_pruned, '[E] Xem vách gỗ gãy', 'ch5x_chalk_pruned', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5x_drawing', p.confirm, '[E] Tô lại bầu trời', 'ch5x_chalk_wrong', {
      dialogueRules: [
        { ifFlag: 'ch5x_chalk_solved', dialogueId: 'ch5x_chalk_done' },
        {
          ifFlags: [
            'ch5x_sky_1_sun',
            'ch5x_sky_2_gulls',
            'ch5x_sky_3_lighthouse',
            'ch5x_sky_4_sail',
          ],
          dialogueId: 'ch5x_chalk_success',
        },
      ],
    }),
  ],
  dials: [1, 2, 3, 4].map((n) =>
    dial(`ch5x_sky_${n}`, p[`slot_${n}`], `[E] Ô tranh ${['I', 'II', 'III', 'IV'][n - 1]}`, SKY),
  ),
  exits: [exit('harbor_to_town', { x: 11, y: 0, w: 2, h: 1 }, 'map_ch5_alpha_town', 'from_harbor')],
  triggers: [arrive('ch5x_t_harbor', 'ch5x_harbor_arrival')],
}));

// 6. Clock shop of two worlds
const CLOCKS = ['wedding', 'daughter', 'grandpa', 'sea', 'shop'];
add('map_ch5_alpha_clockshop', 'Tiệm Đồng Hồ Hai Thế Giới', (p, _l, id) => ({
  interactables: [
    sprout(id, p.sprout),
    ...CLOCKS.map((c) =>
      poi(`poi_ch5_clock_${c}`, p[`clock_${c}`], '[E] Xem đồng hồ', `ch5_clock_${c}`, {
        radius: 30,
        dialogueRules: [{ ifFlag: `branch_${id}_pruned`, dialogueId: `ch5_clock_${c}_pruned` }],
      }),
    ),
    poi('poi_ch5_photo', p.photo, '[E] Xem tấm ảnh', 'ch5_wedding_photo', {
      dialogueRules: [{ ifFlag: `branch_${id}_pruned`, dialogueId: 'ch5_wedding_photo_pruned' }],
    }),
    poi('poi_ch5_drawer', p.drawer, '[E] Mở ngăn kéo', 'ch5_safe_note_take', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5_safe', p.safe, '[E] Mở két sắt', 'ch5_safe_wrong', {
      dialogueRules: [
        { ifFlag: 'opened_alpha_safe', dialogueId: 'ch5_safe_open_again' },
        { ifFlag: `branch_${id}_pruned`, dialogueId: 'ch5_safe_pruned' },
        { ifFlags: ['ch5_safe_h_7', 'ch5_safe_m_30'], dialogueId: 'ch5_safe_open' },
      ],
    }),
    poi('poi_ch5x_paper', p.paper, '[E] Lục ngăn tủ', 'ch5x_paper_take', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5x_bench', p.bench, '[E] Ngồi vào bàn thợ', 'ch5x_bench_idle', {
      dialogueRules: [{ ifItem: 'origami_paper_cyan', dialogueId: 'ch5x_bench_fold' }],
    }),
  ],
  dials: [
    dial(
      'ch5_safe_h',
      p.dial_hour,
      '[E] Vòng Giờ',
      vals(Array.from({ length: 12 }, (_, i) => [String(i + 1), `${i + 1} giờ`])),
      {
        visibleWhen: living(id),
      },
    ),
    dial(
      'ch5_safe_m',
      p.dial_minute,
      '[E] Vòng Phút',
      vals([
        ['00', '00 phút'],
        ['15', '15 phút'],
        ['30', '30 phút'],
        ['45', '45 phút'],
      ]),
      {
        visibleWhen: living(id),
      },
    ),
  ],
  exits: [exit('shop_to_town', { x: 7, y: 11, w: 1, h: 1 }, 'map_ch5_alpha_town', 'from_shop')],
  triggers: [arrive('ch5_t_shop', 'ch5_shop_arrival')],
}));

// 7. Pruner's tower
add('map_ch5_pruner_tower', 'Vọng Lâu Kẻ Tỉa Cành', (p) => ({
  ambient: { color: '#e8e8ff', alpha: 0.06 },
  npcs: [
    ['x', p.ghost_x, 'Dư Ảnh X'],
    ['y', p.ghost_y, 'Dư Ảnh Y'],
    ['z', p.ghost_z, 'Dư Ảnh Z'],
  ].map(([k, tile, name]) =>
    npc(`npc_ch5x_ghost_${k}`, 'enemy_branch_phantom', tile, name, `ch5x_ghost_${k}`, {
      alpha: 0.7,
      tint: '#d8d0ff',
    }),
  ),
  interactables: [
    poi('poi_ch5x_witness_stele', p.stele, '[E] Đọc bia đá', 'ch5x_witness_stele'),
    poi('poi_ch5x_accuse', p.accuse, '[E] Chỉ định người giữ chìa', 'ch5x_witness_wrong', {
      dialogueRules: [
        { ifFlag: 'ch5x_witness_solved', dialogueId: 'ch5x_witness_done' },
        { ifFlag: 'ch5x_accuse_z', dialogueId: 'ch5x_witness_success' },
      ],
    }),
    poi('poi_ch5x_attic', p.attic, '[E] Cửa gác thượng', 'ch5x_attic_locked', {
      dialogueRules: [
        { ifFlag: 'opened_pruner_attic', dialogueId: 'ch5x_attic_done' },
        { ifItem: 'conscience_iron_key', dialogueId: 'ch5x_attic_open' },
      ],
    }),
  ],
  dials: [
    dial(
      'ch5x_accuse',
      p.accuse_dial,
      '[E] Chọn dư ảnh',
      vals([NONE, ['x', 'Dư ảnh X'], ['y', 'Dư ảnh Y'], ['z', 'Dư ảnh Z']]),
    ),
  ],
  encounters: [
    {
      id: 'enc_other_peter',
      enemyId: 'boss_other_peter',
      texture: 'boss_other_peter',
      anim: 'boss_other_peter_idle',
      tile: p.other_peter,
      defeatedFlag: 'defeated_other_peter',
      hitbox: 30,
      victoryDialogueId: 'ch5_other_peter_defeated',
    },
  ],
  exits: [
    exit('tower_to_town', { x: 11, y: 15, w: 1, h: 1 }, 'map_ch5_alpha_town', 'from_tower'),
    exit('tower_to_beta', { x: 21, y: 8, w: 1, h: 1 }, 'map_ch5_beta_city', 'from_tower', {
      requiresFlag: 'resolved_alpha_letter',
      lockedDialogueId: 'ch5_tower_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch5_t_tower', 'ch5_tower_arrival'),
    zone('ch5_t_other_peter', { x: 7, y: 12, w: 9, h: 1 }, 'ch5_other_peter_confront', {
      unlessFlag: 'defeated_other_peter',
    }),
    zone('ch5_t_react_spared', { x: 1, y: 2, w: 20, h: 13 }, 'ch5_kuro_reacts_spared', {
      requiresFlag: 'ch5_choice_alpha_spared',
    }),
    zone('ch5_t_react_letter', { x: 1, y: 2, w: 20, h: 13 }, 'ch5_kuro_reacts_letter', {
      requiresFlag: 'ch5_choice_alpha_letter',
    }),
    zone('ch5_t_song', { x: 1, y: 2, w: 20, h: 13 }, 'ch5_kuro_story_song', {
      requiresFlag: 'ch5_t_react_letter_seen',
    }),
    zone('ch5_t_song2', { x: 1, y: 2, w: 20, h: 13 }, 'ch5_kuro_story_song', {
      requiresFlag: 'ch5_t_react_spared_seen',
      unlessFlag: 'took_kuro_ledger_page_2',
    }),
  ],
}));

// 8. Steel city
const CELL = L.betaCity().cells;
add('map_ch5_beta_city', 'Thành Phố Đồng Hồ Thép', (p, _l, id) => ({
  ambient: { color: '#ff9a50', alpha: 0.06 },
  fallbackSpawn: 'bridge_start',
  interactables: [
    sprout(id, p.sprout),
    poi('poi_ch5_plank_a', p.plank_a, '[E] Nhặt tấm ván', 'ch5_plank_pruned_a_take', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5_plank_b', p.plank_b, '[E] Nhặt tấm ván', 'ch5_plank_pruned_b_take', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5_plank_living', p.plank_living, '[E] Nhặt tấm ván', 'ch5_plank_living_take', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5_bridge_log', p.log, '[E] Xem cuốn sổ', 'ch5_bridge_log_take'),
    poi('poi_ch5_seed_autumn', p.seed, '[E] Nhặt hạt giống', 'ch5_seed_autumn_take'),
    poi('poi_ch5_chalk_red', p.chalk_red, '[E] Nhặt mẩu phấn', 'ch5_chalk_red_take'),
    ...[3, 6, 9].map((k) =>
      poi(`poi_ch5_cell_${k}`, CELL[k], '[E] Xem khoảng trống', 'ch5_cell_inspect', {
        radius: 40,
        dialogueRules: [
          { ifFlag: `ch5_cell_${k}_p`, dialogueId: 'ch5_cell_done' },
          { ifFlag: `branch_${id}_living`, dialogueId: 'ch5_cell_living' },
          { ifItem: 'pruned_plank', dialogueId: `ch5_cell_${k}_place` },
          { ifItem: 'living_plank', dialogueId: `ch5_cell_${k}_shadow` },
        ],
      }),
    ),
  ],
  tileSwaps: [3, 6, 9].flatMap((k) => [
    {
      when: { flag: `ch5_cell_${k}_p`, unlessFlag: `branch_${id}_living` },
      layer: 'walls',
      tiles: [CELL[k]],
      index: L.St.PLANK,
    },
    {
      when: { flag: `ch5_cell_${k}_shadow`, unlessFlag: `branch_${id}_living` },
      layer: 'walls',
      tiles: [CELL[k]],
      index: L.St.SHADOW,
    },
  ]),
  roamers: [
    roamer('r_ch5_beta_cocoon_a', 'enemy_unborn_cocoon', p.cocoon_a),
    roamer('r_ch5_beta_cocoon_b', 'enemy_unborn_cocoon', p.cocoon_b),
    roamer('r_ch5_beta_horror', 'enemy_unborn_horror', p.horror),
    roamer('r_ch5_beta_gardener', 'enemy_chronos_gardener', p.gardener),
  ],
  exits: [
    exit('beta_to_tower', { x: 0, y: 8, w: 1, h: 1 }, 'map_ch5_pruner_tower', 'from_beta'),
    exit('beta_to_reactor', { x: 29, y: 8, w: 1, h: 1 }, 'map_ch5_chronos_reactor', 'from_beta', {
      requiresFlag: 'crossed_quantum_bridge',
      lockedDialogueId: 'ch5_beta_exit_locked',
    }),
    exit(
      'beta_to_observatory',
      { x: 28, y: 1, w: 1, h: 1 },
      'map_ch5_observatory_ruins',
      'from_beta',
    ),
  ],
  triggers: [
    arrive('ch5_t_beta', 'ch5_beta_arrival'),
    zone('ch5_t_kuro_beta', { x: 3, y: 6, w: 4, h: 5 }, 'ch5_kuro_beta'),
    zone('ch5_t_bridge_crossed', { x: 20, y: 7, w: 2, h: 3 }, 'ch5_bridge_crossed'),
  ],
}));

// 9. Observatory
add('map_ch5_observatory_ruins', 'Đài Thiên Văn Đảo Ngược', (p, _l, id) => ({
  ambient: { color: '#9ab8ff', alpha: 0.08 },
  interactables: [
    sprout(id, p.sprout),
    poi('poi_ch5x_lens_living', p.lens_living, '[E] Nhặt thấu kính', 'ch5x_lens_living_take', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5x_lens_pruned', p.lens_pruned, '[E] Nhặt thấu kính', 'ch5x_lens_pruned_take', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5x_log_1', p.log_1, '[E] Xem bàn đọc', 'ch5x_log_1_take', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5x_log_2', p.log_2, '[E] Bới đống đổ nát', 'ch5x_log_2_take', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5x_telescope', p.telescope, '[E] Chiếu tiêu điểm', 'ch5x_telescope_missing', {
      dialogueRules: [
        { ifFlag: 'ch5x_observatory_aligned', dialogueId: 'ch5x_telescope_done' },
        {
          ifItems: ['astronomy_lens_living', 'astronomy_lens_pruned'],
          ifFlag: 'ch5x_angle_a90',
          dialogueId: 'ch5x_telescope_success',
        },
        {
          ifItems: ['astronomy_lens_living', 'astronomy_lens_pruned'],
          dialogueId: 'ch5x_telescope_wrong',
        },
      ],
    }),
  ],
  dials: [
    dial(
      'ch5x_angle',
      p.angle,
      '[E] Vành góc nghiêng',
      vals([NONE, ['a30', '30°'], ['a60', '60°'], ['a90', '90°'], ['a120', '120°']]),
    ),
  ],
  roamers: [roamer('r_ch5x_observatory_crystal', 'enemy_paradox_crystal', p.crystal)],
  exits: [
    exit(
      'observatory_to_beta',
      { x: 10, y: 13, w: 1, h: 1 },
      'map_ch5_beta_city',
      'from_observatory',
    ),
  ],
  triggers: [arrive('ch5x_t_observatory', 'ch5x_observatory_arrival')],
}));

// 10. Chronos reactor
const ONOFF = vals([
  ['off', 'Tắt'],
  ['on', 'Bật'],
]);
add('map_ch5_chronos_reactor', 'Lò Phản Ứng Chronos', (p, _l, id) => ({
  ambient: { color: '#ff8a3a', alpha: 0.08 },
  npcs: [
    npc('npc_ch5_ivo', 'npc_ivo', p.ivo, 'Kỹ Sư Ivo', 'ch5_ivo_meet', {
      visibleWhen: living(id),
      dialogueRules: [
        { ifFlag: 'resolved_ivo_redemption', dialogueId: 'ch5x_ivo_after' },
        { ifItem: 'council_override_decree', dialogueId: 'ch5x_ivo_vindication' },
        {
          ifFlag: 'restarted_reactor',
          unlessFlag: 'ivo_guilt_heard',
          dialogueId: 'ch5x_ivo_guilt_talk',
        },
        { ifFlag: 'met_ivo', dialogueId: 'ch5_ivo_again' },
      ],
    }),
  ],
  interactables: [
    sprout(id, p.sprout),
    poi('poi_ch5_reactor_start', p.start, '[E] Khởi động lò', 'ch5_reactor_wrong', {
      dialogueRules: [
        { ifFlag: 'restarted_reactor', dialogueId: 'ch5_reactor_done' },
        { ifFlag: 'ch5_sw_a_l_on', dialogueId: 'ch5_reactor_wrong' },
        { ifFlag: 'ch5_sw_b_p_on', dialogueId: 'ch5_reactor_wrong' },
        { ifFlag: 'ch5_sw_c_p_on', dialogueId: 'ch5_reactor_wrong' },
        {
          ifFlags: ['ch5_sw_b_l_on', 'ch5_sw_c_l_on', 'ch5_sw_a_p_on'],
          dialogueId: 'ch5_reactor_start',
        },
      ],
    }),
    poi('poi_ch5_warning_plate', p.plate, '[E] Xem tấm biển', 'ch5_warning_plate_take', {
      visibleWhen: pruned(id),
    }),
    poi('poi_ch5_wiring', p.wiring, '[E] Xem tủ điện', 'ch5_wiring_take', {
      visibleWhen: living(id),
    }),
    poi('poi_ch5x_black_box', p.black_box, '[E] Bới đống đổ nát', 'ch5x_black_box_sealed', {
      visibleWhen: pruned(id),
      dialogueRules: [{ ifFlag: 'ivo_guilt_heard', dialogueId: 'ch5x_black_box_take' }],
    }),
  ],
  dials: ['a', 'b', 'c'].flatMap((m) => [
    dial(`ch5_sw_${m}_l`, p[`sw_${m}`], `[E] Công tắc máy ${m.toUpperCase()}`, ONOFF, {
      visibleWhen: living(id),
    }),
    dial(`ch5_sw_${m}_p`, p[`sw_${m}`], `[E] Công tắc máy ${m.toUpperCase()}`, ONOFF, {
      visibleWhen: pruned(id),
    }),
  ]),
  tileSwaps: [
    {
      when: { flag: 'restarted_reactor' },
      layer: 'walls',
      tiles: L.REACTOR_GATE,
      index: L.St.ENGRAVED,
    },
  ],
  roamers: [
    roamer('r_ch5_reactor_crystal', 'enemy_paradox_crystal', p.crystal),
    roamer('r_ch5_reactor_phantom', 'enemy_branch_phantom', p.phantom),
  ],
  exits: [
    exit('reactor_to_beta', { x: 0, y: 8, w: 1, h: 1 }, 'map_ch5_beta_city', 'from_reactor'),
    exit(
      'reactor_to_shelter',
      { x: 25, y: 8, w: 1, h: 1 },
      'map_ch5_children_shelter',
      'from_reactor',
      {
        requiresFlag: 'restarted_reactor',
        lockedDialogueId: 'ch5_reactor_exit_locked',
      },
    ),
  ],
}));

// 11. Children's shelter
const NOTE = vals([
  NONE,
  ['metal', 'Kim Loại'],
  ['wood', 'Gỗ Mục'],
  ['glass', 'Thủy Tinh'],
  ['wind', 'Gió Hư Không'],
  ['water', 'Nước Chảy'],
]);
const CHALKS = ['chalk_blue', 'chalk_gold', 'chalk_red', 'chalk_white'];
add('map_ch5_children_shelter', 'Hầm Trú Ẩn Trẻ Em', (p) => ({
  ambient: { color: '#ffc890', alpha: 0.06 },
  npcs: [
    npc('npc_ch5_mira', 'npc_mira', p.mira, 'Mira', 'ch5_mira_meet', {
      dialogueRules: [
        { ifFlag: 'finished_chalk_sky', dialogueId: 'ch5_mira_after' },
        { ifItems: CHALKS, dialogueId: 'ch5_mira_chalk_done' },
        { ifFlag: 'met_mira', dialogueId: 'ch5_mira_again' },
      ],
    }),
    npc('npc_ch5_ivo_shelter', 'npc_ivo', p.ivo, 'Kỹ Sư Ivo', 'ch5_ivo_shelter'),
  ],
  interactables: [
    poi('poi_ch5x_poem', p.poem, '[E] Đọc bài thơ trên vách', 'ch5x_poem_wall'),
    poi('poi_ch5x_notes', p.notes, '[E] Xem cuốn sổ nhỏ', 'ch5x_mira_notes_take'),
    poi('poi_ch5x_piano_metal', { x: 11, y: 11 }, '[E] Thử phím Kim Loại', 'ch5x_piano_metal', {
      radius: 30,
    }),
    poi('poi_ch5x_play', p.play, '[E] Phát âm chuỗi', 'ch5x_piano_wrong', {
      radius: 30,
      dialogueRules: [
        { ifFlag: 'ch5x_piano_melody_played', dialogueId: 'ch5x_piano_done' },
        {
          ifFlags: [
            'ch5x_note_1_wind',
            'ch5x_note_2_water',
            'ch5x_note_3_glass',
            'ch5x_note_4_glass',
            'ch5x_note_5_glass',
          ],
          dialogueId: 'ch5x_piano_success',
        },
      ],
    }),
    poi('poi_ch5_seed_spring_new', p.seed, '[E] Nhặt hạt giống', 'ch5_seed_spring_new_take'),
  ],
  dials: [1, 2, 3, 4, 5].map((n) => dial(`ch5x_note_${n}`, p[`note_${n}`], `[E] Nốt ${n}`, NOTE)),
  exits: [
    exit(
      'shelter_to_reactor',
      { x: 0, y: 7, w: 1, h: 1 },
      'map_ch5_chronos_reactor',
      'from_shelter',
    ),
    exit('shelter_to_grey', { x: 19, y: 7, w: 1, h: 1 }, 'map_ch5_grey_prune', 'from_shelter', {
      requiresFlag: 'met_mira',
      lockedDialogueId: 'ch5_shelter_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch5_t_shelter', 'ch5_shelter_arrival'),
    zone('ch5_t_promise', { x: 1, y: 2, w: 18, h: 11 }, 'ch5_kuro_story_promise', {
      requiresFlag: 'met_mira',
    }),
    zone('ch5_t_resolve', { x: 1, y: 2, w: 18, h: 11 }, 'ch5_kuro_resolve', {
      requiresFlag: 'took_kuro_ledger_page_3',
    }),
  ],
}));

// 12. Grey prune
const SAND = [0, 1, 2, 3, 4, 5];
add('map_ch5_grey_prune', 'Vùng Xám Tỉa Bỏ', (p, _l, id) => ({
  ambient: { color: '#b8b8c8', alpha: 0.12 },
  interactables: [
    sprout(id, p.sprout),
    poi('poi_ch5_p_silver', p.p_silver, '[E] Lắng nghe bức chân dung', 'ch5_portrait_silver'),
    poi('poi_ch5_p_copper', p.p_copper, '[E] Lắng nghe bức chân dung', 'ch5_portrait_copper'),
    poi('poi_ch5_p_iron', p.p_iron, '[E] Lắng nghe bức chân dung', 'ch5_portrait_iron'),
    poi('poi_ch5_genealogy', p.genealogy, '[E] Xem phả hệ', 'ch5_genealogy_take'),
    poi('poi_ch5_grey_stele', p.stele, '[E] Đọc bia đá', 'ch5_grey_stele_take'),
    poi('poi_ch5_heir_call', p.call, '[E] Gọi tên người thừa kế', 'ch5_heir_wrong', {
      dialogueRules: [
        { ifFlag: 'named_unborn_heir', dialogueId: 'ch5_heir_again' },
        { ifFlag: 'ch5_heir_aurel', dialogueId: 'ch5_heir_named' },
      ],
    }),
    poi('poi_ch5_chalk_white', p.chalk_white, '[E] Nhặt mẩu phấn', 'ch5_chalk_white_take'),
    poi('poi_ch5_seed_winter', p.seed, '[E] Nhặt hạt giống', 'ch5_seed_winter_take'),
    poi('poi_ch5x_hourglass_flip', p.flip, '[E] Lật đồng hồ cát', 'ch5x_sand_l_0', {
      dialogueRules: [
        { ifFlag: 'ch5x_hourglass_balanced', dialogueId: 'ch5x_hourglass_done' },
        ...SAND.flatMap((k) => [
          { ifFlags: [`branch_${id}_living`, `ch5x_sand_${k}`], dialogueId: `ch5x_sand_l_${k}` },
          { ifFlags: [`branch_${id}_pruned`, `ch5x_sand_${k}`], dialogueId: `ch5x_sand_p_${k}` },
        ]),
      ],
    }),
    poi('poi_ch5x_hourglass_lock', p.lock, '[E] Gạt khóa cân bằng', 'ch5x_hourglass_wrong', {
      dialogueRules: [
        { ifFlag: 'ch5x_hourglass_balanced', dialogueId: 'ch5x_hourglass_done' },
        { ifFlag: 'ch5x_sand_4', dialogueId: 'ch5x_hourglass_success' },
      ],
    }),
    poi('poi_ch5x_hourglass_tablet', p.tablet, '[E] Đọc bệ đá', 'ch5x_hourglass_tablet'),
    poi('poi_ch5x_grey_notes', p.notes, '[E] Xem cuốn sổ', 'ch5x_grey_notes_take'),
  ],
  dials: [
    dial(
      'ch5_heir',
      p.heir_dial,
      '[E] Chọn cái tên',
      vals([
        NONE,
        ['corvin', 'Hoàng tử Corvin'],
        ['elric', 'Hoàng tử Elric'],
        ['aurel', 'Hoàng tử Aurel'],
        ['lysa', 'Công chúa Lysa'],
      ]),
    ),
  ],
  roamers: [
    roamer('r_ch5_grey_crystal_a', 'enemy_paradox_crystal', p.crystal_a),
    roamer('r_ch5_grey_crystal_b', 'enemy_paradox_crystal', p.crystal_b),
    roamer('r_ch5_grey_phantom', 'enemy_branch_phantom', p.phantom),
  ],
  exits: [
    exit('grey_to_shelter', { x: 0, y: 8, w: 1, h: 1 }, 'map_ch5_children_shelter', 'from_grey'),
    exit('grey_to_anchor', { x: 27, y: 8, w: 1, h: 1 }, 'map_ch5_kuro_asks', 'from_grey'),
  ],
  triggers: [arrive('ch5_t_grey', 'ch5_grey_arrival', { effects: { setFlags: ['ch5x_sand_0'] } })],
}));

// 13. Where Kuro asks
const Q1 = vals([
  ['banhbeo', 'Bánh Bèo'],
  ['muop', 'Mướp'],
  ['banhduc', 'Bánh Đúc'],
  ['bachan', 'Ba Chân'],
]);
const Q2 = vals([
  ['rucon', 'Ru Con Bến Cá'],
  ['chieu', 'Chiều Trên Bến Cũ'],
  ['gacxep', 'Chiều Mưa Gác Xép'],
  ['benmua', 'Bến Cũ Mưa Rơi'],
]);
const Q3 = vals([
  ['hoanghon', 'Mỏm đá hoàng hôn'],
  ['gac', 'Gác xép mưa'],
  ['bentau', 'Bến tàu'],
  ['bang', 'Mỏm đá có cây bàng gãy'],
]);
const ANSWERED = ['answered_q1', 'answered_q2', 'answered_q3'];
add('map_ch5_kuro_asks', 'Nơi Kuro Hỏi Lại', (p) => ({
  ambient: { color: '#9a7aff', alpha: 0.12 },
  npcs: [
    npc('npc_ch5_kuro_anchor', 'npc_kuro', p.kuro, 'Kuro', 'ch5_kuro_waiting', {
      visibleWhen: { unlessFlag: 'kuro_left' },
      dialogueRules: [
        { ifFlag: 'resolved_beta_choice', dialogueId: 'ch5_kuro_after_choice' },
        {
          ifFlags: [...ANSWERED, 'ch5_q1_right', 'ch5_q2_right', 'ch5_q3_right'],
          unlessFlag: 'ch5_opened_ledger_quiz',
          dialogueId: 'ch5_kuro_smile',
        },
        {
          ifFlags: [...ANSWERED, 'ch5_q1_right', 'ch5_q2_right', 'ch5_q3_right'],
          dialogueId: 'ch5_kuro_after_quiz_open',
        },
        {
          ifFlags: [...ANSWERED, 'ch5_q1_right', 'ch5_q2_right', 'ch5_choice_alpha_letter'],
          dialogueId: 'ch5_kuro_after_quiz_open',
        },
        {
          ifFlags: [...ANSWERED, 'ch5_q1_right', 'ch5_q3_right', 'ch5_choice_alpha_letter'],
          dialogueId: 'ch5_kuro_after_quiz_open',
        },
        {
          ifFlags: [...ANSWERED, 'ch5_q2_right', 'ch5_q3_right', 'ch5_choice_alpha_letter'],
          dialogueId: 'ch5_kuro_after_quiz_open',
        },
        { ifFlags: ANSWERED, dialogueId: 'ch5_kuro_after_quiz' },
      ],
    }),
  ],
  interactables: [
    ['q1', 'banhduc'],
    ['q2', 'chieu'],
    ['q3', 'bang'],
  ].map(([q, right]) =>
    poi(`poi_ch5_${q}`, p[q], '[E] Trả lời', `ch5_${q}_wrong`, {
      radius: 30,
      dialogueRules: [
        { ifFlag: `answered_${q}`, dialogueId: 'ch5_q_done' },
        { ifFlag: `ch5_dial_${q}_${right}`, dialogueId: `ch5_${q}_right` },
      ],
    }),
  ),
  dials: [
    dial('ch5_dial_q1', p.q1_dial, '[E] Tên con mèo', Q1),
    dial('ch5_dial_q2', p.q2_dial, '[E] Bài hát của mẹ', Q2),
    dial('ch5_dial_q3', p.q3_dial, '[E] Nơi hứa', Q3),
  ],
  encounters: [
    {
      id: 'enc_kuro_duel',
      enemyId: 'boss_kuro_duel',
      texture: 'npc_kuro',
      anim: 'npc_kuro_idle',
      tile: p.kuro,
      defeatedFlag: 'ch5_kuro_duel_won',
      hidden: true,
      victoryDialogueId: 'ch5_kuro_duel_end',
    },
  ],
  exits: [
    exit('anchor_to_grey', { x: 0, y: 6, w: 1, h: 1 }, 'map_ch5_grey_prune', 'from_anchor'),
    exit('anchor_to_throne', { x: 17, y: 6, w: 1, h: 1 }, 'map_ch5_unborn_throne', 'from_anchor', {
      requiresFlag: 'ch5_anchor_settled',
      lockedDialogueId: 'ch5_anchor_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch5_t_anchor', 'ch5_kuro_asks_intro'),
    {
      id: 'ch5_t_duel',
      on: 'zone',
      area: { x: 1, y: 2, w: 16, h: 9 },
      requiresFlag: 'ch5_choice_stop_kuro',
      unlessFlag: 'ch5_kuro_duel_done',
      onceFlag: 'ch5_t_duel_seen',
      dialogueId: 'ch5_kuro_duel_begin',
      encounterId: 'enc_kuro_duel',
    },
  ],
}));

// 14. Unborn throne
add('map_ch5_unborn_throne', 'Ngai Vua Chưa Sinh', (p) => ({
  ambient: { color: '#d8c8ff', alpha: 0.1 },
  interactables: [
    poi('poi_ch5x_mirror', p.mirror, '[E] Nhìn vào Gương Hư Vô', 'ch5x_mirror_blank', {
      dialogueRules: [
        { ifFlag: 'ch5x_mirror_passed', dialogueId: 'ch5x_mirror_done' },
        { ifFlag: 'ch5_choice_alpha_letter', dialogueId: 'ch5x_mirror_letter' },
        { ifFlag: 'ch5_choice_alpha_spared', dialogueId: 'ch5x_mirror_spared' },
      ],
    }),
    poi(
      'poi_ch5x_altar_willow',
      p.altar_willow,
      '[E] Đặt lễ lên Bệ Cành Liễu',
      'ch5x_mirror_wrong',
      {
        radius: 30,
        dialogueRules: [
          { ifFlag: 'ch5x_mirror_passed', dialogueId: 'ch5x_mirror_done' },
          { ifFlag: 'ch5_choice_alpha_letter', dialogueId: 'ch5x_mirror_pass' },
        ],
      },
    ),
    poi('poi_ch5x_altar_ring', p.altar_ring, '[E] Đặt lễ lên Bệ Chiếc Nhẫn', 'ch5x_mirror_wrong', {
      radius: 30,
      dialogueRules: [
        { ifFlag: 'ch5x_mirror_passed', dialogueId: 'ch5x_mirror_done' },
        { ifFlag: 'ch5_choice_alpha_spared', dialogueId: 'ch5x_mirror_pass' },
      ],
    }),
    poi(
      'poi_ch5x_altar_sword',
      p.altar_sword,
      '[E] Đặt lễ lên Bệ Thanh Kiếm',
      'ch5x_mirror_wrong',
      {
        radius: 30,
        dialogueRules: [{ ifFlag: 'ch5x_mirror_passed', dialogueId: 'ch5x_mirror_done' }],
      },
    ),
  ],
  encounters: [
    {
      id: 'enc_unborn_king',
      enemyId: 'boss_unborn_king',
      texture: 'boss_unborn_king',
      anim: 'boss_unborn_king_idle',
      tile: p.king,
      defeatedFlag: 'defeated_unborn_king',
      hitbox: 34,
      victoryDialogueId: 'ch5_unborn_king_defeated',
    },
  ],
  tileSwaps: [
    {
      when: { flag: 'defeated_unborn_king' },
      layer: 'walls',
      tiles: L.THRONE_GATE,
      index: L.I.ENGRAVED,
    },
  ],
  exits: [
    exit('throne_to_anchor', { x: 0, y: 12, w: 1, h: 1 }, 'map_ch5_kuro_asks', 'from_throne'),
    exit('throne_to_shore', { x: 11, y: 0, w: 1, h: 1 }, 'map_ch5_collision_shore', 'from_throne', {
      requiresFlag: 'defeated_unborn_king',
      lockedDialogueId: 'ch5_throne_exit_locked',
    }),
  ],
  triggers: [
    zone('ch5_t_king_kuro', { x: 8, y: 8, w: 7, h: 2 }, 'ch5_kuro_joins_battle', {
      requiresFlag: 'ch5_kuro_by_side',
      unlessFlag: 'defeated_unborn_king',
    }),
    zone('ch5_t_king', { x: 8, y: 8, w: 7, h: 2 }, 'ch5_unborn_king_confront', {
      unlessFlag: 'defeated_unborn_king',
    }),
  ],
}));

// 15. Collision shore
add('map_ch5_collision_shore', 'Bờ Va Chạm', (p, layout) => ({
  ambient: { color: '#b09aff', alpha: 0.14 },
  interactables: [
    poi('poi_ch5_collision_start', p.start, '[E] Bước lên bờ va chạm', 'ch5_collision_start', {
      dialogueRules: [{ ifFlag: 'ch5_collision_big', dialogueId: 'ch5_collision_start_big' }],
    }),
    poi('poi_ch5_possibility_seal', p.seal, '[E] Chạm vào Lõi Phong Ấn', 'ch5_seal_stop', {
      requiresFlag: 'escaped_collision',
      dialogueRules: [
        { ifFlag: 'ch5_choice_partial_pull', dialogueId: 'ch5_seal_partial' },
        { ifFlag: 'ch5_choice_help_kuro', dialogueId: 'ch5_seal_help' },
      ],
    }),
  ],
  triggers: [
    arrive('ch5_t_collision', 'ch5_collision_arrival'),
    ...layout.grey.map((t, i) => ({
      id: `ch5_t_grey_isle_${i}`,
      on: 'zone',
      area: { x: t.x, y: t.y, w: 1, h: 1 },
      repeat: true,
      teleportTo: 'collision_start',
      dialogueId: 'ch5_island_fall',
    })),
    {
      id: 'ch5_t_collision_end',
      on: 'zone',
      area: { x: layout.end.x, y: layout.end.y, w: 1, h: 1 },
      requiresFlag: 'ch5_collision_clock',
      onceFlag: 'ch5_collision_done',
      dialogueId: 'ch5_collision_escaped',
    },
    {
      id: 'ch5_t_collision_late',
      on: 'zone',
      area: { x: layout.end.x, y: layout.end.y, w: 1, h: 1 },
      repeat: true,
      unlessFlag: 'ch5_collision_clock',
      teleportTo: 'collision_start',
      dialogueId: 'ch5_collision_late',
    },
  ],
}));

// 16. Uprooted garden
const SEEDS = ['seed_spring_old', 'seed_summer', 'seed_autumn', 'seed_winter', 'seed_spring_new'];
const PLOT = vals([
  NONE,
  ['xuan_cu', 'Xuân (nét cũ)'],
  ['ha', 'Hạ'],
  ['thu', 'Thu'],
  ['dong', 'Đông'],
  ['xuan_moi', 'Xuân (nét mới)'],
]);
add('map_ch5_uprooted_garden', 'Vườn Hạt Bị Nhổ', (p) => ({
  ambient: { color: '#9a7aff', alpha: 0.1 },
  interactables: [
    poi('poi_ch5_tend', p.tend, '[E] Vun đất', 'ch5_plots_missing', {
      dialogueRules: [
        { ifFlag: 'planted_uprooted_seeds', dialogueId: 'ch5_plots_done' },
        {
          ifItems: SEEDS,
          ifFlags: [
            'ch5_plot_1_xuan_cu',
            'ch5_plot_2_ha',
            'ch5_plot_3_thu',
            'ch5_plot_4_dong',
            'ch5_plot_5_xuan_moi',
          ],
          dialogueId: 'ch5_plots_right',
        },
        { ifItems: SEEDS, dialogueId: 'ch5_plots_wrong' },
      ],
    }),
    poi('poi_ch5_uprooted_back', p.back, '[E] Quay về vườn hạt', 'ch5_uprooted_back'),
  ],
  dials: [1, 2, 3, 4, 5].map((n) =>
    dial(`ch5_plot_${n}`, p[`plot_${n}`], `[E] Luống ${n}`, PLOT, { requiresItems: SEEDS }),
  ),
  triggers: [arrive('ch5_t_uprooted', 'ch5_uprooted_arrival')],
}));

// 17. Old seeds
const plot = (key, tile, a, b, flagA, flagB) =>
  poi(`poi_ch5_old_${key}`, tile, '[E] Xem luống đất', 'ch5_seed_empty', {
    dialogueRules: [
      { ifFlag: 'watered_old_seed', dialogueId: 'ch5_seed_already' },
      { ifFlag: flagA, dialogueId: a },
      { ifFlag: flagB, dialogueId: b },
    ],
  });
add('map_ch5_old_seeds', 'Những Hạt Giống Cũ', (p) => ({
  ambient: { color: '#c8b8ff', alpha: 0.1 },
  interactables: [
    plot(
      'aldric',
      p.aldric,
      'ch5_seed_aldric_truth',
      'ch5_seed_aldric_comfort',
      'ch4_choice_aldric_truth',
      'ch4_choice_aldric_comfort',
    ),
    plot(
      'bran',
      p.bran,
      'ch5_seed_bran_release',
      'ch5_seed_bran_memorial',
      'ch4_choice_bran_release',
      'ch4_choice_bran_memorial',
    ),
    plot(
      'elion',
      p.elion,
      'ch5_seed_elion_burn',
      'ch5_seed_elion_chronicle',
      'ch4_choice_elion_burn',
      'ch4_choice_elion_chronicle',
    ),
    poi('poi_ch5_old_back', p.back, '[E] Quay về vườn hạt', 'ch5_old_seeds_back'),
  ],
  triggers: [arrive('ch5_t_old_seeds', 'ch5_old_seeds_arrival')],
}));

for (const [id, m] of Object.entries(M)) maps.maps[id] = m;
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');
console.log('wired', Object.keys(M).length, 'maps');
