# COMBAT DESIGN

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Tactical Turn-Based Combat Reference  
**Parent Document:** `docs/story/CHRONO_STORY_BIBLE.md` §4.2, §4.3 & §10  
**Implementation Source:** `src/systems/combat/`, `public/assets/data/enemies.json`, `public/assets/data/player.json`

---

## 1. Combat Philosophy

Chiến đấu trong CHRONO phục vụ cho nhịp điệu kể chuyện và xây dựng bầu không khí dark fantasy/huyền ảo. Trò chơi không ép người chơi phải cày cuốc (grind) liên tục mà tập trung vào tính chiến thuật và hiểu cơ chế.

---

## 2. Core Mechanics

1. **Speed-Based Initiative (Thứ tự lượt theo tốc độ):**
   - Đơn vị nào có chỉ số `speed` cao hơn sẽ hành động trước trong lượt đấu.
2. **Action Economy (Lựa chọn hành động):**
   - **[1] ATTACK (Tấn công thường):** Chém bằng Broken Blade, gây sát thương vật lý cơ bản.
   - **[2] SKILL (Kỹ năng thời gian):** Kỹ năng đặc biệt tiêu hao MP (ví dụ: _Temporal Strike_ tốn 6 MP). Nếu không đủ MP, người chơi không bị mất lượt.
   - **[3] ITEM (Vật phẩm cứu thương):** Dùng vật phẩm hồi phục trực tiếp từ Satchel (ví dụ: _Minor Chrono Shard_ hồi 30 HP). Nếu hết vật phẩm, lượt đấu không bị tiêu tốn.
   - **[4] DEFEND (Phòng thủ):** Giảm 50% sát thương nhận vào trong vòng đấu tiếp theo.
   - **[5] ESCAPE (Tháo chạy):** Tỉ lệ tháo chạy thành công tính toán dựa trên độ chênh lệch chỉ số tốc độ. Nếu chạy trốn thất bại, người chơi mất lượt.

---

## 3. Party Structure [DIRECTION]

- **Party Size:** Tối đa 3 thành viên (Peter + tối đa 2 NPC đồng hành).
- **NPC Roles:**
  - _Vanguard (ví dụ: Lyra):_ Che chắn, phản đòn, hút sát thương.
  - _Support / Archivist (ví dụ: Neris):_ Cường hóa kỹ năng, hồi MP, phân tích điểm yếu của đối thủ.
- **Quy tắc tuyệt đối:** Kuro không tham gia vào đội hình chiến đấu thông thường của người chơi trước khi kịch bản cho phép.

---

## 4. Enemy Hierarchy & Boss Philosophy

| Cấp bậc            | Đặc điểm                                                               | Phương thức giải quyết                                                                     |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Common Enemies** | Quái vật dị thường thông thường (Temporal Shade, Drowned Creature).    | Đánh bại nhanh qua tấn công và kỹ năng.                                                    |
| **Elite Enemies**  | Kẻ địch có kỹ năng đặc biệt, giáp dày hoặc khả năng phản đòn.          | Cần khai thác điểm yếu hoặc dùng kỹ năng khống chế.                                        |
| **Mini-Bosses**    | Thủ lĩnh gắn với khu vực (The Sunken Bellkeeper, The Exiled Praetor).  | Đòi hỏi phối hợp kỹ năng và hiểu nhịp đòn của boss.                                        |
| **Main Bosses**    | Hiện thân của các thế lực vũ trụ hoặc người giữ phong ấn Divine Seals. | Thử thách phức tạp gồm nhiều giai đoạn (phases) gắn liền với giải đố và cơ chế môi trường. |

_Lưu ý:_ Một số boss có thể được vượt qua bằng cách giải đố, vô hiệu hóa cơ chế, bảo vệ mục tiêu, hoặc thương lượng đạo đức thay vì chỉ bào mòn HP.
