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
  /** All of these items must be carried (e.g. three pigments). */
  ifItems?: string[];
  /** All of these flags must be set (e.g. three portrait pieces found). */
  ifFlags?: string[];
  dialogueId: string;
}

/**
 * Something on the map that Peter strikes with a slash (not E): e.g. a resonance pillar. When every
 * target of a group has been struck within `windowMs` of each other, the group completes.
 */
export interface MapStrikeTarget {
  id: string;
  tile: TilePoint;
  group: string;
  /** All targets of the group must be struck within this time (ms). */
  windowMs: number;
  /** Ignored once this flag is set (the puzzle is solved). */
  doneFlag: string;
  /** Flags set and dialogue opened when the group completes. */
  setFlags?: string[];
  dialogueId?: string;
  /** strings.json key floated over the target when struck alone. */
  hintKey?: string;
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
  /** Present only while this quest is active (it fades when the quest ends). */
  duringQuest?: string;
  /** Hunts Peter across the whole map (no sight / leash limit) — a quest harasser. */
  hunter?: boolean;
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
  /** Objects struck with a slash (resonance pillars). */
  strikeTargets?: MapStrikeTarget[];
  /**
   * Tiles that change with story flags, live (no reload): e.g. a mirror lighting up when aligned.
   * `index` is the 0-based tileset index; later entries win; tiles go back when the flag clears.
   */
  tileSwaps?: {
    when: FlagCondition;
    layer: 'ground' | 'walls';
    tiles: TilePoint[];
    index: number;
  }[];
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
  /**
   * Chapter 5 branch switching: flags `branch_<id>_pruned` / `branch_<id>_living` (exactly one
   * set); the dialogue effect toggleBranch flips them and rebuilds the map in place.
   */
  branches?: boolean;
  /** Where Peter lands when a timed tile vanishes under him (e.g. a shadow plank fading). */
  fallbackSpawn?: string;
  /** Dials turned with [E] (one value at a time); see src/world/PuzzleRules.ts. */
  dials?: MapDial[];
  /** Two-pan scales fed with sacks by the dialogue effect scalePut. */
  scales?: MapScale[];
  /** Arrow volleys falling on an area, telegraphed by shadows; cover tiles are safe. */
  volleys?: MapVolley[];
}

export interface MapDial {
  id: string;
  tile: TilePoint;
  radius?: number;
  /** Prompt shown near the dial, e.g. "[E] Xoay vòng Hướng". */
  prompt: string;
  values: { key: string; label: string }[];
  /** Only turnable once this flag is set / while the condition holds. */
  requiresFlag?: string;
  visibleWhen?: FlagCondition;
  /** Every one of these items must be carried to turn it (e.g. the four relics). */
  requiresItems?: string[];
}

export interface MapScale {
  id: string;
  weights: Record<string, number>;
  balanceAt: number;
  breakAbove: number;
  /** Opened after the sack that balances / overloads it; the sacks on it are used up. */
  balancedDialogueId: string;
  overloadDialogueId: string;
}

export interface MapVolley {
  /** Tile area the arrows fall on. */
  area: { x: number; y: number; w: number; h: number };
  everyMs: number;
  /** Shadow shown this long before the arrows land. */
  warnMs: number;
  /** Shots per volley (the first aims at Peter) and their radius in px. */
  shots: number;
  radius: number;
  damage: number;
  /** Tiles where Peter is sheltered (behind cover rocks). */
  cover: TilePoint[];
  /** The volleys stop for good once this flag is set. */
  untilFlag?: string;
}

export interface MapDatabase {
  startMapId: string;
  maps: Record<string, MapDefinition>;
}
