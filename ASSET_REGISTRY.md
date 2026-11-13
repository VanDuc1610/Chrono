# CHRONO – THE FRACTURED DIVINITY

## Asset Registry & Versioning Ledger

**Ledger Version:** 1.0.0  
**Governing Policy:** [ASSET_POLICY.md](ASSET_POLICY.md)  
**Last Updated:** 2026-11-11 (Peter combat sheets + UI set approved and integrated)

---

## 1. Summary of Asset Status

| Status Tier                | Count | Description                                                         |
| -------------------------- | ----- | ------------------------------------------------------------------- |
| `APPROVED_SOURCE`          | 1     | Approved protagonist design source (`CHAR_PETER_001`)               |
| `INTEGRATED`               | 15    | Approved art in engine (Peter ×2, Shade, Elder, tileset ×2, UI set) |
| `CONCEPT_PENDING_APPROVAL` | 5     | Concept generated; awaiting formal review                           |
| `SPEC_DRAFTED`             | 2     | Text-only creative specifications prepared                          |
| `PLACEHOLDER_TEMPORARY`    | 3     | Procedural placeholder assets active in engine                      |

---

## 2. Approved Character Design Source: Peter

### `CHAR_PETER_001`

- **Character Name:** Peter (Main Protagonist)
- **Role:** Main Protagonist
- **Design Document:** [`docs/art/PETER_DESIGN.md`](docs/art/PETER_DESIGN.md)
- **Approved Concept Images:**
  - [`art-source/characters/peter/concept/peter_master_v1.png`](art-source/characters/peter/concept/peter_master_v1.png) (Master Concept)
  - [`art-source/characters/peter/concept/peter_alt_pose_v1.png`](art-source/characters/peter/concept/peter_alt_pose_v1.png) (Alternate Pose)
  - [`art-source/characters/peter/concept/peter_concept_v1.png`](art-source/characters/peter/concept/peter_concept_v1.png) (Turnaround Reference)
- **Original Generation Prompt:** [`art-source/characters/peter/prompts/peter_concept_v1.txt`](art-source/characters/peter/prompts/peter_concept_v1.txt)
- **Design Metadata:** [`art-source/characters/peter/metadata/peter_design.json`](art-source/characters/peter/metadata/peter_design.json)
- **Runtime Sprite Assets:** `peter_idle.png` + `peter_walk.png` are approved art (`CHAR_PETER_002`). attack / hurt / temporal_sight are approved art (`CHAR_PETER_003`). Only the run sheet is still a procedural placeholder (`CHAR_PETER_000_TMP`).
- **Status:** `APPROVED_SOURCE` (design source only — not runtime sprites)
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

## 2b. Integrated Runtime Sprites

### `CHAR_PETER_002` – Peter idle + walk sheets (v3)

- **Pipeline:** B – code-authored pixel art (AGENTS.md §5), generator `scripts/author-peter-sprites.js`
- **Approved files:** `art-source/characters/peter/generated/approved/peter_idle_v3.png` (128 × 128, 4 frames × 4 dirs), `peter_walk_v3.png` (192 × 128, 6 frames × 4 dirs); review previews in `generated/candidates/previews/`
- **Runtime files:** `public/assets/characters/peter/peter_idle.png`, `peter_walk.png`
- **Sources:** `docs/art/PETER_DESIGN.md` palette (22 colours) + `peter_master_v1.png` as visual reference
- **History:** v2 → owner feedback "head slightly too big; add a standout feature" → v3: head ≈1:3, Broken Blade held point-down in the right hand (PETER_DESIGN §3.3) with cerulean edge glow, Stopped Watch on the belt.
- **Validation:** `validate-candidate.js` PASSED (RGBA, transparent background, frames centred, feet on rows 28-30)
- **Approval:** 2026-11-11, project owner (delegated decision to Claude Code), recorded in `peter_design.json` → `runtimeSprites`
- **Status:** `INTEGRATED`

## 2c. Pipeline B Art (integrated + awaiting review)

### `MOB_SHADE_001` – Temporal Shade float loop (v2) — INTEGRATED

- **Generator:** `scripts/author-shade-sprites.js` · **Spec:** [`docs/art/SHADE_DESIGN.md`](docs/art/SHADE_DESIGN.md) (written spec only; no concept image exists)
- **File:** `art-source/enemies/temporal_shade/generated/approved/shade_float_v2.png` → runtime `public/assets/enemies/shade_float.png` (texture `enemy_fracture`, anim `enemy_fracture_idle`) (128 × 32, 4 frames, 6 FPS) · preview ×8 in `previews/`
- **Content:** hooded legless wraith, cerulean pinpoint eyes, jagged carmine/rose fracture core that pulses, elongated clawed arms, mist tail tapering 4 px above the ground (§4 levitation). 7 colours (§3 + one derived rim tone).
- **Validation:** PASSED (ground-contact warning is expected — the Shade hovers).
- **Status:** `INTEGRATED` — owner approved 2026-11-11. Replaced `MOB_SHADE_000_TMP` (placeholder file removed).

### `NPC_ELDER_001` – Elder Chronographer idle (v3) — INTEGRATED

- **Generator:** `scripts/author-elder-sprites.js` · **Spec:** [`docs/art/ELDER_DESIGN.md`](docs/art/ELDER_DESIGN.md) (written spec only)
- **File:** `art-source/npcs/elder/generated/approved/elder_idle_v3.png` → runtime `public/assets/npcs/elder_idle.png` (texture `npc_elder`, anim `npc_elder_idle`) (128 × 32, 4 frames facing down, 4 FPS) · preview ×8 in `previews/`
- **Content:** midnight-indigo cowl, amber-gold eyes, snow-white hair and chest-length beard, gold-embroidered stole, slate cassock with leather girdle and bronze hem, scroll satchel at the right hip, astrolabe staff in the left hand with a pulsing amber shard; breathing on frames 3-4. v3 = owner feedback on v2 "make him less heavy-set": shoulders, cassock and hem 2-3 px narrower per side.
- **Validation:** PASSED.
- **Status:** `INTEGRATED` — owner approved v3 2026-11-11. Replaced `NPC_ELDER_000_TMP` (placeholder file removed).

### `ENV_SANCTUARY_001` – Shattered Antechamber tileset (v2) — INTEGRATED

- **Generator:** `scripts/author-sanctuary-tileset.js` · **Spec:** [`docs/art/ENVIRONMENT_GUIDE.md`](docs/art/ENVIRONMENT_GUIDE.md)
- **File:** `art-source/environment/sanctuary/generated/approved/sanctuary_tileset_v2.png` → runtime `public/assets/tilesets/dungeon_tileset.png` (128 × 128, 4 × 4 tiles of 32 px) · previews: tileset ×4 and the real prologue map rendered with it (`sanctuary_room_v2.png`)
- **Tile indices unchanged** (map-compatible): 0 void, 1 slate floor, 2 engraved chronal pavement, 3 wall top, 4 wall face (bronze cornice), 5 ruined pillar, 6 chrono crystal, 7 Altar of Moments; new 8 cracked fracture floor, 9 floor variant; 10-15 reserved. Props 5-7 have transparent backgrounds.
- **Validation:** PASSED (corner/ground warnings are expected for opaque floor tiles).
- **Status:** `INTEGRATED` — owner approved 2026-11-11 ("rất tốt"). Map Ground layer now uses variant (GID 10) and fracture tiles (GID 9, clustered east of the Shade) via `scripts/generate-map.js`.

### `ENV_SANCTUARY_002` – Tileset v3: prologue point-of-interest props — INTEGRATED

- **Generator:** `scripts/author-sanctuary-tileset.js` (tiles 0-9 unchanged from the approved v2) · placements in `scripts/map-props.js`
- **File:** `art-source/environment/sanctuary/generated/approved/sanctuary_tileset_v3.png` → runtime `public/assets/tilesets/dungeon_tileset.png` · previews: `sanctuary_tileset_v3_x4.png`, `sanctuary_room_v3.png` (room with the props placed)
- **New tiles:** 10 Stele of the Six Authorities (3,4) · 11 Frozen Astrolabe (20,4) · 12 Cracked Reliquary (7,2) · 13 Sealed Threshold Gates in the north wall (12,1) · 14 Torn Journal Leaf on the engraved floor (14,12). Stele and astrolabe replace the two northern crystals; the southern crystals stay (SE one is the Residual Rift Echo).
- **Status:** `INTEGRATED` — owner approved 2026-11-11; `generate-map.js` applies `map-props.js` (supersedes v2 at runtime; v2 kept in `approved/` for history).

### `CHAR_PETER_003` – Peter combat sheets: attack / hurt / temporal_sight (v1) — INTEGRATED

- **Generator:** `scripts/author-peter-sprites.js` (default run emits only these; approved idle/walk regenerate byte-identically via `--sheets=idle,walk`)
- **Approved files:** `art-source/characters/peter/generated/approved/peter_attack_v1.png` (192 × 128, 6 frames × 4 dirs), `peter_hurt_v1.png` (64 × 128, 2 × 4), `peter_temporal_sight_v1.png` (128 × 128, 4 × 4) · previews ×6 in `generated/candidates/previews/`
- **Runtime files:** `public/assets/characters/peter/peter_attack.png`, `peter_hurt.png`, `peter_temporal_sight.png`
- **Content:** attack = wind-up, raise, strike with a cerulean slash crescent, follow-through, recover, rest (full arm poses in profile; blade + arc around the resting hand front/back). Hurt = recoil (eyes shut) + white hit flash. Temporal Sight = blade raised, eyes kindled cerulean, rotating ring of chronal motes.
- **In engine:** `CombatScene` shows Peter in profile (`peter_idle_right`); Attack plays `peter_attack_right`, Skill plays `peter_temporal_sight_right` then the strike, enemy hits play `peter_hurt_right`.
- **Status:** `INTEGRATED` — owner approved 2026-11-11. The run sheet stays `CHAR_PETER_000_TMP` (no run mechanic yet).

### `UI_SET_001` – Panel frame, menu cursor, hit spark (v1) — INTEGRATED

- **Generator:** `scripts/author-ui-assets.js` · **Approved files:** `art-source/ui/generated/approved/` — `ui_frame_v1.png` (48 × 48 nine-slice, 16 px corners), `ui_cursor_v1.png` (2 × 16 px pulse), `hit_spark_v1.png` (4 × 16 px burst, near-white for runtime tinting) · previews in `generated/candidates/previews/`
- **Runtime files / keys:** `public/assets/ui/ui_frame.png` (image `ui_frame`), `public/assets/ui/ui_cursor.png` (spritesheet `ui_cursor`, anim `ui_cursor_pulse`), `public/assets/effects/hit_spark.png` (spritesheet `hit_spark`, anim `hit_spark_burst`)
- **In engine:** hit spark used in `CombatScene` (cerulean on Peter's hits, carmine on enemy hits). Panel frame + cursor: integration pending (T-26).
- **Status:** `INTEGRATED` — owner approved 2026-11-11. Replaced `UI_FRAME_000_TMP`, `UI_CURSOR_000_TMP`, `FX_SPARK_000_TMP`.

### `ENV_COASTAL_001` – Coastal tileset v1 (Prologue v2: Khánh Hòa town + Peter's room) — INTEGRATED

- **Generator:** `scripts/author-coastal-tileset.js` · layouts shared with the map generator: `scripts/coastal-layout.js`
- **File:** `art-source/environment/coastal/generated/approved/coastal_tileset_v1.png` → runtime `public/assets/tilesets/coastal_tileset.png`; maps `map_peters_room.json`, `map_coastal_town.json` from `scripts/generate-coastal-maps.js` (256 × 160, 8 × 5 tiles of 32 px) · previews: `coastal_tileset_v1_x4.png`, `coastal_town_v1.png` (planned 28×18 town), `coastal_room_v1_x2.png` (planned 14×10 room)
- **Tiles:** 0-15 walkable ground (sand, shells, path, grass, gạch tàu brick, wood floors, pier, wet shore, child's sandals, rug, empty-lot foundation, threshold, footprints, pebbles); 16-39 walls layer (sea, lime wall, shuttered window, door, roof, eave, room wall/beam, palm trunk/crown, thúng chai, bánh căn stall, red plastic stool, net pile, frozen-star well, stone fence, bed ×2, desk with equations + torn notebook, bookshelf, brass-key table, photo with a scraped-away figure, sea window, Stopped Watch nightstand). Collision range GID 17-40.
- **Validation:** PASSED.
- **Status:** `INTEGRATED` — owner approved 2026-11-11 (T-30).

### `ENV_WILDS_001` – Wilds tileset v1 (Prologue v2: Forgotten Forest + Old Lighthouse headland) — INTEGRATED

- **Generator:** `scripts/author-wilds-tileset.js` (helpers `scripts/pixel-art/tile-kit.js`) · layouts: `scripts/wilds-layout.js`
- **File:** `art-source/environment/wilds/generated/approved/wilds_tileset_v1.png` → runtime `public/assets/tilesets/wilds_tileset.png`; maps `map_forgotten_forest.json`, `map_old_lighthouse.json` from `scripts/generate-wilds-maps.js` (256 × 160, 8 × 5 tiles) · previews: `wilds_tileset_v1_x4.png`, `wilds_forest_v1.png` (planned 26×18 forest), `wilds_lighthouse_v1.png` (planned 24×18 headland)
- **Tiles:** 0-15 ground (loam, moss, trail, mud, fog, violet-ash fracture, roots, basalt column tops, lichen, salt grass, steps, flagstone, tide pool, foam rock, six-rune stone hatch, light floor); 16-39 walls (night sea, cliff, basalt columns, canopy, mangrove, elder tree, fallen log, thicket, ferns, monolith with a scraped-away mark, chrono crevice, ash crystals, half-erased tree, lighthouse 2×3, brass lens with lever, UNWRITTEN tablet, gate of light, frozen wave, broken railing). Collision range GID 17-40.
- **Validation:** PASSED.
- **Status:** `INTEGRATED` — owner approved 2026-11-11 (T-31).

### `NPC_VENDOR_BA_001` – Cô Ba, bánh căn vendor (v1) — INTEGRATED

- **Generator:** `scripts/author-npc-sprites.js` · **File:** `art-source/npcs/vendor_ba/generated/approved/vendor_ba_idle_v1.png` → `public/assets/npcs/vendor_ba_idle.png` (key `npc_vendor_ba`, anim `npc_vendor_ba_idle`) (128 × 32, 4 frames × 32 px, facing down) · preview ×8
- **Content:** low bun, khăn rằn, light-brown áo bà ba with buttons, black trousers, ladle; idle = breathing + stirring (a drip of batter on frame 3). Slender build by design.
- **Validation:** PASSED. **Status:** `INTEGRATED` — owner approved 2026-11-12; NPC behind her stall in `map_coastal_town`.

### `BOSS_SENTINEL_001` – The Drowned Sentinel (v1) — INTEGRATED

- **Generator:** `scripts/author-sentinel-sprites.js` · **File:** `art-source/enemies/sentinel/generated/approved/sentinel_v1.png` → `public/assets/enemies/sentinel.png` (key `boss_sentinel`, 64×64, anim `boss_sentinel_idle`; combat `spriteScale` 1.6) (320 × 64, 5 frames × 64 px) · preview ×4
- **Content:** verdigris bronze armour, barnacles, kelp, fin crest, cold cyan eyes in the visor, broken halberd, a shell of frozen sea-water around him. Frames 0-3 idle (film shimmer, kelp sway, 1 px bob); frame 4 released (kneeling, head bowed, film shattered into rising motes).
- **Validation:** PASSED (the validator's centring warning assumes 32 px frames and does not apply to 64 px).
- **Status:** `INTEGRATED` — owner approved 2026-11-12 (encounter placed with the boss mechanic, T-34).

### `NPC_FISHERMAN_SAU_001` – Ông Sáu, old fisherman (v1) — INTEGRATED

- **Generator:** `scripts/author-npc-sprites.js` (`--sheets=fisherman_sau`) · **File:** `art-source/npcs/fisherman_sau/generated/approved/fisherman_sau_idle_v1.png` → `public/assets/npcs/fisherman_sau_idle.png` (key `npc_fisherman_sau`, anim `npc_fisherman_sau_idle`) (128 × 32, 4 frames) · preview ×8
- **Content:** nón lá, grey stubble, faded blue shirt, sitting cross-legged mending a green net with orange floats; the wooden shuttle moves through the mesh, slight breathing.
- **Validation:** PASSED. **Status:** `INTEGRATED` — owner approved 2026-11-12 (T-36).

### `NPC_FORGOTTEN_CHILD_001` – The forgotten child (v1) — INTEGRATED

- **Generator:** `scripts/author-npc-sprites.js` (`--sheets=forgotten_child`) · **File:** `art-source/npcs/forgotten_child/generated/approved/forgotten_child_idle_v1.png` → `public/assets/npcs/forgotten_child_idle.png` (key `npc_forgotten_child`, anim `npc_forgotten_child_flicker`; shown as a map `vision`) (64 × 32, 2 frames) · preview ×8
- **Content:** small barefoot child, faceless and semi-transparent, ~16 % of pixels missing (different per frame, so the figure flickers) with cold chronal motes — Residual Existence, not a ghost story.
- **Validation:** PASSED. **Status:** `INTEGRATED` — owner approved 2026-11-12 (T-36).

### `CHAR_PETER_004` – Peter idle + walk, empty-handed (v1) — INTEGRATED

- **Generator:** `scripts/author-peter-sprites.js` (`--sheets=idle_unarmed,walk_unarmed`, the default) — same poses as the approved v3 idle/walk with the Broken Blade removed (front/back use the existing bare views; the side arm is the same arm without the blade).
- **Files:** `art-source/characters/peter/generated/approved/peter_idle_unarmed_v1.png` (128 × 128), `peter_walk_unarmed_v1.png` (192 × 128) → `public/assets/characters/peter/peter_idle_unarmed.png`, `peter_walk_unarmed.png` (keys `peter_idle_unarmed`, `peter_walk_unarmed`)
- **Why:** Prologue v3 — Peter is an ordinary watch repairer until the Elder throws him the blade mid-battle.
- **Validation:** PASSED; approved idle/walk/attack/hurt/temporal_sight regenerate byte-identically.
- **Status:** `INTEGRATED` — owner approved 2026-11-12 (T-39); used until `has_broken_blade`.

### `ENV_SUNKEN_001` – Sunken tileset v1 (Chapter 1 underwater ruins + Bell Sanctum)

- **Generator:** `scripts/author-sunken-tileset.js` — tiles 0-15 are the approved sanctuary tiles (`ENV_SANCTUARY_002`) recoloured colour-by-colour into a deep-sea palette (mossy teal stone, verdigris, green-cyan phosphor, coral instead of violet); tiles 16-23 are new: chime pillar, cracked Time Bell, coral, kelp, shallow pool, seabed silt, unnamed watch case, Continuum Seal.
- **File:** `art-source/environment/sunken/generated/approved/sunken_tileset_v1.png` → `public/assets/tilesets/sunken_tileset.png` (128 × 192, 4 × 6 tiles) · previews: tileset ×4, `sunken_corridors_v1.png`, `bell_sanctum_v1.png`
- **Why:** owner asked for a different tone for the two underwater maps (they shared the Prologue sanctuary look).
- **Validation:** PASSED. **Status:** `INTEGRATED` — owner approved 2026-11-12 (T-44).

### Chapter 1 art batch (T-44)

- `ENV_COASTAL_002` — `coastal_tileset_v2` (256 × 192): tiles 0-39 byte-identical to the approved v1; new 40 shrine with a smudged photo, 41 rotten letter box, 42 bell post, 43 dinner tray for two. `scripts/author-coastal-tileset.js` → `public/assets/tilesets/coastal_tileset.png`.
- `ENV_WILDS_002` — `wilds_tileset_v2` (256 × 192): tiles 0-39 byte-identical to v1; new 40 broken sundial, 41 tide marker post with a frozen waterline, 42 bronze tide wheel. `scripts/author-wilds-tileset.js` → `public/assets/tilesets/wilds_tileset.png`.
- `NPC_OLD_KEEPER_001` — old lighthouse keeper, 32 × 32 × 4 (hooded faded raincoat, storm lantern flickering). `scripts/author-ch1-characters.js` → `public/assets/npcs/old_keeper_idle.png` (key `npc_old_keeper`).
- `MOB_DRIFTER_001` — The Drowned Drifter, 32 × 32 × 4 float (translucent seawater figure, kelp, glowing core) → `public/assets/enemies/drifter_float.png` (key `enemy_drifter`).
- `BOSS_BELLKEEPER_001` — The Sunken Bellkeeper, 64 × 64 × 5 (frames 0-3 idle with light through the bell's crack; 4 kneeling, bell set down, motes rising) → `public/assets/enemies/bellkeeper.png` (key `boss_bellkeeper`).
- Files in `art-source/{environment,npcs,enemies}/…/generated/approved/`. **Validation:** all PASSED. **Status:** `INTEGRATED` — owner approved 2026-11-12 (T-44).

### `ENV_SUNKEN_002` – Sunken tileset v2 (Chapter 1 hidden mirror cache)

- **Generator:** `scripts/author-sunken-tileset.js` (VERSION v2) — tiles 0-23 byte-identical to the approved v1; new 24 bronze mirror (dim), 25 mirror aligned (glass full of light), 26 / 27 light beam east-west / north-south, 28 light cache sealed, 29 light cache open.
- **File:** `art-source/environment/sunken/generated/approved/sunken_tileset_v2.png` → `public/assets/tilesets/sunken_tileset.png` (128 × 256) · previews: tileset ×4, `mirror_cache_mock_v2.png`.
- **Validation:** PASSED. **Status:** `INTEGRATED` — owner approved 2026-11-13 (T-46); placed in the sunken corridors (mirrors 1-3, light cache), lit by `tileSwaps`.

## 3. Active Placeholder Registry

The following assets are currently integrated into the engine strictly as **temporary placeholders**. They are not approved final art:

### `CHAR_PETER_000_TMP`

- **Object Name:** Peter Runtime Spritesheet — run (Procedural Placeholder; idle + walk replaced by `CHAR_PETER_002`, combat sheets by `CHAR_PETER_003`)
- **File Path:** `public/assets/characters/peter/`
- **Design Doc Ref:** [`docs/art/PETER_DESIGN.md`](docs/art/PETER_DESIGN.md)
- **Status:** `PLACEHOLDER_TEMPORARY`
- **Generator:** `scripts/generate-peter-sprites.js` (Procedural canvas-buffer synthesis — not AUTOMATIC1111 output, not user-approved art)
- **Frame Size:** 32 × 32 px; rows = 4 directions (down, up, left, right)
- **Sheets:**
  | File            | Frames / direction | Sheet size |
  | --------------- | ------------------ | ---------- |
  | `peter_run.png` | 6                  | 192 × 128  |
- **Replacement Path:** Candidate sheets (Pipeline A or B) → `art-source/characters/peter/generated/candidates/` → validation → user approval → `generated/approved/` → replaces these files.

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

### Chapter 2 characters (T-53)

- **Generator:** `scripts/author-ch2-characters.js` (Pipeline B, deterministic pixel rules, no image model).
- `NPC_LYRA_001` — Lyra, rebel vanguard, 32 × 32 × 4 idle (breath, scarf in the wind): chin-length black hair, leather armour with brass straps, red scarf, short sword → `art-source/npcs/lyra/generated/candidates/lyra_idle_v1.png`.
- `NPC_PRAETOR_001` — The Exiled Praetor, 32 × 32 × 4 idle (stylus tapping): white hair and beard, golden blindfold pushed up, torn toga with a purple stripe → `art-source/npcs/exiled_praetor/generated/candidates/exiled_praetor_idle_v1.png`.
- `MOB_AUTOMATON_001` — Imperial Automaton, 32 × 32 × 4 walk: brass body, one red eye slit, tall red scutum held in front → `art-source/enemies/imperial_automaton/generated/candidates/imperial_automaton_walk_v1.png`.
- `MOB_ENFORCER_001` — Causality Enforcer, 32 × 32 × 4 stance (frame 2 lunges): violet light armour, plumed steel helmet, rapier, cape → `art-source/enemies/causality_enforcer/generated/candidates/causality_enforcer_v1.png`.
- `BOSS_VERDICT_001` — The Imperial Verdict, 64 × 64 × 5 (0-3 idle: scales sway, sword flames, amber core; 4 kneeling, scales broken, sword lowered) → `art-source/enemies/imperial_verdict/generated/candidates/imperial_verdict_v1.png`.
- Previews ×8 (×4 for the boss) in each `previews/` folder. **Validation:** all PASSED. **Status:** `APPROVED` by the owner 2026-11-13 — files in `generated/approved/`, deployed to `public/assets/npcs/{lyra_idle,exiled_praetor_idle}.png` and `public/assets/enemies/{imperial_automaton,causality_enforcer,imperial_verdict}.png` (keys `npc_lyra`, `npc_exiled_praetor`, `enemy_imperial_automaton`, `enemy_causality_enforcer`, `boss_imperial_verdict`); placed in the maps with T-52.

### Chapter 3 characters (T-58) – candidates

- **Generator:** `scripts/author-ch3-characters.js` (Pipeline B, deterministic pixel rules, no image model).
- `NPC_NERIS_001_CAND` — Neris, the nameless librarian, 32 × 32 × 4 idle (page turn, blink): side braid, ash-grey tunic with faint blue embroidery, satchel with a reading lens, open book → `art-source/npcs/neris/generated/candidates/neris_idle_v1.png`.
- `NPC_KING_ALDEN_001_CAND` — King Alden, 32 × 32 × 4 idle (chalice trembling): on a stone throne, crown slipping, faded red robe with gold trim, hand at his temple → `art-source/npcs/amnesiac_king/generated/candidates/amnesiac_king_idle_v1.png`.
- `MOB_MEMORY_WRAITH_001_CAND` — Memory Wraith, 32 × 32 × 4 float: violet hooded cloak tapering into a wisp, cyan eyes in the void, memory motes → `art-source/enemies/memory_wraith/generated/candidates/memory_wraith_v1.png`.
- `MOB_THOUGHT_EATER_001_CAND` — Thought Eater, 32 × 32 × 4 crawl: low six-legged beast, violet crystal shards on its back, toothed maw → `art-source/enemies/thought_eater/generated/candidates/thought_eater_v1.png`.
- `MOB_HOLLOW_ARCHIVIST_001_CAND` — Hollow Archivist, 32 × 32 × 4 idle: ash-grey robe with an empty hood (a faint light flickers inside), scroll tags, staff of bronze archive tubes → `art-source/enemies/hollow_archivist/generated/candidates/hollow_archivist_v1.png`.
- `BOSS_FACELESS_KEEPER_001_CAND` — The Keeper Without a Face (mid-boss), 48 × 48 × 5 (0-3 idle; 4 defeated, mirror cracked, blade dropped): grey shroud, a flat mirror for a face, mirror-shard blade → `art-source/enemies/faceless_keeper/generated/candidates/faceless_keeper_v1.png`.
- `BOSS_NAMELESS_CHOIR_001_CAND` — The Nameless Choir, 64 × 64 × 5 (0-3 idle, ghost faces orbit and sing; 4 dissolving): floating black crystal with a cyan core → `art-source/enemies/nameless_choir/generated/candidates/nameless_choir_v1.png`.
- Previews in each `previews/` folder. **Validation:** all PASSED. **Status:** `CONCEPT_PENDING_APPROVAL`.
