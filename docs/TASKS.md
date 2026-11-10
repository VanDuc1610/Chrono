# CHRONO – Task Board

**Coordinator:** Claude Code (assigns tasks, writes Antigravity prompts, decides when to push).
**Owner / final approver:** Project owner (all art approval stays with the owner).

## Protocol (both agents MUST follow)

1. **Read this file before starting work.** Only work on tasks assigned to you.
2. **File locks:** a task in `IN PROGRESS` owns the files listed under _Locks_. The other agent must not edit those files until the task is `DONE`.
3. **Need a file that is locked?** Stop and report to the owner — do not edit it.
4. **Commit only your own task's files**, one logical change per commit. Run `npm run typecheck` before committing code.
5. **Git:** `git pull --rebase` before committing/pushing. Never force-push, never rewrite pushed history.
6. **When finished:** set status to `DONE`, add a one-line result, commit this file with your work.
7. Art pipeline rules in [AGENTS.md](../AGENTS.md) always apply. No task here authorizes generating art or promoting assets without owner approval.

Status values: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

---

## Active

### T-05 · Peter idle + walk candidate sheets

- **Assignee:** Owner (manual, AUTOMATIC1111) · **Status:** TODO
- Use `art-source/characters/peter/prompts/peter_idle.txt` and `peter_walk.txt`; drop PNGs into `art-source/characters/peter/generated/candidates/`. Claude validates afterwards.

## Backlog (scheduled after current locks are released)

### T-12 · Use consumables from the Satchel in exploration

- **Assignee:** unassigned · **Status:** TODO
- HP now persists between battles, but shards can only be used in combat. Add a "use" action in the Satchel overlay (heal via `items.json` `effects.healAmount`, consume 1). Show Lv / EXP / HP in the exploration HUD.

### T-13 · Stale quest HUD text

- **Assignee:** unassigned · **Status:** TODO
- `ExplorationScene.updateQuestHUD()` shows "✓ Awaiting Milestone 3 (Combat)" after the prologue quest completes — dev placeholder text visible to players. Needs owner-approved wording (or move to `quests.json`).

---

## Done

- **T-07** One-time `prettier --write .` over the repo (69 files, formatting only — verified no wording/LaTeX changes in docs). From now on keep `npm run format:check` clean before committing — Claude
- **T-09** `GameSession` (`src/state/`) now owns inventory, quests, flags, level/EXP/HP, playtime; New Game / Continue create or hydrate it. Speed initiative, probabilistic escape, item consumption, EXP + level-ups + loot tables, quest rewards (claimed once), all tuning in new `public/assets/data/player.json`. Fixes B1-B6, B8-B10, B13, B14 (supersedes T-06). `CombatSystem.setRandomSource()` added; `test-session-regression.js` switched to it — stubbing global `Math.random` crashed Phaser Text creation. Verified: 5/5 regression scenarios PASS (all 5 FAIL on pre-T-09 code), test-gameplay / test-combat / test-inventory-save PASS, 22 logic unit checks PASS — Claude
- **T-11** Added `scripts/test-session-regression.js` CDP suite verifying B1, B2, B3, B4, and B6 with per-scenario `PASS`/`FAIL` output (confirmed all 5 reproduce pre-T-09) — Antigravity
- **T-10** Owner decisions (2026-11-10): (a) combat uses speed-based initiative; Escape stays but can fail (probability from speed, a failed escape costs the turn); (b) EXP + levelling are in scope for the prologue — Owner
- **T-08** Fixed B5 (defend stance never expired), B7 (ESC `JustDown` read twice → menu always false), B11 (save data validated + version-checked; CONTINUE only for loadable saves), B12 (`getLastFacing` on `IMovementSystem`, no down-cast) — Claude
- **T-02** Code review of `src/`: 14 findings, 6 gameplay-breaking — [reviews/T-02_CODE_REVIEW.md](reviews/T-02_CODE_REVIEW.md) — Claude
- **T-04** Added procedural Web Audio BGM loops (`ambient` ruin theme for `MainMenuScene`/`ExplorationScene`, `battle` theme for `CombatScene`) with crossfade, mute/volume sync, and full oscillator/node teardown on scene shutdown — Antigravity
- **T-03** Updated `AGENTS.md` §1 roles to match `CLAUDE.md` §1 (Claude Code = project coordinator + implementer/reviewer; Antigravity = implementation agent) and linked `docs/TASKS.md` while preserving all art/Peter rules — Antigravity (`8368622`)
- **T-01** ESLint 9 (flat config, typescript-eslint) + Prettier 3 (single quotes, width 100, LF); scripts `lint`, `lint:fix`, `format`, `format:check`. Fixed `validate-candidate.js`: rejects 16-bit/indexed/interlaced PNGs instead of mis-decoding them, and adds the missing horizontal frame-centering check — Claude

- **T-00a** Git init, baseline commit, `.gitignore` / `.gitattributes`, push to origin — Claude (`ffb72c3`)
- **T-00b** Dedupe root art docs, reclassify Peter runtime sprites as placeholders in ASSET_REGISTRY — Claude (`6ed7c8d`)
