import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import type { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { FLAGS, GameSession } from '../src/state/GameSession';
import type { IItemDefinition, InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import type { QuestDatabase } from '../src/systems/quest/QuestTypes';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import type { ISaveData } from '../src/systems/save/SaveTypes';

/** Real data plus test-only weapon / charm / ether (items.json content belongs to T-47). */
const extra: IItemDefinition[] = [
  {
    id: 'test_blade',
    name: 'Kiếm Thử',
    type: 'weapon',
    description: '',
    value: 0,
    stackable: false,
    equip: { attack: 4, reach: 34, swingMs: 360 },
  },
  {
    id: 'test_charm',
    name: 'Bùa Thử',
    type: 'charm',
    description: '',
    value: 0,
    stackable: false,
    equip: { maxHp: 10, defense: 1 },
  },
  {
    id: 'test_ether',
    name: 'Tinh Chất Thử',
    type: 'consumable',
    description: '',
    value: 0,
    stackable: true,
    maxStack: 9,
    effects: { mpAmount: 8 },
  },
];

function db(): GameDatabase {
  const items = itemsJson as unknown as InventoryDatabase;
  return {
    items: { items: [...items.items.filter((i) => !extra.some((e) => e.id === i.id)), ...extra] },
    quests: questsJson as unknown as QuestDatabase,
    enemies: enemiesJson as unknown as EnemyDatabase,
    player: playerJson as unknown as PlayerDatabase,
  };
}

describe('Equipment and quick slots', () => {
  it('adds weapon and charm bonuses to the stats and auto-equips into an empty slot', () => {
    const s = GameSession.newGame(db());
    const base = s.getStats();
    s.applyDialogueEffects({ grantItems: [{ itemId: 'test_blade', quantity: 1 }] });
    expect(s.equipment.weapon).toBe('test_blade');
    expect(s.getStats().attack).toBe(base.attack + 4);
    expect(s.weaponStats?.reach).toBe(34);
    expect(s.canSlash).toBe(true);

    s.applyDialogueEffects({ grantItems: [{ itemId: 'test_charm', quantity: 1 }] });
    expect(s.getStats().maxHp).toBe(base.maxHp + 10);
    s.unequip('charm');
    expect(s.getStats().maxHp).toBe(base.maxHp);
    expect(s.hp).toBeLessThanOrEqual(base.maxHp);
    s.unequip('weapon');
    expect(s.canSlash).toBe(false); // owns a weapon but none is equipped
    expect(s.equip('chrono_shard_minor')).toBeNull();
  });

  it('uses consumables from quick slots and refuses when full', () => {
    const s = GameSession.newGame(db());
    s.applyDialogueEffects({ grantItems: [{ itemId: 'chrono_shard_minor', quantity: 2 }] });
    const slot = s.quickSlots.indexOf('chrono_shard_minor');
    expect(slot).toBeGreaterThanOrEqual(0);
    expect(s.useConsumable('chrono_shard_minor')).toMatchObject({ ok: false, reason: 'full' });
    s.hp = 5;
    const used = s.useConsumable('chrono_shard_minor');
    expect(used.ok && used.healed).toBe(30);
    s.applyDialogueEffects({ grantItems: [{ itemId: 'test_ether', quantity: 1 }] });
    s.mp = 0;
    const ether = s.useConsumable('test_ether');
    expect(ether.ok && ether.restoredMp).toBe(8);
    expect(s.assignQuickSlot(3, 'chrono_shard_minor')).toBe(true);
    expect(s.quickSlots.filter((id) => id === 'chrono_shard_minor')).toHaveLength(1);
    expect(s.assignQuickSlot(0, 'test_blade')).toBe(false);
  });

  it('saves equipment and quick slots; old saves get the Broken Blade equipped', () => {
    const s = GameSession.newGame(db());
    s.applyDialogueEffects({ grantItems: [{ itemId: 'test_blade', quantity: 1 }] });
    s.assignQuickSlot(2, 'test_ether');
    const save = s.toSaveData({ mapId: 'map_peters_room', x: 0, y: 0 });
    const back = GameSession.fromSave(db(), save);
    expect(back.equipment.weapon).toBe('test_blade');

    const old: ISaveData = {
      ...save,
      version: '0.3.0',
      equipment: undefined,
      quickSlots: undefined,
      inventory: [{ itemId: 'broken_blade', quantity: 1 }],
      flags: { [FLAGS.hasBlade]: true },
    };
    const migrated = GameSession.fromSave(db(), old);
    const bladeIsWeapon = migrated.slotOf('broken_blade') === 'weapon';
    expect(migrated.equipment.weapon).toBe(bladeIsWeapon ? 'broken_blade' : null);
    expect(migrated.canSlash).toBe(true);
  });
});
