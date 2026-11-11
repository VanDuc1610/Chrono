# CHRONO – The Fractured Divinity | Agent Root Rules

## 1. Project Context & Boundaries

- **Genre:** 2D Top-down Pixel Art Turn-based RPG (Dark/Cosmic Fantasy).
- **Core Stack:** Phaser 3, TypeScript (Strict Mode), Vite, Vitest.
- **Agents:** Claude Code (coordinator: assigns tasks, writes Antigravity prompts, reviews, decides pushes) & Google Antigravity (implementer). Active work and file locks: `docs/TASKS.md`. Never edit a file locked by the other agent.
- **Art & Identity Lock:** full rules in `.agents/rules/chrono-art.md`. Never alter Peter's design (`docs/art/PETER_DESIGN.md` – adult male, ~26, short compact curly hair). No AI image models, no external references. Owner approval required before any asset enters `public/assets/`.
- **Secrets:** never output, copy, log or commit credentials, API keys or tokens.

## 2. Directory Boundaries

- `src/scenes/`: Phaser scenes (`PreloadScene`, `MainMenuScene`, `ExplorationScene`, `CombatScene`, `PrologueEndScene`). Orchestration and rendering only.
- `src/state/`: `GameSession` – playthrough state (stats, inventory, quests, flags, save shape). No Phaser runtime imports.
- `src/systems/`: `combat/`, `dialogue/`, `quest/`, `inventory/`, `save/` are pure TypeScript (no Phaser import); `movement/`, `interaction/`, `input/`, `audio/`, `animation/` integrate with Phaser.
- `src/entities/`: Sprite wrappers (`Player.ts`, `NPC.ts`). `src/ui/`: UI helpers (`Panel.ts`).
- `public/assets/data/`: game data JSON (`dialogue`, `quests`, `items`, `enemies`, `player`, `interactables`).
- `docs/context/`: short summaries. `docs/story/`: narrative canon (read only the chapter you need).

## 3. Architecture Rules

- **Logic-Render Decoupling:** combat math, RNG, progression and state changes live in the pure modules above and are unit-tested with Vitest. Inject RNG; never stub global `Math.random`.
- **Pixel Art Integrity:** keep `pixelArt: true` and `roundPixels: true`; prefer integer sprite scales for new art.
- **Data, not code:** no quest, dialogue or stat values hardcoded in scenes.
- **Scene Hygiene:** listeners on `this.events`, `game.events`, system emitters or the registry are removed on `Phaser.Scenes.Events.SHUTDOWN`; transient state is reset in `init()`.
- **TypeScript Discipline:** no `any`; parse untrusted data (save files, custom properties) as `unknown` with type guards.
- _Targets, not yet in code (do not assume they exist):_ centralized asset keys, a schema library for JSON validation.

## 4. Essential Commands

- Dev server: `npm run dev` · Typecheck: `npm run typecheck` · Unit tests: `npm test`
- Lint & format: `npm run lint` · `npx prettier --check .`
- Browser suites: `node scripts/test-*.js` (needs the dev server on port 3000; compact output, add `--verbose` for full logs).

## 5. Context & Token Economy Protocol

- **Do NOT scan the entire codebase.** Read `docs/context/PROJECT_MAP.md` first.
- **Load skills on demand** (`.agents/skills/`) only when the task matches a skill's description. Edit skills only in `.agents/skills/`, then run `node scripts/sync-skills.js` (`npm test` fails if `.claude/skills/` drifts).
- **Task board stays short:** `docs/TASKS.md` keeps the latest 5 Done entries; older ones go to `docs/TASKS_ARCHIVE.md` (read only for history).
- **Incremental verification:** typecheck + targeted tests (`npx vitest run <path>`, the one CDP suite the change touches) before the full set at commit time.
- Big files (`docs/PROJECT_CONTEXT.md`, `docs/story/CHRONO_STORY_BIBLE.md`, `ASSET_REGISTRY.md`): read only the section you need.
