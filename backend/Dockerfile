# Sử dụng Node.js 22
FROM node:22-alpine

# Thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt thư viện
RUN npm ci --omit=dev

# Sao chép mã nguồn Backend
COPY . .

# Thiết lập môi trường
ENV NODE_ENV=production

# Cổng Backend
EXPOSE 5001

# Khởi động Backend
CMD ["node", "server.js"]