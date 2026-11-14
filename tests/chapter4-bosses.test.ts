import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type { EnemyDatabase, ICombatant } from '../src/systems/combat/CombatTypes';
import { dialFlags, dialIndex, readScale } from '../src/world/PuzzleRules';

const tuning = {
  attackMultiplier: 2,
  attackVariance: 0,
  critChance: 0,
  critMultiplier: 1.5,
  skillMultiplier: 2.8,
  skillMinDamage: 5,
  skillMpCost: 6,
  defendDamageFactor: 0.5,
  escapeBaseChance: 0.5,
  escapeSpeedFactor: 0.05,
  escapeMinChance: 0.1,
  escapeMaxChance: 0.9,
};
const enemies = (enemiesJson as unknown as EnemyDatabase).enemies;
const def = (id: string) => {
  const e = enemies.find((x) => x.id === id);
  if (!e) throw new Error(id);
  return e;
};

const fight = (id: string) => {
  const d = def(id);
  const cs = new CombatSystem({ tuning, resolveItem: () => undefined, rng: () => 0 });
  const peter: ICombatant = {
    id: 'peter',
    name: 'Peter',
    type: 'player',
    stats: { hp: 200, maxHp: 200, mp: 30, maxMp: 30, attack: 40, defense: 10, speed: 20 },
    isAlive: true,
    spriteKey: 'p',
  };
  const boss: ICombatant = {
    id: 'boss',
    name: d.name,
    type: 'enemy',
    stats: {
      hp: d.maxHp,
      maxHp: d.maxHp,
      attack: d.attack,
      defense: d.defense,
      speed: d.speed,
    },
    isAlive: true,
    spriteKey: d.spriteKey,
    mechanic: d.mechanic,
  };
  cs.startBattle([peter], [boss]);
  return { cs, peter, boss };
};
const hit = (cs: CombatSystem, type: 'attack' | 'environment' = 'attack', environmentId?: string) =>
  cs.executeAction({ type, sourceId: 'peter', targetId: 'boss', environmentId });

describe('The Crimson Standard — blood wall', () => {
  it('raises a wall every 3 boss turns; it cuts damage until both tethers are cut', () => {
    const { cs, boss } = fight('boss_crimson_standard');
    const open = hit(cs).damageDealt;
    cs.bossTurnCues('boss');
    cs.bossTurnCues('boss');
    expect(cs.hasBloodWall('boss')).toBe(false);
    expect(cs.bossTurnCues('boss').join(' ')).toContain('Tường Khí Máu');
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual(['cut_tether']);
    const walled = hit(cs).damageDealt;
    expect(walled).toBeLessThan(open / 2);
    hit(cs, 'environment', 'cut_tether');
    expect(cs.hasBloodWall('boss')).toBe(true);
    hit(cs, 'environment', 'cut_tether');
    expect(cs.hasBloodWall('boss')).toBe(false);
    expect(hit(cs).damageDealt).toBe(open);
    expect(boss.isAlive).toBe(true);
  });
});

describe('The Last War — Finality ritual', () => {
  it('rises at 40% when felled, until the three pillars are lit in order', () => {
    const { cs, boss, peter } = fight('boss_the_last_war');
    boss.stats.hp = 5;
    hit(cs);
    expect(boss.isAlive).toBe(true);
    expect(boss.stats.hp).toBe(Math.ceil(boss.stats.maxHp * 0.4));
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual([
      'pillar_candle',
      'pillar_hand',
      'pillar_letter',
    ]);
    // Wrong pillar first: the order resets and Peter is hurt.
    const before = peter.stats.hp;
    hit(cs, 'environment', 'pillar_candle');
    expect(peter.stats.hp).toBeLessThan(before);
    expect(cs.getRitual('boss')?.progress).toBe(0);
    for (const id of ['pillar_hand', 'pillar_letter', 'pillar_candle']) hit(cs, 'environment', id);
    expect(cs.getRitual('boss')?.done).toBe(true);
    expect(cs.getEnvironmentOptions('boss')).toEqual([]);
    const final = hit(cs);
    expect(final.message).toContain('FINALITY');
    expect(boss.isAlive).toBe(false);
    expect(cs.getState().phase).toBe('victory');
  });

  it('a timed block halves the boss hit', () => {
    const { cs } = fight('boss_the_last_war');
    const full = cs.executeAction({ type: 'attack', sourceId: 'boss', targetId: 'peter' });
    const blocked = cs.executeAction({
      type: 'attack',
      sourceId: 'boss',
      targetId: 'peter',
      damageFactor: def('boss_the_last_war').timedBlock?.factor,
    });
    expect(blocked.damageDealt).toBe(Math.floor(full.damageDealt * 0.5));
  });
});

describe('Chapter 4 puzzles and progression', () => {
  it('a dial keeps exactly one value flag on', () => {
    const values = [
      { key: 'n', label: 'Bắc' },
      { key: 'ne', label: 'Đông Bắc' },
    ];
    const flags = dialFlags('dial_dir', values, 1);
    expect(flags).toEqual({ dial_dir_n: false, dial_dir_ne: true });
    expect(dialIndex('dial_dir', values, (f) => flags[f] === true)).toBe(1);
    expect(dialIndex('dial_dir', values, () => false)).toBe(0);
  });

  it('the hydraulic scale: 25/25 balances, a pan over 35 bursts, and weights stay hidden', () => {
    const rules = {
      weights: { sack_grain: 10, sack_herbs: 5, sack_sulfur: 20 },
      balanceAt: 25,
      breakAbove: 35,
    };
    expect(
      readScale(rules, {
        left: ['sack_sulfur', 'sack_herbs'],
        right: ['sack_grain', 'sack_grain', 'sack_herbs'],
      }),
    ).toBe('balanced');
    expect(readScale(rules, { left: ['sack_sulfur', 'sack_sulfur'], right: [] })).toBe('overload');
    expect(readScale(rules, { left: ['sack_grain'], right: ['sack_grain'] })).toBe('even');
    expect(readScale(rules, { left: ['sack_herbs'], right: ['sack_grain'] })).toBe('right');
  });

  it('the level curve reaches 18, capped at 18 until the Finality seal', () => {
    expect(playerJson.player.expThresholds.length).toBeGreaterThanOrEqual(18);
    expect(playerJson.player.chapterLevelCaps).toContainEqual({
      untilFlag: 'finality_seal_restored',
      cap: 18,
    });
  });
});

describe('Battle healing item', () => {
  it('uses the weakest item that covers the missing HP, never the full draught first', async () => {
    const { GameSession } = await import('../src/state/GameSession');
    const itemsJson = (await import('../public/assets/data/items.json')).default;
    const questsJson = (await import('../public/assets/data/quests.json')).default;
    const s = GameSession.newGame({
      items: itemsJson as never,
      quests: questsJson as never,
      enemies: enemiesJson as never,
      player: playerJson as never,
    });
    s.inventory.addItem('refined_chrono_shard', 2);
    s.inventory.addItem('phoenix_draught', 1);
    expect(s.pickCombatItem(20)).toBe('chrono_shard_minor');
    expect(s.pickCombatItem(100)).toBe('refined_chrono_shard');
    expect(s.pickCombatItem(500)).toBe('refined_chrono_shard');
    s.inventory.removeItem('refined_chrono_shard', 2);
    s.inventory.removeItem('chrono_shard_minor', s.inventory.getItemCount('chrono_shard_minor'));
    expect(s.pickCombatItem(500)).toBe('phoenix_draught');
  });
});
