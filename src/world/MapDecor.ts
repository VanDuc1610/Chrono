import Phaser from 'phaser';
import type { PixelFxLayer } from '../systems/fx/PixelFxLayer';

/** Living details of a map (atmosphere.json `decor`), all optional. */
export interface DecorDef {
  /** pixelfx creatures: birds and bats cross the view, butterflies and wisps wander in it. */
  critters?: { kind: 'bird' | 'bat' | 'butterfly' | 'wisp'; count: number }[];
  /** Water drips falling here and there (caves, crypts). */
  drips?: boolean;
  /** Things drifting down the screen, drawn in code. */
  fall?: { kind: 'leaf' | 'petal' | 'snow'; count: number };
}

type Pt = { x: number; y: number };
const CROSSERS = new Set(['bird', 'bat']);

/** Fall textures drawn once in code: a tiny leaf, a petal, a snowflake. */
const FALL_TEX: Record<string, { key: string; colors: number[] }> = {
  leaf: { key: 'fx_decor_leaf', colors: [0xc8702a, 0xe0a040, 0x8aa040, 0xb04828] },
  petal: { key: 'fx_decor_petal', colors: [0xffc8d8, 0xffe0ea, 0xf8a8c0] },
  snow: { key: 'fx_decor_snow', colors: [0xffffff, 0xe8f4ff] },
};

/**
 * Map decor (T-85, owner request): pixelfx creatures (MIT, vendored) moving through the view and
 * code-drawn falling leaves / petals / snow. Everything is spawned around the camera, so it costs
 * the same on any map size. L (the atmosphere toggle) hides it too.
 */
export class MapDecor {
  private fall: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private readonly timers: Phaser.Time.TimerEvent[] = [];
  /** Creatures and drips on screen now, stopped at once when the decor is switched off. */
  private live: { stop(): void }[] = [];
  private on = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly def: DecorDef | undefined,
    private readonly pfx: () => PixelFxLayer,
    private readonly rng: () => number = Math.random,
  ) {
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stop());
  }

  public get hasAny(): boolean {
    const d = this.def;
    return !!d && (!!d.critters?.length || !!d.drips || !!d.fall);
  }

  public start(): void {
    const d = this.def;
    if (!d || this.on) return;
    this.on = true;
    for (const c of d.critters ?? [])
      for (let i = 0; i < c.count; i++)
        this.later(500 + this.rng() * 4000, () => this.spawnCritter(c.kind));
    if (d.drips) this.later(800, () => this.drip());
    if (d.fall) this.startFall(d.fall);
  }

  public stop(): void {
    if (!this.on) return;
    this.on = false;
    for (const t of this.timers) t.remove();
    this.timers.length = 0;
    this.fall?.destroy();
    this.fall = null;
    for (const fx of this.live) fx.stop();
    this.live = [];
  }

  private later(ms: number, fn: () => void): void {
    const t = this.scene.time.delayedCall(ms, () => {
      this.timers.splice(this.timers.indexOf(t), 1);
      if (this.on) fn();
    });
    this.timers.push(t);
  }

  private track(fx: { stop(): void }): void {
    this.live.push(fx);
    if (this.live.length > 24) this.live.shift();
  }

  /**
   * Creatures keep to a band near the top (just under the HUD panels) or the bottom (just above the
   * controls line), never across the middle where Peter plays (owner request).
   */
  private edgeBand(v: Phaser.Geom.Rectangle): number {
    return this.rng() < 0.5 ? v.y + 88 + this.rng() * 24 : v.bottom - 70 - this.rng() * 24;
  }

  private get view(): Phaser.Geom.Rectangle {
    return this.scene.cameras.main.worldView;
  }

  /** A creature: crossers fly over the view; wanderers loop around a spot. Then another comes. */
  private spawnCritter(kind: 'bird' | 'bat' | 'butterfly' | 'wisp'): void {
    const v = this.view;
    const now = this.scene.time.now;
    if (CROSSERS.has(kind)) {
      const ltr = this.rng() < 0.5;
      const speed = kind === 'bat' ? 115 : 72;
      const y0 = this.edgeBand(v);
      const x0 = ltr ? v.x - 60 : v.right + 60;
      const ms = ((v.width + 120) / speed) * 1000;
      const at = (): Pt => {
        const t = (this.scene.time.now - now) / 1000;
        return {
          x: x0 + (ltr ? 1 : -1) * speed * t,
          y: y0 + Math.sin(t * 2.2) * 8,
        };
      };
      // The sprites face right: a right-to-left flight is mirrored.
      this.track(this.pfx().play(kind, at, { flip: !ltr, seed: Math.floor(this.rng() * 999) }, ms));
      this.later(ms + 6000 + this.rng() * 12000, () => this.spawnCritter(kind));
      return;
    }
    const base = { x: v.x + 60 + this.rng() * (v.width - 120), y: this.edgeBand(v) };
    // Drift sideways only, so a wanderer stays in its band.
    const drift = { x: (this.rng() - 0.5) * 40, y: 0 };
    const ms = kind === 'wisp' ? 11000 : 8000;
    const at = (): Pt => {
      const t = (this.scene.time.now - now) / 1000;
      return {
        x: base.x + drift.x * t * 0.3 + Math.sin(t * 0.9) * 26,
        y: base.y + Math.cos(t * 1.3) * 8,
      };
    };
    this.track(this.pfx().play(kind, at, { seed: Math.floor(this.rng() * 999) }, ms));
    this.later(ms + 1500 + this.rng() * 4000, () => this.spawnCritter(kind));
  }

  /** A drip somewhere in view, then the next one a few seconds later. */
  private drip(): void {
    const v = this.view;
    const at = {
      x: v.x + 40 + this.rng() * (v.width - 80),
      y: v.y + 60 + this.rng() * (v.height - 120),
    };
    this.track(this.pfx().play('drip', at, { seed: Math.floor(this.rng() * 999) }, 1600));
    this.later(2200 + this.rng() * 2800, () => this.drip());
  }

  private startFall(f: NonNullable<DecorDef['fall']>): void {
    const s = this.scene;
    const tex = FALL_TEX[f.kind];
    if (!s.textures.exists(tex.key)) {
      const g = s.make.graphics({}, false);
      g.fillStyle(0xffffff, 1);
      if (f.kind === 'snow') g.fillCircle(2, 2, 1.5);
      else if (f.kind === 'petal') g.fillEllipse(2.5, 1.5, 5, 3);
      else
        g.fillPoints(
          [
            new Phaser.Math.Vector2(0, 2),
            new Phaser.Math.Vector2(3, 0),
            new Phaser.Math.Vector2(6, 2),
            new Phaser.Math.Vector2(3, 4),
          ],
          true,
        );
      g.generateTexture(tex.key, 6, 5);
      g.destroy();
    }
    const { width, height } = s.scale;
    const snow = f.kind === 'snow';
    this.fall = s.add
      .particles(0, 0, tex.key, {
        x: { min: -20, max: width + 20 },
        y: -10,
        lifespan: { min: 7000, max: 11000 },
        speedY: snow ? { min: 14, max: 26 } : { min: 18, max: 34 },
        speedX: { min: -14, max: 10 },
        // A gentle side-to-side sway while falling.
        accelerationX: { min: -6, max: 6 },
        rotate: snow ? 0 : { start: 0, end: 360 },
        scale: { min: 0.7, max: 1.2 },
        alpha: {
          onUpdate: (_p: unknown, _k: string, t: number) =>
            Math.min(1, t * 6) * (1 - t) * 0.95 + 0.05,
        },
        tint: tex.colors,
        frequency: Math.max(60, Math.round(9000 / f.count)),
      })
      .setScrollFactor(0)
      .setDepth(58);
    void height;
  }
}
