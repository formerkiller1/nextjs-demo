# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

# 使用阿里云镜像源加速（国内服务器推荐）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装 OpenSSL（Prisma 需要）
RUN apk add --no-cache openssl

# 先复制 package 文件和 prisma schema（postinstall 脚本需要）
COPY package.json package-lock.json ./
COPY prisma ./prisma

# 安装所有依赖（包括 devDependencies，构建需要 TypeScript 等工具）
# 使用 BuildKit cache mount 缓存 npm 下载的包，避免重复下载
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 复制剩余源码并构建
COPY . .
# 使用 BuildKit cache mount 缓存 .next 构建产物，加速增量构建
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 使用阿里云镜像源加速（国内服务器推荐）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装 OpenSSL（Prisma 需要）
RUN apk add --no-cache openssl

# 先复制 package 文件
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

# 复制 node_modules（从 builder 阶段，已包含所有依赖）
COPY --from=builder /app/node_modules ./node_modules

# 复制构建产物和必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]