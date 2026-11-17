# CHRONO – Audio Plan (Music & SFX)

**Status:** Proposal for owner approval (no audio files downloaded or committed yet).  
**Current state:** `src/systems/audio/SoundSystem.ts` synthesises 2 procedural Web Audio loops (`ambient`, `battle`) and 5 SFX (`playCursorBlip`, `playSelect`, `playSlash`, `playHeal`, `playSaveChime`).  
**Design goal:** Replace procedural loops with cohesive real tracks from a small, verified set of OpenGameArt composers (**cynicmusic**, **Alexandr Zhelanov**, **Matthew Pablo**, **Kistol**, **CleytonKauffman**, **Jonathan So**) and 2 CC0 SFX packs (**artisticdude**, **SubspaceAudio**). All licences verified on their OpenGameArt pages (CC0, CC-BY 3.0/4.0, or OGA-BY 3.0; zero NC/ND). Exact track durations are marked `unverified` until downloaded.

---

## 1. Music Plan (Menu, Exploration Ch 0–9, Combat, Story, Endings)

| Slot / Context                                                | Mood & Match (`LPC_ASSET_MAP.md`)                            | Track Title & Author                                                                                                                   | Source URL                                                        | Licence         | Format / Length / Loop                                                   |
| :------------------------------------------------------------ | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :-------------- | :----------------------------------------------------------------------- |
| **Main Menu**                                                 | Quiet cosmic mystery, ticking anticipation                   | _Title Theme_ — Jonathan So                                                                                                            | https://opengameart.org/content/title-theme                       | CC0             | MP3/WAV (transcode OGG) · length unverified · **Loops cleanly** (stated) |
| **Ch 0 · Prologue** (`map_peters_room`..`map_old_lighthouse`) | Warm sepia-dusk coastal Vietnam, nostalgia before the fall   | _Town Theme RPG_ — cynicmusic                                                                                                          | https://opengameart.org/content/town-theme-rpg                    | CC0             | MP3 (transcode OGG) · length unverified · check/trim loop                |
| **Ch 1 · Vương Quốc Hoàng Hôn** (`map_ch1_*`)                 | Amber-crimson sunset, drowned fishing village, melancholy    | _Path to Lake Land_ — Alexandr Zhelanov                                                                                                | https://opengameart.org/content/path-to-lake-land                 | CC-BY 3.0       | OGG · length unverified · check/trim loop                                |
| **Ch 2 · Đế Chế Nhân Quả Giả** (`map_ch2_*`)                  | Imperial brass/ochre stone, rigid law & catacomb resistance  | _For the king_ — Alexandr Zhelanov                                                                                                     | https://opengameart.org/content/for-the-king                      | CC-BY 4.0       | OGG · length unverified · check/trim loop                                |
| **Ch 3 · Vương Quốc Linh Hồn** (`map_ch3_*`)                  | Cold crypt indigo, silent necropolis, memory crystals        | _Crystal Cave (song18)_ — cynicmusic                                                                                                   | https://opengameart.org/content/crystal-cave-song18               | CC0             | MP3 (transcode OGG) · length unverified · **Loops cleanly** (stated)     |
| **Ch 4 · Cuộc Chiến Bất Tận** (`map_ch4_*`)                   | Scorched ember war camp (`Doanh Trại Veridia`), ash plains   | _Dark Ambient_ — Extra_super_special                                                                                                   | https://opengameart.org/content/dark-ambient                      | CC-BY 3.0       | MP3 (transcode OGG) · length unverified · **Loops cleanly** (stated)     |
| **Ch 5 · Khu Vườn Khả Năng** (`map_ch5_*`)                    | Phosphor emerald garden, nostalgic Alpha vs steel Beta       | _The Field Of Dreams_ — pauliuw                                                                                                        | https://opengameart.org/content/the-field-of-dreams               | CC0             | MP3 (transcode OGG) · length unverified · **Loops cleanly** (stated)     |
| **Ch 6 · Giờ Của Chư Thần** (`map_ch6_*`)                     | Astral blue & white-gold celestial halls (`T-86` neon void)  | _Behind the Universe_ — Alexandr Zhelanov                                                                                              | https://opengameart.org/content/behind-the-universe               | CC-BY 3.0       | OGG / MP3 · length unverified · check/trim loop                          |
| **Ch 7 · Chiếc Nôi Bị Quên Lãng** (`map_ch7_*`)               | Deep abyssal violet, faded ash shore, ink lake               | _Emerald Tower_ — Kistol                                                                                                               | https://opengameart.org/content/emerald-tower                     | CC0             | OGG · length unverified · **Loops cleanly** (stated)                     |
| **Ch 8 · Giờ Số Không** (`map_ch8_*`)                         | Furnace bronze, twin-era warfront, Anchor Tower gears        | _Cave Theme_ — Brandon75689                                                                                                            | https://opengameart.org/content/cave-theme                        | OGA-BY 3.0      | OGG · length unverified · check/trim loop                                |
| **Ch 9 · Vương Miện Vĩnh Hằng** (`map_ch9_*`)                 | Prismatic astral gold & violet, final nexus & Penrose stairs | _A start to space_ — Centurion_of_war                                                                                                  | https://opengameart.org/content/a-start-to-space                  | CC0             | OGG · length unverified · **Loops cleanly** (stated)                     |
| **Normal Battle** (`CombatScene`)                             | Crisp tactical turn-based tension                            | _Battle Theme A_ — cynicmusic                                                                                                          | https://opengameart.org/content/battle-theme-a                    | CC0             | MP3 (transcode OGG) · length unverified · check/trim loop                |
| **Boss Battle** (`BossFight.ts`)                              | High-tempo real-time boss pressure                           | _Boss Battle Theme_ — CleytonKauffman                                                                                                  | https://opengameart.org/content/boss-battle-theme                 | CC0             | OGG / MP3 · length unverified · **Loops cleanly** (stated)               |
| **Final Boss** (Ch 9 Sixfold / Kuro)                          | Tragic, climactic confrontation                              | _Heroic Demise [Updated Version]_ — Matthew Pablo                                                                                      | https://opengameart.org/content/heroic-demise-updated-version     | CC-BY 3.0       | MP3 (transcode OGG) · length unverified · check/trim loop                |
| **Sad / Quiet Story Moments**                                 | Loss, flashbacks, Bà Mai's lullaby, quiet revelations        | _Soliloquy_ — Matthew Pablo                                                                                                            | https://opengameart.org/content/soliloquy                         | CC-BY 3.0       | MP3 (transcode OGG) · length unverified · play once or soft loop         |
| **Endings (4 routes)**                                        | Order / Unbound / Last Chronarch / Puppet Master             | E1 (Order): _For the king_; E2 (Unbound): _Enchanted Festival_ — Matthew Pablo; E3 (True): _Path to Lake Land_; E4 (Kuro): _Soliloquy_ | https://opengameart.org/content/enchanted-festival (others above) | CC-BY 3.0 / 4.0 | ZIP/OGG/MP3 · length unverified · E2 **Loops cleanly** (stated)          |

---

## 2. Sound Effects (Current Events + Missing Events)

Two cohesive **CC0** packs cover every event with zero attribution overhead:

- **Pack A — `RPG Sound Pack`** by _artisticdude_ (https://opengameart.org/content/rpg-sound-pack, **CC0**, WAV/OGG in ZIP) — organic fantasy/RPG foley (blades, footsteps, doors, bags, hits).
- **Pack B — `512 Sound Effects (8-bit style)`** by _SubspaceAudio / Juhani Junkala_ (https://opengameart.org/content/512-sound-effects-8-bit-style, **CC0**, WAV in ZIP) — crisp retro UI, dialogue blips, temporal/neon chimes, dodge/shot.

| Event                        | Current `SoundSystem` Method & Call Sites                                          | Planned Source Pack & File Category                          |
| :--------------------------- | :--------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **Menu / UI move**           | `playCursorBlip()` (`MainMenuScene`, `ExplorationScene` satchel/quest cycle)       | **Pack B** (`sfx_menu_move*`)                                |
| **Menu confirm / dial turn** | `playSelect()` (`MainMenuScene`, `PrologueEndScene`, `BossFight`, `Chapter4Field`) | **Pack B** (`sfx_menu_select*`)                              |
| **Menu cancel / back**       | _(missing — currently silent)_                                                     | **Pack B** (`sfx_menu_cancel*`)                              |
| **Dialogue blip**            | _(missing — `DialogueBox` types silently)_                                         | **Pack B** (`sfx_blip_text*`, pitch-varied ±5%)              |
| **Blade slash (swing)**      | `playSlash()` (`ActionCombat`, `BossFight`, `Chapter4Field`)                       | **Pack A** (`swing` / `sword-unsheathe`)                     |
| **Blade hit (impact)**       | _(missing — shares `playSlash()`)_                                                 | **Pack A** (`hit` / `metal-clash`)                           |
| **Ranged / chronal shot**    | _(missing — shares `playSlash()`)_                                                 | **Pack B** (`sfx_wpn_laser` / pulse, low-pass filtered)      |
| **Dodge / dash**             | _(missing)_                                                                        | **Pack B** (`sfx_movement_jump` / whoosh)                    |
| **Player / enemy hurt**      | _(missing)_                                                                        | **Pack A** (`grunt` / `hit_flesh`)                           |
| **Heal / Chrono Shard**      | `playHeal()` (`ExplorationScene` item use)                                         | **Pack B** (`sfx_coin_cluster` / soft chime)                 |
| **Save chime**               | `playSaveChime()` (`ExplorationScene` quick save / save slot)                      | **Pack B** (`sfx_sounds_powerup*`)                           |
| **Item pickup**              | _(missing)_                                                                        | **Pack A** (`cloth` / `coin`) + **Pack B** chime             |
| **Level up**                 | _(missing)_                                                                        | **Pack B** (`sfx_sounds_fanfare*`)                           |
| **Puzzle solved**            | _(missing — `Chapter4Field` uses `playSelect()`)_                                  | **Pack B** (`sfx_sounds_interaction*` / 3-note chord)        |
| **Footsteps**                | _(missing)_                                                                        | **Pack A** (`footstep_grass` / `footstep_stone`, 3 variants) |
| **Door / map exit**          | _(missing)_                                                                        | **Pack A** (`doorOpen_1` / `creak`)                          |

---

## 3. Required Attribution Lines (CC-BY / OGA-BY)

CC0 picks require no legal attribution (still credited in `CREDITS.md` as courtesy). The following **must** appear in `CREDITS.md` and the in-game credits screen:

- _"Path to Lake Land"_, _"Behind the Universe"_, _"For the king"_ by **Alexandr Zhelanov** (https://soundcloud.com/alexandr-zhelanov) — CC-BY 3.0 / CC-BY 4.0.
- _"Soliloquy"_, _"Heroic Demise [Updated Version]"_, _"Enchanted Festival"_ by **Matthew Pablo** — CC-BY 3.0.
- _"Dark Ambient"_ by **Extra_super_special** (via OpenGameArt) — CC-BY 3.0.
- _"Cave Theme"_ by **Brandon75689** (via OpenGameArt) — OGA-BY 3.0.

---

## 4. Integration Note

- **Directory & Naming:** `public/assets/audio/bgm/<track_id>.ogg` (plus `.mp3` fallback) and `public/assets/audio/sfx/<sfx_id>.ogg` (plus `.mp3`). Keep `SoundSystem` synthesis as automatic fallback if a file fails to decode or in headless tests.
- **Format & Loudness:** Encode primary assets as **OGG Vorbis (q5, ~160 kbps)** with **MP3 (160 kbps)** fallback for Safari/iOS. Normalize BGM to **-16 LUFS** (true peak ≤ -1.0 dBTP) and SFX to **-12 LUFS** so dialogue and combat cues sit clearly above exploration music.
- **Chapter-to-Track Mapping (`mapDef.bgm` / `mapId` prefix):**
  - `map_peters_room`, `map_coastal_town`, `map_shattered_antechamber`, `map_forgotten_forest`, `map_old_lighthouse` → `bgm_ch0_prologue`
  - `map_ch1_*` → `bgm_ch1_sunset` · `map_ch2_*` → `bgm_ch2_empire` · `map_ch3_*` → `bgm_ch3_crypt`
  - `map_ch4_*` → `bgm_ch4_war` · `map_ch5_*` → `bgm_ch5_garden` · `map_ch6_*` → `bgm_ch6_gods`
  - `map_ch7_*` → `bgm_ch7_cradle` · `map_ch8_*` → `bgm_ch8_null` · `map_ch9_*` → `bgm_ch9_crown`
- **Crossfade & Continuity:** On map transition in `ExplorationScene`, resolve the target `track_id`. If it matches the currently playing track (e.g. moving between two `map_ch4_*` maps), **do not restart** — let the loop continue seamlessly. If the track changes, crossfade over **500 ms** (`crossfadeMs = 500`, matching `SoundSystem` channel disposal). Duck BGM by **-6 dB** during boss dialogue and fade to `bgm_sad_soliloquy` on key story flags.
