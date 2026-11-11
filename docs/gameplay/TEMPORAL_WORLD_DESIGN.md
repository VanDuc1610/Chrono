# TEMPORAL WORLD DESIGN

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Spatial & Temporal Architecture  
**Parent Document:** `docs/story/CHRONO_STORY_BIBLE.md` §5 & §7

---

## 1. Hybrid Temporal Model [DIRECTION]

CHRONO không sử dụng mô hình du hành thời gian hoàn toàn tự do (free-roaming time travel) để tránh vỡ logic kịch bản, cũng không cố định mỗi chương vào một thời kỳ cứng nhắc. Thay vào đó, trò chơi áp dụng **Mô hình Lai (Hybrid Model)**:

1. **Temporal Anchors (Mỏ neo thời gian):**
   - Các cột mốc / tế đàn cổ cố định trên bản đồ nơi người chơi chủ động kích hoạt chuyển đổi giữa các lớp thời gian lớn (ví dụ: Quá khứ, Sụp đổ, Hiện tại).
2. **Local Temporal Shifts (Vùng dịch chuyển cục bộ):**
   - Một số căn phòng, vết nứt rò rỉ hoặc thảm thực vật đặc biệt cho phép bước qua lại giữa các thời kỳ mà không cần tương tác mỏ neo.

---

## 2. Continuity Rules across Layers

Khi chuyển đổi giữa các lớp thời gian tại một khu vực, hệ thống phải tuân thủ nghiêm ngặt 6 câu hỏi kiểm định:

1. **Địa hình (Terrain):** Lớp đất đá, tường thành, cây cầu nào thay đổi hoặc sụp đổ?
2. **Vật thể (Objects & Props):** Vật phẩm nào xuất hiện ở quá khứ và để lại tàn tích ở hiện tại?
3. **Cư dân (NPCs & Entities):** NPC nào tồn tại ở từng thời điểm? Họ có nhớ cuộc gặp ở thời điểm khác không?
4. **Hệ quả lưu giữ (Persistence):** Hành động kích hoạt cơ chế ở quá khứ có mở khóa cánh cổng ở hiện tại không?
5. **Cơ chế chống khai thác (Anti-Exploit):** Điều gì ngăn cản người chơi chuyển lớp thời gian liên tục để bỏ qua quái vật hoặc bẫy?
6. **Tín hiệu hình ảnh (Readability):** Bảng màu, ánh sáng, bộ lọc và hiệu ứng âm thanh phải thay đổi rõ rệt để người chơi lập tức nhận biết mình đang ở lớp thời gian nào.

---

## 3. Regional Consequences [DIRECTION]

Các lựa chọn của người chơi chủ yếu tạo ra hệ quả cấp **Khu vực (Regional)**:

- Thay đổi thái độ của NPC trong khu vực hiện tại.
- Mở khóa hoặc đóng lại các nhiệm vụ phụ của vùng.
- Biến đổi cảnh quan hoặc số lượng quái vật khi người chơi quay lại khu vực đó trong các chương sau.
- Tất cả hệ quả được lưu trữ bằng các **Story Flags** rõ ràng trong `GameSession` (ví dụ: `flags.chapter1_bellkeeper_freed = true`).
