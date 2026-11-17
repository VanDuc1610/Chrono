# CHRONO - Project Map

**Status (2026-11-17):** Prologue + Chapters 1-9 playable, four endings, 131 maps. Story complete; owner playtesting and presentation upgrades continue. Live assignments and locks: `docs/TASKS.md`.

Read this before searching the repository. Keep this file under 100 lines.

## Directory blueprint

- `src/scenes/`: Boot, Preload, MainMenu, Exploration, Combat and PrologueEnd orchestration/rendering. Bosses fight on their exploration maps; normal encounters use turn-based CombatScene.
- `src/state/`: GameSession playthrough state; ChapterStarts supplies chapter-select starting state.
- `src/systems/`: pure combat, inventory, quest, dialogue and save rules; Phaser-integrated movement, input, audio and animation. Boss rules are in `boss/`; effects in `fx/`.
- `src/entities/`: Player and NPC sprite wrappers. Peter uses approved 64x64 LPC-scale frames; his foot collider stays 18x14.
- `src/ui/`: dialogue, menus, compact status/quest HUD and satchel. `crispText.ts` uses VT323 (SIL OFL, Vietnamese glyphs); BootScene waits for the font. Strings come from `strings.json`.
- `src/world/`: MapTypes/MapRegistry, ActionCombat roamers, BossFight real-time bosses, puzzle rules and chapter field features.
- `src/world/ActorShadows.ts`: contact shadows and foot-based actor depth; `WallCaps.ts`: raised LPC wall tops. Optional overlay/above layers support walking behind props.
- `src/world/Atmosphere.ts`: per-map lights, darkness, motes and multiply/screen colour grade, configured in `atmosphere.json`.
- `src/world/NeonSkin.ts` / `NeonTrace.ts`: neon outlines/void skin. Chapters 0-5 retain LPC tiles with accents; Chapters 6-9 use full neon void (`neon.json`).
- `public/assets/data/`: maps, dialogue, quests, enemies, items, player, strings, bosses, atmosphere, neon and LPC configuration.
- `public/assets/maps/`: Tiled maps. `maps.json` has 131 world entries, including hidden maps.
- `scripts/lpc/`: pinned-source fetch, attribution audit/credits, Veridia atlas and chapter 0-5 reskin generators. Collision and puzzle tile identities remain stable during reskinning.
- `art-source/lpc/`: raw PNGs, SHA-256 manifest, source credits and derived-art records. Root `CREDITS.md` is generated; preserve attribution and owner approval gates.
- `scripts/content-chX.mjs`, map layout/wiring and enemy scripts: edit generators rather than generated data. Chapter 8 supports `--ivo-only` for the scoped notebook dialogue update.
- `docs/story/`: chapter 01-09 canon/design/scripts; owner decisions and build notes take precedence over older proposals. Load only the chapter needed.
- `docs/art/`: canonical designs, sprite pipeline and LPC asset map. Peter's identity remains locked.
- `docs/testing/`: chapter answer keys and audit reports. `docs/archive/screenshots/`: historical root screenshots, not current acceptance evidence.

## Verified state

- Story: Prologue through Chapter 9; ending router selects order, unbound, true or returned_page cards.
- Combat: real-time map bosses plus turn-based normal encounters; equipment has melee, ranged, armour and accessory slots.
- Presentation: LPC environments in chapters 0-5; Peter at 64x64; full neon in chapters 6-9; VT323 UI.
- Verification: 260 unit tests in 33 files (`npm test`, 2026-11-17); production Chromium smoke covers boot, Enter/new game, nonblank frame, movement and save/reload.
- Release: existing CI typechecks, lints, checks formatting, tests, builds once, smoke-tests and deploys the artifact to GitHub Pages. Phaser is a separate vendor chunk; relative base preserves repository-path assets.

## Commands

- Dev: `npm run dev` (port 3000).
- Typecheck / lint / format: `npm run typecheck`, `npm run lint`, `npm run format:check`.
- Unit tests: `npm test`; targeted: `npx vitest run tests/<file>.test.ts`.
- Build / preview: `npm run build`, `npm run preview`.
- Production smoke: `npx playwright install chromium`, then `npm run e2e` (vite preview, port 4173).
- Live CDP suites: `node scripts/test-gameplay.js`, `test-combat.js`, `test-inventory-save.js`, `test-session-regression.js` (dev server required).
- Play: https://vanduc1610.github.io/Chrono/ (deployment depends on Pages configuration and CI success).
