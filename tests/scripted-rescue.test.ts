import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import mapsJson from '../public/assets/data/maps.json';
import dialogueJson from '../public/assets/data/dialogue.json';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import type { MapDatabase } from '../src/world/MapTypes';
import type { DialogueDatabase } from '../src/systems/dialogue/DialogueTypes';

describe('Scripted rescue fight', () => {
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
