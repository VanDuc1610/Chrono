# CHRONO – PROJECT MAP

**Status:** Prologue + Chapters 1–7 playable; Chapter 8 in design (story ends at Chapter 9). Live task state: `docs/TASKS.md`.  
**Quick Reference:** Read this before scanning the repository. Keep under 100 lines.

## 1. Directory Blueprint

- `src/scenes/`: Phaser rendering & input orchestration (`PreloadScene`, `MainMenuScene`, `ExplorationScene`, `CombatScene`, `PrologueEndScene`).
- `src/state/`: Playthrough state (`GameSession.ts` holds player stats, inventory, quests, flags; `ChapterStarts.ts` = main-menu chapter select with level/flags/gear per chapter).
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
- `src/world/`: data-driven maps (`MapTypes.ts`, `MapRegistry.ts`: resolve, validate, tile helpers), overworld action combat (`ActionCombat.ts`: roamers and per-chapter field foes), map puzzle features (`Chapter4Field.ts`: dials, beams, dial checks) and pure puzzle/foe rules (`PuzzleRules.ts`, `Chapter6Rules.ts`, `Chapter7Rules.ts`).
- `public/assets/data/`: Game databases (`dialogue.json`, `quests.json`, `items.json`, `enemies.json`, `player.json`, `maps.json` (world placement per map), `strings.json` (Vietnamese UI text)).
- `docs/story/`: Canonical narrative bible, character bible, `CHAPTER_0X_DESIGN.md` per chapter (latest reviewed: 07; 08 in design). Each design ends with Claude's review and the owner's decisions — those sections win over the original text.
- `scripts/`: chapter content generators — `chX-layout.js` (map layouts, via `generate-ch1-maps.js`), `content-chX.mjs` (dialogue/quests/items), `enemies-chX.mjs`, `wire-chX.mjs` (map wiring), `author-*.js` (Pipeline B art). Edit the generator, not the generated JSON.
- `docs/testing/`: answer keys and test reports (e.g. `DAP_AN_CHUONG_4-6.md`).
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
| Chapters 1–7 content              | `maps.json`, `dialogue.json`, `scripts/`          | Complete |
| Overworld action combat           | `ActionCombat.ts`                                 | Complete |
| Chapter select (testing)          | `ChapterStarts.ts`, `MainMenuScene.ts`            | Complete |
| Unit Tests (Vitest)               | `tests/*.test.ts` (138 tests, 2026-11-15)         | Complete |
| CI Workflow                       | `.github/workflows/ci.yml` (Ubuntu Node 24)       | Complete |

## 3. Essential Dev Commands

- Run dev server: `npm run dev` (Port 3000)
- Run typecheck: `npm run typecheck` (`tsc --noEmit`)
- Run unit tests: `npm test` (`vitest run`)
- Check formatting: `npx prettier --check .`
- Live headless browser tests: `node scripts/test-gameplay.js`, `test-combat.js`, `test-inventory-save.js`, `test-session-regression.js`
