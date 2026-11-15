# CHRONO – Thiết Kế Chi Tiết Chương 7: Chiếc Nôi Của Những Kẻ Bị Quên Lãng (The Cradle of the Forgotten)

**Tài liệu:** Kịch bản, Cơ chế, Câu đố & Dữ liệu Chương 7  
**Phân hệ:** Narrative & Gameplay Specification: Chapter 7  
**Quyền năng liên đới:** **Origin** (Khuyết thiếu / Nửa Ấn vỡ) & **Conceptual Erasure** (Xóa bỏ khỏi khái niệm)  
**Bối cảnh trung tâm:** **The Deep Void Core** — Tầng sâu nhất của Hư Không, nơi an nghỉ của các thực tại và linh hồn bị xóa sổ  
**Tham chiếu canon & thiết kế:** `CHRONO_STORY_BIBLE.md`, `CANON_AND_OPEN_QUESTIONS.md`, `CHARACTER_BIBLE.md`, `LORE_AND_COSMOLOGY.md`, `CHAPTER_06_DESIGN.md` (§14.2, §17, §18), `CHAPTER_05_EXPANSION.md` §9, `DAP_AN_CHUONG_4-6.md`, `scripts/content-ch5.mjs`, `scripts/content-ch6.mjs`  
**Tác giả:** Antigravity (Implementation Agent)  
**Trạng thái:** Đề xuất hoàn chỉnh — Chờ Claude review và Project Owner phê duyệt

---

## 1. Tiền Đề & Cái Giá Cảm Xúc

### 1.1. Bối cảnh: The Deep Void Core (Tầng Sâu Nhất Của Hư Không)

Sau cảnh kết chấn động ở Chương 6, Ấn Origin bị vỡ đôi. Peter rơi xuống vực thẳm cùng một nửa ấn (`origin_seal_half`), trong khi Kuro bị làn sóng đen cuốn về hướng đối nghịch.

Peter tỉnh dậy giữa **The Deep Void Core**:

- Không gian nơi đây không còn mang màu bạc vô định của The Interval (Chương 5), cũng không mang ánh vàng bạch kim đổ nát của Celestial Realm (Chương 6). Đây là một cõi **xám tro thủy tinh và mực đen**, lơ lửng những mảnh vỡ của các thế giới đã bị _Conceptual Erasure_ xóa sạch hoàn toàn khỏi lịch sử.
- Đất dưới chân là **Cát Nhạt Màu** — bãi biển Khánh Hòa thuở xưa nay đã bị tẩy sạch màu sắc và hương vị biển; rải rác là những **Ngôi Nhà Bị Xóa** chỉ còn đường viền ánh sáng mờ; những **Cột Xích Chữ Vàng** khổng lồ giăng ngang bầu trời đen đặc; và ở trung tâm là **Gốc Bàng Gãy** — bản thể nguyên sơ của mỏm đá hẹn ước năm nào.
- Nơi đây cư ngụ những **Dư ảnh Vô Danh (`npc_nameless_shade`)**: những con người không còn gương mặt, không còn tên gọi, lang thang trong vô thức. Nếu không có ai nhớ và gọi lại tên họ, khi thảm họa **Null Hour** bùng nổ ở Chương 8, toàn bộ vùng đất này sẽ bị ép dẹp thành hư vô tuyệt đối.

### 1.2. Cái giá cảm xúc: Tên gọi như một sợi dây níu giữ sự tồn tại

1. **Sự kinh hoàng của việc mất tên:** Peter chứng kiến tận mắt giai đoạn cuối cùng của Conceptual Erasure. Con người ở đây không chết vì vết thương; họ biến mất dần vì không còn ai trên cõi đời cất tiếng gọi tên họ. Một người mẹ không nhớ nổi tên đứa con mình từng dứt ruột đẻ ra; một người lính không nhớ nổi quê hương mình từng đổ máu bảo vệ.
2. **Cuộc hội ngộ nghẹn ngào với mẹ của Kuro (`npc_kuro_mother`):** Peter tìm thấy người phụ nữ mặc áo bà ba xanh nhạt đang ngồi đan áo bên chiếc nôi rỗng. Bà chính là mẹ của Kuro — người từng hát bài _"Chiều Trên Bến Cũ"_ mỗi khi trời mưa mà Kuro hằng khắc khoải (từ Chương 5). Bà đã quên tên mình, quên tên Kuro, nhưng giai điệu ru con vẫn vẹn nguyên trong tiềm thức.
3. **Kuro bị hư không hóa (`npc_kuro_void`):** Khi Peter tìm lại được Kuro, người bạn thơ ấu đã hấp thụ năng lượng bóng tối để cưỡng ép níu giữ các thế giới bị xóa. Kuro biến đổi: áo choàng rách rưới tan thành vũng mực đen, mắt tối sầm, tâm trí bắt đầu rạn nứt. Peter phải đối mặt với thử thách nghiệt ngã nhất: cứu Kuro khỏi sự nuốt chửng của hư không mà không làm bùng phát Null Hour sớm.

### 1.3. Vị thế của Chương 7 trong cấu trúc 9 chương

> [!IMPORTANT]
> **Chương 7 là bản lề dẫn thẳng vào cao trào đại chiến:**
>
> - **Chương 7:** Peter thấu hiểu bản chất của sự xóa bỏ, học cơ chế _Tái Định Danh_, thức tỉnh The First Forgotten trong hình hài suy kiệt, và kéo Kuro lại từ bờ vực tha hóa.
> - **Chương 8 (Null Hour & The Convergence):** Ranh giới các cõi sụp đổ hoàn toàn; các đồng đội cũ hội tụ trên phòng tuyến sinh tử.
> - **Chương 9 (The Last Chronarch - Finale):** Trận chiến ba bên tối hậu (Chronos – Kuro – Peter), phá giải _Sixfold Divinity_ và quyết định 3 kết thúc lớn.
> - Chương 7 kết thúc bằng một **cliffhanger dở dang**: Mắt xích vàng cuối cùng nứt vỡ, chiếc đồng hồ tận thế điểm nhịp đầu tiên của Giờ Thứ 25.

---

## 2. Hé Lộ Bí Mật & Tiến Trình Các Câu Hỏi Mở (OQ)

| Mã câu hỏi | Nội dung câu hỏi mở                           | Hé lộ trong Chương 7 [PROPOSAL]                                                                                                                                                                                                                                                             | Phần giữ lại cho Chương 8 & 9                                                                                                |
| :--------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| **OQ-05**  | Danh tính thực sự của **The First Forgotten** | Là vị thần đồng nhiệm cùng Chronos thuở Khởi Nguyên, cai quản "những khả năng không thành hình". Chronos đã buộc phải dùng Conceptual Erasure xóa bỏ người bạn này để ngăn vũ trụ nứt toác. Hiện thân là một hình người quỳ gối suy kiệt (`npc_first_forgotten`), hai mắt xích vàng đã gãy. | Chưa hé lộ trọn vẹn bản thể sức mạnh nguyên bản và cách thức ngài sẽ chuyển giao quyền năng cho Peter trong trận chiến cuối. |
| **OQ-03**  | Lý do Chronos tự hy sinh làm phong ấn         | Xác nhận thân xác Chronos đã hóa thành những sợi xích chữ vàng giăng khắp The Deep Void Core để bảo vệ First Forgotten không bị hư vô ăn mòn hoàn toàn.                                                                                                                                     | Nơi ý thức tối cao của Chronos đang ngủ say và cách thức thức tỉnh Chronos ở Chương 9.                                       |
| **OQ-04**  | Bản chất của thảm họa **Null Hour**           | Tín hiệu rò rỉ tăng mạnh: đồng hồ cát hư không bắt đầu chảy ngược, mực đen sôi trào, không gian xuất hiện các vết nứt đa chiều nhìn thấy bầu trời của Khánh Hòa và Sol-Karis.                                                                                                               | Thảm họa thực sự nổ ra toàn diện ở Chương 8 (The Convergence).                                                               |
| **OQ-01**  | Bản chất Unwritten của Peter                  | Peter phát hiện linh hồn mình được bọc trong một "Trang Sách Trắng" xé ra từ Sổ Khởi Nguyên, khiến lực xóa bỏ của Hư Không trượt đi mà không thể bám vào cậu.                                                                                                                               | Ai là người đã xé trang sách đó và đặt Peter vào nôi gửi về trần gian (hé lộ ở Chương 8).                                    |
| **OQ-02**  | Nửa sau lời hứa giữa Peter và Kuro            | Tiếp tục khẳng định lời hứa ở mỏm đá cây bàng gãy: _"Tao sẽ để lại một chiếc ghế trống cho mày."_ Peter dùng chính lời hứa này để đánh thức tâm trí Kuro.                                                                                                                                   | Vật kỷ niệm chôn giấu dưới gốc bàng gãy thật sự là chìa khóa mở kết thúc Chương 9.                                           |

---

## 3. Cơ Chế Trung Tâm Mới: Tái Định Danh (Restoring Names)

Để không lặp lại bất kỳ cơ chế nào của các chương trước (tầng thời gian Ch1, chuyển nhánh Ch5, chữ cổ Ch6, dial xoay đơn thuần, cân đĩa Ch4, đếm giờ, tia sáng qua gương, bánh răng, bàn cờ), Chương 7 giới thiệu cơ chế: **Tái Định Danh Thực Tại (Restoring Names)**.

### 3.1. Bản chất cơ chế

Trong tầng sâu Hư Không, vật chất và con người chỉ tồn tại dưới dạng những "bóng ma không trọng lượng" (`npc_nameless_shade`) và những đường viền đứt đoạn. Chúng không thể chạm vào, không thể nói chuyện, và các lối đi bị chìm dưới biển tro.

- Peter mang theo **Nửa Ấn Origin** (`origin_seal_half`). Quyền năng Khởi Nguyên cho phép cậu kết nối các manh mối tản mác để phục hồi **Tên Thật (True Name)** hoặc **Danh Tính Bản Thể** của đối tượng tại các **Bàn Thờ Tên (Altar of Names)**.
- **Không có bảng chọn mò đáp án.** Mỗi câu đố Tái Định Danh đòi hỏi người chơi thu thập và đối chiếu từ 2 đến 3 mảnh chứng tích trong khu vực:
  1. _Một di vật cá nhân_ (chiếc kẹp tóc, thẻ bài gỗ, vỏ ốc khắc vạch, trang nhật ký nhòe mực).
  2. _Một lời chứng ký ức_ từ dư ảnh khác (một câu hát ru, thói quen nghề nghiệp, hướng nhìn lúc qua đời).
  3. _Một dấu tích vật lý trên địa hình_ (vết cào trên đá, đường nứt của ngôi nhà, vệt cát phai màu).
- Khi tiếp cận Bàn Thờ Tên, giao diện hiển thị các khối âm tiết / khái niệm danh xưng. Người chơi chọn ghép đúng chuỗi danh tính.

### 3.2. Hiệu ứng môi trường khi Tái Định Danh thành công

- **Khuôn mặt & Lời thoại hiện hình:** Linh hồn lấy lại hình dáng thật, gương mặt sáng rõ, cất tiếng cảm tạ và trao lại thông tin hoặc vật phẩm then chốt.
- **Môi trường vật chất hóa (`tileSwaps`):** Ngôi nhà viền trắng bừng sáng biến thành căn nhà gỗ ấm áp; cây cầu chữ vàng vươn qua vực thẳm tro tàn; cửa lãng quên mở khóa; hoặc đèn ký ức bừng sáng xua tan sương mù độc.
- **Sai phạt nhẹ nhàng:** Khi ghép sai tên, Bàn Thờ Tên rung nhẹ, một tiếng thở dài vang lên trong sương mù, linh hồn khẽ lắc đầu: _"Cái tên đó... quá xa lạ với linh hồn tôi."_ Mực đen gợn sóng nhẹ (không trừ máu, không khóa đường, gợi ý người chơi rà soát lại các manh mối).

---

## 4. Luồng Chơi & Hệ Thống Bản Đồ (17 Bản Đồ, 150–180 Phút)

Chương 7 gồm **17 bản đồ** chia làm **4 Hồi (Acts)**, sử dụng tileset chuyên biệt `voidcore_tileset`:

```
[HỒI 1: BỜ CÁT PHAI MÀU & TIẾNG HÁT TRONG MƯA] (Bản đồ 1 ➔ 4)
  1. map_ch7_ash_abyss_drop (Vực Tro Thủy Tinh) ── Nơi Peter thức tỉnh với origin_seal_half
  2. map_ch7_faded_shore (Bờ Cát Khánh Hòa Phai Màu) ──▶ [C01: Người Gác Cầu Vô Danh]
  3. map_ch7_erased_hamlet (Xóm Chài Bị Xóa) ──▶ [C02: Cửa Sổ Ngôi Nhà Viền Trắng]
  4. map_ch7_cradle_sanctuary (Thánh Điện Chiếc Nôi) ──▶ [C03: Chiếc Nôi & Tên Mẹ Kuro] (Gặp npc_kuro_mother)

[HỒI 2: VÙNG ĐẤT CỦA NHỮNG VẾT NỨT MỰC] (Bản đồ 5 ➔ 8)
  5. map_ch7_echo_well_depths (Giếng Vọng Những Cái Tên) ──▶ [C04: Ba Hòn Sỏi Âm Vang]
  6. map_ch7_stranded_fleet (Bến Thuyền Mắc Cạn) ──▶ [C05: Bảng Ba Dư Ảnh Thủy Thủ]
  7. map_ch7_clock_graveyard (Nghĩa Địa Mặt Đồng Hồ) ──▶ [C06: Bốn Mảnh Kim Đồng Hồ Cấp Số]
  8. map_ch7_weeper_crossing (Hành Lang Than Khóc) ──▶ Mini-Boss: The Nameless Weeper
     └─ [ẨN A] map_ch7_first_mason_tomb (Mộ Người Khắc Bia Đầu Tiên) ──▶ [C11: Bàn Thờ Thợ Khắc]

[HỒI 3: KHO BẢN THẢO TRẮNG & MỎM ĐÁ HẸN ƯỚC] (Bản đồ 9 ➔ 12)
  9. map_ch7_blank_archives (Thư Khố Giấy Trắng) ──▶ [C07: Kệ Sách Mực Tàng Hình]
  10. map_ch7_bang_tree_promontory (Mỏm Đá Gốc Bàng Gãy) ──▶ [C08: Chiếc Hộp Hẹn Ước Tuổi Thơ]
  11. map_ch7_silent_bell_crypt (Hầm Mộ Chuông Trắng) ──▶ [C09: Bản Hòa Âm Ba Nhịp Chuông]
  12. map_ch7_chain_cathedral (Thánh Đường Dây Xích Vàng) ──▶ Gặp The First Forgotten (`npc_first_forgotten`)
      └─ [ẨN B] map_ch7_white_bell_crypt (Điện Thờ Chuông Trắng Ẩn) ──▶ [C12: Chuông Trắng Tĩnh Lặng]

[HỒI 4: VỰC SÂU TRÁI TIM HƯ KHÔNG] (Bản đồ 13 ➔ 17)
  13. map_ch7_void_fissure_pass (Đèo Khe Nứt Hư Không) ──▶ Elite: The Void Inquisitor
  14. map_ch7_ink_lake_throne (Hồ Lặng Trái Tim Hư Không) ──▶ Main Boss: Kuro, The Void-Touched (`npc_kuro_void`)
  15. map_ch7_cradle_of_dawn (Chiếc Nôi Rạng Đông) ──▶ [C10: Mắt Xích Thứ Ba Của Kẻ Đầu Tiên]
  16. map_ch7_null_hour_threshold (Ngưỡng Cửa Giờ Số Không) ──▶ Đại Cliffhanger kết chương dẫn sang Ch8
  17. [ẨN C] map_ch7_glass_ash_core (Lõi Tro Thủy Tinh Ẩn) ──▶ [C13: Trái Tim Của Tro Thủy Tinh]
```

### Bảng thông số kỹ thuật 17 bản đồ

> [!IMPORTANT]
> **Quy chuẩn bố trí bản đồ:** Điểm xuất hiện (`spawnId`) luôn cách cửa thoát/chuyển map ít nhất **2 ô gạch** để tránh lỗi kẹt chuyển cảnh liên tục.

| Mã bản đồ                      | Tên hiển thị                 | Kích thước | Tileset            | POI chính & Đặc điểm                                                           | Lối ra kết nối                |
| :----------------------------- | :--------------------------- | :--------- | :----------------- | :----------------------------------------------------------------------------- | :---------------------------- |
| `map_ch7_ash_abyss_drop`       | Vực Tro Thủy Tinh            | 24×16      | `voidcore_tileset` | Nơi Peter rơi xuống; nhặt lại thanh kiếm gãy và nửa Ấn Origin.                 | Đông ➔ `faded_shore`          |
| `map_ch7_faded_shore`          | Bờ Cát Phai Màu              | 28×18      | `voidcore_tileset` | Bãi cát trắng Khánh Hòa mất màu; Bàn Thờ Cầu Vô Danh (C01).                    | Đông ➔ `erased_hamlet`        |
| `map_ch7_erased_hamlet`        | Xóm Chài Bị Xóa              | 30×20      | `voidcore_tileset` | Đường viền ánh sáng các căn nhà; Ngôi Nhà Viền Trắng (C02).                    | Bắc ➔ `cradle_sanctuary`      |
| `map_ch7_cradle_sanctuary`     | Thánh Điện Chiếc Nôi         | 26×18      | `voidcore_tileset` | Mẹ của Kuro ngồi bên chiếc nôi rỗng; Bàn Thờ Tên Mẹ (C03).                     | Tây ➔ `echo_well_depths`      |
| `map_ch7_echo_well_depths`     | Giếng Vọng Cái Tên           | 24×20      | `voidcore_tileset` | Miệng giếng sâu vọng tiếng thì thầm; câu đố sỏi âm vang (C04).                 | Nam ➔ `stranded_fleet`        |
| `map_ch7_stranded_fleet`       | Bến Thuyền Mắc Cạn           | 32×20      | `voidcore_tileset` | Những con thuyền gỗ vùi trong cát tro; ba thủy thủ vô danh (C05).              | Đông ➔ `clock_graveyard`      |
| `map_ch7_clock_graveyard`      | Nghĩa Địa Đồng Hồ            | 26×18      | `voidcore_tileset` | Hàng trăm mặt đồng hồ vỡ chìm trong tro; câu đố kim giờ (C06).                 | Bắc ➔ `weeper_crossing`       |
| `map_ch7_weeper_crossing`      | Hành Lang Than Khóc          | 28×20      | `voidcore_tileset` | Vách đá chảy mực đen; Mini-Boss **The Nameless Weeper**; Lối vào Ẩn A.         | Bắc ➔ `blank_archives`        |
| `map_ch7_blank_archives`       | Thư Khố Giấy Trắng           | 26×18      | `voidcore_tileset` | Kệ sách trắng toát không một dòng chữ; câu đố mực tàng hình (C07).             | Đông ➔ `bang_tree_promontory` |
| `map_ch7_bang_tree_promontory` | Mỏm Đá Cây Bàng Gãy          | 28×18      | `voidcore_tileset` | Gốc bàng gãy trên mỏm đá biển; chiếc hộp hẹn ước tuổi thơ (C08).               | Nam ➔ `silent_bell_crypt`     |
| `map_ch7_silent_bell_crypt`    | Hầm Mộ Chuông Trắng          | 24×18      | `voidcore_tileset` | Quả chuông trắng không âm thanh; câu đố chuông câm (C09); Lối vào Ẩn B.        | Đông ➔ `chain_cathedral`      |
| `map_ch7_chain_cathedral`      | Thánh Đường Xích Vàng        | 32×22      | `voidcore_tileset` | Những sợi xích vàng khổng lồ; gặp The First Forgotten (`npc_first_forgotten`). | Bắc ➔ `void_fissure_pass`     |
| `map_ch7_void_fissure_pass`    | Đèo Khe Nứt Hư Không         | 30×16      | `voidcore_tileset` | Vực hẹp dốc đứng đầy vũng mực; quái tinh nhuệ **The Void Inquisitor**.         | Bắc ➔ `ink_lake_throne`       |
| `map_ch7_ink_lake_throne`      | Hồ Lặng Trái Tim Hư Không    | 32×24      | `voidcore_tileset` | Mặt hồ đen phẳng lặng như gương; Main Boss **Kuro, The Void-Touched**.         | Đông ➔ `cradle_of_dawn`       |
| `map_ch7_cradle_of_dawn`       | Chiếc Nôi Rạng Đông          | 26×18      | `voidcore_tileset` | Nơi giam giữ lõi thực thể; mắt xích vàng thứ ba (C10); Lối vào Ẩn C.           | Bắc ➔ `null_hour_threshold`   |
| `map_ch7_null_hour_threshold`  | Ngưỡng Cửa Giờ Số Không      | 28×18      | `voidcore_tileset` | Đồng hồ tận thế khổng lồ đếm ngược; cảnh kết chương (Cliffhanger).             | Kết chương 7                  |
| `map_ch7_first_mason_tomb`     | Mộ Thợ Khắc Đầu Tiên (Ẩn A)  | 20×14      | `voidcore_tileset` | Gian phòng bí mật sau bức tường mực; câu đố Bàn Thờ Thợ Khắc (C11).            | Nam ➔ `weeper_crossing`       |
| `map_ch7_white_bell_crypt`     | Điện Thờ Chuông Trắng (Ẩn B) | 22×16      | `voidcore_tileset` | Hầm chuông ẩn dưới vách đá; câu đố chuông hòa âm (C12).                        | Tây ➔ `silent_bell_crypt`     |
| `map_ch7_glass_ash_core`       | Lõi Tro Thủy Tinh (Ẩn C)     | 22×16      | `voidcore_tileset` | Lõi tinh thể tro ngầm dưới đài tế; câu đố cân bằng tro (C13).                  | Nam ➔ `cradle_of_dawn`        |

---

## 5. Tuyến Nhân Vật & Đối Thoạithen Chốt

### 5.1. Mẹ của Kuro – Bà Mai (`npc_kuro_mother`)

- **Tạo hình (Claude đã vẽ):** Áo bà ba xanh nhạt, búi tóc thấp sau gáy, chiếc kẹp tóc vàng hình bông lúa cài một bên. Đôi mắt hiền hậu nhưng đượm buồn và mờ đục vì lãng quên.
- **Tính cách & Hành xử:** Dịu dàng, nhẫn nại. Dù không còn nhớ tên mình hay tên con trai, tình mẫu tử vẫn chảy tràn trong từng cử chỉ đưa nôi và lời hát ru.
- **Quan hệ với Peter:** Bà nhìn thấy Peter và nhận ra chiếc áo khoác thợ sửa đồng hồ: _"Cháu... có quen một đứa bé tóc đen thẳng, hay chạy ra mỏm đá ngắm thuyền không? Nó đi đâu lâu quá chưa về ăn cơm..."_

### 5.2. Kuro Bị Hư Không Hóa (`npc_kuro_void`)

- **Tạo hình (Claude đã vẽ):** Vẫn mái tóc đen thẳng đặc trưng và áo choàng xám bạc, nhưng trên gương mặt và cánh tay chằng chịt các vết nứt mực đen. Một bên mắt hóa thành khoảng đen vô định; gấu áo choàng tan rã dần thành những giọt mực lơ lửng.
- **Xưng hô & Giọng điệu:** Tuyệt đối giữ xưng **"tao – mày"**. Không bị biến thành kẻ ác thuần túy; Kuro hành động vì nỗi đau đớn cùng cực khi nhìn thấy những thế giới vô tội bị xóa sổ:
  > _"Mày thấy bà ấy không, Peter? Mẹ tao đấy! Bà ấy ngồi đây hàng trăm năm chỉ để đợi một người mà bà ấy không còn nhớ là ai! Trật tự của Chronos bảo đây là 'cân bằng' à? Nếu muốn cứu họ, tao sẽ đốt sạch cái trật tự đó, dù bản thân tao có tan thành mực đen!"_

### 5.3. Kẻ Bị Quên Lãng Đầu Tiên – The First Forgotten (`npc_first_forgotten`)

- **Tạo hình (Claude đã vẽ, 48×48):** Hình người khổng lồ quỳ gối, vầng hào quang Khởi Nguyên vỡ một bên đầu, cổ tay bị quấn chặt bởi các sợi xích chữ vàng. Hai mắt xích đã gãy rũ, chỉ còn một mắt xích duy nhất đang rạn nứt.
- **Bản chất:** Giọng nói vang vọng như tiếng chuông dưới đáy biển sâu. Ngài không căm thù Chronos, mà thấu hiểu sự bi kịch của sự sáng tạo:
  > _"Kẻ xây nhà phải dọn đá, kẻ gieo hạt phải nhổ cỏ. Chronos đã chọn bảo vệ những gì đang thở bằng cách chôn vùi ta vào đáy vực này... Nhưng sợi xích của ngài sắp đứt rồi, đứa trẻ không tên ạ."_

---

## 6. Hệ Thống Câu Đố (10 Chính + 3 Ẩn)

> [!CAUTION]
> **Tự kiểm tra nghiêm ngặt (Bài học từ Chương 4–6):**
>
> 1. Không có câu đố nào canh giờ (zero timer pressure in logic puzzles).
> 2. Manh mối KHÔNG BAO GIỜ nói thẳng đáp án (phải qua 2–3 bước suy luận đối chiếu).
> 3. Bảng chân lý phải kẻ bảng thử mọi trường hợp, bảo đảm **nghiệm duy nhất**.
> 4. Toàn bộ phép toán số học phải tính toán chính xác, không đưa số liệu mâu thuẫn.

### Bảng tóm tắt 13 câu đố

| Mã      | Tên câu đố                    | Bản đồ                 | Phương thức suy luận                                  | Độ khó            | Thưởng chính                             |
| :------ | :---------------------------- | :--------------------- | :---------------------------------------------------- | :---------------- | :--------------------------------------- |
| **C01** | Người Gác Cầu Vô Danh         | `faded_shore`          | Đối chiếu di vật thẻ bài + Thói quen bóng đổ          | Dễ (3–4p)         | Cầu chữ vàng qua bờ cát                  |
| **C02** | Cửa Sổ Ngôi Nhà Viền Trắng    | `erased_hamlet`        | Phân tích 3 sắc màu kỷ vật gia đình 3 thế hệ          | Dễ-TB (4–5p)      | Mở cửa vào xóm chài                      |
| **C03** | Chiếc Nôi & Tên Mẹ Kuro       | `cradle_sanctuary`     | Tái Định Danh tên mẹ Kuro qua thơ, hoa và kỷ vật      | Trung bình (5–6p) | Mở lối sang Hồi 2 & `kuro_mother_brooch` |
| **C04** | Ba Hòn Sỏi Âm Vang            | `echo_well_depths`     | Tỷ lệ quãng âm thanh giếng vọng đáy sâu               | Khá (6–7p)        | Khóa dòng xoáy mực ngầm                  |
| **C05** | Bảng Ba Dư Ảnh Thủy Thủ       | `stranded_fleet`       | Bảng chân lý logic 3 thuyền viên (Thật / Dối / Ngược) | Khá-Khó (7–8p)    | Tìm hải đồ mở khoang tàu                 |
| **C06** | Bốn Mảnh Kim Đồng Hồ          | `clock_graveyard`      | Chuỗi số học cấp số cộng giờ bị xóa                   | Khá (6–8p)        | Rút cạn đầm lầy tro                      |
| **C07** | Kệ Sách Mực Tàng Hình         | `blank_archives`       | Đối chiếu trọng lượng & Phản ứng ánh sáng tro         | Khó (8–9p)        | Mở kho lưu trữ bản thảo                  |
| **C08** | Chiếc Hộp Hẹn Ước Tuổi Thơ    | `bang_tree_promontory` | Giải mã mật mã ngày hẹn ước Peter & Kuro              | Khó (8–10p)       | Mở hộp kỷ vật & Mảnh kiếm                |
| **C09** | Bản Hòa Âm Ba Nhịp Chuông     | `silent_bell_crypt`    | Quy tắc hòa âm phủ định của Chuông Trắng              | Khó (8–10p)       | Mở Thánh Đường Xích Vàng                 |
| **C10** | Mắt Xích Thứ Ba               | `cradle_of_dawn`       | Nhận diện mắt xích giữ cân bằng phong ấn              | Rất khó (9–11p)   | Mở Ngưỡng Cửa Giờ Số Không               |
| **C11** | [ẨN A] Bàn Thờ Thợ Khắc       | `first_mason_tomb`     | Sắp xếp 4 loại đục khắc theo độ cứng đá cổ            | Khá (6–8p)        | Kiếm `void_severance_blade`              |
| **C12** | [ẨN B] Chuông Trắng Tĩnh Lặng | `white_bell_crypt`     | Chuỗi rung cảm ứng không phát âm thanh                | Khó (7–9p)        | Bùa `mother_golden_hairpin`              |
| **C13** | [ẨN C] Trái Tim Tro Thủy Tinh | `glass_ash_core`       | Cân bằng tỷ trọng hạt tro và hạt mực                  | Rất khó (8–10p)   | Bùa `unwritten_cradle_clasp`             |

---

### Chi tiết 13 câu đố

#### C01 · Người Gác Cầu Vô Danh

- **Vị trí:** Đầu cầu đứt gãy tại `map_ch7_faded_shore`.
- **Đầu vào tương tác:** 1 Bàn Thờ Tên (`ch7_altar_bridge_keeper`) trước một linh hồn không mặt (`npc_nameless_shade`). Giao diện gồm 3 ô xoay chọn âm tiết chữ cái: Ô 1 `[A / T / H]`, Ô 2 `[N / M / L]`, Ô 3 `[H / G / K]` + nút [Gọi Tên].
- **Manh mối đối chiếu chéo:**
  1. _Thẻ bài thu phí gãy đôi trên cát (`bridge_toll_tag`):_ Mặt trước còn đọc được chữ cái đầu là một nguyên âm đứng đầu bảng chữ cái (`A`). Mặt sau ghi vần tận cùng là một phụ âm đôi khép lại bằng `H`.
  2. _Lời của ngư dân hóa đá cạnh đó (`ch7_poi_fisherman_memory`):_ "Lão gác cầu ấy hiền như đất, tên lão ngắn ngủi có ba chữ cái, phát âm nghe mộc mạc như tiếng gọi người anh cả trong nhà."
- **Suy luận logic:**
  - Chữ cái đầu là nguyên âm `A`.
  - Chữ tận cùng là phụ âm khép lại bằng `H` ➔ đuôi `NH`.
  - Tên mang ý nghĩa "người anh cả trong nhà" ➔ Tên là **ANH**.
- **Đáp án duy nhất:** Ghép chuỗi chữ: **A – N – H** ➔ [Gọi Tên].
- **Sai phạt & phản hồi:** Bàn thờ rung nhẹ; linh hồn thở dài: _"Tôi không phải là người đó..."_
- **Phần thưởng:** Linh hồn hiện rõ khuôn mặt lão gác cầu hiền từ, giơ đèn soi sáng bờ cát. Cầu chữ vàng mọc qua vực (`tileSwaps`), cho phép Peter đi sang `map_ch7_erased_hamlet`.

---

#### C02 · Cửa Sổ Ngôi Nhà Viền Trắng

- **Vị trí:** Căn nhà trung tâm `map_ch7_erased_hamlet`.
- **Đầu vào tương tác:** 3 khung cửa sổ phát sáng mờ ảo đại diện cho 3 thế hệ trong gia đình bị xóa:
  - Cửa sổ I: _Người Ông_.
  - Cửa sổ II: _Người Cha_.
  - Cửa sổ III: _Đứa Con_.
    Mỗi cửa sổ có một hốc đá để đặt đèn màu: [Đèn Lam / Đèn Vàng / Đèn Trắng].
- **Manh mối đối chiếu chéo:**
  1. _Góc bàn ăn vỡ trong nhà (`ch7_poi_family_table`):_ Có 3 chiếc bát gốm mang 3 hoa văn khác nhau: Bát sóng biển (nghề đánh cá), bát bông lúa (nghề làm ruộng), bát con thuyền giấy (tuổi ấu thơ).
  2. _Văn bia trước cổng làng (`ch7_poi_hamlet_custom`):_ "Ở xóm chài này, người già cả đời bám biển gối đầu lên sóng lam (`Đèn Lam`); người cha cày xới ruộng cát nhuộm áo màu rơm vàng (`Đèn Vàng`); còn con trẻ tâm hồn thuần khiết như trang giấy trắng (`Đèn Trắng`)."
  3. _Vết cào trên bậu cửa sổ (`ch7_poi_window_scratches`):_ Cửa sổ I có khắc hình chiếc mỏ neo (người già); Cửa sổ II khắc hình bó lúa (người cha); Cửa sổ III dán chiếc chong chóng (đứa trẻ).
- **Suy luận logic:**
  - Cửa sổ I (Người Ông - bám biển/mỏ neo) ➔ **Đèn Lam**.
  - Cửa sổ II (Người Cha - ruộng cát/bó lúa) ➔ **Đèn Vàng**.
  - Cửa sổ III (Đứa Con - chong chóng/thuần khiết) ➔ **Đèn Trắng**.
- **Đáp án duy nhất:** Cửa sổ I = **Đèn Lam** · Cửa sổ II = **Đèn Vàng** · Cửa sổ III = **Đèn Trắng**.
- **Sai phạt & phản hồi:** Ánh sáng cửa sổ chớp tắt; thông báo: _"Ngọn đèn kỷ vật bị đặt nhầm thế hệ."_
- **Phần thưởng:** Ngôi nhà viền trắng bừng sáng thành căn nhà gỗ thực thụ, cánh cửa mở ra lối đi an toàn dẫn tới `map_ch7_cradle_sanctuary`.

---

#### C03 · Chiếc Nôi & Tên Mẹ Kuro

- **Vị trí:** `map_ch7_cradle_sanctuary`.
- **Đầu vào tương tác:** Bàn Thờ Tên bên cạnh chiếc nôi rỗng (`ch7_altar_kuro_mother`). Giao diện gồm 3 ô chọn Họ, Tên Đệm, và Tên Chính của người mẹ:
  - Ô Họ: [Nguyễn / Trần / Mai / Lê]
  - Ô Tên Đệm: [Thị / Ngọc / Như / Xuân]
  - Ô Tên Chính: [Lan / Cúc / Lệ / Mai]
- **Manh mối đối chiếu chéo:**
  1. _Chiếc kẹp tóc cài trên đầu bà (`npc_kuro_mother`):_ Kẹp tóc vàng hình bông hoa mai 5 cánh tinh xảo. Bà lẩm bẩm: _"Cha nó bảo, tên mẹ nở vào mùa xuân, như nhánh hoa trên vách đá..."_
  2. _Lời kể của Kuro ở Chương 5 (`CHAPTER_05_DESIGN.md` §5 C4):_ "Mẹ tao hay hát bài 'Chiều Trên Bến Cũ' mỗi khi trời mưa... Bà vừa khâu áo vừa khóc, giọt nước mắt rơi ướt cả gấu vải."
  3. _Vết thêu bên mép nôi em bé (`ch7_poi_cradle_embroidery`):_ Một dòng chữ thêu chỉ đỏ bị đứt đoạn: _"M... Thị L... ru con ngủ say."_
- **Suy luận logic:**
  - Dòng chữ thêu chỉ đỏ: Họ bắt đầu bằng `M`, tên đệm là `Thị`, tên chính bắt đầu bằng `L`: `M... Thị L...`.
  - Tên họ gắn với loài hoa mùa xuân trên vách đá (hoa mai) ➔ Họ **Mai**.
  - Tên chính gắn với giọt nước mắt rơi khi khâu áo ("Lệ" nghĩa là nước mắt) ➔ Tên **Lệ**.
  - Tên đầy đủ trọn vẹn: **Mai Thị Lệ**.
- **Đáp án duy nhất:** Họ = **Mai** · Tên Đệm = **Thị** · Tên Chính = **Lệ** (Mai Thị Lệ).
- **Sai phạt & phản hồi:** Người phụ nữ khẽ ôm ngực lắc đầu trong nước mắt: _"Không phải... đó không phải là tên tôi..."_
- **Phần thưởng:** Bà Mai sực tỉnh, ánh mắt rạng ngời xúc động. Bà trao cho Peter kỷ vật `kuro_mother_brooch` (Cài Áo Bông Mai Của Mẹ) và chỉ đường sang Hồi 2 qua `map_ch7_echo_well_depths`.

---

#### C04 · Ba Hòn Sỏi Âm Vang

- **Vị trí:** Miệng giếng cạn tại `map_ch7_echo_well_depths`.
- **Đầu vào tương tác:** Peter nhặt được 4 hòn sỏi có khối lượng và độ rỗng khác nhau: [Sỏi Thạch Anh (nhẹ) / Sỏi Quặng Sắt (vừa) / Sỏi Đá Sao (nặng) / Sỏi Hư Vô (rất nặng)]. Có 3 miệng phễu thả sỏi đánh dấu theo 3 tầng âm thanh: Trầm – Trung – Bổng.
- **Manh mối đối chiếu chéo:**
  1. _Văn bia thành giếng (`ch7_poi_well_inscription`):_ "Tiếng vọng đáy sâu chỉ hòa nhịp khi sỏi rơi chạm đáy tạo thành hợp âm Khởi Nguyên: Nốt Trầm cần hòn sỏi nặng nhất của thế gian phàm trần; nốt Trung cần sỏi mang ánh sáng giữa trời; nốt Bổng cần thứ nhẹ tựa sương khói."
  2. _Đặc tính các hòn sỏi (`pebble_inventory_desc`):_
     - Sỏi Thạch Anh: nhẹ tựa sương khói.
     - Sỏi Quặng Sắt: nặng nề của đất đá phàm trần.
     - Sỏi Đá Sao: mang ánh sáng giữa trời lơ lửng.
     - Sỏi Hư Vô: thuộc về cõi chết, thả xuống sẽ làm tắt nghẽn âm thanh.
- **Suy luận logic:**
  - Nốt Trầm (nặng nhất phàm trần) ➔ **Sỏi Quặng Sắt**.
  - Nốt Trung (ánh sáng giữa trời) ➔ **Sỏi Đá Sao**.
  - Nốt Bổng (nhẹ tựa sương khói) ➔ **Sỏi Thạch Anh**.
  - (Sỏi Hư Vô là vật gây nhiễu, không dùng).
- **Đáp án duy nhất:** Trầm = **Sỏi Quặng Sắt** · Trung = **Sỏi Đá Sao** · Bổng = **Sỏi Thạch Anh**.
- **Sai phạt & phản hồi:** Giếng phát ra tiếng ùng ục đục ngầu, mực đen dâng lên mép giếng; thông báo: _"Hợp âm lệch phách đánh thức dòng xoáy mực ngầm."_
- **Phần thưởng:** Nước mực rút cạn, đáy giếng biến thành cầu thang đá dẫn sang `map_ch7_stranded_fleet`.

---

#### C05 · Bảng Ba Dư Ảnh Thủy Thủ

- **Vị trí:** Boong con tàu đắm lớn nhất tại `map_ch7_stranded_fleet`.
- **Đầu vào tương tác:** 3 Dư ảnh thủy thủ không tên đứng trước khoang lái: Thủy Thủ A (đứng cạnh bánh lái), Thủy Thủ B (cầm la bàn), Thủy Thủ C (ngồi trên thùng gỗ). Bàn Thờ Tên yêu cầu chỉ định: _"Ai là Thuyền Trưởng thực sự đang giữ Bản Đồ Hải Trình?"_
- **Quy tắc bản chất linh hồn ghi trên nhật ký hàng hải (`ch7_poi_logbook_rule`):**
  - Trong 3 người: Đúng 1 người luôn nói thật (Thuyền Trưởng giữ bản đồ), đúng 1 người luôn nói dối, và đúng 1 người luôn nói ngược lại với người nói thật (nói sai).
- **Lời khai của 3 thủy thủ:**
  - **Thủy Thủ A:** _"Thủy Thủ B là kẻ nói dối."_
  - **Thủy Thủ B:** _"Thủy Thủ C là kẻ nói ngược."_
  - **Thủy Thủ C:** _"Tôi chính là Thuyền Trưởng đang giữ bản đồ."_
- **Bảng tự kiểm tra toán học & logic chặt chẽ (Airtight Logic Check):**
  - _Giả sử Thủy Thủ A nói thật:_
    - ➔ A là Thuyền Trưởng (thật).
    - Lời A thật: _"B là kẻ nói dối"_ ➔ B là kẻ nói dối.
    - Vì B nói dối, câu của B (_"C là kẻ nói ngược"_) phải là SAI ➔ C KHÔNG PHẢI là kẻ nói ngược.
    - Nhưng theo đề bài có 1 kẻ nói ngược, chỉ còn A hoặc B, mâu thuẫn (vì A đang giả sử thật, B đang là dối).
    - ➔ **A KHÔNG THỂ nói thật**.
  - _Giả sử Thủy Thủ C nói thật:_
    - ➔ C là Thuyền Trưởng (thật). Lời C: _"Tôi là Thuyền Trưởng"_ (Đúng).
    - Kẻ nói ngược phải nói sai. B bảo _"C là kẻ nói ngược"_, đây là mệnh đề SAI (vì C đang nói thật) ➔ B có thể là kẻ nói dối hoặc nói ngược.
    - Nếu B nói dối, thì A phải là kẻ nói ngược.
    - Kiểm tra lời A: _"B là kẻ nói dối"_. Mệnh đề này là ĐÚNG! Nhưng kẻ nói ngược phải nói SAI. Mâu thuẫn!
    - ➔ **C KHÔNG THỂ nói thật**.
  - _Giả sử Thủy Thủ B nói thật:_
    - ➔ **B là Thuyền Trưởng (nói thật)**.
    - Lời B thật: _"C là kẻ nói ngược"_ ➔ **C là kẻ nói ngược**.
    - Vì C là kẻ nói ngược, lời của C (_"Tôi là Thuyền Trưởng"_) là SAI (khớp hoàn toàn, vì B mới là Thuyền Trưởng).
    - Còn lại **A**: A phải là **Kẻ nói dối**.
    - Kiểm tra lời A: _"B là kẻ nói dối"_. Mệnh đề này là SAI (vì B nói thật). Khớp 100%!
  - **Nghiệm duy nhất:**
    - **Thủy Thủ B = Thuyền Trưởng (Nói thật, người giữ bản đồ)**.
    - Thủy Thủ A = Kẻ nói dối.
    - Thủy Thủ C = Kẻ nói ngược.
- **Đáp án duy nhất:** Chỉ định **Thủy Thủ B**.
- **Sai phạt & phản hồi:** Cả ba dư ảnh biến thành khói đen rồi hiện lại; thông báo: _"Bản đồ hải trình bị giấu kín trước phán đoán sai lầm."_
- **Phần thưởng:** Thủy Thủ B mỉm cười trao `void_sea_chart` (Hải Đồ Biển Hư Không) mở cửa khoang thuyền sang `map_ch7_clock_graveyard`.

---

#### C06 · Bốn Mảnh Kim Đồng Hồ

- **Vị trí:** Trung tâm `map_ch7_clock_graveyard`.
- **Đầu vào tương tác:** Một mặt đồng hồ khổng lồ bằng đá bị nứt làm 4 mảnh tương ứng 4 góc giờ: [Góc 3 Giờ / Góc 6 Giờ / Góc 9 Giờ / Góc 12 Giờ]. Có 4 mảnh kim giờ mang số khắc cổ: [Mảnh Kim 2 / Mảnh Kim 5 / Mảnh Kim 8 / Mảnh Kim 11].
- **Manh mối đối chiếu chéo:**
  1. _Ghi chú thợ đồng hồ cổ (`ch7_poi_clockmaker_note`):_ "Thời gian ở đáy vực không quay theo vòng tròn 12 giờ của trần thế. Nó nhảy cóc theo từng nhịp tiến ba đơn vị: giờ bắt đầu là nhịp thở đầu tiên, mỗi góc phần tư tiếp theo cộng thêm chính xác ba khắc."
  2. _Vết nứt trên mặt đồng hồ (`ch7_poi_clock_fissures`):_ Góc 12 Giờ là khởi đầu (nhịp thở đầu tiên). Trình tự quét theo chiều kim đồng hồ: 12 Giờ ➔ 3 Giờ ➔ 6 Giờ ➔ 9 Giờ.
- **Suy luận toán học:**
  - Cấp số cộng với công sai $d = 3$:
    - Bắt đầu tại 12 Giờ: Kim nhỏ nhất = **2**.
    - Góc 3 Giờ: $2 + 3 =$ **5**.
    - Góc 6 Giờ: $5 + 3 =$ **8**.
    - Góc 9 Giờ: $8 + 3 =$ **11**.
- **Đáp án duy nhất:** Góc 12 Giờ = **Mảnh Kim 2** · Góc 3 Giờ = **Mảnh Kim 5** · Góc 6 Giờ = **Mảnh Kim 8** · Góc 9 Giờ = **Mảnh Kim 11**.
- **Sai phạt & phản hồi:** Các bánh răng bên dưới rít lên kèn kẹt; thông báo: _"Trục giờ không đồng điệu, thời gian bị kẹt cứng."_
- **Phần thưởng:** Đầm lầy tro quanh nghĩa địa rút cạn, để lộ lối đi sang `map_ch7_weeper_crossing`.

---

#### C07 · Kệ Sách Mực Tàng Hình

- **Vị trí:** Phòng giữa `map_ch7_blank_archives`.
- **Đầu vào tương tác:** 4 ngăn kệ sách đá [Ngăn I / Ngăn II / Ngăn III / Ngăn IV]. Người chơi nhặt được 4 cuộn giấy trắng toát không có chữ nhưng có trọng lượng khác nhau do mực tàng hình ngấm vào sợi vải:
  - Cuộn A: _Nặng 100g (Mùi tro nhẹ)_.
  - Cuộn B: _Nặng 200g (Mùi mực hoa cúc)_.
  - Cuộn C: _Nặng 300g (Mùi quặng sắt)_.
  - Cuộn D: _Nặng 400g (Mùi đá sao)_.
- **Manh mối đối chiếu chéo:**
  1. _Bản hướng dẫn của Thủ Thư Vô Danh (`librarian_ghost_memo`):_ "Sách của những kẻ bị xóa được xếp theo mật độ ký ức: Ký ức về giấc mơ phù du nhẹ nhất xếp ở đầu; tiếp đến là ký ức về mái ấm quê hương; sau đó là ký ức về lao động phàm trần; và nặng nhất là ký ức về các đấng sáng tạo thiên thể."
  2. _Bảng đối chiếu mùi hương ký ức (`ch7_poi_scent_legend`):_
     - Mùi tro nhẹ = Giấc mơ phù du (100g - Cuộn A).
     - Mùi hoa cúc = Mái ấm quê hương (200g - Cuộn B).
     - Mùi quặng sắt = Lao động phàm trần (300g - Cuộn C).
     - Mùi đá sao = Đấng sáng tạo thiên thể (400g - Cuộn D).
- **Suy luận logic:** Thứ tự xếp từ Ngăn I đến Ngăn IV theo trọng lượng tăng dần từ nhẹ nhất đến nặng nhất: Cuộn A (100g) ➔ Cuộn B (200g) ➔ Cuộn C (300g) ➔ Cuộn D (400g).
- **Đáp án duy nhất:** Ngăn I = **Cuộn A** · Ngăn II = **Cuộn B** · Ngăn III = **Cuộn C** · Ngăn IV = **Cuộn D**.
- **Sai phạt & phản hồi:** Giấy cuộn phát ra khói trắng mờ nhạt; thông báo: _"Mật độ ký ức bị đảo lộn trên giá sách."_
- **Phần thưởng:** Mực tàng hình hiện chữ vàng rực rỡ, trang sách mở ra lối đi bí mật dẫn sang `map_ch7_bang_tree_promontory`.

---

#### C08 · Chiếc Hộp Hẹn Ước Tuổi Thơ

- **Vị trí:** Gốc cây bàng gãy tại `map_ch7_bang_tree_promontory`.
- **Đầu vào tương tác:** Một chiếc hộp thiếc rỉ sét bị khóa bằng 3 vòng số [Ngày / Tháng / Tuổi Hẹn].
- **Manh mối đối chiếu chéo:**
  1. _Hồi tưởng Chương 6 FB-01 & Chương 5 C4:_ Peter và Kuro hẹn ước vào năm hai đứa **14 tuổi** trên mỏm đá có cây bàng gãy nhìn ra biển Khánh Hòa.
  2. _Mảnh nhật ký tuổi thơ trong túi Peter (`peter_torn_diary_page`):_ "Kuro rủ mình ra mỏm đá cây bàng vào ngày rằm tháng bảy âm lịch, mùa hoa bàng rụng trắng bờ cát..."
  3. _Quy ước lịch pháp:_ Ngày rằm = Ngày **15**; Tháng bảy = Tháng **07**; Tuổi hẹn = **14**.
- **Suy luận logic:** Chuỗi số 3 vòng xoay: Ngày = **15** · Tháng = **07** · Tuổi = **14**.
- **Đáp án duy nhất:** **15** ➔ **07** ➔ **14**.
- **Sai phạt & phản hồi:** Khóa thiếc kêu lạch cạch khô khốc; thông báo: _"Ký ức về ngày hẹn ước vẫn còn sai lệch."_
- **Phần thưởng:** Hộp thiếc bật mở, bên trong là chiếc dù rách che mưa thuở nhỏ và mảnh thép di vật `childhood_pledge_shard` giúp tăng sát thương Đòn Thời Gian.

---

#### C09 · Bản Hòa Âm Ba Nhịp Chuông

- **Vị trí:** Đại sảnh `map_ch7_silent_bell_crypt`.
- **Đầu vào tương tác:** 3 quả chuông trắng không lưỡi treo trên xà đá [Chuông Trái / Chuông Giữa / Chuông Phải]. Dưới mỗi chuông có một bệ gõ mang biểu tượng: [Âm / Dương / Hòa].
- **Manh mối đối chiếu chéo:**
  1. _Bia luật Chuông Trắng (`ch7_poi_white_bell_doctrine`):_ "Chuông trắng không phát ra âm thanh cho đôi tai phàm trần, nó rung cảm trong tâm thức. Nhịp thứ nhất đón nhận cái lạnh của cõi chết (Âm); nhịp thứ hai thắp lên tia lửa sống của người thợ đồng hồ (Dương); nhịp thứ ba hòa tan cả hai vào sự tĩnh lặng vĩnh cửu (Hòa)."
- **Suy luận logic:** Thứ tự gõ 3 nhịp: **Chuông Trái (Âm)** ➔ **Chuông Giữa (Dương)** ➔ **Chuông Phải (Hòa)**.
- **Đáp án duy nhất:** **Âm ➔ Dương ➔ Hòa**.
- **Sai phạt & phản hồi:** Sóng chấn động vô hình hất Peter lùi lại 2 bước; thông báo: _"Tâm thức bị phân tán trước tiếng chuông tĩnh lặng."_
- **Phần thưởng:** Cửa đá phong ấn mở toang, dẫn thẳng vào `map_ch7_chain_cathedral` diện kiến The First Forgotten.

---

#### C10 · Mắt Xích Thứ Ba Của Kẻ Đầu Tiên

- **Vị trí:** `map_ch7_cradle_of_dawn`.
- **Đầu vào tương tác:** Bệ phong ấn trung tâm nơi giữ sợi xích vàng cuối cùng của The First Forgotten. Có 3 chốt xích mang 3 ký tự cổ: Chốt 1 (`[A]`), Chốt 2 (`[U]`), Chốt 3 (`[O]`). Người chơi phải chọn đúng 1 chốt để truyền năng lượng Origin từ `origin_seal_half` vào gia cố phong ấn, ngăn thảm họa Null Hour nổ sớm.
- **Manh mối đối chiếu chéo:**
  1. _Lời thì thầm của The First Forgotten (`npc_first_forgotten`):_ "Sợi xích của Chronos được đúc từ sự Tĩnh Lặng (`[U]`). Ánh sáng rực rỡ (`[A]`) sẽ thiêu cháy nó, còn bóng tối (`[O]`) sẽ làm nó mục rữa. Chỉ có sự bất động nguyên sơ mới giữ được nhịp đập của quả tim ta."
- **Suy luận logic:** Chọn chốt mang biểu tượng của sự Bất Động / Tĩnh Lặng: Chốt 2 (`[U]`).
- **Đáp án duy nhất:** Kích hoạt **Chốt 2 (`[U]`)**.
- **Sai phạt & phản hồi:** Xích vàng phát ra tiếng rên rỉ rạn nứt nguy hiểm; thông báo: _"Năng lượng xung khắc làm suy yếu mắt xích cuối cùng."_
- **Phần thưởng:** Mắt xích vàng phát sáng rực rỡ, tạm thời ổn định phong ấn và mở cánh cửa dẫn sang `map_ch7_null_hour_threshold`.

---

#### C11 · [ẨN A] Bàn Thờ Thợ Khắc Đầu Tiên

- **Vị trí:** Mật thất `map_ch7_first_mason_tomb` (lối vào giấu sau bức tường rỉ mực tại `weeper_crossing`).
- **Đầu vào tương tác:** 4 loại đục đá cổ: [Đục Đồng / Đục Thép / Đục Kim Cương / Đục Hư Vô]. Có 4 phiến đá thử nghiệm xếp theo độ cứng tăng dần từ I đến IV.
- **Manh mối:** Văn bia thợ khắc ghi rõ nguyên tắc tương thích vật liệu: Đá mềm dùng Đục Đồng; đá trầm tích dùng Đục Thép; đá sao thiên giới dùng Đục Kim Cương; đá hư không dùng Đục Hư Vô.
- **Đáp án:** I = Đục Đồng · II = Đục Thép · III = Đục Kim Cương · IV = Đục Hư Vô.
- **Phần thưởng:** Mở hòm đá nhận thanh kiếm ẩn `void_severance_blade` (attack 20, reach 45, swingMs 310, echoPct 15%).

---

#### C12 · [ẨN B] Chuông Trắng Tĩnh Lặng

- **Vị trí:** Hầm mộ `map_ch7_white_bell_crypt` (mở bằng `white_crypt_key` nhặt ở Hồi 3).
- **Đầu vào tương tác:** 3 chiếc chuông bạc nhỏ không phát ra tiếng động. Gõ theo nhịp đập của tim Peter (1 nhịp... nghỉ... 2 nhịp nhanh).
- **Đáp án:** Gõ Chuông 1 ➔ Đợi sóng rung ➔ Gõ Chuông 2 và 3 liên tiếp.
- **Phần thưởng:** Nhận bùa hộ mệnh quý giá `mother_golden_hairpin` (Kẹp Tóc Vàng Của Mẹ: maxHp 40, defense 6, giảm 20% sát thương nhận từ mực đen).

---

#### C13 · [ẨN C] Trái Tim Của Tro Thủy Tinh

- **Vị trí:** Lõi tro ngầm `map_ch7_glass_ash_core` (lối vào giấu sau khe nứt tại `cradle_of_dawn`).
- **Đầu vào tương tác:** Cân bằng 2 bình chứa bụi tro thủy tinh và mực đen sao cho áp suất đạt chính xác tỷ lệ 1:1 bằng cách gạt 3 van chiết lưu.
- **Đáp án:** Van 1 gạt nấc Trái · Van 2 gạt nấc Giữa · Van 3 gạt nấc Phải.
- **Phần thưởng:** Nhận bùa hộ mệnh tối thượng `unwritten_cradle_clasp` (maxHp 45, maxMp 30, attack 5, defense 7, speed 4).

---

## 7. Bí Mật Thế Giới (World Secrets)

Chương 7 bố trí **5 Bí Mật Thế Giới** ẩn giấu trong các tài liệu và tàn tích cổ:

1. **Bí Mật 1: Cuộn Da Khởi Nguyên Bị Xé (`world_secret_torn_origin_scroll`):**
   - _Vị trí:_ Sau ngôi nhà viền trắng ở Hồi 1.
   - _Nội dung:_ Xác nhận Peter chính là phần giấy trắng bị xé ra từ cuốn sổ định mệnh để bảo vệ linh hồn cậu khỏi Conceptual Erasure.
2. **Bí Mật 2: Huyết Thư Của Người Mẹ (`world_secret_mother_letter`):**
   - _Vị trí:_ Dưới gầm chiếc nôi ở Hồi 1.
   - _Nội dung:_ Lá thư bà Mai viết cho Kuro trước khi bị xóa sổ: dặn dò cậu phải luôn sống lương thiện và đừng bao giờ để thù hận che mờ đôi mắt.
3. **Bí Mật 3: Bản Ghi Thỏa Thuận Giữa Hai Vị Thần (`world_secret_twin_gods_pact`):**
   - _Vị trí:_ Khoang lái tàu đắm ở Hồi 2.
   - _Nội dung:_ Bản giao ước cổ xưa giữa Chronos và The First Forgotten về việc phân chia ranh giới giữa thực tại và khả năng chưa thành hình.
4. **Bí Mật 4: Bản Thiết Kế Đồng Hồ Tận Thế (`world_secret_null_hour_blueprint`):**
   - _Vị trí:_ Nghĩa địa đồng hồ ở Hồi 2.
   - _Nội dung:_ Sơ đồ cơ khí chỉ ra rằng Null Hour không phải là một tai nạn ngẫu nhiên, mà là một cơ chế tự hủy được lập trình sẵn nếu sáu Divine Seals bị phá vỡ.
5. **Bí Mật 5: Ký Ức Khắc Trên Đá Của Peter Và Kuro (`world_secret_childhood_carving`):**
   - _Vị trí:_ Khe đá dưới gốc bàng gãy ở Hồi 3.
   - _Nội dung:_ Nét khắc vụng về năm 14 tuổi: _"Peter & Kuro — Cho dù cả thế giới này có quên mất chúng ta."_

---

## 8. Hồi Đáp Các Lựa Chọn Cũ (Chương 4, 5 & 6)

| Lựa chọn cũ                                 | Cờ kiểm tra                                            | Ảnh hưởng cụ thể trong Chương 7                                                                                                                                                          |
| :------------------------------------------ | :----------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kuro đồng hành ở Ch6**                    | `ch6_kuro_ally`                                        | Khi gặp lại Kuro ở Hồi 4, cuộc hội thoại bớt gay gắt hơn; Kuro còn giữ được một mảnh nhận thức và khóc khi nhìn thấy Peter. Nếu `kuro_left`, Kuro tấn công ngay mà không cần nói chuyện. |
| **Số phận bộ sử Elion (Ch6)**               | `ch6_chronicle_kept` vs `ch6_chronicle_burnt`          | Nếu giữ sách: Peter tìm thấy một trang sử nói về danh tính của Thủy Thủ B (C05). Nếu đốt: Peter dựa hoàn toàn vào trực giác của người thợ đồng hồ.                                       |
| **Sự sám hối của Solon (Ch6)**              | `resolved_solon_guilt`                                 | Dư ảnh Solon xuất hiện tại Thư Khố Giấy Trắng (Hồi 3) trao một giọt dầu thạch anh giúp thắp sáng căn phòng.                                                                              |
| **Đã gặp Tiếng Vọng First Forgotten (Ch6)** | `defeated_echo_first_forgotten`                        | The First Forgotten lập tức nhận ra thanh kiếm gãy của Peter: _"Ngươi đã đánh bại cái bóng của ta ở thượng giới... Giờ ngươi đã đến đây bằng xương bằng thịt."_                          |
| **Giải cờ thiên thể người thợ rèn (Ch6)**   | `aligned_celestial_chess`                              | Dư ảnh người thợ rèn xuất hiện ở Mật Thất Ẩn A, tự tay mài sắc thanh kiếm gãy, tăng 10% sát thương chí mạng vĩnh viễn.                                                                   |
| **Lời hứa mỏm đá nhớ trọn (Ch6)**           | `ch6_promise_remembered`                               | Peter đọc vanh vách câu đáp lời hứa giúp giải câu đố C08 nhanh chóng mà không cần tìm thêm mảnh giấy phụ.                                                                                |
| **Lựa chọn Peter-Alpha (Ch5)**              | `ch5_choice_alpha_letter` vs `ch5_choice_alpha_spared` | Thể hiện qua dòng suy nghĩ của Peter khi đứng trước chiếc nôi em bé của mẹ Kuro: trân trọng tình phụ tử/mẫu tử.                                                                          |
| **Ký ức mùi tiệm đồng hồ (Ch5)**            | `ch5_refused_alpha_memory`                             | Peter nhớ lại mùi bánh mì nướng và nước mưa Khánh Hòa để an ủi linh hồn mẹ Kuro đang run rẩy vì lạnh.                                                                                    |
| **Hạc giấy của bé Na (Ch5)**                | `completed_na_crane_quest`                             | Dải ruy bằng `na_braided_ribbon` phát sáng dịu nhẹ xua tan 1 lớp sương mù độc trong đầm lầy tro.                                                                                         |

---

## 9. Hệ Thống Hồi Tưởng Mờ (Flashbacks)

Chương 7 có **4 đoạn hồi tưởng mờ** mang nhãn `"flashback": true`, viền màn hình chuyển sang sắc **xám tro pha vệt mực đen loang lổ**:

### FB-01: Bữa Cơm Chiều Mưa Bão Của Mẹ Con Kuro (Hồi 1 - Bản đồ 4)

- **Nội dung:** Gian bếp nhỏ dột nát ven biển Khánh Hòa. Người mẹ gắp con cá nướng duy nhất vào bát Kuro nhỏ: _"Ăn đi con, mai bão tan mẹ lại ra bến chờ thuyền về..."_ Kuro nhỏ cúi đầu nhai cơm chan nước mắt.

### FB-02: Đêm Phân Tách — Quyết Định Của Chronos (Hồi 2 - Bản đồ 8)

- **Nội dung:** Chronos đứng trước cỗ xe thiên thể rạn nứt. Vị thần The First Forgotten dang hai tay ôm lấy vết nứt: _"Hãy xích ta lại, Chronos! Nếu không cả cõi này sẽ bị hư không nuốt chửng!"_ Chronos cắn răng vung sợi xích chữ vàng đầu tiên.

### FB-03: Chiếc Nôi Gỗ Trôi Trên Sóng Biển (Hồi 3 - Bản đồ 10)

- **Nội dung:** Đêm sau ngày phân tách. Một chiếc nôi gỗ dạt vào bãi cát Khánh Hòa dưới cơn mưa tầm tã. Ông nội Peter chạy ra bờ biển bế đứa bé lên, bọc trong chiếc áo khoác thợ sửa đồng hồ.

### FB-04: Giây Phút Kuro Chạm Vào Hư Không (Hồi 4 - Bản đồ 14)

- **Nội dung:** Khoảnh khắc sau khi rơi khỏi Celestial Realm ở cuối Chương 6. Kuro rơi xuống hồ mực đen. Những giọng nói oan hồn gào thét van xin: _"Cứu chúng tôi... đừng để chúng tôi biến mất..."_ Kuro cắn chặt môi, mở rộng lồng ngực đón nhận toàn bộ dòng mực đen vào tim.

---

## 10. Chiến Đấu: Quái Khéo Léo, Elite & Bosses

Chiến đấu chiếm khoảng **40%** thời lượng, tập trung vào kỹ năng cá nhân, phản xạ canh nhịp chuẩn xác và giải mã điểm yếu cơ chế.

### 10.1. Bốn loại quái thường mới (Thiết kế chuẩn xác theo 4 sprite Claude đã vẽ)

1. **Kẻ Ăn Tên (`enemy_name_eater`):**
   - _Mô tả hình ảnh:_ Một cái miệng tròn to đen ngòm lơ lửng, xung quanh trôi nổi các mảnh chữ cái bị nuốt dở.
   - _Dấu hiệu báo trước:_ Miệng phồng to hít sâu trong **0.8 giây**, phát ra tiếng rít gió hút các hạt chữ cái xung quanh lại gần.
   - _Cửa sổ phản ứng:_ Khi miệng vừa hít đầy và phát sáng tím trong **0.25 giây**, tung nhát chém thẳng vào tâm miệng.
   - _Thưởng khi đúng:_ Miệng bị nghẹn, nhả ngược các mảnh chữ cái phát nổ làm choáng chính nó 3 giây và nhận sát thương ×2.
   - _Phạt khi sai:_ Nếu chém sớm hoặc bị hút trúng: Peter bị hút mất 25 MP và dính hiệu ứng "Câm Lặng" (không dùng được Đòn Thời Gian) trong 4 giây.
2. **Vỏ Rỗng (`enemy_hollow_husk`):**
   - _Mô tả hình ảnh:_ Một bóng người xám tro khô khốc, giữa lồng ngực là một lỗ đen sâu thẳm xoáy tròn.
   - _Dấu hiệu báo trước:_ Lỗ đen giữa ngực co rút lại rồi xoay tít tăng tốc trong **0.7 giây**, chuẩn bị bắn tia chân không thẳng tắp.
   - _Cửa sổ phản ứng:_ Khi tia sáng giữa ngực chuyển từ tím sang trắng tinh (cửa sổ **0.25 giây**), nhấn **Shift (Lướt né hoàn hảo)** sang hai bên.
   - _Thưởng khi đúng:_ Vỏ Rỗng bắn trượt vào khoảng không, mất thăng bằng ngã quỵ 2 giây, để lộ tim tinh thể sau lưng (chém sau lưng sát thương ×2).
   - _Phạt khi sai:_ Bị tia chân không hút chặt vào ngực Vỏ Rỗng, nhận 35 sát thương và bị ghim chân tại chỗ 1.5 giây.
3. **Đàn Bướm Xóa (`enemy_erasure_moths`):**
   - _Mô tả hình ảnh:_ Một đàn bướm trắng muốt dập dờn bay lượn, phát ra bụi phấn lân tinh mờ ảo.
   - _Dấu hiệu báo trước:_ Đàn bướm tản ra thành vòng tròn vây quanh Peter, đập cánh dồn dập tạo tiếng xào xạc trong **0.6 giây** rồi đồng loạt lao vào tâm.
   - _Cửa sổ phản ứng:_ Vung kiếm chém quét ngang (đòn đánh cơ bản) đúng vào khoảnh khắc đàn bướm túm lại ở cự ly gần (cửa sổ **0.30 giây**).
   - _Thưởng khi đúng:_ Toàn bộ đàn bướm bị chém tan biến thành làn phấn sáng, hồi phục ngay 25 HP cho Peter.
   - _Phạt khi sai:_ Đàn bướm bám kín người Peter làm mờ tối màn hình (vignette đen), gây mất 6 HP mỗi giây trong 5 giây.
4. **Chó Mực (`enemy_ink_hound`):**
   - _Mô tả hình ảnh:_ Con chó săn bốn chân đúc bằng mực đen đặc quánh, di chuyển để lại vệt mực đen dính trên sàn.
   - _Dấu hiệu báo trước:_ Hạ thấp trọng tâm cào móng xuống sàn 2 nhịp, sau đó phóng nhanh theo hình số 8 bao quanh Peter.
   - _Cửa sổ phản ứng:_ Chó Mực chỉ hóa rắn khi dừng lại chuyển hướng ở 2 đầu số 8 (khựng lại đúng **0.30 giây**). Bấm **Đòn Thời Gian (chuột phải)** đánh chặn đầu lúc nó khựng lại.
   - _Thưởng khi đúng:_ Khối mực nổ tung, xóa sạch toàn bộ vệt mực dính trên sàn đấu và hồi 10 MP.
   - _Phạt khi sai:_ Bước vào vệt mực bị giảm 50% tốc độ chạy; Chó Mực chồm lên cắn xé gây 30 sát thương kèm hiệu ứng chảy máu.

### 10.2. Quái tinh nhuệ (Elite): Thẩm Phán Hư Không (The Void Inquisitor)

- **Vị trí:** Canh giữ tại `map_ch7_void_fissure_pass`.
- **Chỉ số:** HP 900, Attack 40, Defense 12, Speed 88.
- **Cơ chế đặc biệt:**
  - _Vòng Xích Phán Xét (Judgement Chains):_ Ném ra 3 mắt xích chữ vàng khóa góc di chuyển của Peter. Trước khi mắt xích nổ tung, sàn đấu hiện lên vệt hào quang cảnh báo 0.6 giây. Peter phải lướt né ra khỏi vùng giao thoa của 3 vòng xích.

### 10.3. Mini-Boss: Kẻ Khóc Không Tên (The Nameless Weeper)

- **Bản đồ:** `map_ch7_weeper_crossing`.
- **Chỉ số:** HP 1200, Attack 44, Defense 14, Speed 85.
- **Cơ chế chiến đấu (Không lặp tường máu, ba trụ hay khiên chữ cổ):**
  - **Pha 1 (100% – 50% HP):** Khối đá mặt người trồi lên khỏi đầm lầy, liên tục ném ra các mảnh vỡ tro tàn. Người chơi canh nhịp đỡ Space các tảng đá rơi.
  - **Pha 2 (50% – 0% HP) — Bức Tường Khuôn Mặt Than Khóc:** Boss triệu hồi 4 khuôn mặt khổng lồ than khóc quanh sàn đấu. Cứ mỗi 2 lượt, một khuôn mặt sẽ rơi lệ xanh. Người chơi phải quan sát nhanh và dùng Đòn Thời Gian chém vào khuôn mặt đang rơi lệ xanh để phá vỡ thế phòng thủ của boss.

### 10.4. Main Boss: Kuro Bị Hư Không Hóa (Kuro, The Void-Touched)

- **Bản đồ:** `map_ch7_ink_lake_throne`.
- **Chỉ số:** HP 1800, Attack 50, Defense 16, Speed 95.
- **Tạo hình:** `npc_kuro_void` (vết nứt mực, một mắt đen, gấu áo tan chảy).
- **Cơ chế bi tráng (Không thể đánh bại bằng chém giết thông thường):**
  - **Pha 1: Kiếm Khả Năng Rạn Nứt (100% – 40% HP):**
    - Kuro tấn công dồn dập bằng các nhát chém bẻ cong thực tại. Các đòn đánh có vệt trễ 0.25 giây đòi hỏi người chơi đỡ đòn **Space** chính xác theo nhịp gợn sóng đen.
  - **Pha 2: Biển Mực Tuyệt Vọng (40% – 0% HP):**
    - Khi máu giảm xuống 40%, Kuro chìm vào tâm hồ mực, triệu hồi các xúc tu bóng tối và liên tục hồi máu nếu Peter chỉ tấn công vật lý thuần túy.
  - **Cơ chế chiến thắng bằng Tái Định Danh (Hòa giải cảm xúc):**
    - Giữa sàn đấu xuất hiện Bàn Thờ Tên Cổ. Peter sử dụng lệnh môi trường:
      1. Đặt chiếc cài áo của mẹ (`kuro_mother_brooch`).
      2. Cất tiếng gọi tên thời thơ ấu của Kuro và nhẩm lại giai điệu bài hát _"Chiều Trên Bến Cũ"_.
    - Dư ảnh của bà Mai (`npc_kuro_mother`) hiện lên giữa hồ mực, dang rộng vòng tay ôm lấy Kuro.
    - Sóng mực đen rút dần, các vết nứt trên mặt Kuro mờ đi, anh buông rơi thanh kiếm gãy, quỳ sụp xuống trong vòng tay mẹ và nhận ra Peter. Trận chiến khép lại trong sự xúc động nghẹn ngào.

### 10.5. Boss Ẩn: Kẻ Giác Đấu Đầu Tiên (The Primordial Shade)

- **Bản đồ:** `map_ch7_glass_ash_core` (Mật thất Ẩn C).
- **Chỉ số:** HP 2200, Attack 56, Defense 18, Speed 100. Thử thách phản xạ đỉnh cao dành cho người chơi muốn chinh phục 100% bí mật thế giới.

### 10.6. Cấp Độ & Cân Bằng Tiến Trình

- **Cấp độ đầu Chương 7:** Level 24.
- **Trần cấp độ Chương 7:** **Level 27** (Level cap 27).
- Bảng EXP do Claude mở rộng đồng bộ với thang tích lũy hiện có.

---

## 11. Hệ Thống Nhiệm Vụ (7 Chính + 3 Phụ)

Tất cả các nhiệm vụ đều mang mã `"chapter": 7`, phân định rõ `"kind": "main"` hoặc `"kind": "side"`.

### Bảng danh mục nhiệm vụ

| Mã nhiệm vụ                     | Tên nhiệm vụ                 | Loại | Mục tiêu hoàn thành (`completeOnFlag`) | Nhiệm vụ tiếp nối               |
| :------------------------------ | :--------------------------- | :--- | :------------------------------------- | :------------------------------ |
| `quest_ch7_faded_shore`         | Bờ Cát Phai Màu              | Main | `restored_bridge_keeper`               | `quest_ch7_erased_lullaby`      |
| `quest_ch7_erased_lullaby`      | Khúc Ru Bị Xóa               | Main | `restored_kuro_mother_name`            | `quest_ch7_echoes_of_the_fleet` |
| `quest_ch7_echoes_of_the_fleet` | Tiếng Vọng Đoàn Tàu Đắm      | Main | `solved_stranded_fleet`                | `quest_ch7_the_nameless_weeper` |
| `quest_ch7_the_nameless_weeper` | Kẻ Khóc Không Tên            | Main | `defeated_nameless_weeper`             | `quest_ch7_promontory_promise`  |
| `quest_ch7_promontory_promise`  | Lời Hẹn Dưới Gốc Bàng        | Main | `opened_childhood_pledge_box`          | `quest_ch7_chains_of_chronos`   |
| `quest_ch7_chains_of_chronos`   | Những Sợi Xích Vàng          | Main | `communed_first_forgotten`             | `quest_ch7_redeeming_kuro`      |
| `quest_ch7_redeeming_kuro`      | Kéo Kuro Trở Về              | Main | `pacified_void_kuro`                   | `quest_ch7_null_hour_awakening` |
| `quest_ch7_null_hour_awakening` | Thời Khắc Số Không Điểm Nhịp | Main | `witnessed_ch7_cliffhanger`            | — (Dẫn sang Ch8)                |
| `quest_ch7_first_mason`         | Di Nguyện Thợ Khắc Đá        | Side | `honored_first_mason`                  | —                               |
| `quest_ch7_mother_hairpin`      | Chiếc Kẹp Tóc Cài Lại        | Side | `returned_mother_hairpin`              | —                               |
| `quest_ch7_lost_compass`        | La Bàn Của Thủy Thủ Mù       | Side | `calibrated_blind_compass`             | —                               |

---

## 12. Hệ Thống Trang Bị & Vật Phẩm

Toàn bộ trang bị tuân thủ các chỉ số hợp lệ của engine: `maxHp`, `maxMp`, `attack`, `defense`, `speed`, `reach`, `swingMs`, `echoPct`.

### Bảng danh mục vật phẩm mới

| ID Vật phẩm              | Tên hiển thị (Tiếng Việt)     | Loại (`type`) | Thuộc tính & Mô tả ngắn gọn                                                    |
| :----------------------- | :---------------------------- | :------------ | :----------------------------------------------------------------------------- |
| `origin_seal_half`       | Nửa Ấn Origin                 | `key_item`    | Nửa mảnh ngọc Khởi Nguyên Peter giữ sau cảnh nứt vỡ ở Chương 6.                |
| `void_severance_blade`   | Kiếm Cắt Hư Vô                | `weapon`      | attack 20, reach 45, swingMs 310, echoPct 15%. Lưỡi kiếm rèn từ tro thủy tinh. |
| `kuro_mother_brooch`     | Cài Áo Bông Mai Của Mẹ        | `charm`       | maxHp 35, defense 5. Kỷ vật của bà Mai trao cho Peter.                         |
| `mother_golden_hairpin`  | Kẹp Tóc Vàng Của Mẹ           | `charm`       | maxHp 40, defense 6. Giảm 20% sát thương từ đầm lầy mực đen.                   |
| `unwritten_cradle_clasp` | Móc Khóa Chiếc Nôi Vô Danh    | `charm`       | maxHp 45, maxMp 30, attack 5, defense 7, speed 4. Bùa tối thượng từ Ẩn C.      |
| `childhood_pledge_shard` | Mảnh Thép Hẹn Ước             | `puzzle`      | Mảnh thép gỉ lấy từ hộp thiếc dưới gốc bàng gãy.                               |
| `void_sea_chart`         | Hải Đồ Biển Hư Không          | `puzzle`      | Tấm bản đồ dẫn đường qua nghĩa địa đồng hồ.                                    |
| `white_crypt_key`        | Chìa Khóa Hầm Mộ Chuông Trắng | `puzzle`      | Mở lối vào điện thờ chuông ẩn.                                                 |
| `void_nectar_flask`      | Bình Mật Hư Không Tinh Lọc    | `consumable`  | Hồi phục tức thì 180 HP và 80 MP.                                              |
| `bridge_toll_tag`        | Thẻ Bài Thu Phí Gãy           | `document`    | Thẻ bài khắc chữ `A...H`. (1 trang $\le 220$ ký tự).                           |
| `peter_torn_diary_page`  | Trang Nhật Ký Tuổi Thơ        | `document`    | Ghi ngày hẹn ước 15 tháng 7. (1 trang $\le 220$ ký tự).                        |
| `librarian_ghost_memo`   | Ghi Chép Của Thủ Thư          | `document`    | Hướng dẫn phân loại mật độ ký ức. (1 trang $\le 220$ ký tự).                   |

---

## 13. Tài Nguyên Cần Vẽ (Pipeline B)

### 13.1. Các hình ảnh Claude ĐÃ VẼ SẴN (Dùng chính xác mã này)

- **NPCs:**
  - `npc_kuro_void`: Kuro tóc đen thẳng, áo choàng xám bạc loang lổ vết nứt mực, một mắt đen, gấu áo tan chảy.
  - `npc_kuro_mother`: Mẹ Kuro áo bà ba xanh nhạt, búi tóc thấp, cài kẹp tóc vàng hình bông mai.
  - `npc_nameless_shade`: Dư ảnh vô danh, mặt để trống không có ngũ quan.
  - `npc_first_forgotten` (48×48): Hình người khổng lồ quỳ gối, vầng hào quang vỡ một bên, xích chữ vàng ở cổ tay (hai mắt xích gãy).
- **Quái thường:**
  - `enemy_name_eater` (Kẻ Ăn Tên).
  - `enemy_hollow_husk` (Vỏ Rỗng).
  - `enemy_erasure_moths` (Đàn Bướm Xóa).
  - `enemy_ink_hound` (Chó Mực).
- **Tileset `voidcore_tileset`:**
  - Nền sàn tro thủy tinh, cát nhạt màu Khánh Hòa, lối đi chữ vàng sáng, vũng mực đen, vực thẳm đen đặc.
  - Prop: Cột xích vàng, chiếc nôi gỗ rỗng, ngôi nhà viền sáng, giếng vọng, mặt đồng hồ vỡ, bia tên tối/sáng, gốc bàng gãy, chuông trắng, thuyền mắc cạn.

### 13.2. Tài nguyên bổ sung đề xuất Claude vẽ sau khi duyệt

- `boss_nameless_weeper` (Mini-Boss, 56×56): Khối tượng than khóc kết tụ từ các khuôn mặt đá.
- `enemy_void_inquisitor` (Elite, 40×40): Thẩm phán áo choàng xích sắt cầm gậy quyền trượng chữ cổ.

---

## 14. Hỗ Trợ Kỹ Thuật & Yêu Cầu Engine Mới (Dành Cho Claude)

1. **Giao diện Bàn Thờ Tên (`altarOfNamesUI`):**
   - Tận dụng hệ thống `dials` hiện có nhưng hiển thị dưới dạng các ô cuộn từ ngữ (Họ / Tên Đệm / Tên Chính hoặc Âm tiết I / II / III) kèm nút xác nhận [Gọi Tên].
2. **Cơ chế hóa lỏng vệt mực (`inkPuddleHazard`):**
   - Vệt mực trên sàn gây hiệu ứng làm chậm 50% tốc độ chạy của người chơi, tự tan biến sau khi quái `enemy_ink_hound` bị tiêu diệt bằng Đòn Thời Gian.
3. **Hiệu ứng biến đổi linh hồn (`shadeMaterializeFx`):**
   - Khi cờ `restored_*` được kích hoạt, sprite `npc_nameless_shade` thực hiện hiệu ứng tan biến hạt sáng trắng và spawn NPC có hình dạng hoàn chỉnh (`npc_kuro_mother` hoặc dân làng).

---

## 15. Kết Chương 7 & Cầu Nối Sang Chương 8 (Cliffhanger)

### Kịch bản cảnh kết chương (`map_ch7_null_hour_threshold`)

1. Sau khi Peter kéo Kuro trở về từ bờ vực tha hóa, hai người bạn dìu nhau đứng trước **Ngưỡng Cửa Giờ Số Không**.
2. Phía trước họ, chiếc đồng hồ tận thế khổng lồ phát ra tiếng gầm rú chấn động. Mắt xích chữ vàng thứ ba — mắt xích cuối cùng của Chronos — bốc cháy dữ dội rồi **vỡ tung thành ngàn mảnh bụi sáng**.
3. The First Forgotten ngẩng cao đầu, cất tiếng thở dài làm rung chuyển toàn bộ không gian: _"Thời gian của Chronos... đã hết rồi."_
4. Bầu trời của The Deep Void Core nứt toác hoàn toàn. Qua các khe nứt khổng lồ, Peter và Kuro nhìn thấy bầu trời đỏ rực của Bình Nguyên Cờ Rách (Chương 4), những bánh răng thép của Thành Phố Beta (Chương 5), và bờ biển ngập tràn sóng dữ của Khánh Hòa (Chương 1) đang **lao thẳng vào nhau với tốc độ kinh hoàng**.
5. Kuro nắm chặt tay Peter, ánh mắt kiên định dù thân thể vẫn còn rỉ mực: _"Các thế giới đang sụp đổ vào nhau... Giờ Số Không đã bắt đầu rồi, Peter!"_
6. Màn hình rung chuyển cực độ, tiếng còi báo động tận thế ngân vang xé toạc không gian và tối sầm lại với dòng chữ lớn:  
   **"KẾT THÚC CHƯƠNG 7 — SỰ HỘI TỤ ĐÃ BẮT ĐẦU. HẸN GẶP LẠI Ở CHƯƠNG 8: THE NULL HOUR."**

---

## 16. Câu Hỏi Mở Cho Project Owner (Tối đa 6 câu)

1. **Mối quan hệ mẹ con Kuro:** Bạn có đồng ý với kịch bản Peter giúp Kuro tìm lại người mẹ (bà Mai) và dùng chính bài hát ru cùng cài áo của bà để hóa giải cơn điên loạn hư không của Kuro không?
2. **Hình tượng The First Forgotten:** Bạn có đồng ý để First Forgotten xuất hiện trong hình hài suy kiệt, đóng vai trò như một người tiền bối trầm mặc cảnh báo về thảm họa thay vì một quái vật hung hãn không?
3. **Độ khó câu đố Tái Định Danh:** Cơ chế ghép tên (Họ - Tên đệm - Tên chính hoặc 3 âm tiết) dựa trên 2–3 manh mối đối chiếu chéo có vừa sức không, hay bạn muốn có thêm gợi ý bằng hình ảnh trực quan?
4. **Trận chiến với Kuro:** Việc để trận đánh boss Kuro kết thúc bằng hành động hòa giải cảm xúc (gọi tên, đưa mẹ ra ôm) thay vì đánh cạn máu có đúng với tinh thần nhân văn của CHRONO không?
5. **Cơ chế Chó Mực và Kẻ Ăn Tên:** 4 cơ chế quái thường thiết kế riêng cho 4 sprite Claude đã vẽ có làm bạn hài lòng về độ khéo léo và nhịp điệu phản xạ không?
6. **Tiến trình kết thúc ở Chương 9:** Lộ trình Chương 7 (Cái nôi) ➔ Chương 8 (Null Hour & Hội tụ) ➔ Chương 9 (Trận chiến ba bên & 3 kết thúc) đã hoàn toàn thống nhất và sẵn sàng cho việc sản xuất tiếp theo chưa?

---

## 17. Hợp Đồng ID Dữ Liệu (ID Contract)

> **Quy ước:** Toàn bộ ID của Chương 7 sử dụng tiền tố `ch7_` (cho dialogue, flags, dials), `quest_ch7_` (cho quests), `map_ch7_` (cho maps) và tiền tố định danh rõ nghĩa cho items.

### 17.1. Danh mục ID Bản Đồ (`mapId`)

- `map_ch7_ash_abyss_drop`, `map_ch7_faded_shore`, `map_ch7_erased_hamlet`, `map_ch7_cradle_sanctuary`
- `map_ch7_echo_well_depths`, `map_ch7_stranded_fleet`, `map_ch7_clock_graveyard`, `map_ch7_weeper_crossing`
- `map_ch7_blank_archives`, `map_ch7_bang_tree_promontory`, `map_ch7_silent_bell_crypt`, `map_ch7_chain_cathedral`
- `map_ch7_void_fissure_pass`, `map_ch7_ink_lake_throne`, `map_ch7_cradle_dawn`, `map_ch7_null_hour_threshold`
- `map_ch7_first_mason_tomb`, `map_ch7_white_bell_crypt`, `map_ch7_glass_ash_core`

### 17.2. Danh mục ID Vật Phẩm (`itemId`)

- `origin_seal_half`, `void_severance_blade`, `kuro_mother_brooch`, `mother_golden_hairpin`
- `unwritten_cradle_clasp`, `childhood_pledge_shard`, `void_sea_chart`, `white_crypt_key`
- `void_nectar_flask`, `bridge_toll_tag`, `peter_torn_diary_page`, `librarian_ghost_memo`
- `world_secret_torn_origin_scroll`, `world_secret_mother_letter`, `world_secret_twin_gods_pact`
- `world_secret_null_hour_blueprint`, `world_secret_childhood_carving`

### 17.3. Danh mục ID Nhiệm Vụ (`questId`)

- `quest_ch7_faded_shore`, `quest_ch7_erased_lullaby`, `quest_ch7_echoes_of_the_fleet`
- `quest_ch7_the_nameless_weeper`, `quest_ch7_promontory_promise`, `quest_ch7_chains_of_chronos`
- `quest_ch7_redeeming_kuro`, `quest_ch7_null_hour_awakening`
- `quest_ch7_first_mason`, `quest_ch7_mother_hairpin`, `quest_ch7_lost_compass`

### 17.4. Danh mục Cờ Trạng Thái Quan Trọng (`flags`)

- `restored_bridge_keeper`, `opened_erased_hamlet_gate`, `restored_kuro_mother_name`, `met_kuro_mother`
- `balanced_echo_well`, `solved_stranded_fleet`, `solved_clock_graveyard`, `defeated_nameless_weeper`
- `solved_blank_archives`, `opened_childhood_pledge_box`, `solved_silent_bell`, `communed_first_forgotten`
- `stabilized_third_chain`, `pacified_void_kuro`, `witnessed_ch7_cliffhanger`
- `honored_first_mason`, `returned_mother_hairpin`, `calibrated_blind_compass`
- `ch7_mother_song_remembered`, `ch7_kuro_redeemed`, `ch7_void_ink_purged`

---

_Tài liệu kết thúc. Sẵn sàng chuyển giao cho Claude Code review kỹ thuật và trình Project Owner phê duyệt._
