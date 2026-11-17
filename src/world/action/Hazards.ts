import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import { type GameSession } from '../../state/GameSession';
import { distance, inSlash, type ActionTuning, type Point } from '../../systems/action/ActionRules';
import type { Translate } from '../../ui/Strings';
import { tileCenter } from '../MapRegistry';
import type { MapStrikeTarget, TilePoint } from '../MapTypes';
import { Roamer } from './ActionTypes';
export interface HazardsContext {
  roamers: Roamer[];
  scene: Phaser.Scene;
  pools: {
    x: number;
    y: number;
    r: number;
    until: number;
    slow: number;
    mp: number;
    g: Phaser.GameObjects.Arc;
  }[];
  player: Player;
  session: GameSession;
  slowUntil: number;
  slowPct: number;
  baseSpeed: number | null;
  strikes: { def: MapStrikeTarget; lastHit: number }[];
  onStrikeGroup: ((def: MapStrikeTarget) => void) | null;
  flag: (f: string) => boolean;
  tuning: ActionTuning;
  floatText: (x: number, y: number, text: string, color: string) => void;
  t: Translate;
  lightKeys: Set<string>;
  walls: Phaser.Tilemaps.TilemapLayer;
}

export function updatePools(this: HazardsContext, now: number, delta: number): void {
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

export function setStrikeTargets(
  this: HazardsContext,
  defs: MapStrikeTarget[],
  onGroup: (def: MapStrikeTarget) => void,
): void {
  this.strikes = defs.map((def) => ({ def, lastHit: -Infinity }));
  this.onStrikeGroup = onGroup;
}

export function strikeTargets(
  this: HazardsContext,
  origin: Point,
  aim: number,
  reach: number,
  now: number,
): void {
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

export function setLightTiles(this: HazardsContext, tiles: TilePoint[]): void {
  this.lightKeys = new Set(tiles.map((t) => `${t.x},${t.y}`));
  for (const t of tiles) {
    const c = tileCenter(t);
    const disc = this.scene.add.circle(c.x, c.y, 12, 0xfff2b0, 0.35).setDepth(1);
    disc.setStrokeStyle(2, 0xffe48a, 0.8);
    this.scene.tweens.add({ targets: disc, alpha: 0.6, yoyo: true, repeat: -1, duration: 900 });
  }
}

export function lineBlocked(this: HazardsContext, a: Point, b: Point): boolean {
  const n = Math.ceil(distance(a, b) / 8);
  for (let i = 1; i < n; i++) {
    const x = Math.floor((a.x + ((b.x - a.x) * i) / n) / 32);
    const y = Math.floor((a.y + ((b.y - a.y) * i) / n) / 32);
    if (this.walls.getTileAt(x, y)?.collides) return true;
  }
  return false;
}
