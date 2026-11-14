/**
 * Chapter 5 expansion content (docs/story/CHAPTER_05_EXPANSION.md, as revised in §9): eight
 * new puzzles (EX-01..EX-08) and three side quests. Run after scripts/content-ch5.mjs.
 * Idempotent: re-running replaces every ch5x_ node, quest and the items it defines.
 *
 * Usage: node scripts/content-ch5x.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const dlg = read('public/assets/data/dialogue.json');
const quests = read('public/assets/data/quests.json');
const items = read('public/assets/data/items.json');
const D = dlg.dialogues;

const node = (id, speaker, lines, extra = {}) => {
  D[id] = { id, speaker, lines, responses: [], ...extra };
};
const P = (id, lines, extra) => node(id, 'Peter', lines, extra);
const K = (id, lines, extra) => node(id, 'Kuro', lines, extra);
const to = (text, next) => ({ text, nextDialogueId: next });
const gift = (list, once, more = {}) => ({
  grantItems: list.map(([itemId, quantity = 1]) => ({ itemId, quantity })),
  grantOnceFlag: once,
  ...more,
});
const take = (id, lines, itemId, more = {}) =>
  P(id, lines, { effects: gift([[itemId]], `took_${itemId}`, more) });

// Kuro walks with Peter in the Alpha branch too.
if (D.ch5_kuro_alpha)
  D.ch5_kuro_alpha.lines = [
    'Nhánh của mày. Cái nhánh mày ở lại.',
    'Nhánh này có người không ưa tao. Tao đi sau mày, đừng ngoái lại.',
  ];

// ================================================================== EX-01 — rock and shadow (seed garden)
P(
  'ch5x_sun_stele',
  [
    'Tấm bia giữa sân đá khắc: "Vật chỉ mở lối khi bóng của nó che khuất dấu tích của thực tại đối nghịch."',
    'Dưới chân bia còn kẹp một mảnh giấy thiên văn.',
  ],
  { effects: gift([['interval_astronomy_scrap']], 'took_interval_astronomy_scrap') },
);
K('ch5x_kuro_shadow_hint', [
  'Thấy bệ cảm ứng kia không? Nó chỉ thức dậy ở nhánh tỉa.',
  'Nhưng sa thạch ở nhánh tỉa mục rồi, đẩy là vỡ. Muốn dời đá thì dời ở nhánh sống.',
]);
P('ch5x_rock_pruned', ['Khối sa thạch ở nhánh này mục nát. Chạm mạnh là vỡ vụn.']);
P('ch5x_sensor_living', ['Ở nhánh này, bệ cảm ứng chỉ là một phiến đá phẳng lặng.']);
P('ch5x_sensor_wrong', ['Bóng của khối đá chưa phủ trúng mạch ngầm. Bệ cảm ứng vẫn tối.']);
P(
  'ch5x_ex1_solved',
  ['Bóng khối đá phủ kín bệ cảm ứng. Mạch ngầm bừng sáng tím, cánh cửa phía đông bắc mở ra.'],
  { effects: { setFlags: ['ch5x_ex1_solved'] } },
);
P('ch5x_ex1_done', ['Bệ cảm ứng vẫn sáng dưới bóng khối đá.']);
P('ch5x_greenhouse_locked', [
  'Cánh cửa đá phía đông bắc đóng chặt. Có gì đó liên quan tới sân đá bên cạnh.',
]);

// ================================================================== EX-02 — weather box (greenhouse)
P('ch5x_greenhouse_arrival', [
  'Một nhà kính vòm kính rạn nứt. Ở giữa là bồn Nguyệt Thảo, nụ hoa héo rũ.',
]);
take('ch5x_journal_take', ['Một cuốn nhật ký bìa sứ nằm cạnh bình tưới.'], 'gardener_journal_p4');
P('ch5x_flower_living', [
  'Nguyệt Thảo ở nhánh sống: cánh nhợt, thân mềm oặt vì úng nước, gốc đất đen sũng. Không khí đọng lại, phiến lá run vì lạnh.',
]);
P('ch5x_flower_pruned', [
  'Nguyệt Thảo ở nhánh tỉa đã hóa thạch: thân cứng như kim loại, cánh hoa cháy xám vì nắng gắt khô hạn, búp non bị gió lốc xé toạc.',
]);
P('ch5x_weather_wrong', ['Lồng kính phun khí xì xì, nụ hoa khẽ co lại. Khí hậu chưa đúng.']);
P(
  'ch5x_weather_success',
  [
    'Màn sương mỏng phủ xuống, hơi ấm lan nhẹ, một làn gió thoảng đi qua. Nụ Nguyệt Thảo từ từ hé mở.',
    'Giữa nhụy hoa là một hạt mầm trong suốt. Sau bồn hoa, một bức tượng cũ hiện ra.',
  ],
  {
    effects: gift([['pure_interval_seed']], 'took_pure_interval_seed', {
      setFlags: ['ch5x_weather_balanced'],
      startQuest: 'quest_ch5x_gardener_requiem',
    }),
  },
);
P('ch5x_weather_done', ['Nguyệt Thảo nở rộ dưới màn sương.']);
P('ch5x_gardener_statue', [
  'Bức tượng một Người Làm Vườn ôm cành cây gãy. Dưới chân tượng có ba cái móc treo trống.',
  'Có ai đó từng treo chuông gió ở đây, để tiễn những cành cây bị tỉa.',
]);
take(
  'ch5x_chime_bronze_take',
  ['Một chiếc chuông gió bằng đồng. Lắc nhẹ: tiếng trầm và đục.'],
  'windchime_bronze',
);
take(
  'ch5x_chime_silver_take',
  ['Một chiếc chuông gió bằng bạc. Lắc nhẹ: tiếng ngân vừa phải.'],
  'windchime_silver',
);
take(
  'ch5x_chime_glass_take',
  ['Một chiếc chuông gió bằng thủy tinh. Lắc nhẹ: tiếng trong vắt.'],
  'windchime_glass',
);
P('ch5x_chimes_missing', ['Ba cái móc treo trống. Cần đủ ba chiếc chuông gió.']);
P('ch5x_chimes_wrong', [
  'Gió thổi qua, ba chiếc chuông kêu lộn xộn chói tai. Thứ tự này không giống một khúc tiễn đưa.',
]);
P(
  'ch5x_gardener_peace',
  [
    'Gió Interval thổi qua: trầm, rồi ngân, rồi trong vắt. Một khúc tiễn đưa.',
    'Người Làm Vườn bước tới, khựng lại, rồi từ từ quỳ xuống, buông chiếc kéo xuống thảm rêu bạc.',
  ],
  {
    effects: gift([['pruner_compassion_gem']], 'took_pruner_compassion_gem', {
      setFlags: ['pacified_the_gardener'],
    }),
  },
);
P('ch5x_chimes_done', ['Ba chiếc chuông gió khẽ ngân trong gió.']);

// ================================================================== EX-03 — Na's chalk sky (harbour)
P('ch5x_harbor_arrival', ['Bến thuyền vắng lặng. Mặt biển phẳng như gương.']);
P('ch5x_chalk_living', [
  'Bức tranh phấn trên cầu tàu bị sóng xóa mất một góc. Nét chữ trẻ con ghi bên cạnh:',
  '"Ở góc trời cao nhất, Na vẽ một mặt trời biết cười. Phía dưới mặt trời là thứ bay lượn tự do."',
]);
P('ch5x_chalk_pruned', [
  'Ở nhánh tỉa, cầu tàu sập một nửa. Trên vách gỗ gãy, bức vẽ phấn còn nguyên trong bóng râm:',
  '"Gần mặt biển nhất, Na luôn vẽ con thuyền buồm trắng của bố. Ngay trên con thuyền là ngọn tháp chiếu sáng trong đêm."',
]);
node('ch5x_coba_harbor', 'Cô Ba', [
  'Con bé Na vẽ trời kỳ lắm: lúc nào cũng vẽ từ trên cao nhất xuống tới mặt biển.',
  'Nó bảo vậy để cái gì trên trời cũng nhìn thấy được con thuyền của bố nó.',
]);
P('ch5x_chalk_wrong', [
  'Nét phấn lạo xạo rồi mờ đi. Bầu trời của Na chưa đúng thứ tự cô bé từng vẽ.',
]);
P(
  'ch5x_chalk_success',
  [
    'Bốn hình vẽ sáng lên cùng lúc. Dưới cầu tàu, một khoang gỗ nhỏ bật mở.',
    'Bên trong là một con hạc giấy gấp dở, trên cánh có số 999.',
  ],
  {
    effects: gift([['na_origami_crane_scrap']], 'took_na_origami_crane_scrap', {
      setFlags: ['ch5x_chalk_solved'],
      startQuest: 'quest_ch5x_na_paper_crane',
    }),
  },
);
P('ch5x_chalk_done', ['Bầu trời phấn của Na vẫn còn đó, rực rỡ.']);

// ================================================================== Na's thousandth crane (side quest)
node('ch5x_coba_crane_talk', 'Cô Ba', [
  'Con hạc thứ chín trăm chín mươi chín... Con bé gấp tới đó thì đổ bệnh. Phổi nó yếu lắm.',
  'Nó tin gấp đủ một nghìn con thì điều ước thành thật. Mà giấy màu ở nhà hết rồi con ơi.',
]);
take(
  'ch5x_paper_take',
  ['Trong ngăn tủ hoang tàn của nhánh tỉa còn sót một tờ giấy màu xanh ngọc.'],
  'origami_paper_cyan',
);
P('ch5x_bench_idle', ['Bàn thợ đồng hồ. Đồ nghề vẫn xếp ngay ngắn như của chính mình.']);
P(
  'ch5x_bench_fold',
  [
    'Mình ngồi xuống bàn thợ. Đôi tay quen sửa bánh răng gấp từng nếp giấy thật chậm.',
    'Con hạc thứ một nghìn hoàn thành.',
  ],
  {
    effects: {
      takeItems: [{ itemId: 'origami_paper_cyan', quantity: 1 }],
      grantItems: [{ itemId: 'thousandth_paper_crane', quantity: 1 }],
      grantOnceFlag: 'took_thousandth_paper_crane',
    },
  },
);
node(
  'ch5x_na_place_crane',
  'Bé Na',
  [
    '(Na đang ngủ thiếp đi. Mình đặt con hạc xanh ngọc cạnh gối cô bé.)',
    '(Na khẽ mỉm cười trong mơ, bàn tay nhỏ buông ra một sợi dây cói bện tóc có gắn chiếc bánh răng đồng hồ tí xíu.)',
  ],
  {
    effects: {
      takeItems: [{ itemId: 'thousandth_paper_crane', quantity: 1 }],
      grantItems: [{ itemId: 'na_braided_ribbon', quantity: 1 }],
      grantOnceFlag: 'took_na_braided_ribbon',
      setFlags: ['completed_na_crane_quest'],
    },
  },
);
node('ch5x_na_after', 'Bé Na', ['(Na ngủ say, con hạc xanh ngọc nằm cạnh gối.)']);

// ================================================================== EX-04 — three witnesses (tower)
P('ch5x_witness_stele', [
  'Bia đá vọng lâu: "Kẻ được ở lại luôn nói dối. Kẻ bị tỉa luôn nói thật. Kẻ lưu đày luôn nói ngược với kẻ bị tỉa."',
  'Bên dưới khắc thêm: "Ba dư ảnh của cùng một người. Ai giữ Chìa Khóa Lương Tâm?"',
]);
node('ch5x_ghost_x', 'Dư Ảnh X', ["Dư ảnh X: 'Z là kẻ bị tỉa.'"]);
node('ch5x_ghost_y', 'Dư Ảnh Y', ["Dư ảnh Y: 'Chiếc chìa khóa nằm trong ngực áo của Z.'"]);
node('ch5x_ghost_z', 'Dư Ảnh Z', ["Dư ảnh Z: 'X đang nói thật.'"]);
P('ch5x_witness_wrong', [
  'Ba dư ảnh tan thành khói xám rồi tụ lại. Phán xét sai khiến họ thêm thống khổ.',
]);
P(
  'ch5x_witness_success',
  ['Dư ảnh Z cúi đầu, mở ngực áo khói. Một chiếc chìa khóa sắt rơi xuống.'],
  {
    effects: gift([['conscience_iron_key']], 'took_conscience_iron_key', {
      setFlags: ['ch5x_witness_solved'],
    }),
  },
);
P('ch5x_witness_done', ['Ba dư ảnh đứng lặng.']);
P('ch5x_attic_locked', ['Cửa gác thượng vọng lâu khóa bằng một ổ khóa sắt.']);
P(
  'ch5x_attic_open',
  ['Chìa khóa xoay. Trên gác thượng chỉ có một cuộn giấy da, nét chữ của Kẻ Tỉa Cành.'],
  {
    effects: gift([['pruner_confession_parchment']], 'took_pruner_confession_parchment', {
      setFlags: ['opened_pruner_attic'],
    }),
  },
);
P('ch5x_attic_done', ['Gác thượng trống trơn.']);

// ================================================================== EX-05 — quantum star chart (observatory)
P('ch5x_observatory_arrival', [
  'Đài thiên văn đảo ngược. Kính viễn vọng đồng thau chĩa vào khoảng không không có sao.',
]);
take(
  'ch5x_lens_living_take',
  ['Một mảnh thấu kính khắc chòm sao, còn trong suốt.'],
  'astronomy_lens_living',
);
take(
  'ch5x_lens_pruned_take',
  ['Một mảnh thấu kính nứt chân chim, khắc cùng chòm sao nhưng lệch vị trí.'],
  'astronomy_lens_pruned',
);
take('ch5x_log_1_take', ['Bản ghi thiên văn trên bàn đọc.'], 'beta_astronomy_log_1');
take('ch5x_log_2_take', ['Một trang ghi thiên văn trong đống đổ nát.'], 'beta_astronomy_log_2');
P('ch5x_telescope_missing', ['Kính viễn vọng có hai khe cắm thấu kính, đều trống.']);
P('ch5x_telescope_wrong', ['Tia sáng tán xạ chói lòa rồi tắt. Tiêu điểm bị phân kỳ.']);
P(
  'ch5x_telescope_success',
  [
    'Hai chùm tia lam và tím giao nhau giữa vòm trần, đúng tại biểu tượng Con Thoi Thời Gian.',
    'Hòm tiếp tế của đài thiên văn bật mở.',
  ],
  {
    effects: gift([['quantum_astrolabe_charm']], 'took_quantum_astrolabe_charm', {
      setFlags: ['ch5x_observatory_aligned'],
    }),
  },
);
P('ch5x_telescope_done', ['Hai chùm tia vẫn giao nhau trên vòm trần.']);

// ================================================================== EX-06 — melody in a poem (shelter)
P('ch5x_poem_wall', [
  'Bài thơ ru khắc trên vách giường tầng:',
  '"Gió luồn khe đá buốt đôi mi, / Nước nhỏ giọt rầu rĩ chuỗi sầu bi. / Búa sắt gõ vang hồi báo tử, / Kính tan tành mộng vỡ chẳng còn chi."',
]);
take(
  'ch5x_mira_notes_take',
  ['Cuốn sổ nhỏ của Mira, ghi cách chơi cây đàn đồng thau.'],
  'mira_tuning_notes',
);
P('ch5x_piano_metal', ['Thử phím Kim Loại: kẹt cứng, chỉ kêu cạch khô khốc.']);
P('ch5x_piano_wrong', ['Cây đàn rít lên chói tai. Lũ trẻ giật mình rên rỉ trong giấc ngủ.']);
P(
  'ch5x_piano_success',
  [
    'Gió, nước, rồi ba tiếng thủy tinh trong vắt. Cả căn hầm lặng đi nghe.',
    'Nắp đàn bật ra một ngăn bí mật: một trục hộp nhạc bằng đồng.',
  ],
  {
    responses: [to('…', 'ch5x_kuro_mira_special')],
    effects: gift([['clockwork_music_cylinder']], 'took_clockwork_music_cylinder', {
      setFlags: ['ch5x_piano_melody_played'],
    }),
  },
);
K('ch5x_kuro_mira_special', [
  '(Mira tựa đầu vào vai Kuro, ngủ thiếp đi.)',
  'Bài này... mẹ tao cũng hát kiểu vậy. Lời khác, nhưng nhịp y hệt.',
]);
P('ch5x_piano_done', ['Cây đàn im lặng. Lũ trẻ đang ngủ.']);

// ================================================================== EX-07 — two-way hourglass (grey prune)
P('ch5x_hourglass_tablet', [
  'Bệ đá dưới đồng hồ cát khắc: "Cổng hư không chỉ nhận cát dừng ở vạch thứ tư."',
]);
take(
  'ch5x_grey_notes_take',
  ['Cuốn sổ của một người nghiên cứu Vùng Xám.'],
  'grey_researcher_notes',
);
const SAND = [0, 1, 2, 3, 4, 5];
const sandSet = (k) => ({
  clearFlags: SAND.filter((n) => n !== k).map((n) => `ch5x_sand_${n}`),
  setFlags: [`ch5x_sand_${k}`],
});
for (const k of SAND) {
  const up = k + 3;
  const living = up > 5 ? 0 : up;
  P(
    `ch5x_sand_l_${k}`,
    up > 5
      ? [
          'Lật đồng hồ ở nhánh sống: cát rót ào xuống, tràn quá vạch năm — bình vỡ, cát rơi sạch. Vạch 0.',
        ]
      : [`Lật đồng hồ ở nhánh sống: cát rót xuống. Khoang giữa ở vạch ${living}.`],
    { effects: sandSet(living) },
  );
  const down = Math.max(0, k - 2);
  P(
    `ch5x_sand_p_${k}`,
    [`Lật đồng hồ ở nhánh tỉa: cát bị hút ngược lên. Khoang giữa ở vạch ${down}.`],
    {
      effects: sandSet(down),
    },
  );
}
P('ch5x_hourglass_wrong', ['Khóa cân bằng kêu rắc. Cát nổ thành bụi xám, rơi sạch về vạch 0.'], {
  effects: sandSet(0),
});
P(
  'ch5x_hourglass_success',
  [
    'Cát dừng đúng vạch thứ tư. Hai dòng chảy đứng yên một nhịp thở, rồi kết tinh thành một chiếc bùa xám.',
  ],
  {
    effects: gift([['singularity_sand_charm']], 'took_singularity_sand_charm', {
      setFlags: ['ch5x_hourglass_balanced'],
    }),
  },
);
P('ch5x_hourglass_done', ['Đồng hồ cát đứng yên ở vạch thứ tư.']);

// ================================================================== EX-08 — mirror of the old choice (throne)
P('ch5x_mirror_letter', [
  'Gương Hư Vô hiện lên một người đàn ông tóc xoăn mỉm cười, buông một cành liễu xuống dòng nước xuôi.',
  'Từ vết nứt có tiếng thì thầm: "Hãy đặt lên đài thứ mà tâm hồn ngươi đã khắc ở Vọng Lâu."',
]);
P('ch5x_mirror_spared', [
  'Gương Hư Vô hiện lên một bàn tay nắm chặt chiếc nhẫn bạc đến mức tứa máu.',
  'Từ vết nứt có tiếng thì thầm: "Hãy đặt lên đài thứ mà tâm hồn ngươi đã khắc ở Vọng Lâu."',
]);
P('ch5x_mirror_blank', ['Gương Hư Vô mờ sương, chưa phản chiếu gì.']);
P('ch5x_altar_willow', ['Bệ Cành Liễu Gãy — sự buông bỏ.']);
P('ch5x_altar_ring', ['Bệ Chiếc Nhẫn Rỉ — sự níu giữ.']);
P('ch5x_mirror_wrong', [
  'Tấm gương hắt ra một tia sáng lạnh: "Lời tuyên thệ của ngươi mâu thuẫn với vết sẹo trong tim ngươi."',
]);
P(
  'ch5x_mirror_pass',
  [
    'Tấm gương lặng đi, rồi phản chiếu đúng gương mặt mình. Không lệch một nét.',
    'Tâm trí mình chưa bao giờ tĩnh như lúc này.',
  ],
  { effects: { setFlags: ['ch5x_mirror_passed', 'unity_mindset_active'] } },
);
P('ch5x_mirror_done', ['Tấm gương phản chiếu gương mặt mình, bình thản.']);

// ================================================================== Ivo's unfinished machine (side quest)
node(
  'ch5x_ivo_guilt_talk',
  'Kỹ Sư Ivo',
  [
    'Lò chạy rồi... nhưng tôi không dám mở van nước làm mát xuống hầm trẻ em.',
    'Năm đó chính công thức của tôi làm thành phố này nổ tung. Lỡ nó nổ thêm lần nữa thì sao?',
  ],
  { effects: { setFlags: ['ivo_guilt_heard'], startQuest: 'quest_ch5x_ivo_unfinished_machine' } },
);
P('ch5x_black_box_sealed', ['Một chiếc hòm sắt đen chôn dưới đống đổ nát. Không rõ của ai.']);
P(
  'ch5x_black_box_take',
  [
    'Chiếc hòm sắt đen của Thượng Hội Đồng. Bên trong là một hộp ghi dữ liệu và một văn bản niêm phong.',
  ],
  {
    effects: {
      grantItems: [
        { itemId: 'black_box_recorder', quantity: 1 },
        { itemId: 'council_override_decree', quantity: 1 },
      ],
      grantOnceFlag: 'took_black_box_recorder',
    },
  },
);
node(
  'ch5x_ivo_vindication',
  'Kỹ Sư Ivo',
  [
    '(Ivo đọc văn bản, tay run lên.) Viện Trưởng... tự ý đẩy công suất lên ba trăm phần trăm. Bất chấp cảnh báo đỏ của tôi.',
    '(Ông gạt cần xả áp. Tiếng nước chảy vang xuống hầm trú ẩn.) Cảm ơn cậu. Tôi đã mang nỗi tội không phải của mình trăm năm.',
  ],
  {
    effects: {
      takeItems: [{ itemId: 'council_override_decree', quantity: 1 }],
      grantItems: [
        { itemId: 'ivo_precision_lens', quantity: 1 },
        { itemId: 'chronos_coolant_flask', quantity: 3 },
      ],
      grantOnceFlag: 'took_ivo_precision_lens',
      setFlags: ['resolved_ivo_redemption', 'shelter_water_restored'],
    },
  },
);
node('ch5x_ivo_after', 'Kỹ Sư Ivo', ['Nước đã xuống tới hầm. Lũ trẻ sẽ không khát nữa.']);

// ================================================================== quests
const q = (id, title, description, objectives) => ({
  id,
  title,
  kind: 'side',
  chapter: 5,
  description,
  stage: 'inactive',
  objectives: objectives.map(([oid, text, flag]) => ({
    id: oid,
    description: text,
    completed: false,
    completeOnFlag: flag,
  })),
});
const CH5X_QUESTS = [
  q(
    'quest_ch5x_na_paper_crane',
    'Cánh Hạc Của Bé Na',
    'Bé Na gấp tới con hạc thứ chín trăm chín mươi chín thì đổ bệnh.',
    [['obj_ch5x_crane', 'Mang con hạc thứ một nghìn cho bé Na', 'completed_na_crane_quest']],
  ),
  q(
    'quest_ch5x_gardener_requiem',
    'Khúc Ca Của Người Cắt Tỉa',
    'Bức tượng một Người Làm Vườn ôm cành cây gãy, dưới chân là ba cái móc treo chuông trống.',
    [['obj_ch5x_chimes', 'Treo lại chuông gió tiễn đưa', 'pacified_the_gardener']],
  ),
  q(
    'quest_ch5x_ivo_unfinished_machine',
    'Cỗ Máy Dang Dở Của Ivo',
    'Ivo không dám mở van nước làm mát vì tin chính mình đã làm thành phố nổ tung.',
    [['obj_ch5x_ivo', 'Tìm sự thật cho Kỹ sư Ivo', 'resolved_ivo_redemption']],
  ),
];
quests.quests = quests.quests.filter((x) => !x.id.startsWith('quest_ch5x_')).concat(CH5X_QUESTS);

// ================================================================== items
const base = (id, name, type, description, more = {}) => ({
  id,
  name,
  type,
  description,
  value: 0,
  stackable: false,
  maxStack: 1,
  ...more,
});
const doc = (id, name, description, pages) => base(id, name, 'document', description, { pages });
const puz = (id, name, description) => base(id, name, 'puzzle', description);
const charm = (id, name, description, equip) => base(id, name, 'charm', description, { equip });
const CH5X_ITEMS = [
  doc(
    'interval_astronomy_scrap',
    'Mảnh Giấy Thiên Văn Interval',
    'Ghi chép vị trí các nguồn sáng trong The Interval.',
    [
      'Ở nhánh sống, mặt trời giả của Interval treo ở phía Đông.\nỞ nhánh tỉa, nguồn sáng duy nhất là vết nứt tím phía Bắc.',
    ],
  ),
  doc(
    'gardener_journal_p4',
    'Nhật Ký Người Làm Vườn — Trang 4',
    'Nhật ký chăm Nguyệt Thảo trong nhà kính.',
    [
      "'Nguyệt Thảo cần đúng thứ nhánh sống đang thiếu, và tránh mọi thứ đã giết nhánh tỉa.'",
      "'Chuông tiễn đưa treo từ tiếng trầm nhất tới tiếng trong nhất, móc thứ nhất tới móc thứ ba.'",
    ],
  ),
  puz('pure_interval_seed', 'Hạt Mầm Bất Tận', 'Hạt mầm trong suốt từ đóa Nguyệt Thảo.'),
  puz('windchime_bronze', 'Chuông Gió Đồng', 'Chiếc chuông gió bằng đồng.'),
  puz('windchime_silver', 'Chuông Gió Bạc', 'Chiếc chuông gió bằng bạc.'),
  puz('windchime_glass', 'Chuông Gió Thủy Tinh', 'Chiếc chuông gió bằng thủy tinh.'),
  charm('pruner_compassion_gem', 'Ngọc Trắc Ẩn', 'Viên ngọc Người Làm Vườn để lại khi buông kéo.', {
    attack: 3,
    maxMp: 18,
  }),
  doc(
    'na_origami_crane_scrap',
    'Con Hạc Giấy Thứ 999',
    'Con hạc giấy Na gấp dở trước khi đổ bệnh.',
    ['Trên cánh hạc, nét chữ nguệch ngoạc: "Con ước bố không phải thức đêm tỉa cây nữa."'],
  ),
  puz('origami_paper_cyan', 'Giấy Màu Xanh Ngọc', 'Tờ giấy màu còn sót trong ngăn tủ nhánh tỉa.'),
  puz(
    'thousandth_paper_crane',
    'Con Hạc Giấy Thứ 1.000',
    'Con hạc xanh ngọc do chính tay Peter gấp.',
  ),
  charm(
    'na_braided_ribbon',
    'Dây Cói Của Bé Na',
    'Sợi dây cói bện tóc có gắn một bánh răng đồng hồ tí xíu.',
    { maxHp: 30, defense: 4 },
  ),
  puz(
    'conscience_iron_key',
    'Chìa Khóa Lương Tâm',
    'Chiếc chìa khóa sắt lấy từ ngực áo của một dư ảnh.',
  ),
  doc(
    'pruner_confession_parchment',
    'Thư Thú Tội Của Kẻ Tỉa',
    'Cuộn giấy da trên gác thượng vọng lâu.',
    [
      "'Giọng nói ấy không có mặt. Nó chỉ nói: tỉa một nhánh, giữ một nhánh. Tôi đã tưởng đó là Chronos.'",
      "'Nhưng Chronos đã vỡ thành sáu mảnh từ lâu. Thứ giao kèo với tôi chỉ là phần còn sót lại — một cái kéo biết nói.'",
    ],
  ),
  puz(
    'astronomy_lens_living',
    'Thấu Kính Sao — Nhánh Sống',
    'Mảnh thấu kính khắc quỹ đạo sao nguyên vẹn.',
  ),
  puz(
    'astronomy_lens_pruned',
    'Thấu Kính Sao — Nhánh Tỉa',
    'Mảnh thấu kính khắc quỹ đạo sao bị lệch pha.',
  ),
  doc('beta_astronomy_log_1', 'Bản Ghi Thiên Văn Beta I', 'Nhật ký của đài thiên văn Beta.', [
    "'Khi thế giới còn nguyên vẹn, chòm sao Thiên Xứng nằm ở kinh độ 60°. Vết nứt Chronos bẻ cong ánh sáng một góc bằng đúng độ lệch pha thời gian.'",
  ]),
  doc(
    'beta_astronomy_log_2',
    'Bản Ghi Thiên Văn Beta II',
    'Trang ghi thiên văn tìm thấy trong đổ nát.',
    [
      "'Độ lệch pha giữa hai nhánh đo được là +30°. Tiêu điểm chỉ hội tụ khi góc nghiêng kính bằng kinh độ nguyên bản cộng độ lệch pha.'",
    ],
  ),
  charm(
    'quantum_astrolabe_charm',
    'Thước Đo Lượng Tử',
    'Bùa hộ mệnh của đài thiên văn đảo ngược.',
    { maxMp: 22, speed: 3 },
  ),
  doc(
    'mira_tuning_notes',
    'Sổ Tay Điều Âm Của Mira',
    'Cuốn sổ nhỏ ghi cách chơi cây đàn đồng thau.',
    [
      "'Phím Kim Loại kẹt rồi. Tụi mình chơi bù: chỗ nào cần tiếng kim khí thì gõ Thủy Tinh hai lần liền, nghe lạnh y như vậy.'",
    ],
  ),
  puz(
    'clockwork_music_cylinder',
    'Trục Hộp Nhạc Ru Con',
    'Trục đồng ghi giai điệu ru của hầm trú ẩn.',
  ),
  doc('grey_researcher_notes', 'Ghi Chép Của Người Vùng Xám', 'Sổ tay về đồng hồ cát hai chiều.', [
    "'Nhánh sống rót ba vạch mỗi lần lật, nhánh tỉa hút ngược hai. Quá năm vạch thì bình vỡ, cát rơi sạch.'",
  ]),
  charm(
    'singularity_sand_charm',
    'Cát Điểm Dị Thường',
    'Chiếc bùa kết tinh từ hai dòng cát đứng yên.',
    { defense: 8, maxHp: 10 },
  ),
  puz(
    'black_box_recorder',
    'Hộp Đen Lò Phản Ứng',
    'Thiết bị ghi dữ liệu điều áp của Thượng Hội Đồng.',
  ),
  doc(
    'council_override_decree',
    'Mật Lệnh Thượng Hội Đồng',
    'Văn bản niêm phong trong hòm sắt đen.',
    [
      "'Lệnh khẩn của Viện Trưởng: nâng công suất lò lên 300%. Bỏ qua mọi cảnh báo của kỹ sư trưởng Ivo.'",
      "'Ghi chú tay bên lề: Nếu có chuyện gì, ghi tên Ivo vào báo cáo.'",
    ],
  ),
  base(
    'chronos_coolant_flask',
    'Bình Nước Làm Mát Chronos',
    'consumable',
    'Nước làm mát lò pha thảo dược. Hồi 120 HP và 40 MP.',
    {
      stackable: true,
      maxStack: 20,
      effects: { healAmount: 120, mpAmount: 40 },
    },
  ),
  charm(
    'ivo_precision_lens',
    'Thấu Kính Chuẩn Xác Của Ivo',
    'Chiếc thấu kính đo đạc Ivo đeo suốt trăm năm.',
    { maxMp: 15, speed: 3 },
  ),
];
const ids = new Set(CH5X_ITEMS.map((i) => i.id));
items.items = items.items.filter((i) => !ids.has(i.id)).concat(CH5X_ITEMS);

write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/quests.json', quests);
write('public/assets/data/items.json', items);
console.log(
  'ch5x:',
  Object.keys(D).filter((k) => k.startsWith('ch5x_')).length,
  'nodes,',
  CH5X_QUESTS.length,
  'quests,',
  CH5X_ITEMS.length,
  'items',
);
