import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import type { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { GameSession } from '../src/state/GameSession';
import type { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import type { QuestDatabase } from '../src/systems/quest/QuestTypes';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import { pickDialogue } from '../src/world/MapRegistry';

const db = (): GameDatabase => ({
  items: itemsJson as unknown as InventoryDatabase,
  quests: questsJson as unknown as QuestDatabase,
  enemies: enemiesJson as unknown as EnemyDatabase,
  player: playerJson as unknown as PlayerDatabase,
});

describe('Puzzle items in dialogue rules and effects', () => {
  it('picks a rule by carried item (ifItem / unlessItem)', () => {
    const carried = new Set(['brass_key']);
    const state = {
      isQuestCompleted: () => false,
      getFlag: () => false,
      hasItem: (id: string) => carried.has(id),
    };
    const rules = [
      { ifItem: 'continuum_seal_shard', dialogueId: 'place_shard' },
      { ifItem: 'brass_key', unlessItem: 'continuum_seal_shard', dialogueId: 'open_with_key' },
    ];
    expect(pickDialogue('locked', rules, state)).toBe('open_with_key');
    carried.clear();
    expect(pickDialogue('locked', rules, state)).toBe('locked');
    // Without hasItem (old callers) item rules never match.
    expect(
      pickDialogue('locked', rules, { isQuestCompleted: () => false, getFlag: () => false }),
    ).toBe('locked');
  });

  it('takeItems removes items (and takes off gear that is handed over)', () => {
    const s = GameSession.newGame(db());
    s.applyDialogueEffects({
      grantItems: [
        { itemId: 'brass_key', quantity: 1 },
        { itemId: 'broken_blade', quantity: 1 },
      ],
    });
    expect(s.inventory.hasItem('brass_key', 1)).toBe(true);
    s.applyDialogueEffects({
      takeItems: [
        { itemId: 'brass_key', quantity: 1 },
        { itemId: 'broken_blade', quantity: 1 },
      ],
    });
    expect(s.inventory.hasItem('brass_key', 1)).toBe(false);
    expect(s.equipment.weapon).toBeNull();
  });
});
