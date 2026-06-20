# TODO - Nâng cấp Đấu trường 1v1 (MVP hướng #2)

- [x] Bước 0: Ghi chú phạm vi MVP: queue + ghép đối thủ thật qua server, polling trạng thái match
- [x] Bước 1: Backend `server.ts`: thêm storage match/queue/elo trong `db.json` (fallback) + endpoint queue/join/leave/match/status/submit/arena leaderboard
- [x] Bước 2: Backend `server.ts`: Elo update khi submit kết thúc match
- [x] Bước 3: Backend `server.ts`: nhận `code` từ ArenaView trong submit, run sandbox để chấm testcase, trả `winnerIsPlayer + logs + passCount`
- [x] Bước 4: Frontend `src/components/ArenaView.tsx`: submit gửi `code`, hiển thị log chấm thật và mở ResultModal theo response
- [x] Bước 5: Frontend `src/components/LeaderboardView.tsx`: thêm tab/section “Arena 1v1 Elo” fetch `/api/arena/leaderboard`
- [x] Bước 6: Đồng bộ XP/Streak (nếu muốn): server trả reward, ArenaView dispatch sự kiện tương ứng
- [x] Bước 7: Fix type errors / compile
- [ ] Bước 8: Test thủ công: chạy 2 account, phải ghép được đối thủ và Elo cập nhật
