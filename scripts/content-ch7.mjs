/**
 * Chapter 7 "The Cradle of the Forgotten" content (docs/story/CHAPTER_07_DESIGN.md with §18 review
 * and §19 owner decisions): dialogue nodes, quests and items. Written by Claude. Idempotent:
 * re-running replaces every ch7_ node / quest / item it defines.
 *
 * Usage: node scripts/content-ch7.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const dlg = read('public/assets/data/dialogue.json');
const quests = read('public/assets/data/quests.json');
const items = read('public/assets/data/items.json');
const D = dlg.dialogues;
for (const k of Object.keys(D)) if (k.startsWith('ch7_')) delete D[k];

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
const take = (id, lines, itemId, more = {}) =>
  P(id, lines, { effects: grant(itemId, 1, `took_${itemId}`, more) });
const MOTHER = 'Bà Mai';
const SHADE = 'Dư Ảnh Vô Danh';

// ================================================================== Act 1 — 1. Ash abyss drop
P(
  'ch7_arrival',
  [
    'Rơi. Rơi mãi. Rồi một mặt kính lạnh ngắt dưới lưng.',
    'Tro thủy tinh, lấp lánh tím. Trên đầu không có trời, chỉ có những sợi xích vàng chăng ngang bóng tối.',
    'Kuro... Kuro bị hất về phía kia. Mình phải tìm nó.',
  ],
  {
    effects: {
      setFlags: ['kuro_left', 'ch7_fell'],
      clearFlags: ['kuro_with_peter'],
      startQuest: 'quest_ch7_faded_shore',
    },
  },
);
P('ch7_watch', [
  'Chiếc đồng hồ quả quýt văng ra khỏi túi, mặt kính nứt.',
  'Kim giờ dừng ở số 8. Đúng lúc mình rơi xuống đây.',
]);
P(
  'ch7_seal_glow',
  [
    'Nửa Ấn Origin trong tay ấm lên. Mình nghe nó thì thầm, không phải bằng chữ, mà bằng những cái tên.',
    'Ở đây người ta không chết. Họ chỉ bị quên. Và thứ này... có thể gọi họ trở lại.',
  ],
  { effects: { setFlags: ['ch7_learned_naming'] } },
);
P('ch7_drop_exit_note', ['Phía đông có ánh sáng mờ, như ánh trăng trên cát.']);

// ================================================================== 2. Faded shore (C01)
P('ch7_shore_arrival', [
  'Cát. Cát Khánh Hòa, mình nhận ra ngay. Nhưng nó đã phai hết màu, như một tấm ảnh để ngoài nắng quá lâu.',
  'Giữa bờ là một vực hư không. Có ai đó đứng ở đầu cây cầu đã sập.',
]);
N('ch7_keeper_shade', SHADE, [
  '...Qua cầu à? Cầu... sập lâu rồi. Tôi gác nó... tôi là ai nhỉ...',
  '(Gương mặt người ấy trống trơn, như một trang giấy chưa ai viết.)',
]);
P('ch7_naming_intro', [
  'Cạnh người gác cầu có một Bàn Thờ Tên, ba khe chữ. Nửa ấn trong tay rung lên.',
  'Nếu gọi đúng tên, có lẽ ông ấy sẽ nhớ ra mình là ai. Và cây cầu cũng vậy.',
]);
take(
  'ch7_tag_take',
  ['Trên cát có một tấm thẻ bài thu phí gãy đôi, chữ đã mòn gần hết.'],
  'bridge_toll_tag',
);
N('ch7_fisherman', 'Ngư Dân Hóa Đá', [
  'Lão gác cầu hả... hiền như đất. Tên lão ngắn lắm, ba chữ cái thôi.',
  'Tụi nhỏ trong xóm gọi lão bằng đúng cái tiếng các em vẫn gọi người lớn tuổi hơn mình.',
]);
P('ch7_c01_empty', ['Bàn thờ còn trống khe chữ.']);
N('ch7_c01_wrong', SHADE, ['(Người gác cầu khẽ lắc đầu.) Tôi không phải là người đó...']);
N(
  'ch7_c01_right',
  'Ông Anh',
  [
    'Anh... Anh. Phải rồi. Tụi nhỏ gọi tôi là "ông Anh". Tôi gác cây cầu này bốn mươi năm.',
    '(Gương mặt ông hiện ra, nếp nhăn hiền hậu. Dưới chân ông, những con chữ vàng nối lại thành cầu.)',
    'Cảm ơn cháu. Bên kia là xóm chài. Nhà nào cũng còn đó, chỉ là không ai nhớ.',
  ],
  { effects: { setFlags: ['restored_bridge_keeper'] } },
);
N('ch7_c01_done', 'Ông Anh', ['Cầu vững rồi. Đi đi cháu, cẩn thận mấy con bướm trắng.']);
P('ch7_shore_exit_locked', ['Vực hư không chắn ngang. Phải có cầu mới qua được.']);

// ================================================================== 3. Erased hamlet (C02)
P('ch7_hamlet_arrival', [
  'Xóm chài bị xóa. Những ngôi nhà chỉ còn là đường viền tím, như ai đó vẽ bằng phấn rồi quên tô.',
  'Căn nhà giữa xóm có ba khung cửa sổ, mỗi khung một hốc đặt đèn.',
]);
P('ch7_family_table', [
  'Trên chiếc bàn gãy có ba cái bát. Bát vẽ sóng biển, bát vẽ bông lúa, bát vẽ con thuyền giấy.',
  'Ba thế hệ ăn chung một mâm.',
]);
P('ch7_hamlet_custom', [
  "Bia đầu làng: 'Ở xóm này, người già cả đời gối đầu lên sóng biển. Người cha nhuộm áo màu rơm ruộng cát.'",
  "'Còn con trẻ thì lòng như trang giấy, chưa ai viết gì lên.'",
]);
P('ch7_window_scratches', [
  'Bậu cửa sổ đầu khắc hình mỏ neo. Bậu giữa khắc bó lúa. Bậu cuối còn dán một chiếc chong chóng.',
]);
P('ch7_c02_empty', ['Vẫn còn cửa sổ chưa có đèn.']);
P('ch7_c02_wrong', ['Ánh đèn chớp tắt rồi tắt hẳn. Ngọn đèn kỷ vật bị đặt nhầm thế hệ.']);
P(
  'ch7_c02_right',
  [
    'Đèn lam cho ông, đèn vàng cho cha, đèn trắng cho đứa con.',
    'Căn nhà viền tím ấm lên như có người vừa nhóm bếp. Cánh cửa phía bắc kẽo kẹt mở.',
  ],
  { effects: { setFlags: ['opened_erased_hamlet_gate'], refreshMap: true } },
);
P('ch7_c02_done', ['Ba ngọn đèn vẫn cháy đều.']);
take(
  'ch7_secret1_take',
  [
    'Sau căn nhà có một mảnh giấy trắng tinh, mép bị xé. Chạm vào, mình thấy như chạm vào chính mình.',
  ],
  'world_secret_torn_origin_scroll',
);
P('ch7_hamlet_exit_locked', ['Cửa phía bắc khóa. Có lẽ phải đánh thức căn nhà giữa xóm.']);

// ================================================================== 4. Cradle sanctuary (C03)
P('ch7_cradle_arrival', [
  'Một thánh điện nhỏ. Giữa điện là chiếc nôi gỗ trống, đung đưa dù không có gió.',
  'Bên nôi có một người phụ nữ mặc áo bà ba xanh nhạt, vừa đưa nôi vừa ngân nga.',
]);
N(
  'ch7_mother_first',
  'Người Phụ Nữ',
  [
    'Cháu... có quen một đứa bé tóc đen thẳng, hay chạy ra mỏm đá ngắm thuyền không?',
    'Nó đi đâu lâu quá chưa về ăn cơm. Tôi... tôi không nhớ tên nó. Tôi cũng không nhớ tên mình.',
    '(Bà ngân nga một giai điệu. Mình biết bài này. "Chiều Trên Bến Cũ".)',
  ],
  { effects: { setFlags: ['met_kuro_mother'], startQuest: 'quest_ch7_erased_lullaby' } },
);
N('ch7_mother_waiting', 'Người Phụ Nữ', [
  'Cha nó bảo tên tôi là tên một loài hoa, nở đúng mùa xuân trên vách đá...',
  '(Bà chạm vào chiếc kẹp tóc vàng hình bông mai năm cánh.)',
]);
P('ch7_embroidery', [
  'Mép nôi có một dòng chỉ đỏ thêu dở, bị mực ăn mất một nửa:',
  "'Tr... Thị ... ru con ngủ say.'",
]);
P('ch7_c03_empty', ['Bàn thờ còn trống chỗ.']);
N('ch7_c03_wrong', 'Người Phụ Nữ', [
  '(Bà ôm ngực, khẽ lắc đầu.) Không phải... đó không phải tên tôi...',
]);
N(
  'ch7_c03_right',
  MOTHER,
  [
    'Trần Thị Mai. Mai...',
    '(Gương mặt bà sáng lên. Đôi mắt mờ đục trong trở lại.)',
    'Thằng bé tên Kuro. Là tên cha nó đặt, cái tên lạ hoắc, cả xóm cười. Nó là con tôi.',
  ],
  {
    effects: grant('kuro_mother_brooch', 1, 'took_kuro_mother_brooch', {
      setFlags: ['restored_kuro_mother_name'],
      refreshMap: true,
    }),
    responses: [to('…', 'ch7_fb_mother')],
  },
);
FB('ch7_fb_mother', 'Ký Ức Mờ', [
  'Một gian bếp dột ven biển. Mưa bão đập vào mái tôn.',
  "Người mẹ gắp con cá nướng duy nhất vào bát đứa bé tóc đen: 'Ăn đi con, mai bão tan mẹ lại ra bến chờ thuyền về.'",
  'Đứa bé cúi đầu, nhai cơm lẫn nước mắt.',
]);
N(
  'ch7_mother_restored',
  MOTHER,
  [
    'Cháu muốn nghe bài hát ru của tôi à? Nó đi theo đường thằng Kuro chạy mỗi chiều:',
    "'Chiều về ra bến đợi thuyền, qua gốc bàng gãy ven triền đá xanh.'",
    "'Ghé giếng cạn múc nước lành, rồi theo ngọn đèn đầu ghềnh mà về.'",
  ],
  { effects: { setFlags: ['ch7_lullaby_heard'] } },
);
N(
  'ch7_mother_hairpin',
  MOTHER,
  [
    'Chiếc kẹp tóc của tôi! Tôi tưởng mất nó từ cái hôm hư không ăn mất lá thư.',
    'Cháu giữ lấy đi. Coi như tôi gửi cháu, để nhớ đường mà dắt thằng Kuro về.',
  ],
  { effects: { setFlags: ['returned_mother_hairpin'] } },
);
take(
  'ch7_secret2_take',
  ['Dưới gầm nôi có một phong thư cũ, nét chữ của người mẹ.'],
  'world_secret_mother_letter',
);
P('ch7_cradle_letter_thought', [
  'Peter ở nhánh Alpha đã buông kéo để ôm con gái. Còn bà Mai thì ngồi đây đưa một chiếc nôi trống.',
  'Có những người cha mẹ chờ, dù chẳng còn biết mình đang chờ ai.',
]);
P('ch7_cradle_refused_thought', [
  'Mình kể cho bà nghe về mùi dầu máy và gỗ thông trong tiệm đồng hồ một sáng mưa.',
  'Bà cười. Lần đầu tiên bà thôi run vì lạnh.',
]);
P('ch7_cradle_exit_locked', ['Lối phía tây chìm trong sương. Bà ấy chưa nhớ ra mình là ai.']);

// ================================================================== 5. Echo well (C04)
P('ch7_well_arrival', [
  'Giếng Vọng. Miệng giếng sâu hun hút, thỉnh thoảng có tiếng thì thầm vọng lên những cái tên không trọn.',
  'Quanh giếng có ba phễu đá: trầm, trung, bổng.',
]);
P('ch7_well_inscription', [
  "Văn bia thành giếng: 'Nốt càng trầm, sỏi càng phải nặng.'",
  "'Sỏi nào nuốt mất tiếng thì đừng thả, nó chỉ làm giếng nghẹn.'",
]);
P('ch7_pebble_quartz', ['Sỏi Thạch Anh: trong như sương, cầm gần như không thấy nặng.']);
P('ch7_pebble_iron', ['Sỏi Quặng Sắt: xù xì, nằm trĩu trong lòng bàn tay.']);
P('ch7_pebble_star', ['Sỏi Đá Sao: lấp lánh, lơ lửng hơi nhích lên khỏi tay.']);
P('ch7_pebble_void', ['Sỏi Hư Vô: đen kịt, cầm lên thì mọi âm thanh quanh tay như bị hút mất.']);
P('ch7_pebble_note', [
  "Ghi chép của người thợ giếng: 'Đá Sao nặng hơn Thạch Anh nhưng nhẹ hơn Quặng Sắt.'",
  "'Sỏi Hư Vô nặng nhất, nhưng nó nuốt hết tiếng.'",
]);
P('ch7_c04_empty', ['Vẫn còn phễu chưa có sỏi.']);
P('ch7_c04_wrong', [
  'Giếng phát ra tiếng ùng ục đục ngầu, mực tím dâng lên mép. Hợp âm lệch phách.',
]);
P(
  'ch7_c04_right',
  [
    'Trầm, trung, bổng. Ba hòn sỏi rơi chạm đáy, ngân thành một hợp âm.',
    'Mực rút xuống. Đáy giếng lộ ra bậc thang đá dẫn về phía nam.',
  ],
  { effects: { setFlags: ['balanced_echo_well'] } },
);
P('ch7_c04_done', ['Giếng đã lặng.']);
P('ch7_well_exit_locked', ['Lối phía nam ngập mực.']);

// ================================================================== 6. Stranded fleet (C05)
P(
  'ch7_fleet_arrival',
  [
    'Bến Thuyền Mắc Cạn. Ba con thuyền nằm nghiêng trên cát tro, mỗi con một màu buồm: đỏ, trắng, nâu.',
    'Ba dư ảnh thủy thủ đứng cạnh ba con thuyền. Một trong số họ là thuyền trưởng, người giữ hải đồ.',
  ],
  { effects: { startQuest: 'quest_ch7_echoes_of_the_fleet' } },
);
N('ch7_sailor_a', 'Thủy Thủ A', [
  'Thuyền trưởng? Hỏi mấy đứa kia đi. À mà thằng B ấy, nó chưa từng đặt chân tới Cam Ranh đâu.',
]);
N('ch7_sailor_b', 'Thủy Thủ B', ['...Biển ở đâu rồi. Tôi chỉ nhớ mùi gió.']);
N('ch7_sailor_c', 'Thủy Thủ C', ['Đừng hỏi tôi. Tôi chỉ nhớ có đúng quê nhà.']);
P('ch7_tag_c', ['Thẻ bài trên cổ thủy thủ C: "Người Ninh Hòa".']);
P('ch7_paint_c', [
  'Mạn thuyền cạnh thủy thủ C có dòng chữ quét sơn: "Buồm nâu không phải của người Ninh Hòa."',
]);
P('ch7_harbor_ledger', [
  "Sổ bến: 'Thuyền buồm trắng: chủ là dân Cam Ranh.'",
  'Phần còn lại bị mực ăn mất.',
]);
P('ch7_logbook', ["Nhật ký hàng hải: 'Thuyền trưởng luôn lái chiếc buồm nâu.'"]);
P('ch7_chronicle_page', [
  'Mình chợt nhớ cuốn Chính Sử ở Thư Khố trên trời. Có một trang ghi: "Chủ thuyền buồm trắng sinh ra ở Cam Ranh."',
  'Khớp với sổ bến.',
]);
P('ch7_c05_empty', ['Chưa chỉ định ai.']);
P('ch7_c05_wrong', ['Ba dư ảnh tan thành khói rồi hiện lại. Hải đồ vẫn bị giấu kín.']);
N(
  'ch7_c05_right',
  'Thuyền Trưởng',
  [
    'Người Nha Trang, lái buồm nâu. Đúng là tôi. Bao năm rồi mới có người nhận ra.',
    '(Thủy thủ B trao cho Peter một tấm hải đồ vẽ biển hư không.)',
  ],
  {
    effects: grant('void_sea_chart', 1, 'took_void_sea_chart', {
      setFlags: ['solved_stranded_fleet'],
    }),
  },
);
P('ch7_c05_done', ['Thuyền trưởng gật đầu chào.']);
take(
  'ch7_secret3_take',
  ['Trong khoang lái có một tấm da cũ, ghi lời giao ước của hai vị thần.'],
  'world_secret_twin_gods_pact',
);
const compass = (n) =>
  P(`ch7_compass_take_${n}`, ['Kẹt trong khe ván là một mảnh la bàn vỡ.'], {
    effects: grant(`compass_shard_${n}`, 1, `took_compass_shard_${n}`, {
      startQuest: 'quest_ch7_lost_compass',
    }),
  });
[1, 2, 3].forEach(compass);
P('ch7_compass_need', ['Một chiếc la bàn thiếu mảnh. Kim không quay.']);
N(
  'ch7_compass_place',
  'Thủy Thủ Mù',
  [
    '(Peter ghép ba mảnh, đặt lên nóc thuyền buồm nâu. Kim la bàn quay tít rồi đứng yên.)',
    'Nó chỉ về bến cũ... Cảm ơn cậu. Giờ tôi mù cũng biết đường về.',
  ],
  {
    effects: {
      takeItems: [
        { itemId: 'compass_shard_1', quantity: 1 },
        { itemId: 'compass_shard_2', quantity: 1 },
        { itemId: 'compass_shard_3', quantity: 1 },
      ],
      ...grant('void_nectar_flask', 2, 'took_compass_reward', {
        setFlags: ['calibrated_blind_compass'],
      }),
    },
  },
);
P('ch7_compass_done', ['Kim la bàn vẫn chỉ về bến cũ.']);
P('ch7_fleet_exit_locked', ['Cửa khoang phía đông khóa. Cần hải đồ.']);

// ================================================================== 7. Clock graveyard (C06)
P('ch7_clocks_arrival', [
  'Nghĩa Địa Đồng Hồ. Hàng trăm mặt đồng hồ vỡ chìm trong tro. Giữa nghĩa địa là một mặt đồng hồ đá lớn, mất hết kim.',
  'Phía bắc là một đầm tro chắn lối.',
]);
P('ch7_clock_note', [
  "Ghi chú thợ đồng hồ: 'Ở đáy vực, giờ không chạy liền. Nó nhảy ba khắc mỗi góc, theo chiều kim.'",
  "'Giờ bắt đầu là giờ ngươi rơi xuống. Quá mười hai thì vòng lại từ đầu.'",
]);
P('ch7_clock_fissure', ['Vết nứt lớn nhất chạy từ góc 12 giờ. Góc 12 là chỗ bắt đầu.']);
P('ch7_c06_empty', ['Vẫn còn góc chưa gắn kim.']);
P('ch7_c06_wrong', ['Bánh răng bên dưới rít lên kèn kẹt. Trục giờ không đồng điệu.']);
P(
  'ch7_c06_right',
  [
    'Tám, mười một, hai, năm. Mặt đồng hồ quay một vòng trọn.',
    'Đầm tro phía bắc rút cạn như nước triều xuống.',
  ],
  { effects: { setFlags: ['solved_clock_graveyard'] } },
);
P('ch7_c06_done', ['Mặt đồng hồ đá chạy đều.']);
take(
  'ch7_secret4_take',
  ['Dưới một bia mộ có bản vẽ cơ khí một chiếc đồng hồ khổng lồ, nhiều chỗ bị xé.'],
  'world_secret_null_hour_blueprint',
);
P('ch7_clocks_exit_locked', ['Đầm tro chắn lối phía bắc.']);

// ================================================================== 8. Weeper crossing (mid-boss)
P('ch7_weeper_arrival', [
  'Hành Lang Than Khóc. Hai vách đá chảy mực tím. Ở giữa hành lang, một khối đá ba khuôn mặt đang khóc.',
]);
N('ch7_weeper_confront', 'Kẻ Khóc Không Tên', [
  'Không ai nhớ... không ai gọi... nước mắt cứ rơi mà không ai lau...',
  'Ngươi định đi qua? Hãy đứng trong bể nước mắt của ta mà xem.',
]);
N(
  'ch7_weeper_defeated',
  'Kẻ Khóc Không Tên',
  ['Có người... đã lau giúp ta...', '(Ba khuôn mặt khép mắt. Vách mực bên trái nứt ra một khe.)'],
  {
    effects: { setFlags: ['defeated_nameless_weeper'] },
    responses: [to('…', 'ch7_fb_chains')],
  },
);
FB('ch7_fb_chains', 'Ký Ức Của Ngai Vàng', [
  'Một vết nứt khổng lồ xé ngang trời. Một bóng người tỏa sáng dang tay ôm lấy vết nứt.',
  "'Hãy xích ta lại, Chronos. Xóa tên ta đi. Nếu không, cõi này sẽ bị nuốt.'",
  'Chronos cắn răng. Sợi xích chữ vàng đầu tiên rơi xuống.',
]);
P('ch7_crack_closed', ['Vách mực chảy dày. Không thấy lối.']);
P('ch7_crack_open', ['Sau khe nứt là một bậc đá dẫn xuống. Có tiếng đục đá lách cách.'], {
  effects: {
    startQuest: 'quest_ch7_first_mason',
    warpTo: { mapId: 'map_ch7_first_mason_tomb', spawnId: 'default' },
  },
});
P('ch7_weeper_exit_locked', ['Kẻ Khóc Không Tên chắn lối.']);

// ================================================================== 9. First mason's tomb (hidden A, C11)
P('ch7_tomb_arrival', [
  'Mộ Người Khắc Bia Đầu Tiên. Bốn phiến đá chưa khắc xếp hàng trên bệ, trước mỗi phiến là một giá đục.',
]);
P('ch7_mason_rules', [
  "Văn bia: 'Đá mềm thì đục đồng. Đá xếp lớp thì đục thép. Đá trời thì đục kim cương. Đá hư không thì đục hư vô.'",
]);
P('ch7_stone_1', ['Phiến thứ nhất: lấp lánh như có bụi sao rơi trong lòng.']);
P('ch7_stone_2', ['Phiến thứ hai: đá vôi mềm, sờ tay cũng vỡ vụn.']);
P('ch7_stone_3', ['Phiến thứ ba: đen kịt, ánh sáng chạm vào như bị hút mất.']);
P('ch7_stone_4', ['Phiến thứ tư: nhiều lớp chồng lên nhau như trang sách.']);
P('ch7_c11_empty', ['Vẫn còn phiến chưa có đục.']);
P('ch7_c11_wrong', ['Lưỡi đục trượt trên mặt đá, tóe lửa. Sai chất đá.']);
P(
  'ch7_c11_right',
  [
    'Bốn mũi đục cùng ăn vào đá. Trên bốn phiến hiện lên bốn cái tên đã bị quên, rồi cả tên người thợ khắc.',
    'Hòm đá dưới chân bia mở ra. Bên trong là một thanh kiếm đúc từ tro thủy tinh.',
  ],
  {
    effects: grant('void_severance_blade', 1, 'took_void_severance_blade', {
      setFlags: ['honored_first_mason'],
    }),
  },
);
P('ch7_c11_done', ['Bốn phiến đá đã có tên.']);
N('ch7_smith_ghost', 'Người Thợ Rèn', [
  'Lại gặp nhau rồi, đứa trẻ không tên. Lưỡi kiếm gãy của cậu vẫn chưa lành, nhưng cậu đã gọi được bao nhiêu cái tên.',
  'Cứ giữ nó. Đến lúc nó lành, ta sẽ biết.',
]);
P('ch7_tomb_back', ['Quay lên Hành Lang Than Khóc.'], {
  effects: { warpTo: { mapId: 'map_ch7_weeper_crossing', spawnId: 'from_tomb' } },
});

// ================================================================== Act 3 — 10. Blank archives (C07)
P('ch7_archives_arrival', [
  'Thư Khố Giấy Trắng. Kệ nào cũng đầy sách, nhưng trang nào cũng trắng tinh.',
  'Bốn ngăn kệ trước mặt đang trống. Trên sàn rơi bốn cuộn giấy, mỗi cuộn một mùi.',
]);
P('ch7_scroll_a', ['Cuộn giấy này thoảng mùi tro nhẹ.']);
P('ch7_scroll_b', ['Cuộn giấy này thơm mùi hoa cúc.']);
P('ch7_scroll_c', ['Cuộn giấy này nồng mùi quặng sắt.']);
P('ch7_scroll_d', ['Cuộn giấy này có mùi lạnh như đá sao.']);
P('ch7_scent_legend', [
  "Bảng mùi ký ức: 'Mùi tro là giấc mơ. Mùi hoa cúc là mái nhà. Mùi quặng sắt là đôi tay lao động.'",
  "'Mùi đá sao là ký ức về các đấng sáng tạo.'",
]);
take(
  'ch7_memo_take',
  ['Một tờ ghi chép kẹp ở ngăn đầu, nét chữ của thủ thư.'],
  'librarian_ghost_memo',
);
P('ch7_c07_empty', ['Vẫn còn ngăn trống.']);
P('ch7_c07_wrong', ['Giấy bốc khói trắng mờ. Ký ức bị xếp lộn xộn.']);
P(
  'ch7_c07_right',
  [
    'Giấc mơ, mái nhà, đôi tay, rồi đấng sáng tạo. Bốn cuộn giấy hiện chữ vàng.',
    'Một trang mở ra thành lối đi về phía đông. Dưới ngăn cuối có một chiếc chìa khóa trắng.',
  ],
  { effects: { setFlags: ['solved_blank_archives'], refreshMap: true } },
);
P('ch7_c07_done', ['Bốn cuộn giấy đã có chữ.']);
take('ch7_key_take', ['Chiếc chìa khóa trắng, khắc hình một quả chuông nhỏ.'], 'white_crypt_key');
N(
  'ch7_solon_ghost',
  'Archon Solon',
  [
    'Kẻ phán xử đúng. Ta không còn đóng dấu nữa, giờ ta thắp đèn cho những kẻ bị quên.',
    'Cầm lấy, đường dưới này còn dài.',
  ],
  { effects: grant('void_nectar_flask', 1, 'took_solon_flask') },
);
P('ch7_archives_exit_locked', ['Kệ sách phía đông chắn lối.']);

// ================================================================== 11. Bang tree promontory (C08)
P('ch7_tree_arrival', [
  'Mỏm Đá Gốc Bàng. Gốc bàng gãy trên mỏm đá nhìn ra một vùng biển không có nước.',
  'Dưới gốc có một chiếc hộp thiếc rỉ, khóa bằng ba vòng số.',
]);
take(
  'ch7_diary_take',
  ['Trong túi áo, Peter tìm thấy một trang nhật ký cũ, mép đã sờn.'],
  'peter_torn_diary_page',
);
P('ch7_promise_recall', [
  'Mười bốn tuổi. Mỏm đá, cây bàng gãy, ổ bánh mì bẻ đôi. Mình nhớ rõ như mới hôm qua.',
]);
P('ch7_c08_empty', ['Hộp thiếc chưa chỉnh số.']);
P('ch7_c08_wrong', ['Khóa thiếc kêu lạch cạch khô khốc. Ký ức về ngày hẹn vẫn còn lệch.']);
P(
  'ch7_c08_right',
  [
    'Rằm tháng bảy, năm mười bốn tuổi. Chiếc hộp bật mở.',
    'Bên trong có chiếc dù rách hai đứa che chung, và một mảnh thép gỉ khắc nguệch ngoạc hai chữ P và K.',
  ],
  {
    effects: grant('childhood_pledge_shard', 1, 'took_childhood_pledge_shard', {
      setFlags: ['opened_childhood_pledge_box'],
    }),
    responses: [to('…', 'ch7_fb_clockmaker')],
  },
);
FB('ch7_fb_clockmaker', 'Ký Ức Mờ', [
  'Đêm mưa. Một ông thợ đồng hồ già đứng trên bãi cát, hai tay đỡ một tia sáng không màu.',
  'Ông cởi chiếc áo thợ, bọc nó lại. Tia sáng hóa thành một đứa bé. Ông đặt đứa bé vào chiếc nôi gỗ.',
  "'Trang giấy trắng à... Ừ thì ta viết cho con một cái tên.'",
]);
P('ch7_c08_done', ['Chiếc hộp thiếc đã mở.']);
take(
  'ch7_secret5_take',
  [
    'Trên rễ bàng có nét khắc vụng về: "Peter và Kuro — dù cả thế giới có quên tụi mình."',
    'Mình chép lại từng chữ.',
  ],
  'world_secret_childhood_carving',
);
P('ch7_tree_exit_locked', ['Lối xuống phía nam phủ sương dày.']);

// ================================================================== 12. Fog lullaby maze (C09)
P('ch7_maze_arrival', [
  'Mê Cung Sương. Sương tím dày đặc, chỉ thấy lờ mờ vài hình dáng: một chiếc thuyền, một gốc cây, một miệng giếng, một ngọn đèn.',
  'Đi bừa thì sương sẽ đẩy mình về chỗ cũ.',
]);
P('ch7_fog_ok_1', ['Bến thuyền. "Chiều về ra bến đợi thuyền..."'], {
  effects: { setFlags: ['ch7_fog_1'] },
});
P('ch7_fog_ok_2', ['Gốc bàng. "...qua gốc bàng gãy ven triền đá xanh."'], {
  effects: { setFlags: ['ch7_fog_2'] },
});
P('ch7_fog_ok_3', ['Giếng cạn. "Ghé giếng cạn múc nước lành..."'], {
  effects: { setFlags: ['ch7_fog_3'] },
});
P(
  'ch7_fog_ok_4',
  [
    'Ngọn đèn. "...rồi theo ngọn đèn đầu ghềnh mà về."',
    'Sương tan dần như có ai thổi. Mình hát trọn bài ru, giọng ai đó hát theo từ rất xa.',
  ],
  {
    effects: {
      setFlags: ['ch7_fog_4', 'solved_fog_maze', 'ch7_mother_song_remembered'],
      refreshMap: true,
    },
  },
);
P('ch7_fog_wrong', ['Sương cuộn lại, đẩy mình về chỗ cũ. Không phải đường bài hát ru đi.'], {
  effects: {
    clearFlags: ['ch7_fog_1', 'ch7_fog_2', 'ch7_fog_3'],
    warpTo: { mapId: 'map_ch7_fog_lullaby_maze', spawnId: 'from_tree' },
  },
});
P(
  'ch7_fog_refused_help',
  [
    'Mùi gỗ thông và mưa sớm trong tiệm đồng hồ... Ký ức đó còn nguyên, và nó dẫn mình ra bến thuyền trước tiên.',
  ],
  { effects: { setFlags: ['ch7_fog_1'] } },
);
P('ch7_crypt_locked', ['Một cánh cửa đá trắng, ổ khóa khắc hình quả chuông.']);
P('ch7_crypt_open', ['Chìa khóa trắng vừa khít. Cửa mở ra một hầm nhỏ, lặng như tờ.'], {
  effects: {
    startQuest: 'quest_ch7_mother_hairpin',
    warpTo: { mapId: 'map_ch7_white_bell_crypt', spawnId: 'default' },
  },
});
P('ch7_maze_exit_locked', ['Sương phía đông còn dày đặc.']);

// ================================================================== 13. White bell crypt (hidden B, C12)
P('ch7_crypt_arrival', [
  'Hầm chuông trắng. Trên bàn thờ có một lá thư, hư không đã ăn mất hết dấu chữ.',
]);
P('ch7_letter_read', [
  'Lá thư chỉ còn: "Me cho con o ben cu."',
  'Ba chữ quan trọng nhất đã mất dấu. Bên dưới có ba vòng xoay để điền lại.',
]);
P('ch7_c12_empty', ['Vẫn còn chữ chưa có dấu.']);
P('ch7_c12_wrong', ['Một dòng mực lại nuốt mất chữ. Câu này không phải lời người mẹ viết.']);
P(
  'ch7_c12_right',
  [
    '"Mẹ chờ con ở bến cũ."',
    'Lá thư sáng lên. Kẹp giữa hai trang là một chiếc kẹp tóc vàng hình bông mai.',
  ],
  { effects: grant('mother_golden_hairpin', 1, 'took_mother_golden_hairpin') },
);
P('ch7_c12_done', ['Lá thư đã đọc được trọn.']);
P('ch7_crypt_back', ['Quay về Mê Cung Sương.'], {
  effects: { warpTo: { mapId: 'map_ch7_fog_lullaby_maze', spawnId: 'from_crypt' } },
});

// ================================================================== 14. Chain cathedral
P('ch7_cathedral_arrival', [
  'Thánh Đường Xích Vàng. Những sợi xích chữ vàng to bằng thân cây giăng từ trần xuống.',
  'Ở giữa, một hình người khổng lồ quỳ gối, cổ tay bị xích.',
]);
const FF = 'Kẻ Bị Quên Đầu Tiên';
N(
  'ch7_forgotten_meet',
  FF,
  [
    'Đứa trẻ không tên. Ngươi mang nửa ấn của ta.',
    'Ta từng cùng Chronos giữ Origin, thuở chưa có bánh răng nào. Khi vết nứt mở, ta xin ngài xóa tên ta để làm nút chặn.',
  ],
  { responses: [to('Sao ngài lại tự nguyện?', 'ch7_forgotten_why')] },
);
N(
  'ch7_forgotten_meet_echo',
  FF,
  [
    'Ngươi đã thắng cái bóng của ta ở thượng giới. Giờ ngươi đến đây bằng xương bằng thịt.',
    'Ta từng cùng Chronos giữ Origin. Khi vết nứt mở, ta xin ngài xóa tên ta để làm nút chặn.',
  ],
  { responses: [to('Sao ngài lại tự nguyện?', 'ch7_forgotten_why')] },
);
N(
  'ch7_forgotten_why',
  FF,
  [
    'Kẻ xây nhà phải dọn đá. Chronos chọn bảo vệ những gì đang thở. Thân ngài hóa thành những sợi xích này, quấn quanh ta.',
    'Nhưng xích sắp đứt rồi. Bạn của ngươi ở hồ mực phía bắc, đang uống cạn hư không để cứu những kẻ bị quên.',
  ],
  { effects: { setFlags: ['communed_first_forgotten'] } },
);
N('ch7_forgotten_after', FF, ['Đi đi. Gọi tên cậu ấy trước khi hư không gọi thay.']);
P('ch7_cathedral_exit_locked', ['Xích vàng chắn lối phía bắc. Ngài ấy muốn nói chuyện trước.']);

// ================================================================== Act 4 — 15. Void fissure pass (elite)
P('ch7_pass_arrival', [
  'Đèo Khe Nứt. Một bóng áo choàng xích sắt đứng chắn giữa đèo, quyền trượng khắc chữ cổ.',
  'Khi nó giơ trượng, ba vòng xích sẽ rơi xuống. Chỗ ba vòng chồng lên nhau... có lẽ là chỗ duy nhất an toàn.',
]);
P('ch7_pass_exit_locked', ['Thẩm Phán Hư Không chắn lối.']);

// ================================================================== 16. Ink lake throne (boss)
P('ch7_lake_arrival', [
  'Hồ Lặng. Mặt hồ đen tím phẳng như gương. Giữa hồ, Kuro đứng một mình, áo choàng tan thành mực.',
]);
K(
  'ch7_kuro_confront_ally',
  [
    'Peter... mày tới thật à.',
    'Mày thấy bà ấy chưa? Mẹ tao. Ngồi đây hàng trăm năm đợi một người mà bà còn không nhớ là ai.',
    'Tao không cho ai bị quên nữa. Kể cả nếu tao phải hóa thành mực. Tránh ra.',
  ],
  { responses: [to('…', 'ch7_fb_kuro_ink')] },
);
K(
  'ch7_kuro_confront_left',
  [
    'Lại mày. Lúc nào cũng là mày, đứng chắn giữa tao và những thứ tao muốn cứu.',
    'Trật tự của Chronos gọi đây là cân bằng. Tao gọi nó là một nghĩa địa. Lần này tao không lùi nữa.',
  ],
  { responses: [to('…', 'ch7_fb_kuro_ink')] },
);
FB('ch7_fb_kuro_ink', 'Ký Ức Của Kuro', [
  'Rơi khỏi trời, Kuro chìm xuống hồ mực. Hàng nghìn giọng nói gào lên: "Cứu chúng tôi... đừng để chúng tôi biến mất..."',
  'Kuro cắn chặt môi, mở lồng ngực đón hết dòng mực vào tim.',
]);
const FIGHT_END = {
  setFlags: ['pacified_void_kuro'],
  clearFlags: ['kuro_left'],
};
P('ch7_kuro_fight_end', ['Mặt hồ rung lên. Mực trên người Kuro chảy ngược, rút về đáy hồ.'], {
  effects: FIGHT_END,
  responses: [to('…', 'ch7_kuro_cold')],
});
P(
  'ch7_kuro_fight_end_embraced',
  ['Bài ru vang lên giữa mặt hồ. Mực trên người Kuro chảy ngược, rút về đáy hồ.'],
  { effects: FIGHT_END, responses: [to('…', 'ch7_kuro_embrace')] },
);
N(
  'ch7_kuro_embrace',
  MOTHER,
  [
    '(Dư ảnh bà Mai hiện lên giữa hồ, dang tay ôm lấy Kuro.)',
    'Kuro. Con về rồi. Mẹ đợi ở bến cũ mà...',
  ],
  { responses: [to('…', 'ch7_kuro_embrace_2')] },
);
K(
  'ch7_kuro_embrace_2',
  [
    '(Kuro buông lưỡi kiếm khả thể, quỳ sụp xuống trong vòng tay mẹ.)',
    'Mẹ... con quên mất mùi cơm của mẹ rồi. Con xin lỗi.',
    'Peter. ...Cảm ơn mày. Lần này đến lượt mày nhớ hộ tao.',
  ],
  { effects: { setFlags: ['ch7_kuro_redeemed', 'kuro_with_peter'] } },
);
K(
  'ch7_kuro_cold',
  [
    '(Kuro chống kiếm đứng dậy, thở dốc. Mực đã rút, nhưng mắt cậu vẫn tối.)',
    'Mày thắng. Tao sẽ đi với mày, vì không còn đường nào khác. Đừng nghĩ thế là tao đã tha thứ.',
  ],
  { effects: { setFlags: ['kuro_with_peter'] } },
);
K('ch7_kuro_after', ['Đi thôi. Sợi xích cuối cùng đang rên lên kia kìa.']);
P('ch7_lake_exit_locked', ['Kuro chắn giữa hồ.']);

// ================================================================== 17. Cradle of dawn (C10)
P('ch7_dawn_arrival', [
  'Chiếc Nôi Rạng Đông. Mắt xích vàng cuối cùng rên rỉ trên bệ phong ấn, ba chốt cắm quanh nó.',
]);
N('ch7_forgotten_whisper', FF, [
  'Sợi xích của Chronos được đúc từ sự đứng yên. Ánh sáng sẽ thiêu nó. Bóng tối sẽ làm nó mục.',
  'Truyền ấn vào đúng chốt, nó sẽ trụ thêm một chút.',
]);
P('ch7_pin_wrong', ['Xích vàng rên lên, rạn thêm một vết. Năng lượng xung khắc.']);
P(
  'ch7_pin_right',
  [
    'Chốt mang ký tự [U]. Đứng yên. Nửa ấn trong tay truyền hơi ấm vào mắt xích.',
    'Mắt xích sáng rực, tạm lành. Cánh cửa phía bắc mở ra.',
  ],
  { effects: { setFlags: ['stabilized_third_chain'] } },
);
P('ch7_pin_done', ['Mắt xích vẫn đang trụ.']);
P('ch7_core_closed', ['Khe nứt sau bệ phong ấn tối om.']);
P('ch7_core_open', ['Khe nứt mở ra vừa một người. Bên dưới là ánh tro thủy tinh.'], {
  effects: { warpTo: { mapId: 'map_ch7_glass_ash_core', spawnId: 'default' } },
});
P('ch7_dawn_exit_locked', ['Cửa phía bắc chưa mở. Mắt xích cần được gia cố.']);

// ================================================================== 18. Glass ash core (hidden C, C13)
P('ch7_core_arrival', [
  'Lõi Tro Thủy Tinh. Hai bình lớn, một chứa tro, một chứa mực, nối với nhau bằng ba van.',
]);
P('ch7_valve_table', [
  'Bảng van: Van 1 — Trái 3 tro/4 mực, Giữa 6/1, Phải 5/1. Van 2 — Trái 2/5, Giữa 2/1, Phải 6/3.',
  'Van 3 — Trái 3/6, Giữa 1/5, Phải 4/4. Ghi chú: "Lõi chỉ lặng khi tổng tro bằng tổng mực."',
]);
P('ch7_c13_wrong', ['Hai bình lệch nhau, áp suất rít lên. Tro và mực không cân.']);
P(
  'ch7_c13_right',
  [
    'Chín tro, chín mực. Hai bình lặng như mặt hồ.',
    'Từ đáy lõi, một bóng người đứng dậy, hai vòng sáng quay quanh nó: một tím, một vàng.',
  ],
  { effects: { setFlags: ['ch7_shade_awake'], refreshMap: true } },
);
N('ch7_shade_confront', 'Bóng Nguyên Sơ', [
  'Kẻ đếm được tro... Hãy xem ngươi đếm được nhịp của ta không.',
  '(Vòng vàng luôn đến sớm. Vòng tím mới là thật.)',
]);
N(
  'ch7_shade_defeated',
  'Bóng Nguyên Sơ',
  [
    'Hai vòng... đã thôi quay.',
    '(Bóng tan vào tro, để lại một chiếc móc khóa nhỏ hình chiếc nôi.)',
  ],
  {
    effects: grant('unwritten_cradle_clasp', 1, 'took_unwritten_cradle_clasp', {
      setFlags: ['defeated_primordial_shade'],
    }),
  },
);
P('ch7_core_done', ['Lõi tro đã lặng.']);
P('ch7_core_back', ['Quay lên Chiếc Nôi Rạng Đông.'], {
  effects: { warpTo: { mapId: 'map_ch7_cradle_of_dawn', spawnId: 'from_core' } },
});

// ================================================================== 19. Null hour threshold (end)
P('ch7_threshold_arrival', [
  'Ngưỡng Cửa Giờ Số Không. Một chiếc đồng hồ khổng lồ treo giữa không trung, kim chạy ngược.',
]);
P(
  'ch7_end_1',
  [
    'Mắt xích vàng cuối cùng bốc cháy, rồi vỡ tung thành nghìn hạt bụi sáng.',
    'Chiếc đồng hồ khổng lồ điểm một tiếng. Rồi một tiếng nữa. Giờ Thứ 25.',
  ],
  { responses: [to('…', 'ch7_end_forgotten')] },
);
N(
  'ch7_end_forgotten',
  FF,
  [
    '(Ngài ngẩng đầu lên, lần đầu tiên sau mười nghìn chu kỳ.)',
    'Thời gian của Chronos... đã hết rồi.',
  ],
  { responses: [to('…', 'ch7_end_sky')] },
);
P(
  'ch7_end_sky',
  [
    'Bầu trời hư không nứt toác. Qua các khe nứt, mình thấy bầu trời đỏ của chiến trường Veridia, những bánh răng thép của Beta, và biển Khánh Hòa.',
    'Tất cả đang lao vào nhau.',
  ],
  { responses: [to('…', 'ch7_end_kuro')] },
);
K(
  'ch7_end_kuro',
  [
    '(Kuro nắm chặt tay Peter, thân người vẫn còn rỉ mực.)',
    'Các thế giới đang sập vào nhau... Giờ Số Không bắt đầu rồi, Peter!',
  ],
  { responses: [to('…', 'ch7_end_final')] },
);
P('ch7_end_final', ['Mặt đất rung chuyển. Tiếng chuông tận thế ngân dài, xé toạc không gian.'], {
  effects: {
    setFlags: ['ch7_null_hour_begun', 'witnessed_ch7_cliffhanger'],
    endChapter: 7,
  },
});

// ================================================================== quests
const q = (id, title, description, kind, objectives, followUpQuestId) => ({
  id,
  title,
  kind,
  chapter: 7,
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
const CH7_QUESTS = [
  q(
    'quest_ch7_faded_shore',
    'Bờ Cát Phai Màu',
    'Peter rơi xuống đáy hư không. Nửa Ấn Origin có thể gọi lại tên những người bị quên.',
    'main',
    [
      ['obj_ch7_keeper', 'Gọi lại tên người gác cầu', 'restored_bridge_keeper'],
      ['obj_ch7_hamlet', 'Đánh thức ngôi nhà giữa xóm chài', 'opened_erased_hamlet_gate'],
    ],
    'quest_ch7_erased_lullaby',
  ),
  q(
    'quest_ch7_erased_lullaby',
    'Khúc Ru Bị Xóa',
    'Một người mẹ ngồi đưa chiếc nôi trống, quên cả tên mình lẫn tên con.',
    'main',
    [['obj_ch7_mother', 'Gọi lại tên người mẹ', 'restored_kuro_mother_name']],
    'quest_ch7_echoes_of_the_fleet',
  ),
  q(
    'quest_ch7_echoes_of_the_fleet',
    'Tiếng Vọng Đoàn Tàu Đắm',
    'Đường đi tiếp nằm trên tấm hải đồ của một thuyền trưởng không ai nhớ mặt.',
    'main',
    [
      ['obj_ch7_well', 'Làm giếng vọng lặng lại', 'balanced_echo_well'],
      ['obj_ch7_fleet', 'Tìm thuyền trưởng giữ hải đồ', 'solved_stranded_fleet'],
      ['obj_ch7_clocks', 'Chỉnh lại mặt đồng hồ đá', 'solved_clock_graveyard'],
    ],
    'quest_ch7_the_nameless_weeper',
  ),
  q(
    'quest_ch7_the_nameless_weeper',
    'Kẻ Khóc Không Tên',
    'Một khối đá ba khuôn mặt khóc mãi không ngừng, chắn ngang hành lang.',
    'main',
    [['obj_ch7_weeper', 'Vượt qua Kẻ Khóc Không Tên', 'defeated_nameless_weeper']],
    'quest_ch7_promontory_promise',
  ),
  q(
    'quest_ch7_promontory_promise',
    'Lời Hẹn Dưới Gốc Bàng',
    'Mỏm đá có cây bàng gãy, nơi hai đứa trẻ từng hứa với nhau.',
    'main',
    [
      ['obj_ch7_archives', 'Xếp lại những cuộn giấy trắng', 'solved_blank_archives'],
      ['obj_ch7_box', 'Mở chiếc hộp thiếc dưới gốc bàng', 'opened_childhood_pledge_box'],
      ['obj_ch7_maze', 'Đi qua Mê Cung Sương', 'solved_fog_maze'],
    ],
    'quest_ch7_chains_of_chronos',
  ),
  q(
    'quest_ch7_chains_of_chronos',
    'Những Sợi Xích Vàng',
    'Ở Thánh Đường Xích Vàng có một người đang quỳ, cổ tay bị xích.',
    'main',
    [['obj_ch7_forgotten', 'Nói chuyện với Kẻ Bị Quên Đầu Tiên', 'communed_first_forgotten']],
    'quest_ch7_redeeming_kuro',
  ),
  q(
    'quest_ch7_redeeming_kuro',
    'Kéo Kuro Trở Về',
    'Kuro đang uống cạn hư không để cứu những kẻ bị quên.',
    'main',
    [
      ['obj_ch7_inquisitor', 'Vượt qua Thẩm Phán Hư Không', 'defeated_void_inquisitor'],
      ['obj_ch7_kuro', 'Kéo Kuro khỏi hồ mực', 'pacified_void_kuro'],
    ],
    'quest_ch7_null_hour_awakening',
  ),
  q(
    'quest_ch7_null_hour_awakening',
    'Thời Khắc Số Không Điểm Nhịp',
    'Mắt xích cuối cùng của Chronos đang rạn.',
    'main',
    [
      ['obj_ch7_chain', 'Gia cố mắt xích cuối cùng', 'stabilized_third_chain'],
      ['obj_ch7_threshold', 'Tới Ngưỡng Cửa Giờ Số Không', 'witnessed_ch7_cliffhanger'],
    ],
  ),
  q(
    'quest_ch7_first_mason',
    'Di Nguyện Thợ Khắc Đá',
    'Người khắc bia đầu tiên muốn những phiến đá của mình có tên.',
    'side',
    [['obj_ch7_mason', 'Khắc tên lên bốn phiến đá', 'honored_first_mason']],
  ),
  q(
    'quest_ch7_mother_hairpin',
    'Chiếc Kẹp Tóc Cài Lại',
    'Lá thư của bà Mai bị hư không ăn mất dấu chữ. Trong thư còn kẹp một thứ.',
    'side',
    [['obj_ch7_hairpin', 'Mang chiếc kẹp tóc về cho bà Mai', 'returned_mother_hairpin']],
  ),
  q(
    'quest_ch7_lost_compass',
    'La Bàn Của Thủy Thủ Mù',
    'Một thủy thủ mù làm mất la bàn, các mảnh văng khắp bến thuyền.',
    'side',
    [['obj_ch7_compass', 'Ghép lại la bàn', 'calibrated_blind_compass']],
  ),
];
quests.quests = quests.quests.filter((x) => !x.id.startsWith('quest_ch7_')).concat(CH7_QUESTS);
const lastCh6 = quests.quests.find((x) => x.id === 'quest_ch6_abyss_awakening');
if (lastCh6) lastCh6.followUpQuestId = 'quest_ch7_faded_shore';

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
const CH7_ITEMS = [
  doc('bridge_toll_tag', 'Thẻ Bài Thu Phí Gãy', 'Thẻ bài của người gác cầu, gãy đôi.', [
    'Mặt trước còn chữ cái đầu: một nguyên âm, chữ đầu tiên của bảng chữ cái.\nMặt sau chỉ còn chữ cái cuối: H.',
  ]),
  doc('peter_torn_diary_page', 'Trang Nhật Ký Tuổi Thơ', 'Trang nhật ký Peter viết hồi nhỏ.', [
    'Kuro rủ mình ra mỏm đá cây bàng vào ngày rằm tháng bảy âm lịch, mùa hoa bàng rụng trắng bờ cát. Năm đó tụi mình mười bốn tuổi.',
  ]),
  doc('librarian_ghost_memo', 'Ghi Chép Của Thủ Thư', 'Hướng dẫn xếp sách của thủ thư vô danh.', [
    'Sách của những kẻ bị xóa xếp theo độ nặng của ký ức: giấc mơ nhẹ nhất ở ngăn đầu, rồi mái nhà, rồi đôi tay lao động, nặng nhất là ký ức về các đấng sáng tạo.',
  ]),
  doc(
    'world_secret_torn_origin_scroll',
    'Bí Mật I: Trang Giấy Bị Xé',
    'Một mảnh giấy trắng mép xé.',
    [
      'Một trang giấy không chữ, xé từ một cuốn sổ rất cũ. Hư không trượt đi trên nó như nước trên lá sen.',
    ],
  ),
  doc('world_secret_mother_letter', 'Bí Mật II: Thư Của Người Mẹ', 'Thư bà Mai viết cho Kuro.', [
    'Kuro, con sống cho tử tế. Đừng để cái giận làm mờ mắt con. Mẹ không cần con cứu cả thế gian, mẹ chỉ cần con về ăn cơm.',
  ]),
  doc(
    'world_secret_twin_gods_pact',
    'Bí Mật III: Giao Ước Hai Vị Thần',
    'Tấm da trong khoang tàu đắm.',
    [
      'Hai người cùng giữ Origin. Một người giữ ánh sáng đầu tiên, một người giữ bánh xe. Nếu vết nứt mở, một người sẽ ở lại làm nút chặn.',
    ],
  ),
  doc(
    'world_secret_null_hour_blueprint',
    'Bí Mật IV: Bản Vẽ Đồng Hồ',
    'Bản vẽ cơ khí bị xé nhiều chỗ.',
    [
      'Một chiếc đồng hồ nối với sáu ổ khóa. Ghi chú bên lề: "Nếu sáu ổ cùng vỡ, kim sẽ chạy tới Giờ Thứ 25." Phần dưới bị xé mất.',
    ],
  ),
  doc(
    'world_secret_childhood_carving',
    'Bí Mật V: Nét Khắc Dưới Gốc Bàng',
    'Chép lại từ rễ cây bàng.',
    ['Peter và Kuro — dù cả thế giới có quên tụi mình.'],
  ),
  puzzle('void_sea_chart', 'Hải Đồ Biển Hư Không', 'Tấm hải đồ thuyền trưởng trao cho Peter.'),
  puzzle('white_crypt_key', 'Chìa Khóa Trắng', 'Chìa khóa khắc hình quả chuông nhỏ.'),
  puzzle('childhood_pledge_shard', 'Mảnh Thép Hẹn Ước', 'Mảnh thép gỉ khắc chữ P và K.'),
  puzzle('compass_shard_1', 'Mảnh La Bàn (Kim)', 'Mảnh la bàn có cây kim.'),
  puzzle('compass_shard_2', 'Mảnh La Bàn (Mặt)', 'Mảnh mặt la bàn khắc hướng.'),
  puzzle('compass_shard_3', 'Mảnh La Bàn (Vỏ)', 'Mảnh vỏ đồng của la bàn.'),
  {
    id: 'void_nectar_flask',
    name: 'Bình Mật Hư Không',
    type: 'consumable',
    description: 'Mật được lọc khỏi hư không. Hồi 180 HP và 80 MP.',
    value: 0,
    stackable: true,
    maxStack: 20,
    effects: { healAmount: 180, mpAmount: 80 },
  },
  gear('void_severance_blade', 'Kiếm Cắt Hư Vô', 'weapon', 'Lưỡi kiếm đúc từ tro thủy tinh.', {
    attack: 20,
    reach: 45,
    swingMs: 310,
    echoPct: 0.15,
  }),
  gear('kuro_mother_brooch', 'Cài Áo Bông Mai Của Mẹ', 'charm', 'Kỷ vật bà Mai trao cho Peter.', {
    maxHp: 35,
    defense: 5,
  }),
  gear('mother_golden_hairpin', 'Kẹp Tóc Vàng Của Mẹ', 'charm', 'Chiếc kẹp tóc hình bông mai.', {
    maxHp: 40,
    defense: 6,
  }),
  gear('unwritten_cradle_clasp', 'Móc Khóa Chiếc Nôi', 'charm', 'Móc khóa nhỏ hình chiếc nôi.', {
    maxHp: 45,
    maxMp: 30,
    attack: 5,
    defense: 7,
    speed: 4,
  }),
];
const ids = new Set(CH7_ITEMS.map((i) => i.id));
items.items = items.items.filter((i) => !ids.has(i.id)).concat(CH7_ITEMS);

write('public/assets/data/dialogue.json', dlg);
write('public/assets/data/quests.json', quests);
write('public/assets/data/items.json', items);
console.log(
  'ch7 content:',
  Object.keys(D).filter((k) => k.startsWith('ch7_')).length,
  'nodes,',
  CH7_QUESTS.length,
  'quests,',
  CH7_ITEMS.length,
  'items',
);
