## 自建服务器部署方案（Docker + Nginx + 本地 PostgreSQL）

> 适用场景：单台国内云服务器，Ubuntu 22.04，支持同时在线约 20 人，使用 QQ 邮箱 SMTP，Next.js 项目当前已部署在 Vercel，目标迁移到自建服务器。

---

## 1. 整体架构说明

- **基础设施**
  - 一台国内云服务器（推荐 Ubuntu 22.04 LTS，2C / 4G / ≥80G SSD）。
  - 一枚已备案的自有域名，解析到服务器公网 IP。

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
  - 用户 → `https://your-domain.com` → Nginx 容器（80/443） → `web:3000`
  - `web` 容器通过 Docker 内网访问 `db:5432`

---

## 2. 前置条件与准备工作

### 2.1 服务器购买与基础配置

- **云厂商**：阿里云 / 腾讯云 / 华为云 均可，选择离主要用户最近的机房。
- **推荐配置**
  - CPU：2 核
  - 内存：4 GB
  - 磁盘：≥ 80 GB SSD（推荐 100 GB）
  - 带宽：1–5 Mbps（支撑 20 人在线足够）
- **操作系统**
  - Ubuntu Server 22.04 LTS

### 2.2 安全组 / 防火墙

- 在云厂商控制台中放行端口：
  - `22`：SSH（仅自己 IP 或可信网段）
  - `80`：HTTP
  - `443`：HTTPS

如使用 `ufw`，示例：

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2.3 域名与备案

- 域名指向：在域名服务商处将 A 记录解析到服务器公网 IP。
- 备案：
  - 使用国内云需要 ICP 备案，按照云厂商流程完成。
  - 备案期间可以使用 IP 或临时域名进行内部联调，但正式上线前建议完成备案。

---

## 3. 服务器基础环境搭建

> 本节所有命令均在服务器上以 `root` 或 `sudo` 权限执行。

### 3.1 系统更新与基础工具

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl vim
```

### 3.2 安装 Docker 与 docker-compose

参考官方文档或简要步骤：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sudo bash

# 将当前用户加入 docker 组（可选）
sudo usermod -aG docker $USER
# 重新登录终端后生效

# 检查 Docker
docker version

# 安装 docker compose plugin（新版本一般自带）
docker compose version
```

---

## 4. 项目获取与目录规划

### 4.1 目录约定

在服务器上约定项目路径为：

- 项目代码目录：`/srv/nextjs-app`
- PostgreSQL 数据目录：`/data/postgres`

可根据实际情况调整，但需要与后续 `docker-compose.yml` 保持一致。

### 4.2 克隆项目

```bash
sudo mkdir -p /srv
sudo chown -R $USER:$USER /srv

cd /srv
git clone <你的仓库地址> nextjs-app
cd nextjs-app
```

> 注意：不要在仓库中提交真实的生产环境秘钥文件（如 `.env.production`）。

---

## 5. 环境变量设计（生产环境）

> 目标：在生产环境使用单独的 `.env.production` 文件，通过 docker-compose 注入到 `web` 容器中，遵守最小改动原则，不破坏现有 `.env.local` 开发流程。

### 5.1 关键变量列表

结合 `mdFiles/ENV_SETUP.md`，生产环境至少需要：

- **数据库相关**
  - `DATABASE_URL="postgresql://<user>:<password>@db:5432/<dbname>"`
- **NextAuth**
  - `NEXTAUTH_URL="https://your-domain.com"`
  - `NEXTAUTH_SECRET="生产环境随机秘钥"`
- **SMTP / QQ 邮箱**
  - `SMTP_HOST="smtp.qq.com"`
  - `SMTP_PORT=587`
  - `SMTP_USER="your-qq-email@qq.com"`
  - `SMTP_PASSWORD="your-qq-email-authorization-code"`
  - `SMTP_FROM="your-qq-email@qq.com"`
  - `SMTP_FROM_NAME="Next.js App"`

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

NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-generated-secret"

SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-qq-email@qq.com"
SMTP_PASSWORD="your-qq-email-authorization-code"
SMTP_FROM="your-qq-email@qq.com"
SMTP_FROM_NAME="Next.js App"
```

> 建议在仓库中添加 `.env.production.example`（不含真实秘钥），实际 `.env.production` 仅存在服务器上并加入 `.gitignore`。

---

## 6. Docker 化设计（方案说明）

> 本节说明未来将如何编写 `Dockerfile` 和 `docker-compose.yml`，当前仅为方案，不直接修改代码。

### 6.1 Dockerfile 设计思路（多阶段构建）

- **阶段一：构建阶段**
  - 基于官方 `node:20-alpine` 等轻量镜像。
  - 拷贝 `package.json`、`package-lock.json` 等。
  - 执行 `npm install`、`npm run build`。
- **阶段二：运行阶段**
  - 基于 `node:20-alpine` 或更小镜像。
  - 拷贝构建产物 `.next`、`public`、`node_modules`、`package*.json`。
  - 以 `npm run start` 启动，内部监听 `3000` 端口。

特点：

- 减小最终镜像体积，只包含运行所需文件。
- 与本地开发环境一致（同一版本 Node 与依赖）。

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

## 7. Nginx + HTTPS 方案说明

### 7.1 宿主机 Certbot 获取证书

- 在宿主机安装 Certbot（以 Ubuntu 为例）：

```bash
sudo apt install -y certbot
```

- 暂时停止占用 80/443 端口的进程（若已启动 Nginx 容器则先 `docker compose down`）。
- 使用 standalone 模式申请证书：

```bash
sudo certbot certonly --standalone -d your-domain.com
```

- 证书默认存放路径：
  - `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
  - `/etc/letsencrypt/live/your-domain.com/privkey.pem`

后续会将 `/etc/letsencrypt` 挂载到 Nginx 容器中使用。

### 7.2 Nginx 配置思路

在项目根目录新增 `nginx/default.conf`，未来大致包含：

- 一个 `server` 块监听 `80`：
  - 用于 HTTP → HTTPS 重定向。
- 一个 `server` 块监听 `443`：
  - 加载 Let’s Encrypt 证书。
  - `proxy_pass http://web:3000;`
  - 传递真实 IP、Host 等头部。

示意逻辑（伪代码形式）：

```nginx
server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name your-domain.com;

  ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

  location / {
    proxy_pass http://web:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

> 实际文件编写时将结合具体域名与路径进行微调。

---

## 8. 部署步骤（首发上线流程）

> 该流程假设 Docker 及 docker-compose 已安装，项目代码已克隆到 `/srv/nextjs-app`，且 `.env.production` 已在服务器创建好。

### 步骤 1：创建 PostgreSQL 数据目录

```bash
sudo mkdir -p /data/postgres
sudo chown -R $USER:$USER /data/postgres
```

### 步骤 2：编写/确认 `docker-compose.yml` 与 `Dockerfile`

- 在本项目根目录中按照第 6 节方案创建：
  - `Dockerfile`
  - `docker-compose.yml`
  - `nginx/default.conf`

> 注意：本方案阶段仅为设计，实际文件创建应在双方确认后，按“最小改动原则”逐步完成。

### 步骤 3：启动数据库容器

```bash
cd /srv/nextjs-app
docker compose up -d db
docker compose logs db
```

确认 PostgreSQL 容器启动正常。

### 步骤 4：初始化数据库（手动一次）

> 遵循「初始化手动执行一次」策略，避免在启动脚本中写死迁移逻辑。

```bash
cd /srv/nextjs-app
docker compose run --rm web npm run db:push
# 或根据当前项目使用的迁移命令：
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

- `http://your-domain.com`（若已配置 80→443 重定向，则会自动跳到 HTTPS）。

### 步骤 6：配置 HTTPS（若尚未完成）

1. 停止 Nginx 容器：
   ```bash
   docker compose down
   ```
2. 使用 Certbot standalone 模式申请证书（见 7.1）。  
3. 再次启动所有容器：
   ```bash
   docker compose up -d
   ```
4. 确认 `https://your-domain.com` 访问正常。

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
  - 邮件链接的域名为 `https://your-domain.com`。
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

## 10. 后续可选优化方向

- **自动备份 PostgreSQL**
  - 使用 `pg_dump` 定时任务备份到对象存储（OSS / COS / S3 等）。
  - 或在宿主机上对 `/data/postgres` 做定期快照。
- **监控与告警**
  - 引入 Loki / Promtail / Grafana 或使用云厂商监控。
- **CI/CD**
  - 配合 GitHub Actions / GitLab CI，在推送到主分支时自动构建并部署到服务器。

---

## 11. 实施节奏建议

1. 在本地或测试服务器上先按照本方案跑通一套（即使不备案、不上 HTTPS），熟悉整体流程。
2. 确认流程无误后，再在正式服务器上执行，并完成 HTTPS 与备案。
3. 整个迁移过程中保留 Vercel 部署作为备用方案，待自建环境稳定运行一段时间后再下线 Vercel。

> 本文档为部署方案说明，后续在真正开始编写 `Dockerfile`、`docker-compose.yml` 与 `nginx/default.conf` 时，应继续遵守「最小改动原则」与「每一步先确认再实现」的协作方式。


