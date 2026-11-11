import type { DialogueEffects } from '../systems/dialogue/DialogueTypes';

/**
 * Data-driven world maps (public/assets/data/maps.json). Every coordinate is in tiles (32 px);
 * a TilePoint means the centre of that tile. No Phaser imports: validated in Node tests.
 */
export interface TilePoint {
  x: number;
  y: number;
}

/** Tile rectangle (inclusive origin, w × h tiles). */
export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface QuestObjectiveRef {
  questId: string;
  objectiveId: string;
}

/** Picks a dialogue by state; the first matching rule wins, else the NPC's `dialogueId`. */
export interface DialogueRule {
  ifQuestCompleted?: string;
  ifFlag?: string;
  dialogueId: string;
}

export interface MapNpcDefinition {
  id: string;
  /** Spritesheet key loaded in PreloadScene (32×32 frames). */
  texture: string;
  /** Looping animation key, if any (e.g. `npc_elder_idle`). */
  anim?: string;
  tile: TilePoint;
  name: string;
  prompt: string;
  radius: number;
  dialogueId: string;
  dialogueRules?: DialogueRule[];
  /** Objective completed on every talk (idempotent). */
  completeObjective?: QuestObjectiveRef;
}

export interface MapInteractableDefinition {
  id: string;
  tile: TilePoint;
  radius: number;
  prompt: string;
  dialogueId: string;
  completeObjective?: QuestObjectiveRef;
  /** Only interactable once this flag is set. */
  requiresFlag?: string;
}

export interface MapEncounterDefinition {
  id: string;
  /** Id in enemies.json. */
  enemyId: string;
  texture: string;
  anim?: string;
  tile: TilePoint;
  /** Flag set on victory; while set, the encounter is not spawned. */
  defeatedFlag: string;
  /** Square overlap hitbox in px (default 22). */
  hitbox?: number;
  /** Dialogue opened back on the map after winning (e.g. a released boss's last words). */
  victoryDialogueId?: string;
}

export interface MapExitDefinition {
  id: string;
  area: TileRect;
  toMap: string;
  toSpawn: string;
  /** Exit is closed until this flag is set. */
  requiresFlag?: string;
  /** Shown (once per visit to the area) while the exit is closed. */
  lockedDialogueId?: string;
}

export interface MapTriggerDefinition {
  id: string;
  /** `arrive`: on entering the map. `zone`: when Peter steps into `area`. */
  on: 'arrive' | 'zone';
  area?: TileRect;
  /** Set when the trigger fires; a trigger never fires twice in a playthrough. */
  onceFlag: string;
  requiresFlag?: string;
  delayMs?: number;
  effects?: DialogueEffects;
  dialogueId?: string;
}

/**
 * A fleeting apparition (Residual Existence): fades in while a given dialogue plays and dissolves
 * when it ends — e.g. the forgotten child nodding once its sandals are put back.
 */
export interface MapVisionDefinition {
  id: string;
  texture: string;
  anim?: string;
  tile: TilePoint;
  /** Dialogue node that summons it. */
  dialogueId: string;
}

export interface MapDefinition {
  id: string;
  /** Display name shown in the HUD. */
  name: string;
  /** Older ids that resolve to this map (e.g. ids stored in old saves). */
  aliases?: string[];
  tilemap: { key: string; path: string };
  tileset: { name: string; key: string; path: string };
  /** Tile layers: `ground` is drawn first, `walls` collides on GIDs [fromGid, toGid]. */
  layers: { ground: string; walls: string };
  collision: { fromGid: number; toGid: number };
  bgm: 'ambient' | 'battle';
  spawns: Record<string, TilePoint> & { default: TilePoint };
  /** Where Peter wakes after a defeat on this map (defaults to the default spawn). */
  revive?: TilePoint;
  npcs?: MapNpcDefinition[];
  interactables?: MapInteractableDefinition[];
  encounters?: MapEncounterDefinition[];
  exits?: MapExitDefinition[];
  triggers?: MapTriggerDefinition[];
  visions?: MapVisionDefinition[];
}

export interface MapDatabase {
  startMapId: string;
  maps: Record<string, MapDefinition>;
}
