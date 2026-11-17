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

### Roadmap — comprehensive upgrade (owner, 2026-11-17: "upgrade everything")

Run in parallel, each agent inside its own locks. Order of what follows: UI and release first (seen by
every player), then sound, settings and saves, then combat and code health, then per-map LPC dressing.

1. T-91 UI overhaul (Claude) · 2. T-92 build, release, smoke tests (Codex) · 3. T-93 audio plan
   (Antigravity) · 4. T-94 settings, pause and save-slot design (Antigravity) · 5. T-95 docs refresh
   (Codex) · later: audio integration, settings implementation, one combat system (design first),
   ActionCombat/BossFight split, gamepad and touch, LPC dressing per map, chapters 6-9 structure,
   key rebinding (T-94 §1.1).

### T-91 · UI overhaul: pixel font with Vietnamese, compact HUD, controls bar — **Claude** · `DONE`

VT323 (SIL OFL, full Vietnamese) for every UI text; a compact HUD that frees the screen; the controls
bar no longer overflows; dialogue box and menus polished. Done so far: VT323 everywhere through
`crispText` (sizes x1.4, no synthetic bold, the boot waits for the font), compact status panel (place,
level, HP/MP bars with values, EXP hairline), slimmer quest tracker, the key list folded behind H.
Title screen: a slow clock of light behind the title, Peter (LPC idle) at its edge, the tagline now "Thần Tính Rạn Vỡ" in mixed case so its diacritics read.

_Locks:_ `src/ui/*`, `src/scenes/MainMenuScene.ts`, `src/scenes/BootScene.ts`, `index.html`,
`public/assets/fonts/*` (new).

### T-92 · Build, release and smoke tests — **Codex** · `DONE`

Split the Phaser vendor chunk, deploy the build to GitHub Pages from CI, and a Playwright smoke test of
the built game (boot, menu, new game, first map, no console errors). No change under `src/`.

_Locks:_ `vite.config.ts`, `.github/workflows/*`, `playwright.config.ts`, `e2e/*`, `package.json`
(scripts only), `README.md`.

### T-93 · Audio plan: music and sound effects — **Antigravity** · `DONE`

Free music per chapter (menu, exploration, battle, boss, ending) and the sound effects mapped to the
game's events, with exact sources and licences, ready for the owner to approve. Nothing downloaded or
committed into `public/assets/` in this task.

_Locks:_ `docs/audio/*` (new).

### T-94 · Settings, pause menu and save slots — design — **Antigravity** · `DONE` (after T-93)

A spec for the options (volumes, text speed, screen shake, flashes, key bindings), a pause menu and
three save slots, written so it can be implemented without further questions.

_Locks:_ `docs/design/SETTINGS_UX.md` (new).

### T-95 · Docs refresh — **Codex** · `DONE`

Bring `docs/context/PROJECT_MAP.md`, `docs/PROJECT_CONTEXT.md` status sections and `README.md` up to
date (story complete, LPC look, neon skin, real-time bosses); move stale root screenshots and duplicate
root docs into `docs/archive/`.

_Locks:_ `docs/context/*`, `docs/PROJECT_CONTEXT.md`, `docs/archive/*` (new), root `*.png`,
root duplicate docs (`ART_GUIDE.md`, `PETER_DESIGN.md`, `ASSET_REGISTRY.md` only if duplicated).

### T-97 · Audio integration — **Codex** · `IN PROGRESS`

Vendor the approved tracks and sound effects with credits (pinned, hashed, like `scripts/lpc/*`), a music
player per chapter/battle/boss with crossfades that follows `src/state/Settings.ts`, and the missing sound
effects; procedural sound stays as the fallback. API only: Claude wires the scenes.

Implementation prepared locally: four pinned music excerpts, music/SFX API, queueAudio helper and tests. Owner chose to retain the T-88 credits-generator lock; Claude must merge the audio fragment using `art-source/audio/README.md` before T-97 can be DONE/committed. Other planned downloads timed out and remain explicitly dropped with procedural fallback.

_Locks:_ `src/systems/audio/*`, `scripts/audio/*` (new), `art-source/audio/*` (new),
`public/assets/audio/*`, `tests/audio*.test.ts` (new), `CREDITS.md` (audio section only).

### T-98 · Split ActionCombat.ts into modules (no behaviour change) — **Codex** · `DONE`

`src/world/ActionCombat.ts` is 2,458 lines. Split it into focused modules under `src/world/action/`
(roamers, field foes, shots, hazards, HUD bars...) keeping its public API, so `ExplorationScene` and
`BossFight` need no change; move pure rules to `src/systems/action/` with unit tests.

_Locks:_ `src/world/ActionCombat.ts`, `src/world/action/*` (new), `src/systems/action/*`,
`tests/action*.test.ts`.

### T-96 · Settings, pause menu and three save slots — **Claude** · `DONE`

Built from Antigravity's T-94 spec (open questions answered with the defaults: "Tiếp tục" loads the newest
slot and "Tải trò chơi" opens the picker; no autosave slot; leaving a boss fight only warns). Key rebinding
is left for a later task.

_Locks (released):_ `src/state/Settings.ts`, `src/ui/OptionsPanel.ts`, `src/ui/SaveSlotsPanel.ts`,
`src/ui/Comfort.ts`, `src/ui/controlList.ts`, `src/scenes/PauseScene.ts`, `src/scenes/MainMenuScene.ts`,
`src/ui/DialogueBox.ts`, `src/systems/audio/SoundSystem.ts`, `src/config.ts`, `src/main.ts`.

### T-88 · LPC world: Peter at the LPC scale, then the engine and Veridia — **Claude** · `IN PROGRESS`

Owner, 2026-11-17: the look moves to LPC 3/4 pixel art (CC-BY-SA 3.0, credits required); the Veridia
mockup and Peter's LPC front were approved (keep him slender; 64x64 frames). Steps: Peter idle + walk in
four directions (owner approved), then his other eight sets (idle/walk unarmed, run, attack, hurt, Temporal Sight, dash, shoot). Owner approved all ten with black curls (2026-11-17); integrated: 64x64 sheets, origin 14 px above the soles so positions and the 18x14 collider are unchanged, turn-based combat at 1.25x. Engine pass done: contact shadows and depth by the feet for Peter, people, roamers and the boss (`ActorShadows`); optional `overlay`/`above` map layers (walk behind tents); colour grade per map (`atmosphere.json` `grade`); neon `accentsOnly` for LPC maps. Veridia rebuilt in LPC (`scripts/lpc/veridia.mjs`: atlas from the pinned sheets, same collision for every old blocker, tents at LPC size, camp clutter; derived atlas credited via `art-source/lpc/derived.json`). Swept all 131 maps in the browser: no errors. Chapters 0-5 (52 more maps) reskinned by `scripts/lpc/reskin.mjs`: the seven old tilesets rebuilt slot for slot from LPC materials (tinted per tileset; glyphs, cracks and puddles carried over; story props kept), so maps, collision, puzzle swaps and layer variants are untouched; wall tops drawn above walkable tiles north of walls (`WallCaps`, `lpc.json`); chapter colour grades (palettes from T-90) and neon accents only for chapters 0-5; six more LPC sheets vendored and credited. Swept all 131 maps: no errors. Soft terrain edges on the chapter 0-5 maps (`TerrainEdges`, rules in `EdgeRules`, tested): where sand meets water or grass meets dirt, the higher kind's LPC border pieces follow an organic line; lone tiles become small patches; paving takes spills. Next: flat decor scatter, then multi-tile props on the maps that pay most. then engine work
(contact shadows, y-sorted multi-tile props, chapter colour grade) and Veridia rebuilt in LPC tiles.

_Locks:_ `scripts/author-peter-lpc.js` (new), `art-source/characters/peter/generated/candidates/peter_lpc_*` (new),
`docs/art/PETER_DESIGN.md`, `docs/art/SPRITE_PIPELINE.md`, `public/assets/characters/peter/*`, `src/entities/Player.ts`,
`src/systems/animation/PeterAnimationConfig.ts`, `src/scenes/PreloadScene.ts`, `src/scenes/CombatScene.ts`, `src/scenes/ExplorationScene.ts`,
`src/world/ActorShadows.ts` (new), `src/world/Atmosphere.ts`, `src/world/NeonSkin.ts`, `src/world/MapTypes.ts`, `src/world/BossFight.ts`,
`scripts/lpc/*`, `scripts/pixel-art/png-read.js` (new), `art-source/lpc/derived.json` (new), `public/assets/lpc/*` (new), `CREDITS.md`,
`tests/lpc-credits.test.ts`, `public/assets/maps/map_ch4_encampment_veridia_lpc.json` (new), `scripts/atmosphere.mjs`, `scripts/neon.mjs`,
`src/world/WallCaps.ts` (new), `public/assets/data/lpc.json` (new), `art-source/lpc/manifest.json`,
`src/world/EdgeRules.ts` (new), `src/world/TerrainEdges.ts` (new), `tests/edge-rules.test.ts` (new).

### T-89 · LPC asset vendoring + credits manifest — **Codex** · `DONE`

A pinned, reproducible import of the LPC sheets we use, with a credits manifest and a test that fails when
any LPC file lacks authors/licence. No art decisions; no file enters `public/assets/` in this task.

_Locks:_ `scripts/lpc/*` (new), `art-source/lpc/*` (new), `CREDITS.md` (new), `tests/lpc-credits.test.ts` (new).

### T-90 · LPC asset map per chapter and biome — **Antigravity** · `DONE`

Design doc: for every chapter and kind of place, which LPC sheets/tiles/props fit, what is missing, and the
palette shift each chapter needs. Read-only on code and assets.

_Locks:_ `docs/art/LPC_ASSET_MAP.md` (new).

### T-87 · Chapter 8: Ivo hands over his notebook (gear puzzle clue) — **Codex** · `DONE`

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

- **T-97** Music in the game: 15 OpenGameArt tracks (menu, chapters 0-9, battle, boss, final boss, story) pinned with licence evidence and credited; game-wide player with crossfades following the settings; wired into title, maps, bosses, turn-based battles, chapter cards and endings; shot/hurt/dodge effects - Codex (import, player) + Claude (retry, credits, wiring)
- **T-98** Split ActionCombat into six typed-context modules; preserved extracted bodies and scene API, pure geometry rules tested; 271 unit tests, production smoke and CDP combat passed - Codex
- **T-96** Settings (volumes, text speed, shake, fewer flashes, neon/lighting defaults; stored, legacy audio migrated, tested), options panel, pause menu on ESC (map frozen; save/load closed in boss fights), three save slots with overwrite/delete confirmations; checked end to end in the browser and by the production smoke test - Claude
- **T-94** Settings, pause menu & save slots spec (`docs/design/SETTINGS_UX.md`): defined `chrono_settings_v1` schema/defaults, key rebinding with swap/conflict rules, `ESC` pause menu with dialogue/cutscene/boss gating, 3-slot save/load/delete/migration flows, `640x360` ASCII mock-ups, and 3 owner questions — Antigravity
- **T-93** Audio plan (`docs/audio/AUDIO_PLAN.md`): mapped verified CC0/CC-BY/OGA-BY music (menu, Ch 0–9 exploration, normal/boss/final-boss, sad story, 4 endings) and 2 CC0 SFX packs (`RPG Sound Pack`, `512 Sound Effects`) to all `SoundSystem` and missing events, with attribution and OGG/loudness/crossfade integration spec — Antigravity
