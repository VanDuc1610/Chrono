import Phaser from 'phaser';
import { TILE_SIZE } from './MapRegistry';
import type { TilePoint } from './MapTypes';

/** public/assets/data/lpc.json (written by scripts/lpc/reskin.mjs). */
export interface LpcData {
  tilesets: Record<
    string,
    {
      caps?: { key: string; path: string; frames: Record<string, number> };
      /** Soft terrain edges: ground kind (rank) by gid, `pieces` border frames per kind. */
      edges?: { key: string; path: string; kindOf: Record<string, number>; pieces: number };
    }
  >;
}

/**
 * T-88 (owner, 2026-11-17): walls stand two tiles tall in 3/4 view. Each wall tile whose northern
 * neighbour is open gets its top drawn on that neighbour, above the actors, so Peter walks behind
 * it; collision stays one tile. Cells that must stay readable (people, points of interest, dials,
 * exits, puzzle tiles) are never covered. Drawn once into a render texture; refresh() after swaps.
 */
export class WallCaps {
  private rt: Phaser.GameObjects.RenderTexture | null = null;
  private readonly frames: Record<string, number> | null;
  private readonly key: string;

  constructor(
    private readonly scene: Phaser.Scene,
    tilesetName: string,
    private readonly walls: Phaser.Tilemaps.TilemapLayer,
    private readonly solid: (x: number, y: number) => boolean,
    private readonly keepClear: () => TilePoint[],
    private readonly depth: number,
  ) {
    const data = scene.cache.json.get('data_lpc') as LpcData | undefined;
    const caps = data?.tilesets[tilesetName]?.caps;
    this.frames = caps && scene.textures.exists(caps.key) ? caps.frames : null;
    this.key = caps?.key ?? '';
    this.refresh();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.rt?.destroy());
  }

  /** Redraws every cap (tiles were swapped: a door opened, a bridge appeared). */
  public refresh(): void {
    if (!this.frames) return;
    const w = this.walls.layer.width;
    const h = this.walls.layer.height;
    if (!this.rt)
      this.rt = this.scene.add
        .renderTexture(0, 0, w * TILE_SIZE, h * TILE_SIZE)
        .setOrigin(0)
        .setDepth(this.depth);
    this.rt.clear();
    const clear = new Set(this.keepClear().map((p) => `${p.x},${p.y}`));
    for (let y = 1; y < h; y++)
      for (let x = 0; x < w; x++) {
        const t = this.walls.getTileAt(x, y);
        const frame = t ? this.frames[String(t.index)] : undefined;
        if (frame === undefined || !this.solid(x, y)) continue;
        if (this.solid(x, y - 1) || clear.has(`${x},${y - 1}`)) continue;
        if ((this.walls.getTileAt(x, y - 1)?.index ?? -1) >= 0) continue; // decor stays visible
        this.rt.drawFrame(this.key, frame, x * TILE_SIZE, (y - 1) * TILE_SIZE);
      }
  }
}
