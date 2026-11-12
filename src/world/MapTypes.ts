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
  /** The rule applies only while this flag is NOT set. */
  unlessFlag?: string;
  /** The rule applies only while Peter carries this item (puzzle objects, letters to deliver). */
  ifItem?: string;
  /** The rule applies only while Peter does NOT carry this item. */
  unlessItem?: string;
  dialogueId: string;
}

/** Present only while `flag` is set (if given) and `unlessFlag` is not (if given). */
export interface FlagCondition {
  flag?: string;
  unlessFlag?: string;
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
  /** Spawned only when the condition holds on entering the map. */
  visibleWhen?: FlagCondition;
  /** Keeps moving while the map is frozen (e.g. the Elder). */
  resistsFreeze?: boolean;
  /** Recolours a reused sprite, e.g. "#c8c8d0" (silver hair) or a spirit's cold blue. */
  tint?: string;
  /** 0-1, e.g. 0.6 for a fading spirit. */
  alpha?: number;
}

export interface MapInteractableDefinition {
  id: string;
  tile: TilePoint;
  radius: number;
  prompt: string;
  dialogueId: string;
  dialogueRules?: DialogueRule[];
  completeObjective?: QuestObjectiveRef;
  /** Only interactable once this flag is set. */
  requiresFlag?: string;
  /** Registered only when the condition holds on entering the map. */
  visibleWhen?: FlagCondition;
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
  /** Not placed on the map: started only by a trigger's `encounterId` (scripted battles). */
  hidden?: boolean;
  /** Spawned only when the condition holds on entering the map. */
  visibleWhen?: FlagCondition;
}

/**
 * A small enemy fought in real time on the map (bosses stay turn-based encounters). It patrols near
 * its tile, chases Peter on sight and gives up past its leash. Respawns when the map is re-entered
 * unless `respawn: false` (then `defeatedFlag` keeps it gone).
 */
export interface MapRoamerDefinition {
  id: string;
  /** Id in enemies.json (HP, attack, defense, EXP, loot). */
  enemyId: string;
  texture: string;
  anim?: string;
  tile: TilePoint;
  /** All roamers of a group defeated → flag `cleared_<group>` (quest objectives). */
  group?: string;
  respawn?: boolean;
  defeatedFlag?: string;
  /** Spawned only when the condition holds on entering the map. */
  visibleWhen?: FlagCondition;
  /** Overrides of player.json `action.enemy`. */
  sight?: number;
  leash?: number;
  patrolRadius?: number;
  speed?: number;
  /** Scripted ambush: cannot be hurt, cannot defeat Peter; at 1 HP this dialogue opens. */
  ambush?: { rescueDialogueId: string };
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
  /** Set when the trigger fires; a trigger never fires twice (required unless `repeat`). */
  onceFlag?: string;
  /** Fires every time Peter enters the area (e.g. a Continuum loop), no once-flag. */
  repeat?: boolean;
  requiresFlag?: string;
  /** Does not fire while this flag is set (e.g. the loop is broken). */
  unlessFlag?: string;
  /** Sends Peter back to this spawn of the same map (short fade) — the path "loops". */
  teleportTo?: string;
  delayMs?: number;
  effects?: DialogueEffects;
  dialogueId?: string;
  /** Encounter (by id, in this map) started when the trigger's dialogue closes. */
  encounterId?: string;
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
  roamers?: MapRoamerDefinition[];
  exits?: MapExitDefinition[];
  triggers?: MapTriggerDefinition[];
  visions?: MapVisionDefinition[];
  /**
   * "Time has stopped" state: while the condition holds, NPCs stand still, tinted cold, the music
   * stops and a cold veil covers the map.
   */
  frozenWhen?: FlagCondition;
  /**
   * Alternative tile layers by state, first match wins — e.g. a low-tide Walls layer once
   * `tide_lowered` is set. Layer names must exist in the tilemap.
   */
  layerVariants?: { when: FlagCondition; ground?: string; walls?: string }[];
  /** Light over the whole map, e.g. an endless sunset: { color: "#ff8a3c", alpha: 0.12 }. */
  ambient?: { color: string; alpha: number };
  /** Chapter this map belongs to (0 = Prologue) — chooses the end card. */
  chapter?: number;
}

export interface MapDatabase {
  startMapId: string;
  maps: Record<string, MapDefinition>;
}
