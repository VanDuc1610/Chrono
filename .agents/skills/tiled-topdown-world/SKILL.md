---
name: tiled-topdown-world
description: Guidelines for top-down tilemaps, collision layers, coordinate conversions, and player-obstacle physics in Phaser 3.
---

# Tiled Top-Down World & Movement

## 1. When to Load

- Editing map generation scripts (`scripts/generate-map.js`, `scripts/map-props.js`).
- Modifying `ExplorationScene.ts`, `Player.ts`, or movement collision logic.
- Adding interactable POIs on tile grids.

## 2. Core Constraints

- **Tile Alignment:** Base grid is `32×32` px. Tile coordinates $(x, y)$ map to world pixels via $(x \times 32 + 16, y \times 32 + 16)$ (center origin).
- **Collision Boundaries:** Wall collisions must use integer bounding boxes. Peter's foot collider is strictly $18 \times 14$ px at offset `(7, 16)`.
- **Layer Stacking:** Ground layer -> Props layer -> Entities (Y-sorted depth) -> Overhead layer.
- **Strict Coordinate Rounding:** Never pass fractional camera or sprite resting positions.
