import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import type { GameSession } from '../../state/GameSession';
import { distance, inSlash, type Point } from '../../systems/action/ActionRules';
import {
  absorb,
  blinkDistance,
  chainMult,
  chainOrder,
  executes,
  type SkillDef,
} from '../../systems/action/AuthorityRules';
import type { Translate } from '../../ui/Strings';
import type { CombatExtension, Roamer } from './ActionTypes';

/** What the powers need from the action combat (kept narrow on purpose). */
export interface AuthorityHost {
  scene: Phaser.Scene;
  player: Player;
  session: GameSession;
  t: Translate;
  roamers(): Roamer[];
  /** One blow on a roamer through all its defences; the damage dealt or null. */
  strike(r: Roamer, mult: number, critBonus?: number): number | null;
  /** Damage straight to a roamer (burns). */
  wound(r: Roamer, damage: number): void;
  /** Ends a roamer outright (Finality). */
  slay(r: Roamer): void;
  floatText(x: number, y: number, text: string, color: string): void;
  extension(): CombatExtension | null;
  /** A wall or the map's edge at this world point. */
  blocked(x: number, y: number): boolean;
  /** Peter cannot be hurt for `ms`. */
  shelter(ms: number): void;
  refreshHud(): void;
}

const hex = (c: string): number => Phaser.Display.Color.HexStringToColor(c).color;

/**
 * Peter's Authority skills in the field (owner, 2026-11-18): Continuum's tide, Causality's chain,
 * Memory's echo, Finality's cleave, Possibility's branch and Origin's dawn. Cooldowns, the shield,
 * the echo, burns and slows live here; damage goes through the host so every enemy defence holds.
 */
export class AuthorityPowers {
  private readonly cooldownUntil = new Map<string, number>();
  private shield = 0;
  private shieldUntil = 0;
  private shieldRing: Phaser.GameObjects.Arc | null = null;
  private echo: {
    sprite: Phaser.GameObjects.Sprite;
    until: number;
    next: number;
    def: SkillDef;
  } | null = null;
  private critUntil = 0;

  constructor(private readonly h: AuthorityHost) {
    h.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shieldRing?.destroy();
      this.echo?.sprite.destroy();
    });
  }

  /** 0 when ready, else the share of the cooldown still to run (for the skill bar). */
  public cooldownLeft(def: SkillDef, now: number): number {
    const until = this.cooldownUntil.get(def.id) ?? 0;
    return until <= now ? 0 : (until - now) / def.cooldownMs;
  }

  public ready(def: SkillDef, now: number): boolean {
    return (this.cooldownUntil.get(def.id) ?? 0) <= now;
  }

  /** The shield takes a blow first: what is left for Peter. */
  public absorb(damage: number): number {
    if (this.shield <= 0 || this.h.scene.time.now >= this.shieldUntil) return damage;
    const res = absorb(this.shield, damage);
    this.shield = res.shield;
    if (res.damage < damage)
      this.h.floatText(this.h.player.x, this.h.player.y - 30, this.h.t('skill.shield'), '#fff0b0');
    if (this.shield <= 0) this.dropShield();
    return res.damage;
  }

  /** Possibility: the next slash after a branch is a sure critical (used once). */
  public takeCrit(): number {
    if (this.h.scene.time.now >= this.critUntil) return 0;
    this.critUntil = 0;
    return 1;
  }

  /** Casts `def` toward `aim` (radians). Costs and cooldown are the caller's. */
  public cast(def: SkillDef, aim: number): void {
    this.cooldownUntil.set(def.id, this.h.scene.time.now + def.cooldownMs);
    switch (def.authority) {
      case 'continuum':
        return this.tide(def, aim);
      case 'causality':
        return this.chain(def);
      case 'memory':
        return this.summonEcho(def);
      case 'finality':
        return this.cleave(def, aim);
      case 'possibility':
        return this.branch(def, aim);
      case 'origin':
        return this.dawn(def);
    }
  }

  /** Per frame: the echo fights, the shield ring follows, burns tick, slows wear off. */
  public update(now: number): void {
    const p = this.h.player;
    if (this.shieldRing) {
      if (now >= this.shieldUntil) this.dropShield();
      else this.shieldRing.setPosition(p.x, p.y - 8);
    }
    if (this.echo) {
      const e = this.echo;
      if (now >= e.until) {
        this.h.scene.tweens.add({
          targets: e.sprite,
          alpha: 0,
          duration: 300,
          onComplete: () => e.sprite.destroy(),
        });
        this.echo = null;
      } else {
        e.sprite.x += (p.x - 22 - e.sprite.x) * 0.08;
        e.sprite.y += (p.y - 6 - e.sprite.y) * 0.08;
        if (now >= e.next) {
          e.next = now + (e.def.everyMs ?? 800);
          this.echoStrike(e.def, { x: e.sprite.x, y: e.sprite.y });
        }
      }
    }
    for (const r of this.h.roamers()) {
      if (!r.alive) continue;
      if (r.burn && now >= r.burn.next) {
        r.burn.left -= 1;
        r.burn.next = now + r.burn.every;
        this.h.wound(r, r.burn.damage);
        this.h.floatText(r.sprite.x, r.sprite.y - 26, '🔥', '#ff8a4a');
        if (r.burn.left <= 0) r.burn = undefined;
      }
      if (r.slowUntil && now >= r.slowUntil) {
        r.slowUntil = undefined;
        r.sprite.clearTint();
      }
    }
  }

  // ------------------------------------------------------------------ the six

  /** Continuum: a wave sweeps the arc in front, throwing foes back and slowing them. */
  private tide(def: SkillDef, aim: number): void {
    const o = this.origin();
    const range = def.range ?? 110;
    const arc = def.arcDeg ?? 100;
    this.drawArc(o, aim, range, arc, hex(def.color), 0.55);
    const now = this.h.scene.time.now;
    for (const r of this.h.roamers()) {
      if (!r.alive || !inSlash(o, aim, r.sprite, range, arc)) continue;
      this.h.strike(r, def.mult);
      if (!r.alive) continue;
      const away = Math.atan2(r.sprite.y - o.y, r.sprite.x - o.x);
      const k = def.knockback ?? 240;
      r.sprite.setVelocity(Math.cos(away) * k, Math.sin(away) * k);
      r.stunUntil = now + 260;
      r.slowUntil = now + (def.slowMs ?? 2500);
      r.slowPct = def.slowPct ?? 0.45;
      r.sprite.setTint(0x9fdcff);
    }
    this.h.extension()?.onArea?.(o, range, this.attack(), def.mult, { slowMs: def.slowMs });
  }

  /** Causality: a gold bolt to the nearest foe, then hop by hop to the next ones. */
  private chain(def: SkillDef): void {
    const o = this.origin();
    const roamers = this.h.roamers().filter((r) => r.alive && !r.clone);
    const boss = this.h.extension()?.shotTargets(this.attack(), def.mult) ?? [];
    const points: Point[] = [
      ...roamers.map((r) => ({ x: r.sprite.x, y: r.sprite.y })),
      ...boss.map((b) => ({ x: b.x, y: b.y })),
    ];
    const order = chainOrder(o, points, def.range ?? 190, def.hopRange ?? 120, def.hops ?? 4);
    if (order.length === 0) {
      this.h.floatText(o.x, o.y - 24, '…', '#ffd36b');
      return;
    }
    const g = this.h.scene.add.graphics().setDepth(41);
    let from = o;
    order.forEach((idx, hop) => {
      const to = points[idx];
      this.bolt(g, from, to, hex(def.color));
      if (idx < roamers.length)
        this.h.strike(roamers[idx], chainMult(def.mult, def.falloff ?? 0.15, hop));
      else
        boss[idx - roamers.length].hit({ from, angle: Math.atan2(to.y - from.y, to.x - from.x) });
      from = to;
    });
    this.h.scene.tweens.add({ targets: g, alpha: 0, duration: 380, onComplete: () => g.destroy() });
  }

  /** Memory: Peter's own echo stands at his shoulder and cuts at the nearest foe. */
  private summonEcho(def: SkillDef): void {
    const p = this.h.player;
    this.echo?.sprite.destroy();
    const s = this.h.scene.add
      .sprite(p.x - 22, p.y - 6, p.sprite.texture.key, p.sprite.frame.name)
      .setOrigin(p.sprite.originX, p.sprite.originY)
      .setTint(hex(def.color))
      .setAlpha(0)
      .setDepth(p.sprite.depth - 0.001);
    this.h.scene.tweens.add({ targets: s, alpha: 0.6, duration: 260 });
    const now = this.h.scene.time.now;
    this.echo = { sprite: s, until: now + (def.durationMs ?? 6000), next: now + 300, def };
  }

  private echoStrike(def: SkillDef, at: Point): void {
    const range = def.range ?? 70;
    let best: Roamer | null = null;
    let bestD = range;
    for (const r of this.h.roamers()) {
      if (!r.alive || r.clone) continue;
      const d = distance(at, r.sprite);
      if (d <= bestD) {
        bestD = d;
        best = r;
      }
    }
    const ext = this.h.extension();
    if (!best && !ext) return;
    if (best) {
      const aim = Math.atan2(best.sprite.y - at.y, best.sprite.x - at.x);
      this.drawArc(at, aim, 34, 90, hex(def.color), 0.5);
      this.h.strike(best, def.mult);
    }
    ext?.onArea?.(at, range, this.attack(), def.mult);
  }

  /** Finality: a wide burning cleave; the weakest foes simply end. */
  private cleave(def: SkillDef, aim: number): void {
    const o = this.origin();
    const range = def.range ?? 58;
    const arc = def.arcDeg ?? 150;
    this.drawArc(o, aim, range, arc, hex(def.color), 0.8);
    const now = this.h.scene.time.now;
    for (const r of this.h.roamers()) {
      if (!r.alive || !inSlash(o, aim, r.sprite, range, arc)) continue;
      if (!r.clone && executes(r.hp, r.enemy.maxHp, def.executePct ?? 0.2, false)) {
        this.h.floatText(r.sprite.x, r.sprite.y - 30, this.h.t('skill.executed'), '#ff8a4a');
        this.h.slay(r);
        continue;
      }
      this.h.strike(r, def.mult);
      if (r.alive && def.burnTicks)
        r.burn = {
          left: def.burnTicks,
          every: def.burnEveryMs ?? 1000,
          next: now + (def.burnEveryMs ?? 1000),
          damage: Math.max(1, Math.floor(this.attack() * (def.burnMult ?? 0.2))),
        };
    }
    this.h.extension()?.onArea?.(o, range, this.attack(), def.mult);
  }

  /** Possibility: Peter steps onto another branch; the one he left behind bursts. */
  private branch(def: SkillDef, aim: number): void {
    const p = this.h.player;
    const o = this.origin();
    const v = p.getController().getMovementVector();
    const ang = v.x !== 0 || v.y !== 0 ? Math.atan2(v.y, v.x) : aim;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const d = blinkDistance(def.range ?? 112, (k) => this.h.blocked(o.x + dx * k, o.y + dy * k));
    // The decoy left behind: a green after-image that bursts.
    const decoy = this.h.scene.add
      .sprite(p.x, p.y, p.sprite.texture.key, p.sprite.frame.name)
      .setOrigin(p.sprite.originX, p.sprite.originY)
      .setTint(hex(def.color))
      .setAlpha(0.7)
      .setDepth(p.sprite.depth);
    p.sprite.setPosition(o.x + dx * d, o.y + dy * d);
    (p.sprite.body as Phaser.Physics.Arcade.Body | null)?.reset(o.x + dx * d, o.y + dy * d);
    this.h.shelter(260);
    this.critUntil = this.h.scene.time.now + (def.critWindowMs ?? 3000);
    this.h.floatText(p.x, p.y - 28, this.h.t('skill.crit'), '#4ae08a');
    this.h.scene.time.delayedCall(def.fuseMs ?? 900, () => {
      const at = { x: decoy.x, y: decoy.y };
      const radius = def.radius ?? 52;
      const ring = this.h.scene.add
        .circle(at.x, at.y, 6, hex(def.color), 0.35)
        .setStrokeStyle(2, hex(def.color), 0.9)
        .setDepth(40);
      this.h.scene.tweens.add({
        targets: ring,
        radius,
        alpha: 0,
        duration: 320,
        onComplete: () => ring.destroy(),
      });
      decoy.destroy();
      for (const r of this.h.roamers())
        if (r.alive && distance(at, r.sprite) <= radius) this.h.strike(r, def.mult);
      this.h.extension()?.onArea?.(at, radius, this.attack(), def.mult);
    });
  }

  /** Origin: light of the first hour heals Peter, shields him and pushes foes away. */
  private dawn(def: SkillDef): void {
    const p = this.h.player;
    const s = this.h.session;
    const max = s.getStats().maxHp;
    const heal = Math.floor(max * (def.healPct ?? 0.25));
    s.hp = Math.min(max, s.hp + heal);
    this.h.floatText(p.x, p.y - 34, `+${heal}`, '#9fffb0');
    this.shield = Math.floor(max * (def.shieldPct ?? 0.2));
    this.shieldUntil = this.h.scene.time.now + (def.durationMs ?? 8000);
    this.shieldRing?.destroy();
    this.shieldRing = this.h.scene.add
      .circle(p.x, p.y - 8, 22, hex(def.color), 0.12)
      .setStrokeStyle(1, hex(def.color), 0.9)
      .setDepth(p.sprite.depth + 0.01);
    const o = this.origin();
    const radius = def.radius ?? 72;
    this.drawArc(o, 0, radius, 360, hex(def.color), 0.45);
    for (const r of this.h.roamers()) {
      if (!r.alive || distance(o, r.sprite) > radius) continue;
      this.h.strike(r, def.mult);
      if (!r.alive) continue;
      const away = Math.atan2(r.sprite.y - o.y, r.sprite.x - o.x);
      r.sprite.setVelocity(Math.cos(away) * 220, Math.sin(away) * 220);
      r.stunUntil = this.h.scene.time.now + 220;
    }
    this.h.extension()?.onArea?.(o, radius, this.attack(), def.mult);
    this.h.refreshHud();
  }

  // ------------------------------------------------------------------ helpers

  private origin(): Point {
    return { x: this.h.player.x, y: this.h.player.y };
  }

  private attack(): number {
    return this.h.session.getStats().attack;
  }

  private dropShield(): void {
    this.shield = 0;
    this.shieldRing?.destroy();
    this.shieldRing = null;
  }

  /** A filled, fading arc (a full circle when `arcDeg` is 360). */
  private drawArc(
    o: Point,
    aim: number,
    range: number,
    arcDeg: number,
    color: number,
    alpha: number,
  ): void {
    const g = this.h.scene.add.graphics().setDepth(40);
    const half = Phaser.Math.DegToRad(arcDeg / 2);
    g.fillStyle(color, alpha * 0.45);
    g.lineStyle(2, color, alpha);
    g.beginPath();
    if (arcDeg >= 360) g.arc(o.x, o.y, range, 0, Math.PI * 2);
    else {
      g.moveTo(o.x, o.y);
      g.arc(o.x, o.y, range, aim - half, aim + half);
      g.closePath();
    }
    g.fillPath();
    g.strokePath();
    g.setScale(0.6);
    g.setPosition(o.x * 0.4, o.y * 0.4);
    this.h.scene.tweens.add({
      targets: g,
      scale: 1,
      x: 0,
      y: 0,
      alpha: 0,
      duration: 360,
      ease: 'Cubic.easeOut',
      onComplete: () => g.destroy(),
    });
  }

  /** A jagged bolt of light between two points. */
  private bolt(g: Phaser.GameObjects.Graphics, a: Point, b: Point, color: number): void {
    const n = 6;
    const pts: Point[] = [a];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      pts.push({
        x: a.x + (b.x - a.x) * t + (Math.random() - 0.5) * 10,
        y: a.y + (b.y - a.y) * t + (Math.random() - 0.5) * 10,
      });
    }
    pts.push(b);
    for (const [w, al] of [
      [4, 0.25],
      [2, 0.6],
      [1, 1],
    ] as const) {
      g.lineStyle(w, w === 1 ? 0xffffff : color, al);
      g.strokePoints(pts);
    }
  }
}
