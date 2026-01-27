# 环境变量配置说明

## ✅ 已完成的兜底处理

项目已经添加了环境变量的兜底处理，**即使不配置环境变量，项目也能成功启动**。

### 环境变量默认值

| 环境变量 | 必需 | 默认值 | 说明 |
|---------|------|--------|------|
| `DATABASE_URL` | 生产环境必需 | 无 | 开发环境未配置时会显示警告，但不会阻止启动 |
| `NEXTAUTH_SECRET` | 生产环境必需 | `dev-secret-key-change-in-production` | 开发环境使用默认值 |
| `NEXTAUTH_URL` | 可选 | `http://localhost:3000` | 自动检测 Vercel URL 或使用默认值 |
| `SMTP_*` | 可选 | 无 | 未配置时邮件功能不可用，但会显示友好提示 |

### 功能状态

#### ✅ 可以正常使用的功能（无需配置）
- 项目启动和运行
- 页面访问
- UI 组件
- 路由保护

#### ⚠️ 需要配置环境变量才能使用的功能

1. **数据库功能**（需要 `DATABASE_URL`）
   - 用户注册
   - 用户登录
   - 数据存储
   - 如果没有配置，会显示警告但不会崩溃

2. **邮件功能**（需要 `SMTP_*` 配置）
   - 邮箱验证邮件
   - 密码重置邮件
   - 如果没有配置，会显示错误提示，但不会阻止其他功能

## 快速开始

### 1. 最小配置（仅启动项目）

**无需任何配置**，直接运行：

```bash
npm run dev
```

项目会启动，但数据库和邮件功能不可用。

### 2. 完整配置（所有功能可用）

创建 `.env.local` 文件：

```env
# 数据库（必需，用于数据存储）
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth（开发环境可选，生产环境必需）
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# QQ邮箱SMTP（可选，用于发送邮件）
SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-qq-email@qq.com"
SMTP_PASSWORD="your-qq-email-authorization-code"
SMTP_FROM="your-qq-email@qq.com"
SMTP_FROM_NAME="Next.js App"
```

### 3. 配置数据库

#### 使用 PostgreSQL

```bash
# 安装 PostgreSQL（如果未安装）
# macOS: brew install postgresql
# 启动 PostgreSQL
brew services start postgresql

# 创建数据库
createdb nextjs_auth

# 更新 .env.local
DATABASE_URL="postgresql://your_username@localhost:5432/nextjs_auth"
```

#### 运行数据库迁移

```bash
npm run db:push
# 或
npm run db:migrate
```

### 4. 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

将生成的字符串添加到 `.env.local` 的 `NEXTAUTH_SECRET`。

### 5. 配置 QQ 邮箱（可选）

1. 登录 QQ 邮箱
2. 进入"设置" > "账户"
3. 开启"POP3/SMTP服务"
4. 获取授权码（16位字符）
5. 添加到 `.env.local`

## 开发环境提示

项目启动时会自动检查环境变量配置，并在控制台显示：

- ✅ 配置正常：无提示
- ⚠️ 缺少配置：显示警告信息
- ❌ 生产环境缺少必需配置：显示错误并阻止启动

## 注意事项

1. **开发环境**：所有环境变量都是可选的，项目可以正常启动
2. **生产环境**：`DATABASE_URL` 和 `NEXTAUTH_SECRET` 是必需的
3. **邮件功能**：即使不配置，其他功能仍然可用
4. **数据库**：不配置时，注册、登录等功能不可用，但页面可以正常访问

## 故障排除

### 问题：项目启动但数据库操作失败

**原因**：未配置 `DATABASE_URL`

**解决**：
1. 配置 PostgreSQL 数据库
2. 在 `.env.local` 中添加 `DATABASE_URL`
3. 运行 `npm run db:push`

### 问题：邮件发送失败

**原因**：未配置 SMTP 相关环境变量

**解决**：
1. 配置 QQ 邮箱授权码
2. 在 `.env.local` 中添加所有 `SMTP_*` 变量

### 问题：NextAuth 错误

**原因**：生产环境缺少 `NEXTAUTH_SECRET`

**解决**：
1. 生成密钥：`openssl rand -base64 32`
2. 添加到 `.env.local`

## 下一步

配置完成后，可以：

1. 运行 `npm run dev` 启动开发服务器
2. 访问 `http://localhost:3000` 查看首页
3. 尝试注册新用户
4. 测试登录功能

