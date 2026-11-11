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

Goal (owner, 2026-11-11): rebuild the Prologue per `docs/story/PROLOGUE_V2_DESIGN.md` (approved), all in-game text in Vietnamese.

### T-29 · Prologue v2 content in Vietnamese (data only)

- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `public/assets/data/dialogue.json`, `quests.json`, `items.json`, `enemies.json`, `tests/content-data.test.ts`
- Vietnamese dialogue/quests/items for all Prologue v2 beats + translate the existing Antechamber content. Not `maps.json` / `strings.json` (Claude adds map entries when the art lands).

### T-31 · Prologue v2 art: `wilds_tileset` (Pipeline B)

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `scripts/author-wilds-tileset.js` (new), `scripts/wilds-layout.js` (new), `art-source/environment/wilds/`
- Forgotten Forest + lighthouse headland in one 32×32 tileset; previews of both planned maps; owner approval.

## Backlog (scheduled after current locks are released)

- **Prologue v2 maps** (Claude) — forest + lighthouse tilemaps once `wilds_tileset` is approved (room + town done in T-30).
- **Drowned Sentinel combat mechanics** (Claude) — boss phases + environment actions (lens commands) in `CombatSystem` / `enemies.json`, after T-29.
- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-30** `coastal_tileset` approved (`ENV_COASTAL_001`) and integrated: Peter's room (14×10) and the coastal town (28×18) generated from `scripts/coastal-layout.js` → `scripts/generate-coastal-maps.js`; new games start in the room (opening line there), door → town → forest path (temporarily straight to the Antechamber). Small maps are centred by the camera; exits ignore a spawn placed inside them until Peter steps out. Browser suites now enter the Antechamber explicitly. Verified: 42 unit tests, 4 CDP suites, live journey room → town → Antechamber — Claude
- **T-28** Multi-map world engine: everything placed in the world comes from `maps.json` (NPCs with state-based dialogue rules, POIs, encounters, exits with flag gates, arrive/zone triggers, revive point, aliases for old save ids); PreloadScene loads every listed map; `mapId` saved; Prologue ending via `effects.endPrologue`. `interactables.json` merged into `maps.json`. ExplorationScene 1220 → ~520 lines, UI split into `src/ui/` modules; HUD/dialogue/satchel text Vietnamese from `strings.json`. Verified: 42 unit tests (map validation, aliases, strings), 4 CDP suites, live probe of an exit, the data-driven ending and Vietnamese rendering — Claude
- **T-27** Prologue v2 design (`docs/story/PROLOGUE_V2_DESIGN.md`, Vietnamese) approved by owner 2026-11-11 with coordinator fixes: 2 merged tilesets (coastal, wilds), correct 32×32 specs, Temporal Sight innate, Elder no longer pre-empts the UNWRITTEN reveal, Empty Seat / forgotten child / lighthouse keeper beats added, lens puzzle as in-combat environment actions — Antigravity (design), Claude (review)
- **T-26** Integrated `UI_SET_001` panel frame (`createPanel` helper in `src/ui/Panel.ts` using `ui_frame` 48×48 NineSlice with 16 px corners and ≥8 px inner padding) across `ExplorationScene`, `CombatScene` (with `setTint`/`clearTint` on the command panel per turn state), `MainMenuScene` (options modal + `ui_cursor` sprite playing `ui_cursor_pulse`), and `PrologueEndScene` (card); verified with `typecheck`, `lint`, `prettier --check`, 34 unit tests, 4 CDP suites, and screenshot inspection — Antigravity
- **T-24** Peter combat sheets (attack 6f, hurt 2f, temporal_sight 4f × 4 dirs) approved by owner and integrated (`CHAR_PETER_003`): CombatScene shows Peter in profile, Attack = slash + lunge, Skill = Temporal Sight wind-up then strike, enemy hits = hurt recoil/flash; damage numbers land on impact. Verified with a live-engine animation probe, 34 unit tests, 4 CDP suites — Claude
