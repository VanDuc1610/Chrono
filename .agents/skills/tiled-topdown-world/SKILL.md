---
name: tiled-topdown-world
description: Use when working with Tiled JSON maps, tileset layers, grid-based movement, collision flags, NPC spawn objects, or map triggers in WorldScene. Do NOT use for turn-based battle calculations or UI menus.
---

# Tiled Top-Down World & Movement Standards

## 1. When to Use / Routing Rules

- **TRIGGER:** Working with Tiled JSON maps, tileset layers, grid-based movement, collision flags, NPC spawn objects, or map triggers in `WorldScene` / `ExplorationScene`.
- **DO NOT USE FOR:** Turn-based battle calculations or UI menus.

---

## 2. Layer Naming Conventions in Tiled

All Tiled map exports must adhere to standardized layer names and stacking order:

1. `Ground` (Tile Layer): Floor tiles, paths, grass, carpets (Rendered below entities, no physics).
2. `Obstacles` or `Walls` (Tile Layer): Solid walls, pillars, water, chasms (Collides with entities).
3. `Objects` (Object Layer): Vector spawn points, NPC anchors, triggers, interactable POIs.
4. `Overhead` (Tile Layer, optional): Canopy, archways, roofs (Rendered above entities with higher depth).

---

## 3. Extruded Tileset Integration (`margin: 1, spacing: 2`)

To eliminate tile bleeding / 1px seam tearing during camera panning, tilesets extruded with `tile-extruder` must be loaded with explicit margin and spacing offsets:

```typescript
// Extruded tileset: 32x32 tiles with 1px extruded border per tile
const tileset = map.addTilesetImage(
  'dungeon_tileset', // Name of the tileset inside Tiled JSON
  'dungeon_tileset_extruded', // Phaser texture cache key
  32, // Tile width
  32, // Tile height
  1, // Margin (1 px border on texture edge)
  2, // Spacing (2 px between adjacent tiles)
);
```

---

## 4. Type-Safe Tiled Custom Properties Helper

Tiled exports custom properties as an array `[{ name: string, type: string, value: unknown }]`. Never cast with `any`. Use this type-safe helper:

```typescript
export interface TiledRawProperty {
  name: string;
  type: string;
  value: unknown;
}

export function getTiledProperty<T>(
  object: Phaser.Types.Tilemaps.TiledObject,
  propertyName: string,
  defaultValue: T,
): T {
  const props = object.properties as TiledRawProperty[] | undefined;
  if (!props || !Array.isArray(props)) return defaultValue;
  const entry = props.find((p) => p.name === propertyName);
  return entry !== undefined ? (entry.value as T) : defaultValue;
}

// Usage Example:
const dialogueId = getTiledProperty<string>(tiledObj, 'dialogueId', 'default_greeting');
const isLocked = getTiledProperty<boolean>(tiledObj, 'isLocked', false);
```

---

## 5. Grid Coordinates & Hitbox Standards

- **Base Tile Size:** $32 \times 32\text{ px}$.
- **Tile-to-World Center Formula:**
  $$\text{pixelX} = \text{tileX} \times 32 + 16, \quad \text{pixelY} = \text{tileY} \times 32 + 16$$
- **Peter's Foot Collider Standard:**
  Characters use top-down perspective with depth sorting. Collision hitboxes MUST be constrained to the feet to allow heads to overlap back walls:
  ```typescript
  // Peter sprite: 32x32 frame
  playerSprite.body.setSize(18, 14); // 18 px wide, 14 px tall footprint
  playerSprite.body.setOffset(7, 16); // Centered horizontally, anchored to ground
  ```
- **Depth Sorting (Y-Sorting):**
  Entities must dynamically set depth based on their bottom edge:
  ```typescript
  sprite.setDepth(sprite.y);
  ```
