# ---- Giai doan 1: cai dat phu thuoc ----
FROM node:22-alpine AS deps
WORKDIR /app

# Monorepo dung npm workspaces: can ca file package.json cua tat ca workspace
# de npm biet resolve dependency chung.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/

# `--ignore-scripts` bo qua postinstall cua argon2 (can binary goc, se cai o
# giai doan 2 tren alpine co build-base).
RUN npm ci --ignore-scripts

# ---- Giai doan 2: build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm run prisma:generate
RUN npm run build

# Giu lai rieng `node_modules` cua production cho giai doan runtime.
RUN npm prune --omit=dev

# ---- Giai doan 3: chay ----
FROM node:22-alpine AS runtime
WORKDIR /app

# `wget` phuc vu healthcheck; `tini` la process PID 1 de xu ly tin hieu tat.
RUN apk add --no-cache wget tini openssl

ENV NODE_ENV=production \
    PORT=3000

# Khong chay bang root.
RUN addgroup -S vivivu && adduser -S vivivu -G vivivu

COPY --from=build --chown=vivivu:vivivu /app/node_modules ./node_modules
COPY --from=build --chown=vivivu:vivivu /app/package.json ./package.json
COPY --from=build --chown=vivivu:vivivu /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=vivivu:vivivu /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=vivivu:vivivu /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=vivivu:vivivu /app/packages/shared ./packages/shared

USER vivivu

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Ap dung migration truoc khi mo server de schema luon khop code dang chay.
# `migrate deploy` khong sinh migration moi (an toan cho production).
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
