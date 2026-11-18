import type { PixelFxLayer } from '../../systems/fx/PixelFxLayer';
import Phaser from 'phaser';
import { type Point, type RoamerBrain } from '../../systems/action/ActionRules';
import { type ShotTarget } from '../../systems/action/ShotSystem';
import type { IEnemyDefinition } from '../../systems/combat/CombatTypes';
import { type PeterMove } from '../Chapter8Rules';
import { type Ch9FieldTraits } from '../Chapter9Rules';
import type { MapRoamerDefinition } from '../MapTypes';

export const f9 = (r: { enemy: IEnemyDefinition }): Ch9FieldTraits =>
  (r.enemy.field ?? {}) as Ch9FieldTraits;

export interface CombatExtension {
  /** True when the slash touched something of the fight (boss or arena target). */
  onSlash(
    origin: Point,
    aim: number,
    reach: number,
    blow: { attack: number; arcDeg: number; mult: number; critBonus: number; echoPct: number },
  ): boolean;
  onSkill(origin: Point, radius: number, attack: number): void;
  /** Gear thorns: Peter's armour hurts the boss back by `damage`. */
  onThorns?(damage: number): void;
  /**
   * An Authority skill's blow over an area (2026-11-18): the boss takes `attack` × `mult` (less its
   * defence) when it stands within `radius`; `slowMs` slows it. True when it was hit.
   */
  onArea?(
    origin: Point,
    radius: number,
    attack: number,
    mult: number,
    opts?: { slowMs?: number },
  ): boolean;
  shotTargets(attack: number, mult: number): ShotTarget[];
  /** Peter swung, shot, used Temporal Strike or dodged (hit or not). */
  onAction?(kind: PeterAct): void;
  /** A move the fight forbids right now (Faceless Keeper's memory lock): the message, else null. */
  blocked?(kind: PeterAct): string | null;
  /** Fists allowed in this fight (no blade yet): reach and damage factor. */
  unarmed?(): { reach: number; mult: number } | null;
}

export type PeterAct = 'slash' | 'shot' | 'skill' | 'dash';

export interface ActionHost {
  /** Input and AI pause (dialogue, bag, map transition). */
  isPaused(): boolean;
  onPlayerDefeated(): void;
  /** A scripted ambush brought Peter to 1 HP: open the rescue dialogue. */
  onAmbushRescue(dialogueId: string): void;
  notify(title: string, subtitle: string): void;
  refreshHud(): void;
  /** Quest harassers appeared (once per batch). */
  onHunted?(): void;
  /** The scene's shared pixelfx layer (combat animation). */
  pfx?(): PixelFxLayer;
}

export interface Roamer {
  def: MapRoamerDefinition;
  enemy: IEnemyDefinition;
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  brain: RoamerBrain;
  alive: boolean;
  /** Knockback in progress until this time (AI paused). */
  stunUntil: number;
  /** Continuum's tide: moves at (1 - slowPct) of its speed until then. */
  slowUntil?: number;
  slowPct?: number;
  /** Finality's burn: `left` ticks of `damage`, one every `every` ms. */
  burn?: { left: number; every: number; next: number; damage: number };
  /** Struck: the body flinches until then (T-85 motion). */
  flinchUntil?: number;
  /** Path finding: next tile centre to walk to, and when to recompute it. */
  waypoint: Point | null;
  pathAt: number;
  speed: number;
  sight: number;
  leash: number;
  patrolRadius: number;
  /** Direction it faces (radians): where it walks, or toward Peter when winding up. */
  facing: number;
  /** Phase shift of the reflect glow, so a group does not glow in sync. */
  glowOffset: number;
  glowShown: boolean;
  /** A harmless 1-HP decoy (no rewards). */
  clone?: boolean;
  /** Decoys already split off. */
  cloned?: boolean;
  /** Next time it may leave a pool. */
  nextPool?: number;
  /** A decoy's health bar copies its source's, so the bar does not give it away. */
  shownRatio?: number;
  /** Ghost Sniper: shot in flight (fires at `fireAt`) and when it may aim again. */
  aim?: { fireAt: number } | null;
  nextAimAt?: number;
  /** Banner Carrier: the verse it last sang. */
  verse?: number;
  /** Fell near a Banner Carrier: lies there until the next verse raises it (or it is final). */
  pending?: boolean;
  /** Undying Knight's charge. */
  charge?: {
    phase: 'stomp' | 'run' | 'stunned';
    until: number;
    dx: number;
    dy: number;
    hit: boolean;
  };
  nextChargeAt?: number;
  /** Shifted into the other branch by Kuro until then (cannot act or be hit). */
  shiftedUntil?: number;
  /** When it appeared (cocoons hatch after a while). */
  bornAt?: number;
  /** Gardener's cut in progress. */
  cut?: { at: number; ang: number; from: Point } | null;
  nextCutAt?: number;
  /** Heel Shadow: next strike. */
  nextStrikeAt?: number;
  /** Twin Star: the two orbs and when each was last hit alone. */
  orbs?: Phaser.GameObjects.Image[];
  orbHitAt?: [number, number];
  /** Origin Nullifier: ring in progress (started at) and whether it already met Peter. */
  ringAt?: number | null;
  ringDone?: boolean;
  nextRingAt?: number;
  /** Archon Construct: laser in progress. */
  laser?: { at: number; from: Point; to: Point; fired: boolean } | null;
  nextLaserAt?: number;
  /** Hollow Husk: frozen while Peter stands still. */
  frozen?: boolean;
  /** Name Eater: breath in progress. */
  inhaleAt?: number | null;
  nextInhaleAt?: number;
  /** Erasure Moths: closing in since. */
  swarmAt?: number | null;
  nextSwarmAt?: number;
  /** Ink Hound: already bit during this pause. */
  bit?: boolean;
  /** Void Inquisitor: chain circles in progress. */
  chains?: { at: number; centers: Point[] } | null;
  nextChainAt?: number;
  /** Assimilator: the move it has learned. */
  learned?: PeterMove | null;
  /** Doom Bell: when this toll cycle began (null = silent) and whether its wave already hit. */
  bellAt?: number | null;
  bellHit?: boolean;
  /** Second-Hand Warden: hand start, stopped until, hits landed in a row, last hand touch. */
  sweepAt?: number;
  sweepStopUntil?: number;
  sweepHits?: number;
  sweepTouchAt?: number;
  /** Nexus Sentinel: the thrust in progress (start, locked line) and its cooldown. */
  thrust?: { at: number; from: Point; to: Point; hit: boolean } | null;
  nextThrustAt?: number;
  /** Nexus Inquisitor: when the current four-blow chain began and the last blow already struck. */
  chainAt?: number | null;
  chainBeat?: number;
}

export const ELDER_FLAG = 'elder_joined';

export const ELDER_PARTED_FLAG = 'elder_parted';

export const KURO_FLAG = 'kuro_with_peter';

export const KURO_LEFT_FLAG = 'kuro_left';

export const KURO_SHIFT_MS = 15000;

export const COMPANIONS: [string, string][] = [
  ['ch8_with_neris', 'npc_neris'],
  ['ch8_with_lyra', 'npc_lyra'],
  ['ch8_with_ivo', 'npc_ivo'],
];
