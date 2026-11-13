# THIẾT KẾ CHI TIẾT CHAPTER 3: "THE KINGDOM OF FORGOTTEN SOULS" (VƯƠNG QUỐC CỦA NHỮNG LINH HỒN BỊ QUÊN LÃNG)

**Mã tài liệu:** `docs/story/CHAPTER_03_DESIGN.md`  
**Trạng thái:** `[PROPOSAL]` – Chờ Project Owner phê duyệt  
**Quyền năng (Authority):** **Memory** (Ký Ức / Lịch sử & Bản sắc tồn tại)  
**Tham chiếu Canon:** `STORY_CHAPTER_03.md`, `CHARACTER_BIBLE.md`, `LORE_AND_COSMOLOGY.md`, `CANON_AND_OPEN_QUESTIONS.md`, `CHAPTER_02_DESIGN.md` (§11)

> **Ràng buộc kế thừa từ Chapter 2 & T-55:** Peter (~26 tuổi, thợ sửa đồng hồ từ Khánh Hòa, khóa nhận diện tóc xoăn tự nhiên `Curly Hair Lock`) bước qua Cổng Ngưỡng sau khi giải phóng Đế Chế Nhân Quả Giả và tiếp nhận Causality Resonance. Lyra ở lại tái thiết vùng đất của mình. Peter đặt chân vào Chapter 3 ở cấp độ khoảng **Lv 12** và tiến độ kết thúc chương chạm trần **Lv 15** (theo đường cong cấp độ cập nhật tại T-55). Trưởng Lão Thời Gian xuất hiện thoáng qua một lần duy nhất dưới dạng dư ảnh chỉ dẫn tại cửa vào. Kuro tuyệt đối không xuất hiện trực tiếp (khóa canon Chapter 4), chỉ để lại dư âm gián tiếp. Toàn bộ câu đố được thiết kế theo dạng riddle có bằng chứng đối chiếu chéo (cross-reference), không lặp lại bất kỳ cơ chế cũ nào của Chapter 1 và Chapter 2.

---

## 1. Tiền Đề & Động Lực Cá Nhân (Premise & Emotional Stake)

Trong sáu quyền năng của Chronos, **Memory** (Ký Ức) là sợi chỉ mong manh nhất kết nối một con người với thực tại. Người ta có thể sống sót qua bão cát của thời gian, nhưng nếu ký ức bị xóa bỏ, họ sẽ trở thành những bóng ma vô danh lang thang trong cõi hư vô. Đặt chân vào Vương Quốc Cổ Đại của Những Linh Hồn Bị Quên Lãng — nơi được xây dựng quanh Đại Thư Viện Ký Ức (Great Necro-Archive) — Peter chứng kiến một bi kịch đau đớn: tinh thể lưu trữ ký ức bị rạn nứt (`Memory Bleed`), khiến ký ức của người chết rò rỉ, hòa lẫn và cấy ghép hỗn loạn vào tâm trí người sống.

Đối với Peter, chuyến đi này chạm thẳng vào vết thương sâu kín nhất về căn tính của anh:

- Peter là **Unwritten** (`OQ-01`) — một kẻ không hề có tên trong bất kỳ trang sử hay hồ sơ sinh mệnh nào. Ở một vương quốc nơi linh hồn được định giá bằng những phiến đá ký ức, Peter đối diện với câu hỏi: _Nếu một người không được ai nhớ tới, liệu người đó có thực sự từng tồn tại?_
- Gặp gỡ **Neris** — nữ thủ thư trẻ uyên bác có thể đọc vanh vách gia phả của ngàn năm lịch sử nhưng lại hoàn toàn quên mất tên thật của chính mình — Peter nhìn thấy sự đồng cảm sâu sắc.
- Đỉnh điểm cảm xúc: Khi tiếp xúc sâu với Lõi Ký Ức, Peter bàng hoàng nhận ra một sự thật gây chấn động tâm lý: một số ký ức ấu thơ êm đềm nhất mà anh trân quý (buổi chiều mưa trên căn gác xép, chiếc đồng hồ quả quýt hỏng và lời hứa cùng ai đó) thực chất **không phải của anh**, mà thuộc về một người bạn đã bị Hiện tượng Xóa sổ Khái niệm (`Conceptual Erasure`) gọt sạch khỏi vũ trụ.

---

## 2. Luồng Trải Nghiệm & Tái Sử Dụng Tileset (Flow & Locations)

- **Thời lượng mục tiêu:** 75 – 100 phút chơi (8 bản đồ liên hoàn, quy mô lớn hơn Chapter 2).
- **Chuẩn kích thước:** Mỗi bản đồ giữ chuẩn hiệu năng $\le 30 \times 20$ tiles (32×32 px/tile).
- **Ưu tiên tái sử dụng tileset:**
  - `dungeon_tileset` & `sunken_tileset`: Dùng cho các hầm mộ đá, đại sảnh thư viện, và thánh điện.
  - `wilds_tileset`: Dùng cho vùng tiền đình lăng mộ và con đường sỏi đá ngoài trời.
  - Đạo cụ mới (`Props`): Bổ sung tile tinh thể ký ức phát sáng xanh lam (`Memory Crystal`), giá sách lăng mộ, bia mộ khắc chữ cổ, và bệ đặt di vật.

```text
[1. Tiền Đình Lăng Mộ] ──(Dư ảnh Trưởng Lão)──▶ [2. Nghĩa Địa Trầm Lặng] ──(Cứu Neris / Câu đố 1)──▶ [3. Hành Lang Vang Vọng]
 (wilds_tileset, 8–10m)                           (dungeon/sunken, 12–15m)                                (dungeon_tileset, 10–12m)
                                                                                                                │
                                                                                                    Câu đố 2: Thạch Trụ Phản Xạ
                                                                                                                ▼
[5. Đại Thư Viện Ký Ức] ◀──(Hạ Mid-Boss)── [4. Hầm Ngầm Tinh Thể] ◀──(Câu đố 3: Ảo Ảnh 8s)──────┘
 (dungeon_tileset, 15–18m)                  (sunken_tileset, 12–15m)
         │
  Câu đố 4: Sổ Kiểm Duyệt
         ▼
[6. Hoàng Lăng Ký Ức] ──(Giải oan Vua Alden / Câu đố 5)──▶ [7. Thánh Điện Hợp Xướng] ──(Memory Resonance)──▶ [Mở đường Ch.4]
 (dungeon_tileset, 12–15m)                                  (dungeon/sunken, 10–12m)
         │
  (Manh mối bí mật)
         ▼
[8. Kho Ký Ức Bị Xóa Bỏ] (Bản đồ ẩn lấy Vũ khí hiếm, 6–8m · dungeon_tileset)
```

1. **Tiền Đình Lăng Mộ (`map_ch3_sepulcher_gate`, 8–10 phút · `wilds_tileset`):** Ranh giới hoang vu phủ sương tím; tàn tích cổng đá dẫn vào thế giới ký ức; Trưởng Lão xuất hiện thoáng qua trao lời cảnh báo về ảo ảnh tâm trí.
2. **Nghĩa Địa Trầm Lặng (`map_ch3_silent_necropolis`, 12–15 phút · `dungeon_tileset` / `sunken_tileset`):** Nghĩa trang ngầm với hàng ngàn bia mộ phát sáng; giải cứu nữ thủ thư Neris khỏi bầy Ma Ký Ức; giải **Câu đố 1 (Bia Mộ Điêu Khắc Gia)**.
3. **Hành Lang Vang Vọng (`map_ch3_hall_of_echoes`, 10–12 phút · `dungeon_tileset`):** Đại sảnh mái vòm cao vút nối tầng trên và tầng dưới; giải **Câu đố 2 (Thạch Trụ Phản Xạ Ký Ức)** bằng cơ chế chiến đấu phối hợp lướt né để mở cổng trục.
4. **Hầm Ngầm Tinh Thể (`map_ch3_memory_vaults`, 12–15 phút · `sunken_tileset`):** Khu mỏ tinh thể nơi hiện tượng rò rỉ ký ức diễn ra dữ dội nhất; giải **Câu đố 3 (Đường Đi Ảo Ảnh 8 Giây)**; đối đầu Mid-Boss **The Keeper Without a Face**.
5. **Đại Thư Viện Ký Ức (`map_ch3_great_archive`, 15–18 phút · `dungeon_tileset`):** Trung tâm học thuật cổ xưa; các giá sách đá khổng lồ; giải **Câu đố 4 (Sổ Kiểm Duyệt Hoàng Gia)** để mở lối vào Hoàng Lăng; nhận 2 quest phụ tại đây.
6. **Hoàng Lăng Ký Ức (`map_ch3_royal_mausoleum`, 12–15 phút · `dungeon_tileset`):** Nơi an nghỉ của các vị vua; gặp **Vua Alden Mất Trí** đang tự dằn vặt vì ký ức tội ác giả tạo; giải **Câu đố 5 (Tách Biệt Hai Cuộc Đời)** để phục hồi ngai vàng.
7. **Thánh Điện Hợp Xướng (`map_ch3_choir_sanctum`, 10–12 phút · `dungeon_tileset` / `sunken_tileset`):** Vòm đá thiêng nơi đặt Lõi Memory Seal; trận quyết chiến theo lượt với Boss **The Nameless Choir**; kích hoạt **Memory Resonance** và hé lộ chấn động về quá khứ của Peter.
8. **Kho Ký Ức Bị Xóa Bỏ (`map_ch3_forgotten_vault`, 6–8 phút · `dungeon_tileset`):** Mật thất ẩn giấu sâu dưới đáy nghĩa địa; nơi lưu giữ những tàn tích của những ai từng bị xóa sổ hoàn toàn; giải mật mã nhận vũ khí ẩn `memory_needle_rapier`.

---

## 3. Thiết Kế Bản Đồ Chi Tiết (Maps Specification)

Mỗi bản đồ giữ kích thước tối đa **$\le 30 \times 20$ tiles** (32×32 px/tile).

### Map 1: `map_ch3_sepulcher_gate` (Tiền Đình Lăng Mộ) — `24×18` tiles · `wilds_tileset`

- **Đặc trưng:** Cổng vòm đá nứt nẻ phủ rêu tím biếc; sương mù mờ ảo mang bụi lân tinh; mặt đất vương vãi các mảnh pha lê xanh vỡ vụn.
- **Spawns:** `default` / `from_ch2` (`x: 3, y: 9`), `from_necropolis` (`x: 21, y: 9`).
- **Exits:** `gate_to_necropolis` (`x: 22, y: 8..10`, `requiresFlag: "opened_sepulcher_gate"`, `lockedDialogueId: "ch3_sepulcher_gate_locked"`).
- **NPC & POI:**
  - `npc_elder_ch3_echo` (`x: 6, y: 9` — dư ảnh Trưởng Lão, biến mất vĩnh viễn sau khi nói xong, đặt `ch3_elder_echo_faded`).
  - `poi_sepulcher_gate_mechanism` (`x: 20, y: 7` — phiến đá cảm ứng tinh thể mở cổng).
  - `poi_memory_crystal_cluster` (`x: 10, y: 4` — cụm tinh thể ký ức rò rỉ tiếng thì thầm đầu tiên).
- **Triggers:** `trig_ch3_entry` (`arrive`, Peter nhận định về sự im lặng bất thường của vùng đất).
- **Enemies:** 2 `enemy_memory_wraith` (tuần tra ngoài sương mù).

### Map 2: `map_ch3_silent_necropolis` (Nghĩa Địa Trầm Lặng) — `28×18` tiles · `dungeon_tileset`

- **Đặc trưng:** Rừng bia mộ đá cổ san sát nhau; ánh sáng xanh lam lập lòe phát ra từ các hốc mộ; Neris bị dồn vào góc tường đá phía đông bắc.
- **Spawns:** `default` / `from_gate` (`x: 2, y: 9`), `from_echoes` (`x: 26, y: 9`), `from_vault` (`x: 14, y: 16`).
- **Exits:**
  - `necropolis_to_gate` (`x: 1, y: 9`).
  - `necropolis_to_echoes` (`x: 27, y: 8..10`, `requiresFlag: "solved_sculptor_tomb"`, `lockedDialogueId: "ch3_hall_gate_locked"`).
  - `necropolis_to_secret_vault` (`x: 14, y: 17`, `requiresFlag: "found_forgotten_vault_key"`, `lockedDialogueId: "ch3_secret_vault_locked"`).
- **NPC & POI:**
  - `npc_neris` (`x: 18, y: 4` — nữ thủ thư Neris sau khi được cứu).
  - `poi_sculptor_tomb_owl`, `poi_sculptor_tomb_turtle`, `poi_sculptor_tomb_willow` (`x: 8, 12, 16; y: 12` — 3 bia mộ chạm nổi cho Câu đố 1).
  - `poi_ancient_urn_clue` (`x: 5, y: 5` — chiếc bình cổ chứa trang nhật ký rách của học trò điêu khắc gia).
- **Enemies & Harassers:** 3 `enemy_memory_wraith` (2 con bao vây Neris làm quest harassers).

### Map 3: `map_ch3_hall_of_echoes` (Hành Lang Vang Vọng) — `30×20` tiles · `dungeon_tileset`

- **Đặc trưng:** Đại sảnh hình chữ nhật với 4 hàng cột đá đồ sộ; âm thanh bước chân vang vọng ngân dài; giữa phòng có 2 Thạch Trụ Phản Xạ.
- **Spawns:** `default` / `from_necropolis` (`x: 2, y: 10`), `from_vaults` (`x: 28, y: 10`).
- **Exits:**
  - `echoes_to_necropolis` (`x: 1, y: 9..11`).
  - `echoes_to_vaults` (`x: 29, y: 9..11`, `requiresFlag: "solved_pillar_resonance"`, `lockedDialogueId: "ch3_vault_stairs_locked"`).
- **NPC & POI:**
  - `poi_resonance_pillar_left` (`x: 10, y: 8`), `poi_resonance_pillar_right` (`x: 20, y: 8` — 2 thạch trụ phản xạ cho Câu đố 2).
  - `poi_acoustic_manual_shelf` (`x: 15, y: 4` — giá đá để cuốn sổ tay âm học).
- **Enemies:** 3 `enemy_memory_wraith` và 2 `enemy_hollow_archivist` (tạo điều kiện cho cơ chế dụ quái phase-blink).

### Map 4: `map_ch3_memory_vaults` (Hầm Ngầm Tinh Thể) — `26×18` tiles · `sunken_tileset`

- **Đặc trưng:** Hang đá ngầm sâu thẳm lấp lánh tinh thể tím; vực thẳm ngăn đôi căn phòng; sàn gạch ảo ảnh chỉ hiện ra khi gõ Chuông Hồi Âm; đấu trường Mid-Boss ở buồng trong.
- **Spawns:** `default` / `from_echoes` (`x: 2, y: 9`), `from_archives` (`x: 24, y: 9`).
- **Exits:**
  - `vaults_to_echoes` (`x: 1, y: 9`).
  - `vaults_to_archives` (`x: 25, y: 8..10`, `requiresFlag: "defeated_faceless_keeper"`, `lockedDialogueId: "ch3_archive_ascent_locked"`).
- **POI & Encounters:**
  - `poi_echo_bell_copper`, `poi_echo_bell_iron`, `poi_echo_bell_silver` (`x: 4; y: 6, 9, 12` — 3 chuông hồi âm cho Câu đố 3).
  - `poi_abyss_chasm` (`x: 8..18, y: 7..11` — vực sâu ảo ảnh).
  - `enc_faceless_keeper` (`x: 20, y: 9` — Mid-Boss turn-based).

### Map 5: `map_ch3_great_archive` (Đại Thư Viện Ký Ức) — `30×20` tiles · `dungeon_tileset`

- **Đặc trưng:** Kỳ quan kiến trúc với các dãy hành lang đá cao ngất chứa hàng vạn ống đồng lưu trữ ký ức; bàn đọc sách của các học giả cổ; cổng vòm vào Hoàng Lăng ở phía bắc.
- **Spawns:** `default` / `from_vaults` (`x: 15, y: 18`), `from_mausoleum` (`x: 15, y: 2`).
- **Exits:**
  - `archives_to_vaults` (`x: 15, y: 19`).
  - `archives_to_mausoleum` (`x: 14..16, y: 1`, `requiresFlag: "solved_censorship_ledger"`, `lockedDialogueId: "ch3_royal_mausoleum_sealed"`).
- **NPC & POI:**
  - `npc_neris_desk` (`x: 12, y: 14` — Neris ngồi phân loại tài liệu hỗ trợ Peter).
  - `npc_ghost_librarian` (`x: 6, y: 6` — linh hồn nữ thủ thư già khóc tìm bài hát ru, quest phụ 1).
  - `npc_ghost_knight` (`x: 24, y: 6` — linh hồn kỵ sĩ tìm mảnh chân dung hôn thê, quest phụ 2).
  - `poi_censorship_console` (`x: 15, y: 4` — bàn điều khiển 3 biểu tượng gia huy cho Câu đố 4).
  - `poi_blacklist_scroll` (`x: 10, y: 8`), `poi_court_timeline_book` (`x: 20, y: 8` — 2 tài liệu đối chiếu chéo).
- **Enemies:** 3 `enemy_hollow_archivist`, 2 `enemy_thought_eater` (tuần tra các dãy hành lang sách).

### Map 6: `map_ch3_royal_mausoleum` (Hoàng Lăng Ký Ức) — `26×18` tiles · `dungeon_tileset`

- **Đặc trưng:** Lăng mộ hoàng gia với các bức phù điêu mạ vàng đã ố xỉn; chính giữa đặt ngai vàng đá nơi Vua Alden ngồi ôm đầu trong tuyệt vọng; phía sau là cổng vào Thánh Điện.
- **Spawns:** `default` / `from_archives` (`x: 13, y: 16`), `from_sanctum` (`x: 13, y: 2`).
- **Exits:**
  - `mausoleum_to_archives` (`x: 13, y: 17`).
  - `mausoleum_to_sanctum` (`x: 12..14, y: 1`, `requiresFlag: "cleared_king_despair"`, `lockedDialogueId: "ch3_sanctum_door_locked"`).
- **NPC & POI:**
  - `npc_amnesiac_king` (`x: 13, y: 7` — Vua Alden trên ngai vàng).
  - `poi_queen_ribbon_shrine` (`x: 6, y: 8` — bệ thờ dải ruy băng thêu hoa của Hoàng hậu).
  - `poi_royal_dispatch_log` (`x: 20, y: 8` — sổ nhật trình điều binh ngoài tiền tuyến).
  - `poi_queen_portrait_canvas` (`x: 22, y: 14` — bức tranh chân dung bị đổi màu, câu đố bùa ẩn).
- **Enemies:** 2 `enemy_thought_eater` (bám quanh góc điện hút năng lượng ký ức).

### Map 7: `map_ch3_choir_sanctum` (Thánh Điện Hợp Xướng) — `22×16` tiles · `dungeon_tileset` / `sunken_tileset`

- **Đặc trưng:** Khán đài tròn lơ lửng giữa biển sao ký ức; 3 Lõi Tinh Thể Trụ (_Tuổi Trẻ, Chiến Tranh, Tang Lễ_) bao quanh vòm năng lượng của Lõi Memory Seal.
- **Spawns:** `default` / `from_mausoleum` (`x: 11, y: 14`), `revive` (`x: 11, y: 13`).
- **Exits:**
  - `sanctum_to_mausoleum` (`x: 11, y: 15`).
  - `sanctum_to_chapter4` (`x: 11, y: 2`, `requiresFlag: "memory_seal_restored"`).
- **Encounter & POI:**
  - `enc_nameless_choir` (`x: 11, y: 7` — Final Boss turn-based `boss_nameless_choir`).
  - `poi_memory_seal` (`x: 11, y: 4` — Lõi Phong Ấn Ký Ức, tương tác sau khi hạ boss).
- **Triggers:** `trig_choir_encounter` (`zone` tại `x: 9..13, y: 10`, bắt đầu thoại trước trận chiến).

### Map 8: `map_ch3_forgotten_vault` (Kho Ký Ức Bị Xóa Bỏ) — `20×14` tiles · `dungeon_tileset` [MAP ẨN]

- **Đặc trưng:** Mật thất tĩnh lặng tuyệt đối dưới lòng Nghĩa Địa; không có âm nhạc, chỉ có tiếng tích tắc cô đơn; giữa phòng đặt chiếc hộp sắt đen tuyền chứa vũ khí ẩn.
- **Spawns:** `default` / `from_necropolis` (`x: 10, y: 12`).
- **Exits:** `vault_to_necropolis` (`x: 10, y: 13`).
- **POI:**
  - `poi_blank_music_box` (`x: 10, y: 6` — hộp cơ khí không tên chứa thanh kiếm ẩn `memory_needle_rapier`).
  - `poi_unwritten_monument` (`x: 5, y: 4` — bia đá không chữ để lại một mảnh giấy cháy dở: _"Đừng tìm tao... hãy sống cuộc đời của mày"_ — gợi ý gián tiếp về Kuro).

---

## 4. Danh Sách Nhân Vật (NPCs)

1. **Peter** — `[Tái sử dụng CHAR_PETER_002/003/004]` Nam 26 tuổi, thợ sửa đồng hồ từ Khánh Hòa; tóc xoăn ngắn gọn tự nhiên (`Curly Hair Lock`); trang bị kiếm và bùa; đồng hồ quả quýt của ông nội chạy ngược liên tục khi tới gần các tinh thể ký ức rò rỉ.
2. **Neris (`npc_neris`)** — `[Sprite MỚI — Must, 32×32]` Nữ thủ thư trẻ (~22 tuổi). Mặc áo chẽn xám tro thêu chỉ lam mờ, đeo túi da đựng ống kính soi văn tự cổ; tóc thắt bím lệch vai; ánh mắt sâu thẳm nhưng luôn vương nét bối rối vì không thể nhớ nổi tên thật của mình.
3. **Vua Alden Mất Trí (`npc_amnesiac_king`)** — `[Sprite MỚI — Must, 32×32]` Vị vua già tóc hoa râm (~55 tuổi). Ngồi bất động trên ngai vàng, mặc hoàng bào rách gấu; tay run rẩy cầm chiếc ly độc bằng bạc; ánh mắt giằng xé dữ dội giữa ký ức của một vị minh quân và một kẻ sát thê.
4. **Dư Ảnh Trưởng Lão (`npc_elder_ch3_echo`)** — `[Tái sử dụng NPC_ELDER_001 + tint tím lân tinh, alpha 0.5]` Hiện diện đúng 1 lần duy nhất tại Tiền Đình Lăng Mộ trao lời khuyên về "ký ức mượn" rồi tan biến.
5. **Hồn Ma Nữ Thủ Thư (`npc_ghost_librarian`)** — `[Tái sử dụng sprite bà lão + tint lam]` Bà lão thủ thư ôm cuốn danh bạ rách, khóc vì quên mất giai điệu bài hát ru mẹ từng hát.
6. **Hồn Ma Kỵ Sĩ (`npc_ghost_knight`)** — `[Tái sử dụng sprite chiến binh + tint lam]` Kỵ sĩ áo giáp sứt mẻ đứng cạnh bệ đá tìm kiếm 3 mảnh chân dung của người vợ chưa cưới.
7. **The Keeper Without a Face (`boss_faceless_keeper`)** — `[Sprite MỚI — Must, 32×32 Mid-Boss]` Thực thể bảo hộ mặc áo liệm xám, khuôn mặt là một tấm gương phẳng lì phản chiếu chính hình bóng của Peter.
8. **The Nameless Choir (`boss_nameless_choir`)** — `[Sprite MỚI — Must, 64×64 Boss]` Hiện thân thần thánh hỗn loạn của hàng ngàn linh hồn bị lãng quên. Khối tinh thể pha lê đen khổng lồ lơ lửng, bao quanh bởi những khuôn mặt bóng ma xoay tròn hát những giai điệu bi tráng.

---

## 5. Cơ Chế Giải Đố Chi Tiết (Puzzles Specification)

> **Bộ Quy Tắc Vàng:** Mọi câu đố đều yêu cầu **đối chiếu chéo (cross-reference) từ 2 manh mối trở lên** nhặt được trong thế giới dưới dạng vật phẩm `document` hoặc bia ký. Thử sai luôn đưa ra gợi ý logic cụ thể, không bao giờ gây bế tắc (soft-lock). Tuyệt đối không lặp lại bất kỳ cơ chế nào từ Chapter 1 & 2.

### 5.1. Câu Đố 1 (Danh Tính & Di Vật): Ngôi Mộ Của Điêu Khắc Gia

- **Vấn đề:** Cửa vào Hành Lang Vang Vọng (`poi_hall_gate`) bị khóa bằng ổ khóa cơ khí mỹ nghệ. Trên ngàm cửa có một hốc tròn hình chiếc đục điêu khắc. Peter cần đặt đúng chiếc **Đục Chạm Cổ** (`ancient_carving_chisel`) vào hốc. Chiếc đục nằm trong một trong 3 ngôi mộ bia đá chạm nổi tại Nghĩa Địa Trầm Lặng (`map_ch3_silent_necropolis`). Mở sai mộ sẽ kích hoạt bẫy sương mù và bia đá tự đóng lại.
- **Manh mối 1 (Tài liệu `sculptor_apprentice_diary` - nhặt từ chiếc bình cổ `poi_ancient_urn_clue`):**
  > _"Thầy ta căm ghét loài chim cú vì tiếng kêu xui xẻo, và luôn chê rùa biển chậm chạp làm hỏng bố cục đá. Trước khi nhắm mắt, thầy dặn chỉ khắc lên mộ loài cây rủ bóng bên dòng sông quê hương."_
- **Manh mối 2 (Hóa đơn thuế `sculptor_tax_receipt` - đọc trên bàn đá thư viện):**
  > _"Điêu khắc gia Thao tác viên Bậc 4: Đăng ký sinh phần tại Lô số III, nơi cây liễu rủ bóng cạnh lối ngầm dẫn ra hồ nước."_
- **Quy trình giải:**
  1. Đọc Manh mối 1 $\to$ Loại trừ Mộ Cú vọ (`poi_sculptor_tomb_owl`) và Mộ Rùa biển (`poi_sculptor_tomb_turtle`). Manh mối dẫn về Mộ Cây Liễu.
  2. Đọc Manh mối 2 $\to$ Xác nhận Mộ Cây Liễu (`poi_sculptor_tomb_willow`) chính là sinh phần của vị điêu khắc gia bậc thầy.
  3. Mở Mộ Cây Liễu $\to$ Nhặt được vật phẩm `ancient_carving_chisel` (`puzzle`).
  4. Lắp đục vào cửa $\to$ Mở khóa cửa dẫn sang Hành Lang Vang Vọng (`setFlags: ["solved_sculptor_tomb"]`).
- **Gợi ý khi thử sai:**
  - Mở Mộ Cú vọ $\to$ _"Bia đá chạm chim cú. Một làn khói đen xì ra: 'Người nằm đây là một thợ săn đêm, không hề biết cầm đục đá.'"_
  - Mở Mộ Rùa biển $\to$ _"Bia đá chạm rùa biển. Dòng chữ mờ: 'Kẻ an nghỉ là một hoa tiêu viễn chinh.'"_
- **Engine Split:**
  - _Engine đã có:_ `dialogueRules` (`ifItem`), `takeItems`, `setFlags`, `grantItems`, `grantOnceFlag`.
  - _Engine cần thêm:_ Không cần thêm logic mới.

### 5.2. Câu Đố 2 (Chiến Đấu & Phản Xạ Ký Ức): Thạch Trụ Động Lực

- **Vấn đề:** Tại `map_ch3_hall_of_echoes`, cầu thang dẫn xuống Hầm Ngầm Tinh Thể bị chặn bởi bức tường đá cộng hưởng. Hai Thạch Trụ Phản Xạ (`poi_resonance_pillar_left`, `poi_resonance_pillar_right`) đứng song song. Chúng không phản ứng với tương tác tay thông thường, mà đòi hỏi hấp thụ xung lực vật lý mạnh từ phía sau trong vòng 2 giây kể từ khi bị kích hoạt bằng ánh sáng Cerulean.
- **Manh mối 1 (Sách hướng dẫn `acoustic_manual_page` - tại giá đá `poi_acoustic_manual_shelf`):**
  > _"Thạch Trụ Ký Ức lưu trữ xung động cơ học. Khi hấp thu ánh sáng Cerulean từ Nhãn Thời Gian, thạch trụ sẽ mở mạch thu lực trong đúng hai giây. Chỉ có cú vung kiếm thần tốc từ phía sau lưng trụ mới truyền trọn vẹn bước sóng mở cổng."_
- **Manh mối 2 (Quan sát tập tính quái vật trong phòng):**
  > Quái vật _Bóng Ma Ký Ức_ (`enemy_memory_wraith`) trong phòng luôn dịch chuyển tức thời (phase-blink) ra sau lưng Peter mỗi khi Peter tung đòn đánh trượt hoặc lướt né (Shift).
- **Quy trình giải:**
  1. Peter đứng trước Thạch Trụ, kích hoạt Nhãn Thời Gian (`[2]`) $\to$ Trụ bừng sáng Cerulean trong 2 giây.
  2. Dụ một con quái tấn công $\to$ Bấm Shift lướt xuyên qua trụ ra phía sau lưng trụ $\to$ Con quái phase-blink bám theo Peter ra sau trụ $\to$ Peter quay lại tung đòn chém quét trúng cả quái vật lẫn lưng thạch trụ.
  3. Lặp lại với trụ bên phải $\to$ Cả hai trụ nạp đầy xung lực, phát ra âm thanh hòa âm và mở toang cầu thang đá (`setFlags: ["solved_pillar_resonance"]`).
- **Gợi ý khi thử sai:**
  - Tương tác bằng phím E thông thường $\to$ _"Thạch trụ trơ trơ bằng đá tảng nguội ngắt. Bàn tay trần không thể kích thích các tinh thể dao động."_
  - Đánh kiếm khi chưa dùng Nhãn Thời Gian $\to$ _"Lưỡi kiếm chém vào đá nảy lửa chan chát. Tinh thể chưa mở mạch thu sóng lực nên không hấp thụ xung chấn."_
- **Engine Split:**
  - _Engine đã có:_ Hệ thống chiến đấu Action Combat chuột trái/Shift/chuột phải, cờ flag.
  - _Engine cần thêm:_ Kích hoạt trigger thạch trụ nhận va chạm đòn đánh melee (`hitBoxTrigger`) khi cờ trạng thái cerulean đang bật.

### 5.3. Câu Đố 3 (Không Gian Thời Gian Thực & Ảo Ảnh 8 Giây): Vực Sâu Ký Ức

- **Vấn đề:** Tại `map_ch3_memory_vaults`, một vực thẳm sâu hun hút ngăn cách lối sang buồng Mid-Boss. Dưới vực không có cầu, chỉ có những phiến đá ảo ảnh trong suốt. Ba quả chuông hồi âm bằng đồng, bạc và sắt treo ở bờ vực. Gõ đúng chuông sẽ làm lộ ra con đường đá vững chắc kéo dài đúng 8 giây trước khi tan biến. Gõ sai chuông sẽ tạo ra con đường đá giả dẫn vào bẫy hố sâu.
- **Manh mối 1 (Bản đồ địa chất `miner_geological_chart` - nhặt ở xe goòng):**
  > _"Mạch đá vôi dưới đáy vực chỉ phản xạ bước sóng âm của kim loại có cùng tần số rung với quặng đồng đỏ nằm ở vách phía bắc."_
- **Manh mối 2 (Bài ca thợ mỏ `miner_hymn_scrap` - Neris đọc giúp):**
  > _"Chuông sắt gọi đá lở, chuông bạc đánh thức hư vô, chỉ có tiếng vang của chuông đồng thau mới làm đông kết những hạt bụi ký ức thành lối đi vững chãi."_
- **Quy trình giải:**
  1. Đối chiếu bản đồ địa chất và bài ca $\to$ Xác định quả chuông đúng là **Chuông Đồng Thau** (`poi_echo_bell_copper`).
  2. Peter chém vào Chuông Đồng Thau $\to$ Một con đường đá phát sáng xanh lam hiện rõ qua vực thẳm; đồng hồ đếm ngược 8 giây bắt đầu tích tắc.
  3. Người chơi dùng Shift lướt nhanh qua cầu trong vòng 8 giây trước khi đá tan biến $\to$ Sang bờ bên kia an toàn (`setFlags: ["crossed_memory_abyss"]`).
- **Gợi ý khi thử sai:**
  - Gõ Chuông Sắt $\to$ Đá nứt rạn kêu răng rắc $\to$ _"Tiếng chuông sắt quá thô nặng làm các tinh thể bụi rung lắc dữ dội rồi sụp đổ ngay khi vừa chạm chân vào."_ (Peter rơi xuống được đưa về mép vực an toàn, không chết).
  - Gõ Chuông Bạc $\to$ Hiện ra cây cầu ánh bạc nhưng xuyên thấu như bong bóng $\to$ _"Cầu bạc chỉ là ảo ảnh thị giác, bước lên sẽ hụt chân rơi xuống."_
- **Engine Split:**
  - _Engine đã có:_ Timer nhiệm vụ, hồi sinh tại safe point.
  - _Engine cần thêm:_ Layer gạch bật tắt hiển thị theo thời gian (`temporaryTileBridge` kéo dài 8 giây rồi tự ẩn và tắt va chạm).

### 5.4. Câu Đố 4 (Đối Chiếu Chéo Logic Tam Đoạn): Sổ Kiểm Duyệt Hoàng Gia

- **Vấn đề:** Cửa vào Hoàng Lăng tại `map_ch3_great_archive` bị khóa bằng một bàn điều khiển 3 ổ khóa mang hình biểu tượng linh thú (`poi_censorship_console`). Bảng điều khiển có 4 nút bấm: _Ưng (Falcon), Sói (Wolf), Hươu (Stag), Rắn (Serpent)_. Người chơi phải bấm đúng 3 linh thú tượng trưng cho 3 vị đại thần **KHÔNG PHẢI KẺ PHẢN NGHỊCH** (bị xử oan) để mở cửa.
- **Manh mối 1 (Sổ Đen Kiểm Duyệt `censor_blacklist_doc` - tại kệ sách `poi_blacklist_scroll`):**
  > _"Các mật danh phản quốc bị kết tội tạo phản: 'Huyết Ưng', 'Dạ Lang', 'Bạch Lộc', 'Xích Xà'. Tuy nhiên, Sắc Lệnh Ân Xá ghi rõ: kẻ nào không có mặt tại Kinh đô vào Năm Đại Loạn (Năm 312) thì hoàn toàn vô tội."_
- **Manh mối 2 (Biên niên sử triều đình `court_timeline_doc` - tại bàn đọc `poi_court_timeline_book`):**
  > _"Niên biểu Năm 312: Đại tướng Dạ Lang (Sói) trấn thủ biên cương phía tây; Thượng thư Bạch Lộc (Hươu) đi sứ phương nam; Quan ngự sử Xích Xà (Rắn) đang dưỡng bệnh tại quê nhà. Duy chỉ có Thống lãnh Huyết Ưng (Ưng) nắm giữ cấm quân tại hoàng cung."_
- **Quy trình giải:**
  1. Đọc Manh mối 1 $\to$ Cần tìm 3 người không có mặt tại kinh đô năm 312.
  2. Đọc Manh mối 2 $\to$ Thống lãnh Huyết Ưng (Ưng) là kẻ duy nhất có mặt tại cung đình $\to$ Kẻ phản bội thực sự là **Ưng (Falcon)**.
  3. Ba người vô tội bị kết án oan là **Sói (Wolf), Hươu (Stag), và Rắn (Serpent)**.
  4. Người chơi tương tác bàn điều khiển, chọn kích hoạt lần lượt 3 linh thú: _Sói $\to$ Hươu $\to$ Rắn_ $\to$ Cửa Hoàng Lăng mở toang (`setFlags: ["solved_censorship_ledger"]`).
- **Gợi ý khi thử sai:**
  - Bấm chọn Ưng (Falcon) $\to$ Đèn đỏ báo động réo lên $\to$ _"Bàn điều khiển từ chối biểu tượng Huyết Ưng: 'Linh thú mang vết nhơ phản bội tại cung cấm năm 312 không thể mở cánh cửa hoàng gia!'"_ (Các nút tự nhả về vị trí cũ).
- **Engine Split:**
  - _Engine đã có:_ Cây đối thoại nhánh logic, kiểm tra cờ.
  - _Engine cần thêm:_ Không cần thêm logic mới.

### 5.5. Câu Đố 5 (Tẩy Xóa Ký Ức Cấy Ghép): Nỗi Oan Của Vua Alden

- **Vấn đề:** Vua Alden (`npc_amnesiac_king`) tại `map_ch3_royal_mausoleum` bị giam cầm trong cơn mê sảng tội lỗi. Ông khăng khăng rằng chính tay mình đã bưng chiếc ly độc đầu độc Hoàng hậu vào đêm yến tiệc, và từ chối trao chìa khóa mở đường vào Thánh Điện. Mọi nỗ lực khuyên can bằng lời nói đều thất bại vì ký ức tội lỗi đã bị cấy sâu vào tâm thức ông.
- **Manh mối 1 (Dải ruy băng của Hoàng hậu `queen_ribbon_item` - nhặt tại bệ thờ `poi_queen_ribbon_shrine`):**
  > _"Mảnh vải lụa thêu dòng huyết thư mờ: 'Kẻ dâng rượu mang dấu ấn hai con rắn của Giáo phái Hư Vô... Chàng đang ở chiến trường phương bắc, xin đừng để chàng tự trách mình...'"_
- **Manh mối 2 (Nhật trình điều binh hoàng gia `royal_dispatch_log_item` - tại bàn đá `poi_royal_dispatch_log`):**
  > _"Ngày 14 tháng Thu: Nhà vua đích thân dẫn quân công phá pháo đài phương bắc suốt ba ngày đêm, cách kinh đô hơn ba trăm dặm."_
- **Manh mối 3 (Soi ký ức bằng Nhãn Thời Gian trên chiếc ly bạc `poi_poison_chalice`):**
  > Khi Peter kích hoạt Nhãn Thời Gian soi vào chiếc ly độc trên tay nhà vua, anh phát hiện một dòng năng lượng tím bất thường cấy ghép một đoạn ảo ảnh giả vào tâm trí ông.
- **Quy trình giải:**
  1. Peter nói chuyện với Vua Alden, đưa ra Dải ruy băng thêu hoa $\to$ Nhà vua bàng hoàng nhận ra nét thêu của Hoàng hậu.
  2. Peter đưa Nhật trình điều binh chứng minh khoảng cách ba trăm dặm không thể di chuyển trong đêm $\to$ Ký ức giả bị dao động.
  3. Peter dùng _Causality Resonance_ kết hợp _Nhãn Thời Gian_ chạm vào ly độc $\to$ Bẻ gãy mối liên kết ký ức cấy ghép $\to$ Nhà vua bừng tỉnh, nhận ra âm mưu của Dàn Hợp Xướng Vô Danh và trao **Huy Hiệu Hoàng Gia** (`royal_seal_crest`) mở cửa Thánh Điện (`setFlags: ["cleared_king_despair"]`).
- **Gợi ý khi thử sai:**
  - Nói chuyện khi chưa đủ 2 manh mối $\to$ Nhà vua ôm đầu gào thét $\to$ _"Các ngươi dối trá! Ta nhớ rõ hơi ấm chiếc ly bạc trên tay mình... Ta là kẻ sát nhân!"_
- **Engine Split:**
  - _Engine đã có:_ `dialogueRules` kiểm tra sở hữu vật phẩm (`ifItem`), hiệu ứng cờ.
  - _Engine cần thêm:_ Không cần thêm logic mới.

---

## 6. Thiết Kế Giao Tranh & Boss Cơ Chế (Combat & Encounters)

### 6.1. Ba Hành Vi Quái Mới Độc Đáo Trên Bản Đồ (Action Combat)

Để nâng cao thử thách so với Chapter 2 (nơi chỉ có quái húc khiên và phản đòn), Chapter 3 giới thiệu **3 hành vi quái hoàn toàn mới**:

| Quái Vật                                    | Bản Đồ                          | Hành Vi Cơ Chế MỚI (Action Behaviour)                                                                                                                                                                                | Cách Khắc Chế                                                                                  |
| ------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Bóng Ma Ký Ức** (`enemy_memory_wraith`)   | Tiền Đình, Nghĩa Địa, Hành Lang | **Dịch chuyển tức thời khi đánh trượt (`teleport_evade`):** Nếu Peter chém trượt hoặc chém vào lúc quái không bị choáng, nó lập tức tan thành làn khói tím và xuất hiện ngay sau lưng Peter tung đòn đâm hiểm hóc.   | Dùng Shift lướt né ngay khi nó biến mất, quay 180 độ chém phản đòn khi nó vừa hiện hình.       |
| **Kẻ Gặm Ý Nghĩ** (`enemy_thought_eater`)   | Thư Viện, Hoàng Lăng            | **Khu Vực Ký Ức Ô Nhiễm (`hazard_pool_aoe`):** Mỗi 6 giây, quái cắm móng xuống đất tạo ra một vũng lầy năng lượng tím tồn tại trong 8 giây. Đứng trong vũng sẽ bị giảm 40% tốc độ chạy và bị rút liên tục 2 MP/giây. | Dụ quái rời khỏi vũng lầy, dùng đòn đánh tầm xa hoặc Đòn Thời Gian kết liễu nhanh.             |
| **Thủ Thư Rỗng** (`enemy_hollow_archivist`) | Hành Lang, Thư Viện             | **Phân Thân Ảo Ảnh (`clone_decoy`):** Khi máu tụt xuống dưới 50%, quái tự nhân bản thành 2 phân thân. Phân thân có 1 HP, di chuyển và vung gậy y hệt bản gốc nhưng không gây sát thương.                             | Kích hoạt Nhãn Thời Gian: bản gốc sẽ tỏa quầng sáng Cerulean đặc trưng, bản phân thân mờ nhạt. |

### 6.2. Mid-Boss Theo Lượt: The Keeper Without a Face (`boss_faceless_keeper`)

- **Vị trí:** `map_ch3_memory_vaults`.
- **Chỉ số đề xuất:** Cấp 13, HP `480`, ATK `22`, DEF `16`, SPD `12`.
- **Cơ chế cốt truyện — "Bản Thể Bị Sao Chép & Khóa Ký Ức" (`Identity Siphon & Memory Lock`):**
  - **Lượt 1 (Sao chép):** Boss nâng tấm gương không mặt lên phản chiếu Peter. Boss sao chép vũ khí và bùa của Peter, tăng vọt chỉ số tương ứng.
  - **Mỗi 3 lượt (Khóa Lệnh):** Boss tung chiêu _Khóa Ký Ức Hành Động_ (`Memory Lock`), niêm phong 1 lệnh cụ thể của Peter trong 2 lượt:
    - _Khóa Đòn Đánh:_ Nút `[1] TẤN CÔNG` bị đóng băng xám xịt $\to$ Peter bắt buộc phải dùng `[2] KỸ NĂNG` (Đòn Thời Gian) hoặc `[4] VẬT PHẨM`.
    - _Khóa Kỹ Năng:_ Nút `[2] KỸ NĂNG` bị khóa $\to$ Peter phải xoay sang đòn đánh vật lý hoặc phòng thủ `[3] ĐỠ`.
  - **Điểm yếu (Phản Phục Bản Thể):** Khi bị khóa một loại hành động, nếu Peter thực hiện thành công hành động đối lập (ví dụ: bị khóa Đòn Đánh mà dùng Đòn Thời Gian gây bạo kích), tấm gương của boss sẽ bị nứt rạn (`stagger`), giải phóng lệnh bị khóa và khiến boss chịu thêm 50% sát thương trong lượt tiếp theo!

### 6.3. Final Boss Theo Lượt: The Nameless Choir (`boss_nameless_choir`)

- **Vị trí:** `map_ch3_choir_sanctum`.
- **Chỉ số đề xuất:** Cấp 15, HP `750`, ATK `26`, DEF `18`, SPD `11`.
- **Cơ chế cốt truyện — "Khúc Ca Của Hàng Vạn Linh Hồn & 3 Lõi Tinh Thể" (`Choral Dissonance & Chime Anchors`):**
  - **Lớp Giáp Tuyệt Đối:** Khối tinh thể Choir được bao bọc bởi _Lá Chắn Nghìn Ký Ức_ (`damageReduction: 0.85`). Đánh trực diện chỉ gây sát thương tối thiểu.
  - **Ba Lõi Tinh Thể Xung Quanh:** Lõi A (_Tuổi Trẻ_), Lõi B (_Chiến Tranh_), Lõi C (_Tang Lễ_).
  - **Cơ chế hòa âm theo lượt:** Đầu mỗi hiệp đấu, dàn hợp xướng hát lên một đoạn ca dao cổ phản ánh một giai đoạn cuộc đời:
    - _Giai điệu 1 (Tuổi Trẻ):_ _"Bờ tre tiếng sáo diều, mâm cơm mẹ gọi bên sông..."_ $\to$ Peter phải chọn lệnh môi trường tác động vào **Lõi Tuổi Trẻ**.
    - _Giai điệu 2 (Chiến Tranh):_ _"Mũi tên xé toạc màn sương, tiếng gươm đao gãy nát..."_ $\to$ Peter phải tác động vào **Lõi Chiến Tranh**.
    - _Giai điệu 3 (Tang Lễ):_ _"Nén hương tàn trong đêm lạnh, giọt lệ tiễn đưa người nằm xuống..."_ $\to$ Peter phải tác động vào **Lõi Tang Lễ**.
  - **Giai đoạn phá giáp:** Tác động đúng lõi sẽ tạo ra một luồng sóng cộng hưởng cerulean đánh vỡ một phần lá chắn của Choir và gây 120 sát thương thuần. Đủ 3 lần hòa âm chính xác $\to$ Lá chắn vỡ vụn hoàn toàn (`breakShield: true`), toàn bộ các khuôn mặt ma quái dịu lại, lộ ra lõi năng lượng cho Peter tung đòn kết liễu.
  - **Nếu chọn sai:** Dàn hợp xướng gầm thét _Tiếng Gào Lãng Quên_ gây sát thương diện rộng và rút 8 MP của Peter.

---

## 7. Nhiệm Vụ, Cờ Cốt Truyện & Kịch Bản Thoại Nháp

### 7.1. Chuỗi Nhiệm Vụ (`quests.json`) — 7 Chính + 3 Phụ

| Quest ID                        | Tên Nhiệm Vụ                 | Mục Tiêu Chính (`completeOnFlag`)                                                   | Thưởng (~Lv 12–15)                    | Loại  |
| ------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------- | ----- |
| `quest_ch3_sepulcher_gate`      | Cổng Tiền Đình Lăng Mộ       | Nghe lời Trưởng Lão; mở cổng lăng mộ (`opened_sepulcher_gate`)                      | `+100 EXP`                            | Chính |
| `quest_ch3_nameless_archivist`  | Thủ Thư Không Tên            | Cứu Neris (`saved_neris`); giải đố Mộ Điêu Khắc Gia (`solved_sculptor_tomb`)        | `+140 EXP`, `refined_chrono_shard`    | Chính |
| `quest_ch3_echoing_vaults`      | Lối Vào Hầm Ngầm             | Giải đố Thạch Trụ Động Lực (`solved_pillar_resonance`) mở cầu thang                 | `+160 EXP`                            | Chính |
| `quest_ch3_faceless_trial`      | Người Canh Ngục Không Mặt    | Vượt vực thẳm 8s (`crossed_memory_abyss`); hạ Mid-Boss (`defeated_faceless_keeper`) | `+200 EXP`, `ancient_gear` x2         | Chính |
| `quest_ch3_archive_censorship`  | Bản Kiểm Duyệt Thư Viện      | Giải đố Sổ Kiểm Duyệt (`solved_censorship_ledger`) mở cổng Hoàng Lăng               | `+220 EXP`, `imperial_honey_bread` x2 | Chính |
| `quest_ch3_king_dilemma`        | Nỗi Đau Vua Alden            | Tẩy ký ức giả của Vua Alden (`cleared_king_despair`); nhận huy hiệu                 | `+260 EXP`, `tide_dried_fish` x3      | Chính |
| `quest_ch3_nameless_choir`      | Khúc Ca Hàng Vạn Linh Hồn    | Đánh bại Dàn Hợp Xướng; phục hồi Lõi Ký Ức (`memory_seal_restored`)                 | `+350 EXP`, `memory_seal_shard`       | Chính |
| `quest_ch3_lost_lullaby`        | Điệu Hát Ru Thất Lạc _(Phụ)_ | Tìm lại lời bài hát ru cho nữ thủ thư già (`comforted_ghost_librarian`)             | `+120 EXP`, `memory_ink_flask`        | Phụ   |
| `quest_ch3_shattered_portrait`  | Bức Họa Nứt Vỡ _(Phụ)_       | Thu thập 3 mảnh chân dung cho hồn kỵ sĩ (`restored_knight_portrait`)                | `+130 EXP`, `ancient_amber_resin`     | Phụ   |
| `quest_ch3_forgotten_craftsman` | Lò Rèn Ký Ức _(Phụ)_         | Thắp sáng lại lò rèn ngầm bằng tia lửa ký ức (`rekindled_memory_forge`)             | `+150 EXP`, `refined_chrono_shard` x2 | Phụ   |

### 7.2. Danh Sách Cờ Cốt Truyện (`snake_case`)

`ch3_arrived_gate`, `ch3_elder_echo_faded`, `opened_sepulcher_gate`, `saved_neris`, `solved_sculptor_tomb`, `solved_pillar_resonance`, `crossed_memory_abyss`, `defeated_faceless_keeper`, `met_neris_archive`, `solved_censorship_ledger`, `met_amnesiac_king`, `cleared_king_despair`, `met_nameless_choir`, `defeated_nameless_choir`, `memory_seal_restored`, `learned_memory_resonance`, `comforted_ghost_librarian`, `restored_knight_portrait`, `rekindled_memory_forge`, `opened_memory_needle_box`, `restored_queen_canvas`.

### 7.3. Kịch Bản Thoại Nháp (Tiếng Việt, $\le 2$ lựa chọn/node, $\le 220$ ký tự/dòng)

- **`ch3_elder_echo_farewell` (Dư ảnh Trưởng Lão tại Tiền Đình):**
  - Trưởng Lão: _"Peter... bước chân cậu đã đưa cậu tới ranh giới của Ký Ức. Nơi đây, sự lãng quên là một căn bệnh lây lan, và những linh hồn không tên đang khóc đòi lại cuộc đời mình."_
  - Trưởng Lão: _"Hãy cẩn thận với chính tâm trí cậu. Khi dòng ký ức rò rỉ, những gì cậu nhớ rõ nhất chưa chắc đã là những gì cậu từng trải qua."_
  - Peter: _"Cháu chỉ mang chiếc đồng hồ của ông nội và thanh kiếm gãy. Cháu sẽ không để ai lấy mất tên của mình."_

- **`ch3_neris_rescued` (Neris sau khi được Peter giải cứu):**
  - Neris: _"Cảm ơn anh... Những bóng ma ký ức suýt chút nữa đã cắn nát cuốn sổ tra cứu của tôi. Tôi có thể đọc được lịch sử ngàn năm... nhưng khi nhìn vào gương, tôi lại chẳng nhớ nổi mẹ đã gọi tôi bằng cái tên nào."_
  - Lựa chọn 1: `[Tôi sẽ giúp cô tìm lại tên mình]` -> Neris khẽ mỉm cười: _"Tạm thời anh cứ gọi tôi là Neris nhé... đó là mật danh thủ thư của tôi."_
  - Lựa chọn 2: `[Làm sao để mở cánh cửa phía trước?]` -> Neris: _"Ngôi mộ của vị điêu khắc gia nắm giữ chìa khóa, nhưng cần đối chiếu manh mối cẩn thận."_

- **`ch3_king_confront` (Vua Alden ôm đầu trên ngai vàng):**
  - Vua Alden: _"Đừng lại gần ta! Bàn tay này đã rót chén rượu độc... Ta nhớ rõ mùi hạnh nhân đắng ngắt, nhớ ánh mắt nàng nhìn ta trước khi gục xuống!"_
  - Peter: _"Bệ hạ, hãy nhìn dải ruy băng này! Hoàng hậu đã thêu rằng kẻ dâng rượu mang dấu ấn hai con rắn... Người đã chiến đấu ở phương bắc suốt ba ngày đêm, người không hề có mặt ở yến tiệc!"_
  - Lựa chọn 1: `[Dùng Nhãn Thời Gian soi chiếc ly bạc]` -> Ký ức giả tan biến, Nhà vua bàng hoàng tỉnh ngộ.
  - Lựa chọn 2: `[Đưa nhật trình hành quân cho ngài xem]` -> Bằng chứng thép đánh tan ảo ảnh tội lỗi.

- **`ch3_choir_boss_confront` (Trước trận chiến Final Boss):**
  - Dàn Hợp Xướng Vô Danh: _"HÃY NHỚ LẤY CHÚNG TÔI! Hàng vạn con người đã đổ máu, đã yêu thương, đã xây nên thế giới... tại sao lịch sử lại xóa tên chúng tôi?!"_
  - Peter: _"Sự tồn tại không thể đo đếm bằng việc có được ghi vào bia đá hay không. Tiếng gào thét của các người đang bóp nghẹt những linh hồn vô tội!"_

- **`ch3_revelation_shock` (Khoảnh khắc nhận Memory Resonance):**
  - Peter: _"Ánh sáng ký ức tràn ngập tâm trí... Nhưng chờ đã... Ký ức chiều mưa trên căn gác xép, chiếc đồng hồ quả quýt hỏng và lời hứa cùng chia đôi mẩu bánh..."_
  - Peter: _"(Bàn tay run rẩy chạm vào ngực)... Người đứng cạnh mình trong ký ức đó không phải là ông nội... và giọng nói đó không phải của mình. Ký ức này... là của một người khác đã bị thế giới xóa sạch..."_

---

## 8. Trang Bị Ẩn (Hidden Gear)

Chương 3 bố trí đúng 2 trang bị ẩn quý giá, mỗi món nằm sau một câu đố cơ chế riêng biệt:

1. **Vũ khí ẩn (Weapon): Hoài Niệm Kiếm (`memory_needle_rapier`)**
   - **Vị trí:** Mật thất ẩn `map_ch3_forgotten_vault` (lối vào giấu sau bia mộ rỗng tại Nghĩa Địa).
   - **Câu đố:** _Chiếc Hộp Không Ký Ức_. Hộp nhạc bằng thép đen yêu cầu gõ đúng chuỗi nhịp điệu của bài hát ru cổ mà nữ thủ thư già đã nhớ lại.
   - **Chỉ số:** `attack: 11`, `reach: 38`, `swingMs: 330` (sát thương và tốc độ vượt trội hoàn toàn so với Đoản Kiếm Thiết Pháp Quan `8 / 36 / 340`). Không có hiệu ứng phụ.

2. **Bùa ẩn (Charm): Bùa Tinh Thể Hồn Nhiên (`pure_crystal_soul_charm`)**
   - **Vị trí:** Tương tác bức tranh chân dung `poi_queen_portrait_canvas` tại `map_ch3_royal_mausoleum`.
   - **Câu đố:** _Sắc Màu Nguyên Bản_. Phục hồi 3 sắc tố khoáng chất tự nhiên (Đỏ lưu huỳnh, Lam ngọc, Vàng đất) nhặt từ các khu vườn lăng mộ để tẩy lớp sơn tím ma quái bám trên tranh Hoàng hậu.
   - **Chỉ số:** `maxHp: 22`, `maxMp: 12`, `defense: 3`, `speed: 2` (nâng cấp vượt bậc so với Bùa Cán Cân Chân Lý `16 / 8 / 2 / 2`). Không có hiệu ứng phụ.

---

## 9. Danh Mục Tài Nguyên (Asset List — Ưu Tiên Tái Sử Dụng)

| Tài Nguyên               | Loại        | Quy Cách / Đặc Tả                                     | Ưu Tiên               | Trạng Thái / Ghi Chú                                             |
| ------------------------ | ----------- | ----------------------------------------------------- | --------------------- | ---------------------------------------------------------------- |
| `dungeon_tileset`        | Tileset     | 32×32 px (`assets/tilesets/dungeon_tileset.png`)      | **Đã có**             | Dùng cho Nghĩa Địa, Hành Lang, Thư Viện, Hoàng Lăng.             |
| `sunken_tileset`         | Tileset     | 32×32 px (`assets/tilesets/sunken_tileset.png`)       | **Đã có**             | Dùng cho Hầm Ngầm Tinh Thể và Thánh Điện Hợp Xướng.              |
| `wilds_tileset`          | Tileset     | 32×32 px (`assets/tilesets/wilds_tileset.png`)        | **Đã có**             | Dùng cho Tiền Đình Lăng Mộ.                                      |
| `peter_*`                | Spritesheet | 32×32 px (Idle, Walk, Attack, Dodge)                  | **Đã có**             | Giữ nguyên khóa nhận diện tóc xoăn tự nhiên (`Curly Hair Lock`). |
| `npc_elder_echo`         | Spritesheet | 32×32 px                                              | **Đã có**             | Tái sử dụng `NPC_ELDER_001` + shader tím lân tinh mờ ảo.         |
| `npc_neris`              | Spritesheet | 32×32 px (4 frame idle, 4 frame walk)                 | **Must** `[PROPOSAL]` | Nữ thủ thư trẻ tóc bím, túi da đựng ống kính. Cần Owner duyệt.   |
| `npc_amnesiac_king`      | Spritesheet | 32×32 px (4 frame ngồi ngai vàng ôm đầu)              | **Must** `[PROPOSAL]` | Vị vua già hoàng bào rách, cầm ly bạc. Cần Owner duyệt.          |
| `enemy_memory_wraith`    | Spritesheet | 32×32 px (4 frame bay lượn, 2 frame chém)             | **Must** `[PROPOSAL]` | Bóng ma trôi dạt mang áo choàng rách tím. Cần Owner duyệt.       |
| `enemy_thought_eater`    | Spritesheet | 32×32 px (4 frame bò cào, 2 frame cắm móng)           | **Must** `[PROPOSAL]` | Quái thú dị hình nhiều chi chuyên gặm tinh thể. Cần Owner duyệt. |
| `enemy_hollow_archivist` | Spritesheet | 32×32 px (4 frame đi, 2 frame vung gậy)               | **Must** `[PROPOSAL]` | Thủ thư rỗng cầm quyền trượng ống đồng. Cần Owner duyệt.         |
| `boss_faceless_keeper`   | Spritesheet | 32×32 px (4 frame idle gương, 2 frame chém)           | **Must** `[PROPOSAL]` | Mid-Boss mặt gương phẳng lì. Cần Owner duyệt.                    |
| `boss_nameless_choir`    | Spritesheet | 64×64 px (4 frame khối tinh thể xoay, 1 frame tan rã) | **Must** `[PROPOSAL]` | Boss tinh thể đen khổng lồ và các khuôn mặt ma. Cần Owner duyệt. |

---

## 10. Câu Hỏi Mở Cho Owner (Open Questions for Owner)

1. **Mức độ chấn động của cú sốc ký ức cuối Chapter 3:**
   - _Đề xuất (Recommended):_ Giữ đúng canon: Peter nhận ra ký ức ấm áp nhất không thuộc về mình, nhưng **tuyệt đối không nêu tên Kuro** hay chữ "K...". Cảm giác trống rỗng và hụt hẫng này sẽ là động lực mãnh liệt thúc đẩy Peter bước sang Chapter 4 (nơi Kuro chính thức xuất hiện lần đầu tiên theo canon).
2. **Cơ chế dịch chuyển tức thời của Bóng Ma Ký Ức (`teleport_evade`):**
   - _Đề xuất (Recommended):_ Khi quái phase-blink ra sau lưng Peter, cho quái có 0.4 giây "khựng lại lấy đà" (wind-up nhẹ) để người chơi có đủ thời gian phản xạ lướt né (Shift), tránh cảm giác bị đánh lén bất công.
3. **Độ khó của Câu đố 4 (Sổ Kiểm Duyệt):**
   - _Đề xuất (Recommended):_ Cho phép người chơi nói chuyện với Neris bất cứ lúc nào để cô tóm tắt lại các dữ kiện mâu thuẫn nếu người chơi quên nội dung trong tài liệu, giúp giải đố mượt mà không cần mở túi đồ liên tục.
4. **Vị trí mật thất ẩn `map_ch3_forgotten_vault`:**
   - _Đề xuất (Recommended):_ Mở khóa thông qua việc giải quest phụ 2 (chân dung kỵ sĩ), vừa tạo sự gắn kết chặt chẽ cho quest phụ vừa tưởng thưởng xứng đáng cho người chơi chịu khó khám phá.
5. **Sprite quái Thủ Thư Rỗng (`enemy_hollow_archivist`):**
   - _Đề xuất (Recommended):_ Nếu họa sĩ chưa kịp vẽ mới cả 3 quái thường, ưu tiên vẽ `enemy_memory_wraith` và `enemy_thought_eater`; `enemy_hollow_archivist` có thể tạm thời dùng lại sprite lính chấp pháp Chapter 2 đổi áo sang màu tro xám.

---

## 11. Hợp Đồng ID (ID Contract — Dành Cho Xây Dựng Song Song)

Tất cả các định danh bên dưới là quy chuẩn bất biến giữa Content (`dialogue.json`, `quests.json`, `items.json`) và Engine/Maps (`maps.json`, `enemies.json`).

### 11.1. Danh Sách Vật Phẩm Mới (`items.json`)

| Item ID                     | Loại         | Nguồn Cấp (Dialogue Node)   | Ghi Chú                                                         |
| --------------------------- | ------------ | --------------------------- | --------------------------------------------------------------- |
| `sculptor_apprentice_diary` | `document`   | `ch3_urn_clue_read`         | 2 trang, $\le 220$ ký tự/trang (manh mối Mộ Điêu Khắc Gia).     |
| `sculptor_tax_receipt`      | `document`   | `ch3_tax_receipt_read`      | 1 trang, $\le 220$ ký tự/trang (manh mối sinh phần Lô III).     |
| `censor_blacklist_doc`      | `document`   | `ch3_blacklist_scroll_read` | 2 trang, $\le 220$ ký tự/trang (manh mối 4 mật danh phản quốc). |
| `court_timeline_doc`        | `document`   | `ch3_court_timeline_read`   | 2 trang, $\le 220$ ký tự/trang (manh mối niên biểu vắng mặt).   |
| `ancient_carving_chisel`    | `puzzle`     | `ch3_tomb_willow_open`      | Đục chạm cổ dùng mở cổng Hành Lang Vang Vọng.                   |
| `queen_ribbon_item`         | `puzzle`     | `ch3_queen_ribbon_take`     | Dải ruy băng huyết thư của Hoàng hậu minh oan cho Vua.          |
| `royal_seal_crest`          | `puzzle`     | `ch3_king_cleared`          | Huy hiệu hoàng gia mở cổng vào Thánh Điện.                      |
| `memory_needle_rapier`      | `weapon`     | `ch3_needle_box_open`       | `attack: 11, reach: 38, swingMs: 330` (Vũ khí ẩn).              |
| `pure_crystal_soul_charm`   | `charm`      | `ch3_canvas_restored`       | `maxHp: 22, maxMp: 12, defense: 3, speed: 2` (Bùa ẩn).          |
| `memory_ink_flask`          | `consumable` | Thưởng quest phụ 1          | Bình mực ký ức hồi 80 HP và 20 MP.                              |
| `ancient_amber_resin`       | `material`   | Thưởng quest phụ 2          | Nhựa hổ phách hóa thạch dùng phục hồi tranh cổ.                 |
| `memory_seal_shard`         | `key_item`   | Thưởng quest chính boss     | Mảnh tinh thể lam ngọc Lõi Memory Seal.                         |

### 11.2. Danh Sách Nhiệm Vụ (`quests.json`)

`quest_ch3_sepulcher_gate`, `quest_ch3_nameless_archivist`, `quest_ch3_echoing_vaults`, `quest_ch3_faceless_trial`, `quest_ch3_archive_censorship`, `quest_ch3_king_dilemma`, `quest_ch3_nameless_choir`, `quest_ch3_lost_lullaby`, `quest_ch3_shattered_portrait`, `quest_ch3_forgotten_craftsman`.

### 11.3. Danh Sách Dialogue Nodes Theo Bản Đồ (`dialogue.json`)

- **Map 1: Tiền Đình Lăng Mộ (`map_ch3_sepulcher_gate`)**
  - `ch3_gate_arrival`: Trigger chào sân khi vừa bước qua Cổng Ngưỡng.
  - `ch3_elder_echo_farewell`: Dư ảnh Trưởng Lão căn dặn và tan biến (`setFlags: ["ch3_elder_echo_faded"]`).
  - `ch3_sepulcher_gate_locked`: Cửa đá tiền đình khi chưa kích hoạt cơ cấu.
  - `ch3_sepulcher_gate_open`: Kích hoạt cơ cấu mở cổng lăng mộ (`setFlags: ["opened_sepulcher_gate"]`).
  - `ch3_memory_crystal_whisper`: Tương tác cụm tinh thể rò rỉ âm thanh lạ.

- **Map 2: Nghĩa Địa Trầm Lặng (`map_ch3_silent_necropolis`)**
  - `ch3_neris_cornered`: Neris kêu cứu trước khi Peter dọn sạch quái.
  - `ch3_neris_rescued`: Đối thoại giải cứu Neris (`setFlags: ["saved_neris"]`).
  - `ch3_neris_necropolis_hint`: Neris gợi ý về 3 ngôi mộ điêu khắc gia.
  - `ch3_urn_clue_read`: Nhặt nhật ký học trò điêu khắc (`grantItems: sculptor_apprentice_diary`).
  - `ch3_tax_receipt_read`: Đọc hóa đơn thuế Lô III (`grantItems: sculptor_tax_receipt`).
  - `ch3_tomb_owl_inspect`: Kiểm tra mộ chim cú (gợi ý sai).
  - `ch3_tomb_turtle_inspect`: Kiểm tra mộ rùa biển (gợi ý sai).
  - `ch3_tomb_willow_open`: Mở mộ cây liễu nhận đục cổ (`grantItems: ancient_carving_chisel`, `setFlags: ["solved_sculptor_tomb"]`).
  - `ch3_hall_gate_locked`: Cổng vào Hành Lang khi chưa cắm đục.
  - `ch3_hall_gate_opens`: Cắm đục mở cổng hành lang vang vọng.
  - `ch3_secret_vault_locked`: Lối ngầm bí mật khi chưa có chìa khóa.

- **Map 3: Hành Lang Vang Vọng (`map_ch3_hall_of_echoes`)**
  - `ch3_echoes_arrival`: Cảm thán bước chân vang vọng giữa đại sảnh.
  - `ch3_acoustic_manual_read`: Đọc sổ tay âm học thạch trụ.
  - `ch3_pillar_left_inspect`, `ch3_pillar_right_inspect`: Kiểm tra thạch trụ khi chưa kích hoạt.
  - `ch3_pillar_resonance_success`: Hai thạch trụ nạp đầy xung chấn mở cầu thang ngầm (`setFlags: ["solved_pillar_resonance"]`).
  - `ch3_vault_stairs_locked`: Cầu thang ngầm bị màn đá phong tỏa.

- **Map 4: Hầm Ngầm Tinh Thể (`map_ch3_memory_vaults`)**
  - `ch3_vaults_arrival`: Choáng ngợp trước vực thẳm và bụi tinh thể tím.
  - `ch3_geological_chart_read`: Đọc biểu đồ địa chất thợ mỏ.
  - `ch3_echo_bell_iron`: Gõ chuông sắt (đá rạn nứt rơi vực).
  - `ch3_echo_bell_silver`: Gõ chuông bạc (cầu ảo ảnh hụt chân).
  - `ch3_echo_bell_copper`: Gõ chuông đồng (cầu đá hiện ra 8 giây, `setFlags: ["crossed_memory_abyss"]`).
  - `ch3_faceless_keeper_confront`: Đối đầu Mid-Boss mặt gương.
  - `ch3_faceless_keeper_defeated`: Hạ Mid-Boss (`setFlags: ["defeated_faceless_keeper"]`).
  - `ch3_archive_ascent_locked`: Cửa lên Thư Viện khi chưa hạ Mid-Boss.

- **Map 5: Đại Thư Viện Ký Ức (`map_ch3_great_archive`)**
  - `ch3_archives_arrival`: Neris dẫn đường vào trung tâm lưu trữ.
  - `ch3_neris_archive_talk`: Neris hỗ trợ giải mã Sổ Kiểm Duyệt.
  - `ch3_blacklist_scroll_read`: Đọc Sổ Đen Kiểm Duyệt (`grantItems: censor_blacklist_doc`).
  - `ch3_court_timeline_read`: Đọc Niên biểu Năm 312 (`grantItems: court_timeline_doc`).
  - `ch3_censorship_console_inspect`: Kiểm tra bàn điều khiển linh thú.
  - `ch3_censorship_wrong_falcon`: Bấm chọn chim Ưng (báo động đỏ, thử lại).
  - `ch3_censorship_success`: Bấm Sói-Hươu-Rắn mở Hoàng Lăng (`setFlags: ["solved_censorship_ledger"]`).
  - `ch3_royal_mausoleum_sealed`: Cổng Hoàng Lăng khi chưa giải mã xong.
  - `ch3_ghost_librarian_start`, `ch3_ghost_librarian_done`: Chuỗi quest phụ 1.
  - `ch3_ghost_knight_start`, `ch3_ghost_knight_done`: Chuỗi quest phụ 2.

- **Map 6: Hoàng Lăng Ký Ức (`map_ch3_royal_mausoleum`)**
  - `ch3_mausoleum_arrival`: Khí lạnh ngai vàng và tiếng rên xiết của nhà vua.
  - `ch3_amnesiac_king_despair`: Nhà vua tự kết tội bản thân.
  - `ch3_queen_ribbon_take`: Lấy dải ruy băng trên bệ thờ (`grantItems: queen_ribbon_item`).
  - `ch3_royal_dispatch_read`: Đọc sổ nhật trình điều binh.
  - `ch3_king_cleared`: Giải tỏa ký ức giả cho Vua Alden (`grantItems: royal_seal_crest`, `setFlags: ["cleared_king_despair"]`).
  - `ch3_sanctum_door_locked`: Cửa Thánh Điện khi chưa có huy hiệu hoàng gia.
  - `ch3_canvas_inspect`, `ch3_canvas_restored`: Câu đố phục chế tranh lấy bùa ẩn (`grantItems: pure_crystal_soul_charm`, `setFlags: ["restored_queen_canvas"]`).

- **Map 7: Thánh Điện Hợp Xướng (`map_ch3_choir_sanctum`)**
  - `ch3_choir_boss_confront`: Đối chất với Dàn Hợp Xướng Vô Danh (`setFlags: ["met_nameless_choir"]`).
  - `ch3_choir_boss_defeated`: Dàn Hợp Xướng tan rã (`setFlags: ["defeated_nameless_choir"]`).
  - `ch3_seal_restored`: Khôi phục Lõi Memory Seal, kích hoạt chấn động tâm lý về ký ức của Kuro (`setFlags: ["memory_seal_restored", "learned_memory_resonance"]`, `endChapter: 3`).

- **Map 8: Kho Ký Ức Bị Xóa Bỏ (`map_ch3_forgotten_vault`) [BẢN ĐỒ ẨN]**
  - `ch3_forgotten_vault_arrival`: Cảm giác rợn ngợp giữa mật thất không chữ.
  - `ch3_needle_box_inspect`: Hộp nhạc không tên phát bài hát ru.
  - `ch3_needle_box_open`: Nhận Hoài Niệm Kiếm (`grantItems: memory_needle_rapier`, `setFlags: ["opened_memory_needle_box"]`).
  - `ch3_unwritten_monument_whisper`: Đọc mảnh giấy cháy dở (dư âm gián tiếp của Kuro).

---

## 12. Quyết Định Của Owner (2026-11-13) & Hợp Đồng Bổ Sung

Owner duyệt toàn bộ §1–§11 cùng các chỉnh sửa dưới đây. **§12 thay thế** những chỗ mâu thuẫn ở §5, §8, §9, §11.

### 12.1. Câu đố — bản đã duyệt

**C1 · Mộ Điêu Khắc Gia (3 manh mối).** Năm ngôi mộ, mỗi mộ khắc một hình và một số lô: Cú (Lô I), Liễu (Lô II), **Liễu (Lô III — đúng)**, Bàng (Lô IV), Rùa (Lô V).

- `sculptor_apprentice_diary`: thầy chỉ muốn khắc lên mộ "cây của quê nhà, nơi thầy lớn lên bên dòng sông" — không nói tên cây.
- `sculptor_tax_receipt`: quê quán làng **Bến Sông Mờ**; đăng ký sinh phần **Lô III**.
- Bia vùng miền `ch3_regions_stele_read` (không cấp vật phẩm): mỗi làng khắc một loài cây lên mộ con em mình — Bến Sông Mờ: liễu rủ; Đồi Gió: bàng; Đầm Lặng: sen; …
- Mở mộ sai → bẫy sương (`ch3_tomb_wrong_fog`, chỉ gợi ý, không phạt nặng). Mộ đúng → `ancient_carving_chisel`. Cắm đục vào cổng → `opened_hall_gate` (lối sang Hành Lang Vang Vọng).

**C2 · Thạch Trụ Âm Thoa (chiến đấu).** Hai trụ cách nhau 5 ô. Phải **chém trúng cả hai trong vòng 2 giây** (lướt Shift giữa hai trụ). Không cần Nhãn Thời Gian, không cần dụ quái.

- `acoustic_manual_page`: hai trụ là một cặp âm thoa; chỉ khi cả hai được đánh "trong cùng một hơi thở — chưa đầy hai nhịp tim" tiếng vang mới nâng được màn đá.
- Engine: `strikeTargets` (vật thể nhận đòn chém). Chém một trụ → trụ ngân rồi tắt (dòng chữ nổi). Đủ cặp → mở `ch3_pillar_resonance_success` (`solved_pillar_resonance`).

**C3 · Chuông Qua Vực (ghép 2 manh mối + thời gian thực).** Ba chuông chỉ phân biệt bằng **màu**: đỏ gạch, xám tro, trắng.

- `miner_hymn_scrap`: chuông sắt gọi đá lở, chuông bạc đánh thức hư vô, chỉ tiếng **đồng** làm đông kết bụi ký ức thành lối đi.
- `miner_geological_chart`: quặng đồng nhuộm đá màu **gạch nung**; sắt để vệt **xám tro**; bạc kết thành vảy **trắng**.
- Chuông đỏ → cầu đá hiện **8 giây** (`ch3_bridge_up`, engine hẹn giờ). Rơi xuống vực → quay về mép vực, không chết. Sang tới bờ bên kia → `crossed_memory_abyss`.
- POI giữ id `poi_echo_bell_copper / _iron / _silver`, nhưng lời nhắc trên bản đồ chỉ nói màu.

**C4 · Bàn Linh Thú (suy luận theo tháng).** Đại Loạn xảy ra **tháng Ba năm 312**. Ân xá: ai **không ở kinh đô vào tháng Ba** thì vô tội. Bàn điều khiển yêu cầu **đặt ấn phản nghịch lên đúng một linh thú** (kẻ phản bội thật).

- `censor_blacklist_doc`: 4 mật danh, kèm câu đánh lạc hướng: "Huyết Ưng nắm ấn cấm quân".
- `court_timeline_doc`: Huyết Ưng trấn biên bắc **tháng Giêng → tháng Sáu**; Dạ Lang (Sói) về kinh **tháng Hai**, ở lại tới tháng Năm; Bạch Lộc (Hươu) đi sứ phương nam tháng Chạp năm 311 → tháng Tám; Xích Xà (Rắn) dưỡng bệnh ở quê **từ tháng Hai**.
- Đáp án: **Sói**. Chọn sai → `ch3_censorship_wrong` (đèn đỏ, gợi ý đối chiếu tháng).
- Neris có thể tóm tắt dữ kiện (`ch3_neris_archive_talk`) nhưng **không nói đáp án**.

**C5 · Nỗi Oan Vua Alden.** Cần **cả** dải ruy băng (`queen_ribbon_item`) **và** đã đọc nhật trình điều binh (`read_royal_dispatch`). Thiếu một → `ch3_king_doubt` (vua dao động nhưng chưa tin). Đủ → `ch3_king_confront` → chọn soi chiếc ly bằng Nhãn Thời Gian → `ch3_king_cleared`.

**Bùa ẩn · Sắc Màu Nguyên Bản.** Ba sắc tố `pigment_ochre_yellow` (Nghĩa Địa), `pigment_lapis_blue` (Thư Viện), `pigment_sulfur_red` (Hoàng Lăng). Ghi chú họa sĩ `court_painter_note` cho thứ tự lớp: **vàng đất (nền) → lam (áo) → đỏ (môi son)**. Thiếu sắc tố → `ch3_canvas_inspect`. Đủ cả ba → chuỗi chọn lớp `ch3_canvas_layer_1/2/3`. Sai thứ tự → `ch3_canvas_wrong` (sắc tố không mất). Đúng → `ch3_canvas_restored`.

**Vũ khí ẩn · Hộp Nhạc Không Tên.** Mật thất mở bằng `forgotten_vault_key` (thưởng quest phụ kỵ sĩ). Hộp cần gõ nhịp bài ru: **ngắn – ngắn – dài – ngắn – dài**. Nhịp nằm trong `lost_lullaby_lyrics` (thưởng quest phụ nữ thủ thư); lời ru đánh dấu tiếng vỗ nhẹ (ngắn) và tiếng ru ngân (dài). Chuỗi `ch3_box_beat_1..5`, mỗi nút [Ngắn] [Dài]. Sai → `ch3_box_wrong` (về đầu).

### 12.2. Quái, boss, cấp độ

- Bóng Ma Ký Ức: khựng **0,4 giây** sau khi dịch chuyển ra sau lưng Peter rồi mới đâm.
- Thủ Thư Rỗng: phân thân 1 HP, không gây sát thương. **Đòn Thời Gian (chuột phải) xóa phân thân** (trên bản đồ không có nút "Nhãn Thời Gian").
- Kẻ Gặm Ý Nghĩ: vũng lầy làm chậm 40% và rút 2 MP/giây.
- Boss giữa và boss cuối như §6. Chỉ số do Claude chỉnh lại khi thử trận. Trần cấp Chương 3 là 15.
- **Hình:** vẽ mới **cả 7** (gồm Thủ Thư Rỗng). Boss giữa 48×48, boss cuối 64×64.

### 12.3. Vật phẩm (thay §11.1 ở các dòng trùng)

- Không dùng `ancient_gear`, `tide_dried_fish` → thay bằng `imperial_honey_bread`, `sunset_dried_fish`.
- Mới: `refined_chrono_shard` (consumable, hồi 120 HP), `lost_lullaby_lyrics` (document), `court_painter_note` (document), `miner_hymn_scrap` (document), `miner_geological_chart` (document), `acoustic_manual_page` (document), `pigment_ochre_yellow` / `pigment_lapis_blue` / `pigment_sulfur_red` (puzzle), `forgotten_vault_key` (puzzle), `memory_ember` (puzzle, quest lò rèn).

### 12.4. Node bổ sung / đổi tên (thay §11.3 ở các dòng trùng)

- Map 2: `ch3_regions_stele_read`; mộ `ch3_tomb_owl_inspect`, `ch3_tomb_willow_ii_inspect`, `ch3_tomb_willow_inspect` (đúng, lựa chọn → `ch3_tomb_willow_open`), `ch3_tomb_almond_inspect`, `ch3_tomb_turtle_inspect`, `ch3_tomb_wrong_fog`; cổng `ch3_hall_gate_locked` / `ch3_hall_gate_opens` (cần đục; `takeItems` đục, `setFlags: ["opened_hall_gate"]`); sắc tố `ch3_pigment_yellow_take`.
- Map 3: `ch3_acoustic_manual_read` (cấp `acoustic_manual_page`).
- Map 4: `ch3_hymn_scrap_read`, `ch3_geological_chart_read`; chuông `ch3_echo_bell_copper` (`startTimer`: `{ "flag": "ch3_bridge_up", "ms": 8000 }`), `ch3_echo_bell_iron`, `ch3_echo_bell_silver`; `ch3_abyss_fall`; `ch3_lullaby_crystal_listen` (`heard_lost_lullaby`); `ch3_ember_take` (`memory_ember`); `ch3_forge_cold` / `ch3_forge_rekindled` (`rekindled_memory_forge`).
- Map 5: `ch3_console_choose_a/b/c`, `ch3_censorship_wrong`, `ch3_censorship_success`; `ch3_pigment_blue_take`; mảnh chân dung `ch3_portrait_piece_1/2/3` (mỗi mảnh đặt cờ `ch3_portrait_piece_n`; đặt ở Map 2, 4, 5).
- Map 6: `ch3_king_doubt`, `ch3_king_confront`; `ch3_painter_note_read`; `ch3_pigment_red_take`; `ch3_canvas_layer_1/2/3`, `ch3_canvas_wrong`.
- Map 8: `ch3_box_beat_1..5`, `ch3_box_wrong`.
- Quest phụ: `ch3_ghost_librarian_done` cấp `lost_lullaby_lyrics`; `ch3_ghost_knight_done` cấp `forgotten_vault_key` và đặt `found_forgotten_vault_key`.

### 12.5. Engine mới (Claude)

`strikeTargets` (C2) · hiệu ứng thoại `startTimer` (cờ tự tắt sau ms, C3) · luật thoại `ifItems` / `ifFlags` (mảng, tất cả phải đúng) · vùng rơi vực quay về mép · vũng lầy · quái dịch chuyển, phân thân · boss khóa lệnh + sao chép trang bị · boss hợp xướng chọn lõi theo bài hát · nối Chương 2 → Chương 3.
