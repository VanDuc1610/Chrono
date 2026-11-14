/**
 * Wires Chapter 4 (CHAPTER_04_DESIGN.md §12-§13) into the data files: the 13 map entries of
 * maps.json, the pickup / locked / revisit dialogue nodes the content pass did not include, and the
 * small content fixes from the T-62 review. Idempotent: re-running replaces the Chapter 4 entries.
 *
 * Usage: node scripts/wire-ch4.mjs
 */
import fs from 'fs';
import * as L from './ch4-layout.js';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const maps = read('public/assets/data/maps.json');
const dlg = read('public/assets/data/dialogue.json');
const items = read('public/assets/data/items.json');
const D = dlg.dialogues;

// ------------------------------------------------------------------ dialogue helpers
const node = (id, speaker, lines, extra = {}) => {
  D[id] = { id, speaker, lines, responses: [], ...extra };
};
const peter = (id, lines, extra) => node(id, 'Peter', lines, extra);
const take = (id, lines, itemId, quantity = 1) =>
  peter(id, lines, {
    effects: { grantItems: [{ itemId, quantity }], grantOnceFlag: `took_${itemId}` },
  });
const say = (id, to) => [{ text: to.text, nextDialogueId: to.next }];

// ------------------------------------------------------------------ review fixes (T-62)
D.ch4_courier_box_wrong.lines = [
  'Cạch... Chốt hòm giật khựng lại, các bánh răng cơ khí không chịu nhả khóa.',
  'Ba vòng xoay dường như chưa ăn khớp với nhật trình của người liên lạc.',
];
D.ch4_beacon_tower_inspect.lines = [
  'Trên đỉnh tháp có một tấm gương phản quang lớn xoay được tám hướng la bàn.',
  'Xoay gương tới hướng cần rọi rồi kéo cần phát tín hiệu.',
];
D.ch4_hydraulic_door_inspect.responses = [
  { text: 'Đặt bao lên đĩa cân', nextDialogueId: 'ch4_scale_pan_menu' },
  { text: 'Gạt cần lấy lại các bao', nextDialogueId: 'ch4_scale_reset_node' },
];
peter('ch4_scale_pan_menu', ['Đặt bao hàng lên đĩa nào?'], {
  responses: [
    { text: 'Đĩa trái', nextDialogueId: 'ch4_scale_left_menu' },
    { text: 'Đĩa phải', nextDialogueId: 'ch4_scale_right_menu' },
  ],
});
// The sentry asks; the answer is turned on the dial by the hatch door (four words, not two).
D.ch4_sentry_challenge.lines = [
  "Ai đó? Đêm nay lính gác hỏi 'Tro'.",
  '(Trên cửa hầm có một vòng chữ khắc xoay được. Xoay tới lời đáp rồi đáp lời.)',
];
D.ch4_sentry_challenge.responses = [];
D.ch4_sentry_wrong.lines = [
  'Sai mật lệnh! Kẻ lạ không được bước vào hầm tiền tiêu.',
  '(Hồn lính gác chĩa mũi giáo đẩy Peter lùi về sau bậc thềm hầm trú ẩn.)',
];
// Renard's confession leads into the cliff memory and opens the side quest of the shelter.
D.ch4_renard_confession.responses = [{ text: '…', nextDialogueId: 'ch4_flashback_cliff_vow' }];
D.ch4_renard_confession.effects = { startQuest: 'quest_ch4_last_sentry' };
D.ch4_chariot_passage.effects = {
  setFlags: ['opened_chariot_passage'],
  startQuest: 'quest_ch4_first_fallen',
};
// The altar's verse, then (the first time) the storm night.
D.ch4_monument_altar_inspect.responses = [
  { text: 'Đặt tay lên văn bia', nextDialogueId: 'ch4_flashback_cataclysm_eve' },
];
D.ch4_flashback_cataclysm_eve.effects = { setFlags: ['ch4_seen_cataclysm'] };
peter('ch4_monument_altar_reread', [
  'Văn bia trên bàn thờ khắc ba câu thơ:',
  "'Mở tay cho kẻ đã đẩy ta xuống vực; đọc nốt lá thư người cha chưa dám đọc; rồi thắp một ngọn nến cho những cái tên.'",
]);
// Aldric and Kaelen come to the monument once the treaty is whole; they leave after the letter.
D.ch4_treaty_puzzle_solve.effects = { setFlags: ['restored_peace_treaty'], refreshMap: true };
for (const id of [
  'ch4_aldric_truth',
  'ch4_aldric_comfort',
  'ch4_bran_release',
  'ch4_bran_memorial',
])
  D[id].effects = { ...D[id].effects, refreshMap: true };
// After Renard's confession (and the cliff memory) Bran waits by the ramparts: refresh the map.
D.ch4_flashback_cliff_vow.effects = { refreshMap: true };
// Renard appears by the lever once the ambush is beaten.
D.ch4_ramparts_ambush_cleared.effects = { setFlags: ['cleared_ramparts_ambush'], refreshMap: true };
// The seal opens the way to the quiet room (a map of its own).
D.ch4_finality_seal_restored.responses = [];
D.ch4_finality_seal_restored.effects = {
  setFlags: ['finality_seal_restored', 'learned_finality_resonance'],
  warpTo: { mapId: 'map_ch4_interval_sanctuary', spawnId: 'from_sanctum' },
};
// Saves past the Chapter 3 seal can walk on into Chapter 4.
D.ch3_seal_after.responses = [
  { text: 'Bước qua Cổng Ngưỡng sang vùng đất kế tiếp', nextDialogueId: 'ch3_seal_onward' },
  { text: 'Ở lại thêm một lát', nextDialogueId: null },
];
peter(
  'ch3_seal_onward',
  ['Ánh sáng Cổng Ngưỡng bao trùm lấy mình. Khi mở mắt ra, mình đã đứng ở vùng đất kế tiếp.'],
  { effects: { warpTo: { mapId: 'map_ch4_encampment_veridia', spawnId: 'from_ch3' } } },
);
// Sacks come in pairs and must stack (the scale needs two of a kind).
for (const id of ['sack_grain', 'sack_herbs', 'sack_sulfur']) {
  const sack = items.items.find((i) => i.id === id);
  if (sack) sack.stackable = true;
}
// Bran's roster also says where the first fallen lie.
const roster = items.items.find((i) => i.id === 'bran_company_roster');
if (roster && roster.pages.length < 2)
  roster.pages.push(
    'Dòng cuối, nét chữ run run:\nNhững người ngã xuống đầu tiên nằm dưới cỗ xe chiến cháy ngoài Cánh Đồng Tro.',
  );

// ------------------------------------------------------------------ new nodes
peter('ch4_camp_exit_locked', [
  'Thống Soái Aldric đang đứng giữa doanh trại. Nên chào ông ấy trước khi đi tiếp.',
]);
peter('ch4_compass_board', [
  'Bàn khắc la bàn trong lều chỉ huy. Góc bàn còn dòng ghi chú của người trực:',
  "'Buổi sáng, bóng cột cờ đại bản doanh đổ về Tây Bắc. Buổi chiều, bóng ấy đổ về Đông Bắc.'",
]);
take(
  'ch4_leaflet_take',
  ['Trên bàn quân báo có một tờ chỉ dẫn thiên văn cho lính liên lạc. Mình gấp lại cất đi.'],
  'astronomy_guide_leaflet',
);
peter('ch4_courier_box_open_again', ['Hòm thư đã mở, bên trong trống rỗng.']);
node('ch4_aldric_letter_wait', 'Thống Soái Aldric', [
  'Lá thư của Maelis... ta chưa đủ can đảm đọc nó. Cậu giữ hộ ta.',
  'Khi cuộc chiến này tới hồi kết, hãy đọc nó cho ta nghe ở Đài Tưởng Niệm.',
]);
node('ch4_bran_wait', 'Binh Nhì Bran', [
  'Đại đội tôi sẽ giữ Trường Lũy phía đông. Nếu anh tới được đó... tôi sẽ đợi.',
]);
take(
  'ch4_journal_take',
  ['Kẹp dưới bao cát là một trang nhật trình cháy cạnh.'],
  'courier_journal_scrap',
);
take(
  'ch4_manual_take',
  ['Một tờ sổ tay kỹ thuật dính bùn, ghi cách vận hành cửa thủy lực.'],
  'hydraulic_manual_sheet',
);
take(
  'ch4_ledger_take',
  ['Sổ bộ quân nhu của tiền đồn, vẫn còn đọc được vài dòng.'],
  'quartermaster_ledger',
);
take(
  'ch4_codebook_take',
  ['Trong túi áo một người lính gác có trang sổ ghi mật lệnh.'],
  'sentry_codebook_page',
);
take('ch4_sacks_grain', ['Hai bao lúa mạch quân nhu nằm dưới gầm ván.'], 'sack_grain', 2);
take('ch4_sacks_herbs', ['Hai bao thảo dược cứu thương còn khô ráo.'], 'sack_herbs', 2);
take('ch4_sacks_sulfur', ['Hai bao lưu huỳnh công binh, nồng mùi diêm sinh.'], 'sack_sulfur', 2);
peter('ch4_hydraulic_door_open', [
  'Cánh cửa thủy lực đã mở. Lối sang tiền đồn Sol-Karis thông suốt.',
]);
peter('ch4_door_locked', [
  'Cánh cửa thủy lực đóng chặt. Cơ cấu hai đĩa cân bên cạnh mới mở được nó.',
]);
node('ch4_elion_after', 'Sử Quan Elion', [
  'Cuộc chiến này đã có đủ người chép sử rồi. Giờ nó cần một người kết thúc.',
]);
peter('ch4_solkaris_gate_locked', [
  'Lính gác Sol-Karis chặn cổng phía đông. Phải gặp Đại Tướng Kaelen trước đã.',
]);
take(
  'ch4_tower_grid_take',
  ['Dưới chân tháp tín hiệu có tấm bản đồ tọa độ bọc da.'],
  'artillery_grid_map',
);
take(
  'ch4_tower_wind_take',
  ['Trên cột đo gió còn buộc một cuốn nhật ký hướng gió.'],
  'wind_vane_record',
);
take(
  'ch4_tower_smoke_take',
  ['Trong hộc tháp có tờ quy ước tín hiệu của lính pháo thủ.'],
  'smoke_signal_code',
);
peter('ch4_beacon_done', ['Tấm gương vẫn hướng về ngọn đồi xa. Thung lũng đã yên tiếng tên.']);
peter('ch4_valley_exit_locked', [
  'Mưa tên trút xuống cửa ải phía đông. Phải khiến trận địa địch ngừng bắn trước.',
]);
take('ch4_relic_haft_take', ['Một cán gỗ dài bịt sắt cắm nghiêng trong đất.'], 'relic_long_haft');
take('ch4_relic_blade_take', ['Một lưỡi thép bản rộng vùi nửa trong bùn.'], 'relic_wide_blade');
take('ch4_relic_limb_take', ['Một thanh gỗ uốn cong nằm giữa đám lau cháy.'], 'relic_curved_limb');
take('ch4_relic_pole_take', ['Một cây sào cao còn buộc mảnh vải cháy xém.'], 'relic_tattered_pole');
take('ch4_plaque_take', ['Một mảnh bia đá vỡ, chữ khắc vẫn còn rõ.'], 'burial_plaque_scrap');
peter('ch4_mounds_done', ['Bốn ngọn lửa xanh vẫn cháy lặng lẽ trên bốn gò đất.']);
peter('ch4_ridge_ward_locked', [
  'Bức tường khí máu chặn lối lên pháo đài. Bốn gò đất tử sĩ đang tiếp sức cho nó.',
]);
peter('ch4_redoubt_exit_locked', ['Lá Cờ Huyết Sắc còn đứng, cổng sang Trường Lũy vẫn đóng.']);
peter('ch4_ramparts_arrival', [
  'Cổng đá phía sau sập xuống! Từ bốn phía trường lũy, lính địch đổ ra phục kích!',
]);
peter('ch4_ramparts_gate_locked', [
  'Cần gạt bẫy sập đã khóa cổng phía đông. Ai đó đã cố tình hạ nó xuống.',
]);
peter('ch4_cellar_locked', ['Nắp hầm trú ẩn khóa từ bên trong. Phải biết lối xuống mới vào được.']);
node('ch4_renard_after', 'Binh Nhì Renard', [
  "Cổng phía đông đã mở rồi... Hầm trú ẩn ở góc tây nam, lính gác dưới đó hỏi 'Tro'.",
]);
node('ch4_sentry_after', 'Hồn Lính Gác', [
  'Hồn lính gác khẽ gật đầu. Căn hầm đã được canh giữ đủ lâu rồi.',
]);
peter('ch4_chariot_plain', [
  'Xác cỗ xe chiến cháy rụi. Dưới gầm xe hình như có gì đó... nhưng không biết bắt đầu từ đâu.',
]);
peter('ch4_chariot_open', ['Lối thang đá dưới xác xe chiến vẫn mở.']);
take(
  'ch4_epitaph_take',
  ['Mình chép lại văn bia khắc trên đầu mộ vào sổ tay.'],
  'first_fallen_epitaph',
);
peter('ch4_tomb_open_again', ['Nắp mộ đã mở. Người chiến binh đầu tiên đã được yên nghỉ.']);
peter('ch4_treaty_missing', [
  'Bàn đá có bốn rãnh, mỗi rãnh vừa một mảnh giấy da. Vẫn còn thiếu mảnh hiệp ước.',
]);
peter('ch4_treaty_done', ['Bản hiệp ước đã liền lại trên bàn đá, chữ son vẫn ấm ánh vàng.']);
node('ch4_kaelen_monument', 'Đại Tướng Kaelen', [
  'Ta và lão già này... đã đợi ba trăm năm cho một buổi chiều yên tĩnh như thế này.',
]);
peter('ch4_sanctum_locked', [
  'Aldric và Kaelen vẫn đang đợi mình đọc lá thư. Chưa thể bước vào Thánh Điện lúc này.',
]);
peter('ch4_pillars_hint', [
  'Ba trụ đá tắt lịm quanh sàn: một khắc bàn tay mở, một khắc lá thư, một khắc ngọn nến.',
]);

// ------------------------------------------------------------------ map helpers
const WAR = {
  tileset: {
    name: 'warfield_tileset',
    key: 'warfield_tileset',
    path: 'assets/tilesets/warfield_tileset.png',
  },
  collision: { fromGid: 17, toGid: 64 },
};
const DUNGEON = {
  tileset: {
    name: 'dungeon_tileset',
    key: 'dungeon_tileset',
    path: 'assets/tilesets/dungeon_tileset.png',
  },
  collision: { fromGid: 4, toGid: 16 },
};
const OPEN = L.W.TRAIL; // a wall tile swapped to this becomes walkable ground
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
const roamer = (id, enemyId, tile, extra = {}) => {
  const texture = enemyId;
  return { id, enemyId, texture, anim: `${texture}_idle`, tile, ...extra };
};
const exit = (id, area, toMap, toSpawn, extra = {}) => ({ id, area, toMap, toSpawn, ...extra });
const dial = (id, tile, prompt, values, extra = {}) => ({
  id,
  tile,
  radius: 40,
  prompt,
  values,
  ...extra,
});
const DIRS = [
  ['n', 'Bắc'],
  ['ne', 'Đông Bắc'],
  ['e', 'Đông'],
  ['se', 'Đông Nam'],
  ['s', 'Nam'],
  ['sw', 'Tây Nam'],
  ['w', 'Tây'],
  ['nw', 'Tây Bắc'],
].map(([key, label]) => ({ key, label }));
// Four-slot dials start empty, so no slot is right before the player has reasoned it out.
const EMPTY = { key: 'none', label: '(trống)' };
const RELICS = [
  ['haft', 'Cán gỗ dài'],
  ['blade', 'Lưỡi thép rộng'],
  ['limb', 'Thanh gỗ cong'],
  ['pole', 'Cây sào vải'],
].map(([key, label]) => ({ key, label }));
const RELIC_ITEMS = [
  'relic_long_haft',
  'relic_wide_blade',
  'relic_curved_limb',
  'relic_tattered_pole',
];
const SCRAPS = [
  'treaty_scrap_land',
  'treaty_scrap_prisoners',
  'treaty_scrap_waters',
  'treaty_scrap_signatures',
];

function entry(def, name, extra) {
  const layout = def.build();
  return {
    id: def.id,
    name,
    chapter: 4,
    tilemap: { key: def.id, path: `assets/maps/${def.id}.json` },
    ...(def.tileset === 'warfield' ? WAR : DUNGEON),
    layers: { ground: 'Ground', walls: 'Walls' },
    bgm: 'ambient',
    spawns: layout.spawns,
    revive: layout.spawns.revive ?? layout.spawns.default,
    npcs: [],
    interactables: [],
    ...extra(layout.points, layout),
  };
}
const byId = Object.fromEntries(L.CH4_MAPS.map((m) => [m.id, m]));
const M = {};
const add = (id, name, extra) => (M[id] = entry(byId[id], name, extra));

// 1. Veridia encampment
add('map_ch4_encampment_veridia', 'Doanh Trại Veridia', (p) => ({
  ambient: { color: '#ff6a3a', alpha: 0.08 },
  npcs: [
    npc('npc_ch4_aldric', 'npc_aldric', p.aldric, 'Thống Soái Aldric', 'ch4_aldric_intro', {
      dialogueRules: [
        { ifItem: 'maelis_letter', dialogueId: 'ch4_aldric_letter_wait' },
        { ifFlag: 'met_general_aldric', dialogueId: 'ch4_aldric_talk_repeat' },
      ],
    }),
    npc('npc_ch4_bran', 'npc_soldier_bran', p.bran, 'Binh Nhì Bran', 'ch4_soldier_bran_intro', {
      dialogueRules: [{ ifFlag: 'received_bran_roster', dialogueId: 'ch4_bran_wait' }],
    }),
  ],
  interactables: [
    poi('poi_ch4_compass', p.compass, '[E] Xem bàn khắc la bàn', 'ch4_compass_board'),
    poi('poi_ch4_leaflet', p.leaflet, '[E] Xem bàn quân báo', 'ch4_leaflet_take'),
    poi('poi_ch4_courier_box', p.box, '[E] Kéo chốt hòm thư', 'ch4_courier_box_wrong', {
      dialogueRules: [
        { ifFlag: 'opened_courier_box', dialogueId: 'ch4_courier_box_open_again' },
        {
          ifFlags: ['ch4_dial_dir_ne', 'ch4_dial_angle_a45', 'ch4_dial_star_bacdau'],
          dialogueId: 'ch4_courier_box_solve',
        },
      ],
    }),
  ],
  dials: [
    dial('ch4_dial_dir', p.dial_dir, '[E] Xoay vòng Hướng', DIRS),
    dial('ch4_dial_angle', p.dial_angle, '[E] Xoay vòng Góc', [
      { key: 'a30', label: '30°' },
      { key: 'a45', label: '45°' },
      { key: 'a60', label: '60°' },
      { key: 'a90', label: '90°' },
    ]),
    dial('ch4_dial_star', p.dial_star, '[E] Xoay vòng Sao', [
      { key: 'mai', label: 'Sao Mai' },
      { key: 'hom', label: 'Sao Hôm' },
      { key: 'chucnu', label: 'Chức Nữ' },
      { key: 'bacdau', label: 'Bắc Đẩu' },
    ]),
  ],
  exits: [
    exit('camp_to_trench', { x: 25, y: 7, w: 1, h: 2 }, 'map_ch4_trench_crossroads', 'from_camp', {
      requiresFlag: 'met_general_aldric',
      lockedDialogueId: 'ch4_camp_exit_locked',
    }),
  ],
  triggers: [
    {
      id: 'trig_ch4_elder',
      on: 'arrive',
      onceFlag: 'ch4_arrived_veridia',
      delayMs: 500,
      dialogueId: 'ch4_elder_echo_gate',
    },
  ],
}));

// 2. Trench crossroads
add('map_ch4_trench_crossroads', 'Chiến Hào Giao Tuyến', (p) => ({
  ambient: { color: '#7a5a3a', alpha: 0.1 },
  interactables: [
    poi('poi_ch4_journal', p.journal, '[E] Lục bao cát', 'ch4_journal_take'),
    poi('poi_ch4_manual', p.manual, '[E] Nhặt tờ giấy', 'ch4_manual_take'),
    poi('poi_ch4_ledger', p.ledger, '[E] Xem sổ bộ', 'ch4_ledger_take'),
    poi('poi_ch4_codebook', p.codebook, '[E] Lục túi áo', 'ch4_codebook_take'),
    poi('poi_ch4_sacks_grain', p.sack_grain, '[E] Lấy bao hàng', 'ch4_sacks_grain'),
    poi('poi_ch4_sacks_herbs', p.sack_herbs, '[E] Lấy bao hàng', 'ch4_sacks_herbs'),
    poi('poi_ch4_sacks_sulfur', p.sack_sulfur, '[E] Lấy bao hàng', 'ch4_sacks_sulfur'),
    poi('poi_ch4_hydraulic_door', p.door, '[E] Xem cửa thủy lực', 'ch4_hydraulic_door_inspect', {
      dialogueRules: [{ ifFlag: 'reached_solkaris', dialogueId: 'ch4_hydraulic_door_open' }],
    }),
  ],
  scales: [
    {
      id: 'ch4_hydraulic',
      weights: { sack_grain: 10, sack_herbs: 5, sack_sulfur: 20 },
      balanceAt: 25,
      breakAbove: 35,
      balancedDialogueId: 'ch4_hydraulic_door_balanced',
      overloadDialogueId: 'ch4_hydraulic_door_overload',
    },
  ],
  roamers: [
    roamer('r_ch4_trench_phalanx_a', 'enemy_endless_phalanx', p.phalanx_a),
    roamer('r_ch4_trench_phalanx_b', 'enemy_endless_phalanx', p.phalanx_b),
    roamer('r_ch4_trench_carrier', 'enemy_banner_carrier', p.carrier),
  ],
  tileSwaps: [
    { when: { flag: 'reached_solkaris' }, layer: 'walls', tiles: L.TRENCH_DOOR, index: OPEN },
  ],
  exits: [
    exit('trench_to_camp', { x: 0, y: 7, w: 1, h: 2 }, 'map_ch4_encampment_veridia', 'from_trench'),
    exit(
      'trench_to_solkaris',
      { x: 27, y: 7, w: 1, h: 2 },
      'map_ch4_encampment_solkaris',
      'from_trench',
      {
        requiresFlag: 'reached_solkaris',
        lockedDialogueId: 'ch4_door_locked',
      },
    ),
  ],
  triggers: [
    {
      id: 'trig_ch4_trench',
      on: 'arrive',
      onceFlag: 'ch4_arrived_trench',
      delayMs: 400,
      dialogueId: 'ch4_trench_arrival',
    },
  ],
}));

// 3. Sol-Karis outpost
add('map_ch4_encampment_solkaris', 'Tiền Đồn Sol-Karis', (p) => ({
  ambient: { color: '#3a3a6a', alpha: 0.1 },
  npcs: [
    npc('npc_ch4_kaelen', 'npc_kaelen', p.kaelen, 'Đại Tướng Kaelen', 'ch4_kaelen_intro', {
      dialogueRules: [
        { ifFlag: 'met_general_kaelen', dialogueId: 'ch4_kaelen_confront' },
        { ifFlag: 'ch4_solkaris_store_lost', dialogueId: 'ch4_kaelen_cold' },
      ],
    }),
    npc(
      'npc_ch4_elion',
      'npc_chronicler_elion',
      p.elion,
      'Sử Quan Elion',
      'ch4_chronicler_elion_intro',
      {
        dialogueRules: [{ ifFlag: 'resolved_chronicler_elion', dialogueId: 'ch4_elion_after' }],
      },
    ),
  ],
  interactables: [
    poi('poi_ch4_rubble', p.rubble, '[E] Bới đống đổ nát', 'ch4_waters_rubble_find', {
      visibleWhen: { flag: 'ch4_solkaris_store_lost' },
    }),
  ],
  tileSwaps: [
    { when: { flag: 'met_general_kaelen' }, layer: 'walls', tiles: L.SOLKARIS_GATE, index: OPEN },
  ],
  exits: [
    exit(
      'solkaris_to_trench',
      { x: 0, y: 7, w: 1, h: 2 },
      'map_ch4_trench_crossroads',
      'from_solkaris',
    ),
    exit(
      'solkaris_to_valley',
      { x: 23, y: 7, w: 1, h: 2 },
      'map_ch4_arrow_storm_valley',
      'from_solkaris',
      {
        requiresFlag: 'met_general_kaelen',
        lockedDialogueId: 'ch4_solkaris_gate_locked',
      },
    ),
  ],
}));

// 4. Arrow-storm valley
add('map_ch4_arrow_storm_valley', 'Thung Lũng Mưa Tên', (p, layout) => ({
  ambient: { color: '#ff8a3c', alpha: 0.1 },
  interactables: [
    poi('poi_ch4_tower_grid', p.tower_grid, '[E] Xem tháp tín hiệu', 'ch4_tower_grid_take'),
    poi('poi_ch4_tower_wind', p.tower_wind, '[E] Xem cột đo gió', 'ch4_tower_wind_take'),
    poi('poi_ch4_tower_smoke', p.tower_smoke, '[E] Xem tháp tín hiệu', 'ch4_tower_smoke_take'),
    poi(
      'poi_ch4_mirror_lever',
      p.mirror_lever,
      '[E] Kéo cần phát tín hiệu',
      'ch4_beacon_tower_wrong',
      {
        dialogueRules: [
          { ifFlag: 'silenced_arrow_storm', dialogueId: 'ch4_beacon_done' },
          { ifFlag: 'ch4_dial_mirror_nw', dialogueId: 'ch4_beacon_tower_align' },
        ],
      },
    ),
  ],
  dials: [dial('ch4_dial_mirror', p.mirror_dial, '[E] Xoay gương', DIRS)],
  volleys: [
    {
      area: { x: 2, y: 2, w: 24, h: 12 },
      everyMs: 2600,
      warnMs: 1000,
      shots: 4,
      radius: 28,
      damage: 34,
      cover: layout.cover,
      untilFlag: 'silenced_arrow_storm',
    },
  ],
  roamers: [
    roamer('r_ch4_valley_sniper_a', 'enemy_ghost_sniper', p.sniper_a),
    roamer('r_ch4_valley_sniper_b', 'enemy_ghost_sniper', p.sniper_b),
  ],
  tileSwaps: [
    { when: { flag: 'silenced_arrow_storm' }, layer: 'walls', tiles: L.VALLEY_GATE, index: OPEN },
  ],
  exits: [
    exit(
      'valley_to_solkaris',
      { x: 0, y: 7, w: 1, h: 2 },
      'map_ch4_encampment_solkaris',
      'from_valley',
    ),
    exit(
      'valley_to_ridge',
      { x: 29, y: 7, w: 1, h: 2 },
      'map_ch4_red_ridge_battlefield',
      'from_valley',
      {
        requiresFlag: 'silenced_arrow_storm',
        lockedDialogueId: 'ch4_valley_exit_locked',
      },
    ),
  ],
  triggers: [
    {
      id: 'trig_ch4_valley',
      on: 'arrive',
      onceFlag: 'ch4_arrived_valley',
      delayMs: 400,
      dialogueId: 'ch4_arrow_storm_warning',
    },
    {
      id: 'trig_ch4_bread',
      on: 'zone',
      area: { x: 7, y: 4, w: 1, h: 8 },
      onceFlag: 'ch4_seen_bread',
      dialogueId: 'ch4_flashback_bread_correction',
    },
  ],
}));

// 5. Red ridge
const moundDial = (id, tile, side) =>
  dial(id, tile, `[E] Cắm binh khí (${side})`, [EMPTY, ...RELICS], { requiresItems: RELIC_ITEMS });
add('map_ch4_red_ridge_battlefield', 'Sống Núi Máu', (p) => ({
  ambient: { color: '#c83a2a', alpha: 0.1 },
  interactables: [
    poi('poi_ch4_relic_haft', p.relic_haft, '[E] Nhặt binh khí cổ', 'ch4_relic_haft_take'),
    poi('poi_ch4_relic_blade', p.relic_blade, '[E] Nhặt binh khí cổ', 'ch4_relic_blade_take'),
    poi('poi_ch4_relic_limb', p.relic_limb, '[E] Nhặt binh khí cổ', 'ch4_relic_limb_take'),
    poi('poi_ch4_relic_pole', p.relic_pole, '[E] Nhặt binh khí cổ', 'ch4_relic_pole_take'),
    poi('poi_ch4_plaque', p.plaque, '[E] Xem mảnh bia', 'ch4_plaque_take'),
    poi('poi_ch4_incense', p.incense, '[E] Thắp hương', 'ch4_mounds_wrong', {
      dialogueRules: [
        { ifFlag: 'solved_fallen_arms_array', dialogueId: 'ch4_mounds_done' },
        {
          ifFlags: [
            'ch4_mound_n_haft',
            'ch4_mound_e_limb',
            'ch4_mound_w_blade',
            'ch4_mound_c_pole',
          ],
          dialogueId: 'ch4_banner_ward_broken',
        },
      ],
    }),
  ],
  dials: [
    moundDial('ch4_mound_n', p.dial_north, 'Bắc'),
    moundDial('ch4_mound_w', p.dial_west, 'Tây'),
    moundDial('ch4_mound_e', p.dial_east, 'Đông'),
    moundDial('ch4_mound_c', p.dial_center, 'Trung Tâm'),
  ],
  roamers: [
    roamer('r_ch4_ridge_knight_a', 'enemy_undying_knight', p.knight_a),
    roamer('r_ch4_ridge_knight_b', 'enemy_undying_knight', p.knight_b),
    roamer('r_ch4_ridge_carrier_a', 'enemy_banner_carrier', p.carrier_a),
    roamer('r_ch4_ridge_carrier_b', 'enemy_banner_carrier', p.carrier_b),
    roamer('r_ch4_ridge_phalanx', 'enemy_endless_phalanx', p.phalanx),
  ],
  tileSwaps: [
    {
      when: { flag: 'solved_fallen_arms_array' },
      layer: 'walls',
      tiles: L.RIDGE_WARD,
      index: OPEN,
    },
  ],
  exits: [
    exit('ridge_to_valley', { x: 0, y: 8, w: 1, h: 2 }, 'map_ch4_arrow_storm_valley', 'from_ridge'),
    exit('ridge_to_redoubt', { x: 13, y: 0, w: 3, h: 1 }, 'map_ch4_crimson_redoubt', 'from_ridge', {
      requiresFlag: 'solved_fallen_arms_array',
      lockedDialogueId: 'ch4_ridge_ward_locked',
    }),
  ],
  triggers: [
    {
      id: 'trig_ch4_ridge',
      on: 'arrive',
      onceFlag: 'ch4_arrived_ridge',
      delayMs: 400,
      dialogueId: 'ch4_red_ridge_arrival',
    },
  ],
}));

// 6. Crimson redoubt
add('map_ch4_crimson_redoubt', 'Pháo Đài Cờ Huyết Sắc', (p) => ({
  ambient: { color: '#a8241e', alpha: 0.12 },
  encounters: [
    {
      id: 'enc_crimson_standard',
      enemyId: 'boss_crimson_standard',
      texture: 'boss_crimson_standard',
      anim: 'boss_crimson_standard_idle',
      tile: p.standard,
      defeatedFlag: 'defeated_crimson_standard',
      hitbox: 30,
      victoryDialogueId: 'ch4_crimson_standard_defeated',
    },
  ],
  tileSwaps: [
    {
      when: { flag: 'defeated_crimson_standard' },
      layer: 'walls',
      tiles: L.REDOUBT_GATE,
      index: OPEN,
    },
  ],
  exits: [
    exit(
      'redoubt_to_ridge',
      { x: 11, y: 15, w: 1, h: 1 },
      'map_ch4_red_ridge_battlefield',
      'from_redoubt',
    ),
    exit(
      'redoubt_to_ramparts',
      { x: 21, y: 7, w: 1, h: 2 },
      'map_ch4_fallen_ramparts',
      'from_redoubt',
      {
        requiresFlag: 'defeated_crimson_standard',
        lockedDialogueId: 'ch4_redoubt_exit_locked',
      },
    ),
  ],
  triggers: [
    {
      id: 'trig_ch4_standard',
      on: 'zone',
      area: { x: 8, y: 10, w: 7, h: 1 },
      onceFlag: 'ch4_met_crimson_standard',
      unlessFlag: 'defeated_crimson_standard',
      dialogueId: 'ch4_crimson_standard_confront',
    },
  ],
}));

// 7. Fallen ramparts
const ambush = (id, enemyId, tile) =>
  roamer(id, enemyId, tile, {
    group: 'ramparts_ambush',
    visibleWhen: { unlessFlag: 'cleared_ramparts_ambush' },
    sight: 400,
    leash: 900,
  });
add('map_ch4_fallen_ramparts', 'Trường Lũy Đổ Nát', (p) => ({
  ambient: { color: '#8a7a6a', alpha: 0.1 },
  npcs: [
    npc('npc_ch4_renard', 'npc_renard', p.renard, 'Binh Nhì Renard', 'ch4_renard_betrayal', {
      visibleWhen: { flag: 'cleared_ramparts_ambush' },
      dialogueRules: [{ ifFlag: 'experienced_renard_betrayal', dialogueId: 'ch4_renard_after' }],
    }),
    npc('npc_ch4_bran_ramparts', 'npc_soldier_bran', p.bran, 'Binh Nhì Bran', 'ch4_bran_choice', {
      visibleWhen: { flag: 'experienced_renard_betrayal', unlessFlag: 'resolved_soldier_bran' },
    }),
  ],
  roamers: [
    ambush('r_ch4_ambush_phalanx_a', 'enemy_endless_phalanx', p.ambush_phalanx_a),
    ambush('r_ch4_ambush_phalanx_b', 'enemy_endless_phalanx', p.ambush_phalanx_b),
    ambush('r_ch4_ambush_sniper', 'enemy_ghost_sniper', p.ambush_sniper),
    ambush('r_ch4_ambush_knight', 'enemy_undying_knight', p.ambush_knight),
  ],
  tileSwaps: [
    {
      when: { flag: 'experienced_renard_betrayal' },
      layer: 'walls',
      tiles: L.RAMPARTS_GATE,
      index: OPEN,
    },
  ],
  exits: [
    exit(
      'ramparts_to_redoubt',
      { x: 0, y: 7, w: 1, h: 2 },
      'map_ch4_crimson_redoubt',
      'from_ramparts',
    ),
    exit('ramparts_to_ash', { x: 25, y: 7, w: 1, h: 2 }, 'map_ch4_ash_plains', 'from_ramparts', {
      requiresFlag: 'experienced_renard_betrayal',
      lockedDialogueId: 'ch4_ramparts_gate_locked',
    }),
    exit(
      'ramparts_to_cellar',
      { x: 5, y: 13, w: 1, h: 1 },
      'map_ch4_sentry_cellar',
      'from_ramparts',
      {
        requiresFlag: 'experienced_renard_betrayal',
        lockedDialogueId: 'ch4_cellar_locked',
      },
    ),
  ],
  triggers: [
    {
      id: 'trig_ch4_ramparts',
      on: 'arrive',
      onceFlag: 'ch4_arrived_ramparts',
      delayMs: 400,
      dialogueId: 'ch4_ramparts_arrival',
    },
    {
      id: 'trig_ch4_ambush_cleared',
      on: 'zone',
      area: { x: 1, y: 1, w: 24, h: 14 },
      requiresFlag: 'cleared_ramparts_ambush',
      onceFlag: 'ch4_saw_ambush_cleared',
      dialogueId: 'ch4_ramparts_ambush_cleared',
    },
  ],
}));

// 8. Sentry cellar (hidden)
add('map_ch4_sentry_cellar', 'Hầm Trú Ẩn Tiền Tiêu', (p) => ({
  npcs: [
    npc('npc_ch4_sentry', 'enemy_ghost_sniper', p.sentry, 'Hồn Lính Gác', 'ch4_sentry_challenge', {
      prompt: '[E] Đến gần hồn lính gác',
      alpha: 0.75,
      tint: '#c8d8ff',
      dialogueRules: [{ ifFlag: 'answered_sentry', dialogueId: 'ch4_sentry_after' }],
    }),
  ],
  interactables: [
    poi('poi_ch4_sentry_answer', p.answer, '[E] Đáp lời', 'ch4_sentry_wrong', {
      dialogueRules: [
        { ifFlag: 'answered_sentry', dialogueId: 'ch4_sentry_after' },
        { ifFlag: 'ch4_dial_word_cui', dialogueId: 'ch4_sentry_answered' },
      ],
    }),
  ],
  dials: [
    dial('ch4_dial_word', p.dial_word, '[E] Xoay vòng chữ', [
      { key: 'lua', label: 'Lửa' },
      { key: 'cui', label: 'Củi' },
      { key: 'khoi', label: 'Khói' },
      { key: 'than', label: 'Than' },
    ]),
  ],
  exits: [
    exit(
      'cellar_to_ramparts',
      { x: 8, y: 11, w: 1, h: 1 },
      'map_ch4_fallen_ramparts',
      'from_cellar',
    ),
  ],
}));

// 9. Ash plains
add('map_ch4_ash_plains', 'Cánh Đồng Tro Tàn', (p) => ({
  ambient: { color: '#c8c0b8', alpha: 0.1 },
  interactables: [
    poi('poi_ch4_scrap_land', p.scrap_land, '[E] Bới đống tro', 'ch4_treaty_scrap_find'),
    poi(
      'poi_ch4_scrap_prisoners',
      p.scrap_prisoners,
      '[E] Xem chân cự kiếm',
      'ch4_treaty_scrap_prisoners_find',
    ),
    poi('poi_ch4_chariot', p.chariot, '[E] Xem xác xe chiến', 'ch4_chariot_plain', {
      dialogueRules: [
        { ifFlag: 'opened_chariot_passage', dialogueId: 'ch4_chariot_open' },
        { ifItem: 'bran_company_roster', dialogueId: 'ch4_chariot_passage' },
      ],
    }),
  ],
  roamers: [
    roamer('r_ch4_ash_wraith_a', 'enemy_memory_wraith', p.wraith_a),
    roamer('r_ch4_ash_wraith_b', 'enemy_memory_wraith', p.wraith_b),
    roamer('r_ch4_ash_phalanx', 'enemy_endless_phalanx', p.phalanx),
    roamer('r_ch4_ash_knight', 'enemy_undying_knight', p.knight),
  ],
  tileSwaps: [
    {
      when: { flag: 'opened_chariot_passage' },
      layer: 'walls',
      tiles: L.ASH_STAIRS,
      index: L.W.HATCH,
    },
  ],
  exits: [
    exit('ash_to_ramparts', { x: 0, y: 8, w: 1, h: 2 }, 'map_ch4_fallen_ramparts', 'from_ash'),
    exit(
      'ash_to_monument',
      { x: 27, y: 8, w: 1, h: 2 },
      'map_ch4_monument_of_the_fallen',
      'from_ash',
    ),
    exit(
      'ash_to_tomb',
      { x: 22, y: 4, w: 1, h: 1 },
      'map_ch4_tomb_of_the_first_fallen',
      'from_ash',
      {
        requiresFlag: 'opened_chariot_passage',
      },
    ),
  ],
  triggers: [
    {
      id: 'trig_ch4_ash',
      on: 'arrive',
      onceFlag: 'ch4_arrived_ash',
      delayMs: 400,
      dialogueId: 'ch4_ash_plains_arrival',
    },
  ],
}));

// 10. Tomb of the First Fallen (hidden)
const pedestal = (id, tile, n) =>
  dial(id, tile, `[E] Bệ ${n}`, [EMPTY, ...RELICS], { requiresItems: RELIC_ITEMS });
add('map_ch4_tomb_of_the_first_fallen', 'Mộ Người Đầu Tiên Ngã Xuống', (p) => ({
  ambient: { color: '#6a7a9a', alpha: 0.1 },
  interactables: [
    poi('poi_ch4_epitaph', p.epitaph, '[E] Đọc văn bia', 'ch4_epitaph_take'),
    poi('poi_ch4_tomb_lid', p.lid, '[E] Đẩy nắp mộ', 'ch4_tomb_first_fallen_inspect', {
      dialogueRules: [
        { ifFlag: 'opened_first_fallen_tomb', dialogueId: 'ch4_tomb_open_again' },
        {
          ifFlags: [
            'ch4_tomb_i_haft',
            'ch4_tomb_ii_blade',
            'ch4_tomb_iii_limb',
            'ch4_tomb_iv_pole',
          ],
          dialogueId: 'ch4_tomb_first_fallen_open',
        },
        { ifItems: RELIC_ITEMS, dialogueId: 'ch4_tomb_first_fallen_wrong' },
      ],
    }),
  ],
  dials: [
    pedestal('ch4_tomb_i', p.dial_i, 'I'),
    pedestal('ch4_tomb_ii', p.dial_ii, 'II'),
    pedestal('ch4_tomb_iii', p.dial_iii, 'III'),
    pedestal('ch4_tomb_iv', p.dial_iv, 'IV'),
  ],
  roamers: [roamer('r_ch4_tomb_guard', 'enemy_undying_knight', p.guard)],
  exits: [exit('tomb_to_ash', { x: 10, y: 13, w: 1, h: 1 }, 'map_ch4_ash_plains', 'from_tomb')],
}));

// 11. Monument of the Fallen
const SLOTS = [
  ['land', 'Đất Đai'],
  ['prisoners', 'Tù Binh'],
  ['waters', 'Nguồn Nước'],
  ['oath', 'Lời Thề'],
].map(([key, label]) => ({ key, label }));
add('map_ch4_monument_of_the_fallen', 'Đài Tưởng Niệm Vô Danh', (p) => ({
  ambient: { color: '#d8d0c0', alpha: 0.08 },
  npcs: [
    npc(
      'npc_ch4_aldric_monument',
      'npc_aldric',
      p.aldric,
      'Thống Soái Aldric',
      'ch4_aldric_kaelen_reunion',
      {
        visibleWhen: { flag: 'restored_peace_treaty', unlessFlag: 'resolved_aldric_letter' },
      },
    ),
    npc(
      'npc_ch4_kaelen_monument',
      'npc_kaelen',
      p.kaelen,
      'Đại Tướng Kaelen',
      'ch4_kaelen_monument',
      {
        visibleWhen: { flag: 'restored_peace_treaty' },
      },
    ),
  ],
  interactables: [
    poi('poi_ch4_altar', p.altar, '[E] Xem bàn thờ', 'ch4_monument_altar_inspect', {
      dialogueRules: [{ ifFlag: 'ch4_seen_cataclysm', dialogueId: 'ch4_monument_altar_reread' }],
    }),
    poi('poi_ch4_treaty_seal', p.seal_press, '[E] Đóng ấn hiệp ước', 'ch4_treaty_missing', {
      dialogueRules: [
        { ifFlag: 'restored_peace_treaty', dialogueId: 'ch4_treaty_done' },
        {
          ifItems: SCRAPS,
          ifFlags: [
            'ch4_slot_1_land',
            'ch4_slot_2_prisoners',
            'ch4_slot_3_waters',
            'ch4_slot_4_oath',
          ],
          dialogueId: 'ch4_treaty_puzzle_solve',
        },
        { ifItems: SCRAPS, dialogueId: 'ch4_treaty_wrong' },
      ],
    }),
  ],
  dials: [1, 2, 3, 4].map((n) =>
    dial(`ch4_slot_${n}`, p[`slot_${n}`], `[E] Rãnh hiệp ước ${n}`, [EMPTY, ...SLOTS], {
      requiresItems: SCRAPS,
    }),
  ),
  tileSwaps: [
    {
      when: { flag: 'resolved_aldric_letter' },
      layer: 'walls',
      tiles: L.MONUMENT_GATE,
      index: L.W.FLAGSTONE,
    },
  ],
  exits: [
    exit('monument_to_ash', { x: 0, y: 7, w: 1, h: 2 }, 'map_ch4_ash_plains', 'from_monument'),
    exit(
      'monument_to_sanctum',
      { x: 11, y: 0, w: 3, h: 1 },
      'map_ch4_sanctum_of_finality',
      'from_monument',
      {
        requiresFlag: 'resolved_aldric_letter',
        lockedDialogueId: 'ch4_sanctum_locked',
      },
    ),
  ],
}));

// 12. Sanctum of Finality
add('map_ch4_sanctum_of_finality', 'Thánh Điện Điểm Dừng', (p) => ({
  ambient: { color: '#e8e0ff', alpha: 0.08 },
  bgm: 'ambient',
  interactables: [
    poi(
      'poi_ch4_finality_seal',
      p.seal,
      '[E] Chạm vào Lõi Phong Ấn',
      'ch4_finality_seal_restored',
      {
        requiresFlag: 'defeated_the_last_war',
      },
    ),
  ],
  encounters: [
    {
      id: 'enc_the_last_war',
      enemyId: 'boss_the_last_war',
      texture: 'boss_the_last_war',
      anim: 'boss_the_last_war_idle',
      tile: p.war,
      defeatedFlag: 'defeated_the_last_war',
      hitbox: 34,
      victoryDialogueId: 'ch4_last_war_boss_defeated',
    },
  ],
  exits: [
    exit(
      'sanctum_to_monument',
      { x: 11, y: 15, w: 1, h: 1 },
      'map_ch4_monument_of_the_fallen',
      'from_sanctum',
    ),
  ],
  triggers: [
    {
      id: 'trig_ch4_pillars',
      on: 'arrive',
      onceFlag: 'ch4_saw_pillars',
      delayMs: 400,
      dialogueId: 'ch4_pillars_hint',
    },
    {
      id: 'trig_ch4_last_war',
      on: 'zone',
      area: { x: 8, y: 10, w: 7, h: 1 },
      onceFlag: 'ch4_met_last_war',
      unlessFlag: 'defeated_the_last_war',
      dialogueId: 'ch4_last_war_boss_confront',
    },
  ],
}));

// 13. The quiet ruined room
add('map_ch4_interval_sanctuary', 'Gian Phòng Đổ Nát', (p) => ({
  ambient: { color: '#7a5cff', alpha: 0.12 },
  npcs: [
    npc('npc_ch4_kuro', 'npc_kuro', p.kuro, 'Kuro', 'ch4_kuro_direct_meeting', {
      prompt: '[E] Bước tới gần',
      visibleWhen: { unlessFlag: 'met_kuro_first_time' },
    }),
  ],
  exits: [],
  triggers: [
    {
      id: 'trig_ch4_kuro',
      on: 'arrive',
      onceFlag: 'ch4_kuro_meeting_started',
      delayMs: 1200,
      dialogueId: 'ch4_kuro_direct_meeting',
    },
  ],
}));

for (const [id, m] of Object.entries(M)) maps.maps[id] = m;
write('public/assets/data/maps.json', maps);
write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/items.json', items);
console.log('wired', Object.keys(M).length, 'maps');
