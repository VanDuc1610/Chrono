---
name: game-testing-perf-audit
description: Protocols for running Vitest unit tests, headless CDP browser automation, visual inspection, and performance checks.
---

# Game Testing & Performance Audit

## 1. When to Load

- Running regression test suites before committing.
- Writing new unit tests in `tests/` or CDP test scripts in `scripts/`.
- Verifying frame rate, scene transitions, and audio teardown under live browser conditions.

## 2. Core Constraints

- **Test Hierarchy:**
  1. _Typecheck:_ `npm run typecheck` (`tsc --noEmit`) – 0 errors required.
  2. _Code Quality:_ `npm run lint` & `npx prettier --check .`.
  3. _Unit Tests:_ `npm test` (`vitest run`) – Runs in Node without browser overhead.
  4. _Live CDP Suites:_ `node scripts/test-*.js` (gameplay, combat, inventory save, session regression) running against `npx vite --port 3000 --strictPort`.
- **Global Math.random Prohibition in CDP Tests:** Never stub global `Math.random` in browser tests because Phaser relies on it for internal texture UUID generation. Use `combat.combatSystem.setRandomSource(...)` instead.
- **Visual Proof:** Capture and inspect screenshots (`screenshot_*.png`) for text clipping and alignment before deleting them.
