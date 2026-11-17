import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import { type GameSession } from '../../state/GameSession';
import {
  distance,
  inSlash,
  rollHit,
  type ActionTuning,
  type Point,
} from '../../systems/action/ActionRules';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import type { CombatTuning } from '../../systems/combat/CombatTypes';
import type { Translate } from '../../ui/Strings';
import { laserStage, ringCrosses, ringState, trailPosition, twinPaired } from '../Chapter6Rules';
import {
  chainCenters,
  chainVerdict,
  figureEight,
  houndSolid,
  huskFrozen,
  huskPulls,
  tellStage,
} from '../Chapter7Rules';
import {
  bellCrackable,
  bellState,
  inTickWindow,
  mimicCounters,
  mimicFrame,
  sweepAngle,
  tauntActive,
  type PeterMove,
} from '../Chapter8Rules';
import { chainState, thrustPhase } from '../Chapter9Rules';
import { ActionHost, Roamer, f9 } from './ActionTypes';
import { baseScale } from '../ActorScale';
export interface FieldFoesContext {
  roamers: Roamer[];
  player: Player;
  floatText: (x: number, y: number, text: string, color: string) => void;
  t: Translate;
  hitPlayer: (r: Roamer, opts?: { mult?: number; stunMs?: number }) => void;
  aimLines: Phaser.GameObjects.Graphics;
  scene: Phaser.Scene;
  session: GameSession;
  combat: CombatTuning;
  rng: () => number;
  damageRoamer: (r: Roamer, damage: number, critical: boolean) => void;
  companion: Phaser.Physics.Arcade.Sprite | null;
  segmentDistance: (p: Point, a: Point, b: Point) => number;
  sound: SoundSystem;
  trailLog: { t: number; x: number; y: number }[];
  faceX: (r: Roamer, dx: number) => void;
  lightKeys: Set<string>;
  defeatRoamer: (r: Roamer) => void;
  tuning: ActionTuning;
  lastDashAt: number;
  host: ActionHost;
  invulnUntil: number;
  slowUntil: number;
  slowPct: number;
  stillSince: number;
  silencedUntil: number;
  endInhale: (r: Roamer, now: number) => void;
  dotUntil: number;
  dotPerSec: number;
}

export function teach(this: FieldFoesContext, move: PeterMove): void {
  for (const r of this.roamers) {
    const mi = r.enemy.field?.mimic;
    if (!mi || !r.alive || distance(r.sprite, this.player) > mi.range) continue;
    r.learned = move;
    r.sprite.anims.stop();
    r.sprite.setFrame(mimicFrame(move));
  }
}

export function mimicCounter(this: FieldFoesContext, r: Roamer, move: PeterMove): boolean {
  const mi = r.enemy.field?.mimic;
  if (!mi || !mimicCounters(r.learned ?? null, move)) return false;
  this.floatText(r.sprite.x, r.sprite.y - 20, this.t('action.mimicked'), '#f0c860');
  this.hitPlayer(r, { mult: mi.counterMult });
  return true;
}

export function updateBell(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function crackBell(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function shieldTurned(this: FieldFoesContext, r: Roamer, now: number): boolean {
  const at = r.enemy.field?.allyTaunt;
  if (!at) return false;
  const near = !!this.companion && distance(this.companion, r.sprite) < at.range;
  return tauntActive(now, r.glowOffset, at.everyMs, at.turnMs, near);
}

export function updateSweep(this: FieldFoesContext, r: Roamer, now: number): void {
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
  if (this.segmentDistance(this.player, r.sprite, tip) < 14 && now > (r.sweepTouchAt ?? 0) + 700) {
    r.sweepTouchAt = now;
    this.hitPlayer(r, { mult: sw.sweepMult });
  }
}

export function updateThrust(this: FieldFoesContext, r: Roamer, now: number): boolean {
  const th = f9(r).thrust;
  if (!th) return false;
  if (!r.thrust) {
    if (now < (r.nextThrustAt ?? 0) || distance(r.sprite, this.player) > th.range) return false;
    const dx = this.player.x - r.sprite.x;
    const dy = this.player.y - r.sprite.y;
    const len = Math.hypot(dx, dy) || 1;
    r.thrust = {
      at: now,
      from: { x: r.sprite.x, y: r.sprite.y },
      to: { x: r.sprite.x + (dx / len) * th.range, y: r.sprite.y + (dy / len) * th.range },
      hit: false,
    };
    r.sprite.anims.stop();
    r.sprite.setFrame(3);
  }
  const t = r.thrust;
  const phase = thrustPhase(now, t.at, th.warnMs, th.lungeMs, th.stuckMs);
  if (phase === 'warn') {
    r.sprite.setVelocity(0, 0);
    this.aimLines.lineStyle(2, 0xff4a4a, 0.85).lineBetween(t.from.x, t.from.y, t.to.x, t.to.y);
    return true;
  }
  if (phase === 'lunge') {
    const k = Math.min(1, (now - t.at - th.warnMs) / th.lungeMs);
    r.sprite.setPosition(t.from.x + (t.to.x - t.from.x) * k, t.from.y + (t.to.y - t.from.y) * k);
    r.sprite.setVelocity(0, 0);
    if (!t.hit && this.segmentDistance(this.player, t.from, r.sprite) < 16) {
      t.hit = true;
      this.hitPlayer(r, { mult: th.damageMult });
    }
    return true;
  }
  if (phase === 'stuck') {
    r.sprite.setVelocity(0, 0);
    r.sprite.setTint(0x9a9ab0);
    return true;
  }
  r.thrust = null;
  r.nextThrustAt = now + th.cooldownMs;
  r.sprite.clearTint();
  if (this.scene.anims.exists(r.def.anim ?? '')) r.sprite.play(r.def.anim ?? '');
  return false;
}

export function thrustMult(this: FieldFoesContext, r: Roamer, now: number): number {
  const th = f9(r).thrust;
  if (!th) return 1;
  const stuck =
    !!r.thrust && thrustPhase(now, r.thrust.at, th.warnMs, th.lungeMs, th.stuckMs) === 'stuck';
  return stuck ? th.stuckMult : th.guardMult;
}

export function updateChain4(this: FieldFoesContext, r: Roamer, now: number): boolean {
  const ch = f9(r).chain4;
  if (!ch) return false;
  if (r.chainAt === null || r.chainAt === undefined) {
    if (distance(r.sprite, this.player) > ch.range) return false;
    r.chainAt = now;
    r.chainBeat = 0;
    r.sprite.anims.stop();
  }
  const st = chainState(now, r.chainAt, ch.beatMs, ch.windowMs);
  r.sprite.setVelocity(0, 0);
  if (st.beat > (r.chainBeat ?? 0)) {
    r.chainBeat = st.beat;
    r.sprite.setFrame((st.beat - 1) % 4);
    this.aimLines.lineStyle(3, 0xe5c158, 0.9).strokeCircle(r.sprite.x, r.sprite.y, ch.reach);
    if (distance(r.sprite, this.player) <= ch.reach) this.hitPlayer(r, { mult: ch.damageMult });
  }
  if (st.open) r.sprite.setTint(0x88edff);
  if (st.done) {
    r.chainAt = null;
    r.sprite.clearTint();
    return false;
  }
  return true;
}

export function chainGuarded(this: FieldFoesContext, r: Roamer, now: number): boolean {
  const ch = f9(r).chain4;
  if (!ch) return false;
  if (r.chainAt === null || r.chainAt === undefined) return true;
  return !chainState(now, r.chainAt, ch.beatMs, ch.windowMs).open;
}

export function updateLineCut(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function updateTrail(this: FieldFoesContext, r: Roamer, now: number): void {
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

export function placeOrbs(this: FieldFoesContext, now: number): void {
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

export function slashTwin(
  this: FieldFoesContext,
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

export function updateRings(this: FieldFoesContext, r: Roamer, now: number): boolean {
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
        this.floatText(this.player.x, this.player.y - 22, this.t('action.perfectDodge'), '#9fe8ff');
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

export function updateLaser(this: FieldFoesContext, r: Roamer, now: number): boolean {
  const lz = r.enemy.field?.laser;
  if (!lz) return false;
  if (!r.laser) {
    if (now < (r.nextLaserAt ?? 0) || distance(r.sprite, this.player) > lz.range) return false;
    const dx = this.player.x - r.sprite.x;
    const dy = this.player.y - r.sprite.y;
    // The line runs through Peter along the axis he is farther away on.
    const across = Math.abs(dx) >= Math.abs(dy);
    const from = across ? { x: r.sprite.x, y: this.player.y } : { x: this.player.x, y: r.sprite.y };
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

export function shutLaser(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function updateHusk(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function updateInhale(this: FieldFoesContext, r: Roamer, now: number): boolean {
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
    r.sprite.setScale(baseScale(r.sprite) * (1 + ((now - r.inhaleAt) / ih.tellMs) * 0.3));
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

export function endInhale(this: FieldFoesContext, r: Roamer, now: number): void {
  const ih = r.enemy.field?.inhale;
  r.inhaleAt = null;
  r.nextInhaleAt = now + (ih?.cooldownMs ?? 3000);
  r.sprite.setScale(baseScale(r.sprite));
  r.sprite.clearTint();
}

export function chokeEater(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function updateSwarm(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function scatterSwarm(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function updateHound(this: FieldFoesContext, r: Roamer, now: number): boolean {
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

export function houndRunning(this: FieldFoesContext, r: Roamer, now: number): boolean {
  const hd = r.enemy.field?.hound;
  return !!hd && !houndSolid(now, r.glowOffset, hd.runMs, hd.pauseMs);
}

export function updateChains(this: FieldFoesContext, r: Roamer, now: number): boolean {
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
