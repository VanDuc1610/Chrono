import { describe, expect, it } from 'vitest';
import bossesJson from '../public/assets/data/bosses.json';
import enemiesJson from '../public/assets/data/enemies.json';
import mapsJson from '../public/assets/data/maps.json';
import dialogueJson from '../public/assets/data/dialogue.json';
import townTm from '../public/assets/maps/map_coastal_town.json';
import lighthouseTm from '../public/assets/maps/map_old_lighthouse.json';
import bellTm from '../public/assets/maps/map_ch1_bell_sanctum.json';
import verdictTm from '../public/assets/maps/map_ch2_verdict_sanctum.json';
import ch3memoryvaultsTm from '../public/assets/maps/map_ch3_memory_vaults.json';
import ch3choirsanctumTm from '../public/assets/maps/map_ch3_choir_sanctum.json';
import ch4crimsonredoubtTm from '../public/assets/maps/map_ch4_crimson_redoubt.json';
import ch4sanctumoffinalityTm from '../public/assets/maps/map_ch4_sanctum_of_finality.json';
import ch5prunertowerTm from '../public/assets/maps/map_ch5_pruner_tower.json';
import ch5kuroasksTm from '../public/assets/maps/map_ch5_kuro_asks.json';
import ch5unbornthroneTm from '../public/assets/maps/map_ch5_unborn_throne.json';
import heraldTm from '../public/assets/maps/map_ch6_herald_roost.json';
import nookTm from '../public/assets/maps/map_ch6_first_forgotten_nook.json';
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
  map_ch6_herald_roost: heraldTm as unknown as Tilemap,
  map_ch6_first_forgotten_nook: nookTm as unknown as Tilemap,
  map_ch3_memory_vaults: ch3memoryvaultsTm as unknown as Tilemap,
  map_ch3_choir_sanctum: ch3choirsanctumTm as unknown as Tilemap,
  map_ch4_crimson_redoubt: ch4crimsonredoubtTm as unknown as Tilemap,
  map_ch4_sanctum_of_finality: ch4sanctumoffinalityTm as unknown as Tilemap,
  map_ch5_pruner_tower: ch5prunertowerTm as unknown as Tilemap,
  map_ch5_kuro_asks: ch5kuroasksTm as unknown as Tilemap,
  map_ch5_unborn_throne: ch5unbornthroneTm as unknown as Tilemap,
};

function solid(mapId: string, map: MapDef, x: number, y: number): boolean {
  const tm = TILEMAPS[mapId];
  if (!tm) throw new Error(`add ${mapId} to TILEMAPS`);
  const walls = tm.layers.find((l) => l.name === 'Walls') ?? tm.layers[1];
  const gid = walls.data![y * tm.width + x];
  return gid >= map.collision.fromGid && gid <= map.collision.toGid;
}

describe('T-84 bosses on their maps', () => {
  it('covers the Prologue to Chapter 5 bosses', () => {
    const ids = bosses.map((b) => b.id);
    for (const id of [
      'boss_time_wraith',
      'boss_drowned_sentinel',
      'boss_sunken_bellkeeper',
      'boss_imperial_verdict',
      'boss_faceless_keeper',
      'boss_nameless_choir',
      'boss_crimson_standard',
      'boss_the_last_war',
      'boss_other_peter',
      'boss_kuro_duel',
      'boss_unborn_king',
    ])
      expect(ids).toContain(id);
  });

  for (const b of bosses) {
    it(`${b.id}: the meeting leads into the fight, targets stand on open floor, effects exist`, () => {
      expect(enemies.some((e) => e.id === b.id)).toBe(true);
      const [mapId, map] = mapOf(b.id);
      const enc = map.encounters!.find((e) => e.enemyId === b.id)!;
      // The meeting dialogue leads into the fight; a boss with no meeting is fought on touch.
      const meeting = (map.triggers ?? []).some((t) => t.encounterId === enc.id && t.dialogueId);
      const anyTrigger = (map.triggers ?? []).some(
        (t) =>
          !!(t as { area?: unknown }).area &&
          !!t.dialogueId &&
          /confront|arrival/.test(t.dialogueId),
      );
      expect(meeting || (!anyTrigger && !(enc as { hidden?: boolean }).hidden)).toBe(true);
      for (const t of b.defense.targets ?? []) {
        if (t.orbit) continue;
        expect(t.tile, `${t.id} needs a tile or an orbit`).toBeDefined();
        expect(solid(mapId, map, t.tile!.x, t.tile!.y), `${t.id} on a wall`).toBe(false);
      }
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

  it('songs name targets that exist; the ritual ends on its finality pillar', () => {
    for (const b of bosses.filter((x) => x.defense.songs)) {
      const ids = new Set((b.defense.targets ?? []).map((t) => t.id));
      for (const s of b.defense.songs!.list) expect(ids.has(s.targetId)).toBe(true);
    }
    const war = bosses.find((b) => b.id === 'boss_the_last_war')!;
    const pillars = war.defense.targets!;
    expect(pillars.every((p) => p.hidden)).toBe(true);
    expect(pillars.at(-1)!.effect).toBe('finality');
    expect(war.defense.wrongOrder).toBeDefined();
  });

  it('Alpha Peter answers Temporal Strike with a move he has; the letter ends the fight', () => {
    const a = bosses.find((b) => b.id === 'boss_other_peter')!;
    expect(a.moves[a.mirror!.skillMove]).toBeDefined();
    expect(a.finisher!.itemId).toBe('letter_to_daughter');
  });
});
