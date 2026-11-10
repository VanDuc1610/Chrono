# T-02 · Code Review of `src/` (2026-11-10)

**Reviewer:** Claude Code · **Scope:** all of `src/` at commit `da4a5aa` · **Method:** static reading, cross-checked against `public/assets/data/*.json`.

## Root cause behind most P1 bugs

Game-wide state (inventory, quest progress, story flags, player HP) lives **inside scene instances**. Phaser reuses the same scene instance on every `scene.start()`, and `ExplorationScene` is restarted after every battle. So state is either **re-created** (lost) or **never reset** (leaks between runs), depending on whether it is built in `create()` or in a field initializer.

**Fix direction:** a single `GameSession` object (plain TS class, not a scene) that owns `InventorySystem`, `QuestSystem`, story flags and player stats. `MainMenuScene` creates a fresh one on New Game or hydrates it from a save on Continue; `ExplorationScene`/`CombatScene` only read and write it; `SaveSystem` serializes it. → Task **T-09**.

---

## P1 — gameplay-breaking

| # | Where | Problem | Repro |
|---|---|---|---|
| B1 | `ExplorationScene.create()` L111-169 | `QuestSystem` is re-created and reloaded from JSON on every `create()`. Only a save-load restores progress. | Talk to Elder → touch Shade → win or escape → quest objectives are back to unchecked. |
| B2 | `ExplorationScene.create()` L176-185 | Starter items (2× shard, relic) are added on every `create()` without save data, and the victory shard is added on **every** `create()` while `isShadeDefeated` is true — including every Continue. | Win the battle, quick-save, Continue repeatedly → +1 shard each time. Escape a battle → +2 shards. |
| B3 | `ExplorationScene` fields L22, L59-60; `init()` | `inventorySystem`, `isShadeDefeated` and `hasTriggeredAwakening` are never reset in `init()`. | Win the battle → lose later / go to menu → New Game → Shade is already gone, awakening already triggered, old items kept. |
| B4 | `CombatScene` L23, L30; `init()` L36 | `isProcessingTurn` and `commandButtons` are not reset in `init()`. After an escape, `isProcessingTurn` stays `true`. (`docs/PROJECT_CONTEXT.md` §3.4 says this reset exists — it does not.) | Escape a battle → walk into the Shade again → no command responds (soft-lock). |
| B5 | `CombatSystem` L57, L88 | The defend buff is only cleared in `advanceTurn()`, which `CombatScene` never calls. Once the player defends, all later hits do 50% damage for the rest of the battle. | Press 4 once, then only attack → the enemy always deals half damage. |
| B6 | `CombatScene.handlePlayerAction('item')` L357; `CombatSystem` L108-113 | The Item command never checks or consumes inventory, and the +30 heal is hard-coded. | Press 3 any number of times with 0 shards → heals each time. |

## P2 — incorrect behaviour / spec violations

| # | Where | Problem |
|---|---|---|
| B7 | `KeyboardPlayerController.getActions()` L73-74 | `JustDown(keyEscape)` is called twice; the first call consumes the edge, so `menu` is **always false**. Currently latent (nothing reads `menu`), but it will break the ESC menu. |
| B8 | `CombatScene` L47-80, `ExplorationScene.quickSave()` L704 | This violates the data-driven rule (CLAUDE.md §5.1): player stats (HP 50, ATK 14…) are hard-coded; `CombatSceneData.enemyId` is ignored (always the Shade); skill ×2.8 (the comment says 1.75×) and heal 30 are hard-coded. HP is never persisted: every battle starts at 50/50 and every save writes 50. |
| B9 | `CombatScene`, `CombatSystem` | Rewards are display-only: "+50 EXP" is shown but no EXP exists anywhere. The quest `rewards` block and the enemy `lootTable` (75% chance) are never read; victory always grants 1 shard via B2's code path. |
| B10 | `CombatScene` turn flow | The speed-based initiative queue in `CombatSystem` is never used; the player always acts first. Escape is deterministic (`speed >= speed`) → with the current data it always succeeds. Docs advertise "speed-based initiative". |
| B11 | `SaveSystem.load()` L47 | It casts `JSON.parse` to `ISaveData` with no shape or version check. A corrupt or old save crashes `ExplorationScene.init()` (e.g. `data.player.position` is undefined). |

## P3 — code quality

| # | Where | Problem |
|---|---|---|
| B12 | `Player.update()` L72 | It down-casts `IMovementSystem` to `TopDownMovementSystem` to call `getLastFacing()` → `getLastFacing` belongs on the interface. |
| B13 | `ExplorationScene.quickSave()` L700 | `playtimeSeconds = this.time.now/1000` is the scene clock, so it resets on every scene start. Playtime should live in the session. |
| B14 | `CombatScene` L47-48 | `any` types (lint errors, T-06). |

## What is in good shape

- Systems are cleanly separated behind interfaces; `QuestSystem` and `DialogueSystem` are small, readable event emitters.
- `ExplorationScene.init()` already resets its UI arrays and timers correctly — the same discipline just needs extending to game state.
- `InventorySystem` stack rules are correct; `TopDownMovementSystem` normalizes diagonals.

## Fix plan

- **T-08 (Claude, now — files not locked):** B5, B7, B11, B12 in `CombatSystem.ts`, `KeyboardPlayerController.ts`, `SaveSystem.ts`, `IMovementSystem.ts`, `Player.ts`.
- **T-09 (Claude, after T-04 releases the scene locks):** `GameSession` refactor → B1, B2, B3, B4, B6, B8, B9 (loot table), B13, B14; correct `PROJECT_CONTEXT.md` §3.4.
- **T-10 (open design question for the owner):** use the initiative queue and probabilistic escape (B10)? Is EXP/levelling in scope for the prologue (B9)?

---

## Resolution (2026-11-11)

| Finding | Status |
|---|---|
| B5, B7, B11, B12 | Fixed in T-08 |
| B1, B2, B3, B4, B6, B8, B9, B10, B13, B14 | Fixed in T-09 (`GameSession` refactor + owner decisions from T-10) |

Verified with `scripts/test-session-regression.js`: all 5 scenarios FAIL on pre-T-09 code and PASS after. The three original CDP suites still pass.
