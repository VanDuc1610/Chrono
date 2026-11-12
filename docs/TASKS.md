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

Goal (owner, 2026-11-12, playtest feedback): small enemies are fought **in real time on the map**
(left click slash toward the cursor, Shift dodge, right click Temporal Strike 6 MP once learned,
keys 1-4 quick items); bosses stay turn-based. Peter is ambushed unarmed, the Elder rescues him,
lets him rest and explains, then fights beside him; the Elder teaches the skill later. Equipment:
weapon + charm. Defeated → revive at the map's safe point, full HP, no loss. Roaming enemies respawn
when the map is re-entered (story/quest enemies do not).

### T-45 · Real-time map combat, Elder follower, ambush

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/`, `public/assets/data/maps.json`, `public/assets/data/enemies.json`, `public/assets/data/player.json`, `public/assets/data/strings.json`, `scripts/`, `tests/` (except `tests/content-data.test.ts`)

### T-46 · Equipment (weapon + charm) and quick-item slots

- **Assignee:** Claude · **Status:** TODO (after T-45) · **Locks:** same as T-45

### T-47 · Prologue v3.1 ambush/rescue/teaching + Chapter 1 hidden mirror cache (content)

- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `public/assets/data/dialogue.json`, `public/assets/data/quests.json`, `public/assets/data/items.json`, `tests/content-data.test.ts`, `docs/story/PROLOGUE_V3_PROPOSAL.md`, `docs/story/CHAPTER_01_DESIGN.md`
- **Engine contract:** [docs/implementation/ACTION_COMBAT_CONTRACT.md](implementation/ACTION_COMBAT_CONTRACT.md)

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-44** Chapter 1 playable: 5 maps (Bờ Biển Hoàng Hôn → Làng Chài → Hải Đăng → Hành Lang Đáy Biển → Thánh Điện) with time loops, Time Anchor 3 layers (cataclysm freezes the village), low-tide layer, bell sequence, Drowned Drifters + Echo Chorister, boss The Sunken Bellkeeper (3-step bell mechanic), Continuum Seal → "HOÀN THÀNH CHƯƠNG 1". Prologue end card continues into Chapter 1; level cap 3 in the Prologue, 7 after; map ambient light, NPC tint/alpha, HUD chapter name. Art batch approved and integrated (ENV_COASTAL_002, ENV_WILDS_002, ENV_SUNKEN_001, NPC_OLD_KEEPER_001, MOB_DRIFTER_001, BOSS_BELLKEEPER_001). Verified: 62 unit tests, 4 CDP suites (combat suite now waits for Peter's turn), full live playthrough (Lv 6 at the boss, Lv 7 at the end) — Claude
- **T-43** Chapter 1 "The Last Sunset" content (`dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`): Vietnamese dialogue across all 5 maps, 8 quests (5 main chain + 3 side quests), 3 items (no equipment), Time Anchor 3-layer rotation (`clearFlags` + `refreshMap`), 3-pillar bell sequence (`ch1_bell_step_1/2` + wrong-strike reset), unnamed watch case without Kuro/"K...", Bà Tư distinct from Cô Ba; verified with `typecheck`, `lint`, `prettier --check .`, and 62 unit tests — Antigravity
- **T-42** Chapter 1 engine: dialogue effects `clearFlags` and `refreshMap` (map rebuilt in place after the dialogue, Peter keeps his spot), repeating loop triggers (`repeat`, `unlessFlag`, `teleportTo` spawn with a short fade), `layerVariants` (tile layers by flag, e.g. low tide), validation for loops/spawns, clearer layer errors. Verified: 61 unit tests (4 new), 4 CDP suites, live probe (loop twice → broken loop passes; refresh keeps position and swaps layers) — Claude
- **T-41** Chapter 1 design (`docs/story/CHAPTER_01_DESIGN.md`) approved by owner 2026-11-12 with all 5 coordinator recommendations; engine/content/art contract in §10 — Antigravity (design), Claude (review)
- **T-40** Release pipeline: CI now builds once, runs a Playwright smoke test of the production build in Chromium, Firefox and WebKit (boot, new game, real keys, movement, quick-save + reload → Continue), then deploys dist/ to GitHub Pages from main (needs Pages source = GitHub Actions). `npm run e2e` runs it locally; all 3 browsers pass — Claude
