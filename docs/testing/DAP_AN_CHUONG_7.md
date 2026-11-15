# Đáp Án & Lí Giải Câu Đố — Chương 7

Tài liệu dành cho người test, tiết lộ toàn bộ đáp án. Dùng **Chọn chương → 7** để vào đầu chương, cấp 24 (trần cấp chương 27).
Nguồn: dữ liệu thực tế maps.json, dialogue.json, items.json, enemies.json, đối chiếu CHAPTER_07_DESIGN.md §18–§19. Khi khác nhau, ưu tiên dữ liệu.
Dùng [E] đổi từng vòng xoay rồi tương tác điểm xác nhận; C02 còn có dialCheck tự mở thoại khi đủ bộ đúng.

## C01 · Người Gác Cầu Vô Danh

**Ở đâu:** Bờ Cát Phai Màu (`map_ch7_faded_shore`).

**Đáp án:** **A – N – H**, rồi **Gọi tên**.

- Nhặt thẻ thu phí; nghe ngư dân nói tên lão có ba chữ cái, là tiếng các em gọi người lớn tuổi hơn mình.
- **Vì sao:** cách gọi ấy là “anh”, vừa đúng ba chữ.
- Kết quả: `restored_bridge_keeper`.

## C02 · Ba Cửa Sổ

**Ở đâu:** Xóm Chài Bị Xóa (`map_ch7_erased_hamlet`).

**Đáp án:** cửa sổ **1 Lam · 2 Vàng · 3 Trắng**.

- Bia gắn người già với sóng biển, người cha với rơm ruộng, trẻ nhỏ với trang giấy; bậu cửa lần lượt khắc mỏ neo, bó lúa, chong chóng.
- **Vì sao:** mỏ neo → biển → lam; bó lúa → rơm → vàng; chong chóng → trẻ nhỏ → trắng.
- Kết quả: `opened_erased_hamlet_gate`.

## C03 · Tên Mẹ Kuro

**Ở đâu:** Thánh Điện Chiếc Nôi (`map_ch7_cradle_sanctuary`).

**Đáp án:** **Trần – Thị – Mai**, rồi **Gọi tên**.

- Mép nôi còn “Tr... Thị ... ru con ngủ say”. Bà nói tên là loài hoa mùa xuân và chạm vào kẹp tóc hình hoa mai.
- **Vì sao:** trong các họ được chọn chỉ Trần khớp “Tr...”; chữ đệm còn nguyên; hoa mai cho tên chính.
- Kết quả: `restored_kuro_mother_name`, nhận **Cài Áo Bông Mai Của Mẹ** (`kuro_mother_brooch`). Giữ vật này để hòa giải với Kuro; boss chỉ yêu cầu sở hữu, không cần đeo.
- Nói chuyện lại với bà để nghe đầy đủ “Chiều Trên Bến Cũ”, dùng cho C09.

## C04 · Ba Hòn Sỏi Âm Vang

**Ở đâu:** Giếng Vọng Cái Tên (`map_ch7_echo_well_depths`).

**Đáp án:** phễu **Trầm: Quặng Sắt · Trung: Đá Sao · Bổng: Thạch Anh**.

- Bia nói nốt trầm cần sỏi nặng; loại nuốt âm không dùng được. Ghi chép cho Thạch Anh < Đá Sao < Quặng Sắt < Hư Vô, nhưng Hư Vô nuốt âm.
- **Vì sao:** bỏ Hư Vô, xếp ba viên còn lại từ nặng tới nhẹ, tương ứng trầm tới bổng.
- Kết quả: `balanced_echo_well`.

## C05 · Ba Cánh Buồm

**Ở đâu:** Bến Thuyền Mắc Cạn (`map_ch7_stranded_fleet`).

**Đáp án:** **Thủy thủ B**, rồi **Trao hải đồ**.

- C quê Ninh Hòa; A nói B chưa tới Cam Ranh; buồm trắng thuộc người Cam Ranh; buồm nâu không của người Ninh Hòa; thuyền trưởng lái buồm nâu.
- **Vì sao:** A = Cam Ranh/buồm trắng, B = Nha Trang. C không có buồm nâu nên buồm nâu chỉ còn B; C có buồm đỏ. Vậy B là thuyền trưởng.
- Trang sử từ lựa chọn chương 6 chỉ xác nhận manh mối, không bắt buộc. Kết quả: `solved_stranded_fleet`.

## C06 · Bốn Kim Đồng Hồ

**Ở đâu:** Nghĩa Địa Đồng Hồ (`map_ch7_clock_graveyard`).

**Đáp án:** góc **12 giờ: Kim 8 · 3 giờ: Kim 11 · 6 giờ: Kim 2 · 9 giờ: Kim 5**.

- Đồng hồ quả quýt ở Vực Tro Thủy Tinh (`map_ch7_ash_abyss_drop`) dừng ở 8 khi Peter rơi. Ghi chú thợ nói bắt đầu ở giờ rơi, mỗi góc cộng 3 theo chiều kim, quá 12 thì vòng lại.
- **Vì sao:** 8 → 11 → 14 − 12 = 2 → 5; không xếp tăng dần từ 2.
- Kết quả: `solved_clock_graveyard`.

## C07 · Kệ Sách Mực Tàng Hình

**Ở đâu:** Thư Khố Giấy Trắng (`map_ch7_blank_archives`).

**Đáp án:** ngăn **1 Tro (A) · 2 Hoa Cúc (B) · 3 Quặng Sắt (C) · 4 Đá Sao (D)**.

- Bảng mùi: tro = giấc mơ; hoa cúc = mái nhà; quặng sắt = lao động; đá sao = đấng sáng tạo.
- Nhặt và đọc **Ghi Chép Của Thủ Thư** trong túi: giấc mơ → mái nhà → đôi tay → đấng sáng tạo, từ nhẹ tới nặng.
- **Vì sao:** nối cuộn giấy → mùi → ký ức → ngăn, không dùng số gam ở bản cũ.
- Kết quả: `solved_blank_archives`; nhặt **Chìa khóa trắng** dưới ngăn cuối để vào C12.

## C08 · Hộp Hẹn Ước Tuổi Thơ

**Ở đâu:** Mỏm Đá Gốc Bàng (`map_ch7_bang_tree_promontory`).

**Đáp án:** **ngày 15 · tháng 07 · tuổi 14**.

- Đọc **Trang Nhật Ký Tuổi Thơ** trong túi: hẹn vào rằm tháng bảy âm lịch, năm mười bốn tuổi.
- **Vì sao:** rằm là ngày 15; không đổi sang ngày dương lịch.
- Kết quả: `opened_childhood_pledge_box`, nhận `childhood_pledge_shard` và hồi tưởng ông thợ đồng hồ.

## C09 · Mê Cung Sương Lời Ru

**Ở đâu:** Mê Cung Sương Lời Ru (`map_ch7_fog_lullaby_maze`).

**Đáp án:** **Bến thuyền → Gốc bàng → Giếng cạn → Ngọn đèn**.

- Lời bà Mai: “Chiều về ra bến đợi thuyền, qua gốc bàng gãy ven triền đá xanh. Ghé giếng cạn múc nước lành, rồi theo ngọn đèn đầu ghềnh mà về.”
- **Vì sao:** đi đúng thứ tự các mốc được hát, thay câu đố chuông cũ.
- Vùng trigger theo tile: bến (4–6, 12–14), bàng (17–19, 12–14), giếng (4–6, 4–6), đèn (17–19, 4–6).
- Có `ch5_refused_alpha_memory` thì thoại đến map tự đặt `ch7_fog_1`, có thể bắt đầu từ bàng. Đi sai xóa ba bước đầu và đưa về `from_tree`; sau đó phải đi lại từ bến, không dựa vào trợ giúp lần đến đầu.
- Kết quả: `solved_fog_maze`, **`ch7_mother_song_remembered`**, điều kiện cảnh ôm Kuro.

## C10 · Mắt Xích Thứ Ba

**Ở đâu:** Chiếc Nôi Rạng Đông (`map_ch7_cradle_of_dawn`).

**Đáp án:** truyền ấn vào chốt **[U]**.

- Lời thì thầm nói xích đúc từ sự đứng yên; ánh sáng thiêu, bóng tối làm mục.
- **Vì sao:** ký tự Origin [U] là Tĩnh, đã học ở chương 6; [A] và [O] không hợp.
- Kết quả: `stabilized_third_chain`, mở lối tới Ngưỡng Cửa Giờ Số Không và khe xuống C13.

## C11 · Ẩn: Bàn Thờ Thợ Khắc Đầu Tiên

**Ở đâu:** Mộ Người Khắc Bia Đầu Tiên (`map_ch7_first_mason_tomb`), qua khe Hành Lang Than Khóc sau khi thắng Kẻ Khóc Không Tên.

**Đáp án theo giá 1–4:** **Kim Cương → Đồng → Hư Vô → Thép**.

- Phiến 1 lấp lánh bụi sao; phiến 2 đá vôi mềm; phiến 3 hút sáng; phiến 4 xếp lớp. Bia nối đá trời với kim cương, mềm với đồng, hư không với đục hư vô, xếp lớp với thép.
- **Vì sao:** nhận chất đá qua mô tả từng phiến; không xếp theo một thứ tự độ cứng giả định.
- Kết quả: `honored_first_mason`, nhận **Kiếm Cắt Hư Vô** (`void_severance_blade`).

## C12 · Ẩn: Lá Thư Mất Dấu

**Ở đâu:** Hầm Chuông Trắng (`map_ch7_white_bell_crypt`), mở cửa đá trong mê cung bằng `white_crypt_key` từ thư khố.

**Đáp án:** **mẹ · chờ · bến** → “Mẹ chờ con ở bến cũ.”

- Thư ghi “Me cho con o ben cu”; người viết là mẹ, bài hát có “Bến Cũ”, ký ức đợi thuyền về loại nghĩa “chở”.
- **Vì sao:** khôi phục nghĩa lời hẹn, không chọn dấu tùy ý.
- Nhận `mother_golden_hairpin`; quay về nói chuyện bà Mai để hoàn tất nhiệm vụ. Kẹp tóc này khác cài áo cần cho Kuro.

## C13 · Ẩn: Trái Tim Tro Thủy Tinh

**Ở đâu:** Lõi Tro Thủy Tinh (`map_ch7_glass_ash_core`), qua khe sau khi gia cố mắt xích C10.

**Đáp án:** van **1 Trái · 2 Giữa · 3 Phải**, rồi **Mở van cân bằng**.

| Van | Trái (tro/mực) | Giữa | Phải |
| --- | -------------- | ---- | ---- |
| 1   | 3/4            | 6/1  | 5/1  |
| 2   | 2/5            | 2/1  | 6/3  |
| 3   | 3/6            | 1/5  | 4/4  |

- Manh mối: bảng van yêu cầu tổng tro bằng tổng mực.
- **Vì sao:** 3 + 2 + 4 = 9 tro; 4 + 1 + 4 = 9 mực. Các độ lệch là {−1, 5, 4}, {−3, 1, 3}, {−3, −4, 0}; chỉ −1 + 1 + 0 bằng 0.
- Kết quả: `ch7_shade_awake`, Bóng Nguyên Sơ xuất hiện.

## Phụ · La Bàn Thủy Thủ Mù

**Ở đâu:** Bến Thuyền Mắc Cạn (`map_ch7_stranded_fleet`).

**Đáp án:** nhặt đủ ba mảnh ở ba thuyền rồi tương tác điểm đặt trên thuyền buồm nâu.

- **Vì sao:** hồi đáp C05, thuyền trưởng lái buồm nâu. Điểm đặt yêu cầu đủ `compass_shard_1/2/3` trong túi.
- Dùng hết ba mảnh, đặt `calibrated_blind_compass`, thưởng hai `void_nectar_flask`.

## Quái & Elite Trên Bản Đồ

- **Vỏ Rỗng:** đứng yên làm nó hóa đá, chém lúc đó gây ×2; tránh đứng lì quá 2 giây vì lực hút.
- **Kẻ Ăn Tên:** tận dụng lúc nghẹn và chữ nổ làm hại quái quanh nó; bị trúng mất Đòn Thời Gian tạm thời.
- **Đàn Bướm Xóa:** lăn Shift để phủi hiệu ứng mất HP theo thời gian.
- **Chó Mực:** tránh vệt mực làm chậm, chờ pha có thể đánh thay vì đuổi theo bóng.
- **Thẩm Phán Hư Không** (`map_ch7_void_fissure_pass`): elite 900 HP đánh trên bản đồ. Ba vòng xích báo trước 900 ms, nhịp 4,2 giây; chạy vào **giao cả ba vòng**, không chạy ra ngoài như mưa tên. Thắng để mở đường tới Kuro.

## Boss · Kẻ Khóc Không Tên

**Ở đâu:** Hành Lang Than Khóc (`map_ch7_weeper_crossing`), 1.300 HP.

- Mỗi lượt boss thêm một giọt vào bể; đỡ đúng nhịp lau một giọt. Đủ 5 giọt thì lũ gây sát thương 40% theo luật bể rồi bể về 0; giữ máu trước khi bể đầy.
- Vòng đỡ 820 ms, cửa sổ 230 ms, hệ số sát thương khi đỡ 0,5. Xen kẽ Đòn Thời Gian và hồi HP/MP, hạ boss bình thường.
- Dữ liệu không có pha chọn khuôn mặt của bản cũ. Sau thắng, khe vào C11 mở.

## Boss · Kuro & Hai Kết Thúc

**Ở đâu:** Hồ Lặng Trái Tim Hư Không (`map_ch7_ink_lake_throne`), 1.600 HP.

- Đỡ theo vòng 800 ms, cửa sổ 220 ms; có 30% cơ hội đòn giả, cần quan sát nhịp thật.
- Cứ ba lượt, xúc tu khóa Tấn Công hoặc Vật Phẩm trong hai lượt. Dùng **Đòn Thời Gian** phá khóa, tạo lợi thế cho đòn kế tiếp.

**Nhánh ôm / hòa giải:**

1. Giải C03, giữ `kuro_mother_brooch` trong túi.
2. Hoàn thành C09 để có `ch7_mother_song_remembered`; chỉ nghe bài ru (`ch7_lullaby_heard`) chưa đủ.
3. Hạ Kuro **dưới 40% HP** (dưới 640), tránh đánh vượt thẳng mốc kết trận 10%.
4. Chọn **GỌI TÊN THẬT CỦA KURO** (phím 6). Finisher đặt `ch7_kuro_embraced`; victoryDialogueRules chọn `ch7_kuro_fight_end_embraced`.
5. Đi hết thoại: bà Mai ôm Kuro; đặt `ch7_kuro_redeemed` và `kuro_with_peter`.

**Nhánh lạnh:** đánh tới mốc kết trận 10% HP (160), không dùng finisher. Thoại `ch7_kuro_fight_end → ch7_kuro_cold`: Kuro đi cùng nhưng không có cảnh ôm và không đặt `ch7_kuro_redeemed`.
Cả hai đều đặt `pacified_void_kuro`. Có đủ vật và cờ vẫn có thể nhận nhánh lạnh nếu chỉ đánh tới mốc kết trận.

## Boss Ẩn · Bóng Nguyên Sơ

**Ở đâu:** Lõi Tro Thủy Tinh sau C13, 1.500 HP.

- **Tím thật, vàng giả**. Vòng giả đến sớm 320 ms; bỏ qua vàng, đỡ theo tím.
- Vòng thật 950 ms, cửa sổ 210 ms, hệ số khi đỡ 0,4. Học nhịp rồi tấn công xen kẽ hồi phục.
- Thắng nhận `unwritten_cradle_clasp`, đặt `defeated_primordial_shade`.

## Khác Biệt & Điểm Cần Kiểm Tra

- §18.7 ghi 17 map chính + 3 ẩn (=20); dữ liệu hiện có **19 map**, gồm ba map ẩn mộ thợ, hầm chuông trắng, lõi tro. Dùng mapId thực tế ở trên.
- “Hầm Chuông Trắng” vẫn tồn tại cho C12 lá thư; C09 đã đổi thành mê cung. Không giải câu đố chuông ở §1–§17 cũ.
- C11 theo vị trí đá thật cho thứ tự Kim Cương–Đồng–Hư Vô–Thép, không theo số thứ tự độ cứng bản cũ.
- Boss trong dữ liệu bắt đầu không có khiên (`startsUnshielded`); không chờ các pha chưa có trong dữ liệu.
- Nếu giải đúng mà cổng/hình chưa cập nhật, ghi lỗi để Claude sửa; xem thêm MAP_LINT_REPORT.md, không đổi đáp án theo hình còn cũ.
