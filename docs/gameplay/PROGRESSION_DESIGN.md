# PROGRESSION DESIGN

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Stats, Progression, Equipment & Inventory  
**Parent Document:** `docs/story/CHRONO_STORY_BIBLE.md` §4.4  
**Data Reference:** `public/assets/data/player.json`, `public/assets/data/items.json`

---

## 1. Character Level & Experience (EXP)

### Level Caps

- **Prologue Vertical Slice Cap:** Cấp **3** (Đã khóa canon trong Prologue).
  - Ngưỡng EXP: `[0, 50, 120]`. Khi đạt cấp 3, thanh kinh nghiệm hiển thị `EXP 120/MAX`.
- **Full Game Level Cap [PROPOSAL]:** Cấp **30**.

### Level Up Mechanics

- Khi thăng cấp, Peter được hồi đầy toàn bộ HP và MP ngay lập tức.
- Chỉ số cơ bản gia tăng:
  - Max HP: `50` cơ bản ở Lv1, tăng theo `player.json`.
  - Max MP: `20` cơ bản ở Lv1, `+4 MP` mỗi cấp độ.

---

## 2. Inventory & Satchel System

- **Dung lượng:** 16 ô chứa vật phẩm.
- **Phân loại vật phẩm (Item Categories):**
  1. `consumable`: Vật phẩm tiêu hao có thể dùng trong chiến đấu hoặc ngoài bản đồ (ví dụ: _Minor Chrono Shard_ hồi 30 HP).
  2. `material`: Nguyên liệu cổ đại dùng để chế tác hoặc mở khóa câu đố (ví dụ: _Ancient Gear_).
  3. `equipment`: Vũ khí, áo giáp, và phụ kiện thời gian.
  4. `key_item`: Cổ vật và vật phẩm nhiệm vụ không thể bán hoặc vứt bỏ (ví dụ: _Broken Chronometer_).

---

## 3. Equipment Tiers [PROPOSAL]

Vật phẩm và trang bị được phân thành 5 bậc phẩm chất:

1. **Common (Trắng / Xám):** Đồ dùng cơ bản, rỉ sét.
2. **Uncommon (Xanh lá):** Chế tác tốt, có chỉ số phụ nhỏ.
3. **Rare (Xanh dương / Cerulean):** Thấm nhuần năng lượng thời gian, mở khóa hiệu ứng phụ.
4. **Epic (Tím):** Di vật của các nền văn minh cổ đại, tăng cường chỉ số đột phá.
5. **Legendary (Vàng kim):** Thần khí cộng hưởng trực tiếp với sáu Divine Authorities.
