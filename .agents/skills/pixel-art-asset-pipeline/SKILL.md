---
name: pixel-art-asset-pipeline
description: Use when adding new spritesheets, animations, tilesets, or audio files, fixing tile bleeding/jitter artifacts, or updating AssetKeys.ts and build scripts. Do NOT use for gameplay logic or state machines.
---

# Pixel Art & Sprite Asset Pipeline

## 1. Pixel Art Rendering Constraints

- **Base Resolution:** Maintain a fixed integer virtual resolution (e.g., `320x180` or `480x270` 16:9) scaled with `Phaser.Scale.FIT` and `zoom: Integer`.
- **Sprite Origins:**
  - Top-down characters & tall props: `sprite.setOrigin(0.5, 1.0)` (bottom-center aligned to tile floor).
  - UI icons & projectiles: `sprite.setOrigin(0.5, 0.5)`.
  - UI panels / NineSlice containers: `sprite.setOrigin(0, 0)`.
- **No Sub-Pixel Positioning:** When tweening UI or camera targets, use `Math.round()` on target coordinates.

## 2. Tileset Extrusion Standard

Raw tilesets (`16x16` or `32x32`) must never be loaded directly into WebGL if the camera scrolls or zooms.

- Put raw tilesets in `raw-assets/tilesets/`.
- Output extruded tilesets to `public/assets/tilesets/` using `tile-extruder`:

```bash
npx tile-extruder --tileWidth 16 --tileHeight 16 \
  --input ./raw-assets/tilesets/world.png \
  --output ./public/assets/tilesets/world_extruded.png
```

## 3. Texture Atlas & Animation Naming

- Pack character and VFX frames into Phaser 3 JSON Hash/Array atlases (`public/assets/atlases/`).
- Frame naming convention inside atlases: `<entity>_<action>_<direction>_<index:02d>` (e.g., `chrono_walk_down_01`, `chrono_attack_left_03`).
- Register global animations once in `PreloadScene.ts`—never re-create `this.anims.create()` inside `WorldScene` or `BattleScene` every time an entity spawns.

## 4. Strict Asset Registry (`src/data/AssetKeys.ts`)

Whenever any asset is added or renamed, update `src/data/AssetKeys.ts` immediately:

```typescript
export const TextureKeys = {
  HeroAtlas: 'atlas_hero',
  TownTileset: 'tiles_town_extruded',
} as const;

export const MapKeys = {
  PrologueTown: 'map_prologue_town',
} as const;

export const AudioKeys = {
  BgmBattle: 'bgm_battle_fracture',
} as const;
```
