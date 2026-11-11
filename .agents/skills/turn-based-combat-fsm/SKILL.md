---
name: turn-based-combat-fsm
description: Use when implementing or modifying turn-based combat rules, battle state machines, action queues, timeline/initiative calculation, status effects, or enemy AI in src/core/combat/ and BattleScene. Do NOT use for overworld movement or asset packing.
---

# Turn-Based Combat FSM & Architecture

## 1. When to Use / Routing Rules

- **TRIGGER:** Implementing or modifying turn-based combat rules, battle state machines, action queues, timeline/initiative calculations, status effects, or enemy AI in `src/core/combat/` and `BattleScene` / `CombatScene`.
- **DO NOT USE FOR:** Overworld movement, tilemaps, or asset packing.

---

## 2. Combat State Machine Flow

The combat lifecycle operates as a finite state machine:

```
[BATTLE_INIT] ──► Sort initiative queue by speed
      │
      ▼
[TURN_START] ──► Check active combatant (Player vs Enemy)
      │
      ├───────────────────────────────┐
      ▼ (Player)                      ▼ (Enemy)
[PLAYER_INPUT]                 [ENEMY_DECISION] (AI heuristic)
      │                               │
      └──────────────┬────────────────┘
                     ▼
             [EXECUTE_COMMAND] ──► Validate cost (MP/items), compute damage/healing
                     │
                     ▼
             [RESOLVE_EFFECTS] ──► Async visual queue: animations, sparks, floats
                     │
                     ▼
          [CHECK_WIN_CONDITION]
                     │
         ┌───────────┴───────────┐
         ▼ (Battle continues)    ▼ (Victory / Defeat / Escaped)
   [ADVANCE_TURN]          [BATTLE_END] ──► Rewards / check-point revive
         │
         └────────► Loop to [TURN_START]
```

---

## 3. Command Pattern: Logic vs Visual Decoupling

Pure combat math resides in `src/core/combat/` with **ZERO Phaser imports**. The Scene only consumes the resulting data contract:

```typescript
// src/core/combat/CombatTypes.ts
export type CombatActionType = 'attack' | 'skill' | 'item' | 'defend' | 'escape';

export interface ICombatAction {
  type: CombatActionType;
  sourceId: string;
  targetId: string;
  itemId?: string;
}

export interface IActionResult {
  success: boolean;
  message: string;
  damageDealt: number;
  healingDone: number;
  isCritical?: boolean;
}
```

---

## 4. Async Animation Queue in Scene Presentation

The Scene wraps Phaser tweens, sprite animations, and audio into Promises so that the FSM only advances after animations visually finish:

```typescript
// Inside BattleScene.ts
public async handlePlayerAction(type: CombatActionType): Promise<void> {
  if (this.isProcessingTurn || this.combatSystem.isBattleOver()) return;
  this.isProcessingTurn = true;
  this.setCommandButtonsVisible(false);

  // 1. Calculate deterministic logic outcome
  const result = this.combatSystem.executeAction({
    type,
    sourceId: this.player.id,
    targetId: this.enemy.id,
  });

  // 2. Play animations and wait for completion
  if (type === 'attack') {
    await this.playAttackSequence(result);
  } else if (type === 'skill') {
    await this.playSkillSequence(result);
  }

  // 3. Update HUD text and status bars
  this.updateStatusBars();

  // 4. Advance FSM to next turn
  if (this.combatSystem.isBattleOver()) {
    this.handleBattleEnd();
  } else {
    this.combatSystem.advanceTurn();
    this.beginNextTurn();
  }
}

private playAttackSequence(result: IActionResult): Promise<void> {
  return new Promise((resolve) => {
    this.playerSprite.play('peter_attack_right');
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 35,
      duration: 140,
      yoyo: true,
      onYoyo: () => {
        this.cameras.main.shake(120, 0.005);
        this.showHitSpark(this.enemySprite, 0x00c8ff);
        this.showFloatingDamage(this.enemySprite, result.damageDealt);
      },
      onComplete: () => {
        this.playerSprite.play('peter_idle_right');
        resolve();
      },
    });
  });
}
```

---

## 5. Deterministic Initiative & RNG Injection

Never call global `Math.random()` inside `CombatSystem`. Inject a deterministic random source:

```typescript
export class CombatSystem {
  private randomSource: () => number = Math.random;

  public setRandomSource(fn: () => number): void {
    this.randomSource = fn;
  }

  public calculateEscapeProbability(playerSpeed: number, enemySpeed: number): boolean {
    const chance = Math.min(0.95, Math.max(0.1, 0.3 + (playerSpeed - enemySpeed) / 100));
    return this.randomSource() < chance;
  }
}
```

This enables 100% deterministic Vitest unit tests without browser or canvas mocks.
