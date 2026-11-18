import { backToIdle, playAction } from './action/ActorActions';
import { CombatFx } from './action/CombatFx';
import { rarityOf, type Rarity } from '../systems/inventory/GearRules';
import type { MeleeClass } from '../systems/inventory/InventoryTypes';
import { burnTick, lifestealHeal, thornsDamage } from '../systems/inventory/GearRules';
import { segmentDistance } from '../systems/action/GeometryRules';
import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { FLAGS, type GameSession } from '../state/GameSession';
import {
  chantState,
  distance,
  facingFromAngle,
  inParryWindow,
  inSlash,
  isGlowing,
  resolveActionTuning,
  rollHit,
  shieldBlocks,
  thinkRoamer,
  type ActionTuning,
  type Point,
} from '../systems/action/ActionRules';
import { ShotSystem } from '../systems/action/ShotSystem';
import type { SkillDatabase, SkillDef } from '../systems/action/AuthorityRules';
import { AuthorityPowers } from './action/Authority';
import { meleeCritBonus, meleeShape } from '../systems/action/WeaponRules';
import { SoundSystem } from '../systems/audio/SoundSystem';
import type { CombatTuning } from '../systems/combat/CombatTypes';
import type { Translate } from '../ui/Strings';
import { huskFrozen } from './Chapter7Rules';
import { inTickWindow, type PeterMove } from './Chapter8Rules';
import type { MapRoamerDefinition, MapStrikeTarget, TilePoint } from './MapTypes';

/** Chapter 9 traits read from enemies.json (typed in Chapter9Rules until CombatTypes is free). */
import {
  ActionHost,
  COMPANIONS,
  CombatExtension,
  ELDER_FLAG,
  ELDER_PARTED_FLAG,
  KURO_FLAG,
  KURO_LEFT_FLAG,
  PeterAct,
  Roamer,
  f9,
} from './action/ActionTypes';
import * as Companions from './action/Companions';
import * as FieldFoes from './action/FieldFoes';
import * as Hazards from './action/Hazards';
import * as Roamers from './action/Roamers';
import * as Shots from './action/Shots';
import * as Visuals from './action/Visuals';
import { keyCode } from '../ui/keys';
export type { ActionHost, CombatExtension, PeterAct } from './action/ActionTypes';

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
  private nextShot = 0;
  /** T-84: the boss fight on this map, while it lasts. */
  public extension: CombatExtension | null = null;
  /** HP Peter cannot drop below from boss blows (a scripted rescue fight). */
  public bossHpFloor = 0;
  /** A scripted boss whose blows take this share of Peter's max HP (0: normal damage). */
  public bossBlowPct = 0;
  private readonly shots: ShotSystem;
  private nextDash = 0;
  private nextSkill = 0;
  private nextAllyHit = 0;
  /** Peter's Authority skills on Z / X / C (2026-11-18). */
  public readonly powers: AuthorityPowers;
  public readonly skillDb: SkillDatabase | null;
  private invulnUntil = 0;
  private defeated = false;
  private ambushFired = false;
  private hudMp = -1;
  /** When Peter last started a dodge (perfect dodge against snipers). */
  private lastDashAt = -Infinity;
  /** When Peter last dodged (boss fights read it for last-instant dodges). */
  public get lastDash(): number {
    return this.lastDashAt;
  }
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
    this.shots = new ShotSystem(scene);
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
    const shift = scene.input.keyboard?.addKey(keyCode('dodge'));
    const onShift = (): void => this.dash();
    shift?.on('down', onShift);
    // T-84: F fires the ranged weapon toward the cursor.
    const fKey = scene.input.keyboard?.addKey(keyCode('ranged'));
    const onFire = (): void => {
      const p = scene.input.activePointer.positionToCamera(
        scene.cameras.main,
      ) as Phaser.Math.Vector2;
      this.fire(p.x, p.y);
    };
    fKey?.on('down', onFire);
    // Authority skills: Z / X / C (rebindable), aimed at the cursor like the slash.
    this.fx = new CombatFx(scene, () => host.pfx?.() ?? null);
    this.skillDb = (scene.cache.json.get('data_skills') as SkillDatabase | undefined) ?? null;
    this.powers = new AuthorityPowers({
      scene,
      player,
      session,
      t,
      roamers: () => this.roamers,
      strike: (r, mult, critBonus = 0) =>
        this.strikeRoamer(
          r,
          this.session.getStats().attack,
          this.scene.time.now,
          mult,
          critBonus + (this.session.gear.totals.crit ?? 0),
          'none',
        ),
      wound: (r, damage) => this.damageRoamer(r, damage, false),
      slay: (r) => {
        r.hp = 0;
        this.defeatRoamer(r);
      },
      floatText: (x, y, text, color) => this.floatText(x, y, text, color),
      extension: () => this.extension,
      blocked: (x, y) => {
        const tile = this.walls.getTileAtWorldXY(x, y, true);
        return !tile || tile.collides;
      },
      shelter: (ms) => {
        this.invulnUntil = Math.max(this.invulnUntil, this.scene.time.now + ms);
      },
      refreshHud: () => this.host.refreshHud(),
      fx: this.fx,
    });
    const skillKeys = (['skill1', 'skill2', 'skill3'] as const).map((action, i) => {
      const key = scene.input.keyboard?.addKey(keyCode(action));
      const cast = (): void => {
        this.castAuthority(i);
      };
      key?.on('down', cast);
      return { key, cast };
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointerdown', onPointer);
      shift?.off('down', onShift);
      fKey?.off('down', onFire);
      for (const k of skillKeys) k.key?.off('down', k.cast);
      this.shots.destroy();
    });
  }

  /** The skill in slot 0-2, if Peter knows one there. */
  public skillIn(slot: number): SkillDef | null {
    const id = this.session.skillSlots[slot];
    return (id && this.skillDb?.skills.find((s) => s.id === id)) || null;
  }

  /**
   * Z / X / C: cast the Authority skill in that slot toward the cursor (needs MP, off cooldown;
   * a Name Eater's silence stops it as it stops Temporal Strike). True when it was cast.
   */
  public castAuthority(slot: number): boolean {
    const now = this.scene.time.now;
    if (!this.canAct) return false;
    const def = this.skillIn(slot);
    const say = (key: string, color: string): false => {
      this.floatText(this.player.x, this.player.y - 22, this.t(key), color);
      return false;
    };
    if (!def) return say('skill.empty', '#8b97b8');
    if (this.refused('skill')) return false;
    if (now < this.silencedUntil) return say('action.silenced', '#c8a0ff');
    if (!this.powers.ready(def, now)) return say('skill.cooldown', '#8b97b8');
    if (this.session.mp < def.mpCost) return say('action.noMp', '#8fb8ff');
    this.session.mp -= def.mpCost;
    const p = this.scene.input.activePointer.positionToCamera(
      this.scene.cameras.main,
    ) as Phaser.Math.Vector2;
    const aim = Math.atan2(p.y - this.player.y, p.x - this.player.x);
    const anim =
      def.authority === 'memory' || def.authority === 'origin'
        ? 'peter_temporal_sight'
        : def.authority === 'possibility'
          ? 'peter_dash'
          : 'peter_attack';
    this.player.playAction(anim, facingFromAngle(aim), 380);
    this.sound.playSkill(def.authority);
    this.powers.cast(def, aim);
    this.extension?.onAction?.('skill');
    this.host.refreshHud();
    return true;
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
    return Hazards.updatePools.call(this.getHazardsContext(), now, delta);
  }

  // ------------------------------------------------------------------ strike targets

  private strikes: { def: MapStrikeTarget; lastHit: number }[] = [];
  private onStrikeGroup: ((def: MapStrikeTarget) => void) | null = null;

  /** Objects Peter hits with a slash (resonance pillars); `onGroup` runs when a group completes. */
  public setStrikeTargets(defs: MapStrikeTarget[], onGroup: (def: MapStrikeTarget) => void): void {
    return Hazards.setStrikeTargets.call(this.getHazardsContext(), defs, onGroup);
  }

  private strikeTargets(origin: Point, aim: number, reach: number, now: number): void {
    return Hazards.strikeTargets.call(this.getHazardsContext(), origin, aim, reach, now);
  }

  // ------------------------------------------------------------------ setup

  private flag = (f: string): boolean => this.session.getFlag(f);

  /**
   * Story flags changed (dialogue effects): roamers whose condition now holds appear (e.g. the
   * ambush the moment time stops), those whose condition no longer holds fade away.
   */
  public syncSpawns(): void {
    return Roamers.syncSpawns.call(this.getRoamersContext());
  }

  private fadeOut(r: Roamer): void {
    return Roamers.fadeOut.call(this.getRoamersContext(), r);
  }

  private isVisible(def: MapRoamerDefinition): boolean {
    return Roamers.isVisible.call(this.getRoamersContext(), def);
  }

  private huntedAnnounced = false;

  private announceHunters(): void {
    return Roamers.announceHunters.call(this.getRoamersContext());
  }

  private spawn(def: MapRoamerDefinition): void {
    return Roamers.spawn.call(this.getRoamersContext(), def);
  }

  /** Glowing floor discs (Chapter 6). */
  public setLightTiles(tiles: TilePoint[]): void {
    return Hazards.setLightTiles.call(this.getHazardsContext(), tiles);
  }

  /** A Hollow Archivist's decoy: same look and moves, 1 HP, harmless, no reward. */
  private spawnClone(src: Roamer, k: number): void {
    return Roamers.spawnClone.call(this.getRoamersContext(), src, k);
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
    return Companions.spawnElder.call(this.getCompanionsContext());
  }

  private get companionTexture(): string | null {
    for (const [flag, texture] of COMPANIONS) if (this.flag(flag)) return texture;
    return null;
  }

  /** Chapter 8: the act's companion follows Peter too (unless standing here as an NPC). */
  private spawnCompanion(): void {
    return Companions.spawnCompanion.call(this.getCompanionsContext());
  }

  private updateCompanion(now: number): void {
    return Companions.updateCompanion.call(this.getCompanionsContext(), now);
  }

  /** Assimilators near Peter learn the move he just made. */
  private teach(move: PeterMove): void {
    return FieldFoes.teach.call(this.getFieldFoesContext(), move);
  }

  /** A repeated move against an Assimilator: it shrugs it off and strikes back. */
  private mimicCounter(r: Roamer, move: PeterMove): boolean {
    return FieldFoes.mimicCounter.call(this.getFieldFoesContext(), r, move);
  }

  // ------------------------------------------------------------------ Chapter 8 enemies

  /** Doom Bell: three tolls, then a wave; a slash after the first toll cracks it. */
  private updateBell(r: Roamer, now: number): boolean {
    return FieldFoes.updateBell.call(this.getFieldFoesContext(), r, now);
  }

  /** A slash between the first and second toll cracks the bell. */
  private crackBell(r: Roamer, now: number): boolean {
    return FieldFoes.crackBell.call(this.getFieldFoesContext(), r, now);
  }

  /** Twin-Era Legionnaire: its shield turns (red) to Peter's companion now and then. */
  private shieldTurned(r: Roamer, now: number): boolean {
    return FieldFoes.shieldTurned.call(this.getFieldFoesContext(), r, now);
  }

  /** Second-Hand Warden: the hand sweeps round it; touching it hurts. */
  private updateSweep(r: Roamer, now: number): void {
    return FieldFoes.updateSweep.call(this.getFieldFoesContext(), r, now);
  }

  // ------------------------------------------------------------------ Chapter 9 enemies

  /** Nexus Sentinel: red line, lunge, blade stuck in the floor. True while it is busy. */
  private updateThrust(r: Roamer, now: number): boolean {
    return FieldFoes.updateThrust.call(this.getFieldFoesContext(), r, now);
  }

  /** A slash on a Sentinel: hard while its blade is stuck, weak against its guard. */
  private thrustMult(r: Roamer, now: number): number {
    return FieldFoes.thrustMult.call(this.getFieldFoesContext(), r, now);
  }

  /** Nexus Inquisitor: four blows, then an open guard. True while a chain runs. */
  private updateChain4(r: Roamer, now: number): boolean {
    return FieldFoes.updateChain4.call(this.getFieldFoesContext(), r, now);
  }

  /** The Inquisitor's guard: only open right after its fourth blow. */
  private chainGuarded(r: Roamer, now: number): boolean {
    return FieldFoes.chainGuarded.call(this.getFieldFoesContext(), r, now);
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
    this.updateShots(delta, now);
    this.animateRoamers(now);
    this.powers.update(now);
    this.gearRegen(now);
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
      if (f9(r).thrust && this.updateThrust(r, now)) continue;
      if (f9(r).chain4 && this.updateChain4(r, now)) continue;
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
        const slowed = r.slowUntil && now < r.slowUntil ? 1 - (r.slowPct ?? 0) : 1;
        const v = r.speed * out.pace * slowed;
        r.sprite.setVelocity((dx / len) * v, (dy / len) * v);
        if (Math.abs(dx) > 2) this.faceX(r, dx);
      } else {
        r.sprite.setVelocity(0, 0);
      }
      if (r.brain.state === 'windup' && Math.abs(target.x - r.sprite.x) > 2) {
        this.faceX(r, target.x - r.sprite.x);
      }
      if (r.brain.state === 'windup' && before !== 'windup') {
        r.sprite.setTint(0xff7070);
        playAction(r.sprite, 'windup');
      }
      if (r.brain.state !== 'windup' && before === 'windup') {
        r.sprite.clearTint();
        // The blow (action frames: lunge and strike), or back to idle if it was called off.
        if (out.strike) playAction(r.sprite, 'strike');
        else backToIdle(r.sprite);
      }
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
    return Roamers.faceX.call(this.getRoamersContext(), r, dx);
  }

  /** Next point toward `target` around walls (tile BFS, recomputed every 350 ms). */
  private routeTo(r: Roamer, target: Point, now: number): Point {
    return Roamers.routeTo.call(this.getRoamersContext(), r, target, now);
  }

  // ------------------------------------------------------------------ Peter

  private get canAct(): boolean {
    return !this.host.isPaused() && !this.defeated;
  }

  /** Left click: slash toward the cursor (needs the blade). */
  public slash(worldX: number, worldY: number): void {
    const now = this.scene.time.now;
    if (!this.canAct || now < this.nextSwing) return;
    if (this.refused('slash')) return;
    const fists = this.session.canSlash ? null : (this.extension?.unarmed?.() ?? null);
    if (!this.session.canSlash && !fists) return;
    const weapon = fists ? undefined : this.session.weaponStats;
    const reach = fists?.reach ?? weapon?.reach ?? this.tuning.reach;
    this.nextSwing = now + (weapon?.swingMs ?? this.tuning.swingMs);
    const origin = { x: this.player.x, y: this.player.y };
    const aim = Math.atan2(worldY - origin.y, worldX - origin.x);
    this.player.playAction('peter_attack', facingFromAngle(aim), 380);
    this.sound.playSlash();
    this.drawSlash(origin, aim, reach);
    this.strikeTargets(origin, aim, reach, now);
    const attack = this.session.getStats().attack;
    const shape = meleeShape(this.session.meleeClass);
    const critBonus =
      meleeCritBonus(this.session.meleeClass) +
      this.powers.takeCrit() +
      (this.session.gear.totals.crit ?? 0);
    const fistMult = fists?.mult ?? 1;
    this.extension?.onAction?.('slash');
    let landed = false;
    const echoed: { r: Roamer; damage: number }[] = [];
    this.scheduleEchoes(origin, aim, reach);
    for (const r of this.roamers) {
      if (!r.alive || now < (r.shiftedUntil ?? 0)) continue;
      if (r.enemy.field?.twin) {
        if (this.slashTwin(r, origin, aim, reach, attack, now)) landed = true;
        continue;
      }
      if (!inSlash(origin, aim, r.sprite, reach, shape.arcDeg)) continue;
      landed = true;
      const dealt = this.strikeRoamer(r, attack, now, shape.damageMult, critBonus);
      if (dealt !== null) echoed.push({ r, damage: dealt });
    }
    if (
      this.extension?.onSlash(origin, aim, reach, {
        attack,
        arcDeg: shape.arcDeg,
        mult: shape.damageMult * fistMult,
        critBonus,
        echoPct: weapon?.echoPct ?? 0,
      })
    )
      landed = true;
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

  /**
   * One blow (slash or shot) on one roamer through every defence. Returns the damage dealt, or
   * null when it was turned aside (shield, parry, bell, mimic...).
   */
  private strikeRoamer(
    r: Roamer,
    attack: number,
    now: number,
    mult = 1,
    critBonus = 0,
    fx: 'melee' | 'ranged' | 'none' = 'melee',
  ): number | null {
    if (this.shutLaser(r, now)) return null;
    if (this.chokeEater(r, now)) {
      const dmg = rollHit(attack, r.enemy.defense, this.combat, this.rng, mult).damage * 2;
      this.damageRoamer(r, dmg, true);
      return null;
    }
    if (this.scatterSwarm(r, now)) return null;
    if (this.mimicCounter(r, 'slash')) return null;
    if (this.crackBell(r, now)) return null;
    const parry = r.enemy.field?.parry;
    if (parry && inParryWindow(r.brain.state, r.brain.timer, parry.flashMs)) {
      // Parried: no damage, but the spear is knocked aside and the guard drops.
      r.brain = { ...r.brain, state: 'recover', timer: parry.staggerMs };
      r.sprite.setTint(0x8fb8ff);
      this.scene.time.delayedCall(parry.staggerMs, () => r.alive && r.sprite.clearTint());
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.parried'), '#cfe8ff');
      this.sound.playSlash();
      return null;
    }
    const tuning = critBonus
      ? { ...this.combat, critChance: this.combat.critChance + critBonus }
      : this.combat;
    const hit = rollHit(attack, r.enemy.defense, tuning, this.rng, mult);
    if (this.defended(r, hit.damage)) return null;
    const stunned = r.charge?.phase === 'stunned';
    const frozen = r.frozen ? (r.enemy.field?.freezeWatch?.frozenMult ?? 1) : 1;
    const m =
      (stunned ? (r.enemy.field?.charge?.stunnedDamageMult ?? 1) : 1) *
      frozen *
      this.thrustMult(r, now);
    const dealt = Math.floor(hit.damage * m);
    this.damageRoamer(r, dealt, hit.critical || stunned);
    if (fx === 'ranged') this.fx.shotHit(r.sprite, this.rarityIn('ranged'));
    else if (fx === 'melee') this.fx.impact(r.sprite, hit.critical, this.rarityIn('weapon'));
    if (hit.critical && fx !== 'none') this.sound.playCrit();
    this.gearOnHit(dealt, r);
    return dealt;
  }

  private nextRegen = 0;
  /** Slash trails, hit sparks and skill bursts. */
  public readonly fx: CombatFx;

  /**
   * Gear on a landed blow (equipment.json): lifesteal heals, mpOnHit refills MP, and on a roamer
   * slowOnHit slows it for 1.5 s and burnOnHit sets 3 burn ticks. Boss fights call this too.
   */
  public gearOnHit(dealt: number, r?: Roamer): void {
    if (dealt <= 0 || this.defeated) return;
    const gear = this.session.gear;
    const stats = this.session.getStats();
    const heal = lifestealHeal(dealt, gear);
    if (heal > 0 && this.session.hp < stats.maxHp) {
      this.session.hp = Math.min(stats.maxHp, this.session.hp + heal);
      this.floatText(this.player.x + 8, this.player.y - 26, `+${heal}`, '#7dff9a');
      this.fx.motes({ x: this.player.x, y: this.player.y - 8 }, '#7dff9a', 3);
    }
    const mp = gear.totals.mpOnHit ?? 0;
    if (mp > 0) this.session.mp = Math.min(stats.maxMp, this.session.mp + mp);
    if (heal > 0 || mp > 0) this.host.refreshHud();
    if (!r || !r.alive) return;
    const now = this.scene.time.now;
    const slow = gear.totals.slowOnHit ?? 0;
    if (slow > 0) {
      const still = r.slowUntil !== undefined && r.slowUntil > now ? (r.slowPct ?? 0) : 0;
      r.slowUntil = now + 1500;
      r.slowPct = Math.max(still, slow);
      r.sprite.setTint(0x8fd0ff);
    }
    const tick = burnTick(dealt, gear);
    if (tick > 0 && (!r.burn || r.burn.damage <= tick))
      r.burn = { left: 3, every: 1000, next: now + 1000, damage: tick };
  }

  /** Gear regen: `regen` HP every 5 s on the map. */
  private gearRegen(now: number): void {
    if (now < this.nextRegen) return;
    this.nextRegen = now + 5000;
    const regen = this.session.gear.totals.regen ?? 0;
    const max = this.session.getStats().maxHp;
    if (regen <= 0 || this.defeated || this.session.hp >= max || this.session.hp <= 0) return;
    this.session.hp = Math.min(max, this.session.hp + regen);
    this.floatText(this.player.x, this.player.y - 26, `+${regen}`, '#7dff9a');
    this.fx.motes({ x: this.player.x, y: this.player.y - 8 }, '#7dff9a');
    this.host.refreshHud();
  }

  /** Rarity of what is worn in a slot (for the hit colours). */
  private rarityIn(slot: 'weapon' | 'ranged'): Rarity {
    const id = this.session.equipment[slot];
    return id ? rarityOf(this.session.gearDb, id) : 'common';
  }

  /** F: shoot the ranged weapon toward the cursor (T-84). */
  public fire(worldX: number, worldY: number): void {
    return Shots.fire.call(this.getShotsContext(), worldX, worldY);
  }

  private updateShots(delta: number, now: number): void {
    return Shots.updateShots.call(this.getShotsContext(), delta, now);
  }

  /** Memory Wraiths: a missed slash lets them blink behind Peter, then wind up (0.4 s to dodge). */
  private blinkOnWhiff(origin: Point, aim: number): void {
    return Shots.blinkOnWhiff.call(this.getShotsContext(), origin, aim);
  }

  /** Right click: Temporal Strike around Peter (needs Temporal Sight and MP). */
  public skill(): void {
    const now = this.scene.time.now;
    if (!this.canAct || !this.flag(FLAGS.temporalSight) || now < this.nextSkill) return;
    if (this.refused('skill')) return;
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
      const chg = r.enemy.field?.charge;
      if (chg && r.charge?.phase === 'stomp') {
        r.charge = { ...r.charge, phase: 'stunned', until: now + chg.stunMs };
        r.sprite.setTint(0xfff27a);
        this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.stunned'), '#fff27a');
      }
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
    this.extension?.onAction?.('skill');
    this.extension?.onSkill(
      { x: this.player.x, y: this.player.y },
      this.tuning.skillRadius,
      attack,
    );
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
    this.nextDash =
      now + Math.max(200, this.tuning.dashCooldownMs - (this.session.gear.totals.dashCut ?? 0));
    if (now < this.dotUntil) {
      this.dotUntil = 0;
      this.floatText(this.player.x, this.player.y - 22, this.t('action.brushed'), '#e6dcff');
    }
    this.sound.playDodge();
    // Dash sheet (crouch, lunge, stretch with after-images, recover); a faint fade if it is missing.
    if (this.scene.anims.exists('peter_dash_down')) {
      this.player.playAction(
        'peter_dash',
        facingFromAngle(Math.atan2(y, x)),
        this.tuning.dashMs + 90,
      );
    } else {
      this.player.sprite.setAlpha(0.55);
      this.scene.time.delayedCall(this.tuning.dashMs + 40, () => this.player.sprite.setAlpha(1));
    }
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
    this.extension?.onAction?.('dash');
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
    if (f9(r).chain4 && this.chainGuarded(r, now)) {
      this.floatText(r.sprite.x, r.sprite.y - 18, this.t('action.offBeat'), '#e5c158');
      this.sound.playSlash();
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
    this.session.hp = Math.max(floor, this.session.hp - this.powers.absorb(damage));
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    const away = Math.atan2(this.player.y - r.sprite.y, this.player.x - r.sprite.x);
    const k = this.tuning.knockback;
    this.player.forceVelocity(Math.cos(away) * k, Math.sin(away) * k, 130);
    if (opts.stunMs) {
      const stun = opts.stunMs;
      this.scene.time.delayedCall(130, () => this.player.forceVelocity(0, 0, stun));
    }
    this.player.playAction('peter_hurt', this.player.getMovementSystem().getLastFacing(), 260);
    this.sound.playHurt();
    this.player.sprite.setTint(0xff5050);
    this.scene.time.delayedCall(160, () => this.player.sprite.clearTint());
    this.scene.cameras.main.shake(120, 0.004);
    this.floatText(this.player.x, this.player.y - 20, `-${damage}`, '#ff6b6b');
    this.host.refreshHud();
    const thorns = thornsDamage(damage, this.session.gear);
    if (thorns > 0 && r.alive) this.damageRoamer(r, thorns, false);

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
   * T-84: a boss blow (`attack` × `mult`, then × `scale`) from `from`, through Peter's
   * invulnerability (a dodge avoids it). `slowMs` slows him afterwards. False when it did not land.
   */
  public bossHit(attack: number, mult: number, from: Point, scale: number, slowMs = 0): number {
    const now = this.scene.time.now;
    if (now < this.invulnUntil || this.defeated) return 0;
    const { damage } = rollHit(
      attack,
      this.session.getStats().defense,
      this.combat,
      this.rng,
      mult,
    );
    const raw =
      this.bossBlowPct > 0
        ? Math.round(this.session.getStats().maxHp * this.bossBlowPct)
        : Math.round(damage * scale);
    const dealt = this.powers.absorb(Math.max(1, raw));
    this.session.hp = Math.max(this.bossHpFloor, this.session.hp - dealt);
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    const away = Math.atan2(this.player.y - from.y, this.player.x - from.x);
    const k = this.tuning.knockback;
    this.player.forceVelocity(Math.cos(away) * k, Math.sin(away) * k, 130);
    if (slowMs > 0) {
      this.slowUntil = now + slowMs;
      this.slowPct = 0.45;
    }
    this.player.playAction('peter_hurt', this.player.getMovementSystem().getLastFacing(), 260);
    this.sound.playHurt();
    this.player.sprite.setTint(0xff5050);
    this.scene.time.delayedCall(160, () => this.player.sprite.clearTint());
    this.scene.cameras.main.shake(120, 0.004);
    this.floatText(this.player.x, this.player.y - 20, `-${dealt}`, '#ff6b6b');
    this.host.refreshHud();
    const thorns = thornsDamage(dealt, this.session.gear);
    if (thorns > 0) this.extension?.onThorns?.(thorns);
    if (this.session.hp <= 0) {
      this.defeated = true;
      this.host.onPlayerDefeated();
    }
    return dealt;
  }

  /** Temporal Strike is sealed for `ms` (Peter's other self copies it). */
  /** Pulls Peter toward `to` for `ms` (Bran's chain), overriding his own steps. */
  public yank(to: Point, speed: number, ms: number): void {
    const ang = Math.atan2(to.y - this.player.y, to.x - this.player.x);
    this.player.forceVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed, ms);
  }

  public silence(ms: number): void {
    this.silencedUntil = Math.max(this.silencedUntil, this.scene.time.now + ms);
  }

  /** The boss fight forbids this move now: say why and refuse it. */
  private refused(kind: PeterAct): boolean {
    const why = this.extension?.blocked?.(kind);
    if (!why) return false;
    this.floatText(this.player.x, this.player.y - 22, why, '#9ad7ff');
    return true;
  }

  /** A judgment that no dodge escapes (Imperial Verdict's sentences): `amount` HP, no knockback. */
  public directHit(amount: number): void {
    if (this.defeated) return;
    this.session.hp = Math.max(this.bossHpFloor, this.session.hp - this.powers.absorb(amount));
    this.player.sprite.setTint(0xff5050);
    this.scene.time.delayedCall(200, () => this.player.sprite.clearTint());
    this.scene.cameras.main.shake(160, 0.005);
    this.floatText(this.player.x, this.player.y - 20, `-${amount}`, '#ff6b6b');
    this.host.refreshHud();
    if (this.session.hp <= 0) {
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
    const dealt = this.powers.absorb(
      Math.max(1, damage - Math.floor(this.session.getStats().defense / 2)),
    );
    this.session.hp = Math.max(0, this.session.hp - dealt);
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    this.player.playAction('peter_hurt', this.player.getMovementSystem().getLastFacing(), 260);
    this.sound.playHurt();
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
    return Roamers.damageRoamer.call(this.getRoamersContext(), r, damage, critical);
  }

  /**
   * Life in the approved enemy sprites without new art (T-85): a breath while they roam, a crouch
   * that deepens through the wind-up, a stretch in a charge, a flinch when struck. Mechanics that
   * scale a sprite themselves (a Name Eater's breath) run after this and take over.
   */
  private animateRoamers(now: number): void {
    return Roamers.animateRoamers.call(this.getRoamersContext(), now);
  }

  private defeatRoamer(r: Roamer): void {
    return Roamers.defeatRoamer.call(this.getRoamersContext(), r);
  }

  /** The enemy is gone for good: burst, fade, rewards, flags. */
  private finalDefeat(r: Roamer): void {
    return Roamers.finalDefeat.call(this.getRoamersContext(), r);
  }

  /** The ambusher withdraws (after the rescue). */
  public dismissAmbushers(): void {
    return Roamers.dismissAmbushers.call(this.getRoamersContext());
  }

  // ------------------------------------------------------------------ Chapter 4 enemies

  /** Ghost Sniper: aims a line at Peter, white at the end, then fires. */
  private updateSniper(r: Roamer, now: number): void {
    return Roamers.updateSniper.call(this.getRoamersContext(), r, now);
  }

  /** Branch Phantom rhythm: solid for `solidMs` of each `everyMs`. */
  private isSolid(r: Roamer, now: number): boolean {
    return Roamers.isSolid.call(this.getRoamersContext(), r, now);
  }

  private updatePhase(r: Roamer, now: number): void {
    return Roamers.updatePhase.call(this.getRoamersContext(), r, now);
  }

  /** Unborn Cocoon: pulses faster as it nears hatching, then hatches into its horror. */
  private updateCocoon(r: Roamer, now: number): void {
    return Roamers.updateCocoon.call(this.getRoamersContext(), r, now);
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
    return FieldFoes.updateLineCut.call(this.getFieldFoesContext(), r, now);
  }

  // ------------------------------------------------------------------ Chapter 6 enemies

  /** Heel Shadow: stands where Peter was a moment ago and strikes there. */
  private updateTrail(r: Roamer, now: number): void {
    return FieldFoes.updateTrail.call(this.getFieldFoesContext(), r, now);
  }

  /** Twin Star: the two orbs circle the (hidden) body. */
  private placeOrbs(now: number): void {
    return FieldFoes.placeOrbs.call(this.getFieldFoesContext(), now);
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
    return FieldFoes.slashTwin.call(this.getFieldFoesContext(), r, origin, aim, reach, attack, now);
  }

  /** Origin Nullifier: beats, then a growing ring. True while it is busy. */
  private updateRings(r: Roamer, now: number): boolean {
    return FieldFoes.updateRings.call(this.getFieldFoesContext(), r, now);
  }

  /** Archon Construct: a laser through Peter blinks three times, then fires. True while busy. */
  private updateLaser(r: Roamer, now: number): boolean {
    return FieldFoes.updateLaser.call(this.getFieldFoesContext(), r, now);
  }

  /** A slash on an Archon Construct during the third blink shuts its laser. */
  private shutLaser(r: Roamer, now: number): boolean {
    return FieldFoes.shutLaser.call(this.getFieldFoesContext(), r, now);
  }

  private segmentDistance(p: Point, a: Point, b: Point): number {
    return segmentDistance(p, a, b);
  }

  // ------------------------------------------------------------------ Chapter 7 enemies

  /** Hollow Husk: moves only while Peter moves; frozen, it can be cut harder but its chest pulls. */
  private updateHusk(r: Roamer, now: number): boolean {
    return FieldFoes.updateHusk.call(this.getFieldFoesContext(), r, now);
  }

  /** Name Eater: breathes in; a slash on the glowing mouth chokes it. True while busy. */
  private updateInhale(r: Roamer, now: number): boolean {
    return FieldFoes.updateInhale.call(this.getFieldFoesContext(), r, now);
  }

  private endInhale(r: Roamer, now: number): void {
    return FieldFoes.endInhale.call(this.getFieldFoesContext(), r, now);
  }

  /** A slash on a Name Eater's glowing mouth: it chokes and spits letters at its neighbours. */
  private chokeEater(r: Roamer, now: number): boolean {
    return FieldFoes.chokeEater.call(this.getFieldFoesContext(), r, now);
  }

  /** Erasure Moths: they close in on Peter; one slash as they bunch up scatters the whole swarm. */
  private updateSwarm(r: Roamer, now: number): boolean {
    return FieldFoes.updateSwarm.call(this.getFieldFoesContext(), r, now);
  }

  /** A slash while the moths bunch up around Peter scatters them for good. */
  private scatterSwarm(r: Roamer, now: number): boolean {
    return FieldFoes.scatterSwarm.call(this.getFieldFoesContext(), r, now);
  }

  /** Ink Hound: races a figure eight around Peter, then stands solid for a breath. */
  private updateHound(r: Roamer, now: number): boolean {
    return FieldFoes.updateHound.call(this.getFieldFoesContext(), r, now);
  }

  private houndRunning(r: Roamer, now: number): boolean {
    return FieldFoes.houndRunning.call(this.getFieldFoesContext(), r, now);
  }

  /** Void Inquisitor: three chain circles close around a spot; only where all three meet is safe. */
  private updateChains(r: Roamer, now: number): boolean {
    return FieldFoes.updateChains.call(this.getFieldFoesContext(), r, now);
  }

  /** True when a wall tile lies on the straight line between a and b. */
  private lineBlocked(a: Point, b: Point): boolean {
    return Hazards.lineBlocked.call(this.getHazardsContext(), a, b);
  }

  /** Undying Knight: stomp, lock aim, charge; a wall stuns it. True while it is busy charging. */
  private updateCharge(r: Roamer, now: number): boolean {
    return Roamers.updateCharge.call(this.getRoamersContext(), r, now);
  }

  /** Banner Carriers: glow while singing; each new verse raises the fallen around them. */
  private updateChants(now: number): void {
    return Roamers.updateChants.call(this.getRoamersContext(), now);
  }

  private carrierNear(r: Roamer): boolean {
    return Roamers.carrierNear.call(this.getRoamersContext(), r);
  }

  // ------------------------------------------------------------------ health bars

  private drawBars(): void {
    return Visuals.drawBars.call(this.getVisualsContext());
  }

  // ------------------------------------------------------------------ the Elder

  private updateElder(now: number): void {
    return Companions.updateElder.call(this.getCompanionsContext(), now);
  }

  // ------------------------------------------------------------------ effects

  private drawSlash(origin: Point, aim: number, reach: number): void {
    const cls = this.session.meleeClass as MeleeClass;
    this.fx.slash(origin, aim, reach, meleeShape(cls).arcDeg, cls, this.rarityIn('weapon'));
  }

  /**
   * A label rising off a sprite. Numbers pop (T-85 UI): they burst in large and settle; a critical
   * ("123!") is bigger, golden-edged and shakes; heals ("+40") float up green.
   */
  public floatText(x: number, y: number, text: string, color: string): void {
    return Visuals.floatText.call(this.getVisualsContext(), x, y, text, color);
  }

  private companionsContext: Companions.CompanionsContext | null = null;
  private getCompanionsContext(): Companions.CompanionsContext {
    // Accessor-backed contexts retain live private state without allocating per frame.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return (this.companionsContext ??= {
      get allyTexture() {
        return self.allyTexture;
      },
      get scene() {
        return self.scene;
      },
      get elder() {
        return self.elder;
      },
      set elder(value) {
        self.elder = value;
      },
      get player() {
        return self.player;
      },
      get companionTexture() {
        return self.companionTexture;
      },
      get companion() {
        return self.companion;
      },
      set companion(value) {
        self.companion = value;
      },
      get tuning() {
        return self.tuning;
      },
      get roamers() {
        return self.roamers;
      },
      get nextCompanionHit() {
        return self.nextCompanionHit;
      },
      set nextCompanionHit(value) {
        self.nextCompanionHit = value;
      },
      get combat() {
        return self.combat;
      },
      get rng() {
        return self.rng;
      },
      damageRoamer: self.damageRoamer.bind(self),
      get nextAllyHit() {
        return self.nextAllyHit;
      },
      set nextAllyHit(value) {
        self.nextAllyHit = value;
      },
      get nextShiftAt() {
        return self.nextShiftAt;
      },
      set nextShiftAt(value) {
        self.nextShiftAt = value;
      },
      floatText: self.floatText.bind(self),
      get t() {
        return self.t;
      },
    });
  }

  private roamersContext: Roamers.RoamersContext | null = null;
  private getRoamersContext(): Roamers.RoamersContext {
    // Accessor-backed contexts retain live private state without allocating per frame.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return (this.roamersContext ??= {
      get defs() {
        return self.defs;
      },
      get roamers() {
        return self.roamers;
      },
      isVisible: self.isVisible.bind(self),
      spawn: self.spawn.bind(self),
      announceHunters: self.announceHunters.bind(self),
      fadeOut: self.fadeOut.bind(self),
      get elder() {
        return self.elder;
      },
      set elder(value) {
        self.elder = value;
      },
      get elderActive() {
        return self.elderActive;
      },
      spawnElder: self.spawnElder.bind(self),
      get scene() {
        return self.scene;
      },
      get flag() {
        return self.flag;
      },
      set flag(value) {
        self.flag = value;
      },
      get session() {
        return self.session;
      },
      get huntedAnnounced() {
        return self.huntedAnnounced;
      },
      set huntedAnnounced(value) {
        self.huntedAnnounced = value;
      },
      get host() {
        return self.host;
      },
      get group() {
        return self.group;
      },
      get tuning() {
        return self.tuning;
      },
      get rng() {
        return self.rng;
      },
      get walls() {
        return self.walls;
      },
      get player() {
        return self.player;
      },
      floatText: self.floatText.bind(self),
      spawnClone: self.spawnClone.bind(self),
      defeatRoamer: self.defeatRoamer.bind(self),
      carrierNear: self.carrierNear.bind(self),
      finalDefeat: self.finalDefeat.bind(self),
      get t() {
        return self.t;
      },
      faceX: self.faceX.bind(self),
      get aimLines() {
        return self.aimLines;
      },
      lineBlocked: self.lineBlocked.bind(self),
      get lastDashAt() {
        return self.lastDashAt;
      },
      set lastDashAt(value) {
        self.lastDashAt = value;
      },
      get sound() {
        return self.sound;
      },
      hitPlayer: self.hitPlayer.bind(self),
      isSolid: self.isSolid.bind(self),
    });
  }

  private fieldfoesContext: FieldFoes.FieldFoesContext | null = null;
  private getFieldFoesContext(): FieldFoes.FieldFoesContext {
    // Accessor-backed contexts retain live private state without allocating per frame.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return (this.fieldfoesContext ??= {
      get roamers() {
        return self.roamers;
      },
      get player() {
        return self.player;
      },
      floatText: self.floatText.bind(self),
      get t() {
        return self.t;
      },
      hitPlayer: self.hitPlayer.bind(self),
      get aimLines() {
        return self.aimLines;
      },
      get scene() {
        return self.scene;
      },
      get session() {
        return self.session;
      },
      get combat() {
        return self.combat;
      },
      get rng() {
        return self.rng;
      },
      damageRoamer: self.damageRoamer.bind(self),
      get companion() {
        return self.companion;
      },
      set companion(value) {
        self.companion = value;
      },
      segmentDistance: self.segmentDistance.bind(self),
      get sound() {
        return self.sound;
      },
      get trailLog() {
        return self.trailLog;
      },
      set trailLog(value) {
        self.trailLog = value;
      },
      faceX: self.faceX.bind(self),
      get lightKeys() {
        return self.lightKeys;
      },
      set lightKeys(value) {
        self.lightKeys = value;
      },
      defeatRoamer: self.defeatRoamer.bind(self),
      get tuning() {
        return self.tuning;
      },
      get lastDashAt() {
        return self.lastDashAt;
      },
      set lastDashAt(value) {
        self.lastDashAt = value;
      },
      get host() {
        return self.host;
      },
      get invulnUntil() {
        return self.invulnUntil;
      },
      set invulnUntil(value) {
        self.invulnUntil = value;
      },
      get slowUntil() {
        return self.slowUntil;
      },
      set slowUntil(value) {
        self.slowUntil = value;
      },
      get slowPct() {
        return self.slowPct;
      },
      set slowPct(value) {
        self.slowPct = value;
      },
      get stillSince() {
        return self.stillSince;
      },
      set stillSince(value) {
        self.stillSince = value;
      },
      get silencedUntil() {
        return self.silencedUntil;
      },
      set silencedUntil(value) {
        self.silencedUntil = value;
      },
      endInhale: self.endInhale.bind(self),
      get dotUntil() {
        return self.dotUntil;
      },
      set dotUntil(value) {
        self.dotUntil = value;
      },
      get dotPerSec() {
        return self.dotPerSec;
      },
      set dotPerSec(value) {
        self.dotPerSec = value;
      },
    });
  }

  private hazardsContext: Hazards.HazardsContext | null = null;
  private getHazardsContext(): Hazards.HazardsContext {
    // Accessor-backed contexts retain live private state without allocating per frame.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return (this.hazardsContext ??= {
      get roamers() {
        return self.roamers;
      },
      get scene() {
        return self.scene;
      },
      get pools() {
        return self.pools;
      },
      set pools(value) {
        self.pools = value;
      },
      get player() {
        return self.player;
      },
      get session() {
        return self.session;
      },
      get slowUntil() {
        return self.slowUntil;
      },
      set slowUntil(value) {
        self.slowUntil = value;
      },
      get slowPct() {
        return self.slowPct;
      },
      set slowPct(value) {
        self.slowPct = value;
      },
      get baseSpeed() {
        return self.baseSpeed;
      },
      set baseSpeed(value) {
        self.baseSpeed = value;
      },
      get strikes() {
        return self.strikes;
      },
      set strikes(value) {
        self.strikes = value;
      },
      get onStrikeGroup() {
        return self.onStrikeGroup;
      },
      set onStrikeGroup(value) {
        self.onStrikeGroup = value;
      },
      get flag() {
        return self.flag;
      },
      set flag(value) {
        self.flag = value;
      },
      get tuning() {
        return self.tuning;
      },
      floatText: self.floatText.bind(self),
      get t() {
        return self.t;
      },
      get lightKeys() {
        return self.lightKeys;
      },
      set lightKeys(value) {
        self.lightKeys = value;
      },
      get walls() {
        return self.walls;
      },
    });
  }

  private shotsContext: Shots.ShotsContext | null = null;
  private getShotsContext(): Shots.ShotsContext {
    // Accessor-backed contexts retain live private state without allocating per frame.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return (this.shotsContext ??= {
      get scene() {
        return self.scene;
      },
      get session() {
        return self.session;
      },
      get canAct() {
        return self.canAct;
      },
      get nextShot() {
        return self.nextShot;
      },
      set nextShot(value) {
        self.nextShot = value;
      },
      refused: self.refused.bind(self),
      floatText: self.floatText.bind(self),
      get player() {
        return self.player;
      },
      get t() {
        return self.t;
      },
      get host() {
        return self.host;
      },
      get extension() {
        return self.extension;
      },
      set extension(value) {
        self.extension = value;
      },
      get sound() {
        return self.sound;
      },
      get shots() {
        return self.shots;
      },
      get roamers() {
        return self.roamers;
      },
      strikeRoamer: self.strikeRoamer.bind(self),
      get walls() {
        return self.walls;
      },
      faceX: self.faceX.bind(self),
    });
  }

  private visualsContext: Visuals.VisualsContext | null = null;
  private getVisualsContext(): Visuals.VisualsContext {
    // Accessor-backed contexts retain live private state without allocating per frame.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return (this.visualsContext ??= {
      get bars() {
        return self.bars;
      },
      get roamers() {
        return self.roamers;
      },
      get flag() {
        return self.flag;
      },
      set flag(value) {
        self.flag = value;
      },
      get player() {
        return self.player;
      },
      get session() {
        return self.session;
      },
      get scene() {
        return self.scene;
      },
    });
  }
}
