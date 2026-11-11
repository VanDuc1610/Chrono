---
name: tiled-topdown-world
description: Use when working with Tiled JSON maps, tileset layers, grid-based movement, collision flags, NPC spawn objects, or map triggers in WorldScene. Do NOT use for turn-based battle calculations or UI menus.
---

# Tiled Top-Down World & Grid Movement

## 1. Layer Naming Conventions (Tiled Map Editor)

All `.tmj` / `.json` maps in `public/assets/maps/` must follow this exact layer hierarchy:

1. `Ground` (Tile Layer) - Base terrain, walkable by default.
2. `Decor` (Tile Layer) - Rugs, grass, paths (no collision).
3. `Obstacles` (Tile Layer) - Walls, trees, water (custom boolean property `collides: true` or handled via GridEngine collision layer).
4. `Overhead` (Tile Layer) - Tree canopies, roofs rendered above characters (`setDepth(100)`).
5. `Objects` (Object Layer) - Point/Rectangle objects for `SpawnPoint`, `NPC`, `Portal`, `Trigger`, and `Chest`.

## 2. Loading Extruded Tilesets

To prevent WebGL tile bleeding, all tilesets are extruded by `1px` margin and `2px` spacing. Always pass `margin = 1` and `spacing = 2` when binding tilesets:

```typescript
const map = this.make.tilemap({ key: MapKeys.PrologueTown });
const tileset = map.addTilesetImage(
  'town_tileset', // Exact name inside Tiled JSON
  TextureKeys.TownTileset, // Key in AssetKeys.ts
  16,
  16, // Tile width, height
  1,
  2, // Margin = 1px, Spacing = 2px (MANDATORY for extruded tilesets)
);

if (!tileset) throw new Error('Failed to load tileset: town_tileset');

const groundLayer = map.createLayer('Ground', tileset, 0, 0);
const overheadLayer = map.createLayer('Overhead', tileset, 0, 0);
overheadLayer?.setDepth(100);
```

## 3. Safe Tiled Object Property Parsing

Never access `obj.properties` as an untyped array directly in scene code. Use this helper pattern in `src/systems/TiledParser.ts`:

```typescript
export function getTiledProperty<T>(
  obj: Phaser.Types.Tilemaps.TiledObject,
  propName: string,
  defaultValue: T,
): T {
  const props = obj.properties as Array<{ name: string; value: unknown }> | undefined;
  const found = props?.find((p) => p.name === propName);
  return (found?.value as T) ?? defaultValue;
}
```

## 4. Grid Movement & Depth Sorting

- **Grid Coordinates:** All logic checks (triggers, encounters, NPC interaction distances) must use discrete tile coordinates (`tileX`, `tileY`), never raw pixel (`x`, `y`).
- **Y-Sorting:** Dynamic entities (Player, NPC) on the ground plane must update their depth when changing Y tile or use `sprite.setDepth(sprite.y)` in `update()`.
