/**
 * Chapter 8 foes and bosses (CHAPTER_08_DESIGN.md §9 with §18) into enemies.json, and the
 * Chapter 8 level cap / EXP curve into player.json. Idempotent.
 *
 * Usage: node scripts/enemies-ch8.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const db = read('public/assets/data/enemies.json');
const shard = [{ itemId: 'refined_chrono_shard', chance: 0.2 }];

const foe = (id, name, level, maxHp, attack, defense, field, expReward, loot = shard) => ({
  id,
  name,
  level,
  maxHp,
  hp: maxHp,
  attack,
  defense,
  speed: 9,
  spriteKey: id,
  skills: [],
  expReward,
  lootTable: loot,
  field,
});
const boss = (id, name, level, maxHp, attack, defense, speed, expReward, extra) => ({
  id,
  name,
  level,
  maxHp,
  hp: maxHp,
  attack,
  defense,
  speed,
  spriteKey: id,
  spriteScale: 1.5,
  skills: [],
  expReward,
  lootTable: [],
  ...extra,
});
const open = {
  damageReduction: 0,
  hpFloor: 0,
  recoverPct: 0,
  recoverMessage: '',
  unlockAfterTurns: 99,
  unlockMessage: '',
  startsUnshielded: true,
  actions: [],
};
const call = (id, label, message) => ({ id, label, message });

const LIST = [
  foe(
    'enemy_assimilator',
    'Kẻ Đồng Hóa',
    27,
    420,
    46,
    28,
    { mimic: { range: 150, counterMult: 1.4 } },
    260,
  ),
  foe(
    'enemy_phase_wraith',
    'Bóng Lệch Pha',
    27,
    360,
    48,
    24,
    {
      phase: {
        everyMs: 3000,
        solidMs: 1500,
        anchor: { ownFlag: 'ch8_c05_p2_w', otherFlag: 'ch8_c05_p2_s' },
      },
    },
    250,
  ),
  foe(
    'enemy_doom_bell',
    'Chuông Báo Tận',
    27,
    520,
    50,
    34,
    {
      bell: {
        range: 190,
        tollMs: 1200,
        waveMs: 700,
        radius: 150,
        damageMult: 1.8,
        crackMs: 2200,
        restMs: 1600,
      },
    },
    280,
  ),
  foe(
    'enemy_twin_era_legionnaire',
    'Lính Hai Đời',
    28,
    480,
    50,
    32,
    { frontShieldDeg: 120, allyTaunt: { everyMs: 4000, turnMs: 2000, range: 130 } },
    290,
  ),
  foe(
    'enemy_second_hand_warden',
    'Kẻ Gác Kim Giây',
    28,
    1100,
    52,
    32,
    {
      sweep: {
        length: 96,
        periodMs: 8000,
        sweepMult: 1.3,
        tickMs: 1000,
        windowMs: 420,
        stopMs: 3000,
      },
    },
    620,
    [{ itemId: 'void_nectar_flask', chance: 1 }],
  ),
  boss('boss_convergent_praetor', 'Pháp Quan Hội Tụ', 28, 1700, 50, 32, 12, 1300, {
    timedBlock: {
      ringMs: 850,
      windowMs: 230,
      factor: 0.45,
      count: 3,
      echoPool: [650, 850, 1050],
      echoMessage: 'Bản Án Đảo: Pháp Quan đọc lại bản án lượt trước — từ cuối lên đầu!',
      allBlockedPct: 0.12,
      allBlockedMessage: 'Đỡ trọn ba nhịp! Lyra lao vào, ngọn kích phá vỡ tấm khiên cẩm thạch!',
    },
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Cán cân rơi xuống nền đá. Lá cờ đỏ rách làm đôi, rồi cả hai nửa cùng tắt.',
      healPenalty: {
        mult: 1.3,
        message: 'Nhân Quả: "Ngươi đã gieo nhân — giờ gặt quả!" Đòn kế tiếp nặng hơn.',
      },
    },
  }),
  boss('boss_null_hour_herald', 'Sứ Giả Giờ Số Không', 29, 1900, 54, 34, 14, 1800, {
    spriteScale: 1.15,
    timedBlock: { ringMs: 820, windowMs: 220, factor: 0.45, count: 2 },
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Kim đồng hồ dừng ở 11:59. Sứ Giả quỳ xuống, mặt số trên ngực nó lặng im.',
      finisher: {
        itemId: 'origin_seal_half',
        belowPct: 0.15,
        action: {
          id: 'anchor_1159',
          label: 'NEO KIM Ở 11:59',
          message:
            'Peter cắm nửa Ấn Origin vào giữa mặt đồng hồ. Kim giờ rung lên… rồi đứng lại, cách vạch đỏ đúng một phút.',
          setFlag: 'ch8_anchored_1159',
        },
      },
      clockHand: {
        start: 18,
        top: 25,
        strikePct: 0.4,
        pushBy: 2,
        calls: [
          call('call_ivo', 'GỌI IVO', 'Ivo chèn cờ lê vào bánh răng của kim giờ!'),
          call('call_lyra', 'GỌI LYRA', 'Lyra dùng cán kích đẩy ngược kim giờ!'),
          call('call_neris', 'GỌI NERIS', 'Neris đọc to tên của từng giờ đã qua, kim giờ lùi lại!'),
        ],
        tickMessage: 'Kim Giờ Thứ 25: {n}/{top}.',
        strikeMessage: 'GIỜ SỐ KHÔNG! Một nhịp chuông xé toạc không gian — Peter mất {damage} HP!',
        kuroMessage:
          'Kim sắp chạm vạch đỏ — Kuro nhảy lên, dùng Possibility giữ chặt nó lại một nhịp!',
        phase2Pct: 0.5,
        phase2Message: 'Mặt đồng hồ nứt ra. Có những nhịp Peter không còn nhìn thấy nữa.',
      },
    },
  }),
  boss('boss_sixfold_echo', 'Tàn Ảnh Sáu Ấn', 29, 1800, 54, 32, 14, 1500, {
    timedBlock: {
      ringMs: 900,
      windowMs: 220,
      factor: 0.45,
      count: 2,
      phases: [
        {
          below: 1 / 6,
          set: { count: 4, shrinkMs: 30 },
          message: 'Ấn Origin bừng trắng: mọi nhịp cũ dồn về một lúc!',
        },
        {
          below: 2 / 6,
          set: { feintChance: 0.5 },
          message: 'Ấn Possibility lóe tím: những vòng sáng giả lao tới rồi rút lại.',
        },
        {
          below: 3 / 6,
          set: { count: 3, shrinkMs: 60 },
          message: 'Ấn Finality đỏ rực: ba nhịp, mỗi nhịp hẹp hơn.',
        },
        {
          below: 4 / 6,
          set: { hidden: true },
          message: 'Ấn Memory mờ đi: đòn đánh không còn thấy, chỉ còn gợn sóng.',
        },
        {
          below: 5 / 6,
          set: { decoyLeadMs: 320 },
          message: 'Ấn Causality vàng lên: một vòng vàng mồi tới trước — chỉ vòng tím là thật.',
        },
        {
          below: 1,
          set: { count: 3 },
          message: 'Ấn Continuum xanh biển: ba nhịp sóng nối nhau.',
        },
      ],
    },
    mechanic: {
      ...open,
      defeatMessage: 'Sáu ấn tắt lần lượt. Trong im lặng, có tiếng ai đó thở dài rất xa.',
    },
  }),
];

for (const e of LIST) {
  const i = db.enemies.findIndex((x) => x.id === e.id);
  if (i >= 0) db.enemies[i] = e;
  else db.enemies.push(e);
}
write('public/assets/data/enemies.json', db);

const pl = read('public/assets/data/player.json');
const caps = pl.player.chapterLevelCaps.filter((c) => c.untilFlag !== 'ch8_chronos_returned');
caps.push({ untilFlag: 'ch8_chronos_returned', cap: 29 });
pl.player.chapterLevelCaps = caps;
const exp = pl.player.expThresholds;
for (const v of [37600, 41600]) if (!exp.includes(v)) exp.push(v);
write('public/assets/data/player.json', pl);
console.log('enemies', LIST.length, 'caps', caps.length, 'levels', exp.length);
