# CHRONO – Task Board

**Coordinator:** Claude Code (assigns tasks, writes Antigravity and Codex prompts, decides when to push).
**Agents:** Claude Code · Google Antigravity · OpenAI Codex (joined 2026-11-15; takes only tasks assigned to it here).
**Owner / final approver:** Project owner (all art approval stays with the owner).

## Protocol (all agents MUST follow)

1. **Read this file before starting work** (all agents: Claude, Antigravity, Codex). Only work on tasks assigned to you.
2. **File locks:** a task in `IN PROGRESS` owns the files listed under _Locks_. No other agent may edit those files until the task is `DONE`.
3. **Need a file that is locked?** Stop and report to the owner — do not edit it.
4. **Commit only your own task's files**, one logical change per commit. Run `npm run typecheck` before committing code.
5. **Git:** `git pull --rebase` before committing/pushing. Never force-push, never rewrite pushed history.
6. **When finished:** set status to `DONE`, add a one-line result at the top of _Done_, and if _Done_ has more than 5 entries move the oldest to `docs/TASKS_ARCHIVE.md` (top of its list). Commit this file with your work.
7. Art pipeline rules in [AGENTS.md](../AGENTS.md) always apply. No task here authorizes generating art or promoting assets without owner approval.

Status values: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

---

## Active

Goal (owner, 2026-11-15): Chapters 5–7 are built and wait for the owner's playtest. Chapters 8 and 9
are built and verified — the story is complete (4 endings). Next: the owner's playtest of Chapters 5–9. The story ends at Chapter 9.

### T-84 · Boss đánh trực tiếp (real-time) + đa dạng vũ khí/trang bị — **Claude** · `DONE`

Owner, 2026-11-16: bosses leave turn-based — Peter fights them live in an arena, each boss with its
own attack and defence patterns; normal encounters stay as they are. Gear splits into four slots:
melee weapon, ranged weapon, armor, accessory. Prototype on the Chapter 1 boss first for the owner's playtest. Owner, same day: no separate arena — the boss fights Peter on its own map right after their meeting dialogue (exits closed until it falls). Owner approved the feel and pixelfx (MIT, vendored in `src/vendor/pixelfx`): Prologue–Chapter 2 bosses converted (Time Wraith with fists and the Elder's rescue, Drowned Sentinel, Sunken Bellkeeper's three locks, Imperial Verdict's sentences). Chapters 3–5 converted with distinct mechanics (Faceless Keeper's memory lock, Nameless Choir's songs, Crimson Standard's blood wall, The Last War's ritual and feints, Alpha Peter's mirror and letter, Kuro's spar, Unborn King's orbiting crowns). Chapters 6–9 converted (18 bosses: glyph songs, hammer cadence, Genesis purge and pin, forgetting mist, falling tears, ink memory lock + name call, twin halos, heal penalty + triple verdict, the 25th hour hand with companion calls, six seals, stone blocks, gold/violet pair, chain, Lyra's sentences, drifting pages, mirror self, puppet wall, singularity pull). Every boss is now fought on its map; Chapter 9 ending flags are set by the finishers as before.

_Locks:_ `src/world/BossFight.ts` (new), `src/ui/DialogueBox.ts`, `src/systems/dialogue/DialogueSystem.ts`, `src/systems/boss/*` (new), `src/systems/fx/*` (new), `src/vendor/pixelfx/*` (new), `.prettierignore`, `eslint.config.js`, `public/assets/data/maps.json`, `public/assets/data/bosses.json` (new),
`src/systems/inventory/InventoryTypes.ts`, `src/state/GameSession.ts`, `src/systems/save/SaveTypes.ts`,
`src/ui/SatchelPanel.ts`, `src/world/ActionCombat.ts`, `src/scenes/ExplorationScene.ts`, `src/scenes/PreloadScene.ts`, `src/config.ts`,
`public/assets/data/items.json`, `public/assets/data/enemies.json`, `public/assets/data/strings.json`, `scripts/arsenal.mjs` (new).

### T-83 · Chapter 9 answer key (`docs/testing/DAP_AN_CHUONG_9.md`) — **Codex** · `DONE`

_Locks:_ `docs/testing/DAP_AN_CHUONG_9.md` (new). Read-only: everything else.

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-80** Chapter 9 (the finale) playable: art (nexus tileset + 14 sprites, owner approved), 23 maps — six shared, route "Chiếc Ghế Trống" (Penrose, matrix, Architect, chimes, astrolabe, the Unwritten page, the Sixfold throne, the Crown) and route "Kẻ Giật Dây" (Chronos bound, four lieutenants, Kuro the Puppet Master), three hidden maps; 13 dial puzzles (solver-proved), Sentinel thrust / Inquisitor four-blow chain field foes, four endings through Codex's ending cards, level cap 30, chapter select 9. Verified: 198 unit tests, live CDP runs of both routes, every puzzle, every boss and all four endings — Claude
- **T-82** Chapter 9 engine: paired gold/violet block rings, companion calls with heal/stun/flag gates, the four-card ending router — Codex
- **T-81** Chapter 9 dialogue script (`docs/story/CHAPTER_09_SCRIPT.md`, 147 nodes for both routes) — Antigravity
- **T-81** Chapter 9 dialogue script (`docs/story/CHAPTER_09_SCRIPT.md`, Vietnamese): full script across all 22 maps (both routes, crown, epilogue, 3 hidden maps) with arrival lines, NPCs (with past-flag variants), clues/secrets pickups, C01–C13 puzzles (intro/clue/wrong/right/done), boss confronts and victories, `ch9_kuro_crossroad` choice, and beat-by-beat dialogue for all 4 endings; lines ≤ 220 chars, Kuro "tao/mày", Lyra halberd, C10 slots shuffled — Antigravity
- **T-79** Map lint errors in chapters 0–7 fixed (spawns moved off exits, blocked exits and the Chapter 5 seal path opened; zero lint errors left) and the Chapter 8 answer key (`docs/testing/DAP_AN_CHUONG_8.md`) — Codex
