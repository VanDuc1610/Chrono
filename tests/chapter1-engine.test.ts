import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { GameSession } from '../src/state/GameSession';
import type { GameDatabase } from '../src/state/GameDatabase';
import { validateMapDatabase } from '../src/world/MapRegistry';
import type { MapDatabase, MapDefinition } from '../src/world/MapTypes';

const db = {
  items: itemsJson,
  quests: questsJson,
  enemies: enemiesJson,
  player: playerJson,
} as unknown as GameDatabase;

describe('Chapter 1 engine: dialogue effects', () => {
  it('clearFlags resets puzzle steps (e.g. bells struck in the wrong order)', () => {
    const s = GameSession.newGame(db);
    s.applyDialogueEffects({ setFlags: ['ch1_bell_step_1', 'ch1_bell_step_2'] });
    expect(s.getFlag('ch1_bell_step_2')).toBe(true);
    s.applyDialogueEffects({ clearFlags: ['ch1_bell_step_1', 'ch1_bell_step_2'] });
    expect(s.getFlag('ch1_bell_step_1')).toBe(false);
    expect(s.getFlag('ch1_bell_step_2')).toBe(false);
  });

  it('switching time layers: set the new layer and clear the old one in one node', () => {
    const s = GameSession.newGame(db);
    s.applyDialogueEffects({ setFlags: ['ch1_layer_past'] });
    s.applyDialogueEffects({ setFlags: ['ch1_layer_cataclysm'], clearFlags: ['ch1_layer_past'] });
    expect(s.getFlag('ch1_layer_past')).toBe(false);
    expect(s.getFlag('ch1_layer_cataclysm')).toBe(true);
  });
});

describe('Chapter 1 engine: map validation', () => {
  const base = (extra: Partial<MapDefinition>): MapDatabase => ({
    startMapId: 'm',
    maps: {
      m: {
        id: 'm',
        name: 'm',
        tilemap: { key: 'm', path: 'm.json' },
        tileset: { name: 't', key: 't', path: 't.png' },
        layers: { ground: 'Ground', walls: 'Walls' },
        collision: { fromGid: 1, toGid: 2 },
        bgm: 'ambient',
        spawns: { default: { x: 1, y: 1 }, loop_start: { x: 2, y: 2 } },
        ...extra,
      },
    },
  });
  const refs = {
    dialogueIds: new Set<string>(),
    questIds: new Set<string>(),
    enemyIds: new Set<string>(),
    objectives: new Map<string, Set<string>>(),
  };

  it('accepts a repeating loop zone that teleports back to a spawn', () => {
    const errors = validateMapDatabase(
      base({
        triggers: [
          {
            id: 'loop',
            on: 'zone',
            area: { x: 5, y: 5, w: 1, h: 3 },
            repeat: true,
            unlessFlag: 'broke_shore_loop',
            teleportTo: 'loop_start',
          },
        ],
      }),
      refs,
    );
    expect(errors).toEqual([]);
  });

  it('rejects a one-shot trigger without onceFlag and an unknown teleport spawn', () => {
    const errors = validateMapDatabase(
      base({
        triggers: [
          { id: 'a', on: 'arrive' },
          { id: 'b', on: 'zone', area: { x: 1, y: 1, w: 1, h: 1 }, repeat: true, teleportTo: 'x' },
        ],
      }),
      refs,
    ).join('\n');
    expect(errors).toContain('trigger a: needs onceFlag');
    expect(errors).toContain('trigger b: unknown spawn "x"');
  });
});
