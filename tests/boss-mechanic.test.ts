import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import stringsJson from '../public/assets/data/strings.json';
import { CombatSystem, DEFAULT_COMBAT_TEXT } from '../src/systems/combat/CombatSystem';
import type {
  CombatTuning,
  EnemyDatabase,
  ICombatant,
  IEnemyDefinition,
} from '../src/systems/combat/CombatTypes';

const tuning = (playerJson as unknown as { combat: CombatTuning }).combat;
const sentinelDef = (enemiesJson as unknown as EnemyDatabase).enemies.find(
  (e) => e.id === 'boss_drowned_sentinel',
) as IEnemyDefinition;

function battle() {
  const peter: ICombatant = {
    id: 'peter',
    name: 'Peter',
    type: 'player',
    stats: { hp: 80, maxHp: 80, mp: 30, maxMp: 30, attack: 18, defense: 8, speed: 12 },
    isAlive: true,
    spriteKey: 'peter_idle',
  };
  const boss: ICombatant = {
    id: 'boss',
    name: sentinelDef.name,
    type: 'enemy',
    stats: {
      hp: sentinelDef.maxHp,
      maxHp: sentinelDef.maxHp,
      attack: sentinelDef.attack,
      defense: sentinelDef.defense,
      speed: sentinelDef.speed,
    },
    isAlive: true,
    spriteKey: sentinelDef.spriteKey,
    mechanic: sentinelDef.mechanic,
  };
  const sys = new CombatSystem({ tuning, resolveItem: () => undefined, rng: () => 0.5 });
  sys.startBattle([peter], [boss]);
  const act = (type: 'attack' | 'skill' | 'environment', environmentId?: string) =>
    sys.executeAction({ type, sourceId: 'peter', targetId: 'boss', environmentId });
  return { sys, peter, boss, act };
}

describe('The Drowned Sentinel mechanic (enemies.json)', () => {
  it('is defined with a shield and the two lens actions in order', () => {
    const m = sentinelDef.mechanic;
    expect(m).toBeDefined();
    expect(m?.actions.map((a) => a.id)).toEqual(['lens_left', 'lens_right']);
    expect(m?.actions[1].requires).toEqual(['lens_left']);
  });

  it('absorbs most damage while shielded and never drops below the HP floor', () => {
    const { boss, act, sys } = battle();
    const unshielded = 18 * tuning.attackMultiplier - boss.stats.defense;
    const hit = act('attack');
    expect(hit.damageDealt).toBeLessThan(unshielded / 2);
    expect(sys.isShielded('boss')).toBe(true);
    boss.stats.hp = 3;
    act('attack');
    expect(boss.stats.hp).toBe(sentinelDef.mechanic?.hpFloor);
    expect(boss.isAlive).toBe(true);
  });

  it('recovers instead of attacking when held at the floor', () => {
    const { boss, sys } = battle();
    boss.stats.hp = 1;
    const prelude = sys.beginEnemyTurn('boss');
    expect(prelude.skip).toBe(true);
    expect(boss.stats.hp).toBe(
      Math.ceil(boss.stats.maxHp * (sentinelDef.mechanic?.recoverPct ?? 0)),
    );
  });

  it('offers no environment action until Temporal Sight (skill) reveals it', () => {
    const { sys, act } = battle();
    expect(sys.getAvailableEnvironmentAction('boss')).toBeNull();
    expect(() => act('environment', 'lens_left')).toThrow();
    const res = act('skill');
    expect(res.message).toContain(sentinelDef.mechanic?.unlockMessage ?? '???');
    expect(sys.getAvailableEnvironmentAction('boss')?.id).toBe('lens_left');
  });

  it('also unlocks after enough rounds without the skill', () => {
    const { sys } = battle();
    const rounds = sentinelDef.mechanic?.unlockAfterTurns ?? 0;
    for (let i = 0; i < rounds * 2; i++) sys.advanceTurn(); // two combatants per round
    expect(sys.getAvailableEnvironmentAction('boss')?.id).toBe('lens_left');
  });

  it('left lens stuns, right lens breaks the shield, then a strike releases him', () => {
    const { sys, boss, act } = battle();
    act('skill');
    act('environment', 'lens_left');
    expect(sys.beginEnemyTurn('boss').skip).toBe(true); // stunned
    expect(sys.beginEnemyTurn('boss').skip).toBe(false); // only one turn
    expect(sys.getAvailableEnvironmentAction('boss')?.id).toBe('lens_right');

    act('environment', 'lens_right');
    expect(sys.isShielded('boss')).toBe(false);
    expect(boss.stats.hp).toBeLessThanOrEqual(Math.ceil(boss.stats.maxHp * 0.12));
    expect(sys.getAvailableEnvironmentAction('boss')).toBeNull();

    const finisher = act('attack');
    expect(boss.isAlive).toBe(false);
    expect(sys.getPhase()).toBe('victory');
    expect(finisher.message).toContain(sentinelDef.mechanic?.defeatMessage ?? '???');
  });
});

describe('combat text', () => {
  it('strings.json translates every battle-log template', () => {
    const table = stringsJson.strings as Record<string, string>;
    for (const key of Object.keys(DEFAULT_COMBAT_TEXT)) {
      expect(table[key], `strings.json is missing ${key}`).toBeTruthy();
    }
  });
});
