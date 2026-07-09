# ============================================
# Dockerfile para CKJ - Multi-stage build
# ============================================
# Uso: docker build -t ckj:latest .
# ============================================

# ── Etapa 1: Build del frontend Angular ──
FROM node:22-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build -- --configuration production

# ── Etapa 2: Build del backend ──
FROM node:22-alpine AS build-backend
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY backend/ ./backend/

# ── Etapa 3: Imagen final ──
FROM node:22-alpine
RUN apk add --no-cache tini

WORKDIR /app

# Crear usuario no-root
RUN addgroup -S ckj && adduser -S ckj -G ckj

# Copiar frontend compilado
COPY --from=build-frontend --chown=ckj:ckj /app/dist ./dist

# Copiar backend
COPY --from=build-backend --chown=ckj:ckj /app/backend ./backend

# Crear directorio uploads
RUN mkdir -p /app/backend/uploads && chown -R ckj:ckj /app

# Puerto de la API
EXPOSE 3000

# Usar tini para manejo correcto de señales
ENTRYPOINT ["/sbin/tini", "--"]

USER ckj

CMD ["node", "backend/server.js"]
