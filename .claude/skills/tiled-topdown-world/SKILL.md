---
name: tiled-topdown-world
description: Use when adding or changing maps, exits between maps, spawn points, NPCs, points of interest, encounters, map triggers, tiles or collision. Not for combat rules or UI menus.
---

# Exploration world (CHRONO)

## Everything placed in the world is data: `public/assets/data/maps.json`

Types: `src/world/MapTypes.ts`. Helpers + validation: `src/world/MapRegistry.ts`. All coordinates
are **tiles** (32 px); a point means the tile centre (`tileCenter`). `ExplorationScene` only wires
the data to the systems — do not hard-code NPCs, POIs or encounters in the scene.

Per map (`maps[id]`):

| Field                 | Meaning                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| `tilemap`, `tileset`  | key + path; PreloadScene loads every map listed (no extra code needed)           |
| `layers`, `collision` | layer names; `walls` collides on GIDs `fromGid..toGid`                           |
| `spawns`              | named spawn points, `default` required                                           |
| `revive`              | where Peter wakes after a defeat on this map                                     |
| `npcs`                | sprite, prompt, `dialogueId`, `dialogueRules` (state-based), `completeObjective` |
| `interactables`       | points of interest → dialogue; optional `requiresFlag`, `completeObjective`      |
| `encounters`          | overworld enemy → `CombatScene`; `defeatedFlag` hides it after victory           |
| `exits`               | tile area → `toMap` + `toSpawn`; `requiresFlag` + `lockedDialogueId` to gate     |
| `triggers`            | `arrive` or `zone`; fire once (`onceFlag`); `effects` and/or `dialogueId`        |

`visions` (texture, tile, `dialogueId`) fade in while that dialogue node plays and dissolve when
it ends — for fleeting apparitions (Residual Existence), e.g. the forgotten child.

Story state: `visibleWhen` ({flag, unlessFlag}) on NPCs / interactables / encounters;
`dialogueRules` (ifFlag / unlessFlag / ifQuestCompleted) on NPCs and interactables; `hidden`
encounters started by a trigger's `encounterId` once its dialogue closes; `frozenWhen` freezes
the map (NPCs still and tinted unless `resistsFreeze`, veil, no music).

Chapter 1 additions: triggers with `repeat: true` (no onceFlag), `unlessFlag` and `teleportTo:
"<spawnId>"` make Continuum loops; `layerVariants: [{ when, ground?, walls? }]` swap tile layers
by state (each variant layer must be a distinct layer in the tilemap); a dialogue effect
`refreshMap: true` rebuilds the map in place when the dialogue closes. Map `chapter` (HUD shows
`chapter.<n>.title`) and `ambient: { color, alpha }` (screen light, e.g. sunset); NPC `tint`
("#rrggbb") and `alpha` reuse a sprite as another character or a spirit.

`aliases` lets old save ids resolve (`prologue_sanctuary` → `map_shattered_antechamber`).
`startMapId` is where a new game begins. A dialogue node with `effects.endPrologue` plays the
Prologue ending when that dialogue closes.

## Tilemaps

- `public/assets/maps/prologue_map.json` (Antechamber) is **generated**: edit
  `scripts/generate-map.js` / `scripts/map-props.js`, run `node scripts/generate-map.js`.
  Tileset `dungeon_tileset`, no margin/spacing (no extrusion). GIDs: index + 1; 0 void, 1 floor,
  2 engraved, 3 wall top, 4 wall face, 5 pillar, 6 crystal, 7 altar, 8 fracture, 9 floor variant,
  10 stele, 11 astrolabe, 12 reliquary, 13 threshold gate, 14 torn page.
- Coastal maps (`map_peters_room`, `map_coastal_town`) are **generated** from
  `scripts/coastal-layout.js` by `node scripts/generate-coastal-maps.js` (tileset `coastal_tileset`,
  walls collide on GIDs 17-40; tile index table in the layout file). Edit the layout, regenerate.
- Forest + lighthouse (`map_forgotten_forest`, `map_old_lighthouse`): same pattern with
  `scripts/wilds-layout.js` → `node scripts/generate-wilds-maps.js` (tileset `wilds_tileset`, GIDs 17-40).
- New maps: Tiled JSON with the same two layers (`Ground`, `Walls`), 32 px tiles, ≤ 30×20.
- Movement is free 4-way Arcade Physics, not grid movement.

## Verify

`npx vitest run tests/content-data.test.ts tests/world-maps.test.ts` (validates every reference in
maps.json) · `node scripts/test-gameplay.js`.
