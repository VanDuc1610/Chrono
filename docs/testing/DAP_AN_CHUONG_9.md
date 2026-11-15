# Đáp Án & Lí Giải Câu Đố — Chương 9

Tài liệu dành cho người test, tiết lộ toàn bộ đáp án và bốn kết thúc. Dùng **Chọn chương → 9** để bắt đầu ở cấp 29, mang **Kiếm La Bàn Hội Tụ** và **Bùa Sáu Giờ**; trần cấp chương là 30.

Nguồn chính là `public/assets/data/maps.json`, `dialogue.json`, `enemies.json`, `items.json`, `quests.json`; đối chiếu **CHAPTER_09_DESIGN.md §20–§22**, trong đó §22 thay luật C13 cũ. Khi thoại hoặc thiết kế khác cơ chế đã nối trong dữ liệu, tài liệu ghi rõ bên dưới. Tọa độ tính theo ô tile, không phải pixel.

**Cách đọc bảng thao tác:** mỗi lần nhấn **E** tại đúng vòng xoay sẽ chuyển tới giá trị kế tiếp. Số lần bấm tính từ lần đầu vào map, chưa từng xoay vòng đó; vòng không có cờ đã lưu bắt đầu ở giá trị đầu của `values`. Làm từng dòng từ trên xuống, kết thúc dòng trước rồi chuyển sang dòng sau. Không cộng số lần bấm này vào một bộ đã xoay dở. Bộ đúng tự mở thoại sau lần xoay cuối, không cần tìm nút xác nhận. Đóng hết thoại trước khi đi qua cửa hoặc nhận phần thưởng tiếp theo.

## Sơ Đồ Tuyến Đi & Lựa Chọn Kuro

Sáu map dùng chung, theo thứ tự:

| Thứ tự | Map                                                      | Nội dung chính                                        |
| ------ | -------------------------------------------------------- | ----------------------------------------------------- |
| 1      | Đỉnh Tháp Tâm Điểm (`map_ch9_apex_nexus`)                | C01; nghe Chronos gọi Peter là trang giấy đánh rơi    |
| 2      | Ngưỡng Cửa Các Kỷ Nguyên (`map_ch9_threshold_of_epochs`) | Lính Canh Tâm Điểm; manh mối 1                        |
| 3      | Sảnh Lăng Kính Quang Phổ (`map_ch9_prism_atrium`)        | C02; manh mối 2; bí mật I                             |
| 4      | Đại Điện Ba Tuyên Ngôn (`map_ch9_hall_of_three_creeds`)  | C03; manh mối 3; lối ẩn Hầm Mộ                        |
| 5      | Hành Lang Bộ Hồi Thoát (`map_ch9_escapement_gallery`)    | C04; manh mối 4                                       |
| 6      | Thư Khố Da Thuộc Tẩy Xóa (`map_ch9_palimpsest_archive`)  | C05; manh mối 5; lựa chọn nhánh; lối ẩn Két Bánh Răng |

**Lựa chọn thật nằm tại Thư Khố**, trong câu hỏi `ch9_kuro_crossroad` sau C05. Nếu đã đóng chuỗi giải đố, nói với Kuro tại **(14,6)** khi chưa chọn nhánh.

- **“Tao vẫn tin mày. Chiếc ghế ấy luôn có chỗ cho mày.”** → nhánh A, **Chiếc Ghế Trống** (`ch9_route_empty_chair`). Cửa **bắc** mở: Penrose → Ma Phương → Kiến Trúc Sư → Dàn Chuông → Thiên Cầu → Thánh Điện Kẻ Vô Danh → Ngai Vàng Sáu Ấn → Vương Miện. Nhánh này có C06–C10 và kết 1/2/3.
- **“Mày đã giật dây tất cả... Mẹ mày, những vết nứt, mọi thứ!”** → nhánh B, **Kẻ Giật Dây** (`ch9_route_puppet_master`). Cửa **đông** mở: Ngã Tư Phân Kỳ → Bran → Lyra → Neris → Peter Thứ Hai → Ngai Vàng Muôn Nhánh/Kuro. Nghe hết Chronos ở Ngã Tư để có `chronos_plea_heard`, mở lối tới Bran. Nhánh này dẫn tới kết 4.
- Cả hai đáp án đặt `ch9_route_chosen`; điểm chọn biến mất. **Cửa của nhánh còn lại vẫn khóa**, nói “Cánh cổng này không thuộc về con đường mình đã chọn.” Muốn test cả hai, giữ save trước lựa chọn hoặc bắt đầu lại chương.
- Năm manh mối giúp hiểu lời buộc tội, nhưng **dữ liệu hiện không yêu cầu nhặt đủ năm mới chọn nhánh B**. Chỉ cần C05 và lựa chọn trên.

## C01 · Bệ Cân Tam Thế Cổ Đại

**Ở đâu:** Đỉnh Tháp Tâm Điểm (`map_ch9_apex_nexus`). Bia cân tại (12,7).

**Manh mối:** Quá Khứ hơn Hiện Tại 3 khắc; Tương Lai bằng hai lần Quá Khứ trừ Hiện Tại; tổng cả ba là 27.

| Thứ tự | Vòng xoay                     | Từ đầu → đích                 | Bấm E                              |
| ------ | ----------------------------- | ----------------------------- | ---------------------------------- |
| 1      | Quá Khứ (9,8), `ch9_c01_1`    | (trống) → **9 khắc** (`n9`)   | 5 lần: 3 → 5 → 6 → 8 → 9           |
| 2      | Hiện Tại (12,8), `ch9_c01_2`  | (trống) → **6 khắc** (`n6`)   | 3 lần: 3 → 5 → 6                   |
| 3      | Tương Lai (15,8), `ch9_c01_3` | (trống) → **12 khắc** (`n12`) | 7 lần: 3 → 5 → 6 → 8 → 9 → 11 → 12 |

**Vì sao:** gọi Hiện Tại là h thì Quá Khứ = h + 3, Tương Lai = h + 6; 3h + 9 = 27 cho h = 6. `solved_tri_balance` mở cổng bắc.

## C02 · Quang Phổ Tam Giác Lồng

**Ở đâu:** Sảnh Lăng Kính Quang Phổ (`map_ch9_prism_atrium`). Văn bia tại (12,11).

**Manh mối:** Yellow giữa Bắc–Tây Nam cần Đỏ + Lục; Magenta giữa Bắc–Đông Nam cần Đỏ + Lam; Cyan giữa Đông Nam–Tây Nam cần Lam + Lục.

| Thứ tự | Vòng xoay                          | Từ đầu → đích                        | Bấm E                 |
| ------ | ---------------------------------- | ------------------------------------ | --------------------- |
| 1      | Đỉnh Bắc (14,6), `ch9_c02_1`       | (trống) → **Tinh thể Đỏ** (`red`)    | 1 lần                 |
| 2      | Đỉnh Đông Nam (18,13), `ch9_c02_2` | (trống) → **Tinh thể Lam** (`blue`)  | 2 lần: Đỏ → Lam       |
| 3      | Đỉnh Tây Nam (10,13), `ch9_c02_3`  | (trống) → **Tinh thể Lục** (`green`) | 3 lần: Đỏ → Lam → Lục |

**Vì sao:** Bắc là màu chung của Yellow/Magenta nên phải Đỏ; hai đỉnh còn lại lần lượt Lam và Lục. Đúng cả bộ đặt `solved_spectral_interference`, mở Đại Điện.

## C03 · Ba Lời Chứng Khởi Nguyên

**Ở đâu:** Đại Điện Ba Tuyên Ngôn (`map_ch9_hall_of_three_creeds`). Nghe lời chứng tại (13,13).

**Manh mối:** có đúng một người thật hoàn toàn, một người dối hoàn toàn, một người câu đầu dối/câu sau thật.

- Chronos: “Thiên Nguyên nói dối hoàn toàn”; “Bệ của ta là bệ duy nhất không có vết nứt.”
- Kuro: “Chronos là người nói thật hoàn toàn”; “Ta là người nói thật hoàn toàn.”
- Thiên Nguyên: “Kuro nói dối hoàn toàn”; “Chiếc ghế thứ hai từng được đặt cạnh ngai vàng.”

| Thứ tự | Vòng xoay                        | Từ đầu → đích                   | Bấm E                               |
| ------ | -------------------------------- | ------------------------------- | ----------------------------------- |
| 1      | Chronos (7,7), `ch9_c03_1`       | (trống) → **Nửa Thật** (`half`) | 2 lần: Sự Thật → Nửa Thật           |
| 2      | Kuro (13,6), `ch9_c03_2`         | (trống) → **Dối Trá** (`lie`)   | 3 lần: Sự Thật → Nửa Thật → Dối Trá |
| 3      | Thiên Nguyên (19,7), `ch9_c03_3` | (trống) → **Sự Thật** (`truth`) | 1 lần                               |

**Vì sao:** Kuro không thể thật vì sẽ có thêm Chronos thật; cũng không thể nửa thật vì câu sau tự nhận thật. Vậy Kuro dối; Thiên Nguyên thật; Chronos nửa thật. `solved_tri_witness` mở cửa bắc và cửa tây xuống Hầm Mộ C11.

## C04 · Bộ Hồi Thoát Thần Thánh

**Ở đâu:** Hành Lang Bộ Hồi Thoát (`map_ch9_escapement_gallery`). Cuộn giấy tại (4,9).

**Manh mối:** A là số chẵn nguyên tố duy nhất; B = A³; C = √(A × B).

| Thứ tự | Vòng xoay                       | Từ đầu → đích    | Bấm E                       |
| ------ | ------------------------------- | ---------------- | --------------------------- |
| 1      | Gia trọng A (9,8), `ch9_c04_1`  | 1 → **2** (`n2`) | 1 lần                       |
| 2      | Gia trọng B (12,8), `ch9_c04_2` | 1 → **8** (`n8`) | 7 lần, tăng từng số 2 đến 8 |
| 3      | Gia trọng C (15,8), `ch9_c04_3` | 1 → **4** (`n4`) | 3 lần: 2 → 3 → 4            |

**Vì sao:** A = 2, B = 8, C = √16 = 4. Các vòng này bắt đầu ở **1**, không phải ô trống. `solved_escapement` mở Thư Khố.

## C05 · Tẩy Xóa Biên Niên Sử

**Ở đâu:** Thư Khố Da Thuộc Tẩy Xóa (`map_ch9_palimpsest_archive`). Cuộn biên niên tại (14,9).

**Manh mối:** Vàng Son ngoài cùng; Tử Lam ngay dưới Tro Tàn; Xanh Thủy Tinh nằm sâu nhất, chỉ hiện khi Tử Lam tan.

| Thứ tự | Vòng xoay                       | Từ đầu → đích                   | Bấm E                              |
| ------ | ------------------------------- | ------------------------------- | ---------------------------------- |
| 1      | Lượt tẩy 1 (11,10), `ch9_c05_1` | (trống) → **Vàng Son** (`gold`) | 1 lần                              |
| 2      | Lượt tẩy 2 (14,10), `ch9_c05_2` | (trống) → **Tro Tàn** (`ash`)   | 2 lần: Vàng Son → Tro Tàn          |
| 3      | Lượt tẩy 3 (17,10), `ch9_c05_3` | (trống) → **Tử Lam** (`violet`) | 3 lần: Vàng Son → Tro Tàn → Tử Lam |

**Vì sao:** bóc từ ngoài vào trong, để lại chữ Xanh Thủy Tinh. Không cần nhặt lọ dung môi trong túi: bản build dùng dial. `solved_creation_palimpsest` dẫn vào câu hỏi chọn nhánh của Kuro; C05 tự nó chưa mở cả hai cửa.

## C06 · Bậc Thang Penrose Vô Cực

**Ở đâu:** nhánh A, `map_ch9_penrose_ascent`. Đọc bia chân thang tại (3,12).

**Manh mối:** mỗi bước bằng tổng hai bước trước; bắt đầu 1 rồi 2.

| Thứ tự | Vòng xoay                 | Từ đầu → đích            | Bấm E          |
| ------ | ------------------------- | ------------------------ | -------------- |
| 1      | Bậc 3 (4,6), `ch9_c06_1`  | (trống) → **3** (`n3`)   | 1 lần          |
| 2      | Bậc 4 (8,6), `ch9_c06_2`  | (trống) → **5** (`n5`)   | 2 lần: 4 → 5   |
| 3      | Bậc 5 (12,6), `ch9_c06_3` | (trống) → **8** (`n8`)   | 2 lần: 7 → 8   |
| 4      | Bậc 6 (16,6), `ch9_c06_4` | (trống) → **13** (`n13`) | 2 lần: 11 → 13 |
| 5      | Bậc 7 (20,6), `ch9_c06_5` | (trống) → **21** (`n21`) | 2 lần: 20 → 21 |

**Vì sao:** 1, 2, 3, 5, 8, 13, 21 là dãy cộng hai số liền trước. `solved_penrose_steps` mở Ma Phương.

## C07 · Ma Phương Ký Ức

**Ở đâu:** nhánh A, `map_ch9_memory_matrix_vault`.

**Trước khi xoay:** hạ **Đại Pháp Quan** đánh trực tiếp trên bản đồ để có `defeated_nexus_inquisitor`; cả ba vòng đều cần cờ này.

**Manh mối:** mọi hàng, cột, đường chéo tổng 15; bố cục cho sẵn là `[8,1,6] / [3,?,7] / [?,9,?]`.

| Thứ tự | Vòng xoay                     | Từ đầu → đích             | Bấm E            |
| ------ | ----------------------------- | ------------------------- | ---------------- |
| 1      | Trung Tâm (13,9), `ch9_c07_1` | (trống) → **Đá 5** (`n5`) | 3 lần: 2 → 4 → 5 |
| 2      | Tây Nam (10,9), `ch9_c07_2`   | (trống) → **Đá 4** (`n4`) | 2 lần: 2 → 4     |
| 3      | Đông Nam (16,9), `ch9_c07_3`  | (trống) → **Đá 2** (`n2`) | 1 lần            |

**Vì sao:** hàng giữa ép ô tâm = 5; cột trái ép Tây Nam = 4; cột phải ép Đông Nam = 2. Ma phương hoàn chỉnh `[8,1,6] / [3,5,7] / [4,9,2]`. `solved_memory_matrix` mở Thành Trì Kiến Trúc Sư.

## C08 · Dàn Chuông Gãy Cánh

**Ở đâu:** nhánh A, `map_ch9_broken_chime_choir`.

**Manh mối:** chuông ban đầu là Đô/Rê/Fa/La = 0/2/5/9 nửa cung; cần Đô/Mi/Sol/Đô cao = 0/4/7/12. Chuông 1 cố định.

| Thứ tự | Vòng xoay                    | Từ đầu → đích      | Bấm E               |
| ------ | ---------------------------- | ------------------ | ------------------- |
| 1      | Chuông 2 (11,6), `ch9_c08_1` | +0 → **+2** (`n2`) | 2 lần: +1 → +2      |
| 2      | Chuông 3 (15,6), `ch9_c08_2` | +0 → **+2** (`n2`) | 2 lần: +1 → +2      |
| 3      | Chuông 4 (19,6), `ch9_c08_3` | +0 → **+3** (`n3`) | 3 lần: +1 → +2 → +3 |

**Vì sao:** 4 − 2 = 2, 7 − 5 = 2, 12 − 9 = 3. Không đặt thẳng số cao độ 4/7/12 lên vòng: vòng lưu mức tăng. `solved_broken_chime` mở Thiên Cầu.

## C09 · Thiên Cầu Vi Mô

**Ở đâu:** nhánh A, Thánh Đường Thiên Cầu Vi Mô (`map_ch9_astrolabe_nave`).

**Manh mối:** Alpha chu kỳ 3 ngày, vị trí 1; Beta chu kỳ 4, vị trí 2; Gamma chu kỳ 6, vị trí 4. Cần cả ba về vị trí 0.

**Thao tác:** tại (14,10), vòng **`ch9_c09_days`** từ (trống), bấm **2 lần: 1 → 2** (`n2`).

**Vì sao:** (1 + 2) chia hết 3, (2 + 2) chia hết 4, (4 + 2) chia hết 6. Hai ngày là nghiệm nhỏ nhất; `solved_astrolabe` mở Thánh Điện Kẻ Vô Danh.

Trước khi rời phòng, đọc **Chiếc Ghế Thứ Hai** và nghe Kuro. Chọn **“Mẹ mày sẽ nhớ, và tao cũng sẽ mãi mãi nhớ mày.”** để đặt `kuro_heart_opened`, bù điều kiện hòa giải nếu chương 7 chưa ôm Kuro.

## C10 · Trang Sách Khởi Nguyên

**Ở đâu:** nhánh A, Thánh Điện Kẻ Vô Danh (`map_ch9_sanctum_of_the_unwritten`). Đọc bệ khởi thảo tại (9,10).

**Manh mối:** tên Thiên Nguyên xuất hiện trong lời chứng C03 và bản vẽ Chiếc Ghế Thứ Hai; Chronos gọi Peter là “trang giấy ta đánh rơi” ngay đầu chương; hồi ức chiếc ghế và lời hứa với Kuro gợi lời thề còn lại.

| Thứ tự | Vòng xoay                         | Từ đầu → đích                                                    | Bấm E            |
| ------ | --------------------------------- | ---------------------------------------------------------------- | ---------------- |
| 1      | Tên thật (9,8), `ch9_c10_1`       | (trống) → **A. Thiên Nguyên** (`a`)                              | 1 lần            |
| 2      | Bản thể Peter (12,8), `ch9_c10_2` | (trống) → **C. Trang giấy ta đánh rơi** (`c`)                    | 3 lần: A → B → C |
| 3      | Lời thề (15,8), `ch9_c10_3`       | (trống) → **B. Tao sẽ để lại một chiếc ghế trống cho mày** (`b`) | 2 lần: A → B     |

**Vì sao:** định nghĩa đúng người đồng hành cũ, bản thể Peter và lời hứa không độc chiếm ngai. Đáp án bản build là **A – C – B**, không phải ba chữ B của thiết kế cũ.

`solved_final_inscription` mở Ngai Vàng Sáu Ấn và cửa đông tới Thánh Địa C13; nhận **Kiếm Chúa Tể Cuối Cùng** (`last_chronarch_blade`: +29 attack, +4 speed, tầm 48, nhát chém 280 ms, echo 20%). Nhận kiếm không tự trang bị: đổi vũ khí trong túi nếu muốn dùng ngay.

## C11 · Ẩn: Hoán Vị Lời Thề

**Ở đâu:** Hầm Mộ Lời Thề Bị Xóa (`map_ch9_hidden_crypt_of_vows`), cửa **tây (0,10)** Đại Điện Ba Tuyên Ngôn sau C03. Vào map bắt đầu nhiệm vụ **Lời Thề Câm Lặng**.

**Manh mối:** A không đứng đầu và ngay trước C; B ở vị trí lẻ; D cuối cùng.

| Thứ tự | Vòng xoay                | Từ đầu → đích                | Bấm E                |
| ------ | ------------------------ | ---------------------------- | -------------------- |
| 1      | Bệ 1 (4,5), `ch9_c11_1`  | (trống) → **B**              | 2 lần: A → B         |
| 2      | Bệ 2 (7,5), `ch9_c11_2`  | (trống) → **A**              | 1 lần                |
| 3      | Bệ 3 (10,5), `ch9_c11_3` | (trống) → **C (mang khiên)** | 3 lần: A → B → C     |
| 4      | Bệ 4 (13,5), `ch9_c11_4` | (trống) → **D**              | 4 lần: A → B → C → D |

**Vì sao:** D chiếm 4; A–C không thể là 1–2 hay 3–4 nên phải là 2–3, B còn chỗ 1. `solved_permutation_cipher` hoàn thành nhiệm vụ, nhận **Lưỡi Kiếm Thần Gãy** (`broken_divinity_edge`: +26 attack, +5 defense).

## C12 · Ẩn: Bánh Răng Lượng Tử

**Ở đâu:** Két Bánh Răng Lượng Tử (`map_ch9_hidden_quantum_vault`), cửa **tây (0,10)** Thư Khố.

**Mở lối:** cần **`settled_ivo_debt` từ chương 8**: mở Két Sổ Cái Trống, giải sổ cái rồi **báo lại Ivo** tại Quảng Trường Hội Tụ. Chỉ mang Sổ Cái Kuro hoặc đã giải két chương 8 chưa đủ. Điều kiện này độc lập với nhánh A/B. Vào két bắt đầu nhiệm vụ **Bánh Răng Lượng Tử**.

**Manh mối:** bánh I là số lẻ nguyên tố nhỏ nhất; II hơn I một nấc; III là cạnh huyền của tam giác vuông có hai cạnh trước.

| Thứ tự | Vòng xoay                    | Từ đầu → đích    | Bấm E                |
| ------ | ---------------------------- | ---------------- | -------------------- |
| 1      | Bánh I (4,5), `ch9_c12_1`    | 1 → **3** (`n3`) | 2 lần: 2 → 3         |
| 2      | Bánh II (8,5), `ch9_c12_2`   | 1 → **4** (`n4`) | 3 lần: 2 → 3 → 4     |
| 3      | Bánh III (12,5), `ch9_c12_3` | 1 → **5** (`n5`) | 4 lần: 2 → 3 → 4 → 5 |

**Vì sao:** số lẻ nguyên tố nhỏ nhất là 3; II = 4; √(3² + 4²) = 5. Vòng bắt đầu ở **1**. `solved_quantum_gears` hoàn thành nhiệm vụ, nhận **Kỷ Vật Chiếc Ghế Trống** (`empty_chair_token`: +65 max HP, +4 defense).

## C13 · Ẩn: Trận Đồ Bát Giác

**Ở đâu:** Thánh Địa Thiên Nguyên (`map_ch9_hidden_sanctum_of_the_first`), cửa **đông (23,9)** Thánh Điện Kẻ Vô Danh sau C10 (`solved_final_inscription`). Chỉ tiếp cận được qua nhánh A. Vào map bắt đầu **Di Sản Thiên Nguyên**.

**Manh mối:** bia (3,6) nói đang sáng **3, 6, 7, 8**; chạm một cột đảo **chính nó và hai cột kề**. Đánh số theo chiều kim đồng hồ, cột 1 ở đỉnh bắc.

**Đáp án từ trạng thái ban đầu:**

1. Chạm **cột 2 (15,4), `ch9_c13_2`, một lần E**. Nó đảo cột 1/2/3: bộ sáng thành **1, 2, 6, 7, 8**.
2. Chạm **cột 4 (15,12), `ch9_c13_4`, một lần E**. Nó đảo cột 3/4/5: **cả tám cột sáng**.

**Vì sao:** những cột cần đổi là 1, 2, 4, 5; phép đảo tại 2 và 4 cùng đổi cột 3 hai lần, nên cột 3 giữ sáng. Có thể bấm 4 rồi 2, kết quả như nhau. Bấm lại cùng cột hoàn tác thao tác đó; không xoay từng cột tới Sáng một cách độc lập.

`solved_octagonal_inversion` cho **Lõi Kỳ Dị Hư Vô** xuất hiện. Đi hết thoại đúng và chọn **Đọc hai cuộn tài liệu** để nhận bí mật IV/V trước khi đánh boss. Hạ boss mới hoàn tất mục còn lại của Di Sản Thiên Nguyên.

**Khác bản cũ:** không dùng trạng thái sáng 1/3/5/7, không đảo cột đối diện, không tìm cách mở trục giữa. Một câu thoại lúc đến Thánh Địa còn nhắc “Trục Đảo Cực”, nhưng không có dial trục giữa trong dữ liệu hiện tại.

## Năm Manh Mối Của Kuro

Tương tác các điểm sau để nhận tài liệu đọc trong túi. Tọa độ là vị trí POI; mỗi tài liệu chỉ nhận một lần.

| Số  | Tài liệu                                      | Nơi nhặt                                           | Ý nghĩa                                         |
| --- | --------------------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| 1   | Dấu Vết Kẽ Nứt (`clue_ch9_interval_rift`)     | Ngưỡng Cửa Các Kỷ Nguyên, góc tường nứt **(5,13)** | Khả Năng chủ động mở kẽ nứt chương 4            |
| 2   | Sổ Cái Phân Kỳ (`clue_ch9_ledger_divergence`) | Sảnh Lăng Kính, trụ gương vỡ **(23,5)**            | Kuro tính trước các lựa chọn Peter ở chương 5   |
| 3   | Tàn Lửa Kích Nổ (`clue_ch9_seal_spark`)       | Đại Điện Ba Tuyên Ngôn, chân tượng Kuro **(14,7)** | Tia Possibility kích nổ Ấn Origin chương 6      |
| 4   | Người Mẹ Khả Dĩ (`clue_ch9_possible_mother`)  | Hành Lang Bộ Hồi Thoát, tro tím **(14,6)**         | Bản thể “Bà Mai” không có mã linh hồn Khánh Hòa |
| 5   | Kim 11:59 (`clue_ch9_clock_stall`)            | Thư Khố, kệ khuất **(23,15)**                      | Kuro ghim kim để ép Chronos rời ngai            |

Các điểm nhặt lần lượt đặt `found_clue_ch9_1` đến `found_clue_ch9_5`. Thoại “Năm manh mối đã đủ” nối trực tiếp từ manh mối 5, **không kiểm tra bốn cờ trước**; người test vẫn cần tự nhặt đủ nếu muốn kiểm tra trọn bộ.

## Năm Bí Mật Thế Giới

| Số  | Tài liệu                                                     | Cách nhận                                                                                                                           |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| I   | Nỗi Đau Của Chronos (`world_secret_ch9_chronos_grief`)       | Sảnh Lăng Kính, sau tượng **(5,16)**                                                                                                |
| II  | Chiếc Ghế Thứ Hai (`world_secret_ch9_the_empty_chair`)       | Thiên Cầu, hộc đá **(22,14)**; cũng nhận trong chuỗi đến phòng → cảnh báo Kẻ Dệt → đọc bản vẽ. Nối sang nhiệm vụ Trái Tim Kuro      |
| III | Bản Ghi Lỗi Vận Hành (`world_secret_ch9_malfunction_record`) | Nhánh B, Đại Điện Gương Vỡ: **sau khi thắng Peter Thứ Hai**, chọn nhặt cuộn bí mật trong thoại chiến thắng; không có POI nhặt riêng |
| IV  | Lời Trăn Trối (`world_secret_ch9_thien_nguyen_testament`)    | Thánh Địa Thiên Nguyên: giải C13 rồi đi tiếp `ch9_secrets_4_5_pickup`                                                               |
| V   | Lời Tự Thú (`world_secret_ch9_kuro_confession`)              | Nhận cùng bí mật IV trong chính chuỗi thoại C13                                                                                     |

**Lưu ý tuyến:** II/IV/V nằm nhánh A, III nằm nhánh B. Không thể thu cả năm trong một lượt chọn nhánh thông thường. Bí mật IV ở sau C10 nên **không cần lấy IV trước để trả lời tên Thiên Nguyên**; C03 và bản vẽ II đã nói tên này.

## Quái Thường & Elite · Dấu Hiệu Và Cách Khắc Chế

Đánh trực tiếp trên bản đồ; **Shift** lướt né, dùng **Đòn Thời Gian** khi đúng cửa sổ. Giữ khoảng trống quanh mình trước khi dụ quái ra đòn.

- **Lính Canh Tâm Điểm** — Ngưỡng Cửa Các Kỷ Nguyên, **480 HP**. Đường đỏ khóa hướng đâm trong **700 ms**, rồi lao khoảng **220 ms**; sau đó mắc đao **1,2 giây**. Né ngang khỏi đường đỏ hoặc lướt ra sau, đánh lúc mắc đao: sát thương nhận của nó tăng **1,6 lần**; lúc thủ chỉ nhận 40%. Thoại Kuro còn kể “hai nhịp rồi đâm chéo”, nhưng trait hiện tại là **một đòn đâm có báo đường**, không cần đếm hai nhát trước.
- **Bóng Ma Nhiệt Dịch** — Hành Lang Bộ Hồi Thoát, **420 HP**. Lần đầu xuống nửa máu sinh **hai bóng giả**. Dùng Đòn Thời Gian ở gần để xóa bóng, tiếp tục đánh bản thật; bóng giả không gây sát thương lên Peter.
- **Hộ Vệ Bánh Răng** — Penrose, **550 HP**. Khựng/giậm chân **400 ms** trước khi lao. Dùng Đòn Thời Gian ngay lúc khựng để làm nó choáng **2,2 giây**, hoặc né cho nó đâm tường; đánh trong lúc ngã được **gấp đôi sát thương**.
- **Kẻ Dệt Nghịch Lý** — Thiên Cầu, **460 HP**. Kén sáng đỏ phản **100% sát thương** trong **1,8 giây mỗi chu kỳ 3 giây**. Ngừng đánh lúc đỏ; tận dụng khoảng hết đỏ/kén mở **1,2 giây**, rồi rút ra. Đừng chỉ dựa lời thoại hai tiếng chuông để đánh xuyên pha phản.

### Elite · Đại Pháp Quan

**Ở đâu:** Ma Phương Ký Ức, xuất phát **(13,12)**; **1.300 HP**, không phải trận đánh theo lượt.

- Khi Peter vào tầm, nó đứng lại chém **bốn nhịp**, cách nhau **450 ms**, tầm đánh khoảng 70 pixel.
- Giữ ngoài vòng chém, đếm đủ bốn; khi nó đổi sắc xanh nhạt là cửa hở **1,1 giây**. Xông vào chém/Đòn Thời Gian rồi rút. Ngoài cửa ấy đòn bị chắn.
- Hạ nó đặt `defeated_nexus_inquisitor`, thưởng **một Ống Cam Lộ Thần Thánh**; ba vòng C07 mới dùng được. Đóng thoại hậu chiến rồi giải ma phương.

## Boss · Kiến Trúc Sư Nguyên Thủy

**Ở đâu:** Thành Trì Kiến Trúc Sư (`map_ch9_architect_bastion`), **2.200 HP**.

- Mỗi lượt có **ba vòng**, thời gian cơ sở **820 ms**, cửa đỡ đầu **220 ms** rồi hẹp 40 ms mỗi nhịp. Nhấn Space ở vòng chạm Peter; xen đánh, kỹ năng và hồi phục.
- Khi còn **50% HP trở xuống (≤ 1.100)**, lệnh **NGẮT BỘ ĐIỀU ÁP CỔ** xuất hiện ở nhóm phím 6–8. Dùng **một lần** để Kuro giữ tay máy và boss mất **hai lượt**, tranh thủ gây sát thương/hồi phục.
- Hạ HP về 0 để thắng, đi hết thoại Kuro/bánh đà/hồi ức ghế rồi tới Dàn Chuông.
- **Khác mô tả cũ:** bản build không có ba bánh đà cần phá bằng kỹ năng trước. Ngắt bộ điều áp là hỗ trợ gây choáng trong trận, **không phải finisher bắt buộc**; thoại chiến thắng vẫn nhắc hành động ấy.

## Boss · Thần Tính Lục Hợp

**Ở đâu:** Đại Điện Ngai Vàng Sáu Ấn (`map_ch9_hall_of_the_sixfold_throne`), nhánh A, **2.600 HP**.

1. **Trên 60% HP:** hai vòng thật, vàng **Trật Tự** và tím **Khả Năng**, lao từ hai phía. Mỗi lượt có 50% khả năng đồng bộ. **Đồng bộ: một Space đúng lúc** chặn cả hai, Peter không mất máu, boss mất **6% HP tối đa = 156 HP**. Nếu lệch nhau khoảng **300 ms**, bấm riêng từng vòng như chuỗi hai nhịp; không chờ một điểm giao chung.
2. **60% trở xuống (≤ 1.560 HP):** hết chế độ vòng đôi; chuyển sang **ba vòng**, cửa đỡ hẹp dần. Các lời gọi đồng đội mở, mỗi lời gọi **một lần/trận**. Đọc nhãn đang hiện vì nhóm phím **6–8 chỉ có tối đa ba lệnh** và danh sách thay đổi khi dùng.

| Lệnh           | Hiệu ứng thực tế                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| GỌI IVO        | Boss mất 1 lượt                                                                                             |
| GỌI NERIS      | Peter hồi 25% HP tối đa, không vượt đầy máu                                                                 |
| GỌI LYRA       | Boss mất 1 lượt — **dữ liệu hiện dùng `stunTurns: 1`, không phải phá khiên** như §20 mô tả                  |
| HẠC GIẤY BÉ NA | Hồi 30% HP tối đa, chỉ hiện nếu có **`gave_na_papers`** từ việc đưa đủ giấy ở chương 8; không phải hồi sinh |

3. **10% trở xuống (≤ 260 HP):** giữ **`origin_seal_half`** trong túi, chọn **KHẮC TRANG CUỐI** khi xuất hiện. Lệnh này đặt `ch9_last_page_carved` và kết liễu boss. Đánh/kỹ năng giữ nó ở ít nhất 1 HP cho tới finisher; **không cần đánh xuống đúng 1 mới dùng**.

Thắng đặt `defeated_sixfold_divinity`. Đi hết thoại hậu chiến; cửa bắc mở lên Vương Miện để chọn kết 1/2/3.

## Nhánh B · Bốn Đại Phó Tướng

Mỗi trận thắng cho **hai Ống Cam Lộ Thần Thánh** trong thoại hậu chiến, mỗi ống hồi **180 HP + 40 MP**. Đóng/đi tiếp hết thoại để nhận đồ trước trận sau. Hạ từng người mới mở cửa đông đến người tiếp theo.

### Bran Tái Sinh

**Ở đâu:** Thung Lũng Cờ Lệch Pha (`map_ch9_vale_of_twisted_banners`), **1.750 HP**.

- Hai vòng đỡ cơ sở 820 ms; cửa đầu 220 ms, nhịp sau hẹp thêm **70 ms**. Đỡ trọn hai nhịp làm Bran mất thêm **8% HP hiện tại**, ngoài sát thương của Peter.
- Tập trung đỡ đủ chuỗi, đánh/kỹ năng xen hồi máu cho tới 0 HP. Đừng nhầm 8% hiện tại với 8% tối đa.
- §20 nói tưởng niệm Bran chương 4 làm anh mất 200 máu đầu trận. Định nghĩa boss hiện không khai báo hiệu ứng ấy; thoại `ch9_bran_memorial_check` còn chứa cả hai dòng “Nếu có cờ/không có cờ”. Không tính phần giảm 200 vào chiến thuật bắt buộc.

### Pháp Quan Lyra

**Ở đâu:** Phế Tích Pháp Đình Sắt (`map_ch9_iron_tribunal_ruins`), **1.850 HP**.

- Đọc **phán quyết đang có hiệu lực**, làm hành động mà nó **không cấm** để gây vết nứt; cần **3 vết** mới vỡ khiên giảm 80% sát thương.
- **“Kẻ vung gươm sẽ đổ máu!”** cấm **Tấn công/Kỹ năng** → chọn **Đỡ**.
- **“Kẻ chần chừ sẽ bị nghiền nát!”** cấm **Đỡ/Vật phẩm** → chọn **Tấn công hoặc Kỹ năng**.
- Chọn điều bị cấm chịu phạt **22% HP tối đa**. Không hiểu chữ “bẻ bản án” thành cố làm điều cấm. Sau khi khiên vỡ, tiếp tục gây sát thương và đỡ vòng, hạ HP về 0.

### Neris Mất Trí

**Ở đâu:** Thư Phòng Chìm Khả Dĩ (`map_ch9_drowned_scriptorium`), **1.680 HP**.

Chọn lệnh trang trong nhóm 6–8 đúng với câu hát đang hiện:

| Câu hát                                    | Lệnh đúng                        |
| ------------------------------------------ | -------------------------------- |
| “Ai sẽ gọi lại tên người bị quên…”         | **TRANG TÊN** (`page_name`)      |
| “Lối nào dẫn về nhà khi bản đồ đã cháy…”   | **TRANG ĐƯỜNG ĐI** (`page_road`) |
| “Những gì còn lại sau ngọn lửa cuối cùng…” | **TRANG TRO TÀN** (`page_ash`)   |

- Mỗi lần đúng lấy **120 HP** và phá một tầng mực; **3 lần đúng** làm vỡ khiên. Sau đó đánh/kỹ năng tới 0 HP.
- **Khác §20:** chọn sai trong dữ liệu này làm Peter mất **15% HP tối đa + 8 MP**, không hồi máu Neris. Khi khiên còn, ưu tiên đọc câu và chọn trang thay vì cố dồn sát thương qua khiên.

### Peter Thứ Hai

**Ở đâu:** Đại Điện Gương Vỡ (`map_ch9_hall_of_broken_mirrors`), **1.980 HP**.

- Hắn học hành động vừa dùng: Peter Đỡ → hắn Đỡ; Peter dùng vật phẩm → hắn hồi **8% HP tối đa**; Peter dùng kỹ năng → đòn kế hắn nặng **1,6 lần** và khóa kỹ năng Peter một lượt.
- Dùng đánh thường làm nguồn sát thương ổn định. Kỹ năng khi đủ máu chịu phản đòn; hồi phục khi thật cần dù hắn cũng hồi. Đỡ vòng thật, bỏ vòng giả (xác suất mồi 30%).
- Hạ về 0 rồi đi tiếp thoại để nhận hai ống cam lộ và **Bản Ghi Lỗi Vận Hành**; cửa đông mở tới Kuro.

## Boss · Chúa Tể Khả Năng Kuro

**Ở đâu:** Ngai Vàng Muôn Nhánh (`map_ch9_throne_of_infinite_branches`), nhánh B, **2.100 HP**, attack **54**.

- Pha đầu **hai vòng thật**, có vòng mồi vàng tới sớm **300 ms**. Bỏ vòng vàng mồi; canh vòng thật chạm Peter rồi nhấn Space theo từng nhịp.
- **50% trở xuống (≤ 1.050 HP):** ba vòng, có xác suất **40% vòng giả** lao tới rồi rút. Quan sát chuyển động, không bấm sớm theo mồi.
- Giữ `origin_seal_half`. Khi còn **12% trở xuống (≤ 252 HP)**, dùng **TRANG GIẤY TRỞ VỀ** để đặt `ch9_page_returned` và kết liễu. Đòn thường/kỹ năng không thể vượt qua chốt 1 HP; không cần chờ đúng 1 mới chọn lệnh.
- Sau chiến thắng, chọn tiếp **Trang Giấy Trở Về** trong thoại `ch9_kuro_boss_finisher_prompt`; đó là bước chạy cảnh kết 4 sau finisher trong trận. Đi hết chuỗi để tới thẻ kết.
- **Khác §20:** dữ liệu hiện đổi pha theo HP, không có đợt gọi bóng ẩn mỗi ba lượt; pha dưới 50% đặt `hidden: false`. Nhánh B nối thẳng vào chuỗi kết, không cần tìm cửa tới Vương Miện.

## Boss Ẩn · Lõi Kỳ Dị Hư Vô

**Ở đâu:** Thánh Địa Thiên Nguyên, xuất hiện ở **(11,15)** sau C13; **2.600 HP**, attack **62**.

- Hai vòng đỡ **ẩn**, cơ sở 820 ms; canh dấu gợn/nhịp chạm Peter thay cho vòng sáng.
- Cơ chế **khóa lệnh**: theo chu kỳ **3 lượt**, khóa Tấn công hoặc Vật phẩm trong **2 lượt**. Đọc thông báo, dùng **Đòn Thời Gian** để phá khóa và làm đòn kế tiếp được cộng **50% sát thương**.
- **Tấn công đang khóa mà hết MP:** chọn **Đỡ**, chờ lệnh mở lại; dùng vật phẩm hồi MP nếu lệnh Vật phẩm vẫn mở. Đừng cố bấm Tấn công đang khóa rồi tưởng trận bị kẹt. Nếu Vật phẩm bị khóa, vẫn có thể đánh/đỡ trong lúc chờ.
- Hạ về 0 HP, đi hết thoại để nhận **Khóa Hòa Âm Sáu Ấn** (`sixfold_harmony_clasp`: +70 max HP, +6 defense, +6 speed). Không cần finisher riêng.

## Bốn Kết Thúc

Giữ save trước câu hỏi Kuro để test hai nhánh; giữ thêm save trước các bệ Vương Miện để test ba kết nhánh A. Đi hết chuỗi thoại mới đặt cờ kết và `ch9_game_completed`, gọi `endChapter: 9`, hiện thẻ tên kết + câu cuối. **Hết / E / Space / Enter** trở về menu, không có chương tiếp.

### 1 · Trật Tự Vĩnh Cửu

Chọn nhánh **Chiếc Ghế Trống**, giải C06–C10, thắng Thần Tính bằng **Khắc Trang Cuối**; lên **Vương Miện Vĩnh Hằng (`map_ch9_crown_of_eternity`)**. Tương tác **Bệ Trật Tự (7,9)**, xác nhận trao Ấn cho Chronos. Chuỗi `ch9_end_1_*` đặt **`ch9_ending_order`**. Kuro biến mất; trật tự phục hồi nhưng những người bị xóa tên không trở lại.

### 2 · Vĩnh Hằng Bất Tận

Cùng tuyến A như trên, chọn **Bệ Tự Do (19,9)**, xác nhận cùng Kuro chém nát Ngai Vàng. Chuỗi `ch9_end_2_*` đặt **`ch9_ending_unbound`**. Các thực tại tự do nhưng hòa vào giấc mơ hỗn mang.

### 3 · Chúa Tể Thời Gian Cuối Cùng · Kết Thật

Tại Vương Miện, **Bệ thứ ba (13,9)** chỉ cho kết thật khi đủ:

1. **`ch8_learned_torn_page`** — nghe hết chuyện Kẻ Bị Quên Đầu Tiên sau ghép trang chương 8, không chỉ có `solved_torn_page`.
2. **`solved_final_inscription`** — giải đúng C10.
3. **`ch7_kuro_embraced` HOẶC `kuro_heart_opened`** — đã ôm Kuro chương 7, hoặc tại Thiên Cầu chọn nghe/an ủi Kuro: **“Mẹ mày sẽ nhớ, và tao cũng sẽ mãi mãi nhớ mày.”** Chỉ nhận nhiệm vụ Trái Tim Kuro chưa đủ.

Đủ điều kiện, bệ hỏi **Khắc lời thề Chiếc Ghế Trống**; xác nhận, đi hết `ch9_end_3_*` để có **`ch9_ending_true`**. Peter/Kuro trở về Khánh Hòa; một chiếc ghế vẫn dành cho người bạn.

Chưa đủ, bệ nói nguyên văn: **“Bệ thứ ba lạnh ngắt. Còn một con đường thứ ba... nhưng trái tim người bạn đồng hành vẫn chưa được hàn gắn.”** Đây là lời gợi ý chung ngay cả khi thiếu cờ trang xé chương 8. Bệ Trật Tự/Tự Do vẫn dùng được.

### 4 · Trang Giấy Trở Về

Chọn nhánh **Kẻ Giật Dây**, nghe Chronos bị trói tại Ngã Tư, hạ lần lượt Bran/Lyra/Neris/Peter Thứ Hai, thắng Kuro bằng **Trang Giấy Trở Về**. Chọn tiếp lời thoại phong ấn sau trận và đi hết `ch9_end_4_*` để đặt **`ch9_ending_returned_page`**. Peter trở thành trang giấy phong ấn Kuro, thế giới được cứu nhưng quên Peter.

Kết này **không yêu cầu** C10, ôm Kuro hay hạc Na. Theo §22, bản đồ vĩ thanh được gộp vào chuỗi thoại; không cần chuyển sang `map_ch9_epilogue_reborn`, và nhánh B không có bước ghé ba bệ.

## Nhiệm Vụ Phụ & Phần Thưởng

| Nhiệm vụ                                           | Nhận / hoàn thành                                                                | Phần thưởng thực tế                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Lời Thề Câm Lặng** (`quest_ch9_crypt_of_vows`)   | Vào Hầm Mộ sau C03; giải C11                                                     | Lưỡi Kiếm Thần Gãy: +26 attack, +5 defense                                                        |
| **Bánh Răng Lượng Tử** (`quest_ch9_quantum_vault`) | Có `settled_ivo_debt`, vào két từ Thư Khố; giải C12                              | Kỷ Vật Chiếc Ghế Trống: +65 max HP, +4 defense                                                    |
| **Di Sản Thiên Nguyên** (`quest_ch9_first_legacy`) | Vào Thánh Địa sau C10; giải C13 **và** hạ Lõi Kỳ Dị                              | Hai bí mật IV/V trong thoại sau đố; Khóa Hòa Âm Sáu Ấn sau boss, +70 max HP, +6 defense, +6 speed |
| **Trái Tim Kuro** (`quest_ch9_kuro_heart`)         | Đọc bản vẽ II ở Thiên Cầu; chọn “Mẹ mày sẽ nhớ, và tao cũng sẽ mãi mãi nhớ mày.” | `kuro_heart_opened`, một cách đủ điều kiện kết thật; không có thưởng vật phẩm riêng               |

Các nhiệm vụ này không khai báo thưởng tiền/EXP riêng trong `quests.json`; vật phẩm được trao qua hội thoại, EXP boss là phần thưởng trận đánh. Phần thưởng trang bị cần tự đeo trong túi. Chọn chương 9 hiện cấp cả `ch8_learned_torn_page` và `ch7_kuro_embraced`, nên sau C10 đã đủ điều kiện bệ kết thật; nhưng **không tự cấp `settled_ivo_debt` hay `gave_na_papers`**: để test C12/hạc Na phải dùng save có hoàn thành hai việc tương ứng ở chương 8.

## Những Điểm Cần Chú Ý Khi Đối Chiếu

- Lời thoại cũ vẫn còn mô tả “trục giữa” C13, bánh đà Kiến Trúc Sư và điều kiện tưởng niệm Bran; thao tác cần theo dial/mechanic hiện tại như trên.
- Gọi Lyra ở Thần Tính hiện gây choáng một lượt; chọn sai trang Neris phạt Peter; Kuro đổi pha ở 50% HP. Đây là những khác biệt với §20, không phải thao tác bí mật người test cần tìm.
- Câu nói ở đầu đoạn hậu chiến Thần Tính còn kể boss ở 1 HP, nhưng finisher trong dữ liệu mở từ **10% HP**. Tương tự Kuro mở finisher từ **12%**, không phải chỉ ở 1 HP.
- Bí mật III và các bí mật nhánh A không cùng một tuyến; thu đủ năm cần nhiều lượt/save. Không yêu cầu bí mật IV trước C10 vì lối lấy IV chỉ mở sau C10.
- C05 đưa thẳng tới câu hỏi phân nhánh. Nếu muốn nhặt manh mối 5 trước khi quyết định, lấy ở kệ (23,15) **trước khi xoay xong C05**.
