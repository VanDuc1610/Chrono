# Action combat — engine ↔ content contract (T-45 / T-46 / T-47)

Owner decisions (2026-11-12): small enemies are fought in real time on the map; bosses stay
turn-based. Controls: **left click** slash toward the cursor, **Shift** dodge (short invulnerable
dash), **right click** Temporal Strike (6 MP, needs `learned_temporal_sight`), **1-4** quick items,
**I/B** bag (equip weapon + charm). Defeated → revive at the map's safe point with full HP, nothing
lost. Roaming enemies respawn when the map is re-entered; story enemies (`respawn: false`) do not.

Claude owns the engine and `maps.json` / `enemies.json` / `player.json` / `strings.json`.
Antigravity owns `dialogue.json` / `quests.json` / `items.json` content.

## 1. New dialogue effects (engine, T-45)

| Key        | Value                                  | Meaning                                               |
| ---------- | -------------------------------------- | ----------------------------------------------------- |
| `warpTo`   | `{ "mapId": "...", "spawnId": "..." }` | After the dialogue closes: fade out, move Peter there |
| `healFull` | `true`                                 | HP and MP refilled                                    |

All existing keys still work (`setFlags`, `clearFlags`, `startQuest`, `grantItems`, `grantExp` +
`grantOnceFlag`, `endPrologue`, `endChapter`, `refreshMap`).

## 2. Flags

Read by the engine:

- `has_broken_blade` — left click slashes (no weapon: no slash).
- `learned_temporal_sight` — right click Temporal Strike.
- `elder_joined` and not `elder_parted` — the Elder follows Peter on the map and attacks enemies.

Set by the engine:

- `cleared_<group>` — every roaming enemy of that group (maps.json `group`) is defeated, e.g.
  `cleared_town_shades`. Use it in quest objectives (`completeOnFlag`) and dialogue rules.

Fixed ids the engine will use (Antigravity writes the nodes, Claude places them on the maps):

| Id                          | Kind     | When                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `battle_elder_rescue`       | dialogue | The ambushing Shade has brought Peter to 1 HP. The Elder appears and drives it off. Effects must include `setFlags: ["rescued_by_elder"]`, `healFull: true`, `warpTo: { "mapId": "map_peters_room", "spawnId": "rest" }`                                                                                                     |
| `elder_rest_explain`        | dialogue | Peter wakes in his room (trigger: `rescued_by_elder`, once). The Elder explains, hands over the blade: `setFlags: ["has_broken_blade", "elder_joined"]`, `grantItems` `broken_blade`, `startQuest: "quest_prologue_first_hunt"`. Teach the controls in the lines: left click slash, Shift dodge, I to open the bag and equip |
| `quest_prologue_first_hunt` | quest    | Clear the Shades roaming the frozen town with the Elder: objective `completeOnFlag: "cleared_town_shades"`; follow-up continues the existing watch chain                                                                                                                                                                     |
| `elder_after_hunt`          | dialogue | Opened when `cleared_town_shades` (Claude adds the trigger). Leads to the grandfather's watch                                                                                                                                                                                                                                |
| `elder_teach_skill`         | dialogue | After `grandfather_watch_awakens` (which keeps `setFlags: ["learned_temporal_sight"]`): the Elder teaches right click Temporal Strike, 6 MP                                                                                                                                                                                  |

`town_time_stops` keeps its role but no longer starts a battle (the ambushing Shade roams the
map while `time_frozen` and not `rescued_by_elder`). `battle_elder_intervenes` and
`elder_after_first_battle` are retired (the turn-based first battle is removed).

## 3. Items (engine, T-46)

```json
{ "id": "broken_blade", "type": "weapon", "equip": { "attack": 2, "reach": 28, "swingMs": 420 } }
{ "id": "...", "type": "charm", "equip": { "maxHp": 10, "maxMp": 0, "defense": 1, "speed": 0 } }
```

`equip` fields are all optional: `attack`, `defense`, `maxHp`, `maxMp`, `speed` are stat bonuses;
`reach` (px, default 28) and `swingMs` (ms between slashes, default 420) only for weapons.
Granting a weapon or charm does not equip it; the player equips in the bag. Saves from before
equipment get `broken_blade` equipped if they have `has_broken_blade`.

## 4. Chapter 1 hidden mirror cache (T-47 content, Claude places it)

Not in the quest log. In `map_ch1_sunken_corridors`: three mirrors (`poi_mirror_1..3`) and a sealed
chest (`poi_mirror_cache`). Each mirror's dialogue aligns it (`ch1_mirror_<n>_aligned`); the light
reaches the chest only when all three are aligned in order (1 → 2 → 3; a mirror out of order
resets the others with `clearFlags`). The chest grants the new weapon once (`grantOnceFlag:
"granted_mirror_cache"`). A hint hides in an existing text (e.g. the keeper's logbook). Name the
weapon and one charm in `items.json`; Claude adds mirror tiles (owner approval) and places them.

## 5. Bag tabs, notes and puzzle items (engine, owner request 2026-11-13)

The bag has four tabs (Left / Right): **Trang bị** (`weapon`, `charm`), **Vật phẩm**
(`consumable`, `material`), **Ghi chép** (`document`), **Manh mối** (`key_item`, `puzzle`).

- `"type": "document"` with `"pages": ["...", "..."]` — E opens a reader, Left / Right turns
  pages. Use notes to hide puzzle clues and lore (letters, journal pages, logbooks).
- `"type": "puzzle"` — an object Peter carries to the right place (a gear, a lens, a bell clapper).
- Dialogue rules (NPCs and interactables) accept `ifItem` / `unlessItem`: e.g. the broken
  pedestal shows "place the lens" only while Peter carries the lens.
- Dialogue effect `takeItems: [{ "itemId": "...", "quantity": 1 }]` hands an item over / uses it up
  (a placed puzzle object, a delivered letter).
