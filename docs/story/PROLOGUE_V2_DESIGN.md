# THIẾT KẾ CHI TIẾT PROLOGUE V2: "THE LAST MEMORY" (KÝ ỨC CUỐI CÙNG)

**Mã tài liệu:** `docs/story/PROLOGUE_V2_DESIGN.md`  
**Trạng thái:** `[PROPOSAL]` – Chờ duyệt từ Project Owner  
**Tham chiếu Canon:** `STORY_PROLOGUE.md`, `CANON_AND_OPEN_QUESTIONS.md`, `CHARACTER_BIBLE.md` (§Peter), `CHANGELOG.md` [1.1.0]

---

## 1. Luồng Trải Nghiệm (Narrative & Gameplay Flow)

- **Thời lượng mục tiêu:** 25 – 35 phút chơi.
- **Tiêu chuẩn Canon:** Toàn bộ văn bản hiển thị trong game là Tiếng Việt; mã định danh nội bộ dùng `snake_case` tiếng Anh. Không giải thích lý do Peter là Unwritten (`OQ-01`). Kuro tuyệt đối không xuất hiện trực tiếp (chỉ gợi ý gián tiếp). Hiện tượng Xóa bỏ Khái niệm (Conceptual Erasure) diễn ra từ từ; dị thường không nhất thiết là ác quỷ.

```text
[Phòng của Peter] -> [Thị trấn Ven Biển] -> [Rừng Quên Lãng] -> [Shattered Antechamber] -> [Hải Đăng Cổ / Sentinel] -> [Bản Ghi UNWRITTEN]
     (Thức giấc)      (Nghịch lý ký ức)   (Vết nứt không gian)      (Altar of Moments)         (Giải đố Boss cơ chế)        (Qua Cổng Ngưỡng)
```

1. **Phòng của Peter (3–5 min):** Tiếng sóng biển rì rào; câu dẫn mở màn vang lên. Peter thức dậy, tương tác các vật phẩm định danh (Đồng hồ ngừng chạy, Sổ tay rách trang, Khung ảnh mờ bóng bạn cũ [PROPOSAL: ẩn ý Kuro]), tìm chìa khóa mở cửa.
2. **Thị trấn Ven Biển – Khánh Hòa (7–10 min):** Không khí làng chài miền Trung nắng gió nhưng vương vướng sự xói mòn ký ức. Gặp người bán bánh căn nấu 2 phần cho 1 người, mảnh đất trống bị phủ nhận sự tồn tại, ngư dân cảnh báo về vách đá mờ sương.
3. **Rừng Quên Lãng (5–7 min):** Vùng đệm méo mó không-thời gian. Peter dùng cảm thức thời gian né tránh mê cung sương mù tro bụi, hạ gục Dị thể Bóng Đen đầu tiên, rơi vào lối ngầm cổ.
4. **Shattered Antechamber (5–7 min):** [TÁI SỬ DỤNG LÁT CẮT HIỆN TẠI] Đền thờ đổ nát Altar of Moments. Gặp Elder Chronographer, làm quen hệ thống 6 Quyền năng qua 7 POI môi trường, nhận ấn tín tiến lên đỉnh tháp.
5. **Hải Đăng Cổ & The Drowned Sentinel (5–6 min):** Trận chiến Boss giải đố cơ chế: chiếu sáng thấu kính ngọn hải đăng để hóa giải lớp giáp sóng thời gian, thanh tẩy Vệ Binh Chìm Trong Sóng.
6. **Bản Ghi UNWRITTEN & Kết Chương (2 min):** Tiếp nhận ghi chép cổ tại bia đá, khẳng định bản chất Unwritten, bước qua Cổng Ngưỡng sang Chapter 1.

---

## 2. Thiết Kế Bản Đồ (Maps Specification)

Mỗi map sử dụng ô tile 32×32 px, kích thước tối đa ≤ 30×20 tiles để đảm bảo hiệu năng và tốc độ dựng art vẽ tay.

### Map 1: `map_peters_room` (Căn Gác Của Peter)

- **Kích thước:** 14×10 tiles.
- **Đặc trưng:** Căn gác mái bằng gỗ mộc hướng biển Khánh Hòa; bàn làm việc ngổn ngang giấy vẽ phương trình, giường đơn, giá sách cổ.
- **Spawn Points:** `spawn_bed` (x: 3, y: 4).
- **Exits:** Cửa ra vào (x: 7, y: 9) -> dẫn tới `map_coastal_town` (tại `spawn_from_house`).
- **Interactables:**
  - `prop_bed_awakening`: Giường ngủ nơi bắt đầu hành trình.
  - `prop_desk_notebook`: Sổ tay rách trang (`torn_notebook`).
  - `prop_photo_frame`: Khung ảnh ố vàng có bóng người nhòe mờ bên cạnh Peter [PROPOSAL: Kuro].
  - `prop_stopped_watch`: Đồng hồ ngừng chạy trên dây bạc (`relic_chronometer`).
  - `prop_room_key`: Chìa khóa đồng thau (`brass_key`) trên kệ gỗ.
- **Enter-trigger:** `trig_awaken_sequence` (Màn hình tối mờ dần, phát câu thoại mở đầu).

### Map 2: `map_coastal_town` (Thị Trấn Ven Biển Khánh Hòa)

- **Kích thước:** 28×18 tiles.
- **Đặc trưng:** Đường bờ biển cát vàng, rặng dừa, nhà ngói vách vôi, bến thuyền neo đậu, một khoảng đất hoang phát ánh lam nhạt.
- **Spawn Points:** `spawn_from_house` (x: 5, y: 5), `spawn_from_forest` (x: 26, y: 2).
- **Exits:**
  - Cửa vào nhà Peter (x: 5, y: 4) -> `map_peters_room`.
  - Đường mòn phía Đông Bắc (x: 27, y: 2) -> `map_forgotten_forest` (tại `spawn_from_town`).
- **Interactables:**
  - `npc_vendor_ba_ba`: Quán ăn nhỏ ven đường, bán Bánh Căn nóng hổi (`x: 11, y: 8`).
  - `npc_fisherman_sau`: Lão ngư ngồi vá lưới bên mạn thuyền gỗ (`x: 16, y: 14`).
  - `poi_empty_lot`: Nền gạch cũ của một căn nhà bị xóa sạch khỏi ký ức người dân (`x: 21, y: 9`).
  - `poi_ancient_well`: Giếng làng cổ có mặt nước đóng băng phản chiếu bầu trời sao (`x: 8, y: 13`).
- **Enter-trigger:** `trig_town_murmurs` (Hiệu ứng hạt gió biển và lời thì thầm lạc điệu).

### Map 3: `map_forgotten_forest` (Rừng Quên Lãng)

- **Kích thước:** 26×18 tiles.
- **Đặc trưng:** Cây rừng ngập mặn cổ thụ u ám, rễ cây đan vòm, các vết rạn nứt phát quang màu tím tro, sương mù lơ lửng.
- **Spawn Points:** `spawn_from_town` (x: 2, y: 16), `spawn_from_antechamber` (x: 23, y: 3).
- **Exits:**
  - Đường mòn về thị trấn (x: 1, y: 16) -> `map_coastal_town`.
  - Cửa hầm đá dẫn xuống đền cổ (x: 24, y: 3) -> `map_shattered_antechamber`.
- **Interactables:**
  - `poi_forest_monolith`: Trụ đá chỉ đường bị bào mòn bởi bão thời gian (`x: 12, y: 10`).
  - `poi_chrono_crevice`: Khe nứt địa tầng chứa Mảnh Chrono Nhỏ (`chrono_shard_minor`, `x: 7, y: 6`).
  - `enemy_stray_shade`: Dị thể bóng đen lang thang chặn lối mòn hẹp (`x: 17, y: 7`).
- **Enter-trigger:** `trig_forest_stasis` (Âm thanh môi trường chậm dần, gió ngừng thổi).

### Map 4: `map_shattered_antechamber` (Sảnh Điện Thờ Đổ Nát)

- **Kích thước:** 24×18 tiles [TÁI SỬ DỤNG NGUYÊN VẸN MAP HIỆN TẠI].
- **Đặc trưng:** Cột đá gãy, sàn đá hoa văn đồng hồ, Altar of Moments rực sáng, vết nứt không gian trung tâm.
- **Spawn Points:** `spawn_entry` (x: 12, y: 16), `spawn_from_lighthouse` (x: 12, y: 2).
- **Exits:**
  - Lối xuống bậc thang (x: 12, y: 17) -> `map_forgotten_forest`.
  - Cổng vòm cổ dẫn lên ngọn đồi (x: 12, y: 1) -> `map_old_lighthouse`.
- **Interactables:** 7 POI và NPC sẵn có (`npc_elder`, `altar_moments`, `stele_six_authorities`, `defaced_pillar`, `torn_journal_leaf`, `frozen_astrolabe`, `cracked_reliquary`, `threshold_gates`, `residual_rift_echo`).
- **Enter-trigger:** `trig_elder_greeting` (Elder hướng ánh mắt về Peter khi bước vào).

### Map 5: `map_old_lighthouse` (Mỏm Đá Hải Đăng Cổ)

- **Kích thước:** 24×18 tiles.
- **Đặc trưng:** Mỏm đá bazan vươn ra biển gầm thét; ngọn hải đăng bằng đá đen cổ kính; đài thấu kính cơ khí hai bên; bia đá UNWRITTEN.
- **Spawn Points:** `spawn_base` (x: 12, y: 16).
- **Exits:**
  - Đường dốc trở lại sảnh điện (x: 12, y: 17) -> `map_shattered_antechamber`.
  - Cổng Ngưỡng ánh sáng phía sau hải đăng (x: 12, y: 2) -> Kết thúc Prologue.
- **Interactables:**
  - `boss_drowned_sentinel`: Thực thể Vệ Binh Chìm Trong Sóng chặn cửa tháp (`x: 12, y: 9`).
  - `mech_lens_left`: Thấu kính hội tụ ánh sáng bên trái (`x: 5, y: 8`).
  - `mech_lens_right`: Thấu kính hội tụ ánh sáng bên phải (`x: 19, y: 8`).
  - `poi_unwritten_tablet`: Bia đá cổ khắc ký tự thực tại (`x: 12, y: 4`).
- **Enter-trigger:** `trig_boss_awakening` (Sóng biển đóng băng trên không, Sentinel bước ra từ bọt sóng thời gian).

---

## 3. Danh Sách Nhân Vật (NPCs)

1. **Peter (Nhân vật chính):**
   - _Tạo hình:_ Nam giới trưởng thành (~26 tuổi), dáng người thực tế; tóc xoăn tít bồng bềnh tự nhiên thành khối tròn gọn gàng bao phủ cả đầu (Curly Hair Lock); áo khoác xanh than vạt xéo, đai da chéo vai, mắt xám xanh tĩnh lặng.
2. **Cô Ba Bánh Căn (`npc_vendor_ba_ba`):**
   - _Mô tả cho họa sĩ:_ Phụ nữ Nam Trung Bộ ~45 tuổi, áo bà ba nâu nhạt, quàng khăn rằn, nét mặt hiền hậu đượm chút âu lo, tay cầm muôi đổ bột bánh căn trên lò than đất nung.
   - _Bản đồ:_ `map_coastal_town`.
3. **Ông Sáu Ngư Phủ (`npc_fisherman_sau`):**
   - _Mô tả cho họa sĩ:_ Lão ngư ~60 tuổi, râu hoa râm, nước da rám nắng, ngồi xếp bằng trên tấm phản gỗ bên mớ lưới kéo cá màu xanh rêu.
   - _Bản đồ:_ `map_coastal_town`.
4. **Elder Chronographer (`npc_elder`):** [Tái sử dụng asset `npc_elder`]
   - _Mô tả cho họa sĩ:_ Trưởng lão canh giữ thánh điện, áo choàng lam thêu chỉ bạc, tay cầm quyền trượng quả lắc đồng hồ.
   - _Bản đồ:_ `map_shattered_antechamber`.
5. **The Drowned Sentinel (`boss_drowned_sentinel`):**
   - _Mô tả cho họa sĩ:_ Vệ binh khổng lồ cao gấp rưỡi người thường, giáp đồng cổ gỉ xanh bám đầy hà biển và rong rêu, cầm kích gãy; quanh thân là màng nước sóng sánh đóng băng lấp lánh như kính vỡ.
   - _Bản đồ:_ `map_old_lighthouse`.

---

## 4. Chuỗi Nhiệm Vụ & Cờ Cốt Truyện (Quests & Flags)

### Bảng Nhiệm Vụ

| Quest ID                     | Tên Nhiệm Vụ                | Mục Tiêu Chính                                                        | Phần Thưởng                                             | Follow-up Quest              |
| :--------------------------- | :-------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------ | :--------------------------- |
| `quest_prologue_awaken`      | Ký Ức Trong Căn Gác         | Nhặt Sổ tay, Đồng hồ, tìm Chìa khóa đồng và mở cửa phòng              | `relic_chronometer`, +10 EXP                            | `quest_prologue_town`        |
| `quest_prologue_town`        | Lời Thì Thầm Của Biển       | Nói chuyện với Cô Ba, khảo sát Mảnh Đất Trống, nghe Ông Sáu chỉ đường | Bánh Căn Ấm Nóng (hồi 35 HP), +20 EXP                   | `quest_prologue_forest`      |
| `quest_prologue_forest`      | Lối Mòn Tro Bụi             | Vượt qua mê cung sương mù, trấn áp Dị thể Bóng Đen, tìm thấy cửa đền  | `chrono_shard_minor`, +25 EXP                           | `quest_prologue_antechamber` |
| `quest_prologue_antechamber` | Điện Thờ Rạn Nứt            | Tiếp kiến Elder, kết nối Altar of Moments, làm quen 7 POI cổ          | `ancient_gear`, Mở khóa skill `temporal_sight`, +40 EXP | `quest_prologue_sentinel`    |
| `quest_prologue_sentinel`    | Người Gác Biển Bị Lãng Quên | Kích hoạt 2 đòn bẩy thấu kính hải đăng, hóa giải The Drowned Sentinel | `sentinel_core_relic`, +60 EXP (Level Up 3)             | `quest_prologue_unwritten`   |
| `quest_prologue_unwritten`   | Kẻ Không Được Ghi Tên       | Đọc Bia Đá Cổ, thấu hiểu vị thế UNWRITTEN, tiến vào Cổng Ngưỡng       | Chuyển cảnh Prologue End Scene                          | Handoff Chapter 1            |

### Danh Sách Cờ Cốt Truyện (`storyFlags` - snake_case)

- `inspected_room_items`: Đã kiểm tra khung ảnh và sổ tay trong phòng.
- `has_room_key`: Đã nhặt chìa khóa đồng thau.
- `talked_vendor_ba`: Đã trò chuyện về phần ăn thứ hai với Cô Ba.
- `inspected_empty_lot`: Đã nhận biết dấu vết tồn tại sót lại (Residual Existence) ở bãi đất hoang.
- `talked_fisherman_sau`: Đã nghe cảnh báo về ngọn hải đăng.
- `defeated_forest_shade`: Đã hạ dị thể chắn đường trong rừng.
- `attuned_altar`: Đã tương tác Bàn thờ Altar of Moments.
- `elder_granted_beacon`: Elder trao quyền năng mở ngọn hải đăng cổ.
- `lens_left_aligned`: Thấu kính trái đã được căn chỉnh đón sáng.
- `lens_right_aligned`: Thấu kính phải đã được căn chỉnh đón sáng.
- `sentinel_pacified`: Vệ binh đã được thanh tẩy và giải thoát.
- `read_unwritten_tablet`: Đã đọc dòng chữ phân loại UNWRITTEN.

---

## 5. Thiết Kế Giao Tranh & Boss Cơ Chế (Encounters)

### Quái Thường: Temporal Shade (`enemy_fracture`) – Tái Sử Dụng

- Xuất hiện tại `map_forgotten_forest` và `map_shattered_antechamber`.
- Chỉ số: HP 36, ATK 6, DEF 2, AGI 4.
- Đòn đánh: _Chém Thời Gian_ (Temporal Strike, 8 sát thương) và _Chập Chờn_ (Flicker, né tránh tăng 30% trong 1 lượt).

### Boss Cơ Chế: The Drowned Sentinel (`boss_drowned_sentinel`) [PROPOSAL]

- **Triết lý thiết kế:** Trận đánh không thể kết thúc đơn thuần bằng việc đánh cạn 120 HP. Khi HP chạm 1, boss kích hoạt _Đóng Băng Thời Gian_ và hồi phục nếu cơ chế môi trường chưa giải xong.
- **Trạng thái & Lớp Giáp:**
  - _Chrono Wave Aegis:_ Giảm 80% mọi sát thương vật lý và kỹ năng trực tiếp.
  - Sát thương boss gây ra: Đòn _Sóng Vỗ Trầm Tích_ (10 sát thương) và _Triều Đọng_ (làm chậm tốc độ lượt của Peter).

```text
[Phase 1: Chống Cự & Phát Hiện] -> [Phase 2: Xoay Thấu Kính Hải Đăng] -> [Phase 3: Thanh Tẩy & Tiếp Nhận]
   (Giáp sóng giảm 80% dame)            (Thao tác lệnh môi trường)            (Sentinel quỳ gối tan biến)
```

- **Tiến trình theo lượt / Trạng thái:**
  - **Lượt 1–3 (Quan sát):** Peter dùng kỹ năng _Nhãn Thời Gian_ (`temporal_sight`) phát hiện Sentinel nhận năng lượng từ luồng sóng đọng; ngọn đèn hải đăng trên cao có thể bẻ gãy luồng năng lượng này nếu hai thấu kính hội tụ hướng vào nhau.
  - **Lượt 4–6 (Kích hoạt Thấu Kính):** Trong menu lệnh chiến đấu xuất hiện hành động môi trường:
    - Lựa chọn: `[XOAY THẤU KÍNH TRÁI]` -> Ánh sáng chói lòa làm rạn nứt lớp giáp nước, Sentinel bị Choáng (Stun) 1 lượt.
    - Lựa chọn: `[XOAY THẤU KÍNH PHẢI]` -> Luồng sáng vàng ấm áp xuyên thẳng qua lồng ngực boss, giải phóng hoàn toàn lớp sóng giam hãm.
  - **Lượt 7+ (Thanh tẩy):** Peter tung một đòn đánh cuối cùng. Sentinel không gầm rú hung hãn mà cúi đầu tạ ơn, thân xác hóa thành hàng ngàn hạt sáng cerulean tan vào biển cả, để lại Lõi Di Vật Cổ (`sentinel_core_relic`).

---

## 6. Kịch Bản Thoại Nháp (Draft Dialogue – Tiếng Việt)

Mỗi nút hội thoại tuân thủ nghiêm ngặt tối đa ≤ 2 lựa chọn để vừa vặn khung NineSlice UI.

### 6.1. Lời Dẫn Mở Đầu & Trong Phòng Peter

- **Dẫn chuyện (Đen màn hình):**
  - Text: _"Thức dậy đi... Thế giới không có tên cho ngươi, nhưng ngươi vẫn tồn tại."_
- **Peter (Tự sự bên khung ảnh):**
  - Text: _"Bức ảnh này... Bên cạnh mình rõ ràng có một người nữa. Tại sao khuôn mặt ấy lại nhòe mờ như bị cạo sạch thế này?"_
  - Lựa chọn 1: [Chạm vào vết cạo] -> Text: _"Một cảm giác buốt lạnh... như thể thời gian đã bỏ quên họ."_
  - Lựa chọn 2: [Cất vào túi áo] -> Text: _"Dù là ai, mình cũng không được phép quên."_

### 6.2. Thị Trấn Ven Biển (Khánh Hòa)

- **Cô Ba Bánh Căn (`npc_vendor_ba_ba`):**
  - Node 1: _"Cậu Peter dậy sớm thế? Ngồi xuống đi, tôi đổ sẵn hai đĩa bánh căn mỡ hành còn nóng hổi đây."_
  - Lựa chọn 1: [Cháu đi một mình mà?] -> Node 2A
  - Lựa chọn 2: [Cô chờ ai khác sao?] -> Node 2B
  - Node 2A: _"Ủa... lạ chưa kìa. Tôi cứ đinh ninh có một đứa nữa hay đi cùng cậu... Đứa nhỏ tóc đen, mắt sáng... ủa, mà nó tên gì ta?"_
  - Node 2B: _"Tôi cũng chẳng nhớ nữa. Tay cứ quen đong đủ hai phần bột. Cứ như thể... vừa có ai đó biến mất khỏi đầu tôi vậy."_
- **Khoảng Đất Hoang (`poi_empty_lot`):**
  - Text: _"Mảnh đất trống đầy cỏ dại. Nhưng dưới chân vẫn còn vết tro bếp và dấu móng nhà gạch đỏ. Mọi người đều nói nơi này chưa từng có ai ở."_
  - Lựa chọn 1: [Dùng Nhãn Thời Gian] -> Text: _"Một bóng nhà mờ ảo hiện lên trong tích tắc rồi tan biến. Ký ức của thị trấn đang bị gặm nhấm."_
  - Lựa chọn 2: [Rời đi] -> Kết thúc.

### 6.3. Điện Thờ Đổ Nát (Elder Chronographer thích ứng)

- **Elder Chronographer (`npc_elder`):**
  - Node 1: _"Ngươi đã tới, kẻ mang dòng dõi không tên. Sóng thời gian ngoài kia đang xô lệch trật tự của sáu Đấng Quyền Năng."_
  - Lựa chọn 1: [Tôi là ai?] -> Node 2A
  - Lựa chọn 2: [Thị trấn đang bị gì?] -> Node 2B
  - Node 2A: _"Ngay cả bia đá Thần thánh cũng không ghi chép bản mệnh của ngươi. Ngươi là sự bất khả thi còn sót lại."_
  - Node 2B: _"Sự Xóa Bỏ Khái Niệm. Khi một nhánh thực tại rạn nứt, những gì gắn liền với nó sẽ tan biến như bọt sóng."_
  - Node 3 (Tiễn biệt): _"Hãy tới Ngọn Hải Đăng Cổ. Thắp sáng ngọn đèn và đối diện với kẻ canh gác bị lãng quên."_

### 6.4. Đỉnh Hải Đăng & Bản Ghi UNWRITTEN

- **The Drowned Sentinel (Trước khi tan biến):**
  - Text: _"...Ánh sáng... Đã bao nhiêu kỷ nguyên ta chìm trong vùng vịnh không đáy này?... Hãy đi đi, hỡi kẻ chưa từng bị viết tên..."_
- **Bia Đá Cổ (`poi_unwritten_tablet`):**
  - Dòng chữ cổ sáng rực màu cerulean:
  - Text: _"ĐỐI TƯỢNG: UNWRITTEN (KẺ KHÔNG ĐƯỢC GHI TÊN) | NHẬN DIỆN: KHÔNG HOÀN CHỈNH | PHÂN LOẠI: BẤT KHẢ THI."_
  - Lựa chọn 1: [Chạm vào Cổng Ngưỡng] -> Chuyển cảnh `PrologueEndScene`.
  - Lựa chọn 2: [Ngoảnh nhìn lại biển cả] -> Text: _"Biển Khánh Hòa lùi dần vào màn sương. Hành trình tìm lại những gì đã mất bắt đầu."_

---

## 7. Danh Mục Tài Nguyên Đồ Họa Cần Thiết (Asset List Table)

Tối đa hóa việc tái sử dụng tài nguyên hiện hữu để tiết kiệm công sức vẽ tay (Pipeline B).

| Asset Key                 | Loại Tài Nguyên      | Kích Thước / Quy Cách  | Mức Độ Ưu Tiên                 | Ghi Chú & Tái Sử Dụng                                       |
| :------------------------ | :------------------- | :--------------------- | :----------------------------- | :---------------------------------------------------------- |
| `tileset_dungeon`         | Tileset              | 32×32 tiles (extruded) | **Đã có**                      | Tái sử dụng trọn vẹn cho `map_shattered_antechamber`.       |
| `tileset_coastal_town`    | Tileset              | 32×32 tiles (extruded) | **Bắt buộc (Must)** [PROPOSAL] | Nhà cửa làng chài, cát biển, bến thuyền miền Trung.         |
| `tileset_lighthouse_rock` | Tileset              | 32×32 tiles (extruded) | **Bắt buộc (Must)** [PROPOSAL] | Mỏm đá đen, vách đá bazan, cầu thang đá ngọn hải đăng.      |
| `char_peter_sheets`       | Sprite / Sheets      | 32×48 px / 4 hướng     | **Đã có**                      | Đã duyệt: `CHAR_PETER_001` (di chuyển) & `003` (chiến đấu). |
| `npc_elder`               | Sprite NPC           | 32×48 px / tĩnh        | **Đã có**                      | Tái sử dụng nguyên vẹn sprite Elder trong Antechamber.      |
| `npc_coastal_vendor`      | Sprite NPC           | 32×48 px / 2 frames    | **Bắt buộc (Must)** [PROPOSAL] | Cô Ba bán bánh căn quàng khăn rằn (Pipeline B vẽ tay).      |
| `npc_coastal_fisherman`   | Sprite NPC           | 32×48 px / 2 frames    | **Nên có (Nice)** [PROPOSAL]   | Ông Sáu ngư dân ngồi vá lưới.                               |
| `mob_temporal_shade`      | Enemy Combat         | 48×48 px / 4 frames    | **Đã có**                      | Tái sử dụng `enemy_fracture` / `MOB_SHADE_001`.             |
| `boss_drowned_sentinel`   | Boss Combat          | 64×64 px / 4 frames    | **Bắt buộc (Must)** [PROPOSAL] | Giáp đồng cổ bám rêu biển và hào quang sóng nước.           |
| `prop_interactables_v3`   | Props Atlas          | Đa kích thước 32–64 px | **Đã có**                      | Bàn thờ, bia đá, đồng hồ hỗn thiên nghi, hòm di vật.        |
| `prop_coastal_props`      | Props Atlas          | 32×32 / 32×64 px       | **Nên có (Nice)** [PROPOSAL]   | Thúng chai, đòn bẩy thấu kính, lò bánh căn.                 |
| `ui_set_001`              | UI NineSlice / Frame | 48×48 px (16px corner) | **Đã có**                      | Tái sử dụng khung thoại, hộp nhiệm vụ, menu chiến đấu.      |

---

## 8. Các Câu Hỏi Mở Cần Project Owner Phê Duyệt (Open Questions)

1. **[OQ-PROLOGUE-01] Mức độ xuất hiện của manh mối Kuro:** Khung ảnh trong phòng Peter có nên cho phép Peter lờ mờ nhớ ra một cái tên bắt đầu bằng chữ "K..." hay chỉ dừng lại ở cảm giác "một người bạn thiếu niên vô cùng quan trọng" để giữ trọn vẹn sự xuất hiện ở Chapter 4?
2. **[OQ-PROLOGUE-02] Tương tác xoay thấu kính trong Combat:** Cơ chế đòn bẩy xoay thấu kính ngọn hải đăng nên được thực hiện trực tiếp bên trong `CombatScene` qua danh mục lệnh đặc biệt (`CommandPanel`), hay người chơi phải giải đố môi trường trên bản đồ trước khi bước vào chạm trán Sentinel?
3. **[OQ-PROLOGUE-03] Ưu tiên sản xuất Tileset:** Trong 2 tileset mới (`tileset_coastal_town` và `tileset_lighthouse_rock`), Owner có muốn gộp chung thành một tileset bờ biển tổng hợp 32×32 px để tối ưu hóa Texture Atlas không?
4. **[OQ-PROLOGUE-04] Thời điểm gia nhập của đồng hành đầu tiên:** Prologue hoàn toàn là hành trình độc hành của Peter để khắc họa rõ nét sự cô độc của kẻ Unwritten, điều này đã hoàn toàn khớp với ý đồ của Owner chưa?
