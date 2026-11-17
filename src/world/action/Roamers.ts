import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import { type GameSession } from '../../state/GameSession';
import {
  chantState,
  distance,
  newBrain,
  nextStep,
  sniperOutcome,
  type ActionTuning,
  type Point,
} from '../../systems/action/ActionRules';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import type { Translate } from '../../ui/Strings';
import { wraithSolid } from '../Chapter8Rules';
import { conditionHolds, tileCenter } from '../MapRegistry';
import type { MapRoamerDefinition } from '../MapTypes';
import { ActionHost, Roamer } from './ActionTypes';
import { baseScale, enlargeActor } from '../ActorScale';
export interface RoamersContext {
  defs: MapRoamerDefinition[];
  roamers: Roamer[];
  isVisible: (def: MapRoamerDefinition) => boolean;
  spawn: (def: MapRoamerDefinition) => void;
  announceHunters: () => void;
  fadeOut: (r: Roamer) => void;
  elder: Phaser.Physics.Arcade.Sprite | null;
  elderActive: boolean;
  spawnElder: () => void;
  scene: Phaser.Scene;
  flag: (f: string) => boolean;
  session: GameSession;
  huntedAnnounced: boolean;
  host: ActionHost;
  group: Phaser.Physics.Arcade.Group;
  tuning: ActionTuning;
  rng: () => number;
  walls: Phaser.Tilemaps.TilemapLayer;
  player: Player;
  floatText: (x: number, y: number, text: string, color: string) => void;
  spawnClone: (src: Roamer, k: number) => void;
  defeatRoamer: (r: Roamer) => void;
  carrierNear: (r: Roamer) => boolean;
  finalDefeat: (r: Roamer) => void;
  t: Translate;
  faceX: (r: Roamer, dx: number) => void;
  aimLines: Phaser.GameObjects.Graphics;
  lineBlocked: (a: Point, b: Point) => boolean;
  lastDashAt: number;
  sound: SoundSystem;
  hitPlayer: (r: Roamer, opts?: { mult?: number; stunMs?: number }) => void;
  isSolid: (r: Roamer, now: number) => boolean;
}

export function syncSpawns(this: RoamersContext): void {
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

export function fadeOut(this: RoamersContext, r: Roamer): void {
  r.alive = false;
  r.sprite.setVelocity(0, 0);
  this.scene.tweens.add({
    targets: r.sprite,
    alpha: 0,
    duration: 600,
    onComplete: () => r.sprite.destroy(),
  });
}

export function isVisible(this: RoamersContext, def: MapRoamerDefinition): boolean {
  if (!conditionHolds(def.visibleWhen, this.flag)) return false;
  return !def.duringQuest || this.session.quests.getQuestStage(def.duringQuest) === 'started';
}

export function announceHunters(this: RoamersContext): void {
  if (this.huntedAnnounced) return;
  this.huntedAnnounced = true;
  this.scene.time.delayedCall(900, () => this.host.onHunted?.());
}

export function spawn(this: RoamersContext, def: MapRoamerDefinition): void {
  if (!this.isVisible(def)) return;
  if (def.respawn === false && def.defeatedFlag && this.flag(def.defeatedFlag)) return;
  const enemy = this.session.getEnemyDefinition(def.enemyId);
  if (!enemy) return;
  const pos = tileCenter(def.tile);
  const sprite = this.group.create(pos.x, pos.y, def.texture) as Phaser.Physics.Arcade.Sprite;
  if (def.anim && this.scene.anims.exists(def.anim)) sprite.play(def.anim);
  sprite.body?.setSize(18, 18);
  enlargeActor(sprite);
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

export function spawnClone(this: RoamersContext, src: Roamer, k: number): void {
  const angle = (k / 2) * Math.PI * 2 + Math.PI / 2;
  const x = src.sprite.x + Math.cos(angle) * 28;
  const y = src.sprite.y + Math.sin(angle) * 28;
  const sprite = this.group.create(x, y, src.def.texture) as Phaser.Physics.Arcade.Sprite;
  if (src.def.anim && this.scene.anims.exists(src.def.anim)) sprite.play(src.def.anim);
  sprite.body?.setSize(18, 18);
  enlargeActor(sprite);
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

export function faceX(this: RoamersContext, r: Roamer, dx: number): void {
  const left = dx < 0;
  r.sprite.setFlipX(r.enemy.field?.facesLeft ? !left : left);
  r.facing = left ? Math.PI : 0;
}

export function routeTo(this: RoamersContext, r: Roamer, target: Point, now: number): Point {
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

export function damageRoamer(
  this: RoamersContext,
  r: Roamer,
  damage: number,
  critical: boolean,
): void {
  const now = this.scene.time.now;
  const away = Math.atan2(r.sprite.y - this.player.y, r.sprite.x - this.player.x);
  r.sprite.setVelocity(
    Math.cos(away) * this.tuning.knockback,
    Math.sin(away) * this.tuning.knockback,
  );
  r.stunUntil = now + 140;
  r.flinchUntil = now + 120;
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

export function animateRoamers(this: RoamersContext, now: number): void {
  const windup = this.tuning.enemy.windupMs;
  for (const r of this.roamers) {
    if (!r.alive || r.pending || r.inhaleAt || now < (r.shiftedUntil ?? 0)) continue;
    let sx = 1;
    let sy = 1 + 0.03 * Math.sin(now / 340 + r.glowOffset);
    if (r.brain.state === 'windup') {
      const k = 1 - Math.min(1, Math.max(0, r.brain.timer) / windup);
      sx = 1 + 0.12 * k;
      sy = 1 - 0.12 * k;
    } else if (r.charge?.phase === 'run') {
      sx = 1.14;
      sy = 0.9;
    } else if (r.charge?.phase === 'stomp') {
      sx = 1.1;
      sy = 0.9;
    } else if (r.brain.state === 'recover') {
      sy *= 0.97;
    }
    if (now < (r.flinchUntil ?? 0)) {
      sx *= 0.88;
      sy *= 0.88;
    }
    const base = baseScale(r.sprite);
    r.sprite.setScale(sx * base, sy * base);
  }
}

export function defeatRoamer(this: RoamersContext, r: Roamer): void {
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

export function finalDefeat(this: RoamersContext, r: Roamer): void {
  r.pending = false;
  for (const o of r.orbs ?? []) {
    this.scene.tweens.add({ targets: o, alpha: 0, duration: 380, onComplete: () => o.destroy() });
  }
  if (this.scene.anims.exists('hit_spark_burst')) {
    this.scene.add.sprite(r.sprite.x, r.sprite.y, 'hit_spark').setDepth(45).play('hit_spark_burst');
  }
  this.scene.tweens.add({
    targets: r.sprite,
    alpha: 0,
    scale: 0.4 * baseScale(r.sprite),
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

export function dismissAmbushers(this: RoamersContext): void {
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

export function updateSniper(this: RoamersContext, r: Roamer, now: number): void {
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

export function isSolid(this: RoamersContext, r: Roamer, now: number): boolean {
  const ph = r.enemy.field?.phase;
  if (!ph) return true;
  const pa = r.def.phaseAnchor;
  const anchored = pa
    ? this.flag(pa.ownFlag)
      ? 'own'
      : this.flag(pa.otherFlag)
        ? 'other'
        : null
    : null;
  return wraithSolid(anchored, now, r.glowOffset, ph.everyMs, ph.solidMs);
}

export function updatePhase(this: RoamersContext, r: Roamer, now: number): void {
  r.sprite.setAlpha(this.isSolid(r, now) ? 1 : 0.3);
}

export function updateCocoon(this: RoamersContext, r: Roamer, now: number): void {
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

export function updateCharge(this: RoamersContext, r: Roamer, now: number): boolean {
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

export function updateChants(this: RoamersContext, now: number): void {
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
      o.sprite.setAlpha(1).setScale(baseScale(o.sprite));
      this.floatText(o.sprite.x, o.sprite.y - 18, this.t('action.risen'), '#ff8080');
    }
  }
}

export function carrierNear(this: RoamersContext, r: Roamer): boolean {
  return this.roamers.some((o) => {
    const chant = o.enemy.field?.chant;
    return !!chant && o.alive && o !== r && distance(o.sprite, r.sprite) <= chant.radius;
  });
}
