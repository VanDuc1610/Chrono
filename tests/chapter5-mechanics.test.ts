import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';

const enemies = (enemiesJson as unknown as EnemyDatabase).enemies;
const def = (id: string) => {
  const e = enemies.find((x) => x.id === id);
  if (!e) throw new Error(id);
  return e;
};
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
