---
name: turn-based-combat-fsm
description: Use when changing combat rules, turn order, skills, items in battle, enemy behaviour or CombatScene turn flow. Not for overworld movement, maps or art.
---

# Turn-based combat (CHRONO)

- **Logic:** `src/systems/combat/CombatSystem.ts` (+ `CombatTypes.ts`, `ICombatSystem.ts`). No Phaser
  import; unit-tested in `tests/combat-and-save.test.ts`.
- **View:** `src/scenes/CombatScene.ts` — renders, animates, and drives the turn flow.
- **Tuning data:** `public/assets/data/player.json` (`combat`, `skillMpCost`, growth, `expThresholds`)
  and `enemies.json` (stats, `expReward`, loot). Never hard-code numbers in the scene.

## How it works now

- Speed-ordered initiative queue. Scene flow: `beginTurn()` → player command or
  `executeEnemyTurn()` → `endTurn(delay)` → `combatSystem.advanceTurn()` (skips the dead).
  The inter-turn delay is applied **once**, in `endTurn`.
- Commands: attack, skill (costs MP; short MP keeps the turn), item (consumes from
  `session.inventory`; none left keeps the turn), defend (lasts until the defender's next action),
  escape (chance from speed, clamped 10–90 %, failure costs the turn).
- Player combatant comes from `session.createPlayerCombatant()` (MP refilled each battle); HP is
  written back with `session.applyBattleHp()`; rewards via `session.claimEnemyRewards()`.
- Defeat with `revivePosition` revives at the Altar of Moments; victory sets `victoryFlag`.

## Rules

- Randomness goes through the injected RNG: `new CombatSystem({ rng })` or
  `setRandomSource(fn)`. **Never stub global `Math.random`** — Phaser uses it and Text creation
  crashes.
- New rules: add to `CombatSystem` + a Vitest case first, then the scene.
- Animations: Peter uses `peter_<anim>_right` (attack, hurt, temporal_sight, idle).

## Verify

`npx vitest run tests/combat-and-save.test.ts` · `node scripts/test-combat.js` ·
`node scripts/test-session-regression.js`
