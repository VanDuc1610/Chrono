import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { FLAGS, type GameSession } from '../state/GameSession';
import {
  chantState,
  inParryWindow,
  sniperOutcome,
  distance,
  facingFromAngle,
  inSlash,
  isGlowing,
  shieldBlocks,
  newBrain,
  nextStep,
  resolveActionTuning,
  rollHit,
  thinkRoamer,
  type ActionTuning,
  type Point,
  type RoamerBrain,
} from '../systems/action/ActionRules';
import { SoundSystem } from '../systems/audio/SoundSystem';
import type { CombatTuning, IEnemyDefinition } from '../systems/combat/CombatTypes';
import type { Translate } from '../ui/Strings';
import { conditionHolds, tileCenter } from './MapRegistry';
import type { MapRoamerDefinition, MapStrikeTarget, TilePoint } from './MapTypes';
import { laserStage, ringCrosses, ringState, trailPosition, twinPaired } from './Chapter6Rules';
import {
  chainCenters,
  chainVerdict,
  figureEight,
  houndSolid,
  huskFrozen,
  huskPulls,
  tellStage,
} from './Chapter7Rules';
import {
  bellCrackable,
  bellState,
  inTickWindow,
  mimicCounters,
  mimicFrame,
  sweepAngle,
  tauntActive,
  wraithSolid,
  type PeterMove,
} from './Chapter8Rules';

/** What the exploration scene provides to the real-time combat layer. */
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
}

interface Roamer {
  def: MapRoamerDefinition;
  enemy: IEnemyDefinition;
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  brain: RoamerBrain;
  alive: boolean;
  /** Knockback in progress until this time (AI paused). */
  stunUntil: number;
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
}

const ELDER_FLAG = 'elder_joined';
const ELDER_PARTED_FLAG = 'elder_parted';
/** Chapter 5: Kuro walks and fights beside Peter until he leaves. */
const KURO_FLAG = 'kuro_with_peter';
const KURO_LEFT_FLAG = 'kuro_left';
const KURO_SHIFT_MS = 15000;
/** Chapter 8: the companion of the act walks with Peter and Kuro (flag → texture, latest first). */
const COMPANIONS: [string, string][] = [
  ['ch8_with_neris', 'npc_neris'],
  ['ch8_with_lyra', 'npc_lyra'],
  ['ch8_with_ivo', 'npc_ivo'],
];

/**
 * Real-time combat on the map: roaming enemies, Peter's slash (left click toward the cursor),
 * dodge (Shift), Temporal Strike (right click), the Elder fighting beside him.
 */
export class ActionCombat {
  public readonly roamers: Roamer[] = [];
  private readonly tuning: ActionTuning;
  private readonly combat: CombatTuning;
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly sound = SoundSystem.getInstance();
  private elder: Phaser.Physics.Arcade.Sprite | null = null;
  /** Chapter 8: the second ally (Ivo, Lyra or Neris). */
  private companion: Phaser.Physics.Arcade.Sprite | null = null;
  private nextCompanionHit = 0;
  private readonly defs: MapRoamerDefinition[];
  private nextSwing = 0;
  private nextDash = 0;
  private nextSkill = 0;
  private nextAllyHit = 0;
  private invulnUntil = 0;
  private defeated = false;
  private ambushFired = false;
  private hudMp = -1;
  /** When Peter last started a dodge (perfect dodge against snipers). */
  private lastDashAt = -Infinity;
  /** Sniper aim lines, redrawn each frame. */
  private readonly aimLines: Phaser.GameObjects.Graphics;
  /** Health bars over Peter (HP + MP) and over every enemy, redrawn each frame. */
  private readonly bars: Phaser.GameObjects.Graphics;
  /** Where Peter walked (Heel Shadows follow it), the last 3 s. */
  private trailLog: { t: number; x: number; y: number }[] = [];
  /** Light discs that undo Heel Shadows. */
  private lightKeys = new Set<string>();
  /** Slowed by an Origin Nullifier's ring until then. */
  private slowUntil = 0;
  private slowPct = 0;
  /** When Peter last moved (Hollow Husks pull after a while). */
  private stillSince = 0;
  /** Temporal Strike unavailable until then (a Name Eater swallowed it). */
  private silencedUntil = 0;
  /** Erasure Moths clinging: damage per second until then. */
  private dotUntil = 0;
  private dotPerSec = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly player: Player,
    private readonly walls: Phaser.Tilemaps.TilemapLayer,
    defs: MapRoamerDefinition[],
    private readonly host: ActionHost,
    private readonly t: Translate,
    private readonly rng: () => number = Math.random,
  ) {
    this.tuning = resolveActionTuning(session.database.player.action);
    this.combat = session.database.player.combat;
    this.group = scene.physics.add.group();
    this.bars = scene.add.graphics().setDepth(48);
    this.aimLines = scene.add.graphics().setDepth(47);
    this.defs = defs;
    for (const def of defs) this.spawn(def);
    if (this.roamers.some((r) => r.def.hunter)) this.announceHunters();
    scene.physics.add.collider(this.group, walls);
    scene.physics.add.collider(this.group, this.group);
    this.spawnElder();
    this.spawnCompanion();

    scene.input.mouse?.disableContextMenu();
    const onPointer = (p: Phaser.Input.Pointer): void => {
      if (p.rightButtonDown()) this.skill();
      else if (p.leftButtonDown()) this.slash(p.worldX, p.worldY);
    };
    scene.input.on('pointerdown', onPointer);
    const shift = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    const onShift = (): void => this.dash();
    shift?.on('down', onShift);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointerdown', onPointer);
      shift?.off('down', onShift);
    });
  }

  // ------------------------------------------------------------------ pools

  private pools: {
    x: number;
    y: number;
    r: number;
    until: number;
    slow: number;
    mp: number;
    g: Phaser.GameObjects.Arc;
  }[] = [];
  private baseSpeed: number | null = null;

  private updatePools(now: number, delta: number): void {
    for (const r of this.roamers) {
      const p = r.enemy.field?.pool;
      if (!p || !r.alive || r.clone) continue;
      if (r.nextPool === undefined) r.nextPool = now + p.everyMs / 2;
      if (now < r.nextPool) continue;
      r.nextPool = now + p.everyMs;
      const g = this.scene.add
        .circle(r.sprite.x, r.sprite.y + 6, p.radius, 0x8a3ad8, 0.32)
        .setStrokeStyle(1, 0xc890ff, 0.6)
        .setDepth(2);
      this.pools.push({
        x: r.sprite.x,
        y: r.sprite.y + 6,
        r: p.radius,
        until: now + p.lifeMs,
        slow: p.slowPct,
        mp: p.mpPerSec,
        g,
      });
    }
    let slow = 0;
    for (const pool of this.pools) {
      if (now > pool.until) {
        pool.g.destroy();
        continue;
      }
      if (distance(this.player, pool) <= pool.r) {
        slow = Math.max(slow, pool.slow);
        this.session.mp = Math.max(0, this.session.mp - (pool.mp * delta) / 1000);
      }
    }
    this.pools = this.pools.filter((pool) => now <= pool.until);
    if (now < this.slowUntil) slow = Math.max(slow, this.slowPct);
    if (this.baseSpeed === null) this.baseSpeed = this.player.getSpeed();
    this.player.setSpeed(this.baseSpeed * (1 - slow));
  }

  // ------------------------------------------------------------------ strike targets

  private strikes: { def: MapStrikeTarget; lastHit: number }[] = [];
  private onStrikeGroup: ((def: MapStrikeTarget) => void) | null = null;

  /** Objects Peter hits with a slash (resonance pillars); `onGroup` runs when a group completes. */
  public setStrikeTargets(defs: MapStrikeTarget[], onGroup: (def: MapStrikeTarget) => void): void {
    this.strikes = defs.map((def) => ({ def, lastHit: -Infinity }));
    this.onStrikeGroup = onGroup;
  }

  private strikeTargets(origin: Point, aim: number, reach: number, now: number): void {
    for (const s of this.strikes) {
      if (this.flag(s.def.doneFlag)) continue;
      const pos = tileCenter(s.def.tile);
      if (!inSlash(origin, aim, pos, reach + 18, this.tuning.slashArcDeg)) continue;
      s.lastHit = now;
      const ring = this.scene.add
        .circle(pos.x, pos.y, 10, 0x9fe8ff, 0.3)
        .setStrokeStyle(2, 0xd8f6ff, 0.9)
        .setDepth(40);
      this.scene.tweens.add({
        targets: ring,
        radius: 30,
        alpha: 0,
        duration: 600,
        onComplete: () => ring.destroy(),
      });
      const group = this.strikes.filter((o) => o.def.group === s.def.group);
      if (group.every((o) => now - o.lastHit <= s.def.windowMs)) {
        for (const o of group) o.lastHit = -Infinity;
        for (const f of s.def.setFlags ?? []) this.session.setFlag(f);
        this.session.setFlag(s.def.doneFlag);
        this.onStrikeGroup?.(s.def);
      } else {
        this.floatText(pos.x, pos.y - 20, this.t(s.def.hintKey ?? 'action.strikeHum'), '#9fe8ff');
      }
    }
  }

  // ------------------------------------------------------------------ setup

  private flag = (f: string): boolean => this.session.getFlag(f);

  /**
   * Story flags changed (dialogue effects): roamers whose condition now holds appear (e.g. the
   * ambush the moment time stops), those whose condition no longer holds fade away.
   */
  public syncSpawns(): void {
    for (const def of this.defs) {
      const live = this.roamers.find((r) => r.def.id === def.id);
      const visible = this.isVisible(def);
      if (!live && visible) {
        this.spawn(def);
        if (def.hunter) this.announceHunters();
      } else if (live?.alive && !visible) this.fadeOut(live);
    }
    if (!this.elder && this.elderActive) this.spawnElder();
  }

  private fadeOut(r: Roamer): void {
    r.alive = false;
    r.sprite.setVelocity(0, 0);
    this.scene.tweens.add({
      targets: r.sprite,
      alpha: 0,
      duration: 600,
      onComplete: () => r.sprite.destroy(),
    });
  }

  private isVisible(def: MapRoamerDefinition): boolean {
    if (!conditionHolds(def.visibleWhen, this.flag)) return false;
    return !def.duringQuest || this.session.quests.getQuestStage(def.duringQuest) === 'started';
  }

  private huntedAnnounced = false;

  private announceHunters(): void {
    if (this.huntedAnnounced) return;
    this.huntedAnnounced = true;
    this.scene.time.delayedCall(900, () => this.host.onHunted?.());
  }

  private spawn(def: MapRoamerDefinition): void {
    if (!this.isVisible(def)) return;
    if (def.respawn === false && def.defeatedFlag && this.flag(def.defeatedFlag)) return;
    const enemy = this.session.getEnemyDefinition(def.enemyId);
    if (!enemy) return;
    const pos = tileCenter(def.tile);
    const sprite = this.group.create(pos.x, pos.y, def.texture) as Phaser.Physics.Arcade.Sprite;
    if (def.anim && this.scene.anims.exists(def.anim)) sprite.play(def.anim);
    sprite.body?.setSize(18, 18);
    const e = this.tuning.enemy;
    this.roamers.push({
      def,
      enemy,
      sprite,
      hp: enemy.maxHp,
      brain: newBrain(pos),
      alive: true,
      stunUntil: 0,
      waypoint: null,
      pathAt: 0,
      speed: def.speed ?? e.speed,
      sight: def.sight ?? (def.hunter ? 100000 : e.sight),
      leash: def.leash ?? (def.hunter ? 100000 : e.leash),
      patrolRadius: def.patrolRadius ?? e.patrolRadius,
      facing: Math.PI / 2,
      glowOffset: Math.floor(this.rng() * 4000),
      glowShown: false,
    });
    const tw = enemy.field?.twin;
    if (tw) {
      const r = this.roamers[this.roamers.length - 1];
      sprite.setAlpha(0);
      r.orbs = [0, 1].map(() => this.scene.add.image(pos.x, pos.y, tw.texture).setDepth(9));
      r.orbHitAt = [-Infinity, -Infinity];
    }
    if (enemy.field?.trail) sprite.setAlpha(0.75);
  }

  /** Glowing floor discs (Chapter 6). */
  public setLightTiles(tiles: TilePoint[]): void {
    this.lightKeys = new Set(tiles.map((t) => `${t.x},${t.y}`));
    for (const t of tiles) {
      const c = tileCenter(t);
      const disc = this.scene.add.circle(c.x, c.y, 12, 0xfff2b0, 0.35).setDepth(1);
      disc.setStrokeStyle(2, 0xffe48a, 0.8);
      this.scene.tweens.add({ targets: disc, alpha: 0.6, yoyo: true, repeat: -1, duration: 900 });
    }
  }

  /** A Hollow Archivist's decoy: same look and moves, 1 HP, harmless, no reward. */
  private spawnClone(src: Roamer, k: number): void {
    const angle = (k / 2) * Math.PI * 2 + Math.PI / 2;
    const x = src.sprite.x + Math.cos(angle) * 28;
    const y = src.sprite.y + Math.sin(angle) * 28;
    const sprite = this.group.create(x, y, src.def.texture) as Phaser.Physics.Arcade.Sprite;
    if (src.def.anim && this.scene.anims.exists(src.def.anim)) sprite.play(src.def.anim);
    sprite.body?.setSize(18, 18);
    sprite.setAlpha(0.88);
    this.roamers.push({
      ...src,
      sprite,
      hp: 1,
      brain: { ...newBrain({ x, y }), state: 'chase' },
      alive: true,
      stunUntil: 0,
      waypoint: null,
      pathAt: 0,
      clone: true,
      cloned: true,
      shownRatio: src.hp / src.enemy.maxHp,
    });
  }

  /** The ally walking with Peter: the Elder (Prologue) or Kuro (Chapter 5). */
  private get allyTexture(): string | null {
    if (this.flag(ELDER_FLAG) && !this.flag(ELDER_PARTED_FLAG)) return 'npc_elder';
    if (this.flag(KURO_FLAG) && !this.flag(KURO_LEFT_FLAG)) return 'npc_kuro';
    return null;
  }

  private get elderActive(): boolean {
    return this.allyTexture !== null;
  }

  private nextShiftAt = 0;

  /** The ally follows Peter (unless he already stands on this map as an NPC). */
  private spawnElder(): void {
    const texture = this.allyTexture;
    if (!texture || !this.scene.textures.exists(texture)) return;
    const standing = this.scene.children.list.some(
      (o) => o instanceof Phaser.GameObjects.Sprite && o.texture.key === texture && o.visible,
    );
    if (standing) return;
    this.elder = this.scene.physics.add.sprite(this.player.x - 26, this.player.y + 4, texture);
    this.elder.body?.setSize(14, 12);
    this.elder.body?.setOffset(9, 18);
    if (this.scene.anims.exists(`${texture}_idle`)) this.elder.play(`${texture}_idle`);
  }

  private get companionTexture(): string | null {
    for (const [flag, texture] of COMPANIONS) if (this.flag(flag)) return texture;
    return null;
  }

  /** Chapter 8: the act's companion follows Peter too (unless standing here as an NPC). */
  private spawnCompanion(): void {
    const texture = this.companionTexture;
    if (!texture || !this.scene.textures.exists(texture)) return;
    const standing = this.scene.children.list.some(
      (o) => o instanceof Phaser.GameObjects.Sprite && o.texture.key === texture && o.visible,
    );
    if (standing) return;
    this.companion = this.scene.physics.add.sprite(this.player.x + 26, this.player.y + 4, texture);
    this.companion.body?.setSize(14, 12);
    this.companion.body?.setOffset(9, 18);
    if (this.scene.anims.exists(`${texture}_idle`)) this.companion.play(`${texture}_idle`);
  }

  private updateCompanion(now: number): void {
    const c = this.companion;
    if (!c) return;
    const ally = this.tuning.ally;
    if (distance(c, this.player) > 220) {
      c.setPosition(this.player.x + 22, this.player.y + 6);
      c.setVelocity(0, 0);
      return;
    }
    const move = (p: Point, speed: number): void => {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const len = Math.hypot(dx, dy) || 1;
      c.setVelocity((dx / len) * speed, (dy / len) * speed);
      if (Math.abs(dx) > 2) c.setFlipX(dx < 0);
    };
    let foe: Roamer | null = null;
    let best = Infinity;
    for (const r of this.roamers) {
      if (!r.alive || r.def.ambush) continue;
      const d = distance(r.sprite, c);
      if (d < 110 && distance(r.sprite, this.player) < 170 && d < best) {
        best = d;
        foe = r;
      }
    }
    if (foe) {
      if (best > ally.reach) move(foe.sprite, ally.speed);
      else {
        c.setVelocity(0, 0);
        if (now >= this.nextCompanionHit) {
          this.nextCompanionHit = now + ally.cooldownMs * 1.3;
          const hit = rollHit(ally.attack, foe.enemy.defense, this.combat, this.rng);
          this.damageRoamer(foe, hit.damage, hit.critical);
        }
      }
      return;
    }
    const d = distance(c, this.player);
    if (d > 46) move(this.player, d > 90 ? ally.speed * 1.3 : ally.speed);
    else c.setVelocity(0, 0);
  }

  /** Assimilators near Peter learn the move he just made. */
  private teach(move: PeterMove): void {
    for (const r of this.roamers) {
      const mi = r.enemy.field?.mimic;
      if (!mi || !r.alive || distance(r.sprite, this.player) > mi.range) continue;
      r.learned = move;
      r.sprite.anims.stop();
      r.sprite.setFrame(mimicFrame(move));
    }
  }

  /** A repeated move against an Assimilator: it shrugs it off and strikes back. */
  private mimicCounter(r: Roamer, move: PeterMove): boolean {
    const mi = r.enemy.field?.mimic;
    if (!mi || !mimicCounters(r.learned ?? null, move)) return false;
    this.floatText(r.sprite.x, r.sprite.y - 20, this.t('action.mimicked'), '#f0c860');
    this.hitPlayer(r, { mult: mi.counterMult });
    return true;
  }

  // ------------------------------------------------------------------ Chapter 8 enemies

  /** Doom Bell: three tolls, then a wave; a slash after the first toll cracks it. */
  private updateBell(r: Roamer, now: number): boolean {
    const b = r.enemy.field?.bell;
    if (!b) return false;
    r.sprite.setVelocity(0, 0);
    if (r.bellAt === null || r.bellAt === undefined) {
      if (distance(r.sprite, this.player) > b.range) return true;
      r.bellAt = now;
      r.bellHit = false;
      r.sprite.anims.stop();
    }
    const st = bellState(now, r.bellAt, b.tollMs, b.waveMs);
    r.sprite.setFrame(Math.min(3, st.tolls));
    if (st.wave !== null) {
      const radius = 18 + st.wave * (b.radius - 18);
      this.aimLines.lineStyle(4, 0xffd890, 0.8).strokeCircle(r.sprite.x, r.sprite.y, radius);
      const d = distance(r.sprite, this.player);
      if (!r.bellHit && Math.abs(d - radius) < 14) {
        r.bellHit = true;
        this.hitPlayer(r, { mult: b.damageMult });
      }
    }
    if (st.done) {
      r.bellAt = now + b.restMs;
      r.bellHit = false;
      r.sprite.setFrame(0);
    }
    return true;
  }

  /** A slash between the first and second toll cracks the bell. */
  private crackBell(r: Roamer, now: number): boolean {
    const b = r.enemy.field?.bell;
    if (!b || r.bellAt === null || r.bellAt === undefined) return false;
    if (!bellCrackable(bellState(now, r.bellAt, b.tollMs, b.waveMs))) return false;
    r.bellAt = now + b.crackMs;
    r.stunUntil = now + b.crackMs;
    r.sprite.setFrame(0);
    r.sprite.setTint(0x9a7050);
    this.scene.time.delayedCall(b.crackMs, () => r.alive && r.sprite.clearTint());
    this.floatText(r.sprite.x, r.sprite.y - 22, this.t('action.bellCracked'), '#ffd890');
    const hit = rollHit(this.session.getStats().attack, r.enemy.defense, this.combat, this.rng);
    this.damageRoamer(r, hit.damage * 2, true);
    return true;
  }

  /** Twin-Era Legionnaire: its shield turns (red) to Peter's companion now and then. */
  private shieldTurned(r: Roamer, now: number): boolean {
    const at = r.enemy.field?.allyTaunt;
    if (!at) return false;
    const near = !!this.companion && distance(this.companion, r.sprite) < at.range;
    return tauntActive(now, r.glowOffset, at.everyMs, at.turnMs, near);
  }

  /** Second-Hand Warden: the hand sweeps round it; touching it hurts. */
  private updateSweep(r: Roamer, now: number): void {
    const sw = r.enemy.field?.sweep;
    if (!sw) return;
    r.sweepAt ??= now;
    if (now < (r.sweepStopUntil ?? 0)) {
      r.sweepAt += this.scene.game.loop.delta;
      return;
    }
    const a = sweepAngle(now, r.sweepAt, sw.periodMs);
    const tip = {
      x: r.sprite.x + Math.cos(a) * sw.length,
      y: r.sprite.y + Math.sin(a) * sw.length,
    };
    this.aimLines.lineStyle(5, 0xa07c30, 0.9).lineBetween(r.sprite.x, r.sprite.y, tip.x, tip.y);
    this.aimLines.lineStyle(2, 0xf0c860, 1).lineBetween(r.sprite.x, r.sprite.y, tip.x, tip.y);
    if (inTickWindow(now, r.glowOffset, sw.tickMs, sw.windowMs)) {
      this.aimLines.lineStyle(2, 0xffffff, 0.8).strokeCircle(r.sprite.x, r.sprite.y, 16);
    }
    if (
      this.segmentDistance(this.player, r.sprite, tip) < 14 &&
      now > (r.sweepTouchAt ?? 0) + 700
    ) {
      r.sweepTouchAt = now;
      this.hitPlayer(r, { mult: sw.sweepMult });
    }
  }

  // ------------------------------------------------------------------ frame

  public update(delta: number): void {
    this.drawBars();
    const paused = this.host.isPaused() || this.defeated;
    if (paused) {
      this.aimLines.clear();
      for (const r of this.roamers) {
        if (r.alive) r.sprite.setVelocity(0, 0);
        r.aim = null;
      }
      this.elder?.setVelocity(0, 0);
      this.companion?.setVelocity(0, 0);
      return;
    }
    const now = this.scene.time.now;
    const maxMp = this.session.getStats().maxMp;
    this.session.mp = Math.min(maxMp, this.session.mp + (this.tuning.mpRegenPerSec * delta) / 1000);
    if (Math.floor(this.session.mp) !== this.hudMp) {
      this.hudMp = Math.floor(this.session.mp);
      this.host.refreshHud();
    }

    const target: Point = { x: this.player.x, y: this.player.y };
    this.aimLines.clear();
    const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (!pBody || !huskFrozen(Math.hypot(pBody.velocity.x, pBody.velocity.y)))
      this.stillSince = now;
    if (now < this.dotUntil) {
      this.session.hp = Math.max(1, this.session.hp - (this.dotPerSec * delta) / 1000);
      if (Math.floor(now / 500) !== Math.floor((now - delta) / 500)) this.host.refreshHud();
    }
    if (this.roamers.some((r) => r.alive && r.enemy.field?.trail)) {
      this.trailLog.push({ t: now, x: this.player.x, y: this.player.y });
      while (this.trailLog.length > 0 && this.trailLog[0].t < now - 3000) this.trailLog.shift();
    }
    this.updateChants(now);
    for (const r of this.roamers) {
      if (!r.alive || now < r.stunUntil) continue;
      if (now < (r.shiftedUntil ?? 0)) continue;
      if (r.enemy.field?.cocoon) {
        this.updateCocoon(r, now);
        continue;
      }
      if (r.enemy.field?.trail) {
        this.updateTrail(r, now);
        continue;
      }
      if (r.enemy.field?.freezeWatch && this.updateHusk(r, now)) continue;
      if (r.enemy.field?.inhale && this.updateInhale(r, now)) continue;
      if (r.enemy.field?.swarm && this.updateSwarm(r, now)) continue;
      if (r.enemy.field?.hound && this.updateHound(r, now)) continue;
      if (r.enemy.field?.chainTrial && this.updateChains(r, now)) continue;
      if (r.enemy.field?.bell && this.updateBell(r, now)) continue;
      if (r.enemy.field?.sweep) this.updateSweep(r, now);
      if (r.enemy.field?.allyTaunt) {
        const turned = this.shieldTurned(r, now);
        if (turned && !r.glowShown) r.sprite.setTint(0xff6a50);
        if (!turned && r.glowShown) r.sprite.clearTint();
        r.glowShown = turned;
      }
      if (r.enemy.field?.rings && this.updateRings(r, now)) continue;
      if (r.enemy.field?.laser && this.updateLaser(r, now)) continue;
      if (r.enemy.field?.phase) this.updatePhase(r, now);
      if (r.enemy.field?.lineCut && this.updateLineCut(r, now)) continue;
      if (r.enemy.field?.sniper) {
        this.updateSniper(r, now);
        continue;
      }
      if (r.enemy.field?.charge && this.updateCharge(r, now)) continue;
      const before = r.brain.state;
      const out = thinkRoamer(r.brain, {
        pos: { x: r.sprite.x, y: r.sprite.y },
        player: this.ambushFired && r.def.ambush ? null : target,
        dt: delta,
        rng: this.rng,
        sight: r.sight,
        leash: r.leash,
        patrolRadius: r.patrolRadius,
        attackRange: this.tuning.enemy.attackRange,
        windupMs: this.tuning.enemy.windupMs,
        recoverMs: this.tuning.enemy.recoverMs,
      });
      r.brain = out.brain;
      if (out.moveTo) {
        // Chasing or heading home goes around walls; patrol steps are short and direct.
        const goal = out.pace >= 0.8 ? this.routeTo(r, out.moveTo, now) : out.moveTo;
        const dx = goal.x - r.sprite.x;
        const dy = goal.y - r.sprite.y;
        const len = Math.hypot(dx, dy) || 1;
        const v = r.speed * out.pace;
        r.sprite.setVelocity((dx / len) * v, (dy / len) * v);
        if (Math.abs(dx) > 2) this.faceX(r, dx);
      } else {
        r.sprite.setVelocity(0, 0);
      }
      if (r.brain.state === 'windup' && Math.abs(target.x - r.sprite.x) > 2) {
        this.faceX(r, target.x - r.sprite.x);
      }
      if (r.brain.state === 'windup' && before !== 'windup') r.sprite.setTint(0xff7070);
      if (r.brain.state !== 'windup' && before === 'windup') r.sprite.clearTint();
      const parry = r.enemy.field?.parry;
      if (parry && inParryWindow(r.brain.state, r.brain.timer, parry.flashMs)) {
        r.sprite.setTintFill(0xf4f8ff);
      }
      const reflect = r.enemy.field?.reflect;
      if (reflect) {
        const glow = isGlowing(now, r.glowOffset, reflect.everyMs, reflect.glowMs);
        if (glow && !r.glowShown) r.sprite.setTint(0xff2a2a);
        if (!glow && r.glowShown && r.brain.state !== 'windup') r.sprite.clearTint();
        r.glowShown = glow;
      }
      const faded = r.enemy.field?.phase && !this.isSolid(r, now);
      if (
        out.strike &&
        !faded &&
        distance(r.sprite, target) <= this.tuning.enemy.attackRange + 10
      ) {
        this.hitPlayer(r);
      }
    }
    this.updatePools(now, delta);
    this.placeOrbs(now);
    this.updateElder(now);
    this.updateCompanion(now);
  }

  /**
   * Turns the enemy left or right; its front (where a shield is held) follows the art's facing
   * (`field.facesLeft` when the sheet is drawn looking left).
   */
  private faceX(r: Roamer, dx: number): void {
    const left = dx < 0;
    r.sprite.setFlipX(r.enemy.field?.facesLeft ? !left : left);
    r.facing = left ? Math.PI : 0;
  }

  /** Next point toward `target` around walls (tile BFS, recomputed every 350 ms). */
  private routeTo(r: Roamer, target: Point, now: number): Point {
    const tile = (p: Point): Point => ({ x: Math.floor(p.x / 32), y: Math.floor(p.y / 32) });
    const from = tile(r.sprite);
    const to = tile(target);
    if (from.x === to.x && from.y === to.y) return target;
    if (now >= r.pathAt || !r.waypoint) {
      r.pathAt = now + 350;
      const layer = this.walls;
      const blocked = (x: number, y: number): boolean => {
        if (x < 0 || y < 0 || x >= layer.layer.width || y >= layer.layer.height) return true;
        return layer.getTileAt(x, y)?.collides ?? false;
      };
      const step = nextStep(blocked, from, to);
      r.waypoint = step ? { x: step.x * 32 + 16, y: step.y * 32 + 16 } : null;
    }
    const w = r.waypoint;
    if (!w) return target;
    if (distance(r.sprite, w) < 4) {
      r.pathAt = 0;
      return target;
    }
    return w;
  }

  // ------------------------------------------------------------------ Peter

  private get canAct(): boolean {
    return !this.host.isPaused() && !this.defeated;
  }

  /** Left click: slash toward the cursor (needs the blade). */
  public slash(worldX: number, worldY: number): void {
    const now = this.scene.time.now;
    if (!this.canAct || !this.session.canSlash || now < this.nextSwing) return;
    const weapon = this.session.weaponStats;
    const reach = weapon?.reach ?? this.tuning.reach;
    this.nextSwing = now + (weapon?.swingMs ?? this.tuning.swingMs);
    const origin = { x: this.player.x, y: this.player.y };
    const aim = Math.atan2(worldY - origin.y, worldX - origin.x);
    this.player.playAction('peter_attack', facingFromAngle(aim), 380);
    this.sound.playSlash();
    this.drawSlash(origin, aim, reach);
    this.strikeTargets(origin, aim, reach, now);
    const attack = this.session.getStats().attack;
    let landed = false;
    const echoed: { r: Roamer; damage: number }[] = [];
    this.scheduleEchoes(origin, aim, reach);
    for (const r of this.roamers) {
      if (!r.alive || now < (r.shiftedUntil ?? 0)) continue;
      if (r.enemy.field?.twin) {
        if (this.slashTwin(r, origin, aim, reach, attack, now)) landed = true;
        continue;
      }
      if (!inSlash(origin, aim, r.sprite, reach, this.tuning.slashArcDeg)) continue;
      landed = true;
      if (this.shutLaser(r, now)) continue;
      if (this.chokeEater(r, now)) {
        this.damageRoamer(
          r,
          rollHit(attack, r.enemy.defense, this.combat, this.rng).damage * 2,
          true,
        );
        continue;
      }
      if (this.scatterSwarm(r, now)) continue;
      if (this.mimicCounter(r, 'slash')) continue;
      if (this.crackBell(r, now)) continue;
      const parry = r.enemy.field?.parry;
      if (parry && inParryWindow(r.brain.state, r.brain.timer, parry.flashMs)) {
        // Parried: no damage, but the spear is knocked aside and the guard drops.
        r.brain = { ...r.brain, state: 'recover', timer: parry.staggerMs };
        r.sprite.setTint(0x8fb8ff);
        this.scene.time.delayedCall(parry.staggerMs, () => r.alive && r.sprite.clearTint());
        this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.parried'), '#cfe8ff');
        this.sound.playSlash();
        continue;
      }
      const hit = rollHit(attack, r.enemy.defense, this.combat, this.rng);
      if (this.defended(r, hit.damage)) continue;
      const stunned = r.charge?.phase === 'stunned';
      const frozen = r.frozen ? (r.enemy.field?.freezeWatch?.frozenMult ?? 1) : 1;
      const mult = (stunned ? (r.enemy.field?.charge?.stunnedDamageMult ?? 1) : 1) * frozen;
      const dealt = Math.floor(hit.damage * mult);
      this.damageRoamer(r, dealt, hit.critical || stunned);
      echoed.push({ r, damage: dealt });
    }
    if (!landed) this.blinkOnWhiff(origin, aim);
    this.teach('slash');
    // Blade of Possibility: the other branch's slash follows 0.2 s later.
    const echoPct = weapon?.echoPct ?? 0;
    if (echoPct > 0 && echoed.length > 0) {
      this.scene.time.delayedCall(200, () => {
        this.drawSlash(origin, aim + 0.25, reach);
        for (const { r, damage } of echoed)
          if (r.alive) this.damageRoamer(r, Math.max(1, Math.floor(damage * echoPct)), false);
      });
    }
  }

  /** Memory Wraiths: a missed slash lets them blink behind Peter, then wind up (0.4 s to dodge). */
  private blinkOnWhiff(origin: Point, aim: number): void {
    for (const r of this.roamers) {
      const b = r.enemy.field?.blinkOnWhiff;
      if (!b || !r.alive || r.clone || distance(r.sprite, origin) > b.range) continue;
      const puff = this.scene.add.circle(r.sprite.x, r.sprite.y, 12, 0x6a3a9a, 0.5).setDepth(40);
      this.scene.tweens.add({
        targets: puff,
        alpha: 0,
        radius: 22,
        duration: 300,
        onComplete: () => puff.destroy(),
      });
      const bx = origin.x - Math.cos(aim) * 24;
      const by = origin.y - Math.sin(aim) * 24;
      r.sprite.setPosition(bx, by);
      r.sprite.setVelocity(0, 0);
      this.faceX(r, origin.x - bx);
      r.brain = { ...r.brain, state: 'windup', timer: 400 };
      r.sprite.setTint(0xff7070);
    }
  }

  /** Right click: Temporal Strike around Peter (needs Temporal Sight and MP). */
  public skill(): void {
    const now = this.scene.time.now;
    if (!this.canAct || !this.flag(FLAGS.temporalSight) || now < this.nextSkill) return;
    if (now < this.silencedUntil) {
      this.floatText(this.player.x, this.player.y - 22, this.t('action.silenced'), '#c8a0ff');
      return;
    }
    const cost = this.combat.skillMpCost;
    if (this.session.mp < cost) {
      this.floatText(this.player.x, this.player.y - 22, this.t('action.noMp'), '#8fb8ff');
      return;
    }
    this.session.mp -= cost;
    this.nextSkill = now + 700;
    this.host.refreshHud();
    this.player.playAction(
      'peter_temporal_sight',
      this.player.getMovementSystem().getLastFacing(),
      450,
    );
    this.sound.playSlash();
    const ring = this.scene.add
      .circle(this.player.x, this.player.y, 8, 0x67d1ff, 0.25)
      .setStrokeStyle(2, 0x9fe8ff, 0.9)
      .setDepth(40);
    this.scene.tweens.add({
      targets: ring,
      radius: this.tuning.skillRadius,
      alpha: 0,
      duration: 380,
      onComplete: () => ring.destroy(),
    });
    for (const r of this.roamers) {
      if (r.alive && r.clone && distance(r.sprite, this.player) <= this.tuning.skillRadius + 60)
        this.defeatRoamer(r);
    }
    const attack = this.session.getStats().attack;
    for (const r of this.roamers) {
      if (!r.alive || distance(r.sprite, this.player) > this.tuning.skillRadius + 10) continue;
      if (this.houndRunning(r, now)) continue;
      if (this.mimicCounter(r, 'skill')) continue;
      const hd = r.enemy.field?.hound;
      const damage =
        Math.max(
          this.combat.skillMinDamage,
          Math.floor(attack * this.combat.skillMultiplier - r.enemy.defense),
        ) * (hd ? hd.skillMult : 1);
      if (hd) {
        // The ink bursts: its trail is gone and Peter drinks the spark.
        for (const pool of this.pools) pool.g.destroy();
        this.pools = [];
        this.session.mp = Math.min(this.session.getStats().maxMp, this.session.mp + hd.mpGain);
        this.floatText(r.sprite.x, r.sprite.y - 30, this.t('action.inkBurst'), '#e6dcff');
      }
      this.damageRoamer(r, damage, false);
      // Time slows around them: their wind-up is lost (a spear wall loses its guard longer).
      const guardBreak = r.enemy.field?.parry?.guardBreakMs;
      r.brain = {
        ...r.brain,
        state: 'recover',
        timer: guardBreak ?? this.tuning.enemy.recoverMs,
      };
      r.sprite.clearTint();
    }
    this.teach('skill');
  }

  /** Shift: short invulnerable dash in the walking direction (or the facing). */
  public dash(): void {
    const now = this.scene.time.now;
    if (!this.canAct || now < this.nextDash) return;
    let { x, y } = this.player.getController().getMovementVector();
    if (x === 0 && y === 0) {
      const f = this.player.getMovementSystem().getLastFacing();
      x = f === 'left' ? -1 : f === 'right' ? 1 : 0;
      y = f === 'up' ? -1 : f === 'down' ? 1 : 0;
    }
    const len = Math.hypot(x, y) || 1;
    const s = this.tuning.dashSpeed;
    this.player.forceVelocity((x / len) * s, (y / len) * s, this.tuning.dashMs);
    this.invulnUntil = Math.max(this.invulnUntil, now + this.tuning.dashMs + 80);
    this.lastDashAt = now;
    this.nextDash = now + this.tuning.dashCooldownMs;
    if (now < this.dotUntil) {
      this.dotUntil = 0;
      this.floatText(this.player.x, this.player.y - 22, this.t('action.brushed'), '#e6dcff');
    }
    this.player.sprite.setAlpha(0.55);
    this.scene.time.delayedCall(this.tuning.dashMs + 40, () => this.player.sprite.setAlpha(1));
    // An Assimilator that learned the dash lunges after Peter.
    for (const r of this.roamers) {
      const mi = r.enemy.field?.mimic;
      if (!r.alive || !mi || r.learned !== 'dash') continue;
      if (distance(r.sprite, this.player) > mi.range) continue;
      this.scene.time.delayedCall(this.tuning.dashMs + 60, () => {
        if (!r.alive) return;
        r.sprite.setPosition(this.player.x - 20, this.player.y);
        r.brain = { ...r.brain, state: 'windup', timer: 350 };
        r.sprite.setTint(0xff7070);
        this.floatText(r.sprite.x, r.sprite.y - 20, this.t('action.mimicked'), '#f0c860');
      });
    }
    this.teach('dash');
  }

  /**
   * Enemy defences against a slash (Temporal Strike goes through): a front shield blocks it, a
   * red glow sends part of it back to Peter. True when the hit did not land.
   */
  private defended(r: Roamer, damage: number): boolean {
    const field = r.enemy.field;
    if (!field) return false;
    const now = this.scene.time.now;
    if (field.trail) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.shadowSlash'), '#b0a0d0');
      return true;
    }
    if (this.houndRunning(r, now)) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.inkRun'), '#b48cff');
      return true;
    }
    if (field.phase && !this.isSolid(r, now)) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.faded'), '#b09aff');
      const behind = Math.atan2(r.sprite.y - this.player.y, r.sprite.x - this.player.x);
      r.sprite.setPosition(
        this.player.x - Math.cos(behind) * 26,
        this.player.y - Math.sin(behind) * 26,
      );
      return true;
    }
    const sw = field.sweep;
    if (sw) {
      if (!inTickWindow(now, r.glowOffset, sw.tickMs, sw.windowMs)) {
        r.sweepHits = 0;
        this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.offBeat'), '#f0c860');
        this.sound.playSlash();
        return true;
      }
      r.sweepHits = (r.sweepHits ?? 0) + 1;
      if (r.sweepHits >= 3) {
        r.sweepHits = 0;
        r.sweepStopUntil = now + sw.stopMs;
        this.floatText(r.sprite.x, r.sprite.y - 30, this.t('action.handStopped'), '#fff2b8');
      }
    }
    const chant = field.chant;
    if (chant && chantState(now, r.glowOffset, chant.chantMs, chant.breathMs).chanting) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.bannerWard'), '#ff9090');
      this.sound.playSlash();
      return true;
    }
    if (
      field.frontShieldDeg &&
      !this.shieldTurned(r, now) &&
      shieldBlocks(r.facing, r.sprite, this.player, field.frontShieldDeg, r.brain.state)
    ) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.blocked'), '#9fd3ff');
      this.sound.playSlash();
      const away = Math.atan2(this.player.y - r.sprite.y, this.player.x - r.sprite.x);
      this.player.forceVelocity(Math.cos(away) * 120, Math.sin(away) * 120, 90);
      return true;
    }
    const reflect = field.reflect;
    if (reflect && isGlowing(now, r.glowOffset, reflect.everyMs, reflect.glowMs)) {
      const back = Math.max(1, Math.ceil(damage * reflect.pct));
      this.session.hp = Math.max(1, this.session.hp - back);
      this.player.sprite.setTint(0xff5050);
      this.scene.time.delayedCall(160, () => this.player.sprite.clearTint());
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.reflected'), '#ff8080');
      this.floatText(this.player.x, this.player.y - 20, `-${back}`, '#ff6b6b');
      this.host.refreshHud();
      return true;
    }
    return false;
  }

  private hitPlayer(r: Roamer, opts: { mult?: number; stunMs?: number } = {}): void {
    const now = this.scene.time.now;
    if (r.clone) return;
    if (now < this.invulnUntil || this.defeated) return;
    const { damage } = rollHit(
      r.enemy.attack,
      this.session.getStats().defense,
      this.combat,
      this.rng,
      opts.mult ?? 1,
    );
    const floor = r.def.ambush ? 1 : 0;
    this.session.hp = Math.max(floor, this.session.hp - damage);
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    const away = Math.atan2(this.player.y - r.sprite.y, this.player.x - r.sprite.x);
    const k = this.tuning.knockback;
    this.player.forceVelocity(Math.cos(away) * k, Math.sin(away) * k, 130);
    if (opts.stunMs) {
      const stun = opts.stunMs;
      this.scene.time.delayedCall(130, () => this.player.forceVelocity(0, 0, stun));
    }
    this.player.playAction('peter_hurt', this.player.getMovementSystem().getLastFacing(), 260);
    this.player.sprite.setTint(0xff5050);
    this.scene.time.delayedCall(160, () => this.player.sprite.clearTint());
    this.scene.cameras.main.shake(120, 0.004);
    this.floatText(this.player.x, this.player.y - 20, `-${damage}`, '#ff6b6b');
    this.host.refreshHud();

    if (r.def.ambush && this.session.hp <= 1 && !this.ambushFired) {
      this.ambushFired = true;
      const id = r.def.ambush.rescueDialogueId;
      this.scene.time.delayedCall(450, () => this.host.onAmbushRescue(id));
    } else if (this.session.hp <= 0) {
      this.defeated = true;
      this.host.onPlayerDefeated();
    }
  }

  /**
   * Map hazard (arrow volleys): `damage` minus half Peter's defence, through the same
   * invulnerability as enemy hits (a dodge avoids it). False when it did not land.
   */
  public hazardHit(damage: number): boolean {
    const now = this.scene.time.now;
    if (now < this.invulnUntil || this.defeated) return false;
    const dealt = Math.max(1, damage - Math.floor(this.session.getStats().defense / 2));
    this.session.hp = Math.max(0, this.session.hp - dealt);
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    this.player.playAction('peter_hurt', this.player.getMovementSystem().getLastFacing(), 260);
    this.player.sprite.setTint(0xff5050);
    this.scene.time.delayedCall(160, () => this.player.sprite.clearTint());
    this.scene.cameras.main.shake(100, 0.003);
    this.floatText(this.player.x, this.player.y - 20, `-${dealt}`, '#ff6b6b');
    this.host.refreshHud();
    if (this.session.hp <= 0) {
      this.defeated = true;
      this.host.onPlayerDefeated();
    }
    return true;
  }

  // ------------------------------------------------------------------ enemies

  private damageRoamer(r: Roamer, damage: number, critical: boolean): void {
    const now = this.scene.time.now;
    const away = Math.atan2(r.sprite.y - this.player.y, r.sprite.x - this.player.x);
    r.sprite.setVelocity(
      Math.cos(away) * this.tuning.knockback,
      Math.sin(away) * this.tuning.knockback,
    );
    r.stunUntil = now + 140;
    r.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => r.alive && r.sprite.clearTint());
    if (r.def.ambush) {
      this.floatText(r.sprite.x, r.sprite.y - 18, '…', '#c8c8d8');
      return;
    }
    r.hp -= damage;
    this.floatText(
      r.sprite.x,
      r.sprite.y - 18,
      `${damage}${critical ? '!' : ''}`,
      critical ? '#ffd166' : '#ffffff',
    );
    if (r.brain.state === 'idle' || r.brain.state === 'patrol' || r.brain.state === 'return') {
      r.brain = { ...r.brain, state: 'chase' };
    }
    const split = r.enemy.field?.clonesAtHalf;
    if (split && !r.clone && !r.cloned && r.hp > 0 && r.hp <= r.enemy.maxHp / 2) {
      r.cloned = true;
      for (let k = 0; k < split; k++) this.spawnClone(r, k);
    }
    if (r.hp <= 0) this.defeatRoamer(r);
  }

  private defeatRoamer(r: Roamer): void {
    r.alive = false;
    r.charge = undefined;
    r.sprite.setVelocity(0, 0);
    if (r.sprite.body) (r.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    if (!r.clone && !r.enemy.field?.chant && this.carrierNear(r)) {
      // A Banner Carrier's song will raise it again: it lies there until then.
      r.pending = true;
      r.sprite.clearTint();
      this.scene.tweens.add({ targets: r.sprite, alpha: 0.35, duration: 300 });
      return;
    }
    this.finalDefeat(r);
    if (r.enemy.field?.chant) {
      // Its song is over: the fallen around it stay down for good.
      for (const o of this.roamers) if (o.pending && !this.carrierNear(o)) this.finalDefeat(o);
    }
  }

  /** The enemy is gone for good: burst, fade, rewards, flags. */
  private finalDefeat(r: Roamer): void {
    r.pending = false;
    for (const o of r.orbs ?? []) {
      this.scene.tweens.add({ targets: o, alpha: 0, duration: 380, onComplete: () => o.destroy() });
    }
    if (this.scene.anims.exists('hit_spark_burst')) {
      this.scene.add
        .sprite(r.sprite.x, r.sprite.y, 'hit_spark')
        .setDepth(45)
        .play('hit_spark_burst');
    }
    this.scene.tweens.add({
      targets: r.sprite,
      alpha: 0,
      scale: 0.4,
      duration: 380,
      onComplete: () => r.sprite.destroy(),
    });
    if (r.clone) return;
    const rewards = this.session.claimEnemyRewards(r.enemy, this.rng);
    this.host.notify(
      this.t('action.defeated', { name: r.enemy.name }),
      this.session.describeRewards(rewards),
    );
    if (r.def.defeatedFlag) this.session.setFlag(r.def.defeatedFlag);
    const group = r.def.group;
    if (group && this.roamers.every((o) => o.def.group !== group || (!o.alive && !o.pending))) {
      this.session.setFlag(`cleared_${group}`);
    }
    this.session.syncQuestProgress();
    this.host.refreshHud();
  }

  /** The ambusher withdraws (after the rescue). */
  public dismissAmbushers(): void {
    for (const r of this.roamers) {
      if (!r.alive || !r.def.ambush) continue;
      r.alive = false;
      this.scene.tweens.add({
        targets: r.sprite,
        alpha: 0,
        duration: 600,
        onComplete: () => r.sprite.destroy(),
      });
    }
  }

  // ------------------------------------------------------------------ Chapter 4 enemies

  /** Ghost Sniper: aims a line at Peter, white at the end, then fires. */
  private updateSniper(r: Roamer, now: number): void {
    const sn = r.enemy.field?.sniper;
    if (!sn) return;
    r.sprite.setVelocity(0, 0);
    const d = distance(r.sprite, this.player);
    if (Math.abs(this.player.x - r.sprite.x) > 2) this.faceX(r, this.player.x - r.sprite.x);
    if (!r.aim) {
      if (d <= sn.range && now >= (r.nextAimAt ?? 0)) r.aim = { fireAt: now + sn.aimMs };
      return;
    }
    if (d > sn.range * 1.4) {
      r.aim = null;
      return;
    }
    const white = r.aim.fireAt - now <= sn.whiteMs;
    this.aimLines
      .lineStyle(white ? 2 : 1, white ? 0xffffff : 0xff3a2a, white ? 0.95 : 0.7)
      .lineBetween(r.sprite.x, r.sprite.y - 4, this.player.x, this.player.y);
    if (now < r.aim.fireAt) return;
    r.aim = null;
    r.nextAimAt = now + sn.cooldownMs;
    const blocked = this.lineBlocked(r.sprite, this.player);
    const outcome = sniperOutcome(now, this.lastDashAt, sn.whiteMs, blocked);
    this.sound.playSlash();
    if (outcome === 'perfect') {
      this.session.mp = Math.min(this.session.getStats().maxMp, this.session.mp + sn.perfectMp);
      this.floatText(this.player.x, this.player.y - 24, this.t('action.perfectDodge'), '#9fe8ff');
      this.host.refreshHud();
    } else if (outcome === 'cover') {
      this.floatText(this.player.x, this.player.y - 24, this.t('action.arrowCover'), '#c8c0b0');
    } else {
      this.hitPlayer(r, { mult: sn.damageMult, stunMs: sn.stunMs });
    }
  }

  /** Branch Phantom rhythm: solid for `solidMs` of each `everyMs`. */
  private isSolid(r: Roamer, now: number): boolean {
    const ph = r.enemy.field?.phase;
    if (!ph) return true;
    const anchored = ph.anchor
      ? this.flag(ph.anchor.ownFlag)
        ? 'own'
        : this.flag(ph.anchor.otherFlag)
          ? 'other'
          : null
      : null;
    return wraithSolid(anchored, now, r.glowOffset, ph.everyMs, ph.solidMs);
  }

  private updatePhase(r: Roamer, now: number): void {
    r.sprite.setAlpha(this.isSolid(r, now) ? 1 : 0.3);
  }

  /** Unborn Cocoon: pulses faster as it nears hatching, then hatches into its horror. */
  private updateCocoon(r: Roamer, now: number): void {
    const co = r.enemy.field?.cocoon;
    if (!co) return;
    r.sprite.setVelocity(0, 0);
    r.bornAt ??= now;
    const left = co.hatchMs - (now - r.bornAt);
    if (left < 2000) r.sprite.setTint(Math.floor(now / 150) % 2 ? 0xff9ab8 : 0xffffff);
    if (left > 0) return;
    // Hatch: the cocoon is gone (no reward), a horror stands in its place.
    r.alive = false;
    r.sprite.destroy();
    const def = this.defs.find((d) => d.id === r.def.id) ?? r.def;
    this.spawn({
      ...def,
      id: `${r.def.id}_hatched_${Math.floor(now)}`,
      enemyId: co.into,
      texture: co.texture,
      anim: co.anim,
      tile: { x: Math.floor(r.sprite.x / 32), y: Math.floor(r.sprite.y / 32) },
      sight: 400,
      leash: 800,
    });
    this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.hatched'), '#ff8aa8');
  }

  /** Paradox Crystals near Peter repeat his slash from where they float. */
  private scheduleEchoes(origin: Point, aim: number, reach: number): void {
    for (const r of this.roamers) {
      const echo = r.enemy.field?.echo;
      if (!echo || !r.alive || distance(r.sprite, origin) > echo.range) continue;
      this.scene.time.delayedCall(echo.delayMs, () => {
        if (!r.alive) return;
        const from = { x: r.sprite.x, y: r.sprite.y };
        this.drawSlash(from, aim, reach);
        if (inSlash(from, aim, this.player, reach, this.tuning.slashArcDeg)) this.hitPlayer(r);
      });
    }
  }

  /** Chronos Gardener: telegraphed straight cut. True while it is cutting. */
  private updateLineCut(r: Roamer, now: number): boolean {
    const lc = r.enemy.field?.lineCut;
    if (!lc) return false;
    if (!r.cut) {
      if (now < (r.nextCutAt ?? 0) || distance(r.sprite, this.player) > lc.range) return false;
      const ang = Math.atan2(this.player.y - r.sprite.y, this.player.x - r.sprite.x);
      r.cut = { at: now + lc.windupMs, ang, from: { x: r.sprite.x, y: r.sprite.y } };
      r.sprite.setVelocity(0, 0);
      r.sprite.setTint(0xff7070);
    }
    const c = r.cut;
    const ex = c.from.x + Math.cos(c.ang) * lc.length;
    const ey = c.from.y + Math.sin(c.ang) * lc.length;
    r.sprite.setVelocity(0, 0);
    if (now < c.at) {
      this.aimLines.lineStyle(lc.width, 0xff3a2a, 0.18).lineBetween(c.from.x, c.from.y, ex, ey);
      return true;
    }
    r.cut = null;
    r.nextCutAt = now + lc.cooldownMs;
    r.sprite.clearTint();
    this.aimLines.lineStyle(3, 0xffffff, 0.9).lineBetween(c.from.x, c.from.y, ex, ey);
    this.sound.playSlash();
    // Distance from Peter to the cut segment.
    const vx = ex - c.from.x;
    const vy = ey - c.from.y;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((this.player.x - c.from.x) * vx + (this.player.y - c.from.y) * vy) / (vx * vx + vy * vy),
      ),
    );
    const d = Math.hypot(this.player.x - (c.from.x + vx * t), this.player.y - (c.from.y + vy * t));
    if (d <= lc.width / 2 + 6) this.hitPlayer(r, { mult: 1.3 });
    return true;
  }

  // ------------------------------------------------------------------ Chapter 6 enemies

  /** Heel Shadow: stands where Peter was a moment ago and strikes there. */
  private updateTrail(r: Roamer, now: number): void {
    const tr = r.enemy.field?.trail;
    if (!tr) return;
    const pos = trailPosition(this.trailLog, now, tr.delayMs);
    r.sprite.setVelocity(0, 0);
    if (pos) {
      if (Math.abs(pos.x - r.sprite.x) > 2) this.faceX(r, pos.x - r.sprite.x);
      r.sprite.setPosition(pos.x, pos.y);
    }
    const tile = `${Math.floor(r.sprite.x / 32)},${Math.floor(r.sprite.y / 32)}`;
    if (this.lightKeys.has(tile)) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.shadowBurnt'), '#fff2b0');
      this.defeatRoamer(r);
      return;
    }
    r.nextStrikeAt ??= now + tr.strikeEveryMs;
    if (now < r.nextStrikeAt) return;
    r.nextStrikeAt = now + tr.strikeEveryMs;
    const puff = this.scene.add.circle(r.sprite.x, r.sprite.y, 8, 0x2a1840, 0.6).setDepth(40);
    this.scene.tweens.add({
      targets: puff,
      radius: tr.radius,
      alpha: 0,
      duration: 260,
      onComplete: () => puff.destroy(),
    });
    if (distance(r.sprite, this.player) <= tr.radius) this.hitPlayer(r);
  }

  /** Twin Star: the two orbs circle the (hidden) body. */
  private placeOrbs(now: number): void {
    for (const r of this.roamers) {
      const tw = r.enemy.field?.twin;
      if (!tw || !r.orbs || !r.alive) continue;
      const a = ((now + r.glowOffset) / tw.periodMs) * Math.PI * 2;
      r.orbs.forEach((o, k) => {
        const ang = a + k * Math.PI;
        o.setPosition(
          r.sprite.x + (Math.cos(ang) * tw.orbitPx) / 2,
          r.sprite.y + (Math.sin(ang) * tw.orbitPx) / 2,
        );
      });
    }
  }

  /** A slash on a Twin Star: both orbs within the window, or it heals. True when an orb was hit. */
  private slashTwin(
    r: Roamer,
    origin: Point,
    aim: number,
    reach: number,
    attack: number,
    now: number,
  ): boolean {
    const tw = r.enemy.field?.twin;
    const orbs = r.orbs;
    const hitAt = r.orbHitAt;
    if (!tw || !orbs || !hitAt) return false;
    const hit = orbs.map((o) => inSlash(origin, aim, o, reach, this.tuning.slashArcDeg));
    if (!hit[0] && !hit[1]) return false;
    const pair =
      (hit[0] && hit[1]) ||
      (hit[0] && twinPaired(hitAt[1], now, tw.windowMs)) ||
      (hit[1] && twinPaired(hitAt[0], now, tw.windowMs));
    if (pair) {
      hitAt[0] = hitAt[1] = -Infinity;
      for (const o of orbs) {
        o.setTintFill(0xffffff);
        this.scene.time.delayedCall(90, () => o.active && o.clearTint());
      }
      const roll = rollHit(attack, r.enemy.defense, this.combat, this.rng);
      this.damageRoamer(r, Math.floor(roll.damage * tw.pairMult), true);
      return true;
    }
    const k = hit[0] ? 0 : 1;
    const at = now;
    hitAt[k] = at;
    orbs[k].setTint(0xffe08a);
    this.floatText(orbs[k].x, orbs[k].y - 14, this.t('action.twinOne'), '#ffe08a');
    this.scene.time.delayedCall(tw.windowMs, () => {
      if (!r.alive || hitAt[k] !== at) return;
      hitAt[k] = -Infinity;
      orbs[k].clearTint();
      // The pair merges again: it heals.
      const heal = Math.ceil(r.enemy.maxHp * tw.healPct);
      r.hp = Math.min(r.enemy.maxHp, r.hp + heal);
      this.floatText(r.sprite.x, r.sprite.y - 18, `+${heal}`, '#8fe8a0');
    });
    return true;
  }

  /** Origin Nullifier: beats, then a growing ring. True while it is busy. */
  private updateRings(r: Roamer, now: number): boolean {
    const rg = r.enemy.field?.rings;
    if (!rg) return false;
    const d = distance(r.sprite, this.player);
    if (r.ringAt === null || r.ringAt === undefined) {
      if (now < (r.nextRingAt ?? 0) || d > rg.radius + 60) return false;
      r.ringAt = now;
      r.ringDone = false;
    }
    r.sprite.setVelocity(0, 0);
    const st = ringState(now, r.ringAt, rg.beatMs, rg.ringMs, rg.radius);
    if (st.phase === 'beat') {
      if ((now - r.ringAt) % rg.beatMs < 120) r.sprite.setTintFill(0xd8b0ff);
      else r.sprite.clearTint();
      this.aimLines
        .lineStyle(1, 0xb080ff, 0.25 * st.beat)
        .strokeCircle(r.sprite.x, r.sprite.y, rg.radius);
      return true;
    }
    if (st.phase === 'ring') {
      r.sprite.clearTint();
      this.aimLines.lineStyle(4, 0xc890ff, 0.85).strokeCircle(r.sprite.x, r.sprite.y, st.radius);
      if (!r.ringDone && ringCrosses(d, st.radius)) {
        r.ringDone = true;
        if (now - this.lastDashAt <= this.tuning.dashMs + 80) {
          // Perfect dodge: Peter slips through the wave; the eye is stunned.
          const maxMp = this.session.getStats().maxMp;
          this.session.mp = Math.min(maxMp, this.session.mp + rg.perfectMp);
          r.stunUntil = now + rg.stunMs;
          r.sprite.setTint(0x8fb8ff);
          this.scene.time.delayedCall(rg.stunMs, () => r.alive && r.sprite.clearTint());
          this.floatText(
            this.player.x,
            this.player.y - 22,
            this.t('action.perfectDodge'),
            '#9fe8ff',
          );
          this.host.refreshHud();
        } else if (now >= this.invulnUntil) {
          this.hitPlayer(r);
          this.slowUntil = now + rg.slowMs;
          this.slowPct = rg.slowPct;
        }
      }
      return true;
    }
    r.ringAt = null;
    r.nextRingAt = now + rg.everyMs;
    return false;
  }

  /** Archon Construct: a laser through Peter blinks three times, then fires. True while busy. */
  private updateLaser(r: Roamer, now: number): boolean {
    const lz = r.enemy.field?.laser;
    if (!lz) return false;
    if (!r.laser) {
      if (now < (r.nextLaserAt ?? 0) || distance(r.sprite, this.player) > lz.range) return false;
      const dx = this.player.x - r.sprite.x;
      const dy = this.player.y - r.sprite.y;
      // The line runs through Peter along the axis he is farther away on.
      const across = Math.abs(dx) >= Math.abs(dy);
      const from = across
        ? { x: r.sprite.x, y: this.player.y }
        : { x: this.player.x, y: r.sprite.y };
      const sx = across ? Math.sign(dx) || 1 : 0;
      const sy = across ? 0 : Math.sign(dy) || 1;
      r.laser = {
        at: now,
        from,
        to: { x: from.x + sx * lz.length, y: from.y + sy * lz.length },
        fired: false,
      };
    }
    r.sprite.setVelocity(0, 0);
    const lsr = r.laser;
    const st = laserStage(now, lsr.at, lz.blinkMs, lz.fireMs);
    if (st.stage === 'blink') {
      const third = st.n === 3;
      if (st.lit) {
        this.aimLines
          .lineStyle(lz.width, third ? 0xffe066 : 0xff3a2a, third ? 0.5 : 0.3)
          .lineBetween(lsr.from.x, lsr.from.y, lsr.to.x, lsr.to.y);
      }
      if (third) r.sprite.setTint(0xffe066);
      return true;
    }
    if (st.stage === 'fire') {
      r.sprite.setTint(0xff7070);
      this.aimLines
        .lineStyle(lz.width, 0xffffff, 0.9)
        .lineBetween(lsr.from.x, lsr.from.y, lsr.to.x, lsr.to.y);
      if (!lsr.fired) {
        lsr.fired = true;
        this.sound.playSlash();
        if (this.segmentDistance(this.player, lsr.from, lsr.to) <= lz.width / 2 + 6) {
          this.hitPlayer(r, { mult: 1.2 });
        }
        for (const o of this.roamers) {
          if (!o.alive || !o.enemy.field?.trail) continue;
          if (this.segmentDistance(o.sprite, lsr.from, lsr.to) > lz.width / 2 + 8) continue;
          this.floatText(o.sprite.x, o.sprite.y - 18, this.t('action.shadowBurnt'), '#fff2b0');
          this.defeatRoamer(o);
        }
      }
      return true;
    }
    r.laser = null;
    r.nextLaserAt = now + lz.everyMs;
    r.sprite.clearTint();
    return false;
  }

  /** A slash on an Archon Construct during the third blink shuts its laser. */
  private shutLaser(r: Roamer, now: number): boolean {
    const lz = r.enemy.field?.laser;
    const lsr = r.laser;
    if (!lz || !lsr) return false;
    const st = laserStage(now, lsr.at, lz.blinkMs, lz.fireMs);
    if (st.stage !== 'blink' || st.n !== 3) return false;
    r.laser = null;
    r.nextLaserAt = now + lz.everyMs;
    r.sprite.setTint(0x58b8ff);
    this.scene.time.delayedCall(400, () => r.alive && r.sprite.clearTint());
    const max = this.session.getStats().maxHp;
    this.session.hp = Math.min(max, this.session.hp + lz.healHp);
    this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.laserShut'), '#58b8ff');
    this.floatText(this.player.x, this.player.y - 20, `+${lz.healHp}`, '#8fe8a0');
    this.host.refreshHud();
    return true;
  }

  private segmentDistance(p: Point, a: Point, b: Point): number {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len2));
    return Math.hypot(p.x - (a.x + vx * t), p.y - (a.y + vy * t));
  }

  // ------------------------------------------------------------------ Chapter 7 enemies

  /** Hollow Husk: moves only while Peter moves; frozen, it can be cut harder but its chest pulls. */
  private updateHusk(r: Roamer, now: number): boolean {
    const fw = r.enemy.field?.freezeWatch;
    if (!fw) return false;
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body | null;
    const speed = body ? Math.hypot(body.velocity.x, body.velocity.y) : 0;
    if (!huskFrozen(speed)) {
      if (r.frozen) r.sprite.clearTint();
      r.frozen = false;
      return false;
    }
    if (!r.frozen) r.sprite.setTint(0x9a90b8);
    r.frozen = true;
    r.sprite.setVelocity(0, 0);
    const d = distance(r.sprite, this.player);
    if (huskPulls(this.stillSince, now, fw.pullAfterMs) && d < 200) {
      const k = fw.pullSpeed / (d || 1);
      this.player.forceVelocity(
        (r.sprite.x - this.player.x) * k,
        (r.sprite.y - this.player.y) * k,
        80,
      );
      if (d <= this.tuning.enemy.attackRange + 6) this.hitPlayer(r);
    }
    return true;
  }

  /** Name Eater: breathes in; a slash on the glowing mouth chokes it. True while busy. */
  private updateInhale(r: Roamer, now: number): boolean {
    const ih = r.enemy.field?.inhale;
    if (!ih) return false;
    const d = distance(r.sprite, this.player);
    if (r.inhaleAt === null || r.inhaleAt === undefined) {
      if (now < (r.nextInhaleAt ?? 0) || d > ih.range) return false;
      r.inhaleAt = now;
    }
    r.sprite.setVelocity(0, 0);
    const st = tellStage(now, r.inhaleAt, ih.tellMs, ih.windowMs);
    if (st.stage === 'tell') {
      r.sprite.setScale(1 + ((now - r.inhaleAt) / ih.tellMs) * 0.3);
      if (st.window) r.sprite.setTint(0xc8a0ff);
      this.aimLines.lineStyle(1, 0xb48cff, 0.35).strokeCircle(r.sprite.x, r.sprite.y, ih.range);
      return true;
    }
    if (d <= ih.range) {
      this.hitPlayer(r);
      this.session.mp = Math.max(0, this.session.mp - ih.mpDrain);
      this.silencedUntil = now + ih.silenceMs;
      this.floatText(this.player.x, this.player.y - 22, this.t('action.silenced'), '#c8a0ff');
      this.host.refreshHud();
    }
    this.endInhale(r, now);
    return false;
  }

  private endInhale(r: Roamer, now: number): void {
    const ih = r.enemy.field?.inhale;
    r.inhaleAt = null;
    r.nextInhaleAt = now + (ih?.cooldownMs ?? 3000);
    r.sprite.setScale(1);
    r.sprite.clearTint();
  }

  /** A slash on a Name Eater's glowing mouth: it chokes and spits letters at its neighbours. */
  private chokeEater(r: Roamer, now: number): boolean {
    const ih = r.enemy.field?.inhale;
    if (!ih || r.inhaleAt === null || r.inhaleAt === undefined) return false;
    const st = tellStage(now, r.inhaleAt, ih.tellMs, ih.windowMs);
    if (st.stage !== 'tell' || !st.window) return false;
    this.endInhale(r, now);
    r.stunUntil = now + ih.stunMs;
    this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.choked'), '#e6dcff');
    for (const o of this.roamers) {
      if (o === r || !o.alive || o.clone || distance(o.sprite, r.sprite) > ih.chokeRadius) continue;
      this.damageRoamer(o, Math.ceil(o.enemy.maxHp * ih.chokePct), true);
    }
    return true;
  }

  /** Erasure Moths: they close in on Peter; one slash as they bunch up scatters the whole swarm. */
  private updateSwarm(r: Roamer, now: number): boolean {
    const sw = r.enemy.field?.swarm;
    if (!sw) return false;
    if (r.swarmAt === null || r.swarmAt === undefined) {
      if (now < (r.nextSwarmAt ?? 0) || distance(r.sprite, this.player) > sw.range) return false;
      r.swarmAt = now;
    }
    const st = tellStage(now, r.swarmAt, sw.gatherMs, sw.windowMs);
    if (st.stage === 'tell') {
      const left = 1 - (now - r.swarmAt) / sw.gatherMs;
      const radius = 18 + left * 70;
      this.aimLines
        .lineStyle(st.window ? 3 : 1, st.window ? 0xffffff : 0xd8ccf0, 0.7)
        .strokeCircle(this.player.x, this.player.y, radius);
      const ang = Math.atan2(r.sprite.y - this.player.y, r.sprite.x - this.player.x);
      r.sprite.setVelocity(0, 0);
      r.sprite.setPosition(
        this.player.x + Math.cos(ang) * radius,
        this.player.y + Math.sin(ang) * radius,
      );
      return true;
    }
    r.swarmAt = null;
    r.nextSwarmAt = now + sw.everyMs;
    if (now >= this.invulnUntil) {
      this.dotUntil = now + sw.dotMs;
      this.dotPerSec = sw.dotPerSec;
      this.floatText(this.player.x, this.player.y - 22, this.t('action.mothsCling'), '#e6dcff');
    }
    return false;
  }

  /** A slash while the moths bunch up around Peter scatters them for good. */
  private scatterSwarm(r: Roamer, now: number): boolean {
    const sw = r.enemy.field?.swarm;
    if (!sw || r.swarmAt === null || r.swarmAt === undefined) return false;
    const st = tellStage(now, r.swarmAt, sw.gatherMs, sw.windowMs);
    if (st.stage !== 'tell' || !st.window) return false;
    r.swarmAt = null;
    const max = this.session.getStats().maxHp;
    this.session.hp = Math.min(max, this.session.hp + sw.healHp);
    this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.swarmCut'), '#ffffff');
    this.floatText(this.player.x, this.player.y - 20, `+${sw.healHp}`, '#8fe8a0');
    this.defeatRoamer(r);
    this.host.refreshHud();
    return true;
  }

  /** Ink Hound: races a figure eight around Peter, then stands solid for a breath. */
  private updateHound(r: Roamer, now: number): boolean {
    const hd = r.enemy.field?.hound;
    if (!hd) return false;
    const solid = houndSolid(now, r.glowOffset, hd.runMs, hd.pauseMs);
    if (!solid) {
      if (distance(r.sprite, this.player) > hd.radius * 3) return false;
      const p = figureEight(this.player, now + r.glowOffset, hd.radius, hd.periodMs);
      r.sprite.setVelocity(0, 0);
      if (Math.abs(p.x - r.sprite.x) > 1) this.faceX(r, p.x - r.sprite.x);
      r.sprite.setPosition(p.x, p.y);
      r.sprite.setAlpha(0.6);
      r.bit = false;
      return true;
    }
    r.sprite.setAlpha(1);
    r.sprite.setVelocity(0, 0);
    if (!r.bit) {
      r.bit = true;
      if (distance(r.sprite, this.player) <= 34) this.hitPlayer(r, { mult: hd.biteMult });
    }
    return true;
  }

  private houndRunning(r: Roamer, now: number): boolean {
    const hd = r.enemy.field?.hound;
    return !!hd && !houndSolid(now, r.glowOffset, hd.runMs, hd.pauseMs);
  }

  /** Void Inquisitor: three chain circles close around a spot; only where all three meet is safe. */
  private updateChains(r: Roamer, now: number): boolean {
    const ct = r.enemy.field?.chainTrial;
    if (!ct) return false;
    if (!r.chains) {
      if (now < (r.nextChainAt ?? 0) || distance(r.sprite, this.player) > ct.range) return false;
      const a = this.rng() * Math.PI * 2;
      const spot = { x: this.player.x + Math.cos(a) * 40, y: this.player.y + Math.sin(a) * 40 };
      r.chains = { at: now, centers: chainCenters(spot, ct.offset, this.rng() * Math.PI) };
    }
    r.sprite.setVelocity(0, 0);
    const ch = r.chains;
    if (now < ch.at + ct.warnMs) {
      for (const c of ch.centers)
        this.aimLines.lineStyle(2, 0xe8c060, 0.55).strokeCircle(c.x, c.y, ct.radius);
      return true;
    }
    r.chains = null;
    r.nextChainAt = now + ct.everyMs;
    for (const c of ch.centers)
      this.aimLines.lineStyle(4, 0xffffff, 0.9).strokeCircle(c.x, c.y, ct.radius);
    if (chainVerdict(this.player, ch.centers, ct.radius) === 'safe') {
      this.floatText(this.player.x, this.player.y - 22, this.t('action.chainSafe'), '#e8c060');
    } else {
      this.hitPlayer(r, { mult: ct.damageMult });
    }
    return false;
  }

  /** True when a wall tile lies on the straight line between a and b. */
  private lineBlocked(a: Point, b: Point): boolean {
    const n = Math.ceil(distance(a, b) / 8);
    for (let i = 1; i < n; i++) {
      const x = Math.floor((a.x + ((b.x - a.x) * i) / n) / 32);
      const y = Math.floor((a.y + ((b.y - a.y) * i) / n) / 32);
      if (this.walls.getTileAt(x, y)?.collides) return true;
    }
    return false;
  }

  /** Undying Knight: stomp, lock aim, charge; a wall stuns it. True while it is busy charging. */
  private updateCharge(r: Roamer, now: number): boolean {
    const ch = r.enemy.field?.charge;
    if (!ch) return false;
    const c = r.charge;
    if (!c) {
      const d = distance(r.sprite, this.player);
      const chasing = r.brain.state === 'chase' || r.brain.state === 'windup';
      if (chasing && d <= ch.range && d > 48 && now >= (r.nextChargeAt ?? 0)) {
        r.charge = { phase: 'stomp', until: now + ch.stompMs, dx: 0, dy: 0, hit: false };
        r.sprite.setVelocity(0, 0);
        r.sprite.setTint(0xffd27a);
        this.scene.cameras.main.shake(90, 0.002);
        return true;
      }
      return false;
    }
    if (c.phase === 'stomp') {
      r.sprite.setVelocity(0, 0);
      if (Math.abs(this.player.x - r.sprite.x) > 2) this.faceX(r, this.player.x - r.sprite.x);
      if (now >= c.until) {
        // The aim locks now: a dodge before this moment changes nothing.
        const dx = this.player.x - r.sprite.x;
        const dy = this.player.y - r.sprite.y;
        const len = Math.hypot(dx, dy) || 1;
        r.charge = { phase: 'run', until: now + ch.maxMs, dx: dx / len, dy: dy / len, hit: false };
        r.sprite.setTint(0xff9a5a);
      }
      return true;
    }
    if (c.phase === 'run') {
      r.sprite.setVelocity(c.dx * ch.speed, c.dy * ch.speed);
      const body = r.sprite.body as Phaser.Physics.Arcade.Body | null;
      const b = body?.blocked;
      const started = now > c.until - ch.maxMs + 60;
      if (b && started && (b.left || b.right || b.up || b.down)) {
        r.charge = { ...c, phase: 'stunned', until: now + ch.stunMs };
        r.sprite.setVelocity(0, 0);
        r.sprite.setTint(0xfff27a);
        this.scene.cameras.main.shake(140, 0.005);
        this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.stunned'), '#fff27a');
        return true;
      }
      if (!c.hit && distance(r.sprite, this.player) <= this.tuning.enemy.attackRange + 6) {
        c.hit = true;
        this.hitPlayer(r, { mult: ch.hitMult });
      }
      if (now >= c.until) {
        r.charge = undefined;
        r.nextChargeAt = now + ch.cooldownMs;
        r.sprite.clearTint();
        r.sprite.setVelocity(0, 0);
        r.brain = { ...r.brain, state: 'recover', timer: this.tuning.enemy.recoverMs };
      }
      return true;
    }
    // Stunned against a wall.
    r.sprite.setVelocity(0, 0);
    if (now >= c.until) {
      r.charge = undefined;
      r.nextChargeAt = now + ch.cooldownMs;
      r.sprite.clearTint();
      r.brain = { ...r.brain, state: 'chase' };
    }
    return true;
  }

  /** Banner Carriers: glow while singing; each new verse raises the fallen around them. */
  private updateChants(now: number): void {
    for (const r of this.roamers) {
      const chant = r.enemy.field?.chant;
      if (!chant || !r.alive) continue;
      const st = chantState(now, r.glowOffset, chant.chantMs, chant.breathMs);
      if (st.chanting) r.sprite.setTint(0xff7070);
      else if (r.brain.state !== 'windup') r.sprite.clearTint();
      if (r.verse === undefined) r.verse = st.verse;
      if (st.verse === r.verse || !st.chanting) continue;
      r.verse = st.verse;
      for (const o of this.roamers) {
        if (!o.pending || distance(o.sprite, r.sprite) > chant.radius) continue;
        o.pending = false;
        o.alive = true;
        o.hp = Math.max(1, Math.ceil(o.enemy.maxHp * chant.revivePct));
        o.stunUntil = now + 300;
        o.brain = { ...o.brain, state: 'chase' };
        if (o.sprite.body) (o.sprite.body as Phaser.Physics.Arcade.Body).enable = true;
        this.scene.tweens.killTweensOf(o.sprite);
        o.sprite.setAlpha(1).setScale(1);
        this.floatText(o.sprite.x, o.sprite.y - 18, this.t('action.risen'), '#ff8080');
      }
    }
  }

  private carrierNear(r: Roamer): boolean {
    return this.roamers.some((o) => {
      const chant = o.enemy.field?.chant;
      return !!chant && o.alive && o !== r && distance(o.sprite, r.sprite) <= chant.radius;
    });
  }

  // ------------------------------------------------------------------ health bars

  private drawBars(): void {
    const g = this.bars;
    g.clear();
    const bar = (cx: number, top: number, w: number, h: number, ratio: number, color: number) => {
      const x = Math.round(cx - w / 2);
      g.fillStyle(0x05060c, 0.85).fillRect(x - 1, top - 1, w + 2, h + 2);
      g.fillStyle(color, 1).fillRect(x, top, Math.round(w * Math.max(0, Math.min(1, ratio))), h);
    };
    const hpColor = (ratio: number) =>
      ratio > 0.5 ? 0x4ade80 : ratio > 0.25 ? 0xfacc15 : 0xef4444;
    for (const r of this.roamers) {
      if (!r.alive || r.def.ambush || !r.sprite.active) continue;
      const ratio = r.shownRatio ?? r.hp / r.enemy.maxHp;
      const top = r.sprite.y - r.sprite.displayHeight * r.sprite.originY - 6;
      bar(r.sprite.x, top, 22, 3, ratio, ratio > 0.5 ? 0xf87171 : 0xef4444);
    }
    // Peter's bars appear once he can fight.
    if (!this.flag('has_broken_blade')) return;
    const p = this.player.sprite;
    const stats = this.session.getStats();
    const top = p.y - p.displayHeight * p.originY - 9;
    const hp = this.session.hp / stats.maxHp;
    bar(p.x, top, 26, 3, hp, hpColor(hp));
    bar(p.x, top + 5, 26, 2, this.session.mp / stats.maxMp, 0x38bdf8);
  }

  // ------------------------------------------------------------------ the Elder

  private updateElder(now: number): void {
    const elder = this.elder;
    if (!elder) return;
    const ally = this.tuning.ally;
    // Too far behind (map entry, a dash, a loop): he catches up at once.
    if (distance(elder, this.player) > 200) {
      elder.setPosition(this.player.x - 20, this.player.y + 6);
      elder.setVelocity(0, 0);
      return;
    }
    let foe: Roamer | null = null;
    let best = Infinity;
    for (const r of this.roamers) {
      if (!r.alive || r.def.ambush) continue;
      const engaged =
        r.brain.state === 'chase' || r.brain.state === 'windup' || r.brain.state === 'recover';
      const d = distance(r.sprite, elder);
      if ((engaged || d < 90) && distance(r.sprite, this.player) < 170 && d < best) {
        best = d;
        foe = r;
      }
    }
    const moveToward = (p: Point, speed: number): void => {
      const dx = p.x - elder.x;
      const dy = p.y - elder.y;
      const len = Math.hypot(dx, dy) || 1;
      elder.setVelocity((dx / len) * speed, (dy / len) * speed);
      if (Math.abs(dx) > 2) elder.setFlipX(dx < 0);
    };
    if (foe) {
      if (best > ally.reach) {
        moveToward(foe.sprite, ally.speed);
      } else {
        elder.setVelocity(0, 0);
        if (now >= this.nextAllyHit) {
          this.nextAllyHit = now + ally.cooldownMs;
          const kuro = this.allyTexture === 'npc_kuro';
          const hit = rollHit(
            kuro ? ally.attack * 2 : ally.attack,
            foe.enemy.defense,
            this.combat,
            this.rng,
          );
          if (kuro && now >= this.nextShiftAt) {
            // Branch Shift: the foe is pushed into the other branch for 3 s.
            this.nextShiftAt = now + KURO_SHIFT_MS;
            foe.shiftedUntil = now + 3000;
            foe.sprite.setVelocity(0, 0);
            foe.sprite.setAlpha(0.2);
            this.scene.time.delayedCall(3000, () => foe && foe.alive && foe.sprite.setAlpha(1));
            this.floatText(
              foe.sprite.x,
              foe.sprite.y - 18,
              this.t('action.branchShift'),
              '#b09aff',
            );
          }
          const glow = this.scene.add
            .circle(foe.sprite.x, foe.sprite.y, 12, 0xffd666, 0.5)
            .setDepth(41);
          this.scene.tweens.add({
            targets: glow,
            alpha: 0,
            scale: 1.8,
            duration: 260,
            onComplete: () => glow.destroy(),
          });
          this.damageRoamer(foe, hit.damage, hit.critical);
        }
      }
      return;
    }
    const d = distance(elder, this.player);
    if (d > 40) {
      moveToward(this.player, d > 90 ? ally.speed * 1.3 : ally.speed);
    } else {
      elder.setVelocity(0, 0);
    }
  }

  // ------------------------------------------------------------------ effects

  private drawSlash(origin: Point, aim: number, reach: number): void {
    const g = this.scene.add.graphics().setDepth(42);
    const half = (this.tuning.slashArcDeg * Math.PI) / 360;
    g.lineStyle(3, 0xbfefff, 0.9);
    g.beginPath();
    g.arc(origin.x, origin.y, reach - 4, aim - half, aim + half);
    g.strokePath();
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 160, onComplete: () => g.destroy() });
  }

  public floatText(x: number, y: number, text: string, color: string): void {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.scene.tweens.add({
      targets: label,
      y: y - 16,
      alpha: 0,
      duration: 650,
      onComplete: () => label.destroy(),
    });
  }
}
