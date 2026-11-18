import Phaser from 'phaser';
import type { Point } from '../../systems/action/ActionRules';
import type { Authority } from '../../systems/action/AuthorityRules';
import type { Rarity } from '../../systems/inventory/GearRules';
import type { MeleeClass } from '../../systems/inventory/InventoryTypes';
import type { PixelFxLayer } from '../../systems/fx/PixelFxLayer';
import type { EffectKey } from '../../vendor/pixelfx/effects.js';

/** pixelfx palettes, dark to light, one per Authority (owner, 2026-11-18: animated skills). */
export const AUTHORITY_PALETTE: Record<Authority, string[]> = {
  continuum: ['#06182c', '#0f3a63', '#1f6fae', '#3aa6e0', '#7fd8ff', '#c8f2ff', '#ffffff'],
  causality: ['#2a1a04', '#5c3c08', '#a8740f', '#e0a826', '#ffd36b', '#fff0b0', '#ffffff'],
  memory: ['#140a24', '#2e1648', '#5b2a86', '#9a5ad0', '#d0a4ff', '#f0dcff', '#ffffff'],
  finality: ['#2a0a06', '#5e1a0c', '#a8361a', '#e8642a', '#ff9a4a', '#ffd88a', '#ffffff'],
  possibility: ['#05200f', '#0c4422', '#16803e', '#2ec46a', '#7af0a4', '#c8ffd8', '#ffffff'],
  origin: ['#2a2008', '#5c4810', '#a8881e', '#e8c84a', '#fff08a', '#fffbd8', '#ffffff'],
};

/** Weapon hit palettes by rarity: steel, sky, violet, gold. */
const RARITY_PALETTE: Record<Rarity, string[]> = {
  common: ['#1a1f2a', '#3a4458', '#6a7894', '#a4b2cc', '#d8e2f2', '#ffffff'],
  rare: ['#071a33', '#123a6e', '#1f68b8', '#4aa0f0', '#9ad2ff', '#e0f4ff', '#ffffff'],
  epic: ['#160a2a', '#34185c', '#5e2c9e', '#9a5ae0', '#d0a8ff', '#f2e4ff', '#ffffff'],
  legendary: ['#2a1606', '#5e340c', '#a8661a', '#f0a030', '#ffd070', '#fff2c0', '#ffffff'],
};

const hex = (c: string): number => Phaser.Display.Color.HexStringToColor(c).color;

/**
 * Combat animation (owner, 2026-11-18): a sweeping slash trail shaped by the weapon family and
 * coloured by its rarity, impact sparks on every blow, and pixelfx bursts for the Authority skills.
 * pixelfx effects come from the scene's shared layer (made on first use).
 */
export class CombatFx {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layer: () => PixelFxLayer | null,
  ) {}

  /** A pixelfx effect at a point (or following one), cut after `maxMs`. */
  public burst(
    key: EffectKey,
    at: Point | (() => Point),
    palette?: string[],
    maxMs?: number,
    extra: Record<string, unknown> = {},
  ): void {
    const opts = palette ? { ...extra, palette } : extra;
    this.layer()?.play(key, at, opts, maxMs);
  }

  public authority(a: Authority): string[] {
    return AUTHORITY_PALETTE[a];
  }

  public rarity(r: Rarity): string[] {
    return RARITY_PALETTE[r];
  }

  /** A weapon blow landing: a spark (a bigger burst on a critical) in the weapon's colours. */
  public impact(at: Point, critical: boolean, rarity: Rarity): void {
    const pal = RARITY_PALETTE[rarity];
    if (critical) this.burst('critHit', { x: at.x, y: at.y - 6 }, pal, 700);
    else this.burst('hitSpark', { x: at.x, y: at.y - 6 }, pal, 450);
  }

  /**
   * The slash trail: a crescent that sweeps across the arc in ~110 ms and fades, with a bright edge.
   * Spears thrust (a narrow lance), heavy weapons leave a thick arc and a dust ring.
   */
  public slash(
    origin: Point,
    aim: number,
    reach: number,
    arcDeg: number,
    cls: MeleeClass,
    rarity: Rarity,
  ): void {
    const pal = RARITY_PALETTE[rarity];
    const edge = hex(pal[pal.length - 2]);
    const body = hex(pal[3]);
    const g = this.scene.add.graphics().setDepth(42);
    const half = Phaser.Math.DegToRad(arcDeg / 2);
    const thick = cls === 'heavy' ? 14 : cls === 'rapier' ? 7 : 11;
    const state = { t: 0, fade: 1 };
    const draw = (): void => {
      g.clear();
      if (cls === 'spear') {
        // A thrust: the lance grows out along the aim.
        const len = reach * Math.min(1, state.t * 1.4);
        const nx = Math.cos(aim);
        const ny = Math.sin(aim);
        const px = -ny * 3;
        const py = nx * 3;
        const tip = { x: origin.x + nx * len, y: origin.y + ny * len };
        g.fillStyle(body, 0.55 * state.fade);
        g.fillTriangle(origin.x + px, origin.y + py, origin.x - px, origin.y - py, tip.x, tip.y);
        g.lineStyle(1.5, edge, 0.95 * state.fade).lineBetween(origin.x, origin.y, tip.x, tip.y);
        return;
      }
      // The swept part of the arc so far, as a crescent between two radii.
      const from = aim - half;
      const to = aim - half + 2 * half * Math.min(1, state.t);
      const tail = Math.max(from, to - 2 * half * 0.75);
      const outer = reach - 2;
      const inner = outer - thick;
      const steps = 10;
      const pts: Phaser.Types.Math.Vector2Like[] = [];
      for (let i = 0; i <= steps; i++) {
        const a = tail + ((to - tail) * i) / steps;
        // The crescent is thickest at its leading edge.
        const r = outer - (thick * (1 - i / steps)) / 2;
        pts.push({ x: origin.x + Math.cos(a) * r, y: origin.y + Math.sin(a) * r });
      }
      for (let i = steps; i >= 0; i--) {
        const a = tail + ((to - tail) * i) / steps;
        pts.push({ x: origin.x + Math.cos(a) * inner, y: origin.y + Math.sin(a) * inner });
      }
      g.fillStyle(body, 0.7 * state.fade).fillPoints(pts, true);
      g.lineStyle(2.5, edge, state.fade);
      g.beginPath();
      g.arc(origin.x, origin.y, outer, tail, to);
      g.strokePath();
    };
    this.scene.tweens.add({
      targets: state,
      t: 1,
      duration: 110,
      ease: 'Cubic.easeOut',
      onUpdate: draw,
      onComplete: () => {
        this.scene.tweens.add({
          targets: state,
          fade: 0,
          duration: 190,
          onUpdate: draw,
          onComplete: () => g.destroy(),
        });
      },
    });
    if (cls === 'heavy') {
      const at = {
        x: origin.x + Math.cos(aim) * reach * 0.7,
        y: origin.y + Math.sin(aim) * reach * 0.7,
      };
      const ring = this.scene.add
        .ellipse(at.x, at.y + 6, 8, 4)
        .setStrokeStyle(1, 0xc8b89a, 0.8)
        .setDepth(39);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 4,
        scaleY: 4,
        alpha: 0,
        duration: 320,
        onComplete: () => ring.destroy(),
      });
    }
  }

  /** A shot's trail end: a small spark where it struck. */
  public shotHit(at: Point, rarity: Rarity): void {
    this.burst('hitSpark', { x: at.x, y: at.y - 4 }, RARITY_PALETTE[rarity], 350, { height: 12 });
  }

  /** A few motes rising from a point (heals, lifesteal), drawn without pixelfx. */
  public motes(at: Point, color: string, count = 5): void {
    for (let i = 0; i < count; i++) {
      const m = this.scene.add
        .rectangle(
          at.x + Phaser.Math.Between(-8, 8),
          at.y + Phaser.Math.Between(-6, 4),
          2,
          2,
          hex(color),
        )
        .setDepth(43);
      this.scene.tweens.add({
        targets: m,
        y: m.y - Phaser.Math.Between(14, 24),
        alpha: 0,
        delay: i * 40,
        duration: 520,
        onComplete: () => m.destroy(),
      });
    }
  }
}
