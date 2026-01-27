#!/bin/bash

echo "=== PostgreSQL 用户检查脚本 ==="
echo ""

# 检查 PostgreSQL 是否运行
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL 服务未运行"
    echo "请先启动 PostgreSQL:"
    echo "  brew services start postgresql@14"
    echo "  或"
    echo "  brew services start postgresql"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL 服务正在运行"
echo ""

# 尝试不同的用户名连接
echo "尝试连接 PostgreSQL..."
echo ""

# 尝试使用系统用户名
SYSTEM_USER=$(whoami)
echo "1. 系统用户名: $SYSTEM_USER"
if psql -U "$SYSTEM_USER" -d postgres -c "SELECT current_user;" > /dev/null 2>&1; then
    echo "   ✅ 可以使用系统用户名连接"
    echo "   DATABASE_URL=\"postgresql://$SYSTEM_USER@localhost:5432/nextjs_auth\""
else
    echo "   ❌ 无法使用系统用户名连接"
fi
echo ""

# 尝试使用 postgres 用户
echo "2. 默认 postgres 用户"
if psql -U postgres -d postgres -c "SELECT current_user;" > /dev/null 2>&1; then
    echo "   ✅ 可以使用 postgres 用户连接"
    echo "   DATABASE_URL=\"postgresql://postgres@localhost:5432/nextjs_auth\""
else
    echo "   ❌ 无法使用 postgres 用户连接"
fi
echo ""

# 列出所有数据库用户
echo "3. 查看所有数据库用户:"
psql -U postgres -c "\du" 2>/dev/null || psql -U "$SYSTEM_USER" -d postgres -c "\du" 2>/dev/null || echo "   无法列出用户（需要先连接数据库）"
echo ""

echo "=== 推荐配置 ==="
echo "如果使用系统用户名，使用："
echo "DATABASE_URL=\"postgresql://$SYSTEM_USER@localhost:5432/nextjs_auth\""
echo ""
echo "如果需要密码，使用："
echo "DATABASE_URL=\"postgresql://$SYSTEM_USER:password@localhost:5432/nextjs_auth\""

