# CHRONO – Bản Mở Rộng Thiết Kế Chương 5: Khu Vườn Của Những Khả Năng Vô Tận

**Tài liệu:** Thiết Kế Mở Rộng Hệ Thống Câu Đố & Tuyến Truyện Phụ Chương 5  
**Phân hệ:** Narrative & Gameplay Expansion Specification: Chapter 5  
**Chủ đề trung tâm:** Khả năng không được chọn, cái giá của ký ức, và sự va chạm giữa các thực tại  
**Tài liệu tham chiếu:** `docs/story/CHAPTER_05_DESIGN.md` (§1–§14), `scripts/content-ch5.mjs`, `CANON_AND_OPEN_QUESTIONS.md` (OQ-01, OQ-02, OQ-04), `CHAPTER_04_DESIGN.md` §13  
**Tác giả:** Antigravity (Implementation Agent)  
**Trạng thái:** Đề xuất hoàn chỉnh — Chờ Claude review và Owner phê duyệt

---

## 1. Tổng Quan Bản Mở Rộng

### 1.1. Mục tiêu mở rộng

Chương 5 nguyên bản sở hữu một tiền đề cảm xúc rất mạnh mẽ: sự đồng hành và rạn nứt dần dần giữa Peter và Kuro trong chiều không gian **The Interval**, đối diện với nhánh Alpha (cuộc đời bình yên bị chối bỏ của Peter) và nhánh Beta (thành phố đồng hồ sụp đổ). Tuy nhiên, để xứng tầm với một chương bản lề trước khi bước vào cõi Thần linh (_The Celestial Realm_), Chương 5 cần một hệ sinh thái câu đố đa dạng, phong phú về phương thức tư duy logic, không lặp lại bất kỳ cơ chế nào của các chương trước.

Bản mở rộng bổ sung:

- **8 câu đố mới hoàn toàn (EX-01 đến EX-08)**, rải đều qua 4 Hồi, với độ khó leo thang từ 3 phút đến 12 phút giải.
- **3 nhiệm vụ phụ chuyên sâu** khắc họa sâu sắc bi kịch của bé Na (con gái Peter-Alpha), vị thế bi thương của Người Làm Vườn (The Gardener), và nỗi ân hận trăm năm của Kỹ sư Ivo.
- **3 bản đồ mới** mở rộng không gian khám phá, tận dụng tối đa cơ chế tương tác giữa Nhánh Sống và Nhánh Tỉa.

### 1.2. Sơ đồ phân bổ 4 Hồi & Vị trí các câu đố mới

```
[HỒI 1: VƯỜN CỦA KURO]
  ├─ map_ch5_interval_shore (Bờ Vực)
  ├─ map_ch5_seed_garden (Vườn Hạt) ──▶ [EX-01: Khối Đá & Bóng Đổ Ngược Chiều]
  └─ [MỚI] map_ch5_glass_greenhouse (Nhà Kính Ký Ức) ──▶ [EX-02: Hộp Thời Tiết Của Người Làm Vườn]
       └─ Nhiệm vụ phụ: [Khúc Ca Của Người Cắt Tỉa]

[HỒI 2: NHÁNH ALPHA — CUỘC ĐỜI BỎ DỞ]
  ├─ map_ch5_alpha_town (Khánh Hòa Ở Lại)
  ├─ [MỚI] map_ch5_alpha_harbor (Bến Thuyền Vắng Lặng) ──▶ [EX-03: Bầu Trời Phấn Của Bé Na]
  │    └─ Nhiệm vụ phụ: [Cánh Hạc Của Na]
  ├─ map_ch5_alpha_clockshop (Tiệm Đồng Hồ — C1 cũ)
  └─ map_ch5_pruner_tower (Vọng Lâu Kẻ Tỉa Cành) ──▶ [EX-04: Ba Nhân Chứng Của Một Cuộc Đời]

[HỒI 3: NHÁNH BETA — THÀNH PHỐ SỤP ĐỔ]
  ├─ map_ch5_beta_city (Thành Phố Thép — C2 cũ)
  ├─ [MỚI] map_ch5_observatory_ruins (Đài Thiên Văn Đảo Ngược) ──▶ [EX-05: Sơ Đồ Sao Lượng Tử]
  ├─ map_ch5_chronos_reactor (Lò Phản Ứng — C3 cũ)
  │    └─ Nhiệm vụ phụ: [Cỗ Máy Dang Dở Của Ivo]
  └─ map_ch5_children_shelter (Hầm Trú Ẩn Trẻ Em) ──▶ [EX-06: Giai Điệu Khái Niệm Bằng Thơ]

[HỒI 4: HƯ KHÔNG & VÙNG XÁM]
  ├─ map_ch5_grey_prune (Vùng Xám Tỉa Bỏ — C5 cũ) ──▶ [EX-07: Đồng Hồ Cát Trọng Lực Ngược]
  ├─ map_ch5_kuro_asks (Nơi Kuro Hỏi Lại — C4 cũ)
  ├─ map_ch5_unborn_throne (Ngai Vua Chưa Sinh) ──▶ [EX-08: Tấm Gương Của Sự Lựa Chọn Cũ]
  └─ map_ch5_collision_shore (Bờ Va Chạm — C6 cũ)
```

---

## 2. Tám Câu Đố Mới (EX-01 đến EX-08)

### Bảng tóm tắt 8 câu đố mới

| Mã        | Tên câu đố                     | Hồi & Bản đồ                | Phương thức suy luận                                 | Thời gian ước tính | Độ khó         |
| :-------- | :----------------------------- | :-------------------------- | :--------------------------------------------------- | :----------------- | :------------- |
| **EX-01** | Khối Đá & Bóng Đổ Ngược Chiều  | Hồi 1 (`seed_garden`)       | Không gian đối xứng + Đổi nhánh mặt trời giả         | 3–4 phút           | Dễ             |
| **EX-02** | Hộp Thời Tiết Người Làm Vườn   | Hồi 1 (`glass_greenhouse`)  | Đối chiếu sinh thái nghịch lý + Cân bằng van áp suất | 5–6 phút           | Trung bình     |
| **EX-03** | Bầu Trời Phấn Của Bé Na        | Hồi 2 (`alpha_harbor`)      | Mật mã vẽ phấn trẻ em + Ghép mảnh nửa bức tranh      | 5–7 phút           | Trung bình     |
| **EX-04** | Ba Nhân Chứng Của Một Cuộc Đời | Hồi 2 (`pruner_tower`)      | Bảng chân lý tâm lý học của 3 nhánh cùng một người   | 7–9 phút           | Khá            |
| **EX-05** | Sơ Đồ Sao Lượng Tử             | Hồi 3 (`observatory_ruins`) | Ghép hai nửa thấu kính quỹ đạo phân nhánh            | 8–10 phút          | Khá            |
| **EX-06** | Giai Điệu Khái Niệm Bằng Thơ   | Hồi 3 (`children_shelter`)  | Giải mã âm luật từ thơ ngữ nghĩa + Bù trừ phím hỏng  | 8–11 phút          | Khó            |
| **EX-07** | Đồng Hồ Cát Trọng Lực Ngược    | Hồi 4 (`grey_prune`)        | Quản lý thời gian thực giữa hai chiều rơi trọng lực  | 9–12 phút          | Rất khó        |
| **EX-08** | Tấm Gương Của Sự Lựa Chọn Cũ   | Hồi 4 (`unborn_throne`)     | Đáp án biến đổi động theo lựa chọn đạo đức đã lưu    | 7–10 phút          | Khó / Triết lý |

---

### Chi tiết từng câu đố

#### EX-01 · Khối Đá Dời Chỗ & Bóng Đổ Ngược Chiều

- **Vị trí:** Phía đông bắc `map_ch5_seed_garden` (Vườn Hạt Khả Năng).
- **Ý nghĩa chủ đề:** Thể hiện trực quan nguyên lý cơ bản nhất của The Interval: _Một hành động ở nhánh này tạo nên vết hằn ở nhánh kia._
- **Đầu vào tương tác:**
  - 1 khối sa thạch vuông có thể đẩy bằng phím tương tác `[E]` ở nhánh Sống.
  - 4 ô bệ đá lõm đánh dấu theo 4 hướng: **Đông**, **Tây**, **Nam**, **Bắc**.
  - 1 tấm bia đá cổ ở giữa sân.
- **Manh mối đối chiếu chéo:**
  1. _Bia đá sân vườn (`ch5x_poi_sun_stele`):_ "Vật thể chỉ mở khóa lối đi khi bóng của nó che khuất dấu tích của thực tại đối nghịch."
  2. _Hiện tượng thị giác Nhánh Sống:_ Mặt trời nhân tạo của Interval nằm ở hướng Đông, bóng của khối đá đổ dài về hướng **Tây**.
  3. _Hiện tượng thị giác Nhánh Tỉa:_ Mặt trời đã tắt, nguồn sáng duy nhất là vết nứt tím ở hướng Bắc, bóng của khối đá (ở nhánh Tỉa) đổ dài về hướng **Nam**.
  4. _Ghi chép của Kuro (`ch5x_kuro_shadow_hint`):_ "Ở nhánh bị tỉa, có một viên ngọc cảm ứng ánh sáng bị giấu dưới lòng đất phía Nam. Nhưng nếu mày đứng ở nhánh tỉa đẩy đá, nó sẽ vỡ vụn vì sa thạch đã mục nát. Phải đẩy từ nhánh sống."
- **Chuỗi suy luận:**
  - Người chơi cần che bóng lên ô cảm ứng ở hướng **Nam** (ở nhánh Tỉa).
  - Vì nguồn sáng nhánh Tỉa nằm ở hướng Bắc, nên muốn bóng đổ về hướng Nam, khối đá phải được đặt tại bệ trung tâm hoặc phía **Bắc**.
  - Nhưng cơ cấu đòi hỏi khối sa thạch ở nhánh Sống tạo ra thế chặn. Khi đẩy khối đá ở nhánh Sống vào ô **Bắc**, bóng của nó ở nhánh Tỉa sẽ phủ kín bệ cảm ứng phía **Nam**.
  - Sau khi đẩy đá vào ô Bắc ở nhánh Sống, người chơi chạm Mầm Rẽ Nhánh sang nhánh Tỉa để dòng năng lượng bóng đổ kích hoạt cơ quan.
- **Đáp án duy nhất:** Đẩy khối sa thạch vào ô **Bắc** ở Nhánh Sống, sau đó chuyển sang Nhánh Tỉa để dòng bóng kích hoạt.
- **Sai phạt & phản hồi:** Nếu đẩy vào ô Đông/Tây/Nam, khối đá trượt kêu ken két nhưng cơ cấu không phát sáng; lời thông báo chỉ ghi: _"Bóng của khối đá chưa phủ trúng mạch ngầm rẽ nhánh."_ Người chơi có thể đẩy lại bất kỳ lúc nào.
- **Phần thưởng:** Mở cổng dẫn sang bản đồ mới `map_ch5_glass_greenhouse` (Nhà Kính Ký Ức) + Mảnh ghi chép `interval_astronomy_scrap`.
- **Độ khó & Thời gian:** Dễ · 3–4 phút.

---

#### EX-02 · Hộp Thời Tiết Của Người Làm Vườn

- **Vị trí:** Khu trung tâm `map_ch5_glass_greenhouse` (Nhà Kính Ký Ức).
- **Ý nghĩa chủ đề:** Thảm kịch của việc cố gắng giữ cho một giống loài sống sót trong môi trường nhân tạo phi tự nhiên.
- **Đầu vào tương tác:**
  - Bảng điều khiển vi khí hậu gồm 3 van xoay:
    - **Van 1 (Độ Ẩm):** [Khô cằn / Mưa rào / Sương mù ẩm] (`dial_ch5x_humidity`)
    - **Van 2 (Nhiệt Độ):** [Băng giá / Ôn hòa / Nắng gắt] (`dial_ch5x_temperature`)
    - **Van 3 (Dòng Khí):** [Gió lốc / Tĩnh lặng / Gió thoảng] (`dial_ch5x_airflow`)
  - Cần gạt xác nhận [Bơm Vi Khí Hậu].
- **Manh mối đối chiếu chéo:**
  1. _Mầm hoa héo ở Nhánh Sống (`ch5x_flower_living_poi`):_ Cánh hoa nhợt nhạt, thân mềm oặt úng nước, gốc đất đen sũng: _"Thừa ẩm và gió đọng đang bóp nghẹt gốc rễ, nhưng phiến lá run rẩy vì thiếu hơi ấm."_
  2. _Mẫu hóa thạch hoa ở Nhánh Tỉa (`ch5x_flower_pruned_poi`):_ Thân hoa cứng cáp như kim loại nhưng cánh hoa bị thiêu cháy xám xịt: _"Nhánh này từng chết trong một đợt sóng nhiệt khô khốc, gió lốc xé toạc mọi búp non."_
  3. _Nhật ký Người Làm Vườn — Trang 4 (`gardener_journal_p4`):_ "Loài Nguyệt Thảo chỉ hé nụ khi trời mát mẻ như đêm đầu thu Khánh Hòa: cần màn sương bao phủ để giữ ẩm không làm thối rễ, cần ngọn gió thoảng để phấn hoa không kết tụ, và cần hơi ấm ôn hòa để đánh thức nhựa cây."
- **Chuỗi suy luận:**
  - Cần loại bỏ cực đoan của cả hai nhánh: Nhánh Sống bị thừa nước (Mưa rào) và thiếu nhiệt; Nhánh Tỉa bị nắng gắt và gió lốc.
  - Phân tích nhật ký Người Làm Vườn:
    - Độ ẩm: _"màn sương bao phủ"_ → **Sương mù ẩm**.
    - Nhiệt độ: _"hơi ấm ôn hòa"_ → **Ôn hòa**.
    - Dòng khí: _"ngọn gió thoảng"_ → **Gió thoảng**.
- **Đáp án duy nhất:** Độ ẩm = **Sương mù ẩm** · Nhiệt độ = **Ôn hòa** · Dòng khí = **Gió thoảng**.
- **Sai phạt & phản hồi:** Lồng kính phun khí xì xì, mầm hoa khẽ co lại; thông báo: _"Khí hậu nhân tạo làm tổn thương mầm hoa mong manh."_ (Peter mất 5 HP do hơi áp suất xì ra).
- **Phần thưởng:** Đóa hoa nở rộ, giải phóng vật phẩm nhiệm vụ `pure_interval_seed` (Hạt Mầm Bất Tận) dùng cho nhiệm vụ phụ Người Làm Vườn.
- **Độ khó & Thời gian:** Trung bình · 5–6 phút.

---

#### EX-03 · Bầu Trời Phấn Của Bé Na

- **Vị trí:** Cầu tàu gỗ tại `map_ch5_alpha_harbor` (Bến Thuyền Vắng Lặng).
- **Ý nghĩa chủ đề:** Ký ức tuổi thơ trong sáng của đứa trẻ tồn tại ở một nhánh thực tại mà Peter chính chưa bao giờ được trải qua.
- **Đầu vào tương tác:**
  - Bức tranh phấn trên nền gỗ cầu tàu hình một bầu trời biển gồm 4 ô tròn bí mật được đánh số I, II, III, IV.
  - Người chơi tương tác để chọn hình vẽ lấp vào từng ô: [Cánh Buồm / Đàn Hải Âu / Ngọn Hải Đăng / Mặt Trời Mỉm Cười].
- **Manh mối đối chiếu chéo:**
  1. _Bức tranh phấn ở Nhánh Sống (`ch5x_chalk_living`):_ Tranh vẽ rõ ràng nhưng bị mất góc dưới bên phải do sóng đánh: _"Ở góc trời cao nhất, Na vẽ một mặt trời biết cười. Phía dưới mặt trời là thứ có thể bay lượn tự do."_
  2. _Bức tranh cào xước ở Nhánh Tỉa (`ch5x_chalk_pruned`):_ Cầu tàu đã sập một nửa, nhưng vách gỗ gãy lại lưu giữ hình vẽ phấn được bảo quản trong bóng râm: _"Gần mặt biển nhất, Na luôn vẽ con thuyền có cánh buồm trắng của bố. Ngay cạnh con thuyền, đứng sừng sững trên mỏm đá là ngọn tháp chiếu sáng trong đêm."_
  3. _Lời tâm sự của Cô Ba nhánh Alpha (`ch5x_coba_harbor_talk`):_ "Con bé Na ngoan lắm, mỗi lần vẽ tranh nó đều bảo: Bầu trời phải bắt đầu từ trên cao nhất xuống mặt biển, từ thứ chiếu sáng cả thế gian đến thứ chỉ đường trong đêm tối, rồi mới tới cánh chim và con thuyền."
- **Chuỗi suy luận:**
  - Thứ tự từ trên cao nhất xuống mặt biển (I → IV):
    - I (Trên cao nhất): _"Mặt trời biết cười"_ (theo tranh Nhánh Sống và lời Cô Ba).
    - II (Dưới mặt trời, bay lượn tự do): _"Đàn hải âu"_ (theo tranh Nhánh Sống).
    - III (Thứ chỉ đường trong đêm tối trên mỏm đá): _"Ngọn hải đăng"_ (theo tranh Nhánh Tỉa và lời Cô Ba).
    - IV (Gần mặt biển nhất): _"Cánh buồm"_ (theo tranh Nhánh Tỉa).
- **Đáp án duy nhất:** I = **Mặt Trời Mỉm Cười** · II = **Đàn Hải Âu** · III = **Ngọn Hải Đăng** · IV = **Cánh Buồm**.
- **Sai phạt & phản hồi:** Nét phấn phát ra tiếng lạo xạo rồi mờ đi; thông báo: _"Bầu trời ký ức của Na chưa đúng trật tự mà cô bé từng mơ ước."_
- **Phần thưởng:** Khoang bí mật dưới cầu tàu bật mở, tìm thấy `na_origami_crane_scrap` (Con Hạc Giấy Thứ 999) bắt đầu nhiệm vụ phụ của bé Na.
- **Độ khó & Thời gian:** Trung bình · 5–7 phút.

---

#### EX-04 · Ba Nhân Chứng Của Một Cuộc Đời

- **Vị trí:** Tầng giữa `map_ch5_pruner_tower` (Vọng Lâu Kẻ Tỉa Cành).
- **Ý nghĩa chủ đề:** Bảng chân lý logic dựa trên ba trạng thái tâm lý của cùng một con người khi bị đẩy vào ba số phận khác nhau.
- **Đầu vào tương tác:**
  - 3 Dư ảnh linh hồn của **Bác Thợ Rèn Bảy** (người từng đúc vỏ đồng hồ cho ông nội Peter) đứng trước 3 cánh cửa đá:
    - **Dư ảnh A (Nhánh Ở Lại — Alpha Sống)**
    - **Dư ảnh B (Nhánh Bị Tỉa — Alpha Tỉa)**
    - **Dư ảnh C (Nhánh Lưu Đày — Interval Vô Định)**
  - Bảng chữ nổi trên bệ đá yêu cầu chỉ định: _"Ai là người giữ chiếc Chìa Khóa Lương Tâm?"_
- **Manh mối đối chiếu chéo:**
  1. _Quy tắc bản chất linh hồn ghi trên bia Vọng Lâu (`ch5x_pruner_stele_logic`):_
     - Kẻ được ở lại bình yên luôn tìm cách tự lừa dối để xoa dịu mặc cảm tội lỗi (Nói dối).
     - Kẻ bị tỉa chết trong oan ức không còn gì để che đậy (Luôn nói thật).
     - Kẻ bị lưu đày trong thù hận chỉ nói điều ngược lại với kẻ bị tỉa.
  2. _Lời khai của 3 Dư ảnh:_
     - Dư ảnh A (Ở Lại): _"Dư ảnh B không giữ chìa khóa, và chính tôi cũng không giữ nó."_
     - Dư ảnh B (Bị Tỉa): _"Dư ảnh C đang giấu chiếc chìa khóa trong ngực áo của lão."_
     - Dư ảnh C (Lưu Đày): _"Lão B nói dối đấy, chiếc chìa khóa nằm trong tay Dư ảnh A."_
- **Chuỗi suy luận logic:**
  - Theo bia đá: **B luôn nói thật**.
  - Lời của B là thật: _"Dư ảnh C đang giấu chiếc chìa khóa trong ngực áo"_ → **Chìa khóa thực sự nằm ở Dư ảnh C**.
  - Kiểm chứng các nhân chứng còn lại:
    - B nói thật → C nói điều ngược lại với B hoặc nói dối: C bảo chìa khóa ở tay A (sai, đúng với việc C nói dối/thù hận).
    - A nói dối: A nói _"chính tôi không giữ"_ (vế này có thể đúng) và _"B không giữ"_ (đúng), nhưng mệnh đề tổng quát bị bóp méo nhằm đổ tội, phù hợp với quy tắc bảng chân lý.
  - Kết luận không thể tranh cãi: Người đang giữ chìa khóa là **Dư ảnh C**.
- **Đáp án duy nhất:** Chọn chỉ định **Dư ảnh C (Nhánh Lưu Đày)**.
- **Sai phạt & phản hồi:** Cả ba dư ảnh tan thành khói xám rồi ngưng tụ lại; thông báo: _"Sự phán xét sai lầm khiến những mảnh linh hồn thêm thống khổ."_
- **Phần thưởng:** Nhận chìa khóa `conscience_iron_key` mở cửa tầng thượng Vọng Lâu dẫn đến mật thất chứa bức thư bí mật của Kẻ Tỉa Cành (`pruner_confession_parchment`).
- **Độ khó & Thời gian:** Khá · 7–9 phút.

---

#### EX-05 · Sơ Đồ Sao Lượng Tử

- **Vị trí:** Mái vòm quan sát tại `map_ch5_observatory_ruins` (Đài Thiên Văn Đảo Ngược).
- **Ý nghĩa chủ đề:** Sự phân nhánh vũ trụ học của Chronos — hai thế giới nhìn lên cùng một bầu trời nhưng thấy hai trật tự sao hoàn toàn khác biệt.
- **Đầu vào tương tác:**
  - Bệ kính thiên văn trung tâm có 2 khe cắm thấu kính khắc chòm sao:
    - Khe Trái: cắm Mảnh Thấu Kính Nhánh Sống (`astronomy_lens_living`).
    - Khe Phải: cắm Mảnh Thấu Kính Nhánh Tỉa (`astronomy_lens_pruned`).
  - 1 vành xoay độ nghiêng góc nhìn (Góc: **30°** / **60°** / **90°** / **120°**).
  - Nút [Chiếu Tiêu Điểm].
- **Manh mối đối chiếu chéo:**
  1. _Bản ghi thiên văn Beta — Trang 1 (`beta_astronomy_log_1` - nhặt tại bàn đọc Nhánh Sống):_ "Khi thế giới còn nguyên vẹn, chòm sao Thiên Xứng nằm ở kinh độ 60°. Nhưng vết nứt Chronos đã bẻ cong ánh sáng đi một góc bằng đúng độ lệch pha thời gian."
  2. _Bản ghi thiên văn Beta — Trang 2 (`beta_astronomy_log_2` - nhặt tại đống đổ nát Nhánh Tỉa):_ "Độ lệch pha giữa nhánh sống và nhánh tỉa đo được tại thời khắc lò phản ứng kích hoạt là chính xác +30°. Tiêu điểm chân thực chỉ hội tụ khi góc nghiêng kính bằng tổng kinh độ nguyên bản và độ lệch pha."
  3. _Gợi ý thị giác qua kính viễn vọng (`ch5x_telescope_preview`):_ Khi xoay góc, hai chùm tia sáng lam và tím chiếu lên bản đồ vòm. Chỉ ở góc hợp lý, hai chùm tia mới giao nhau tại biểu tượng Con Thoi Thời Gian.
- **Chuỗi suy luận:**
  - Kinh độ nguyên bản của chòm sao = 60°.
  - Độ lệch pha thời gian giữa hai nhánh = +30°.
  - Góc nghiêng cần thiết = 60° + 30° = **90°**.
- **Đáp án duy nhất:** Cắm đủ 2 thấu kính vào 2 khe, xoay vành góc nghiêng về **90°**, rồi bấm [Chiếu Tiêu Điểm].
- **Sai phạt & phản hồi:** Tia sáng tán xạ chói lòa làm mờ màn hình trong 2 giây; thông báo: _"Tiêu điểm quang học bị phân kỳ, các vì sao chìm vào khoảng không mù mịt."_
- **Phần thưởng:** Tia sáng chiếu rọi mở hòm tiếp tế của Đài Thiên Văn, nhận charm `quantum_astrolabe_charm` (Thước Đo Lượng Tử: maxMp +22, speed +3).
- **Độ khó & Thời gian:** Khá · 8–10 phút.

---

#### EX-06 · Giai Điệu Khái Niệm Bằng Thơ

- **Vị trí:** Căn phòng góc của `map_ch5_children_shelter` (Hầm Trú Ẩn Trẻ Em).
- **Ý nghĩa chủ đề:** Những đứa trẻ không có đồ chơi kim loại, chúng chơi đàn piano cơ học và học thuộc các bài thơ mang khái niệm âm thanh để quên đi nỗi đói lạnh.
- **Đầu vào tương tác:**
  - Một chiếc đàn dương cầm cơ học bằng đồng thau có 5 phím bấm mang tên 5 chất liệu âm:
    - **[Kim Loại]**
    - **[Gỗ Mục]**
    - **[Thủy Tinh]**
    - **[Gió Hư Không]**
    - **[Nước Chảy]**
  - Cần gạt [Phát Âm Chuỗi].
- **Manh mối đối chiếu chéo:**
  1. _Bài thơ ru khắc trên vách giường tầng (`ch5x_shelter_poem_wall`):_
     _"Gió luồn khe đá buốt đôi mi,_  
     _Nước nhỏ giọt rầu rĩ chuỗi sầu bi._  
     _Búa sắt gõ vang hồi báo tử,_  
     _Kính tan tành mộng vỡ chẳng còn chi."_
  2. _Sổ tay điều âm của Bảo mẫu Mira (`mira_tuning_notes`):_ "Cây đàn ở nhánh Sống đã bị kẹt phím [Kim Loại]. Lũ trẻ đã học được quy tắc hòa âm thay thế: Khi một nốt kim khí bị tắt tiếng, ta dùng nốt [Thủy Tinh] gõ hai lần liên tiếp để mượn âm hưởng ngân vang sắc lạnh tương đương."
  3. _Trạng thái cây đàn:_ Tương tác thử phím [Kim Loại] chỉ nghe tiếng kẹt khô khốc không thành tiếng.
- **Chuỗi suy luận:**
  - Chuỗi nguyên bản theo 4 câu thơ:
    1. Câu 1: _"Gió luồn khe đá"_ → **[Gió Hư Không]**
    2. Câu 2: _"Nước nhỏ giọt"_ → **[Nước Chảy]**
    3. Câu 3: _"Búa sắt gõ vang"_ → [Kim Loại]
    4. Câu 4: _"Kính tan tành"_ → **[Thủy Tinh]**
  - Nhưng phím [Kim Loại] bị kẹt, áp dụng quy tắc hòa âm thay thế từ sổ của Mira: Thay nốt Kim Loại bằng nốt **[Thủy Tinh] gõ 2 lần liên tiếp**.
  - Chuỗi 5 thao tác phím hoàn chỉnh: **[Gió Hư Không]** → **[Nước Chảy]** → **[Thủy Tinh]** → **[Thủy Tinh]** → **[Thủy Tinh]** (nốt thứ 3 và 4 thay cho Kim Loại, nốt thứ 5 là kính vỡ của câu cuối).
- **Đáp án duy nhất:** Gõ đúng chuỗi: **Gió Hư Không** ➔ **Nước Chảy** ➔ **Thủy Tinh** ➔ **Thủy Tinh** ➔ **Thủy Tinh**.
- **Sai phạt & phản hồi:** Đàn phát ra âm thanh chói tai làm lũ trẻ giật mình khẽ rên rỉ; thông báo: _"Âm luật hỗn loạn làm xáo động giấc ngủ mong manh của bầy trẻ."_
- **Phần thưởng:** Nắp đàn bật mở ngăn bí mật, nhận `clockwork_music_cylinder` (Trục Hộp Nhạc Ru Con) và mở khóa đoạn thoại cảm xúc sâu sắc giữa Kuro và Mira.
- **Độ khó & Thời gian:** Khó · 8–11 phút.

---

#### EX-07 · Đồng Hồ Cát Trọng Lực Ngược

- **Vị trí:** Trung tâm vực thẳm `map_ch5_grey_prune` (Vùng Xám Tỉa Bỏ).
- **Ý nghĩa chủ đề:** Thời gian không chỉ chảy xuôi hay chảy ngược; ở ranh giới của sự xóa bỏ, nó là hai dòng chảy xô vào nhau.
- **Đầu vào tương tác:**
  - Một tháp đồng hồ cát khổng lồ 3 khoang (Khoang Trên - Khoang Giữa - Khoang Dưới).
  - Khoang Giữa có 5 vạch đo mức hạt tinh thể (Mức 1 đến Mức 5). Mức kích hoạt chuẩn là **Mức 3**.
  - Mầm Rẽ Nhánh nằm ngay cạnh tháp đồng hồ.
  - Cần gạt [Khóa Cân Bằng Lượng Tử] (`ch5x_hourglass_lock_lever`).
- **Cơ chế vật lý rẽ nhánh:**
  - **Ở Nhánh Sống:** Trọng lực bình thường. Hạt tinh thể từ Khoang Trên chảy xuống Khoang Giữa với tốc độ **1 vạch mỗi 3 giây**.
  - **Ở Nhánh Tỉa:** Trọng lực bị đảo ngược. Hạt tinh thể từ Khoang Dưới bay ngược lên Khoang Giữa với tốc độ **1 vạch mỗi 2 giây**. Nếu quá mức 5, bình sẽ nứt và xả trắng về mức 0.
- **Manh mối đối chiếu chéo:**
  1. _Chỉ dẫn khắc trên bệ đá đồng hồ cát (`ch5x_hourglass_tablet`):_ "Cánh cổng hư không chỉ nhận diện điểm dừng khi dòng chảy xuôi của thực tại còn sống và dòng chảy ngược của thực tại đã chết gặp nhau chính xác tại Điểm Giao Thoa (Vạch 3) và đứng yên trong một nhịp thở."
  2. _Ghi chép của nhà nghiên cứu Vùng Xám (`grey_researcher_notes`):_ "Bắt đầu từ trạng thái cạn kiệt (Vạch 0). Hãy để nhánh sống rót vào trước, sau đó đảo nhánh để lực hút ngược bù trừ, khóa cần gạt ngay khi kim chỉ đúng vạch trung tâm."
- **Chuỗi thao tác thời gian thực:**
  - Bước 1: Gạt van xả để đưa đồng hồ về mức 0 ở Nhánh Sống.
  - Bước 2: Đứng ở Nhánh Sống, đợi cát chảy vào Khoang Giữa. Tốc độ là 3 giây/vạch. Đợi đủ 9 giây để đạt **Vạch 3**.
  - Bước 3: Ngay khi chạm Vạch 3, nếu tiếp tục đứng yên ở Nhánh Sống nó sẽ tràn lên Vạch 4. Người chơi phải **chạm ngay Mầm Rẽ Nhánh** để đổi trạng thái, đồng thời tương tác với cần gạt [Khóa Cân Bằng Lượng Tử] trong cửa sổ 2 giây trước khi trọng lực ngược kéo lệch chỉ số.
  - (Trường hợp căn chỉnh nâng cao: nếu bị lỡ nhịp lên vạch 4, người chơi có thể chuyển nhánh tỉa để hạt bị kéo ngược lại rồi gạt khóa).
- **Đáp án duy nhất:** Đưa mực cát về đúng **Vạch 3** và gạt khóa trong trạng thái cân bằng giữa hai nhánh.
- **Sai phạt & phản hồi:** Hạt cát tinh thể phát nổ thành bụi xám, hất văng Peter lùi lại 3 ô (mất 20 HP), mức cát tụt về 0; thông báo: _"Dòng thời gian nghịch hướng va chạm làm sụp đổ trạng thái cân bằng."_
- **Phần thưởng:** Bệ đá khổng lồ trồi lên khỏi vực sâu, tạo thành cây cầu dẫn thẳng tới cổng vào `map_ch5_kuro_asks` (Nơi Kuro Hỏi Lại) + Nhận charm `singularity_sand_charm` (Cát Điểm Dị Thường: defense +8, hồi 5 MP khi dính đòn).
- **Độ khó & Thời gian:** Rất khó · 9–12 phút.

---

#### EX-08 · Tấm Gương Của Sự Lựa Chọn Cũ

- **Vị trí:** Tiền đình trước cổng vào `map_ch5_unborn_throne` (Ngai Vua Chưa Sinh).
- **Ý nghĩa chủ đề:** Thử thách tối hậu về nhận thức và tính nhất quán đạo đức của người chơi. Tấm gương phán xét Peter dựa trên chính bản ngã mà cậu đã chọn trong suốt hành trình.
- **Đầu vào tương tác:**
  - Một tấm gương đen bóng mờ sương (Gương Hư Vô).
  - 3 bệ đá tế lễ đặt trước gương, mỗi bệ khắc một biểu tượng trừu tượng:
    - **Bệ 1 (Cành Liễu Gãy):** Tượng trưng cho _Sự Buông Bỏ & Lòng Trắc Ẩn_.
    - **Bệ 2 (Chiếc Nhẫn Rỉ):** Tượng trưng cho _Gánh Nặng Tồn Tại & Sự Níu Giữ_.
    - **Bệ 3 (Thanh Kiếm Sứt):** Tượng trưng cho _Sự Chấp Nhận Xung Đột_.
- **Cơ chế biến đổi động (Dynamic Branch Response):**
  - Câu đố này **KHÔNG CÓ ĐÁP ÁN CỐ ĐỊNH** cho mọi lượt chơi. Đáp án đúng được quyết định bởi cờ lựa chọn của người chơi tại Hồi 2:
    - **Trường hợp A:** Người chơi đã chọn Tha Thứ / Để Peter-Alpha ra đi thanh thản (`ch5_choice_alpha_mercy` = true).
    - **Trường hợp B:** Người chơi đã chọn Níu Giữ / Nhận nhẫn cưới để bảo tồn ký ức (`ch5_choice_alpha_preserve` = true).
- **Manh mối đối chiếu chéo:**
  1. _Hình ảnh phản chiếu trong Gương Hư Vô (`ch5x_mirror_inspect`):_
     - Nếu Trường hợp A: Gương hiện lên ảo ảnh một người đàn ông tóc xoăn mỉm cười buông rơi cành cây xuống dòng nước xuôi.
     - Nếu Trường hợp B: Gương hiện lên ảo ảnh một bàn tay nắm chặt chiếc nhẫn bạc đến mức tứa máu.
  2. _Lời thì thầm từ vết nứt (`ch5x_mirror_whisper`):_ "Ngươi không thể lừa dối tấm gương của những khả năng. Kẻ chọn buông tay không thể bước qua bằng lòng cố chấp; kẻ chọn gánh vác không thể bước qua bằng sự thảnh thơi dối lừa. Hãy đặt lên đài thứ mà tâm hồn ngươi đã khắc ghi ở Vọng Lâu."
- **Chuỗi suy luận:**
  - Người chơi phải nhớ lại quyết định đạo đức lớn nhất của mình ở Hồi 2:
    - Nếu đã chọn từ bi buông bỏ Peter-Alpha ➔ Đặt lễ vật lên **Bệ 1 (Cành Liễu Gãy)**.
    - Nếu đã chọn giữ lại gánh nặng trách nhiệm ➔ Đặt lễ vật lên **Bệ 2 (Chiếc Nhẫn Rỉ)**.
- **Đáp án duy nhất:** Tương ứng 1:1 với cờ đã chọn (`ch5_choice_alpha_mercy` ➔ Bệ 1; `ch5_choice_alpha_preserve` ➔ Bệ 2).
- **Sai phạt & phản hồi:** Tấm gương phát ra tia sáng lạnh đẩy lùi Peter; giọng nói vang lên: _"Lời tuyên thệ của ngươi mâu thuẫn với vết sẹo trong tim ngươi."_ (Không trừ máu, chỉ buộc người chơi đối diện lại với sự thật).
- **Phần thưởng:** Cánh cổng Ngai Vua Chưa Sinh mở ra mà không kích hoạt bẫy chông sàn; Peter nhận nội tại ẩn _Tâm Cảnh Thống Nhất_ (tăng 10% sát thương đòn đánh cơ bản trong trận đấu với The Unborn King).
- **Độ khó & Thời gian:** Khó / Yêu cầu tính nhất quán cốt truyện · 7–10 phút.

---

## 3. Ba Nhiệm Vụ Phụ Mới

### Bảng tóm tắt nhiệm vụ phụ mới

| Mã nhiệm vụ                         | Tên nhiệm vụ              | Loại | Bản đồ bắt đầu             | Nhân vật liên quan            | Phần thưởng chính             |
| :---------------------------------- | :------------------------ | :--- | :------------------------- | :---------------------------- | :---------------------------- |
| `quest_ch5x_na_paper_crane`         | Cánh Hạc Của Bé Na        | Side | `map_ch5_alpha_harbor`     | Bé Na, Cô Ba (Alpha), Peter   | Charm `na_braided_ribbon`     |
| `quest_ch5x_gardener_requiem`       | Khúc Ca Của Người Cắt Tỉa | Side | `map_ch5_glass_greenhouse` | Người Làm Vườn (The Gardener) | Charm `pruner_compassion_gem` |
| `quest_ch5x_ivo_unfinished_machine` | Cỗ Máy Dang Dở Của Ivo    | Side | `map_ch5_chronos_reactor`  | Kỹ sư Ivo, Mira               | Charm `ivo_precision_lens`    |

---

### Chi tiết kịch bản nhiệm vụ phụ

#### 1. `quest_ch5x_na_paper_crane` — Cánh Hạc Của Bé Na

- **Chủ đề cảm xúc:** Nỗi niềm của đứa trẻ mong cha không phải thức đêm; sự hy sinh thầm lặng của người làm cha.
- **Bối cảnh:** Tại Khánh Hòa nhánh Alpha, bé Na bị bệnh về phổi do bụi kim loại từ tiệm đồng hồ. Bé tin vào truyền thuyết gấp 1.000 con hạc giấy để điều ước thành sự thật.
- **Các bước thực hiện:**
  1. _Bắt đầu:_ Giải mã câu đố **EX-03** tại Bến Thuyền, nhặt được `na_origami_crane_scrap` (Con Hạc Thứ 999).
  2. _Gặp Cô Ba (`ch5x_coba_crane_talk`):_ Cô Ba kể rằng Na đã kiệt sức trước khi kịp gấp con hạc thứ 1.000, hiện con bé đang sốt li bì trong căn phòng nhỏ cạnh tiệm đồng hồ.
  3. _Hành động rẽ nhánh:_ Chuyển sang Nhánh Tỉa của tiệm đồng hồ, tìm thấy mẩu giấy màu xanh ngọc duy nhất còn sót lại trong ngăn tủ hoang tàn (`origami_paper_cyan`).
  4. _Tương tác gấp hạc:_ Peter ngồi xuống bàn làm việc của người thợ đồng hồ, đôi bàn tay quen sửa bánh răng khéo léo hoàn thành con hạc thứ 1.000 (`thousandth_paper_crane`).
  5. _Trao quà:_ Chuyển lại Nhánh Sống, đặt con hạc cạnh gối bé Na đang ngủ thiếp đi (`ch5x_na_bedside_interact`). Na khẽ mỉm cười trong mơ và vô thức buông ra chiếc dây cói bện tóc gắn chiếc bánh răng đồng hồ nhỏ xíu.
- **Cờ hoàn thành:** `completed_na_crane_quest`.
- **Phần thưởng:** Bùa hộ mệnh `na_braided_ribbon` (Dây Cói Của Bé Na: maxHp +30, defense +4, mỗi khi né hoàn hảo hồi 12 HP).

---

#### 2. `quest_ch5x_gardener_requiem` — Khúc Ca Của Người Cắt Tỉa

- **Chủ đề cảm xúc:** Người gánh vác tội ác cắt tỉa các thế giới không phải vì tàn nhẫn, mà để cứu những mầm cây còn lại không bị khô héo tập thể.
- **Bối cảnh:** Người Làm Vườn cầm chiếc kéo khổng lồ tuần tra trong Nhà Kính Ký Ức thực chất là tàn hồn của Chấp Sự Vườn Cây đầu tiên.
- **Các bước thực hiện:**
  1. _Khởi động:_ Sau khi giải câu đố **EX-02**, đóa hoa nở rộ để lộ bức tượng Chấp Sự ôm một cành cây gãy (`ch5x_gardener_statue`).
  2. _Thu thập 3 chuông gió:_ Tìm 3 chiếc chuông gió rỉ sét ở 3 góc nhà kính (`windchime_bronze`, `windchime_silver`, `windchime_glass`).
  3. _Treo chuông đúng nhịp:_ Treo chuông lên cành cây cổ thụ ở Nhánh Tỉa theo thứ tự từ nặng đến thanh (Đồng ➔ Bạc ➔ Thủy Tinh) để gió Interval tấu lên bản hòa âm tiễn đưa.
  4. _Cuộc chạm trán phi bạo lực:_ Người Làm Vườn bước tới, thay vì vung kéo tấn công, sinh vật này khựng lại trước giai điệu quen thuộc, từ từ quỳ gối buông rơi chiếc kéo xuống thảm rêu bạc (`ch5x_gardener_peace`).
- **Cờ hoàn thành:** `pacified_the_gardener`.
- **Phần thưởng:** Bùa hộ mệnh `pruner_compassion_gem` (Ngọc Trắc Ẩn: attack +3, maxMp +18; đòn đánh trúng có 15% làm chậm địch 1 giây).

---

#### 3. `quest_ch5x_ivo_unfinished_machine` — Cỗ Máy Dang Dở Của Ivo

- **Chủ đề cảm xúc:** Nỗi ám ảnh tội lỗi của nhà khoa học bị vu oan và sự chuộc lỗi xuyên qua các thực tại.
- **Bối cảnh:** Kỹ sư Ivo tại Lò Phản Ứng luôn sống trong dằn vặt vì nghĩ rằng chính công thức điều áp của mình đã làm nổ tung thành phố Beta.
- **Các bước thực hiện:**
  1. _Khởi đầu:_ Nói chuyện với Ivo sau khi giải câu đố C3 nguyên bản (`ch5x_ivo_guilt_talk`). Ivo từ chối mở van nước làm mát cho hầm trú ẩn trẻ em vì sợ lò quá tải nổ tiếp.
  2. _Tìm chứng cứ lịch sử:_ Xuống tầng ngầm đổ nát của lò phản ứng ở Nhánh Tỉa, dùng Temporal Sight phát hiện chiếc hòm sắt đen của Thượng Hội Đồng (`black_box_recorder`).
  3. _Giải mã tài liệu:_ Đọc tài liệu `council_override_decree` vạch trần việc Viện Trưởng đã tự ý tăng công suất lên 300% để cưỡng ép năng lượng Chronos, bất chấp cảnh báo đỏ của Ivo.
  4. _Minh oan:_ Mang tài liệu về cho Ivo ở Nhánh Sống (`ch5x_ivo_vindication`). Nỗi dằn vặt trăm năm được giải tỏa, Ivo gạt cần xả áp khẩn cấp, dòng nước ngọt và năng lượng ấm áp được truyền thẳng xuống Hầm Trú Ẩn Trẻ Em.
- **Cờ hoàn thành:** `resolved_ivo_redemption`.
- **Phần thưởng:** Bùa hộ mệnh `ivo_precision_lens` (Thấu Kính Chuẩn Xác Của Ivo: tốc độ vung kiếm nhanh hơn 15%, maxMp +15) + 3 bình `chronos_coolant_flask` (hồi 120 HP và 40 MP).

---

## 4. Ba Bản Đồ Mới

Bản mở rộng bổ sung chính xác **3 bản đồ mới** (đáp ứng đúng giới hạn quy định, không tạo thêm gánh nặng tài nguyên vượt mức):

### Bảng thông số kỹ thuật bản đồ mới

| Tên bản đồ                  | Mã bản đồ (`mapId`)         | Kích thước (tiles) | Tileset chủ đạo                              | Cửa nối & Điều kiện ra vào                                                          |
| :-------------------------- | :-------------------------- | :----------------- | :------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Nhà Kính Ký Ức**          | `map_ch5_glass_greenhouse`  | 22×16              | `sunken` (tô bạc tím pha ánh kính xanh rêu)  | Cửa Tây nối sang `map_ch5_seed_garden`. Mở sau khi giải câu đố **EX-01**.           |
| **Bến Thuyền Vắng Lặng**    | `map_ch5_alpha_harbor`      | 26×18              | `coastal` (bờ biển Khánh Hòa biến thể Alpha) | Cửa Bắc nối sang `map_ch5_alpha_town`. Đi lại tự do khi vào Hồi 2.                  |
| **Đài Thiên Văn Đảo Ngược** | `map_ch5_observatory_ruins` | 24×18              | `steel` (dungeon kim loại gỉ pha kính vòm)   | Cửa Nam nối sang `map_ch5_beta_city` qua cầu thép. Mở khi kích hoạt thang máy Beta. |

### Chi tiết bố trí bản đồ

1. `map_ch5_glass_greenhouse` (22×16):
   - Không gian nhà kính vòm kính rạn nứt. Ở giữa là bồn hoa khổng lồ chứa Nguyệt Thảo.
   - Bố trí 3 van khí tượng của câu đố **EX-02** và 3 điểm treo chuông gió cho nhiệm vụ phụ Người Làm Vườn.
   - Có 1 Mầm Rẽ Nhánh ở góc đông nam. Quái tuần tra: 2 Bóng Nhánh và 1 Người Làm Vườn (bán thân, di chuyển chậm).

2. `map_ch5_alpha_harbor` (26×18):
   - Cầu tàu gỗ hướng ra biển cả phẳng lặng như gương.
   - Ở Nhánh Sống: Con tàu buôn mới tinh, bến cá có lưới phơi ngăn nắp, bức vẽ phấn của Na trên sàn gỗ.
   - Ở Nhánh Tỉa: Tàu đắm gãy đôi, cầu tàu sập gãy tạo thành mê cung nhảy qua các cọc gỗ, vách đá lộ ra chiếc hộp sắt.
   - Nơi diễn ra câu đố **EX-03** và tuyến truyện Na.

3. `map_ch5_observatory_ruins` (24×18):
   - Tầng thượng đài quan sát với kính thiên văn đồng thau khổng lồ hướng ra khoảng không vô tận.
   - Vòm trời hiển thị lưới tọa độ sao phát sáng.
   - Nơi diễn ra câu đố **EX-05** và khoang lưu trữ ghi chép thiên văn học của nền văn minh Beta.

---

## 5. Thoại Nháp Các Cảnh Then Chốt

> **Quy tắc thoại:** Tiếng Việt tự nhiên, $\le 220$ ký tự/dòng, $\le 2$ lựa chọn/node. Kuro xưng "tao – mày" với Peter. Thể hiện sự giằng xé nội tâm sâu sắc.

### Cảnh 1: Kuro và Peter tại Nhà Kính Ký Ức (`map_ch5_glass_greenhouse`)

```json
{
  "ch5x_kuro_greenhouse_1": {
    "speaker": "Kuro",
    "lines": [
      "Mày thấy mấy cái cây này không? Chúng từng là những buổi chiều nắng ấm của một nhánh thế giới đã bị cắt đứt.",
      "Tao gom chúng về đây, cắm rễ vào mảnh kính vỡ. Nhưng rễ không có đất thì sống bằng gì được chứ?"
    ],
    "responses": [
      { "text": "Anh đang tự vắt kiệt mình đấy.", "nextDialogueId": "ch5x_kuro_greenhouse_2a" },
      { "text": "Tại sao không để chúng ra đi?", "nextDialogueId": "ch5x_kuro_greenhouse_2b" }
    ]
  },
  "ch5x_kuro_greenhouse_2a": {
    "speaker": "Kuro",
    "lines": [
      "Tao biết chứ. Mỗi chiếc lá xanh ở đây là một mảnh ký ức của tao bị vữa ra thành tro bụi.",
      "Nhưng nếu tao buông tay... thì ai sẽ nhớ rằng chúng từng tồn tại? Mày à, Peter? Mày còn chẳng nhớ nổi tên con mèo của tao!"
    ],
    "responses": []
  },
  "ch5x_kuro_greenhouse_2b": {
    "speaker": "Kuro",
    "lines": [
      "Để chúng ra đi? Nói thì dễ lắm, kẻ chưa từng bị cắt tỉa như mày làm sao hiểu được cảm giác bị thế giới lãng quên!",
      "(Kuro siết chặt bình tưới nước, đốt ngón tay trắng bệch, ánh mắt dao động dữ dội.)"
    ],
    "responses": []
  }
}
```

### Cảnh 2: Peter đứng bên giường bé Na (`map_ch5_alpha_town`)

```json
{
  "ch5x_peter_na_room": {
    "speaker": "Peter",
    "lines": [
      "(Căn phòng nhỏ thoang thoảng mùi dầu máy đồng hồ và hương hoa cúc khô.)",
      "(Bé Na nằm cuộn tròn dưới lớp chăn mỏng, hơi thở yếu ớt ngắt quãng. Bàn tay nhỏ bé vẫn còn dính vài vệt phấn màu.)"
    ],
    "responses": [
      { "text": "Đặt con hạc giấy thứ 1.000 xuống", "nextDialogueId": "ch5x_peter_na_place_crane" }
    ]
  },
  "ch5x_peter_na_place_crane": {
    "speaker": "Peter",
    "lines": [
      "Ngủ ngoan nhé, Na. Điều ước của cháu... bố của cháu ở thế giới này sẽ thay ta hoàn thành nó.",
      "(Con hạc giấy màu xanh ngọc nằm lặng lẽ bên gối. Gương mặt cô bé giãn ra trong một nụ cười thanh thản.)"
    ],
    "responses": [],
    "effects": {
      "setFlags": ["placed_na_thousandth_crane"],
      "grantItems": [{ "itemId": "na_braided_ribbon", "quantity": 1 }],
      "grantOnceFlag": "took_na_braided_ribbon"
    }
  }
}
```

### Cảnh 3: Đối thoại với Ivo khi được minh oan (`map_ch5_chronos_reactor`)

```json
{
  "ch5x_ivo_vindication_dialogue": {
    "speaker": "Kỹ Sư Ivo",
    "lines": [
      "(Ivo cầm bản mật lệnh của Thượng Hội Đồng, đôi bàn tay run rẩy làm rơi cả chiếc cờ-lê kim loại xuống sàn thép.)",
      "Họ... họ đã bí mật đổi thông số điều áp lên 300% sao? Không phải do tính toán của tôi... Không phải tôi giết chết thành phố này..."
    ],
    "responses": [
      {
        "text": "Mọi người đã nợ ông một lời xin lỗi.",
        "nextDialogueId": "ch5x_ivo_vindication_reply"
      }
    ]
  },
  "ch5x_ivo_vindication_reply": {
    "speaker": "Kỹ Sư Ivo",
    "lines": [
      "Trăm năm qua... tôi đã giam mình trong lò lửa này vì nghĩ mình là tội đồ...",
      "Cảm ơn cậu, chàng trai đồng hồ. Van xả khẩn cấp sẽ mở ngay bây giờ. Lũ trẻ ở hầm trú ẩn sẽ có nước ấm để dùng!"
    ],
    "responses": [],
    "effects": {
      "setFlags": ["ivo_guilt_cleared", "shelter_water_restored"],
      "grantItems": [{ "itemId": "ivo_precision_lens", "quantity": 1 }],
      "grantOnceFlag": "took_ivo_precision_lens"
    }
  }
}
```

### Cảnh 4: Thử thách trước Gương Hư Vô (`map_ch5_unborn_throne`)

```json
{
  "ch5x_mirror_challenge_node": {
    "speaker": "Tấm Gương Hư Vô",
    "lines": [
      "Kẻ mang thanh kiếm gãy, ngươi đã đi qua những nhánh rẽ tan nát của thế gian.",
      "Ở Vọng Lâu, ngươi đã chọn đối diện với chính bản ngã của mình bằng lòng buông bỏ hay sự níu giữ?"
    ],
    "responses": [
      { "text": "Đặt cành liễu buông bỏ lên bệ", "nextDialogueId": "ch5x_mirror_choice_willow" },
      { "text": "Đặt chiếc nhẫn níu giữ lên bệ", "nextDialogueId": "ch5x_mirror_choice_ring" }
    ]
  },
  "ch5x_mirror_choice_willow": {
    "speaker": "Tấm Gương Hư Vô",
    "lines": [
      "(Mặt gương gợn sóng bạc. Nếu ngươi thực sự đã chọn buông bỏ Peter-Alpha, làn sương sẽ rẽ lối.)"
    ],
    "responses": []
  },
  "ch5x_mirror_choice_ring": {
    "speaker": "Tấm Gương Hư Vô",
    "lines": [
      "(Mặt gương ánh lên sắc thép lạnh. Nếu ngươi thực sự đã chọn gánh vác chiếc nhẫn kỷ vật, cánh cổng sẽ nâng lên.)"
    ],
    "responses": []
  }
}
```

---

## 6. Hỗ Trợ Kỹ Thuật & Yêu Cầu Engine Cần Thêm

Hầu hết các câu đố đều tận dụng 100% engine hiện có (`layerVariants`, `toggleBranch`, `refreshMap`, `startTimer`, `ifFlags`, `ifItems`, `takeItems`, `setFlags`). Tuy nhiên, để 8 câu đố mới vận hành mượt mà và trực quan nhất, đề xuất Claude bổ sung 3 điểm mở rộng kỹ thuật nhẹ trong `src/`:

1. **Kiểm tra điều kiện động theo cờ lịch sử (`dynamicChoiceValidation`):**
   - _Áp dụng:_ Câu đố **EX-08** (Gương Hư Vô).
   - _Mô tả:_ Cho phép một node thoại hoặc kiểm tra bệ đá chuyển tiếp thành công nếu thỏa mãn: `(ch5x_chose_willow && ch5_choice_alpha_mercy)` HOẶC `(ch5x_chose_ring && ch5_choice_alpha_preserve)`. Hiện tại hoàn toàn có thể triển khai bằng 2 response nhánh song song có điều kiện `ifFlags` trong `dialogue.json`.
2. **Cơ chế đảo chiều đếm hạt trong Timer (`reverseTimerLogic`):**
   - _Áp dụng:_ Câu đố **EX-07** (Đồng Hồ Cát).
   - _Mô tả:_ Sử dụng biến cờ nấc `hourglass_level_1` đến `hourglass_level_5`. Khi ở Nhánh Sống, mỗi chu kỳ 3s tăng 1 bậc; khi ở Nhánh Tỉa, mỗi chu kỳ 2s giảm 1 bậc (hoặc ngược lại). Claude có thể viết helper nhỏ trong `src/systems/interaction/` hoặc xử lý bằng trigger vùng.
3. **Hiệu ứng đẩy đá qua nhánh (`crossBranchObstacle`):**
   - _Áp dụng:_ Câu đố **EX-01**.
   - _Mô tả:_ Khi khối đá được đẩy tới tọa độ (X, Y) ở Nhánh Sống, lưu cờ `ch5x_rock_pos_north`. Khi chuyển sang Nhánh Tỉa, `layerVariants` kiểm tra cờ này để vẽ ô bóng đổ màu tím tương ứng tại ô Nam. Hoàn toàn khả thi bằng hệ thống cờ và map swap hiện có.

---

## 7. Câu Hỏi Mở Cho Owner

1. **Số phận bé Na ở Nhánh Alpha:** Bản mở rộng cho phép Peter gấp con hạc thứ 1.000 để Na thanh thản mỉm cười trong giấc ngủ nhưng vẫn giữ ngỏ việc cô bé có bình phục hoàn toàn hay không. Bạn có muốn khẳng định Na được chữa lành nhờ năng lượng Temporal không, hay giữ sự mong manh, bảng lảng như hiện tại?
2. **Độ khó thời gian thực của Đồng Hồ Cát (EX-07):** Cửa sổ thao tác 2 giây khi chuyển nhánh đòi hỏi người chơi thao tác dứt khoát. Bạn có muốn nới rộng cửa sổ an toàn lên 3.5 giây để thân thiện hơn với người chơi thích giải đố thuần suy luận không?
3. **Cách xưng hô của Kuro:** Trong bản mở rộng, Kuro vẫn giữ xưng hô "tao – mày" gay gắt nhưng chứa chan tình cảm và sự bất lực. Khi nhận ra Peter nhớ hết những câu chuyện riêng của mình, Kuro có một thoáng nghẹn ngào xưng "tôi – cậu" hay giữ trọn vẹn "tao – mày" đến tận cuối cùng?

---

## 8. Hợp Đồng ID Dữ Liệu (ID Contract)

> **Quy ước:** Tất cả các định danh mới đều sử dụng tiền tố `ch5x_` (đối với dialogue, quests, flags, dials) hoặc tên định danh rõ nghĩa (đối với items) để tuyệt đối không va chạm với 176 node và dữ liệu hiện có trong `scripts/content-ch5.mjs`.

### 8.1. Vật phẩm mới (Items)

| ID Vật phẩm                   | Tên hiển thị (Tiếng Việt)        | Loại (`type`) | Mô tả ngắn gọn & Chỉ số                                                             |
| :---------------------------- | :------------------------------- | :------------ | :---------------------------------------------------------------------------------- |
| `interval_astronomy_scrap`    | Mảnh Giấy Thiên Văn Interval     | `document`    | Mảnh giấy ghi chép vị trí các nguồn sáng trong Interval. (1 trang $\le 220$ ký tự). |
| `gardener_journal_p4`         | Nhật Ký Người Làm Vườn — Trang 4 | `document`    | Quy tắc nuôi dưỡng đóa Nguyệt Thảo bằng vi khí hậu. (1 trang $\le 220$ ký tự).      |
| `pure_interval_seed`          | Hạt Mầm Bất Tận                  | `puzzle`      | Hạt mầm tinh khiết thu được từ đóa Nguyệt Thảo trong nhà kính.                      |
| `pruner_compassion_gem`       | Ngọc Trắc Ẩn                     | `charm`       | Bùa hộ mệnh của Người Làm Vườn. (attack 3, maxMp 18, làm chậm 15%).                 |
| `na_origami_crane_scrap`      | Con Hạc Giấy Thứ 999             | `document`    | Con hạc giấy Na gấp dở trước khi đổ bệnh. (1 trang $\le 220$ ký tự).                |
| `origami_paper_cyan`          | Giấy Màu Xanh Ngọc               | `puzzle`      | Mẩu giấy màu tìm thấy trong ngăn tủ hoang tàn ở nhánh Tỉa.                          |
| `thousandth_paper_crane`      | Con Hạc Giấy Thứ 1.000           | `puzzle`      | Con hạc giấy hoàn chỉnh do chính tay Peter gấp.                                     |
| `na_braided_ribbon`           | Dây Cói Của Bé Na                | `charm`       | Bùa hộ mệnh của bé Na. (maxHp 30, defense 4, hồi 12 HP khi né hoàn hảo).            |
| `conscience_iron_key`         | Chìa Khóa Lương Tâm              | `puzzle`      | Chìa khóa lấy được từ Dư ảnh Lưu Đày ở Vọng Lâu.                                    |
| `pruner_confession_parchment` | Thư Thú Tội Của Kẻ Tỉa           | `document`    | Lời giãi bày của vị Thần Quan về việc tỉa cành. (2 trang $\le 220$ ký tự/trang).    |
| `astronomy_lens_living`       | Thấu Kính Sao — Nhánh Sống       | `puzzle`      | Mảnh thấu kính thiên văn ghi quỹ đạo sao bình thường.                               |
| `astronomy_lens_pruned`       | Thấu Kính Sao — Nhánh Tỉa        | `puzzle`      | Mảnh thấu kính thiên văn ghi độ lệch pha khi thế giới sụp đổ.                       |
| `beta_astronomy_log_1`        | Bản Ghi Thiên Văn Beta I         | `document`    | Nhật ký ghi nhận kinh độ 60° của chòm sao. (1 trang $\le 220$ ký tự).               |
| `beta_astronomy_log_2`        | Bản Ghi Thiên Văn Beta II        | `document`    | Nhật ký đo độ lệch pha +30°. (1 trang $\le 220$ ký tự).                             |
| `quantum_astrolabe_charm`     | Thước Đo Lượng Tử                | `charm`       | Bùa hộ mệnh của Đài Thiên Văn. (maxMp 22, speed 3).                                 |
| `mira_tuning_notes`           | Sổ Tay Điều Âm Của Mira          | `document`    | Quy tắc hòa âm thay thế phím kim khí hỏng. (1 trang $\le 220$ ký tự).               |
| `clockwork_music_cylinder`    | Trục Hộp Nhạc Ru Con             | `puzzle`      | Trục đồng ghi giai điệu hòa âm hoàn chỉnh của hầm trú ẩn.                           |
| `grey_researcher_notes`       | Ghi Chép Của Người Vùng Xám      | `document`    | Hướng dẫn vận hành đồng hồ cát trọng lực ngược. (1 trang $\le 220$ ký tự).          |
| `singularity_sand_charm`      | Cát Điểm Dị Thường               | `charm`       | Bùa hộ mệnh tinh thể xám. (defense 8, hồi 5 MP khi nhận sát thương).                |
| `black_box_recorder`          | Hộp Đen Lò Phản Ứng              | `puzzle`      | Thiết bị ghi dữ liệu điều áp của Thượng Hội Đồng.                                   |
| `council_override_decree`     | Mật Lệnh Thượng Hội Đồng         | `document`    | Bản cáo trạng chứng minh Ivo vô tội. (2 trang $\le 220$ ký tự/trang).               |
| `chronos_coolant_flask`       | Bình Nước Làm Mát Chronos        | `consumable`  | Dược phẩm làm mát cực mạnh. (hồi 120 HP, 40 MP).                                    |
| `ivo_precision_lens`          | Thấu Kính Chuẩn Xác Của Ivo      | `charm`       | Bùa hộ mệnh cơ khí. (swingMs giảm 15%, maxMp 15).                                   |

### 8.2. Nhiệm vụ mới (Quests)

| ID Nhiệm vụ                         | Tên hiển thị              | Loại (`kind`) | Chương (`chapter`) | Cờ hoàn thành (`completeOnFlag`) |
| :---------------------------------- | :------------------------ | :------------ | :----------------- | :------------------------------- |
| `quest_ch5x_na_paper_crane`         | Cánh Hạc Của Bé Na        | `side`        | 5                  | `completed_na_crane_quest`       |
| `quest_ch5x_gardener_requiem`       | Khúc Ca Của Người Cắt Tỉa | `side`        | 5                  | `pacified_the_gardener`          |
| `quest_ch5x_ivo_unfinished_machine` | Cỗ Máy Dang Dở Của Ivo    | `side`        | 5                  | `resolved_ivo_redemption`        |

### 8.3. Danh sách Dialogue Node mới theo bản đồ

1. **`map_ch5_seed_garden` & `map_ch5_glass_greenhouse`:**
   - `ch5x_poi_sun_stele`, `ch5x_kuro_shadow_hint`, `ch5x_rock_push_feedback`, `ch5x_puzzle_ex1_solved`
   - `ch5x_flower_living_poi`, `ch5x_flower_pruned_poi`, `ch5x_weather_console`, `ch5x_weather_wrong`, `ch5x_weather_success`
   - `ch5x_kuro_greenhouse_1`, `ch5x_kuro_greenhouse_2a`, `ch5x_kuro_greenhouse_2b`
   - `ch5x_gardener_statue`, `ch5x_windchime_puzzle`, `ch5x_gardener_peace`
2. **`map_ch5_alpha_harbor` & `map_ch5_alpha_town`:**
   - `ch5x_chalk_living`, `ch5x_chalk_pruned`, `ch5x_coba_harbor_talk`, `ch5x_chalk_puzzle_interact`, `ch5x_chalk_wrong`, `ch5x_chalk_success`
   - `ch5x_coba_crane_talk`, `ch5x_peter_table_fold`, `ch5x_peter_na_room`, `ch5x_peter_na_place_crane`
3. **`map_ch5_pruner_tower`:**
   - `ch5x_pruner_stele_logic`, `ch5x_witness_a_talk`, `ch5x_witness_b_talk`, `ch5x_witness_c_talk`, `ch5x_witness_choose_menu`, `ch5x_witness_wrong`, `ch5x_witness_success`
4. **`map_ch5_observatory_ruins`:**
   - `ch5x_telescope_inspect`, `ch5x_telescope_preview`, `ch5x_observatory_dial_angle`, `ch5x_observatory_wrong`, `ch5x_observatory_success`
5. **`map_ch5_children_shelter` & `map_ch5_chronos_reactor`:**
   - `ch5x_shelter_poem_wall`, `ch5x_piano_console`, `ch5x_piano_wrong`, `ch5x_piano_success`, `ch5x_kuro_mira_special`
   - `ch5x_ivo_guilt_talk`, `ch5x_black_box_find`, `ch5x_ivo_vindication_dialogue`, `ch5x_ivo_vindication_reply`
6. **`map_ch5_grey_prune`:**
   - `ch5x_hourglass_tablet`, `ch5x_hourglass_inspect`, `ch5x_hourglass_lever_pull`, `ch5x_hourglass_wrong`, `ch5x_hourglass_success`
7. **`map_ch5_unborn_throne`:**
   - `ch5x_mirror_inspect`, `ch5x_mirror_whisper`, `ch5x_mirror_challenge_node`, `ch5x_mirror_choice_willow`, `ch5x_mirror_choice_ring`, `ch5x_mirror_wrong`, `ch5x_mirror_pass`

### 8.4. Danh sách Cờ (Flags) & Vòng xoay (Dials) mới

- **Vòng xoay (`dialId`):**
  - `dial_ch5x_humidity` (values: `arid`, `rain`, `mist`)
  - `dial_ch5x_temperature` (values: `freeze`, `mild`, `scorching`)
  - `dial_ch5x_airflow` (values: `gale`, `still`, `breeze`)
  - `dial_ch5x_star_angle` (values: `30`, `60`, `90`, `120`)
- **Cờ trạng thái (`flags`):**
  - `ch5x_rock_pos_north`, `ch5x_ex1_solved`
  - `ch5x_greenhouse_unlocked`, `ch5x_weather_balanced`, `ch5x_got_pure_seed`
  - `ch5x_chalk_solved`, `started_na_crane_quest`, `placed_na_thousandth_crane`, `completed_na_crane_quest`
  - `ch5x_witness_solved`, `opened_pruner_attic`
  - `ch5x_observatory_aligned`, `ch5x_telescope_beamed`
  - `ch5x_piano_melody_played`, `unlocked_music_cylinder`
  - `ch5x_hourglass_balanced`, `ch5x_grey_bridge_raised`
  - `ch5x_mirror_passed`, `unity_mindset_active`
  - `pacified_the_gardener`, `ivo_guilt_cleared`, `shelter_water_restored`, `resolved_ivo_redemption`

---

_Tài liệu kết thúc. Sẵn sàng chuyển giao cho Claude Code review kỹ thuật và trình Project Owner phê duyệt._

---

## 9. Claude Review — Bản Đã Sửa (2026-11-14)

§9 thay thế mọi chỗ khác ở §2–§8. Câu hỏi mở (§7) dùng mặc định cho tới khi owner nói khác:

- Bé Na: giữ mong manh, không khẳng định khỏi bệnh.
- Đồng hồ cát: bỏ phần canh giờ (xem EX-07).
- Kuro: giữ "tao – mày" tới cuối.

**EX-01 · Khối đá và bóng đổ.**

- Giữ nguyên ý tưởng. Khối đá là một vòng xoay vị trí: **[E] Đẩy khối đá** chuyển qua Bắc → Đông → Nam → Tây (cờ `ch5x_rock_<hướng>`); ô đá đổi theo `tileSwaps`.
- Chỉ đẩy được ở nhánh Sống. Bệ cảm ứng (POI) ở nhánh Tỉa kiểm tra `ch5x_rock_north` → `ch5x_puzzle_ex1_solved`.

**EX-02 · Hộp thời tiết — phải loại trừ, không đọc thẳng đáp án.**

- Nhật ký Người Làm Vườn trang 4 chỉ còn: _"Nguyệt Thảo cần đúng thứ nhánh Sống đang thiếu, và tránh mọi thứ đã giết nhánh Tỉa."_
- Hoa nhánh Sống: úng nước vì mưa, gió đọng, run vì lạnh.
- Hoa nhánh Tỉa: chết vì nắng gắt khô hạn và gió lốc.
- **Loại trừ:**
  - Độ ẩm: không mưa (thừa), không khô (đã giết Tỉa) → Sương.
  - Nhiệt độ: thiếu ấm (nên không băng giá), không nắng gắt → Ôn hòa.
  - Dòng khí: không đọng, không lốc → Gió thoảng.
- Mỗi vòng xoay có thêm một giá trị đầu tiên "(chưa chỉnh)" để không có vòng nào đúng sẵn.

**EX-04 · Ba nhân chứng — viết lại logic (bản cũ mâu thuẫn).**

- Ba dư ảnh X, Y, Z **không ghi** ai thuộc nhánh nào.
- Bia đá:
  - kẻ được ở lại luôn nói dối;
  - kẻ bị tỉa luôn nói thật;
  - kẻ lưu đày luôn nói ngược với kẻ bị tỉa (tức cũng nói dối).
- Lời khai:
  - **X:** "Z là kẻ bị tỉa."
  - **Y:** "Chiếc chìa khóa nằm trong ngực áo của Z."
  - **Z:** "X đang nói thật."
- **Suy luận:**
  - Chỉ có đúng một người nói thật.
  - Nếu X nói thật thì Z cũng thật — vô lý, nên X nói dối.
  - Z bảo "X nói thật", nên Z cũng nói dối.
  - Vậy Y là người nói thật, và chìa khóa ở **Z**.
- **Đầu vào:** vòng xoay [X / Y / Z] + POI "Chỉ định".

**EX-06 · Giai điệu bằng thơ.**

- Năm vòng xoay "Nốt 1…5", mỗi vòng 5 chất liệu cộng "(trống)", + cần [Phát âm chuỗi].
- **Đáp án:** Gió Hư Không → Nước Chảy → Thủy Tinh → Thủy Tinh → Thủy Tinh.
- Chọn Kim Loại ở bất kỳ nốt nào = sai (phím kẹt).

**EX-07 · Đồng hồ cát hai chiều — đổi thành câu đố đong cát theo lượt, bỏ canh giờ.**

- Khoang giữa có vạch 0–5.
- Cần [Lật đồng hồ]:
  - ở nhánh Sống: **+3 vạch**;
  - ở nhánh Tỉa: **−2 vạch** (không xuống dưới 0);
  - vượt quá 5: bình vỡ, về 0.
- **Manh mối:**
  - Bệ đá: _"Cổng hư không chỉ nhận cát dừng ở vạch thứ tư."_
  - Ghi chép người Vùng Xám: _"Nhánh sống rót ba vạch mỗi lần lật, nhánh tỉa hút ngược hai. Quá năm vạch thì bình vỡ, cát rơi sạch."_
- **Lời giải ngắn nhất:** Sống (3) → Tỉa (1) → Sống (4), rồi kéo [Khóa cân bằng].
- **Kỹ thuật:** cờ `ch5x_sand_0..5` (luôn đúng một cờ), POI Lật có `dialogueRules` theo nhánh và mức hiện tại; [Khóa] kiểm tra `ch5x_sand_4`.

**EX-08 · Tấm gương của lựa chọn cũ.**

- Ánh xạ cờ thật:
  - **Cành Liễu Gãy (buông bỏ)** ↔ `ch5_choice_alpha_letter` (đọc thư, Peter-Alpha tháo giáp);
  - **Chiếc Nhẫn Rỉ (níu giữ)** ↔ `ch5_choice_alpha_spared` (trao thư, anh ấy tiếp tục tỉa để giữ con).
- Bệ Thanh Kiếm luôn sai.
- **Thưởng:** cờ `unity_mindset_active` — Vua Chưa Sinh mất lượt đầu tiên của trận (engine: `script.stunIfFlag`).

**Bùa và vật phẩm** (chỉ dùng chỉ số game có):

| Id                        | Chỉ số              |
| :------------------------ | :------------------ |
| `na_braided_ribbon`       | maxHp 30, defense 4 |
| `pruner_compassion_gem`   | attack 3, maxMp 18  |
| `ivo_precision_lens`      | maxMp 15, speed 3   |
| `quantum_astrolabe_charm` | maxMp 22, speed 3   |
| `singularity_sand_charm`  | defense 8, maxHp 10 |

`chronos_coolant_flask` giữ nguyên (hồi 120 HP, 40 MP).

**Nhiệm vụ phụ:**

- **Ivo:** "dùng Temporal Sight" → chỉ cần một POI ở nhánh Tỉa của lò phản ứng.
- **Người Làm Vườn:**
  - Ba chuông gió treo bằng vòng xoay thứ tự, đáp án Đồng → Bạc → Thủy Tinh.
  - Người Làm Vườn tuần tra trong nhà kính chỉ xuất hiện khi chưa có `pacified_the_gardener`.
- **Bé Na:** giữ nguyên các bước.

**Bản đồ mới:**

- `map_ch5_glass_greenhouse`: interval tileset.
- `map_ch5_alpha_harbor`: coastal tileset, có hai nhánh.
- `map_ch5_observatory_ruins`: steel tileset.

Chương 5 nâng lên **17 bản đồ**.
