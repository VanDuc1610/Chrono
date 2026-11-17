import Phaser from 'phaser';
import { TILE_SIZE } from './MapRegistry';
import { edgePieceAt, PLAIN_GROUND } from './EdgeRules';
import type { LpcData } from './WallCaps';
import type { TilePoint } from './MapTypes';

/** Share of a kind's inner cells that get a piece of flat decor. */
const DECOR_DENSITY = 0.08;
/** A stable pseudo-random number in [0, 1) for a cell of a map. */
const cellNoise = (x: number, y: number, seed: number, salt: number): number => {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041 + salt * 2654435761) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/**
 * T-88: soft terrain edges on LPC maps (rules in EdgeRules). Drawn once into a render texture that
 * sits between the ground and the walls; refresh() after tile swaps change the ground.
 */
export class TerrainEdges {
  private rt: Phaser.GameObjects.RenderTexture | null = null;
  private readonly edges: NonNullable<LpcData['tilesets'][string]['edges']> | null;

  constructor(
    private readonly scene: Phaser.Scene,
    tilesetName: string,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    /** Texture of the ground tileset (its tiles are drawn under the border pieces). */
    private readonly groundKey: string,
    /** Map id: the decor is scattered the same way on every visit. */
    private readonly mapId = '',
    /** Cells that stay bare (people, points, exits, puzzle tiles). */
    private readonly keepClear: () => TilePoint[] = () => [],
  ) {
    const data = scene.cache.json.get('data_lpc') as LpcData | undefined;
    const edges = data?.tilesets[tilesetName]?.edges;
    this.edges =
      edges && scene.textures.exists(edges.key) && scene.textures.exists(groundKey) ? edges : null;
    if (!this.edges) return;
    // Name every tile of the ground atlas once, so it can be drawn by gid.
    const tex = scene.textures.get(groundKey);
    const src = tex.getSourceImage() as { width: number; height: number };
    const cols = Math.floor(src.width / TILE_SIZE);
    const rows = Math.floor(src.height / TILE_SIZE);
    for (let i = 0; i < cols * rows; i++)
      if (!tex.has(`g${i + 1}`))
        tex.add(
          `g${i + 1}`,
          0,
          (i % cols) * TILE_SIZE,
          Math.floor(i / cols) * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
        );
    this.refresh();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.rt?.destroy());
  }

  public refresh(): void {
    const e = this.edges;
    if (!e) return;
    const w = this.ground.layer.width;
    const h = this.ground.layer.height;
    if (!this.rt)
      this.rt = this.scene.add.renderTexture(0, 0, w * TILE_SIZE, h * TILE_SIZE).setOrigin(0);
    this.rt.clear();
    const gid = (x: number, y: number): number =>
      x < 0 || y < 0 || x >= w || y >= h ? -1 : (this.ground.getTileAt(x, y)?.index ?? -1);
    // Ground with no LPC kind (paving) still lets the kinds spill over it.
    const kind = (x: number, y: number): number => {
      const g = gid(x, y);
      return g < 0 ? -1 : (e.kindOf[String(g)] ?? PLAIN_GROUND);
    };
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const p = edgePieceAt(x, y, kind);
        if (!p) continue;
        const under = gid(p.under.x, p.under.y);
        if (under < 0) continue;
        this.rt.drawFrame(this.groundKey, `g${under}`, x * TILE_SIZE, y * TILE_SIZE);
        this.rt.drawFrame(e.key, kind(x, y) * e.pieces + p.piece, x * TILE_SIZE, y * TILE_SIZE);
      }
    // Flat decor on a few inner cells of each kind (never on a border, never on a kept cell).
    if (!e.decor) return;
    let seed = 0;
    for (let i = 0; i < this.mapId.length; i++) seed = (seed * 31 + this.mapId.charCodeAt(i)) | 0;
    const clear = new Set(this.keepClear().map((c) => `${c.x},${c.y}`));
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const frames = e.decor[String(kind(x, y))];
        if (!frames?.length || clear.has(`${x},${y}`)) continue;
        if (cellNoise(x, y, seed, 1) >= DECOR_DENSITY || edgePieceAt(x, y, kind)) continue;
        const frame = frames[Math.floor(cellNoise(x, y, seed, 2) * frames.length)];
        this.rt.drawFrame(e.key, frame, x * TILE_SIZE, y * TILE_SIZE);
      }
  }
}
