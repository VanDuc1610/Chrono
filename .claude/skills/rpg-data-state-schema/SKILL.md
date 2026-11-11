---
name: rpg-data-state-schema
description: Use when designing or updating JSON schemas for items, skills, dialogue trees, character stats, inventory management, or Save/Load serialization in src/core/state/ and src/data/. Do NOT use for Phaser rendering or camera effects.
---

# RPG Data Tables & Save State Schema

## 1. Static Database vs. Runtime State

- **Static Databases (`src/data/db/`):** Read-only definitions for Skills, Items, Enemies, and Dialogues. Indexed by string ID (`Record<string, SkillDef>`). Never mutate static DB objects at runtime.
- **Runtime State (`src/core/state/`):** Serializable player progress (Party stats, Inventory quantities, Quest flags, Fracture alignment, Active Map/Coords).

## 2. Save Data Versioning & Validation

All save files stored in `localStorage` or external storage must include a `version` field and be validated before loading into the game state:

```typescript
export interface SaveSlotData {
  version: number; // Increment on breaking schema changes
  timestamp: number;
  location: {
    mapKey: string;
    gridX: number;
    gridY: number;
  };
  party: Array<{
    characterId: string;
    level: number;
    currentHp: number;
    currentMp: number;
    equippedIds: { weapon?: string; armor?: string; relic?: string };
  }>;
  inventory: Record<string, number>; // itemId -> count
  storyFlags: Record<string, boolean | number | string>;
}
```

## 3. Dialogue & Story Flag Rules

- Store dialogue trees in `public/assets/data/dialogues/*.json`.
- Dialogue nodes reference conditions and mutations exclusively via `storyFlags` keys (e.g., `flag_met_oracle`, `fracture_meter`).
- Never embed raw JavaScript code or `eval()` strings inside JSON data files. Use declarative condition objects: `{ "flag": "fracture_meter", "op": ">=", "value": 3 }`.

## 4. Immutability in State Reducers

Functions that modify inventory, equipment, or party stats in `src/core/state/` must validate invariants (e.g., `count >= 0`, `hp <= maxHp`) and return clean state updates with accompanying unit tests.
