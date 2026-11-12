# THIẾT KẾ CHI TIẾT CHAPTER 2: "THE EMPIRE OF FALSE CAUSALITY" (ĐẾ CHẾ NHÂN QUẢ GIẢ)

**Mã tài liệu:** `docs/story/CHAPTER_02_DESIGN.md`  
**Trạng thái:** `[PROPOSAL]` – Chờ Project Owner phê duyệt  
**Quyền năng (Authority):** **Causality** (Nhân Quả / Nguyên nhân & Kết quả)  
**Tham chiếu Canon:** `STORY_CHAPTER_02.md`, `CHARACTER_BIBLE.md`, `CANON_AND_OPEN_QUESTIONS.md`, `PROGRESSION_DESIGN.md`, `CHAPTER_01_DESIGN.md`

> **Ràng buộc kế thừa từ Chapter 1:** Peter (~26 tuổi, thợ sửa đồng hồ từ Khánh Hòa, khóa nhận diện tóc xoăn tự nhiên `Curly Hair Lock`) bước qua Cổng Ngưỡng sau khi khôi phục Lõi Continuum Seal. Trưởng Lão Thời Gian không còn đồng hành cùng Peter (đã chia tay tại đền thờ theo T-50, chỉ xuất hiện thoáng qua một lần duy nhất dưới dạng dư ảnh chỉ đường ở đầu chương). Peter đạt cấp độ khởi điểm khoảng **Lv 7** (tiến tới **Lv 10–11** cuối chương trên trần Lv 30). Trang bị mang theo: _Thanh Kiếm Gãy_ (hoặc _Đoản Kiếm Đồng Thủy Triều_), _Đồng hồ quả quýt của ông nội_, năng lực _Nhãn Thời Gian_ và _Continuum Resonance_. Quy tắc canon: Kuro tuyệt đối không xuất hiện trực tiếp (chỉ xuất hiện ở Chapter 4); Peter là Unwritten (`OQ-01`); Hiện tượng Xóa sổ Khái niệm (Conceptual Erasure) diễn ra từ từ để lại Dấu vết Còn sót (Residual Existence). Mọi cơ chế mới đều gắn thẻ `[PROPOSAL]`.

---

## 1. Tiền Đề & Động Lực Cá Nhân (Premise & Emotional Hook)

Là một người thợ sửa đồng hồ, Peter hiểu rõ hơn ai hết quy luật bất biến của cơ khí: **có nguyên nhân thì mới sinh ra kết quả**. Phải có ngón tay lên cót thì dây thiều mới căng; phải có bánh răng truyền lực thì kim giây mới nhích. Thế nhưng khi đặt chân qua Cổng Ngưỡng vào vùng đất hoang tàn của Đế Chế Cổ Đại, Peter bàng hoàng nhận ra trật tự nhân quả ở đây đã bị vặn xoắn đến mức dị dạng: **kết quả xảy ra trước khi nguyên nhân bắt đầu**.

Người dân bị lính cơ khí xích tay giải đi vì bản án trộm cắp mà họ... chưa từng nghĩ tới; bánh mì trong lò chưa nướng đã hóa tro tàn; và các cánh cổng đá từ chối chìa khóa hiện tại vì nguyên nhân mở khóa chưa được ghi vào "Sổ Bộ Định Mệnh". Tệ hơn cả, vì Peter mang bản chất **Unwritten** (kẻ không có dòng ghi chép gốc), cỗ máy Chấp Pháp của Đế chế lập tức định danh anh là "Nghịch lý nguy hiểm nhất" — một kết quả không có nguyên nhân được cấp phép.

Động lực của Peter hoàn toàn mang tính cá nhân và nghề nghiệp: anh không đến để lật đổ một đế chế đã mục ruỗng, mà muốn tháo gỡ sự cưỡng bức vô lý đang trói buộc những con người bằng xương bằng thịt như Lyra hay vị Thẩm Phán Lưu Đày. Nhìn chiếc đồng hồ của ông nội vẫn âm thầm chạy ngược từng nhịp trong túi áo, Peter muốn biết: liệu số phận của chính anh, và ký ức về người bạn đã biến mất, có phải cũng từng bị ai đó tự tiện viết sẵn hay không?

---

## 2. Luồng Trải Nghiệm & Tái Sử Dụng Tileset (Flow & Locations)

- **Thời lượng mục tiêu:** 45 – 60 phút chơi (5 bản đồ liên hoàn).
- **Quy tắc thiết kế:** Kích thước mỗi bản đồ giữ chuẩn hiệu năng $\le 30 \times 20$ tiles (32×32 px/tile).
- **Ưu tiên tái sử dụng tileset:** Sử dụng tối đa `dungeon_tileset` (sảnh đá, hành lang ngầm, thư viện cổ) và `wilds_tileset` (vùng ngoại ô, đường đá sứt mẻ), bổ sung đạo cụ đặc trưng bằng object layer.

```text
[1. Ngoại Ô Bia Đá] ──(Dư ảnh Trưởng Lão)──▶ [2. Hầm Mộ Kháng Chiến] ──(Cứu Lyra / Mở Khóa Quá Khứ)──▶ [3. Quảng Trường Phán Quyết]
 (wilds_tileset, 6–8m)                        (dungeon_tileset, 12–15m)                                   (dungeon_tileset, 10–12m)
                                                          │                                                           │
                                            Khóa Nhân Quả Đảo Nghịch                                        Cán Cân Chân Lý (Ẩn)
                                                          ▼                                                           ▼
[Mở đường Chapter 3] ◀──(Causality Resonance)── [5. Điện Phán Quyết Tối Cao] ◀──(Xóa Tội Danh)── [4. Đại Thư Viện Nhân Quả]
                                                    (dungeon_tileset, 8–10m)                          (dungeon_tileset, 12–15m)
```

1. **Vùng Ngoại Ô Bia Đá (`map_ch2_imperial_outskirts`, 6–8 phút · `wilds_tileset`):** Điểm đặt chân đầu tiên sau Cổng Ngưỡng; con đường lát đá nứt nẻ dẫn qua các bia đá khắc sắc lệnh nhân quả; dư ảnh mờ của Trưởng Lão xuất hiện ngắn ngủi nhắn nhủ lời khuyên trước khi tan biến hoàn toàn.
2. **Hầm Mộ Kháng Chiến (`map_ch2_sunken_catacombs`, 12–15 phút · `dungeon_tileset`):** Mạng lưới hầm ngầm của đấu trường cổ nơi phe nổi dậy ẩn náu; giải cứu nữ chiến binh Lyra khỏi cuộc phục kích của Búp Bê Cơ Khí; giải câu đố _Khóa Nhân Quả Đảo Nghịch_ để mở đường lên thành phố.
3. **Quảng Trường Phán Quyết (`map_ch2_forum_plaza`, 10–12 phút · `dungeon_tileset`):** Quảng trường La Mã hoang tàn với bức tượng Hoàng Đế Bịt Mắt; chứng kiến những cư dân bị giam lỏng bởi bản án tương lai; gặp Thẩm Phán Lưu Đày (The Exiled Praetor) và nhận gợi ý đột nhập Thư Viện.
4. **Đại Thư Viện Nhân Quả (`map_ch2_causality_archives`, 12–15 phút · `dungeon_tileset`):** Kho lưu trữ các phiến đá ghi chép định mệnh của hàng vạn người; lẩn tránh lính Chấp Pháp tuần tra; giải câu đố _Biên Tập Bản Án_ bằng Bút Khắc Pháp Quan để xóa rào chắn tội danh.
5. **Điện Phán Quyết Tối Cao (`map_ch2_verdict_sanctum`, 8–10 phút · `dungeon_tileset`):** Đại điện hình bán nguyệt nơi đặt Lõi Causality Seal; trận đấu boss theo lượt với **The Imperial Verdict** (Bản Án Đế Chế); tiếp nhận **Causality Resonance**.

---

## 3. Thiết Kế Bản Đồ Chi Tiết (Maps Specification)

### Map 1: `map_ch2_imperial_outskirts` (Vùng Ngoại Ô Bia Đá) — `24×18` tiles · `wilds_tileset`

- **Đặc trưng:** Con đường lát đá La Mã cổ nứt toác, hai bên mọc cỏ khô úa; những cột bia đá khắc sắc lệnh nhân quả phát sáng đỏ nhạt; cổng thành sắt rỉ đóng chặt ở phía đông.
- **Spawns:** `default` / `from_ch1` (`x: 3, y: 9`), `from_catacombs` (`x: 21, y: 9`).
- **Exits:** `outskirts_to_catacombs` (`x: 22, y: 8..10`, `requiresFlag: "entered_catacombs_hatch"`).
- **NPC & POI:**
  - `npc_elder_echo` (`x: 6, y: 9` — dư ảnh Trưởng Lão, chỉ nói đúng 1 lần rồi biến mất vĩnh viễn, đặt cờ `elder_echo_faded`).
  - `poi_edict_stele` (`x: 12, y: 6` — bia đá ghi sắc lệnh: _"Kẻ nào đi qua cổng mà không có giấy phép sinh ra sẽ bị xử trảm tại chỗ"_).
  - `poi_catacombs_hatch` (`x: 18, y: 12` — cửa sập bằng sắt dẫn xuống cống ngầm, then cài bị rỉ sét có thể cạy bằng kiếm gãy).
- **Triggers:** `trig_ch2_entry` (`arrive`, chạy thoại mở đầu Peter nhận định về vùng đất mới).
- **Enemies:** 2 `enemy_temporal_shade` (tuần tra thời gian thực ngoài đồng cỏ).

### Map 2: `map_ch2_sunken_catacombs` (Hầm Mộ Kháng Chiến) — `28×18` tiles · `dungeon_tileset`

- **Đặc trưng:** Hành lang đá ẩm thấp dưới lòng đất; mạng lưới mộ đá cổ và phòng giam nô lệ cũ; nơi Lyra bị bao vây bởi lũ người máy.
- **Spawns:** `default` / `from_outskirts` (`x: 2, y: 9`), `from_plaza` (`x: 26, y: 9`).
- **Exits:** `catacombs_to_outskirts` (`x: 1, y: 9`); `catacombs_to_plaza` (`x: 27, y: 8..10`, `requiresFlag: "unlocked_catacomb_gate"`, `lockedDialogueId: "ch2_gate_ancient_locked"`).
- **NPC & POI:**
  - `npc_lyra` (`x: 14, y: 9` — nữ chiến binh Lyra, ban đầu bị quái dồn vào góc phòng; nói chuyện sau khi Peter dọn sạch quái).
  - `poi_catacomb_gate` (`x: 25, y: 9` — cửa sắt đúc kiên cố, ổ khóa cổ bị rỉ đóng đặc từ hàng trăm năm trước).
  - `poi_ancient_alcove` (`x: 10, y: 4` — Hốc Đá Quá Khứ, nơi đặt vật phẩm tạo nguyên nhân ngược dòng).
  - `poi_praetor_cache_secret` (`x: 6, y: 14` — hốc tường nứt giấu trang bị ẩn vũ khí).
- **Triggers & Combat:** 3 `enemy_imperial_automaton` (tuần tra thời gian thực; 2 con bao vây Lyra hoạt động như quest harassers).

### Map 3: `map_ch2_forum_plaza` (Quảng Trường Phán Quyết) — `30×20` tiles · `dungeon_tileset`

- **Đặc trưng:** Trung tâm đô thị hoang tàn; tượng đá khổng lồ của Hoàng Đế Bịt Mắt cầm gươm gãy; đài máy chém bỏ hoang giữa quảng trường; tàn tích các cửa tiệm bị niêm phong.
- **Spawns:** `default` / `from_catacombs` (`x: 2, y: 10`), `from_archives` (`x: 28, y: 10`).
- **Exits:** `plaza_to_catacombs` (`x: 1, y: 9..11`); `plaza_to_archives` (`x: 29, y: 9..11`, `requiresFlag: "has_praetor_pass"`, `lockedDialogueId: "ch2_archives_gate_locked"`).
- **NPC & POI:**
  - `npc_exiled_praetor` (`x: 16, y: 6` — Thẩm Phán Lưu Đày ngồi giấu mình dưới chân tượng đổ).
  - `npc_citizen_baker` (`x: 8, y: 15` — linh hồn ông lão làm bánh kẹt trong bản án bánh khét).
  - `npc_broken_automaton` (`x: 22, y: 14` — người máy tuần tra hỏng hóc lặp đi lặp lại lệnh bắt giữ).
  - `poi_causality_scales` (`x: 20, y: 5` — Cán Cân Chân Lý, giải đố lấy trang bị ẩn bùa).
  - `poi_execution_platform` (`x: 15, y: 12` — đài máy chém rỉ máu, nơi Lyra từng bị định sẵn ngày chết).
- **Enemies:** 3 `enemy_causality_enforcer` (lính chấp pháp tuần tra khu vực hành lang bên ngoài).

### Map 4: `map_ch2_causality_archives` (Đại Thư Viện Nhân Quả) — `26×18` tiles · `dungeon_tileset`

- **Đặc trưng:** Những giá sách bằng đá cao chạm trần; hàng ngàn phiến đá nhân quả phát sáng màu tím sẫm; lối sang Điện Tối Cao bị chặn bởi Màn Chắn Tội Danh.
- **Spawns:** `default` / `from_plaza` (`x: 2, y: 9`), `from_sanctum` (`x: 24, y: 9`).
- **Exits:** `archives_to_plaza` (`x: 1, y: 9`); `archives_to_sanctum` (`x: 25, y: 8..10`, `requiresFlag: "expunged_peter_verdict"`, `lockedDialogueId: "ch2_barrier_guilt_repel"`).
- **NPC & POI:**
  - `poi_verdict_tablet` (`x: 20, y: 9` — phiến đá phán quyết đang giam giữ án phạt của Peter).
  - `poi_archive_shelf_peter` (`x: 12, y: 4` — ngăn lưu trữ cổ nơi Peter tìm thấy ghi chép về "Kẻ Không Tên").
  - `poi_rebellion_records` (`x: 6, y: 14` — tài liệu mật về danh sách những người dám chống lại định mệnh).
- **Enemies:** 4 `enemy_causality_enforcer` và 2 `enemy_imperial_automaton` (mật độ dày, người chơi cần tận dụng lướt né Shift để luồn lách).

### Map 5: `map_ch2_verdict_sanctum` (Điện Phán Quyết Tối Cao) — `22×16` tiles · `dungeon_tileset`

- **Đặc trưng:** Khán đài xử án hình bán nguyệt La Mã cổ; chính giữa là bệ đá nâng bức tượng thần cơ khí khổng lồ cầm cán cân gãy; năng lượng Causality màu hổ phách đậm tỏa ra từ trần vòm.
- **Spawns:** `default` / `from_archives` (`x: 11, y: 14`), `revive` (`x: 11, y: 13`).
- **Exits:** `sanctum_to_archives` (`x: 11, y: 15`); `sanctum_to_chapter3` (`x: 11, y: 2`, `requiresFlag: "causality_seal_restored"`).
- **Encounter & POI:**
  - `enc_imperial_verdict` (`x: 11, y: 7` — Boss cơ chế theo lượt `boss_imperial_verdict`).
  - `poi_causality_seal` (`x: 11, y: 4` — Lõi Phong Ấn Nhân Quả, tương tác sau khi hạ boss).
- **Triggers:** `trig_verdict_intro` (`zone` tại `x: 9..13, y: 10`, bắt đầu thoại trước trận chiến).

---

## 4. Danh Sách Nhân Vật (NPCs)

1. **Peter** — `[Tái sử dụng CHAR_PETER_002/003/004]` Nam 26 tuổi, thợ sửa đồng hồ từ Khánh Hòa; tóc xoăn ngắn gọn (`Curly Hair Lock`); áo khoác xanh than vạt xéo; tay cầm đoản kiếm, túi áo mang đồng hồ quả quýt.
2. **Lyra (`npc_lyra`)** — `[Sprite MỚI — Must, 32×32]` Nữ chiến binh tiên phong phe kháng chiến (~24 tuổi). Tóc đen cắt ngắn ngang cằm, mặc giáp da nẹp đồng thau sờn vệt chém, ánh mắt kiên định không chịu khuất phục trước bản án tử hình tiền định.
3. **Thẩm Phán Lưu Đày (`npc_exiled_praetor`)** — `[Sprite MỚI — Must, 32×32]` Cựu thẩm phán tối cao (~60 tuổi). Râu tóc bạc phơ xơ xác, mặc áo choàng toga rách mép, dải băng bịt mắt công lý bị kéo lệch lên trán để lộ đôi mắt mệt mỏi nhưng sáng tỏ sự thật.
4. **Dư Ảnh Trưởng Lão (`npc_elder_echo`)** — `[Tái sử dụng NPC_ELDER_001 + tint xanh lam nhạt, alpha 0.6]` Hình bóng mờ ảo của Trưởng Lão Thời Gian xuất hiện đúng 2 câu thoại ở bìa rừng rồi tan biến.
5. **Thợ Bánh Mì Oan Ức (`npc_citizen_baker`)** — `[Tái sử dụng sprite dân làng + tint xám]` Hồn ma một thợ bánh mì già cứ loay hoay trước lò nguội ngắt vì bị bắt trước khi mẻ bánh kịp cháy.
6. **Búp Bê Hỏng Tuần Tra (`npc_broken_automaton`)** — `[Tái sử dụng sprite Automaton + hiệu ứng tia điện giật nhẹ]` Một cỗ máy chấp pháp bị kẹt bánh răng tư duy, đi tìm đứa trẻ nó được lệnh bắt giữ từ 50 năm trước.
7. **The Imperial Verdict (`boss_imperial_verdict`)** — `[Sprite MỚI — Must, 64×64 Boss]` Hiện thân cơ khí - thần thánh của luật Nhân Quả. Bức tượng người khổng lồ bằng đồng thau đen, mắt bịt dải băng vàng ròng, tay trái cầm Cán Cân Nghiêng, tay phải cầm Thanh Gươm Phán Quyết rực lửa.

---

## 5. Cơ Chế Nhân Quả Cho Giải Đố & Khám Phá (Causality Puzzle Mechanics)

> **Nguyên tắc cốt lõi:** Tuyệt đối **KHÔNG LẶP LẠI** cơ chế Chapter 1 (không xoay mỏ neo 3 lớp, không căn góc gương ánh sáng, không gõ 3 chuông theo thứ tự). Mọi câu đố đều dựa trên nguyên lý **Nhân Quả (Causality): Đảo ngược trình tự Nguyên nhân - Kết quả**, biến giải đố thành những câu đố mẹo trí tuệ (riddles) có manh mối cài cắm trong thế giới.

### 5.1. Câu Đố 1: Khóa Nhân Quả Đảo Nghịch (Retroactive Cause Alcove)

- **Vấn đề đặt ra:** Cửa sắt dẫn lên quảng trường (`poi_catacomb_gate`) có ổ khóa đúc liền nguyên khối bị rỉ sét suốt 300 năm. Không có chìa khóa nào của thời hiện tại mở được.
- **Manh mối trong thế giới:** Nhặt được tài liệu đọc được `praetor_diary_page_1` (_Trang Nhật Ký Pháp Quan_):
  > _"Cánh cổng hầm ngầm được niêm phong từ ngày lập quốc. Ổ khóa chỉ nhận chiếc phôi đồng nguyên bản từng nằm trong Hốc Đá Lập Quốc cùng ngày viên đá đầu tiên được đặt xuống."_
- **Quy trình giải:**
  1. Peter tìm thấy một phôi chìa khóa đồng trơn chưa tiện răng (`bronze_key_blank`, vật phẩm `puzzle`).
  2. Nếu thử tra vào cửa ngay: Không mở được, kèm dòng nhắc: _"Khóa rỉ đặc từ 300 năm trước. Chiếc phôi đồng này quá mới, không có vết tích thời gian tương thích."_
  3. Peter đem phôi đồng đặt vào **Hốc Đá Quá Khứ** (`poi_ancient_alcove`) và dùng _Causality Sight_ kích hoạt.
  4. Hiệu ứng nhân quả đảo ngược: Engine ghi nhận phôi đồng được xem như "đã nằm ở đó suốt 300 năm". Khi Peter quay lại cửa, ổ khóa cổ nhận diện vết mòn đồng vị và mở toang (`takeItems: [{ itemId: "bronze_key_blank" }]`, `setFlags: ["placed_retroactive_key", "unlocked_catacomb_gate"]`).

### 5.2. Câu Đố 2: Biên Tập Bản Án Xóa Tội Danh (Expunging the Verdict)

- **Vấn đề đặt ra:** Hành lang vào Điện Tối Cao bị phong tỏa bởi **Màn Chắn Tội Danh** (`poi_verdict_barrier`). Bất cứ ai mang tên trong danh sách tử tội bước vào đều bị điện giật đẩy lùi.
- **Manh mối trong thế giới:** Tài liệu `edict_law_404` (_Sắc Lệnh Nhân Quả 404_):
  > _"Một bản án chỉ có hiệu lực khi ngòi bút của Thẩm Phán còn giữ nguyên mực son. Khi nét mực bị Bút Khắc Tẩy Xóa gọt bỏ, nguyên nhân cấu thành tội sẽ lập tức biến mất khỏi thực tại."_
- **Quy trình giải:**
  1. Peter đến Phiến Đá Bản Án (`poi_verdict_tablet`) thấy tên mình bị ghi sẵn: _"Peter, Kẻ Không Tên — Tội can thiệp dòng thời gian."_
  2. Thử dùng kiếm chém đá: Kiếm nảy lửa vô hiệu, kèm dòng nhắc: _"Bản án khắc bằng luật nhân quả, đòn đánh vật lý không thể làm mờ nét chữ."_
  3. Peter nói chuyện với Thẩm Phán Lưu Đày để nhận **Bút Khắc Pháp Quan** (`praetor_chisel_stylus`, vật phẩm `puzzle`).
  4. Tương tác với phiến đá, chọn dùng Bút Khắc gọt sạch dòng chữ: Màn chắn tội danh lập tức sụp đổ (`takeItems: [{ itemId: "praetor_chisel_stylus" }]`, `setFlags: ["expunged_peter_verdict"]`, `refreshMap: true`).

### 5.3. Câu Đố 3 (Trang Bị Ẩn): Cán Cân Chân Lý Không Trọng Lượng (Weight of Injustice)

- **Vấn đề đặt ra:** Tại Quảng Trường có bức tượng Cán Cân Nhân Quả (`poi_causality_scales`). Đĩa cân bên trái đặt một cuốn sách luật bằng sắt nặng trịch (tượng trưng cho Bản Án). Đĩa cân bên phải trống rỗng.
- **Manh mối trong thế giới:** Bia ký dưới chân tượng:
  > _"Công lý giả tạo nặng như sắt nguội. Nhưng chân lý tự do không có hình hài, chỉ có tờ giấy trắng chưa viết mới có thể kéo cân về mức thăng bằng."_
- **Quy trình giải:**
  1. Nếu người chơi đặt các vật phẩm nặng (như _Ancient Gear_ hay mảnh đá): Cân rung lắc rồi tụt xuống sâu hơn, kèm nhắc nhở: _"Sức nặng vật chất chỉ làm cán cân thêm thiên lệch."_
  2. Người chơi chọn đặt **Tờ Giấy Trắng Trong Suốt** (`blank_unwritten_parchment` lấy từ ngăn kéo bàn của Thẩm Phán): Cán cân lập tức cân bằng hoàn hảo, phát sáng cerulean mở ra ngăn kéo bí mật chứa bùa ẩn `scales_of_truth_charm`.

### 5.4. Phân Tách Tính Năng Engine (Sẵn Có vs Cần Bổ Sung)

- **Engine ĐÃ CÓ dùng lại trực tiếp:**
  - `takeItems`, `grantItems`, `grantOnceFlag`, `setFlags`, `clearFlags`.
  - `dialogueRules` với `ifItem`, `unlessItem`, `ifFlag`, `unlessFlag`.
  - `visibleWhen`, `frozenWhen`, `refreshMap: true`.
  - Hệ thống đọc tài liệu nhiều trang (`type: "document"`, `pages: [...]`) ở Satchel Panel.
- **Engine MỚI cần bổ sung (`[NEW ENGINE FEATURE]`):**
  1. **Tương tác đĩa cân (`scaleBalance` hoặc logic chuỗi `dialogueRules` đa lựa chọn):** Có thể xử lý hoàn toàn qua cây thoại nếu engine hỗ trợ thoại kiểm tra nhiều loại vật phẩm trong túi đồ.
  2. **Vùng đẩy lùi không gây sát thương (`repelZone`):** Trigger `zone` tự động đẩy nhân vật lùi lại 1 ô kèm hiệu ứng rung màn hình nhẹ khi cờ chưa được mở.

---

## 6. Thiết Kế Giao Tranh & Boss Cơ Chế (Combat & Encounters)

### 6.1. Quái Nhỏ Thời Gian Thực Trên Bản Đồ (Action Combat)

Người chơi chiến đấu trực tiếp trên map bằng chuột trái (chém thường), chuột phải (Đòn Thời Gian, 6 MP), phím Shift (lướt né):

| Quái Vật                                                 | Bản Đồ Xuất Hiện       | Cơ Chế / Tập Tính                                                                                                                        | Tái Sử Dụng / Mới      |
| -------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Bóng Đen Thời Gian** (`enemy_temporal_shade`)          | Ngoại Ô, Hầm Mộ        | Tốc độ di chuyển nhanh (~84), áp sát cào cấu, giật lùi né đòn.                                                                           | **Tái sử dụng**        |
| **Búp Bê Cơ Khí** (`enemy_imperial_automaton`)           | Hầm Mộ, Thư Viện       | Đi tuần tra theo trục thẳng. Khi phát hiện Peter: giơ khiên chắn đòn trước mặt, lao húc thẳng (wind-up rõ). Phải né ra sau lưng để chém. | **Mới 1** `[PROPOSAL]` |
| **Lính Chấp Pháp Nhân Quả** (`enemy_causality_enforcer`) | Quảng Trường, Thư Viện | Đâm kiếm liễu nhanh. Có chiêu _Phản Đòn Định Mệnh_: khi thân thể phát sáng đỏ, nếu Peter đánh trúng sẽ bị phản lại 50% sát thương.       | **Mới 2** `[PROPOSAL]` |
| **Kẻ Quấy Nhiễu Nhiệm Vụ** (Quest Harassers)             | Hầm Mộ                 | 2 Búp Bê Cơ Khí bao vây Lyra; liên tục truy đuổi Peter cho đến khi bị tiêu diệt hoàn toàn.                                               | Gắn cờ `duringQuest`   |

### 6.2. Boss Cơ Chế Theo Lượt: The Imperial Verdict (`boss_imperial_verdict`)

- **Đấu trường:** Diễn ra trong giao diện Turn-based Combat chuẩn của game tại Điện Phán Quyết Tối Cao.
- **Chỉ số đề xuất:** HP `320`, ATK `18`, DEF `14`, SPD `10`.
- **Cơ chế cốt truyện — "Bản Án Tiền Định" (Pre-Emptive Sentence):**
  Boss không thể bị tiêu diệt bằng cách xả sát thương thông thường. Đầu mỗi hiệp chẵn, boss giơ Cán Cân tuyên bố một Bản Án tương lai:
  1. _Án Phạt Tấn Công:_ _"Kẻ vung gươm sẽ phải đổ máu!"_ -> Nếu lượt này Peter chọn lệnh `[1] TẤN CÔNG`, Peter sẽ phải chịu phản chấn 100% sát thương gây ra.
  2. _Án Phạt Phòng Thủ / Trì Hoãn:_ _"Kẻ chần chừ sẽ bị nghiền nát!"_ -> Nếu lượt này Peter chọn `[3] ĐỠ` hoặc `[4] VẬT PHẨM`, boss sẽ tung đòn sấm sét đánh trúng điểm yếu.
- **Cách phá giải của Peter (Kết hợp Nhãn Thời Gian & Đòn Nghịch Đảo):**
  - **Lượt 1–2:** Peter dùng **`[2] KỸ NĂNG` (Nhãn Thời Gian)** để soi trước "Loại Bản Án" mà boss sắp tuyên.
  - **Lượt 3–5 (Mở lệnh `[6] ĐẢO NGHỊCH NHÂN QUẢ`):** Khi boss tuyên án, Peter kích hoạt lệnh `[6]` để đảo ngược dòng nguyên nhân:
    - Nếu boss tuyên _Án Phạt Tấn Công_, việc Peter đánh kiếm sẽ biến sát thương phản chấn dội thẳng vào chính cốt lõi của boss, làm vỡ 1/2 đĩa cân!
    - Nếu boss tuyên _Án Phạt Chần Chừ_, Peter giữ nguyên thế thủ khiến đòn sấm sét đánh trượt và làm gãy thanh kiếm phán quyết của boss.
  - **Giai đoạn cuối (Giải thoát):** Cán cân gãy hoàn toàn (`breakShield: true`), boss rơi vào trạng thái quỳ gối buông vũ khí (`releasedFrame`). Peter kích hoạt Lõi Causality Seal, trả lại quyền tự quyết cho vùng đất.

---

## 7. Nhiệm Vụ, Cờ Cốt Truyện & Kịch Bản Thoại Nháp

### 7.1. Chuỗi Nhiệm Vụ (`quests.json`)

| Quest ID                         | Tên Nhiệm Vụ                   | Mục Tiêu Chính (`completeOnFlag`)                                            | Thưởng (~Lv 10–11)                 | Loại  |
| -------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------- | ----- |
| `quest_ch2_outskirts_gate`       | Con Đường Vào Đế Chế           | Nghe lời Trưởng Lão; tìm cửa sập xuống hầm (`entered_catacombs_hatch`)       | `+60 EXP`                          | Chính |
| `quest_ch2_rebellion_contact`    | Lửa Dưới Hầm Ngầm              | Cứu Lyra (`saved_lyra`); mở khóa cổng hầm (`unlocked_catacomb_gate`)         | `+90 EXP`, `chrono_shard_minor`    | Chính |
| `quest_ch2_praetor_plea`         | Lời Cầu Của Thẩm Phán          | Gặp Thẩm Phán (`met_exiled_praetor`); nhận bút khắc (`has_praetor_stylus`)   | `+100 EXP`                         | Chính |
| `quest_ch2_archive_infiltration` | Xóa Tên Khỏi Bản Án            | Đột nhập Thư Viện; gọt phiến đá xóa án (`expunged_peter_verdict`)            | `+120 EXP`, `tide_dried_fish` x2   | Chính |
| `quest_ch2_imperial_verdict`     | Cán Cân Gãy                    | Hạ Bản Án Đế Chế; nhận Causality Resonance (`causality_seal_restored`)       | `+220 EXP`, `causality_seal_shard` | Chính |
| `quest_ch2_innocent_baker`       | Mẻ Bánh Chưa Khét _(Phụ)_      | Thu hồi phôi bột mì chưa hỏng ở quá khứ trao cho ông lão (`comforted_baker`) | `+70 EXP`, `imperial_honey_bread`  | Phụ   |
| `quest_ch2_automaton_duty`       | Mệnh Lệnh Năm Mươi Năm _(Phụ)_ | Cập nhật sổ tử cho cỗ máy tuần tra buông tay (`released_broken_automaton`)   | `+80 EXP`, `chrono_shard_minor`    | Phụ   |

### 7.2. Danh Sách Cờ Cốt Truyện (`snake_case`)

`ch2_arrived_outskirts`, `elder_echo_faded`, `entered_catacombs_hatch`, `saved_lyra`, `placed_retroactive_key`, `unlocked_catacomb_gate`, `met_exiled_praetor`, `has_praetor_pass`, `has_praetor_stylus`, `entered_archives`, `read_peter_unwritten_record`, `expunged_peter_verdict`, `met_imperial_verdict`, `defeated_imperial_verdict`, `causality_seal_restored`, `learned_causality_resonance`, `comforted_baker`, `released_broken_automaton`, `solved_scales_puzzle`.

### 7.3. Kịch Bản Thoại Nháp (Tiếng Việt, $\le 2$ lựa chọn mỗi node, $\le 220$ ký tự/dòng)

- **`ch2_elder_echo_farewell` (Dư Ảnh Trưởng Lão tại Ngoại Ô):**
  - Trưởng Lão: _"Ta chỉ có thể gửi chút dư ảnh cuối cùng tới đây. Vùng đất này bị giam trong xích xiềng Nhân Quả — nơi kẻ nắm quyền tự viết sẵn kết quả cho muôn dân."_
  - Trưởng Lão: _"Hãy nhớ lấy lời thợ đồng hồ, Peter: không có nhịp gõ nào tự nhiên vang lên nếu không có bánh răng đầu tiên chuyển động. Cậu là Kẻ Không Tên... chính điều đó khiến chúng khiếp sợ."_
  - Peter: _"Cháu hiểu rồi. Cháu sẽ tự tìm ra nguyên nhân cho chính mình."_

- **`ch2_lyra_rescued` (Lyra sau khi Peter dọn sạch Búp Bê Cơ Khí):**
  - Lyra: _"Khá đấy chứ, anh bạn tóc xoăn! Kiếm pháp của anh lạ thật... không giống bất kỳ thế võ nào trong sổ bộ quân đội đế chế."_
  - Lựa chọn 1: `[Cô là ai? Sao lại bị chúng bao vây?]` -> _"Tôi là Lyra. Bản án khắc trên bia đá bảo tôi sẽ chết vào đúng ngọ hôm nay... nhưng tôi đếch thèm chết đúng giờ!"_
  - Lựa chọn 2: `[Cánh cửa phía trước dẫn đi đâu?]` -> _"Lên quảng trường. Nhưng ổ khóa rỉ đặc từ ba trăm năm trước rồi, chìa thường không đút vừa đâu."_

- **`ch2_praetor_meet` (Gặp Thẩm Phán Lưu Đày ở Quảng Trường):**
  - Thẩm Phán: _"Cậu trai trẻ... đôi mắt cậu nhìn thấy dòng chảy nhân quả đúng không? Lâu lắm rồi ta mới thấy một linh hồn không mang xiềng xích định mệnh."_
  - Peter: _"Thưa thẩm phán, cháu cần vào Đại Thư Viện để xóa bản án đang chặn đường."_
  - Thẩm Phán: _"Cầm lấy cây Bút Khắc này. Năm xưa chính tay ta dùng nó thảo bản án cho Hoàng Đế, để rồi nhận ra ngài đã bí mật xóa sạch tên mình khỏi mọi tội lỗi."_
  - Lựa chọn 1: `[Cháu sẽ dùng nó trả lại sự thật.]` -> Thẩm Phán mỉm cười gật đầu trao bút.
  - Lựa chọn 2: `[Bản án của cháu ghi những gì?]` -> _"Nó ghi cậu không có quyền tồn tại. Hãy tự tay gọt bỏ nó đi."_

- **`ch2_verdict_boss_confront` (Trước trận chiến Boss):**
  - Bản Án Đế Chế: _"CẢNH BÁO. Thực thể không mã số nhân quả đã xâm nhập thánh điện. Phán quyết tiền định: Tử hình vì tội làm sai lệch bánh răng vũ trụ."_
  - Peter: _"Các người định đoạt tội trạng trước khi người ta kịp sống... Một bộ máy như vậy xứng đáng bị tháo rời!"_
  - Lyra _(đứng sau hỗ trợ)_: _"Đập vỡ cái cân rỉ sét đó đi, Peter!"_

---

## 8. Trang Bị Ẩn (Hidden Gear)

Chương 2 bố trí đúng 2 trang bị ẩn quý giá, mỗi món nằm sau một câu đố cơ chế riêng:

1. **Vũ khí ẩn (Weapon): Đoản Kiếm Thiết Pháp Quan (`praetor_iron_rapier`)**
   - **Vị trí:** Ngách bí mật sau hầm mộ (`poi_praetor_cache_secret` tại `map_ch2_sunken_catacombs`).
   - **Cách giải:** Sau khi giải xong câu đố _Khóa Nhân Quả Đảo Nghịch_, Peter dùng Nhãn Thời Gian soi lại bức tường nứt cạnh Hốc Đá. Một viên gạch thừa nhô ra mang dấu ấn cổ. Nhấn vào viên gạch sẽ mở hốc ngầm.
   - **Chỉ số:** Sát thương vật lý `8` (vượt trội so với kiếm gãy `3` và kiếm đồng `5`), tầm với `36 px`, tốc độ vung `340 ms`, hiệu ứng: Đòn chém thường có 15% làm chậm tốc độ di chuyển của địch.

2. **Bùa ẩn (Charm): Bùa Cán Cân Chân Lý (`scales_of_truth_charm`)**
   - **Vị trí:** Tương tác với Cán Cân Nhân Quả (`poi_causality_scales` tại `map_ch2_forum_plaza`).
   - **Cách giải:** Giải câu đố _Cán Cân Chân Lý Không Trọng Lượng_ (§5.3) bằng cách đặt mảnh giấy trắng chưa viết chữ `blank_unwritten_parchment`.
   - **Chỉ số:** `maxHp: +16`, `maxMp: +8`, `defense: +2`, `speed: +2`. Hiệu ứng phụ: Giảm 10% tiêu hao MP của đòn Đòn Thời Gian (từ 6 MP còn ~5 MP).

---

## 9. Danh Mục Tài Nguyên (Asset List — Ưu Tiên Tái Sử Dụng)

| Tài Nguyên                 | Loại        | Quy Cách / Đặc Tả                                | Ưu Tiên               | Trạng Thái / Ghi Chú                                                          |
| -------------------------- | ----------- | ------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------- |
| `dungeon_tileset`          | Tileset     | 32×32 px (`assets/tilesets/dungeon_tileset.png`) | **Đã có**             | Tái sử dụng cho Hầm Mộ, Quảng Trường, Thư Viện, Thánh Điện.                   |
| `wilds_tileset`            | Tileset     | 32×32 px (`assets/tilesets/wilds_tileset.png`)   | **Đã có**             | Tái sử dụng cho Vùng Ngoại Ô Bia Đá.                                          |
| `peter_*`                  | Spritesheet | 32×32 px (Idle, Walk, Attack, Dodge)             | **Đã có**             | Giữ nghiêm ngặt khóa nhận diện tóc xoăn ngắn (`Curly Hair Lock`).             |
| `enemy_temporal_shade`     | Spritesheet | 32×32 px                                         | **Đã có**             | Tái sử dụng làm quái bóng đen lang thang.                                     |
| `npc_elder_echo`           | Spritesheet | 32×32 px                                         | **Đã có**             | Tái sử dụng `NPC_ELDER_001` thêm shader/tint lam nhạt mờ ảo.                  |
| `npc_lyra`                 | Spritesheet | 32×32 px (4 frame idle, 4 frame walk)            | **Must** `[PROPOSAL]` | Nữ chiến binh tóc đen ngắn, áo giáp da nẹp đồng. Cần Owner duyệt.             |
| `npc_exiled_praetor`       | Spritesheet | 32×32 px (4 frame idle ngồi/đứng)                | **Must** `[PROPOSAL]` | Cựu thẩm phán áo toga rách, dải băng bịt mắt kéo lệch. Cần Owner duyệt.       |
| `enemy_imperial_automaton` | Spritesheet | 32×32 px (4 frame walk, 2 frame húc)             | **Must** `[PROPOSAL]` | Người máy đồng thau mang khiên chữ nhật kiểu La Mã. Cần Owner duyệt.          |
| `enemy_causality_enforcer` | Spritesheet | 32×32 px (4 frame walk, 2 frame đâm)             | **Nice** `[PROPOSAL]` | Lính chấp pháp áo giáp nhẹ cầm kiếm liễu (có thể tạm đổi tint nếu thiếu art). |
| `boss_imperial_verdict`    | Spritesheet | 64×64 px (4 frame idle, 1 `releasedFrame`)       | **Must** `[PROPOSAL]` | Bức tượng đồng khổng lồ cầm cân gãy và gươm. Cần Owner duyệt.                 |

---

## 10. Câu Hỏi Mở Cho Owner (Open Questions for Owner)

1. **Số phận của Lyra sau Chapter 2:**
   - _Đề xuất (Recommended):_ Lyra ở lại tái thiết vùng đất và giải phóng những tù nhân còn lại, chia tay Peter tại Cổng Ngưỡng với lời hứa sẽ gặp lại ở các chương sau khi Peter tìm ra chân tướng toàn cục (giữ cấu trúc đồng hành địa phương).
2. **Nguồn gốc phôi chìa khóa đồng ở Hốc Đá Quá Khứ:**
   - _Đề xuất (Recommended):_ Phôi chìa khóa đồng `bronze_key_blank` được nhặt từ hộp đồ nghề của một thợ sửa khóa cổ trong Hầm Mộ, nhấn mạnh sự tương đồng nghề nghiệp với Peter.
3. **Mức độ phức tạp của câu đố Cán Cân Chân Lý:**
   - _Đề xuất (Recommended):_ Xử lý bằng hệ thống đối thoại có điều kiện (`dialogueRules` với `ifItem`) thay vì viết riêng minigame vật lý, giúp tiết kiệm thời gian phát triển engine mà vẫn đảm bảo tính bất ngờ của lời giải.
4. **Sprite cho lính Chấp Pháp (`enemy_causality_enforcer`):**
   - _Đề xuất (Recommended):_ Nếu họa sĩ chưa kịp vẽ mới cả 2 quái thường, ưu tiên vẽ `enemy_imperial_automaton` (Búp Bê Cơ Khí); quái thứ hai tạm thời dùng lại sprite chiến binh đổi màu áo giáp sang tím sẫm.
5. **Tiến trình cấp độ cuối Chapter 2:**
   - _Đề xuất (Recommended):_ Peter kết thúc Chapter 2 ở mức **cấp 10–11** (nhận tổng ~650 EXP qua chuỗi quest và quái vật), chuẩn bị tiến vào Chapter 3 với trần cấp độ tầm trung.

---

## 11. Quyết Định Của Owner (2026-11-13) & Hợp Đồng Dữ Liệu

Owner duyệt toàn bộ thiết kế cùng 5 đề xuất ở §10, kèm các chỉnh sửa của coordinator dưới đây. Phần này **thay thế** các chỗ mâu thuẫn ở §5, §6, §8.

### 11.1. Chỉnh sửa đã duyệt

1. **Xóa bản án (thay §5.2) — phải suy luận.** Phiến Đá Bản Án ghi 3 dòng: (1) _Tên:_ Peter, Kẻ Không Tên; (2) _Tội:_ can thiệp dòng thời gian; (3) _Nguyên nhân:_ đã bước qua Cổng Ngưỡng không giấy phép sinh ra. Sắc Lệnh 404 nói một bản án chỉ đứng vững khi **nguyên nhân** của nó còn đó. Gọt dòng 3 → màn chắn sụp. Gọt dòng 1 → đá liền lại ("tên không phải là tội"). Gọt dòng 2 → chữ tự khắc lại ("nguyên nhân còn thì tội sẽ mọc lại"). Mỗi lần sai chỉ mất lượt thử, không phạt.
2. **Vũ khí ẩn (thay §8.1) — Mộ Kẻ Bị Kết Án Trước Khi Sinh.** Trong Hầm Mộ có 3 bia mộ, mỗi bia ghi ngày sinh và ngày tuyên án. Manh mối nằm trong _Trang Nhật Ký Pháp Quan_ trang 2: "Ta chôn thanh kiếm của mình cùng người duy nhất bị kết án trước cả khi chào đời." Mở đúng bia (ngày tuyên án sớm hơn ngày sinh) → `praetor_iron_rapier`. Mở sai → "Ngôi mộ này yên nghỉ đúng thứ tự nhân quả."
3. **Trang bị chỉ có chỉ số**, không có hiệu ứng phụ. Kiếm: `attack 8, reach 36, swingMs 340`. Bùa: `maxHp 16, maxMp 8, defense 2, speed 2`.
4. **Boss gọn lại (thay §6.2).** Đầu mỗi lượt của mình, boss tuyên một bản án cho lượt kế của Peter:
   - _"Kẻ vung gươm sẽ đổ máu!"_ → Tấn công hoặc Kỹ năng thì Peter chịu phản đòn; Phòng thủ thì bản án mất nguyên nhân → **cán cân nứt** (1 vết).
   - _"Kẻ chần chừ sẽ bị nghiền nát!"_ → Phòng thủ hoặc Vật phẩm thì Peter chịu đòn nặng; Tấn công thì cán cân nứt.
   - Đủ **3 vết nứt** → khiên vỡ (`breakShield`), từ đó đánh thường được. Không có lệnh [6] riêng, không cần "soi trước".
5. **Cấp độ:** nới `expThresholds` để Peter kết thúc chương ở cấp 10–11 (trần sau Prologue nâng lên 11).
6. **Lời thoại:** "đếch thèm" → "chẳng thèm".
7. **Lính Chấp Pháp có hình riêng** (không dùng tạm hình cũ): owner muốn đa dạng.

### 11.2. Chia việc

- **Antigravity — T-51 (nội dung):** `dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`.
- **Claude — T-52 (engine + bản đồ):** 5 map, cơ chế boss bản án, khiên của Búp Bê Cơ Khí, phản đòn của Lính Chấp Pháp, vùng đẩy lùi, mốc cấp, gắn nội dung vào `maps.json`.
- **Claude — T-53 (hình):** `npc_lyra`, `npc_exiled_praetor`, `enemy_imperial_automaton`, `enemy_causality_enforcer`, `boss_imperial_verdict` — ứng viên Pipeline B, chờ owner duyệt.

### 11.3. Hợp đồng ID (cả hai bên dùng đúng tên này)

**Quest:** như bảng §7.1. **Cờ:** như §7.2, thêm `ch2_tablet_wrong_name`, `ch2_tablet_wrong_crime` (không bắt buộc dùng).

**Vật phẩm mới (`items.json`):**

| id                          | type                                                               | nguồn                     |
| --------------------------- | ------------------------------------------------------------------ | ------------------------- |
| `praetor_diary_page`        | document (2 trang; trang 1 = manh mối khóa, trang 2 = manh mối mộ) | `ch2_praetor_diary_found` |
| `edict_law_404`             | document (1 trang)                                                 | `ch2_edict_stele_read`    |
| `bronze_key_blank`          | puzzle                                                             | `ch2_locksmith_box`       |
| `praetor_chisel_stylus`     | puzzle                                                             | `ch2_praetor_meet`        |
| `blank_unwritten_parchment` | puzzle                                                             | `ch2_praetor_desk`        |
| `praetor_iron_rapier`       | weapon                                                             | `ch2_tomb_correct`        |
| `scales_of_truth_charm`     | charm                                                              | `ch2_scales_balanced`     |
| `imperial_honey_bread`      | consumable (hồi máu)                                               | thưởng quest              |
| `causality_seal_shard`      | key_item                                                           | thưởng quest boss         |

**Dialogue node mà bản đồ sẽ trỏ tới** (mỗi node ≤ 2 lựa chọn; nhánh dài thì nối node):

- Ngoại Ô: `ch2_outskirts_arrival` (trigger vào map), `ch2_elder_echo_farewell` (đặt `elder_echo_faded`), `ch2_edict_stele_read`, `ch2_hatch_locked`, `ch2_hatch_open` (đặt `entered_catacombs_hatch`).
- Hầm Mộ: `ch2_lyra_cornered` (trước khi dọn quái), `ch2_lyra_rescued` (đặt `saved_lyra`), `ch2_locksmith_box`, `ch2_praetor_diary_found`, `ch2_alcove_empty` / `ch2_alcove_place_blank` (cần `bronze_key_blank`, đặt `placed_retroactive_key`), `ch2_gate_ancient_locked` / `ch2_gate_blank_too_new` (có phôi nhưng chưa đặt vào hốc) / `ch2_gate_opens` (đặt `unlocked_catacomb_gate`), `ch2_tomb_1`, `ch2_tomb_2`, `ch2_tomb_3` (đọc bia) + `ch2_tomb_wrong`, `ch2_tomb_correct`, `ch2_tomb_empty`.
- Quảng Trường: `ch2_plaza_arrival`, `ch2_praetor_meet` (đặt `met_exiled_praetor`, `has_praetor_stylus`, `has_praetor_pass`), `ch2_praetor_after`, `ch2_praetor_desk`, `ch2_baker_*`, `ch2_automaton_*`, `ch2_scales_inspect` / `ch2_scales_heavy` / `ch2_scales_balanced` / `ch2_scales_done`, `ch2_execution_platform`, `ch2_archives_gate_locked`.
- Thư Viện: `ch2_archives_arrival`, `ch2_peter_record` (đặt `read_peter_unwritten_record`), `ch2_rebellion_records`, `ch2_tablet_inspect` → chuỗi chọn dòng `ch2_tablet_choose_a` / `ch2_tablet_choose_b`, `ch2_tablet_wrong_name`, `ch2_tablet_wrong_crime`, `ch2_tablet_expunged` (đặt `expunged_peter_verdict`), `ch2_barrier_guilt_repel`.
- Điện: `ch2_verdict_boss_confront` (đặt `met_imperial_verdict`), `ch2_verdict_released` (sau boss), `ch2_seal_restored` (đặt `causality_seal_restored`, `learned_causality_resonance`, `endChapter: 2`).

Thoại trong trận boss (dòng tuyên án, nứt cán cân) nằm trong `enemies.json` do Claude viết.
