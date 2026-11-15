/**
 * Chapter 7 foes and bosses (CHAPTER_07_DESIGN.md §10 with §18.4) into enemies.json, and the
 * Chapter 7 level cap / EXP curve into player.json. Idempotent.
 *
 * Usage: node scripts/enemies-ch7.mjs
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

const LIST = [
  foe(
    'enemy_hollow_husk',
    'Vỏ Rỗng',
    24,
    380,
    42,
    30,
    { freezeWatch: { pullAfterMs: 2000, pullSpeed: 70, frozenMult: 2 } },
    210,
  ),
  foe(
    'enemy_name_eater',
    'Kẻ Ăn Tên',
    24,
    340,
    44,
    26,
    {
      inhale: {
        range: 120,
        tellMs: 900,
        windowMs: 260,
        cooldownMs: 3200,
        stunMs: 3000,
        chokeRadius: 110,
        chokePct: 0.25,
        mpDrain: 25,
        silenceMs: 3000,
      },
    },
    220,
  ),
  foe(
    'enemy_erasure_moths',
    'Đàn Bướm Xóa',
    24,
    220,
    40,
    16,
    {
      swarm: {
        range: 170,
        everyMs: 4200,
        gatherMs: 1100,
        windowMs: 300,
        healHp: 25,
        dotPerSec: 6,
        dotMs: 4000,
      },
    },
    190,
  ),
  foe(
    'enemy_ink_hound',
    'Chó Mực',
    25,
    360,
    44,
    24,
    {
      hound: {
        runMs: 1600,
        pauseMs: 500,
        radius: 70,
        periodMs: 2400,
        biteMult: 1.3,
        skillMult: 3,
        mpGain: 10,
      },
      pool: { everyMs: 700, lifeMs: 3500, radius: 14, slowPct: 0.5, mpPerSec: 0 },
    },
    230,
  ),
  foe(
    'enemy_void_inquisitor',
    'Thẩm Phán Hư Không',
    26,
    900,
    46,
    30,
    {
      chainTrial: {
        range: 230,
        everyMs: 4200,
        warnMs: 900,
        radius: 70,
        offset: 45,
        damageMult: 1.6,
      },
    },
    520,
    [{ itemId: 'void_nectar_flask', chance: 1 }],
  ),
  boss('boss_nameless_weeper', 'Kẻ Khóc Không Tên', 25, 1300, 46, 30, 10, 900, {
    timedBlock: { ringMs: 820, windowMs: 230, factor: 0.5 },
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Ba khuôn mặt đá khép mắt lại. Bể nước mắt lặng dần.',
      tears: {
        max: 5,
        floodPct: 0.4,
        dropMessage: 'Một giọt nước mắt tím rơi xuống bể ({n}/{max}).',
        wipeMessage: 'Đỡ đúng nhịp — Peter gạt đi một giọt nước mắt ({n}/{max}).',
        floodMessage: 'Bể nước mắt tràn bờ! Lũ nước mắt cuốn qua — Peter mất {damage} HP!',
      },
    },
  }),
  boss('boss_kuro_void', 'Kuro (Hư Không)', 26, 1600, 48, 30, 13, 1200, {
    timedBlock: { ringMs: 800, windowMs: 220, factor: 0.5, feintChance: 0.3 },
    script: { endAtEnemyPct: 0.1 },
    mechanic: {
      ...open,
      releasedFrame: 4,
      defeatMessage: 'Kuro khuỵu xuống. Mực trên người cậu rút dần như nước triều.',
      finisher: {
        itemId: 'kuro_mother_brooch',
        flag: 'ch7_mother_song_remembered',
        belowPct: 0.4,
        action: {
          id: 'call_kuro',
          label: 'GỌI TÊN THẬT CỦA KURO',
          message:
            'Peter giơ chiếc cài áo bông mai lên và gọi tên thật của Kuro, khẽ hát câu đầu "Chiều Trên Bến Cũ"...',
          setFlag: 'ch7_kuro_embraced',
        },
      },
      memoryLock: {
        everyTurns: 3,
        lockTurns: 2,
        staggerBonus: 0.5,
        staggerMessage:
          'Đòn Thời Gian chém đứt xúc tu mực! Kuro chao đảo — đòn kế tiếp đánh trúng tận lõi!',
        releaseMessage: 'Xúc tu mực tan ra. Tay Peter đã tự do.',
        options: [
          {
            command: 'attack',
            announce: 'Xúc tu mực quấn chặt tay kiếm — [1] TẤN CÔNG bị khóa!',
            staggerBy: ['skill'],
          },
          {
            command: 'item',
            announce: 'Xúc tu mực quấn lấy túi đồ — [3] VẬT PHẨM bị khóa!',
            staggerBy: ['skill'],
          },
        ],
      },
    },
  }),
  boss('boss_primordial_shade', 'Bóng Nguyên Sơ', 27, 1500, 50, 30, 14, 1100, {
    timedBlock: { ringMs: 950, windowMs: 210, factor: 0.4, decoyLeadMs: 320 },
    mechanic: {
      ...open,
      defeatMessage: 'Hai vòng sáng tắt cùng lúc. Bóng nguyên sơ tan vào tro thủy tinh.',
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
const caps = pl.player.chapterLevelCaps.filter((c) => c.untilFlag !== 'ch7_null_hour_begun');
caps.push({ untilFlag: 'ch7_null_hour_begun', cap: 27 });
pl.player.chapterLevelCaps = caps;
const exp = pl.player.expThresholds;
for (const v of [26800, 30200, 33800]) if (!exp.includes(v)) exp.push(v);
write('public/assets/data/player.json', pl);
console.log('enemies', LIST.length, 'caps', caps.length, 'levels', exp.length);
