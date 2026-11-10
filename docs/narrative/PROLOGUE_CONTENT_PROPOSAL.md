# CHRONO – Prologue Environmental Narrative & Pacing Proposal (T-21)

**Document Version:** 1.0.0  
**Status:** PROPOSED — Awaiting Project Owner Review  
**Target Scope:** Prologue Vertical Slice (`prologue_map.json`, 24×18 tiles, single room)  
**Target Playtime:** 10 – 15 Minutes (per [GDD.md](../../GDD.md) §3)  
**Governing Canon References:** [docs/PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) §5, [LORE.md](../../LORE.md), [GDD.md](../../GDD.md)

---

## 1. Design Philosophy & Canon Guardrails

Currently, a straight playthrough of the Shattered Antechamber (Awakening $\rightarrow$ Talk to Elder $\rightarrow$ Inspect Altar $\rightarrow$ Defeat Temporal Shade $\rightarrow$ Elder Farewell) takes roughly **3 to 4 minutes**. To reach the GDD target of **10 – 15 minutes** without adding new maps or expository cutscenes, this proposal enriches the existing **24×18 tile room** using **environmental storytelling** ([docs/PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) §5.3):

1. **Peter's True Identity Remains Strictly Unwritten (`CONFIRMED CANON`):**
   - No interactable, journal page, or NPC line reveals whether Peter is a mortal traveler, a vessel construct, or an aspect of a fallen authority. His past before waking in the Shattered Antechamber remains an environmental mystery.
2. **Kuro, the Forgotten One is Only Foreshadowed (`CONFIRMED CANON`):**
   - Kuro is never named directly in the Prologue or shown in person. Instead, players piece together unsettling traces of an entity from the **erased hours and discarded possibilities** deliberately chiseling away the Sanctuary's records.
3. **The Six Divine Authorities as Architectural Motifs (`CONFIRMED CANON`):**
   - Inscriptions and broken pillars reference the six cosmic facets (**Origin, Continuum, Causality, Memory, Possibility, Finality**) without lore-dumping.
4. **Zero New Engine Systems Required:**
   - Every proposed interactable and the optional side quest use existing mechanics (`InteractionSystem`, `DialogueSystem` multi-choice branching, `GameSession` flags, `completeOnFlag`, `followUpQuestId`, and `rewards` in `quests.json`).

---

## 2. Canonical vs. Proposed Classification Matrix

To maintain strict separation between established canon and new design proposals:

| Element                                                                                        | Classification      | Source / Notes                                                                    |
| ---------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------- |
| **Cataclysm of the Divided Hour & Divine Chronometer**                                         | **CONFIRMED CANON** | [LORE.md](../../LORE.md) §1, [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) §5.1     |
| **Peter's Signature Relics** (_Broken Blade_, _Stopped Watch_, _Torn Notebook_)                | **CONFIRMED CANON** | [AGENTS.md](../../AGENTS.md) §4, [PETER_DESIGN.md](../art/PETER_DESIGN.md)        |
| **Peter's True Origin / Identity Left Unwritten**                                              | **CONFIRMED CANON** | [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) §5.2                                  |
| **Kuro, the Forgotten One** (Antagonist of discarded timelines)                                | **CONFIRMED CANON** | [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) §5.2 (Foreshadowed only in Prologue)  |
| **The Six Divine Authorities** (_Origin, Continuum, Causality, Memory, Possibility, Finality_) | **CONFIRMED CANON** | [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) §5.2                                  |
| **Elder Chronographer & Altar of Moments**                                                     | **CONFIRMED CANON** | [LORE.md](../../LORE.md) §3–4, `dialogue.json`                                    |
| **7 Environmental Interactables in the 24×18 Antechamber**                                     | **PROPOSED**        | Detailed in Section 4 below                                                       |
| **Optional Side Quest:** _"Remnants of the Divided Hour"_ (`quest_prologue_remnants`)          | **PROPOSED**        | Detailed in Section 5 below                                                       |
| **Level Cap 3 Progression Alignment (+40 EXP Optional Total)**                                 | **PROPOSED**        | Allows thorough explorers to reach **Lv. 3 (120 EXP)** before the Prologue ending |

---

## 3. Spatial Layout in the Existing 24×18 Map (`prologue_map.json`)

All coordinates below are verified against the collision layer (`Walls`) of [public/assets/maps/prologue_map.json](../../public/assets/maps/prologue_map.json) so that no interactable overlaps solid perimeter walls (`y = 0..1`, `y = 17`, `x = 0`, `x = 23`) or existing entities.

### Existing Landmarks (Reference)

- **Peter Default Spawn:** Tile `(12, 10)`
- **Elder Chronographer:** Tile `(9, 8)`
- **Altar of Moments:** Tile `(11, 5)` (Tile ID `8` in `Walls` layer)
- **Temporal Shade (Rift Encounter):** Tile `(16, 9)`
- **Inner Ruined Pillars (Tile ID `6`):** `(5, 5)`, `(18, 5)`, `(5, 10)`, `(18, 10)`, `(5, 14)`, `(18, 14)`
- **Corner Ruinbraziers / Pedestals (Tile ID `7`):** `(3, 4)`, `(20, 4)`, `(3, 14)`, `(20, 14)`

### Spatial Map Overview (24×18 Grid)

```
y\x 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22
02  .  .  .  .  .  .  [I-5] .  .  .  .  .  [I-6] .  .  .  .  .  .  .  (North Wall Arch)
04  .  . [I-1]  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . [I-4]  .  (NW / NE Pedestals)
05  .  .  .  . [P] .  .  .  .  . [ALTAR].  .  .  .  . [P] .  .  .  .  (Upper Pillars & Altar)
08  .  .  .  .  .  .  .  . [ELDER].  .  .  .  .  .  .  .  .  .  .  .  (Sanctuary Ring)
09  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . [SHADE].  .  .  .  .  (Eastern Rift)
10  .  .  .  . [I-2]  .  .  .  .  . [SPAWN].  .  .  . [P] .  .  .  .  (Mid Pillars & Spawn)
12  .  .  .  .  .  .  .  .  .  .  .  .  . [I-3]  .  .  .  .  .  .  .  (SE Floor Near Rift)
14  .  . [#] . [P] .  .  .  .  .  .  .  .  .  .  .  . [P] . [I-7]  .  (SW / SE Pedestals)
```

---

## 4. Proposed Environmental Interactables (7 Points of Interest)

Each interactable uses multi-node dialogue with inspection choices (`[Read closely]`, `[Compare with your Stopped Watch]`, `[Touch the fracture]`) to encourage deliberate reading and contemplation.

---

### I-1 · Stele of the Six Authorities _(Bia Khắc Sáu Quyền Năng)_

- **Classification:** Lore / Environmental Inscription (`CONFIRMED CANON` authorities + `PROPOSED` stele text)
- **Tile Position:** `(3, 4)` — Northwest pedestal (`Tile ID 7`), approachable from `(3, 5)` or `(4, 4)` (Radius `48 px`).
- **Prompt:** `[E] Read Stele of the Six Authorities`
- **Session Flag Set:** `inspected_stele_authorities`
- **Item / EXP Reward:** **None** (Pure environmental lore; advances optional quest objective 1).
- **Draft Dialogue (`stele_six_authorities`):**
  > **Speaker:** `Weathered Basalt Stele`  
  > **Line 1:** _"Six silver reliefs encircle a shattered dial, each carved with a tenet of the unbroken continuum:"_  
  > **Line 2:** _"ORIGIN kindles the first spark. CONTINUUM bears the river forward. CAUSALITY binds the seed to the harvest."_  
  > **Line 3:** _"MEMORY preserves what has passed. POSSIBILITY branches into the unseen. FINALITY closes the last hour in quiet grace."_  
  > **Choice 1:** `[Examine the gouged seventh mark at the bottom]` $\rightarrow$ `stele_six_authorities_defaced`  
  > **Choice 2:** `[Step back]` $\rightarrow$ `null`
- **Follow-up Node (`stele_six_authorities_defaced`):**
  > **Speaker:** `Weathered Basalt Stele`  
  > **Line 1:** _"Beneath the six reliefs, someone has violently chiseled a hollow crescent into the stone—as if an erased seventh hour tried to carve its own name into the record."_  
  > **Line 2:** _"Cold ash clings to the groove. Whatever hand left this mark did not belong to the remembered timeline."_ _(Subtle Kuro foreshadowing)_

---

### I-2 · Defaced Pillar of Memory & Possibility _(Cột Đá Bị Xóa Khắc)_

- **Classification:** Environmental Mystery / Kuro Foreshadowing (`PROPOSED`)
- **Tile Position:** `(5, 10)` — West-central fluted pillar (`Tile ID 6`), approachable from `(6, 10)` or `(5, 11)` (Radius `48 px`).
- **Prompt:** `[E] Inspect Defaced Fluted Pillar`
- **Session Flag Set:** `inspected_defaced_pillar`
- **Item / EXP Reward:** **None** (Advances optional quest objective 1).
- **Draft Dialogue (`pillar_memory_erasure`):**
  > **Speaker:** `Defaced Sanctuary Pillar`  
  > **Line 1:** _"Monastic chronicles once spiraled down this column, recording the names of travelers who passed through the Sanctuary before the Cataclysm."_  
  > **Line 2:** _"Half the names have been scraped away—not by falling masonry, but by deliberate, methodical strokes that leave the stone humming with static."_  
  > **Choice 1:** `[Hold your Stopped Watch near the erased names]` $\rightarrow$ `pillar_watch_resonance`  
  > **Choice 2:** `[Leave it be]` $\rightarrow$ `null`
- **Follow-up Node (`pillar_watch_resonance`):**
  > **Speaker:** `Peter's Thoughts`  
  > **Line 1:** _"For a heartbeat, the frozen second hand of my watch trembles against the glass, pulled toward the blank stone."_  
  > **Line 2:** _"A whisper echoes from the missing letters: 'What the continuum discards does not vanish. It waits in the dark between ticks.'"_

---

### I-3 · Loose Page from a Torn Notebook _(Trang Sổ Tay Rách Trên Sàn Đá)_

- **Classification:** Protagonist Relic Tie-In (`CONFIRMED CANON` relic + `PROPOSED` page discovery)
- **Tile Position:** `(14, 12)` — Open stone floor southeast of Peter's spawn, along the path toward the Temporal Shade's rift (Radius `44 px`).
- **Prompt:** `[E] Pick up Torn Journal Leaf`
- **Session Flag Set:** `inspected_torn_page`
- **Item / EXP Reward:** **None** (Advances optional quest objective 2; strictly avoids revealing Peter's identity).
- **Draft Dialogue (`notebook_loose_leaf`):**
  > **Speaker:** `Torn Journal Leaf`  
  > **Line 1:** _"A single vellum leaf lies caught against a cracked floor tile. The paper grain and ink match the Torn Notebook strapped to your hip."_  
  > **Line 2:** _"The margin is filled with rapid temporal equations calculating the decay rate of a local rift—and a warning underlined twice:"_  
  > **Line 3:** _"'Do not trust the memory that returns first. When the hour divides, the anchor must hold even if the name is lost.'"_  
  > **Choice 1:** `[Compare the handwriting with your notebook]` $\rightarrow$ `notebook_handwriting_check`  
  > **Choice 2:** `[Slip the page back between the leather covers]` $\rightarrow$ `null`
- **Follow-up Node (`notebook_handwriting_check`):**
  > **Speaker:** `Peter's Thoughts`  
  > **Line 1:** _"The slant of the numerals is unmistakably mine. Yet I have no memory of standing in this hall to write them."_  
  > **Line 2:** _"Was I charting this sanctuary before the Fracture—or is this a warning from a turn of the glass that has already been erased?"_

---

### I-4 · Frozen Astrolabe Mechanism _(Cỗ Máy Tinh Bàn Ngưng Đọng)_

- **Classification:** Interactive Chronal Object (`CONFIRMED CANON` item `ancient_gear` + `PROPOSED` interaction)
- **Tile Position:** `(20, 4)` — Northeast corner mechanism pedestal (`Tile ID 7`), approachable from `(19, 4)` or `(20, 5)` (Radius `48 px`).
- **Prompt:** `[E] Examine Frozen Astrolabe`
- **Session Flag Set:** `inspected_frozen_astrolabe`
- **Item / EXP Reward:** Grants **`1× Ancient Gear`** (`ancient_gear` from `items.json`, _first time only_ via flag check `claimed_astrolabe_gear`). No EXP.
- **Draft Dialogue (`astrolabe_inspection`):**
  > **Speaker:** `Frozen Brass Astrolabe`  
  > **Line 1:** _"An intricate brass astrolabe hangs suspended half an inch above its stone plinth, locked in a pocket of stagnant time."_  
  > **Line 2:** _"Drops of lamp oil float motionless in the air beside its jammed escapement wheel."_  
  > **Choice 1:** `[Tap the jammed escapement with the Broken Blade's hilt]` $\rightarrow$ `astrolabe_extricate_gear`  
  > **Choice 2:** `[Step away without disturbing the stasis]` $\rightarrow$ `null`
- **Follow-up Node (`astrolabe_extricate_gear`):**
  > **Speaker:** `Frozen Brass Astrolabe`  
  > **Line 1:** _"A cerulean spark leaps from the Broken Blade into the brass rings. The stasis shivers, and a single engraved cog drops free into your palm."_  
  > **Line 2:** _"(Obtained 1× Ancient Gear — engraved with celestial glyphs of the third hour.)"_

---

### I-5 · Cracked Chronal Reliquary _(Hộp Thánh Tích Nứt Vỡ)_

- **Classification:** Tactical Preparation / Scavenging (`CONFIRMED CANON` item `chrono_shard_minor` + `PROPOSED` interaction)
- **Tile Position:** `(7, 2)` — Recessed northern wall alcove west of the central arch (Radius `44 px`).
- **Prompt:** `[E] Search Cracked Reliquary`
- **Session Flag Set:** `inspected_north_reliquary`
- **Item / EXP Reward:** Grants **`1× Minor Chrono Shard`** (`chrono_shard_minor`, _first time only_ via flag check `claimed_reliquary_shard`) to reward players who explore the northern wall before fighting the Shade. No EXP.
- **Draft Dialogue (`reliquary_search`):**
  > **Speaker:** `Cracked Stone Reliquary`  
  > **Line 1:** _"A monastic reliquary box lined with lead and velvet, meant to insulate raw temporal minerals from the air."_  
  > **Line 2:** _"Most of its contents have sublimated into white dust, but one cerulean crystal still pulses warmly at the bottom."_

---

### I-6 · Sealed Threshold Gates _(Cổng Đá Niêm Phong Dẫn Tới Sanctuary Spire)_

- **Classification:** Worldbuilding Landmark (`CONFIRMED CANON` location in [LORE.md](../../LORE.md) §4 + `PROPOSED` inspection dialogue)
- **Tile Position:** `(12, 2)` — Center of the northern wall directly above the Altar of Moments (Radius `48 px`).
- **Prompt:** `[E] Inspect Sealed Threshold Gates`
- **Session Flag Set:** `inspected_threshold_gates`
- **Item / EXP Reward:** **None**.
- **Draft Dialogue (`threshold_gates_inspection`):**
  > **Speaker:** `The Threshold Gates`  
  > **Line 1:** _"Massive twin arches of dark slate seal the ascending causeway toward the inner Sanctuary Spire."_  
  > **Line 2:** _"Hairline fractures of violet-blue light trace the keystone. While the rift in this antechamber remains unstable, the counterweights refuse to budge."_  
  > **Choice 1:** `[Listen at the seam of the stone]` $\rightarrow$ `threshold_gates_echo`  
  > **Choice 2:** `[Step back]` $\rightarrow$ `null`
- **Follow-up Node (`threshold_gates_echo`):**
  > **Speaker:** `The Threshold Gates`  
  > **Line 1:** _"Beyond the sealed arch, a distant pendulum tolls—twelve beats, followed by a thirteenth hollow strike that rings backwards."_

---

### I-7 · Residual Rift Echo _(Vọng Âm Của Vết Nứt Thời Gian)_

- **Classification:** Pre-/Post-Battle Environmental Memory (`PROPOSED`)
- **Tile Position:** `(20, 14)` — Southeast corner brazier/fracture node (`Tile ID 7`), near the eastern rift cluster (Radius `48 px`).
- **Prompt:** `[E] Attune to Residual Rift Echo`
- **Session Flag Set:** `inspected_rift_echo`
- **Item / EXP Reward:** **None** (Advances optional quest objective 3).
- **Draft Dialogue (`rift_echo_attune`):**
  > **Speaker:** `Residual Rift Echo`  
  > **Line 1:** _"A localized eddy of displaced time curls around the ruined brazier, replaying the final seconds before the Cataclysm."_  
  > **Line 2:** _"Two spectral silhouettes flicker in the frost: an Elder Chronographer bolting the inner gate, and a tall shadow parrying a falling shard with an unbroken blade."_  
  > **Choice 1:** `[Reach toward the memory with Temporal Sight]` $\rightarrow$ `rift_echo_vision`  
  > **Choice 2:** `[Break attunement]` $\rightarrow$ `null`
- **Follow-up Node (`rift_echo_vision`):**
  > **Speaker:** `Residual Rift Echo`  
  > **Line 1:** _"As your fingers near the frost, a third presence bleeds into the replay—a silhouette of ink-black static reaching out from an unwritten hour to sever the memory."_  
  > **Line 2:** _"The vision snaps shut, leaving only the smell of ozone and cold iron."_

---

## 5. Proposed Optional Side Quest (`quest_prologue_remnants`)

This optional quest rewards players who investigate the history of the Shattered Antechamber. It uses **only** the existing `QuestSystem` and `GameSession.syncQuestProgress()` features (`completeOnFlag` on objectives, `rewards` claimed once via `claimQuestRewards`).

### Quest Specification (`quests.json` schema compatible)

- **Quest ID:** `quest_prologue_remnants`
- **Title:** `Remnants of the Divided Hour`
- **Trigger:** Started when the player asks the Elder Chronographer a new optional dialogue branch (`"What happened to the records in this hall?"`) OR automatically alongside `quest_prologue_silence`.
- **Objectives (3 `completeOnFlag` objectives):**
  1. `obj_read_stele` — _"Read the Stele of the Six Authorities (`NW corner`)"_ $\rightarrow$ `completeOnFlag: "inspected_stele_authorities"`
  2. `obj_recover_page` — _"Recover the loose leaf from your Torn Notebook (`SE floor`)"_ $\rightarrow$ `completeOnFlag: "inspected_torn_page"`
  3. `obj_attune_echo` — _"Attune to the Residual Rift Echo (`SE corner`)"_ $\rightarrow$ `completeOnFlag: "inspected_rift_echo"`
- **Rewards:**
  - **Experience:** `+40 EXP`
  - **Items:** `["ancient_gear"]`

### Why `+40 EXP` Fits the Prologue Level Curve (`player.json`)

- Current `expThresholds` in `player.json`: **`[0, 50, 120]`** (Level Cap = **Lv. 3**).
- Current mandatory EXP sources:
  - `quest_prologue_awakening`: **+50 EXP** (Player reaches **Lv. 2** at 50 EXP).
  - `enemy_temporal_shade`: **+50 EXP** (100 EXP total).
  - `quest_prologue_silence`: **+30 EXP** (130 EXP total $\rightarrow$ reaches **Lv. 3** only _after_ the battle is already over).
- **Tactical Value of the Optional Side Quest (+40 EXP):**
  - If a thorough player completes `quest_prologue_awakening` (+50 EXP) **and** `quest_prologue_remnants` (+40 EXP) _before_ fighting the Temporal Shade, they sit at **90/120 EXP** with an extra `Minor Chrono Shard` from I-5.
  - Or if they defeat the Shade once, escape/revive, or complete the side quest alongside the main objectives, they comfortably experience **Level 3 (`maxHp: 66, maxMp: 28, attack: 18`)** during the Prologue!

---

## 6. Expanded Elder Chronographer Dialogue Branches (Optional Lore Inquiry)

To support players who want deeper context without forcing mandatory text walls on speedrunners, `npc_elder_greeting` can offer an optional third response:

- **Response Option:** `"Tell me of the Six Authorities and this chamber."` $\rightarrow$ `npc_elder_authorities_lore`
  > **Elder Chronographer:**  
  > _"Before the Great Fracture, our order kept vigil over the six dials of the Divine Chronometer."_  
  > _"Now the dials lie cracked, and something else walks the seams between them—an echo of the hours that were never meant to be."_  
  > _"Look to the steles and the broken pillars around this hall, traveler. Even defaced stone remembers more than a fractured mind."_ (Starts `quest_prologue_remnants` if inactive).

---

## 7. Playtime & Pacing Breakdown (10 – 15 Minute Target)

| Phase / Activity                               | Player Actions                                                                                                                                                                                            | Est. Duration       |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **1. Title & Awakening**                       | Boot, Main Menu, Awakening trigger (`intro_awakening` + location branch), initial orientation & HUD review.                                                                                               | **1.5 – 2.0 min**   |
| **2. Sanctuary Reconnaissance (West Wing)**    | Navigate perimeter, inspect **I-1 (Stele of Six Authorities)** and **I-2 (Defaced Pillar)**, speak with **Elder Chronographer** (main greeting + optional lore inquiry).                                  | **2.5 – 3.5 min**   |
| **3. Northern Alcoves & Altar Ritual**         | Inspect **Altar of Moments** (completes `quest_prologue_awakening` $\rightarrow$ Lv. 2 + notification banners), examine **I-6 (Threshold Gates)** and scavenge **I-5 (Cracked Reliquary)** for +1 Shard.  | **2.0 – 2.5 min**   |
| **4. Eastern Rift Investigation (Side Quest)** | Discover **I-3 (Torn Notebook Leaf)**, free the cog from **I-4 (Frozen Astrolabe)**, attune to **I-7 (Residual Rift Echo)** $\rightarrow$ completes `quest_prologue_remnants` (+40 EXP, +1 Ancient Gear). | **2.5 – 3.5 min**   |
| **5. Satchel Prep, Quick Save & Shade Battle** | Open Satchel (`I`/`B`) to review relics/consumables, Quick Save (`K`), engage **Temporal Shade** in tactical turn-based combat (MP skill management, Defend/Heal, or Altar revival on defeat).            | **2.0 – 3.0 min**   |
| **6. Epilogue & Farewell**                     | Complete `quest_prologue_silence`, return to Elder Chronographer (`npc_elder_farewell`), view `PrologueEndScene` summary.                                                                                 | **1.0 – 1.5 min**   |
| **TOTAL PROLOGUE PLAYTIME**                    | **Complete Narrative & Tactical Vertical Slice**                                                                                                                                                          | **11.5 – 16.0 min** |

---

## 8. Owner Review Checklist (Decisions Needed to Unblock Implementation)

1. **Approve the 7 Interactables (`I-1` through `I-7`)** and their tile coordinates in the 24×18 room?
2. **Approve the Optional Side Quest (`quest_prologue_remnants`)** granting `+40 EXP` and `1× Ancient Gear`?
3. **Approve the Scavenged Consumable in `I-5`** (`+1 Minor Chrono Shard` in the northern reliquary)?
