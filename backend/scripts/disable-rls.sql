-- 临时禁用 RLS 策略以便创建初始用户
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 禁用 users 表的 RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 删除现有的策略
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- 创建允许所有操作的策略（仅用于初始设置）
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- 注意：在生产环境中，您应该重新启用 RLS 并设置适当的策略
