/**
 * Chapter 9 foes and bosses (CHAPTER_09_DESIGN.md §10 with §20/§22) into enemies.json, and the final
 * level cap (30) into player.json. Lieutenants reuse earlier mechanics (Bran: shrinking double
 * rings; Lyra: Chapter 2 sentences; Neris: Chapter 7 songs; Peter's other self: Chapter 5 mirror).
 * Idempotent.
 *
 * Usage: node scripts/enemies-ch9.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const db = read('public/assets/data/enemies.json');
const shard = [{ itemId: 'refined_chrono_shard', chance: 0.25 }];

const foe = (id, name, level, maxHp, attack, defense, field, expReward, loot = shard) => ({
  id,
  name,
  level,
  maxHp,
  hp: maxHp,
  attack,
  defense,
  speed: 10,
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
const shielded = (recoverMessage) => ({
  damageReduction: 0.8,
  hpFloor: 1,
  recoverPct: 0.55,
  recoverMessage,
  unlockAfterTurns: 99,
  unlockMessage: '',
  actions: [],
});
const ring = (extra = {}) => ({ ringMs: 820, windowMs: 220, factor: 0.45, ...extra });

const LIST = [
  // ---------------------------------------------------------------- map foes
  foe(
    'enemy_nexus_sentinel',
    'Lính Canh Tâm Điểm',
    29,
    480,
    56,
    30,
    {
      thrust: {
        range: 150,
        warnMs: 700,
        lungeMs: 220,
        stuckMs: 1200,
        damageMult: 1.6,
        stuckMult: 1.6,
        guardMult: 0.4,
        cooldownMs: 1800,
      },
    },
    320,
  ),
  foe('enemy_entropy_specter', 'Bóng Ma Nhiệt Dịch', 29, 420, 54, 26, { clonesAtHalf: 2 }, 300),
  foe(
    'enemy_chronal_juggernaut',
    'Hộ Vệ Bánh Răng',
    29,
    550,
    58,
    34,
    {
      charge: {
        range: 200,
        stompMs: 400,
        speed: 340,
        maxMs: 900,
        stunMs: 2200,
        hitMult: 1.5,
        stunnedDamageMult: 2,
        cooldownMs: 2400,
      },
    },
    340,
  ),
  foe(
    'enemy_paradox_weaver',
    'Kẻ Dệt Nghịch Lý',
    29,
    460,
    52,
    28,
    { reflect: { pct: 1, everyMs: 3000, glowMs: 1800 } },
    320,
  ),
  foe(
    'enemy_nexus_inquisitor',
    'Đại Pháp Quan',
    30,
    1300,
    58,
    32,
    { chain4: { range: 150, reach: 70, beatMs: 450, windowMs: 1100, damageMult: 1.2 } },
    700,
    [{ itemId: 'divine_nectar_ampoule', chance: 1 }],
  ),
  // ---------------------------------------------------------------- route A
  boss('boss_primeval_architect', 'Kiến Trúc Sư Nguyên Thủy', 30, 2200, 54, 32, 12, 1600, {
    spriteScale: 1.15,
    timedBlock: ring({ count: 3, shrinkMs: 40 }),
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Bốn bánh đà dừng quay. Người đá khuỵu xuống, lõi xanh tắt lịm.',
      callsBelowPct: 0.5,
      calls: [
        {
          id: 'cut_regulator',
          label: 'NGẮT BỘ ĐIỀU ÁP CỔ',
          message:
            'Kuro giữ chặt hai cánh tay đá — Peter giật đứt Bộ Điều Áp Cổ! Kiến Trúc Sư đứng khựng hai lượt.',
          stunTurns: 2,
        },
      ],
    },
  }),
  boss('boss_sixfold_divinity', 'Thần Tính Lục Hợp', 30, 2600, 58, 34, 14, 2400, {
    spriteScale: 1.15,
    timedBlock: ring({
      count: 2,
      pair: {
        goldLabel: 'Trật Tự',
        violetLabel: 'Khả Năng',
        syncChance: 0.5,
        collidePct: 0.06,
        message: 'Hai đòn vàng tím trùng nhịp — Peter đỡ đúng lúc, chúng đập vào nhau!',
      },
      phases: [
        {
          below: 0.6,
          set: { pair: null, count: 3, shrinkMs: 40 },
          message: 'Chronos thức tỉnh Thần Tính Lục Hợp. Kuro bước sang đứng cạnh Peter!',
        },
      ],
    }),
    mechanic: {
      ...open,
      releasedFrame: 5,
      defeatMessage: 'Sáu cánh vỡ vụn. Thần Tính lặng im giữa tiếng chuông 12:00.',
      callsBelowPct: 0.6,
      calls: [
        {
          id: 'call_ivo9',
          label: 'GỌI IVO',
          message: 'Ivo chèn cờ lê vào bánh răng ngai vàng — Thần Tính mất một lượt!',
          stunTurns: 1,
        },
        {
          id: 'call_neris9',
          label: 'GỌI NERIS',
          message: 'Neris đọc tên Peter thật to — vết thương khép lại!',
          healPct: 0.25,
        },
        {
          id: 'call_lyra9',
          label: 'GỌI LYRA',
          message: 'Lyra phóng kích xuyên cánh Trật Tự — Thần Tính chao đảo!',
          stunTurns: 1,
        },
        {
          id: 'call_na9',
          label: 'HẠC GIẤY BÉ NA',
          message: 'Con hạc giấy ba màu bay vòng quanh Peter — ánh sáng ấm áp tràn khắp người!',
          healPct: 0.3,
          requiresFlag: 'gave_na_papers',
        },
      ],
      finisher: {
        itemId: 'origin_seal_half',
        belowPct: 0.1,
        required: true,
        action: {
          id: 'carve_last_page',
          label: 'KHẮC TRANG CUỐI',
          message: 'Peter khắc dòng cuối lên trang giấy của chính mình. Đồng hồ điểm 12:00.',
          setFlag: 'ch9_last_page_carved',
        },
      },
    },
  }),
  // ---------------------------------------------------------------- route B
  boss('boss_lieutenant_bran', 'Bran Tái Sinh', 29, 1750, 54, 30, 11, 1100, {
    timedBlock: ring({
      count: 2,
      shrinkMs: 70,
      allBlockedPct: 0.08,
      allBlockedMessage: 'Đỡ trọn hai nhịp — xích phục thù gãy một mắt!',
    }),
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Bran buông giáo. Sợi xích tím rời khỏi cổ tay anh.',
    },
  }),
  boss('boss_lieutenant_lyra', 'Pháp Quan Lyra', 29, 1850, 56, 30, 11, 1150, {
    timedBlock: ring(),
    mechanic: {
      ...shielded('Cán cân tím nghiêng về phía Pháp Quan — vết thương của cô biến mất!'),
      releasedFrame: 4,
      defeatMessage: 'Lyra buông ngọn kích. Hai đĩa cân tím rơi xuống, vỡ tan.',
      sentences: {
        cracksToBreak: 3,
        breakMessage: 'Cán cân nhân quả đảo nghịch vỡ toang! Khiên phán xét của Lyra rơi xuống.',
        list: [
          {
            id: 'no_attack',
            announce: 'PHÁN QUYẾT: "Kẻ vung gươm sẽ đổ máu!" (Tấn công lúc này sẽ bị phạt.)',
            forbidden: ['attack', 'skill'],
            defiedBy: ['defend'],
            punishPct: 0.22,
            punishMessage: 'Phán quyết ứng nghiệm — Peter mất {damage} HP!',
            crackMessage: 'Peter thủ thế — phán quyết mất nguyên nhân, cán cân nứt một vết!',
          },
          {
            id: 'no_wait',
            announce:
              'PHÁN QUYẾT: "Kẻ chần chừ sẽ bị nghiền nát!" (Đỡ hay dùng đồ lúc này sẽ bị phạt.)',
            forbidden: ['defend', 'item'],
            defiedBy: ['attack', 'skill'],
            punishPct: 0.22,
            punishMessage: 'Phán quyết ứng nghiệm — sấm tím giáng xuống, Peter mất {damage} HP!',
            crackMessage: 'Peter không chần chừ — cán cân nứt một vết!',
          },
        ],
      },
    },
  }),
  boss('boss_lieutenant_neris', 'Neris Mất Trí', 29, 1680, 56, 28, 12, 1100, {
    timedBlock: ring(),
    mechanic: {
      ...shielded('Ba tầng mực xoay ngược — trang sách tự liền lại!'),
      releasedFrame: 4,
      defeatMessage: 'Cuốn sách khép lại. Mực tím rút khỏi mắt Neris.',
      actions: [
        { id: 'page_name', label: 'TRANG TÊN', message: '' },
        { id: 'page_road', label: 'TRANG ĐƯỜNG ĐI', message: '' },
        { id: 'page_ash', label: 'TRANG TRO TÀN', message: '' },
      ],
      songs: {
        cracksToBreak: 3,
        coreDamage: 120,
        wrongPct: 0.15,
        wrongMp: 8,
        breakMessage: 'Bão mực tan! Cuốn sách mở toang, Neris không còn gì che chắn.',
        wrongMessage: 'Sai trang! Mực câm dội ngược, Peter mất {damage} HP và 8 MP!',
        list: [
          {
            id: 'name',
            coreId: 'page_name',
            announce: 'Neris thì thầm: "Ai sẽ gọi lại tên người bị quên…"',
            crackMessage: 'Trang Tên sáng lên — một tầng mực vỡ!',
          },
          {
            id: 'road',
            coreId: 'page_road',
            announce: 'Neris thì thầm: "Lối nào dẫn về nhà khi bản đồ đã cháy…"',
            crackMessage: 'Trang Đường Đi sáng lên — một tầng mực vỡ!',
          },
          {
            id: 'ash',
            coreId: 'page_ash',
            announce: 'Neris thì thầm: "Những gì còn lại sau ngọn lửa cuối cùng…"',
            crackMessage: 'Trang Tro Tàn sáng lên — một tầng mực vỡ!',
          },
        ],
      },
    },
  }),
  boss('boss_lieutenant_other_peter', 'Peter Thứ Hai', 29, 1980, 58, 30, 13, 1250, {
    timedBlock: ring({ feintChance: 0.3 }),
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Peter Thứ Hai hạ kiếm. Trong mắt anh, ánh tím tắt dần.',
      mirror: {
        skillMult: 1.6,
        healPct: 0.08,
        defendMessage: 'Peter Thứ Hai giương kiếm thủ thế — y hệt mình vừa làm.',
        skillMessage: 'Hắn học theo Đòn Thời Gian, chém một nhát nặng — Kỹ Năng bị khóa một lượt!',
        healMessage: 'Hắn cũng lấy ra một mảnh chrono, y hệt mình.',
      },
    },
  }),
  boss('boss_kuro_puppet_master', 'Chúa Tể Khả Năng Kuro', 30, 2100, 54, 32, 14, 2200, {
    timedBlock: ring({
      count: 2,
      decoyLeadMs: 300,
      phases: [
        {
          below: 0.5,
          set: { count: 3, feintChance: 0.4, hidden: false },
          message: 'Kuro giật dây — bóng của bốn phó tướng hiện lên sau lưng hắn!',
        },
      ],
    }),
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Kuro khuỵu xuống. Những sợi dây tím đứt từng sợi.',
      finisher: {
        itemId: 'origin_seal_half',
        belowPct: 0.12,
        required: true,
        action: {
          id: 'returned_page',
          label: 'TRANG GIẤY TRỞ VỀ',
          message: 'Peter trở về là trang giấy trắng, bọc lấy Kuro.',
          setFlag: 'ch9_page_returned',
        },
      },
    },
  }),
  // ---------------------------------------------------------------- hidden
  boss('boss_void_singularity_core', 'Lõi Kỳ Dị Hư Vô', 30, 2600, 62, 32, 15, 2000, {
    spriteScale: 1.15,
    timedBlock: ring({ count: 2, hidden: true }),
    mechanic: {
      ...open,
      defeatMessage: 'Lõi kỳ dị co lại thành một chấm sáng, rồi tắt.',
      memoryLock: {
        everyTurns: 3,
        lockTurns: 2,
        staggerBonus: 0.5,
        staggerMessage: 'Đòn Thời Gian cắt xuyên lõi — nó chao đảo, đòn kế tiếp đánh trúng tâm!',
        releaseMessage: 'Không gian thôi xoắn. Tay Peter tự do.',
        options: [
          {
            command: 'attack',
            announce: 'Không gian xoắn ngược — [1] TẤN CÔNG bị khóa!',
            staggerBy: ['skill'],
          },
          {
            command: 'item',
            announce: 'Túi đồ bị hút vào lõi — [3] VẬT PHẨM bị khóa!',
            staggerBy: ['skill'],
          },
        ],
      },
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
const caps = pl.player.chapterLevelCaps.filter((c) => c.untilFlag !== 'ch9_game_completed');
caps.push({ untilFlag: 'ch9_game_completed', cap: 30 });
pl.player.chapterLevelCaps = caps;
const exp = pl.player.expThresholds;
for (const v of [46000]) if (!exp.includes(v)) exp.push(v);
write('public/assets/data/player.json', pl);
console.log('enemies', LIST.length, 'caps', caps.length, 'levels', exp.length);
