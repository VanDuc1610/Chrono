# DOCUMENTATION MAP

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Context Loading & File Routing Reference  
**Parent Document:** `docs/architecture/AGENT_CONTEXT_PROTOCOL.md`

---

## 1. Quick Task Routing Table

Coding agents MUST consult this routing table before opening files. Load ONLY the required documents listed for your task category to prevent token exhaustion and narrative drift.

| Nhiệm vụ (Task Type)                                     | Tài liệu BẮT BUỘC đọc (Must Read)                                                                        | Tài liệu TUYỆT ĐỐI KHÔNG đọc (Do NOT Read)                            |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Chỉnh sửa Peter (Art, Stats, Identity)**               | `docs/story/CHARACTER_BIBLE.md` + `docs/art/PETER_DESIGN.md`                                             | Các file chương 1-6, `LORE_AND_COSMOLOGY.md`, toàn bộ Story Bible.    |
| **Triển khai Prologue (Quests, NPC, Map)**               | `docs/story/STORY_PROLOGUE.md` + `docs/gameplay/QUEST_AND_DIALOGUE_GUIDE.md`                             | `STORY_CHAPTER_01.md` đến `06.md`, combat formulas.                   |
| **Triển khai Chapter 1 (Continuum)**                     | `docs/story/STORY_CHAPTER_01.md` + `docs/gameplay/TEMPORAL_WORLD_DESIGN.md`                              | `STORY_CHAPTER_02.md` đến `06.md`, Kuro lore.                         |
| **Triển khai Chapter 2 (Causality, Lyra)**               | `docs/story/STORY_CHAPTER_02.md` + phần Lyra trong `CHARACTER_BIBLE.md` + `QUEST_AND_DIALOGUE_GUIDE.md`  | Các chương khác, toàn bộ Story Bible, code engine không liên quan.    |
| **Triển khai Chapter 3 (Memory, Neris)**                 | `docs/story/STORY_CHAPTER_03.md` + phần Neris trong `CHARACTER_BIBLE.md` + `QUEST_AND_DIALOGUE_GUIDE.md` | Các chương khác, combat AI, art guidelines.                           |
| **Triển khai Chapter 4 (Finality, Kuro)**                | `docs/story/STORY_CHAPTER_04.md` + phần Kuro trong `CHARACTER_BIBLE.md` + `COMBAT_DESIGN.md`             | `STORY_CHAPTER_01` đến `03`, `05`, `06`.                              |
| **Triển khai Chapter 5 (Possibility, The Interval)**     | `docs/story/STORY_CHAPTER_05.md` + `LORE_AND_COSMOLOGY.md`                                               | Các chương 1-4, technical asset pipeline.                             |
| **Triển khai Chapter 6 (Origin, Finale)**                | `docs/story/STORY_CHAPTER_06.md` + `CANON_AND_OPEN_QUESTIONS.md`                                         | Các tài liệu art pipeline, testing suites.                            |
| **Cơ chế chuyển đổi lớp thời gian (Temporal switching)** | `docs/gameplay/TEMPORAL_WORLD_DESIGN.md` + `docs/story/LORE_AND_COSMOLOGY.md`                            | `CHARACTER_BIBLE.md`, `COMBAT_DESIGN.md`, các kịch bản chương cụ thể. |
| **Hệ thống chiến đấu (Combat Scene, Turn-based logic)**  | `docs/gameplay/COMBAT_DESIGN.md` + `TECHNICAL_DESIGN.md` §Combat                                         | Toàn bộ các file `STORY_*.md`, `CHARACTER_BIBLE.md`.                  |
| **Túi đồ, EXP, Vật phẩm, Level progression**             | `docs/gameplay/PROGRESSION_DESIGN.md` + `public/assets/data/items.json`                                  | Các file story, lore, art prompt files.                               |
| **Viết hội thoại và thiết kế Story Flags**               | `docs/gameplay/QUEST_AND_DIALOGUE_GUIDE.md` + file chapter tương ứng                                     | Combat engine, asset shaders, toàn bộ Story Bible.                    |
| **Sửa đổi hoặc xác thực Story Canon**                    | `docs/story/CHRONO_STORY_BIBLE.md` + `docs/story/CANON_AND_OPEN_QUESTIONS.md`                            | Code files, test scripts, sprite generators.                          |
| **Sửa lỗi Build, Typecheck, Test bug**                   | Output thông báo lỗi + code files trực tiếp                                                              | **KHÔNG nạp bất kỳ file lore/story nào.**                             |

---

## 2. Global "Do Not Load" Directives

1. **Never load `docs/story/CHRONO_STORY_BIBLE.md` for routine implementation tasks.** Use the dedicated modular file (`LORE_AND_COSMOLOGY.md`, `CHARACTER_BIBLE.md`, `STORY_*.md`).
2. **Never load all six chapter documents simultaneously.** A task only targets one chapter at a time.
3. **Never load narrative documentation for purely technical tasks** (ví dụ: tối ưu hiệu năng render, sửa cấu hình Vite, sửa lỗi TypeScript, setup CI).
