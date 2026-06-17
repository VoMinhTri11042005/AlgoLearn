# TODO - Fix lỗi logic & nghiệp vụ

## Bước 1: Khoanh vùng lỗi & chuẩn hoá đề xuất fix
- Xác định chính xác đường ghi nhận practice/streak/dailyCompleted trong App.tsx + event algolearn_practice_completed.

## Bước 2: Fix double-count streak/daily progress
- Đã xoá auto recordPractice theo đổi view (App.tsx).
- Đã thêm guard chống double-streak khi nhận event.
- Đã thêm guard chống double-increment dailyCompleted.


## Bước 3: Chuẩn hoá dữ liệu XP/solved/streak
- Sau login: dùng DB (GET users/current?) làm nguồn authoritative.
- Tránh ghi đè localStorage state khi chưa confirm từ server.

## Bước 4: Syllabus active/progress đồng bộ
- Khi có Postgres: không dùng localStorage làm source; chỉ dùng server response.
- Đảm bảo TheoryView/HomeView không ghi localStorage algolearn_syllabus mâu thuẫn.

## Bước 5: Bảo mật & Authorization backend
- Hash password (bcrypt hoặc bcryptjs) và so sánh hash.
- Thêm middleware auth (token/session) và enforce admin rights cho các endpoint admin.

## Bước 6: Sửa isSelf/role hiển thị leaderboard
- Xác định self bằng user id từ server/response, không dựa vào name.

## Bước 7: Chạy lint/typecheck
- npm run lint
- npm run build (nếu cần)

