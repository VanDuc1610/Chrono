/**
 * Chapter 8 "The Null Hour & The Convergence" content (docs/story/CHAPTER_08_DESIGN.md with §17
 * owner decisions and §18 build notes): dialogue nodes, quests and items. Written by Claude.
 * Idempotent: re-running replaces every ch8_ node / quest / item it defines.
 *
 * Usage: node scripts/content-ch8.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const dlg = read('public/assets/data/dialogue.json');
const quests = read('public/assets/data/quests.json');
const items = read('public/assets/data/items.json');
const D = dlg.dialogues;
for (const k of Object.keys(D)) if (k.startsWith('ch8_')) delete D[k];

// ------------------------------------------------------------------ helpers
const node = (id, speaker, lines, extra = {}) => {
  D[id] = { id, speaker, lines, responses: [], ...extra };
};
const P = (id, lines, extra) => node(id, 'Peter', lines, extra);
const K = (id, lines, extra) => node(id, 'Kuro', lines, extra);
const N = (id, speaker, lines, extra) => node(id, speaker, lines, extra);
const FB = (id, speaker, lines, extra) => node(id, speaker, lines, { flashback: true, ...extra });
const to = (text, next) => ({ text, nextDialogueId: next });
const then = (next) => ({ responses: [to('…', next)] });
const grant = (itemId, quantity = 1, once = `took_${itemId}`, more = {}) => ({
  grantItems: [{ itemId, quantity }],
  grantOnceFlag: once,
  ...more,
});
const take = (id, lines, itemId, more = {}) =>
  P(id, lines, { effects: grant(itemId, 1, `took_${itemId}`, more) });
const FF = 'Kẻ Bị Quên Đầu Tiên';

// ================================================================== Act 1 — 1. Null rift landing (C01)
const ARRIVAL = [
  'Mình mở mắt trên một bãi cát. Cát Khánh Hòa, nhưng ngay cạnh là một sàn thép đinh tán của Beta.',
  'Hai thế giới dính vào nhau bằng một đường chỉ vàng, như ai đó vá vội một tấm áo rách.',
];
const ARRIVAL_FX = {
  setFlags: ['kuro_with_peter', 'ch8_started'],
  clearFlags: ['kuro_left'],
  startQuest: 'quest_ch8_null_landing',
};
P('ch8_arrival_b', ARRIVAL, { effects: ARRIVAL_FX, ...then('ch8_arrival_kuro_cold') });
P(
  'ch8_arrival',
  [
    'Mình mở mắt trên một bãi cát. Cát Khánh Hòa, nhưng ngay cạnh là một sàn thép đinh tán của Beta.',
    'Hai thế giới dính vào nhau bằng một đường chỉ vàng, như ai đó vá vội một tấm áo rách.',
  ],
  {
    effects: {
      setFlags: ['kuro_with_peter', 'ch8_started'],
      clearFlags: ['kuro_left'],
      startQuest: 'quest_ch8_null_landing',
    },
    ...then('ch8_arrival_kuro'),
  },
);
K('ch8_arrival_kuro', [
  'Ê. Còn sống chứ? (Kuro chìa tay kéo mình dậy. Vết mực trên cổ tay nó đã nhạt.)',
  'Giờ Số Không bắt đầu rồi. Mọi thế giới mày từng đi qua đang lao vào nhau.',
]);
K('ch8_arrival_kuro_cold', [
  'Dậy đi. (Kuro đứng cách mình hai bước, không chìa tay.)',
  'Giờ Số Không bắt đầu rồi. Đừng hỏi tao vì sao tao còn ở đây.',
]);
K('ch8_kuro_guilt', ['Hồi ở Thượng Giới tao đã bỏ mày lại. Lần này thì không.']);
P('ch8_rift_note', [
  'Bên kia đường may là một mảnh trời Beta, khói đen cuộn ngược lên.',
  'Cái cọc đá bên cạnh có khe vừa khít nửa Ấn Origin trong túi mình.',
]);
K('ch8_anchor_intro', [
  'Cái cọc đó là Cọc Neo. Cắm ấn vào rồi xoay: mày chọn thế giới nào là thật ở khúc đất quanh nó.',
  'Mỗi cọc chỉ giữ được một khúc thôi. Nhìn vệt sáng dưới chân ấy.',
]);
P(
  'ch8_c01_done',
  [
    'Cầu gỗ Khánh Hòa ở con kênh đầu, cầu sắt Beta ở con kênh sau.',
    'Mỗi chỗ một thế giới. Không phải chọn một lần cho tất cả, mà chọn đúng cho từng chỗ.',
  ],
  { effects: { setFlags: ['ch8_anchor_learned'] } },
);

// ================================================================== 2. Steel tide shore (C02)
P('ch8_shore_arrival', [
  'Bờ biển quê mình… bị những cột thép Beta đâm xuyên. Thuyền thúng mắc trên sàn sắt.',
  'Có tiếng một đứa trẻ khóc. Và giọng một người đàn bà đang dỗ nó.',
]);
N('ch8_coba', 'Cô Ba', [
  'Peter! Trời ơi, con đây rồi. Thuyền cô mắc kẹt giữa ba khúc đất lạ hoắc, chẳng biết đâu là biển nữa.',
  'Thuyền ra biển phải theo lạch nước, có đèn dẫn đường. Cô đi biển ba mươi năm, chỉ biết vậy thôi.',
]);
N(
  'ch8_na',
  'Bé Na',
  [
    'Anh Peter! Con vẽ lại bờ biển lúc còn bình thường nè. Anh xem đi!',
    'Con vẽ cả cái đường sắt, vì chú Ivo hứa làm xe lửa cho con mà.',
  ],
  then('ch8_na_crane'),
);
N('ch8_na_thanks', 'Bé Na', ['Con hạc gấp xong rồi! Lên đỉnh tháp con treo nó lên nha anh.']);
N(
  'ch8_na_crane',
  'Bé Na',
  [
    'Con còn con hạc cuối chưa gấp. Mà phải có giấy ba màu: đỏ, xanh, vàng.',
    'Anh tìm giúp con được không? Con muốn treo nó lên chỗ cao nhất.',
  ],
  { effects: { startQuest: 'quest_ch8_na_last_crane', setFlags: ['ch8_na_asked'] } },
);
N(
  'ch8_na_crane_short',
  'Bé Na',
  [
    'Con hạc thứ một nghìn con gấp rồi, anh nhớ không? Giờ là con cuối cùng nè.',
    'Con chỉ thiếu giấy ba màu thôi: đỏ, xanh, vàng.',
  ],
  { effects: { startQuest: 'quest_ch8_na_last_crane', setFlags: ['ch8_na_asked'] } },
);
P('ch8_chalk', [
  'Bức vẽ phấn của Na: một ngọn hải đăng ở góc trên, một đường ray giữa bờ, một lạch nước chạy ra biển.',
]);
P('ch8_c02_hint_1', ['Cô Ba lắc đầu: "Không có đèn thì ai dám ra khơi." Góc trên còn chưa đúng.']);
P('ch8_c02_hint_2', ['Na kéo áo mình: "Đường sắt đâu rồi anh? Con vẽ đường sắt mà!"']);
P('ch8_c02_hint_3', ['Thuyền cần lạch nước để trôi ra biển. Khúc cuối còn là sàn sắt.']);
N(
  'ch8_c02_right',
  'Cô Ba',
  [
    'Hải đăng sáng rồi! Đường ray kéo thuyền ra lạch… thuyền trôi rồi con ơi!',
    'Đi đi Peter. Bên chợ có một gã thợ máy cứ lẩm bẩm tên con đó.',
  ],
  { effects: { setFlags: ['solved_na_chalk_shore'], refreshMap: true } },
);
P('ch8_c02_done', ['Thuyền cô Ba đã ra khơi, ngọn hải đăng vẫn sáng.']);
P('ch8_shore_exit_locked', ['Phía đông là chợ, nhưng thuyền cô Ba còn mắc ngang lối đi.']);
take(
  'ch8_paper_red',
  ['Một tờ giấy màu đỏ kẹt dưới mạn thuyền. Na chắc sẽ thích.'],
  'colored_paper_red',
  {
    setFlags: ['found_paper_red'],
  },
);

// ================================================================== 3. Gear market (C03)
P('ch8_market_arrival', [
  'Chợ Đầm Khánh Hòa, nhưng sạp hàng nào cũng mọc bánh răng. Mùi cá khô lẫn mùi dầu máy.',
]);
N('ch8_ivo', 'Ivo', [
  'Peter? Đúng là cậu rồi. Cửa xưởng kẹt, ba cái bánh răng thì mất hai.',
  'Sổ tay của tôi ghi hết số đo. Cậu xem rồi lắp giúp, tay tôi run quá.',
]);
P('ch8_notebook', [
  'Sổ tay Ivo: "Bánh vào 12 răng, quay thuận. Trục 1 cách trục 2 đúng 28 răng (tổng răng hai bánh kề nhau)."',
  '"Trục 2 cách trục 3 đúng 40 răng. Cửa chỉ mở nếu bánh ra quay chậm bằng một nửa bánh vào."',
]);
N('ch8_c03_wrong', 'Ivo', [
  'Răng không ăn khớp. Nghe tiếng rít không? Tính lại khoảng cách trục đi.',
]);
N(
  'ch8_c03_right',
  'Ivo',
  [
    'Mười sáu ở giữa, hai mươi bốn ở cuối. Chậm đúng một nửa! Cậu vẫn tính nhanh như hồi đó.',
    'Tôi đi với cậu. Cái tháp đồng hồ giữa vùng hỗn loạn kia, tôi muốn xem nó chạy bằng gì.',
  ],
  {
    effects: {
      setFlags: ['solved_ivo_gears', 'ch8_with_ivo', 'ivo_joined'],
      refreshMap: true,
    },
    ...then('ch8_ivo_ledger'),
  },
);
N('ch8_c03_done', 'Ivo', ['Cửa mở rồi. Đi thôi.']);
take(
  'ch8_secret1_take',
  ['Dưới sạp hàng là một đoạn chỉ vàng đứt. Nó ấm, và khắc những chữ rất nhỏ.'],
  'world_secret_seam_thread',
);
N(
  'ch8_ivo_ledger',
  'Ivo',
  [
    'Cái két dưới đống thùng kia… tôi nợ một người một món nợ chưa trả. Sổ của người đó khóa trong két.',
    'Nếu cậu có sổ cái của người ấy, có lẽ mở được.',
  ],
  { effects: { startQuest: 'quest_ch8_ivo_debt' } },
);
P('ch8_vault_locked', ['Đống thùng thép chặn lối xuống két. Cần một thứ để mở.']);
K(
  'ch8_vault_open',
  ['Sổ cái của tao. (Kuro rút cuốn sổ trong túi mình ra, lật trang cuối.) Cái két này nhận nó.'],
  { effects: { setFlags: ['opened_ledger_vault'], refreshMap: true } },
);
P('ch8_market_exit_locked', ['Cửa xưởng kẹt cứng. Phải sửa bánh răng trước.']);

// ================================================================== 4. Drowned foundry
P('ch8_foundry_arrival', [
  'Xưởng đúc chìm một nửa trong nước biển. Mấy quả chuông đồng treo lơ lửng, tự đung đưa.',
]);
N('ch8_ivo_bells', 'Ivo', [
  'Chuông Báo Tận. Nó đánh ba tiếng rồi nổ một vòng sóng. Đập nó ngay sau tiếng đầu là nó nứt.',
]);
FB(
  'ch8_fb1',
  'Kuro (14 tuổi)',
  [
    '(Ký ức: một xưởng nhỏ ở Beta. Ivo trẻ và Kuro mười bốn tuổi cùng cúi xuống một chiếc đồng hồ hỏng.)',
    'Mày làm cho nó chạy, tao làm cho nó đẹp. Rồi tụi mình bán cho cả cái thành phố này.',
  ],
  then('ch8_fb1_after'),
);
N('ch8_fb1_after', 'Ivo', [
  'Tôi từng dạy một thằng nhóc tóc thẳng sửa đồng hồ. Nó khéo tay hơn tôi.',
  '(Ivo liếc Kuro. Kuro quay đi.)',
]);
P('ch8_crucible', [
  'Một nồi nấu kim loại nguội ngắt, bên trong là những mảnh ấn vỡ không rõ của thế giới nào.',
]);

// ================================================================== Act 2 — 5. Ragged forum (C04)
P(
  'ch8_forum_arrival',
  [
    'Quảng trường Sol-Karis. Cẩm thạch trắng, nhưng trên đó là bùn chiến hào và cờ đỏ rách.',
    'Lính lê dương và lính chiến hào đi tuần chung một con đường, xuyên qua nhau mà không thấy nhau.',
  ],
  { effects: { startQuest: 'quest_ch8_ragged_empire' } },
);
N('ch8_lyra', 'Lyra', [
  'Peter. Lại là cậu. Lần nào thế giới sắp sụp cũng thấy mặt cậu.',
  'Cổng phía đông chỉ mở khi bốn lá cờ kể đúng trận đánh. Đế Chế thích kể chuyện theo ý nó.',
]);
P('ch8_banner_events', [
  'Bốn bệ cờ, mỗi bệ xoay được bốn sự kiện: Trống trận vang · Cổng thành mở · Cờ đỏ rách · Hoàng đế ra lệnh.',
]);
P('ch8_clue_1', ['Bia mực đen: "Không có lệnh thì không có trống."']);
P('ch8_clue_2', ['Bia mực đen: "Cờ rách sau tiếng trống, trước khi cổng mở."']);
P('ch8_clue_3', ['Cờ mực vàng: "Cổng mở rồi Hoàng đế mới ra lệnh."'], then('ch8_clue_3_lyra'));
N('ch8_clue_3_lyra', 'Lyra', [
  'Chữ vàng là chữ của Đế Chế. Đế Chế nhân quả giả, câu nào nó viết cũng nói ngược.',
]);
N('ch8_c04_wrong', 'Lyra', [
  'Không đúng. Bốn lá cờ rũ xuống. Đọc lại ba tấm biển đi, nhớ chữ vàng.',
]);
N(
  'ch8_c04_right',
  'Lyra',
  [
    'Lệnh, rồi trống, rồi cờ rách, rồi cổng mở. Đúng trận ấy. Tôi đã đứng ở cổng đó.',
    'Ivo, anh về tháp trước đi, họ cần người sửa máy. Peter, từ đây tôi đi với cậu.',
  ],
  {
    effects: {
      setFlags: ['solved_ragged_causality', 'ch8_with_lyra', 'lyra_joined'],
      clearFlags: ['ch8_with_ivo'],
      refreshMap: true,
    },
  },
);
N('ch8_c04_done', 'Lyra', ['Cổng mở rồi. Tôi dẫn đường.']);
take('ch8_paper_blue', ['Một tờ giấy màu xanh dắt trên cán cờ gãy.'], 'colored_paper_blue', {
  setFlags: ['found_paper_blue'],
});
P('ch8_forum_exit_locked', ['Cổng lê dương đóng chặt. Bốn lá cờ chưa kể đúng trận đánh.']);

// ================================================================== 6. Twin-era barracks (C05)
P('ch8_barracks_arrival', [
  'Doanh trại hai thời: nửa là chiến hào bùn, nửa là sân cẩm thạch lê dương. Ba cọc neo, ba khúc đất.',
]);
N('ch8_lyra_barracks', 'Lyra', [
  'Mỗi khúc đất một cọc. Lính chiến hào biết đường ván, lê dương biết bậc đá. Phải đi đúng thứ tự.',
]);
K(
  'ch8_kuro_post',
  [
    'Cái cọc bên kia ban công à? Tao với tới. Possibility mà, xoay một cái cọc thì có gì khó.',
    '(Kuro búng tay. Cọc Neo 3 xoay sang Chiến hào.)',
  ],
  {
    effects: {
      setFlags: ['ch8_c05_p3_w'],
      clearFlags: ['ch8_c05_p3_s', 'ch8_c05_p3_none'],
    },
  },
);
N('ch8_bran', 'Hồn Bran', [
  'Đừng dẫm vào hố bom. Lính chiến hào biết chỗ này. (Bóng Bran mờ đi, tay vẫn chỉ về phía bậc đá.)',
]);
P('ch8_bran_tag', ['Tấm thẻ bài của Bran, cắm trên một khúc gỗ. Không còn ai đứng gác nữa.']);
P('ch8_c05_right', ['Cổng lê dương ở khúc cuối mở ra. Ba khúc đất, ba lần chọn, đúng thứ tự.'], {
  effects: { setFlags: ['solved_twin_watch'], refreshMap: true },
});
P('ch8_barracks_exit_locked', ['Hàng rào thép gai chắn cổng. Khúc đất này còn đang là chiến hào.']);
P('ch8_barricade', ['Một đống chướng ngại chất cao, phía sau có lối xuống hầm.']);
N(
  'ch8_barricade_break',
  'Lyra',
  ['Tránh ra. (Lyra vung kích, đống chướng ngại đổ sập.) Kho của tiểu đoàn tôi ở dưới đó.'],
  { effects: { setFlags: ['broke_archive_barricade'], refreshMap: true } },
);
P('ch8_compass_hint', [
  'Chiếc la bàn của người thủy thủ mù rung lên, kim chỉ thẳng xuống đống chướng ngại phía nam.',
]);

// ================================================================== 7. Verdict bridge (mini-boss)
P('ch8_bridge_arrival', [
  'Cầu Phán Quyết. Ở giữa cầu là một người khổng lồ: nửa áo trắng đế chế, nửa cờ máu chiến trường.',
]);
N('ch8_praetor_confront', 'Pháp Quan Hội Tụ', [
  'Kẻ thợ đồng hồ. Ngươi đã phá bản án của ta ở Sol-Karis, đã xé lá cờ của ta ở bình nguyên.',
  'Giờ hai bản án ấy là một. Nhớ cho kỹ nhịp của ta — vì ta sẽ đọc lại nó, theo chiều ngược.',
]);
N(
  'ch8_praetor_defeated',
  'Lyra',
  ['Xong. (Lyra chống kích thở dốc.) Có ai đang đi tới.'],
  then('ch8_aldric_after'),
);
N(
  'ch8_praetor_defeated_c',
  'Lyra',
  ['Xong. (Lyra chống kích thở dốc.) Có ai đang đi tới.'],
  then('ch8_aldric_after_comfort'),
);
N('ch8_aldric_after', 'Aldric', [
  'Lá cờ đó… là của trung đoàn tôi. Cảm ơn cậu đã để nó yên nghỉ.',
  'Phía bắc là thư viện trên mây. Chúng tôi giữ cầu cho cậu.',
]);
N('ch8_aldric_after_comfort', 'Aldric', [
  'Ta thắng rồi, phải không? Lá cờ còn đó… (Aldric vẫn tin trận ấy chưa thua. Mình không nói gì.)',
  'Đi đi, chàng trai. Cầu này có ta giữ.',
]);
take(
  'ch8_secret2_take',
  ['Trên lan can có một bản giao ước khắc đá, hai con dấu: một của Sol-Karis, một của Beta.'],
  'world_secret_sol_karis_beta_treaty',
);
P('ch8_bridge_exit_locked', ['Cổng phía bắc đóng. Pháp Quan còn đứng giữa cầu.']);

// ================================================================== Act 3 — 8. Ash stair library (C06)
P(
  'ch8_library_arrival',
  [
    'Thư viện trên những bậc mây. Kệ sách của vương quốc linh hồn bị quên, chữ trên gáy sách đang chảy xuống sàn.',
  ],
  { effects: { startQuest: 'quest_ch8_ash_library' } },
);
N(
  'ch8_neris',
  'Neris',
  [
    'Đừng đứng đó nhìn. Những cái tên đang chảy khỏi trang. Chậm một chút là mất hết.',
    'Peter, tôi đọc được chữ cổ của vương quốc mình. Còn chữ Khởi Nguyên thì cậu biết. Ta làm chung.',
  ],
  {
    effects: {
      setFlags: ['ch8_with_neris', 'neris_joined'],
      clearFlags: ['ch8_with_lyra'],
      refreshMap: true,
    },
    ...then('ch8_neris_lyra'),
  },
);
N('ch8_neris_lyra', 'Lyra', ['Tôi về giữ quảng trường. Neris, trông chừng cậu ta giùm tôi.']);
N('ch8_bia_1', 'Neris', [
  '(Neris dịch) Bia một: "Những cái tên đang chảy khỏi trang. Giữ chúng đứng yên."',
]);
N('ch8_bia_2', 'Neris', ['(Neris dịch) Bia hai: "Trang giấy đã tắt. Thắp nó lên."']);
P('ch8_bia_unread', ['Chữ cổ của vương quốc linh hồn. Mình không đọc được.']);
N('ch8_c06_nx', 'Neris', ['Không! [Tên][Không] là xóa tên, không phải giữ tên. Đổi lại ngay!']);
N('ch8_c06_one', 'Neris', ['[Tên][Tĩnh]. Đúng rồi. Nhìn kìa, chữ ngừng chảy.'], {
  effects: { setFlags: ['ch8_names_still'], refreshMap: true },
});
N(
  'ch8_c06_right',
  'Neris',
  [
    '[Vật][Sáng]: trang giấy sáng lên. Cửa sang Hầm Gương mở rồi.',
    'Cậu biết không, ở vương quốc tôi, giữ một cái tên còn khó hơn giữ một mạng người.',
  ],
  { effects: { setFlags: ['solved_flowing_names'], refreshMap: true } },
);
N('ch8_solon', 'Solon', [
  'Cậu thợ đồng hồ. Ta đã chuộc lỗi đủ chưa, ta không biết. Nhưng cửa này ta mở cho cậu, không hỏi gì.',
]);
N('ch8_solon_cold', 'Solon', [
  'Lại là cậu. Cửa này… thôi, đi đi. Ta không còn sức để chặn ai nữa.',
]);
take(
  'ch8_paper_gold',
  ['Một tờ giấy màu vàng kẹp trong cuốn sách đã ngừng chảy chữ.'],
  'colored_paper_gold',
  {
    setFlags: ['found_paper_gold'],
  },
);
P('ch8_library_exit_locked', ['Kệ sách chắn lối. Chữ còn chảy, trang còn tắt.']);

// ================================================================== 9. Mirror ossuary (C07)
P('ch8_ossuary_arrival', [
  'Hầm gương: nửa là bia mộ của vương quốc linh hồn, nửa là cột mây Thượng Giới.',
  'Một ngọn đèn chiếu tia sáng dọc hành lang. Ổ khóa ở cửa bắc đang chờ ánh sáng xanh.',
]);
N('ch8_ossuary_neris', 'Neris', [
  'Ở cõi của tôi có gương bạc. Ở Thượng Giới có lăng kính nhuộm xanh. Hai cọc, hai lần chọn.',
]);
P('ch8_ossuary_note', [
  'Khắc trên tường: "Ánh sáng phải xanh trước khi rẽ. Ổ khóa chỉ nhận ánh sáng đã rẽ đúng chỗ."',
]);
P('ch8_c07_right', ['Tia sáng xanh rẽ xuống ổ khóa. Vách bia ở cửa bắc lặng lẽ tan thành mây.'], {
  effects: { setFlags: ['solved_twin_mirrors'], refreshMap: true },
});
P('ch8_ossuary_exit_locked', ['Vách bia chắn cửa bắc. Ổ khóa chưa có ánh sáng.']);
N(
  'ch8_elion',
  'Elion',
  [
    'Peter. Tôi viết xong bộ sử rồi, chỉ còn trang cuối. Mang nó tới tháp giúp tôi.',
    'Tôi muốn trang cuối được đọc ở nơi thế giới còn đứng vững.',
  ],
  { effects: { ...grant('elion_final_page'), startQuest: 'quest_ch8_elion_last_chapter' } },
);
N('ch8_elion_done', 'Elion', ['Trang cuối nằm trong tay cậu rồi. Đừng làm rơi.']);
N('ch8_warden_note', 'Neris', [
  'Kẻ Gác Kim Giây. Nó chỉ bị thương ngay sau mỗi tiếng tích. Chém ba lần đúng nhịp là kim dừng.',
]);

// ================================================================== 10. Torn page sanctum (C08)
P(
  'ch8_sanctum_arrival',
  ['Thánh điện trang xé. Ba bệ đá, ba khe trống. Trên sàn rơi ba dải giấy mép răng cưa.'],
  { effects: { startQuest: 'quest_ch8_torn_page' } },
);
take(
  'ch8_strip_a',
  ['Dải giấy A: "NGƯỜI CÓ TÊN". Mép trái lõm-lồi-lồi, mép phải lồi-lõm-lồi.'],
  'torn_page_strip_a',
);
take(
  'ch8_strip_b',
  ['Dải giấy B: "Ở TRANG NÀY". Mép trái lõm-lồi-lõm, mép phải lõm-lõm-lồi.'],
  'torn_page_strip_b',
);
take(
  'ch8_strip_c',
  ['Dải giấy C: "ĐÃ TỰ XÓA ĐỂ GIỮ CỬA". Mép trái lồi-lồi-lõm, mép phải lồi-lồi-lồi.'],
  'torn_page_strip_c',
);
P('ch8_c08_rule', [
  'Khắc dưới bệ: "Răng lồi phải gặp răng lõm. Lật ngược một dải thì mép trái thành mép phải, đọc từ dưới lên."',
  '"Trang ghép xong phải đọc xuôi được."',
]);
P('ch8_c08_wrong', [
  'Mép giấy không khớp. Chỗ răng lồi chạm răng lồi, trang giấy rách thêm một chút.',
]);
P(
  'ch8_c08_right',
  [
    'Ba dải khớp vào nhau: "NGƯỜI CÓ TÊN Ở TRANG NÀY ĐÃ TỰ XÓA ĐỂ GIỮ CỬA."',
    'Trang giấy sáng lên. Một bóng người hiện ra trong ánh sáng mờ.',
  ],
  { effects: { setFlags: ['solved_torn_page'] }, ...then('ch8_ff_1') },
);
N(
  'ch8_ff_1',
  FF,
  [
    'Ngươi đọc được rồi. Đó là trang của ta. Đêm Phân Tách, ta tự nguyện để Chronos xóa tên mình, làm nút chặn vết nứt.',
  ],
  then('ch8_fb2'),
);
FB(
  'ch8_fb2',
  FF,
  [
    '(Ký ức: Chronos đọc lệnh xóa. Chữ mờ dần… rồi cuốn sổ rung lên, trang giấy bật khỏi gáy như bị gió giật.)',
    '(Chronos sững sờ, với tay không kịp. Trang trống bay theo tia sáng cuối cùng, rơi xuống trần gian.)',
  ],
  then('ch8_ff_2'),
);
N(
  'ch8_ff_2',
  FF,
  [
    'Cuốn sổ chưa bao giờ sai… cho đến đêm đó. Không ai muốn trang ấy rơi. Nó là lỗi của cuốn sổ.',
    'Trang trống ấy là ngươi, Peter. Vì thế Hư Không trượt qua ngươi: nơi đó đã từng có một cái tên.',
  ],
  then('ch8_ff_3'),
);
P(
  'ch8_ff_3',
  [
    'Mình… là một trang giấy rơi. Một sai sót.',
    '(Kẻ Bị Quên Đầu Tiên mỉm cười, rồi tan vào ánh sáng, bay về phía ngọn tháp giữa vùng hội tụ.)',
  ],
  { effects: { setFlags: ['ch8_learned_torn_page'], refreshMap: true }, ...then('ch8_ff_kuro') },
);
K('ch8_ff_kuro', [
  'Sai sót thì sao. Tao cũng là một cái nhánh lẽ ra không được mọc. Tụi mình hợp nhau là phải.',
]);
P('ch8_sanctum_exit_locked', ['Vách bia phía đông chưa mở. Trang giấy còn rời rạc.']);

// ================================================================== Act 4 — 11. Convergence plaza (C09)
P(
  'ch8_plaza_arrival',
  [
    'Quảng trường hội tụ. Bốn cổng vỡ, bốn thế giới đổ quân vào. Ở giữa là bàn chỉ huy.',
    'Ivo, Lyra, Neris… tất cả đều ở đây. Và Aldric nữa.',
  ],
  {
    effects: {
      startQuest: 'quest_ch8_last_line',
      clearFlags: ['ch8_with_neris', 'ch8_with_lyra', 'ch8_with_ivo'],
    },
  },
);
K('ch8_plaza_scout', [
  'Tao vừa trinh sát xong. Bắc: người máy thép, lõi hơi nước lộ sau lưng. Đông: lính khiên lê dương đi thành hàng.',
  'Nam: bóng mực, chúng đọc tên người rồi xóa. Tây: hồn lính chiến hào, đánh theo hiệu kèn cũ.',
]);
N('ch8_gate_ivo', 'Ivo', ['Máy nào tôi cũng tháo được, miễn là thấy lõi.']);
N('ch8_gate_lyra', 'Lyra', ['Đưa tôi bức tường người nào, tôi phá bức đó.']);
N('ch8_gate_neris', 'Neris', ['Tôi giữ được tên người khác, kể cả khi họ quên.']);
N('ch8_gate_aldric', 'Aldric', ['Tôi thuộc mọi hiệu kèn của chiến hào ấy.']);
N('ch8_gate_bran', 'Hồn Bran', [
  'Tôi thuộc mọi hiệu kèn của chiến hào ấy. Tôi từng thổi kèn ở đó.',
]);
P('ch8_c09_wrong', [
  'Một cổng rung lên dữ dội. Người giữ cổng ấy không hợp với loại địch đang tràn tới.',
]);
P(
  'ch8_c09_right',
  [
    'Ivo cửa bắc, Lyra cửa đông, Neris cửa nam, cửa tây cho người thuộc hiệu kèn.',
    'Mỗi người về đúng chỗ của mình. Đợt địch đầu tiên tràn vào!',
  ],
  { effects: { setFlags: ['solved_four_gates', 'ch8_wave1_on'], refreshMap: true } },
);
P('ch8_wave1_done', ['Đợt một tan. Có tiếng còi từ cửa nam, đợt hai đang tới!'], {
  effects: { setFlags: ['ch8_wave2_on'], refreshMap: true },
});
P('ch8_wave2_done', ['Đợt hai rút. Đất dưới chân rung lên, đợt cuối cùng!'], {
  effects: { setFlags: ['ch8_wave3_on'], refreshMap: true },
});
FB('ch8_fb3', 'Kuro (10 tuổi)', [
  '(Ký ức: một đêm bão. Hai đứa trẻ dựng "pháo đài" bằng thuyền thúng úp ngược trên bãi cát.)',
  'Cửa nào yếu thì tao đứng. Mày lo giữ cái đèn cho khỏi tắt.',
]);
N(
  'ch8_wave3_done',
  'Lyra',
  [
    'Giữ được rồi! Phòng tuyến còn nguyên.',
    'Peter, cổng bắc dẫn lên tháp. Đi đi, chỗ này có tụi tôi.',
  ],
  { effects: { setFlags: ['held_last_line'], refreshMap: true } },
);
N('ch8_mai_song', 'Bà Mai', [
  '(Bà Mai đứng ở rìa quảng trường, khẽ hát) "Chiều trên bến cũ, ai về ai ở…"',
  '(Kuro dừng tay một nhịp, rồi kiếm của nó chém nhanh hơn.)',
]);
P('ch8_plaza_exit_locked', ['Cổng bắc còn đóng. Phòng tuyến chưa giữ xong.']);

// ================================================================== 12. Anchor tower base (C10)
P(
  'ch8_base_arrival',
  [
    'Chân Tháp Neo. Mỏ Neo Thời Gian của Khánh Hòa đã mọc thành một tòa tháp đồng hồ.',
    'Quanh cầu thang là sáu ổ ấn, mỗi ổ khắc một câu nói mình còn nhớ như in.',
  ],
  { effects: { startQuest: 'quest_ch8_anchor_tower' } },
);
const SOCKET_LINES = [
  ['ch8_socket_1', 'Ổ giờ mười hai khắc: "Trang trống ấy là ngươi, Peter." — Kẻ Bị Quên Đầu Tiên.'],
  [
    'ch8_socket_2',
    'Ổ giờ hai khắc: "…con dốc dẫn lên Ngọn Hải Đăng Sương Mù đã thông." — Peter, làng chài.',
  ],
  [
    'ch8_socket_3',
    'Ổ giờ bốn khắc: "Một khi nhân quả bị bẻ cong, cỗ máy sẽ bắt đầu chập mạch." — Lyra.',
  ],
  [
    'ch8_socket_4',
    'Ổ giờ sáu khắc: "Cháu sẽ không để ai lấy mất tên của mình." — Peter, trước cổng lăng mộ.',
  ],
  [
    'ch8_socket_5',
    'Ổ giờ tám khắc: "Chỉ khi có điểm kết thúc, ý nghĩa mới thực sự bắt đầu." — Trưởng Lão.',
  ],
  ['ch8_socket_6', 'Ổ giờ mười khắc: "Cùng một nơi, hai số phận." — Kuro, bên Mầm Rẽ Nhánh.'],
];
for (const [id, line] of SOCKET_LINES) P(id, [line]);
P('ch8_c10_wrong', ['Mặt đồng hồ lóe đỏ. Có ấn nằm sai ổ, câu khắc và ấn không cùng một chương.']);
P(
  'ch8_c10_right',
  [
    'Sáu ấn, sáu ổ, đúng sáu đoạn đường mình đã đi. Tháp sáng từ chân lên tới đỉnh.',
    'Cửa cầu thang mở. Phía trên là tiếng tích tắc dồn dập của một chiếc đồng hồ đang chạy tới Giờ Thứ 25.',
  ],
  { effects: { setFlags: ['solved_six_sockets'], refreshMap: true } },
);
P('ch8_base_exit_locked', ['Cầu thang bị mặt đồng hồ chắn. Sáu ổ ấn còn trống.']);
N('ch8_mira', 'Mira', [
  'Peter. Tôi cứ nghĩ cậu sẽ đến muộn. Cậu chưa bao giờ đến muộn.',
  'Người kia, Peter-Alpha… cậu đã viết cho anh ấy một lá thư. Tôi đọc rồi. Cảm ơn.',
]);
N('ch8_mira_spared', 'Mira', [
  'Peter. Cậu chưa bao giờ đến muộn.',
  'Peter-Alpha vẫn sống ở một nhánh nào đó, nhờ cậu. Tôi không biết nên giận hay nên biết ơn.',
]);
N(
  'ch8_mira_page',
  'Mira',
  [
    'Trang cuối của Elion? Để tôi đọc ở đây, nơi thế giới còn đứng vững. (Mira đọc khẽ.)',
    '"…và người thợ đồng hồ đi lên tháp, không mang theo gì ngoài những cái tên."',
  ],
  {
    effects: {
      ...grant('world_secret_elion_last_page'),
      takeItems: [{ itemId: 'elion_final_page', quantity: 1 }],
      setFlags: ['delivered_elion_page'],
    },
  },
);
take(
  'ch8_secret4_take',
  ['Sau chân tháp có một bản vẽ cơ khí đầy đủ, nét chữ tay ở góc rất quen.'],
  'world_secret_null_hour_switch',
);

// ================================================================== 13. Anchor tower gears
P('ch8_gears_arrival', [
  'Ruột tháp: bánh răng khổng lồ và một vết nứt hư không cắt ngang. Hai cọc neo, một bên Khánh Hòa, một bên Beta.',
]);
K('ch8_gears_kuro', [
  'Cầu tàu Khánh Hòa cho vết nứt dưới, thang máy Beta cho tường bánh răng trên. Đoán vậy thôi, mày thử đi.',
]);
P(
  'ch8_echo_door',
  [
    'Một cánh cửa bánh răng có sáu lỗ khóa. Sau nó là tiếng vọng của cả sáu ấn.',
    'Mình xoay bánh răng lớn. Cánh cửa nặng nề lùi sang một bên.',
  ],
  { effects: { setFlags: ['opened_echo_door'], refreshMap: true } },
);

// ================================================================== 14. Null clock heart (boss)
P('ch8_heart_arrival', [
  'Tim đồng hồ. Một kim giờ khổng lồ gãy nằm trên sàn. Ở giữa phòng, một bóng trùm đầu mang mặt đồng hồ trên ngực.',
]);
N(
  'ch8_herald_confront',
  'Sứ Giả Giờ Số Không',
  [
    'Hai mươi giờ. Hai mươi mốt. Ta không ác, thợ đồng hồ. Ta chỉ đếm.',
    'Khi kim chạm vạch thứ hai mươi lăm, mọi thế giới sẽ thành một điểm. Không ai còn bị quên nữa.',
  ],
  then('ch8_herald_kuro'),
);
K('ch8_herald_kuro', [
  'Đồng đội mày đang giữ tháp ở dưới. Gọi họ đi, mỗi người đẩy kim lùi được một lần. Còn tao… tao giữ nhịp cuối.',
]);
P(
  'ch8_herald_defeated',
  [
    'Kim đứng lại ở 11:59. Các thế giới vẫn chồng lên nhau, nhưng không lao vào nhau nữa.',
    'Sứ Giả tan đi, để lại một lưỡi kiếm có mặt la bàn trên chuôi.',
  ],
  {
    effects: {
      ...grant('convergence_compass_blade'),
      setFlags: ['defeated_null_hour_herald'],
      refreshMap: true,
    },
  },
);
P('ch8_heart_exit_locked', ['Cửa lên đỉnh tháp đóng chặt sau mặt đồng hồ.']);

// ================================================================== 15. Tower crown (end)
const CROWN = ['Đỉnh tháp. Gió từ bốn thế giới thổi cùng lúc. Bên dưới, đồng đội đang ngước lên.'];
P('ch8_end_1', CROWN, then('ch8_end_crane'));
P('ch8_end_1b', CROWN, then('ch8_end_crane_none'));
K('ch8_crown_warm', [
  'Leo hết từng này bậc mà mày không thở dốc à? Hồi nhỏ leo cây bàng mày khóc đó nha.',
]);
K('ch8_crown_cold', ['(Kuro đi trước, không quay lại.) Lên tới nơi rồi. Đừng đứng gần mép.']);
N(
  'ch8_end_crane',
  'Bé Na',
  ['(Bé Na chạy lên, buộc con hạc giấy ba màu vào lan can.) Chỗ cao nhất rồi nè anh!'],
  then('ch8_end_kuro'),
);
P(
  'ch8_end_crane_none',
  ['(Lan can trống trơn. Gió thổi qua những thanh sắt.)'],
  then('ch8_end_kuro'),
);
K(
  'ch8_end_kuro',
  [
    'Hồi đó tao nói: "Tao sẽ để lại một chiếc ghế trống cho mày." Còn nửa câu sau mày chưa nghe.',
    '"…và nếu tao không về kịp, mày cứ ngồi vào ghế ấy."',
  ],
  then('ch8_fb4'),
);
FB(
  'ch8_fb4',
  'Ông Thợ Đồng Hồ',
  [
    '(Ký ức: tiệm đồng hồ nhỏ. Ông thợ đặt chiếc đồng hồ vỏ đồng vào tay Peter tám tuổi.)',
    'Đồng hồ không giữ thời gian, con à. Người giữ đồng hồ mới giữ.',
  ],
  then('ch8_end_chronos'),
);
N(
  'ch8_end_chronos',
  'Chronos',
  [
    '(Ánh vàng từ những sợi xích tan cuộn lại thành một người: tóc bạc trắng, áo choàng vàng rách thành xích.)',
    'Possibility. Vết nứt đầu tiên của mọi vết nứt.',
  ],
  then('ch8_end_chronos_2'),
);
N(
  'ch8_end_chronos_2',
  'Chronos',
  ['Còn ngươi… là trang giấy ta đánh rơi. Lỗi duy nhất của ta. Đưa nửa Ấn Origin đây.'],
  then('ch8_end_final'),
);
P(
  'ch8_end_final',
  ['Kuro bước lên chắn trước mình. Mình đứng giữa hai người, tay vẫn nắm chặt nửa ấn.'],
  {
    effects: {
      setFlags: ['ch8_chronos_returned', 'witnessed_ch8_cliffhanger'],
      endChapter: 8,
    },
  },
);

// ================================================================== hidden A — war archive (C11)
P('ch8_archive_arrival', ['Kho binh thư hai triều. Một cánh cửa sắt với ba vòng số.']);
P('ch8_archive_plate', [
  'Bản khắc: "Cộng ba số được mười lăm. Số giữa gấp đôi số đầu. Số cuối là số lẻ lớn nhất có thể."',
]);
P('ch8_c11_wrong', ['Ba vòng số kêu lạch cạch rồi trả về. Chưa đúng.']);
N(
  'ch8_c11_right',
  'Lyra',
  ['Hai, bốn, chín. (Cửa sắt mở.) Đây là kho của tiểu đoàn tôi. Ngọn kích này… cậu cầm đi.'],
  {
    effects: {
      ...grant('lyra_vanguard_halberd'),
      setFlags: ['solved_war_archive'],
      refreshMap: true,
    },
  },
);
P('ch8_c11_done', ['Kho đã trống.']);
P('ch8_c12_done', ['Két đã mở. Trang cuối vẫn để trống một ô tên.']);

// ================================================================== hidden B — blank ledger vault (C12)
P('ch8_vault_arrival', ['Két sổ cái. Trên bục là cuốn sổ của Kuro, lật sẵn trang cuối.']);
P('ch8_ledger', [
  'Sổ ghi nợ tính bằng giờ: Kuro nợ Peter 3. Peter nợ Na 3. Na nợ Kuro 1. Ivo nợ Kuro 4.',
  'Dòng khắc trên két: "Trang cuối chỉ mở cho người không nợ ai, cũng không ai nợ."',
]);
P('ch8_c12_wrong', ['Két không mở. Người ấy vẫn còn nợ, hoặc vẫn còn được nợ.']);
K(
  'ch8_c12_right',
  [
    'Peter. Hừ. Đến cái sổ cũng không ghi được mày. (Trang cuối mở ra: một ô tên bỏ trống.)',
    'Tao giữ chỗ đó cho mày từ năm mười bốn tuổi. Đừng có cười.',
  ],
  {
    effects: {
      ...grant('world_secret_unwritten_ledger'),
      setFlags: ['solved_kuro_ledger'],
    },
  },
);
N(
  'ch8_ivo_debt_done',
  'Ivo',
  ['Món nợ bốn giờ… tôi trả rồi. Cảm ơn cậu, Peter. Và cảm ơn thằng nhóc tóc thẳng kia.'],
  { effects: { setFlags: ['settled_ivo_debt'] } },
);

// ================================================================== hidden C — sixfold echo hall (C13)
P('ch8_echo_arrival', [
  'Sảnh vọng sáu ấn. Sáu cột đá, mỗi cột một màu ấn. Ở giữa có thứ gì đó đang chờ.',
]);
const SEALS = ['Continuum', 'Causality', 'Memory', 'Finality', 'Possibility', 'Origin'];
SEALS.forEach((s, k) => {
  P(`ch8_pillar_${k + 1}`, [`Cột ấn ${s} sáng lên.`], {
    effects: { setFlags: [`ch8_pillar_${k + 1}`], refreshMap: true },
  });
});
P('ch8_pillar_wrong', ['Tất cả các cột tắt phụt. Phải bấm theo thứ tự mình đã khôi phục các ấn.'], {
  effects: { clearFlags: SEALS.map((_, k) => `ch8_pillar_${k + 1}`), refreshMap: true },
});
P('ch8_pillar_lit', ['Cột này đã sáng.']);
P(
  'ch8_c13_right',
  ['Sáu cột cùng sáng. Ở giữa sảnh, một bóng người hiện ra mang sáu vòng ấn quanh mình.'],
  { effects: { setFlags: ['solved_six_pillars'], refreshMap: true } },
);
N('ch8_echo_confront', 'Tàn Ảnh Sáu Ấn', [
  'Ngươi đã khôi phục từng ấn một. Giờ hãy đỡ tất cả chúng cùng lúc.',
]);
N(
  'ch8_echo_defeated',
  'Chronos (vọng lại)',
  ['(Một giọng nói rất xa) …Sáu ấn. Ngươi giữ được cả sáu. Có lẽ ta đã đánh rơi đúng trang.'],
  { effects: { ...grant('sixfold_hour_charm'), setFlags: ['defeated_sixfold_echo'] } },
);

// ================================================================== quests
const q = (id, title, description, kind, objectives, followUpQuestId) => ({
  id,
  title,
  kind,
  chapter: 8,
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
const CH8_QUESTS = [
  q(
    'quest_ch8_null_landing',
    'Bãi Đáp Khe Nứt',
    'Giờ Số Không đã bắt đầu. Các thế giới dính vào nhau bằng những đường chỉ vàng.',
    'main',
    [['obj_ch8_anchor', 'Học cách dùng Cọc Neo', 'ch8_anchor_learned']],
    'quest_ch8_steel_shore',
  ),
  q(
    'quest_ch8_steel_shore',
    'Bờ Biển Thép',
    'Bờ biển Khánh Hòa bị Thành Phố Beta đâm xuyên. Cô Ba và bé Na mắc kẹt.',
    'main',
    [
      ['obj_ch8_boat', 'Đưa thuyền cô Ba ra khơi', 'solved_na_chalk_shore'],
      ['obj_ch8_ivo', 'Sửa bánh răng cửa xưởng của Ivo', 'solved_ivo_gears'],
    ],
    'quest_ch8_ragged_empire',
  ),
  q(
    'quest_ch8_ragged_empire',
    'Đế Chế Cờ Rách',
    'Quảng trường Sol-Karis chồng lên bình nguyên chiến hào.',
    'main',
    [
      ['obj_ch8_banners', 'Kể đúng trận đánh trên bốn lá cờ', 'solved_ragged_causality'],
      ['obj_ch8_barracks', 'Vượt qua Doanh Trại Hai Thời', 'solved_twin_watch'],
      ['obj_ch8_praetor', 'Vượt qua Pháp Quan Hội Tụ', 'defeated_convergent_praetor'],
    ],
    'quest_ch8_ash_library',
  ),
  q(
    'quest_ch8_ash_library',
    'Thư Viện Bậc Tro',
    'Chữ trong sách đang chảy khỏi trang. Neris cần giúp.',
    'main',
    [
      ['obj_ch8_names', 'Giữ những cái tên đứng yên', 'solved_flowing_names'],
      ['obj_ch8_mirrors', 'Đưa ánh sáng xanh tới ổ khóa Hầm Gương', 'solved_twin_mirrors'],
    ],
    'quest_ch8_torn_page',
  ),
  q(
    'quest_ch8_torn_page',
    'Trang Xé',
    'Ba dải giấy của một trang Sổ Khởi Nguyên.',
    'main',
    [
      ['obj_ch8_page', 'Ghép lại trang giấy', 'solved_torn_page'],
      ['obj_ch8_truth', 'Nghe Kẻ Bị Quên Đầu Tiên kể', 'ch8_learned_torn_page'],
    ],
    'quest_ch8_last_line',
  ),
  q(
    'quest_ch8_last_line',
    'Phòng Tuyến Cuối',
    'Bốn cổng vỡ, bốn thế giới đổ quân vào quảng trường hội tụ.',
    'main',
    [
      ['obj_ch8_gates', 'Giao mỗi cổng cho đúng người', 'solved_four_gates'],
      ['obj_ch8_hold', 'Giữ phòng tuyến qua ba đợt', 'held_last_line'],
    ],
    'quest_ch8_anchor_tower',
  ),
  q(
    'quest_ch8_anchor_tower',
    'Tháp Neo',
    'Mỏ Neo Thời Gian của Khánh Hòa đã thành một tòa tháp. Kim đồng hồ đang chạy tới Giờ Thứ 25.',
    'main',
    [
      ['obj_ch8_sockets', 'Đặt sáu ấn vào đúng ổ', 'solved_six_sockets'],
      ['obj_ch8_herald', 'Dừng Sứ Giả Giờ Số Không', 'defeated_null_hour_herald'],
      ['obj_ch8_crown', 'Lên đỉnh tháp', 'witnessed_ch8_cliffhanger'],
    ],
  ),
  q(
    'quest_ch8_na_last_crane',
    'Con Hạc Cuối Của Na',
    'Bé Na cần giấy ba màu để gấp con hạc cuối cùng.',
    'side',
    [
      ['obj_ch8_red', 'Tìm giấy đỏ', 'found_paper_red'],
      ['obj_ch8_blue', 'Tìm giấy xanh', 'found_paper_blue'],
      ['obj_ch8_gold', 'Tìm giấy vàng', 'found_paper_gold'],
      ['obj_ch8_crane', 'Đưa giấy cho Na', 'gave_na_papers'],
    ],
  ),
  q(
    'quest_ch8_ivo_debt',
    'Món Nợ Của Ivo',
    'Ivo nợ một người một món nợ chưa trả. Sổ của người đó khóa trong két.',
    'side',
    [
      ['obj_ch8_vault', 'Mở két sổ cái', 'solved_kuro_ledger'],
      ['obj_ch8_settle', 'Báo lại cho Ivo', 'settled_ivo_debt'],
    ],
  ),
  q(
    'quest_ch8_elion_last_chapter',
    'Chương Cuối Của Elion',
    'Elion muốn trang cuối bộ sử được đọc ở nơi thế giới còn đứng vững.',
    'side',
    [['obj_ch8_page_home', 'Mang trang cuối tới Tháp Neo', 'delivered_elion_page']],
  ),
];
N(
  'ch8_na_give',
  'Bé Na',
  ['Đủ ba màu rồi! Con gấp liền nè. Lên tới đỉnh tháp con sẽ treo nó lên.'],
  {
    effects: {
      takeItems: [
        { itemId: 'colored_paper_red', quantity: 1 },
        { itemId: 'colored_paper_blue', quantity: 1 },
        { itemId: 'colored_paper_gold', quantity: 1 },
      ],
      setFlags: ['gave_na_papers'],
      ...grant('na_last_crane'),
    },
  },
);
N('ch8_na_waiting', 'Bé Na', ['Anh tìm được giấy chưa? Đỏ, xanh, vàng đó nha.']);
N('ch8_ivo_plaza', 'Ivo', ['Cửa bắc để tôi. Cậu lo việc của cậu.']);
N(
  'ch8_ivo_plaza_debt',
  'Ivo',
  ['Cậu mở được két rồi à? Kể tôi nghe đi.'],
  then('ch8_ivo_debt_done'),
);

quests.quests = quests.quests.filter((x) => !x.id.startsWith('quest_ch8_')).concat(CH8_QUESTS);
const lastCh7 = quests.quests.find((x) => x.id === 'quest_ch7_null_hour_awakening');
if (lastCh7) lastCh7.followUpQuestId = 'quest_ch8_null_landing';

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
const puzzle = (id, name, description) => ({
  id,
  name,
  type: 'puzzle',
  description,
  value: 0,
  stackable: false,
  maxStack: 1,
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
const CH8_ITEMS = [
  doc('torn_page_strip_a', 'Dải Giấy A', 'Một dải của trang Sổ Khởi Nguyên.', [
    'Chữ: "NGƯỜI CÓ TÊN".\nMép trái (trên xuống): lõm, lồi, lồi.\nMép phải: lồi, lõm, lồi.',
  ]),
  doc('torn_page_strip_b', 'Dải Giấy B', 'Một dải của trang Sổ Khởi Nguyên.', [
    'Chữ: "Ở TRANG NÀY".\nMép trái (trên xuống): lõm, lồi, lõm.\nMép phải: lõm, lõm, lồi.',
  ]),
  doc('torn_page_strip_c', 'Dải Giấy C', 'Một dải của trang Sổ Khởi Nguyên.', [
    'Chữ: "ĐÃ TỰ XÓA ĐỂ GIỮ CỬA".\nMép trái (trên xuống): lồi, lồi, lõm.\nMép phải: lồi, lồi, lồi.',
  ]),
  doc('elion_final_page', 'Trang Cuối Của Elion', 'Trang cuối bộ sử, mực còn chưa khô.', [
    'Trang cuối viết về một người thợ đồng hồ đi qua sáu thời đại. Dòng cuối còn để trống.',
  ]),
  doc('world_secret_seam_thread', 'Bí Mật I: Sợi Chỉ Vàng', 'Một đoạn chỉ vàng đứt.', [
    'Những đường may nối các thế giới là chính các sợi xích của Chronos, tan ra và khâu chúng lại.',
  ]),
  doc(
    'world_secret_sol_karis_beta_treaty',
    'Bí Mật II: Giao Ước Hai Thành',
    'Bản giao ước khắc đá trên Cầu Phán Quyết.',
    [
      'Sol-Karis và Beta từng là hai nhánh của cùng một thực tại. Nhánh bị cắt ra ở Khu Vườn Khả Năng, mỗi bên quên mất bên kia.',
    ],
  ),
  doc('world_secret_elion_last_page', 'Bí Mật III: Dòng Cuối Bộ Sử', 'Mira đọc to ở chân tháp.', [
    '"…và người thợ đồng hồ đi lên tháp, không mang theo gì ngoài những cái tên."',
  ]),
  doc('world_secret_null_hour_switch', 'Bí Mật IV: Công Tắc Giờ Số Không', 'Bản vẽ đầy đủ.', [
    'Null Hour là cơ chế tự hủy: khi Ấn Origin vỡ, mọi thế giới bị ép về một điểm để không thế giới nào bị Hư Không ăn dần.',
    'Góc bản vẽ, chữ tay: "Nếu ta không về, hãy để mọi thứ thành một." — C.',
  ]),
  doc('world_secret_unwritten_ledger', 'Bí Mật V: Ô Tên Bỏ Trống', 'Trang cuối sổ cái của Kuro.', [
    'Một ô tên bỏ trống, giữ chỗ từ năm mười bốn tuổi. Bên dưới, nét chữ trẻ con: "chỗ của thằng thợ đồng hồ".',
  ]),
  puzzle('colored_paper_red', 'Giấy Màu Đỏ', 'Một tờ giấy màu đỏ, đủ gấp một con hạc.'),
  puzzle('colored_paper_blue', 'Giấy Màu Xanh', 'Một tờ giấy màu xanh, đủ gấp một con hạc.'),
  puzzle('colored_paper_gold', 'Giấy Màu Vàng', 'Một tờ giấy màu vàng, đủ gấp một con hạc.'),
  gear(
    'convergence_compass_blade',
    'Kiếm La Bàn Hội Tụ',
    'weapon',
    'Lưỡi kiếm Sứ Giả để lại, chuôi có mặt la bàn chỉ về nơi thế giới còn đứng vững.',
    { attack: 24, reach: 46, swingMs: 300, echoPct: 0.2 },
  ),
  gear(
    'lyra_vanguard_halberd',
    'Kích Tiền Phong Của Lyra',
    'weapon',
    'Ngọn kích của tiểu đoàn tiền phong. Nặng, chậm, nhưng xa.',
    { attack: 26, reach: 56, swingMs: 380, echoPct: 0 },
  ),
  gear(
    'sixfold_hour_charm',
    'Bùa Sáu Giờ',
    'charm',
    'Sáu vòng ấn nhỏ xâu chung một sợi chỉ vàng.',
    {
      maxHp: 55,
      maxMp: 35,
      attack: 7,
      defense: 8,
      speed: 4,
    },
  ),
  gear(
    'na_last_crane',
    'Hạc Giấy Ba Màu',
    'charm',
    'Con hạc cuối của bé Na, ba màu đỏ xanh vàng.',
    {
      maxHp: 50,
      defense: 7,
    },
  ),
];
const ids = new Set(CH8_ITEMS.map((i) => i.id));
items.items = items.items.filter((i) => !ids.has(i.id)).concat(CH8_ITEMS);

write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/quests.json', quests);
write('public/assets/data/items.json', items);
console.log(
  'ch8 content:',
  Object.keys(D).filter((k) => k.startsWith('ch8_')).length,
  'nodes,',
  CH8_QUESTS.length,
  'quests,',
  CH8_ITEMS.length,
  'items',
);
