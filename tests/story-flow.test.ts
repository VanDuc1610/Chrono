import { describe, expect, it } from 'vitest';
import mapsJson from '../public/assets/data/maps.json';
import dialogueJson from '../public/assets/data/dialogue.json';
import questsJson from '../public/assets/data/quests.json';
import bossesJson from '../public/assets/data/bosses.json';
import { storyReach, type StoryData } from './helpers/storyReach';

type Json = Record<string, unknown>;
const maps = mapsJson as unknown as { startMapId: string; maps: Record<string, Json> };
const bosses = (bossesJson as unknown as { bosses: Json[] }).bosses;

const data: StoryData = {
  startMapId: maps.startMapId,
  maps: maps.maps,
  dialogues: Object.values(
    (dialogueJson as unknown as { dialogues: Record<string, Json> }).dialogues,
  ),
  quests: (questsJson as unknown as { quests: Json[] }).quests,
  bosses: Object.fromEntries(bosses.map((b) => [String(b.id), b])),
};
const reach = storyReach(data);

/**
 * Flags a condition asks for that no data can set, reviewed one by one: each is set by code or
 * kept only for old saves. A new one here means a blocker (or a new code-set flag to list).
 */
const KNOWN_UNSET: string[] = [
  // The bell sanctum's north door only says the seal must be restored first; restoring it ends
  // Chapter 1 and the end card carries Peter to Chapter 2 (the door leads back to the sanctum).
  'chapter2_open',
];

/**
 * Dialogues nothing opens (2026-11-18 review): text left from earlier designs of those places,
 * kept for now. A new id here means a dialogue that was written but never wired.
 */
const LEFTOVER_DIALOGUES = [
  'elder_explains_frozen_town',
  'poi_forest_shade_remains',
  'ch4_courier_box_inspect',
  'ch4_beacon_tower_inspect',
  'ch4_mound_north',
  'ch4_mound_east',
  'ch4_mound_west',
  'ch4_mound_center',
  'ch4_ritual_pillar_1',
  'ch4_ritual_pillar_2',
  'ch4_ritual_pillar_3',
  'ch5_shore_exit_locked',
  'ch5_bridge_fall',
  'ch5x_chimes_missing',
  'ch5x_altar_willow',
  'ch5x_altar_ring',
  'ch6_stairs_exit_note',
  'ch7_drop_exit_note',
  'ch9_c06_wrong',
  'ch9_c09_wrong',
  'ch9_sixfold_phase_2_intro',
  'ch9_sixfold_phase_2_allies',
  'ch9_c13_wrong',
  'ch9_wrong_generic',
  'ch9_pillar_flip',
];

describe('the whole story from a New Game (data reachability)', () => {
  it('ends the Prologue and every chapter 1-9', () => {
    expect([...reach.chaptersEnded].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('can reach all four Chapter 9 endings', () => {
    for (const e of ['order', 'unbound', 'true', 'returned_page'])
      expect(reach.flags.has(`ch9_ending_${e}`), e).toBe(true);
  });

  it('reaches every map', () => {
    const unreached = Object.keys(data.maps).filter((m) => !reach.maps.has(m));
    expect(unreached).toEqual([]);
  });

  it('can finish every main quest it starts', () => {
    const main = data.quests.filter((q) => q.kind === 'main').map((q) => String(q.id));
    const stuck = main.filter((q) => reach.questsStarted.has(q) && !reach.questsDone.has(q));
    expect(stuck).toEqual([]);
    const neverStarted = main.filter((q) => !reach.questsStarted.has(q));
    expect(neverStarted).toEqual([]);
  });

  it('never asks for a flag that nothing can set', () => {
    const missing = reach.missingFlags
      .filter(([f]) => !KNOWN_UNSET.includes(f))
      .map(([f, where]) => `${f}  <- ${where}`);
    expect(missing).toEqual([]);
  });

  it('reaches every dialogue but the reviewed leftovers', () => {
    const unreached = data.dialogues
      .map((d) => String(d.id))
      .filter((id) => !reach.dialogues.has(id) && !LEFTOVER_DIALOGUES.includes(id));
    expect(unreached).toEqual([]);
  });

  it('never opens a dialogue that does not exist', () => {
    expect(reach.missingDialogues).toEqual([]);
  });
});
