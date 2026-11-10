# CHRONO – THE FRACTURED DIVINITY
## Art Direction & Pixel Asset Production Guide

**Version:** 1.0.0-PROLOGUE  
**Status:** Approved Specification  
**Camera Perspective:** Top-Down (2D Orthographic / 3/4 Perspective)

---

## 1. Core Principles & Visual Pillar

- **Original Creation Only:** All characters, environments, visual effects, and UI elements must be 100% original creations derived exclusively from text-only design specifications in compliance with [ASSET_POLICY.md](ASSET_POLICY.md).
- **Asset Versioning Ledger:** Every asset must be cataloged in [ASSET_REGISTRY.md](ASSET_REGISTRY.md) with approval status, text-only generation prompts, and frame specs.
- **No Derivative or Copyrighted References:** Under no circumstances should existing commercial RPG sprites or character illustrations be used as direct visual references.
- **Atmospheric Palette:** Celestial cosmic tones (midnight slate, indigo, deep obsidian) contrasted against bright divine fractures (luminous cyan, temporal gold, crimson anomalies).
- **Pixel Consistency:** Pixel ratios must never be mixed. Sub-pixel rendering or non-integer rotations without pixel-grid snapping are prohibited.

---

## 2. Dimensional Standards & Grid Conventions

| Asset Type | Grid / Canvas Size | Sprite Bounding Box | Collision Body (Footprint) |
|---|---|---|---|
| **Base Environment Tiles** | 32 × 32 px | 32 × 32 px | 32 × 32 px (if solid) |
| **Micro Tiles / Detail Decals** | 16 × 16 px | 16 × 16 px | Variable |
| **Standard Humanoid Characters** | 32 × 32 px | 24 × 30 px | 18 × 14 px (ground footprint) |
| **Large NPCs / Boss Entities** | 64 × 64 px | 56 × 60 px | 36 × 24 px |
| **UI Icons** | 16 × 16 px / 24 × 24 px | Centered | N/A |
| **Dialogue Portraits (TBD)** | 64 × 64 px | Centered | N/A |

### Canvas & Framing Rules:
- All character and NPC frames must be centered horizontally inside their designated grid bounding box.
- Sprites must touch the bottom anchor row of the canvas (Y = 30 or 31 on 32×32 frames) to maintain consistent ground-plane alignment across all directions.

---

## 3. Sprite Conventions & Directions

Characters and moving entities use a 4-directional standard:
1. **Down (`down`):** Facing camera directly (front). Default idle direction.
2. **Up (`up`):** Facing away from camera (back).
3. **Left (`left`):** Profile / 3/4 left perspective.
4. **Right (`right`):** Profile / 3/4 right perspective (can be mirrored if asymmetrical details permit, otherwise unique dedicated sprite).

---

## 4. Animation Naming & Frame Rates

All sprite sheets must follow uniform frame indexing and JSON manifest naming:

```
<category>_<entity_id>_<action>_<direction>_<frame_index>.png
```

### Examples:
- `char_player_idle_down_00.png`
- `char_player_walk_down_01.png`
- `char_player_walk_down_02.png`
- `char_player_walk_down_03.png`
- `npc_elder_idle_down_00.png`
- `enemy_shade_attack_left_02.png`

### Animation Frame Budgets:
- **Idle:** 2 to 4 frames (4 to 6 FPS loop, subtle breathing/floating).
- **Walk:** 4 to 6 frames (8 to 10 FPS loop, distinct contact, recoil, passing poses).
- **Combat Attack / Cast:** 4 to 8 frames (12 FPS, strong anticipation, impact frame, recovery).
- **Hit Stun / Hurt:** 2 frames (10 FPS, white silhouette flash / recoil).
- **Defeat / Dissolve:** 4 to 6 frames (8 FPS, fracture disintegration into particles).

---

## 5. Color Palette & Lighting Rules

A cohesive 32-color palette ramp (The Chronal Spectrum) dictates all in-game assets:

### Swatches:
1. **The Abyss (Environment & Shadows):**
   - `#07080f` (Deepest Obsidian)
   - `#0e121e` (Midnight Slate)
   - `#1b2234` (Deep Vault Stone)
   - `#29344c` (Weathered Stone)
   - `#404f6e` (High-Stone Highlight)
2. **Divine Fracture Core (Energy, Player Visor, Time Portals):**
   - `#00486b` (Deep Resonating Blue)
   - `#008ab8` (Chronal Cerulean)
   - `#00c8ff` (Active Chrono Cyan)
   - `#88edff` (Fracture Luminescence)
   - `#ffffff` (Divine Apex White)
3. **The Eternal Order (Elders, Relics, Astrolabes):**
   - `#483416` (Ancient Bronze Shadow)
   - `#8c6628` (Aged Brass)
   - `#d19e34` (Gilded Rune)
   - `#ffd666` (Solar Resonator)
4. **Temporal Distortion / Corruption (Shades, Hostile Anomalies):**
   - `#260b1e` (Null Void Violet)
   - `#6b153e` (Abyssal Claret)
   - `#b82352` (Fracture Carmine)
   - `#ff4d79` (Temporal Bleed Rose)

### Shading Guidelines:
- Max **3 to 4 shades per material surface** (Shadow, Base Tone, Mid Highlight, Edge Rim).
- No fuzzy anti-aliasing or automatic gradient ramps.
- Hue shifting: Shadows must shift towards cool obsidian/indigo; highlights must shift towards warm cyan or amber.

---

## 6. Transparency & File Export Requirements

- **Alpha Channel:** Sprites must use pure 8-bit RGBA transparency (alpha = 0 for empty space).
- **No Stray Pixels:** Trim any single orphan pixels with opacity < 100%.
- **Backgrounds:** Transparent backgrounds only. Never export sprites with solid background colors (e.g. magenta `#FF00FF` or black).
- **File Format:** Lossless `.png` with non-interlaced scanlines.
- **Color Depth:** 32-bit RGBA or optimized 8-bit indexed PNG (provided palette integrity is maintained).

---

## 7. Character Consistency & Silhouette Requirements

1. **Clear Silhouette Test:** Every character must be instantly identifiable by shape alone when rendered in solid black silhouette against a white background.
2. **Head-to-Body Ratio:** 1:2.5 to 1:3 stylized proportion (chibi-stylized realism, avoiding extreme chibi or ultra-realistic tall proportions).
3. **Contrasting Values:** Light elements (e.g. glowing fracture cores, crystal visors) must always sit against dark armor or robes to guarantee readability against varying dungeon floor textures.
4. **Placeholder Transition:** Any new artist replacing temporary assets must conform strictly to the collision bounding box `18 × 14 px` located at bottom-center `(7, 16)` to preserve existing movement and collision mechanics.

