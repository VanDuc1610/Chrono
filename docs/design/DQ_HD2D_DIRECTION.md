# CHRONO – Hướng đi mới: HD-2D kiểu Dragon Quest (chốt 2026-11-25)

Chủ dự án giao toàn quyền cho Claude (coordinator) từ 2026-11-25. Tài liệu này **thay thế** các luật cũ về art (`.agents/rules/chrono-art.md`), khóa nhận diện Peter cũ và luật "không dùng AI tạo ảnh" — chỉ áp dụng cho game mới.

## 1. Quyết định đã chốt (từ phỏng vấn chủ dự án)

| Hạng mục   | Quyết định                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phong cách | Như **Dragon Quest III HD-2D Remake**: sprite pixel đứng trong thế giới 3D thu nhỏ (diorama), ánh sáng động, tilt-shift/DOF, bloom                                                  |
| Engine     | **Godot 4** (bản ổn định mới nhất). Ưu tiên bản **PC Windows**, sau đó **web** (hiệu ứng giảm)                                                                                      |
| Chiến đấu  | **Action real-time** trên map                                                                                                                                                       |
| Đội hình   | **Peter + quái thu phục**: quái đi theo và tự đánh bằng AI, có chiêu phối hợp với Peter, cưỡi quái để đi đường hoặc vượt địa hình                                                   |
| Quy mô     | **Ngắn, làm thật đẹp**: 3–5 giờ chơi, 4–5 vùng, khoảng 30 loài quái thu phục được                                                                                                   |
| Cốt truyện | **Game mới**. Chỉ giữ tên CHRONO, chủ đề thời gian, Peter và Kuro                                                                                                                   |
| Peter      | **Thiếu niên ~17 tuổi, tóc xoăn curly** (đặc điểm bất biến duy nhất). Thiết kế còn lại làm mới                                                                                      |
| Kuro       | Bạn thời thơ ấu của Peter, mang quyền năng Possibility. Có thể là trùm cuối hoặc đồng minh, tùy ending                                                                              |
| Giọng điệu | **Tối, vũ trụ huyền bí** (Dark/Cosmic Fantasy)                                                                                                                                      |
| Ending (3) | **Bi kịch**: Kuro là trùm cuối, Peter phải hạ bạn mình. **Thật**: Peter cứu Kuro, Kuro hỗ trợ đánh một trùm khác. **Kuro thắng**: Peter thua hoặc buông tay, Kuro viết lại thế giới |
| Art        | **AI tạo rồi chỉnh tay**: Codex (ChatGPT Plus/Pro, qua `sprite-gen` provider `codex`) và Gemini (qua Antigravity)                                                                   |
| Ngôn ngữ   | **Chỉ tiếng Việt**                                                                                                                                                                  |
| Bản cũ     | Phaser 9 chương được **gắn tag lưu trữ** và vẫn chạy trên GitHub Pages. Game Godot nằm trong **repo mới**                                                                           |
| Duyệt      | Chủ dự án chỉ duyệt **mốc lớn**: concept Peter/Kuro, demo vùng đầu, cốt truyện + 3 ending. Phần còn lại Claude tự quyết                                                             |

## 2. Kiến trúc kỹ thuật dự kiến (Godot 4)

- **Thế giới:** mesh 3D low-poly dạng mô-đun (block, mái nhà, vách đá, cây) phủ texture pixel; dựng bằng `GridMap` hoặc scene kéo thả. Camera nghiêng cố định kiểu DQ III, xoay nhẹ khi vào thị trấn.
- **Nhân vật/quái:** `Sprite3D` / `AnimatedSprite3D` billboard theo trục Y, 4 hướng (có thể lật để ra 8 hướng). Có bóng đổ thật và nhận ánh sáng (normal map sinh tự động).
- **Ánh sáng/hậu kỳ:** `WorldEnvironment` gồm glow, fog thể tích, SSAO, DOF tilt-shift qua `CameraAttributes`; đèn điểm cho đuốc và phép thuật. Bản web dùng renderer Compatibility, có preset giảm hiệu ứng.
- **Chiến đấu real-time:** hitbox/hurtbox `Area3D`; dữ liệu chiêu, quái và boss nằm trong file `.tres`/JSON, không hard-code.
- **Thu phục:** quái yếu máu có cơ hội "kết ấn" (hiệu ứng thời gian). Mang theo 2 quái đi cùng, dùng AI state machine với lệnh chiến thuật (Tấn công / Bảo vệ / Hồi). Có chiêu phối hợp và một số loài cưỡi được.
- **Hiệu ứng:** `pixelfx` (MIT) xuất sprite sheet cho Godot.
- **Kiểm thử:** GUT hoặc gdUnit4 cho logic, export headless trong CI.

## 3. Pipeline art (AI + chỉnh tay)

1. **Concept:** Gemini/Codex vẽ turnaround cho Peter, Kuro và từng quái, theo một **style sheet** cố định (bảng màu, tỷ lệ chibi, nét viền).
2. **Sprite:** dùng `sprite-gen` (Apache-2.0) chạy trên ảnh concept để ra idle/walk/attack. Sprite-gen thiên về góc nghiêng, nên các hướng còn lại (trước/sau) cần sinh riêng rồi ghép.
3. **Chuẩn hóa:** script pixelize về kích thước cố định, khóa bảng màu, làm sạch alpha, sinh normal map.
4. **Môi trường:** mesh mô-đun dùng kit CC0 (Kenney, KayKit) làm khung, cộng texture pixel do AI tạo và chỉnh lại cho đồng bộ.
5. **Ghi nguồn:** mỗi asset ghi rõ công cụ và prompt vào `ASSET_LOG`.

**Rủi ro chính:** AI vẽ không đồng nhất giữa các hướng và các frame. Cách giảm: style sheet chặt, sinh từ cùng một ảnh gốc, chỉnh tay ở bước cuối.

## 4. Lộ trình

| Giai đoạn         | Nội dung                                                                                 | Duyệt               |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------- |
| 0. Khởi tạo       | Tag bản Phaser cũ; cài Godot; tạo repo mới + CI export Windows/web; style sheet          | —                   |
| 1. Tiền kỳ        | Story bible mới + 3 ending; concept Peter 17 và Kuro; danh sách 4–5 vùng, ~30 quái       | **Chủ dự án duyệt** |
| 2. Vertical slice | 1 vùng HD-2D hoàn chỉnh: di chuyển, đánh real-time, 3 quái thu phục, 1 quái cưỡi, 1 boss | **Chủ dự án duyệt** |
| 3. Sản xuất       | Các vùng còn lại, quái, boss, Kuro, 3 ending                                             | —                   |
| 4. Hoàn thiện     | Cân bằng, âm thanh, export PC + web, phát hành                                           | Báo khi xong        |

## 5. Phân công agent

- **Claude:** coordinator, kiến trúc Godot, code lõi, review, viết prompt cho các agent khác.
- **Antigravity (Gemini):** concept art, texture, sprite qua Gemini; thiết kế vùng.
- **Codex:** code task do Claude giao (GDScript); chạy `sprite-gen` với provider `codex`.

## 6. Nguồn tham khảo

- sprite-gen: https://github.com/aldegad/sprite-gen (Apache-2.0)
- pixelfx: https://github.com/patch-gg/pixelfx (MIT, đã vendor trong bản Phaser)
- Kenney / KayKit: kit 3D CC0 làm khung môi trường
- Nhánh `exp/hd2d-prototype`: tham khảo ý tưởng diorama/ánh sáng (Three.js), không port trực tiếp
