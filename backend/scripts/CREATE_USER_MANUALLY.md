# 手动创建用户指南

由于 Supabase 的行级安全策略（RLS）阻止了程序化创建用户，您需要手动在 Supabase Dashboard 中创建用户。

## 步骤：

### 1. 访问 Supabase Dashboard

- 打开 https://supabase.com/dashboard
- 登录您的账户
- 选择您的项目

### 2. 禁用 RLS 策略（临时）

在 SQL Editor 中执行以下 SQL：

```sql
-- 临时禁用 users 表的 RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 删除现有的策略
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- 创建允许所有操作的策略（仅用于初始设置）
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
```

### 3. 创建默认管理员用户

在 Table Editor 中：

1. 选择 `users` 表
2. 点击 "Insert" 按钮
3. 添加以下数据：

```json
{
  "username": "admin",
  "email": "admin@joinya.com",
  "password_hash": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "role": "admin",
  "is_active": true
}
```

**注意：** 上面的 `password_hash` 对应密码 `password`

### 4. 重新启用 RLS 策略（可选）

如果您想重新启用 RLS，执行：

```sql
-- 重新启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 删除临时策略
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- 重新创建适当的策略
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert data" ON users FOR INSERT WITH CHECK (true);
```

### 5. 测试登录

使用以下凭据测试登录：

- 用户名: `admin`
- 密码: `password`
- 邮箱: `admin@joinya.com`

## 或者使用 SQL 直接插入

您也可以在 SQL Editor 中直接执行：

```sql
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
  'admin',
  'admin@joinya.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  true
);
```

这个密码哈希对应密码 `password`。
