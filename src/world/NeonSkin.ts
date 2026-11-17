import Phaser from 'phaser';
import { TILE_SIZE, tileCenter } from './MapRegistry';
import type { TilePoint, TileRect } from './MapTypes';
import {
  seededRng,
  solidBlocks,
  traceEdges,
  traceRegions,
  type NeonEdge,
  type NeonLine,
} from './NeonTrace';

/**
 * One map's neon look (public/assets/data/neon.json). `level` 1 turns the world into glowing line
 * art over a deep void; below 1 the tiles stay and only the glowing outlines are laid over them.
 */
export interface NeonDef {
  level: number;
  /** Outline colour (walls, edges, constellations). */
  line: string;
  /** Things to touch: points of interest, exits, puzzle pieces. */
  accent: string;
  /** The void behind everything (level 1 only). */
  void?: string;
  /** How much of the old ground still shows through the void (0-1, default 0.1). */
  ghost?: number;
}

interface NeonDatabase {
  maps: Record<string, NeonDef>;
}

/** What the skin needs from the map; none of it is changed except tile visibility. */
export interface NeonMap {
  id: string;
  ground: Phaser.Tilemaps.TilemapLayer;
  walls: Phaser.Tilemaps.TilemapLayer;
  solid: (x: number, y: number) => boolean;
  pois: TilePoint[];
  /** Floor tiles a puzzle swaps: the void is cut open there so their real tiles stay readable. */
  reveal: TilePoint[];
  /** Puzzle pieces (dials, mirrors, pillars…): framed in the accent colour. */
  marks: TilePoint[];
  exits: TileRect[];
  /** Peter and the people on the map: they keep their pixel art and get a soft rim of light. */
  actors: () => Phaser.GameObjects.Sprite[];
}

/** Registry key: the player switched the neon skin off (N). */
export const NEON_OFF = 'neonOff';

const RING = 'fx_neon_ring';
const MEDALLION = 'fx_neon_medallion';
const GEAR = 'fx_neon_gear';
const MAX_MEDALLIONS = 8;

const hex = (c: string): number => Phaser.Display.Color.HexStringToColor(c).color;
/** Mixes a colour toward another (t = 0 keeps a, 1 gives b). */
const mix = (a: number, b: number, t: number): number => {
  const ch = (shift: number): number =>
    Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift;
  return ch(16) | ch(8) | ch(0);
};

/**
 * Neon skin (owner preview, 2026-11-17): the world redrawn as glowing line art, all in code.
 * Walls are traced from the collision grid (NeonTrace), drawn once into render textures; only the
 * rings and medallions move. Gameplay, collision and map data are untouched. N toggles it.
 */
export class NeonSkin {
  private readonly def: NeonDef | null;
  private on = false;
  private base: Phaser.GameObjects.RenderTexture | null = null;
  private glow: Phaser.GameObjects.RenderTexture | null = null;
  private props: Phaser.GameObjects.Image[] = [];
  private hidden: Phaser.Tilemaps.Tile[] = [];
  private rims: { sprite: Phaser.GameObjects.Sprite; fx: Phaser.FX.Glow }[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly map: NeonMap,
    /** Told when the skin turns on or off (the scene dims its own darkness under a full skin). */
    private readonly onChange?: (fullyOn: boolean) => void,
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

  /** N: switch the skin on or off (remembered for the session). */
  public toggle(): boolean {
    if (!this.def) return false;
    if (this.on) this.disable();
    else this.enable();
    this.scene.registry.set(NEON_OFF, !this.on);
    return true;
  }

  /** Tiles were swapped (a dial turned, a door opened): retrace the outline. */
  public refresh(): void {
    if (!this.on) return;
    this.disable(false);
    this.enable(false);
  }

  private get full(): boolean {
    return (this.def?.level ?? 0) >= 1;
  }

  private enable(notify = true): void {
    const d = this.def;
    if (!d || this.on) return;
    this.on = true;
    const s = this.scene;
    const { ground, walls } = this.map;
    const w = walls.layer.width;
    const h = walls.layer.height;
    const line = hex(d.line);
    const accent = hex(d.accent);
    const voidColor = hex(d.void ?? '#05040c');
    const rng = seededRng(this.map.id);
    const edges = traceEdges(w, h, this.map.solid);
    // Floor regions (a path, a carpet, shallows) by ground tile; walls draw no region line.
    const regions = traceRegions(
      w,
      h,
      (x, y) => (this.map.solid(x, y) ? -1 : (ground.getTileAt(x, y)?.index ?? -1)),
      4,
    );

    // Ground under the void, the void, then the walls layer (its decor and doors stay visible).
    ground.setDepth(-3);
    walls.setDepth(-1);
    if (this.full) {
      this.base = s.add
        .renderTexture(0, 0, w * TILE_SIZE, h * TILE_SIZE)
        .setOrigin(0)
        .setDepth(-2);
      this.paintBase(w, h, line, voidColor, rng);
      // Solid wall tiles become line art; decor and doors on the walls layer keep their pixels.
      walls.forEachTile((t) => {
        if (t.index >= 0 && t.visible && this.map.solid(t.x, t.y)) {
          t.setVisible(false);
          this.hidden.push(t);
        }
      });
    }
    this.glow = s.add
      .renderTexture(0, 0, w * TILE_SIZE, h * TILE_SIZE)
      .setOrigin(0)
      .setDepth(-0.5)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(this.full ? 1 : 0.6 + 0.4 * d.level);
    this.paintGlow(edges, regions, line, accent);

    if (this.full) this.placeMedallions(w, h, line);
    if (this.full) this.placeSigils(w, h, accent);
    for (const t of this.map.pois) this.addRing(t, accent);
    if (this.full) this.rimActors(line);
    if (notify) this.onChange?.(this.full);
  }

  private disable(notify = true): void {
    if (!this.on) return;
    this.on = false;
    this.base?.destroy();
    this.glow?.destroy();
    this.base = null;
    this.glow = null;
    for (const p of this.props) {
      this.scene.tweens.killTweensOf(p);
      p.destroy();
    }
    this.props = [];
    for (const t of this.hidden) t.setVisible(true);
    this.hidden = [];
    for (const r of this.rims) if (r.sprite.active) r.sprite.preFX?.remove(r.fx);
    this.rims = [];
    if (this.map.ground.scene) this.map.ground.setDepth(0);
    if (this.map.walls.scene) this.map.walls.setDepth(0);
    if (notify) this.onChange?.(false);
  }

  /** The void: dark wall masses with faint hatching, open floor full of stars and constellations. */
  private paintBase(w: number, h: number, line: number, voidColor: number, rng: () => number) {
    const base = this.base;
    const d = this.def;
    if (!base || !d) return;
    const T = TILE_SIZE;
    const g = this.scene.make.graphics({}, false);
    g.fillStyle(voidColor, 1 - (d.ghost ?? 0.1));
    g.fillRect(0, 0, w * T, h * T);
    const wallFill = mix(voidColor, line, 0.07);
    const stars: { x: number; y: number }[] = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const px = x * T;
        const py = y * T;
        if (this.map.solid(x, y)) {
          g.fillStyle(wallFill, 0.9);
          g.fillRect(px, py, T, T);
          g.lineStyle(1, line, 0.07);
          for (let k = 8; k < T * 2; k += 8)
            g.lineBetween(
              px + Math.max(0, k - T),
              py + Math.min(T, k),
              px + Math.min(T, k),
              py + Math.max(0, k - T),
            );
          continue;
        }
        // A faint drafting grid with brighter corners keeps the floor readable.
        g.lineStyle(1, line, 0.05);
        g.lineBetween(px, py + 0.5, px + T, py + 0.5);
        g.lineBetween(px + 0.5, py, px + 0.5, py + T);
        g.fillStyle(line, 0.3);
        g.fillRect(px, py, 1, 1);
        if (rng() < 0.4) {
          g.fillStyle(0xffffff, 0.15 + rng() * 0.5);
          g.fillRect(px + Math.floor(rng() * T), py + Math.floor(rng() * T), 1, 1);
        }
        if (rng() < 0.05) {
          const sx = px + 4 + Math.floor(rng() * (T - 8));
          const sy = py + 4 + Math.floor(rng() * (T - 8));
          stars.push({ x: sx, y: sy });
        }
      }
    // Constellations: each bright star reaches for its nearest neighbour.
    g.lineStyle(1, line, 0.16);
    const linked = new Set<string>();
    for (let i = 0; i < stars.length; i++) {
      let best = -1;
      let bestD = (T * 4) ** 2;
      for (let j = 0; j < stars.length; j++) {
        if (i === j) continue;
        const dd = (stars[i].x - stars[j].x) ** 2 + (stars[i].y - stars[j].y) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = j;
        }
      }
      const key = `${Math.min(i, best)}-${Math.max(i, best)}`;
      if (best < 0 || linked.has(key)) continue;
      linked.add(key);
      g.lineBetween(stars[i].x + 0.5, stars[i].y + 0.5, stars[best].x + 0.5, stars[best].y + 0.5);
    }
    for (const st of stars) {
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(st.x, st.y, 1, 1);
      g.fillStyle(line, 0.6);
      g.fillRect(st.x - 1, st.y, 1, 1);
      g.fillRect(st.x + 1, st.y, 1, 1);
      g.fillRect(st.x, st.y - 1, 1, 1);
      g.fillRect(st.x, st.y + 1, 1, 1);
    }
    base.draw(g);
    // Floor puzzle pieces: cut the void open so their real tiles read as they always did.
    for (const t of this.map.reveal) base.erase(this.tileEraser(), t.x * T, t.y * T);
    g.destroy();
  }

  private eraser: Phaser.GameObjects.Graphics | null = null;
  private tileEraser(): Phaser.GameObjects.Graphics {
    if (!this.eraser) {
      this.eraser = this.scene.make.graphics({}, false);
      this.eraser.fillStyle(0xffffff, 1).fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.eraser?.destroy());
    }
    return this.eraser;
  }

  /** Outlines drawn in passes (wide and faint to thin and bright): a glow with no shader at all. */
  private paintGlow(edges: NeonEdge[], regions: NeonLine[], line: number, accent: number): void {
    const glow = this.glow;
    if (!glow) return;
    const T = TILE_SIZE;
    const core = mix(line, 0xffffff, 0.55);
    const g = this.scene.make.graphics({}, false);
    const passes: [number, number, number][] = [
      [9, line, 0.05],
      [5, line, 0.12],
      [3, line, 0.35],
      [1, core, 1],
    ];
    for (const [width, color, alpha] of passes) {
      g.lineStyle(width, color, alpha);
      for (const e of edges) {
        // Sit the line just inside the wall so it hugs the floor's edge.
        const ox = e.nx * 1.5;
        const oy = e.ny * 1.5;
        g.lineBetween(e.x1 * T + ox, e.y1 * T + oy, e.x2 * T + ox, e.y2 * T + oy);
      }
    }
    // Floor regions: a thinner, softer line than the walls.
    for (const [width, alpha] of [
      [5, 0.07],
      [3, 0.18],
      [1, 0.65],
    ] as const) {
      g.lineStyle(width, line, alpha);
      for (const r of regions) g.lineBetween(r.x1 * T, r.y1 * T, r.x2 * T, r.y2 * T);
    }
    // A second, fainter line further inside: walls read as thick, like a drawn plan.
    g.lineStyle(1, line, 0.35);
    for (const e of edges) {
      const ox = e.nx * 6;
      const oy = e.ny * 6;
      g.lineBetween(e.x1 * T + ox, e.y1 * T + oy, e.x2 * T + ox, e.y2 * T + oy);
    }
    // Nodes where the outline turns.
    const seen = new Set<string>();
    g.fillStyle(core, 1);
    for (const e of edges)
      for (const [x, y] of [
        [e.x1, e.y1],
        [e.x2, e.y2],
      ]) {
        const k = `${x},${y}`;
        if (seen.has(k)) continue;
        seen.add(k);
        g.fillRect(x * T - 1, y * T - 1, 3, 3);
      }
    // Exits and puzzle pieces in the accent colour.
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

  /** Slowly turning clock medallions and gears on the larger wall masses. */
  private placeMedallions(w: number, h: number, line: number): void {
    const blocks = solidBlocks(w, h, this.map.solid, 3, MAX_MEDALLIONS);
    blocks.forEach((b, i) => {
      const c = { x: (b.x + b.size / 2) * TILE_SIZE, y: (b.y + b.size / 2) * TILE_SIZE };
      const img = this.scene.add
        .image(c.x, c.y, this.shape(i % 3 === 2 ? 'gear' : 'medallion', b.size * TILE_SIZE * 0.85))
        .setTint(line)
        .setAlpha(0.38)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-0.6);
      this.scene.tweens.add({
        targets: img,
        angle: i % 2 === 0 ? 360 : -360,
        duration: 40000 + b.size * 8000,
        repeat: -1,
      });
      this.props.push(img);
    });
  }

  /** A great clock sigil, faint and slowly turning, on each wide stretch of open floor. */
  private placeSigils(w: number, h: number, accent: number): void {
    const open = (x: number, y: number): boolean => !this.map.solid(x, y);
    solidBlocks(w, h, open, 5, 2).forEach((b, i) => {
      const img = this.scene.add
        .image(
          (b.x + b.size / 2) * TILE_SIZE,
          (b.y + b.size / 2) * TILE_SIZE,
          this.shape('medallion', b.size * TILE_SIZE * 0.95),
        )
        .setTint(accent)
        .setAlpha(0.16)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-1.5);
      this.scene.tweens.add({
        targets: img,
        angle: i % 2 === 0 ? 360 : -360,
        duration: 120000,
        repeat: -1,
      });
      this.props.push(img);
    });
  }

  /** A turning, breathing ring under each point of interest. */
  private addRing(t: TilePoint, accent: number): void {
    const c = tileCenter(t);
    const img = this.scene.add
      .image(c.x, c.y, RING)
      .setTint(accent)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-0.4);
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

  /** Peter and the people keep their pixel art, with a soft rim of light (WebGL only). */
  private rimActors(line: number): void {
    if (this.scene.game.renderer.type !== Phaser.WEBGL) return;
    const rim = mix(line, 0xffffff, 0.6);
    for (const sprite of this.map.actors()) {
      const fx = sprite.preFX?.addGlow(rim, 1.2, 0, false, 0.1, 6);
      if (fx) this.rims.push({ sprite, fx });
    }
  }

  /** The point-of-interest ring, drawn once in white (tinted per map). */
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
  }

  /**
   * A clock medallion or a gear, drawn at its exact on-screen size so its lines stay 1px thin
   * (a scaled-up texture would turn them into blocks). Cached per size.
   */
  private shape(kind: 'medallion' | 'gear', px: number): string {
    const size = Math.max(32, Math.round(px / 2) * 2);
    const key = `${kind === 'gear' ? GEAR : MEDALLION}_${size}`;
    if (this.scene.textures.exists(key)) return key;
    const g = this.scene.make.graphics({}, false);
    const c = size / 2;
    const R = c - 2;
    const at = (a: number, r: number) => ({ x: c + Math.cos(a) * r, y: c + Math.sin(a) * r });
    const spoke = (a: number, r0: number, r1: number): void => {
      const p = at(a, r0);
      const q = at(a, r1);
      g.lineBetween(p.x, p.y, q.x, q.y);
    };
    g.lineStyle(1, 0xffffff, 1);
    if (kind === 'medallion') {
      g.strokeCircle(c, c, R);
      g.strokeCircle(c, c, R * 0.87);
      // Twelve hour marks, longer at the quarters; sixty faint minute marks on big ones.
      for (let i = 0; i < 12; i++)
        spoke((i / 12) * Math.PI * 2, R * (i % 3 === 0 ? 0.73 : 0.87), R);
      if (size >= 160) {
        g.lineStyle(1, 0xffffff, 0.5);
        for (let i = 0; i < 60; i++) spoke((i / 60) * Math.PI * 2, R * 0.93, R);
        g.lineStyle(1, 0xffffff, 1);
      }
      // Two triangles: a hexagram.
      for (const turn of [0, Math.PI])
        g.strokePoints(
          [0, 1, 2].map((k) => at(turn - Math.PI / 2 + (k * Math.PI * 2) / 3, R * 0.67)),
          true,
        );
      g.strokeCircle(c, c, R * 0.33);
      g.lineStyle(2, 0xffffff, 1);
      spoke(-Math.PI / 2, 0, R * 0.53);
      spoke(Math.PI / 6, 0, R * 0.3);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(c, c, Math.max(2, R * 0.05));
    } else {
      const teeth = 12;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < teeth * 4; i++)
        pts.push(at((i / (teeth * 4)) * Math.PI * 2, R * (i % 4 < 2 ? 1 : 0.82)));
      g.strokePoints(pts, true);
      g.strokeCircle(c, c, R * 0.65);
      g.strokeCircle(c, c, R * 0.2);
      for (let i = 0; i < 6; i++) spoke((i / 6) * Math.PI * 2, R * 0.2, R * 0.65);
    }
    g.generateTexture(key, size, size);
    g.destroy();
    return key;
  }
}
