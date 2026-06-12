# AlgoLearn - Nền Tảng Học Thuật Toán Trực Quan Sinh Động Dành Cho Dev Việt

**AlgoLearn** là nền tảng học và thực hành cấu trúc dữ liệu & giải thuật (CTDL&GT) cấp tiến, được thiết kế tối ưu hóa trải nghiệm trực quan hóa (visualizing) và tăng cường thính giác (auditory feedback) giúp lập trình viên Việt Nam chinh phục các thuật toán từ cơ bản đến nâng cao một cách hào hứng và hiệu quả nhất.

---

## Tính Năng Cốt Lõi (Core Features)

AlgoLearn vượt lên trên các trang web học thuật toán truyền thống nhờ sự kết hợp hài hòa giữa **Thác bản lý thuyết trực quan**, **Mô phỏng động học sinh động**, **Môi trường lập trình (IDE) thời gian thực**, **Trí tuệ nhân tạo (Gemini AI)**, và **Gaming hóa (Gamification)**:

### 1. Bảng Điều Khiển Học Tập (Interactive Dashboard)
* **Lộ trình bài giảng bài bản**: Hệ thống giáo trình dạng sơ đồ cây trực quan từ cơ bản (Độ phức tạp Big O, Mảng, Danh sách liên kết) đến nâng cao (Quy hoạch động, Quick Sort, BFS, Sắp xếp trộn...).
* **Hệ thống Streak & Thống kê**: Giữ lửa học tập bằng chuỗi ngày tích cực (Daily Streak Count), tích lũy điểm kinh nghiệm (XP) và số lượng thuật toán đã giải quyết thành công qua biểu đồ thống kê dạng bento sang trọng.

### 2. Bài Học Lý Thuyết & Âm Thanh Tập Trung (Theory & Binaural Beats)
* **Giáo trình Markdown sinh động**: Nội dung học thuật biên soạn chi tiết, bố cục đẹp mắt, tích hợp phân tách dòng code tinh tế.
* **Tích hợp sóng não tập trung (Tone.js)**: Phát hợp âm/sóng âm khoa học (bằng thư viện Tone.js và Web Audio API) giúp cải thiện sự tập trung tối đa trong lúc nghiên cứu thuật toán.

### 3. IDE Lập Trình & Mô Phỏng Giải Thuật (Algorithmic IDE & Step Visualizer)
* **Trình soạn thảo code tích hợp**: Giao diện viết code gọn gàng, hỗ trợ highlighting mã nguồn nhanh bằng PrismJS và bộ nhập liệu tùy chỉnh tiện lợi.
* **Chạy thử Bộ Testcase thực tế**: Kiểm nghiệm thuật toán ngay tức thì với bộ dữ liệu kiểm thử (Testcases), phản hồi đầu ra (Expected vs Actual Outputs) và thời gian thực thi (Runtime).
* **Mô phỏng Thuật toán Từng bước (Step-by-Step Visualizer)**: Biểu diễn hoạt họa (Active, Swapping, Pivot...) trực quan hóa cấu trúc mảng biến động khi chạy thuật toán sắp xếp (như Quick Sort, Bubble Sort,...), giúp người dùng nhìn thấy từng dòng mã làm thay đổi dữ liệu như thế nào.

### 4. Đấu Trường Thuật Toán (The Arena Combat)
* Chế độ tranh tài kịch tính cùng đối thủ AI hoặc bài toán thách thức thời gian thực.
* Thang đo tiến trình trực quan sinh động thúc đẩy lập trình viên cải tiến hiệu năng code tối đa.

### 5. Bảng Xếp Hạng Đua Top (Leaderboards)
* Bảng vàng hiển thị thứ hạng, số bài giải, XP tích lũy và danh hiệu (Badges) của người học.
* Tìm kiếm và hiển thị trường học (HUST, UET, UIT, FPT, DUT, PTIT...) định hình màu cờ sắc áo của sinh viên thế hệ mới.

### 6. Trợ Lý Thuật Toán AI Thông Minh (AI Co-Pilot)
* Tích hợp sâu cổng kết nối Google Gemini API (sử dụng gói SDK hiện đại @google/genai).
* Hỗ trợ giải thích mã lỗi, tối ưu hóa thuật toán thành phiên bản có độ rộng thời gian tuyến tính O(N) hoặc O(N log N), và phân tích chi tiết độ phức tạp không gian (Space Complexity) ngay trong cửa sổ chat học tập.

### 7. Hệ Thống Quản Trị Hệ Thống (Power Admin Dashboard)
* **Quản trị Syllabus động**: Thêm mới bài học, tinh chỉnh nội dung Markdown, cung cấp mã code snippet mẫu, đặt độ khó (Easy, Medium, Hard).
* **PostgreSQL Bridge**: Tích hợp giao diện quản lý liên kết cơ sở dữ liệu (DATABASE_URL). Quản trị viên dễ dàng kết cấu cơ sở dữ liệu quan hệ PostgreSQL đám mây thông qua Drizzle ORM hoặc ngắt kết nối để tự động quay về cơ sở lưu trữ vật lý local file (db.json) mà không làm ngắt quãng ứng dụng.
* **Quản lý học viên & phân quyền**: Quản lý hồ sơ, tăng/giảm quyền quản trị viên, đặt lại mật khẩu học viên hoặc xóa tài khoản có hành vi gian lận.

---

## Công Nghệ Phát Triển (Tech Stack)

### Frontend (Client-side)
* **Framework**: React 19 + TypeScript + Vite chế độ biên dịch tối ưu.
* **Styling**: Tailwind CSS với kiến trúc token hiện đại, responsive cực mượt trên Desktop & Mobile.
* **Animations**: Framer Motion (được import từ gói motion/react) tạo ra các chuyển động chuyển trang, hiển thị modal và biểu đồ mượt mà.
* **Audio Synthesis Engine**: Tone.js phối hợp với Web Audio API phát ra các Jingle thành công tráng lệ khi người học giải quyết bài toán và hợp âm sóng não kích hoạt trạng thái tập trung Deep Focus.
* **Code Editor & Highlights**: react-simple-code-editor tích hợp PrismJS.
* **Icons & Visuals**: lucide-react mang tới bộ icon SVG tinh xảo, vector sắc nét.
* **Data Visualization**: recharts biểu thị biểu đồ tiến trình học tập dạng bento grid đẹp mắt.

### Backend (Server-side)
* **Runtime**: Node.js + Express.js đóng vai trò máy chủ trung gian bảo mật (API Gateway) ẩn dấu an toàn các API Key nhạy cảm.
* **Server Compilers**: tsx phục vụ lập trình tăng tốc phát triển; esbuild đóng gói file máy chủ thành tập tin duy nhất CJS dist/server.cjs tăng tốc độ tải kho lạnh (Cold Start) khi chạy container.
* **Database Dual-Mode**:
  - Máy chủ hỗ trợ điều phối dữ liệu lưu trữ lưỡng cực: mặc định sử dụng cơ sở dữ liệu vật lý gọn nhẹ db.json thông qua API của Node File System (fs).
  - Khi cấu hình biến môi trường DATABASE_URL (hoặc nhập từ Admin Dashboard), máy chủ sẽ khởi tạo kết nối PostgreSQL thời gian thực, đồng bộ hóa các bảng dữ liệu bằng Drizzle ORM nhằm đảm bảo lưu trữ an toàn, tải nhanh diện rộng.
* **AI Integration**: Giao tiếp trực tiếp với cổng thông tin mô hình ngôn ngữ lớn mạnh mẽ của Google thông qua bộ thư viện cao cấp @google/genai.

---

## Cấu Trúc Mã Nguồn (Repository Architecture)

Mã nguồn được phân tách mô-đun khoa học, tuân thủ chặt chẽ các nguyên tắc tối ưu hóa thiết kế sạch và dễ mở rộng:

```text
├── .env.example                # File định nghĩa mẫu các biến môi trường
├── .dockerignore               # Loại trừ rác khi build image Docker
├── .gitignore                  # Chỉ định tệp tin và thư mục Git không theo dõi
├── Dockerfile                  # Cấu hình đóng gói ứng dụng đa tầng (Multi-stage build)
├── docker-compose.yml          # Triển khai song song máy chủ AlgoLearn & cơ sở dữ liệu PostgreSQL local
├── db.json                     # Cơ sở dữ liệu mặc định dạng tập tin JSON (Khi không có PostgreSQL)
├── package.json                # Quản lý tất cả các dependency, thư viện và script vận hành
├── server.ts                   # Điểm khởi chạy Express server nâng cao tích hợp Vite dev middleware, APIs và bộ lọc DB
├── tsconfig.json               # Cấu hình dự án cho trình thông dịch TypeScript
├── vite.config.ts              # Chỉ định plugin tối ưu và build hệ thống SPA tĩnh cho Vite
├── src/                        # Thư mục mã nguồn Frontend chính
│   ├── App.tsx                 # Điểm điều biến Router và State trung tâm (Bao gồm đồng bộ XP, Streak, Auth)
│   ├── main.tsx                # File đầu vào React gắn kết DOM
│   ├── index.css               # Tệp CSS cốt vách nạp Tailwind 4 và tùy chỉnh kiểu chữ hiển thị
│   ├── types.ts                # Định nghĩa tường minh tất cả các Type, Interface của dự án (AppUser, Message,...)
│   ├── utils/
│   │   └── audio.ts            # Động cơ tổng hợp nhạc (Web Audio Synthesizer, Tone.js Jingle)
│   └── components/             # Thư mục tập hợp các View UI cụ thể
│       ├── LandingGate.tsx     # Trang chào đón đầy hiệu ứng thị giác ấn tượng
│       ├── HomeView.tsx        # Bảng điều khiển học tập, bento thống kê và lộ trình Syllabus
│       ├── TheoryView.tsx      # Chế độ đọc tài liệu, lý thuyết kết hợp sóng nhạc tập trung
│       ├── IdeView.tsx         # Mô phỏng thuật toán từng bước sống động tích hợp trình viết code
│       ├── ArenaView.tsx       # Môi trường thi đấu, thử thách đối kháng thuật toán
│       ├── LeaderboardView.tsx # Bảng vinh danh, xếp thứ hạng cá nhân và trường học
│       ├── AdminView.tsx       # Quản trị hệ thống, SQL database linker, quản lý khóa học, quản lý học viên
│       ├── AuthModal.tsx       # Đăng ký / Đăng nhập học viên bảo mật
│       ├── EditProfileModal.tsx# Sửa đổi thông tin tài khoản, ảnh đại diện, trường học
│       ├── QuickNotesSidebar.tsx# Sổ ghi chú nhanh (General, Algorithm, Complexities) tiện ích
│       └── ResultModal.tsx     # Trạng thái báo cáo thắng thua (Victory/Defeat) sinh động
```

---

## Hướng Dẫn Vận Hành Tại Máy Cục Bộ (Local Setup)

### 1. Chuẩn Bị
Cài đặt sẵn Node.js (khuyên dùng phiên bản 20 hoặc 22 LTS).

### 2. Cài đặt các thư viện trong package.json
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file .env từ file mẫu:
```bash
cp .env.example .env
```
Mở file .env và cung cấp khóa bí mật Gemini API để mở khóa tính năng AI chat hướng dẫn:
```env
# Google Gemini API Key - Lấy miễn phí tại Google AI Studio
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx

# (Tùy chọn) Đường dẫn kết nối cơ sở dữ liệu PostgreSQL thực tế
# Ví dụ: postgresql://username:password@localhost:5432/algolearn
DATABASE_URL=
```

### 4. Chạy chế độ phát triển (Development Mode)
Khởi động song song Express backend server và Vite frontend live-reload trên một cổng duy nhất (Port 3000):
```bash
npm run dev
```
Giờ bạn có thể truy cập nền tảng tại địa chỉ: http://localhost:3000

### 5. Biên dịch sản phẩm chất lượng cao (Production Build)
```bash
npm run build
```
Sản phẩm sau khi build sẽ nằm gọn trong thư mục dist/, bao gồm mã nguồn client tĩnh và mã nguồn server bundle dist/server.cjs cực kỳ nhẹ và tương thích ngược tốt.

---

## Triển Khai Chạy Bằng Docker & Docker Compose

Dự án cài đặt sẵn Dockerfile và Docker-Compose giúp khởi tạo môi trường học tập lý tưởng khép kín (bao gồm cả database PostgreSQL cục bộ để test kết nối nâng cao) chỉ trong 1 dòng lệnh.

### 1. Kiểm tra Docker
Đảm bảo máy tính của bạn đã cài đặt Docker Desktop và đang khởi chạy dịch vụ Docker.

### 2. Kích hoạt dịch vụ
Chạy lệnh tự động kéo image, build mã nguồn và dựng cụm dịch vụ lên:
```bash
docker compose up -d --build
```
Hệ thống sẽ kéo dài quá trình cài đặt môi trường, dựng nên:
1. algolearn-db-container (Cơ sở dữ liệu PostgreSQL lưu trữ bền vững tại Volume algolearn_psql-data).
2. algolearn-app-container (Chạy bản build Node.js app trên cổng 3000).

Bạn có thể mở trình duyệt và trải nghiệm ngay tại cổng nội bộ: http://localhost:3000

---

## Hướng Dẫn Đồng Bộ Mã Nguồn Git & Deploy Lên Cloud

Khi bạn phát triển các tính năng hữu ích tiếp theo hay thay đổi giao diện, hãy áp dụng quy trình đồng bộ chuẩn sau để tránh xung đột mã nguồn và triển khai thuận tiện lên mọi nơi.

### Quy trình đồng bộ Git cơ bản lên GitHub:

1. **Khởi tạo và kiểm tra trạng thái**:
   ```bash
   git init
   git status
   ```
2. **Theo dõi tất cả tệp mới**:
   ```bash
   git add .
   ```
3. **Chốt phiên làm việc vững vàng (Commit)**:
   ```bash
   git commit -m "feat: bổ sung tính năng mới và cải tiến giao diện trực quan"
   ```
4. **Đẩy dự án lên kho nhánh chính GitHub** (Lần đầu tiên cần thiết lập URL Remote):
   ```bash
   git remote add origin https://github.com/TAI_KHOAN_CUA_BAN/AlgoLearn.git
   git branch -M main
   git push -u origin main
   ```

### Gợi ý các nền tảng Deploy Online cực nhanh, miễn phí cho Học viên:

Để mọi người có thể Click vào link xem và sử dụng ngay đầy đủ tính năng:

1. **Google Cloud Run (Khuyên Dùng)**
   * **Cách hoạt động**: Vì ứng dụng đã tích hợp sẵn Dockerfile chất lượng cao đa tầng, bạn chỉ cần một tài khoản Google Cloud và đẩy trực tiếp dự án lên Cloud Run. Nó tự động tạo link HTTPS công cộng chạy cực kỳ nhanh và bền bỉ.
2. **Render (Duyệt cấu hình Web Service)**
   * **Cách hoạt động**: Liên kết trực tiếp tài khoản Render với kho GitHub của bạn. Tạo mới một Web Service, chọn Runtime là Docker (hoặc chọn Node.js và đặt Command cài đặt là npm install kèm Build Command là npm run build, Start Command là npm run start).
   * **Ưu điểm**: Hoàn toàn miễn phí, hỗ trợ cơ sở dữ liệu PostgreSQL kèm theo rất thuận tiện.
3. **Railway.app**
   * **Cách hoạt động**: Chỉ cần import dự án GitHub vào, Railway sẽ tự động phát hiện Dockerfile hoặc package.json để dựng ứng dụng lên mây chỉ trong 1 phút. Cung cấp sẵn cơ sở dữ liệu PostgreSQL chỉ bằng 1 cú click chuột.

---

## Đóng Góp Ý Tưởng & Phát Triển

AlgoLearn luôn rộng mở đón nhận các đóng góp tuyệt vời từ các bạn sinh viên và chuyên viên CNTT Việt Nam:
* Thêm nhiều bài học thuật toán chuẩn mực và trực quan sinh động hơn.
* Sáng tạo thêm các dạng biểu đồ mô phỏng thuật toán đồ thị, quy hoạch động hấp dẫn.
* Tối ưu hóa trợ lý AI giúp đưa ra câu trả lời giải thuật chính xác tuyệt đối.

*Chúc toàn thể cộng đồng Lập trình viên Việt Nam học tập CTDL&GT vui vẻ, hiệu quả và gặt hái nhiều thành công rực rỡ với AlgoLearn!*
