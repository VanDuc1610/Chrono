# CHRONO – Task Board

**Coordinator:** Claude Code (assigns tasks, writes Antigravity prompts, decides when to push).
**Owner / final approver:** Project owner (all art approval stays with the owner).

## Protocol (both agents MUST follow)

1. **Read this file before starting work.** Only work on tasks assigned to you.
2. **File locks:** a task in `IN PROGRESS` owns the files listed under _Locks_. The other agent must not edit those files until the task is `DONE`.
3. **Need a file that is locked?** Stop and report to the owner — do not edit it.
4. **Commit only your own task's files**, one logical change per commit. Run `npm run typecheck` before committing code.
5. **Git:** `git pull --rebase` before committing/pushing. Never force-push, never rewrite pushed history.
6. **When finished:** set status to `DONE`, add a one-line result at the top of _Done_, and if _Done_ has more than 5 entries move the oldest to `docs/TASKS_ARCHIVE.md` (top of its list). Commit this file with your work.
7. Art pipeline rules in [AGENTS.md](../AGENTS.md) always apply. No task here authorizes generating art or promoting assets without owner approval.

Status values: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

---

## Active

Goal (owner, 2026-11-12): Chapter 1 "The Last Sunset" per `docs/story/CHAPTER_01_DESIGN.md` (approved, §10 contract).

### T-44 · Chapter 1 maps, enemies, art

- **Assignee:** Claude · **Status:** TODO
- **Locks:** `public/assets/data/maps.json`, `public/assets/data/enemies.json`, `scripts/`, `art-source/`, `public/assets/`

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-43** Chapter 1 "The Last Sunset" content (`dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`): Vietnamese dialogue across all 5 maps, 8 quests (5 main chain + 3 side quests), 3 items (no equipment), Time Anchor 3-layer rotation (`clearFlags` + `refreshMap`), 3-pillar bell sequence (`ch1_bell_step_1/2` + wrong-strike reset), unnamed watch case without Kuro/"K...", Bà Tư distinct from Cô Ba; verified with `typecheck`, `lint`, `prettier --check .`, and 62 unit tests — Antigravity
- **T-42** Chapter 1 engine: dialogue effects `clearFlags` and `refreshMap` (map rebuilt in place after the dialogue, Peter keeps his spot), repeating loop triggers (`repeat`, `unlessFlag`, `teleportTo` spawn with a short fade), `layerVariants` (tile layers by flag, e.g. low tide), validation for loops/spawns, clearer layer errors. Verified: 61 unit tests (4 new), 4 CDP suites, live probe (loop twice → broken loop passes; refresh keeps position and swaps layers) — Claude
- **T-41** Chapter 1 design (`docs/story/CHAPTER_01_DESIGN.md`) approved by owner 2026-11-12 with all 5 coordinator recommendations; engine/content/art contract in §10 — Antigravity (design), Claude (review)
- **T-40** Release pipeline: CI now builds once, runs a Playwright smoke test of the production build in Chromium, Firefox and WebKit (boot, new game, real keys, movement, quick-save + reload → Continue), then deploys dist/ to GitHub Pages from main (needs Pages source = GitHub Actions). `npm run e2e` runs it locally; all 3 browsers pass — Claude
- **T-39** Peter empty-handed idle/walk approved and integrated (`CHAR_PETER_004`); Peter is unarmed in Acts 1-2 and armed from the Elder's blade on. Verified live — Claude
