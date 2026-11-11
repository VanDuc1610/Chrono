import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { DEFAULT_MAP_ID, FLAGS, GameSession } from '../src/state/GameSession';
import { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import { QuestDatabase } from '../src/systems/quest/QuestTypes';
import { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import { ISaveData } from '../src/systems/save/SaveTypes';

function createRealDatabase(): GameDatabase {
  return {
    items: itemsJson as unknown as InventoryDatabase,
    quests: questsJson as unknown as QuestDatabase,
    enemies: enemiesJson as unknown as EnemyDatabase,
    player: playerJson as unknown as PlayerDatabase,
  };
}

describe('GameSession, Progression & Quest Chaining', () => {
  it('initializes newGame with 2 shards + relic, Lv1, HP 50, and MP 20', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    expect(session.level).toBe(1);
    expect(session.exp).toBe(0);
    expect(session.hp).toBe(50);

    const stats = session.getStats();
    expect(stats.maxHp).toBe(50);
    expect(stats.maxMp).toBe(20);

    const combatant = session.createPlayerCombatant();
    expect(combatant.stats.hp).toBe(50);
    expect(combatant.stats.maxHp).toBe(50);
    expect(combatant.stats.mp).toBe(20);
    expect(combatant.stats.maxMp).toBe(20);

    expect(session.inventory.getItemCount('chrono_shard_minor')).toBe(2);
    expect(session.inventory.hasItem('relic_chronometer', 1)).toBe(true);
    expect(session.inventory.getAllItems()).toHaveLength(2);
  });

  it('preserves quest progress within the session across scene restarts (B1)', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    session.quests.startQuest('quest_prologue_awakening');
    session.quests.completeObjective('quest_prologue_awakening', 'obj_speak_elder');
    const quest = session.quests.getQuest('quest_prologue_awakening');
    const elderObj = quest?.objectives.find((o) => o.id === 'obj_speak_elder');
    expect(elderObj?.completed).toBe(true);

    // Simulating combat escape & re-reading from the same session
    session.applyBattleHp(35);
    const questAfterCombat = session.quests.getQuest('quest_prologue_awakening');
    const elderObjAfter = questAfterCombat?.objectives.find((o) => o.id === 'obj_speak_elder');
    expect(elderObjAfter?.completed).toBe(true);
  });

  it('does not inflate item counts across repeated toSaveData -> fromSave cycles (B2)', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);
    session.setFlag(FLAGS.shadeDefeated, true);
    session.inventory.addItem('chrono_shard_minor', 1); // 3 shards total after victory

    const save1 = session.toSaveData({ mapId: DEFAULT_MAP_ID, x: 400, y: 320 });
    const loaded1 = GameSession.fromSave(db, save1);
    expect(loaded1.inventory.getItemCount('chrono_shard_minor')).toBe(3);

    const save2 = loaded1.toSaveData({ mapId: DEFAULT_MAP_ID, x: 400, y: 320 });
    const loaded2 = GameSession.fromSave(db, save2);
    expect(loaded2.inventory.getItemCount('chrono_shard_minor')).toBe(3);
    expect(loaded2.inventory.getItemCount('relic_chronometer')).toBe(1);
  });

  it('starts a completely clean session on newGame after a previous playthrough (B3)', () => {
    const db = createRealDatabase();
    const playedSession = GameSession.newGame(db);
    playedSession.setFlag(FLAGS.shadeDefeated, true);
    playedSession.setFlag(FLAGS.awakeningTriggered, true);
    playedSession.inventory.addItem('chrono_shard_minor', 5);
    playedSession.addExp(120);
    playedSession.quests.completeQuest('quest_prologue_awakening');

    const freshSession = GameSession.newGame(db);
    expect(freshSession.getFlag(FLAGS.shadeDefeated)).toBe(false);
    expect(freshSession.getFlag(FLAGS.awakeningTriggered)).toBe(false);
    expect(freshSession.level).toBe(1);
    expect(freshSession.exp).toBe(0);
    expect(freshSession.hp).toBe(50);
    expect(freshSession.inventory.getItemCount('chrono_shard_minor')).toBe(2);
    expect(freshSession.inventory.hasItem('relic_chronometer', 1)).toBe(true);
    expect(freshSession.quests.getQuestStage('quest_prologue_awaken')).toBe('started');
    expect(freshSession.quests.getQuestStage('quest_prologue_awakening')).toBe('inactive');
    expect(freshSession.quests.getQuestStage('quest_prologue_silence')).toBe('inactive');
  });

  it('loads legacy 0.1.0 saves without an exp field and derives exp from level threshold', () => {
    const db = createRealDatabase();
    const legacySave: ISaveData = {
      version: '0.1.0',
      timestamp: 1700000000000,
      playtimeSeconds: 95,
      player: {
        name: 'Peter',
        level: 2,
        hp: 40,
        maxHp: 58,
        position: { mapId: DEFAULT_MAP_ID, x: 384, y: 320 },
      },
      inventory: [{ itemId: 'chrono_shard_minor', quantity: 2 }],
      quests: [],
      flags: {},
    };

    const session = GameSession.fromSave(db, legacySave);
    expect(session.level).toBe(2);
    expect(session.exp).toBe(50);
    expect(session.hp).toBe(40);
  });

  it('clamps saves above Lv3 down to Lv3 (prologue level cap)', () => {
    const db = createRealDatabase();
    const highLevelSave: ISaveData = {
      version: '0.2.0',
      timestamp: 1700000000000,
      playtimeSeconds: 180,
      player: {
        name: 'Peter',
        level: 5,
        exp: 350,
        hp: 80,
        maxHp: 82,
        position: { mapId: DEFAULT_MAP_ID, x: 384, y: 320 },
      },
      inventory: [{ itemId: 'chrono_shard_minor', quantity: 2 }],
      quests: [],
      flags: {},
    };

    const session = GameSession.fromSave(db, highLevelSave);
    expect(session.level).toBe(3);
    expect(session.hp).toBe(66); // Clamped to Lv3 maxHp (66)
    expect(session.expToNextLevel()).toBeNull();
  });

  it('enforces EXP thresholds [0, 50, 120], level cap 3, and restores full HP on level-up', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    expect(session.maxLevel).toBe(3);
    expect(session.expToNextLevel()).toBe(50);

    // Damage Peter before level-up
    session.applyBattleHp(12);
    expect(session.hp).toBe(12);

    // Reach Level 2 at 50 EXP
    const reachedLv2 = session.addExp(50);
    expect(reachedLv2).toEqual([2]);
    expect(session.level).toBe(2);
    expect(session.getStats().maxHp).toBe(58);
    expect(session.getStats().maxMp).toBe(24);
    expect(session.hp).toBe(58); // Full HP restored on level-up
    expect(session.expToNextLevel()).toBe(70); // 120 - 50

    // Damage again, then add huge EXP beyond cap (e.g. +500 EXP)
    session.applyBattleHp(10);
    const reachedLv3 = session.addExp(500);
    expect(reachedLv3).toEqual([3]);
    expect(session.level).toBe(3);
    expect(session.getStats().maxHp).toBe(66);
    expect(session.getStats().maxMp).toBe(28);
    expect(session.hp).toBe(66);
    expect(session.expToNextLevel()).toBeNull();
  });

  it('grants quest rewards only once, even after saving and reloading', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    session.quests.completeQuest('quest_prologue_awakening');
    const firstClaim = session.claimQuestRewards('quest_prologue_awakening');
    expect(firstClaim).not.toBeNull();
    expect(firstClaim?.exp).toBe(50);
    expect(session.level).toBe(2);
    expect(session.inventory.getItemCount('chrono_shard_minor')).toBe(3);

    // Second claim in same session returns null
    expect(session.claimQuestRewards('quest_prologue_awakening')).toBeNull();
    expect(session.inventory.getItemCount('chrono_shard_minor')).toBe(3);

    // Save and reload -> claim still returns null
    const save = session.toSaveData({ mapId: DEFAULT_MAP_ID, x: 300, y: 300 });
    const reloaded = GameSession.fromSave(db, save);
    expect(reloaded.claimQuestRewards('quest_prologue_awakening')).toBeNull();
    expect(reloaded.inventory.getItemCount('chrono_shard_minor')).toBe(3);
  });

  it('chains quest_prologue_awakening -> quest_prologue_silence and completes on isShadeDefeated flag', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    session.quests.startQuest('quest_prologue_awakening');
    expect(session.quests.getQuestStage('quest_prologue_awakening')).toBe('started');
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('inactive');

    // Complete both objectives of awakening
    session.quests.completeObjective('quest_prologue_awakening', 'obj_speak_elder');
    session.quests.completeObjective('quest_prologue_awakening', 'obj_inspect_altar');
    expect(session.quests.getQuestStage('quest_prologue_awakening')).toBe('completed');

    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('started');

    // Defeat the Shade and sync
    session.setFlag(FLAGS.shadeDefeated, true);
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('completed');
  });

  it('completes quest_prologue_silence immediately if Shade was defeated before finishing prologue awakening', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    // Player defeats Shade first
    session.setFlag(FLAGS.shadeDefeated, true);
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('inactive');

    // Later finishes prologue awakening
    session.quests.startQuest('quest_prologue_awakening');
    session.quests.completeObjective('quest_prologue_awakening', 'obj_speak_elder');
    session.quests.completeObjective('quest_prologue_awakening', 'obj_inspect_altar');
    session.syncQuestProgress();

    // Follow-up quest starts AND immediately completes in the same sync pass
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('completed');
  });

  it('is idempotent when syncQuestProgress is called repeatedly', () => {
    const db = createRealDatabase();
    const session = GameSession.newGame(db);

    session.quests.startQuest('quest_prologue_awakening');
    session.quests.completeObjective('quest_prologue_awakening', 'obj_speak_elder');
    session.quests.completeObjective('quest_prologue_awakening', 'obj_inspect_altar');

    const events: string[] = [];
    session.quests.addEventListener((e) => events.push(`${e.type}:${e.quest.id}`));

    session.syncQuestProgress();
    session.syncQuestProgress();
    session.syncQuestProgress();

    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('started');
    expect(events).toEqual(['quest_started:quest_prologue_silence']);
  });

  it('restores only progress in loadFromState so old saves still receive newly added follow-up quests', () => {
    const db = createRealDatabase();

    // Simulate an old save that only recorded quest_prologue_awakening without followUpQuestId
    const oldSave: ISaveData = {
      version: '0.1.0',
      timestamp: 1700000000000,
      playtimeSeconds: 60,
      player: {
        name: 'Peter',
        level: 1,
        hp: 50,
        maxHp: 50,
        position: { mapId: DEFAULT_MAP_ID, x: 384, y: 320 },
      },
      inventory: [{ itemId: 'chrono_shard_minor', quantity: 2 }],
      quests: [
        {
          id: 'quest_prologue_awakening',
          title: 'Echoes in the Fracture',
          description: 'Old description',
          stage: 'completed',
          objectives: [
            { id: 'obj_speak_elder', description: 'Speak', completed: true },
            { id: 'obj_inspect_altar', description: 'Inspect', completed: true },
          ],
        },
      ],
      flags: {},
    };

    const session = GameSession.fromSave(db, oldSave);
    session.syncQuestProgress();

    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('started');
  });
});
