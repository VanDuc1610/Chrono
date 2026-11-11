---
name: rpg-data-state-schema
description: Use when designing or updating JSON schemas for items, skills, dialogue trees, character stats, inventory management, or Save/Load serialization in src/core/state/ and src/data/. Do NOT use for Phaser rendering or camera effects.
---

# RPG Data Architecture & State Schema

## 1. When to Use / Routing Rules

- **TRIGGER:** Designing or updating JSON schemas for items, skills, dialogue trees, character stats, inventory management, or Save/Load serialization in `src/core/state/` and `src/data/` (or `public/assets/data/`).
- **DO NOT USE FOR:** Phaser rendering, camera effects, or sprite tweens.

---

## 2. Decoupled Data Tables & Dependency Direction

Never hardcode quest text, enemy stats, or item attributes in Scene logic. Data tables live in `public/assets/data/`:

- `items.json`: Item definitions (`consumable`, `material`, `key_item`), maxStack, effects.
- `enemies.json`: Base stats, rewards (EXP, item drops).
- `player.json`: Base stats, level cap, EXP curve thresholds (`[0, 50, 120]`), skill costs.
- `quests.json`: Linear and branching quest graph, `followUpQuestId`, `completeOnFlag`.
- `dialogue.json`: Dialogue tree nodes with branching responses and declarative `effects`.

**Dependency Rule:** JSON schemas depend on domain interfaces in `src/core/` (or pure system types). Scenes consume data from `GameSession`. Never create circular imports between data models.

---

## 3. Immutable State & `GameSession` Authority

All persistent playthrough state lives in `GameSession`. Scenes do not store persistent state:

```typescript
export interface GameSessionState {
  version: string;
  timestamp: number;
  playtimeMs: number;
  playerName: string;
  level: number;
  exp: number;
  hp: number;
  position: { mapId: string; x: number; y: number };
  inventory: IItemStack[];
  flags: Record<string, boolean | number | string>;
  quests: IQuest[];
}
```

State changes must be serialized cleanly without mutating external snapshots:

```typescript
// Snapshot export for SaveSystem
public toSaveData(currentPos?: { mapId: string; x: number; y: number }): ISaveData {
  return {
    version: '0.1.0',
    timestamp: Date.now(),
    playtimeSeconds: Math.floor(this.playtimeMs / 1000),
    player: {
      name: this.playerName,
      level: this.level,
      hp: this.hp,
      maxHp: this.getStats().maxHp,
      position: currentPos ?? this.position,
    },
    inventory: this.inventory.getAllItems().map((s) => ({ ...s })),
    quests: this.quests.getAllQuests().map((q) => JSON.parse(JSON.stringify(q))),
    flags: { ...this.flags },
  };
}
```

---

## 4. Save Validation Schema & Version Migration

Always validate save data before loading to protect against corrupt localStorage payloads:

```typescript
export function isValidSaveData(data: unknown): data is ISaveData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<ISaveData>;
  return (
    typeof d.version === 'string' &&
    typeof d.player === 'object' &&
    typeof d.player.level === 'number' &&
    typeof d.player.hp === 'number' &&
    Array.isArray(d.inventory) &&
    Array.isArray(d.quests) &&
    typeof d.flags === 'object'
  );
}

// Hydration & Migration:
// When loading older 0.1.0 saves without EXP or with level above cap:
const levelCap = session.database.player.progression.levelCap;
const safeLevel = Math.min(levelCap, Math.max(1, saveData.player.level));
const safeExp = saveData.player.exp ?? 0;
```

---

## 5. Declarative Dialogue Effects Engine

Dialogue nodes apply declarative effects via `GameSession.applyDialogueEffects(effects)`:

```typescript
export interface DialogueEffects {
  setFlags?: string[];
  startQuest?: string;
  grantItems?: { itemId: string; quantity: number }[];
  grantOnceFlag?: string; // Prevents duplicate reward claiming
}

// In GameSession:
public applyDialogueEffects(effects: DialogueEffects): IItemStack[] {
  if (effects.grantOnceFlag && this.getFlag(effects.grantOnceFlag)) {
    // Reward already claimed on previous dialogue interaction
    return [];
  }
  // Grant items and set flag atomically
  if (effects.grantOnceFlag) this.setFlag(effects.grantOnceFlag, true);
  // ...
}
```
