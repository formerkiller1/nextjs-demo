## 阿里云 ECS 自建部署方案（Docker + Nginx + 本地 PostgreSQL）

> 适用场景：阿里云 ECS（Alibaba Cloud Linux 3），2C / 2G / ≥40G SSD，个人项目 / 小规模在线应用，使用 QQ 邮箱 SMTP，Next.js 项目当前已部署在 Vercel，目标迁移到自建服务器（域名 `dctcoder.xyz`）。

---

## 1. 整体架构说明

- **基础设施**
  - 一台阿里云 ECS（Alibaba Cloud Linux 3.2104 LTS，2 核 / 2G / ≥40G SSD / 公网带宽 3 Mbps）。
  - 已备案的域名 `dctcoder.xyz`，A 记录解析到服务器公网 IP。

- **容器组成（通过 Docker + docker-compose 管理）**
  - `web`：Next.js 应用容器  
    - 内部运行：`npm run build` + `npm run start`（生产模式）  
    - 监听端口：`3000`
  - `db`：PostgreSQL 容器  
    - 持久化数据：挂载到宿主机 `/data/postgres`  
    - 仅在 Docker 内网暴露端口 `5432`
  - `nginx`：Nginx 反向代理容器  
    - 对外暴露：宿主机 `80` / `443` 端口  
    - 反向代理：`web:3000`  
    - SSL 证书：由宿主机 Certbot 从 Let’s Encrypt 获取，挂载到容器中

- **网络路径**
  - 用户 → `https://dctcoder.xyz` → Nginx 容器（80/443）→ `web:3000`
  - `web` 容器通过 Docker 内网访问 `db:5432`

- **迁移策略**
  - 迁移期间保留 Vercel 部署，DNS 灰度或一键切换，出现问题可快速回退。
  - 生产数据库从空库开始，无需迁移旧数据。

---

## 2. 前置条件与准备工作

### 2.1 服务器与系统

- **云厂商**：阿里云 ECS
- **推荐配置**
  - CPU：2 核
  - 内存：2 GB（如有条件建议 4 GB）
  - 磁盘：≥ 40 GB SSD（推荐 80 GB）
  - 带宽：1–5 Mbps
- **操作系统**
  - Alibaba Cloud Linux 3.2104 LTS 64 位

### 2.2 安全组 / 防火墙

- 在阿里云控制台中开放端口：
  - `22`：SSH（建议限制为自己 IP）
  - `80`：HTTP
  - `443`：HTTPS

如使用 `firewalld` 可按需放行端口（可选）。

### 2.3 域名与备案

- 域名：`dctcoder.xyz`
  - A 记录指向 ECS 公网 IP。
- 备案：已完成 ICP 备案，可直接对公网提供服务。

---

## 3. 服务器基础环境搭建

> 本节命令基于 Alibaba Cloud Linux 3，使用 `yum`/`dnf` 包管理。所有命令在服务器上以 `root` 或 `sudo` 权限执行。

### 3.1 系统更新与基础工具

```bash
sudo yum update -y
sudo yum install -y git curl vim
```

### 3.2 安装 Docker 与 docker-compose

#### 3.2.1 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh

# 启动并设置开机自启
sudo systemctl enable --now docker

# 检查 Docker 状态
docker version
```

#### 3.2.2 配置非 root 用户（可选）

```bash
sudo usermod -aG docker $USER
# 重新登录终端后生效
```

#### 3.2.3 检查 docker-compose（插件方式）

```bash
docker compose version
```

> 说明：新版本 Docker 一般自带 compose 插件，无需单独安装。

---

## 4. 项目目录与代码获取

### 4.1 目录约定

- 项目代码目录：`/srv/nextjs-app`
- PostgreSQL 数据目录：`/data/postgres`

可根据实际情况微调，但需与 `docker-compose.yml` 中保持一致。

### 4.2 创建目录与拉取代码

```bash
sudo mkdir -p /srv /data/postgres
sudo chown -R $USER:$USER /srv /data/postgres

cd /srv
git clone <你的仓库地址> nextjs-app
cd nextjs-app
```

> 注意：不要在仓库中提交真实的生产环境秘钥文件（如 `.env.production`）。

---

## 5. 环境变量设计（生产环境）

> 目标：在生产环境使用单独的 `.env.production` 文件，通过 docker-compose 注入到 `web` 容器中，不影响开发环境的 `.env.local` 流程。

### 5.1 关键变量列表

结合 `mdFiles/ENV_SETUP.md`，生产环境至少需要：

- **数据库相关**
  - `DATABASE_URL="postgresql://<user>:<password>@db:5432/<dbname>"`
- **NextAuth**
  - `NEXTAUTH_URL="https://dctcoder.xyz"`
  - `NEXTAUTH_SECRET="生产环境随机秘钥"`
- **SMTP / QQ 邮箱**
  - `SMTP_HOST="smtp.qq.com"`
  - `SMTP_PORT=587`
  - `SMTP_USER="your-qq-email@qq.com"`
  - `SMTP_PASSWORD="your-qq-email-authorization-code"`
  - `SMTP_FROM="your-qq-email@qq.com"`
  - `SMTP_FROM_NAME="dctcoder.xyz"`

### 5.2 生成 NEXTAUTH_SECRET

在本地或服务器执行：

```bash
openssl rand -base64 32
```

将输出值填入 `NEXTAUTH_SECRET`。

### 5.3 创建 `.env.production`（仅在服务器上）

在项目根目录 `/srv/nextjs-app` 创建：

```bash
cd /srv/nextjs-app
touch .env.production
vim .env.production
```

示例内容（请根据实际值修改）：

```env
DATABASE_URL="postgresql://app_user:strong_password@db:5432/app_db"

NEXTAUTH_URL="https://dctcoder.xyz"
NEXTAUTH_SECRET="your-generated-secret"

SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-qq-email@qq.com"
SMTP_PASSWORD="your-qq-email-authorization-code"
SMTP_FROM="your-qq-email@qq.com"
SMTP_FROM_NAME="dctcoder.xyz"
```

> 建议在仓库中添加 `.env.production.example`（不含真实秘钥），实际 `.env.production` 仅存在服务器上并加入 `.gitignore`。

---

## 6. Docker 化设计（Next.js + PostgreSQL + Nginx）

### 6.1 Dockerfile 设计思路（多阶段构建）

- **阶段一：构建阶段**
  - 基于官方 `node:20-alpine` 等轻量镜像。
  - 拷贝 `package.json`、`package-lock.json` 等。
  - 执行 `npm ci`（或 `npm install`）安装依赖。
  - 拷贝源码，执行 `npm run build`。
- **阶段二：运行阶段**
  - 同样基于 `node:20-alpine`。
  - 拷贝构建产物 `.next`、`public`、`node_modules`、`package*.json`。
  - 以 `npm run start` 启动，内部监听 `3000` 端口。

特点：

- 减小最终镜像体积，只包含运行所需文件。
- 构建和运行环境分离，便于升级和调试。

### 6.2 docker-compose.yml 设计思路

- **整体结构**
  - `services`：
    - `db`：PostgreSQL 容器
    - `web`：Next.js 容器
    - `nginx`：Nginx 容器
  - `volumes`：
    - `db-data`：或直接绑定宿主机目录 `/data/postgres`
    - `letsencrypt`：宿主机 `/etc/letsencrypt`（证书）
  - `networks`：至少一个默认网络让容器互通。

- **db 服务**
  - 镜像：`postgres:16-alpine`
  - 环境变量：`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`
  - 卷：`/data/postgres:/var/lib/postgresql/data`
  - 仅暴露给内部网络（不映射到宿主机端口）。

- **web 服务**
  - 构建自项目根目录的 `Dockerfile`
  - 依赖：`depends_on: [db]`
  - 环境文件：`env_file: .env.production`
  - 端口：不对外暴露，只在 Docker 网络内供 Nginx 访问（`web:3000`）。

- **nginx 服务**
  - 镜像：`nginx:alpine`
  - 端口：映射 `80:80`、`443:443`
  - 配置：挂载项目内 `nginx/default.conf` 到 `/etc/nginx/conf.d/default.conf`
  - 证书：挂载宿主机 `/etc/letsencrypt` 为只读。

---

## 7. Nginx + HTTPS 方案（Certbot standalone）

### 7.1 宿主机 Certbot 获取证书

- 在宿主机安装 Certbot：

```bash
sudo yum install -y certbot
```

- 确保 `dctcoder.xyz` 的 A 记录指向当前 ECS 公网 IP。
- 暂时停止占用 80/443 端口的进程（若已启动 Nginx 容器则先 `docker compose down`）。
- 使用 standalone 模式申请证书：

```bash
sudo certbot certonly --standalone -d dctcoder.xyz
```

- 证书默认存放路径：
  - `/etc/letsencrypt/live/dctcoder.xyz/fullchain.pem`
  - `/etc/letsencrypt/live/dctcoder.xyz/privkey.pem`

后续会将 `/etc/letsencrypt` 挂载到 Nginx 容器中使用。

### 7.2 Nginx 配置思路

在项目根目录新增 `nginx/default.conf`，大致包含：

- 一个 `server` 块监听 `80`：
  - 用于 HTTP → HTTPS 重定向。
- 一个 `server` 块监听 `443`：
  - 加载 Let’s Encrypt 证书。
  - `proxy_pass http://web:3000;`
  - 传递真实 IP、Host 等头部。

示例配置逻辑（示意）：

```nginx
server {
  listen 80;
  server_name dctcoder.xyz;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name dctcoder.xyz;

  ssl_certificate     /etc/letsencrypt/live/dctcoder.xyz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/dctcoder.xyz/privkey.pem;

  location / {
    proxy_pass http://web:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 8. 部署步骤（首发上线流程）

> 假设 Docker 已安装，项目代码已克隆到 `/srv/nextjs-app`，且 `.env.production` 已在服务器创建好。

### 步骤 1：创建 PostgreSQL 数据目录

```bash
sudo mkdir -p /data/postgres
sudo chown -R $USER:$USER /data/postgres
```

### 步骤 2：编写/确认 `Dockerfile`、`docker-compose.yml` 与 `nginx/default.conf`

- 在本项目根目录中按照第 6 节方案创建：
  - `Dockerfile`
  - `docker-compose.yml`
  - `nginx/default.conf`

> 实际实施时应遵守「最小改动原则」，每一步改动完成后进行测试与确认。

### 步骤 3：启动数据库容器

```bash
cd /srv/nextjs-app
docker compose up -d db
docker compose logs db
```

确认 PostgreSQL 容器启动正常。

### 步骤 4：初始化数据库（手动一次）

> 采用「初始化手动执行一次」策略，避免在启动脚本中写死迁移逻辑。

```bash
cd /srv/nextjs-app
docker compose run --rm web npm run db:push
# 若后续改用 migrate 流程，可替换为：
# docker compose run --rm web npm run db:migrate
```

执行完成后，数据库结构会同步到 `db` 容器内的 PostgreSQL。

### 步骤 5：构建并启动所有容器

```bash
cd /srv/nextjs-app
docker compose build
docker compose up -d
```

查看日志：

```bash
docker compose logs -f web
docker compose logs -f nginx
```

在浏览器中访问：

- `http://dctcoder.xyz`（若已配置 80→443 重定向，则会自动跳到 HTTPS）。

### 步骤 6：配置 HTTPS（若尚未完成证书）

1. 停止 Nginx 容器：

   ```bash
   docker compose down
   ```

2. 使用 Certbot standalone 模式申请证书（见 7.1）。  
3. 再次启动所有容器：

   ```bash
   docker compose up -d
   ```

4. 确认 `https://dctcoder.xyz` 访问正常。

> 修改 `NEXTAUTH_URL` 为 HTTPS 域名后，需要重新 `docker compose build` + `up -d`。

---

## 9. 测试用例与验收要点

### 9.1 基础功能

- 访问首页 `/`，页面正常渲染，无 500 错误。
- 刷新页面、多路由跳转正常。

### 9.2 认证与权限

- 注册新用户：
  - 表单提交无报错。
  - `users` 表中出现新记录（可使用 `prisma studio` 或 `psql` 检查）。
- 登录 / 退出：
  - 登录成功后可访问受保护页面（如 `dashboard`）。
  - 未登录访问受保护页面时正确跳转到登录页。

### 9.3 邮件相关

- 注册流程发送验证邮件：
  - QQ 邮箱能收到邮件。
  - 邮件链接的域名为 `https://dctcoder.xyz`。
  - 点击链接后账号状态更新为已验证。
- 忘记密码流程：
  - 提交邮箱后可以收到重置邮件。
  - 通过邮件链接进入重置页面，设置新密码后可成功登录。

### 9.4 稳定性与恢复能力

- 重启 Docker 服务 / 服务器：
  - 执行 `docker compose up -d` 后，服务能自动恢复。
- 回滚流程：
  - 如新版本有问题，可：
    - `git checkout` 回滚到旧版本；
    - `docker compose build`；
    - `docker compose up -d`；
  - 确保数据库迁移方案支持回滚或向前兼容。

---

## 10. 迁移与回退策略

- 迁移期间保留 Vercel 部署：
  - 在 DNS 中通过切换 A 记录实现回退（指回 Vercel 或 ECS）。
  - 建议降低 DNS TTL，便于快速切换。
- 当 ECS 环境稳定运行后：
  - 可保留 Vercel 作为备用，或完全关闭 Vercel 项目。

---

## 11. 实施节奏建议

1. 在 ECS 上按本文档，从基础环境到 Docker 化、数据库初始化、HTTPS 配置，完整跑通一遍。
2. 使用 `https://dctcoder.xyz` 进行功能联调和验收，确保主要功能（注册、登录、邮件、游戏等）正常。
3. 确认无误后，将正式流量全部切到 ECS，并按需下线 Vercel。
4. 后续可根据需要增加自动备份、监控、CI/CD 等能力。

> 本文档为阿里云 ECS 部署方案说明，实际执行时建议分步骤实施与验证，每一步修改前后都进行最小范围测试，确保可随时回滚。


