# CHRONO – PROJECT MAP

**Status:** In Active Development (Prologue Vertical Slice)  
**Quick Reference:** Read this before scanning the repository. Keep under 100 lines.

## 1. Directory Blueprint

- `src/scenes/`: Phaser rendering & input orchestration (`PreloadScene`, `MainMenuScene`, `ExplorationScene`, `CombatScene`, `PrologueEndScene`).
- `src/state/`: Playthrough state (`GameSession.ts` holds player stats, inventory, quests, flags).
- `src/systems/`: Engine-agnostic and Phaser integrations:
  - `combat/`: Speed initiative, action economy, damage formulas.
  - `inventory/` & `quest/`: Item stack tracking and declarative quest graph.
  - `dialogue/`: Node-based branching text with declarative side effects.
  - `save/`: Slot validation and localStorage/memory persistence.
  - `movement/` & `interaction/`: Top-down collision and proximity interactables.
  - `audio/`: Procedural Web Audio loops (`ambient` and `battle` BGM) and SFX synthesis.
  - `animation/`: Peter and entity animation rigs.
- `src/entities/`: Sprite wrappers (`Player.ts`, `NPC.ts`).
- `src/ui/`: UI modules (`DialogueBox`, `QuestTracker`, `NotificationBanner`, `SatchelPanel`, `StatusHud`, `Panel`) and `Strings.ts` (`strings.json` lookup).
- `src/world/`: data-driven maps (`MapTypes.ts`, `MapRegistry.ts`: resolve, validate, tile helpers).
- `public/assets/data/`: Game databases (`dialogue.json`, `quests.json`, `items.json`, `enemies.json`, `player.json`, `maps.json` (world placement per map), `strings.json` (Vietnamese UI text)).
- `docs/story/`: Canonical narrative bible, 6 chapter specifications, character bible.
- `docs/context/`: Scoped summaries (`PROJECT_MAP.md`, `COMBAT_SPEC.md`).

## 2. Core Feature Status

| Feature                           | Location                                          | Status   |
| --------------------------------- | ------------------------------------------------- | -------- |
| Top-down Exploration & Collision  | `ExplorationScene.ts`, `TopDownMovementSystem.ts` | Complete |
| Turn-based Combat (Speed/Skills)  | `CombatScene.ts`, `CombatSystem.ts`               | Complete |
| Quest & Dialogue Graph            | `QuestSystem.ts`, `DialogueSystem.ts`             | Complete |
| Inventory & Consumable Usage      | `InventorySystem.ts`, `ExplorationScene.ts`       | Complete |
| Save / Load Persistence           | `SaveSystem.ts`, `GameSession.ts`                 | Complete |
| Procedural Web Audio BGM & SFX    | `SoundSystem.ts`                                  | Complete |
| UI Frame (NineSlice) & Cursor     | `Panel.ts`, `UI_SET_001`                          | Complete |
| Prologue Environmental Content    | 7 POIs in `dialogue.json`, `maps.json`            | Complete |
| Multi-map world (exits, triggers) | `maps.json`, `src/world/`, `ExplorationScene.ts`  | Complete |
| Unit Tests (Vitest)               | `tests/*.test.ts` (34 tests passing)              | Complete |
| CI Workflow                       | `.github/workflows/ci.yml` (Ubuntu Node 24)       | Complete |

## 3. Essential Dev Commands

- Run dev server: `npm run dev` (Port 3000)
- Run typecheck: `npm run typecheck` (`tsc --noEmit`)
- Run unit tests: `npm test` (`vitest run`)
- Check formatting: `npx prettier --check .`
- Live headless browser tests: `node scripts/test-gameplay.js`, `test-combat.js`, `test-inventory-save.js`, `test-session-regression.js`
