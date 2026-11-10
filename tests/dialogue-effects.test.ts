import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/state/GameSession';
import type { GameDatabase } from '../src/state/GameDatabase';
import type { QuestDatabase } from '../src/systems/quest/QuestTypes';
import items from '../public/assets/data/items.json';
import quests from '../public/assets/data/quests.json';
import enemies from '../public/assets/data/enemies.json';
import player from '../public/assets/data/player.json';

/** Base data plus a test-only quest with a flag-driven objective. */
function makeDb(): GameDatabase {
  const questDb = structuredClone(quests) as QuestDatabase;
  questDb.quests.push({
    id: 'quest_test_lore',
    title: 'Test Lore',
    description: '',
    stage: 'inactive',
    objectives: [
      { id: 'obj_read', description: 'Read', completed: false, completeOnFlag: 'read_thing' },
    ],
    rewards: { experience: 10 },
  });
  return { items, quests: questDb, enemies, player } as unknown as GameDatabase;
}

describe('GameSession.applyDialogueEffects', () => {
  it('sets flags and starts an inactive quest', () => {
    const s = GameSession.newGame(makeDb());
    s.applyDialogueEffects({ setFlags: ['seen_a', 'seen_b'], startQuest: 'quest_test_lore' });
    expect(s.getFlag('seen_a') && s.getFlag('seen_b')).toBe(true);
    expect(s.quests.getQuestStage('quest_test_lore')).toBe('started');
  });

  it('grants items once per playthrough when grantOnceFlag is set', () => {
    const s = GameSession.newGame(makeDb());
    const effects = {
      grantItems: [{ itemId: 'ancient_gear', quantity: 1 }],
      grantOnceFlag: 'claimed_gear',
    };
    expect(s.applyDialogueEffects(effects)).toEqual([{ itemId: 'ancient_gear', quantity: 1 }]);
    expect(s.applyDialogueEffects(effects)).toEqual([]);
    expect(s.inventory.getItemCount('ancient_gear')).toBe(1);
  });

  it('keeps the once-flag across save/load', () => {
    const s = GameSession.newGame(makeDb());
    const effects = {
      grantItems: [{ itemId: 'chrono_shard_minor', quantity: 1 }],
      grantOnceFlag: 'claimed_shard',
    };
    s.applyDialogueEffects(effects);
    const loaded = GameSession.fromSave(makeDb(), s.toSaveData({ mapId: 'm', x: 0, y: 0 }));
    expect(loaded.applyDialogueEffects(effects)).toEqual([]);
    expect(loaded.inventory.getItemCount('chrono_shard_minor')).toBe(3);
  });

  it('completes flag objectives whether the flag comes before or after the quest starts', () => {
    const early = GameSession.newGame(makeDb());
    early.applyDialogueEffects({ setFlags: ['read_thing'] });
    early.applyDialogueEffects({ startQuest: 'quest_test_lore' });
    expect(early.quests.getQuestStage('quest_test_lore')).toBe('completed');

    const late = GameSession.newGame(makeDb());
    late.applyDialogueEffects({ startQuest: 'quest_test_lore' });
    late.applyDialogueEffects({ setFlags: ['read_thing'] });
    expect(late.quests.getQuestStage('quest_test_lore')).toBe('completed');
  });
});
