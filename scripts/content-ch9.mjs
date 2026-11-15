/**
 * Chapter 9 "The Fractured Divinity" content: dialogue nodes, quests and items.
 * Lines come from Antigravity's script (docs/story/CHAPTER_09_SCRIPT.md, parsed by
 * scripts/parse-ch9-script.mjs into scripts/data/ch9-script.json). Claude maps the plain-word
 * effects to data, turns the answer-choice puzzles into dial puzzles (the right/wrong lines stay),
 * applies the §20/§22 rule changes and writes the four ending chains (design §15).
 * Idempotent: re-running replaces every ch9_ node / quest / item it defines.
 *
 * Usage: node scripts/parse-ch9-script.mjs && node scripts/content-ch9.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const dlg = read('public/assets/data/dialogue.json');
const quests = read('public/assets/data/quests.json');
const items = read('public/assets/data/items.json');
const script = read('scripts/data/ch9-script.json');
const D = dlg.dialogues;
for (const k of Object.keys(D)) if (k.startsWith('ch9_')) delete D[k];

const clean = (s) =>
  s
    .replace(/\s*\$\\to\$\s*/g, ' → ')
    .replace(/`/g, '')
    .trim();
const grant = (itemId, more = {}) => ({
  grantItems: [{ itemId, quantity: 1 }],
  grantOnceFlag: `took_${itemId}`,
  ...more,
});

// ------------------------------------------------------------------ effects (from the script's words)
const FX = {
  ch9_apex_arrival_1: {
    setFlags: ['ch9_started', 'kuro_with_peter'],
    startQuest: 'quest_ch9_nexus_arrival',
  },
  ch9_c01_right: { setFlags: ['solved_tri_balance'], refreshMap: true },
  ch9_epochs_arrival: { startQuest: 'quest_ch9_unravel_truth' },
  ch9_clue_1_pickup: grant('clue_ch9_interval_rift', { setFlags: ['found_clue_ch9_1'] }),
  ch9_secret_1_pickup: grant('world_secret_ch9_chronos_grief'),
  ch9_clue_2_pickup: grant('clue_ch9_ledger_divergence', { setFlags: ['found_clue_ch9_2'] }),
  ch9_c02_right: { setFlags: ['solved_spectral_interference'], refreshMap: true },
  ch9_fb_01_trigger: { setFlags: ['seen_fb_01'] },
  ch9_clue_3_pickup: grant('clue_ch9_seal_spark', { setFlags: ['found_clue_ch9_3'] }),
  ch9_c03_right: { setFlags: ['solved_tri_witness'], refreshMap: true },
  ch9_clue_4_pickup: grant('clue_ch9_possible_mother', { setFlags: ['found_clue_ch9_4'] }),
  ch9_c04_right: { setFlags: ['solved_escapement'], refreshMap: true },
  ch9_clue_5_pickup: grant('clue_ch9_clock_stall', { setFlags: ['found_clue_ch9_5'] }),
  ch9_c05_right: {
    setFlags: ['solved_creation_palimpsest'],
    startQuest: 'quest_ch9_crossroad_decision',
  },
  ch9_route_choice_empty_chair: {
    setFlags: ['ch9_route_empty_chair', 'ch9_route_chosen'],
    startQuest: 'quest_ch9_path_of_empty_chair',
    refreshMap: true,
  },
  ch9_route_choice_puppet_master: {
    setFlags: ['ch9_route_puppet_master', 'ch9_route_chosen', 'kuro_left'],
    clearFlags: ['kuro_with_peter'],
    startQuest: 'quest_ch9_hunt_lieutenants',
    refreshMap: true,
  },
  ch9_c06_right: { setFlags: ['solved_penrose_steps'], refreshMap: true },
  ch9_inquisitor_defeat: { setFlags: ['ch9_inquisitor_spoke'] },
  ch9_c07_right: { setFlags: ['solved_memory_matrix'], refreshMap: true },
  ch9_architect_boss_win: { setFlags: ['ch9_architect_spoke'] },
  ch9_fb_02_trigger: { setFlags: ['seen_fb_02'] },
  ch9_companions_greet: { setFlags: ['met_lyra_ch9'] },
  ch9_neris_greet: { setFlags: ['met_neris_ch9'] },
  ch9_c08_right: { setFlags: ['solved_broken_chime'], refreshMap: true },
  ch9_secret_2_pickup: grant('world_secret_ch9_the_empty_chair'),
  ch9_side_quest_kuro_heart_trigger: { startQuest: 'quest_ch9_kuro_heart' },
  ch9_kuro_heart_open: { setFlags: ['kuro_heart_opened'] },
  ch9_c09_right: { setFlags: ['solved_astrolabe'], refreshMap: true },
  ch9_fb_03_trigger: { setFlags: ['seen_fb_03'] },
  ch9_c10_right: {
    ...grant('last_chronarch_blade'),
    setFlags: ['solved_final_inscription'],
    refreshMap: true,
  },
  ch9_bran_defeat: {
    grantItems: [{ itemId: 'divine_nectar_ampoule', quantity: 2 }],
    grantOnceFlag: 'ch9_nectar_bran',
  },
  ch9_lyra_boss_defeat: {
    grantItems: [{ itemId: 'divine_nectar_ampoule', quantity: 2 }],
    grantOnceFlag: 'ch9_nectar_lyra',
  },
  ch9_neris_boss_defeat: {
    grantItems: [{ itemId: 'divine_nectar_ampoule', quantity: 2 }],
    grantOnceFlag: 'ch9_nectar_neris',
  },
  ch9_other_peter_defeat: {
    grantItems: [{ itemId: 'divine_nectar_ampoule', quantity: 2 }],
    grantOnceFlag: 'ch9_nectar_other',
  },
  ch9_chronos_trapped_talk: { setFlags: ['chronos_plea_heard'], refreshMap: true },
  ch9_secret_3_pickup: grant('world_secret_ch9_malfunction_record'),
  ch9_crown_arrival: { startQuest: 'quest_ch9_the_final_choice' },
  ch9_fb_04_trigger: { setFlags: ['seen_fb_04'] },
  ch9_crypt_arrival: { startQuest: 'quest_ch9_crypt_of_vows' },
  ch9_c11_right: {
    ...grant('broken_divinity_edge'),
    setFlags: ['solved_permutation_cipher'],
    refreshMap: true,
  },
  ch9_quantum_arrival: { startQuest: 'quest_ch9_quantum_vault' },
  ch9_c12_right: {
    ...grant('empty_chair_token'),
    setFlags: ['solved_quantum_gears'],
    refreshMap: true,
  },
  ch9_sanctum_first_arrival: { startQuest: 'quest_ch9_first_legacy' },
  ch9_c13_right: { setFlags: ['solved_octagonal_inversion'], refreshMap: true },
  ch9_secrets_4_5_pickup: {
    grantItems: [
      { itemId: 'world_secret_ch9_thien_nguyen_testament', quantity: 1 },
      { itemId: 'world_secret_ch9_kuro_confession', quantity: 1 },
    ],
    grantOnceFlag: 'took_ch9_secrets_4_5',
  },
  ch9_void_boss_defeat: grant('sixfold_harmony_clasp'),
  ch9_sixfold_victory: { refreshMap: true },
};

/** Lines Claude changes on top of the script (§20/§22 rules, real past events). */
const LINES = {
  ch9_c13_intro: [
    'Trận Đồ Bát Giác: tám cột quanh mộ tượng. Đang sáng: cột 3, 6, 7, 8.',
    'Chạm một cột thì chính nó và hai cột kề bên cùng đảo sáng tối. Hãy thắp sáng cả tám cột.',
  ],
  ch9_clue_2_pickup: [
    'Dưới chân một trụ gương vỡ kẹp một trang giấy quen thuộc: [Bản Phân Kỳ Sổ Cái Ch5].',
    "Chữ viết tay của Kuro: 'Nếu Peter viết thư cho Alpha, áp lực nghịch lý tăng. Nếu Peter tha cho Alpha, vết nứt mở rộng.' Kuro đã tính trước cả lựa chọn của mình.",
  ],
  ch9_crown_gate_check: [
    'Vương Miện Vĩnh Hằng. Ba bệ đá đứng quanh mặt đồng hồ đang điểm 12:00.',
    'Một bệ để trao Ấn cho Chronos, một bệ để phá Ngai Vàng cùng Kuro. Bệ thứ ba... cần một trái tim đã được hàn gắn.',
  ],
};
/** Nodes that only offered the answer as a choice: the dial puzzle replaces them. */
const DROP = new Set([
  'ch9_c01_interact',
  'ch9_epilogue_arrival',
  'ch9_epilogue_walk',
  'ch9_epilogue_final_words',
]);
const KEEP_RESPONSE = (id, next) =>
  !/_(right|wrong)$/.test(next) && !/^ch9_end_/.test(next) && !/_fight(_p1)?$/.test(next);

for (const n of Object.values(script)) {
  if (DROP.has(n.id)) continue;
  const lines = (LINES[n.id] ?? n.lines).map(clean).filter((l) => !/^\(/.test(l) || l.length > 2);
  const responses = n.responses
    .filter((r) => script[r.nextDialogueId] && !DROP.has(r.nextDialogueId))
    .filter((r) => KEEP_RESPONSE(n.id, r.nextDialogueId))
    .map((r) => ({ text: clean(r.text), nextDialogueId: r.nextDialogueId }));
  const speaker = n.speaker === 'Dẫn chuyện' ? 'Peter' : n.speaker.replace(/\s*\(.*\)$/, '');
  D[n.id] = {
    id: n.id,
    speaker,
    lines: lines.length ? lines : ['…'],
    responses,
    ...(FX[n.id] ? { effects: FX[n.id] } : {}),
    ...(/_fb_0\d_trigger$/.test(n.id) ? { flashback: true } : {}),
  };
}
// The crossroad keeps both choices; the apex hands over to the scales.
D.ch9_apex_chronos_part.responses = [];
D.ch9_crown_gate_check.responses = [];
D.ch9_crown_gate_check.effects = { setFlags: ['ch9_crown_seen'] };
for (const id of [
  'ch9_endings_choice_all',
  'ch9_endings_choice_two',
  'ch9_endings_choice_true_prompt',
])
  delete D[id];

// ------------------------------------------------------------------ small nodes the maps need
const node = (id, speaker, lines, extra = {}) => {
  D[id] = { id, speaker, lines, responses: [], ...extra };
};
const P = (id, lines, extra) => node(id, 'Peter', lines, extra);
P('ch9_puzzle_done', ['Thử thách ở đây đã được giải.']);
P('ch9_wrong_generic', ['Không đúng. Mọi thứ trở về như cũ. Đọc lại manh mối đã.']);
P('ch9_exit_locked', ['Lối này còn đóng. Phải giải xong thử thách ở đây trước.']);
P('ch9_route_locked', ['Cánh cổng này không thuộc về con đường mình đã chọn.']);
P('ch9_crown_hint', [
  'Bệ thứ ba lạnh ngắt. Còn một con đường thứ ba... nhưng trái tim người bạn đồng hành vẫn chưa được hàn gắn.',
]);
P('ch9_pillar_flip', ['Cột đá và hai cột kề bên đảo sáng tối.']);
node('ch9_sixfold_phase_3_after', 'Peter', [
  'Trang Cuối đã được khắc. Thần Tính Lục Hợp lặng im. Con đường lên Vương Miện Vĩnh Hằng mở ra.',
]);

// ------------------------------------------------------------------ the four endings (design §15)
const chain = (prefix, speakerLines, finalFx) => {
  speakerLines.forEach(([speaker, lines], k) => {
    const id = `${prefix}_${k + 1}`;
    const last = k === speakerLines.length - 1;
    node(id, speaker, lines, {
      flashback: speaker === 'Ký ức',
      responses: last ? [] : [{ text: '…', nextDialogueId: `${prefix}_${k + 2}` }],
      ...(last ? { effects: finalFx } : {}),
    });
  });
};
const endFx = (flag) => ({
  setFlags: [flag, 'ch9_game_completed'],
  endChapter: 9,
});
chain(
  'ch9_end_1',
  [
    [
      'Peter',
      ['Mình đặt nửa Ấn Origin vào tay Chronos. Chiếc ấn khép lại nguyên vẹn, ánh vàng lạnh lùng.'],
    ],
    ['Kuro', ['Không... Peter! (Bão Khả Năng tắt lịm. Thân hình Kuro mờ dần vào Khoảng Giữa.)']],
    ['Chronos', ['Kim đồng hồ đi qua 12:00. Các thế giới, về chỗ của mình.']],
    [
      'Peter',
      [
        'Khánh Hòa, Sol-Karis, Beta tách khỏi nhau. Những người từng bị xóa tên biến mất, không để lại dấu vết.',
        'Mình tỉnh dậy trong tiệm đồng hồ. Nắng sớm, tiếng chuông cửa leng keng. Trong lòng là một khoảng trống không lấp được.',
      ],
    ],
    [
      'Peter',
      [
        '"Trật tự đã được bảo toàn. Nhưng cái giá của sự vĩnh cửu là những giấc mơ không bao giờ được bắt đầu."',
      ],
    ],
  ],
  endFx('ch9_ending_order'),
);
chain(
  'ch9_end_2',
  [
    [
      'Kuro',
      [
        'Cùng nhau nhé, Peter! (Hai lưỡi kiếm chém xuống. Ngai Vàng vỡ, Chronos tan thành muôn mảnh vàng.)',
      ],
    ],
    ['Peter', ['Sổ Khởi Nguyên bùng cháy. Mọi ranh giới tan biến, muôn vàn thực tại ùa vào nhau.']],
    ['Kuro', ['Tự do rồi! Tự do... (Kuro cười, nhưng đường viền thân thể cậu bắt đầu tan ra.)']],
    [
      'Peter',
      [
        'Không còn quá khứ, không còn tương lai. Tiệm đồng hồ trôi lơ lửng giữa biển mây tím, nửa thực nửa hư.',
      ],
    ],
    [
      'Peter',
      [
        '"Không còn xiềng xích, không còn cắt tỉa. Thực tại đã tự do, nhưng tự do trong một giấc mơ không bao giờ thức tỉnh."',
      ],
    ],
  ],
  endFx('ch9_ending_unbound'),
);
chain(
  'ch9_end_3',
  [
    [
      'Peter',
      [
        'Tao sẽ không ngồi vào đó một mình. Tao sẽ để lại một chiếc ghế trống cho mày, cho đến khi nào mày trở về.',
      ],
    ],
    [
      'Chronos',
      [
        'Trang giấy ta đánh rơi... Hóa ra sự sống không phải cỗ máy cần sửa. Ta đã canh một chiếc lồng quá lâu rồi.',
      ],
    ],
    [
      'Peter',
      [
        'Chronos tan thành làn gió ấm. Sáu quyền năng trở về với muôn loài, không còn ai phán xét ai.',
      ],
    ],
    [
      'Kuro',
      ['(Kuro móc ngón tay út vào tay mình, như hồi mười tuổi.) Lần này tao về kịp rồi đó.'],
    ],
    [
      'Peter',
      [
        'Cạnh Mỏ Neo Thời Gian, một chiếc ghế đá trắng được dựng lên, đợi người bạn tri kỷ.',
        'Bình minh Khánh Hòa. Quán cô Ba mở cửa, bé Na vẫy tay. Chiếc đồng hồ quả quýt tích tắc từng giây bình dị.',
      ],
    ],
    ['Bà Mai', ['Hai đứa về rồi đấy à? Cơm nước mẹ nấu xong cả rồi, mau vào ăn đi kẻo nguội.']],
    ['Peter', ['"CHRONO – The Fractured Divinity. Câu chuyện kết thúc, cuộc đời bắt đầu."']],
  ],
  endFx('ch9_ending_true'),
);
chain(
  'ch9_end_4',
  [
    [
      'Peter',
      [
        'Không nhà tù nào giam được Khả Năng, trừ chính Sổ Khởi Nguyên. Và mình... vốn là một trang của nó.',
      ],
    ],
    [
      'Kuro',
      [
        'Mày chịu làm trang giấy trắng giam tao sao, Peter? Rồi không một ai sẽ nhớ mày từng tồn tại!',
      ],
    ],
    [
      'Peter',
      [
        'Chỉ cần thế giới này được sống tiếp theo cách của nó. Tên của tao, có hay không... không còn quan trọng nữa.',
      ],
    ],
    [
      'Peter',
      [
        'Sổ Khởi Nguyên khép lại. Các thế giới tách rời và lành lặn. Ở Khánh Hòa, quán cô Ba vẫn mở cửa buổi sáng.',
        'Nhưng không ai còn nhớ góc phố ấy từng có một tiệm sửa đồng hồ nhỏ.',
      ],
    ],
    [
      'Peter',
      [
        'Trên đỉnh Tháp Neo, một chiếc ghế đá trắng đứng lặng giữa ngàn sao, vĩnh viễn trống không.',
      ],
    ],
    [
      'Peter',
      [
        '"Trang giấy đã trở về với cuốn sách. Người hùng đã cứu lấy thế giới, nhưng thế giới không còn chỗ cho anh."',
      ],
    ],
  ],
  endFx('ch9_ending_returned_page'),
);
D.ch9_kuro_boss_finisher_prompt.responses = [
  { text: 'Trang Giấy Trở Về', nextDialogueId: 'ch9_end_4_1' },
];
D.ch9_kuro_boss_finisher_prompt.effects = { setFlags: ['defeated_kuro_puppet_master'] };
D.ch9_sixfold_phase_3_finisher.responses = [
  { text: 'Khắc Trang Cuối', nextDialogueId: 'ch9_sixfold_victory' },
];
D.ch9_sixfold_victory.responses = [{ text: '…', nextDialogueId: 'ch9_sixfold_phase_3_after' }];
for (const [id, label, first] of [
  ['ch9_pick_order', '[KẾT THÚC 1: TRẬT TỰ VĨNH CỬU] Trao Ấn cho Chronos?', 'ch9_end_1_1'],
  [
    'ch9_pick_unbound',
    '[KẾT THÚC 2: VĨNH HẰNG BẤT TẬN] Cùng Kuro chém nát Ngai Vàng?',
    'ch9_end_2_1',
  ],
  [
    'ch9_pick_true',
    '[KẾT THÚC 3: CHÚA TỂ THỜI GIAN CUỐI CÙNG] Khắc lời thề Chiếc Ghế Trống?',
    'ch9_end_3_1',
  ],
])
  node(id, 'Bệ Vận Mệnh', [label], {
    responses: [
      { text: 'Chọn con đường này', nextDialogueId: first },
      { text: 'Chưa, để mình nghĩ thêm', nextDialogueId: 'ch9_pick_wait' },
    ],
  });
P('ch9_pick_wait', ['Mình lùi lại một bước. Đồng hồ vẫn đứng ở 12:00, chờ.']);

// ------------------------------------------------------------------ quests
const q = (id, title, description, kind, objectives, followUpQuestId, branchOf) => ({
  id,
  title,
  kind,
  chapter: 9,
  description,
  stage: 'inactive',
  objectives: objectives.map(([oid, text, flag]) => ({
    id: oid,
    description: text,
    completed: false,
    completeOnFlag: flag,
  })),
  ...(followUpQuestId ? { followUpQuestId } : {}),
  ...(branchOf ? { branchOf } : {}),
});
const CH9_QUESTS = [
  q(
    'quest_ch9_nexus_arrival',
    'Tâm Điểm Thức Tỉnh',
    'Kim đồng hồ đứng ở 11:59 của Giờ Thứ 25. Chronos đòi lại nửa Ấn Origin.',
    'main',
    [['obj_ch9_scales', 'Cân bằng Tam Thế', 'solved_tri_balance']],
    'quest_ch9_unravel_truth',
  ),
  q(
    'quest_ch9_unravel_truth',
    'Lần Theo Sự Thật',
    'Những manh mối lạ rải rác khắp Tâm Điểm.',
    'main',
    [
      ['obj_ch9_prism', 'Hòa quang phổ ba cổng', 'solved_spectral_interference'],
      ['obj_ch9_creeds', 'Phân xử ba lời chứng', 'solved_tri_witness'],
      ['obj_ch9_escapement', 'Chỉnh con lắc Giờ 25', 'solved_escapement'],
    ],
  ),
  q(
    'quest_ch9_crossroad_decision',
    'Ngã Rẽ',
    'Trang da thuộc đã lộ ra. Đã đến lúc chọn: tin Kuro, hay vạch mặt Kuro.',
    'main',
    [['obj_ch9_route', 'Đưa ra lựa chọn', 'ch9_route_chosen']],
  ),
  q(
    'quest_ch9_path_of_empty_chair',
    'Con Đường Chiếc Ghế Trống',
    'Peter tin Kuro. Hai người cùng đi lên Ngai Vàng Sáu Ấn.',
    'main',
    [
      ['obj_ch9_penrose', 'Leo Bậc Thang Penrose', 'solved_penrose_steps'],
      ['obj_ch9_matrix', 'Hoàn thành Ma Phương Ký Ức', 'solved_memory_matrix'],
      ['obj_ch9_architect', 'Vượt qua Kiến Trúc Sư Nguyên Thủy', 'defeated_primeval_architect'],
      ['obj_ch9_chimes', 'Lên dây Dàn Chuông Gãy Cánh', 'solved_broken_chime'],
      ['obj_ch9_astrolabe', 'Căn Thiên Cầu Vi Mô', 'solved_astrolabe'],
      ['obj_ch9_inscription', 'Khắc trang sách cuối', 'solved_final_inscription'],
    ],
    'quest_ch9_finale_sixfold',
  ),
  q(
    'quest_ch9_finale_sixfold',
    'Thần Tính Lục Hợp',
    'Chronos hợp nhất sáu quyền năng.',
    'main',
    [['obj_ch9_sixfold', 'Khắc Trang Cuối', 'defeated_sixfold_divinity']],
    'quest_ch9_the_final_choice',
  ),
  q(
    'quest_ch9_the_final_choice',
    'Quyết Định Cuối Cùng',
    'Đồng hồ điểm 12:00 ở Vương Miện Vĩnh Hằng.',
    'main',
    [['obj_ch9_choice', 'Chọn tương lai cho thực tại', 'ch9_game_completed']],
  ),
  q(
    'quest_ch9_hunt_lieutenants',
    'Bốn Đại Phó Tướng',
    'Kuro đã lộ mặt. Bốn phó tướng của hắn chặn đường tới Ngai Vàng Muôn Nhánh.',
    'main',
    [
      ['obj_ch9_bran', 'Hạ Bran Tái Sinh', 'defeated_lieutenant_bran'],
      ['obj_ch9_lyra', 'Hạ Pháp Quan Lyra', 'defeated_lieutenant_lyra'],
      ['obj_ch9_neris', 'Hạ Neris Mất Trí', 'defeated_lieutenant_neris'],
      ['obj_ch9_other', 'Hạ Peter Thứ Hai', 'defeated_lieutenant_other_peter'],
    ],
    'quest_ch9_puppet_master_end',
  ),
  q('quest_ch9_puppet_master_end', 'Kẻ Giật Dây', 'Kuro ngồi trên Ngai Vàng Muôn Nhánh.', 'main', [
    ['obj_ch9_kuro', 'Phong ấn Kuro', 'ch9_game_completed'],
  ]),
  q(
    'quest_ch9_crypt_of_vows',
    'Lời Thề Câm Lặng',
    'Bốn dũng sĩ vô danh chờ được xếp đúng chỗ.',
    'side',
    [['obj_ch9_vows', 'Giải mã hoán vị', 'solved_permutation_cipher']],
  ),
  q('quest_ch9_quantum_vault', 'Bánh Răng Lượng Tử', 'Bản vẽ cũ của Ivo về ba bánh răng.', 'side', [
    ['obj_ch9_gears', 'Căn ba bánh răng', 'solved_quantum_gears'],
  ]),
  q(
    'quest_ch9_first_legacy',
    'Di Sản Thiên Nguyên',
    'Tám cột đá quanh mộ tượng Thiên Nguyên.',
    'side',
    [
      ['obj_ch9_octagon', 'Thắp sáng tám cột', 'solved_octagonal_inversion'],
      ['obj_ch9_core', 'Hạ Lõi Kỳ Dị Hư Vô', 'defeated_void_singularity_core'],
    ],
  ),
  q('quest_ch9_kuro_heart', 'Trái Tim Kuro', 'Kuro đang giấu một nỗi sợ.', 'side', [
    ['obj_ch9_heart', 'Lắng nghe Kuro', 'kuro_heart_opened'],
  ]),
];
// The two routes branch off the crossroad decision.
const byQuest = Object.fromEntries(CH9_QUESTS.map((x) => [x.id, x]));
byQuest.quest_ch9_unravel_truth.followUpQuestId = 'quest_ch9_crossroad_decision';
byQuest.quest_ch9_path_of_empty_chair.branchOf = 'quest_ch9_crossroad_decision';
byQuest.quest_ch9_hunt_lieutenants.branchOf = 'quest_ch9_crossroad_decision';
quests.quests = quests.quests.filter((x) => !x.id.startsWith('quest_ch9_')).concat(CH9_QUESTS);
const lastCh8 = quests.quests.find((x) => x.id === 'quest_ch8_anchor_tower');
if (lastCh8) lastCh8.followUpQuestId = 'quest_ch9_nexus_arrival';

// ------------------------------------------------------------------ items (design §12, §7, §3.1)
const doc = (id, name, description, pages) => ({
  id,
  name,
  type: 'document',
  description,
  value: 0,
  stackable: false,
  maxStack: 1,
  pages,
});
const gear = (id, name, type, description, equip) => ({
  id,
  name,
  type,
  description,
  value: 0,
  stackable: false,
  maxStack: 1,
  equip,
});
const CH9_ITEMS = [
  doc('clue_ch9_interval_rift', 'Manh Mối: Dấu Vết Kẽ Nứt', 'Bản ghi không gian cổ.', [
    'Kẽ nứt ở Khoảng Giữa không tự mở ra. Có một luồng Khả Năng đã chủ động xé rách không gian, ngay khi thanh kiếm gãy phát sáng.',
  ]),
  doc('clue_ch9_ledger_divergence', 'Manh Mối: Sổ Cái Phân Kỳ', 'Một trang sổ cái viết tay.', [
    'Những dòng tính toán về từng lựa chọn của Peter, kèm mức áp lực nghịch lý mỗi lựa chọn đẩy lên.',
  ]),
  doc('clue_ch9_seal_spark', 'Manh Mối: Tàn Lửa Kích Nổ', 'Mảnh tinh thể ánh tím.', [
    'Vết nứt của Ấn Origin không do quá tải. Một tia Khả Năng tím đã kích nổ nó từ phía sau, đúng lúc Kẻ Giám Hộ gục ngã.',
  ]),
  doc('clue_ch9_possible_mother', 'Manh Mối: Người Mẹ Khả Dĩ', 'Mảnh tro tàn ánh tím nhạt.', [
    '"Bà Mai" ở đáy Hư Không không mang mã linh hồn Khánh Hòa. Đó có thể là một bản thể được tạo ra từ Khả Năng.',
  ]),
  doc('clue_ch9_clock_stall', 'Manh Mối: Kim 11:59', 'Nhật ký máy móc của tháp.', [
    'Kim đồng hồ bị ghim ở 11:59 bằng năng lượng Khả Năng, cho tới khi Chronos suy kiệt, buộc phải rời ngai.',
  ]),
  doc(
    'world_secret_ch9_chronos_grief',
    'Bí Mật I: Nỗi Đau Của Chronos',
    'Cuộn da thuộc phủ bụi vàng.',
    [
      'Khi ta tự tay cắt cành nhánh đầu tiên, nước mắt ta hóa thành cát thời gian.',
      'Ta không căm ghét những nhánh bị bỏ rơi. Ta chỉ không thể để tất cả cùng chết.',
    ],
  ),
  doc(
    'world_secret_ch9_the_empty_chair',
    'Bí Mật II: Chiếc Ghế Thứ Hai',
    'Bản vẽ ngai vàng nguyên thủy.',
    [
      'Bên cạnh ngai của Chronos luôn có chiếc ghế thứ hai của Thiên Nguyên. Hai vị thần cùng cầm cán cân.',
      'Khi Thiên Nguyên tự xóa tên, chiếc ghế phủ bụi nhưng chưa từng bị dỡ bỏ.',
    ],
  ),
  doc(
    'world_secret_ch9_malfunction_record',
    'Bí Mật III: Bản Ghi Lỗi Vận Hành',
    'Nhật ký của Cỗ Máy Khởi Nguyên.',
    [
      'Khi lệnh xóa tên chạy, áp lực nghẽn đã bứt một trang giấy văng ra khe nứt.',
      'Đó là trang giấy tự do duy nhất, không chịu bất kỳ luật lệ nào của số mệnh.',
    ],
  ),
  doc(
    'world_secret_ch9_thien_nguyen_testament',
    'Bí Mật IV: Lời Trăn Trối',
    'Lời Thiên Nguyên để lại.',
    ['Ta trao lại tên của ta cho trang giấy tự do trong tương lai. Hãy dạy Chronos cách dừng lại.'],
  ),
  doc('world_secret_ch9_kuro_confession', 'Bí Mật V: Lời Tự Thú', 'Mẩu giấy nhàu của Kuro.', [
    'Nếu tao biến mất, tao mong mày là người duy nhất gọi tên tao.',
  ]),
  gear(
    'last_chronarch_blade',
    'Kiếm Chúa Tể Cuối Cùng',
    'weapon',
    'Thanh kiếm gãy hoàn thiện bằng ánh sáng lam ngọc của bản thể Unwritten.',
    { attack: 29, speed: 4, reach: 48, swingMs: 280, echoPct: 0.2 },
  ),
  gear('broken_divinity_edge', 'Lưỡi Kiếm Thần Gãy', 'weapon', 'Lưỡi kiếm cổ từ Hầm Mộ Lời Thề.', {
    attack: 26,
    defense: 5,
    reach: 44,
    swingMs: 300,
  }),
  gear(
    'empty_chair_token',
    'Kỷ Vật Chiếc Ghế Trống',
    'charm',
    'Một chiếc ghế đá nhỏ xíu, mát lạnh trong lòng bàn tay.',
    { maxHp: 65, defense: 4 },
  ),
  gear(
    'sixfold_harmony_clasp',
    'Khóa Hòa Âm Sáu Ấn',
    'charm',
    'Sáu vòng ấn khóa vào nhau, ngân khẽ khi chạm.',
    { maxHp: 70, defense: 6, speed: 6 },
  ),
  {
    id: 'divine_nectar_ampoule',
    name: 'Ống Cam Lộ Thần Thánh',
    type: 'consumable',
    description: 'Hồi 180 HP và 40 MP.',
    value: 0,
    stackable: true,
    maxStack: 20,
    effects: { healAmount: 180, mpAmount: 40 },
  },
];
const ids = new Set(CH9_ITEMS.map((i) => i.id));
items.items = items.items.filter((i) => !ids.has(i.id)).concat(CH9_ITEMS);

write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/quests.json', quests);
write('public/assets/data/items.json', items);
const dangling = Object.values(D)
  .filter((n) => n.id.startsWith('ch9_'))
  .flatMap((n) =>
    n.responses.filter((r) => !D[r.nextDialogueId]).map((r) => `${n.id} → ${r.nextDialogueId}`),
  );
console.log(
  'ch9 content:',
  Object.keys(D).filter((k) => k.startsWith('ch9_')).length,
  'nodes,',
  CH9_QUESTS.length,
  'quests,',
  CH9_ITEMS.length,
  'items; dangling',
  dangling,
);
