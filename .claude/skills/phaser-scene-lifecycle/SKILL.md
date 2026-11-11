---
name: phaser-scene-lifecycle
description: Use when creating or changing a Phaser scene in src/scenes/, passing data between scenes, or adding listeners, timers, HUD or overlays. Not for combat math, JSON data or art.
---

# Scene lifecycle (CHRONO)

Scenes: `PreloadScene` → `MainMenuScene` → `ExplorationScene` ⇄ `CombatScene` → `PrologueEndScene`
(registered in `src/config.ts`). Playthrough state lives in `GameSession` (`src/state/`), read with
`getSession(this)`; scenes never own progress.

## Rules

1. **Scene instances are reused.** Reset every transient field in `init(data)` (flags, arrays of
   buttons, nullable refs). See `CombatScene.init()`.
2. **Typed scene data.** Export an interface (`CombatSceneData`, `ExplorationSceneData`) and use it
   in both `init()` and `scene.start()`.
3. **Clean up listeners.** Anything on `this.events`, `this.game.events`, a system emitter (e.g.
   `QuestSystem`) or the registry must be removed in
   `this.events.once(Phaser.Scenes.Events.SHUTDOWN, …)`. Keyboard keys added with
   `this.input.keyboard.addKey` and `this.time` / `this.tweens` are cleaned by Phaser.
4. **Disabled controller = no input.** `KeyboardPlayerController.getActions()` returns nothing while
   disabled. Freeze movement by skipping `player.update()`, not by disabling the controller, if the
   scene still needs E / Space (dialogue).
5. **Global animations** are created once in `PreloadScene` (`enemy_fracture_idle`, `npc_elder_idle`,
   `ui_cursor_pulse`, `hit_spark_burst`) or via `registerPeterAnimations(scene)` (idempotent).
6. **Panels** use `createPanel()` from `src/ui/Panel.ts` (nine-slice `ui_frame`, origin 0,0, pad
   text ≥ 8 px). HUD objects use `setScrollFactor(0)` and an explicit depth.
7. No quest, dialogue or stat values in scene code — read them from `GameSession` / JSON.

## Verify

`npm run typecheck` · `npm test` · the CDP suite that covers the scene (see
`game-testing-perf-audit`). A scene change that re-enters (combat → exploration) must pass
`node scripts/test-session-regression.js`.
