import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import playerJson from '../public/assets/data/player.json';
import enemiesJson from '../public/assets/data/enemies.json';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import { CombatTuning, ICombatant } from '../src/systems/combat/CombatTypes';
import { InventorySystem } from '../src/systems/inventory/InventorySystem';
import { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import { isValidSaveData } from '../src/systems/save/SaveSystem';

function createCombatSystem(rng: () => number = () => 0.5): CombatSystem {
  const inv = new InventorySystem();
  inv.loadDatabase(itemsJson as unknown as InventoryDatabase);
  const tuning = playerJson.combat as CombatTuning;

  return new CombatSystem({
    tuning,
    resolveItem: (itemId) => {
      const def = inv.getItemDefinition(itemId);
      const healAmount = def?.effects?.healAmount;
      return def && healAmount !== undefined ? { name: def.name, healAmount } : undefined;
    },
    rng,
  });
}

function createPlayerCombatant(overrides?: Partial<ICombatant['stats']>): ICombatant {
  const base = playerJson.player.baseStats;
  return {
    id: playerJson.player.id,
    name: playerJson.player.name,
    type: 'player',
    stats: {
      hp: base.maxHp,
      maxHp: base.maxHp,
      mp: base.maxMp,
      maxMp: base.maxMp,
      attack: base.attack,
      defense: base.defense,
      speed: base.speed,
      ...overrides,
    },
    isAlive: true,
    spriteKey: playerJson.player.spriteKey,
  };
}

function createShadeCombatant(overrides?: Partial<ICombatant['stats']>): ICombatant {
  const shade = enemiesJson.enemies[0];
  return {
    id: shade.id,
    name: shade.name,
    type: 'enemy',
    stats: {
      hp: shade.maxHp,
      maxHp: shade.maxHp,
      attack: shade.attack,
      defense: shade.defense,
      speed: shade.speed,
      ...overrides,
    },
    isAlive: true,
    spriteKey: shade.spriteKey,
  };
}

describe('CombatSystem', () => {
  it('orders turn initiative by descending speed so the faster combatant acts first', () => {
    const combat = createCombatSystem();
    const slowPlayer = createPlayerCombatant({ speed: 8 });
    const fastEnemy = createShadeCombatant({ speed: 15 });

    combat.startBattle([slowPlayer], [fastEnemy]);
    expect(combat.getActiveCombatantId()).toBe(fastEnemy.id);
    expect(combat.advanceTurn()).toBe(slowPlayer.id);
  });

  it('computes escape chance for speed 12 vs 10 as 0.6', () => {
    const combat = createCombatSystem();
    const player = createPlayerCombatant({ speed: 12 });
    const enemy = createShadeCombatant({ speed: 10 });
    combat.startBattle([player], [enemy]);

    const chance = combat.getEscapeChance(player, enemy);
    expect(chance).toBeCloseTo(0.6, 5);
  });

  it('allows escape to fail or succeed deterministically via setRandomSource without stubbing Math.random', () => {
    const combat = createCombatSystem();
    const player = createPlayerCombatant({ speed: 12 });
    const enemy = createShadeCombatant({ speed: 10 });
    combat.startBattle([player], [enemy]);

    // Roll >= 0.6 -> Escape fails, battle continues
    combat.setRandomSource(() => 0.75);
    const failRes = combat.executeAction({
      type: 'escape',
      sourceId: player.id,
      targetId: enemy.id,
    });
    expect(combat.getPhase()).toBe('turn_select');
    expect(combat.isBattleOver()).toBe(false);
    expect(failRes.message).toContain('failed to escape');

    // Roll < 0.6 -> Escape succeeds, phase becomes escaped
    combat.setRandomSource(() => 0.25);
    const successRes = combat.executeAction({
      type: 'escape',
      sourceId: player.id,
      targetId: enemy.id,
    });
    expect(combat.getPhase()).toBe('escaped');
    expect(combat.isBattleOver()).toBe(true);
    expect(successRes.message).toContain('escaped');
  });

  it('halves incoming damage while defending and expires the defend stance on the defender’s next action (B5)', () => {
    const combat = createCombatSystem(() => 0.5); // no crit (0.5 >= 0.15), variance = 0
    const player = createPlayerCombatant();
    const enemy = createShadeCombatant();
    combat.startBattle([player], [enemy]);

    // Player defends
    combat.executeAction({
      type: 'defend',
      sourceId: player.id,
      targetId: player.id,
    });

    // Enemy attacks while player is defending: raw = 8*2 - 6 = 10 -> halved to 5
    const guardedHit = combat.executeAction({
      type: 'attack',
      sourceId: enemy.id,
      targetId: player.id,
    });
    expect(guardedHit.damageDealt).toBe(5);

    // Player attacks on next turn -> clears player's defend stance
    combat.executeAction({
      type: 'attack',
      sourceId: player.id,
      targetId: enemy.id,
    });

    // Enemy attacks again -> unguarded full 10 damage
    const unguardedHit = combat.executeAction({
      type: 'attack',
      sourceId: enemy.id,
      targetId: player.id,
    });
    expect(unguardedHit.damageDealt).toBe(10);
  });

  it('heals according to items.json effects.healAmount and clamps to maxHp', () => {
    const combat = createCombatSystem();
    const player = createPlayerCombatant({ hp: 15, maxHp: 50 });
    const enemy = createShadeCombatant();
    combat.startBattle([player], [enemy]);

    const res = combat.executeAction({
      type: 'item',
      sourceId: player.id,
      targetId: player.id,
      itemId: 'chrono_shard_minor',
    });

    expect(res.healingDone).toBe(30);
    expect(player.stats.hp).toBe(45);

    // Second heal clamps at 50 maxHp
    const res2 = combat.executeAction({
      type: 'item',
      sourceId: player.id,
      targetId: player.id,
      itemId: 'chrono_shard_minor',
    });
    expect(res2.healingDone).toBe(5);
    expect(player.stats.hp).toBe(50);
  });

  it('deducts 6 MP per Temporal Strike (3 casts from 20 MP) and rejects a 4th cast when MP is insufficient', () => {
    const combat = createCombatSystem();
    const player = createPlayerCombatant({ mp: 20, maxMp: 20 });
    const bulkyEnemy = createShadeCombatant({ hp: 500, maxHp: 500 });
    combat.startBattle([player], [bulkyEnemy]);

    expect(combat.skillMpCost).toBe(6);

    for (let i = 1; i <= 3; i++) {
      expect(combat.canUseSkill(player.id)).toBe(true);
      combat.executeAction({
        type: 'skill',
        sourceId: player.id,
        targetId: bulkyEnemy.id,
      });
      expect(player.stats.mp).toBe(20 - i * 6);
    }

    // 2 MP left (< 6 MP): canUseSkill is false and executeAction throws
    expect(player.stats.mp).toBe(2);
    expect(combat.canUseSkill(player.id)).toBe(false);
    expect(() =>
      combat.executeAction({
        type: 'skill',
        sourceId: player.id,
        targetId: bulkyEnemy.id,
      }),
    ).toThrow(/lacks MP/);
  });

  it('allows enemies without an MP pool to use skills freely', () => {
    const combat = createCombatSystem();
    const player = createPlayerCombatant({ hp: 50 });
    const enemy = createShadeCombatant({ hp: 35 });
    expect(enemy.stats.mp).toBeUndefined();
    combat.startBattle([player], [enemy]);

    expect(combat.canUseSkill(enemy.id)).toBe(true);
    const enemySkill = combat.executeAction({
      type: 'skill',
      sourceId: enemy.id,
      targetId: player.id,
    });
    expect(enemySkill.damageDealt).toBeGreaterThanOrEqual(5);
    expect(player.stats.hp).toBeLessThan(50);
  });

  it('transitions to victory when all enemies fall and defeat when all party members fall', () => {
    const combat = createCombatSystem();

    // Defeat check
    const lowPlayer = createPlayerCombatant({ hp: 5 });
    const enemy = createShadeCombatant({ hp: 35 });
    combat.startBattle([lowPlayer], [enemy]);
    combat.executeAction({
      type: 'attack',
      sourceId: enemy.id,
      targetId: lowPlayer.id,
    });
    expect(lowPlayer.isAlive).toBe(false);
    expect(combat.getPhase()).toBe('defeat');
    expect(combat.isBattleOver()).toBe(true);

    // Victory check
    const player = createPlayerCombatant({ hp: 50 });
    const lowEnemy = createShadeCombatant({ hp: 5 });
    combat.startBattle([player], [lowEnemy]);
    combat.executeAction({
      type: 'attack',
      sourceId: player.id,
      targetId: lowEnemy.id,
    });
    expect(lowEnemy.isAlive).toBe(false);
    expect(combat.getPhase()).toBe('victory');
    expect(combat.isBattleOver()).toBe(true);
  });
});

describe('SaveSystem – isValidSaveData', () => {
  const validSave = {
    version: '0.2.0',
    timestamp: 1700000000000,
    playtimeSeconds: 120,
    player: {
      name: 'Peter',
      level: 2,
      exp: 50,
      hp: 58,
      maxHp: 58,
      position: { mapId: 'prologue_sanctuary', x: 384, y: 320 },
    },
    inventory: [{ itemId: 'chrono_shard_minor', quantity: 2 }],
    quests: [],
    flags: { isShadeDefeated: true },
  };

  it('accepts a valid save object', () => {
    expect(isValidSaveData(validSave)).toBe(true);
  });

  it('rejects null or non-object values', () => {
    expect(isValidSaveData(null)).toBe(false);
    expect(isValidSaveData(undefined)).toBe(false);
    expect(isValidSaveData('corrupt')).toBe(false);
  });

  it('rejects saves from an incompatible major version', () => {
    expect(isValidSaveData({ ...validSave, version: '1.0.0' })).toBe(false);
    expect(isValidSaveData({ ...validSave, version: '2.1.0' })).toBe(false);
  });

  it('rejects saves with a missing or malformed player block', () => {
    expect(isValidSaveData({ ...validSave, player: undefined })).toBe(false);
    expect(isValidSaveData({ ...validSave, player: null })).toBe(false);
  });

  it('rejects saves containing negative or zero item quantities', () => {
    expect(
      isValidSaveData({
        ...validSave,
        inventory: [{ itemId: 'chrono_shard_minor', quantity: -1 }],
      }),
    ).toBe(false);
    expect(
      isValidSaveData({
        ...validSave,
        inventory: [{ itemId: 'chrono_shard_minor', quantity: 0 }],
      }),
    ).toBe(false);
  });
});
