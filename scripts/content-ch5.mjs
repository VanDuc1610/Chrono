/**
 * Chapter 5 "The Garden of Infinite Possibilities" content (docs/story/CHAPTER_05_DESIGN.md §1-§14):
 * dialogue nodes, quests and items. Written by Claude (the owner delegated Chapter 5).
 * Idempotent: re-running replaces every ch5_ node / quest / item it defines.
 *
 * Usage: node scripts/content-ch5.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const dlg = read('public/assets/data/dialogue.json');
const quests = read('public/assets/data/quests.json');
const items = read('public/assets/data/items.json');
const D = dlg.dialogues;

// ------------------------------------------------------------------ helpers
const node = (id, speaker, lines, extra = {}) => {
  D[id] = { id, speaker, lines, responses: [], ...extra };
};
const P = (id, lines, extra) => node(id, 'Peter', lines, extra);
const K = (id, lines, extra) => node(id, 'Kuro', lines, extra);
const FB = (id, lines, extra) => node(id, 'Ký Ức Của Kuro', lines, { flashback: true, ...extra });
const to = (text, next) => ({ text, nextDialogueId: next });
const grant = (itemId, quantity = 1, once = `took_${itemId}`, more = {}) => ({
  grantItems: [{ itemId, quantity }],
  grantOnceFlag: once,
  ...more,
});
const take = (id, lines, itemId, quantity = 1, more = {}) =>
  P(id, lines, { effects: grant(itemId, quantity, `took_${itemId}`, more) });

// ================================================================== Map 1 — Interval shore
P('ch5_arrival', [
  'Không có đất, không có trời. Chỉ có những mảnh thế giới trôi lơ lửng như lá rụng trên mặt hồ xám bạc.',
  'Vết nứt Kuro để lại... mình đã rơi qua nó.',
]);
K(
  'ch5_kuro_meet',
  [
    'Mày theo tao tới tận đây thật à.',
    '(Kuro đứng giữa những quả hạt phát sáng, tay cầm một chiếc bình tưới bằng thủy tinh rạn.)',
    'Đây là The Interval. Những thế giới Chronos cắt bỏ trôi về đây để chết. Tao tưới cho chúng sống thêm được chút nào hay chút ấy.',
  ],
  { responses: [to('Anh tưới bằng gì?', 'ch5_kuro_meet_water')] },
);
K(
  'ch5_kuro_meet_water',
  [
    'Bằng thứ duy nhất tao còn: trí nhớ.',
    'Mỗi lần tưới, tao quên một chút. Hôm qua tao quên mùi mưa. Hôm nay... tao không chắc.',
    'Cầm lấy. Mỗi khi tao kể gì về tao, mày ghi vào đây. Rồi tao sẽ hỏi lại.',
  ],
  {
    effects: grant('kuro_ledger', 1, 'took_kuro_ledger', {
      setFlags: ['met_kuro_interval', 'kuro_with_peter'],
    }),
  },
);
K('ch5_sprout_intro', [
  'Thấy cái mầm phát sáng kia không? Chạm vào nó, mày sẽ thấy chính chỗ này ở nhánh bị tỉa.',
  'Cùng một nơi, hai số phận. Có cây cầu ở nhánh này mà mất ở nhánh kia. Tập quen đi.',
]);
P('ch5_sprout_touch', ['Mầm Rẽ Nhánh rung nhẹ dưới tay, như một nhịp tim.'], {
  responses: [to('Chạm vào mầm', 'ch5_sprout_shift'), to('Để sau', null)],
});
P('ch5_sprout_shift', ['Thế giới chao đảo. Màu sắc tràn ra rồi rút lại như thủy triều...'], {
  effects: { toggleBranch: true, setFlags: ['learned_branch_shift'] },
});
P('ch5_shore_exit_locked', ['Bờ vực đứt gãy ở nhánh này. Có lẽ ở nhánh kia vẫn còn lối đi.']);
P('ch5_shore_kuro_first', ['Kuro đang đợi ở giữa vườn hạt. Nên tới nói chuyện với anh ấy trước.']);

// ================================================================== Map 2 — Seed garden
P('ch5_garden_arrival', [
  'Hàng trăm cái cây treo những quả hạt sáng mờ. Trong mỗi quả là một thế giới nhỏ đang thở yếu ớt.',
]);
K(
  'ch5_kuro_story_cat',
  [
    'Quả kia... nhìn giống cái sân nhà tao ngày xưa.',
    'Hồi nhỏ tao nuôi một con mèo mướp ba chân, đặt tên là Bánh Đúc vì nó trắng như bánh đúc.',
    '(Kuro cười, rồi khựng lại rất lâu.) ...Tao không nhớ nó chết thế nào nữa. Mày ghi lại đi.',
  ],
  {
    responses: [to('Ghi vào sổ', 'ch5_fb_cat')],
    effects: grant('kuro_ledger_page_1', 1, 'took_kuro_ledger_page_1'),
  },
);
FB('ch5_fb_cat', [
  'Mưa rơi trên mái hiên. Một cậu bé ôm con mèo ba chân ướt sũng vào lòng.',
  'Một cậu bé khác đứng bên cạnh, nghiêng chiếc dù rách che cho cả hai. Gương mặt cậu ấy hiện rõ: tóc xoăn, mắt xám xanh — là mình.',
  'Còn gương mặt cậu bé ôm mèo thì vẫn mờ, như nhìn qua một lớp kính mưa.',
]);
K('ch5_paradox_intro', [
  'Khe này thiếu một tấm ván. Ở nhánh tỉa có một tấm nằm ngay kia.',
  'Mày mang nó sang nhánh này được, nhưng nó chỉ là cái bóng. Hai mươi giây là tan. Nhớ đấy.',
]);
take(
  'ch5_plank_take_garden',
  ['Một tấm ván mục của nhánh bị tỉa. Cầm lên thấy nhẹ bẫng như sương.'],
  'pruned_plank',
);
P('ch5_gap_inspect', ['Khe sâu hun hút, thiếu đúng một tấm ván.']);
P('ch5_gap_pruned_void', ['Ở nhánh này, bên kia khe chẳng còn gì cả. Chỉ có sương xám.']);
P(
  'ch5_gap_place_shadow',
  ['Tấm ván nhánh tỉa đặt xuống khe, mờ mờ như một cái bóng. Phải qua nhanh lên!'],
  {
    effects: { startTimer: { flag: 'ch5_garden_shadow_plank', ms: 20000 } },
  },
);
K('ch5_garden_crossed', ['Không tệ. Cứ thế mà đi.'], {
  effects: { setFlags: ['ch5_crossed_garden'] },
});
K('ch5_gardener_first', [
  'Người Làm Vườn của Chronos. Chúng không ác đâu, chỉ làm việc của chúng: tỉa.',
  'Nhát kéo của nó cắt thẳng một đường. Thấy nó giơ kéo lên thì bước ra khỏi đường đó.',
]);
P('ch5_garden_exit_locked', ['Khe nứt còn chắn lối. Phải tìm cách qua nó trước.']);
take(
  'ch5_seed_spring_old_take',
  ['Một hạt giống bị nhổ khỏi luống, khắc hình mầm non và một nét cọ cũ đã mờ.'],
  'seed_spring_old',
  1,
  { startQuest: 'quest_ch5_uprooted_seeds' },
);
P('ch5_uprooted_path_hidden', [
  'Một lối mòn khuất sau hàng cây khô. Đất ở đây như vừa bị ai cày xới rồi bỏ dở.',
]);
P('ch5_uprooted_path_open', ['Năm hạt giống trong túi ấm dần lên. Lối mòn mở ra.'], {
  effects: { warpTo: { mapId: 'map_ch5_uprooted_garden', spawnId: 'default' } },
});
K(
  'ch5_old_seeds_offer',
  [
    'Luống này là của mày.',
    'Mỗi lần mày chọn, một hạt rơi xuống đây. Tao tưới hộ. Muốn xem chúng mọc thành gì không?',
  ],
  {
    responses: [to('Đi xem', 'ch5_old_seeds_go'), to('Để sau', null)],
    effects: { startQuest: 'quest_ch5_old_seeds' },
  },
);
P('ch5_old_seeds_go', ['Kuro dẫn mình qua một vòm lá xám...'], {
  effects: { warpTo: { mapId: 'map_ch5_old_seeds', spawnId: 'default' } },
});

// ================================================================== Map 3 — Alpha town
P('ch5_alpha_arrival', [
  'Khánh Hòa. Tiếng sóng, mùi cá khô, tiếng còi tàu sớm...',
  'Nhưng không phải Khánh Hòa của mình. Ở đây, mình chưa từng rời đi.',
]);
K('ch5_kuro_alpha', [
  'Nhánh của mày. Cái nhánh mày ở lại.',
  'Tao chờ ở đây. Nhánh này có người không ưa tao.',
]);
node('ch5_coba_alpha', 'Cô Ba', [
  'Ủa Peter, sao hôm nay mặc đồ lạ vậy con? Vợ con đâu, bé Na không theo hả?',
  'Hồi sáng thấy bé Na vẽ trời bằng phấn ngoài bến, dễ thương ghê.',
]);
node('ch5_na', 'Bé Na', [
  'Chú giống ba con quá... mà tóc ba con có sợi bạc hà.',
  'Ba con đi tỉa cây hoài, ít về lắm. Ba nói tỉa cây thì vườn mới đẹp.',
]);
P('ch5_rhyme', [
  'Trên bức tường cạnh bến, ai đó viết bằng phấn một bài đồng dao:',
  "'Xuân gieo, Hạ tưới, Thu hái, Đông ngủ — rồi Xuân lại về.'",
]);
take('ch5_chalk_blue_take', ['Một mẩu phấn màu xanh da trời rơi cạnh bậc thềm.'], 'chalk_blue');
take(
  'ch5_chalk_gold_take',
  ['Một mẩu phấn vàng như nắng sớm, kẹp trong khe thuyền.'],
  'chalk_gold',
);
take('ch5_seed_summer_take', ['Một hạt giống bị nhổ, khắc hình bình tưới.'], 'seed_summer', 1, {
  startQuest: 'quest_ch5_uprooted_seeds',
});
P('ch5_tower_locked', [
  'Cổng vọng lâu trên đồi khóa bằng một ổ khóa hình mặt đồng hồ. Có lẽ chìa ở trong tiệm.',
]);

// ================================================================== Map 4 — Clock shop of two worlds
P('ch5_shop_arrival', [
  'Tiệm đồng hồ của ông nội. Mọi thứ y nguyên...',
  'Chỉ có thêm một tấm ảnh cưới treo trên tường.',
]);
P('ch5_wedding_photo', [
  'Ảnh cưới của một Peter khác, tóc đã điểm bạc. Bên cạnh là một người phụ nữ cười hiền, tay bế một bé gái.',
]);
P('ch5_wedding_photo_pruned', ['Khung ảnh vỡ. Tấm ảnh bên trong cháy xém mất một nửa.']);
take('ch5_safe_note_take', ['Trong ngăn kéo bàn thợ có một mảnh giấy gấp tư.'], 'alpha_safe_note');
const CLOCKS = [
  ['wedding', 'Cưới', '3:15', '3:45'],
  ['daughter', 'Con gái', '7:30', '7:30'],
  ['grandpa', 'Ông', '9:45', '2:15'],
  ['sea', 'Biển', '12:00', '11:00'],
  ['shop', 'Tiệm', '4:30', '4:00'],
];
for (const [key, name, living, pruned] of CLOCKS) {
  P(`ch5_clock_${key}`, [`Chiếc đồng hồ khắc chữ "${name}". Kim chỉ ${living}.`]);
  P(`ch5_clock_${key}_pruned`, [
    `Chiếc đồng hồ khắc chữ "${name}", mặt kính nứt. Kim dừng ở ${pruned}.`,
  ]);
}
P(
  'ch5_safe_open',
  [
    'Tách. Két sắt bật mở.',
    'Bên trong là một lá thư chưa gửi, đề "Gửi Na", và một chiếc chìa khóa hình mặt đồng hồ.',
  ],
  {
    effects: {
      grantItems: [{ itemId: 'letter_to_daughter', quantity: 1 }],
      grantOnceFlag: 'took_letter_to_daughter',
      setFlags: ['opened_alpha_safe'],
    },
  },
);
P('ch5_safe_wrong', ['Chốt két lạch cạch rồi kẹt cứng. Giờ của hai thế giới chưa khớp.']);
P('ch5_safe_pruned', ['Két ở nhánh này bị cạy tung. Bên trong trống rỗng.']);
P('ch5_safe_open_again', ['Két đã mở. Bên trong không còn gì.']);

// ================================================================== Map 5 — Pruner's tower
P('ch5_tower_arrival', ['Vọng lâu trắng toát trên đồi, như một chiếc kéo khổng lồ cắm xuống đất.']);
node(
  'ch5_other_peter_confront',
  'Peter Nhánh Alpha',
  [
    'Tao biết thế nào mày cũng tới. Mày có khuôn mặt của tao hồi hai mươi sáu tuổi.',
    'Ở nhánh này, tao không rời đi. Tao cưới cô ấy, có bé Na. Rồi một ngày, Chronos đánh dấu nhánh này để tỉa.',
    'Một giọng nói cho tao giao kèo: giữ được nhánh này, đổi lại tao phải tỉa những nhánh khác. Tao đã tỉa bốn trăm mười hai thế giới.',
  ],
  { responses: [to('Bốn trăm... sao anh làm được?', 'ch5_other_peter_why')] },
);
node('ch5_other_peter_why', 'Peter Nhánh Alpha', [
  'Mỗi lần tỉa, tao nghĩ tới bé Na ngủ say. Vậy là làm được.',
  'Nếu là con mày, mày có làm khác không?',
  '(Peter không trả lời được.)',
]);
node(
  'ch5_other_peter_defeated',
  'Peter Nhánh Alpha',
  [
    '(Người đàn ông tóc điểm bạc quỳ gối. Chiếc kéo tỉa rơi xuống nền đá.)',
    'Mày thắng rồi. Giờ mày định làm gì với tao?',
  ],
  {
    effects: { setFlags: ['defeated_other_peter'] },
    responses: [
      to('Đọc lá thư cho anh ấy nghe', 'ch5_alpha_letter_read'),
      to('Trao lá thư, để anh ấy về', 'ch5_alpha_letter_give'),
    ],
  },
);
P(
  'ch5_alpha_letter_read',
  [
    "'Na của bố. Nếu một ngày con đọc được thư này, bố mong con biết bố chưa từng làm điều gì khiến con phải xấu hổ...'",
    '(Giọng mình nghẹn lại. Người đàn ông tóc điểm bạc ôm mặt.)',
  ],
  { responses: [to('…', 'ch5_alpha_letter_read_2')] },
);
node(
  'ch5_alpha_letter_read_2',
  'Peter Nhánh Alpha',
  [
    'Tao viết câu đó... trước khi nhận giao kèo.',
    '(Anh tháo từng mảnh giáp trắng, đặt xuống đất.) Tao sẽ về với con bé. Nhánh này có bị tỉa thì cha con tao đi cùng nhau.',
    'Cầm lấy. Nhẫn cưới của tao. Nó chưa từng dùng để tỉa ai.',
  ],
  {
    responses: [to('…', 'ch5_alpha_memory_offer')],
    effects: {
      grantItems: [{ itemId: 'alpha_wedding_ring', quantity: 1 }],
      grantOnceFlag: 'took_alpha_wedding_ring',
      setFlags: ['ch5_choice_alpha_letter', 'resolved_alpha_letter', 'ch5_trust_letter'],
    },
  },
);
node(
  'ch5_alpha_letter_give',
  'Peter Nhánh Alpha',
  [
    'Cảm ơn. Con bé sẽ được lớn lên.',
    '(Anh khoác lại giáp, nhặt chiếc kéo lên.) Đừng để tao gặp lại mày trong vườn của thằng Kuro.',
    'Cái này là kéo dự phòng của tao. Mày cần nó hơn tao.',
  ],
  {
    responses: [to('…', 'ch5_alpha_memory_offer')],
    effects: {
      takeItems: [{ itemId: 'letter_to_daughter', quantity: 1 }],
      grantItems: [{ itemId: 'silver_pruning_shears', quantity: 1 }],
      grantOnceFlag: 'took_silver_pruning_shears',
      setFlags: ['ch5_choice_alpha_spared', 'resolved_alpha_letter'],
    },
  },
);
node(
  'ch5_alpha_memory_offer',
  'Peter Nhánh Alpha',
  ['Còn cái này. Tao giữ một mảnh ký ức về thằng Kuro — thứ mày đã đánh mất. Mày lấy đi.'],
  {
    responses: [
      to('Nhận mảnh ký ức', 'ch5_alpha_memory_take'),
      to('Từ chối', 'ch5_alpha_memory_refuse'),
    ],
  },
);
P(
  'ch5_alpha_memory_take',
  [
    '(Một luồng ấm chảy vào trí nhớ: tiếng cười của hai đứa trẻ trên mỏm đá, gió biển mặn chát...)',
    '(Nhưng cùng lúc, một thứ nhỏ bé trôi đi: mùi dầu máy của tiệm đồng hồ buổi sáng. Mình không còn nhớ nó nữa.)',
  ],
  { effects: { setFlags: ['ch5_took_alpha_memory'] } },
);
P('ch5_alpha_memory_refuse', ['Tôi sẽ tự nhớ. Theo cách của tôi.'], {
  effects: { setFlags: ['ch5_refused_alpha_memory'] },
});
K('ch5_kuro_reacts_spared', [
  'Mày vừa thả một con dao về lại vườn của tao.',
  '...Nhưng tao hiểu. Nếu tao có con, có khi tao cũng thế.',
]);
K('ch5_kuro_reacts_letter', [
  'Hắn tháo giáp rồi à. Bốn trăm mười hai thế giới... và một lá thư.',
  'Chữ viết tay đôi khi nặng hơn cả một quyền năng.',
]);
K(
  'ch5_kuro_story_song',
  [
    'Mưa lại rơi trong The Interval rồi. Lạ thật, ở đây làm gì có mây.',
    "Mẹ tao hay hát bài 'Chiều Trên Bến Cũ' mỗi khi trời mưa. Tao chỉ còn nhớ tên bài, giai điệu thì mất rồi.",
  ],
  {
    responses: [to('Ghi vào sổ', 'ch5_fb_song')],
    effects: grant('kuro_ledger_page_2', 1, 'took_kuro_ledger_page_2'),
  },
);
FB('ch5_fb_song', [
  'Một người phụ nữ ngồi khâu áo bên khung cửa, mưa giăng ngoài hiên.',
  "Bà hát khe khẽ. Lời bị nhiễu như sóng radio cũ, chỉ nghe rõ một câu: '...chiều trên bến cũ...'",
  'Cậu bé tóc đen nằm gối đầu lên đùi mẹ, mắt nhắm hờ.',
]);
P('ch5_tower_exit_locked', [
  'Vết nứt sang nhánh Beta còn khép. Phải giải quyết chuyện ở vọng lâu trước.',
]);

// ================================================================== Map 6 — Steel city (Beta)
P('ch5_beta_arrival', [
  'Một thành phố bằng thép đứng im. Mọi chiếc đồng hồ trên các tòa tháp đều dừng ở cùng một giờ.',
  "Trên tấm bảng hiệu lớn còn dòng chữ: 'Dự án Đồng Hồ Thép — Nhân loại không bao giờ già đi.'",
]);
K('ch5_kuro_beta', [
  'Nhánh Beta. Họ muốn khóa Chronos để không ai phải chết.',
  'Và giờ thì không ai còn sống để mà chết. Gần như không ai.',
]);
take(
  'ch5_bridge_log_take',
  ['Cuốn sổ của tổ thợ cầu, kẹp dưới một chiếc mũ bảo hộ.'],
  'bridge_worker_log',
);
take(
  'ch5_plank_pruned_a_take',
  ['Một tấm ván của nhánh tỉa nằm trong đống đổ nát.'],
  'pruned_plank',
  1,
);
D.ch5_plank_pruned_a_take.effects.grantOnceFlag = 'took_beta_plank_a';
take(
  'ch5_plank_pruned_b_take',
  ['Thêm một tấm ván của nhánh tỉa, mép mục nát.'],
  'pruned_plank',
  1,
);
D.ch5_plank_pruned_b_take.effects.grantOnceFlag = 'took_beta_plank_b';
take(
  'ch5_plank_living_take',
  ['Trên mái nhà có một tấm ván thép của nhánh sống, còn chắc chắn.'],
  'living_plank',
);
for (const k of [3, 6, 9]) {
  P(
    `ch5_cell_${k}_place`,
    ['Đặt tấm ván nhánh tỉa vào chỗ trống. Nó khớp vào như chưa từng rời đi.'],
    {
      effects: {
        takeItems: [{ itemId: 'pruned_plank', quantity: 1 }],
        setFlags: [`ch5_cell_${k}_p`],
      },
    },
  );
  P(`ch5_cell_${k}_shadow`, ['Tấm ván nhánh sống đặt xuống, mờ như một cái bóng. Hai mươi giây!'], {
    effects: { startTimer: { flag: `ch5_cell_${k}_shadow`, ms: 20000 } },
  });
}
P('ch5_cell_inspect', ['Khoảng trống giữa hai tấm ván. Gió hư không hun hút thổi lên.']);
P('ch5_cell_living', ['Ở nhánh này cây cầu gần như mất hết. Đặt ván ở đây chẳng đi tới đâu.']);
P('ch5_cell_done', ['Tấm ván đã nằm vững ở đây.']);
P('ch5_bridge_fall', ['Ván dưới chân tan biến! Mình rơi xuống rồi bị hất ngược về đầu cầu.']);
K('ch5_bridge_crossed', ['Qua rồi. Mày bắt đầu nghĩ giống người làm vườn rồi đấy.'], {
  effects: { setFlags: ['crossed_quantum_bridge'] },
});
take(
  'ch5_seed_autumn_take',
  ['Một hạt giống bị nhổ, khắc hình chiếc giỏ đầy quả.'],
  'seed_autumn',
  1,
  { startQuest: 'quest_ch5_uprooted_seeds' },
);
take('ch5_chalk_red_take', ['Một mẩu phấn đỏ như hoàng hôn, lăn trong rãnh thép.'], 'chalk_red');
P('ch5_beta_exit_locked', ['Bên kia vực mới có đường sang lò phản ứng.']);

// ================================================================== Map 7 — Chronos reactor
node(
  'ch5_ivo_meet',
  'Kỹ Sư Ivo',
  [
    'Cậu từ đâu tới? ...Không quan trọng. Lò này giữ hầm trú ẩn cho lũ trẻ. Nó tắt rồi.',
    'Ba máy phát, mỗi máy có công tắc ở cả hai nhánh. Tôi đã viết hết luật vào nhật ký. Mắt tôi giờ không đọc nổi nữa.',
  ],
  {
    effects: grant('ivo_reactor_log', 1, 'took_ivo_reactor_log', { setFlags: ['met_ivo'] }),
  },
);
node('ch5_ivo_again', 'Kỹ Sư Ivo', [
  'Hai nhánh, ba máy. Một máy không thể chạy ở cả hai nhánh cùng lúc. Đừng quên điều đó.',
]);
take(
  'ch5_warning_plate_take',
  ['Một tấm biển cảnh báo rỉ sét, chỉ còn đọc được ở nhánh này.'],
  'reactor_warning_plate',
);
take('ch5_wiring_take', ['Sơ đồ dây điện của cổng lò, dán trên tủ điện.'], 'reactor_wiring');
P(
  'ch5_reactor_start',
  [
    'Ba lõi máy phát lần lượt sáng lên. Tiếng ù trầm vang khắp lò phản ứng.',
    'Cổng sang hầm trú ẩn mở ra.',
  ],
  { effects: { setFlags: ['restarted_reactor'] } },
);
P(
  'ch5_reactor_wrong',
  ['Lò rít lên chói tai. Tia lửa bắn ra, mọi công tắc bật ngược về vị trí tắt.'],
  {
    effects: {
      clearFlags: [
        'ch5_sw_a_l_on',
        'ch5_sw_b_l_on',
        'ch5_sw_c_l_on',
        'ch5_sw_a_p_on',
        'ch5_sw_b_p_on',
        'ch5_sw_c_p_on',
      ],
    },
  },
);
P('ch5_reactor_done', ['Lò phản ứng chạy đều. Hầm trú ẩn đã có điện.']);
P('ch5_reactor_exit_locked', ['Cổng hầm trú ẩn đóng chặt. Lò phản ứng chưa chạy.']);

// ================================================================== Map 8 — Children's shelter
P('ch5_shelter_arrival', [
  'Trần hầm phủ kín những nét phấn: mây, mặt trời, chim, cầu vồng... Một bầu trời vẽ tay.',
]);
node(
  'ch5_mira_meet',
  'Mira',
  [
    'Chú tiên! Chú về rồi! (Cô bé ôm chầm lấy chân Kuro.)',
    'Chú này là ai vậy? Chú cũng biết bay hả? Con chưa thấy trời thật bao giờ. Con vẽ theo lời ông Ivo kể.',
    'Phấn của con gần hết rồi... Chú tìm giúp con bốn màu được không? Xanh trời, vàng nắng, đỏ hoàng hôn, trắng mây.',
  ],
  { effects: { setFlags: ['met_mira'], startQuest: 'quest_ch5_chalk_sky' } },
);
node('ch5_mira_again', 'Mira', [
  'Chú tiên bảo sẽ đưa cả thành phố ra ngoài.',
  'Nếu chú không mang được cả thành phố thì mang tụi con thôi cũng được mà?',
]);
node(
  'ch5_mira_chalk_done',
  'Mira',
  [
    'Đủ bốn màu luôn! (Mira trèo lên vai Kuro, vẽ một đám mây trắng thật to lên trần hầm.)',
    'Chú cầm cái này đi. Con vẽ chú với chú tiên đứng dưới trời đó.',
  ],
  {
    effects: {
      takeItems: [
        { itemId: 'chalk_blue', quantity: 1 },
        { itemId: 'chalk_gold', quantity: 1 },
        { itemId: 'chalk_red', quantity: 1 },
        { itemId: 'chalk_white', quantity: 1 },
      ],
      grantItems: [
        { itemId: 'mira_drawing', quantity: 1 },
        { itemId: 'refined_chrono_shard', quantity: 2 },
      ],
      grantOnceFlag: 'rewarded_chalk_sky',
      setFlags: ['finished_chalk_sky'],
    },
  },
);
node('ch5_mira_after', 'Mira', ['Bầu trời của con đẹp chưa chú?']);
node('ch5_ivo_shelter', 'Kỹ Sư Ivo', [
  'Chúng tôi đã xóa cái chết. Và cùng với nó, xóa luôn ngày mai.',
  'Lũ trẻ này là tất cả những gì còn lại. Bốn mươi đứa.',
]);
K(
  'ch5_kuro_story_promise',
  [
    'Lời hứa của tụi mình... tao nhớ là mình hứa ở mỏm đá có cây bàng gãy, nhìn ra biển.',
    'Tao chỉ nhớ chỗ, không nhớ lời. Buồn cười không?',
  ],
  {
    responses: [to('Ghi vào sổ', 'ch5_fb_storm')],
    effects: grant('kuro_ledger_page_3', 1, 'took_kuro_ledger_page_3'),
  },
);
FB('ch5_fb_storm', [
  'Đêm bão. Lần này mình đứng ở chỗ của Kuro, nhìn vào tiệm đồng hồ qua làn mưa.',
  'Bên trong, một chàng trai tóc xoăn ngủ gục trên bàn thợ, tay vẫn cầm tua vít. Kuro đứng nhìn rất lâu, không gõ cửa.',
  "'Trật tự này thối rữa rồi. Tao sẽ đi tìm một khả năng khác... để không ai phải bị quên. Kể cả mày.'",
]);
K('ch5_kuro_resolve', [
  'Tao sẽ kéo cả nhánh này về. Bốn mươi đứa trẻ, một thành phố. Tao còn đủ ký ức để làm một lần nữa.',
  'Đi với tao tới Vùng Xám. Tao cần một chỗ đủ rộng để thả neo.',
]);
take(
  'ch5_seed_spring_new_take',
  ['Một hạt giống bị nhổ, khắc hình mầm non và một nét cọ còn tươi mới.'],
  'seed_spring_new',
  1,
  { startQuest: 'quest_ch5_uprooted_seeds' },
);
P('ch5_shelter_exit_locked', ['Nên chào lũ trẻ trước đã.']);

// ================================================================== Map 9 — Grey prune
P('ch5_grey_arrival', [
  'Vùng Xám. Những mảnh phố, mảnh rừng, mảnh biển trôi qua rồi tan thành bụi như tàn tro.',
]);
take(
  'ch5_grey_stele_take',
  ['Mình chép lại dòng chữ trên tấm bia đá đang tan dần.'],
  'prune_stele_rubbing',
);
take(
  'ch5_genealogy_take',
  ['Một tấm phả hệ hoàng tộc trôi lơ lửng, vẫn còn đọc được.'],
  'unborn_genealogy',
);
P('ch5_portrait_silver', [
  "Bức chân dung viền bạc thì thầm: 'Người thừa kế không phải con trưởng.'",
]);
P('ch5_portrait_copper', [
  "Bức chân dung viền đồng thì thầm: 'Người thừa kế là con của hoàng hậu thứ hai.'",
]);
P('ch5_portrait_iron', ["Bức chân dung viền sắt thì thầm: 'Người thừa kế là con trưởng.'"]);
P(
  'ch5_heir_named',
  [
    'Cái tên vang lên, và cả ba bức chân dung cùng quay về một phía, như cúi đầu.',
    'Mình đã biết tên thật của Vua Chưa Sinh.',
  ],
  { effects: { setFlags: ['named_unborn_heir'] } },
);
P('ch5_heir_wrong', ['Cái tên tan vào gió xám, không vọng lại.']);
P('ch5_heir_again', ['Ba bức chân dung lặng im. Cái tên đã được gọi.']);
take(
  'ch5_chalk_white_take',
  ['Một mẩu phấn trắng như mây, nằm trên mảnh vỉa hè trôi nổi.'],
  'chalk_white',
);
take('ch5_seed_winter_take', ['Một hạt giống bị nhổ, khắc hình bông tuyết.'], 'seed_winter', 1, {
  startQuest: 'quest_ch5_uprooted_seeds',
});

// ================================================================== Map 10 — Where Kuro asks
K(
  'ch5_kuro_asks_intro',
  [
    '(Kuro đứng giữa vòng neo, nhìn mình như nhìn một người lạ.)',
    'Xin lỗi... mày là ai nhỉ? À không, tao biết mày. Tao chỉ không nhớ vì sao tao biết.',
    'Mày có cuốn sổ đúng không? Ba hòn đá quanh vòng neo... tao khắc câu hỏi lên đó rồi. Trả lời tao đi.',
  ],
  { effects: { setFlags: ['ch5_reached_anchor'] } },
);
const Q = [
  [
    'q1',
    'Tao từng nuôi một con mèo...',
    'Bánh Đúc... Ừ. Nó hay nằm phơi nắng trên bậu cửa sổ. Tao nhớ ra rồi.',
  ],
  [
    'q2',
    'Mẹ tao hay hát một bài...',
    "'Chiều Trên Bến Cũ'... (Kuro khẽ ngân một đoạn giai điệu, rồi dừng lại, ngạc nhiên vì mình còn nhớ.)",
  ],
  [
    'q3',
    'Tụi mình hứa với nhau ở...',
    'Mỏm đá có cây bàng gãy. Đúng rồi... mày đứng bên trái, tao bên phải.',
  ],
];
for (const [q, , right] of Q) {
  K(`ch5_${q}_right`, [right], {
    effects: { setFlags: [`ch5_${q}_right`, `answered_${q}`] },
    ...(q === 'q3' ? { responses: [to('…', 'ch5_fb_promise')] } : {}),
  });
  K(`ch5_${q}_wrong`, ['Không phải... Tao nghĩ vậy. Tao không chắc nữa.'], {
    effects: { setFlags: [`answered_${q}`] },
  });
}
P('ch5_q_done', ['Câu này đã trả lời rồi.']);
FB('ch5_fb_promise', [
  'Mỏm đá có cây bàng gãy, gió biển mặn chát. Hai đứa trẻ ngồi sát nhau.',
  "Cậu bé tóc đen nói: 'Nếu một ngày tao bị xóa tên, mày phải là người nhớ...'",
  'Cậu bé tóc xoăn mở miệng đáp — và ký ức vỡ vụn như kính.',
]);
K('ch5_kuro_waiting', ['Ba hòn đá. Ba câu hỏi. Trả lời tao đi.']);
K('ch5_kuro_smile', ['Mày nhớ hộ tao thật à...', '(Kuro cười — lần đầu tiên kể từ khi gặp lại.)'], {
  responses: [to('…', 'ch5_beta_offer_open')],
  effects: { setFlags: ['answered_kuro_ledger'] },
});
K('ch5_kuro_after_quiz_open', ['Cảm ơn. Có những thứ tao giữ lại được rồi.'], {
  responses: [to('…', 'ch5_beta_offer_open')],
  effects: { setFlags: ['answered_kuro_ledger'] },
});
K('ch5_kuro_after_quiz', ['...Ừ. Có những thứ không quay về được nữa.'], {
  responses: [to('…', 'ch5_beta_offer')],
  effects: { setFlags: ['answered_kuro_ledger'] },
});
const OFFER = [
  'Giờ tao thả neo. Mày giữ một đầu, tao giữ đầu kia, kéo cả nhánh Beta về.',
  'Va chạm sẽ nuốt mất Vùng Xám và vài nhánh nhỏ. Nhưng bốn mươi đứa trẻ sẽ được thấy trời.',
];
K('ch5_beta_offer', OFFER, {
  responses: [to('Giúp Kuro kéo', 'ch5_help_kuro'), to('Cắt neo, ngăn Kuro lại', 'ch5_stop_kuro')],
});
K('ch5_beta_offer_open', OFFER, {
  responses: [
    to('Chỉ kéo hầm trú ẩn thôi', 'ch5_partial_pull'),
    to('Chọn giữa giúp hay ngăn', 'ch5_beta_offer'),
  ],
});
P(
  'ch5_partial_pull',
  [
    'Không cần kéo cả thành phố. Kéo hầm trú ẩn thôi — bốn mươi đứa trẻ, không hơn.',
    '(Kuro im lặng rất lâu.) ...Con bé Mira cũng nói vậy. Được. Kéo từng phần.',
    'Kuro: "Lần này... tao không phải quên gì cả."',
  ],
  {
    effects: {
      setFlags: [
        'ch5_choice_partial_pull',
        'resolved_beta_choice',
        'ch5_kuro_by_side',
        'ch5_anchor_settled',
      ],
    },
  },
);
P(
  'ch5_help_kuro',
  [
    'Hai bàn tay cùng ghì lấy sợi neo. Cả nhánh Beta rung chuyển, trượt dần về phía này.',
    'Kuro: "...Được rồi. Được rồi. Tụi nhỏ sẽ thấy trời."',
    'Kuro quay sang mình, ánh mắt bối rối: "Mày vừa trả lời tao gì ấy nhỉ? ...Thôi, không sao."',
  ],
  {
    effects: {
      setFlags: [
        'ch5_choice_help_kuro',
        'resolved_beta_choice',
        'ch5_kuro_by_side',
        'ch5_collision_big',
        'ch5_anchor_settled',
      ],
    },
  },
);
P(
  'ch5_stop_kuro',
  [
    'Mình rút kiếm, cắt phăng sợi neo. Kuro ngã ngồi xuống nền đá.',
    'Kuro: "...Mày đã hứa."',
    'Kuro: "Đứng dậy đi. Nếu mày muốn ngăn tao, thì ngăn cho trọn."',
  ],
  { effects: { setFlags: ['ch5_choice_stop_kuro', 'resolved_beta_choice', 'kuro_left'] } },
);
K('ch5_kuro_duel_begin', [
  '(Bình tưới thủy tinh trong tay Kuro vỡ ra, hóa thành một thanh kiếm ánh tím.)',
]);
K(
  'ch5_kuro_duel_end',
  ['(Kuro lùi lại, thở dốc.) Mày vẫn cứng đầu như hồi nhỏ.', 'Tao sẽ tìm cách khác. Một mình.'],
  { effects: { setFlags: ['ch5_anchor_settled', 'ch5_kuro_duel_done'] } },
);
K(
  'ch5_kuro_duel_spared',
  [
    '(Kuro hạ kiếm xuống.) Tao không đánh mày được. Chưa bao giờ đánh được.',
    '(Anh quay lưng, bước vào vết nứt.) Tao sẽ tìm cách khác. Một mình.',
  ],
  { effects: { setFlags: ['ch5_anchor_settled', 'ch5_kuro_duel_done'], healFull: true } },
);
K('ch5_kuro_after_choice', ['Đi thôi. Ngai vua đang đợi.']);
P('ch5_anchor_exit_locked', ['Kuro vẫn đang đợi câu trả lời của mình.']);

// ================================================================== Map 11 — Unborn throne
P(
  'ch5_unborn_king_confront',
  [
    'Một vị vua không có gương mặt ngồi trên ngai dệt từ những tấm khăn quấn trẻ sơ sinh chưa từng dùng.',
    'Ba chiếc vương miện chồng lên nhau trên đầu nó.',
  ],
  { responses: [to('…', 'ch5_unborn_king_speaks')] },
);
node('ch5_unborn_king_speaks', 'Vua Chưa Sinh', [
  'TA LÀ MỌI VỊ VUA CHƯA TỪNG ĐƯỢC SINH RA. TA LÀ MỌI TRIỀU ĐẠI KHÔNG KỊP BẮT ĐẦU.',
  'HÃY ĐỂ TA ĐƯỢC SINH RA — DÙ PHẢI DÙNG MÁU CỦA NGƯƠI.',
]);
K('ch5_kuro_joins_battle', ['Lần này mày không đánh một mình.']);
node(
  'ch5_unborn_king_defeated',
  'Vua Chưa Sinh',
  [
    '(Ba vương miện rơi xuống, vỡ thành ánh sáng. Vị vua không mặt cúi đầu.)',
    '...Cảm ơn. Không được sinh ra cũng là một cách để được yên.',
  ],
  { effects: { setFlags: ['defeated_unborn_king'] } },
);
P('ch5_throne_exit_locked', ['Vua Chưa Sinh còn ngồi trên ngai.']);

// ================================================================== Map 12 — Collision shore
P('ch5_collision_arrival', [
  'Bờ Va Chạm. Hai nhánh thực tại cọ vào nhau như hai tảng băng. Từng hòn đảo nhỏ nứt toác.',
  'Đảo màu tím vẫn đứng vững — nhánh còn được tưới thì không vỡ. Đảo xám thì đang tan.',
]);
P(
  'ch5_collision_start',
  ['Bước lên những hòn đảo trôi nổi. Phải tới được Lõi trước khi bờ va chạm khép lại!'],
  {
    effects: { startTimer: { flag: 'ch5_collision_clock', ms: 40000 } },
  },
);
P('ch5_collision_start_big', ['Va chạm lần này dữ dội hơn nhiều. Phải chạy thật nhanh!'], {
  effects: { startTimer: { flag: 'ch5_collision_clock', ms: 30000 } },
});
P('ch5_island_fall', ['Hòn đảo xám vỡ vụn dưới chân! Mình bị hất ngược về bờ.']);
P('ch5_collision_late', ['Bờ va chạm đã khép lại. Phải chạy lại từ đầu.']);
P(
  'ch5_collision_escaped',
  ['Mình nhảy lên hòn đảo cuối cùng. Phía sau, cả bờ va chạm sụp đổ vào hư không.'],
  {
    effects: {
      setFlags: ['escaped_collision'],
      warpTo: { mapId: 'map_ch5_collision_shore', spawnId: 'core' },
    },
  },
);
const SEAL = [
  'Lõi Possibility Seal nảy mầm trong lòng bàn tay, như một hạt giống biết thở.',
  'Mình hiểu rồi: mỗi khả năng đều đáng được sống — nhưng không phải tất cả đều có thể sống cùng lúc.',
];
const SEAL_FX = {
  setFlags: ['possibility_seal_restored', 'learned_possibility_resonance'],
  grantItems: [{ itemId: 'possibility_seal_shard', quantity: 1 }],
  grantOnceFlag: 'took_possibility_seal_shard',
};
P('ch5_seal_help', [...SEAL], { responses: [to('…', 'ch5_farewell_help')], effects: SEAL_FX });
P('ch5_seal_partial', [...SEAL], {
  responses: [to('…', 'ch5_farewell_partial')],
  effects: SEAL_FX,
});
P('ch5_seal_stop', [...SEAL], { responses: [to('…', 'ch5_farewell_stop')], effects: SEAL_FX });
K(
  'ch5_farewell_help',
  [
    'Tụi nhỏ thấy trời rồi. Mày thấy không? Chúng nó đang chỉ trỏ đám mây kìa.',
    'Tao sẽ đi tiếp, lên tận nơi Chronos ngồi. Có những thế giới chỉ ở đó mới cứu được.',
    '(Kuro nhìn mình rất lâu, rồi cau mày như cố nhớ một cái tên.) ...Gặp lại sau nhé, người lạ tốt bụng.',
  ],
  { responses: [to('…', 'ch5_chapter_end')] },
);
K(
  'ch5_farewell_partial',
  [
    'Bốn mươi đứa, một cái hầm, một bầu trời. Vừa đủ.',
    'Mày biết không, lần đầu tiên tao cứu một thế giới mà không phải quên gì.',
    'Lên Celestial Realm đi, Peter. Lần này tao muốn mày đi cùng — không phải đi sau tao.',
  ],
  { responses: [to('…', 'ch5_chapter_end')] },
);
P(
  'ch5_farewell_stop',
  [
    'Kuro đã đi rồi, về phía những vì sao không thuộc về thế giới nào.',
    'Ở bờ bên kia, nhánh Beta vẫn tan chậm từng chút. Lũ trẻ còn thời gian. Mình phải tìm ra cách khác trước khi nó hết.',
    "Câu cuối Kuro để lại vẫn vang trong đầu: '...Mày đã hứa.'",
  ],
  { responses: [to('…', 'ch5_chapter_end')] },
);
P(
  'ch5_chapter_end',
  [
    'Phía trên The Interval, một cầu thang ánh sáng hiện ra, dẫn lên Celestial Realm.',
    'Nơi bắt đầu của mọi quyền năng. Và có lẽ, của cả lời hứa năm xưa.',
  ],
  { effects: { endChapter: 5 } },
);

// ================================================================== Hidden A — Uprooted garden
P('ch5_uprooted_arrival', [
  'Năm luống đất xếp vòng tròn. Đất còn ấm, như vừa có ai gieo hạt rồi bị nhổ đi.',
]);
P('ch5_plots_wrong', ['Đất khô lại, các hạt giống im lìm. Thứ tự chưa đúng với vòng mùa.']);
P(
  'ch5_plots_right',
  [
    'Năm hạt giống nảy mầm cùng lúc, vươn thành một thân cây ánh tím.',
    'Giữa thân cây là một thanh kiếm, lưỡi kiếm như có hai cái bóng.',
  ],
  {
    effects: {
      grantItems: [{ itemId: 'blade_of_possibility', quantity: 1 }],
      grantOnceFlag: 'took_blade_of_possibility',
      setFlags: ['planted_uprooted_seeds'],
    },
  },
);
P('ch5_plots_done', ['Cây ánh tím đứng lặng giữa vòng đất.']);
P('ch5_plots_missing', ['Năm luống đất trống. Phải tìm đủ năm hạt giống bị nhổ.']);

// ================================================================== Hidden B — Old seeds
P('ch5_old_seeds_arrival', [
  'Một khu vườn nhỏ. Mỗi luống mọc lên từ một lựa chọn của mình ở chiến trường cũ.',
  'Kuro: "Chỉ tưới được một hạt thôi. Chọn cái mày muốn giữ."',
]);
const SEEDS = {
  aldric_truth: [
    'Trong hạt giống: Aldric về tới làng, đặt một nhành tử đằng lên mộ Maelis. Ông ngồi đó rất lâu, thanh thản.',
  ],
  aldric_comfort: [
    'Trong hạt giống: lời nói dối đã thành thật. Maelis già đi bên cháu chắt, chiều nào cũng ngóng ra cổng làng.',
    'Kuro: "Mày nói dối để ông ấy yên lòng. Vậy cái nhánh này... có đáng được sống không?"',
  ],
  bran_release: ['Trong hạt giống: Bran ngủ yên dưới gốc cây. Anh không còn đếm nữa.'],
  bran_memorial: [
    'Trong hạt giống: tên mẹ Bran khắc trên phiến đá. Một người phụ nữ đang dừng lại đọc nó.',
  ],
  elion_burn: ['Trong hạt giống: một khoảng đất phủ tro. Giữa lớp tro, mầm non đã nhú lên.'],
  elion_chronicle: [
    'Trong hạt giống: cuốn biên niên sử mở ở trang cuối. Có một dòng nhắc tới "chàng trai áo xám đi ngược hướng quân lính".',
  ],
};
for (const [key, lines] of Object.entries(SEEDS)) {
  const who = key.split('_')[0];
  P(`ch5_seed_${key}`, lines, {
    responses: [to('Tưới hạt này', `ch5_water_${who}`), to('Để sau', null)],
  });
}
const CHARM = {
  aldric: 'chosen_seed_aldric',
  bran: 'chosen_seed_bran',
  elion: 'chosen_seed_elion',
};
for (const [who, itemId] of Object.entries(CHARM)) {
  P(
    `ch5_water_${who}`,
    [
      'Nước trong bình tưới của Kuro lấp lánh. Hạt giống vươn thành một mầm cây nhỏ, đậu một chiếc bùa.',
    ],
    {
      effects: {
        grantItems: [{ itemId, quantity: 1 }],
        grantOnceFlag: 'took_chosen_seed_charm',
        setFlags: ['watered_old_seed', `ch5_watered_${who}`, 'ch5_trust_seed'],
      },
    },
  );
}
P('ch5_seed_empty', ['Luống đất trống. Chưa có hạt nào rơi xuống đây.']);
P('ch5_seed_already', ['Mình đã chọn tưới một hạt khác rồi.']);
P('ch5_old_seeds_back', ['Quay về vườn hạt.'], {
  effects: { warpTo: { mapId: 'map_ch5_seed_garden', spawnId: 'from_old_seeds' } },
});
P('ch5_uprooted_back', ['Quay về vườn hạt.'], {
  effects: { warpTo: { mapId: 'map_ch5_seed_garden', spawnId: 'from_uprooted' } },
});

// ================================================================== quests
const q = (id, title, description, kind, objectives, followUpQuestId) => ({
  id,
  title,
  kind,
  chapter: 5,
  description,
  stage: 'inactive',
  objectives: objectives.map(([oid, text, flag]) => ({
    id: oid,
    description: text,
    completed: false,
    completeOnFlag: flag,
  })),
  ...(followUpQuestId ? { followUpQuestId } : {}),
});
const CH5_QUESTS = [
  q(
    'quest_ch5_into_the_interval',
    'Khoảng Không Giữa Các Nhánh',
    'Peter rơi qua vết nứt vào The Interval, nơi những thế giới bị tỉa bỏ trôi dạt.',
    'main',
    [
      ['obj_ch5_meet_kuro', 'Tìm Kuro giữa bờ vực', 'met_kuro_interval'],
      ['obj_ch5_learn_shift', 'Chạm vào Mầm Rẽ Nhánh', 'learned_branch_shift'],
    ],
    'quest_ch5_the_gardener',
  ),
  q(
    'quest_ch5_the_gardener',
    'Người Làm Vườn',
    'Kuro tưới những thế giới đang chết bằng chính trí nhớ của mình. Băng qua khu vườn của anh.',
    'main',
    [['obj_ch5_cross_garden', 'Vượt qua khe nứt giữa vườn hạt', 'ch5_crossed_garden']],
    'quest_ch5_alpha_life',
  ),
  q(
    'quest_ch5_alpha_life',
    'Cuộc Đời Ở Lại',
    'Một Khánh Hòa nơi Peter chưa từng rời đi. Trong tiệm đồng hồ có một chiếc két sắt khóa bằng giờ.',
    'main',
    [['obj_ch5_open_safe', 'Mở két sắt trong tiệm đồng hồ', 'opened_alpha_safe']],
    'quest_ch5_the_pruner',
  ),
  q(
    'quest_ch5_the_pruner',
    'Kẻ Tỉa Cành',
    'Một Peter khác chờ trên vọng lâu, tay cầm chiếc kéo đã tỉa hàng trăm thế giới.',
    'main',
    [
      ['obj_ch5_beat_other_peter', 'Đối mặt Peter nhánh Alpha', 'defeated_other_peter'],
      ['obj_ch5_resolve_letter', 'Quyết định số phận lá thư', 'resolved_alpha_letter'],
    ],
    'quest_ch5_steel_city',
  ),
  q(
    'quest_ch5_steel_city',
    'Thành Phố Đồng Hồ Thép',
    'Nhánh Beta đã khóa thời gian để không ai phải chết, rồi tự sụp đổ.',
    'main',
    [
      ['obj_ch5_cross_bridge', 'Vượt cây cầu lượng tử', 'crossed_quantum_bridge'],
      ['obj_ch5_restart_reactor', 'Khởi động lại lò phản ứng', 'restarted_reactor'],
    ],
    'quest_ch5_the_children',
  ),
  q(
    'quest_ch5_the_children',
    'Bầu Trời Vẽ Bằng Phấn',
    'Bốn mươi đứa trẻ cuối cùng của Beta sống dưới một bầu trời vẽ tay.',
    'main',
    [
      ['obj_ch5_meet_mira', 'Vào hầm trú ẩn', 'met_mira'],
      ['obj_ch5_reach_anchor', 'Theo Kuro tới nơi thả neo', 'ch5_reached_anchor'],
    ],
    'quest_ch5_unborn_king',
  ),
  q(
    'quest_ch5_unborn_king',
    'Vua Chưa Sinh',
    'Kuro muốn kéo nhánh Beta trở lại tồn tại, và một vị vua chưa từng được sinh ra đang chờ.',
    'main',
    [
      ['obj_ch5_answer_kuro', 'Trả lời Kuro', 'answered_kuro_ledger'],
      ['obj_ch5_beta_choice', 'Quyết định số phận nhánh Beta', 'resolved_beta_choice'],
      ['obj_ch5_beat_king', 'Đánh bại Vua Chưa Sinh', 'defeated_unborn_king'],
      ['obj_ch5_escape', 'Thoát khỏi bờ va chạm', 'escaped_collision'],
    ],
  ),
  q(
    'quest_ch5_uprooted_seeds',
    'Những Hạt Giống Bị Nhổ',
    'Ai đó đã nhổ những hạt giống khỏi luống và vứt rải rác khắp các nhánh.',
    'side',
    [['obj_ch5_plant_seeds', 'Gieo lại năm hạt giống', 'planted_uprooted_seeds']],
  ),
  q(
    'quest_ch5_old_seeds',
    'Những Hạt Giống Cũ',
    'Mỗi lựa chọn ở chiến trường cũ đã rơi xuống thành một hạt giống.',
    'side',
    [['obj_ch5_water_seed', 'Tưới một hạt giống', 'watered_old_seed']],
  ),
  q(
    'quest_ch5_chalk_sky',
    'Bầu Trời Của Mira',
    'Mira cần bốn màu phấn để vẽ cho xong bầu trời trên trần hầm.',
    'side',
    [['obj_ch5_chalk', 'Mang đủ bốn màu phấn cho Mira', 'finished_chalk_sky']],
  ),
];
quests.quests = quests.quests.filter((x) => !x.id.startsWith('quest_ch5_')).concat(CH5_QUESTS);
const lastWar = quests.quests.find((x) => x.id === 'quest_ch4_the_last_war');
if (lastWar) lastWar.followUpQuestId = 'quest_ch5_into_the_interval';

// ================================================================== items
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
const puzzle = (id, name, description, stackable = false) => ({
  id,
  name,
  type: 'puzzle',
  description,
  value: 0,
  stackable,
  maxStack: stackable ? 10 : 1,
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
const CH5_ITEMS = [
  {
    ...doc(
      'kuro_ledger',
      'Sổ Nhớ Hộ',
      'Cuốn sổ Kuro đưa cho Peter để ghi lại những gì anh kể về mình.',
      ["Trang đầu, nét chữ của Kuro:\n'Ghi lại những gì tao kể. Tao sẽ hỏi lại.'"],
    ),
    type: 'key_item',
  },
  doc('kuro_ledger_page_1', 'Sổ Nhớ Hộ — Trang 1', 'Chuyện đầu tiên Kuro kể.', [
    'Kuro kể ở vườn hạt:\nHồi nhỏ, Kuro nuôi một con mèo mướp ba chân, đặt tên là Bánh Đúc vì nó trắng như bánh đúc.',
  ]),
  doc('kuro_ledger_page_2', 'Sổ Nhớ Hộ — Trang 2', 'Chuyện thứ hai Kuro kể.', [
    "Kuro kể sau trận ở vọng lâu:\nMẹ Kuro hay hát bài 'Chiều Trên Bến Cũ' mỗi khi trời mưa.",
  ]),
  doc('kuro_ledger_page_3', 'Sổ Nhớ Hộ — Trang 3', 'Chuyện thứ ba Kuro kể.', [
    'Kuro kể ở hầm trú ẩn:\nHai đứa hứa với nhau ở mỏm đá có cây bàng gãy, nhìn ra biển.',
  ]),
  puzzle(
    'pruned_plank',
    'Ván Nhánh Tỉa',
    'Tấm ván mục của một nhánh bị tỉa, nhẹ bẫng như sương.',
    true,
  ),
  puzzle('living_plank', 'Ván Nhánh Sống', 'Tấm ván thép chắc chắn của nhánh còn sống.'),
  doc(
    'alpha_safe_note',
    'Mảnh Giấy Trong Ngăn Kéo',
    'Mảnh giấy gấp tư tìm thấy trong tiệm đồng hồ nhánh Alpha.',
    ["'Két chỉ mở theo chiếc đồng hồ duy nhất chưa từng bị thời gian của hai thế giới làm lệch.'"],
  ),
  {
    ...puzzle(
      'letter_to_daughter',
      'Thư Gửi Na',
      'Lá thư chưa gửi Peter nhánh Alpha viết cho con gái.',
    ),
    pages: [
      "'Na của bố. Nếu một ngày con đọc được thư này...'\n(Phần còn lại, mình không nỡ đọc tiếp một mình.)",
    ],
  },
  doc(
    'bridge_worker_log',
    'Sổ Tổ Thợ Cầu',
    'Cuốn sổ của tổ thợ sửa cây cầu lượng tử ở nhánh Beta.',
    [
      "'Ván của nhánh nào chỉ vững dưới chân người của nhánh đó; ván mang sang chỉ là cái bóng sắp tan.'",
    ],
  ),
  doc('ivo_reactor_log', 'Nhật Ký Kỹ Sư Ivo', 'Nhật ký vận hành lò phản ứng Chronos.', [
    "'Máy A và máy C không bao giờ được chạy cùng một nhánh — hai lõi sẽ cộng hưởng.'\n'Một máy không thể chạy ở cả hai nhánh cùng lúc.'",
  ]),
  doc(
    'reactor_warning_plate',
    'Biển Cảnh Báo Nhánh Tỉa',
    'Tấm biển rỉ sét chỉ còn ở nhánh bị tỉa.',
    ["'Máy A ở nhánh này phải chạy để giữ tường hầm trẻ em.'"],
  ),
  doc('reactor_wiring', 'Sơ Đồ Dây Cổng Lò', 'Sơ đồ điện của cổng lò phản ứng.', [
    "'Cổng lò cần đúng hai lõi sáng ở nhánh Sống.'",
  ]),
  doc('prune_stele_rubbing', 'Bản Chép Bia Vùng Xám', 'Dòng chữ chép từ tấm bia đá đang tan dần.', [
    "'Trong ba nhánh, chỉ nhánh đã bị tỉa mới nói dối — vì nó không còn gì để mất.'",
  ]),
  doc(
    'unborn_genealogy',
    'Phả Hệ Ngai Chưa Sinh',
    'Tấm phả hệ của một hoàng tộc chưa từng tồn tại.',
    [
      'Hoàng hậu thứ nhất: Hoàng tử Cả Corvin (con trưởng).\nHoàng hậu thứ hai: Hoàng tử Elric, Hoàng tử Aurel, Công chúa Lysa.',
      "Ghi chú bên lề: Elric và Lysa mất khi còn nhỏ. Aurel — 'chưa sinh'.\nNhánh viền sắt bị tỉa trước tiên.",
    ],
  ),
  puzzle('chalk_blue', 'Phấn Xanh Trời', 'Một mẩu phấn màu xanh da trời.'),
  puzzle('chalk_gold', 'Phấn Vàng Nắng', 'Một mẩu phấn vàng như nắng sớm.'),
  puzzle('chalk_red', 'Phấn Đỏ Hoàng Hôn', 'Một mẩu phấn đỏ như hoàng hôn.'),
  puzzle('chalk_white', 'Phấn Trắng Mây', 'Một mẩu phấn trắng như mây.'),
  doc('mira_drawing', 'Bức Vẽ Của Mira', 'Bức vẽ bằng phấn Mira tặng.', [
    'Hai người đứng dưới một bầu trời thật to: một người tóc xoăn, một người áo xám. Bên dưới, nét chữ nguệch ngoạc: "chú tiên với chú tóc xoăn".',
  ]),
  puzzle(
    'seed_spring_old',
    'Hạt Xuân (Nét Cũ)',
    'Hạt giống bị nhổ, khắc hình mầm non và một nét cọ cũ đã mờ.',
  ),
  puzzle('seed_summer', 'Hạt Hạ', 'Hạt giống bị nhổ, khắc hình bình tưới.'),
  puzzle('seed_autumn', 'Hạt Thu', 'Hạt giống bị nhổ, khắc hình chiếc giỏ đầy quả.'),
  puzzle('seed_winter', 'Hạt Đông', 'Hạt giống bị nhổ, khắc hình bông tuyết.'),
  puzzle(
    'seed_spring_new',
    'Hạt Xuân (Nét Mới)',
    'Hạt giống bị nhổ, khắc hình mầm non và một nét cọ còn tươi mới.',
  ),
  gear(
    'blade_of_possibility',
    'Kiếm Khả Thể',
    'weapon',
    'Lưỡi kiếm như có hai cái bóng: mỗi nhát chém kéo theo một vệt chém của nhánh kia.',
    {
      attack: 16,
      reach: 42,
      swingMs: 340,
      echoPct: 0.3,
    },
  ),
  gear(
    'silver_pruning_shears',
    'Kéo Tỉa Bạc',
    'weapon',
    'Chiếc kéo dự phòng của Kẻ Tỉa Cành. Tầm ngắn nhưng cắt rất nhanh.',
    {
      attack: 15,
      reach: 30,
      swingMs: 240,
    },
  ),
  gear(
    'alpha_wedding_ring',
    'Nhẫn Cưới Nhánh Alpha',
    'charm',
    'Chiếc nhẫn chưa từng dùng để tỉa ai.',
    {
      maxHp: 36,
      defense: 6,
    },
  ),
  gear('chosen_seed_aldric', 'Bùa Hạt Giống: Người Cha', 'charm', 'Mọc từ hạt giống của Aldric.', {
    maxHp: 40,
    defense: 6,
  }),
  gear('chosen_seed_bran', 'Bùa Hạt Giống: Người Lính', 'charm', 'Mọc từ hạt giống của Bran.', {
    attack: 5,
    maxHp: 20,
  }),
  gear(
    'chosen_seed_elion',
    'Bùa Hạt Giống: Người Chép Sử',
    'charm',
    'Mọc từ hạt giống của Elion.',
    {
      maxMp: 24,
      defense: 3,
      speed: 3,
    },
  ),
  {
    id: 'possibility_seal_shard',
    name: 'Mảnh Ấn Possibility',
    type: 'key_item',
    description: 'Mảnh tinh thể tím bạc kết tinh từ Lõi Possibility Seal.',
    value: 0,
    stackable: false,
    maxStack: 1,
  },
];
const ids = new Set(CH5_ITEMS.map((i) => i.id));
items.items = items.items.filter((i) => !ids.has(i.id)).concat(CH5_ITEMS);

write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/quests.json', quests);
write('public/assets/data/items.json', items);
console.log(
  'ch5 content:',
  Object.keys(D).filter((k) => k.startsWith('ch5_')).length,
  'nodes,',
  CH5_QUESTS.length,
  'quests,',
  CH5_ITEMS.length,
  'items',
);
