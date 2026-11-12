import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import mapsJson from '../public/assets/data/maps.json';
import dialogueJson from '../public/assets/data/dialogue.json';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type { EnemyDatabase, ICombatant } from '../src/systems/combat/CombatTypes';
import type { MapDatabase } from '../src/world/MapTypes';
import type { DialogueDatabase } from '../src/systems/dialogue/DialogueTypes';

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

const unit = (id: string, type: 'player' | 'enemy', hp: number, attack: number): ICombatant => {
  const u: ICombatant = {
    id,
    name: id,
    type,
    stats: { hp, maxHp: hp, attack, defense: 0, speed: 10 },
    isAlive: true,
    spriteKey: id,
  };
  return u;
};

describe('Scripted rescue fight', () => {
  it('keeps Peter at 1 HP when the party floor is on', () => {
    const cs = new CombatSystem({ tuning, resolveItem: () => undefined, rng: () => 0.5 });
    const peter = unit('peter', 'player', 20, 5);
    const wraith = unit('wraith', 'enemy', 100, 50);
    cs.startBattle([peter], [wraith]);
    cs.partyHpFloor = 1;
    cs.executeAction({ type: 'attack', sourceId: 'wraith', targetId: 'peter' });
    expect(peter.stats.hp).toBe(1);
    expect(peter.isAlive).toBe(true);
    expect(cs.getPhase()).not.toBe('defeat');
  });

  it('the time-stop trigger starts the wraith fight, which hands over to the Elder rescue', () => {
    const wraith = (enemiesJson as unknown as EnemyDatabase).enemies.find(
      (e) => e.id === 'boss_time_wraith',
    );
    const rescue = wraith?.script?.rescue;
    expect(rescue?.dialogueId).toBe('battle_elder_rescue');
    const dialogues = (dialogueJson as unknown as DialogueDatabase).dialogues;
    expect(dialogues[rescue?.event.dialogueId ?? '']).toBeDefined();
    const town = (mapsJson as unknown as MapDatabase).maps.map_coastal_town;
    const trig = town.triggers?.find((t) => t.id === 'trig_time_stops');
    const enc = town.encounters?.find((e) => e.id === trig?.encounterId);
    expect(enc?.enemyId).toBe('boss_time_wraith');
    expect(town.roamers?.some((r) => r.ambush)).toBe(false);
  });
});
