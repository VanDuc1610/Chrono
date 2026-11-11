# STORY PROLOGUE – THE LAST MEMORY

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Narrative & Chapter Specification: Prologue  
**Parent Document:** `docs/story/CHRONO_STORY_BIBLE.md` §6  
**Implementation References:** `public/assets/data/dialogue.json`, `public/assets/data/quests.json`, `docs/narrative/PROLOGUE_CONTENT_PROPOSAL.md`

---

## 1. Chapter Overview

- **Title:** The Last Memory (Ký Ức Cuối Cùng)
- **Setting:** Thị trấn ven biển, Khánh Hòa, Việt Nam & Shattered Antechamber (Altar of Moments).
- **Core Theme:** Sự thức tỉnh, các dấu vết tồn tại sót lại (Residual Existence), và nỗi đau của sự lãng quên.
- **Narrative Reveal:** Peter nhận thức được bản thân là **UNWRITTEN** và thế giới đang bị xói mòn khái niệm.

---

## 2. Key Locations

1. **Peter's Room:** Nơi Peter tỉnh giấc cùng chiếc đồng hồ ngừng chạy, cuốn sổ rách trang, bức ảnh có bóng người nhòe mờ, và chiếc chìa khóa không rõ chủ.
2. **Coastal Town:** Thị trấn ven biển bình lặng nhưng ẩn chứa sự phi lý: người bán hàng chuẩn bị 2 phần ăn cho 1 khách; căn nhà trống bị mọi người phủ nhận sự tồn tại.
3. **The Forgotten Forest:** Khu rừng ven biển với những lối đi dị thường thời gian.
4. **Shattered Antechamber (Sanctuary):** Không gian đền đài cổ đổ nát lưu giữ Altar of Moments, nơi tàn dư rạn nứt thời gian tụ họp.
5. **The Old Lighthouse:** Ngọn hải đăng cổ nơi người gác đèn chứng kiến sự rạn nứt mà không nhớ trọn vẹn.

---

## 3. Quests & Narrative Beats

### Main Story Beats

- **Quest 1: Echoes in the Fracture (`quest_prologue_awakening`):**
  - Peter thức dậy tại Shattered Antechamber.
  - Nói chuyện với Elder Chronographer (`obj_speak_elder`).
  - Kiểm tra Altar of Moments (`obj_inspect_altar`).
- **Quest 2: Silence the Fracture (`quest_prologue_silence`):**
  - Đối đầu và trấn áp mối đe dọa dị thường: Temporal Shade (`enemy_temporal_shade`).
  - Đạt cấp độ 2, thu hồi Minor Chrono Shard.
- **Elder's Farewell & Prologue End:**
  - Sau khi phong ấn dị thường, Elder Chronographer nói lời tiễn biệt (`npc_elder_farewell`).
  - Chuyển cảnh sang màn hình tổng kết `PrologueEndScene`.

### Environmental POIs & Side Content (`quest_prologue_remnants`)

_(Theo đề xuất đã duyệt trong `docs/narrative/PROLOGUE_CONTENT_PROPOSAL.md`)_:

- **I-1: Bia khắc Sáu Quyền Năng (`stele_six_authorities`):** Bắt đầu quest phụ, hé lộ biểu tượng Origin, Continuum, Causality, Memory, Possibility, Finality.
- **I-2: Cột đá ký ức bị xóa (`pillar_memory_erasure`):** Dấu tích của Conceptual Erasure.
- **I-3: Trang sổ tay thất lạc (`notebook_loose_leaf`):** Phương trình thời gian bí ẩn của Peter.
- **I-4: Hỗn thiên nghi đóng băng (`astrolabe_inspection`):** Cho vật phẩm `ancient_gear`.
- **I-5: Hòm di vật rạn nứt (`reliquary_search`):** Thưởng `chrono_shard_minor`.
- **I-6: Cổng ngưỡng niêm phong (`threshold_gates_inspection`):** Điểm mở đường cho Chapter 1.
- **I-7: Dư chấn vết nứt (`rift_echo_attune`):** Cộng hưởng năng lượng thời gian (+15 EXP).

---

## 4. Encounters & Bosses

- **Hostile Anomaly:** **Temporal Shade** (`MOB_SHADE_001` / `enemy_fracture`). Sinh thể trôi dạt từ vết nứt.
- **Main Guardian (Proposed Expansion):** **The Drowned Sentinel**. Người bảo vệ ngọn hải đăng bị kẹt trong dòng thời gian. Thử thách giải quyết bằng cơ chế và môi trường hơn là sát thương đơn thuần.

---

## 5. Chapter Climax & Handoff Beat

Peter tiếp nhận ghi chép cổ tại cổng dịch chuyển:

> **Subject:** UNWRITTEN  
> **Recognition:** Incomplete  
> **Classification:** Impossible

Peter bước qua Cổng Ngưỡng (Threshold Gates) tiến vào Chapter 1 để tìm hiểu chân tướng.
