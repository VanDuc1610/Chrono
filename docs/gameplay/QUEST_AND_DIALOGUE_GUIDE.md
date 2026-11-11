# QUEST AND DIALOGUE GUIDE

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Content Schemas & Writing Directives  
**Parent Document:** `docs/story/CHRONO_STORY_BIBLE.md` §15 & §17

---

## 1. Decoupled Content Architecture

Theo quy định kiến trúc của dự án, **tuyệt đối không hardcode hội thoại, định nghĩa nhiệm vụ, hay các chỉ số câu chuyện vào mã nguồn Scene hoặc Entity**.

Toàn bộ nội dung kể chuyện phải sống trong các tệp JSON dữ liệu tại:

- `public/assets/data/dialogue.json`
- `public/assets/data/quests.json`
- `public/assets/data/interactables.json`

---

## 2. Dialogue Data Specification

Mỗi node hội thoại trong `dialogue.json` phải tuân thủ cấu trúc sau:

```json
{
  "id": "npc_elder_farewell",
  "speaker": "Elder Chronographer",
  "lines": [
    "The rift has subsided... The fracture sleeps, if only for a time.",
    "Go forth, Peter. The truth of your unwritten fate lies beyond the Threshold Gates."
  ],
  "responses": [
    {
      "text": "I will find the truth.",
      "nextDialogueId": null
    }
  ],
  "effects": {
    "setFlags": ["prologue_elder_farewell_spoken"],
    "startQuest": "quest_chapter1_journey",
    "grantItems": [{ "itemId": "chrono_shard_minor", "quantity": 1 }],
    "grantOnceFlag": "claimed_elder_farewell_gift"
  }
}
```

### Declarative Effects Engine

- `setFlags`: Mảng các string cờ cần bật lên `true` trong `GameSession`.
- `startQuest`: ID quest tự động kích hoạt.
- `grantItems`: Danh sách vật phẩm được chuyển vào Satchel (kèm thông báo HUD).
- `grantOnceFlag`: Cờ bảo vệ để ngăn chặn việc nhận quà lặp lại khi người chơi nói chuyện nhiều lần.

---

## 3. Quest Data Specification

Mỗi quest trong `quests.json` gồm các trường chuẩn:

```json
{
  "id": "quest_prologue_awakening",
  "title": "Echoes in the Fracture",
  "description": "Awaken in the shattered sanctuary and speak with the Elder Chronographer.",
  "stage": "started",
  "followUpQuestId": "quest_prologue_silence",
  "objectives": [
    {
      "id": "obj_speak_elder",
      "description": "Speak with the Elder Chronographer",
      "completed": false
    },
    {
      "id": "obj_inspect_altar",
      "description": "Inspect the Altar of Moments",
      "completed": false
    }
  ],
  "rewards": {
    "exp": 20,
    "items": [{ "itemId": "chrono_shard_minor", "quantity": 1 }]
  }
}
```

---

## 4. Story Flags Conventions

Tất cả các cờ câu chuyện (Story Flags) phải sử dụng quy chuẩn đặt tên rõ ràng, mang tính biểu đạt cao:

- Dạng cú pháp: `<chapter>_<subject>_<action_or_state>`
- Ví dụ:
  - `prologue_awakening_triggered`
  - `prologue_shade_defeated`
  - `chapter2_lyra_recruited`
  - `chapter4_kuro_first_confrontation_done`
- **Cấm:** Không sử dụng nhãn hiển thị hoặc chuỗi ngẫu nhiên làm ID. Không sửa tên flag cũ nếu chưa cập nhật SaveSystem migration.
