#!/bin/bash

echo "🚀 Next.js 前后端连通快速启动脚本"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    exit 1
fi

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  警告: 未检测到 PostgreSQL"
    echo "   请确保 PostgreSQL 已安装并运行"
fi

echo "📦 步骤 1: 生成 Prisma Client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma Client 生成失败"
    exit 1
fi

echo ""
echo "📊 步骤 2: 推送数据库 Schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ 数据库 Schema 推送失败"
    echo "   请检查 DATABASE_URL 配置和 PostgreSQL 服务"
    exit 1
fi

echo ""
echo "✅ 数据库初始化完成！"
echo ""
echo "🌐 步骤 3: 启动开发服务器..."
echo "   访问: http://localhost:3000"
echo ""

npm run dev
