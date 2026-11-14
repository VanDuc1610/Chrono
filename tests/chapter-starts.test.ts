import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import mapsJson from '../public/assets/data/maps.json';
import type { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { GameSession } from '../src/state/GameSession';
import { applyChapterStart, CHAPTER_STARTS, firstMainQuest } from '../src/state/ChapterStarts';
import type { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import type { QuestDatabase } from '../src/systems/quest/QuestTypes';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';

const db = (): GameDatabase => ({
  items: itemsJson as unknown as InventoryDatabase,
  quests: questsJson as unknown as QuestDatabase,
  enemies: enemiesJson as unknown as EnemyDatabase,
  player: playerJson as unknown as PlayerDatabase,
});
const maps = (mapsJson as unknown as { maps: Record<string, { spawns: Record<string, unknown> }> })
  .maps;
const itemIds = new Set((itemsJson as unknown as InventoryDatabase).items.map((i) => i.id));

describe('Chapter select', () => {
  it('every chapter start points at a real map, spawn, items and first quest', () => {
    expect(CHAPTER_STARTS.map((c) => c.chapter)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const c of CHAPTER_STARTS) {
      expect(maps[c.mapId]?.spawns[c.spawnId], `${c.mapId}/${c.spawnId}`).toBeDefined();
      for (const [id] of c.items) expect(itemIds.has(id), id).toBe(true);
      for (const id of c.equip)
        expect(
          c.items.some(([i]) => i === id),
          id,
        ).toBe(true);
      expect(firstMainQuest(questsJson.quests, c.chapter), `chapter ${c.chapter}`).not.toBeNull();
    }
  });

  it('starts at the previous chapter cap with its gear equipped and the quest running', () => {
    for (const c of CHAPTER_STARTS) {
      const s = GameSession.newGame(db());
      applyChapterStart(s, c);
      expect(s.level).toBe(c.level);
      expect(s.maxLevel).toBeGreaterThan(c.level);
      expect(s.equipment.weapon).toBe(c.equip[0]);
      const quest = firstMainQuest(questsJson.quests, c.chapter) ?? '';
      expect(s.quests.getQuestStage(quest), quest).toBe('started');
      expect(s.hp).toBe(s.getStats().maxHp);
      expect(s.lastFinishedChapter).toBe(c.chapter - 1);
    }
  });
});
