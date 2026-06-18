# TODO - Nâng cấp AlgoLearn (UI/UX + hiệu năng + bảo mật + tính năng)

## Bước 1: Lập API & Schema cho “lịch sử daily thật”
- [ ] Thêm bảng/collection lịch sử daily vào db schema (Postgres + db.json fallback)
- [ ] Thêm route: `POST /api/daily/practice` hoặc hook vào existing practice event
- [ ] Thêm route đọc: `GET /api/leaderboard/daily` trả về top N theo completed hôm nay

## Bước 2: Gắn ghi nhận daily thật từ phía server
- [ ] Khi nhận practice completed event (đang dispatch custom event client), server update daily_history cho userId+today
- [ ] Đảm bảo anti-double-count theo (userId, date)

## Bước 3: UI hiển thị daily leaderboard thật
- [ ] Sửa block “TOP NGƯỜI HỌC HÔM NAY” trong `src/App.tsx` dùng API mới (không mock)
- [ ] Nếu cần, thêm prop truyền vào `LeaderboardView`/component mới để giữ code sạch

## Bước 4: Bảo mật endpoints admin
- [ ] Thêm `requireAdmin` cho các route syllabus: `POST /api/syllabus`, `POST /api/syllabus/reset`, `POST /api/syllabus/active`

## Bước 5: Hiệu năng front-end
- [ ] `HomeView.tsx`: memo hóa search results để tránh tính lại nhiều lần
- [ ] `LeaderboardView.tsx`: memo hóa computed lists
- [ ] `TheoryView.tsx`: memo hóa recommendation/filtered syllabus

## Bước 6: Kiểm thử & Build
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Smoke test: daily leaderboard + admin permissions

