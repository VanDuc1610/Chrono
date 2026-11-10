# CHRONO – THE FRACTURED DIVINITY

## Game Design Document (GDD)

**Version:** 0.1.0-PROLOGUE  
**Genre:** 2D Single-Player Turn-Based RPG  
**Target Platform:** Web Browsers (Desktop & Tablet)  
**Scope:** Prologue Vertical Slice  
**Art Style:** Original Pixel Art (Cosmic Dark Fantasy)

---

## 1. Executive Summary & Vision

**CHRONO – The Fractured Divinity** is a narrative-driven, single-player 2D retro RPG combining classic top-down exploration with tactical turn-based combat. Players take control of an enigmatic vessel awoken in the aftermath of a cosmic Cataclysm that fractured time itself into discrete temporal anomalies.

The **Prologue Vertical Slice** demonstrates the complete core gameplay loop:

1. Exploring an atmospheric ruined sanctuary.
2. Interacting with NPCs and environmental lore objects via external dialogue data.
3. Managing inventory and tracking quest objectives.
4. Engaging in turn-based combat against fractured entities (Milestone 3).

---

## 2. Core Pillars

1. **Deliberate Exploration:** Handcrafted environments rewarding curiosity with lore shards, hidden relics, and environmental storytelling.
2. **Tactical Turn-Based Combat:** Calculated decision-making where timing, elemental chronal affinities, and resource management matter more than twitch reflexes.
3. **Cohesive Cosmic Atmosphere:** Melancholy beauty, ancient brass clockwork machinery, and crystalline divine fractures set against obsidian ruins.
4. **Clean Modular Architecture:** Built with modern web technologies (Phaser 3, TypeScript, Vite) ensuring instant load times, zero plugins, and seamless cross-platform browser support.

---

## 3. Game Scope: Prologue Vertical Slice

### In Scope for Prologue:

- **Playable Character:** The Vessel (Temporary placeholder sprite in Phase 1; original approved sprite in Phase 2).
- **Environment:** The Shattered Antechamber (A ruined sanctuary featuring stone floors, engraved chronal runes, broken pillars, and the Altar of Moments).
- **Core Loop:**
  - Game boot and title screen.
  - Smooth scene transition into top-down exploration.
  - 4-directional player movement with collision boundaries.
  - Camera following the player smoothly with world constraints.
  - Dialogue interaction with NPC Elder and examination of the Altar.
  - Turn-based battle encounter against a Temporal Shade (Milestone 3).
- **Target Playtime:** 10 – 15 minutes of narrative and tactical gameplay.

### Out of Scope for Prologue:

- Full world overworld map (Reserved for Chapter 1).
- Party member switching or multi-character party management (TBD).
- Complex skill trees and job/class progression (TBD).
- Crafting or gear socketing mechanics (TBD).

---

## 4. Exploration Mechanics

- **Camera Perspective:** 2D top-down orthographic view with 1:1 pixel rendering at 640×360 base resolution (scaled to viewport via `FIT`).
- **Movement:**
  - 4-directional movement (Up, Down, Left, Right) with normalized diagonal speed.
  - Input: Keyboard (WASD / Arrow Keys), Gamepad (TBD), Mobile touch controls (TBD).
  - Walking Speed: 120–140 px/s with instantaneous response.
- **Collisions:**
  - Solid perimeter walls and structural obstacles (pillars, alters, barriers).
  - Footprint-based bounding boxes (`18 × 14 px`) allowing the upper half of the player sprite to overlap vertical walls for natural 2.5D depth sorting.
- **Interactions:**
  - Proximity detection: When within 44–48 px of an interactable, an in-world or HUD prompt appears (`[E] Talk / Inspect`).
  - Pressing the interact key opens dialogue or triggers state changes without hardcoding logic.

---

## 5. Narrative & Dialogue System

- **Data Driven:** Dialogue trees, speaker names, text lines, and choice branches are stored in external JSON (`public/assets/data/dialogue.json`).
- **UI Presentation:** Retro styled dialogue window with speaker label, text typing/pacing (TBD), and continue/close hints.
- **Branching:** Basic response options allowing the player to ask questions or decline interactions.

---

## 6. Combat System (Turn-Based Specification)

_Note: Architectural interfaces established in Milestone 1; Combat Scene implementation scheduled for Milestone 3._

- **Encounter Style:** Visible overworld encounter triggers or scripted map events (Random encounters: TBD).
- **Battle Perspective:** Side-view or front-view 2D turn-based arena (TBD).
- **Turn Order:** Determined by Combatant `speed` stat (Agility/Initiative).
- **Core Actions:**
  1. **Attack:** Basic physical or chronal strike using equipped weapon.
  2. **Skill:** Chrono abilities consuming MP/Chronal Energy (e.g. _Temporal Strike_, _Rewind_).
  3. **Item:** Use restorative or tactical consumables from inventory (e.g. _Minor Chrono Shard_).
  4. **Defend:** Halves incoming damage until next turn and increases evasion.
  5. **Escape:** Attempt to flee back to the overworld (chance based on relative speed).

---

## 7. Inventory & Economy (Specification)

- **Categories:**
  - _Consumables:_ Chrono Shards, Elixirs (Restore HP/MP).
  - _Materials:_ Ancient Gears, Rune fragments (Used for future progression - TBD).
  - _Key Items:_ Broken Chronometer, Sanctuary Emblems (Non-consumable quest items).
- **Stacking:** Consumables stack to 99; materials stack to 50; key items do not stack.

---

## 8. Audio & Music Direction (TBD)

- **Soundtrack:** Ambient, minimalist synth layered with distant clock chimes and low cello tones.
- **Sound Effects:**
  - UI cursor tick and confirmation chime.
  - Footsteps on stone/crystal (TBD).
  - Chrono pulse / resonance hum near altars.
  - Crisp combat impact and shatter effects.

---

## 9. Design Decisions Marked as TBD

- **Turn System Variant:** Strict Round-Robin vs. Continuous Time Bar (CTB / ATB) (TBD).
- **Party Size:** Solo vessel for Prologue; maximum party size in full game (TBD).
- **Level Cap:** Prologue cap = Level 3; Full game cap (TBD).
- **Permadeath / Failure Penalties:** Checkpoint revival at Sanctuary Altar vs. Title reload (TBD).
