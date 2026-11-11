---
name: game-testing-perf-audit
description: Use when writing or running tests (Vitest or the CDP browser suites), verifying a change, or chasing leaks and frame drops. Not for feature scaffolding.
---

# Testing & performance (CHRONO)

## Unit tests (Node, no browser)

- `tests/*.test.ts`, run `npm test` or one file: `npx vitest run tests/<file>.test.ts`.
- Pure modules only (`src/state`, `src/systems/{combat,dialogue,quest,inventory,save}`); they load
  the real JSON from `public/assets/data/`.
- Deterministic randomness: pass an RNG to `CombatSystem` / `setRandomSource`. Never stub
  `Math.random` globally.

## Browser suites (live engine via Edge + CDP)

1. Start the server: `npx vite --port 3000 --strictPort` (background).
2. Run what the change touches:
   - `node scripts/test-gameplay.js` — movement, collision, dialogue with real key presses
   - `node scripts/test-combat.js` — battle flow, victory, return to exploration
   - `node scripts/test-inventory-save.js` — satchel, save, Continue
   - `node scripts/test-session-regression.js` — bugs B1–B6
3. Output is compact by default; add `--verbose` for full logs and browser console.
4. Stop the server afterwards (it holds port 3000).

Tests that only call scene methods can miss input bugs — drive real input with
`Input.dispatchKeyEvent` when the change concerns controls.

## Before committing

`npm run typecheck` · `npm run lint` · `npx prettier --check .` · `npm test`

## Performance checks (when a slowdown is reported)

- Re-enter combat several times; check `scene.events.listenerCount(...)` and
  `scene.children.list.length` stay flat.
- Short-lived objects (damage numbers, sparks) must be destroyed or pooled.
- Avoid allocating in `update()`; avoid updating `Text` every frame.
