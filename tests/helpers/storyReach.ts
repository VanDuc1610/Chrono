/**
 * Story reachability (QA, 2026-11-18): from a New Game, follow every way the data lets the story
 * move — exits, NPCs and their dialogue rules, objects, triggers, encounters and roamers, dials,
 * scales, beams, strike targets, visions, boss finishers, dialogue effects (flags, items, quests,
 * warps, timers, chapter ends) and the chapter end cards — until nothing new can happen.
 *
 * It is optimistic: an `unlessFlag` never blocks (the flag was unset at some point), every branch
 * of a dialogue is taken, a group of roamers is cleared once one of them can appear. So it finds
 * hard blockers — a flag, item, quest or map that the story needs but nothing can ever give — not
 * ordering mistakes.
 */
import { dialFlag } from '../../src/world/PuzzleRules';
import { NEXT_START } from '../../src/state/ChapterFlow';

type Json = Record<string, unknown>;
type Rule = {
  ifFlag?: string;
  ifFlags?: string[];
  ifItem?: string;
  ifItems?: string[];
  ifQuestCompleted?: string;
  dialogueId?: string;
};
interface Obj {
  id?: string;
  dialogueId?: string;
  dialogueRules?: Rule[];
  visibleWhen?: { flag?: string };
  requiresFlag?: string;
  requiresItems?: string[];
  completeObjective?: { questId: string; objectiveId: string };
}

export interface StoryData {
  startMapId: string;
  maps: Record<string, Json>;
  dialogues: Json[];
  quests: Json[];
  bosses: Record<string, Json>;
}

export interface StoryReach {
  flags: Set<string>;
  items: Set<string>;
  maps: Set<string>;
  dialogues: Set<string>;
  questsStarted: Set<string>;
  questsDone: Set<string>;
  chaptersEnded: Set<number>;
  /** Flags some condition asks for that nothing in reach sets: [flag, where it is needed]. */
  missingFlags: [string, string][];
  /** Dialogue ids referenced from reachable places that do not exist. */
  missingDialogues: string[];
}

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function storyReach(data: StoryData): StoryReach {
  const nodes = new Map<string, Json>(data.dialogues.map((d) => [String(d.id), d]));
  const flags = new Set<string>();
  const items = new Set<string>();
  const maps = new Set<string>([data.startMapId]);
  const dialogues = new Set<string>();
  // Quests that a New Game already has running (`stage: started` in quests.json).
  const questsStarted = new Set<string>(
    data.quests.filter((q) => q.stage === 'started').map((q) => String(q.id)),
  );
  const questsDone = new Set<string>();
  const objectivesDone = new Set<string>();
  const chaptersEnded = new Set<number>();
  const missingDialogues = new Set<string>();
  /** Everything a condition asked for, with the first place it was asked. */
  const wanted = new Map<string, string>();

  const want = (flag: string | undefined, where: string): boolean => {
    if (!flag) return true;
    if (!wanted.has(flag)) wanted.set(flag, where);
    return flags.has(flag);
  };
  const ruleHolds = (r: Rule, where: string): boolean =>
    want(r.ifFlag, where) &&
    arr<string>(r.ifFlags).every((f) => want(f, where)) &&
    (!r.ifItem || items.has(r.ifItem)) &&
    arr<string>(r.ifItems).every((i) => items.has(i)) &&
    (!r.ifQuestCompleted || questsDone.has(r.ifQuestCompleted));
  const visible = (o: Obj, where: string): boolean =>
    want(o.visibleWhen?.flag, where) &&
    want(o.requiresFlag, where) &&
    arr<string>(o.requiresItems).every((i) => items.has(i));

  let changed = true;
  const set = (f: string): void => {
    if (!flags.has(f)) {
      flags.add(f);
      changed = true;
    }
  };
  const give = (i: string): void => {
    if (!items.has(i)) {
      items.add(i);
      changed = true;
    }
  };
  const reachMap = (m: string): void => {
    if (!maps.has(m)) {
      maps.add(m);
      changed = true;
    }
  };
  const startQuest = (q: string): void => {
    if (!questsStarted.has(q)) {
      questsStarted.add(q);
      changed = true;
    }
  };

  /** Walks a conversation from `id`, applying every node's effects on every branch. */
  const talk = (id: string | undefined): void => {
    if (!id || dialogues.has(id)) return;
    const node = nodes.get(id);
    if (!node) {
      missingDialogues.add(id);
      return;
    }
    dialogues.add(id);
    changed = true;
    const e = (node.effects ?? {}) as Json;
    for (const f of arr<string>(e.setFlags)) set(f);
    for (const g of arr<{ itemId: string }>(e.grantItems)) give(g.itemId);
    if (typeof e.grantOnceFlag === 'string') set(e.grantOnceFlag);
    if (typeof e.startQuest === 'string') startQuest(e.startQuest);
    if (e.warpTo && typeof e.warpTo === 'object') reachMap(String((e.warpTo as Json).mapId));
    if (e.startTimer && typeof e.startTimer === 'object') set(String((e.startTimer as Json).flag));
    if (e.endPrologue) endChapter(0);
    if (typeof e.endChapter === 'number') endChapter(e.endChapter);
    for (const r of arr<Json>(node.responses)) talk(r.nextDialogueId as string | undefined);
  };
  const endChapter = (n: number): void => {
    if (chaptersEnded.has(n)) return;
    chaptersEnded.add(n);
    set(n === 0 ? 'isPrologueComplete' : `chapter${n}_complete`);
    const next = NEXT_START[n];
    if (next) reachMap(next.mapId);
  };
  const interact = (o: Obj, where: string): void => {
    if (!visible(o, where)) return;
    talk(o.dialogueId);
    for (const r of o.dialogueRules ?? []) if (ruleHolds(r, where)) talk(r.dialogueId);
    const obj = o.completeObjective?.objectiveId;
    if (obj && !objectivesDone.has(obj)) {
      objectivesDone.add(obj);
      changed = true;
    }
  };

  while (changed) {
    changed = false;
    for (const mapId of [...maps]) {
      const m = data.maps[mapId];
      if (!m) continue;
      const where = (kind: string, id?: string): string => `${mapId} ${kind}${id ? ` ${id}` : ''}`;
      for (const x of arr<Json & { toMap: string }>(m.exits)) {
        // A locked exit can still open a dialogue (e.g. prying the catacomb hatch open).
        talk(x.lockedDialogueId as string | undefined);
        if (want(x.requiresFlag as string | undefined, where('exit', x.id as string)))
          reachMap(x.toMap);
      }
      for (const n of arr<Obj>(m.npcs)) interact(n, where('npc', n.id));
      for (const n of arr<Obj>(m.interactables)) interact(n, where('object', n.id));
      for (const v of arr<Obj>(m.visions)) talk(v.dialogueId);
      for (const t of arr<Json>(m.triggers)) {
        if (!want(t.requiresFlag as string | undefined, where('trigger', t.id as string))) continue;
        if (typeof t.onceFlag === 'string') set(t.onceFlag);
        const e = (t.effects ?? {}) as Json;
        for (const f of arr<string>(e.setFlags)) set(f);
        if (typeof e.startQuest === 'string') startQuest(e.startQuest);
        if (t.teleportTo && typeof t.teleportTo === 'object')
          reachMap(String((t.teleportTo as Json).mapId ?? mapId));
        talk(t.dialogueId as string | undefined);
        if (typeof t.encounterId === 'string') {
          const enc = arr<Json>(m.encounters).find((x) => x.id === t.encounterId);
          if (enc) defeat(enc, mapId);
        }
      }
      for (const enc of arr<Json>(m.encounters))
        if (visible(enc as Obj, where('encounter', enc.id as string))) defeat(enc, mapId);
      const groups = new Set<string>();
      for (const r of arr<Json>(m.roamers)) {
        if (!visible(r as Obj, where('roamer', r.id as string))) continue;
        if (typeof r.defeatedFlag === 'string') set(r.defeatedFlag);
        if (typeof r.group === 'string') groups.add(r.group);
      }
      for (const g of groups) set(`cleared_${g}`);
      for (const d of arr<Json & { values: { key: string }[] }>(m.dials))
        if (visible(d as Obj, where('dial', d.id as string)))
          for (const v of d.values) set(dialFlag(String(d.id), v.key));
      for (const c of arr<Rule & { unlessFlag?: string }>(m.dialChecks))
        if (ruleHolds(c, where('dial check'))) talk(c.dialogueId);
      for (const s of arr<Json>(m.scales)) {
        talk(s.balancedDialogueId as string | undefined);
        talk(s.overloadDialogueId as string | undefined);
      }
      for (const b of arr<Json>(m.beams)) {
        if (typeof b.solvedFlag === 'string') set(b.solvedFlag);
        talk(b.solvedDialogueId as string | undefined);
      }
      for (const s of arr<Json>(m.strikeTargets)) {
        for (const f of arr<string>(s.setFlags)) set(f);
        if (typeof s.doneFlag === 'string') set(s.doneFlag);
        talk(s.dialogueId as string | undefined);
      }
      if (m.branches) {
        set(`branch_${mapId}_living`);
        set(`branch_${mapId}_pruned`);
      }
      // Opening the satchel on Kuro's quiz map (ExplorationScene.toggleInventory).
      if (mapId === 'map_ch5_kuro_asks') set('ch5_opened_ledger_quiz');
    }
    // Quests: done once every objective is (by flag or by an interaction).
    for (const q of data.quests) {
      const id = String(q.id);
      if (!questsStarted.has(id) || questsDone.has(id)) continue;
      const done = arr<Json>(q.objectives).every(
        (o) =>
          (typeof o.completeOnFlag === 'string' && flags.has(o.completeOnFlag)) ||
          objectivesDone.has(String(o.id)),
      );
      if (done) {
        questsDone.add(id);
        changed = true;
        if (typeof q.followUpQuestId === 'string') startQuest(q.followUpQuestId);
        for (const it of arr<{ itemId: string }>((q.rewards as Json | undefined)?.items))
          give(it.itemId);
      }
    }
  }

  function defeat(enc: Json, mapId: string): void {
    if (typeof enc.defeatedFlag === 'string') set(enc.defeatedFlag);
    talk(enc.victoryDialogueId as string | undefined);
    for (const r of arr<Rule>(enc.victoryDialogueRules))
      if (ruleHolds(r, `${mapId} victory ${String(enc.id)}`)) talk(r.dialogueId);
    // Boss finishers and rescues (bosses.json) can set flags and open dialogues.
    const p = data.bosses[String(enc.enemyId)];
    if (!p) return;
    const walk = (v: unknown): void => {
      if (Array.isArray(v)) return v.forEach(walk);
      if (!v || typeof v !== 'object') return;
      for (const [k, x] of Object.entries(v as Json)) {
        if ((k === 'setFlag' || k === 'pinSetFlag') && typeof x === 'string') set(x);
        else if ((k === 'dialogueId' || k === 'flashDialogueId') && typeof x === 'string') talk(x);
        else walk(x);
      }
    };
    walk(p);
  }

  const missingFlags = [...wanted.entries()].filter(([f]) => !flags.has(f));
  return {
    flags,
    items,
    maps,
    dialogues,
    questsStarted,
    questsDone,
    chaptersEnded,
    missingFlags,
    missingDialogues: [...missingDialogues],
  };
}
