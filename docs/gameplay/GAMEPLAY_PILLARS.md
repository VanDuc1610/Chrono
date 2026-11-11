# GAMEPLAY PILLARS

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Gameplay Architecture & Design Philosophy  
**Parent Document:** `docs/story/CHRONO_STORY_BIBLE.md` §4.1 & §10

---

## 1. The Seven Core Pillars [CANON]

CHRONO is not a generic hack-and-slash RPG. Every scene and system is designed around seven distinct but interwoven pillars:

```
                  ┌───────────────────────────────┐
                  │ 1. EXPLORATION                │
                  │ (Top-down world, secret paths)│
                  └──────────────┬────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
┌────┴─────────────────┐ ┌───────┴──────────────┐ ┌──────────┴─────────────┐
│ 2. TEMPORAL PUZZLE   │ │ 3. INVESTIGATION     │ │ 4. NARRATIVE CHOICES   │
│ (Time-layer mechanics│ │ (Residual clue hunt) │ │ (Regional consequences)│
└────┬─────────────────┘ └───────┬──────────────┘ └──────────┬─────────────┘
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     │                           │                           │
┌────┴─────────────────┐ ┌───────┴──────────────┐ ┌──────────┴─────────────┐
│ 5. TURN-BASED COMBAT │ │ 6. OBJECTIVE         │ │ 7. BRANCHING ROUTES    │
│ (Tactical turn order)│ │    CHALLENGES        │ │ (Secret endings/lore)  │
└──────────────────────┘ └──────────────────────┘ └────────────────────────┘
```

### Pillar 1: Exploration

- Top-down 2D camera exploration with smooth grid/subgrid movement.
- Interacting with objects, reading ancient steles, inspecting ruined altars, exploring side alleys.

### Pillar 2: Temporal Puzzle

- Interacting with different time layers to alter paths and bypass obstacles.
- A collapsed bridge in the present may be intact in the past; an unopenable gate in the past can be bypassed through a breach formed in the future.

### Pillar 3: Investigation

- Tìm kiếm manh mối về những người và sự vật bị xóa bởi Conceptual Erasure.
- Phân tích nhật ký, thư từ rách trang, ảnh thờ nhòe mờ, và lời kể mâu thuẫn của các nhân chứng.

### Pillar 4: Narrative Choices

- Đối thoại có chiều sâu mang lại các hệ quả khu vực (Regional consequences).
- Người chơi quyết định giúp đỡ ai, khôi phục ký ức nào, và đối mặt với cái giá đạo đức của từng hành động.

### Pillar 5: Turn-based Combat

- Chiến đấu theo lượt chiến thuật với thước đo sáng tạo (MP/Skills/Items/Defend/Escape).
- Có thể chiến đấu solo hoặc hỗ trợ tối đa 2 NPC đồng hành (Party tối đa 3).

### Pillar 6: Objective Challenges

- Không phải mọi thử thách đều là tiêu diệt quái vật:
  - Bảo vệ NPC thoát khỏi vùng sụp đổ thời gian.
  - Vận hành cơ chế phong ấn trong khi cầm chân kẻ địch.
  - Sống sót qua một số lượt nhất định trước khi cổng dịch chuyển mở.
  - Thu thập cổ vật trước khi vết nứt nuốt chửng khu vực.

### Pillar 7: Branching Routes

- Các ngã rẽ ẩn giấu phần thưởng, tàn tích ký ức, và mở khóa các điều kiện kết thúc đặc biệt (True Ending).

---

## 2. Design Synergy

Khi thiết kế một nhiệm vụ (Quest) hoặc màn chơi (Map):

1. **Không lặp công thức:** Một nhiệm vụ có thể bắt đầu bằng điều tra (Pillar 3), dẫn đến câu đố thời gian (Pillar 2), kích hoạt một trận chiến bất ngờ (Pillar 5) và kết thúc bằng một lựa chọn đạo đức (Pillar 4).
2. **Tránh biến game thành chuỗi đánh boss đơn điệu:** Các thử thách cần đa dạng hóa cách giải quyết (thương lượng, phá hủy cơ chế môi trường, hoặc né tránh).
