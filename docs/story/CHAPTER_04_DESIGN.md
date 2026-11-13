# CHRONO – Thiết Kế Chi Tiết Chương 4: Cuộc Chiến Bất Tận (The War Without End)

**Tài liệu:** Thiết Kế Kịch Bản, Cơ Chế & Dữ Liệu Chương 4  
**Phân hệ:** Narrative & Gameplay Specification: Chapter 4  
**Quyền năng chủ đạo:** **Finality** (Sự Kết Thúc / Điểm Dừng / Ranh Giới Khép Lại)  
**Tài liệu tham chiếu:** `docs/story/STORY_CHAPTER_04.md`, `CHRONO_STORY_BIBLE.md` §10, `CHARACTER_BIBLE.md`, `CANON_AND_OPEN_QUESTIONS.md`, `CHAPTER_03_DESIGN.md` (§12 Owner Decisions).  
**Tác giả:** Antigravity (Implementation Agent)  
**Trạng thái:** Owner duyệt 2026-11-14 kèm §13 (§13 thắng khi khác biệt).

---

## 1. Tiền Đề & Cái Giá Cảm Xúc Của Peter

### 1.1. Bối cảnh & Tiền đề

Sau khi giải phóng Dàn Hợp Xướng Vô Danh tại Thánh Điện Chương 3, Peter đón nhận chấn động tâm lý nặng nề nhất kể từ khi thức tỉnh: **Ký ức ấu thơ ấm áp nhất trong tâm trí cậu — buổi chiều mưa trên căn gác xép, chiếc bánh chia đôi và lời hứa không bao giờ quên nhau — hoàn toàn không phải ký ức của chính cậu.** Giọng nói đó, bóng hình đó thuộc về một người khác đã bị thế giới xóa bỏ (_Conceptual Erasure_).

Bước qua Cổng Ngưỡng thứ tư, Peter đặt chân tới **Bình Nguyên Cờ Rách (The Vale of Torn Banners)**, nơi quyền năng **Finality** (Điểm Dừng) bị đứt gãy. Tại đây, cuộc chiến đẫm máu giữa hai vương quốc cổ đại **Veridia** và **Sol-Karis** đã kéo dài hơn ba trăm năm mà không thể kết thúc.

Khái niệm "Cái Chết" và "Sự Khép Lại" bị trục xuất khỏi cõi này:

- Binh sĩ ngã xuống, vết thương tự liền lại sau vài nhịp thở rồi lại bị cuốn vào guồng quay chém giết.
- Mũi tên bắn ra lơ lửng giữa không trung; tro bụi chiến trường không lắng xuống; tiếng hò reo, tiếng rên xiết của hàng vạn tử sĩ lặp đi lặp lại thành một bản trường ca địa ngục.
- Mọi người ở đây kiệt quệ, hóa điên, khao khát được chết, được buông gươm nhưng bị tước đoạt quyền năng được kết thúc.

### 1.2. Cái giá cảm xúc & Động lực của Peter

- **Xung đột nội tâm:** Peter hiểu nỗi thống khổ của sự tồn tại dai dẳng khi mất đi ý nghĩa. Cậu tự hỏi: _Nếu sự sống chỉ là một chuỗi hành hạ vô tận, liệu việc ban tặng một cái kết vĩnh viễn có phải là lòng trắc ẩn tối thượng?_
- **Đối diện với Kuro:** Những ảo ảnh hồi tưởng chập chờn (_hazy flashbacks_) dẫn dắt Peter lần theo dấu vết một người bạn cũ. Ở cuối chương, Peter sẽ lần đầu tiên giáp mặt trực tiếp với **Kuro** — người bạn thời thơ ấu đang điên cuồng tìm kiếm lối thoát khỏi thực tại thông qua _Possibility_ và chiều không gian _The Interval_. Sự tương phản giữa mong muốn chấm dứt chiến tranh của Peter và khát vọng xé toạc trật tự thế giới của Kuro tạo nên bước ngoặt bi kịch lớn nhất của câu chuyện.

---

## 2. Luồng Trải Nghiệm 3 Vòng & Phân Bổ Tileset

Chương 4 được thiết kế với quy mô lớn hơn Chương 3, thời lượng ước tính **120 – 150 phút**, trải dài trên **12 bản đồ** (gồm 10 bản đồ chính và 2 bản đồ ẩn).

Trục trải nghiệm được chia thành **3 Vòng Thời Gian** (_Three Temporal Rings_) lồng ghép cơ chế Hybrid Temporal Layers:

```
[VÒNG 1: Đêm Trước Trận] ──> [VÒNG 2: Chiến Trường Bất Tận] ──> [VÒNG 3: Cánh Đồng Tro]
  - Doanh trại Veridia        - Thung lũng Mưa Tên              - Cánh đồng Tro Tàn
  - Hào giao tuyến            - Sống Núi Máu                   - Đài Tưởng Niệm
  - Tiền đồn Sol-Karis        - Pháo đài Cờ Huyết Sắc (Mid-Boss)- Thánh Điện Finality (Final Boss)
                              - Trường Lũy Đổ Nát (Phản bội)    - 2 Mật thất Ẩn (Gặp Kuro)
```

### 2.1. Vòng 1: Đêm Trước Trận (The Eve of Battle)

- **Không khí:** Bầu trời chạng vạng đỏ ối, khói lửa le lói, binh sĩ run rẩy viết thư vĩnh biệt gia đình. Sự ngột ngạt của nỗi sợ hãi trước giờ xuất quân.
- **Tileset:** `wilds_tileset` kết hợp các prop lều trại quân sự, cọc rào gai và bàn quân báo.

### 2.2. Vòng 2: Chiến Trường Bất Tận (The Endless Carnage)

- **Không khí:** Chiến sự điên cuồng, mưa tên giăng kín trời, máu nhuộm đỏ đất bùn, tiếng thét gào kinh thiên động địa. Nhịp độ dồn dập với các pha vượt bẫy thời gian thực và đẩy lùi đợt tiến công.
- **Tileset đề xuất mới:** `warfield_tileset` (32×32 px: đất nứt nẻ lầy lội, hố bom pháo, xác xe công thành, cọc chông sắt, hào chiến hào) — _chờ Owner duyệt_. Nếu chưa có, tạm thời phối hợp `dungeon_tileset` (tường đá nứt) + `wilds_tileset` (nền đất cháy).

### 2.3. Vòng 3: Cánh Đồng Tro (The Ash Field)

- **Không khí:** Tĩnh lặng đến rợn ngườI. Mặt đất phủ một lớp tro xám dày đặc, vũ khí cắm la liệt như rừng chông, không một bóng người còn cử động nhưng âm vang tiếng thét vẫn rì rào trong gió.
- **Tileset:** `sunken_tileset` (đá hoa cương cổ, bậc thềm đổ nát) + prop tro tàn trắng xám.

---

## 3. Đặc Tả Bản Đồ Chi Tiết (12 Bản Đồ)

| Mã Bản Đồ                          | Tên Bản Đồ                 | Quy Mô | Lối Ra & Điều Kiện Khóa                       | Quái & Cạm Bẫy                                   | Điểm Tương Tác (POI) & NPC                                |
| :--------------------------------- | :------------------------- | :----- | :-------------------------------------------- | :----------------------------------------------- | :-------------------------------------------------------- |
| `map_ch4_encampment_veridia`       | Doanh Trại Veridia         | 28×18  | Ra `trench_crossroads` (khóa: cần gặp Aldric) | Không có quái                                    | NPC Tướng Aldric, Lính Bran, Bàn thư ký, Hòm thư quân báo |
| `map_ch4_trench_crossroads`        | Chiến Hào Giao Tuyến       | 30×20  | Lối sang Sol-Karis, lối lên Sống Núi          | 3× Endless Phalanx, 2× Stray Soldier             | Lỗ châu mai, Hầm công binh, Xác xe chở lương              |
| `map_ch4_encampment_solkaris`      | Tiền Đồn Sol-Karis         | 26×18  | Khóa cổng pháo đài (cần cờ lệnh)              | 2× Phalanx Guard, 2× Heavy Halberdier            | NPC Đại Tướng Kaelen, Sử Quan Elion, Bàn cân áp suất      |
| `map_ch4_arrow_storm_valley`       | Thung Lũng Mưa Tên         | 30×18  | Sang `red_ridge` (vượt mưa tên 10s)           | Mưa tên liên tục (`startTimer`), 2× Ghost Sniper | 3 Vách đá trú ẩn, Tháp quan sát đổ, Cờ hiệu quang học     |
| `map_ch4_red_ridge_battlefield`    | Sống Núi Máu               | 30×20  | Lên Pháo Đài Cờ Huyết Sắc                     | 2× Banner Carrier, 4× Endless Phalanx            | Hào tử sĩ, Cọc huyết kỳ rách, Xác kỵ sĩ tiên phong        |
| `map_ch4_crimson_redoubt`          | Pháo Đài Cờ Huyết Sắc      | 26×20  | Sang Trường Lũy (hạ Mid-Boss)                 | **Mid-Boss: The Crimson Standard**               | Đài cờ trung tâm, Bia chiến tích hoen ố, Rương quân nhu   |
| `map_ch4_fallen_ramparts`          | Trường Lũy Đổ Nát          | 28×18  | Lối sang Cánh Đồng Tro (sau biến cố)          | Phục kích: 4× Phalanx, 2× Sniper                 | Cần gạt bẫy sập, Binh nhì phản bội Renard, Hầm trú ẩn     |
| `map_ch4_ash_plains`               | Cánh Đồng Tro Tàn          | 30×20  | Tiến vào Đài Tưởng Niệm Vô Danh               | 3× Ashen Wraith, 2× Hollow Centurion             | Rừng gươm cắm đất, Mảnh hiệp ước 1 & 2, Bếp tro tàn       |
| `map_ch4_monument_of_the_fallen`   | Đài Tưởng Niệm Vô Danh     | 28×20  | Mở cửa Thánh Điện (giải đố hiệp ước)          | Không quái (vùng thiêng)                         | Bàn thờ tưởng niệm, Phiến đá khắc tên, Bàn đá hiệp ước    |
| `map_ch4_sanctum_of_finality`      | Thánh Điện Điểm Dừng       | 30×22  | Lối vào Gian Phòng Đổ Nát (sau boss)          | **Final Boss: The Last War**                     | 3 Trụ Nghi Thức Finality, Bệ phong ấn Lõi Finality        |
| `map_ch4_interval_sanctuary`       | Gian Phòng Đổ Nát _(Ẩn 1)_ | 20×14  | Lối vào qua vết nứt sau Thánh Điện            | Không có quái                                    | **Sự kiện gặp Kuro [CANON]**, Bùa ẩn Thấu Kính Khe Nứt    |
| `map_ch4_tomb_of_the_first_fallen` | Mộ Người Đầu Tiên _(Ẩn 2)_ | 22×16  | Mở từ Cánh Đồng Tro (cần 4 vũ khí cổ)         | 1× Ancient Sentinel Guard                        | Bệ mộ đá vôi nguyên thủy, Vũ khí ẩn Ngọn Giáo Điểm Dừng   |

---

## 4. Tuyến Nhân Vật & Chiều Sâu Nội Tâm

### 4.1. Thống Soái Aldric (Veridia)

- **Ngoại hình:** Lão tướng ngoài 60 tuổi, râu tóc bạc phơ như cước, áo choàng lam rách tả tơi phủ ngoài bộ giáp rạn nứt chằng đụp dây da. Tay luôn run rẩy ghì chặt chuôi kiếm cắm xuống đất.
- **Quá khứ & Bí mật:** Ra trận khi con gái duy nhất là Maelis mới lên 5 tuổi. Ông giữ một lá thư đã ố vàng, mép giấy sờn rách: _"Cha ơi, khi hoa tử đằng nở, cha nhớ về ôm con nhé."_
- **Nỗi đau:** Ông đã biết từ hai trăm năm trước rằng Maelis qua đời vì tuổi già ở quê nhà thanh bình, trong khi ông bất tử trên bãi tha ma này. Ông không dám buông kiếm vì sợ nếu cuộc chiến kết thúc, cái chết của hàng vạn thuộc hạ theo ông sẽ trở thành một trò hề vô nghĩa.

### 4.2. Đại Tướng Kaelen (Sol-Karis — Đối trọng & Tấm gương phản chiếu)

- **Ngoại hình:** Tướng lĩnh trung niên vạm vỡ, thiết giáp đen mun khắc chìm hoa văn mặt trời cụt tia. Khuôn mặt mang vết sẹo chém dài từ trán qua sống mũi, ánh mắt lạnh băng nhưng trĩu nặng u uất.
- **Mối liên hệ với Aldric:** Từng là huynh đệ kết nghĩa thời niên thiếu khi hai nước còn bang giao. Hai người từng bẻ đôi một miếng ngọc bội thề ước cùng gìn giữ thái bình bờ cõi. Biến cố triều đình biến họ thành kẻ thù không đội trời chung.
- **Bí mật:** Kaelen không thù hận Aldric. Ông giữ nửa miếng ngọc bội suốt ba thế kỷ. Ông tiếp tục chỉ huy vì tin rằng: nếu phe ông buông xuôi, binh lính của ông sẽ bị lịch sử coi là lũ cướp nước man rợ.

### 4.3. Binh Nhì Bran (Người lính đếm số lần chết)

- **Ngoại hình:** Chàng trai trẻ khoảng 19 tuổi nhưng ánh mắt đờ đẫn như người trăm tuổi. Khắp cánh tay và cổ chằng chịt vết sẹo đâm chém. Trên thân ngọn giáo gỗ của anh khắc kín 1.427 vạch đếm.
- **Bí mật & Nỗi đau:** Bran đã ngã xuống và sống lại đúng 1.427 lần. Mỗi lần tái sinh, tâm trí anh lại rơi rụng một mảnh ký ức đời thường: anh đã quên mùi bánh mì quê mẹ, quên màu mắt người yêu, chỉ còn nhớ cảm giác mũi giáo lạnh buốt xuyên qua tim. Anh run rẩy sợ rằng ở lần chết thứ 1.428, anh sẽ quên mất tên người mẹ tần tảo của mình.

### 4.4. Sử Quan Vô Lệ — Elion

- **Ngoại hình:** Ông lão gầy gò mặc áo vải thô nhuộm màu tro, mắt mờ đục vì khói lửa, tay luôn ôm khư khư tập tài liệu bọc da thú buộc xích sắt.
- **Bí mật kinh hoàng:** Là người duy nhất nhớ rõ cuộc chiến bắt đầu vì sao. Cách đây 300 năm, chính ông là người chấp bút cho Bản Hiệp Ước Hòa Bình Veridia — Sol-Karis. Nhưng vì tham vọng muốn chứng kiến và ghi chép một "thiên sử thi bi tráng vĩ đại nhất lịch sử nhân loại", ông đã lén giấu bản hiệp ước vào đêm ký kết. Lời nguyền mất đi Finality giáng xuống, biến tham vọng học thuật của ông thành địa ngục trần gian giam cầm chính ông suốt 300 năm.

### 4.5. Binh Nhì Renard (Kẻ phản bội vì sợ hãi)

- Không phải kẻ ác theo mô-típ phản diện. Renard chỉ là một người lính quá kinh hãi trước cái chết lặp đi lặp lại. Khi bị dồn vào chân tường ở Trường Lũy, anh đã gạt cần sập bẫy đá ngăn đường rút lui của Peter và đồng đội với hy vọng đổi lấy một hiệp ước đình chiến cá nhân từ phía đối phương.

---

## 5. Thiết Kế Câu Đố — 3 Vòng, 6 Câu Đố Không Lặp Lại Cơ Chế

Tuân thủ nghiêm ngặt nguyên tắc: **Không dùng lại cơ chế của Chương 1, 2, 3** (không mộ & di vật, không cặp trụ chém, không chuông màu qua vực, không đối chiếu tháng, không tô lớp màu, không gõ nhịp, không quay đồng hồ niên đại). Mọi câu đố đều dựa trên đối chiếu chéo $\ge 2 - 3$ manh mối.

```
+---------------------------------------------------------------------------------------+
| VÒNG 1: ĐÊM TRƯỚC TRẬN                                                                |
| - Câu đố 1.1: Hòm Thư Quân Báo (Góc Bóng Râm & Chòm Sao)                              |
| - Câu đố 1.2: Cán Cân Quân Nhu Áp Suất Thủy Lực [2 LỜI GIẢI HỢP LỆ -> 2 THƯỞNG KHÁC]  |
+---------------------------------------------------------------------------------------+
| VÒNG 2: CHIẾN TRƯỜNG BẤT TẬN                                                          |
| - Câu đố 2.1: Tam Giác Điểm Mù Khói Lửa (Kính Phản Quang & Tọa Độ Gió)                |
| - Câu đố 2.2: Trận Địa Binh Khí Tử Sĩ (Cấp Bậc Binh Chủng & Địa Hình Hy Sinh)         |
+---------------------------------------------------------------------------------------+
| VÒNG 3: CÁNH ĐỒNG TRO                                                                 |
| - Câu đố 3.1: Phục Chế Hiệp Ước Hòa Bình 4 Mảnh (Chuỗi Điều Khoản & Triện Mực)       |
| - Câu đố 3.2: Nghi Thức Tam Trụ Finality (Khái Niệm Kết Thúc Trong Trận Boss)         |
+---------------------------------------------------------------------------------------+
```

### 5.1. Câu đố 1.1: Hòm Thư Quân Báo (The Courier Box Lock)

- **Vị trí câu đố:** Hòm thư dã chiến tại `map_ch4_encampment_veridia` (tọa độ x: 18, y: 7).
- **Cơ chế:** Khóa xoay cơ khí gồm 3 vòng đĩa: Vòng Hướng La Bàn (8 hướng), Vòng Góc Nghiêng (30° - 45° - 60° - 90°), Vòng Ngôi Sao (Sao Bắc Đẩu, Sao Hôm, Sao Mai, Sao Chức Nữ).
- **Manh mối đối chiếu:**
  1. `courier_journal_scrap` (nhặt tại Chiến Hào): _"Người đưa thư khởi hành lúc bóng của cột cờ đại bản doanh đổ dài gấp đôi chiều cao cọc, hướng thẳng về phía chòm sao dẫn đường của người đi biển phương bắc."_
  2. `astronomy_guide_leaflet` (nhặt tại bàn quân báo): _"Bóng cọc dài gấp đôi vật thể khi góc nghiêng mặt trời chạm mức 30 độ. Chòm sao dẫn đường phương bắc là Sao Bắc Đẩu."_
  3. Bàn khắc la bàn tại lều chỉ huy: Chỉ ra cột cờ đại bản doanh buổi chiều đổ bóng lệch về hướng **Đông Bắc**.
- **Suy luận logic:**
  - Hướng = **Đông Bắc** (theo bóng cột cờ chiều).
  - Góc = **30°** (bóng dài gấp đôi cọc).
  - Ngôi sao = **Sao Bắc Đẩu** (sao dẫn đường phương bắc).
- **Sai & Phạt nhẹ:** Chọn sai phát ra tiếng cọt kẹt kẹt chốt bi cơ khí; Peter lẩm bẩm: _"Góc bóng và vị trí chòm sao dường như chưa ăn khớp với nhật trình của người đưa thư..."_ (không lộ đáp án).
- **Thành công:** Hòm bật mở, trao `alder_family_letter` (Lá thư của con gái Tướng Aldric).

### 5.2. Câu đố 1.2: Cán Cân Áp Suất Thủy Lực [CÂU ĐỐ CÓ 2 LỜI GIẢI HỢP LỆ]

- **Vị trí câu đố:** Cửa kho ngầm nối `map_ch4_trench_crossroads` sang `map_ch4_encampment_solkaris`.
- **Cơ chế:** Cửa thủy lực vận hành bằng cách cân bằng hoặc làm quá tải các piston áp suất bằng các bao vật phẩm thu thập từ chiến trường: `sack_grain` (Bao lúa mạch, nặng 10kg), `sack_herbs` (Bao thảo dược, nặng 5kg), `sack_sulfur` (Bao lưu huỳnh, nặng 20kg).
- **Manh mối đối chiếu:**
  1. `hydraulic_manual_sheet`: _"Áp suất cân bằng chuẩn xác là 25kg ở mỗi bên đĩa van. Nếu vượt quá 40kg ở một bên van xả, then cửa sẽ vỡ tung nhưng chấn động sẽ đánh sập trần hầm."_
  2. `field_medic_note`: Thảo dược 5kg, Lúa mạch 10kg, Lưu huỳnh 20kg.
- **Hai nhánh lời giải:**
  - **Lời giải A (Cân bằng an toàn - 25kg / 25kg):**
    - Bên trái: 1 Bao Lưu Huỳnh (20kg) + 1 Bao Thảo Dược (5kg) = 25kg.
    - Bên phải: 2 Bao Lúa Mạch (20kg) + 1 Bao Thảo Dược (5kg) = 25kg.
    - _Kết quả:_ Cửa thủy lực mở êm ru, bảo toàn toàn bộ hầm ngầm. Mở hòm dược phẩm dã chiến nhận **Nước Tiên Phục Hồi (`phoenix_draught`)** (Hồi đầy HP và MP, xóa mọi hiệu ứng xấu).
  - **Lời giải B (Quá tải phá hoại - Đặt 2 Bao Lưu Huỳnh = 40kg vào van xả bên phải):**
    - _Kết quả:_ Nồi hơi nổ tung làm sập then sắt, mở toang lối đi tắt vào kho vũ khí mật của Sol-Karis. Người chơi nhận được áo giáp chiến binh **Giáp Ngực Dũng Cảm (`valiant_crest_cuirass`)** (`defense: 6, maxHp: 35`), nhưng vụ nổ khiến người lính trẻ Bran bị thương nặng (mất 1 mạng hồi sinh, tăng số lần chết lên 1.428).

### 5.3. Câu đố 2.1: Tam Giác Điểm Mù Khói Lửa (The Beacon Triangulation)

- **Vị trí câu đố:** Đài quan sát trên đỉnh tháp tại `map_ch4_arrow_storm_valley`.
- **Cơ chế:** Thung lũng bị quét liên tục bởi bão tên lửa của trận địa pháo binh phía xa. Người chơi phải điều chỉnh 3 tấm gương quang học trên 3 tháp tín hiệu để chiếu chùm sáng báo hiệu vị trí điểm mù, làm gián đoạn quỹ đạo bắn của pháo binh.
- **Manh mối đối chiếu:**
  1. `artillery_grid_map` (nhặt tại tháp 1): Bản đồ tọa độ 4 góc phần tư I, II, III, IV.
  2. `wind_vane_record` (nhặt tại tháp 2): _"Gió đông nam cấp 3 làm lệch quỹ đạo tên sang góc phần tư III một góc 45 độ."_
  3. `smoke_signal_code` (nhặt tại tháp 3): _"Chỉ khi ánh phản quang xanh rọi vuông góc với góc lệch của gió, hiệu lệnh ngưng bắn mới được kích hoạt."_
- **Suy luận logic:**
  - Hướng gió lệch vào góc phần tư III (hướng 225°).
  - Góc chiếu vuông góc với hướng gió = 225° - 90° = **135° (Góc phần tư II — Tây Bắc)**.
  - Xoay 3 gương hội tụ về đài phát tín hiệu Tây Bắc $\to$ Pháo binh ngưng bắn, mưa tên dừng lại vĩnh viễn trên bản đồ!
- **Sai & Phạt nhẹ:** Xoay sai hướng làm bùng lên chớp lửa đỏ; mưa tên vẫn rơi nhưng Peter được lùi về mép tháp an toàn.

### 5.4. Câu đố 2.2: Trận Địa Binh Khí Tử Sĩ (The Fallen Arms Array)

- **Vị trí câu đố:** 4 ụ đất tử sĩ quanh Pháo Đài Cờ Huyết Sắc `map_ch4_red_ridge_battlefield`.
- **Cơ chế:** Lá Cờ Huyết Sắc nhận sinh lực từ 4 ụ đất oan hồn. Cần cắm đúng 4 món vũ khí cổ nhặt trên chiến trường vào đúng 4 ụ đất tương ứng với binh chủng đã ngã xuống.
- **Manh mối đối chiếu:**
  1. Binh khí thu thập: `broken_lance` (Thương gãy), `cracked_broadsword` (Đại đao mẻ), `split_shortbow` (Cung ngắn gãy cánh), `snapped_standard_pole` (Cán cờ gãy).
  2. `burial_plaque_scrap` (Bia đá chôn cất):
     - Ụ Đất Phía Bắc: Đồi dốc thoải đá sỏi — nơi đội kỵ mã hứng trọn đợt xung kích đầu tiên.
     - Ụ Đất Phía Đông: Bãi lau sậy ven sông — nơi lính xạ thủ rút lui nhưng bị bao vây.
     - Ụ Đất Phía Tây: Chiến hào bùn lầy — nơi bộ binh giáp nặng cản bước xe công thành.
     - Ụ Đất Trung Tâm: Gò đất cao nhất — nơi viên chỉ huy hiệu triệu đợt phản công cuối.
- **Suy luận logic:**
  - Ụ Bắc (Kỵ mã) $\to$ **Thương gãy (`broken_lance`)**.
  - Ụ Đông (Xạ thủ) $\to$ **Cung ngắn gãy (`split_shortbow`)**.
  - Ụ Tây (Bộ binh giáp nặng) $\to$ **Đại đao mẻ (`cracked_broadsword`)**.
  - Ụ Trung Tâm (Chỉ huy) $\to$ **Cán cờ gãy (`snapped_standard_pole`)**.
- **Thành công:** Lá cờ máu mất hào quang bất tử, mở cửa khiêu chiến Mid-Boss `boss_crimson_standard`.

### 5.5. Câu đố 3.1: Phục Chế Hiệp Ước Hòa Bình (The Torn Peace Treaty)

- **Vị trí câu đố:** Bàn đá hiệp ước tại `map_ch4_monument_of_the_fallen`.
- **Cơ chế:** Đặt 4 mảnh giấy da của Hiệp Ước Hòa Bình theo đúng trình tự đàm phán lịch sử để xóa bỏ phong ấn của hận thù.
- **Manh mối đối chiếu:**
  1. `treaty_scrap_land` (Mảnh 1 - Đất đai): Chữ ký phía dưới mang dấu triện tròn nguyên vẹn.
  2. `treaty_scrap_prisoners` (Mảnh 2 - Trao đổi tù binh): Lề giấy ghi chú: _"Thảo luận sau khi ranh giới đất đai đã ngã ngũ."_
  3. `treaty_scrap_waters` (Mảnh 3 - Nguồn nước): Nét mực son có triện vỡ góc (chỉ xuất hiện ở phiên đàm phán thứ ba).
  4. `treaty_scrap_signatures` (Mảnh 4 - Lời thề & Chữ ký chung): Có chữ ký kết nghĩa của Aldric và Kaelen.
  5. Lời trần tình của Sử quan Elion (`ch4_elion_talk`): Trình tự đàm phán 300 năm trước: Bắt đầu từ nhượng bộ đất đai $\to$ Tha bổng tù nhân chiến tranh $\to$ Chia sẻ nguồn nước tưới tiêu $\to$ Cùng tuyên thệ trước thần linh.
- **Trình tự đúng:** Mảnh Đất Đai $\to$ Mảnh Tù Binh $\to$ Mảnh Nguồn Nước $\to$ Mảnh Lời Thề Chữ Ký.
- **Thành công:** Cánh cổng đá hoa cương dẫn vào Thánh Điện Điểm Dừng mở toang.

### 5.6. Câu đố 3.2: Nghi Thức Tam Trụ Finality (The Ritual of Finality)

- **Vị trí câu đố:** Ngay trong trận chiến Boss Cuối `boss_the_last_war` tại `map_ch4_sanctum_of_finality`.
- **Cơ chế:** Boss sở hữu trạng thái _Bất Diệt (Endless Loop)_ — khi HP giảm về 0, boss lập tức hồi sinh 40% HP trừ khi cả 3 Trụ Nghi Thức xung quanh được kích hoạt đúng theo bài học của 3 nhân vật:
  - **Trụ Phía Tả — Sự Tha Thứ (Forgiveness):** Cần ánh sáng từ Lá Thư của Con Gái Aldric.
  - **Trụ Phía Hữu — Sự Chấp Nhận (Acceptance):** Cần Mảnh Ngọc Bội Thề Ước của Kaelen.
  - **Trụ Trung Tâm — Ký Ức Đọng Lại (Remembrance):** Cần Phiến Đá Khắc Tên Mẹ của Bran.
- Khi boss quỵ gối ở 15% HP lần đầu tiên, hệ thống chuyển sang chế độ lựa chọn lệnh đặc biệt `[Nghi Thức Finality]`. Kích hoạt đúng 3 trụ theo thứ tự: **Tha Thứ $\to$ Chấp Nhận $\to$ Lưu Lại Ký Ức** $\to$ Chấm dứt vĩnh viễn trận chiến!

---

## 6. Lựa Chọn Cốt Truyện & Bảng Phân Nhánh Phần Thưởng

Chương 4 đưa ra **3 lựa chọn đạo đức lớn**. Mỗi lựa chọn đều không có phương án hoàn hảo, cái giá phải trả thể hiện rõ tinh thần Dark Fantasy, mang lại phần thưởng cân bằng nhưng khác biệt về phong cách chơi, và lưu lại cờ cốt truyện ảnh hưởng trực tiếp đến 3 kết thúc ở Chương 6:

- Ending 1: _The Eternal Order_ (Trật Tự Vĩnh Cửu)
- Ending 2: _The Unbound Eternity_ (Hỗn Loạn Tự Do)
- Ending 3: _The Last Chronarch_ (Người Định Đoạt Cuối Cùng — True Ending)

| Lựa Chọn                              | Nhánh A (Lựa chọn & Cái giá)                                                                                                                                          | Phần Thưởng Nhánh A                                                                                                          | Nhánh B (Lựa chọn & Cái giá)                                                                                                                                              | Phần Thưởng Nhánh B                                                                                                                              | Cờ Lưu Cốt Truyện                                                  |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **1. Lá Thư Con Gái Aldric**          | **Nói sự thật nghiệt ngã:** Maelis đã mất từ 200 năm trước. Aldric khóc buông kiếm, tan thành tro bụi thanh thản. Đội quân Veridia giải tán.                          | **Tro Tàn Bình Yên (`ashes_of_peace_charm`)**<br>_Charm:_ +40 HP, +5 Phòng thủ, giảm 15% sát thương nhận vào.                | **Nói dối nhân từ:** Maelis đã sống hạnh phúc và con cháu đang đợi ông. Aldric mỉm cười tự hào, trao kiếm báu gia truyền rồi dẫn quân tan biến trong ánh sáng kiêu hãnh.  | **Thanh Gươm Nguyện Vọng (`vow_of_the_father_blade`)**<br>_Weapon:_ Công 14, Tầm 40, Tốc độ 340ms, nhát chém quét rộng.                          | `ch4_choice_aldric_truth`<br>_hoặc_<br>`ch4_choice_aldric_comfort` |
| **2. Binh Nhì Bran (Lần chết 1.428)** | **Giải thoát tuyệt đối:** Không cho Bran hồi sinh nữa, ban cho anh cái chết vĩnh hằng dù tên người mẹ sẽ mãi mãi biến mất khỏi nhân gian.                             | **Giấc Ngủ Không Mộng Mị (`dreamless_rest_charm`)**<br>_Charm:_ +20 MP, Miễn nhiễm choáng, né đòn hồi 4 MP.                  | **Ghi danh vĩnh cửu:** Dùng kiếm gãy khắc tên mẹ Bran lên Bia Đá Thời Gian. Bran chịu đựng nỗi đau cái chết cuối nhưng mỉm cười vì nhớ lại nụ cười của mẹ.                | **Mảnh Khắc Tên Mẹ (`mothers_name_carving`)**<br>_Charm:_ +8 Tấn công, +10% Tỉ lệ bạo kích, tiêu diệt quái hồi 15 HP.                            | `ch4_choice_bran_release`<br>_hoặc_<br>`ch4_choice_bran_memorial`  |
| **3. Bản Án Cho Sử Quan Elion**       | **Thiêu hủy bộ sử thi:** Buộc Elion đốt cuốn biên niên sử đổi bằng máu hàng vạn người. Lịch sử giả tạo bị xóa bỏ, người ngã xuống không bị biến thành đề tài văn thơ. | **Mực Nước Mắt Sử Gia (`historian_tear_ink`)**<br>_Consumable vĩnh viễn:_ Tăng vĩnh viễn +25 Max MP và +10% Tốc độ hồi phục. | **Lưu giữ bài học đau đớn:** Cho phép giữ sách nhưng bắt viết thêm chương cuối về sự sám hối và tàn khốc của chiến tranh. Elion sống trong dằn vặt để lưu truyền bài học. | **Biên Niên Sử Chuộc Tội (`atonement_chronicle`)**<br>_Key/Passive:_ Nhận thêm 25% EXP từ mọi trận đánh, giảm 20% sát thương từ quái hệ bóng ma. | `ch4_choice_elion_burn`<br>_hoặc_<br>`ch4_choice_elion_chronicle`  |

---

## 7. Các Đoạn Hồi Tưởng Mờ Ảo (Hazy Flashbacks)

Các phân đoạn hồi tưởng được phân bổ rải rác trong chương, xuất hiện khi Peter tiếp xúc với các di vật thời gian. Mỗi phân đoạn đều được đánh dấu cờ dữ liệu `"flashback": true` để engine áp dụng hiệu ứng thị giác đặc biệt: **Màn hình mờ biên (vignette nhạt), tông màu đơn sắc bạc (sepia-greyscale), chữ thoại màu lam khói lướt nhẹ.**

```
[Flashback 1: Gác Mái Mưa]  --> [Flashback 2: Bánh Mì Chia Đôi] --> [Flashback 3: Lời Thề Vách Đá]
      (Map 1 - Hòm thư)              (Map 4 - Trú mưa tên)             (Map 7 - Sau phản bội)
                                               |
[Flashback 4: Đêm Cataclysm] <-----------------+
  (Map 9 - Trước Thánh Điện)
              |
              v
[GẶP GỠ TRỰC TIẾP KURO TẠI GIAN PHÒNG ĐỔ NÁT (Map 11)]
```

### 7.1. Thứ tự & Nội dung chi tiết các đoạn Flashback

1. **Flashback 1: Căn gác mái chiều mưa (`ch4_flashback_attic_rain`)**
   - **Điểm kích hoạt:** Mở Hòm Thư Quân Báo tại Doanh Trại Veridia (`map_ch4_encampment_veridia`).
   - **Nội dung:** Tiếng mưa rào rào gõ lên mái ngói dột. Peter và một bóng hình thiếu niên ngồi thu lu bên góc lò than tàn. Người bạn đẩy sang một chiếc đồng hồ quả quýt hoen rỉ chết máy: _"Cầm lấy đi. Khi nào tao với mày sửa được nó, nó sẽ chỉ giờ cho tụi mình đi khắp thế gian."_ Khuôn mặt người bạn nhòe đi như nhìn qua tấm kính ướt nước mưa. Tên người bạn chỉ là tiếng rè rè ngắt quãng.

2. **Flashback 2: Mẩu bánh mì khô chia đôi (`ch4_flashback_bread_correction`)**
   - **Điểm kích hoạt:** Núp sau tảng đá lớn tránh mưa tên tại Thung Lũng Mưa Tên (`map_ch4_arrow_storm_valley`).
   - **Nội dung:** Ký ức về mùa đông đói kém ở thị trấn biển. Peter nhớ rằng người bạn đã nhường phần bánh lớn hơn cho mình. Nhưng đột nhiên, ảo ảnh chớp giật — **chi tiết bị đính chính:** Người bạn cười toe toét bẻ đôi mẩu bánh, nhưng Peter mới chính là người giật lấy mẩu bánh nhỏ hơn vì sợ bạn mình đói. Người bạn cốc đầu Peter: _"Đồ ngốc... đã bảo tao ăn no ngoài bến tàu rồi mà."_ Peter giật mình: Ký ức trong đầu cậu bấy lâu nay đã bị ai đó cố tình đảo lộn vị trí!

3. **Flashback 3: Lời thề dưới vách đá hoàng hôn (`ch4_flashback_cliff_vow`)**
   - **Điểm kích hoạt:** Sau khi bị Renard phản bội và vượt qua bẫy sập tại Trường Lũy (`map_ch4_fallen_ramparts`).
   - **Nội dung:** Gió biển thổi tung mái tóc hai đứa trẻ đứng trên mỏm đá nhô ra biển. Người bạn đeo trước ngực một mặt dây chuyền pha lê màu lam tím lập lòe — thứ ánh sáng kỳ dị của _The Interval_. Người bạn nắm chặt tay Peter: _"Nếu một mai thế giới này sụp đổ... nếu một trong hai đứa mình bị xóa tên khỏi bia đá... đứa còn lại tuyệt đối không được quên."_ Peter cất tiếng hỏi: _"Làm sao quên được chứ?"_ Người bạn quay lại, nụ cười thoáng nét bi thương: _"Ký ức là thứ dễ vỡ nhất trần đời, Peter à."_

4. **Flashback 4: Đêm bão Cataclysm (`ch4_flashback_cataclysm_eve`)**
   - **Điểm kích hoạt:** Tương tác với Bàn Thờ Tưởng Niệm tại `map_ch4_monument_of_the_fallen`.
   - **Nội dung:** Tiếng chuông báo động rền vang. Mặt đất rung chuyển dữ dội. Bóng người bạn đứng ở bậu cửa tiệm sửa đồng hồ, khoác chiếc áo choàng xám bạc bị gió bão giật phần phật. Người bạn ngoảnh lại nhìn chiếc đồng hồ treo tường đang quay cuồng điên loạn: _"Trật tự này thối rữa rồi. Tao sẽ đi tìm một khả năng khác... một thế giới nơi không ai phải trở thành vật hi sinh."_ Peter vươn tay gào thét nhưng thanh âm bị tiếng sấm sét nuốt chửng. Đó là đêm chiếc đồng hồ trên tay Peter vĩnh viễn ngừng chạy.

---

## 8. Giao Tranh, Hành Vi Quái Mới & Boss Đột Phá

### 8.1. Ba Hành Vi Quái Mới (Mô tả kỹ thuật cho Engine)

1. **Xạ Thủ Vô Hồn (`enemy_ghost_sniper`):**
   - _Hành vi:_ Đứng cố định ở cự ly xa (6–8 ô). Khi phát hiện Peter, quái phát ra một **tia ngắm laser màu đỏ rực** nhấp nháy chiếu thẳng vào Peter trong **1.2 giây (wind-up)**.
   - _Cách đối phó:_ Người chơi phải phản xạ bấm lướt né (Shift) để thoát khỏi đường ngắm hoặc nấp sau chướng ngại vật đá. Sau 1.2s, mũi tên xuyên giáp phóng ra gây sát thương cực lớn (35 HP) và làm choáng 0.5s.
2. **Đội Hình Trùng Điệp (`enemy_endless_phalanx`):**
   - _Hành vi:_ Luôn di chuyển theo nhóm 2–3 con thành hàng ngang, giương khiên lớn phía trước. Khiên chặn 100% sát thương chém thường từ góc chính diện 180°.
   - _Cách đối phó:_ Người chơi phải lướt vòng ra sau lưng để chém, hoặc dùng **Đòn Thời Gian (chuột phải, 6 MP)** để phá vỡ thế thủ của khiên trong 2 giây.
3. **Binh Nhì Cầm Cờ (`enemy_banner_carrier`):**
   - _Hành vi:_ Không trực tiếp tấn công, mang một lá cờ chiến trường tạo vòng hào quang màu huyết sắc bán kính 4 ô. Bất kỳ quái thường nào bị Peter tiêu diệt bên trong vòng hào quang này sẽ hồi sinh với 50% HP sau **3 giây**.
   - _Cách đối phó:_ Phải ưu tiên áp sát tiêu diệt Binh Nhì Cầm Cờ trước để dập tắt vòng hào quang hồi sinh.

### 8.2. Boss Giữa: Lá Cờ Huyết Sắc (`boss_crimson_standard` — Sprite 48×48)

- **Hình tượng:** Cây đại kỳ rách nát nhuốm máu của ngàn vạn tử sĩ, cắm trên một khối giáp sắt mục nát lơ lửng giữa luồng khí xoáy đen đỏ.
- **HP:** 1.200 | **Cấp độ:** 16.
- **Cơ chế Boss mới 1 — Chiêu Mộ Oan Hồn (`Phantom Rally`):**
  - Cứ mỗi 3 lượt hành động, Boss cắm cờ xuống sàn đấu, triệu hồi 2 bóng ma kỵ sĩ (`Ghost Knights`) và kích hoạt **Bức Tường Khí Máu** giảm 75% sát thương nhận vào.
  - Người chơi phải tiêu diệt 2 kỵ sĩ trong vòng 2 lượt, hoặc sử dụng lệnh kỹ năng đặc biệt để chém đứt sợi dây liên kết linh hồn màu đỏ nối giữa Boss và kỵ sĩ.

### 8.3. Boss Cuối: Chiến Tranh Vĩnh Cửu (`boss_the_last_war` — Sprite 64×64)

- **Hình tượng:** Một khổng thần bọc giáp gai đồ sộ, được ghép lại từ hàng ngàn thanh gươm, khiên mẻ, mũi giáo và đầu lâu chiến binh. Hai tay cầm cự kiếm bốc cháy lửa tro tàn.
- **HP:** 2.400 | **Cấp độ:** 18.
- **Cơ chế Boss mới 2 — Vòng Lặp Bất Tận & Nghi Thức Finality (`Finality Execution`):**
  - **Pha 1 (100% -> 50% HP):** Boss vung kiếm càn quét diện rộng, triệu hồi mưa tên và khóa các ô di chuyển bằng bẫy gai thép.
  - **Pha 2 (50% -> 0% HP):** Boss kích hoạt _Bất Diệt Cưỡng Bức_. Khi HP tụt về 0 lần đầu tiên, Boss không chết mà hồi phục ngay 40% HP. Hệ thống mở khóa lệnh chiến thuật `[Nghi Thức Finality]` trên thanh hành động.
  - **Cơ chế hạ gục:** Người chơi phải lần lượt kích hoạt 3 Trụ Nghi Thức xung quanh sàn đấu tương ứng với 3 bài học nhân vật (Tha Thứ $\to$ Chấp Nhận $\to$ Ký Ức) trong lúc cầm cự đòn đánh của Boss. Khi đủ 3 trụ, đòn tấn công tiếp theo sẽ kích hoạt nhát chém Finality vĩnh viễn hóa giải Boss.

---

## 9. Kịch Bản Thoại Nháp & Hệ Thống Nhiệm Vụ

### 9.1. Danh Sách Nhiệm Vụ (`quests.json`) — 6 Chính + 3 Phụ (Tất cả mang `"chapter": 4`)

| Quest ID                     | Loại  | Tên Nhiệm Vụ            | Mục Tiêu Chính (`completeOnFlag`)                                                           | Thưởng (~Lv 15–18)                  |
| :--------------------------- | :---- | :---------------------- | :------------------------------------------------------------------------------------------ | :---------------------------------- |
| `quest_ch4_vale_of_banners`  | Chính | Bình Nguyên Cờ Rách     | Bước vào doanh trại Veridia; hội kiến Tướng Aldric (`met_general_aldric`)                   | +180 EXP                            |
| `quest_ch4_letter_unsent`    | Chính | Lá Thư Chưa Gửi         | Mở hòm thư (`opened_courier_box`); quyết định số phận thư Aldric (`resolved_aldric_letter`) | +220 EXP, Thưởng nhánh Aldric       |
| `quest_ch4_arrow_storm`      | Chính | Vượt Làn Tên Lửa        | Hóa giải đài pháo binh mưa tên (`silenced_arrow_storm`)                                     | +240 EXP, `refined_chrono_shard` x2 |
| `quest_ch4_crimson_standard` | Chính | Cờ Máu Bất Tử           | Đánh bại Mid-Boss Lá Cờ Huyết Sắc (`defeated_crimson_standard`)                             | +280 EXP, `ancient_amber_resin` x2  |
| `quest_ch4_broken_peace`     | Chính | Hiệp Ước Vỡ Vụn         | Thu thập 4 mảnh hiệp ước (`restored_peace_treaty`); mở Thánh Điện                           | +320 EXP, `phoenix_draught`         |
| `quest_ch4_the_last_war`     | Chính | Điểm Dừng Cuộc Chiến    | Đánh bại Boss The Last War; nhận Finality Resonance (`finality_seal_restored`)              | +450 EXP, `finality_seal_shard`     |
| `quest_ch4_soldier_count`    | Phụ   | Lần Chết Thứ 1.428      | Định đoạt số phận cho Binh nhì Bran (`resolved_soldier_bran`)                               | +190 EXP, Thưởng nhánh Bran         |
| `quest_ch4_chronicler_guilt` | Phụ   | Lời Thú Tội Của Sử Quan | Phán quyết tội lỗi của Sử quan Elion (`resolved_chronicler_elion`)                          | +210 EXP, Thưởng nhánh Elion        |
| `quest_ch4_first_fallen`     | Phụ   | Mộ Người Đầu Tiên       | Cắm đủ 4 vũ khí cổ tại Mộ Cổ (`opened_first_fallen_tomb`)                                   | +230 EXP, `spear_of_finality`       |

### 9.2. Kịch Bản Thoại Nháp Cảnh Then Chốt

#### Cảnh 1: Đối thoại với Tướng Aldric tại Doanh Trại Veridia (`ch4_aldric_intro`)

- **Tướng Aldric:** _(Ngồi bên đống lửa tàn, hai bàn tay run rẩy hơ trên tàn tro)_  
  _"Lại một gương mặt trẻ nữa... Cậu tới đây để tìm vinh quang, hay cũng bị dòng thời gian mục ruỗng này ném vào cối xay thịt?"_
- **Peter:** _"Cháu tìm kiếm lối đi qua bình nguyên. Tại sao quân lính ở đây không rút lui?"_
- **Tướng Aldric:** _(Cười khàn đặc, tiếng cười nghe như kim loại cọ vào đá)_  
  _"Rút lui? Về đâu hả chàng trai? Ba trăm năm trước, cánh cổng dẫn về quê hương đã bị phong ấn. Ở đây, người ta không thể già đi, không thể thắng, và tàn nhẫn nhất là... không thể chết."_
- **Lựa chọn 1:** `[Cháu sẽ tìm cách phá vỡ vòng lặp này]` $\to$ Aldric lắc đầu: _"Nhiều kẻ từng nói thế, rồi chính họ trở thành những bóng ma gào thét ngoài chiến hào."_
- **Lựa chọn 2:** `[Ngài có điều gì nuối tiếc không?]` $\to$ Aldric chạm vào túi áo ngực: _"Một bức thư... ta mang theo từ ngày con gái ta mới lên năm."_

#### Cảnh 2: Cuộc Gặp Trực Tiếp Đầu Tiên Với Kuro [CANON — VIẾT ĐẦY ĐỦ]

_(Bối cảnh: Diễn ra sau khi đánh bại The Last War và kích hoạt Finality Resonance. Peter bước qua bức tường vỡ phía sau thánh điện, bước vào một căn phòng đổ nát tĩnh lặng đến kỳ lạ tại `map_ch4_interval_sanctuary`. Mọi tiếng gươm đao gào thét biến mất hoàn toàn. Ánh nắng chiều nhạt rọi qua mái ngói thủng, bụi thời gian lơ lửng.)_

- **Peter:** _(Dừng bước, bàn tay vô thức siết chặt chuôi kiếm gãy. Một cảm giác quen thuộc đến nghẹt thở bóp lấy lồng ngực)._
- _(Ở góc phòng bên khung cửa sổ vỡ, một bóng người thanh niên đứng quay lưng lại. Tà áo choàng màu xám bạc bị xói mòn bởi luồng năng lượng tím thẫm của The Interval. Mái tóc đen cắt gọn, dáng người cao gầy)._
- **Kuro:** _(Không quay đầu lại, giọng nói trầm tĩnh, đều đặn vang lên giữa căn phòng trống)_
  > **“Mày vẫn còn giữ thói quen tìm kiếm những thứ đã biến mất à?”**
- **Peter:** _(Chấn động toàn thân. Giọng nói này... chính là giọng nói trong căn gác mái chiều mưa, chính là giọng nói chia đôi mẩu bánh mì! Cậu bước lên một bước, môi mấp máy run rẩy)_:  
  _"Anh... anh là ai? Tại sao tôi lại nhớ giọng nói của anh... nhưng ký ức của tôi lại trống rỗng?"_
- **Kuro:** _(Chậm rãi xoay người lại. Ánh mắt Kuro sắc lạnh, sâu thẳm như đáy vực, nhưng nơi khóe mắt ánh lên tia sáng màu lam tím của quyền năng Possibility. Ánh nhìn của Kuro dừng lại ở chiếc đồng hồ ngừng chạy bên hông Peter, rồi lướt qua thanh kiếm gãy)_.
- **Kuro:** _(Khẽ nhắm mắt lại, một nụ cười cay đắng thoáng nở trên môi rồi vụt tắt)_
  > **“Mày đã hứa sẽ không quên tao.”**
- **Peter:** _(Ôm đầu, cơn đau buốt nhói xé toạc tâm trí. Cậu gào lên trong tuyệt vọng)_:  
  _"Hãy nói cho tôi biết! Lời hứa đó là gì?! Tên của anh là gì?!"_
- **Kuro:** _(Không trả lời. Không gian sau lưng Kuro nứt toác thành một khe nứt không-thời gian sâu thẳm, phát ra những hạt tinh thể lấp lánh của The Interval)_.  
  _"Thế giới này không có câu trả lời cho mày đâu, Peter. Cứ giữ lấy sự kết thúc nhỏ nhoi của mày đi... Chúng ta sẽ gặp lại nhau khi mọi khả năng đều cạn kiệt."_
- _(Kuro lùi bước vào khe nứt. Vết nứt khép lại trong nháy mắt với một tiếng 'tách' thanh mảnh, để lại Peter quỳ gục giữa căn phòng hoang phế, nước mắt lã chã rơi trên nền gạch vỡ)._

#### Cảnh 3: Dư ảnh Trưởng Lão Thời Gian (Xuất hiện duy nhất một lần ở đầu chương)

- Xuất hiện tại thềm đá ngưỡng cửa Doanh Trại Veridia (`ch4_elder_echo_gate`):  
  _"Peter... điểm dừng không phải là sự hủy diệt, mà là sự hoàn tất của một hành trình. Đừng sợ hãi khi phải khép lại một trang sách đẫm máu."_ (Sau đó tan biến thành những đốm sáng).

---

## 10. Trang Bị Ẩn & Danh Mục Tài Nguyên

### 10.1. Hai Trang Bị Ẩn (Hidden Gear)

1. **Vũ khí ẩn: Ngọn Giáo Điểm Dừng (`spear_of_finality`)**
   - **Vị trí:** Mật thất Mộ Người Đầu Tiên Ngã Xuống (`map_ch4_tomb_of_the_first_fallen`).
   - **Cách đạt được:** Hoàn thành nhiệm vụ phụ `quest_ch4_first_fallen`, thu thập đủ 4 vũ khí cổ cắm vào 4 bệ thờ xung quanh mộ để hóa giải phong ấn.
   - **Chỉ số:** `type: "weapon"`, `attack: 14`, `reach: 44`, `swingMs: 350`. (Vũ khí có tầm đánh xa nhất toàn game, vung chém quét rộng, vượt trội so với Hoài Niệm Kiếm ở Chương 3).

2. **Bùa ẩn: Thấu Kính Khe Nứt (`interval_lens_charm`)**
   - **Vị trí:** Nhặt trên bệ cửa sổ vỡ tại Gian Phòng Đổ Nát (`map_ch4_interval_sanctuary`) ngay sau khi Kuro biến mất.
   - **Ý nghĩa:** Vật phẩm vương lại từ chiếc áo choàng của Kuro khi xuyên qua The Interval.
   - **Chỉ số:** `type: "charm"`, `maxHp: 28`, `maxMp: 16`, `defense: 4`, `speed: 3`. (Bùa toàn năng mạnh nhất tính đến thời điểm hiện tại).

### 10.2. Danh Mục Tài Nguyên Cần Tác Giả Mã Hóa (Pipeline B)

| Tài Nguyên              | Loại    | Quy Cách                                            | Trạng Thái / Ghi Chú                                                                                                                                                  |
| :---------------------- | :------ | :-------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `warfield_tileset`      | Tileset | 32×32 px PNG                                        | **Đề xuất mới [PROPOSAL]**: Mặt đất cháy, hố pháo, chông gai, lều bạt.                                                                                                |
| `npc_aldric`            | Sprite  | 32×32 px (4 hướng idle, 4 hướng walk)               | **Must Vẽ Mới**: Lão tướng tóc bạc, giáp xanh lam rạn nứt, cầm cự kiếm.                                                                                               |
| `npc_kaelen`            | Sprite  | 32×32 px (4 hướng idle)                             | **Must Vẽ Mới**: Đại tướng giáp đen, sẹo chéo mặt, cầm đại đao.                                                                                                       |
| `npc_soldier_bran`      | Sprite  | 32×32 px (4 hướng idle)                             | **Must Vẽ Mới**: Binh nhì gầy gò, người quấn băng trắng, cầm ngọn giáo khắc vạch.                                                                                     |
| `npc_chronicler_elion`  | Sprite  | 32×32 px (4 hướng idle)                             | **Must Vẽ Mới**: Ông lão áo tro xám, ôm bọc sách có xích sắt.                                                                                                         |
| `npc_kuro`              | Sprite  | 32×32 px (Idle, Walk, Glitch)                       | **STRICT CANON**: Bạn thân Peter. Tóc đen cắt ngắn, áo choàng xám bạc viền rách lân tinh lam tím, mắt lạnh lùng. Cần vẽ cực kỳ chi tiết vì sẽ xuất hiện Chương 5 & 6. |
| `enemy_ghost_sniper`    | Sprite  | 32×32 px (Idle, Aim Laser, Shoot)                   | **Must Vẽ Mới**: Xạ thủ áo rách lơ lửng, cung gỗ đen, mắt đỏ rực.                                                                                                     |
| `enemy_endless_phalanx` | Sprite  | 32×32 px (Shield Walk, Thrust)                      | **Must Vẽ Mới**: Lính mang khiên tháp sắt cao ngất, tay cầm giáo dài.                                                                                                 |
| `enemy_banner_carrier`  | Sprite  | 32×32 px (Wave Banner, Chant)                       | **Must Vẽ Mới**: Binh sĩ vác lá đại kỳ rách rưới tỏa hào quang đỏ.                                                                                                    |
| `boss_crimson_standard` | Sprite  | 48×48 px (Idle Float, Ground Slam, Summon)          | **Must Vẽ Mới**: Đại kỳ rách nát nhuốm máu bọc luồng khí đen đỏ.                                                                                                      |
| `boss_the_last_war`     | Sprite  | 64×64 px (Idle Stance, Blade Swing, Finality Kneel) | **Must Vẽ Mới**: Khổng thần giáp sắt kết tụ từ ngàn vạn vũ khí gãy.                                                                                                   |

---

## 11. Các Câu Hỏi Mở Trình Project Owner Phê Duyệt

1. **Về Tileset Chiến Trường (`warfield_tileset`):**
   - _Đề xuất (Recommended):_ Cho phép tạo mới một bộ tileset chiến trường 32×32 px để khắc họa đúng tính chất ác liệt, khói lửa và hào chiến của Chương 4, thay vì chắp vá từ `wilds` và `dungeon`.
2. **Về Ngoại Hình Chính Thức của Kuro:**
   - _Đề xuất (Recommended):_ Kuro có cùng độ tuổi với Peter (~26 tuổi), vóc dáng tương đồng nhưng phong thái lạnh lùng, mang dấu vết hao mòn của The Interval. Sprite của Kuro cần được Project Owner duyệt riêng từng pixel art frame để đảm bảo tính biểu tượng lâu dài.
3. **Cơ Chế Phản Bội của Renard:**
   - _Đề xuất (Recommended):_ Khi Renard gạt cần sập bẫy đá ở Trường Lũy, cho Peter một đoạn đối thoại ngắn để Renard giãi bày nỗi khiếp sợ cái chết, làm nổi bật thông điệp: "Chiến tranh kéo dài khiến người bình thường biến chất vì hoảng loạn, không có ai thuần ác."

---

## 12. Hợp Đồng Định Danh Dữ Liệu (ID Contract)

Phần này là quy chuẩn dữ liệu bất biến để **Claude (Engine/Maps)** và **Antigravity (Content/Dialogue)** làm việc song song mà không bị xung đột.

### 12.1. Danh Sách Vật Phẩm Mới (`items.json`)

| Item ID                   | Loại         | Tên Tiếng Việt                 | Ghi Chú                                                    |
| :------------------------ | :----------- | :----------------------------- | :--------------------------------------------------------- |
| `courier_journal_scrap`   | `document`   | Mảnh Nhật Trình Liên Lạc       | 1 trang $\le 220$ ký tự (manh mối bóng cọc la bàn).        |
| `astronomy_guide_leaflet` | `document`   | Tờ Chỉ Dẫn Thiên Văn Quân Sự   | 1 trang $\le 220$ ký tự (manh mối góc 30° và sao Bắc Đẩu). |
| `hydraulic_manual_sheet`  | `document`   | Bản Hướng Dẫn Áp Suất Thủy Lực | 1 trang $\le 220$ ký tự (manh mối cân 25kg hoặc nổ 40kg).  |
| `artillery_grid_map`      | `document`   | Bản Đồ Tọa Độ Pháo Binh        | 1 trang $\le 220$ ký tự (manh mối góc phần tư).            |
| `wind_vane_record`        | `document`   | Nhật Ký Hướng Gió Thung Lũng   | 1 trang $\le 220$ ký tự (manh mối gió đông nam lệch 45°).  |
| `smoke_signal_code`       | `document`   | Mật Mã Tín Hiệu Khói           | 1 trang $\le 220$ ký tự (manh mối góc vuông 135°).         |
| `burial_plaque_scrap`     | `document`   | Mảnh Bia Chôn Cất Tử Sĩ        | 2 trang $\le 220$ ký tự (manh mối 4 vị trí binh chủng).    |
| `treaty_scrap_land`       | `document`   | Mảnh Hiệp Ước: Đất Đai         | 1 trang $\le 220$ ký tự (triện tròn).                      |
| `treaty_scrap_prisoners`  | `document`   | Mảnh Hiệp Ước: Tù Binh         | 1 trang $\le 220$ ký tự (phiên thứ hai).                   |
| `treaty_scrap_waters`     | `document`   | Mảnh Hiệp Ước: Nguồn Nước      | 1 trang $\le 220$ ký tự (triện vỡ góc).                    |
| `treaty_scrap_signatures` | `document`   | Mảnh Hiệp Ước: Lời Thề Chung   | 1 trang $\le 220$ ký tự (chữ ký hai tướng).                |
| `alder_family_letter`     | `puzzle`     | Lá Thư Chưa Gửi Của Maelis     | Di vật của con gái Aldric.                                 |
| `broken_lance`            | `puzzle`     | Mũi Thương Kỵ Binh Gãy         | Binh khí cắm ụ đất phía Bắc.                               |
| `cracked_broadsword`      | `puzzle`     | Đại Đao Bộ Binh Mẻ             | Binh khí cắm ụ đất phía Tây.                               |
| `split_shortbow`          | `puzzle`     | Cung Ngắn Xạ Thủ Gãy           | Binh khí cắm ụ đất phía Đông.                              |
| `snapped_standard_pole`   | `puzzle`     | Cán Cờ Chỉ Huy Gãy             | Binh khí cắm ụ đất Trung Tâm.                              |
| `sack_grain`              | `puzzle`     | Bao Lúa Mạch Quân Nhu (10kg)   | Dùng cho câu đố cân áp suất.                               |
| `sack_herbs`              | `puzzle`     | Bao Thảo Dược Cứu Thương (5kg) | Dùng cho câu đố cân áp suất.                               |
| `sack_sulfur`             | `puzzle`     | Bao Lưu Huỳnh Công Binh (20kg) | Dùng cho câu đố cân áp suất.                               |
| `finality_seal_shard`     | `key_item`   | Mảnh Ấn Finality               | Nhận sau khi đánh bại The Last War.                        |
| `spear_of_finality`       | `weapon`     | Ngọn Giáo Điểm Dừng            | Vũ khí ẩn: `atk: 14, reach: 44, swingMs: 350`.             |
| `vow_of_the_father_blade` | `weapon`     | Thanh Gươm Nguyện Vọng         | Vũ khí nhánh Aldric: `atk: 14, reach: 40, swingMs: 340`.   |
| `valiant_crest_cuirass`   | `charm`      | Giáp Ngực Dũng Cảm             | Giáp nhánh nổ kho lương: `def: 6, maxHp: 35`.              |
| `ashes_of_peace_charm`    | `charm`      | Tro Tàn Bình Yên               | Bùa nhánh Aldric thật: `hp: 40, def: 5`.                   |
| `dreamless_rest_charm`    | `charm`      | Giấc Ngủ Không Mộng Mị         | Bùa nhánh Bran giải thoát: `mp: 20, def: 2`.               |
| `mothers_name_carving`    | `charm`      | Mảnh Khắc Tên Mẹ               | Bùa nhánh Bran bia đá: `atk: 8, crit: 10%`.                |
| `interval_lens_charm`     | `charm`      | Thấu Kính Khe Nứt              | Bùa ẩn mật thất Kuro: `hp: 28, mp: 16, def: 4, spd: 3`.    |
| `phoenix_draught`         | `consumable` | Nước Tiên Phục Hồi             | Hồi đầy 100% HP và MP.                                     |
| `historian_tear_ink`      | `consumable` | Mực Nước Mắt Sử Gia            | Tăng vĩnh viễn +25 Max MP.                                 |

### 12.2. Danh Sách Nhiệm Vụ (`quests.json`)

- `quest_ch4_vale_of_banners` (Chính)
- `quest_ch4_letter_unsent` (Chính)
- `quest_ch4_arrow_storm` (Chính)
- `quest_ch4_crimson_standard` (Chính)
- `quest_ch4_broken_peace` (Chính)
- `quest_ch4_the_last_war` (Chính)
- `quest_ch4_soldier_count` (Phụ)
- `quest_ch4_chronicler_guilt` (Phụ)
- `quest_ch4_first_fallen` (Phụ)

### 12.3. Danh Sách Dialogue Nodes Theo Bản Đồ (`dialogue.json`)

- **Map 1: Doanh Trại Veridia (`map_ch4_encampment_veridia`)**
  - `ch4_elder_echo_gate`: Dư ảnh Trưởng Lão tiễn biệt ở cổng đầu chương.
  - `ch4_aldric_intro`, `ch4_aldric_talk_repeat`: Đối thoại Thống Soái Aldric.
  - `ch4_soldier_bran_intro`: Binh nhì Bran đếm vạch thương tật lần 1.427.
  - `ch4_courier_box_inspect`, `ch4_courier_box_solve`, `ch4_courier_box_wrong`: Cơ chế mở hòm thư.
  - `ch4_flashback_attic_rain`: Hồi tưởng 1 (Gác mái mưa, `flashback: true`).

- **Map 2: Chiến Hào Giao Tuyến (`map_ch4_trench_crossroads`)**
  - `ch4_trench_arrival`: Cảm giác rợn ngợp giữa giao thông hào đầy xác vũ khí.
  - `ch4_hydraulic_door_inspect`: Kiểm tra cửa van thủy lực.
  - `ch4_hydraulic_door_balanced`: Mở an toàn nhận dược phẩm.
  - `ch4_hydraulic_door_overload`: Kích nổ mở kho vũ khí ngầm.

- **Map 3: Tiền Đồn Sol-Karis (`map_ch4_encampment_solkaris`)**
  - `ch4_kaelen_intro`, `ch4_kaelen_confront`: Đối đầu tư tưởng với Đại Tướng Kaelen.
  - `ch4_chronicler_elion_intro`: Gặp Sử Quan Elion ôm bọc sách có xích.
  - `ch4_elion_confession`: Elion thú nhận việc giấu hiệp ước hòa bình.

- **Map 4: Thung Lũng Mưa Tên (`map_ch4_arrow_storm_valley`)**
  - `ch4_arrow_storm_warning`: Bắt đầu đợt chạy mưa tên đếm giờ 10s.
  - `ch4_beacon_tower_inspect`, `ch4_beacon_tower_align`, `ch4_beacon_tower_wrong`: Căn chỉnh gương phản quang.
  - `ch4_flashback_bread_correction`: Hồi tưởng 2 (Đính chính mẩu bánh mì, `flashback: true`).

- **Map 5: Sống Núi Máu (`map_ch4_red_ridge_battlefield`)**
  - `ch4_red_ridge_arrival`: Đối mặt chiến tuyến cờ máu bốc cháy.
  - `ch4_mound_north`, `ch4_mound_east`, `ch4_mound_west`, `ch4_mound_center`: Cắm 4 món binh khí cổ.
  - `ch4_banner_ward_broken`: Hào quang bất tử của cờ máu bị hóa giải.

- **Map 6: Pháo Đài Cờ Huyết Sắc (`map_ch4_crimson_redoubt`)**
  - `ch4_crimson_standard_confront`: Khiêu chiến Mid-Boss Lá Cờ Huyết Sắc.
  - `ch4_crimson_standard_defeated`: Cờ gãy, mở đường tiến sang Trường Lũy.

- **Map 7: Trường Lũy Đổ Nát (`map_ch4_fallen_ramparts`)**
  - `ch4_renard_betrayal`: Binh nhì Renard sợ hãi gạt cần bẫy sập chặn đường.
  - `ch4_renard_confession`: Renard quỳ lạy giãi bày nỗi hoảng loạn.
  - `ch4_flashback_cliff_vow`: Hồi tưởng 3 (Lời thề vách đá biển, `flashback: true`).

- **Map 8: Cánh Đồng Tro Tàn (`map_ch4_ash_plains`)**
  - `ch4_ash_plains_arrival`: Khung cảnh tro tàn hoang phế, rừng gươm vô tận.
  - `ch4_treaty_scrap_find`: Nhặt các mảnh hiệp ước hòa bình.

- **Map 9: Đài Tưởng Niệm Vô Danh (`map_ch4_monument_of_the_fallen`)**
  - `ch4_monument_altar_inspect`: Đặt hoa và di vật tưởng niệm.
  - `ch4_treaty_puzzle_solve`: Ghép 4 mảnh hiệp ước mở cửa Thánh Điện.
  - `ch4_flashback_cataclysm_eve`: Hồi tưởng 4 (Đêm thảm họa, `flashback: true`).

- **Map 10: Thánh Điện Điểm Dừng (`map_ch4_sanctum_of_finality`)**
  - `ch4_last_war_boss_confront`: Đối mặt Boss Cuối The Last War.
  - `ch4_ritual_pillar_1`, `ch4_ritual_pillar_2`, `ch4_ritual_pillar_3`: Kích hoạt 3 trụ nghi thức Finality.
  - `ch4_last_war_boss_defeated`: The Last War tan biến thành bụi sáng thanh thản.
  - `ch4_finality_seal_restored`: Nhận Finality Resonance, kích hoạt chuyển cảnh sang Mật thất.

- **Map 11: Gian Phòng Đổ Nát (`map_ch4_interval_sanctuary`) [ẨN 1]**
  - `ch4_kuro_direct_meeting`: **Cuộc gặp trực tiếp canon với Kuro** (nguyên văn 2 câu thoại canon).
  - `ch4_kuro_disappears`: Kuro tan biến vào The Interval, để lại Thấu Kính Khe Nứt.
  - `ch4_chapter_end`: Peter đứng một mình giữa ánh hoàng hôn, kết thúc Chương 4 (`endChapter: 4`).

- **Map 12: Mộ Người Đầu Tiên Ngã Xuống (`map_ch4_tomb_of_the_first_fallen`) [ẨN 2]**
  - `ch4_tomb_first_fallen_inspect`: Tương tác bia mộ cổ nguyên thủy.
  - `ch4_tomb_first_fallen_open`: Nhận Ngọn Giáo Điểm Dừng (`spear_of_finality`).

### 12.4. Danh Sách Cờ Cốt Truyện (`snake_case`)

`ch4_arrived_veridia`, `met_general_aldric`, `opened_courier_box`, `resolved_aldric_letter`, `ch4_choice_aldric_truth`, `ch4_choice_aldric_comfort`, `solved_hydraulic_balanced`, `solved_hydraulic_overload`, `met_general_kaelen`, `met_chronicler_elion`, `silenced_arrow_storm`, `solved_fallen_arms_array`, `defeated_crimson_standard`, `experienced_renard_betrayal`, `restored_peace_treaty`, `defeated_the_last_war`, `finality_seal_restored`, `learned_finality_resonance`, `met_kuro_first_time`, `resolved_soldier_bran`, `ch4_choice_bran_release`, `ch4_choice_bran_memorial`, `resolved_chronicler_elion`, `ch4_choice_elion_burn`, `ch4_choice_elion_chronicle`, `opened_first_fallen_tomb`.

### 12.5. Danh Sách Mã Kẻ Địch Mới (`enemies.json`)

- `enemy_ghost_sniper` (Xạ Thủ Vô Hồn — HP 90, Tốc độ 70, Telegraph Laser 1.2s).
- `enemy_endless_phalanx` (Đội Hình Trùng Điệp — HP 180, Tốc độ 50, Khiên Chống 180°).
- `enemy_banner_carrier` (Binh Nhì Cầm Cờ — HP 120, Tốc độ 80, Hào quang hồi sinh 4 ô).
- `boss_crimson_standard` (Lá Cờ Huyết Sắc — HP 1.200, Triệu hồi kỵ sĩ & Khiên huyết khí).
- `boss_the_last_war` (Chiến Tranh Vĩnh Cửu — HP 2.400, Vòng lặp bất tử & Nghi thức Finality).

## 13. Quyết Định Của Owner (2026-11-14) & Hợp Đồng Bổ Sung

Owner duyệt §1–§12 cùng các chỉnh sửa dưới đây (Claude review). **§13 thay thế** mọi chỗ mâu thuẫn ở §2–§12.

### 13.1. Canon & hồi tưởng

- **Đồng hồ:** hồi tưởng 1 chỉ nói "một chiếc đồng hồ quả quýt hỏng". Không khẳng định đó là chiếc đồng hồ "của ông nội" Peter đang giữ, cũng không phủ nhận.
- **Hồi tưởng 2:** giữ chi tiết bị đính chính, nhưng Peter chỉ nhận ra "ký ức của mình đã lệch đi". Không nói có ai cố tình đảo lộn.
- **Hồi tưởng 4 làm mờ:** chỉ thấy bóng người ở bậu cửa tiệm đồng hồ giữa đêm bão. Câu nói bị tiếng sấm cắt ngang: _"Trật tự này… thối rữa rồi. Tao sẽ đi tìm một…"_. Không dùng từ "Cataclysm". Không có câu "đêm chiếc đồng hồ ngừng chạy". Không lộ nguồn gốc Unwritten.
- Node hồi tưởng có trường `"flashback": true` (Claude làm hiệu ứng: màn mờ biên, bạc màu, chữ lam khói).
- Đoạn giãi bày của Renard: owner đồng ý (`ch4_renard_confession`).

### 13.2. Cơ chế nhập đáp án mới (Claude)

Hộp thoại chỉ có ≤2 lựa chọn, nên câu đố nhiều phương án dùng hai cơ chế mới:

- **Vòng xoay (`dials`)**: mỗi lần nhấn [E], vòng xoay sang giá trị kế tiếp và hiện chữ nổi tên giá trị. Engine luôn giữ đúng một cờ `<dialId>_<value>` cho giá trị đang chọn. Một POI "xác nhận" riêng dùng `dialogueRules` với `ifFlags` để kiểm tra tổ hợp đúng hay sai.
- **Cân hai đĩa (`scales`)**: hiệu ứng thoại `scalePut: { scaleId, pan: "left" | "right", itemId }` lấy 1 bao từ túi đặt lên đĩa. `scaleReset: scaleId` trả mọi bao về túi. Engine biết khối lượng mỗi bao nhưng **không bao giờ hiện số**. Sau mỗi lần đặt, engine mở node `ch4_hydraulic_door_balanced` (hai đĩa đều đúng 25) hoặc `ch4_hydraulic_door_overload` (một đĩa > 35); trường hợp khác chỉ hiện chữ nổi "Đĩa trái trĩu xuống…".

### 13.3. Câu đố — bản đã duyệt

**C1.1 · Hòm Thư Quân Báo** (3 vòng xoay trên hòm: Hướng 8 giá trị · Góc 30°/45°/60°/90° · Sao: Sao Mai/Sao Hôm/Chức Nữ/Bắc Đẩu; POI xác nhận "Kéo chốt hòm").

- `courier_journal_scrap` (Chiến Hào): người đưa thư rời đại bản doanh _buổi chiều_, _khi bóng cột cờ dài đúng bằng cột cờ_, đi _về phía ngôi sao không bao giờ lặn_.
- `astronomy_guide_leaflet` (bàn quân báo, Doanh Trại): bóng dài gần gấp đôi vật khi mặt trời cao 30°; **bằng vật khi cao 45°**; bằng nửa vật khi 60°; gần như mất bóng khi 90°. Kèm đặc điểm 4 sao: Sao Mai mọc trước bình minh rồi tắt; Sao Hôm chỉ thấy sau hoàng hôn rồi lặn; Chức Nữ mùa hè lên đỉnh trời, rạng sáng lặn về tây; **Bắc Đẩu đứng yên phương bắc, không bao giờ lặn**.
- Bàn khắc la bàn (lều chỉ huy): buổi sáng bóng cột cờ đổ về Tây Bắc, **buổi chiều đổ về Đông Bắc**.
- **Đáp án:** Đông Bắc · 45° · Bắc Đẩu. Sai → `ch4_courier_box_wrong` (chốt kẹt; không gợi ý vòng nào sai). Đúng → `maelis_letter` (đổi từ `alder_family_letter`) + hồi tưởng 1.

**C1.2 · Cân Áp Suất Thủy Lực** (hai lời giải; cơ chế `scales`). Có 2 bao lưu huỳnh, 2 bao lúa, 2 bao thảo dược rải ở Chiến Hào. Tên và mô tả bao **không ghi khối lượng**.

- `hydraulic_manual_sheet`: hai đĩa nặng bằng nhau, _đúng 25 cân mỗi bên_ thì cửa mở êm. _Một đĩa nặng hơn 35 cân_ thì then sắt bật tung, kéo sập kho phía sau.
- `quartermaster_ledger` (thay `field_medic_note`): bao lúa nặng gấp đôi bao thảo dược; bao lưu huỳnh bằng hai bao lúa; ba loại, mỗi loại một bao, cộng lại 35 cân. → thảo dược 5, lúa 10, lưu huỳnh 20.
- **A · Cân bằng** (vd. trái: lưu huỳnh + thảo dược; phải: lúa + lúa + thảo dược) → `solved_hydraulic_balanced`, `phoenix_draught` ×2. Kaelen tiếp Peter tử tế, sau này tự tay trao mảnh hiệp ước Nguồn Nước.
- **B · Quá tải** (hai bao lưu huỳnh một đĩa = 40) → `solved_hydraulic_overload`, `valiant_crest_cuirass`. **Cái giá:** kho lương Sol-Karis sập (`ch4_solkaris_store_lost`), Kaelen lạnh nhạt và nghi ngờ Peter (thoại riêng). Mảnh Nguồn Nước phải tự bới trong đống đổ nát. **Bran không bị ảnh hưởng.**

**C2.1 · Gương Tín Hiệu** (1 vòng xoay 8 hướng trên tháp quan sát + POI "Rọi"; 3 tài liệu ở 3 tháp nhỏ, giữa các tháp là mưa tên).

- `wind_vane_record`: gió thổi từ Đông Bắc, đẩy mưa tên lệch về Tây Nam.
- `smoke_signal_code`: ánh xanh phải rọi _vuông góc với đường gió_, _thẳng vào mắt kẻ đang bắn_.
- `artillery_grid_map`: trận địa cung nỏ địch trên đồi **Tây Bắc**; Đông Nam là doanh trại Veridia.
- **Đáp án duy nhất:** Tây Bắc (Đông Nam cũng vuông góc nhưng là phe mình). Sai → `ch4_beacon_tower_wrong` (chớp đỏ, một loạt tên ép Peter lùi về chỗ nấp, không mất máu). Đúng → `silenced_arrow_storm`, mưa tên tắt hẳn.
- Bỏ "chạy 10 giây" (§12 Map 4). Thay bằng **mưa tên theo đợt** (Claude): bóng đổ báo trước ~1 giây; đứng ngoài chỗ nấp thì mất máu.

**C2.2 · Trận Địa Binh Khí** (4 ụ đất, mỗi ụ 1 vòng xoay 4 binh khí + POI "Thắp hương"; chỉ hiện khi có đủ 4 binh khí). Binh khí đổi tên trung tính và **vẫn ở trong túi sau khi dùng** (còn cần cho mộ ẩn):

- `relic_long_haft` — Cán gỗ dài bịt sắt, mũi gãy (thương kỵ binh).
- `relic_wide_blade` — Lưỡi thép bản rộng, mẻ nhiều chỗ (đại đao bộ binh nặng).
- `relic_curved_limb` — Thanh gỗ cong còn vết dây (cung xạ thủ).
- `relic_tattered_pole` — Cây sào treo mảnh vải cháy (cán cờ).
- `burial_plaque_scrap` **chỉ tả địa hình**: Bắc dốc thoải đá sỏi; Đông bãi lau ven sông; Tây hào bùn nơi xe công thành sa lầy; Trung tâm gò cao nhất.
- `bran_company_roster` (Bran đưa): kỵ mã cần dốc thoải để lấy đà; xạ thủ nấp nơi lau sậy che thân; bộ binh giáp nặng chặn nơi xe công thành sa lầy; người cầm cờ đứng chỗ cả đạo quân nhìn thấy.
- **Đáp án:** Bắc–cán dài · Đông–thanh cong · Tây–lưỡi rộng · Trung tâm–sào vải. Sai → `ch4_mounds_wrong`. Đúng → `ch4_banner_ward_broken` (`solved_fallen_arms_array`).

**C3.1 · Ghép Hiệp Ước** (4 ô trên bàn đá, mỗi ô 1 vòng xoay 4 mảnh + POI "Đóng ấn"). Lấy mảnh ở đâu:

- Đất Đai và Tù Binh: Cánh Đồng Tro.
- Nguồn Nước: Kaelen trao (nhánh A) hoặc bới trong đổ nát (nhánh B).
- Lời Thề: Elion trao sau Lựa chọn 3 (cả hai nhánh).

Manh mối:

- Triện tròn nguyên vẹn chỉ dùng ở phiên đầu (ghi trên mảnh Đất Đai).
- Ghi chú lề mảnh Tù Binh: _bàn sau khi ranh giới đất đã ngã ngũ_.
- Mảnh Nguồn Nước mang triện vỡ góc, thứ chỉ có từ phiên thứ ba.
- Lời thề và chữ ký luôn ở cuối.
- **Elion kể sai** (`ch4_elion_talk`): ông khẳng định nguồn nước được bàn đầu tiên để che giấu phiên ông đánh cắp hiệp ước. Người chơi phải tin bằng chứng, không tin lời sử quan.
- **Đáp án:** Đất Đai → Tù Binh → Nguồn Nước → Lời Thề. Sai → `ch4_treaty_wrong`. Đúng → `restored_peace_treaty`.

**C3.2 · Nghi Thức Ba Trụ (trong trận The Last War).** Ba trụ là lệnh môi trường (phím 6/7/8 như Dàn Hợp Xướng). Không trụ nào cần vật phẩm, để không ai bị kẹt:

- **Trụ Bàn Tay Mở** — tha thứ (Renard).
- **Trụ Lá Thư** — chấp nhận (Aldric).
- **Trụ Ngọn Nến** — ghi nhớ (hiệp ước).
- Thứ tự lấy từ văn bia trên bàn thờ Đài Tưởng Niệm (`ch4_monument_altar_inspect`): _"Mở tay cho kẻ đã đẩy ta xuống vực; đọc nốt lá thư người cha chưa dám đọc; rồi thắp một ngọn nến cho những cái tên."_ → Bàn Tay → Lá Thư → Ngọn Nến.
- Pha 2: HP về 0 → hồi 40%, mở lệnh trụ. Sai thứ tự → ba trụ tắt, boss phản đòn. Đủ 3 → đòn kế tiếp là nhát chém Finality.
- Nếu đã giải quyết nhiệm vụ Bran (bất kỳ nhánh nào), Trụ Ngọn Nến làm boss choáng thêm 1 lượt (phần thưởng, không bắt buộc).

**Ẩn · Mộ Người Đầu Tiên (vũ khí ẩn).** Lối xuống mở ở xác xe chiến cháy trên Cánh Đồng Tro. Bản danh sách của Bran có câu: _"những người ngã đầu tiên nằm dưới cỗ xe cháy"_. Trong mộ có 4 bệ đánh số I–IV, dùng vòng xoay 4 binh khí. Văn bia `first_fallen_epitaph`: _"Kỵ mã ngã trước khi xạ thủ kịp giương cung; bộ binh ngã ngay sau kỵ mã; người cầm cờ là kẻ đứng sau cùng."_ → I cán dài · II lưỡi rộng · III thanh cong · IV sào vải. Đúng → `spear_of_finality`.

**Ẩn · Mật Lệnh Lính Gác (bùa ẩn, thay vai trò "ẩn" của Thấu Kính).** Hầm trú ẩn dưới Trường Lũy có hồn lính gác đòi đáp mật lệnh (vòng xoay 4 từ: Lửa / Củi / Khói / Than + POI "Đáp lời").

- `sentry_codebook_page` (Chiến Hào): _Đêm thứ nhất hỏi "Băng" — đáp "Nước". Đêm thứ hai hỏi "Rượu" — đáp "Nho"._ (Đáp bằng thứ có trước khi biến đổi.)
- Renard (lời giãi bày): _đêm nay lính gác hỏi "Tro"_.
- **Đáp án:** Củi. Sai → `ch4_sentry_wrong` (lính gác chĩa giáo đẩy Peter ra, không mất máu). Đúng → `last_light_charm`.

### 13.4. Lựa chọn — bản đã duyệt

| Lựa chọn                                                                  | Khi nào                                                                                                                                                                                 | Nhánh A → thưởng                                                                                 | Nhánh B → thưởng                                                                                                                                                            |
| :------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Aldric** (chính)                                                     | **Dời về Đài Tưởng Niệm**, sau khi ghép hiệp ước. Aldric và Kaelen gặp nhau, ghép hai nửa ngọc bội (`ch4_jade_reunited`); Peter đưa lá thư Maelis (lá thư cuối, chữ đã run vì tuổi già) | Nói thật → Aldric khóc, buông kiếm, tan thanh thản. `ashes_of_peace_charm` (maxHp 34, defense 5) | Nói dối nhân từ → Aldric mỉm cười ra đi; Kaelen biết sự thật và trách Peter tước của bạn mình quyền được khóc. `vow_of_the_father_blade` (attack 13, reach 38, swingMs 300) |
| **2. Bran** (phụ)                                                         | Sau Trường Lũy, lần chết thứ 1.428                                                                                                                                                      | Giải thoát → `dreamless_rest_charm` (maxMp 20, defense 2, speed 3)                               | Khắc tên mẹ lên bia → `mothers_name_carving` (attack 3, maxHp 20)                                                                                                           |
| **3. Elion** (**chuyển thành chính**, nằm trong `quest_ch4_broken_peace`) | Tiền Đồn Sol-Karis, sau khi Elion thú nhận                                                                                                                                              | Đốt bộ sử → `ember_quill_charm` (maxMp 16, attack 2, speed 2)                                    | Viết tiếp chương sám hối → `atonement_chronicle` (charm: defense 4, maxHp 24)                                                                                               |

Aldric rời đi ở cả hai nhánh, nên các cảnh sau không phụ thuộc lựa chọn. Cờ giữ như §12.4. Các chỉ số không có trong game (giảm % sát thương, % chí mạng, miễn choáng, +% EXP, hồi máu khi giết, MP vĩnh viễn) đã bỏ. Bỏ `historian_tear_ink`.

### 13.5. Trang bị, quái, boss, cấp độ

- `spear_of_finality`: attack 14, reach 46, swingMs 400 (vũ khí ẩn). `interval_lens_charm`: quà Kuro để lại (cốt truyện, không cần giải đố): maxHp 26, maxMp 14, defense 4, speed 2. `last_light_charm` (bùa ẩn): maxHp 30, maxMp 16, defense 4, speed 3.
- `map_ch4_interval_sanctuary` là **bản đồ chính** (cảnh kết chương), không phải bản đồ ẩn. Bản đồ ẩn: Mộ Người Đầu Tiên và Hầm Trú Ẩn (`map_ch4_sentry_cellar`, 16×12, mới).
- Quái: Xạ Thủ có đường ngắm đỏ 1,2 giây, né bằng Shift hoặc nấp. Đội hình khiên chặn 180° phía trước; Đòn Thời Gian phá thế khiên 2 giây. Lính Cầm Cờ: quái chết trong vòng 4 ô hồi sinh sau 3 giây với 50% máu.
- Boss giữa **Chiêu Mộ Oan Hồn**: mỗi 3 lượt dựng Tường Khí Máu (giảm 75% sát thương nhận) với 2 dây linh hồn. Lệnh môi trường "Chém dây" ×2 phá tường.
- Máu và chỉ số boss: Claude chỉnh khi thử trận (mốc tham chiếu: boss giữa ~450, boss cuối ~700; 1.200/2.400 ở §8 bị bỏ).
- Peter vào chương ở Lv 15, trần cuối chương Lv 18 (cờ `finality_seal_restored`). Claude mở rộng bảng EXP.
- `warfield_tileset` **được duyệt làm mới** (Pipeline B, owner duyệt hình). Ngoại hình Kuro theo §10.2 (~26 tuổi), owner duyệt hình riêng.

### 13.6. Nhiệm vụ (thay §9.1 / §12.2)

Tất cả `"chapter": 4`. `quest_ch3_nameless_choir.followUpQuestId` = `quest_ch4_vale_of_banners`.

| Quest                        | Loại | Mục tiêu (`completeOnFlag`)                                                                               | Nối tiếp         |
| :--------------------------- | :--- | :-------------------------------------------------------------------------------------------------------- | :--------------- |
| `quest_ch4_vale_of_banners`  | main | `met_general_aldric`                                                                                      | letter_unsent    |
| `quest_ch4_letter_unsent`    | main | `opened_courier_box`; `reached_solkaris`                                                                  | arrow_storm      |
| `quest_ch4_arrow_storm`      | main | `silenced_arrow_storm`                                                                                    | crimson_standard |
| `quest_ch4_crimson_standard` | main | `solved_fallen_arms_array`; `defeated_crimson_standard`                                                   | broken_peace     |
| `quest_ch4_broken_peace`     | main | `cleared_ramparts_ambush`; `resolved_chronicler_elion`; `restored_peace_treaty`; `resolved_aldric_letter` | the_last_war     |
| `quest_ch4_the_last_war`     | main | `defeated_the_last_war`; `met_kuro_first_time`                                                            | —                |
| `quest_ch4_soldier_count`    | side | `resolved_soldier_bran`                                                                                   | —                |
| `quest_ch4_first_fallen`     | side | `opened_first_fallen_tomb`                                                                                | —                |
| `quest_ch4_last_sentry`      | side | `answered_sentry`                                                                                         | —                |

Bỏ `quest_ch4_chronicler_guilt` (Elion đã chuyển vào nhiệm vụ chính). Mục tiêu nhiệm vụ không được nhắc đáp án (vd. không viết "rọi về Tây Bắc", "đáp Củi").

### 13.7. ID bổ sung / đổi (thay §12 ở các dòng trùng)

- **Vật phẩm mới:** `quartermaster_ledger`, `bran_company_roster`, `first_fallen_epitaph`, `sentry_codebook_page` (document); `relic_long_haft`, `relic_wide_blade`, `relic_curved_limb`, `relic_tattered_pole`, `maelis_letter` (puzzle); `ember_quill_charm`, `atonement_chronicle`, `last_light_charm` (charm).
- **Đổi tên/bỏ:** `alder_family_letter` → `maelis_letter`. `broken_lance`/`cracked_broadsword`/`split_shortbow`/`snapped_standard_pole` → 4 `relic_*`. Bỏ `field_medic_note`, `historian_tear_ink`.
- **Node mới:** `ch4_mounds_wrong`, `ch4_treaty_wrong`, `ch4_sentry_challenge`, `ch4_sentry_wrong`, `ch4_sentry_answered`, `ch4_elion_talk`, `ch4_elion_choice`, `ch4_elion_burn`, `ch4_elion_chronicle`, `ch4_aldric_kaelen_reunion`, `ch4_aldric_truth`, `ch4_aldric_comfort`, `ch4_bran_choice`, `ch4_bran_release`, `ch4_bran_memorial`, `ch4_chariot_passage`, `ch4_tomb_first_fallen_wrong`, `ch4_kaelen_cold` (nhánh B), `ch4_waters_rubble_find` (nhánh B), `ch4_ramparts_ambush_cleared`.
- **Cờ mới:** `reached_solkaris`, `ch4_solkaris_store_lost`, `ch4_jade_reunited`, `cleared_ramparts_ambush`, `answered_sentry`, `opened_chariot_passage`, `ch4_choice_bran_*`, `ch4_choice_elion_*` như §12.4.
- **Phân công:** Claude gắn các dialogue node vào bản đồ và làm phần engine: vòng xoay, cân, mưa tên, xạ thủ, lính cầm cờ, hiệu ứng hồi tưởng, ba trụ nghi thức, Tường Khí Máu.

### 13.8. Quái cần khéo léo & canh nhịp (owner duyệt 2026-11-14, Claude làm)

Mỗi quái có một cách chơi an toàn và một cách chơi khéo tay; cách khéo tay được thưởng.

- **Xạ Thủ Vô Hồn — né hoàn hảo.** Đứng yên ngoài tầm chém, chiếu tia ngắm đỏ lên Peter. **0,25 giây cuối** tia chuyển trắng rồi bắn.
  - Né (Shift) đúng lúc tia trắng: mũi tên trượt, chữ "Né hoàn hảo!", Peter hồi 3 MP.
  - Né sớm khi tia còn đỏ: xạ thủ ngắm lại, vẫn trúng.
  - Trúng tên: mất nhiều máu và choáng 0,5 giây.
  - Có đá hoặc tường chắn giữa xạ thủ và Peter lúc bắn: tên cắm vào vật chắn.
- **Đội Hình Trùng Điệp — gạt giáo.** Khiên chặn toàn bộ phía trước (như búp bê cơ khí Chương 2). Trước khi đâm, mũi giáo **lóe trắng 0,25 giây**.
  - Chém trúng ngay lúc lóe: "Gạt giáo!", lính mất thăng bằng, khiên hạ 1,5 giây (chém trực diện được).
  - Đòn Thời Gian cũng phá thế khiên 2 giây.
  - Vòng ra sau lưng vẫn chém được như cũ.
- **Lính Cầm Cờ — nhịp hát.** Giương cờ hát 2 giây (khiên cờ đỏ, chém không vào) rồi hạ cờ lấy hơi 1 giây (chém được).
  - Quái gục trong vòng 4 ô quanh lính cầm cờ **đứng dậy với 50% máu ở đầu câu hát kế tiếp**.
  - Phần thưởng và cờ "dọn sạch nhóm" chỉ tính khi quái gục hẳn: lúc hồi sinh không còn lính cầm cờ nào gần đó, hoặc lính cầm cờ đã chết.
- **Kỵ Sĩ Bất Tử (quái mới, `enemy_undying_knight`) — lao thẳng.**
  - Dậm chân báo hiệu 0,6 giây, trong lúc đó vẫn xoay theo Peter. Hướng lao **chốt ở cuối nhịp dậm**.
  - Né sớm: nó vẫn nhắm trúng. Né khi nó đã lao: nó lao thẳng qua.
  - Lao vào tường, hàng rào cọc hay đá: choáng 2 giây, nhận **gấp đôi** sát thương.
  - Lao trúng Peter: sát thương ×1,5.
  - Đặt ở Sống Núi Máu và Trường Lũy, gần hàng rào cọc.
- **Đỡ đòn đúng nhịp trong trận boss theo lượt.** Khi boss ra đòn, một vòng sáng thu nhỏ quanh Peter. Bấm **Space** khi vòng chạm viền (cửa sổ khoảng 0,2 giây): sát thương giảm một nửa, chữ "Đỡ!".
  - Bấm sớm hoặc trễ: không có tác dụng, phải chờ tới đòn sau.
  - Boss giữa: vòng thu đều nhịp.
  - Boss cuối: có đòn nhử — vòng chớp ở giữa chừng như sắp chạm rồi thu tiếp; ai bấm theo cú chớp sẽ hụt.
  - Áp dụng cho boss Chương 4 trở đi (`timedBlock` trong `enemies.json`).
