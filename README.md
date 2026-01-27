# Next.js 全栈认证系统

一个完整的 Next.js 全栈认证解决方案，包含用户注册、登录、邮箱验证、密码重置等功能。

## 功能特性

- ✅ 用户注册与登录
- ✅ 邮箱验证（QQ邮箱）
- ✅ 密码重置
- ✅ 记住我功能
- ✅ 登录尝试限制（防暴力破解）
- ✅ JWT Token 认证（存储在 Cookie）
- ✅ 路由保护
- ✅ 密码强度验证
- ✅ 响应式 UI（Tailwind CSS）

## 技术栈

- **框架**: Next.js 16 (App Router)
- **认证**: NextAuth.js v5 (Auth.js)
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **密码加密**: bcryptjs
- **表单验证**: React Hook Form + Zod
- **UI**: Tailwind CSS
- **邮件服务**: Nodemailer (QQ邮箱)

## 项目结构

```
nextjs/
├── app/
│   ├── (auth)/              # 认证相关路由组
│   │   ├── login/           # 登录页面
│   │   ├── register/        # 注册页面
│   │   ├── verify-email/    # 邮箱验证页面
│   │   ├── forgot-password/ # 忘记密码页面
│   │   └── reset-password/  # 重置密码页面
│   ├── api/
│   │   ├── auth/            # NextAuth API
│   │   ├── register/        # 注册API
│   │   ├── verify-email/    # 邮箱验证API
│   │   ├── forgot-password/ # 忘记密码API
│   │   └── reset-password/  # 重置密码API
│   ├── dashboard/           # 受保护页面
│   └── page.tsx             # 首页
├── components/
│   ├── auth/                # 认证相关组件
│   ├── ui/                  # 基础UI组件
│   └── providers/           # 上下文提供者
├── lib/
│   ├── auth.ts              # NextAuth 配置
│   ├── db.ts                # Prisma 客户端
│   ├── email.ts             # 邮件服务
│   ├── validations.ts       # Zod 验证Schema
│   └── utils.ts             # 工具函数
├── prisma/
│   └── schema.prisma        # 数据库模型
└── middleware.ts            # 路由保护中间件
```

## 环境变量配置

创建 `.env.local` 文件（参考 `.env.example`）：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# QQ邮箱SMTP配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-qq-email@qq.com"
SMTP_PASSWORD="your-qq-email-authorization-code"
SMTP_FROM="your-qq-email@qq.com"
```

### 获取 QQ 邮箱授权码

1. 登录 QQ 邮箱
2. 进入"设置" > "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
5. 按照提示获取授权码（16位字符）

### 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

确保 PostgreSQL 已安装并运行，然后更新 `.env.local` 中的 `DATABASE_URL`。

### 3. 运行数据库迁移

```bash
npm run db:migrate
```

或者使用 `db:push`（开发环境）：

```bash
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 数据库管理

### 查看数据库（Prisma Studio）

```bash
npm run db:studio
```

### 生成 Prisma Client

```bash
npm run db:generate
```

## 使用说明

### 注册新用户

1. 访问 `/register`
2. 填写邮箱、密码等信息
3. 提交后查收验证邮件
4. 点击邮件中的验证链接
5. 验证成功后可以登录

### 登录

1. 访问 `/login`
2. 输入邮箱和密码
3. 可选择"记住我"（延长会话时间）
4. 登录成功后跳转到 `/dashboard`

### 忘记密码

1. 访问 `/forgot-password`
2. 输入注册邮箱
3. 查收密码重置邮件
4. 点击邮件中的重置链接
5. 设置新密码

### 登出

在 Dashboard 页面点击"登出"按钮

## 安全特性

- **密码加密**: 使用 bcryptjs（12轮加密）
- **JWT Token**: 存储在 HttpOnly Cookie 中
- **登录限制**: 1小时内最多5次失败尝试
- **邮箱验证**: 必须验证邮箱才能登录
- **密码强度**: 至少8位，包含大小写字母和数字
- **CSRF 防护**: NextAuth.js 内置防护

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库相关
npm run db:generate    # 生成 Prisma Client
npm run db:push         # 推送 Schema 到数据库
npm run db:migrate      # 运行数据库迁移
npm run db:studio       # 打开 Prisma Studio
```

## 注意事项

1. **生产环境**: 
   - 确保 `NEXTAUTH_SECRET` 是强随机字符串
   - 使用 HTTPS
   - 设置 `secure: true` 的 Cookie

2. **邮件服务**: 
   - 确保 QQ 邮箱授权码正确
   - 测试邮件发送功能

3. **数据库**: 
   - 定期备份数据库
   - 生产环境使用连接池

## 许可证

MIT
