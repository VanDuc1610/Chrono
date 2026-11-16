import Phaser from 'phaser';
import type { RangedProfile } from '../inventory/InventoryTypes';
import { segmentHits, shotAngles } from './WeaponRules';

type Pt = { x: number; y: number };

/** Something a shot can hit. `hit` returns false when the shot should fly on (e.g. a ghost). */
export interface ShotTarget {
  x: number;
  y: number;
  radius: number;
  hit(shot: { angle: number; from: Pt }): boolean;
}

interface Shot {
  obj: Phaser.GameObjects.Shape;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  left: number;
  pierce: number;
  done: Set<ShotTarget>;
}

const COLORS: Record<string, number> = {
  sling: 0xd9a066,
  crossbow: 0xcfe8ff,
  repeater: 0xffe08a,
  flintlock: 0xff9a5a,
  bow: 0xbfe9ff,
};

/**
 * Peter's projectiles (ranged weapons, T-84). Drawn as small glowing shapes (an effect, not a
 * character asset). The owner calls `update` each frame with the current targets and solid test.
 */
export class ShotSystem {
  private shots: Shot[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  public fire(from: Pt, aim: number, profile: RangedProfile): void {
    const color = COLORS[profile.class] ?? 0xffffff;
    for (const angle of shotAngles(aim, profile)) {
      const long = profile.class === 'crossbow' || profile.class === 'bow';
      const obj = long
        ? this.scene.add.rectangle(from.x, from.y, 10, 2, color)
        : this.scene.add.circle(from.x, from.y, profile.class === 'flintlock' ? 3 : 2.5, color);
      obj.setDepth(44).setRotation(angle);
      obj.setStrokeStyle(1, 0xffffff, 0.5);
      this.shots.push({
        obj,
        x: from.x,
        y: from.y,
        vx: Math.cos(angle) * profile.speed,
        vy: Math.sin(angle) * profile.speed,
        angle,
        left: profile.range,
        pierce: profile.pierce ?? 0,
        done: new Set(),
      });
    }
  }

  /** Moves the shots; `solid(x, y)` stops them on walls. */
  public update(
    deltaMs: number,
    targets: ShotTarget[],
    solid: (x: number, y: number) => boolean,
  ): void {
    const dt = deltaMs / 1000;
    for (const s of this.shots) {
      const from = { x: s.x, y: s.y };
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.left -= Math.hypot(s.vx, s.vy) * dt;
      s.obj.setPosition(s.x, s.y);
      if (s.left <= 0 || solid(s.x, s.y)) {
        s.left = 0;
        continue;
      }
      for (const t of targets) {
        if (s.done.has(t) || !segmentHits(from, s, t, t.radius)) continue;
        if (!t.hit({ angle: s.angle, from })) continue;
        s.done.add(t);
        this.spark(s.x, s.y);
        if (s.pierce-- <= 0) {
          s.left = 0;
          break;
        }
      }
    }
    this.shots = this.shots.filter((s) => {
      if (s.left > 0) return true;
      s.obj.destroy();
      return false;
    });
  }

  private spark(x: number, y: number): void {
    const c = this.scene.add.circle(x, y, 3, 0xffffff, 0.9).setDepth(45);
    this.scene.tweens.add({
      targets: c,
      radius: 8,
      alpha: 0,
      duration: 160,
      onComplete: () => c.destroy(),
    });
  }

  public destroy(): void {
    for (const s of this.shots) s.obj.destroy();
    this.shots = [];
  }
}
