import type {
  DialogueRule,
  FlagCondition,
  MapDatabase,
  MapDefinition,
  TilePoint,
  TileRect,
} from './MapTypes';

export const TILE_SIZE = 32;

/** Pixel centre of a tile. */
export function tileCenter(tile: TilePoint): { x: number; y: number } {
  return { x: tile.x * TILE_SIZE + TILE_SIZE / 2, y: tile.y * TILE_SIZE + TILE_SIZE / 2 };
}

/** Pixel rectangle covered by a tile rect. */
export function tileRectToPixels(r: TileRect): { x: number; y: number; w: number; h: number } {
  return { x: r.x * TILE_SIZE, y: r.y * TILE_SIZE, w: r.w * TILE_SIZE, h: r.h * TILE_SIZE };
}

export function pointInRect(px: number, py: number, r: TileRect): boolean {
  const p = tileRectToPixels(r);
  return px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h;
}

/** Resolves a map id or alias (old saves) to its definition; falls back to the start map. */
export function resolveMap(db: MapDatabase, id: string | null | undefined): MapDefinition {
  if (id) {
    const direct = db.maps[id];
    if (direct) return direct;
    const aliased = Object.values(db.maps).find((m) => m.aliases?.includes(id));
    if (aliased) return aliased;
  }
  const start = db.maps[db.startMapId];
  if (!start) throw new Error(`[maps] startMapId "${db.startMapId}" is not defined.`);
  return start;
}

/** First dialogue rule whose condition holds, else the default dialogue id. */
export function pickDialogue(
  defaultId: string,
  rules: DialogueRule[] | undefined,
  state: {
    isQuestCompleted(id: string): boolean;
    getFlag(flag: string): boolean;
    hasItem?(itemId: string): boolean;
  },
): string {
  const has = (id: string): boolean => state.hasItem?.(id) ?? false;
  for (const rule of rules ?? []) {
    if (rule.ifQuestCompleted && !state.isQuestCompleted(rule.ifQuestCompleted)) continue;
    if (rule.ifFlag && !state.getFlag(rule.ifFlag)) continue;
    if (rule.unlessFlag && state.getFlag(rule.unlessFlag)) continue;
    if (rule.ifItem && !has(rule.ifItem)) continue;
    if (rule.unlessItem && has(rule.unlessItem)) continue;
    if (rule.ifItems && !rule.ifItems.every(has)) continue;
    if (rule.ifFlags && !rule.ifFlags.every((f) => state.getFlag(f))) continue;
    return rule.dialogueId;
  }
  return defaultId;
}

/** True when `cond` is absent or holds for the current flags. */
export function conditionHolds(
  cond: FlagCondition | undefined,
  getFlag: (flag: string) => boolean,
): boolean {
  if (!cond) return true;
  if (cond.flag && !getFlag(cond.flag)) return false;
  if (cond.unlessFlag && getFlag(cond.unlessFlag)) return false;
  return true;
}

export interface MapReferenceSets {
  dialogueIds: Set<string>;
  questIds: Set<string>;
  enemyIds: Set<string>;
  /** questId -> objective ids */
  objectives: Map<string, Set<string>>;
}

/** Returns human-readable problems (empty when the database is consistent). */
export function validateMapDatabase(db: MapDatabase, refs: MapReferenceSets): string[] {
  const errors: string[] = [];
  const err = (map: string, msg: string): void => {
    errors.push(`${map}: ${msg}`);
  };
  if (!db.maps[db.startMapId]) errors.push(`startMapId "${db.startMapId}" is not defined`);

  for (const [key, map] of Object.entries(db.maps)) {
    if (map.id !== key) err(key, `id "${map.id}" does not match its key`);
    if (!map.spawns.default) err(key, 'missing spawns.default');
    const dialogue = (id: string | undefined, where: string): void => {
      if (id && !refs.dialogueIds.has(id)) err(key, `${where}: unknown dialogue "${id}"`);
    };
    const objective = (
      ref: { questId: string; objectiveId: string } | undefined,
      where: string,
    ) => {
      if (!ref) return;
      if (!refs.objectives.get(ref.questId)?.has(ref.objectiveId))
        err(key, `${where}: unknown objective ${ref.questId}/${ref.objectiveId}`);
    };
    for (const npc of map.npcs ?? []) {
      dialogue(npc.dialogueId, `npc ${npc.id}`);
      for (const r of npc.dialogueRules ?? []) {
        dialogue(r.dialogueId, `npc ${npc.id} rule`);
        if (r.ifQuestCompleted && !refs.questIds.has(r.ifQuestCompleted))
          err(key, `npc ${npc.id} rule: unknown quest "${r.ifQuestCompleted}"`);
      }
      objective(npc.completeObjective, `npc ${npc.id}`);
    }
    for (const it of map.interactables ?? []) {
      dialogue(it.dialogueId, `interactable ${it.id}`);
      for (const rule of it.dialogueRules ?? [])
        dialogue(rule.dialogueId, `interactable ${it.id} rule`);
      objective(it.completeObjective, `interactable ${it.id}`);
    }
    for (const enc of map.encounters ?? []) {
      if (!refs.enemyIds.has(enc.enemyId))
        err(key, `encounter ${enc.id}: unknown enemy "${enc.enemyId}"`);
      dialogue(enc.victoryDialogueId, `encounter ${enc.id}`);
    }
    for (const r of map.roamers ?? []) {
      if (!refs.enemyIds.has(r.enemyId)) err(key, `roamer ${r.id}: unknown enemy "${r.enemyId}"`);
      if (r.respawn === false && !r.defeatedFlag)
        err(key, `roamer ${r.id}: respawn false needs a defeatedFlag`);
      dialogue(r.ambush?.rescueDialogueId, `roamer ${r.id}`);
    }
    for (const vision of map.visions ?? []) dialogue(vision.dialogueId, `vision ${vision.id}`);
    for (const exit of map.exits ?? []) {
      const target = db.maps[exit.toMap];
      if (!target) err(key, `exit ${exit.id}: unknown map "${exit.toMap}"`);
      else if (!target.spawns[exit.toSpawn])
        err(key, `exit ${exit.id}: map "${exit.toMap}" has no spawn "${exit.toSpawn}"`);
      dialogue(exit.lockedDialogueId, `exit ${exit.id}`);
    }
    for (const trig of map.triggers ?? []) {
      if (trig.on === 'zone' && !trig.area)
        err(key, `trigger ${trig.id}: zone trigger needs an area`);
      dialogue(trig.dialogueId, `trigger ${trig.id}`);
      if (!trig.repeat && !trig.onceFlag)
        err(key, `trigger ${trig.id}: needs onceFlag (or repeat: true)`);
      if (trig.teleportTo && !map.spawns[trig.teleportTo])
        err(key, `trigger ${trig.id}: unknown spawn "${trig.teleportTo}"`);
      if (trig.encounterId && !(map.encounters ?? []).some((e) => e.id === trig.encounterId))
        err(key, `trigger ${trig.id}: unknown encounter "${trig.encounterId}"`);
      if (trig.effects?.startQuest && !refs.questIds.has(trig.effects.startQuest))
        err(key, `trigger ${trig.id}: unknown quest "${trig.effects.startQuest}"`);
    }
  }
  return errors;
}
