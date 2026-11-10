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

### T-21 · Prologue 10–15 min environmental narrative content proposal

- **Assignee:** Antigravity · **Status:** BLOCKED — awaiting owner review
- **Locks:** `docs/narrative/PROLOGUE_CONTENT_PROPOSAL.md`
- Wrote [narrative/PROLOGUE_CONTENT_PROPOSAL.md](narrative/PROLOGUE_CONTENT_PROPOSAL.md): 7 environmental interactables (`I-1..I-7`) mapped to exact tiles in the existing 24×18 Shattered Antechamber, draft branching dialogues, 1 optional side quest (`quest_prologue_remnants` using `completeOnFlag`/`rewards`), strict `CONFIRMED CANON` vs. `PROPOSED` separation (Peter's identity unwritten; Kuro foreshadowed only), and per-phase playtime estimates (11.5–16.0 min total).

### T-22 · Prologue content — engine, interactables & prop art (Claude)

- **Assignee:** Claude · **Status:** IN PROGRESS (engine done; prop art next)
- **Locks:** `src/**`, `public/assets/data/interactables.json`, `public/assets/maps/`, `public/assets/tilesets/`, `scripts/author-*`, `scripts/generate-map.js`, `art-source/environment/`, `tests/dialogue-effects.test.ts`
- Implements the approved T-21 proposal (owner approved 2026-11-11). Engine: dialogue node `effects` (setFlags / startQuest / grantItems + grantOnceFlag) applied via `GameSession.applyDialogueEffects`; 7 points of interest loaded from `interactables.json`. Next: Pipeline B prop tiles (stele, frozen astrolabe, reliquary, threshold gate, torn page) for owner approval, then map placement.

### T-23 · Prologue content — dialogue & quest data (Antigravity)

- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `public/assets/data/dialogue.json`, `public/assets/data/quests.json`, `tests/content-data.test.ts` (new)
- See prompt from Claude (2026-11-11).

## Backlog (scheduled after current locks are released)

---

## Done

- **T-19** Elder Chronographer v3 (slimmer, per owner feedback) approved and integrated: 4-frame spritesheet + global `npc_elder_idle` anim (4 FPS); placeholder removed — Claude
- **T-21** Prologue content proposal (`docs/narrative/PROLOGUE_CONTENT_PROPOSAL.md`) — approved by owner 2026-11-11 — Antigravity
- **T-18 / T-20** Temporal Shade float loop and Shattered Antechamber tileset (Pipeline B) approved by owner and integrated: Shade is a 4-frame spritesheet with a global `enemy_fracture_idle` anim (exploration + combat); tileset swapped in place; `generate-map.js` adds floor variants and a fracture cluster east of the Shade. Placeholder generators no longer overwrite approved art. Verified: 25 unit tests, 4 CDP suites, in-game screenshots — Claude
- **T-16** (owner delegated the calls to Claude) Peter v3 idle/walk approved and integrated (`CHAR_PETER_002`, approval recorded in `peter_design.json`); strap direction documented as left shoulder → right hip per the approved concept; Prologue ending: after "Silence the Fracture" the Elder gives a farewell (`npc_elder_farewell`), then `PrologueEndScene` (level, quests, playtime) returns to the title; defeat = checkpoint revival at the Altar of Moments with full HP, progress and items kept. Verified live (both flows) + 25 unit tests + 4 CDP suites — Claude
- **T-05** Peter idle + walk sheets via Pipeline B (v2 → v3 after owner feedback), closed by the T-16 integration — Claude
- **T-17** Added Vitest (`vitest@3.2.4`) Node unit test suite (25 tests across `tests/game-session.test.ts` and `tests/combat-and-save.test.ts` using live JSON data), `.github/workflows/ci.yml` (Ubuntu, Node 24, `npm ci`, `typecheck`, `lint`, `format:check`, `test`, `build`), and updated `CLAUDE.md` / `README.md` — Antigravity (`e939159`)
- **T-15** GDD alignment: prologue level cap 3 (`expThresholds` [0, 50, 120]; old saves above Lv3 clamp); MP added (`maxMp` 20, +4/level, refilled at each battle start); Temporal Strike costs 6 MP (3 casts per battle), short MP keeps the turn; MP bar + cost label in the combat HUD; fixed overlapping command labels. Verified: 3 logic suites (incl. 8 new MP/cap checks) and 4 CDP suites PASS — Claude
- **T-13** Owner chose option 1: follow-up quest "Silence the Fracture" (defeat the Temporal Shade, +30 EXP + shard) in `quests.json`. Data-driven chaining: `followUpQuestId` on quests, `completeOnFlag` on objectives, applied by `GameSession.syncQuestProgress()` (idempotent; handles Shade beaten before the prologue ends and old saves). `QuestSystem.loadFromState` now restores only progress onto current definitions. Quest HUD text fully from data (stale "Awaiting Milestone 3" removed). Banner queue fixes banners being hidden early by the previous banner's timer. Verified: 9 logic checks, live-engine probe of the chain, 4 CDP suites PASS — Claude
- **T-14** Art rules updated per owner (2026-11-11): new Pipeline B (code-authored pixel art) in AGENTS.md §5, `.agents/rules/chrono-art.md` §4, ASSET_POLICY, CLAUDE.md, PROJECT_CONTEXT §8. Still forbidden: AI image models/APIs, external references, integration without owner approval — Claude
- **T-12** Added consumable item selection (`Up`/`Down`) and usage (`E`/`Space`) in the Satchel overlay (heals via `items.json` `effects.healAmount`, clamps to `maxHp`, blocks when full/empty without consuming) plus `Lv X | EXP a/b | HP c/d` HUD in `ExplorationScene.ts` backed by `GameSession` — Antigravity
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
