---
name: game-testing-perf-audit
description: Use when writing Vitest unit tests for game logic, debugging memory leaks, fixing frame drops, or auditing Phaser DisplayList and WebGL draw calls. Do NOT use for initial feature scaffolding unless testing is requested.
---

# Game Testing & Performance Audit Protocols

## 1. When to Use / Routing Rules

- **TRIGGER:** Writing Vitest unit tests for game logic, debugging memory leaks, fixing frame drops, or auditing Phaser DisplayList and WebGL draw calls.
- **DO NOT USE FOR:** Initial feature scaffolding unless tests are requested.

---

## 2. Deterministic Testing with Mocked RNG

Never rely on global unseeded randomness when testing critical hits, evasion, or escape rolls. Inject a deterministic pseudo-random generator:

```typescript
// tests/combat.test.ts
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/systems/combat/CombatSystem';

describe('Combat Deterministic RNG', () => {
  it('guarantees escape when random roll is below threshold', () => {
    const combat = new CombatSystem({ tuning: defaultTuning });

    // Inject seeded mock: returns 0.05 (guaranteed success)
    combat.setRandomSource(() => 0.05);

    const result = combat.executeAction({
      type: 'escape',
      sourceId: 'player',
      targetId: 'enemy',
    });

    expect(result.success).toBe(true);
    expect(combat.getPhase()).toBe('escaped');
  });
});
```

---

## 3. Pure Logic Vitest Execution (Node without Canvas)

Test pure TypeScript logic in Node.js without canvas or mock browsers:

- Run all unit tests: `npm test` (`vitest run`).
- Run targeted test file: `npx vitest run tests/game-session.test.ts`.
- Direct imports from `public/assets/data/*.json` verify data integrity alongside code logic.

---

## 4. Headless CDP Automation & Global `Math.random` Rule

Automated browser integration tests run via Chrome DevTools Protocol (CDP) (`scripts/test-*.js`):

- **CRITICAL RULE:** **NEVER stub global `Math.random()` in browser CDP tests.** Phaser uses `Math.random()` internally to generate UUIDs for text texture keys. Stubbing it causes collision crashes on `this.add.text()`.
- Use engine-level hooks like `combat.combatSystem.setRandomSource(() => ...)` instead.

---

## 5. Object Pooling & Performance Checklist

To prevent Garbage Collection (GC) pauses and maintain steady 60 FPS:

1. **Floating Damage Numbers:** Use an Object Pool for damage/healing text instead of creating and destroying new `Text` objects every round.
2. **Particle Sparks:** Clean up spark sprites via `hideOnComplete: true` or recycle pool instances.
3. **DisplayList & Texture Swaps:**
   - Keep draw calls minimal by grouping sprites sharing the same texture atlas.
   - Avoid creating multiple individual `Graphics` objects in render loops; reuse a single graphics pipeline or NineSlice panels.

---

## 6. Enabling `phaser-plugin-scene-watcher` for Audits

For performance audits in development mode, install and register the scene watcher plugin to monitor active scenes, display list counts, and update rates:

```typescript
// In game config for development audits:
import SceneWatcherPlugin from 'phaser-plugin-scene-watcher';

const config: Phaser.Types.Core.GameConfig = {
  plugins: {
    default: [{ key: 'SceneWatcher', plugin: SceneWatcherPlugin, start: true }],
  },
};
```

Check WebGL draw calls in Chrome DevTools using `WebGL Insight` or the `Rendering` tab.
