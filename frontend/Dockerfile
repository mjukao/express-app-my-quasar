# ===========================
# Stage 1: Build Quasar SPA
# ===========================
FROM node:20-alpine AS builder

WORKDIR /app

# ติดตั้ง Quasar CLI
RUN npm install -g @quasar/cli

# ปิด postinstall (quasar prepare)
ENV npm_config_lifecycle_script=""

# รับค่า VITE_API_URL จาก build args
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# ติดตั้ง dependencies แบบไม่มี postinstall
RUN npm install --legacy-peer-deps --ignore-scripts

# เปิด scripts กลับมา
ENV npm_config_lifecycle_script="true"

# Copy source ทั้งหมด
COPY . .

# Build Quasar SPA
RUN npm run build


# ===========================
# Stage 2: Nginx to serve SPA
# ===========================
FROM nginx:1.27-alpine

COPY --from=builder /app/dist/spa /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
