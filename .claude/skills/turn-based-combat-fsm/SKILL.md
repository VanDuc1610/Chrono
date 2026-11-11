---
name: turn-based-combat-fsm
description: Use when implementing or modifying turn-based combat rules, battle state machines, action queues, timeline/initiative calculation, status effects, or enemy AI in src/core/combat/ and BattleScene. Do NOT use for overworld movement or asset packing.
---

# Turn-Based Combat Architecture (FSM + Command Pattern)

## 1. Strict Separation of Concerns

- **`src/core/combat/` (Pure TypeScript):** Contains `BattleEngine`, `TurnManager`, `CombatAction`, damage formulas, and status tick resolvers. **ZERO Phaser imports allowed.**
- **`src/scenes/BattleScene.ts` (Phaser View):** Subscribes to `BattleState` changes, plays animations/tweens, and resolves a `Promise<void>` when visual effects finish so the FSM can advance.

## 2. Battle Finite State Machine States

```text
[INIT] -> [TURN_START] -> [SELECT_ACTION] -> [EXECUTE_ACTION] -> [TURN_END] -> [CHECK_OUTCOME]
               ^                                                                     |
               +----------------------- (Next Combatant) ----------------------------+
```

- **INIT:** Build initiative timeline based on AGI (Agility) + Chrono/Fracture modifiers.
- **TURN_START:** Trigger start-of-turn status effects (DOTs, stun checks). If stunned, skip to `TURN_END`.
- **SELECT_ACTION:** Wait for Player UI Command OR execute deterministic Enemy AI selector.
- **EXECUTE_ACTION:** Calculate pure state mutation in `src/core/combat/`, emit `CombatEvent[]` log (e.g., `DAMAGE_DEALT`, `STATUS_APPLIED`, `FRACTURE_TRIGGERED`), and await visual playback in `BattleScene`.
- **TURN_END:** Decrement buff/debuff durations and update action timeline cost.
- **CHECK_OUTCOME:** Check all-enemies-dead (VICTORY) or all-party-dead (DEFEAT).

## 3. Command Pattern & Event Log Contract

Every combat skill/item execution returns an immutable list of events rather than mutating UI directly:

```typescript
export type CombatEvent =
  | { type: 'ANIMATION'; actorId: string; animKey: string; targetId?: string }
  | { type: 'HP_CHANGE'; targetId: string; delta: number; isCrit: boolean }
  | { type: 'STATUS_ADDED'; targetId: string; statusId: string; turns: number }
  | { type: 'CHRONO_SHIFT'; targetId: string; timelineDelta: number };

export interface CombatCommand {
  actorId: string;
  execute(
    state: BattleState,
    rng: () => number,
  ): {
    nextState: BattleState;
    events: CombatEvent[];
  };
}
```

## 4. Deterministic RNG Rule

- Never call `Math.random()` directly inside combat formulas.
- Always inject a seeded PRNG function `rng: () => number` so every battle turn can be reproduced and unit-tested deterministically in Vitest.
