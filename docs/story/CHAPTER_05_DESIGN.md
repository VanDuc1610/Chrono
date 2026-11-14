# CHRONO – Thiết Kế Chi Tiết Chương 5: Khu Vườn Của Những Khả Năng Vô Tận

**Tài liệu:** Kịch bản, cơ chế và dữ liệu Chương 5 (The Garden of Infinite Possibilities)
**Quyền năng:** **Possibility** (Khả Năng / Nhánh Rẽ)
**Tham chiếu canon:** `STORY_CHAPTER_05.md`, `CHRONO_STORY_BIBLE.md` §11, `CHARACTER_BIBLE.md` §2, `CANON_AND_OPEN_QUESTIONS.md` (OQ-01, OQ-02, OQ-04), `CHAPTER_04_DESIGN.md` §13
**Tác giả:** Claude (owner giao viết trực tiếp, 2026-11-14)
**Trạng thái:** Đề xuất — chờ owner duyệt

> **Mục tiêu so với Chương 4:**
>
> - Kuro không chỉ xuất hiện một cảnh mà **đi cùng Peter suốt chương**, vừa là đồng đội vừa là đối thủ.
> - Một cơ chế trung tâm xuyên suốt: **chuyển nhánh thực tại**.
> - Lựa chọn ở Chương 4 **được hồi đáp**.
> - Câu đố cuối là câu đố về **trí nhớ của người chơi**.

---

## 1. Tiền Đề & Cái Giá Cảm Xúc

### 1.1. Bối cảnh

Peter rơi qua vết nứt Kuro để lại ở cuối Chương 4 và tỉnh dậy trong **The Interval**: một khoảng không màu xám bạc, nơi những mảnh thực tại bị Chronos tỉa bỏ trôi lơ lửng như các hòn đảo. Giữa khoảng không có một khu vườn.

Mỗi cây trong vườn treo những **quả hạt khả năng**. Mỗi quả là một nhánh thế giới bị bỏ dở, đang héo dần. Người chăm khu vườn chính là **Kuro**: anh tưới bằng chính trí nhớ của mình.

### 1.2. Ba vết thương của Peter

1. **Cuộc đời không được sống.** Nhánh Alpha là Khánh Hòa nơi Peter chưa từng rời tiệm đồng hồ. Ở đó có một Peter khác: già hơn, bình yên hơn, và đã làm một điều khủng khiếp để giữ sự bình yên đó.
2. **Người bạn đang tự xóa mình.** Ở chương này, Kuro **quên từng thứ ngay trước mắt Peter**. Anh nhờ Peter "nhớ hộ" — và người chơi thực sự phải nhớ hộ.
3. **Câu hỏi không có đáp án đẹp.** Cứu một nhánh nghĩa là nhánh khác va chạm. Không cứu nghĩa là để nó chết. Kuro chọn cứu tất cả. Peter phải tự trả lời mình sẽ chọn gì.

### 1.3. Kết chương (định hướng, giữ canon)

- Peter nhận **Possibility Resonance**.
- Peter hiểu rằng Kuro không phải kẻ thù, nhưng con đường của Kuro dẫn tới va chạm đa thực tại (gợi về The Null Hour — OQ-04, chỉ ở mức lời cảnh báo).
- Cả hai hướng về **The Celestial Realm**.
- Lời hứa (OQ-02) **chỉ hé nửa đầu** (xem §7).

---

## 2. Cơ Chế Trung Tâm: Chuyển Nhánh

### 2.1. Hạt Khả Năng (Possibility Seed)

Trên một số bản đồ có **Mầm Rẽ Nhánh** (một quả hạt phát sáng). Chạm vào mầm, Peter chuyển giữa hai trạng thái của cùng một nơi:

- **Nhánh Sống** (nhánh đang tồn tại);
- **Nhánh Tỉa** (phiên bản của chính nơi đó đã bị Chronos cắt bỏ).

Bản đồ không đổi kích thước nhưng thay lớp tường và lớp nền: cầu có thể có ở nhánh này mà mất ở nhánh kia, cửa mở hay đóng, NPC ở hay vắng.

- **Kỹ thuật:** dùng `layerVariants` sẵn có (theo cờ `branch_<map>_pruned`) và hiệu ứng `refreshMap`. Chuyển nhánh giữ nguyên vị trí của Peter.
  - Đứng vào ô bị tường ở nhánh kia thì Peter bị đẩy về điểm an toàn gần nhất — Claude làm.
- **Hiệu ứng:**
  - nhánh Tỉa: màn bạc màu, viền tím, tiếng gió hư không;
  - nhánh Sống: màu bình thường, có âm thanh của nơi đó.

### 2.2. Vật Nghịch Lý

Một vật chỉ tồn tại ở một nhánh có thể được **mang sang nhánh kia**. Ví dụ: một tấm ván từ nhánh Tỉa đặt vào nhánh Sống.

Khi mang sang, vật hiện chữ "Nghịch Lý" và **chỉ trụ được 20 giây**. Đây là một bài toán lập kế hoạch: mang gì, đặt ở đâu, theo thứ tự nào.

### 2.3. Sổ Nhớ Hộ (Kuro's Ledger) — cơ chế cảm xúc

Từ bản đồ 1, Kuro đưa Peter cuốn **Sổ Nhớ Hộ**: _"Tao đang quên dần. Mỗi khi tao kể gì về tao, mày ghi vào đây. Tao sẽ hỏi lại."_

- Mỗi lần Kuro kể một chuyện riêng, sổ thêm một trang (đọc được trong túi đồ).
  - Có **3 chuyện then chốt**, kể rải rác ở bản đồ 2, 5 và 8.
- Ở bản đồ 10, Kuro đã quên hết và hỏi Peter 3 câu (vòng xoay chọn đáp án).
  - Người chơi đã đọc sổ thì trả lời được.
  - Người chơi không nhớ vẫn mở sổ ra xem được, nhưng **trả lời mà không mở sổ trong lúc hỏi** được thêm một cảnh đặc biệt.
- **Không bao giờ chặn đường:** trả lời sai chỉ giảm **Niềm Tin của Kuro** (§6.4).

---

## 3. Luồng Trải Nghiệm & Bản Đồ (12 bản đồ, 130–160 phút)

```
HỒI 1 · VƯỜN CỦA KURO        HỒI 2 · NHÁNH ALPHA           HỒI 3 · NHÁNH BETA              HỒI 4 · HƯ KHÔNG
1 Bờ Vực Interval  ───────▶  3 Khánh Hòa Ở Lại  ───────▶  6 Thành Phố Đồng Hồ Thép ─────▶  9 Vùng Xám Tỉa Bỏ
2 Vườn Hạt Khả Năng          4 Tiệm Đồng Hồ Hai Thế Giới   7 Lò Phản Ứng Chronos           10 Nơi Kuro Hỏi Lại
                             5 Vọng Lâu Kẻ Tỉa Cành        8 Hầm Trú Ẩn Trẻ Em             11 Ngai Vua Chưa Sinh
                               (Boss giữa: The Other Peter)                                12 Bờ Va Chạm (thoát + kết)
                             [Ẩn A: Vườn Hạt Bị Nhổ]       [Ẩn B: Những Hạt Giống Cũ — hồi đáp Chương 4]
```

| Mã bản đồ                          | Tên                       | Kích thước · tileset        | Nội dung chính                                                                                                     |
| :--------------------------------- | :------------------------ | :-------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `map_ch5_interval_shore`           | Bờ Vực Interval           | 26×16 · sunken (tô tím bạc) | Peter tỉnh dậy; Kuro xuất hiện (lần đầu nói chuyện thật sự); nhận Sổ Nhớ Hộ; dạy chuyển nhánh.                     |
| `map_ch5_seed_garden`              | Vườn Hạt Khả Năng         | 28×18 · wilds               | Kuro kể **chuyện 1**; giới thiệu Vật Nghịch Lý; quái Bóng Nhánh; cổng sang Alpha.                                  |
| `map_ch5_alpha_town`               | Khánh Hòa Ở Lại           | 30×20 · coastal (bản sáng)  | Thị trấn Prologue nhưng **khác**: Cô Ba có cháu, bến cá có tàu mới, trên tường tiệm treo ảnh cưới của Peter-Alpha. |
| `map_ch5_alpha_clockshop`          | Tiệm Đồng Hồ Hai Thế Giới | 20×14 · dungeon             | Câu đố C1. Hai nhánh của cùng một tiệm.                                                                            |
| `map_ch5_pruner_tower`             | Vọng Lâu Kẻ Tỉa Cành      | 24×18 · sunken              | Kuro kể **chuyện 2**; boss giữa **The Other Peter**; lựa chọn 1 và 2.                                              |
| `map_ch5_beta_city`                | Thành Phố Đồng Hồ Thép    | 30×20 · dungeon (thép)      | Nhân loại xây máy để khóa Chronos rồi tự sụp; câu đố C2 (cầu lượng tử); quái Kén Chưa Sinh.                        |
| `map_ch5_chronos_reactor`          | Lò Phản Ứng Chronos       | 26×18 · dungeon             | Câu đố C3 (lưới điện hai nhánh); Kỹ sư Ivo.                                                                        |
| `map_ch5_children_shelter`         | Hầm Trú Ẩn Trẻ Em         | 20×14 · dungeon             | Mira và 40 đứa trẻ cuối cùng của Beta; Kuro kể **chuyện 3**; Kuro muốn kéo Beta về.                                |
| `map_ch5_grey_prune`               | Vùng Xám Tỉa Bỏ           | 30×18 · sunken (xám)        | Những mảnh thế giới đang tan; quái Tinh Thể Nghịch Lý; câu đố C5 (gia phả).                                        |
| `map_ch5_kuro_asks`                | Nơi Kuro Hỏi Lại          | 18×12 · dungeon             | **Câu đố C4 — Sổ Nhớ Hộ**; lựa chọn 3.                                                                             |
| `map_ch5_unborn_throne`            | Ngai Vua Chưa Sinh        | 24×18 · sunken              | Boss cuối **The Unborn King**.                                                                                     |
| `map_ch5_collision_shore`          | Bờ Va Chạm                | 30×16 · sunken              | Câu đố C6 (thoát va chạm có giờ); Lõi Possibility; cảnh kết.                                                       |
| `map_ch5_uprooted_garden` _(ẩn A)_ | Vườn Hạt Bị Nhổ           | 18×14 · wilds               | Vũ khí ẩn.                                                                                                         |
| `map_ch5_old_seeds` _(ẩn B)_       | Những Hạt Giống Cũ        | 18×12 · wilds               | Hồi đáp lựa chọn Chương 4; bùa ẩn.                                                                                 |

Cần tô lại `sunken` thành **tông Interval (tím bạc)** và `dungeon` thành **tông thép Beta**, cùng cách đã làm với tileset chiến trường (đổi màu, giữ chỉ số ô). Không cần tileset mới hoàn toàn.

---

## 4. Nhân Vật

### 4.1. Kuro — người làm vườn đang quên chính mình

- **Ở chương này:** đi cùng Peter từ bản đồ 1 đến 10 (đồng đội chiến đấu trên bản đồ như Trưởng Lão ở Phần mở đầu).
- **Cách nói:** gọi "mày – tao", khô khốc, nhưng mỗi lần quên gì đó lại khựng lại rất lâu.
- **Nỗi đau:**
  - Kuro nhớ tên từng thế giới anh đã cứu — 1.204 thế giới.
  - Nhưng anh không còn nhớ mặt mẹ mình, và đang quên vì sao mình bắt đầu.
- **Quan hệ với Peter:** không trách Peter đã quên, chỉ buồn. Câu then chốt: _"Mày quên tao là vì thế giới bắt mày quên. Còn tao quên tao... là vì tao tự chọn."_
- **Kết chương:** đi trước về phía Celestial Realm. Thái độ khi rời đi phụ thuộc Niềm Tin (§6.4).

### 4.2. The Other Peter — Kẻ Tỉa Cành (boss giữa)

- **Là ai:** Peter của nhánh Alpha, khoảng 34 tuổi.
- **Ngoại hình:** vẫn **tóc xoăn ngắn đặc trưng nhưng điểm bạc**; mặc giáp trắng của "Người Làm Vườn" Chronos; cầm kéo tỉa khổng lồ thay vì kiếm.
- **Quá khứ:**
  - Ở nhánh Alpha, Peter không rời Khánh Hòa, cưới vợ, có một con gái nhỏ.
  - Khi nhánh Alpha bị đánh dấu "tỉa bỏ", một phần còn sót lại của Chronos đề nghị một giao kèo: Alpha được giữ, đổi lại Peter-Alpha phải **tự tay tỉa các nhánh khác**.
  - Anh đã tỉa hàng trăm thế giới để con gái mình được lớn lên.
- **Không phải phản diện đơn giản:** anh hỏi Peter, _"Nếu là con mày, mày có làm khác không?"_ — và Peter không trả lời được.
- **Liên hệ Kuro:** Peter-Alpha từng tỉa đúng nhánh mà Kuro đang cứu. Hai người biết nhau, căm nhau, và hiểu nhau.

### 4.3. Kỹ sư Ivo (nhánh Beta)

- Ông lão từng đứng đầu dự án "Đồng Hồ Thép" khóa dòng thời gian để nhân loại không bao giờ già, không bao giờ chết.
- Dự án thành công một nửa: thời gian ngừng, rồi sụp.
- Giờ ông dùng chút điện cuối cùng giữ hầm trú ẩn cho lũ trẻ.
- Ông là gương phản chiếu Chương 4 (một thế giới không có điểm dừng): _"Chúng tôi đã xóa cái chết. Và cùng với nó, xóa luôn ngày mai."_

### 4.4. Mira (nhánh Beta)

- Cô bé 9 tuổi, chưa từng thấy bầu trời. Mỗi tối vẽ bầu trời bằng phấn lên trần hầm.
- Mira tin Kuro là "chú tiên" sẽ đưa các bạn ra ngoài.
- Mira là lý do Kuro quyết liều kéo nhánh Beta về (lựa chọn 3).

### 4.5. Người Làm Vườn (The Gardener — quái nhỏ)

- Những cỗ máy cũ của Chronos đi tỉa nhánh. Không ác, chỉ làm việc của mình.
- Lời thoại duy nhất, lặp đi lặp lại: _"Khả năng không được chọn sẽ không được tưới."_

---

## 5. Câu Đố (6 chính + 2 ẩn — không lặp cơ chế Chương 1–4)

Quy tắc cũ vẫn áp dụng:

- mỗi câu cần **2–3 manh mối đối chiếu chéo**;
- **không lộ đáp án** ở lời báo sai, mục tiêu nhiệm vụ, tên vật phẩm hay lời nhắc [E];
- sai thì chỉ phạt nhẹ.

Điểm mới: **manh mối thường nằm ở nhánh kia**, nên người chơi phải chuyển nhánh để đối chiếu.

### C1 · Chiếc Đồng Hồ Hai Thế Giới (tiệm Alpha)

- **Đầu vào:** két sắt của Peter-Alpha khóa bằng giờ (vòng xoay Giờ 1–12 · vòng xoay Phút 00/15/30/45).
- Trên tường có **5 đồng hồ treo**, mỗi chiếc ghi một cái tên khắc: Cưới, Con gái, Ông, Biển, Tiệm.
- **Manh mối:**
  1. Mảnh giấy trong ngăn kéo (nhánh Sống): _"Két chỉ mở theo chiếc đồng hồ duy nhất chưa từng bị thời gian của hai thế giới làm lệch."_
  2. Nhánh Sống: 5 đồng hồ chỉ 3:15 · 7:30 · 9:45 · 12:00 · 4:30.
  3. Nhánh Tỉa (cùng căn tiệm, hoang tàn): 5 đồng hồ chỉ 3:45 · 7:30 · 2:15 · 11:00 · 4:00.
- **Suy luận:** chỉ đồng hồ "Con gái" chỉ **7:30 ở cả hai nhánh** → két mở bằng 7:30.
- **Đúng:** trong két là **Thư Gửi Con Gái** (thư Peter-Alpha viết cho con, chưa gửi). Đây là chìa khóa cảm xúc cho cảnh boss giữa (§6.1).
- **Sai:** chốt kêu lạch cạch; lời báo chỉ nhắc _"giờ của hai thế giới chưa khớp"_.

### C2 · Cây Cầu Lượng Tử (Beta)

- **Bố trí:** một vực rộng 9 ô. Muốn qua, **cả 9 ô** phải có ván **trong nhánh Peter đang đứng**.
  - Nhánh Tỉa còn ván ở ô 1, 2, 4, 5, 7, 8 (thiếu ô 3, 6, 9).
  - Nhánh Sống chỉ còn ván ở ô 1 và 2.
- **Ván rời:**
  - 2 ván của nhánh Tỉa, nằm trong kho đổ nát (chỉ thấy khi ở nhánh Tỉa);
  - 1 ván của nhánh Sống, nằm trên mái nhà (chỉ thấy khi ở nhánh Sống).
- **Luật:**
  - Ván đặt **trong chính nhánh của nó** thì nằm yên mãi.
  - Ván mang sang nhánh kia là **Vật Nghịch Lý**, chỉ trụ được **20 giây** kể từ lúc đặt xuống.
- **Manh mối:** sổ công nhân cầu ghi _"Ván của nhánh nào chỉ vững dưới chân người của nhánh đó; ván mang sang chỉ là cái bóng sắp tan."_ Câu này nói luật, không nói thứ tự.
- **Lời giải:**
  1. Ở nhánh Tỉa, đặt 2 ván Tỉa vào ô 3 và ô 6 (vĩnh viễn).
  2. Chuyển sang nhánh Sống, lấy ván Sống trên mái nhà.
  3. Chuyển lại nhánh Tỉa, đặt ván Sống vào ô 9 — nó bắt đầu đếm 20 giây.
  4. Chạy qua cầu ngay.

  Ai đặt ván Sống trước (ví dụ vào ô 3) sẽ thấy nó tan trước khi kịp đi hết.

- **Áp lực thêm:** một Người Làm Vườn đứng ở đầu cầu bên kia. Nhát kéo cắt đường thẳng của nó xóa tạm một ô ván, nên phải hạ nó hoặc canh nhịp nó.
- **Sai:** rơi xuống thì về đầu cầu (như vực Chương 3). Ván Nghịch Lý đã tan sẽ quay về chỗ cũ trên mái nhà.

### C3 · Lưới Điện Hai Nhánh (lò phản ứng)

- **Đầu vào:** 3 máy phát A, B, C, mỗi máy có công tắc ở **cả hai nhánh**. Cổng lò cần **đúng 2 máy chạy ở nhánh Sống**.
- **Luật nghịch lý:** một máy không thể chạy ở cả hai nhánh cùng lúc. Bật ở nhánh Sống thì máy đó ở nhánh Tỉa phải tắt, và ngược lại.
- **Manh mối:**
  1. Nhật ký Ivo: _"Máy A và máy C không bao giờ được chạy cùng một nhánh — hai lõi sẽ cộng hưởng."_
  2. Bảng cảnh báo ở nhánh Tỉa: _"Máy A ở nhánh này phải chạy để giữ tường hầm trẻ em."_
  3. Sơ đồ dây cổng lò: _"Cần đúng hai lõi sáng ở nhánh Sống."_
- **Suy luận:**
  - A phải chạy ở Tỉa, nên A **tắt** ở Sống.
  - A và C không được chạy cùng nhánh, nên C **tắt** ở Tỉa; do đó C chạy ở Sống.
  - Cổng cần 2 máy ở Sống mà A đã tắt ở đó, nên **B và C** chạy ở Sống.
  - **Đáp án:** Sống = B, C · Tỉa = A.
- **Đầu vào:** 6 công tắc (3 mỗi nhánh), nút "Khởi động lò" kiểm tra tổ hợp.
- **Sai:** lò rít lên, mọi công tắc bật ngược về tắt; Peter mất một ít máu vì tia lửa.

### C4 · Sổ Nhớ Hộ (Kuro hỏi lại) — câu đố trí nhớ

Ba chuyện Kuro kể trong chương (đúng một lần, ở bản đồ 2, 5, 8; đều ghi vào sổ):

1. _"Hồi nhỏ tao nuôi một con mèo mướp ba chân, đặt tên là **Bánh Đúc** vì nó trắng như bánh đúc."_ (Bản đồ 2 — Kuro vừa kể vừa cười, rồi khựng lại vì không nhớ nó chết thế nào.)
2. _"Mẹ tao hay hát bài **'Chiều Trên Bến Cũ'** mỗi khi trời mưa. Tao chỉ còn nhớ tên bài, giai điệu thì mất rồi."_ (Bản đồ 5 — sau trận The Other Peter.)
3. _"Lời hứa của tụi mình... tao nhớ là mình hứa ở **mỏm đá có cây bàng gãy**, nhìn ra biển."_ (Bản đồ 8 — ở hầm trẻ em.)

Ở bản đồ 10, Kuro đứng trước Peter, mắt trống rỗng, hỏi 3 câu bằng 3 vòng xoay, mỗi vòng 4 phương án có **phương án gây nhiễu từ chính chương này**. Ví dụ:

- Tên con mèo: **Bánh Đúc** · Bánh Bèo · Mướp · Ba Chân.
- Bài hát: **Chiều Trên Bến Cũ** · Ru Con Bến Cá · Chiều Mưa Gác Xép · Bến Cũ Mưa Rơi.
- Nơi hứa: **mỏm đá có cây bàng gãy** · gác xép mưa · bến tàu · mỏm đá hoàng hôn.

Một phương án gây nhiễu được lấy từ hồi tưởng Chương 4 ("mỏm đá hoàng hôn"), nên người chơi phải nhớ **đúng lời Kuro**, không nhớ theo cảm giác.

- **Mỗi câu đúng:** Niềm Tin +1 và Kuro nhớ lại được một mảnh (thoại riêng).
- **Đúng cả 3 mà không mở sổ trong lúc hỏi:** cảnh đặc biệt _"Mày nhớ hộ tao thật à..."_ — Kuro cười lần đầu tiên trong cả chương.

### C5 · Gia Phả Vua Chưa Sinh (Vùng Xám)

- **Bố trí:** 3 bức chân dung trôi nổi, mỗi bức từ một nhánh, mỗi bức nói một câu về người thừa kế của Ngai Vua Chưa Sinh.
  - Bức Bạc: _"Người thừa kế không phải con trưởng."_
  - Bức Đồng: _"Người thừa kế là con của hoàng hậu thứ hai."_
  - Bức Sắt: _"Người thừa kế là con trưởng."_
- **Manh mối:**
  1. Bia đá Vùng Xám: _"Trong ba nhánh, chỉ nhánh đã bị tỉa mới nói dối — vì nó không còn gì để mất."_
  2. Bảng phả hệ: ghi rõ con trưởng là con của hoàng hậu thứ nhất, ba người con còn lại của hoàng hậu thứ hai. Kèm ghi chú: nhánh **Sắt** bị tỉa trước tiên.
- **Suy luận:**
  - Bức Sắt nói dối → người thừa kế **không** phải con trưởng.
  - Bức Bạc nói thật (khớp với kết luận trên).
  - Bức Đồng nói thật → con của hoàng hậu thứ hai.
  - Phả hệ chỉ có **một** người con của hoàng hậu thứ hai được ghi "chưa sinh": **Hoàng tử Thứ Ba, Aurel**.
- **Đầu vào:** vòng xoay 4 cái tên trên bệ chân dung, rồi "Gọi tên".
- **Đúng:** biết **tên thật** của Vua Chưa Sinh. Trong trận boss, gọi đúng tên phá được một lớp vương miện (§6.2). Gọi sai vẫn đánh được, chỉ khó hơn.

### C6 · Thoát Khỏi Bờ Va Chạm (thời gian thực)

- **Bối cảnh:** sau boss cuối, nhánh Beta (nếu Kuro kéo về) hoặc chính Vùng Xám bắt đầu va chạm.
- **Bố trí:** các hòn đảo nhỏ, đảo nào sắp vỡ thì rung, mỗi đảo mang **màu của một nhánh**.
- **Manh mối (học từ trước):** Vùng Xám đã dạy rằng _"màu xám là nhánh đã tỉa"_. Bia ở Bờ Va Chạm nói: _"nhánh còn được tưới thì không vỡ"_. Đảo màu của nhánh đang được Kuro tưới (tím) sẽ đứng vững.
- Người chơi phải nhảy theo đảo tím, có đồng hồ đếm.
- Rơi thì về đầu đoạn, không mất máu.
- Đây là màn chạy cuối mang tính trình diễn, độ khó vừa phải.

### Ẩn A · Vườn Hạt Bị Nhổ (vũ khí ẩn)

- Năm hạt giống bị nhổ rải rác ở bản đồ 2, 3, 6, 9, 12. Mỗi hạt khắc một mùa trong năm và một nét cọ.
- Trong Vườn Hạt Bị Nhổ có 5 ô đất.
- **Manh mối:**
  - Bài đồng dao trẻ con nhánh Alpha: _"Xuân gieo, Hạ tưới, Thu hái, Đông ngủ, rồi Xuân lại về"_ — vòng 5 mùa, có hai mùa Xuân.
  - Một trong hai hạt Xuân khắc nét "mới" (Xuân lại về), hạt còn lại khắc nét "cũ".
- **Thứ tự:** Xuân cũ → Hạ → Thu → Đông → Xuân mới.
- **Đúng:** **Kiếm Khả Thể** (`blade_of_possibility`): đòn chém kéo theo một vệt chém "nhánh kia" trễ 0,2 giây, gây thêm 30% sát thương.

### Ẩn B · Những Hạt Giống Cũ (hồi đáp Chương 4 — bùa ẩn)

Một khu vườn nhỏ mọc từ những nhánh **mà lựa chọn Chương 4 của Peter tạo ra**. Kuro dẫn tới và nói: _"Mỗi lần mày chọn, một hạt rơi xuống đây. Tao tưới hộ."_

| Lựa chọn Chương 4       | Hạt mọc thành                                                                                                                                                              |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nói **thật** với Aldric | Một nhánh nơi Aldric về quê và đặt hoa trên mộ Maelis, thanh thản.                                                                                                         |
| Nói **dối** Aldric      | Một nhánh nơi lời nói dối là thật: Maelis già đi bên cháu chắt, vẫn ngóng cha. Kuro hỏi: _"Mày nói dối để ông ấy yên lòng. Vậy cái nhánh này... có đáng được sống không?"_ |
| Bran **giải thoát**     | Bran ngủ yên dưới gốc cây, không còn đếm.                                                                                                                                  |
| Bran **ghi danh**       | Tên mẹ Bran khắc trên một phiến đá; một người phụ nữ đang đọc nó.                                                                                                          |
| Đốt sử của Elion        | Một khoảng đất trống phủ tro, đã mọc mầm non.                                                                                                                              |
| Elion viết tiếp         | Một cuốn sách mở, trang cuối có nhắc tên Kuro (gợi ý rằng Elion từng thấy Kuro đi qua chiến trường).                                                                       |

- **Câu đố:** tưới đúng **hạt mà người chơi muốn giữ** — không có đáp án sai.
- **Phần thưởng:** **Bùa Hạt Giống Đã Chọn** (`chosen_seed_charm`). Chỉ số khác theo hạt được tưới:
  - hạt Aldric → thiên về máu và thủ;
  - hạt Bran → thiên về công;
  - hạt Elion → thiên về mana.
- Đây là cách để lựa chọn cũ **có trọng lượng** mà không phạt ai.

---

## 6. Lựa Chọn Lớn & Niềm Tin

### 6.1. Lựa chọn 1 — Lá thư của Peter-Alpha (sau boss giữa)

The Other Peter thua, quỳ gối. Peter cầm **Thư Gửi Con Gái** (câu đố C1).

- **A · Trao thư và để anh ta về nhánh Alpha:**
  - Peter-Alpha về với con, tiếp tục làm Kẻ Tỉa Cành để giữ Alpha. Kuro giận: _"Mày vừa thả một con dao về lại vườn của tao."_
  - **Thưởng:** **Kéo Tỉa Bạc** (`silver_pruning_shears`, vũ khí: tầm ngắn, chém rất nhanh).
  - Niềm Tin −1. Cờ `ch5_choice_alpha_spared`.
- **B · Đọc lá thư cho anh ta nghe:**
  - Trong thư, Peter-Alpha viết cho con rằng bố sẽ không làm điều gì khiến con xấu hổ.
  - Anh ta tháo bỏ giáp Người Làm Vườn, từ bỏ giao kèo. Nhánh Alpha bị đánh dấu tỉa lại; anh chọn ở lại cùng con tới cuối.
  - **Thưởng:** **Chiếc Nhẫn Cưới Nhánh Alpha** (`alpha_wedding_ring`, bùa: máu, thủ, hồi máu khi né hoàn hảo).
  - Niềm Tin +1. Cờ `ch5_choice_alpha_letter`.

### 6.2. Lựa chọn 2 — Nhớ hộ hay quên đi (cuối trận boss giữa)

Peter-Alpha đưa cho Peter một mảnh ký ức về Kuro mà Peter đã đánh mất: _"Tao còn giữ. Mày lấy đi."_

- **Nhận mảnh ký ức:**
  - Peter nhớ lại thêm một phần tuổi thơ.
  - Ở cảnh Kuro hỏi lại (C4), có thêm một dòng thoại riêng.
  - Nhưng một ký ức nhỏ của chính Peter mất đi: không còn nhớ mùi tiệm đồng hồ buổi sáng. Có thoại nhắc lại ở Chương 6.
  - Cờ `ch5_took_alpha_memory`.
- **Từ chối:**
  - Peter tự nhớ bằng cách của mình. Kuro (nếu biết chuyện) nói: _"Đúng. Đừng để ai nhớ hộ mày."_
  - Cờ `ch5_refused_alpha_memory`.

### 6.3. Lựa chọn 3 — Kéo Beta về (ở Nơi Kuro Hỏi Lại)

Kuro quyết dùng chút trí nhớ cuối cùng kéo nhánh Beta (40 đứa trẻ) trở lại tồn tại. Va chạm có thể nuốt mất Vùng Xám và những nhánh nhỏ khác.

- **Giúp Kuro:**
  - Peter giữ mỏ neo cùng Kuro. Nhánh Beta được kéo về, va chạm xảy ra.
  - Màn C6 khó hơn và dài hơn. Mira sống, bầu trời phấn trên trần hầm trở thành bầu trời thật.
  - Kuro **mất thêm một ký ức**: quên luôn câu Peter vừa trả lời ở C4.
  - Cờ `ch5_choice_help_kuro` (nghiêng về kết thúc _Unbound Eternity_).
- **Ngăn Kuro:**
  - Peter cắt mỏ neo. Kuro ngã xuống, nhìn Peter như nhìn người lạ: _"...Mày đã hứa."_
  - Nhánh Beta tiếp tục tan, nhưng chậm lại. Ivo và lũ trẻ có thêm thời gian; Kuro hứa sẽ tìm cách khác.
  - Màn C6 ngắn hơn. Có một trận đấu ngắn với Kuro (không chết, theo lượt, ~4 lượt, Kuro bỏ đi khi máu xuống nửa).
  - Cờ `ch5_choice_stop_kuro` (nghiêng về _Eternal Order_).
- **Lối thứ ba ẩn** (chỉ khi Niềm Tin ≥ 3 **và** đã đúng ≥ 2 câu C4):
  - Peter đề nghị kéo Beta về **từng phần**: chỉ kéo hầm trẻ em, không kéo cả thành phố.
  - Kuro ngần ngừ rồi đồng ý. Va chạm nhỏ, không ai mất ký ức.
  - Cờ `ch5_choice_partial_pull` (nghiêng về _The Last Chronarch_). Đây là phần thưởng cho người chơi đã thật sự lắng nghe Kuro.

### 6.4. Niềm Tin Của Kuro (ẩn, 0–5)

| Hành động                                                         | Niềm Tin                |
| :---------------------------------------------------------------- | :---------------------- |
| Trả lời đúng mỗi câu C4                                           | +1 (tối đa +3)          |
| Lựa chọn 1 = đọc thư                                              | +1                      |
| Lựa chọn 1 = trao thư                                             | −1                      |
| Để Kuro tưới hạt ở Ẩn B                                           | +1                      |
| Trong lúc đi cùng, hồi sinh Kuro khi anh gục (nhấn [E] cạnh Kuro) | không đổi, chỉ có thoại |

- **Kỹ thuật:** ghi bằng cờ `ch5_trust_1` … `ch5_trust_5`.
- **Dùng ở đâu:**
  - mở lối thứ ba ở lựa chọn 3;
  - lời chia tay cuối chương;
  - một cờ cho Chương 6.

---

## 7. Hồi Tưởng — Lần Này Từ Phía Kuro

Possibility cho Peter **nhìn ký ức của Kuro**, không phải của mình. Cùng hiệu ứng mờ của Chương 4, nhưng viền **tím** thay vì xám.

1. **Bánh Đúc** (bản đồ 2): Kuro nhỏ ôm con mèo ba chân dưới mưa. Peter nhỏ đứng cạnh, che dù. Lần đầu tiên gương mặt Peter nhỏ hiện rõ — nhưng gương mặt Kuro thì vẫn mờ.
2. **Bài hát của mẹ** (bản đồ 5): một người phụ nữ ngồi khâu áo, hát. Lời hát bị nhiễu, chỉ nghe rõ câu "chiều trên bến cũ…".
3. **Đêm Kuro biến mất — nhìn từ phía Kuro** (bản đồ 8):
   - Đêm bão ở Chương 4, nhưng lần này người chơi thấy cảnh từ chỗ Kuro đứng.
   - Kuro quay lại nhìn tiệm đồng hồ và thấy Peter đang ngủ gục trên bàn; anh không đánh thức.
   - Câu bị sấm cắt ở Chương 4 giờ nghe trọn: _"Trật tự này thối rữa rồi. Tao sẽ đi tìm một khả năng khác… để không ai phải bị quên. Kể cả mày."_
4. **Lời hứa — nửa đầu** (bản đồ 10, chỉ khi trả lời C4 câu 3 đúng):
   - Mỏm đá có cây bàng gãy. Hai đứa trẻ. Kuro nói: _"Nếu một ngày tao bị xóa tên, mày phải là người nhớ…"_
   - Peter nhỏ mở miệng đáp — và hồi tưởng vỡ vụn.
   - **Nửa sau giữ cho Chương 6 (OQ-02).**

---

## 8. Giao Tranh

### 8.1. Quái bản đồ (khéo léo và canh nhịp, như owner thích)

- **Bóng Nhánh** (`enemy_branch_phantom`):
  - Nhấp nháy giữa hai vị trí A và B theo nhịp 1,2 giây; chỉ chém trúng ở vị trí đang **đặc** (sáng rõ), vị trí kia mờ.
  - Chém vào bóng mờ thì nó dịch tới sau lưng Peter.
  - Người chơi phải đọc nhịp nhấp nháy.
- **Kén Chưa Sinh** (`enemy_unborn_cocoon`):
  - Một cái kén đập phập phồng. Sau **6 giây** nở thành **Nỗi Kinh Hoàng Chưa Sinh** (máu gấp 3, đánh mạnh).
  - Đập vỡ kén trước khi nở (kén chịu 3 nhát).
  - Nhiều kén cùng lúc buộc người chơi chọn thứ tự.
- **Tinh Thể Nghịch Lý** (`enemy_paradox_crystal`):
  - Ghi lại **nhát chém gần nhất của Peter** và 1 giây sau **chém trả đúng nhát đó** (cùng hướng, cùng tầm) từ vị trí của nó.
  - Né bằng cách lướt ra khỏi cung chém của chính mình.
  - Chém nó liên tục sẽ tự hại mình. Khéo tay thì chém một nhát rồi lùi.
- **Người Làm Vườn** (`enemy_gardener`):
  - Chậm, máu dày. Kéo tỉa của nó cắt theo **đường thẳng dài** sau khi giơ kéo 0,8 giây.
  - Đường cắt **xóa tạm 1 ô cầu hoặc ván** trên đường đi. Trên cầu C2, nó trở thành mối nguy thật.

### 8.2. Đồng đội Kuro trên bản đồ

- Kuro đi theo và đánh như Trưởng Lão ở Phần mở đầu, nhưng mạnh hơn.
- Đòn đặc trưng: **Rẽ Nhánh** — mỗi 15 giây, một quái gần nhất bị "dời sang nhánh kia" 3 giây (biến mất, không đánh được Peter).
- Kuro **không chết**: khi máu cạn, anh gục. Peter bấm [E] cạnh Kuro để đỡ dậy; mỗi lần đỡ có một câu thoại khác.

### 8.3. Boss giữa — The Other Peter (`boss_other_peter`, 48×48)

- **Gương phản chiếu:** mỗi lượt, Peter-Alpha dùng **đúng lệnh Peter dùng ở lượt trước**.
  - Lượt trước Peter Tấn Công → giờ anh ta Tấn Công.
  - Lượt trước Peter Phòng Thủ → anh ta Phòng Thủ.
  - Lượt trước Peter dùng Kỹ Năng → anh ta dùng **Kéo Tỉa** (đòn mạnh, xóa lệnh Kỹ Năng của Peter 1 lượt).
- **Cách chơi khéo:** cố tình Phòng Thủ một lượt (anh ta sẽ Phòng Thủ theo, lãng phí lượt), rồi dồn Kỹ Năng vào lượt anh ta còn đang thủ…
- **Đòn kết:** khi anh ta xuống 30% máu, mở lệnh môi trường **[6] Đọc lá thư** (chỉ khi có Thư Gửi Con Gái) để kết thúc trận sớm và mở lựa chọn B. Không có thư thì đánh đến hết như bình thường.
- **Đỡ đòn đúng nhịp:** nhịp của anh ta **giống nhịp của Peter** — vòng sáng thu theo đúng tốc độ chém của vũ khí Peter đang cầm.

### 8.4. Boss cuối — The Unborn King (`boss_unborn_king`, 64×64)

- **Hình tượng:** một vị vua khổng lồ không có gương mặt, khoác áo choàng dệt từ những tấm khăn quấn trẻ sơ sinh chưa dùng, trên đầu **ba vương miện chồng lên nhau**.
- **Pha 1 — Ba vương miện:**
  - Mỗi vương miện là một triều đại chưa từng có và che chắn 80% sát thương.
  - Mỗi lượt vua "đội thử" một vương miện và xướng tên triều đại.
  - Peter phá vương miện đang đội bằng lệnh **[6/7/8]** tương ứng 3 lời phủ nhận: _"Triều đại này chưa từng bắt đầu" · "…chưa từng kết thúc" · "…chưa từng được nhớ"_.
  - Mỗi triều đại xướng lên kèm một câu gợi ý, người chơi chọn lời phủ nhận khớp với nó. Kiểu câu đố này đã được người chơi làm quen ở Dàn Hợp Xướng nhưng nay khó hơn: gợi ý là ẩn dụ, không phải từ khóa.
- **Pha 2 — Gọi tên:**
  - Khi mất cả ba vương miện, vua cố "sinh ra" bằng cách hút máu Peter mỗi lượt.
  - Nếu đã giải C5, mở lệnh **[6] Gọi tên Aurel**: vua khựng lại 2 lượt, nhận gấp đôi sát thương.
  - Không giải C5 thì phải đánh thường (khó hơn nhưng vẫn thắng được).
- **Đỡ đòn đúng nhịp:** có đòn nhử như The Last War, cộng thêm **đòn đôi** (hai vòng sáng liên tiếp, phải bấm Space hai lần).
- **Kuro ở trận cuối:**
  - Nếu Niềm Tin ≥ 3, Kuro xuất hiện bên Peter từ pha 2, mỗi 2 lượt tung một đòn (theo lượt, hiện trên màn hình như đồng đội).
  - Niềm Tin thấp thì Kuro đứng ngoài nhìn.

---

## 9. Nhiệm Vụ (7 chính + 3 phụ, tất cả `"chapter": 5`)

| Quest                         | Loại | Mục tiêu (cờ)                                                                                       | Nối tiếp    |
| :---------------------------- | :--- | :-------------------------------------------------------------------------------------------------- | :---------- |
| `quest_ch5_into_the_interval` | main | `met_kuro_interval`; `learned_branch_shift`                                                         | gardener    |
| `quest_ch5_the_gardener`      | main | `ch5_crossed_garden`                                                                                | alpha_life  |
| `quest_ch5_alpha_life`        | main | `opened_alpha_safe`                                                                                 | pruner      |
| `quest_ch5_the_pruner`        | main | `defeated_other_peter`; `resolved_alpha_letter`                                                     | steel_city  |
| `quest_ch5_steel_city`        | main | `crossed_quantum_bridge`; `restarted_reactor`                                                       | children    |
| `quest_ch5_the_children`      | main | `met_mira`; `named_unborn_heir` hoặc `reached_unborn_throne`                                        | unborn_king |
| `quest_ch5_unborn_king`       | main | `answered_kuro_ledger`; `resolved_beta_choice`; `defeated_unborn_king`; `possibility_seal_restored` | —           |
| `quest_ch5_uprooted_seeds`    | side | `planted_uprooted_seeds`                                                                            | —           |
| `quest_ch5_old_seeds`         | side | `watered_old_seed`                                                                                  | —           |
| `quest_ch5_chalk_sky`         | side | `finished_chalk_sky` (giúp Mira tìm 4 màu phấn — 4 manh mối bầu trời từ nhánh Alpha)                | —           |

- `quest_ch4_the_last_war.followUpQuestId` = `quest_ch5_into_the_interval`.
- Chương 4 nối sang Chương 5 bằng thẻ kết chương: `NEXT_START[4] = map_ch5_interval_shore / from_ch4`.
- Trần cấp cuối Chương 5: **21**.

---

## 10. Trang Bị

| Id                       | Loại        | Lấy ở đâu   | Chỉ số (dùng các chỉ số hiện có)                             |
| :----------------------- | :---------- | :---------- | :----------------------------------------------------------- |
| `blade_of_possibility`   | weapon (ẩn) | Ẩn A        | attack 16, reach 42, swingMs 340 + vệt chém trễ (engine mới) |
| `silver_pruning_shears`  | weapon      | Lựa chọn 1A | attack 15, reach 30, swingMs 240                             |
| `alpha_wedding_ring`     | charm       | Lựa chọn 1B | maxHp 36, defense 6 (+ hồi 10 HP khi né hoàn hảo)            |
| `chosen_seed_charm`      | charm (ẩn)  | Ẩn B        | thay theo hạt (§5 Ẩn B)                                      |
| `kuro_ledger`            | key_item    | Bản đồ 1    | trang thêm theo chuyện Kuro kể                               |
| `letter_to_daughter`     | puzzle      | C1          | —                                                            |
| `possibility_seal_shard` | key_item    | Cuối chương | —                                                            |

---

## 11. Tài Nguyên Cần Vẽ (Pipeline B)

- **Tileset:**
  - `interval_tileset`: tô lại `sunken`, tím bạc;
  - `steel_tileset`: tô lại `dungeon`, thép gỉ và ánh cam lò phản ứng;
  - thêm khoảng 16 ô mới cho mỗi tileset (mầm rẽ nhánh, ván cầu, máy phát, ngai, chân dung, bàn ghi…).
- **NPC (32×32):**
  - Kuro: dùng lại hình đã duyệt, thêm khung đánh khi đi cùng;
  - Peter-Alpha (bản NPC): **khóa nhận diện tóc xoăn**, điểm bạc;
  - Ivo, Mira, Cô Ba nhánh Alpha (biến thể).
- **Quái:** Bóng Nhánh, Kén Chưa Sinh + dạng nở, Tinh Thể Nghịch Lý, Người Làm Vườn.
- **Boss:**
  - The Other Peter, 48×48. Owner duyệt riêng vì liên quan khóa nhận diện Peter.
  - The Unborn King, 64×64, có khung mất từng vương miện.

---

## 12. Engine Mới (Claude)

1. Chuyển nhánh tại chỗ (`layerVariants` + `refreshMap` giữ vị trí; đẩy khỏi ô thành tường).
2. Vật Nghịch Lý có đồng hồ 20 giây (dùng lại `startTimer` + `tileSwaps`).
3. Đồng đội Kuro trên bản đồ (tổng quát hóa đồng đội Trưởng Lão) + đỡ dậy bằng [E] + đòn Rẽ Nhánh.
4. Ba quái mới (nhấp nháy theo nhịp, kén nở theo giờ, chém trả nhát chém của Peter) + Người Làm Vườn cắt đường thẳng.
5. Boss gương (dùng lại lệnh lượt trước); boss vương miện + gọi tên; đỡ đòn đôi.
6. Niềm Tin (cờ bậc thang) và lối thứ ba có điều kiện (`ifFlags` + `ifItems` đã có).
7. Đồng đội Kuro trong trận theo lượt (mỗi 2 lượt một đòn).
8. Trần cấp 21, nối Chương 4 → Chương 5.

---

## 13. Câu Hỏi Mở Cho Owner

1. **Peter-Alpha có vợ và con gái** — chi tiết này làm boss giữa rất nặng cảm xúc. Có hợp với hướng bạn muốn cho Peter không? (Đây là Peter của nhánh khác, Peter chính vẫn độc thân.)
2. **Lối thứ ba ở lựa chọn 3** chỉ mở khi người chơi lắng nghe Kuro. Bạn muốn nó là "bí mật" hay có gợi ý nhẹ trong thoại?
3. **Trận đấu ngắn với Kuro** (nếu ngăn Kuro) — có nên để người chơi **thua cũng không sao** (cốt truyện vẫn đi tiếp) không? Claude đề xuất là có.
4. **Câu đố trí nhớ C4** thưởng thêm khi trả lời không mở sổ — bạn thấy có quá khó với người chơi không chú ý lời thoại không? (Mở sổ vẫn trả lời được, nên không ai bị kẹt.)
