# CHRONO – The Fractured Divinity | Agent Root Rules

## 1. Project Context & Boundaries

- **Genre:** 2D Top-down Pixel Art Turn-based RPG (Dark/Cosmic Fantasy).
- **Core Stack:** Phaser 3, TypeScript (Strict Mode), Vite, Vitest.
- **Agents:** Claude Code (Coordinator/Reviewer) & Google Antigravity (Implementer). Single list of active work in `docs/TASKS.md`.
- **Art & Identity Lock:** Never alter Peter's design (`docs/art/PETER_DESIGN.md` – adult male, ~26, short naturally curly hair lock). Never call external AI image models. Owner approval required before any asset enters `public/assets/`.

## 2. Directory Boundaries

- `src/core/`: Pure TypeScript game logic (combat math, turn order, inventory, dialogue trees, state machines). **ZERO Phaser imports allowed here.**
- `src/scenes/`: Phaser Scenes (`PreloadScene`, `MainMenuScene`, `ExplorationScene`, `CombatScene`, `PrologueEndScene`). Orchestration and rendering only.
- `src/entities/`: Visual wrappers binding data models to Phaser GameObjects/Sprites (`Player.ts`, `NPC.ts`).
- `src/systems/`: Engine integrations (movement, dialogue, quest, audio, input).
- `src/data/`: Static JSON schemas, typed constants, and asset keys (`AssetKeys.ts`).
- `public/assets/`: Textures, sprite sheets, audio, and data JSONs (`dialogue.json`, `quests.json`, `items.json`, `enemies.json`, `player.json`).
- `docs/context/`: Modular architecture & state summaries. Read on-demand only.

## 3. Non-Negotiable Architecture Rules

- **Logic-Render Decoupling:** All turn-based combat calculations, RNG, status effects, and progression must live in `src/core/` (or pure modular systems) as deterministic TypeScript functions/classes, unit-tested via Vitest without a browser or canvas.
- **Pixel Art Integrity:** Never use floating-point coordinates for static UI or resting sprites. Keep `pixelArt: true` and `roundPixels: true` in Phaser config. Never scale pixel art with non-integer multipliers.
- **Strict Asset Typing:** Never hardcode asset string keys or magic numbers in Scenes. Import texture, animation, audio, and map keys from centralized keys.
- **Memory & Scene Hygiene:** Every `Phaser.Scene` that registers custom event listeners (`this.events.on`, `game.events.on`, or DOM/Keyboard listeners) MUST clean them up inside `this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { ... })`.
- **TypeScript Discipline:** `any` is forbidden. Use `unknown` with type guards or Zod schemas when parsing custom properties and save data.

## 4. Essential Commands

- Dev Server: `npm run dev`
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Unit Tests: `npm run test` (`vitest run`)
- Lint & Format: `npm run lint` & `npx prettier --check .`

## 5. Context & Token Economy Protocol

- **Do NOT scan the entire codebase.** Read `docs/context/PROJECT_MAP.md` first (under 100 lines).
- **Load Skills On-Demand:** Do not load specialized guidelines unless your current task matches a skill's trigger domain (`.agents/skills/`).
- **Incremental Verification:** Run `npx tsc --noEmit` and targeted unit tests (`npx vitest run <path>`) rather than building the entire production bundle.
