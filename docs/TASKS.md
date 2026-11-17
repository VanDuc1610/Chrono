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

### T-88 · LPC world: Peter at the LPC scale, then the engine and Veridia — **Claude** · `IN PROGRESS`

Owner, 2026-11-17: the look moves to LPC 3/4 pixel art (CC-BY-SA 3.0, credits required); the Veridia
mockup and Peter's LPC front were approved (keep him slender; 64x64 frames). Steps: Peter idle + walk in
four directions (done as candidates, waiting on approval), then his other animation sets; then engine work
(contact shadows, y-sorted multi-tile props, chapter colour grade) and Veridia rebuilt in LPC tiles.

_Locks:_ `scripts/author-peter-lpc.js` (new), `art-source/characters/peter/generated/candidates/peter_lpc_*` (new),
`docs/art/PETER_DESIGN.md`.

### T-89 · LPC asset vendoring + credits manifest — **Codex** · `TODO` (after T-87)

A pinned, reproducible import of the LPC sheets we use, with a credits manifest and a test that fails when
any LPC file lacks authors/licence. No art decisions; no file enters `public/assets/` in this task.

_Locks:_ `scripts/lpc/*` (new), `art-source/lpc/*` (new), `CREDITS.md` (new), `tests/lpc-credits.test.ts` (new).

### T-90 · LPC asset map per chapter and biome — **Antigravity** · `DONE`

Design doc: for every chapter and kind of place, which LPC sheets/tiles/props fit, what is missing, and the
palette shift each chapter needs. Read-only on code and assets.

_Locks:_ `docs/art/LPC_ASSET_MAP.md` (new).

### T-87 · Chapter 8: Ivo hands over his notebook (gear puzzle clue) — **Codex** · `TODO`

Owner, 2026-11-17: talking to Ivo in the Gear Market should give Peter the gear measurements directly
(players missed the notebook point at (9,9)). Ivo hands the notebook over in his first dialogue; the
notebook point stays as a reminder. Update the Chapter 8 answer key to match.

_Locks:_ `scripts/content-ch8.mjs`, `public/assets/data/dialogue.json`, `docs/testing/DAP_AN_CHUONG_8.md`.

### T-86 · Neon line-art skin across the whole game — **Claude** · `IN PROGRESS`

Owner, 2026-11-17: try the "cosmic neon" style. The world is redrawn as glowing line art in code, over the
same map data: wall outlines traced from the collision grid, floor-region lines, a drafting grid, stars and
constellations, clock medallions on wall masses and floor sigils, gold frames on exits and puzzle pieces, rings
on points of interest, a soft rim of light on Peter and the people (sprites keep their pixel art). `level` per
map: 1 = full void, below 1 = outlines over the tiles. N toggles. Owner approved the preview; rolled out to all 131 maps (`scripts/neon.mjs`): the skin rises by chapter — Prologue 25%, Ch1 30%, Ch2 40%, Ch3 50%, Ch4 60%, Ch5 70% (from 50% the floor dims and stars come out), Ch6–9 full void. Props (solid clusters of up to 4 tiles away from the border: pillars, statues, crates) keep their pixel art with a contour traced from their own pixels; empty dial spots get a small clock face. Verified on all 131 maps in the browser (no errors, retrace under 20 ms).

_Locks:_ `src/world/NeonSkin.ts` (new), `src/world/NeonTrace.ts` (new), `public/assets/data/neon.json` (new), `scripts/neon.mjs` (new),
`tests/neon.test.ts` (new), `src/world/Atmosphere.ts`, `src/scenes/ExplorationScene.ts`, `src/scenes/PreloadScene.ts`,
`public/assets/data/strings.json`.

### T-85 · Map atmosphere: lights, darkness, motes (free, code-drawn) — **Claude** · `IN PROGRESS`

Owner, 2026-11-16: upgrade graphics with free tools only. First step, previewed on three maps (coastal
town, old lighthouse, bell sanctum): a darkness layer with soft light holes (Peter, points of
interest, fixed lights), coloured glows, vignette and floating motes — all drawn in code; L toggles.
Phaser's Light2D was tried and dropped (light positions skew under Scale.FIT). Owner approved the preview; every map now has one (`scripts/atmosphere.mjs`: a palette per chapter, darkness by kind of place, a breathing light where each boss stands; the three approved maps kept). Next: more animation frames (art, owner approval).

_Locks:_ `src/world/Atmosphere.ts` (new), `public/assets/data/atmosphere.json` (new), `scripts/atmosphere.mjs` (new).

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

- **T-90** LPC asset map (`docs/art/LPC_ASSET_MAP.md`): mapped all 131 maps across Chapters 0–9 to `RPG_Maker_MZ_LPC_Starter_Kit` sheets/props, missing Pipeline B/recolour items, chapter colour grades (`T-86` neon transition from Ch6), recurring NPC generator vs custom split (Peter locked custom), and top 5 priority maps (`Doanh Trại Veridia`, `Thị trấn ven biển`, `Làng Chài Hoàng Hôn`, `Quảng Trường Phán Quyết`, `Vườn Hạt Khả Năng`) — Antigravity
- **T-80** Chapter 9 (the finale) playable: art (nexus tileset + 14 sprites, owner approved), 23 maps — six shared, route "Chiếc Ghế Trống" (Penrose, matrix, Architect, chimes, astrolabe, the Unwritten page, the Sixfold throne, the Crown) and route "Kẻ Giật Dây" (Chronos bound, four lieutenants, Kuro the Puppet Master), three hidden maps; 13 dial puzzles (solver-proved), Sentinel thrust / Inquisitor four-blow chain field foes, four endings through Codex's ending cards, level cap 30, chapter select 9. Verified: 198 unit tests, live CDP runs of both routes, every puzzle, every boss and all four endings — Claude
- **T-82** Chapter 9 engine: paired gold/violet block rings, companion calls with heal/stun/flag gates, the four-card ending router — Codex
- **T-81** Chapter 9 dialogue script (`docs/story/CHAPTER_09_SCRIPT.md`, 147 nodes for both routes) — Antigravity
- **T-81** Chapter 9 dialogue script (`docs/story/CHAPTER_09_SCRIPT.md`, Vietnamese): full script across all 22 maps (both routes, crown, epilogue, 3 hidden maps) with arrival lines, NPCs (with past-flag variants), clues/secrets pickups, C01–C13 puzzles (intro/clue/wrong/right/done), boss confronts and victories, `ch9_kuro_crossroad` choice, and beat-by-beat dialogue for all 4 endings; lines ≤ 220 chars, Kuro "tao/mày", Lyra halberd, C10 slots shuffled — Antigravity
