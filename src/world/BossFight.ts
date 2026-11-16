import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import { inSlash, rollHit, type Point } from '../systems/action/ActionRules';
import type { ShotTarget } from '../systems/action/ShotSystem';
import { SoundSystem } from '../systems/audio/SoundSystem';
import {
  gateBlow,
  inBeam,
  isGlowing,
  onRing,
  phaseIndex,
  pickMove,
  sentenceVerdict,
  targetReady,
} from '../systems/boss/BossRules';
import type {
  BossDatabase,
  BossFxKey,
  BossMove,
  BossProfile,
  BossTarget,
  MoveKind,
  Sentence,
  SentenceAct,
  SongDefense,
} from '../systems/boss/BossTypes';
import type { IEnemyDefinition } from '../systems/combat/CombatTypes';
import type { PixelFxLayer } from '../systems/fx/PixelFxLayer';
import type { Translate } from '../ui/Strings';
import type { ActionCombat, CombatExtension, PeterAct } from './ActionCombat';
import { tileCenter } from './MapRegistry';

/** Boss profiles from bosses.json (loaded by PreloadScene). */
export function bossProfile(scene: Phaser.Scene, enemyId: string): BossProfile | undefined {
  const db = scene.cache.json.get('data_bosses') as BossDatabase | undefined;
  return db?.bosses.find((b) => b.id === enemyId);
}

export interface BossFightHost {
  /** Dialogue, satchel or a transition: the boss holds still and its blows do not land. */
  isPaused(): boolean;
  /** The boss is beaten (called at once): flag, rewards and its last words are the scene's job. */
  onVictory(enemy: IEnemyDefinition): void;
  /** A scripted fight ends with a rescue: open these dialogues, in order. */
  onRescue(dialogueIds: string[]): void;
}

interface Hazard {
  test(p: Point): boolean;
  mult: number;
  until: number;
  hit: boolean;
  slowMs?: number;
  draw?: (g: Phaser.GameObjects.Graphics, now: number) => void;
  /** Bolts vanish once they hit. */
  once?: boolean;
}

interface Target {
  def: BossTarget;
  obj: Phaser.GameObjects.Container;
  pos: Point;
}

/** Violet palette for the Time Wraith's blink and vanish. */
const WRAITH = ['#120a1f', '#2e1648', '#5b2a86', '#9a5ad0', '#d8b4ff', '#ffffff'];
const GOLD = ['#2a1a05', '#6b4a12', '#b8862a', '#f0c860', '#fff2b8'];
const WATER = ['#0b2233', '#1d4f6e', '#3f8fbf', '#7fd8ff', '#d8f6ff'];
const BLOOD = ['#1a0505', '#4a0d0d', '#8a1a1a', '#d23a2a', '#ff8a6a', '#ffe0c8'];

/** Slash is melee; shots and Temporal Strike are ranged (Faceless Keeper's memory lock). */
const kindOf = (a: PeterAct): MoveKind => (a === 'slash' ? 'melee' : 'ranged');

/**
 * T-84: a boss fought where Peter meets it, on the map itself (no separate battle scene). Peter's
 * moves come from ActionCombat (plugged in as its `extension`); the boss walks, telegraphs a move
 * of its current phase, performs it, rests, and defends itself its own way (bosses.json). Effects
 * are pixelfx (src/vendor/pixelfx) through the scene's PixelFxLayer.
 */
export class BossFight implements CombatExtension {
  private readonly sound = SoundSystem.getInstance();
  private readonly boss: Phaser.Physics.Arcade.Sprite;
  private readonly fx: Phaser.GameObjects.Graphics;
  private readonly bar: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly banner: Phaser.GameObjects.Text;
  private readonly colliders: Phaser.Physics.Arcade.Collider[] = [];

  private hp: number;
  /** The boss's HP in this fight: enemies.json maxHp × the profile's hpScale. */
  private readonly maxHp: number;
  private armorBroken = false;
  private phase = 0;
  private state: 'intro' | 'walk' | 'telegraph' | 'act' | 'stunned' | 'done' = 'intro';
  private stateUntil: number;
  private stunUntil = 0;
  private stunFx: { stop(): void } | null = null;
  private lastMove: string | null = null;
  private facing = Math.PI / 2;
  private slowBossUntil = 0;
  private charge: {
    dx: number;
    dy: number;
    speed: number;
    from: number;
    until: number;
    mult: number;
    stunMs: number;
    fx?: BossFxKey;
  } | null = null;
  private hazards: Hazard[] = [];
  private telegraphs: {
    draw: (g: Phaser.GameObjects.Graphics, now: number) => void;
    until: number;
  }[] = [];
  private targets: Target[] = [];
  private targetsDone = new Set<string>();
  private targetsOpen = false;
  /** Fight time, frozen while paused (unlock timers and sentences count only real fighting). */
  private fightMs = 0;
  private ended = false;

  /** Imperial Verdict: the sentence in force, the cracks so far, and when the next one falls. */
  private sentence: { def: Sentence; until: number; landed: boolean } | null = null;
  private sentenceIdx = 0;
  private nextSentenceAt = 0;
  private cracks = 0;
  private stillSince = 0;
  private lastPeter: Point;

  /** The boss's attack (the Faceless Keeper's mirror copies part of Peter's). */
  private attack: number;
  /** Faceless Keeper: the kind of move frozen, until when; a stagger armed by the other kind. */
  private lock: { kind: MoveKind; until: number } | null = null;
  private lockIdx = 0;
  private nextLockAt = 0;
  private staggerUntil = 0;
  /** Nameless Choir, Unborn King: the song in force and the cracks it has cost the shield. */
  private song: { def: SongDefense['list'][number]; until: number } | null = null;
  private lastSong: string | null = null;
  private nextSongAt = 0;
  private songCracks = 0;
  /** Crimson Standard: the blood wall stands while tethers remain. */
  private wall: { tethers: Target[] } | null = null;
  private nextWallAt = 0;
  /** The Last War: risen once; the last pillar readies the finishing blow. */
  private risen = false;
  private finality = false;
  /** Kuro beside Peter (Unborn King). */
  private allySprite: Phaser.GameObjects.Sprite | null = null;
  private nextAllyAt = 0;
  /** Alpha Peter: "[E] read the letter" once he is low enough. */
  private finisherText: Phaser.GameObjects.Text | null = null;
  private finisherKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly action: ActionCombat,
    private readonly peter: Phaser.Physics.Arcade.Sprite,
    private readonly walls: Phaser.Tilemaps.TilemapLayer,
    private readonly enemy: IEnemyDefinition,
    private readonly profile: BossProfile,
    from: Point,
    private readonly host: BossFightHost,
    private readonly t: Translate,
    private readonly pfx: PixelFxLayer,
    private readonly rng: () => number = Math.random,
  ) {
    this.maxHp = Math.round(enemy.maxHp * (profile.hpScale ?? 1));
    this.hp = this.maxHp;
    const key = enemy.spriteKey;
    this.boss = scene.physics.add.sprite(from.x, from.y, key, 0);
    this.boss.setScale(profile.scale ?? 1).setDepth(this.peter.depth);
    const body = this.boss.body as Phaser.Physics.Arcade.Body;
    const r = (profile.radius / (profile.scale ?? 1)) * 0.6;
    body.setCircle(r, this.boss.width / 2 - r, this.boss.height / 2 - r);
    this.boss.setCollideWorldBounds(true);
    if (scene.anims.exists(`${key}_idle`)) this.boss.play(`${key}_idle`);
    this.colliders.push(scene.physics.add.collider(this.boss, walls));
    this.lastPeter = { x: peter.x, y: peter.y };

    this.fx = scene.add.graphics().setDepth(5);
    this.spawnTargets();

    const w = scene.scale.width;
    this.bar = scene.add.graphics().setScrollFactor(0).setDepth(96);
    this.title = scene.add
      .text(w / 2, 252, enemy.name.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd38a',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(97);
    this.banner = scene.add
      .text(w / 2, 72, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#0c101cd8',
        padding: { left: 8, right: 8, top: 3, bottom: 3 },
        wordWrap: { width: w - 80 },
        align: 'center',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(97)
      .setVisible(false);

    this.stateUntil = scene.time.now + 1400;
    this.nextSentenceAt = profile.defense.sentences?.firstMs ?? 0;
    const d = profile.defense;
    this.attack = enemy.attack;
    if (profile.mirrorGearPct)
      this.attack += Math.round(session.getStats().attack * profile.mirrorGearPct);
    this.nextLockAt = d.memoryLock?.firstMs ?? 0;
    this.nextSongAt = d.songs?.firstMs ?? 0;
    this.nextWallAt = d.bloodWall?.firstMs ?? 0;
    // Song targets (cores, crowns) are lit from the start; ritual pillars wait hidden.
    if (d.songs) this.openTargets();
    const ally = profile.ally;
    if (ally && session.getFlag(ally.flag)) {
      this.allySprite = scene.add.sprite(peter.x - 28, peter.y, ally.texture).setDepth(peter.depth);
      if (ally.anim && scene.anims.exists(ally.anim)) this.allySprite.play(ally.anim);
      this.nextAllyAt = ally.everyMs;
    }
    if (profile.finisher) {
      this.finisherText = scene.add
        .text(0, 0, `[E] ${profile.finisher.prompt}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#fff2b8',
          backgroundColor: '#1a1208d8',
          padding: { left: 4, right: 4, top: 2, bottom: 2 },
        })
        .setOrigin(0.5, 1)
        .setDepth(60)
        .setVisible(false);
      this.finisherKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E) ?? null;
      this.finisherKey?.on('down', this.onFinisherKey);
    }
    const ss = profile.startStun;
    if (ss && session.getFlag(ss.flag))
      this.later(600, () => {
        this.stun(this.scene.time.now, ss.ms, this.t('action.stunned'));
        this.showBanner(ss.message, 3000);
      });
    this.showBanner(profile.intro ?? enemy.name, 3200);
    scene.cameras.main.shake(200, 0.004);
    if (profile.rescue) action.bossHpFloor = 1;
    action.extension = this;
  }

  public get active(): boolean {
    return !this.ended;
  }

  private get hpPct(): number {
    return this.hp / this.maxHp;
  }

  private get p(): Point {
    return { x: this.peter.x, y: this.peter.y };
  }

  private play(
    key: BossFxKey,
    at: Point | (() => Point),
    opts: Record<string, unknown> = {},
    maxMs?: number,
  ): { stop(): void } {
    return this.pfx.play(key, at, opts, maxMs);
  }

  // ------------------------------------------------------------------ frame

  public update(delta: number): void {
    if (this.ended) return;
    const now = this.scene.time.now;
    if (this.host.isPaused()) {
      this.boss.setVelocity(0, 0);
      this.draw(now);
      return;
    }
    this.fightMs += delta;
    this.updateBoss(now);
    this.updateHazards(now);
    this.updateTargets();
    this.updateSentence(now);
    this.updateLock();
    this.updateSongs();
    this.updateWall(now);
    this.updateAlly();
    this.updateOrbits();
    this.updateFinisher();
    this.draw(now);
  }

  private updateBoss(now: number): void {
    const phase = this.profile.phases[this.phase];
    const slow = now < this.slowBossUntil ? 0.4 : 1;
    const speed = this.profile.speed * (phase.speedMult ?? 1) * slow;
    const toPeter = Math.atan2(this.p.y - this.boss.y, this.p.x - this.boss.x);

    if (this.state === 'stunned') {
      this.boss.setVelocity(0, 0);
      if (now >= this.stunUntil) {
        this.boss.clearTint();
        this.stunFx?.stop();
        this.stunFx = null;
        // A missed chance: the steps before the final one must be done again.
        if (!this.armorBroken)
          for (const t of this.targets)
            if (t.def.effect !== 'breakArmor' && this.targetsDone.delete(t.def.id)) this.light(t);
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
      // A wall stops the rush (not in its first instant, when it may start against one).
      if (blocked && c.stunMs > 0 && now > c.from + 120) {
        this.charge = null;
        this.scene.cameras.main.shake(180, 0.006);
        this.sound.playSlash();
        this.play(c.fx ?? 'critHit', { x: this.boss.x, y: this.boss.y + 10 });
        this.stun(now, c.stunMs, this.t('boss.wallStun'));
        return;
      }
      if (now >= c.until) {
        this.charge = null;
        this.toWalk(now);
      }
      return;
    }
    if (this.state === 'intro' || this.state === 'walk') {
      const d = Math.hypot(this.p.x - this.boss.x, this.p.y - this.boss.y);
      if (d > this.profile.radius + 24)
        this.boss.setVelocity(Math.cos(toPeter) * speed, Math.sin(toPeter) * speed);
      else this.boss.setVelocity(0, 0);
      this.face(toPeter);
      if (now >= this.stateUntil) this.beginMove(now);
    } else {
      this.boss.setVelocity(0, 0);
      if (this.state === 'act' && now >= this.stateUntil) this.toWalk(now);
    }
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
    this.action.floatText(this.boss.x, this.boss.y - 40, text, '#fff27a');
    this.stunFx?.stop();
    const top = (): Point => ({ x: this.boss.x, y: this.boss.y - this.boss.displayHeight * 0.4 });
    this.stunFx = this.play('stunned', top, {}, ms);
  }

  // ------------------------------------------------------------------ boss moves

  private later(ms: number, fn: () => void): void {
    this.scene.time.delayedCall(ms, () => {
      if (!this.ended) fn();
    });
  }

  /** Time Wraith: vanishes and reappears beside Peter. */
  private blinkNearPeter(): void {
    this.play('blinkOut', { x: this.boss.x, y: this.boss.y + 16 }, { palette: WRAITH });
    const side = this.rng() < 0.5 ? -1 : 1;
    const maxX = this.scene.physics.world.bounds.width - 40;
    this.boss.setPosition(Phaser.Math.Clamp(this.p.x + side * 70, 40, maxX), this.p.y - 10);
    this.play('blinkIn', { x: this.boss.x, y: this.boss.y + 16 }, { palette: WRAITH });
  }

  private beginMove(now: number, forced?: string): void {
    const id = forced ?? pickMove(this.profile.phases[this.phase], this.lastMove, this.rng);
    this.lastMove = id;
    const move = this.profile.moves[id];
    if (!move) return this.toWalk(now);
    if (move.blink) this.blinkNearPeter();
    this.state = 'telegraph';
    this.stateUntil = now + move.telegraphMs;
    this.action.floatText(this.boss.x, this.boss.y - 46, move.label, '#ff9a7a');
    this.boss.setTint(0xff8a8a);
    const go = (fn: () => void): void =>
      this.later(move.telegraphMs, () => {
        if (this.state !== 'telegraph') return; // stunned or interrupted meanwhile
        this.boss.clearTint();
        this.state = 'act';
        fn();
      });

    if (move.type === 'slam') return this.slam(move, now);
    const ang = Math.atan2(this.p.y - this.boss.y, this.p.x - this.boss.x);
    if (move.type === 'charge' || move.type === 'beam') {
      this.face(ang);
      const from = { x: this.boss.x, y: this.boss.y };
      const width = move.type === 'charge' ? this.profile.radius * 1.4 : move.width;
      this.telegraphs.push({
        until: now + move.telegraphMs,
        draw: (g) => {
          g.lineStyle(width, 0xff4040, 0.2);
          g.lineBetween(from.x, from.y, from.x + Math.cos(ang) * 600, from.y + Math.sin(ang) * 600);
        },
      });
    }
    if (move.type === 'charge') {
      go(() => {
        this.charge = {
          dx: Math.cos(ang),
          dy: Math.sin(ang),
          speed: move.speed,
          from: this.scene.time.now,
          until: this.scene.time.now + move.durationMs,
          mult: move.mult,
          stunMs: move.stunOnWallMs ?? 0,
          fx: move.fx,
        };
        this.stateUntil = this.scene.time.now + move.durationMs + 50;
      });
    } else go(() => this.perform(move, this.scene.time.now));
  }

  /** Slam circles are shown at once, where they will land. */
  private slam(move: Extract<BossMove, { type: 'slam' }>, now: number): void {
    if (move.feint && this.rng() < move.feint) return this.feintSlam(move, now);
    const count = move.count ?? 1;
    const stagger = move.staggerMs ?? 0;
    for (let i = 0; i < count; i++) {
      const spread = move.scatter ?? 80;
      const spot =
        i === 0
          ? this.p
          : {
              x: this.p.x + (this.rng() * 2 - 1) * spread,
              y: this.p.y + (this.rng() * 2 - 1) * spread,
            };
      const lead = move.telegraphMs + i * stagger;
      const at = now + lead;
      this.telegraphs.push({
        until: at,
        draw: (g, t) => {
          const k = 1 - Math.max(0, at - t) / lead;
          g.fillStyle(0xff3030, 0.12 + 0.25 * k);
          g.fillCircle(spot.x, spot.y, move.radius);
          g.lineStyle(1, 0xff7070, 0.8);
          g.strokeCircle(spot.x, spot.y, move.radius * k);
        },
      });
      this.later(lead, () => {
        if (this.state === 'stunned') return;
        const key = move.fx ?? 'groundSlam';
        const opts: Record<string, unknown> = { seed: Math.floor(this.rng() * 1000) };
        if (key === 'groundSlam') opts.reach = Math.round(move.radius * 1.6);
        if (move.fxPalette) opts.palette = move.fxPalette;
        this.play(key, spot, opts, 1100);
        this.hazards.push({
          test: (p) => Math.hypot(p.x - spot.x, p.y - spot.y) <= move.radius,
          mult: move.mult,
          until: this.scene.time.now + 120,
          hit: false,
        });
      });
    }
    this.later(move.telegraphMs + (count - 1) * stagger, () => {
      if (this.state !== 'telegraph') return;
      this.boss.clearTint();
      this.state = 'act';
      this.stateUntil = this.scene.time.now + 300;
    });
  }

  private perform(move: BossMove, now: number): void {
    if (move.type === 'ring') {
      const rings = move.rings ?? 1;
      const center = { x: this.boss.x, y: this.boss.y };
      if (move.fx) {
        const opts: Record<string, unknown> = move.fxPalette ? { palette: move.fxPalette } : {};
        this.play(move.fx, { x: center.x, y: center.y + 12 }, opts, 1400);
      }
      for (let i = 0; i < rings; i++) {
        const start = now + i * (move.intervalMs ?? 600);
        const toward = Math.atan2(this.p.y - center.y, this.p.x - center.x);
        // The gap opens beside Peter: step into it, or dash through the wave.
        const gap = move.gapDeg
          ? { angle: toward + (this.rng() < 0.5 ? 1 : -1) * (Math.PI / 2), deg: move.gapDeg }
          : undefined;
        const radiusAt = (t: number): number => Math.max(0, ((t - start) * move.speed) / 1000);
        this.hazards.push({
          test: (p) =>
            this.scene.time.now >= start &&
            onRing(center, radiusAt(this.scene.time.now), move.thickness, p, gap),
          mult: move.mult,
          slowMs: move.slowMs,
          until: start + (700 / move.speed) * 1000,
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
        this.later(w * (move.intervalMs ?? 500), () => {
          if (this.state === 'stunned') return;
          const aim = Math.atan2(this.p.y - this.boss.y, this.p.x - this.boss.x);
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
        test: (p) => inBeam(from, angleAt(this.scene.time.now), 600, move.width, p),
        mult: move.mult,
        until: now + move.durationMs,
        hit: false,
        draw: (g, t) => {
          const a = angleAt(t);
          g.lineStyle(move.width, 0xffe0a0, 0.75);
          g.lineBetween(from.x, from.y, from.x + Math.cos(a) * 600, from.y + Math.sin(a) * 600);
        },
      });
      if (move.fx) this.play(move.fx, { x: from.x, y: from.y + 12 }, {}, 1400);
      this.stateUntil = now + move.durationMs + 200;
    }
  }

  private bolt(from: Point, angle: number, speed: number, mult: number): void {
    const start = this.scene.time.now;
    const pos = (t: number): Point => ({
      x: from.x + (Math.cos(angle) * speed * (t - start)) / 1000,
      y: from.y + (Math.sin(angle) * speed * (t - start)) / 1000,
    });
    this.hazards.push({
      test: (p) => {
        const b = pos(this.scene.time.now);
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
    const p = this.p;
    const atk = this.attack;
    const scale = this.profile.damageScale;
    for (const h of this.hazards) {
      if (h.hit || now > h.until || !h.test(p)) continue;
      const dealt = this.action.bossHit(atk, h.mult, this.boss, scale, h.slowMs);
      if (dealt) {
        h.hit = true;
        this.drain(dealt);
      }
    }
    this.hazards = this.hazards.filter((h) => now <= h.until && !(h.once && h.hit));
    this.telegraphs = this.telegraphs.filter((t) => now <= t.until);
    const touching = Math.hypot(p.x - this.boss.x, p.y - this.boss.y) < this.profile.radius + 6;
    if (touching && this.state !== 'stunned') {
      const mult = this.charge ? this.charge.mult : this.profile.contactMult;
      if (mult > 0) this.drain(this.action.bossHit(atk, mult, this.boss, scale));
    }
    this.checkRescue();
  }

  // ------------------------------------------------------------------ scripted rescue

  private checkRescue(): void {
    const rescue = this.profile.rescue;
    if (!rescue || this.ended) return;
    if (this.session.hp > Math.ceil(this.session.getStats().maxHp * rescue.belowHpPct)) return;
    this.ended = true;
    this.state = 'done';
    this.action.extension = null;
    this.action.bossHpFloor = 0;
    this.hazards = [];
    this.telegraphs = [];
    this.boss.setVelocity(0, 0);
    this.fx.clear();
    // The ally steps in between Peter and the boss; the boss is thrown back into the fog.
    if (rescue.allyTexture) {
      const mid = { x: (this.p.x + this.boss.x) / 2, y: (this.p.y + this.boss.y) / 2 };
      this.play('blinkIn', { x: mid.x, y: mid.y + 16 });
      const ally = this.scene.add
        .sprite(mid.x, mid.y, rescue.allyTexture)
        .setDepth(this.peter.depth);
      if (rescue.allyAnim && this.scene.anims.exists(rescue.allyAnim)) ally.play(rescue.allyAnim);
      this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => ally.destroy());
    }
    this.scene.cameras.main.flash(400, 120, 200, 255);
    if (rescue.vanish !== false)
      this.scene.time.delayedCall(500, () => {
        this.play('poof', { x: this.boss.x, y: this.boss.y + 16 }, { palette: WRAITH });
        this.scene.tweens.add({ targets: this.boss, alpha: 0, duration: 400 });
      });
    else this.boss.anims.stop();
    this.cleanupExtras();
    this.dispose([this.bar, this.title, this.banner, ...this.targets.map((t) => t.obj)]);
    for (const c of this.colliders.splice(0)) c.destroy();
    const ids = [rescue.flashDialogueId, rescue.dialogueId].filter((x): x is string => !!x);
    this.scene.time.delayedCall(1100, () => this.host.onRescue(ids));
  }

  // ------------------------------------------------------------------ Peter's blows (extension)

  public unarmed(): { reach: number; mult: number } | null {
    return this.ended ? null : (this.profile.unarmed ?? null);
  }

  public onAction(kind: PeterAct): void {
    if (this.ended) return;
    if (kind !== 'dash') this.sentenceAct('attack');
    const now = this.scene.time.now;
    // Memory lock: a move of the kind the mirror did not freeze arms a stagger.
    if (this.lock && kind !== 'dash' && kindOf(kind) !== this.lock.kind)
      this.staggerUntil = now + 900;
    const m = this.profile.mirror;
    if (!m || this.state === 'stunned') return;
    if (kind === 'skill') {
      // Alpha Peter copies Temporal Strike: he answers with the shears and seals Peter's.
      this.action.silence(m.silenceMs);
      this.showBanner(m.skillMessage, 2400);
      this.later(250, () => {
        if (this.state === 'walk' || this.state === 'intro')
          this.beginMove(this.scene.time.now, m.skillMove);
      });
    } else if (kind === 'dash' && m.dashLunge && this.state === 'walk') {
      const ang = Math.atan2(this.p.y - this.boss.y, this.p.x - this.boss.x);
      this.face(ang);
      this.state = 'act';
      this.stateUntil = now + 420;
      this.charge = {
        dx: Math.cos(ang),
        dy: Math.sin(ang),
        speed: 320,
        from: now,
        until: now + 380,
        mult: 0.9,
        stunMs: 0,
      };
      this.action.floatText(this.boss.x, this.boss.y - 46, this.t('boss.mirrored'), '#ff9a7a');
    }
  }

  /** Faceless Keeper: a frozen kind of move is refused. */
  public blocked(kind: PeterAct): string | null {
    const ml = this.profile.defense.memoryLock;
    if (this.ended || !ml || !this.lock || kind === 'dash') return null;
    return kindOf(kind) === this.lock.kind ? ml.lockedText : null;
  }

  /** A quick-slot item was used during the fight. */
  public onItem(): void {
    if (this.ended) return;
    this.sentenceAct('item');
    const m = this.profile.mirror;
    if (m && m.healPct > 0) {
      const heal = Math.round(this.maxHp * m.healPct);
      this.hp = Math.min(this.maxHp, this.hp + heal);
      this.action.floatText(this.boss.x, this.boss.y - 34, `+${heal}`, '#7dffb0');
      this.showBanner(m.healMessage, 2400);
    }
  }

  /** After its armor breaks, the boss heals by part of what it deals (Unborn King). */
  private drain(dealt: number): void {
    const k = this.profile.drainAfterBreak;
    if (!k || !this.armorBroken || dealt <= 0 || this.ended) return;
    const heal = Math.ceil(dealt * k);
    this.hp = Math.min(this.maxHp, this.hp + heal);
    this.action.floatText(this.boss.x, this.boss.y - 34, `+${heal}`, '#ff8a8a');
  }

  public onSlash(
    origin: Point,
    aim: number,
    reach: number,
    blow: { attack: number; arcDeg: number; mult: number; critBonus: number; echoPct: number },
  ): boolean {
    if (this.ended) return false;
    let touched = false;
    for (const t of this.targets)
      if (inSlash(origin, aim, t.pos, reach, blow.arcDeg, 10)) {
        this.strikeTarget(t);
        touched = true;
      }
    if (inSlash(origin, aim, this.boss, reach, blow.arcDeg, this.profile.radius)) {
      touched = true;
      const combat = this.session.database.player.combat;
      const tuning = blow.critBonus
        ? { ...combat, critChance: combat.critChance + blow.critBonus }
        : combat;
      const hit = rollHit(blow.attack, this.enemy.defense, tuning, this.rng, blow.mult);
      this.blowOnBoss(hit.damage, hit.critical, origin);
      if (blow.echoPct > 0)
        this.later(200, () =>
          this.blowOnBoss(Math.max(1, Math.floor(hit.damage * blow.echoPct)), false, origin),
        );
    }
    return touched;
  }

  public onSkill(origin: Point, radius: number, attack: number): void {
    if (this.ended) return;
    const now = this.scene.time.now;
    const d = Math.hypot(origin.x - this.boss.x, origin.y - this.boss.y);
    if (d > radius + this.profile.radius) return;
    // Time thickens around the boss: it slows, and a wind-up in progress is broken.
    this.slowBossUntil = now + 1800;
    this.play('timeStop', () => ({ x: this.boss.x, y: this.boss.y + 20 }), {}, 1600);
    if (this.state === 'telegraph') {
      this.state = 'walk';
      this.stateUntil = now + 900;
      this.telegraphs = [];
      this.boss.clearTint();
      this.action.floatText(this.boss.x, this.boss.y - 46, this.t('boss.interrupted'), '#9fe8ff');
    }
    const combat = this.session.database.player.combat;
    const dmg = Math.max(
      combat.skillMinDamage,
      Math.floor(attack * combat.skillMultiplier - this.enemy.defense),
    );
    this.blowOnBoss(dmg, false, origin);
    if (this.profile.defense.unlockOnSkill) this.openTargets();
  }

  public shotTargets(attack: number, mult: number): ShotTarget[] {
    if (this.ended) return [];
    const combat = this.session.database.player.combat;
    return [
      {
        x: this.boss.x,
        y: this.boss.y,
        radius: this.profile.radius,
        hit: ({ from }) => {
          const hit = rollHit(attack, this.enemy.defense, combat, this.rng, mult);
          this.blowOnBoss(hit.damage, hit.critical, from);
          return true;
        },
      },
      ...this.targets.map((t) => ({
        x: t.pos.x,
        y: t.pos.y,
        radius: 10,
        hit: () => {
          this.strikeTarget(t);
          return true;
        },
      })),
    ];
  }

  private blowOnBoss(rawIn: number, critical: boolean, from: Point): void {
    if (this.ended) return;
    const d = this.profile.defense;
    let raw = rawIn;
    // The blood wall swallows most of a blow; a stagger (memory lock) lands harder.
    if (this.wall && d.bloodWall) raw = Math.max(1, Math.round(raw * (1 - d.bloodWall.reducePct)));
    const staggered = !!this.lock && this.scene.time.now < this.staggerUntil;
    if (staggered && d.memoryLock) raw = Math.round(raw * d.memoryLock.staggerMult);
    const res = gateBlow(
      this.profile.defense,
      {
        hp: this.hp,
        maxHp: this.maxHp,
        armorBroken: this.armorBroken,
        stunned: this.state === 'stunned',
        facing: this.facing,
        pos: this.boss,
        nowMs: this.fightMs,
      },
      raw,
      from,
    );
    const at = { x: this.boss.x, y: this.boss.y + 4 };
    if (res.kind === 'blocked') {
      this.play('shieldBlock', at);
      this.action.floatText(this.boss.x, this.boss.y - 34, this.t(`boss.${res.reason}`), '#9fd3ff');
      return;
    }
    if (res.kind === 'reflected') {
      this.action.floatText(this.boss.x, this.boss.y - 34, this.t('action.reflected'), '#ff8080');
      this.session.hp = Math.max(1, this.session.hp - res.back);
      this.action.floatText(this.p.x, this.p.y - 20, `-${res.back}`, '#ff6b6b');
      return;
    }
    if (this.finality) {
      // The ritual is complete: this blow ends the war.
      this.hp = 0;
      this.showBanner(d.ritual?.finishMessage ?? '', 2600);
      this.play('holyPillar', { x: this.boss.x, y: this.boss.y + 20 }, {}, 1800);
      this.victory();
      return;
    }
    this.hp = Math.max(0, this.hp - res.damage);
    if (this.risen) this.hp = Math.max(1, this.hp);
    if (this.sentence) this.sentence.landed = true;
    if (staggered && d.memoryLock) {
      this.lock = null;
      this.staggerUntil = 0;
      this.nextLockAt = this.fightMs + d.memoryLock.everyMs;
      this.showBanner(d.memoryLock.staggerMessage, 2600);
      this.play('critHit', { x: this.boss.x, y: this.boss.y + 4 });
      this.stun(this.scene.time.now, d.memoryLock.staggerMs, this.t('action.stunned'));
    }
    this.boss.setTintFill(0xffffff);
    this.later(80, () => {
      if (this.state === 'stunned') this.boss.setTint(0xfff27a);
      else this.boss.clearTint();
    });
    const armored = this.profile.defense.armor && !this.armorBroken;
    if (res.recovered) {
      this.showBanner(this.profile.defense.armor?.recoverMessage ?? '', 3000);
      this.play('shieldBlock', at, { palette: WATER });
    } else {
      this.play(critical ? 'critHit' : armored ? 'shieldBlock' : 'hitSpark', at);
      this.action.floatText(
        this.boss.x,
        this.boss.y - 34,
        `${res.damage}${critical ? '!' : ''}`,
        armored ? '#8fb8ff' : critical ? '#ffd166' : '#ffffff',
      );
    }
    this.checkPhase();
    const endAt = this.profile.endAtHpPct;
    if (endAt && this.hpPct <= endAt) {
      this.victory();
      return;
    }
    if (this.hp <= 0 && d.ritual && !this.risen) {
      this.rise();
      return;
    }
    if (this.hp <= 0) this.victory();
  }

  /** The Last War will not die: it rises, and the ritual pillars appear. */
  private rise(): void {
    const r = this.profile.defense.ritual;
    if (!r) return;
    this.risen = true;
    this.hp = Math.round(this.maxHp * r.revivePct);
    this.showBanner(r.openMessage, 3600);
    this.play('groundSlam', { x: this.boss.x, y: this.boss.y + 18 }, { reach: 90 }, 1400);
    this.scene.cameras.main.shake(300, 0.008);
    this.targetsOpen = true;
    for (const t of this.targets) if (t.def.hidden) this.light(t, true);
    this.stun(this.scene.time.now, 1200, this.t('boss.risen'));
  }

  private checkPhase(): void {
    const next = phaseIndex(this.profile, this.hpPct, this.armorBroken);
    if (next === this.phase) return;
    this.phase = next;
    const banner = this.profile.phases[next].banner;
    if (banner) this.showBanner(banner, 2600);
  }

  private breakArmor(now: number, setHpPct?: number): void {
    this.armorBroken = true;
    this.sentence = null;
    if (setHpPct !== undefined) this.hp = Math.min(this.hp, Math.ceil(this.maxHp * setHpPct));
    this.play('holyPillar', { x: this.boss.x, y: this.boss.y + 20 }, {}, 1800);
    this.scene.cameras.main.flash(400, 255, 240, 180);
    for (const x of this.targets) x.obj.setAlpha(0.3);
    this.checkPhase();
    this.stun(now, 1500, this.t('boss.armorBroken'));
  }

  // ------------------------------------------------------------------ sentences (Imperial Verdict)

  private updateSentence(now: number): void {
    const def = this.profile.defense.sentences;
    if (!def || this.armorBroken) return;
    // Standing still counts for the "hesitate" sentence.
    const moved = Math.hypot(this.p.x - this.lastPeter.x, this.p.y - this.lastPeter.y) > 0.5;
    this.lastPeter = this.p;
    if (moved) this.stillSince = this.fightMs;
    const s = this.sentence;
    if (!s) {
      if (this.fightMs >= this.nextSentenceAt && this.state !== 'stunned') {
        const pick = def.list[this.sentenceIdx++ % def.list.length];
        this.sentence = { def: pick, until: this.fightMs + def.windowMs, landed: false };
        this.stillSince = this.fightMs;
        this.showBanner(pick.announce, def.windowMs);
        this.sound.playSelect();
      }
      return;
    }
    if (s.def.forbid.includes('idle') && this.fightMs - this.stillSince >= def.idleMs) {
      this.sentenceAct('idle');
      return;
    }
    const verdict = sentenceVerdict(s.def, s.landed, this.fightMs >= s.until);
    if (verdict === 'crack') this.crack(now);
    else if (verdict === 'lapse') this.endSentence();
  }

  private sentenceAct(act: SentenceAct): void {
    const s = this.sentence;
    if (!s || this.ended || !s.def.forbid.includes(act)) return;
    const amount = Math.max(1, Math.round(this.session.getStats().maxHp * s.def.punishPct));
    this.play(s.def.fx ?? 'curse', () => ({ x: this.p.x, y: this.p.y + 14 }), {}, 1600);
    this.showBanner(s.def.punishMessage.replace('{damage}', String(amount)), 2600);
    this.endSentence();
    this.action.directHit(amount);
  }

  private crack(now: number): void {
    const s = this.sentence;
    const def = this.profile.defense.sentences;
    if (!s || !def) return;
    this.cracks++;
    this.play('shieldBlock', { x: this.boss.x, y: this.boss.y + 4 }, { palette: GOLD });
    this.endSentence();
    if (this.cracks >= def.cracksToBreak) {
      this.showBanner(def.breakMessage, 3200);
      this.breakArmor(now);
    } else this.showBanner(`${s.def.crackMessage} (${this.cracks}/${def.cracksToBreak})`, 2600);
  }

  private endSentence(): void {
    this.sentence = null;
    this.nextSentenceAt = this.fightMs + (this.profile.defense.sentences?.gapMs ?? 5000);
  }

  // ------------------------------------------------------------------ arena targets

  private spawnTargets(): void {
    for (const def of this.profile.defense.targets ?? []) {
      const pos = def.tile ? tileCenter(def.tile) : { x: this.boss.x, y: this.boss.y };
      const t = this.makeTarget(def, pos, !!def.orbit);
      if (def.hidden) t.obj.setVisible(false);
      this.targets.push(t);
    }
    this.updateOrbits();
  }

  /** A strikable object: a pedestal and its gem (an orbiting crown has no pedestal). */
  private makeTarget(def: BossTarget, pos: Point, floating = false): Target {
    const parts: Phaser.GameObjects.GameObject[] = [];
    if (!floating) parts.push(this.scene.add.rectangle(0, 6, 22, 8, 0x3a4656));
    parts.push(this.scene.add.circle(0, -4, 8, 0x55606e).setStrokeStyle(2, 0x9aa7b8));
    parts.push(
      this.scene.add
        .text(0, -22, def.label, {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#9aa7b8',
          stroke: '#000000',
          strokeThickness: 2,
        })
        .setOrigin(0.5),
    );
    const obj = this.scene.add.container(pos.x, pos.y, parts).setDepth(floating ? 45 : 4);
    return { def, obj, pos: { ...pos } };
  }

  private gemOf(t: Target): Phaser.GameObjects.Arc {
    return t.obj.list.find((o) => o instanceof Phaser.GameObjects.Arc) as Phaser.GameObjects.Arc;
  }

  private labelOf(t: Target): Phaser.GameObjects.Text {
    return t.obj.list.find((o) => o instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
  }

  /** Lights a target (its own colour, gold by default), pulsing. */
  private light(t: Target, show = false): void {
    if (show) t.obj.setVisible(true);
    const hex = t.def.color ?? '#ffe08a';
    const c = Phaser.Display.Color.HexStringToColor(hex).color;
    const gem = this.gemOf(t);
    gem.setFillStyle(c).setStrokeStyle(2, 0xffffff);
    this.labelOf(t).setColor(hex);
    this.scene.tweens.killTweensOf(gem);
    gem.setAlpha(1);
    this.scene.tweens.add({ targets: gem, alpha: 0.55, yoyo: true, repeat: -1, duration: 500 });
  }

  /** Crowns circle the Unborn King. */
  private updateOrbits(): void {
    for (const t of this.targets) {
      const o = t.def.orbit;
      if (!o) continue;
      const ang = ((o.startDeg + (o.degPerSec * this.fightMs) / 1000) * Math.PI) / 180;
      t.pos.x = this.boss.x + Math.cos(ang) * o.radius;
      t.pos.y = this.boss.y + Math.sin(ang) * o.radius * 0.7;
      t.obj.setPosition(t.pos.x, t.pos.y);
    }
  }

  // ------------------------------------------------------------------ memory lock (Faceless Keeper)

  private updateLock(): void {
    const ml = this.profile.defense.memoryLock;
    if (!ml) return;
    if (this.lock && this.fightMs >= this.lock.until) {
      this.lock = null;
      this.nextLockAt = this.fightMs + ml.everyMs;
    } else if (!this.lock && this.fightMs >= this.nextLockAt && this.state !== 'stunned') {
      const opt = ml.options[this.lockIdx++ % ml.options.length];
      this.lock = { kind: opt.lock, until: this.fightMs + ml.lockMs };
      this.showBanner(opt.announce, 3000);
      this.play('shieldBlock', () => ({ x: this.p.x, y: this.p.y + 4 }), { palette: WATER });
    }
  }

  // ------------------------------------------------------------------ songs (Choir, Unborn King)

  private updateSongs(): void {
    const sd = this.profile.defense.songs;
    if (!sd || this.armorBroken) return;
    if (this.song && this.fightMs >= this.song.until) {
      this.song = null;
      this.nextSongAt = this.fightMs + sd.gapMs;
    } else if (!this.song && this.fightMs >= this.nextSongAt && this.state !== 'stunned') {
      const pool = sd.list.filter((s) => s.id !== this.lastSong);
      const pick = pool[Math.floor(this.rng() * pool.length)] ?? sd.list[0];
      this.lastSong = pick.id;
      this.song = { def: pick, until: this.fightMs + sd.windowMs };
      this.showBanner(pick.announce, sd.windowMs);
      this.sound.playSelect();
    }
  }

  /** A song target struck: the right one cracks the shield, a wrong one strikes back. */
  private songStrike(t: Target): void {
    const sd = this.profile.defense.songs;
    if (!sd || this.armorBroken) return;
    const s = this.song;
    if (!s) {
      this.action.floatText(t.pos.x, t.pos.y - 26, sd.silentMessage, '#9aa7b8');
      return;
    }
    this.song = null;
    this.nextSongAt = this.fightMs + sd.gapMs;
    if (s.def.targetId === t.def.id) {
      this.songCracks++;
      this.play('shieldBlock', { x: this.boss.x, y: this.boss.y + 4 }, { palette: GOLD });
      this.beam(t.pos, 0xffe08a);
      if (this.songCracks >= sd.cracksToBreak) {
        this.showBanner(sd.breakMessage, 3200);
        this.breakArmor(this.scene.time.now);
      } else
        this.showBanner(`${s.def.crackMessage} (${this.songCracks}/${sd.cracksToBreak})`, 2600);
      return;
    }
    const amount = Math.max(1, Math.round(this.session.getStats().maxHp * sd.wrongPct));
    this.session.mp = Math.max(0, this.session.mp - sd.wrongMp);
    this.play('curse', () => ({ x: this.p.x, y: this.p.y + 14 }), {}, 1600);
    this.showBanner(sd.wrongMessage.replace('{damage}', String(amount)), 2600);
    this.action.directHit(amount);
  }

  private beam(from: Point, color: number): void {
    const g = this.scene.add.graphics().setDepth(41);
    g.lineStyle(4, color, 0.9);
    g.lineBetween(from.x, from.y, this.boss.x, this.boss.y);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: () => g.destroy() });
  }

  // ------------------------------------------------------------------ blood wall (Crimson Standard)

  private updateWall(now: number): void {
    const bw = this.profile.defense.bloodWall;
    if (!bw || this.wall || this.fightMs < this.nextWallAt || this.state === 'stunned') return;
    this.wall = { tethers: [] };
    for (let i = 0; i < bw.tethers; i++) {
      const spot = this.openSpot(bw.minDist, bw.maxDist);
      const def: BossTarget = {
        id: `tether_${i}`,
        label: this.t('boss.tether'),
        effect: 'progress',
        message: '',
        color: '#ff5a4a',
      };
      const t = this.makeTarget(def, spot);
      this.light(t);
      this.wall.tethers.push(t);
      this.targets.push(t);
    }
    this.showBanner(bw.raiseMessage, 3200);
    this.play(
      'groundSlam',
      { x: this.boss.x, y: this.boss.y + 18 },
      { reach: 70, palette: BLOOD },
      1200,
    );
    void now;
  }

  /** A floor point `min`–`max` px from the boss (not in a wall, inside the map). */
  private openSpot(min: number, max: number): Point {
    const b = this.scene.physics.world.bounds;
    for (let i = 0; i < 40; i++) {
      const ang = this.rng() * Math.PI * 2;
      const dist = min + this.rng() * (max - min);
      const x = this.boss.x + Math.cos(ang) * dist;
      const y = this.boss.y + Math.sin(ang) * dist;
      if (x < 40 || y < 40 || x > b.width - 40 || y > b.height - 40) continue;
      if (this.walls.getTileAtWorldXY(x, y)?.collides) continue;
      return { x, y };
    }
    return { x: this.p.x, y: this.p.y };
  }

  private cutTether(t: Target): void {
    const bw = this.profile.defense.bloodWall;
    if (!this.wall || !bw) return;
    this.wall.tethers = this.wall.tethers.filter((x) => x !== t);
    this.targets = this.targets.filter((x) => x !== t);
    this.play('hitSpark', { x: t.pos.x, y: t.pos.y }, { palette: BLOOD });
    this.dispose([t.obj]);
    this.action.floatText(t.pos.x, t.pos.y - 26, bw.cutMessage, '#ff8a6a');
    if (this.wall.tethers.length > 0) return;
    this.wall = null;
    this.nextWallAt = this.fightMs + bw.everyMs;
    this.showBanner(bw.breakMessage, 2800);
    this.stun(this.scene.time.now, bw.stunMs, this.t('action.stunned'));
  }

  // ------------------------------------------------------------------ ally (Kuro at the Unborn throne)

  private updateAlly(): void {
    const a = this.profile.ally;
    const s = this.allySprite;
    if (!a || !s) return;
    s.x += (this.p.x - 28 - s.x) * 0.08;
    s.y += (this.p.y + 4 - s.y) * 0.08;
    s.setFlipX(this.boss.x < s.x);
    if (this.fightMs < this.nextAllyAt) return;
    this.nextAllyAt += a.everyMs;
    const dmg = Math.ceil(this.maxHp * a.damagePct);
    this.hp = Math.max(this.armorBroken ? 0 : 1, this.hp - dmg);
    this.play('hitSpark', { x: this.boss.x, y: this.boss.y }, { palette: WRAITH });
    this.action.floatText(this.boss.x, this.boss.y - 34, `-${dmg}`, '#b09aff');
    this.showBanner(a.message.replace('{damage}', String(dmg)), 2000);
    this.checkPhase();
    if (this.hp <= 0) this.victory();
  }

  // ------------------------------------------------------------------ feints (The Last War)

  /** A decoy circle, then the real blow on where Peter stands, late. */
  private feintSlam(move: Extract<BossMove, { type: 'slam' }>, now: number): void {
    const ang = this.rng() * Math.PI * 2;
    const decoy = { x: this.p.x + Math.cos(ang) * 80, y: this.p.y + Math.sin(ang) * 80 };
    const lead = move.telegraphMs;
    this.telegraphs.push({
      until: now + lead,
      draw: (g, t) => {
        const k = 1 - Math.max(0, now + lead - t) / lead;
        g.fillStyle(0xff3030, 0.12 + 0.25 * k);
        g.fillCircle(decoy.x, decoy.y, move.radius);
      },
    });
    this.later(lead, () => {
      if (this.state !== 'telegraph') return;
      this.action.floatText(this.boss.x, this.boss.y - 46, this.t('boss.feint'), '#ffb86b');
      const spot = this.p;
      const at = this.scene.time.now + 420;
      this.telegraphs.push({
        until: at,
        draw: (g) => {
          g.fillStyle(0xff3030, 0.4);
          g.fillCircle(spot.x, spot.y, move.radius);
        },
      });
      this.later(420, () => {
        if (this.state === 'stunned') return;
        this.play(move.fx ?? 'groundSlam', spot, { reach: Math.round(move.radius * 1.6) }, 1100);
        this.hazards.push({
          test: (p) => Math.hypot(p.x - spot.x, p.y - spot.y) <= move.radius,
          mult: move.mult,
          until: this.scene.time.now + 120,
          hit: false,
        });
        this.boss.clearTint();
        this.state = 'act';
        this.stateUntil = this.scene.time.now + 300;
      });
    });
  }

  private updateTargets(): void {
    const d = this.profile.defense;
    if (!this.targetsOpen && d.targets?.length && d.unlockAfterMs !== undefined)
      if (this.fightMs >= d.unlockAfterMs) this.openTargets();
  }

  private openTargets(): void {
    if (this.targetsOpen || !this.profile.defense.targets?.length || this.armorBroken) return;
    this.targetsOpen = true;
    if (this.profile.defense.unlockMessage)
      this.showBanner(this.profile.defense.unlockMessage, 3600);
    for (const t of this.targets) if (!t.def.hidden) this.light(t);
  }

  private strikeTarget(t: Target): void {
    if (this.ended || !t.obj.visible) return;
    if (this.wall?.tethers.includes(t)) return this.cutTether(t);
    if (!this.targetsOpen || this.armorBroken || this.finality) return;
    if (t.def.effect === 'song') return this.songStrike(t);
    const now = this.scene.time.now;
    const ready = targetReady(t.def, this.targetsDone, this.state === 'stunned');
    if (ready === 'done') return;
    const wrong = this.profile.defense.wrongOrder;
    if (ready === 'order' && wrong) {
      // The chain restarts and Peter pays for it.
      const amount = Math.max(1, Math.round(this.session.getStats().maxHp * wrong.pct));
      this.targetsDone.clear();
      for (const x of this.targets) if (x.obj.visible) this.light(x);
      this.showBanner(wrong.message.replace('{damage}', String(amount)), 2600);
      this.play('curse', () => ({ x: this.p.x, y: this.p.y + 14 }), {}, 1400);
      this.action.directHit(amount);
      return;
    }
    if (ready !== 'ok') {
      this.action.floatText(t.pos.x, t.pos.y - 30, '✕', '#ff8080');
      if (this.profile.defense.lockedMessage)
        this.showBanner(this.profile.defense.lockedMessage, 2600);
      return;
    }
    this.targetsDone.add(t.def.id);
    this.sound.playSelect();
    this.showBanner(t.def.message, 3000);
    this.play('hitSpark', { x: t.pos.x, y: t.pos.y }, { palette: GOLD });
    const g = this.scene.add.graphics().setDepth(41);
    g.lineStyle(4, 0xffe08a, 0.9);
    g.lineBetween(t.pos.x, t.pos.y, this.boss.x, this.boss.y);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: () => g.destroy() });
    // A struck target turns blue; it lights up gold again if the chance is missed.
    this.gemOf(t).setFillStyle(0x9ad7ff);
    if (t.def.effect === 'finality') {
      this.finality = true;
      this.showBanner(this.profile.defense.ritual?.completeMessage ?? t.def.message, 3000);
      this.play('holyPillar', { x: this.boss.x, y: this.boss.y + 20 }, {}, 1600);
      this.stun(now, 3000, this.t('action.stunned'));
    } else if (t.def.effect === 'stun') {
      this.stun(now, t.def.stunMs ?? 3000, this.t('action.stunned'));
    } else if (t.def.effect === 'progress') {
      if (t.def.stunMs) this.stun(now, t.def.stunMs, this.t('action.stunned'));
    } else {
      this.breakArmor(now, t.def.setHpPct);
    }
  }

  // ------------------------------------------------------------------ drawing

  private draw(now: number): void {
    const g = this.fx;
    g.clear();
    if (this.ended) return;
    for (const t of this.telegraphs) t.draw(g, now);
    for (const h of this.hazards) h.draw?.(g, now);
    const d = this.profile.defense;
    if (d.reflect && isGlowing(this.fightMs, d.reflect.everyMs, d.reflect.glowMs)) {
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
    if (this.wall) {
      // The blood wall: a red aura and the tethers that feed it.
      g.lineStyle(4, 0xd23a2a, 0.5 + 0.25 * Math.sin(now / 150));
      g.strokeCircle(this.boss.x, this.boss.y, this.profile.radius + 10);
      g.lineStyle(2, 0xff5a4a, 0.7);
      for (const t of this.wall.tethers) g.lineBetween(this.boss.x, this.boss.y, t.pos.x, t.pos.y);
    }
    if (this.lock) {
      g.lineStyle(2, 0x9ad7ff, 0.8);
      g.strokeEllipse(this.p.x, this.p.y + 14, 30, 12);
    }
    if (this.song) {
      const c = Phaser.Display.Color.HexStringToColor(this.song.def.color).color;
      g.lineStyle(3, c, 0.55 + 0.3 * Math.sin(now / 110));
      g.strokeCircle(this.boss.x, this.boss.y, this.profile.radius + 8);
    }
    if (this.sentence) {
      // The sentence's aura around the boss, and a ring under Peter while it holds.
      const c = Phaser.Display.Color.HexStringToColor(this.sentence.def.color).color;
      g.lineStyle(3, c, 0.55 + 0.3 * Math.sin(now / 120));
      g.strokeCircle(this.boss.x, this.boss.y, this.profile.radius + 8);
      g.lineStyle(2, c, 0.6);
      g.strokeEllipse(this.p.x, this.p.y + 14, 26, 10);
    }
    const w = this.scene.scale.width;
    const bw = 300;
    const bx = w / 2 - bw / 2;
    const b = this.bar;
    b.clear();
    b.fillStyle(0x000000, 0.65).fillRect(bx - 2, 266, bw + 4, 11);
    b.fillStyle(0x5a1a1a, 1).fillRect(bx, 268, bw, 7);
    b.fillStyle(this.armorBroken || !d.armor ? 0xe0504a : 0x4fa3c7, 1);
    b.fillRect(bx, 268, bw * this.hpPct, 7);
    const songs = d.songs;
    if (songs && !this.armorBroken) {
      for (let i = 0; i < songs.cracksToBreak; i++) {
        b.fillStyle(i < this.songCracks ? 0xf0c860 : 0x3a3020, 1);
        b.fillRect(bx + bw + 8 + i * 10, 267, 7, 9);
      }
      if (this.song) {
        const left = Math.max(0, (this.song.until - this.fightMs) / songs.windowMs);
        const c = Phaser.Display.Color.HexStringToColor(this.song.def.color).color;
        b.fillStyle(c, 0.9).fillRect(bx, 277, bw * left, 2);
      }
    }
    const sd = d.sentences;
    if (sd && !this.armorBroken) {
      // Cracks in the scale, and the time left on the sentence in force.
      for (let i = 0; i < sd.cracksToBreak; i++) {
        b.fillStyle(i < this.cracks ? 0xf0c860 : 0x3a3020, 1);
        b.fillRect(bx + bw + 8 + i * 10, 267, 7, 9);
      }
      if (this.sentence) {
        const left = Math.max(0, (this.sentence.until - this.fightMs) / sd.windowMs);
        const c = Phaser.Display.Color.HexStringToColor(this.sentence.def.color).color;
        b.fillStyle(c, 0.9).fillRect(bx, 277, bw * left, 2);
      }
    }
  }

  private showBanner(text: string, ms: number): void {
    if (!text || !this.banner.scene) return;
    this.banner.setText(text).setVisible(true).setAlpha(1);
    this.scene.tweens.killTweensOf(this.banner);
    this.scene.tweens.add({ targets: this.banner, alpha: 0, delay: ms, duration: 400 });
  }

  // ------------------------------------------------------------------ end

  private readonly onFinisherKey = (): void => {
    if (this.finisherReady()) {
      this.showBanner(this.profile.finisher!.message, 3000);
      this.victory();
    }
  };

  private finisherReady(): boolean {
    const f = this.profile.finisher;
    if (!f || this.ended || this.host.isPaused()) return false;
    return this.hpPct <= f.belowPct && this.session.inventory.hasItem(f.itemId, 1);
  }

  private updateFinisher(): void {
    if (!this.finisherText) return;
    const ready = this.finisherReady();
    this.finisherText.setVisible(ready);
    if (ready)
      this.finisherText.setPosition(this.boss.x, this.boss.y - this.boss.displayHeight / 2 - 8);
  }

  /** Ally, finisher prompt and key: gone when the fight ends, whichever way. */
  private cleanupExtras(): void {
    this.finisherKey?.off('down', this.onFinisherKey);
    this.finisherKey = null;
    if (this.finisherText) this.dispose([this.finisherText]);
    const ally = this.allySprite;
    this.allySprite = null;
    if (ally?.scene)
      this.scene.tweens.add({
        targets: ally,
        alpha: 0,
        delay: 1200,
        duration: 500,
        onComplete: () => ally.destroy(),
      });
    for (const t of this.wall?.tethers ?? []) this.dispose([t.obj]);
    this.wall = null;
  }

  private victory(): void {
    this.cleanupExtras();
    this.ended = true;
    this.state = 'done';
    this.action.extension = null;
    this.sentence = null;
    this.stunFx?.stop();
    this.boss.setVelocity(0, 0);
    this.hazards = [];
    this.telegraphs = [];
    this.fx.clear();
    this.dispose([this.bar, this.title, ...this.targets.map((t) => t.obj)]);
    for (const c of this.colliders.splice(0)) c.destroy();
    this.boss.anims.stop();
    this.boss.clearTint();
    const released = this.enemy.mechanic?.releasedFrame;
    if (released !== undefined) {
      // A released boss kneels where it fell; what bound it rises away.
      this.boss.setFrame(released);
      (this.boss.body as Phaser.Physics.Arcade.Body).setEnable(false);
      this.scene.cameras.main.flash(500, 136, 237, 255);
      this.play('soulRise', { x: this.boss.x, y: this.boss.y + 20 });
    } else {
      this.play('poof', { x: this.boss.x, y: this.boss.y + 16 });
      this.scene.tweens.add({
        targets: this.boss,
        alpha: 0,
        scale: 0.1,
        duration: 800,
        onComplete: () => this.boss.destroy(),
      });
    }
    const msg = this.enemy.mechanic?.defeatMessage;
    if (msg) this.showBanner(msg, 2200);
    this.scene.time.delayedCall(2600, () => this.dispose([this.banner]));
    // The win counts at once (flag, rewards): nothing that happens next may lose it.
    this.host.onVictory(this.enemy);
  }

  /** Destroys what is still alive (safe to call twice: victory, then the scene shutting down). */
  private dispose(objs: Phaser.GameObjects.GameObject[]): void {
    for (const o of objs) {
      if (!o.scene) continue;
      this.scene.tweens.killTweensOf(o);
      if (o instanceof Phaser.GameObjects.Container)
        for (const child of o.list) this.scene.tweens.killTweensOf(child);
      o.destroy();
    }
  }

  /** Map change or knock-out: drop everything without a result. */
  public destroy(): void {
    this.cleanupExtras();
    this.ended = true;
    this.action.extension = null;
    this.action.bossHpFloor = 0;
    this.dispose([this.fx, this.bar, this.title, this.banner, ...this.targets.map((t) => t.obj)]);
    for (const c of this.colliders.splice(0)) c.destroy();
  }
}
