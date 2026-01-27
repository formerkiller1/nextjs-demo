# 🚀 快速部署指南（5分钟）

## 最简单方式：Vercel 一键部署

### 步骤 1：准备代码（2分钟）

```bash
# 1. 初始化 Git（如果还没有）
git init
git add .
git commit -m "Ready for deployment"

# 2. 推送到 GitHub
# 在 GitHub 创建新仓库，然后：
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 步骤 2：在 Vercel 部署（3分钟）

1. **访问** https://vercel.com
2. **登录** 使用 GitHub 账号
3. **导入项目** 点击 "New Project" → 选择你的仓库
4. **配置环境变量** 在项目设置中添加：

```
DATABASE_URL=你的数据库连接字符串
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=使用 openssl rand -base64 32 生成
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=你的QQ邮箱
SMTP_PASSWORD=你的授权码
SMTP_FROM=你的QQ邮箱
SMTP_FROM_NAME=你的应用名称
```

5. **点击 Deploy** 等待部署完成

### 步骤 3：配置数据库

**选项 A：使用 Vercel Postgres（推荐）**
- 在 Vercel 项目中选择 "Storage" → "Create Database" → "Postgres"
- 会自动设置 `DATABASE_URL`

**选项 B：使用外部数据库**
- Supabase: https://supabase.com（免费）
- Neon: https://neon.tech（免费）
- Railway: https://railway.app（免费额度）

### 步骤 4：运行数据库迁移

部署完成后，在 Vercel 的部署日志中运行：

```bash
# 或者使用 Vercel CLI
vercel env pull .env.local
npm run db:push
```

或者使用 Vercel 的 Postgres，它会自动创建表结构。

---

## 🎯 一键部署命令（Vercel CLI）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署（会自动检测 Next.js）
vercel

# 添加环境变量
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... 添加其他变量

# 生产环境部署
vercel --prod
```

---

## 📋 部署前必做检查

- [ ] 代码已推送到 Git
- [ ] `.env.local` 在 `.gitignore` 中（不会提交）
- [ ] 本地构建成功：`npm run build`
- [ ] 生成了强 `NEXTAUTH_SECRET`：`openssl rand -base64 32`

---

## ✅ 部署后验证

访问你的 Vercel URL，测试：
- [ ] 首页加载正常
- [ ] 可以注册
- [ ] 可以登录
- [ ] 邮箱验证正常

---

## 🆘 遇到问题？

1. **构建失败** → 检查环境变量是否全部配置
2. **数据库错误** → 确认 `DATABASE_URL` 正确
3. **NextAuth 错误** → 检查 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET`

查看详细部署指南：`DEPLOYMENT_GUIDE.md`

