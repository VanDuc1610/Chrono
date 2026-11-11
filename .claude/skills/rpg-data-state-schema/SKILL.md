---
name: rpg-data-state-schema
description: Directives for external JSON databases, GameSession state hydration, save slot migrations, and declarative effects.
---

# RPG Data & State Schema

## 1. When to Load

- Editing or creating files in `public/assets/data/` (`dialogue.json`, `quests.json`, `items.json`, `enemies.json`, `player.json`, `interactables.json`).
- Modifying `GameSession.ts` or save/load serialization in `SaveSystem.ts`.
- Implementing quest stage listeners or dialogue side effects.

## 2. Core Constraints

- **Decoupled Data:** Scene code must never hardcode item names, stats, dialogue lines, or quest objective text. Load everything from JSON.
- **Session Authority:** All persistent game progress (inventory, HP, level, EXP, flags, quests) must reside in `GameSession`. Scenes only read and mutate via `this.session`.
- **Declarative Effects:** Use `applyDialogueEffects({ setFlags, startQuest, grantItems, grantOnceFlag })`. Always guard one-shot rewards with a flag.
- **Save Versioning:** Maintain `version: "0.1.0"`. Old saves with missing fields (e.g., missing EXP) must be hydrated with safe fallback defaults without throwing errors.
