# 删除数据库中的用户信息

## 方法一：使用 Prisma Studio（最简单，推荐）⭐

### 步骤：

1. **启动 Prisma Studio**：
   ```bash
   npm run db:studio
   ```

2. **打开浏览器**：
   - 会自动打开 http://localhost:5555
   - 如果没有自动打开，手动访问该地址

3. **删除用户**：
   - 点击左侧的 `User` 表
   - 找到要删除的用户（通过邮箱搜索）
   - 点击用户记录
   - 点击右上角的 "Delete" 按钮
   - 确认删除

**优点**：可视化界面，操作简单，可以查看所有数据

---

## 方法二：使用命令行脚本（快速）

### 步骤：

1. **查看所有用户**：
   ```bash
   npm run db:list-users
   ```

2. **删除指定用户**：
   ```bash
   npm run db:delete-user <邮箱地址>
   ```
   
   例如：
   ```bash
   npm run db:delete-user test@example.com
   ```

**优点**：快速，适合批量操作

---

## 方法三：使用 psql 命令行（直接操作数据库）

### 步骤：

1. **连接数据库**：
   ```bash
   psql -d nextjs_auth
   ```

2. **查看所有用户**：
   ```sql
   SELECT id, email, name, "emailVerified", "createdAt" FROM "User";
   ```

3. **删除用户**（通过邮箱）：
   ```sql
   DELETE FROM "User" WHERE email = 'test@example.com';
   ```

4. **或者删除用户**（通过 ID）：
   ```sql
   DELETE FROM "User" WHERE id = 'user-id-here';
   ```

5. **退出**：
   ```sql
   \q
   ```

**注意**：由于设置了 `onDelete: Cascade`，删除用户会自动删除：
- 相关的 Account 记录
- 相关的 Session 记录
- 相关的 VerificationToken 记录
- 相关的 ResetToken 记录
- 相关的 LoginAttempt 记录

**优点**：直接操作数据库，适合熟悉 SQL 的用户

---

## 方法四：使用 SQL 脚本（批量删除）

### 创建删除脚本：

```bash
# 创建脚本文件
cat > delete_user.sql << 'EOF'
-- 删除指定邮箱的用户及其所有相关数据
DELETE FROM "User" WHERE email = 'test@example.com';
EOF

# 执行脚本
psql -d nextjs_auth -f delete_user.sql
```

---

## 方法五：清空所有用户数据（谨慎使用！）

### ⚠️ 警告：这会删除所有用户数据！

```bash
psql -d nextjs_auth
```

```sql
-- 删除所有用户（会级联删除所有相关数据）
DELETE FROM "User";

-- 或者使用 TRUNCATE（更快，但需要先禁用外键检查）
TRUNCATE TABLE "User" CASCADE;
```

---

## 推荐操作流程

### 快速删除单个用户：

```bash
# 1. 查看所有用户
npm run db:list-users

# 2. 删除指定用户
npm run db:delete-user your-email@example.com
```

### 使用可视化工具：

```bash
# 启动 Prisma Studio
npm run db:studio

# 然后在浏览器中操作
```

---

## 验证删除结果

### 方法 1：使用脚本查看
```bash
npm run db:list-users
```

### 方法 2：使用 Prisma Studio
```bash
npm run db:studio
```

### 方法 3：使用 psql
```bash
psql -d nextjs_auth -c "SELECT email FROM \"User\";"
```

---

## 常见问题

### Q: 删除用户后，相关的验证 Token 还在吗？
A: 不会。由于设置了 `onDelete: Cascade`，删除用户会自动删除所有相关数据。

### Q: 如何只删除用户，保留其他数据？
A: 不建议这样做，因为会导致数据不一致。如果需要，可以手动删除相关记录，但这不是推荐做法。

### Q: 删除后可以重新注册同一个邮箱吗？
A: 可以。删除用户后，该邮箱可以重新注册。

---

## 安全提示

⚠️ **生产环境操作前请备份数据库！**

```bash
# 备份数据库
pg_dump nextjs_auth > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库（如果需要）
psql -d nextjs_auth < backup_20240127_120000.sql
```

