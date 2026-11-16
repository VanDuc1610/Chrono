import Phaser from 'phaser';
import { tileCenter } from './MapRegistry';
import type { TilePoint } from './MapTypes';

/** One map's look (public/assets/data/atmosphere.json). Every field may be left out. */
export interface AtmosphereDef {
  /** Darkness laid over the map: its colour and how dark (0 = none, 1 = black). */
  shade?: { color: string; alpha: number };
  /** Peter's own soft light. */
  peterLight?: LightDef;
  /** Fixed lights; `flicker` makes them breathe like a flame or a crystal. */
  lights?: (LightDef & { tile: TilePoint; flicker?: boolean })[];
  /** Every point of interest on the map gets this light. */
  poiLight?: LightDef;
  /** Darkened screen edges (0-1). */
  vignette?: number;
  /** Floating motes (dust, sea spray, embers). */
  motes?: { color: string; count: number; drift: number; up?: boolean };
}

interface LightDef {
  color: string;
  /** Radius in px. */
  radius: number;
  /** How much darkness it lifts (0-1). */
  intensity: number;
  /** Strength of its coloured glow (0 = none). */
  glow?: number;
}

interface AtmosphereDatabase {
  maps: Record<string, AtmosphereDef>;
}

interface Lit {
  def: LightDef;
  at: () => { x: number; y: number };
  glow: Phaser.GameObjects.Image | null;
  /** 0.65-1 while flickering. */
  pulse: number;
}

const SOFT = 'fx_atmo_soft';
const MOTE = 'fx_atmo_mote';
const VIGNETTE = 'fx_atmo_vignette';
/** Registry key: the player switched the effects off (L). */
export const ATMOSPHERE_OFF = 'atmosphereOff';

const hex = (c: string): number => Phaser.Display.Color.HexStringToColor(c).color;

/**
 * Map atmosphere (owner request, free Phaser features only, all drawn in code): a darkness layer
 * over the map with soft holes at Peter and the lights, coloured glows, a vignette and floating
 * motes. The HUD stays above it, untouched. L toggles it.
 */
export class Atmosphere {
  private readonly def: AtmosphereDef | null;
  private dark: Phaser.GameObjects.RenderTexture | null = null;
  private brush: Phaser.GameObjects.Image | null = null;
  private vignette: Phaser.GameObjects.Image | null = null;
  private motes: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private lit: Lit[] = [];
  private on = false;

  constructor(
    private readonly scene: Phaser.Scene,
    mapId: string,
    private readonly peter: Phaser.GameObjects.Sprite,
    private readonly pois: TilePoint[],
  ) {
    const db = scene.cache.json.get('data_atmosphere') as AtmosphereDatabase | undefined;
    this.def = db?.maps[mapId] ?? null;
    if (!this.def) return;
    Atmosphere.makeTextures(scene);
    if (!scene.registry.get(ATMOSPHERE_OFF)) this.enable();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disable());
  }

  public get active(): boolean {
    return this.on;
  }

  /** L: switch the effects on or off (remembered for the session). */
  public toggle(): boolean {
    if (!this.def) return false;
    if (this.on) this.disable();
    else this.enable();
    this.scene.registry.set(ATMOSPHERE_OFF, !this.on);
    return true;
  }

  /** Redraws the darkness with its holes; the glows follow their lights. */
  public update(): void {
    if (!this.on || !this.dark || !this.brush || !this.def) return;
    const cam = this.scene.cameras.main;
    const shade = this.def.shade ?? { color: '#000010', alpha: 0.5 };
    this.dark.clear();
    this.dark.fill(hex(shade.color), shade.alpha);
    for (const l of this.lit) {
      const p = l.at();
      const r = l.def.radius * (0.9 + 0.1 * l.pulse);
      // The brush is a soft disc 128 px wide: scale it to the light, erase that much darkness.
      this.brush.setScale((r * 2) / 128).setAlpha(Math.min(1, l.def.intensity * l.pulse));
      this.dark.erase(this.brush, p.x - cam.worldView.x, p.y - cam.worldView.y);
      if (l.glow) l.glow.setPosition(p.x, p.y).setAlpha((l.def.glow ?? 0.35) * l.pulse);
    }
  }

  private enable(): void {
    const d = this.def;
    if (!d || this.on) return;
    this.on = true;
    const s = this.scene;
    const { width, height } = s.scale;
    this.dark = s.add
      .renderTexture(0, 0, width, height)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(60);
    this.brush = s.make.image({ key: SOFT, add: false });
    if (d.vignette)
      this.vignette = s.add
        .image(width / 2, height / 2, VIGNETTE)
        .setDisplaySize(width, height)
        .setScrollFactor(0)
        .setDepth(61)
        .setAlpha(d.vignette);
    const add = (def: LightDef, at: Lit['at'], flicker = false): void => {
      const glow =
        def.glow === 0
          ? null
          : s.add
              .image(0, 0, SOFT)
              .setScale((def.radius * 1.2) / 128)
              .setTint(hex(def.color))
              .setBlendMode(Phaser.BlendModes.ADD)
              .setDepth(59);
      const l: Lit = { def, at, glow, pulse: 1 };
      this.lit.push(l);
      if (flicker)
        s.tweens.add({
          targets: l,
          pulse: 0.65,
          duration: 800 + Math.random() * 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
    };
    if (d.peterLight) add(d.peterLight, () => ({ x: this.peter.x, y: this.peter.y }));
    for (const l of d.lights ?? []) {
      const c = tileCenter(l.tile);
      add(l, () => c, l.flicker);
    }
    if (d.poiLight)
      for (const t of this.pois) {
        const c = tileCenter(t);
        add(d.poiLight, () => c, true);
      }
    if (d.motes) this.spawnMotes(d.motes);
    this.update();
  }

  private disable(): void {
    if (!this.on) return;
    this.on = false;
    for (const l of this.lit) {
      this.scene.tweens.killTweensOf(l);
      l.glow?.destroy();
    }
    this.lit = [];
    this.dark?.destroy();
    this.brush?.destroy();
    this.vignette?.destroy();
    this.motes?.destroy();
    this.dark = null;
    this.brush = null;
    this.vignette = null;
    this.motes = null;
  }

  /** Soft disc, vignette and mote textures, drawn once with canvas gradients. */
  private static makeTextures(s: Phaser.Scene): void {
    const radial = (key: string, size: number, stops: [number, string][]): void => {
      if (s.textures.exists(key)) return;
      const tex = s.textures.createCanvas(key, size, size);
      if (!tex) return;
      const ctx = tex.getContext();
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (const [at, color] of stops) g.addColorStop(at, color);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      tex.refresh();
    };
    radial(SOFT, 128, [
      [0, 'rgba(255,255,255,1)'],
      [0.45, 'rgba(255,255,255,0.75)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    radial(VIGNETTE, 256, [
      [0, 'rgba(0,0,0,0)'],
      [0.62, 'rgba(0,0,0,0)'],
      [1, 'rgba(0,0,0,1)'],
    ]);
    radial(MOTE, 8, [
      [0, 'rgba(255,255,255,1)'],
      [0.4, 'rgba(255,255,255,0.6)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
  }

  /** Motes drifting across the view. */
  private spawnMotes(m: NonNullable<AtmosphereDef['motes']>): void {
    const { width, height } = this.scene.scale;
    this.motes = this.scene.add
      .particles(0, 0, MOTE, {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
        lifespan: { min: 4000, max: 8000 },
        speedX: { min: -m.drift, max: m.drift },
        speedY: m.up
          ? { min: -m.drift * 1.5, max: -m.drift * 0.3 }
          : { min: -m.drift * 0.5, max: m.drift * 0.5 },
        scale: { min: 0.4, max: 1 },
        // Fade in, then out, over each mote's life.
        alpha: { onUpdate: (_p: unknown, _k: string, t: number) => Math.sin(t * Math.PI) * 0.8 },
        tint: hex(m.color),
        frequency: Math.max(30, Math.round(6000 / m.count)),
        blendMode: Phaser.BlendModes.ADD,
      })
      .setScrollFactor(0)
      .setDepth(62);
  }
}
