# CHRONO DOCUMENTATION HUB

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Engine:** Phaser 3 (v3.90.0) | TypeScript 5.8 | Vite 6  
**Architecture:** Modular Documentation System

---

## 1. Documentation Structure

Hệ thống tài liệu dự án được tổ chức thành 4 phân hệ mô-đun hóa, giúp coding agent nạp ngữ cảnh tối thiểu với chi phí token thấp nhất mà không làm loãng thông tin:

```text
docs/
├── README.md                               # Trang mục lục điều hướng chính (file này)
├── PROJECT_CONTEXT.md                      # Bức tranh kỹ thuật và quy chuẩn phát triển tổng thể
├── TASKS.md                                # Bảng quản lý task & phân quyền file lock giữa các agent
│
├── story/                                  # Phân hệ cốt truyện và nhân vật
│   ├── CHRONO_STORY_BIBLE.md               # [MASTER] Tài liệu tham chiếu cốt truyện cấp cao
│   ├── LORE_AND_COSMOLOGY.md               # Chronos, 6 Authorities, Conceptual Erasure, The Interval
│   ├── CHARACTER_BIBLE.md                  # Peter (Unwritten, Hairstyle Lock), Kuro, Lyra, Neris
│   ├── STORY_PROLOGUE.md                   # Kịch bản Prologue – The Last Memory
│   ├── STORY_CHAPTER_01.md                 # Kịch bản Chapter 1 – The Last Sunset (Continuum)
│   ├── STORY_CHAPTER_02.md                 # Kịch bản Chapter 2 – The Empire of False Causality (Causality)
│   ├── STORY_CHAPTER_03.md                 # Kịch bản Chapter 3 – The Kingdom of Forgotten Souls (Memory)
│   ├── STORY_CHAPTER_04.md                 # Kịch bản Chapter 4 – The War Without End (Finality, Kuro)
│   ├── STORY_CHAPTER_05.md                 # Kịch bản Chapter 5 – The Garden of Infinite Possibilities (Possibility)
│   ├── STORY_CHAPTER_06.md                 # Kịch bản Chapter 6 – The Hour of the Gods (Origin, Finale)
│   ├── CANON_AND_OPEN_QUESTIONS.md         # Sổ đăng ký phân cấp CANON, DIRECTION, PROPOSAL, OPEN
│   └── CHANGELOG.md                        # Nhật ký các thay đổi về cốt truyện và tài liệu
│
├── gameplay/                               # Phân hệ cơ chế và thiết kế gameplay
│   ├── GAMEPLAY_PILLARS.md                 # 7 trụ cột thiết kế cốt lõi
│   ├── TEMPORAL_WORLD_DESIGN.md            # Thiết kế thế giới thời gian lai (Hybrid Layers & Continuity)
│   ├── QUEST_AND_DIALOGUE_GUIDE.md         # Quy chuẩn dữ liệu JSON, effects engine và story flags
│   ├── COMBAT_DESIGN.md                    # Thiết kế chiến đấu theo lượt, thứ tự tốc độ, boss
│   └── PROGRESSION_DESIGN.md               # Cấp độ (Level caps), EXP, 5 bậc phẩm chất trang bị
│
├── architecture/                           # Phân hệ quy chuẩn tác vụ và giao thức agent
│   ├── DOCUMENTATION_AUDIT.md              # Báo cáo kiểm kê và phân tích tài liệu
│   ├── DOCUMENTATION_MAP.md                # Ma trận phân luồng nạp tài liệu theo loại tác vụ (BẮT BUỘC ĐỌC)
│   └── AGENT_CONTEXT_PROTOCOL.md           # Giao thức nạp context tiết kiệm token cho đa agent
│
└── implementation/                         # Phân hệ lộ trình phát triển
    └── IMPLEMENTATION_ROADMAP.md           # Lộ trình kỹ thuật các cột mốc M1 - M6
```

---

## 2. Hướng dẫn nhanh cho Coding Agent

> [!IMPORTANT]
> Trước khi bắt đầu bất kỳ tác vụ nào, agent **PHẢI** đọc [`docs/architecture/DOCUMENTATION_MAP.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/docs/architecture/DOCUMENTATION_MAP.md) để biết chính xác chỉ cần mở tài liệu nào và **TUYỆT ĐỐI KHÔNG ĐƯỢC MỞ** tài liệu nào.
