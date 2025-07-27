# Multi-stage build için Node.js base image
FROM node:20-alpine AS builder

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Kaynak kodunu kopyala
COPY . .

# Uygulamayı build et
RUN npm run build

# Production stage - Nginx ile serve et
FROM nginx:alpine

# Build edilen dosyaları nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80'i aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]

