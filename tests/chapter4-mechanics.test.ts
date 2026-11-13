import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import { chantState, inParryWindow, sniperOutcome } from '../src/systems/action/ActionRules';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';

const enemies = (enemiesJson as unknown as EnemyDatabase).enemies;
const enemy = (id: string) => {
  const e = enemies.find((x) => x.id === id);
  if (!e) throw new Error(`missing ${id}`);
  return e;
};

describe('Chapter 4 timing rules', () => {
  it('Ghost Sniper: only a dodge started while the line is white is perfect', () => {
    const fire = 10_000;
    expect(sniperOutcome(fire, fire - 100, 250, false)).toBe('perfect');
    expect(sniperOutcome(fire, fire - 250, 250, false)).toBe('perfect');
    expect(sniperOutcome(fire, fire - 600, 250, false)).toBe('hit'); // dodged while still red
    expect(sniperOutcome(fire, -Infinity, 250, false)).toBe('hit');
    expect(sniperOutcome(fire, fire - 600, 250, true)).toBe('cover');
  });

  it('Endless Phalanx: the parry window is the last flash of the wind-up only', () => {
    expect(inParryWindow('windup', 200, 250)).toBe(true);
    expect(inParryWindow('windup', 400, 250)).toBe(false);
    expect(inParryWindow('chase', 100, 250)).toBe(false);
  });

  it('Banner Carrier: sings 2 s, breathes 1 s, verses count up', () => {
    expect(chantState(0, 0, 2000, 1000)).toEqual({ verse: 0, chanting: true });
    expect(chantState(2500, 0, 2000, 1000)).toEqual({ verse: 0, chanting: false });
    expect(chantState(3100, 0, 2000, 1000)).toEqual({ verse: 1, chanting: true });
  });

  it('the four Chapter 4 map enemies carry their mechanics', () => {
    expect(enemy('enemy_ghost_sniper').field?.sniper?.whiteMs).toBe(250);
    expect(enemy('enemy_endless_phalanx').field?.frontShieldDeg).toBe(180);
    expect(enemy('enemy_endless_phalanx').field?.parry?.staggerMs).toBe(1500);
    expect(enemy('enemy_banner_carrier').field?.chant?.revivePct).toBe(0.5);
    expect(enemy('enemy_undying_knight').field?.charge?.stunnedDamageMult).toBe(2);
  });
});
