import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import equipmentJson from '../public/assets/data/equipment.json';
import stringsJson from '../public/assets/data/strings.json';
import type { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { GameSession } from '../src/state/GameSession';
import type { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import type { QuestDatabase } from '../src/systems/quest/QuestTypes';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import {
  RARITIES,
  burnTick,
  cutCooldown,
  gearProfile,
  lifestealHeal,
  setOf,
  skillPowerFor,
  thornsDamage,
  type EquipmentDatabase,
} from '../src/systems/inventory/GearRules';

const gear = equipmentJson as unknown as EquipmentDatabase;
const items = (itemsJson as unknown as InventoryDatabase).items;
const strings = (stringsJson as { strings: Record<string, string> }).strings;

const db = (): GameDatabase => ({
  items: itemsJson as unknown as InventoryDatabase,
  quests: questsJson as unknown as QuestDatabase,
  enemies: enemiesJson as unknown as EnemyDatabase,
  player: playerJson as unknown as PlayerDatabase,
  gear,
});

describe('equipment.json', () => {
  it('gives every weapon and charm a rarity, and names only real items', () => {
    const ids = new Set(items.map((i) => i.id));
    const wearable = items.filter((i) => i.type === 'weapon' || i.type === 'charm');
    for (const i of wearable) expect(gear.items[i.id], i.id).toBeDefined();
    for (const [id, g] of Object.entries(gear.items)) {
      expect(ids.has(id), id).toBe(true);
      expect(RARITIES).toContain(g.rarity);
    }
  });

  it('builds sets from real items, one set per item, bonuses in order', () => {
    const seen = new Set<string>();
    for (const [id, set] of Object.entries(gear.sets)) {
      expect(strings[`gear.set.${id}`], id).toBeTruthy();
      for (const p of set.pieces) {
        expect(gear.items[p], p).toBeDefined();
        expect(seen.has(p), p).toBe(false);
        seen.add(p);
      }
      const counts = set.bonuses.map((b) => b.count);
      expect(counts).toEqual([...counts].sort((a, b) => a - b));
      expect(Math.max(...counts)).toBeLessThanOrEqual(set.pieces.length);
    }
  });

  it('has a string for every rarity and effect kind used', () => {
    for (const r of RARITIES) expect(strings[`gear.rarity.${r}`]).toBeTruthy();
    const kinds = new Set<string>();
    for (const g of Object.values(gear.items)) for (const e of g.effects) kinds.add(e.kind);
    for (const s of Object.values(gear.sets))
      for (const b of s.bonuses) for (const e of b.effects ?? []) kinds.add(e.kind);
    for (const k of kinds) expect(strings[`gear.effect.${k}`], k).toBeTruthy();
  });
});

describe('gear rules', () => {
  it('sums effects and reaches set bonuses by count', () => {
    const one = gearProfile(gear, ['praetor_iron_rapier']);
    expect(one.totals.crit).toBeCloseTo(0.06);
    expect(one.sets[0]).toMatchObject({ id: 'praetor', count: 1, total: 3, active: [] });
    const two = gearProfile(gear, ['praetor_iron_rapier', 'atonement_chronicle']);
    expect(two.totals.crit).toBeCloseTo(0.11);
    expect(two.sets[0].active).toHaveLength(1);
    const three = gearProfile(gear, [
      'praetor_iron_rapier',
      'atonement_chronicle',
      'scales_of_truth_charm',
    ]);
    // 0.2 from the charm, 0.3 from the full set.
    expect(three.skillPower.causality).toBeCloseTo(0.5);
    expect(skillPowerFor(three, 'causality')).toBeCloseTo(1.5);
    expect(skillPowerFor(three, 'origin')).toBe(1);
  });

  it('caps stacked effects', () => {
    const fake: EquipmentDatabase = {
      rarity: gear.rarity,
      items: {
        a: { rarity: 'epic', effects: [{ kind: 'crit', value: 0.4 }] },
        b: { rarity: 'epic', effects: [{ kind: 'crit', value: 0.4 }] },
      },
      sets: {},
    };
    expect(gearProfile(fake, ['a', 'b']).totals.crit).toBe(0.5);
  });

  it('turns effects into numbers', () => {
    const p = gearProfile(gear, ['vow_of_the_father_blade', 'seal_of_the_first_hour']);
    expect(lifestealHeal(50, p)).toBe(3);
    expect(lifestealHeal(1, p)).toBe(1);
    expect(cutCooldown(10000, p)).toBe(9000);
    const empty = gearProfile(gear, []);
    expect(lifestealHeal(50, empty)).toBe(0);
    expect(burnTick(30, gearProfile(gear, ['spear_of_finality']))).toBe(3);
    expect(thornsDamage(20, gearProfile(gear, ['valiant_crest_cuirass']))).toBe(3);
    expect(setOf(gear, 'oilcloth_coat')).toBe('lighthouse');
    expect(setOf(gear, 'gear_sling')).toBeNull();
  });
});

describe('GameSession gear', () => {
  it('adds set stat bonuses to the stats and previews a change without applying it', () => {
    const s = GameSession.newGame(db());
    s.inventory.addItem('beacon_hour_hand', 1);
    s.inventory.addItem('oilcloth_coat', 1);
    const base = s.getStats().maxHp;
    s.equip('beacon_hour_hand');
    const withHand = s.getStats().maxHp;
    const preview = s.previewStats('armor', 'oilcloth_coat');
    expect(s.equipment.armor).toBeNull();
    s.equip('oilcloth_coat');
    expect(s.getStats().maxHp).toBe(preview.maxHp);
    // The lighthouse pair adds 20 HP on top of the pieces' own stats.
    const coatHp = items.find((i) => i.id === 'oilcloth_coat')?.equip?.maxHp ?? 0;
    const handHp = items.find((i) => i.id === 'beacon_hour_hand')?.equip?.maxHp ?? 0;
    expect(withHand - base).toBe(handHp);
    expect(s.getStats().maxHp - base).toBe(handHp + coatHp + 20);
    expect(s.gear.sets[0]).toMatchObject({ id: 'lighthouse', count: 2 });
  });

  it('works without gear data (old fixtures)', () => {
    const { gear: _drop, ...rest } = db();
    void _drop;
    const s = GameSession.newGame(rest);
    expect(s.gear.sets).toEqual([]);
  });
});
