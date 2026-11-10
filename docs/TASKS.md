# CHRONO – Task Board

**Coordinator:** Claude Code (assigns tasks, writes Antigravity prompts, decides when to push).
**Owner / final approver:** Project owner (all art approval stays with the owner).

## Protocol (both agents MUST follow)

1. **Read this file before starting work.** Only work on tasks assigned to you.
2. **File locks:** a task in `IN PROGRESS` owns the files listed under *Locks*. The other agent must not edit those files until the task is `DONE`.
3. **Need a file that is locked?** Stop and report to the owner — do not edit it.
4. **Commit only your own task's files**, one logical change per commit. Run `npm run typecheck` before committing code.
5. **Git:** `git pull --rebase` before committing/pushing. Never force-push, never rewrite pushed history.
6. **When finished:** set status to `DONE`, add a one-line result, commit this file with your work.
7. Art pipeline rules in [AGENTS.md](../AGENTS.md) always apply. No task here authorizes generating art or promoting assets without owner approval.

Status values: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

---

## Active

### T-08 · Fix review findings in unlocked system files (B5, B7, B11, B12)
- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/systems/combat/CombatSystem.ts`, `src/systems/input/KeyboardPlayerController.ts`, `src/systems/save/SaveSystem.ts`, `src/systems/movement/IMovementSystem.ts`, `src/systems/movement/TopDownMovementSystem.ts`, `src/entities/Player.ts`
- See [reviews/T-02_CODE_REVIEW.md](reviews/T-02_CODE_REVIEW.md).

### T-05 · Peter idle + walk candidate sheets
- **Assignee:** Owner (manual, AUTOMATIC1111) · **Status:** TODO
- Use `art-source/characters/peter/prompts/peter_idle.txt` and `peter_walk.txt`; drop PNGs into `art-source/characters/peter/generated/candidates/`. Claude validates afterwards.

## Backlog (scheduled after current locks are released)

### T-06 · Remove `any` in CombatScene (lint errors)
- **Assignee:** Claude · **Status:** TODO — blocked until T-04 releases `CombatScene.ts`
- `npm run lint` reports 2× `no-explicit-any` at `src/scenes/CombatScene.ts:47-48`.

### T-07 · One-time repo-wide Prettier format
- **Assignee:** Claude · **Status:** TODO — only when no task holds locks on `src/` (touches ~72 files)
- Run `npm run format` in a single dedicated commit; afterwards both agents keep `npm run format:check` clean.

---

## Done

- **T-04** Added procedural Web Audio BGM loops (`ambient` ruin theme for `MainMenuScene`/`ExplorationScene`, `battle` theme for `CombatScene`) with crossfade, mute/volume sync, and full oscillator/node teardown on scene shutdown — Antigravity
- **T-03** Updated `AGENTS.md` §1 roles to match `CLAUDE.md` §1 (Claude Code = project coordinator + implementer/reviewer; Antigravity = implementation agent) and linked `docs/TASKS.md` while preserving all art/Peter rules — Antigravity (`8368622`)
- **T-01** ESLint 9 (flat config, typescript-eslint) + Prettier 3 (single quotes, width 100, LF); scripts `lint`, `lint:fix`, `format`, `format:check`. Fixed `validate-candidate.js`: rejects 16-bit/indexed/interlaced PNGs instead of mis-decoding them, and adds the missing horizontal frame-centering check — Claude

- **T-00a** Git init, baseline commit, `.gitignore` / `.gitattributes`, push to origin — Claude (`ffb72c3`)
- **T-00b** Dedupe root art docs, reclassify Peter runtime sprites as placeholders in ASSET_REGISTRY — Claude (`6ed7c8d`)
