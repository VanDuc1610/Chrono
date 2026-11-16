import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { FLAGS, GameSession, getSession } from '../state/GameSession';
import {
  facingFromAngle,
  inSlash,
  resolveActionTuning,
  rollHit,
  type ActionTuning,
} from '../systems/action/ActionRules';
import { ShotSystem, type ShotTarget } from '../systems/action/ShotSystem';
import { meleeCritBonus, meleeShape, rangedAttack } from '../systems/action/WeaponRules';
import { SoundSystem } from '../systems/audio/SoundSystem';
import {
  gateBlow,
  inBeam,
  isGlowing,
  onRing,
  phaseIndex,
  pickMove,
  targetReady,
} from '../systems/boss/BossRules';
import type { BossDatabase, BossMove, BossProfile, BossTarget } from '../systems/boss/BossTypes';
import type { CombatTuning, IEnemyDefinition } from '../systems/combat/CombatTypes';
import { KeyboardPlayerController } from '../systems/input/KeyboardPlayerController';
import { TopDownMovementSystem } from '../systems/movement/TopDownMovementSystem';
import { getStrings, type Translate } from '../ui/Strings';
import { pickDialogue } from '../world/MapRegistry';
import type { CombatSceneData } from './CombatScene';
import type { ExplorationSceneData } from './ExplorationScene';

type Pt = { x: number; y: number };

/** Arena rectangle on the 640×360 screen (HUD above and below). */
const ARENA = { x: 24, y: 58, w: 592, h: 248 };
const PETER_SPEED = 130;
const QUICK_KEYS = 4;

/** Boss profiles from bosses.json (loaded by PreloadScene). */
export function bossProfile(scene: Phaser.Scene, enemyId: string): BossProfile | undefined {
  const db = scene.cache.json.get('data_bosses') as BossDatabase | undefined;
  return db?.bosses.find((b) => b.id === enemyId);
}

interface Hazard {
  /** Hits Peter when true (checked every frame until `until`). */
  test(p: Pt): boolean;
  mult: number;
  until: number;
  hit: boolean;
  slowMs?: number;
  draw?: (g: Phaser.GameObjects.Graphics, now: number) => void;
  /** Drop it once it has hit (bolts) instead of staying until `until`. */
  once?: boolean;
}

/**
 * T-84: a boss fought in real time. Peter moves (WASD), slashes (left click), shoots (F), dodges
 * (Shift, invulnerable), uses Temporal Strike (right click) and quick items (1-4). The boss walks,
 * telegraphs a move from its current phase, performs it, rests, and defends itself its own way.
 */
export class BossArenaScene extends Phaser.Scene {
  private session!: GameSession;
  private t!: Translate;
  private data_!: CombatSceneData;
  private profile!: BossProfile;
  private enemy!: IEnemyDefinition;
  private tuning!: ActionTuning;
  private combat!: CombatTuning;
  private sound_ = SoundSystem.getInstance();

  private player!: Player;
  private boss!: Phaser.Physics.Arcade.Sprite;
  private shots!: ShotSystem;
  private fx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Graphics;
  private peterLine!: Phaser.GameObjects.Text;
  private quickLine!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;

  private hp = 0;
  private armorBroken = false;
  private phase = 0;
  private state: 'intro' | 'walk' | 'telegraph' | 'act' | 'stunned' | 'done' = 'intro';
  private stateUntil = 0;
  private stunUntil = 0;
  private lastMove: string | null = null;
  private facing = 0;
  private slowBossUntil = 0;
  private charge: { dx: number; dy: number; speed: number; until: number; move: BossMove } | null =
    null;
  private hazards: Hazard[] = [];
  private telegraphs: {
    draw: (g: Phaser.GameObjects.Graphics, now: number) => void;
    until: number;
  }[] = [];

  private targets: { def: BossTarget; obj: Phaser.GameObjects.Container; pos: Pt }[] = [];
  private targetsDone = new Set<string>();
  private targetsOpen = false;
  private startedAt = 0;

  private nextSwing = 0;
  private nextShot = 0;
  private nextDash = 0;
  private nextSkill = 0;
  private invulnUntil = 0;
  private peterSlowUntil = 0;
  private ended = false;
  private rng: () => number = Math.random;

  constructor() {
    super({ key: 'BossArenaScene' });
  }

  public init(data: CombatSceneData): void {
    this.data_ = data;
    this.session = getSession(this);
    this.t = getStrings(this);
    this.hazards = [];
    this.telegraphs = [];
    this.targets = [];
    this.targetsDone = new Set();
    this.targetsOpen = false;
    this.armorBroken = false;
    this.phase = 0;
    this.state = 'intro';
    this.charge = null;
    this.lastMove = null;
    this.ended = false;
    this.nextSwing = this.nextShot = this.nextDash = this.nextSkill = 0;
    this.invulnUntil = this.peterSlowUntil = this.slowBossUntil = this.stunUntil = 0;
  }

  public create(): void {
    const profile = bossProfile(this, this.data_.enemyId);
    const enemy = this.session.getEnemyDefinition(this.data_.enemyId);
    if (!profile || !enemy) throw new Error(`[BossArena] no profile for ${this.data_.enemyId}`);
    this.profile = profile;
    this.enemy = enemy;
    this.tuning = resolveActionTuning(this.session.database.player.action);
    this.combat = this.session.database.player.combat;
    this.hp = enemy.maxHp;

    this.drawArena();
    this.physics.world.setBounds(ARENA.x, ARENA.y, ARENA.w, ARENA.h);

    const controller = new KeyboardPlayerController(this);
    this.player = new Player(
      this,
      ARENA.x + ARENA.w / 2,
      ARENA.y + ARENA.h - 40,
      controller,
      new TopDownMovementSystem(),
      { speed: PETER_SPEED },
    );
    this.player.setArmed(true);
    this.player.sprite.setDepth(30);

    const key = enemy.spriteKey;
    this.boss = this.physics.add.sprite(ARENA.x + ARENA.w / 2, ARENA.y + 70, key, 0);
    this.boss.setScale((enemy.spriteScale ?? 1.4) * 0.85).setDepth(29);
    this.boss.setCollideWorldBounds(true);
    if (this.anims.exists(`${key}_idle`)) this.boss.play(`${key}_idle`);

    this.shots = new ShotSystem(this);
    this.fx = this.add.graphics().setDepth(20);
    // Telegraphs and beams stay inside the arena.
    const clip = this.make.graphics({}, false);
    clip.fillStyle(0xffffff).fillRect(ARENA.x, ARENA.y, ARENA.w, ARENA.h);
    this.fx.setMask(clip.createGeometryMask());
    this.spawnTargets();
    this.createHud();
    this.bindInput();

    this.startedAt = this.time.now;
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.showBanner(profile.intro ?? enemy.name, 3200);
    this.stateUntil = this.time.now + 1600;
  }

  // ------------------------------------------------------------------ setup

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }

  private drawArena(): void {
    const a = this.profile.arena;
    const g = this.add.graphics().setDepth(0);
    const tile = 16;
    for (let y = ARENA.y; y < ARENA.y + ARENA.h; y += tile)
      for (let x = ARENA.x; x < ARENA.x + ARENA.w; x += tile) {
        const alt = ((x - ARENA.x) / tile + (y - ARENA.y) / tile) % 2 === 0;
        g.fillStyle(this.color(alt ? a.floorAlt : a.floor), 1);
        g.fillRect(x, y, tile, Math.min(tile, ARENA.y + ARENA.h - y));
      }
    if (a.water) {
      // Shallow standing water around the edge (decoration only).
      g.fillStyle(0x2c6f93, 0.35);
      g.fillRect(ARENA.x, ARENA.y, ARENA.w, 10);
      g.fillRect(ARENA.x, ARENA.y + ARENA.h - 10, ARENA.w, 10);
    }
    g.lineStyle(3, this.color(a.edge), 0.9);
    g.strokeRect(ARENA.x - 2, ARENA.y - 2, ARENA.w + 4, ARENA.h + 4);
  }

  private spawnTargets(): void {
    for (const def of this.profile.defense.targets ?? []) {
      const pos = { x: ARENA.x + def.x * ARENA.w, y: ARENA.y + def.y * ARENA.h };
      const base = this.add.rectangle(0, 6, 22, 8, 0x3a4656);
      const lens = this.add.circle(0, -4, 8, 0x55606e).setStrokeStyle(2, 0x9aa7b8);
      const label = this.add
        .text(0, -22, def.label, { fontFamily: 'monospace', fontSize: '8px', color: '#9aa7b8' })
        .setOrigin(0.5);
      const obj = this.add.container(pos.x, pos.y, [base, lens, label]).setDepth(15);
      this.targets.push({ def, obj, pos });
    }
  }

  private createHud(): void {
    this.hud = this.add.graphics().setDepth(90);
    this.add
      .text(320, 8, this.enemy.name.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd38a',
      })
      .setOrigin(0.5, 0)
      .setDepth(91);
    this.peterLine = this.add
      .text(24, 326, '', { fontFamily: 'monospace', fontSize: '9px', color: '#dce7f7' })
      .setDepth(91);
    this.quickLine = this.add
      .text(24, 340, '', { fontFamily: 'monospace', fontSize: '8px', color: '#8fb8ff' })
      .setDepth(91);
    this.add
      .text(616, 340, this.t('boss.controls'), {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#7d8aa3',
      })
      .setOrigin(1, 0)
      .setDepth(91);
    this.banner = this.add
      .text(320, 40, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#0c101cd8',
        padding: { left: 8, right: 8, top: 3, bottom: 3 },
        wordWrap: { width: 560 },
        align: 'center',
      })
      .setOrigin(0.5, 0)
      .setDepth(92)
      .setVisible(false);
  }

  private bindInput(): void {
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) this.skill();
      else if (p.leftButtonDown()) this.slash(p.worldX, p.worldY);
    });
    const kb = this.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    kb.addKey(K.SHIFT).on('down', () => this.dash());
    kb.addKey(K.F).on('down', () => {
      const p = this.input.activePointer;
      this.fire(p.worldX, p.worldY);
    });
    [K.ONE, K.TWO, K.THREE, K.FOUR].forEach((code, i) =>
      kb.addKey(code).on('down', () => this.useQuick(i)),
    );
  }

  // ------------------------------------------------------------------ frame

  public update(_time: number, delta: number): void {
    if (this.ended) return;
    const now = this.time.now;
    this.session.tick(delta);
    const slowed = now < this.peterSlowUntil;
    this.player.setSpeed(slowed ? PETER_SPEED * 0.55 : PETER_SPEED);
    this.player.update();
    const maxMp = this.session.getStats().maxMp;
    this.session.mp = Math.min(maxMp, this.session.mp + (this.tuning.mpRegenPerSec * delta) / 1000);

    this.updateBoss(now, delta);
    this.updateHazards(now);
    this.updateShots(delta, now);
    this.updateTargets(now);
    this.draw(now);
  }

  private get hpPct(): number {
    return this.hp / this.enemy.maxHp;
  }

  private get peter(): Pt {
    return { x: this.player.sprite.x, y: this.player.sprite.y };
  }

  private updateBoss(now: number, delta: number): void {
    const phase = this.profile.phases[this.phase];
    const slow = now < this.slowBossUntil ? 0.4 : 1;
    const speed = this.profile.speed * (phase.speedMult ?? 1) * slow;
    const toPeter = Math.atan2(this.peter.y - this.boss.y, this.peter.x - this.boss.x);

    if (this.state === 'stunned') {
      this.boss.setVelocity(0, 0);
      if (now >= this.stunUntil) {
        this.boss.clearTint();
        // A missed chance: the stun targets must be struck again.
        if (!this.armorBroken)
          for (const t of this.targets)
            if (t.def.effect === 'stun') this.targetsDone.delete(t.def.id);
        this.toWalk(now);
      }
      return;
    }
    if (this.charge) {
      const c = this.charge;
      this.boss.setVelocity(c.dx * c.speed * slow, c.dy * c.speed * slow);
      const body = this.boss.body as Phaser.Physics.Arcade.Body;
      const blocked =
        body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down;
      if (blocked && c.move.type === 'charge' && c.move.stunOnWallMs) {
        this.charge = null;
        this.cameras.main.shake(180, 0.006);
        this.sound_.playSlash();
        this.stun(now, c.move.stunOnWallMs, this.t('boss.wallStun'));
        return;
      }
      if (now >= c.until) {
        this.charge = null;
        this.toWalk(now);
      }
      return;
    }
    if (this.state === 'intro' || this.state === 'walk') {
      const d = Math.hypot(this.peter.x - this.boss.x, this.peter.y - this.boss.y);
      if (d > this.profile.radius + 26) {
        this.boss.setVelocity(Math.cos(toPeter) * speed, Math.sin(toPeter) * speed);
      } else this.boss.setVelocity(0, 0);
      this.face(toPeter);
      if (now >= this.stateUntil) this.beginMove(now);
    } else {
      this.boss.setVelocity(0, 0);
      if (this.state === 'act' && now >= this.stateUntil) this.toWalk(now);
    }
    void delta;
  }

  private face(angle: number): void {
    this.facing = angle;
    this.boss.setFlipX(Math.cos(angle) < 0);
  }

  private toWalk(now: number): void {
    this.state = 'walk';
    this.stateUntil = now + this.profile.phases[this.phase].pauseMs;
  }

  private stun(now: number, ms: number, text: string): void {
    this.state = 'stunned';
    this.stunUntil = now + ms;
    this.charge = null;
    this.telegraphs = [];
    this.boss.setVelocity(0, 0);
    this.boss.setTint(0xfff27a);
    this.floatText(this.boss.x, this.boss.y - 34, text, '#fff27a');
  }

  // ------------------------------------------------------------------ boss moves

  private beginMove(now: number): void {
    const phase = this.profile.phases[this.phase];
    const id = pickMove(phase, this.lastMove, this.rng);
    this.lastMove = id;
    const move = this.profile.moves[id];
    if (!move) return this.toWalk(now);
    this.state = 'telegraph';
    this.stateUntil = now + move.telegraphMs;
    this.floatText(this.boss.x, this.boss.y - 40, move.label, '#ff9a7a');
    this.boss.setTint(0xff8a8a);
    const fire = (): void => {
      if (this.state !== 'telegraph' || this.ended) return; // stunned meanwhile
      this.boss.clearTint();
      this.perform(move, this.time.now);
    };
    switch (move.type) {
      case 'slam':
        this.slam(move, now);
        break;
      case 'charge': {
        const ang = Math.atan2(this.peter.y - this.boss.y, this.peter.x - this.boss.x);
        this.face(ang);
        const from = { x: this.boss.x, y: this.boss.y };
        this.telegraphs.push({
          until: now + move.telegraphMs,
          draw: (g) => {
            g.lineStyle(this.profile.radius, 0xff4040, 0.18);
            g.lineBetween(
              from.x,
              from.y,
              from.x + Math.cos(ang) * 700,
              from.y + Math.sin(ang) * 700,
            );
          },
        });
        this.time.delayedCall(move.telegraphMs, () => {
          if (this.state !== 'telegraph' || this.ended) return;
          this.boss.clearTint();
          this.state = 'act';
          this.charge = {
            dx: Math.cos(ang),
            dy: Math.sin(ang),
            speed: move.speed,
            until: this.time.now + move.durationMs,
            move,
          };
          this.stateUntil = this.time.now + move.durationMs + 50;
        });
        return;
      }
      case 'beam': {
        const ang = Math.atan2(this.peter.y - this.boss.y, this.peter.x - this.boss.x);
        this.face(ang);
        const from = { x: this.boss.x, y: this.boss.y };
        this.telegraphs.push({
          until: now + move.telegraphMs,
          draw: (g) => {
            g.lineStyle(move.width, 0xff4040, 0.2);
            g.lineBetween(
              from.x,
              from.y,
              from.x + Math.cos(ang) * 700,
              from.y + Math.sin(ang) * 700,
            );
          },
        });
        this.time.delayedCall(move.telegraphMs, fire);
        return;
      }
      default:
        this.time.delayedCall(move.telegraphMs, fire);
    }
  }

  /** Slam circles are placed at once (telegraphed where they will land). */
  private slam(move: Extract<BossMove, { type: 'slam' }>, now: number): void {
    const count = move.count ?? 1;
    for (let i = 0; i < count; i++) {
      const spot =
        i === 0
          ? this.peter
          : {
              x: this.peter.x + (this.rng() * 2 - 1) * (move.scatter ?? 80),
              y: this.peter.y + (this.rng() * 2 - 1) * (move.scatter ?? 80),
            };
      const at = now + move.telegraphMs + i * (move.staggerMs ?? 0);
      this.telegraphs.push({
        until: at,
        draw: (g, t) => {
          const k = 1 - Math.max(0, at - t) / (move.telegraphMs + i * (move.staggerMs ?? 0));
          g.fillStyle(0xff3030, 0.12 + 0.25 * k);
          g.fillCircle(spot.x, spot.y, move.radius);
          g.lineStyle(1, 0xff7070, 0.8);
          g.strokeCircle(spot.x, spot.y, move.radius * k);
        },
      });
      this.time.delayedCall(at - now, () => {
        if (this.ended) return;
        this.burst(spot, move.radius, 0x9fdcff);
        this.hazards.push({
          test: (p) => Math.hypot(p.x - spot.x, p.y - spot.y) <= move.radius,
          mult: move.mult,
          until: this.time.now + 120,
          hit: false,
        });
      });
    }
    const total = move.telegraphMs + (count - 1) * (move.staggerMs ?? 0);
    this.time.delayedCall(total, () => {
      if (this.state === 'telegraph') {
        this.boss.clearTint();
        this.state = 'act';
        this.stateUntil = this.time.now + 300;
      }
    });
  }

  private perform(move: BossMove, now: number): void {
    this.state = 'act';
    if (move.type === 'ring') {
      const rings = move.rings ?? 1;
      const center = { x: this.boss.x, y: this.boss.y };
      for (let i = 0; i < rings; i++) {
        const start = now + i * (move.intervalMs ?? 600);
        const away = Math.atan2(this.peter.y - center.y, this.peter.x - center.x);
        // The gap opens to one side of Peter, so he has to move to it (or dash through).
        const gap = move.gapDeg
          ? { angle: away + (this.rng() < 0.5 ? 1 : -1) * (Math.PI / 2), deg: move.gapDeg }
          : undefined;
        const life = 900 / (move.speed / 1000);
        const radiusAt = (t: number): number => Math.max(0, ((t - start) * move.speed) / 1000);
        this.hazards.push({
          test: (p) =>
            this.time.now >= start &&
            onRing(center, radiusAt(this.time.now), move.thickness, p, gap),
          mult: move.mult,
          slowMs: move.slowMs,
          until: start + life,
          hit: false,
          draw: (g, t) => {
            if (t < start) return;
            const r = radiusAt(t);
            g.lineStyle(move.thickness, 0x7fd8ff, 0.45);
            if (gap) {
              const half = (gap.deg * Math.PI) / 360;
              g.beginPath();
              g.arc(center.x, center.y, r, gap.angle + half, gap.angle - half + Math.PI * 2);
              g.strokePath();
            } else g.strokeCircle(center.x, center.y, r);
          },
        });
      }
      this.stateUntil = now + (rings - 1) * (move.intervalMs ?? 600) + 500;
    } else if (move.type === 'volley') {
      const waves = move.waves ?? 1;
      for (let w = 0; w < waves; w++) {
        this.time.delayedCall(w * (move.intervalMs ?? 500), () => {
          if (this.ended || this.state === 'stunned') return;
          const aim = Math.atan2(this.peter.y - this.boss.y, this.peter.x - this.boss.x);
          const spread = (move.spreadDeg * Math.PI) / 180;
          for (let i = 0; i < move.shots; i++) {
            const a = move.shots === 1 ? aim : aim - spread / 2 + (spread * i) / (move.shots - 1);
            this.bolt({ x: this.boss.x, y: this.boss.y }, a, move.speed, move.mult);
          }
        });
      }
      this.stateUntil = now + (waves - 1) * (move.intervalMs ?? 500) + 400;
    } else if (move.type === 'beam') {
      const base = this.facing;
      const from = { x: this.boss.x, y: this.boss.y };
      const sweep = ((move.sweepDeg ?? 0) * Math.PI) / 180;
      const angleAt = (t: number): number =>
        base - sweep / 2 + sweep * Math.min(1, (t - now) / move.durationMs);
      this.hazards.push({
        test: (p) => inBeam(from, angleAt(this.time.now), 700, move.width, p),
        mult: move.mult,
        until: now + move.durationMs,
        hit: false,
        draw: (g, t) => {
          const a = angleAt(t);
          g.lineStyle(move.width, 0xffe0a0, 0.75);
          g.lineBetween(from.x, from.y, from.x + Math.cos(a) * 700, from.y + Math.sin(a) * 700);
        },
      });
      this.stateUntil = now + move.durationMs + 200;
    }
  }

  private bolt(from: Pt, angle: number, speed: number, mult: number): void {
    const start = this.time.now;
    const pos = (t: number): Pt => ({
      x: from.x + (Math.cos(angle) * speed * (t - start)) / 1000,
      y: from.y + (Math.sin(angle) * speed * (t - start)) / 1000,
    });
    this.hazards.push({
      test: (p) => {
        const b = pos(this.time.now);
        return Math.hypot(p.x - b.x, p.y - b.y) <= 9;
      },
      mult,
      until: start + 4000,
      hit: false,
      once: true,
      draw: (g, t) => {
        const b = pos(t);
        g.fillStyle(0xff7a5a, 0.95);
        g.fillCircle(b.x, b.y, 4);
      },
    });
  }

  private updateHazards(now: number): void {
    const p = this.peter;
    for (const h of this.hazards) {
      if (h.hit || now > h.until) continue;
      if (h.test(p) && this.hurtPeter(h.mult)) {
        h.hit = true;
        if (h.slowMs) this.peterSlowUntil = now + h.slowMs;
      }
    }
    this.hazards = this.hazards.filter((h) => now <= h.until && !(h.once && h.hit));
    this.telegraphs = this.telegraphs.filter((t) => now <= t.until);
    // Touching the boss.
    if (
      this.profile.contactMult > 0 &&
      this.state !== 'stunned' &&
      Math.hypot(p.x - this.boss.x, p.y - this.boss.y) < this.profile.radius + 6
    ) {
      this.hurtPeter(this.charge ? (this.charge.move.mult ?? 1) : this.profile.contactMult);
    }
  }

  /** True when the blow landed (not dodged / invulnerable). */
  private hurtPeter(mult: number): boolean {
    const now = this.time.now;
    if (now < this.invulnUntil || this.ended) return false;
    const { damage } = rollHit(
      this.enemy.attack,
      this.session.getStats().defense,
      this.combat,
      this.rng,
      mult,
    );
    const dealt = Math.max(1, Math.round(damage * this.profile.damageScale));
    this.session.hp = Math.max(0, this.session.hp - dealt);
    this.invulnUntil = now + this.tuning.hurtInvulnMs;
    const away = Math.atan2(this.peter.y - this.boss.y, this.peter.x - this.boss.x);
    this.player.forceVelocity(
      Math.cos(away) * this.tuning.knockback,
      Math.sin(away) * this.tuning.knockback,
      130,
    );
    this.player.playAction('peter_hurt', this.player.getMovementSystem().getLastFacing(), 260);
    this.player.sprite.setTint(0xff5050);
    this.time.delayedCall(160, () => this.player.sprite.clearTint());
    this.cameras.main.shake(120, 0.004);
    this.floatText(this.peter.x, this.peter.y - 20, `-${dealt}`, '#ff6b6b');
    if (this.session.hp <= 0) this.defeat();
    return true;
  }

  // ------------------------------------------------------------------ Peter

  private get canAct(): boolean {
    return !this.ended && this.state !== 'intro';
  }

  private slash(wx: number, wy: number): void {
    const now = this.time.now;
    if (!this.canAct || !this.session.canSlash || now < this.nextSwing) return;
    const weapon = this.session.weaponStats;
    const reach = weapon?.reach ?? this.tuning.reach;
    this.nextSwing = now + (weapon?.swingMs ?? this.tuning.swingMs);
    const shape = meleeShape(this.session.meleeClass);
    const origin = this.peter;
    const aim = Math.atan2(wy - origin.y, wx - origin.x);
    this.player.playAction('peter_attack', facingFromAngle(aim), 380);
    this.sound_.playSlash();
    const g = this.add.graphics().setDepth(42);
    const half = (shape.arcDeg * Math.PI) / 360;
    g.lineStyle(shape.arcDeg < 90 ? 4 : 3, shape.color, 0.9);
    g.beginPath();
    g.arc(origin.x, origin.y, reach - 4, aim - half, aim + half);
    g.strokePath();
    this.tweens.add({ targets: g, alpha: 0, duration: 160, onComplete: () => g.destroy() });

    for (const t of this.targets)
      if (inSlash(origin, aim, t.pos, reach, shape.arcDeg, 10)) this.strikeTarget(t, now);
    if (inSlash(origin, aim, this.boss, reach, shape.arcDeg, this.profile.radius)) {
      const atk = this.session.getStats().attack;
      const crit = meleeCritBonus(this.session.meleeClass);
      const tuning = crit
        ? { ...this.combat, critChance: this.combat.critChance + crit }
        : this.combat;
      const hit = rollHit(atk, this.enemy.defense, tuning, this.rng, shape.damageMult);
      this.blowOnBoss(hit.damage, hit.critical, origin);
      const echo = weapon?.echoPct ?? 0;
      if (echo > 0)
        this.time.delayedCall(200, () =>
          this.blowOnBoss(Math.max(1, Math.floor(hit.damage * echo)), false, origin),
        );
    }
  }

  private fire(wx: number, wy: number): void {
    const now = this.time.now;
    const ranged = this.session.rangedProfile;
    if (!this.canAct || !ranged || now < this.nextShot) return;
    const cost = ranged.mpCost ?? 0;
    if (this.session.mp < cost) {
      this.floatText(this.peter.x, this.peter.y - 22, this.t('action.noMp'), '#8fb8ff');
      return;
    }
    this.session.mp -= cost;
    this.nextShot = now + ranged.fireMs;
    const aim = Math.atan2(wy - this.peter.y, wx - this.peter.x);
    this.player.playAction('peter_attack', facingFromAngle(aim), 260);
    this.sound_.playSlash();
    this.shots.fire(this.peter, aim, ranged);
  }

  private updateShots(delta: number, now: number): void {
    const ranged = this.session.rangedProfile;
    const meleeId = this.session.equipment.weapon;
    const meleeAtk =
      (meleeId && this.session.inventory.getItemDefinition(meleeId)?.equip?.attack) || 0;
    const attack = rangedAttack(this.session.getStats().attack, meleeAtk, ranged?.attack ?? 0);
    const mult = ranged?.damageMult ?? 0.7;
    const targets: ShotTarget[] = [
      {
        x: this.boss.x,
        y: this.boss.y,
        radius: this.profile.radius,
        hit: ({ from }) => {
          const hit = rollHit(attack, this.enemy.defense, this.combat, this.rng, mult);
          this.blowOnBoss(hit.damage, hit.critical, from);
          return true;
        },
      },
      ...this.targets.map((t) => ({
        x: t.pos.x,
        y: t.pos.y,
        radius: 10,
        hit: () => {
          this.strikeTarget(t, now);
          return true;
        },
      })),
    ];
    const out = (x: number, y: number): boolean =>
      x < ARENA.x || y < ARENA.y || x > ARENA.x + ARENA.w || y > ARENA.y + ARENA.h;
    this.shots.update(delta, targets, out);
  }

  private blowOnBoss(raw: number, critical: boolean, from: Pt): void {
    if (this.ended) return;
    const now = this.time.now;
    const res = gateBlow(
      this.profile.defense,
      {
        hp: this.hp,
        maxHp: this.enemy.maxHp,
        armorBroken: this.armorBroken,
        stunned: this.state === 'stunned',
        facing: this.facing,
        pos: this.boss,
        nowMs: now - this.startedAt,
      },
      raw,
      from,
    );
    if (res.kind === 'blocked') {
      this.floatText(this.boss.x, this.boss.y - 30, this.t(`boss.${res.reason}`), '#9fd3ff');
      return;
    }
    if (res.kind === 'reflected') {
      this.floatText(this.boss.x, this.boss.y - 30, this.t('action.reflected'), '#ff8080');
      this.session.hp = Math.max(1, this.session.hp - res.back);
      this.floatText(this.peter.x, this.peter.y - 20, `-${res.back}`, '#ff6b6b');
      return;
    }
    this.hp = Math.max(0, this.hp - res.damage);
    this.boss.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (this.ended) return;
      if (this.state === 'stunned') this.boss.setTint(0xfff27a);
      else this.boss.clearTint();
    });
    if (res.recovered) {
      this.showBanner(this.profile.defense.armor?.recoverMessage ?? '', 3000);
      this.burst(this.boss, this.profile.radius + 20, 0x7fd8ff);
    } else {
      const armored = this.profile.defense.armor && !this.armorBroken;
      this.floatText(
        this.boss.x,
        this.boss.y - 30,
        `${res.damage}${critical ? '!' : ''}`,
        armored ? '#8fb8ff' : critical ? '#ffd166' : '#ffffff',
      );
    }
    this.checkPhase();
    if (this.hp <= 0) this.victory();
  }

  private checkPhase(): void {
    const next = phaseIndex(this.profile, this.hpPct, this.armorBroken);
    if (next !== this.phase) {
      this.phase = next;
      const banner = this.profile.phases[next].banner;
      if (banner) this.showBanner(banner, 2600);
    }
  }

  private skill(): void {
    const now = this.time.now;
    if (!this.canAct || !this.session.getFlag(FLAGS.temporalSight) || now < this.nextSkill) return;
    const cost = this.combat.skillMpCost;
    if (this.session.mp < cost) {
      this.floatText(this.peter.x, this.peter.y - 22, this.t('action.noMp'), '#8fb8ff');
      return;
    }
    this.session.mp -= cost;
    this.nextSkill = now + 700;
    this.player.playAction(
      'peter_temporal_sight',
      this.player.getMovementSystem().getLastFacing(),
      450,
    );
    this.sound_.playSlash();
    const radius = this.tuning.skillRadius;
    const ring = this.add
      .circle(this.peter.x, this.peter.y, 8, 0x67d1ff, 0.25)
      .setStrokeStyle(2, 0x9fe8ff, 0.9)
      .setDepth(40);
    this.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: 380,
      onComplete: () => ring.destroy(),
    });
    const d = Math.hypot(this.peter.x - this.boss.x, this.peter.y - this.boss.y);
    if (d > radius + this.profile.radius) return;
    // Time thickens around the boss: it slows, a wind-up in progress is broken.
    this.slowBossUntil = now + 1800;
    if (this.state === 'telegraph') {
      this.state = 'walk';
      this.stateUntil = now + 900;
      this.telegraphs = [];
      this.boss.clearTint();
      this.floatText(this.boss.x, this.boss.y - 40, this.t('boss.interrupted'), '#9fe8ff');
    }
    const atk = this.session.getStats().attack;
    const dmg = Math.max(
      this.combat.skillMinDamage,
      Math.floor(atk * this.combat.skillMultiplier - this.enemy.defense),
    );
    this.blowOnBoss(dmg, false, this.peter);
    if (this.profile.defense.unlockOnSkill) this.openTargets();
  }

  private dash(): void {
    const now = this.time.now;
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
    this.time.delayedCall(this.tuning.dashMs + 40, () => this.player.sprite.setAlpha(1));
  }

  private useQuick(i: number): void {
    if (!this.canAct) return;
    const id = this.session.quickSlots[i];
    if (!id) return;
    const res = this.session.useConsumable(id);
    if (res.ok) {
      this.sound_.playHeal();
      const parts = [
        res.healed ? `+${res.healed} HP` : '',
        res.restoredMp ? `+${res.restoredMp} MP` : '',
      ];
      this.floatText(this.peter.x, this.peter.y - 24, parts.filter(Boolean).join(' '), '#7dffb0');
    } else {
      this.floatText(this.peter.x, this.peter.y - 24, res.name, '#9aa7b8');
    }
  }

  // ------------------------------------------------------------------ targets

  private updateTargets(now: number): void {
    const d = this.profile.defense;
    if (!this.targetsOpen && d.targets?.length && d.unlockAfterMs !== undefined) {
      if (now - this.startedAt >= d.unlockAfterMs) this.openTargets();
    }
  }

  private openTargets(): void {
    if (this.targetsOpen || !this.profile.defense.targets?.length || this.armorBroken) return;
    this.targetsOpen = true;
    if (this.profile.defense.unlockMessage)
      this.showBanner(this.profile.defense.unlockMessage, 3600);
    for (const t of this.targets) {
      const lens = t.obj.list[1] as Phaser.GameObjects.Arc;
      lens.setFillStyle(0xffe08a).setStrokeStyle(2, 0xffffff);
      (t.obj.list[2] as Phaser.GameObjects.Text).setColor('#ffe08a');
      this.tweens.add({ targets: lens, alpha: 0.55, yoyo: true, repeat: -1, duration: 500 });
    }
  }

  private strikeTarget(t: (typeof this.targets)[number], now: number): void {
    if (!this.targetsOpen || this.armorBroken) return;
    const ready = targetReady(t.def, this.targetsDone, this.state === 'stunned');
    if (ready === 'done') return;
    if (ready !== 'ok') {
      this.floatText(t.pos.x, t.pos.y - 30, '✕', '#ff8080');
      if (this.profile.defense.lockedMessage)
        this.showBanner(this.profile.defense.lockedMessage, 2600);
      return;
    }
    this.targetsDone.add(t.def.id);
    this.sound_.playSelect();
    this.showBanner(t.def.message, 3000);
    // A beam of light from the target to the boss.
    const g = this.add.graphics().setDepth(41);
    g.lineStyle(4, 0xffe08a, 0.9);
    g.lineBetween(t.pos.x, t.pos.y, this.boss.x, this.boss.y);
    this.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: () => g.destroy() });
    if (t.def.effect === 'stun') {
      this.stun(now, t.def.stunMs ?? 3000, this.t('action.stunned'));
    } else if (t.def.effect === 'breakArmor') {
      this.armorBroken = true;
      if (t.def.setHpPct !== undefined)
        this.hp = Math.min(this.hp, Math.ceil(this.enemy.maxHp * t.def.setHpPct));
      this.burst(this.boss, this.profile.radius + 30, 0xffe08a);
      this.cameras.main.flash(400, 255, 240, 180);
      for (const x of this.targets) x.obj.setAlpha(0.3);
      this.checkPhase();
      // The armor shatters: a short opening.
      this.stun(now, 1500, this.t('boss.armorBroken'));
    }
  }

  // ------------------------------------------------------------------ drawing

  private draw(now: number): void {
    const g = this.fx;
    g.clear();
    for (const t of this.telegraphs) t.draw(g, now);
    for (const h of this.hazards) h.draw?.(g, now);
    // Reflect glow / guard hint.
    const d = this.profile.defense;
    if (d.reflect && isGlowing(now - this.startedAt, d.reflect.everyMs, d.reflect.glowMs)) {
      g.lineStyle(2, 0xff6060, 0.8);
      g.strokeCircle(this.boss.x, this.boss.y, this.profile.radius + 4);
    }
    if (d.frontGuardDeg && this.state !== 'stunned') {
      const half = (d.frontGuardDeg * Math.PI) / 360;
      g.lineStyle(3, 0x9fd3ff, 0.7);
      g.beginPath();
      g.arc(
        this.boss.x,
        this.boss.y,
        this.profile.radius + 6,
        this.facing - half,
        this.facing + half,
      );
      g.strokePath();
    }
    if (d.armor && !this.armorBroken) {
      g.lineStyle(2, 0x7fd8ff, 0.35 + 0.15 * Math.sin(now / 200));
      g.strokeCircle(this.boss.x, this.boss.y, this.profile.radius + 2);
    }

    // HUD
    const h = this.hud;
    h.clear();
    const bw = 360;
    const bx = 320 - bw / 2;
    h.fillStyle(0x000000, 0.6).fillRect(bx - 2, 22, bw + 4, 12);
    h.fillStyle(0x5a1a1a, 1).fillRect(bx, 24, bw, 8);
    h.fillStyle(this.armorBroken || !d.armor ? 0xe0504a : 0x4fa3c7, 1);
    h.fillRect(bx, 24, bw * this.hpPct, 8);
    const s = this.session.getStats();
    h.fillStyle(0x000000, 0.6).fillRect(22, 314, 164, 12);
    h.fillStyle(0x3a1414, 1).fillRect(24, 316, 100, 4);
    h.fillStyle(0x6be08a, 1).fillRect(24, 316, (100 * this.session.hp) / s.maxHp, 4);
    h.fillStyle(0x14203a, 1).fillRect(24, 321, 100, 3);
    h.fillStyle(0x67b8ff, 1).fillRect(24, 321, (100 * this.session.mp) / s.maxMp, 3);
    this.peterLine.setText(
      `HP ${Math.ceil(this.session.hp)}/${s.maxHp}  MP ${Math.floor(this.session.mp)}/${s.maxMp}`,
    );
    this.peterLine.setPosition(130, 312);
    const inv = this.session.inventory;
    const quick = Array.from({ length: QUICK_KEYS }, (_, i) => {
      const id = this.session.quickSlots[i];
      return `[${i + 1}] ${id ? `${inv.getItemDefinition(id)?.name ?? id} x${inv.getItemCount(id)}` : '—'}`;
    });
    this.quickLine.setText(quick.join('  '));
  }

  private showBanner(text: string, ms: number): void {
    if (!text) return;
    this.banner.setText(text).setVisible(true).setAlpha(1);
    this.tweens.killTweensOf(this.banner);
    this.tweens.add({ targets: this.banner, alpha: 0, delay: ms, duration: 400 });
  }

  private burst(at: Pt, radius: number, color: number): void {
    const c = this.add.circle(at.x, at.y, 6, color, 0.5).setDepth(41);
    this.tweens.add({ targets: c, radius, alpha: 0, duration: 260, onComplete: () => c.destroy() });
  }

  private floatText(x: number, y: number, text: string, color: string): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.tweens.add({
      targets: label,
      y: y - 16,
      alpha: 0,
      duration: 750,
      onComplete: () => label.destroy(),
    });
  }

  // ------------------------------------------------------------------ outcome

  private victory(): void {
    if (this.ended) return;
    this.ended = true;
    this.state = 'done';
    this.boss.setVelocity(0, 0);
    this.hazards = [];
    this.telegraphs = [];
    this.fx.clear();
    this.player.getMovementSystem().stop(this.player.sprite);
    if (this.data_.victoryFlag) this.session.setFlag(this.data_.victoryFlag);
    const rewards = this.session.claimEnemyRewards(this.enemy);
    const rewardText = this.session.describeRewards(rewards);
    const released = this.enemy.mechanic?.releasedFrame;
    this.boss.anims.stop();
    this.boss.clearTint();
    if (released !== undefined) {
      this.boss.setFrame(released);
      this.cameras.main.flash(500, 136, 237, 255);
    } else {
      this.tweens.add({ targets: this.boss, alpha: 0, scale: 0.1, duration: 800 });
    }
    const defeatMsg = this.enemy.mechanic?.defeatMessage;
    if (defeatMsg) this.showBanner(defeatMsg, 2400);
    const vars = { enemy: this.enemy.name, rewards: rewardText };
    const data: ExplorationSceneData = {
      returnPosition: this.data_.returnPosition,
      notice: {
        title: this.t('combat.victoryTitle'),
        subtitle: this.t('combat.victorySubtitle', vars),
      },
      openDialogueId: this.data_.victoryDialogueId
        ? pickDialogue(this.data_.victoryDialogueId, this.data_.victoryDialogueRules, {
            isQuestCompleted: (id) => this.session.quests.getQuestStage(id) === 'completed',
            getFlag: (f) => this.session.getFlag(f),
            hasItem: (id) => this.session.inventory.hasItem(id, 1),
          })
        : undefined,
    };
    this.leave(released !== undefined ? 2800 : 1800, data);
  }

  private defeat(): void {
    if (this.ended) return;
    this.ended = true;
    this.state = 'done';
    this.boss.setVelocity(0, 0);
    this.player.getMovementSystem().stop(this.player.sprite);
    this.showBanner(this.t('combat.fallenSubtitle'), 1600);
    const revive = this.data_.revivePosition;
    if (!revive) {
      this.time.delayedCall(1600, () => this.scene.start('MainMenuScene'));
      return;
    }
    this.session.hp = this.session.getStats().maxHp;
    this.session.mp = this.session.getStats().maxMp;
    this.leave(1600, {
      returnPosition: revive,
      notice: { title: this.t('combat.fallenTitle'), subtitle: this.t('combat.fallenSubtitle') },
    });
  }

  private leave(delay: number, data: ExplorationSceneData): void {
    this.time.delayedCall(delay, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(350, () => {
        this.shots.destroy();
        this.scene.start('ExplorationScene', data);
      });
    });
  }
}
