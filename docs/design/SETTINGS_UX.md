# CHRONO – Settings, Pause Menu & Save Slots (UX Spec)

**Status:** Design spec ready for implementation (Codex / Claude).  
**Target viewport:** `640×360` (`VT323` pixel font from `T-91`, NineSlice panels via `createPanel`).  
**Current state:** `MainMenuScene.ts` `"Tuỳ chọn"` only toggles mute; `ExplorationScene.ts` `ESC` jumps straight to `returnToMenu()`; `SaveSystem.ts` already keys `chrono_save_slot_<n>` (`ISaveData` v`0.4.0`), but only slot `1` is used.

---

## 1. Settings Data Model & Defaults

Stored in `localStorage` under `chrono_settings_v1` (in-memory fallback if storage is unavailable). On first load, if `chrono_audio_settings` exists, migrate `masterVolume`, `bgmVolume`, `sfxVolume`, `isMuted` into `chrono_settings_v1` and keep `SoundSystem` in sync.

| Key               | Type & Values                      | Default    | Notes / Storage                                                                 |
| :---------------- | :--------------------------------- | :--------- | :------------------------------------------------------------------------------ |
| `masterVolume`    | `number` (`0.0`–`1.0`, step `0.1`) | `0.8`      | Synced to `SoundSystem`; `M` toggles `isMuted`.                                 |
| `musicVolume`     | `number` (`0.0`–`1.0`, step `0.1`) | `0.4`      | Maps to `SoundSystem.bgmVolume` (was `0.42`).                                   |
| `sfxVolume`       | `number` (`0.0`–`1.0`, step `0.1`) | `0.6`      | Maps to `SoundSystem.sfxVolume`.                                                |
| `textSpeed`       | `'instant' \| 'fast' \| 'normal'`  | `'normal'` | `DialogueBox.ts`: `0 ms`, `10 ms`, `18 ms` (`TYPE_DELAY_MS`) per char.          |
| `screenShake`     | `boolean`                          | `true`     | Guards `cameras.main.shake(...)` in `ActionCombat`, `BossFight`, `CombatScene`. |
| `reducedFlashes`  | `boolean`                          | `false`    | Clamps `cameras.main.flash(...)` alpha `≤ 0.15` and disables strobe pulses.     |
| `neonDefault`     | `boolean`                          | `true`     | Initial `NeonSkin` state on map load (`N` still toggles live in-scene).         |
| `lightingDefault` | `boolean`                          | `true`     | Initial `Atmosphere` state on map load (`L` still toggles live in-scene).       |
| `language`        | `'vi'`                             | `'vi'`     | Locked UI row: `"Tiếng Việt (Mặc định)"` — placeholder for future locales.      |
| `keyBindings`     | `Record<RebindAction, string>`     | See §1.1   | Stored as Phaser `KeyCode` names (e.g. `'E'`, `'SPACE'`, `'I'`).                |

### 1.1 Key Rebinding (`keyBindings`)

- **Fixed keys (not rebindable):** Movement (`W/A/S/D` + Arrow keys), `ESC` (Pause / Back), `1–4` (Dialogue choices & quick-slots).
- **Rebindable actions & defaults** (matching `ExplorationScene.setupKeys()` & `ActionCombat.ts`):
  - `interact`: `E` (`Tương tác / Thoại`) · `attack`: `SPACE` (`Tấn công`) · `ranged`: `F` (`Bắn xa`) · `dodge`: `SHIFT` (`Né đòn`)
  - `satchel`: `I` (`Túi đồ`) · `questLog`: `J` (`Nhiệm vụ`) · `questCycle`: `Q` (`Đổi nhiệm vụ`)
  - `quickSave`: `K` (`Lưu nhanh`) · `lightingToggle`: `L` (`Ánh sáng`) · `neonToggle`: `N` (`Viền neon`) · `controlsHint`: `H` (`Phím tắt`)
- **Conflict rule:** If the pressed key is fixed (`WASD`/Arrows/`ESC`/`1-4`), reject with `"Phím hệ thống, không thể gán"`. If already bound to another rebindable action, **swap** the two keys and show `"Đã đổi phím với <Tên hành động>"`. Pressing `R` (or clicking `"Mặc định"`) resets all bindings after a 1-click confirm.

---

## 2. Options Screen (`Tuỳ chọn`) — Accessible from Main Menu & Pause Menu

```text
+------------------------------------------------------------------+ 640x360
|                         TUỲ CHỌN (OPTIONS)                       |
|  [Âm thanh]   [Hiển thị & Chữ]   [Điều khiển]                    |
|------------------------------------------------------------------|
|  Âm lượng tổng      [████████░░]  80%     (< / > hoặc kéo)       |
|  Nhạc nền           [████░░░░░░]  40%                            |
|  Hiệu ứng (SFX)     [██████░░░░]  60%                            |
|  Tắt tiếng (Mute)   [ Tắt ]                                      |
|  Ngôn ngữ           Tiếng Việt (Mặc định)  [Khoá]                |
|                                                                  |
|  (Tab 2: Tốc độ chữ [Bình thường] · Rung [Bật] · Giảm chớp [Tắt] |
|          Neon mặc định [Bật] · Ánh sáng mặc định [Bật])          |
|------------------------------------------------------------------|
|  [Mặc định]                                        [Quay lại]    |
+------------------------------------------------------------------+
```

- **Keyboard:** `Tab` / `Q` / `E` or `Left/Right` on header tabs switches category; `Up/Down` selects row; `Left/Right` adjusts slider/enum; `Enter`/`Space` toggles checkbox or starts key-capture (`"Nhấn phím bất kỳ... (ESC huỷ)"`); `ESC` saves & closes.
- **Mouse:** Click tabs, click/drag volume bars, click toggles, click `Quay lại`.

---

## 3. Pause Menu (`Tạm dừng` — `ESC` in `ExplorationScene`)

### 3.1 Priority & Blocking Rules

When `ESC` is pressed in `ExplorationScene`:

1. If `satchel.isOpen`: `satchel.back()` or close satchel (unchanged).
2. Else if `dialogueBox.isOpen()`: close dialogue if cancellable (unchanged).
3. Else if `isFrozen || isTransitioning`: **ignore `ESC`** (cutscenes, map fades, ending cards).
4. Else: **open Pause Menu** (pauses `Player`, `ActionCombat`, `BossFight`, and active `timedFlags` timers; ducks BGM `-6 dB`).

| Pause Item (`640×360` overlay) | Normal Exploration | During Boss Fight (`bossFight?.isActive()`)         |
| :----------------------------- | :----------------- | :-------------------------------------------------- |
| `Tiếp tục` (Resume)            | Enabled            | Enabled                                             |
| `Lưu trò chơi` (Save)          | Enabled            | **Disabled** (`"Không thể lưu khi đang đấu trùm"`)  |
| `Tải trò chơi` (Load)          | Enabled            | **Disabled** (`"Không thể tải khi đang đấu trùm"`)  |
| `Tuỳ chọn` (Options)           | Enabled            | Enabled                                             |
| `Điều khiển` (Controls)        | Enabled            | Enabled (read-only cheat sheet of current bindings) |
| `Về màn hình chính` (Title)    | Enabled → confirm  | Enabled → confirm (`"Tiến trình chưa lưu sẽ mất!"`) |

```text
+------------------------------------------------------------------+
|                                                                  |
|                   +--------------------------+                   |
|                   |         TẠM DỪNG         |                   |
|                   |--------------------------|                   |
|                   |  > Tiếp tục              |                   |
|                   |    Lưu trò chơi          |                   |
|                   |    Tải trò chơi          |                   |
|                   |    Tuỳ chọn              |                   |
|                   |    Điều khiển            |                   |
|                   |    Về màn hình chính     |                   |
|                   +--------------------------+                   |
|                     ESC: Tiếp tục · Enter: Chọn                  |
+------------------------------------------------------------------+
```

---

## 4. Three Save Slots (`Lưu / Tải trò chơi`)

### 4.1 Slot Card & Metadata

Uses `SaveSystem` keys `chrono_save_slot_1`, `chrono_save_slot_2`, `chrono_save_slot_3`. Extend `ISaveMetadata` (or resolve in UI) with `chapter: number` and `mapName: string` (looked up from `maps.json` by `mapId`, fallback `mapId`).

```text
+------------------------------------------------------------------+
|                      CHỌN Ô LƯU (SAVE / LOAD)                    |
|  +------------------------------------------------------------+  |
|  | > Ô 1 · Chương 4 — Doanh Trại Veridia                      |  |
|  |   Cấp 14 · Thời gian: 02:15:30 · 17/11/2026 11:15          |  |
|  +------------------------------------------------------------+  |
|  |   Ô 2 · Chương 1 — Làng Chài Hoàng Hôn                     |  |
|  |   Cấp 4  · Thời gian: 00:38:12 · 16/11/2026 20:40          |  |
|  +------------------------------------------------------------+  |
|  |   Ô 3 · [ Trống ]                                          |  |
|  +------------------------------------------------------------+  |
|  Enter: Lưu/Tải · Del/X: Xoá ô · ESC: Quay lại                   |
+------------------------------------------------------------------+
```

### 4.2 Confirmations, Migration & Autosave Rules

- **Overwrite confirm (Save mode on non-empty slot):** Modal `"Ghi đè lên Ô <n> (Chương <c> · Cấp <lv>)?"` with `[Huỷ]` / `[Ghi đè]` (default focus: `Ghi đè`? Better: default `Huỷ` for safety, `Left/Right` to switch).
- **Delete confirm (`Del` / `X` or `[Xoá]` icon on non-empty slot):** Modal `"Xoá vĩnh viễn Ô <n>? Không thể hoàn tác."` with `[Huỷ]` / `[Xoá]` (default focus: **`Huỷ`**).
- **Single-save migration:** Existing saves already live in `chrono_save_slot_1`, so they appear directly in **Ô 1** with zero migration script needed. On `MainMenuScene`, `"Tiếp tục"` (`continue`) becomes enabled if **any** of slots `1–3` has valid data and loads the slot with the **newest `timestamp`**. Add `"Tải trò chơi"` below `"Tiếp tục"` (or open the 3-slot picker from `"Tiếp tục"` when >1 slot exists).
- **Quick Save (`K`) & Autosave:** Track `activeSaveSlot` (`1 | 2 | 3`, default `1` on New Game, or the loaded slot). Pressing `K` saves to `activeSaveSlot` and shows `"Đã lưu nhanh (Ô <n>)"`. **No silent overwrite of manual slots 1–3 on map change;** chapter-end saves go to `activeSaveSlot` (or confirm if switching slots).

---

## 5. Open Questions for Owner

1. **Main Menu `"Tiếp tục"` behaviour:** Should `"Tiếp tục"` immediately load the newest slot (1 click) with a separate `"Tải trò chơi"` button for the 3-slot picker, or always open the 3-slot picker when >1 slot is occupied?
2. **Autosave slot:** Do we want a dedicated 4th read-only `Lưu tự động` (`chrono_save_autosave`) on chapter transitions, or keep only the 3 manual slots + `K` quick-save?
3. **Boss-fight retry:** When `ESC → Về màn hình chính` is used during a boss fight, is the current warning `"Tiến trình chưa lưu sẽ mất!"` sufficient, or should Pause also offer `"Thử lại trận trùm"` (restart boss fight)?
