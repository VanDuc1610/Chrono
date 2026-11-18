import Phaser from 'phaser';

/**
 * Maps smaller than the view (owner, 2026-11-18: the view grew to 768×432) would show black bands
 * around them. This fills the camera area outside the map with the map's own border tile (the most
 * common wall tile on its edge, else the ground's), a little darker, so the map covers the screen.
 * Drawn behind every map layer. Returns null when the map already fills the view.
 */
export function fillSurround(
  scene: Phaser.Scene,
  walls: Phaser.Tilemaps.TilemapLayer,
  ground: Phaser.Tilemaps.TilemapLayer,
  bounds: { x: number; y: number; width: number; height: number },
): Phaser.GameObjects.TileSprite | null {
  if (bounds.x >= 0 && bounds.y >= 0) return null;
  const tile = borderTile(walls) ?? borderTile(ground);
  const image = tile?.tileset?.image;
  if (!tile || !tile.tileset || !image) return null;
  const ts = tile.tileset;
  const key = `surround_${image.key}_${tile.index}`;
  if (!scene.textures.exists(key)) {
    const at = ts.getTileTextureCoordinates(tile.index) as { x: number; y: number } | null;
    const src = image.getSourceImage() as CanvasImageSource;
    const tex = scene.textures.createCanvas(key, ts.tileWidth, ts.tileHeight);
    if (!at || !tex) return null;
    tex.context.drawImage(
      src,
      at.x,
      at.y,
      ts.tileWidth,
      ts.tileHeight,
      0,
      0,
      ts.tileWidth,
      ts.tileHeight,
    );
    tex.refresh();
  }
  // Aligned to the map's own grid, so the pattern runs on from its edge.
  const tw = ts.tileWidth;
  const th = ts.tileHeight;
  const x0 = Math.floor(bounds.x / tw) * tw;
  const y0 = Math.floor(bounds.y / th) * th;
  const w = Math.ceil((bounds.x + bounds.width - x0) / tw) * tw;
  const h = Math.ceil((bounds.y + bounds.height - y0) / th) * th;
  const fill = scene.add.tileSprite(x0, y0, w, h, key).setOrigin(0, 0).setDepth(-2);
  const shade = scene.add.rectangle(x0, y0, w, h, 0x000000, 0.35).setOrigin(0, 0).setDepth(-1);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => shade.destroy());
  return fill;
}

/** The most common tile on a layer's outer ring, or null if the ring is empty. */
function borderTile(layer: Phaser.Tilemaps.TilemapLayer): Phaser.Tilemaps.Tile | null {
  const { width, height } = layer.layer;
  const count = new Map<number, { n: number; tile: Phaser.Tilemaps.Tile }>();
  const look = (x: number, y: number): void => {
    const t = layer.getTileAt(x, y);
    if (!t || t.index < 0) return;
    const c = count.get(t.index);
    if (c) c.n += 1;
    else count.set(t.index, { n: 1, tile: t });
  };
  for (let x = 0; x < width; x++) {
    look(x, 0);
    look(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    look(0, y);
    look(width - 1, y);
  }
  let best: { n: number; tile: Phaser.Tilemaps.Tile } | null = null;
  for (const c of count.values()) if (!best || c.n > best.n) best = c;
  return best?.tile ?? null;
}
