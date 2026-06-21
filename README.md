# 🧠 AlgoLearn — Nền Tảng Học Thuật Toán & Cấu Trúc Dữ Liệu Trực Quan

> **Đồ án cá nhân xuất sắc** của **Võ Minh Trí** — Sinh viên Đại học Công nghiệp TP.HCM (IUH)
> 
> Một dự án tâm huyết kết hợp giữa kiến thức nền tảng về Cấu trúc Dữ liệu & Giải thuật với những công nghệ web hiện đại, mang đến trải nghiệm học tập gamification sáng tạo.
>
> 🔗 **Live Demo**: [https://algolearn-ji1m.onrender.com](https://algolearn-ji1m.onrender.com)

**AlgoLearn** là nền tảng giáo dục tương tác chuyên sâu, được thiết kế và phát triển độc lập nhằm giải quyết bài toán "khô khan" khi học thuật toán. Hệ thống nổi bật với giao diện dark mode hiện đại, tích hợp AI thông minh, cơ chế thi đấu 1v1 (Arena) thời gian thực và mô phỏng từng bước (step-by-step visualizer) trực quan.

---

## 📸 Giao Diện Trực Quan

| Trang Chủ (Dashboard) | IDE & Mô Phỏng (Visualizer) | Đấu Trường 1v1 (Arena) |
|:---------:|:--------------:|:--------------:|
| Hệ thống học tập, streak, XP | Môi trường code tích hợp mô phỏng | Thi đấu thuật toán real-time |

---

## ✨ Điểm Nhấn Công Nghệ & Tính Năng

### ⚔️ Đấu Trường 1v1 (Real-time Arena Combat)
- **Kiến trúc Server-side Evaluation:** Xây dựng sandbox Python độc lập để chấm điểm code trực tiếp từ người dùng với độ trễ thấp.
- **Matchmaking & Auto Bot:** Thuật toán tự động ghép cặp người chơi có Elo tương đương; tự động triển khai Bot AI nếu hàng đợi quá 5 giây.
- **Hệ thống Elo:** Tích hợp công thức tính điểm Elo chuẩn xác tương tự các nền tảng thi đấu cờ vua, cập nhật tức thời (Real-time) sau mỗi trận.

### 💻 IDE Lập Trình & Mô Phỏng Thuật Toán Hiện Đại
- Xây dựng **Trình soạn thảo Code (Code Editor)** ngay trên nền web hỗ trợ syntax highlighting bằng PrismJS.
- Thiết kế hệ thống **Step-by-Step Visualizer** — engine mô phỏng hoạt họa chuyên sâu giúp người học "nhìn thấy" cách thuật toán (như Quick Sort, Merge Sort) thực thi trong bộ nhớ.
- Xử lý Testcase động, cung cấp feedback chi tiết (Expected vs Actual).

### 🤖 Tích Hợp Google Gemini AI
- Trợ lý AI học tập thông minh: Hỗ trợ phân tích độ phức tạp thời gian/không gian ($O(n), O(1)$), giải thích code lỗi và đưa ra gợi ý tối ưu (hints) mà không tiết lộ hoàn toàn đáp án.

### 🎮 Gamification & Retention (Tương tác người dùng)
- **Hệ thống Daily Streak & Bảng Xếp Hạng:** Kích thích động lực học tập qua cơ chế cạnh tranh.
- **Bảo hiểm Chuỗi (Streak Freeze):** Cơ chế kinh tế trong game cho phép người dùng đổi XP lấy quyền bảo vệ chuỗi ngày học tập.
- Ứng dụng **Sóng não tập trung (Binaural Beats)** bằng Web Audio API (Tone.js) nhằm tăng cường hiệu suất học tập.

---

## 🛠️ Kiến Trúc & Công Nghệ Cốt Lõi

Dự án được xây dựng toàn diện từ Frontend đến Backend (Full-stack), áp dụng tư duy thiết kế hệ thống có khả năng mở rộng.

**Frontend:**
- **Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS 4, Framer Motion (cho micro-interactions mượt mà)
- **Audio & Visual:** Tone.js (Binaural Beats), PrismJS, Recharts

**Backend:**
- **Server:** Node.js, Express.js (TypeScript)
- **Database:** PostgreSQL + Drizzle ORM (hỗ trợ fallback db.json local)
- **Execution Engine:** Python3 Sandbox Environment
- **Authentication:** Express-session (bảo mật HttpOnly, SameSite)
- **AI Integration:** Google GenAI SDK

**DevOps & Deployment:**
- **Containerization:** Docker & Docker Compose (Multi-stage build kết hợp Node + Python)
- **CI/CD & Cloud:** Triển khai tự động trên Render.com

---

## 🚀 Hướng Dẫn Khởi Chạy Local

Khuyến nghị sử dụng **Node.js 22 LTS** và cài đặt sẵn **Python 3**.

```bash
# 1. Clone repository
git clone https://github.com/VoMinhTri11042005/AlgoLearn.git
cd AlgoLearn

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa file .env và bổ sung GEMINI_API_KEY (Lấy tại aistudio.google.com)

# 4. Khởi chạy Development Server
npm run dev
```
Truy cập ứng dụng tại: **http://localhost:3000**

---

## 🐳 Khởi Chạy Bằng Docker (Recommended)

Để môi trường chạy ổn định nhất và có sẵn PostgreSQL:

```bash
docker compose up -d --build
```
- Ứng dụng (App) chạy tại port `3000`
- Cơ sở dữ liệu (PostgreSQL) chạy tại port `5432`

---

## 👤 Về Tác Giả

**Võ Minh Trí**
- 🎓 Sinh viên tại **Đại học Công nghiệp TP.HCM (IUH)**
- 💻 Đam mê xây dựng các sản phẩm phần mềm mang lại giá trị thực tiễn, đặc biệt trong lĩnh vực EdTech (Công nghệ giáo dục).
- 🔗 **GitHub Profile:** [@VoMinhTri11042005](https://github.com/VoMinhTri11042005)

---

*Dự án tâm huyết này là minh chứng cho nỗ lực tự học, nghiên cứu và khả năng làm chủ công nghệ Full-stack.*
