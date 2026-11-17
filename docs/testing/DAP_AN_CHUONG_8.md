# Đáp Án & Lí Giải Câu Đố — Chương 8

Tài liệu dành cho người test, tiết lộ toàn bộ đáp án. Dùng **Chọn chương → 8** để bắt đầu ở cấp 27, mang Kiếm Cắt Hư Vô và Móc Khóa Chiếc Nôi. Trần cấp chương là 29.

Nguồn đối chiếu là `maps.json`, `dialogue.json`, `enemies.json`, cùng vật phẩm và nhiệm vụ thực tế. **CHAPTER_08_DESIGN.md §18 thay thế các mô tả cũ** về C05, C07, phòng tuyến và boss. Tọa độ dưới đây tính theo ô tile, không phải pixel.

## C01 · Hai Cọc Neo Đầu Tiên

**Ở đâu:** Bãi Đáp Khe Nứt (`map_ch8_null_rift_landing`).

**Đáp án:** cọc kênh nước `ch8_a1` = **Khánh Hòa**, cọc khe nứt `ch8_a2` = **Thành Phố Beta**.

- Kuro giải thích mỗi cọc chỉ giữ một khúc đất. Quan sát kênh nước đầu và khe nứt ở khúc sau, cùng dấu vết hai thế giới.
- **Vì sao:** cầu gỗ Khánh Hòa bắc được qua kênh đầu; sàn/cầu sắt Beta bắc được qua khe sau. Phải chọn riêng cho từng cọc.
- Xoay cọc đầu, qua cầu gỗ, xoay cọc sau, qua cầu sắt tới bờ đông. Vùng đến bờ đặt `ch8_anchor_learned` và hoàn thành nhiệm vụ đầu chương.

## C02 · Bức Vẽ Phấn Của Na

**Ở đâu:** Bờ Biển Thép (`map_ch8_steel_tide_shore`).

**Đáp án:** **cọc 1 Khánh Hòa · cọc 2 Beta · cọc 3 Khánh Hòa**.

- Xem bức vẽ phấn của Na: hải đăng, đường ray, lạch nước. Na giải thích đã vẽ đường sắt vì lời hứa làm xe lửa của Ivo.
- Cô Ba cần lạch nước và đèn dẫn đường để đưa thuyền ra biển.
- **Vì sao:** hải đăng thuộc Khánh Hòa, đường ray thuộc Beta, lạch nước thuộc Khánh Hòa. Chọn một thế giới cho cả ba vùng sẽ thiếu ít nhất một điều kiện.
- Bộ đúng tự mở thoại `ch8_c02_right`, đặt `solved_na_chalk_shore` và mở lối sang chợ.
- Nhặt giấy đỏ ở (5,16) cho nhiệm vụ con hạc.

## C03 · Bánh Răng Của Ivo

**Ở đâu:** Chợ Bánh Răng (`map_ch8_gear_market`).

**Đáp án:** **bánh giữa 16 răng · bánh ra 24 răng**.

- Nói chuyện với Ivo để nhận sổ tay và số đo: bánh vào có 12 răng; tổng răng hai bánh kề lần lượt là 28 và 40; bánh ra phải quay chậm bằng nửa bánh vào. Sổ tay ở (9,9) nhắc lại các số đo này.
- **Vì sao:** 28 − 12 = 16, rồi 40 − 16 = 24. Tỉ số 12/24 = 1/2. Ba bánh nối tiếp làm bánh ra quay cùng chiều bánh vào.
- Xoay `ch8_gear_mid` tới 16, `ch8_gear_out` tới 24. Bộ đúng tự mở thoại, đặt `solved_ivo_gears`; Ivo gia nhập.
- Đi tiếp phần thoại về két để nhận **Món Nợ Của Ivo**.

## C04 · Chuỗi Nhân Quả Cờ Rách

**Ở đâu:** Quảng Trường Cờ Rách (`map_ch8_ragged_forum`).

**Đáp án:** **D → A → C → B**.

| Ký hiệu | Sự kiện          |
| ------- | ---------------- |
| D       | Hoàng đế ra lệnh |
| A       | Trống trận vang  |
| C       | Cờ đỏ rách       |
| B       | Cổng thành mở    |

- Hai bia mực đen nói không có lệnh thì không có trống, và cờ rách sau trống nhưng trước cổng mở.
- Cờ mực vàng nói cổng mở rồi Hoàng đế mới ra lệnh. Lyra nhắc chữ của Đế Chế luôn nói ngược.
- **Vì sao:** bia đen ép D < A < C < B. Đọc ngược câu vàng cho D < B, khớp cùng thứ tự.
- Đặt bốn vòng cờ theo bảng. `solved_ragged_causality` mở cổng đông; Lyra thay Ivo đi cùng.
- Nhặt giấy xanh ở (26,16).

## C05 · Hai Ca Gác

**Ở đâu:** Doanh Trại Hai Thời (`map_ch8_twin_era_barracks`).

**Đáp án theo thao tác:**

1. Đặt **cọc 1 = Chiến hào**, qua cầu ván sang vùng 2.
2. Đặt **cọc 2 = Sol-Karis**, tạo bậc đá về vùng 3.
3. Tại ban công (18,7), chọn **Nhờ Kuro xoay Cọc Neo 3**. Kuro đặt cọc 3 sang **Chiến hào**, mở bước vào vùng 3.
4. Đi vào vùng 3 rồi tới **cọc thật ở (25,6)**, xoay sang **Sol-Karis** để mở cổng.
5. Tiến về cổng đông, vào vùng hoàn thành để đặt `solved_twin_watch`.

- Lyra nhắc lính chiến hào biết đường ván, lê dương biết bậc đá. Cọc 3 ảnh hưởng cả bước vào lẫn cổng ra.
- **Vì sao:** trạng thái cho phép vào vùng 3 khác trạng thái mở lối ra. Cần Kuro giúp từ xa trước, rồi tự xoay cọc từ bên trong.
- Theo §18, Kuro là một điểm hội thoại riêng, không phải vòng xoay thứ hai dùng chung ID với cọc thật.
- Muốn vào kho ẩn C11, nhờ Lyra phá chướng ngại phía nam khi cô còn đi cùng. La bàn đã sửa ở chương 7 cho thêm lời gợi ý về lối này.

## C06 · Những Cái Tên Đang Trôi

**Ở đâu:** Thư Viện Bậc Tro (`map_ch8_ash_stair_library`).

**Đáp án:** bệ một **[N][U]**, rồi bệ hai **[E][A]**.

- Nói chuyện với Neris để cô gia nhập và dịch hai bia chữ cổ.
- Bia một yêu cầu giữ những cái tên đang chảy đứng yên. Bia hai yêu cầu thắp trang giấy đã tắt.
- **Vì sao:** ngữ pháp `[thứ][trạng thái]` cho Tên + Tĩnh, rồi Vật + Sáng.
- Bệ một đặt `ch8_names_still`; bệ hai cần cờ ấy và đặt `solved_flowing_names`, mở Hầm Gương.
- [N][X] mang nghĩa xóa tên. Theo §18, khi xoay vòng ô hai từ đầu về [X], người chơi đi qua [U] và có thể tự giải trước khi tới lựa chọn sai đó.
- Nhặt giấy vàng ở (22,18).

## C07 · Gương Hai Cõi

**Ở đâu:** Hầm Gương Hai Cõi (`map_ch8_mirror_ossuary`).

**Đáp án đúng bản build:** **cọc 1 = Thượng Giới · cọc 2 = Cõi Linh Hồn**.

- Neris nói Thượng Giới có lăng kính nhuộm xanh, cõi linh hồn có gương bạc. Chữ khắc yêu cầu ánh sáng xanh **trước khi rẽ**.
- **Vì sao:** cọc đầu chọn lăng kính để nhuộm xanh tia đi ngang. Cọc sau chọn gương bạc để bẻ tia xuống ổ khóa. Cả hai cùng một thế giới đều sai.
- Giá trị kỹ thuật là `ch8_c07_a1_none` và `ch8_c07_a2_backslash`. Ở câu này, `none` là lựa chọn Thượng Giới hợp lệ, không phải chưa chọn.
- Tia đúng tự đặt `solved_twin_mirrors` và mở cửa bắc. Đây là đáp án §18, thay đáp án ngược ở §6 cũ.
- Gặp Elion ở (5,16) để nhận nhiệm vụ trang sử. Elite Kẻ Gác Kim Giây ở cùng map được hướng dẫn bên dưới.

## C08 · Ghép Mép Trang Xé

**Ở đâu:** Thánh Điện Trang Xé (`map_ch8_torn_page_sanctum`).

**Đáp án:** khe trái **A xuôi**, khe giữa **B xuôi**, khe phải **C xuôi**.

| Dải | Mép trái từ trên xuống | Mép phải từ trên xuống | Chữ                  |
| --- | ---------------------- | ---------------------- | -------------------- |
| A   | lõm–lồi–lồi            | lồi–lõm–lồi            | NGƯỜI CÓ TÊN         |
| B   | lõm–lồi–lõm            | lõm–lõm–lồi            | Ở TRANG NÀY          |
| C   | lồi–lồi–lõm            | lồi–lồi–lồi            | ĐÃ TỰ XÓA ĐỂ GIỮ CỬA |

- Nhặt các dải ở (4,10), (11,11), (17,12), đọc mép giấy và luật khắc dưới bệ.
- **Vì sao:** mép phải A khớp mép trái B, mép phải B khớp mép trái C theo lồi gặp lõm. Cả trang phải đọc xuôi được.
- C–B–A lộn ngược cũng khớp mép nhưng không đọc được chữ, nên bị loại theo §18.
- Sau khi ghép, đi **hết chuỗi thoại** của Kẻ Bị Quên Đầu Tiên. `solved_torn_page` chỉ đánh dấu ghép trang; lối đông cần `ch8_learned_torn_page`, được đặt ở phần kể sau đó.

## C09 · Phòng Tuyến Bốn Cửa

**Ở đâu:** Quảng Trường Hội Tụ (`map_ch8_convergence_plaza`).

**Đáp án:** **Bắc Ivo · Đông Lyra · Nam Neris · Tây Người lính chiến hào**.

| Cửa  | Kuro trinh sát thấy                | Người phù hợp và lí do          |
| ---- | ---------------------------------- | ------------------------------- |
| Bắc  | Người máy lộ lõi hơi nước sau lưng | Ivo biết tháo máy               |
| Đông | Hàng lính khiên không thể lách qua | Lyra phá bức tường người        |
| Nam  | Bóng mực đọc rồi xóa tên           | Neris giữ tên người khác        |
| Tây  | Hồn lính đánh theo hiệu kèn cũ     | Aldric hoặc Bran thuộc hiệu kèn |

- Chọn giá trị **Người lính chiến hào** ở vòng Tây. Nhân vật đứng đó là Bran nếu đã tưởng niệm anh ở chương 4, còn lại là Aldric.
- Bộ đúng đặt `solved_four_gates` và bắt đầu đợt một.
- **Đợt 1:** ba Kẻ Đồng Hóa. Đổi động tác để tránh bị bắt bài.
- **Đợt 2:** hai Lính Hai Đời và một Bóng Lệch Pha. Vòng ra sau khiên hoặc dùng Đòn Thời Gian; canh lúc bóng hiện đặc.
- **Đợt 3:** một Chuông Báo Tận và hai Kẻ Đồng Hóa. Ưu tiên ngắt chuông sau tiếng đầu, giữ khả năng lướt né sóng.
- Hạ hết từng đợt rồi đóng thoại chuyển đợt. Đợt ba hoàn tất đặt `held_last_line`, mở cổng bắc lên tháp.
- Theo §18, bản build dùng ba nhóm quái, chưa có thanh sức giữ từng cổng. Không cần chờ hay tìm một thanh sức giữ để giải câu này.

## C10 · Sáu Ổ Ấn

**Ở đâu:** Chân Tháp Neo (`map_ch8_anchor_tower_base`).

**Đáp án theo chiều kim đồng hồ từ ổ 12 giờ:**

| Ổ      | Câu khắc nhận diện                                      | Ấn          |
| ------ | ------------------------------------------------------- | ----------- |
| 12 giờ | “Trang trống ấy là ngươi, Peter.” — Kẻ Bị Quên Đầu Tiên | Origin      |
| 2 giờ  | Con dốc lên Ngọn Hải Đăng Sương Mù đã thông             | Continuum   |
| 4 giờ  | Lyra nói nhân quả bị bẻ cong làm máy chập mạch          | Causality   |
| 6 giờ  | Peter không để ai lấy mất tên, trước cổng lăng mộ       | Memory      |
| 8 giờ  | Trưởng Lão nói điểm kết thúc làm ý nghĩa bắt đầu        | Finality    |
| 10 giờ | Kuro nói cùng một nơi, hai số phận                      | Possibility |

- **Vì sao:** nối mỗi câu thoại với chương/quyền năng đã trải qua. Câu của Kẻ Bị Quên Đầu Tiên thuộc Origin, dù được nghe ở chương 8.
- Đặt đúng cả sáu để có `solved_six_sockets`, mở cầu thang. Chọn chương 8 đã cấp sẵn các mảnh ấn cần cho mạch truyện.

## C11 · Ẩn: Khóa Binh Thư

**Ở đâu:** Kho Binh Thư Hai Triều (`map_ch8_hidden_war_archive`), xuống từ chướng ngại phía nam Doanh Trại Hai Thời sau khi nhờ Lyra phá.

**Đáp án:** **2 – 4 – 9**.

- Bản khắc yêu cầu tổng bằng 15, số giữa gấp đôi số đầu, số cuối là số lẻ lớn nhất có thể.
- **Vì sao:** gọi số đầu là a, cuối là c thì 3a + c = 15. Chọn c = 9 cho a = 2, giữa = 4; cả ba đều là chữ số hợp lệ.
- Ba vòng tương ứng `n2`, `n4`, `n9`. Thưởng **Kích Tiền Phong Của Lyra** (`lyra_vanguard_halberd`).

## C12 · Ẩn: Cân Sổ Kuro

**Ở đâu:** Két Sổ Cái Trống (`map_ch8_blank_ledger_vault`), lối xuống ở Chợ Bánh Răng. Mang `kuro_ledger` từ chương 5 và tương tác điểm két để Kuro mở lối.

**Đáp án:** **Peter**.

| Người | Được nhận trừ phần nợ | Số dư |
| ----- | --------------------- | ----- |
| Peter | 3 − 3                 | 0     |
| Kuro  | −3 + 1 + 4            | +2    |
| Na    | 3 − 1                 | +2    |
| Ivo   | −4                    | −4    |

- Sổ ghi Kuro nợ Peter 3, Peter nợ Na 3, Na nợ Kuro 1, Ivo nợ Kuro 4.
- **Vì sao:** câu khắc được giải bằng số dư ròng bằng 0. Peter là người duy nhất có tổng nhận và nợ cân nhau.
- Vòng tên chọn Peter đặt `solved_kuro_ledger`, nhận bí mật `world_secret_unwritten_ledger`. Quay về báo Ivo ở quảng trường để hoàn tất nhiệm vụ phụ.

## C13 · Ẩn: Sáu Cột Ấn

**Ở đâu:** Sảnh Vọng Sáu Ấn (`map_ch8_sixfold_echo_hall`). Tại Ruột Tháp Bánh Răng, tương tác cửa bánh răng ở (21,18) để mở lối phía đông.

**Đáp án:** **Continuum → Causality → Memory → Finality → Possibility → Origin**.

- Mỗi cột mang tên một ấn. Lời gợi ý yêu cầu đúng thứ tự Peter đã khôi phục các ấn trong hành trình.
- **Vì sao:** chính là thứ tự chương 1 đến chương 6; phần Origin tiếp tục được hoàn thiện trong các chương sau.
- Chạm cột sai thứ tự làm tắt cả bộ, rồi đi lại từ Continuum. Sáu cột đúng đặt `solved_six_pillars` và cho boss ẩn xuất hiện.

## Đường Qua Ruột Tháp

Tại `map_ch8_anchor_tower_gears`, chọn **cọc vết nứt = Khánh Hòa** để bắc cầu tàu qua hàng dưới, rồi **cọc tường bánh răng = Beta** để mở thang máy ở hàng trên. Kuro gợi ý đúng hai vật thể này. Lối bắc dẫn tới Sứ Giả; cửa bánh răng phía đông dẫn tới C13.

## Quái Thường & Elite

- **Kẻ Đồng Hóa:** nhớ động tác gần nhất. Lặp chém hoặc Đòn Thời Gian sẽ bị phản đòn, lặp lướt khiến nó đuổi theo. Xen kẽ các động tác, quan sát tư thế nó vừa học.
- **Bóng Lệch Pha:** ở trạng thái nhấp nháy thông thường, hiện đặc 1,5 giây trong chu kỳ 3 giây. Đánh thường lúc hiện đặc, dùng khoảng mờ để đổi vị trí. Ở doanh trại, trạng thái còn chịu tác động cọc neo của vùng đó.
- **Chuông Báo Tận:** ba tiếng cách nhau 1,2 giây; tiếng thứ ba phát sóng lan. Chém **sau tiếng thứ nhất, trước tiếng thứ hai** để làm nứt chuông, gây sát thương lớn và ngắt chu kỳ 2,2 giây. Lướt Shift xuyên sóng đúng nhịp khi cần.
- **Lính Hai Đời:** khiên trước che góc 120°. Vòng ra sau hoặc dùng Đòn Thời Gian. Khi đồng đội theo hồi ở đủ gần, khiên quay đi theo nhịp, cho Peter cửa sổ tấn công khoảng 2 giây mỗi chu kỳ 4 giây.

### Elite · Kẻ Gác Kim Giây

**Ở đâu:** Hầm Gương Hai Cõi, 1.100 HP, đánh trực tiếp trên bản đồ.

- Kim dài quét một vòng trong 8 giây; tránh đứng trong đường quét, dùng lướt để vượt khi cần.
- Canh dấu nhịp sáng và chém trong cửa sổ khoảng 420 ms đầu mỗi nhịp một giây. Chém ngoài nhịp bị từ chối.
- Ba nhát đúng liên tiếp làm kim dừng 3 giây. Tận dụng lúc ấy để đổi vị trí và tiếp tục đánh, giữ HP/MP bằng vật phẩm khi cần.
- Thắng đặt `defeated_second_hand_warden`, thưởng một `void_nectar_flask`. Cửa sang Thánh Điện Trang Xé mở bằng C07.

## Boss · Pháp Quan Hội Tụ

**Ở đâu:** Cầu Phán Quyết (`map_ch8_verdict_bridge`), 1.700 HP.

- Mỗi lượt có **ba vòng đỡ**. Nhịp được chọn từ 650/850/1.050 ms; lượt chẵn phát lại chuỗi lượt trước theo thứ tự ngược.
- Ghi nhớ nhanh chuỗi vừa thấy để đỡ lượt đọc ngược. Chẳng hạn ngắn–vừa–dài sẽ thành dài–vừa–ngắn.
- Đỡ trọn ba vòng khiến Lyra đánh, lấy **12% HP còn lại** của boss. Theo §18, đây là sát thương hỗ trợ, không phải một lượt stun phải chờ.
- Peter dùng vật phẩm hồi phục thì đòn kế tiếp của Pháp Quan nặng thêm 30%. Hồi sớm khi còn đủ máu chịu đòn tăng nặng, rồi ưu tiên đỡ trọn chuỗi.
- Xen kẽ tấn công, Đòn Thời Gian và hồi phục cho tới khi boss hết HP. Thắng mở đường bắc tới thư viện.

## Boss · Sứ Giả Giờ Số Không

**Ở đâu:** Tim Đồng Hồ Số Không (`map_ch8_null_clock_heart`), **1.900 HP** theo bản cân bằng §18.

- Kim bắt đầu ở **18**, tiến 1 mỗi lượt và thêm 1 cho mỗi vòng đỡ trượt. Chạm 25 gây **40% HP tối đa**, rồi về 18. Riêng đòn Giờ Số Không giữ Peter lại ít nhất 1 HP; cần giữ đủ máu cho đòn đánh thường cùng lượt.
- Gọi **Ivo, Lyra, Neris**, mỗi người một lần, mỗi lần đẩy kim lùi 2, thấp nhất về 18. Chọn lệnh theo nhãn hiện ở nhóm phím 6–8. Kuro **tự giữ kim một lần** khi nó sắp chạm 25.
- Pha đầu có hai vòng đỡ. Khi boss còn 50% HP trở xuống, tăng thành ba vòng và xen một vòng ẩn; canh gợn sóng thay cho vòng sáng ở nhịp đó.
- Hạ boss tới **15% HP trở xuống**, tức **285 HP hoặc ít hơn**. Giữ `origin_seal_half` trong túi.
- Chọn **NEO KIM Ở 11:59** khi lệnh xuất hiện, thường ở phím 6. Boss **chỉ được kết liễu bằng lệnh này**. Đòn thường và kỹ năng giữ boss lại ở 1 HP nếu chưa thực hiện finisher.
- Finisher đặt `ch8_anchored_1159`, sau đó thắng trận, nhận **Kiếm La Bàn Hội Tụ** và mở đường lên đỉnh tháp.

## Boss Ẩn · Tàn Ảnh Sáu Ấn

**Ở đâu:** Sảnh Vọng Sáu Ấn, sau C13, **1.800 HP**.

| HP boss       | Cơ chế vòng đỡ của pha                              |
| ------------- | --------------------------------------------------- |
| Trên 1.500    | Continuum — ba nhịp                                 |
| 1.201–1.500   | Causality — vòng mồi vàng đến sớm, đỡ vòng tím thật |
| 901–1.200     | Memory — vòng ẩn, theo gợn sóng                     |
| 601–900       | Finality — ba nhịp, cửa sổ đỡ hẹp dần               |
| 301–600       | Possibility — có vòng giả lao tới rồi rút           |
| 300 trở xuống | Origin — bốn nhịp, cửa sổ hẹp dần                   |

- Các nhịp cơ sở dài 900 ms. Quan sát thông báo pha khi HP qua ngưỡng, đổi cách canh thay vì giữ nhịp của pha trước.
- Giữ máu và MP trước các ngưỡng chuyển pha. Tấn công xen kẽ hồi phục, đặc biệt trước pha cuối có bốn nhịp.
- Hạ về 0 HP để thắng và nhận **Bùa Sáu Giờ** (`sixfold_hour_charm`). Các pha hiện tại theo §18 là các kiểu vòng đỡ, thay bộ purge/bài hát/bể nước mắt ở thiết kế cũ.

## Phụ · Con Hạc Cuối Của Na

1. Nói hết thoại Na ở Bờ Biển Thép để nhận `quest_ch8_na_last_crane`.
2. Nhặt **giấy đỏ** tại Bờ Biển Thép (5,16), **giấy xanh** tại Quảng Trường Cờ Rách (26,16), **giấy vàng** tại Thư Viện Bậc Tro (22,18).
3. Khi còn đủ cả ba trong túi, nói chuyện Na tại Bờ Biển Thép hoặc tại (12,7) ở Quảng Trường Hội Tụ.
4. Thoại `ch8_na_give` lấy ba tờ giấy, đặt `gave_na_papers`, trao **Hạc Giấy Ba Màu** (`na_last_crane`, bùa +50 max HP, +7 defense).

**Vì sao:** Na cần đúng ba màu để gấp con hạc cuối. Ở cảnh kết trên đỉnh tháp, con hạc chỉ xuất hiện nếu đã đưa giấy, không chỉ nhặt đủ. Bùa hiện tại tăng chỉ số như trên.

## Phụ · Món Nợ Của Ivo

1. Sau C03, đi hết thoại `ch8_ivo_ledger` để nhận `quest_ch8_ivo_debt`.
2. Mang **Sổ Cái Kuro** (`kuro_ledger`, có từ chương 5; chọn chương 8 đã cấp sẵn), tới điểm két ở Chợ Bánh Răng (23,15). Kuro mở đường xuống Két Sổ Cái Trống.
3. Giải **C12 = Peter**, nhận `world_secret_unwritten_ledger` và cờ `solved_kuro_ledger`.
4. Gặp lại Ivo tại cửa bắc Quảng Trường Hội Tụ (16,4), đi hết đoạn báo lại món nợ để đặt **`settled_ivo_debt`**.

**Vì sao:** mở két chỉ xong mục đầu. Báo lại cho Ivo mới hoàn tất cả nhiệm vụ.

## Phụ · Chương Cuối Của Elion

1. Gặp Elion tại Hầm Gương Hai Cõi (5,16), nhận `elion_final_page` và `quest_ch8_elion_last_chapter`.
2. Mang trang giấy tới **Mira ở Chân Tháp Neo (4,15)**, nói chuyện để cô đọc.
3. Thoại lấy trang giấy, đặt `delivered_elion_page` và trao bí mật **`world_secret_elion_last_page`**.

**Vì sao:** Elion muốn trang cuối được đọc tại nơi thế giới còn đứng vững. Mira tại chân tháp là người nhận, không cần tìm Elion lần nữa trên đỉnh tháp.

## Kiểm Tra Cảnh Kết

Lên Đỉnh Tháp (`map_ch8_tower_crown`) sau finisher Sứ Giả. Câu khi tới tháp đổi theo `ch7_kuro_embraced`; con hạc đổi theo `gave_na_papers`. Đi hết chuỗi hồi tưởng và Chronos xuất hiện để đặt **`ch8_chronos_returned`**, `witnessed_ch8_cliffhanger`, rồi hiện màn kết chương 8.
