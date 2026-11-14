import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type { EnemyDatabase, ICombatant } from '../src/systems/combat/CombatTypes';

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
const fight = (id: string, story: { items?: string[]; flags?: string[] } = {}) => {
  const d = def(id);
  const cs = new CombatSystem({
    tuning,
    resolveItem: () => undefined,
    rng: () => 0,
    hasItem: (i) => (story.items ?? []).includes(i),
    hasFlag: (f) => (story.flags ?? []).includes(f),
  });
  const peter: ICombatant = {
    id: 'peter',
    name: 'Peter',
    type: 'player',
    stats: { hp: 300, maxHp: 300, mp: 40, maxMp: 40, attack: 45, defense: 12, speed: 20 },
    isAlive: true,
    spriteKey: 'p',
  };
  const boss: ICombatant = {
    id: 'boss',
    name: d.name,
    type: 'enemy',
    stats: { hp: d.maxHp, maxHp: d.maxHp, attack: d.attack, defense: d.defense, speed: d.speed },
    isAlive: true,
    spriteKey: d.spriteKey,
    mechanic: d.mechanic,
  };
  cs.startBattle([peter], [boss]);
  return { cs, peter, boss };
};
const act = (cs: CombatSystem, type: 'attack' | 'defend' | 'skill' | 'environment', env?: string) =>
  cs.executeAction({ type, sourceId: 'peter', targetId: 'boss', environmentId: env });

describe('Chapter 6 bosses', () => {
  it('Broken Herald: a wrong glyph heals the shield instead of hurting Peter', () => {
    const { cs, peter, boss } = fight('boss_broken_herald');
    const lines = cs.bossTurnCues('boss');
    expect(lines.length).toBeGreaterThan(0);
    boss.stats.hp = 500;
    act(cs, 'environment', 'glyph_X');
    expect(boss.stats.hp).toBeGreaterThan(500);
    expect(peter.stats.hp).toBe(300);
  });

  it('Genesis Warden: charges, then fires unless the pin is pulled', () => {
    const { cs, peter, boss } = fight('boss_genesis_warden', {
      flags: ['read_celestial_handbook'],
    });
    boss.stats.hp = 700;
    cs.bossTurnCues('boss');
    expect(cs.isCharging('boss')).toBe(true);
    expect(cs.getEnvironmentOptions('boss')).toHaveLength(0);
    act(cs, 'skill');
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual(['pull_pin']);
    const before = boss.stats.hp;
    act(cs, 'environment', 'pull_pin');
    expect(boss.stats.hp).toBe(before - 380);
    expect(cs.isCharging('boss')).toBe(false);
    const again = fight('boss_genesis_warden');
    again.boss.stats.hp = 700;
    again.cs.bossTurnCues('boss');
    for (let i = 0; i < 3; i++) again.cs.purgeTurn('boss');
    expect(again.peter.stats.hp).toBe(300 - 180);
    expect(peter.stats.hp).toBe(300);
  });

  it('Echo of the First Forgotten: mist drains MP until it is lit', () => {
    const { cs, peter } = fight('boss_echo_forgotten');
    cs.bossTurnCues('boss');
    expect(peter.stats.mp).toBe(32);
    act(cs, 'environment', 'carve_light');
    cs.bossTurnCues('boss');
    expect(peter.stats.mp).toBe(32);
  });
});
