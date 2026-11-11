# CHRONO -- THE FRACTURED DIVINITY

## Master Story Bible & Narrative Reference

**Version:** 1.0  
**Status:** Canonical Working Reference (Nguồn tham chiếu cốt truyện cấp cao)  
**Game Format:** Single-player, browser-based 2D RPG (Phaser 3 + TypeScript)  
**Art Direction:** 16-bit Pixel Art, stylized characters, dark fantasy / cosmic mystery  
**Camera & Combat:** Top-down exploration, turn-based combat  
**Scope:** Prologue Vertical Slice active; full design foundation for Chapters 1 through 6

---

> [!IMPORTANT]
> This master document preserves all confirmed narrative decisions and proposals. For agent-scoped tasks, do not load this entire file. Refer to `docs/architecture/DOCUMENTATION_MAP.md` to load only the dedicated modular documents.

---

# 0. Cách sử dụng tài liệu

Tài liệu này là nguồn tham chiếu cốt truyện cấp cao của CHRONO. Nó mô tả premise, lore, nhân vật, cấu trúc sáu chương, các lớp thời gian, gameplay gắn với câu chuyện và những điểm chưa được khóa.

## 0.1 Trạng thái thông tin

- **[CANON -- ĐÃ CHỐT]:** Nội dung đã được thống nhất trong quá trình thiết kế. Agent không tự ý thay đổi.
- **[DIRECTION -- ĐỊNH HƯỚNG]:** Hướng thiết kế đã được chọn nhưng chi tiết có thể được cụ thể hóa.
- **[PROPOSAL -- ĐỀ XUẤT]:** Ý tưởng đang dùng để phát triển; cần được duyệt trước khi coi là canon.
- **[OPEN -- CHƯA CHỐT]:** Câu hỏi cần giữ mở, không tự bịa câu trả lời.

Nếu có mâu thuẫn giữa tài liệu con và tài liệu này, ưu tiên tài liệu này đối với canon cốt truyện. Nếu người dùng đưa ra quyết định mới, cập nhật Story Bible và ghi lại thay đổi trong CHANGELOG.

## 0.2 Nguyên tắc sáng tác

1. Không biến mọi chương thành một chuỗi "đến map -- đánh boss -- nhận sức mạnh".
2. Chiến đấu là một phần của hành trình, không phải phương thức vượt thử thách duy nhất.
3. Lore được hé lộ qua môi trường, NPC, vật thể, nhật ký, thư từ, nhiệm vụ phụ và những mảnh ký ức.
4. Các dị thường phải có quy luật và hệ quả nhất quán.
5. Không phải mọi sinh vật hay thực thể bất thường đều là kẻ ác.
6. Không phải mọi bí ẩn đều cần được giải thích ngay khi xuất hiện.
7. Không tự ý thay đổi sáu Divine Authorities, bản chất Unwritten của Peter hoặc lần xuất hiện trực tiếp đầu tiên của Kuro ở Chapter 4.
8. Các ý tưởng gắn nhãn PROPOSAL không được tự động nâng thành canon.

---

# 1. Tổng quan trò chơi

## 1.1 Tên và thể loại

**CHRONO – THE FRACTURED DIVINITY**

Thể loại:

- Dark Fantasy
- Mystery
- Psychological Fantasy
- Cosmic Fantasy
- Exploration RPG
- Turn-based RPG

Trải nghiệm cốt lõi: người chơi theo chân Peter qua những vùng đất nơi quá khứ, hiện tại và tương lai bị chồng lấn. Mỗi vùng đất lưu giữ một phần lịch sử đã sai lệch, một câu chuyện bị lãng quên hoặc một hậu quả do các quyền năng thời gian mất cân bằng gây ra.

## 1.2 Logline

Khi sáu quyền năng của vị thần Chronos bị phân tách, trật tự của thế giới bắt đầu rạn vỡ. Những người, địa điểm và sự kiện bị xóa khỏi lịch sử không biến mất hoàn toàn: chúng để lại những dấu vết mà không ai còn nhớ cách giải thích. Peter – một tồn tại không được thế giới ghi nhận trọn vẹn – có thể nhìn thấy những dấu vết ấy. Trên hành trình tìm hiểu nguồn gốc của bản thân, Peter dần phát hiện rằng việc bảo vệ thế giới hiện tại có thể đồng nghĩa với việc tiếp tục hy sinh vô số thế giới đã bị lãng quên.

## 1.3 Chủ đề trung tâm

- **Ký ức và bản sắc:** Nếu không ai nhớ đến một người, người đó còn tồn tại không?
- **Trật tự và hy sinh:** Một thế giới ổn định có đáng được bảo vệ nếu sự ổn định ấy được xây dựng bằng việc loại bỏ các thế giới khác?
- **Tự do và hậu quả:** Giải phóng mọi khả năng có thực sự là điều tốt nếu chúng va chạm và phá hủy lẫn nhau?
- **Tình bạn và lời hứa:** Điều gì còn lại khi một người nhớ về mối quan hệ mà người kia đã quên?
- **Sự tồn tại:** Liệu một cá thể không được thế giới công nhận có thể thay đổi chính quy luật của thế giới?

---

# 2. Nền tảng thế giới và vũ trụ quan

## 2.1 Chronos [CANON Ở MỨC KHÁI NIỆM]

Chronos là vị thần gắn với cấu trúc và trật tự thời gian. Chronos nắm giữ sáu Divine Authorities, những quyền năng nền tảng duy trì cách thế giới được hình thành, vận hành, ghi nhớ và kết thúc.
Chronos không phải là thiện hoặc ác đơn thuần. Vai trò, động cơ và trách nhiệm của Chronos cần được hé lộ dần. Có khả năng Chronos từng duy trì sự ổn định bằng cách loại bỏ những nhánh thực tại không thể tiếp tục tồn tại trong hệ thống.

## 2.2 Sáu Divine Authorities [CANON]

| Authority       | Domain (Ý nghĩa) | Narrative Function (Phạm vi tác động)                                            |
| --------------- | ---------------- | -------------------------------------------------------------------------------- |
| **Origin**      | Khởi nguyên      | Sự hình thành, nguồn gốc, sự bắt đầu; những gì được phép tồn tại                 |
| **Continuum**   | Liên tục         | Dòng chảy, sự tiếp diễn, trình tự thời gian; những gì tiếp diễn và thay đổi      |
| **Causality**   | Nhân quả         | Quan hệ nguyên nhân – kết quả, định mệnh, hệ quả; liệu kết quả có thể bị áp đặt  |
| **Memory**      | Ký ức            | Ký ức cá nhân, lịch sử, hồ sơ tồn tại; những gì thế giới ghi nhớ                 |
| **Possibility** | Khả năng         | Các nhánh thực tại, những điều có thể xảy ra; những gì có thể đã tồn tại         |
| **Finality**    | Kết thúc         | Cái kết, sự chấm dứt, ranh giới không thể đảo ngược; những gì được phép kết thúc |

Mỗi Authority là một nguyên lý vũ trụ, không chỉ là một loại phép thuật. Việc một Authority mất cân bằng có thể làm sai lệch cả môi trường, xã hội, lịch sử và cách con người hiểu về thế giới.

## 2.3 Sự phân tách quyền năng [CANON Ở MỨC KHÁI NIỆM]

Chronos đã phân tách sáu Divine Authorities thành các phần quyền năng riêng biệt, thường được gọi trong thiết kế là **Divine Seals** hoặc các mảnh quyền năng.
Việc phân tách này dẫn đến sự mất ổn định của hệ thống. Những hiện tượng dị thường xuất hiện khi các nguyên lý vốn phải vận hành đồng bộ không còn được cân bằng. Không được mặc định mọi Divine Seal đều nằm trong tay phản diện.

_[OPEN]: Lý do chính xác khiến Chronos phân tách các quyền năng, quy trình phân tách và thời điểm xảy ra sự kiện cần được hé lộ có kiểm soát trong các chương sau._

## 2.4 Dị thường thời gian

Dị thường không chỉ là cổng dịch chuyển thời gian. Chúng có thể làm cho:

- Một địa điểm tồn tại đồng thời ở nhiều thời điểm.
- Một con đường dẫn đến những phiên bản khác nhau của cùng một địa điểm.
- Một sự kiện trong quá khứ để lại hậu quả ở tương lai dù ký ức về nó đã biến mất.
- Một nhân vật gặp phiên bản khác của chính mình.
- Một khu vực bị mắc kẹt trong vòng lặp.
- Một vật thể xuất hiện trước khi nguyên nhân tạo ra nó xảy ra.
- Những người thuộc các nhánh thực tại khác nhau cùng hiện diện trong một vùng.

## 2.5 Conceptual Erasure – Xóa bỏ khỏi khái niệm [CANON]

Conceptual Erasure là quá trình một cá thể, sự vật hoặc sự kiện dần bị xóa khỏi khả năng nhận thức và ghi nhận của thế giới. Quá trình này diễn ra **từ từ**, không phải biến mất tức thời:

1. Người khác bắt đầu quên những chi tiết nhỏ về đối tượng.
2. Tên, hình ảnh hoặc hồ sơ trở nên sai lệch.
3. Người thân không còn nhớ rõ mối quan hệ.
4. Vật chứng, thư từ, ảnh chụp và ghi chép bị biến đổi hoặc biến mất.
5. Mọi người không còn nhận ra sự thiếu vắng.
6. Cuối cùng, thế giới mất khả năng hình dung rằng đối tượng từng tồn tại.

## 2.6 Residual Existence – Dấu vết tồn tại [CANON]

Ngay cả khi một cá thể bị xóa khỏi nhận thức chung, đôi khi vẫn còn những dấu vết không thể giải thích:

- Một chiếc ghế trống luôn được để lại.
- Một bàn ăn có thêm một phần thức ăn.
- Một lá thư không có người nhận.
- Một căn phòng bị khóa nhưng không ai nhớ ai từng ở đó.
- Một bức ảnh có khoảng trống hoặc hình dạng bị nhòe.
- Một món đồ được giữ gìn dù chủ nhân đã bị quên.

Peter có khả năng nhận ra chúng tốt hơn người bình thường.

## 2.7 The Interval [DIRECTION / PROPOSAL]

The Interval là vùng không gian-thời gian liên quan đến các nhánh thực tại bị loại bỏ, bị bỏ dở hoặc không còn được duy trì. Nó chứa những mảnh thế giới, những phiên bản chưa thành hình và các thực thể không còn chỗ đứng trong dòng lịch sử chính. Gắn với Possibility và hành trình của Kuro.

## 2.8 The Null Hour [PROPOSAL]

Biến cố tương lai có thể khiến các dòng thời gian mất ranh giới hoặc sụp đổ vào nhau. Bản chất thật sự chưa được xác nhận: có thể là lời cảnh báo, cơ hội hoặc hệ quả tất yếu.

---

# 3. Nhân vật chính

## 3.1 Peter – The Unwritten [CANON Ở MỨC KHÁI NIỆM]

- Nam, người trưởng thành; tuổi đề xuất khoảng 26.
- Có nguồn gốc gắn với Khánh Hòa, Việt Nam trong phần mở đầu.
- Tóc xoăn curly ngắn-vừa tự nhiên có độ phồng, che phủ đều, không thẳng, không uốn lượn lỏng lẻo, không rũ dài che mặt, không undercut/cạo sát.
- Ngoại hình: 16-bit Pixel Art, stylized.
- Bản chất tồn tại: **Unwritten**.

### Bản chất Unwritten:

Peter không phải một con người bình thường được hệ thống sáu Divine Authorities ghi nhận đầy đủ. Sự tồn tại của anh không được ghi vào cấu trúc thế giới theo cách thông thường.
Khả năng:

- Nhận ra Residual Existence mà người khác bỏ qua.
- Nhìn thấy hoặc cảm nhận các dấu vết của Conceptual Erasure.
- Có khả năng cộng hưởng với Divine Authorities.
- Giữ lại một số ký ức mà thế giới đã mất.
- Tương tác với các dị thường theo cách người bình thường không thể.

_Lưu ý:_ Peter không đơn giản là vật chứa của sáu quyền năng. Anh có hành trình, ý chí và câu hỏi riêng. Bản chất Unwritten không khiến Peter bất tử hoặc miễn nhiễm tuyệt đối với việc bị xóa bỏ. Lý do Peter là Unwritten là bí ẩn trung tâm chưa được tiết lộ.

### Hành trình của Peter [DIRECTION]:

Kết hợp: Khôi phục những mảnh ký ức bị mất; Tìm hiểu nguồn gốc và bản chất Unwritten; Đối diện những người và thế giới bị xóa bỏ; Quyết định liệu trật tự hiện tại có xứng đáng được duy trì.

## 3.2 Kuro – The Forgotten One [CANON Ở MỨC KHÁI NIỆM]

- Kuro là bạn thời thơ ấu của Peter.
- Kuro là đối trọng tư tưởng của Peter, không phải nhân vật phản diện một chiều.
- **Xuất hiện trực tiếp lần đầu ở Chapter 4.**
- Có liên hệ với Possibility.
- Bị biến đổi bởi thời gian ở The Interval; việc sử dụng quyền năng Possibility khiến Kuro dần mất những ký ức ban đầu.

### Động cơ & Niềm tin cốt lõi:

Kuro muốn giải phóng những nhánh thực tại, những con người và những tồn tại đã bị bỏ lại hoặc xóa bỏ.

> _"Một thế giới được xây dựng trên sự hy sinh của vô số thế giới khác không phải là một thế giới đáng được bảo vệ."_

### Xung đột:

Peter muốn bảo vệ thế giới hiện hữu, nhưng đối diện với cái giá bất công mà nó tạo ra. Kuro muốn giải phóng thế giới bị bỏ rơi, nhưng hành động đó có nguy cơ làm sụp đổ ranh giới thực tại.

## 3.3 Lyra [PROPOSAL / DIRECTION]

- Nhân vật đồng hành Chapter 2 (Vanguard / Phản kháng).
- Thách thức hệ thống nhân quả bị áp đặt; có chuỗi nhiệm vụ cá nhân về sự tự do lựa chọn.

## 3.4 Neris [PROPOSAL / DIRECTION]

- Nhân vật đồng hành Chapter 3 (Archivist / Support).
- Gắn với Memory; bản thân không nhớ chính tên mình; hỗ trợ đọc và phân tích các ký ức bị ô nhiễm.

## 3.5 Chronos [CANON Ở MỨC KHÁI NIỆM]

- Vị thần cai quản trật tự thời gian. Không tiết lộ toàn bộ vai trò sớm.

## 3.6 The First Forgotten [PROPOSAL]

- Ý tưởng về thực thể đầu tiên bị Conceptual Erasure. Giữ dưới dạng hạt giống bí ẩn (mystery seed).

---

# 4. Cấu trúc gameplay kể chuyện

## 4.1 Bảy gameplay pillars [CANON]

1. **Exploration:** Khám phá bản đồ, địa điểm, lối đi bí mật và vật thể tương tác.
2. **Temporal Puzzle:** Giải đố bằng cách tương tác với các lớp thời gian.
3. **Investigation:** Thu thập manh mối, đọc tài liệu và tái dựng sự kiện.
4. **Narrative Choices:** Đối thoại và đưa ra lựa chọn có hệ quả.
5. **Turn-based Combat:** Chiến đấu theo lượt, solo hoặc cùng NPC.
6. **Objective Challenges:** Bảo vệ NPC, vận hành cơ chế, sinh tồn hoặc hoàn thành mục tiêu cụ thể.
7. **Branching Routes:** Tuyến đường phân nhánh, khu vực bí mật và kết quả khu vực khác nhau.

## 4.2 Solo và Party [DIRECTION]

- Peter có thể đi một mình hoặc đi cùng tối đa 2 NPC đồng hành (Party tối đa 3).
- NPC hỗ trợ mở lối đi, giải mã ký ức, kích hoạt cơ chế và tương tác chiến đấu. Kuro không vào party thông thường trước khi cốt truyện cho phép.

## 4.3 Phân cấp kẻ địch & giải quyết thử thách

- Common -> Elite -> Mini-Bosses -> Main Bosses.
- Không phải mọi trở ngại đều kết thúc bằng đánh boss. Có thể né tránh, giải đố, thương lượng, kích hoạt cơ chế hoặc bảo vệ.

## 4.4 EXP, vật phẩm và tiến trình [PROPOSAL / DIRECTION]

- Level cap đề xuất: 30 (Prologue cap 3).
- 5 bậc phẩm chất trang bị: Common, Uncommon, Rare, Epic, Legendary.
- Progression đa dạng, không ép người chơi phụ thuộc vào một build duy nhất.

---

# 5. Quy tắc thời gian & bản đồ

## 5.1 Temporal Layers [DIRECTION: HYBRID]

- Kết hợp các điểm Temporal Anchor (chuyển đổi có chủ đích) và một số vùng chuyển đổi cục bộ linh hoạt.

## 5.2 Continuity Rules

Khi chuyển đổi lớp thời gian, phải rõ ràng: địa hình nào đổi, vật thể nào xuất hiện/biến mất, NPC nào hiện diện, và hệ quả lưu lại. Phải có tín hiệu hình ảnh rõ ràng để người chơi biết đang ở thời điểm nào.

## 5.3 Hệ quả lựa chọn [DIRECTION: REGIONAL]

Lựa chọn chủ yếu ảnh hưởng cục bộ tới khu vực, NPC, questline và phần thưởng của vùng hiện tại, được quản lý bằng story flags rõ ràng.

---

# 6. Tóm tắt 6 chương và Prologue

### Prologue – The Last Memory

- **Địa điểm:** Thị trấn ven biển, Khánh Hòa, Việt Nam.
- **Trọng tâm:** Peter thức tỉnh; chiếc đồng hồ ngừng chạy; The Empty Seat; đứa trẻ bị lãng quên; khu rừng quên lãng; hải đăng cổ; The Drowned Sentinel.
- **Kết thúc:** Bản ghi Unwritten đầu tiên (Subject: UNWRITTEN, Recognition: Incomplete, Classification: Impossible).

### Chapter 1 – The Last Sunset

- **Authority:** Continuum.
- **Bối cảnh:** Làng chài bỏ hoang ven biển, ngọn hải đăng, tàn tích dưới nước.
- **Trọng tâm:** Các sự kiện lặp lại, chuỗi tiếp diễn bị gãy đứt; The Sunken Bellkeeper; Continuum Resonance.

### Chapter 2 – The Empire of False Causality

- **Authority:** Causality.
- **Bối cảnh:** Đế chế cổ đại mang cảm hứng La Mã với trật tự áp đặt.
- **Trọng tâm:** Lyra; các sự kiện bị gán trước kết quả; The Imperial Verdict; phát hiện lịch sử bị biên tập.

### Chapter 3 – The Kingdom of Forgotten Souls

- **Authority:** Memory.
- **Bối cảnh:** Vương quốc cổ đại lưu trữ ký ức người chết.
- **Trọng tâm:** Neris; ký ức nhiễm bẩn; The Nameless Choir; Peter nhận ra một số ký ức mình giữ không thuộc về mình.

### Chapter 4 – The War Without End

- **Authority:** Finality.
- **Bối cảnh:** Chiến trường vô tận không thể kết thúc.
- **Trọng tâm:** Tướng Aldric; lá thư chờ đợi; The Last War.
- **Cuộc gặp Kuro:** Diễn ra sau sự kiện lớn; câu thoại: _"Mày vẫn còn giữ thói quen tìm kiếm những thứ đã biến mất à?"_ / _"Mày đã hứa sẽ không quên tao."_

### Chapter 5 – The Garden of Infinite Possibilities

- **Authority:** Possibility.
- **Bối cảnh:** The Interval – nơi chứa các nhánh thực tại bị bỏ rơi.
- **Trọng tâm:** Kuro cố gắng giải phóng các nhánh nhưng gây sụp đổ; The Other Peter; The Unborn King.

### Chapter 6 – The Hour of the Gods

- **Authority:** Origin.
- **Bối cảnh:** Celestial Realm đổ nát.
- **Trọng tâm:** Đối đầu ba bên (Peter, Kuro, Chronos); The Sixfold Divinity; giải thích về Unwritten và Null Hour; đưa ra quyết định tối hậu.

---

# 7. Các hướng kết thúc [PROPOSAL]

1. **The Eternal Order:** Khôi phục trật tự Chronos, bảo vệ thế giới hiện hữu nhưng tiếp tục bỏ rơi các thế giới bị xóa.
2. **The Unbound Eternity:** Đứng về phía Kuro giải phóng mọi thực tại, đối mặt với nguy cơ sụp đổ ranh giới.
3. **The Last Chronarch (True Ending):** Tái phân phối 6 quyền năng, thiết lập cân bằng mới; Peter trở thành temporal anchor.

---

# 8. Continuity Rules (Quy tắc bất biến)

1. Không cho Kuro xuất hiện trực tiếp trước Chapter 4.
2. Không tiết lộ toàn bộ nguồn gốc Peter sớm.
3. Conceptual Erasure diễn ra từ từ, không tức thời.
4. Không mô tả mọi Seal holder hay dị thường là thuần ác.
5. Chronos và Kuro đều có động cơ sâu sắc, không đơn chiều.
6. Giữ nguyên 6 Divine Authorities.
7. Giữ vững ngoại hình Peter theo `docs/art/PETER_DESIGN.md`.
8. Mọi ý tưởng mới phải đánh dấu PROPOSAL.
