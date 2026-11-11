# NARRATIVE & DOCUMENTATION CHANGELOG

**Project:** CHRONO – THE FRACTURED DIVINITY

All changes to narrative canon, documentation architecture, and story files are recorded here.

---

## [1.0.0] – 2026-11-11

### Added

- Created `docs/story/CHRONO_STORY_BIBLE.md` as the unified master narrative reference for the project.
- Decomposed Story Bible into specialized narrative documents:
  - `docs/story/LORE_AND_COSMOLOGY.md`: Chronos, 6 Authorities, Conceptual Erasure, The Interval.
  - `docs/story/CHARACTER_BIBLE.md`: Peter (Unwritten, strict curls lock), Kuro (The Forgotten One), Lyra, Neris, Chronos.
  - `docs/story/STORY_PROLOGUE.md`: The Last Memory, Khanh Hoa setting, Altar of Moments, points of interest.
  - `docs/story/STORY_CHAPTER_01.md`: The Last Sunset (Continuum).
  - `docs/story/STORY_CHAPTER_02.md`: The Empire of False Causality (Causality).
  - `docs/story/STORY_CHAPTER_03.md`: The Kingdom of Forgotten Souls (Memory).
  - `docs/story/STORY_CHAPTER_04.md`: The War Without End (Finality, Kuro's first meeting).
  - `docs/story/STORY_CHAPTER_05.md`: The Garden of Infinite Possibilities (Possibility, The Interval).
  - `docs/story/STORY_CHAPTER_06.md`: The Hour of the Gods (Origin, Celestial Realm, Finale).
  - `docs/story/CANON_AND_OPEN_QUESTIONS.md`: Classification register for CANON, DIRECTION, PROPOSAL, and OPEN.
- Created `docs/gameplay/` specifications:
  - `GAMEPLAY_PILLARS.md`: 7 gameplay pillars.
  - `TEMPORAL_WORLD_DESIGN.md`: Hybrid temporal layers, anchors, continuity rules.
  - `QUEST_AND_DIALOGUE_GUIDE.md`: Data schemas, dialogue effects, story flags.
  - `COMBAT_DESIGN.md`: Turn-based combat, enemy hierarchy, party synergy.
  - `PROGRESSION_DESIGN.md`: Level caps, EXP, items, equipment tiers.
- Created `docs/architecture/` systems:
  - `DOCUMENTATION_AUDIT.md`: Inventory and gap analysis of previous documentation.
  - `DOCUMENTATION_MAP.md`: Precise task-to-document routing table with "Do Not Load" rules.
  - `AGENT_CONTEXT_PROTOCOL.md`: Operating procedures and token-efficiency rules for coding agents.
- Linked and mirrored `docs/implementation/IMPLEMENTATION_ROADMAP.md`.

---

## [1.1.0] – 2026-11-11 · Owner decisions

- **Prologue follows the Story Bible** (`STORY_PROLOGUE.md`): Peter's room in Khánh Hòa → coastal town → Forgotten Forest → Shattered Antechamber → Old Lighthouse / The Drowned Sentinel → UNWRITTEN record. The current playable Antechamber slice is kept and reused as one segment.
- **Game language: Vietnamese** for all in-game text (dialogue, quests, items, UI). Internal ids stay English.
- **Peter's hair:** "short curly hair" — Story Bible §3.1 corrected to match the identity lock (no "short-medium").
- **Opening line** "Awaken, fractured vessel…" replaced: "the vessel" contradicts the Unwritten canon. New line hints at it without revealing it: "Wake... The world has no name for you, and yet you remain."

---

## [1.2.0] – 2026-11-12 · Prologue v3 (owner)

- Peter lives an ordinary life as a **watch repairer** in his grandfather's shop; room objects are mundane.
- A sudden **stop of time** at noon forces the first fight; Peter cannot attack until the **Elder** (his guide) throws him the **Broken Blade** mid-battle; **Temporal Sight** awakens through his grandfather's stopped watch running backwards.
- Ending stays **mysterious**: nobody visibly forgotten; reveal saved for later chapters.
- Details and data contract: `docs/story/PROLOGUE_V3_PROPOSAL.md`.
