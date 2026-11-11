---
name: pixel-art-asset-pipeline
description: Use when adding new spritesheets, animations, tilesets, or audio files, fixing tile bleeding/jitter artifacts, or updating AssetKeys.ts and build scripts. Do NOT use for gameplay logic or state machines.
---

# Pixel Art Asset Pipeline & Integrity

## 1. When to Use / Routing Rules

- **TRIGGER:** Adding new spritesheets, animations, tilesets, or audio files, fixing tile bleeding/jitter artifacts, running `tile-extruder`, or updating `AssetKeys.ts`.
- **DO NOT USE FOR:** Gameplay logic, state machines, or dialogue writing.

---

## 2. Tile Extrusion to Prevent Seam Bleeding

When creating or modifying tilesets, extrude 1px duplicate borders around every tile using `tile-extruder`:

```bash
# Standard CLI command for 32x32 tileset extrusion:
npx tile-extruder --tileWidth 32 --tileHeight 32 --margin 0 --spacing 0 --input public/assets/tilesets/dungeon_tileset.png --output public/assets/tilesets/dungeon_tileset_extruded.png
```

Load in Phaser using `margin: 1, spacing: 2`:

```typescript
this.load.image('dungeon_tileset_extruded', 'assets/tilesets/dungeon_tileset_extruded.png');
// map.addTilesetImage('dungeon_tileset', 'dungeon_tileset_extruded', 32, 32, 1, 2);
```

---

## 3. Top-Down Character Origin & Hitbox Anchoring

For top-down RPG characters:

- **Origin / Pivot:** Always anchor to bottom-center of the footprint:
  ```typescript
  sprite.setOrigin(0.5, 1.0);
  ```
- **Physics Footprint:**
  ```typescript
  // 32x32 character frame with 18x14 foot collider
  sprite.body.setSize(18, 14);
  sprite.body.setOffset(7, 18);
  ```
- **Pixel Art Integrity:** Never use fractional floating-point positions for resting sprites. Always keep `roundPixels: true` in Phaser configuration.

---

## 4. Animation Frame Naming Standards

Standard format: `<entity>_<action>_<direction>_<frame>`:

- `peter_idle_down` (4 frames)
- `peter_walk_up` (6 frames)
- `peter_attack_right` (6 frames)
- `peter_hurt_right` (2 frames)
- `enemy_shade_idle` (4 frames)
- `ui_cursor_pulse` (2 frames)

---

## 5. Strict Asset Typing (`src/data/AssetKeys.ts`)

Never hardcode asset strings or magic strings in Scenes. Centralize in `AssetKeys.ts`:

```typescript
// src/data/AssetKeys.ts
export const TEXTURES = {
  PLAYER_IDLE: 'peter_idle',
  PLAYER_WALK: 'peter_walk',
  PLAYER_ATTACK: 'peter_attack',
  PLAYER_HURT: 'peter_hurt',
  NPC_ELDER: 'npc_elder',
  ENEMY_SHADE: 'enemy_fracture',
  TILES_DUNGEON: 'dungeon_tileset',
  UI_FRAME: 'ui_frame',
  UI_CURSOR: 'ui_cursor',
  FX_HIT_SPARK: 'hit_spark',
} as const;

export const MAPS = {
  PROLOGUE: 'prologue_map',
} as const;

export const AUDIO = {
  BGM_AMBIENT: 'bgm_ambient',
  BGM_BATTLE: 'bgm_battle',
} as const;
```

---

## 6. Art Directives & Approval Gate

- **Peter Hairstyle Lock (AGENTS.md §4):** Short, compact, natural curls covering the entire head. Never straight, wavy, drooping bangs, or undercut.
- **Pipeline B Workflow (Code-Authored Pixel Art):**
  1. Author pixel placement in a committed script (`scripts/author-*-sprites.js`).
  2. Output candidate images ONLY to `art-source/.../generated/candidates/`.
  3. Validate with `node scripts/validate-candidate.js <file>`.
  4. Obtain project owner sign-off before promoting to `public/assets/`.
