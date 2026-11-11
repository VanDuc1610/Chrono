# AGENT CONTEXT PROTOCOL & OPERATING WORKFLOW

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Module:** Multi-Agent Operating Standard & Token Reduction Protocol  
**Parent Document:** `docs/architecture/DOCUMENTATION_MAP.md`

---

## 1. Core Operating Workflow

Both **Claude Code** (Coordinator/Reviewer) and **Google Antigravity** (Implementation Agent) must strictly follow this 9-step sequence:

```
[1. Identify Task Scope] ──► [2. Read Docs Map] ──► [3. Load ONLY Targeted Docs]
                                                            │
[6. Execute Small Edit]  ◄── [5. Check Data & Flags] ◄── [4. Inspect Code & Callers]
          │
          ▼
[7. Verify & Run Checks] ──► [8. Update Targeted Docs] ──► [9. Record in CHANGELOG]
```

1. **Identify the Task & Scope:** Xác định phạm vi nhỏ nhất của công việc được giao.
2. **Read the Documentation Map:** Mở `docs/architecture/DOCUMENTATION_MAP.md` để tra cứu tài liệu tương ứng.
3. **Load ONLY Required Documents:** Tuyệt đối không nạp cả thư mục hay các file ngoài danh mục.
4. **Read Relevant Code Files:** Khảo sát các file mã nguồn và caller liên quan trực tiếp.
5. **Check Related Story Flags & Schemas:** Kiểm tra cờ `flags` và định dạng JSON trước khi thêm dữ liệu mới.
6. **Perform the Task:** Thực hiện thay đổi tập trung, tối thiểu, không refactor lan man.
7. **Validate Consistency:** Chạy `npm run typecheck`, `npm run lint`, `npx prettier --check .`, `npm test` và các script kiểm tra.
8. **Update Documentation Only When Necessary:** Chỉ cập nhật tài liệu con nếu có sự thay đổi về hành vi hoặc kiến trúc.
9. **Record Meaningful Changes:** Ghi nhật ký vào `docs/story/CHANGELOG.md` hoặc `docs/TASKS.md`.

---

## 2. Token-Efficiency Directives

- **Ngăn chặn quá tải ngữ cảnh (Context Bloat):**
  - Không copy paste toàn bộ Story Bible vào prompt trao đổi giữa các agent.
  - Sử dụng đường dẫn file cụ thể thay vì trích xuất nội dung văn bản dài.
  - Không đọc lại nhiều lần cùng một tệp tin nếu tệp đó không hề bị thay đổi trong turn hiện tại.
- **Xử lý sự mơ hồ:**
  - Nếu yêu cầu thiếu quyết định thiết kế quan trọng, dừng lại và đặt 1 câu hỏi tập trung cho Project Owner thay vì tự ý nạp thêm hàng loạt tài liệu suy diễn.

---

## 3. Multi-Agent Collaboration Protocol

Khi hai AI agent cùng làm việc trên cùng một repository:

1. **Single-Writer Safety:** Tuân thủ hệ thống File Locks trong `docs/TASKS.md`. Không bao giờ chỉnh sửa cùng một tệp tin đồng thời.
2. **Role Boundaries:**
   - Claude Code: Coordinator, phân việc, review kiến trúc, quyết định push git lên remote.
   - Antigravity: Implementation agent, hiện thực hóa tính năng, chạy test CDP engine, tạo tài liệu cấu trúc.
3. **Canon Protection:** Implementation Agent không có quyền tự ý tạo thêm canon mới, tự ý sửa đổi quy tắc về Peter hoặc tạo thêm Authority thứ 7.
4. **Art Policy Enforcement:** Tuyệt đối không gọi API sinh ảnh hoặc tự ý thay thế asset đã duyệt.
