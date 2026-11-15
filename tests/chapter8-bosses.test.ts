import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type { EnemyDatabase, ICombatant } from '../src/systems/combat/CombatTypes';
import mapsJson from '../public/assets/data/maps.json';

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

describe('Chapter 8 bosses', () => {
  it('Herald: ordinary blows cannot end it; only anchoring the hand at 11:59 does', () => {
    const { cs, boss } = fight('boss_null_hour_herald', { items: ['origin_seal_half'] });
    boss.stats.hp = 5;
    act(cs, 'attack');
    expect(boss.stats.hp).toBe(1);
    expect(cs.isBattleOver()).toBe(false);
    const opts = cs.getEnvironmentOptions('boss').map((o) => o.id);
    expect(opts).toContain('anchor_1159');
    cs.advanceTurn();
    while (cs.getActiveCombatantId() !== 'peter') cs.advanceTurn();
    act(cs, 'environment', 'anchor_1159');
    expect(boss.stats.hp).toBe(0);
    expect(cs.isBattleOver()).toBe(true);
  });

  it('Herald: companions push the 25th-hour hand back, once each', () => {
    const { cs } = fight('boss_null_hour_herald');
    expect(cs.getClockHand('boss')).toBe(18);
    cs.clockTurn('boss', 2);
    expect(cs.getClockHand('boss')).toBe(21);
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual([
      'call_ivo',
      'call_lyra',
      'call_neris',
    ]);
    act(cs, 'environment', 'call_lyra');
    expect(cs.getClockHand('boss')).toBe(19);
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual(['call_ivo', 'call_neris']);
  });
});

describe('Chapter 8 phase wraiths', () => {
  it('only the barracks wraiths follow the barracks anchor', () => {
    expect(def('enemy_phase_wraith').field?.phase).toEqual({ everyMs: 3000, solidMs: 1500 });
    const maps = (
      mapsJson as unknown as {
        maps: Record<string, { roamers?: { enemyId: string; phaseAnchor?: unknown }[] }>;
      }
    ).maps;
    for (const [id, m] of Object.entries(maps))
      for (const r of m.roamers ?? [])
        if (r.enemyId === 'enemy_phase_wraith')
          expect(!!r.phaseAnchor, id).toBe(id === 'map_ch8_twin_era_barracks');
  });
});
