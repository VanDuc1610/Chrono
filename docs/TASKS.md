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

### T-42 · Chapter 1 engine: loop zones, in-place map refresh, layer variants, clearFlags

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/`, `tests/` (except `tests/content-data.test.ts`), `public/assets/data/player.json`

### T-43 · Chapter 1 content (data only)

- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `public/assets/data/dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`

### T-44 · Chapter 1 maps, enemies, art

- **Assignee:** Claude · **Status:** TODO (after T-42)
- **Locks:** `public/assets/data/maps.json`, `public/assets/data/enemies.json`, `scripts/`, `art-source/`, `public/assets/`

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-41** Chapter 1 design (`docs/story/CHAPTER_01_DESIGN.md`) approved by owner 2026-11-12 with all 5 coordinator recommendations; engine/content/art contract in §10 — Antigravity (design), Claude (review)
- **T-40** Release pipeline: CI now builds once, runs a Playwright smoke test of the production build in Chromium, Firefox and WebKit (boot, new game, real keys, movement, quick-save + reload → Continue), then deploys dist/ to GitHub Pages from main (needs Pages source = GitHub Actions). `npm run e2e` runs it locally; all 3 browsers pass — Claude
- **T-39** Peter empty-handed idle/walk approved and integrated (`CHAR_PETER_004`); Peter is unarmed in Acts 1-2 and armed from the Elder's blade on. Verified live — Claude
- **T-37** Prologue v3 playable through acts 1-3: commands gated by flags (player.json `commandFlags`, saves < 0.3 migrated), scripted first battle (`enemy_rift_shade_first`: Escape locked, the Elder appears in round 2 and throws the blade), frozen town/attic (`frozenWhen`, Elder `resistsFreeze`), flag-based dialogue for NPCs and points of interest, hidden encounter started by the time-stop trigger, Elder visit as a vision, customer door, forest path opens with `elder_joined`, "time restored" beat on the headland. T-38 reviewed (good; battle lines double-prefixed by the engine — fixed). Verified live with real keys from New Game to the forest quest + 57 unit tests + 4 CDP suites — Claude
- **T-38** Rewrote Prologue v3 Vietnamese dialogue, quests, and items per `docs/story/PROLOGUE_V3_PROPOSAL.md` §2/§5/§6: Act 1 watchmaker morning (`intro_awakening`, `room_*`, `elder_shop_visit`, `watch_delivery`, `relic_chronometer`, `brass_key` with zero cosmic vocabulary); Act 2–3 beats (`town_time_stops`, `battle_elder_intervenes` 4 lines ≤ 90 chars, `elder_after_first_battle` granting `broken_blade`, `grandfather_watch_awakens`, `elder_explains_frozen_town`, `*_frozen` town NPC/POI variants); Antechamber Elder-as-teacher + 7 Authority lessons; mysterious `town_time_restored` ending; 5-act quest chain (`quest_prologue_timestop`, `quest_prologue_watch` added, existing ids kept); verified with `typecheck`, `lint`, `prettier --check .`, and 52 Vitest tests — Antigravity
