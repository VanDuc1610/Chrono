# KỊCH BẢN THOẠI CHI TIẾT CHƯƠNG 9: VỊ THẦN GÃY CÁNH / CHÚA TỂ THỜI GIAN CUỐI CÙNG

## (THE FRACTURED DIVINITY / THE LAST CHRONARCH) — TOÀN BỘ CÁC BẢN ĐỒ & HAI NHÁNH TRUYỆN

> **Tài liệu tham chiếu:** `docs/story/CHAPTER_09_DESIGN.md` (§1–§17, Claude §20, Owner §21).  
> **Quy chuẩn kỹ thuật:** Mọi `id` có tiền tố `ch9_`. Mỗi câu thoại tối đa $\le 220$ ký tự, 1–3 câu mỗi node. Tối đa 2 lựa chọn phản hồi mỗi node. Kuro xưng hô "tao/mày" với Peter. Lyra dùng kích (`lyra_vanguard_halberd`). C10 có 3 đáp án đúng rải đều ở các vị trí khác nhau (Slot A, Slot C, Slot B).  
> **Hai nhánh cốt truyện:**
>
> - **Nhánh A:** "Chiếc Ghế Trống" (The Empty Chair) $\to$ Bản đồ 7–12, Đại Điện Ngai Vàng Sáu Ấn (Bản đồ 19), 3 Kết Thúc (Trật Tự Vĩnh Cửu / Vĩnh Hằng Bất Tận / Chúa Tể Thời Gian Cuối Cùng).
> - **Nhánh B:** "Kẻ Giật Dây" (Kuro the Puppet Master) $\to$ Bản đồ 13–18, 4 Phó Tướng, Quyết chiến Kuro, Kết Thúc 4 (Trang Giấy Trở Về).

---

# PHẦN 1: KHU VỰC CHUNG (BẢN ĐỒ 1 – 6)

## 1. Bản đồ 1: Đỉnh Tháp Tâm Điểm (`map_ch9_apex_nexus`)

### `ch9_apex_arrival_1`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Không gian quanh Peter đông cứng lại giữa ranh giới của các thực tại. Bầu trời vỡ vụn thành những mảnh gương pha lê phản chiếu ngàn dòng thời gian."
  2. "Một mặt đồng hồ khổng lồ không có kim ngự trị phía sau khoảng không, tiếng tích tắc vọng lại như nhịp đập của chính cội nguồn vũ trụ."
- **Responses:**
  - "Kuro... mày có ở đây không?" $\to$ `ch9_apex_arrival_2`
- **Effects:** Đặt cờ `ch9_started`, bắt đầu nhiệm vụ `quest_ch9_nexus_arrival`.

### `ch9_apex_arrival_2`

- **Speaker:** Kuro
- **Lines:**
  1. "Tao ở ngay cạnh mày đây, Peter. Nhìn kìa... đây chính là Tâm Điểm Vĩnh Hằng. Nơi lão già Chronos viết ra cái gọi là số mệnh."
  2. "Kim đồng hồ đang kẹt ở 11:59 của Giờ Thứ 25. Thời gian không còn chảy nữa. Mọi thứ đang chờ một quyết định."
- **Responses:**
  - "Chronos... ngài ấy ở đâu?" $\to$ `ch9_apex_chronos_confront`
- **Effects:** Không có.

### `ch9_apex_chronos_confront`

- **Speaker:** Chronos
- **Lines:**
  1. "Kẻ mang ngọn lửa Khả Năng — vết nứt đầu tiên của vạn cổ. Và Peter... trang giấy ta đánh rơi, lỗi lầm duy nhất của ta."
  2. "Hãy giao nửa Ấn Khởi Nguyên ra đây. Để trật tự được hàn gắn, để dòng thời gian không nổ tung vào Hư Không."
- **Responses:**
  - "Trật tự của ngài được xây trên sự cắt tỉa tàn nhẫn!" $\to$ `ch9_apex_chronos_reply_1`
  - "Ngài bẻ gãy chính mình chỉ để duy trì sự cô độc này sao?" $\to$ `ch9_apex_chronos_reply_2`
- **Effects:** Không có.

### `ch9_apex_chronos_reply_1`

- **Speaker:** Chronos
- **Lines:**
  1. "Nếu không có vết cắt, cái cây sẽ thối rữa từ gốc rễ. Các ngươi ngây thơ nghĩ rằng tự do vô hạn sẽ cứu vớt được muôn loài sao?"
- **Responses:**
  - "Bọn ta sẽ tự tìm câu trả lời." $\to$ `ch9_apex_chronos_part`
- **Effects:** Không có.

### `ch9_apex_chronos_reply_2`

- **Speaker:** Chronos
- **Lines:**
  1. "Ngươi là trang giấy không tên, làm sao hiểu được sức nặng của việc giữ cho cỗ máy vũ trụ không tan biến thành cát bụi."
- **Responses:**
  - "Nhưng tôi có đôi mắt để nhìn thấy nỗi đau của họ." $\to$ `ch9_apex_chronos_part`
- **Effects:** Không có.

### `ch9_apex_chronos_part`

- **Speaker:** Kuro
- **Lines:**
  1. "Đừng nghe lão ta nói nhảm, Peter! Cổng vào các tầng đền thờ đã mở. Muốn chạm vào Lõi Khởi Nguyên, ta phải vượt qua các quy luật cổ đại."
- **Responses:**
  - "Đi thôi, Kuro." $\to$ `ch9_apex_c01_intro`
- **Effects:** Mở rào chắn tiến tới câu đố C01.

### `ch9_c01_intro`

- **Speaker:** Bia đá
- **Lines:**
  1. "Bệ Cân Tam Thế Cổ Đại: Ba đĩa cân Quá Khứ (Memory), Hiện Tại (Continuum), Tương Lai (Possibility) đang trĩu nặng."
  2. "Chỉ khi ba con thoi thời gian mang trọng số chuẩn xác được đặt lên, cổng chuyển dịch mới mở lối."
- **Responses:**
  - "Đọc văn bia chỉ dẫn" $\to$ `ch9_c01_clue`
- **Effects:** Hiện tương tác với bệ cân C01.

### `ch9_c01_clue`

- **Speaker:** Bia đá
- **Lines:**
  1. "Quá khứ nặng hơn hiện tại đúng 3 khắc. Tương lai bằng hai lần quá khứ trừ đi hiện tại."
  2. "Cán cân vũ trụ chỉ đứng yên khi tổng trọng số của Tam Thế đạt đúng 27 khắc."
- **Responses:**
  - "Đặt con thoi lên các đĩa cân" $\to$ `ch9_c01_interact`
- **Effects:** Cho phép chọn các thỏi trọng số (3, 5, 6, 8, 9, 11, 12).

### `ch9_c01_interact`

- **Speaker:** Peter
- **Lines:**
  1. "Mình có các thỏi thời gian trong tay. Phải tính toán cẩn thận: Hiện tại = x, Quá khứ = x + 3, Tương lai = 2(x + 3) - x = x + 6. Tổng là 3x + 9 = 27."
- **Responses:**
  - "Hiện tại = 6, Quá khứ = 9, Tương lai = 12" $\to$ `ch9_c01_right`
  - "Hiện tại = 8, Quá khứ = 11, Tương lai = 8" $\to$ `ch9_c01_wrong`
- **Effects:** Không có.

### `ch9_c01_wrong`

- **Speaker:** Bia đá
- **Lines:**
  1. "Cán cân nghiêng lệch dữ dội. Trọng số Tam Thế không đạt mức cân bằng 27 khắc. Dòng chảy thời gian bị nhiễu loạn."
- **Responses:**
  - "Thử lại một lần nữa." $\to$ `ch9_c01_intro`
- **Effects:** Trả lại các thỏi trọng số.

### `ch9_c01_right`

- **Speaker:** Bia đá
- **Lines:**
  1. "Ba đĩa cân thăng bằng tuyệt đối trên trục vàng. Ánh sáng hòa âm rực sáng, cánh cổng dịch chuyển dẫn tới Ngưỡng Cửa Các Kỷ Nguyên mở ra."
- **Responses:**
  - "Bước qua cổng." $\to$ `ch9_c01_done`
- **Effects:** Đặt cờ `solved_tri_balance`, hoàn thành `quest_ch9_nexus_arrival`, mở lối sang `map_ch9_threshold_of_epochs`.

### `ch9_c01_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Mày tính toán nhanh như ngày xưa sửa đồng hồ vậy, Peter. Bước tiếp thôi, cánh cổng đang rung lên rồi."
- **Responses:**
  - "Đi cùng tao." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 2.

---

## 2. Bản đồ 2: Ngưỡng Cửa Các Kỷ Nguyên (`map_ch9_threshold_of_epochs`)

### `ch9_epochs_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Những bức tường nơi đây khắc lại bốn thời kỳ của vũ trụ: Kỷ Nguyên Vàng, Đại Phân Tách, Hư Không Xâm Lấn, và Kỷ Nguyên Sụp Đổ."
  2. "Không khí ngột ngạt. Lính canh mang đao ánh sáng đang tuần tra trên hành lang."
- **Responses:**
  - "Cẩn thận bước chân." $\to$ `ch9_epochs_kuro_warn`
- **Effects:** Bắt đầu nhiệm vụ `quest_ch9_unravel_truth`.

### `ch9_epochs_kuro_warn`

- **Speaker:** Kuro
- **Lines:**
  1. "Bọn Lính Canh Tâm Điểm đấy. Đao của chúng chém hai nhịp rất nhanh rồi mới tung nhát đâm chéo. Canh nhát đâm chéo mà lướt ra sau lưng chúng!"
- **Responses:**
  - "Tao nhớ rồi." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `seen_sentinel_tip`.

### `ch9_clue_1_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Ở góc tường nứt vỡ có một bản ghi chép không gian cổ mang ký hiệu kẽ nứt: [Dấu Vết Kẽ Nứt Ch4]."
  2. "Kỳ lạ... bản ghi cho thấy kẽ nứt ở căn phòng đổ nát Chương 4 không phải ngẫu nhiên xuất hiện. Có một luồng năng lượng Possibility chủ động xé rách không gian từ trước."
- **Responses:**
  - "Kuro... đã chủ động tìm mình từ đầu?" $\to$ `ch9_clue_1_kuro_reaction`
- **Effects:** Nhận vật phẩm `clue_ch9_interval_rift`, đặt cờ `found_clue_ch9_1`.

### `ch9_clue_1_kuro_reaction`

- **Speaker:** Kuro
- **Lines:**
  1. "Mày tìm thấy gì ở đó thế Peter? Mấy mảnh vụn lịch sử cũ thôi, đừng bận tâm. Phía trước có cửa vào Sảnh Lăng Kính kìa!"
- **Responses:**
  - "(Cất mẩu giấy đi) Đi tiếp thôi." $\to$ Không có (đóng thoại)
- **Effects:** Mở cửa sang Map 3.

---

## 3. Bản đồ 3: Sảnh Lăng Kính Quang Phổ (`map_ch9_prism_atrium`)

### `ch9_prism_arrival`

- **Speaker:** Kuro
- **Lines:**
  1. "Nhìn trần điện kìa... một khối lăng kính tam giác treo lơ lửng, nhưng ba chùm sáng chiếu vào nó đang bị lệch hướng."
  2. "Muốn kích hoạt bệ lăng kính, phải tìm được ba viên Tinh Thể Khởi Nguyên cắm vào ba góc."
- **Responses:**
  - "Để tao kiểm tra bệ điều khiển." $\to$ `ch9_c02_intro`
- **Effects:** Không có.

### `ch9_secret_1_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Phía sau bức tượng gãy là một cuộn da thuộc phủ bụi vàng: [Nỗi Đau Của Chronos - Trang 1/2]."
  2. "Từng dòng chữ run rẩy: 'Khi ta tự tay cắt bỏ cành nhánh đầu tiên, nước mắt ta hóa thành cát thời gian. Ta không căm ghét những nhánh bị bỏ rơi... ta chỉ không thể để tất cả cùng chết.'"
- **Responses:**
  - "Chronos... ngài ấy đã khóc sao?" $\to$ Không có (đóng thoại)
- **Effects:** Nhận `world_secret_ch9_chronos_grief`.

### `ch9_clue_2_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Dưới chân một trụ gương vỡ kẹp một trang giấy quen thuộc: [Bản Phân Kỳ Sổ Cái Ch5]."
  2. "Chữ viết tay của Kuro... Những dòng tính toán về Peter: 'Nếu Peter chọn cứu cô Ba, áp lực nghịch lý tăng 15%. Nếu Peter chọn đối đầu bóng ma, vết nứt sẽ mở rộng tối đa.' Kuro đã lường trước mọi lựa chọn của mình?"
- **Responses:**
  - "Mày xem tao là phép thử sao, Kuro?" $\to$ Không có (đóng thoại)
- **Effects:** Nhận vật phẩm `clue_ch9_ledger_divergence`, đặt cờ `found_clue_ch9_2`.

### `ch9_c02_intro`

- **Speaker:** Bệ Lăng Kính
- **Lines:**
  1. "Trận đồ Quang Phổ Tam Giác Lồng: Ba đỉnh tam giác (Bắc, Tây Nam, Đông Nam) điều khiển ba chùm tia màu cơ bản."
  2. "Cần cắm đúng ba Tinh Thể Khởi Nguyên (Đỏ, Lam, Lục) để mở đồng thời ba Cổng Thứ Cấp (Yellow, Cyan, Magenta) và chiếu sáng tâm điểm."
- **Responses:**
  - "Đọc văn bia quang phổ" $\to$ `ch9_c02_clue`
- **Effects:** Cho phép tương tác cắm tinh thể.

### `ch9_c02_clue`

- **Speaker:** Bệ Lăng Kính
- **Lines:**
  1. "Cổng Yellow (giữa Bắc và Tây Nam) cần Ý Chí (Đỏ) kết hợp Sự Sống (Lục)."
  2. "Cổng Magenta (giữa Bắc và Đông Nam) cần Ý Chí (Đỏ) kết hợp Dòng Chảy (Lam)."
  3. "Cổng Cyan (giữa Đông Nam và Tây Nam) cần Dòng Chảy (Lam) kết hợp Sự Sống (Lục)."
- **Responses:**
  - "Đỉnh Bắc = Đỏ, Tây Nam = Lục, Đông Nam = Lam" $\to$ `ch9_c02_right`
  - "Đỉnh Bắc = Lam, Tây Nam = Đỏ, Đông Nam = Lục" $\to$ `ch9_c02_wrong`
- **Effects:** Không có.

### `ch9_c02_wrong`

- **Speaker:** Bệ Lăng Kính
- **Lines:**
  1. "Ánh sáng phát ra bị xung đột. Các cổng thứ cấp chìm vào bóng tối. Màu sắc ở các đỉnh chưa đồng pha với văn bia."
- **Responses:**
  - "Rút tinh thể ra cắm lại." $\to$ `ch9_c02_intro`
- **Effects:** Trả lại 3 tinh thể vào túi.

### `ch9_c02_right`

- **Speaker:** Bệ Lăng Kính
- **Lines:**
  1. "Ba chùm tia giao thoa hoàn hảo! Cổng Yellow, Cyan, Magenta cùng bừng sáng. Tại tâm điểm, một chùm sáng Trắng Bạc tinh khiết chiếu thẳng lên đỉnh vòm."
- **Responses:**
  - "Lối đi đã mở!" $\to$ `ch9_c02_done`
- **Effects:** Đặt cờ `solved_spectral_interference`, mở cửa sang Map 4.

### `ch9_c02_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Ánh sáng trắng của Khởi Nguyên... Lâu lắm rồi tao mới thấy lại màu này. Đi nào Peter, đại điện tiếp theo ở ngay trước mắt."
- **Responses:**
  - "Ừ, đi tiếp thôi." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 4.

---

## 4. Bản đồ 4: Đại Điện Ba Tuyên Ngôn (`map_ch9_hall_of_three_creeds`)

### `ch9_creeds_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Ba bức tượng đá sừng sững: Tượng Chronos ở bệ A, Tượng Kuro ở bệ B, và Tượng Thiên Nguyên ở bệ C."
  2. "Không khí nơi đây tĩnh mịch đến rợn người, tựa như ba thời đại đang nhìn chằm chằm vào nhau."
- **Responses:**
  - "Kiểm tra bia đá trung tâm." $\to$ `ch9_c03_intro`
- **Effects:** Không có.

### `ch9_fb_01_trigger`

- **Speaker:** Ký ức (FB-01)
- **Lines:**
  1. "Ánh nắng chiều Khánh Hòa ấm áp tràn ngập tâm trí. Hai đứa trẻ ngồi trên mỏm đá ngắm sóng biển vỗ bờ."
  2. "Kuro bẻ đôi ổ bánh mì mật ong thơm phức, đưa cho Peter nửa lớn hơn: 'Ăn đi mày. Dù cả thế giới có quên tao, mày cũng không được quên tao đấy nhé!'"
- **Responses:**
  - "(Mắt cay xè) Tao chưa từng quên..." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `seen_fb_01`.

### `ch9_clue_3_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Dưới chân bệ tượng của Kuro có một mảnh vỡ tinh thể mang ánh sáng tím: [Tàn Lửa Kích Nổ Ấn Ch6]."
  2. "Mẫu phân tích năng lượng tại Đại Điện Khởi Nguyên... Vết nứt của Ấn Origin ở Chương 6 không phải do áp lực tự nhiên, mà bị kích nổ bởi một luồng sóng Possibility lén phóng ra từ sau lưng khi Peter hạ Genesis Warden!"
- **Responses:**
  - "Kuro... chính mày đã phá hủy phong ấn của Chương 6?" $\to$ Không có (đóng thoại)
- **Effects:** Nhận `clue_ch9_seal_spark`, đặt cờ `found_clue_ch9_3`.

### `ch9_c03_intro`

- **Speaker:** Bia Trung Tâm
- **Lines:**
  1. "Ba Lời Chứng Khởi Nguyên: Trong ba bức tượng, chính xác MỘT tượng nói thật hoàn toàn, MỘT tượng nói dối hoàn toàn, và MỘT tượng nói nửa thật nửa dối (câu đầu dối, câu sau thật)."
  2. "Hãy đặt đúng ba huy hiệu [Sự Thật], [Nửa Thật], [Dối Trá] vào bệ của ba nhân chứng."
- **Responses:**
  - "Lắng nghe lời chứng của từng tượng." $\to$ `ch9_c03_clues`
- **Effects:** Cho phép tương tác với 3 tượng.

### `ch9_c03_clues`

- **Speaker:** Peter
- **Lines:**
  1. "Tượng Chronos (A): '1. Thiên Nguyên nói dối hoàn toàn. / 2. Bệ của ta là bệ duy nhất không có vết nứt.'"
  2. "Tượng Kuro (B): '1. Chronos là người nói thật hoàn toàn. / 2. Ta là người nói thật hoàn toàn.'"
  3. "Tượng Thiên Nguyên (C): '1. Kuro nói dối hoàn toàn. / 2. Chiếc ghế thứ hai từng được đặt cạnh ngai vàng.'"
- **Responses:**
  - "Kuro = Dối Trá, Chronos = Nửa Thật, Thiên Nguyên = Sự Thật" $\to$ `ch9_c03_right`
  - "Chronos = Sự Thật, Kuro = Nửa Thật, Thiên Nguyên = Dối Trá" $\to$ `ch9_c03_wrong`
- **Effects:** Không có.

### `ch9_c03_wrong`

- **Speaker:** Bia Trung Tâm
- **Lines:**
  1. "Các huy hiệu bị đẩy bật ra ngoài. Lời chứng mâu thuẫn lẫn nhau, hệ thống logic sụp đổ."
- **Responses:**
  - "Suy luận lại từ đầu." $\to$ `ch9_c03_intro`
- **Effects:** Trả lại huy hiệu.

### `ch9_c03_right`

- **Speaker:** Bia Trung Tâm
- **Lines:**
  1. "Chính xác tuyệt đối! Tượng Kuro sụp đổ mặt nạ, Tượng Thiên Nguyên tỏa sáng ấm áp, Tượng Chronos cúi đầu trầm mặc."
  2. "Cửa điện phía Bắc rung chuyển mở lối tiến vào Hành Lang Bộ Hồi Thoát."
- **Responses:**
  - "Tiến lên phía trước." $\to$ `ch9_c03_done`
- **Effects:** Đặt cờ `solved_tri_witness`, mở lối sang Map 5.

### `ch9_c03_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Hừ... chỉ là mấy câu đố chữ của người chết để lại thôi. Đi nhanh lên Peter, tao nghe thấy tiếng bánh răng chuyển động ở phòng bên rồi."
- **Responses:**
  - "(Nhìn Kuro nghi ngại) Đi thôi." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 5.

---

## 5. Bản đồ 5: Hành Lang Bộ Hồi Thoát (`map_ch9_escapement_gallery`)

### `ch9_escapement_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Một con lắc khổng lồ dài bằng cả tòa tháp đang vung qua vung lại. Tiếng gõ tích tắc làm rung chuyển sàn đá dưới chân."
  2. "Những Bóng Ma Nhiệt Dịch bay lượn quanh các quả lắc, thân thể chúng nhấp nháy tạo ra ảo ảnh đánh lừa thị giác."
- **Responses:**
  - "Cẩn thận quái vật!" $\to$ `ch9_escapement_specter_warn`
- **Effects:** Không có.

### `ch9_escapement_specter_warn`

- **Speaker:** Peter
- **Lines:**
  1. "Bóng Ma Nhiệt Dịch tạo ra hai bóng giả. Chỉ có con thật mới có nhịp sáng ngực đập theo tiếng tích tắc của đồng hồ. Phải dùng Đòn Thời Gian chém trúng con thật!"
- **Responses:**
  - "Tiến tới bệ con lắc." $\to$ `ch9_c04_intro`
- **Effects:** Không có.

### `ch9_clue_4_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Bên cạnh con lắc có một mảnh tro tàn phát ra ánh sáng tím nhạt: [Bản Thể Người Mẹ Khả Dĩ Ch7]."
  2. "Báo cáo dao động linh hồn... 'Bà Mai' mà Kuro ôm ở Chương 7 không hề có mã linh hồn cổ của người Khánh Hòa. Đó là một bản thể được Kuro tạo ra từ Khả Năng để đánh vào lòng trắc ẩn của mình!"
- **Responses:**
  - "Kuro... ngay cả mẹ của mày, mày cũng dựng lên để lừa tao sao?" $\to$ Không có (đóng thoại)
- **Effects:** Nhận `clue_ch9_possible_mother`, đặt cờ `found_clue_ch9_4`.

### `ch9_c04_intro`

- **Speaker:** Bệ Con Lắc
- **Lines:**
  1. "Bộ Hồi Thoát Thần Thánh do Chronos chế tạo để đếm nhịp Giờ 25. Con lắc đang bị lệch nhịp nghiêm trọng."
  2. "Có ba quả gia trọng A, B, C trượt trên thanh nấc từ 1 đến 9. Cần điều chỉnh vị trí để đưa dao động về trạng thái cộng hưởng tĩnh."
- **Responses:**
  - "Đọc cuộn giấy quy luật con lắc" $\to$ `ch9_c04_clue`
- **Effects:** Cho phép gạt nấc gia trọng.

### `ch9_c04_clue`

- **Speaker:** Cuộn giấy
- **Lines:**
  1. "Gia trọng A là số chẵn nguyên tố duy nhất."
  2. "Gia trọng B là lập phương của A."
  3. "Gia trọng C là căn bậc hai của tích số giữa A và B."
- **Responses:**
  - "Gia trọng A = 2, B = 8, C = 4" $\to$ `ch9_c04_right`
  - "Gia trọng A = 3, B = 9, C = 6" $\to$ `ch9_c04_wrong`
- **Effects:** Không có.

### `ch9_c04_wrong`

- **Speaker:** Bệ Con Lắc
- **Lines:**
  1. "Con lắc rung lắc dữ dội, tiếng kim gõ lệch pha vang lên chói tai. Tần số dao động bị phá vỡ hoàn toàn."
- **Responses:**
  - "Chỉnh lại vị trí các quả lắc." $\to$ `ch9_c04_intro`
- **Effects:** Đặt lại vị trí gia trọng về 1.

### `ch9_c04_right`

- **Speaker:** Bệ Con Lắc
- **Lines:**
  1. "Tiếng tích... tắc... tích... tắc trở nên êm ái, thanh thoát. Con lắc dao động mượt mà, giải phóng khóa từ mở cánh cửa lớn dẫn vào Thư Khố Da Thuộc."
- **Responses:**
  - "Vào thư khố thôi." $\to$ `ch9_c04_done`
- **Effects:** Đặt cờ `solved_escapement`, mở cửa sang Map 6.

### `ch9_c04_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Nhịp đập êm tai đấy Peter. Ngay phía trước là Thư Khố Da Thuộc, nơi cất giữ các bản chép cổ nhất của vũ trụ."
- **Responses:**
  - "Ở đó có những sự thật cần được sáng tỏ." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 6.

---

## 6. Bản đồ 6: Thư Khố Da Thuộc Tẩy Xóa (`map_ch9_palimpsest_archive`) — ĐIỂM PHÂN NHÁNH

### `ch9_archive_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Hàng vạn cuộn da thuộc cổ xưa xếp tầng tầng lớp lớp trên các giá sách khổng lồ. Mùi mực thời gian nồng đậm khắp không gian."
  2. "Tại trung tâm căn phòng, một bàn giải mã da thuộc cổ đại đang phát ra ánh sáng lung linh dưới lớp mực tẩy xóa."
- **Responses:**
  - "Kiểm tra bàn giải mã." $\to$ `ch9_c05_intro`
- **Effects:** Không có.

### `ch9_clue_5_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Trên một kệ sách khuất có một bản nhật ký máy móc: [Cơ Chế Giữ Kim 11:59 Ch8]."
  2. "Bản tính toán tại Tim Đồng Hồ: Kuro đã cố tình dùng năng lượng Possibility ghim kim đồng hồ ở 11:59 để Chronos suy kiệt, ép vị thần tối cao phải rời ngai vàng!"
- **Responses:**
  - "Năm manh mối đã đủ... Mọi thứ đều do một tay Kuro sắp đặt!" $\to$ `ch9_clues_complete`
- **Effects:** Nhận `clue_ch9_clock_stall`, đặt cờ `found_clue_ch9_5`.

### `ch9_clues_complete`

- **Speaker:** Peter
- **Lines:**
  1. "Từ kẽ nứt Chương 4, cuốn sổ cái Chương 5, ấn vỡ Chương 6, mẹ giả Chương 7, cho đến việc ghim đồng hồ Chương 8... Kuro không hề là nạn nhân. Kuro chính là kẻ giật dây tất cả!"
- **Responses:**
  - "Mình phải giải câu đố C05 rồi nói chuyện rõ ràng với nó." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `all_clues_found`.

### `ch9_c05_intro`

- **Speaker:** Bàn Da Thuộc
- **Lines:**
  1. "Trang da thuộc cổ đại bị viết đè qua các thời kỳ bằng bốn loại mực: Vàng Son, Tro Tàn, Tử Lam, Xanh Thủy Tinh."
  2. "Có ba lọ dung môi tẩy rửa (`solv_gold`, `solv_ash`, `solv_violet`). Phải dùng đúng thứ tự để bóc tách các lớp mà không làm cháy mặt giấy."
- **Responses:**
  - "Đọc biên niên sử tẩy xóa" $\to$ `ch9_c05_clue`
- **Effects:** Cho phép chọn dung dịch tẩy.

### `ch9_c05_clue`

- **Speaker:** Cuộn giấy
- **Lines:**
  1. "Lớp mực Vàng Son (`gold`) nằm ở bề mặt ngoài cùng, khô cứng dưới ánh sáng."
  2. "Lớp mực Tử Lam (`violet`) nằm ngay dưới lớp Tro Tàn (`ash`), hấp thu hơi lạnh của tro."
  3. "Lớp chữ Xanh Thủy Tinh (`cerulean`) nằm sâu nhất dưới đáy da thuộc, chỉ hiện ra khi lớp Tử Lam tan biến."
- **Responses:**
  - "Tẩy: 1. Vàng Son $\to$ 2. Tro Tàn $\to$ 3. Tử Lam" $\to$ `ch9_c05_right`
  - "Tẩy: 1. Tro Tàn $\to$ 2. Tử Lam $\to$ 3. Vàng Son" $\to$ `ch9_c05_wrong`
- **Effects:** Không có.

### `ch9_c05_wrong`

- **Speaker:** Bàn Da Thuộc
- **Lines:**
  1. "Mặt giấy bốc khói đen! Trật tự hóa chất bị nghịch đảo, trang da thuộc tự phục hồi về trạng thái ban đầu để tránh bị thiêu rụi."
- **Responses:**
  - "Tẩy rửa lại từ đầu." $\to$ `ch9_c05_intro`
- **Effects:** Không có.

### `ch9_c05_right`

- **Speaker:** Bàn Da Thuộc
- **Lines:**
  1. "Từng lớp mực tan biến hoàn hảo! Dưới lớp tro và tím, dòng chữ Xanh Thủy Tinh hiện lên sáng rực, chỉ ra con đường dẫn tới Ngai Vàng Khởi Nguyên."
- **Responses:**
  - "Quay lại nhìn Kuro..." $\to$ `ch9_kuro_crossroad`
- **Effects:** Đặt cờ `solved_creation_palimpsest`, hoàn thành `quest_ch9_unravel_truth`, bắt đầu `quest_ch9_crossroad_decision`.

---

### `ch9_kuro_crossroad` (NÚT CHỌN RẼ NHÁNH SỐ PHẬN)

- **Speaker:** Kuro
- **Lines:**
  1. "Bản đồ hiện ra rồi, Peter. Mọi chướng ngại đã dọn sạch. Giờ chỉ còn tao với mày bước lên đỉnh vinh quang thôi. Sao mày nhìn tao chằm chằm vậy?"
- **Responses:**
  - "Tao vẫn tin mày. Chiếc ghế ấy luôn có chỗ cho mày." $\to$ `ch9_route_choice_empty_chair`
  - "Mày đã giật dây tất cả... Mẹ mày, những vết nứt, mọi thứ!" $\to$ `ch9_route_choice_puppet_master`
- **Effects:** Lựa chọn quyết định nhánh chơi.

### `ch9_route_choice_empty_chair`

- **Speaker:** Kuro
- **Lines:**
  1. "Peter... Mày biết hết những toan tính của tao mà mày vẫn chọn tin tao sao?"
  2. "Được... Tao sẽ đi cùng mày đến cùng. Dù có phải đối đầu với Thần Tính Lục Hợp, tao cũng sẽ không buông tay!"
- **Responses:**
  - "Cùng bước lên Bậc Thang Penrose nào." $\to$ `ch9_start_empty_chair_path`
- **Effects:** Đặt cờ `ch9_route_empty_chair`, mở cửa sang Map 7 (`map_ch9_penrose_ascent`), bắt đầu `quest_ch9_path_of_empty_chair`.

### `ch9_route_choice_puppet_master`

- **Speaker:** Kuro
- **Lines:**
  1. "Hahaha... Ha ha ha! Thông minh lắm, Peter! Mày nhận ra rồi đấy à?"
  2. "Đúng thế! Kẻ mang quyền năng Khả Năng mới là kẻ xứng đáng nhào nặn vũ trụ này! Bọn mày chỉ là những con cờ dọn đường cho tao thôi!"
  3. "Muốn ngăn cản tao? Bước qua xác bốn Đại Phó Tướng của tao ở Cõi Phân Kỳ đi!"
- **Responses:**
  - "Kuro, đứng lại đó!" $\to$ `ch9_start_puppet_master_path`
- **Effects:** Đặt cờ `ch9_route_puppet_master`, Kuro mở cổng bão tím rồi biến mất, mở lối sang Map 13 (`map_ch9_divergence_crossroad`), bắt đầu `quest_ch9_hunt_lieutenants`.

---

# PHẦN 2A: NHÁNH "CHIẾC GHẾ TRỐNG" (BẢN ĐỒ 7 – 12)

## 7. Bản đồ 7: Bậc Thang Penrose Vô Cực (`map_ch9_penrose_ascent`)

### `ch9_penrose_arrival`

- **Speaker:** Kuro
- **Lines:**
  1. "Cầu thang này không có điểm tựa, trôi lơ lửng giữa vực thẳm sao sa. Mỗi phiến đá đều khắc những chữ số cổ."
  2. "Đi sai một bước là cả nhịp cầu thang sẽ sụp đổ, Peter à. Hãy nhìn kỹ bia đá ở chân thang."
- **Responses:**
  - "Đọc bia chân thang." $\to$ `ch9_c06_intro`
- **Effects:** Không có.

### `ch9_c06_intro`

- **Speaker:** Bia Chân Thang
- **Lines:**
  1. "Bậc thang được xây dựng bởi các môn đồ đầu tiên của Chronos, tuân theo quy luật cộng hòa tự nhiên."
  2. "Mỗi bước chân của Đấng Kiến Tạo bằng tổng hai bước chân liền trước. Khởi đầu từ bước Một, rồi bước Hai..."
- **Responses:**
  - "Bước: 3 $\to$ 5 $\to$ 8 $\to$ 13 $\to$ 21" $\to$ `ch9_c06_right`
  - "Bước: 3 $\to$ 6 $\to$ 9 $\to$ 15 $\to$ 24" $\to$ `ch9_c06_wrong`
- **Effects:** Không có.

### `ch9_c06_wrong`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Bậc đá rung chuyển rồi tan biến thành bụi sáng! Peter trượt chân và rơi nhẹ xuống đệm năng lượng ở chân cầu thang an toàn."
- **Responses:**
  - "Thử bước lại cẩn thận." $\to$ `ch9_c06_intro`
- **Effects:** Không có.

### `ch9_c06_right`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Từng bậc đá sáng bừng hào quang vàng kim vững chãi nâng bước Peter và Kuro lên cao, nối liền bờ vực sang Mật Thất Ma Phương Ký Ức."
- **Responses:**
  - "Lên đỉnh cầu thang." $\to$ `ch9_c06_done`
- **Effects:** Đặt cờ `solved_penrose_steps`, mở cửa sang Map 8.

### `ch9_c06_done`

- **Speaker:** Peter
- **Lines:**
  1. "Chúng ta đã qua được vực thẳm. Phía trước có một luồng áp lực khổng lồ... Đại Pháp Quan đang trấn giữ ở đó."
- **Responses:**
  - "Chuẩn bị vũ khí." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 8.

---

## 8. Bản đồ 8: Mật Thất Ma Phương Ký Ức (`map_ch9_memory_matrix_vault`)

### `ch9_matrix_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Sàn đá ở đây là một ma phương 3x3 khổng lồ. Sáu ô đá đã được đặt sẵn, chỉ còn ba ô trống đang phát ra ánh sáng chờ đợi."
- **Responses:**
  - "Nhìn về phía góc phòng..." $\to$ `ch9_inquisitor_encounter`
- **Effects:** Không có.

### `ch9_inquisitor_encounter`

- **Speaker:** Đại Pháp Quan
- **Lines:**
  1. "Kẻ Chưa Từng Được Ghi và Kẻ Mang Khả Năng... Các ngươi to gan dám bước chân vào cõi cấm của ký ức."
  2. "Ta là Đại Pháp Quan Tâm Điểm. Hãy nếm trải Bản Án Bốn Nhịp của công lý vĩnh cửu!"
- **Responses:**
  - "Rút kiếm nghênh chiến!" $\to$ `ch9_inquisitor_fight`
- **Effects:** Bắt đầu trận chiến mini-boss quái bản đồ với `enemy_nexus_inquisitor`.

### `ch9_inquisitor_defeat`

- **Speaker:** Đại Pháp Quan
- **Lines:**
  1. "Không thể nào... Bản án bốn nhịp bị bẻ gãy... Trang giấy đánh rơi năm xưa nay đã thành lưỡi kiếm..."
- **Responses:**
  - "Thu nhặt khối đá niên đại rơi ra." $\to$ `ch9_c07_intro`
- **Effects:** Đặt cờ `defeated_nexus_inquisitor`, nhặt được `epoch_stone_2`, `epoch_stone_4`, `epoch_stone_5`.

### `ch9_c07_intro`

- **Speaker:** Ma Phương Ký Ức
- **Lines:**
  1. "Ma phương 3x3 niên đại cổ: Tổng của mỗi hàng, cột, đường chéo luôn luôn bằng 15."
  2. "Đã có sẵn: Hàng 1: [8, 1, 6]; Hàng 2: [3, ?, 7]; Hàng 3: [?, 9, ?]. Hãy đặt ba khối đá 2, 4, 5 vào đúng vị trí."
- **Responses:**
  - "Trung tâm = 5, Tây Nam = 4, Đông Nam = 2" $\to$ `ch9_c07_right`
  - "Trung tâm = 2, Tây Nam = 5, Đông Nam = 4" $\to$ `ch9_c07_wrong`
- **Effects:** Cho phép đặt đá.

### `ch9_c07_wrong`

- **Speaker:** Ma Phương Ký Ức
- **Lines:**
  1. "Các khối đá kêu lạch cạch. Dòng năng lượng niên đại chưa đồng nhất 15. Ma phương từ chối kích hoạt."
- **Responses:**
  - "Nhấc đá ra xếp lại." $\to$ `ch9_c07_intro`
- **Effects:** Trả lại đá vào túi.

### `ch9_c07_right`

- **Speaker:** Ma Phương Ký Ức
- **Lines:**
  1. "Mọi hàng, cột, đường chéo bừng sáng con số 15 huyền diệu! Sàn đá hạ xuống tạo thành bậc thang dẫn tới Thành Trì Kiến Trúc Sư."
- **Responses:**
  - "Tiến vào thành trì." $\to$ `ch9_c07_done`
- **Effects:** Đặt cờ `solved_memory_matrix`, mở cửa sang Map 9.

### `ch9_c07_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Giải quyết gọn ghẽ lắm, Peter. Nhưng cỗ máy bảo vệ ở phòng sau không dễ đối phó như tên Pháp Quan đâu."
- **Responses:**
  - "Có mày bên cạnh, tao không sợ." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 9.

---

## 9. Bản đồ 9: Thành Trì Kiến Trúc Sư (`map_ch9_architect_bastion`)

### `ch9_architect_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Một cỗ máy đá khổng lồ bốn tay đang ngự trị giữa phòng, ba bánh đà năng lượng Thời Gian, Không Gian, Nhân Quả xoay tít sau lưng nó."
- **Responses:**
  - "Kiến Trúc Sư Nguyên Thủy thức tỉnh!" $\to$ `ch9_architect_boss_intro`
- **Effects:** Bắt đầu trận chiến mid-boss với `boss_primeval_architect`.

### `ch9_architect_boss_intro`

- **Speaker:** Kiến Trúc Sư
- **Lines:**
  1. "CẢNH BÁO XÂM NHẬP TÂM ĐIỂM. KÍCH HOẠT QUY TRÌNH THANH LỌC THỜI GIAN. TAM TRỤC VẬN HÀNH."
- **Responses:**
  - "Kuro, phối hợp với tao!" $\to$ `ch9_architect_fight_p1`
- **Effects:** Vào trận boss theo lượt.

### `ch9_architect_kuro_hold`

- **Speaker:** Kuro
- **Lines:**
  1. "Nó suy yếu rồi, Peter! Tao đang dùng Khả Năng giữ chặt tay và bánh đà của nó! Mau chọn hành động [Ngắt Bộ Điều Áp Cổ] ở sau lưng nó đi!"
- **Responses:**
  - "[Ngắt Bộ Điều Áp Cổ]" $\to$ `ch9_architect_boss_win`
- **Effects:** Kích hoạt hành động môi trường kết liễu mid-boss.

### `ch9_architect_boss_win`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Tiếng rắc vang lên! Bộ điều áp cổ bị ngắt rời, ba bánh đà dừng quay rồi vỡ vụn thành cát bụi. Kiến Trúc Sư quỳ sụp xuống, tắt hẳn ánh sáng mắt."
- **Responses:**
  - "Chúng ta thắng rồi!" $\to$ `ch9_fb_02_trigger`
- **Effects:** Đặt cờ `defeated_primeval_architect`.

### `ch9_fb_02_trigger`

- **Speaker:** Ký ức (FB-02)
- **Lines:**
  1. "Ảo ảnh thời viễn cổ hiện lên: Chronos trong áo choàng vàng nguyên vẹn và một vị thần hiền từ đang cùng nhau khiêng một chiếc ghế đá trắng đặt cạnh ngai vàng."
  2. "Vị thần hiền từ mỉm cười: 'Chronos, ngai vàng này không dành cho một người đơn độc. Khi mệt mỏi, hãy để chiếc ghế thứ hai sẻ chia gánh nặng cùng ngài.'"
- **Responses:**
  - "Chiếc ghế thứ hai... từng thực sự tồn tại!" $\to$ `ch9_architect_done`
- **Effects:** Đặt cờ `seen_fb_02`, mở cửa sang Map 10.

### `ch9_architect_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Ký ức vừa rồi... Lão già Chronos cũng từng có bạn đồng hành sao? Nhưng người bạn đó giờ ở đâu rồi?"
- **Responses:**
  - "Chúng ta sẽ tìm ra câu trả lời." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 10.

---

## 10. Bản đồ 10: Dàn Chuông Gãy Cánh (`map_ch9_broken_chime_choir`)

### `ch9_chime_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Bốn chiếc chuông pha lê khổng lồ treo giữa không trung. Ở dưới sân điện... mọi người đều đang ở đây!"
- **Responses:**
  - "Chào mọi người!" $\to$ `ch9_companions_greet`
- **Effects:** Không có.

### `ch9_companions_greet`

- **Speaker:** Lyra
- **Lines:**
  1. "Peter! Ngọn kích của tôi đã phá tan phong ấn biên giới để đến đây cùng cậu. Nhân quả giả tạo không thể ngăn cản chúng ta!"
- **Responses:**
  - "Cảm ơn Lyra!" $\to$ `ch9_neris_greet`
- **Effects:** Đặt cờ `met_lyra_ch9`.

### `ch9_neris_greet`

- **Speaker:** Neris
- **Lines:**
  1. "Tôi đã ghi lại tất cả những cái tên bị lãng quên vào cuốn sổ này. Giờ là lúc chúng ta trả lại tiếng nói cho họ."
- **Responses:**
  - "Cô Ba và bé Na cũng đến sao?" $\to$ `ch9_coba_na_greet`
- **Effects:** Đặt cờ `met_neris_ch9`.

### `ch9_coba_na_greet`

- **Speaker:** Cô Ba & Bé Na
- **Lines:**
  1. "Chú Peter ơi! Con hạc giấy của chú vẫn bay nè! Chú phải thắng để về quán ăn chè với con nhé!"
  2. "Cô Ba tin ở con, Peter. Cả xóm biển Khánh Hòa vẫn đang chờ con về sửa đồng hồ đấy."
- **Responses:**
  - "Con nhất định sẽ về!" $\to$ `ch9_aldric_variant`
- **Effects:** Không có.

### `ch9_aldric_variant`

- **Speaker:** Aldric
- **Lines:**
  1. "Peter! Ta mang theo di nguyện của toàn quân đoàn. Lưỡi kiếm của cậu mang theo hy vọng chấm dứt cuộc chiến bất tận này!"
- **Responses:**
  - "Nhìn lên bốn chiếc chuông pha lê." $\to$ `ch9_c08_intro`
- **Effects:** Nhận lời chúc mở nút hỗ trợ trong trận boss.

### `ch9_c08_intro`

- **Speaker:** Dàn Chuông Pha Lê
- **Lines:**
  1. "Bốn chiếc chuông mang các nốt nhạc: Chuông 1 (Đô - 0 nửa cung, cố định), Chuông 2 (Rê - 2 nửa cung), Chuông 3 (Fa - 5 nửa cung), Chuông 4 (La - 9 nửa cung)."
  2. "Cần chỉnh các chuông thành Hợp Âm Trưởng hoàn hảo: Gốc (0), Ba Trưởng (Mi: 4 nửa cung), Năm Đúng (Sol: 7 nửa cung), Bát Độ (Đô cao: 12 nửa cung)."
- **Responses:**
  - "Vặn Chuông 2 +2 (lên Mi), Chuông 3 +2 (lên Sol), Chuông 4 +3 (lên Đô cao)" $\to$ `ch9_c08_right`
  - "Vặn Chuông 2 +1, Chuông 3 +1, Chuông 4 +2" $\to$ `ch9_c08_wrong`
- **Effects:** Cho phép vặn chuông.

### `ch9_c08_wrong`

- **Speaker:** Dàn Chuông Pha Lê
- **Lines:**
  1. "Tiếng chuông vang lên âm thanh chói gắt của quãng ba căng (tritone)! Sóng âm va đập làm rung chuyển căn phòng."
- **Responses:**
  - "Chỉnh lại các nấc chuông." $\to$ `ch9_c08_intro`
- **Effects:** Trả chuông về vị trí ban đầu.

### `ch9_c08_right`

- **Speaker:** Dàn Chuông Pha Lê
- **Lines:**
  1. "Khúc ca Trưởng ngân vang trong trẻo tuyệt mỹ! Âm thanh thuần khiết xua tan màn sương mù thời gian, mở ra cánh cổng tiến vào Thánh Đường Thiên Cầu Vi Mô."
- **Responses:**
  - "Tiến bước thôi!" $\to$ `ch9_c08_done`
- **Effects:** Đặt cờ `solved_broken_chime`, mở cửa sang Map 11.

### `ch9_c08_done`

- **Speaker:** Lyra
- **Lines:**
  1. "Bọn tôi sẽ giữ vững hậu phương cho cậu ở đây. Hãy tiến lên và định đoạt tương lai, Peter!"
- **Responses:**
  - "Cảm ơn mọi người!" $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 11.

---

## 11. Bản đồ 11: Thánh Đường Thiên Cầu Vi Mô (`map_ch9_astrolabe_nave`)

### `ch9_astrolabe_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Một mô hình thiên cầu khổng lồ mô phỏng ba hành tinh thời gian quay quanh ngai vàng trung tâm. Kẻ Dệt Nghịch Lý đang lượn quanh các quỹ đạo."
- **Responses:**
  - "Để ý chiếc kén của nó!" $\to$ `ch9_astrolabe_weaver_warn`
- **Effects:** Không có.

### `ch9_astrolabe_weaver_warn`

- **Speaker:** Kuro
- **Lines:**
  1. "Kẻ Dệt Nghịch Lý khép cánh kén thì phản 100% đòn đánh. Đợi hai tiếng chuông keng... keng báo hiệu kén mở 1.2 giây rồi mới xông vào đánh nhé Peter!"
- **Responses:**
  - "Tao rõ rồi." $\to$ `ch9_secret_2_pickup`
- **Effects:** Không có.

### `ch9_secret_2_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Trong hộc đá bệ thiên cầu có bản vẽ cổ: [Chiếc Ghế Thứ Hai - Trang 1/2]."
  2. "Bản vẽ ghi chú: 'Bên cạnh ngai vàng của Chronos luôn có chiếc ghế thứ hai của Thiên Nguyên. Hai vị thần cùng cầm cán cân. Khi Thiên Nguyên tự xóa tên mình, chiếc ghế bị phủ bụi nhưng chưa từng bị dỡ bỏ.'"
- **Responses:**
  - "Chiếc ghế trống... vốn dĩ đã ở đó từ thuở sơ khai!" $\to$ `ch9_side_quest_kuro_heart_trigger`
- **Effects:** Nhận `world_secret_ch9_the_empty_chair`.

### `ch9_side_quest_kuro_heart_trigger`

- **Speaker:** Kuro
- **Lines:**
  1. "Peter... nhìn bản vẽ đó, tao lại thấy nhớ mẹ tao... Mày có nghĩ nếu một ngày tao tan biến, mẹ tao có còn nhớ đến tao không?"
- **Responses:**
  - "Mẹ mày sẽ nhớ, và tao cũng sẽ mãi mãi nhớ mày." $\to$ `ch9_kuro_heart_open`
  - "Đừng bi quan, chúng ta sắp thắng rồi." $\to$ `ch9_c09_intro`
- **Effects:** Bắt đầu nhiệm vụ phụ `quest_ch9_kuro_heart`.

### `ch9_kuro_heart_open`

- **Speaker:** Kuro
- **Lines:**
  1. "Cảm ơn mày... Tao từng nghĩ trên đời này chỉ có quyền lực mới bảo vệ được bản thân. Nhưng có lẽ... tao đã sai."
- **Responses:**
  - "Cùng giải câu đố thiên cầu nào." $\to$ `ch9_c09_intro`
- **Effects:** Đặt cờ `kuro_heart_opened` (mở khóa điều kiện True Ending thay thế `ch7_kuro_embraced`).

### `ch9_c09_intro`

- **Speaker:** Trục Xoay Thiên Cầu
- **Lines:**
  1. "Hệ thống ba hành tinh thời gian: Alpha chu kỳ 3 ngày (đang ở vị trí 1), Beta chu kỳ 4 ngày (đang ở vị trí 2), Gamma chu kỳ 6 ngày (đang ở vị trí 4)."
  2. "Cần vặn trục thêm bao nhiêu ngày để cả ba hành tinh cùng thẳng hàng tại điểm số 0 của chu kỳ?"
- **Responses:**
  - "Vặn trục thêm 2 ngày" $\to$ `ch9_c09_right`
  - "Vặn trục thêm 4 ngày" $\to$ `ch9_c09_wrong`
- **Effects:** Cho phép vặn trục số ngày.

### `ch9_c09_wrong`

- **Speaker:** Trục Xoay Thiên Cầu
- **Lines:**
  1. "Các hành tinh xoay lệch quỹ đạo và va chạm vào nhau tóe lửa! Các thiên cầu chưa thể đồng quy tại điểm số 0."
- **Responses:**
  - "Tính toán lại số ngày đồng dư." $\to$ `ch9_c09_intro`
- **Effects:** Không có.

### `ch9_c09_right`

- **Speaker:** Trục Xoay Thiên Cầu
- **Lines:**
  1. "Trục xoay dừng lại ở số 2. Cả ba hành tinh Alpha, Beta, Gamma cùng trượt vào rãnh số 0 thẳng hàng tắp! Cánh cửa dẫn vào Thánh Điện Kẻ Vô Danh mở toang."
- **Responses:**
  - "Bước vào thánh điện cuối cùng!" $\to$ `ch9_c09_done`
- **Effects:** Đặt cờ `solved_astrolabe`, mở cửa sang Map 12.

### `ch9_c09_done`

- **Speaker:** Peter
- **Lines:**
  1. "Thánh Điện Kẻ Vô Danh ở ngay trước mặt... Nơi trang sách của mình sẽ tìm lại được định nghĩa trọn vẹn."
- **Responses:**
  - "Đi thôi Kuro." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 12.

---

## 12. Bản đồ 12: Thánh Điện Kẻ Vô Danh (`map_ch9_sanctum_of_the_unwritten`)

### `ch9_unwritten_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Một căn phòng tĩnh lặng không một hạt bụi. Ở giữa phòng là Bệ Khởi Thảo bằng đá trắng, nơi phát ra hào quang lam ngọc dịu dàng."
- **Responses:**
  - "Tiến lại gần bệ đá." $\to$ `ch9_c10_intro`
- **Effects:** Không có.

### `ch9_fb_03_trigger`

- **Speaker:** Ký ức (FB-03)
- **Lines:**
  1. "Tiếng sóng biển gầm rú trong cơn bão năm xưa. Người thợ đồng hồ già lom khom bế đứa trẻ sơ sinh quấn trong mảnh áo choàng xám."
  2. "Bên cạnh đứa bé là một thanh kiếm gãy phát ra ánh sáng lam ngọc: 'Đứa trẻ này không có tên... nhưng ánh mắt nó sáng như bầu trời sao Khánh Hòa vậy.'"
- **Responses:**
  - "Ông nội... con đã hiểu vì sao người nuôi nấng con." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `seen_fb_03`.

### `ch9_c10_intro`

- **Speaker:** Bệ Khởi Thảo
- **Lines:**
  1. "Trang Sách Khởi Nguyên chưa được ghi tên: Peter đặt trang giấy bản thể của mình lên bệ. Cần điền đúng ba mệnh đề định nghĩa bản thể."
  2. "Ba ổ xoay ký tự đang chờ đợi sự thật được khẳng định."
- **Responses:**
  - "Khắc chữ vào ba ổ" $\to$ `ch9_c10_choices`
- **Effects:** Không có.

### `ch9_c10_choices`

- **Speaker:** Bệ Khởi Thảo
- **Lines:**
  1. "Ổ 1 (Tên thật của Kẻ Bị Quên Đầu Tiên): [A. Thiên Nguyên] / [B. Hư Vô] / [C. Vô Danh]."
  2. "Ổ 2 (Bản thể Peter trong lời Chronos): [A. Vết nứt đầu tiên] / [B. Người canh giữ ngai] / [C. Trang giấy ta đánh rơi]."
  3. "Ổ 3 (Lời thề đáp lại lời hứa Kuro): [A. Mày cứ ngồi vào ghế một mình] / [B. Tao sẽ để lại một chiếc ghế trống cho mày] / [C. Chiếc ghế ấy sẽ bị thiêu rụi]."
- **Responses:**
  - "Chọn: Ổ 1 = A (Thiên Nguyên), Ổ 2 = C (Trang giấy ta đánh rơi), Ổ 3 = B (Chiếc ghế trống)" $\to$ `ch9_c10_right`
  - "Chọn: Ổ 1 = B, Ổ 2 = A, Ổ 3 = A" $\to$ `ch9_c10_wrong`
- **Effects:** Không có.

### `ch9_c10_wrong`

- **Speaker:** Bệ Khởi Thảo
- **Lines:**
  1. "Các ký tự mờ nhạt đi. Trang giấy từ chối khắc ghi những định nghĩa sai lệch về số phận."
- **Responses:**
  - "Suy ngẫm lại và khắc lại." $\to$ `ch9_c10_choices`
- **Effects:** Không có.

### `ch9_c10_right`

- **Speaker:** Bệ Khởi Thảo
- **Lines:**
  1. "Toàn bộ trang giấy bừng sáng ánh hào quang lam ngọc rực rỡ (`#00c8ff`)! Tên của THIÊN NGUYÊN bừng sáng trên trang sách!"
  2. "Thanh kiếm gãy của Peter hấp thụ ánh sáng ấy, gắn kết lại thành vũ khí tối thượng: [Thanh Kiếm Chúa Tể Thời Gian Cuối Cùng - Last Chronarch Blade]!"
- **Responses:**
  - "Cầm lấy thanh kiếm hoàn thiện." $\to$ `ch9_c10_done`
- **Effects:** Đặt cờ `solved_final_inscription`, trao vật phẩm `last_chronarch_blade`, mở lối sang Map 19 (`map_ch9_hall_of_the_sixfold_throne`), hoàn thành `quest_ch9_path_of_empty_chair`, bắt đầu `quest_ch9_finale_sixfold`.

### `ch9_c10_done`

- **Speaker:** Kuro
- **Lines:**
  1. "Thanh kiếm đẹp lắm, Peter... Giờ thì không còn điều gì ngăn cản chúng ta nữa. Cánh cửa Đại Điện Ngai Vàng đã mở. Đi gặp Chronos thôi!"
- **Responses:**
  - "Bước vào trận chiến cuối cùng!" $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang Map 19.

---

# PHẦN 2B: NHÁNH "KẺ GIẬT DÂY" (BẢN ĐỒ 13 – 18)

## 13. Bản đồ 13: Ngã Tư Phân Kỳ Khả Năng (`map_ch9_divergence_crossroad`)

### `ch9_crossroad_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Một cơn bão tím hỗn mang gầm rú xé rách không gian. Tại ngã tư các chiều thời gian, hình bóng Chronos đang bị trói chặt trong những sợi xích tím Possibility."
- **Responses:**
  - "Chronos! Ngài làm sao vậy?" $\to$ `ch9_chronos_trapped_talk`
- **Effects:** Không có.

### `ch9_chronos_trapped_talk`

- **Speaker:** Chronos
- **Lines:**
  1. "Kuro đã dùng quyền năng Khả Năng trói ta vào một nhánh thực tại 'chưa từng tái sinh'... Ta không còn thân xác để chiến đấu nữa..."
  2. "Peter... Nếu ngươi là trang giấy ta đánh rơi, hãy làm cái việc mà cuốn sổ này không làm được: Ngăn chặn Kuro trước khi nó nuốt chửng mọi thực tại!"
- **Responses:**
  - "Tôi sẽ ngăn chặn nó!" $\to$ `ch9_chronos_trapped_end`
- **Effects:** Đặt cờ `chronos_plea_heard`.

### `ch9_chronos_trapped_end`

- **Speaker:** Kuro (Vọng lại từ không gian)
- **Lines:**
  1. "Vô ích thôi Peter! Bốn cánh cổng của bốn Phó Tướng đang chờ mày ở Thung Lũng Cờ Lệch Pha. Mày sẽ gục ngã trước những bóng ma quá khứ của chính mày!"
- **Responses:**
  - "Tiến vào Thung Lũng Cờ Lệch Pha!" $\to$ Không có (đóng thoại)
- **Effects:** Mở cửa sang Map 14.

---

## 14. Bản đồ 14: Thung Lũng Cờ Lệch Pha (`map_ch9_vale_of_twisted_banners`) — PHÓ TƯỚNG 1

### `ch9_bran_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Một thung lũng đầy những lá cờ rách nát bay phần phật. Người lính trẻ mang số hiệu 1.427 đứng chắn giữa đường, đôi mắt rực lửa tím Possibility."
- **Responses:**
  - "Bran... là cậu sao?" $\to$ `ch9_bran_confront`
- **Effects:** Không có.

### `ch9_bran_confront`

- **Speaker:** Bran Tái Sinh
- **Lines:**
  1. "Ta không phải Bran của nấm mồ kia! Ta là nhánh khả năng nơi ta sống sót để phục thù! Ngài Kuro đã ban cho ta sức mạnh bất tử!"
- **Responses:**
  - "Cậu bị Kuro lợi dụng rồi!" $\to$ `ch9_bran_memorial_check`
- **Effects:** Không có.

### `ch9_bran_memorial_check`

- **Speaker:** Bran Tái Sinh
- **Lines:**
  1. (Nếu có cờ `ch4_choice_bran_memorial`): "Số hiệu 1.427... Peter? Cậu... cậu là người đã khắc tên ta lên bia mộ sao? Đầu ta đau quá..."
  2. (Nếu không có cờ): "Chết đi, kẻ cản đường Ngài Kuro!"
- **Responses:**
  - "Vào trận!" $\to$ `ch9_bran_fight`
- **Effects:** Bắt đầu trận chiến mini-boss theo lượt với `boss_lieutenant_bran` (nếu có cờ bia mộ, Bran giảm 200 HP khởi đầu).

### `ch9_bran_defeat`

- **Speaker:** Bran Tái Sinh
- **Lines:**
  1. "Lá cờ... rốt cuộc đã hạ xuống... Cảm ơn cậu, Peter... Hãy giải thoát cho những người khác..."
- **Responses:**
  - "Nghỉ ngơi đi, Bran." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `defeated_lieutenant_bran`, mở cửa sang Map 15.

---

## 15. Bản đồ 15: Phế Tích Pháp Đình Sắt (`map_ch9_iron_tribunal_ruins`) — PHÓ TƯỚNG 2

### `ch9_lyra_boss_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Những chiếc cân sắt khổng lồ bị gãy gục giữa quảng trường đổ nát. Một nữ chiến binh cầm kích uy dũng bước ra từ bóng tối."
- **Responses:**
  - "Lyra... tại sao lại là cô?" $\to$ `ch9_lyra_boss_confront`
- **Effects:** Không có.

### `ch9_lyra_boss_confront`

- **Speaker:** Pháp Quan Lyra
- **Lines:**
  1. "Ta là nhánh khả năng nơi Lyra chấp nhận chiếc ngai Đại Pháp Quan để bảo vệ trật tự tuyệt đối! Không ai được phép chống lại phán quyết của Kuro!"
  2. "Cây kích này sẽ thực thi bản án nhân quả đảo nghịch lên đầu ngươi!"
- **Responses:**
  - "Lyra mà tôi biết luôn chiến đấu vì tự do!" $\to$ `ch9_lyra_boss_fight`
- **Effects:** Bắt đầu trận mini-boss với `boss_lieutenant_lyra`.

### `ch9_lyra_boss_defeat`

- **Speaker:** Pháp Quan Lyra
- **Lines:**
  1. "Chiếc khiên phán quyết đã nứt... Cậu nói đúng, Peter... Tự do không bao giờ nằm trong tay một kẻ giật dây..."
- **Responses:**
  - "Tiến vào Thư Phòng Chìm." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `defeated_lieutenant_lyra`, mở cửa sang Map 16.

---

## 16. Bản đồ 16: Thư Phòng Chìm Khả Dĩ (`map_ch9_drowned_scriptorium`) — PHÓ TƯỚNG 3

### `ch9_neris_boss_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Căn phòng ngập trong làn nước mực đen ngòm. Một bóng ma nữ tử lơ lửng, xung quanh là những trang sách câm bay lượn như bão tố."
- **Responses:**
  - "Neris! Hãy tỉnh lại đi!" $\to$ `ch9_neris_boss_confront`
- **Effects:** Không có.

### `ch9_neris_boss_confront`

- **Speaker:** Neris Mất Trí
- **Lines:**
  1. "Tên của ta là gì? Ký ức của ta là gì? Kuro nói chỉ cần xóa sạch ngươi, ta sẽ có được một cái tên vĩnh viễn không bị lãng quên!"
  2. "Hãy chìm vào bão mực câm lặng đi!"
- **Responses:**
  - "Tôi sẽ nhắc lại tên cho cô!" $\to$ `ch9_neris_boss_fight`
- **Effects:** Bắt đầu trận mini-boss với `boss_lieutenant_neris`.

### `ch9_neris_boss_defeat`

- **Speaker:** Neris Mất Trí
- **Lines:**
  1. "Dòng mực đen tan biến rồi... Tôi nhớ ra rồi, tên tôi là Neris... Người thủ thư của những linh hồn... Cảm ơn cậu, Peter..."
- **Responses:**
  - "Sang Đại Điện Gương Vỡ." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `defeated_lieutenant_neris`, mở cửa sang Map 17.

---

## 17. Bản đồ 17: Đại Điện Gương Vỡ (`map_ch9_hall_of_broken_mirrors`) — PHÓ TƯỚNG 4

### `ch9_other_peter_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Hàng ngàn mảnh gương vỡ phản chiếu hình bóng của Peter. Từ trong chiếc gương lớn nhất, một người bước ra: Mái tóc xoăn, chiếc áo choàng than chì, nhưng cầm một thanh kiếm nguyên vẹn rực lửa tím."
- **Responses:**
  - "Ngươi là... chính ta?" $\to$ `ch9_other_peter_confront`
- **Effects:** Không có.

### `ch9_other_peter_confront`

- **Speaker:** Peter Thứ Hai
- **Lines:**
  1. "Ta là nhánh khả năng nơi Peter chấp nhận đứng cạnh Kuro để thống trị vạn cõi! Kẻ yếu đuối mang thanh kiếm gãy như ngươi không xứng đáng tồn tại!"
- **Responses:**
  - "Sức mạnh không đến từ thanh kiếm, mà đến từ trái tim!" $\to$ `ch9_other_peter_fight`
- **Effects:** Bắt đầu trận mini-boss với `boss_lieutenant_other_peter`.

### `ch9_other_peter_defeat`

- **Speaker:** Peter Thứ Hai
- **Lines:**
  1. "Thanh kiếm nguyên vẹn của ta... lại gãy trước một mảnh giấy rách sao? Kuro... ngươi đã chọn sai quân cờ rồi..."
- **Responses:**
  - "Nhặt cuộn bí mật trên bệ gương." $\to$ `ch9_secret_3_pickup`
- **Effects:** Đặt cờ `defeated_lieutenant_other_peter`.

### `ch9_secret_3_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Cuộn tài liệu rơi ra từ mảnh gương: [Bản Ghi Lỗi Vận Hành - Trang 1/2]."
  2. "Ghi nhận sự cố ở Kỷ Nguyên Đầu: 'Khi lệnh xóa tên chạy, áp lực nghẽn đã bứt một trang giấy văng ra khe nứt. Đó là trang giấy tự do duy nhất, không chịu bất kỳ luật lệ nào của số mệnh.'"
- **Responses:**
  - "Mình chính là trang giấy tự do đó... Kuro, kết thúc thôi!" $\to$ Không có (đóng thoại)
- **Effects:** Nhận `world_secret_ch9_malfunction_record`, mở cửa sang Map 18.

---

## 18. Bản đồ 18: Ngai Vàng Muôn Nhánh (`map_ch9_throne_of_infinite_branches`) — QUYẾT CHIẾN KURO

### `ch9_kuro_boss_arrival`

- **Speaker:** Kuro
- **Lines:**
  1. "Mày đã hạ hết bốn phó tướng của tao... Khá lắm Peter! Nhưng ở đây, trên Ngai Vàng Muôn Nhánh, tao chính là Chúa Tể Khả Năng!"
  2. "Tao sẽ viết lại toàn bộ thực tại! Mọi thế giới sẽ vận hành theo ý muốn của tao!"
- **Responses:**
  - "Một thế giới bị ép buộc bởi khả năng của mày cũng chỉ là một nhà tù khác!" $\to$ `ch9_kuro_boss_fight_start`
- **Effects:** Bắt đầu trận chiến boss theo lượt với `boss_kuro_puppet_master`.

### `ch9_kuro_boss_fight_start`

- **Speaker:** Kuro
- **Lines:**
  1. "Để xem thanh kiếm gãy của mày có cản được bão tố Possibility không! Tiếp chiêu đi, Peter!"
- **Responses:**
  - "Lên!" $\to$ Vào trận combat.
- **Effects:** Khởi chạy trận đánh boss.

### `ch9_kuro_boss_finisher_prompt`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Kuro kiệt sức quỳ sụp xuống, nhưng năng lượng Possibility quanh hắn bắt đầu bùng nổ mất kiểm soát, đe dọa nuốt chửng toàn bộ các cõi giới!"
  2. "Chỉ có một cách duy nhất để phong ấn nguồn năng lượng vô hạn này: Peter phải dùng chính bản thể trang giấy của mình bọc lấy hắn!"
- **Responses:**
  - "Kích hoạt chiêu bắt buộc [Trang Giấy Trở Về]" $\to$ `ch9_ending_4_trigger`
- **Effects:** Đặt cờ `defeated_kuro_puppet_master`, chuyển tới cảnh kết thúc Nhánh B.

---

# PHẦN 3: ĐẠI ĐIỆN NGAI VÀNG SÁU ẤN (BẢN ĐỒ 19 — NHÁNH A)

## 19. Bản đồ 19: Đại Điện Ngai Vàng Sáu Ấn (`map_ch9_hall_of_the_sixfold_throne`)

### `ch9_sixfold_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Đại Điện Ngai Vàng rực sáng ánh hào quang của sáu quyền năng. Chronos trong hình hài chiến đấu uy nghiêm đứng cạnh Ngai Vàng."
  2. "Kim đồng hồ nhích dần từng tích tắc cuối cùng hướng về con số 12:00."
- **Responses:**
  - "Chronos, dừng lại đi!" $\to$ `ch9_sixfold_boss_intro`
- **Effects:** Không có.

### `ch9_sixfold_boss_intro`

- **Speaker:** Chronos
- **Lines:**
  1. "Giờ Thứ 25 sắp điểm 12:00. Hoặc các ngươi giao nộp nửa Ấn Khởi Nguyên để cứu lấy trật tự, hoặc tất cả sẽ bị chôn vùi trong Hư Không!"
- **Responses:**
  - "Kuro, đứng cạnh tao! Chúng ta sẽ tìm ra con đường thứ ba!" $\to$ `ch9_sixfold_phase_1`
- **Effects:** Bắt đầu trận boss tối hậu `boss_sixfold_divinity`.

### `ch9_sixfold_phase_1`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Pha 1: Trận chiến hai màu vòng! Vòng vàng Trật Tự của Chronos và vòng tím Khả Năng của Kuro cùng lao tới."
  2. "Căn đúng khoảnh khắc hai vòng trùng nhịp trên ô của Peter để kích nổ hai luồng năng lượng triệt tiêu nhau!"
- **Responses:**
  - "Tập trung đỡ đòn!" $\to$ Vào trận Phase 1.
- **Effects:** Kích hoạt cơ chế timedBlock hai vòng.

### `ch9_sixfold_phase_2_intro`

- **Speaker:** Chronos
- **Lines:**
  1. "Khá lắm... Nhưng Thần Tính Lục Hợp không thể bị khuất phục bởi những kẻ phàm trần!"
  2. "Thần Tính thức tỉnh sáu cánh hào quang thần thánh!"
- **Responses:**
  - "Kuro, kề vai sát cánh!" $\to$ `ch9_sixfold_phase_2_allies`
- **Effects:** Chuyển sang Phase 2.

### `ch9_sixfold_phase_2_allies`

- **Speaker:** Kuro
- **Lines:**
  1. "Mày không đơn độc đâu Peter! Nhìn kìa, đồng đội của chúng ta đang tiếp sức từ phía sau!"
- **Responses:**
  - "Mở lệnh [Gọi Đồng Đội]" $\to$ Vào trận Phase 2.
- **Effects:** Mở nút [Gọi Đồng Đội] (Ivo hồi giáp, Lyra phá khiên, Neris hồi HP/MP, Na thả hạc).

### `ch9_sixfold_phase_3_finisher`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Đồng hồ điểm đúng 12:00:00! Sáu cánh thần thánh vỡ vụn, boss giữ cố định ở 1 HP."
  2. "Khoảnh khắc quyết định lịch sử đã đến! Peter giơ cao thanh kiếm hoàn thiện, sẵn sàng thi triển chiêu thức quyết định."
- **Responses:**
  - "Chọn chiêu kết liễu [Khắc Trang Cuối]" $\to$ `ch9_sixfold_victory`
- **Effects:** Đặt cờ `defeated_sixfold_divinity`, hoàn thành `quest_ch9_finale_sixfold`, chuyển sang Map Vương Miện Vĩnh Hằng.

### `ch9_sixfold_victory`

- **Speaker:** Chronos
- **Lines:**
  1. "Ngươi đã khắc lại quy luật... Ngai vàng đã mở... Hãy bước lên Vương Miện Vĩnh Hằng và đưa ra quyết định của ngươi, Peter."
- **Responses:**
  - "Bước lên Vương Miện Vĩnh Hằng." $\to$ Không có (đóng thoại)
- **Effects:** Dịch chuyển sang `map_ch9_crown_of_eternity`.

---

# PHẦN 4: VƯƠNG MIỆN VĨNH HẰNG & BỐN KẾT CỤC

## 20. Vương Miện Vĩnh Hằng (`map_ch9_crown_of_eternity`)

### `ch9_crown_arrival`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Đỉnh cao nhất của cõi sáng tạo. Trước mắt Peter là cỗ máy vận mệnh của toàn vũ trụ. Kim đồng hồ đã dừng ở điểm 12:00."
  2. "Một quyết định tại đây sẽ định hình số phận của hàng tỷ sinh linh mãi mãi về sau."
- **Responses:**
  - "Tiến bước lên ngai." $\to$ `ch9_crown_gate_check`
- **Effects:** Bắt đầu nhiệm vụ `quest_ch9_the_final_choice`.

### `ch9_fb_04_trigger`

- **Speaker:** Ký ức (FB-04)
- **Lines:**
  1. "Dưới ánh hoàng hôn Khánh Hòa đỏ rực, ngón tay út của Kuro đưa ra móc ngoặc với ngón tay Peter."
  2. "'Mày đã hứa sẽ nhớ tên tao... Dù thời gian có trôi đi đâu, lời hứa này cũng không bao giờ tan biến!'"
- **Responses:**
  - "Tao giữ trọn lời hứa, Kuro." $\to$ Không có (đóng thoại)
- **Effects:** Đặt cờ `seen_fb_04`.

### `ch9_crown_gate_check`

- **Speaker:** Peter
- **Lines:**
  1. (Nếu đủ điều kiện True Ending: `ch8_learned_torn_page` + `solved_final_inscription` + (`ch7_kuro_embraced` HOẶC `kuro_heart_opened`)):
     "Mình có ba con đường để lựa chọn trước mắt."
  2. (Nếu thiếu điều kiện):
     "Trước mắt mình có hai con đường... Nhưng dường như vẫn còn một con đường thứ ba, tiếc rằng trái tim của người bạn đồng hành vẫn chưa hoàn toàn được hàn gắn."
- **Responses:**
  - (Đủ điều kiện): "Xem 3 lựa chọn kết thúc" $\to$ `ch9_endings_choice_all`
  - (Thiếu điều kiện): "Xem 2 lựa chọn kết thúc" $\to$ `ch9_endings_choice_two`
- **Effects:** Không có.

### `ch9_endings_choice_all`

- **Speaker:** Bệ Vận Mệnh
- **Lines:**
  1. "Hãy lựa chọn tương lai cho thực tại:"
- **Responses:**
  - "Trao Ấn cho Chronos [KẾT THÚC 1: TRẬT TỰ VĨNH CỬU]" $\to$ `ch9_end_1_beat_1`
  - "Cùng Kuro chém nát Ngai Vàng [KẾT THÚC 2: VĨNH HẰNG BẤT TẬN]" $\to$ `ch9_end_2_beat_1`
- **Effects:** Chọn kết thúc (hoặc tùy chọn 3 bên dưới).

### `ch9_endings_choice_true_prompt`

- **Speaker:** Peter
- **Lines:**
  1. "Không... Tao sẽ chọn con đường thứ ba: [KẾT THÚC 3: CHÚA TỂ THỜI GIAN CUỐI CÙNG]!"
- **Responses:**
  - "Khắc lời thề Chiếc Ghế Trống" $\to$ `ch9_end_3_beat_1`
- **Effects:** Kích hoạt True Ending.

### `ch9_endings_choice_two`

- **Speaker:** Bệ Vận Mệnh
- **Lines:**
  1. "Hãy lựa chọn tương lai cho thực tại:"
- **Responses:**
  - "Trao Ấn cho Chronos [KẾT THÚC 1: TRẬT TỰ VĨNH CỬU]" $\to$ `ch9_end_1_beat_1`
  - "Cùng Kuro chém nát Ngai Vàng [KẾT THÚC 2: VĨNH HẰNG BẤT TẬN]" $\to$ `ch9_end_2_beat_1`
- **Effects:** Chỉ mở 2 lựa chọn khi thiếu cờ.

---

## 21. Bốn Kết Cục Beat-by-Beat

### KẾT THÚC 1: TRẬT TỰ VĨNH CỬU (`ending_order`)

#### `ch9_end_1_beat_1`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter trao nửa Ấn Origin cho Chronos. Chiếc ấn tròn khép lại nguyên vẹn, tỏa ra ánh hoàng kim lạnh lùng bao phủ khắp vũ trụ."
- **Responses:**
  - "..." $\to$ `ch9_end_1_beat_2`
- **Effects:** Đặt cờ `ch9_ending_order`.

#### `ch9_end_1_beat_2`

- **Speaker:** Kuro
- **Lines:**
  1. "Peter... tại sao mày lại chọn điều này... Bão Khả Năng... đang tắt..."
  2. "Cơ thể Kuro tan rã dần thành những hạt bụi tím, trôi dạt vào cõi vô định của The Interval."
- **Responses:**
  - "Xin lỗi mày, Kuro..." $\to$ `ch9_end_1_beat_3`
- **Effects:** Không có.

#### `ch9_end_1_beat_3`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Chronos bước lên Ngai Vàng Khởi Nguyên. Kim đồng hồ vượt qua mốc 12:00, cỗ máy vũ trụ vận hành trở lại với trật tự hoàn hảo không một vết xước."
- **Responses:**
  - "..." $\to$ `ch9_end_1_beat_4`
- **Effects:** Không có.

#### `ch9_end_1_beat_4`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Các thế giới tách rời nhau trong tĩnh lặng. Bờ biển Khánh Hòa, Sol-Karis, Thành Phố Thép Beta trở về dòng chảy riêng biệt."
- **Responses:**
  - "..." $\to$ `ch9_end_1_beat_5`
- **Effects:** Không có.

#### `ch9_end_1_beat_5`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Mọi vết nứt khép lại hoàn toàn. Những người từng bị xóa tên vĩnh viễn biến mất, không còn để lại một dấu vết nào trong tâm trí nhân loại."
- **Responses:**
  - "..." $\to$ `ch9_end_1_beat_6`
- **Effects:** Không có.

#### `ch9_end_1_beat_6`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter tỉnh lại trong tiệm sửa đồng hồ nhỏ ở Khánh Hòa. Một buổi sáng nắng vàng ươm, tiếng chuông cửa leng keng đón chào khách qua đường."
- **Responses:**
  - "..." $\to$ `ch9_end_1_beat_7`
- **Effects:** Không có.

#### `ch9_end_1_beat_7`

- **Speaker:** Peter
- **Lines:**
  1. "Chiếc đồng hồ quả quýt trên tay mình đang tích tắc nhịp nhàng từng giây chuẩn xác... Nhưng sao trong lồng ngực lại trống rỗng thế này?"
  2. "Hình như... mình đã quên mất một người rất quan trọng..."
- **Responses:**
  - "..." $\to$ `ch9_end_1_beat_8`
- **Effects:** Không có.

#### `ch9_end_1_beat_8`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Trật tự đã được bảo toàn. Nhưng cái giá của sự vĩnh cửu là những giấc mơ không bao giờ được bắt đầu."
- **Responses:**
  - "[KẾT THÚC]" $\to$ `ch9_credits_order`
- **Effects:** Chuyển sang thẻ kết `credits_order`, hoàn thành trò chơi.

---

### KẾT THÚC 2: VĨNH HẰNG BẤT TẬN (`ending_unbound`)

#### `ch9_end_2_beat_1`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter và Kuro dồn toàn bộ sức mạnh chém nát Ngai Vàng Khởi Nguyên! Chronos vỡ vụn thành hàng triệu mảnh ánh sáng vàng rách xích."
- **Responses:**
  - "..." $\to$ `ch9_end_2_beat_2`
- **Effects:** Đặt cờ `ch9_ending_unbound`.

#### `ch9_end_2_beat_2`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Sổ Khởi Nguyên bùng cháy rực rỡ! Mọi quy luật thời gian, nhân quả và giới hạn thực tại bị thiêu rụi thành tro tàn."
- **Responses:**
  - "..." $\to$ `ch9_end_2_beat_3`
- **Effects:** Không có.

#### `ch9_end_2_beat_3`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Hàng vạn thực tại song song ùa vào nhau trong hỗn loạn! Bầu trời bừng lên muôn triệu sắc màu kỳ dị chưa từng thấy trong lịch sử."
- **Responses:**
  - "..." $\to$ `ch9_end_2_beat_4`
- **Effects:** Không có.

#### `ch9_end_2_beat_4`

- **Speaker:** Kuro
- **Lines:**
  1. "Tự do rồi Peter! Ha ha ha! Tự do rồi! Không còn ai có thể tước đoạt tương lai của chúng ta nữa!"
  2. "Nhưng bàn tay của Kuro bắt đầu tan rã thành những dải hạt ánh sáng tím."
- **Responses:**
  - "Kuro, tay mày..." $\to$ `ch9_end_2_beat_5`
- **Effects:** Không có.

#### `ch9_end_2_beat_5`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Không còn quá khứ, không còn tương lai. Vạn vật tồn tại đồng thời trong một biển khả năng hỗn loạn không ngừng biến đổi hình dạng."
- **Responses:**
  - "..." $\to$ `ch9_end_2_beat_6`
- **Effects:** Không có.

#### `ch9_end_2_beat_6`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter và Kuro trôi dạt giữa các chiều không gian vô tận. Họ vừa là những vị thần tự do, vừa là những kẻ lang thang không bến đỗ."
- **Responses:**
  - "..." $\to$ `ch9_end_2_beat_7`
- **Effects:** Không có.

#### `ch9_end_2_beat_7`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Tiệm sửa đồng hồ Khánh Hòa biến thành một ảo ảnh bay lơ lửng giữa biển mây tím, nửa thực nửa mơ, vừa tồn tại vừa không tồn tại."
- **Responses:**
  - "..." $\to$ `ch9_end_2_beat_8`
- **Effects:** Không có.

#### `ch9_end_2_beat_8`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Không còn xiềng xích, không còn cắt tỉa. Thực tại đã tự do, nhưng tự do trong một giấc mơ vĩnh viễn không thể thức tỉnh."
- **Responses:**
  - "[KẾT THÚC]" $\to$ `ch9_credits_unbound`
- **Effects:** Chuyển sang thẻ kết `credits_unbound`, hoàn thành trò chơi.

---

### KẾT THÚC 3: CHÚA TỂ THỜI GIAN CUỐI CÙNG (`ending_true` — TRUE ENDING)

#### `ch9_end_3_beat_1`

- **Speaker:** Peter
- **Lines:**
  1. "Peter bước lên giữa Chronos và Kuro, giơ cao thanh kiếm lam ngọc đã hoàn thiện, dõng dạc cất lời thề:"
  2. "'Tao sẽ không ngồi vào ngai vàng ấy một mình. Tao sẽ để lại một chiếc ghế trống cho mày, cho đến khi nào mày trở về!'"
- **Responses:**
  - "..." $\to$ `ch9_end_3_beat_2`
- **Effects:** Đặt cờ `ch9_ending_true`.

#### `ch9_end_3_beat_2`

- **Speaker:** Chronos
- **Lines:**
  1. "Chronos lặng người nhìn trang giấy lỗi mà ngài từng đánh rơi. Trong đôi mắt vị thần cổ xưa, một nụ cười thanh thản hiện lên:"
  2. "'Hóa ra... sự sống không phải cỗ máy cần sửa chữa. Ta đã giam cầm chính mình quá lâu rồi... Cảm ơn ngươi, Peter.'"
- **Responses:**
  - "Ngài thanh thản hóa thành làn gió bảo hộ tan vào vũ trụ." $\to$ `ch9_end_3_beat_3`
- **Effects:** Không có.

#### `ch9_end_3_beat_3`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter dùng quyền năng Origin kết hợp Possibility tái lập trật tự vũ trụ: Sáu quyền năng được trao trả lại cho ý chí tự do của muôn loài."
  2. "Không còn chế độ thần quyền phán xét. Tương lai từ nay do chính con người tự viết nên."
- **Responses:**
  - "..." $\to$ `ch9_end_3_beat_4`
- **Effects:** Không có.

#### `ch9_end_3_beat_4`

- **Speaker:** Kuro
- **Lines:**
  1. "Sự ăn mòn của Interval tan biến. Kuro nhìn đôi bàn tay nguyên vẹn của mình, rồi nhìn Peter, mỉm cười rạng rỡ:"
  2. "'Mày làm được rồi, Peter. Mày đã giữ đúng lời hứa...'"
- **Responses:**
  - "Hai người móc ngoặc ngón tay út như ngày thơ ấu." $\to$ `ch9_end_3_beat_5`
- **Effects:** Không có.

#### `ch9_end_3_beat_5`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Tại Đại Điện Khởi Nguyên, một chiếc ghế đá trắng tinh khôi được đặt trang trọng bên cạnh mỏ neo thời gian, mãi mãi chờ đợi người bạn tri kỷ."
- **Responses:**
  - "..." $\to$ `ch9_end_3_beat_6`
- **Effects:** Không có.

#### `ch9_end_3_beat_6`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Bình minh rực rỡ chiếu sáng bờ cát Khánh Hòa. Tiếng sóng biển rì rào quen thuộc. Quán nước cô Ba mở cửa, bé Na tung tăng vẫy tay chào."
- **Responses:**
  - "..." $\to$ `ch9_end_3_beat_7`
- **Effects:** Không có.

#### `ch9_end_3_beat_7`

- **Speaker:** Bà Mai
- **Lines:**
  1. "Bà Mai từ trong quán nhỏ bước ra, trên tay bưng mâm cơm nóng hổi, mỉm cười đôn hậu:"
  2. "'Kuro! Peter! Hai đứa đi đâu từ sớm thế? Mau vào ăn cơm kẻo nguội cả rồi này!'"
- **Responses:**
  - "Dạ, tụi con về ăn cơm đây mẹ!" $\to$ `ch9_end_3_beat_8`
- **Effects:** Không có.

#### `ch9_end_3_beat_8`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter mỉm cười nhìn cánh hải âu chao liệng giữa nền trời xanh thẳm. Chiếc đồng hồ bỏ túi tích tắc nhịp 1 giây bình dị của trần thế."
  2. "CHRONO – The Fractured Divinity. Câu chuyện kết thúc, cuộc đời bắt đầu."
- **Responses:**
  - "[KẾT THÚC CHÂN THẬT]" $\to$ `ch9_credits_true`
- **Effects:** Chuyển sang thẻ kết `credits_true`, hoàn thành trọn vẹn trò chơi.

---

### KẾT THÚC 4: TRANG GIẤY TRỞ VỀ (`ending_returned_page` — NHÁNH B)

#### `ch9_end_4_beat_1`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Đứng trước cơn bão Possibility cuồng loạn, Peter bước lên Bệ Khởi Nguyên, giải phóng toàn bộ năng lượng của bản thể Unwritten."
- **Responses:**
  - "..." $\to$ `ch9_end_4_beat_2`
- **Effects:** Đặt cờ `ch9_ending_returned_page`.

#### `ch9_end_4_beat_2`

- **Speaker:** Peter
- **Lines:**
  1. "Cơ thể Peter tan rã thành ánh sáng trắng, hóa lại thành trang giấy nguyên bản của Sổ Khởi Nguyên bọc chặt lấy Kuro."
  2. "'Nếu không nhà tù nào giam được mày... thì tao sẽ là phong ấn giữ chặt mày, Kuro.'"
- **Responses:**
  - "..." $\to$ `ch9_end_4_beat_3`
- **Effects:** Không có.

#### `ch9_end_4_beat_3`

- **Speaker:** Kuro
- **Lines:**
  1. "Kuro gào thét trong tuyệt vọng khi mọi nhánh khả năng bị cuốn vào trang giấy:"
  2. "'Peter! Mày điên rồi sao? Mày sẽ bị xóa sổ hoàn toàn! Không một ai... không một ai sẽ nhớ mày từng sống trên đời!'"
- **Responses:**
  - "Peter mỉm cười thanh thản khi trang sách khép lại." $\to$ `ch9_end_4_beat_4`
- **Effects:** Không có.

#### `ch9_end_4_beat_4`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Sổ Khởi Nguyên đóng lại với một tiếng 'cạch' dứt khoát. Các thế giới tách rời và lành lặn trở lại. Vết nứt thời gian biến mất hoàn toàn."
- **Responses:**
  - "..." $\to$ `ch9_end_4_beat_5`
- **Effects:** Không có.

#### `ch9_end_4_beat_5`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Bờ biển Khánh Hòa vẫn tấp nập buổi sớm. Quán cô Ba đông khách qua lại, nhưng góc phố nơi từng có tiệm sửa đồng hồ nay chỉ là một bãi đất trống rợp bóng cây."
- **Responses:**
  - "..." $\to$ `ch9_end_4_beat_6`
- **Effects:** Không có.

#### `ch9_end_4_beat_6`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. (Nếu có cờ `gave_na_papers`):
     "Trên mỏm đá hoàng hôn, một cánh hạc giấy nhỏ chao liệng cô đơn trong gió biển, như mảnh ký ức duy nhất còn sót lại về một người anh tốt bụng."
- **Responses:**
  - "..." $\to$ `ch9_end_4_beat_7`
- **Effects:** Không có.

#### `ch9_end_4_beat_7`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Tại Đỉnh Tháp Neo của vũ trụ, một chiếc ghế đá trắng đứng cô độc giữa ngàn sao tĩnh lặng. Không ai ngồi lên đó, vĩnh viễn trống không."
- **Responses:**
  - "..." $\to$ `ch9_end_4_beat_8`
- **Effects:** Không có.

#### `ch9_end_4_beat_8`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Trang giấy đã trở về với cuốn sách. Người hùng đã cứu lấy thế giới, nhưng thế giới không còn chỗ cho anh."
- **Responses:**
  - "[KẾT THÚC NHÁNH B]" $\to$ `ch9_credits_returned_page`
- **Effects:** Chuyển sang thẻ kết `credits_returned_page`, hoàn thành trò chơi.

---

# PHẦN 5: CÁC BẢN ĐỒ ẨN (HIDDEN MAPS A, B, C)

## 22. Bản đồ Ẩn A: Hầm Mộ Lời Thề Bị Xóa (`map_ch9_hidden_crypt_of_vows`)

### `ch9_crypt_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Một hầm mộ cổ kính nằm sâu dưới lòng đất. Bốn bia mộ đá của bốn vị dũng sĩ Kỷ Nguyên Đầu đang đứng im lìm."
- **Responses:**
  - "Kiểm tra bia mộ trung tâm." $\to$ `ch9_c11_intro`
- **Effects:** Bắt đầu nhiệm vụ phụ `quest_ch9_crypt_of_vows`.

### `ch9_c11_intro`

- **Speaker:** Bia Mộ Cổ
- **Lines:**
  1. "Bốn Dũng Sĩ Kỷ Nguyên Đầu (A, B, C, D) cần xếp đúng vị trí 1, 2, 3, 4 trên bệ danh dự."
  2. "Phiến A: 'Ta không đứng đầu, nhưng đứng ngay trước Kẻ Mang Khiên (C).'"
  3. "Phiến B: 'Ta đứng ở vị trí số lẻ.' — Phiến C: 'Ta đứng sau phiến A đúng một bậc.' — Phiến D: 'Ta đứng cuối cùng.'"
- **Responses:**
  - "Xếp theo thứ tự: B — A — C — D (1 - 2 - 3 - 4)" $\to$ `ch9_c11_right`
  - "Xếp theo thứ tự: A — C — B — D" $\to$ `ch9_c11_wrong`
- **Effects:** Không có.

### `ch9_c11_wrong`

- **Speaker:** Bia Mộ Cổ
- **Lines:**
  1. "Các phiến đá chấn động. Vị trí các dũng sĩ bị nghịch đảo lời thề. Hầm mộ không mở khóa."
- **Responses:**
  - "Xếp lại các phiến đá." $\to$ `ch9_c11_intro`
- **Effects:** Không có.

### `ch9_c11_right`

- **Speaker:** Bia Mộ Cổ
- **Lines:**
  1. "Bốn phiến đá khép lại hoàn hảo! Bệ mộ bật mở, để lộ thanh cổ kiếm: [Lưỡi Kiếm Thần Tính Gãy - Broken Divinity Edge] (`attack: 26, defense: 5`)."
- **Responses:**
  - "Nhận lấy thanh kiếm cổ." $\to$ `ch9_c11_done`
- **Effects:** Đặt cờ `solved_permutation_cipher`, trao vật phẩm `broken_divinity_edge`, hoàn thành `quest_ch9_crypt_of_vows`.

### `ch9_c11_done`

- **Speaker:** Peter
- **Lines:**
  1. "Thanh kiếm mang ý chí kiên cường của những người đi trước. Nó sẽ giúp mình vững bước hơn."
- **Responses:**
  - "Rời khỏi hầm mộ." $\to$ Không có (đóng thoại)
- **Effects:** Mở cổng quay lại đại điện.

---

## 23. Bản đồ Ẩn B: Két Bánh Răng Lượng Tử (`map_ch9_hidden_quantum_vault`)

### `ch9_quantum_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Két bí mật của xưởng đúc Ivo. Ba bánh răng lượng tử I, II, III kết nối với một rương báu cổ bằng vàng ròng."
- **Responses:**
  - "Kiểm tra cơ chế bánh răng." $\to$ `ch9_c12_intro`
- **Effects:** Bắt đầu nhiệm vụ phụ `quest_ch9_quantum_vault`.

### `ch9_c12_intro`

- **Speaker:** Bản Vẽ Ivo
- **Lines:**
  1. "Ba bánh răng có nấc xoay từ 1 đến 5."
  2. "Bánh răng Một là nấc số lẻ nguyên tố nhỏ nhất. Bánh răng Hai hơn Bánh răng Một đúng 1 nấc. Bánh răng Ba là cạnh huyền cân bằng bình phương của hai bánh trước."
- **Responses:**
  - "Vặn: Bánh răng I = 3, Bánh răng II = 4, Bánh răng III = 5" $\to$ `ch9_c12_right`
  - "Vặn: Bánh răng I = 2, Bánh răng II = 3, Bánh răng III = 4" $\to$ `ch9_c12_wrong`
- **Effects:** Cho phép vặn dials.

### `ch9_c12_wrong`

- **Speaker:** Bản Vẽ Ivo
- **Lines:**
  1. "Các bánh răng kẹt cứng! Tỷ số truyền động không tạo thành tam giác cân bằng bình phương."
- **Responses:**
  - "Vặn lại các nấc số." $\to$ `ch9_c12_intro`
- **Effects:** Không có.

### `ch9_c12_right`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Ba bánh răng 3 - 4 - 5 khớp vào nhau xoay tít! Khóa két bật mở, để lộ kỷ vật thiêng liêng: [Bùa Chiếc Ghế Trống - Empty Chair Token] (`maxHp: 65, defense: 4`)."
- **Responses:**
  - "Đeo bùa vào người." $\to$ `ch9_c12_done`
- **Effects:** Đặt cờ `solved_quantum_gears`, trao vật phẩm `empty_chair_token`, hoàn thành `quest_ch9_quantum_vault`.

### `ch9_c12_done`

- **Speaker:** Peter
- **Lines:**
  1. "Chiếc bùa ấm áp lạ thường, như thể có một người bạn vô hình luôn đứng bên cạnh che chở."
- **Responses:**
  - "Trở lại hành trình." $\to$ Không có (đóng thoại)
- **Effects:** Mở cửa quay về thư khố.

---

## 24. Bản đồ Ẩn C: Thánh Địa Thiên Nguyên (`map_ch9_hidden_sanctum_of_the_first`)

### `ch9_sanctum_first_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Nơi an nghỉ nguyên thủy của Thiên Nguyên — vị thần đồng hành đã tự nguyện xóa tên mình để cứu lấy thực tại."
  2. "Tám cột đá xếp thành vòng bát giác bao quanh mộ tượng. Ở trung tâm là một Trục Đảo Cực."
- **Responses:**
  - "Kiểm tra cơ chế bát giác." $\to$ `ch9_c13_intro`
- **Effects:** Bắt đầu nhiệm vụ phụ `quest_ch9_first_legacy`.

### `ch9_c13_intro`

- **Speaker:** Mộ Tượng Thiên Nguyên
- **Lines:**
  1. "Trận Đồ Bát Giác Đảo Pha: Bốn cột lẻ (1, 3, 5, 7) đang SÁNG; bốn cột chẵn (2, 4, 6, 8) đang TẮT."
  2. "Thao tác một cột sẽ đảo nó và cột đối diện qua tâm. Trục giữa đảo trạng thái các cột chẵn (chỉ mở sau khi cột 2 và 4 đã được thao tác)."
- **Responses:**
  - "Thao tác: 1. Bấm Cột 2 $\to$ 2. Bấm Cột 4 $\to$ 3. Gạt Trục Giữa" $\to$ `ch9_c13_right`
  - "Thao tác: 1. Gạt Trục Giữa ngay $\to$ 2. Bấm Cột 1" $\to$ `ch9_c13_wrong`
- **Effects:** Không có.

### `ch9_c13_wrong`

- **Speaker:** Mộ Tượng Thiên Nguyên
- **Lines:**
  1. "Trục giữa bị khóa chặt! Trận đồ bị mất cân bằng đối xứng."
- **Responses:**
  - "Đặt lại trạng thái ban đầu." $\to$ `ch9_c13_intro`
- **Effects:** Trả về trạng thái ban đầu.

### `ch9_c13_right`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Toàn bộ tám cột đá cùng bừng sáng hào quang trắng bạc rực rỡ! Bệ mộ hé mở, hé lộ hai tài liệu bí mật cổ xưa nhất của vũ trụ."
- **Responses:**
  - "Đọc hai cuộn tài liệu." $\to$ `ch9_secrets_4_5_pickup`
- **Effects:** Đặt cờ `solved_octagonal_inversion`.

### `ch9_secrets_4_5_pickup`

- **Speaker:** Peter
- **Lines:**
  1. "Nhận được [Lời Trăn Trối Của Thiên Nguyên] và [Lời Tự Thú Của Kuro]."
  2. "Thiên Nguyên viết: 'Ta trao lại tên của ta cho trang giấy tự do trong tương lai.' — Và mẩu giấy của Kuro: 'Nếu tao biến mất, tao mong mày là người duy nhất gọi tên tao...'"
- **Responses:**
  - "Một luồng năng lượng đen tím bùng lên từ sâu trong bệ mộ!" $\to$ `ch9_void_boss_intro`
- **Effects:** Nhận `world_secret_ch9_thien_nguyen_testament` và `world_secret_ch9_kuro_confession`.

### `ch9_void_boss_intro`

- **Speaker:** Lõi Kỳ Dị Hư Vô
- **Lines:**
  1. "TIẾNG GẦM CỦA HƯ KHÔNG NGUYÊN THỦY! Khối cầu đen tím với hàng vạn xúc tu ánh sáng trồi lên, bóp méo toàn bộ không-thời gian xung quanh!"
- **Responses:**
  - "Thử thách tối thượng... Hãy đến đây!" $\to$ `ch9_void_boss_fight`
- **Effects:** Bắt đầu trận chiến boss ẩn theo lượt với `boss_void_singularity_core` (HP 2600).

### `ch9_void_boss_defeat`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Khối cầu đen tím phát nổ tan biến thành ngàn hạt bụi sao hiền hòa! Một huy hiệu cổ đại rơi xuống tay Peter: [Bùa Lục Hợp - Sixfold Harmony Clasp] (`maxHp: 70, defense: 6, speed: 6`)."
- **Responses:**
  - "Chúng ta đã hoàn thành di nguyện của Thiên Nguyên." $\to$ `ch9_c13_done`
- **Effects:** Đặt cờ `defeated_void_singularity_core`, trao `sixfold_harmony_clasp`, hoàn thành `quest_ch9_first_legacy`.

### `ch9_c13_done`

- **Speaker:** Peter
- **Lines:**
  1. "Mọi bí mật của Kỷ Nguyên Đầu đã được sáng tỏ trọn vẹn. Lòng mình thanh thản hơn bao giờ hết."
- **Responses:**
  - "Rời khỏi thánh địa." $\to$ Không có (đóng thoại)
- **Effects:** Mở cổng quay lại đại điện.

---

# PHẦN 6: HỒI KẾT — BẾN ĐỖ TÁI SINH (`map_ch9_epilogue_reborn`)

### `ch9_epilogue_arrival`

- **Speaker:** Peter
- **Lines:**
  1. "Bờ biển Khánh Hòa trải dài dưới ánh nắng ban mai. Từng con sóng vỗ rì rào vào bờ cát trắng mịn, mang theo hương vị mặn mòi quen thuộc của quê hương."
- **Responses:**
  - "Hít một hơi thật sâu..." $\to$ `ch9_epilogue_walk`
- **Effects:** Đặt cờ `ch9_game_completed`.

### `ch9_epilogue_walk`

- **Speaker:** Dẫn chuyện
- **Lines:**
  1. "Peter bước đi thong thả trên con đường làng quen thuộc. Tiếng cười nói của những người dân chài, tiếng còi tàu xa xa ngoài khơi..."
  2. "Tất cả những thế giới đã được cứu rỗi, những vết nứt đã lành lặn, và cuộc đời bình dị lại tiếp tục chảy trôi."
- **Responses:**
  - "Nhìn lại con đường phía sau." $\to$ `ch9_epilogue_final_words`
- **Effects:** Không có.

### `ch9_epilogue_final_words`

- **Speaker:** Peter
- **Lines:**
  1. "Cảm ơn những người đã đồng hành cùng tôi suốt hành trình dài. Chiếc ghế trống sẽ luôn ở đó... cho đến ngày tất cả chúng ta gặp lại nhau."
- **Responses:**
  - "[KẾT THÚC TOÀN BỘ TRÒ CHƠI]" $\to$ Không có (đóng màn hình)
- **Effects:** Trở về màn hình chính (Title Scene).
