# Danh sách Công việc (TODOs) Nâng cấp & Cải thiện Hệ thống AlgoLearn

Dựa trên việc kiểm tra mã nguồn dưới góc độ một chuyên gia Full-stack, dưới đây là danh sách các hạng mục cần được ưu tiên nâng cấp và tái cấu trúc (refactor) trong tương lai để hệ thống chuyên nghiệp, bảo mật và dễ bảo trì hơn.

## 1. Tái cấu trúc Kiến trúc (Architecture Refactoring)
> [!IMPORTANT]
> Đây là vấn đề cấp thiết nhất để dự án có thể mở rộng (scale) khi có nhiều tính năng hoặc nhiều người trong team cùng code.

- `[ ]` **Tách nhỏ `server.ts`**: Hiện tại `server.ts` là một file monolith khổng lồ chứa cả logic DB, Router API, và Socket.io. Cần chia nhỏ thành mô hình MVC hoặc Layered Architecture:
  - `routes/`: Chứa định tuyến API.
  - `controllers/`: Xử lý logic request/response.
  - `services/`: Xử lý nghiệp vụ lõi (Business logic).
  - `models/`: Định nghĩa schema cơ sở dữ liệu.
- `[ ]` **Tách nhỏ `App.tsx` (Frontend)**: File `App.tsx` dài hơn 3600 dòng. Cần chia tách thành:
  - `src/router/`: Quản lý `react-router-dom`.
  - `src/layouts/`: Các bộ cục (MainLayout, AuthLayout, AdminLayout).
  - `src/contexts/` hoặc dùng Zustand/Redux để quản lý State toàn cục (thay vì truyền props chằng chịt).
- `[ ]` **Tách Component**: Cắt nhỏ các file lớn như `HomeView.tsx` thành các Component nhỏ bé hơn (`HeroSection`, `UserStatsCard`, `VisualizerDemo`).

## 2. Hoàn thiện Cơ sở dữ liệu (Database Layer)
- `[ ]` **Chuyển đổi hoàn toàn sang Postgres/Drizzle ORM**: Gỡ bỏ hoàn toàn logic lưu trữ tạm thời trên bộ nhớ RAM (`currentDb.users`) và `localStorage` trên Frontend. Dữ liệu phải được query 100% từ Database thật.
- `[ ]` **Thiết kế lại Schema**: Thêm bảng liên kết (Relations) cho Lịch sử Đấu trường (Match History), Bài học đã hoàn thành (User Progress), và Thành tựu (Achievements).

## 3. Nâng cấp Bảo mật & Xác thực (Security & Auth)
> [!WARNING]
> Mặc dù đã vá các lỗi nghiêm trọng (như RCE), nhưng để public ra Internet an toàn, cần thêm các lớp bảo vệ mạng.

- `[ ]` **Cơ chế Rate Limiting**: Thêm giới hạn số lần gọi API (đặc biệt là route `/api/auth/login` và `/api/auth/register`) để chống tấn công Brute-force và DDoS.
- `[ ]` **Chuyển đổi Session sang JWT (Tùy chọn)**: Nếu sau này phát triển Mobile App, việc sử dụng JSON Web Token (JWT) kết hợp Refresh Token sẽ tối ưu hơn so với `express-session` dựa trên Cookie hiện tại.
- `[ ]` **CSRF Protection**: Triển khai bảo vệ chống tấn công giả mạo yêu cầu chéo trang.

## 4. Tối ưu hóa Hiệu năng (Performance Optimization)
> [!TIP]
> Trong quá trình Build Vite, cảnh báo JS Chunk đã vượt quá 500KB (lên tới 1.6MB). Cần tối ưu để web tải nhanh hơn.

- `[ ]` **Code Splitting (Dynamic Import)**: Sử dụng `React.lazy()` và `<Suspense>` cho các Route lớn như `ArenaView`, `IdeView` để chỉ tải code khi người dùng thực sự truy cập vào trang đó.
- `[ ]` **Tối ưu WebSockets (Socket.io)**: Cải thiện hiệu năng xử lý sự kiện trong đấu trường (Arena). Đảm bảo dọn dẹp (cleanup) các event listener khi component unmount để tránh rò rỉ bộ nhớ (Memory Leak).

## 5. Cải thiện UX/UI & Trải nghiệm Người dùng
- `[ ]` **Responsive Mobile Layout**: Đảm bảo thanh điều hướng và đấu trường IDE không bị tràn viền hoặc thao tác khó khăn trên các thiết bị màn hình nhỏ.
- `[ ]` **Loading States (Skeleton)**: Thêm hiệu ứng Skeleton Loaders (khung tải xám) thay vì hiển thị màn hình nháy (flicker) hoặc khoảng trắng khi đang fetch dữ liệu API.
- `[ ]` **Hệ thống Thông báo (Toast Notification) tập trung**: Chuẩn hóa cách hiển thị lỗi và thành công bằng `react-hot-toast` thống nhất trên mọi tính năng.

## 6. Kiểm thử & Tự động hóa (Testing & DevOps)
- `[ ]` **Viết Unit Test**: Thêm Jest/Vitest để kiểm thử tự động các logic cốt lõi như thuật toán chấm điểm, tính toán XP, phân hạng rank.
- `[ ]` **Tự động hóa CI/CD**: Thiết lập GitHub Actions để tự động Build, chạy Test, và Deploy Docker Image mỗi khi có code mới được Push.
