---
name: game-testing-perf-audit
description: Use when writing Vitest unit tests for game logic, debugging memory leaks, fixing frame drops, or auditing Phaser DisplayList and WebGL draw calls. Do NOT use for initial feature scaffolding unless testing is requested.
---

# Game Testing & Phaser Performance Audit

## 1. Unit Testing Pure Core Logic (Vitest)

All files in `src/core/` must be testable in Node.js without DOM or WebGL canvas initialization.

- Place tests alongside source files (`src/core/combat/__tests__/BattleEngine.test.ts`).
- Always inject a deterministic stub RNG (`const fixedRng = () => 0.5;`) to test damage variance, critical hit thresholds, and status application rates.
- Run targeted tests to save time and tokens:
  `npx vitest run src/core/combat/__tests__/BattleEngine.test.ts`

## 2. Phaser Runtime Performance Rules

- **Zero Allocations in `update(time, delta)`:** Never instantiate `new Phaser.Math.Vector2()`, arrays, closures, or DOM elements inside a Scene's `update()` loop. Reuse pre-allocated class properties.
- **Object Pooling:** Damage numbers, hit sparks, and projectile sprites in `BattleScene` must use `Phaser.GameObjects.Group` with `maxSize` and `getFirstDead(false)` / `setActive(false).setVisible(false)` instead of `destroy()`.
- **Texture Atlas Batching:** Keep UI sprites and Battle VFX packed into shared Texture Atlases so WebGL can batch draw calls instead of flushing the pipeline on individual PNG textures.
- **Text Rendering:** Prefer `Phaser.GameObjects.BitmapText` for pixel art fonts and rapidly changing combat numbers. Standard `Phaser.GameObjects.Text` triggers expensive HTML5 Canvas re-rasterization on every string update.

## 3. Memory Leak Audit Checklist

When diagnosing slowdown after multiple `WorldScene` <-> `BattleScene` transitions:

1. Check `scene.events.listenerCount()` and custom `EventBus` listeners—verify every `.on()` has a matching `.off()` in `SHUTDOWN`.
2. Inspect `this.children.list.length`—ensure pooled groups are reset properly.
3. Verify custom shaders/postFX pipelines are cleared on scene shutdown.
