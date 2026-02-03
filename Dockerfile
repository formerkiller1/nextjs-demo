FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖（优先使用 package-lock 以保证与本地一致）
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 复制源码并构建
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 仅复制运行所需文件，减小镜像体积
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]


