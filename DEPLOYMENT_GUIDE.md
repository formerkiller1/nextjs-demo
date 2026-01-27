# 项目部署指南

## 🚀 快速部署方案

### 方案一：Vercel 部署（推荐，最简单）⭐

Vercel 是 Next.js 的官方推荐平台，部署最简单。

#### 步骤：

1. **准备代码仓库**
   ```bash
   # 初始化 Git（如果还没有）
   git init
   git add .
   git commit -m "Initial commit"
   
   # 推送到 GitHub/GitLab/Bitbucket
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 使用 GitHub/GitLab 账号登录
   - 点击 "New Project"
   - 导入你的仓库
   - 配置环境变量（见下方）
   - 点击 "Deploy"

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   SMTP_HOST=smtp.qq.com
   SMTP_PORT=587
   SMTP_USER=your-email@qq.com
   SMTP_PASSWORD=your-authorization-code
   SMTP_FROM=your-email@qq.com
   SMTP_FROM_NAME=Your App Name
   ```

4. **配置数据库**
   - 使用 Vercel Postgres（推荐）
   - 或使用外部 PostgreSQL（如 Supabase, Neon, Railway）

**优点**：
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（Git Push）
- ✅ 免费额度充足

---

### 方案二：Railway 部署（全栈部署）

Railway 可以同时部署应用和数据库。

#### 步骤：

1. **访问 Railway**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **添加 PostgreSQL**
   - 点击 "New" → "Database" → "PostgreSQL"
   - Railway 会自动创建数据库

4. **配置环境变量**
   - 在项目设置中添加环境变量
   - `DATABASE_URL` 会自动设置（从 PostgreSQL 服务）
   - 手动添加其他变量：
     ```
     NEXTAUTH_URL=https://your-app.railway.app
     NEXTAUTH_SECRET=your-secret-key
     SMTP_HOST=smtp.qq.com
     SMTP_PORT=587
     SMTP_USER=your-email@qq.com
     SMTP_PASSWORD=your-code
     SMTP_FROM=your-email@qq.com
     ```

5. **部署**
   - Railway 会自动检测 Next.js 项目
   - 自动构建和部署

**优点**：
- ✅ 应用和数据库一起部署
- ✅ 简单易用
- ✅ 有免费额度

---

### 方案三：Render 部署

#### 步骤：

1. **访问 Render**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库
   - 选择分支

3. **配置构建**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **添加 PostgreSQL**
   - 点击 "New" → "PostgreSQL"
   - 创建数据库实例

5. **配置环境变量**
   ```
   DATABASE_URL=<从 PostgreSQL 服务获取>
   NEXTAUTH_URL=https://your-app.onrender.com
   NEXTAUTH_SECRET=your-secret-key
   SMTP_HOST=smtp.qq.com
   SMTP_PORT=587
   SMTP_USER=your-email@qq.com
   SMTP_PASSWORD=your-code
   SMTP_FROM=your-email@qq.com
   ```

**优点**：
- ✅ 免费套餐可用
- ✅ 自动 HTTPS
- ✅ 简单配置

---

### 方案四：自建服务器部署（VPS）

#### 前置要求：
- VPS 服务器（如阿里云、腾讯云、DigitalOcean）
- Ubuntu/Debian 系统
- 域名（可选）

#### 步骤：

1. **服务器准备**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # 安装 PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # 安装 PM2（进程管理）
   sudo npm install -g pm2
   ```

2. **配置 PostgreSQL**
   ```bash
   # 创建数据库和用户
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE nextjs_auth;
   CREATE USER your_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE nextjs_auth TO your_user;
   \q
   ```

3. **部署代码**
   ```bash
   # 克隆项目
   git clone <your-repo-url>
   cd nextjs
   
   # 安装依赖
   npm install
   
   # 构建项目
   npm run build
   
   # 运行数据库迁移
   npm run db:push
   ```

4. **配置环境变量**
   ```bash
   # 创建 .env.local
   nano .env.local
   ```
   添加所有环境变量

5. **使用 PM2 启动**
   ```bash
   # 启动应用
   pm2 start npm --name "nextjs-auth" -- start
   
   # 设置开机自启
   pm2 startup
   pm2 save
   ```

6. **配置 Nginx（反向代理）**
   ```bash
   sudo apt install -y nginx
   ```
   
   创建配置文件：
   ```bash
   sudo nano /etc/nginx/sites-available/nextjs-auth
   ```
   
   内容：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   启用配置：
   ```bash
   sudo ln -s /etc/nginx/sites-available/nextjs-auth /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **配置 SSL（Let's Encrypt）**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📋 部署前检查清单

### 代码准备

- [ ] 代码已推送到 Git 仓库
- [ ] `.env.local` 已添加到 `.gitignore`（不会提交）
- [ ] 所有依赖已添加到 `package.json`
- [ ] 项目可以本地构建成功：`npm run build`

### 环境变量准备

- [ ] `DATABASE_URL` - 生产数据库连接字符串
- [ ] `NEXTAUTH_URL` - 生产环境 URL（如 `https://your-app.vercel.app`）
- [ ] `NEXTAUTH_SECRET` - 强随机密钥（使用 `openssl rand -base64 32` 生成）
- [ ] `SMTP_*` - 邮件服务配置

### 数据库准备

- [ ] 生产数据库已创建
- [ ] 数据库连接测试通过
- [ ] 已运行数据库迁移：`npm run db:push` 或 `npm run db:migrate`

### 安全检查

- [ ] 生产环境使用强 `NEXTAUTH_SECRET`
- [ ] 数据库密码足够强
- [ ] 邮件授权码已配置
- [ ] HTTPS 已启用（Vercel/Railway/Render 自动提供）

---

## 🔧 部署后配置

### 1. 验证部署

- [ ] 访问生产 URL，确认网站正常加载
- [ ] 测试注册功能
- [ ] 测试登录功能
- [ ] 测试邮箱验证
- [ ] 测试密码重置

### 2. 监控和日志

**Vercel**：
- 在 Dashboard 查看部署日志
- 查看 Analytics 和 Speed Insights

**Railway/Render**：
- 在 Dashboard 查看日志
- 设置告警

**自建服务器**：
```bash
# 查看 PM2 日志
pm2 logs nextjs-auth

# 查看系统日志
journalctl -u nginx
```

### 3. 数据库备份

**定期备份**：
```bash
# 备份数据库
pg_dump -h host -U user -d nextjs_auth > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -h host -U user -d nextjs_auth < backup_20240127.sql
```

---

## 🚨 常见部署问题

### 问题 1：构建失败

**原因**：环境变量未配置或代码错误

**解决**：
- 检查构建日志
- 确保所有环境变量已配置
- 本地测试构建：`npm run build`

### 问题 2：数据库连接失败

**原因**：`DATABASE_URL` 配置错误或数据库未启动

**解决**：
- 检查 `DATABASE_URL` 格式
- 确认数据库服务运行中
- 检查防火墙设置

### 问题 3：NextAuth 错误

**原因**：`NEXTAUTH_URL` 或 `NEXTAUTH_SECRET` 未配置

**解决**：
- 确保 `NEXTAUTH_URL` 是完整的生产 URL
- 确保 `NEXTAUTH_SECRET` 已设置

### 问题 4：邮件发送失败

**原因**：SMTP 配置错误或网络问题

**解决**：
- 检查 SMTP 配置
- 确认 QQ 邮箱授权码正确
- 检查服务器防火墙是否允许 SMTP 端口

---

## 📊 推荐部署方案对比

| 方案 | 难度 | 成本 | 适合场景 |
|------|------|------|----------|
| **Vercel** | ⭐ 最简单 | 免费/付费 | 个人项目、小型应用 |
| **Railway** | ⭐⭐ 简单 | 免费/付费 | 需要数据库的全栈应用 |
| **Render** | ⭐⭐ 简单 | 免费/付费 | 中小型应用 |
| **自建 VPS** | ⭐⭐⭐⭐ 复杂 | 付费 | 大型应用、需要完全控制 |

---

## 🎯 快速部署命令（Vercel）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 配置环境变量（在 Vercel Dashboard 或使用 CLI）
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... 其他变量

# 5. 生产环境部署
vercel --prod
```

---

## 📝 部署后维护

### 更新部署

**自动部署**（推荐）：
- 推送到 Git 主分支
- 平台自动检测并部署

**手动部署**：
```bash
# Vercel
vercel --prod

# Railway/Render
# 在 Dashboard 点击 "Redeploy"
```

### 查看日志

```bash
# Vercel CLI
vercel logs

# Railway CLI
railway logs

# PM2（自建服务器）
pm2 logs nextjs-auth
```

---

## ✅ 部署成功检查

部署完成后，验证以下功能：

1. ✅ 首页可以访问
2. ✅ 注册功能正常
3. ✅ 邮箱验证邮件可以收到
4. ✅ 登录功能正常
5. ✅ Dashboard 可以访问
6. ✅ 登出功能正常
7. ✅ 密码重置功能正常

---

## 🆘 需要帮助？

如果部署遇到问题：

1. 查看平台文档
2. 检查构建日志
3. 验证环境变量配置
4. 测试数据库连接
5. 查看应用日志

