/**
 * Chapter 6 "The Hour of the Gods" content (docs/story/CHAPTER_06_DESIGN.md with §17 review and
 * §18 owner decisions): dialogue nodes, quests and items. Written by Claude. Idempotent: re-running
 * replaces every ch6_ node / quest / item it defines.
 *
 * Usage: node scripts/content-ch6.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const dlg = read('public/assets/data/dialogue.json');
const quests = read('public/assets/data/quests.json');
const items = read('public/assets/data/items.json');
const D = dlg.dialogues;
for (const k of Object.keys(D)) if (k.startsWith('ch6_')) delete D[k];

// ------------------------------------------------------------------ helpers
const node = (id, speaker, lines, extra = {}) => {
  D[id] = { id, speaker, lines, responses: [], ...extra };
};
const P = (id, lines, extra) => node(id, 'Peter', lines, extra);
const K = (id, lines, extra) => node(id, 'Kuro', lines, extra);
const N = (id, speaker, lines, extra) => node(id, speaker, lines, extra);
const FB = (id, speaker, lines, extra) => node(id, speaker, lines, { flashback: true, ...extra });
const to = (text, next) => ({ text, nextDialogueId: next });
const grant = (itemId, quantity = 1, once = `took_${itemId}`, more = {}) => ({
  grantItems: [{ itemId, quantity }],
  grantOnceFlag: once,
  ...more,
});
const take = (id, lines, itemId, quantity = 1, more = {}) =>
  P(id, lines, { effects: grant(itemId, quantity, `took_${itemId}`, more) });

// ================================================================== Act 1 — 1. Celestial stairs
const ARRIVAL = [
  'Cầu thang ánh sáng dừng ở một bậc đá trắng. Phía trên là bầu trời nứt toác, sau những vết nứt là khoảng đen không có sao.',
  'Celestial Realm. Nơi Chronos đúc nên sáu quyền năng... giờ chỉ còn bụi và bánh răng kẹt cứng.',
];
P(
  'ch6_arrival_together',
  [...ARRIVAL, 'Kuro bước lên bậc cuối, đứng cạnh mình. Lần này không ai đi trước ai.'],
  {
    effects: {
      setFlags: ['ch6_kuro_ally', 'kuro_with_peter'],
      clearFlags: ['kuro_left'],
      startQuest: 'quest_ch6_celestial_ascent',
    },
  },
);
P(
  'ch6_arrival_alone',
  [...ARRIVAL, 'Trên bậc đá có một vệt chém màu tím còn ấm. Kuro đã lên đây trước mình.'],
  {
    effects: {
      setFlags: ['kuro_left'],
      clearFlags: ['kuro_with_peter', 'ch6_kuro_ally'],
      startQuest: 'quest_ch6_celestial_ascent',
    },
  },
);
K('ch6_stairs_kuro', [
  'Hồi nhỏ tao tưởng trên trời là chỗ đẹp nhất. Hóa ra chỉ là một cái xưởng bỏ hoang.',
  'Nhìn mấy bánh răng kia đi. Kẹt hết. Thế mà bên dưới người ta vẫn gọi đây là thiên đàng.',
]);
P('ch6_stairs_stele', [
  'Bia đá khắc chữ cổ, bên dưới có người dịch lại bằng nét mực đã phai:',
  "'Origin quyết điều gì được phép bắt đầu. Không có nó, hạt giống không nảy mầm, đứa trẻ không cất tiếng khóc đầu tiên.'",
]);
P('ch6_stairs_exit_note', [
  'Phía đông là cổng của Tiền Sân. Có tiếng gió thổi qua những cột đá gãy.',
]);

// ================================================================== 2. Outer courtyard (C01)
P('ch6_courtyard_arrival', [
  'Một màn ánh sáng chói lòa chắn cổng phía bắc. Trước cổng là một bệ đá có hai khe khắc chữ.',
  'Hai bên sân có hai tấm bia. Không có lời dịch nào cả. Phải tự đọc thôi.',
]);
P('ch6_stele_sun', ['Tấm bia khắc một mặt trời tỏa tia. Ngay dưới mặt trời là một ký tự: [A].']);
P('ch6_stele_void', [
  'Tấm bia khắc một vòng tròn rỗng ruột, không có gì bên trong. Dưới vòng tròn là ký tự: [X].',
]);
P('ch6_gate_text', [
  "Chữ trên vòm cổng đã có người dịch: 'Cổng chỉ mở cho kẻ biết xóa đi bức màn rực rỡ, để đón lại sự tĩnh lặng ban đầu.'",
]);
P('ch6_gate1_empty', ['Bệ khắc còn trống. Hai khe đá chờ hai ký tự.']);
P('ch6_gate1_wrong', [
  'Ký tự vừa khắc lóe lên rồi tắt ngấm. Màn sáng vẫn đứng nguyên.',
  'Bức màn cần biến mất. Ký tự đứng trước là thứ bị tác động, ký tự sau là điều xảy ra với nó?',
]);
P(
  'ch6_gate1_right',
  [
    '[A] rồi [X]. Ánh sáng... rồi trống rỗng.',
    'Màn sáng co lại như ngọn nến bị thổi, rồi tắt hẳn. Cổng phía bắc mở ra.',
    'Hai ký tự đầu tiên. Mình bắt đầu hiểu cách người ở đây viết: thứ trước, rồi điều xảy ra với nó.',
  ],
  {
    effects: {
      setFlags: ['solved_ch6_gate_1', 'ch6_glyph_a_known', 'ch6_glyph_x_known'],
    },
  },
);
P('ch6_gate1_done', ['Bệ khắc đã nguội. Cổng phía bắc vẫn mở.']);
P('ch6_courtyard_gate_locked', ['Màn ánh sáng chói tới mức không mở nổi mắt. Không đi qua được.']);
P('ch6_shadow_intro', [
  'Có thứ gì giẫm đúng lên chỗ mình vừa đứng... Một cái bóng. Bóng của chính mình, tóc xoăn, dáng đứng y hệt.',
  'Kiếm chém qua nó như chém vào khói. Nhưng nó cứ bám theo sau một nhịp.',
  'Mấy đĩa sáng trên sàn kia... Nếu dắt cái bóng đi ngang qua ánh sáng thì sao?',
]);

// ================================================================== 3. Hall of pillars (C02)
P('ch6_pillars_arrival', [
  'Điện Trụ Thiên Thể. Một ngọn đèn bên tây vẫn cháy, ánh sáng của nó đâm thẳng vào một tấm gương xoay được.',
  'Ở góc đông có tượng Archon, mắt ngọc tối om. Cánh cửa phía bắc đóng chặt.',
]);
P('ch6_floor_diagram', [
  'Hình khắc trên sàn: một tia sáng đi từ ngọn đèn phía tây, gãy khúc qua những tấm gương, rồi chạm vào mắt tượng.',
  'Cạnh mắt tượng có vẽ một giọt nước màu lam.',
]);
P('ch6_optics_note', [
  "Văn bia: 'Ánh sáng trắng đi qua lăng kính sẽ nhuốm sắc lam. Mắt Archon chỉ nhận ánh sáng lam.'",
  "'Trụ đồng làm tan ánh sáng trắng. Ánh sáng đã nhuốm lam thì đi qua nó được.'",
]);
P(
  'ch6_mural_daynight',
  [
    'Bức bích họa chia làm hai nửa. Nửa trái: mặt trời giữa trưa, khắc ký tự [A].',
    'Nửa phải: bầu trời đêm không trăng. Ký tự khắc ở đó là [O].',
    'Vậy [O] là thứ ngược với [A].',
  ],
  { effects: { setFlags: ['ch6_glyph_o_known'] } },
);
P(
  'ch6_beam_solved',
  [
    'Tia sáng lam chạm vào mắt tượng. Mắt ngọc bừng sáng, rồi một tiếng cạch vang lên ở phía bắc.',
    'Cánh cửa đá trượt sang bên. Có cầu thang dẫn lên cao.',
  ],
  { effects: { setFlags: ['aligned_pillars_c02'] } },
);
P('ch6_pillars_gate_locked', ['Cửa đá phía bắc khóa chặt. Phải làm mắt tượng sáng lên.']);
P('ch6_construct_intro', [
  'Người đá bốn tay giơ tay lên. Một vệt đỏ chạy ngang sàn, nhấp nháy... một, hai...',
  'Nhịp thứ ba nó chuyển sang vàng. Nếu chém đúng lúc đó, có khi tia sáng sẽ tắt?',
]);

// ================================================================== 4. Herald's roost
N(
  'ch6_herald_confront',
  'Sứ Giả Gãy Cánh',
  [
    'Kẻ không tên. Ta đã nghe tiếng bước chân ngươi từ lúc ngươi đặt chân lên bậc đầu tiên.',
    'Ta chờ Chủ Nhân trở về suốt mười nghìn chu kỳ. Ngươi không phải Chủ Nhân.',
  ],
  { responses: [to('Chronos đang ở đâu?', 'ch6_herald_where')] },
);
N('ch6_herald_where', 'Sứ Giả Gãy Cánh', [
  'Câu hỏi đó không dành cho kẻ chưa được ghi tên.',
  'Khiên của ta khắc bằng chữ của Ngài. Đọc được thì đi qua. Không đọc được thì nằm lại.',
]);
K('ch6_herald_kuro_help', [
  '(Một bóng người đứng trên xà ngang, quay lại nhìn mình như nhìn một người xa lạ.)',
  'Mày lại đi theo tao à? Tao không nhớ mày là ai... nhưng mặt mày làm tao thấy khó chịu kiểu quen quen.',
  'Con chim sắt đó cứng lắm. Tao đi trước đây.',
]);
K('ch6_herald_kuro_stop', [
  '(Kuro đứng trên xà ngang, vết chém tím còn bốc khói trên cánh Sứ Giả.)',
  'Mày vẫn lết theo à. Con chim sắt này để phần mày. Tao còn việc ở trên kia.',
  'Đừng cản tao lần nữa, Peter.',
]);
N(
  'ch6_herald_defeated',
  'Sứ Giả Gãy Cánh',
  [
    'Ngươi đọc được chữ của Ngài... dù chưa từng được ai dạy.',
    'Đi đi. Ngai vàng ở cuối con đường này. Nhưng đừng mong thấy ai ngồi trên đó.',
  ],
  {
    effects: grant('broken_herald_feather', 1, 'took_broken_herald_feather', {
      setFlags: ['defeated_broken_herald'],
    }),
  },
);
N('ch6_herald_after', 'Sứ Giả Gãy Cánh', ['Ngai vàng đã lạnh từ lâu. Ta chỉ còn biết giữ cửa.']);
N('ch6_herald_truth', 'Sứ Giả Gãy Cánh', [
  'Ngươi có ánh mắt của kẻ thích nghe sự thật trần trụi. Được, ta nói thêm một điều.',
  'Ngai không trống vì Ngài bỏ đi. Ngài không bao giờ rời khỏi đây. Ngài chỉ không thể ngồi lên nó nữa.',
]);
P('ch6_roost_exit_locked', ['Sứ Giả đứng chắn lối phía đông.']);

// ================================================================== Act 2 — 5. Fracture nave (C03)
P('ch6_nave_arrival', [
  'Chính Điện Phân Tách. Sáu bệ thờ xếp thành vòng tròn quanh một bệ đá trống ở giữa.',
  'Mỗi bệ khắc một huy hiệu. Túi đồ của mình ấm lên khi đến gần vài bệ... những mảnh ấn mình đã mang theo.',
]);
take(
  'ch6_parchment_take',
  ['Một cuộn da cũ kẹp dưới chân cột. Chữ đã được dịch sang tiếng người.'],
  'parchment_great_fracture',
);
P('ch6_rift_idle', ['Bệ Kẽ Nứt im lìm. Có lẽ cần thắp đúng những bệ thờ quanh nó.']);
P('ch6_rift_wrong', [
  'Năng lượng chạy vào Bệ Kẽ Nứt rồi bật ngược lại. Sàn đá rung lên.',
  'Không đúng. Phải là hai cực, không hơn không kém.',
]);
P(
  'ch6_rift_right',
  [
    'Hai luồng sáng, một từ bệ không mảnh ấn nào đáp lại, một từ bệ Finality, gặp nhau giữa Bệ Kẽ Nứt.',
    'Cái bắt đầu và cái kết thúc. Chỗ chúng va vào nhau để lại một vết nứt nhỏ màu thiên thanh...',
    'Màu của thanh kiếm gãy trong tay mình.',
  ],
  {
    effects: grant('celestial_amber_shard', 1, 'took_celestial_amber_shard', {
      setFlags: ['solved_fracture_altars'],
    }),
  },
);
P('ch6_rift_done', ['Bệ Kẽ Nứt vẫn tỏa ánh thiên thanh nhè nhẹ.']);
P('ch6_nave_exit_locked', ['Cửa phía đông chưa mở. Bệ Kẽ Nứt ở giữa điện vẫn tối.']);

// ================================================================== 6. Gallery of eras (C04)
P('ch6_gallery_arrival', [
  'Phòng Trưng Bày Kỷ Nguyên. Bốn bức bích họa kể về một thế giới bị bỏ rơi, treo lộn xộn.',
  'Bên dưới là bốn khung trống. Có lẽ phải xếp lại chúng cho đúng.',
]);
P('ch6_mural_names', [
  'Bích họa: người dân đứng giữa phố, không ai nhớ tên thành phố mình đang sống.',
]);
P('ch6_mural_ash', [
  'Bích họa: tro phủ kín chiến trường. Không còn ai sinh ra, cũng không ai chết đi.',
]);
P('ch6_mural_sea', [
  'Bích họa: biển đóng băng giữa con sóng, tàu thuyền nằm bất động trên mặt nước.',
]);
P('ch6_mural_sky', ['Bích họa: bầu trời nứt toác, những dòng thời gian xô vào nhau.']);
P('ch6_erosion_stele', [
  "Bia Thứ Tự Xâm Thực: 'Một thế giới không chết từ thân xác. Đầu tiên dòng chảy của nó lệch đi (Continuum).'",
  "'Sau đó ký ức bị vấy bẩn (Memory). Rồi các khả năng va vào nhau (Possibility). Cuối cùng ranh giới kết thúc đông cứng lại (Finality).'",
]);
P('ch6_eras_empty', ['Vẫn còn khung để trống.']);
P('ch6_eras_wrong', [
  'Bốn bức tranh rung lên rồi tự trượt về chỗ cũ.',
  'Lịch sử của sự lãng quên bị đặt sai thứ tự.',
]);
P(
  'ch6_eras_right',
  [
    'Biển đóng băng, rồi quên tên, rồi trời nứt, rồi tro tàn. Bốn khung khớp lại thành một vòng.',
    'Dưới khung cuối hiện ra hai ký tự. [I] khắc cạnh một dòng sông đang chảy. [U] khắc cạnh một mặt hồ phẳng lặng.',
    'Dòng chảy, và sự đứng yên.',
  ],
  { effects: { setFlags: ['sorted_eras_c04', 'ch6_glyph_i_known', 'ch6_glyph_u_known'] } },
);
P('ch6_eras_done', ['Bốn bức tranh đã nằm yên trong khung.']);
P('ch6_memorial_plain', [
  'Bức tường khắc kín tên những người lính thiên giới đã bị xóa. Nhiều cái tên chỉ còn lại vết đục.',
]);
P(
  'ch6_memorial_bran',
  [
    'Bức tường khắc kín tên những người lính bị xóa. Mình nhớ tới Bran, người lính đếm số lần mình chết.',
    'Mình lấy mũi kiếm gãy khắc thêm một con số vào góc tường: 1.427.',
    'Ở đây cũng phải có ai đó đếm hộ họ.',
  ],
  { effects: grant('bran_count_token', 1, 'took_bran_count_token') },
);
P('ch6_memorial_done', ['Con số 1.427 vẫn còn trên góc tường.']);
P('ch6_family_plain', [
  'Bích họa vẽ một gia đình thần thánh. Có một chỗ bị đục trống cạnh Chronos.',
]);
P('ch6_family_letter', [
  'Bích họa vẽ một gia đình thần thánh, cạnh Chronos có một chỗ bị đục trống.',
  'Peter ở nhánh Alpha đã buông kéo để ôm con gái... Còn mình thì đang đứng giữa trời, không ai chờ ở nhà.',
]);
P('ch6_family_spared', [
  'Bích họa vẽ một gia đình thần thánh, cạnh Chronos có một chỗ bị đục trống.',
  'Không biết Peter ở nhánh Alpha giờ còn cầm cây kéo bạc không. Còn phải tỉa bao nhiêu người để giữ mái nhà đó.',
]);
take(
  'ch6_oil_take_1',
  ['Dưới chân tượng có một giọt dầu thạch anh đông lại như hổ phách.'],
  'quartz_oil_gallery',
);
P('ch6_gallery_exit_locked', ['Cửa phía đông chưa mở.']);

// ================================================================== 7. Frozen cascade (C05)
P('ch6_cascade_arrival', [
  'Một thác ánh sáng lỏng đổ từ trời xuống, chẻ đôi căn phòng. Bên kia thác còn một vực sâu đầy sao.',
  'Mỗi bên có một bệ khắc hai khe.',
]);
P('ch6_stele_flow', [
  'Bia bên thác khắc hình dòng thác đang đổ. Hình thứ hai: cũng dòng thác ấy, nhưng đứng im như tượng.',
  "Dòng chữ đã dịch: 'Muốn bước qua, đừng làm dòng chảy biến mất. Hãy để nó còn đó, mà đứng yên.'",
]);
P('ch6_a1_empty', ['Bệ khắc còn trống.']);
P('ch6_a1_wrong', ['Thác ánh sáng sôi lên, bắn tia lửa ra ngoài. Không phải mệnh lệnh nó chờ.']);
P('ch6_a1_erase', [
  'Dòng thác biến mất trong một thoáng, và mọi thứ có thể bước lên cũng biến mất theo.',
  'Rồi ánh sáng đổ xuống lại như chưa từng tắt. Xóa đi thì chẳng còn gì để bước lên.',
]);
P(
  'ch6_a1_right',
  [
    '[I] rồi [U]. Dòng chảy, đứng yên.',
    'Thác ánh sáng khựng lại giữa chừng, đông thành những bậc pha lê trong suốt.',
  ],
  { effects: { setFlags: ['froze_cascade_c05'] } },
);
P('ch6_a1_done', ['Thác vẫn đông cứng thành bậc thang.']);
P('ch6_stele_matter', [
  'Bia bên vực khắc một khối đá vuông. Cạnh nó là ký tự [E].',
  "Dòng chữ: 'Ánh sáng không đỡ nổi một bàn chân. Vật thì đỡ được.'",
]);
P('ch6_a2_empty', ['Bệ khắc còn trống.']);
P('ch6_a2_wrong', ['Ký tự lóe lên rồi rơi xuống vực, mất hút giữa những vì sao.']);
P('ch6_a2_reverse', [
  'Một khối đá trôi ra giữa vực, rồi tan thành ánh sáng và rơi mất.',
  'Ngược rồi. Đá biến thành sáng thì đâu đỡ được ai.',
]);
P(
  'ch6_a2_right',
  [
    '[A] rồi [E]. Ánh sáng, thành vật.',
    'Ánh sao dưới vực dâng lên, kết lại thành một chiếc cầu mây chắc nịch.',
  ],
  { effects: { setFlags: ['bridged_chasm_c05', 'ch6_glyph_e_known'] } },
);
P('ch6_a2_done', ['Chiếc cầu mây vẫn nằm vắt qua vực.']);
P('ch6_cascade_exit_locked', ['Bên này không có lối đi tiếp.']);

// ================================================================== 8. Archives (C06)
P('ch6_archives_arrival', [
  'Thư Khố Thiên Đình. Những giá sách bằng đá cao tới trần, bụi phủ dày như tuyết.',
  'Giữa sảnh có ba tượng Archon đứng trước ba bệ chọn. Dưới chân mỗi tượng khắc một câu.',
]);
P('ch6_archives_smell_kept', [
  'Mùi bụi giấy ở đây... làm mình nhớ tiệm đồng hồ một sáng mưa. Mùi dầu máy với gỗ thông.',
  'May quá. Mình vẫn còn nhớ.',
]);
P('ch6_archives_smell_lost', [
  'Lạ thật. Mình biết mình từng có một tiệm đồng hồ. Mình biết sáng nào cũng mở cửa ở đó.',
  'Nhưng mình không tài nào nhớ nổi nó có mùi gì.',
]);
P('ch6_tribunal_law', [
  "Bia Luật Phán Xử: 'Trong ba vị Archon có đúng một Kẻ Giữ Lời, luôn nói đúng.'",
  "'Một Kẻ Dối Trá và một Kẻ Phản Ngôn. Cả hai luôn nói sai. Chìa khóa nằm trong tay Kẻ Giữ Lời.'",
]);
P('ch6_testimony_solon', ["Dưới chân tượng Solon: 'Kael là Kẻ Dối Trá.'"]);
P('ch6_testimony_kael', ["Dưới chân tượng Kael: 'Vane là Kẻ Phản Ngôn.'"]);
P('ch6_testimony_vane', ["Dưới chân tượng Vane: 'Ta không phải Kẻ Dối Trá.'"]);
P('ch6_verdict_empty', ['Vẫn còn tượng chưa được gán vai.']);
P('ch6_verdict_wrong', [
  'Ba bức tượng rung lên. Bụi trần rơi lả tả.',
  'Phán quyết sai. Thử giả sử từng người nói thật, xem lời của hai người kia có còn đứng vững không.',
]);
P(
  'ch6_verdict_right',
  [
    'Vane giữ lời. Kael phản ngôn. Solon dối trá.',
    'Tượng Vane mở bàn tay đá. Trong lòng bàn tay là một chiếc chìa khóa bằng đồng xanh.',
  ],
  {
    effects: grant('archon_library_key', 1, 'took_archon_library_key', {
      setFlags: ['solved_archon_tribunal'],
    }),
  },
);
P('ch6_verdict_done', ['Ba bức tượng đứng yên. Tượng Vane vẫn mở bàn tay.']);
N(
  'ch6_solon_meet',
  'Archon Solon',
  [
    '(Một bóng ma màu lam tách ra khỏi tượng Solon, tay ôm một con dấu.)',
    'Ngươi gọi ta là kẻ dối trá. Đúng. Ta đã đóng dấu lên lệnh trục xuất hàng nghìn thế giới vào The Interval.',
    'Ta từng viết một bản sớ can ngăn. Hội Đồng xé nó, nhét vào giá cuối, cạnh cửa sổ phía đông. Tìm lại giúp ta.',
  ],
  { effects: { setFlags: ['ch6_solon_asked'], startQuest: 'quest_ch6_solon_atonement' } },
);
N('ch6_solon_waiting', 'Archon Solon', ['Giá cuối, cạnh cửa sổ phía đông. Bản sớ có vết son đỏ.']);
N(
  'ch6_solon_plea',
  'Archon Solon',
  [
    'Đúng nét chữ của ta... "Đừng tỉa những thế giới đang khóc. Hãy dạy chúng cách tự lành."',
    'Ta đã viết đúng, nhưng lại không dám làm theo. Cầm lấy cái này. Đừng làm một kẻ đóng dấu như ta.',
  ],
  {
    effects: {
      takeItems: [{ itemId: 'solon_torn_plea', quantity: 1 }],
      ...grant('solon_mercy_clasp', 1, 'took_solon_mercy_clasp', {
        setFlags: ['resolved_solon_guilt'],
      }),
    },
  },
);
N('ch6_solon_after', 'Archon Solon', [
  'Lần đầu tiên sau mười nghìn chu kỳ, con dấu trong tay ta nhẹ đi.',
]);
P('ch6_shelf_plain', ['Những cuộn chép tay về luật lệ thiên giới. Không có gì đặc biệt.']);
take(
  'ch6_plea_take',
  ['Giữa hai cuộn luật có một tờ giấy bị xé đôi, góc còn vết son đỏ.'],
  'solon_torn_plea',
);
take(
  'ch6_secret_pruner_take',
  ['Sau một viên gạch lỏng có cuốn nhật ký nhỏ. Bìa ghi: "Kẻ Tỉa Cành Đầu Tiên".'],
  'world_secret_first_pruner',
);
P(
  'ch6_names_stele',
  [
    'Một bảng dài khắc tên người. Cạnh mỗi cái tên là ký tự [N].',
    'Có một dòng bị đục trống. Chỉ còn ký tự [N] và một vòng tròn rỗng [X] ngay sau nó.',
  ],
  { effects: { setFlags: ['ch6_glyph_n_seen'] } },
);
P(
  'ch6_chronicle',
  [
    'Trên bục là cuốn "Chính Sử Thiên Giới", mạ vàng. Trong đó Chronos chưa từng sai, chưa từng tỉa ai.',
  ],
  {
    responses: [
      to('Giữ lại, để ai đó đọc rồi tự nghĩ', 'ch6_chronicle_keep'),
      to('Đốt nó đi', 'ch6_chronicle_burn'),
    ],
  },
);
P(
  'ch6_chronicle_elion',
  [
    'Trên bục là cuốn "Chính Sử Thiên Giới", mạ vàng. Trong đó Chronos chưa từng sai, chưa từng tỉa ai.',
    'Elion đã đốt cuốn sử dối trá của mình. Lần này mình cũng được chọn.',
  ],
  {
    responses: [
      to('Giữ lại, để ai đó đọc rồi tự nghĩ', 'ch6_chronicle_keep'),
      to('Đốt nó đi', 'ch6_chronicle_burn'),
    ],
  },
);
P(
  'ch6_chronicle_keep',
  ['Mình gấp cuốn sách lại, để nguyên trên bục. Người đọc sau sẽ tự biết nghi ngờ.'],
  {
    effects: { setFlags: ['ch6_chronicle_kept', 'ch6_chronicle_decided'] },
  },
);
P(
  'ch6_chronicle_burn',
  ['Lửa liếm qua lớp vàng mỏng. Bên dưới chỉ là giấy, như mọi cuốn sách khác.'],
  {
    effects: { setFlags: ['ch6_chronicle_burnt', 'ch6_chronicle_decided'] },
  },
);
P('ch6_chronicle_done', ['Bục sách giờ đã yên.']);
P('ch6_trapdoor_locked', ['Một cửa sập dưới sàn, khóa bằng ổ đồng xanh.']);
P('ch6_trapdoor_open', ['Chìa đồng xanh vừa khít. Cửa sập mở ra, cầu thang xoắn dẫn xuống dưới.'], {
  effects: { warpTo: { mapId: 'map_ch6_secret_chronos_cell', spawnId: 'default' } },
});
P('ch6_archives_exit_locked', ['Cửa phía đông khóa. Có lẽ chìa nằm trong tay một trong ba tượng.']);

// ================================================================== 9. Chronos' cell (hidden A, C11)
P(
  'ch6_cell_arrival',
  [
    'Một căn phòng nhỏ, không cửa sổ. Trên bàn có một đĩa sao bằng đồng và một mảnh giấy.',
    'Phòng riêng của Chronos?',
  ],
  { responses: [to('…', 'ch6_fb_chronos')] },
);
FB('ch6_fb_chronos', 'Ký Ức Của Ngai Vàng', [
  'Một bóng người cao lớn đứng trước tấm gương lớn. Trong gương, từng thế giới đang rung lên.',
  'Có thứ gì đó từ khoảng đen ngoài rìa đang nuốt dần các thế giới.',
  "'Quyền năng hợp nhất này là ngọn hải đăng gọi nó tới. Ta phải tự bẻ gãy mình.'",
  'Lưỡi kiếm vung lên. Tiếng pha lê vỡ.',
]);
P('ch6_cell_ceiling', ['Trần phòng vẽ mười hai cung sao. Chòm Bọ Cạp nằm ở cung II.']);
take('ch6_scrap_take', ['Mảnh giấy viết vội, nét chữ run.'], 'chronos_private_scrap');
P('ch6_disc_wrong', ['Đĩa sao kêu lách cách rồi trôi về chỗ cũ. Không đúng.']);
P(
  'ch6_disc_right',
  [
    'Sao Bắc Cực dừng ở cung VIII, đối diện chòm Bọ Cạp. Rương đá bên cạnh bật mở.',
    'Bên trong là một tấm bích họa nhỏ và một con dấu khắc chữ "Giờ Ban Sơ".',
  ],
  {
    effects: {
      grantItems: [
        { itemId: 'world_secret_fracture', quantity: 1 },
        { itemId: 'seal_of_the_first_hour', quantity: 1 },
      ],
      grantOnceFlag: 'took_chronos_chest',
      setFlags: ['unlocked_hidden_chronos_cell'],
    },
  },
);
P('ch6_disc_done', ['Rương đá đã trống.']);
P('ch6_cell_back', ['Leo lên lại Thư Khố.'], {
  effects: { warpTo: { mapId: 'map_ch6_archives_ruins', spawnId: 'from_cell' } },
});

// ================================================================== Act 3 — 10. Genesis core (C07)
P('ch6_core_arrival', [
  'Lõi Máy Khởi Nguyên. Ba bánh răng thiên thể khổng lồ đứng im, mỗi cái gắn một cần chỉnh tốc độ.',
  'Ở giữa là một cần gạt lớn. Nếu chạy lệch nhịp, chắc trục sẽ cháy.',
]);
take(
  'ch6_handbook_take',
  ['Một cuốn sổ tay kẹp dưới bệ máy, mép giấy cháy sém.'],
  'celestial_mechanic_handbook',
  1,
  { setFlags: ['read_celestial_handbook'] },
);
P('ch6_core_wrong', [
  'Ba bánh răng rít lên, tia lửa bắn tung tóe rồi tất cả lại khựng lại.',
  'Nhịp quay lệch nhau. Mỗi bánh phải quét qua cùng một số răng trong cùng một nhịp.',
]);
P('ch6_core_unset', ['Vẫn còn bánh răng chưa chỉnh tốc độ.']);
P(
  'ch6_core_right',
  [
    'Bánh nhỏ quay nhanh, bánh lớn quay chậm, cả ba quét qua đúng ba mươi sáu răng mỗi nhịp.',
    'Lõi Máy cất lên một tiếng ngân dài. Một mảnh lõi sáng rơi ra từ khe máy.',
  ],
  {
    effects: grant('genesis_core_shard', 1, 'took_genesis_core_shard', {
      setFlags: ['activated_genesis_core'],
    }),
  },
);
P('ch6_core_done', ['Lõi Máy vẫn ngân đều.']);
take(
  'ch6_secret_null_take',
  ['Sau lõi máy, nơi trước đây bị bánh răng che khuất, có một tấm bản đồ sao khắc trên kim loại.'],
  'world_secret_null_hour',
);
take(
  'ch6_oil_take_2',
  ['Trong khe bánh răng có một giọt dầu thạch anh đông cứng.'],
  'quartz_oil_core',
);
P('ch6_core_exit_locked', ['Thang máy phía đông chưa có điện.']);

// ================================================================== 11. Bell sanctuary (C08)
P('ch6_bell_arrival', [
  'Thánh Điện Chuông Câm. Bốn quả chuông đồng không có quả lắc treo thành hàng.',
  'Mình có thể dùng thanh kiếm gãy để gõ. Nhưng gõ theo thứ tự nào?',
]);
P('ch6_bell_star', ['Chuông khắc chữ "Đá Sao". Tiếng ngân nặng và trầm.']);
P('ch6_bell_wood', ['Chuông khắc chữ "Gỗ Mục". Tiếng ngân khô, vỡ vụn.']);
P('ch6_bell_silver', ['Chuông khắc chữ "Bạc Lạnh". Tiếng ngân trong và buốt.']);
P('ch6_bell_void', ['Chuông khắc chữ "Khí Hư Vô". Gõ vào gần như không nghe thấy gì.']);
P('ch6_bell_poem', [
  "Bài thơ trên bia: 'Khởi đầu từ đá trời rơi xuống,'",
  "'Lạnh ngàn thu như ánh bạc ngời. Cây đời mục rũ thân tàn tạ, rồi tan vào hư ảo khôn nguôi.'",
]);
P('ch6_bell_rule', [
  "Bia Luật Chuông Câm: 'Nơi này âm thanh không đi từ lúc sinh ra tới lúc tan biến.'",
  "'Nó đi từ cõi hư vô, quay về hạt giống ban sơ.'",
]);
P('ch6_gardener_chime', [
  'Có tiếng chuông gió đâu đây. Đồng, rồi bạc, rồi thủy tinh. Đúng thứ tự Người Làm Vườn từng treo.',
  'Ông ấy đếm ngược mọi thứ từ cuối về đầu... Có khi chuông ở đây cũng vậy.',
]);
P('ch6_bells_empty', ['Vẫn còn nhịp chưa chọn chuông.']);
P('ch6_bells_wrong', [
  'Bốn tiếng chuông va vào nhau thành một tiếng đục ngầu.',
  'Giai điệu sai nhịp. Bài thơ chỉ là chiều xuôi.',
]);
P(
  'ch6_bells_right',
  [
    'Hư Vô... Gỗ Mục... Bạc Lạnh... Đá Sao.',
    'Bốn tiếng chuông nối vào nhau như một hơi thở dài. Cánh cửa phía đông mở.',
  ],
  { effects: { setFlags: ['solved_chime_bell'] }, responses: [to('…', 'ch6_fb_promise')] },
);
FB(
  'ch6_fb_promise',
  'Ký Ức Mờ',
  [
    'Mỏm đá có cây bàng gãy, bờ biển Khánh Hòa. Năm mười bốn tuổi. Mưa lất phất.',
    "Kuro bẻ đôi ổ bánh mì: 'Nếu một ngày tao bị xóa tên, mày phải là người nhớ.'",
    "'Tao không chỉ nhớ mày. Tao chừa cho mày một cái ghế. Cả thế giới bảo mày chưa từng sinh ra, tao vẫn đi tìm.'",
    'Kuro cười, quay mặt ra biển cho mưa che đi.',
  ],
  { effects: { setFlags: ['ch6_promise_remembered'] } },
);
K('ch6_kuro_bell', [
  'Tiếng chuông này... mày có nghe thấy tiếng mưa trong đó không?',
  'Tao nhớ ra rồi. Cái ghế. Mày hứa chừa cho tao một cái ghế. Tao tưởng tao quên mất đoạn đó rồi chứ.',
]);
P(
  'ch6_cracked_first',
  [
    'Quả chuông thứ năm nằm dưới đất, nứt một đường dài. Mặt chuông xỉn như đá cũ.',
    'Nếu có dầu thạch anh để đánh bóng, có lẽ nó sẽ ngân lại được. Nghe nói có ba giọt rải rác trong điện.',
  ],
  { effects: { startQuest: 'quest_ch6_mute_melody', setFlags: ['ch6_bell_quest'] } },
);
P('ch6_cracked_need', ['Cần đủ ba giọt dầu thạch anh, và phải biết giai điệu đúng của điện này.']);
P(
  'ch6_cracked_polish',
  [
    'Ba giọt dầu thạch anh tan ra trên mặt chuông. Vết nứt mờ dần.',
    'Mình gõ lại giai điệu ban nãy. Quả chuông nhỏ ngân lên, và một chiếc chuông con rơi ra từ lòng nó.',
  ],
  {
    effects: {
      takeItems: [
        { itemId: 'quartz_oil_gallery', quantity: 1 },
        { itemId: 'quartz_oil_core', quantity: 1 },
        { itemId: 'quartz_oil_bell', quantity: 1 },
      ],
      ...grant('echoing_origin_bell', 1, 'took_echoing_origin_bell', {
        setFlags: ['restored_chime_bell'],
        grantExp: 50,
      }),
    },
  },
);
P('ch6_cracked_done', ['Quả chuông nhỏ đã lành, thỉnh thoảng tự ngân khi có gió.']);
take('ch6_oil_take_3', ['Trong hốc tường có một giọt dầu thạch anh.'], 'quartz_oil_bell');
take(
  'ch6_secret_forgotten_take',
  [
    'Một tấm bia tưởng niệm không có tên. Chỉ có một dòng: "Người từng ngồi cạnh ngai."',
    'Mình chép lại dòng chữ, cùng những nét khắc mờ bên dưới.',
  ],
  'world_secret_first_forgotten',
);
P('ch6_bell_exit_locked', ['Cửa phía đông vẫn đóng. Bốn quả chuông chưa ngân đúng.']);

// ================================================================== 12. Orrery (C09)
P('ch6_orrery_arrival', [
  'Đài Thiên Cầu. Ba vành vàng lồng vào nhau, lơ lửng giữa trời sao. Mỗi vành có một khe cửa.',
  'Chỉ có một lối đi từ phía nam dẫn tới. Ba cần gạt nằm cạnh lối đi.',
]);
P('ch6_orrery_chart', [
  "Bản khắc bên lối đi: 'Ba vành khớp răng với nhau. Xoay vành trong, vành giữa lùi một nấc. Xoay vành giữa, vành ngoài tiến một nấc.'",
  "'Vành ngoài cùng tự quay một mình. Lõi chỉ mở cho kẻ đi thẳng từ phía nam vào.'",
]);
P(
  'ch6_orrery_core',
  ['Ba khe cửa thẳng hàng. Mình bước vào giữa lõi. Ánh sáng dưới chân cuốn mình đi.'],
  {
    effects: {
      setFlags: ['solved_orrery'],
      warpTo: { mapId: 'map_ch6_threshold_gate', spawnId: 'from_ring' },
    },
  },
);

// ================================================================== 13. Threshold gate (C10)
P('ch6_threshold_arrival', [
  'Cổng Ngưỡng Thần Thể. Một màn sáng chắn lối lên Đại Điện. Trước cổng là bệ khắc ba khe.',
]);
P('ch6_threshold_riddle', [
  "Lời sấm trên cổng: 'Ngươi có thân xác như mọi tạo vật. Nhưng sổ trời không chép tên ngươi.'",
  "'Hãy viết chính ngươi.'",
]);
P('ch6_threshold_empty', ['Bệ khắc còn trống.']);
P('ch6_threshold_wrong', [
  'Cổng thở ra một tiếng dài. "Ngươi khắc một cái tên không phải của ngươi."',
]);
P('ch6_threshold_wrong_ex', ['Cổng thở dài. "Xóa đi một vật? Ngươi vẫn đang đứng đây mà."']);
P('ch6_threshold_wrong_nx', ['Cổng thở dài. "Chỉ là một cái tên bị xóa? Ngươi có thân xác."']);
P(
  'ch6_threshold_right',
  [
    '[E], [N], [X]. Một vật. Có tên... không. Một vật không tên.',
    'Màn sáng lặng đi. Rồi nó tách ra, như một tấm rèm có người vừa vén.',
  ],
  {
    effects: { setFlags: ['opened_threshold_gate', 'ch6_glyph_n_known'] },
    responses: [to('…', 'ch6_fb_unwritten')],
  },
);
FB('ch6_fb_unwritten', 'Ký Ức Mờ', [
  'Bụi sáng nổ tung khắp nơi. Một tia sáng không màu rơi xuống, rơi mãi, rồi đáp vào đôi tay nhăn nheo của một ông thợ đồng hồ.',
  "Có một giọng nói không rõ của ai: 'Đứa bé này không có sợi chỉ định mệnh nào. Nó là một trang giấy trắng.'",
  "'Hãy nuôi nó như một đứa trẻ bình thường. Cho tới ngày các bánh răng ngừng quay.'",
]);
P('ch6_threshold_done', ['Màn sáng đã vén lên.']);
P('ch6_crack_closed', [
  'Một khe nứt trên tường, phía sau có ánh sao. Hẹp quá, nhưng hình như nó đáp lại thứ gì đó...',
]);
P('ch6_crack_open', ['Mảnh lõi trong túi rung lên. Khe nứt giãn ra vừa một người.'], {
  effects: { warpTo: { mapId: 'map_ch6_celestial_chessboard', spawnId: 'default' } },
});
P('ch6_threshold_exit_locked', ['Màn sáng chắn lối. Phải khắc đúng chính mình.']);

// ================================================================== 14. Chessboard (hidden B, C12)
P(
  'ch6_chess_arrival',
  [
    'Một bàn cờ đá bốn nhân bốn, lơ lửng giữa trời. Mười hai quân đã nằm sẵn, còn tám ô trống.',
    'Trên cao có một khoảng tối hình người cầm búa, như thể ai đó đã xóa một chòm sao khỏi bầu trời.',
  ],
  { effects: { startQuest: 'quest_ch6_lost_constellation' } },
);
P('ch6_chess_rules', [
  "Luật bàn cờ: 'Không có hai quân cùng loại trên một hàng hay một cột.'",
  "'Mặt Trăng không bao giờ đứng ngay dưới hay ngay bên phải Mặt Trời. Sao Chổi nào cũng phải chạm ít nhất một Hư Không.'",
]);
P('ch6_chess_empty', ['Vẫn còn ô trống.']);
P('ch6_chess_wrong', ['Các quân cờ rung lên rồi đứng im. Có luật nào đó đang bị phá.']);
P(
  'ch6_chess_right',
  [
    'Quân cuối cùng vào chỗ. Bàn cờ sáng lên, và khoảng tối trên trời lấp đầy bằng sao. Chòm Người Thợ Rèn.',
    "Một giọng trầm vang lên từ chòm sao: 'Thanh kiếm gãy đó là ta rèn. Ta rèn nó cho một đứa trẻ không ai đặt tên.'",
    "'Cầm lấy thanh này. Khi nào lưỡi cũ lành lại, mang nó về đây cho ta xem.'",
  ],
  {
    effects: grant('origin_astral_blade', 1, 'took_origin_astral_blade', {
      setFlags: ['aligned_celestial_chess'],
    }),
  },
);
P('ch6_chess_done', ['Chòm Người Thợ Rèn vẫn sáng trên đầu.']);
P('ch6_chess_back', ['Quay lại Cổng Ngưỡng.'], {
  effects: { warpTo: { mapId: 'map_ch6_threshold_gate', spawnId: 'from_chess' } },
});

// ================================================================== Act 4 — 15. Sanctum approach
P('ch6_approach_arrival', [
  'Đường Dẫn Điện Thờ. Hành lang dài, hai bên là cột đá. Cuối hành lang có một bóng người cầm búa.',
]);
N('ch6_deacon_confront', 'Tàn Ảnh Chấp Sự', [
  'Ba nhịp. Ngày xưa ta gõ ba nhịp để mở cửa Đại Điện mỗi sáng.',
  'Giờ không còn ai cần mở cửa nữa. Nhưng ta vẫn gõ. Đỡ được cả ba thì ngươi đi qua.',
]);
N('ch6_deacon_defeated', 'Tàn Ảnh Chấp Sự', ['Ba nhịp... đủ rồi. Cửa đã mở cho ngươi.'], {
  effects: { setFlags: ['defeated_remnant_deacon'] },
});
P('ch6_approach_exit_locked', ['Tàn Ảnh Chấp Sự đứng chắn lối.']);

// ================================================================== 16. Hall of thrones
P('ch6_thrones_arrival', [
  'Đại Điện Ngai Vàng. Ngai của Chronos nằm cuối điện, vỡ làm đôi, phủ bụi sao.',
  'Trước ngai có một cỗ máy hình nhân sư khổng lồ đang nằm. Vương miện bánh răng trên đầu nó từ từ quay.',
]);
K(
  'ch6_kuro_returns_help',
  [
    '(Kuro bước ra từ sau cột, thở dốc, vạt áo cháy sém.)',
    'Lại là mày. Kỳ lạ thật... tao quên tên mày rồi, mà chân tao cứ dẫn tao quay lại chỗ mày.',
    'Con nhân sư đó không cho tao lại gần ngai. Đứng xa ra mà xem.',
  ],
  { effects: { setFlags: ['ch6_kuro_returned'] } },
);
K(
  'ch6_kuro_returns_stop',
  [
    '(Kuro bước ra từ sau cột, tay ôm sườn.)',
    'Tao tới trước mày cả ngày trời mà vẫn không qua nổi con nhân sư đó.',
    'Đừng tưởng tao cần mày giúp. Tao chỉ... đứng đây xem thôi.',
  ],
  { effects: { setFlags: ['ch6_kuro_returned'] } },
);
N('ch6_warden_confront', 'Thực Thể Giám Hộ Khởi Nguyên', [
  'KẺ KHÔNG TÊN. KHÔNG ĐƯỢC CHẠM VÀO NGAI.',
  'GENESIS PURGE SẼ XÓA NGƯƠI VỀ LẠI LÚC CHƯA BẮT ĐẦU.',
]);
K('ch6_warden_kuro_tip', [
  'Nghe này. Sổ tay ở lõi máy nói cái chốt điều áp nằm trên lưng nó.',
  'Lúc nó đứng im tụ lực, tao giữ chân nó. Mày rút chốt.',
]);
P(
  'ch6_warden_defeated',
  [
    'Cỗ máy nằm xuống như một con thú già. Một cái chốt bằng vàng lăn ra khỏi lưng nó.',
    'Sau lưng ngai vỡ, có thứ gì đó vừa thở ra.',
  ],
  {
    effects: grant('genesis_regulator_pin', 1, 'took_genesis_regulator_pin', {
      setFlags: ['defeated_genesis_warden'],
    }),
  },
);
N(
  'ch6_remnant',
  'Dư Ảnh Chronos',
  [
    '(Một bóng người bằng ánh sáng vàng ngồi lên chiếc ngai vỡ, nhẹ như không.)',
    'Ngươi đã đi rất xa, kẻ không tên. Ngươi đọc chữ của ta. Ngươi hạ người canh cửa của ta.',
    'Và ngươi vừa mở thứ ta đã khóa.',
  ],
  { responses: [to('Ngài đã khóa thứ gì?', 'ch6_remnant_2')] },
);
N(
  'ch6_remnant_2',
  'Dư Ảnh Chronos',
  [
    '(Dư ảnh nhìn về phía cánh cửa phía đông, nơi có tiếng gió hú từ một vực sâu.)',
    'Đi mà xem. Ta không còn đủ hình hài để ngăn ngươi nữa.',
  ],
  { effects: { setFlags: ['ch6_remnant_spoke'] } },
);
N('ch6_remnant_after', 'Dư Ảnh Chronos', ['Đi đi. Thời gian của ta đã hết từ lâu.']);
K('ch6_kuro_watch', ['Đừng nhìn tao. Lo cái thứ trước mặt mày đi.']);
K('ch6_kuro_after_warden', [
  '...Mày hạ được nó thật.',
  'Tao vẫn không nhớ tên mày. Nhưng tao nhớ cái cách mày đứng chắn trước mặt tao.',
]);
P(
  'ch6_name_stone',
  [
    'Dưới chân ngai có một phiến đá không tên. Trên đó, hai cái tên khắc sát cạnh nhau, nét non nớt như của trẻ con.',
    'Peter. Kuro.',
    'Ai đã khắc ở đây? Và từ bao giờ?',
  ],
  { effects: { setFlags: ['ch6_saw_name_stone'] } },
);
P('ch6_nook_closed', ['Một khe nứt tối om sau cột. Có hơi lạnh tỏa ra.']);
P('ch6_nook_open', ['Khe nứt giờ đã rộng ra sau trận đánh. Có bậc đá dẫn xuống bóng tối.'], {
  effects: { warpTo: { mapId: 'map_ch6_first_forgotten_nook', spawnId: 'default' } },
});
P('ch6_thrones_exit_locked', ['Cửa phía đông dẫn tới một vực sâu. Chưa đi được.']);

// ================================================================== 17. First void abyss (end)
P('ch6_abyss_arrival', [
  'Vực Thẳm Hư Không. Một dải mây hẹp dẫn ra giữa khoảng đen. Ở cuối dải mây là Ấn Origin.',
]);
P(
  'ch6_cliff_1',
  [
    'Ấn Origin lơ lửng trước mặt. Nó đã nứt một đường dài từ trên xuống dưới.',
    'Mình đưa tay ra. Vết nứt toác rộng thêm, như thể chỉ chờ có người chạm vào.',
  ],
  { responses: [to('…', 'ch6_fb_forgotten')] },
);
FB(
  'ch6_fb_forgotten',
  'Ký Ức Mờ',
  [
    'Khoảng đen trước khi có bất cứ điều gì. Một bóng hình khổng lồ bị xích bằng những sợi xích chữ vàng.',
    'Nó gào thét mà không có tiếng. Từng phần cơ thể nó bị bóc ra khỏi khái niệm.',
  ],
  { responses: [to('…', 'ch6_cliff_2')] },
);
P(
  'ch6_cliff_2',
  [
    'Dưới đáy vực, một con mắt mở ra. To như cả một vầng trăng.',
    'Ấn Origin vỡ đôi. Một nửa rơi vào tay mình, một nửa chìm xuống bóng tối.',
  ],
  { responses: [to('…', 'ch6_cliff_kuro')] },
);
K(
  'ch6_cliff_kuro',
  [
    '(Một làn sóng đen dâng lên, hất Kuro văng về phía bên kia khoảng không.)',
    'Peter! Giữ lấy thanh kiếm!',
    'Tao sẽ tìm thấy mày... ở điểm tận cùng!',
  ],
  { responses: [to('…', 'ch6_cliff_end')] },
);
P(
  'ch6_cliff_end',
  [
    'Rồi chỉ còn mình đứng trên bờ vực đổ nát. Thanh kiếm gãy trong tay nóng rực.',
    'Ở đâu đó dưới kia, thứ đã bị Chronos khóa lại vừa thức dậy.',
  ],
  {
    effects: {
      setFlags: ['origin_seal_cracked', 'witnessed_ch6_cliffhanger'],
      grantItems: [{ itemId: 'origin_seal_half', quantity: 1 }],
      grantOnceFlag: 'took_origin_seal_half',
      endChapter: 6,
    },
  },
);

// ================================================================== 18. Nook (hidden C, C13)
P('ch6_nook_arrival', [
  'Hốc đá dưới chân ngai. Một khối cầu bóng tối lơ lửng trên bệ khắc ba khe.',
  'Khối cầu như đang chờ ai đó gọi đúng tên nó.',
]);
P('ch6_nook_empty', ['Bệ khắc còn trống.']);
P('ch6_nook_wrong', ['Khối cầu co lại, im lìm. Không phải tên của nó.']);
P(
  'ch6_nook_right',
  [
    '[A], [N], [X]. Ánh sáng đầu tiên... có tên, đã bị xóa.',
    'Khối cầu vỡ ra. Một cái bóng khổng lồ đứng dậy, những sợi xích chữ vàng kêu loảng xoảng.',
  ],
  { effects: { setFlags: ['ch6_echo_awake'], refreshMap: true } },
);
N('ch6_echo_confront', 'Tiếng Vọng Của Kẻ Bị Quên', [
  '...Ai... gọi... tên ta...',
  'Không ai được gọi. Không ai được nhớ. Sương của ta sẽ lau sạch ngươi.',
]);
N(
  'ch6_echo_defeated',
  'Tiếng Vọng Của Kẻ Bị Quên',
  ['Cảm ơn... đã gọi... một lần.', '(Tiếng vọng tan thành bụi chữ vàng, để lại một phù hiệu đen.)'],
  {
    effects: grant('null_origin_insignia', 1, 'took_null_origin_insignia', {
      setFlags: ['defeated_echo_first_forgotten'],
    }),
  },
);
P('ch6_nook_done', ['Hốc đá yên lặng. Chỉ còn bụi chữ vàng lấp lánh.']);
P('ch6_nook_back', ['Quay lên Đại Điện.'], {
  effects: { warpTo: { mapId: 'map_ch6_hall_of_thrones', spawnId: 'from_nook' } },
});

// ================================================================== quests
const q = (id, title, description, kind, objectives, followUpQuestId) => ({
  id,
  title,
  kind,
  chapter: 6,
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
const CH6_QUESTS = [
  q(
    'quest_ch6_celestial_ascent',
    'Bậc Thang Lên Trời',
    'Peter đặt chân lên Celestial Realm. Phải đọc được chữ của thần để đi tiếp.',
    'main',
    [
      ['obj_ch6_gate_1', 'Mở cổng Tiền Sân', 'solved_ch6_gate_1'],
      ['obj_ch6_beam', 'Làm mắt tượng Archon sáng lên', 'aligned_pillars_c02'],
    ],
    'quest_ch6_herald_fall',
  ),
  q(
    'quest_ch6_herald_fall',
    'Sứ Giả Cánh Gãy',
    'Kẻ canh cửa của Chronos chắn lối. Khiên của hắn khắc bằng chữ cổ.',
    'main',
    [['obj_ch6_herald', 'Vượt qua Sứ Giả Gãy Cánh', 'defeated_broken_herald']],
    'quest_ch6_fractured_truth',
  ),
  q(
    'quest_ch6_fractured_truth',
    'Chân Tướng Phân Tách',
    'Chính Điện Phân Tách giữ dấu vết của ngày Chronos tự bẻ gãy quyền năng của mình.',
    'main',
    [
      ['obj_ch6_rift', 'Thắp Bệ Kẽ Nứt', 'solved_fracture_altars'],
      ['obj_ch6_eras', 'Xếp lại bốn bích họa', 'sorted_eras_c04'],
    ],
    'quest_ch6_genesis_engine',
  ),
  q(
    'quest_ch6_genesis_engine',
    'Trái Tim Vũ Trụ',
    'Lõi Máy Khởi Nguyên đã ngừng quay. Tìm đường tới đó.',
    'main',
    [
      ['obj_ch6_cascade', 'Vượt qua thác ánh sáng', 'bridged_chasm_c05'],
      ['obj_ch6_tribunal', 'Lấy chìa khóa ở Thư Khố', 'solved_archon_tribunal'],
      ['obj_ch6_core', 'Khởi động Lõi Máy', 'activated_genesis_core'],
    ],
    'quest_ch6_the_unwritten_path',
  ),
  q(
    'quest_ch6_the_unwritten_path',
    'Con Đường Vô Danh',
    'Đại Điện chỉ mở cho kẻ biết viết đúng chính mình.',
    'main',
    [
      ['obj_ch6_bells', 'Đánh thức Thánh Điện Chuông Câm', 'solved_chime_bell'],
      ['obj_ch6_orrery', 'Đi vào lõi Đài Thiên Cầu', 'solved_orrery'],
      ['obj_ch6_threshold', 'Mở Cổng Ngưỡng', 'opened_threshold_gate'],
    ],
    'quest_ch6_empty_throne',
  ),
  q(
    'quest_ch6_empty_throne',
    'Ngai Vàng Trống Rỗng',
    'Ngai của Chronos nằm cuối con đường. Có thứ gì đó vẫn canh giữ nó.',
    'main',
    [
      ['obj_ch6_deacon', 'Vượt qua Tàn Ảnh Chấp Sự', 'defeated_remnant_deacon'],
      ['obj_ch6_warden', 'Hạ Thực Thể Giám Hộ', 'defeated_genesis_warden'],
    ],
    'quest_ch6_abyss_awakening',
  ),
  q(
    'quest_ch6_abyss_awakening',
    'Vực Thẳm Thức Giấc',
    'Dư ảnh Chronos nói Peter vừa mở thứ Ngài đã khóa.',
    'main',
    [['obj_ch6_abyss', 'Tới Vực Thẳm Hư Không', 'witnessed_ch6_cliffhanger']],
  ),
  q(
    'quest_ch6_solon_atonement',
    'Sự Sám Hối Của Solon',
    'Archon Solon từng đóng dấu lệnh trục xuất các thế giới. Ông muốn tìm lại bản sớ can ngăn đã bị xé.',
    'side',
    [['obj_ch6_solon', 'Mang bản sớ về cho Solon', 'resolved_solon_guilt']],
  ),
  q(
    'quest_ch6_mute_melody',
    'Khúc Ca Chuông Câm',
    'Quả chuông thứ năm của Thánh Điện bị nứt. Ba giọt dầu thạch anh có thể làm nó ngân lại.',
    'side',
    [['obj_ch6_bell', 'Đánh bóng và gõ lại quả chuông nứt', 'restored_chime_bell']],
  ),
  q(
    'quest_ch6_lost_constellation',
    'Chòm Sao Đã Mất',
    'Một chòm sao đã bị xóa khỏi bầu trời. Bàn cờ thiên thể có thể đặt nó trở lại.',
    'side',
    [['obj_ch6_chess', 'Giải bàn cờ thiên thể', 'aligned_celestial_chess']],
  ),
];
quests.quests = quests.quests.filter((x) => !x.id.startsWith('quest_ch6_')).concat(CH6_QUESTS);
const unbornKing = quests.quests.find((x) => x.id === 'quest_ch5_unborn_king');
if (unbornKing) unbornKing.followUpQuestId = 'quest_ch6_celestial_ascent';

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
const keyItem = (id, name, description) => ({
  id,
  name,
  type: 'key_item',
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
const CH6_ITEMS = [
  doc(
    'parchment_great_fracture',
    'Cuộn Da Vụ Phân Tách',
    'Ghi chép về ngày quyền năng bị bẻ gãy.',
    [
      'Ngày ấy Ngài đặt hai cực ở hai đầu ranh giới. Một bên quyết điều gì được bắt đầu, một bên quyết điều gì phải kết thúc.',
      'Nơi hai cực va vào nhau để lại một kẽ nứt. Thứ rơi ra từ kẽ nứt ấy không thuộc về quyền năng nào.',
    ],
  ),
  doc(
    'celestial_mechanic_handbook',
    'Sổ Tay Kỹ Sư Trụ Trời',
    'Sổ tay vận hành Lõi Máy Khởi Nguyên.',
    [
      'Ba bánh răng: nhỏ 12 răng, vừa 18 răng, lớn 36 răng. Mỗi cần có ba nấc: I, II, III (vòng mỗi nhịp).',
      'Máy chỉ chạy êm khi trong một nhịp, cả ba bánh quét qua cùng một số răng.',
      'Ghi chú cuối: chốt điều áp nằm trên lưng người canh giữ. Rút nó ra lúc hắn tụ lực, năng lượng sẽ dội ngược.',
    ],
  ),
  doc('chronos_private_scrap', 'Mảnh Giấy Riêng Của Chronos', 'Nét chữ run, viết vội.', [
    'Đêm trước ngày ta tự bẻ mình, ta xoay đĩa sao để Sao Bắc Cực nằm đối diện chòm Bọ Cạp. Ở đó ta cất thứ cuối cùng còn là của ta.',
  ]),
  doc('solon_torn_plea', 'Bản Sớ Xé Rách Của Solon', 'Tờ sớ bị xé đôi, góc có vết son đỏ.', [
    'Đừng tỉa những thế giới đang khóc. Hãy dạy chúng cách tự lành. — Archon Solon',
  ]),
  doc(
    'world_secret_fracture',
    'Bí Mật I: Bích Họa Phân Tách',
    'Tấm bích họa nhỏ trong rương của Chronos.',
    [
      'Chronos dùng chính thanh kiếm của mình chém đôi khối ngọc quyền năng. Từ vết nứt, một tia sáng màu thiên thanh rơi xuống trần gian.',
    ],
  ),
  doc(
    'world_secret_first_pruner',
    'Bí Mật II: Nhật Ký Kẻ Tỉa Cành Đầu Tiên',
    'Cuốn nhật ký giấu sau một viên gạch.',
    [
      'Ngài không muốn tỉa. Ngài bảo đó là cách ly. Những nhánh bị thứ trong khoảng đen chạm vào phải bị cắt trước khi nó lan sang nhánh khác.',
      'Nhưng ta đã tỉa cả những nhánh chưa bị chạm. Vì sợ. Ta xin lỗi.',
    ],
  ),
  doc('world_secret_null_hour', 'Bí Mật III: Bản Đồ Giờ Thứ 25', 'Bản đồ sao khắc trên kim loại.', [
    'Các dòng thời gian được vẽ như những đường cong hội tụ về một điểm, ngày càng nhanh. Điểm đó ghi: "Giờ Thứ 25".',
  ]),
  doc(
    'world_secret_first_forgotten',
    'Bí Mật IV: Người Từng Ngồi Cạnh Ngai',
    'Chép lại từ một tấm bia tưởng niệm không tên.',
    [
      'Người từng ngồi cạnh ngai. Người là ánh sáng đầu tiên, có trước cả các bánh răng.',
      'Rồi tên người bị chính trời xóa đi. Không ai còn được gọi tên ấy nữa.',
    ],
  ),
  keyItem(
    'archon_library_key',
    'Chìa Đồng Xanh Của Thư Khố',
    'Chìa khóa Archon Vane trao cho kẻ phán xử đúng.',
  ),
  keyItem(
    'genesis_core_shard',
    'Mảnh Lõi Khởi Nguyên',
    'Mảnh lõi sáng rơi ra khi Lõi Máy quay lại.',
  ),
  keyItem(
    'genesis_regulator_pin',
    'Chốt Khởi Nguyên',
    'Cái chốt vàng rút ra từ lưng Thực Thể Giám Hộ.',
  ),
  keyItem('origin_seal_half', 'Nửa Ấn Origin', 'Một nửa Ấn Origin đã vỡ. Nửa kia chìm xuống vực.'),
  puzzle(
    'quartz_oil_gallery',
    'Giọt Dầu Thạch Anh (Phòng Tranh)',
    'Dầu đông lại như hổ phách, dùng để đánh bóng chuông.',
  ),
  puzzle(
    'quartz_oil_core',
    'Giọt Dầu Thạch Anh (Lõi Máy)',
    'Dầu đông lại như hổ phách, dùng để đánh bóng chuông.',
  ),
  puzzle(
    'quartz_oil_bell',
    'Giọt Dầu Thạch Anh (Thánh Điện)',
    'Dầu đông lại như hổ phách, dùng để đánh bóng chuông.',
  ),
  {
    id: 'celestial_nectar_flask',
    name: 'Bình Mật Trời',
    type: 'consumable',
    description: 'Mật ong của những bông hoa không bao giờ tàn. Hồi 150 HP và 60 MP.',
    value: 0,
    stackable: true,
    maxStack: 20,
    effects: { healAmount: 150, mpAmount: 60 },
  },
  gear(
    'origin_astral_blade',
    'Kiếm Tinh Tú Khởi Nguyên',
    'weapon',
    'Thanh kiếm người thợ rèn trên trời rèn từ bụi sao.',
    {
      attack: 18,
      reach: 44,
      swingMs: 320,
    },
  ),
  gear(
    'broken_herald_feather',
    'Lông Vũ Sứ Giả',
    'charm',
    'Một chiếc lông kim loại rơi từ cánh Sứ Giả.',
    {
      maxMp: 20,
      speed: 3,
    },
  ),
  gear('celestial_amber_shard', 'Hổ Phách Thiên Giới', 'charm', 'Kết tinh nơi hai cực gặp nhau.', {
    maxMp: 20,
    defense: 3,
  }),
  gear(
    'echoing_origin_bell',
    'Chuông Ngân Khởi Nguyên',
    'charm',
    'Chiếc chuông con rơi ra từ quả chuông đã lành.',
    {
      maxMp: 25,
      defense: 5,
    },
  ),
  gear(
    'solon_mercy_clasp',
    'Móc Cài Từ Bi Của Solon',
    'charm',
    'Kỷ vật của một Archon đã sám hối.',
    {
      maxHp: 30,
      defense: 5,
    },
  ),
  gear(
    'seal_of_the_first_hour',
    'Ấn Chương Giờ Ban Sơ',
    'charm',
    'Thứ cuối cùng Chronos cất giữ cho riêng mình.',
    {
      maxHp: 35,
      defense: 6,
    },
  ),
  gear(
    'null_origin_insignia',
    'Phù Hiệu Hư Không',
    'charm',
    'Phù hiệu đen để lại từ tiếng vọng của Kẻ Bị Quên.',
    {
      maxHp: 40,
      maxMp: 25,
      attack: 4,
      defense: 6,
      speed: 3,
    },
  ),
  gear(
    'bran_count_token',
    'Thẻ Số 1.427',
    'charm',
    'Con số Peter khắc cho những người lính không tên.',
    {
      maxHp: 20,
      attack: 2,
    },
  ),
];
const ids = new Set(CH6_ITEMS.map((i) => i.id));
items.items = items.items.filter((i) => !ids.has(i.id)).concat(CH6_ITEMS);

write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/quests.json', quests);
write('public/assets/data/items.json', items);
console.log(
  'ch6 content:',
  Object.keys(D).filter((k) => k.startsWith('ch6_')).length,
  'nodes,',
  CH6_QUESTS.length,
  'quests,',
  CH6_ITEMS.length,
  'items',
);
