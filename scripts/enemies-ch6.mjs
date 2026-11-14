/**
 * Chapter 6 foes and bosses (CHAPTER_06_DESIGN.md §9, §17.3) into enemies.json, and the Chapter 6
 * level cap / EXP curve into player.json. Idempotent.
 *
 * Usage: node scripts/enemies-ch6.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
const db = read('public/assets/data/enemies.json');
const shard = [{ itemId: 'refined_chrono_shard', chance: 0.2 }];

const foe = (id, name, level, maxHp, attack, defense, field, expReward) => ({
  id,
  name,
  level,
  maxHp,
  hp: maxHp,
  attack,
  defense,
  speed: 8,
  spriteKey: id,
  skills: [],
  expReward,
  lootTable: shard,
  field,
});

const KURO = {
  name: 'Kuro',
  requiresFlag: 'ch6_kuro_ally',
  everyTurns: 2,
  damagePct: 0.05,
};

const LIST = [
  foe(
    'enemy_heel_shadow',
    'Bóng Gót',
    21,
    220,
    36,
    20,
    {
      trail: { delayMs: 1500, strikeEveryMs: 1200, radius: 22 },
    },
    150,
  ),
  foe(
    'enemy_twin_star',
    'Sao Đôi',
    21,
    300,
    36,
    18,
    {
      twin: {
        texture: 'enemy_twin_star',
        orbitPx: 64,
        periodMs: 2200,
        windowMs: 500,
        pairMult: 2,
        healPct: 0.15,
      },
    },
    160,
  ),
  foe(
    'enemy_origin_nullifier',
    'Mắt Xóa Niệm',
    22,
    260,
    38,
    24,
    {
      rings: {
        everyMs: 3500,
        beatMs: 450,
        ringMs: 700,
        radius: 130,
        slowPct: 0.4,
        slowMs: 3000,
        perfectMp: 6,
        stunMs: 3000,
      },
    },
    170,
  ),
  foe(
    'enemy_archon_construct',
    'Kiến Trúc Sư Cổ Đại',
    22,
    380,
    40,
    30,
    {
      laser: {
        range: 220,
        everyMs: 3800,
        blinkMs: 450,
        fireMs: 400,
        length: 300,
        width: 18,
        healHp: 15,
      },
    },
    190,
  ),
  {
    id: 'boss_broken_herald',
    name: 'Sứ Giả Gãy Cánh',
    level: 21,
    maxHp: 950,
    hp: 950,
    attack: 38,
    defense: 26,
    speed: 12,
    spriteKey: 'boss_broken_herald',
    spriteScale: 1.5,
    skills: [],
    expReward: 650,
    lootTable: [],
    timedBlock: { ringMs: 800, windowMs: 220, factor: 0.5, feintChance: 0.25 },
    script: {
      allyStrike: {
        ...KURO,
        message: 'Kuro chém gãy một chiếc lông kim loại — Sứ Giả mất {damage} HP!',
      },
    },
    mechanic: {
      damageReduction: 0.75,
      hpFloor: 1,
      recoverPct: 0.35,
      recoverMessage: 'Khiên chữ cổ rực lên — Sứ Giả hút ánh sáng của điện, liền lại vết thương!',
      unlockAfterTurns: 99,
      unlockMessage: '',
      releasedFrame: 4,
      defeatMessage: 'Sứ Giả quỳ xuống. Chiếc cánh còn lại khép vào như một lời chào.',
      actions: [
        { id: 'glyph_A', label: 'KHẮC [A]', message: '' },
        { id: 'glyph_O', label: 'KHẮC [O]', message: '' },
        { id: 'glyph_X', label: 'KHẮC [X]', message: '' },
      ],
      songs: {
        cracksToBreak: 3,
        coreDamage: 110,
        wrongPct: 0,
        wrongMp: 0,
        wrongHealPct: 0.08,
        wrongMessage: 'Khiên nuốt lấy nét khắc — Sứ Giả hồi {heal} HP!',
        breakMessage: 'Khiên chữ cổ vỡ tan! Sứ Giả loạng choạng, đôi cánh rỉ sét rơi lả tả.',
        list: [
          {
            id: 'shield_light',
            coreId: 'glyph_O',
            announce: 'Khiên của Sứ Giả hiện ký tự [A], chói lòa như giữa trưa.',
            crackMessage: 'Nét [O] phủ bóng lên khiên — ánh sáng tắt một mảng, khiên nứt!',
          },
          {
            id: 'shield_dark',
            coreId: 'glyph_A',
            announce: 'Khiên của Sứ Giả hiện ký tự [O], đen như đáy giếng.',
            crackMessage: 'Nét [A] rọi xuyên bóng tối — khiên nứt một mảng!',
          },
        ],
      },
    },
  },
  {
    id: 'boss_remnant_deacon',
    name: 'Tàn Ảnh Chấp Sự',
    level: 22,
    maxHp: 720,
    hp: 720,
    attack: 40,
    defense: 26,
    speed: 11,
    spriteKey: 'boss_remnant_deacon',
    spriteScale: 1.5,
    skills: [],
    expReward: 500,
    lootTable: [{ itemId: 'celestial_nectar_flask', chance: 1 }],
    timedBlock: {
      ringMs: 750,
      windowMs: 260,
      factor: 0.35,
      feintChance: 0.25,
      count: 3,
      shrinkMs: 50,
      allBlockedPct: 0.3,
      allBlockedMessage: 'Đỡ trọn ba nhịp! Búa của Chấp Sự gãy cán — hắn mất 30% máu đang có!',
    },
    script: {
      allyStrike: { ...KURO, message: 'Kuro đánh lệch nhịp búa — Chấp Sự mất {damage} HP!' },
    },
  },
  {
    id: 'boss_genesis_warden',
    name: 'Thực Thể Giám Hộ Khởi Nguyên',
    level: 23,
    maxHp: 1300,
    hp: 1300,
    attack: 44,
    defense: 30,
    speed: 10,
    spriteKey: 'boss_genesis_warden',
    spriteScale: 1.6,
    skills: [],
    expReward: 900,
    lootTable: [],
    timedBlock: { ringMs: 850, windowMs: 220, factor: 0.5, feintChance: 0.3 },
    script: {
      allyStrike: {
        ...KURO,
        message: 'Kuro bẻ cong không gian quanh chân nhân sư — Warden mất {damage} HP!',
      },
    },
    mechanic: {
      damageReduction: 0,
      hpFloor: 0,
      recoverPct: 0,
      recoverMessage: '',
      unlockAfterTurns: 99,
      unlockMessage: '',
      startsUnshielded: true,
      releasedFrame: 4,
      defeatMessage: 'Vương miện bánh răng ngừng quay. Cỗ máy nằm xuống như một con thú già.',
      actions: [],
      purge: {
        belowPct: 0.6,
        chargeTurns: 3,
        cooldownTurns: 3,
        damagePct: 0.6,
        pinFlag: 'read_celestial_handbook',
        allyFlag: 'ch6_kuro_ally',
        pinDamage: 380,
        pinAction: {
          id: 'pull_pin',
          label: 'RÚT CHỐT KHỞI NGUYÊN',
          message:
            'Peter giật Chốt Khởi Nguyên khỏi lưng nhân sư! Năng lượng dội ngược vào chính nó!',
          setFlag: 'ch6_used_regulator_pin',
        },
        chargeMessage:
          'Warden hút ánh sáng từ trần điện nứt — GENESIS PURGE bắt đầu tụ lực ({n} lượt)!',
        tickMessage: 'Warden đứng im tụ lực. Ánh sáng trên lưng nó rực hơn… còn {n} lượt.',
        fireMessage: 'GENESIS PURGE! Cả đại điện trắng xóa — Peter mất {damage} HP!',
        openMessage:
          'Mắt Thời Gian nhìn xuyên lớp vỏ — cái chốt điều áp sáng rực trên lưng Warden!',
      },
    },
  },
  {
    id: 'boss_echo_forgotten',
    name: 'Tiếng Vọng Của Kẻ Bị Quên',
    level: 24,
    maxHp: 1400,
    hp: 1400,
    attack: 46,
    defense: 30,
    speed: 13,
    spriteKey: 'boss_echo_forgotten',
    spriteScale: 1.5,
    skills: [],
    expReward: 1000,
    lootTable: [],
    timedBlock: { ringMs: 900, windowMs: 220, factor: 0.4, hidden: true },
    mechanic: {
      damageReduction: 0,
      hpFloor: 0,
      recoverPct: 0,
      recoverMessage: '',
      unlockAfterTurns: 99,
      unlockMessage: '',
      startsUnshielded: true,
      defeatMessage: 'Tiếng vọng tan thành bụi chữ vàng. Trong một thoáng, nó gần như mỉm cười.',
      actions: [],
      mist: {
        mpPerTurn: 8,
        clearTurns: 3,
        clearAction: {
          id: 'carve_light',
          label: 'KHẮC [A]',
          message: 'Peter khắc [A] giữa sương — sương xóa niệm lùi lại ba nhịp.',
        },
        drainMessage: 'Sương xóa niệm phủ quanh Peter — mất 8 MP.',
      },
    },
  },
];

for (const e of LIST) {
  const i = db.enemies.findIndex((x) => x.id === e.id);
  if (i >= 0) db.enemies[i] = e;
  else db.enemies.push(e);
}
write('public/assets/data/enemies.json', db);

const pl = read('public/assets/data/player.json');
const caps = pl.player.chapterLevelCaps.filter((c) => c.untilFlag !== 'origin_seal_cracked');
caps.push({ untilFlag: 'origin_seal_cracked', cap: 24 });
pl.player.chapterLevelCaps = caps;
const exp = pl.player.expThresholds;
for (const v of [18200, 20800, 23600]) if (!exp.includes(v)) exp.push(v);
write('public/assets/data/player.json', pl);
console.log('enemies', LIST.length, 'caps', caps.length, 'levels', exp.length);
