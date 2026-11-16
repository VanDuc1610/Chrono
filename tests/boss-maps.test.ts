import { describe, expect, it } from 'vitest';
import bossesJson from '../public/assets/data/bosses.json';
import enemiesJson from '../public/assets/data/enemies.json';
import mapsJson from '../public/assets/data/maps.json';
import dialogueJson from '../public/assets/data/dialogue.json';
import townTm from '../public/assets/maps/map_coastal_town.json';
import lighthouseTm from '../public/assets/maps/map_old_lighthouse.json';
import bellTm from '../public/assets/maps/map_ch1_bell_sanctum.json';
import verdictTm from '../public/assets/maps/map_ch2_verdict_sanctum.json';
import { sentenceVerdict } from '../src/systems/boss/BossRules';
import type { BossDatabase } from '../src/systems/boss/BossTypes';

/** T-84: bosses fought on their own maps (Prologue to Chapter 2 so far). */
const bosses = (bossesJson as unknown as BossDatabase).bosses;
const enemies = (enemiesJson as unknown as { enemies: { id: string; mechanic?: unknown }[] })
  .enemies;
type MapDef = {
  collision: { fromGid: number; toGid: number };
  encounters?: { id: string; enemyId: string }[];
  triggers?: { encounterId?: string; dialogueId?: string }[];
};
const maps = (mapsJson as unknown as { maps: Record<string, MapDef> }).maps;
const dialogueIds = new Set(
  JSON.stringify(dialogueJson)
    .match(/"id":"[^"]+"/g)!
    .map((m) => m.slice(6, -1)),
);
const FX = [
  'hitSpark',
  'critHit',
  'shieldBlock',
  'groundSlam',
  'splash',
  'waveCrash',
  'timeStop',
  'blinkIn',
  'blinkOut',
  'smite',
  'holyPillar',
  'soulRise',
  'poof',
  'stunned',
  'curse',
  'frostNova',
];

function mapOf(enemyId: string): [string, MapDef] {
  const hit = Object.entries(maps).find(([, m]) =>
    (m.encounters ?? []).some((e) => e.enemyId === enemyId),
  );
  if (!hit) throw new Error(`no map for ${enemyId}`);
  return hit;
}

type Tilemap = { width: number; layers: { name: string; data?: number[] }[] };
const TILEMAPS: Record<string, Tilemap> = {
  map_coastal_town: townTm as unknown as Tilemap,
  map_old_lighthouse: lighthouseTm as unknown as Tilemap,
  map_ch1_bell_sanctum: bellTm as unknown as Tilemap,
  map_ch2_verdict_sanctum: verdictTm as unknown as Tilemap,
};

function solid(mapId: string, map: MapDef, x: number, y: number): boolean {
  const tm = TILEMAPS[mapId];
  if (!tm) throw new Error(`add ${mapId} to TILEMAPS`);
  const walls = tm.layers.find((l) => l.name === 'Walls') ?? tm.layers[1];
  const gid = walls.data![y * tm.width + x];
  return gid >= map.collision.fromGid && gid <= map.collision.toGid;
}

describe('T-84 bosses on their maps', () => {
  it('covers the Prologue to Chapter 2 bosses', () => {
    const ids = bosses.map((b) => b.id);
    for (const id of [
      'boss_time_wraith',
      'boss_drowned_sentinel',
      'boss_sunken_bellkeeper',
      'boss_imperial_verdict',
    ])
      expect(ids).toContain(id);
  });

  for (const b of bosses) {
    it(`${b.id}: the meeting leads into the fight, targets stand on open floor, effects exist`, () => {
      expect(enemies.some((e) => e.id === b.id)).toBe(true);
      const [mapId, map] = mapOf(b.id);
      const enc = map.encounters!.find((e) => e.enemyId === b.id)!;
      expect((map.triggers ?? []).some((t) => t.encounterId === enc.id && t.dialogueId)).toBe(true);
      for (const t of b.defense.targets ?? [])
        expect(solid(mapId, map, t.tile.x, t.tile.y), `${t.id} on a wall`).toBe(false);
      for (const m of Object.values(b.moves)) if (m.fx) expect(FX).toContain(m.fx);
      for (const s of b.defense.sentences?.list ?? []) if (s.fx) expect(FX).toContain(s.fx);
      if (b.rescue) {
        expect(dialogueIds.has(b.rescue.dialogueId)).toBe(true);
        if (b.rescue.flashDialogueId) expect(dialogueIds.has(b.rescue.flashDialogueId)).toBe(true);
      }
    });
  }

  it('the Bellkeeper locks go cord → gear → last chime', () => {
    const t = bosses.find((b) => b.id === 'boss_sunken_bellkeeper')!.defense.targets!;
    expect(t.map((x) => x.effect)).toEqual(['stun', 'progress', 'breakArmor']);
    expect(t[1].requires).toEqual(['bell_cord']);
    expect(t[2].requires).toEqual(['tide_gear']);
  });

  it('the Verdict sentences: endure cracks at the end, hit cracks at once, else lapse', () => {
    expect(sentenceVerdict({ defy: 'endure' }, false, false)).toBe('hold');
    expect(sentenceVerdict({ defy: 'endure' }, false, true)).toBe('crack');
    expect(sentenceVerdict({ defy: 'hit' }, true, false)).toBe('crack');
    expect(sentenceVerdict({ defy: 'hit' }, false, true)).toBe('lapse');
    const s = bosses.find((b) => b.id === 'boss_imperial_verdict')!.defense.sentences!;
    expect(s.cracksToBreak).toBe(3);
    expect(s.list.map((x) => x.defy).sort()).toEqual(['endure', 'hit']);
  });
});
