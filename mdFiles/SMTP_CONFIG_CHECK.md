# QQ 邮箱 SMTP 配置检查指南

## 正确的配置格式（第 8-14 行）

```env
# QQ邮箱SMTP配置（可选，不配置时邮件功能不可用）
SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-qq-email@qq.com"
SMTP_PASSWORD="your-qq-email-authorization-code"
SMTP_FROM="your-qq-email@qq.com"
SMTP_FROM_NAME="Next.js App"
```

## 配置检查清单

### ✅ 必须修改的项

1. **SMTP_USER**（第 10 行）
   - ❌ 错误：`SMTP_USER="your-qq-email@qq.com"`
   - ✅ 正确：`SMTP_USER="123456789@qq.com"` （您的实际 QQ 邮箱）

2. **SMTP_PASSWORD**（第 11 行）
   - ❌ 错误：`SMTP_PASSWORD="your-qq-email-authorization-code"`
   - ✅ 正确：`SMTP_PASSWORD="abcdefghijklmnop"` （16位授权码）

3. **SMTP_FROM**（第 12 行）
   - ❌ 错误：`SMTP_FROM="your-qq-email@qq.com"`
   - ✅ 正确：`SMTP_FROM="123456789@qq.com"` （与 SMTP_USER 相同）

### ✅ 可以保持默认的项

1. **SMTP_HOST**（第 9 行）
   - ✅ 正确：`SMTP_HOST="smtp.qq.com"` （QQ 邮箱固定值）

2. **SMTP_PORT**（第 10 行）
   - ✅ 正确：`SMTP_PORT=587` （QQ 邮箱推荐端口）

3. **SMTP_FROM_NAME**（第 13 行）
   - ✅ 可选：`SMTP_FROM_NAME="Next.js App"` （可以自定义）

## 常见错误

### ❌ 错误示例 1：未修改占位符
```env
SMTP_USER="your-qq-email@qq.com"  # ❌ 这是占位符，必须改为真实邮箱
SMTP_PASSWORD="your-qq-email-authorization-code"  # ❌ 这是占位符，必须改为真实授权码
```

### ❌ 错误示例 2：使用 QQ 密码而不是授权码
```env
SMTP_PASSWORD="your-qq-password"  # ❌ 不能使用 QQ 密码，必须使用授权码
```

### ❌ 错误示例 3：缺少引号
```env
SMTP_USER=123456789@qq.com  # ❌ 应该加引号
SMTP_PASSWORD=abcdefghijklmnop  # ❌ 应该加引号
```

### ✅ 正确示例
```env
SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="123456789@qq.com"
SMTP_PASSWORD="abcdefghijklmnop"
SMTP_FROM="123456789@qq.com"
SMTP_FROM_NAME="Next.js App"
```

## 如何获取 QQ 邮箱授权码

1. 登录 QQ 邮箱：https://mail.qq.com
2. 点击"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
5. 点击"生成授权码"
6. 按照提示发送短信验证
7. 获取 16 位授权码（类似：`abcdefghijklmnop`）

## 配置验证

配置完成后，可以通过以下方式验证：

1. **启动项目**：
   ```bash
   npm run dev
   ```

2. **尝试注册用户**：
   - 访问 http://localhost:3000/register
   - 填写信息并提交
   - 如果配置正确，会发送验证邮件
   - 如果配置错误，会在控制台显示错误信息

3. **查看控制台日志**：
   - 配置正确：会显示"验证邮件已发送"
   - 配置错误：会显示"邮件服务配置错误"或"发送验证邮件失败"

## 注意事项

1. **授权码不是密码**：必须使用授权码，不能使用 QQ 密码
2. **授权码保密**：不要泄露授权码，不要提交到 Git
3. **端口选择**：
   - `587`：推荐使用（TLS）
   - `465`：也可以使用（SSL），需要设置 `secure: true`
4. **可选配置**：如果暂时不需要邮件功能，可以删除或注释掉这些配置

## 如果不需要邮件功能

如果暂时不需要邮件功能，可以：

1. **删除这些配置**（推荐）
2. **或者注释掉**：
   ```env
   # SMTP_HOST="smtp.qq.com"
   # SMTP_PORT=587
   # ...
   ```

项目仍然可以正常运行，只是邮件相关功能（邮箱验证、密码重置）不可用。

