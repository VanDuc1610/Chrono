---
name: turn-based-combat-fsm
description: Guidelines for turn-based combat state machines, speed-based initiative, action validation, and decoupled logic calculations.
---

# Turn-Based Combat FSM & Architecture

## 1. When to Load

- Modifying `CombatSystem.ts`, `CombatScene.ts`, or combatant types.
- Implementing new skills, status effects, or boss phases.
- Tuning combat damage, defense, and escape formulas.

## 2. Core Constraints

- **Zero Engine Logic Coupling:** `CombatSystem` must remain 100% pure TypeScript. It must never import Phaser sprites, tweens, or sound nodes.
- **RNG Determinism:** Never call global `Math.random()` inside combat calculation methods. Always use `this.randomSource()` so tests can inject deterministic seeds.
- **Phase Validation:** Guard actions with phase checks:
  ```typescript
  if (this.isProcessingTurn || this.combatSystem.isBattleOver()) return;
  ```
- **Cost Safety:** Check resource availability (MP/items) before committing turns. If MP or items are insufficient, inform the player and preserve their turn.
