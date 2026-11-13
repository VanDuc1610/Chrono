import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { FLAGS, type GameSession } from '../state/GameSession';
import {
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
import type { MapRoamerDefinition } from './MapTypes';

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
}

const ELDER_FLAG = 'elder_joined';
const ELDER_PARTED_FLAG = 'elder_parted';

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
  private readonly defs: MapRoamerDefinition[];
  private nextSwing = 0;
  private nextDash = 0;
  private nextSkill = 0;
  private nextAllyHit = 0;
  private invulnUntil = 0;
  private defeated = false;
  private ambushFired = false;
  private hudMp = -1;

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
    this.defs = defs;
    for (const def of defs) this.spawn(def);
    if (this.roamers.some((r) => r.def.hunter)) this.announceHunters();
    scene.physics.add.collider(this.group, walls);
    scene.physics.add.collider(this.group, this.group);
    this.spawnElder();

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
  }

  private get elderActive(): boolean {
    return this.flag(ELDER_FLAG) && !this.flag(ELDER_PARTED_FLAG);
  }

  /** The Elder follows Peter (unless he already stands on this map as an NPC). */
  private spawnElder(): void {
    if (!this.elderActive || !this.scene.textures.exists('npc_elder')) return;
    const standing = this.scene.children.list.some(
      (o) => o instanceof Phaser.GameObjects.Sprite && o.texture.key === 'npc_elder' && o.visible,
    );
    if (standing) return;
    this.elder = this.scene.physics.add.sprite(this.player.x - 26, this.player.y + 4, 'npc_elder');
    this.elder.body?.setSize(14, 12);
    this.elder.body?.setOffset(9, 18);
    if (this.scene.anims.exists('npc_elder_idle')) this.elder.play('npc_elder_idle');
  }

  // ------------------------------------------------------------------ frame

  public update(delta: number): void {
    const paused = this.host.isPaused() || this.defeated;
    if (paused) {
      for (const r of this.roamers) if (r.alive) r.sprite.setVelocity(0, 0);
      this.elder?.setVelocity(0, 0);
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
    for (const r of this.roamers) {
      if (!r.alive || now < r.stunUntil) continue;
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
      const reflect = r.enemy.field?.reflect;
      if (reflect) {
        const glow = isGlowing(now, r.glowOffset, reflect.everyMs, reflect.glowMs);
        if (glow && !r.glowShown) r.sprite.setTint(0xff2a2a);
        if (!glow && r.glowShown && r.brain.state !== 'windup') r.sprite.clearTint();
        r.glowShown = glow;
      }
      if (out.strike && distance(r.sprite, target) <= this.tuning.enemy.attackRange + 10) {
        this.hitPlayer(r);
      }
    }
    this.updateElder(now);
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
    const attack = this.session.getStats().attack;
    for (const r of this.roamers) {
      if (!r.alive) continue;
      if (!inSlash(origin, aim, r.sprite, reach, this.tuning.slashArcDeg)) continue;
      const hit = rollHit(attack, r.enemy.defense, this.combat, this.rng);
      if (this.defended(r, hit.damage)) continue;
      this.damageRoamer(r, hit.damage, hit.critical);
    }
  }

  /** Right click: Temporal Strike around Peter (needs Temporal Sight and MP). */
  public skill(): void {
    const now = this.scene.time.now;
    if (!this.canAct || !this.flag(FLAGS.temporalSight) || now < this.nextSkill) return;
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
    const attack = this.session.getStats().attack;
    for (const r of this.roamers) {
      if (!r.alive || distance(r.sprite, this.player) > this.tuning.skillRadius + 10) continue;
      const damage = Math.max(
        this.combat.skillMinDamage,
        Math.floor(attack * this.combat.skillMultiplier - r.enemy.defense),
      );
      this.damageRoamer(r, damage, false);
      // Time slows around them: their wind-up is lost.
      r.brain = { ...r.brain, state: 'recover', timer: this.tuning.enemy.recoverMs };
      r.sprite.clearTint();
    }
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
    this.nextDash = now + this.tuning.dashCooldownMs;
    this.player.sprite.setAlpha(0.55);
    this.scene.time.delayedCall(this.tuning.dashMs + 40, () => this.player.sprite.setAlpha(1));
  }

  /**
   * Enemy defences against a slash (Temporal Strike goes through): a front shield blocks it, a
   * red glow sends part of it back to Peter. True when the hit did not land.
   */
  private defended(r: Roamer, damage: number): boolean {
    const field = r.enemy.field;
    if (!field) return false;
    const now = this.scene.time.now;
    if (
      field.frontShieldDeg &&
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

  private hitPlayer(r: Roamer): void {
    const now = this.scene.time.now;
    if (now < this.invulnUntil || this.defeated) return;
    const { damage } = rollHit(
      r.enemy.attack,
      this.session.getStats().defense,
      this.combat,
      this.rng,
    );
    const floor = r.def.ambush ? 1 : 0;
    this.session.hp = Math.max(floor, this.session.hp - damage);
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    const away = Math.atan2(this.player.y - r.sprite.y, this.player.x - r.sprite.x);
    const k = this.tuning.knockback;
    this.player.forceVelocity(Math.cos(away) * k, Math.sin(away) * k, 130);
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
    if (r.hp <= 0) this.defeatRoamer(r);
  }

  private defeatRoamer(r: Roamer): void {
    r.alive = false;
    r.sprite.setVelocity(0, 0);
    if (r.sprite.body) (r.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
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
    const rewards = this.session.claimEnemyRewards(r.enemy, this.rng);
    this.host.notify(
      this.t('action.defeated', { name: r.enemy.name }),
      this.session.describeRewards(rewards),
    );
    if (r.def.defeatedFlag) this.session.setFlag(r.def.defeatedFlag);
    const group = r.def.group;
    if (group && this.roamers.every((o) => o.def.group !== group || !o.alive)) {
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
          const hit = rollHit(ally.attack, foe.enemy.defense, this.combat, this.rng);
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
