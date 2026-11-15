import { describe, expect, it, vi } from 'vitest';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type {
  BossEnvironmentAction,
  BossMechanic,
  ICombatant,
  IEnemyDefinition,
} from '../src/systems/combat/CombatTypes';
import stringsJson from '../public/assets/data/strings.json';

// The ending resolver is pure. Only the scene base needs a browser-free stand-in on import.
vi.mock('phaser', () => ({ default: { Scene: class {} } }));
import { chapter9EndingKeys } from '../src/scenes/PrologueEndScene';

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
const pair: NonNullable<IEnemyDefinition['timedBlock']> = {
  ringMs: 900,
  windowMs: 220,
  factor: 0.45,
  pair: {
    goldLabel: 'Chronos',
    violetLabel: 'Kuro',
    syncChance: 0.5,
    collidePct: 0.12,
    message: 'Collision',
  },
};
const calls: BossEnvironmentAction[] = [
  { id: 'ivo', label: 'Ivo', message: 'Stunned', stunTurns: 1 },
  { id: 'lyra', label: 'Lyra', message: 'Broken', breakShield: true },
  { id: 'neris', label: 'Neris', message: 'Healed', healPct: 0.25 },
  { id: 'na', label: 'Na', message: 'Crane', healPct: 0.3, requiresFlag: 'gave_na_papers' },
];

function battle(partial: Partial<BossMechanic> = {}, rng = () => 0) {
  const flags = new Set<string>();
  const cs = new CombatSystem({
    tuning,
    resolveItem: () => undefined,
    rng,
    hasFlag: (f) => flags.has(f),
  });
  const player: ICombatant = {
    id: 'peter',
    name: 'Peter',
    type: 'player',
    spriteKey: 'p',
    isAlive: true,
    stats: { hp: 200, maxHp: 200, mp: 40, maxMp: 40, attack: 40, defense: 10, speed: 20 },
  };
  const enemy: ICombatant = {
    id: 'boss',
    name: 'Boss',
    type: 'enemy',
    spriteKey: 'b',
    isAlive: true,
    stats: { hp: 1000, maxHp: 1000, attack: 30, defense: 10, speed: 10 },
    mechanic: {
      damageReduction: 0.8,
      hpFloor: 1,
      recoverPct: 0,
      recoverMessage: '',
      unlockAfterTurns: 99,
      unlockMessage: '',
      actions: [],
      startsUnshielded: true,
      ...partial,
    },
  };
  cs.startBattle([player], [enemy]);
  const use = (id: string) =>
    cs.executeAction({
      type: 'environment',
      sourceId: player.id,
      targetId: enemy.id,
      environmentId: id,
    });
  return { cs, player, enemy, flags, use };
}

describe('Chapter 9 paired rings', () => {
  it('uses the injected RNG and gives separate rings a 300 ms gap', () => {
    const { cs } = battle({}, () => 0.49);
    expect(cs.rollPairedRings(pair)).toEqual({ inSync: true, impactMs: [900, 900] });
    cs.setRandomSource(() => 0.5);
    expect(cs.rollPairedRings(pair)).toEqual({ inSync: false, impactMs: [900, 1200] });
    expect(cs.rollPairedRings({ ...pair, pair: undefined })).toBeNull();
    expect(cs.rollPairedRings({ ...pair, pair: null })).toBeNull();
  });

  it('redirects synchronous blows as a percentage of max HP and leaves Peter unharmed', () => {
    const { cs, enemy, player } = battle({ startsUnshielded: false });
    enemy.stats.hp = 500;
    const turn = cs.rollPairedRings(pair)!;
    expect(cs.resolvePairedRings(enemy.id, pair, turn, 2)).toEqual({
      collided: true,
      damageDealt: 120,
      damageFactor: 0,
    });
    expect(enemy.stats.hp).toBe(380);
    expect(player.stats.hp).toBe(200);
  });

  it('does not redirect a missed synchronous block', () => {
    const { cs, enemy } = battle();
    expect(cs.resolvePairedRings(enemy.id, pair, cs.rollPairedRings(pair)!, 0)).toEqual({
      collided: false,
      damageDealt: 0,
      damageFactor: 1,
    });
    expect(enemy.stats.hp).toBe(1000);
  });

  it.each([
    [0, 1],
    [1, 0.725],
    [2, 0.45],
  ])('separate rings with %i blocks use the ordinary two-ring reduction', (blocks, factor) => {
    const { cs, enemy, player } = battle({}, () => 0.99);
    const turn = cs.rollPairedRings(pair)!;
    const result = cs.resolvePairedRings(enemy.id, pair, turn, blocks);
    expect(result.collided).toBe(false);
    expect(result.damageFactor).toBeCloseTo(factor);
    expect(enemy.stats.hp).toBe(1000);
    cs.executeAction({
      type: 'attack',
      sourceId: enemy.id,
      targetId: player.id,
      damageFactor: result.damageFactor,
    });
    expect(player.stats.hp).toBe(200 - Math.max(1, Math.floor(50 * factor)));
  });

  it('keeps the finale at one HP until its required finisher', () => {
    const { cs, enemy } = battle({
      finisher: {
        required: true,
        itemId: 'seal',
        belowPct: 0.01,
        action: { id: 'finish', label: 'Finish', message: 'Done' },
      },
    });
    enemy.stats.hp = 20;
    const result = cs.resolvePairedRings(enemy.id, pair, cs.rollPairedRings(pair)!, 2);
    expect(result.damageDealt).toBe(19);
    expect(enemy.stats.hp).toBe(1);
    expect(cs.isBattleOver()).toBe(false);
  });

  it('allows a collision to end a fight that has no required finisher', () => {
    const { cs, enemy } = battle();
    enemy.stats.hp = 20;
    cs.resolvePairedRings(enemy.id, pair, cs.rollPairedRings(pair)!, 2);
    expect(enemy.isAlive).toBe(false);
    expect(cs.isBattleOver()).toBe(true);
  });
});

describe('Chapter 9 companion calls', () => {
  it('offers at most three, consumes each once and reveals the next eligible call', () => {
    const { cs, flags, use, player } = battle({ calls });
    flags.add('gave_na_papers');
    expect(cs.getEnvironmentOptions('boss').map((c) => c.id)).toEqual(['ivo', 'lyra', 'neris']);
    use('ivo');
    expect(cs.beginEnemyTurn('boss').skip).toBe(true);
    expect(cs.beginEnemyTurn('boss').skip).toBe(false);
    expect(cs.getEnvironmentOptions('boss').map((c) => c.id)).toEqual(['lyra', 'neris', 'na']);
    expect(() => use('ivo')).toThrow('not available');
    player.stats.hp = 50;
    use('na');
    expect(player.stats.hp).toBe(110);
    expect(() => use('na')).toThrow('not available');
  });

  it('enforces story flags in both the menu and action execution', () => {
    const { cs, flags, use, player } = battle({ calls });
    player.stats.hp = 50;
    expect(cs.getEnvironmentOptions('boss').some((c) => c.id === 'na')).toBe(false);
    expect(() => use('na')).toThrow('not available');
    expect(player.stats.hp).toBe(50);
    flags.add('gave_na_papers');
    use('ivo');
    expect(cs.getEnvironmentOptions('boss').some((c) => c.id === 'na')).toBe(true);
    flags.delete('gave_na_papers');
    expect(cs.getEnvironmentOptions('boss').some((c) => c.id === 'na')).toBe(false);
  });

  it('breaks shields and heals Peter with a full-HP cap', () => {
    const { cs, use, player } = battle({ calls, startsUnshielded: false });
    expect(cs.isShielded('boss')).toBe(true);
    use('lyra');
    expect(cs.isShielded('boss')).toBe(false);
    player.stats.hp = 190;
    expect(use('neris').healingDone).toBe(10);
    expect(player.stats.hp).toBe(200);
    expect(() => use('neris')).toThrow('not available');
  });

  it('gates calls to the second HP phase and resets usage on a new battle', () => {
    const { cs, player, enemy, use } = battle({ calls, callsBelowPct: 0.6 });
    expect(cs.getEnvironmentOptions('boss')).toEqual([]);
    expect(() => use('ivo')).toThrow('not available');
    enemy.stats.hp = 600;
    use('ivo');
    expect(cs.getEnvironmentOptions('boss').map((c) => c.id)).not.toContain('ivo');
    cs.startBattle([player], [enemy]);
    expect(cs.getEnvironmentOptions('boss').map((c) => c.id)).toContain('ivo');
  });

  it('reuses effect handling for legacy environment actions', () => {
    const { cs, player, use } = battle({
      actions: [{ id: 'heal', label: 'Heal', message: 'Legacy heal', healPct: 0.25 }],
      unlockAfterTurns: 0,
    });
    cs.advanceTurn();
    cs.advanceTurn();
    player.stats.hp = 100;
    expect(use('heal').healingDone).toBe(50);
    expect(player.stats.hp).toBe(150);
  });
});

describe('Chapter 9 ending cards', () => {
  it.each([
    ['order', 'Trật Tự Vĩnh Cửu'],
    ['unbound', 'Vĩnh Hằng Bất Tận'],
    ['true', 'Chúa Tể Thời Gian Cuối Cùng'],
    ['returned_page', 'Trang Giấy Trở Về'],
  ])('routes the %s flag to its localized title and closing line', (ending, title) => {
    const keys = chapter9EndingKeys((flag) => flag === `ch9_ending_${ending}`);
    const table: Record<string, string> = stringsJson.strings;
    expect(keys).toEqual({
      title: `ending.ch9.${ending}.title`,
      closing: `ending.ch9.${ending}.closing`,
    });
    expect(table[keys.title]).toBe(title);
    expect(table[keys.closing].length).toBeGreaterThan(30);
    expect(table['ending.ch9.end']).toBe('Hết');
  });

  it('uses a neutral default with no ending flag and resolves every call afresh', () => {
    expect(chapter9EndingKeys(() => false)).toEqual({
      title: 'ending.ch9.default.title',
      closing: 'ending.ch9.default.closing',
    });
    expect(chapter9EndingKeys((f) => f === 'ch9_ending_true').title).toBe('ending.ch9.true.title');
    expect(chapter9EndingKeys(() => false).title).toBe('ending.ch9.default.title');
  });

  it('has deterministic priority for contradictory flags', () => {
    expect(chapter9EndingKeys(() => true).title).toBe('ending.ch9.order.title');
  });
});
