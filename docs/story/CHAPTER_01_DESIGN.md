# THIẾT KẾ CHI TIẾT CHAPTER 1: "THE LAST SUNSET" (HOÀNG HÔN CUỐI CÙNG)

**Mã tài liệu:** `docs/story/CHAPTER_01_DESIGN.md`  
**Trạng thái:** `[DRAFT / PROPOSAL]` – Chờ Owner phê duyệt  
**Quyền năng (Authority):** **Continuum** (Liên Tục / Dòng chảy)  
**Tham chiếu Canon:** `STORY_CHAPTER_01.md`, `CANON_AND_OPEN_QUESTIONS.md`, `PROLOGUE_V3_PROPOSAL.md` (§1–2, §5), `CHANGELOG.md` [1.2.0], `PROGRESSION_DESIGN.md`

> **Ràng buộc kế thừa từ Prologue v3:** Peter (26 tuổi, thợ sửa đồng hồ từ Khánh Hòa) rời quê nhà cùng **Trưởng Lão Thời Gian** khi thị trấn tạm chạy lại bình thường; anh mang theo **Thanh Kiếm Gãy**, **Nhãn Thời Gian** và **chiếc đồng hồ quả quýt của ông nội** vẫn khẽ chạy ngược khi không ai nhìn. Quy tắc cứng: Kuro tuyệt đối không xuất hiện (chỉ có gợi ý gián tiếp); không giải thích lý do Peter là Unwritten (`OQ-01`); Conceptual Erasure diễn ra từ từ để lại Residual Existence; dị thường không nhất thiết mang ác ý. Mọi ý tưởng mới gắn thẻ `[PROPOSAL]`. Tiến độ cấp độ kế thừa Prologue (Lv 3) hướng tới mức **Lv 6–8** `[PROPOSAL]` trên trần Lv 30 (`PROGRESSION_DESIGN.md`).

---

## 1. Tiền Đề & Động Lực Cá Nhân (Premise & Emotional Hook)

Peter rời Khánh Hòa theo chân Trưởng Lão không phải để gánh vác sứ mệnh giải cứu vũ trụ, mà để tự trả lời điều gì đã xảy ra với chính mình — vì sao chỉ mình anh cử động được giữa thị trấn đóng băng, và vì sao chiếc đồng hồ chết máy của ông nội lại tiếp tục chạy ngược trong túi áo. Bước ra khỏi Cổng Ngưỡng, hai người đặt chân tới một vùng duyên hải bị kẹt vĩnh viễn vào khoảnh khắc mặt trời vừa chạm đường chân trời: một buổi hoàng hôn không bao giờ tắt, nơi ngôi làng chài bỏ hoang cứ lặp lại mãi đúng một chiều cuối trước cơn bão. Với đôi mắt thợ sửa đồng hồ quen bắt bệnh từng nhịp bánh răng, Peter nhận ra nơi đây giống hệt một bộ máy gãy cót hồi (Continuum) — kim giây giật lùi tại đúng một vạch mà không thể sang nhịp kế tiếp. Khi bắt gặp những con người lạc trong vòng lặp này cũng mang vết hổng ký ức giống Cô Ba hay tấm ảnh mờ mặt trên bàn mình, việc tháo gỡ nhịp tắc nghẽn cho họ trở thành manh mối gần nhất để Peter hiểu thứ gì — hoặc ai — đã bị thời gian bỏ lại.

---

## 2. Luồng Trải Nghiệm & Tái Sử Dụng Tileset (Flow & Locations)

- **Thời lượng mục tiêu:** 40 – 60 phút chơi (5 bản đồ liên hoàn).
- **Ưu tiên tái sử dụng:** Toàn bộ 5 bản đồ dùng lại 3 bộ tileset sẵn có (`wilds_tileset`, `coastal_tileset`, `dungeon_tileset`).

```text
[1. Bờ Biển Hoàng Hôn] ──(Ngắt vòng lặp #1)──▶ [2. Làng Chài Bỏ Hoang] ──(Ngắt vòng lặp #2)──▶ [3. Hải Đăng Sương Mù]
   (wilds_tileset, 5–7m)                            (coastal_tileset, 15–20m)                         (wilds_tileset, 8–12m)
                                                             │                                                  │
                                                3 lớp thời gian chồng lấn                            Hạ thủy triều (Tide Shift)
                                                             ▼                                                  ▼
[Mở đường Chapter 2] ◀──(Continuum Resonance)── [5. Thánh Điện Chuông Chìm] ◀──(Giải chuỗi chuông)── [4. Hành Lang Đáy Biển]
                                                   (dungeon_tileset, 8–10m)                            (dungeon_tileset, 8–12m)
```

1. **Bờ Biển Hoàng Hôn (`map_ch1_shore_gate`, 5–7 phút · `wilds_tileset`):** Giới thiệu vùng đất kẹt giữa một hoàng hôn đứng im; đối thoại với Trưởng Lão và phá **Vòng Lặp Bờ Biển** đầu tiên bằng vật neo bị lệch nhịp.
2. **Làng Chài Bỏ Hoang (`map_ch1_abandoned_village`, 15–20 phút · `coastal_tileset`):** Khu trung tâm với 3 lớp thời gian chồng lấn (_Quá khứ trù phú / Khoảnh khắc báo bão / Hiện tại hoang tàn_). Thực hiện 3 tuyến chuyện nhân văn (_Lá Thư Người Đánh Cá_, _Bức Ảnh Thờ Trống_, _Bữa Tối Thứ Hai_) và phá vòng lặp ngã ba làng.
3. **Ngọn Hải Đăng Sương Mù (`map_ch1_sunset_beacon`, 8–12 phút · `wilds_tileset`):** Gặp **Người Gác Hải Đăng Già** nửa tỉnh nửa mê giữa các dòng thời gian; sửa Bánh Xe Thủy Triều để hạ mực nước biển, làm lộ cửa vào di tích ngầm.
4. **Hành Lang Đáy Biển (`map_ch1_sunken_causes`, 8–12 phút · `dungeon_tileset`):** Tàn tích ngập mặn lộ ra sau khi thủy triều rút; chiến đấu với quái trôi dạt, thu nhặt manh mối quá khứ và giải **chuỗi trụ chuông đứt quãng** để mở phong ấn.
5. **Thánh Điện Chuông Chìm (`map_ch1_bell_sanctum`, 8–10 phút · `dungeon_tileset`):** Trận chiến boss cơ chế với **The Sunken Bellkeeper** bên dưới Lõi Continuum Seal; trả lại hoàng hôn cuối cùng cho mặt biển và mở khóa **Continuum Resonance**.

---

## 3. Thiết Kế Bản Đồ (Maps Specification)

Mỗi bản đồ giữ kích thước tối đa **≤ 30×20 tiles** (32×32 px/tile) theo chuẩn hiệu năng hiện tại.

### Map 1: `map_ch1_shore_gate` (Bờ Biển Hoàng Hôn) — `22×16` tiles · `wilds_tileset`

- **Đặc trưng:** Ghềnh đá ven biển nhuốm ánh cam sẫm đứng im; vòm Cổng Ngưỡng bên bờ tây; con đường ven vách đá lặp lại vô tận ở rìa đông cho tới khi phá vòng lặp.
- **Spawns:** `default` / `from_prologue` (`x: 3, y: 8`), `from_village` (`x: 19, y: 8`), `loop_reset` (`x: 5, y: 8`).
- **Exits:** `shore_to_village` (`x: 21, y: 7..9`, `requiresFlag: "broke_shore_loop"`, `lockedDialogueId: "ch1_shore_loop_blocked"`).
- **NPC & POI:** `npc_elder_ch1` (`x: 5, y: 7`); `poi_broken_sundial` (`x: 10, y: 5` — đồng hồ mặt trời gãy bị kẹt kim bóng nắng); `poi_frozen_tide_marker` (`x: 12, y: 10` — cọc đo triều giữ mực nước đóng băng ở cùng một độ cao).
- **Triggers:** `trig_ch1_arrival` (`arrive`, `onceFlag: "ch1_arrived_shore"`, chạy thoại mở màn và bắt đầu `quest_ch1_sunset_gate`); `trig_shore_loop` (`zone` lặp lại tại `x: 18..19, y: 6..10` khi chưa có `broke_shore_loop`).

### Map 2: `map_ch1_abandoned_village` (Làng Chài Hoàng Hôn Bỏ Hoang) — `30×20` tiles · `coastal_tileset`

- **Đặc trưng:** Chia 3 cụm: cầu cảng hoang vắng phía nam, đình làng ven biển có **Mỏ Neo Thời Gian**, và dãy nhà ngói hướng đông bắc dẫn lên dốc hải đăng (bị vòng lặp sương mù chặn ngã ba).
- **Spawns:** `default` / `from_shore` (`x: 1, y: 10`), `from_beacon` (`x: 28, y: 4`), `loop_alley` (`x: 15, y: 11`).
- **Exits:** `village_to_shore` (`x: 0, y: 9..11`); `village_to_beacon` (`x: 29, y: 3..5`, `requiresFlag: "broke_village_loop"`, `lockedDialogueId: "ch1_village_loop_blocked"`).
- **NPC & POI:**
  - `npc_village_elder_woman` (Bà Tư bên mâm cơm hai chén, `x: 10, y: 6` — _A Second Dinner_).
  - `npc_fisherman_spirit` (hồn ngư dân đứng cạnh bến thuyền, `x: 6, y: 16` — _The Fisherman's Letter_).
  - `poi_temporal_anchor_well` (giếng làng có bánh răng thời gian — chuyển đổi lớp `Past / Cataclysm / Present`, `x: 15, y: 10`).
  - `poi_coastal_shrine_photo` (bàn thờ nhỏ với khung ảnh thờ khuyết một bóng người, `x: 20, y: 6` — _The Empty Photograph_).
  - `poi_unsent_letter_box` (hòm thư gỗ mục chỉ còn nguyên vẹn để lấy thư ở lớp _Past_, `x: 12, y: 15`).
  - `poi_village_bell_post` (cột chuông ngã ba giữ vòng lặp con dốc đông bắc, `x: 24, y: 8`).
- **Triggers:** `trig_village_intro` (`arrive`, `onceFlag: "ch1_entered_village"`); `trig_village_loop` (`zone` tại `x: 27, y: 3..6` khi chưa có `broke_village_loop`).

### Map 3: `map_ch1_sunset_beacon` (Ngọn Hải Đăng Sương Mù) — `24×18` tiles · `wilds_tileset`

- **Đặc trưng:** Sân đá sương mù bao quanh tháp hải đăng đồng rỉ (khác hoàn toàn hải đăng Khánh Hòa); phía đông có cầu thang ngập nước chỉ lộ lối xuống khi thủy triều hạ.
- **Spawns:** `default` / `from_village` (`x: 2, y: 14`), `from_ruins` (`x: 19, y: 15`).
- **Exits:** `beacon_to_village` (`x: 1, y: 13..15`); `beacon_to_ruins` (`x: 20, y: 16`, `requiresFlag: "tide_lowered"`, `lockedDialogueId: "ch1_tide_blocks_stairs"`).
- **NPC & POI:** `npc_old_keeper` (`x: 11, y: 8`); `poi_tide_wheel` (bánh xe đồng điều tiết cống thủy triều, `x: 12, y: 5`); `poi_keeper_logbook` (sổ trực đèn ghi 3 mốc giờ chuông báo bão, `x: 9, y: 9`).
- **Triggers:** `trig_keeper_murmur` (`arrive`, `onceFlag: "ch1_met_beacon_mist"`).

### Map 4: `map_ch1_sunken_causes` (Hành Lang Đáy Biển) — `26×18` tiles · `dungeon_tileset`

- **Đặc trưng:** Di tích đá ngầm phủ rêu phát ánh sáng lân tinh; hành lang chia nhánh giữ 3 trụ chuông vỡ bị sai nhịp thời gian và một ngách nhỏ lưu giữ dấu vết cũ.
- **Spawns:** `default` / `from_beacon` (`x: 3, y: 15`), `from_sanctum` (`x: 23, y: 3`).
- **Exits:** `ruins_to_beacon` (`x: 2, y: 16`); `ruins_to_sanctum` (`x: 24, y: 2`, `requiresFlag: "solved_bell_sequence"`, `lockedDialogueId: "ch1_sanctum_seal_locked"`).
- **POI & Encounters:** `poi_chime_pillar_1` (`x: 8, y: 11`), `poi_chime_pillar_2` (`x: 14, y: 7`), `poi_chime_pillar_3` (`x: 19, y: 12`); `poi_kuro_indirect_trace` (`x: 6, y: 4` `[PROPOSAL]`: chiếc vỏ đồng hồ bỏ không mang họa tiết quen quen ở khu vực tưởng như chưa từng có người sống sót, không ghi tên); `poi_sunken_cache` (`x: 17, y: 4`); 2 `enc_ch1_drifter_*`, 1 `enc_ch1_chorister` (hoặc Shade).

### Map 5: `map_ch1_bell_sanctum` (Thánh Điện Chuông Chìm) — `20×16` tiles · `dungeon_tileset`

- **Đặc trưng:** Đại sảnh đá tròn với Quả Chuông Thời Gian nứt vỡ treo giữa màn nước đóng băng phát sáng xanh lục-lam.
- **Spawns:** `default` / `from_ruins` (`x: 10, y: 14`), `revive` (`x: 10, y: 13`).
- **Exits:** `sanctum_to_ruins` (`x: 10, y: 15`), `sanctum_to_chapter2` (`x: 10, y: 2`, `requiresFlag: "continuum_seal_restored"`).
- **Encounter & POI:** `enc_sunken_bellkeeper` (`x: 10, y: 7`, `victoryDialogueId: "ch1_bellkeeper_released"`); `poi_continuum_seal` (`x: 10, y: 4`, `requiresFlag: "sunken_bellkeeper_released"`).
- **Triggers:** `trig_bell_sanctum_meet` (`zone` tại `x: 8..12, y: 10`, `onceFlag: "ch1_met_bellkeeper"`).

---

## 4. Danh Sách Nhân Vật (NPCs)

1. **Peter** — `[Tái sử dụng CHAR_PETER_002/003]` Nam 26 tuổi, tóc xoăn ngắn gọn (`Curly Hair Lock`), áo khoác xanh than vạt xéo, mang Thanh Kiếm Gãy và đồng hồ quả quýt ông nội.
2. **Trưởng Lão Thời Gian (`npc_elder_ch1`)** — `[Tái sử dụng NPC_ELDER_001]` Ông lão áo choàng lam thêu chỉ bạc cầm quyền trượng quả lắc đồng hồ, giữ `resistsFreeze: true` để dẫn đường khi vào lớp đóng băng.
3. **Bà Tư (`npc_village_elder_woman`)** — `[Tái sử dụng npc_vendor_ba đổi tint tóc bạc / hoặc sprite mới Nice]` Bà lão mặc áo bà ba sẫm màu đứng bên mâm cơm hai chén nguội lạnh, ánh mắt đợi người về ăn tối.
4. **Hồn Ngư Dân (`npc_fisherman_spirit`)** — `[Tái sử dụng npc_fisherman_sau + tint xanh mờ]` Lão ngư râu hoa râm ngồi bó gối cạnh thuyền mục, thân ảnh phai mờ trong sương hoàng hôn.
5. **Người Gác Hải Đăng Già (`npc_old_keeper`)** — `[Sprite MỚI — Must]` Ông lão còng lưng khoác áo tơi dày bạc màu biển, tay xách chiếc đèn bão ánh vàng leo lét giữa sương mù.
6. **The Sunken Bellkeeper (`boss_sunken_bellkeeper`)** — `[Sprite MỚI — Must, 64×64]` Vệ binh mang áo giáp đồng rỉ bám san hô ôm quả chuông nứt vỡ, quanh vai quấn xích neo gãy và một frame quỳ xuống (`releasedFrame`).

---

## 5. Cơ Chế Continuum Cho Giải Đố & Khám Phá

### 5.1. Cách chơi 3 dạng biến dị Continuum

- **Vòng lặp không gian (Continuum Loops):** Ở Bờ Biển và Ngã Ba Làng Chài, bước qua ranh giới sương mù khi chưa chỉnh đúng mỏ neo khiến đường đi tự uốn quay lại đầu lối. Peter phải dùng **Nhãn Thời Gian** phát hiện vật thể lệch pha (đồng hồ mặt trời gãy, trụ chuông ngã ba) để sửa hoặc đồng bộ lại, từ đó mở khóa đường đi thật.
- **Sự kiện lặp & 3 lớp thời gian (Hybrid Temporal Layers + Tide Shifts):** Tại Mỏ Neo Thời Gian giữa Làng Chài (`poi_temporal_anchor_well`), Peter xoay trục chuyển đổi giữa 3 lớp:
  - _Hiện tại hoang tàn (Present):_ Ngôi làng mục nát ngập mặn, giữ dấu vết Residual Existence của bức ảnh và vong linh.
  - _Khoảnh khắc báo bão (Cataclysm):_ Toàn làng đóng băng trong một giây chuông réo (`frozenWhen`), hé lộ vị trí đồ vật rơi lúc mọi người chạy bão.
  - _Quá khứ trù phú (Past):_ Hòm thư còn nguyên vẹn để nhặt _Lá thư chưa gửi_, mâm cơm còn nóng hé lộ ký ức cho Bà Tư.
    Sau đó tại Ngọn Hải Đăng, thay đổi van bánh xe từ lớp Quá khứ sang Hiện tại kích hoạt **Tide Shift** — hạ mực nước biển để mở đường xuống Hành Lang Đáy Biển.
- **Chuỗi sự kiện bị đứt (Broken Sequences):** Tại Hành Lang Đáy Biển, 3 trụ chuông (`poi_chime_pillar_1..3`) đánh sai trình tự ngày-đêm. Người chơi đọc 3 mốc giờ trong sổ trực đèn ở Hải Đăng (`Bình minh` -> `Hoàng hôn` -> `Đêm tĩnh`) và gõ đúng thứ tự; gõ sai trụ sẽ phát tiếng rè và đặt lại chuỗi từ bước đầu.

### 5.2. Phân tách tính năng Engine sẵn có vs Engine mới cần bổ sung

- **Tính năng Engine ĐÃ CÓ dùng lại trực tiếp (`MapTypes.ts` / `CombatTypes.ts`):**
  - `flags`, `dialogueRules` (`ifFlag`, `unlessFlag`, `ifQuestCompleted`) và `exits[].requiresFlag` + `lockedDialogueId`: điều phối toàn bộ lời thoại, manh mối theo lớp thời gian và chặn lối vòng lặp / cửa thủy triều.
  - `visibleWhen` (`flag`, `unlessFlag`): ẩn/hiện vật phẩm neo, hòm thư quá khứ, hồn ngư dân và quái trôi dạt theo từng lớp.
  - `frozenWhen`: tái sử dụng hoàn chỉnh trạng thái đóng băng NPC + lớp phủ lạnh + ngắt nhạc cho lớp **Cataclysm** tại Làng Chài.
  - `visions`: triệu hồi bóng ký ức mờ trong lúc chạy thoại (_Bữa Tối Thứ Hai_, _Bức Ảnh Thờ Trống_, ký ức ngư dân).
  - `script` & `mechanic`: xử lý chuỗi hành động mở khóa tuần tự theo lượt trong trận đấu boss **The Sunken Bellkeeper**.
- **Tính năng Engine MỚI cần bổ sung (`[NEW ENGINE FEATURE]`):**
  1. **Repeatable Loop Zone (`repeatable?: boolean`, `unlessFlag?: string`, `teleportToSpawn?: string` trên `MapTriggerDefinition`):** Hiện tại `zone` trigger bắt buộc `onceFlag` (chỉ nổ 1 lần duy nhất mỗi lượt chơi) và chưa có lệnh dịch chuyển nhân vật kèm fade ngắn quay về điểm đầu lối lặp.
  2. **Làm mới trạng thái bản đồ tại chỗ (`refreshMapState` trong `DialogueEffects` + hoán đổi layer nước thủy triều):** Hiện tại `visibleWhen` và `frozenWhen` chỉ đánh giá lúc **mới vào map**. Khi Peter xoay Mỏ Neo Thời Gian ngay giữa Làng Chài hoặc xoay Bánh Xe Thủy Triều ở Hải Đăng, engine cần cập nhật lại NPC/`frozenWhen`/tint ngay lập tức (hoặc reload nhẹ tại chỗ giữ nguyên vị trí) và hỗ trợ ẩn/hiện layer gạch nước theo cờ `tide_lowered`.
  3. **Xóa cờ để reset chuỗi puzzle (`clearFlags?: string[]` trong `DialogueEffects`):** Hiện tại `GameSession.applyDialogueEffects()` chỉ hỗ trợ `setFlags` (bật `true`), chưa có `clearFlags` để reset các cờ bước 1–2 khi người chơi gõ sai thứ tự chuỗi 3 trụ chuông ở Hành Lang Đáy Biển.

---

## 6. Thiết Kế Giao Tranh & Boss Cơ Chế (Encounters)

> **Ghi chú đồng bộ Canon:** Trong bản nháp `STORY_CHAPTER_01.md` cũ từng nhắc _The Drowned Sentinel_ làm boss cuối Chương 1, nhưng Prologue v2/v3 đã đưa Sentinel lên làm boss mỏm hải đăng Khánh Hòa. Do đó Chương 1 giữ **The Sunken Bellkeeper** (giải quyết mâu thuẫn bằng cơ chế chuông & thủy triều theo lượt) làm boss chính của Lõi Continuum Seal `[PROPOSAL — chờ xác nhận §9.1]`.

### Quái Thường (Tối đa 2 mới + tái sử dụng Temporal Shade)

| Enemy ID                | Tên (Tiếng Việt)   | Nguồn                | Chỉ số đề xuất (`HP/ATK/DEF/SPD`) | Cơ chế / Chiêu thức                                                   |
| :---------------------- | :----------------- | :------------------- | :-------------------------------- | :-------------------------------------------------------------------- |
| `enemy_temporal_shade`  | Bóng Đen Thời Gian | **Tái sử dụng**      | `45 / 10 / 5 / 11` (nâng nhẹ)     | Giữ nguyên chiêu cào & né pha.                                        |
| `enemy_drowned_drifter` | Thực Thể Trôi Dạt  | **Mới 1** [PROPOSAL] | `60 / 12 / 7 / 8`                 | _Sóng Dập_; _Trì Trệ_ (làm chậm lượt đầu nếu không đỡ).               |
| `enemy_echo_chorister`  | Vang Chuông Vỡ     | **Mới 2** [PROPOSAL] | `65 / 11 / 9 / 10`                | _Nhịp Lệch_; tự hồi 15% HP mỗi 2 lượt trừ khi bị Nhãn Thời Gian ngắt. |

### Boss Cơ Chế: The Sunken Bellkeeper (`boss_sunken_bellkeeper`)

- **Bản chất:** Không phải quái vật tà ác mà là người giữ chuông bị mắc kẹt trong nỗi sợ tiếng chuông kế tiếp sẽ gọi cơn bão mới — ông liên tục kéo đồng hồ trận đấu giật lùi về thời khắc trước khi tiếng chuông kịp ngân.
- **Chỉ số & Lớp Giáp (`enemies.json` `mechanic`):** HP `180`, ATK `14`, DEF `11`, SPD `9`. Giáp **Reversed Chime Aegis** (`damageReduction: 0.8`, `hpFloor: 1`, `recoverPct: 0.65` kèm thông báo chuông đánh giật lùi khi chạm sàn HP).
- **Cấu trúc theo lượt (`Turn-by-Turn`, mở khóa `[6]` bằng Nhãn Thời Gian hoặc sau 3 lượt):**
  - **Lượt 1–2 (Quan sát):** Đòn đánh thường bị giảm 80%; boss rung chuông tự phục hồi nếu HP tụt quá nhanh. Peter dùng **`[2] KỸ NĂNG` (Nhãn Thời Gian)** phát hiện 3 khóa cơ khí nối Quả Chuông Thời Gian với mặt nước xung quanh.
  - **Lượt 3–6 (Giải 3 nhịp nối tiếp qua lệnh `[6]` — `requires` tuần tự):**
    1. `[6a] GIỮ DÂY CHUÔNG CŨ`: Khóa dây neo giữ quá khứ -> Boss bị **Choáng 1 lượt** (`stunTurns: 1`).
    2. `[6b] ĐẢO BÁNH RĂNG THỦY TRIỀU` (`requires: ["bell_cord"]`): Trả vòng quay thủy triều về chiều thuận -> Nhật ký báo nhịp chuông đồng bộ.
    3. `[6c] GÕ NHỊP HOÀNG HÔN CUỐI` (`requires: ["tide_gear"]`): Tiếng chuông ngân trọn vẹn lần cuối -> Phá giáp hoàn toàn (`breakShield: true`, kéo HP về `setHpPct: 0.15`).
  - **Lượt 7+ (Giải thoát):** Đòn kết liễu đưa boss sang `releasedFrame` (quỳ xuống đặt quả chuông yên vị). Peter kích hoạt Lõi Continuum Seal, nhận năng lực **Continuum Resonance** và chứng kiến hoàng hôn đầu tiên dần tắt trên mặt biển.

---

## 7. Nhiệm Vụ, Cờ Cốt Truyện & Kịch Bản Thoại Nháp

### 7.1. Bảng Nhiệm Vụ (`quests.json`)

| Quest ID                      | Tên Nhiệm Vụ                 | Mục Tiêu Chính (`completeOnFlag`)                                           | Phần Thưởng (đạt ~Lv 6–7 `[PROPOSAL]`) | Follow-up                     |
| :---------------------------- | :--------------------------- | :-------------------------------------------------------------------------- | :------------------------------------- | :---------------------------- |
| `quest_ch1_sunset_gate`       | Bờ Biển Hoàng Hôn            | Nghe Trưởng Lão; phá vòng lặp bờ biển (`broke_shore_loop`)                  | `+40 EXP`                              | `quest_ch1_abandoned_village` |
| `quest_ch1_abandoned_village` | Ngôi Làng Trong Hoàng Hôn    | Kích hoạt Mỏ Neo Thời Gian (`ch1_used_anchor`); phá vòng lặp làng           | `+60 EXP`, `coastal_pancake`           | `quest_ch1_fog_beacon`        |
| `quest_ch1_fog_beacon`        | Ngọn Đèn Trong Sương         | Nói chuyện Người Gác Hải Đăng; sửa bánh xe hạ triều (`tide_lowered`)        | `+70 EXP`                              | `quest_ch1_sunken_ruins`      |
| `quest_ch1_sunken_ruins`      | Nhịp Chuông Đáy Biển         | Gõ đúng chuỗi 3 trụ chuông (`solved_bell_sequence`)                         | `+80 EXP`, `chrono_shard_minor`        | `quest_ch1_bellkeeper`        |
| `quest_ch1_bellkeeper`        | Tiếng Chuông Hoàng Hôn Cuối  | Giải thoát Bellkeeper; nhận Resonance (`continuum_seal_restored`)           | `+150 EXP`, `continuum_seal_shard`     | Handoff Chapter 2             |
| `quest_ch1_fisherman_letter`  | Lá Thư Người Đánh Cá _(Phụ)_ | Tìm thư ở lớp Past (`found_unsent_letter`); trao cho hồn ngư dân            | `+50 EXP`, `chrono_shard_minor`        | —                             |
| `quest_ch1_empty_photo`       | Bức Ảnh Thờ Trống _(Phụ)_    | Soi ký ức qua Nhãn Thời Gian tại bàn thờ (`restored_shrine_photo`)          | `+50 EXP`                              | —                             |
| `quest_ch1_second_dinner`     | Bữa Tối Thứ Hai _(Phụ)_      | Kiểm tra lớp Past giúp Bà Tư nhớ ra bạn ăn tối (`identified_second_dinner`) | `+50 EXP`, `sunset_dried_fish`         | —                             |

### 7.2. Danh Sách Cờ (`snake_case`)

- **Chính tuyến:** `ch1_arrived_shore`, `broke_shore_loop`, `ch1_used_anchor`, `ch1_layer_past`, `ch1_layer_cataclysm`, `broke_village_loop`, `talked_old_keeper_ch1`, `tide_lowered`, `ch1_bell_step_1`, `ch1_bell_step_2`, `solved_bell_sequence`, `sunken_bellkeeper_released`, `continuum_seal_restored`, `learned_continuum_resonance`.
- **Nhiệm vụ phụ & bí ẩn:** `found_unsent_letter`, `delivered_unsent_letter`, `restored_shrine_photo`, `identified_second_dinner`, `found_ch1_interval_trace` `[PROPOSAL]`.

### 7.3. Kịch Bản Thoại Nháp (Tiếng Việt, `≤ 2` lựa chọn mỗi node)

- **`ch1_shore_arrival` (`Peter` & `Trưởng Lão Thời Gian`):**
  - Trưởng Lão: _"Mặt trời ở vùng biển này đã ngừng lặn từ lâu. Quyền Năng Continuum đang gãy một mắt xích."_
  - Peter: _"(Đồng hồ của ông nội trong túi áo vẫn đang chạy ngược nhịp...) Trời hoàng hôn đứng im thật, mà đường trước mặt cứ như dài mãi không hết."_
  - Lựa chọn 1: `[Hỏi vì sao đường đi lặp lại]` -> _"Một vòng lặp vụng về. Hãy dùng mắt thợ sửa đồng hồ của cậu tìm thứ đang lệch nhịp trên bãi đá."_
  - Lựa chọn 2: `[Đi dò xem quanh bờ biển]` -> Đóng thoại.
- **`ch1_second_dinner` (`Bà Tư`, quest phụ _Bữa Tối Thứ Hai_):**
  - Bà Tư: _"Cậu khách lạ đừng cười nhé... Chiều nào tôi cũng dọn hai chén cơm cá kho, mà hễ ngồi xuống lại không nhớ nổi mình đang đợi ai về ăn cùng."_
  - Lựa chọn 1: `[Thử hỏi hàng xóm hoặc soi ký ức cũ]` -> Khuyến khích xoay Mỏ Neo về lớp Quá Khứ.
  - Lựa chọn 2: `[Ngồi nói chuyện thêm cho bà đỡ trống]` -> Bà Tư gật đầu buồn.
- **`ch1_fisherman_spirit` (`Hồn Ngư Dân`, quest phụ _Lá Thư Người Đánh Cá_):**
  - Hồn Ngư Dân: _"Tàu sắp nhổ neo ra khơi trước bão... Tôi đã viết vội mảnh giấy dặn nhà đóng chặt cửa, nhưng sao tìm mãi chẳng thấy hòm thư đâu..."_
  - _(Khi mang `found_unsent_letter` từ lớp Past tới):_ _"À... hóa ra bức thư chưa bao giờ kịp tới tay bà ấy. Cảm ơn cậu đã đưa nó thoát khỏi buổi chiều hôm đó..."_ (`visions` mờ hiện dáng người đọc thư trước khi tan nhẹ).
- **`ch1_old_keeper_talk` (`Người Gác Hải Đăng Già`):**
  - Người Gác: _"Ba giờ... hay năm giờ chiều rồi? Đèn vừa thắp sao biển lại sắp bão... Bánh răng dưới giếng triều kẹt rồi cậu trẻ ạ, tay tôi run quá vặn chẳng nổi..."_
  - Lựa chọn 1: `[Để cháu xem giúp bánh xe đồng]` -> Kiểm tra `poi_tide_wheel` (yêu cầu `ancient_gear` hoặc kỹ năng sửa đồng hồ).
  - Lựa chọn 2: `[Hỏi về tiếng chuông dưới đáy biển]` -> _"Ông ấy ôm quả chuông không chịu buông... sợ hễ đánh hết một hồi là mất sạch tất cả..."_
- **`ch1_bellkeeper_released` (`The Sunken Bellkeeper`, sau khi giải thoát):**
  - Bellkeeper: _"...Tiếng chuông ngân trọn rồi sao? Mặt trời... cuối cùng cũng chịu xuống núi rồi..."_
  - Trưởng Lão _(tại `poi_continuum_seal`)_: _"Vòng lặp của vùng biển này chỉ là mảnh vá vụng về giữ lại chút quá khứ trước khi sụp đổ. Tiếp nhận Continuum Resonance đi, Peter — còn nhiều nơi đã bị đóng chặt hơn thế nữa."_

---

## 8. Danh Mục Tài Nguyên (Asset List — Tối Thiểu Hóa Art Mới)

| Asset                                | Loại        | Quy cách / Trạng thái                  | Ưu tiên   | Tái sử dụng / Ghi chú                                                                        |
| :----------------------------------- | :---------- | :------------------------------------- | :-------- | :------------------------------------------------------------------------------------------- |
| `coastal_tileset`                    | Tileset     | 32×32 px (`ENV_COASTAL_001`)           | **Đã có** | Tái sử dụng cho Làng Chài Bỏ Hoang (có thể thêm 2–3 tile đạo cụ: giếng neo, ảnh thờ `Nice`). |
| `wilds_tileset`                      | Tileset     | 32×32 px (`ENV_WILDS_001`)             | **Đã có** | Tái sử dụng cho Bờ Biển Hoàng Hôn & Hải Đăng Sương Mù.                                       |
| `dungeon_tileset`                    | Tileset     | 32×32 px (`ENV_SANCTUARY_002`)         | **Đã có** | Tái sử dụng cho Hành Lang Đáy Biển & Thánh Điện Chuông Chìm.                                 |
| `peter_*`, `npc_elder`               | Spritesheet | 32×32 px (`CHAR_PETER_002/003`, Elder) | **Đã có** | Giữ nguyên Peter Idle/Walk/Combat + Khóa tóc xoăn; Elder `NPC_ELDER_001`.                    |
| `npc_vendor_ba`, `npc_fisherman_sau` | Spritesheet | 32×32 px                               | **Đã có** | Tái sử dụng + tint qua code cho Bà Tư & Hồn Ngư Dân (tiết kiệm 2 sheet mới).                 |
| `enemy_fracture`, `UI_SET_001`       | Spritesheet | 32×32 px / UI                          | **Đã có** | Tái sử dụng làm _Bóng Đen Thời Gian_ + toàn bộ khung UI/con trỏ/hiệu ứng.                    |
| `npc_old_keeper`                     | Spritesheet | 32×32 × 4 frame idle                   | **Must**  | Ông lão gác hải đăng mặc áo tơi cầm đèn bão.                                                 |
| `boss_sunken_bellkeeper`             | Spritesheet | 64×64 × 4 frame + 1 `releasedFrame`    | **Must**  | Boss cơ chế Chương 1 ôm quả chuông đồng nứt.                                                 |
| `enemy_drowned_drifter`              | Spritesheet | 32×32 × 4 frame idle                   | **Must**  | Quái thường _Thực Thể Trôi Dạt_ ở Hành Lang Đáy Biển.                                        |
| `enemy_echo_chorister`               | Spritesheet | 32×32 × 4 frame idle                   | **Nice**  | Quái thứ 2 (_Vang Chuông Vỡ_); có thể tạm tái sử dụng `enemy_fracture` đổi tint nếu cần gọn. |

---

## 9. Câu Hỏi Mở Cho Owner

1. **Chốt Boss Chương 1:** Trong `STORY_CHAPTER_01.md` cũ từng đặt _The Drowned Sentinel_ làm boss chính Chương 1, nhưng Sentinel đã xuất hiện ở cuối Prologue v2/v3. Owner có đồng ý chốt **The Sunken Bellkeeper** làm boss cơ chế chính duy nhất của Chương 1 không?
2. **Độ sâu chuyển đổi 3 lớp thời gian:** Nên để người chơi xoay **Mỏ Neo Thời Gian** chuyển tự do giữa `Past / Cataclysm / Present` tại Làng Chài (cần thêm cơ chế refresh map tại chỗ + đổi layer thủy triều ở §5.2), hay chỉ chuyển tuyến tính một chiều theo cốt truyện để giảm khối lượng sửa engine?
3. **Nhịp cấp độ Chương 1 `[PROPOSAL]`:** Từ cấp 3 (cuối Prologue) lên **cấp 6–7** khi hết Chương 1 (tổng ~450 EXP từ quest + quái trên trần Lv 30 toàn game) có hợp với nhịp 6 chương dự kiến không?
4. **Manh mối gián tiếp Kuro (`poi_kuro_indirect_trace`):** Có đồng ý đặt một kỷ vật mờ không tên (chỉ gợi sự tương đồng trong thói quen với tấm ảnh cũ của Peter, tuyệt đối không có tên hay chữ cái `"K..."`) tại Hành Lang Đáy Biển không?
5. **Trang bị & Sprite phụ:** Chương 1 đã cần kích hoạt hạng mục `equipment` (như bùa đồng hồ / phụ kiện tăng tốc độ) trong Túi Đồ chưa, hay giữ nguyên 3 loại vật phẩm như Prologue? Bà Tư dùng chung sprite `npc_vendor_ba` (đổi tint) hay cần vẽ riêng?
