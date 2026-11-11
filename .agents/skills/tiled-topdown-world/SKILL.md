---
name: tiled-topdown-world
description: Use when changing the exploration map, tiles, collision, props, spawn points, NPC placement or map triggers in ExplorationScene. Not for combat or UI menus.
---

# Exploration world (CHRONO)

## Current map

- `public/assets/maps/prologue_map.json` — Tiled JSON, 24×18 tiles of 32 px, layers `Ground` and
  `Walls`, tileset `dungeon_tileset` (no margin/spacing — **do not** add extrusion offsets).
- The map is **generated**: edit `scripts/generate-map.js` (layout, floor variants) and
  `scripts/map-props.js` (prop tiles), then run `node scripts/generate-map.js`. Do not hand-edit
  the JSON.
- Tileset indices (GID = index + 1): 0 void, 1 floor, 2 engraved, 3 wall top, 4 wall face,
  5 pillar, 6 crystal, 7 altar, 8 fracture floor, 9 floor variant, 10 stele, 11 astrolabe,
  12 reliquary, 13 threshold gate, 14 torn page. `Walls` collides on GIDs 4–16
  (`setCollisionBetween(4, 16)` in `ExplorationScene`).

## Movement & interaction

- Free 4-way Arcade Physics movement (`TopDownMovementSystem`), not grid movement. Player foot
  collider 18×14 at (7, 16).
- Points of interest come from `public/assets/data/interactables.json` (tile coords + radius) and
  are registered with `InteractionSystem`; NPCs are `src/entities/NPC.ts`.
- Pixel coordinates of a tile centre: `tile * 32 + 16`.

## Planned (not built yet)

Multiple maps, map transitions and Tiled-authored object layers are Phase 2 work. Check
`docs/TASKS.md` before building them and keep the existing map loading working.

## Verify

`node scripts/test-gameplay.js` (movement, collision, dialogue by real key presses).
