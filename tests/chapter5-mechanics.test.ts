import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
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

describe('The Other Peter — mirror', () => {
  it('copies the command Peter used last', () => {
    const { cs } = fight('boss_other_peter');
    act(cs, 'defend');
    expect(cs.mirrorCommand()).toBe('defend');
    act(cs, 'attack');
    expect(cs.mirrorCommand()).toBe('attack');
  });

  it('reading the letter ends the fight once he is at 30%, only with the letter', () => {
    const without = fight('boss_other_peter');
    without.boss.stats.hp = 100;
    expect(without.cs.getEnvironmentOptions('boss')).toEqual([]);
    const { cs, boss } = fight('boss_other_peter', { items: ['letter_to_daughter'] });
    expect(cs.getEnvironmentOptions('boss')).toEqual([]); // full HP: not yet
    boss.stats.hp = Math.floor(boss.stats.maxHp * 0.3);
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual(['read_letter']);
    act(cs, 'environment', 'read_letter');
    expect(boss.isAlive).toBe(false);
    expect(cs.getState().phase).toBe('victory');
  });
});

describe('The Unborn King — crowns, his name, Kuro', () => {
  it('three right denials break the crowns; his name stuns him; Kuro strikes', () => {
    const { cs, boss } = fight('boss_unborn_king', { flags: ['named_unborn_heir'] });
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual([
      'deny_begin',
      'deny_end',
      'deny_remember',
    ]);
    for (let i = 0; i < 3; i++) {
      cs.bossTurnCues('boss');
      const verse = (
        cs as unknown as { bosses: Map<string, { song: { coreId: string } }> }
      ).bosses.get('boss')?.song;
      act(cs, 'environment', verse?.coreId);
    }
    expect(cs.getEnvironmentOptions('boss').map((o) => o.id)).toEqual(['call_aurel']);
    const before = boss.stats.hp;
    act(cs, 'environment', 'call_aurel');
    expect(boss.stats.hp).toBeLessThan(before);
    expect(cs.beginEnemyTurn('boss').skip).toBe(true);
    expect(cs.getEnvironmentOptions('boss')).toEqual([]); // the name works once
    const hp = boss.stats.hp;
    cs.allyHit('boss', Math.ceil(boss.stats.maxHp * 0.05));
    expect(boss.stats.hp).toBe(hp - Math.ceil(boss.stats.maxHp * 0.05));
  });
});

describe('Chapter 5 data', () => {
  it('map enemies carry their behaviours; the level curve reaches 21', () => {
    expect(def('enemy_branch_phantom').field?.phase?.solidMs).toBe(600);
    expect(def('enemy_unborn_cocoon').field?.cocoon?.into).toBe('enemy_unborn_horror');
    expect(def('enemy_paradox_crystal').field?.echo?.delayMs).toBe(1000);
    expect(def('enemy_chronos_gardener').field?.lineCut?.windupMs).toBe(800);
    expect(def('boss_kuro_duel').script?.endAtEnemyPct).toBe(0.5);
    expect(playerJson.player.expThresholds.length).toBeGreaterThanOrEqual(21);
    expect(playerJson.player.chapterLevelCaps).toContainEqual({
      untilFlag: 'possibility_seal_restored',
      cap: 21,
    });
  });
});
