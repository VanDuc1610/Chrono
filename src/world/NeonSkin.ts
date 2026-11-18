import Phaser from 'phaser';
import { TILE_SIZE, tileCenter } from './MapRegistry';
import type { TilePoint, TileRect } from './MapTypes';

/**
 * One map's neon accents (public/assets/data/neon.json, written by scripts/neon.mjs). Since every
 * chapter is drawn in LPC art (owner, 2026-11-18) the skin keeps the art as drawn and adds only
 * accents: turning rings on points of interest, glowing frames on exits and puzzle pieces. (The
 * full line-art void of T-86 was retired then.)
 */
export interface NeonDef {
  /** Accent colour: points of interest, exits, puzzle pieces. */
  accent: string;
}

interface NeonDatabase {
  maps: Record<string, NeonDef>;
}

/** What the skin needs from the map; nothing in it is changed. */
export interface NeonMap {
  id: string;
  walls: Phaser.Tilemaps.TilemapLayer;
  /** Floor tiles a puzzle swaps: they carry their own art, so they get no extra clock face. */
  reveal: TilePoint[];
  pois: TilePoint[];
  /** Puzzle pieces (dials, mirrors, pillars…): framed in the accent colour. */
  marks: TilePoint[];
  exits: TileRect[];
}

/** Registry key: the player switched the accents off (N). */
export const NEON_OFF = 'neonOff';

const RING = 'fx_neon_ring';
const MEDALLION = 'fx_neon_medallion';
/** Above the tile layers, under the actors. */
const DEPTH = 1.6;

const hex = (c: string): number => Phaser.Display.Color.HexStringToColor(c).color;
/** Mixes a colour toward another (t = 0 keeps a, 1 gives b). */
const mix = (a: number, b: number, t: number): number => {
  const ch = (shift: number): number =>
    Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift;
  return ch(16) | ch(8) | ch(0);
};

/**
 * Neon accents, all in code: frames are drawn once into a render texture, only the rings move.
 * Gameplay, collision and map data are untouched. N toggles them.
 */
export class NeonSkin {
  private readonly def: NeonDef | null;
  private on = false;
  private glow: Phaser.GameObjects.RenderTexture | null = null;
  private props: Phaser.GameObjects.Image[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly map: NeonMap,
  ) {
    const db = scene.cache.json.get('data_neon') as NeonDatabase | undefined;
    this.def = db?.maps[map.id] ?? null;
    if (!this.def) return;
    NeonSkin.makeTextures(scene);
    if (!scene.registry.get(NEON_OFF)) this.enable();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disable());
  }

  public get active(): boolean {
    return this.on;
  }

  /** N: switch the accents on or off (remembered for the session). */
  public toggle(): boolean {
    if (!this.def) return false;
    if (this.on) this.disable();
    else this.enable();
    this.scene.registry.set(NEON_OFF, !this.on);
    return true;
  }

  /** Tiles were swapped (a dial turned, a door opened): redraw the marks. */
  public refresh(): void {
    if (!this.on) return;
    this.disable();
    this.enable();
  }

  private enable(): void {
    const d = this.def;
    if (!d || this.on) return;
    this.on = true;
    const { walls } = this.map;
    const accent = hex(d.accent);
    this.glow = this.scene.add
      .renderTexture(0, 0, walls.layer.width * TILE_SIZE, walls.layer.height * TILE_SIZE)
      .setOrigin(0)
      .setDepth(DEPTH)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.paintFrames(accent);
    for (const t of this.map.pois) this.addRing(t, accent);
    this.markPuzzles(accent);
  }

  private disable(): void {
    if (!this.on) return;
    this.on = false;
    this.glow?.destroy();
    this.glow = null;
    for (const p of this.props) {
      this.scene.tweens.killTweensOf(p);
      p.destroy();
    }
    this.props = [];
  }

  /** Exits and puzzle pieces framed in passes (wide and faint to thin and bright): no shader. */
  private paintFrames(accent: number): void {
    const glow = this.glow;
    if (!glow) return;
    const T = TILE_SIZE;
    const g = this.scene.make.graphics({}, false);
    const box = (x: number, y: number, bw: number, bh: number, inset: number): void => {
      for (const [width, alpha] of [
        [5, 0.12],
        [3, 0.3],
        [1, 1],
      ] as const) {
        g.lineStyle(width, width === 1 ? mix(accent, 0xffffff, 0.4) : accent, alpha);
        g.strokeRect(x + inset, y + inset, bw - inset * 2, bh - inset * 2);
      }
    };
    for (const r of this.map.exits) box(r.x * T, r.y * T, r.w * T, r.h * T, 3);
    for (const t of this.map.marks) box(t.x * T, t.y * T, T, T, 2);
    glow.draw(g);
    g.destroy();
  }

  /** Puzzle spots with nothing drawn on them (dials are only a prompt) get a small clock face. */
  private markPuzzles(accent: number): void {
    const swapped = new Set(this.map.reveal.map((t) => `${t.x},${t.y}`));
    const seen = new Set<string>();
    for (const t of this.map.marks) {
      const k = `${t.x},${t.y}`;
      if (swapped.has(k) || seen.has(k)) continue;
      seen.add(k);
      if ((this.map.walls.getTileAt(t.x, t.y)?.index ?? -1) >= 0) continue;
      const c = tileCenter(t);
      const img = this.scene.add
        .image(c.x, c.y, MEDALLION)
        .setTint(accent)
        .setAlpha(0.7)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH + 0.1);
      this.props.push(img);
    }
  }

  /** A turning, breathing ring under each point of interest. */
  private addRing(t: TilePoint, accent: number): void {
    const c = tileCenter(t);
    const img = this.scene.add
      .image(c.x, c.y, RING)
      .setTint(accent)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH + 0.1);
    this.scene.tweens.add({ targets: img, angle: 360, duration: 6000, repeat: -1 });
    this.scene.tweens.add({
      targets: img,
      alpha: 0.45,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.props.push(img);
  }

  /** The ring and the small clock face, drawn once in white (tinted per map). */
  private static makeTextures(s: Phaser.Scene): void {
    const make = (key: string, size: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
      if (s.textures.exists(key)) return;
      const g = s.make.graphics({}, false);
      draw(g);
      g.generateTexture(key, size, size);
      g.destroy();
    };
    make(RING, 32, (g) => {
      g.lineStyle(1, 0xffffff, 1);
      g.strokeCircle(16, 16, 13);
      g.strokePoints(
        [
          { x: 16, y: 6 },
          { x: 26, y: 16 },
          { x: 16, y: 26 },
          { x: 6, y: 16 },
        ],
        true,
      );
      g.lineStyle(1, 0xffffff, 0.4);
      g.strokeCircle(16, 16, 15);
    });
    make(MEDALLION, 32, (g) => {
      const c = 16;
      const R = 11;
      g.lineStyle(1, 0xffffff, 1);
      g.strokeCircle(c, c, R);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r0 = R * (i % 3 === 0 ? 0.7 : 0.85);
        g.lineBetween(
          c + Math.cos(a) * r0,
          c + Math.sin(a) * r0,
          c + Math.cos(a) * R,
          c + Math.sin(a) * R,
        );
      }
      g.lineStyle(2, 0xffffff, 1);
      g.lineBetween(c, c, c, c - R * 0.55);
      g.lineBetween(c, c, c + R * 0.3, c + R * 0.15);
    });
  }
}
