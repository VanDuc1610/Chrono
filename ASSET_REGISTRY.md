# CHRONO – THE FRACTURED DIVINITY
## Asset Registry & Versioning Ledger

**Ledger Version:** 1.0.0  
**Governing Policy:** [ASSET_POLICY.md](ASSET_POLICY.md)  
**Last Updated:** Phase 1 Initialization  

---

## 1. Summary of Asset Status

| Status Tier | Count | Description |
|---|---|---|
| `APPROVED_SOURCE` | 1 | Approved protagonist design source (`CHAR_PETER_001`) |
| `CONCEPT_PENDING_APPROVAL` | 0 | Concept generated; awaiting formal review |
| `SPEC_DRAFTED` | 2 | Text-only creative specifications prepared |
| `PLACEHOLDER_TEMPORARY` | 7 | Procedural placeholder assets active in engine |

---

## 2. Approved Character Design Source: Peter

### `CHAR_PETER_001`
- **Character Name:** Peter (Main Protagonist)
- **Role:** Main Protagonist
- **Design Document:** [`docs/art/PETER_DESIGN.md`](docs/art/PETER_DESIGN.md)
- **Approved Concept Image:** [`art-source/characters/peter/concept/peter_concept_v1.png`](art-source/characters/peter/concept/peter_concept_v1.png)
- **Original Generation Prompt:** [`art-source/characters/peter/prompts/peter_concept_v1.txt`](art-source/characters/peter/prompts/peter_concept_v1.txt)
- **Design Metadata:** [`art-source/characters/peter/metadata/peter_design.json`](art-source/characters/peter/metadata/peter_design.json)
- **Runtime Sprite Assets:** `public/assets/characters/peter/` (`peter_idle.png`, `peter_walk.png`, `peter_run.png`, `peter_attack.png`)
- **Status:** `APPROVED_SOURCE`
- **Non-Negotiable Identity Checklist:**
  - [x] Male adult appearance, approximately 26 years old
  - [x] Short, natural, compact curly dark-brown hair covering entire head
  - [x] Defined small curls; NO undercut, NO shaved sides, NO long hair/loose waves
  - [x] Muted gray-blue eyes
  - [x] Asymmetrical charcoal-blue travel coat
  - [x] Dark practical clothing
  - [x] Diagonal leather shoulder strap
  - [x] Aged silver details
  - [x] Broken Blade (glowing cerulean fracture), Stopped Watch, Torn Notebook

---

## 3. Active Placeholder Registry

The following assets are currently integrated into the engine strictly as **temporary placeholders**. They are not approved final art:

### `CHAR_VESSEL_000_TMP`
- **Object Name:** The Vessel (Player Character Placeholder)
- **File Path:** `public/assets/characters/player_placeholder.png`
- **Asset Key:** `player_placeholder`
- **Design Doc Ref:** [GDD.md](GDD.md) v0.1.0, [LORE.md](LORE.md) v1.0.0
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 32 × 32 px
- **Footprint Hitbox:** 18 × 14 px, offset (7, 16)
- **Generator:** `scripts/generate-assets.js` (Procedural canvas-buffer synthesis)
- **Notes:** High-contrast placeholder with slate helm, midnight cloak, and cyan fracture core.

### `NPC_ELDER_000_TMP`
- **Object Name:** Elder Chronographer (NPC Placeholder)
- **File Path:** `public/assets/npcs/npc_elder_placeholder.png`
- **Asset Key:** `npc_elder`
- **Design Doc Ref:** [GDD.md](GDD.md) v0.1.0, [LORE.md](LORE.md) v1.0.0
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 32 × 32 px
- **Footprint Hitbox:** 20 × 20 px, offset (6, 12)
- **Generator:** `scripts/generate-assets.js`
- **Notes:** Hooded scholar silhouette with golden gaze.

### `MOB_SHADE_000_TMP`
- **Object Name:** Temporal Shade (Enemy Placeholder)
- **File Path:** `public/assets/enemies/enemy_fracture_placeholder.png`
- **Asset Key:** `enemy_fracture`
- **Design Doc Ref:** [GDD.md](GDD.md) v0.1.0, [LORE.md](LORE.md) v1.0.0
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 32 × 32 px
- **Generator:** `scripts/generate-assets.js`
- **Notes:** Dark violet apparition with pulsing crimson core.

### `ENV_SANCTUARY_000_TMP`
- **Object Name:** Shattered Antechamber Tileset (Placeholder Atlas)
- **File Path:** `public/assets/tilesets/dungeon_tileset.png`
- **Asset Key:** `dungeon_tileset`
- **Design Doc Ref:** [GDD.md](GDD.md) v0.1.0
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 128 × 128 px (4 × 4 grid of 32 × 32 px tiles)
- **Generator:** `scripts/generate-assets.js`
- **Tile Contents:** Stone floor, engraved rune floor, wall top, wall face, broken pillar, chrono crystal, altar.

### `UI_FRAME_000_TMP`
- **Object Name:** Dialogue & HUD Frame (Placeholder)
- **File Path:** `public/assets/ui/ui_frame.png`
- **Asset Key:** `ui_frame`
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 48 × 48 px

### `UI_CURSOR_000_TMP`
- **Object Name:** Menu Cursor (Placeholder)
- **File Path:** `public/assets/ui/ui_cursor.png`
- **Asset Key:** `ui_cursor`
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 16 × 16 px

### `FX_SPARK_000_TMP`
- **Object Name:** Hit Spark / Chrono Particle (Placeholder)
- **File Path:** `public/assets/effects/hit_spark.png`
- **Asset Key:** `hit_spark`
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Dimensions:** 16 × 16 px

### `AUD_SILENCE_000_TMP`
- **Object Name:** Minimal Silent RIFF WAV (Audio Loader Placeholder)
- **File Path:** `public/assets/audio/silence_placeholder.wav`
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Format:** 8000 Hz, 8-bit mono PCM, 44 bytes

---

## 4. Text-Only Creative Specifications (Awaiting Generation)

The following specifications have been drafted in compliance with [ASSET_POLICY.md](ASSET_POLICY.md) Step 2 for upcoming asset production:

### SPEC-002: Elder Chronographer (NPC)
- **Target Asset ID:** `NPC_ELDER_001`
- **Design Doc Ref:** [GDD.md](GDD.md) v0.1.0, [LORE.md](LORE.md) §3
- **Status:** `SPEC_DRAFTED`
- **Output Dimensions:** 32 × 32 px; 4 directions (Down, Up, Left, Right).
- **Text-Only Generation Specification:**
  > An original 2D top-down retro pixel art NPC sprite. An ancient monastic archivist standing within a 32x32 pixel canvas with a transparent background.
  > Silhouette: A draped, flowing hooded mantle of heavy weathered wool in dark ochre and umber tones (`#483416`, `#8c6628`). The cowl deeply shadows the face, from which two small amber-gold eyes or optical lenses gleam softly (`#ffd666`).
  > Features: Holds a brass astrolabe or timekeeper's quill in the right hand. Embroidered celestial gear glyphs line the mantle's hem in faded gold thread.
  > Proportions: 1:2.8 stylized retro ratio. Crisp pixel borders, no semi-transparent blur pixels.

### SPEC-003: Temporal Shade (Hostile Anomaly)
- **Target Asset ID:** `MOB_SHADE_001`
- **Design Doc Ref:** [GDD.md](GDD.md) v0.1.0, [LORE.md](LORE.md) §3
- **Status:** `SPEC_DRAFTED`
- **Output Dimensions:** 32 × 32 px; floating entity.
- **Text-Only Generation Specification:**
  > An original 2D top-down pixel art creature sprite representing an unstable temporal rift anomaly.
  > Form: A hovering, ethereal specter composed of frayed dark violet temporal mist (`#260b1e`, `#6b153e`) that trails downward into wisps.
  > Core: Suspended at the center of the dark mist is a jagged crimson-and-rose chronal shard (`#ff4d79`, `#b82352`) that pulses with fracture energy.
  > Floating Pose: Floats 4 pixels above the shadow base, conveying weightless unreality. Pure pixel art, 32x32 bounding box, transparent background.

