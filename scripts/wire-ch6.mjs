/**
 * Wires Chapter 6 (CHAPTER_06_DESIGN.md with §17, §18) into maps.json: 18 maps with glyph altars,
 * the light beam, geared rings, the chessboard, foes, bosses, gates and triggers. Content comes
 * from scripts/content-ch6.mjs. Idempotent.
 *
 * Usage: node scripts/wire-ch6.mjs
 */
import fs from 'fs';
import * as L from './ch6-layout.js';

const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8'));
const Ce = L.Ce;

const TS = {
  tileset: {
    name: 'celestial_tileset',
    key: 'celestial_tileset',
    path: 'assets/tilesets/celestial_tileset.png',
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
const cell = (t) => ({ x: t.x, y: t.y, w: 1, h: 1 });
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
const swap = (flag, tiles, index, layer = 'walls') => ({
  when: { flag },
  layer,
  tiles: Array.isArray(tiles) ? tiles : [tiles],
  index,
});
/** A pickup shown until it is taken. */
const pickup = (id, tile, prompt, dialogueId, onceFlag, extra = {}) =>
  poi(id, tile, prompt, dialogueId, { visibleWhen: { unlessFlag: onceFlag }, ...extra });

// ------------------------------------------------------------------ glyphs
const GLYPHS = {
  a: 'Sáng',
  o: 'Tối',
  i: 'Dòng',
  u: 'Tĩnh',
  e: 'Vật',
  n: 'Tên',
  x: 'Không',
};
/** Glyph slot values: a learned glyph shows its meaning, an unlearned one only "?". */
const glyphVals = (keys) => [
  { key: 'none', label: '(trống)' },
  ...keys.map((k) => ({
    key: k,
    label: `[${k.toUpperCase()}] ${GLYPHS[k]}`,
    unknownLabel: `[${k.toUpperCase()}] ?`,
    knownFlag: `ch6_glyph_${k}_known`,
  })),
];
/** Rules for an engraving altar: `rules` are [flags, dialogueId] in order; empty slot → empty. */
const engraveRules = (doneFlag, doneId, rules, emptyId, slotIds) => [
  { ifFlag: doneFlag, dialogueId: doneId },
  ...rules.map(([flags, dialogueId]) => ({ ifFlags: flags, dialogueId })),
  ...slotIds.map((s) => ({ ifFlag: `${s}_none`, dialogueId: emptyId })),
];

const byId = Object.fromEntries(L.CH6_MAPS.map((m) => [m.id, m]));
const M = {};
function add(id, name, extra) {
  const def = byId[id];
  const layout = def.build();
  M[id] = {
    id,
    name,
    chapter: 6,
    tilemap: { key: id, path: `assets/maps/${id}.json` },
    ...TS,
    layers: { ground: 'Ground', walls: 'Walls' },
    bgm: 'ambient',
    spawns: layout.spawns,
    revive: layout.spawns.revive ?? layout.spawns.default,
    npcs: [],
    interactables: [],
    ...extra(layout.points, layout, id),
  };
}

// 1. Celestial stairs
add('map_ch6_celestial_stairs', 'Bậc Thang Bạch Kim', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.08 },
  interactables: [poi('poi_ch6_stairs_stele', p.stele, '[E] Đọc bia đá', 'ch6_stairs_stele')],
  exits: [
    exit(
      'stairs_to_courtyard',
      { x: 23, y: 8, w: 1, h: 1 },
      'map_ch6_outer_courtyard',
      'from_stairs',
    ),
  ],
  triggers: [
    arrive('ch6_t_arrive_together', 'ch6_arrival_together', {
      requiresFlag: 'ch5_choice_partial_pull',
    }),
    arrive('ch6_t_arrive_alone', 'ch6_arrival_alone', { unlessFlag: 'ch5_choice_partial_pull' }),
    zone('ch6_t_stairs_kuro', { x: 8, y: 6, w: 3, h: 5 }, 'ch6_stairs_kuro', {
      requiresFlag: 'ch6_kuro_ally',
    }),
  ],
}));

// 2. Outer courtyard (C01)
add('map_ch6_outer_courtyard', 'Tiền Sân Khởi Nguyên', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.08 },
  lightTiles: [p.light_1, p.light_2],
  interactables: [
    poi('poi_ch6_stele_sun', p.stele_sun, '[E] Xem bia mặt trời', 'ch6_stele_sun'),
    poi('poi_ch6_stele_void', p.stele_void, '[E] Xem bia vòng tròn rỗng', 'ch6_stele_void'),
    poi('poi_ch6_gate_text', p.gate_text, '[E] Đọc chữ trên vòm cổng', 'ch6_gate_text'),
    poi('poi_ch6_gate1_engrave', p.engrave, '[E] Khắc', 'ch6_gate1_wrong', {
      radius: 30,
      dialogueRules: engraveRules(
        'solved_ch6_gate_1',
        'ch6_gate1_done',
        [[['ch6_gate1_s1_a', 'ch6_gate1_s2_x'], 'ch6_gate1_right']],
        'ch6_gate1_empty',
        ['ch6_gate1_s1', 'ch6_gate1_s2'],
      ),
    }),
  ],
  dials: [
    dial('ch6_gate1_s1', p.slot_1, '[E] Khe thứ nhất', glyphVals(['a', 'x'])),
    dial('ch6_gate1_s2', p.slot_2, '[E] Khe thứ hai', glyphVals(['a', 'x'])),
  ],
  roamers: [
    roamer('ch6_shadow_c1', 'enemy_heel_shadow', p.shadow_1),
    roamer('ch6_shadow_c2', 'enemy_heel_shadow', p.shadow_2),
  ],
  tileSwaps: [swap('solved_ch6_gate_1', p.curtain, Ce.GAP)],
  exits: [
    exit(
      'courtyard_to_stairs',
      { x: 0, y: 9, w: 1, h: 1 },
      'map_ch6_celestial_stairs',
      'from_courtyard',
    ),
    exit(
      'courtyard_to_pillars',
      { x: 14, y: 0, w: 1, h: 1 },
      'map_ch6_hall_of_pillars',
      'from_courtyard',
      {
        requiresFlag: 'solved_ch6_gate_1',
        lockedDialogueId: 'ch6_courtyard_gate_locked',
      },
    ),
  ],
  triggers: [
    arrive('ch6_t_courtyard', 'ch6_courtyard_arrival'),
    zone('ch6_t_shadow_intro', { x: 4, y: 10, w: 20, h: 6 }, 'ch6_shadow_intro'),
  ],
}));

// 3. Hall of pillars (C02 beam)
const MIRROR = (first) =>
  vals(
    first === 'slash'
      ? [
          ['slash', 'Gương nghiêng /'],
          ['backslash', 'Gương nghiêng \\'],
        ]
      : [
          ['backslash', 'Gương nghiêng \\'],
          ['slash', 'Gương nghiêng /'],
        ],
  );
const mirrorSwaps = (id, tile) => [
  swap(`${id}_slash`, tile, Ce.MIRROR_S),
  swap(`${id}_backslash`, tile, Ce.MIRROR_B),
];
add('map_ch6_hall_of_pillars', 'Điện Trụ Thiên Thể', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.06 },
  lightTiles: [p.light_1, p.light_2],
  interactables: [
    poi('poi_ch6_floor', p.floor_diagram, '[E] Xem hình khắc trên sàn', 'ch6_floor_diagram'),
    poi('poi_ch6_optics', p.optics_note, '[E] Đọc văn bia', 'ch6_optics_note'),
    poi('poi_ch6_mural_dn', p.mural, '[E] Xem bích họa', 'ch6_mural_daynight'),
  ],
  dials: [
    dial('ch6_m1', L.BEAM.m1, '[E] Xoay gương', MIRROR('slash'), { radius: 40 }),
    dial('ch6_m2', L.BEAM.m2, '[E] Xoay gương', MIRROR('slash'), { radius: 40 }),
    dial('ch6_m3', L.BEAM.m3, '[E] Xoay gương', MIRROR('backslash'), { radius: 40 }),
  ],
  beams: [
    {
      id: 'ch6_beam',
      start: L.BEAM.lamp,
      dir: { x: 1, y: 0 },
      mirrors: [
        { dialId: 'ch6_m1', tile: L.BEAM.m1 },
        { dialId: 'ch6_m2', tile: L.BEAM.m2 },
        { dialId: 'ch6_m3', tile: L.BEAM.m3 },
      ],
      prisms: [L.BEAM.prism],
      brass: [L.BEAM.brass, { x: 16, y: 4 }],
      target: L.BEAM.eye,
      solvedFlag: 'aligned_pillars_c02',
      solvedDialogueId: 'ch6_beam_solved',
    },
  ],
  roamers: [
    roamer('ch6_construct_p1', 'enemy_archon_construct', p.construct_1),
    roamer('ch6_construct_p2', 'enemy_archon_construct', p.construct_2),
    roamer('ch6_shadow_p1', 'enemy_heel_shadow', p.shadow_1),
  ],
  tileSwaps: [
    ...mirrorSwaps('ch6_m1', L.BEAM.m1),
    ...mirrorSwaps('ch6_m2', L.BEAM.m2),
    ...mirrorSwaps('ch6_m3', L.BEAM.m3),
    swap('aligned_pillars_c02', L.BEAM.eye, Ce.EYE_LIT),
    swap('aligned_pillars_c02', p.gate, Ce.GAP),
  ],
  exits: [
    exit(
      'pillars_to_courtyard',
      { x: 15, y: 19, w: 1, h: 1 },
      'map_ch6_outer_courtyard',
      'from_pillars',
    ),
    exit('pillars_to_herald', { x: 24, y: 0, w: 1, h: 1 }, 'map_ch6_herald_roost', 'from_pillars', {
      requiresFlag: 'aligned_pillars_c02',
      lockedDialogueId: 'ch6_pillars_gate_locked',
    }),
  ],
  triggers: [
    arrive('ch6_t_pillars', 'ch6_pillars_arrival'),
    zone('ch6_t_construct_intro', { x: 3, y: 12, w: 8, h: 6 }, 'ch6_construct_intro'),
  ],
}));

// 4. Herald's roost
add('map_ch6_herald_roost', 'Đài Vọng Sứ Giả', (p) => ({
  ambient: { color: '#d8e8ff', alpha: 0.08 },
  npcs: [
    npc('npc_ch6_herald', 'boss_broken_herald', p.herald, 'Sứ Giả Gãy Cánh', 'ch6_herald_after', {
      visibleWhen: { flag: 'defeated_broken_herald' },
      dialogueRules: [{ ifFlag: 'ch4_choice_aldric_truth', dialogueId: 'ch6_herald_truth' }],
    }),
  ],
  encounters: [
    {
      id: 'enc_broken_herald',
      enemyId: 'boss_broken_herald',
      texture: 'boss_broken_herald',
      anim: 'boss_broken_herald_idle',
      tile: p.herald,
      defeatedFlag: 'defeated_broken_herald',
      hitbox: 30,
      victoryDialogueId: 'ch6_herald_defeated',
    },
  ],
  exits: [
    exit(
      'herald_to_pillars',
      { x: 11, y: 15, w: 1, h: 1 },
      'map_ch6_hall_of_pillars',
      'from_herald',
    ),
    exit('herald_to_nave', { x: 21, y: 8, w: 1, h: 1 }, 'map_ch6_fracture_nave', 'from_herald', {
      requiresFlag: 'defeated_broken_herald',
      lockedDialogueId: 'ch6_roost_exit_locked',
    }),
  ],
  triggers: [
    zone('ch6_t_herald_kuro_help', { x: 6, y: 10, w: 10, h: 3 }, 'ch6_herald_kuro_help', {
      requiresFlag: 'ch5_choice_help_kuro',
      unlessFlag: 'defeated_broken_herald',
    }),
    zone('ch6_t_herald_kuro_stop', { x: 6, y: 10, w: 10, h: 3 }, 'ch6_herald_kuro_stop', {
      requiresFlag: 'ch5_choice_stop_kuro',
      unlessFlag: 'defeated_broken_herald',
    }),
    zone('ch6_t_herald', { x: 6, y: 8, w: 10, h: 2 }, 'ch6_herald_confront', {
      unlessFlag: 'defeated_broken_herald',
    }),
  ],
}));

// 5. Fracture nave (C03)
const ALTAR_PROMPT = {
  continuum: '[E] Bệ thờ — Mảnh Ấn Continuum trong túi rung lên',
  causality: '[E] Bệ thờ — Mảnh Ấn Causality trong túi rung lên',
  memory: '[E] Bệ thờ — Mảnh Ấn Memory trong túi rung lên',
  finality: '[E] Bệ thờ — Mảnh Ấn Finality trong túi rung lên',
  possibility: '[E] Bệ thờ — Mảnh Ấn Possibility trong túi rung lên',
  origin: '[E] Bệ thờ — không mảnh ấn nào trong túi đáp lại',
};
const ONOFF = vals([
  ['off', 'Tắt'],
  ['on', 'Sáng'],
]);
add('map_ch6_fracture_nave', 'Chính Điện Phân Tách', (p) => ({
  ambient: { color: '#d8c8ff', alpha: 0.08 },
  interactables: [
    pickup(
      'poi_ch6_parchment',
      p.parchment,
      '[E] Nhặt cuộn da',
      'ch6_parchment_take',
      'took_parchment_great_fracture',
    ),
    poi('poi_ch6_rift', p.rift, '[E] Chạm vào Bệ Kẽ Nứt', 'ch6_rift_idle', {
      dialogueRules: [
        { ifFlag: 'solved_fracture_altars', dialogueId: 'ch6_rift_done' },
        ...['continuum', 'causality', 'memory', 'possibility'].map((k) => ({
          ifFlag: `ch6_alt_${k}_on`,
          dialogueId: 'ch6_rift_wrong',
        })),
        { ifFlags: ['ch6_alt_origin_on', 'ch6_alt_finality_on'], dialogueId: 'ch6_rift_right' },
      ],
    }),
  ],
  dials: Object.entries(L.ALTARS).map(([k, t]) =>
    dial(`ch6_alt_${k}`, t, ALTAR_PROMPT[k], ONOFF, { radius: 40 }),
  ),
  roamers: [
    roamer('ch6_twin_n1', 'enemy_twin_star', p.twin_1),
    roamer('ch6_twin_n2', 'enemy_twin_star', p.twin_2),
    roamer('ch6_null_n1', 'enemy_origin_nullifier', p.nullifier),
  ],
  tileSwaps: Object.entries(L.ALTARS).map(([k, t]) => swap(`ch6_alt_${k}_on`, t, Ce.AUTH_LIT)),
  exits: [
    exit('nave_to_herald', { x: 0, y: 10, w: 1, h: 1 }, 'map_ch6_herald_roost', 'from_nave'),
    exit('nave_to_gallery', { x: 31, y: 10, w: 1, h: 1 }, 'map_ch6_gallery_of_eras', 'from_nave', {
      requiresFlag: 'solved_fracture_altars',
      lockedDialogueId: 'ch6_nave_exit_locked',
    }),
  ],
  triggers: [arrive('ch6_t_nave', 'ch6_nave_arrival')],
}));

// 6. Gallery of eras (C04)
const ERAS = vals([
  NONE,
  ['sea', 'Biển đóng băng'],
  ['names', 'Quên tên thành phố'],
  ['sky', 'Bầu trời nứt'],
  ['ash', 'Tro tàn'],
]);
const SHOWN = ['ch6_mural_names', 'ch6_mural_ash', 'ch6_mural_sea', 'ch6_mural_sky'];
add('map_ch6_gallery_of_eras', 'Phòng Trưng Bày Kỷ Nguyên', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.06 },
  lightTiles: [p.light],
  interactables: [
    ...p.murals.map((t, k) =>
      poi(`poi_ch6_mural_${k + 1}`, t, '[E] Xem bích họa', SHOWN[k], { radius: 36 }),
    ),
    poi('poi_ch6_place_eras', p.place, '[E] Đặt bích họa vào khung', 'ch6_eras_wrong', {
      dialogueRules: engraveRules(
        'sorted_eras_c04',
        'ch6_eras_done',
        [
          [
            ['ch6_frame_1_sea', 'ch6_frame_2_names', 'ch6_frame_3_sky', 'ch6_frame_4_ash'],
            'ch6_eras_right',
          ],
        ],
        'ch6_eras_empty',
        ['ch6_frame_1', 'ch6_frame_2', 'ch6_frame_3', 'ch6_frame_4'],
      ),
    }),
    poi('poi_ch6_erosion', p.stele, '[E] Đọc bia', 'ch6_erosion_stele'),
    poi('poi_ch6_memorial', p.memorial, '[E] Xem bức tường tên', 'ch6_memorial_plain', {
      dialogueRules: [
        { ifFlag: 'took_bran_count_token', dialogueId: 'ch6_memorial_done' },
        { ifFlag: 'ch4_choice_bran_memorial', dialogueId: 'ch6_memorial_bran' },
      ],
    }),
    poi('poi_ch6_family', p.family, '[E] Xem bích họa', 'ch6_family_plain', {
      dialogueRules: [
        { ifFlag: 'ch5_choice_alpha_letter', dialogueId: 'ch6_family_letter' },
        { ifFlag: 'ch5_choice_alpha_spared', dialogueId: 'ch6_family_spared' },
      ],
    }),
    pickup(
      'poi_ch6_oil_1',
      p.oil,
      '[E] Nhặt giọt dầu',
      'ch6_oil_take_1',
      'took_quartz_oil_gallery',
    ),
  ],
  dials: p.frames.map((t, k) => dial(`ch6_frame_${k + 1}`, t, `[E] Khung ${k + 1}`, ERAS)),
  roamers: [
    roamer('ch6_shadow_g1', 'enemy_heel_shadow', p.shadow),
    roamer('ch6_twin_g1', 'enemy_twin_star', p.twin),
  ],
  exits: [
    exit('gallery_to_nave', { x: 0, y: 9, w: 1, h: 1 }, 'map_ch6_fracture_nave', 'from_gallery'),
    exit(
      'gallery_to_cascade',
      { x: 25, y: 9, w: 1, h: 1 },
      'map_ch6_frozen_cascade',
      'from_gallery',
      {
        requiresFlag: 'sorted_eras_c04',
        lockedDialogueId: 'ch6_gallery_exit_locked',
      },
    ),
  ],
  triggers: [arrive('ch6_t_gallery', 'ch6_gallery_arrival')],
}));

// 7. Frozen cascade (C05)
add('map_ch6_frozen_cascade', 'Thác Ánh Sáng Đóng Băng', (p) => ({
  ambient: { color: '#d8f0ff', alpha: 0.08 },
  fallbackSpawn: 'from_gallery',
  interactables: [
    poi('poi_ch6_stele_flow', p.stele_flow, '[E] Đọc bia bên thác', 'ch6_stele_flow'),
    poi('poi_ch6_stele_matter', p.stele_matter, '[E] Đọc bia bên vực', 'ch6_stele_matter'),
    poi('poi_ch6_a1', p.a1_engrave, '[E] Khắc', 'ch6_a1_wrong', {
      radius: 30,
      dialogueRules: engraveRules(
        'froze_cascade_c05',
        'ch6_a1_done',
        [
          [['ch6_a1_s1_i', 'ch6_a1_s2_u'], 'ch6_a1_right'],
          [['ch6_a1_s1_i', 'ch6_a1_s2_x'], 'ch6_a1_erase'],
        ],
        'ch6_a1_empty',
        ['ch6_a1_s1', 'ch6_a1_s2'],
      ),
    }),
    poi('poi_ch6_a2', p.a2_engrave, '[E] Khắc', 'ch6_a2_wrong', {
      radius: 30,
      dialogueRules: engraveRules(
        'bridged_chasm_c05',
        'ch6_a2_done',
        [
          [['ch6_a2_s1_a', 'ch6_a2_s2_e'], 'ch6_a2_right'],
          [['ch6_a2_s1_e', 'ch6_a2_s2_a'], 'ch6_a2_reverse'],
        ],
        'ch6_a2_empty',
        ['ch6_a2_s1', 'ch6_a2_s2'],
      ),
    }),
  ],
  dials: [
    dial('ch6_a1_s1', p.a1_slot_1, '[E] Khe thứ nhất', glyphVals(['a', 'o', 'i', 'u', 'x'])),
    dial('ch6_a1_s2', p.a1_slot_2, '[E] Khe thứ hai', glyphVals(['a', 'o', 'i', 'u', 'x'])),
    dial('ch6_a2_s1', p.a2_slot_1, '[E] Khe thứ nhất', glyphVals(['a', 'o', 'i', 'u', 'e', 'x'])),
    dial('ch6_a2_s2', p.a2_slot_2, '[E] Khe thứ hai', glyphVals(['a', 'o', 'i', 'u', 'e', 'x'])),
  ],
  roamers: [
    roamer('ch6_null_c1', 'enemy_origin_nullifier', p.null_1),
    roamer('ch6_null_c2', 'enemy_origin_nullifier', p.null_2),
  ],
  tileSwaps: [
    swap('froze_cascade_c05', L.CASCADE, Ce.STEP),
    swap('bridged_chasm_c05', L.BRIDGE, Ce.CLOUD),
  ],
  exits: [
    exit(
      'cascade_to_gallery',
      { x: 0, y: 10, w: 1, h: 1 },
      'map_ch6_gallery_of_eras',
      'from_cascade',
    ),
    exit(
      'cascade_to_archives',
      { x: 25, y: 10, w: 1, h: 1 },
      'map_ch6_archives_ruins',
      'from_cascade',
      {
        requiresFlag: 'bridged_chasm_c05',
        lockedDialogueId: 'ch6_cascade_exit_locked',
      },
    ),
  ],
  triggers: [arrive('ch6_t_cascade', 'ch6_cascade_arrival')],
}));

// 8. Archives (C06)
const ROLES = vals([
  NONE,
  ['keeper', 'Kẻ Giữ Lời'],
  ['liar', 'Kẻ Dối Trá'],
  ['rev', 'Kẻ Phản Ngôn'],
]);
const STATUE_NAME = { solon: 'Solon', kael: 'Kael', vane: 'Vane' };
add('map_ch6_archives_ruins', 'Thư Khố Thiên Đình', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.06 },
  lightTiles: [p.light],
  npcs: [
    npc('npc_ch6_solon', 'npc_solon', p.solon_npc, 'Archon Solon', 'ch6_solon_meet', {
      visibleWhen: { flag: 'solved_archon_tribunal' },
      dialogueRules: [
        { ifFlag: 'resolved_solon_guilt', dialogueId: 'ch6_solon_after' },
        { ifItem: 'solon_torn_plea', dialogueId: 'ch6_solon_plea' },
        { ifFlag: 'ch6_solon_asked', dialogueId: 'ch6_solon_waiting' },
      ],
    }),
  ],
  interactables: [
    poi('poi_ch6_law', p.law, '[E] Đọc Bia Luật Phán Xử', 'ch6_tribunal_law'),
    ...Object.entries(p.testimony).map(([k, t]) =>
      poi(
        `poi_ch6_testimony_${k}`,
        t,
        `[E] Đọc lời dưới tượng ${STATUE_NAME[k]}`,
        `ch6_testimony_${k}`,
        {
          radius: 30,
        },
      ),
    ),
    poi('poi_ch6_verdict', p.verdict, '[E] Tuyên phán quyết', 'ch6_verdict_wrong', {
      dialogueRules: engraveRules(
        'solved_archon_tribunal',
        'ch6_verdict_done',
        [
          [
            ['ch6_role_solon_liar', 'ch6_role_kael_rev', 'ch6_role_vane_keeper'],
            'ch6_verdict_right',
          ],
        ],
        'ch6_verdict_empty',
        ['ch6_role_solon', 'ch6_role_kael', 'ch6_role_vane'],
      ),
    }),
    poi('poi_ch6_shelf_plea', p.shelf_plea, '[E] Lục giá sách', 'ch6_shelf_plain', {
      dialogueRules: [
        { ifFlag: 'took_solon_torn_plea', dialogueId: 'ch6_shelf_plain' },
        { ifFlag: 'ch6_solon_asked', dialogueId: 'ch6_plea_take' },
      ],
    }),
    poi('poi_ch6_shelf_a', p.shelf_a, '[E] Lục giá sách', 'ch6_shelf_plain'),
    pickup(
      'poi_ch6_niche',
      p.niche,
      '[E] Xem viên gạch lỏng',
      'ch6_secret_pruner_take',
      'took_world_secret_first_pruner',
    ),
    poi('poi_ch6_names', p.names, '[E] Xem bảng tên', 'ch6_names_stele'),
    poi('poi_ch6_chronicle', p.chronicle, '[E] Xem cuốn Chính Sử', 'ch6_chronicle', {
      dialogueRules: [
        { ifFlag: 'ch6_chronicle_decided', dialogueId: 'ch6_chronicle_done' },
        { ifFlag: 'ch4_choice_elion_burn', dialogueId: 'ch6_chronicle_elion' },
      ],
    }),
    poi('poi_ch6_trapdoor', p.trapdoor, '[E] Xem cửa sập', 'ch6_trapdoor_locked', {
      dialogueRules: [{ ifItem: 'archon_library_key', dialogueId: 'ch6_trapdoor_open' }],
    }),
  ],
  dials: Object.entries(p.roles).map(([k, t]) =>
    dial(`ch6_role_${k}`, t, `[E] Gán vai cho ${STATUE_NAME[k]}`, ROLES),
  ),
  roamers: [
    roamer('ch6_shadow_a1', 'enemy_heel_shadow', p.shadow),
    roamer('ch6_construct_a1', 'enemy_archon_construct', p.construct),
  ],
  exits: [
    exit(
      'archives_to_cascade',
      { x: 0, y: 10, w: 1, h: 1 },
      'map_ch6_frozen_cascade',
      'from_archives',
    ),
    exit(
      'archives_to_core',
      { x: 29, y: 10, w: 1, h: 1 },
      'map_ch6_genesis_core',
      'from_archives',
      {
        requiresFlag: 'solved_archon_tribunal',
        lockedDialogueId: 'ch6_archives_exit_locked',
      },
    ),
  ],
  triggers: [
    arrive('ch6_t_archives', 'ch6_archives_arrival'),
    zone('ch6_t_smell_kept', { x: 17, y: 12, w: 11, h: 5 }, 'ch6_archives_smell_kept', {
      requiresFlag: 'ch5_refused_alpha_memory',
    }),
    zone('ch6_t_smell_lost', { x: 17, y: 12, w: 11, h: 5 }, 'ch6_archives_smell_lost', {
      requiresFlag: 'ch5_took_alpha_memory',
    }),
  ],
}));

// 9. Chronos' cell (hidden A)
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
add('map_ch6_secret_chronos_cell', 'Mật Thất Ký Ức Chronos', (p) => ({
  ambient: { color: '#ffe8a8', alpha: 0.1 },
  interactables: [
    poi('poi_ch6_ceiling', p.ceiling, '[E] Nhìn lên trần', 'ch6_cell_ceiling'),
    pickup(
      'poi_ch6_scrap',
      p.scrap,
      '[E] Đọc mảnh giấy',
      'ch6_scrap_take',
      'took_chronos_private_scrap',
    ),
    poi('poi_ch6_disc_align', p.align, '[E] Khóa đĩa sao', 'ch6_disc_wrong', {
      radius: 30,
      dialogueRules: [
        { ifFlag: 'unlocked_hidden_chronos_cell', dialogueId: 'ch6_disc_done' },
        { ifFlag: 'ch6_disc_viii', dialogueId: 'ch6_disc_right' },
      ],
    }),
    poi('poi_ch6_cell_back', p.back, '[E] Leo lên', 'ch6_cell_back'),
  ],
  dials: [
    dial(
      'ch6_disc',
      p.disc,
      '[E] Xoay Sao Bắc Cực',
      ROMAN.map((k) => ({ key: k, label: `Cung ${k.toUpperCase()}` })),
      { radius: 30 },
    ),
  ],
  triggers: [arrive('ch6_t_cell', 'ch6_cell_arrival')],
}));

// 10. Genesis core (C07)
const SPEED = vals([
  ['unset', '(chưa chỉnh)'],
  ['i', 'Nấc I'],
  ['ii', 'Nấc II'],
  ['iii', 'Nấc III'],
]);
const GEARS = [
  ['small', 'Bánh nhỏ'],
  ['mid', 'Bánh vừa'],
  ['large', 'Bánh lớn'],
];
add('map_ch6_genesis_core', 'Lõi Máy Khởi Nguyên', (p) => ({
  ambient: { color: '#ffe0a0', alpha: 0.08 },
  interactables: [
    pickup(
      'poi_ch6_handbook',
      p.handbook,
      '[E] Nhặt sổ tay',
      'ch6_handbook_take',
      'took_celestial_mechanic_handbook',
    ),
    poi('poi_ch6_lever', p.lever, '[E] Kéo cần khởi động', 'ch6_core_wrong', {
      dialogueRules: [
        { ifFlag: 'activated_genesis_core', dialogueId: 'ch6_core_done' },
        {
          ifFlags: ['ch6_gear_small_iii', 'ch6_gear_mid_ii', 'ch6_gear_large_i'],
          dialogueId: 'ch6_core_right',
        },
        ...GEARS.map(([k]) => ({ ifFlag: `ch6_gear_${k}_unset`, dialogueId: 'ch6_core_unset' })),
      ],
    }),
    pickup(
      'poi_ch6_secret_null',
      p.secret,
      '[E] Xem sau lõi máy',
      'ch6_secret_null_take',
      'took_world_secret_null_hour',
      {
        visibleWhen: { flag: 'activated_genesis_core', unlessFlag: 'took_world_secret_null_hour' },
      },
    ),
    pickup('poi_ch6_oil_2', p.oil, '[E] Nhặt giọt dầu', 'ch6_oil_take_2', 'took_quartz_oil_core'),
  ],
  dials: GEARS.map(([k, name], i) => dial(`ch6_gear_${k}`, p.gears[i], `[E] ${name}`, SPEED)),
  roamers: [
    roamer('ch6_twin_k1', 'enemy_twin_star', p.twin),
    roamer('ch6_construct_k1', 'enemy_archon_construct', p.construct),
  ],
  tileSwaps: [swap('activated_genesis_core', p.lift, Ce.GAP)],
  exits: [
    exit('core_to_archives', { x: 0, y: 10, w: 1, h: 1 }, 'map_ch6_archives_ruins', 'from_core'),
    exit('core_to_bell', { x: 27, y: 10, w: 1, h: 1 }, 'map_ch6_bell_sanctuary', 'from_core', {
      requiresFlag: 'activated_genesis_core',
      lockedDialogueId: 'ch6_core_exit_locked',
    }),
  ],
  triggers: [arrive('ch6_t_core', 'ch6_core_arrival')],
}));

// 11. Bell sanctuary (C08)
const BELLS = vals([
  NONE,
  ['star', 'Đá Sao'],
  ['wood', 'Gỗ Mục'],
  ['silver', 'Bạc Lạnh'],
  ['void', 'Khí Hư Vô'],
]);
const BELL_NODES = ['ch6_bell_star', 'ch6_bell_wood', 'ch6_bell_silver', 'ch6_bell_void'];
const OILS = ['quartz_oil_gallery', 'quartz_oil_core', 'quartz_oil_bell'];
add('map_ch6_bell_sanctuary', 'Thánh Điện Chuông Câm', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.06 },
  lightTiles: [p.light],
  interactables: [
    ...p.bells.map((t, k) =>
      poi(`poi_ch6_bell_${k + 1}`, t, '[E] Gõ thử chuông', BELL_NODES[k], { radius: 36 }),
    ),
    poi('poi_ch6_bell_poem', p.poem, '[E] Đọc bài thơ', 'ch6_bell_poem'),
    poi('poi_ch6_bell_rule', p.rule, '[E] Đọc bia luật', 'ch6_bell_rule'),
    poi('poi_ch6_strike', p.strike, '[E] Gõ chuỗi chuông', 'ch6_bells_wrong', {
      dialogueRules: engraveRules(
        'solved_chime_bell',
        'ch6_cracked_done',
        [
          [
            ['ch6_beat_1_void', 'ch6_beat_2_wood', 'ch6_beat_3_silver', 'ch6_beat_4_star'],
            'ch6_bells_right',
          ],
        ],
        'ch6_bells_empty',
        ['ch6_beat_1', 'ch6_beat_2', 'ch6_beat_3', 'ch6_beat_4'],
      ),
    }),
    poi('poi_ch6_cracked', p.cracked, '[E] Xem quả chuông nứt', 'ch6_cracked_first', {
      dialogueRules: [
        { ifFlag: 'restored_chime_bell', dialogueId: 'ch6_cracked_done' },
        { ifItems: OILS, ifFlag: 'solved_chime_bell', dialogueId: 'ch6_cracked_polish' },
        { ifFlag: 'ch6_bell_quest', dialogueId: 'ch6_cracked_need' },
      ],
    }),
    pickup('poi_ch6_oil_3', p.oil, '[E] Nhặt giọt dầu', 'ch6_oil_take_3', 'took_quartz_oil_bell'),
    pickup(
      'poi_ch6_secret_forgotten',
      p.memorial,
      '[E] Xem bia tưởng niệm',
      'ch6_secret_forgotten_take',
      'took_world_secret_first_forgotten',
    ),
  ],
  dials: p.beats.map((t, k) => dial(`ch6_beat_${k + 1}`, t, `[E] Nhịp ${k + 1}`, BELLS)),
  roamers: [
    roamer('ch6_null_b1', 'enemy_origin_nullifier', p.nullifier),
    roamer('ch6_shadow_b1', 'enemy_heel_shadow', p.shadow),
  ],
  tileSwaps: [swap('solved_chime_bell', p.gate, Ce.GAP)],
  exits: [
    exit('bell_to_core', { x: 0, y: 9, w: 1, h: 1 }, 'map_ch6_genesis_core', 'from_bell'),
    exit('bell_to_ring', { x: 23, y: 9, w: 1, h: 1 }, 'map_ch6_refraction_maze', 'from_bell', {
      requiresFlag: 'solved_chime_bell',
      lockedDialogueId: 'ch6_bell_exit_locked',
    }),
  ],
  triggers: [
    arrive('ch6_t_bell', 'ch6_bell_arrival'),
    zone('ch6_t_gardener_chime', { x: 5, y: 9, w: 14, h: 4 }, 'ch6_gardener_chime', {
      requiresFlag: 'pacified_the_gardener',
    }),
    zone('ch6_t_kuro_bell', { x: 1, y: 5, w: 22, h: 10 }, 'ch6_kuro_bell', {
      requiresFlag: 'ch6_promise_remembered',
      unlessFlag: 'kuro_left',
    }),
  ],
}));

// 12. Orrery (C09)
const DIR_LABEL = {
  n: 'Khe hướng Bắc',
  e: 'Khe hướng Đông',
  s: 'Khe hướng Nam',
  w: 'Khe hướng Tây',
};
const ringVals = (order) => order.map((k) => ({ key: k, label: DIR_LABEL[k] }));
const RINGS = [
  ['inner', 1, ['w', 'n', 'e', 's'], [{ dialId: 'ch6_ring_middle', step: -1 }], 'Vành trong'],
  ['middle', 2, ['e', 's', 'w', 'n'], [{ dialId: 'ch6_ring_outer', step: 1 }], 'Vành giữa'],
  ['outer', 3, ['n', 'e', 's', 'w'], [], 'Vành ngoài'],
];
add('map_ch6_refraction_maze', 'Đài Thiên Cầu', (p) => ({
  ambient: { color: '#c8b8ff', alpha: 0.1 },
  interactables: [
    poi('poi_ch6_orrery_chart', p.chart, '[E] Đọc bản khắc', 'ch6_orrery_chart'),
    poi('poi_ch6_orrery_core', p.core, '[E] Bước vào lõi', 'ch6_orrery_core', { radius: 24 }),
  ],
  dials: RINGS.map(([k, , order, couples, name]) =>
    dial(`ch6_ring_${k}`, p.levers[k], `[E] Gạt ${name}`, ringVals(order), { couples }),
  ),
  tileSwaps: RINGS.flatMap(([k, r]) =>
    Object.entries(L.ringTiles(r).doors).map(([d, t]) => swap(`ch6_ring_${k}_${d}`, t, Ce.GAP)),
  ),
  exits: [
    exit('ring_to_bell', { x: 13, y: 21, w: 1, h: 1 }, 'map_ch6_bell_sanctuary', 'from_ring'),
  ],
  triggers: [arrive('ch6_t_orrery', 'ch6_orrery_arrival')],
}));

// 13. Threshold gate (C10)
const ALL = ['a', 'o', 'i', 'u', 'e', 'n', 'x'];
add('map_ch6_threshold_gate', 'Cổng Ngưỡng Thần Thể', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.08 },
  interactables: [
    poi('poi_ch6_riddle', p.riddle, '[E] Đọc lời sấm', 'ch6_threshold_riddle'),
    poi('poi_ch6_threshold', p.engrave, '[E] Khắc', 'ch6_threshold_wrong', {
      radius: 30,
      dialogueRules: engraveRules(
        'opened_threshold_gate',
        'ch6_threshold_done',
        [
          [['ch6_th_s1_e', 'ch6_th_s2_n', 'ch6_th_s3_x'], 'ch6_threshold_right'],
          [['ch6_th_s1_e', 'ch6_th_s2_x', 'ch6_th_s3_none'], 'ch6_threshold_wrong_ex'],
          [['ch6_th_s1_n', 'ch6_th_s2_x', 'ch6_th_s3_none'], 'ch6_threshold_wrong_nx'],
        ],
        'ch6_threshold_empty',
        ['ch6_th_s1'],
      ),
    }),
    poi('poi_ch6_crack_b', p.crack, '[E] Xem khe nứt', 'ch6_crack_closed', {
      dialogueRules: [{ ifItem: 'genesis_core_shard', dialogueId: 'ch6_crack_open' }],
    }),
  ],
  dials: p.slots.map((t, k) => dial(`ch6_th_s${k + 1}`, t, `[E] Khe thứ ${k + 1}`, glyphVals(ALL))),
  tileSwaps: [swap('opened_threshold_gate', p.curtain, Ce.GAP)],
  exits: [
    exit('gate_to_approach', { x: 13, y: 0, w: 1, h: 1 }, 'map_ch6_sanctum_approach', 'from_gate', {
      requiresFlag: 'opened_threshold_gate',
      lockedDialogueId: 'ch6_threshold_exit_locked',
    }),
  ],
  triggers: [arrive('ch6_t_threshold', 'ch6_threshold_arrival')],
}));

// 14. Chessboard (hidden B, C12)
const PIECES = vals([
  NONE,
  ['sun', 'Mặt Trời'],
  ['moon', 'Mặt Trăng'],
  ['comet', 'Sao Chổi'],
  ['void', 'Hư Không'],
]);
const PIECE_KEY = { S: 'sun', M: 'moon', C: 'comet', H: 'void' };
const PIECE_TILE = { sun: Ce.P_SUN, moon: Ce.P_MOON, comet: Ce.P_COMET, void: Ce.P_VOID };
const chessDial = ([r, c]) => `ch6_chess_r${r + 1}c${c + 1}`;
const chessTile = ([r, c]) => ({ x: L.CHESS_ORIGIN.x + c, y: L.CHESS_ORIGIN.y + r });
add('map_ch6_celestial_chessboard', 'Bàn Cờ Thiên Thể', (p) => ({
  ambient: { color: '#c8b8ff', alpha: 0.1 },
  interactables: [
    poi('poi_ch6_chess_rules', p.rules, '[E] Đọc luật bàn cờ', 'ch6_chess_rules'),
    poi('poi_ch6_chess_check', p.check, '[E] Xác nhận thế cờ', 'ch6_chess_wrong', {
      dialogueRules: engraveRules(
        'aligned_celestial_chess',
        'ch6_chess_done',
        [
          [
            L.CHESS_BLANKS.map((b) => `${chessDial(b)}_${PIECE_KEY[L.CHESS_SOLUTION[b[0]][b[1]]]}`),
            'ch6_chess_right',
          ],
        ],
        'ch6_chess_empty',
        L.CHESS_BLANKS.map(chessDial),
      ),
    }),
    poi('poi_ch6_chess_back', p.back, '[E] Quay lại', 'ch6_chess_back'),
  ],
  dials: L.CHESS_BLANKS.map((b) =>
    dial(chessDial(b), chessTile(b), `[E] Ô hàng ${b[0] + 1}, cột ${b[1] + 1}`, PIECES, {
      radius: 18,
    }),
  ),
  tileSwaps: L.CHESS_BLANKS.flatMap((b) =>
    Object.entries(PIECE_TILE).map(([k, idx]) =>
      swap(`${chessDial(b)}_${k}`, chessTile(b), idx, 'ground'),
    ),
  ),
  triggers: [arrive('ch6_t_chess', 'ch6_chess_arrival')],
}));

// 15. Sanctum approach (elite)
add('map_ch6_sanctum_approach', 'Đường Dẫn Điện Thờ', (p) => ({
  ambient: { color: '#fff2c8', alpha: 0.08 },
  lightTiles: p.lights,
  encounters: [
    {
      id: 'enc_remnant_deacon',
      enemyId: 'boss_remnant_deacon',
      texture: 'boss_remnant_deacon',
      anim: 'boss_remnant_deacon_idle',
      tile: p.deacon,
      defeatedFlag: 'defeated_remnant_deacon',
      hitbox: 30,
      victoryDialogueId: 'ch6_deacon_defeated',
    },
  ],
  roamers: [
    roamer('ch6_shadow_s1', 'enemy_heel_shadow', p.shadow),
    roamer('ch6_construct_s1', 'enemy_archon_construct', p.construct),
    roamer('ch6_twin_s1', 'enemy_twin_star', p.twin),
    roamer('ch6_null_s1', 'enemy_origin_nullifier', p.nullifier),
  ],
  exits: [
    exit('approach_to_gate', { x: 0, y: 8, w: 1, h: 1 }, 'map_ch6_threshold_gate', 'from_approach'),
    exit(
      'approach_to_thrones',
      { x: 31, y: 8, w: 1, h: 1 },
      'map_ch6_hall_of_thrones',
      'from_approach',
      {
        requiresFlag: 'defeated_remnant_deacon',
        lockedDialogueId: 'ch6_approach_exit_locked',
      },
    ),
  ],
  triggers: [
    arrive('ch6_t_approach', 'ch6_approach_arrival'),
    zone('ch6_t_deacon', { x: 12, y: 6, w: 2, h: 5 }, 'ch6_deacon_confront', {
      unlessFlag: 'defeated_remnant_deacon',
    }),
  ],
}));

// 16. Hall of thrones (boss)
add('map_ch6_hall_of_thrones', 'Đại Điện Ngai Vàng', (p) => ({
  ambient: { color: '#ffe8a8', alpha: 0.08 },
  npcs: [
    npc('npc_ch6_kuro_back', 'npc_kuro', p.kuro, 'Kuro', 'ch6_kuro_watch', {
      visibleWhen: { flag: 'ch6_kuro_returned' },
      dialogueRules: [{ ifFlag: 'defeated_genesis_warden', dialogueId: 'ch6_kuro_after_warden' }],
    }),
    npc('npc_ch6_remnant', 'npc_chronos_remnant', p.remnant, 'Dư Ảnh Chronos', 'ch6_remnant', {
      visibleWhen: { flag: 'defeated_genesis_warden' },
      dialogueRules: [{ ifFlag: 'ch6_remnant_spoke', dialogueId: 'ch6_remnant_after' }],
    }),
  ],
  interactables: [
    poi('poi_ch6_name_stone', p.names, '[E] Xem phiến đá', 'ch6_name_stone', {
      visibleWhen: { flag: 'defeated_genesis_warden' },
    }),
    poi('poi_ch6_crack_c', p.crack, '[E] Xem khe nứt', 'ch6_nook_closed', {
      dialogueRules: [{ ifFlag: 'defeated_genesis_warden', dialogueId: 'ch6_nook_open' }],
    }),
  ],
  encounters: [
    {
      id: 'enc_genesis_warden',
      enemyId: 'boss_genesis_warden',
      texture: 'boss_genesis_warden',
      anim: 'boss_genesis_warden_idle',
      tile: p.warden,
      defeatedFlag: 'defeated_genesis_warden',
      hitbox: 36,
      victoryDialogueId: 'ch6_warden_defeated',
    },
  ],
  tileSwaps: [swap('ch6_remnant_spoke', p.gate, Ce.GAP)],
  exits: [
    exit(
      'thrones_to_approach',
      { x: 0, y: 11, w: 1, h: 1 },
      'map_ch6_sanctum_approach',
      'from_thrones',
    ),
    exit(
      'thrones_to_abyss',
      { x: 29, y: 11, w: 1, h: 1 },
      'map_ch6_first_void_abyss',
      'from_thrones',
      {
        requiresFlag: 'ch6_remnant_spoke',
        lockedDialogueId: 'ch6_thrones_exit_locked',
      },
    ),
  ],
  triggers: [
    arrive('ch6_t_thrones', 'ch6_thrones_arrival'),
    zone('ch6_t_kuro_back_help', { x: 6, y: 9, w: 6, h: 5 }, 'ch6_kuro_returns_help', {
      requiresFlag: 'ch5_choice_help_kuro',
    }),
    zone('ch6_t_kuro_back_stop', { x: 6, y: 9, w: 6, h: 5 }, 'ch6_kuro_returns_stop', {
      requiresFlag: 'ch5_choice_stop_kuro',
    }),
    zone('ch6_t_warden_tip', { x: 12, y: 12, w: 7, h: 2 }, 'ch6_warden_kuro_tip', {
      requiresFlag: 'ch6_kuro_ally',
      unlessFlag: 'defeated_genesis_warden',
    }),
    zone('ch6_t_warden', { x: 12, y: 11, w: 7, h: 1 }, 'ch6_warden_confront', {
      unlessFlag: 'defeated_genesis_warden',
    }),
  ],
}));

// 17. First void abyss (end)
add('map_ch6_first_void_abyss', 'Vực Thẳm Hư Không', (p) => ({
  ambient: { color: '#3a2a60', alpha: 0.18 },
  triggers: [
    arrive('ch6_t_abyss', 'ch6_abyss_arrival'),
    zone('ch6_t_cliff', p.edge, 'ch6_cliff_1'),
  ],
}));

// 18. Nook (hidden C)
add('map_ch6_first_forgotten_nook', 'Hốc Đá Kẻ Đầu Tiên', (p) => ({
  ambient: { color: '#2a1840', alpha: 0.2 },
  interactables: [
    poi('poi_ch6_nook', p.engrave, '[E] Khắc', 'ch6_nook_wrong', {
      radius: 30,
      dialogueRules: [
        { ifFlag: 'ch6_echo_awake', dialogueId: 'ch6_nook_done' },
        { ifFlags: ['ch6_nk_s1_a', 'ch6_nk_s2_n', 'ch6_nk_s3_x'], dialogueId: 'ch6_nook_right' },
        { ifFlag: 'ch6_nk_s1_none', dialogueId: 'ch6_nook_empty' },
      ],
    }),
    poi('poi_ch6_nook_back', p.back, '[E] Quay lên', 'ch6_nook_back'),
  ],
  dials: p.slots.map((t, k) => dial(`ch6_nk_s${k + 1}`, t, `[E] Khe thứ ${k + 1}`, glyphVals(ALL))),
  encounters: [
    {
      id: 'enc_echo_forgotten',
      enemyId: 'boss_echo_forgotten',
      texture: 'boss_echo_forgotten',
      anim: 'boss_echo_forgotten_idle',
      tile: p.echo,
      defeatedFlag: 'defeated_echo_first_forgotten',
      hitbox: 30,
      victoryDialogueId: 'ch6_echo_defeated',
      visibleWhen: { flag: 'ch6_echo_awake' },
    },
  ],
  triggers: [
    arrive('ch6_t_nook', 'ch6_nook_arrival'),
    zone('ch6_t_echo', { x: 8, y: 4, w: 5, h: 1 }, 'ch6_echo_confront', {
      requiresFlag: 'ch6_echo_awake',
      unlessFlag: 'defeated_echo_first_forgotten',
    }),
  ],
}));

for (const [id, m] of Object.entries(M)) maps.maps[id] = m;
fs.writeFileSync('public/assets/data/maps.json', JSON.stringify(maps, null, 2) + '\n');
console.log('wired', Object.keys(M).length, 'maps');
