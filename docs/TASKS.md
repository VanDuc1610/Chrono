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

### T-01 · ESLint + Prettier setup
- **Assignee:** Claude · **Status:** TODO
- **Locks:** `package.json`, `package-lock.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`
- Add flat-config ESLint (typescript-eslint) + Prettier matching `.vscode/settings.json` (2 spaces, LF). Add `lint` / `format` scripts. **No repo-wide reformat** in this task (would collide with other work).

### T-02 · Architecture & code review of `src/`
- **Assignee:** Claude · **Status:** TODO
- **Locks:** none (read-only). Findings are written up as follow-up tasks; fixes are scheduled only after the files are free.

### T-03 · Update agent roles in AGENTS.md
- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `AGENTS.md`
- Replace the role lines in §1 so they match [CLAUDE.md](../CLAUDE.md) §1 (Claude = coordinator + implementer/reviewer; Antigravity = implementation agent) and link to this task board.

### T-04 · Procedural BGM (Milestone 6 audio)
- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `src/systems/audio/SoundSystem.ts`, `src/scenes/ExplorationScene.ts`, `src/scenes/CombatScene.ts`, `src/scenes/MainMenuScene.ts`
- Add Web Audio–synthesized looping music to `SoundSystem`: ambient ruin theme (exploration/menu) and battle theme (combat), with crossfade on scene change, respecting existing volume/mute. Stop all audio nodes on scene shutdown (no leaked oscillators on re-entry). No audio files, no copyrighted melodies.

### T-05 · Peter idle + walk candidate sheets
- **Assignee:** Owner (manual, AUTOMATIC1111) · **Status:** TODO
- Use `art-source/characters/peter/prompts/peter_idle.txt` and `peter_walk.txt`; drop PNGs into `art-source/characters/peter/generated/candidates/`. Claude validates afterwards.

---

## Done

- **T-00a** Git init, baseline commit, `.gitignore` / `.gitattributes`, push to origin — Claude (`ffb72c3`)
- **T-00b** Dedupe root art docs, reclassify Peter runtime sprites as placeholders in ASSET_REGISTRY — Claude (`6ed7c8d`)
