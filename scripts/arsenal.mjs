/**
 * T-84 arsenal: weapon families, ranged weapons, armor / accessory slots and where the new gear drops.
 *  - every melee weapon gets a `melee` family (sword / rapier / spear / heavy: slash shape);
 *  - every charm gets `slot` armor ("Hộ thân": defence and HP) or accessory (MP, speed, attack);
 *  - five ranged weapons and one early armor are added, dropped by bosses across the chapters.
 * Idempotent.
 *
 * Usage: node scripts/arsenal.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');

const itemsDb = read('public/assets/data/items.json');
const enemiesDb = read('public/assets/data/enemies.json');

const MELEE = {
  broken_blade: 'sword',
  tide_brass_blade: 'rapier',
  beacon_hour_hand: 'spear',
  praetor_iron_rapier: 'rapier',
  memory_needle_rapier: 'rapier',
  spear_of_finality: 'spear',
  vow_of_the_father_blade: 'sword',
  blade_of_possibility: 'sword',
  silver_pruning_shears: 'rapier',
  origin_astral_blade: 'sword',
  void_severance_blade: 'sword',
  convergence_compass_blade: 'sword',
  lyra_vanguard_halberd: 'heavy',
  last_chronarch_blade: 'sword',
  broken_divinity_edge: 'heavy',
};

/** Defence and HP outweigh MP, speed and attack → armor; otherwise accessory. */
const isArmor = (e = {}) =>
  (e.defense ?? 0) * 6 + (e.maxHp ?? 0) >
  ((e.maxMp ?? 0) * 2 + (e.speed ?? 0) * 8 + (e.attack ?? 0) * 8) * 1.2;

const gear = (id, name, description, equip, extra) => ({
  id,
  name,
  type: extra.ranged ? 'weapon' : 'charm',
  description,
  value: 0,
  stackable: false,
  maxStack: 1,
  equip,
  ...extra,
});

/** [item, boss that drops it] */
const NEW_GEAR = [
  [
    gear(
      'gear_sling',
      'Ná Bánh Răng',
      'Chiếc ná Peter ráp từ bánh răng và dây cót của Vệ Binh. Bắn viên bi đồng — yếu, nhưng chạm được thứ ở xa.',
      { attack: 3 },
      { ranged: { class: 'sling', fireMs: 520, speed: 340, range: 210, damageMult: 0.7 } },
    ),
    'boss_drowned_sentinel',
  ],
  [
    gear(
      'oilcloth_coat',
      'Áo Khoác Vải Dầu',
      'Áo vải dầu của người gác hải đăng, chống nước và chống đòn. Phủ lên áo khoác xanh than của Peter.',
      { maxHp: 10, defense: 2 },
      { slot: 'armor' },
    ),
    'boss_drowned_sentinel',
  ],
  [
    gear(
      'tide_spring_crossbow',
      'Nỏ Lò Xo Thủy Triều',
      'Nỏ lên dây bằng lò xo đồng hồ. Mũi tên xuyên qua kẻ đầu tiên và trúng luôn kẻ phía sau.',
      { attack: 8 },
      {
        ranged: {
          class: 'crossbow',
          fireMs: 780,
          speed: 480,
          range: 280,
          pierce: 1,
          damageMult: 1,
        },
      },
    ),
    'boss_imperial_verdict',
  ],
  [
    gear(
      'pendulum_repeater',
      'Nỏ Liên Hoàn Quả Lắc',
      'Quả lắc nạp tên liên tục — mỗi lần bóp cò bắn ba mũi xòe hình quạt.',
      { attack: 12 },
      {
        ranged: {
          class: 'repeater',
          fireMs: 650,
          speed: 400,
          range: 230,
          shots: 3,
          spreadDeg: 24,
          damageMult: 0.55,
        },
      },
    ),
    'boss_crimson_standard',
  ],
  [
    gear(
      'hourmark_flintlock',
      'Súng Kíp Khắc Giờ',
      'Mỗi phát nổ đốt một khắc thời gian (2 MP). Đạn xuyên hai kẻ địch, đau như búa tạ.',
      { attack: 20 },
      {
        ranged: {
          class: 'flintlock',
          fireMs: 1100,
          speed: 620,
          range: 320,
          pierce: 2,
          damageMult: 1.5,
          mpCost: 2,
        },
      },
    ),
    'boss_unborn_king',
  ],
  [
    gear(
      'astral_longbow',
      'Cung Tinh Tú Khởi Nguyên',
      'Dây cung bện từ ánh sao của Giờ Ban Sơ. Tên bay xa, xuyên một kẻ, nhịp bắn đều.',
      { attack: 27 },
      {
        ranged: { class: 'bow', fireMs: 600, speed: 560, range: 330, pierce: 1, damageMult: 1 },
      },
    ),
    'boss_convergent_praetor',
  ],
];

let tagged = 0;
for (const item of itemsDb.items) {
  if (item.type === 'weapon' && !item.ranged) {
    const family = MELEE[item.id] ?? 'sword';
    if (item.melee !== family) ((item.melee = family), tagged++);
  }
  if (item.type === 'charm' && !item.slot) {
    item.slot = isArmor(item.equip) ? 'armor' : 'accessory';
    tagged++;
  }
}

let added = 0;
for (const [item, bossId] of NEW_GEAR) {
  const at = itemsDb.items.findIndex((i) => i.id === item.id);
  if (at >= 0) itemsDb.items[at] = item;
  else (itemsDb.items.push(item), added++);
  const boss = enemiesDb.enemies.find((e) => e.id === bossId);
  if (!boss) throw new Error(`missing boss ${bossId}`);
  boss.lootTable ??= [];
  if (!boss.lootTable.some((l) => l.itemId === item.id))
    boss.lootTable.push({ itemId: item.id, chance: 1 });
}

write('public/assets/data/items.json', itemsDb);
write('public/assets/data/enemies.json', enemiesDb);
console.log(`arsenal: ${tagged} items tagged, ${added} new gear items`);
