# 🧠 AlgoLearn — Nền Tảng Học Thuật Toán & Cấu Trúc Dữ Liệu Trực Quan

> **Đồ án cá nhân** của **Võ Minh Trí** — Sinh viên Đại học Công nghiệp TP.HCM (IUH)
>
> 🔗 **Live Demo**: [https://algolearn-ji1m.onrender.com](https://algolearn-ji1m.onrender.com)

**AlgoLearn** là nền tảng web học và thực hành Cấu trúc Dữ liệu & Giải thuật (CTDL&GT) được xây dựng với giao diện trực quan sinh động, tích hợp AI thông minh, hệ thống thi đấu 1v1 và gamification — giúp việc học thuật toán trở nên hào hứng và hiệu quả hơn.

---

## 📸 Ảnh Chụp Màn Hình

| Trang Chủ | IDE & Mô Phỏng | Đấu Trường 1v1 |
|:---------:|:--------------:|:--------------:|
| Dashboard học tập, streak, XP | Code editor + Step Visualizer | Arena combat real-time |

---

## ✨ Tính Năng Nổi Bật

### 🎯 Bảng Điều Khiển Học Tập (Dashboard)
- Lộ trình bài giảng dạng sơ đồ cây trực quan từ cơ bản đến nâng cao
- Hệ thống **Daily Streak**, tích lũy **XP**, biểu đồ thống kê tiến trình học tập
- Mục tiêu hàng ngày và theo dõi hoạt động

### 📖 Bài Học Lý Thuyết & Chế Độ Tập Trung
- Giáo trình Markdown biên soạn chi tiết, hỗ trợ code highlighting
- Tích hợp **sóng não tập trung (Binaural Beats)** qua Tone.js giúp tăng hiệu quả học tập

### 💻 IDE Lập Trình & Mô Phỏng Thuật Toán
- Code editor tích hợp với syntax highlighting (PrismJS)
- Chạy thử **Testcase thực tế** với phản hồi Expected vs Actual
- **Step-by-Step Visualizer** — mô phỏng hoạt họa từng bước của thuật toán sắp xếp (Quick Sort, Bubble Sort, Merge Sort...)

### ⚔️ Đấu Trường 1v1 (Arena Combat)
- Thi đấu real-time giải bài thuật toán với người chơi khác hoặc Bot AI
- **Python Sandbox** — chấm bài thực tế qua sandbox server-side
- **Auto Bot Matchmaking** — tự động ghép Bot nếu chờ > 5 giây
- Hệ thống **Elo Rating** cập nhật sau mỗi trận đấu
- Bảng xếp hạng Đấu trường riêng biệt

### 🏆 Bảng Xếp Hạng (Leaderboard)
- Bảng vàng XP toàn quốc + Bảng xếp hạng Elo Đấu trường
- Hiển thị trường học, danh hiệu (Badge) và thống kê chi tiết
- Hỗ trợ lọc theo tuần, tìm kiếm theo tên

### 🤖 Trợ Lý AI Thông Minh (Gemini AI)
- Tích hợp **Google Gemini API** giải thích code, tối ưu thuật toán
- Phân tích độ phức tạp thời gian & không gian
- Chat hỗ trợ học tập ngay trong ứng dụng

### 🔐 Hệ Thống Quản Trị (Admin Dashboard)
- Quản lý Syllabus: thêm/sửa bài học, code mẫu, độ khó
- Quản lý học viên, phân quyền Admin
- Cấu hình kết nối PostgreSQL từ giao diện

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Mục đích |
|---|---|
| React 19 + TypeScript | Framework UI |
| Vite | Build tool & dev server |
| Tailwind CSS 4 | Styling responsive |
| Framer Motion | Animations & transitions |
| Tone.js | Binaural beats & audio cues |
| PrismJS + react-simple-code-editor | Code editor & highlighting |
| Recharts | Biểu đồ thống kê |
| Lucide React | Icon library |

### Backend
| Công nghệ | Mục đích |
|---|---|
| Node.js + Express.js | API server |
| TypeScript + tsx/esbuild | Dev & production build |
| PostgreSQL + Drizzle ORM | Database chính |
| db.json (fs) | Database fallback (không cần PostgreSQL) |
| Google Gemini API (@google/genai) | AI chatbot |
| Python3 (sandbox) | Chấm bài Arena 1v1 |
| express-session | Xác thực phiên người dùng |

### DevOps
| Công nghệ | Mục đích |
|---|---|
| Docker + Docker Compose | Containerization |
| Render.com | Cloud deployment |
| GitHub | Version control |

---

## 📁 Cấu Trúc Dự Án

```
AlgoLearn/
├── server.ts                    # Express server + API endpoints
├── package.json                 # Dependencies & scripts
├── Dockerfile                   # Multi-stage Docker build (Node + Python)
├── docker-compose.yml           # App + PostgreSQL containers
├── db.json                      # Local JSON database fallback
├── vite.config.ts               # Vite build config
├── tsconfig.json                # TypeScript config
├── .env.example                 # Biến môi trường mẫu
│
├── src/                         # Frontend source
│   ├── App.tsx                  # Root component, routing, state
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles (Tailwind)
│   ├── types.ts                 # TypeScript interfaces
│   ├── utils/
│   │   └── audio.ts             # Audio engine (Tone.js, Web Audio)
│   └── components/
│       ├── LandingGate.tsx      # Trang chào mừng
│       ├── HomeView.tsx         # Dashboard học tập
│       ├── TheoryView.tsx       # Đọc lý thuyết + binaural beats
│       ├── IdeView.tsx          # IDE + Step Visualizer
│       ├── ArenaView.tsx        # Đấu trường 1v1
│       ├── LeaderboardView.tsx  # Bảng xếp hạng
│       ├── AdminView.tsx        # Admin dashboard
│       ├── AuthModal.tsx        # Đăng ký / Đăng nhập
│       ├── EditProfileModal.tsx # Chỉnh sửa hồ sơ
│       ├── QuickNotesSidebar.tsx # Sổ ghi chú nhanh
│       └── ResultModal.tsx      # Modal kết quả trận đấu
│
└── temp_arena/                  # Thư mục tạm cho Python sandbox
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu
- **Node.js** >= 20 (khuyên dùng 22 LTS)
- **Python 3** (cho tính năng Arena sandbox)
- **Docker** (tùy chọn, cho deployment)

### Cài đặt & Chạy Development

```bash
# 1. Clone dự án
git clone https://github.com/VoMinhTri11042005/AlgoLearn.git
cd AlgoLearn

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình biến môi trường
cp .env.example .env
# Mở file .env và thêm GEMINI_API_KEY (lấy tại https://aistudio.google.com)

# 4. Chạy development server
npm run dev
```

Truy cập: **http://localhost:3000**

### Build Production

```bash
npm run build    # Build cả frontend (Vite) và backend (esbuild)
npm start        # Chạy production server
```

---

## 🐳 Triển Khai Docker

```bash
# Build và chạy cả App + PostgreSQL
docker compose up -d --build
```

Hệ thống sẽ khởi tạo:
- **`algolearn-app-container`** — Ứng dụng chạy trên port `3000`
- **`algolearn-db-container`** — PostgreSQL database trên port `5432`

Truy cập: **http://localhost:3000**

### Biến môi trường Docker

| Biến | Mô tả | Mặc định |
|---|---|---|
| `PORT` | Port server | `3000` |
| `NODE_ENV` | Môi trường | `production` |
| `DATABASE_URL` | PostgreSQL connection string | Auto (docker-compose) |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `SESSION_SECRET` | Secret cho session cookie | `dev_session_secret_change_me` |

---

## ☁️ Deploy Lên Cloud

Dự án đã được deploy thành công trên **Render.com**:

1. Kết nối GitHub repo với Render
2. Tạo **Web Service** → chọn Runtime: **Docker**
3. Thêm biến môi trường (`GEMINI_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`)
4. Deploy tự động mỗi khi push code lên `main`

> Các nền tảng khác hỗ trợ: **Google Cloud Run**, **Railway.app**, **Fly.io**

---

## 👤 Thông Tin Tác Giả

| | |
|---|---|
| **Họ và tên** | Võ Minh Trí |
| **MSSV** | — |
| **Trường** | Đại học Công nghiệp TP.HCM (IUH) |
| **GitHub** | [@VoMinhTri11042005](https://github.com/VoMinhTri11042005) |

---

## 📄 License

Dự án được phát triển phục vụ mục đích học tập và nghiên cứu cá nhân.

---

*Được xây dựng với ❤️ bởi Võ Minh Trí — IUH*
