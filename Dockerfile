# Sử dụng Node.js LTS làm base image để build
FROM node:22-alpine AS builder

WORKDIR /app

# Sao chép các file cấu hình package để cài đặt dependencies trước (tận dụng tối đa cache của Docker)
COPY package*.json ./

# Cài đặt toàn bộ dependencies bao gồm cả devDependencies để phục vụ cho việc biên dịch
RUN npm install --no-audit --no-fund

# Sao chép toàn bộ mã nguồn dự án vào container
COPY . .

# Biên dịch cả Client (Vite) và Server (Express / TypeScript)
RUN npm run build

# --- Stage chạy ứng dụng (Production Environment) ---
FROM node:22-alpine AS runner

WORKDIR /app

# Cài đặt Python3 cho tính năng Sandbox chấm bài Arena 1v1
RUN apk add --no-cache python3

# Định nghĩa chế độ Production và gom các log đầu ra chuẩn xác
ENV NODE_ENV=production
ENV PORT=3000

# Chỉ sao chép package.json để cài đặt duy nhất production dependencies
COPY package*.json ./

# Cài đặt tối giản các thư viện chính để chạy (bỏ qua devDependencies)
RUN npm install --no-audit --no-fund

# Sao chép kết quả đã biên dịch từ stage builder vào runner stage
COPY --from=builder /app/dist ./dist

# Sao chép các tài nguyên động hoặc file database fallback cục bộ nếu có
COPY --from=builder /app/db.json* ./db.json
COPY --from=builder /app/assets* ./assets

# Tạo thư mục tạm cho sandbox chấm bài
RUN mkdir -p temp_arena

# Cấu hình cổng kết nối 3000
EXPOSE 3000

# Chạy ứng dụng thông qua file server đã biên dịch sẵn CJS
CMD ["npm", "start"]