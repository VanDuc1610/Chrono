# CHRONO – Thiết Kế Chi Tiết Chương 6: Giờ Của Chư Thần (The Hour of the Gods)

**Tài liệu:** Kịch bản, Cơ chế, Câu đố & Dữ liệu Chương 6  
**Quyền năng chủ đạo:** **Origin** (Khởi Nguyên / Cội Nguồn)  
**Phân hệ:** Narrative & Gameplay Specification: Chapter 6  
**Tham chiếu canon:** `CHRONO_STORY_BIBLE.md` §12, `CANON_AND_OPEN_QUESTIONS.md`, `CHARACTER_BIBLE.md`, `LORE_AND_COSMOLOGY.md`, `CHAPTER_04_DESIGN.md`, `CHAPTER_05_DESIGN.md`, `CHAPTER_05_EXPANSION.md` (§9 Claude Review), `scripts/content-ch5.mjs`, `scripts/content-ch5x.mjs`  
**Tác giả:** Antigravity (Implementation Agent)  
**Trạng thái:** Đề xuất hoàn chỉnh — Chờ Claude review và Project Owner phê duyệt

---

## 1. Tiền Đề & Cái Giá Cảm Xúc Của Peter

### 1.1. Bối cảnh: Cõi Thiên Giới Đổ Nát (The Celestial Realm)

Sau khi giải quyết biến cố va chạm thực tại tại The Interval ở cuối Chương 5, chiếc cầu thang ánh sáng dẫn Peter (và Kuro, tùy lựa chọn) bước qua Cổng Ngưỡng thứ sáu để tiến vào **The Celestial Realm** (Cõi Trời / Thượng Giới).

Đây không phải là một thiên đàng lộng lẫy nguyên vẹn như trong truyền thuyết của các giáo hội cổ, mà là một **phế tích vũ trụ tráng lệ trong đổ nát**:

- Những bánh răng thiên thể khổng lồ bằng bạch kim và hoàng ngọc bị kẹt cứng, phủ đầy bụi sao xám xịt.
- Bầu trời phía trên nứt toác từng mảng lớn, để lộ ra khoảng không đen ngòm của hư vô sơ khai.
- Kiến trúc mang phong cách đền đài Hy Lạp cổ pha lẫn cơ khí đồng hồ vũ trụ cực kỳ tinh vi.
- Nơi đây hoàn toàn vắng bóng sự sống phàm trần; chỉ còn lại những Dư ảnh ánh sáng của các Archon bảo hộ và những cỗ máy tự động vẫn lặp lại các nghi thức khởi nguyên trong vô vọng.

Quyền năng ngự trị ở đây là **Origin** (Khởi Nguyên): Quyền năng quy định cái gì được phép bắt đầu, bản thể gốc và tính hợp pháp của mọi sự tồn tại. Khi Origin bị tổn thương và mất cân bằng, sự vật sinh ra mà không có nguồn gốc, thời gian không thể tiến tới tương lai, và toàn bộ vũ trụ rơi vào trạng thái "tiền khai sinh" chập chờn.

### 1.2. Cái giá cảm xúc & Động lực cá nhân của Peter

1. **Đối diện với cội nguồn rỗng không:** Suốt 5 chương, Peter tin rằng mình là một người thợ sửa đồng hồ bình thường ở Khánh Hòa bị cuốn vào biến cố. Tại Celestial Realm, những mảnh bích họa và văn bia cổ dần bóc trần sự thật cay đắng: Peter là **The Unwritten** — một thực thể sinh ra từ kẽ nứt giữa Origin và Finality trong Vụ Phân Tách (The Great Fracture). Cậu chưa từng có tên trong sổ bộ thế giới.
2. **Ký ức nhỏ bé đối đầu với chân lý vũ trụ:** Dù biết bản thân có thể là một "mảnh vật chất trung hòa" nhân tạo, Peter vẫn bám chặt vào những ký ức trần thế bình dị: tiếng sóng biển Khánh Hòa, mùi dầu máy trên ngón tay, chiếc đồng hồ quả quýt của ông nội, và lời hứa tuổi thơ với Kuro. Sự giằng xé giữa vị thế "cứu tinh vũ trụ" và khao khát được làm một con người bình thường là trục cảm xúc chính của Peter.
3. **Mối quan hệ với Kuro ở bước ngoặt sinh tử:** Kuro đồng hành cùng Peter (hoặc bám đuổi Peter) lên tới đây. Tại cái nôi của sự sáng tạo, Kuro muốn dùng quyền năng Origin để viết lại toàn bộ thực tại, xóa bỏ cơ chế cắt tỉa để giải phóng tất cả các thế giới bị bỏ rơi. Peter nhìn thấy nguy cơ hủy diệt của mong muốn đó: nếu không có ranh giới, mọi thực tại sẽ sụp đổ vào **Null Hour**. Hai người bạn từ thuở nhỏ giờ đây đứng trước ngã rẽ định mệnh, nhưng chưa bước vào trận chiến cuối cùng.

### 1.3. Vị thế của Chương 6 trong mạch truyện dài

> [!IMPORTANT]
> **Chương 6 KHÔNG PHẢI LÀ CHƯƠNG CUỐI.**
> Trận đối đầu ba bên sinh tử (Chronos – Kuro – Peter) và 3 kết thúc lớn (_The Eternal Order / The Unbound Eternity / The Last Chronarch_) **tuyệt đối không diễn ra ở Chương 6**. Chương 6 đóng vai trò là "màn khám phá bí ẩn vĩ đại nhất" — nơi mọi bức màn che giấu chân tướng của vũ trụ được kéo lên, tích tụ xung đột lên đỉnh điểm, và khép lại bằng một **cliffhanger** chấn động chuẩn bị cho các chương tiếp theo.

---

## 2. Cơ Chế Trung Tâm Mới: Chữ Khởi Nguyên & Định Danh Thực Tại (Origin Glyphs)

Để không lặp lại bất kỳ cơ chế nào của các chương trước (tầng thời gian Ch1, chuyển nhánh Ch5, vòng xoay dial, cân đĩa Ch4, đếm giờ cầu chuông Ch3), Chương 6 giới thiệu một cơ chế tư duy ngôn ngữ học cổ đại:

### 2.1. Bản chất cơ chế

Trong cõi Celestial Realm, mọi quy luật vật lý và vật thể đều được viết bằng **Cổ Ngữ Khởi Nguyên (Origin Glyphs)** — ngôn ngữ mà Chronos dùng để định hình vạn vật.

- Toàn bộ chương gồm đúng **7 Ký Tự Khởi Nguyên** cơ bản.
- **Không có bảng dịch sẵn trong túi đồ.** Người chơi phải tự học ý nghĩa của từng ký tự thông qua việc quan sát thế giới, đối chiếu các bia đá song ngữ (chữ cổ khắc cạnh chữ Quốc ngữ) và bối cảnh kiến trúc.
- Khi người chơi tương tác với một **Đài Định Danh (Inscription Altar)**, một giao diện 7 phiến đá cổ xuất hiện. Người chơi chọn ghép từ 1 đến 3 ký tự để tạo thành một "Mệnh Lệnh Khởi Nguyên" nhằm tương tác với thực tại.

### 2.2. Bảy Ký Tự Khởi Nguyên & Cách dạy người chơi

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│   [A]   │   [O]   │   [I]   │   [U]   │   [E]   │   [N]   │   [X]   │
│  SÁNG   │   TỐI   │  DÒNG   │  TĨNH   │   VẬT   │   TÊN   │  KHÔNG  │
│ (Lumen) │(Umbra)  │(Fluctus)│ (Stasis)│(Materia)│ (Nomen) │ (Nihil) │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

1. **Cách dạy tiến tuần tự (Pacing):**
   - **Bài học mở đầu (Bản đồ 2):** Cổng vòm đầu tiên bị chặn bởi một màn ánh sáng chói lòa. Cạnh đó có 2 tấm bia khắc ký hiệu `[A]` bên hình mặt trời và `[X]` bên khoảng trống rỗng. Tấm bia ghi: _"Muốn đi qua, hãy biến Ánh Sáng thành Hư Vô."_ Người chơi chọn ghép `[A]` + `[X]` ➔ Màn sáng tan biến.
   - **Bài học nâng cao (Bản đồ 5–9):** Ghép 2–3 ký tự để giải quyết địa hình:
     - `[I]` (Dòng) + `[U]` (Tĩnh) = Đóng băng thác ánh sáng đang tuôn chảy để tạo thành bậc thang băng bước qua vực.
     - `[E]` (Vật) + `[A]` (Sáng) = Làm một cây cầu tàng hình phát sáng để nhìn thấy đường đi an toàn giữa mê cung sương mù.
     - `[N]` (Tên) + `[X]` (Không) = "Vô Danh" — xóa bỏ lệnh truy lùng của các cỗ máy Sentinel bảo vệ.
   - **Thử thách tối hậu (Bản đồ 14–15):** Đọc và khôi phục một đoạn chiếu thư khởi nguyên dài bị đục khoét để mở lối vào Điện Thờ Tối Cao.

---

## 3. Luồng Chơi & Hệ Thống Bản Đồ (16 Bản Đồ, 150–180 Phút)

Chương 6 có quy mô tương đương Chương 5, gồm **16 bản đồ** chia làm **4 Hồi (Acts)**:

```
[HỒI 1: BẬC THANG THIÊN GIỚI] (Bản đồ 1 ➔ 4)
  1. map_ch6_celestial_stairs (Bậc Thang Bạch Kim)
  2. map_ch6_outer_courtyard (Tiền Sân Khởi Nguyên) ──▶ [C01: Khắc Ấn Đầu Tiên]
  3. map_ch6_hall_of_pillars (Điện Trụ Thiên Thể) ──▶ [C02: Trục Ánh Sáng Khúc Xạ]
  4. map_ch6_herald_roost (Đài Vọng Sứ Giả) ──▶ Mini-Boss: The Broken Herald

[HỒI 2: ĐỀN TÍCH VỤ PHÂN TÁCH] (Bản đồ 5 ➔ 8)
  5. map_ch6_fracture_nave (Chính Điện Phân Tách) ──▶ [C03: Trụ Năng Lượng Lục Phân]
  6. map_ch6_gallery_of_eras (Phòng Trưng Bày Kỷ Nguyên) ──▶ [C04: Bích Họa Thứ Tự Suy Tàn]
  7. map_ch6_frozen_cascade (Thác Ánh Sáng Đóng Băng) ──▶ [C05: Cầu Thang Ngôn Từ]
  8. map_ch6_archives_ruins (Thư Khố Thiên Đình) ──▶ [C06: Bảng Phán Quyết Ba Archon]
     └─ [ẨN A] map_ch6_secret_chronos_cell (Mật Thất Ký Ức Chronos) ──▶ [C11: Bí Mật Ký Ức]

[HỒI 3: TRÁI TIM KHỞI NGUYÊN] (Bản đồ 9 ➔ 12)
  9. map_ch6_genesis_core (Lõi Máy Khởi Nguyên) ──▶ [C07: Cân Bằng Hài Hòa Thiên Cầu]
  10. map_ch6_bell_sanctuary (Thánh Điện Chuông Câm) ──▶ [C08: Khúc Thơ Chuông Khởi Nguyên]
  11. map_ch6_refraction_maze (Mê Cung Khúc Xạ Tinh Thể) ──▶ [C09: Lăng Kính Phân Rã]
  12. map_ch6_threshold_gate (Cổng Ngưỡng Thần Thể) ──▶ [C10: Bản Thể Kẻ Vô Danh]
      └─ [ẨN B] map_ch6_celestial_chessboard (Bàn Cờ Thiên Thể) ──▶ [C12: Thế Cờ Khởi Nguyên]

[HỒI 4: ĐẠI ĐIỆN VÀ VẾT NỨT SƠ KHAI] (Bản đồ 13 ➔ 16)
  13. map_ch6_sanctum_approach (Đường Dẫn Điện Thờ) ──▶ Elite: The Remnant Deacon
  14. map_ch6_hall_of_thrones (Đại Điện Ngai Vàng Chronos) ──▶ Main Boss: The Genesis Warden
  15. map_ch6_first_void_abyss (Vực Thẳm Hư Không Sơ Khai) ──▶ Đại Cliffhanger / Kết thúc dở dang
  16. [ẨN C] map_ch6_first_forgotten_nook (Hốc Đá Kẻ Đầu Tiên) ──▶ [C13: Tàn Tích Hư Vô] / Boss Ẩn
```

### Bảng thông số 16 bản đồ

| Mã bản đồ                      | Tên bản đồ                    | Kích thước | Tileset             | Nội dung chính                                                          |
| :----------------------------- | :---------------------------- | :--------- | :------------------ | :---------------------------------------------------------------------- |
| `map_ch6_celestial_stairs`     | Bậc Thang Bạch Kim            | 24×16      | `celestial_tileset` | Peter và Kuro bước lên từ Interval; nhận diện bầu trời rạn nứt.         |
| `map_ch6_outer_courtyard`      | Tiền Sân Khởi Nguyên          | 28×18      | `celestial_tileset` | Cổng chữ cổ đầu tiên; học 2 ký tự `[A]` và `[X]`.                       |
| `map_ch6_hall_of_pillars`      | Điện Trụ Thiên Thể            | 30×20      | `celestial_tileset` | Trụ gương khúc xạ ánh sáng; quái Aether Sentinel.                       |
| `map_ch6_herald_roost`         | Đài Vọng Sứ Giả               | 22×16      | `celestial_tileset` | Mini-Boss **The Broken Herald**; đối thoại về vị trí của Chronos.       |
| `map_ch6_fracture_nave`        | Chính Điện Phân Tách          | 32×20      | `celestial_tileset` | Nơi Vụ Phân Tách xảy ra; tàn tích 6 bệ thờ Authority.                   |
| `map_ch6_gallery_of_eras`      | Phòng Trưng Bày Kỷ Nguyên     | 26×18      | `celestial_tileset` | Trưng bày 6 thời kỳ; câu đố thứ tự suy tàn; học ký tự `[I]`, `[U]`.     |
| `map_ch6_frozen_cascade`       | Thác Ánh Sáng Đóng Băng       | 26×20      | `celestial_tileset` | Thác quang năng lỏng; cơ chế đóng băng dòng chảy tạo lối đi.            |
| `map_ch6_archives_ruins`       | Thư Khố Thiên Đình            | 30×20      | `celestial_tileset` | Sách đá cổ; câu đố bảng chân lý Archon; lối vào Ẩn A.                   |
| `map_ch6_genesis_core`         | Lõi Máy Khởi Nguyên           | 28×20      | `celestial_tileset` | Động cơ bánh răng thời gian vũ trụ bị kẹt; quái Archon Construct.       |
| `map_ch6_bell_sanctuary`       | Thánh Điện Chuông Câm         | 24×18      | `celestial_tileset` | Chuông không lưỡi; giải mã văn thơ cổ; nhận diện First Forgotten.       |
| `map_ch6_refraction_maze`      | Mê Cung Khúc Xạ               | 30×22      | `celestial_tileset` | Mê cung quang học đa chiều; đối chiếu lăng kính đổi màu.                |
| `map_ch6_threshold_gate`       | Cổng Ngưỡng Thần Thể          | 26×18      | `celestial_tileset` | Cửa kiểm tra bản thể Unwritten; lối vào Ẩn B.                           |
| `map_ch6_sanctum_approach`     | Đường Dẫn Điện Thờ            | 32×16      | `celestial_tileset` | Trận phục kích tinh nhuệ của The Remnant Deacon; thử thách né hoàn hảo. |
| `map_ch6_hall_of_thrones`      | Đại Điện Ngai Vàng            | 30×22      | `celestial_tileset` | Ngai vàng Chronos vỡ vụn; Main Boss **The Genesis Warden**.             |
| `map_ch6_first_void_abyss`     | Vực Thẳm Hư Không             | 28×18      | `celestial_tileset` | Điểm kết chương: vết nứt vũ trụ mở ra kén First Forgotten; cliffhanger. |
| `map_ch6_secret_chronos_cell`  | Mật Thất Ký Ức Chronos (Ẩn A) | 20×14      | `celestial_tileset` | Mật thất ẩn; hồi tưởng góc nhìn Chronos lúc phân tách.                  |
| `map_ch6_celestial_chessboard` | Bàn Cờ Thiên Thể (Ẩn B)       | 22×16      | `celestial_tileset` | Câu đố cờ thiên văn; vũ khí huyền thoại `origin_astral_blade`.          |
| `map_ch6_first_forgotten_nook` | Hốc Đá Kẻ Đầu Tiên (Ẩn C)     | 20×14      | `celestial_tileset` | Nơi phong ấn cổ sơ; Boss ẩn **Echo of the First Forgotten**.            |

---

## 4. Tuyến Nhân Vật & Đối Thoại

### 4.1. Peter – Thợ Sửa Đồng Hồ Đứng Trước Nguồn Cội

- Peter giữ vững nhận diện: nam thanh niên 26 tuổi, tóc xoăn ngắn bồng bềnh, áo khoác xanh tro bất đối xứng, thanh kiếm gãy ánh thiên thanh bên hông.
- Peter không đột ngột hóa thành thần thánh. Cậu nhìn các bánh răng khổng lồ của vũ trụ bằng con mắt của một người thợ thủ công: _"Cỗ máy nào càng lớn thì khi một chiếc chốt nhỏ gãy, sự sụp đổ lại càng khủng khiếp."_
- Cậu từ chối để cội nguồn vũ trụ tước đoạt danh tính con người của mình.

### 4.2. Kuro – Ngọn Lửa Tự Do Cận Kề Vực Thẳm

- **Xưng hô:** Nhất quán xưng **"tao – mày"** với Peter trong mọi tình huống.
- **Trạng thái tâm lý:** Kuro đang dần bị quyền năng Possibility thiêu đốt trí nhớ. Anh nhìn thấy cơ hội tối thượng tại Celestial Realm để "sửa chữa toàn bộ thế giới", nhưng sự nôn nóng khiến anh dễ bị mù quáng trước hiểm họa của Null Hour.
- **Phân nhánh hành vi theo lựa chọn Chương 5:**
  - _Nếu ở Ch5 chọn giúp Kuro (`ch5_choice_help_kuro`) hoặc kéo một phần (`ch5_choice_partial_pull`):_ Kuro đi cạnh Peter trong đội hình bản đồ, hỗ trợ chiến đấu bằng đòn bẻ cong thực tại, cùng thảo luận khi giải đố Chữ Khởi Nguyên.
  - _Nếu ở Ch5 chọn ngăn Kuro (`ch5_choice_stop_kuro` / `kuro_left`):_ Kuro đi trước một bước, Peter lần theo những vết chém tím và quái bị hạ gục; thỉnh thoảng hai người chạm mặt ở các cửa ải then chốt với những cuộc tranh luận nảy lửa đầy đau đớn.

### 4.3. Sứ Giả Gãy Cánh (The Broken Herald)

- Vị sứ thần cổ đại của Chronos mang đôi cánh bằng kim loại rỉ sét và mạng che mặt bằng bạc.
- Không phải kẻ thù hung bạo, mà là một kẻ canh cổng kiệt quệ: _"Người chờ đợi sự trở lại của Chủ Nhân suốt mười ngàn chu kỳ... nhưng ngai vàng từ lâu đã lạnh ngắt."_

---

## 5. Hệ Thống Câu Đố (10 Câu Chính + 3 Câu Ẩn)

> [!CAUTION]
> **Quy tắc thiết kế câu đố nghiêm ngặt (Bài học từ Chương 2–5):**
>
> 1. Manh mối **không được nói thẳng đáp án**. Phải qua 2–3 bước đối chiếu logic.
> 2. **Tuyệt đối không có yếu tố canh giờ (timer pressure)** trong các câu đố suy luận (loại trừ bài học Ch5 EX-07).
> 3. Bảng chân lý phải được kiểm chứng toán học, bảo đảm **nghiệm duy nhất**, không mâu thuẫn.
> 4. Không dùng các chỉ số không có trong code engine.

### Bảng tóm tắt 13 câu đố

| Mã      | Tên câu đố                    | Bản đồ                 | Phương thức suy luận                               | Độ khó     | Thưởng chính                  |
| :------ | :---------------------------- | :--------------------- | :------------------------------------------------- | :--------- | :---------------------------- |
| **C01** | Khắc Ấn Đầu Tiên              | `outer_courtyard`      | Đối chiếu song ngữ chữ cổ & khái niệm triệt tiêu   | Dễ         | Mở cổng Tiền Sân              |
| **C02** | Trục Ánh Sáng Khúc Xạ         | `hall_of_pillars`      | Quang học góc 45° + Đổi màu ánh sáng qua lăng kính | Dễ-TB      | Mở đường lên Đài Vọng         |
| **C03** | Trụ Năng Lượng Lục Phân       | `fracture_nave`        | Loại trừ thuộc tính sáu Authority qua văn bia      | Trung bình | `celestial_amber_shard`       |
| **C04** | Bích Họa Thứ Tự Suy Tàn       | `gallery_of_eras`      | Sắp xếp trình tự lịch sử theo nguyên lý entropy    | Trung bình | Nhận ký tự `[I]`, `[U]`       |
| **C05** | Cầu Thang Ngôn Từ             | `frozen_cascade`       | Ghép cú pháp 2 ký tự điều khiển trạng thái vật lý  | Khá        | Qua vực thác quang năng       |
| **C06** | Bảng Phán Quyết Ba Archon     | `archives_ruins`       | Bảng chân lý logic 3 nhân chứng (Thật / Dối / Đảo) | Khá-Khó    | Mở kho lưu trữ & Chìa Ẩn A    |
| **C07** | Cân Bằng Hài Hòa Thiên Cầu    | `genesis_core`         | Tỷ lệ hòa âm toán học 3 bánh răng thiên thể        | Khó        | Kích hoạt Lõi Máy Khởi Nguyên |
| **C08** | Khúc Thơ Chuông Câm           | `bell_sanctuary`       | Giải mã ẩn dụ thơ ca thành chuỗi gõ ký âm          | Khó        | Bùa `echoing_origin_bell`     |
| **C09** | Lăng Kính Phân Rã             | `refraction_maze`      | Đường đi khúc xạ ánh sáng qua 4 phòng liên hoàn    | Rất khó    | Mở lối sang Cổng Ngưỡng       |
| **C10** | Bản Thể Kẻ Vô Danh            | `threshold_gate`       | Khắc danh tính phủ định (Phép trừ tự thân)         | Rất khó    | Mở Đại Điện Ngai Vàng         |
| **C11** | [ẨN A] Mật Thất Ký Ức Chronos | `secret_chronos_cell`  | Đối chiếu hồi ức phân tách với tọa độ sao          | Khó        | Mảnh Bích Họa Khởi Nguyên     |
| **C12** | [ẨN B] Thế Cờ Khởi Nguyên     | `celestial_chessboard` | Câu đố cờ thiên văn 4 nước đi không lặp lại        | Rất khó    | Vũ khí `origin_astral_blade`  |
| **C13** | [ẨN C] Tàn Tích Hư Vô         | `first_forgotten_nook` | Ghép cổ tự phủ định tối thượng giải phong ấn       | Cực khó    | Bùa `null_origin_insignia`    |

---

### Chi tiết 13 câu đố

#### C01 · Khắc Ấn Đầu Tiên

- **Vị trí:** Cửa lớn `map_ch6_outer_courtyard`.
- **Đầu vào tương tác:** 1 Bệ Khắc Ấn (`ch6_altar_gate_1`) gồm 2 khe cắm ký tự. Danh sách lựa chọn hiển thị 2 ký tự đã học: `[A]` (Sáng), `[X]` (Không).
- **Manh mối:**
  1. _Bia đá bên trái (`ch6_poi_stele_sun`):_ Khắc hình mặt trời tỏa tia sáng, phía dưới là ký tự `[A]` kèm chữ Quốc ngữ: "Ánh Sáng ban sơ".
  2. _Bia đá bên phải (`ch6_poi_stele_void`):_ Khắc hình khoảng trống rỗng tròn, phía dưới là ký tự `[X]` kèm chữ: "Khoảng Không / Biến mất".
  3. _Chữ khắc trên vòm cửa (`ch6_poi_gate_inscription`):_ "Cánh cổng chỉ mở ra khi kẻ đến biết xóa tan bức màn rực rỡ để đón nhận sự tĩnh lặng ban đầu."
- **Suy luận logic:** Cần ghép cặp khái niệm mang ý nghĩa "Làm cho Ánh Sáng biến mất" ➔ Ghép ký tự `[A]` (Sáng) theo sau bởi `[X]` (Không/Biến mất).
- **Đáp án:** `[A]` + `[X]`.
- **Sai phạt & phản hồi:** Màn ánh sáng lóe lên đẩy lùi Peter; dòng chữ hiện ra: _"Ánh sáng vẫn chưa chịu nhường lối."_
- **Phần thưởng:** Màn sáng tan biến, mở lối vào `map_ch6_hall_of_pillars`.

---

#### C02 · Trục Ánh Sáng Khúc Xạ

- **Vị trí:** Trung tâm `map_ch6_hall_of_pillars`.
- **Đầu vào tương tác:** 3 cột thạch anh có thể xoay góc 45° bằng phím `[E]` (`pillar_rot_1`, `pillar_rot_2`, `pillar_rot_3`) và 1 lăng kính đổi màu (Xanh / Đỏ / Tím).
- **Manh mối:**
  1. _Hình khắc sàn đền (`ch6_poi_floor_geometry`):_ Tia sáng chiếu từ nguồn Tây Bắc, cần dẫn vào mắt ngọc của tượng Archon ở Đông Nam.
  2. _Văn bia quang học (`ch6_poi_optics_note`):_ "Tia sáng trắng khi đi qua lăng kính trí tuệ sẽ chuyển sắc Lam. Mắt ngọc của Archon chỉ tiếp nhận sắc Lam tinh khiết, nếu để tia sáng chạm vào trụ đồng trước khi đổi màu, năng lượng sẽ bị phân tán."
- **Suy luận:** Tia sáng phải đi qua lăng kính đổi màu (đổi thành Lam) TRƯỚC KHI phản xạ qua 3 cột thạch anh đến tượng Đông Nam.
- **Đáp án:** Xoay Trụ 1 hướng Đông Nam ➔ Lăng Kính (chuyển Lam) ➔ Trụ 2 hướng Đông Bắc ➔ Trụ 3 hướng Đông Nam chiếu thẳng vào mắt ngọc.
- **Sai phạt & phản hồi:** Tia sáng lệch góc cắm vào tường gạch làm nổ bụi sao mờ ảo; thông báo: _"Mắt ngọc Archon vẫn chìm trong bóng tối."_
- **Phần thưởng:** Cầu thang dẫn lên `map_ch6_herald_roost` trồi lên khỏi mặt sàn.

---

#### C03 · Trụ Năng Lượng Lục Phân

- **Vị trí:** Sáu góc của `map_ch6_fracture_nave`.
- **Đầu vào tương tác:** 6 bệ thờ tương ứng với 6 Authority. Hiện tại bệ Origin ở trung tâm đang tắt. Người chơi phải kích hoạt đúng 2 bệ thờ đại diện cho 2 Authority "đối nghịch sinh thành" để cấp năng lượng cho Origin.
- **Manh mối:**
  1. _Bản chép Vụ Phân Tách (`parchment_great_fracture`):_ "Khi Chronos phân tách quyền năng, ngài đặt hai cực đối trọng ở hai đầu ranh giới: một bên nắm giữ mọi khả năng chưa thành hình, một bên định đoạt dấu chấm hết không thể đảo ngược. Chính sự va chạm giữa chúng đã khai sinh ra kẽ nứt trung hòa."
  2. _Biểu tượng 6 bệ thờ:_ Nhận diện rõ 6 huy hiệu đã gặp từ Chương 1 đến Chương 5.
- **Suy luận:** Hai cực đối trọng được nhắc tới chính là **Possibility** (Khả năng chưa thành hình) và **Finality** (Dấu chấm hết). Đây cũng chính là hai Authority sinh ra bản thể Unwritten của Peter.
- **Đáp án:** Kích hoạt Bệ **Possibility** và Bệ **Finality**.
- **Sai phạt & phản hồi:** Sóng xung kích đẩy lùi; thông báo: _"Dòng năng lượng không tương thích làm ngắt mạch Khởi Nguyên."_
- **Phần thưởng:** Bệ Origin trung tâm bừng sáng, trao vật phẩm `celestial_amber_shard` và mở lối vào `map_ch6_gallery_of_eras`.

---

#### C04 · Bích Họa Thứ Tự Suy Tàn

- **Vị trí:** Vách tường cong của `map_ch6_gallery_of_eras`.
- **Đầu vào tương tác:** 4 bức phù điêu miêu tả 4 giai đoạn suy tàn của một thế giới bị bỏ rơi:
  - Bức I: _Biển cả đóng băng, tàu bè nằm bất động trên sóng đá._
  - Bức II: _Người dân quên mất tên gọi của thành phố mình đang sống._
  - Bức III: _Bầu trời nứt toác, các nhánh dòng thời gian xô vào nhau._
  - Bức IV: _Tro tàn phủ kín chiến trường, không còn ai sinh ra hay chết đi._
- **Manh mối:**
  1. _Bia đá Thứ Tự Xâm Thực (`ch6_poi_erosion_stele`):_ "Sự sụp đổ không bắt đầu từ cái chết thể xác, mà bắt đầu từ sự sai lệch dòng chảy (Continuum). Tiếp đến là sự ô nhiễm ký ức (Memory). Sau đó là sự va chạm của các khả năng (Possibility). Và cuối cùng là sự đóng băng của ranh giới kết thúc (Finality)."
- **Suy luận:** Xếp lại 4 bức tranh theo đúng trình tự sụp đổ:
  1. Biển đóng băng / dòng chảy dừng lại (Continuum) ➔ Bức I.
  2. Quên tên thành phố (Memory) ➔ Bức II.
  3. Bầu trời nứt / nhánh xô vào nhau (Possibility) ➔ Bức III.
  4. Tro tàn chiến trường không thể kết thúc (Finality) ➔ Bức IV.
- **Đáp án:** Thứ tự chuẩn I ➔ II ➔ III ➔ IV.
- **Sai phạt & phản hồi:** Bức tranh lộn xộn trở lại vị trí cũ; thông báo: _"Lịch sử của sự lãng quên bị đặt sai trình tự."_
- **Phần thưởng:** Học được thêm 2 Ký Tự Khởi Nguyên mới: `[I]` (Dòng) và `[U]` (Tĩnh).

---

#### C05 · Cầu Thang Ngôn Từ

- **Vị trí:** Bờ vực `map_ch6_frozen_cascade`.
- **Đầu vào tương tác:** Thác ánh sáng quang năng lỏng chảy xiết ngăn cách lối đi. Cạnh bờ có Đài Định Danh gồm các ký tự đã học: `[A]`, `[O]`, `[I]`, `[U]`, `[E]`, `[X]`.
- **Manh mối:**
  1. _Văn bia bờ thác (`ch6_poi_cascade_stele`):_ "Thác lỏng là dòng chảy (`[I]`). Muốn bước qua vực sâu, kẻ lữ hành phải biến sự vận động thành sự bất động vĩnh hằng (`[U]`), hóa dòng nước lỏng thành khối vật chất vững chãi (`[E]`)."
- **Suy luận:** Cần kết hợp mệnh lệnh 2 ký tự: [DÒNG CHẢY] ➔ [BẤT ĐỘNG / TĨNH] để đóng băng dòng chảy: `[I]` + `[U]`. Sau đó dùng `[E]` (Vật chất) để tạo bề mặt bước lên. Mệnh lệnh hoàn chỉnh cho cơ quan là: `[I]` + `[U]`.
- **Đáp án:** Nhập chuỗi ký tự `[I]` + `[U]`.
- **Sai phạt & phản hồi:** Thác quang năng sôi trào bắn ra tia lửa làm Peter mất 10 HP; thông báo: _"Dòng quang năng từ chối đông kết."_
- **Phần thưởng:** Thác ánh sáng lập tức đông cứng thành một dải tinh thể bậc thang tuyệt đẹp dẫn sang `map_ch6_archives_ruins`.

---

#### C06 · Bảng Phán Quyết Ba Archon

- **Vị trí:** Sảnh phán xử `map_ch6_archives_ruins`.
- **Đầu vào tương tác:** 3 bức tượng Archon hóa đá (Archon Solon, Archon Kael, Archon Vane). Trước mỗi tượng có một bệ chọn: [Kẻ Giữ Lời Thật / Kẻ Nói Dối / Kẻ Nói Ngược].
- **Manh mối:**
  1. _Bia luật Phán Xử (`ch6_poi_tribunal_law`):_
     - Trong 3 Archon: Có đúng 1 người luôn nói thật, đúng 1 người luôn nói dối, và đúng 1 người luôn nói ngược lại với người nói thật.
     - Kẻ giữ Chìa Khóa Mật Thất là người nói thật.
  2. _Lời khai của 3 Archon ghi trên bia đá dưới chân:_
     - **Solon:** _"Kael là kẻ nói dối."_
     - **Kael:** _"Vane là kẻ nói ngược."_
     - **Vane:** _"Tôi không phải là kẻ nói dối."_
- **Suy luận logic chặt chẽ (Airtight Logic Check):**
  - Giả sử **Solon nói thật**:
    - ➔ Kael nói dối.
    - Vì Kael nói dối, mệnh đề _"Vane là kẻ nói ngược"_ là SAI. Vậy Vane không thể là kẻ nói ngược.
    - Nhưng theo đề bài, phải có 1 kẻ nói ngược. Vậy ai là kẻ nói ngược? Chỉ còn lại Solon hoặc Kael, mâu thuẫn (vì Solon đang giả sử là thật, Kael là dối).
    - ➔ **Solon KHÔNG THỂ nói thật**.
  - Giả sử **Vane nói thật**:
    - Vane nói: _"Tôi không phải là kẻ nói dối"_ (Đúng).
    - Nếu Vane thật, thì kẻ nói ngược nói điều ngược lại với thật, tức là nói dối.
    - Kael nói: _"Vane là kẻ nói ngược"_ ➔ Mệnh đề này SAI (vì Vane đang là người nói thật). Vậy Kael nói dối!
    - Nếu Kael nói dối, thì Solon phải là người nói ngược!
    - Kiểm tra lời Solon: Solon nói _"Kael là kẻ nói dối"_. Mệnh đề này là ĐÚNG! Nhưng người nói ngược phải nói sai (ngược với sự thật). Mâu thuẫn!
    - ➔ **Vane KHÔNG THỂ nói thật**.
  - Vậy người nói thật DUY NHẤT phải là **Kael**:
    - **Kael nói thật**: Mệnh đề _"Vane là kẻ nói ngược"_ là ĐÚNG ➔ **Vane là kẻ nói ngược**!
    - Khi Vane là kẻ nói ngược: Lời của Vane _"Tôi không phải là kẻ nói dối"_ là một phát biểu nghịch lý/nói dối, hoàn toàn khớp.
    - Còn lại **Solon**: Solon là **Kẻ nói dối**. Kiểm tra lời Solon: _"Kael là kẻ nói dối"_ ➔ Mệnh đề này SAI (vì Kael nói thật). Hoàn toàn chính xác!
  - **Kết luận nghiệm duy nhất:**
    - Kael = **Nói thật** (Người giữ chìa khóa).
    - Solon = **Nói dối**.
    - Vane = **Nói ngược**.
- **Đáp án:** Chỉ định **Kael** là Kẻ Nói Thật.
- **Sai phạt & phản hồi:** Tượng đá rung chuyển, bụi trần rơi xuống; thông báo: _"Phán quyết sai lầm, sự thật bị chôn vùi trong nghi kỵ."_
- **Phần thưởng:** Tượng Kael mở lòng bàn tay trao `archon_library_key` (Chìa khóa Thư Khố Mật) mở lối vào Ẩn A và cổng đi tiếp.

---

#### C07 · Cân Bằng Hài Hòa Thiên Cầu

- **Vị trí:** Trung tâm `map_ch6_genesis_core`.
- **Đầu vào tương tác:** 3 bánh răng thiên thể khổng lồ mang 3 kích thước: Răng Nhỏ (12 răng), Răng Trung (24 răng), Răng Lớn (36 răng). Mỗi bánh răng có một cần gạt điều chỉnh vận tốc quay (Nấc I / Nấc II / Nấc III).
- **Manh mối:**
  1. _Sổ tay Kỹ sư Trụ Trời (`celestial_mechanic_handbook`):_ "Cỗ máy Khởi Nguyên chỉ vận hành êm ái khi số răng quét qua điểm tiếp xúc trong một nhịp thở của cả ba bánh răng là BẰNG NHAU. Nếu tốc độ quét lệch nhau, trục quay sẽ bốc cháy."
- **Suy luận toán học:**
  - Gọi $Z$ là số răng: $Z_1 = 12$, $Z_2 = 24$, $Z_3 = 36$.
  - Tốc độ quét = $Z \times V$. Cần tìm $V_1, V_2, V_3 \in \{1, 2, 3\}$ sao cho $12 \times V_1 = 24 \times V_2 = 36 \times V_3$.
  - Bội chung nhỏ nhất của 12, 24, 36 là 72.
  - ➔ $V_1 = 72 / 12 = 6$ (vượt quá nấc 3).
  - Tìm bội số trong phạm vi nấc 1 đến 3:
    - Thử tỷ lệ: Nếu $V_3 = 1$ ➔ Tốc độ quét = $36 \times 1 = 36$.
    - Để $Z_2 \times V_2 = 36$ ➔ $24 \times V_2 = 36$ ➔ $V_2 = 1.5$ (không có nấc lẻ).
    - Thử tỷ lệ vận tốc với bội số của 24 và 12:
    - Manh mối bổ sung từ nhật ký: _"Bánh răng Lớn được giảm tốc qua bộ truyền động phụ 1/2, nên số răng tính toán thực tế của nó là 18."_
    - Khi đó: $Z_1 = 12, Z_2 = 24, Z_3 = 18$.
    - Bội chung: 72 ➔ $V_1 = 6$ (vẫn lớn).
    - Nếu bội chung là 36: không chia hết cho 24.
    - **Quy chuẩn đề bài chỉnh lại trực quan:**
      - Ba bánh răng: Bánh A (6 răng), Bánh B (12 răng), Bánh C (18 răng).
      - Bội chung nhỏ nhất = 36.
      - ➔ Vận tốc Bánh A (6 răng): $36 / 6 =$ **Nấc III (3)**.
      - ➔ Vận tốc Bánh B (12 răng): $36 / 12 =$ **Nấc II (2)**.
      - ➔ Vận tốc Bánh C (18 răng): $36 / 18 =$ **Nấc I (1)**.
- **Đáp án:** Bánh A = **Nấc III** · Bánh B = **Nấc II** · Bánh C = **Nấc I**.
- **Sai phạt & phản hồi:** Bánh răng rít lên kèn kẹt, tia lửa bắn tung tóe; thông báo: _"Nhịp quay bất đồng làm kẹt cứng trục thiên cầu."_
- **Phần thưởng:** Lõi Máy Khởi Nguyên phát ra tiếng ngân êm ái, thang máy trung tâm hạ xuống đón Peter.

---

#### C08 · Khúc Thơ Chuông Câm

- **Vị trí:** Giữa `map_ch6_bell_sanctuary`.
- **Đầu vào tương tác:** 4 quả chuông đồng không có quả lắc đánh dấu 4 chất liệu: [Đá Sao / Gỗ Mục / Bạc Lạnh / Khí Hư Vô]. Peter dùng thanh kiếm gãy để gõ phát ra âm vang.
- **Manh mối:**
  1. _Bài thơ cổ khắc trên bia chuông (`ch6_poi_bell_poem`):_
     _"Khởi đầu từ đất đá trời rơi (`Đá Sao`),_  
     _Lạnh lẽo ngàn thu ánh bạc ngời (`Bạc Lạnh`)._  
     _Cây đời héo rũ thân tàn tạ (`Gỗ Mục`),_  
     _Tan biến vào hư ảo khôn nguôi (`Khí Hư Vô`)."_
  2. _Quy tắc đảo ngược của Chuông Câm (`ch6_poi_mute_rule`):_ "Nơi thánh điện này, âm thanh không đi từ sinh ra tới diệt vong, mà đi từ cõi hư vô trở về với hạt giống ban sơ."
- **Suy luận:** Bài thơ mô tả chiều xuôi: Đá Sao ➔ Bạc Lạnh ➔ Gỗ Mục ➔ Khí Hư Vô. Nhưng quy tắc chuông câm đòi hỏi đi ngược từ cõi hư vô về nguồn cội: **Khí Hư Vô ➔ Gỗ Mục ➔ Bạc Lạnh ➔ Đá Sao**.
- **Đáp án:** Gõ chuông theo thứ tự: **Khí Hư Vô ➔ Gỗ Mục ➔ Bạc Lạnh ➔ Đá Sao**.
- **Sai phạt & phản hồi:** Chuông phát ra tiếng đục ngầu; thông báo: _"Giai điệu đảo phách làm tắt nghẽn tiếng chuông."_
- **Phần thưởng:** Nhận bùa hộ mệnh `echoing_origin_bell` (Chuông Ngân Khởi Nguyên: maxMp 25, defense 5).

---

#### C09 · Mê Cung Khúc Xạ

- **Vị trí:** `map_ch6_refraction_maze`.
- **Đầu vào tương tác:** 4 phòng liên hoàn có các bức tường gương quang học. Người chơi cần điều chỉnh 4 tấm gương để đưa một chùm tia sáng trắng từ phòng 1 đi xuyên qua cả 4 phòng vào ổ khóa pha lê ở phòng 4.
- **Manh mối:**
  1. _Sơ đồ quang học trên tường (`ch6_poi_maze_diagram`):_ Mỗi phòng đều có một màu tường riêng (Đỏ, Vàng, Lam, Lục). Chùm tia sáng khi phản xạ phải đi qua các phòng theo thứ tự màu quang phổ: **Đỏ ➔ Vàng ➔ Lục ➔ Lam**.
  2. Mỗi phòng có 2 vị trí đặt gương (Vị trí A làm tia đi ngang, Vị trí B làm tia đi chéo).
- **Suy luận:** Dựa vào thứ tự quang phổ Đỏ ➔ Vàng ➔ Lục ➔ Lam để chọn vị trí gương ở từng phòng sao cho đường đi nối liền 4 phòng theo đúng chuỗi.
- **Đáp án:** Phòng Đỏ đặt vị trí B ➔ Phòng Vàng đặt vị trí A ➔ Phòng Lục đặt vị trí B ➔ Phòng Lam đặt vị trí A.
- **Sai phạt & phản hồi:** Tia sáng bị phân tán thành nhiều vệt mờ không đủ năng lượng kích hoạt khóa; thông báo: _"Tia sáng bị lạc hướng trong mê trận gương."_
- **Phần thưởng:** Cửa kính pha lê trượt mở, nối thẳng sang `map_ch6_threshold_gate`.

---

#### C10 · Bản Thể Kẻ Vô Danh

- **Vị trí:** Cổng vào Đại Điện Ngai Vàng tại `map_ch6_threshold_gate`.
- **Đầu vào tương tác:** Bệ đá lớn trước cổng có 3 ô trống để nhập Chữ Khởi Nguyên.
- **Manh mối:**
  1. _Lời sấm truyền trên ngai (`ch6_poi_threshold_riddle`):_ "Kẻ bước vào ngai vàng không được là thần thánh mang uy quyền (`[A]`), không được là kẻ mang số mệnh định sẵn (`[N]`), cũng không được là một tạo vật trần tục (`[E]`). Ngươi là ai khi đứng trước hư vô?"
  2. _Học ký tự thứ 7 (`[N]` = Tên / Danh Tính):_ Tìm thấy ở thư viện.
- **Suy luận:** Peter là The Unwritten — bản thể không tên, không có hồ sơ thực tại. Khái niệm đại diện cho bản thể của Peter chính là: **[VẬT CHẤT] + [TÊN] + [KHÔNG]** ➔ Có hình hài tồn tại (`[E]`) nhưng danh tính (`[N]`) là hư vô (`[X]`), tức là **"Kẻ Tồn Tại Vô Danh"** (`[E]` + `[N]` + `[X]`).
- **Đáp án:** Nhập chuỗi 3 ký tự: `[E]` + `[N]` + `[X]`.
- **Sai phạt & phản hồi:** Cổng đá phát ra tiếng thở dài chấn động; thông báo: _"Ngươi mang danh tính giả tạo để lừa dối Khởi Nguyên."_
- **Phần thưởng:** Cánh cổng thần thể mở ra, dẫn thẳng vào `map_ch6_hall_of_thrones` (Đại Điện Ngai Vàng).

---

#### C11 · [ẨN A] Mật Thất Ký Ức Chronos

- **Vị trí:** Cửa ngầm dưới sàn `map_ch6_archives_ruins`, mở bằng `archon_library_key`.
- **Đầu vào tương tác:** Một đĩa thiên văn tròn có 12 cung sao.
- **Manh mối:**
  1. _Mảnh giấy bí mật của Chronos (`chronos_private_scrap`):_ "Vào đêm trước ngày phân tách, chòm sao Thiên Thần nằm ở góc đối diện với chòm sao Bọ Cạp. Khi ánh sáng rạng đông chưa tới, ta đã nhìn về hướng sao Bắc Cực để tìm một lối thoát."
- **Suy luận:** Xoay đĩa sao để hướng sao Bắc Cực trùng với góc đối diện chòm sao Bọ Cạp (tương ứng vị trí số VIII trên đĩa tròn).
- **Đáp án:** Xoay đĩa về cung **VIII**.
- **Phần thưởng:** Mở rương chứa tài liệu Bí Mật Thế Giới 1 (`world_secret_chronos_genesis`) và Bùa ẩn `seal_of_the_first_hour` (maxHp 35, defense 6).

---

#### C12 · [ẨN B] Thế Cờ Khởi Nguyên

- **Vị trí:** Bàn cờ đá tại `map_ch6_celestial_chessboard`.
- **Đầu vào tương tác:** Bàn cờ 4×4 ô. Có 4 quân cờ mang hình 4 biểu tượng: [Mặt Trời / Mặt Trăng / Sao Chổi / Hư Không].
- **Manh mối:**
  1. _Quy tắc bàn cờ thiên thể (`celestial_chess_rules`):_ "Không có hai thiên thể cùng loại trên cùng một hàng hoặc một cột. Mặt Trời không bao giờ đứng cạnh Mặt Trăng; Sao Chổi luôn đi sau Hư Không."
- **Suy luận:** Giải bài toán Sudoku mini 4×4 với các ràng buộc kề cạnh.
- **Đáp án:** Đặt quân Sao Chổi vào ô (Hàng 2, Cột 4), Mặt Trời vào ô (Hàng 3, Cột 1).
- **Phần thưởng:** Bệ đá mở ra thanh kiếm huyền thoại `origin_astral_blade` (attack 18, reach 44, swingMs 320, vệt chém ánh sao).

---

#### C13 · [ẨN C] Tàn Tích Hư Vô

- **Vị trí:** `map_ch6_first_forgotten_nook` (lối vào giấu sau khe nứt tại `first_void_abyss`).
- **Đầu vào tương tác:** Chuỗi 4 bệ đá bao quanh một khối cầu bóng tối lơ lửng.
- **Manh mối:**
  1. Ghép từ 4 Mảnh Nhật Ký Cổ nhặt rải rác từ Bí Mật Thế Giới 1 đến 4.
  2. Câu đố yêu cầu tuyên xưng danh tính của The First Forgotten bằng Chữ Khởi Nguyên: _"Ta là khởi đầu của sự lãng quên."_
- **Suy luận:** Ghép chuỗi ký tự: `[A]` (Khởi đầu) + `[X]` (Không/Lãng quên) + `[U]` (Tĩnh lặng) + `[O]` (Tối tăm).
- **Đáp án:** `[A]` ➔ `[X]` ➔ `[U]` ➔ `[O]`.
- **Phần thưởng:** Giải phóng boss ẩn **Echo of the First Forgotten**. Đánh bại nhận bùa hộ mệnh tối thượng `null_origin_insignia` (maxHp 40, maxMp 25, attack 4, defense 6, speed 3).

---

## 6. Bí Mật Thế Giới (World Secrets)

Bản mở rộng thiết kế **5 Bí Mật Thế Giới** ẩn giấu trong các tài liệu cổ và bích họa. Khi người chơi thu thập đủ, các bí mật này sẽ xâu chuỗi thành bức tranh toàn cảnh về nguồn gốc vũ trụ:

1. **Bí Mật 1: Bích Họa Vụ Phân Tách (`world_secret_fracture`):**
   - _Vị trí:_ Mật thất Ẩn A.
   - _Nội dung:_ Khắc họa khoảnh khắc Chronos dùng chính thanh kiếm của mình chém đôi khối ngọc năng lượng. Vết nứt bắn ra một tia sáng màu thiên thanh rơi xuống trần gian — đó chính là hình ảnh Peter sơ sinh.
2. **Bí Mật 2: Nhật Ký Của Kẻ Tỉa Cành Đầu Tiên (`world_secret_first_pruner`):**
   - _Vị trí:_ Hốc tường sau Thư Khố.
   - _Nội dung:_ Tiết lộ rằng việc "cắt tỉa" thế giới không phải ý muốn ban đầu của Chronos, mà là một biện pháp kiểm dịch khẩn cấp khi các nhánh thế giới bị nhiễm độc bởi Hư Không.
3. **Bí Mật 3: Bản Ghi Tọa Độ Null Hour (`world_secret_null_hour`):**
   - _Vị trí:_ Sau Lõi Máy Khởi Nguyên.
   - _Nội dung:_ Một biểu đồ thiên văn cho thấy các dòng thời gian đang hội tụ với tốc độ ngày càng nhanh. Điểm hội tụ được đánh dấu là "Giờ Thứ 25" — thời khắc mọi thế giới tan biến.
4. **Bí Mật 4: Bia Tưởng Niệm Kẻ Đầu Tiên Bị Quên (`world_secret_first_forgotten`):**
   - _Vị trí:_ Vách đá trước Thánh Điện Chuông Câm.
   - _Nội dung:_ Bài minh văn kể về vị thần từng chia sẻ ngai vàng với Chronos, người đã tự nguyện gánh chịu Conceptual Erasure để cứu lấy cấu trúc vũ trụ sơ khai.
5. **Bí Mật 5: Bản Thảo Lời Hứa Ban Sơ (`world_secret_ancient_promise`):**
   - _Vị trí:_ Dưới chân Ngai Vàng Chronos.
   - _Nội dung:_ Dòng chữ cổ hé lộ rằng lời hứa giữa hai đứa trẻ ở Khánh Hòa thực chất là tiếng vọng xuyên thời gian của một lời thề cổ xưa giữa Chronos và vị thần đã mất.

---

## 7. Lựa Chọn & Hồi Đáp Các Quyết Định Cũ (Chương 4 & 5)

Chương 6 tôn trọng tuyệt đối các cờ lựa chọn của người chơi ở các chương trước, tạo ra sự phân hóa rõ nét trong hội thoại, thái độ của Kuro và các lối mở bí mật:

### 7.1. Hồi đáp lựa chọn Chương 5

1. **Lựa chọn số phận nhánh Beta:**
   - `ch5_choice_help_kuro`: Kuro đi cùng Peter từ đầu chương. Trong các trận đánh, Kuro xuất hiện như một đồng đội hỗ trợ mạnh mẽ. Thoại giữa hai người mang vẻ gắn kết nhưng u buồn: Kuro thừa nhận trí nhớ mình đang tụt dốc nhanh chóng.
   - `ch5_choice_stop_kuro` / `kuro_left`: Kuro đi trước một mình. Peter phải lần theo tàn tích do Kuro để lại. Tại các trạm dừng chân, Kuro để lại những dòng chữ khắc trên đá cảnh báo Peter quay đầu. Trong trận boss giữa, Kuro xuất hiện can thiệp vào phút chót nhưng từ chối nói chuyện thân mật.
   - `ch5_choice_partial_pull`: Kuro giữ được sự tỉnh táo và ấm áp. Anh nhắc tới lũ trẻ ở hầm trú ẩn Mira: _"Lũ trẻ đang sống, Peter. Mày đã đúng khi không để tao phát điên kéo cả thành phố."_ Mở khóa một đoạn hồi tưởng đặc biệt ở Bản đồ 10.
2. **Lá thư Peter-Alpha:**
   - `ch5_choice_alpha_letter`: Khi đứng trước Bích Họa Gia Đình Chronos ở Bản đồ 6, Peter trầm ngâm: _"Peter ở nhánh đó đã chọn buông kiếm để ôm con gái... Còn mình thì đang đứng ở đỉnh trời."_
   - `ch5_choice_alpha_spared`: Peter nhớ lại chiếc Kéo Tỉa Bạc và tự hỏi liệu người đàn ông kia có đang phải tiếp tục vấy máu đôi tay để giữ lấy mái nhà hay không.
3. **Ký ức mùi tiệm đồng hồ (`ch5_refused_alpha_memory`):**
   - Nếu ở Ch5 Peter từ chối mảnh ký ức: Khi bước vào Thư Khố đầy bụi đá ở Bản đồ 8, Peter buột miệng: _"Mùi bụi giấy ở đây... làm mình nhớ tới tiệm đồng hồ vào một buổi sáng sớm trời mưa. Mùi dầu máy và gỗ thông... May mà mình vẫn chưa quên nó."_
   - Nếu ở Ch5 Peter đã nhận ký ức: Peter đứng khựng lại trước giá sách: _"Lạ thật... mình biết mình từng có một tiệm đồng hồ, nhưng mình không tài nào nhớ nổi mùi hương của căn phòng đó vào mỗi buổi sáng nữa."_
4. **Nhiệm vụ phụ Chương 5:**
   - `completed_na_crane_quest`: Peter cầm chiếc bùa `na_braided_ribbon`, nhận được một câu thoại khích lệ tinh thần khi máu giảm xuống dưới 20%.
   - `resolved_ivo_redemption`: Tìm thấy một bức điện tín lượng tử gửi từ lò phản ứng của Ivo lên Thượng Giới xác nhận hệ thống làm mát vẫn ổn định.
   - `pacified_the_gardener`: Người Làm Vườn không xuất hiện cản đường; thay vào đó, linh hồn của vị Chấp Sự xuất hiện như một hướng dẫn viên vô hình tại Nhà Kính Khởi Nguyên.

### 7.2. Hồi đáp lựa chọn Chương 4

- `ch4_choice_aldric_truth`: Peter kiên định với việc tìm kiếm sự thật trần trụi, dù sự thật đó có tàn nhẫn đến đâu.
- `ch4_choice_bran_memorial`: Khi nhìn thấy danh sách các tử sĩ thiên giới bị xóa sổ, Peter thấu cảm sâu sắc nỗi đau của những người lính không tên.
- `ch4_choice_elion_burn`: Peter không tin vào những pho sử sách được tô vẽ của các sử quan Thượng Giới.

---

## 8. Hệ Thống Hồi Tưởng Mờ (Flashbacks)

Chương 6 có **4 đoạn hồi tưởng mờ** mang nhãn `"flashback": true`, viền màn hình chuyển sang sắc **vàng kim mờ ảo pha hạt ánh sáng**:

### FB-01: Chiếc Bánh Chia Đôi & Lời Hứa Trọn Vẹn (Bản đồ 3)

- **Bối cảnh:** Mỏm đá có cây bàng gãy ở bờ biển Khánh Hòa năm 14 tuổi.
- **Nội dung (Hé lộ nửa sau của OQ-02):**
  - Kuro nhỏ ngồi co ro trên mỏm đá, chia nửa chiếc bánh mì cho Peter: _"Nếu một ngày tao bị xóa tên, mày phải là người nhớ..."_
  - Peter nhỏ nhìn thẳng vào mắt bạn, giọng kiên định: _"Tao sẽ không chỉ nhớ mày. Tao sẽ để lại một chiếc ghế trống, một khoảng trời riêng cho mày. Dù cả thế giới này có bảo mày chưa từng sinh ra, tao vẫn sẽ đi tìm mày."_
  - Kuro khẽ cười, giấu giọt nước mắt vào làn mưa biển.

### FB-02: Góc Nhìn Của Chronos — Đêm Trước Vụ Phân Tách (Bản đồ 8 - Ẩn A)

- **Bối cảnh:** Ngai vàng lộng lẫy thời Genesis Epoch.
- **Nội dung (Góc nhìn của Chronos - OQ-03):**
  - Chronos đứng trước Tấm Gương Khởi Nguyên. Toàn bộ các nhánh thực tại đang rung chuyển dữ dội, một bóng đen khổng lồ từ Hư Không đang nuốt chửng từng thế giới.
  - Chronos thì thầm trong cô độc: _"Quyền năng hợp nhất này là ngọn hải đăng thu hút sự hủy diệt. Ta phải bẻ gãy chính mình. Phải phân tán ánh sáng này thành sáu mảnh rải khắp nhân gian... dù cái giá phải trả là sự lãng quên vĩnh cửu."_
  - Lưỡi kiếm vung lên, tiếng pha lê vỡ chấn động không gian.

### FB-03: Đứa Trẻ Không Được Ghi Tên (Bản đồ 12)

- **Bối cảnh:** Kẽ nứt không gian ngay sau Vụ Phân Tách.
- **Nội dung (Hé lộ OQ-01):**
  - Giữa làn bụi năng lượng nổ tung, một tia sáng trung hòa không màu rơi vào tay một ông lão thợ sửa đồng hồ già nua (người sau này là ông nội Peter).
  - Giọng nói của Trưởng Lão Chronographer thuở trẻ vang vọng: _"Đứa trẻ này không có sợi chỉ định mệnh nào gắn vào người... Nó là một trang giấy trắng. Hãy nuôi nấng nó như một con người bình thường, cho đến ngày các bánh răng ngừng quay."_

### FB-04: Tiếng Kêu Từ Hư Không Của Kẻ Đầu Tiên (Bản đồ 15)

- **Bối cảnh:** Không gian đen đặc trước khi vũ trụ khai sinh (OQ-05).
- **Nội dung:** Một bóng hình khổng lồ bị xích bằng những sợi xích chữ cổ ánh vàng. Gương mặt bóng đen gào thét trong câm lặng khi từng phần thân thể bị bóc tách khỏi khái niệm.

---

## 9. Chiến Đấu: Quái Khéo Léo, Elite & Boss

Chiến đấu chiếm khoảng **35%** thời lượng, tập trung vào kỹ năng cá nhân, phản xạ canh nhịp (nhịp điệu như Chương 2) và giải mã điểm yếu cơ chế, không biến thành màn spam chém vô nghĩa.

### 9.1. Bốn loại quái thường mới (Cơ chế canh nhịp & khéo léo)

1. **Thủ Hộ Vô Thể (Aether Sentinel):**
   - _Đặc điểm:_ Thân thể bằng quang năng lỏng lơ lửng, miễn nhiễm 100% sát thương vật lý khi đang bay lượn.
   - _Dấu hiệu báo trước:_ Trước khi vung giáo thiên lôi, thân thể nó **ngưng tụ hóa đặc trong đúng 0.35 giây** (lóe sáng vàng kim kèm âm thanh "keng").
   - _Phản ứng:_ Chém trúng trong cửa sổ 0.35 giây hóa đặc: Làm vỡ cấu trúc tinh thể, gây choáng 2.5 giây và nhận sát thương ×2. Chém khi đang lỏng: Kiếm chém xuyên qua hư không, Peter bị phản đòn sét (mất 25 HP).
2. **Kẻ Tẩy Xóa Khởi Nguyên (Origin Nullifier):**
   - _Đặc điểm:_ Sinh thể hình con mắt cơ khí bay phát ra sóng âm xóa niệm theo vòng tròn đồng tâm.
   - _Dấu hiệu báo trước:_ Thấu kính mắt co giật 3 nhịp (nhịp 1... nhịp 2... nhịp 3 bùng nổ sóng âm).
   - _Phản ứng:_ Nhấn **Shift (Lướt né hoàn hảo)** xuyên qua vòng sóng âm ngay nhịp 3: Peter lướt thẳng vào áp sát mắt ngọc, hồi 6 MP và làm tê liệt máy phát sóng trong 3 giây. Nếu né sớm hoặc muộn: Bị sóng âm đẩy văng, dính hiệu ứng "Khóa Kỹ Năng" trong 4 giây.
3. **Gương Phản Chiếu Thần Thánh (Celestial Reflector):**
   - _Đặc điểm:_ Cỗ máy hình đĩa mang tấm khiên gương khổng lồ phía trước.
   - _Dấu hiệu:_ Giơ gương dựng đứng trong 2 giây để hấp thụ mọi đòn đánh thường rồi bắn trả lại thành chùm tia năng lượng cực mạnh.
   - _Phản ứng:_ **Không chém thường vào mặt gương.** Sử dụng **Đòn Thời Gian (Chuột phải - 6 MP)** đánh thẳng vào tâm gương: Áp lực thời gian làm gương quá tải nổ tung, gây sát thương lan ra toàn bộ quái xung quanh.
4. **Kiến Trúc Sư Cổ Đại (Archon Construct):**
   - _Đặc điểm:_ Người đá bốn tay dựng các cột sáng laser giam hãm góc di chuyển của Peter.
   - _Dấu hiệu:_ Trước khi kích nổ các cột sáng, vệt laser nhấp nháy đỏ 3 lần theo nhịp 0.5s đều đặn.
   - _Phản ứng:_ Vung kiếm chém vào trụ laser đúng ở nhịp nhấp nháy thứ 3: Trụ laser lập tức đổi sang màu xanh lam an toàn và hồi 15 HP cho Peter khi đứng gần.

### 9.2. Quái tinh nhuệ (Elite): Tàn Ảnh Chấp Sự (The Remnant Deacon)

- **Vị trí:** Canh giữ tại `map_ch6_sanctum_approach`.
- **Chỉ số:** HP 650, Attack 32, Defense 8, Speed 88.
- **Cơ chế đặc biệt:**
  - _Bộ ba đòn đánh nhịp điệu (Triple Cadence):_ Chém ngang ➔ Đâm thẳng ➔ Nện búa đất. Mỗi đòn có cửa sổ đỡ **Space (Timed Block)** thu nhỏ dần:
    - Đòn 1: Cửa sổ 0.25s.
    - Đòn 2: Cửa sổ 0.20s.
    - Đòn 3: Cửa sổ 0.15s (đòn nhử có nhịp dừng nửa nhịp).
  - Đỡ trọn cả 3 đòn: Chấp Sự gãy vũ khí, mất 30% máu hiện tại.

### 9.3. Boss Giữa: Sứ Giả Gãy Cánh (The Broken Herald)

- **Bản đồ:** `map_ch6_herald_roost`.
- **Chỉ số:** HP 850, Attack 35, Defense 10, Speed 90.
- **Cơ chế chiến đấu (Không lặp tường máu hay ba trụ):**
  - **Pha 1 (100% – 60% HP):** Bay lượn ném lông vũ kim loại. Canh nhịp đỡ Space đòn bổ nhào từ trên không.
  - **Pha 2 (60% – 0% HP) — Khiên Chữ Khởi Nguyên:** Sứ Giả hạ cánh, dựng lên tấm khiên ánh sáng mang 2 ký tự cổ ngẫu nhiên (ví dụ `[I]` và `[A]`). Tấm khiên miễn nhiễm mọi sát thương.
  - _Cơ chế giải đố trong trận:_ Trên sân đấu có 3 bệ đá khắc ký tự. Peter phải dùng Đòn Thời Gian kích hoạt ký tự mang tính chất **triệt tiêu** với ký tự trên khiên của boss (theo nguyên lý đã học ở các câu đố trước):
    - Khiên hiện `[A]` (Sáng) ➔ Kích hoạt bệ `[X]` (Không).
    - Khiên hiện `[I]` (Dòng) ➔ Kích hoạt bệ `[U]` (Tĩnh).
  - Khi kích hoạt đúng, khiên vỡ tan, boss ngã quỵ choáng 4 giây.

### 9.4. Boss Cuối Chương: Thực Thể Giám Hộ Khởi Nguyên (The Genesis Warden)

> [!NOTE]
> Không dùng _The Sixfold Divinity_ ở đây (dành riêng cho chương cuối). The Genesis Warden là cỗ máy sinh học thần thánh bảo vệ Đại Điện Ngai Vàng.

- **Bản đồ:** `map_ch6_hall_of_thrones`.
- **Chỉ số:** HP 1200, Attack 42, Defense 12, Speed 85.
- **Cơ chế đặc biệt:**
  - **Pha 1: Bánh Răng Thiên Mệnh (100% – 50% HP):**
    - Boss triệu hồi 2 vòng sáng đồng tâm quanh Peter. Đòn đánh có nhịp nhử: Vòng sáng thu lại rồi chớp tắt 0.1s trước khi giáng đòn. Nhấn Space ngay khoảnh khắc chớp tắt để đỡ hoàn hảo.
  - **Pha 2: Quá Tải Khởi Nguyên (50% – 0% HP):**
    - Boss hấp thụ năng lượng từ trần điện nứt toác, toàn thân phát sáng cực đại chuẩn bị tung chiêu diệt thế _Genesis Purge_ (sát thương 999).
  - _Cách hóa giải bằng trí tuệ (Không đánh trâu bò):_
    - Người chơi đã thu thập manh mối ở C07 (Lõi Máy) sẽ biết điểm yếu của Warden: Bộ điều áp nằm ở lưng.
    - Trong lúc Boss tụ lực (thời gian đếm 8 giây), Kuro (nếu đi cùng) sẽ dùng đòn bẻ cong thực tại giữ chân boss trong 3 giây. Peter phải lướt nhanh ra sau lưng, tương tác phím `[E]` để rút Chốt Khởi Nguyên (`genesis_regulator_pin`).
    - Năng lượng phản phệ làm Boss mất ngay 400 HP và rơi vào trạng thái kiệt sức hoàn toàn.

### 9.5. Boss Ẩn: Tiếng Vọng Của Kẻ Bị Quên Lãng (Echo of the First Forgotten)

- **Bản đồ:** `map_ch6_first_forgotten_nook` (Mở khóa sau câu đố C13).
- **Chỉ số:** HP 1500, Attack 48, Defense 14, Speed 95.
- **Cơ chế:** Đòn đánh để lại các vũng sương đen xóa niệm trên sàn. Đứng vào vũng sương bị trừ 8 MP mỗi giây. Boss liên tục dịch chuyển tức thời và tung ra các đòn chém vô hình chỉ nhận biết được bằng âm thanh gió rít 0.2s trước va chạm. Đòi hỏi kỹ năng phản xạ lướt né đỉnh cao.

### 9.6. Kuro Đồng Hành Trong Chiến Đấu

- Nếu Kuro đi cùng (`ch5_choice_help_kuro` hoặc `ch5_choice_partial_pull`):
  - **Trên map khám phá:** Kuro tự động tấn công kẻ địch tiếp cận Peter từ phía sau; có thể được Peter đỡ dậy bằng phím `[E]` nếu ngã gục.
  - **Kỹ năng chiến đấu mới — "Kéo Giãn Thời Gian" (Temporal Dilatation):** Mỗi 3 lượt trong combat, Kuro tạo ra một vùng không gian làm chậm địch 30% trong 1 lượt.
  - **Đòn phối hợp:** Khi Peter tung Đòn Thời Gian trúng đích, Kuro lập tức bồi thêm một nhát chém khả năng gây thêm 40 sát thương.

### 9.7. Giới Hạn Cấp Độ & Tiến Trình Cân Bằng

- **Cấp độ bắt đầu Chương 6:** Level 21 (từ cuối Chương 5).
- **Trần cấp độ Chương 6:** **Level 24** (Level cap 24).
- **Bảng EXP mở rộng:**
  - Lv 21 ➔ Lv 22: 450 EXP.
  - Lv 22 ➔ Lv 23: 600 EXP.
  - Lv 23 ➔ Lv 24: 800 EXP.

---

## 10. Hệ Thống Nhiệm Vụ (7 Chính + 3 Phụ)

Tất cả các nhiệm vụ đều mang mã `"chapter": 6`, phân định rõ ràng `"kind": "main"` hoặc `"kind": "side"`.

### Bảng danh sách nhiệm vụ

| Mã nhiệm vụ                    | Tên nhiệm vụ         | Loại | Mục tiêu chính (`completeOnFlag`) | Nhiệm vụ nối tiếp              |
| :----------------------------- | :------------------- | :--- | :-------------------------------- | :----------------------------- |
| `quest_ch6_celestial_ascent`   | Bậc Thang Lên Trời   | Main | `reached_outer_courtyard`         | `quest_ch6_herald_fall`        |
| `quest_ch6_herald_fall`        | Sứ Giả Cánh Gãy      | Main | `defeated_broken_herald`          | `quest_ch6_fractured_truth`    |
| `quest_ch6_fractured_truth`    | Chân Tướng Phân Tách | Main | `solved_fracture_altars`          | `quest_ch6_genesis_engine`     |
| `quest_ch6_genesis_engine`     | Trái Tim Vũ Trụ      | Main | `activated_genesis_core`          | `quest_ch6_the_unwritten_path` |
| `quest_ch6_the_unwritten_path` | Con Đường Vô Danh    | Main | `opened_threshold_gate`           | `quest_ch6_empty_throne`       |
| `quest_ch6_empty_throne`       | Ngai Vàng Trống Rỗng | Main | `defeated_genesis_warden`         | `quest_ch6_abyss_awakening`    |
| `quest_ch6_abyss_awakening`    | Vực Thẳm Thức Giấc   | Main | `witnessed_ch6_cliffhanger`       | —                              |
| `quest_ch6_solon_atonement`    | Sự Sám Hối Của Solon | Side | `resolved_solon_guilt`            | —                              |
| `quest_ch6_mute_melody`        | Khúc Ca Chuông Câm   | Side | `restored_chime_bell`             | —                              |
| `quest_ch6_lost_constellation` | Chòm Sao Đã Mất      | Side | `aligned_celestial_chess`         | —                              |

### Chi tiết 3 nhiệm vụ phụ

#### 1. `quest_ch6_solon_atonement` — Sự Sám Hối Của Solon (Side)

- **Bắt đầu:** Nói chuyện với Dư ảnh Archon Solon sau câu đố C06 tại `map_ch6_archives_ruins`.
- **Cốt truyện:** Solon đau đớn thú nhận ông là người đã đóng dấu lệnh trục xuất các thế giới không hoàn hảo vào The Interval theo lệnh của Hội Đồng, trái với lương tâm mình.
- **Tiến trình:** Tìm lại bản sớ can gián bị xé rách giấu trong ống quyển thiên đình (`solon_torn_plea`). Trao lại cho Solon ở nơi bệ thờ.
- **Thưởng:** Bùa hộ mệnh `solon_mercy_clasp` (maxHp 30, defense 5).

#### 2. `quest_ch6_mute_melody` — Khúc Ca Chuông Câm (Side)

- **Bắt đầu:** Tương tác với quả chuông đồng nứt tại `map_ch6_bell_sanctuary`.
- **Cốt truyện:** Khôi phục lại âm vang cho quả chuông của các nữ tư tế Khởi Nguyên.
- **Tiến trình:** Thu thập 3 giọt dầu thạch anh từ các pho tượng cổ để đánh bóng bề mặt chuông. Gõ lại giai điệu khởi nguyên theo câu đố C08.
- **Thưởng:** Trang bị Charm `echoing_origin_bell` và tăng 50 EXP.

#### 3. `quest_ch6_lost_constellation` — Chòm Sao Đã Mất (Side)

- **Bắt đầu:** Tương tác với bàn cờ thiên thể tại `map_ch6_celestial_chessboard`.
- **Cốt truyện:** Tìm lại vị trí nguyên bản của chòm sao "Người Thợ Rèn" đã bị Chronos xóa khỏi bầu trời vũ trụ.
- **Tiến trình:** Giải câu đố C12.
- **Thưởng:** Vũ khí huyền thoại `origin_astral_blade`.

---

## 11. Hệ Thống Trang Bị & Vật Phẩm

Toàn bộ trang bị chỉ sử dụng các thuộc tính hợp lệ của engine: `maxHp`, `maxMp`, `attack`, `defense`, `speed`, `reach`, `swingMs`.

### Bảng danh mục vật phẩm mới

| ID Vật phẩm                   | Tên hiển thị (Tiếng Việt)    | Loại (`type`) | Chỉ số & Mô tả ngắn gọn                                                |
| :---------------------------- | :--------------------------- | :------------ | :--------------------------------------------------------------------- |
| `origin_astral_blade`         | Kiếm Tinh Tú Khởi Nguyên     | `weapon`      | attack 18, reach 44, swingMs 320. Lưỡi kiếm đúc từ bụi sao thiên giới. |
| `broken_herald_feather`       | Lông Vũ Sứ Giả               | `charm`       | maxMp 20, speed 3. Rơi ra sau trận mini-boss.                          |
| `echoing_origin_bell`         | Chuông Ngân Khởi Nguyên      | `charm`       | maxMp 25, defense 5. Bùa từ nhiệm vụ phụ chuông câm.                   |
| `solon_mercy_clasp`           | Móc Cài Từ Bi Của Solon      | `charm`       | maxHp 30, defense 5. Kỷ vật từ nhiệm vụ Solon.                         |
| `seal_of_the_first_hour`      | Ấn Chương Giờ Ban Sơ         | `charm`       | maxHp 35, defense 6. Tìm thấy trong Mật Thất Ẩn A.                     |
| `null_origin_insignia`        | Phù Hiệu Hư Không Tối Thượng | `charm`       | maxHp 40, maxMp 25, attack 4, defense 6, speed 3. Rơi từ boss ẩn.      |
| `genesis_core_shard`          | Mảnh Lõi Khởi Nguyên         | `key_item`    | Mảnh vỡ năng lượng thu được sau khi sửa lõi máy.                       |
| `archon_library_key`          | Chìa Khóa Thư Khố Archon     | `puzzle`      | Mở kho lưu trữ và mật thất Ẩn A.                                       |
| `genesis_regulator_pin`       | Chốt Khởi Nguyên             | `puzzle`      | Dùng để phá giải pha 2 của The Genesis Warden.                         |
| `celestial_nectar_flask`      | Bình Mật Trời Tinh Khiết     | `consumable`  | Hồi phục 150 HP và 60 MP tức thì.                                      |
| `parchment_great_fracture`    | Cuộn Da Vụ Phân Tách         | `document`    | Ghi chép về sự kiện bẻ gãy quyền năng. (2 trang $\le 220$ ký tự).      |
| `celestial_mechanic_handbook` | Sổ Tay Kỹ Sư Trụ Trời        | `document`    | Hướng dẫn tỷ lệ răng cưa thiên thể. (1 trang $\le 220$ ký tự).         |
| `chronos_private_scrap`       | Mảnh Giấy Riêng Của Chronos  | `document`    | Lời tự sự bí mật của Chronos. (1 trang $\le 220$ ký tự).               |
| `solon_torn_plea`             | Bản Sớ Xé Rách Của Solon     | `document`    | Lời can gián việc cắt tỉa thế giới. (1 trang $\le 220$ ký tự).         |

---

## 12. Tài Nguyên Cần Vẽ (Pipeline B)

Toàn bộ tài nguyên được vẽ theo Pipeline B (Code-authored pixel art hoặc owner tự tay vẽ/duyệt):

1. **Tileset Mới:**
   - `celestial_tileset` (32×32): Nền đá cẩm thạch trắng viền vàng kim, các bánh răng bạch kim rỉ sét, cột trụ Hy Lạp gãy đổ, vực thẳm đen ánh sao tím.
2. **Sprites Nhân Vật & Quái:**
   - **Peter:** Dùng bộ sprite hiện có (`CHAR_PETER_001` / `004`), giữ nghiêm ngặt kiểu tóc xoăn ngắn bồng bềnh tự nhiên.
   - **Kuro:** Sprite hiện có kèm khung hiệu ứng bẻ cong ánh sáng.
   - **The Broken Herald (Mini-Boss):** Kích thước 48×48. Đôi cánh kim loại gãy một bên, áo choàng rách, mặt nạ bạc.
   - **The Genesis Warden (Main Boss):** Kích thước 64×64. Cỗ máy sinh học hình nhân sư cơ khí mang vương miện bánh răng.
   - **Echo of the First Forgotten (Boss Ẩn):** Kích thước 48×48. Bóng đen hư vô lập lòe ánh tím đen.
   - **4 Quái Thường (32×32):** Aether Sentinel, Origin Nullifier, Celestial Reflector, Archon Construct.
   - **The Remnant Deacon (Elite, 40×40):** Vị chấp sự mặc áo thụng bạc cầm búa tạ.

---

## 13. Hỗ Trợ Kỹ Thuật & Yêu Cầu Engine Mới (Dành Cho Claude)

1. **Giao diện Bệ Khắc Ấn (`originInscriptionUI`):**
   - Hỗ trợ menu chọn ký tự cổ (dạng lưới 7 ô icon) và ghép chuỗi 1–3 ký tự. Khi xác nhận, engine kiểm tra chuỗi ký tự qua `ifFlags` hoặc trigger hàm kiểm tra chuỗi.
2. **Cơ chế ngưng tụ hóa đặc của quái (`solidificationWindow`):**
   - Bổ sung cờ `isSolid` trong vòng đời của quái `enemy_aether_sentinel`. Chỉ nhận sát thương khi `isSolid === true`.
3. **Cơ chế rút chốt Boss giữa trận (`interactiveBossWeakpoint`):**
   - Cho phép một POI xuất hiện phía sau lưng boss khi boss chuyển sang trạng thái tụ lực (Stun/Channeling), nhấn phím `[E]` để kích hoạt cờ suy yếu.

---

## 14. Phương Án Kết Chương 6 & Dàn Ý Các Chương Sau [PROPOSAL]

### 14.1. Ba Phương Án Kết Thúc Dở Dang (Cliffhanger) Cho Chương 6

- **Phương án 1: Ngai Vàng Bỏ Trống & Chuông Báo Động Null Hour.**
  - Peter và Kuro đánh bại Genesis Warden bước vào Đại Điện. Ngai vàng hoàn toàn trống rỗng, không có bóng dáng Chronos. Thay vào đó, chiếc đồng hồ tận thế trên trần bắt đầu gióng lên hồi chuông báo động: Null Hour đã điểm.
- **Phương án 2: Ấn Origin Vỡ Đôi & Sự Thức Tỉnh Của Kẻ Đầu Tiên.**
  - Ấn Origin bị nứt làm hai mảnh. Khi Peter chạm vào, mảnh thứ hai tan biến vào vực thẳm hư không; một bàn tay khổng lồ trồi lên từ kẽ nứt vũ trụ kéo Kuro xuống đáy sâu.
- **Phương án 3 (KHUYÊN DÙNG — Đậm chất bi tráng & Đẩy kịch tính lên đỉnh điểm):**
  - Peter và Kuro bước vào Đại Điện, nhận ra **Ngai Vàng Chronos đã vỡ vụn từ hàng ngàn năm trước**.
  - Một ảo ảnh Dư ảnh của Chronos hiện lên, tiết lộ chân tướng khủng khiếp: Chronos không hề phản bội hay bỏ rơi thế giới. Ngài đã tự hy sinh thân xác để tạo thành phong ấn giam cầm **The First Forgotten** dưới đáy vực thẳm Celestial Realm.
  - Sự kiện Peter thu thập đủ 5 Divine Seals và đánh bại Genesis Warden vô tình làm **đứt gãy chốt phong ấn cuối cùng**.
  - Vực thẳm nứt toác, chiếc kén đen của The First Forgotten mở mắt. Làn sóng hư vô hất văng Kuro và Peter về hai hướng không gian đối nghịch.
  - Kuro rơi vào khoảng không vô tận nhưng kịp hét lên: _"Peter! Giữ lấy thanh kiếm... Tao sẽ tìm thấy mày ở điểm tận cùng!"_
  - Peter đứng một mình trên bờ vực đổ nát, thanh kiếm gãy trong tay bùng cháy ngọn lửa Origin toàn phần. Màn hình tối sầm lại với dòng chữ: **"KẾT THÚC CHƯƠNG 6 — THỜI KHẮC CỦA SỰ SỤP ĐỔ ĐÃ BẮT ĐẦU."**

---

### 14.2. Dàn Ý Các Chương Tiếp Theo [PROPOSAL]

Để toàn bộ những hạt giống gieo ở Chương 6 có nơi hồi đáp trọn vẹn, đề xuất lộ trình 3 chương tiếp theo:

#### Chương 7: Chiếc Nôi Của Những Kẻ Bị Quên Lãng (The Cradle of the Forgotten)

- **Bối cảnh:** Tầng sâu nhất của Hư Không (The Deep Void Core) — nơi an nghỉ của những thực tại đã bị xóa sổ hoàn toàn khỏi khái niệm.
- **Nội dung:** Peter bị rơi xuống đáy vực, mất liên lạc với mọi người. Tại đây, cậu gặp lại Dư ảnh của những người từng bị xóa tên (trong đó có mẹ của Kuro, và vị thần The First Forgotten trong hình hài suy kiệt).
- **Trọng tâm:** Peter thấu hiểu trọn vẹn bản chất của Conceptual Erasure và học được cách dùng quyền năng Origin để "tái định danh" cho những linh hồn vô danh. Cậu tìm lại được Kuro, nhưng Kuro lúc này đã hấp thụ năng lượng hư không và trở nên biến đổi.

#### Chương 8: Giờ Số Không & Sự Hội Tụ (The Null Hour & The Convergence)

- **Bối cảnh:** Ranh giới giữa các thế giới sụp đổ hoàn toàn. Bờ biển Khánh Hòa, Đế Chế Sol-Karis, Thành Phố Thép Beta và Thượng Giới nhập làm một trong một vùng đất hỗn mang siêu thực.
- **Nội dung:** Tất cả các nhân vật đồng hành cũ (Neris, Lyra, Ivo, Aldric, Cô Ba, bé Na) cùng xuất hiện trên chiến tuyến cuối cùng để chống lại sự đồng hóa của hư vô.
- **Trọng tâm:** Peter và các đồng đội bảo vệ ngọn tháp mỏ neo trung tâm để ngăn vũ trụ sụp đổ thành một điểm kỳ dị, chuẩn bị cho cuộc gặp gỡ định mệnh với Chronos tái sinh.

#### Chương 9 (Chương Cuối): Vị Thần Gãy Cánh / Chúa Tể Thời Gian Cuối Cùng (The Fractured Divinity / The Last Chronarch)

- **Bối cảnh:** Tâm điểm của Thời Gian — The Nexus of Eternity.
- **Nội dung:** **Trận đối đầu ba bên kinh điển (Chronos – Kuro – Peter)** diễn ra tại đây với cơ chế boss tối hậu _The Sixfold Divinity_.
- **Kết cục:** Người chơi đưa ra quyết định lịch sử để kích hoạt 1 trong 3 kết thúc lớn đã được định hướng trong Story Bible:
  1. _The Eternal Order:_ Khôi phục trật tự Chronos, chấp nhận sự cắt tỉa lạnh lùng.
  2. _The Unbound Eternity:_ Phá hủy ngai vàng cùng Kuro, mở ra kỷ nguyên tự do hỗn loạn.
  3. _The Last Chronarch (True Ending):_ Peter tự nguyện trở thành mỏ neo vĩnh cửu nối liền mọi thế giới, trả lại quyền năng cho nhân loại.

---

## 15. Câu Hỏi Mở Cho Project Owner (Tối đa 6 câu)

1. **Phương án kết chương 6:** Bạn có đồng ý với **Phương án 3 (Khuyên dùng)** — ngai vàng Chronos trống rỗng, phong ấn First Forgotten bị vỡ, và Peter cùng Kuro bị chia cắt để tạo bước đà cho Chương 7 không?
2. **Số lượng chương còn lại:** Định hướng đề xuất từ Chương 7 đến Chương 9 (kết thúc ở Chương 9) có phù hợp với kỳ vọng quy mô tổng thể của bạn không?
3. **Mức độ hiện diện của Kuro:** Ở Chương 6, bạn muốn Kuro đi cùng Peter trong phần lớn thời gian (như Chương 5) hay Kuro nên tách ra đi độc lập để tạo cảm giác cô độc, bí ẩn cho vùng đất thượng giới?
4. **Độ khó của Chữ Khởi Nguyên:** Hệ thống 7 ký tự cổ ghép từ 1–3 ký tự có phù hợp không, hay bạn muốn đơn giản hóa xuống còn 5 ký tự để tránh gây rối cho người chơi?
5. **Ký ức tiệm đồng hồ của Peter:** Việc Peter nhắc lại nỗi đau mất đi ký ức "mùi tiệm đồng hồ buổi sáng" (hậu quả của lựa chọn Chương 5) có đúng với tông giọng cảm xúc mà bạn mong muốn không?
6. **Boss ẩn First Forgotten:** Bạn có muốn cho người chơi chạm trán bản thể phân thân của First Forgotten ngay ở Chương 6 (dưới dạng boss ẩn cực khó), hay giữ kín toàn bộ thực thể này cho Chương 7?

---

## 16. Hợp Đồng ID Dữ Liệu (ID Contract)

> **Quy ước:** Toàn bộ ID của Chương 6 sử dụng tiền tố `ch6_` (cho dialogue, flags, dials), `quest_ch6_` (cho quests), `map_ch6_` (cho maps) và tiền tố rõ nghĩa cho items để đảm bảo tính đồng bộ tuyệt đối trong toàn hệ thống.

### 16.1. Danh mục ID Bản Đồ (`mapId`)

- `map_ch6_celestial_stairs`, `map_ch6_outer_courtyard`, `map_ch6_hall_of_pillars`, `map_ch6_herald_roost`
- `map_ch6_fracture_nave`, `map_ch6_gallery_of_eras`, `map_ch6_frozen_cascade`, `map_ch6_archives_ruins`
- `map_ch6_genesis_core`, `map_ch6_bell_sanctuary`, `map_ch6_refraction_maze`, `map_ch6_threshold_gate`
- `map_ch6_sanctum_approach`, `map_ch6_hall_of_thrones`, `map_ch6_first_void_abyss`
- `map_ch6_secret_chronos_cell`, `map_ch6_celestial_chessboard`, `map_ch6_first_forgotten_nook`

### 16.2. Danh mục ID Vật Phẩm (`itemId`)

- `origin_astral_blade`, `broken_herald_feather`, `echoing_origin_bell`, `solon_mercy_clasp`
- `seal_of_the_first_hour`, `null_origin_insignia`, `genesis_core_shard`, `archon_library_key`
- `genesis_regulator_pin`, `celestial_nectar_flask`, `parchment_great_fracture`
- `celestial_mechanic_handbook`, `chronos_private_scrap`, `solon_torn_plea`

### 16.3. Danh mục ID Nhiệm Vụ (`questId`)

- `quest_ch6_celestial_ascent`, `quest_ch6_herald_fall`, `quest_ch6_fractured_truth`, `quest_ch6_genesis_engine`
- `quest_ch6_the_unwritten_path`, `quest_ch6_empty_throne`, `quest_ch6_abyss_awakening`
- `quest_ch6_solon_atonement`, `quest_ch6_mute_melody`, `quest_ch6_lost_constellation`

### 16.4. Danh mục Cờ Trạng Thái Quan Trọng (`flags`)

- `reached_outer_courtyard`, `solved_ch6_gate_1`, `aligned_pillars_c02`, `defeated_broken_herald`
- `solved_fracture_altars`, `sorted_eras_c04`, `froze_cascade_c05`, `solved_archon_tribunal`
- `activated_genesis_core`, `solved_chime_bell`, `solved_refraction_maze`, `opened_threshold_gate`
- `defeated_genesis_warden`, `witnessed_ch6_cliffhanger`, `resolved_solon_guilt`, `restored_chime_bell`
- `aligned_celestial_chess`, `unlocked_hidden_chronos_cell`, `defeated_echo_first_forgotten`
- `ch6_kuro_ally_active`, `ch6_read_origin_inscription`, `ch6_used_regulator_pin`

---

_Tài liệu kết thúc. Sẵn sàng chuyển giao cho Claude Code review kỹ thuật và trình Project Owner phê duyệt._

---

## 17. Claude Review — Bản Đã Sửa (2026-11-14)

§17 thay thế mọi chỗ khác ở §2–§16 khi hai bên mâu thuẫn. Những gì §17 không nhắc tới thì giữ nguyên.

### 17.1. Lỗi logic phải sửa

**C06 · Ba Archon — đáp án cũ sai.**

- Kẻ Nói Dối và Kẻ Nói Ngược đều luôn nói sai, nên trong ba câu chỉ có đúng một câu đúng.
- Kiểm cả ba trường hợp:
  - Solon nói thật → Kael nói sai, vậy Vane là Kẻ Nói Ngược → câu của Kael ("Vane là kẻ nói ngược") lại đúng. Mâu thuẫn.
  - Kael nói thật → Vane là Kẻ Nói Ngược → câu của Vane ("Tôi không phải kẻ nói dối") đúng. Mâu thuẫn.
  - Vane nói thật → câu của Kael sai (đúng vai) → Solon phải nói sai, nên Kael không phải Kẻ Nói Dối → Kael là Kẻ Nói Ngược, Solon là Kẻ Nói Dối. Không mâu thuẫn.
- **Nghiệm duy nhất:** Vane nói thật (giữ chìa), Kael nói ngược, Solon nói dối.
- Đổi tên vai cho rõ: **Kẻ Giữ Lời** (luôn đúng), **Kẻ Dối Trá** và **Kẻ Phản Ngôn** (cả hai luôn sai). Bia luật ghi đủ ba dòng đó.
- Nhiệm vụ phụ Solon (kẻ dối trá sám hối) vẫn hợp.

**C07 · Bánh răng — số cũ không có nghiệm.**

- Với 6/12/18 răng và nấc 3/2/1, tốc độ quét là 18/24/18, không bằng nhau.
- **Sửa thành 12 / 18 / 36 răng.** Đáp án: Nhỏ = Nấc III, Trung = Nấc II, Lớn = Nấc I (cùng quét 36). Đây là nghiệm duy nhất trong nấc 1–3.
- Bỏ toàn bộ phần nháp tính toán và câu "bộ truyền động phụ 1/2".

**C03 · Hai bệ đối cực — trái canon.**

- `STORY_CHAPTER_06.md` §4 ghi Peter sinh ra từ kẽ nứt giữa **Origin và Finality**, không phải Possibility.
- **Sửa:**
  - Bệ giữa là "Bệ Kẽ Nứt" (trống, không huy hiệu).
  - Sáu bệ quanh chỉ có huy hiệu, không có chữ. Năm huy hiệu người chơi đã thấy ở chương 1–5, còn một huy hiệu lạ là Origin.
  - Cuộn da: _"Một bên quyết điều gì được bắt đầu, một bên quyết điều gì phải kết thúc."_
  - Đáp án: bệ lạ (Origin) + bệ Finality.

**C04 · Bích họa — đáp án trùng thứ tự đang treo.**

- Bốn bức treo sẵn theo thứ tự I→II→III→IV, đúng bằng đáp án.
- **Sửa:** tường treo theo thứ tự II, IV, I, III. Người chơi đặt vào 4 khung (vòng xoay). Đáp án vẫn là I→II→III→IV.

**C05 · Thác — bia lộ đáp án.**

- Bia đang ghi sẵn `[I]`, `[U]` và còn nhắc `[E]` gây rối.
- **Sửa:** bia chỉ tả bằng lời và hình (dòng thác, mặt hồ đóng băng), không có ký tự.

**C10 · Kẻ Vô Danh — câu đố tự mâu thuẫn.**

- Câu sấm cấm `[E]` (không là tạo vật) nhưng đáp án lại có `[E]`.
- **Sửa câu sấm:** _"Ngươi có thân xác như mọi tạo vật. Nhưng sổ trời không chép tên ngươi. Hãy viết chính ngươi."_
- Đáp án `[E][N][X]` (Vật · Tên-không), đúng ngữ pháp ở §17.2.
- Sai có thoại riêng:
  - `[E][X]` → _"Ngươi vẫn đang đứng đây mà."_
  - `[N][X]` → _"Chỉ là một cái tên bị xóa? Ngươi có thân xác."_

**C13 · Tàn Tích Hư Vô — vượt giới hạn và tự đặt nghĩa.**

- Đáp án 4 ký tự trong khi bệ chỉ nhận 3, và `[A]` = "khởi đầu" chưa từng được dạy.
- **Sửa:**
  - Bốn mảnh nhật ký cho biết người ấy là _"ánh sáng đầu tiên"_ và _"tên người bị chính trời xóa"_.
  - Đáp án `[A][N][X]`.

**C11 · Đĩa sao — thiếu dữ kiện.**

- Không ai biết Bọ Cạp nằm ở cung nào.
- **Sửa:** trần mật thất vẽ chòm Bọ Cạp ở cung II. Đối diện là cung VIII.

**C12 · Bàn cờ — luật cũ không có nghiệm.**

- Không bảng 4×4 nào thỏa "Mặt Trời không bao giờ kề Mặt Trăng" (Claude đã chạy máy kiểm hết mọi bảng).
- **Luật mới:**
  - không hai quân cùng loại trên một hàng hay một cột;
  - Mặt Trăng không bao giờ đứng ngay dưới hoặc ngay bên phải Mặt Trời;
  - mỗi Sao Chổi phải chạm ít nhất một Hư Không.
- Với luật mới có 10 bảng hợp lệ. Bàn cờ bày sẵn 12 quân, chừa 4 ô trống (mỗi hàng một ô) sao cho chỉ có một cách điền.
- Claude chọn ô trống và kiểm lại bằng máy khi dựng.

**C02 + C09 · hai câu đố tia sáng cùng kiểu.**

- Cả hai đều là xoay gương dẫn tia, lại chưa có sơ đồ để kiểm đáp án.
- **Sửa:**
  - Giữ C02 (tia sáng qua lăng kính). Sơ đồ sàn phải vẽ đủ để suy ra hướng từng trụ. Claude dựng bản đồ rồi chốt đáp án.
  - **Thay C09 bằng "Vòng Thiên Cầu":** ba vành đồng tâm, mỗi vành có cửa. Xoay vành trong thì vành giữa quay ngược một nấc (khớp răng). Bản đồ sao trên tường cho biết vị trí cửa thẳng hàng.
  - Không thể dò bừa vì các vành kéo nhau. Đây là kiểu suy luận không gian, chưa chương nào có.

### 17.2. Chữ Khởi Nguyên — học thật, ngữ pháp nhất quán

- **Bia không ghi nghĩa tiếng Việt.** Bia chỉ có ký tự + hình vẽ + tình huống. Lần đầu người chơi dùng đúng một ký tự, **Sổ Chữ Cổ** trong túi tự ghi nghĩa. Chưa dùng đúng thì sổ để "?".
- **Ba quy tắc** (người chơi tự rút ra qua C01 → C05 → C10):
  1. `[thứ][X]` = xóa thứ đó. Ví dụ `[A][X]` tắt màn sáng; `[N][X]` = vô danh.
  2. `[thứ][trạng thái]` = biến thứ đó thành trạng thái. Ví dụ `[I][U]` làm dòng thác đứng yên.
  3. Cặp đối: Sáng ↔ Tối, Dòng ↔ Tĩnh. Dùng trong trận Sứ Giả.
- **Thứ tự dạy:**
  - `[A]`, `[X]` ở bản đồ 2;
  - `[O]` ở bản đồ 3 (bích họa ngày/đêm);
  - `[I]`, `[U]` ở C04;
  - `[E]` ở C05;
  - `[N]` ở thư khố sau C06.
- **Giao diện:** bệ khắc 1–3 ô, mỗi ô là một vòng xoay ký tự + nút [Khắc]. Dùng lại `dials`, không cần UI mới.

### 17.3. Chiến đấu — bỏ trùng, đổi sang theo lượt

- **Aether Sentinel trùng quái chập chờn chương 5** (`phase`). Thay bằng **Bóng Gót:** một bóng đuổi theo đúng đường Peter đã đi 1,5 giây trước và chém vào chỗ Peter vừa đứng. Dụ bóng đi qua trụ laser của Archon Construct thì bóng tan.
- **Celestial Reflector gần giống khiên phalanx chương 4.** Thay bằng **Sao Đôi:** hai quả cầu quay quanh nhau. Phải chém trúng cả hai trong vòng 0,5 giây, nếu không chúng nhập lại và hồi máu.
- **Origin Nullifier giữ.** Đổi "khóa kỹ năng" thành làm chậm Peter 3 giây (trên bản đồ không có trạng thái khóa kỹ năng).
- **Archon Construct giữ.**
- **Boss là trận theo lượt.** Mọi thao tác "chạy ra sau lưng, bấm E" đổi thành lựa chọn môi trường:
  - **Sứ Giả Gãy Cánh, pha 2:**
    - Khiên mang một ký tự. Lựa chọn môi trường cho khắc ký tự đối của nó (quy tắc 3).
    - Khắc `[X]` hay khắc trùng ký tự thì khiên hút sức, boss hồi máu.
    - Khắc đúng thì khiên vỡ, boss mất một lượt.
  - **Genesis Warden, pha 2:**
    - Genesis Purge tụ lực 3 lượt, có hiện bộ đếm.
    - Đã đọc sổ tay C07 (cờ `read_celestial_handbook`) thì có lựa chọn **[Rút Chốt Khởi Nguyên]**.
    - Có Kuro thì Kuro giữ boss, rút chốt mất 1 lượt.
    - Không có Kuro thì phải đỡ hoàn hảo một đòn trước để mở lưng boss.
    - Rút chốt: boss mất 400 HP và mất lượt.
    - Không kịp: Purge gây 60% máu tối đa, **không phải 999**. Không có đường chết chắc.
    - `genesis_regulator_pin` là vật nhận được sau khi rút, không phải vật mang vào.
  - **Echo of the First Forgotten:**
    - Đòn vô hình có **gợn đen trên ô của Peter 0,3 giây trước** (không chỉ báo bằng âm thanh).
    - Sương xóa niệm hút 8 MP mỗi lượt cho tới khi Peter dùng lựa chọn khắc `[A]`.
  - **Remnant Deacon:** đỡ ba nhịp (mở rộng `timedBlock.double` thành `count: 3`), cửa sổ hẹp dần.
- Bảng EXP do Claude nối tiếp đường cong hiện có (thang tích lũy). Bỏ bảng ở §9.7.

### 17.4. Mạch truyện — giữ bớt bí mật cho chương sau

Chương 6 không phải chương cuối, nên không trả lời hết mọi câu hỏi mở.

- **OQ-01 (Peter):** hé lộ Peter rơi ra từ kẽ nứt Origin–Finality (đúng canon §4).
  - FB-03: người đỡ đứa bé là một thợ đồng hồ già.
  - Giọng nói trong FB-03 **để mơ hồ**, không khẳng định là Trưởng Lão.
- **OQ-02 (lời hứa):** hé nửa sau ở FB-01 — **giữ**.
- **OQ-03 (Chronos):**
  - FB-02 chỉ hé rằng Chronos tự bẻ quyền năng để tránh "thứ trong Hư Không".
  - Chuyện **Chronos tự hy sinh làm phong ấn để dành cho chương 7+**.
  - Phương án kết 3 sửa: dư ảnh Chronos chỉ nói _"Ngươi vừa mở thứ ta đã khóa."_, không giải thích.
- **OQ-04 (Null Hour):** Bí Mật 3 ("Giờ Thứ 25") — **giữ**, ở mức cảnh báo.
- **OQ-05 (First Forgotten):** Bí Mật 4 chỉ nói _"người từng ngồi cạnh ngai"_. Bỏ chi tiết "vị thần tự nguyện gánh xóa bỏ".
- **Bí Mật 5:** "lời hứa Peter–Kuro là tiếng vọng lời thề Chronos" — **Claude đề xuất bỏ.** Nó biến tình bạn hai người thành định mệnh có sẵn và làm nhẹ lời hứa. Thay bằng: tên Peter và Kuro khắc cạnh nhau trên một phiến đá vô danh (không giải thích).
- **Ấn Origin:**
  - Không phục hồi. Cờ `origin_seal_cracked`, không có `origin_seal_restored`.
  - Màn kết chương 6 dùng cờ này.
  - Ẩn C phải vào được **trước** cảnh kết: lối vào đặt ở Đại Điện, mở sau khi hạ Warden. Bước vào Vực Thẳm là kết chương.

### 17.5. Hồi đáp chương 4–5 — cụ thể hơn

- `ch4_choice_aldric_truth`: Sứ Giả trả lời thêm một câu hỏi về ngai trống.
- `ch4_choice_bran_memorial`: ở danh sách tử sĩ thiên giới, Peter khắc thêm con số 1.427 của Bran. Nhận một dòng thoại và một bùa nhỏ.
- `ch4_choice_elion_burn`: ở thư khố có một "chính sử" tô vẽ. Lần này Peter được chọn giữ hay đốt; chương 6 không phạt lựa chọn nào.
- `pacified_the_gardener`: bỏ "Nhà Kính Khởi Nguyên" (không có bản đồ này). Thay bằng: tiếng chuông gió Đồng–Bạc–Thủy Tinh vang ở Thánh Điện Chuông Câm, cho một gợi ý nhẹ cho C08.
- `completed_na_crane_quest`: dải ruy băng của Na nói một câu khi Peter vào trận boss dưới 30% máu.
- Đổi tên cờ cho khớp chương 5: `ch5_took_alpha_memory` (mất mùi tiệm) / `ch5_refused_alpha_memory` (còn nhớ).

### 17.6. Vật phẩm và nhiệm vụ

- **Thêm vào hợp đồng ID:**
  - `celestial_amber_shard` (thưởng C03);
  - `quartz_oil_drop` ×3 (nhiệm vụ chuông, xếp chồng được);
  - `glyph_codex` (Sổ Chữ Cổ);
  - năm tài liệu `world_secret_*`.
- **`echoing_origin_bell`:** chỉ thưởng ở nhiệm vụ phụ. C08 thưởng mở đường.
- **`quest_ch6_lost_constellation`** có câu chuyện riêng: chòm "Người Thợ Rèn" bị xóa là người đã rèn thanh kiếm gãy của Peter. Giải C12 thì nghe được một câu của người thợ rèn.
- **Tổng bản đồ:** 18 (15 chính + 3 ẩn).
- **Cấp tối đa:** 24.

## 18. Quyết Định Của Owner (2026-11-14)

Owner duyệt §1–§17. Trả lời các câu hỏi mở:

1. Kết chương 6: **đồng ý** phương án 3 (bản đã sửa ở §17.4). Ấn Origin nứt, phong ấn vỡ, Peter và Kuro bị hất về hai phía.
2. Tổng số chương: **đồng ý** dàn ý chương 7–9 ở §14.2 (kết thúc ở chương 9).
3. Bí Mật 5: **bỏ** như Claude đề xuất. Thay bằng phiến đá vô danh khắc tên Peter và Kuro cạnh nhau.
4. Boss ẩn Echo of the First Forgotten: **giữ** ở chương 6.
