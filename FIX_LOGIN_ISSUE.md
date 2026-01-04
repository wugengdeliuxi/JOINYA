# 修复登录问题指南

## 问题原因

登录失败的原因有两个：

1. **RLS 策略阻止查询**：users 表的 RLS 策略只允许用户查看自己的数据（`auth.uid() = id`），但登录时还没有认证，所以无法查询用户信息。

2. **API 密钥配置**：需要确保 Supabase 的服务角色密钥正确配置。

## 解决方案

### 方案一：修复 RLS 策略（推荐）

在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL：

```sql
-- 删除现有的限制性策略
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- 创建允许登录查询的策略
CREATE POLICY "Allow login queries" ON users 
  FOR SELECT 
  USING (is_active = true);
```

或者直接执行 `backend/scripts/fix-login-rls.sql` 文件中的内容。

### 方案二：使用服务角色客户端（已修改代码）

我已经修改了 `backend/models/User.js`，现在使用服务角色客户端来查询用户，这样可以绕过 RLS。

**但是**，您需要确保在 Vercel 环境变量中配置了正确的 `SUPABASE_SERVICE_ROLE_KEY`。

## 检查环境变量

在 Vercel Dashboard 中，确保后端项目配置了以下环境变量：

1. `SUPABASE_URL` - Supabase 项目 URL
2. `SUPABASE_ANON_KEY` - Supabase 匿名密钥
3. `SUPABASE_SERVICE_ROLE_KEY` - **Supabase 服务角色密钥（重要！）**

### 如何获取服务角色密钥

1. 在 Supabase Dashboard 中，点击 "Project Settings"
2. 点击 "API"
3. 在 "Project API keys" 部分，找到 "service_role" key
4. 复制这个密钥（**注意：这是敏感信息，不要泄露**）

## 部署更新

修改代码后，需要重新部署后端：

```bash
cd backend
vercel --prod
```

或者在 Vercel Dashboard 中触发重新部署。

## 测试登录

部署完成后，使用以下凭据测试登录：

- 用户名：`admin`
- 密码：`admin123`

## 如果还是不行

1. 检查 Vercel 函数日志，查看具体错误信息
2. 确认环境变量已正确配置
3. 确认 RLS 策略已更新
4. 检查数据库中用户记录是否存在且 `is_active = true`

